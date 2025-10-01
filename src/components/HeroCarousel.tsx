import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, ArrowRight, Calendar, MapPin, Users, DollarSign, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { EventService } from '../services/eventService';
import { supabase } from '../lib/supabase';

const HeroCarousel = () => {
  const navigate = useNavigate();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [events, setEvents] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [debugInfo, setDebugInfo] = useState<any>(null);

  useEffect(() => {
    const loadEvents = async () => {
      try {
        console.log('🔍 HeroCarousel: Starting event loading with organizer debug...');
        setIsLoading(true);
        
        // Step 1: Test basic event query
        console.log('Step 1: Testing basic events query...');
        const { data: directData, error: directError } = await supabase
          .from('events')
          .select('*')
          .eq('is_published', true)
          .eq('status', 'published')
          .order('created_at', { ascending: false })
          .limit(10);

        console.log('📊 Basic events query result:', { 
          count: directData?.length || 0, 
          error: directError,
          events: directData?.map(e => ({ id: e.id, title: e.title, organizer_id: e.organizer_id }))
        });

        // Step 2: Test organizer data separately
        if (directData && directData.length > 0) {
          console.log('Step 2: Testing organizer data fetch...');
          const organizerIds = directData.map(e => e.organizer_id).filter(Boolean);
          console.log('📋 Organizer IDs to fetch:', organizerIds);
          
          const { data: organizerData, error: organizerError } = await supabase
            .from('organizers')
            .select('id, organization_name, first_name, last_name, is_verified, avatar_url')
            .in('id', organizerIds);
          
          console.log('📊 Organizer query result:', { 
            count: organizerData?.length || 0, 
            error: organizerError,
            organizers: organizerData,
            organizerIds: organizerIds
          });
          
          // If organizer query failed, let's check why
          if (organizerError) {
            console.error('❌ Organizer query failed:', {
              code: organizerError.code,
              message: organizerError.message,
              details: organizerError.details,
              hint: organizerError.hint
            });
          }
          
          // Step 3: Test joined query
          console.log('Step 3: Testing joined query...');
          const { data: joinedData, error: joinedError } = await supabase
            .from('events')
            .select(`
              *,
              organizers (
                id,
                organization_name,
                first_name,
                last_name,
                is_verified,
                avatar_url
              )
            `)
            .eq('is_published', true)
            .eq('status', 'published')
            .order('created_at', { ascending: false })
            .limit(10);
          
          console.log('📊 Joined query result:', { 
            count: joinedData?.length || 0, 
            error: joinedError,
            events: joinedData?.map(e => ({
              title: e.title,
              organizer_id: e.organizer_id,
              organizer_data: e.organizers,
              organizer_name: e.organizers?.organization_name || `${e.organizers?.first_name} ${e.organizers?.last_name}`.trim()
            }))
          });
          
          if (joinedData && joinedData.length > 0) {
            setEvents(joinedData);
            console.log('✅ Using joined query data with organizers');
            setDebugInfo({
              success: true,
              message: `Found ${joinedData.length} events with organizer data`,
              eventCount: joinedData.length,
              events: joinedData.map(e => ({
                id: e.id,
                title: e.title,
                organizer_name: e.organizers?.organization_name || `${e.organizers?.first_name || ''} ${e.organizers?.last_name || ''}`.trim() || 'Unknown Organizer',
                organizer_id: e.organizer_id
              }))
            });
            return;
          }
        }
        
        // Step 4: Fallback to service method
        console.log('Step 4: Trying service method...');
        const result = await EventService.getPublishedEvents(10, true);
        console.log('📊 Service result:', result);
        
        if (result.success && result.events && result.events.length > 0) {
          setEvents(result.events);
          console.log('✅ Using service data');
        } else {
          console.log('❌ No events found through any method');
          setEvents([]);
        }
        
        setDebugInfo({
          success: result.success,
          message: result.message,
          eventCount: result.events?.length || 0,
          events: result.events?.map(e => ({
            id: e.id,
            title: e.title,
          }))
        });

      } catch (error) {
        console.error('❌ HeroCarousel: Error loading events:', error);
        setDebugInfo({
          error: error instanceof Error ? error.message : 'Unknown error',
          success: false
        });
        setEvents([]);
      } finally {
        setIsLoading(false);
      }
    };

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

  const handleViewEvent = (eventId: string) => {
    navigate(`/event/${eventId}`);
  };

  const handleRegisterNow = (eventId: string) => {
    navigate(`/event/${eventId}`);
  };

  // Loading state
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

  // Debug mode - show what we found
  if (events.length === 0) {
    return (
      <section className="relative h-screen overflow-hidden bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-4xl mx-auto text-white">
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

            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
              Discover Amazing
              <span className="block bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent">
                Events Near You
              </span>
            </h2>

            <p className="text-lg sm:text-xl text-white/90 mb-8 max-w-2xl mx-auto leading-relaxed">
              Whether you're organizing corporate events, planning memorable experiences, or looking for exciting activities, HelloSnippet connects you with the perfect event ecosystem.
            </p>

            {/* Debug Information */}
            <div className="mb-6 p-4 bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl max-w-2xl mx-auto">
              <p className="text-white/90 text-sm font-medium mb-2">
                🎪 Ready for Amazing Events!
              </p>
              <p className="text-white/70 text-xs mb-3">
                Published events will appear here automatically. Create and publish your first event to see it featured!
              </p>
              
              {/* Enhanced Debug Info */}
              {debugInfo && (
                <div className="text-left bg-black/20 rounded-lg p-4 mt-4 max-w-2xl mx-auto">
                  <p className="text-white/90 text-sm font-mono mb-2">
                    <strong>🔍 Debug Information:</strong>
                  </p>
                  <div className="text-white/80 text-xs font-mono space-y-1">
                    <p><strong>Events Found:</strong> {debugInfo.eventCount || 0}</p>
                    <p><strong>Status:</strong> {debugInfo.success ? 'Success' : 'Failed'}</p>
                    <p><strong>Message:</strong> {debugInfo.message}</p>
                    {debugInfo.error && <p><strong>General Error:</strong> {debugInfo.error}</p>}
                  </div>
                  <div className="mt-3 p-2 bg-yellow-500/20 rounded text-white/90 text-xs">
                    <strong>💡 RLS Policy Issue Fixed:</strong><br/>
                    The infinite recursion in organizer policies has been resolved.<br/>
                    Organizer data should now load properly for authenticated users.
                  </div>
                </div>
              )}
              
              {/* Debug Info */}
              {debugInfo && (
                <div className="text-left bg-black/20 rounded-lg p-3 mt-3">
                  <p className="text-white/80 text-xs font-mono">
                    <strong>Debug Info:</strong><br/>
                    Success: {debugInfo.success ? 'Yes' : 'No'}<br/>
                    Events Found: {debugInfo.eventCount}<br/>
                    {debugInfo.message && `Message: ${debugInfo.message}`}<br/>
                    {debugInfo.error && `Error: ${debugInfo.error}`}
                  </p>
                  {debugInfo.events && debugInfo.events.length > 0 && (
                    <details className="mt-2">
                      <summary className="text-white/70 text-xs cursor-pointer">View Events</summary>
                      <pre className="text-white/60 text-xs mt-1 overflow-auto max-h-20">
                        {JSON.stringify(debugInfo.events, null, 2)}
                      </pre>
                    </details>
                  )}
                </div>
              )}
            </div>

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
          </div>
        </div>
      </section>
    );
  }

  // Show dynamic events carousel
  const currentEvent = events[currentSlide];
  
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
                src={event.image_url || 'https://images.pexels.com/photos/2608517/pexels-photo-2608517.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1080'}
                alt={event.title}
                className="w-full h-full object-cover"
                onError={(e) => {
                  console.log('Image failed to load:', event.image_url);
                  e.currentTarget.src = 'https://images.pexels.com/photos/2608517/pexels-photo-2608517.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1080';
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/20"></div>
            </div>

            {/* Event Content Overlay */}
            <div className="absolute inset-0 flex flex-col justify-center items-center text-center p-6 sm:p-8 lg:p-12">
              <div className="max-w-5xl mx-auto">
                {/* Event Category Badge */}
                <div className="inline-flex items-center space-x-2 bg-white/10 backdrop-blur-xl border border-white/20 rounded-full px-4 py-2 text-white mb-6">
                  <Calendar className="w-4 h-1" />
                  <span className="text-sm font-medium">{event.category}</span>
                </div>

                {/* Event Title */}
                <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold text-white mb-6 leading-tight drop-shadow-2xl">
                  {event.title}
                </h1>
                
                {/* Event Description */}
                {event.description && (
                  <p className="text-lg sm:text-xl lg:text-2xl text-white/90 mb-8 max-w-3xl mx-auto leading-relaxed drop-shadow-lg">
                    {event.description.length > 200 
                      ? `${event.description.substring(0, 200)}...` 
                      : event.description
                    }
                  </p>
                )}

                {/* Event Details */}
                <div className="flex flex-wrap justify-center gap-4 mb-8">
                  <div className="flex items-center space-x-2 bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl px-4 py-3 text-white">
                    <Calendar className="w-5 h-5" />
                    <div className="text-left">
                      <p className="text-sm font-medium">
                        {new Date(event.start_date).toLocaleDateString('en-US', {
                          weekday: 'long',
                          month: 'long',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </p>
                      <p className="text-xs text-white/80">
                        {new Date(event.start_date).toLocaleTimeString('en-US', {
                          hour: 'numeric',
                          minute: '2-digit'
                        })} - {new Date(event.end_date).toLocaleTimeString('en-US', {
                          hour: 'numeric',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2 bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl px-4 py-3 text-white">
                    <MapPin className="w-5 h-5" />
                    <div className="text-left">
                      <p className="text-sm font-medium">
                        {event.venue_name || event.location}
                      </p>
                      {event.venue_name && (
                        <p className="text-xs text-white/80">{event.location}</p>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2 bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl px-4 py-3 text-white">
                    <Users className="w-5 h-5" />
                    <div className="text-left">
                      <p className="text-sm font-medium">{event.capacity.toLocaleString()} Capacity</p>
                      <p className="text-xs text-white/80">Spaces Available</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl px-4 py-3 text-white">
                    
                    <div className="text-left">
                      <p className="text-sm font-medium">
                        {event.price === 0 ? 'FREE' : `GHS${event.price.toLocaleString()}`}
                      </p>
                      <p className="text-xs text-white/80">
                        {event.price === 0 ? 'No Cost' : 'Per Ticket'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Organizer Info */}
                <div className="flex items-center justify-center space-x-3 mb-8">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary-400 to-secondary-400 flex items-center justify-center text-white font-bold text-2xl border-4 border-white/60 shadow-2xl overflow-hidden">
                    {event.organizers?.avatar_url ? (
                      <img 
                        src={event.organizers.avatar_url} 
                        alt={event.organizers?.organization_name || 'Organizer'}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          // Fallback to initials if image fails to load
                          e.currentTarget.style.display = 'none';
                          const fallbackText = (event.organizers?.organization_name || event.organizers?.first_name || 'O').charAt(0).toUpperCase();
                          e.currentTarget.parentElement!.innerHTML = `<span class="text-2xl font-bold">${fallbackText}</span>`;
                        }}
                      />
                    ) : (
                      (event.organizers?.organization_name || event.organizers?.first_name || 'O').charAt(0).toUpperCase()
                    )}
                  </div>
                  <div className="text-left">
                    <p className="text-white/90 text-base font-medium tracking-wide">Organized by</p>
                    <p className="text-white font-bold text-2xl drop-shadow-lg">
                      {event.organizers?.organization_name || 
                       `${event.organizers?.first_name || ''} ${event.organizers?.last_name || ''}`.trim() || 
                       'Unknown Organizer'}
                    </p>
                    {event.organizers?.is_verified && (
                      <div className="flex items-center mt-1">
                        <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center mr-2">
                          <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <span className="text-white/90 text-sm font-medium">Verified Organizer</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* CTA Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                  <button 
                    onClick={() => handleRegisterNow(event.id)}
                    className="group relative bg-gradient-to-r from-purple-600 via-purple-700 to-pink-600 text-white px-8 py-4 rounded-2xl font-semibold text-lg shadow-2xl hover:shadow-purple-500/25 transition-all duration-300 transform hover:scale-105 flex items-center space-x-3 border border-white/20 backdrop-blur-sm"
                  >
                    <div className="absolute inset-0 bg-gradient-to-t from-transparent via-white/10 to-white/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <span className="relative z-10">
                      {event.price === 0 ? 'Register Free' : 'Get Tickets'}
                    </span>
                    <ArrowRight className="relative z-10 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 transform translate-x-[-100%] group-hover:translate-x-[200%] transition-transform duration-700 rounded-2xl"></div>
                  </button>
                  
                  <button 
                    onClick={() => handleViewEvent(event.id)}
                    className="group bg-white/10 backdrop-blur-xl border-2 border-white/30 text-white px-8 py-4 rounded-2xl font-semibold text-lg hover:bg-white/20 transition-all duration-300 flex items-center space-x-2"
                  >
                    <Clock className="w-5 h-5" />
                    <span>View Details</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Navigation Arrows */}
      {events.length > 1 && (
        <>
          <button
            onClick={prevSlide}
            className="absolute left-4 lg:left-8 top-1/2 transform -translate-y-1/2 bg-white/10 backdrop-blur-xl hover:bg-white/20 text-white p-4 rounded-full transition-all duration-200 hover:scale-110 border border-white/20 shadow-2xl group"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button
            onClick={nextSlide}
            className="absolute right-4 lg:right-8 top-1/2 transform -translate-y-1/2 bg-white/10 backdrop-blur-xl hover:bg-white/20 text-white p-4 rounded-full transition-all duration-200 hover:scale-110 border border-white/20 shadow-2xl group"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </>
      )}

      {/* Slide Indicators */}
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