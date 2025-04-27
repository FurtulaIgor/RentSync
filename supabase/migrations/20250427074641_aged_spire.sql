/*
  # Initial schema setup for RentSync

  1. New Tables
    - `guests` - Store guest information
      - `id` (Primary key, UUID)
      - `name` (Guest's full name)
      - `email` (Guest's email address)
      - `phone` (Guest's phone number)
      - `notes` (Optional notes about guest)
      - `created_at` (Timestamp of creation)
      - `updated_at` (Timestamp of last update)
      - `user_id` (References the authenticated user)
      
    - `bookings` - Store booking information
      - `id` (Primary key, UUID)
      - `guest_id` (Foreign key to guests table)
      - `check_in_date` (Date of check-in)
      - `check_out_date` (Date of check-out)
      - `price` (Booking price)
      - `notes` (Optional notes about booking)
      - `created_at` (Timestamp of creation)
      - `updated_at` (Timestamp of last update)
      - `user_id` (References the authenticated user)
      
  2. Security
    - Enable RLS on all tables
    - Add policies for CRUD operations
    - Each user can only access their own data
*/

-- Create guests table
CREATE TABLE IF NOT EXISTS guests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Create bookings table
CREATE TABLE IF NOT EXISTS bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  guest_id UUID NOT NULL REFERENCES guests(id) ON DELETE CASCADE,
  check_in_date DATE NOT NULL,
  check_out_date DATE NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Enable Row Level Security
ALTER TABLE guests ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

-- Create policies for guests table
CREATE POLICY "Users can create their own guests"
  ON guests
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own guests"
  ON guests
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own guests"
  ON guests
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own guests"
  ON guests
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create policies for bookings table
CREATE POLICY "Users can create their own bookings"
  ON bookings
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own bookings"
  ON bookings
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own bookings"
  ON bookings
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own bookings"
  ON bookings
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_guests_user_id ON guests(user_id);
CREATE INDEX IF NOT EXISTS idx_bookings_user_id ON bookings(user_id);
CREATE INDEX IF NOT EXISTS idx_bookings_guest_id ON bookings(guest_id);
CREATE INDEX IF NOT EXISTS idx_bookings_dates ON bookings(check_in_date, check_out_date);