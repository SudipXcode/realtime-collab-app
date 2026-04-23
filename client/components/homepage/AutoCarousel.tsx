// "use client";

// import { useEffect, useRef, useState } from "react";

// const SLIDE_DURATION = 5000;

// interface Slide {
//   bg: string;
//   title: string;
// }

// const slides: Slide[] = [
//   { bg: "#2A9D99", title: "Get things done with bit more fun." },
//   { bg: "#AD6DED", title: "Take notes and transform thoughts." },
//   { bg: "#FF8A33", title: "Organized your team and share the task." },
// ];

// export default function AutoCarousel(): JSX.Element {
//   const [index, setIndex] = useState<number>(0);
//   const [progress, setProgress] = useState<number>(0);
//   const startTimeRef = useRef<number>(0);

//   // initialize time (safe)
//   useEffect(() => {
//     startTimeRef.current = Date.now();
//   }, []);

//   // slide change
//   useEffect(() => {
//     const slideInterval = setInterval(() => {
//       startTimeRef.current = Date.now();
//       setIndex((i: number) => (i + 1) % slides.length);
//     }, SLIDE_DURATION);

//     return () => clearInterval(slideInterval);
//   }, []);

//   // progress
//   useEffect(() => {
//     const interval = setInterval(() => {
//       const elapsed: number = Date.now() - startTimeRef.current;
//       const pct: number = Math.min((elapsed / SLIDE_DURATION) * 100, 100);
//       setProgress(pct);
//     }, 50);

//     return () => clearInterval(interval);
//   }, []);

//   const slide: Slide = slides[index];

//   return (
//     <div className="flex-2 flex flex-col h-full bg-[#1C1C1C] p-10">
//       <div className="w-[80%] mx-auto">
//         <div className="w-full h-0.75 bg-[#424242] rounded-full overflow-hidden">
//           <div
//             className="h-full bg-white transition-all linear"
//             style={{ width: `${progress}%` }}
//           />
//         </div>
//       </div>

//       <div
//         className="relative mt-8 w-full flex items-center justify-center h-full rounded-3xl overflow-hidden"
//         style={{ backgroundColor: slide.bg }}
//       >
//         <div key={`shapes-${index}`} className="absolute inset-0">
//           {/* Existing shapes */}
//           <div className="absolute -top-24 -left-28 w-72 h-72 bg-white/18 rounded-full" />
//           <div className="absolute top-1/4 -right-32 w-80 h-80 bg-white/22 rounded-3xl rotate-12" />
//           <div className="absolute -bottom-32 left-1/4 w-64 h-64 bg-white/16 rounded-full" />
//           <div className="absolute bottom-24 right-32 w-28 h-28 bg-white/28 rounded-xl rotate-45" />
//           <div className="absolute -top-20 right-24 w-40 h-40 bg-white/20 rounded-full" />
//           <div className="absolute -top-20 right-150 w-40 h-40 bg-white/20 rounded-full" />
//           <div className="absolute top-1/2 -left-16 w-48 h-16 bg-white/25 rounded-full rotate-6" />

//           {/* NEW shapes */}
//           {/* Shape 7: thin tall rectangle */}
//           <div className="absolute top-16 left-1/2 w-16 h-64 bg-white/18 rounded-2xl rotate-12" />

//           {/* Shape 8: medium rounded square */}
//           <div className="absolute bottom-10 left-16 w-44 h-44 bg-white/22 rounded-3xl -rotate-12" />

//           {/* Shape 9: small circle accent */}
//           <div className="absolute top-1/3 right-10 w-20 h-20 bg-white/30 rounded-full" />
//         </div>

//         <p className="relative z-10 italic font-bold text-[48px] leading-snug text-white text-center">
//           {slide.title}
//         </p>
//       </div>
//     </div>
//   );
// }


"use client";

import { useEffect, useState } from "react";

const SLIDE_DURATION = 5000;

interface Slide {
  bg: string;
  title: string;
}

const slides: Slide[] = [
  { bg: "#2A9D99", title: "Get things done with bit more fun." },
  { bg: "#AD6DED", title: "Take notes and transform thoughts." },
  { bg: "#FF8A33", title: "Organized your team and share the task." },
];

export default function AutoCarousel(): JSX.Element {
  const [index, setIndex] = useState(0);

  // ✅ single interval only
  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((i) => (i + 1) % slides.length);
    }, SLIDE_DURATION);

    return () => clearInterval(interval);
  }, []);

  const slide = slides[index];

  return (
    <div className="flex-2 flex flex-col h-full bg-[#1C1C1C] p-10">
      
      {/* ✅ CSS-based progress (no JS interval) */}
      <div className="w-[80%] mx-auto">
        <div className="w-full h-0.75 bg-[#424242] rounded-full overflow-hidden">
          <div
            key={index} // restart animation per slide
            className="h-full bg-white animate-progress"
          />
        </div>
      </div>

      <div
        className="relative mt-8 w-full flex items-center justify-center h-full rounded-3xl overflow-hidden transition-colors duration-500"
        style={{ backgroundColor: slide.bg }}
      >
        {/* ❌ removed key → no remount flicker */}
        <div className="absolute inset-0">
          <div className="absolute -top-24 -left-28 w-72 h-72 bg-white/18 rounded-full" />
          <div className="absolute top-1/4 -right-32 w-80 h-80 bg-white/22 rounded-3xl rotate-12" />
          <div className="absolute -bottom-32 left-1/4 w-64 h-64 bg-white/16 rounded-full" />
          <div className="absolute bottom-24 right-32 w-28 h-28 bg-white/28 rounded-xl rotate-45" />
          <div className="absolute -top-20 right-24 w-40 h-40 bg-white/20 rounded-full" />
          <div className="absolute -top-20 right-37.5 w-40 h-40 bg-white/20 rounded-full" />
          <div className="absolute top-1/2 -left-16 w-48 h-16 bg-white/25 rounded-full rotate-6" />

          {/* extra shapes */}
          <div className="absolute top-16 left-1/2 w-16 h-64 bg-white/18 rounded-2xl rotate-12" />
          <div className="absolute bottom-10 left-16 w-44 h-44 bg-white/22 rounded-3xl -rotate-12" />
          <div className="absolute top-1/3 right-10 w-20 h-20 bg-white/30 rounded-full" />
        </div>

        <p className="relative z-10 italic font-bold text-[48px] leading-snug text-white text-center px-6">
          {slide.title}
        </p>
      </div>
    </div>
  );
}