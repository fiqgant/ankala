import React from "react";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import "./loadingOverlay.css";

function LoadingOverlay({ visible }) {
  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="w-[min(90vw,420px)] rounded-3xl bg-white p-8 shadow-2xl">
        <div className="flex flex-col items-center gap-4 text-center">
          <span className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-indigo-50 text-indigo-600">
            <AiOutlineLoading3Quarters className="h-7 w-7 animate-spin" />
          </span>
          <div className="space-y-2">
            <p className="text-lg font-semibold text-gray-900">
              Generating your itinerary
            </p>
            <p className="text-sm text-gray-500">
              We&rsquo;re tailoring activities, hotels, and tips based on your
              preferences. This usually takes a few seconds.
            </p>
          </div>
          <div className="flex w-full flex-col gap-2">
            <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200">
              <div className="animate-progress h-full w-1/3 rounded-full bg-indigo-500" />
            </div>
            <p className="text-[11px] uppercase tracking-[0.3em] text-indigo-500">
              hang tight
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoadingOverlay;
