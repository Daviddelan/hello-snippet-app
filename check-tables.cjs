// Check database tables and structure
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

async function checkTables() {
  console.log('🔍 Checking database tables...');
  
  try {
    // Check if registrations table exists
    const { data: registrations, error: regError } = await supabase
      .from('registrations')
      .select('*')
      .limit(1);
    
    if (!regError) {
      console.log('✅ Registrations table exists');
      
      // Get sample registration data
      const { data: allRegs, error: allRegError } = await supabase
        .from('registrations')
        .select('*');
      
      console.log(`📊 Total registrations: ${allRegs?.length || 0}`);
      if (allRegs && allRegs.length > 0) {
        console.log('📝 Sample registration:', allRegs[0]);
      }
    } else {
      console.log('❌ Registrations table does not exist or is not accessible');
      console.log('Error:', regError.message);
    }
    
    // Check if event_registrations table exists
    const { data: eventRegs, error: eventRegError } = await supabase
      .from('event_registrations')
      .select('*')
      .limit(1);
    
    if (!eventRegError) {
      console.log('✅ Event_registrations table exists');
      
      // Get sample data
      const { data: allEventRegs, error: allEventRegError } = await supabase
        .from('event_registrations')
        .select('*');
      
      console.log(`📊 Total event registrations: ${allEventRegs?.length || 0}`);
      if (allEventRegs && allEventRegs.length > 0) {
        console.log('📝 Sample event registration:', allEventRegs[0]);
      }
    } else {
      console.log('❌ Event_registrations table does not exist or is not accessible');
      console.log('Error:', eventRegError.message);
    }
    
    // Check for attendees table
    const { data: attendees, error: attendeesError } = await supabase
      .from('attendees')
      .select('*')
      .limit(1);
    
    if (!attendeesError) {
      console.log('✅ Attendees table exists');
      
      // Get sample data
      const { data: allAttendees, error: allAttendeesError } = await supabase
        .from('attendees')
        .select('*');
      
      console.log(`📊 Total attendees: ${allAttendees?.length || 0}`);
      if (allAttendees && allAttendees.length > 0) {
        console.log('📝 Sample attendee:', allAttendees[0]);
      }
    } else {
      console.log('❌ Attendees table does not exist or is not accessible');
      console.log('Error:', attendeesError.message);
    }
    
    // Check events table structure
    const { data: events, error: eventsError } = await supabase
      .from('events')
      .select('*')
      .limit(1);
    
    if (!eventsError && events && events.length > 0) {
      console.log('📋 Events table structure (first event):');
      console.log(Object.keys(events[0]));
    }
    
  } catch (error) {
    console.error('❌ Error checking tables:', error);
  }
}

checkTables().then(() => {
  console.log('✅ Table check complete');
}).catch(console.error);
