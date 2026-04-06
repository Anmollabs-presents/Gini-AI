const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('.'));

// Rate limiting - 25 requests per minute per IP (under Groq's 30/min limit)
const limiter = rateLimit({
  windowMs: 60 * 1000,
  max: 25,
  message: { error: 'Too many requests, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api/', limiter);

// Chat endpoint - Using Groq API (Fast, Free, No User Login!)
app.post('/api/chat', async (req, res) => {
  const GROQ_API_KEY = process.env.GROQ_API_KEY;
  
  if (!GROQ_API_KEY) {
    return res.status(500).json({ 
      error: 'Server configuration error. Groq API key not found.',
      setup: 'Please add GROQ_API_KEY to your .env file. See GET_GROQ_API_KEY.md for instructions.'
    });
  }

  const { messages } = req.body;

  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: 'Invalid request format. Messages array is required.' });
  }

  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GROQ_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile', // Fast and capable
        messages: messages,
        temperature: 0.8,
        max_tokens: 512,
        top_p: 0.9
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      
      if (response.status === 429) {
        return res.status(429).json({
          error: 'Rate limit exceeded. Please wait a moment.',
          details: errorData?.error?.message || 'Too many requests'
        });
      }
      
      if (response.status === 401) {
        return res.status(401).json({
          error: 'Invalid API key',
          setup: 'Please check your GROQ_API_KEY in .env file'
        });
      }

      return res.status(response.status).json({
        error: errorData?.error?.message || 'API request failed',
        details: errorData
      });
    }

    const data = await response.json();
    return res.json(data);

  } catch (error) {
    console.error('Groq API Error:', error.message);
    return res.status(500).json({
      error: 'Failed to connect to AI service',
      details: error.message
    });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    aiProvider: 'Groq API (Fast & Free)',
    apiKeyConfigured: !!process.env.GROQ_API_KEY,
    model: 'llama-3.3-70b-versatile'
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Gini AI Server running on http://localhost:${PORT}`);
  console.log(`📡 API endpoint: http://localhost:${PORT}/api/chat`);
  console.log(`🤖 AI Provider: Groq API (Fast & Free - No User Login!)`);
  console.log(`🔑 API Key configured: ${!!process.env.GROQ_API_KEY}`);
  console.log(`⚡ Model: llama-3.3-70b-versatile (up to 750 tokens/sec)`);
  if (!process.env.GROQ_API_KEY) {
    console.log(`⚠️  WARNING: GROQ_API_KEY not found in .env file`);
    console.log(`📖 See GET_GROQ_API_KEY.md for setup instructions`);
  }
});
