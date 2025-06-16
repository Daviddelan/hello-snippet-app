import React from 'react';
import { Calendar, MapPin, Users, Star } from 'lucide-react';

const TrendingEvents = () => {
  const events = [
    {
      id: 1,
      title: "Tech Innovation Summit 2024",
      date: "Mar 15, 2024",
      location: "San Francisco, CA",
      attendees: 2500,
      rating: 4.9,
      price: "$299",
      image: "https://images.pexels.com/photos/2608517/pexels-photo-2608517.jpeg?auto=compress&cs=tinysrgb&w=400"
    },
    {
      id: 2,
      title: "Digital Marketing Masterclass",
      date: "Mar 20, 2024",
      location: "New York, NY",
      attendees: 800,
      rating: 4.8,
      price: "$149",
      image: "https://images.pexels.com/photos/3184306/pexels-photo-3184306.jpeg?auto=compress&cs=tinysrgb&w=400"
    },
    {
      id: 3,
      title: "Startup Founders Networking",
      date: "Mar 25, 2024",
      location: "Austin, TX",
      attendees: 300,
      rating: 4.7,
      price: "Free",
      image: "https://images.pexels.com/photos/1181406/pexels-photo-1181406.jpeg?auto=compress&cs=tinysrgb&w=400"
    },
    {
      id: 4,
      title: "AI & Machine Learning Conference",
      date: "Apr 2, 2024",
      location: "Seattle, WA",
      attendees: 1500,
      rating: 4.9,
      price: "$399",
      image: "https://images.pexels.com/photos/2608517/pexels-photo-2608517.jpeg?auto=compress&cs=tinysrgb&w=400"
    },
    {
      id: 5,
      title: "Creative Design Workshop",
      date: "Apr 8, 2024",
      location: "Los Angeles, CA",
      attendees: 200,
      rating: 4.6,
      price: "$99",
      image: "https://images.pexels.com/photos/3184305/pexels-photo-3184305.jpeg?auto=compress&cs=tinysrgb&w=400"
    }
  ];

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
          <div className="flex space-x-6 overflow-x-auto scrollbar-hide pb-4" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
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
                      <span className="text-sm font-semibold text-primary-500">{event.price}</span>
                    </div>
                  </div>

                  {/* Event Details */}
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2">{event.title}</h3>
                    
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
                          <span className="text-sm">{event.attendees.toLocaleString()}</span>
                        </div>
                        <div className="flex items-center text-yellow-500">
                          <Star className="w-4 h-4 mr-1 fill-current" />
                          <span className="text-sm font-semibold">{event.rating}</span>
                        </div>
                      </div>
                    </div>

                    {/* CTA Button */}
                    <button className="w-full mt-4 bg-gradient-to-r from-primary-500 to-secondary-500 text-white py-3 rounded-2xl font-semibold hover:shadow-lg transition-all duration-300 transform hover:scale-105">
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