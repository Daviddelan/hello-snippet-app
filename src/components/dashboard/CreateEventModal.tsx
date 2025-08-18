import React, { useState } from 'react';
import { 
  X, 
  Calendar, 
  MapPin, 
  Users, 
  DollarSign, 
  Clock,
  Save,
  AlertCircle,
  CheckCircle,
  Upload,
  Image as ImageIcon
} from 'lucide-react';
import { EventService } from '../../services/eventService';
import { ValidationService } from '../../services/validationService';
import ImageCropper from './ImageCropper';
import LocationPicker from './LocationPicker';
import type { CreateEventData } from '../../lib/supabase';

interface CreateEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  organizerId: string;
  onEventCreated: () => void;
}

const CreateEventModal: React.FC<CreateEventModalProps> = ({
  isOpen,
  onClose,
  organizerId,
  onEventCreated
}) => {
  const [formData, setFormData] = useState<CreateEventData & { 
    locationCoords?: { lat: number; lng: number } 
  }>({
    title: '',
    description: '',
    start_date: '',
    end_date: '',
    location: '',
    venue_name: '',
    capacity: 100,
    price: 0,
    currency: 'USD',
    category: 'Other',
    image_url: ''
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
    // Validate the location
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
    
    // Clear any previous location errors
    if (submitStatus.type === 'error' && submitStatus.message.includes('location')) {
      setSubmitStatus({ type: null, message: '' });
    }
  };

  const validateForm = (): { isValid: boolean; errors: string[]; warnings: string[] } => {
    // Use the comprehensive validation service
    const validation = ValidationService.validateEventData(formData);
    
    // Additional location validation if coordinates are provided
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

    // Image URL validation
    if (formData.image_url && !ValidationService.validateImageUrl(formData.image_url)) {
      validation.errors.push('Invalid or untrusted image URL');
    }

    return validation;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const validation = validateForm();
    
    if (!validation.isValid) {
      setSubmitStatus({
        type: 'error',
        message: validation.errors.join('; ')
      });
      return;
    }

    // Show warnings if any
    if (validation.warnings.length > 0) {
      setValidationWarnings(validation.warnings);
    }

    setIsSubmitting(true);
    setSubmitStatus({ type: null, message: '' });

    try {
      // Sanitize the event data before submission
      const sanitizedData = ValidationService.sanitizeEventData(formData);
      
      // Remove locationCoords as it's not part of the database schema
      const { locationCoords, ...eventData } = sanitizedData;
      
      const result = await EventService.createEvent(organizerId, eventData);

      if (result.success) {
        setSubmitStatus({
          type: 'success',
          message: result.message || 'Event created successfully!'
        });

        // Reset form
        setFormData({
          title: '',
          description: '',
          start_date: '',
          end_date: '',
          location: '',
          venue_name: '',
          capacity: 100,
          price: 0,
          currency: 'USD',
          category: 'Other',
          image_url: ''
        });
        setCroppedImagePreview('');
        setValidationWarnings([]);

        // Notify parent and close modal after delay
        setTimeout(() => {
          onEventCreated();
          onClose();
          setSubmitStatus({ type: null, message: '' });
        }, 2000);

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

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 z-50 overflow-y-auto">
        <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={onClose}></div>
          
          <div className="inline-block align-bottom bg-white rounded-3xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-5xl sm:w-full">
            {/* Header */}
            <div className="bg-gradient-to-r from-primary-500 to-secondary-500 px-6 py-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold text-white flex items-center">
                  <Calendar className="w-6 h-6 mr-2" />
                  Create New Event
                </h3>
                <button
                  onClick={onClose}
                  className="text-white hover:text-gray-200 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            {/* Status Messages */}
            {submitStatus.type && (
              <div className={`mx-6 mt-4 p-4 rounded-2xl border ${
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
              <div className="mx-6 mt-4 p-4 rounded-2xl border bg-yellow-50 border-yellow-200">
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

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column - Basic Information */}
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
                      className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-colors"
                      placeholder="Enter event title"
                    />
                    <p className="text-xs text-gray-500 mt-1">{formData.title.length}/200 characters</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description
                    </label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      rows={4}
                      maxLength={5000}
                      className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-colors"
                      placeholder="Describe your event"
                    />
                    <p className="text-xs text-gray-500 mt-1">{formData.description.length}/5000 characters</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Category *
                    </label>
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-colors"
                    >
                      {categories.map(category => (
                        <option key={category} value={category}>{category}</option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                        className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-colors"
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
                        className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-colors"
                      />
                    </div>
                  </div>
                </div>

                {/* Middle Column - Date & Location */}
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
                        className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-colors"
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
                        className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-colors"
                      />
                    </div>
                  </div>

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
                        required
                        className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-colors"
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
                      className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-colors"
                      placeholder="Venue or building name"
                    />
                  </div>
                </div>

                {/* Right Column - Image Upload */}
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
                        className="w-full h-48 border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center text-gray-500 hover:border-primary-400 hover:text-primary-500 transition-colors"
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

              {/* Submit Button */}
              <div className="flex justify-end space-x-4 mt-8 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-6 py-3 border border-gray-300 rounded-xl text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-8 py-3 bg-gradient-to-r from-primary-500 to-secondary-500 text-white rounded-xl font-semibold hover:shadow-lg transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center space-x-2"
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
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Image Cropper Modal */}
      {showImageCropper && (
        <ImageCropper
          onImageCropped={handleImageCropped}
          onClose={() => setShowImageCropper(false)}
          aspectRatio={16 / 9}
          organizerId={organizerId}
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
    </>
  );
};

export default CreateEventModal;