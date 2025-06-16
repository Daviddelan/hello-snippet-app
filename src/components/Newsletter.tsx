import React, { useState } from 'react';
import { Mail, Send, CheckCircle } from 'lucide-react';

const Newsletter = () => {
  const [email, setEmail] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsLoading(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    setIsSubscribed(true);
    setIsLoading(false);
    setEmail('');
  };

  if (isSubscribed) {
    return (
      <section className="py-20 bg-gradient-to-br from-primary-500 via-primary-600 to-secondary-500">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mx-auto text-center">
            <div className="mb-6">
              <CheckCircle className="w-16 h-16 text-white mx-auto mb-4" />
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
                Welcome Aboard! 🎉
              </h2>
              <p className="text-xl text-white/90">
                Thank you for subscribing! You'll receive the latest event updates and exclusive offers directly in your inbox.
              </p>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-20 bg-gradient-to-br from-primary-500 via-primary-600 to-secondary-500 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-10 left-10 w-24 h-24 rounded-full bg-white/20"></div>
        <div className="absolute bottom-20 right-20 w-32 h-32 rounded-full bg-white/10"></div>
        <div className="absolute top-1/2 left-1/4 w-16 h-16 rounded-full bg-white/15"></div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-2xl mx-auto text-center">
          <div className="mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 rounded-2xl mb-6">
              <Mail className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Stay in the Loop
            </h2>
            <p className="text-xl text-white/90">
              Get the latest event updates, exclusive offers, and insider tips delivered straight to your inbox.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4 max-w-lg mx-auto">
            <div className="flex-1 relative">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email address"
                className="w-full px-6 py-4 text-lg rounded-2xl border-0 focus:ring-4 focus:ring-white/20 focus:outline-none shadow-lg"
                required
              />
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="group bg-white text-primary-500 px-8 py-4 rounded-2xl font-semibold text-lg hover:bg-gray-50 transition-all duration-300 flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl transform hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <span>Subscribe</span>
                  <Send className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          <p className="text-sm text-white/70 mt-4">
            No spam, unsubscribe at any time. We respect your privacy.
          </p>
        </div>
      </div>
    </section>
  );
};

export default Newsletter;