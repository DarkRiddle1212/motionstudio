/**
 * Upload API Client
 * Handles file uploads to the backend with progress tracking
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export interface UploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

export interface ThumbnailUploadResult {
  success: boolean;
  url: string;
  path: string;
  metadata: {
    width: number;
    height: number;
    size: number;
    format: string;
  };
}

export interface HeroImageUploadResult {
  success: boolean;
  mediaType: 'image';
  url: string;
  path: string;
  metadata: {
    width: number;
    height: number;
    size: number;
    format: string;
  };
}

export interface HeroVideoUploadResult {
  success: boolean;
  mediaType: 'video';
  videoUrl: string;
  videoPath: string;
  thumbnailUrl: string;
  thumbnailPath: string;
  metadata: {
    duration: number;
    width: number;
    height: number;
    size: number;
    format: string;
    codec?: string;
  };
}

export type HeroUploadResult = HeroImageUploadResult | HeroVideoUploadResult;

export interface GalleryImageResult {
  success: boolean;
  url?: string;
  path?: string;
  metadata?: {
    width: number;
    height: number;
    size: number;
    format: string;
  };
  error?: string;
  filename?: string;
}

export interface GalleryUploadResult {
  success: boolean;
  uploaded: number;
  failed: number;
  results: GalleryImageResult[];
}

export interface DeleteMediaResult {
  success: boolean;
  message: string;
}

/**
 * Get authentication token from localStorage
 */
function getAuthToken(): string | null {
  return localStorage.getItem('adminToken');
}

/**
 * Upload a thumbnail image
 * @param projectId - The project ID
 * @param file - The image file to upload
 * @param onProgress - Optional progress callback
 * @returns Upload result with URL and metadata
 */
export async function uploadThumbnail(
  projectId: string,
  file: File,
  onProgress?: (progress: UploadProgress) => void
): Promise<ThumbnailUploadResult> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    const formData = new FormData();
    formData.append('file', file);
    formData.append('projectId', projectId);

    // Track upload progress
    xhr.upload.addEventListener('progress', (e) => {
      if (e.lengthComputable && onProgress) {
        onProgress({
          loaded: e.loaded,
          total: e.total,
          percentage: Math.round((e.loaded / e.total) * 100),
        });
      }
    });

    // Handle completion
    xhr.addEventListener('load', () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const result = JSON.parse(xhr.responseText);
          resolve(result);
        } catch (error) {
          reject(new Error('Invalid response from server'));
        }
      } else {
        try {
          const error = JSON.parse(xhr.responseText);
          reject(new Error(error.error || error.message || 'Upload failed'));
        } catch {
          reject(new Error(`Upload failed with status ${xhr.status}`));
        }
      }
    });

    // Handle errors
    xhr.addEventListener('error', () => {
      reject(new Error('Network error during upload'));
    });

    xhr.addEventListener('abort', () => {
      reject(new Error('Upload cancelled'));
    });

    // Send request
    const token = getAuthToken();
    xhr.open('POST', `${API_BASE_URL}/admin/projects/upload/thumbnail`);
    if (token) {
      xhr.setRequestHeader('Authorization', `Bearer ${token}`);
    }
    xhr.send(formData);
  });
}

/**
 * Upload a hero image or video
 * @param projectId - The project ID
 * @param file - The image or video file to upload
 * @param onProgress - Optional progress callback
 * @returns Upload result with URL and metadata
 */
export async function uploadHero(
  projectId: string,
  file: File,
  onProgress?: (progress: UploadProgress) => void
): Promise<HeroUploadResult> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    const formData = new FormData();
    formData.append('file', file);
    formData.append('projectId', projectId);

    // Track upload progress
    xhr.upload.addEventListener('progress', (e) => {
      if (e.lengthComputable && onProgress) {
        onProgress({
          loaded: e.loaded,
          total: e.total,
          percentage: Math.round((e.loaded / e.total) * 100),
        });
      }
    });

    // Handle completion
    xhr.addEventListener('load', () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const result = JSON.parse(xhr.responseText);
          resolve(result);
        } catch (error) {
          reject(new Error('Invalid response from server'));
        }
      } else {
        try {
          const error = JSON.parse(xhr.responseText);
          reject(new Error(error.error || error.message || 'Upload failed'));
        } catch {
          reject(new Error(`Upload failed with status ${xhr.status}`));
        }
      }
    });

    // Handle errors
    xhr.addEventListener('error', () => {
      reject(new Error('Network error during upload'));
    });

    xhr.addEventListener('abort', () => {
      reject(new Error('Upload cancelled'));
    });

    // Send request
    const token = getAuthToken();
    xhr.open('POST', `${API_BASE_URL}/admin/projects/upload/hero`);
    if (token) {
      xhr.setRequestHeader('Authorization', `Bearer ${token}`);
    }
    xhr.send(formData);
  });
}

