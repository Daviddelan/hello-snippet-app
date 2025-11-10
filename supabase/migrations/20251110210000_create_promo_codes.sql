/*
  # Create Promo Codes System

  1. New Tables
    - `promo_codes`
      - Stores discount/promotion codes
      - Tracks usage limits, expiry dates, discount values
      - Links to specific events or applies globally

    - `promo_code_usage`
      - Tracks individual uses of promo codes
      - Links to registrations and users
      - Enables detailed analytics

  2. Security
    - Enable RLS on all tables
    - Organizers can only manage their own promo codes
    - Public can view and validate codes

  3. Analytics
    - Track code performance
    - Monitor conversion rates
    - Calculate revenue impact
*/

-- Promo Codes table
CREATE TABLE IF NOT EXISTS promo_codes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organizer_id uuid NOT NULL REFERENCES organizers(id) ON DELETE CASCADE,
  event_id uuid REFERENCES events(id) ON DELETE CASCADE,

  -- Code details
  code text NOT NULL UNIQUE,
  description text,

  -- Discount configuration
  discount_type text NOT NULL CHECK (discount_type IN ('percentage', 'fixed')),
  discount_value decimal(10,2) NOT NULL CHECK (discount_value > 0),

  -- Usage limits
  usage_limit integer,
  max_uses_per_user integer DEFAULT 1,
  minimum_purchase_amount decimal(10,2) DEFAULT 0,

  -- Validity period
  start_date timestamptz DEFAULT now(),
  expiry_date timestamptz NOT NULL,

  -- Status
  status text DEFAULT 'active' CHECK (status IN ('active', 'paused', 'expired', 'deleted')),
  is_active boolean DEFAULT true,

  -- Analytics fields
  usage_count integer DEFAULT 0,
  total_discount_given decimal(12,2) DEFAULT 0,
  total_revenue_generated decimal(12,2) DEFAULT 0,

  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Promo Code Usage table
