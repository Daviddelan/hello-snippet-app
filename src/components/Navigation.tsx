import React, { useState, useEffect } from "react";
import { Calendar, Menu, X, Search, User, Bell } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { OrganizerService } from "../services/organizerService";

const Navigation = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    // Check initial auth state
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        // Also check if they have a complete organizer profile
        try {
          const organizerProfile = await OrganizerService.getOrganizerProfile(user.id);
          setIsAuthenticated(!!organizerProfile?.profile_completed);
        } catch (error) {
          console.error('Error checking organizer profile in navigation:', error);
          setIsAuthenticated(!!user);
        }
      } else {
        setIsAuthenticated(false);
      }
    };
    
    checkAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        try {
          const organizerProfile = await OrganizerService.getOrganizerProfile(session.user.id);
          setIsAuthenticated(!!organizerProfile?.profile_completed);
        } catch (error) {
          console.error('Error checking organizer profile in navigation:', error);
          setIsAuthenticated(!!session);
        }
      } else {
        setIsAuthenticated(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const navLinks = [
    { name: "Home", href: "/" },
    { name: "Discover Events", href: "/discover" },
    { name: "Create Event", href: "/create-event" }, // updated route
    { name: "About", href: "/about" },
    { name: "Contact", href: "/contact" },
  ];

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 flex justify-center items-center transition-all duration-300 pointer-events-none`}
    >
      {/* Glassmorphic nav background oval - smaller, more subtle */}
      <div
        className={`absolute top-1 left-1/2 -translate-x-1/2 w-[48vw] max-w-3xl h-[42px] md:h-[60px] rounded-[1.7rem] bg-white/60 backdrop-blur-2xl shadow-xl border border-purple-200/60 pointer-events-auto transition-all duration-300 ${
          isScrolled ? "bg-white/80 border-purple-300/80 shadow-lg" : ""
        }`}
        style={{ zIndex: 1 }}
      />
      <div
        className="container mx-auto px-2 sm:px-4 lg:px-6 relative flex-1 pointer-events-auto"
        style={{ zIndex: 2 }}
      >
        <div className="flex items-center justify-between h-12 lg:h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center group">
            <img
              src="/hellosnippet_transparent.png"
              alt="HelloSnippet"
              className="h-8 lg:h-10 w-auto group-hover:scale-105 transition-transform duration-200"
            />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-8">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.href}
                className={`font-medium transition-colors duration-200 hover:text-primary-500 ${
                  location.pathname === link.href
                    ? "text-primary-500"
                    : isScrolled
                    ? "text-gray-700"
                    : "text-purple-900"
                }`}
              >
                {link.name}
              </Link>
            ))}
          </div>

          {/* Desktop Actions */}
          <div className="hidden lg:flex items-center space-x-4">
            <button
              className={`p-2 rounded-xl transition-colors duration-200 ${
                isScrolled
                  ? "text-gray-600 hover:bg-gray-100"
                  : "text-white/80 hover:bg-white/10"
              }`}
            >
              <Search className="w-5 h-5" />
            </button>
            <button
              className={`p-2 rounded-xl transition-colors duration-200 ${
                isScrolled
                  ? "text-gray-600 hover:bg-gray-100"
                  : "text-white/80 hover:bg-white/10"
              }`}
            >
              <Bell className="w-5 h-5" />
            </button>
            <button
              className={`p-2 rounded-xl transition-colors duration-200 ${
                isScrolled
                  ? "text-gray-600 hover:bg-gray-100"
                  : "text-white/80 hover:bg-white/10"
              }`}
            >
              <User className="w-5 h-5" />
            </button>
            {isAuthenticated ? (
              <div className="flex items-center space-x-2">
                <Link
                  to="/dashboard/organizer"
                  className="bg-gradient-to-r from-primary-500 to-secondary-500 text-white px-4 py-2 rounded-xl font-semibold hover:shadow-lg transition-all duration-200 transform hover:scale-105"
                >
                  Dashboard
                </Link>
                <button
                  onClick={handleSignOut}
                  className="border border-gray-300 text-gray-700 px-4 py-2 rounded-xl font-semibold hover:bg-gray-50 transition-all duration-200"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <Link
                to="/signup"
                className="bg-gradient-to-r from-primary-500 to-secondary-500 text-white px-6 py-2 rounded-xl font-semibold hover:shadow-lg transition-all duration-200 transform hover:scale-105"
              >
                Get Started
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className={`lg:hidden p-2 rounded-xl transition-colors duration-200 ${
              isScrolled
                ? "text-gray-600 hover:bg-gray-100"
                : "text-white hover:bg-white/10"
            }`}
          >
            {isMobileMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden absolute top-full left-0 right-0 bg-white/95 backdrop-blur-lg border-b border-gray-100 shadow-lg">
            <div className="px-4 py-6 space-y-4">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`block font-medium transition-colors duration-200 hover:text-primary-500 ${
                    location.pathname === link.href
                      ? "text-primary-500"
                      : "text-gray-700"
                  }`}
                >
                  {link.name}
                </Link>
              ))}
              <div className="pt-4 border-t border-gray-200">
                {isAuthenticated ? (
                  <div className="space-y-2">
                    <Link
                      to="/dashboard/organizer"
                      className="w-full block text-center bg-gradient-to-r from-primary-500 to-secondary-500 text-white px-6 py-3 rounded-xl font-semibold"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Dashboard
                    </Link>
                    <button
                      onClick={() => {
                        handleSignOut();
                        setIsMobileMenuOpen(false);
                      }}
                      className="w-full border border-gray-300 text-gray-700 px-6 py-3 rounded-xl font-semibold hover:bg-gray-50"
                    >
                      Sign Out
                    </button>
                  </div>
                ) : (
                  <Link
                    to="/signup"
                    className="w-full block text-center bg-gradient-to-r from-primary-500 to-secondary-500 text-white px-6 py-3 rounded-xl font-semibold"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Get Started
                  </Link>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navigation;