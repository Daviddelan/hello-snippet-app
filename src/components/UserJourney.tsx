import React from 'react';
import { Calendar, Users, Building2, ArrowRight } from 'lucide-react';

const UserJourney = () => {
  const userTypes = [
    {
      icon: Calendar,
      title: "Event Organizers",
      description: "Create, manage, and promote your events with powerful tools designed for seamless event planning.",
      features: ["Event Creation", "Attendee Management", "Analytics Dashboard", "Marketing Tools"],
      color: "from-primary-500 to-primary-600",
      linkTo: "/signup/organizer"
    },
    {
      icon: Users,
      title: "Event Attendees",
      description: "Discover exciting events, connect with like-minded people, and create unforgettable memories.",
      features: ["Event Discovery", "Social Networking", "Personalized Recommendations", "Easy Booking"],
      color: "from-secondary-500 to-secondary-600",
      linkTo: "/signup/attendee"
    },
    {
      icon: Building2,
      title: "Corporate Users",
      description: "Streamline corporate events, team building, and professional networking with enterprise solutions.",
      features: ["Corporate Events", "Team Management", "Budget Tracking", "Compliance Tools"],
      color: "from-purple-500 to-pink-500",
      linkTo: "/signup/corporate"
    }
  ];

  const handleGetStarted = (linkTo: string) => {
    // Direct navigation using window.location
    window.location.href = linkTo;
  };

  return (
    <section className="py-20 bg-gray-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Your Event Journey Starts Here
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            No matter who you are or what you're planning, HelloSnippet has the perfect solution for your event needs.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {userTypes.map((userType, index) => {
            const IconComponent = userType.icon;
            return (
              <div key={index} className="group">
                <div className="relative bg-white rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 h-full">
                  {/* Gradient Background */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${userType.color} opacity-0 group-hover:opacity-5 rounded-3xl transition-opacity duration-500`}></div>
                  
                  {/* Icon */}
                  <div className={`inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br ${userType.color} rounded-2xl mb-6 group-hover:scale-110 transition-transform duration-300`}>
                    <IconComponent className="w-8 h-8 text-white" />
                  </div>

                  {/* Content */}
                  <h3 className="text-xl font-bold text-gray-900 mb-4">{userType.title}</h3>
                  <p className="text-gray-600 mb-6 leading-relaxed">{userType.description}</p>

                  {/* Features */}
                  <ul className="space-y-3 mb-6">
                    {userType.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-center text-sm text-gray-700">
                        <div className="w-2 h-2 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full mr-3"></div>
                        {feature}
                      </li>
                    ))}
                  </ul>

                  {/* CTA Button */}
                  <button 
                    onClick={() => handleGetStarted(userType.linkTo)}
                    className="group/btn inline-flex items-center justify-center w-full bg-gradient-to-r from-primary-500 to-secondary-500 text-white px-6 py-3 rounded-2xl font-semibold hover:shadow-lg transition-all duration-300 transform hover:scale-105 cursor-pointer"
                  >
                    <span>Get Started</span>
                    <ArrowRight className="w-4 h-4 ml-2 group-hover/btn:translate-x-1 transition-transform duration-200" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default UserJourney;