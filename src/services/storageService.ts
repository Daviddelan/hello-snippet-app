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
   * Initialize storage bucket (call this once during setup)
   */
  static async initializeBucket(): Promise<{ success: boolean; error?: string }> {
    try {
      console.log('🔍 Quick storage bucket check...');
      
      // Check if bucket exists by listing buckets
      const { data: buckets, error: listError } = await supabase.storage.listBuckets();
      
      if (listError) {
        console.error('❌ Cannot list buckets (quick check):', listError);
        return {
          success: false,
          error: `Storage access failed: ${listError.message}`
        };
      }
      
      console.log('📋 Quick check - available buckets:', buckets?.map(b => b.name) || []);
      
      // Check if our bucket exists
      const bucketExists = buckets?.some(bucket => bucket.name === this.BUCKET_NAME);
      
      if (!bucketExists) {
        console.error(`❌ Quick check - bucket '${this.BUCKET_NAME}' not found`);
        return {
          success: false,
          error: `Bucket '${this.BUCKET_NAME}' not found. Available: ${buckets?.map(b => b.name).join(', ') || 'none'}`
        };
      }
      
      console.log(`✅ Quick check - bucket '${this.BUCKET_NAME}' found`);
      return { success: true };

    } catch (error) {
      console.error('❌ Quick bucket check error:', error);
      return {
        success: false,
        error: `Quick check failed: ${error instanceof Error ? error.message : 'Unknown error'}`
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
   * Alternative bucket initialization with more detailed error handling
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
      
      // Step 1: Check Supabase connection
      console.log('STEP 1: Testing Supabase connection...');
      console.log('- Supabase URL:', import.meta.env.VITE_SUPABASE_URL ? 'Present' : 'Missing');
      console.log('- Supabase Key:', import.meta.env.VITE_SUPABASE_ANON_KEY ? 'Present' : 'Missing');
      
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      console.log('- Auth status:', user ? `✅ Authenticated as ${user.email}` : '⚠️ Not authenticated');
      
      if (authError) {
        console.error('- Auth error:', authError);
      }
      
      // Step 2: List all buckets
      console.log('\nSTEP 2: Listing all storage buckets...');
      const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
      
      if (bucketsError) {
        console.error('❌ Cannot list buckets:', bucketsError);
        return {
          success: false,
          error: `Cannot access storage: ${bucketsError.message}. Please check your Supabase API keys and ensure storage is enabled.`,
          details: { step: 'list_buckets', error: bucketsError },
          instructions: 'Please check your Supabase API keys, ensure you\'re connected to Supabase, and verify storage is enabled in your project.'
        };
      }
      
      console.log('✅ Successfully listed buckets');
      console.log('📋 Available buckets:');
      buckets?.forEach((bucket, index) => {
        console.log(`  ${index + 1}. "${bucket.name}" (${bucket.public ? 'PUBLIC' : 'PRIVATE'}, ID: ${bucket.id})`);
      });
      
      // Step 3: Check target bucket
      console.log(`\nSTEP 3: Looking for target bucket "${this.BUCKET_NAME}"...`);
      const targetBucket = buckets?.find(b => b.name === this.BUCKET_NAME);
      
      if (!targetBucket) {
        console.error(`❌ Target bucket "${this.BUCKET_NAME}" not found`);
        return {
          success: false,
          error: `Bucket "${this.BUCKET_NAME}" not found. Available buckets: ${buckets?.map(b => b.name).join(', ') || 'none'}`,
          details: { 
            availableBuckets: buckets?.map(b => b.name) || [],
            targetBucket: this.BUCKET_NAME
          },
          instructions: this.getBucketSetupInstructions()
        };
      }
      
      console.log('✅ Target bucket found!');
      console.log('📋 Bucket details:', targetBucket);
      
      // Step 4: Test bucket access
      console.log('\nSTEP 4: Testing bucket access...');
      const { data: files, error: listError } = await supabase.storage
        .from(this.BUCKET_NAME)
        .list('', { limit: 1 });
      
      if (listError) {
        console.error('❌ Cannot list files in bucket:', listError);
        return {
          success: false,
          error: `Bucket access denied: ${listError.message}. Please check bucket RLS policies.`,
          details: { 
            step: 'list_files', 
            error: listError,
            bucketInfo: targetBucket
          },
          instructions: 'The bucket exists but access is denied. Please add RLS policies for SELECT, INSERT, UPDATE, and DELETE operations.'
        };
      }
      
      console.log('✅ Bucket file listing successful');
      console.log('📋 Files in bucket:', files?.length || 0);
      
      // Step 5: Test upload permissions
      console.log('\nSTEP 5: Testing upload permissions...');
      const testBlob = new Blob(['test-upload'], { type: 'text/plain' });
      const testPath = `test_${Date.now()}.txt`;
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from(this.BUCKET_NAME)
        .upload(testPath, testBlob);
      
      if (uploadError) {
        console.error('❌ Upload test failed:', uploadError);
        return {
          success: false,
          error: `Upload test failed: ${uploadError.message}. Please check INSERT policy.`,
          details: { 
            step: 'test_upload', 
            error: uploadError,
            bucketInfo: targetBucket
          },
          instructions: 'Bucket exists but uploads are not allowed. Please check upload policies.'
        };
      }
      
      console.log('✅ Upload test successful:', uploadData);
      
      // Clean up test file
      console.log('🧹 Cleaning up test file...');
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
          bucketInfo: targetBucket,
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