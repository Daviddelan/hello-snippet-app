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
    let processed = false;
    let authListener: { data: { subscription: any } } | null = null;

    // Helper function to handle successful authentication
    const handleSuccessfulAuth = async (user: any) => {
      if (processed) {
        console.log('⏭️ Already processed, skipping duplicate handling');
        return;
      }
      processed = true;

      console.log('👤 Processing authenticated user:', user.email);

      // Check if user already has an organizer profile
      const existingProfile = await OrganizerService.getOrganizerProfile(user.id);

      if (existingProfile) {
        if (existingProfile.profile_completed) {
          console.log('✅ Complete organizer profile found, redirecting to dashboard');
          setStatus('success');
          setMessage('Welcome back! Redirecting to your dashboard...');
          setTimeout(() => navigate('/dashboard/organizer'), 1500);
        } else {
          console.log('⚠️ Incomplete organizer profile found, redirecting to complete profile');
          setStatus('success');
          setMessage('Please complete your profile...');
          setTimeout(() => navigate('/complete-profile'), 1500);
        }
      } else {
        console.log('🆕 No organizer profile found, redirecting to complete profile');
        setStatus('success');
        setMessage('Account created successfully! Please complete your profile...');
        setTimeout(() => navigate('/complete-profile'), 1500);
      }
    };

    const handleAuthCallback = async () => {
      try {
        console.log('🔐 Auth callback page loaded');
        console.log('📍 Current URL:', window.location.href);
        console.log('🔗 URL hash:', window.location.hash);
        console.log('🔍 URL search:', window.location.search);

        // First check if there's an error in the URL
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const searchParams = new URLSearchParams(window.location.search);

        const errorParam = hashParams.get('error') || searchParams.get('error');
        const errorDescription = hashParams.get('error_description') || searchParams.get('error_description');

        if (errorParam) {
          console.error('❌ OAuth error in URL:', errorParam, errorDescription);
          throw new Error(errorDescription || errorParam);
        }

        // Set up auth state change listener BEFORE checking session
        console.log('👂 Setting up auth state change listener...');
        let listenerTriggered = false;

        authListener = supabase.auth.onAuthStateChange(async (event, session) => {
          console.log('🔔 Auth state changed:', event, session?.user?.email);

          if ((event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') && session && !listenerTriggered) {
            listenerTriggered = true;
            console.log(`✅ ${event} event received`);
            await handleSuccessfulAuth(session.user);
          }
        });

        // Small delay to ensure listener is set up
        await new Promise(resolve => setTimeout(resolve, 100));

        // Check for auth code or token in URL (PKCE flow or implicit flow)
        const code = searchParams.get('code');
        const accessToken = hashParams.get('access_token');

        console.log('🔑 Auth code present:', !!code);
        console.log('🎫 Access token present:', !!accessToken);

        // If we have a code (PKCE flow), exchange it for a session
        if (code) {
          console.log('📦 Exchanging code for session...');
          const { data, error } = await supabase.auth.exchangeCodeForSession(code);

          if (error) {
            console.error('❌ Code exchange error:', error);
            throw error;
          }

          if (data.session) {
            console.log('✅ Session established from code exchange');
            await handleSuccessfulAuth(data.session.user);
            return;
          }
        }

        // Check for existing session immediately
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession();

        if (sessionError) {
          console.error('❌ Session error:', sessionError);
          throw sessionError;
        }

        if (sessionData.session) {
          console.log('✅ Session found immediately:', sessionData.session.user.email);
          await handleSuccessfulAuth(sessionData.session.user);
          return;
        }

        // If we have auth data in URL but no session yet, wait for Supabase to process
        if (accessToken || window.location.hash || code) {
          console.log('⏳ Auth data present, waiting for Supabase automatic processing...');

          // Wait and check multiple times
          for (let i = 0; i < 6; i++) {
            await new Promise(resolve => setTimeout(resolve, 500));

            const { data: retryData } = await supabase.auth.getSession();
            if (retryData.session) {
              console.log(`✅ Session found after ${(i + 1) * 500}ms`);
              await handleSuccessfulAuth(retryData.session.user);
              return;
            }

            console.log(`⏳ Attempt ${i + 1}/6: Still waiting...`);
          }
        }

        // If we still don't have a session, provide detailed error info
        console.error('❌ No session found after all attempts');
        console.log('🔍 Debug information:');
        console.log('   - Full URL:', window.location.href);
        console.log('   - Hash params:', Array.from(hashParams.entries()));
        console.log('   - Search params:', Array.from(searchParams.entries()));

        throw new Error('Authentication callback failed. This might indicate a configuration issue with Google OAuth in Supabase. Please ensure:\n1. Google OAuth is enabled in Supabase\n2. The redirect URL is correctly configured\n3. You have the correct OAuth credentials');

      } catch (error) {
        console.error('❌ Auth callback error:', error);
        setStatus('error');

        let errorMessage = 'Authentication failed.';

        if (error instanceof Error) {
          if (error.message.includes('Invalid login credentials')) {
            errorMessage = 'Invalid credentials. Please check your login information.';
          } else if (error.message.includes('Email not confirmed')) {
            errorMessage = 'Please check your email and confirm your account.';
          } else if (error.message.includes('access_denied')) {
            errorMessage = 'Access denied. You may have cancelled the sign-in.';
          } else if (error.message.includes('configuration issue')) {
            errorMessage = error.message;
          } else {
            errorMessage = `Authentication error: ${error.message}`;
          }
        }

        setMessage(errorMessage);
        setTimeout(() => navigate('/signin'), 5000);
      }
    };

    handleAuthCallback();

    // Cleanup
    return () => {
      if (authListener) {
        authListener.data.subscription.unsubscribe();
      }
    };
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
            <div className="space-y-3">
              <button
                onClick={() => navigate('/signin')}
                className="w-full bg-gradient-to-r from-primary-500 to-secondary-500 text-white px-6 py-3 rounded-2xl font-semibold hover:shadow-lg transition-all duration-300"
              >
                Back to Sign In
              </button>
              <p className="text-sm text-gray-500">
                You will be automatically redirected in a few seconds
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthCallbackPage;