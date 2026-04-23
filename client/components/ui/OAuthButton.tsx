
// import Image from 'next/image'
// import React from 'react'

// const OAuthButton = ({ logo,logo2, label, onClick }) => {
//   return (
//     <div onClick={onClick} className={` bg-[#ffffff] group hover:bg-[#424242] transition-all ease-linear duration-150  flex gap-3 items-center cursor-pointer  h-8.5 px-5   w-full rounded-full`}>
//       <Image
//         width={23}
//         src={logo}
//         alt={`${label} Logo`}
//         className='group-hover:hidden'
//       />
//           <Image
//         width={22}
//         src={logo2}
//         alt={`${label} Logo`}
//         className='group-hover:inline-block hidden'
//       />
//       <p className=" text-[13px]  group-hover:text-white font-medium text-gray-700">
//        Continue with {label}
//       </p>

//     </div>
//   )
// }

// export default OAuthButton
"use client";

import Image from "next/image";
import React from "react";
import { Loader2 } from "lucide-react";

const OAuthButton = ({
  logo,
  logo2,
  label,
  onClick,
  disabled,
  loading,
}) => {
  const hoverLogo = logo2 || logo; // ✅ fallback (fix error)

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={` bg-[#ffffff] group hover:bg-[#424242] transition-all ease-linear duration-150  flex gap-3 items-center cursor-pointer  h-8.5 px-5   w-full rounded-full`}>
      {/* Icon area */}
      <div className="relative w-5 h-5 flex items-center justify-center">

        {/* Default logo */}
        {!loading && (
          <Image
            src={logo}
            alt={`${label} Logo`}
            width={22}
            height={22}
            className="group-hover:opacity-0 transition-opacity duration-150"
          />
        )}

        {/* Hover logo */}
        {!loading && (
          <Image
            src={hoverLogo}
            alt={`${label} Logo`}
            width={22}
            height={22}
            className="absolute opacity-0 group-hover:opacity-100 transition-opacity duration-150"
          />
        )}

        {/* Spinner */}
        {loading && (
          <Loader2 className="absolute w-5 h-5 animate-spin text-black group-hover:text-white" />
        )}
      </div>

      {/* Text */}
      <p className="text-[13px] group-hover:text-white font-medium text-gray-700">
        {loading ? "Signing in..." : `Continue with ${label}`}
      </p>
    </button>
  );
};

export default OAuthButton;