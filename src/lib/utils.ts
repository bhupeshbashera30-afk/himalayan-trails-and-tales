import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
// src/lib/utils.ts
export const getFirstImage = (images: any, width: number = 100): string => {
  let url = '/placeholder.jpg';

  // 1. SAFELY EXTRACT THE URL
  if (Array.isArray(images) && images.length > 0) {
    const firstItem = images[0];
    if (typeof firstItem === 'string') {
      url = firstItem;
    } else if (typeof firstItem === 'object' && firstItem !== null) {
      url = firstItem.url || firstItem.src || '/placeholder.jpg';
    }
  } else if (typeof images === 'string') {
    url = images;
  }

  // 2. THE OPTIMIZER (wsrv.nl proxy)
  if (url.includes('supabase.co')) {
    const encodedUrl = encodeURIComponent(url);
    // Uses the dynamic 'width' you pass in
    return `https://wsrv.nl/?url=${encodedUrl}&w=${width}&output=webp&q=80`;
  }

  return url;
};
