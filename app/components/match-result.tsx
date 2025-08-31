"use client";

// import { useEffect, useRef } from "react";
import { User } from "../live/lib/supabase";
// import { Confetti, type ConfettiRef } from "@/components/magicui/confetti";

interface MatchResultProps {
  matchedUser: User;
  success: string;
  onStartOver: () => void;
}

export default function MatchResult({
  matchedUser,
  success,
  onStartOver,
}: MatchResultProps) {
  // const confettiRef = useRef<ConfettiRef>(null);

  // Fire confetti when component mounts (when match is found)
  // Temporarily disabled confetti functionality
  /* 
  useEffect(() => {
    const timer = setTimeout(() => {
      confettiRef.current?.fire({
        particleCount: 150,
        spread: 100,
        origin: { y: 0.4 },
        colors: ["#f97316", "#fb923c", "#fed7aa", "#ffffff", "#fbbf24"],
      });

      // Fire additional bursts for celebration
      setTimeout(() => {
        confettiRef.current?.fire({
          particleCount: 80,
          spread: 60,
          origin: { x: 0.25, y: 0.5 },
          colors: ["#f97316", "#fb923c", "#fed7aa"],
        });
      }, 300);

      setTimeout(() => {
        confettiRef.current?.fire({
          particleCount: 80,
          spread: 60,
          origin: { x: 0.75, y: 0.5 },
          colors: ["#f97316", "#fb923c", "#fed7aa"],
        });
      }, 600);
    }, 100); // Small delay to ensure component is rendered

    return () => clearTimeout(timer);
  }, []);
  */

  return (
    <div className="relative flex flex-col items-center space-y-4 sm:space-y-6 h-full">
      {/* Confetti Component - temporarily disabled */}
      {/* <Confetti
        ref={confettiRef}
        className="absolute left-0 top-0 z-50 size-full pointer-events-none"
      /> */}

      {/* Celebration Header */}
      <div className="text-center animate-bounce">
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-black bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent animate-pulse">
          It&apos;s a Match!
        </h2>
      </div>

      {/* Success Message */}
      <div className="bg-gradient-to-r from-green-100 to-lime-100 border-2 border-green-400 rounded-2xl sm:rounded-3xl p-4 sm:p-6 text-center shadow-xl animate-fade-in w-full max-w-md">
        <p className="text-sm sm:text-lg font-bold text-green-800 mb-3">
          {success}
        </p>

        {/* Matched User Info */}
        <div className="bg-white/80 rounded-xl p-3 sm:p-4 space-y-2 border border-green-200">
          <div className="text-center mb-2">
            <p className="text-lg sm:text-xl font-bold text-orange-800">
              {matchedUser.name}
            </p>
          </div>

          <div className="space-y-1 text-xs sm:text-sm text-gray-700">
            <div className="flex items-center justify-center space-x-2">
              <span>🏢</span>
              <span>
                <strong>Department:</strong> {matchedUser.department}
              </span>
            </div>
            <div className="flex items-center justify-center space-x-2">
              <span>🆔</span>
              <span>
                <strong>Student ID:</strong> {matchedUser.student_id}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Celebration Messages */}
      <div className="flex flex-col items-center space-y-2 text-center animate-slide-up">
        <div className="bg-gradient-to-r from-orange-100 to-amber-100 rounded-full px-4 py-2 border border-orange-300 shadow-lg">
          <p className="text-xs sm:text-sm text-orange-800 font-semibold">
            ⏰ You both selected the same time preference!
          </p>
        </div>
        <div className="bg-gradient-to-r from-orange-100 to-amber-100 rounded-full px-4 py-2 border border-orange-300 shadow-lg">
          <p className="text-xs sm:text-sm text-orange-800 font-semibold">
            💬 Consider reaching out to coordinate your plans!
          </p>
        </div>
      </div>

      {/* Action Button */}
      <div className="mt-auto pt-4">
        <button
          onClick={() => {
            // Fire one more confetti burst when starting over - temporarily disabled
            /* confettiRef.current?.fire({
              particleCount: 50,
              spread: 45,
              origin: { y: 0.7 },
              colors: ["#f97316", "#fb923c"],
            }); */
            setTimeout(onStartOver, 500);
          }}
          className="px-6 py-3 sm:px-8 sm:py-4 bg-gradient-to-r from-orange-500 to-amber-600 text-white rounded-full hover:from-orange-600 hover:to-amber-700 transform hover:scale-110 hover:rotate-1 transition-all duration-300 shadow-xl font-bold text-sm sm:text-base flex items-center space-x-2 "
        >
          <span>Back to clock</span>
        </button>
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slide-up {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fade-in {
          animation: fade-in 0.8s ease-out;
        }

        .animate-slide-up {
          animation: slide-up 1s ease-out 0.5s both;
        }

        .animation-delay-500 {
          animation-delay: 0.5s;
        }
      `}</style>
    </div>
  );
}
