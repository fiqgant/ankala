import { db } from "@/service/firebaseConfig";
import React, { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { toast } from "sonner";
import InfoSection from "../components/InfoSection";
import Hotels from "../components/Hotels";
import PlacesToVisit from "../components/PlacesToVisit";
import Footer from "../components/Footer";
import { chatSession } from "@/service/AIModel";

// ---- tiny helpers ----
const safeJsonParse = (text) => {
  if (!text) return null;
  const s = String(text)
    .trim()
    .replace(/^```json\s*/i, "")
    .replace(/^```/, "")
    .replace(/```$/, "");
  try {
    return JSON.parse(s);
  } catch {
    // try cut to outermost object/array
    const start = s.indexOf("[") !== -1 ? s.indexOf("[") : s.indexOf("{");
    const end = Math.max(s.lastIndexOf("]"), s.lastIndexOf("}"));
    if (start !== -1 && end > start) {
      const cut = s.slice(start, end + 1).replace(/,\s*([}\]])/g, "$1");
      try {
        return JSON.parse(cut);
      } catch {}
    }
  }
  return null;
};

function Viewtrip() {
  const { tripId } = useParams();
  const [trip, setTrip] = useState({});
  const [aiTips, setAiTips] = useState([]);
  const [tipsLoading, setTipsLoading] = useState(false);

  useEffect(() => {
    tripId && GetTripData();
  }, [tripId]);

  // ---- adaptor: new schema -> legacy schema expected by components ----
  const adaptTripData = (data) => {
    if (!data) return data;

    // If already legacy
    if (data.tripData?.hotel_options || data.tripData?.itinerary) return data;

    const td = data.tripData;
    if (!td) return data;

    const isNew =
      Array.isArray(td?.itineraries) || Array.isArray(td?.hotel_suggestions);
    if (!isNew) return data;

    // Map hotel_suggestions -> hotel_options
    const hotel_options = (td.hotel_suggestions || []).map((h) => ({
      name: h?.name || "",
      address: h?.address || "",
      price: h?.price_per_night_usd ? `$${h.price_per_night_usd}/night` : "N/A",
      rating: h?.rating ?? 0,
      image_url: h?.image_url || "",
      geo_coordinates:
        typeof h?.lat === "number" && typeof h?.lon === "number"
          ? `${h.lat},${h.lon}`
          : "",
      description: h?.why_pick || "",
    }));

    // Choose itinerary "balanced" if exists, else the first
    let chosen =
      td.itineraries?.find((it) => it?.style === "balanced") ||
      td.itineraries?.[0];

    const itinerary = [];
    if (chosen?.daily?.length) {
      chosen.daily.forEach((d) => {
        const plan = (d?.blocks || []).map((b) => ({
          time: b?.start_end || "",
          place: b?.place?.name || "",
          details: b?.place?.short_desc || "",
          ticket_pricing:
            typeof b?.place?.est_ticket === "number"
              ? `$${b.place.est_ticket}`
              : "N/A",
          lat: b?.place?.lat,
          lon: b?.place?.lon,
          rating: b?.place?.rating,
          travel_mode: b?.place?.travel_mode,
          est_travel_minutes: b?.place?.est_travel_minutes,
          plan_b: b?.plan_b,
          rain_alternative: b?.rain_alternative,
        }));
        itinerary.push({
          day: d?.day ? `Day ${d.day}` : "",
          plan,
        });
      });
    }

    const legacy = {
      ...data,
      tripData: {
        ...(td || {}),
        hotel_options,
        itinerary,
      },
    };
    return legacy;
  };

  const GetTripData = async () => {
    const docRef = doc(db, "AITrips", tripId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const raw = docSnap.data();
      const adapted = adaptTripData(raw);
      setTrip(adapted || raw);
    } else {
      toast("No trip found");
    }
  };

  // ====== WhatsApp helpers (unchanged) ======
  const formatHotels = (hotels) => {
    if (!Array.isArray(hotels) || hotels.length === 0) return "No hotel data.";
    return hotels
      .map((hotel, index) => {
        return `${index + 1}. ${hotel?.name || "-"}\n📍 ${
          hotel?.address || "-"
        }\n💰 ${hotel?.price || "N/A"}\n⭐ ${hotel?.rating ?? "N/A"}`;
      })
      .join("\n\n");
  };

  const formatItinerary = (days) => {
    if (!Array.isArray(days) || days.length === 0) return "No itinerary.";
    return days
      .map((day, index) => {
        const activities = Array.isArray(day?.plan)
          ? day.plan
              .map((item) => {
                return `🕒 ${item?.time || "-"}\n📍 ${item?.place || "-"}\n📄 ${
                  item?.details || "-"
                }\n🏷️ Ticket: ${item?.ticket_pricing || "N/A"}`;
              })
              .join("\n\n")
          : "";
        return `📅 ${day?.day || `Day ${index + 1}`}\n${activities}`;
      })
      .join("\n\n---\n\n");
  };

  const waMessage = encodeURIComponent(
    `Hi, I'm interested in this trip:\n\n` +
      `📍 Destination: ${trip?.userSelection?.location?.label || "N/A"}\n` +
      `📅 Duration: ${trip?.userSelection?.noOfDays || "N/A"} days\n` +
      `👥 Travelers: ${trip?.userSelection?.traveler || "N/A"}\n\n` +
      `🏨 Hotels:\n${formatHotels(trip?.tripData?.hotel_options)}\n\n` +
      `📋 Itinerary:\n${formatItinerary(trip?.tripData?.itinerary)}\n\n` +
      `Please share more info. Thanks!`
  );

  // ====== Heuristic fallback tips (English) ======
  const fallbackTips = useMemo(() => {
    const tips = [];
    const days = trip?.tripData?.itinerary || [];
    const budget = String(trip?.userSelection?.budget || "").toLowerCase();
    const traveler = String(trip?.userSelection?.traveler || "");
    const totalDays = Number(trip?.userSelection?.noOfDays || days.length || 0);

    const plans = days.flatMap((d) => (Array.isArray(d?.plan) ? d.plan : []));
    const paid = plans.filter((p) => {
      const price = (p?.ticket_pricing || "").replace("$", "");
      return !isNaN(Number(price)) && Number(price) > 0;
    });
    const free = plans.filter((p) => {
      const price = (p?.ticket_pricing || "").replace("$", "");
      return p?.ticket_pricing === "Free" || Number(price) === 0;
    });

    const withRating = plans
      .map((p) => ({ ...p, _r: Number(p?.rating || 0) }))
      .sort((a, b) => b._r - a._r);

    const early = plans.find((p) => /^0?\d|^1?\d:/.test(String(p?.time || "")));
    const late = plans
      .slice()
      .reverse()
      .find((p) => /19:|20:|21:/.test(String(p?.time || "")));
    if (early)
      tips.push({
        title: "Start early",
        detail: `Beat queues and heat by starting at ${early.place} (${early.time}).`,
      });
    if (late)
      tips.push({
        title: "Golden hour / night vibe",
        detail: `Consider ${late.place} in the evening (${late.time}) for cooler temps and ambiance.`,
      });

    if (budget.includes("cheap") || budget.includes("low")) {
      tips.push({
        title: "Budget-first picks",
        detail: `There are ${free.length} free activities—do those first, then choose a few paid highlights (~${paid.length}).`,
      });
    }

    const top3 = withRating.slice(0, 3).filter((p) => p._r > 0);
    if (top3.length) {
      tips.push({
        title: "Top must-see",
        detail: top3.map((p) => `${p.place} (⭐${p._r})`).join(", "),
      });
    }

    const rainAlt = plans.filter((p) => p?.rain_alternative);
    if (rainAlt.length) {
      tips.push({
        title: "Rain plan",
        detail: rainAlt
          .slice(0, 3)
          .map((p) => `${p.place} → ${p.rain_alternative}`)
          .join(" | "),
      });
    }

    if (totalDays >= 2)
      tips.push({
        title: "Keep a comfortable pace",
        detail:
          "Group nearby sights per day and leave one relaxed slot for meals/rest.",
      });
    if (/(people|family|kids|anak)/i.test(traveler))
      tips.push({
        title: "Group travel tip",
        detail:
          "Prefer walkable areas with restrooms; pre-book transport to stay coordinated.",
      });

    if (!tips.length)
      tips.push({
        title: "General tip",
        detail:
          "Start early, carry water/hat/umbrella, and check opening hours beforehand.",
      });

    return tips.slice(0, 6);
  }, [trip]);

  // ====== AI tips (Gemini) ======
  useEffect(() => {
    const run = async () => {
      if (!trip?.tripData?.itinerary || tipsLoading) return;
      setTipsLoading(true);
      try {
        const ctx = {
          destination: trip?.userSelection?.location?.label || "",
          days: Number(trip?.userSelection?.noOfDays || 0),
          budget: trip?.userSelection?.budget || "",
          travelers: trip?.userSelection?.traveler || "",
          itinerary: (trip?.tripData?.itinerary || []).map((d) => ({
            day: d?.day,
            plan: (d?.plan || []).map((p) => ({
              time: p?.time,
              place: p?.place,
              details: p?.details,
              ticket: p?.ticket_pricing,
              rating: p?.rating || null,
              rain_alternative: p?.rain_alternative || null,
            })),
          })),
        };

        const prompt =
          `You are a travel expert.\n` +
          `Given the following trip context, produce up to 6 **actionable travel recommendations** in **English**, tailored to the destination, pace, budget, and travelers.\n` +
          `Keep each detail concise (max 140 chars), practical, and specific.\n` +
          `Return **ONLY JSON**, no markdown, as an array of objects: [{"title": "...", "detail": "..."}].\n\n` +
          `Context:\n${JSON.stringify(ctx)}`;

        const res = await chatSession.sendMessage(prompt);
        const raw = await res?.response?.text?.();
        const parsed = safeJsonParse(raw);
        if (Array.isArray(parsed) && parsed.length) {
          setAiTips(
            parsed.slice(0, 6).map((x) => ({
              title:
                String(x?.title || "")
                  .trim()
                  .slice(0, 80) || "Tip",
              detail:
                String(x?.detail || "")
                  .trim()
                  .slice(0, 180) || "",
            }))
          );
        } else {
          setAiTips([]);
        }
      } catch (e) {
        console.warn("AI tips failed, using fallback:", e?.message || e);
        setAiTips([]);
      } finally {
        setTipsLoading(false);
      }
    };
    run();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trip]);

  const tipsFinal = (aiTips?.length ? aiTips : fallbackTips).slice(0, 6);

  return (
    <div className="p-10 md:px-20 lg:px-44 xl:px-56">
      <InfoSection trip={trip} />
      <Hotels trip={trip} />
      <PlacesToVisit trip={trip} />

      {/* ====== Travel Recommendations (AI) ====== */}
      <div className="mt-10">
        <h2 className="font-bold text-xl">
          Travel Recommendations {tipsLoading ? "(generating…)" : ""}
        </h2>
        <div className="grid md:grid-cols-2 gap-4 mt-4">
          {tipsFinal.map((tip, i) => (
            <div
              key={`${tip.title}-${i}`}
              className="border rounded-xl p-4 shadow-sm hover:shadow-md transition"
            >
              <h3 className="font-semibold">✅ {tip.title}</h3>
              <p className="text-sm text-gray-600 mt-1">{tip.detail}</p>
            </div>
          ))}
          {!tipsFinal.length && !tipsLoading && (
            <div className="text-sm text-gray-500">No tips available.</div>
          )}
        </div>
      </div>

      <div className="text-center mt-10">
        <a
          href={`https://wa.me/628117778072?text=${waMessage}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-6 rounded-lg shadow-lg transition duration-300"
        >
          Order via WhatsApp
        </a>
      </div>

      <Footer trip={trip} />
    </div>
  );
}

export default Viewtrip;
