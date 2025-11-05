import React, { useEffect, useState } from "react";
import { GetPhotoForQuery, buildFallbackPhoto } from "@/service/GlobalApi";

function InfoSection({ trip }) {
  const fallbackQuery = "travel landscape";
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

  const seedText = trip?.userSelection?.location?.label || "Destination";

  return (
    <div>
      <img
        src={photo?.url}
        alt="img"
        className="h-[340px] w-full object-cover rounded-xl"
        onError={(e) => {
          if (photo?.fallbackUrl && e.currentTarget.src !== photo.fallbackUrl) {
            e.currentTarget.src = photo.fallbackUrl;
          }
        }}
      />
      {photo?.credit && (
        <p className="mt-2 text-xs text-gray-500">
          Photo by{" "}
          <a
            href={photo.credit.photographerProfileUrl || photo.credit.unsplashLink}
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
      <div className="my-5 flex flex-col gap-2">
        <h2 className="font-bold text-2xl">{seedText}</h2>
        <div className="flex gap-5">
          <h2 className="p-1 px-3 bg-gray-200 rounded-full text-gray-500 text-xs md:text-md ">
            📅{trip.userSelection?.noOfDays} Day
          </h2>
          <h2 className="p-1 px-3 bg-gray-200 rounded-full text-gray-500 text-xs md:text-md">
            💰{trip.userSelection?.budget} Budget
          </h2>
          <h2 className="p-1 px-3 bg-gray-200 rounded-full text-gray-500 text-xs md:text-md">
            👥No. of traveler/s: {trip.userSelection?.traveler}
          </h2>
        </div>
      </div>
    </div>
  );
}

export default InfoSection;
