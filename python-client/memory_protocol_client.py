"""
Memory Protocol Python Client
A simple client library for interacting with the Memory Protocol API.
"""

import requests
import json
from typing import Dict, List, Optional, Any
from datetime import datetime


class MemoryProtocolClient:
    """
    Client for interacting with the Memory Protocol API.
    """
    
    def __init__(self, base_url: str, email: Optional[str] = None, password: Optional[str] = None):
        """
        Initialize the client.
        
        Args:
            base_url: The base URL of your Memory Protocol API
            email: Email for authentication (optional, can login later)
            password: Password for authentication (optional, can login later)
        """
        self.base_url = base_url.rstrip('/')
        self.access_token: Optional[str] = None
        self.refresh_token: Optional[str] = None
        
        if email and password:
            self.login(email, password)
    
    def _get_headers(self) -> Dict[str, str]:
        """Get headers for authenticated requests."""
        headers = {"Content-Type": "application/json"}
        if self.access_token:
            headers["Authorization"] = f"Bearer {self.access_token}"
        return headers
    
    def register(self, name: str, email: str, password: str) -> Dict[str, Any]:
        """
        Register a new user.
        
        Args:
            name: User's full name
            email: User's email
            password: User's password
            
        Returns:
            Response from the API
        """
        data = {"name": name, "email": email, "password": password}
        response = requests.post(f"{self.base_url}/api/auth/register", json=data)
        response.raise_for_status()
        
        result = response.json()
        if "accessToken" in result:
            self.access_token = result["accessToken"]
            self.refresh_token = result["refreshToken"]
        
        return result
    
    def login(self, email: str, password: str) -> Dict[str, Any]:
        """
        Login with email and password.
        
        Args:
            email: User's email
            password: User's password
            
        Returns:
            Response from the API
        """
        data = {"email": email, "password": password}
        response = requests.post(f"{self.base_url}/api/auth/login", json=data)
        response.raise_for_status()
        
        result = response.json()
        self.access_token = result["accessToken"]
        self.refresh_token = result["refreshToken"]
        
        return result
    
    def refresh_auth(self) -> Dict[str, Any]:
        """
        Refresh the access token using the refresh token.
        
        Returns:
            Response from the API
        """
        if not self.refresh_token:
            raise ValueError("No refresh token available")
        
        data = {"refreshToken": self.refresh_token}
        response = requests.post(f"{self.base_url}/api/auth/refresh", json=data)
        response.raise_for_status()
        
        result = response.json()
        self.access_token = result["accessToken"]
        self.refresh_token = result["refreshToken"]
        
        return result
    
    def create_agent(self, name: str, description: Optional[str] = None, capabilities: Optional[List[str]] = None) -> Dict[str, Any]:
        """
        Create a new agent.
        
        Args:
            name: Agent name
            description: Agent description
            capabilities: List of agent capabilities
            
        Returns:
            Agent data
        """
        data: Dict[str, Any] = {"name": name}
        if description:
            data["description"] = description
        if capabilities:
            data["capabilities"] = capabilities
        
        response = requests.post(f"{self.base_url}/api/agents", json=data, headers=self._get_headers())
        response.raise_for_status()
        return response.json()
    
    def get_agents(self) -> List[Dict[str, Any]]:
        """
        Get all agents for the authenticated user.
        
        Returns:
            List of agents
        """
        response = requests.get(f"{self.base_url}/api/agents", headers=self._get_headers())
        response.raise_for_status()
        return response.json()
    
    def store_memory(self, agent_id: str, memory_type: str, content: str, metadata: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        """
        Store memory for an agent.
        
        Args:
            agent_id: The agent's ID
            memory_type: Type of memory (e.g., 'conversation_history', 'user_profile')
            content: The memory content
            metadata: Optional metadata
            
        Returns:
            Memory data
        """
        data: Dict[str, Any] = {
            "agentId": agent_id,
            "type": memory_type,
            "content": content
        }
        if metadata:
            data["metadata"] = metadata
        
        response = requests.post(f"{self.base_url}/api/memory", json=data, headers=self._get_headers())
        response.raise_for_status()
        return response.json()
    
    def get_memory(self, agent_id: str, memory_type: Optional[str] = None, limit: int = 100) -> List[Dict[str, Any]]:
        """
        Retrieve memory for an agent.
        
        Args:
            agent_id: The agent's ID
            memory_type: Optional filter by memory type
            limit: Maximum number of memories to return
            
        Returns:
            List of memories
        """
        params: Dict[str, Any] = {"agentId": agent_id, "limit": limit}
        if memory_type:
            params["type"] = memory_type
        
        response = requests.get(f"{self.base_url}/api/memory", params=params, headers=self._get_headers())
        response.raise_for_status()
        return response.json()
    
    def delete_memory(self, memory_id: str) -> Dict[str, Any]:
        """
        Delete a specific memory.
        
        Args:
            memory_id: The memory's ID
            
        Returns:
            Response from the API
        """
        response = requests.delete(f"{self.base_url}/api/memory/{memory_id}", headers=self._get_headers())
        response.raise_for_status()
        return response.json()
    
    def create_schema(self, name: str, schema: Dict[str, Any], description: Optional[str] = None) -> Dict[str, Any]:
        """
        Create a new memory schema.
        
        Args:
            name: Schema name
            schema: The JSON schema definition
            description: Schema description
            
        Returns:
            Schema data
        """
        data: Dict[str, Any] = {"name": name, "schema": schema}
        if description:
            data["description"] = description
        
        response = requests.post(f"{self.base_url}/api/schemas", json=data, headers=self._get_headers())
        response.raise_for_status()
        return response.json()
    
    def get_schemas(self) -> List[Dict[str, Any]]:
        """
        Get all schemas.
        
        Returns:
            List of schemas
        """
        response = requests.get(f"{self.base_url}/api/schemas", headers=self._get_headers())
        response.raise_for_status()
        return response.json()
    
    def get_audit_logs(self, limit: int = 100) -> List[Dict[str, Any]]:
        """
        Get audit logs.
        
        Args:
            limit: Maximum number of logs to return
            
        Returns:
            List of audit logs
        """
        params = {"limit": limit}
        response = requests.get(f"{self.base_url}/api/audit-logs", params=params, headers=self._get_headers())
        response.raise_for_status()
        return response.json()
    
    def health_check(self) -> Dict[str, Any]:
        """
        Check the health of the API.
        
        Returns:
            Health status
        """
        response = requests.get(f"{self.base_url}/health")
        response.raise_for_status()
        return response.json()


# Example usage
if __name__ == "__main__":
    # Initialize client
    client = MemoryProtocolClient("https://your-app.railway.app")
    
    # Register a new user
    try:
        result = client.register("Test Agent", "agent@example.com", "password123")
        print("Registered:", result)
    except requests.exceptions.HTTPError as e:
        if e.response.status_code == 409:
            print("User already exists, logging in...")
            client.login("agent@example.com", "password123")
        else:
            raise
    
    # Create an agent
    agent = client.create_agent("My LangGraph Agent", "A test agent for memory management")
    print("Created agent:", agent)
    
    # Store some memory
    memory = client.store_memory(
        agent_id=agent["id"],
        memory_type="conversation_history",
        content="User: Hello! Agent: Hi there, how can I help you?",
        metadata={"session": "test-session"}
    )
    print("Stored memory:", memory)
    
    # Retrieve memory
    memories = client.get_memory(agent_id=agent["id"], memory_type="conversation_history")
    print("Retrieved memories:", memories)
    
    # Health check
    health = client.health_check()
    print("API Health:", health) 