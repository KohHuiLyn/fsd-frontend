import { jwtDecode } from 'jwt-decode';
import { ImageSourcePropType } from 'react-native';
import { createApiClient, setStoredToken } from './apiClient';

const apiClient = createApiClient();
const defaultProfileImage = require('../assets/images/profile_pic.png') as ImageSourcePropType;

/* ──────────────────────────────
 *  Types
 * ────────────────────────────── */
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
  id: string;
  email: string;
  username?: string;
  phoneNumber?: string;
  role?: string;
  createdAt?: string;
  profilePicture?: ImageSourcePropType;
}

export interface LoginResponse {
  message?: string;
  token: string;
  user: User;
}

export interface RegisterResponse {
  message?: string;
  token: string;
  user: User;
}

export interface ApiError {
  message: string;
  error?: string;
}

export interface UserProfile extends User {
  deletedAt?: string | null;
}

/* ──────────────────────────────
 *  Helpers
 * ────────────────────────────── */
function resolveProfileImageSource(profilePicture?: string | null): ImageSourcePropType {
  if (typeof profilePicture === 'string') {
    const trimmed = profilePicture.trim();
    if (trimmed.length > 0) {
      return { uri: trimmed };
    }
  }
  return defaultProfileImage;
}

/* ──────────────────────────────
 *  LOGIN
 * ────────────────────────────── */
export async function loginUser(credentials: LoginRequest): Promise<LoginResponse> {
  const response = await apiClient.post<any>('/login/auth/login', credentials);

  if (__DEV__) {
    console.log('Login API Response:', JSON.stringify(response, null, 2));
  }

  if (!response || !response.token) {
    console.error('Unexpected login response:', response);
    throw new Error('Invalid login response format');
  }

  const token: string = response.token;
  let user: User | undefined = response.user;

  if (!user) {
    const payload = decodeJwtPayload(token);
    if (!payload?.id || !payload?.email) {
      console.error('Unable to derive user from login token:', payload);
      throw new Error('Invalid login response format');
    }

    user = {
      id: payload.id,
      email: payload.email,
      role: payload.role,
    };
  }

  await setStoredToken(token);

  return {
    message: response.message,
    token,
    user,
  };
}

/* ──────────────────────────────
 *  REGISTER
 * ────────────────────────────── */
export async function registerUser(userData: RegisterRequest): Promise<RegisterResponse> {
  const response = await apiClient.post<any>('/login/register', userData);

  if (__DEV__) {
    console.log('Register API Response:', JSON.stringify(response, null, 2));
  }

  if (!response || !response.token) {
    console.error('Unexpected registration response:', response);
    throw new Error('Invalid registration response format');
  }

  const token: string = response.token;
  let user: User | undefined = response.user;

  if (!user) {
    const payload = decodeJwtPayload(token);
    if (!payload?.id || !payload?.email) {
      console.error('Unable to derive user from registration token:', payload);
      throw new Error('Invalid registration response format');
    }

    user = {
      id: payload.id,
      email: payload.email,
      role: payload.role,
      username: userData.username,
      phoneNumber: userData.phoneNumber,
    };
  }

  await setStoredToken(token);

  return {
    message: response.message,
    token,
    user,
  };
}

/* ──────────────────────────────
 *  Get current user (optional)
 * ────────────────────────────── */
export async function getCurrentUser(): Promise<User> {
  return await apiClient.get<User>('/auth/me');
}

export async function getUserProfile(userId: string): Promise<UserProfile> {
  const trimmedId = userId.trim();
  if (!trimmedId) {
    throw new Error('User ID is required to fetch profile information.');
  }

  const response = await apiClient.get<any>(`/user/users/${trimmedId}`);

  if (!response || !response.id) {
    throw new Error('User profile could not be retrieved.');
  }

  return {
    id: response.id,
    email: response.email,
    username: response.username ?? undefined,
    phoneNumber: response.phone_number ?? undefined,
    role: response.role ?? undefined,
    createdAt: response.created_at ?? undefined,
    deletedAt: response.deleted_at ?? null,
    profilePicture: resolveProfileImageSource(response.profile_picture),
  };
}

/* ──────────────────────────────
 *  JWT decode helper (React Native-safe)
 * ────────────────────────────── */
interface TokenPayload {
  id?: string;
  email?: string;
  role?: string;
  [key: string]: any;
}

function decodeJwtPayload(token: string): TokenPayload | null {
  try {
    const payload = jwtDecode<TokenPayload>(token);
    if (__DEV__) {
      console.log('Decoded JWT payload:', payload);
    }
    return payload;
  } catch (error) {
    console.error('Failed to decode JWT payload:', error);
    return null;
  }
}
