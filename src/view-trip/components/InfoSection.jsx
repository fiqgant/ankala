import React, { useEffect, useState } from "react";
import { GetPlaceDetails, PHOTO_REF_URL } from "@/service/GlobalApi";

const toUnsplashQuery = (nameOrSeed, fb = "travel,landscape") => {
  if (!nameOrSeed) return fb;
  let s = String(nameOrSeed);
  try {
    s = decodeURIComponent(s);
  } catch {}
  s = s
    .replace(/[^\w\s,-@.&()'/]/g, " ")
    .trim()
    .replace(/\s+/g, ",");
  return s || fb;
};

function InfoSection({ trip }) {
  const [photoUrl, setPhotoUrl] = useState("");

  useEffect(() => {
    trip && GetPlacePhoto();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trip]);

  const GetPlacePhoto = async () => {
    const seed = trip?.userSelection?.location?.label || "Indonesia travel";
    try {
      const resp = await GetPlaceDetails({ textQuery: seed });
      const name = resp?.data?.places?.[0]?.photos?.[3]?.name;
      const q = toUnsplashQuery(name || seed);
      setPhotoUrl(PHOTO_REF_URL.replace("{NAME}", q));
    } catch {
      const q = toUnsplashQuery(seed);
      setPhotoUrl(PHOTO_REF_URL.replace("{NAME}", q));
    }
  };

  const seedText = trip?.userSelection?.location?.label || "Destination";

  return (
    <div>
      <img
        src={photoUrl}
        alt="img"
        className="h-[340px] w-full object-cover rounded-xl"
        onError={(e) => {
          // fallback keras kalau URL pertama gagal
          const q = toUnsplashQuery(seedText);
          e.currentTarget.src = PHOTO_REF_URL.replace("{NAME}", q);
        }}
      />
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
