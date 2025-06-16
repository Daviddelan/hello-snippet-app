export interface LocationValidationResult {
  isValid: boolean;
  error?: string;
  normalizedLocation?: {
    address: string;
    coordinates: {
      lat: number;
      lng: number;
    };
    components?: {
      street?: string;
      city?: string;
      state?: string;
      country?: string;
      postalCode?: string;
    };
  };
}

export interface EventValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export class ValidationService {
  /**
   * Validate location data
   */
  static validateLocation(location: {
    address: string;
    lat: number;
    lng: number;
  }): LocationValidationResult {
    const errors: string[] = [];

    // Validate address
    if (!location.address || location.address.trim().length < 5) {
      errors.push('Address must be at least 5 characters long');
    }

    // Validate coordinates
    if (typeof location.lat !== 'number' || isNaN(location.lat)) {
      errors.push('Invalid latitude coordinate');
    } else if (location.lat < -90 || location.lat > 90) {
      errors.push('Latitude must be between -90 and 90 degrees');
    }

    if (typeof location.lng !== 'number' || isNaN(location.lng)) {
      errors.push('Invalid longitude coordinate');
    } else if (location.lng < -180 || location.lng > 180) {
      errors.push('Longitude must be between -180 and 180 degrees');
    }

    // Check for suspicious coordinates (e.g., 0,0 which might indicate an error)
    if (location.lat === 0 && location.lng === 0) {
      errors.push('Invalid coordinates: location appears to be in the ocean (0,0)');
    }

    if (errors.length > 0) {
      return {
        isValid: false,
        error: errors.join('; ')
      };
    }

    return {
      isValid: true,
      normalizedLocation: {
        address: location.address.trim(),
        coordinates: {
          lat: Number(location.lat.toFixed(6)),
          lng: Number(location.lng.toFixed(6))
        }
      }
    };
  }

  /**
   * Validate event data comprehensively
   */
  static validateEventData(eventData: any): EventValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Title validation
    if (!eventData.title || eventData.title.trim().length < 3) {
      errors.push('Event title must be at least 3 characters long');
    } else if (eventData.title.length > 200) {
      errors.push('Event title must be less than 200 characters');
    }

    // Description validation
    if (eventData.description && eventData.description.length > 5000) {
      errors.push('Event description must be less than 5000 characters');
    }

    // Date validation
    const now = new Date();
    const startDate = new Date(eventData.start_date);
    const endDate = new Date(eventData.end_date);

    if (!eventData.start_date || isNaN(startDate.getTime())) {
      errors.push('Valid start date is required');
    } else if (startDate < now) {
      errors.push('Start date cannot be in the past');
    }

    if (!eventData.end_date || isNaN(endDate.getTime())) {
      errors.push('Valid end date is required');
    } else if (endDate <= startDate) {
      errors.push('End date must be after start date');
    }

    // Check if event is too far in the future (warning)
    const oneYearFromNow = new Date();
    oneYearFromNow.setFullYear(oneYearFromNow.getFullYear() + 1);
    if (startDate > oneYearFromNow) {
      warnings.push('Event is scheduled more than a year in advance');
    }

    // Check if event duration is reasonable
    const durationHours = (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60);
    if (durationHours > 24 * 7) { // More than a week
      warnings.push('Event duration is longer than a week');
    } else if (durationHours < 0.5) { // Less than 30 minutes
      warnings.push('Event duration is less than 30 minutes');
    }

    // Location validation
    if (!eventData.location || eventData.location.trim().length < 5) {
      errors.push('Event location must be at least 5 characters long');
    }

    // Capacity validation
    if (!eventData.capacity || eventData.capacity < 1) {
      errors.push('Event capacity must be at least 1');
    } else if (eventData.capacity > 100000) {
      warnings.push('Event capacity is very large (over 100,000)');
    }

    // Price validation
    if (eventData.price < 0) {
      errors.push('Event price cannot be negative');
    } else if (eventData.price > 10000) {
      warnings.push('Event price is very high (over $10,000)');
    }

    // Category validation
    const validCategories = [
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

    if (!eventData.category || !validCategories.includes(eventData.category)) {
      errors.push('Valid event category is required');
    }

    // Venue name validation (optional but if provided, should be reasonable)
    if (eventData.venue_name && eventData.venue_name.length > 200) {
      errors.push('Venue name must be less than 200 characters');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * Sanitize text input to prevent XSS and other issues
   */
  static sanitizeText(text: string): string {
    if (!text) return '';
    
    return text
      .trim()
      .replace(/[<>]/g, '') // Remove potential HTML tags
      .replace(/javascript:/gi, '') // Remove javascript: protocols
      .replace(/on\w+=/gi, '') // Remove event handlers
      .substring(0, 5000); // Limit length
  }

  /**
   * Validate and sanitize event data for database insertion
   */
  static sanitizeEventData(eventData: any): any {
    return {
      title: this.sanitizeText(eventData.title),
      description: this.sanitizeText(eventData.description || ''),
      start_date: eventData.start_date,
      end_date: eventData.end_date,
      location: this.sanitizeText(eventData.location),
      venue_name: this.sanitizeText(eventData.venue_name || ''),
      capacity: Math.max(1, Math.min(100000, parseInt(eventData.capacity) || 1)),
      price: Math.max(0, Math.min(100000, parseFloat(eventData.price) || 0)),
      currency: eventData.currency || 'USD',
      category: eventData.category || 'Other',
      image_url: eventData.image_url || null
    };
  }

  /**
   * Validate image URL
   */
  static validateImageUrl(url: string): boolean {
    if (!url) return true; // Image is optional
    
    try {
      const parsedUrl = new URL(url);
      
      // Check if it's from our Supabase storage or a trusted domain
      const trustedDomains = [
        'supabase.co',
        'supabase.com',
        'images.pexels.com',
        'images.unsplash.com'
      ];
      
      return trustedDomains.some(domain => parsedUrl.hostname.includes(domain));
    } catch {
      return false;
    }
  }
}