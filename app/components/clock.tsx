"use client";

import { useState, useEffect, useRef } from "react";
import { useAuth } from "../context/auth-context";
import { useMatchHandling } from "../hooks/useMatchHandling";
import TimePicker from "./time-picker";
import QRActions from "./qr-actions";
import MatchResult from "./match-result";
import { Dayjs } from "dayjs";
import { Confetti, ConfettiRef } from "@/components/magicui/confetti";
import { Ripple } from "@/components/magicui/ripple";
import { DotPattern } from "@/components/magicui/dot-pattern";

type Mode = "clock" | "show-qr" | "scan-qr" | "matched";

export default function Clock() {
  const {
    student,
    user,
    loading: authLoading,
    error: authError,
    logout,
    createOrUpdateUser,
  } = useAuth();
  const [selectedTime, setSelectedTime] = useState<Dayjs | null>(null);
  const [mode, setMode] = useState<Mode>("clock");
  const [userCreationAttempted, setUserCreationAttempted] =
    useState<boolean>(false);

  const confettiRef = useRef<ConfettiRef>(null);

  const {
    matchedUser,
    error,
    success,
    setError,
    setSuccess,
    setMatchedUser,
    handleQRScanSuccess,
    isHourMatched,
    fetchMatchedHours,
  } = useMatchHandling({ user });

  useEffect(() => {
    const autoCreateUser = async () => {
      if (
        student &&
        !user &&
        !authLoading &&
        !authError &&
        !userCreationAttempted
      ) {
        console.log("Auto-creating user for student:", student);
        setUserCreationAttempted(true);

        await createOrUpdateUser({
          department: student.department || "Unknown",
          id: student.id || "",
          name: student.name || "",
        });
      }
    };

    autoCreateUser();
  }, [
    student,
    user,
    authLoading,
    authError,
    userCreationAttempted,
    createOrUpdateUser,
  ]);

  // fetch matched hours when component mounts
  useEffect(() => {
    if (user) {
      fetchMatchedHours();
    }
  }, [user, fetchMatchedHours]);

  // switch to matched mode when a match is found
  useEffect(() => {
    if (matchedUser && success) {
      setMode("matched");
    }
  }, [matchedUser, success]);

  const handleScanSuccess = async (qrData: string) => {
    const isSuccess = await handleQRScanSuccess(qrData, selectedTime);
    if (isSuccess) {
      setMode("matched");
    }
  };

  const handleStartOver = () => {
    setSelectedTime(null);
    setMode("clock");
    setMatchedUser(null);
    setSuccess("");
    setError("");
  };

  const handleBack = () => {
    setMode("clock");
    setError("");
  };

  if (authLoading) {
    return (
      <div className="h-screen bg-gradient-to-br from-orange-400 via-orange-300 to-amber-200 flex items-center justify-center p-4">
        <div className="text-center bg-white/90 backdrop-blur-sm rounded-3xl p-6 sm:p-8 shadow-2xl border-4 border-orange-400 max-w-sm w-full">
          <div className="relative">
            <div className="animate-spin rounded-full h-20 w-20 sm:h-32 sm:w-32 border-6 sm:border-8 border-orange-200 border-t-orange-500 mx-auto"></div>
            <div className="absolute inset-0 animate-ping rounded-full h-20 w-20 sm:h-32 sm:w-32 border-3 sm:border-4 border-orange-300 mx-auto opacity-20"></div>
          </div>
          <p className="mt-4 sm:mt-6 text-lg sm:text-2xl font-bold text-orange-800 animate-pulse">
            Loading...
          </p>
          <div className="mt-1 sm:mt-2 text-sm sm:text-base text-orange-600">
            Setting up your retro experience!
          </div>
        </div>
      </div>
    );
  }

  if (authError) {
    return (
      <div className="h-screen bg-gradient-to-br from-red-400 via-orange-400 to-amber-300 flex items-center justify-center p-4">
        <div className="text-center bg-white/95 backdrop-blur-sm rounded-3xl p-6 sm:p-8 shadow-2xl border-4 border-red-400 animate-bounce max-w-sm w-full">
          <div className="text-4xl sm:text-6xl mb-3 sm:mb-4 animate-pulse">
            ⚠️
          </div>
          <p className="text-red-700 mb-4 sm:mb-6 text-lg sm:text-xl font-bold">
            {authError}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 sm:px-8 sm:py-4 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-full hover:from-orange-600 hover:to-red-600 transform hover:scale-105 transition-all duration-300 shadow-lg text-lg sm:text-xl font-bold"
          >
            🔄 Retry
          </button>
        </div>
      </div>
    );
  }

  if (!student) {
    return (
      <div className="h-screen bg-gradient-to-br from-orange-400 via-amber-300 to-yellow-200 flex items-center justify-center p-4">
        <div className="text-center bg-white/90 backdrop-blur-sm rounded-3xl p-6 sm:p-8 shadow-2xl border-4 border-orange-400 animate-pulse max-w-sm w-full">
          <div className="text-6xl sm:text-8xl mb-3 sm:mb-4">🔐</div>
          <p className="text-orange-800 mb-3 sm:mb-4 text-lg sm:text-2xl font-bold">
            Please log in to continue
          </p>
          <div className="text-sm sm:text-base text-orange-600">
            Access your retro experience!
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="h-screen bg-gradient-to-br from-orange-400 via-orange-300 to-amber-200 flex items-center justify-center p-4">
        <div className="text-center bg-white/90 backdrop-blur-sm rounded-3xl p-6 sm:p-8 shadow-2xl border-4 border-orange-400 max-w-sm w-full">
          <div className="relative mb-4 sm:mb-6">
            <div className="animate-spin rounded-full h-20 w-20 sm:h-32 sm:w-32 border-6 sm:border-8 border-orange-200 border-t-orange-500 mx-auto"></div>
            <div className="absolute inset-0 animate-pulse rounded-full h-20 w-20 sm:h-32 sm:w-32 bg-orange-100 mx-auto opacity-30"></div>
          </div>
          <p className="text-lg sm:text-2xl font-bold text-orange-800 animate-bounce">
            Setting up your profile...
          </p>
          <div className="mt-1 sm:mt-2 text-sm sm:text-base text-orange-600">
            Almost ready for the retro vibes!
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-gradient-to-br from-orange-400 via-orange-300 to-amber-200 relative overflow-hidden">
      {/* Animated Background Elements - Hidden on small screens */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none hidden sm:block">
        <div className="absolute top-10 left-10 w-12 h-12 sm:w-20 sm:h-20 bg-white/20 rounded-full animate-bounce animation-delay-1000"></div>
        <div className="absolute top-32 right-20 w-10 h-10 sm:w-16 sm:h-16 bg-orange-200/30 rounded-full animate-pulse"></div>
        <div className="absolute bottom-20 left-1/4 w-16 h-16 sm:w-24 sm:h-24 bg-amber-200/20 rounded-full animate-bounce animation-delay-2000"></div>
        <div className="absolute bottom-40 right-1/3 w-8 h-8 sm:w-12 sm:h-12 bg-white/25 rounded-full animate-ping animation-delay-3000"></div>
      </div>

      <div className="h-full flex flex-col p-3 sm:p-4 md:p-8 relative z-10">
        <div className="flex-1 max-w-2xl mx-auto w-full flex flex-col">
          {/* Header - Extra Compact */}
          <div className="text-center mb-2 sm:mb-3 md:mb-4 animate-fade-in">
            <div className="bg-white/90 backdrop-blur-sm rounded-xl sm:rounded-2xl p-2 sm:p-3 md:p-4 shadow-xl border border-orange-400 transform hover:scale-105 transition-all duration-300">
              <h1 className="text-lg sm:text-xl md:text-2xl font-black mb-1 bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">
                🕺 Gala with me! 💃
              </h1>
              <p className="text-xs sm:text-sm md:text-base text-orange-800 font-bold truncate">
                Welcome, {user.name}!
              </p>
              <button
                onClick={logout}
                className="mt-3 sm:mt-3 px-3 py-1 sm:px-4 sm:py-2 bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-full hover:from-red-600 hover:to-orange-600 transform hover:scale-105 transition-all duration-300 shadow-md font-bold text-xs sm:text-sm"
              >
                Log Out
              </button>
            </div>
          </div>

          {/* Error Display - Compact */}
          {error && (
            <div className="mb-3 sm:mb-4 md:mb-6 animate-shake">
              <div className="p-3 sm:p-4 md:p-6 bg-gradient-to-r from-red-100 to-orange-100 border-2 sm:border-4 border-red-400 text-red-800 rounded-2xl sm:rounded-3xl shadow-lg backdrop-blur-sm">
                <div className="flex items-center">
                  <span className="text-lg sm:text-xl md:text-2xl mr-2 sm:mr-3 animate-bounce">
                    ❌
                  </span>
                  <span className="font-bold text-sm sm:text-base md:text-lg truncate">
                    {error}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Success Display - Compact */}
          {success && mode !== "matched" && (
            <div className="mb-3 sm:mb-4 md:mb-6 animate-bounce">
              <div className="p-3 sm:p-4 md:p-6 bg-gradient-to-r from-green-100 to-lime-100 border-2 sm:border-4 border-green-400 text-green-800 rounded-2xl sm:rounded-3xl shadow-lg backdrop-blur-sm">
                <div className="flex items-center">
                  <span className="text-lg sm:text-xl md:text-2xl mr-2 sm:mr-3 animate-pulse">
                    ✅
                  </span>
                  <span className="font-bold text-sm sm:text-base md:text-lg truncate">
                    {success}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Main Content - Flex-1 to fill remaining space */}
          <div className="flex-1 bg-white/95 backdrop-blur-sm rounded-2xl sm:rounded-3xl shadow-2xl border-2 sm:border-4 border-orange-400 overflow-hidden transform hover:scale-[1.02] transition-all duration-300">
            <div className="bg-gradient-to-r from-orange-500 to-amber-500 p-0.5 sm:p-1 h-full">
              <div className="bg-white rounded-2xl sm:rounded-3xl h-full flex flex-col">
                <div className="flex-1 p-4 sm:p-6 md:p-8 overflow-y-auto">
                  {mode === "clock" && (
                    <div className="animate-fade-in h-full flex flex-col">
                      <div className="flex-1">
                        <div className="mt-4">
                          <DotPattern />
                        </div>

                        <TimePicker
                          user={user}
                          selectedTime={selectedTime}
                          onTimeSelect={setSelectedTime}
                          isHourMatched={isHourMatched}
                        />
                      </div>

                      {selectedTime && (
                        <div
                          key={mode}
                          className="mt-1 sm:mt-1 md:mt-2 flex flex-col sm:flex-row justify-center space-y-2 sm:space-y-0 sm:space-x-4 md:space-x-6 animate-slide-up"
                        >
                          <button
                            onClick={() => setMode("show-qr")}
                            className="px-4 py-3 sm:px-6 sm:py-3 md:px-8 md:py-4 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-full hover:from-orange-600 hover:to-orange-700 transform hover:scale-110 hover:rotate-1 transition-all duration-300 shadow-xl font-bold text-sm sm:text-base md:text-lg flex items-center justify-center space-x-2"
                          >
                            <span>Generate QR</span>
                          </button>
                          <button
                            onClick={() => setMode("scan-qr")}
                            className="px-4 py-3 sm:px-6 sm:py-3 md:px-8 md:py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-full hover:from-green-600 hover:to-emerald-700 transform hover:scale-110 hover:rotate-[-1deg] transition-all duration-300 shadow-xl font-bold text-sm sm:text-base md:text-lg flex items-center justify-center space-x-2"
                          >
                            <span>Scan QR</span>
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                  {(mode === "show-qr" || mode === "scan-qr") && (
                    <div className="animate-fade-in h-full">
                      <QRActions
                        user={user}
                        selectedTime={selectedTime}
                        mode={mode}
                        onScanSuccess={handleScanSuccess}
                        onBack={handleBack}
                      />
                    </div>
                  )}

                  {mode === "matched" && matchedUser && (
                    <div className=" h-full">
                      <MatchResult
                        matchedUser={matchedUser}
                        success={success}
                        onStartOver={handleStartOver}
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Confetti
        ref={confettiRef}
        className="absolute left-0 top-0 z-50 size-full pointer-events-none"
      />

      <style jsx>{`
        @keyframes shake {
          0%,
          100% {
            transform: translateX(0);
          }
          10%,
          30%,
          50%,
          70%,
          90% {
            transform: translateX(-3px);
          }
          20%,
          40%,
          60%,
          80% {
            transform: translateX(3px);
          }
        }

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

        @keyframes celebration {
          0%,
          100% {
            transform: scale(1) rotate(0deg);
          }
          25% {
            transform: scale(1.05) rotate(1deg);
          }
          50% {
            transform: scale(1.1) rotate(-1deg);
          }
          75% {
            transform: scale(1.05) rotate(1deg);
          }
        }

        .animate-shake {
          animation: shake 0.5s ease-in-out;
        }

        .animate-fade-in {
          animation: fade-in 0.6s ease-out;
        }

        .animate-slide-up {
          animation: slide-up 0.8s ease-out;
        }

        .animate-celebration {
          animation: celebration 1s ease-in-out infinite;
        }

        .animation-delay-1000 {
          animation-delay: 1s;
        }

        .animation-delay-2000 {
          animation-delay: 2s;
        }

        .animation-delay-3000 {
          animation-delay: 3s;
        }

        /* Ensure no scrolling */
        html,
        body {
          overflow: hidden;
        }
      `}</style>
    </div>
  );
}
