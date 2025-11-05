import { GetPhotoForQuery, buildFallbackPhoto } from "@/service/GlobalApi";
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

function HotelCardItem({ hotel }) {
  const fallbackQuery = "hotel room building";
  const [photo, setPhoto] = useState(() =>
    buildFallbackPhoto(hotel?.name || fallbackQuery, fallbackQuery)
  );

  useEffect(() => {
    if (!hotel) return;

    const seed = hotel?.name || fallbackQuery;
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
  }, [hotel]);

  return (
    <Link
      to={
        "https://www.google.com/maps/search/?api=1&query=" +
        (hotel?.name ? hotel.name + "," + (hotel?.address || "") : "")
      }
      target="_blank"
    >
      <div className="hover:scale-110 transition-all cursor-pointer mt-5 mb-8">
        <img
          src={photo?.url}
          className="rounded-xl h-[180px] w-full object-cover"
          alt={hotel?.name || "hotel"}
          onError={(e) => {
            if (photo?.fallbackUrl && e.currentTarget.src !== photo.fallbackUrl) {
              e.currentTarget.src = photo.fallbackUrl;
            }
          }}
        />
        {photo?.credit && (
          <p className="mt-1 text-[11px] text-gray-500">
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
        <div className="my-2">
          <h2 className="font-medium">{hotel?.name}</h2>
          <h2 className="text-xs text-gray-500">📍{hotel?.address}</h2>
          <h2 className="text-sm text-gray-700">
            💰 Estimated rate: {hotel?.price || "Ask for current pricing"}
          </h2>
          <h2 className="text-sm">⭐{hotel?.rating}</h2>
        </div>
      </div>
    </Link>
  );
}

export default HotelCardItem;
