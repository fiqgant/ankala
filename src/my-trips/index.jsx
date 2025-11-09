import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "@/service/firebaseConfig";
import UserTripCardItem from "./components/UserTripCardItem";

function MyTrips() {
  const navigate = useNavigate();
  const [userTrips, setUserTrips] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    GetUserTrips();
  }, []);

  const GetUserTrips = async () => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user) {
      setIsLoading(false);
      navigate("/");
      return;
    }

    try {
      setIsLoading(true);
      const q = query(
        collection(db, "AITrips"),
        where("userEmail", "==", user?.email)
      );
      const querySnapshot = await getDocs(q);
      const trips = [];
      querySnapshot.forEach((doc) => {
        trips.push(doc.data());
      });
      setUserTrips(trips);
    } catch (error) {
      console.error("Failed to fetch trips", error);
    } finally {
      setIsLoading(false);
    }
  };

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, idx) => (
            <SkeletonCard key={idx} />
          ))}
        </div>
      );
    }

    if (!userTrips?.length) {
      return (
        <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-[#2a4634]/20 bg-gradient-to-b from-white/70 to-white/40 px-6 py-16 text-center shadow-inner backdrop-blur-sm">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-[#2a4634]">
            You're all set
          </p>
          <h3 className="mt-4 text-2xl font-bold text-gray-900">
            No trips saved—yet!
          </h3>
          <p className="mt-3 max-w-lg text-base text-gray-600">
            Plan your next escape and it will appear here for quick access,
            sharing, and edits anytime.
          </p>
          <Link
            to="/create-trip"
            className="mt-8 inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#2a4634] via-[#3e7456] to-[#2a4634] px-8 py-3 text-base font-semibold text-white shadow-lg transition hover:scale-105 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#2a4634]"
          >
            Start a new trip
            <span aria-hidden="true">→</span>
          </Link>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
        {userTrips.map((trip) => (
          <UserTripCardItem trip={trip} key={trip?.id} />
        ))}
      </div>
    );
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-b from-[#f2f7f3] via-white to-[#f9faf7] px-5 py-14 sm:px-10 md:px-16">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-1/2 top-10 h-64 w-64 -translate-x-1/2 rounded-full bg-[#2a4634]/10 blur-3xl"></div>
        <div className="absolute bottom-10 right-10 h-48 w-48 rounded-full bg-[#3e7456]/10 blur-3xl"></div>
      </div>

      <div className="mx-auto max-w-6xl space-y-10">
        <div className="flex flex-col gap-6 rounded-3xl bg-white/80 p-8 shadow-lg backdrop-blur-sm sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#2a4634]">
              My adventures
            </p>
            <h2 className="text-3xl font-extrabold text-gray-900 md:text-4xl">
              Trips you&rsquo;ve created
            </h2>
            <p className="text-base text-gray-600 md:max-w-xl">
              Revisit your AI-crafted itineraries, share them with friends, or
              jump back in to keep planning. Everything stays synced to your
              account.
            </p>
          </div>

          <Link
            to="/create-trip"
            className="inline-flex items-center justify-center gap-2 rounded-full border border-[#2a4634]/20 bg-white px-6 py-3 text-sm font-semibold text-[#1e3124] shadow-md transition hover:-translate-y-1 hover:border-[#2a4634] hover:text-[#2a4634] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2a4634]"
          >
            Create another trip
            <span aria-hidden="true">+</span>
          </Link>
        </div>

        <div className="relative overflow-hidden rounded-[32px] border border-white/40 bg-white/80 px-6 py-10 shadow-xl backdrop-blur">
          <div className="pointer-events-none absolute inset-0 -z-10 opacity-40">
            <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-r from-[#2a4634]/10 via-transparent to-[#3e7456]/10 blur-2xl"></div>
          </div>
          {renderContent()}
        </div>
      </div>
    </div>
  );
}

const SkeletonCard = () => (
  <div className="h-full rounded-3xl border border-white/60 bg-white/70 p-5 shadow-inner backdrop-blur animate-pulse">
    <div className="h-40 rounded-2xl bg-gray-200/70"></div>
    <div className="mt-4 h-4 w-3/4 rounded-full bg-gray-200/70"></div>
    <div className="mt-3 h-3 w-1/2 rounded-full bg-gray-200/60"></div>
    <div className="mt-6 flex gap-3">
      <div className="h-8 w-20 rounded-full bg-gray-200/60"></div>
      <div className="h-8 w-16 rounded-full bg-gray-200/60"></div>
    </div>
  </div>
);

export default MyTrips;
