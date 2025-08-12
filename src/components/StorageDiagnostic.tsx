import React, { useState } from 'react';
import { 
  Database, 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Loader,
  RefreshCw,
  Info
} from 'lucide-react';
import { StorageService } from '../services/storageService';
import { supabase } from '../lib/supabase';

const StorageDiagnostic = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState<any>(null);
  const [showInstructions, setShowInstructions] = useState(false);

  const runDiagnostic = async () => {
    setIsRunning(true);
    setResults(null);

    try {
      console.log('🔍 Running comprehensive storage diagnostic...');
      
      const diagnosticResults = {
        timestamp: new Date().toISOString(),
        steps: [] as any[]
      };

      // Step 1: Check authentication
      console.log('Step 1: Checking authentication...');
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      diagnosticResults.steps.push({
        step: 1,
        name: 'Authentication Check',
        status: user ? 'success' : 'warning',
        message: user ? `Authenticated as ${user.email}` : 'Not authenticated',
        details: { userId: user?.id, authError }
      });

      // Step 2: List all buckets
      console.log('Step 2: Listing storage buckets...');
      const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
      
      if (bucketsError) {
        console.error('❌ Cannot list buckets:', bucketsError);
      } else {
        console.log('📋 Raw buckets response:', buckets);
      }
      
      diagnosticResults.steps.push({
        step: 2,
        name: 'List Storage Buckets',
        status: bucketsError ? 'error' : 'success',
        message: bucketsError 
          ? `Failed: ${bucketsError.message}` 
          : `Found ${buckets?.length || 0} buckets: ${buckets?.map(b => b.name).join(', ') || 'none'}`,
        details: { 
          buckets: buckets?.map(b => ({ name: b.name, public: b.public, id: b.id })) || [],
          error: bucketsError 
        }
      });

      // Step 3: Check target bucket
      console.log('Step 3: Checking event-images bucket...');
      const targetBucket = buckets?.find(b => b.name === 'event-images');
      console.log('🔍 Looking for bucket "event-images" in:', buckets?.map(b => `"${b.name}"`));
      console.log('🎯 Target bucket found:', targetBucket);
      
      diagnosticResults.steps.push({
        step: 3,
        name: 'Target Bucket Check',
        status: targetBucket ? 'success' : 'error',
        message: targetBucket 
          ? `Bucket "event-images" found (${targetBucket.public ? 'PUBLIC' : 'PRIVATE'}, ID: ${targetBucket.id})` 
          : `Bucket "event-images" not found. Available: ${buckets?.map(b => `"${b.name}"`).join(', ') || 'none'}`,
        details: { targetBucket }
      });

      // Step 4: Test bucket access
      if (targetBucket) {
        console.log('Step 4: Testing bucket access...');
        const { data: files, error: listError } = await supabase.storage
          .from('event-images')
          .list('', { limit: 1 });
        
        diagnosticResults.steps.push({
          step: 4,
          name: 'Bucket Access Test',
          status: listError ? 'error' : 'success',
          message: listError 
            ? `Access denied: ${listError.message}` 
            : `Access granted (${files?.length || 0} files visible)`,
          details: { files: files?.slice(0, 3), error: listError }
        });

        // Step 5: Test upload (only if access works)
        if (!listError) {
          console.log('Step 5: Testing upload permissions...');
          const testBlob = new Blob(['diagnostic-test'], { type: 'text/plain' });
          const testPath = `diagnostic_test_${Date.now()}.txt`;
          
          const { data: uploadData, error: uploadError } = await supabase.storage
            .from('event-images')
            .upload(testPath, testBlob);
          
          diagnosticResults.steps.push({
            step: 5,
            name: 'Upload Permission Test',
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
        }
      }

      // Step 6: Run the actual storage service check
      console.log('Step 6: Running StorageService check...');
      const serviceResult = await StorageService.initializeBucketDetailed();
      diagnosticResults.steps.push({
        step: 6,
        name: 'StorageService Check',
        status: serviceResult.success ? 'success' : 'error',
        message: serviceResult.success 
          ? 'StorageService validation passed' 
          : serviceResult.error || 'StorageService validation failed',
        details: serviceResult
      });

      setResults(diagnosticResults);
      console.log('🏁 Diagnostic complete:', diagnosticResults);

    } catch (error) {
      console.error('❌ Diagnostic failed:', error);
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

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <Database className="w-5 h-5 text-gray-600" />
          <h3 className="text-lg font-semibold text-gray-900">Storage Diagnostic</h3>
        </div>
        <button
          onClick={runDiagnostic}
          disabled={isRunning}
          className="flex items-center space-x-2 bg-blue-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-600 transition-colors disabled:opacity-50"
        >
          {isRunning ? (
            <Loader className="w-4 h-4 animate-spin" />
          ) : (
            <RefreshCw className="w-4 h-4" />
          )}
          <span>{isRunning ? 'Running...' : 'Run Diagnostic'}</span>
        </button>
      </div>

      {results && (
        <div className="space-y-4">
          {results.error ? (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center space-x-2">
                <XCircle className="w-5 h-5 text-red-500" />
                <span className="font-medium text-red-800">Diagnostic Failed</span>
              </div>
              <p className="text-red-700 text-sm mt-2">{results.error}</p>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="text-sm text-gray-500 mb-4">
                Diagnostic run at: {new Date(results.timestamp).toLocaleString()}
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

          {/* Setup Instructions */}
          <div className="mt-6 pt-4 border-t border-gray-200">
            <button
              onClick={() => setShowInstructions(!showInstructions)}
              className="flex items-center space-x-2 text-blue-600 hover:text-blue-800 font-medium"
            >
              <Info className="w-4 h-4" />
              <span>Show Setup Instructions</span>
            </button>
            
            {showInstructions && (
              <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-medium text-blue-900 mb-2">Manual Storage Setup</h4>
                <pre className="text-blue-800 text-xs whitespace-pre-wrap">
                  {StorageService.getBucketSetupInstructions()}
                </pre>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default StorageDiagnostic;