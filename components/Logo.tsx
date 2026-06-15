"use client";

import { useState } from "react";

export default function Logo({ className = "w-10 h-10" }: { className?: string }) {
  const [imgError, setImgError] = useState(false);

  // If the user uploads the actual logo.png, we load it. Otherwise, fallback to the SVG
  if (!imgError) {
    return (
      <img
        src="/logo.png"
        alt="Akrush Logo"
        className={`${className} object-contain`}
        onError={() => setImgError(true)}
      />
    );
  }

  // Fallback SVG: Vector recreation of the green fox logo with the phone speech bubble
  return (
    <svg
      viewBox="0 0 100 100"
      className={`${className}`}
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Fox Head Base (Green #65b827) */}
      <path
        d="M 50,88 
           C 47,88 38,79 32,71 
           C 22,59 13,51 10,51 
           C 9.5,51 15,38 22,22 
           C 25,15 28,8 29,8 
           C 29.5,8 33,18 37,29 
           C 42,42 46,47 50,47 
           C 54,47 58,42 63,29 
           C 67,18 70.5,8 71,8 
           C 72,8 75,15 78,22 
           C 85,38 90.5,51 90,51 
           C 87,51 78,59 68,71 
           C 62,79 53,88 50,88 Z"
        fill="#65b827"
      />

      {/* Cheeks / Facial Highlights (White) */}
      <path
        d="M 10.5,51 
           C 12,51 22,58 31,69 
           C 35,74 38,77 40,77 
           C 41,77 34,70 29,62 
           C 22,51 16.5,43 16,43 
           C 15.5,43 13,47 10.5,51 Z
           M 89.5,51 
           C 88,51 78,58 69,69 
           C 65,74 62,77 60,77 
           C 59,77 66,70 71,62 
           C 78,51 83.5,43 84,43 
           C 84.5,43 87,47 89.5,51 Z"
        fill="#ffffff"
      />

      {/* Eye Slits (Dark Forest Green #003421) */}
      <path
        d="M 23,61 C 28,62 33,65 37,70 C 31,67 25,64 23,61 Z"
        fill="#003421"
      />
      <path
        d="M 77,61 C 72,62 67,65 63,70 C 69,67 75,64 77,61 Z"
        fill="#003421"
      />

      {/* Nose Tip (Dark Forest Green #003421) */}
      <path
        d="M 50,88 C 48,88 47.5,86 48.5,84 C 49,83 51,83 51.5,84 C 52.5,86 52,88 50,88 Z"
        fill="#003421"
      />

      {/* Phone Speech Bubble (Green Circle + Tail + Phone Icon) */}
      {/* Tail */}
      <path
        d="M 68,41 L 69,32 L 77,35 Z"
        fill="#65b827"
      />
      {/* Bubble Outer */}
      <circle cx="82" cy="24" r="14" fill="#65b827" />
      {/* Bubble Inner White */}
      <circle cx="82" cy="24" r="11" fill="#ffffff" />
      
      {/* Phone Receiver SVG Path inside bubble */}
      <path
        d="M 78.5,19 C 78.2,19.3 78.2,19.8 78.5,20.1 L 79.5,21.1 C 79.7,21.3 80,21.3 80.2,21.1 L 80.7,20.6 C 80.9,20.4 81.2,20.4 81.4,20.6 C 81.8,21 82.2,21.4 82.5,21.9 C 82.7,22.1 82.7,22.4 82.5,22.6 L 82,23.1 C 81.8,23.3 81.8,23.6 82,23.8 L 83,24.8 C 83.2,25.1 83.7,25.1 84,24.8 L 84.8,24 C 85.3,23.5 85.1,22.4 84.4,21.6 C 83.7,20.7 82.7,19.8 81.7,19.2 C 80.9,18.7 79.9,18.5 79.4,19 L 78.5,19 Z"
        fill="#1b4b36"
      />
      {/* Ring Waves */}
      <path
        d="M 86,18.5 C 86.8,19.3 87.2,20.2 87.2,21.2 M 88.5,16.5 C 89.8,17.8 90.5,19.5 90.5,21.2"
        stroke="#1b4b36"
        strokeWidth="1.2"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  );
}
