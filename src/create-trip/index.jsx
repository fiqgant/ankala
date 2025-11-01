import React, { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { SelectBudgetOptions, SelectTravelList } from "@/constants/options";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { chatSession } from "@/service/AIModel";
import { doc, setDoc } from "firebase/firestore";
import { db } from "@/service/firebaseConfig";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import { useNavigate } from "react-router-dom";
import LocationSelect from "./components/LocationSelect";
import LoginDialog from "./components/LoginDialog";
import { buildPrompt } from "./utils/promptBuilder";
import { safeJsonParseMaybe } from "./utils/jsonParser";
import { useGoogleAuth } from "./hooks/useGoogleAuth";

/* -------------------------------------------------
   Main Component
   ------------------------------------------------- */
function CreateTrip() {
  const [place, setPlace] = useState(null);
  const [formData, setFormData] = useState({});
  const [openDialog, setOpenDialog] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleInputChange = (name, value) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  useEffect(() => {
    console.log("formData =>", formData);
  }, [formData]);

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

  return (
    <div className="sm:px-10 md:px-32 lg:px-56 px-5 mt-10">
      <h2 className="font-bold text-3xl">
        Tell us your travel preferences🏕️🌴
      </h2>
      <p className="mt-3 text-gray-500 text-xl">
        Just provide some basic information, and our trip planner will generate
        a customized itinerary based on your preferences.
      </p>

      <div className="mt-20 flex flex-col gap-10">
        {/* DESTINATION */}
        <div>
          <h2 className="text-xl my-3 font-medium">
            What is destination of choice?
          </h2>
          <LocationSelect
            value={place}
            onChange={(v) => {
              setPlace(v);
              handleInputChange("location", v);
            }}
          />
        </div>

        {/* DAYS */}
        <div>
          <h2 className="text-xl my-3 font-medium">
            How many days are you planning your trip?
          </h2>
          <Input
            placeholder="Ex.4"
            type="number"
            value={formData?.noOfDays || ""}
            onChange={(e) =>
              handleInputChange("noOfDays", Number(e.target.value))
            }
          />
        </div>

        {/* BUDGET */}
        <div>
          <h2 className="text-xl my-3 font-medium">What is Your Budget?</h2>
          <div className="grid grid-cols-3 gap-5 mt-5">
            {SelectBudgetOptions.map((item, index) => (
              <div
                key={index}
                onClick={() => handleInputChange("budget", item.title)}
                className={`p-4 border cursor-pointer rounded-lg hover:shadow-lg ${
                  formData?.budget === item.title && "shadow-lg border-black"
                }`}
              >
                <h2 className="text-4xl">{item.icon}</h2>
                <h2 className="font-bold text-lg">{item.title}</h2>
                <h2 className="text-sm text-gray-500">{item.desc}</h2>
              </div>
            ))}
          </div>
        </div>

        {/* TRAVELERS */}
        <div>
          <h2 className="text-xl my-3 font-medium">
            Who do you plan on traveling with on your next adventure?
          </h2>
          <div className="grid grid-cols-3 gap-5 mt-5">
            {SelectTravelList.map((item, index) => (
              <div
                key={index}
                onClick={() => handleInputChange("traveler", item.people)}
                className={`p-4 border cursor-pointer rounded-lg hover:shadow-lg ${
                  formData?.traveler === item.people && "shadow-lg border-black"
                }`}
              >
                <h2 className="text-4xl">{item.icon}</h2>
                <h2 className="font-bold text-lg">{item.title}</h2>
                <h2 className="text-sm text-gray-500">{item.desc}</h2>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* BUTTON */}
      <div className="my-10 justify-end flex">
        <Button disabled={loading} onClick={onGenerateTrip}>
          {loading ? (
            <AiOutlineLoading3Quarters className="h-7 w-7 animate-spin" />
          ) : (
            "Generate Trip"
          )}
        </Button>
      </div>

      {/* LOGIN DIALOG */}
      <LoginDialog open={openDialog} onLogin={login} />
    </div>
  );
}

export default CreateTrip;
