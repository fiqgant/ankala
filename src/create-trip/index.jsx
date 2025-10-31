import React, { useEffect, useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import {
  AI_PROMPT,
  SelectBudgetOptions,
  SelectTravelList,
} from "@/constants/options";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { chatSession } from "@/service/AIModel";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
} from "@/components/ui/dialog";
import { FcGoogle } from "react-icons/fc";
import { useGoogleLogin } from "@react-oauth/google";
import axios from "axios";
import { doc, setDoc } from "firebase/firestore";
import { db } from "@/service/firebaseConfig";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import { useNavigate } from "react-router-dom";
import AsyncSelect from "react-select/async";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";

/* -------------------------------------------------
   LocationSelect
   -------------------------------------------------
   Goal:
   - In PROD (ankala.id): ONLY call /api/osm/search (must be proxied by your backend/server/nginx).
     If that returns non-JSON (like your <!DOCTYPE ...> now), we just return [] silently.
     -> no direct call ke nominatim (biar ga CORS error merah).
   - In DEV (localhost etc.): call nominatim directly (no proxy).
*/
function LocationSelect({ value, onChange }) {
  // simple env check
  const isProdHost = (() => {
    try {
      return window?.location?.hostname === "ankala.id";
    } catch {
      return false;
    }
  })();

  const fetchViaProxy = async (params) => {
    const url = `/api/osm/search?${params.toString()}`;
    const resp = await fetch(url, {
      headers: {
        Accept: "application/json",
      },
    });

    // proxy kamu sekarang balikin HTML -> resp.json() bakal throw.
    // Jadi kita guard manual:
    const text = await resp.text();
    try {
      const json = JSON.parse(text);
      return json;
    } catch {
      console.warn("[OSM proxy] Not JSON yet (probably not wired).");
      return [];
    }
  };

  const fetchDirectNominatim = async (params) => {
    const resp = await fetch(
      `https://nominatim.openstreetmap.org/search?${params.toString()}`,
      {
        headers: {
          "User-Agent": "AnkalaTripPlanner/1.0 (ankala.id)",
          "Accept-Language": navigator.language || "en",
        },
      }
    );
    // kalau CORS block di prod, ini akan throw sebelum resp.ok.
    const data = await resp.json();
    return data;
  };

  const searchCore = async (query) => {
    if (!query || query.trim().length < 2) return [];

    const params = new URLSearchParams({
      q: query,
      format: "json",
      addressdetails: "1",
      limit: "8",
      extratags: "0",
    });

    // PROD path: proxy only
    if (isProdHost) {
      const data = await fetchViaProxy(params);
      return (data || []).map((item) => ({
        label: item.display_name,
        value: {
          lat: parseFloat(item.lat),
          lon: parseFloat(item.lon),
          osm_id: item.osm_id,
          osm_type: item.osm_type,
          boundingbox: item.boundingbox,
          raw: item,
        },
      }));
    }

    // DEV path: try direct first (easier local dev)
    try {
      const data = await fetchDirectNominatim(params);
      return (data || []).map((item) => ({
        label: item.display_name,
        value: {
          lat: parseFloat(item.lat),
          lon: parseFloat(item.lon),
          osm_id: item.osm_id,
          osm_type: item.osm_type,
          boundingbox: item.boundingbox,
          raw: item,
        },
      }));
    } catch (errDirect) {
      console.warn("[OSM direct fail - dev]", errDirect?.message || errDirect);
      // optional: fallback proxy in dev if you set one locally
      const data = await fetchViaProxy(params);
      return (data || []).map((item) => ({
        label: item.display_name,
        value: {
          lat: parseFloat(item.lat),
          lon: parseFloat(item.lon),
          osm_id: item.osm_id,
          osm_type: item.osm_type,
          boundingbox: item.boundingbox,
          raw: item,
        },
      }));
    }
  };

  // debounce loader for AsyncSelect
  const loadOptions = useMemo(() => {
    let timeout;
    return (inputValue, callback) => {
      clearTimeout(timeout);
      timeout = setTimeout(async () => {
        const results = await searchCore(inputValue);
        callback(results);
      }, 350);
    };
  }, []);

  return (
    <AsyncSelect
      cacheOptions
      defaultOptions={false}
      loadOptions={loadOptions}
      placeholder="Search destination"
      value={value}
      onChange={onChange}
      classNamePrefix="osm-select"
    />
  );
}

