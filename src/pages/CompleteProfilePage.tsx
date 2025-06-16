import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Building, 
  Phone, 
  MapPin, 
  Calendar,
  ArrowRight,
  Check,
  CheckCircle,
  AlertCircle,
  User
} from 'lucide-react';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';
import { supabase } from '../lib/supabase';
import { OrganizerService } from '../services/organizerService';

const CompleteProfilePage = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [formData, setFormData] = useState({
    organizationName: '',
    phone: '',
    location: '',
    eventTypes: [] as string[]
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<{
    type: 'success' | 'error' | null;
    message: string;
  }>({ type: null, message: '' });

  const eventTypeOptions = [
    'Corporate Events',
    'Conferences & Seminars',
    'Workshops & Training',
    'Networking Events',
    'Product Launches',
    'Trade Shows',
    'Social Events',
    'Fundraising Events'
  ];

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        navigate('/signin');
        return;
      }

      setUser(user);

      // Check if user already has a complete profile
      const existingProfile = await OrganizerService.getOrganizerProfile(user.id);
      if (existingProfile && existingProfile.profile_completed) {
        navigate('/dashboard/organizer');
        return;
      }

      // Pre-fill form with user metadata if available
      if (user.user_metadata) {
        setFormData(prev => ({
          ...prev,
          organizationName: user.user_metadata.organization_name || '',
        }));
      }
    };

    checkUser();
  }, [navigate]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleEventTypeChange = (eventType: string) => {
    setFormData(prev => ({
      ...prev,
      eventTypes: prev.eventTypes.includes(eventType)
        ? prev.eventTypes.filter(type => type !== eventType)
        : [...prev.eventTypes, eventType]
    }));
  };

  const validateForm = (): string | null => {
    if (!formData.organizationName.trim()) return 'Organization name is required';
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) return;

    // Validate form
    const validationError = validateForm();
    if (validationError) {
      setSubmitStatus({
        type: 'error',
        message: validationError
      });
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus({ type: null, message: '' });

    try {
      // Create organizer profile
      const organizerProfile = {
        id: user.id,
        first_name: user.user_metadata?.first_name || user.email?.split('@')[0] || 'User',
        last_name: user.user_metadata?.last_name || '',
        email: user.email!,
        organization_name: formData.organizationName.trim(),
        phone: formData.phone.trim() || undefined,
        location: formData.location.trim() || undefined,
        event_types: formData.eventTypes,
        profile_completed: true,
        is_verified: false,
      };

      const { data, error } = await supabase
        .from('organizers')
        .insert([organizerProfile])
        .select()
        .single();

      if (error) {
        throw error;
      }

      setSubmitStatus({
        type: 'success',
        message: 'Profile completed successfully! Redirecting to your dashboard...'
      });

      setTimeout(() => {
        navigate('/dashboard/organizer');
      }, 2000);

    } catch (error: any) {
      console.error('Profile completion error:', error);
      setSubmitStatus({
        type: 'error',
        message: error.message || 'An error occurred while completing your profile'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="pt-20 pb-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mx-auto">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-primary-50 to-secondary-50 px-4 py-2 rounded-full mb-6">
                <User className="w-4 h-4 text-primary-500" />
                <span className="text-sm font-medium text-primary-700">Complete Your Profile</span>
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                Welcome to HelloSnippet!
              </h1>
              <p className="text-gray-600">
                Let's complete your organizer profile to get you started with creating amazing events.
              </p>
            </div>

            {/* Status Messages */}
            {submitStatus.type && (
              <div className={`mb-6 p-4 rounded-2xl border ${
                submitStatus.type === 'success' 
                  ? 'bg-green-50 border-green-200 text-green-800'
                  : 'bg-red-50 border-red-200 text-red-800'
              }`}>
                <div className="flex items-center space-x-2">
                  {submitStatus.type === 'success' ? (
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-red-500" />
                  )}
                  <span className="font-medium">{submitStatus.message}</span>
                </div>
              </div>
            )}

            {/* Profile Form */}
            <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
              <div className="p-8">
                <form onSubmit={handleSubmit} className="space-y-8">
                  {/* User Info Display */}
                  <div className="bg-gray-50 rounded-2xl p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Account Information</h3>
                    <div className="space-y-2">
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">Email:</span> {user.email}
                      </p>
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">Name:</span> {user.user_metadata?.full_name || user.user_metadata?.name || 'Not provided'}
                      </p>
                    </div>
                  </div>

                  {/* Organization Information */}
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                      <Building className="w-5 h-5 mr-2 text-primary-500" />
                      Organization Information
                    </h3>
                    <div className="space-y-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Organization Name *
                        </label>
                        <input
                          type="text"
                          name="organizationName"
                          value={formData.organizationName}
                          onChange={handleInputChange}
                          required
                          className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-colors"
                          placeholder="Enter your organization name"
                        />
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Phone Number
                          </label>
                          <input
                            type="tel"
                            name="phone"
                            value={formData.phone}
                            onChange={handleInputChange}
                            className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-colors"
                            placeholder="Enter your phone number"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Location
                          </label>
                          <input
                            type="text"
                            name="location"
                            value={formData.location}
                            onChange={handleInputChange}
                            className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-colors"
                            placeholder="City, State/Country"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Event Types */}
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                      <Calendar className="w-5 h-5 mr-2 text-primary-500" />
                      Event Types You Plan to Organize
                    </h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                      {eventTypeOptions.map((eventType) => (
                        <label
                          key={eventType}
                          className={`relative flex items-center p-3 rounded-xl border cursor-pointer transition-all duration-200 ${
                            formData.eventTypes.includes(eventType)
                              ? 'border-primary-500 bg-primary-50'
                              : 'border-gray-300 hover:border-primary-300 hover:bg-gray-50'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={formData.eventTypes.includes(eventType)}
                            onChange={() => handleEventTypeChange(eventType)}
                            className="sr-only"
                          />
                          <div className={`w-4 h-4 rounded border-2 mr-3 flex items-center justify-center ${
                            formData.eventTypes.includes(eventType)
                              ? 'border-primary-500 bg-primary-500'
                              : 'border-gray-300'
                          }`}>
                            {formData.eventTypes.includes(eventType) && (
                              <Check className="w-3 h-3 text-white" />
                            )}
                          </div>
                          <span className="text-sm font-medium text-gray-700">{eventType}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Submit Button */}
                  <div className="pt-6">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full bg-gradient-to-r from-primary-500 to-secondary-500 text-white py-4 px-8 rounded-2xl font-semibold text-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center space-x-2"
                    >
                      {isSubmitting ? (
                        <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      ) : (
                        <>
                          <span>Complete Profile</span>
                          <ArrowRight className="w-5 h-5" />
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default CompleteProfilePage;