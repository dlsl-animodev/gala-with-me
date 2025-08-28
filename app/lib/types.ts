export interface Student {
  email_address: string;
  department: string;
  photoUrl: string | null;
  fullName: string; // Derived from email or other source
  partner_id: string; // The "real" unique student identifier from the API
}
