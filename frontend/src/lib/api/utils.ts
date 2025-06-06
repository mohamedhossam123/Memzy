//lib/api/utils.ts
export const detectMediaType = (url: string | null): 'image' | 'video' | null => {
  if (!url) return null;
  
  const urlLower = url.toLowerCase();
  
  if (urlLower.includes('.mp4') || urlLower.includes('.webm') || urlLower.includes('.mov') || 
      urlLower.includes('.avi') || urlLower.includes('.mkv') || urlLower.includes('video')) {
    return 'video';
  }
  
  if (urlLower.includes('.jpg') || urlLower.includes('.jpeg') || urlLower.includes('.png') || 
      urlLower.includes('.gif') || urlLower.includes('.webp') || urlLower.includes('.svg') ||
      urlLower.includes('image')) {
    return 'image';
  }
  
  if (urlLower.includes('cloudinary.com')) {
    if (urlLower.includes('/video/')) return 'video';
    if (urlLower.includes('/image/')) return 'image';
  }
  
  return null;
};

export const getOptimizedMediaUrl = (url: string, type: 'image' | 'video'): string => {
  if (!url || !url.includes('cloudinary.com')) return url;
  
  if (type === 'image') {
    return url.replace('/upload/', '/upload/q_auto,f_auto,w_800,c_limit/');
  } else if (type === 'video') {
    return url.replace('/upload/', '/upload/q_auto,w_800,c_limit/');
  }
  
  return url;
};