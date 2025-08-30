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
        
        // log in the student first
        login(newStudent);
        
        createOrUpdateUser({
          department: data.department || 'Unknown'
        }).catch(err => {
          console.error('Failed to create user profile:', err);
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
    <div className="h-screen flex items-center justify-center bg-gray-100">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded-lg shadow-md w-full max-w-sm"
      >
        <h1 className="text-xl font-bold mb-4 text-center text-black">Student Check-In</h1>

        <input
          type="text"
          placeholder="Enter Student ID"
          value={studentId}
          onChange={(e) => setStudentId(e.target.value)}
          className="w-full border px-3 py-2 rounded mb-3 text-black"
          required
          disabled={loading}
        />

        {error && <p className="text-red-600 text-sm mb-3">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700 disabled:bg-gray-400"
        >
          {loading ? "Checking..." : "Submit"}
        </button>
      </form>
    </div>
  );
}
