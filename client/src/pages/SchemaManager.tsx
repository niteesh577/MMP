import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { getSchemas, updateSchema, getSchemaTemplates, Schema } from "@/api/schemas"
import { getAgents, Agent } from "@/api/agents"
import { useToast } from "@/hooks/useToast"
import {
  FileCode,
  CheckCircle,
  XCircle,
  Save,
  RotateCcw,
  Copy
} from "lucide-react"

export function SchemaManager() {
  const [schemas, setSchemas] = useState<Schema[]>([])
  const [agents, setAgents] = useState<Agent[]>([])
  const [templates, setTemplates] = useState<any[]>([])
  const [selectedAgent, setSelectedAgent] = useState("")
  const [selectedSchema, setSelectedSchema] = useState<Schema | null>(null)
  const [schemaContent, setSchemaContent] = useState("")
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    fetchData()
  }, [])

  useEffect(() => {
    if (selectedSchema) {
      setSchemaContent(JSON.stringify(selectedSchema.schema, null, 2))
    }
  }, [selectedSchema])

  const fetchData = async () => {
    try {
      console.log('Fetching schemas, agents, and templates...')
      const [schemasResponse, agentsResponse, templatesResponse] = await Promise.all([
        getSchemas(),
        getAgents(),
        getSchemaTemplates()
      ])

      const schemasData = schemasResponse as { schemas: Schema[] }
      const agentsData = agentsResponse as { agents: Agent[] }
      const templatesData = templatesResponse as { templates: any[] }

      setSchemas(schemasData.schemas)
      setAgents(agentsData.agents)
      setTemplates(templatesData.templates)

      if (schemasData.schemas.length > 0) {
        setSelectedSchema(schemasData.schemas[0])
      }
    } catch (error) {
      console.error('Error fetching data:', error)
      toast({
        title: "Error",
        description: "Failed to load schema data",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSaveSchema = async () => {
    if (!selectedSchema) return

    try {
      console.log('Saving schema:', selectedSchema._id)
      const parsedSchema = JSON.parse(schemaContent)
      const response = await updateSchema(selectedSchema._id, parsedSchema) as { success: boolean; message: string }

      if (response.success) {
        toast({
          title: "Success",
          description: response.message
        })
        fetchData()
      }
    } catch (error: any) {
      console.error('Error saving schema:', error)
      toast({
        title: "Error",
        description: error.message || "Failed to save schema. Please check JSON syntax.",
        variant: "destructive"
      })
    }
  }

  const handleResetSchema = () => {
    if (selectedSchema) {
      setSchemaContent(JSON.stringify(selectedSchema.schema, null, 2))
    }
  }

  const handleApplyTemplate = (template: any) => {
    setSchemaContent(JSON.stringify(template.schema, null, 2))
  }

  const filteredSchemas = selectedAgent
    ? schemas.filter(schema => schema.agentId === selectedAgent)
    : schemas

  const isValidJson = () => {
    try {
      JSON.parse(schemaContent)
      return true
    } catch {
      return false
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-slate-200 rounded w-1/4 mb-4"></div>
          <div className="grid gap-4 lg:grid-cols-3">
            <div className="h-96 bg-slate-200 rounded-lg"></div>
            <div className="lg:col-span-2 h-96 bg-slate-200 rounded-lg"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
          Schema Manager
        </h1>
        <p className="text-slate-600 dark:text-slate-400 mt-2">
          Define and validate JSON schemas for agent memory structures
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Schema List */}
        <Card className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border-slate-200/50 dark:border-slate-700/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileCode className="h-5 w-5" />
              Schemas
            </CardTitle>
            <CardDescription>
              Select a schema to edit
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Filter by Agent</label>
              <Select value={selectedAgent} onValueChange={setSelectedAgent}>
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
              {filteredSchemas.map((schema) => (
                <div
                  key={schema._id}
                  className={`p-3 rounded-lg cursor-pointer transition-colors ${
                    selectedSchema?._id === schema._id
                      ? 'bg-blue-100 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800'
                      : 'bg-slate-50 dark:bg-slate-700/50 hover:bg-slate-100 dark:hover:bg-slate-700'
                  }`}
                  onClick={() => setSelectedSchema(schema)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <p className="font-medium text-sm">{schema.memoryType}</p>
                    {schema.isValid ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : (
                      <XCircle className="h-4 w-4 text-red-500" />
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">{schema.agentId}</p>
                  <p className="text-xs text-muted-foreground">
                    Modified: {new Date(schema.lastModified).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>

            {filteredSchemas.length === 0 && (
              <div className="text-center py-8">
                <FileCode className="h-8 w-8 text-slate-400 mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">No schemas found</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Schema Editor */}
        <div className="lg:col-span-2 space-y-6">
          {/* Templates */}
          <Card className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border-slate-200/50 dark:border-slate-700/50">
            <CardHeader>
              <CardTitle>Schema Templates</CardTitle>
              <CardDescription>
                Quick start with pre-built schema templates
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {templates.map((template, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    onClick={() => handleApplyTemplate(template)}
                  >
                    <Copy className="h-4 w-4 mr-2" />
                    {template.name}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Editor */}
          <Card className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border-slate-200/50 dark:border-slate-700/50">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>
                    {selectedSchema ? `${selectedSchema.memoryType} Schema` : 'Select a Schema'}
                  </CardTitle>
                  {selectedSchema && (
                    <CardDescription>
                      Agent: {selectedSchema.agentId}
                    </CardDescription>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {isValidJson() ? (
                    <Badge variant="default" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Valid JSON
                    </Badge>
                  ) : (
                    <Badge variant="destructive">
                      <XCircle className="h-3 w-3 mr-1" />
                      Invalid JSON
                    </Badge>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {selectedSchema ? (
                <>
                  <Textarea
                    value={schemaContent}
                    onChange={(e) => setSchemaContent(e.target.value)}
                    className="font-mono text-sm min-h-[400px] bg-slate-50 dark:bg-slate-900"
                    placeholder="Enter JSON schema..."
                  />
                  
                  <div className="flex gap-2">
                    <Button
                      onClick={handleSaveSchema}
                      disabled={!isValidJson()}
                      className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600"
                    >
                      <Save className="h-4 w-4 mr-2" />
                      Save Schema
                    </Button>
                    <Button variant="outline" onClick={handleResetSchema}>
                      <RotateCcw className="h-4 w-4 mr-2" />
                      Reset
                    </Button>
                  </div>
                </>
              ) : (
                <div className="text-center py-12">
                  <FileCode className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100 mb-2">
                    No Schema Selected
                  </h3>
                  <p className="text-slate-600 dark:text-slate-400">
                    Select a schema from the list to start editing
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Preview */}
          {selectedSchema && isValidJson() && (
            <Card className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border-slate-200/50 dark:border-slate-700/50">
              <CardHeader>
                <CardTitle>Schema Preview</CardTitle>
                <CardDescription>
                  Example structure based on your schema
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-lg">
                  <pre className="text-sm text-slate-700 dark:text-slate-300">
                    {JSON.stringify(JSON.parse(schemaContent), null, 2)}
                  </pre>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}