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
      console.log('Starting event image upload...', { 
        fileName: file.name, 
        fileSize: file.size, 
        organizerId, 
        eventId 
      });
      
      // Initialize bucket first
      const bucketInit = await this.initializeBucket();
      if (!bucketInit.success) {
        return {
          success: false,
          error: bucketInit.error || 'Failed to initialize storage'
        };
      }
      
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
        console.error('Storage upload error details:', {
          message: error.message,
          statusCode: error.statusCode,
          error: error
        });
        return {
          success: false,
          error: `Upload failed: ${error.message || 'Unknown storage error'}`
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
      console.error('Unexpected upload error:', error);
      return {
        success: false,
        error: `Upload error: ${error instanceof Error ? error.message : 'Unknown error'}`
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
      console.log('🚀 Starting cropped image upload...', { organizerId, eventId, blobSize: blob.size });
      
      // Get detailed storage status first
      console.log('🔍 Running detailed storage check...');
      const detailedStatus = await this.initializeBucketDetailed();
      
      if (!detailedStatus.success) {
        console.error('❌ Storage not ready:', detailedStatus);
        return {
          success: false,
          error: detailedStatus.error || 'Storage not ready'
        };
      }
      
      console.log('✅ Storage ready, proceeding with upload...');
      
      // Convert blob to file for validation
      const file = new File([blob], 'cropped-image.jpg', { type: 'image/jpeg' });
      
      // Validate the cropped image
      console.log('🔍 Validating cropped image...');
      const validation = await this.validateImage(file);
      if (!validation.isValid) {
        console.error('❌ Image validation failed:', validation.error);
        return {
          success: false,
          error: validation.error
        };
      }

      // Generate unique filename
      const fileName = `${organizerId}/${eventId || 'temp'}_cropped_${Date.now()}.jpg`;
      console.log('📁 Uploading to path:', fileName);

      // Upload to Supabase storage
      const { data, error } = await supabase.storage
        .from(this.BUCKET_NAME)
        .upload(fileName, blob, {
          cacheControl: '3600',
          upsert: false,
          contentType: 'image/jpeg'
        });

      if (error) {
        console.error('❌ Storage upload error details:', {
          message: error.message,
          statusCode: error.statusCode,
          error: error
        });
        return {
          success: false,
          error: `Upload failed: ${error.message || 'Unknown storage error'}`
        };
      }

      console.log('✅ Upload successful, getting public URL...');
      // Get public URL
      const { data: urlData } = supabase.storage
        .from(this.BUCKET_NAME)
        .getPublicUrl(data.path);

      console.log('🎉 Upload completed successfully:', urlData.publicUrl);
      return {
        success: true,
        url: urlData.publicUrl
      };

    } catch (error) {
      console.error('❌ Unexpected upload error:', error);
      return {
        success: false,
        error: `Upload error: ${error instanceof Error ? error.message : 'Unknown error'}`
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
   * Test storage bucket access without listing buckets
   */
  static async initializeBucket(): Promise<{ success: boolean; error?: string }> {
    try {
      console.log('🔍 Testing storage bucket access...');
      
      // Test bucket access by trying to list files (this works with anon key if policies are correct)
      const { data: files, error: listError } = await supabase.storage
        .from(this.BUCKET_NAME)
        .list('', { limit: 1 });
      
      if (listError) {
        console.error('❌ Cannot access bucket:', listError);
        return {
          success: false,
          error: `Bucket access failed: ${listError.message}`
        };
      }
      
      console.log(`✅ Bucket '${this.BUCKET_NAME}' is accessible`);
      console.log('📋 Files accessible:', files?.length || 0);
      return { success: true };

    } catch (error) {
      console.error('❌ Bucket access test error:', error);
      return {
        success: false,
        error: `Bucket access test failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  /**
   * Create storage bucket with proper policies (for manual setup guidance)
   */
  static getBucketSetupInstructions(): string {
    return `
STORAGE SETUP INSTRUCTIONS:

If you're seeing bucket access errors, please verify these steps:

1. Go to Storage in your Supabase dashboard
2. Ensure bucket "${this.BUCKET_NAME}" exists and is PUBLIC
3. Go to SQL Editor and run these RLS policies:

-- Enable RLS on storage.objects (if not already enabled)
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Allow public read access
CREATE POLICY "Public read access for ${this.BUCKET_NAME}"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = '${this.BUCKET_NAME}');

-- Allow authenticated uploads
CREATE POLICY "Authenticated uploads for ${this.BUCKET_NAME}"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = '${this.BUCKET_NAME}');

-- Allow authenticated updates
CREATE POLICY "Authenticated updates for ${this.BUCKET_NAME}"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = '${this.BUCKET_NAME}')
WITH CHECK (bucket_id = '${this.BUCKET_NAME}');

-- Allow authenticated deletes
CREATE POLICY "Authenticated deletes for ${this.BUCKET_NAME}"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = '${this.BUCKET_NAME}');

4. Verify your environment variables:
   - VITE_SUPABASE_URL should point to your project
   - VITE_SUPABASE_ANON_KEY should be the anon/public key (not service role)

5. Test the setup by running the storage diagnostic in the app.
`;
  }

  /**
   * Detailed storage diagnostic using direct bucket access
   */
  static async initializeBucketDetailed(): Promise<{ 
    success: boolean; 
    error?: string; 
    details?: any;
    instructions?: string;
  }> {
    try {
      console.log('🔍 Testing storage bucket access...');
      
      // Test direct bucket access instead of listing all buckets
      const { data: files, error: bucketError } = await supabase.storage
        .from(this.BUCKET_NAME)
        .list('', { limit: 1 });
      
      if (bucketError) {
        console.error('❌ Cannot access bucket:', bucketError);
        
        let errorMessage = `Cannot access bucket "${this.BUCKET_NAME}": ${bucketError.message}`;
        let instructions = '';
        
        if (bucketError.message.includes('not found') || bucketError.message.includes('does not exist')) {
          errorMessage = `Bucket "${this.BUCKET_NAME}" does not exist or is not accessible.`;
          instructions = `Please create the "${this.BUCKET_NAME}" bucket in your Supabase dashboard and make it PUBLIC.`;
        } else if (bucketError.message.includes('RLS') || bucketError.message.includes('policy')) {
          errorMessage = `Bucket "${this.BUCKET_NAME}" exists but RLS policies are blocking access.`;
          instructions = `Please run the SQL commands in the Storage Debugger to fix your RLS policies.`;
        }
        
        return {
          success: false,
          error: errorMessage,
          details: { step: 'bucket_access', error: bucketError },
          instructions: instructions
        };
      }
      
      console.log('✅ Successfully accessed bucket');
      console.log('📋 Files accessible:', files?.length || 0);
      
      // Test upload permissions (only if authenticated)
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        console.log('🔍 Testing upload permissions...');
        const testBlob = new Blob(['test-upload'], { type: 'text/plain' });
        const testPath = `test_${Date.now()}.txt`;
        
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from(this.BUCKET_NAME)
          .upload(testPath, testBlob);
        
        if (uploadError) {
          console.error('❌ Upload test failed:', uploadError);
          return {
            success: false,
            error: `Upload test failed: ${uploadError.message}`,
            details: { 
              step: 'test_upload', 
              error: uploadError,
              authenticated: true
            },
            instructions: 'Please check your INSERT policy for storage.objects table.'
          };
        }
        
        console.log('✅ Upload test successful');
        
        // Clean up test file
        await supabase.storage
          .from(this.BUCKET_NAME)
          .remove([testPath]);
      }
      
      console.log('🎉 Storage validation complete - all tests passed!');
      
      return { 
        success: true,
        details: {
          bucketName: this.BUCKET_NAME,
          authenticated: !!user,
          filesCount: files?.length || 0
        }
      };

    } catch (error) {
      console.error('❌ Storage validation failed:', error);
      return {
        success: false,
        error: `Storage validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        details: {
          step: 'unexpected_error',
          error: error
        },
        instructions: 'Unexpected error occurred. Please check your Supabase configuration and network connection.'
      };
    }
  }
      const testBlob = new Blob(['test-upload'], { type: 'text/plain' });
      const testPath = `test_${Date.now()}.txt`;
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from(this.BUCKET_NAME)
        .upload(testPath, testBlob);
      
      if (uploadError) {
        console.error('❌ Upload test failed:', uploadError);
        
        let errorMessage = `Upload test failed: ${uploadError.message}`;
        let instructions = this.getBucketSetupInstructions();
        
        if (!user) {
          errorMessage = 'Upload test failed: User not authenticated. Please sign in to test uploads.';
          instructions = 'Please sign in to test upload functionality.';
        } else if (uploadError.message.includes('RLS') || uploadError.message.includes('policy')) {
          errorMessage = `Upload blocked by RLS policies: ${uploadError.message}`;
          instructions = 'Please check your INSERT policy for storage.objects table.';
        }
        
        return {
          success: false,
          error: errorMessage,
          details: { 
            step: 'test_upload', 
            error: uploadError,
            authenticated: !!user
          },
          instructions: instructions
        };
      }
      
      console.log('✅ Upload test successful:', uploadData);
      
      // Clean up test file
      console.log('\nSTEP 4: Cleaning up test file...');
      const { error: deleteError } = await supabase.storage
        .from(this.BUCKET_NAME)
        .remove([testPath]);
      
      if (deleteError) {
        console.warn('⚠️ Test file cleanup failed:', deleteError);
      } else {
        console.log('✅ Test file cleaned up');
      }
      
      console.log('\n' + '='.repeat(50));
      console.log('🎉 STORAGE DIAGNOSTIC COMPLETE - ALL TESTS PASSED!');
      
      return { 
        success: true,
        details: {
          testResults: 'All tests passed',
          bucketName: this.BUCKET_NAME,
          authenticated: !!user,
          filesCount: files?.length || 0
        }
      };

    } catch (error) {
      console.error('❌ DIAGNOSTIC FAILED:', error);
      return {
        success: false,
        error: `Storage diagnostic failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        details: {
          step: 'unexpected_error',
          error: error
        },
        instructions: 'Unexpected error occurred. Please check your Supabase configuration, API keys, and network connection.'
      };
    }
  }
}