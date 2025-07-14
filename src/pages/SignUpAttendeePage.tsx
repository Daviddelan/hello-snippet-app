import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  User, 
  Mail, 
  Lock, 
  Phone, 
  MapPin, 
  ArrowRight,
  Eye,
  EyeOff,
  CheckCircle,
  AlertCircle,
  Calendar,
  Heart
} from 'lucide-react';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';
import GoogleSignInButton from '../components/GoogleSignInButton';
import { supabase } from '../lib/supabase';

interface AttendeeSignupData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  phone?: string;
  location?: string;
  interests: string[];
  agreeToTerms: boolean;
}

const SignUpAttendeePage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<AttendeeSignupData>({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    location: '',
    interests: [],
    agreeToTerms: false
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<{
    type: 'success' | 'error' | null;
    message: string;
  }>({ type: null, message: '' });

  const interestOptions = [
    'Music & Concerts',
    'Technology & Innovation',
    'Business & Networking',
    'Arts & Culture',
    'Sports & Fitness',
    'Food & Drink',
    'Education & Learning',
    'Health & Wellness',
    'Travel & Adventure',
    'Community & Social'
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleInterestToggle = (interest: string) => {
    setFormData(prev => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter(i => i !== interest)
        : [...prev.interests, interest]
    }));
  };

  const validateForm = (): string | null => {
    if (!formData.firstName.trim()) return 'First name is required';
    if (!formData.lastName.trim()) return 'Last name is required';
    if (!formData.email.trim()) return 'Email is required';
    if (!formData.password) return 'Password is required';
    if (formData.password.length < 6) return 'Password must be at least 6 characters';
    if (formData.password !== formData.confirmPassword) return 'Passwords do not match';
    if (!formData.agreeToTerms) return 'You must agree to the terms and conditions';
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) return 'Please enter a valid email address';
    
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
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
      console.log('Starting attendee signup process...');
      
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
        options: {
          data: {
            first_name: formData.firstName.trim(),
            last_name: formData.lastName.trim(),
            user_type: 'attendee',
            phone: formData.phone?.trim(),
            location: formData.location?.trim(),
            interests: formData.interests
          }
        }
      });

      if (authError) {
        throw authError;
      }

      if (authData.user) {
        setSubmitStatus({
          type: 'success',
          message: 'Account created successfully! Please check your email to verify your account.'
        });

        // Reset form
        setFormData({
          firstName: '',
          lastName: '',
          email: '',
          password: '',
          confirmPassword: '',
          phone: '',
          location: '',
          interests: [],
          agreeToTerms: false
        });

        // Redirect to success page or login after a delay
        setTimeout(() => {
          navigate('/signin?message=Please check your email to verify your account');
        }, 3000);
      }

    } catch (error: any) {
      console.error('Attendee signup error:', error);
      
      let errorMessage = 'An unexpected error occurred';
      
      if (error.message?.includes('User already registered')) {
        errorMessage = 'An account with this email already exists. Please sign in instead.';
      } else if (error.message?.includes('Invalid email')) {
        errorMessage = 'Please enter a valid email address.';
      } else if (error.message?.includes('Password should be at least')) {
        errorMessage = 'Password must be at least 6 characters long.';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setSubmitStatus({
        type: 'error',
        message: errorMessage
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleSuccess = (user: any) => {
    console.log('Google signup successful:', user?.email);
    setSubmitStatus({
      type: 'success',
      message: 'Google sign-up successful! Redirecting...'
    });
  };

  const handleGoogleError = (error: string) => {
    console.error('Google signup error:', error);
    setSubmitStatus({
      type: 'error',
      message: `Google sign-up failed: ${error}`
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="pt-20 pb-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="text-center mb-12">
              <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-secondary-50 to-primary-50 px-4 py-2 rounded-full mb-6">
                <User className="w-4 h-4 text-secondary-500" />
                <span className="text-sm font-medium text-secondary-700">Event Attendee</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
                Join the Event Community
              </h1>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Discover amazing events, connect with like-minded people, and create unforgettable memories.
              </p>
            </div>

            {/* Status Messages */}
            {submitStatus.type && (
              <div className={`mb-8 p-4 rounded-2xl border ${
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

            {/* Sign Up Form */}
            <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
              <div className="p-8 sm:p-12">
                {/* Google Sign Up */}
                <div className="mb-8">
                  <GoogleSignInButton
                    onSuccess={handleGoogleSuccess}
                    onError={handleGoogleError}
                  >
                    Sign up with Google
                  </GoogleSignInButton>
                </div>

                {/* Divider */}
                <div className="relative mb-8">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300" />
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white text-gray-500">Or sign up with email</span>
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-8">
                  {/* Personal Information */}
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                      <User className="w-5 h-5 mr-2 text-secondary-500" />
                      Personal Information
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          First Name *
                        </label>
                        <input
                          type="text"
                          name="firstName"
                          value={formData.firstName}
                          onChange={handleInputChange}
                          required
                          className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-secondary-500/20 focus:border-secondary-500 transition-colors"
                          placeholder="Enter your first name"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Last Name *
                        </label>
                        <input
                          type="text"
                          name="lastName"
                          value={formData.lastName}
                          onChange={handleInputChange}
                          required
                          className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-secondary-500/20 focus:border-secondary-500 transition-colors"
                          placeholder="Enter your last name"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Account Information */}
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                      <Mail className="w-5 h-5 mr-2 text-secondary-500" />
                      Account Information
                    </h3>
                    <div className="space-y-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Email Address *
                        </label>
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          required
                          className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-secondary-500/20 focus:border-secondary-500 transition-colors"
                          placeholder="Enter your email address"
                        />
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Password *
                          </label>
                          <div className="relative">
                            <input
                              type={showPassword ? "text" : "password"}
                              name="password"
                              value={formData.password}
                              onChange={handleInputChange}
                              required
                              minLength={6}
                              className="w-full px-4 py-3 pr-12 rounded-xl border border-gray-300 focus:ring-2 focus:ring-secondary-500/20 focus:border-secondary-500 transition-colors"
                              placeholder="Create a password"
                            />
                            <button
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                            >
                              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                            </button>
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Confirm Password *
                          </label>
                          <div className="relative">
                            <input
                              type={showConfirmPassword ? "text" : "password"}
                              name="confirmPassword"
                              value={formData.confirmPassword}
                              onChange={handleInputChange}
                              required
                              className="w-full px-4 py-3 pr-12 rounded-xl border border-gray-300 focus:ring-2 focus:ring-secondary-500/20 focus:border-secondary-500 transition-colors"
                              placeholder="Confirm your password"
                            />
                            <button
                              type="button"
                              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                            >
                              {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Optional Information */}
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                      <MapPin className="w-5 h-5 mr-2 text-secondary-500" />
                      Additional Information (Optional)
                    </h3>
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
                          className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-secondary-500/20 focus:border-secondary-500 transition-colors"
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
                          className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-secondary-500/20 focus:border-secondary-500 transition-colors"
                          placeholder="City, State/Country"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Interests */}
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                      <Heart className="w-5 h-5 mr-2 text-secondary-500" />
                      Your Interests
                    </h3>
                    <p className="text-gray-600 mb-4">Select the types of events you're interested in (optional)</p>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                      {interestOptions.map((interest) => (
                        <label
                          key={interest}
                          className={`relative flex items-center p-3 rounded-xl border cursor-pointer transition-all duration-200 ${
                            formData.interests.includes(interest)
                              ? 'border-secondary-500 bg-secondary-50'
                              : 'border-gray-300 hover:border-secondary-300 hover:bg-gray-50'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={formData.interests.includes(interest)}
                            onChange={() => handleInterestToggle(interest)}
                            className="sr-only"
                          />
                          <div className={`w-4 h-4 rounded border-2 mr-3 flex items-center justify-center ${
                            formData.interests.includes(interest)
                              ? 'border-secondary-500 bg-secondary-500'
                              : 'border-gray-300'
                          }`}>
                            {formData.interests.includes(interest) && (
                              <CheckCircle className="w-3 h-3 text-white" />
                            )}
                          </div>
                          <span className="text-sm font-medium text-gray-700">{interest}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Terms and Conditions */}
                  <div>
                    <label className="flex items-start space-x-3 cursor-pointer">
                      <div className={`w-5 h-5 rounded border-2 mt-0.5 flex items-center justify-center ${
                        formData.agreeToTerms
                          ? 'border-secondary-500 bg-secondary-500'
                          : 'border-gray-300'
                      }`}>
                        {formData.agreeToTerms && (
                          <CheckCircle className="w-3 h-3 text-white" />
                        )}
                      </div>
                      <input
                        type="checkbox"
                        name="agreeToTerms"
                        checked={formData.agreeToTerms}
                        onChange={handleInputChange}
                        required
                        className="sr-only"
                      />
                      <span className="text-sm text-gray-600">
                        I agree to the{' '}
                        <Link to="/terms" className="text-secondary-500 hover:text-secondary-600 font-medium">
                          Terms of Service
                        </Link>{' '}
                        and{' '}
                        <Link to="/privacy" className="text-secondary-500 hover:text-secondary-600 font-medium">
                          Privacy Policy
                        </Link>
                      </span>
                    </label>
                  </div>

                  {/* Submit Button */}
                  <div className="pt-6">
                    <button
                      type="submit"
                      disabled={isSubmitting || !formData.agreeToTerms}
                      className="w-full bg-gradient-to-r from-secondary-500 to-primary-500 text-white py-4 px-8 rounded-2xl font-semibold text-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center space-x-2"
                    >
                      {isSubmitting ? (
                        <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      ) : (
                        <>
                          <span>Create My Account</span>
                          <ArrowRight className="w-5 h-5" />
                        </>
                      )}
                    </button>
                  </div>
                </form>

                {/* Sign In Link */}
                <div className="text-center mt-8 pt-8 border-t border-gray-200">
                  <p className="text-gray-600">
                    Already have an account?{' '}
                    <Link to="/signin" className="text-secondary-500 hover:text-secondary-600 font-semibold">
                      Sign In
                    </Link>
                  </p>
                  <p className="text-gray-600 mt-2">
                    Want to organize events?{' '}
                    <Link to="/signup/organizer" className="text-primary-500 hover:text-primary-600 font-semibold">
                      Sign Up as Organizer
                    </Link>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default SignUpAttendeePage;