/*
  # Create event_registrations table
  
  1. New Tables
    - `event_registrations`
      - `id` (uuid, primary key)
      - `event_id` (uuid, references events)
      - `attendee_email` (text)
      - `attendee_name` (text, optional)
      - `attendee_phone` (text, optional)
      - `registration_date` (timestamptz)
      - `payment_status` (text, enum)
      - `payment_reference` (text, optional)
      - `ticket_type` (text, optional)
      - `amount_paid` (decimal)
      - `currency` (text, default 'GHS')
      - `status` (text, enum)
      - `check_in_time` (timestamptz, optional)
      - `metadata` (jsonb, optional)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
  
  2. Security
    - Enable RLS on `event_registrations` table
    - Add policy for anyone to register (insert)
    - Add policy for public read access to confirmed registrations
    - Add policy for organizers to view/update their event registrations
  
  3. Important Notes
    - This table tracks event registrations and ticket purchases
    - Replaces the `event_tickets` table for better registration management
    - Supports payment tracking and check-in functionality
*/

-- Create event_registrations table
CREATE TABLE IF NOT EXISTS event_registrations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  attendee_email text NOT NULL,
  attendee_name text,
  attendee_phone text,
  registration_date timestamptz DEFAULT now(),
  payment_status text DEFAULT 'pending' CHECK (payment_status IN ('pending', 'completed', 'failed', 'refunded')),
  payment_reference text,
  ticket_type text,
  amount_paid decimal(10,2) DEFAULT 0,
  currency text DEFAULT 'GHS',
  status text DEFAULT 'confirmed' CHECK (status IN ('confirmed', 'cancelled', 'waitlist')),
  check_in_time timestamptz,
  metadata jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(event_id, attendee_email)
);

-- Enable Row Level Security
ALTER TABLE event_registrations ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Anyone can register for events"
  ON event_registrations
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Public can view confirmed registrations"
  ON event_registrations
  FOR SELECT
  TO anon, authenticated
  USING (status = 'confirmed');

CREATE POLICY "Organizers can view registrations for their events"
  ON event_registrations
  FOR SELECT
  TO authenticated
  USING (
    event_id IN (
      SELECT id FROM events WHERE organizer_id = auth.uid()
    )
  );

CREATE POLICY "Organizers can update registrations for their events"
  ON event_registrations
  FOR UPDATE
  TO authenticated
  USING (
    event_id IN (
      SELECT id FROM events WHERE organizer_id = auth.uid()
    )
  )
  WITH CHECK (
    event_id IN (
      SELECT id FROM events WHERE organizer_id = auth.uid()
    )
  );

-- Create trigger for updated_at
CREATE TRIGGER update_event_registrations_updated_at
  BEFORE UPDATE ON event_registrations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_event_registrations_event_id ON event_registrations(event_id);
CREATE INDEX IF NOT EXISTS idx_event_registrations_email ON event_registrations(attendee_email);
CREATE INDEX IF NOT EXISTS idx_event_registrations_status ON event_registrations(status);
CREATE INDEX IF NOT EXISTS idx_event_registrations_payment_status ON event_registrations(payment_status);
CREATE INDEX IF NOT EXISTS idx_event_registrations_registration_date ON event_registrations(registration_date);
