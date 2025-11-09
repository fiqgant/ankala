import React, { useEffect, useRef, useState } from "react";
import { Button } from "../ui/button";
import { Link } from "react-router-dom";

function Hero() {
  const videoRef = useRef(null);
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);
  const [showWelcome, setShowWelcome] = useState(true);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && isVideoLoaded) {
            video.play().catch(() => {
              // Auto-play prevented, user will need to click
            });
          } else {
            video.pause();
          }
        });
      },
      { threshold: 0.5 }
    );

    observer.observe(video);

    return () => {
      observer.unobserve(video);
    };
  }, [isVideoLoaded]);

  useEffect(() => {
    if (!showWelcome) {
      document.body.style.overflow = "";
      return;
    }

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setShowWelcome(false);
      }
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [showWelcome]);
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
    {
      name: "WhatsApp",
      href: "https://wa.me/6287844234005?text=Halo%20Ankala%20Journey!",
      gradient: "from-[#25D366] via-[#128C7E] to-[#075E54]",
      svg: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
          className="h-6 w-6"
          aria-hidden="true"
        >
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
        </svg>
      ),
    },
  ];

  return (
    <>
      {showWelcome && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 backdrop-blur-sm">
          <div className="relative w-full max-w-lg rounded-3xl bg-white/95 p-6 sm:p-8 text-center shadow-2xl">
            <div className="absolute -top-8 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-[#1e3124] via-[#2a4634] to-[#3e7456] px-5 py-2 text-sm font-semibold text-white shadow-lg">
              By Ankala Journey
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#1e3124]">
              Selamat Datang!
            </h2>
            <p className="mt-4 text-base sm:text-lg text-gray-700 leading-relaxed">
              Terima kasih sudah mengunjungi Ankala Journey. Mohon maaf apabila masih
              ditemukan bug, karena website ini masih dalam tahap pengembangan.
            </p>
            <Button
              className="mt-6 w-full rounded-2xl bg-gradient-to-r from-[#1e3124] via-[#2a4634] to-[#3e7456] py-3 text-lg font-semibold text-white shadow-lg hover:scale-105 transition"
              onClick={() => setShowWelcome(false)}
            >
              Mulai Jelajahi
            </Button>
          </div>
        </div>
      )}
      <div className="relative left-1/2 w-screen -translate-x-1/2 overflow-hidden py-12">
        {/* Full-width background gradients */}
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[120vw] max-w-none h-[520px] bg-gradient-to-b from-[#2a4634]/20 via-[#356049]/10 to-transparent blur-3xl animate-pulse-slow"></div>
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[110vw] max-w-none h-96 bg-gradient-to-r from-[#2a4634]/12 via-[#356049]/10 to-[#1e3124]/10 blur-3xl"></div>
          <div className="absolute bottom-[-80px] left-1/2 -translate-x-1/2 w-[140vw] max-w-none h-[420px] bg-gradient-to-tl from-[#356049]/15 to-[#1e3124]/10 blur-3xl"></div>

          {/* Animated particles/leaves decoration */}
          <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-[130vw] overflow-visible">
            <div className="absolute top-20 left-[8%] w-24 h-24 bg-[#3e7456]/20 rounded-full blur-xl animate-float-slow"></div>
            <div className="absolute top-40 right-[12%] w-16 h-16 bg-[#356049]/30 rounded-full blur-lg animate-float-delayed"></div>
            <div className="absolute bottom-32 left-1/4 w-28 h-28 bg-[#2a4634]/15 rounded-full blur-2xl animate-float"></div>
          </div>
        </div>

        <div className="relative mx-auto flex max-w-6xl flex-col items-center gap-12 px-6 md:px-20 text-center">
        {/* Animated heading with enhanced green gradient */}
        <div className="mt-10 space-y-6 animate-fade-in-up">
          <h1 className="font-extrabold text-[40px] md:text-[60px] lg:text-[80px] leading-tight tracking-tight">
            <span className="block bg-gradient-to-r from-[#2a4634] via-[#3e7456] to-[#2a4634] bg-clip-text text-transparent animate-gradient bg-[length:200%_auto] drop-shadow-sm">
              Craft Meaningful
            </span>
            <span className="block mt-2 bg-gradient-to-r from-[#1e3124] via-[#2a4634] to-[#3e7456] bg-clip-text text-transparent animate-gradient bg-[length:200%_auto] drop-shadow-sm">
              Journeys
            </span>
            <span className="block mt-4 text-[28px] md:text-[36px] lg:text-[42px] text-gray-800 font-bold">
              with Personalized Travel Itineraries
            </span>
          </h1>

          <p className="text-lg md:text-xl text-gray-700 max-w-3xl mx-auto leading-relaxed font-medium">
            Ankala Journey helps you explore the world authentically with curated,
            sustainable travel plans tailored to your style, pace, and purpose.
          </p>
        </div>

        {/* Enhanced CTA Button with green gradient and more effects */}
        <div className="animate-fade-in-up animation-delay-200 relative">
          <Link to={"/create-trip"}>
            <Button className="group relative px-12 py-8 text-lg md:text-xl rounded-full bg-gradient-to-r from-[#1e3124] via-[#2a4634] to-[#3e7456] hover:from-[#2a4634] hover:via-[#3e7456] hover:to-[#2a4634] text-white shadow-2xl hover:shadow-[0_25px_60px_rgba(42,70,52,0.4)] hover:scale-110 transition-all duration-500 font-bold overflow-hidden border-2 border-[#2a4634]/30">
              <span className="relative z-10 flex items-center gap-3">
                Start Planning — It's Free
                <svg
                  className="w-6 h-6 transform group-hover:translate-x-2 group-hover:scale-110 transition-all duration-300"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2.5}
                    d="M13 7l5 5m0 0l-5 5m5-5H6"
                  />
                </svg>
              </span>
              {/* Animated shimmer effect */}
              <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></span>
              {/* Glow effect */}
              <span className="absolute inset-0 bg-[#2a4634]/20 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></span>
            </Button>
          </Link>
          {/* Floating badge */}
          <div className="absolute -top-3 -right-3 bg-gradient-to-r from-[#3e7456] to-[#2a4634] text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg animate-bounce-subtle z-20">
            ✨ Free Forever
          </div>
        </div>

        {/* Video section with enhanced green-themed styling */}
        <div className="w-[90%] max-w-[900px] animate-fade-in-up animation-delay-600 relative group mt-8">
        <div className="relative rounded-3xl overflow-hidden shadow-2xl transform transition-all duration-700 hover:scale-[1.03] hover:shadow-[0_30px_80px_rgba(42,70,52,0.4)] border-4 border-[#2a4634]/20 hover:border-[#2a4634]/40">
          {/* Gradient overlay on hover with green tint */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#1e3124]/30 via-transparent to-[#3e7456]/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-10 pointer-events-none"></div>
          
          {/* Animated border glow */}
          <div className="absolute -inset-1 bg-gradient-to-r from-[#2a4634] via-[#3e7456] to-[#4b906a] rounded-3xl opacity-0 group-hover:opacity-75 blur-xl transition-opacity duration-500 -z-10 animate-pulse-slow"></div>
          
          {/* Video with enhanced styling */}
          <video
            ref={videoRef}
            src="/video.MP4"
            poster="/landing.png"
            controls
            loop
            playsInline
            className="w-full h-auto rounded-3xl relative z-0"
            preload="metadata"
            onLoadedData={() => setIsVideoLoaded(true)}
            onMouseEnter={(e) => {
              if (e.target.paused) {
                e.target.play().catch(() => {});
              }
            }}
          >
            Your browser does not support the video tag.
          </video>

          {/* Decorative border gradient with green theme */}
          <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-[#2a4634]/30 via-[#356049]/30 to-[#4b906a]/30 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none z-0 blur-md"></div>
          
          {/* Play icon overlay on hover */}
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20 pointer-events-none">
            <div className="bg-[#2a4634]/80 backdrop-blur-sm rounded-full p-4 transform scale-75 group-hover:scale-100 transition-transform duration-300">
              <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z"/>
              </svg>
            </div>
          </div>
        </div>
        
        {/* Enhanced floating decorative elements with green theme */}
        <div className="absolute -top-6 -right-6 w-24 h-24 bg-gradient-to-br from-[#356049]/30 to-[#3e7456]/20 rounded-full blur-2xl opacity-60 animate-float z-0"></div>
        <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-gradient-to-tr from-[#3e7456]/30 to-[#2a4634]/20 rounded-full blur-3xl opacity-60 animate-float-delayed z-0"></div>
        <div className="absolute top-1/2 -left-8 w-20 h-20 bg-gradient-to-r from-[#3e7456]/25 to-[#2a4634]/25 rounded-full blur-xl opacity-50 animate-float-slow z-0"></div>
        
        {/* Video corner badges */}
        <div className="absolute top-4 left-4 bg-gradient-to-r from-[#1e3124] to-[#3e7456] text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg z-30 backdrop-blur-sm bg-opacity-90">
          🎬 Ankala Goes to Pulo Sibandang
        </div>
      </div>

      {/* Social icons with green accent */}
      <div className="flex items-center gap-5 mt-10 animate-fade-in-up animation-delay-400">
        {socials.map((s) => (
          <a
            key={s.name}
            href={s.href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={s.name}
            className="group relative inline-flex h-16 w-16 items-center justify-center rounded-full transition-all duration-300 hover:scale-125 hover:shadow-2xl focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#2a4634] hover:ring-2 hover:ring-[#2a4634]/50"
          >
            {/* outer glow effect */}
            <span className={`absolute inset-0 rounded-full bg-gradient-to-br ${s.gradient} opacity-0 group-hover:opacity-20 blur-md transition-opacity duration-300`}></span>

            {/* animated gradient ring */}
            <span className={`absolute inset-0 rounded-full bg-gradient-to-br ${s.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}></span>

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
                    <path
                      d="M12 2.163c3.204 0 3.584.012 4.85.07 1.17.055 1.97.24 2.428.403.61.21 1.047.463 1.506.922.46.459.713.896.922 1.506.163.459.348 1.259.403 2.428.058 1.266.07 1.646.07 4.85s-.012 3.584-.07 4.85c-.055 1.17-.24 1.97-.403 2.428a3.93 3.93 0 0 1-.922 1.506 3.93 3.93 0 0 1-1.506.922c-.459.163-1.259.348-2.428.403-1.266.058-1.646.07-4.85.07s-3.584-.012-4.85-.07c-1.17-.055-1.97-.24-2.428-.403a3.93 3.93 0 0 1-1.506-.922 3.93 3.93 0 0 1-.922-1.506c-.163-.459-.348-1.259-.403-2.428C2.175 15.584 2.163 15.204 2.163 12s.012-3.584.07-4.85c.055-1.17.24-1.97.403-2.428.21-.61.463-1.047.922-1.506.459-.46.896-.713 1.506-.922.459-.163 1.259-.348 2.428-.403C8.416 2.175 8.796 2.163 12 2.163Zm0 1.62c-3.154 0-3.522.012-4.762.069-1.029.047-1.587.218-1.957.362-.492.191-.843.418-1.213.788-.37.37-.597.721-.788 1.213-.144.37-.315.928-.362 1.957-.057 1.24-.069 1.608-.069 4.762s.012 3.522.069 4.762c.047 1.029.218 1.587.362 1.957.191.492.418.843.788 1.213.37.37.721.597 1.213.788.37.144.928.315 1.957.362 1.24.057 1.608.069 4.762.069s3.522-.012 4.762-.069c1.029-.047 1.587-.218 1.957-.362.492-.191.843-.418 1.213-.788.37-.37.597-.721.788-1.213.144-.37.315-.928.362-1.957.057-1.24.069-1.608.069-4.762s-.012-3.522-.069-4.762c-.047-1.029-.218-1.587-.362-1.957a2.31 2.31 0 0 0-.788-1.213 2.31 2.31 0 0 0-1.213-.788c-.37-.144-.928-.315-1.957-.362-1.24-.057-1.608-.069-4.762-.069Zm0 3.658a4.56 4.56 0 1 1 0 9.12 4.56 4.56 0 0 1 0-9.12Zm0 1.62a2.94 2.94 0 1 0 0 5.88 2.94 2.94 0 0 0 0-5.88Zm5.834-.966a1.065 1.065 0 1 1-2.13 0 1.065 1.065 0 0 1 2.13 0Z"
                      fill="url(#instagramGradient)"
                      className="group-hover:fill-white transition-colors duration-300"
                    />
                  </svg>
                ) : (
                  s.svg
                )}
              </span>
            </span>
          </a>
        ))}
      </div>
    </div>
    </>
  );
}

export default Hero;
