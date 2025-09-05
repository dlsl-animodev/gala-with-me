"use client";

import { Dayjs } from "dayjs";
import dayjs from "dayjs";
import { useState } from "react";
import { supabase, Match, User } from "../live/lib/supabase";

interface MatchWithUsers extends Match {
  user1: User;
  user2: User;
}

interface TimePickerProps {
  user: User | null;
  selectedTime: Dayjs | null;
  onTimeSelect: (time: Dayjs | null) => void;
  isHourMatched?: (hour: number) => boolean;
}

export default function TimePicker({
  user,
  selectedTime,
  onTimeSelect,
  isHourMatched,
}: TimePickerProps) {
  const [showModal, setShowModal] = useState(false);
  const [matchedPair, setMatchedPair] = useState<MatchWithUsers | null>(null);
  const [isModalLoading, setIsModalLoading] = useState(false);

  const updatePreferredTime = async (time: number) => {

    if (!user) return;

    try {
      const { error } = await supabase
        .from("users")
        .update({ preferred_time: time })
        .eq("id", user.id);

      if (error) {
        console.error("Error updating preferred time:", error);
      } else {
        console.log("Preferred time updated successfully:", time);
      }
    } catch (err) {
      console.error("Error updating preferred time:", err);
    }
  };

  const handleHourSelect = (hour: number) => {
    const time = dayjs().hour(hour).minute(0).second(0);
    onTimeSelect(time);

    updatePreferredTime(hour);
  };

  const getSelectedHour = () => {
    if (!selectedTime) return null;
    const hour = selectedTime.hour();
    return hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
  };

  const hours = [12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
  const selectedHour = getSelectedHour();

  const handlePopModal = async (hour: number) => {
    if (!isHourMatched || !isHourMatched(hour)) return;

    setIsModalLoading(true);
    
    try {
      // Fetch match with user details in a single query using joins
      const { data: matchData, error } = await supabase
        .from("matches")
        .select(`
          *,
          user1:users!user1_id(*),
          user2:users!user2_id(*)
        `)
        .or(`user1_id.eq.${user?.id},user2_id.eq.${user?.id}`)
        .eq("agreed_time", hour)
        .single();

      if (error || !matchData) {
        console.error("No match found:", error);
        return;
      }

      // Set the matched pair with joined user data
      setMatchedPair({
        ...matchData,
        user1: matchData.user1,
        user2: matchData.user2
      });
      setShowModal(true);
    } catch (err) {
      console.error("Error fetching match details:", err);
    }
  };

  return (
    <div className="flex flex-col items-center space-y-4 sm:space-y-6">
      <h2 className="text-lg mt-6 sm:text-xl md:text-2xl font-black text-center bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent animate-pulse">
        ⏰ Choose your preferred time! ⏰
      </h2>
      <div className="h-8"></div>
      <div className="relative">
        {/* Retro clock container with glow effect */}
        <div className="relative w-64 h-64 sm:w-72 sm:h-72 md:w-80 md:h-80 animate-float">
          {/* Outer glow ring */}
          <div className="absolute inset-0 rounded-full bg-gradient-to-r from-orange-400 to-amber-400 animate-pulse opacity-50 scale-110"></div>

          {/* Main clock face */}
          <div className="absolute inset-2 rounded-full border-4 border-orange-400 bg-gradient-to-br from-white via-orange-50 to-amber-100 shadow-2xl backdrop-blur-sm">
            {/* Inner decorative ring */}
            <div className="absolute inset-4 rounded-full border-2 border-orange-200 opacity-60"></div>

            {/* Vintage clock markers */}
            <div className="absolute inset-8 rounded-full">
              {[...Array(12)].map((_, i) => {
                const angle = i * 30 - 90;
                const radian = (angle * Math.PI) / 180;
                const radius = 90;
                const x = Math.cos(radian) * radius;
                const y = Math.sin(radian) * radius;

                return (
                  <div
                    key={i}
                    className="absolute w-1 h-4 bg-orange-300 rounded-full transform -translate-x-1/2"
                    style={{
                      left: `calc(50% + ${x}px)`,
                      top: `calc(50% + ${y}px)`,
                      transform: `translate(-50%, -50%) rotate(${
                        angle + 90
                      }deg)`,
                    }}
                  />
                );
              })}
            </div>
          </div>

          {/* Center hub with retro styling */}
          <div className="absolute top-1/2 left-1/2 w-6 h-6 bg-gradient-to-br from-orange-500 to-amber-600 rounded-full transform -translate-x-1/2 -translate-y-1/2 z-10 shadow-lg border-2 border-white animate-pulse"></div>

          {/* Hour numbers with retro styling */}
          {hours.map((hour, index) => {
            const angle = index * 30 - 90; // 30 degrees per hour, starting from 12 o'clock
            const radian = (angle * Math.PI) / 180;
            const radius = 100; // distance from center
            const x = Math.cos(radian) * radius;
            const y = Math.sin(radian) * radius;

            const isSelected = selectedHour === hour;
            const isMatched = isHourMatched ? isHourMatched(hour) : false;

            return (
              <div
                key={hour}
                className="absolute z-30 hour-button-container"
                style={{
                  left: `calc(50% + ${x}px)`,
                  top: `calc(50% + ${y}px)`,
                  transform: "translate(-50%, -50%)",
                }}
              >
                <button
                  onClick={() => {
                    if (isMatched) {
                      handlePopModal(hour);
                    } else {
                      handleHourSelect(hour);
                    }
                  }}
                  className={`
                    w-10 h-10 sm:w-12 sm:h-12 rounded-full font-black text-sm sm:text-lg transition-all duration-300 relative
                    ${
                      isMatched
                        ? "bg-gradient-to-br from-gray-300 to-gray-400 text-gray-500  opacity-60 shadow-inner"
                        : isSelected
                        ? "bg-gradient-to-br from-orange-500 to-amber-600 text-white shadow-xl border-2 border-white hour-button-selected"
                        : "bg-gradient-to-br from-white to-orange-100 text-orange-800 border-2 border-orange-300 hover:border-orange-500 hover:from-orange-200 hover:to-amber-200 hover:scale-110 shadow-lg hover:shadow-xl"
                    }
                  `}
                  title={
                    isMatched
                      ? `${hour}:00 - Already matched!`
                      : `Select ${hour}:00`
                  }
                >
                  {hour}
                  {isMatched && (
                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full animate-ping">
                      <div className="absolute inset-0 w-4 h-4 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center">
                        <span className="text-white text-xs font-bold">✓</span>
                      </div>
                    </div>
                  )}
                </button>
              </div>
            );
          })}

          {/* Retro hour hand with glow */}
          {selectedHour && (
            <>
              {/* Glow effect for hand */}
              <div
                className="absolute top-1/2 left-1/2 w-2 bg-orange-400 rounded-full origin-bottom z-10 opacity-60 animate-pulse"
                style={{
                  height: "70px",
                  transform: `translate(-50%, -100%) rotate(${
                    (selectedHour === 12 ? 0 : selectedHour) * 30
                  }deg)`,
                }}
              />
              {/* Main hand */}
              <div
                className="absolute top-1/2 left-1/2 w-1 bg-gradient-to-t from-orange-600 to-amber-500 rounded-full origin-bottom z-20 shadow-lg"
                style={{
                  height: "60px",
                  transform: `translate(-50%, -100%) rotate(${
                    (selectedHour === 12 ? 0 : selectedHour) * 30
                  }deg)`,
                }}
              />
            </>
          )}
        </div>
      </div>

      {selectedTime && (
        <div className="text-center space-y-2 ">
          <div className="bg-gradient-to-r from-orange-100 to-amber-100 rounded-full px-4 sm:px-6 py-2 sm:py-3 border-2 border-orange-300 shadow-lg mt-8">
            <p className="text-sm sm:text-lg font-bold">
              You selected:{" "}
              <span className="text-orange-600 text-lg sm:text-xl animate-pulse">
                {selectedHour}:00 o&apos;clock
              </span>{" "}
            </p>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes float {
          0%,
          100% {
            transform: translateY(0px) rotate(0deg);
          }
          50% {
            transform: translateY(-10px) rotate(1deg);
          }
        }

        @keyframes hour-bounce {
          0%,
          100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.1);
          }
        }

        .animate-float {
          animation: float 4s ease-in-out infinite;
        }

        /* Fix for hour button animations */
        .hour-button-selected {
          animation: hour-bounce 1s ease-in-out infinite;
        }

        /* Additional retro glow effects */
        .retro-glow {
          box-shadow: 0 0 20px rgba(251, 146, 60, 0.3),
            0 0 40px rgba(251, 146, 60, 0.2),
            inset 0 0 20px rgba(255, 255, 255, 0.1);
        }

        /* Ensure consistent positioning for hour buttons */
        .hour-button-container {
          pointer-events: none;
        }

        .hour-button-container button {
          pointer-events: auto;
        }
      `}</style>
      {showModal && matchedPair && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
          <div className="bg-white rounded-3xl shadow-2xl p-6 w-96 animate-pop">
            <h3 className="text-xl font-bold text-orange-600 mb-6 text-center">
              🎉 You’ve got a match!
            </h3>

            <div className="space-y-4">
              {/* User 1 */}
              <div className="bg-gradient-to-r from-orange-100 to-amber-100 rounded-xl p-3 text-center border border-orange-200">
                <p className="text-orange-900 font-bold">
                  {matchedPair.user1.name}
                </p>
              </div>

              <div className="flex justify-center">
                <div className="w-8 h-8 bg-gradient-to-r from-red-500 to-pink-500 rounded-full flex items-center justify-center shadow-lg animate-pulse"></div>
              </div>

              {/* User 2 */}
              <div className="bg-gradient-to-r from-orange-100 to-amber-100 rounded-xl p-3 text-center border border-orange-200">
                <p className="text-orange-900 font-bold">
                  {matchedPair.user2.name}
                </p>
              </div>
            </div>

            {/* Hour */}
            <div className="text-center mt-6">
              <div className="bg-gradient-to-r from-amber-500 to-orange-500 text-white px-4 py-2 rounded-full shadow-lg">
                <span className="font-bold">
                  ⏰ {matchedPair.agreed_time}:00
                </span>
              </div>
            </div>

            {/* Close */}
            <div className="mt-6 flex justify-center">
              <button
                onClick={() => setShowModal(false)}
                className="px-5 py-2 rounded-lg bg-gradient-to-r from-orange-500 to-amber-600 text-white font-semibold shadow hover:scale-105 transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
