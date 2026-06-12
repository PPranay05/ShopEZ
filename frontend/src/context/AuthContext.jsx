import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

// Configure basic API URL
const API_URL = 'http://localhost:5000/api';

const AuthProvider = ({ children }) => {
  const [userInfo, setUserInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('shopez-user');
    if (storedUser) {
      try {
        setUserInfo(JSON.parse(storedUser));
      } catch (error) {
        console.error('Failed to parse stored user info:', error);
        localStorage.removeItem('shopez-user');
      }
    }
    setLoading(false);
  }, []);

  // Axios Authorization Header Interceptor
  useEffect(() => {
    const interceptor = axios.interceptors.request.use(
      (config) => {
        if (userInfo?.token) {
          config.headers.Authorization = `Bearer ${userInfo.token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );
    return () => {
      axios.interceptors.request.eject(interceptor);
    };
  }, [userInfo]);

  // Login handler
  const login = async (email, password) => {
    try {
      const { data } = await axios.post(`${API_URL}/auth/login`, { email, password });
      setUserInfo(data);
      localStorage.setItem('shopez-user', JSON.stringify(data));
      return { success: true };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Invalid email or password',
      };
    }
  };

  // Register handler
  const register = async (name, email, password) => {
    try {
      const { data } = await axios.post(`${API_URL}/auth/register`, { name, email, password });
      setUserInfo(data);
      localStorage.setItem('shopez-user', JSON.stringify(data));
      return { success: true };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Registration failed',
      };
    }
  };

  // Logout handler
  const logout = () => {
    setUserInfo(null);
    localStorage.removeItem('shopez-user');
  };

  // Update profile handler
  const updateProfile = async (profileData) => {
    try {
      const { data } = await axios.put(`${API_URL}/auth/profile`, profileData);
      setUserInfo(data);
      localStorage.setItem('shopez-user', JSON.stringify(data));
      return { success: true };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to update profile',
      };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        userInfo,
        loading,
        login,
        register,
        logout,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export { AuthContext, AuthProvider };
export default AuthContext;
