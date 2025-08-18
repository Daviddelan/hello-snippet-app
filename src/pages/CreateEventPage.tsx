import React, { useState, useEffect } from "react";
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  DollarSign,
  Image as ImageIcon,
  Sparkles,
  ArrowLeft,
  CheckCircle,
  AlertCircle,
  Save,
  Eye,
  Upload,
  Tag,
  FileText,
  Building,
  Loader
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import Navigation from "../components/Navigation";
import Footer from "../components/Footer";
import ImageCropper from "../components/dashboard/ImageCropper";
import LocationPicker from "../components/dashboard/LocationPicker";
import { EventService } from "../services/eventService";
import { ValidationService } from "../services/validationService";
import { supabase } from "../lib/supabase";
import { OrganizerService } from "../services/organizerService";
import type { CreateEventData, Organizer } from "../lib/supabase";

const CreateEventPage = () => {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [organizer, setOrganizer] = useState<Organizer | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<CreateEventData & { 
    locationCoords?: { lat: number; lng: number };
    eventType: string;
  }>({
    title: "",
    description: "",
    start_date: "",
    end_date: "",
    location: "",
    venue_name: "",
    capacity: 100,
    price: 0,
    currency: "USD",
    category: "Other",
    image_url: "",
    eventType: "in-person"
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<{
    type: 'success' | 'error' | 'warning' | null;
    message: string;
  }>({ type: null, message: '' });

  const [validationWarnings, setValidationWarnings] = useState<string[]>([]);
  const [showImageCropper, setShowImageCropper] = useState(false);
  const [showLocationPicker, setShowLocationPicker] = useState(false);
  const [croppedImagePreview, setCroppedImagePreview] = useState<string>('');

  const categories = [
    'Business & Professional',
    'Music & Entertainment',
    'Arts & Culture',
    'Health & Fitness',
    'Education & Learning',
    'Community & Social',
    'Food & Drink',
    'Technology',
    'Sports',
    'Other'
  ];

  const eventTypes = [
    { value: 'in-person', label: 'In-Person Event', icon: MapPin },
    { value: 'virtual', label: 'Virtual Event', icon: Users },
    { value: 'hybrid', label: 'Hybrid Event', icon: Sparkles }
  ];

  // Check authentication and load organizer data
  useEffect(() => {
    const checkAuth = async () => {
      try {
        console.log('CreateEventPage: Checking authentication...');
        const { data: { user }, error } = await supabase.auth.getUser();
        
        if (error || !user) {
          console.log('CreateEventPage: No user found, redirecting to signin');
          navigate('/signin?message=Please sign in to create events');
          return;
        }

        console.log('CreateEventPage: User found:', user.email);
        setCurrentUser(user);

        // Get organizer profile
        const organizerProfile = await OrganizerService.getOrganizerProfile(user.id);
        if (!organizerProfile) {
          console.log('CreateEventPage: No organizer profile found');
          navigate('/complete-profile?message=Please complete your profile first');
          return;
        }

        if (!organizerProfile.profile_completed) {
          console.log('CreateEventPage: Profile not completed');
          navigate('/complete-profile?message=Please complete your profile first');
          return;
        }

        console.log('CreateEventPage: Organizer profile loaded:', organizerProfile.organization_name);
        setOrganizer(organizerProfile);
      } catch (error) {
        console.error('Auth check error:', error);
        navigate('/signin');
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [navigate]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseFloat(value) || 0 : value
    }));

    // Clear previous validation messages when user starts typing
    if (submitStatus.type === 'error') {
      setSubmitStatus({ type: null, message: '' });
    }
  };

  const handleImageCropped = async (croppedImageUrl: string) => {
    setCroppedImagePreview(croppedImageUrl);
    setFormData(prev => ({
      ...prev,
      image_url: croppedImageUrl
    }));
    setShowImageCropper(false);
  };

  const handleLocationSelected = (location: { address: string; lat: number; lng: number }) => {
    const locationValidation = ValidationService.validateLocation(location);
    
    if (!locationValidation.isValid) {
      setSubmitStatus({
        type: 'error',
        message: `Invalid location: ${locationValidation.error}`
      });
      return;
    }

    setFormData(prev => ({
      ...prev,
      location: location.address,
      locationCoords: { lat: location.lat, lng: location.lng }
    }));
    setShowLocationPicker(false);
    
    if (submitStatus.type === 'error' && submitStatus.message.includes('location')) {
      setSubmitStatus({ type: null, message: '' });
    }
  };

  const validateForm = (): { isValid: boolean; errors: string[]; warnings: string[] } => {
    const validation = ValidationService.validateEventData(formData);
    
    if (formData.locationCoords) {
      const locationValidation = ValidationService.validateLocation({
        address: formData.location,
        lat: formData.locationCoords.lat,
        lng: formData.locationCoords.lng
      });
      
      if (!locationValidation.isValid) {
        validation.errors.push(`Location validation failed: ${locationValidation.error}`);
      }
    }

    if (formData.image_url && !ValidationService.validateImageUrl(formData.image_url)) {
      validation.errors.push('Invalid or untrusted image URL');
    }

    return validation;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!organizer) {
      setSubmitStatus({
        type: 'error',
        message: 'Organizer profile not found'
      });
      return;
    }

    const validation = validateForm();
    
    if (!validation.isValid) {
      setSubmitStatus({
        type: 'error',
        message: validation.errors.join('; ')
      });
      return;
    }

    if (validation.warnings.length > 0) {
      setValidationWarnings(validation.warnings);
    }

    setIsSubmitting(true);
    setSubmitStatus({ type: null, message: '' });

    try {
      const sanitizedData = ValidationService.sanitizeEventData(formData);
      const { locationCoords, eventType, ...eventData } = sanitizedData;
      
      const result = await EventService.createEvent(organizer.id, eventData);

      if (result.success) {
        setSubmitStatus({
          type: 'success',
          message: result.message || 'Event created successfully!'
        });

        // Reset form
        setFormData({
          title: "",
          description: "",
          start_date: "",
          end_date: "",
          location: "",
          venue_name: "",
          capacity: 100,
          price: 0,
          currency: "USD",
          category: "Other",
          image_url: "",
          eventType: "in-person"
        });
        setCroppedImagePreview('');
        setValidationWarnings([]);
        setStep(1);

        // Redirect after delay
        setTimeout(() => {
          navigate('/dashboard/organizer/events');
        }, 3000);

      } else {
        setSubmitStatus({
          type: 'error',
          message: result.error || 'Failed to create event'
        });
      }
    } catch (error) {
      console.error('Event creation error:', error);
      setSubmitStatus({
        type: 'error',
        message: 'An unexpected error occurred'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const nextStep = () => {
    if (step < 3) setStep(step + 1);
  };

  const prevStep = () => {
    if (step > 1) setStep(step - 1);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-8 h-8 animate-spin text-primary-500 mx-auto mb-4" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Navigation />
      <div className="min-h-screen w-full flex flex-col justify-center items-center bg-gradient-to-br from-purple-100 via-white to-purple-200 relative overflow-hidden">
        {/* Animated background blobs */}
        <svg
          className="absolute top-[-120px] left-[-120px] w-[600px] h-[600px] z-0 animate-float-slow"
          viewBox="0 0 600 600"
          fill="none"
        >
          <ellipse
            cx="300"
            cy="300"
            rx="300"
            ry="300"
            fill="#c4b5fd"
            fillOpacity="0.18"
          />
        </svg>
        <svg
          className="absolute bottom-[-180px] right-[-180px] w-[700px] h-[700px] z-0 animate-float-slow2"
          viewBox="0 0 700 700"
          fill="none"
        >
          <ellipse
            cx="350"
            cy="350"
            rx="350"
            ry="350"
            fill="#a78bfa"
            fillOpacity="0.13"
          />
        </svg>

        <div className="relative z-10 w-full max-w-6xl mx-auto flex flex-col gap-8 py-20 px-4 md:px-10">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-4 mb-4">
              <Calendar className="text-purple-600" size={44} />
              <h1 className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-500 via-purple-700 to-purple-900 font-['Montserrat'] drop-shadow-2xl leading-tight">
                Create Amazing Event
              </h1>
            </div>
            <p className="text-xl text-gray-700 font-['Inter'] max-w-2xl mx-auto mb-6">
              Bring your community together with HelloSnippet's powerful event creation tools
            </p>
            
            {/* Progress Steps */}
            <div className="flex justify-center items-center space-x-4 mb-8">
              {[1, 2, 3].map((stepNum) => (
                <div key={stepNum} className="flex items-center">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                    step >= stepNum 
                      ? 'bg-gradient-to-r from-purple-500 to-purple-700 text-white' 
                      : 'bg-gray-200 text-gray-500'
                  }`}>
                    {step > stepNum ? <CheckCircle className="w-5 h-5" /> : stepNum}
                  </div>
                  {stepNum < 3 && (
                    <div className={`w-16 h-1 mx-2 ${
                      step > stepNum ? 'bg-purple-500' : 'bg-gray-200'
                    }`} />
                  )}
                </div>
              ))}
            </div>
            <div className="text-sm text-gray-600">
              Step {step} of 3: {
                step === 1 ? 'Basic Information' :
                step === 2 ? 'Event Details' :
                'Review & Publish'
              }
            </div>
          </div>

          {/* Status Messages */}
          {submitStatus.type && (
            <div className={`mx-auto max-w-2xl p-4 rounded-2xl border ${
              submitStatus.type === 'success' 
                ? 'bg-green-50 border-green-200 text-green-800'
                : submitStatus.type === 'warning'
                ? 'bg-yellow-50 border-yellow-200 text-yellow-800'
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

          {/* Validation Warnings */}
          {validationWarnings.length > 0 && (
            <div className="mx-auto max-w-2xl p-4 rounded-2xl border bg-yellow-50 border-yellow-200">
              <div className="flex items-start space-x-2">
                <AlertCircle className="w-5 h-5 text-yellow-500 mt-0.5" />
                <div>
                  <span className="font-medium text-yellow-800">Warnings:</span>
                  <ul className="text-yellow-700 text-sm mt-1 list-disc list-inside">
                    {validationWarnings.map((warning, index) => (
                      <li key={index}>{warning}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Form Card */}
          <div className="w-full bg-white/80 rounded-3xl shadow-2xl border border-purple-200 backdrop-blur-2xl overflow-hidden">
            {submitStatus.type === 'success' ? (
              <div className="flex flex-col items-center justify-center py-16 px-8">
                <CheckCircle className="text-green-500 mb-6" size={64} />
                <h2 className="text-3xl font-bold text-purple-800 mb-4">
                  Event Created Successfully! 🎉
                </h2>
                <p className="text-lg text-gray-700 mb-6 text-center max-w-md">
                  Your event has been created and saved as a draft. You can publish it from your dashboard.
                </p>
                <div className="flex gap-4">
                  <button
                    onClick={() => navigate('/dashboard/organizer/events')}
                    className="bg-gradient-to-r from-purple-500 to-purple-700 text-white px-8 py-4 rounded-2xl font-bold shadow-xl hover:scale-105 hover:shadow-2xl transition-all duration-200 text-lg border-2 border-purple-400"
                  >
                    Go to Dashboard
                  </button>
                  <button
                    onClick={() => window.location.reload()}
                    className="bg-white border-2 border-purple-400 text-purple-700 px-8 py-4 rounded-2xl font-bold hover:bg-purple-50 transition-all duration-200 text-lg"
                  >
                    Create Another Event
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="p-8 md:p-12">
                {/* Step 1: Basic Information */}
                {step === 1 && (
                  <div className="space-y-8">
                    <div className="text-center mb-8">
                      <FileText className="w-12 h-12 text-purple-600 mx-auto mb-4" />
                      <h3 className="text-2xl font-bold text-purple-800 mb-2">Basic Information</h3>
                      <p className="text-gray-600">Let's start with the essentials</p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                      <div className="space-y-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Event Title *
                          </label>
                          <input
                            type="text"
                            name="title"
                            value={formData.title}
                            onChange={handleInputChange}
                            required
                            maxLength={200}
                            className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-colors"
                            placeholder="Enter your event title"
                          />
                          <p className="text-xs text-gray-500 mt-1">{formData.title.length}/200 characters</p>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Event Category *
                          </label>
                          <select
                            name="category"
                            value={formData.category}
                            onChange={handleInputChange}
                            required
                            className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-colors"
                          >
                            {categories.map(category => (
                              <option key={category} value={category}>{category}</option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Event Type *
                          </label>
                          <div className="grid grid-cols-1 gap-3">
                            {eventTypes.map((type) => {
                              const IconComponent = type.icon;
                              return (
                                <label
                                  key={type.value}
                                  className={`relative flex items-center p-4 rounded-xl border cursor-pointer transition-all duration-200 ${
                                    formData.eventType === type.value
                                      ? 'border-purple-500 bg-purple-50'
                                      : 'border-gray-300 hover:border-purple-300 hover:bg-gray-50'
                                  }`}
                                >
                                  <input
                                    type="radio"
                                    name="eventType"
                                    value={type.value}
                                    checked={formData.eventType === type.value}
                                    onChange={handleInputChange}
                                    className="sr-only"
                                  />
                                  <IconComponent className={`w-5 h-5 mr-3 ${
                                    formData.eventType === type.value ? 'text-purple-500' : 'text-gray-400'
                                  }`} />
                                  <span className="font-medium text-gray-700">{type.label}</span>
                                </label>
                              );
                            })}
                          </div>
                        </div>
                      </div>

                      <div className="space-y-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Description
                          </label>
                          <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleInputChange}
                            rows={6}
                            maxLength={5000}
                            className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-colors"
                            placeholder="Describe your event..."
                          />
                          <p className="text-xs text-gray-500 mt-1">{formData.description.length}/5000 characters</p>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Capacity *
                            </label>
                            <input
                              type="number"
                              name="capacity"
                              value={formData.capacity}
                              onChange={handleInputChange}
                              required
                              min="1"
                              max="100000"
                              className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-colors"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Ticket Price ($) *
                            </label>
                            <input
                              type="number"
                              name="price"
                              value={formData.price}
                              onChange={handleInputChange}
                              min="0"
                              max="100000"
                              step="0.01"
                              className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-colors"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 2: Event Details */}
                {step === 2 && (
                  <div className="space-y-8">
                    <div className="text-center mb-8">
                      <Calendar className="w-12 h-12 text-purple-600 mx-auto mb-4" />
                      <h3 className="text-2xl font-bold text-purple-800 mb-2">Event Details</h3>
                      <p className="text-gray-600">When and where will your event take place?</p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                      <div className="space-y-6">
                        <div className="grid grid-cols-1 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Start Date & Time *
                            </label>
                            <input
                              type="datetime-local"
                              name="start_date"
                              value={formData.start_date}
                              onChange={handleInputChange}
                              required
                              min={new Date().toISOString().slice(0, 16)}
                              className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-colors"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              End Date & Time *
                            </label>
                            <input
                              type="datetime-local"
                              name="end_date"
                              value={formData.end_date}
                              onChange={handleInputChange}
                              required
                              min={formData.start_date || new Date().toISOString().slice(0, 16)}
                              className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-colors"
                            />
                          </div>
                        </div>

                        {formData.eventType !== 'virtual' && (
                          <>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Location *
                              </label>
                              <div className="space-y-2">
                                <input
                                  type="text"
                                  name="location"
                                  value={formData.location}
                                  onChange={handleInputChange}
                                  required={formData.eventType !== 'virtual'}
                                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-colors"
                                  placeholder="Event location"
                                  readOnly
                                />
                                <button
                                  type="button"
                                  onClick={() => setShowLocationPicker(true)}
                                  className="w-full flex items-center justify-center space-x-2 bg-blue-500 text-white px-4 py-3 rounded-xl font-medium hover:bg-blue-600 transition-colors"
                                >
                                  <MapPin className="w-4 h-4" />
                                  <span>Choose Location on Map</span>
                                </button>
                              </div>
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Venue Name
                              </label>
                              <input
                                type="text"
                                name="venue_name"
                                value={formData.venue_name}
                                onChange={handleInputChange}
                                maxLength={200}
                                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-colors"
                                placeholder="Venue or building name"
                              />
                            </div>
                          </>
                        )}

                        {formData.eventType === 'virtual' && (
                          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                            <h4 className="font-medium text-blue-900 mb-2">Virtual Event</h4>
                            <p className="text-blue-700 text-sm">
                              This is a virtual event. You can add meeting links and instructions in the description or after creating the event.
                            </p>
                          </div>
                        )}
                      </div>

                      <div className="space-y-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Event Image
                          </label>
                          
                          {croppedImagePreview ? (
                            <div className="space-y-4">
                              <div className="relative">
                                <img
                                  src={croppedImagePreview}
                                  alt="Event preview"
                                  className="w-full h-48 object-cover rounded-xl border border-gray-200"
                                />
                                <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 hover:opacity-100 transition-opacity rounded-xl flex items-center justify-center">
                                  <button
                                    type="button"
                                    onClick={() => setShowImageCropper(true)}
                                    className="bg-white text-gray-900 px-4 py-2 rounded-lg font-medium hover:bg-gray-100 transition-colors"
                                  >
                                    Change Image
                                  </button>
                                </div>
                              </div>
                              <p className="text-sm text-gray-600 text-center">
                                Image uploaded and cropped to slideshow format (16:9)
                              </p>
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() => setShowImageCropper(true)}
                              className="w-full h-48 border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center text-gray-500 hover:border-purple-400 hover:text-purple-500 transition-colors"
                            >
                              <ImageIcon className="w-12 h-12 mb-2" />
                              <span className="font-medium">Upload Event Image</span>
                              <span className="text-sm">Click to select, crop, and upload</span>
                            </button>
                          )}
                        </div>

                        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                          <h4 className="font-medium text-blue-900 mb-2">Image Guidelines</h4>
                          <ul className="text-blue-700 text-sm space-y-1">
                            <li>• Images are validated and stored securely</li>
                            <li>• Automatically cropped to 16:9 aspect ratio</li>
                            <li>• Supported formats: JPG, PNG, GIF, WebP</li>
                            <li>• Maximum file size: 10MB</li>
                          </ul>
                        </div>

                        {formData.locationCoords && (
                          <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                            <h4 className="font-medium text-green-900 mb-2">Location Validated</h4>
                            <p className="text-green-700 text-sm">{formData.location}</p>
                            <p className="text-green-600 text-xs mt-1">
                              Coordinates: {formData.locationCoords.lat.toFixed(6)}, {formData.locationCoords.lng.toFixed(6)}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 3: Review & Publish */}
                {step === 3 && (
                  <div className="space-y-8">
                    <div className="text-center mb-8">
                      <Eye className="w-12 h-12 text-purple-600 mx-auto mb-4" />
                      <h3 className="text-2xl font-bold text-purple-800 mb-2">Review Your Event</h3>
                      <p className="text-gray-600">Everything looks good? Let's create your event!</p>
                    </div>

                    <div className="bg-gray-50 rounded-2xl p-6">
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <div className="space-y-4">
                          <div>
                            <h4 className="font-semibold text-gray-900 mb-2">Event Details</h4>
                            <div className="space-y-2 text-sm">
                              <p><span className="font-medium">Title:</span> {formData.title}</p>
                              <p><span className="font-medium">Category:</span> {formData.category}</p>
                              <p><span className="font-medium">Type:</span> {eventTypes.find(t => t.value === formData.eventType)?.label}</p>
                              <p><span className="font-medium">Capacity:</span> {formData.capacity} people</p>
                              <p><span className="font-medium">Price:</span> {formData.price === 0 ? 'Free' : `$${formData.price}`}</p>
                            </div>
                          </div>

                          <div>
                            <h4 className="font-semibold text-gray-900 mb-2">Date & Time</h4>
                            <div className="space-y-2 text-sm">
                              <p><span className="font-medium">Start:</span> {new Date(formData.start_date).toLocaleString()}</p>
                              <p><span className="font-medium">End:</span> {new Date(formData.end_date).toLocaleString()}</p>
                            </div>
                          </div>

                          {formData.eventType !== 'virtual' && (
                            <div>
                              <h4 className="font-semibold text-gray-900 mb-2">Location</h4>
                              <div className="space-y-2 text-sm">
                                <p>{formData.location}</p>
                                {formData.venue_name && <p><span className="font-medium">Venue:</span> {formData.venue_name}</p>}
                              </div>
                            </div>
                          )}
                        </div>

                        <div className="space-y-4">
                          {formData.description && (
                            <div>
                              <h4 className="font-semibold text-gray-900 mb-2">Description</h4>
                              <p className="text-sm text-gray-700 line-clamp-4">{formData.description}</p>
                            </div>
                          )}

                          {croppedImagePreview && (
                            <div>
                              <h4 className="font-semibold text-gray-900 mb-2">Event Image</h4>
                              <img
                                src={croppedImagePreview}
                                alt="Event preview"
                                className="w-full h-32 object-cover rounded-lg border border-gray-200"
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Navigation Buttons */}
                <div className="flex justify-between items-center mt-8 pt-6 border-t border-gray-200">
                  <div className="flex space-x-4">
                    {step > 1 && (
                      <button
                        type="button"
                        onClick={prevStep}
                        className="flex items-center space-x-2 px-6 py-3 border border-gray-300 rounded-xl text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                      >
                        <ArrowLeft className="w-4 h-4" />
                        <span>Previous</span>
                      </button>
                    )}
                  </div>

                  <div className="flex space-x-4">
                    {step < 3 ? (
                      <button
                        type="button"
                        onClick={nextStep}
                        className="flex items-center space-x-2 px-8 py-3 bg-gradient-to-r from-purple-500 to-purple-700 text-white rounded-xl font-semibold hover:shadow-lg transition-all duration-300 transform hover:scale-105"
                      >
                        <span>Next Step</span>
                        <ArrowLeft className="w-4 h-4 rotate-180" />
                      </button>
                    ) : (
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="flex items-center space-x-2 px-8 py-3 bg-gradient-to-r from-purple-500 to-purple-700 text-white rounded-xl font-semibold hover:shadow-lg transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                      >
                        {isSubmitting ? (
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                          <>
                            <Save className="w-5 h-5" />
                            <span>Create Event</span>
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              </form>
            )}
          </div>
        </div>

        {/* Image Cropper Modal */}
        {showImageCropper && organizer && (
          <ImageCropper
            onImageCropped={handleImageCropped}
            onClose={() => setShowImageCropper(false)}
            aspectRatio={16 / 9}
            organizerId={organizer.id}
          />
        )}

        {/* Location Picker Modal */}
        {showLocationPicker && (
          <LocationPicker
            onLocationSelected={handleLocationSelected}
            onClose={() => setShowLocationPicker(false)}
            initialLocation={formData.location}
          />
        )}
      </div>

      <Footer />

      <style>{`
        @keyframes fade-in-up {
          0% { opacity: 0; transform: translateY(40px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-up { animation: fade-in-up 1.2s cubic-bezier(.4,0,.2,1) both; }
        .animate-float-slow { animation: float-slow 7s ease-in-out infinite alternate; }
        .animate-float-slow2 { animation: float-slow2 9s ease-in-out infinite alternate; }
        @keyframes float-slow { 0% { transform: translateY(0); } 100% { transform: translateY(-30px); } }
        @keyframes float-slow2 { 0% { transform: translateY(0); } 100% { transform: translateY(30px); } }
        .line-clamp-4 {
          display: -webkit-box;
          -webkit-line-clamp: 4;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </>
  );
};

export default CreateEventPage;