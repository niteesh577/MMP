import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { getAgents, Agent } from "@/api/agents"
import { getMemoryEntries } from "@/api/memory"
import { getAuditLogs } from "@/api/auditLogs"
import { useToast } from "@/hooks/useToast"
import {
  Users,
  Database,
  Activity,
  TrendingUp,
  Server,
  Shield,
  Clock,
  AlertCircle
} from "lucide-react"

export function Dashboard() {
  const [agents, setAgents] = useState<Agent[]>([])
  const [stats, setStats] = useState({
    totalAgents: 0,
    onlineAgents: 0,
    totalMemoryEntries: 0,
    recentActivity: 0
  })
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        console.log('Fetching dashboard data...')
        const [agentsResponse, memoryResponse, logsResponse] = await Promise.all([
          getAgents(),
          getMemoryEntries({}),
          getAuditLogs({})
        ])

        const agentsData = agentsResponse as { agents: Agent[] }
        const memoryData = memoryResponse as { total: number }
        const logsData = logsResponse as { total: number }

        setAgents(agentsData.agents)
        setStats({
          totalAgents: agentsData.agents.length,
          onlineAgents: agentsData.agents.filter(a => a.status === 'online').length,
          totalMemoryEntries: memoryData.total,
          recentActivity: logsData.total
        })
      } catch (error) {
        console.error('Error fetching dashboard data:', error)
        toast({
          title: "Error",
          description: "Failed to load dashboard data",
          variant: "destructive"
        })
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [toast])

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-slate-200 rounded w-1/4 mb-4"></div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-slate-200 rounded-lg"></div>
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
          Memory Protocol Dashboard
        </h1>
        <p className="text-slate-600 dark:text-slate-400 mt-2">
          Monitor and manage your AI agent memory ecosystem
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border-slate-200/50 dark:border-slate-700/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Agents</CardTitle>
            <Users className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalAgents}</div>
            <p className="text-xs text-muted-foreground">
              {stats.onlineAgents} online
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border-slate-200/50 dark:border-slate-700/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Memory Entries</CardTitle>
            <Database className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalMemoryEntries}</div>
            <p className="text-xs text-muted-foreground">
              Across all agents
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border-slate-200/50 dark:border-slate-700/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Recent Activity</CardTitle>
            <Activity className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.recentActivity}</div>
            <p className="text-xs text-muted-foreground">
              Actions today
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border-slate-200/50 dark:border-slate-700/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">System Status</CardTitle>
            <Server className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">Healthy</div>
            <p className="text-xs text-muted-foreground">
              All systems operational
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Agents */}
      <Card className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border-slate-200/50 dark:border-slate-700/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Recent Agents
          </CardTitle>
          <CardDescription>
            Latest registered AI agents in your system
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {agents.slice(0, 3).map((agent) => (
              <div key={agent._id} className="flex items-center justify-between p-4 rounded-lg bg-slate-50 dark:bg-slate-700/50">
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${agent.status === 'online' ? 'bg-green-500' : 'bg-slate-400'}`} />
                  <div>
                    <p className="font-medium">{agent.name}</p>
                    <p className="text-sm text-muted-foreground">{agent.agentId}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={agent.status === 'online' ? 'default' : 'secondary'}>
                    {agent.status}
                  </Badge>
                  <Badge variant="outline">
                    {agent.memoryTypes.length} types
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}