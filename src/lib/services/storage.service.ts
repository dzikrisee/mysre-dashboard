// src/lib/services/storage.service.ts
import { supabase } from '@/lib/supabase';

export interface UploadResult {
  url: string | null;
  error: string | null;
}

/**
 * Upload file to Supabase storage
 * @param file - File to upload
 * @param bucket - Storage bucket (assignments, submissions, avatars)
 * @param folder - Optional folder within bucket
 * @returns Object with url or error
 */
export const uploadFile = async (file: File, bucket: 'assignments' | 'submissions' | 'avatars' | 'documents' = 'assignments', folder?: string): Promise<UploadResult> => {
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
    return { url: urlData.publicUrl, error: null };
  } catch (error: any) {
    console.error('💥 File upload failed:', error);
    return { url: null, error: error.message || 'Upload failed' };
  }
};

/**
 * Delete file from storage
 * @param bucket - Storage bucket
 * @param filePath - Path to file
 * @returns Success status
 */
export const deleteFile = async (bucket: 'assignments' | 'submissions' | 'avatars' | 'documents', filePath: string): Promise<{ success: boolean; error: string | null }> => {
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
 * Get file URL from storage
 * @param bucket - Storage bucket
 * @param filePath - Path to file
 * @returns Public URL
 */
export const getFileUrl = (bucket: 'assignments' | 'submissions' | 'avatars' | 'documents', filePath: string): string => {
  const { data } = supabase.storage.from(bucket).getPublicUrl(filePath);

  return data.publicUrl;
};
