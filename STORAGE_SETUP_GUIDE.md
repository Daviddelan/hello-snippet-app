# Storage Bucket Setup Guide

## Error: "Bucket not found"

You're getting this error because the `event-images` storage bucket doesn't exist in your Supabase project yet.

## Quick Fix - Follow These Steps:

### Step 1: Create the Storage Bucket

1. Go to your Supabase Dashboard: https://supabase.com/dashboard
2. Select your project
3. Click on **Storage** in the left sidebar
4. Click **New bucket** button
5. Fill in the details:
   - **Name**: `event-images`
   - **Public bucket**: ✅ **Enable** (check this box)
   - **File size limit**: 10 MB
   - **Allowed MIME types**: Leave empty or add: `image/jpeg, image/png, image/gif, image/webp`
6. Click **Create bucket**

### Step 2: Set Up Storage Policies

1. Still in the Storage section, click on your `event-images` bucket
2. Go to the **Policies** tab
3. Click on **New policy**
4. Instead of using the wizard, click **"For full customization use the SQL editor"**
5. Go to **SQL Editor** in the left sidebar
6. Click **New query**
7. Copy and paste this SQL:

```sql
-- Enable RLS on storage.objects (if not already enabled)
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Allow public read access
CREATE POLICY "Public read access for event-images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'event-images');

-- Allow authenticated uploads
CREATE POLICY "Authenticated uploads for event-images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'event-images');

-- Allow authenticated updates
CREATE POLICY "Authenticated updates for event-images"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'event-images')
WITH CHECK (bucket_id = 'event-images');

-- Allow authenticated deletes
CREATE POLICY "Authenticated deletes for event-images"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'event-images');
```

8. Click **Run** to execute the SQL

### Step 3: Test It

1. Go back to your app
2. Refresh the page
3. Try uploading a logo again in Settings → Branding

## What This Does

- **Public Bucket**: Allows anyone to view/download the images (needed for displaying logos and event images)
- **Read Policy**: Enables public access to read/view images
- **Upload Policy**: Only authenticated users can upload images
- **Update/Delete Policies**: Only authenticated users can modify or delete images

## Verification

After setup, your bucket should:
- ✅ Be visible in Storage → event-images
- ✅ Have 4 policies (SELECT, INSERT, UPDATE, DELETE)
- ✅ Be marked as "Public"

## Still Having Issues?

If you still get errors after following these steps:

1. Check that the bucket name is exactly `event-images` (no typos)
2. Verify the bucket is marked as PUBLIC
3. Check that all 4 policies were created successfully
4. Try refreshing your app and clearing browser cache

## Alternative: Quick SQL Script

If you prefer, you can run this single SQL script that does everything:

```sql
-- Create the bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'event-images',
  'event-images',
  true,
  10485760,
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 10485760,
  allowed_mime_types = ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];

-- Set up all policies
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read access for event-images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated uploads for event-images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated updates for event-images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated deletes for event-images" ON storage.objects;

CREATE POLICY "Public read access for event-images"
ON storage.objects FOR SELECT TO public
USING (bucket_id = 'event-images');

CREATE POLICY "Authenticated uploads for event-images"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'event-images');

CREATE POLICY "Authenticated updates for event-images"
ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'event-images')
WITH CHECK (bucket_id = 'event-images');

CREATE POLICY "Authenticated deletes for event-images"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'event-images');
```

Run this in the SQL Editor with your **service_role** key or as a superuser.
