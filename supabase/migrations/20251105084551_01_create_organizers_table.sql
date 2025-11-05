/*
  # Create organizers table and authentication setup

  1. New Tables
    - `organizers`
      - `id` (uuid, primary key, references auth.users)
      - `first_name` (text)
      - `last_name` (text)
      - `email` (text, unique)
      - `organization_name` (text)
      - `phone` (text, optional)
      - `location` (text, optional)
      - `event_types` (text array)
      - `profile_completed` (boolean, default false)
      - `is_verified` (boolean, default false)
      - `avatar_url` (text, optional)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `organizers` table
    - Add policies for organizers to manage their own data
    - Add policy for public read access to verified organizers
*/

-- Create organizers table
CREATE TABLE IF NOT EXISTS organizers (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  first_name text NOT NULL,
  last_name text NOT NULL,
  email text UNIQUE NOT NULL,
  organization_name text NOT NULL,
  phone text,
  location text,
  event_types text[] DEFAULT '{}',
  profile_completed boolean DEFAULT false,
  is_verified boolean DEFAULT false,
  avatar_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE organizers ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Organizers can read own data"
  ON organizers
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Organizers can insert own data"
  ON organizers
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Organizers can update own data"
  ON organizers
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Public can read verified organizers"
  ON organizers
  FOR SELECT
  TO anon
  USING (is_verified = true);

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_organizers_updated_at
  BEFORE UPDATE ON organizers
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_organizers_email ON organizers(email);
CREATE INDEX IF NOT EXISTS idx_organizers_organization ON organizers(organization_name);
CREATE INDEX IF NOT EXISTS idx_organizers_location ON organizers(location);
CREATE INDEX IF NOT EXISTS idx_organizers_verified ON organizers(is_verified);
CREATE INDEX IF NOT EXISTS idx_organizers_created_at ON organizers(created_at);
