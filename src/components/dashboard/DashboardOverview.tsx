import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  Users, 
  DollarSign, 
  TrendingUp, 
  Clock,
  MapPin,
  Star,
  ArrowUpRight,
  ArrowDownRight,
  BarChart3,
  Loader,
  AlertCircle,
  Plus
} from 'lucide-react';
import { EventService } from '../../services/eventService';
import CreateEventModal from './CreateEventModal';
import type { Organizer } from '../../lib/supabase';

interface DashboardOverviewProps {
  organizer: Organizer | null;
}

const DashboardOverview: React.FC<DashboardOverviewProps> = ({ organizer }) => {
  const [stats, setStats] = useState<any>(null);
  const [recentEvents, setRecentEvents] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    if (organizer) {
      loadDashboardData();
    }
  }, [organizer]);

  const loadDashboardData = async () => {
    if (!organizer) return;

    setIsLoading(true);
    setError(null);

    try {
      // Load organizer stats
      const statsResult = await EventService.getOrganizerStats(organizer.id);
      if (statsResult.success) {
        setStats(statsResult.stats);
      } else {
        console.warn('Failed to load stats:', statsResult.error);
        // Set default stats if database tables don't exist yet
        setStats({
          totalEvents: 0,
          totalTickets: 0,
          totalRevenue: 0,
          publishedEvents: 0
        });
      }

      // Load recent events
      const eventsResult = await EventService.getOrganizerEvents(organizer.id);
      if (eventsResult.success) {
        setRecentEvents(eventsResult.events.slice(0, 5)); // Get latest 5 events
      } else {
        console.warn('Failed to load events:', eventsResult.error);
        setRecentEvents([]);
      }

    } catch (error) {
      console.error('Error loading dashboard data:', error);
      // Don't show error for missing tables - just use defaults
      setStats({
        totalEvents: 0,
        totalTickets: 0,
        totalRevenue: 0,
        publishedEvents: 0
      });
      setRecentEvents([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEventCreated = () => {
    // Reload dashboard data when a new event is created
    loadDashboardData();
  };

  // Mock recent activity data
  const recentActivity = [
    {
      id: 1,
      type: 'welcome',
      message: 'Welcome to HelloSnippet! Ready to create your first event?',
      time: 'Just now',
      amount: null
    }
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <Loader className="w-8 h-8 animate-spin text-primary-500 mx-auto mb-4" />
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const statsData = [
    {
      name: 'Total Events',
      value: stats?.totalEvents || 0,
      change: '+12%',
      changeType: 'increase',
      icon: Calendar,
      color: 'from-blue-500 to-blue-600'
    },
    {
      name: 'Total Tickets Sold',
      value: stats?.totalTickets || 0,
      change: '+23%',
      changeType: 'increase',
      icon: Users,
      color: 'from-green-500 to-green-600'
    },
    {
      name: 'Total Revenue',
      value: `$${stats?.totalRevenue?.toLocaleString() || '0'}`,
      change: '+18%',
      changeType: 'increase',
      icon: DollarSign,
      color: 'from-purple-500 to-purple-600'
    },
    {
      name: 'Published Events',
      value: stats?.publishedEvents || 0,
      change: '+2',
      changeType: 'increase',
      icon: Clock,
      color: 'from-orange-500 to-orange-600'
    },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Message */}
      <div className="bg-gradient-to-r from-primary-500 to-secondary-500 rounded-2xl p-6 text-white">
        <h2 className="text-2xl font-bold mb-2">
          Welcome back, {organizer?.first_name || 'Organizer'}! 👋
        </h2>
        <p className="text-primary-100">
          {stats?.totalEvents > 0 
            ? `You have ${stats.totalEvents} events and ${stats.totalTickets} tickets sold. Keep up the great work!`
            : "Ready to create your first event? Let's get started!"
          }
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsData.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.name} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{stat.value}</p>
                  <div className="flex items-center mt-2">
                    {stat.changeType === 'increase' ? (
                      <ArrowUpRight className="h-4 w-4 text-green-500" />
                    ) : (
                      <ArrowDownRight className="h-4 w-4 text-red-500" />
                    )}
                    <span className={`text-sm font-medium ml-1 ${
                      stat.changeType === 'increase' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {stat.change}
                    </span>
                    <span className="text-sm text-gray-500 ml-1">vs last month</span>
                  </div>
                </div>
                <div className={`p-3 rounded-xl bg-gradient-to-r ${stat.color}`}>
                  <Icon className="h-6 w-6 text-white" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
            <button className="text-sm text-primary-500 hover:text-primary-600 font-medium">
              View All
            </button>
          </div>
          <div className="space-y-4">
            {recentActivity.map((activity) => (
              <div key={activity.id} className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  <div className="h-2 w-2 bg-primary-500 rounded-full mt-2"></div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-900">{activity.message}</p>
                  <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                </div>
                {activity.amount && (
                  <div className="flex-shrink-0">
                    <span className="text-sm font-medium text-green-600">{activity.amount}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Recent Events */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Recent Events</h3>
            <button className="text-sm text-primary-500 hover:text-primary-600 font-medium">
              View All
            </button>
          </div>
          <div className="space-y-4">
            {recentEvents.length > 0 ? recentEvents.map((event) => (
              <div key={event.id} className="border border-gray-200 rounded-xl p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900 mb-2">{event.title}</h4>
                    <div className="space-y-1">
                      <div className="flex items-center text-sm text-gray-600">
                        <Calendar className="h-4 w-4 mr-2" />
                        {new Date(event.start_date).toLocaleDateString()}
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <MapPin className="h-4 w-4 mr-2" />
                        {event.location}
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <Users className="h-4 w-4 mr-2" />
                        {event.capacity} capacity
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium text-gray-900">
                      {event.price === 0 ? 'Free' : `$${event.price}`}
                    </div>
                    <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium mt-1 ${
                      event.status === 'published' ? 'bg-green-100 text-green-800' :
                      event.status === 'draft' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
                    </div>
                  </div>
                </div>
              </div>
            )) : (
              <div className="text-center py-8">
                <Calendar className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-500 text-sm mb-4">No events created yet</p>
                <button 
                  onClick={() => setShowCreateModal(true)}
                  className="bg-primary-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-primary-600 transition-colors"
                >
                  Create Your First Event
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button 
            onClick={() => setShowCreateModal(true)}
            className="flex items-center justify-center space-x-2 bg-gradient-to-r from-primary-500 to-secondary-500 text-white px-6 py-4 rounded-xl font-medium hover:shadow-lg transition-all duration-200 transform hover:scale-105"
          >
            <Plus className="h-5 w-5" />
            <span>Create New Event</span>
          </button>
          <button className="flex items-center justify-center space-x-2 bg-white border-2 border-gray-200 text-gray-700 px-6 py-4 rounded-xl font-medium hover:border-primary-300 hover:text-primary-600 transition-colors">
            <BarChart3 className="h-5 w-5" />
            <span>View Analytics</span>
          </button>
          <button className="flex items-center justify-center space-x-2 bg-white border-2 border-gray-200 text-gray-700 px-6 py-4 rounded-xl font-medium hover:border-primary-300 hover:text-primary-600 transition-colors">
            <Users className="h-5 w-5" />
            <span>Manage Attendees</span>
          </button>
        </div>
      </div>

      {/* Database Setup Notice */}
      {stats?.totalEvents === 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              <Calendar className="h-6 w-6 text-blue-500" />
            </div>
            <div>
              <h4 className="font-medium text-blue-900 mb-2">Ready to Get Started?</h4>
              <p className="text-blue-700 text-sm mb-4">
                Your event management system is ready! Click the "Create New Event" button above to start organizing your first event.
              </p>
              <button 
                onClick={() => setShowCreateModal(true)}
                className="bg-blue-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-600 transition-colors"
              >
                Create Your First Event
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Event Modal */}
      <CreateEventModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        organizerId={organizer?.id || ''}
        onEventCreated={handleEventCreated}
      />
    </div>
  );
};

export default DashboardOverview;