import { supabase } from '../lib/supabase';

export interface EventRegistration {
  id: string;
  event_id: string;
  attendee_email: string;
  attendee_name?: string;
  attendee_phone?: string;
  registration_date: string;
  payment_status: 'pending' | 'completed' | 'failed' | 'refunded';
  payment_reference?: string;
  ticket_type?: string;
  amount_paid?: number;
  currency: string;
  status: 'confirmed' | 'cancelled' | 'waitlist';
  check_in_time?: string;
  metadata?: any;
  created_at: string;
  updated_at: string;
}

export interface RegistrationData {
  event_id: string;
  attendee_email: string;
  attendee_name?: string;
  attendee_phone?: string;
  payment_status?: 'pending' | 'completed' | 'failed' | 'refunded';
  payment_reference?: string;
  ticket_type?: string;
  amount_paid?: number;
  currency?: string;
  status?: 'confirmed' | 'cancelled' | 'waitlist';
  metadata?: any;
}

export class RegistrationService {
  /**
   * Create a new event registration
   */
  static async createRegistration(registrationData: RegistrationData): Promise<{
    success: boolean;
    registration?: EventRegistration;
    error?: string;
  }> {
    try {
      console.log('📝 Creating registration:', registrationData);

      const { data, error } = await supabase
        .from('event_registrations')
        .insert([{
          ...registrationData,
          currency: registrationData.currency || 'GHS',
          status: registrationData.status || 'confirmed',
          payment_status: registrationData.payment_status || 'pending'
        }])
        .select()
        .single();

      if (error) {
        console.error('❌ Registration creation error:', error);
        return {
          success: false,
          error: error.message
        };
      }

      console.log('✅ Registration created successfully:', data);
      return {
        success: true,
        registration: data
      };

    } catch (error) {
      console.error('❌ Registration service error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Get registration count for an event
   */
  static async getEventRegistrationCount(eventId: string): Promise<{
    success: boolean;
    count?: number;
    error?: string;
  }> {
    try {
      const { count, error } = await supabase
        .from('event_registrations')
        .select('*', { count: 'exact', head: true })
        .eq('event_id', eventId)
        .eq('status', 'confirmed');

      if (error) {
        console.error('❌ Error getting registration count:', error);
        return {
          success: false,
          error: error.message
        };
      }

      return {
        success: true,
        count: count || 0
      };

    } catch (error) {
      console.error('❌ Registration count service error:', error);
      return {
        success: false,
        count: 0,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Get all registrations for an event (for organizers)
   */
  static async getEventRegistrations(eventId: string): Promise<{
    success: boolean;
    registrations?: EventRegistration[];
    error?: string;
  }> {
    try {
      const { data, error } = await supabase
        .from('event_registrations')
        .select('*')
        .eq('event_id', eventId)
        .order('registration_date', { ascending: false });

      if (error) {
        console.error('❌ Error getting event registrations:', error);
        return {
          success: false,
          error: error.message
        };
      }

      return {
        success: true,
        registrations: data || []
      };

    } catch (error) {
      console.error('❌ Registration service error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Check if a user is registered for an event
   */
  static async isUserRegistered(eventId: string, email: string): Promise<{
    success: boolean;
    isRegistered?: boolean;
    registration?: EventRegistration;
    error?: string;
  }> {
    try {
      const { data, error } = await supabase
        .from('event_registrations')
        .select('*')
        .eq('event_id', eventId)
        .eq('attendee_email', email.toLowerCase())
        .eq('status', 'confirmed')
        .maybeSingle();

      if (error) {
        console.error('❌ Error checking registration:', error);
        return {
          success: false,
          error: error.message
        };
      }

      return {
        success: true,
        isRegistered: !!data,
        registration: data || undefined
      };

    } catch (error) {
      console.error('❌ Registration check service error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Update registration payment status
   */
  static async updatePaymentStatus(
    registrationId: string, 
    paymentStatus: 'pending' | 'completed' | 'failed' | 'refunded',
    paymentReference?: string
  ): Promise<{
    success: boolean;
    registration?: EventRegistration;
    error?: string;
  }> {
    try {
      const updateData: any = { 
        payment_status: paymentStatus,
        updated_at: new Date().toISOString()
      };

      if (paymentReference) {
        updateData.payment_reference = paymentReference;
      }

      const { data, error } = await supabase
        .from('event_registrations')
        .update(updateData)
        .eq('id', registrationId)
        .select()
        .single();

      if (error) {
        console.error('❌ Payment status update error:', error);
        return {
          success: false,
          error: error.message
        };
      }

      return {
        success: true,
        registration: data
      };

    } catch (error) {
      console.error('❌ Payment status update service error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Get registration statistics for an event
   */
  static async getEventRegistrationStats(eventId: string): Promise<{
    success: boolean;
    stats?: {
      total: number;
      confirmed: number;
      pending: number;
      cancelled: number;
      checkedIn: number;
      revenue: number;
    };
    error?: string;
  }> {
    try {
      const { data, error } = await supabase
        .from('event_registrations')
        .select('status, payment_status, amount_paid, check_in_time')
        .eq('event_id', eventId);

      if (error) {
        console.error('❌ Error getting registration stats:', error);
        return {
          success: false,
          error: error.message
        };
      }

      const stats = {
        total: data.length,
        confirmed: data.filter(r => r.status === 'confirmed').length,
        pending: data.filter(r => r.payment_status === 'pending').length,
        cancelled: data.filter(r => r.status === 'cancelled').length,
        checkedIn: data.filter(r => r.check_in_time).length,
        revenue: data
          .filter(r => r.payment_status === 'completed')
          .reduce((sum, r) => sum + (r.amount_paid || 0), 0)
      };

      return {
        success: true,
        stats
      };

    } catch (error) {
      console.error('❌ Registration stats service error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
}
