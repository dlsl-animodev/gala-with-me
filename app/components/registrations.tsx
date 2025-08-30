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
    <div
      className="min-h-screen flex items-center justify-center 
                 [background:repeating-linear-gradient(0deg,#0d0d0d,#0d0d0d_2px,#111111_2px,#111111_4px)]"
    >
      {/* Device-like wrapper */}
      <form
        onSubmit={handleSubmit}
        className="relative bg-[#1a1a1a] border-4 border-[#ff6b00] 
                   shadow-[0_0_25px_#cc5500,0_0_50px_#ff6b00] 
                   p-6 rounded-xl w-full max-w-sm text-center 
                   font-[var(--font-retro)]"
      >
        {/* Fake status LED */}
        <div className="absolute top-2 right-2 w-3 h-3 rounded-full bg-[#ff3c00] animate-pulse shadow-[0_0_10px_#ff3c00]"></div>

        {/* Title bar */}
        <h1
          className="text-[14px] mb-6 text-[#ffaa55] 
                     [text-shadow:0_0_5px_#ff6b00,0_0_10px_#ffaa55] 
                     uppercase tracking-wider"
        >
          🕹️ Student Check-In
        </h1>

        {/* Input field */}
        <input
          type="text"
          placeholder="Enter Student ID"
          value={studentId}
          onChange={(e) => setStudentId(e.target.value)}
          className="w-full px-3 py-3 mb-4 
                     border-2 border-[#ff6b00] rounded-md 
                     bg-black text-[#ffaa55] text-[12px] 
                     font-[var(--font-retro)] text-center 
                     placeholder:text-gray-600 placeholder:text-[10px] 
                     focus:outline-none focus:border-[#ffaa55] 
                     focus:shadow-[0_0_10px_#ffaa55]"
          required
          disabled={loading}
        />

        {/* Error message */}
        {error && (
          <p className="text-[#ff3c00] text-[10px] mb-4 font-[var(--font-retro)] animate-pulse">
            {error}
          </p>
        )}

        {/* Submit button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-[#ff6b00] py-3 rounded-md 
                     text-black text-[12px] font-[var(--font-retro)] 
                     shadow-[0_0_10px_#cc5500] transition duration-200 
                     hover:enabled:bg-[#cc5500] 
                     hover:enabled:shadow-[0_0_20px_#ffaa55] 
                     active:enabled:scale-95 
                     disabled:bg-[#444] disabled:text-[#999] disabled:shadow-none
                     disabled:cursor-not-allowed"
        >
          {loading ? "⌛ Checking..." : "▶ Submit"}
        </button>
      </form>
    </div>
  );
}