/**
 * Upload multiple gallery images
 * @param projectId - The project ID
 * @param files - Array of image files to upload (max 10)
 * @param onProgress - Optional progress callback
 * @returns Upload result with array of results
 */
export async function uploadGallery(
  projectId: string,
  files: File[],
  onProgress?: (progress: UploadProgress) => void
): Promise<GalleryUploadResult> {
  return new Promise((resolve, reject) => {
    if (files.length === 0) {
      reject(new Error('No files provided'));
      return;
    }

    if (files.length > 10) {
      reject(new Error('Maximum 10 files allowed'));
      return;
    }

    const xhr = new XMLHttpRequest();
    const formData = new FormData();
    
    files.forEach((file) => {
      formData.append('files', file);
    });
    formData.append('projectId', projectId);

    // Track upload progress
    xhr.upload.addEventListener('progress', (e) => {
      if (e.lengthComputable && onProgress) {
        onProgress({
          loaded: e.loaded,
          total: e.total,
          percentage: Math.round((e.loaded / e.total) * 100),
        });
      }
    });

    // Handle completion
    xhr.addEventListener('load', () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const result = JSON.parse(xhr.responseText);
          resolve(result);
        } catch (error) {
          reject(new Error('Invalid response from server'));
        }
      } else {
        try {
          const error = JSON.parse(xhr.responseText);
          reject(new Error(error.error || error.message || 'Upload failed'));
        } catch {
          reject(new Error(`Upload failed with status ${xhr.status}`));
        }
      }
    });

    // Handle errors
    xhr.addEventListener('error', () => {
      reject(new Error('Network error during upload'));
    });

    xhr.addEventListener('abort', () => {
      reject(new Error('Upload cancelled'));
    });

    // Send request
    const token = getAuthToken();
    xhr.open('POST', `${API_BASE_URL}/admin/projects/upload/gallery`);
    if (token) {
      xhr.setRequestHeader('Authorization', `Bearer ${token}`);
    }
    xhr.send(formData);
  });
}

/**
 * Delete project media
 * @param projectId - The project ID
 * @param type - The media type to delete (thumbnail, hero, gallery)
 * @returns Delete result
 */
export async function deleteMedia(
  projectId: string,
  type: 'thumbnail' | 'hero' | 'gallery'
): Promise<DeleteMediaResult> {
  const token = getAuthToken();
  
  const response = await fetch(
    `${API_BASE_URL}/admin/projects/${projectId}/media/${type}`,
    {
      method: 'DELETE',
      headers: {
        'Authorization': token ? `Bearer ${token}` : '',
      },
    }
  );

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Delete failed' }));
    throw new Error(error.error || error.message || 'Delete failed');
  }

  return response.json();
}

/**
 * Retry a failed upload with exponential backoff
 * @param uploadFn - The upload function to retry
 * @param maxRetries - Maximum number of retries (default: 3)
 * @param initialDelay - Initial delay in ms (default: 1000)
 * @returns Upload result
 */
export async function retryUpload<T>(
  uploadFn: () => Promise<T>,
  maxRetries: number = 3,
  initialDelay: number = 1000
): Promise<T> {
  let lastError: Error | null = null;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await uploadFn();
    } catch (error) {
      lastError = error as Error;
      
      if (attempt < maxRetries) {
        // Exponential backoff: 1s, 2s, 4s
        const delay = initialDelay * Math.pow(2, attempt);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  throw lastError || new Error('Upload failed after retries');
}
