// src/lib/services/storage.service.ts - FIXED VERSION
import { supabase } from '@/lib/supabase';

export interface UploadResult {
  url: string | null;
  error: string | null;
  path?: string;
}

/**
 * ✅ FIXED: Upload file to Supabase storage dengan bucket 'uploads'
 * @param file - File to upload
 * @param bucket - Storage bucket (default: 'uploads')
 * @param folder - Optional folder within bucket
 * @returns Object with url or error
 */
export const uploadFile = async (file: File, bucket: 'uploads' | 'assignments' | 'submissions' | 'avatars' = 'uploads', folder?: string): Promise<UploadResult> => {
  try {
    // Validate file
    if (!file) {
      return { url: null, error: 'No file provided' };
    }

    // File size limit (10MB)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      return { url: null, error: 'File size must be less than 10MB' };
    }

    // Generate unique filename
    const timestamp = Date.now();
    const randomStr = Math.random().toString(36).substring(7);
    const fileExt = file.name.split('.').pop();
    const fileName = `${timestamp}-${randomStr}.${fileExt}`;

    // Create full file path
    const filePath = folder ? `${folder}/${fileName}` : fileName;

    console.log(`📤 Uploading to ${bucket}/${filePath}`);

    // Upload file
    const { data, error: uploadError } = await supabase.storage.from(bucket).upload(filePath, file, {
      cacheControl: '3600',
      upsert: false,
    });

    if (uploadError) {
      console.error('Upload error:', uploadError);
      return { url: null, error: uploadError.message };
    }

    // Get public URL
    const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(filePath);

    console.log('✅ Upload successful:', urlData.publicUrl);
    return {
      url: urlData.publicUrl,
      error: null,
      path: filePath,
    };
  } catch (error: any) {
    console.error('💥 File upload failed:', error);
    return { url: null, error: error.message || 'Upload failed' };
  }
};

/**
 * ✅ FIXED: Delete file from storage
 * @param bucket - Storage bucket
 * @param filePath - Path to file
 * @returns Success status
 */
export const deleteFile = async (bucket: 'uploads' | 'assignments' | 'submissions' | 'avatars', filePath: string): Promise<{ success: boolean; error: string | null }> => {
  try {
    const { error } = await supabase.storage.from(bucket).remove([filePath]);

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, error: null };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

/**
 * ✅ FIXED: Get file URL from storage
 * @param bucket - Storage bucket
 * @param filePath - Path to file
 * @returns Public URL
 */
export const getFileUrl = (bucket: 'uploads' | 'assignments' | 'submissions' | 'avatars', filePath: string): string => {
  const { data } = supabase.storage.from(bucket).getPublicUrl(filePath);

  return data.publicUrl;
};

/**
 * ✅ FIXED: Download file from storage
 * @param bucket - Storage bucket
 * @param filePath - Path to file
 * @returns File data
 */
export const downloadFile = async (bucket: 'uploads' | 'assignments' | 'submissions' | 'avatars', filePath: string): Promise<{ data: Blob | null; error: string | null }> => {
  try {
    const { data, error } = await supabase.storage.from(bucket).download(filePath);

    if (error) {
      return { data: null, error: error.message };
    }

    return { data, error: null };
  } catch (error: any) {
    return { data: null, error: error.message };
  }
};

/**
 * ✅ FIXED: Check if file exists in storage
 * @param bucket - Storage bucket
 * @param filePath - Path to file
 * @returns boolean
 */
export const fileExists = async (bucket: 'uploads' | 'assignments' | 'submissions' | 'avatars', filePath: string): Promise<boolean> => {
  try {
    const { data, error } = await supabase.storage.from(bucket).list(filePath.includes('/') ? filePath.split('/').slice(0, -1).join('/') : '', {
      limit: 1000,
      search: filePath.includes('/') ? filePath.split('/').pop() : filePath,
    });

    if (error) return false;

    const fileName = filePath.includes('/') ? filePath.split('/').pop() : filePath;
    return data.some((file) => file.name === fileName);
  } catch (error) {
    return false;
  }
};

/**
 * ✅ NEW: Helper function untuk artikel
 */
export const uploadArticleFile = async (file: File): Promise<UploadResult> => {
  return uploadFile(file, 'uploads', 'articles');
};

export const downloadArticleFile = async (filePath: string) => {
  return downloadFile('uploads', filePath);
};

export const getArticleFileUrl = (filePath: string): string => {
  return getFileUrl('uploads', filePath);
};

export const deleteArticleFile = async (filePath: string) => {
  return deleteFile('uploads', filePath);
};
