import React from "react";
import eye from "../../assets/images/360eye.png";
import arrow from "../../assets/arrow.png";

function Footer({ css }) {
  return (
    <div className={`text-white bg-[#000000] pt-8 pb-6 flex flex-col items-center justify-center gap-8 md:gap-12 ${css}`}>
      {/* Top Section: Quick Links and Newsletter */}
      <div className="w-full max-w-6xl flex flex-col md:flex-row justify-between items-start px-4 gap-8 md:gap-0">
        {/* Quick Links */}
        <div className="w-full md:w-1/2 flex flex-col gap-4">
          <h1 className="font-medium text-2xl md:text-3xl">QUICK LINKS</h1>
          <ul className="flex flex-col gap-2">
            <li className="text-lg md:text-xl hover:text-[#f05942] cursor-pointer">Home</li>
            <li className="text-lg md:text-xl hover:text-[#f05942] cursor-pointer">Showcase360</li>
            <li className="text-lg md:text-xl hover:text-[#f05942] cursor-pointer">Gallery</li>
            <li className="text-lg md:text-xl hover:text-[#f05942] cursor-pointer">About Us</li>
          </ul>
        </div>

        {/* Newsletter */}
        <div className="w-full md:w-1/2 flex flex-col gap-4">
          <h1 className="font-medium text-2xl md:text-3xl">Newsletter</h1>
          <input
            className="px-4 py-2 border border-[#FFFFFF29] bg-[#D9D9D914] w-full rounded-lg placeholder-white"
            placeholder="Email Address"
          />
          <button className="flex items-center justify-center w-fit bg-[#f05942] rounded-full px-6 py-2 text-lg gap-2 hover:bg-[#e04a34] transition-colors">
            Subscribe
            <img className="h-4" src={arrow} alt="arrow" />
          </button>
        </div>
      </div>

      {/* Middle Section: Eye Image */}
      <div className="w-full flex justify-center items-center">
        <img src={eye} className="w-1/2 max-w-[400px] h-auto" alt="360 Eye" />
      </div>

      {/* Bottom Section: Copyright and Social Links */}
      <div className="w-full max-w-6xl border-t border-[#535353] pt-6 flex flex-col md:flex-row justify-between items-center px-4 gap-4">
        <h3 className="text-lg md:text-xl">Copyright © 2025 360eye.in</h3>
        <div className="flex gap-6">
          <h3 className="text-lg md:text-xl hover:text-[#f05942] cursor-pointer">Facebook</h3>
          <h3 className="text-lg md:text-xl hover:text-[#f05942] cursor-pointer">Instagram</h3>
          <h3 className="text-lg md:text-xl hover:text-[#f05942] cursor-pointer">Youtube</h3>
        </div>
      </div>
    </div>
  );
}

export default Footer;