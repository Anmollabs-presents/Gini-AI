# Gini AI Website

A modern, interactive website for Gini AI - a next-generation offline personal AI assistant created by ANMOL from Lucknow, India.

## 🚀 Features

- **Interactive AI Chatbot** powered by Google Gemini API
- **8 Beautiful Themes** (Dark, Light, Midnight, Rose, Forest, Amber, Cyan, Lavender)
- **Smooth Animations** with scroll reveals and transitions
- **Responsive Design** optimized for all devices
- **Image Slider** showcasing the Gini AI model
- **Real-time Status Panel** showing system information
- **Secure Backend** with rate limiting and retry logic

## 🔧 Setup Instructions

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Google Gemini API key ([Get one here](https://makersuite.google.com/app/apikey))

### Installation

1. **Clone or download the repository**

2. **Install dependencies**
   ```bash
   cd Gini-ai-website-main
   npm install
   ```

3. **Configure environment variables**
   ```bash
   # Copy the example file
   cp .env.example .env
   
   # Edit .env and add your Gemini API key
   # GEMINI_API_KEY=your_actual_api_key_here
   ```

4. **Start the server**
   ```bash
   # Production mode
   npm start
   
   # Development mode (with auto-reload)
   npm run dev
   ```

5. **Open in browser**
   ```
   http://localhost:3000
   ```

## 🔐 Security Features

### ✅ What We Fixed

1. **Removed exposed API key** from client-side code
2. **Created secure backend proxy** to handle API requests
3. **Implemented rate limiting** (20 requests/minute per IP)
4. **Added retry logic** with exponential backoff
5. **Enhanced error handling** with specific error messages
6. **CORS protection** for API endpoints

### 🛡️ Security Best Practices

- API key is stored in `.env` file (never committed to git)
- Backend validates all requests before forwarding to Gemini
- Rate limiting prevents abuse
- Error messages don't expose sensitive information
- HTTPS recommended for production deployment

## 📁 Project Structure

```
Gini-ai-website-main/
├── index.html              # Main landing page
├── features.html           # Features & roadmap page
├── server.js              # Express backend server
├── package.json           # Node.js dependencies
├── .env                   # Environment variables (create this)
├── .env.example          # Example environment file
├── .gitignore            # Git ignore rules
├── README.md             # This file
└── assets/
    └── gini-model1/      # Image assets
        ├── img1.png
        ├── img2.png
        ├── img3.png
        └── img4.png
```

## 🌐 Deployment

### Option 1: Deploy to Vercel/Netlify

1. Push code to GitHub
2. Connect repository to Vercel/Netlify
3. Add `GEMINI_API_KEY` to environment variables
4. Deploy!

### Option 2: Deploy to VPS/Cloud

1. Upload files to server
2. Install Node.js and dependencies
3. Set up environment variables
4. Use PM2 or similar for process management:
   ```bash
   npm install -g pm2
   pm2 start server.js --name gini-ai
   pm2 save
   pm2 startup
   ```
5. Configure nginx/Apache as reverse proxy
6. Set up SSL certificate (Let's Encrypt)

## 🎨 Customization

### Change Themes

Edit CSS variables in `index.html` or `features.html`:

```css
[data-theme="your-theme"]{
  --bg: #your-color;
  --accent: #your-color;
  /* ... more variables */
}
```

### Modify AI Personality

Edit the `SYSTEM_PROMPT` in `index.html` (around line 1083):

```javascript
const SYSTEM_PROMPT = `Your custom AI personality here...`;
```

### Adjust Rate Limits

Edit `server.js` (line 16):

```javascript
const limiter = rateLimit({
  windowMs: 60 * 1000,  // Time window
  max: 20,              // Max requests per window
  // ...
});
```

## 🐛 Troubleshooting

### Chatbot not responding

1. Check if server is running: `http://localhost:3000/api/health`
2. Verify API key is set in `.env` file
3. Check browser console for errors
4. Ensure you have internet connection

### "Server configuration error"

- API key is missing or invalid in `.env` file
- Run: `echo $GEMINI_API_KEY` to verify it's set

### Rate limit errors

- Wait 1 minute before trying again
- Adjust rate limits in `server.js` if needed

### CORS errors

- Make sure you're accessing via `http://localhost:3000`
- Not via `file://` protocol

## 📝 API Endpoints

### POST `/api/chat`

Send a message to the AI chatbot.

**Request:**
```json
{
  "system_instruction": { "parts": [{ "text": "..." }] },
  "contents": [
    { "role": "user", "parts": [{ "text": "Hello" }] }
  ],
  "generationConfig": {
    "temperature": 0.8,
    "maxOutputTokens": 512,
    "topP": 0.9
  }
}
```

**Response:**
```json
{
  "candidates": [{
    "content": {
      "parts": [{ "text": "AI response here" }]
    }
  }]
}
```

### GET `/api/health`

Check server health status.

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "apiConfigured": true
}
```

## 🤝 Contributing

This is a personal project by ANMOL. If you find bugs or have suggestions:

1. Open an issue describing the problem
2. Include steps to reproduce
3. Suggest a solution if possible

## 📄 License

© 2026 Gini AI — All rights reserved.

The feature set, architecture, design, character identity, and system concepts are the intellectual property of ANMOL (Creator & Developer, Lucknow, India).

## 👨‍💻 About the Creator

**ANMOL**  
Student Developer  
Lucknow, Uttar Pradesh, India

Building Gini AI - a Jarvis-level offline personal AI assistant from scratch.

---

**Tech Stack:**
- Frontend: HTML, CSS, JavaScript (Vanilla)
- Backend: Node.js, Express
- AI: Google Gemini 2.0 Flash
- Fonts: Google Fonts (Syne, DM Sans)

**Made with ❤️ in India**
