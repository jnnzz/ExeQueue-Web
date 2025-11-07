import React from "react";
import { FaFacebookF } from "react-icons/fa";
import { Globe } from "lucide-react";

export default function Contact() {
  return (
    <footer className="bg-[#10458B] mt-20 text-white py-8 rounded-4xl w-full">
      <div className="max-w-8xl mx-auto flex flex-col lg:flex-row justify-between items-start gap-10   lg:gap-40">
        {/* Left Section */}
        <div className="ml-10 pr-20 sm:pr-0 md:mx-10 lg:mx-20 flex flex-col max-w-md w-full top-1/2 transform -translate-y-[15%] ">
          <div className="flex items-center gap-2">
            {/* Logo */}
            <div className="w-30 h-30 flex items-center justify-center rounded-full left-1/2 transform -translate-x-[30%] ">
              <img
                src="assets/whitelogo.png"
                alt="ExeQueue Logo"
                className=""
              />
            </div>
            <h1
              className=" text-xl sm:text-2xl font-bold left-1/2 transform -translate-x-[55%]"
              style={{ fontFamily: "Montserrat, sans-serif" }}
            >
              ExeQueue
            </h1>
          </div>

          <p className="text-sm text-left md:text-base text-gray-300 leading-relaxed pl-1">
            Queue Management System for Student Affairs Services Office
          </p>

          {/* Socials */}
          <a
            href="https://www.facebook.com/ucmain.sao"
            target="_blank"
            rel="noopener noreferrer"
            className="w-8 mt-5 h-8 flex items-center justify-center text-[#0a285f] rounded-full hover:bg-gray-500 transition"
          >
            <img
              src="/assets/facebook.png"
              alt="Facebook"
              className="w-20 h-20 object-contain"
            />
          </a>
        </div>

        {/* Middle - Services */}
        <div className="md:mr-20 lg:mr-40 ml-10 grid grid-cols-2 gap-20">
          <div className="text-left w-full sm:w-auto">
            <h2 className="text-white font-medium mb-3">Service</h2>
            <ul className="space-y-2 text-gray-300 text-sm md:text-base">
              <li>Good Moral</li>
              <li>Insurance Payment</li>
              <li>Transmittal Letter</li>
              <li>Temporary Gate Pass</li>
              <li>Uniform Exemption</li>
              <li>Enrollment/Transfer</li>
            </ul>
          </div>

          {/* Right - Product */}
          <div className="text-left w-full sm:w-auto">
            <h2 className="text-white font-medium mb-3">Product</h2>
            <ul className="space-y-2 text-gray-300 text-sm md:text-base">
              <li>Features</li>
              <li>Tutorial</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Note */}
      <div className="mt-10 flex items-center justify-center text-xs text-gray-400  lg:w-8xl">
        © 2025 ExeQueue v1.0.1 | All Rights Reserved.
      </div>
    </footer>
  );
}
