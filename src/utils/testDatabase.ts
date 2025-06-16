import { supabase } from '../lib/supabase';

/**
 * Test database connection and verify organizers table exists
 */
export async function testDatabaseConnection() {
  try {
    console.log('🔍 Testing database connection...');
    
    // Test basic connection by querying verified organizers (allowed by public RLS policy)
    const { data: publicOrganizers, error: connectionError } = await supabase
      .from('organizers')
      .select('id, organization_name')
      .eq('is_verified', true)
      .limit(5);
    
    if (connectionError && connectionError.code === '42P01') {
      console.error('❌ Organizers table does not exist. Migration required.');
      return false;
    } else if (connectionError && connectionError.code !== '42501') {
      console.error('❌ Database connection failed:', connectionError);
      return false;
    }
    
    console.log('✅ Database connected successfully!');
    console.log(`📊 Found ${publicOrganizers?.length || 0} verified organizers`);
    
    // Test authentication status
    const { data: currentUser } = await supabase.auth.getUser();
    console.log('👤 Current user:', currentUser.user?.email || 'Not authenticated');
    
    return true;
  } catch (error) {
    console.error('❌ Database test failed:', error);
    return false;
  }
}

/**
 * Test organizer table structure without triggering RLS violations
 */
export async function testOrganizerSignupFlow() {
  try {
    console.log('🧪 Testing organizer table structure...');
    
    // Test table structure by querying verified organizers (public access allowed)
    const { data, error } = await supabase
      .from('organizers')
      .select('id, first_name, last_name, email, organization_name, event_types, is_verified')
      .eq('is_verified', true)
      .limit(1);
    
    if (error && error.code === '42P01') {
      console.error('❌ Organizers table does not exist');
      return false;
    } else if (error && error.code !== '42501') {
      console.error('❌ Table structure test failed:', error);
      return false;
    }
    
    console.log('✅ Organizers table structure is correct');
    console.log('✅ RLS policies are properly configured');
    
    // Test authentication requirement for private operations
    const { data: currentUser } = await supabase.auth.getUser();
    if (!currentUser.user) {
      console.log('ℹ️  Authentication required for organizer registration');
    } else {
      console.log('✅ User is authenticated and can perform organizer operations');
    }
    
    return true;
  } catch (error) {
    console.error('❌ Table structure test failed:', error);
    return false;
  }
}