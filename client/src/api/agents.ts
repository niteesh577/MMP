import api from './api';

export interface Agent {
  _id: string;
  agentId: string;
  name: string;
  memoryTypes: string[];
  schemaUrl?: string;
  authenticationMethod: 'Bearer JWT' | 'API Key';
  status: 'online' | 'offline';
  lastSeen: string;
  createdAt: string;
  updatedAt: string;
}

// Description: Get all agents
// Endpoint: GET /api/agents
// Response: Agent[]
export const getAgents = async () => {
  const response = await api.get('/api/agents');
  return response.data;
};

// Description: Register a new agent
// Endpoint: POST /api/agents
// Request: { agentId: string, name: string, memoryTypes: string[], schemaUrl?: string, authenticationMethod?: string }
// Response: Agent
export const registerAgent = async (data: {
  agentId: string;
  name: string;
  memoryTypes: string[];
  schemaUrl?: string;
  authenticationMethod?: 'Bearer JWT' | 'API Key';
}) => {
  const response = await api.post('/api/agents', data);
  return response.data;
};

// Description: Delete an agent
// Endpoint: DELETE /api/agents/:id
// Response: { message: string }
export const deleteAgent = async (id: string) => {
  const response = await api.delete(`/api/agents/${id}`);
  return response.data;
};

// Description: Update agent status
// Endpoint: PATCH /api/agents/:id/status
// Request: { status: 'online' | 'offline' }
// Response: Agent
export const updateAgentStatus = async (id: string, status: 'online' | 'offline') => {
  const response = await api.patch(`/api/agents/${id}/status`, { status });
  return response.data;
};

// Description: Get agent discovery information
// Endpoint: GET /.well-known/memory-agent.json
// Response: { name: string, version: string, description: string, endpoints: object, supportedMemoryTypes: string[] }
export const getAgentDiscovery = async () => {
  const response = await api.get('/.well-known/memory-agent.json');
  return response.data;
};