const path = require('path');
const express = require('express');
const cors = require('cors');
const axios = require('axios');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const ANTHROPIC_API_KEY = process.env.CLAUDE_API_KEY;
console.log('API Key (first 10 characters):', ANTHROPIC_API_KEY ? ANTHROPIC_API_KEY.substring(0, 10) + '...' : 'Not set');

// API routes should come before the static file serving
app.post('/api/chat', async (req, res) => {
  try {
    const { messages } = req.body;
    console.log('Received messages:', messages);

    const formattedMessages = messages
      .filter(msg => msg.text && (msg.is_user !== undefined))
      .map(msg => ({
        role: msg.is_user ? "user" : "assistant",
        content: msg.text
      }));

    const headers = {
      'Content-Type': 'application/json',
      'x-api-key': ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01'
    };
    console.log('Request headers:', {
      ...headers,
      'x-api-key': headers['x-api-key'] ? headers['x-api-key'].substring(0, 10) + '...' : 'Not set'
    });

    console.log('Formatted messages:', formattedMessages);

    const response = await axios.post(
      'https://api.anthropic.com/v1/messages',
      {
        model: "claude-3-haiku-20240307",
        max_tokens: 1000,
        messages: formattedMessages
      },
      {
        headers: headers,
        timeout: 30000
      }
    );

    console.log('Claude API response:', JSON.stringify(response.data, null, 2));
    res.json({ reply: response.data.content[0].text });
  } catch (error) {
    console.error('Error calling Claude API:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
      console.error('Response status:', error.response.status);
      console.error('Response headers:', error.response.headers);
    } else if (error.request) {
      console.error('No response received:', error.request);
    }
    console.error('Error config:', error.config);
    res.status(500).json({ error: 'An error occurred while processing your request.', details: error.message });
  }
});

// Serve static files from the React app
app.use(express.static(path.join(__dirname, '../frontend/build')));

// The "catchall" handler: for any request that doesn't
// match one above, send back React's index.html file.
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/build', 'index.html'));
});

const PORT = process.env.PORT || 8081;
app.listen(PORT, '0.0.0.0', () => console.log(`Server running on port ${PORT}`));