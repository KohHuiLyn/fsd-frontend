import { createApiClient, getStoredToken, removeStoredToken, setStoredToken } from './apiClient';

// Create API client instance for user service
const apiClient = createApiClient('LOGIN_URL', 'http://localhost:3000');

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

// Re-export token management functions for convenience
export { getStoredToken, removeStoredToken, setStoredToken };

// User Service API Methods

/**
 * Login user
 * POST {LOGIN_URL}/auth/login
 * Body: { email: string, password: string }
 */
export async function loginUser(credentials: LoginRequest): Promise<LoginResponse> {
  const response = await apiClient.post<any>('/auth/login', credentials);

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
  const response = await apiClient.post<any>('/auth/register', userData);

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
 * Get current user
 * GET {LOGIN_URL}/auth/me (optional)
 */
export async function getCurrentUser(): Promise<User> {
  return await apiClient.get<User>('/auth/me');
}

// Export the API client instance for direct use if needed
export { apiClient };

