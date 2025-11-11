import { loginUser, logoutUser, registerUser } from '@/services/userService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, ReactNode, useEffect, useState } from 'react';

interface User {
  id: string;
  email: string;
  username?: string;
  name?: string;
  phoneNumber?: string;
  role?: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, username: string, phoneNumber: string, password: string, role?: string) => Promise<void>;
  logout: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_KEY = '@plantpal_user';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load user from storage on mount
  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const userJson = await AsyncStorage.getItem(STORAGE_KEY);
      if (userJson) {
        setUser(JSON.parse(userJson));
      }
    } catch (error) {
      console.error('Error loading user:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const response = await loginUser({ email, password });

      // Validate response structure
      if (!response || !response.user) {
        console.error('Invalid login response:', response);
        throw new Error('Invalid response from login API');
      }

      // Use 'any' type to handle flexible API response structures
      const apiUser: any = response.user;

      // Convert API user to app user format with safe property access
      // Handle both 'id' and '_id' (MongoDB uses _id)
      const userId = apiUser?.id || apiUser?._id || '';
      
      const userData: User = {
        id: userId,
        email: apiUser?.email || '',
        username: apiUser?.username,
        name: apiUser?.name || apiUser?.username || apiUser?.email,
        phoneNumber: apiUser?.phoneNumber,
        role: apiUser?.role,
      };

      // Validate required fields
      if (!userData.id || !userData.email) {
        console.error('Missing required user fields. Received:', apiUser);
        throw new Error('Invalid user data received from login API');
      }

      // Save user to storage
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(userData));
      setUser(userData);
    } catch (error: any) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const register = async (
    email: string,
    username: string,
    phoneNumber: string,
    password: string,
    role: string = 'gardener'
  ) => {
    try {
      const response = await registerUser({
        email,
        username,
        phoneNumber,
        password,
        role,
      });

      // Validate response structure
      if (!response || !response.user) {
        console.error('Invalid registration response:', response);
        throw new Error('Invalid response from registration API');
      }

      // Use 'any' type to handle flexible API response structures
      const apiUser: any = response.user;

      // Convert API user to app user format with safe property access
      // Handle both 'id' and '_id' (MongoDB uses _id)
      const userId = apiUser?.id || apiUser?._id || '';
      
      const userData: User = {
        id: userId,
        email: apiUser?.email || '',
        username: apiUser?.username,
        name: apiUser?.name || apiUser?.username || apiUser?.email,
        phoneNumber: apiUser?.phoneNumber,
        role: apiUser?.role,
      };

      // Validate required fields
      if (!userData.id || !userData.email) {
        console.error('Missing required user fields. Received:', apiUser);
        throw new Error('Invalid user data received from registration API');
      }

      // Save user to storage
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(userData));
      setUser(userData);
    } catch (error: any) {
      console.error('Registration error:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      // Call logout service (handles API call and token removal)
      await logoutUser();

      // Clear user from storage
      await AsyncStorage.removeItem(STORAGE_KEY);
      setUser(null);
    } catch (error) {
      console.error('Error logging out:', error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = React.useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
