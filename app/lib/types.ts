export interface Student {
  email_address: string;
  department: string;
  photoUrl: string | null;
  fullName: string;
  partner_id: string;
}

export interface User {
  id: string;
  student_id: string;
  name: string;
  department: string;
  preferred_time: number | null;
  created_at: string;
}

export interface Match {
  id: number;
  users1_id: string;
  users2_id: string;
  agreed_time: number;
  created_at: string;
}
