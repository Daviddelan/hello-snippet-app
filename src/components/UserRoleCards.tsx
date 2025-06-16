import React from 'react';
import { Calendar, Users, Building2, ArrowRight, Zap, Shield, BarChart3 } from 'lucide-react';

const UserRoleCards = () => {
  const roles = [
    {
      icon: Calendar,
      title: "Event Organizers",
      description: "Create, manage, and promote your events with powerful tools designed for seamless event planning and maximum reach.",
      features: ["Event Creation Tools", "Attendee Management", "Real-time Analytics", "Marketing Integration"],
      color: "from-primary-500 to-primary-600",
      bgPattern: "from-primary-50 to-primary-100",
      stats: "25K+ Organizers"
    },
    {
      icon: Users,
      title: "Event Attendees",
      description: "Discover exciting events, connect with like-minded people, and create unforgettable memories in your community.",
      features: ["Smart Discovery", "Social Networking", "Personalized Feed", "Easy Booking"],
      color: "from-secondary-500 to-secondary-600",
      bgPattern: "from-secondary-50 to-secondary-100",
      stats: "1M+ Attendees"
    },
    {
      icon: Building2,
      title: "Corporate Teams",
      description: "Streamline corporate events, team building, and professional networking with enterprise-grade solutions.",
      features: ["Enterprise Dashboard", "Team Management", "Budget Tracking", "Compliance Tools"],
      color: "from-purple-500 to-pink-500",
      bgPattern: "from-purple-50 to-pink-50",
      stats: "1K+ Companies"
    }
  ];

  return (
    <section className="py-20 bg-gray-50 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-32 left-20 w-40 h-40 rounded-full bg-primary-500"></div>
        <div className="absolute bottom-32 right-20 w-32 h-32 rounded-full bg-secondary-500"></div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-16">
          <div className="inline-flex items-center space-x-2 bg-white px-4 py-2 rounded-full shadow-sm mb-6">
            <div className="w-2 h-2 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full"></div>
            <span className="text-sm font-medium text-gray-700">Choose Your Path</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
            Built for Every
            <span className="block bg-gradient-to-r from-primary-500 to-secondary-500 bg-clip-text text-transparent">
              Event Journey
            </span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Whether you're organizing, attending, or managing corporate events, HelloSnippet provides tailored solutions for your unique needs.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {roles.map((role, index) => {
            const IconComponent = role.icon;
            return (
              <div key={index} className="group relative">
                {/* Card */}
                <div className="relative bg-white rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 h-full overflow-hidden">
                  {/* Background Gradient */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${role.bgPattern} opacity-0 group-hover:opacity-100 transition-opacity duration-500`}></div>
                  
                  {/* Content */}
                  <div className="relative z-10">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-6">
                      <div className={`inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br ${role.color} rounded-2xl group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                        <IconComponent className="w-8 h-8 text-white" />
                      </div>
                      <span className="text-sm font-medium text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                        {role.stats}
                      </span>
                    </div>

                    <h3 className="text-2xl font-bold text-gray-900 mb-4">{role.title}</h3>
                    <p className="text-gray-600 mb-6 leading-relaxed">{role.description}</p>

                    {/* Features */}
                    <ul className="space-y-3 mb-8">
                      {role.features.map((feature, featureIndex) => (
                        <li key={featureIndex} className="flex items-center text-sm text-gray-700">
                          <div className={`w-2 h-2 bg-gradient-to-r ${role.color} rounded-full mr-3 flex-shrink-0`}></div>
                          {feature}
                        </li>
                      ))}
                    </ul>

                    {/* CTA */}
                    <button className={`group/btn w-full bg-gradient-to-r ${role.color} text-white py-3 px-6 rounded-2xl font-semibold hover:shadow-lg transition-all duration-300 transform hover:scale-105 flex items-center justify-center space-x-2`}>
                      <span>Get Started</span>
                      <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform duration-200" />
                    </button>
                  </div>

                  {/* Decorative Elements */}
                  <div className="absolute top-4 right-4 w-20 h-20 bg-gradient-to-br from-white/20 to-transparent rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  <div className="absolute bottom-4 left-4 w-12 h-12 bg-gradient-to-br from-white/10 to-transparent rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default UserRoleCards;