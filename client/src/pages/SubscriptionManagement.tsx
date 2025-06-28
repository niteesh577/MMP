import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/useToast';

interface Subscription {
  _id: string;
  agentId: string;
  type: string;
  endpoint?: string;
  events: string[];
  status: string;
  createdAt: string;
}

const eventOptions = [
  { value: 'memory_created', label: 'Memory Created' },
  { value: 'memory_updated', label: 'Memory Updated' },
  { value: 'memory_deleted', label: 'Memory Deleted' },
  { value: 'agent_status_changed', label: 'Agent Status Changed' }
];

const SubscriptionManagement = () => {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [agents, setAgents] = useState<{ agentId: string; name: string }[]>([]);
  const [form, setForm] = useState({
    agentId: '',
    type: 'SSE',
    endpoint: '',
    events: [] as string[]
  });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const fetchSubscriptions = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3000/api/subscriptions', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setSubscriptions(data);
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to fetch subscriptions', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const fetchAgents = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3000/api/agents', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setAgents(data.map((a: any) => ({ agentId: a.agentId, name: a.name })));
    } catch {}
  };

  useEffect(() => {
    fetchSubscriptions();
    fetchAgents();
  }, []);

  const handleFormChange = (field: string, value: any) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleEventToggle = (event: string) => {
    setForm(prev => ({
      ...prev,
      events: prev.events.includes(event)
        ? prev.events.filter(e => e !== event)
        : [...prev.events, event]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.agentId || !form.type || form.events.length === 0 || (form.type === 'WEBHOOK' && !form.endpoint)) {
      toast({ title: 'Error', description: 'Please fill all required fields', variant: 'destructive' });
      return;
    }
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3000/api/subscriptions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(form)
      });
      if (!response.ok) throw new Error('Failed to create subscription');
      toast({ title: 'Success', description: 'Subscription created' });
      setForm({ agentId: '', type: 'SSE', endpoint: '', events: [] });
      fetchSubscriptions();
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to create subscription', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this subscription?')) return;
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:3000/api/subscriptions/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) throw new Error('Failed to delete');
      toast({ title: 'Deleted', description: 'Subscription deleted' });
      fetchSubscriptions();
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to delete subscription', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Subscription Management</h1>
          <p className="text-muted-foreground">Manage real-time event subscriptions for agents</p>
        </div>
      </div>

      {/* Create Subscription Form */}
      <Card>
        <CardHeader>
          <CardTitle>Create Subscription</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Agent</Label>
                <Select value={form.agentId} onValueChange={v => handleFormChange('agentId', v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select agent" />
                  </SelectTrigger>
                  <SelectContent>
                    {agents.map(agent => (
                      <SelectItem key={agent.agentId} value={agent.agentId}>{agent.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Type</Label>
                <Select value={form.type} onValueChange={v => handleFormChange('type', v)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="SSE">Server-Sent Events</SelectItem>
                    <SelectItem value="WEBHOOK">Webhook</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            {form.type === 'WEBHOOK' && (
              <div>
                <Label>Webhook URL</Label>
                <Input
                  value={form.endpoint}
                  onChange={e => handleFormChange('endpoint', e.target.value)}
                  placeholder="https://your-webhook-endpoint.com"
                />
              </div>
            )}
            <div>
              <Label>Event Filters</Label>
              <div className="flex flex-wrap gap-4 mt-2">
                {eventOptions.map(opt => (
                  <div key={opt.value} className="flex items-center gap-2">
                    <Checkbox
                      checked={form.events.includes(opt.value)}
                      onCheckedChange={() => handleEventToggle(opt.value)}
                      id={opt.value}
                    />
                    <Label htmlFor={opt.value}>{opt.label}</Label>
                  </div>
                ))}
              </div>
            </div>
            <Button type="submit" disabled={loading}>
              {loading ? 'Saving...' : 'Subscribe'}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Subscriptions Table */}
      <Card>
        <CardHeader>
          <CardTitle>Active Subscriptions</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Agent</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Endpoint</TableHead>
                <TableHead>Events</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {subscriptions.map(sub => (
                <TableRow key={sub._id}>
                  <TableCell>{agents.find(a => a.agentId === sub.agentId)?.name || sub.agentId}</TableCell>
                  <TableCell><Badge>{sub.type}</Badge></TableCell>
                  <TableCell className="font-mono text-xs truncate max-w-xs">{sub.endpoint || '-'}</TableCell>
                  <TableCell>
                    {sub.events.map(e => (
                      <Badge key={e} className="mr-1 mb-1">{eventOptions.find(opt => opt.value === e)?.label || e}</Badge>
                    ))}
                  </TableCell>
                  <TableCell><Badge>{sub.status}</Badge></TableCell>
                  <TableCell>{new Date(sub.createdAt).toLocaleString()}</TableCell>
                  <TableCell>
                    <Button variant="destructive" size="sm" onClick={() => handleDelete(sub._id)} disabled={loading}>
                      Delete
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default SubscriptionManagement; 