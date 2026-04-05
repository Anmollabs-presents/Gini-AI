const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const compression = require('compression');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Production Middleware
app.set('trust proxy', 1); // Trust first proxy for rate limiting (useful in Prod if using a load balancer)
app.use(helmet());         // Security headers
app.use(compression());    // Compress response bodies
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

// Chat endpoint - Using Groq API
app.post('/api/chat', async (req, res) => {
  const GROQ_API_KEY = process.env.GROQ_API_KEY;
  
  if (!GROQ_API_KEY) {
    return res.status(500).json({ 
      error: 'Server configuration error. API key not found.'
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
        model: 'llama-3.3-70b-versatile',
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
          error: 'Rate limit exceeded. Please wait a moment.'
        });
      }
      
      if (response.status === 401) {
        return res.status(401).json({
          error: 'Invalid API key configuration'
        });
      }

      return res.status(response.status).json({
        error: 'API request failed'
      });
    }

    const data = await response.json();
    return res.json(data);

  } catch (error) {
    console.error('API Error:', error.message);
    return res.status(500).json({
      error: 'Failed to connect to AI service'
    });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString()
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Gini AI Server running on port ${PORT}`);
});
