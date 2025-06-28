
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

BASE_URL = "https://mmp-production-2ecc.up.railway.app"

def login_user(email, password):
    r = requests.post(f"{BASE_URL}/api/auth/login",
                      json={"email": email, "password": password})
    r.raise_for_status()
    return r.json()

auth = login_user("john@example.com", "password123")
access_token = auth["accessToken"]
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
def register_agent(name, description, capabilities, token=None, api_key=None):
    headers = {}
    if token: headers["Authorization"] = f"Bearer {token}"
    if api_key: headers["x-api-key"] = api_key

    r = requests.post(
        f"{BASE_URL}/api/agents",
        json={"name": name, "description": description, "capabilities": capabilities},
        headers=headers
    )
    r.raise_for_status()
    return r.json()

agent = register_agent(
    name="LangGraph Memory Agent",
    description="Persistent memory assistant for LangGraph",
    capabilities=["conversation", "memory_management"],
    token=access_token
)
agent_id = agent["agentId"]
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

---

## 4. Schema Management 📊

### 4.1 Create Schema

```python
def create_schema(name, fields, description, token=None, api_key=None):
    headers = {"Authorization": f"Bearer {token}"} if token else {"x-api-key": api_key}
    r = requests.post(
        f"{BASE_URL}/api/schemas",
        json={"name": name, "fields": fields, "description": description},
        headers=headers
    )
    r.raise_for_status()
    return r.json()
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
