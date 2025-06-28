import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Copy, ExternalLink, Play } from 'lucide-react';
import { useToast } from '@/hooks/useToast';

const ApiDocumentation = () => {
  const [selectedEndpoint, setSelectedEndpoint] = useState('agents');
  const [requestBody, setRequestBody] = useState('');
  const [response, setResponse] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const endpoints = {
    agents: {
      title: 'Agent Discovery',
      description: 'Manage AI agent registration and discovery',
      endpoints: [
        {
          method: 'GET',
          path: '/api/agents',
          description: 'Get all registered agents',
          auth: 'Optional'
        },
        {
          method: 'POST',
          path: '/api/agents',
          description: 'Register a new agent',
          auth: 'Required'
        },
        {
          method: 'DELETE',
          path: '/api/agents/:id',
          description: 'Delete an agent',
          auth: 'Required'
        }
      ]
    },
    memory: {
      title: 'Memory CRUD Operations',
      description: 'Create, read, update, and delete memory data',
      endpoints: [
        {
          method: 'GET',
          path: '/api/memory',
          description: 'Get memory entries with filtering',
          auth: 'Required'
        },
        {
          method: 'POST',
          path: '/api/memory',
          description: 'Create new memory entry',
          auth: 'Required'
        },
        {
          method: 'PUT',
          path: '/api/memory/:id',
          description: 'Update memory entry',
          auth: 'Required'
        },
        {
          method: 'DELETE',
          path: '/api/memory',
          description: 'Delete memory entry',
          auth: 'Required'
        }
      ]
    },
    schemas: {
      title: 'Schema Management',
      description: 'Manage JSON schemas for memory validation',
      endpoints: [
        {
          method: 'GET',
          path: '/api/schemas',
          description: 'Get all schemas',
          auth: 'Required'
        },
        {
          method: 'PUT',
          path: '/api/schemas/:id',
          description: 'Update schema for an agent',
          auth: 'Required'
        },
        {
          method: 'GET',
          path: '/api/schemas/templates',
          description: 'Get schema templates',
          auth: 'None'
        }
      ]
    },
    audit: {
      title: 'Audit Logs',
      description: 'View and export system audit logs',
      endpoints: [
        {
          method: 'GET',
          path: '/api/audit-logs',
          description: 'Get audit logs with filtering',
          auth: 'Required'
        },
        {
          method: 'GET',
          path: '/api/audit-logs/export',
          description: 'Export audit logs',
          auth: 'Required'
        }
      ]
    },
    subscriptions: {
      title: 'Subscriptions',
      description: 'Manage real-time event subscriptions',
      endpoints: [
        {
          method: 'GET',
          path: '/api/subscriptions',
          description: 'Get all subscriptions',
          auth: 'Required'
        },
        {
          method: 'POST',
          path: '/api/subscriptions',
          description: 'Create new subscription',
          auth: 'Required'
        },
        {
          method: 'DELETE',
          path: '/api/subscriptions/:id',
          description: 'Delete subscription',
          auth: 'Required'
        }
      ]
    }
  };

  const codeExamples = {
    curl: `curl -X GET "http://localhost:3000/api/agents" \\
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \\
  -H "Content-Type: application/json"`,

    javascript: `const response = await fetch('http://localhost:3000/api/agents', {
  method: 'GET',
  headers: {
    'Authorization': 'Bearer YOUR_JWT_TOKEN',
    'Content-Type': 'application/json'
  }
});

const agents = await response.json();`,

    python: `import requests

headers = {
    'Authorization': 'Bearer YOUR_JWT_TOKEN',
    'Content-Type': 'application/json'
}

response = requests.get('http://localhost:3000/api/agents', headers=headers)
agents = response.json()`
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: "Code example copied to clipboard",
    });
  };

  const testEndpoint = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:3000/api/${selectedEndpoint}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      const data = await response.json();
      setResponse(JSON.stringify(data, null, 2));
    } catch (error) {
      setResponse(JSON.stringify({ error: (error as Error).message }, null, 2));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">API Documentation</h1>
          <p className="text-muted-foreground">
            Interactive API explorer for the Memory Protocol Server
          </p>
        </div>
        <Button variant="outline" onClick={() => window.open('http://localhost:3000/api-docs', '_blank')}>
          <ExternalLink className="w-4 h-4 mr-2" />
          Open Swagger UI
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Endpoints List */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Endpoints</CardTitle>
              <CardDescription>Select an endpoint to view details</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {Object.entries(endpoints).map(([key, section]) => (
                  <div key={key} className="space-y-2">
                    <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
                      {section.title}
                    </h3>
                    {section.endpoints.map((endpoint, index) => (
                      <div
                        key={index}
                        className="p-3 rounded-lg border cursor-pointer hover:bg-muted transition-colors"
                        onClick={() => setSelectedEndpoint(key)}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant={endpoint.method === 'GET' ? 'default' : 'secondary'}>
                            {endpoint.method}
                          </Badge>
                          <span className="text-sm font-mono">{endpoint.path}</span>
                        </div>
                        <p className="text-sm text-muted-foreground">{endpoint.description}</p>
                        <Badge variant="outline" className="mt-1">
                          {endpoint.auth}
                        </Badge>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Try It Out */}
          <Card>
            <CardHeader>
              <CardTitle>Try It Out</CardTitle>
              <CardDescription>Test the API endpoints directly from this interface</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <Label htmlFor="endpoint">Endpoint</Label>
                  <Select value={selectedEndpoint} onValueChange={setSelectedEndpoint}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(endpoints).map(([key, section]) => (
                        <SelectItem key={key} value={key}>
                          {section.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button onClick={testEndpoint} disabled={isLoading}>
                  <Play className="w-4 h-4 mr-2" />
                  {isLoading ? 'Testing...' : 'Test'}
                </Button>
              </div>

              <div>
                <Label htmlFor="requestBody">Request Body (for POST/PUT requests)</Label>
                <Textarea
                  id="requestBody"
                  placeholder="Enter JSON request body..."
                  value={requestBody}
                  onChange={(e) => setRequestBody(e.target.value)}
                  rows={4}
                />
              </div>

              {response && (
                <div>
                  <Label>Response</Label>
                  <pre className="bg-muted p-4 rounded-lg text-sm overflow-auto max-h-64">
                    {response}
                  </pre>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Code Examples */}
          <Card>
            <CardHeader>
              <CardTitle>Code Examples</CardTitle>
              <CardDescription>Copy and paste these examples into your code</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="curl" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="curl">cURL</TabsTrigger>
                  <TabsTrigger value="javascript">JavaScript</TabsTrigger>
                  <TabsTrigger value="python">Python</TabsTrigger>
                </TabsList>
                {Object.entries(codeExamples).map(([language, code]) => (
                  <TabsContent key={language} value={language} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <Label className="text-sm font-medium">{language.toUpperCase()}</Label>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(code)}
                      >
                        <Copy className="w-4 h-4 mr-2" />
                        Copy
                      </Button>
                    </div>
                    <pre className="bg-muted p-4 rounded-lg text-sm overflow-auto">
                      <code>{code}</code>
                    </pre>
                  </TabsContent>
                ))}
              </Tabs>
            </CardContent>
          </Card>

          {/* Authentication */}
          <Card>
            <CardHeader>
              <CardTitle>Authentication</CardTitle>
              <CardDescription>Learn how to authenticate your requests</CardDescription>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="jwt">
                  <AccordionTrigger>JWT Authentication</AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-2">
                      <p className="text-sm">
                        Use JWT tokens for user authentication. Include the token in the Authorization header:
                      </p>
                      <pre className="bg-muted p-2 rounded text-sm">
                        Authorization: Bearer YOUR_JWT_TOKEN
                      </pre>
                      <p className="text-sm text-muted-foreground">
                        Get a JWT token by logging in through the /api/auth/login endpoint.
                      </p>
                    </div>
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="api-key">
                  <AccordionTrigger>API Key Authentication</AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-2">
                      <p className="text-sm">
                        Use API keys for agent authentication. Include the key in the x-api-key header:
                      </p>
                      <pre className="bg-muted p-2 rounded text-sm">
                        x-api-key: YOUR_API_KEY
                      </pre>
                      <p className="text-sm text-muted-foreground">
                        Generate API keys through the Authentication Management page.
                      </p>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ApiDocumentation; 