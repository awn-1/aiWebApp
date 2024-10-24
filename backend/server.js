const path = require('path');
const express = require('express');
const cors = require('cors');
const axios = require('axios');
require('dotenv').config();
const PORT = 8081;

const app = express();

// Basic middleware
app.use(express.json());
app.use(cors({
  origin: 'http://localhost:3000',
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Validate API key on startup
const ANTHROPIC_API_KEY = process.env.CLAUDE_API_KEY;
if (!ANTHROPIC_API_KEY) {
  console.error('ERROR: CLAUDE_API_KEY environment variable is not set');
  process.exit(1);
}
console.log('API Key (first 10 characters):', ANTHROPIC_API_KEY.substring(0, 10) + '...');

app.post('/api/chat', async (req, res) => {
  try {
    const { messages, profile } = req.body;
    console.log('Received request body:', JSON.stringify({ messages, profile }, null, 2));

    if (!messages || !Array.isArray(messages)) {
      throw new Error('Invalid or missing messages array');
    }

    // Format messages for Claude (excluding system messages)
    let formattedMessages = messages
      .filter(msg => msg.text && (msg.is_user !== undefined) && !msg.is_context)
      .map(msg => ({
        role: msg.is_user ? "user" : "assistant",
        content: msg.text
      }));

    // Create system message if profile exists
    let systemPrompt = null;
    if (profile) {
      const relevantInfo = Object.entries(profile)
        .filter(([key]) => !['id', 'created_at', 'updated_at'].includes(key))
        .filter(([_, value]) => value)
        .map(([key, value]) => `${key}: ${value}`)
        .join(', ');

      if (relevantInfo) {
        systemPrompt = `When responding, keep in mind the following context about the user: ${relevantInfo}. Tailor your responses appropriately to this context while maintaining a natural conversation flow.`;
      }
    }

    // Ensure there's at least one message
    if (formattedMessages.length === 0) {
      throw new Error('No valid messages to send to Claude');
    }

    const headers = {
      'Content-Type': 'application/json',
      'anthropic-version': '2023-06-01',
      'x-api-key': ANTHROPIC_API_KEY
    };

    const requestBody = {
      model: "claude-3-haiku-20240307",
      max_tokens: 1000,
      messages: formattedMessages,
      temperature: 0.7
    };

    // Add system message if it exists
    if (systemPrompt) {
      requestBody.system = systemPrompt;
    }

    console.log('Request to Claude API:', JSON.stringify({
      url: 'https://api.anthropic.com/v1/messages',
      headers: {
        ...headers,
        'x-api-key': '***'  // Hide API key in logs
      },
      body: requestBody
    }, null, 2));

    const response = await axios.post(
      'https://api.anthropic.com/v1/messages',
      requestBody,
      { 
        headers,
        timeout: 30000
      }
    );

    console.log('Claude API Response:', JSON.stringify(response.data, null, 2));

    if (!response.data?.content?.[0]?.text) {
      throw new Error('Invalid response format from Claude API');
    }

    res.json({ reply: response.data.content[0].text });

  } catch (error) {
    console.error('Error details:');
    if (error.response) {
      console.error('Response data:', JSON.stringify(error.response.data, null, 2));
      console.error('Response status:', error.response.status);
      console.error('Response headers:', error.response.headers);
    } else if (error.request) {
      console.error('No response received. Request:', error.request);
    } else {
      console.error('Error:', error.message);
    }

    res.status(500).json({ 
      error: 'An error occurred while processing your request.',
      details: error.response?.data?.error?.message || error.message,
      debugInfo: process.env.NODE_ENV === 'development' ? {
        error: error.response?.data,
        status: error.response?.status
      } : undefined
    });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error handling
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

// Start server
app.listen(PORT, '0.0.0.0', (err) => {
  if (err) {
    console.error(`Failed to start server on port ${PORT}:`, err);
    process.exit(1);
  }
  console.log(`Server is running and listening on port ${PORT}`);
  console.log(`Health check available at http://localhost:${PORT}/health`);
});