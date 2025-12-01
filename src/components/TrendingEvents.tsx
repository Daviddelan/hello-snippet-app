import { useState, useEffect, useRef } from "react";
import { Calendar, MapPin, Star, ArrowRight, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { EventService } from "../services/eventService";

const TrendingEvents = () => {
  const navigate = useNavigate();
  const [events, setEvents] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    loadEvents();
  }, []);

  useEffect(() => {
    if (events.length > 0 && !isPaused) {
      startAutoSlide();
    }
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [events, isPaused, currentIndex]);

  const loadEvents = async () => {
    try {
      const result = await EventService.getPublishedEventsWithCounts(20, true);

      if (result.success && result.events && result.events.length > 0) {
        const transformedEvents = result.events.map(event => ({
          id: event.id,
          title: event.title,
          date: new Date(event.start_date).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
          }),
          location: event.location,
          attendees: event.registration_count || 0,
          rating: 4.5 + Math.random() * 0.5,
          price: event.price === 0 ? "Free" : `GH₵${event.price}`,
          image: event.image_url || "https://images.pexels.com/photos/2608517/pexels-photo-2608517.jpeg?auto=compress&cs=tinysrgb&w=800",
          category: event.category,
        }));

        setEvents(transformedEvents);
      }
    } catch (error) {
      console.error('Error loading trending events:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const startAutoSlide = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    intervalRef.current = setInterval(() => {
      setCurrentIndex((prevIndex) => {
        return (prevIndex + 1) % events.length;
      });
    }, 500);
  };

  const handleEventClick = (eventId: string) => {
    navigate(`/events/${eventId}`);
  };

  const handleMouseEnter = (index: number) => {
    setIsPaused(true);
    setHoveredIndex(index);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
  };

  const handleMouseLeave = () => {
    setIsPaused(false);
    setHoveredIndex(null);
  };

  const getDisplayedEvents = () => {
    if (events.length === 0) return [];

    const displayed = [];
    const baseIndex = currentIndex;

    for (let i = 0; i < Math.min(6, events.length); i++) {
      const index = (baseIndex + i) % events.length;
      displayed.push({
        ...events[index],
        displayIndex: i
      });
    }

    return displayed;
  };

  if (isLoading) {
    return (
      <section className="py-20 bg-gradient-to-br from-gray-50 to-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-48 mx-auto mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-96 mx-auto"></div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (events.length === 0) {
    return null;
  }

  const displayedEvents = getDisplayedEvents();

  return (
    <section className="py-20 bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white relative overflow-hidden">
      <div className="absolute inset-0">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-primary-500/10 to-secondary-500/10"></div>
        <div className="absolute top-20 right-10 w-96 h-96 rounded-full bg-primary-500/20 blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 left-10 w-96 h-96 rounded-full bg-secondary-500/20 blur-3xl animate-pulse"></div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-12">
          <div className="inline-flex items-center space-x-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full mb-4">
            <Star className="w-4 h-4 text-yellow-400 fill-yellow-400 animate-pulse" />
            <span className="text-sm font-medium text-white">Live Events Feed</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-bold text-white mb-4">
            Trending Now
          </h2>
          <p className="text-lg text-gray-300 max-w-2xl mx-auto">
            Experience the pulse of exciting events happening around you
          </p>
        </div>

        <div className="relative max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {displayedEvents.map((event, idx) => {
              const isHovered = hoveredIndex === idx;
              const zIndex = isHovered ? 50 : displayedEvents.length - idx;

              return (
                <div
                  key={`${event.id}-${idx}`}
                  className={`relative transition-all duration-300 ${
                    isHovered ? 'md:col-span-2 md:row-span-2' : ''
                  }`}
                  style={{
                    zIndex,
                    opacity: isHovered ? 1 : 0.95 - (idx * 0.05)
                  }}
                  onMouseEnter={() => handleMouseEnter(idx)}
                  onMouseLeave={handleMouseLeave}
                  onClick={() => handleEventClick(event.id)}
                >
                  <div
                    className={`group cursor-pointer relative overflow-hidden rounded-2xl transition-all duration-300 ${
                      isHovered
                        ? 'shadow-2xl scale-105 ring-4 ring-white/50'
                        : 'shadow-lg hover:shadow-xl'
                    }`}
                    style={{
                      height: isHovered ? '400px' : '200px',
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                    }}
                  >
                    <img
                      src={event.image}
                      alt={event.title}
                      className={`absolute inset-0 w-full h-full object-cover transition-all duration-500 ${
                        isHovered ? 'scale-100' : 'scale-110'
                      }`}
                      style={{
                        filter: isHovered ? 'brightness(1)' : 'brightness(0.85)'
                      }}
                    />

                    <div className={`absolute inset-0 bg-gradient-to-t transition-opacity duration-300 ${
                      isHovered
                        ? 'from-black via-black/60 to-transparent'
                        : 'from-black/80 via-black/40 to-transparent'
                    }`}></div>

                    <div className="absolute top-3 right-3">
                      <div className="bg-white/95 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-lg">
                        <span className="text-xs font-bold text-gray-900">{event.price}</span>
                      </div>
                    </div>

                    {isHovered && (
                      <div className="absolute top-3 left-3 flex items-center space-x-1 bg-yellow-500/95 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-lg animate-fadeIn">
                        <Star className="w-3 h-3 text-white fill-white" />
                        <span className="text-xs font-bold text-white">{event.rating.toFixed(1)}</span>
                      </div>
                    )}

                    <div className={`absolute bottom-0 left-0 right-0 p-4 transition-all duration-300 ${
                      isHovered ? 'translate-y-0 opacity-100' : 'translate-y-2 opacity-90'
                    }`}>
                      <h3 className={`font-bold text-white mb-2 transition-all duration-300 ${
                        isHovered
                          ? 'text-xl line-clamp-2'
                          : 'text-sm line-clamp-1'
                      }`}>
                        {event.title}
                      </h3>

                      {isHovered && (
                        <div className="space-y-2 animate-fadeIn">
                          <div className="flex items-center text-gray-200 text-sm">
                            <Calendar className="w-4 h-4 mr-2 flex-shrink-0" />
                            <span>{event.date}</span>
                          </div>
                          <div className="flex items-center text-gray-200 text-sm">
                            <MapPin className="w-4 h-4 mr-2 flex-shrink-0" />
                            <span className="line-clamp-1">{event.location}</span>
                          </div>
                          <div className="flex items-center justify-between pt-3 border-t border-white/20">
                            <div className="flex items-center space-x-2">
                              <Users className="w-4 h-4 text-gray-200" />
                              <span className="text-xs text-gray-200">
                                {event.attendees > 0 ? `${event.attendees}+ attending` : 'Be the first'}
                              </span>
                            </div>
                            <ArrowRight className="w-5 h-5 text-white animate-pulse" />
                          </div>
                        </div>
                      )}

                      {!isHovered && (
                        <div className="flex items-center text-gray-300 text-xs">
                          <MapPin className="w-3 h-3 mr-1" />
                          <span className="line-clamp-1">{event.location}</span>
                        </div>
                      )}
                    </div>

                    {!isHovered && (
                      <div className="absolute inset-0 border-2 border-white/10 rounded-2xl pointer-events-none"></div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex justify-center mt-8 space-x-2">
            {events.slice(0, 20).map((_, index) => (
              <div
                key={index}
                className={`h-1 rounded-full transition-all duration-300 ${
                  index === currentIndex % events.length
                    ? 'w-8 bg-gradient-to-r from-primary-400 to-secondary-400'
                    : 'w-1 bg-white/30'
                }`}
              />
            ))}
          </div>
        </div>

        <div className="text-center mt-12">
          <button
            onClick={() => navigate('/discover')}
            className="inline-flex items-center bg-white text-gray-900 px-8 py-4 rounded-2xl font-semibold hover:shadow-2xl transition-all duration-300 transform hover:scale-105 group"
          >
            <span>Explore All Events</span>
            <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out forwards;
        }
      `}</style>
    </section>
  );
};

export default TrendingEvents;
