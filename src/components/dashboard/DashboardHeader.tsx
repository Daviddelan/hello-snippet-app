import React from 'react';
import { Menu, Bell, Search, User } from 'lucide-react';
import type { Organizer } from '../../lib/supabase';
import { useTheme } from '../../contexts/ThemeContext';

interface DashboardHeaderProps {
  onMenuClick: () => void;
  organizer: Organizer | null;
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({ onMenuClick, organizer }) => {
  const { logoUrl } = useTheme();

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-30">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Left side */}
          <div className="flex items-center space-x-3">
            <button
              onClick={onMenuClick}
              className="lg:hidden rounded-md p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-500"
            >
              <Menu className="h-6 w-6" />
            </button>

            <div className="hidden lg:flex lg:items-center lg:space-x-3">
              {logoUrl && (
                <img
                  src={logoUrl}
                  alt="Organization logo"
                  className="h-10 w-10 rounded-lg object-cover"
                />
              )}
              <h1 className="text-2xl font-bold text-gray-900">
                {organizer?.organization_name || 'Dashboard'}
              </h1>
            </div>
          </div>

          {/* Right side */}
          <div className="flex items-center space-x-4">
            {/* Search */}
            <div className="hidden md:block">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search events..."
                  className="w-64 rounded-lg border border-gray-300 bg-white py-2 pl-10 pr-3 text-sm placeholder-gray-500 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                />
              </div>
            </div>

            {/* Notifications */}
            <button className="relative rounded-full bg-white p-2 text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2">
              <Bell className="h-5 w-5" />
              <span className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-red-500"></span>
            </button>

            {/* Profile dropdown */}
            <div className="relative">
              <button className="flex items-center space-x-3 rounded-full bg-white p-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2">
                {logoUrl ? (
                  <img
                    src={logoUrl}
                    alt={organizer?.organization_name || 'Organization'}
                    className="h-8 w-8 rounded-full object-cover border-2 border-gray-200"
                  />
                ) : (
                  <div className="h-8 w-8 rounded-full bg-gradient-to-r from-primary-500 to-secondary-500 flex items-center justify-center">
                    <User className="h-4 w-4 text-white" />
                  </div>
                )}
                <span className="hidden lg:block font-medium text-gray-700">
                  {organizer?.organization_name || 'Organization'}
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default DashboardHeader;