import React from 'react';
import { Calendar, MapPin, Users, Star, Clock, ArrowRight } from 'lucide-react';

const FeaturedEvents = () => {
  const featuredEvents = [
    {
      id: 1,
      title: "Fire Camp",
      organizer: "Kingdom Christian Fellowship",
      organizerAvatar: "https://res.cloudinary.com/dt3xctihn/image/upload/v1750163039/Screenshot_2025-06-17_at_12.23.49_PM_ks03cn.png",
      date: "August 15, 2026",
      time: "9:00 AM - 6:00 PM",
      location: "To Be Determined",
      city: "Accra, Ghana",
      attendees: 2500,
      maxAttendees: 3000,
      rating: 4.9,
      price: 100,
      category: "Christian",
      image: "https://res.cloudinary.com/dt3xctihn/image/upload/v1748933188/Screenshot_2025-06-03_at_6.46.19_AM_vkkafe.png",
      featured: true,
      tags: ["Grow", "Learn", "Fellowship", "Love", "Worship", "Prayer"]
    },
    {
      id: 2,
      title: "Creative Design Workshop: From Concept to Creation",
      organizer: "Design Masters Studio",
      organizerAvatar: "https://images.pexels.com/photos/1130626/pexels-photo-1130626.jpeg?auto=compress&cs=tinysrgb&w=100",
      date: "July 18, 2025",
      time: "2:00 PM - 8:00 PM",
      location: "Despite Automobile Museum",
      city: "East Legon, Accra",
      attendees: 150,
      maxAttendees: 200,
      rating: 4.8,
      price: 0,
      category: "Cars",
      image: "https://res.cloudinary.com/dt3xctihn/image/upload/v1748933697/Screenshot_2025-06-03_at_6.54.43_AM_vpxpy7.png",
      featured: true,
      tags: ["Beauty", "Workshop", "Network", "Photoshoot", "Cars"]
    },
    {
      id: 3,
      title: "Ghana Data Science Summit 2025",
      organizer: "Indaba X",
      organizerAvatar: "https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg?auto=compress&cs=tinysrgb&w=100",
      date: "June 18, 2025",
      time: "6:00 AM - 10:00 PM",
      location: "Ashesi University",
      city: "Berekuso, Ghana",
      attendees: 280,
      maxAttendees: 300,
      rating: 4.7,
      price: 0,
      category: "Education",
      image: "https://res.cloudinary.com/dt3xctihn/image/upload/v1748933448/Screenshot_2025-06-03_at_6.50.36_AM_pvkafn.png",
      featured: true,
      tags: ["Networking", "Startup", "Business", "Free"]
    }
  ];

  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-12">
          <div>
            <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-primary-50 to-secondary-50 px-4 py-2 rounded-full mb-4">
              <Star className="w-4 h-4 text-primary-500" />
              <span className="text-sm font-medium text-primary-700">Featured Events</span>
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
          {featuredEvents.map((event, index) => (
            <div key={event.id} className={`group ${index === 0 ? 'lg:col-span-2 lg:row-span-2' : ''}`}>
              <div className="bg-white rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 h-full">
                {/* Event Image */}
                <div className={`relative overflow-hidden ${index === 0 ? 'h-80' : 'h-48'}`}>
                  <img 
                    src={event.image} 
                    alt={event.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent"></div>
                  
                  {/* Price Badge */}
                  <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-sm rounded-xl px-3 py-2">
                    <span className="text-sm font-bold text-primary-500">
                      {event.price === 0 ? 'FREE' : `$${event.price}`}
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
                        <p className="text-white font-medium text-sm">Organized by</p>
                        <p className="text-white/90 text-sm">{event.organizer}</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Event Details */}
                <div className="p-6">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <div className="flex items-center text-yellow-500">
                        <Star className="w-4 h-4 fill-current" />
                        <span className="text-sm font-semibold ml-1">{event.rating}</span>
                      </div>
                      <div className="w-1 h-1 bg-gray-300 rounded-full"></div>
                      <span className="text-sm text-gray-500">{event.attendees} attending</span>
                    </div>
                  </div>

                  <h3 className={`font-bold text-gray-900 mb-3 line-clamp-2 ${index === 0 ? 'text-2xl' : 'text-xl'}`}>
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
                    {event.tags.slice(0, 3).map((tag, tagIndex) => (
                      <span key={tagIndex} className="bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-xs">
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
                        style={{ width: `${(event.attendees / event.maxAttendees) * 100}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* CTA Button */}
                  <button className="w-full bg-gradient-to-r from-primary-500 to-secondary-500 text-white py-3 rounded-2xl font-semibold hover:shadow-lg transition-all duration-300 transform hover:scale-105">
                    Register Now
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Mobile View All Button */}
        <div className="text-center mt-8 lg:hidden">
          <button className="inline-flex items-center text-primary-500 font-semibold hover:text-secondary-500 transition-colors group">
            View All Events
            <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>
    </section>
  );
};

export default FeaturedEvents;