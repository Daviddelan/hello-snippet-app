import { supabase } from '../lib/supabase';

export interface UploadResult {
  success: boolean;
  url?: string;
  error?: string;
}

export interface ImageValidationResult {
  isValid: boolean;
  error?: string;
  metadata?: {
    width: number;
    height: number;
    size: number;
    type: string;
  };
}

export class StorageService {
  private static readonly BUCKET_NAME = 'event-images';
  private static readonly MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
  private static readonly ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  private static readonly MIN_WIDTH = 400;
  private static readonly MIN_HEIGHT = 300;
  private static readonly MAX_WIDTH = 4000;
  private static readonly MAX_HEIGHT = 4000;

  /**
   * Validate image file before upload
   */
  static async validateImage(file: File): Promise<ImageValidationResult> {
    try {
      // Check file type
      if (!this.ALLOWED_TYPES.includes(file.type)) {
        return {
          isValid: false,
          error: `Invalid file type. Allowed types: ${this.ALLOWED_TYPES.join(', ')}`
        };
      }

      // Check file size
      if (file.size > this.MAX_FILE_SIZE) {
        return {
          isValid: false,
          error: `File size too large. Maximum size: ${this.MAX_FILE_SIZE / (1024 * 1024)}MB`
        };
      }

      // Check image dimensions
      const dimensions = await this.getImageDimensions(file);
      
      if (dimensions.width < this.MIN_WIDTH || dimensions.height < this.MIN_HEIGHT) {
        return {
          isValid: false,
          error: `Image too small. Minimum dimensions: ${this.MIN_WIDTH}x${this.MIN_HEIGHT}px`
        };
      }

      if (dimensions.width > this.MAX_WIDTH || dimensions.height > this.MAX_HEIGHT) {
        return {
          isValid: false,
          error: `Image too large. Maximum dimensions: ${this.MAX_WIDTH}x${this.MAX_HEIGHT}px`
        };
      }

      return {
        isValid: true,
        metadata: {
          width: dimensions.width,
          height: dimensions.height,
          size: file.size,
          type: file.type
        }
      };
    } catch (error) {
      return {
        isValid: false,
        error: 'Failed to validate image'
      };
    }
  }

  /**
   * Get image dimensions from file
   */
  private static getImageDimensions(file: File): Promise<{ width: number; height: number }> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const url = URL.createObjectURL(file);
      
      img.onload = () => {
        URL.revokeObjectURL(url);
        resolve({
          width: img.naturalWidth,
          height: img.naturalHeight
        });
      };
      
      img.onerror = () => {
        URL.revokeObjectURL(url);
        reject(new Error('Failed to load image'));
      };
      
      img.src = url;
    });
  }

  /**
   * Upload image to Supabase storage
   */
  static async uploadEventImage(
    file: File, 
    organizerId: string, 
    eventId?: string
  ): Promise<UploadResult> {
    try {
      // Validate image first
      const validation = await this.validateImage(file);
      if (!validation.isValid) {
        return {
          success: false,
          error: validation.error
        };
      }

      // Generate unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `${organizerId}/${eventId || 'temp'}_${Date.now()}.${fileExt}`;

      // Upload to Supabase storage
      const { data, error } = await supabase.storage
        .from(this.BUCKET_NAME)
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) {
        console.error('Storage upload error:', error);
        return {
          success: false,
          error: `Upload failed: ${error.message}`
        };
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from(this.BUCKET_NAME)
        .getPublicUrl(data.path);

      return {
        success: true,
        url: urlData.publicUrl
      };

    } catch (error) {
      console.error('Upload error:', error);
      return {
        success: false,
        error: 'An unexpected error occurred during upload'
      };
    }
  }

  /**
   * Upload cropped image blob to storage
   */
  static async uploadCroppedImage(
    blob: Blob,
    organizerId: string,
    eventId?: string
  ): Promise<UploadResult> {
    try {
      // Convert blob to file for validation
      const file = new File([blob], 'cropped-image.jpg', { type: 'image/jpeg' });
      
      // Validate the cropped image
      const validation = await this.validateImage(file);
      if (!validation.isValid) {
        return {
          success: false,
          error: validation.error
        };
      }

      // Generate unique filename
      const fileName = `${organizerId}/${eventId || 'temp'}_cropped_${Date.now()}.jpg`;

      // Upload to Supabase storage
      const { data, error } = await supabase.storage
        .from(this.BUCKET_NAME)
        .upload(fileName, blob, {
          cacheControl: '3600',
          upsert: false,
          contentType: 'image/jpeg'
        });

      if (error) {
        console.error('Storage upload error:', error);
        return {
          success: false,
          error: `Upload failed: ${error.message}`
        };
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from(this.BUCKET_NAME)
        .getPublicUrl(data.path);

      return {
        success: true,
        url: urlData.publicUrl
      };

    } catch (error) {
      console.error('Upload error:', error);
      return {
        success: false,
        error: 'An unexpected error occurred during upload'
      };
    }
  }

  /**
   * Delete image from storage
   */
  static async deleteEventImage(imageUrl: string): Promise<{ success: boolean; error?: string }> {
    try {
      // Extract file path from URL
      const url = new URL(imageUrl);
      const pathParts = url.pathname.split('/');
      const fileName = pathParts[pathParts.length - 1];
      const organizerId = pathParts[pathParts.length - 2];
      const filePath = `${organizerId}/${fileName}`;

      const { error } = await supabase.storage
        .from(this.BUCKET_NAME)
        .remove([filePath]);

      if (error) {
        console.error('Storage delete error:', error);
        return {
          success: false,
          error: `Delete failed: ${error.message}`
        };
      }

      return { success: true };

    } catch (error) {
      console.error('Delete error:', error);
      return {
        success: false,
        error: 'An unexpected error occurred during deletion'
      };
    }
  }

  /**
   * Initialize storage bucket (call this once during setup)
   */
  static async initializeBucket(): Promise<{ success: boolean; error?: string }> {
    try {
      // Check if bucket exists
      const { data: buckets, error: listError } = await supabase.storage.listBuckets();
      
      if (listError) {
        return {
          success: false,
          error: `Failed to list buckets: ${listError.message}`
        };
      }

      const bucketExists = buckets?.some(bucket => bucket.name === this.BUCKET_NAME);

      if (!bucketExists) {
        // Create bucket
        const { error: createError } = await supabase.storage.createBucket(this.BUCKET_NAME, {
          public: true,
          allowedMimeTypes: this.ALLOWED_TYPES,
          fileSizeLimit: this.MAX_FILE_SIZE
        });

        if (createError) {
          return {
            success: false,
            error: `Failed to create bucket: ${createError.message}`
          };
        }
      }

      return { success: true };

    } catch (error) {
      console.error('Bucket initialization error:', error);
      return {
        success: false,
        error: 'An unexpected error occurred during bucket initialization'
      };
    }
  }
}