"use client";

import { createContext, useContext, useState, useEffect } from "react";

interface Student {
  id: string;
  name: string;
}

interface AuthContextType {
  student: Student | null;
  login: (student: Student) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [student, setStudent] = useState<Student | null>(null);

  // Load from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("student");
    if (saved) {
      setStudent(JSON.parse(saved));
    }
  }, []);

  // Save to localStorage
  useEffect(() => {
    if (student) {
      localStorage.setItem("student", JSON.stringify(student));
    } else {
      localStorage.removeItem("student");
    }
  }, [student]);

  const login = (student: Student) => {
    setStudent(student);
  };

  const logout = () => {
    setStudent(null);
  };

  return (
    <AuthContext.Provider value={{ student, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
