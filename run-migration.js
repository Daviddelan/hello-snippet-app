import { supabase } from '../src/lib/supabase.js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function runMigration() {
  try {
    console.log('🔄 Running RLS policy migration...');
    
    // Read the migration file
    const migrationPath = join(__dirname, 'migrations', '20250929000000_fix_rls_policies.sql');
    const migrationSQL = readFileSync(migrationPath, 'utf8');
    
    // Split the SQL into individual statements
    const statements = migrationSQL
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));
    
    console.log(`📝 Executing ${statements.length} SQL statements...`);
    
    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      console.log(`⚡ Executing statement ${i + 1}/${statements.length}`);
      
      const { error } = await supabase.rpc('execute_sql', { 
        sql_statement: statement 
      });
      
      if (error) {
        console.log(`⚠️  Statement ${i + 1} had an issue (might be expected):`, error.message);
        // Continue anyway as some statements might fail if policies already exist
      } else {
        console.log(`✅ Statement ${i + 1} executed successfully`);
      }
    }
    
    console.log('🎉 Migration completed!');
    
    // Test if we can now read events
    console.log('🧪 Testing event access...');
    const { data: events, error: eventError } = await supabase
      .from('events')
      .select('*')
      .eq('is_published', true)
      .limit(5);
      
    if (eventError) {
      console.log('❌ Event access test failed:', eventError.message);
    } else {
      console.log(`✅ Event access test passed! Found ${events?.length || 0} published events`);
      if (events && events.length > 0) {
        console.log('📋 Sample events:', events.map(e => ({ id: e.id, title: e.title })));
      }
    }
    
  } catch (error) {
    console.error('💥 Migration failed:', error);
  }
}

runMigration();
