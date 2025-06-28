import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { getMemoryEntries, deleteMemoryEntry, MemoryEntry } from "@/api/memory"
import { getAgents, Agent } from "@/api/agents"
import { useToast } from "@/hooks/useToast"
import {
  Database,
  Search,
  Filter,
  Eye,
  Edit,
  Trash2,
  Download,
  Calendar,
  X
} from "lucide-react"

export function MemoryBrowser() {
  const [memoryEntries, setMemoryEntries] = useState<MemoryEntry[]>([])
  const [agents, setAgents] = useState<Agent[]>([])
  const [selectedEntries, setSelectedEntries] = useState<string[]>([])
  const [filters, setFilters] = useState({
    agentId: "",
    type: "",
    search: "",
    fromDate: "",
    toDate: ""
  })
  const [selectedEntry, setSelectedEntry] = useState<MemoryEntry | null>(null)
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    fetchData()
  }, [])

  useEffect(() => {
    fetchMemoryEntries()
  }, [filters])

  const fetchData = async () => {
    try {
      console.log('Fetching agents and memory data...')
      const [agentsResponse, memoryResponse] = await Promise.all([
        getAgents(),
        getMemoryEntries({})
      ])

      setAgents(agentsResponse)
      setMemoryEntries(memoryResponse.memories || [])
    } catch (error) {
      console.error('Error fetching data:', error)
      toast({
        title: "Error",
        description: "Failed to load memory data",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const fetchMemoryEntries = async () => {
    try {
      console.log('Fetching memory entries with filters:', filters)
      const response = await getMemoryEntries({
        agentId: filters.agentId,
        memoryType: filters.type,
        key: filters.search
      })
      setMemoryEntries(response.memories || [])
    } catch (error) {
      console.error('Error fetching memory entries:', error)
      toast({
        title: "Error",
        description: "Failed to load memory entries",
        variant: "destructive"
      })
    }
  }

  const handleDeleteSelected = async () => {
    if (selectedEntries.length === 0) return

    try {
      console.log('Deleting selected entries:', selectedEntries)
      // For now, we'll delete them one by one since the API expects specific parameters
      for (const entryId of selectedEntries) {
        const entry = memoryEntries.find(e => e._id === entryId)
        if (entry) {
          await deleteMemoryEntry({
            agentId: entry.agentId,
            memoryType: entry.memoryType,
            key: entry.key
          })
        }
      }

      toast({
        title: "Success",
        description: `${selectedEntries.length} memory entries deleted successfully`
      })
      setSelectedEntries([])
      fetchMemoryEntries()
    } catch (error: any) {
      console.error('Error deleting entries:', error)
      toast({
        title: "Error",
        description: error.message || "Failed to delete entries",
        variant: "destructive"
      })
    }
  }

  const handleSelectEntry = (entryId: string, checked: boolean) => {
    if (checked) {
      setSelectedEntries([...selectedEntries, entryId])
    } else {
      setSelectedEntries(selectedEntries.filter(id => id !== entryId))
    }
  }

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedEntries(memoryEntries.map(entry => entry._id))
    } else {
      setSelectedEntries([])
    }
  }

  const clearFilters = () => {
    setFilters({
      agentId: "",
      type: "",
      search: "",
      fromDate: "",
      toDate: ""
    })
  }

  const uniqueMemoryTypes = [...new Set(memoryEntries.map(entry => entry.memoryType))]

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-slate-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-20 bg-slate-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
          Memory Browser
        </h1>
        <p className="text-slate-600 dark:text-slate-400 mt-2">
          Explore and manage memory entries across all agents
        </p>
      </div>

      {/* Filters */}
      <Card className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border-slate-200/50 dark:border-slate-700/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
            <div className="space-y-2">
              <label className="text-sm font-medium">Agent</label>
              <Select value={filters.agentId} onValueChange={(value) => setFilters({...filters, agentId: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="All agents" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All agents</SelectItem>
                  {agents.map((agent) => (
                    <SelectItem key={agent._id} value={agent.agentId}>
                      {agent.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Memory Type</label>
              <Select value={filters.type} onValueChange={(value) => setFilters({...filters, type: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="All types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All types</SelectItem>
                  {uniqueMemoryTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">From Date</label>
              <Input
                type="date"
                value={filters.fromDate}
                onChange={(e) => setFilters({...filters, fromDate: e.target.value})}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">To Date</label>
              <Input
                type="date"
                value={filters.toDate}
                onChange={(e) => setFilters({...filters, toDate: e.target.value})}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
                <Input
                  placeholder="Search keys..."
                  value={filters.search}
                  onChange={(e) => setFilters({...filters, search: e.target.value})}
                  className="pl-10"
                />
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" onClick={clearFilters}>
              <X className="h-4 w-4 mr-2" />
              Clear Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      {selectedEntries.length > 0 && (
        <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium">
                {selectedEntries.length} entries selected
              </p>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Export Selected
                </Button>
                <Button variant="destructive" size="sm" onClick={handleDeleteSelected}>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Selected
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Memory Entries Table */}
      <Card className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border-slate-200/50 dark:border-slate-700/50">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Memory Entries ({memoryEntries.length})
            </CardTitle>
            <div className="flex items-center space-x-2">
              <Checkbox
                checked={selectedEntries.length === memoryEntries.length && memoryEntries.length > 0}
                onCheckedChange={handleSelectAll}
              />
              <label className="text-sm font-medium">Select All</label>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {memoryEntries.map((entry) => (
              <div key={entry._id} className="flex items-center space-x-4 p-4 rounded-lg bg-slate-50 dark:bg-slate-700/50 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
                <Checkbox
                  checked={selectedEntries.includes(entry._id)}
                  onCheckedChange={(checked) => handleSelectEntry(entry._id, checked as boolean)}
                />
                
                <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <p className="font-medium">{entry.key}</p>
                    <p className="text-sm text-muted-foreground">{entry.agentId}</p>
                  </div>
                  
                  <div>
                    <Badge variant="outline">{entry.memoryType}</Badge>
                  </div>
                  
                  <div>
                    <p className="text-sm text-muted-foreground">
                      {new Date(entry.createdAt).toLocaleDateString()}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      v{entry.metadata?.version || 1}
                    </p>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedEntry(entry)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteSelected()}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {memoryEntries.length === 0 && (
            <div className="text-center py-12">
              <Database className="h-12 w-12 text-slate-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100 mb-2">
                No memory entries found
              </h3>
              <p className="text-slate-600 dark:text-slate-400">
                Try adjusting your filters or check back later
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Memory Entry Detail Dialog */}
      <Dialog open={!!selectedEntry} onOpenChange={() => setSelectedEntry(null)}>
        <DialogContent className="bg-white dark:bg-slate-800 max-w-2xl">
          <DialogHeader>
            <DialogTitle>Memory Entry Details</DialogTitle>
            <DialogDescription>
              {selectedEntry?.key} - {selectedEntry?.memoryType}
            </DialogDescription>
          </DialogHeader>
          {selectedEntry && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Agent ID</label>
                  <p className="text-sm text-muted-foreground">{selectedEntry.agentId}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Type</label>
                  <p className="text-sm text-muted-foreground">{selectedEntry.memoryType}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Key</label>
                  <p className="text-sm text-muted-foreground">{selectedEntry.key}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Version</label>
                  <p className="text-sm text-muted-foreground">v{selectedEntry.metadata?.version || 1}</p>
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium">Data</label>
                <ScrollArea className="h-64 w-full rounded-md border p-4 mt-2">
                  <pre className="text-sm">
                    {JSON.stringify(selectedEntry.data, null, 2)}
                  </pre>
                </ScrollArea>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}