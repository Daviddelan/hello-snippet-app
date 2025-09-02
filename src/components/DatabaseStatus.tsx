import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Database, Loader, AlertTriangle, Calendar, Image } from 'lucide-react';
import { testDatabaseConnection, testOrganizerSignupFlow } from '../utils/testDatabase';
import { runMigrationManually, checkMigrationStatus } from '../utils/runMigration';
import { StorageService } from '../services/storageService';
import StorageDebugger from './StorageDebugger';

const DatabaseStatus = () => {
  const [connectionStatus, setConnectionStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [migrationStatus, setMigrationStatus] = useState<'loading' | 'success' | 'error' | 'running'>('loading');
  const [eventsTableStatus, setEventsTableStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [storageStatus, setStorageStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [signupFlowStatus, setSignupFlowStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [isVisible, setIsVisible] = useState(true);
  const [statusMessage, setStatusMessage] = useState('Checking database status...');
  const [showDebugger, setShowDebugger] = useState(false);

  useEffect(() => {
    const runTests = async () => {
      try {
        setStatusMessage('Testing database connection...');
        
        // Test database connection first
        const connectionResult = await testDatabaseConnection();
        setConnectionStatus(connectionResult ? 'success' : 'error');
        
        if (!connectionResult) {
          setStatusMessage('Database connection failed. Please check your Supabase connection.');
          return;
        }

        setStatusMessage('Checking organizers table...');
        
        // Check if organizers migration is needed
        const organizerMigrationNeeded = await checkMigrationStatus();
        
        if (organizerMigrationNeeded.migrated) {
          setMigrationStatus('success');
          setStatusMessage('Organizers table is ready.');
        } else {
          setMigrationStatus('error');
          setStatusMessage('Organizers table migration needed.');
        }
        
        setStatusMessage('Checking events table...');
        
        // Check if events table exists
        const eventsTableExists = await checkEventsTable();
        setEventsTableStatus(eventsTableExists ? 'success' : 'error');
        
        if (!eventsTableExists) {
          setStatusMessage('Events table migration needed. Please run the events migration in Supabase.');
        }
        
        setStatusMessage('Checking storage setup...');
        
        // Check storage setup
        const storageResult = await StorageService.initializeBucketDetailed();
        setStorageStatus(storageResult.success ? 'success' : 'error');
        
        if (!storageResult.success) {
          setStorageStatus('error');
          console.warn('⚠️ Storage setup issue:', storageResult.error);
          console.log('📋 Storage details:', storageResult.details);
          console.log('📝 Setup instructions:', storageResult.instructions);
          setStatusMessage(storageResult.error || 'Storage bucket needs setup');
        }
        
        setStatusMessage('Testing organizer signup flow...');
        
        // Test signup flow
        const signupResult = await testOrganizerSignupFlow();
        setSignupFlowStatus(signupResult ? 'success' : 'error');
        
        if (signupResult && eventsTableExists && storageResult.success) {
          setStatusMessage('All systems operational!');
          // Auto-hide after 10 seconds if all tests pass
          setTimeout(() => setIsVisible(false), 10000);
        } else {
          setStatusMessage('Some systems need setup.');
        }
        
      } catch (error) {
        console.error('Error during database setup:', error);
        setConnectionStatus('error');
        setMigrationStatus('error');
        setEventsTableStatus('error');
        setStorageStatus('error');
        setSignupFlowStatus('error');
        setStatusMessage('Unexpected error during database setup.');
      }
    };

    runTests();
  }, []);

  const checkEventsTable = async () => {
    try {
      const { data, error } = await import('../lib/supabase').then(module => 
        module.supabase
          .from('events')
          .select('id')
          .limit(1)
      );

      if (error && error.code === '42P01') {
        // Table doesn't exist
        return false;
      }

      // Table exists
      return true;
    } catch (error) {
      return false;
    }
  };

  if (!isVisible) return null;

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'loading': return <Loader className="w-4 h-4 animate-spin" />;
      case 'running': return <Loader className="w-4 h-4 animate-spin text-blue-500" />;
      case 'success': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'error': return <XCircle className="w-4 h-4 text-red-500" />;
      default: return <Loader className="w-4 h-4 animate-spin" />;
    }
  };

  const getOverallStatus = () => {
    if (connectionStatus === 'error' || migrationStatus === 'error' || eventsTableStatus === 'error' || storageStatus === 'error' || signupFlowStatus === 'error') {
      return 'error';
    }
    if (connectionStatus === 'success' && migrationStatus === 'success' && eventsTableStatus === 'success' && storageStatus === 'success' && signupFlowStatus === 'success') {
      return 'success';
    }
    return 'loading';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'border-green-200 bg-green-50';
      case 'error': return 'border-red-200 bg-red-50';
      default: return 'border-blue-200 bg-blue-50';
    }
  };

  const overallStatus = getOverallStatus();

  return (
    <div className="fixed top-24 right-4 z-50 max-w-sm">
      <div className={`rounded-2xl border p-4 shadow-lg backdrop-blur-sm ${getStatusColor(overallStatus)}`}>
        <div className="flex items-center space-x-2 mb-3">
          <Database className="w-5 h-5 text-gray-600" />
          <h3 className="font-semibold text-gray-900">System Setup</h3>
          <button 
            onClick={() => setIsVisible(false)}
            className="ml-auto text-gray-400 hover:text-gray-600"
          >
            ×
          </button>
        </div>
        
        <div className="space-y-2 text-sm">
          <div className="flex items-center justify-between">
            <span>Database Connection</span>
            {getStatusIcon(connectionStatus)}
          </div>
          <div className="flex items-center justify-between">
            <span>Organizers Table</span>
            {getStatusIcon(migrationStatus)}
          </div>
          <div className="flex items-center justify-between">
            <span>Events Table</span>
            {getStatusIcon(eventsTableStatus)}
          </div>
          <div className="flex items-center justify-between">
            <span>Image Storage</span>
            {getStatusIcon(storageStatus)}
          </div>
          <div className="flex items-center justify-between">
            <span>Signup Flow</span>
            {getStatusIcon(signupFlowStatus)}
          </div>
        </div>
        
        <div className="mt-3 p-2 rounded-lg text-xs">
          <p className="text-gray-700">{statusMessage}</p>
        </div>
        
        {overallStatus === 'error' && (
          <div className="mt-3 p-2 bg-red-100 rounded-lg">
            <div className="flex items-start space-x-2">
              <AlertTriangle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
              <div className="text-xs text-red-700">
                <p className="font-medium mb-1">Setup Required:</p>
                {eventsTableStatus === 'error' && (
                  <div className="mb-2">
                    <p>⚠️ Events table missing!</p>
                    <p className="mt-1">Run this migration in Supabase SQL Editor:</p>
                    <code className="block bg-red-200 p-1 rounded text-xs mt-1">
                      supabase/migrations/20250616155714_weathered_bar.sql
                    </code>
                  </div>
                )}
                {migrationStatus === 'error' && (
                  <div className="mb-2">
                    <p>⚠️ Organizers table missing!</p>
                    <p className="mt-1">Run this migration first:</p>
                    <code className="block bg-red-200 p-1 rounded text-xs mt-1">
                      supabase/migrations/20250616090710_lively_bread.sql
                    </code>
                  </div>
                )}
                {storageStatus === 'error' && (
                  <div className="mb-2">
                    <p>⚠️ Storage bucket setup failed!</p>
                    <p className="mt-1">Check Supabase storage permissions and API keys.</p>
                  </div>
                )}
                <p className="mt-1">Please ensure you've connected to Supabase using the button in the top right.</p>
              </div>
            </div>
          </div>
        )}
        
        {overallStatus === 'success' && (
          <div className="mt-3 p-2 bg-green-100 rounded-lg">
            <p className="text-xs text-green-700">
              ✅ All systems ready! Event management with image storage is fully operational.
            </p>
          </div>
        )}

        {storageStatus === 'error' && connectionStatus === 'success' && (
          <div className="mt-3 p-2 bg-yellow-100 rounded-lg">
            <div className="flex items-start space-x-2">
              <Image className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" />
              <div className="text-xs text-yellow-700">
                <p className="font-medium mb-1">Storage Setup Required:</p>
                <p>Create "event-images" bucket in Supabase Dashboard → Storage → New bucket. Make it public with file upload policies.</p>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Debug Tools */}
      <div className="mt-4">
        <button
          onClick={() => setShowDebugger(!showDebugger)}
          className="text-xs text-blue-600 hover:text-blue-800 underline"
        >
          {showDebugger ? 'Hide' : 'Show'} Storage Debugger
        </button>
        
        {showDebugger && (
          <div className="mt-4">
            <StorageDebugger />
          </div>
        )}
      </div>
    </div>
  );
};

export default DatabaseStatus;