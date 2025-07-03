import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

export async function apiRequest<T = any>(
  method: HttpMethod,
  endpoint: string,
  data?: any,
): Promise<T> {
  const baseUrl = 'http://localhost:3001'; // Use port 3001 to match the server
  const url = endpoint.startsWith('http') ? endpoint : `${baseUrl}${endpoint}`;
  
  const options: RequestInit = {
    method,
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    credentials: 'include',
  };

  if (data) {
    options.body = JSON.stringify(data);
  }

  try {
    console.log(`Making ${method} request to ${url}`, { data }); // Debug log
    const response = await fetch(url, options);
    
    if (!response.ok) {
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const errorData = await response.json();
        throw new Error(JSON.stringify(errorData));
      } else {
        throw new Error(response.statusText || 'API request failed');
      }
    }

    // For successful responses, handle empty responses gracefully
    const text = await response.text();
    if (!text) {
      return {} as T;
    }
    return JSON.parse(text) as T;
  } catch (error) {
    console.error('API Request failed:', error);
    throw error;
  }
}
