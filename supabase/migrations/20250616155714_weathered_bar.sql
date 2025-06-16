/*
  # Create events system tables

  1. New Tables
    - `events`
      - `id` (uuid, primary key)
      - `organizer_id` (uuid, references organizers)
      - `title` (text)
      - `description` (text)
      - `start_date` (timestamptz)
      - `end_date` (timestamptz)
      - `location` (text)
      - `venue_name` (text)
      - `capacity` (integer)
      - `price` (decimal)
      - `currency` (text, default 'USD')
      - `category` (text)
      - `status` (text, default 'draft')
      - `image_url` (text)
      - `is_published` (boolean, default false)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

    - `event_tickets`
      - `id` (uuid, primary key)
      - `event_id` (uuid, references events)
      - `attendee_name` (text)
      - `attendee_email` (text)
      - `ticket_type` (text, default 'general')
      - `price_paid` (decimal)
      - `purchase_date` (timestamptz)
      - `checked_in` (boolean, default false)
      - `check_in_date` (timestamptz)

    - `event_analytics`
      - `id` (uuid, primary key)
      - `event_id` (uuid, references events)
      - `date` (date)
      - `tickets_sold` (integer, default 0)
      - `revenue` (decimal, default 0)
      - `views` (integer, default 0)

  2. Security
    - Enable RLS on all tables
    - Add policies for organizers to manage their own events
    - Add policies for public read access to published events
*/

-- Create events table
CREATE TABLE IF NOT EXISTS events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organizer_id uuid NOT NULL REFERENCES organizers(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  start_date timestamptz NOT NULL,
  end_date timestamptz NOT NULL,
  location text NOT NULL,
  venue_name text,
  capacity integer DEFAULT 100,
  price decimal(10,2) DEFAULT 0,
  currency text DEFAULT 'USD',
  category text DEFAULT 'Other',
  status text DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'cancelled', 'completed')),
  image_url text,
  is_published boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create event_tickets table
CREATE TABLE IF NOT EXISTS event_tickets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  attendee_name text NOT NULL,
  attendee_email text NOT NULL,
  ticket_type text DEFAULT 'general',
  price_paid decimal(10,2) DEFAULT 0,
  purchase_date timestamptz DEFAULT now(),
  checked_in boolean DEFAULT false,
  check_in_date timestamptz
);

-- Create event_analytics table
CREATE TABLE IF NOT EXISTS event_analytics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  date date DEFAULT CURRENT_DATE,
  tickets_sold integer DEFAULT 0,
  revenue decimal(10,2) DEFAULT 0,
  views integer DEFAULT 0,
  UNIQUE(event_id, date)
);

-- Enable Row Level Security
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_analytics ENABLE ROW LEVEL SECURITY;

-- Events policies
CREATE POLICY "Organizers can manage own events"
  ON events
  FOR ALL
  TO authenticated
  USING (organizer_id IN (SELECT id FROM organizers WHERE id = auth.uid()));

CREATE POLICY "Public can read published events"
  ON events
  FOR SELECT
  TO anon, authenticated
  USING (is_published = true);

-- Event tickets policies
CREATE POLICY "Organizers can manage tickets for own events"
  ON event_tickets
  FOR ALL
  TO authenticated
  USING (event_id IN (SELECT id FROM events WHERE organizer_id = auth.uid()));

-- Event analytics policies
CREATE POLICY "Organizers can view analytics for own events"
  ON event_analytics
  FOR ALL
  TO authenticated
  USING (event_id IN (SELECT id FROM events WHERE organizer_id = auth.uid()));

-- Create triggers for updated_at
CREATE TRIGGER update_events_updated_at
  BEFORE UPDATE ON events
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_events_organizer ON events(organizer_id);
CREATE INDEX IF NOT EXISTS idx_events_status ON events(status);
CREATE INDEX IF NOT EXISTS idx_events_published ON events(is_published);
CREATE INDEX IF NOT EXISTS idx_events_start_date ON events(start_date);
CREATE INDEX IF NOT EXISTS idx_events_category ON events(category);

CREATE INDEX IF NOT EXISTS idx_tickets_event ON event_tickets(event_id);
CREATE INDEX IF NOT EXISTS idx_tickets_email ON event_tickets(attendee_email);
CREATE INDEX IF NOT EXISTS idx_tickets_checked_in ON event_tickets(checked_in);

CREATE INDEX IF NOT EXISTS idx_analytics_event ON event_analytics(event_id);
CREATE INDEX IF NOT EXISTS idx_analytics_date ON event_analytics(date);

-- Function to update analytics when tickets are sold
CREATE OR REPLACE FUNCTION update_event_analytics()
RETURNS TRIGGER AS $$
BEGIN
  -- Update analytics for the event
  INSERT INTO event_analytics (event_id, date, tickets_sold, revenue)
  VALUES (NEW.event_id, CURRENT_DATE, 1, NEW.price_paid)
  ON CONFLICT (event_id, date)
  DO UPDATE SET
    tickets_sold = event_analytics.tickets_sold + 1,
    revenue = event_analytics.revenue + NEW.price_paid;
  
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for analytics updates
CREATE TRIGGER update_analytics_on_ticket_sale
  AFTER INSERT ON event_tickets
  FOR EACH ROW
  EXECUTE FUNCTION update_event_analytics();