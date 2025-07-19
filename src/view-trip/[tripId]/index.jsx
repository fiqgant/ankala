import { db } from "@/service/firebaseConfig";
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { toast } from "sonner";
import InfoSection from "../components/InfoSection";
import Hotels from "../components/Hotels";
import PlacesToVisit from "../components/PlacesToVisit";
import Footer from "../components/Footer";

function Viewtrip() {
  const { tripId } = useParams();
  const [trip, setTrip] = useState({});

  useEffect(() => {
    tripId && GetTripData();
  }, [tripId]);

  const GetTripData = async () => {
    const docRef = doc(db, "AITrips", tripId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      setTrip(docSnap.data());
    } else {
      toast("No trip found");
    }
  };

  const formatHotels = (hotels) => {
    if (!Array.isArray(hotels) || hotels.length === 0)
      return "Tidak ada data hotel.";
    return hotels
      .map((hotel, index) => {
        return `${index + 1}. ${hotel.name}\n📍 ${hotel.address}\n💰 ${
          hotel.price
        }\n⭐ ${hotel.rating}`;
      })
      .join("\n\n");
  };

  const formatItinerary = (days) => {
    if (!Array.isArray(days) || days.length === 0)
      return "Tidak ada rencana perjalanan.";
    return days
      .map((day, index) => {
        const activities = Array.isArray(day.plan)
          ? day.plan
              .map((item, i) => {
                return `🕒 ${item.time}\n📍 ${item.place}\n📄 ${
                  item.details
                }\n🏷️ Tiket: ${item.ticket_pricing || "N/A"}`;
              })
              .join("\n\n")
          : "";
        return `📅 ${day.day || `Hari ${index + 1}`}\n${activities}`;
      })
      .join("\n\n---\n\n");
  };

  const waMessage = encodeURIComponent(
    `Hai, saya tertarik dengan trip berikut:\n\n` +
      `📍 Destinasi: ${
        trip?.userSelection?.location?.label || "Belum tersedia"
      }\n` +
      `📅 Durasi: ${trip?.userSelection?.noOfDays || "Belum tersedia"} hari\n` +
      `👥 Traveler: ${trip?.userSelection?.traveler || "Belum tersedia"}\n\n` +
      `🏨 Rekomendasi Hotel:\n${formatHotels(
        trip?.tripData?.hotel_options
      )}\n\n` +
      `📋 Itinerary:\n${formatItinerary(trip?.tripData?.itinerary)}\n\n` +
      `Mohon info lebih lanjut, terima kasih.`
  );

  return (
    <div className="p-10 md:px-20 lg:px-44 xl:px-56">
      <InfoSection trip={trip} />
      <Hotels trip={trip} />
      <PlacesToVisit trip={trip} />
      <Footer trip={trip} />

      <div className="text-center mt-10">
        <a
          href={`https://wa.me/628117778072?text=${waMessage}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-6 rounded-lg shadow-lg transition duration-300"
        >
          Pesan via WhatsApp
        </a>
      </div>
    </div>
  );
}

export default Viewtrip;
