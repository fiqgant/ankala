import { GetPhotoForQuery, buildFallbackPhoto } from "@/service/GlobalApi";
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

function UserTripCardItem({ trip }) {
  const fallbackQuery = "travel";
  const [photo, setPhoto] = useState(() =>
    buildFallbackPhoto(
      trip?.userSelection?.location?.label || fallbackQuery,
      fallbackQuery
    )
  );

  useEffect(() => {
    if (!trip) return;

    const seed = trip?.userSelection?.location?.label || fallbackQuery;
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
  }, [trip]);

  return (
    <Link to={`/view-trip/${trip?.id}`}>
      <div className="hover:scale-105 transition-all">
        <img
          src={photo?.url || "/placeholder.jpg"}
          alt={trip?.userSelection?.location?.label || "trip"}
          className="object-cover rounded-xl h-[220px]"
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
        <div>
          <h2 className="font-bold text-lg">
            {trip?.userSelection?.location?.label}
          </h2>
          <h2 className="text-sm text-gray-500">
            {trip?.userSelection?.noOfDays} Days trip with{" "}
            {trip?.userSelection?.budget} budget.
          </h2>
        </div>
      </div>
    </Link >
  )
}

export default UserTripCardItem
