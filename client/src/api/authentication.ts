import api from './api';

export interface ApiKey {
  _id: string;
  name: string;
  key: string;
  agentId: string;
  permissions: string[];
  isActive: boolean;
  lastUsed?: string;
  expiresAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface User {
  _id: string;
  name: string;
  email: string;
  role: 'admin' | 'user';
  isActive: boolean;
  lastLoginAt?: string;
  createdAt: string;
  updatedAt: string;
}

// Description: Get all API keys
// Endpoint: GET /api/auth/api-keys
// Response: ApiKey[]
export const getApiKeys = async () => {
  const response = await api.get('/api/auth/api-keys');
  return response.data;
};

// Description: Create a new API key
// Endpoint: POST /api/auth/api-keys
// Request: { name: string, agentId: string, permissions: string[], expiresAt?: string }
// Response: ApiKey
export const createApiKey = async (data: {
  name: string;
  agentId: string;
  permissions: string[];
  expiresAt?: string;
}) => {
  const response = await api.post('/api/auth/api-keys', data);
  return response.data;
};

// Description: Update API key
// Endpoint: PUT /api/auth/api-keys/:id
// Request: { name?: string, permissions?: string[], isActive?: boolean, expiresAt?: string }
// Response: ApiKey
export const updateApiKey = async (id: string, data: {
  name?: string;
  permissions?: string[];
  isActive?: boolean;
  expiresAt?: string;
}) => {
  const response = await api.put(`/api/auth/api-keys/${id}`, data);
  return response.data;
};

// Description: Delete API key
// Endpoint: DELETE /api/auth/api-keys/:id
// Response: { message: string }
export const deleteApiKey = async (id: string) => {
  const response = await api.delete(`/api/auth/api-keys/${id}`);
  return response.data;
};

// Description: Get all users
// Endpoint: GET /api/auth/users
// Response: User[]
export const getUsers = async () => {
  const response = await api.get('/api/auth/users');
  return response.data;
};

// Description: Create a new user
// Endpoint: POST /api/auth/users
// Request: { name: string, email: string, password: string, role?: string }
// Response: User
export const createUser = async (data: {
  name: string;
  email: string;
  password: string;
  role?: 'admin' | 'user';
}) => {
  const response = await api.post('/api/auth/users', data);
  return response.data;
};

// Description: Update user
// Endpoint: PUT /api/auth/users/:id
// Request: { name?: string, email?: string, role?: string, isActive?: boolean }
// Response: User
export const updateUser = async (id: string, data: {
  name?: string;
  email?: string;
  role?: 'admin' | 'user';
  isActive?: boolean;
}) => {
  const response = await api.put(`/api/auth/users/${id}`, data);
  return response.data;
};

// Description: Delete user
// Endpoint: DELETE /api/auth/users/:id
// Response: { message: string }
export const deleteUser = async (id: string) => {
  const response = await api.delete(`/api/auth/users/${id}`);
  return response.data;
};

// Description: Get user by ID
// Endpoint: GET /api/auth/users/:id
// Response: User
export const getUser = async (id: string) => {
  const response = await api.get(`/api/auth/users/${id}`);
  return response.data;
};

// Description: Get JWT configuration
// Endpoint: GET /api/auth/jwt-config
// Request: {}
// Response: { config: { secretMasked: string, expirationTime: string } }
export const getJwtConfig = () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        config: {
          secretMasked: '****************************',
          expirationTime: '24h'
        }
      });
    }, 500);
  });
};

// Description: Update JWT configuration
// Endpoint: PUT /api/auth/jwt-config
// Request: { secret?: string, expirationTime: string }
// Response: { success: boolean, message: string }
export const updateJwtConfig = (data: { secret?: string; expirationTime: string }) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        success: true,
        message: 'JWT configuration updated successfully'
      });
    }, 500);
  });
};