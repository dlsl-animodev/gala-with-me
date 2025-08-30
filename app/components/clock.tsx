"use client";

import { useState, useEffect } from "react";
import { useAuth } from "../context/auth-context";
import { useMatchHandling } from "../hooks/useMatchHandling";
import TimePicker from "./time-picker";
import QRActions from "./qr-actions";
import MatchResult from "./match-result";
import { Dayjs } from "dayjs";

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
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
          <p className="mt-4 text-lg">Loading...</p>
        </div>
      </div>
    );
  }

  if (authError) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-red-600 mb-4">{authError}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!student) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Please log in to continue</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
          <p className="mt-4 text-lg">Setting up your profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Dating Clock</h1>
          <p className="text-gray-600">Welcome, {user.name}!</p>
          <button
            onClick={logout}
            className="mt-2 px-4 py-2 text-sm bg-red-500 text-white rounded hover:bg-red-600">
            Logout
          </button>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        {/* Success Display */}
        {success && mode !== "matched" && (
          <div className="mb-6 p-4 bg-green-100 border border-green-400 text-green-700 rounded">
            {success}
          </div>
        )}

        {/* Main Content */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          {mode === "clock" && (
            <>
              <TimePicker
                user={user}
                selectedTime={selectedTime}
                onTimeSelect={setSelectedTime}
                isHourMatched={isHourMatched}
              />

              {selectedTime && (
                <div className="mt-6 flex justify-center space-x-4">
                  <button
                    onClick={() => setMode("show-qr")}
                    className="px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
                    Generate QR Code
                  </button>
                  <button
                    onClick={() => setMode("scan-qr")}
                    className="px-6 py-2 bg-green-500 text-white rounded hover:bg-green-600">
                    Scan QR Code
                  </button>
                </div>
              )}
            </>
          )}

          {(mode === "show-qr" || mode === "scan-qr") && (
            <QRActions
              user={user}
              selectedTime={selectedTime}
              mode={mode}
              onScanSuccess={handleScanSuccess}
              onBack={handleBack}
            />
          )}

          {mode === "matched" && matchedUser && (
            <MatchResult
              matchedUser={matchedUser}
              success={success}
              onStartOver={handleStartOver}
            />
          )}
        </div>
      </div>
    </div>
  );
}
