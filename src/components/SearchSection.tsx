import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, MapPin, Calendar, Filter, Sparkles, X, Loader as LoaderIcon } from 'lucide-react';
import { Loader } from '@googlemaps/js-api-loader'; // Import Google Maps Loader
import { EventService } from '../services/eventService';

const SearchSection = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [location, setLocation] = useState('');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);

  const [eventSuggestions, setEventSuggestions] = useState<string[]>([]);
  const [locationSuggestions, setLocationSuggestions] = useState<string[]>([]);
  const [showEventSuggestions, setShowEventSuggestions] = useState(false);
  const [showLocationSuggestions, setShowLocationSuggestions] = useState(false);

  const searchInputRef = useRef<HTMLInputElement>(null);
  const locationInputRef = useRef<HTMLInputElement>(null);
  const eventSuggestionsRef = useRef<HTMLDivElement>(null);
  const locationSuggestionsRef = useRef<HTMLDivElement>(null);

  const popularSearches = [
    "Tech Conferences",
    "Music Festivals",
    "Business Networking",
    "Art Exhibitions",
    "Food & Wine",
    "Fitness Classes",
    "Sports Events",
    "Comedy Shows"
  ];

  const ghanaianCities = [
    "Accra", "Kumasi", "Tamale", "Takoradi", "Cape Coast",
    "Sunyani", "Koforidua", "Ho", "Wa", "Bolgatanga",
    "Tema", "Obuasi", "Teshie", "Nungua", "Madina",
    "East Legon", "Cantonments", "Labone", "Airport Residential"
  ];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        eventSuggestionsRef.current &&
        !eventSuggestionsRef.current.contains(event.target as Node) &&
        !searchInputRef.current?.contains(event.target as Node)
      ) {
        setShowEventSuggestions(false);
      }
      if (
        locationSuggestionsRef.current &&
        !locationSuggestionsRef.current.contains(event.target as Node) &&
        !locationInputRef.current?.contains(event.target as Node)
      ) {
        setShowLocationSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (searchQuery.length >= 2) {
      fetchEventSuggestions(searchQuery);
    } else {
      setEventSuggestions([]);
      setShowEventSuggestions(false);
    }
  }, [searchQuery]);

  useEffect(() => {
    if (location.length >= 2) {
      fetchLocationSuggestions(location);
    } else {
      setLocationSuggestions([]);
      setShowLocationSuggestions(false);
    }
  }, [location]);

  const fetchEventSuggestions = async (query: string) => {
    const result = await EventService.getPublishedEvents(50, true);
    if (result.success && result.events) {
      const queryLower = query.toLowerCase();

      const titleMatches = result.events
        .filter(event => event.title.toLowerCase().includes(queryLower))
        .map(event => event.title)
        .slice(0, 3);

      const categoryMatches = result.events
        .filter(event => event.category.toLowerCase().includes(queryLower))
        .map(event => event.category)
        .filter((cat, index, self) => self.indexOf(cat) === index)
        .slice(0, 3);

      const descMatches = result.events
        .filter(event => event.description?.toLowerCase().includes(queryLower))
        .map(event => event.title)
        .slice(0, 2);

      const allSuggestions = [
        ...titleMatches,
        ...categoryMatches,
        ...descMatches
      ].filter((item, index, self) => self.indexOf(item) === index).slice(0, 5);

      setEventSuggestions(allSuggestions);
      setShowEventSuggestions(allSuggestions.length > 0);
    }
  };

  const fetchLocationSuggestions = (query: string) => {
    const queryLower = query.toLowerCase();
    const matches = ghanaianCities
      .filter(city => city.toLowerCase().includes(queryLower))
      .slice(0, 5);

    setLocationSuggestions(matches);
    setShowLocationSuggestions(matches.length > 0);
  };

  const detectUserLocation = () => {
    setIsLoadingLocation(true);

    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;

          try {
            // Load Google Maps API
            const loader = new Loader({
              apiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
              version: "weekly",
              libraries: ["places"]
            });

            await loader.load();
            
            // Use Geocoder
            const geocoder = new google.maps.Geocoder();
            const response = await geocoder.geocode({ 
              location: { lat: latitude, lng: longitude } 
            });

            if (response.results[0]) {
              // Extract the most relevant city/locality name
              const addressComponents = response.results[0].address_components;
              
              // Try to find the 'locality' (city) or 'administrative_area_level_1' (region)
              const cityComponent = addressComponents.find(
                (component) => 
                  component.types.includes('locality') || 
                  component.types.includes('administrative_area_level_1')
              );
              
              const detectedLocation = cityComponent 
                ? cityComponent.long_name 
                : response.results[0].formatted_address;

              setLocation(detectedLocation);
            } else {
              // Fallback if no results found
              setLocation('Accra, Ghana');
            }
          } catch (error) {
            console.error("Geocoding error:", error);
            setLocation('Accra, Ghana');
          } finally {
            setIsLoadingLocation(false);
          }
        },
        (error) => {
          console.warn("Geolocation error:", error);
          setLocation('Accra, Ghana');
          setIsLoadingLocation(false);
        }
      );
    } else {
      setLocation('Accra, Ghana');
      setIsLoadingLocation(false);
    }
  };

  useEffect(() => {
    if (!location) {
      detectUserLocation();
    }
  }, []);

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (searchQuery) params.set('q', searchQuery);
    if (location) params.set('location', location);
    if (dateRange.start) params.set('startDate', dateRange.start);
    if (dateRange.end) params.set('endDate', dateRange.end);

    navigate(`/discover?${params.toString()}`);
  };

  const handlePopularSearchClick = (search: string) => {
    setSearchQuery(search);
    const params = new URLSearchParams();
    params.set('q', search);
    if (location) params.set('location', location);
    navigate(`/discover?${params.toString()}`);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const clearDateRange = () => {
    setDateRange({ start: '', end: '' });
    setShowDatePicker(false);
  };

  const formatDateDisplay = () => {
    if (!dateRange.start && !dateRange.end) return 'Date Range';
    if (dateRange.start && !dateRange.end) {
      return new Date(dateRange.start).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
    if (dateRange.start && dateRange.end) {
      const start = new Date(dateRange.start).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      const end = new Date(dateRange.end).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      return `${start} - ${end}`;
    }
    return 'Date Range';
  };

  return (
    <section className="py-16 bg-white relative overflow-hidden">
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-20 left-10 w-32 h-32 rounded-full bg-primary-500"></div>
        <div className="absolute bottom-20 right-20 w-24 h-24 rounded-full bg-secondary-500"></div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-12">
          <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-primary-50 to-secondary-50 px-4 py-2 rounded-full mb-6">
            <Sparkles className="w-4 h-4 text-primary-500" />
            <span className="text-sm font-medium text-primary-700">Find Your Perfect Event</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            What are you looking for?
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Search through thousands of events happening near you or explore new experiences worldwide.
          </p>
        </div>

        <div className="max-w-4xl mx-auto mb-12">
          <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 p-2">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-2">
              <div className="lg:col-span-2 relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 z-10" />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => searchQuery.length >= 2 && setShowEventSuggestions(true)}
                  onKeyPress={handleKeyPress}
                  placeholder="Search events, keywords, or categories..."
                  className="w-full pl-12 pr-4 py-4 text-lg rounded-2xl border-0 focus:ring-2 focus:ring-primary-500/20 focus:outline-none"
                />

                {showEventSuggestions && eventSuggestions.length > 0 && (
                  <div
                    ref={eventSuggestionsRef}
                    className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-xl border border-gray-200 z-50 max-h-64 overflow-y-auto"
                  >
                    {eventSuggestions.map((suggestion, index) => (
                      <button
                        key={index}
                        onClick={() => {
                          setSearchQuery(suggestion);
                          setShowEventSuggestions(false);
                        }}
                        className="w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors flex items-center space-x-3 first:rounded-t-2xl last:rounded-b-2xl"
                      >
                        <Search className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-900">{suggestion}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="relative">
                <MapPin className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 z-10" />
                {isLoadingLocation && (
                  <LoaderIcon className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 animate-spin z-10" />
                )}
                <input
                  ref={locationInputRef}
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  onFocus={() => location.length >= 2 && setShowLocationSuggestions(true)}
                  onKeyPress={handleKeyPress}
                  placeholder="Location"
                  className="w-full pl-12 pr-10 py-4 text-lg rounded-2xl border-0 focus:ring-2 focus:ring-primary-500/20 focus:outline-none"
                />

                {showLocationSuggestions && locationSuggestions.length > 0 && (
                  <div
                    ref={locationSuggestionsRef}
                    className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-xl border border-gray-200 z-50 max-h-64 overflow-y-auto"
                  >
                    {locationSuggestions.map((suggestion, index) => (
                      <button
                        key={index}
                        onClick={() => {
                          setLocation(suggestion);
                          setShowLocationSuggestions(false);
                        }}
                        className="w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors flex items-center space-x-3 first:rounded-t-2xl last:rounded-b-2xl"
                      >
                        <MapPin className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-900">{suggestion}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <button
                onClick={handleSearch}
                className="group bg-gradient-to-r from-primary-500 to-secondary-500 text-white py-4 px-6 rounded-2xl font-semibold text-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 flex items-center justify-center space-x-2"
              >
                <Search className="w-5 h-5 group-hover:scale-110 transition-transform" />
                <span className="hidden sm:inline">Search</span>
              </button>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 mt-6">
            <div className="relative">
              <button
                onClick={() => setShowDatePicker(!showDatePicker)}
                className="flex items-center space-x-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-xl transition-colors duration-200"
              >
                <Calendar className="w-4 h-4" />
                <span>{formatDateDisplay()}</span>
                {(dateRange.start || dateRange.end) && (
                  <X
                    className="w-4 h-4 ml-2 hover:text-red-500"
                    onClick={(e) => {
                      e.stopPropagation();
                      clearDateRange();
                    }}
                  />
                )}
              </button>

              {showDatePicker && (
                <div className="absolute top-full left-0 mt-2 bg-white rounded-2xl shadow-xl border border-gray-200 p-4 z-50 min-w-[300px]">
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Start Date
                      </label>
                      <input
                        type="date"
                        value={dateRange.start}
                        onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        End Date
                      </label>
                      <input
                        type="date"
                        value={dateRange.end}
                        onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                        min={dateRange.start}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      />
                    </div>
                    <button
                      onClick={() => setShowDatePicker(false)}
                      className="w-full bg-primary-500 text-white py-2 rounded-lg hover:bg-primary-600 transition-colors"
                    >
                      Apply
                    </button>
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={handleSearch}
              className="flex items-center space-x-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-xl transition-colors duration-200"
            >
              <Filter className="w-4 h-4" />
              <span>More Filters</span>
            </button>
          </div>
        </div>

        <div className="text-center">
          <p className="text-gray-600 mb-4">Popular searches:</p>
          <div className="flex flex-wrap justify-center gap-3">
            {popularSearches.map((search, index) => (
              <button
                key={index}
                onClick={() => handlePopularSearchClick(search)}
                className="bg-gradient-to-r from-primary-50 to-secondary-50 hover:from-primary-100 hover:to-secondary-100 text-primary-700 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 hover:scale-105"
              >
                {search}
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default SearchSection;