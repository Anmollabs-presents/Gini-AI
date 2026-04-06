# Changelog

## [2.0.0] - Security & Backend Update

### 🔐 Security Fixes

#### CRITICAL: Removed Exposed API Key
- **Issue:** Google Gemini API key was hardcoded in client-side JavaScript
- **Risk:** Public exposure, unauthorized usage, quota exhaustion
- **Fix:** Moved API key to backend environment variables
- **Impact:** API key is now secure and never exposed to clients

#### Added Rate Limiting
- **Feature:** 20 requests per minute per IP address
- **Purpose:** Prevent API abuse and quota exhaustion
- **Implementation:** express-rate-limit middleware
- **Configurable:** Adjust limits in server.js

#### Implemented Backend Proxy
- **Feature:** Secure Express.js backend server
- **Purpose:** Handle all API requests server-side
- **Benefits:**
  - API key protection
  - CORS handling
  - Request validation
  - Error handling
  - Retry logic

### ✨ New Features

#### Retry Logic with Exponential Backoff
- Automatically retries failed requests (up to 3 attempts)
- Exponential backoff: 1s, 2s, 4s delays
- Handles transient network errors gracefully

#### Enhanced Error Handling
- Specific error messages for different failure types
- User-friendly error descriptions
- Server-side error logging
- No sensitive information in client errors

#### Health Check Endpoint
- `/api/health` endpoint for monitoring
- Returns server status and configuration state
- Useful for deployment health checks

### 🛠️ Technical Changes

#### Backend (New)
- **server.js:** Express.js server with API proxy
- **package.json:** Node.js dependencies
- **.env:** Environment variable configuration
- **.gitignore:** Protect sensitive files

#### Frontend (Updated)
- **index.html:** Updated chatbot to use backend API
- Removed hardcoded API key
- Improved error messages
- Better loading states

### 📝 Documentation

#### New Files
- **README.md:** Complete setup and usage guide
- **SECURITY.md:** Security policies and best practices
- **SETUP.md:** Quick start guide (3 minutes)
- **CHANGELOG.md:** This file
- **.env.example:** Example environment configuration

### 🐛 Bug Fixes

- Fixed duplicate `window.openChat` assignment
- Improved CORS handling
- Better error message formatting
- Fixed rate limit error handling

### 🔄 Migration Guide

#### For Existing Users

1. **Install Node.js dependencies:**
   ```bash
   npm install
   ```

2. **Create .env file:**
   ```bash
   cp .env.example .env
   ```

3. **Add your API key to .env:**
   ```
   GEMINI_API_KEY=your_key_here
   ```

4. **Start the server:**
   ```bash
   npm start
   ```

5. **Access the site:**
   ```
   http://localhost:3000
   ```

#### Breaking Changes

- **API Key:** Must now be in `.env` file, not in HTML
- **Server Required:** Frontend now requires backend server to run
- **URL Change:** Development URL is now `localhost:3000` instead of file://

### 📊 Performance

- **Response Time:** Slightly increased due to proxy (negligible)
- **Reliability:** Significantly improved with retry logic
- **Security:** Dramatically improved with backend protection

### 🎯 Future Improvements

- [ ] Add request caching
- [ ] Implement WebSocket for real-time updates
- [ ] Add user authentication
- [ ] Database for conversation history
- [ ] Admin dashboard for monitoring
- [ ] Docker containerization
- [ ] CI/CD pipeline

---

## [1.0.0] - Initial Release

### Features
- Interactive AI chatbot
- 8 theme options
- Responsive design
- Image slider
- Status panel
- Smooth animations

### Known Issues (Fixed in 2.0.0)
- ❌ Exposed API key in client code
- ❌ No rate limiting
- ❌ Direct client-to-API calls
- ❌ Limited error handling

---

**Version Format:** [Major.Minor.Patch]
- **Major:** Breaking changes
- **Minor:** New features (backward compatible)
- **Patch:** Bug fixes
