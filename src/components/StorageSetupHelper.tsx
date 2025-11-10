import React, { useState } from 'react';
import { AlertCircle, CheckCircle, Copy, RefreshCw } from 'lucide-react';
import { StorageService } from '../services/storageService';

const StorageSetupHelper: React.FC = () => {
  const [isChecking, setIsChecking] = useState(false);
  const [setupStatus, setSetupStatus] = useState<{
    success: boolean;
    message: string;
    details?: any;
  } | null>(null);
  const [showSQL, setShowSQL] = useState(false);

  const checkStorageSetup = async () => {
    setIsChecking(true);
    const result = await StorageService.initializeBucketDetailed();
    setSetupStatus({
      success: result.success,
      message: result.error || 'Storage is properly configured!',
      details: result.details
    });
    setIsChecking(false);
  };

  const sqlScript = `-- Create the event-images bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'event-images',
  'event-images',
  true,
  10485760,
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 10485760,
  allowed_mime_types = ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];

-- Set up storage policies
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read access for event-images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated uploads for event-images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated updates for event-images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated deletes for event-images" ON storage.objects;

CREATE POLICY "Public read access for event-images"
ON storage.objects FOR SELECT TO public
USING (bucket_id = 'event-images');

CREATE POLICY "Authenticated uploads for event-images"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'event-images');

CREATE POLICY "Authenticated updates for event-images"
ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'event-images')
WITH CHECK (bucket_id = 'event-images');

CREATE POLICY "Authenticated deletes for event-images"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'event-images');`;

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Storage Setup Status</h3>
        <button
          onClick={checkStorageSetup}
          disabled={isChecking}
          className="flex items-center space-x-2 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${isChecking ? 'animate-spin' : ''}`} />
          <span>{isChecking ? 'Checking...' : 'Check Status'}</span>
        </button>
      </div>

      {setupStatus && (
        <div className={`rounded-lg p-4 mb-4 ${
          setupStatus.success
            ? 'bg-green-50 border border-green-200'
            : 'bg-red-50 border border-red-200'
        }`}>
          <div className="flex items-start space-x-3">
            {setupStatus.success ? (
              <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
            ) : (
              <AlertCircle className="w-5 h-5 text-red-500 mt-0.5" />
            )}
            <div className="flex-1">
              <p className={`font-medium ${
                setupStatus.success ? 'text-green-900' : 'text-red-900'
              }`}>
                {setupStatus.success ? 'Storage Ready' : 'Storage Setup Required'}
              </p>
              <p className={`text-sm mt-1 ${
                setupStatus.success ? 'text-green-700' : 'text-red-700'
              }`}>
                {setupStatus.message}
              </p>
            </div>
          </div>
        </div>
      )}

      {setupStatus && !setupStatus.success && (
        <div className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-medium text-blue-900 mb-2">Quick Setup Instructions</h4>
            <ol className="list-decimal list-inside space-y-2 text-sm text-blue-800">
              <li>Go to your <a href="https://supabase.com/dashboard" target="_blank" rel="noopener noreferrer" className="underline font-medium">Supabase Dashboard</a></li>
              <li>Navigate to <strong>SQL Editor</strong></li>
              <li>Click <strong>New query</strong></li>
              <li>Copy and paste the SQL script below</li>
              <li>Click <strong>Run</strong></li>
              <li>Return here and click <strong>Check Status</strong> again</li>
            </ol>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <button
                onClick={() => setShowSQL(!showSQL)}
                className="text-sm font-medium text-primary-600 hover:text-primary-700"
              >
                {showSQL ? 'Hide' : 'Show'} SQL Setup Script
              </button>
              {showSQL && (
                <button
                  onClick={() => copyToClipboard(sqlScript)}
                  className="flex items-center space-x-1 text-sm text-gray-600 hover:text-gray-900"
                >
                  <Copy className="w-4 h-4" />
                  <span>Copy</span>
                </button>
              )}
            </div>

            {showSQL && (
              <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-xs">
                {sqlScript}
              </pre>
            )}
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-sm text-yellow-800">
              <strong>Note:</strong> You need admin/service_role access to create storage buckets.
              If you don't have access, contact your Supabase project administrator.
            </p>
          </div>
        </div>
      )}

      {!setupStatus && (
        <p className="text-gray-600 text-sm">
          Click "Check Status" to verify if your storage bucket is properly configured for logo uploads.
        </p>
      )}
    </div>
  );
};

export default StorageSetupHelper;
