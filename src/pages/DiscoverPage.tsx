import React from 'react';
import Navigation from '../components/Navigation';
import Hero from '../components/Hero';
import UserJourney from '../components/UserJourney';
import FeatureHighlights from '../components/FeatureHighlights';
import TrendingEvents from '../components/TrendingEvents';
import Testimonials from '../components/Testimonials';
import Newsletter from '../components/Newsletter';
import Footer from '../components/Footer';

const DiscoverPage = () => {
  return (
    <div className="min-h-screen">
      <Navigation />
      <div className="pt-16 lg:pt-20">
        <Hero />
        <UserJourney />
        <FeatureHighlights />
        <TrendingEvents />
        <Testimonials />
        <Newsletter />
        <Footer />
      </div>
    </div>
  );
};

export default DiscoverPage;