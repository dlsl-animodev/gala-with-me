"use client";

import { useState } from "react";
import { useAuth } from "../context/auth-context";
import Clock from "./clock";

export default function RegistrationPage() {
  const [studentId, setStudentId] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { student, login, createOrUpdateUser } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch(
        `https://dlsl-student-api-2hgc.onrender.com/api/student?id=${studentId}`
      );

      if (!response.ok) {
        setError("Student ID not found.");
        return;
      }

      const data = await response.json();

      if (data.email_address && data.partner_id) {
        const newStudent = {
          id: data.partner_id,
          name: data.email_address
            .split("@")[0]
            .split("_")
            .map(
              (part: string) =>
                part.charAt(0).toUpperCase() + part.slice(1).toLowerCase()
            )
            .join(" "),
          department: data.department || "Unknown",
        };

        // log in the student first
        login(newStudent);

        createOrUpdateUser({
          department: data.department || "Unknown",
          id: data.partner_id || "",
          name: data.email_address
            .split("@")[0]
            .split("_")
            .map(
              (part: string) =>
                part.charAt(0).toUpperCase() + part.slice(1).toLowerCase()
            )
            .join(" "),
        }).catch((err) => {
          console.error("Failed to create user profile:", err);
        });
      } else {
        setError("Invalid student data.");
      }
    } catch (err) {
      console.error(err);
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // If already logged in, show clock
  if (student) {
    return <Clock />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-400 via-orange-500 to-orange-600 p-4">
      <div className="w-full max-w-md">
        {/* Main Card */}
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border-4 border-orange-300">
          {/* Header Section */}
          <div className="bg-gradient-to-r from-orange-500 to-orange-600 px-8 py-6 text-center">
            <h1 className="text-3xl font-black text-white mb-2 tracking-wider transform -skew-x-2">
              Gala With Me
            </h1>
            <p className="text-orange-100 font-semibold text-lg">
              Student Check-In
            </p>
          </div>

          {/* Form Section */}
          <div className="p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Student ID Input */}
              <div className="space-y-2">
                <label className="block text-orange-800 font-bold text-sm uppercase tracking-wide">
                  Student ID
                </label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Enter your Student ID"
                    value={studentId}
                    onChange={(e) => setStudentId(e.target.value)}
                    className="w-full border-4 border-orange-300 focus:border-orange-500 px-4 py-3 rounded-xl text-gray-800 font-semibold text-lg placeholder-orange-300 focus:outline-none focus:ring-4 focus:ring-orange-200 transition-all duration-200 transform focus:scale-105"
                    required
                    disabled={loading}
                  />
                  <div className="absolute inset-0 rounded-xl border-2 border-white opacity-20 pointer-events-none"></div>
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div className="bg-red-100 border-2 border-red-300 rounded-xl p-4 text-center">
                  <p className="text-red-700 font-bold">{error}</p>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-black text-xl py-4 rounded-xl shadow-lg transform transition-all duration-200 hover:scale-105 hover:shadow-xl disabled:opacity-50 disabled:transform-none disabled:hover:scale-100 border-3 border-orange-400 uppercase tracking-wider"
              >
                {loading ? (
                  <div className="flex items-center justify-center space-x-3">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                    <span>Checking...</span>
                  </div>
                ) : (
                  "LET'S GO!"
                )}
              </button>
            </form>

            {/* Footer */}
            <div className="mt-6 text-center">
              <p className="text-orange-600 font-semibold text-sm">
                Ready to find your perfect match?
              </p>
            </div>
          </div>
        </div>

        {/* Decorative Elements */}
        <div className="mt-4 flex justify-center space-x-2">
          <div className="w-3 h-3 bg-white rounded-full opacity-60"></div>
          <div className="w-3 h-3 bg-orange-200 rounded-full opacity-80"></div>
          <div className="w-3 h-3 bg-white rounded-full opacity-60"></div>
        </div>
      </div>
    </div>
  );
}
