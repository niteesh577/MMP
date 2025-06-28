const axios = require('axios');

const BASE_URL = 'http://localhost:3000';

async function testAPI() {
  console.log('🧪 Testing Memory Protocol Server API...\n');

  try {
    // Test health endpoint
    console.log('1. Testing health endpoint...');
    const health = await axios.get(`${BASE_URL}/health`);
    console.log('✅ Health check passed:', health.data.status);
    console.log('   Database:', health.data.database);
    console.log('');

    // Test agent discovery
    console.log('2. Testing agent discovery...');
    const discovery = await axios.get(`${BASE_URL}/.well-known/memory-agent.json`);
    console.log('✅ Agent discovery working:', discovery.data.name);
    console.log('   Version:', discovery.data.version);
    console.log('');

    // Test API documentation
    console.log('3. Testing API documentation...');
    const docs = await axios.get(`${BASE_URL}/api-docs`);
    console.log('✅ API documentation available');
    console.log('');

    // Test agents endpoint (should work without auth for GET)
    console.log('4. Testing agents endpoint...');
    const agents = await axios.get(`${BASE_URL}/api/agents`);
    console.log('✅ Agents endpoint working');
    console.log('   Current agents:', agents.data.length);
    console.log('');

    // Test schemas endpoint
    console.log('5. Testing schemas endpoint...');
    const schemas = await axios.get(`${BASE_URL}/api/schemas`);
    console.log('✅ Schemas endpoint working');
    console.log('   Current schemas:', schemas.data.length);
    console.log('');

    // Test audit logs endpoint
    console.log('6. Testing audit logs endpoint...');
    try {
      const auditLogs = await axios.get(`${BASE_URL}/api/audit-logs`);
      console.log('✅ Audit logs endpoint working');
      console.log('   Current logs:', auditLogs.data.logs?.length || 0);
    } catch (error) {
      if (error.response?.status === 401) {
        console.log('✅ Audit logs endpoint requires authentication (expected)');
      } else {
        console.log('❌ Audit logs endpoint error:', error.response?.status);
      }
    }
    console.log('');

    // Test subscriptions endpoint
    console.log('7. Testing subscriptions endpoint...');
    try {
      const subscriptions = await axios.get(`${BASE_URL}/api/subscriptions`);
      console.log('✅ Subscriptions endpoint working');
      console.log('   Current subscriptions:', subscriptions.data.length);
    } catch (error) {
      if (error.response?.status === 401) {
        console.log('✅ Subscriptions endpoint requires authentication (expected)');
      } else {
        console.log('❌ Subscriptions endpoint error:', error.response?.status);
      }
    }
    console.log('');

    console.log('🎉 All basic endpoints are working!');
    console.log('\n📝 Note: Memory endpoints require authentication.');
    console.log('   You can test them through the frontend at http://localhost:5174/');

  } catch (error) {
    console.error('❌ API test failed:', error.message);
    if (error.response) {
      console.error('   Status:', error.response.status);
      console.error('   Data:', error.response.data);
    }
  }
}

testAPI(); 