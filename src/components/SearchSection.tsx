import React, { useState } from 'react';
import { Search, MapPin, Calendar, Filter, Sparkles } from 'lucide-react';

const SearchSection = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [location, setLocation] = useState('');
  const [date, setDate] = useState('');

  const popularSearches = [
    "Tech Conferences",
    "Music Festivals", 
    "Business Networking",
    "Art Exhibitions",
    "Food & Wine",
    "Fitness Classes"
  ];

  return (
    <section className="py-16 bg-white relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-20 left-10 w-32 h-32 rounded-full bg-primary-500"></div>
        <div className="absolute bottom-20 right-20 w-24 h-24 rounded-full bg-secondary-500"></div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-12">
          <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-primary-50 to-secondary-50 px-4 py-2 rounded-full mb-6">
            <Sparkles className="w-4 h-4 text-primary-500" />
            <span className="text-sm font-medium text-primary-700">Find Your Perfect Event</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            What are you looking for?
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Search through thousands of events happening near you or explore new experiences worldwide.
          </p>
        </div>

        {/* Enhanced Search Bar */}
        <div className="max-w-4xl mx-auto mb-12">
          <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 p-2">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-2">
              {/* Search Input */}
              <div className="lg:col-span-2 relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search events, keywords, or categories..."
                  className="w-full pl-12 pr-4 py-4 text-lg rounded-2xl border-0 focus:ring-2 focus:ring-primary-500/20 focus:outline-none"
                />
              </div>

              {/* Location Input */}
              <div className="relative">
                <MapPin className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Location"
                  className="w-full pl-12 pr-4 py-4 text-lg rounded-2xl border-0 focus:ring-2 focus:ring-primary-500/20 focus:outline-none"
                />
              </div>

              {/* Search Button */}
              <button className="group bg-gradient-to-r from-primary-500 to-secondary-500 text-white py-4 px-6 rounded-2xl font-semibold text-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 flex items-center justify-center space-x-2">
                <Search className="w-5 h-5 group-hover:scale-110 transition-transform" />
                <span className="hidden sm:inline">Search</span>
              </button>
            </div>
          </div>

          {/* Advanced Filters */}
          <div className="flex flex-wrap items-center justify-center gap-4 mt-6">
            <button className="flex items-center space-x-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-xl transition-colors duration-200">
              <Calendar className="w-4 h-4" />
              <span>Date Range</span>
            </button>
            <button className="flex items-center space-x-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-xl transition-colors duration-200">
              <Filter className="w-4 h-4" />
              <span>Category</span>
            </button>
            <button className="flex items-center space-x-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-xl transition-colors duration-200">
              <span>Price Range</span>
            </button>
          </div>
        </div>

        {/* Popular Searches */}
        <div className="text-center">
          <p className="text-gray-600 mb-4">Popular searches:</p>
          <div className="flex flex-wrap justify-center gap-3">
            {popularSearches.map((search, index) => (
              <button
                key={index}
                className="bg-gradient-to-r from-primary-50 to-secondary-50 hover:from-primary-100 hover:to-secondary-100 text-primary-700 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 hover:scale-105"
              >
                {search}
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default SearchSection;