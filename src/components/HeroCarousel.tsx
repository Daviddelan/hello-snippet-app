import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, ArrowRight, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

const HeroCarousel = () => {
  const navigate = useNavigate();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [slides, setSlides] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load real events from database
  useEffect(() => {
    const loadHeroEvents = async () => {
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
          .order('created_at', { ascending: false })
          .limit(4); // Maximum of 4 events for hero carousel

        if (error) {
          console.error('Error loading hero events:', error);
          // Fall back to mock data if database isn't set up
          setSlides(mockSlides);
        } else if (data && data.length > 0) {
          // Transform database events to match our component structure
          const transformedSlides = data.map((event) => ({
            id: event.id,
            organizer: event.organizers?.organization_name || 'Event Organizer',
            organizerAvatar: "https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=100",
            price: event.price,
            image: event.image_url || "https://images.pexels.com/photos/2608517/pexels-photo-2608517.jpeg?auto=compress&cs=tinysrgb&w=800",
            title: event.title,
            description: event.description,
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
            location: event.location,
            capacity: event.capacity,
            category: event.category
          }));

          // If we have fewer than 4 events, mix with mock data
          const allSlides = [...transformedSlides];
          if (allSlides.length < 4) {
            const remainingMockSlides = mockSlides.slice(allSlides.length);
            allSlides.push(...remainingMockSlides.slice(0, 4 - allSlides.length));
          }

          setSlides(allSlides.slice(0, 4));
        } else {
          // No events found, use mock data
          setSlides(mockSlides);
        }
      } catch (error) {
        console.error('Error loading hero events:', error);
        setSlides(mockSlides);
      } finally {
        setIsLoading(false);
      }
    };

    loadHeroEvents();
  }, []);

  // Auto-advance slides
  useEffect(() => {
    if (slides.length > 1) {
      const timer = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % slides.length);
      }, 6000);
      return () => clearInterval(timer);
    }
  }, [slides.length]);

  const mockSlides = [
    {
      id: 1,
      organizer: "TechVision Events",
      organizerAvatar: "https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=100",
      price: 0,
      image: "https://images.pexels.com/photos/2608517/pexels-photo-2608517.jpeg?auto=compress&cs=tinysrgb&w=800",
      title: "Tech Innovation Summit 2024",
      description: "Join industry leaders for cutting-edge technology discussions",
      date: "March 15, 2024",
      time: "9:00 AM - 6:00 PM",
      location: "San Francisco, CA",
      capacity: 500,
      category: "Technology"
    },
    {
      id: 2,
      organizer: "Design Masters Studio",
      organizerAvatar: "https://images.pexels.com/photos/1130626/pexels-photo-1130626.jpeg?auto=compress&cs=tinysrgb&w=100",
      price: 100,
      image: "https://images.pexels.com/photos/1181406/pexels-photo-1181406.jpeg?auto=compress&cs=tinysrgb&w=800",
      title: "Creative Design Workshop",
      description: "Learn from the best designers in the industry",
      date: "March 20, 2024",
      time: "2:00 PM - 8:00 PM",
      location: "New York, NY",
      capacity: 200,
      category: "Arts & Culture"
    },
    {
      id: 3,
      organizer: "Business Network Pro",
      organizerAvatar: "https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg?auto=compress&cs=tinysrgb&w=100",
      price: 50,
      image: "https://images.pexels.com/photos/1181263/pexels-photo-1181263.jpeg?auto=compress&cs=tinysrgb&w=800",
      title: "Professional Networking Event",
      description: "Connect with professionals across industries",
      date: "March 25, 2024",
      time: "6:00 PM - 10:00 PM",
      location: "Chicago, IL",
      capacity: 300,
      category: "Business & Professional"
    },
    {
      id: 4,
      organizer: "Music Collective",
      organizerAvatar: "https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=100",
      price: 75,
      image: "https://images.pexels.com/photos/1190298/pexels-photo-1190298.jpeg?auto=compress&cs=tinysrgb&w=800",
      title: "Live Music Festival",
      description: "Experience amazing live performances",
      date: "April 1, 2024",
      time: "4:00 PM - 11:00 PM",
      location: "Austin, TX",
      capacity: 1000,
      category: "Music & Entertainment"
    }
  ];

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const handleMoreInfo = (eventId: number | string) => {
    navigate(`/event/${eventId}`);
  };

  if (isLoading) {
    return (
      <section className="relative h-screen overflow-hidden bg-gradient-to-br from-primary-500 via-primary-600 to-secondary-500 flex items-center justify-center">
        <div className="text-center text-white">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-xl">Loading amazing events...</p>
        </div>
      </section>
    );
  }

  return (
    <section className="relative h-screen overflow-hidden">
      {/* Slides */}
      <div className="relative h-full">
        {slides.map((slide, index) => (
          <div
            key={slide.id}
            className={`absolute inset-0 transition-opacity duration-1000 ${
              index === currentSlide ? 'opacity-100' : 'opacity-0'
            }`}
          >
            {/* Background Image */}
            <div className="absolute inset-0">
              <img
                src={slide.image}
                alt={slide.title || "Event"}
                className="w-full h-full object-cover"
              />
              {/* Gradient overlay for better text visibility */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>
            </div>

            {/* Content Overlay */}
            <div className="absolute inset-0 flex flex-col justify-end p-6 sm:p-8 lg:p-12">
              {/* Event Title and Description (if available) */}
              {slide.title && (
                <div className="mb-6 max-w-2xl">
                  <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4 leading-tight">
                    {slide.title}
                  </h2>
                  {slide.description && (
                    <p className="text-lg sm:text-xl text-white/90 mb-4 leading-relaxed">
                      {slide.description}
                    </p>
                  )}
                  {slide.date && slide.time && (
                    <div className="flex flex-wrap gap-4 text-white/80 mb-6">
                      <span className="flex items-center">
                        📅 {slide.date}
                      </span>
                      <span className="flex items-center">
                        🕒 {slide.time}
                      </span>
                      <span className="flex items-center">
                        📍 {slide.location}
                      </span>
                    </div>
                  )}
                </div>
              )}

              {/* Bottom Content Layout */}
              <div className="flex flex-col sm:flex-row items-end justify-between gap-6">
                
                {/* Left Side - Organizer Info & Price */}
                <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4">
                  {/* Organizer Info */}
                  <div className="group bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-4 shadow-2xl hover:bg-white/15 transition-all duration-300 hover:scale-105">
                    <div className="flex items-center space-x-3">
                      <div className="relative">
                        <img 
                          src={slide.organizerAvatar} 
                          alt={slide.organizer}
                          className="w-12 h-12 rounded-full border-2 border-white/30 shadow-lg object-cover"
                        />
                        <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-white/20 to-transparent"></div>
                      </div>
                      <div>
                        <p className="text-white/80 text-sm font-medium">Organized by</p>
                        <p className="text-white font-semibold text-lg">{slide.organizer}</p>
                      </div>
                    </div>
                  </div>

                  {/* Price Display */}
                  <div className="group bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-4 shadow-2xl hover:bg-white/15 transition-all duration-300 hover:scale-105">
                    <div className="text-center">
                      <p className="text-white/80 text-sm font-medium mb-1">Price</p>
                      <p className="text-white font-bold text-2xl">
                        {slide.price === 0 ? 'FREE' : `$${slide.price}`}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Right Side - More Info Button */}
                <button 
                  onClick={() => handleMoreInfo(slide.id)}
                  className="group relative bg-gradient-to-r from-purple-600 via-purple-700 to-pink-600 text-white px-8 py-4 rounded-2xl font-semibold text-lg shadow-2xl hover:shadow-purple-500/25 transition-all duration-300 transform hover:scale-105 flex items-center space-x-3 border border-white/20 backdrop-blur-sm"
                >
                  {/* Glossy overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-transparent via-white/10 to-white/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  
                  {/* Button content */}
                  <span className="relative z-10">More Info</span>
                  <ArrowRight className="relative z-10 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  
                  {/* Shine effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 transform translate-x-[-100%] group-hover:translate-x-[200%] transition-transform duration-700 rounded-2xl"></div>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Navigation Arrows */}
      {slides.length > 1 && (
        <>
          <button
            onClick={prevSlide}
            className="absolute left-4 lg:left-8 top-1/2 transform -translate-y-1/2 bg-white/10 backdrop-blur-xl hover:bg-white/20 text-white p-4 rounded-full transition-all duration-200 hover:scale-110 border border-white/20 shadow-2xl group"
          >
            <ChevronLeft className="w-6 h-6" />
            <div className="absolute inset-0 bg-gradient-to-t from-transparent to-white/10 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          </button>
          <button
            onClick={nextSlide}
            className="absolute right-4 lg:right-8 top-1/2 transform -translate-y-1/2 bg-white/10 backdrop-blur-xl hover:bg-white/20 text-white p-4 rounded-full transition-all duration-200 hover:scale-110 border border-white/20 shadow-2xl group"
          >
            <ChevronRight className="w-6 h-6" />
            <div className="absolute inset-0 bg-gradient-to-t from-transparent to-white/10 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          </button>
        </>
      )}

      {/* Slide Indicators */}
      {slides.length > 1 && (
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex space-x-3">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`h-3 rounded-full transition-all duration-300 border border-white/30 backdrop-blur-sm ${
                index === currentSlide
                  ? 'bg-white w-8 shadow-lg shadow-white/25'
                  : 'bg-white/50 hover:bg-white/70 w-3'
              }`}
            />
          ))}
        </div>
      )}

      {/* Event Count Indicator */}
      <div className="absolute top-4 left-4 bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl px-4 py-2 text-white text-sm font-medium">
        {slides.length} Featured Events
      </div>
    </section>
  );
};

export default HeroCarousel;