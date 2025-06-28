import api from './api';

export interface AuditLog {
  _id: string;
  agentId: string;
  action: string;
  resource: string;
  resourceId: string;
  details: any;
  ipAddress: string;
  userAgent: string;
  timestamp: string;
  userId?: string;
}

// Description: Get audit logs with filters
// Endpoint: GET /api/audit-logs
// Request: { agentId?: string, action?: string, resource?: string, fromDate?: string, toDate?: string, limit?: number, offset?: number }
// Response: { logs: AuditLog[], pagination: { total: number, limit: number, offset: number, hasMore: boolean } }
export const getAuditLogs = async (filters: {
  agentId?: string;
  action?: string;
  resource?: string;
  fromDate?: string;
  toDate?: string;
  limit?: number;
  offset?: number;
}) => {
  const params = new URLSearchParams();
  if (filters.agentId) params.append('agentId', filters.agentId);
  if (filters.action) params.append('action', filters.action);
  if (filters.resource) params.append('resource', filters.resource);
  if (filters.fromDate) params.append('fromDate', filters.fromDate);
  if (filters.toDate) params.append('toDate', filters.toDate);
  if (filters.limit) params.append('limit', filters.limit.toString());
  if (filters.offset) params.append('offset', filters.offset.toString());

  const response = await api.get(`/api/audit-logs?${params}`);
  return response.data;
};

// Description: Get audit log by ID
// Endpoint: GET /api/audit-logs/:id
// Response: AuditLog
export const getAuditLog = async (id: string) => {
  const response = await api.get(`/api/audit-logs/${id}`);
  return response.data;
};

// Description: Export audit logs
// Endpoint: GET /api/audit-logs/export
// Request: { agentId?: string, action?: string, resource?: string, fromDate?: string, toDate?: string, format?: 'csv' | 'json' }
// Response: File download
export const exportAuditLogs = async (filters: {
  agentId?: string;
  action?: string;
  resource?: string;
  fromDate?: string;
  toDate?: string;
  format?: 'csv' | 'json';
}) => {
  const params = new URLSearchParams();
  if (filters.agentId) params.append('agentId', filters.agentId);
  if (filters.action) params.append('action', filters.action);
  if (filters.resource) params.append('resource', filters.resource);
  if (filters.fromDate) params.append('fromDate', filters.fromDate);
  if (filters.toDate) params.append('toDate', filters.toDate);
  if (filters.format) params.append('format', filters.format);

  const response = await api.get(`/api/audit-logs/export?${params}`, {
    responseType: 'blob'
  });
  return response.data;
};