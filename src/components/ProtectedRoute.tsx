import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { OrganizerService } from '../services/organizerService';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        setError(null);
        console.log('ProtectedRoute: Checking authentication...');
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        
        if (userError) {
          console.error('Auth error:', userError);
          setError('Authentication error');
          navigate('/signin');
          return;
        }

        if (!user) {
          console.log('No user found, redirecting to signin');
          navigate('/signin');
          return;
        }

        console.log('User found:', user.email);

        // Check if user has an organizer profile
        try {
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
          console.log('Organizer profile found:', organizerProfile.organization_name);
          setIsAuthenticated(true);
        } catch (profileError) {
          console.error('Error fetching organizer profile:', profileError);
          setError('Error loading profile');
          navigate('/complete-profile');
          return;
        }

      } catch (error) {
        console.error('Auth check error:', error);
        setError('Authentication failed');
        navigate('/signin');
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event, session?.user?.email);
      
      if (event === 'SIGNED_OUT') {
        setIsAuthenticated(false);
        navigate('/signin');
      } else if (event === 'SIGNED_IN' && session) {
        // Re-check auth when user signs in
        checkAuth();
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-8 h-8 animate-spin text-primary-500 mx-auto mb-4" />
          <p className="text-gray-600">Loading...</p>
          {error && (
            <p className="text-red-600 text-sm mt-2">{error}</p>
          )}
        </div>
      </div>
    );
  }

  return isAuthenticated ? <>{children}</> : null;
};

export default ProtectedRoute;