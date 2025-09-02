"use client";

import { useState, useEffect, useRef } from "react";
import { useAuth } from "../context/auth-context";
import { useMatchHandling } from "../hooks/useMatchHandling";
import TimePicker from "./time-picker";
import QRActions from "./qr-actions";
import MatchResult from "./match-result";
import { Dayjs } from "dayjs";
import { Confetti, ConfettiRef } from "@/components/magicui/confetti";
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

  useEffect(() => {
    if (user) {
      fetchMatchedHours();
    }
  }, [user, fetchMatchedHours]);

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
      <div className="h-[100dvh] bg-gradient-to-br from-orange-400 via-orange-300 to-amber-200 flex items-center justify-center p-4">
        <div className="text-center bg-white/90 backdrop-blur-sm rounded-3xl p-4 sm:p-6 shadow-2xl border-4 border-orange-400 max-w-sm w-full">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 sm:h-24 sm:w-24 border-6 border-orange-200 border-t-orange-500 mx-auto"></div>
            <div className="absolute inset-0 animate-ping rounded-full h-16 w-16 sm:h-24 sm:w-24 border-3 border-orange-300 mx-auto opacity-20"></div>
          </div>
          <p className="mt-3 text-lg font-bold text-orange-800 animate-pulse">
            Loading...
          </p>
          <div className="mt-1 text-sm text-orange-600">
            Setting up your retro experience!
          </div>
        </div>
      </div>
    );
  }

  if (authError) {
    return (
      <div className="h-[100dvh] bg-gradient-to-br from-red-400 via-orange-400 to-amber-300 flex items-center justify-center p-4">
        <div className="text-center bg-white/95 backdrop-blur-sm rounded-3xl p-4 sm:p-6 shadow-2xl border-4 border-red-400 animate-bounce max-w-sm w-full">
          <div className="text-4xl mb-2 animate-pulse">⚠️</div>
          <p className="text-red-700 mb-4 text-lg font-bold">{authError}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-full hover:from-orange-600 hover:to-red-600 transition-all duration-300 shadow-lg text-base font-bold"
          >
            🔄 Retry
          </button>
        </div>
      </div>
    );
  }

  if (!student) {
    return (
      <div className="h-[100dvh] bg-gradient-to-br from-orange-400 via-amber-300 to-yellow-200 flex items-center justify-center p-4">
        <div className="text-center bg-white/90 backdrop-blur-sm rounded-3xl p-4 sm:p-6 shadow-2xl border-4 border-orange-400 animate-pulse max-w-sm w-full">
          <div className="text-5xl mb-3">🔐</div>
          <p className="text-orange-800 mb-3 text-lg font-bold">
            Please log in to continue
          </p>
          <div className="text-sm text-orange-600">
            Access your retro experience!
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="h-[100dvh] bg-gradient-to-br from-orange-400 via-orange-300 to-amber-200 flex items-center justify-center p-4">
        <div className="text-center bg-white/90 backdrop-blur-sm rounded-3xl p-4 sm:p-6 shadow-2xl border-4 border-orange-400 max-w-sm w-full">
          <div className="relative mb-4">
            <div className="animate-spin rounded-full h-16 w-16 sm:h-24 sm:w-24 border-6 border-orange-200 border-t-orange-500 mx-auto"></div>
            <div className="absolute inset-0 animate-pulse rounded-full h-16 w-16 sm:h-24 sm:w-24 bg-orange-100 mx-auto opacity-30"></div>
          </div>
          <p className="text-lg font-bold text-orange-800 animate-bounce">
            Setting up your profile...
          </p>
          <div className="mt-1 text-sm text-orange-600">
            Almost ready for the retro vibes!
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-[100dvh] bg-gradient-to-br from-orange-400 via-orange-300 to-amber-200 relative overflow-hidden">
      {/* Animated Background Elements - Hidden on small screens */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none hidden sm:block">
        <div className="absolute top-10 left-10 w-10 h-10 bg-white/20 rounded-full animate-bounce animation-delay-1000"></div>
        <div className="absolute top-32 right-20 w-8 h-8 bg-orange-200/30 rounded-full animate-pulse"></div>
        <div className="absolute bottom-20 left-1/4 w-12 h-12 bg-amber-200/20 rounded-full animate-bounce animation-delay-2000"></div>
        <div className="absolute bottom-40 right-1/3 w-6 h-6 bg-white/25 rounded-full animate-ping animation-delay-3000"></div>
      </div>

      <div className="h-full flex flex-col p-2 sm:p-3 relative z-10">
        <div className="flex-1 max-w-2xl mx-auto w-full flex flex-col">
          {/* Header - More Compact */}
          <div className="text-center mb-1 sm:mb-2 animate-fade-in">
            <div className="bg-white/90 backdrop-blur-sm rounded-xl p-2 shadow-xl border border-orange-400 transform hover:scale-105 transition-all duration-300">
              <h1 className="text-base sm:text-lg font-black bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">
                🕺 Gala with me! 💃
              </h1>
              <div className="flex justify-between items-center mt-1">
                <div className="flex-1"></div>
                <div className="flex-1 flex justify-center">
                  <p className="text-xs text-orange-800 font-bold truncate">
                    Welcome, {user.name}!
                  </p>
                </div>
                <div className="flex-1 flex justify-end">
                  <button
                    onClick={logout}
                    className="px-2 py-1 bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-full text-xs hover:from-red-600 hover:to-orange-600 transform hover:scale-105 transition-all duration-300 shadow-md font-bold"
                  >
                    Log Out
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Error Display - Compact Modal */}
          {error && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
              {/* Backdrop */}
              <div
                className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                onClick={() => setError("")}
              ></div>

              {/* Modal content */}
              <div className="relative z-10 w-full max-w-md transform animate-shake">
                <div className="p-3 bg-gradient-to-r from-red-100 to-orange-100 border-2 border-red-400 text-red-800 rounded-2xl shadow-xl">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center flex-1">
                      <span className="text-lg mr-2 animate-bounce">❌</span>
                      <span className="font-bold text-xs sm:text-sm">
                        {error}
                      </span>
                    </div>
                    <button
                      onClick={() => setError("")}
                      className="text-red-700 hover:text-red-900 ml-4"
                    >
                      <span className="text-xl">×</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Success Display - Smaller */}
          {success && mode !== "matched" && (
            <div className="mb-2 animate-bounce">
              <div className="p-2 bg-gradient-to-r from-green-100 to-lime-100 border-2 border-green-400 text-green-800 rounded-2xl shadow-lg backdrop-blur-sm">
                <div className="flex items-center">
                  <span className="text-lg mr-2 animate-pulse">✅</span>
                  <span className="font-bold text-xs sm:text-sm truncate">
                    {success}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Main Content - More compact */}
          <div className="flex-1 bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl border-2 border-orange-400 overflow-hidden transform hover:scale-[1.02] transition-all duration-300">
            <div className="bg-gradient-to-r from-orange-500 to-amber-500 p-0.5 h-full">
              <div className="bg-white rounded-2xl h-full flex flex-col">
                <div className="flex-1 p-3 overflow-hidden">
                  {mode === "clock" && (
                    <div className="animate-fade-in h-full flex flex-col">
                      <div className="flex-1">
                        <div className="mt-2">
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
                          className="mt-1 flex flex-row justify-center space-x-3 animate-slide-up"
                        >
                          <button
                            onClick={() => setMode("show-qr")}
                            className="px-3 py-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-full hover:from-orange-600 hover:to-orange-700 transform hover:scale-105 transition-all duration-300 shadow-lg font-bold text-xs sm:text-sm flex items-center justify-center"
                          >
                            <span>Generate QR</span>
                          </button>
                          <button
                            onClick={() => setMode("scan-qr")}
                            className="px-3 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-full hover:from-green-600 hover:to-emerald-700 transform hover:scale-105 transition-all duration-300 shadow-lg font-bold text-xs sm:text-sm flex items-center justify-center"
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
                    <div className="h-full">
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
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slide-up {
          from {
            opacity: 0;
            transform: translateY(15px);
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
          height: 100%;
        }
      `}</style>
    </div>
  );
}
