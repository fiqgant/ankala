import React from "react";
import { Button } from "../ui/button";
import { Link } from "react-router-dom";

function Hero() {
  const socials = [
    {
      name: "Instagram",
      href: "https://www.instagram.com/ankala.journey?igsh=b3Z3dm5neWIzamxm",
      svg: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
          className="h-6 w-6"
          aria-hidden="true"
        >
          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 1.17.055 1.97.24 2.428.403.61.21 1.047.463 1.506.922.46.459.713.896.922 1.506.163.459.348 1.259.403 2.428.058 1.266.07 1.646.07 4.85s-.012 3.584-.07 4.85c-.055 1.17-.24 1.97-.403 2.428a3.93 3.93 0 0 1-.922 1.506 3.93 3.93 0 0 1-1.506.922c-.459.163-1.259.348-2.428.403-1.266.058-1.646.07-4.85.07s-3.584-.012-4.85-.07c-1.17-.055-1.97-.24-2.428-.403a3.93 3.93 0 0 1-1.506-.922 3.93 3.93 0 0 1-.922-1.506c-.163-.459-.348-1.259-.403-2.428C2.175 15.584 2.163 15.204 2.163 12s.012-3.584.07-4.85c.055-1.17.24-1.97.403-2.428.21-.61.463-1.047.922-1.506.459-.46.896-.713 1.506-.922.459-.163 1.259-.348 2.428-.403C8.416 2.175 8.796 2.163 12 2.163Zm0 1.62c-3.154 0-3.522.012-4.762.069-1.029.047-1.587.218-1.957.362-.492.191-.843.418-1.213.788-.37.37-.597.721-.788 1.213-.144.37-.315.928-.362 1.957-.057 1.24-.069 1.608-.069 4.762s.012 3.522.069 4.762c.047 1.029.218 1.587.362 1.957.191.492.418.843.788 1.213.37.37.721.597 1.213.788.37.144.928.315 1.957.362 1.24.057 1.608.069 4.762.069s3.522-.012 4.762-.069c1.029-.047 1.587-.218 1.957-.362.492-.191.843-.418 1.213-.788.37-.37.597-.721.788-1.213.144-.37.315-.928.362-1.957.057-1.24.069-1.608.069-4.762s-.012-3.522-.069-4.762c-.047-1.029-.218-1.587-.362-1.957a2.31 2.31 0 0 0-.788-1.213 2.31 2.31 0 0 0-1.213-.788c-.37-.144-.928-.315-1.957-.362-1.24-.057-1.608-.069-4.762-.069Zm0 3.658a4.56 4.56 0 1 1 0 9.12 4.56 4.56 0 0 1 0-9.12Zm0 1.62a2.94 2.94 0 1 0 0 5.88 2.94 2.94 0 0 0 0-5.88Zm5.834-.966a1.065 1.065 0 1 1-2.13 0 1.065 1.065 0 0 1 2.13 0Z" />
        </svg>
      ),
    },
    {
      name: "TikTok",
      href: "https://www.tiktok.com/@ankala.journey?_t=ZS-90wquKc6tAG&_r=1",
      svg: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 48 48"
          fill="currentColor"
          className="h-6 w-6"
          aria-hidden="true"
        >
          {/* Simplified TikTok logo */}
          <path d="M30 6c1.7 3.9 4.9 7 9 8v5.1c-3.5-.2-6.9-1.6-9-3.7v13.7c0 6.6-5.4 12-12 12S6 35.7 6 29.1 11.4 17.1 18 17.1c1.4 0 2.7.2 3.9.7v5.5a7.13 7.13 0 0 0-3.9-1.1 7 7 0 1 0 7 7V6h5Z" />
        </svg>
      ),
    },
  ];

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

      {/* Social icons */}
      <div className="flex items-center gap-4 mt-2">
        {socials.map((s) => (
          <a
            key={s.name}
            href={s.href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={s.name}
            className="group relative inline-flex h-12 w-12 items-center justify-center rounded-full transition-transform duration-200 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#f56551]"
          >
            {/* outer soft ring */}
            <span className="absolute inset-0 rounded-full bg-gradient-to-br from-[#fce7e5] to-[#ffe8d6] opacity-80 blur-sm group-hover:opacity-100"></span>
            {/* core */}
            <span className="relative z-10 grid h-12 w-12 place-items-center rounded-full bg-white text-gray-900 shadow-lg ring-1 ring-black/5">
              {/* inner accent ring */}
              <span className="absolute inset-0 rounded-full bg-gradient-to-br from-[#ffb4a8] to-[#ffd1a3] opacity-30"></span>
              <span className="relative">{s.svg}</span>
            </span>
          </a>
        ))}
      </div>

      <img
        src="/landing.png"
        alt="Hero banner artwork for Ankala Journey"
        className="w-[90%] max-w-[750px]"
      />
    </div>
  );
}

export default Hero;
