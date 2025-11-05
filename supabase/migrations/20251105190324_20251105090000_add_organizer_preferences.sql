/*
  # Add Organizer Preferences

  1. Changes to organizers table
    - Add `logo_url` (text) - URL to uploaded logo in storage
    - Add `primary_color` (text) - Primary theme color (hex code)
    - Add `secondary_color` (text) - Secondary theme color (hex code)
    - Add `default_currency` (text) - Default currency code (ISO 4217)
    - Add `currency_symbol` (text) - Currency symbol for display
    - Add `theme_auto_generated` (boolean) - Whether theme was auto-generated from logo
    - Add `event_page_template` (text) - Preferred event page template
    - Add `notification_email` (boolean) - Email notifications enabled
    - Add `notification_sms` (boolean) - SMS notifications enabled
    - Add `notification_new_registrations` (boolean) - Notify on new registrations
    - Add `notification_payment_updates` (boolean) - Notify on payment updates
    - Add `notification_event_reminders` (boolean) - Notify with event reminders
    - Add `notification_marketing` (boolean) - Marketing emails enabled
    - Add `two_factor_enabled` (boolean) - Two-factor authentication status

  2. Security
    - All columns have sensible defaults
    - No additional RLS policies needed (already covered by existing policies)
*/

-- Add preference columns to organizers table
DO $$
BEGIN
  -- Branding preferences
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'organizers' AND column_name = 'logo_url'
  ) THEN
    ALTER TABLE organizers ADD COLUMN logo_url text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'organizers' AND column_name = 'primary_color'
  ) THEN
    ALTER TABLE organizers ADD COLUMN primary_color text DEFAULT '#001B79';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'organizers' AND column_name = 'secondary_color'
  ) THEN
    ALTER TABLE organizers ADD COLUMN secondary_color text DEFAULT '#0066CC';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'organizers' AND column_name = 'theme_auto_generated'
  ) THEN
    ALTER TABLE organizers ADD COLUMN theme_auto_generated boolean DEFAULT false;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'organizers' AND column_name = 'event_page_template'
  ) THEN
    ALTER TABLE organizers ADD COLUMN event_page_template text DEFAULT 'modern';
  END IF;

  -- Currency preferences
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'organizers' AND column_name = 'default_currency'
  ) THEN
    ALTER TABLE organizers ADD COLUMN default_currency text DEFAULT 'USD';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'organizers' AND column_name = 'currency_symbol'
  ) THEN
    ALTER TABLE organizers ADD COLUMN currency_symbol text DEFAULT '$';
  END IF;

  -- Notification preferences
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'organizers' AND column_name = 'notification_email'
  ) THEN
    ALTER TABLE organizers ADD COLUMN notification_email boolean DEFAULT true;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'organizers' AND column_name = 'notification_sms'
  ) THEN
    ALTER TABLE organizers ADD COLUMN notification_sms boolean DEFAULT false;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'organizers' AND column_name = 'notification_new_registrations'
  ) THEN
    ALTER TABLE organizers ADD COLUMN notification_new_registrations boolean DEFAULT true;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'organizers' AND column_name = 'notification_payment_updates'
  ) THEN
    ALTER TABLE organizers ADD COLUMN notification_payment_updates boolean DEFAULT true;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'organizers' AND column_name = 'notification_event_reminders'
  ) THEN
    ALTER TABLE organizers ADD COLUMN notification_event_reminders boolean DEFAULT true;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'organizers' AND column_name = 'notification_marketing'
  ) THEN
    ALTER TABLE organizers ADD COLUMN notification_marketing boolean DEFAULT false;
  END IF;

  -- Security preferences
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'organizers' AND column_name = 'two_factor_enabled'
  ) THEN
    ALTER TABLE organizers ADD COLUMN two_factor_enabled boolean DEFAULT false;
  END IF;
END $$;