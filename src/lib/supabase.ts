import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database types
export interface Organizer {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  organization_name: string;
  phone?: string;
  location?: string;
  event_types: string[];
  profile_completed: boolean;
  is_verified: boolean;
  avatar_url?: string;
  bio?: string;
  created_at: string;
  updated_at: string;
}

export interface OrganizerSignupData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  organizationName: string;
  phone?: string;
  location?: string;
  eventTypes: string[];
}

export interface Event {
  id: string;
  organizer_id: string;
  title: string;
  description?: string;
  start_date: string;
  end_date: string;
  location: string;
  venue_name?: string;
  capacity: number;
  price: number;
  currency: string;
  category: string;
  status: 'draft' | 'published' | 'cancelled' | 'completed';
  image_url?: string;
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

export interface EventTicket {
  id: string;
  event_id: string;
  attendee_name: string;
  attendee_email: string;
  ticket_type: string;
  price_paid: number;
  purchase_date: string;
  checked_in: boolean;
  check_in_date?: string;
}

export interface EventAnalytics {
  id: string;
  event_id: string;
  date: string;
  tickets_sold: number;
  revenue: number;
  views: number;
}

export interface CreateEventData {
  title: string;
  description?: string;
  start_date: string;
  end_date: string;
  location: string;
  venue_name?: string;
  capacity: number;
  price: number;
  currency?: string;
  category: string;
  image_url?: string;
}