import React, { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import HomePage from "./pages/HomePage";
import DiscoverPage from "./pages/DiscoverPage";
import SignUpOrganizerPage from "./pages/SignUpOrganizerPage";
import SignInPage from "./pages/SignInPage";
import AuthCallbackPage from "./pages/AuthCallbackPage";
import CompleteProfilePage from "./pages/CompleteProfilePage";
import OrganizerDashboard from "./pages/OrganizerDashboard";
import ProtectedRoute from "./components/ProtectedRoute";
import LandingPage from "./pages/LandingPage";
import EventDetailsPage from "./pages/EventDetailsPage";
import CreateEventPage from "./pages/CreateEventPage";
import AboutPage from "./pages/AboutPage";
import UserTypeSelectionPage from "./pages/UserTypeSelectionPage";
import SignUpAttendeePage from "./pages/SignUpAttendeePage";
import AttendeeDashboard from "./pages/AttendeeDashboard";
import { supabase } from "./lib/supabase";

// Clear cache/session ONLY on specific public pages, avoiding auth flows
function CacheClearer() {
  const location = useLocation();

  useEffect(() => {
    // List of paths where the user should definitely NOT be signed out
    const protectedPrefixes = [
      '/dashboard', 
      '/auth/callback', 
      '/complete-profile', 
      '/create-event'
    ];

    // Check if the current path starts with any of the protected prefixes
    const isProtectedPath = protectedPrefixes.some(prefix => 
      location.pathname.startsWith(prefix)
    );

    // Only sign out if we are NOT on a protected path
    // AND we are on a known public auth path (optional, prevents random signouts)
    const isPublicAuthPath = ['/signin', '/signup'].some(path => 
      location.pathname.startsWith(path)
    );

    if (!isProtectedPath && isPublicAuthPath) {
      // console.log('Signing out on public page:', location.pathname);
      supabase.auth.signOut();
    }
  }, [location.pathname]);

  return null;
}

function App() {
  return (
    <Router>
      <CacheClearer />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/discover" element={<DiscoverPage />} />
        <Route path="/HomePage" element={<HomePage />} />
        <Route path="/signup" element={<UserTypeSelectionPage />} />
        <Route path="/signup/organizer" element={<SignUpOrganizerPage />} />
        <Route path="/signup/attendee" element={<SignUpAttendeePage />} />
        <Route path="/signin" element={<SignInPage />} />
        <Route path="/auth/callback" element={<AuthCallbackPage />} />
        <Route path="/complete-profile" element={<CompleteProfilePage />} />
        <Route 
          path="/create-event" 
          element={
            <ProtectedRoute>
              <CreateEventPage />
            </ProtectedRoute>
          } 
        />
        <Route
          path="/dashboard/organizer/*"
          element={
            <ProtectedRoute>
              <OrganizerDashboard />
            </ProtectedRoute>
          }
        />
        <Route 
          path="/dashboard/attendee" 
          element={
            <ProtectedRoute>
              <AttendeeDashboard />
            </ProtectedRoute>
          } 
        />
        <Route path="/event/:id" element={<EventDetailsPage />} />
        <Route path="/about" element={<AboutPage />} />
      </Routes>
    </Router>
  );
}

export default App;