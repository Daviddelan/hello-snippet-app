import { supabase } from '../lib/supabase';

/**
 * Check if migration has already been run and provide instructions for manual migration
 */
export async function runMigrationManually() {
  try {
    console.log('🚀 Checking migration status...');

    // Check if the organizers table exists
    const { migrated, message } = await checkMigrationStatus();
    
    if (migrated) {
      console.log('✅ Migration already completed!');
      return { success: true, message: 'Database is already set up correctly' };
    }

    // If not migrated, provide instructions
    const instructions = `
❌ Database migration required!

To set up your database, please follow these steps:

1. Go to your Supabase Dashboard: https://supabase.com/dashboard
2. Select your project
3. Navigate to the SQL Editor
4. Copy and paste the SQL from: supabase/migrations/20250616090710_lively_bread.sql
5. Execute the SQL to create the organizers table and policies
6. Refresh this page to test the connection

The migration cannot be run automatically from the client for security reasons.
`;

    console.log(instructions);
    return { 
      success: false, 
      error: 'Manual migration required',
      instructions: instructions.trim()
    };

  } catch (error) {
    console.error('❌ Migration check failed:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}

/**
 * Check if migration has already been run
 */
export async function checkMigrationStatus() {
  try {
    // Try to query the organizers table with a simple select that should work with public RLS
    const { data, error } = await supabase
      .from('organizers')
      .select('id')
      .eq('is_verified', true)
      .limit(1);

    if (error && error.code === '42P01') {
      // Table doesn't exist
      return { migrated: false, message: 'Organizers table does not exist' };
    } else if (error && error.code !== '42501') {
      // Some other error (not RLS related)
      return { migrated: false, message: `Error: ${error.message}` };
    }

    // If we get here, the table exists (even if query returns empty due to RLS, that's fine)
    return { migrated: true, message: 'Migration completed - organizers table exists' };
  } catch (error) {
    return { 
      migrated: false, 
      message: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}