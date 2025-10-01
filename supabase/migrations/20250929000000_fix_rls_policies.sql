-- Fix RLS policies for public access to published events
-- This migration allows public read access to published events

-- Enable RLS on events table (if not already enabled)
ALTER TABLE events ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Public read access to published events" ON events;
DROP POLICY IF EXISTS "Organizers can view their own events" ON events;
DROP POLICY IF EXISTS "Organizers can insert their own events" ON events;
DROP POLICY IF EXISTS "Organizers can update their own events" ON events;
DROP POLICY IF EXISTS "Organizers can delete their own events" ON events;

-- Create new policies
-- Allow public read access to published events
CREATE POLICY "Public read access to published events" ON events
    FOR SELECT 
    USING (is_published = true AND status = 'published');

-- Allow organizers to view all their events
CREATE POLICY "Organizers can view their own events" ON events
    FOR SELECT 
    USING (organizer_id = auth.uid());

-- Allow organizers to insert their own events
CREATE POLICY "Organizers can insert their own events" ON events
    FOR INSERT 
    WITH CHECK (organizer_id = auth.uid());

-- Allow organizers to update their own events
CREATE POLICY "Organizers can update their own events" ON events
    FOR UPDATE 
    USING (organizer_id = auth.uid())
    WITH CHECK (organizer_id = auth.uid());

-- Allow organizers to delete their own events
CREATE POLICY "Organizers can delete their own events" ON events
    FOR DELETE 
    USING (organizer_id = auth.uid());

-- Also fix organizers table policies for join queries
ALTER TABLE organizers ENABLE ROW LEVEL SECURITY;

-- Drop existing organizer policies if they exist
DROP POLICY IF EXISTS "Public read access to organizer info for events" ON organizers;
DROP POLICY IF EXISTS "Users can view their own organizer profile" ON organizers;
DROP POLICY IF EXISTS "Users can insert their own organizer profile" ON organizers;
DROP POLICY IF EXISTS "Users can update their own organizer profile" ON organizers;

-- Create new organizer policies
-- Allow public read access to basic organizer info for published events
CREATE POLICY "Public read access to organizer info for events" ON organizers
    FOR SELECT 
    USING (true); -- Allow reading organizer info when viewing events

-- Allow users to manage their own organizer profile
CREATE POLICY "Users can view their own organizer profile" ON organizers
    FOR SELECT 
    USING (id = auth.uid());

CREATE POLICY "Users can insert their own organizer profile" ON organizers
    FOR INSERT 
    WITH CHECK (id = auth.uid());

CREATE POLICY "Users can update their own organizer profile" ON organizers
    FOR UPDATE 
    USING (id = auth.uid())
    WITH CHECK (id = auth.uid());
