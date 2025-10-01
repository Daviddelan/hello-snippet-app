const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing Supabase environment variables');
  console.log('VITE_SUPABASE_URL:', supabaseUrl ? '✅ Set' : '❌ Missing');
  console.log('VITE_SUPABASE_ANON_KEY:', supabaseAnonKey ? '✅ Set' : '❌ Missing');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function debugDatabase() {
  try {
    console.log('🔄 Checking database connection...');
    console.log('🌐 Supabase URL:', supabaseUrl);
    console.log('🔑 Using anon key:', supabaseAnonKey ? 'Yes' : 'No');
    
    // Test basic connectivity
    console.log('\n🧪 Testing basic connectivity...');
    const { data, error } = await supabase
      .from('events')
      .select('count(*)', { count: 'exact' });
      
    if (error) {
      console.log('❌ Database access error:', error.message);
      console.log('🔍 Error details:', error);
      
      // Check if it's an RLS issue
      if (error.message.includes('permission denied') || error.message.includes('RLS')) {
        console.log('💡 This appears to be a Row Level Security (RLS) issue');
        console.log('💡 You need to either:');
        console.log('   1. Disable RLS on the events table, OR');
        console.log('   2. Create proper RLS policies for public access');
      }
      
      if (error.message.includes('Legacy API keys are disabled')) {
        console.log('💡 Your Supabase project has disabled legacy API keys');
        console.log('💡 You need to update your project settings or use service role key');
      }
      
    } else {
      console.log('✅ Database connection successful');
      console.log('📊 Total events in database:', data[0]?.count || 0);
    }
    
    // Try to get events without count
    console.log('\n🔍 Attempting to fetch events...');
    const { data: events, error: eventsError } = await supabase
      .from('events')
      .select('id, title, is_published, status, created_at')
      .limit(5);
      
    if (eventsError) {
      console.log('❌ Cannot fetch events:', eventsError.message);
    } else {
      console.log('✅ Successfully fetched events');
      console.log(`📋 Found ${events?.length || 0} events`);
      
      if (events && events.length > 0) {
        console.log('\n📝 Events in database:');
        events.forEach((event, index) => {
          console.log(`   ${index + 1}. ${event.title}`);
          console.log(`      ID: ${event.id}`);
          console.log(`      Published: ${event.is_published ? '✅' : '❌'}`);
          console.log(`      Status: ${event.status}`);
          console.log(`      Created: ${event.created_at}`);
          console.log('');
        });
        
        const publishedEvents = events.filter(e => e.is_published && e.status === 'published');
        console.log(`📢 Published events: ${publishedEvents.length}/${events.length}`);
      }
    }
    
    // Check authentication status
    console.log('\n🔐 Checking authentication...');
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError) {
      console.log('❌ Auth error:', authError.message);
    } else if (user) {
      console.log('✅ User is authenticated:', user.email);
    } else {
      console.log('ℹ️  No user authenticated (expected for public access)');
    }
    
  } catch (error) {
    console.error('💥 Unexpected error:', error);
  }
}

debugDatabase();
