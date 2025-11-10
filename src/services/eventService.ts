import { supabase } from '../lib/supabase';
import type { Event, CreateEventData } from '../lib/supabase';

export class EventService {
  static get supabase() {
    return supabase;
  }
  /**
   * Create a new event
   */
  static async createEvent(organizerId: string, eventData: CreateEventData) {
    try {
      const { data, error } = await supabase
        .from('events')
        .insert([{
          organizer_id: organizerId,
          ...eventData,
          status: 'draft',
          is_published: false
        }])
        .select()
        .single();

      if (error) {
        throw new Error(`Event creation error: ${error.message}`);
      }

      return {
        success: true,
        event: data,
        message: 'Event created successfully!'
      };
    } catch (error) {
      console.error('Event creation error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'An unexpected error occurred'
      };
    }
  }

  /**
   * Get published events for public display
   */
  static async getPublishedEvents(limit: number = 10, includeOrganizerInfo: boolean = true) {
    try {
      console.log('🔍 EventService: Fetching published events...', { limit, includeOrganizerInfo });
      
      // Try to fetch published events with proper filtering
      const { data, error } = await supabase
        .from('events')
        .select(includeOrganizerInfo ? `
          *,
          organizers (
            id,
            organization_name,
            first_name,
            last_name,
            is_verified,
            avatar_url
          )
        ` : '*')
        .eq('is_published', true)
        .eq('status', 'published')
        .order('created_at', { ascending: false })
        .limit(limit);

      console.log('📊 EventService: Query result:', { data: data?.length, error });
      
      if (error) {
        console.error('❌ EventService: Full error details:', {
          message: error.message,
          code: error.code,
          details: error.details,
          hint: error.hint
        });
        
        // If table doesn't exist, return empty array instead of error
        if (error.code === '42P01') {
          console.warn('❌ Events table does not exist yet. Please run the database migration.');
          return {
            success: true,
            message: 'Events table not found - database migration needed',
            events: []
          };
        }
        
        // If it's an RLS error, provide specific guidance
        if (error.code === '42501' || error.message.includes('RLS') || error.message.includes('policy')) {
          console.warn('❌ RLS policy blocking access to events');
          return {
            success: false,
            message: 'RLS policy blocking access - need to fix policies',
            error: 'Row Level Security is blocking access to published events. Please check your RLS policies.',
            events: []
          };
        }
        
        console.error('❌ EventService: Database error:', error);
        throw new Error(`Published events fetch error: ${error.message}`);
      }      console.log('✅ EventService: Successfully fetched', data?.length || 0, 'events');
      if (data && data.length > 0) {
        console.log('📋 Events found:', data.map((e: any) => `"${e.title}" (status: ${e.status}, published: ${e.is_published})`));
      }
      
      return {
        success: true,
        message: `Found ${data?.length || 0} published events`,
        events: data || []
      };
    } catch (error) {
      console.error('❌ EventService: Published events fetch error:', error);
      return {
        success: false,
        message: 'Failed to load published events',
        error: error instanceof Error ? error.message : 'An unexpected error occurred'
      };
    }
  }

  /**
   * Get published events with registration counts
   */
  static async getPublishedEventsWithCounts(limit: number = 10, includeOrganizerInfo: boolean = true) {
    try {
      console.log('🔍 EventService: Fetching published events with registration counts...', { limit, includeOrganizerInfo });
      
      // First, get the events
      const eventsResult = await this.getPublishedEvents(limit, includeOrganizerInfo);
      
      if (!eventsResult.success || !eventsResult.events) {
        return eventsResult;
      }

      // For each event, get the registration count
      const eventsWithCounts = await Promise.all(
        eventsResult.events.map(async (event: any) => {
          try {
            // Try to get registration count
            const { count, error } = await supabase
              .from('event_registrations')
              .select('*', { count: 'exact', head: true })
              .eq('event_id', event.id)
              .eq('status', 'confirmed');

            const registrationCount = error ? 0 : (count || 0);
            
            return {
              ...event,
              registration_count: registrationCount,
              attendees: registrationCount // For backward compatibility
            };
          } catch (error) {
            console.warn(`⚠️ Could not get registration count for event ${event.id}:`, error);
            return {
              ...event,
              registration_count: 0,
              attendees: 0
            };
          }
        })
      );

      console.log('✅ EventService: Successfully fetched events with registration counts');
      
      return {
        success: true,
        message: `Found ${eventsWithCounts.length} published events with registration counts`,
        events: eventsWithCounts
      };
    } catch (error) {
      console.error('❌ EventService: Published events with counts fetch error:', error);
      return {
        success: false,
        message: 'Failed to load published events with counts',
        error: error instanceof Error ? error.message : 'An unexpected error occurred'
      };
    }
  }

  /**
   * Get all events for an organizer
   */
  static async getOrganizerEvents(organizerId: string) {
    try {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('organizer_id', organizerId)
        .order('created_at', { ascending: false });

      if (error) {
        // If table doesn't exist, return empty array instead of error
        if (error.code === '42P01') {
          console.warn('Events table does not exist yet. Please run the database migration.');
          return {
            success: true,
            events: []
          };
        }
        throw new Error(`Events fetch error: ${error.message}`);
      }

      return {
        success: true,
        events: data || []
      };
    } catch (error) {
      console.error('Events fetch error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'An unexpected error occurred'
      };
    }
  }

