import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
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
import { useTheme } from '../../contexts/ThemeContext';

interface DashboardSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateEvent?: () => void;
}

const DashboardSidebar: React.FC<DashboardSidebarProps> = ({ isOpen, onClose, onCreateEvent }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logoUrl, colors } = useTheme();

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
    navigate('/');
  };

  const handleHomeClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    console.log('Home clicked - logging out automatically');
    await supabase.auth.signOut();
    navigate('/');
  };

  const isActive = (href: string) => {
    if (href === '/dashboard/organizer') {
      return location.pathname === href;
    }
    return location.pathname.startsWith(href);
  };

  return (
    <div className="flex h-full flex-col bg-white shadow-xl">
      {/* Logo and close button */}
      <div className="flex h-16 items-center justify-between px-6 border-b border-gray-200">
        <a href="/" onClick={handleHomeClick} className="flex items-center space-x-2 cursor-pointer">
          {logoUrl ? (
            <img
              src={logoUrl}
              alt="Organization Logo"
              className="h-10 w-auto max-w-[140px] object-contain"
            />
          ) : (
            <img
              src="/hellosnippet_transparent.png"
              alt="HelloSnippet"
              className="h-8 w-auto"
            />
          )}
        </a>
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
          style={{
            background: `linear-gradient(to right, ${colors.primary}, ${colors.secondary})`
          }}
          className="w-full text-white px-4 py-3 rounded-xl font-medium hover:shadow-lg transition-all duration-200 transform hover:scale-105 flex items-center justify-center space-x-2"
        >
          <Plus className="h-4 w-4" />
          <span>Create Event</span>
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-4 py-6 overflow-y-auto">
        {navigation.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);
          return (
            <Link
              key={item.name}
              to={item.href}
              onClick={onClose}
              style={active ? {
                background: `linear-gradient(to right, ${colors.primary}10, ${colors.secondary}10)`,
                borderColor: `${colors.primary}40`,
                color: colors.primary
              } : undefined}
              className={`group flex items-center rounded-xl px-3 py-3 text-sm font-medium transition-colors ${
                active
                  ? 'border'
                  : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
              }`}
            >
              <Icon
                style={active ? { color: colors.primary } : undefined}
                className={`mr-3 h-5 w-5 flex-shrink-0 ${
                  active ? '' : 'text-gray-400 group-hover:text-gray-500'
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
  );
};

export default DashboardSidebar;