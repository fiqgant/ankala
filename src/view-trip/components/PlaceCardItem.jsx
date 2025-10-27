import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { GetPlaceDetails, PHOTO_REF_URL } from "@/service/GlobalApi";

const toUnsplashQuery = (nameOrSeed, fb = "landmark,travel") => {
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

function PlaceCardItem({ place }) {
  const [photoUrl, setPhotoUrl] = useState("");

  useEffect(() => {
    place && GetPlacePhoto();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [place]);

  const GetPlacePhoto = async () => {
    const seed = place?.place || "place";
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
        (place?.place || "")
      }
      target="_blank"
    >
      <div className="shadow-sm border rounded-xl p-3 mt-2 flex gap-5 hover:scale-105 hover:shadow-md cursor-pointer transition-all">
        <img
          src={photoUrl}
          alt={place?.place || "place"}
          className="w-[130px] h-[130px] rounded-xl object-cover"
          onError={(e) => {
            const q = toUnsplashQuery(place?.place);
            e.currentTarget.src = PHOTO_REF_URL.replace("{NAME}", q);
          }}
        />
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
