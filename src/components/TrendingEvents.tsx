import React from 'react';
import { Calendar, MapPin, Users, Star } from 'lucide-react';

const TrendingEvents = () => {
  const events = [
    {
      id: 1,
      title: "VALUE INVESTMENT BOOTCAMP",
      date: "Mar 15, 2024",
      location: "Accra, Ghana",
      attendees: 2500,
      rating: 4.3,
      price: "₵10",
      image: "https://res.cloudinary.com/dt3xctihn/image/upload/v1748934874/Screenshot_2025-06-03_at_7.14.25_AM_oaxjud.png"
    },
    {
      id: 2,
      title: "Digital Marketing Masterclass",
      date: "Mar 20, 2024",
      location: "Ashesi University, Berekuso",
      attendees: 800,
      rating: 4.8,
      price: "₵10",
      image: "https://res.cloudinary.com/dt3xctihn/image/upload/v1748934755/Screenshot_2025-06-03_at_7.12.23_AM_eh4kma.png"
    },
    {
      id: 3,
      title: "Fire Festival",
      date: "Mar 25, 2024",
      location: "Evans Anfom Auditorium Complex",
      attendees: 300,
      rating: 4.7,
      price: "Free",
      image: "https://res.cloudinary.com/dt3xctihn/image/upload/v1748934638/Screenshot_2025-06-03_at_7.10.30_AM_kkf845.png"
    },
    {
      id: 4,
      title: "CHAYIL CONFERENCE 2025",
      date: "July 2, 2024",
      location: "Tema, Ghana",
      attendees: 1500,
      rating: 4.9,
      price: "₵50",
      image: "https://res.cloudinary.com/dt3xctihn/image/upload/v1748934599/Screenshot_2025-06-03_at_7.09.51_AM_xc61uv.png"
    },
    {
      id: 5,
      title: "Invasion 2025",
      date: "Jun 22, 2024",
      location: "University Of Ghana Sports Stadium",
      attendees: 200,
      rating: 4.6,
      price: "Free",
      image: "https://res.cloudinary.com/dt3xctihn/image/upload/v1748934359/Screenshot_2025-06-03_at_7.05.49_AM_jwfkdz.png"
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