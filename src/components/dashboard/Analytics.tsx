import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  Users, 
  DollarSign, 
  Calendar,
  Download,
  Filter,
  BarChart3,
  PieChart,
  LineChart,
  Loader,
  AlertCircle
} from 'lucide-react';
import { EventService } from '../../services/eventService';
import type { Organizer } from '../../lib/supabase';

interface AnalyticsProps {
  organizer: Organizer | null;
}

const Analytics: React.FC<AnalyticsProps> = ({ organizer }) => {
  const [dateRange, setDateRange] = useState('30d');
  const [chartType, setChartType] = useState('line');
  const [stats, setStats] = useState<any>(null);
  const [events, setEvents] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (organizer) {
      loadAnalyticsData();
    }
  }, [organizer, dateRange]);

  const loadAnalyticsData = async () => {
    if (!organizer) return;

    setIsLoading(true);
    setError(null);

    try {
      // Load organizer stats
      const statsResult = await EventService.getOrganizerStats(organizer.id);
      if (statsResult.success) {
        setStats(statsResult.stats);
      }

      // Load events for analytics
      const eventsResult = await EventService.getOrganizerEvents(organizer.id);
      if (eventsResult.success) {
        setEvents(eventsResult.events);
      }

    } catch (error) {
      console.error('Error loading analytics data:', error);
      setError('Failed to load analytics data');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <Loader className="w-8 h-8 animate-spin text-primary-500 mx-auto mb-4" />
          <p className="text-gray-600">Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Analytics</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={loadAnalyticsData}
            className="bg-primary-500 text-white px-4 py-2 rounded-lg hover:bg-primary-600 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Calculate analytics data
  const analyticsData = {
    overview: {
      totalRevenue: stats?.totalRevenue || 0,
      revenueChange: 18.2,
      totalTickets: stats?.totalTickets || 0,
      ticketsChange: 23.1,
      totalEvents: stats?.totalEvents || 0,
      eventsChange: 12.5,
      avgAttendance: events.length > 0 ? (stats?.totalTickets / events.length) : 0,
      attendanceChange: 5.7
    },
    topEvents: events.slice(0, 5).map((event, index) => ({
      name: event.title,
      revenue: event.price * (event.capacity * 0.7), // Mock sold tickets
      attendees: Math.floor(event.capacity * 0.7),
      performance: Math.min((event.price * (event.capacity * 0.7)) / 15000 * 100, 100)
    }))
  };

  const StatCard = ({ title, value, change, icon: Icon, color }: any) => (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{value}</p>
          <div className="flex items-center mt-2">
            <TrendingUp className="h-4 w-4 text-green-500" />
            <span className="text-sm font-medium text-green-600 ml-1">
              +{change}%
            </span>
            <span className="text-sm text-gray-500 ml-1">vs last period</span>
          </div>
        </div>
        <div className={`p-3 rounded-xl bg-gradient-to-r ${color}`}>
          <Icon className="h-6 w-6 text-white" />
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
          <p className="text-gray-600 mt-1">Track your event performance and insights</p>
        </div>
        <div className="flex items-center space-x-4 mt-4 sm:mt-0">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="rounded-lg border border-gray-300 bg-white py-2 px-3 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
            <option value="1y">Last year</option>
          </select>
          <button className="flex items-center space-x-2 bg-primary-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-primary-600 transition-colors">
            <Download className="h-4 w-4" />
            <span>Export</span>
          </button>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Revenue"
          value={`$${analyticsData.overview.totalRevenue.toLocaleString()}`}
          change={analyticsData.overview.revenueChange}
          icon={DollarSign}
          color="from-green-500 to-green-600"
        />
        <StatCard
          title="Tickets Sold"
          value={analyticsData.overview.totalTickets.toLocaleString()}
          change={analyticsData.overview.ticketsChange}
          icon={Users}
          color="from-blue-500 to-blue-600"
        />
        <StatCard
          title="Total Events"
          value={analyticsData.overview.totalEvents}
          change={analyticsData.overview.eventsChange}
          icon={Calendar}
          color="from-purple-500 to-purple-600"
        />
        <StatCard
          title="Avg Attendance"
          value={`${analyticsData.overview.avgAttendance.toFixed(1)}`}
          change={analyticsData.overview.attendanceChange}
          icon={TrendingUp}
          color="from-orange-500 to-orange-600"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sales Trend Chart */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Revenue Trend</h3>
            <div className="flex space-x-2">
              <button
                onClick={() => setChartType('line')}
                className={`p-2 rounded-lg ${chartType === 'line' ? 'bg-primary-100 text-primary-600' : 'text-gray-400 hover:text-gray-600'}`}
              >
                <LineChart className="h-4 w-4" />
              </button>
              <button
                onClick={() => setChartType('bar')}
                className={`p-2 rounded-lg ${chartType === 'bar' ? 'bg-primary-100 text-primary-600' : 'text-gray-400 hover:text-gray-600'}`}
              >
                <BarChart3 className="h-4 w-4" />
              </button>
            </div>
          </div>
          
          {/* Placeholder for chart */}
          <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-500">Revenue trend chart</p>
              <p className="text-sm text-gray-400">
                {stats?.totalRevenue > 0 
                  ? `Total revenue: $${stats.totalRevenue.toLocaleString()}`
                  : 'No revenue data yet'
                }
              </p>
            </div>
          </div>
        </div>

        {/* Event Categories */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Event Categories</h3>
            <PieChart className="h-5 w-5 text-gray-400" />
          </div>
          
          <div className="space-y-4">
            {events.length > 0 ? (
              events.slice(0, 5).map((event, index) => (
                <div key={event.id} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div 
                      className={`w-3 h-3 rounded-full ${
                        index === 0 ? 'bg-primary-500' : 
                        index === 1 ? 'bg-secondary-500' : 
                        index === 2 ? 'bg-green-500' :
                        index === 3 ? 'bg-orange-500' : 'bg-gray-400'
                      }`}
                    />
                    <span className="text-sm font-medium text-gray-900">{event.category}</span>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium text-gray-900">{event.title}</div>
                    <div className="text-xs text-gray-500">{event.capacity} capacity</div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <PieChart className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-500 text-sm">No events to analyze</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Top Performing Events */}
      {analyticsData.topEvents.length > 0 && (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Top Performing Events</h3>
            <button className="text-sm text-primary-500 hover:text-primary-600 font-medium">
              View All
            </button>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-medium text-gray-500 text-sm">Event Name</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500 text-sm">Revenue</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500 text-sm">Attendees</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500 text-sm">Performance</th>
                </tr>
              </thead>
              <tbody>
                {analyticsData.topEvents.map((event, index) => (
                  <tr key={event.name} className="border-b border-gray-100">
                    <td className="py-4 px-4">
                      <div className="flex items-center space-x-3">
                        <div className="flex-shrink-0">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-white text-sm font-medium ${
                            index === 0 ? 'bg-yellow-500' :
                            index === 1 ? 'bg-gray-400' :
                            index === 2 ? 'bg-orange-500' : 'bg-gray-300'
                          }`}>
                            {index + 1}
                          </div>
                        </div>
                        <span className="font-medium text-gray-900">{event.name}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-gray-900 font-medium">
                      ${event.revenue.toLocaleString()}
                    </td>
                    <td className="py-4 px-4 text-gray-600">
                      {event.attendees}
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center space-x-2">
                        <div className="flex-1 bg-gray-200 rounded-full h-2 max-w-[100px]">
                          <div 
                            className="bg-primary-500 h-2 rounded-full" 
                            style={{ width: `${event.performance}%` }}
                          ></div>
                        </div>
                        <span className="text-sm text-gray-500">
                          {Math.round(event.performance)}%
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default Analytics;