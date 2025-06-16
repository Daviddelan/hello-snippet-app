import React, { useState } from 'react';
import { Search, Calendar, Users, ArrowRight } from 'lucide-react';

const Hero = () => {
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-primary-500 via-primary-600 to-secondary-500 min-h-screen flex items-center">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-10 w-32 h-32 rounded-full bg-white/20"></div>
        <div className="absolute top-40 right-20 w-20 h-20 rounded-full bg-white/10"></div>
        <div className="absolute bottom-32 left-1/4 w-16 h-16 rounded-full bg-white/15"></div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-4xl mx-auto">
          {/* Logo with Enhanced Visibility */}
          <div className="flex items-center justify-center mb-8">
            <div className="relative group">
              {/* White background circle for contrast */}
              <div className="absolute inset-0 bg-white rounded-3xl blur-xl opacity-30 group-hover:opacity-40 transition-opacity duration-300"></div>
              <div className="relative bg-white/95 backdrop-blur-sm rounded-3xl p-6 shadow-2xl border border-white/20 group-hover:scale-105 transition-all duration-300">
                <img 
                  src="/hellosnippet_transparent.png" 
                  alt="HelloSnippet" 
                  className="h-16 sm:h-20 w-auto"
                />
              </div>
            </div>
          </div>

          {/* Hero Content */}
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
            Discover Amazing
            <span className="block bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent">
              Events Near You
            </span>
          </h2>

          <p className="text-lg sm:text-xl text-white/90 mb-8 max-w-2xl mx-auto leading-relaxed">
            Whether you're organizing corporate events, planning memorable experiences, or looking for exciting activities, HelloSnippet connects you with the perfect event ecosystem.
          </p>

          {/* Search Bar */}
          <div className="relative max-w-2xl mx-auto mb-8">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search events, locations, or categories..."
                className="w-full pl-12 pr-4 py-4 text-lg rounded-2xl border-0 focus:ring-4 focus:ring-white/20 focus:outline-none shadow-2xl"
              />
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <button className="group bg-white text-primary-500 px-8 py-4 rounded-2xl font-semibold text-lg hover:bg-gray-50 transition-all duration-300 flex items-center space-x-2 shadow-2xl hover:shadow-3xl transform hover:-translate-y-1">
              <Calendar className="w-5 h-5" />
              <span>Create Event</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
            
            <button className="group bg-transparent border-2 border-white text-white px-8 py-4 rounded-2xl font-semibold text-lg hover:bg-white hover:text-primary-500 transition-all duration-300 flex items-center space-x-2">
              <Users className="w-5 h-5" />
              <span>Browse Events</span>
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 mt-16 max-w-2xl mx-auto">
            <div className="text-center">
              <div className="text-3xl font-bold text-white mb-2">50K+</div>
              <div className="text-white/80">Events Created</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-white mb-2">1M+</div>
              <div className="text-white/80">Happy Attendees</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-white mb-2">500+</div>
              <div className="text-white/80">Cities Worldwide</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;