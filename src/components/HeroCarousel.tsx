import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, ArrowRight, User } from 'lucide-react';

const HeroCarousel = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    {
      id: 1,
      organizer: "TechVision Events",
      organizerAvatar: "https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=100",
      price: 0,
      image: "https://res.cloudinary.com/dt3xctihn/image/upload/v1748933697/Screenshot_2025-06-03_at_6.54.43_AM_vpxpy7.png",
    },
    {
      id: 2,
      organizer: "Design Masters Studio",
      organizerAvatar: "https://images.pexels.com/photos/1130626/pexels-photo-1130626.jpeg?auto=compress&cs=tinysrgb&w=100",
      price: 100,
      image: "https://res.cloudinary.com/dt3xctihn/image/upload/v1748934638/Screenshot_2025-06-03_at_7.10.30_AM_kkf845.png",
    },
    {
      id: 3,
      organizer: "Kingdom Christian Fellowship",
      organizerAvatar: "https://res.cloudinary.com/dt3xctihn/image/upload/v1750163039/Screenshot_2025-06-17_at_12.23.49_PM_ks03cn.png",
      price: 100,
      image: "https://res.cloudinary.com/dt3xctihn/image/upload/v1748933188/Screenshot_2025-06-03_at_6.46.19_AM_vkkafe.png",
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [slides.length]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const handleMoreInfo = (eventId: number) => {
    // This will navigate to the event details page
    console.log(`Navigate to event details for event ${eventId}`);
    // In a real app, you would use React Router: navigate(`/event/${eventId}`)
  };

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
                alt="Event"
                className="w-full h-full object-cover"
              />
              {/* Gradient overlay for better text visibility */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>
            </div>

            {/* Bottom Content Layout */}
            <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8 lg:p-12">
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

      {/* Slide Indicators */}
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
    </section>
  );
};

export default HeroCarousel;