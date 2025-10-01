import React, { useState, useEffect } from 'react';
import { AlertCircle, CheckCircle, Loader, MapPin } from 'lucide-react';

// Declare Google Maps types
declare global {
  interface Window {
    google?: any;
    gm_authFailure?: () => void;
    initGoogleMapsTest?: () => void;
  }
}

interface GoogleMapsStatus {
  apiKeyExists: boolean;
  canLoadMaps: boolean;
  canLoadPlaces: boolean;
  error?: string;
  details?: string;
}

const GoogleMapsDiagnostic: React.FC = () => {
  const [status, setStatus] = useState<GoogleMapsStatus>({
    apiKeyExists: false,
    canLoadMaps: false,
    canLoadPlaces: false
  });
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const checkGoogleMapsAPI = async () => {
      try {
        setIsChecking(true);        // Check if API key exists
        const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
        if (!apiKey) {
          setStatus({
            apiKeyExists: false,
            canLoadMaps: false,
            canLoadPlaces: false,
            error: 'Google Maps API key not found',
            details: 'VITE_GOOGLE_MAPS_API_KEY is not set in environment variables'
          });
          setIsChecking(false);
          return;
        }

        // Try to load the Google Maps API
        const script = document.createElement('script');
        script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&callback=initGoogleMapsTest`;
        script.async = true;
        script.defer = true;

        // Listen for Google Maps errors
        window.gm_authFailure = () => {
          setStatus({
            apiKeyExists: true,
            canLoadMaps: false,
            canLoadPlaces: false,
            error: 'Google Maps authentication failed',
            details: 'Your API key is restricted or invalid. Check your API key restrictions in Google Cloud Console and ensure localhost:5173 is allowed.'
          });
        };

        // Create a promise that resolves when the script loads
        const loadPromise = new Promise<string>((resolve, reject) => {
          script.onload = () => resolve('loaded');
          script.onerror = (error) => reject(error);
          
          // Set up the callback
          window.initGoogleMapsTest = () => {
            try {
              // Test if we can create a map
              const mapDiv = document.createElement('div');
              const map = new window.google.maps.Map(mapDiv, {
                center: { lat: 37.7749, lng: -122.4194 },
                zoom: 13
              });

              // Test if places service is available
              const service = new window.google.maps.places.PlacesService(map);
              console.log('Places service created:', !!service);

              setStatus({
                apiKeyExists: true,
                canLoadMaps: true,
                canLoadPlaces: true,
                details: 'Google Maps API is working correctly'
              });
            } catch (error) {
              setStatus({
                apiKeyExists: true,
                canLoadMaps: false,
                canLoadPlaces: false,
                error: 'Failed to initialize Google Maps',
                details: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`
              });
            }
            resolve('callback executed');
          };
        });

        document.head.appendChild(script);
        
        // Wait for the script to load with a timeout
        const timeoutPromise = new Promise<never>((_, reject) => {
          setTimeout(() => reject(new Error('Timeout loading Google Maps API')), 10000);
        });

        await Promise.race([loadPromise, timeoutPromise]);

      } catch (error) {
        console.error('Google Maps API check failed:', error);
        
        let errorMessage = 'Unknown error';
        let details = '';
        
        if (error instanceof Error) {
          errorMessage = error.message;
          
          if (error.message.includes('RefererNotAllowedMapError')) {
            details = 'Your API key is restricted to specific domains. Add localhost:5173 and localhost:5174 to allowed referrers.';
          } else if (error.message.includes('ApiNotActivatedMapError')) {
            details = 'Maps JavaScript API is not enabled. Enable it in Google Cloud Console.';
          } else if (error.message.includes('BillingNotEnabledMapError')) {
            details = 'Billing is not enabled for this project. Enable billing in Google Cloud Console.';
          } else if (error.message.includes('InvalidKeyMapError')) {
            details = 'The provided API key is invalid.';
          } else if (error.message.includes('Timeout')) {
            details = 'Google Maps API failed to load within 10 seconds. Check your internet connection.';
          }
        }

        setStatus({
          apiKeyExists: true,
          canLoadMaps: false,
          canLoadPlaces: false,
          error: errorMessage,
          details: details
        });
      } finally {
        setIsChecking(false);
      }
    };

    checkGoogleMapsAPI();
  }, []);

  const StatusIcon = ({ success }: { success: boolean }) => (
    success ? (
      <CheckCircle className="w-5 h-5 text-green-500" />
    ) : (
      <AlertCircle className="w-5 h-5 text-red-500" />
    )
  );

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
      <div className="flex items-center gap-3 mb-6">
        <MapPin className="w-6 h-6 text-blue-500" />
        <h3 className="text-lg font-semibold text-gray-900">Google Maps API Status</h3>
        {isChecking && <Loader className="w-5 h-5 animate-spin text-blue-500" />}
      </div>

      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <StatusIcon success={status.apiKeyExists} />
          <span className="text-gray-700">
            API Key Configured: {status.apiKeyExists ? 'Yes' : 'No'}
          </span>
        </div>

        <div className="flex items-center gap-3">
          <StatusIcon success={status.canLoadMaps} />
          <span className="text-gray-700">
            Maps API Loading: {status.canLoadMaps ? 'Success' : 'Failed'}
          </span>
        </div>

        <div className="flex items-center gap-3">
          <StatusIcon success={status.canLoadPlaces} />
          <span className="text-gray-700">
            Places API Loading: {status.canLoadPlaces ? 'Success' : 'Failed'}
          </span>
        </div>

        {status.error && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <h4 className="font-medium text-red-800 mb-2">Error Details:</h4>
            <p className="text-red-700 text-sm mb-2">{status.error}</p>
            {status.details && (
              <p className="text-red-600 text-sm">{status.details}</p>
            )}
          </div>
        )}

        {status.details && !status.error && (
          <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-green-700 text-sm">{status.details}</p>
          </div>
        )}

        {status.error && (
          <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h4 className="font-medium text-blue-800 mb-2">Common Solutions:</h4>
            <ul className="text-blue-700 text-sm space-y-1">
              <li>• <strong>Most Common Fix:</strong> Add localhost:5173 to API key restrictions</li>
              <li>• Enable Maps JavaScript API and Places API in Google Cloud Console</li>
              <li>• Add these to HTTP referrers: http://localhost:5173/*, http://localhost:5174/*</li>
              <li>• Ensure billing is enabled for your Google Cloud project</li>
              <li>• Verify your API key is not restricted to specific IPs/domains</li>
              <li>• Check that your API key has sufficient quota remaining</li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default GoogleMapsDiagnostic;
