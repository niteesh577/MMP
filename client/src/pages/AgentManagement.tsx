import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { getAgents, registerAgent, deleteAgent, Agent } from "@/api/agents"
import { useToast } from "@/hooks/useToast"
import { useForm } from "react-hook-form"
import {
  Users,
  Plus,
  Search,
  Trash2,
  Eye,
  Settings,
  Circle
} from "lucide-react"

const memoryTypeOptions = [
  "user_profile",
  "conversation_history",
  "facts",
  "preferences",
  "itineraries"
]

export function AgentManagement() {
  const [agents, setAgents] = useState<Agent[]>([])
  const [filteredAgents, setFilteredAgents] = useState<Agent[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const { toast } = useToast()
  const { register, handleSubmit, reset, setValue, watch } = useForm()

  const selectedMemoryTypes = watch("memoryTypes") || []

  useEffect(() => {
    fetchAgents()
  }, [])

  useEffect(() => {
    const filtered = agents.filter(agent =>
      agent.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      agent.agentId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      agent.memoryTypes.some(type => type.toLowerCase().includes(searchTerm.toLowerCase()))
    )
    setFilteredAgents(filtered)
  }, [agents, searchTerm])

  const fetchAgents = async () => {
    try {
      console.log('Fetching agents...')
      const response = await getAgents() as { agents: Agent[] }
      setAgents(response.agents)
      setFilteredAgents(response.agents)
    } catch (error) {
      console.error('Error fetching agents:', error)
      toast({
        title: "Error",
        description: "Failed to load agents",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const onSubmit = async (data: any) => {
    try {
      console.log('Registering new agent:', data)
      const response = await registerAgent({
        agentId: data.agentId,
        name: data.name,
        memoryTypes: selectedMemoryTypes,
        schemaUrl: data.schemaUrl,
        authMethod: data.authMethod
      }) as { success: boolean; message: string; agent: Agent }

      if (response.success) {
        toast({
          title: "Success",
          description: response.message
        })
        setIsDialogOpen(false)
        reset()
        fetchAgents()
      }
    } catch (error: any) {
      console.error('Error registering agent:', error)
      toast({
        title: "Error",
        description: error.message || "Failed to register agent",
        variant: "destructive"
      })
    }
  }

  const handleDeleteAgent = async (id: string) => {
    try {
      console.log('Deleting agent:', id)
      const response = await deleteAgent(id) as { success: boolean; message: string }
      
      if (response.success) {
        toast({
          title: "Success",
          description: response.message
        })
        fetchAgents()
      }
    } catch (error: any) {
      console.error('Error deleting agent:', error)
      toast({
        title: "Error",
        description: error.message || "Failed to delete agent",
        variant: "destructive"
      })
    }
  }

  const handleMemoryTypeChange = (memoryType: string, checked: boolean) => {
    const current = selectedMemoryTypes || []
    if (checked) {
      setValue("memoryTypes", [...current, memoryType])
    } else {
      setValue("memoryTypes", current.filter((type: string) => type !== memoryType))
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-slate-200 rounded w-1/4 mb-4"></div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-48 bg-slate-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            Agent Management
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-2">
            Register and manage AI agents in your memory protocol system
          </p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600">
              <Plus className="h-4 w-4 mr-2" />
              Register New Agent
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-white dark:bg-slate-800 max-w-md">
            <DialogHeader>
              <DialogTitle>Register New Agent</DialogTitle>
              <DialogDescription>
                Add a new AI agent to your memory protocol system
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="agentId">Agent ID</Label>
                <Input
                  id="agentId"
                  {...register("agentId", { required: true })}
                  placeholder="agent-001"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="name">Agent Name</Label>
                <Input
                  id="name"
                  {...register("name", { required: true })}
                  placeholder="Customer Support Bot"
                />
              </div>

              <div className="space-y-2">
                <Label>Memory Types</Label>
                <div className="grid grid-cols-2 gap-2">
                  {memoryTypeOptions.map((type) => (
                    <div key={type} className="flex items-center space-x-2">
                      <Checkbox
                        id={type}
                        checked={selectedMemoryTypes.includes(type)}
                        onCheckedChange={(checked) => handleMemoryTypeChange(type, checked as boolean)}
                      />
                      <Label htmlFor={type} className="text-sm">{type}</Label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="schemaUrl">Schema URL</Label>
                <Input
                  id="schemaUrl"
                  {...register("schemaUrl", { required: true })}
                  placeholder="https://api.example.com/schemas/agent.json"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="authMethod">Authentication Method</Label>
                <Select onValueChange={(value) => setValue("authMethod", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select authentication method" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Bearer JWT">Bearer JWT</SelectItem>
                    <SelectItem value="API Key">API Key</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" className="bg-gradient-to-r from-blue-500 to-indigo-500">
                  Save Agent
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
        <Input
          placeholder="Search agents by name, ID, or memory type..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm"
        />
      </div>

      {/* Agents Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredAgents.map((agent) => (
          <Card key={agent._id} className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border-slate-200/50 dark:border-slate-700/50 hover:shadow-lg transition-all duration-200">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{agent.name}</CardTitle>
                <div className="flex items-center gap-1">
                  <Circle className={`h-3 w-3 ${agent.status === 'online' ? 'fill-green-500 text-green-500' : 'fill-slate-400 text-slate-400'}`} />
                  <Badge variant={agent.status === 'online' ? 'default' : 'secondary'}>
                    {agent.status}
                  </Badge>
                </div>
              </div>
              <CardDescription>{agent.agentId}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm font-medium mb-2">Memory Types:</p>
                <div className="flex flex-wrap gap-1">
                  {agent.memoryTypes.map((type) => (
                    <Badge key={type} variant="outline" className="text-xs">
                      {type}
                    </Badge>
                  ))}
                </div>
              </div>
              
              <div>
                <p className="text-sm font-medium">Authentication:</p>
                <p className="text-sm text-muted-foreground">{agent.authMethod}</p>
              </div>

              <div>
                <p className="text-sm font-medium">Last Seen:</p>
                <p className="text-sm text-muted-foreground">
                  {new Date(agent.lastSeen).toLocaleDateString()}
                </p>
              </div>

              <div className="flex gap-2 pt-2">
                <Button variant="outline" size="sm" className="flex-1">
                  <Eye className="h-4 w-4 mr-1" />
                  View
                </Button>
                <Button variant="outline" size="sm" className="flex-1">
                  <Settings className="h-4 w-4 mr-1" />
                  Edit
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => handleDeleteAgent(agent._id)}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredAgents.length === 0 && !loading && (
        <div className="text-center py-12">
          <Users className="h-12 w-12 text-slate-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100 mb-2">
            No agents found
          </h3>
          <p className="text-slate-600 dark:text-slate-400">
            {searchTerm ? "Try adjusting your search terms" : "Get started by registering your first agent"}
          </p>
        </div>
      )}
    </div>
  )
}