/* -------------------------------------------------
   Prompt builder
   ------------------------------------------------- */
function buildPrompt({ location, noOfDays, traveler, budget }) {
  const locLabel = location?.label || "";
  const days = Number(noOfDays) || 3;
  const pax = traveler || "solo traveler";
  const mBudget = budget || "Moderate";

  return `
You are a precise trip planner for Southeast Asia travelers.
Return ONLY valid minified JSON, no markdown, no commentary.

Input:
- Destination: ${locLabel}
- Total Days: ${days}
- Traveler Type: ${pax}
- Budget Level: ${mBudget}

Hard rules:
- Create EXACTLY 3 itinerary options with styles: ["relaxed","balanced","packed"].
- Each itinerary has "overview" and "daily".
- Each "daily" is one day.
- Each day has up to 3 "blocks". No more than 3.
- Time format "HH:MM-HH:MM".
- Each string like descriptions/explanations max ~140 chars, keep punchy, friendly, real.
- Group places in same area to reduce travel time.
- Include meal_suggestion, plan_b, rain_alternative for each block.
- Include realistic est_daily_spend_usd and short rationale per day.
- Give hotel_suggestions (3-5 hotels): name, address, lat, lon, price_per_night_usd (number), rating (0-5), why_pick (<=120 chars).
- currency is always "USD".
- Also include "tips_general": array of short practical advice strings (safety, scams, culture, opening hours).
- Also include "tips_low_impact": array of climate-aware / low-carbon / low-waste travel suggestions (<=100 chars each, friendly tone).

Schema shape:
{
  "destination": string,
  "days": number,
  "currency": "USD",
  "itineraries": [
    {
      "style": "relaxed" | "balanced" | "packed",
      "overview": string,
      "daily": [
        {
          "day": number,
          "summary": string,
          "blocks": [
            {
              "start_end": string,
              "place": {
                "name": string,
                "category": string,
                "short_desc": string,
                "lat": number,
                "lon": number,
                "est_ticket": number,
                "rating": number,
                "travel_mode": string,
                "est_travel_minutes": number
              },
              "meal_suggestion": {
                "name": string,
                "type": "breakfast" | "lunch" | "dinner" | "snack",
                "price_range": "$" | "$$" | "$$$",
                "notes": string
              },
              "plan_b": string,
              "rain_alternative": string
            }
          ],
          "est_daily_spend_usd": number,
          "rationale": string
        }
      ]
    }
  ],
  "hotel_suggestions": [
    {
      "name": string,
      "address": string,
      "lat": number,
      "lon": number,
      "price_per_night_usd": number,
      "rating": number,
      "why_pick": string
    }
  ],
  "tips_general": [string],
  "tips_low_impact": [string],
  "notes": string
}

Output:
ONE SINGLE LINE of valid JSON. Do not include \`\`\` or any extra text. Final char must be "}".
`;
}

/* -------------------------------------------------
   Safe JSON parser for AI output
   ------------------------------------------------- */
