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
To set up the storage bucket manually in your Supabase dashboard:

1. Go to Storage in your Supabase dashboard
2. Click "Create a new bucket"
3. Name it: ${this.BUCKET_NAME}
4. Make it PUBLIC
5. Add these RLS policies:

Policy 1 - Allow public read access:
- Policy name: "Public read access"
- Allowed operation: SELECT
- Target roles: public
- USING expression: true

Policy 2 - Allow authenticated uploads:
- Policy name: "Authenticated uploads"
- Allowed operation: INSERT
- Target roles: authenticated
- WITH CHECK expression: true

Policy 3 - Allow authenticated updates:
- Policy name: "Authenticated updates"  
- Allowed operation: UPDATE
- Target roles: authenticated
- USING expression: true
- WITH CHECK expression: true

Policy 4 - Allow authenticated deletes:
- Policy name: "Authenticated deletes"
- Allowed operation: DELETE
- Target roles: authenticated
- USING expression: true
`;
  }

  /**
   * Detailed storage diagnostic without using listBuckets()
   */
  static async initializeBucketDetailed(): Promise<{ 
    success: boolean; 
    error?: string; 
    details?: any;
    instructions?: string;
  }> {
    try {
      console.log('🔍 DETAILED STORAGE DIAGNOSTIC STARTING...');
      console.log('='.repeat(50));
      
      // Step 1: Check Supabase configuration
      console.log('STEP 1: Testing Supabase connection...');
      console.log('- Supabase URL:', import.meta.env.VITE_SUPABASE_URL ? 'Present' : 'Missing');
      console.log('- Supabase Key:', import.meta.env.VITE_SUPABASE_ANON_KEY ? 'Present' : 'Missing');
      
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      console.log('- Auth status:', user ? `✅ Authenticated as ${user.email}` : '⚠️ Not authenticated');
      
      if (authError) {
        console.error('- Auth error:', authError);
      }
      
      // Step 2: Test bucket access directly
      console.log(`\nSTEP 2: Testing direct access to "${this.BUCKET_NAME}" bucket...`);
      const { data: files, error: bucketsError } = await supabase.storage
        .from(this.BUCKET_NAME)
        .list('', { limit: 1 });
      
      if (bucketsError) {
        console.error('❌ Cannot access bucket:', bucketsError);
        
        // Provide specific error messages based on error type
        let errorMessage = `Cannot access bucket "${this.BUCKET_NAME}": ${bucketsError.message}`;
        let instructions = this.getBucketSetupInstructions();
        
        if (bucketsError.message.includes('not found') || bucketsError.message.includes('does not exist')) {
          errorMessage = `Bucket "${this.BUCKET_NAME}" does not exist or is not accessible.`;
          instructions = `Please create the "${this.BUCKET_NAME}" bucket in your Supabase dashboard:\n\n` + instructions;
        } else if (bucketsError.message.includes('RLS') || bucketsError.message.includes('policy')) {
          errorMessage = `Bucket "${this.BUCKET_NAME}" exists but RLS policies are blocking access.`;
          instructions = `Please check your RLS policies for the storage.objects table:\n\n` + instructions;
        }
        
        return {
          success: false,
          error: errorMessage,
          details: { step: 'bucket_access', error: bucketsError },
          instructions: instructions
        };
      }
      
      console.log('✅ Successfully accessed bucket');
      console.log('📋 Files accessible:', files?.length || 0);
      
      // Step 3: Test upload permissions (only if authenticated)
      console.log('\nSTEP 3: Testing upload permissions...');
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