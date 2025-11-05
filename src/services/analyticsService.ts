import { supabase } from '../lib/supabase';

export type DateRange = 'today' | 'last7days' | 'last30days' | 'last90days' | 'alltime';

export interface AnalyticsStats {
  totalEvents: number;
  totalTickets: number;
  totalRevenue: number;
  publishedEvents: number;
  percentageChanges: {
    events: number;
    tickets: number;
    revenue: number;
    published: number;
  };
}

export interface Activity {
  id: string;
  type: 'event_created' | 'event_published' | 'event_updated' | 'ticket_purchased' | 'milestone';
  message: string;
  time: string;
  metadata?: any;
}

export class AnalyticsService {
  static getDateRangeFilter(range: DateRange): { start: Date; end: Date } {
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

  static getPreviousPeriod(range: DateRange): { start: Date; end: Date } {
    const currentPeriod = this.getDateRangeFilter(range);
    const periodLength = currentPeriod.end.getTime() - currentPeriod.start.getTime();

    const end = new Date(currentPeriod.start);
    const start = new Date(currentPeriod.start.getTime() - periodLength);

    return { start, end };
  }

  static async getOrganizerStatsWithRange(
    organizerId: string,
    dateRange: DateRange
  ): Promise<{
    success: boolean;
    stats?: AnalyticsStats;
    error?: string;
  }> {
    try {
      const { start, end } = this.getDateRangeFilter(dateRange);
      const previousPeriod = this.getPreviousPeriod(dateRange);

      const currentStats = await this.getStatsForPeriod(organizerId, start, end);
      const previousStats = await this.getStatsForPeriod(
        organizerId,
        previousPeriod.start,
        previousPeriod.end
      );

      const percentageChanges = {
        events: this.calculatePercentageChange(
          previousStats.totalEvents,
          currentStats.totalEvents
        ),
        tickets: this.calculatePercentageChange(
          previousStats.totalTickets,
          currentStats.totalTickets
        ),
        revenue: this.calculatePercentageChange(
          previousStats.totalRevenue,
          currentStats.totalRevenue
        ),
        published: this.calculatePercentageChange(
          previousStats.publishedEvents,
          currentStats.publishedEvents
        ),
      };

      return {
        success: true,
        stats: {
          ...currentStats,
          percentageChanges,
        },
      };
    } catch (error) {
      console.error('Error getting organizer stats:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  private static async getStatsForPeriod(
    organizerId: string,
    start: Date,
    end: Date
  ): Promise<{
    totalEvents: number;
    totalTickets: number;
    totalRevenue: number;
    publishedEvents: number;
  }> {
    try {
      const { data: events, error: eventsError } = await supabase
        .from('events')
        .select('id, status, price, capacity, created_at')
        .eq('organizer_id', organizerId)
        .gte('created_at', start.toISOString())
        .lte('created_at', end.toISOString());

      if (eventsError && eventsError.code !== '42P01') {
        console.error('Events query error:', eventsError);
      }

      const eventIds = events?.map((e) => e.id) || [];
      let tickets: any[] = [];
      let totalRevenue = 0;

      if (eventIds.length > 0) {
        const { data: registrations, error: regError } = await supabase
          .from('event_registrations')
          .select('amount_paid, registration_date, payment_status')
          .in('event_id', eventIds)
          .gte('registration_date', start.toISOString())
          .lte('registration_date', end.toISOString())
          .eq('payment_status', 'completed');

        if (!regError) {
          tickets = registrations || [];
          totalRevenue = tickets.reduce((sum, t) => sum + (t.amount_paid || 0), 0);
        }
      }

      return {
        totalEvents: events?.length || 0,
        totalTickets: tickets.length,
        totalRevenue,
        publishedEvents: events?.filter((e) => e.status === 'published').length || 0,
      };
    } catch (error) {
      console.error('Error getting stats for period:', error);
      return {
        totalEvents: 0,
        totalTickets: 0,
        totalRevenue: 0,
        publishedEvents: 0,
      };
    }
  }

  private static calculatePercentageChange(oldValue: number, newValue: number): number {
    if (oldValue === 0) {
      return newValue > 0 ? 100 : 0;
    }
    return Math.round(((newValue - oldValue) / oldValue) * 100);
  }

  static async getRecentActivity(
    organizerId: string,
    limit: number = 10
  ): Promise<{
    success: boolean;
    activities?: Activity[];
    error?: string;
  }> {
    try {
      const activities: Activity[] = [];

      const { data: events } = await supabase
        .from('events')
        .select('id, title, status, created_at, updated_at, is_published')
        .eq('organizer_id', organizerId)
        .order('updated_at', { ascending: false })
        .limit(20);

      if (events) {
        for (const event of events) {
          if (event.status === 'published' && event.is_published) {
            activities.push({
              id: `event-published-${event.id}`,
              type: 'event_published',
              message: `You just published a new event: ${event.title}.`,
              time: this.formatTimeAgo(new Date(event.updated_at)),
              metadata: { eventId: event.id, eventTitle: event.title },
            });
          } else if (event.created_at !== event.updated_at) {
            activities.push({
              id: `event-updated-${event.id}`,
              type: 'event_updated',
              message: `You just updated the details for ${event.title}.`,
              time: this.formatTimeAgo(new Date(event.updated_at)),
              metadata: { eventId: event.id, eventTitle: event.title },
            });
          } else {
            activities.push({
              id: `event-created-${event.id}`,
              type: 'event_created',
              message: `You created a new event: ${event.title}.`,
              time: this.formatTimeAgo(new Date(event.created_at)),
              metadata: { eventId: event.id, eventTitle: event.title },
            });
          }

          const { data: registrations } = await supabase
            .from('event_registrations')
            .select('id, attendee_name, attendee_email, registration_date, status')
            .eq('event_id', event.id)
            .eq('status', 'confirmed')
            .order('registration_date', { ascending: false })
            .limit(3);

          if (registrations) {
            for (const reg of registrations) {
              const attendeeName = reg.attendee_name || reg.attendee_email.split('@')[0];
              activities.push({
                id: `registration-${reg.id}`,
                type: 'ticket_purchased',
                message: `${attendeeName} just purchased a ticket for ${event.title}.`,
                time: this.formatTimeAgo(new Date(reg.registration_date)),
                metadata: { eventId: event.id, registrationId: reg.id },
              });
            }
          }

          const { count: regCount } = await supabase
            .from('event_registrations')
            .select('*', { count: 'exact', head: true })
            .eq('event_id', event.id)
            .eq('status', 'confirmed');

          const { data: eventDetails } = await supabase
            .from('events')
            .select('capacity')
            .eq('id', event.id)
            .single();

          if (regCount && eventDetails?.capacity) {
            const percentSold = Math.round((regCount / eventDetails.capacity) * 100);
            if (percentSold >= 50 && percentSold < 75) {
              activities.push({
                id: `milestone-50-${event.id}`,
                type: 'milestone',
                message: `Your event ${event.title} is now ${percentSold}% sold out.`,
                time: this.formatTimeAgo(new Date()),
                metadata: { eventId: event.id, percentSold },
              });
            } else if (percentSold >= 75) {
              activities.push({
                id: `milestone-75-${event.id}`,
                type: 'milestone',
                message: `Your event ${event.title} is now ${percentSold}% sold out.`,
                time: this.formatTimeAgo(new Date()),
                metadata: { eventId: event.id, percentSold },
              });
            }
          }
        }
      }

      activities.sort((a, b) => {
        const timeA = this.parseTimeAgo(a.time);
        const timeB = this.parseTimeAgo(b.time);
        return timeA - timeB;
      });

      const uniqueActivities = activities
        .filter((activity, index, self) =>
          index === self.findIndex((a) => a.id === activity.id)
        )
        .slice(0, limit);

      return {
        success: true,
        activities: uniqueActivities,
      };
    } catch (error) {
      console.error('Error getting recent activity:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  private static formatTimeAgo(date: Date): string {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} week${Math.floor(diffDays / 7) > 1 ? 's' : ''} ago`;
    return `${Math.floor(diffDays / 30)} month${Math.floor(diffDays / 30) > 1 ? 's' : ''} ago`;
  }

  private static parseTimeAgo(timeStr: string): number {
    if (timeStr === 'Just now') return 0;

    const match = timeStr.match(/(\d+)\s+(minute|hour|day|week|month)s?\s+ago/);
    if (!match) return 0;

    const value = parseInt(match[1]);
    const unit = match[2];

    const multipliers: Record<string, number> = {
      minute: 60000,
      hour: 3600000,
      day: 86400000,
      week: 604800000,
      month: 2592000000,
    };

    return value * (multipliers[unit] || 0);
  }
}
