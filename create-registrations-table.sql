-- Create the event_registrations table
CREATE TABLE public.event_registrations (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id uuid REFERENCES public.events(id) ON DELETE CASCADE,
  attendee_email VARCHAR(255) NOT NULL,
  attendee_name VARCHAR(255),
  attendee_phone VARCHAR(50),
  registration_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  payment_status VARCHAR(50) DEFAULT 'pending',
  payment_reference VARCHAR(255),
  ticket_type VARCHAR(100),
  amount_paid DECIMAL(10,2),
  currency VARCHAR(3) DEFAULT 'GHS',
  status VARCHAR(50) DEFAULT 'confirmed',
  check_in_time TIMESTAMP WITH TIME ZONE,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_event_registrations_event_id ON public.event_registrations(event_id);
CREATE INDEX IF NOT EXISTS idx_event_registrations_email ON public.event_registrations(attendee_email);
CREATE INDEX IF NOT EXISTS idx_event_registrations_status ON public.event_registrations(status);
CREATE INDEX IF NOT EXISTS idx_event_registrations_payment_status ON public.event_registrations(payment_status);

-- Enable RLS
ALTER TABLE public.event_registrations ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Anyone can view registrations for published events" ON public.event_registrations
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.events 
      WHERE events.id = event_registrations.event_id 
      AND events.is_published = true
    )
  );

CREATE POLICY "Event organizers can view their event registrations" ON public.event_registrations
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.events 
      WHERE events.id = event_registrations.event_id 
      AND events.organizer_id = auth.uid()
    )
  );

CREATE POLICY "Anyone can insert registrations" ON public.event_registrations
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Event organizers can update their event registrations" ON public.event_registrations
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.events 
      WHERE events.id = event_registrations.event_id 
      AND events.organizer_id = auth.uid()
    )
  );

-- Insert some test registration data
INSERT INTO public.event_registrations (event_id, attendee_email, attendee_name, payment_status, amount_paid, currency, status)
SELECT 
  e.id,
  'attendee' || (row_number() OVER ()) || '@example.com',
  'Test Attendee ' || (row_number() OVER ()),
  'completed',
  CASE WHEN e.price = 0 THEN 0 ELSE e.price END,
  'GHS',
  'confirmed'
FROM public.events e
WHERE e.is_published = true
CROSS JOIN generate_series(1, 15) -- This will create 15 registrations per event
LIMIT 50; -- Limit to 50 total test registrations