function safeJsonParseMaybe(text) {
  if (!text) throw new Error("Empty response from AI");
  let raw = String(text);

  // Strip code fences if any
  raw = raw
    .trim()
    .replace(/^```[a-zA-Z]*\n?/, "")
    .replace(/```$/, "");

  // Normalize weird quotes / nbsp / newlines
  raw = raw
    .replace(/[\u201C\u201D\u201E\u201F]/g, '"')
    .replace(/[\u2018\u2019\u201B]/g, "'")
    .replace(/\u00A0/g, " ")
    .replace(/[\r\n]+/g, " ");

  // Extract largest balanced {...}
  const extractLargestJson = (s) => {
    const start = s.indexOf("{");
    if (start === -1) return s;
    let inStr = false;
    let esc = false;
    let depth = 0;
    let end = -1;
    for (let i = start; i < s.length; i++) {
      const ch = s[i];
      if (inStr) {
        if (!esc && ch === '"') inStr = false;
        esc = ch === "\\" ? !esc : false;
      } else {
        if (ch === '"') {
          inStr = true;
        } else if (ch === "{") {
          depth++;
        } else if (ch === "}") {
          depth--;
          if (depth === 0) {
            end = i;
            break;
          }
        }
      }
    }
    return end !== -1 ? s.slice(start, end + 1) : s.slice(start);
  };
  raw = extractLargestJson(raw);

  // Remove trailing commas
  raw = raw.replace(/,\s*([}\]])/g, "$1");

  // Replace undefined with null
  raw = raw.replace(/:\s*undefined(\s*[,\}])/g, ": null$1");

  // Remove // and /* */ style comments
  raw = raw
    .replace(/\/\/[^\n\r]*[\n\r]?/g, "")
    .replace(/\/\*[\s\S]*?\*\//g, "");

  try {
    return JSON.parse(raw);
  } catch (e1) {
    const last = raw.lastIndexOf("}");
    if (last > 0) {
      const cand = raw.slice(0, last + 1).replace(/,\s*([}\]])/g, "$1");
      return JSON.parse(cand);
    }
    throw e1;
  }
}

/* -------------------------------------------------
   Main Component
   ------------------------------------------------- */
