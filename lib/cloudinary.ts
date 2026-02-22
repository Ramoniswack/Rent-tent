// Cloudinary service for direct uploads from frontend

export interface CloudinarySignature {
  signature: string;
  timestamp: number;
  cloudName: string;
  apiKey: string;
  uploadParams: {
    folder: string;
    resource_type: string;
    allowed_formats: string;
    max_file_size: number;
    context: string;
    tags: string;
  };
}

export interface CloudinaryUploadResponse {
  public_id: string;
  secure_url: string;
  url: string;
  format: string;
  resource_type: string;
  bytes: number;
  width: number;
  height: number;
  created_at: string;
  etag: string;
  version: number;
  version_id: string;
  signature: string;
  tags: string[];
  folder: string;
  context?: {
    custom?: {
      user_id?: string;
    };
  };
}

export interface CloudinaryError {
  message: string;
  name: string;
  http_code: number;
}

/**
 * Uploads an image directly to Cloudinary using signed upload
 */
export async function uploadImageToCloudinary(
  file: File,
  onProgress?: (progress: number) => void
): Promise<CloudinaryUploadResponse> {
  try {
    // Step 1: Get signature from backend
    const signatureResponse = await fetch('/api/messages/cloudinary-sign', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json',
      },
    });

    if (!signatureResponse.ok) {
      throw new Error('Failed to get upload signature');
    }

    const signatureData: CloudinarySignature = await signatureResponse.json();

    // Step 2: Prepare form data for Cloudinary
    const formData = new FormData();
    formData.append('file', file);
    formData.append('signature', signatureData.signature);
    formData.append('timestamp', signatureData.timestamp.toString());
    formData.append('api_key', signatureData.apiKey);
    
    // Add upload parameters
    Object.entries(signatureData.uploadParams).forEach(([key, value]) => {
      formData.append(key, value.toString());
    });

    // Step 3: Upload directly to Cloudinary
    const uploadUrl = `https://api.cloudinary.com/v1_1/${signatureData.cloudName}/image/upload`;
    
    const uploadResponse = await fetch(uploadUrl, {
      method: 'POST',
      body: formData,
    });

    if (!uploadResponse.ok) {
      const errorData = await uploadResponse.json();
      throw new Error(errorData.error?.message || 'Upload failed');
    }

    const uploadResult: CloudinaryUploadResponse = await uploadResponse.json();
    return uploadResult;

  } catch (error) {
    console.error('Cloudinary upload error:', error);
    throw error;
  }
}

/**
 * Uploads an image with progress tracking using XMLHttpRequest
 */
export function uploadImageWithProgress(
  file: File,
  onProgress?: (progress: number) => void,
  onSuccess?: (result: CloudinaryUploadResponse) => void,
  onError?: (error: Error) => void
): Promise<CloudinaryUploadResponse> {
  return new Promise(async (resolve, reject) => {
    try {
      // Get signature from backend
      const signatureResponse = await fetch('/api/messages/cloudinary-sign', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
      });

      if (!signatureResponse.ok) {
        throw new Error('Failed to get upload signature');
      }

      const signatureData: CloudinarySignature = await signatureResponse.json();

      // Prepare form data
      const formData = new FormData();
      formData.append('file', file);
      formData.append('signature', signatureData.signature);
      formData.append('timestamp', signatureData.timestamp.toString());
      formData.append('api_key', signatureData.apiKey);
      
      Object.entries(signatureData.uploadParams).forEach(([key, value]) => {
        formData.append(key, value.toString());
      });

      // Create XMLHttpRequest for progress tracking
      const xhr = new XMLHttpRequest();
      const uploadUrl = `https://api.cloudinary.com/v1_1/${signatureData.cloudName}/image/upload`;

      // Track upload progress
      xhr.upload.addEventListener('progress', (event) => {
        if (event.lengthComputable) {
          const progress = Math.round((event.loaded / event.total) * 100);
          onProgress?.(progress);
        }
      });

      // Handle completion
      xhr.addEventListener('load', () => {
        if (xhr.status === 200) {
          try {
            const result: CloudinaryUploadResponse = JSON.parse(xhr.responseText);
            onSuccess?.(result);
            resolve(result);
          } catch (parseError) {
            const error = new Error('Failed to parse upload response');
            onError?.(error);
            reject(error);
          }
        } else {
          try {
            const errorData = JSON.parse(xhr.responseText);
            const error = new Error(errorData.error?.message || 'Upload failed');
            onError?.(error);
            reject(error);
          } catch (parseError) {
            const error = new Error(`Upload failed with status ${xhr.status}`);
            onError?.(error);
            reject(error);
          }
        }
      });

      // Handle errors
      xhr.addEventListener('error', () => {
        const error = new Error('Network error during upload');
        onError?.(error);
        reject(error);
      });

      // Handle abort
      xhr.addEventListener('abort', () => {
        const error = new Error('Upload was aborted');
        onError?.(error);
        reject(error);
      });

      // Start upload
      xhr.open('POST', uploadUrl);
      xhr.send(formData);

    } catch (error) {
      const uploadError = error instanceof Error ? error : new Error('Unknown error');
      onError?.(uploadError);
      reject(uploadError);
    }
  });
}

