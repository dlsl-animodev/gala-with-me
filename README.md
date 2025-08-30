# Dating Clock

A Next.js application where users can match with others by selecting their preferred time on a clock interface and sharing QR codes.

## Features

- Student authentication via external API
- Interactive clock interface for time selection
- QR code generation and scanning for matching
- Real-time match notifications
- Supabase database integration

## Setup

1. **Install dependencies:**
   ```bash
   bun install
   ```

2. **Set up Supabase:**
   - Create a Supabase project at [supabase.com](https://supabase.com)
   - Create the required tables (see Database Schema below)
   - Copy your project URL and anon key

3. **Environment variables:**
   - Copy `.env.example` to `.env.local`
   - Add your Supabase credentials:
     ```
     NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
     NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
     ```

4. **Run the development server:**
   ```bash
   bun dev
   ```

## Database Schema

Create these tables in your Supabase project:

### Users Table
```sql
CREATE TABLE users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  department TEXT NOT NULL,
  preferred_time INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Matches Table
```sql
CREATE TABLE matches (
  id SERIAL PRIMARY KEY,
  users1_id UUID REFERENCES users(id) ON DELETE CASCADE,
  users2_id UUID REFERENCES users(id) ON DELETE CASCADE,
  agreed_time INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## How it Works

1. **Authentication:** Users enter their student ID, which is validated against an external API
2. **Time Selection:** Users select their preferred hour (1-12) on an interactive clock
3. **QR Code Generation:** Users can generate a QR code containing their user ID and selected time
4. **QR Code Scanning:** Users can scan another person's QR code to attempt a match
5. **Matching:** If both users selected the same time, a match is created in the database
6. **Real-time Updates:** Users are notified of matches in real-time via Supabase subscriptions

## Technologies Used

- Next.js 15
- React 19
- TypeScript
- Tailwind CSS
- Supabase (Database & Real-time)
- QR Code generation and scanning
- Bun package manager
