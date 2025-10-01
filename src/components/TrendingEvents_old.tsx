import React from "react";
import { useState, useEffect } from "react";
import { Calendar, MapPin, Users, Star } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";

const TrendingEvents = () => {
  const navigate = useNavigate();
  const [events, setEvents] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  // Load real events from database
  useEffect(() => {
    const loadEvents = async () => {
      try {
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
          .order('created_at', { ascending: false })
          .limit(8);

        if (error) {
          console.error('Error loading trending events:', error);
          setEvents([]);
        } else {
          // Transform database events
          const transformedEvents = data.map(event => ({
            id: event.id,
            title: event.title,
            date: new Date(event.start_date).toLocaleDateString('en-US', { 
              month: 'short', 
              day: 'numeric', 
              year: 'numeric' 
            }),
            location: event.location,
            attendees: Math.floor(event.capacity * 0.7), // Estimated attendance
            rating: 4.5 + Math.random() * 0.5, // Rating between 4.5-5.0
            price: event.price === 0 ? "Free" : `GH₵${(event.price / 100).toFixed(2)}`,
            image: event.image_url || "https://images.pexels.com/photos/2608517/pexels-photo-2608517.jpeg?auto=compress&cs=tinysrgb&w=400",
            organizer_name: event.organizers?.organization_name || 
                           `${event.organizers?.first_name || ''} ${event.organizers?.last_name || ''}`.trim() || 
                           'Unknown Organizer'
          }));

          setEvents(transformedEvents);
        }
      } catch (error) {
        console.error('Error loading trending events:', error);
        setEvents([]);
      } finally {
        setIsLoading(false);
      }
    };    loadEvents();
  }, []);
  if (isLoading) {
    return (
      <div className="py-20 bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  // Show message when no events are available
  if (events.length === 0) {
    return (
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Trending Events
            </h2>
            <p className="text-lg text-gray-600 mb-8">
              No trending events available at the moment
            </p>
            <button
              onClick={() => navigate('/discover')}
              className="inline-flex items-center text-primary-500 font-semibold hover:text-secondary-500 transition-colors"
            >
              Explore All Events
              <Calendar className="w-4 h-4 ml-2" />
            </button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-20 bg-gray-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-12">
          <div>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Trending Events
            </h2>
            <p className="text-lg text-gray-600">
              Don't miss out on the hottest events happening near you
            </p>
          </div>
          <button className="hidden sm:inline-flex items-center text-primary-500 font-semibold hover:text-secondary-500 transition-colors">
            View All Events
            <Calendar className="w-4 h-4 ml-2" />
          </button>
        </div>

        {/* Horizontal Scroll Container */}
        <div className="relative">
          <div
            className="flex space-x-6 overflow-x-auto scrollbar-hide pb-4"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            {events.map((event) => (
              <div key={event.id} className="flex-none w-80 group">
                <div className="bg-white rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2">
                  {/* Event Image */}
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={event.image}
                      alt={event.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-xl px-3 py-1">
                      <span className="text-sm font-semibold text-primary-500">
                        {event.price}
                      </span>
                    </div>
                  </div>

                  {/* Event Details */}
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2">
                      {event.title}
                    </h3>

                    <div className="space-y-2 mb-4">
                      <div className="flex items-center text-gray-600">
                        <Calendar className="w-4 h-4 mr-2" />
                        <span className="text-sm">{event.date}</span>
                      </div>
                      <div className="flex items-center text-gray-600">
                        <MapPin className="w-4 h-4 mr-2" />
                        <span className="text-sm">{event.location}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center text-gray-600">
                          <Users className="w-4 h-4 mr-2" />
                          <span className="text-sm">
                            {event.attendees.toLocaleString()}
                          </span>
                        </div>
                        <div className="flex items-center text-yellow-500">
                          <Star className="w-4 h-4 mr-1 fill-current" />
                          <span className="text-sm font-semibold">
                            {event.rating}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* CTA Button */}
                    <button
                      className="w-full mt-4 bg-gradient-to-r from-primary-500 to-secondary-500 text-white py-3 rounded-2xl font-semibold hover:shadow-lg transition-all duration-300 transform hover:scale-105"
                      onClick={() => navigate(`/event/${event.id}`)}
                    >
                      Register Now
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Mobile View All Button */}
        <div className="text-center mt-8 sm:hidden">
          <button className="inline-flex items-center text-primary-500 font-semibold hover:text-secondary-500 transition-colors">
            View All Events
            <Calendar className="w-4 h-4 ml-2" />
          </button>
        </div>
      </div>
    </section>
  );
};

export default TrendingEvents;
