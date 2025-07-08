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
              organization_name
            )
          `)
          .eq('is_published', true)
          .order('created_at', { ascending: false })
          .limit(10);

        if (error) {
          console.error('Error loading trending events:', error);
          // Fall back to mock data
          setEvents(mockEvents);
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
            attendees: Math.floor(event.capacity * 0.6), // Mock attendance
            rating: 4.5 + Math.random() * 0.5, // Random rating between 4.5-5.0
            price: event.price === 0 ? "Free" : `$${event.price}`,
            image: event.image_url || "https://images.pexels.com/photos/2608517/pexels-photo-2608517.jpeg?auto=compress&cs=tinysrgb&w=400",
          }));

          // Mix real events with mock events if needed
          const allEvents = [...transformedEvents, ...mockEvents.slice(transformedEvents.length)];
        .limit(8);
        }
      } catch (error) {
        console.error('Error loading trending events:', error);
        setEvents(mockEvents);
      } finally {
        setIsLoading(false);
      }
    };

    loadEvents();
  }, []);

  const mockEvents = [
    {
      id: 1,
      title: "Tech Innovation Summit",
      date: "Mar 15, 2025",
      location: "San Francisco, CA",
      attendees: 500,
      rating: 4.3,
      price: "$50",
      image:
        "https://images.pexels.com/photos/2608517/pexels-photo-2608517.jpeg?auto=compress&cs=tinysrgb&w=400",
    },
    {
      id: 2,
      title: "Digital Marketing Masterclass",
      date: "Mar 20, 2025",
      location: "New York, NY",
      attendees: 800,
      rating: 4.8,
      price: "$75",
      image:
        "https://images.pexels.com/photos/1181406/pexels-photo-1181406.jpeg?auto=compress&cs=tinysrgb&w=400",
    },
    {
      id: 3,
      title: "Creative Design Workshop",
      date: "Mar 25, 2025",
      location: "Los Angeles, CA",
      attendees: 300,
      rating: 4.7,
      price: "Free",
      image:
        "https://images.pexels.com/photos/1181263/pexels-photo-1181263.jpeg?auto=compress&cs=tinysrgb&w=400",
    },
    {
      id: 4,
      title: "Business Networking Event",
      date: "Apr 2, 2025",
      location: "Chicago, IL",
      attendees: 1500,
      rating: 4.9,
      price: "$25",
      image:
        "https://images.pexels.com/photos/1190298/pexels-photo-1190298.jpeg?auto=compress&cs=tinysrgb&w=400",
    },
    {
      id: 5,
      title: "Music Festival",
      date: "Jun 22, 2025",
      location: "Austin, TX",
      attendees: 200,
      rating: 4.6,
      price: "Free",
      image:
        "https://images.pexels.com/photos/1763075/pexels-photo-1763075.jpeg?auto=compress&cs=tinysrgb&w=400",
    },
  ];

  if (isLoading) {
    return (
      <div className="py-20 bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
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
