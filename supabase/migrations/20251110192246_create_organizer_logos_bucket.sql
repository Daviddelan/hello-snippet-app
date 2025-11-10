/*
  # Create Organizer Logos Storage Bucket

  ## Overview
  Creates a dedicated storage bucket for organizer logos with appropriate security policies.

  ## Changes
  1. **Storage Bucket**
     - Creates `organizer-logos` bucket
     - Public access enabled for viewing logos
     - 5MB file size limit (suitable for logos)
     - Restricted to image file types only

  2. **Security Policies**
     - Organizers can upload their own logo
     - Organizers can update their own logo
     - Organizers can delete their own logo
     - Anyone can view logos (public read access)

  ## Storage Structure
  Files will be stored as: `{organizer_id}/logo.{extension}`
  This ensures each organizer has their own folder and only one logo file.
*/

-- Create the organizer-logos bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'organizer-logos',
  'organizer-logos',
  true,
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- Policy: Allow organizers to upload their own logo
CREATE POLICY "Organizers can upload own logo"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'organizer-logos' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy: Allow organizers to update their own logo
CREATE POLICY "Organizers can update own logo"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'organizer-logos' AND
  (storage.foldername(name))[1] = auth.uid()::text
)
WITH CHECK (
  bucket_id = 'organizer-logos' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy: Allow organizers to delete their own logo
CREATE POLICY "Organizers can delete own logo"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'organizer-logos' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy: Allow public read access to all logos
CREATE POLICY "Anyone can view logos"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'organizer-logos');