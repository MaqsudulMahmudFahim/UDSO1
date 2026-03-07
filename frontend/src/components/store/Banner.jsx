import React, { useEffect, useState } from "react";
import { FaFacebookF, FaInstagram, FaPhone, FaBoxes } from "react-icons/fa";

const banners = [
  "/banner1.jpeg",
  "/banner2.jpg",
  "/banner3.jpg",
];

const Banner = () => {
  const [current, setCurrent] = useState(0);

  // Auto slide
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % banners.length);
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  const goToSlide = (index) => {
    setCurrent(index);
  };

  return (
    <div>
      {/* ===== Carousel Section ===== */}
      <div className="relative w-full h-[260px] sm:h-[320px] md:h-[420px] overflow-hidden">
        {/* Images */}
        {banners.map((image, index) => (
          <img
            key={index}
            src={image}
            alt="banner"
            className={`absolute w-full h-full object-cover transition-opacity duration-700 ${
              index === current ? "opacity-100" : "opacity-0"
            }`}
          />
        ))}

        {/* Dark overlay */}
        <div className="absolute inset-0 bg-black/30"></div>

        {/* Content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4">
          <h1 className="text-xl sm:text-2xl md:text-4xl font-extrabold mb-2 md:mb-4 bg-gradient-to-r from-yellow-400 to-green-400 bg-clip-text text-transparent">
            Trusted Machinery Supply & Services
          </h1>

          <p className="text-white text-xs sm:text-sm md:text-lg max-w-xl mb-3 md:mb-6">
            Reliable industrial machinery, genuine spare parts and professional
            service support for your business needs.
          </p>

          <div className="flex items-center gap-2 text-white text-sm sm:text-base md:text-lg font-semibold mb-3">
            <FaPhone />
            01832804429
          </div>

          <div className="flex gap-3">
            <a
              href="https://facebook.com"
              target="_blank"
              rel="noreferrer"
              className="bg-blue-600 p-2 md:p-3 rounded-full hover:scale-110 transition"
            >
              <FaFacebookF size={14} />
            </a>

            <a
              href="https://instagram.com"
              target="_blank"
              rel="noreferrer"
              className="bg-pink-500 p-2 md:p-3 rounded-full hover:scale-110 transition"
            >
              <FaInstagram size={14} />
            </a>
          </div>
        </div>

        {/* Dots */}
        <div className="absolute bottom-3 md:bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
          {banners.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`w-2 h-2 md:w-3 md:h-3 rounded-full ${
                current === index ? "bg-white" : "bg-white/40"
              }`}
            ></button>
          ))}
        </div>
      </div>

      {/* ===== Gap between Banner and Products ===== */}
      <div className="h-4 sm:h-6 md:h-8 bg-gray-100"></div>

      {/* ===== Our Products Section ===== */}
      <div className="bg-white shadow-sm rounded-lg mx-3 sm:mx-6 md:mx-10">
        <div className="flex items-center justify-center gap-2 py-2 sm:py-3 md:py-4">
          <FaBoxes className="text-yellow-600 text-base sm:text-lg md:text-xl" />
          <h2 className="font-bold text-base sm:text-lg md:text-xl text-gray-800">
            Our Products
          </h2>
        </div>
      </div>
    </div>
  );
};

export default Banner;





