import api from './api';

export interface Schema {
  _id: string;
  name: string;
  version: string;
  description: string;
  memoryTypes: string[];
  schema: any;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// Description: Get all schemas
// Endpoint: GET /api/schemas
// Response: Schema[]
export const getSchemas = async () => {
  const response = await api.get('/api/schemas');
  return response.data;
};

// Description: Create a new schema
// Endpoint: POST /api/schemas
// Request: { name: string, version: string, description: string, memoryTypes: string[], schema: any }
// Response: Schema
export const createSchema = async (data: {
  name: string;
  version: string;
  description: string;
  memoryTypes: string[];
  schema: any;
}) => {
  const response = await api.post('/api/schemas', data);
  return response.data;
};

// Description: Update a schema
// Endpoint: PUT /api/schemas/:id
// Request: { name?: string, version?: string, description?: string, memoryTypes?: string[], schema?: any, isActive?: boolean }
// Response: Schema
export const updateSchema = async (id: string, data: {
  name?: string;
  version?: string;
  description?: string;
  memoryTypes?: string[];
  schema?: any;
  isActive?: boolean;
}) => {
  const response = await api.put(`/api/schemas/${id}`, data);
  return response.data;
};

// Description: Delete a schema
// Endpoint: DELETE /api/schemas/:id
// Response: { message: string }
export const deleteSchema = async (id: string) => {
  const response = await api.delete(`/api/schemas/${id}`);
  return response.data;
};

// Description: Get schema by ID
// Endpoint: GET /api/schemas/:id
// Response: Schema
export const getSchema = async (id: string) => {
  const response = await api.get(`/api/schemas/${id}`);
  return response.data;
};

// Description: Validate memory data against schema
// Endpoint: POST /api/schemas/:id/validate
// Request: { memoryType: string, data: any }
// Response: { isValid: boolean, errors?: string[] }
export const validateMemoryData = async (id: string, data: {
  memoryType: string;
  data: any;
}) => {
  const response = await api.post(`/api/schemas/${id}/validate`, data);
  return response.data;
};

// Description: Get schema templates
// Endpoint: GET /api/schemas/templates
// Request: {}
// Response: { templates: Array<{ name: string, schema: any }> }
export const getSchemaTemplates = () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        templates: [
          {
            name: 'User Profile Template',
            schema: {
              type: 'object',
              properties: {
                name: { type: 'string' },
                email: { type: 'string', format: 'email' },
                preferences: { type: 'object' }
              },
              required: ['name', 'email']
            }
          },
          {
            name: 'Conversation History Template',
            schema: {
              type: 'object',
              properties: {
                messages: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      role: { type: 'string' },
                      content: { type: 'string' }
                    }
                  }
                }
              }
            }
          },
          {
            name: 'Facts Database Template',
            schema: {
              type: 'object',
              properties: {
                fact: { type: 'string' },
                category: { type: 'string' },
                confidence: { type: 'number', minimum: 0, maximum: 1 },
                source: { type: 'string' }
              },
              required: ['fact', 'category']
            }
          }
        ]
      });
    }, 500);
  });
};