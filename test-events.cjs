const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testEventFetching() {
  console.log('🧪 Testing event fetching with current API key...\n');
  
  try {
    // Test 1: Basic event fetch
    console.log('📋 Test 1: Basic published events query...');
    const { data: basicData, error: basicError } = await supabase
      .from('events')
      .select('*')
      .eq('is_published', true)
      .eq('status', 'published');
      
    if (basicError) {
      console.log('❌ Basic query failed:', basicError);
    } else {
      console.log(`✅ Basic query success: ${basicData?.length || 0} events found`);
      basicData?.forEach(event => {
        console.log(`   - ${event.title} (ID: ${event.id})`);
      });
    }
    
    // Test 2: Events with organizer info
    console.log('\n📋 Test 2: Events with organizer info...');
    const { data: joinData, error: joinError } = await supabase
      .from('events')
      .select(`
        *,
        organizers (
          organization_name,
          first_name,
          last_name
        )
      `)
      .eq('is_published', true)
      .eq('status', 'published');
      
    if (joinError) {
      console.log('❌ Join query failed:', joinError);
    } else {
      console.log(`✅ Join query success: ${joinData?.length || 0} events found`);
      joinData?.forEach(event => {
        console.log(`   - ${event.title} by ${event.organizers?.organization_name || 'Unknown'}`);
      });
    }
    
    // Test 3: Check organizers table
    console.log('\n📋 Test 3: Checking organizers table...');
    const { data: orgData, error: orgError } = await supabase
      .from('organizers')
      .select('id, organization_name, first_name, last_name')
      .limit(5);
      
    if (orgError) {
      console.log('❌ Organizers query failed:', orgError);
    } else {
      console.log(`✅ Organizers query success: ${orgData?.length || 0} organizers found`);
      orgData?.forEach(org => {
        console.log(`   - ${org.organization_name || `${org.first_name} ${org.last_name}`} (ID: ${org.id})`);
      });
    }
    
  } catch (error) {
    console.error('💥 Unexpected error:', error);
  }
}

testEventFetching();
