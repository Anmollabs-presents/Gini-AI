# Quick Setup Guide

## 🚀 Get Started in 3 Minutes

### Step 1: Get Your API Key

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy the key (starts with `AIza...`)

### Step 2: Install & Configure

```bash
# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Edit .env and paste your API key
# On Windows: notepad .env
# On Mac/Linux: nano .env
```

Your `.env` file should look like:
```
GEMINI_API_KEY=AIzaSy...your_actual_key_here
PORT=3000
```

### Step 3: Run the Server

```bash
# Start the server
npm start

# Or use development mode (auto-reload)
npm run dev
```

### Step 4: Open in Browser

Visit: **http://localhost:3000**

Click the chat bubble in the bottom-right corner and start chatting! 💬

## ✅ Verify Everything Works

1. **Check server health:**
   - Visit: http://localhost:3000/api/health
   - Should see: `{"status":"ok","apiConfigured":true}`

2. **Test the chatbot:**
   - Click the purple chat bubble
   - Type "Hello"
   - You should get a response from Gini AI

## 🐛 Common Issues

### "Cannot find module 'express'"
```bash
npm install
```

### "Server configuration error"
- Your API key is missing or invalid
- Check `.env` file exists and has the correct key
- Make sure there are no spaces around the `=` sign

### "EADDRINUSE: address already in use"
- Port 3000 is already in use
- Change PORT in `.env` to 3001 or another number
- Or stop the other process using port 3000

### Chatbot not responding
1. Check browser console (F12) for errors
2. Verify server is running (check terminal)
3. Test API health endpoint
4. Check your internet connection

## 🎯 Next Steps

- Customize the AI personality in `index.html`
- Change themes by clicking the sun icon (bottom-left)
- Explore the features page: http://localhost:3000/features.html
- Read the full README.md for deployment options

## 💡 Tips

- The chatbot remembers your name if you tell it
- Try asking about time, date, or Gini AI features
- Use the theme switcher to find your favorite look
- The chat history is preserved during your session

## 🆘 Need Help?

1. Check the full [README.md](README.md)
2. Review [SECURITY.md](SECURITY.md) for security info
3. Open an issue on GitHub (if applicable)

---

**Happy coding! 🎉**
