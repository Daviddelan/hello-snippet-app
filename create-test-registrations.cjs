require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials in .env file');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function createTestRegistrations() {
  console.log('🎯 Creating test registrations...');
  
  try {
    // First, get the published events
    const { data: events, error: eventsError } = await supabase
      .from('events')
      .select('id, title, price')
      .eq('is_published', true)
      .eq('status', 'published');

    if (eventsError) {
      console.error('❌ Error fetching events:', eventsError);
      return;
    }

    if (!events || events.length === 0) {
      console.log('⚠️ No published events found to create registrations for');
      return;
    }

    console.log(`📊 Found ${events.length} published events`);

    // Create test registrations for each event
    const testRegistrations = [];
    
    events.forEach(event => {
      // Create 3-15 random registrations per event
      const numRegistrations = Math.floor(Math.random() * 13) + 3; // 3-15 registrations
      
      for (let i = 1; i <= numRegistrations; i++) {
        testRegistrations.push({
          event_id: event.id,
          attendee_email: `attendee${i}_${event.id.slice(-4)}@example.com`,
          attendee_name: `Test Attendee ${i}`,
          attendee_phone: `+233${Math.floor(Math.random() * 900000000) + 100000000}`,
          payment_status: 'completed',
          payment_reference: event.price > 0 ? `TEST_PAY_${Date.now()}_${i}` : null,
          ticket_type: event.price > 0 ? 'paid' : 'free',
          amount_paid: event.price || 0,
          currency: 'GHS',
          status: 'confirmed'
        });
      }
    });

    console.log(`📝 Creating ${testRegistrations.length} test registrations...`);

    // Insert the test registrations
    const { data: insertedRegistrations, error: insertError } = await supabase
      .from('event_registrations')
      .insert(testRegistrations)
      .select();

    if (insertError) {
      console.error('❌ Error creating test registrations:', insertError);
      
      if (insertError.code === '42P01') {
        console.log('');
        console.log('📋 The event_registrations table does not exist yet.');
        console.log('🔧 Please create it first using the SQL in create-registrations-table.sql');
        console.log('🔗 Go to: https://supabase.com/dashboard/project/[your-project]/sql');
      }
      return;
    }

    console.log(`✅ Successfully created ${insertedRegistrations.length} test registrations!`);
    
    // Show registration counts per event
    for (const event of events) {
      const eventRegistrations = insertedRegistrations.filter(reg => reg.event_id === event.id);
      console.log(`📊 ${event.title}: ${eventRegistrations.length} registrations`);
    }

    console.log('');
    console.log('🎉 Test registrations created successfully!');
    console.log('💡 Now the event components will show real registration counts.');

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

createTestRegistrations();
