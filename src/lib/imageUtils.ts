import { supabase } from '@/integrations/supabase/client';

/**
 * Gets a signed URL for an image stored in the issue-images bucket
 * @param imagePath The path to the image in storage (can be full URL or just path)
 * @param expiresIn Number of seconds until the URL expires (default: 3600 = 1 hour)
 * @returns The signed URL or null if there was an error
 */
export const getSignedImageUrl = async (
  imagePath: string | null | undefined,
  expiresIn: number = 3600
): Promise<string | null> => {
  if (!imagePath) return null;

  try {
    // Extract the path from the full URL if needed
    let path = imagePath;
    
    // Check if it's a full URL and extract the path
    if (imagePath.includes('supabase.co/storage/v1/object/public/issue-images/')) {
      const urlParts = imagePath.split('supabase.co/storage/v1/object/public/issue-images/');
      path = urlParts[1] || imagePath;
    } else if (imagePath.includes('/storage/v1/object/public/issue-images/')) {
      const urlParts = imagePath.split('/storage/v1/object/public/issue-images/');
      path = urlParts[1] || imagePath;
    }

    const { data, error } = await supabase.storage
      .from('issue-images')
      .createSignedUrl(path, expiresIn);

    if (error) {
      console.error('Error creating signed URL:', error);
      return null;
    }

    return data?.signedUrl || null;
  } catch (error) {
    console.error('Error in getSignedImageUrl:', error);
    return null;
  }
};
