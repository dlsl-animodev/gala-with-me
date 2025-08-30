"use client";

import { User } from "../lib/supabase";

interface MatchResultProps {
  matchedUser: User;
  success: string;
  onStartOver: () => void;
}

export default function MatchResult({ matchedUser, success, onStartOver }: MatchResultProps) {
  return (
    <div className="flex flex-col items-center space-y-6">
      <h2 className="text-3xl font-bold text-center text-green-600">
        It&apos;s a Match! 
      </h2>
      
      <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
        <p className="text-lg mb-2">{success}</p>
        <div className="space-y-1 text-gray-700">
          <p><strong>Matched with:</strong> {matchedUser.name}</p>
          <p><strong>Department:</strong> {matchedUser.department}</p>
          <p><strong>Student ID:</strong> {matchedUser.student_id}</p>
        </div>
      </div>

      <div className="flex flex-col items-center space-y-2 text-center">
        <p className="text-sm text-gray-600">
          Great! You both selected the same time preference.
        </p>
        <p className="text-sm text-gray-600">
          Consider reaching out to coordinate your plans!
        </p>
      </div>

      <button
        onClick={onStartOver}
        className="px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        Start Over
      </button>
    </div>
  );
}
