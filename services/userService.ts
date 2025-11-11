import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import { Platform } from 'react-native';

/**
 * Get LOGIN_URL (base URL) from environment variables (.env file)
 * Reads from Constants.expoConfig.extra.LOGIN_URL which is set in app.config.js
 * 
 * Automatically converts localhost to the correct address for the platform:
 * - Android emulator: localhost -> 10.0.2.2
 * - iOS simulator: localhost -> localhost (works as-is)
 * - Physical devices: Use your computer's local IP (e.g., 192.168.1.100)
 * 
 * Expected .env format:
 * LOGIN_URL=http://localhost:3000
 * 
 * For physical devices, use your computer's local IP:
 * LOGIN_URL=http://192.168.1.100:3000
 */
const getBaseUrl = (): string => {
  // Try to get LOGIN_URL from expo constants (from app.config.js which reads .env)
  let baseUrl = Constants.expoConfig?.extra?.LOGIN_URL;
  
  // If no baseUrl from env, use platform-specific fallback
  if (!baseUrl) {
    if (__DEV__) {
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
};

const API_BASE_URL = getBaseUrl();

// Log the base URL for debugging
if (__DEV__) {
  console.log('API Base URL:', API_BASE_URL);
  console.log('Platform:', Platform.OS);
}

// API Response Types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  username: string;
  phoneNumber: string;
  password: string;
  role: string;
}

export interface User {
  id?: string;
  _id?: string; // Some APIs (e.g., MongoDB) use _id instead of id
  email: string;
  username?: string;
  name?: string;
  phoneNumber?: string;
  role?: string;
}

export interface LoginResponse {
  user: User;
  token?: string;
}

export interface RegisterResponse {
  user: User;
  token?: string;
}

export interface ApiError {
  message: string;
  error?: string;
}

// Token management helpers
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

// Generic API request function
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;

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
    if (error.message === 'Network request failed' || error.message === 'Failed to fetch') {
      const errorMsg = `Unable to connect to server at ${url}. ` +
        `If using Android emulator, make sure LOGIN_URL uses 10.0.2.2 instead of localhost. ` +
        `If using a physical device, use your computer's local IP address (e.g., 192.168.1.100).`;
      if (__DEV__) {
        console.error(errorMsg);
      }
      throw new Error(errorMsg);
    }
    throw error;
  }
}

// User Service API Methods

/**
 * Login user
 * POST {LOGIN_URL}/auth/login
 * Body: { email: string, password: string }
 */
export async function loginUser(credentials: LoginRequest): Promise<LoginResponse> {
  const response = await apiRequest<any>('/auth/login', {
    method: 'POST',
    body: JSON.stringify(credentials),
  });

  if (__DEV__) {
    console.log('Login API Response:', JSON.stringify(response, null, 2));
  }

  // Handle different response structures
  let loginResponse: LoginResponse;

  if (response.user) {
    // Standard structure: { user: {...}, token: "..." }
    loginResponse = response as LoginResponse;
  } else if (response.id || response.email) {
    // User returned directly: { id: "...", email: "...", ... }
    loginResponse = {
      user: response as User,
      token: response.token,
    };
  } else {
    // Unknown structure
    console.error('Unexpected API response structure:', response);
    throw new Error('Invalid response format from login API');
  }

  // Store token if provided
  if (loginResponse.token) {
    await setStoredToken(loginResponse.token);
  }

  return loginResponse;
}

/**
 * Register new user
 * POST {LOGIN_URL}/auth/register
 * Body: { email: string, username: string, phoneNumber: string, password: string, role: string }
 */
export async function registerUser(userData: RegisterRequest): Promise<RegisterResponse> {
  const response = await apiRequest<any>('/auth/register', {
    method: 'POST',
    body: JSON.stringify(userData),
  });

  if (__DEV__) {
    console.log('Register API Response:', JSON.stringify(response, null, 2));
  }

  // Handle different response structures
  // Some APIs return { user: {...}, token: "..." }
  // Others might return the user directly or have a different structure
  let registerResponse: RegisterResponse;

  if (response.user) {
    // Standard structure: { user: {...}, token: "..." }
    registerResponse = response as RegisterResponse;
  } else if (response.id || response.email) {
    // User returned directly: { id: "...", email: "...", ... }
    registerResponse = {
      user: response as User,
      token: response.token,
    };
  } else {
    // Unknown structure, try to extract user from response
    console.error('Unexpected API response structure:', response);
    throw new Error('Invalid response format from registration API');
  }

  // Store token if provided
  if (registerResponse.token) {
    await setStoredToken(registerResponse.token);
  }

  return registerResponse;
}

/**
 * Logout user
 * POST {LOGIN_URL}/auth/logout (optional)
 */
export async function logoutUser(): Promise<void> {
  try {
    // Optionally call logout endpoint if your API has one
    await apiRequest('/auth/logout', {
      method: 'POST',
    });
  } catch (error) {
    // Ignore logout API errors, still clear local token
    console.error('Error calling logout API:', error);
  } finally {
    // Always remove token from storage
    await removeStoredToken();
  }
}

/**
 * Get current user
 * GET {LOGIN_URL}/auth/me (optional)
 */
export async function getCurrentUser(): Promise<User> {
  return await apiRequest<User>('/auth/me', {
    method: 'GET',
  });
}

// Generic HTTP methods template for all API calls
export const apiService = {
  /**
   * GET request
   * @param endpoint - API endpoint (e.g., '/api/users')
   * @param options - Optional fetch options
   */
  get: <T>(endpoint: string, options?: RequestInit): Promise<T> => {
    return apiRequest<T>(endpoint, { ...options, method: 'GET' });
  },

  /**
   * POST request
   * @param endpoint - API endpoint (e.g., '/api/users')
   * @param data - Request body data
   * @param options - Optional fetch options
   */
  post: <T>(endpoint: string, data?: any, options?: RequestInit): Promise<T> => {
    return apiRequest<T>(endpoint, {
      ...options,
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  },

  /**
   * PUT request
   * @param endpoint - API endpoint (e.g., '/api/users/1')
   * @param data - Request body data
   * @param options - Optional fetch options
   */
  put: <T>(endpoint: string, data?: any, options?: RequestInit): Promise<T> => {
    return apiRequest<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  },

  /**
   * PATCH request
   * @param endpoint - API endpoint (e.g., '/api/users/1')
   * @param data - Request body data
   * @param options - Optional fetch options
   */
  patch: <T>(endpoint: string, data?: any, options?: RequestInit): Promise<T> => {
    return apiRequest<T>(endpoint, {
      ...options,
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    });
  },

  /**
   * DELETE request
   * @param endpoint - API endpoint (e.g., '/api/users/1')
   * @param options - Optional fetch options
   */
  delete: <T>(endpoint: string, options?: RequestInit): Promise<T> => {
    return apiRequest<T>(endpoint, { ...options, method: 'DELETE' });
  },
};

