export interface Attendance {
  studentId: string;
  fullName: string;
  department: string;
  email: string;
  timestamp: string;
}

export interface Student {
  email_address: string;
  department: string;
  photoUrl: string | null;
  fullName: string; // Derived from email or other source
  partner_id: string; // The "real" unique student identifier from the API
}

export interface Event {
  id: string;
  name: string;
  date: string;
  description: string;
  attendees: Attendance[];
}
