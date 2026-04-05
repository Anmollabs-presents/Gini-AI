# 🔑 How to Update Your Gemini API Key

## Quick Steps

### 1. Get a New API Key

1. **Visit**: https://aistudio.google.com/apikey
2. **Sign in** with your Google account
3. Click **"Create API Key"** button
4. Choose **"Create API key in new project"** (recommended)
5. **Copy** the generated API key

### 2. Update the .env File

Open `Gini-ai-website-main/.env` and replace the old key:

```env
# Before (OLD - Rate Limited):
GEMINI_API_KEY=AIzaSyAQqWx09Z25Pbc5A3SlGsFcGwFyae_ZYwI

# After (NEW - Your fresh key):
GEMINI_API_KEY=YOUR_NEW_API_KEY_HERE
```

### 3. Restart the Server

**Stop the current server** (Ctrl+C in the terminal), then:

```bash
cd Gini-ai-website-main
npm start
```

### 4. Test the Chatbot

1. Open http://localhost:3000 in your browser
2. Click the chat bubble (bottom right)
3. Send a test message: "Hello"
4. You should get a response!

## ⚠️ Important Notes

### API Key Security
- ✅ **DO**: Keep your API key private
- ✅ **DO**: Add `.env` to `.gitignore`
- ❌ **DON'T**: Share your API key publicly
- ❌ **DON'T**: Commit `.env` to GitHub

### Free Tier Limits
- **15 requests per minute**
- **1,500 requests per day**
- **1M tokens per minute**

### If You Still Get Errors

**Rate Limit Error (429)**:
- Wait 1 minute between requests
- Don't spam the chatbot
- Consider upgrading to paid tier

**Invalid Key Error (403)**:
- Double-check you copied the entire key
- Make sure there are no extra spaces
- Verify the key is enabled in Google AI Studio

**Connection Error**:
- Check your internet connection
- Verify the server is running
- Check firewall settings

## 🧪 Test Your New Key

Run this command to test (replace with your key):

```bash
curl "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=YOUR_KEY_HERE" \
  -H "Content-Type: application/json" \
  -d '{"contents":[{"parts":[{"text":"Hello"}]}]}'
```

If successful, you'll see a JSON response with AI-generated text.

## 📞 Need Help?

- **Gemini API Docs**: https://ai.google.dev/docs
- **API Key Management**: https://aistudio.google.com/apikey
- **Pricing Info**: https://ai.google.dev/pricing
- **Support**: https://ai.google.dev/support

---

**Pro Tip**: Create multiple API keys for different projects to track usage separately!
