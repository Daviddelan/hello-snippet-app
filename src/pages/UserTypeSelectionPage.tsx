import React from "react";
import { Link } from "react-router-dom";
import {
  Calendar,
  Users,
  ArrowRight,
  Building2,
  User,
  Sparkles,
  Heart,
  Globe2,
  Star,
} from "lucide-react";
import Navigation from "../components/Navigation";
import Footer from "../components/Footer";

const UserTypeSelectionPage = () => {
  const userTypes = [
    {
      type: "organizer",
      icon: Building2,
      title: "Event Organizer",
      subtitle: "Create and manage events",
      description:
        "Perfect for businesses, organizations, and individuals who want to create, manage, and promote events.",
      features: [
        "Create unlimited events",
        "Advanced analytics dashboard",
        "Attendee management tools",
        "Marketing and promotion features",
        "Revenue tracking",
        "Custom branding options",
      ],
      buttonText: "Sign Up as Organizer",
      linkTo: "/signup/organizer",
      color: "from-primary-500 to-primary-600",
      bgGradient: "from-primary-50 to-primary-100",
      stats: "Organizers",
    },
    {
      type: "attendee",
      icon: User,
      title: "Event Attendee",
      subtitle: "Discover and attend events",
      description:
        "Perfect for individuals who want to discover amazing events, connect with communities, and create memorable experiences.",
      features: [
        "Discover local events",
        "Event Categorization",
        "Easy ticket booking",
        "Social networking features",
        "Event reminders",
        "Community connections",
      ],
      buttonText: "Browse Events",
      linkTo: "/HomePage",
      color: "from-secondary-500 to-secondary-600",
      bgGradient: "from-secondary-50 to-secondary-100",
      stats: "Attendees",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 via-white to-purple-200">
      <Navigation />

      {/* Animated background blobs */}
      <svg
        className="absolute top-[-120px] left-[-120px] w-[600px] h-[600px] z-0 animate-float-slow"
        viewBox="0 0 600 600"
        fill="none"
      >
        <ellipse
          cx="300"
          cy="300"
          rx="300"
          ry="300"
          fill="#c4b5fd"
          fillOpacity="0.18"
        />
      </svg>
      <svg
        className="absolute bottom-[-180px] right-[-180px] w-[700px] h-[700px] z-0 animate-float-slow2"
        viewBox="0 0 700 700"
        fill="none"
      >
        <ellipse
          cx="350"
          cy="350"
          rx="350"
          ry="350"
          fill="#a78bfa"
          fillOpacity="0.13"
        />
      </svg>

      <div className="relative z-10 pt-20 pb-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            {/* Header */}
            <div className="text-center mb-16">
              <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-primary-50 to-secondary-50 px-4 py-2 rounded-full mb-6"></div>
              <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6">
                Platform Access
              </h1>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                Whether you're organizing events or looking to attend them,
                HelloSnippet provides the perfect platform for your needs.
              </p>
            </div>

            {/* User Type Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
              {userTypes.map((userType, index) => {
                const IconComponent = userType.icon;
                return (
                  <div key={userType.type} className="group relative">
                    <div className="relative bg-white rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 h-full overflow-hidden border border-gray-100">
                      {/* Background Gradient */}
                      <div
                        className={`absolute inset-0 bg-gradient-to-br ${userType.bgGradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`}
                      ></div>

                      {/* Content */}
                      <div className="relative z-10">
                        {/* Header */}
                        <div className="flex items-start justify-between mb-6">
                          <div
                            className={`inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br ${userType.color} rounded-2xl group-hover:scale-110 transition-transform duration-300 shadow-lg`}
                          >
                            <IconComponent className="w-8 h-8 text-white" />
                          </div>
                          <span className="text-sm font-medium text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                            {userType.stats}
                          </span>
                        </div>

                        <h3 className="text-2xl font-bold text-gray-900 mb-2">
                          {userType.title}
                        </h3>
                        <p className="text-lg text-primary-600 font-medium mb-4">
                          {userType.subtitle}
                        </p>
                        <p className="text-gray-600 mb-6 leading-relaxed">
                          {userType.description}
                        </p>

                        {/* Features */}
                        <ul className="space-y-3 mb-8">
                          {userType.features.map((feature, featureIndex) => (
                            <li
                              key={featureIndex}
                              className="flex items-center text-sm text-gray-700"
                            >
                              <div
                                className={`w-2 h-2 bg-gradient-to-r ${userType.color} rounded-full mr-3 flex-shrink-0`}
                              ></div>
                              {feature}
                            </li>
                          ))}
                        </ul>

                        {/* CTA Button */}
                        <Link
                          to={userType.linkTo}
                          className={`group/btn w-full bg-gradient-to-r ${userType.color} text-white py-4 px-6 rounded-2xl font-semibold text-lg hover:shadow-lg transition-all duration-300 transform hover:scale-105 flex items-center justify-center space-x-2`}
                        >
                          <span>{userType.buttonText}</span>
                          <ArrowRight className="w-5 h-5 group-hover/btn:translate-x-1 transition-transform duration-200" />
                        </Link>
                      </div>

                      {/* Decorative Elements */}
                      <div className="absolute top-4 right-4 w-20 h-20 bg-gradient-to-br from-white/20 to-transparent rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                      <div className="absolute bottom-4 left-4 w-12 h-12 bg-gradient-to-br from-white/10 to-transparent rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Trust Indicators
            <div className="text-center">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-2xl mx-auto">
                <div className="text-center">
                  <div className="text-3xl font-bold text-gray-900 mb-2">
                    50K+
                  </div>
                  <div className="text-gray-600">Events Created</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-gray-900 mb-2">
                    1M+
                  </div>
                  <div className="text-gray-600">Happy Users</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-gray-900 mb-2">
                    500+
                  </div>
                  <div className="text-gray-600">Cities Worldwide</div>
                </div>
              </div>
            </div> */}

            {/* Already have an account */}
            <div className="text-center mt-12 pt-8 border-t border-gray-200">
              <p className="text-gray-600">
                Already have an account?{" "}
                <Link
                  to="/signin"
                  className="text-primary-500 hover:text-primary-600 font-semibold"
                >
                  Sign In
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>

      <Footer />

      <style>{`
        @keyframes float-slow { 0% { transform: translateY(0); } 100% { transform: translateY(-30px); } }
        @keyframes float-slow2 { 0% { transform: translateY(0); } 100% { transform: translateY(30px); } }
        .animate-float-slow { animation: float-slow 7s ease-in-out infinite alternate; }
        .animate-float-slow2 { animation: float-slow2 9s ease-in-out infinite alternate; }
      `}</style>
    </div>
  );
};

export default UserTypeSelectionPage;