/**
 * Validates image file before upload
 */
export function validateImageFile(file: File): { valid: boolean; error?: string } {
  // Check file type
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: 'Invalid file type. Please select a JPEG, PNG, GIF, or WebP image.'
    };
  }

  // Check file size (10MB limit)
  const maxSize = 10 * 1024 * 1024; // 10MB in bytes
  if (file.size > maxSize) {
    return {
      valid: false,
      error: 'File size too large. Please select an image smaller than 10MB.'
    };
  }

  return { valid: true };
}

/**
 * Generates a thumbnail URL from Cloudinary public_id
 */
export function generateThumbnailUrl(
  publicId: string,
  cloudName: string,
  options: {
    width?: number;
    height?: number;
    crop?: 'fill' | 'fit' | 'scale' | 'crop' | 'thumb';
    quality?: 'auto' | number;
    format?: 'auto' | 'jpg' | 'png' | 'webp';
  } = {}
): string {
  const {
    width = 300,
    height = 300,
    crop = 'fill',
    quality = 'auto',
    format = 'auto'
  } = options;

  const transformations = [
    `w_${width}`,
    `h_${height}`,
    `c_${crop}`,
    `q_${quality}`,
    `f_${format}`
  ].join(',');

  return `https://res.cloudinary.com/${cloudName}/image/upload/${transformations}/${publicId}`;
}

/**
 * Generates optimized image URL from Cloudinary public_id
 */
export function generateOptimizedImageUrl(
  publicId: string,
  cloudName: string,
  options: {
    width?: number;
    quality?: 'auto' | number;
    format?: 'auto' | 'jpg' | 'png' | 'webp';
  } = {}
): string {
  const {
    width,
    quality = 'auto',
    format = 'auto'
  } = options;

  const transformations = [
    width ? `w_${width}` : null,
    `q_${quality}`,
    `f_${format}`
  ].filter(Boolean).join(',');

  return `https://res.cloudinary.com/${cloudName}/image/upload/${transformations}/${publicId}`;
}

/**
 * Deletes an image from Cloudinary (requires backend endpoint)
 */
export async function deleteImageFromCloudinary(publicId: string): Promise<void> {
  try {
    const response = await fetch('/api/messages/cloudinary-delete', {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ publicId }),
    });

    if (!response.ok) {
      throw new Error('Failed to delete image');
    }
  } catch (error) {
    console.error('Error deleting image:', error);
    throw error;
  }
}

/**
 * Compresses image file before upload (optional optimization)
 */
export function compressImage(
  file: File,
  maxWidth: number = 1920,
  maxHeight: number = 1080,
  quality: number = 0.8
): Promise<File> {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      // Calculate new dimensions
      let { width, height } = img;
      
      if (width > maxWidth || height > maxHeight) {
        const ratio = Math.min(maxWidth / width, maxHeight / height);
        width *= ratio;
        height *= ratio;
      }

      // Set canvas dimensions
      canvas.width = width;
      canvas.height = height;

      // Draw and compress
      ctx?.drawImage(img, 0, 0, width, height);
      
      canvas.toBlob(
        (blob) => {
          if (blob) {
            const compressedFile = new File([blob], file.name, {
              type: file.type,
              lastModified: Date.now(),
            });
            resolve(compressedFile);
          } else {
            reject(new Error('Failed to compress image'));
          }
        },
        file.type,
        quality
      );
    };

    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = URL.createObjectURL(file);
  });
}