import React, { useState, useEffect } from 'react';
import { Calendar, MapPin, Users, Clock, Zap, ArrowRight } from 'lucide-react';

const LiveEvents = () => {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const liveEvents = [
    {
      id: 1,
      title: "Despite Automobile Museum Inauguration",
      organizer: "Despite Group of Companies",
      location: "Virtual Event",
      startTime: new Date(Date.now() + 2 * 60 * 60 * 1000), // 2 hours from now
      attendees: 847,
      maxAttendees: 1000,
      status: "starting-soon",
      image: "https://res.cloudinary.com/dt3xctihn/image/upload/v1748933697/Screenshot_2025-06-03_at_6.54.43_AM_vpxpy7.png"
    },
    {
      id: 2,
      title: "Edenic Worship Experience '25'",
      organizer: "ICGC Calvary Temple",
      location: "Spintex Road, Accra",
      startTime: new Date(Date.now() + 30 * 60 * 1000), // 30 minutes from now
      attendees: 234,
      maxAttendees: 300,
      status: "starting-soon",
      image: "https://res.cloudinary.com/dt3xctihn/image/upload/v1748933849/Screenshot_2025-06-03_at_6.57.10_AM_dyse09.png"
    },
    {
      id: 3,
      title: "Behold Your God '25",
      organizer: "The Worshipping Warriors & Korle-Bu Christian Network",
      location: "Accra, Ghana",
      startTime: new Date(Date.now() - 30 * 60 * 1000), // Started 30 minutes ago
      attendees: 45,
      maxAttendees: 50,
      status: "live",
      image: "https://res.cloudinary.com/dt3xctihn/image/upload/v1748934175/Screenshot_2025-06-03_at_7.02.29_AM_dftvlw.png"
    }
  ];

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
      case 'live': return 'bg-red-500';
      case 'starting-soon': return 'bg-orange-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'live': return 'LIVE NOW';
      case 'starting-soon': return 'STARTING SOON';
      default: return 'UPCOMING';
    }
  };

  return (
    <section className="py-16 bg-gradient-to-br from-gray-50 to-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-12">
          <div>
            <div className="inline-flex items-center space-x-2 bg-red-50 px-4 py-2 rounded-full mb-4">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium text-red-700">Live & Starting Soon</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Happening Right Now
            </h2>
            <p className="text-lg text-gray-600">
              Join events that are live or starting soon
            </p>
          </div>
        </div>

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
                  <div className={`absolute top-3 left-3 ${getStatusColor(event.status)} text-white px-3 py-1 rounded-full text-xs font-bold flex items-center space-x-1`}>
                    {event.status === 'live' && <Zap className="w-3 h-3" />}
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
                  
                  <p className="text-sm text-gray-600 mb-3">{event.organizer}</p>
                  
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-gray-600">
                      <MapPin className="w-4 h-4 mr-2" />
                      <span className="text-sm">{event.location}</span>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <Users className="w-4 h-4 mr-2" />
                      <span className="text-sm">{event.attendees} attending</span>
                    </div>
                  </div>

                  {/* Attendance Progress */}
                  <div className="mb-4">
                    <div className="w-full bg-gray-200 rounded-full h-1.5">
                      <div 
                        className={`h-1.5 rounded-full transition-all duration-300 ${
                          event.status === 'live' ? 'bg-red-500' : 'bg-orange-500'
                        }`}
                        style={{ width: `${(event.attendees / event.maxAttendees) * 100}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* CTA Button */}
                  <button className={`w-full text-white py-2.5 rounded-xl font-semibold text-sm transition-all duration-300 transform hover:scale-105 ${
                    event.status === 'live' 
                      ? 'bg-red-500 hover:bg-red-600' 
                      : 'bg-orange-500 hover:bg-orange-600'
                  }`}>
                    {event.status === 'live' ? 'Join Now' : 'Get Ready'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default LiveEvents;