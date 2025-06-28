import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import { ThemeProvider } from "./components/ui/theme-provider"
import { Toaster } from "./components/ui/toaster"
import { AuthProvider } from "./contexts/AuthContext"
import { Login } from "./pages/Login"
import { Register } from "./pages/Register"
import { ProtectedRoute } from "./components/ProtectedRoute"
import { Layout } from "./components/Layout"
import { Dashboard } from "./pages/Dashboard"
import { AgentManagement } from "./pages/AgentManagement"
import { MemoryBrowser } from "./pages/MemoryBrowser"
import { SchemaManager } from "./pages/SchemaManager"
import ApiDocumentation from "./pages/ApiDocumentation"
import AuditLogs from "./pages/AuditLogs"
import SubscriptionManagement from "./pages/SubscriptionManagement"
import AuthenticationManagement from "./pages/AuthenticationManagement"

function App() {
  return (
    <AuthProvider>
      <ThemeProvider defaultTheme="light" storageKey="ui-theme">
        <Router>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
              <Route index element={<Dashboard />} />
              <Route path="agents" element={<AgentManagement />} />
              <Route path="memory" element={<MemoryBrowser />} />
              <Route path="schemas" element={<SchemaManager />} />
              <Route path="api-docs" element={<ApiDocumentation />} />
              <Route path="audit-logs" element={<AuditLogs />} />
              <Route path="subscriptions" element={<SubscriptionManagement />} />
              <Route path="auth-management" element={<AuthenticationManagement />} />
            </Route>
          </Routes>
        </Router>
        <Toaster />
      </ThemeProvider>
    </AuthProvider>
  )
}

export default App