  /**
   * Get event by ID
   */
  static async getEventById(eventId: string) {
    try {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('id', eventId)
        .single();

      if (error) {
        throw new Error(`Event fetch error: ${error.message}`);
      }

      return {
        success: true,
        event: data
      };
    } catch (error) {
      console.error('Event fetch error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'An unexpected error occurred'
      };
    }
  }

  /**
   * Update event
   */
  static async updateEvent(eventId: string, updates: Partial<Event>) {
    try {
      const { data, error } = await supabase
        .from('events')
        .update(updates)
        .eq('id', eventId)
        .select()
        .single();

      if (error) {
        throw new Error(`Event update error: ${error.message}`);
      }

      return {
        success: true,
        event: data,
        message: 'Event updated successfully!'
      };
    } catch (error) {
      console.error('Event update error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'An unexpected error occurred'
      };
    }
  }

  /**
   * Delete event
   */
  static async deleteEvent(eventId: string) {
    try {
      const { error } = await supabase
        .from('events')
        .delete()
        .eq('id', eventId);

      if (error) {
        throw new Error(`Event deletion error: ${error.message}`);
      }

      return {
        success: true,
        message: 'Event deleted successfully!'
      };
    } catch (error) {
      console.error('Event deletion error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'An unexpected error occurred'
      };
    }
  }

  /**
   * Publish/unpublish event
   */
  static async toggleEventPublication(eventId: string, isPublished: boolean) {
    try {
      const { data, error } = await supabase
        .from('events')
        .update({ 
          is_published: isPublished,
          status: isPublished ? 'published' : 'draft'
        })
        .eq('id', eventId)
        .select()
        .single();

      if (error) {
        throw new Error(`Event publication error: ${error.message}`);
      }

      return {
        success: true,
        event: data,
        message: `Event ${isPublished ? 'published' : 'unpublished'} successfully!`
      };
    } catch (error) {
      console.error('Event publication error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'An unexpected error occurred'
      };
    }
  }

  /**
   * Get event tickets
   */
  static async getEventTickets(eventId: string) {
    try {
      const { data, error } = await supabase
        .from('event_tickets')
        .select('*')
        .eq('event_id', eventId)
        .order('purchase_date', { ascending: false });

      if (error) {
        throw new Error(`Tickets fetch error: ${error.message}`);
      }

      return {
        success: true,
        tickets: data || []
      };
    } catch (error) {
      console.error('Tickets fetch error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'An unexpected error occurred'
      };
    }
  }

  /**
   * Get event analytics
   */
  static async getEventAnalytics(eventId: string, days: number = 30) {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const { data, error } = await supabase
        .from('event_analytics')
        .select('*')
        .eq('event_id', eventId)
        .gte('date', startDate.toISOString().split('T')[0])
        .order('date', { ascending: true });

      if (error) {
        throw new Error(`Analytics fetch error: ${error.message}`);
      }

      return {
        success: true,
        analytics: data || []
      };
    } catch (error) {
      console.error('Analytics fetch error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'An unexpected error occurred'
      };
    }
  }

  /**
   * Get organizer dashboard stats
   */
  static async getOrganizerStats(organizerId: string) {
    try {
      // Get events count and basic stats
      const { data: events, error: eventsError } = await supabase
        .from('events')
        .select('id, status, price, capacity')
        .eq('organizer_id', organizerId);

      if (eventsError) {
        // If table doesn't exist, return default stats
        if (eventsError.code === '42P01') {
          console.warn('Events table does not exist yet. Please run the database migration.');
          return {
            success: true,
            stats: {
              totalEvents: 0,
              publishedEvents: 0,
              upcomingEvents: 0,
              totalTickets: 0,
              totalRevenue: 0,
              totalCapacity: 0
            }
          };
        }
        throw new Error(`Events stats error: ${eventsError.message}`);
      }

      // Get tickets count and revenue
      const { data: tickets, error: ticketsError } = await supabase
        .from('event_tickets')
        .select('price_paid, event_id')
        .in('event_id', events?.map(e => e.id) || []);

      if (ticketsError && ticketsError.code !== '42P01') {
        throw new Error(`Tickets stats error: ${ticketsError.message}`);
      }

      const stats = {
        totalEvents: events?.length || 0,
        publishedEvents: events?.filter(e => e.status === 'published').length || 0,
        upcomingEvents: events?.filter(e => e.status === 'published').length || 0,
        totalTickets: tickets?.length || 0,
        totalRevenue: tickets?.reduce((sum, ticket) => sum + (ticket.price_paid || 0), 0) || 0,
        totalCapacity: events?.reduce((sum, event) => sum + (event.capacity || 0), 0) || 0
      };

      return {
        success: true,
        stats
      };
    } catch (error) {
      console.error('Stats fetch error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'An unexpected error occurred'
      };
    }
  }

  /**
   * Check in attendee
   */
  static async checkInAttendee(ticketId: string) {
    try {
      const { data, error } = await supabase
        .from('event_tickets')
        .update({ 
          checked_in: true,
          check_in_date: new Date().toISOString()
        })
        .eq('id', ticketId)
        .select()
        .single();

      if (error) {
        throw new Error(`Check-in error: ${error.message}`);
      }

      return {
        success: true,
        ticket: data,
        message: 'Attendee checked in successfully!'
      };
    } catch (error) {
      console.error('Check-in error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'An unexpected error occurred'
      };
    }
  }
}