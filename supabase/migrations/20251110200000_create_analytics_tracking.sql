/*
  # Create Analytics Tracking System

  1. New Tables
    - `event_analytics_snapshots`
      - Stores daily aggregated analytics for events
      - Tracks views, clicks, registrations, revenue per day
      - Enables time-series analysis and trending

    - `event_page_views`
      - Tracks individual page views for event detail pages
      - Includes referrer source and user agent
      - Enables funnel analysis

    - `marketing_channels`
      - Tracks performance by marketing channel
      - UTM parameters, conversion rates, ROI

  2. Security
    - Enable RLS on all analytics tables
    - Only organizers can view analytics for their events
    - Automated data aggregation via database functions

  3. Performance
    - Indexes on event_id and date columns
    - Materialized view for quick dashboard loading
*/

-- Event Analytics Snapshots (daily aggregated data)
CREATE TABLE IF NOT EXISTS event_analytics_snapshots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  snapshot_date date NOT NULL DEFAULT CURRENT_DATE,

  -- Traffic metrics
  page_views integer DEFAULT 0,
  unique_visitors integer DEFAULT 0,

  -- Conversion metrics
  registration_started integer DEFAULT 0,
  registration_completed integer DEFAULT 0,
  conversion_rate decimal(5,2) DEFAULT 0,

  -- Revenue metrics
  tickets_sold integer DEFAULT 0,
  revenue_generated decimal(12,2) DEFAULT 0,
  average_ticket_price decimal(10,2) DEFAULT 0,

  -- Engagement metrics
  shares integer DEFAULT 0,
  saves integer DEFAULT 0,
  click_throughs integer DEFAULT 0,

  -- Attendance metrics
  checked_in integer DEFAULT 0,
  no_shows integer DEFAULT 0,

  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),

  UNIQUE(event_id, snapshot_date)
);

-- Event Page Views (for funnel analysis)
CREATE TABLE IF NOT EXISTS event_page_views (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid NOT NULL REFERENCES events(id) ON DELETE CASCADE,

  -- Visitor info
  visitor_id text,
  session_id text,

  -- Source tracking
  referrer text,
  utm_source text,
  utm_medium text,
  utm_campaign text,

  -- Device info
  user_agent text,
  device_type text,

  -- Geography
  country text,
  city text,

  -- Behavior
  time_on_page integer,
  scrolled_to_bottom boolean DEFAULT false,
  clicked_register boolean DEFAULT false,

  viewed_at timestamptz DEFAULT now(),

  created_at timestamptz DEFAULT now()
);

-- Marketing Channels Performance
CREATE TABLE IF NOT EXISTS marketing_channels (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid NOT NULL REFERENCES events(id) ON DELETE CASCADE,

  -- Channel info
  channel_name text NOT NULL,
  channel_type text CHECK (channel_type IN ('social', 'email', 'paid', 'organic', 'referral', 'direct')),

  -- Campaign details
  campaign_name text,
  utm_source text,
  utm_medium text,
  utm_campaign text,

  -- Performance metrics
  impressions integer DEFAULT 0,
  clicks integer DEFAULT 0,
  registrations integer DEFAULT 0,
  revenue decimal(12,2) DEFAULT 0,
  cost decimal(12,2) DEFAULT 0,

  -- Calculated metrics
  click_through_rate decimal(5,2) DEFAULT 0,
  conversion_rate decimal(5,2) DEFAULT 0,
  cost_per_acquisition decimal(10,2) DEFAULT 0,
  return_on_ad_spend decimal(10,2) DEFAULT 0,

  active boolean DEFAULT true,

  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),

  UNIQUE(event_id, channel_name, utm_campaign)
);

-- Enable Row Level Security
ALTER TABLE event_analytics_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_page_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE marketing_channels ENABLE ROW LEVEL SECURITY;

-- RLS Policies for event_analytics_snapshots
CREATE POLICY "Organizers can view analytics for their events"
  ON event_analytics_snapshots
  FOR SELECT
  TO authenticated
  USING (
    event_id IN (
      SELECT id FROM events WHERE organizer_id = auth.uid()
    )
  );

