import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import { Platform } from 'react-native';

// Token management
const TOKEN_KEY = '@plantpal_token';

export async function getStoredToken(): Promise<string | null> {
  try {
    return await AsyncStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export async function setStoredToken(token: string): Promise<void> {
  try {
    await AsyncStorage.setItem(TOKEN_KEY, token);
  } catch (error) {
    console.error('Error storing token:', error);
  }
}

export async function removeStoredToken(): Promise<void> {
  try {
    await AsyncStorage.removeItem(TOKEN_KEY);
  } catch (error) {
    console.error('Error removing token:', error);
  }
}

/**
 * Get base URL from environment variables or constants
 * Automatically converts localhost to the correct address for the platform:
 * - Android emulator: localhost -> 10.0.2.2
 * - iOS simulator: localhost -> localhost (works as-is)
 * - Physical devices: Use your computer's local IP (e.g., 192.168.1.100)
 * 
 * @param envKey - Key to look for in Constants.expoConfig.extra (e.g., 'LOGIN_URL')
 * @param fallback - Fallback URL if not found in env
 */
export function getBaseUrl(envKey?: string, fallback?: string): string {
  let baseUrl: string | undefined;

  // Try to get URL from expo constants if envKey is provided
  if (envKey) {
    baseUrl = Constants.expoConfig?.extra?.[envKey];
  }

  // If no baseUrl from env, use platform-specific fallback
  if (!baseUrl) {
    if (fallback) {
      baseUrl = fallback;
    } else if (__DEV__) {
      if (Platform.OS === 'android') {
        baseUrl = 'http://10.0.2.2:3000';
      } else if (Platform.OS === 'ios') {
        baseUrl = 'http://localhost:3000';
      } else {
        baseUrl = 'http://localhost:3000';
      }
    } else {
      baseUrl = 'http://localhost:3000';
    }
  }

  // Clean up the URL: remove quotes, trim whitespace, remove trailing slashes
  if (typeof baseUrl === 'string') {
    baseUrl = baseUrl.trim().replace(/^["']|["']$/g, '').replace(/\/+$/, '');
  }

  // Auto-convert localhost for Android emulator
  // Android emulator can't access localhost, must use 10.0.2.2
  if (__DEV__ && Platform.OS === 'android') {
    // Replace localhost or 127.0.0.1 with 10.0.2.2 for Android emulator
    // This handles URLs like http://localhost:3000 or http://127.0.0.1:3000
    if (baseUrl.includes('localhost') || baseUrl.includes('127.0.0.1')) {
      // Extract protocol and port
      const match = baseUrl.match(/^(https?:\/\/)(localhost|127\.0\.0\.1)(:\d+)?/);
      if (match) {
        const protocol = match[1]; // http:// or https://
        const port = match[3] || ''; // :3000 or empty
        baseUrl = `${protocol}10.0.2.2${port}`;
      }
    }
  }

  return baseUrl;
}

// API Error interface
export interface ApiError {
  message: string;
  error?: string;
}

/**
 * API Client class for making HTTP requests
 */
export class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  /**
   * Generic API request function
   */
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;

    const defaultHeaders: HeadersInit = {
      'Content-Type': 'application/json',
    };

    // Add auth token if available
    const token = await getStoredToken();
    if (token) {
      defaultHeaders['Authorization'] = `Bearer ${token}`;
    }

    const config: RequestInit = {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
    };

    try {
      if (__DEV__) {
        console.log('API Request:', url);
        console.log('Method:', options.method || 'GET');
      }
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        const errorMessage = (data as ApiError).message || (data as ApiError).error || 'Request failed';
        if (__DEV__) {
          console.error('API Error:', errorMessage, 'Status:', response.status);
        }
        throw new Error(errorMessage);
      }

      return data as T;
    } catch (error: any) {

      throw error;
    }
  }

  /**
   * GET request
   * @param endpoint - API endpoint (e.g., '/api/users')
   * @param options - Optional fetch options
   */
  get<T>(endpoint: string, options?: RequestInit): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'GET' });
  }

  /**
   * POST request
   * @param endpoint - API endpoint (e.g., '/api/users')
   * @param data - Request body data
   * @param options - Optional fetch options
   */
  post<T>(endpoint: string, data?: any, options?: RequestInit): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  /**
   * PUT request
   * @param endpoint - API endpoint (e.g., '/api/users/1')
   * @param data - Request body data
   * @param options - Optional fetch options
   */
  put<T>(endpoint: string, data?: any, options?: RequestInit): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  /**
   * PATCH request
   * @param endpoint - API endpoint (e.g., '/api/users/1')
   * @param data - Request body data
   * @param options - Optional fetch options
   */
  patch<T>(endpoint: string, data?: any, options?: RequestInit): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  /**
   * DELETE request
   * @param endpoint - API endpoint (e.g., '/api/users/1')
   * @param options - Optional fetch options
   */
  delete<T>(endpoint: string, options?: RequestInit): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'DELETE' });
  }
}

/**
 * Create an API client instance with a base URL
 * @param envKey - Key to look for in Constants.expoConfig.extra (e.g., 'LOGIN_URL')
 * @param fallback - Fallback URL if not found in env
 */
export function createApiClient(envKey?: string, fallback?: string): ApiClient {
  const baseUrl = process.env.EXPO_PUBLIC_API_GATEWAY_URL;

  return new ApiClient(baseUrl);
}

/**
 * Helper function for making requests with FormData (useful for file uploads)
 * @param endpoint - API endpoint
 * @param formData - FormData object
 * @param options - Optional fetch options
 */
export async function uploadFile<T>(
  baseUrl: string,
  endpoint: string,
  formData: FormData,
  options?: RequestInit
): Promise<T> {
  const url = `${baseUrl}${endpoint}`;

  const defaultHeaders: HeadersInit = {};

  // Add auth token if available
  const token = await getStoredToken();
  if (token) {
    defaultHeaders['Authorization'] = `Bearer ${token}`;
  }

  // Don't set Content-Type for FormData, let the browser set it with boundary
  const config: RequestInit = {
    ...options,
    method: options?.method || 'POST',
    headers: {
      ...defaultHeaders,
      ...options?.headers,
    },
    body: formData,
  };

  try {
    if (__DEV__) {
      console.log('Upload Request:', url);
      console.log('Method:', config.method);
    }
    console.log("Fetching now ")
    const response = await fetch(url, config);
    console.log("Response ", response)
    const data = await response.json();

    return data as T;
  } catch (error: any) {
    console.log("Error ", error)
    throw error;
  }
}

