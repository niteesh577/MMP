import api from './api';

export interface MemoryEntry {
  _id: string;
  agentId: string;
  memoryType: string;
  key: string;
  data: any;
  metadata?: {
    version: number;
    tags?: string[];
    priority?: number;
    expiresAt?: string;
  };
  createdAt: string;
  updatedAt: string;
}

// Description: Get memory entries with filters
// Endpoint: GET /api/memory
// Request: { agentId?: string, memoryType?: string, key?: string, limit?: number, offset?: number }
// Response: { memories: MemoryEntry[], pagination: { total: number, limit: number, offset: number, hasMore: boolean } }
export const getMemoryEntries = async (filters: {
  agentId?: string;
  memoryType?: string;
  key?: string;
  limit?: number;
  offset?: number;
}) => {
  const params = new URLSearchParams();
  if (filters.agentId) params.append('agentId', filters.agentId);
  if (filters.memoryType) params.append('memoryType', filters.memoryType);
  if (filters.key) params.append('key', filters.key);
  if (filters.limit) params.append('limit', filters.limit.toString());
  if (filters.offset) params.append('offset', filters.offset.toString());

  const response = await api.get(`/api/memory?${params}`);
  return response.data;
};

// Description: Create a new memory entry
// Endpoint: POST /api/memory
// Request: { agentId: string, memoryType: string, key: string, data: any, metadata?: any }
// Response: MemoryEntry
export const createMemoryEntry = async (data: {
  agentId: string;
  memoryType: string;
  key: string;
  data: any;
  metadata?: any;
}) => {
  const response = await api.post('/api/memory', data);
  return response.data;
};

// Description: Update a memory entry
// Endpoint: PUT /api/memory/:id
// Request: { data: any, metadata?: any }
// Response: MemoryEntry
export const updateMemoryEntry = async (id: string, data: { data: any; metadata?: any }) => {
  const response = await api.put(`/api/memory/${id}`, data);
  return response.data;
};

// Description: Delete memory entry
// Endpoint: DELETE /api/memory
// Request: { agentId: string, memoryType: string, key: string }
// Response: { message: string }
export const deleteMemoryEntry = async (params: {
  agentId: string;
  memoryType: string;
  key: string;
}) => {
  const queryParams = new URLSearchParams();
  queryParams.append('agentId', params.agentId);
  queryParams.append('memoryType', params.memoryType);
  queryParams.append('key', params.key);

  const response = await api.delete(`/api/memory?${queryParams}`);
  return response.data;
};

// Description: Get memory entry by ID
// Endpoint: GET /api/memory/:id
// Response: MemoryEntry
export const getMemoryEntry = async (id: string) => {
  const response = await api.get(`/api/memory/${id}`);
  return response.data;
};