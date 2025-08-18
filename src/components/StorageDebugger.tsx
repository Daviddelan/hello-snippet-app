import React, { useState } from 'react';
import { 
  Database, 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Loader,
  RefreshCw,
  Info,
  Copy,
  Terminal
} from 'lucide-react';
import { supabase } from '../lib/supabase';

const StorageDebugger = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState<any>(null);
  const [showSQLCommands, setShowSQLCommands] = useState(false);

  const runComprehensiveTest = async () => {
    setIsRunning(true);
    setResults(null);

    try {
      console.log('🔍 Running comprehensive storage test...');
      
      const testResults = {
        timestamp: new Date().toISOString(),
        steps: [] as any[]
      };

      // Step 1: Test authentication
      console.log('Step 1: Checking authentication...');
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      testResults.steps.push({
        step: 1,
        name: 'Authentication Status',
        status: user ? 'success' : 'warning',
        message: user ? `Authenticated as ${user.email}` : 'Not authenticated (testing anon access)',
        details: { userId: user?.id, authError }
      });

      // Step 2: Test bucket access (anon)
      console.log('Step 2: Testing bucket access (anon)...');
      const { data: anonFiles, error: anonError } = await supabase.storage
        .from('event-images')
        .list('', { limit: 1 });
      
      testResults.steps.push({
        step: 2,
        name: 'Bucket Access (Anon)',
        status: anonError ? 'error' : 'success',
        message: anonError 
          ? `Failed: ${anonError.message}` 
          : `Success: Found ${anonFiles?.length || 0} files`,
        details: { files: anonFiles?.slice(0, 3), error: anonError }
      });

      // Step 3: Test public URL generation
      console.log('Step 3: Testing public URL generation...');
      try {
        const { data: urlData } = supabase.storage
          .from('event-images')
          .getPublicUrl('test-file.jpg'); // This should always work, even if file doesn't exist
        
        testResults.steps.push({
          step: 3,
          name: 'Public URL Generation',
          status: urlData.publicUrl ? 'success' : 'error',
          message: urlData.publicUrl 
            ? `Success: ${urlData.publicUrl}` 
            : 'Failed to generate public URL',
          details: { urlData }
        });
      } catch (urlError) {
        testResults.steps.push({
          step: 3,
          name: 'Public URL Generation',
          status: 'error',
          message: `Error: ${urlError}`,
          details: { error: urlError }
        });
      }

      // Step 4: Test upload (only if authenticated)
      if (user) {
        console.log('Step 4: Testing upload permissions...');
        const testBlob = new Blob(['diagnostic-test'], { type: 'text/plain' });
        const testPath = `diagnostic_test_${Date.now()}.txt`;
        
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('event-images')
          .upload(testPath, testBlob);
        
        testResults.steps.push({
          step: 4,
          name: 'Upload Test (Authenticated)',
          status: uploadError ? 'error' : 'success',
          message: uploadError 
            ? `Upload failed: ${uploadError.message}` 
            : 'Upload successful',
          details: { uploadData, error: uploadError }
        });

        // Clean up test file if upload succeeded
        if (!uploadError) {
          await supabase.storage
            .from('event-images')
            .remove([testPath]);
        }
      } else {
        testResults.steps.push({
          step: 4,
          name: 'Upload Test (Authenticated)',
          status: 'warning',
          message: 'Skipped - user not authenticated',
          details: { reason: 'no_auth' }
        });
      }

      // Step 5: Test specific error scenarios
      console.log('Step 5: Testing error scenarios...');
      const { data: nonExistentBucket, error: nonExistentError } = await supabase.storage
        .from('non-existent-bucket')
        .list('', { limit: 1 });
      
      testResults.steps.push({
        step: 5,
        name: 'Non-existent Bucket Test',
        status: nonExistentError ? 'success' : 'warning',
        message: nonExistentError 
          ? `Expected error: ${nonExistentError.message}` 
          : 'Unexpected: No error for non-existent bucket',
        details: { error: nonExistentError }
      });

      setResults(testResults);
      console.log('🏁 Comprehensive test complete:', testResults);

    } catch (error) {
      console.error('❌ Test failed:', error);
      setResults({
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      });
    } finally {
      setIsRunning(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'warning': return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      case 'error': return <XCircle className="w-4 h-4 text-red-500" />;
      default: return <Info className="w-4 h-4 text-blue-500" />;
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const sqlCommands = {
    checkPolicies: `-- Check existing storage policies for event-images
SELECT policyname, roles, cmd, qual, with_check
FROM pg_policies 
WHERE schemaname = 'storage' AND tablename = 'objects'
AND (policyname LIKE '%event-images%' OR qual LIKE '%event-images%' OR with_check LIKE '%event-images%');`,

    checkBuckets: `-- Check if bucket exists and is public
SELECT name, public, file_size_limit, allowed_mime_types
FROM storage.buckets 
WHERE name = 'event-images';`,

    fixPolicies: `-- Drop existing policies (if any) and recreate them correctly
DROP POLICY IF EXISTS "Allow authenticated uploads" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated updates" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated deletes" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated reads" ON storage.objects;
DROP POLICY IF EXISTS "Allow public reads" ON storage.objects;

-- Create new policies with correct syntax
CREATE POLICY "event_images_authenticated_upload"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'event-images');

CREATE POLICY "event_images_authenticated_update"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'event-images')
WITH CHECK (bucket_id = 'event-images');

CREATE POLICY "event_images_authenticated_delete"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'event-images');

CREATE POLICY "event_images_public_read"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'event-images');`,

    createBucket: `-- Create bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'event-images',
  'event-images', 
  true,
  10485760, -- 10MB limit
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;`
  };

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <Database className="w-5 h-5 text-gray-600" />
          <h3 className="text-lg font-semibold text-gray-900">Storage Debugger</h3>
        </div>
        <button
          onClick={runComprehensiveTest}
          disabled={isRunning}
          className="flex items-center space-x-2 bg-blue-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-600 transition-colors disabled:opacity-50"
        >
          {isRunning ? (
            <Loader className="w-4 h-4 animate-spin" />
          ) : (
            <RefreshCw className="w-4 h-4" />
          )}
          <span>{isRunning ? 'Testing...' : 'Run Full Test'}</span>
        </button>
      </div>

      {/* SQL Commands Section */}
      <div className="mb-6">
        <button
          onClick={() => setShowSQLCommands(!showSQLCommands)}
          className="flex items-center space-x-2 text-blue-600 hover:text-blue-800 font-medium"
        >
          <Terminal className="w-4 h-4" />
          <span>Show SQL Debugging Commands</span>
        </button>
        
        {showSQLCommands && (
          <div className="mt-4 space-y-4">
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-gray-900">1. Check Existing Policies</h4>
                <button
                  onClick={() => copyToClipboard(sqlCommands.checkPolicies)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <Copy className="w-4 h-4" />
                </button>
              </div>
              <pre className="text-sm text-gray-700 bg-white p-2 rounded border overflow-x-auto">
                {sqlCommands.checkPolicies}
              </pre>
            </div>

            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-gray-900">2. Check Bucket Configuration</h4>
                <button
                  onClick={() => copyToClipboard(sqlCommands.checkBuckets)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <Copy className="w-4 h-4" />
                </button>
              </div>
              <pre className="text-sm text-gray-700 bg-white p-2 rounded border overflow-x-auto">
                {sqlCommands.checkBuckets}
              </pre>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-yellow-900">3. Fix Policies (if needed)</h4>
                <button
                  onClick={() => copyToClipboard(sqlCommands.fixPolicies)}
                  className="text-yellow-700 hover:text-yellow-900"
                >
                  <Copy className="w-4 h-4" />
                </button>
              </div>
              <pre className="text-sm text-yellow-800 bg-white p-2 rounded border overflow-x-auto">
                {sqlCommands.fixPolicies}
              </pre>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-blue-900">4. Create Bucket (if needed)</h4>
                <button
                  onClick={() => copyToClipboard(sqlCommands.createBucket)}
                  className="text-blue-700 hover:text-blue-900"
                >
                  <Copy className="w-4 h-4" />
                </button>
              </div>
              <pre className="text-sm text-blue-800 bg-white p-2 rounded border overflow-x-auto">
                {sqlCommands.createBucket}
              </pre>
            </div>
          </div>
        )}
      </div>

      {results && (
        <div className="space-y-4">
          {results.error ? (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center space-x-2">
                <XCircle className="w-5 h-5 text-red-500" />
                <span className="font-medium text-red-800">Test Failed</span>
              </div>
              <p className="text-red-700 text-sm mt-2">{results.error}</p>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="text-sm text-gray-500 mb-4">
                Test run at: {new Date(results.timestamp).toLocaleString()}
              </div>
              
              {results.steps.map((step: any) => (
                <div key={step.step} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                  <div className="flex-shrink-0 mt-0.5">
                    {getStatusIcon(step.status)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-medium text-gray-900">
                        Step {step.step}: {step.name}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{step.message}</p>
                    
                    {step.details && (
                      <details className="mt-2">
                        <summary className="text-xs text-gray-500 cursor-pointer hover:text-gray-700">
                          View details
                        </summary>
                        <pre className="text-xs text-gray-600 mt-1 bg-white p-2 rounded border overflow-auto max-h-32">
                          {JSON.stringify(step.details, null, 2)}
                        </pre>
                      </details>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Troubleshooting Guide */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <h4 className="font-medium text-gray-900 mb-3">Common Issues & Solutions</h4>
        <div className="space-y-3 text-sm">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <strong className="text-yellow-800">Issue:</strong> "Bucket not found" error<br/>
            <strong className="text-yellow-800">Solution:</strong> The bucket exists but your anon key can't list buckets. This is normal - the updated code should fix this.
          </div>
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <strong className="text-blue-800">Issue:</strong> "RLS policy" errors<br/>
            <strong className="text-blue-800">Solution:</strong> Run the "Fix Policies" SQL above to recreate policies with correct syntax.
          </div>
          
          <div className="bg-green-50 border border-green-200 rounded-lg p-3">
            <strong className="text-green-800">Issue:</strong> Upload works but public access doesn't<br/>
            <strong className="text-green-800">Solution:</strong> Make sure bucket is marked as "Public" in Supabase dashboard.
          </div>
        </div>
      </div>
    </div>
  );
};

export default StorageDebugger;