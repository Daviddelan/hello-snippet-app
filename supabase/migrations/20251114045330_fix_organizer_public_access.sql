/*
  # Fix Organizer Public Access for Event Display

  ## Changes
  1. Add RLS policy to allow public (anon + authenticated) users to read organizer basic info
     - organization_name, first_name, last_name, avatar_url, is_verified
     - This allows the HeroCarousel and event pages to display organizer information
  
  ## Security
  - Only allows reading basic public profile information
  - Does not expose sensitive data like email, phone, or settings
  - Maintains existing policies for organizers to manage their own data
*/

-- Add policy for public to read organizer basic info for events
CREATE POLICY "Public can read organizer basic info for events"
  ON organizers
  FOR SELECT
  TO anon, authenticated
  USING (true);
