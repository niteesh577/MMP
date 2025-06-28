import api from './api';

export interface Subscription {
  _id: string;
  agentId: string;
  plan: string;
  status: 'active' | 'inactive' | 'cancelled' | 'expired';
  startDate: string;
  endDate: string;
  features: string[];
  limits: {
    memoryEntries: number;
    apiCalls: number;
    storageGB: number;
  };
  usage: {
    memoryEntries: number;
    apiCalls: number;
    storageGB: number;
  };
  createdAt: string;
  updatedAt: string;
}

// Description: Get all subscriptions
// Endpoint: GET /api/subscriptions
// Response: Subscription[]
export const getSubscriptions = async () => {
  const response = await api.get('/api/subscriptions');
  return response.data;
};

// Description: Create a new subscription
// Endpoint: POST /api/subscriptions
// Request: { agentId: string, plan: string, features: string[], limits: object }
// Response: Subscription
export const createSubscription = async (data: {
  agentId: string;
  plan: string;
  features: string[];
  limits: {
    memoryEntries: number;
    apiCalls: number;
    storageGB: number;
  };
}) => {
  const response = await api.post('/api/subscriptions', data);
  return response.data;
};

// Description: Update subscription status
// Endpoint: PATCH /api/subscriptions/:id/status
// Request: { status: 'active' | 'inactive' | 'cancelled' | 'expired' }
// Response: Subscription
export const updateSubscriptionStatus = async (id: string, status: 'active' | 'inactive' | 'cancelled' | 'expired') => {
  const response = await api.patch(`/api/subscriptions/${id}/status`, { status });
  return response.data;
};

// Description: Get subscription usage
// Endpoint: GET /api/subscriptions/:id/usage
// Response: { usage: object, limits: object }
export const getSubscriptionUsage = async (id: string) => {
  const response = await api.get(`/api/subscriptions/${id}/usage`);
  return response.data;
};

// Description: Get subscription by ID
// Endpoint: GET /api/subscriptions/:id
// Response: Subscription
export const getSubscription = async (id: string) => {
  const response = await api.get(`/api/subscriptions/${id}`);
  return response.data;
};