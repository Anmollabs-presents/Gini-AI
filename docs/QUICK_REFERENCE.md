# 🚀 Gini AI Chatbot - Quick Reference

## Start the Server
```bash
cd Gini-ai-website-main
npm start
```

## Test the Chatbot
1. Open: http://localhost:3000
2. Click chat bubble (bottom right)
3. Send: "Hello"

## Change AI Model
Edit `index.html`, find this line:
```javascript
model: 'gpt-4o-mini',  // Change this
```

Popular options:
- `gpt-4o-mini` - Fast (default)
- `gpt-4o` - Most powerful
- `claude-sonnet-4` - Anthropic
- `google/gemini-2.5-flash` - Google

## Enable Streaming
```javascript
stream: true  // Real-time responses
```

## Key Features
- ✅ No API key needed
- ✅ Unlimited requests
- ✅ 400+ AI models
- ✅ Free forever
- ✅ Multi-turn conversations
- ✅ Name memory
- ✅ Time/date queries

## Files Modified
- `index.html` - Added Puter.js, updated chat logic
- `server.js` - Simplified, removed Gemini API
- `package.json` - Removed node-fetch
- `.env` - Updated comments

## Documentation
- `MIGRATION_COMPLETE.txt` - Quick overview
- `PUTER_AI_MIGRATION.md` - Full migration guide
- `CHATBOT_STATUS.md` - Status report

## Support
- Tutorial: https://developer.puter.com/tutorials/free-unlimited-ai-api/
- Docs: https://docs.puter.com/
- Discord: https://discord.gg/PQcx7Teh8u

## Version
**2.0.0** - Powered by Puter AI
