import { supabase } from '../lib/supabase';
import type { DateRange } from './analyticsService';

export interface FunnelMetrics {
  step: string;
  count: number;
  percentage: number;
  dropoffRate?: number;
}

export interface RevenueMetrics {
  date: string;
  revenue: number;
  tickets: number;
  averageTicketPrice: number;
}

export interface EngagementMetrics {
  totalPageViews: number;
  uniqueVisitors: number;
  averageTimeOnPage: number;
  bounceRate: number;
  conversionRate: number;
}

export interface ChannelPerformance {
  channel: string;
  type: string;
  impressions: number;
  clicks: number;
  registrations: number;
  revenue: number;
  conversionRate: number;
  roi: number;
}

export interface AttendanceMetrics {
  totalRegistrations: number;
  checkedIn: number;
  noShows: number;
  checkInRate: number;
  peakCheckInTime?: string;
}

export interface EventPerformance {
  eventId: string;
  eventTitle: string;
  status: string;
  views: number;
  registrations: number;
  revenue: number;
  conversionRate: number;
  capacity: number;
  capacityUsed: number;
}

export class AdvancedAnalyticsService {
  // Attendance Funnel Analysis
  static async getAttendanceFunnel(
    organizerId: string,
    eventId?: string
  ): Promise<{
    success: boolean;
    funnel?: FunnelMetrics[];
    error?: string;
  }> {
    try {
      let query = supabase
        .from('events')
        .select('id')
        .eq('organizer_id', organizerId);

      if (eventId) {
        query = query.eq('id', eventId);
      }

      const { data: events } = await query;
      const eventIds = events?.map(e => e.id) || [];

      if (eventIds.length === 0) {
        return { success: true, funnel: [] };
      }

      // Step 1: Page Views
      const { count: pageViews } = await supabase
        .from('event_page_views')
        .select('*', { count: 'exact', head: true })
        .in('event_id', eventIds);

      // Step 2: Registration Started (clicked register button)
      const { count: registrationStarted } = await supabase
        .from('event_page_views')
        .select('*', { count: 'exact', head: true })
        .in('event_id', eventIds)
        .eq('clicked_register', true);

      // Step 3: Registration Completed
      const { count: registrationCompleted } = await supabase
        .from('event_registrations')
        .select('*', { count: 'exact', head: true })
        .in('event_id', eventIds)
        .eq('status', 'confirmed');

      // Step 4: Payment Completed
      const { count: paymentCompleted } = await supabase
        .from('event_registrations')
        .select('*', { count: 'exact', head: true })
        .in('event_id', eventIds)
        .eq('payment_status', 'completed');

      // Step 5: Checked In
      const { count: checkedIn } = await supabase
        .from('event_registrations')
        .select('*', { count: 'exact', head: true })
        .in('event_id', eventIds)
        .not('check_in_time', 'is', null);

      const totalViews = pageViews || 1;

      const funnel: FunnelMetrics[] = [
        {
          step: 'Page Views',
          count: pageViews || 0,
          percentage: 100,
        },
        {
          step: 'Registration Started',
          count: registrationStarted || 0,
          percentage: ((registrationStarted || 0) / totalViews) * 100,
          dropoffRate: 100 - (((registrationStarted || 0) / totalViews) * 100),
        },
        {
          step: 'Registration Completed',
          count: registrationCompleted || 0,
          percentage: ((registrationCompleted || 0) / totalViews) * 100,
          dropoffRate: ((registrationStarted || 0) - (registrationCompleted || 0)) / (registrationStarted || 1) * 100,
        },
        {
          step: 'Payment Completed',
          count: paymentCompleted || 0,
          percentage: ((paymentCompleted || 0) / totalViews) * 100,
          dropoffRate: ((registrationCompleted || 0) - (paymentCompleted || 0)) / (registrationCompleted || 1) * 100,
        },
        {
          step: 'Checked In',
          count: checkedIn || 0,
          percentage: ((checkedIn || 0) / totalViews) * 100,
          dropoffRate: ((paymentCompleted || 0) - (checkedIn || 0)) / (paymentCompleted || 1) * 100,
        },
      ];

      return { success: true, funnel };
    } catch (error) {
      console.error('Error getting attendance funnel:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  // Revenue Over Time
  static async getRevenueTimeSeries(
    organizerId: string,
    dateRange: DateRange
  ): Promise<{
    success: boolean;
    data?: RevenueMetrics[];
    error?: string;
  }> {
    try {
      const { start, end } = this.getDateRangeFilter(dateRange);

      const { data: events } = await supabase
        .from('events')
        .select('id')
        .eq('organizer_id', organizerId);

      const eventIds = events?.map(e => e.id) || [];

      if (eventIds.length === 0) {
        return { success: true, data: [] };
      }

      const { data: registrations } = await supabase
        .from('event_registrations')
        .select('registration_date, amount_paid, payment_status')
        .in('event_id', eventIds)
        .eq('payment_status', 'completed')
        .gte('registration_date', start.toISOString())
        .lte('registration_date', end.toISOString())
        .order('registration_date', { ascending: true });

      // Group by date
      const revenueByDate = new Map<string, { revenue: number; tickets: number }>();

      registrations?.forEach(reg => {
        const date = new Date(reg.registration_date).toISOString().split('T')[0];
        const existing = revenueByDate.get(date) || { revenue: 0, tickets: 0 };
        revenueByDate.set(date, {
          revenue: existing.revenue + (reg.amount_paid || 0),
          tickets: existing.tickets + 1,
        });
      });

      const data: RevenueMetrics[] = Array.from(revenueByDate.entries()).map(
        ([date, metrics]) => ({
          date,
          revenue: metrics.revenue,
          tickets: metrics.tickets,
          averageTicketPrice: metrics.revenue / metrics.tickets,
        })
      );

      return { success: true, data };
    } catch (error) {
      console.error('Error getting revenue time series:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  // Engagement Metrics
  static async getEngagementMetrics(
    organizerId: string,
    dateRange: DateRange
  ): Promise<{
    success: boolean;
    metrics?: EngagementMetrics;
    error?: string;
  }> {
    try {
      const { start, end } = this.getDateRangeFilter(dateRange);

      const { data: events } = await supabase
        .from('events')
        .select('id')
        .eq('organizer_id', organizerId);

      const eventIds = events?.map(e => e.id) || [];

      if (eventIds.length === 0) {
        return {
          success: true,
          metrics: {
            totalPageViews: 0,
            uniqueVisitors: 0,
            averageTimeOnPage: 0,
            bounceRate: 0,
            conversionRate: 0,
          },
        };
      }

      // Page views
      const { data: pageViews } = await supabase
        .from('event_page_views')
        .select('visitor_id, time_on_page, clicked_register')
        .in('event_id', eventIds)
        .gte('viewed_at', start.toISOString())
        .lte('viewed_at', end.toISOString());

      const totalPageViews = pageViews?.length || 0;
      const uniqueVisitors = new Set(pageViews?.map(pv => pv.visitor_id)).size;
      const averageTimeOnPage =
        pageViews?.reduce((sum, pv) => sum + (pv.time_on_page || 0), 0) /
          totalPageViews || 0;
      const bounceRate =
        (pageViews?.filter(pv => (pv.time_on_page || 0) < 10).length /
          totalPageViews) *
          100 || 0;

      // Conversions
      const { count: conversions } = await supabase
        .from('event_registrations')
        .select('*', { count: 'exact', head: true })
        .in('event_id', eventIds)
        .eq('payment_status', 'completed')
        .gte('registration_date', start.toISOString())
        .lte('registration_date', end.toISOString());

      const conversionRate = (conversions || 0) / uniqueVisitors * 100 || 0;

      return {
        success: true,
        metrics: {
          totalPageViews,
          uniqueVisitors,
          averageTimeOnPage: Math.round(averageTimeOnPage),
          bounceRate: Math.round(bounceRate * 10) / 10,
          conversionRate: Math.round(conversionRate * 10) / 10,
        },
      };
    } catch (error) {
      console.error('Error getting engagement metrics:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  // Channel Performance
  static async getChannelPerformance(
    organizerId: string
  ): Promise<{
    success: boolean;
    channels?: ChannelPerformance[];
    error?: string;
  }> {
    try {
      const { data: events } = await supabase
        .from('events')
        .select('id')
        .eq('organizer_id', organizerId);

      const eventIds = events?.map(e => e.id) || [];

      if (eventIds.length === 0) {
        return { success: true, channels: [] };
      }

      const { data: channels } = await supabase
        .from('marketing_channels')
        .select('*')
        .in('event_id', eventIds)
        .eq('active', true);

      const channelPerformance: ChannelPerformance[] =
        channels?.map(channel => ({
          channel: channel.channel_name,
          type: channel.channel_type,
          impressions: channel.impressions || 0,
          clicks: channel.clicks || 0,
          registrations: channel.registrations || 0,
          revenue: channel.revenue || 0,
          conversionRate: channel.conversion_rate || 0,
          roi: channel.return_on_ad_spend || 0,
        })) || [];

      return { success: true, channels: channelPerformance };
    } catch (error) {
      console.error('Error getting channel performance:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  // Event-by-Event Performance
  static async getEventPerformanceBreakdown(
    organizerId: string,
    dateRange: DateRange
  ): Promise<{
    success: boolean;
    events?: EventPerformance[];
    error?: string;
  }> {
    try {
      const { start, end } = this.getDateRangeFilter(dateRange);

      const { data: events } = await supabase
        .from('events')
        .select('id, title, status, capacity, created_at')
        .eq('organizer_id', organizerId)
        .gte('created_at', start.toISOString())
        .lte('created_at', end.toISOString())
        .order('created_at', { ascending: false });

      if (!events || events.length === 0) {
        return { success: true, events: [] };
      }

      const performanceData: EventPerformance[] = [];

      for (const event of events) {
        // Get page views
        const { count: views } = await supabase
          .from('event_page_views')
          .select('*', { count: 'exact', head: true })
          .eq('event_id', event.id);

        // Get registrations and revenue
        const { data: registrations } = await supabase
          .from('event_registrations')
          .select('amount_paid, payment_status')
          .eq('event_id', event.id)
          .eq('payment_status', 'completed');

        const totalRegistrations = registrations?.length || 0;
        const totalRevenue =
          registrations?.reduce((sum, r) => sum + (r.amount_paid || 0), 0) || 0;

        const conversionRate = views && views > 0 ? (totalRegistrations / views) * 100 : 0;
        const capacityUsed = event.capacity > 0 ? (totalRegistrations / event.capacity) * 100 : 0;

        performanceData.push({
          eventId: event.id,
          eventTitle: event.title,
          status: event.status,
          views: views || 0,
          registrations: totalRegistrations,
          revenue: totalRevenue,
          conversionRate: Math.round(conversionRate * 10) / 10,
          capacity: event.capacity,
          capacityUsed: Math.round(capacityUsed * 10) / 10,
        });
      }

      return { success: true, events: performanceData };
    } catch (error) {
      console.error('Error getting event performance:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  // Attendance Metrics
  static async getAttendanceMetrics(
    organizerId: string,
    eventId?: string
  ): Promise<{
    success: boolean;
    metrics?: AttendanceMetrics;
    error?: string;
  }> {
    try {
      let query = supabase
        .from('events')
        .select('id')
        .eq('organizer_id', organizerId);

      if (eventId) {
        query = query.eq('id', eventId);
      }

      const { data: events } = await query;
      const eventIds = events?.map(e => e.id) || [];

      if (eventIds.length === 0) {
        return {
          success: true,
          metrics: {
            totalRegistrations: 0,
            checkedIn: 0,
            noShows: 0,
            checkInRate: 0,
          },
        };
      }

      const { data: registrations } = await supabase
        .from('event_registrations')
        .select('check_in_time, payment_status')
        .in('event_id', eventIds)
        .eq('payment_status', 'completed');

      const totalRegistrations = registrations?.length || 0;
      const checkedIn = registrations?.filter(r => r.check_in_time).length || 0;
      const noShows = totalRegistrations - checkedIn;
      const checkInRate = totalRegistrations > 0 ? (checkedIn / totalRegistrations) * 100 : 0;

      return {
        success: true,
        metrics: {
          totalRegistrations,
          checkedIn,
          noShows,
          checkInRate: Math.round(checkInRate * 10) / 10,
        },
      };
    } catch (error) {
      console.error('Error getting attendance metrics:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  // Export data to CSV
  static exportToCSV(data: any[], filename: string): void {
    if (!data || data.length === 0) return;

    const headers = Object.keys(data[0]);
    const csvContent = [
      headers.join(','),
      ...data.map(row =>
        headers.map(header => {
          const value = row[header];
          return typeof value === 'string' && value.includes(',')
            ? `"${value}"`
            : value;
        }).join(',')
      ),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${filename}_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  }

  private static getDateRangeFilter(range: DateRange): { start: Date; end: Date } {
    const end = new Date();
    const start = new Date();

    switch (range) {
      case 'today':
        start.setHours(0, 0, 0, 0);
        break;
      case 'last7days':
        start.setDate(start.getDate() - 7);
        break;
      case 'last30days':
        start.setDate(start.getDate() - 30);
        break;
      case 'last90days':
        start.setDate(start.getDate() - 90);
        break;
      case 'alltime':
        start.setFullYear(2000, 0, 1);
        break;
    }

    return { start, end };
  }
}
