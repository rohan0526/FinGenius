const API_BASE_URL = "https://rapid-grossly-raven.ngrok-free.app/chat"; // Using /chat endpoint

const makeApiRequest = async (endpoint, method, body, token) => {
  console.log(`Making ${method} request to ${endpoint}`, body); // Debug log
  
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

    const data = await response.json();
    console.log('Response:', { status: response.status, data }); // Debug log

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
    console.error(`API Error (${endpoint}):`, err);
    throw err;
  }
};

export const startChatSession = async (userId, token) => 
  makeApiRequest('/start', 'POST', { user_id: userId }, token);

export const sendChatMessage = async (sessionId, message, token) => 
  makeApiRequest('/message', 'POST', { session_id: sessionId, message }, token);

export const endChatSession = async (sessionId, token) => 
  makeApiRequest('/end', 'POST', { session_id: sessionId }, token);
