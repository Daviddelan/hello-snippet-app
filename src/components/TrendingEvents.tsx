import { useState, useEffect, useRef } from "react";
import { Calendar, MapPin, Star, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { EventService } from "../services/eventService";

const TrendingEvents = () => {
  const navigate = useNavigate();
  const [events, setEvents] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
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
      const result = await EventService.getPublishedEventsWithCounts(12, true);

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
        if (prevIndex + 3 >= events.length) {
          return 0;
        }
        return prevIndex + 1;
      });
    }, 3000);
  };

  const handleEventClick = (eventId: string) => {
    navigate(`/events/${eventId}`);
  };

  const handleMouseEnter = () => {
    setIsPaused(true);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
  };

  const handleMouseLeave = () => {
    setIsPaused(false);
  };

  const getVisibleEvents = () => {
    if (events.length === 0) return [];

    const visible = [];
    for (let i = 0; i < 3; i++) {
      const index = (currentIndex + i) % events.length;
      visible.push(events[index]);
    }
    return visible;
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

  const visibleEvents = getVisibleEvents();

  return (
    <section className="py-20 bg-gradient-to-br from-gray-50 to-white relative overflow-hidden">
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-20 right-10 w-64 h-64 rounded-full bg-primary-500 blur-3xl"></div>
        <div className="absolute bottom-20 left-10 w-64 h-64 rounded-full bg-secondary-500 blur-3xl"></div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-12">
          <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-primary-50 to-secondary-50 px-4 py-2 rounded-full mb-4">
            <Star className="w-4 h-4 text-primary-500 fill-primary-500" />
            <span className="text-sm font-medium text-primary-700">Trending Now</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Popular Events This Week
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Join thousands of attendees at these highly-rated events
          </p>
        </div>

        <div className="relative">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {visibleEvents.map((event, idx) => (
              <div
                key={`${event.id}-${idx}`}
                className="group cursor-pointer"
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
                onClick={() => handleEventClick(event.id)}
              >
                <div className="bg-white rounded-3xl overflow-hidden shadow-lg transition-all duration-500 transform group-hover:-translate-y-3 group-hover:shadow-2xl">
                  <div className="relative h-56 overflow-hidden">
                    <img
                      src={event.image}
                      alt={event.title}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                    <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-sm px-3 py-1.5 rounded-full">
                      <span className="text-sm font-bold text-primary-600">{event.price}</span>
                    </div>

                    <div className="absolute top-4 left-4 flex items-center space-x-1 bg-black/70 backdrop-blur-sm px-3 py-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-500">
                      <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                      <span className="text-sm font-semibold text-white">{event.rating.toFixed(1)}</span>
                    </div>
                  </div>

                  <div className="p-6 transition-all duration-500 group-hover:bg-gradient-to-br group-hover:from-primary-50 group-hover:to-white">
                    <h3 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2 group-hover:text-primary-600 transition-colors duration-300">
                      {event.title}
                    </h3>

                    <div className="space-y-2 mb-4">
                      <div className="flex items-center text-gray-600 group-hover:text-gray-700">
                        <Calendar className="w-4 h-4 mr-2 flex-shrink-0" />
                        <span className="text-sm">{event.date}</span>
                      </div>
                      <div className="flex items-center text-gray-600 group-hover:text-gray-700">
                        <MapPin className="w-4 h-4 mr-2 flex-shrink-0" />
                        <span className="text-sm line-clamp-1">{event.location}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                      <div className="flex items-center space-x-2">
                        <div className="flex -space-x-2">
                          {[1, 2, 3].map((i) => (
                            <div
                              key={i}
                              className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-400 to-secondary-400 border-2 border-white flex items-center justify-center text-white text-xs font-bold"
                            >
                              {String.fromCharCode(64 + i)}
                            </div>
                          ))}
                        </div>
                        <span className="text-sm text-gray-600">
                          {event.attendees > 0 ? `${event.attendees}+ attending` : 'Be the first'}
                        </span>
                      </div>

                      <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                        <ArrowRight className="w-5 h-5 text-primary-500 transform group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-center mt-8 space-x-2">
            {Array.from({ length: Math.min(events.length, 10) }).map((_, index) => (
              <button
                key={index}
                onClick={() => {
                  setCurrentIndex(index);
                  setIsPaused(false);
                }}
                className={`h-2 rounded-full transition-all duration-300 ${
                  index === currentIndex
                    ? 'w-8 bg-gradient-to-r from-primary-500 to-secondary-500'
                    : 'w-2 bg-gray-300 hover:bg-gray-400'
                }`}
              />
            ))}
          </div>
        </div>

        <div className="text-center mt-12">
          <button
            onClick={() => navigate('/discover')}
            className="inline-flex items-center bg-gradient-to-r from-primary-500 to-secondary-500 text-white px-8 py-3 rounded-2xl font-semibold hover:shadow-lg transition-all duration-300 transform hover:scale-105 group"
          >
            <span>Explore All Trending Events</span>
            <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>
    </section>
  );
};

export default TrendingEvents;
