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

    // Check if body is FormData - if so, don't set Content-Type (let fetch set it with boundary)
    const isFormData = options.body instanceof FormData;

    const defaultHeaders: HeadersInit = {};
    
    // Only set Content-Type for non-FormData requests
    if (!isFormData) {
      defaultHeaders['Content-Type'] = 'application/json';
    }

    // Add auth token if available
    const token = await getStoredToken();
    if (token) {
      console.log(token)
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
      
      // Get response as text first to handle non-JSON responses
      const responseText = await response.text();
      
      let data: any;
      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        // If JSON parsing fails, log the actual response
        console.error('JSON Parse Error - Response Status:', response.status);
        console.error('JSON Parse Error - Response Headers:', response.headers);
        console.error('JSON Parse Error - Response Body:', responseText);
        console.error('JSON Parse Error - Full Error:', parseError);
        throw new Error(`Failed to parse response as JSON. Status: ${response.status}. Response: ${responseText.substring(0, 200)}`);
      }

      if (!response.ok) {
        const errorMessage = (data as ApiError).message || (data as ApiError).error || 'Request failed';
        const statusCode = response.status;
        const statusText = response.statusText;
        
        // Log detailed error information
        console.error('API Request Failed:');
        console.error('  URL:', url);
        console.error('  Method:', options.method || 'GET');
        console.error('  Status Code:', statusCode);
        console.error('  Status Text:', statusText);
        console.error('  Error Message:', errorMessage);
        console.error('  Response Data:', JSON.stringify(data, null, 2));
        console.error('  Response Text:', responseText);
        
        // Throw error with more details
        throw new Error(`Request failed (${statusCode} ${statusText}): ${errorMessage}`);
      }

      return data as T;
    } catch (error: any) {
      if (__DEV__) {
        console.error('API Request Error:', error);
      }
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
    // If data is FormData, pass it directly. Otherwise, stringify it.
    const body = data instanceof FormData ? data : (data ? JSON.stringify(data) : undefined);
    
    return this.request<T>(endpoint, {
      ...options,
      method: 'POST',
      body,
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
    const response = await fetch(url, config);
    
    // Get response as text first to handle non-JSON responses
    const responseText = await response.text();
    
    let data: any;
    try {
      data = JSON.parse(responseText);
    } catch (parseError) {
      // If JSON parsing fails, log the actual response
      console.error('JSON Parse Error - Response Status:', response.status);
      console.error('JSON Parse Error - Response Headers:', response.headers);
      console.error('JSON Parse Error - Response Body:', responseText);
      console.error('JSON Parse Error - Full Error:', parseError);
      throw new Error(`Failed to parse response as JSON. Status: ${response.status}. Response: ${responseText.substring(0, 200)}`);
    }

    return data as T;
  } catch (error: any) {
    if (__DEV__) {
      console.error('Upload Request Error:', error);
    }
    throw error;
  }
}

