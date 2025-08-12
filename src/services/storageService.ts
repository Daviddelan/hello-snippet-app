import { supabase } from '../lib/supabase';

export interface UploadResult {
  success: boolean;
  url?: string;
  error?: string;
  path?: string;
}

export class StorageService {
  private static readonly BUCKET_NAME = 'event-images';

  /**
   * Check if bucket exists and is properly configured
   */
  static async checkBucketStatus() {
    try {
      console.log('🔍 StorageService: Checking bucket status...');
      
      // Try to list files in the bucket to test access
      const { data, error } = await supabase.storage
        .from(this.BUCKET_NAME)
        .list('', { limit: 1 });

      if (error) {
        console.error('❌ StorageService: Bucket check failed:', error);
        
        if (error.message.includes('not found')) {
          return {
            exists: false,
            error: 'Bucket does not exist',
            needsCreation: true
          };
        } else if (error.message.includes('permission') || error.message.includes('policy')) {
          return {
            exists: true,
            error: 'Bucket exists but lacks proper permissions',
            needsPermissions: true
          };
        } else {
          return {
            exists: false,
            error: error.message,
            needsCreation: true
          };
        }
      }

      console.log('✅ StorageService: Bucket is accessible');
      return {
        exists: true,
        error: null,
        needsCreation: false,
        needsPermissions: false
      };

    } catch (error) {
      console.error('❌ StorageService: Unexpected error checking bucket:', error);
      return {
        exists: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        needsCreation: true
      };
    }
  }

  /**
   * Initialize bucket with proper policies (if needed)
   */
  static async initializeBucket() {
    try {
      console.log('🚀 StorageService: Initializing bucket...');
      
      // First check if bucket exists
      const bucketStatus = await this.checkBucketStatus();
      
      if (bucketStatus.exists && !bucketStatus.needsPermissions) {
        console.log('✅ StorageService: Bucket already properly configured');
        return { success: true };
      }

      if (bucketStatus.needsPermissions) {
        return {
          success: false,
          error: 'Bucket exists but needs proper RLS policies. Please check Supabase dashboard → Storage → event-images → Policies',
          instructions: [
            '1. Go to Supabase Dashboard → Storage',
            '2. Click on "event-images" bucket',
            '3. Go to "Policies" tab',
            '4. Add policy: "Allow authenticated users to upload" with operation INSERT',
            '5. Add policy: "Allow public read access" with operation SELECT'
          ]
        };
      }

      // Try to create bucket if it doesn't exist
      console.log('🔨 StorageService: Creating bucket...');
      const { data: bucketData, error: bucketError } = await supabase.storage
        .createBucket(this.BUCKET_NAME, {
          public: true,
          allowedMimeTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
          fileSizeLimit: 10485760 // 10MB
        });

      if (bucketError) {
        console.error('❌ StorageService: Bucket creation failed:', bucketError);
        return {
          success: false,
          error: `Failed to create bucket: ${bucketError.message}`,
          instructions: [
            '1. Go to Supabase Dashboard → Storage',
            '2. Click "New bucket"',
            '3. Name: event-images',
            '4. Make it public',
            '5. Set file size limit to 10MB',
            '6. Allow image file types'
          ]
        };
      }

      console.log('✅ StorageService: Bucket created successfully');
      return { success: true };

    } catch (error) {
      console.error('❌ StorageService: Bucket initialization failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Upload image file to storage
   */
  static async uploadImage(file: File, path?: string): Promise<UploadResult> {
    try {
      console.log('📤 StorageService: Starting image upload...', {
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type
      });

      // Check bucket status first
      const bucketStatus = await this.checkBucketStatus();
      if (!bucketStatus.exists) {
        return {
          success: false,
          error: 'Storage bucket not found. Please create the "event-images" bucket in your Supabase dashboard.'
        };
      }

      // Validate file
      const validation = this.validateImageFile(file);
      if (!validation.isValid) {
        return {
          success: false,
          error: validation.error
        };
      }

      // Generate unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = path || `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;

      console.log('📁 StorageService: Uploading to path:', fileName);

      // Upload file
      const { data, error } = await supabase.storage
        .from(this.BUCKET_NAME)
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) {
        console.error('❌ StorageService: Upload failed:', error);
        
        if (error.message.includes('not found')) {
          return {
            success: false,
            error: 'Storage bucket not found. Please create the "event-images" bucket in your Supabase dashboard.'
          };
        } else if (error.message.includes('policy')) {
          return {
            success: false,
            error: 'Upload permission denied. Please check storage policies in your Supabase dashboard.'
          };
        } else {
          return {
            success: false,
            error: `Upload failed: ${error.message}`
          };
        }
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from(this.BUCKET_NAME)
        .getPublicUrl(fileName);

      console.log('✅ StorageService: Upload successful:', {
        path: data.path,
        url: urlData.publicUrl
      });

      return {
        success: true,
        url: urlData.publicUrl,
        path: data.path
      };

    } catch (error) {
      console.error('❌ StorageService: Unexpected upload error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown upload error'
      };
    }
  }

  /**
   * Delete image from storage
   */
  static async deleteImage(path: string): Promise<{ success: boolean; error?: string }> {
    try {
      console.log('🗑️ StorageService: Deleting image:', path);

      const { error } = await supabase.storage
        .from(this.BUCKET_NAME)
        .remove([path]);

      if (error) {
        console.error('❌ StorageService: Delete failed:', error);
        return {
          success: false,
          error: `Delete failed: ${error.message}`
        };
      }

      console.log('✅ StorageService: Image deleted successfully');
      return { success: true };

    } catch (error) {
      console.error('❌ StorageService: Unexpected delete error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown delete error'
      };
    }
  }

  /**
   * Validate image file before upload
   */
  static validateImageFile(file: File): { isValid: boolean; error?: string } {
    // Check file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return {
        isValid: false,
        error: 'Invalid file type. Please upload a JPEG, PNG, GIF, or WebP image.'
      };
    }

    // Check file size (10MB limit)
    const maxSize = 10 * 1024 * 1024; // 10MB in bytes
    if (file.size > maxSize) {
      return {
        isValid: false,
        error: 'File too large. Please upload an image smaller than 10MB.'
      };
    }

    return { isValid: true };
  }

  /**
   * Get public URL for a file
   */
  static getPublicUrl(path: string): string {
    const { data } = supabase.storage
      .from(this.BUCKET_NAME)
      .getPublicUrl(path);
    
    return data.publicUrl;
  }

  /**
   * List all images in the bucket
   */
  static async listImages(folder?: string) {
    try {
      const { data, error } = await supabase.storage
        .from(this.BUCKET_NAME)
        .list(folder || '', {
          limit: 100,
          offset: 0
        });

      if (error) {
        throw error;
      }

      return {
        success: true,
        files: data || []
      };
    } catch (error) {
      console.error('Error listing images:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
}