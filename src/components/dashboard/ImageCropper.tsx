import React, { useState, useRef, useCallback } from 'react';
import ReactCrop, { Crop, PixelCrop, centerCrop, makeAspectCrop } from 'react-image-crop';
import { Upload, Crop as CropIcon, Check, X, RotateCcw, AlertCircle } from 'lucide-react';
import { StorageService } from '../../services/storageService';
import 'react-image-crop/dist/ReactCrop.css';

interface ImageCropperProps {
  onImageCropped: (croppedImageUrl: string) => void;
  onClose: () => void;
  aspectRatio?: number;
  organizerId: string;
  eventId?: string;
}

const ImageCropper: React.FC<ImageCropperProps> = ({ 
  onImageCropped, 
  onClose, 
  aspectRatio = 16 / 9,
  organizerId,
  eventId
}) => {
  const [imgSrc, setImgSrc] = useState<string>('');
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
  const [isProcessing, setIsProcessing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string>('');
  const [validationInfo, setValidationInfo] = useState<any>(null);
  
  const imgRef = useRef<HTMLImageElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const onSelectFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setError('');
      
      // Validate the image before processing
      const validation = await StorageService.validateImage(file);
      
      if (!validation.isValid) {
        setError(validation.error || 'Invalid image file');
        return;
      }
      
      setValidationInfo(validation.metadata);
      
      const reader = new FileReader();
      reader.addEventListener('load', () => {
        setImgSrc(reader.result?.toString() || '');
      });
      reader.readAsDataURL(file);
    }
  };

  const onImageLoad = useCallback((e: React.SyntheticEvent<HTMLImageElement>) => {
    const { width, height } = e.currentTarget;
    
    const crop = centerCrop(
      makeAspectCrop(
        {
          unit: '%',
          width: 90,
        },
        aspectRatio,
        width,
        height,
      ),
      width,
      height,
    );
    
    setCrop(crop);
  }, [aspectRatio]);

  const getCroppedImg = useCallback(async () => {
    if (!completedCrop || !imgRef.current || !canvasRef.current) {
      return;
    }

    setIsProcessing(true);
    setError('');

    try {
      const image = imgRef.current;
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        throw new Error('Failed to get canvas context');
      }

      const scaleX = image.naturalWidth / image.width;
      const scaleY = image.naturalHeight / image.height;

      canvas.width = completedCrop.width;
      canvas.height = completedCrop.height;

      ctx.drawImage(
        image,
        completedCrop.x * scaleX,
        completedCrop.y * scaleY,
        completedCrop.width * scaleX,
        completedCrop.height * scaleY,
        0,
        0,
        completedCrop.width,
        completedCrop.height,
      );

      // Convert canvas to blob
      canvas.toBlob(async (blob) => {
        if (!blob) {
          setError('Failed to create image blob');
          setIsProcessing(false);
          return;
        }

        setIsUploading(true);

        try {
          // Upload the cropped image to Supabase storage
          const uploadResult = await StorageService.uploadCroppedImage(
            blob,
            organizerId,
            eventId
          );

          if (uploadResult.success && uploadResult.url) {
            onImageCropped(uploadResult.url);
          } else {
            setError(uploadResult.error || 'Failed to upload image');
          }
        } catch (uploadError) {
          console.error('Upload error:', uploadError);
          setError('Failed to upload image to storage');
        } finally {
          setIsUploading(false);
          setIsProcessing(false);
        }
      }, 'image/jpeg', 0.9);

    } catch (error) {
      console.error('Crop error:', error);
      setError('Failed to process image');
      setIsProcessing(false);
    }
  }, [completedCrop, onImageCropped, organizerId, eventId]);

  const resetCrop = () => {
    if (imgRef.current) {
      const { width, height } = imgRef.current;
      const newCrop = centerCrop(
        makeAspectCrop(
          {
            unit: '%',
            width: 90,
          },
          aspectRatio,
          width,
          height,
        ),
        width,
        height,
      );
      setCrop(newCrop);
    }
  };

  const resetAll = () => {
    setImgSrc('');
    setCrop(undefined);
    setCompletedCrop(undefined);
    setError('');
    setValidationInfo(null);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={onClose}></div>
        
        <div className="inline-block align-bottom bg-white rounded-3xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
          {/* Header */}
          <div className="bg-gradient-to-r from-primary-500 to-secondary-500 px-6 py-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-semibold text-white flex items-center">
                <CropIcon className="w-6 h-6 mr-2" />
                Crop & Upload Event Image
              </h3>
              <button
                onClick={onClose}
                className="text-white hover:text-gray-200 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>

          <div className="p-6">
            {/* Error Display */}
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
                <div className="flex items-center space-x-2">
                  <AlertCircle className="w-5 h-5 text-red-500" />
                  <span className="text-red-800 font-medium">{error}</span>
                </div>
              </div>
            )}

            {!imgSrc ? (
              /* File Upload */
              <div className="border-2 border-dashed border-gray-300 rounded-2xl p-12 text-center hover:border-primary-400 transition-colors">
                <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Upload Event Image</h3>
                <p className="text-gray-600 mb-4">
                  Choose an image for your event. It will be validated, cropped, and uploaded to secure storage.
                </p>
                <label className="inline-flex items-center bg-primary-500 text-white px-6 py-3 rounded-xl font-medium hover:bg-primary-600 transition-colors cursor-pointer">
                  <Upload className="w-5 h-5 mr-2" />
                  Select Image
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/gif,image/webp"
                    onChange={onSelectFile}
                    className="hidden"
                  />
                </label>
                <div className="mt-4 text-sm text-gray-500 space-y-1">
                  <p>• Supported formats: JPG, PNG, GIF, WebP</p>
                  <p>• Maximum size: 10MB</p>
                  <p>• Minimum dimensions: 400x300px</p>
                  <p>• Will be cropped to 16:9 aspect ratio</p>
                </div>
              </div>
            ) : (
              /* Image Cropping */
              <div className="space-y-6">
                <div className="text-center">
                  <h4 className="text-lg font-medium text-gray-900 mb-2">Crop Your Image</h4>
                  <p className="text-gray-600">
                    Adjust the crop area to fit the slideshow format (16:9 aspect ratio)
                  </p>
                </div>

                {/* Image Validation Info */}
                {validationInfo && (
                  <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                    <h5 className="font-medium text-green-900 mb-2">Image Validated Successfully</h5>
                    <div className="text-green-700 text-sm grid grid-cols-2 gap-2">
                      <span>Dimensions: {validationInfo.width}x{validationInfo.height}px</span>
                      <span>Size: {(validationInfo.size / (1024 * 1024)).toFixed(2)}MB</span>
                      <span>Type: {validationInfo.type}</span>
                    </div>
                  </div>
                )}

                <div className="flex justify-center">
                  <div className="max-w-full max-h-96 overflow-auto border border-gray-200 rounded-xl">
                    <ReactCrop
                      crop={crop}
                      onChange={(_, percentCrop) => setCrop(percentCrop)}
                      onComplete={(c) => setCompletedCrop(c)}
                      aspect={aspectRatio}
                      minWidth={100}
                      minHeight={100}
                    >
                      <img
                        ref={imgRef}
                        alt="Crop me"
                        src={imgSrc}
                        onLoad={onImageLoad}
                        className="max-w-full h-auto"
                      />
                    </ReactCrop>
                  </div>
                </div>

                {/* Preview */}
                {completedCrop && (
                  <div className="text-center">
                    <h5 className="text-sm font-medium text-gray-700 mb-2">Preview</h5>
                    <div className="inline-block border border-gray-200 rounded-lg overflow-hidden">
                      <canvas
                        ref={canvasRef}
                        className="max-w-xs h-auto"
                        style={{
                          width: Math.min(300, completedCrop.width),
                          height: Math.min(300, completedCrop.height),
                        }}
                      />
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex justify-center space-x-4">
                  <button
                    onClick={resetCrop}
                    disabled={isProcessing || isUploading}
                    className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-xl text-gray-700 font-medium hover:bg-gray-50 transition-colors disabled:opacity-50"
                  >
                    <RotateCcw className="w-4 h-4" />
                    <span>Reset Crop</span>
                  </button>
                  <button
                    onClick={resetAll}
                    disabled={isProcessing || isUploading}
                    className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-xl text-gray-700 font-medium hover:bg-gray-50 transition-colors disabled:opacity-50"
                  >
                    <Upload className="w-4 h-4" />
                    <span>Choose Different Image</span>
                  </button>
                  <button
                    onClick={getCroppedImg}
                    disabled={!completedCrop || isProcessing || isUploading}
                    className="flex items-center space-x-2 px-6 py-2 bg-primary-500 text-white rounded-xl font-medium hover:bg-primary-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isProcessing || isUploading ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Check className="w-4 h-4" />
                    )}
                    <span>
                      {isUploading ? 'Uploading...' : isProcessing ? 'Processing...' : 'Crop & Upload'}
                    </span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImageCropper;