// src/view-trip/components/PlacesToVisit.jsx
import React from "react";
import PlaceCardItem from "./PlaceCardItem";

function PlacesToVisit({ trip }) {
  // Ambil skema lama kalau ada
  const legacyDays = Array.isArray(trip?.tripData?.itinerary)
    ? trip.tripData.itinerary
    : null;

  // Atau adapt skema baru: pilih "balanced" kalau ada, jika tidak ambil index 0
  let adaptedDays = null;
  if (!legacyDays && Array.isArray(trip?.tripData?.itineraries)) {
    const chosen =
      trip.tripData.itineraries.find((it) => it?.style === "balanced") ||
      trip.tripData.itineraries[0];

    if (chosen?.daily?.length) {
      adaptedDays = chosen.daily.map((d) => ({
        day: d?.day ? `Day ${d.day}` : "",
        plan: (d?.blocks || []).map((b) => ({
          time: b?.start_end || "",
          place: b?.place?.name || "",
          details: b?.place?.short_desc || "",
          ticket_pricing:
            typeof b?.place?.est_ticket === "number"
              ? `$${b.place.est_ticket}`
              : "N/A",
          // info ekstra (opsional)
          lat: b?.place?.lat,
          lon: b?.place?.lon,
          rating: b?.place?.rating,
          travel_mode: b?.place?.travel_mode,
          est_travel_minutes: b?.place?.est_travel_minutes,
          plan_b: b?.plan_b,
          rain_alternative: b?.rain_alternative,
        })),
      }));
    }
  }

  const days = legacyDays || adaptedDays || [];

  return (
    <div>
      <h2 className="font-bold text-xl">Places to Visit</h2>
      <div>
        {days.length === 0 ? (
          <p className="text-sm text-gray-500 mt-3">
            Tidak ada data itinerary.
          </p>
        ) : (
          days.map((item, index) => (
            <div className="mt-5" key={`day-${index}`}>
              <h2 className="font-bold text-lg">
                {item?.day || `Day ${index + 1}`}
              </h2>
              <div className="grid md:grid-cols-2 gap-5">
                {(item?.plan || []).map((place, idx) => (
                  <div className="my-2" key={`place-${index}-${idx}`}>
                    <h2 className="font-medium text-sm text-orange-600">
                      {place?.time || ""}
                    </h2>
                    <PlaceCardItem place={place} />
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default PlacesToVisit;
