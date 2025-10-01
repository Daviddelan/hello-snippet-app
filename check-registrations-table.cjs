require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials in .env file');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkRegistrationsTable() {
  console.log('🔍 Checking if event_registrations table exists...');
  
  try {
    // Try to query the registrations table
    const { data, error } = await supabase
      .from('event_registrations')
      .select('id')
      .limit(1);

    if (error) {
      if (error.code === '42P01') {
        console.log('❌ Table event_registrations does not exist');
        console.log('');
        console.log('📋 TO CREATE THE TABLE:');
        console.log('1. Go to your Supabase dashboard');
        console.log('2. Navigate to SQL Editor');
        console.log('3. Run the SQL from create-registrations-table.sql');
        console.log('');
        console.log('🔗 Or copy this SQL and run it:');
        console.log('');
        console.log('-- Run this in Supabase SQL Editor:');
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

CREATE INDEX IF NOT EXISTS idx_event_registrations_event_id ON public.event_registrations(event_id);
CREATE INDEX IF NOT EXISTS idx_event_registrations_email ON public.event_registrations(attendee_email);
CREATE INDEX IF NOT EXISTS idx_event_registrations_status ON public.event_registrations(status);
CREATE INDEX IF NOT EXISTS idx_event_registrations_payment_status ON public.event_registrations(payment_status);

ALTER TABLE public.event_registrations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view registrations for published events" ON public.event_registrations
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.events 
      WHERE events.id = event_registrations.event_id 
      AND events.is_published = true
    )
  );

CREATE POLICY "Anyone can insert registrations" ON public.event_registrations
  FOR INSERT WITH CHECK (true);
        `);
      } else {
        console.error('❌ Error checking table:', error);
      }
    } else {
      console.log('✅ Table event_registrations exists!');
      console.log(`📊 Found ${data.length} record(s) (limited to 1 for check)`);
      
      // Let's also check if we have any test registrations
      const { data: allRegs, error: countError } = await supabase
        .from('event_registrations')
        .select('*', { count: 'exact' });
        
      if (!countError) {
        console.log(`📈 Total registrations in database: ${allRegs.length}`);
        if (allRegs.length > 0) {
          console.log('🎉 Registration system is ready to use!');
        } else {
          console.log('💡 Table exists but is empty - registrations will be created when users register');
        }
      }
    }

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

checkRegistrationsTable();
