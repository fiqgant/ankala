// src/view-trip/[tripId]/index.jsx
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
import AIModelNotice from "@/components/common/AIModelNotice";

// ---------- JSON helpers ----------
const stripCodeFence = (text) =>
  String(text || "")
    .trim()
    .replace(/^```json\s*/i, "")
    .replace(/^```/, "")
    .replace(/```$/, "");

const safeJsonParse = (text) => {
  if (!text) return null;
  const s = stripCodeFence(text);
  try {
    return JSON.parse(s);
  } catch {
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

// ---------- Component ----------
function Viewtrip() {
  const { tripId } = useParams();
  const [trip, setTrip] = useState({});
  const [aiTips, setAiTips] = useState([]);
  const [carbonTips, setCarbonTips] = useState([]);

  const [tipsLoading, setTipsLoading] = useState(false);
  const [carbonLoading, setCarbonLoading] = useState(false);

  useEffect(() => {
    if (tripId) GetTripData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tripId]);

  // ---- adaptor: new schema -> legacy expected by components ----
  const adaptTripData = (data) => {
    if (!data) return data;

    // Already legacy
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

    // Choose itinerary "balanced" if exists, else first
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

    return {
      ...data,
      tripData: {
        ...(td || {}),
        hotel_options,
        itinerary,
      },
    };
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

  // ====== Safe objects for children (avoid map() crash) ======
  const tripForView = useMemo(() => {
    const td = trip?.tripData || {};
    return {
      ...trip,
      tripData: {
        ...td,
        hotel_options: Array.isArray(td?.hotel_options) ? td.hotel_options : [],
        itinerary: Array.isArray(td?.itinerary) ? td.itinerary : [],
      },
    };
  }, [trip]);


  // ====== WhatsApp helpers ======
  const formatHotels = (hotels) => {
    if (!Array.isArray(hotels) || hotels.length === 0) return "No hotel data.";
    return hotels
      .map(
        (h, i) =>
          `${i + 1}. ${h?.name || "-"}\n📍 ${h?.address || "-"}\n💰 Estimated: ${
            h?.price || "N/A"
          }\n⭐ ${h?.rating ?? "N/A"}`
      )
      .join("\n\n");
  };

  const formatItinerary = (days) => {
    if (!Array.isArray(days) || days.length === 0) return "No itinerary.";
    return days
      .map((day, idx) => {
        const act = Array.isArray(day?.plan)
          ? day.plan
              .map(
                (p) =>
                  `🕒 ${p?.time || "-"}\n📍 ${p?.place || "-"}\n📄 ${
                    p?.details || "-"
                  }\n🏷️ Estimated ticket: ${p?.ticket_pricing || "N/A"}`
              )
              .join("\n\n")
          : "";
        return `📅 ${day?.day || `Day ${idx + 1}`}\n${act}`;
      })
      .join("\n\n---\n\n");
  };

  const waMessage = encodeURIComponent(
    `Hello! Based on the recommendations I just received on the Ankala travel planner, I'd like to explore this itinerary further:\n\n` +
      `📍 Destination: ${trip?.userSelection?.location?.label || "N/A"}\n` +
      `📅 Duration: ${trip?.userSelection?.noOfDays || "N/A"} days\n` +
      `👥 Travelers: ${trip?.userSelection?.traveler || "N/A"}\n\n` +
      `🏨 Hotels:\n${formatHotels(tripForView?.tripData?.hotel_options)}\n\n` +
      `📋 Itinerary (with estimated ticket costs):\n${formatItinerary(
        tripForView?.tripData?.itinerary
      )}\n\n` +
      `Could you help me with the booking details and latest pricing?`
  );

  // ====== Heuristic fallback travel tips ======
  const fallbackTips = useMemo(() => {
    const tips = [];
    const days = tripForView?.tripData?.itinerary || [];
    const plans = days.flatMap((d) => (Array.isArray(d?.plan) ? d.plan : []));

    const withRating = plans
      .map((p) => ({ ...p, _r: Number(p?.rating || 0) }))
      .sort((a, b) => b._r - a._r);
    const top3 = withRating.slice(0, 3).filter((p) => p._r > 0);
    if (top3.length)
      tips.push({
        title: "Top must-see",
        detail: top3.map((p) => `${p.place} (⭐${p._r})`).join(", "),
      });

    const free = plans.filter((p) =>
      /(free|\$0|no ticket)/i.test(p?.ticket_pricing || "")
    );
    if (free.length)
      tips.push({
        title: "Free & fun",
        detail: `Enjoy ${free.length} free activities such as ${free
          .slice(0, 2)
          .map((x) => x.place)
          .join(", ")}.`,
      });

    tips.push({
      title: "Smart pacing",
      detail: "Cluster nearby sights per day and leave a buffer slot.",
    });

    tips.push({
      title: "Book ahead",
      detail: "Tickets for popular sites and transport can sell out.",
    });

    return tips.slice(0, 6);
  }, [tripForView]);

  // ====== Heuristic fallback carbon tips ======
  const carbonFallback = useMemo(() => {
    const tips = [];
    const days = tripForView?.tripData?.itinerary || [];
    const plans = days.flatMap((d) => d?.plan || []);
    const hasWalkable = plans.some((p) =>
      /walk|foot|stroll/i.test(p?.travel_mode || "")
    );
    const hasCar = plans.some((p) =>
      /car|taxi|grab|gojek|uber/i.test(p?.travel_mode || "")
    );
    const hasLong = plans.some((p) => Number(p?.est_travel_minutes || 0) >= 45);

    tips.push({
      title: "Group nearby sights",
      detail: "Cut hops to reduce idle emissions & traffic.",
    });
    if (hasCar) {
      tips.push({
        title: "Fewer car legs",
        detail: "Bundle stops or take one bus/minivan instead.",
      });
    }
    if (hasWalkable) {
      tips.push({
        title: "Max walking windows",
        detail: "Short city hops on foot beat taxis for CO₂.",
      });
    }
    if (hasLong) {
      tips.push({
        title: "Swap one long ride",
        detail: "Replace a 60–90 min car leg with public transport.",
      });
    }
    tips.push({
      title: "Eco lodging habits",
      detail: "Reuse towels/linen and switch off AC when out.",
    });
    tips.push({
      title: "Eat local",
      detail: "Prefer local, seasonal menus to lower food miles.",
    });

    return tips.slice(0, 5);
  }, [tripForView]);


  // ====== AI travel recommendations ======
  useEffect(() => {
    const run = async () => {
      const base = tripForView?.tripData?.itinerary || [];
      if (!base.length || tipsLoading) return;

      setTipsLoading(true);
      try {
        const ctx = {
          destination: trip?.userSelection?.location?.label || "",
          days: trip?.userSelection?.noOfDays,
          budget: trip?.userSelection?.budget,
          travelers: trip?.userSelection?.traveler,
          itinerary: base,
        };

        const prompt = `You are a travel expert. Provide up to 6 actionable travel tips in English based on the context.
Return ONLY a JSON object: {"tips":[{"title":"...","detail":"..."}]}.
Keep each detail <= 150 chars.
Context:\n${JSON.stringify(ctx)}`;

        const res = await chatSession.sendMessage(prompt);
        const raw = await res?.response?.text?.();
        const parsed = safeJsonParse(raw);

        let arr = [];
        if (Array.isArray(parsed)) {
          arr = parsed;
        } else if (parsed && Array.isArray(parsed.tips)) {
          arr = parsed.tips;
        }
        setAiTips((arr || []).slice(0, 6));
      } catch (e) {
        console.warn("AI tips failed:", e);
        setAiTips([]);
      } finally {
        setTipsLoading(false);
      }
    };
    run();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tripForView]);

  // ====== AI carbon footprint recommendations ======
  useEffect(() => {
    const runCarbon = async () => {
      const base = tripForView?.tripData?.itinerary || [];
      if (!base.length || carbonLoading) return;

      setCarbonLoading(true);
      try {
        const ctx = {
          destination: trip?.userSelection?.location?.label || "",
          days: trip?.userSelection?.noOfDays,
          itinerary: base,
          hotels: tripForView?.tripData?.hotel_options,
          budget: trip?.userSelection?.budget,
          travelers: trip?.userSelection?.traveler,
        };

        const prompt = `You are a sustainability and travel carbon expert.
Suggest up to 5 eco-friendly tips (transport, lodging, meals, activities) to reduce emissions.
Return ONLY a JSON object: {"tips":[{"title":"...","detail":"..."}]}.
Each detail <= 150 chars.
Context:\n${JSON.stringify(ctx)}`;

        const res = await chatSession.sendMessage(prompt);
        const raw = await res?.response?.text?.();
        const parsed = safeJsonParse(raw);

        let arr = [];
        if (Array.isArray(parsed)) {
          arr = parsed;
        } else if (parsed && Array.isArray(parsed.tips)) {
          arr = parsed.tips;
        }
        setCarbonTips((arr || []).slice(0, 5));
      } catch (e) {
        console.warn("AI carbon tips failed:", e);
        setCarbonTips([]);
      } finally {
        setCarbonLoading(false);
      }
    };
    runCarbon();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tripForView]);

  const tipsFinal = aiTips.length ? aiTips : fallbackTips;
  const carbonFinal = carbonTips.length ? carbonTips : carbonFallback;

  return (
    <div className="p-10 md:px-20 lg:px-44 xl:px-56">
      <AIModelNotice
        storageKey="ai-warning-view"
        active={Boolean(tripForView?.tripData?.itinerary?.length)}
      />
      <InfoSection trip={trip} />

      <Hotels trip={tripForView} />
      <PlacesToVisit trip={tripForView} />

      {/* ====== Travel Recommendations ====== */}
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

      {/* ====== Carbon Footprint Tips ====== */}
      <div className="mt-10">
        <h2 className="font-bold text-xl text-green-700">
          Carbon Footprint Tips {carbonLoading ? "(analyzing…)" : ""}
        </h2>
        <div className="grid md:grid-cols-2 gap-4 mt-4">
          {carbonFinal.map((tip, i) => (
            <div
              key={`${tip.title}-${i}`}
              className="border border-green-400 bg-green-50 rounded-xl p-4 shadow-sm hover:shadow-md transition"
            >
              <h3 className="font-semibold text-green-800">🌱 {tip.title}</h3>
              <p className="text-sm text-green-700 mt-1">{tip.detail}</p>
            </div>
          ))}
          {!carbonFinal.length && !carbonLoading && (
            <div className="text-sm text-gray-500">
              No carbon recommendations yet.
            </div>
          )}
        </div>
      </div>

      <div className="text-center mt-10">
        <a
          href={`https://wa.me/6287844234005?text=${waMessage}`}
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
