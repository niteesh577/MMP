import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/useToast';

interface ApiKey {
  id: string;
  name: string;
  key: string;
  permissions: string[];
  isActive: boolean;
  lastUsed?: string;
  expiresAt?: string;
  createdAt: string;
}

const AuthenticationManagement = () => {
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [jwtConfig, setJwtConfig] = useState<{ secret: string; expiresIn: string; algorithm: string } | null>(null);
  const [newKeyName, setNewKeyName] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const fetchApiKeys = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3000/api/auth/api-keys', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setApiKeys(data);
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to fetch API keys', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const fetchJwtConfig = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3000/api/auth/jwt-config', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setJwtConfig(data);
    } catch {}
  };

  useEffect(() => {
    fetchApiKeys();
    fetchJwtConfig();
  }, []);

  const handleCreateKey = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKeyName) {
      toast({ title: 'Error', description: 'Key name required', variant: 'destructive' });
      return;
    }
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3000/api/auth/api-keys', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name: newKeyName })
      });
      if (!response.ok) throw new Error('Failed to create API key');
      const data = await response.json();
      toast({ title: 'Success', description: `API key created: ${data.key}` });
      setNewKeyName('');
      fetchApiKeys();
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to create API key', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteKey = async (id: string) => {
    if (!window.confirm('Delete this API key?')) return;
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:3000/api/auth/api-keys/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) throw new Error('Failed to delete API key');
      toast({ title: 'Deleted', description: 'API key deleted' });
      fetchApiKeys();
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to delete API key', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Authentication Management</h1>
          <p className="text-muted-foreground">Manage API keys and JWT configuration</p>
        </div>
      </div>

      {/* API Keys Section */}
      <Card>
        <CardHeader>
          <CardTitle>API Keys</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="flex gap-2 mb-4" onSubmit={handleCreateKey}>
            <Input
              placeholder="Key name"
              value={newKeyName}
              onChange={e => setNewKeyName(e.target.value)}
              disabled={loading}
            />
            <Button type="submit" disabled={loading}>
              {loading ? 'Creating...' : 'Generate New Key'}
            </Button>
          </form>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Key</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Last Used</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {apiKeys.map(key => (
                <TableRow key={key.id}>
                  <TableCell>{key.name}</TableCell>
                  <TableCell className="font-mono text-xs">{key.key}</TableCell>
                  <TableCell>{new Date(key.createdAt).toLocaleString()}</TableCell>
                  <TableCell>{key.lastUsed ? new Date(key.lastUsed).toLocaleString() : '-'}</TableCell>
                  <TableCell>
                    <Button variant="destructive" size="sm" onClick={() => handleDeleteKey(key.id)} disabled={loading}>
                      Delete
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* JWT Configuration Section */}
      <Card>
        <CardHeader>
          <CardTitle>JWT Configuration</CardTitle>
        </CardHeader>
        <CardContent>
          {jwtConfig ? (
            <div className="space-y-2">
              <div>
                <Label>Secret</Label>
                <Input value={jwtConfig.secret} readOnly type="password" />
              </div>
              <div>
                <Label>Expires In</Label>
                <Input value={jwtConfig.expiresIn} readOnly />
              </div>
              <div>
                <Label>Algorithm</Label>
                <Input value={jwtConfig.algorithm} readOnly />
              </div>
              <Button variant="outline" disabled>
                Update JWT Settings (edit .env)
              </Button>
            </div>
          ) : (
            <div>Loading JWT configuration...</div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AuthenticationManagement; 