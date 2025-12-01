import { useState, useEffect } from "react";
import { Calendar, MapPin, Star, Clock, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";

const FeaturedEvents = () => {
  const navigate = useNavigate();
  const [events, setEvents] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  // Load real events from database
  useEffect(() => {
    const loadEvents = async () => {
      try {
        console.log('🔄 FeaturedEvents: Starting to load events...');
        
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
          .limit(3);        if (error) {
          console.error('❌ FeaturedEvents: Error loading events:', error);
          console.log('📋 FeaturedEvents: Error details:', {
            code: error.code,
            message: error.message,
            details: error.details,
            hint: error.hint
          });
          // Don't fall back to mock data - just show empty state
          setEvents([]);
        } else {
          console.log('✅ FeaturedEvents: Successfully loaded events from database');
          console.log('📊 FeaturedEvents: Raw data:', data);
            // Transform database events to match our component structure
          const transformedEvents = data.map((event) => ({
            id: event.id,
            title: event.title,
            organizer: event.organizers?.organization_name || 'Event Organizer',
            organizerAvatar: "https://images.pexels.com/photos/1130626/pexels-photo-1130626.jpeg?auto=compress&cs=tinysrgb&w=100",
            date: new Date(event.start_date).toLocaleDateString('en-US', { 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            }),
            time: `${new Date(event.start_date).toLocaleTimeString('en-US', { 
              hour: 'numeric', 
              minute: '2-digit' 
            })} - ${new Date(event.end_date).toLocaleTimeString('en-US', { 
              hour: 'numeric', 
              minute: '2-digit' 
            })}`,
            location: event.venue_name || event.location,
            city: event.location,
            maxAttendees: event.capacity,
            rating: 4.8,
            price: event.price,
            category: event.category,
            image: event.image_url || "https://images.pexels.com/photos/2608517/pexels-photo-2608517.jpeg?auto=compress&cs=tinysrgb&w=400",
            featured: true,
            tags: [event.category, "Featured", event.price === 0 ? "Free" : "Paid"]
          }));

          console.log('🔄 FeaturedEvents: Transformed events:', transformedEvents);
          setEvents(transformedEvents);
          
          console.log('📋 FeaturedEvents: Final events to display:', transformedEvents);
        }      } catch (error) {
        console.error('💥 FeaturedEvents: Unexpected error loading events:', error);
        setEvents([]);
      } finally {
        console.log('🏁 FeaturedEvents: Loading completed, setting isLoading to false');
        setIsLoading(false);
      }
    };

    loadEvents();
  }, []);

  const featuredEvents = [
    {
      id: 1,
      title: "Tech Innovation Summit 2025",
      organizer: "TechVision Events",
      organizerAvatar: "https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=100",
      date: "March 15, 2025",
      time: "9:00 AM - 6:00 PM",
      location: "Convention Center",
      city: "San Francisco, CA",
      attendees: 450,
      maxAttendees: 500,
      rating: 4.9,
      price: 199,
      category: "Technology",
      image: "https://images.pexels.com/photos/2608517/pexels-photo-2608517.jpeg?auto=compress&cs=tinysrgb&w=400",
      featured: true,
      tags: ["Innovation", "Networking", "Tech", "AI", "Future"],
    },
    {
      id: 2,
      title: "Creative Design Workshop: From Concept to Creation",
      organizer: "Design Masters Studio",
      organizerAvatar: "https://images.pexels.com/photos/1130626/pexels-photo-1130626.jpeg?auto=compress&cs=tinysrgb&w=100",
      date: "March 22, 2025",
      time: "2:00 PM - 8:00 PM",
      location: "Design Studio",
      city: "New York, NY",
      attendees: 150,
      maxAttendees: 200,
      rating: 4.8,
      price: 149,
      category: "Arts & Culture",
      image: "https://images.pexels.com/photos/1181406/pexels-photo-1181406.jpeg?auto=compress&cs=tinysrgb&w=400",
      featured: true,
      tags: ["Design", "Workshop", "Creative", "Hands-on", "Portfolio"],
    },
    {
      id: 3,
      title: "Professional Networking Summit",
      organizer: "Business Network Pro",
      organizerAvatar: "https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg?auto=compress&cs=tinysrgb&w=100",
      date: "April 5, 2025",
      time: "6:00 PM - 10:00 PM",
      location: "Business Center",
      city: "Chicago, IL",
      attendees: 280,
      maxAttendees: 300,
      rating: 4.7,
      price: 75,
      category: "Business & Professional",
      image: "https://images.pexels.com/photos/1181263/pexels-photo-1181263.jpeg?auto=compress&cs=tinysrgb&w=400",
      featured: true,
      tags: ["Networking", "Business", "Professional", "Career", "Growth"],
    },
  ];

  if (isLoading) {
    return (
      <div className="py-20 bg-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-12">
          <div>
            <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-primary-50 to-secondary-50 px-4 py-2 rounded-full mb-4">
              <Star className="w-4 h-4 text-primary-500" />
              <span className="text-sm font-medium text-primary-700">
                Featured Events
              </span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Don't Miss These Amazing Events
            </h2>
            <p className="text-lg text-gray-600">
              Handpicked events from our community of amazing organizers
            </p>
          </div>
          <button className="hidden lg:inline-flex items-center text-primary-500 font-semibold hover:text-secondary-500 transition-colors group">
            View All Events
            <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {events.map((event, index) => (
            <div
              key={event.id}
              className={`group ${
                index === 0 ? "lg:col-span-2 lg:row-span-2" : ""
              }`}
            >
              <div className="bg-white rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 h-full">
                {/* Event Image */}
                <div
                  className={`relative overflow-hidden ${
                    index === 0 ? "h-80" : "h-48"
                  }`}
                >
                  <img
                    src={event.image}
                    alt={event.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent"></div>

                  {/* Price Badge */}
                  <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-sm rounded-xl px-3 py-2">
                    <span className="text-sm font-bold text-primary-500">
                      {event.price === 0 ? "FREE" : `GH₵${event.price}`}
                    </span>
                  </div>

                  {/* Category Badge */}
                  <div className="absolute top-4 left-4 bg-primary-500/90 backdrop-blur-sm text-white px-3 py-1 rounded-full text-xs font-medium">
                    {event.category}
                  </div>

                  {/* Organizer Info (for featured event) */}
                  {index === 0 && (
                    <div className="absolute bottom-4 left-4 flex items-center space-x-3">
                      <img
                        src={event.organizerAvatar}
                        alt={event.organizer}
                        className="w-10 h-10 rounded-full border-2 border-white"
                      />
                      <div>
                        <p className="text-white font-medium text-sm">
                          Organized by
                        </p>
                        <p className="text-white/90 text-sm">
                          {event.organizer}
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Event Details */}
                <div className="p-6">                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <div className="flex items-center text-yellow-500">
                        <Star className="w-4 h-4 fill-current" />
                        <span className="text-sm font-semibold ml-1">
                          {event.rating}
                        </span>
                      </div>
                    </div>
                  </div>

                  <h3
                    className={`font-bold text-gray-900 mb-3 line-clamp-2 ${
                      index === 0 ? "text-2xl" : "text-xl"
                    }`}
                  >
                    {event.title}
                  </h3>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-gray-600">
                      <Calendar className="w-4 h-4 mr-2 flex-shrink-0" />
                      <span className="text-sm">{event.date}</span>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <Clock className="w-4 h-4 mr-2 flex-shrink-0" />
                      <span className="text-sm">{event.time}</span>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <MapPin className="w-4 h-4 mr-2 flex-shrink-0" />
                      <span className="text-sm">{event.city}</span>
                    </div>
                  </div>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {event.tags.slice(0, 3).map((tag: string, tagIndex: number) => (
                      <span
                        key={tagIndex}
                        className="bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-xs"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  {/* Attendance Progress */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                      <span>{event.attendees} registered</span>
                      <span>{event.maxAttendees} max</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-primary-500 to-secondary-500 h-2 rounded-full transition-all duration-300"
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
                    className="w-full bg-gradient-to-r from-primary-500 to-secondary-500 text-white py-3 rounded-2xl font-semibold hover:shadow-lg transition-all duration-300 transform hover:scale-105"
                    onClick={() => navigate(`/event/${event.id}`)}
                  >
                    Register Now
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Removed duplicate scroll button for mobile */}
      </div>
    </section>
  );
};

export default FeaturedEvents;
