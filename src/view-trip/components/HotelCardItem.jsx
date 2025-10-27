import { GetPlaceDetails, PHOTO_REF_URL } from "@/service/GlobalApi";
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const toUnsplashQuery = (nameOrSeed, fb = "hotel,room,building") => {
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

function HotelCardItem({ hotel }) {
  const [photoUrl, setPhotoUrl] = useState("");

  useEffect(() => {
    hotel && GetPlacePhoto();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hotel]);

  const GetPlacePhoto = async () => {
    const seed = hotel?.name || "hotel";
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
          src={photoUrl}
          className="rounded-xl h-[180px] w-full object-cover"
          alt={hotel?.name || "hotel"}
          onError={(e) => {
            const q = toUnsplashQuery(hotel?.name);
            e.currentTarget.src = PHOTO_REF_URL.replace("{NAME}", q);
          }}
        />
        <div className="my-2">
          <h2 className="font-medium">{hotel?.name}</h2>
          <h2 className="text-xs text-gray-500">📍{hotel?.address}</h2>
          <h2 className="text-sm">💰{hotel?.price}</h2>
          <h2 className="text-sm">⭐{hotel?.rating}</h2>
        </div>
      </div>
    </Link>
  );
}

export default HotelCardItem;
