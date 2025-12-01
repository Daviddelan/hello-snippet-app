import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  MapPin, 
  Users, 
  Star, 
  Clock,
  Heart,
  Search,
  Filter,
  Ticket,
  Bell,
  User,
  Settings,
  LogOut,
  TrendingUp,
  Plus
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { EventService } from '../services/eventService';

const AttendeeDashboard = () => {
  const [user, setUser] = useState<any>(null);
  const [events, setEvents] = useState<any[]>([]);
  const [recommendedEvents, setRecommendedEvents] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  useEffect(() => {
    loadUserData();
    loadEvents();
  }, []);

  const loadUserData = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setUser(user);
  };

  const loadEvents = async () => {
    try {
      const result = await EventService.getPublishedEvents(20);
      if (result.success) {
        setEvents(result.events);
        setRecommendedEvents(result.events.slice(0, 6));
      }
    } catch (error) {
      console.error('Error loading events:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  const categories = [
    'All',
    'Music & Entertainment',
    'Technology',
    'Business & Professional',
    'Arts & Culture',
    'Sports',
    'Food & Drink',
    'Health & Fitness'
  ];

  const filteredEvents = events.filter(event => {
    const matchesSearch = event.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || event.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  // Mock user stats
  const userStats = {
    eventsAttended: 12,
    upcomingEvents: 3,
    favoriteEvents: 8,
    connectionsMode: 45
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center">
              <img 
                src="/hellosnippet_transparent.png" 
                alt="HelloSnippet" 
                className="h-8 w-auto"
              />
            </Link>

            {/* Search */}
            <div className="flex-1 max-w-lg mx-8">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search events..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 bg-white py-2 pl-10 pr-3 text-sm placeholder-gray-500 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                />
              </div>
            </div>

            {/* User Menu */}
            <div className="flex items-center space-x-4">
              <button className="relative rounded-full bg-white p-2 text-gray-400 hover:text-gray-500">
                <Bell className="h-5 w-5" />
                <span className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-red-500"></span>
              </button>
              
              <div className="relative">
                <button className="flex items-center space-x-3 rounded-full bg-white p-2 text-sm">
                  <div className="h-8 w-8 rounded-full bg-gradient-to-r from-secondary-500 to-primary-500 flex items-center justify-center">
                    <User className="h-4 w-4 text-white" />
                  </div>
                  <span className="hidden lg:block font-medium text-gray-700">
                    {user?.user_metadata?.first_name || 'User'}
                  </span>
                </button>
              </div>

              <button
                onClick={handleSignOut}
                className="text-gray-400 hover:text-gray-500"
              >
                <LogOut className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-secondary-500 to-primary-500 rounded-2xl p-6 text-white mb-8">
          <h1 className="text-2xl font-bold mb-2">
            Welcome back, {user?.user_metadata?.first_name || 'Event Explorer'}! 🎉
          </h1>
          <p className="text-secondary-100">
            Discover amazing events happening around you and connect with your community.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Events Attended</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{userStats.eventsAttended}</p>
              </div>
              <div className="p-3 rounded-xl bg-gradient-to-r from-green-500 to-green-600">
                <Calendar className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Upcoming Events</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{userStats.upcomingEvents}</p>
              </div>
              <div className="p-3 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600">
                <Clock className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Favorite Events</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{userStats.favoriteEvents}</p>
              </div>
              <div className="p-3 rounded-xl bg-gradient-to-r from-red-500 to-red-600">
                <Heart className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Connections</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{userStats.connectionsMode}</p>
              </div>
              <div className="p-3 rounded-xl bg-gradient-to-r from-purple-500 to-purple-600">
                <Users className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Recommended Events */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Recommended for You</h2>
                <Link to="/discover" className="text-sm text-primary-500 hover:text-primary-600 font-medium">
                  View All
                </Link>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {recommendedEvents.slice(0, 4).map((event) => (
                  <div key={event.id} className="border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg transition-shadow">
                    <img 
                      src={event.image_url || 'https://images.pexels.com/photos/2608517/pexels-photo-2608517.jpeg?auto=compress&cs=tinysrgb&w=400'} 
                      alt={event.title}
                      className="w-full h-32 object-cover"
                    />
                    <div className="p-4">
                      <h3 className="font-semibold text-gray-900 mb-2 line-clamp-1">{event.title}</h3>
                      <div className="space-y-1 text-sm text-gray-600">
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-2" />
                          {new Date(event.start_date).toLocaleDateString()}
                        </div>
                        <div className="flex items-center">
                          <MapPin className="h-4 w-4 mr-2" />
                          {event.location}
                        </div>
                        <div className="flex items-center">
                          <Ticket className="h-4 w-4 mr-2" />
                          {event.price === 0 ? 'Free' : `GH₵${event.price}`}
                        </div>
                      </div>
                      <button className="w-full mt-3 bg-gradient-to-r from-secondary-500 to-primary-500 text-white py-2 rounded-lg text-sm font-medium hover:shadow-lg transition-all">
                        View Details
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* All Events */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">All Events</h2>
                <div className="flex items-center space-x-4">
                  <select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    className="rounded-lg border border-gray-300 bg-white py-2 px-3 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                  >
                    {categories.map(category => (
                      <option key={category} value={category.toLowerCase()}>{category}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-4">
                {filteredEvents.map((event) => (
                  <div key={event.id} className="flex items-center space-x-4 p-4 border border-gray-200 rounded-xl hover:shadow-lg transition-shadow">
                    <img 
                      src={event.image_url || 'https://images.pexels.com/photos/2608517/pexels-photo-2608517.jpeg?auto=compress&cs=tinysrgb&w=400'} 
                      alt={event.title}
                      className="w-16 h-16 rounded-lg object-cover"
                    />
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 mb-1">{event.title}</h3>
                      <div className="flex items-center space-x-4 text-sm text-gray-600">
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-1" />
                          {new Date(event.start_date).toLocaleDateString()}
                        </div>
                        <div className="flex items-center">
                          <MapPin className="h-4 w-4 mr-1" />
                          {event.location}
                        </div>
                        <div className="flex items-center">
                          <Ticket className="h-4 w-4 mr-1" />
                          {event.price === 0 ? 'Free' : `GH₵${event.price}`}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                        <Heart className="h-4 w-4" />
                      </button>
                      <button className="bg-gradient-to-r from-secondary-500 to-primary-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:shadow-lg transition-all">
                        View Details
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <Link
                  to="/discover"
                  className="w-full flex items-center justify-center space-x-2 bg-gradient-to-r from-secondary-500 to-primary-500 text-white px-4 py-3 rounded-xl font-medium hover:shadow-lg transition-all"
                >
                  <Search className="h-4 w-4" />
                  <span>Discover Events</span>
                </Link>
                <button className="w-full flex items-center justify-center space-x-2 bg-white border-2 border-gray-200 text-gray-700 px-4 py-3 rounded-xl font-medium hover:border-primary-300 hover:text-primary-600 transition-colors">
                  <Calendar className="h-4 w-4" />
                  <span>My Calendar</span>
                </button>
                <button className="w-full flex items-center justify-center space-x-2 bg-white border-2 border-gray-200 text-gray-700 px-4 py-3 rounded-xl font-medium hover:border-primary-300 hover:text-primary-600 transition-colors">
                  <Users className="h-4 w-4" />
                  <span>Find Friends</span>
                </button>
              </div>
            </div>

            {/* Trending Categories */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Trending Categories</h3>
              <div className="space-y-3">
                {['Music & Entertainment', 'Technology', 'Food & Drink', 'Arts & Culture'].map((category, index) => (
                  <div key={category} className="flex items-center justify-between">
                    <span className="text-sm text-gray-700">{category}</span>
                    <div className="flex items-center space-x-2">
                      <TrendingUp className="h-4 w-4 text-green-500" />
                      <span className="text-sm font-medium text-green-600">+{12 + index * 3}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0">
                    <div className="h-2 w-2 bg-primary-500 rounded-full mt-2"></div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-900">Welcome to HelloSnippet! Start discovering amazing events.</p>
                    <p className="text-xs text-gray-500 mt-1">Just now</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AttendeeDashboard;