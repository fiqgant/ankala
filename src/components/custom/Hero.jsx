import React from "react";
import { Button } from "../ui/button";
import { Link } from "react-router-dom";

function Hero() {
  const socials = [
    {
      name: "Instagram",
      href: "https://www.instagram.com/ankala.journey?igsh=b3Z3dm5neWIzamxm",
      gradient: "from-[#f09433] via-[#e6683c] via-[#dc2743] via-[#cc2366] to-[#bc1888]",
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
      gradient: "from-[#000000] via-[#161823] to-[#000000]",
      svg: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
          className="h-6 w-6"
          aria-hidden="true"
        >
          <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
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
      <div className="flex items-center gap-5 mt-2">
        {socials.map((s) => (
          <a
            key={s.name}
            href={s.href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={s.name}
            className="group relative inline-flex h-14 w-14 items-center justify-center rounded-full transition-all duration-300 hover:scale-110 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#f56551]"
          >
            {/* outer glow effect */}
            <span className={`absolute inset-0 rounded-full bg-gradient-to-br ${s.gradient} opacity-0 group-hover:opacity-20 blur-md transition-opacity duration-300`}></span>
            
            {/* animated gradient ring */}
            <span className={`absolute inset-0 rounded-full bg-gradient-to-br ${s.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300 animate-pulse`}></span>
            
            {/* core button */}
            <span className="relative z-10 grid h-14 w-14 place-items-center rounded-full bg-white shadow-lg ring-1 ring-black/10 group-hover:ring-2 group-hover:ring-black/20 transition-all duration-300">
              {/* gradient fill on hover */}
              <span className={`absolute inset-[2px] rounded-full bg-gradient-to-br ${s.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}></span>
              
              {/* icon */}
              <span className="relative z-10 text-gray-900 group-hover:text-white transition-colors duration-300">
                {s.name === 'Instagram' ? (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    className="h-6 w-6"
                    aria-hidden="true"
                  >
                    <defs>
                      <linearGradient id="instagramGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#f09433" />
                        <stop offset="25%" stopColor="#e6683c" />
                        <stop offset="50%" stopColor="#dc2743" />
                        <stop offset="75%" stopColor="#cc2366" />
                        <stop offset="100%" stopColor="#bc1888" />
                      </linearGradient>
                    </defs>
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 1.17.055 1.97.24 2.428.403.61.21 1.047.463 1.506.922.46.459.713.896.922 1.506.163.459.348 1.259.403 2.428.058 1.266.07 1.646.07 4.85s-.012 3.584-.07 4.85c-.055 1.17-.24 1.97-.403 2.428a3.93 3.93 0 0 1-.922 1.506 3.93 3.93 0 0 1-1.506.922c-.459.163-1.259.348-2.428.403-1.266.058-1.646.07-4.85.07s-3.584-.012-4.85-.07c-1.17-.055-1.97-.24-2.428-.403a3.93 3.93 0 0 1-1.506-.922 3.93 3.93 0 0 1-.922-1.506c-.163-.459-.348-1.259-.403-2.428C2.175 15.584 2.163 15.204 2.163 12s.012-3.584.07-4.85c.055-1.17.24-1.97.403-2.428.21-.61.463-1.047.922-1.506.459-.46.896-.713 1.506-.922.459-.163 1.259-.348 2.428-.403C8.416 2.175 8.796 2.163 12 2.163Zm0 1.62c-3.154 0-3.522.012-4.762.069-1.029.047-1.587.218-1.957.362-.492.191-.843.418-1.213.788-.37.37-.597.721-.788 1.213-.144.37-.315.928-.362 1.957-.057 1.24-.069 1.608-.069 4.762s.012 3.522.069 4.762c.047 1.029.218 1.587.362 1.957.191.492.418.843.788 1.213.37.37.721.597 1.213.788.37.144.928.315 1.957.362 1.24.057 1.608.069 4.762.069s3.522-.012 4.762-.069c1.029-.047 1.587-.218 1.957-.362.492-.191.843-.418 1.213-.788.37-.37.597-.721.788-1.213.144-.37.315-.928.362-1.957.057-1.24.069-1.608.069-4.762s-.012-3.522-.069-4.762c-.047-1.029-.218-1.587-.362-1.957a2.31 2.31 0 0 0-.788-1.213 2.31 2.31 0 0 0-1.213-.788c-.37-.144-.928-.315-1.957-.362-1.24-.057-1.608-.069-4.762-.069Zm0 3.658a4.56 4.56 0 1 1 0 9.12 4.56 4.56 0 0 1 0-9.12Zm0 1.62a2.94 2.94 0 1 0 0 5.88 2.94 2.94 0 0 0 0-5.88Zm5.834-.966a1.065 1.065 0 1 1-2.13 0 1.065 1.065 0 0 1 2.13 0Z" fill="url(#instagramGradient)" className="group-hover:fill-white transition-colors duration-300" />
                  </svg>
                ) : (
                  s.svg
                )}
              </span>
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
