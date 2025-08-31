"use client";

import { Dayjs } from "dayjs";
import dayjs from "dayjs";
import { supabase, User } from "../live/lib/supabase";

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

  return (
    <div className="flex flex-col items-center space-y-4 sm:space-y-6">
      <h2 className="text-lg sm:text-xl md:text-2xl font-black text-center bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent animate-pulse">
        ⏰ Choose your preferred time! ⏰
      </h2>

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
                }}>
                <button
                  onClick={() => !isMatched && handleHourSelect(hour)}
                  disabled={isMatched}
                  className={`
                    w-10 h-10 sm:w-12 sm:h-12 rounded-full font-black text-sm sm:text-lg transition-all duration-300 relative
                    ${
                      isMatched
                        ? "bg-gradient-to-br from-gray-300 to-gray-400 text-gray-500 cursor-not-allowed opacity-60 shadow-inner"
                        : isSelected
                        ? "bg-gradient-to-br from-orange-500 to-amber-600 text-white shadow-xl border-2 border-white hour-button-selected"
                        : "bg-gradient-to-br from-white to-orange-100 text-orange-800 border-2 border-orange-300 hover:border-orange-500 hover:from-orange-200 hover:to-amber-200 hover:scale-110 shadow-lg hover:shadow-xl"
                    }
                  `}
                  title={
                    isMatched
                      ? `${hour}:00 - Already matched! 🎉`
                      : `Select ${hour}:00 ⏰`
                  }>
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
          <div className="bg-gradient-to-r from-orange-100 to-amber-100 rounded-full px-4 sm:px-6 py-2 sm:py-3 border-2 border-orange-300 shadow-lg">
            <p className="text-sm sm:text-lg font-bold">
              🎯 You selected:{" "}
              <span className="text-orange-600 text-lg sm:text-xl animate-pulse">
                {selectedHour}:00
              </span>{" "}
              🕐
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
    </div>
  );
}
