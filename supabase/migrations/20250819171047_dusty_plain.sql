/*
  # Add avatar support for organizers

  1. Schema Changes
    - Add `avatar_url` column to organizers table
    - Add `bio` column for organizer description

  2. Security
    - Update existing policies to include new fields
    - No new policies needed as existing ones cover the new columns
*/

-- Add avatar_url column to organizers table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'organizers' AND column_name = 'avatar_url'
  ) THEN
    ALTER TABLE organizers ADD COLUMN avatar_url text;
  END IF;
END $$;

-- Add bio column for organizer description
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'organizers' AND column_name = 'bio'
  ) THEN
    ALTER TABLE organizers ADD COLUMN bio text;
  END IF;
END $$;

-- Create index for avatar_url for better performance
CREATE INDEX IF NOT EXISTS idx_organizers_avatar ON organizers(avatar_url) WHERE avatar_url IS NOT NULL;