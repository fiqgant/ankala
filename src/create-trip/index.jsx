import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import {
  SelectBudgetOptions,
  SelectTravelList,
  TripVibeOptions,
  TripPaceOptions,
  InterestTagOptions,
  StayStyleOptions,
  DiningPreferenceOptions,
  MobilityComfortOptions,
} from "@/constants/options";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { chatSession } from "@/service/AIModel";
import { doc, setDoc } from "firebase/firestore";
import { db } from "@/service/firebaseConfig";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import LoadingOverlay from "./components/LoadingOverlay";
import { useNavigate } from "react-router-dom";
import LocationSelect from "./components/LocationSelect";
import LoginDialog from "./components/LoginDialog";
import { buildPrompt } from "./utils/promptBuilder";
import { safeJsonParseMaybe } from "./utils/jsonParser";
import { useGoogleAuth } from "./hooks/useGoogleAuth";
import AIModelNotice from "@/components/common/AIModelNotice";

/* -------------------------------------------------
   Main Component
   ------------------------------------------------- */
function CreateTrip() {
  const [place, setPlace] = useState(null);
  const [formData, setFormData] = useState({
    interests: [],
    dining: [],
  });
  const [openDialog, setOpenDialog] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleInputChange = (name, value) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const toggleMultiSelect = (name, value) => {
    setFormData((prev) => {
      const current = Array.isArray(prev?.[name]) ? prev[name] : [];
      const exists = current.includes(value);
      const next = exists
        ? current.filter((item) => item !== value)
        : [...current, value];
      return {
        ...prev,
        [name]: next,
      };
    });
  };

  const isMultiSelected = (name, value) =>
    Array.isArray(formData?.[name]) && formData[name].includes(value);

  const onGenerateTrip = async () => {
    const user = localStorage.getItem("user");
    if (!user) {
      setOpenDialog(true);
      return;
    }

    if (
      !formData?.location ||
      !formData?.budget ||
      !formData?.traveler ||
      !formData?.noOfDays
    ) {
      toast("Please fill all the details");
      return;
    }

    setLoading(true);

    try {
      const FINAL_PROMPT = buildPrompt({
        location: formData?.location,
        noOfDays: formData?.noOfDays,
        traveler: formData?.traveler,
        budget: formData?.budget,
        travelStyle: formData?.travelStyle,
        tripPace: formData?.tripPace,
        interests: formData?.interests,
        stayStyle: formData?.stayStyle,
        dining: formData?.dining,
        mobility: formData?.mobility,
        mustHave: formData?.mustHave,
      });

      const result = await chatSession.sendMessage(FINAL_PROMPT);
      const text = await result?.response?.text?.();
      console.log("AI raw:", text?.slice?.(0, 500));

      await SaveAiTrip(text);
    } catch (e) {
      console.error(e);
      toast("Failed to generate trip. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const SaveAiTrip = async (TripData) => {
    try {
      setLoading(true);

      const user = JSON.parse(localStorage.getItem("user") || "null");
      const docId = Date.now().toString();

      const parsed = safeJsonParseMaybe(TripData);

      await setDoc(doc(db, "AITrips", docId), {
        userSelection: formData,
        tripData: parsed,
        userEmail: user?.email,
        id: docId,
      });

      navigate("/view-trip/" + docId);
    } catch (err) {
      console.error(err);
      toast("Could not save trip data. Make sure AI returns valid JSON.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLoginSuccess = () => {
    setOpenDialog(false);
    onGenerateTrip();
  };

  const login = useGoogleAuth(handleGoogleLoginSuccess);

  const cardBaseClass =
    "relative flex h-full flex-col gap-2 rounded-2xl border border-gray-200 bg-white/80 p-4 text-left transition hover:-translate-y-0.5 hover:shadow-md cursor-pointer";
  const cardSelectedClass =
    "border-indigo-500 bg-indigo-50 shadow-lg ring-2 ring-indigo-100";
  const pillBaseClass =
    "inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white/70 px-4 py-2 text-sm font-medium shadow-sm transition hover:-translate-y-0.5 hover:shadow-md";
  const pillSelectedClass =
    "border-indigo-500 bg-indigo-50 text-indigo-700 ring-2 ring-indigo-100";

  return (
    <div className="relative sm:px-10 md:px-24 lg:px-40 px-5 mt-10">
      <LoadingOverlay visible={loading} />
      <AIModelNotice storageKey="ai-warning-create" active />
      <div className="mx-auto max-w-5xl">
        <h2 className="font-bold text-3xl sm:text-4xl">
          Tell us your travel preferences 🏕️🌴
        </h2>
        <p className="mt-3 text-gray-500 text-lg sm:text-xl">
          Share a little about the trip you have in mind and we&rsquo;ll craft a
          tailored itinerary that matches your vibe, pace, and must-haves.
        </p>

        <div className="mt-12 space-y-10">
          <section className="rounded-3xl border border-gray-200 bg-white/80 p-8 shadow-sm backdrop-blur">
            <div className="flex flex-col gap-6">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-indigo-500">
                  Trip basics
                </p>
                <h3 className="mt-2 text-2xl font-semibold text-gray-900">
                  Start with where and how long
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  Pick a destination and let us know the rough duration so we
                  can plan the right amount of experiences.
                </p>
              </div>

              <div className="space-y-6">
                <div className="space-y-3">
                  <h4 className="text-sm font-semibold uppercase text-gray-500">
                    Destination
                  </h4>
                  <LocationSelect
                    value={place}
                    onChange={(v) => {
                      setPlace(v);
                      handleInputChange("location", v);
                    }}
                  />
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-3">
                    <h4 className="text-sm font-semibold uppercase text-gray-500">
                      Trip length (days)
                    </h4>
                    <Input
                      placeholder="e.g. 5"
                      type="number"
                      min={1}
                      value={formData?.noOfDays || ""}
                      onChange={(e) =>
                        handleInputChange("noOfDays", Number(e.target.value))
                      }
                      className="h-12 rounded-2xl border-gray-200 text-lg shadow-sm"
                    />
                  </div>
                  <div className="space-y-3">
                    <h4 className="text-sm font-semibold uppercase text-gray-500">
                      Travelers
                    </h4>
                    <div className="grid gap-4 sm:grid-cols-2">
                      {SelectTravelList.map((item) => {
                        const selected = formData?.traveler === item.people;
                        return (
                          <button
                            type="button"
                            key={item.id}
                            onClick={() => handleInputChange("traveler", item.people)}
                            className={`${cardBaseClass} ${
                              selected
                                ? cardSelectedClass
                                : "hover:border-indigo-200"
                            }`}
                            aria-pressed={selected}
                          >
                            <span className="text-3xl">{item.icon}</span>
                            <span className="text-base font-semibold text-gray-900">
                              {item.title}
                            </span>
                            <span className="text-sm text-gray-500">
                              {item.desc}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="text-sm font-semibold uppercase text-gray-500">
                    Budget vibe
                  </h4>
                  <div className="grid gap-4 sm:grid-cols-3">
                    {SelectBudgetOptions.map((item) => {
                      const selected = formData?.budget === item.title;
                      return (
                        <button
                          type="button"
                          key={item.id}
                          onClick={() => handleInputChange("budget", item.title)}
                          className={`${cardBaseClass} ${
                            selected
                              ? cardSelectedClass
                              : "hover:border-indigo-200"
                          }`}
                          aria-pressed={selected}
                        >
                          <span className="text-3xl">{item.icon}</span>
                          <span className="text-base font-semibold text-gray-900">
                            {item.title}
                          </span>
                          <span className="text-sm text-gray-500">
                            {item.desc}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="rounded-3xl border border-gray-200 bg-white/80 p-8 shadow-sm backdrop-blur">
            <div className="flex flex-col gap-6">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-indigo-500">
                  Trip vibe
                </p>
                <h3 className="mt-2 text-2xl font-semibold text-gray-900">
                  Describe the style and energy you&rsquo;re craving
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  These help us shape the tone of each itinerary option and
                  highlight the experiences that matter most to you.
                </p>
              </div>

              <div className="grid gap-6 lg:grid-cols-2">
                <div className="space-y-4">
                  <h4 className="text-sm font-semibold uppercase text-gray-500">
                    Overall vibe
                  </h4>
                  <div className="grid gap-4">
                    {TripVibeOptions.map((item) => {
                      const selected = formData?.travelStyle === item.value;
                      return (
                        <button
                          type="button"
                          key={item.id}
                          onClick={() => handleInputChange("travelStyle", item.value)}
                          className={`${cardBaseClass} ${
                            selected
                              ? cardSelectedClass
                              : "hover:border-indigo-200"
                          }`}
                          aria-pressed={selected}
                        >
                          <span className="text-3xl">{item.icon}</span>
                          <span className="text-base font-semibold text-gray-900">
                            {item.title}
                          </span>
                          <span className="text-sm text-gray-500">
                            {item.desc}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="text-sm font-semibold uppercase text-gray-500">
                    Pace preference
                  </h4>
                  <div className="grid gap-4">
                    {TripPaceOptions.map((item) => {
                      const selected = formData?.tripPace === item.value;
                      return (
                        <button
                          type="button"
                          key={item.id}
                          onClick={() => handleInputChange("tripPace", item.value)}
                          className={`${cardBaseClass} ${
                            selected
                              ? cardSelectedClass
                              : "hover:border-indigo-200"
                          }`}
                          aria-pressed={selected}
                        >
                          <span className="text-3xl">{item.icon}</span>
                          <span className="text-base font-semibold text-gray-900">
                            {item.title}
                          </span>
                          <span className="text-sm text-gray-500">
                            {item.desc}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="rounded-3xl border border-gray-200 bg-white/80 p-8 shadow-sm backdrop-blur">
            <div className="flex flex-col gap-6">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-indigo-500">
                  Interests
                </p>
                <h3 className="mt-2 text-2xl font-semibold text-gray-900">
                  What do you want to lean into?
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  Choose as many as you like. We&rsquo;ll ensure every day features
                  something that matches your focus areas.
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                {InterestTagOptions.map((item) => {
                  const selected = isMultiSelected("interests", item.value);
                  return (
                    <button
                      type="button"
                      key={item.id}
                      onClick={() => toggleMultiSelect("interests", item.value)}
                      className={`${pillBaseClass} ${
                        selected
                          ? pillSelectedClass
                          : "hover:border-indigo-200"
                      }`}
                      aria-pressed={selected}
                    >
                      <span>{item.icon}</span>
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </section>

          <section className="rounded-3xl border border-gray-200 bg-white/80 p-8 shadow-sm backdrop-blur">
            <div className="flex flex-col gap-6">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-indigo-500">
                  Stays & dining
                </p>
                <h3 className="mt-2 text-2xl font-semibold text-gray-900">
                  Let&rsquo;s tailor where you stay and what you eat
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  We match accommodation picks and meal suggestions to the
                  preferences you select.
                </p>
              </div>

              <div className="grid gap-6 lg:grid-cols-2">
                <div className="space-y-4">
                  <h4 className="text-sm font-semibold uppercase text-gray-500">
                    Stay style
                  </h4>
                  <div className="grid gap-4">
                    {StayStyleOptions.map((item) => {
                      const selected = formData?.stayStyle === item.value;
                      return (
                        <button
                          type="button"
                          key={item.id}
                          onClick={() => handleInputChange("stayStyle", item.value)}
                          className={`${cardBaseClass} ${
                            selected
                              ? cardSelectedClass
                              : "hover:border-indigo-200"
                          }`}
                          aria-pressed={selected}
                        >
                          <span className="text-3xl">{item.icon}</span>
                          <span className="text-base font-semibold text-gray-900">
                            {item.title}
                          </span>
                          <span className="text-sm text-gray-500">
                            {item.desc}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="text-sm font-semibold uppercase text-gray-500">
                    Dining preferences
                  </h4>
                  <div className="flex flex-wrap gap-3">
                    {DiningPreferenceOptions.map((item) => {
                      const selected = isMultiSelected("dining", item.value);
                      return (
                        <button
                          type="button"
                          key={item.id}
                          onClick={() => toggleMultiSelect("dining", item.value)}
                          className={`${pillBaseClass} ${
                            selected
                              ? pillSelectedClass
                              : "hover:border-indigo-200"
                          }`}
                          aria-pressed={selected}
                        >
                          <span>{item.icon}</span>
                          <span>{item.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="rounded-3xl border border-gray-200 bg-white/80 p-8 shadow-sm backdrop-blur">
            <div className="flex flex-col gap-6">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-indigo-500">
                  Final touches
                </p>
                <h3 className="mt-2 text-2xl font-semibold text-gray-900">
                  Accessibility, logistics, and must-haves
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  Share any mobility notes or non-negotiables so we craft plans
                  that work perfectly for your group.
                </p>
              </div>

              <div className="grid gap-6 lg:grid-cols-2">
                <div className="space-y-4">
                  <h4 className="text-sm font-semibold uppercase text-gray-500">
                    Mobility & comfort
                  </h4>
                  <div className="grid gap-4">
                    {MobilityComfortOptions.map((item) => {
                      const selected = formData?.mobility === item.value;
                      return (
                        <button
                          type="button"
                          key={item.id}
                          onClick={() => handleInputChange("mobility", item.value)}
                          className={`${cardBaseClass} ${
                            selected
                              ? cardSelectedClass
                              : "hover:border-indigo-200"
                          }`}
                          aria-pressed={selected}
                        >
                          <span className="text-3xl">{item.icon}</span>
                          <span className="text-base font-semibold text-gray-900">
                            {item.title}
                          </span>
                          <span className="text-sm text-gray-500">
                            {item.desc}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="text-sm font-semibold uppercase text-gray-500">
                    Must-haves & notes
                  </h4>
                  <textarea
                    value={formData?.mustHave || ""}
                    onChange={(e) => handleInputChange("mustHave", e.target.value)}
                    rows={6}
                    placeholder="Tell us about special occasions, must-see spots, accessibility needs, or anything the AI should prioritise."
                    className="w-full rounded-2xl border border-gray-200 bg-white/70 p-4 text-sm text-gray-700 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                  />
                  <p className="text-xs text-gray-500">
                    Example: &ldquo;Make sure to include a coffee-tasting class and a
                    relaxed day by the beach. One traveler has limited
                    mobility&rdquo;.
                  </p>
                </div>
              </div>
            </div>
          </section>
          {/* BUTTON */}
          <div className="my-10 flex justify-end">
            <Button
              disabled={loading}
              onClick={onGenerateTrip}
              className="h-12 rounded-2xl px-8 text-base font-semibold shadow-md"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <AiOutlineLoading3Quarters className="h-5 w-5 animate-spin" />
                  Preparing...
                </span>
              ) : (
                "Generate itinerary"
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* LOGIN DIALOG */}
      <LoginDialog open={openDialog} onLogin={login} />
    </div>
  );
}

export default CreateTrip;
