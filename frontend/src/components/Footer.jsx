import React, { useEffect } from "react";
import feather from "feather-icons";

const Footer = () => {
  useEffect(() => {
    feather.replace(); // Replace Feather icons
  }, []);

  return (
    <footer className="bg-white border-t border-gray-300 mt-12 py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-16 flex flex-col md:flex-row items-center md:items-start justify-between gap-6">
        {/* Left: Logo + Name + Address */}
        <div className="flex flex-col items-center md:items-start text-center md:text-left">
          <img
            src="/logo1.png"
            alt="UDSO Logo"
            className="h-10 w-auto object-contain mb-1"
          />
          <span className="text-blue-900 font-bold text-lg sm:text-xl">
            UDSO
          </span>
          <span className="text-green-600 font-semibold text-sm sm:text-base">
            Machinery Supply & Service
          </span>
          <p className="text-gray-700 text-sm mt-1">
            B-Block, Road 9, Bashundhara R/A, Dhaka
          </p>
          <p className="text-gray-700 text-sm">Contact: 01715138268</p>
        </div>

        {/* Right: Social Media */}
        <div className="flex gap-4">
          <a
            href="#"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-700 hover:text-blue-600 transition-colors"
          >
            <i data-feather="facebook" className="w-6 h-6"></i>
          </a>
          <a
            href="#"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-700 hover:text-pink-500 transition-colors"
          >
            <i data-feather="instagram" className="w-6 h-6"></i>
          </a>
          <a
            href="#"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-700 hover:text-blue-400 transition-colors"
          >
            <i data-feather="twitter" className="w-6 h-6"></i>
          </a>
          <a
            href="#"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-700 hover:text-gray-900 transition-colors"
          >
            <i data-feather="linkedin" className="w-6 h-6"></i>
          </a>
        </div>
      </div>

      {/* Bottom: Copyright */}
      <div className="mt-4 text-center text-gray-500 text-sm">
        &copy; {new Date().getFullYear()} UDSO. All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;

