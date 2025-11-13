import AsyncStorage from '@react-native-async-storage/async-storage';

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

function resolveBaseUrl(): string {
  const rawUrl = process.env.EXPO_PUBLIC_API_GATEWAY_URL;

  if (!rawUrl) {
    throw new Error('Missing EXPO_PUBLIC_API_GATEWAY_URL environment variable.');
  }

  return rawUrl.trim().replace(/^["']|["']$/g, '').replace(/\/+$/, '');
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
        // if (__DEV__) {
        //   console.error('API Error:', errorMessage, 'Status:', response.status);
        // }
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
export function createApiClient(): ApiClient {
  const baseUrl = resolveBaseUrl();

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

