/*
  # Create Event Images Storage Bucket

  ## Overview
  Creates a dedicated storage bucket for event images with appropriate security policies.

  ## Changes
  1. **Storage Bucket**
     - Creates `event-images` bucket
     - Public access enabled for viewing event images
     - 10MB file size limit (suitable for event cover images)
     - Restricted to image file types only

  2. **Security Policies**
     - Authenticated users can upload event images
     - Users can update their own event images
     - Users can delete their own event images
     - Anyone can view event images (public read access)

  ## Storage Structure
  Files will be stored as: `{organizer_id}/{event_id}_cropped_{timestamp}.jpg`
  This ensures each organizer has their own folder for organization.
*/

-- Create the event-images bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'event-images',
  'event-images',
  true,
  10485760, -- 10MB limit
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO NOTHING;

-- Policy: Allow authenticated users to upload event images
CREATE POLICY "Authenticated users can upload event images"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'event-images'
);

-- Policy: Allow users to update their own event images
CREATE POLICY "Users can update own event images"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'event-images' AND
  (storage.foldername(name))[1] = auth.uid()::text
)
WITH CHECK (
  bucket_id = 'event-images' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy: Allow users to delete their own event images
CREATE POLICY "Users can delete own event images"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'event-images' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy: Allow public read access to all event images
CREATE POLICY "Anyone can view event images"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'event-images');
