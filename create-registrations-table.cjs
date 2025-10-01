require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials in .env file');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function createRegistrationsTable() {
  console.log('🚀 Creating event_registrations table...');
  
  try {
    // First, let's check if the table already exists
    const { data: existingTables, error: checkError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .eq('table_name', 'event_registrations');
    
    if (checkError) {
      console.log('⚠️ Could not check existing tables, proceeding with creation...');
    } else if (existingTables && existingTables.length > 0) {
      console.log('✅ Table event_registrations already exists');
      return;
    }
    
    // Since we can't run DDL through the client, let's create some test registrations data
    // and the table will be created manually in Supabase dashboard
    console.log('📝 Note: The event_registrations table needs to be created in Supabase dashboard');
    console.log('🏗️ Table structure needed:');
    console.log(`
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
`);
    
    console.log('📋 Please run this SQL in your Supabase SQL Editor');
    console.log('🔗 Go to: https://supabase.com/dashboard/project/[your-project]/sql');
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

createRegistrationsTable();
