"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { supabase, User } from "../lib/supabase";

interface Student {
  id: string;
  name: string;
}

interface StudentData {
  department?: string;
}

interface AuthContextType {
  student: Student | null;
  user: User | null;
  loading: boolean;
  error: string | null;
  login: (student: Student) => void;
  logout: () => void;
  createOrUpdateUser: (studentData: StudentData) => Promise<User | null>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [student, setStudent] = useState<Student | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

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

  // Load user from Supabase when student changes
  useEffect(() => {
    const loadUser = async () => {
      if (!student) {
        setUser(null);
        setLoading(false);
        setError(null);
        return;
      }

      console.log('Loading user for student:', student);
      setLoading(true);
      setError(null);

      try {
        // Add timeout to prevent hanging
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Database connection timeout')), 10000)
        );

        const queryPromise = supabase
          .from('users')
          .select('*')
          .eq('student_id', student.id);

        const result = await Promise.race([queryPromise, timeoutPromise]);
        const { data, error } = result as { data: User[] | null; error: { code?: string; message: string } | null };

        if (error) {
          console.error('Error loading user:', error);
          setError(`Database error: ${error.message}`);
          setLoading(false);
          return;
        }

        // Check if user exists
        if (data && data.length > 0) {
          console.log('Found existing user:', data[0]);
          setUser(data[0]);
        } else {
          console.log('No existing user found, will need to create one');
          setUser(null);
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Error loading user:', err);
        setError(err instanceof Error ? err.message : 'Failed to load user profile');
        setLoading(false);
      }
    };

    loadUser();
  }, [student]);

  const createOrUpdateUser = async (studentData: StudentData): Promise<User | null> => {
    if (!student) return null;

    console.log('Creating/updating user for:', student, 'with data:', studentData);
    setLoading(true);
    setError(null);

    try {
      const userData = {
        student_id: student.id,
        name: student.name,
        department: studentData.department || 'Unknown',
        preferred_time: null,
      };

      console.log('Checking if user exists first...');

      // First, check if user already exists
      const { data: existingUsers, error: checkError } = await supabase
        .from('users')
        .select('*')
        .eq('student_id', student.id);

      if (checkError) {
        console.error('Error checking existing user:', checkError);
        setError(`Failed to check user: ${checkError.message}`);
        setLoading(false);
        return null;
      }

      console.log('Existing users found:', existingUsers);

      let result;
      if (existingUsers && existingUsers.length > 0) {

        console.log('User already exists, using existing record:', existingUsers[0]);
        setUser(existingUsers[0]);
        setLoading(false);
        return existingUsers[0];
      } else {
        // create new user
        console.log('Creating new user with data:', userData);
        const { data, error } = await supabase
          .from('users')
          .insert(userData)
          .select()
          .single();
        result = { data, error };
      }

      const { data, error } = result;

      if (error) {
        console.error('Error creating user:', error);
        
        // redundant rls t__T
        if (error.code === '42501') {
          setError('Database security error: Please check your Supabase Row Level Security policies.');
        } else {
          setError(`Failed to create profile: ${error.message}`);
        }
        
        setLoading(false);
        return null;
      }

      console.log('Successfully created user:', data);
      setUser(data);
      setLoading(false);
      return data;
    } catch (err) {
      console.error('Error creating/updating user:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to create user profile';
      setError(errorMessage);
      setLoading(false);
      return null;
    }
  };

  const login = (student: Student) => {
    setStudent(student);
  };

  const logout = () => {
    setStudent(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ student, user, loading, error, login, logout, createOrUpdateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
