import React from "react";
import Navigation from "../components/Navigation";
import HeroCarousel from "../components/HeroCarousel";
import SearchSection from "../components/SearchSection";
import LiveEvents from "../components/LiveEvents";
import FeaturedEvents from "../components/FeaturedEvents";
import EventCategories from "../components/EventCategories";
import TrendingEvents from "../components/TrendingEvents";
import Footer from "../components/Footer";

const HomePage = () => {
  return (
    <div className="min-h-screen">
      <Navigation />
      <HeroCarousel />
      <SearchSection />
      <LiveEvents />
      <FeaturedEvents />
      <EventCategories />
      <TrendingEvents />
      <Footer />
    </div>
  );
};

export default HomePage;