CREATE TABLE IF NOT EXISTS promo_code_usage (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  promo_code_id uuid NOT NULL REFERENCES promo_codes(id) ON DELETE CASCADE,
  registration_id uuid REFERENCES event_registrations(id) ON DELETE SET NULL,
  event_id uuid NOT NULL REFERENCES events(id) ON DELETE CASCADE,

  -- User info
  user_email text NOT NULL,
  user_name text,

  -- Financial details
  original_price decimal(10,2) NOT NULL,
  discount_amount decimal(10,2) NOT NULL,
  final_price decimal(10,2) NOT NULL,

  -- Metadata
  applied_at timestamptz DEFAULT now(),
  ip_address text,
  user_agent text,

  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE promo_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE promo_code_usage ENABLE ROW LEVEL SECURITY;

-- RLS Policies for promo_codes

-- Organizers can view their own promo codes
CREATE POLICY "Organizers can view own promo codes"
  ON promo_codes
  FOR SELECT
  TO authenticated
  USING (organizer_id = auth.uid());

-- Organizers can create promo codes
CREATE POLICY "Organizers can create promo codes"
  ON promo_codes
  FOR INSERT
  TO authenticated
  WITH CHECK (organizer_id = auth.uid());

-- Organizers can update their own promo codes
CREATE POLICY "Organizers can update own promo codes"
  ON promo_codes
  FOR UPDATE
  TO authenticated
  USING (organizer_id = auth.uid())
  WITH CHECK (organizer_id = auth.uid());

-- Organizers can delete their own promo codes
CREATE POLICY "Organizers can delete own promo codes"
  ON promo_codes
  FOR DELETE
  TO authenticated
  USING (organizer_id = auth.uid());

-- Public can validate promo codes (check if exists and valid)
CREATE POLICY "Public can validate promo codes"
  ON promo_codes
  FOR SELECT
  TO anon, authenticated
  USING (
    is_active = true
    AND status = 'active'
    AND expiry_date > now()
    AND (usage_limit IS NULL OR usage_count < usage_limit)
  );

-- RLS Policies for promo_code_usage

-- Organizers can view usage of their promo codes
CREATE POLICY "Organizers can view promo code usage"
  ON promo_code_usage
  FOR SELECT
  TO authenticated
  USING (
    promo_code_id IN (
      SELECT id FROM promo_codes WHERE organizer_id = auth.uid()
    )
  );

-- System can insert promo code usage
CREATE POLICY "System can insert promo code usage"
  ON promo_code_usage
  FOR INSERT
  WITH CHECK (true);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_promo_codes_organizer ON promo_codes(organizer_id);
CREATE INDEX IF NOT EXISTS idx_promo_codes_code ON promo_codes(code);
CREATE INDEX IF NOT EXISTS idx_promo_codes_event ON promo_codes(event_id);
CREATE INDEX IF NOT EXISTS idx_promo_codes_status ON promo_codes(status, is_active);
CREATE INDEX IF NOT EXISTS idx_promo_codes_expiry ON promo_codes(expiry_date);
CREATE INDEX IF NOT EXISTS idx_promo_code_usage_code ON promo_code_usage(promo_code_id);
CREATE INDEX IF NOT EXISTS idx_promo_code_usage_event ON promo_code_usage(event_id);
CREATE INDEX IF NOT EXISTS idx_promo_code_usage_email ON promo_code_usage(user_email);

-- Create trigger for updated_at
CREATE TRIGGER update_promo_codes_updated_at
  BEFORE UPDATE ON promo_codes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Function to validate and apply promo code
CREATE OR REPLACE FUNCTION validate_promo_code(
  p_code text,
  p_event_id uuid,
  p_user_email text,
  p_original_price decimal
)
RETURNS jsonb AS $$
DECLARE
  v_promo promo_codes%ROWTYPE;
  v_user_usage_count integer;
  v_discount_amount decimal;
  v_final_price decimal;
  v_result jsonb;
BEGIN
  -- Get promo code
  SELECT * INTO v_promo
  FROM promo_codes
  WHERE code = UPPER(p_code)
    AND is_active = true
    AND status = 'active'
    AND start_date <= now()
    AND expiry_date > now()
    AND (event_id IS NULL OR event_id = p_event_id);

  -- Check if code exists
  IF v_promo.id IS NULL THEN
    RETURN jsonb_build_object(
      'valid', false,
      'error', 'Invalid or expired promo code'
    );
  END IF;

  -- Check usage limit
  IF v_promo.usage_limit IS NOT NULL AND v_promo.usage_count >= v_promo.usage_limit THEN
    RETURN jsonb_build_object(
      'valid', false,
      'error', 'Promo code usage limit reached'
    );
  END IF;

  -- Check per-user usage limit
  SELECT COUNT(*) INTO v_user_usage_count
  FROM promo_code_usage
  WHERE promo_code_id = v_promo.id
    AND user_email = p_user_email;

  IF v_promo.max_uses_per_user IS NOT NULL AND v_user_usage_count >= v_promo.max_uses_per_user THEN
    RETURN jsonb_build_object(
      'valid', false,
      'error', 'You have already used this promo code'
    );
  END IF;

  -- Check minimum purchase amount
  IF p_original_price < v_promo.minimum_purchase_amount THEN
    RETURN jsonb_build_object(
      'valid', false,
      'error', 'Minimum purchase amount not met'
    );
  END IF;

  -- Calculate discount
  IF v_promo.discount_type = 'percentage' THEN
    v_discount_amount := (p_original_price * v_promo.discount_value / 100);
  ELSE
    v_discount_amount := v_promo.discount_value;
  END IF;

  -- Ensure discount doesn't exceed price
  IF v_discount_amount > p_original_price THEN
    v_discount_amount := p_original_price;
  END IF;

  v_final_price := p_original_price - v_discount_amount;

  -- Return result
  RETURN jsonb_build_object(
    'valid', true,
    'promo_code_id', v_promo.id,
    'discount_type', v_promo.discount_type,
    'discount_value', v_promo.discount_value,
    'discount_amount', v_discount_amount,
    'final_price', v_final_price,
    'original_price', p_original_price
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to record promo code usage
CREATE OR REPLACE FUNCTION record_promo_code_usage(
  p_promo_code_id uuid,
  p_registration_id uuid,
  p_event_id uuid,
  p_user_email text,
  p_user_name text,
  p_original_price decimal,
  p_discount_amount decimal,
  p_final_price decimal
)
RETURNS uuid AS $$
DECLARE
  v_usage_id uuid;
BEGIN
  -- Insert usage record
  INSERT INTO promo_code_usage (
    promo_code_id,
    registration_id,
    event_id,
    user_email,
    user_name,
    original_price,
    discount_amount,
    final_price
  ) VALUES (
    p_promo_code_id,
    p_registration_id,
    p_event_id,
    p_user_email,
    p_user_name,
    p_original_price,
    p_discount_amount,
    p_final_price
  )
  RETURNING id INTO v_usage_id;

  -- Update promo code statistics
  UPDATE promo_codes
  SET
    usage_count = usage_count + 1,
    total_discount_given = total_discount_given + p_discount_amount,
    total_revenue_generated = total_revenue_generated + p_final_price,
    updated_at = now()
  WHERE id = p_promo_code_id;

  RETURN v_usage_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get promo code analytics
CREATE OR REPLACE FUNCTION get_promo_code_analytics(p_organizer_id uuid)
RETURNS TABLE (
  total_codes integer,
  active_codes integer,
  total_uses integer,
  total_discount_given decimal,
  total_revenue_generated decimal,
  avg_discount_per_use decimal,
  conversion_rate decimal
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COUNT(*)::integer as total_codes,
    COUNT(*) FILTER (WHERE status = 'active')::integer as active_codes,
    COALESCE(SUM(usage_count), 0)::integer as total_uses,
    COALESCE(SUM(total_discount_given), 0)::decimal as total_discount_given,
    COALESCE(SUM(total_revenue_generated), 0)::decimal as total_revenue_generated,
    CASE
      WHEN SUM(usage_count) > 0
      THEN (SUM(total_discount_given) / SUM(usage_count))::decimal
      ELSE 0::decimal
    END as avg_discount_per_use,
    CASE
      WHEN COUNT(*) > 0
      THEN ((COUNT(*) FILTER (WHERE usage_count > 0)::decimal / COUNT(*)::decimal) * 100)::decimal
      ELSE 0::decimal
    END as conversion_rate
  FROM promo_codes
  WHERE organizer_id = p_organizer_id
    AND status != 'deleted';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
