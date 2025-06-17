import { supabase } from '../lib/supabase';
import type { OrganizerSignupData, Organizer } from '../lib/supabase';

export class OrganizerService {
  /**
   * Get the correct redirect URL for the current environment
   */
  private static getRedirectUrl(): string {
    // In production, use the current origin
    // In development, use localhost
    if (typeof window !== 'undefined') {
      return `${window.location.origin}/auth/callback`;
    }
    return '/auth/callback';
  }

  /**
   * Sign up a new organizer with authentication and profile creation
   */
  static async signUpOrganizer(data: OrganizerSignupData) {
    try {
      console.log('Starting organizer signup process...');
      
      // Step 1: Create user account with Supabase Auth
      console.log('Creating auth user...');
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            first_name: data.firstName,
            last_name: data.lastName,
            organization_name: data.organizationName,
          },
          emailRedirectTo: this.getRedirectUrl()
        }
      });

      if (authError) {
        console.error('Auth error:', authError);
        throw new Error(`Authentication error: ${authError.message}`);
      }

      if (!authData.user) {
        console.error('No user returned from auth signup');
        throw new Error('User creation failed');
      }

      console.log('Auth user created successfully:', authData.user.email);

      // Step 2: Create organizer profile
      console.log('Creating organizer profile...');
      const organizerProfile = {
        id: authData.user.id,
        first_name: data.firstName,
        last_name: data.lastName,
        email: data.email,
        organization_name: data.organizationName,
        phone: data.phone || null,
        location: data.location || null,
        event_types: data.eventTypes,
        profile_completed: true,
        is_verified: false, // Will be verified by admin later
      };

      const { data: profileData, error: profileError } = await supabase
        .from('organizers')
        .insert([organizerProfile])
        .select()
        .single();

      if (profileError) {
        console.error('Profile creation error:', profileError);
        // Don't delete the auth user as they might be able to complete profile later
        throw new Error(`Profile creation error: ${profileError.message}`);
      }

      console.log('Organizer profile created successfully:', profileData.organization_name);

      return {
        success: true,
        user: authData.user,
        organizer: profileData,
        message: 'Account created successfully! Please check your email to verify your account.'
      };

    } catch (error) {
      console.error('Organizer signup error:', error);
      
      // Provide more specific error messages
      let errorMessage = 'An unexpected error occurred';
      
      if (error instanceof Error) {
        if (error.message.includes('User already registered')) {
          errorMessage = 'An account with this email already exists. Please sign in instead.';
        } else if (error.message.includes('Invalid email')) {
          errorMessage = 'Please enter a valid email address.';
        } else if (error.message.includes('Password should be at least')) {
          errorMessage = 'Password must be at least 6 characters long.';
        } else if (error.message.includes('Profile creation error')) {
          errorMessage = 'Account created but profile setup failed. Please try completing your profile after signing in.';
        } else {
          errorMessage = error.message;
        }
      }
      
      return {
        success: false,
        error: errorMessage
      };
    }
  }

  /**
   * Get organizer profile by user ID
   */
  static async getOrganizerProfile(userId: string): Promise<Organizer | null> {
    try {
      console.log('Fetching organizer profile for user ID:', userId);
      
      const { data, error } = await supabase
        .from('organizers')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching organizer profile:', error);
        
        // If it's a "not found" error, return null instead of throwing
        if (error.code === 'PGRST116') {
          console.log('No organizer profile found for user');
          return null;
        }
        
        throw error;
      }

      console.log('Organizer profile fetched successfully:', data?.organization_name);
      return data;
    } catch (error) {
      console.error('Error fetching organizer profile:', error);
      return null;
    }
  }

  /**
   * Update organizer profile
   */
  static async updateOrganizerProfile(userId: string, updates: Partial<Organizer>) {
    try {
      const { data, error } = await supabase
        .from('organizers')
        .update(updates)
        .eq('id', userId)
        .select()
        .single();

      if (error) {
        throw new Error(`Update error: ${error.message}`);
      }

      return {
        success: true,
        organizer: data
      };
    } catch (error) {
      console.error('Error updating organizer profile:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'An unexpected error occurred'
      };
    }
  }

  /**
   * Get all verified organizers (for public display)
   */
  static async getVerifiedOrganizers() {
    try {
      const { data, error } = await supabase
        .from('organizers')
        .select('*')
        .eq('is_verified', true)
        .order('created_at', { ascending: false });

      if (error) {
        throw new Error(`Fetch error: ${error.message}`);
      }

      return {
        success: true,
        organizers: data
      };
    } catch (error) {
      console.error('Error fetching verified organizers:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'An unexpected error occurred'
      };
    }
  }

  /**
   * Search organizers by various criteria
   */
  static async searchOrganizers(searchTerm: string, location?: string, eventTypes?: string[]) {
    try {
      let query = supabase
        .from('organizers')
        .select('*')
        .eq('is_verified', true);

      // Search in organization name or full name
      if (searchTerm) {
        query = query.or(`organization_name.ilike.%${searchTerm}%,first_name.ilike.%${searchTerm}%,last_name.ilike.%${searchTerm}%`);
      }

      // Filter by location
      if (location) {
        query = query.ilike('location', `%${location}%`);
      }

      // Filter by event types
      if (eventTypes && eventTypes.length > 0) {
        query = query.overlaps('event_types', eventTypes);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) {
        throw new Error(`Search error: ${error.message}`);
      }

      return {
        success: true,
        organizers: data
      };
    } catch (error) {
      console.error('Error searching organizers:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'An unexpected error occurred'
      };
    }
  }
}