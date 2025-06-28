import api from './api';

// Description: Login user functionality
// Endpoint: POST /api/auth/login
// Request: { email: string, password: string }
// Response: { accessToken: string, refreshToken: string }
export const login = async (email: string, password: string) => {
  try {
    const response = await api.post('/api/auth/login', { email, password });
    return response.data;
  } catch (error: any) {
    console.error('Login error:', error);
    throw new Error(error?.response?.data?.message || error.message);
  }
};

// Description: Register user functionality
// Endpoint: POST /api/auth/register
// Request: { name: string, email: string, password: string }
// Response: { user: object, accessToken: string, refreshToken: string }
export const register = async (name: string, email: string, password: string) => {
  try {
    const response = await api.post('/api/auth/register', { name, email, password });
    return response.data;
  } catch (error: any) {
    throw new Error(error?.response?.data?.message || error.message);
  }
};

// Description: Refresh token
// Endpoint: POST /api/auth/refresh
// Request: { refreshToken: string }
// Response: { accessToken: string, refreshToken: string }
export const refreshToken = async (refreshToken: string) => {
  try {
    const response = await api.post('/api/auth/refresh', { refreshToken });
    return response.data;
  } catch (error: any) {
    throw new Error(error?.response?.data?.message || error.message);
  }
};

// Description: Logout
// Endpoint: POST /api/auth/logout
// Request: {}
// Response: { success: boolean, message: string }
export const logout = async () => {
  try {
    return await api.post('/api/auth/logout');
  } catch (error: any) {
    throw new Error(error?.response?.data?.message || error.message);
  }
};
