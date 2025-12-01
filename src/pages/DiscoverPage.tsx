import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  MapPin,
  Calendar,
  Users,
  SlidersHorizontal,
  X,
  Loader,
  CreditCard,
  Clock,
  Filter
} from 'lucide-react';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';
import { EventService } from '../services/eventService';
import type { Event } from '../lib/supabase';

interface EventWithOrganizer extends Event {
  organizers?: {
    id: string;
    organization_name: string;
    first_name: string;
    last_name: string;
    is_verified: boolean;
    avatar_url?: string;
    logo_url?: string;
  } | null;
}

const DiscoverPage = () => {
  const navigate = useNavigate();
  const [events, setEvents] = useState<EventWithOrganizer[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<EventWithOrganizer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEvent, setSelectedEvent] = useState<EventWithOrganizer | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  const [filters, setFilters] = useState({
    category: 'all',
    priceRange: 'all',
    sortBy: 'date'
  });

  useEffect(() => {
    loadEvents();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [searchQuery, filters, events]);

  const loadEvents = async () => {
    setIsLoading(true);
    const result = await EventService.getPublishedEvents(100, true);

    if (result.success && result.events) {
      setEvents(result.events);
    }
    setIsLoading(false);
  };

  const applyFilters = () => {
    let filtered = [...events];

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(event =>
        event.title.toLowerCase().includes(query) ||
        event.location.toLowerCase().includes(query) ||
        event.category.toLowerCase().includes(query) ||
        event.description?.toLowerCase().includes(query)
      );
    }

    if (filters.category !== 'all') {
      filtered = filtered.filter(event => event.category === filters.category);
    }

    if (filters.priceRange !== 'all') {
      if (filters.priceRange === 'free') {
        filtered = filtered.filter(event => event.price === 0);
      } else if (filters.priceRange === 'paid') {
        filtered = filtered.filter(event => event.price > 0);
      }
    }

    if (filters.sortBy === 'date') {
      filtered.sort((a, b) => new Date(a.start_date).getTime() - new Date(b.start_date).getTime());
    } else if (filters.sortBy === 'price-low') {
      filtered.sort((a, b) => a.price - b.price);
    } else if (filters.sortBy === 'price-high') {
      filtered.sort((a, b) => b.price - a.price);
    } else if (filters.sortBy === 'popularity') {
      filtered.sort((a, b) => b.capacity - a.capacity);
    }

    setFilteredEvents(filtered);
  };

  const formatEventDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatEventTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const categories = ['all', 'Concert', 'Conference', 'Workshop', 'Meetup', 'Festival', 'Sports', 'Other'];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
      <Navigation />

      <div className="pt-24 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Discover Events
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Browse and find exciting events happening around you
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search events by name, location, or category..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
              >
                <Filter className="w-5 h-5" />
                Filters
              </button>
            </div>

            {showFilters && (
              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Category
                    </label>
                    <select
                      value={filters.category}
                      onChange={(e) => setFilters({...filters, category: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      {categories.map(cat => (
                        <option key={cat} value={cat}>
                          {cat === 'all' ? 'All Categories' : cat}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Price Range
                    </label>
                    <select
                      value={filters.priceRange}
                      onChange={(e) => setFilters({...filters, priceRange: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="all">All Prices</option>
                      <option value="free">Free Events</option>
                      <option value="paid">Paid Events</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Sort By
                    </label>
                    <select
                      value={filters.sortBy}
                      onChange={(e) => setFilters({...filters, sortBy: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="date">Date (Earliest First)</option>
                      <option value="price-low">Price (Low to High)</option>
                      <option value="price-high">Price (High to Low)</option>
                      <option value="popularity">Popularity</option>
                    </select>
                  </div>
                </div>
              </div>
            )}
          </div>

          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader className="w-12 h-12 text-blue-500 animate-spin mb-4" />
              <p className="text-gray-600">Loading events...</p>
            </div>
          ) : filteredEvents.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-xl text-gray-600 mb-4">No events found</p>
              <p className="text-gray-500">Try adjusting your search or filters</p>
            </div>
          ) : (
            <>
              <div className="mb-6 text-gray-600">
                Showing {filteredEvents.length} {filteredEvents.length === 1 ? 'event' : 'events'}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredEvents.map((event) => (
                  <div
                    key={event.id}
                    onClick={() => setSelectedEvent(event)}
                    className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 cursor-pointer"
                  >
                    <div className="relative h-48 overflow-hidden">
                      <img
                        src={event.image_url || 'https://images.pexels.com/photos/2608517/pexels-photo-2608517.jpeg?auto=compress&cs=tinysrgb&w=800'}
                        alt={event.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-3 right-3 bg-white/90 px-3 py-1 rounded-full text-sm font-bold text-blue-600">
                        {event.price === 0 ? 'FREE' : `₵${event.price}`}
                      </div>
                    </div>

                    <div className="p-5">
                      <div className="mb-2">
                        <span className="inline-block px-3 py-1 bg-blue-100 text-blue-600 text-xs font-semibold rounded-full">
                          {event.category}
                        </span>
                      </div>

                      <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2">
                        {event.title}
                      </h3>

                      <div className="space-y-2 text-sm text-gray-600 mb-4">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-blue-500" />
                          <span>{formatEventDate(event.start_date)}</span>
                        </div>

                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-blue-500" />
                          <span>{formatEventTime(event.start_date)}</span>
                        </div>

                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-blue-500" />
                          <span className="line-clamp-1">{event.location}</span>
                        </div>

                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4 text-blue-500" />
                          <span>{event.capacity} capacity</span>
                        </div>
                      </div>

                      {event.organizers && (
                        <div className="flex items-center gap-2 pt-3 border-t border-gray-100">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-pink-400 flex items-center justify-center text-white font-bold text-sm overflow-hidden">
                            {event.organizers.logo_url ? (
                              <img
                                src={event.organizers.logo_url}
                                alt={event.organizers.organization_name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              (event.organizers.organization_name || event.organizers.first_name || 'O').charAt(0).toUpperCase()
                            )}
                          </div>
                          <span className="text-sm text-gray-700 font-medium">
                            {event.organizers.organization_name ||
                             `${event.organizers.first_name} ${event.organizers.last_name}`}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {selectedEvent && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="relative">
              <button
                onClick={() => setSelectedEvent(null)}
                className="absolute top-4 right-4 z-10 bg-white/90 hover:bg-white p-2 rounded-full shadow-lg transition-colors"
              >
                <X className="w-6 h-6 text-gray-700" />
              </button>

              <div className="relative h-64 md:h-80">
                <img
                  src={selectedEvent.image_url || 'https://images.pexels.com/photos/2608517/pexels-photo-2608517.jpeg?auto=compress&cs=tinysrgb&w=1200'}
                  alt={selectedEvent.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute bottom-4 left-4 bg-blue-600 text-white px-4 py-2 rounded-xl font-bold text-lg">
                  {selectedEvent.price === 0 ? 'FREE EVENT' : `₵${selectedEvent.price}`}
                </div>
              </div>

              <div className="p-8">
                <div className="mb-4">
                  <span className="inline-block px-4 py-2 bg-blue-100 text-blue-600 text-sm font-semibold rounded-full">
                    {selectedEvent.category}
                  </span>
                </div>

                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                  {selectedEvent.title}
                </h2>

                {selectedEvent.description && (
                  <p className="text-gray-700 text-lg mb-6 leading-relaxed">
                    {selectedEvent.description}
                  </p>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                    <Calendar className="w-6 h-6 text-blue-500" />
                    <div>
                      <p className="text-sm text-gray-600">Date</p>
                      <p className="font-semibold text-gray-900">{formatEventDate(selectedEvent.start_date)}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                    <Clock className="w-6 h-6 text-blue-500" />
                    <div>
                      <p className="text-sm text-gray-600">Time</p>
                      <p className="font-semibold text-gray-900">{formatEventTime(selectedEvent.start_date)}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                    <MapPin className="w-6 h-6 text-blue-500" />
                    <div>
                      <p className="text-sm text-gray-600">Location</p>
                      <p className="font-semibold text-gray-900">{selectedEvent.location}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                    <Users className="w-6 h-6 text-blue-500" />
                    <div>
                      <p className="text-sm text-gray-600">Capacity</p>
                      <p className="font-semibold text-gray-900">{selectedEvent.capacity} attendees</p>
                    </div>
                  </div>
                </div>

                {selectedEvent.organizers && (
                  <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl mb-6">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-pink-400 flex items-center justify-center text-white font-bold text-lg overflow-hidden">
                      {selectedEvent.organizers.logo_url ? (
                        <img
                          src={selectedEvent.organizers.logo_url}
                          alt={selectedEvent.organizers.organization_name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        (selectedEvent.organizers.organization_name || selectedEvent.organizers.first_name || 'O').charAt(0).toUpperCase()
                      )}
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Organized by</p>
                      <p className="font-semibold text-gray-900">
                        {selectedEvent.organizers.organization_name ||
                         `${selectedEvent.organizers.first_name} ${selectedEvent.organizers.last_name}`}
                      </p>
                    </div>
                  </div>
                )}

                <div className="flex gap-4">
                  <button
                    onClick={() => navigate(`/events/${selectedEvent.id}`)}
                    className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-8 py-4 rounded-xl font-bold text-lg hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-2"
                  >
                    {selectedEvent.price === 0 ? (
                      <>
                        <Users className="w-6 h-6" />
                        Register Now
                      </>
                    ) : (
                      <>
                        <CreditCard className="w-6 h-6" />
                        Register & Pay ₵{selectedEvent.price}
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default DiscoverPage;
