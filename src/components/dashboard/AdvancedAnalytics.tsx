import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  Users,
  DollarSign,
  Calendar,
  Download,
  Filter,
  BarChart3,
  Eye,
  MousePointerClick,
  CheckCircle,
  Loader,
  AlertCircle,
  RefreshCw,
  Target,
  Activity,
  TrendingDown,
  Clock,
  Share2
} from 'lucide-react';
import { AdvancedAnalyticsService } from '../../services/advancedAnalyticsService';
import { AnalyticsService, type DateRange } from '../../services/analyticsService';
import type { Organizer } from '../../lib/supabase';
import { useTheme } from '../../contexts/ThemeContext';

interface AdvancedAnalyticsProps {
  organizer: Organizer | null;
}

const AdvancedAnalytics: React.FC<AdvancedAnalyticsProps> = ({ organizer }) => {
  const { currencySymbol, colors } = useTheme();
  const [dateRange, setDateRange] = useState<DateRange>('last30days');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'funnel' | 'revenue' | 'engagement' | 'events'>('overview');

  // Data states
  const [overviewStats, setOverviewStats] = useState<any>(null);
  const [funnelData, setFunnelData] = useState<any[]>([]);
  const [revenueData, setRevenueData] = useState<any[]>([]);
  const [engagementMetrics, setEngagementMetrics] = useState<any>(null);
  const [eventPerformance, setEventPerformance] = useState<any[]>([]);
  const [attendanceMetrics, setAttendanceMetrics] = useState<any>(null);

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
      // Load overview stats
      const statsResult = await AnalyticsService.getOrganizerStatsWithRange(
        organizer.id,
        dateRange
      );
      if (statsResult.success) {
        setOverviewStats(statsResult.stats);
      }

      // Load funnel data
      const funnelResult = await AdvancedAnalyticsService.getAttendanceFunnel(
        organizer.id
      );
      if (funnelResult.success) {
        setFunnelData(funnelResult.funnel || []);
      }

      // Load revenue time series
      const revenueResult = await AdvancedAnalyticsService.getRevenueTimeSeries(
        organizer.id,
        dateRange
      );
      if (revenueResult.success) {
        setRevenueData(revenueResult.data || []);
      }

      // Load engagement metrics
      const engagementResult = await AdvancedAnalyticsService.getEngagementMetrics(
        organizer.id,
        dateRange
      );
      if (engagementResult.success) {
        setEngagementMetrics(engagementResult.metrics);
      }

      // Load event performance
      const eventPerfResult = await AdvancedAnalyticsService.getEventPerformanceBreakdown(
        organizer.id,
        dateRange
      );
      if (eventPerfResult.success) {
        setEventPerformance(eventPerfResult.events || []);
      }

      // Load attendance metrics
      const attendanceResult = await AdvancedAnalyticsService.getAttendanceMetrics(
        organizer.id
      );
      if (attendanceResult.success) {
        setAttendanceMetrics(attendanceResult.metrics);
      }

    } catch (error) {
      console.error('Error loading analytics:', error);
      setError('Failed to load analytics data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleExport = () => {
    if (activeTab === 'events' && eventPerformance.length > 0) {
      AdvancedAnalyticsService.exportToCSV(eventPerformance, 'event_performance');
    } else if (activeTab === 'revenue' && revenueData.length > 0) {
      AdvancedAnalyticsService.exportToCSV(revenueData, 'revenue_data');
    } else if (activeTab === 'funnel' && funnelData.length > 0) {
      AdvancedAnalyticsService.exportToCSV(funnelData, 'funnel_analysis');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <Loader className="w-8 h-8 animate-spin mx-auto mb-4" style={{ color: colors.primary }} />
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
            className="px-4 py-2 rounded-lg text-white transition-colors"
            style={{ background: `linear-gradient(to right, ${colors.primary}, ${colors.secondary})` }}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with filters */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Event Analytics</h2>
          <p className="text-gray-600 mt-1">Comprehensive insights into your event performance</p>
        </div>

        <div className="flex items-center space-x-3">
          {/* Date Range Filter */}
          <div className="relative">
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value as DateRange)}
              className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-10 text-sm font-medium text-gray-700 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-opacity-20 transition-colors cursor-pointer"
              style={{ focusRing: colors.primary }}
            >
              <option value="today">Today</option>
              <option value="last7days">Last 7 Days</option>
              <option value="last30days">Last 30 Days</option>
              <option value="last90days">Last 90 Days</option>
              <option value="alltime">All Time</option>
            </select>
            <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
          </div>

          {/* Refresh Button */}
          <button
            onClick={loadAnalyticsData}
            className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            title="Refresh data"
          >
            <RefreshCw className="h-5 w-5 text-gray-600" />
          </button>

          {/* Export Button */}
          <button
            onClick={handleExport}
            className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Download className="h-4 w-4" />
            <span className="text-sm font-medium">Export</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'overview', label: 'Overview', icon: BarChart3 },
            { id: 'funnel', label: 'Funnel Analysis', icon: Target },
            { id: 'revenue', label: 'Revenue', icon: DollarSign },
            { id: 'engagement', label: 'Engagement', icon: Activity },
            { id: 'events', label: 'Event Performance', icon: Calendar },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-current'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
                style={activeTab === tab.id ? { color: colors.primary, borderColor: colors.primary } : {}}
              >
                <Icon className="h-5 w-5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Key Metrics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                label: 'Total Revenue',
                value: `${currencySymbol}${overviewStats?.totalRevenue?.toLocaleString() || '0'}`,
                change: overviewStats?.percentageChanges?.revenue || 0,
                icon: DollarSign,
                color: 'from-green-500 to-green-600',
              },
              {
                label: 'Tickets Sold',
                value: overviewStats?.totalTickets || 0,
                change: overviewStats?.percentageChanges?.tickets || 0,
                icon: Users,
                color: 'from-blue-500 to-blue-600',
              },
              {
                label: 'Total Events',
                value: overviewStats?.totalEvents || 0,
                change: overviewStats?.percentageChanges?.events || 0,
                icon: Calendar,
                color: 'from-purple-500 to-purple-600',
              },
              {
                label: 'Published Events',
                value: overviewStats?.publishedEvents || 0,
                change: overviewStats?.percentageChanges?.published || 0,
                icon: CheckCircle,
                color: 'from-orange-500 to-orange-600',
              },
            ].map((metric, index) => {
              const Icon = metric.icon;
              const isPositive = metric.change >= 0;

              return (
                <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-sm font-medium text-gray-600">{metric.label}</span>
                    <div className={`p-3 rounded-xl bg-gradient-to-r ${metric.color}`}>
                      <Icon className="h-5 w-5 text-white" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <p className="text-3xl font-bold text-gray-900">{metric.value}</p>
                    <div className="flex items-center space-x-1">
                      {isPositive ? (
                        <TrendingUp className="h-4 w-4 text-green-500" />
                      ) : (
                        <TrendingDown className="h-4 w-4 text-red-500" />
                      )}
                      <span
                        className={`text-sm font-medium ${
                          isPositive ? 'text-green-600' : 'text-red-600'
                        }`}
                      >
                        {Math.abs(metric.change)}%
                      </span>
                      <span className="text-sm text-gray-500">vs previous period</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Engagement Quick Stats */}
          {engagementMetrics && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Engagement Metrics</h3>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
                <div>
                  <div className="flex items-center space-x-2 mb-2">
                    <Eye className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-600">Page Views</span>
                  </div>
                  <p className="text-2xl font-bold text-gray-900">
                    {engagementMetrics.totalPageViews.toLocaleString()}
                  </p>
                </div>
                <div>
                  <div className="flex items-center space-x-2 mb-2">
                    <Users className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-600">Unique Visitors</span>
                  </div>
                  <p className="text-2xl font-bold text-gray-900">
                    {engagementMetrics.uniqueVisitors.toLocaleString()}
                  </p>
                </div>
                <div>
                  <div className="flex items-center space-x-2 mb-2">
                    <Clock className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-600">Avg. Time on Page</span>
                  </div>
                  <p className="text-2xl font-bold text-gray-900">
                    {engagementMetrics.averageTimeOnPage}s
                  </p>
                </div>
                <div>
                  <div className="flex items-center space-x-2 mb-2">
                    <TrendingDown className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-600">Bounce Rate</span>
                  </div>
                  <p className="text-2xl font-bold text-gray-900">
                    {engagementMetrics.bounceRate}%
                  </p>
                </div>
                <div>
                  <div className="flex items-center space-x-2 mb-2">
                    <Target className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-600">Conversion Rate</span>
                  </div>
                  <p className="text-2xl font-bold text-green-600">
                    {engagementMetrics.conversionRate}%
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Attendance Metrics */}
          {attendanceMetrics && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Attendance Overview</h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div>
                  <span className="text-sm text-gray-600">Total Registrations</span>
                  <p className="text-3xl font-bold text-gray-900 mt-1">
                    {attendanceMetrics.totalRegistrations}
                  </p>
                </div>
                <div>
                  <span className="text-sm text-gray-600">Checked In</span>
                  <p className="text-3xl font-bold text-green-600 mt-1">
                    {attendanceMetrics.checkedIn}
                  </p>
                </div>
                <div>
                  <span className="text-sm text-gray-600">No Shows</span>
                  <p className="text-3xl font-bold text-red-600 mt-1">
                    {attendanceMetrics.noShows}
                  </p>
                </div>
                <div>
                  <span className="text-sm text-gray-600">Check-in Rate</span>
                  <p className="text-3xl font-bold text-blue-600 mt-1">
                    {attendanceMetrics.checkInRate}%
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Funnel Analysis Tab */}
      {activeTab === 'funnel' && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Conversion Funnel</h3>
            <div className="space-y-4">
              {funnelData.map((step, index) => {
                const maxCount = funnelData[0]?.count || 1;
                const widthPercentage = (step.count / maxCount) * 100;

                return (
                  <div key={index} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <span className="text-sm font-medium text-gray-900">{step.step}</span>
                        <span className="text-xs text-gray-500">
                          {step.count.toLocaleString()} ({step.percentage.toFixed(1)}%)
                        </span>
                      </div>
                      {step.dropoffRate !== undefined && (
                        <span className="text-xs text-red-600 font-medium">
                          {step.dropoffRate.toFixed(1)}% drop-off
                        </span>
                      )}
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-8">
                      <div
                        className="h-8 rounded-full flex items-center justify-end pr-3 text-white text-sm font-medium transition-all duration-500"
                        style={{
                          width: `${widthPercentage}%`,
                          background: `linear-gradient(to right, ${colors.primary}, ${colors.secondary})`,
                          minWidth: '60px',
                        }}
                      >
                        {step.count > 0 && step.count.toLocaleString()}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Revenue Tab */}
      {activeTab === 'revenue' && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue Over Time</h3>
            {revenueData.length > 0 ? (
              <div className="space-y-4">
                {revenueData.map((day, index) => (
                  <div key={index} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{new Date(day.date).toLocaleDateString()}</p>
                      <p className="text-xs text-gray-500">{day.tickets} tickets sold</p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-gray-900">
                        {currencySymbol}{day.revenue.toFixed(2)}
                      </p>
                      <p className="text-xs text-gray-500">
                        Avg: {currencySymbol}{day.averageTicketPrice.toFixed(2)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-gray-500 py-8">No revenue data available for this period</p>
            )}
          </div>
        </div>
      )}

      {/* Engagement Tab */}
      {activeTab === 'engagement' && engagementMetrics && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Traffic Overview</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Total Page Views</span>
                  <span className="text-2xl font-bold text-gray-900">
                    {engagementMetrics.totalPageViews.toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Unique Visitors</span>
                  <span className="text-2xl font-bold text-gray-900">
                    {engagementMetrics.uniqueVisitors.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">User Behavior</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Avg. Time on Page</span>
                  <span className="text-2xl font-bold text-gray-900">
                    {engagementMetrics.averageTimeOnPage}s
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Bounce Rate</span>
                  <span className="text-2xl font-bold text-orange-600">
                    {engagementMetrics.bounceRate}%
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Conversion Rate</span>
                  <span className="text-2xl font-bold text-green-600">
                    {engagementMetrics.conversionRate}%
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Event Performance Tab */}
      {activeTab === 'events' && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Event
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Views
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Registrations
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Revenue
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Conversion
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Capacity
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {eventPerformance.length > 0 ? (
                    eventPerformance.map((event) => (
                      <tr key={event.eventId} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{event.eventTitle}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              event.status === 'published'
                                ? 'bg-green-100 text-green-800'
                                : event.status === 'draft'
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}
                          >
                            {event.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {event.views.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {event.registrations.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {currencySymbol}{event.revenue.toFixed(2)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm font-medium text-green-600">
                            {event.conversionRate}%
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-1 bg-gray-200 rounded-full h-2 mr-2" style={{ width: '60px' }}>
                              <div
                                className="h-2 rounded-full"
                                style={{
                                  width: `${event.capacityUsed}%`,
                                  background: `linear-gradient(to right, ${colors.primary}, ${colors.secondary})`,
                                }}
                              />
                            </div>
                            <span className="text-sm text-gray-600">{event.capacityUsed}%</span>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                        No events found for this period
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdvancedAnalytics;
