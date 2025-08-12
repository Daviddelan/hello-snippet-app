import React, { useState } from 'react';
import { 
  Database, 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Loader,
  RefreshCw,
  Info,
  Eye,
  EyeOff,
  Copy,
  ExternalLink
} from 'lucide-react';
import { supabase } from '../lib/supabase';

const StorageDebugger = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState<any>(null);
  const [showEnvVars, setShowEnvVars] = useState(false);
  const [showRawResponse, setShowRawResponse] = useState(false);

  const runComprehensiveDebug = async () => {
    setIsRunning(true);
    setResults(null);

    const debugResults = {
      timestamp: new Date().toISOString(),
      environment: {},
      authentication: {},
      storage: {},
      buckets: {},
      permissions: {},
      recommendations: []
    };

    try {
      console.log('🔍 COMPREHENSIVE STORAGE DEBUG STARTING...');
      console.log('='.repeat(60));

      // 1. Environment Variables Check
      console.log('\n1️⃣ CHECKING ENVIRONMENT VARIABLES...');
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
      
      debugResults.environment = {
        hasUrl: !!supabaseUrl,
        hasKey: !!supabaseKey,
        urlFormat: supabaseUrl ? (supabaseUrl.includes('supabase.co') ? 'Valid' : 'Invalid format') : 'Missing',
        keyFormat: supabaseKey ? (supabaseKey.startsWith('eyJ') ? 'Valid JWT' : 'Invalid format') : 'Missing',
        rawUrl: supabaseUrl,
        rawKey: supabaseKey
      };

      console.log('Environment check:', debugResults.environment);

      if (!supabaseUrl || !supabaseKey) {
        debugResults.recommendations.push('Missing environment variables. Check your .env file.');
        setResults(debugResults);
        setIsRunning(false);
        return;
      }

      // 2. Authentication Check
      console.log('\n2️⃣ CHECKING AUTHENTICATION...');
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      debugResults.authentication = {
        isAuthenticated: !!user,
        userId: user?.id,
        email: user?.email,
        userMetadata: user?.user_metadata,
        error: authError?.message
      };

      console.log('Auth check:', debugResults.authentication);

      // 3. Raw Storage API Test
      console.log('\n3️⃣ TESTING RAW STORAGE API...');
      
      // Test with direct fetch to Supabase storage API
      const storageApiUrl = `${supabaseUrl}/storage/v1/bucket`;
      console.log('Storage API URL:', storageApiUrl);
      
      try {
        const response = await fetch(storageApiUrl, {
          headers: {
            'Authorization': `Bearer ${supabaseKey}`,
            'apikey': supabaseKey
          }
        });
        
        const responseText = await response.text();
        let responseData;
        
        try {
          responseData = JSON.parse(responseText);
        } catch {
          responseData = responseText;
        }
        
        debugResults.storage = {
          apiResponse: {
            status: response.status,
            statusText: response.statusText,
            headers: Object.fromEntries(response.headers.entries()),
            data: responseData
          }
        };
        
        console.log('Raw storage API response:', debugResults.storage);
        
      } catch (fetchError) {
        debugResults.storage = {
          apiError: fetchError instanceof Error ? fetchError.message : 'Unknown fetch error'
        };
        console.error('Raw API fetch failed:', fetchError);
      }

      // 4. Supabase Client Storage Test
      console.log('\n4️⃣ TESTING SUPABASE CLIENT STORAGE...');
      
      const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
      
      debugResults.buckets = {
        success: !bucketsError,
        error: bucketsError?.message,
        errorCode: bucketsError?.statusCode,
        bucketCount: buckets?.length || 0,
        bucketNames: buckets?.map(b => b.name) || [],
        bucketDetails: buckets?.map(b => ({
          name: b.name,
          id: b.id,
          public: b.public,
          created_at: b.created_at,
          updated_at: b.updated_at
        })) || [],
        rawResponse: buckets
      };

      console.log('Buckets check:', debugResults.buckets);

      // 5. Target Bucket Specific Test
      console.log('\n5️⃣ TESTING TARGET BUCKET ACCESS...');
      
      const targetBucketName = 'event-images';
      const targetBucket = buckets?.find(b => b.name === targetBucketName);
      
      if (targetBucket) {
        console.log(`✅ Found bucket "${targetBucketName}":`, targetBucket);
        
        // Test file listing
        const { data: files, error: listError } = await supabase.storage
          .from(targetBucketName)
          .list('', { limit: 5 });
        
        debugResults.permissions = {
          bucketFound: true,
          bucketDetails: targetBucket,
          listFiles: {
            success: !listError,
            error: listError?.message,
            fileCount: files?.length || 0,
            files: files?.slice(0, 3) || []
          }
        };

        // Test upload if listing works
        if (!listError) {
          console.log('📤 Testing upload permissions...');
          const testBlob = new Blob(['debug-test'], { type: 'text/plain' });
          const testPath = `debug_test_${Date.now()}.txt`;
          
          const { data: uploadData, error: uploadError } = await supabase.storage
            .from(targetBucketName)
            .upload(testPath, testBlob);
          
          debugResults.permissions.upload = {
            success: !uploadError,
            error: uploadError?.message,
            path: uploadData?.path
          };

          // Clean up test file if upload succeeded
          if (!uploadError && uploadData?.path) {
            await supabase.storage
              .from(targetBucketName)
              .remove([uploadData.path]);
          }
        }
        
      } else {
        console.error(`❌ Bucket "${targetBucketName}" not found`);
        debugResults.permissions = {
          bucketFound: false,
          availableBuckets: buckets?.map(b => b.name) || []
        };
      }

      // 6. Generate Recommendations
      console.log('\n6️⃣ GENERATING RECOMMENDATIONS...');
      
      if (!debugResults.buckets.success) {
        debugResults.recommendations.push('Cannot access storage API - check your Supabase URL and API key');
      } else if (debugResults.buckets.bucketCount === 0) {
        debugResults.recommendations.push('No storage buckets found - create the "event-images" bucket in Supabase dashboard');
      } else if (!debugResults.permissions.bucketFound) {
        debugResults.recommendations.push(`Bucket "event-images" not found. Available buckets: ${debugResults.buckets.bucketNames.join(', ')}`);
      } else if (debugResults.permissions.listFiles && !debugResults.permissions.listFiles.success) {
        debugResults.recommendations.push('Bucket exists but listing files failed - check RLS policies for SELECT operations');
      } else if (debugResults.permissions.upload && !debugResults.permissions.upload.success) {
        debugResults.recommendations.push('Bucket access works but uploads fail - check RLS policies for INSERT operations');
      } else {
        debugResults.recommendations.push('All storage tests passed! The issue might be elsewhere.');
      }

      console.log('\n' + '='.repeat(60));
      console.log('🏁 COMPREHENSIVE DEBUG COMPLETE');
      
      setResults(debugResults);

    } catch (error) {
      console.error('❌ Debug failed:', error);
      setResults({
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      });
    } finally {
      setIsRunning(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <Database className="w-5 h-5 text-gray-600" />
          <h3 className="text-lg font-semibold text-gray-900">Storage Debugger</h3>
        </div>
        <button
          onClick={runComprehensiveDebug}
          disabled={isRunning}
          className="flex items-center space-x-2 bg-blue-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-600 transition-colors disabled:opacity-50"
        >
          {isRunning ? (
            <Loader className="w-4 h-4 animate-spin" />
          ) : (
            <RefreshCw className="w-4 h-4" />
          )}
          <span>{isRunning ? 'Debugging...' : 'Run Full Debug'}</span>
        </button>
      </div>

      {results && (
        <div className="space-y-6">
          {/* Environment Variables */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-medium text-gray-900">Environment Variables</h4>
              <button
                onClick={() => setShowEnvVars(!showEnvVars)}
                className="text-blue-600 hover:text-blue-800"
              >
                {showEnvVars ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span>Supabase URL:</span>
                <div className="flex items-center space-x-2">
                  <span className={results.environment.hasUrl ? 'text-green-600' : 'text-red-600'}>
                    {results.environment.hasUrl ? '✅ Present' : '❌ Missing'}
                  </span>
                  {showEnvVars && results.environment.rawUrl && (
                    <button
                      onClick={() => copyToClipboard(results.environment.rawUrl)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <Copy className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <span>Supabase Key:</span>
                <div className="flex items-center space-x-2">
                  <span className={results.environment.hasKey ? 'text-green-600' : 'text-red-600'}>
                    {results.environment.hasKey ? '✅ Present' : '❌ Missing'}
                  </span>
                  {showEnvVars && results.environment.rawKey && (
                    <button
                      onClick={() => copyToClipboard(results.environment.rawKey)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <Copy className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>

              {showEnvVars && (
                <div className="mt-3 p-3 bg-white rounded border text-xs font-mono">
                  <div>URL: {results.environment.rawUrl || 'Not set'}</div>
                  <div>Key: {results.environment.rawKey ? `${results.environment.rawKey.substring(0, 20)}...` : 'Not set'}</div>
                </div>
              )}
            </div>
          </div>

          {/* Authentication Status */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-3">Authentication</h4>
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span>User Status:</span>
                <span className={results.authentication.isAuthenticated ? 'text-green-600' : 'text-yellow-600'}>
                  {results.authentication.isAuthenticated ? '✅ Authenticated' : '⚠️ Not authenticated'}
                </span>
              </div>
              {results.authentication.email && (
                <div className="flex items-center justify-between">
                  <span>Email:</span>
                  <span className="text-gray-600">{results.authentication.email}</span>
                </div>
              )}
            </div>
          </div>

          {/* Storage API Response */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-medium text-gray-900">Storage API Response</h4>
              <button
                onClick={() => setShowRawResponse(!showRawResponse)}
                className="text-blue-600 hover:text-blue-800"
              >
                {showRawResponse ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            
            {results.storage.apiError ? (
              <div className="text-red-600 text-sm">
                ❌ API Error: {results.storage.apiError}
              </div>
            ) : (
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span>API Status:</span>
                  <span className={results.storage.apiResponse?.status === 200 ? 'text-green-600' : 'text-red-600'}>
                    {results.storage.apiResponse?.status || 'Unknown'}
                  </span>
                </div>
                
                {showRawResponse && results.storage.apiResponse && (
                  <div className="mt-3 p-3 bg-white rounded border">
                    <pre className="text-xs overflow-auto max-h-40">
                      {JSON.stringify(results.storage.apiResponse, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Buckets Information */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-3">Storage Buckets</h4>
            
            {results.buckets.error ? (
              <div className="text-red-600 text-sm">
                ❌ Error: {results.buckets.error}
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span>Total Buckets Found:</span>
                  <span className="font-medium">{results.buckets.bucketCount}</span>
                </div>
                
                {results.buckets.bucketNames.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-2">Available Buckets:</p>
                    <div className="space-y-1">
                      {results.buckets.bucketDetails.map((bucket: any) => (
                        <div key={bucket.name} className="flex items-center justify-between text-xs bg-white p-2 rounded border">
                          <span className="font-mono">{bucket.name}</span>
                          <div className="flex items-center space-x-2">
                            <span className={bucket.public ? 'text-green-600' : 'text-orange-600'}>
                              {bucket.public ? 'PUBLIC' : 'PRIVATE'}
                            </span>
                            {bucket.name === 'event-images' && (
                              <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">TARGET</span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Permissions Test */}
          {results.permissions && (
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-3">Permissions Test</h4>
              
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span>Target Bucket Found:</span>
                  <span className={results.permissions.bucketFound ? 'text-green-600' : 'text-red-600'}>
                    {results.permissions.bucketFound ? '✅ Yes' : '❌ No'}
                  </span>
                </div>
                
                {results.permissions.listFiles && (
                  <div className="flex items-center justify-between">
                    <span>File Listing:</span>
                    <span className={results.permissions.listFiles.success ? 'text-green-600' : 'text-red-600'}>
                      {results.permissions.listFiles.success ? '✅ Success' : '❌ Failed'}
                    </span>
                  </div>
                )}
                
                {results.permissions.upload && (
                  <div className="flex items-center justify-between">
                    <span>Upload Test:</span>
                    <span className={results.permissions.upload.success ? 'text-green-600' : 'text-red-600'}>
                      {results.permissions.upload.success ? '✅ Success' : '❌ Failed'}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Recommendations */}
          {results.recommendations.length > 0 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h4 className="font-medium text-yellow-900 mb-3">Recommendations</h4>
              <ul className="space-y-2">
                {results.recommendations.map((rec: string, index: number) => (
                  <li key={index} className="text-yellow-800 text-sm flex items-start">
                    <span className="mr-2">•</span>
                    <span>{rec}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Quick Actions */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-medium text-blue-900 mb-3">Quick Actions</h4>
            <div className="space-y-2">
              <a
                href={`${results.environment.rawUrl}/project/default/storage/buckets`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center space-x-2 text-blue-700 hover:text-blue-900 text-sm"
              >
                <ExternalLink className="w-4 h-4" />
                <span>Open Supabase Storage Dashboard</span>
              </a>
              
              <button
                onClick={() => copyToClipboard(JSON.stringify(results, null, 2))}
                className="inline-flex items-center space-x-2 text-blue-700 hover:text-blue-900 text-sm"
              >
                <Copy className="w-4 h-4" />
                <span>Copy Debug Report</span>
              </button>
            </div>
          </div>

          {/* Manual Setup Instructions */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h4 className="font-medium text-green-900 mb-3">Manual Setup Instructions</h4>
            <div className="text-green-800 text-sm space-y-2">
              <p><strong>1. Create Bucket:</strong></p>
              <ul className="ml-4 space-y-1">
                <li>• Go to Supabase Dashboard → Storage → Buckets</li>
                <li>• Click "Create a new bucket"</li>
                <li>• Name: <code className="bg-green-100 px-1 rounded">event-images</code></li>
                <li>• Make it <strong>PUBLIC</strong></li>
              </ul>
              
              <p><strong>2. Add RLS Policies:</strong></p>
              <ul className="ml-4 space-y-1">
                <li>• Go to bucket → Policies tab</li>
                <li>• Add policy for SELECT (public read)</li>
                <li>• Add policy for INSERT (authenticated upload)</li>
                <li>• Add policy for UPDATE (authenticated update)</li>
                <li>• Add policy for DELETE (authenticated delete)</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StorageDebugger;