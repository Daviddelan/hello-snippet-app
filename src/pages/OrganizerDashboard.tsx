import React, { useState, useEffect } from 'react';
import { Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import DashboardSidebar from '../components/dashboard/DashboardSidebar';
import DashboardHeader from '../components/dashboard/DashboardHeader';
import DashboardOverview from '../components/dashboard/DashboardOverview';
import EventsManagement from '../components/dashboard/EventsManagement';
import Analytics from '../components/dashboard/Analytics';
import Attendees from '../components/dashboard/Attendees';
import Marketing from '../components/dashboard/Marketing';
import Settings from '../components/dashboard/Settings';
import CreateEventModal from '../components/dashboard/CreateEventModal';
import { supabase } from '../lib/supabase';
import { OrganizerService } from '../services/organizerService';
import type { Organizer } from '../lib/supabase';
import { Loader, AlertCircle } from 'lucide-react';
import { ThemeProvider } from '../contexts/ThemeContext';

const OrganizerDashboard = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [organizer, setOrganizer] = useState<Organizer | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    const loadOrganizerData = async () => {
      try {
        setError(null);
        console.log('Loading organizer data...');
        console.log(import.meta.env.VITE_SUPABASE_URL)
        console.log(import.meta.env.VITE_SUPABASE_ANON_KEY)
        
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        
        if (userError) {
          throw new Error(`User fetch error: ${userError.message}`);
        }
        
        if (!user) {
          throw new Error('No authenticated user found');
        }

        console.log('Fetching organizer profile for user:', user.email);
        const organizerProfile = await OrganizerService.getOrganizerProfile(user.id);
        
        if (!organizerProfile) {
          console.log('No organizer profile found, redirecting to complete profile');
          navigate('/complete-profile');
          return;
        }

        if (!organizerProfile.profile_completed) {
          console.log('Profile not completed, redirecting to complete profile');
          navigate('/complete-profile');
          return;
        }
        console.log('Organizer profile loaded:', organizerProfile.organization_name);
        setOrganizer(organizerProfile);
      } catch (error) {
        console.error('Error loading organizer data:', error);
        // Instead of showing error, redirect to signin
        console.log('Error loading organizer data, redirecting to signin');
        navigate('/signin');
      } finally {
        setIsLoading(false);
      }
    };

    loadOrganizerData();
  }, [navigate]);

  const handleCreateEvent = () => {
    setShowCreateModal(true);
  };

  const handleEventCreated = () => {
    // This will be called when an event is successfully created
    // You can add any additional logic here if needed
    console.log('Event created successfully');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-12 h-12 animate-spin text-primary-500 mx-auto mb-4" />
          <p className="text-gray-600 text-lg">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Dashboard Error</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="bg-primary-500 text-white px-4 py-2 rounded-lg hover:bg-primary-600 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!organizer) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
          <p className="text-gray-600">No organizer profile found</p>
        </div>
      </div>
    );
  }

  return (
    <ThemeProvider organizerId={organizer?.id}>
      <div className="min-h-screen bg-gray-50 flex">
        {/* Sidebar */}
        <div className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0">
          <DashboardSidebar
            isOpen={true}
            onClose={() => setSidebarOpen(false)}
            onCreateEvent={handleCreateEvent}
          />
        </div>

        {/* Main Content */}
        <div className="flex-1 lg:pl-64">
          {/* Header */}
          <DashboardHeader
            onMenuClick={() => setSidebarOpen(true)}
            organizer={organizer}
          />

          {/* Page Content */}
          <main className="flex-1 py-6">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <Routes>
                <Route path="/" element={<DashboardOverview organizer={organizer} />} />
                <Route path="/events" element={<EventsManagement organizer={organizer} />} />
                <Route path="/analytics" element={<Analytics organizer={organizer} />} />
                <Route path="/attendees" element={<Attendees organizer={organizer} />} />
                <Route path="/marketing" element={<Marketing organizer={organizer} />} />
                <Route path="/settings" element={<Settings organizer={organizer} />} />
              </Routes>
            </div>
          </main>
        </div>

        {/* Mobile sidebar overlay */}
        <div className={`lg:hidden ${sidebarOpen ? 'block' : 'hidden'}`}>
          {/* Mobile sidebar overlay */}
          <div className="fixed inset-0 z-40 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)} />

          {/* Mobile sidebar */}
          <div className="fixed inset-y-0 left-0 z-50 w-64">
            <DashboardSidebar
              isOpen={sidebarOpen}
              onClose={() => setSidebarOpen(false)}
              onCreateEvent={handleCreateEvent}
            />
          </div>
        </div>

        {/* Global Create Event Modal */}
        <CreateEventModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          organizerId={organizer?.id || ''}
          onEventCreated={handleEventCreated}
        />
      </div>
    </ThemeProvider>
  );
};

export default OrganizerDashboard;