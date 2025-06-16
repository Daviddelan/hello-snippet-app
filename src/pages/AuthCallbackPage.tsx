import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader, CheckCircle, AlertCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { OrganizerService } from '../services/organizerService';

const AuthCallbackPage = () => {
  const navigate = useNavigate();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Processing authentication...');

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Get the session from the URL hash
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          throw error;
        }

        if (data.session) {
          const user = data.session.user;
          
          // Check if user already has an organizer profile
          const existingProfile = await OrganizerService.getOrganizerProfile(user.id);
          
          if (existingProfile) {
            // Existing user - redirect to dashboard
            setStatus('success');
            setMessage('Welcome back! Redirecting to your dashboard...');
            setTimeout(() => navigate('/dashboard/organizer'), 2000);
          } else {
            // New user from Google OAuth - redirect to complete profile
            setStatus('success');
            setMessage('Account created successfully! Please complete your profile...');
            setTimeout(() => navigate('/complete-profile'), 2000);
          }
        } else {
          throw new Error('No session found');
        }
      } catch (error) {
        console.error('Auth callback error:', error);
        setStatus('error');
        setMessage('Authentication failed. Please try signing in again.');
        setTimeout(() => navigate('/signin'), 3000);
      }
    };

    handleAuthCallback();
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md w-full mx-4">
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8 text-center">
          <div className="mb-6">
            {status === 'loading' && (
              <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
                <Loader className="w-8 h-8 text-blue-500 animate-spin" />
              </div>
            )}
            {status === 'success' && (
              <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                <CheckCircle className="w-8 h-8 text-green-500" />
              </div>
            )}
            {status === 'error' && (
              <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
                <AlertCircle className="w-8 h-8 text-red-500" />
              </div>
            )}
          </div>

          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            {status === 'loading' && 'Authenticating...'}
            {status === 'success' && 'Success!'}
            {status === 'error' && 'Authentication Failed'}
          </h1>

          <p className="text-gray-600 mb-6">{message}</p>

          {status === 'loading' && (
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-blue-500 h-2 rounded-full animate-pulse" style={{ width: '60%' }}></div>
            </div>
          )}

          {status === 'error' && (
            <button
              onClick={() => navigate('/signin')}
              className="bg-gradient-to-r from-primary-500 to-secondary-500 text-white px-6 py-3 rounded-2xl font-semibold hover:shadow-lg transition-all duration-300"
            >
              Back to Sign In
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthCallbackPage;