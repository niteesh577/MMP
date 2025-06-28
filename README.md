
# 🧠 Memory Protocol Server — LangGraph Integration Guide

## 🌐 API Base Endpoint  
`https://mmp-production-2ecc.up.railway.app`

### 🔍 Available Endpoints  
- **Health Check**: `/health`  
- **API Documentation (Swagger UI)**: `/api-docs`  
- **Agent Discovery**: `/.well-known/memory-agent.json`  
- **Authentication**: `/api/auth`  
- **Agents CRUD**: `/api/agents`  
- **Memory CRUD**: `/api/memory`  
- **Schemas CRUD**: `/api/schemas`  
- **Audit Logs**: `/api/audit-logs`  
- **Subscriptions**: `/api/subscriptions`

---

## 1. Authentication 🔐

### 1.1 Register / Login
```python
import requests
import uuid

BASE_URL = "https://mmp-production-2ecc.up.railway.app"

def register_user(name, email, password):
    r = requests.post(f"{BASE_URL}/api/auth/register",
                      json={"name": name, "email": email, "password": password})
    r.raise_for_status()
    return r.json()

# Using a unique email address to avoid registration conflicts
unique_email = f"user_{uuid.uuid4()}@example.com"
auth_response = register_user("Test User", unique_email, "password123")
access_token = auth_response["accessToken"]

print(f"Registration successful! Access Token: {access_token}")
````

### 1.2 Create API Key (Alt)

```python
def create_api_key(token, name="LangGraph Agent"):
    r = requests.post(
        f"{BASE_URL}/api/auth/api-keys",
        headers={"Authorization": f"Bearer {token}"},
        json={"name": name, "permissions": ["read", "write", "delete"]},
    )
    r.raise_for_status()
    return r.json()["key"]

api_key = create_api_key(access_token)
```

---

## 2. Agent Management 🤖

### 2.1 Register Agent

```python
import requests
import uuid

BASE_URL = "https://mmp-production-2ecc.up.railway.app"

def register_agent_correct(agent_id, name, memory_types, token):
    """Register agent with correct payload format"""
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }
    
    payload = {
        "agentId": agent_id,
        "name": name,
        "memoryTypes": memory_types,
        "schemaUrl": "https://your-schema-url.com/schema.json",  # optional
        
    }
    
    print(f"�� Sending request to: {BASE_URL}/api/agents")
    print(f"📦 Payload: {payload}")
    
    response = requests.post(
        f"{BASE_URL}/api/agents",
        json=payload,
        headers=headers
    )
    
    print(f"📊 Status Code: {response.status_code}")
    print(f"📝 Response: {response.text}")
    
    if response.status_code == 201:
        print("✅ Agent registered successfully!")
        return response.json()
    else:
        print(f"❌ Error: {response.status_code}")
        return None

# Generate a unique agent ID
agent_id = f"langgraph-agent-{uuid.uuid4().hex[:8]}"

# Register your agent with correct format
agent = register_agent_correct(
    agent_id=agent_id,
    name="LangGraph Memory Agent",
    memory_types=["conversation_history", "user_profile", "facts", "preferences"],
    token=access_token
)

if agent:
    print(f"�� Agent ID: {agent['agentId']}")
    print(f"�� Agent Name: {agent['name']}")
    print(f"🧠 Memory Types: {agent['memoryTypes']}")
```

### 2.2 Fetch Agent Info

```python
r = requests.get(f"{BASE_URL}/api/agents/{agent_id}",
                 headers={"Authorization": f"Bearer {access_token}"})
```

---

## 3. Memory Operations 💾

### 3.1 Store Memory

```python
def store_memory(agent_id, mtype, content, metadata, token=None, api_key=None):
    headers = {"Authorization": f"Bearer {token}"} if token else {"x-api-key": api_key}
    payload = {"agentId": agent_id, "type": mtype, "content": content, "metadata": metadata}
    r = requests.post(f"{BASE_URL}/api/memory", json=payload, headers=headers)
    r.raise_for_status()
    return r.json()
```

### 3.2 Retrieve Memory

```python
def retrieve_memory(agent_id, mtype=None, limit=10, token=None, api_key=None):
    headers = {"Authorization": f"Bearer {token}"} if token else {"x-api-key": api_key}
    params = {"agentId": agent_id, "limit": limit}
    if mtype: params["type"] = mtype
    r = requests.get(f"{BASE_URL}/api/memory", params=params, headers=headers)
    r.raise_for_status()
    return r.json()
```

### 3.3 Update Memory

```python
def update_memory(memory_id, content, metadata, token=None, api_key=None):
    headers = {"Authorization": f"Bearer {token}"} if token else {"x-api-key": api_key}
    payload = {"content": content, "metadata": metadata}
    r = requests.put(f"{BASE_URL}/api/memory/{memory_id}", json=payload, headers=headers)
    r.raise_for_status()
    return r.json()
```

### 3.4 Delete Memory

```python
def delete_memory(memory_id, token=None, api_key=None):
    headers = {"Authorization": f"Bearer {token}"} if token else {"x-api-key": api_key}
    r = requests.delete(f"{BASE_URL}/api/memory/{memory_id}", headers=headers)
    return r.status_code == 200
```

### 3.5 Complete memory Management

```python
import requests
import json

BASE_URL = "https://mmp-production-2ecc.up.railway.app"

class MemoryProtocolClient:
    def __init__(self, access_token, agent_id):
        self.access_token = access_token
        self.agent_id = agent_id
        self.headers = {"Authorization": f"Bearer {access_token}"}
    
    def store_memory(self, memory_type, key, data, metadata=None):
        """Store memory entry"""
        payload = {
            "agentId": self.agent_id,
            "memoryType": memory_type,
            "key": key,
            "data": data,
            "metadata": metadata or {}
        }
        
        response = requests.post(f"{BASE_URL}/api/memory", json=payload, headers=self.headers)
        
        if response.status_code == 201:
            print(f"✅ Stored memory: {key}")
            return response.json()
        else:
            print(f"❌ Failed to store memory: {response.status_code}")
            print(f"Response: {response.text}")
            response.raise_for_status()
    
    def get_memory(self, memory_type=None, key=None, limit=50):
        """Get memory entries"""
        params = {"agentId": self.agent_id, "limit": limit}
        if memory_type:
            params["memoryType"] = memory_type
        if key:
            params["key"] = key
            
        response = requests.get(f"{BASE_URL}/api/memory", params=params, headers=self.headers)
        
        if response.status_code == 200:
            return response.json()
        else:
            print(f"❌ Failed to get memory: {response.status_code}")
            response.raise_for_status()
    
    def update_memory(self, memory_id, data, metadata=None):
        """Update memory entry"""
        payload = {"data": data}
        if metadata:
            payload["metadata"] = metadata
            
        response = requests.put(f"{BASE_URL}/api/memory/{memory_id}", json=payload, headers=self.headers)
        
        if response.status_code == 200:
            print(f"✅ Updated memory: {memory_id}")
            return response.json()
        else:
            print(f"❌ Failed to update memory: {response.status_code}")
            response.raise_for_status()
    
    def delete_memory(self, memory_type, key):
        """Delete memory entry"""
        params = {
            "agentId": self.agent_id,
            "memoryType": memory_type,
            "key": key
        }
        
        response = requests.delete(f"{BASE_URL}/api/memory", params=params, headers=self.headers)
        
        if response.status_code == 200:
            print(f"✅ Deleted memory: {key}")
            return response.json()
        else:
            print(f"❌ Failed to delete memory: {response.status_code}")
            response.raise_for_status()

# Usage example
def example_usage():
    # Initialize client
    client = MemoryProtocolClient(
        access_token=access_token,
        agent_id=agent_id
    )
    
    # Store conversation memory
    conversation_memory = client.store_memory(
        memory_type="conversation_history",
        key="user-123-session-1",
        data={
            "messages": [
                {"role": "user", "content": "Hello, how are you?"},
                {"role": "assistant", "content": "I'm doing well, thank you!"}
            ],
            "session_id": "session-1",
            "timestamp": "2025-06-28T17:00:00Z"
        },
        metadata={
            "user_id": "user-123",
            "session_duration": 300,
            "language": "en"
        }
    )
    
    # Store user profile
    user_profile = client.store_memory(
        memory_type="user_profile",
        key="user-123-profile",
        data={
            "name": "John Doe",
            "email": "john@example.com",
            "preferences": {
                "language": "en",
                "timezone": "UTC",
                "notifications": True
            }
        },
        metadata={
            "created_at": "2025-06-28T17:00:00Z",
            "source": "registration"
        }
    )
    
    # Get all memories for the agent
    all_memories = client.get_memory()
    print(f"�� Found {len(all_memories['memories'])} memory entries")
    
    # Get specific memory type
    conversations = client.get_memory(memory_type="conversation_history")
    print(f"�� Found {len(conversations['memories'])} conversation entries")

# Run the example
if __name__ == "__main__":
    example_usage()
```

---

## 4. Schema Management 📊

### 4.1 Create Schema

```python
def create_schema(agent_id, schemas, token=None, api_key=None):
    """Create/update schema for an agent"""
    headers = {"Authorization": f"Bearer {token}"} if token else {"x-api-key": api_key}

    payload = {
        "schemas": schemas  # Object with memoryType -> JSON Schema mappings
    }

    print(f" Sending schema for agent: {agent_id}")
    print(f"📦 Payload: {json.dumps(payload, indent=2)}")

    response = requests.put(
        f"{BASE_URL}/api/schemas/{agent_id}",
        json=payload,
        headers=headers
    )

    print(f"📊 Status Code: {response.status_code}")
    print(f"📝 Response: {response.text}")

    if response.status_code == 200:
        print("✅ Schema created/updated successfully!")
        return response.json()
    else:
        print(f"❌ Error: {response.status_code}")
        response.raise_for_status()
        return None
custom_schemas = {
        "user_profile": {
            "type": "object",
            "properties": {
                "name": {"type": "string", "minLength": 1},
                # Changed format: "email" to pattern for email validation
                "email": {"type": "string", "pattern": "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$"},
                "age": {"type": "number", "minimum": 0},
                "preferences": {
                    "type": "object",
                    "properties": {
                        "theme": {"type": "string", "enum": ["light", "dark"]},
                        "language": {"type": "string"},
                        "notifications": {"type": "boolean"}
                    }
                }
            },
            "required": ["name", "email"]
        },
        "conversation_history": {
            "type": "object",
            "properties": {
                "messages": {
                    "type": "array",
                    "items": {
                        "type": "object",
                        "properties": {
                            "role": {"type": "string", "enum": ["user", "assistant", "system"]},
                            "content": {"type": "string"},
                            "timestamp": {"type": "string"}, # Removed format: "date-time"
                            "metadata": {"type": "object"}
                        },
                        "required": ["role", "content"]
                    }
                },
                "session_id": {"type": "string"},
                "summary": {"type": "string"}
            },
            "required": ["messages"]
        },
        "langgraph_state": {
            "type": "object",
            "properties": {
                "graph_id": {"type": "string"},
                "node_id": {"type": "string"},
                "state": {"type": "object"},
                "metadata": {"type": "object"},
                "timestamp": {"type": "string"} # Removed format: "date-time"
            },
            "required": ["graph_id", "node_id", "state"]
        }
    }


create_schema(agent_id, custom_schemas, access_token)
```

---

## 5. Audit Logs & Subscriptions 🧾

### 5.1 View Audit Logs

```python
r = requests.get(f"{BASE_URL}/api/audit-logs",
                 headers={"Authorization": f"Bearer {access_token}"})
```

### 5.2 Manage Subscriptions

Subscribe agents to memory events via:

```
POST /api/subscriptions
GET /api/subscriptions
DELETE /api/subscriptions/{sub_id}
```

---

## 6. LangGraph Integration 🔗

### 6.1 Memory Client Class

```python
class MemoryProtocolClient:
    def __init__(self, base_url, token=None, api_key=None):
        self.base_url = base_url.rstrip('/')
        self.headers = {"Content-Type": "application/json"}
        if token: self.headers["Authorization"] = f"Bearer {token}"
        if api_key: self.headers["x-api-key"] = api_key

    def store_memory(...): ...
    def retrieve_memory(...): ...
    def register_agent(...): ...
```

### 6.2 Node Functions for LangGraph

```python
def retrieve_context(state):
    conv = memory_client.retrieve_memory(state["agent_id"], "conversation_history", 5)
    prof = memory_client.retrieve_memory(state["agent_id"], "user_profile", 1)
    state["context"] = {
        "recent_convs": conv.get("memories", []),
        "user_profile": prof.get("memories", [])
    }
    return state

def generate_response(state):
    # build context strings, call LLM (e.g. via langchain)
    ...
    state["messages"].append(...)
    return state

def store_memory(state):
    memory_client.store_memory(... content from last message)
    return state

def update_user_profile(state):
    # simple parsing logic to extract name/age
    profile_updates = {...}
    if profile_updates:
        memory_client.store_memory(... type="user_profile", content=profile_updates)
    return state
```

### 6.3 Compose the Graph

```python
from langgraph.graph import StateGraph, END
workflow = StateGraph(AgentState)
workflow.add_node("retrieve_context", retrieve_context)
workflow.add_node("generate_response", generate_response)
workflow.add_node("store_memory", store_memory)
workflow.add_node("update_profile", update_user_profile)

workflow.add_edge("retrieve_context", "generate_response")
workflow.add_edge("generate_response", "store_memory")
workflow.add_edge("store_memory", "update_profile")
workflow.add_edge("update_profile", END)

app = workflow.compile(checkpointer=MemorySaver())
```

### 6.4 Engage with Memory-Aware Agent

```python
def chat_with_memory(user_id, message):
    state = {
        "messages": [{"role":"user","content":message}],
        "agent_id": agent_id,
        "user_id": user_id,
        "context": {}
    }
    result = app.invoke(state)
    return result["messages"][-1]["content"]

print(chat_with_memory("user123", "Hi, I'm John and I'm 25"))
print(chat_with_memory("user123", "What’s my name?"))
```

---

## ✅ Best Practices

* **Consistent Memory Types**: e.g. `conversation_history`, `user_profile`, `facts`
* **Schema Validation**: Ensure memory entries follow defined schemas
* **Rich Metadata**: Include timestamps, user IDs, topics
* **Error & Rate-Limit Handling**: Gracefully handle API failures
* **Token Refreshing** for long-lived agents
* **Subscriptions** for real-time memory notification

---

## 🛠️ Contribution & Support

Contributions, bug reports, and feature requests welcome! Please open an issue or PR. For help integrating Memory Protocol Server into LangGraph-based agents, reach out via the issue tracker or our community forums.

---

### ⚡ In Summary

This README provides:

* Full **API overview** & usage for authentication, memory, agents, schemas
* **LangGraph integration** to build agents with persistent, schema-validated memory
* **Best practices** and developer guidance to standardize memory operations

Let me know if you'd like expandability like multi-user sessions, complex schema dependencies, or utility functions!
