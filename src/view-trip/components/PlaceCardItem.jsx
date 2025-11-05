import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { GetPhotoForQuery, buildFallbackPhoto } from "@/service/GlobalApi";

function PlaceCardItem({ place }) {
  const fallbackQuery = "landmark travel";
  const [photo, setPhoto] = useState(() =>
    buildFallbackPhoto(place?.place || fallbackQuery, fallbackQuery)
  );

  useEffect(() => {
    if (!place) return;

    const seed = place?.place || fallbackQuery;
    setPhoto(buildFallbackPhoto(seed, fallbackQuery));

    let cancelled = false;

    (async () => {
      const img = await GetPhotoForQuery({
        textQuery: seed,
        fallback: fallbackQuery,
        orientation: "landscape",
      });
      if (!cancelled) {
        setPhoto(img);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [place]);

  return (
    <Link
      to={
        "https://www.google.com/maps/search/?api=1&query=" +
        (place?.place || "")
      }
      target="_blank"
    >
      <div className="shadow-sm border rounded-xl p-3 mt-2 flex gap-5 hover:scale-105 hover:shadow-md cursor-pointer transition-all">
        <img
          src={photo?.url}
          alt={place?.place || "place"}
          className="w-[130px] h-[130px] rounded-xl object-cover"
          onError={(e) => {
            if (photo?.fallbackUrl && e.currentTarget.src !== photo.fallbackUrl) {
              e.currentTarget.src = photo.fallbackUrl;
            }
          }}
        />
        {photo?.credit && (
          <p className="text-[11px] text-gray-500">
            Photo by{" "}
            <a
              href={
                photo.credit.photographerProfileUrl || photo.credit.unsplashLink
              }
              target="_blank"
              rel="noopener noreferrer"
              className="underline"
            >
              {photo.credit.photographerName}
            </a>{" "}
            on{" "}
            <a
              href={photo.credit.unsplashLink}
              target="_blank"
              rel="noopener noreferrer"
              className="underline"
            >
              Unsplash
            </a>
          </p>
        )}
        <div>
          <h2 className="font-bold text-lg">{place?.place}</h2>
          <p className="text-sm text-gray-500">{place?.details}</p>
          <h2 className="text-xs font-medium mt-2 mb-2">
            🏷️Ticket: {place?.ticket_pricing}
          </h2>
        </div>
      </div>
    </Link>
  );
}

export default PlaceCardItem;
