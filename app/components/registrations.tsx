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
          name: data.email_address.split("@")[0].replace("_", " "),
        };

        login(newStudent);

        createOrUpdateUser({
          department: data.department || "Unknown",
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

  if (student) {
    return <Clock />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f5f5f5] p-4">
      <form
        onSubmit={handleSubmit}
        className="relative w-full max-w-sm p-8 bg-white rounded-2xl 
                   border-4 border-[#ff6b00] shadow-[0_0_20px_rgba(255,107,0,0.4)] 
                   text-center font-[var(--font-retro)] transition-transform duration-300 
                   hover:scale-105"
      >
        {/* Status LED */}
        <div className="absolute top-3 right-3 w-4 h-4 rounded-full 
                        bg-[#ff6b00] shadow-[0_0_10px_#ff6b00] animate-pulse"></div>

        {/* Title */}
        <h1 className="text-[#ff6b00] text-xl mb-6 uppercase tracking-widest 
                       [text-shadow:0_0_3px_#ff6b00,0_0_10px_#ff9f55] animate-pulse">
          ⚡ Student Check-In
        </h1>

        {/* Input */}
        <input
          type="text"
          placeholder="Enter Student ID"
          value={studentId}
          onChange={(e) => setStudentId(e.target.value)}
          className="w-full py-3 px-4 mb-4 text-center text-black bg-[#fff7f0] 
                     border-2 border-[#ff6b00] rounded-lg text-sm placeholder:text-gray-400 
                     placeholder:text-xs focus:outline-none focus:border-[#ffaa55] 
                     focus:shadow-[0_0_10px_#ffaa55] transition duration-200"
          required
          disabled={loading}
        />

        {/* Error Message */}
        {error && (
          <p className="text-[#ff3c00] text-xs mb-4 animate-pulse">{error}</p>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 rounded-lg bg-[#ff6b00] text-white font-bold text-sm 
                     shadow-[0_0_10px_#ff9f55] transition-all duration-200 
                     hover:enabled:bg-[#ffaa55] hover:enabled:shadow-[0_0_15px_#ff6b00] 
                     active:enabled:scale-95 disabled:bg-gray-300 disabled:text-gray-500 
                     disabled:cursor-not-allowed"
        >
          {loading ? "⌛ Checking..." : "▶ Submit"}
        </button>

        {/* Retro Cube Decoration */}
        <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 w-12 h-12 
                        border-4 border-[#ff6b00] rotate-45 animate-bounce shadow-[0_0_15px_#ff6b00]"></div>
      </form>
    </div>
  );
}
