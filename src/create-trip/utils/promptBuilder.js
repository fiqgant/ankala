/* -------------------------------------------------
   Prompt builder (itinerary + tips + low impact)
   ------------------------------------------------- */
export function buildPrompt({
  location,
  noOfDays,
  traveler,
  budget,
  travelStyle,
  tripPace,
  interests,
  stayStyle,
  dining,
  mobility,
  mustHave,
}) {
  const locLabel = location?.label || "";
  const days = Number(noOfDays) || 3;
  const pax = traveler || "solo traveler";
  const mBudget = budget || "Moderate";
  const vibe = travelStyle || "Use your best judgement for the tone.";
  const pacePref = tripPace || "Match the energy to the destination";
  const interestList = Array.isArray(interests) && interests.length
    ? interests.join(", ")
    : "Blend a variety of highlights.";
  const stayPref = stayStyle || "Blend of comfort and location convenience.";
  const diningPref = Array.isArray(dining) && dining.length
    ? dining.join(", ")
    : "Mix of beloved local eats and smart crowd-free options.";
  const mobilityPref =
    mobility ||
    "Assume typical SEA city mobility with short walks and public transit where sensible.";
  const mustHaveNotes = mustHave
    ? mustHave.trim()
    : "No specific requests beyond great storytelling.";

  return `
You are a precise trip planner for Southeast Asia travelers.
Return ONLY valid minified JSON, no markdown, no commentary.

Input:
- Destination: ${locLabel}
- Total Days: ${days}
- Traveler Type: ${pax}
- Budget Level: ${mBudget}
- Trip Vibe: ${vibe}
- Pace Preference: ${pacePref}
- Focus Interests: ${interestList}
- Stay Style: ${stayPref}
- Dining Preferences: ${diningPref}
- Mobility Notes: ${mobilityPref}
- Must-have Notes: ${mustHaveNotes}

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
- Give hotel_suggestions (3-5 hotels): name, address, lat, lon,
  price_per_night_usd (number), rating (0-5), why_pick (<=120 chars).
- currency is always "USD".
- Also include "tips_general": array of short practical advice strings
  (safety, scams, culture, opening hours).
- Also include "tips_low_impact": array of climate-aware / low-carbon /
  low-waste travel suggestions (<=100 chars each, friendly tone).

Preference guide:
- Align the tone of daily plans with the Trip Vibe and Pace Preference.
- Reflect Focus Interests every day; weave them organically into blocks.
- Prioritise Must-have Notes early in the schedule when possible.
- Keep hotel_suggestions consistent with Stay Style and Budget Level.
- Tailor meal_suggestion to Dining Preferences (mention if a spot is a perfect match).
- Respect Mobility Notes in travel_mode and plan_b.

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
