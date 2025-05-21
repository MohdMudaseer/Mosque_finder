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
  const options: RequestInit = {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
  };

  if (data) {
    options.body = JSON.stringify(data);
  }

  const response = await fetch(endpoint, options);
  
  if (!response.ok) {
    try {
      const result = await response.json();
      throw new Error(result.message || 'API request failed');
    } catch (e) {
      if (e instanceof SyntaxError) {
        // If JSON parsing fails, use status text
        throw new Error(response.statusText || 'API request failed');
      }
      throw e;
    }
  }

  // For successful responses, handle empty responses gracefully
  const text = await response.text();
  return text ? JSON.parse(text) : {};
}
