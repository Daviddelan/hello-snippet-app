import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import DiscoverPage from './pages/DiscoverPage';
import SignUpOrganizerPage from './pages/SignUpOrganizerPage';
import SignInPage from './pages/SignInPage';
import AuthCallbackPage from './pages/AuthCallbackPage';
import CompleteProfilePage from './pages/CompleteProfilePage';
import OrganizerDashboard from './pages/OrganizerDashboard';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/discover" element={<DiscoverPage />} />
        <Route path="/signup/organizer" element={<SignUpOrganizerPage />} />
        <Route path="/signin" element={<SignInPage />} />
        <Route path="/auth/callback" element={<AuthCallbackPage />} />
        <Route path="/complete-profile" element={<CompleteProfilePage />} />
        <Route 
          path="/dashboard/organizer/*" 
          element={
            <ProtectedRoute>
              <OrganizerDashboard />
            </ProtectedRoute>
          } 
        />
      </Routes>
    </Router>
  );
}

export default App;