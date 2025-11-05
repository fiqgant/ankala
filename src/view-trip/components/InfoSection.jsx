import React, { useEffect, useMemo, useState } from "react";
import { GetPhotoForQuery, buildFallbackPhoto } from "@/service/GlobalApi";
import {
  TripVibeOptions,
  TripPaceOptions,
  StayStyleOptions,
  MobilityComfortOptions,
  InterestTagOptions,
  DiningPreferenceOptions,
} from "@/constants/options";

const optionMap = (options) =>
  Array.isArray(options)
    ? options.reduce((acc, item) => {
        if (item?.value) acc[item.value] = item;
        return acc;
      }, {})
    : {};

const vibeMap = optionMap(TripVibeOptions);
const paceMap = optionMap(TripPaceOptions);
const stayMap = optionMap(StayStyleOptions);
const mobilityMap = optionMap(MobilityComfortOptions);
const interestMap = optionMap(InterestTagOptions);
const diningMap = optionMap(DiningPreferenceOptions);

const PreferenceCard = ({ icon, eyebrow, title, description }) => (
  <div className="rounded-2xl border border-gray-200 bg-white/80 p-4 shadow-sm">
    <div className="flex items-start gap-3">
      {icon && <span className="text-2xl leading-none">{icon}</span>}
      <div className="flex flex-col gap-1">
        {eyebrow && (
          <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-indigo-500">
            {eyebrow}
          </span>
        )}
        {title && (
          <p className="text-base font-semibold text-gray-900">{title}</p>
        )}
        {description && (
          <p className="text-sm text-gray-500">{description}</p>
        )}
      </div>
    </div>
  </div>
);

const PreferenceChip = ({ label }) => (
  <span className="inline-flex items-center rounded-full border border-gray-200 bg-white px-3 py-1 text-xs font-medium text-gray-600 shadow-sm">
    {label}
  </span>
);

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

  const preferences = useMemo(() => {
    const selection = trip?.userSelection || {};

    const vibe = selection?.travelStyle
      ? vibeMap[selection.travelStyle] || {
          title: selection.travelStyle,
        }
      : null;
    const pace = selection?.tripPace
      ? paceMap[selection.tripPace] || {
          title: selection.tripPace,
        }
      : null;
    const stayStyle = selection?.stayStyle
      ? stayMap[selection.stayStyle] || {
          title: selection.stayStyle,
        }
      : null;
    const mobility = selection?.mobility
      ? mobilityMap[selection.mobility] || {
          title: selection.mobility,
        }
      : null;

    const interests = Array.isArray(selection?.interests)
      ? selection.interests
          .map((value) => interestMap[value]?.label || value)
          .filter(Boolean)
      : [];

    const dining = Array.isArray(selection?.dining)
      ? selection.dining
          .map((value) => diningMap[value]?.label || value)
          .filter(Boolean)
      : [];

    const notes = selection?.mustHave?.trim() ? selection.mustHave.trim() : "";

    return {
      vibe,
      pace,
      stayStyle,
      mobility,
      interests,
      dining,
      notes,
      days: Number(selection?.noOfDays) || null,
      budget: selection?.budget || null,
      travelers: selection?.traveler || null,
    };
  }, [trip]);

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
      <div className="my-5 flex flex-col gap-3">
        <h2 className="font-bold text-2xl">{seedText}</h2>
        <div className="flex flex-wrap gap-3">
          {preferences.days && (
            <span className="inline-flex items-center gap-2 rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600">
              <span role="img" aria-hidden="true">
                📅
              </span>
              {preferences.days} day{preferences.days > 1 ? "s" : ""}
            </span>
          )}
          {preferences.budget && (
            <span className="inline-flex items-center gap-2 rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600">
              <span role="img" aria-hidden="true">
                💰
              </span>
              {preferences.budget} budget
            </span>
          )}
          {preferences.travelers && (
            <span className="inline-flex items-center gap-2 rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600">
              <span role="img" aria-hidden="true">
                👥
              </span>
              {preferences.travelers}
            </span>
          )}
        </div>
      </div>

      {(preferences.vibe ||
        preferences.pace ||
        preferences.stayStyle ||
        preferences.mobility ||
        preferences.interests.length ||
        preferences.dining.length ||
        preferences.notes) && (
        <div className="space-y-5 rounded-3xl border border-gray-200 bg-white/80 p-6 shadow-sm backdrop-blur">
          <div className="space-y-1">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-indigo-500">
              Trip preferences
            </p>
            <h3 className="text-xl font-semibold text-gray-900">
              What matters for this itinerary
            </h3>
            <p className="text-sm text-gray-500">
              These selections guide the AI when balancing activities, pacing,
              accommodations, and food suggestions.
            </p>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            {preferences.vibe && (
              <PreferenceCard
                icon={preferences.vibe.icon}
                eyebrow="Trip vibe"
                title={preferences.vibe.title}
                description={preferences.vibe.desc}
              />
            )}
            {preferences.pace && (
              <PreferenceCard
                icon={preferences.pace.icon}
                eyebrow="Pace preference"
                title={preferences.pace.title}
                description={preferences.pace.desc}
              />
            )}
            {preferences.stayStyle && (
              <PreferenceCard
                icon={preferences.stayStyle.icon}
                eyebrow="Stay style"
                title={preferences.stayStyle.title}
                description={preferences.stayStyle.desc}
              />
            )}
            {preferences.mobility && (
              <PreferenceCard
                icon={preferences.mobility.icon}
                eyebrow="Mobility notes"
                title={preferences.mobility.title}
                description={preferences.mobility.desc}
              />
            )}
          </div>

          {preferences.interests.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-semibold uppercase tracking-[0.15em] text-gray-500">
                Focus interests
              </h4>
              <div className="flex flex-wrap gap-2">
                {preferences.interests.map((label, idx) => (
                  <PreferenceChip key={`interest-${idx}-${label}`} label={label} />
                ))}
              </div>
            </div>
          )}

          {preferences.dining.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-semibold uppercase tracking-[0.15em] text-gray-500">
                Dining preferences
              </h4>
              <div className="flex flex-wrap gap-2">
                {preferences.dining.map((label, idx) => (
                  <PreferenceChip key={`dining-${idx}-${label}`} label={label} />
                ))}
              </div>
            </div>
          )}

          {preferences.notes && (
            <div className="space-y-2">
              <h4 className="text-sm font-semibold uppercase tracking-[0.15em] text-gray-500">
                Must-have notes
              </h4>
              <div className="rounded-2xl border border-indigo-100 bg-indigo-50/60 p-4 text-sm text-indigo-900 shadow-sm">
                {preferences.notes}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default InfoSection;
