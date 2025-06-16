import React from 'react';
import { Zap, Shield, BarChart3 } from 'lucide-react';

const FeatureHighlights = () => {
  const features = [
    {
      icon: Zap,
      title: "Lightning Fast",
      description: "Create and publish events in minutes with our intuitive interface and smart automation tools.",
      gradient: "from-yellow-400 to-orange-500"
    },
    {
      icon: Shield,
      title: "Secure & Reliable",
      description: "Enterprise-grade security with 99.9% uptime ensures your events and data are always protected.",
      gradient: "from-green-400 to-blue-500"
    },
    {
      icon: BarChart3,
      title: "Powerful Analytics",
      description: "Get deep insights into your events with comprehensive analytics and real-time reporting tools.",
      gradient: "from-purple-400 to-pink-500"
    }
  ];

  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Why Choose HelloSnippet?
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Built with cutting-edge technology and designed for the modern event ecosystem.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const IconComponent = feature.icon;
            return (
              <div key={index} className="group relative">
                {/* Card */}
                <div className="relative bg-white rounded-3xl p-8 border border-gray-100 hover:border-transparent shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-1">
                  {/* Gradient Border on Hover */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-100 rounded-3xl transition-opacity duration-500 -z-10`}></div>
                  <div className="absolute inset-0.5 bg-white rounded-3xl group-hover:bg-gray-50 transition-colors duration-500"></div>
                  
                  {/* Content */}
                  <div className="relative z-10">
                    {/* Icon */}
                    <div className={`inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br ${feature.gradient} rounded-2xl mb-6 group-hover:scale-110 transition-transform duration-300`}>
                      <IconComponent className="w-8 h-8 text-white" />
                    </div>

                    <h3 className="text-xl font-bold text-gray-900 mb-4">{feature.title}</h3>
                    <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default FeatureHighlights;