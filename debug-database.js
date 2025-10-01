import { supabase } from './src/lib/supabase.js';

async function fixDatabasePolicies() {
  try {
    console.log('🔄 Checking database connection...');
    
    // First, let's test basic connectivity
    const { data: testData, error: testError } = await supabase
      .from('events')
      .select('count(*)')
      .single();
      
    if (testError) {
      console.log('❌ Database connection issue:', testError.message);
      
      // Try to check if we can access the events table at all
      console.log('🔍 Checking if events table exists...');
      
      const { data: tableInfo, error: tableError } = await supabase
        .from('information_schema.tables')
        .select('table_name')
        .eq('table_name', 'events')
        .single();
        
      if (tableError) {
        console.log('❌ Cannot access table information:', tableError.message);
        console.log('💡 This suggests RLS is blocking access or tables don\'t exist');
      } else {
        console.log('✅ Events table exists');
      }
    } else {
      console.log('✅ Database connection successful');
      console.log('📊 Event count:', testData);
    }
    
    // Try to create some test events if the table is empty
    console.log('🧪 Attempting to check for existing events...');
    
    const { data: events, error: eventsError } = await supabase
      .from('events')
      .select('id, title, is_published, status')
      .limit(10);
      
    if (eventsError) {
      console.log('❌ Cannot access events:', eventsError.message);
      
      // The issue might be that there are no published events
      // Let's check if this is an authentication issue
      console.log('🔍 Checking authentication status...');
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError) {
        console.log('❌ Auth error:', authError.message);
      } else if (user) {
        console.log('✅ User is authenticated:', user.email);
      } else {
        console.log('ℹ️  No user authenticated (this is expected for public access)');
      }
      
    } else {
      console.log('✅ Successfully accessed events table');
      console.log(`📋 Found ${events?.length || 0} events`);
      
      if (events && events.length > 0) {
        const publishedEvents = events.filter(e => e.is_published && e.status === 'published');
        console.log(`📢 Published events: ${publishedEvents.length}`);
        console.log('📝 Events:', events.map(e => ({ 
          id: e.id, 
          title: e.title, 
          published: e.is_published,
          status: e.status 
        })));
      } else {
        console.log('ℹ️  No events found in database');
        console.log('💡 You need to create and publish some events first');
      }
    }
    
  } catch (error) {
    console.error('💥 Unexpected error:', error);
  }
}

fixDatabasePolicies();
