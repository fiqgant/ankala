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
   Versi no-external-fetch (tanpa Nominatim, jadi no CORS).
   UX:
   - User ketik "medan"
   - Dropdown akan muncul: "Use 'medan' as destination"
   - Kalau user pilih itu, kita simpan {label:"medan", value:{...}}
------------------------------------------------- */
function LocationSelect({ value, onChange }) {
  // generator opsi lokal
  const makeOptionFromInput = (q) => {
    const label = q.trim();
    if (!label) return [];
    return [
      {
        label,
        value: {
          lat: null,
          lon: null,
          source: "manual",
          raw: { display_name: label },
        },
      },
    ];
  };

  // loadOptions dipanggil react-select Async
  const loadOptions = useMemo(() => {
    let timeout;
    return (inputValue, callback) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        callback(makeOptionFromInput(inputValue || ""));
      }, 200);
    };
  }, []);

  return (
    <AsyncSelect
      cacheOptions
      defaultOptions={value ? [value] : []}
      loadOptions={loadOptions}
      placeholder="Type your destination city / area"
      value={value}
      onChange={onChange}
      classNamePrefix="osm-select"
      noOptionsMessage={({ inputValue }) =>
        inputValue?.length < 2
          ? "Type at least 2 characters"
          : `Use "${inputValue}"`
      }
    />
  );
}

/* -------------------------------------------------
   buildPrompt
   -------------------------------------------------
   Prompt untuk minta AI bikin itinerary yg rapi,
   3 style (relaxed/balanced/packed),
   hotel suggestions, dsb.
------------------------------------------------- */
function buildPrompt({ location, noOfDays, traveler, budget }) {
  const locLabel = location?.label || "";
  const days = Number(noOfDays) || 3;
  const pax = traveler || "solo";
  const mBudget = budget || "Moderate";

  return `
You are a precise trip planner. Output ONLY valid JSON per schema. No markdown, no comments.

Input:
- Destination: ${locLabel}
- Total Days: ${days}
- Traveler Type: ${pax}
- Budget Level: ${mBudget}

Rules (hard):
- Create EXACTLY 3 itinerary options with styles: ["relaxed","balanced","packed"].
- Cluster nearby places together per day to reduce travel time.
- Each day: MAX 3 activity blocks. Time format "HH:MM-HH:MM".
- Keep any description <= 140 chars. Be practical, not poetic.
- Include meal_suggestion, plan_b, rain_alternative in each block.
- For each place include:
  name, category, short_desc, lat, lon,
  est_ticket (USD number),
  rating (0-5),
  travel_mode, est_travel_minutes
- For each day include:
  est_daily_spend_usd (int),
  rationale (<=140 chars, explain cost/pace).
- Give 3-5 hotel suggestions with price, rating, why_pick.
- End with "notes": general safety/etiquette tips.

JSON Schema (strict):
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
  "notes": string
}

Output format:
One single-line MINIFIED JSON string only. Do NOT include markdown fences.
Final char must be '}'.
`;
}

/* -------------------------------------------------
   safeJsonParseMaybe
   -------------------------------------------------
   Ambil teks dari AI (kadang ada sampah),
   coba potong sampai ketemu JSON valid.
------------------------------------------------- */
function safeJsonParseMaybe(text) {
  if (!text) throw new Error("Empty response from AI");
  let raw = String(text);

  // remove ```json ... ``` wrapper if any
  raw = raw
    .trim()
    .replace(/^```[a-zA-Z]*\n?/, "")
    .replace(/```$/, "");

  // normalize smart quotes & nbsp
  raw = raw
    .replace(/[\u201C\u201D\u201E\u201F]/g, '"')
    .replace(/[\u2018\u2019\u201B]/g, "'")
    .replace(/\u00A0/g, " ");

  // flatten newlines to avoid broken strings
  raw = raw.replace(/[\r\n]+/g, " ");

  // try to extract the biggest balanced {...}
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

  // remove dangling commas like ,}
  raw = raw.replace(/,\s*([}\]])/g, "$1");

  // convert undefined -> null
  raw = raw.replace(/:\s*undefined(\s*[,\}])/g, ": null$1");

  // strip JS-style comments (just in case)
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
   CreateTrip component
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
    console.log(formData);
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
        {/* destination */}
        <div>
          <h2 className="text-xl my-3 font-medium">
            What is your destination of choice?
          </h2>
          <LocationSelect
            value={place}
            onChange={(v) => {
              setPlace(v);
              handleInputChange("location", v);
            }}
          />
          <p className="text-xs text-gray-400 mt-2">
            Type at least 2 letters. We won't call external map APIs.
          </p>
        </div>

        {/* days */}
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

        {/* budget */}
        <div>
          <h2 className="text-xl my-3 font-medium">What is your budget?</h2>
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

        {/* traveler */}
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

      {/* CTA */}
      <div className="my-10 justify-end flex">
        <Button disabled={loading} onClick={onGenerateTrip}>
          {loading ? (
            <AiOutlineLoading3Quarters className="h-7 w-7 animate-spin" />
          ) : (
            "Generate Trip"
          )}
        </Button>
      </div>

      {/* Login Dialog */}
      <Dialog open={openDialog}>
        <DialogContent>
          <DialogHeader>
            {/* Radix A11y wants a DialogTitle.
               Kita kasih VisuallyHidden biar gak muncul di UI tapi gak warning. */}
            <VisuallyHidden>
              <h2>Sign in required</h2>
            </VisuallyHidden>

            <DialogDescription>
              <img
                src="/logo.svg"
                alt="logo"
                width="100px"
                className="items-center"
              />
              <h2 className="font-bold text-lg">
                Sign in to check out your travel plan
              </h2>
              <p>Sign in to the app with Google authentication securely</p>
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
