const express = require('express');
const cors = require('cors');
const axios = require('axios');
require('dotenv').config();

const app = express();
const PORT = 8081;

app.use(express.json());
app.use(cors({
  origin: 'http://localhost:3000',
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type']
}));

app.post('/api/chat', async (req, res) => {
  try {
    const { messages, profile } = req.body;
    console.log('Received request:', JSON.stringify({ messages, profile }, null, 2));

    // Format messages for Claude
    const formattedMessages = messages.map(msg => ({
      role: msg.is_user ? "user" : "assistant",
      content: msg.text
    }));

    // Create system message from profile data
    let systemMessage = '';
    if (profile && Object.keys(profile).length > 0) {
      const formatSection = (data, sectionTitle) => {
        const relevantFields = Object.entries(data)
          .filter(([key, value]) =>
            value &&
            typeof value === 'string' &&
            value.trim() !== '' &&
            key.toLowerCase().includes(sectionTitle.toLowerCase())
          )
          .map(([key, value]) => {
            // Convert camelCase to readable format
            const readableKey = key
              .replace(/([A-Z])/g, ' $1')
              .toLowerCase()
              .replace(`${sectionTitle.toLowerCase()} `, '');
            return `- ${readableKey}: ${value.trim()}`;
          });

        return relevantFields.length > 0
          ? `${sectionTitle}:\n${relevantFields.join('\n')}`
          : null;
      };

      const sections = [
        'relationship',
        'family',
        'friendship',
        'workplace',
        'communication',
        'professional'
      ];

      const formattedSections = sections
        .map(section => formatSection(profile, section))
        .filter(section => section !== null);

      if (formattedSections.length > 0) {
        systemMessage = `Consider this context about the user:

${formattedSections.join('\n\n')}

Use this information to provide personalized and relevant responses while maintaining a natural conversation flow. Draw upon this context when appropriate but don't explicitly mention having this background information unless directly asked about it.`;
      }
    }

    console.log('System Message:', systemMessage);

    const requestBody = {
      model: "claude-3-haiku-20240307",
      max_tokens: 1000,
      messages: formattedMessages,
      temperature: 0.7
    };

    if (systemMessage) {
      requestBody.system = systemMessage;
    }

    const response = await axios.post(
      'https://api.anthropic.com/v1/messages',
      requestBody,
      {
        headers: {
          'Content-Type': 'application/json',
          'anthropic-version': '2023-06-01',
          'x-api-key': process.env.CLAUDE_API_KEY
        }
      }
    );

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

app.listen(PORT, '0.0.0.0', (err) => {
  if (err) {
    console.error(`Failed to start server on port ${PORT}:`, err);
    process.exit(1);
  }
  console.log(`Server is running and listening on port ${PORT}`);
  console.log(`Health check available at http://localhost:${PORT}/health`);
});