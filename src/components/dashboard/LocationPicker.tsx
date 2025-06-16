import React, { useState, useEffect, useRef, useCallback } from 'react';
import { MapPin, Search, X, Check, Loader } from 'lucide-react';
import { Loader as GoogleMapsLoader } from '@googlemaps/js-api-loader';

interface LocationPickerProps {
  onLocationSelected: (location: { address: string; lat: number; lng: number }) => void;
  onClose: () => void;
  initialLocation?: string;
}

const LocationPicker: React.FC<LocationPickerProps> = ({ 
  onLocationSelected, 
  onClose, 
  initialLocation = '' 
}) => {
  const [searchQuery, setSearchQuery] = useState(initialLocation);
  const [selectedLocation, setSelectedLocation] = useState<{
    address: string;
    lat: number;
    lng: number;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const markerRef = useRef<google.maps.Marker | null>(null);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Initialize Google Maps
  useEffect(() => {
    const initializeMap = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Check if Google Maps API key is available
        const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
        if (!apiKey) {
          setError('Google Maps API key not configured. Please add VITE_GOOGLE_MAPS_API_KEY to your environment variables.');
          setIsLoading(false);
          return;
        }

        const loader = new GoogleMapsLoader({
          apiKey: apiKey,
          version: 'weekly',
          libraries: ['places']
        });

        await loader.load();

        if (!mapRef.current) return;

        // Default to San Francisco
        const defaultCenter = { lat: 37.7749, lng: -122.4194 };
        
        // Initialize map
        const map = new google.maps.Map(mapRef.current, {
          center: defaultCenter,
          zoom: 13,
          styles: [
            {
              featureType: 'poi',
              elementType: 'labels',
              stylers: [{ visibility: 'on' }]
            }
          ]
        });

        mapInstanceRef.current = map;

        // Initialize marker
        const marker = new google.maps.Marker({
          position: defaultCenter,
          map: map,
          draggable: true,
          title: 'Event Location'
        });

        markerRef.current = marker;

        // Initialize autocomplete
        if (searchInputRef.current) {
          const autocomplete = new google.maps.places.Autocomplete(searchInputRef.current, {
            types: ['establishment', 'geocode'],
            fields: ['place_id', 'geometry', 'name', 'formatted_address']
          });

          autocompleteRef.current = autocomplete;

          // Handle place selection
          autocomplete.addListener('place_changed', () => {
            const place = autocomplete.getPlace();
            if (place.geometry && place.geometry.location) {
              const location = {
                address: place.formatted_address || place.name || '',
                lat: place.geometry.location.lat(),
                lng: place.geometry.location.lng()
              };
              
              setSelectedLocation(location);
              map.setCenter(location);
              marker.setPosition(location);
              map.setZoom(15);
            }
          });
        }

        // Handle marker drag
        marker.addListener('dragend', () => {
          const position = marker.getPosition();
          if (position) {
            const geocoder = new google.maps.Geocoder();
            geocoder.geocode({ location: position }, (results, status) => {
              if (status === 'OK' && results && results[0]) {
                const location = {
                  address: results[0].formatted_address,
                  lat: position.lat(),
                  lng: position.lng()
                };
                setSelectedLocation(location);
                setSearchQuery(location.address);
              }
            });
          }
        });

        // Handle map click
        map.addListener('click', (e: google.maps.MapMouseEvent) => {
          if (e.latLng) {
            const geocoder = new google.maps.Geocoder();
            geocoder.geocode({ location: e.latLng }, (results, status) => {
              if (status === 'OK' && results && results[0]) {
                const location = {
                  address: results[0].formatted_address,
                  lat: e.latLng!.lat(),
                  lng: e.latLng!.lng()
                };
                setSelectedLocation(location);
                setSearchQuery(location.address);
                marker.setPosition(e.latLng);
              }
            });
          }
        });

        setIsLoading(false);

      } catch (error) {
        console.error('Error initializing Google Maps:', error);
        setError('Failed to load Google Maps. Please check your internet connection and API key.');
        setIsLoading(false);
      }
    };

    initializeMap();
  }, []);

  const handleConfirmLocation = () => {
    if (selectedLocation) {
      onLocationSelected(selectedLocation);
    }
  };

  const handleSearchManually = () => {
    if (!searchQuery.trim() || !mapInstanceRef.current) return;

    const geocoder = new google.maps.Geocoder();
    geocoder.geocode({ address: searchQuery }, (results, status) => {
      if (status === 'OK' && results && results[0] && results[0].geometry) {
        const location = {
          address: results[0].formatted_address,
          lat: results[0].geometry.location.lat(),
          lng: results[0].geometry.location.lng()
        };
        
        setSelectedLocation(location);
        mapInstanceRef.current!.setCenter(location);
        markerRef.current!.setPosition(location);
        mapInstanceRef.current!.setZoom(15);
      }
    });
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={onClose}></div>
        
        <div className="inline-block align-bottom bg-white rounded-3xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
          {/* Header */}
          <div className="bg-gradient-to-r from-primary-500 to-secondary-500 px-6 py-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-semibold text-white flex items-center">
                <MapPin className="w-6 h-6 mr-2" />
                Choose Event Location
              </h3>
              <button
                onClick={onClose}
                className="text-white hover:text-gray-200 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>

          <div className="p-6">
            {/* Search Bar */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search for a location
              </label>
              <div className="flex space-x-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <input
                    ref={searchInputRef}
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSearchManually()}
                    placeholder="Enter address, venue name, or landmark..."
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-colors"
                  />
                </div>
                <button
                  onClick={handleSearchManually}
                  className="px-4 py-3 bg-primary-500 text-white rounded-xl hover:bg-primary-600 transition-colors"
                >
                  Search
                </button>
              </div>
            </div>

            {/* Error State */}
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
                <div className="flex items-center space-x-2">
                  <X className="w-5 h-5 text-red-500" />
                  <span className="text-red-800 font-medium">{error}</span>
                </div>
                <p className="text-red-700 text-sm mt-2">
                  To use Google Maps, please add your Google Maps API key to the environment variables.
                </p>
              </div>
            )}

            {/* Loading State */}
            {isLoading && (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <Loader className="w-8 h-8 animate-spin text-primary-500 mx-auto mb-4" />
                  <p className="text-gray-600">Loading Google Maps...</p>
                </div>
              </div>
            )}

            {/* Map Container */}
            {!error && (
              <div className="mb-6">
                <div 
                  ref={mapRef} 
                  className="w-full h-96 rounded-xl border border-gray-200"
                  style={{ display: isLoading ? 'none' : 'block' }}
                />
              </div>
            )}

            {/* Selected Location Display */}
            {selectedLocation && (
              <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl">
                <div className="flex items-start space-x-3">
                  <MapPin className="w-5 h-5 text-green-500 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-green-900">Selected Location</h4>
                    <p className="text-green-700 text-sm mt-1">{selectedLocation.address}</p>
                    <p className="text-green-600 text-xs mt-1">
                      Coordinates: {selectedLocation.lat.toFixed(6)}, {selectedLocation.lng.toFixed(6)}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Instructions */}
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-xl">
              <h4 className="font-medium text-blue-900 mb-2">How to select a location:</h4>
              <ul className="text-blue-700 text-sm space-y-1">
                <li>• Search for an address or venue name in the search box</li>
                <li>• Click anywhere on the map to place a marker</li>
                <li>• Drag the marker to fine-tune the location</li>
                <li>• The address will be automatically detected</li>
              </ul>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-4">
              <button
                onClick={onClose}
                className="px-6 py-3 border border-gray-300 rounded-xl text-gray-700 font-medium hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmLocation}
                disabled={!selectedLocation}
                className="px-8 py-3 bg-gradient-to-r from-primary-500 to-secondary-500 text-white rounded-xl font-semibold hover:shadow-lg transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center space-x-2"
              >
                <Check className="w-5 h-5" />
                <span>Use This Location</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LocationPicker;