import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, ArrowRight, User, Calendar, MapPin, Users, DollarSign } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

const HeroCarousel = () => {
  const navigate = useNavigate();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [events, setEvents] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    console.log('🔍 HeroCarousel: useEffect triggered');
    loadEvents();
  }, []);

  useEffect(() => {
    if (events.length > 0) {
      const timer = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % events.length);
      }, 6000);
      return () => clearInterval(timer);
    }
  }, [events.length]);

  const loadEvents = async () => {
    try {
      console.log('🚀 HeroCarousel: Starting to load events...');
      console.log('🔗 HeroCarousel: Supabase client exists:', !!supabase);
      
      // Test basic Supabase connection first
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      console.log('👤 HeroCarousel: Current user check:', user?.email || 'No user', userError?.message || 'No error');
      
      console.log('📊 HeroCarousel: Attempting to query events table...');
      const { data, error } = await supabase
        .from('events')
        .select(`
          *,
          organizers (
            organization_name,
            first_name,
            last_name
          )
        `)
        .eq('is_published', true)
        .order('created_at', { ascending: false })
        .limit(4);

      console.log('📊 HeroCarousel: Query completed');
      console.log('📊 HeroCarousel: Data received:', data?.length || 0, 'events');
      console.log('📊 HeroCarousel: Error received:', error?.code, error?.message);

      if (error) {
        console.warn('⚠️ HeroCarousel: Error loading hero events:', {
          code: error.code,
          message: error.message,
          details: error.details,
          hint: error.hint
        });
        
        // If it's a table doesn't exist error, that's fine - just show fallback
        if (error.code === '42P01') {
          console.log('📋 HeroCarousel: Events table doesn\'t exist yet - showing fallback hero');
        } else {
          console.error('❌ HeroCarousel: Unexpected database error:', error);
        }
        setEvents([]);
      } else {
        console.log('✅ HeroCarousel: Events loaded successfully:', data?.length || 0);
        if (data && data.length > 0) {
          console.log('📋 HeroCarousel: First event:', {
            id: data[0].id,
            title: data[0].title,
            organizer: data[0].organizers?.organization_name
          });
        }
        setEvents(data || []);
      }

    } catch (error) {
      console.error('❌ HeroCarousel: Unexpected error in loadEvents:', {
        error: error,
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : 'No stack'
      });
      setEvents([]);
    } finally {
      console.log('🏁 HeroCarousel: Setting isLoading to false');
      setIsLoading(false);
    }
  };

  const nextSlide = () => {
    if (events.length > 0) {
      setCurrentSlide((prev) => (prev + 1) % events.length);
    }
  };

  const prevSlide = () => {
    if (events.length > 0) {
      setCurrentSlide((prev) => (prev - 1 + events.length) % events.length);
    }
  };

  const handleMoreInfo = (eventId: string) => {
    navigate(`/event/${eventId}`);
  };

  // Show loading state
  if (isLoading) {
    return (
      <section className="relative h-screen overflow-hidden bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center">
        <div className="text-center text-white">
          <div className="w-12 h-12 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-xl font-medium">Loading amazing events...</p>
        </div>
      </section>
    );
  }

  // Show fallback content if no events
  if (events.length === 0) {
    return (
      <section className="relative h-screen overflow-hidden bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-10 w-32 h-32 rounded-full bg-white/20"></div>
          <div className="absolute top-40 right-20 w-20 h-20 rounded-full bg-white/10"></div>
          <div className="absolute bottom-32 left-1/4 w-16 h-16 rounded-full bg-white/15"></div>
        </div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            {/* Logo */}
            <div className="flex items-center justify-center mb-8">
              <div className="relative group">
                <div className="absolute inset-0 bg-white rounded-3xl blur-xl opacity-30 group-hover:opacity-40 transition-opacity duration-300"></div>
                <div className="relative bg-white/95 backdrop-blur-sm rounded-3xl p-6 shadow-2xl border border-white/20 group-hover:scale-105 transition-all duration-300">
                  <img 
                    src="/hellosnippet_transparent.png" 
                    alt="HelloSnippet" 
                    className="h-16 sm:h-20 w-auto"
                  />
                </div>
              </div>
            </div>

            {/* Hero Content */}
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
              Discover Amazing
              <span className="block bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent">
                Events Near You
              </span>
            </h2>

            <p className="text-lg sm:text-xl text-white/90 mb-8 max-w-2xl mx-auto leading-relaxed">
              Ready to create unforgettable experiences? Start by creating your first event or browse what's happening in your community.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <button 
                onClick={() => navigate('/signup/organizer')}
                className="group bg-white text-primary-500 px-8 py-4 rounded-2xl font-semibold text-lg hover:bg-gray-50 transition-all duration-300 flex items-center space-x-2 shadow-2xl hover:shadow-3xl transform hover:-translate-y-1"
              >
                <Calendar className="w-5 h-5" />
                <span>Create Event</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
              
              <button 
                onClick={() => navigate('/discover')}
                className="group bg-transparent border-2 border-white text-white px-8 py-4 rounded-2xl font-semibold text-lg hover:bg-white hover:text-primary-500 transition-all duration-300 flex items-center space-x-2"
              >
                <Users className="w-5 h-5" />
                <span>Browse Events</span>
              </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 mt-16 max-w-2xl mx-auto">
              <div className="text-center">
                <div className="text-3xl font-bold text-white mb-2">Ready</div>
                <div className="text-white/80">to Get Started</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-white mb-2">Create</div>
                <div className="text-white/80">Your First Event</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-white mb-2">Connect</div>
                <div className="text-white/80">Your Community</div>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="relative h-screen overflow-hidden">
      {/* Slides */}
      <div className="relative h-full">
        {events.map((event, index) => (
          <div
            key={event.id}
            className={`absolute inset-0 transition-opacity duration-1000 ${
              index === currentSlide ? 'opacity-100' : 'opacity-0'
            }`}
          >
            {/* Background Image */}
            <div className="absolute inset-0">
              <img
                src={event.image_url || 'https://images.pexels.com/photos/2608517/pexels-photo-2608517.jpeg?auto=compress&cs=tinysrgb&w=1920'}
                alt={event.title}
                className="w-full h-full object-cover"
              />
              {/* Gradient overlay for better text visibility */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent"></div>
            </div>

            {/* Event Content Overlay */}
            <div className="absolute inset-0 flex flex-col justify-between p-6 sm:p-8 lg:p-12">
              {/* Top Content - Event Title and Details */}
              <div className="flex-1 flex items-center">
                <div className="max-w-4xl">
                  <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight drop-shadow-2xl">
                    {event.title}
                  </h1>
                  
                  {event.description && (
                    <p className="text-lg sm:text-xl text-white/90 mb-6 max-w-2xl leading-relaxed drop-shadow-lg">
                      {event.description.length > 200 
                        ? `${event.description.substring(0, 200)}...` 
                        : event.description
                      }
                    </p>
                  )}

                  {/* Event Quick Info */}
                  <div className="flex flex-wrap gap-4 mb-8">
                    <div className="flex items-center space-x-2 bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl px-4 py-2 text-white">
                      <Calendar className="w-5 h-5" />
                      <span className="font-medium">
                        {new Date(event.start_date).toLocaleDateString('en-US', { 
                          month: 'long', 
                          day: 'numeric', 
                          year: 'numeric' 
                        })}
                      </span>
                    </div>
                    
                    <div className="flex items-center space-x-2 bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl px-4 py-2 text-white">
                      <MapPin className="w-5 h-5" />
                      <span className="font-medium">{event.venue_name || event.location}</span>
                    </div>
                    
                    <div className="flex items-center space-x-2 bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl px-4 py-2 text-white">
                      <Users className="w-5 h-5" />
                      <span className="font-medium">{event.capacity} capacity</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom Content Layout */}
              <div className="flex flex-col sm:flex-row items-end justify-between gap-6">
                
                {/* Left Side - Organizer Info & Price */}
                <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4">
                  {/* Organizer Info */}
                  <div className="group bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-4 shadow-2xl hover:bg-white/15 transition-all duration-300 hover:scale-105">
                    <div className="flex items-center space-x-3">
                      <div className="relative">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center text-white font-bold text-lg border-2 border-white/30 shadow-lg">
                          {event.organizers?.organization_name?.charAt(0) || 'O'}
                        </div>
                        <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-white/20 to-transparent"></div>
                      </div>
                      <div>
                        <p className="text-white/80 text-sm font-medium">Organized by</p>
                        <p className="text-white font-semibold text-lg">
                          {event.organizers?.organization_name || 'Event Organizer'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Price Display */}
                  <div className="group bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-4 shadow-2xl hover:bg-white/15 transition-all duration-300 hover:scale-105">
                    <div className="text-center">
                      <p className="text-white/80 text-sm font-medium mb-1">Price</p>
                      <p className="text-white font-bold text-2xl flex items-center justify-center">
                        {event.price === 0 ? (
                          'FREE'
                        ) : (
                          <>
                            <DollarSign className="w-5 h-5 mr-1" />
                            {event.price}
                          </>
                        )}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Right Side - More Info Button */}
                <button 
                  onClick={() => handleMoreInfo(event.id)}
                  className="group relative bg-gradient-to-r from-purple-600 via-purple-700 to-pink-600 text-white px-8 py-4 rounded-2xl font-semibold text-lg shadow-2xl hover:shadow-purple-500/25 transition-all duration-300 transform hover:scale-105 flex items-center space-x-3 border border-white/20 backdrop-blur-sm"
                >
                  {/* Glossy overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-transparent via-white/10 to-white/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  
                  {/* Button content */}
                  <span className="relative z-10">View Event</span>
                  <ArrowRight className="relative z-10 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  
                  {/* Shine effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 transform translate-x-[-100%] group-hover:translate-x-[200%] transition-transform duration-700 rounded-2xl"></div>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Navigation Arrows - Only show if more than 1 event */}
      {events.length > 1 && (
        <>
          <button
            onClick={prevSlide}
            className="absolute left-4 lg:left-8 top-1/2 transform -translate-y-1/2 bg-white/10 backdrop-blur-xl hover:bg-white/20 text-white p-4 rounded-full transition-all duration-200 hover:scale-110 border border-white/20 shadow-2xl group"
          >
            <ChevronLeft className="w-6 h-6" />
            <div className="absolute inset-0 bg-gradient-to-t from-transparent to-white/10 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          </button>
          <button
            onClick={nextSlide}
            className="absolute right-4 lg:right-8 top-1/2 transform -translate-y-1/2 bg-white/10 backdrop-blur-xl hover:bg-white/20 text-white p-4 rounded-full transition-all duration-200 hover:scale-110 border border-white/20 shadow-2xl group"
          >
            <ChevronRight className="w-6 h-6" />
            <div className="absolute inset-0 bg-gradient-to-t from-transparent to-white/10 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          </button>
        </>
      )}

      {/* Slide Indicators - Only show if more than 1 event */}
      {events.length > 1 && (
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex space-x-3">
          {events.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`h-3 rounded-full transition-all duration-300 border border-white/30 backdrop-blur-sm ${
                index === currentSlide
                  ? 'bg-white w-8 shadow-lg shadow-white/25'
                  : 'bg-white/50 hover:bg-white/70 w-3'
              }`}
            />
          ))}
        </div>
      )}
    </section>
  );
};

export default HeroCarousel;