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
      console.log('Starting cropped image upload...', { organizerId, eventId, blobSize: blob.size });
      
      // Initialize bucket first
      const bucketInit = await this.initializeBucket();
      if (!bucketInit.success) {
        console.error('Bucket initialization failed:', bucketInit.error);
        return {
          success: false,
          error: bucketInit.error || 'Failed to initialize storage'
        };
      }
      
      // Convert blob to file for validation
      const file = new File([blob], 'cropped-image.jpg', { type: 'image/jpeg' });
      
      // Validate the cropped image
      console.log('Validating cropped image...');
      const validation = await this.validateImage(file);
      if (!validation.isValid) {
        console.error('Image validation failed:', validation.error);
        return {
          success: false,
          error: validation.error
        };
      }

      // Generate unique filename
      const fileName = `${organizerId}/${eventId || 'temp'}_cropped_${Date.now()}.jpg`;
      console.log('Uploading to path:', fileName);

      // Upload to Supabase storage
      const { data, error } = await supabase.storage
        .from(this.BUCKET_NAME)
        .upload(fileName, blob, {
          cacheControl: '3600',
          upsert: false,
          contentType: 'image/jpeg'
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

      console.log('Upload successful, getting public URL...');
      // Get public URL
      const { data: urlData } = supabase.storage
        .from(this.BUCKET_NAME)
        .getPublicUrl(data.path);

      console.log('Upload completed successfully:', urlData.publicUrl);
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
      console.log('Initializing storage bucket...');
      console.log('🔍 Environment check:');
      console.log('- Supabase URL:', import.meta.env.VITE_SUPABASE_URL ? 'Present' : 'Missing');
      console.log('- Supabase Key:', import.meta.env.VITE_SUPABASE_ANON_KEY ? 'Present' : 'Missing');
      
      // First, try to access the bucket directly
      console.log('Testing direct bucket access...');
      const { data: testFiles, error: testError } = await supabase.storage
        .from(this.BUCKET_NAME)
        .list('', { limit: 1 });
      
      if (testError) {
        console.error('❌ Direct bucket access failed:', {
          message: testError.message,
          statusCode: testError.statusCode,
          details: testError
        });
        
        // If bucket doesn't exist, try to list all buckets to see what's available
        console.log('Checking available buckets...');
        const { data: buckets, error: listBucketsError } = await supabase.storage.listBuckets();
        
        if (listBucketsError) {
          console.error('❌ Failed to list buckets:', {
            message: listBucketsError.message,
            statusCode: listBucketsError.statusCode,
            details: listBucketsError
          });
          return {
            success: false,
            error: `Storage access failed: ${listBucketsError.message}. Please check your Supabase API keys, storage permissions, and ensure you're connected to Supabase.`
          };
        }
        
        console.log('📋 Available buckets:', buckets?.map(b => ({ 
          name: b.name, 
          id: b.id, 
          public: b.public,
          created_at: b.created_at 
        })) || []);
        
        const bucketExists = buckets?.some(bucket => bucket.name === this.BUCKET_NAME);
        
        if (!bucketExists) {
          console.error(`❌ Target bucket '${this.BUCKET_NAME}' not found in available buckets`);
          return {
            success: false,
            error: `Storage bucket '${this.BUCKET_NAME}' not found. Available buckets: ${buckets?.map(b => b.name).join(', ') || 'none'}. Please verify the bucket name and ensure it exists in your Supabase dashboard.`
          };
        }
        
        console.log(`✅ Bucket '${this.BUCKET_NAME}' found in bucket list`);
        const foundBucket = buckets?.find(b => b.name === this.BUCKET_NAME);
        console.log('📋 Bucket details:', foundBucket);
        
        // Bucket exists but direct access failed - likely a permissions/RLS issue
        return {
          success: false,
          error: `Storage bucket '${this.BUCKET_NAME}' exists but access is denied. This is usually caused by missing RLS policies. Please check bucket policies in your Supabase dashboard Storage section.`
        };
      }
      
      console.log('✅ Storage bucket access successful - can list files');
      console.log('📋 Visible files:', testFiles?.length || 0);
      
      // Try a test upload to verify write permissions
      console.log('Testing upload permissions...');
      const testBlob = new Blob(['test'], { type: 'text/plain' });
      const testFileName = `test_${Date.now()}.txt`;
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from(this.BUCKET_NAME)
        .upload(testFileName, testBlob);
      
      if (uploadError) {
        console.error('❌ Upload test failed:', {
          message: uploadError.message,
          statusCode: uploadError.statusCode,
          details: uploadError
        });
        return {
          success: false,
          error: `Storage upload test failed: ${uploadError.message}. Please check bucket RLS policies and ensure authenticated users can INSERT files.`
        };
      }
      
      console.log('✅ Upload test successful:', uploadData);
      
      // Clean up test file
      const { error: deleteError } = await supabase.storage
        .from(this.BUCKET_NAME)
        .remove([testFileName]);
      
      if (deleteError) {
        console.warn('⚠️ Test file cleanup failed (not critical):', deleteError);
      } else {
        console.log('✅ Test file cleaned up successfully');
      }
      
      console.log('🎉 All storage tests passed!');
      return { success: true };

    } catch (error) {
      console.error('Bucket initialization error:', error);
      
      return {
        success: false,
        error: `Storage setup error: ${error instanceof Error ? error.message : 'Unknown error'}. Please verify your Supabase configuration and ensure you're properly connected.`
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
      console.log('🔍 Detailed bucket initialization check...');
      
      // Step 1: Check Supabase connection
      console.log('Step 1: Testing Supabase connection...');
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      console.log('Auth status:', user ? `Authenticated as ${user.email}` : 'Not authenticated');
      
      // Step 2: List all buckets
      console.log('Step 2: Listing all storage buckets...');
      const { data: buckets, error: listError } = await supabase.storage.listBuckets();
      
      if (listError) {
        return {
          success: false,
          error: `Cannot access storage: ${listError.message}`,
          details: { step: 'list_buckets', error: listError },
          instructions: 'Please check your Supabase API keys and storage permissions.'
        };
      }
      
      console.log('Available buckets:', buckets?.map(b => ({ name: b.name, public: b.public })) || []);
      
      // Step 3: Check if our bucket exists
      const targetBucket = buckets?.find(bucket => bucket.name === this.BUCKET_NAME);
      
      if (!targetBucket) {
        return {
          success: false,
          error: `Bucket '${this.BUCKET_NAME}' not found`,
          details: { 
            availableBuckets: buckets?.map(b => b.name) || [],
            targetBucket: this.BUCKET_NAME
          },
          instructions: this.getBucketSetupInstructions()
        };
      }
      
      console.log('✅ Target bucket found:', targetBucket);
      
      // Step 4: Test bucket access
      console.log('Step 4: Testing bucket file listing...');
      const { data: files, error: listFilesError } = await supabase.storage
        .from(this.BUCKET_NAME)
        .list('', { limit: 1 });
      
      if (listFilesError) {
        return {
          success: false,
          error: `Bucket access denied: ${listFilesError.message}`,
          details: { 
            step: 'list_files', 
            error: listFilesError,
            bucketInfo: targetBucket
          },
          instructions: 'Please check bucket RLS policies. The bucket exists but access is denied.'
        };
      }
      
      console.log('✅ Bucket file listing successful');
      
      // Step 5: Test upload permissions
      console.log('Step 5: Testing upload permissions...');
      const testBlob = new Blob(['test-upload'], { type: 'text/plain' });
      const testPath = `test_${Date.now()}.txt`;
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from(this.BUCKET_NAME)
        .upload(testPath, testBlob);
      
      if (uploadError) {
        
        return {
          success: false,
          error: `Upload test failed: ${uploadError.message}`,
          details: { 
            step: 'test_upload', 
            error: uploadError,
            bucketInfo: targetBucket
          },
          instructions: 'Bucket exists but uploads are not allowed. Please check upload policies.'
        };
      }
      
      // Clean up test file
      await supabase.storage
        .from(this.BUCKET_NAME)
        .remove([testPath]);
      
      console.log('✅ All storage tests passed!');
      return { 
        success: true,
        details: {
          bucketInfo: targetBucket,
          testResults: 'All tests passed'
        }
      };

    } catch (error) {
      console.error('Detailed bucket check error:', error);
      
      return {
        success: false,
        error: `Storage check failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        details: { step: 'unexpected_error', error },
        instructions: 'Please check your Supabase configuration and try again.'
      };
    }
  }
}