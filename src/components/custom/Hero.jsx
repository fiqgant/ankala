import React from "react";
import { Button } from "../ui/button";
import { Link } from "react-router-dom";

function Hero() {
  return (
    <div className="flex flex-col items-center mx-8 md:mx-56 gap-9 text-center">
      <h1 className="font-extrabold text-[40px] md:text-[50px] leading-tight mt-10">
        <span className="text-[#f56551]">Craft Meaningful Journeys</span> <br />
        with Personalized Travel Itineraries
      </h1>

      <p className="text-xl text-gray-600 max-w-3xl">
        Ankala Journey helps you explore the world authentically with curated,
        sustainable travel plans tailored to your style, pace, and purpose.
      </p>

      <Link to={"/create-trip"}>
        <Button className="px-8 py-6 text-lg rounded-full">
          Start Planning — It's Free
        </Button>
      </Link>

      <img
        src="/landing.png"
        alt="Hero Banner"
        className="w-[90%] max-w-[750px]"
      />
    </div>
  );
}

export default Hero;
