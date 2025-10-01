-- Create event_registrations table to track registrations
-- This migration adds a table to track who registered for which events

-- Create event_registrations table
CREATE TABLE IF NOT EXISTS event_registrations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    user_email VARCHAR(255) NOT NULL,
    user_name VARCHAR(255) NOT NULL,
    user_phone VARCHAR(20),
    registration_status VARCHAR(20) DEFAULT 'confirmed' CHECK (registration_status IN ('pending', 'confirmed', 'cancelled')),
    payment_status VARCHAR(20) DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded')),
    payment_reference VARCHAR(255),
    amount_paid DECIMAL(10,2) DEFAULT 0,
    currency VARCHAR(3) DEFAULT 'GHS',
    registered_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Ensure unique registration per email per event
    UNIQUE(event_id, user_email)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_event_registrations_event_id ON event_registrations(event_id);
CREATE INDEX IF NOT EXISTS idx_event_registrations_email ON event_registrations(user_email);
CREATE INDEX IF NOT EXISTS idx_event_registrations_status ON event_registrations(registration_status);

-- Enable RLS
ALTER TABLE event_registrations ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Allow public to insert registrations (for registration process)
CREATE POLICY "Anyone can register for events" ON event_registrations
    FOR INSERT 
    WITH CHECK (true);

-- Allow public to view registration counts (for displaying attendee counts)
CREATE POLICY "Public read access to registration counts" ON event_registrations
    FOR SELECT 
    USING (registration_status = 'confirmed');

-- Allow organizers to view registrations for their events
CREATE POLICY "Organizers can view registrations for their events" ON event_registrations
    FOR SELECT 
    USING (
        event_id IN (
            SELECT id FROM events WHERE organizer_id = auth.uid()
        )
    );

-- Allow organizers to update registrations for their events (e.g., confirm payments)
CREATE POLICY "Organizers can update registrations for their events" ON event_registrations
    FOR UPDATE 
    USING (
        event_id IN (
            SELECT id FROM events WHERE organizer_id = auth.uid()
        )
    );

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_event_registrations_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for updated_at
DROP TRIGGER IF EXISTS update_event_registrations_updated_at ON event_registrations;
CREATE TRIGGER update_event_registrations_updated_at
    BEFORE UPDATE ON event_registrations
    FOR EACH ROW
    EXECUTE FUNCTION update_event_registrations_updated_at();
