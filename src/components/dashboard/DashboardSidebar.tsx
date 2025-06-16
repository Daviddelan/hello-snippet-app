import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Calendar, 
  BarChart3, 
  Users, 
  Megaphone, 
  Settings, 
  X,
  LogOut,
  Plus
} from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface DashboardSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateEvent?: () => void;
}

const DashboardSidebar: React.FC<DashboardSidebarProps> = ({ isOpen, onClose, onCreateEvent }) => {
  const location = useLocation();

  const navigation = [
    { name: 'Overview', href: '/dashboard/organizer', icon: LayoutDashboard },
    { name: 'Events', href: '/dashboard/organizer/events', icon: Calendar },
    { name: 'Analytics', href: '/dashboard/organizer/analytics', icon: BarChart3 },
    { name: 'Attendees', href: '/dashboard/organizer/attendees', icon: Users },
    { name: 'Marketing', href: '/dashboard/organizer/marketing', icon: Megaphone },
    { name: 'Settings', href: '/dashboard/organizer/settings', icon: Settings },
  ];

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  const isActive = (href: string) => {
    if (href === '/dashboard/organizer') {
      return location.pathname === href;
    }
    return location.pathname.startsWith(href);
  };

  return (
    <>
      {/* Mobile sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-xl transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="flex h-full flex-col">
          {/* Logo and close button */}
          <div className="flex h-16 items-center justify-between px-6 border-b border-gray-200">
            <Link to="/" className="flex items-center">
              <img 
                src="/hellosnippet_transparent.png" 
                alt="HelloSnippet" 
                className="h-8 w-auto"
              />
            </Link>
            <button
              onClick={onClose}
              className="lg:hidden rounded-md p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-500"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Quick Create Button */}
          <div className="px-4 py-4 border-b border-gray-200">
            <button
              onClick={() => {
                onCreateEvent?.();
                onClose();
              }}
              className="w-full bg-gradient-to-r from-primary-500 to-secondary-500 text-white px-4 py-3 rounded-xl font-medium hover:shadow-lg transition-all duration-200 transform hover:scale-105 flex items-center justify-center space-x-2"
            >
              <Plus className="h-4 w-4" />
              <span>Create Event</span>
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1 px-4 py-6">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={onClose}
                  className={`group flex items-center rounded-xl px-3 py-3 text-sm font-medium transition-colors ${
                    isActive(item.href)
                      ? 'bg-gradient-to-r from-primary-50 to-secondary-50 text-primary-700 border border-primary-200'
                      : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                >
                  <Icon
                    className={`mr-3 h-5 w-5 flex-shrink-0 ${
                      isActive(item.href) ? 'text-primary-500' : 'text-gray-400 group-hover:text-gray-500'
                    }`}
                  />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          {/* Sign out button */}
          <div className="border-t border-gray-200 p-4">
            <button
              onClick={handleSignOut}
              className="group flex w-full items-center rounded-xl px-3 py-3 text-sm font-medium text-gray-700 hover:bg-red-50 hover:text-red-700 transition-colors"
            >
              <LogOut className="mr-3 h-5 w-5 flex-shrink-0 text-gray-400 group-hover:text-red-500" />
              Sign Out
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default DashboardSidebar;