function CreateTrip() {
  const [place, setPlace] = useState(null);
  const [formData, setFormData] = useState({});
  const [openDialog, setOpenDialog] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleInputChange = (name, value) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  useEffect(() => {
    console.log("formData =>", formData);
  }, [formData]);

  const onGenerateTrip = async () => {
    const user = localStorage.getItem("user");
    if (!user) {
      setOpenDialog(true);
      return;
    }

    if (
      !formData?.location ||
      !formData?.budget ||
      !formData?.traveler ||
      !formData?.noOfDays
    ) {
      toast("Please fill all the details");
      return;
    }

    setLoading(true);

    try {
      const FINAL_PROMPT = buildPrompt({
        location: formData?.location,
        noOfDays: formData?.noOfDays,
        traveler: formData?.traveler,
        budget: formData?.budget,
      });

      const result = await chatSession.sendMessage(FINAL_PROMPT);
      const text = await result?.response?.text?.();
      console.log("AI raw:", text?.slice?.(0, 500));
      await SaveAiTrip(text);
    } catch (e) {
      console.error(e);
      toast("Failed to generate trip. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const SaveAiTrip = async (TripData) => {
    try {
      setLoading(true);

      const user = JSON.parse(localStorage.getItem("user") || "null");
      const docId = Date.now().toString();

      const parsed = safeJsonParseMaybe(TripData);

      await setDoc(doc(db, "AITrips", docId), {
        userSelection: formData,
        tripData: parsed,
        userEmail: user?.email,
        id: docId,
      });

      navigate("/view-trip/" + docId);
    } catch (err) {
      console.error(err);
      toast("Could not save trip data. Make sure AI returns valid JSON.");
    } finally {
      setLoading(false);
    }
  };

  const login = useGoogleLogin({
    onSuccess: (res) => GetUserProfile(res),
    onError: (error) => console.log(error),
  });

  const GetUserProfile = (tokenInfo) => {
    axios
      .get(
        `https://www.googleapis.com/oauth2/v1/userinfo?access_token=${tokenInfo.access_token}`,
        {
          headers: {
            Authorization: `Bearer ${tokenInfo.access_token}`,
            Accept: "application/json",
          },
        }
      )
      .then((resp) => {
        localStorage.setItem("user", JSON.stringify(resp.data));
        setOpenDialog(false);
        onGenerateTrip();
      })
      .catch((error) => {
        console.error("Error fetching user profile: ", error);
      });
  };

  return (
    <div className="sm:px-10 md:px-32 lg:px-56 px-5 mt-10">
      <h2 className="font-bold text-3xl">
        Tell us your travel preferences🏕️🌴
      </h2>
      <p className="mt-3 text-gray-500 text-xl">
        Just provide some basic information, and our trip planner will generate
        a customized itinerary based on your preferences.
      </p>

      <div className="mt-20 flex flex-col gap-10">
        {/* DESTINATION */}
        <div>
          <h2 className="text-xl my-3 font-medium">
            What is destination of choice?
          </h2>
          <LocationSelect
            value={place}
            onChange={(v) => {
              setPlace(v);
              handleInputChange("location", v);
            }}
          />
        </div>

        {/* DAYS */}
        <div>
          <h2 className="text-xl my-3 font-medium">
            How many days are you planning your trip?
          </h2>
          <Input
            placeholder="Ex.4"
            type="number"
            value={formData?.noOfDays || ""}
            onChange={(e) =>
              handleInputChange("noOfDays", Number(e.target.value))
            }
          />
        </div>

        {/* BUDGET */}
        <div>
          <h2 className="text-xl my-3 font-medium">What is Your Budget?</h2>
          <div className="grid grid-cols-3 gap-5 mt-5">
            {SelectBudgetOptions.map((item, index) => (
              <div
                key={index}
                onClick={() => handleInputChange("budget", item.title)}
                className={`p-4 border cursor-pointer rounded-lg hover:shadow-lg ${
                  formData?.budget === item.title && "shadow-lg border-black"
                }`}
              >
                <h2 className="text-4xl">{item.icon}</h2>
                <h2 className="font-bold text-lg">{item.title}</h2>
                <h2 className="text-sm text-gray-500">{item.desc}</h2>
              </div>
            ))}
          </div>
        </div>

        {/* TRAVELERS */}
        <div>
          <h2 className="text-xl my-3 font-medium">
            Who do you plan on traveling with on your next adventure?
          </h2>
          <div className="grid grid-cols-3 gap-5 mt-5">
            {SelectTravelList.map((item, index) => (
              <div
                key={index}
                onClick={() => handleInputChange("traveler", item.people)}
                className={`p-4 border cursor-pointer rounded-lg hover:shadow-lg ${
                  formData?.traveler === item.people && "shadow-lg border-black"
                }`}
              >
                <h2 className="text-4xl">{item.icon}</h2>
                <h2 className="font-bold text-lg">{item.title}</h2>
                <h2 className="text-sm text-gray-500">{item.desc}</h2>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* BUTTON */}
      <div className="my-10 justify-end flex">
        <Button disabled={loading} onClick={onGenerateTrip}>
          {loading ? (
            <AiOutlineLoading3Quarters className="h-7 w-7 animate-spin" />
          ) : (
            "Generate Trip"
          )}
        </Button>
      </div>

      {/* LOGIN DIALOG */}
      <Dialog open={openDialog}>
        <DialogContent>
          <DialogHeader>
            {/* Radix a11y requirement */}
            <VisuallyHidden asChild>
              <h2>Sign In Required</h2>
            </VisuallyHidden>

            <DialogDescription>
              <img
                src="/logo.svg"
                alt="logo"
                width="100px"
                className="items-center"
              />
              <h2 className="font-bold text-lg">
                Sign In to check out your travel plan
              </h2>
              <p>Sign in to the App with Google authentication securely</p>
              <Button
                onClick={login}
                className="w-full mt-6 flex gap-4 items-center"
              >
                <FcGoogle className="h-7 w-7" />
                Sign in With Google
              </Button>
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default CreateTrip;
