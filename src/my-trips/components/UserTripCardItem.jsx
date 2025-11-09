import { GetPhotoForQuery, buildFallbackPhoto } from "@/service/GlobalApi";
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

function UserTripCardItem({ trip, onDelete, isDeleting }) {
  const fallbackQuery = "travel";
  const locationLabel = trip?.userSelection?.location?.label || "Your trip";
  const {
    noOfDays,
    budget,
    traveler,
    tripPace,
    travelStyle,
  } = trip?.userSelection || {};

  const [photo, setPhoto] = useState(() =>
    buildFallbackPhoto(locationLabel, fallbackQuery)
  );

  useEffect(() => {
    if (!trip) return;

    const seed = locationLabel || fallbackQuery;
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
  }, [trip, locationLabel]);

  return (
    <Link
      to={`/view-trip/${trip?.id}`}
      className="group relative block h-full focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#2a4634]"
    >
      <div className="flex h-full flex-col overflow-hidden rounded-[28px] border border-white/60 bg-white/80 shadow-lg transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl">
        <div className="relative h-56 overflow-hidden">
          <div className="absolute right-4 top-4 z-20 flex flex-col items-end gap-2 text-xs font-medium text-white">
            {noOfDays && (
              <span className="rounded-full bg-black/60 px-3 py-1 backdrop-blur">
                {noOfDays} {noOfDays > 1 ? "days" : "day"}
              </span>
            )}
            <button
              type="button"
              className="rounded-full bg-black/40 px-3 py-1 text-[11px] font-semibold text-white backdrop-blur transition hover:bg-black/60 focus:outline-none focus-visible:ring-2 focus-visible:ring-white disabled:cursor-not-allowed disabled:opacity-60"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onDelete?.(trip?.id);
              }}
              disabled={isDeleting}
            >
              {isDeleting ? "Menghapus..." : "Hapus"}
            </button>
          </div>
          <img
            src={photo?.url || "/placeholder.jpg"}
            alt={locationLabel}
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
            onError={(e) => {
              if (
                photo?.fallbackUrl &&
                e.currentTarget.src !== photo.fallbackUrl
              ) {
                e.currentTarget.src = photo.fallbackUrl;
              }
            }}
          />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent opacity-80 transition-opacity duration-500 group-hover:opacity-90"></div>
          <div className="absolute left-5 top-5 rounded-full bg-white/95 px-4 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-[#2a4634] shadow">
            {locationLabel}
          </div>
          {photo?.credit && (
            <p className="absolute bottom-2 left-5 text-[10px] text-white/70">
              Photo by{" "}
              <a
                href={
                  photo.credit.photographerProfileUrl ||
                  photo.credit.unsplashLink
                }
                target="_blank"
                rel="noopener noreferrer"
                className="underline"
              >
                {photo.credit.photographerName}
              </a>
              {" on "}
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
        </div>

        <div className="flex flex-1 flex-col gap-4 p-6">
          <div className="space-y-1">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-[#3e7456]">
              Curated itinerary
            </p>
            <h2 className="text-2xl font-bold text-gray-900">
              {trip?.tripData?.tripName || locationLabel}
            </h2>
            <p className="text-sm text-gray-600">
              {noOfDays ? `${noOfDays}-day escape` : "Flexible adventure"}{" "}
              {budget ? ` · ${budget} budget` : ""}
            </p>
          </div>
          <div className="flex flex-wrap gap-2 text-xs font-semibold text-[#1e3124]">
            {traveler && (
              <span className="rounded-full bg-[#e6f0ea] px-4 py-1">
                {traveler}
              </span>
            )}
            {travelStyle && (
              <span className="rounded-full bg-[#e6f0ea] px-4 py-1">
                {travelStyle}
              </span>
            )}
            {tripPace && (
              <span className="rounded-full bg-[#e6f0ea] px-4 py-1">
                {tripPace} pace
              </span>
            )}
            {budget && (
              <span className="rounded-full bg-[#f3ebe1] px-4 py-1">
                {budget}
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}

export default UserTripCardItem;