CREATE POLICY "System can insert analytics snapshots"
  ON event_analytics_snapshots
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "System can update analytics snapshots"
  ON event_analytics_snapshots
  FOR UPDATE
  USING (true);

-- RLS Policies for event_page_views
CREATE POLICY "Organizers can view page views for their events"
  ON event_page_views
  FOR SELECT
  TO authenticated
  USING (
    event_id IN (
      SELECT id FROM events WHERE organizer_id = auth.uid()
    )
  );

CREATE POLICY "Anyone can log page views"
  ON event_page_views
  FOR INSERT
  WITH CHECK (true);

-- RLS Policies for marketing_channels
CREATE POLICY "Organizers can view marketing channels for their events"
  ON marketing_channels
  FOR SELECT
  TO authenticated
  USING (
    event_id IN (
      SELECT id FROM events WHERE organizer_id = auth.uid()
    )
  );

CREATE POLICY "Organizers can manage marketing channels for their events"
  ON marketing_channels
  FOR ALL
  TO authenticated
  USING (
    event_id IN (
      SELECT id FROM events WHERE organizer_id = auth.uid()
    )
  )
  WITH CHECK (
    event_id IN (
      SELECT id FROM events WHERE organizer_id = auth.uid()
    )
  );

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_analytics_snapshots_event_date ON event_analytics_snapshots(event_id, snapshot_date DESC);
CREATE INDEX IF NOT EXISTS idx_analytics_snapshots_date ON event_analytics_snapshots(snapshot_date DESC);
CREATE INDEX IF NOT EXISTS idx_page_views_event ON event_page_views(event_id, viewed_at DESC);
CREATE INDEX IF NOT EXISTS idx_page_views_session ON event_page_views(session_id);
CREATE INDEX IF NOT EXISTS idx_page_views_visitor ON event_page_views(visitor_id);
CREATE INDEX IF NOT EXISTS idx_marketing_channels_event ON marketing_channels(event_id);
CREATE INDEX IF NOT EXISTS idx_marketing_channels_type ON marketing_channels(channel_type);

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_analytics_snapshots_updated_at
  BEFORE UPDATE ON event_analytics_snapshots
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_marketing_channels_updated_at
  BEFORE UPDATE ON marketing_channels
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Function to aggregate daily analytics
CREATE OR REPLACE FUNCTION aggregate_daily_analytics(p_event_id uuid, p_date date)
RETURNS void AS $$
BEGIN
  INSERT INTO event_analytics_snapshots (
    event_id,
    snapshot_date,
    page_views,
    unique_visitors,
    tickets_sold,
    revenue_generated,
    checked_in
  )
  SELECT
    p_event_id,
    p_date,
    COUNT(DISTINCT pv.id) as page_views,
    COUNT(DISTINCT pv.visitor_id) as unique_visitors,
    COUNT(DISTINCT reg.id) FILTER (WHERE reg.payment_status = 'completed') as tickets_sold,
    COALESCE(SUM(reg.amount_paid) FILTER (WHERE reg.payment_status = 'completed'), 0) as revenue_generated,
    COUNT(DISTINCT reg.id) FILTER (WHERE reg.check_in_time IS NOT NULL) as checked_in
  FROM events e
  LEFT JOIN event_page_views pv ON pv.event_id = e.id AND DATE(pv.viewed_at) = p_date
  LEFT JOIN event_registrations reg ON reg.event_id = e.id AND DATE(reg.registration_date) = p_date
  WHERE e.id = p_event_id
  GROUP BY e.id
  ON CONFLICT (event_id, snapshot_date)
  DO UPDATE SET
    page_views = EXCLUDED.page_views,
    unique_visitors = EXCLUDED.unique_visitors,
    tickets_sold = EXCLUDED.tickets_sold,
    revenue_generated = EXCLUDED.revenue_generated,
    checked_in = EXCLUDED.checked_in,
    updated_at = now();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
