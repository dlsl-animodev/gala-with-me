"use client";

import { useState } from "react";
import { Student } from "../lib/types";

interface RegistrationPageProps {
  onLoginSuccess: (student: Student) => void;
}

export default function RegistrationPage({}: RegistrationPageProps) {
  const [studentId, setStudentId] = useState("");
  const [error, setError] = useState("");
  const [studentName, setStudentName] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

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
        const student: Student = {
          partner_id: data.partner_id,
          email_address: data.email_address,
          department: data.department || "N/A",
          fullName: data.email_address.split("@")[0].replace("_", " "),
          photoUrl: null,
        };
        setStudentName(student.fullName);
      } else {
        setError("Invalid student data.");
      }
    } catch (err) {
      console.error(err);
      setError("Network error. Please try again.");
    }
  };

  return (
    <div className="h-screen flex items-center justify-center bg-gray-100">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded-lg shadow-md w-full max-w-sm"
      >
        <h1 className="text-xl font-bold mb-4 text-center">Student Check-In</h1>

        <input
          type="text"
          placeholder="Enter Student ID"
          value={studentId}
          onChange={(e) => setStudentId(e.target.value)}
          className="w-full border px-3 py-2 rounded mb-3"
          required
        />

        {error && <p className="text-red-600 text-sm mb-3">{error}</p>}

        <button
          type="submit"
          className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700"
        >
          Submit
        </button>
      </form>

      {/* sample display of student id you guys have to implement nav to main page with the clock and it should be connected to the uuid of the supabase thingy :D*/}
      {studentName && (
        <p className="mt-4 text-lg font-semibold text-green-700">
          Hi, {studentName}! 🎉
        </p>
      )}
    </div>
  );
}
