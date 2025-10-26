const API_BASE_URL = "https://rapid-grossly-raven.ngrok-free.app/chat"; // Using /chat endpoint

const makeApiRequest = async (endpoint, method, body, token) => {
  console.log(`🚀 Making ${method} request to ${API_BASE_URL}${endpoint}`);
  console.log('📦 Request body:', JSON.stringify(body, null, 2));
  console.log('🔑 Token:', token ? `${token.substring(0, 20)}...` : 'MISSING');
  
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json'
      },
      credentials: 'include', // Enable cookies
      mode: 'cors', // Enable CORS
      body: body ? JSON.stringify(body) : undefined
    });

    console.log(`📡 Response status: ${response.status} ${response.statusText}`);
    console.log('📋 Response headers:', Object.fromEntries(response.headers.entries()));

    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      const text = await response.text();
      console.error('❌ Non-JSON response received:', text);
      throw new Error(`Expected JSON but got: ${contentType}. Response: ${text.substring(0, 200)}`);
    }

    const data = await response.json();
    console.log('✅ Response data:', JSON.stringify(data, null, 2));

    if (!response.ok) {
      // Check for specific error types
      if (response.status === 401) {
        // Token expired or invalid
        localStorage.removeItem('token');
        throw new Error('Session expired. Please login again.');
      }
      throw new Error(data.error || data.message || `Request failed with status ${response.status}`);
    }

    return data;
  } catch (err) {
    console.error(`❌ API Error (${endpoint}):`, err);
    console.error('Error details:', err.message);
    throw err;
  }
};

export const startChatSession = async (userId, token) => 
  makeApiRequest('/start', 'POST', { user_id: userId }, token);

export const sendChatMessage = async (sessionId, message, token) => 
  makeApiRequest('/message', 'POST', { session_id: sessionId, message }, token);

export const endChatSession = async (sessionId, token) => 
  makeApiRequest('/end', 'POST', { session_id: sessionId }, token);

export const getChatHistory = async (sessionId, token) => 
  makeApiRequest(`/history/${sessionId}`, 'GET', null, token);

export const getPortfolioSummary = async (userId, includeAnalysis = true, forceRefresh = false, token) => 
  makeApiRequest('/portfolio/summary', 'POST', { 
    user_id: userId, 
    include_analysis: includeAnalysis, 
    force_refresh: forceRefresh 
  }, token);

export const analyzeTickerSymbol = async (ticker, market = null, token) => {
  const params = market ? `?market=${market}` : '';
  return makeApiRequest(`/analyze/${ticker}${params}`, 'GET', null, token);
};

export const getMetricsExplanation = async (token) => 
  makeApiRequest('/metrics/explain', 'GET', null, token);

export const healthCheck = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/health`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      mode: 'cors'
    });
    return await response.json();
  } catch (err) {
    console.error('Health check failed:', err);
    return { status: 'unhealthy', error: err.message };
  }
};
