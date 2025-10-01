import { useState, useEffect } from "react";
import { MapPin, Users, Clock, Zap, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";

const LiveEvents = () => {
  const navigate = useNavigate();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [liveEvents, setLiveEvents] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Load events that are happening soon or currently live
  useEffect(() => {
    const loadLiveEvents = async () => {
      try {
        const now = new Date();
        const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

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
          .eq('status', 'published')
          .gte('start_date', now.toISOString())
          .lte('start_date', nextWeek.toISOString())
          .order('start_date', { ascending: true })
          .limit(6);

        if (error) {
          console.error('Error loading live events:', error);
          setLiveEvents([]);
        } else {
          // Transform database events
          const transformedEvents = data.map(event => {
            const startTime = new Date(event.start_date);
            const timeUntilStart = startTime.getTime() - now.getTime();
            
            let status = 'upcoming';
            if (timeUntilStart < 0) {
              status = 'live'; // Event has started
            } else if (timeUntilStart < 2 * 60 * 60 * 1000) {
              status = 'starting-soon'; // Starting within 2 hours
            }

            return {
              id: event.id,
              title: event.title,
              organizer: event.organizers?.organization_name || 
                        `${event.organizers?.first_name || ''} ${event.organizers?.last_name || ''}`.trim() || 
                        'Unknown Organizer',
              location: event.venue_name || event.location,
              startTime: startTime,
              attendees: Math.floor(event.capacity * 0.6), // Estimated current attendance
              maxAttendees: event.capacity,
              status: status,
              image: event.image_url || "https://images.pexels.com/photos/2608517/pexels-photo-2608517.jpeg?auto=compress&cs=tinysrgb&w=400",
            };
          });

          setLiveEvents(transformedEvents);
        }
      } catch (error) {
        console.error('Error loading live events:', error);
        setLiveEvents([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadLiveEvents();
  }, []);

  const getTimeUntilStart = (startTime: Date) => {
    const diff = startTime.getTime() - currentTime.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (diff < 0) return "Live Now";
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "live":
        return "bg-red-500";
      case "starting-soon":
        return "bg-orange-500";
      default:
        return "bg-gray-500";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "live":
        return "LIVE NOW";
      case "starting-soon":
        return "STARTING SOON";
      default:
        return "UPCOMING";
    }
  };
  return (
    <section className="py-16 bg-gradient-to-br from-gray-50 to-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-12">
          <div>
            <div className="inline-flex items-center space-x-2 bg-red-50 px-4 py-2 rounded-full mb-4">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium text-red-700">
                Live & Starting Soon
              </span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Happening Right Now
            </h2>
            <p className="text-lg text-gray-600">
              Join events that are live or starting soon
            </p>
          </div>
        </div>

        {/* Loading State */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
          </div>
        ) : liveEvents.length === 0 ? (
          /* Empty State */
          <div className="text-center py-20">
            <Clock className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No Live Events Right Now
            </h3>
            <p className="text-gray-600 mb-6">
              Check back later for events that are live or starting soon
            </p>
            <button
              onClick={() => navigate('/discover')}
              className="inline-flex items-center text-primary-500 font-semibold hover:text-secondary-500 transition-colors"
            >
              Browse All Events
              <ArrowRight className="w-4 h-4 ml-2" />
            </button>
          </div>
        ) : (
          /* Events Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {liveEvents.map((event) => (
            <div key={event.id} className="group relative">
              <div className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                {/* Event Image */}
                <div className="relative h-40 overflow-hidden">
                  <img
                    src={event.image}
                    alt={event.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>

                  {/* Live Status Badge */}
                  <div
                    className={`absolute top-3 left-3 ${getStatusColor(
                      event.status
                    )} text-white px-3 py-1 rounded-full text-xs font-bold flex items-center space-x-1`}
                  >
                    {event.status === "live" && <Zap className="w-3 h-3" />}
                    <span>{getStatusText(event.status)}</span>
                  </div>

                  {/* Time Badge */}
                  <div className="absolute top-3 right-3 bg-black/70 text-white px-3 py-1 rounded-full text-xs font-medium">
                    {getTimeUntilStart(event.startTime)}
                  </div>
                </div>

                {/* Event Details */}
                <div className="p-5">
                  <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2">
                    {event.title}
                  </h3>

                  <p className="text-sm text-gray-600 mb-3">
                    {event.organizer}
                  </p>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-gray-600">
                      <MapPin className="w-4 h-4 mr-2" />
                      <span className="text-sm">{event.location}</span>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <Users className="w-4 h-4 mr-2" />
                      <span className="text-sm">
                        {event.attendees} attending
                      </span>
                    </div>
                  </div>

                  {/* Attendance Progress */}
                  <div className="mb-4">
                    <div className="w-full bg-gray-200 rounded-full h-1.5">
                      <div
                        className={`h-1.5 rounded-full transition-all duration-300 ${
                          event.status === "live"
                            ? "bg-red-500"
                            : "bg-orange-500"
                        }`}
                        style={{
                          width: `${
                            (event.attendees / event.maxAttendees) * 100
                          }%`,
                        }}
                      ></div>
                    </div>
                  </div>

                  {/* CTA Button */}
                  <button
                    className={`w-full text-white py-2.5 rounded-xl font-semibold text-sm transition-all duration-300 transform hover:scale-105 ${
                      event.status === "live"
                        ? "bg-red-500 hover:bg-red-600"
                        : "bg-orange-500 hover:bg-orange-600"
                    }`}
                    onClick={() => navigate(`/event/${event.id}`)}
                  >
                    {event.status === "live" ? "Join Now" : "Get Ready"}
                  </button>
                </div>              </div>
            </div>
          ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default LiveEvents;
