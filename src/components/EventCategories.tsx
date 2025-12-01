import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Briefcase,
  Music,
  Palette,
  Dumbbell,
  GraduationCap,
  Heart,
  Utensils,
  Camera,
  ArrowRight,
  Trophy
} from 'lucide-react';
import { EventService } from '../services/eventService';

const EventCategories = () => {
  const navigate = useNavigate();
  const [categoryCounts, setCategoryCounts] = useState<Record<string, number>>({});

  const categories = [
    {
      icon: Briefcase,
      name: "Business & Professional",
      searchQuery: "Business",
      color: "from-blue-500 to-blue-600",
      bgColor: "from-blue-50 to-blue-100"
    },
    {
      icon: Music,
      name: "Music & Entertainment",
      searchQuery: "Music",
      color: "from-purple-500 to-purple-600",
      bgColor: "from-purple-50 to-purple-100"
    },
    {
      icon: Palette,
      name: "Arts & Culture",
      searchQuery: "Art",
      color: "from-pink-500 to-pink-600",
      bgColor: "from-pink-50 to-pink-100"
    },
    {
      icon: Dumbbell,
      name: "Health & Fitness",
      searchQuery: "Fitness",
      color: "from-green-500 to-green-600",
      bgColor: "from-green-50 to-green-100"
    },
    {
      icon: GraduationCap,
      name: "Education & Learning",
      searchQuery: "Workshop",
      color: "from-cyan-500 to-cyan-600",
      bgColor: "from-cyan-50 to-cyan-100"
    },
    {
      icon: Heart,
      name: "Community & Social",
      searchQuery: "Meetup",
      color: "from-red-500 to-red-600",
      bgColor: "from-red-50 to-red-100"
    },
    {
      icon: Utensils,
      name: "Food & Drink",
      searchQuery: "Food",
      color: "from-orange-500 to-orange-600",
      bgColor: "from-orange-50 to-orange-100"
    },
    {
      icon: Trophy,
      name: "Sports & Recreation",
      searchQuery: "Sports",
      color: "from-emerald-500 to-emerald-600",
      bgColor: "from-emerald-50 to-emerald-100"
    }
  ];

  useEffect(() => {
    loadCategoryCounts();
  }, []);

  const loadCategoryCounts = async () => {
    const result = await EventService.getPublishedEvents(1000, false);
    if (result.success && result.events) {
      const counts: Record<string, number> = {};

      categories.forEach(category => {
        const matchingEvents = result.events!.filter(event => {
          const eventCategory = event.category.toLowerCase();
          const eventTitle = event.title.toLowerCase();
          const searchTerm = category.searchQuery.toLowerCase();

          return eventCategory.includes(searchTerm) ||
                 eventTitle.includes(searchTerm) ||
                 eventCategory === searchTerm;
        });
        counts[category.name] = matchingEvents.length;
      });

      setCategoryCounts(counts);
    }
  };

  const handleCategoryClick = (category: typeof categories[0]) => {
    navigate(`/discover?q=${encodeURIComponent(category.searchQuery)}`);
  };

  const handleViewAll = () => {
    navigate('/discover');
  };

  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Explore by Category
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Find events that match your interests from our diverse range of categories
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {categories.map((category, index) => {
            const IconComponent = category.icon;
            const count = categoryCounts[category.name] || 0;

            return (
              <div
                key={index}
                className="group cursor-pointer"
                onClick={() => handleCategoryClick(category)}
              >
                <div className="relative bg-white rounded-2xl p-6 border border-gray-100 hover:border-transparent shadow-sm hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 text-center">
                  <div className={`absolute inset-0 bg-gradient-to-br ${category.bgColor} opacity-0 group-hover:opacity-100 rounded-2xl transition-opacity duration-300`}></div>

                  <div className="relative z-10">
                    <div className={`inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br ${category.color} rounded-2xl mb-4 group-hover:scale-110 transition-transform duration-300`}>
                      <IconComponent className="w-8 h-8 text-white" />
                    </div>

                    <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-gray-800">
                      {category.name}
                    </h3>

                    <p className="text-sm text-gray-500 group-hover:text-gray-600">
                      {count > 0 ? `${count} ${count === 1 ? 'event' : 'events'}` : 'No events yet'}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="text-center mt-12">
          <button
            onClick={handleViewAll}
            className="inline-flex items-center bg-gradient-to-r from-primary-500 to-secondary-500 text-white px-8 py-3 rounded-2xl font-semibold hover:shadow-lg transition-all duration-300 transform hover:scale-105 group"
          >
            <span>View All Categories</span>
            <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>
    </section>
  );
};

export default EventCategories;
