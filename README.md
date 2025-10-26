# 📰 FinGenius - Portfolio News Sentiment Analysis

> AI-powered news sentiment analysis for your stock portfolio with real-time recommendations

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![React](https://img.shields.io/badge/React-18.3.1-61DAFB.svg)
![Python](https://img.shields.io/badge/Python-3.12-3776AB.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)

---

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Quick Start](#quick-start)
- [Architecture](#architecture)
- [Setup Instructions](#setup-instructions)
- [UI Features](#ui-features)
- [API Documentation](#api-documentation)
- [Tech Stack](#tech-stack)
- [Troubleshooting](#troubleshooting)
- [Development](#development)

---

## 🎯 Overview

FinGenius News Sentiment Analysis is a modern web application that analyzes news sentiment for your stock portfolio using AI-powered VADER-like sentiment analysis. It fetches real-time news from Google News RSS, analyzes sentiment, and provides BUY/SELL/HOLD recommendations.

### Key Capabilities

✅ **Real-time News Analysis** - Fetches 25 news articles per stock  
✅ **VADER Sentiment Scoring** - Compound scores from -1 to +1  
✅ **Smart Recommendations** - BUY/SELL/HOLD based on sentiment thresholds  
✅ **Clickable Headlines** - Direct links to full articles  
✅ **Keyword Extraction** - Identifies positive/negative themes  
✅ **Modern UI** - Glassmorphism, gradients, and smooth animations  

---

## ✨ Features

### 🔍 Sentiment Analysis
- **VADER-like Algorithm**: Custom implementation with 18 positive and 18 negative keywords
- **Compound Scoring**: Normalized scores between -1 (very negative) and +1 (very positive)
- **Multi-dimensional Analysis**: Positive, negative, and neutral component scores
- **Threshold-based Recommendations**:
  - BUY: Sentiment ≥ 0.15 AND >40% positive articles
  - SELL: Sentiment ≤ -0.15 AND >40% negative articles
  - HOLD: Mixed or neutral sentiment

### 📊 Portfolio Integration
- Automatic portfolio fetching from backend
- Individual analysis for each stock
- Expandable/collapsible stock cards
- Real-time sentiment scores
- Confidence percentages

### 🎨 Modern UI Design
- **Glassmorphism Effects**: Frosted glass stats cards
- **Gradient Overlays**: Purple header, colored badges
- **Smooth Animations**: Hover effects, transitions, shine effects
- **Responsive Layout**: Works on all screen sizes
- **Interactive Elements**: Clickable headlines, expandable cards

### 🔗 Clickable News Headlines
- All headlines are clickable links
- Opens full article in new tab
- Source attribution visible
- Hover effects for visual feedback
- Security best practices (`rel="noopener noreferrer"`)

---

## 🚀 Quick Start

### Prerequisites
- Python 3.12+
- Node.js 16+
- npm or yarn

### Installation

1. **Clone the repository**
```bash
cd C:\Users\rohan05\Desktop\Projects\frontend\FinGenius
```

2. **Install Python dependencies**
```bash
pip install -r requirements_news.txt
```

3. **Install React dependencies**
```bash
cd my-frontend
npm install
```

### Running the Application

**Terminal 1 - Start Backend Proxy:**
```bash
python backend_news_proxy.py
```

You should see:
```
============================================================
FinGenius News Proxy API
============================================================
Starting server on http://localhost:5001
Endpoints:
  GET  /api/news/<ticker>        - Get news for single ticker
  POST /api/news/batch            - Get news for multiple tickers
  GET  /health                    - Health check
============================================================
```

**Terminal 2 - Start React App:**
```bash
cd my-frontend
npm start
```

**Access the app:**
Open [http://localhost:3000](http://localhost:3000) and navigate to **Stock News** page

---

## 🏗️ Architecture

### System Flow
```
React App (localhost:3000)
    ↓ (fetch request)
Backend Proxy (localhost:5001)
    ↓ (server-side request - no CORS)
Google News RSS
    ↓ (XML response)
Backend Proxy (parses RSS)
    ↓ (JSON response)
React App (sentiment analysis & display)
```

### Why Backend Proxy?
**Problem**: Browsers block direct requests to Google News from client-side JavaScript (CORS policy)

**Solution**: Backend proxy server that:
- Fetches news server-side (no CORS restrictions)
- Parses RSS XML to JSON
- Returns clean data to React app

### Data Flow
1. User opens Stock News page
2. React fetches user's portfolio
3. For each stock:
   - Request news from backend proxy
   - Backend fetches from Google News RSS
   - React analyzes sentiment
   - Displays results with recommendations

---

## 📖 Setup Instructions

### Step 1: Install Python Dependencies

```bash
cd C:\Users\rohan05\Desktop\Projects\frontend\FinGenius
pip install -r requirements_news.txt
```

**Dependencies:**
- Flask==2.3.0
- flask-cors==4.0.0
- feedparser==6.0.10

### Step 2: Start Backend News Proxy

```bash
python backend_news_proxy.py
```

The server will start on `http://localhost:5001`

### Step 3: Start React App

```bash
cd my-frontend
npm start
```

The app will open at `http://localhost:3000`

### Step 4: Navigate to Stock News

Click on **Stock News** in the navigation menu

---

## 🎨 UI Features

### Modern Design Elements

#### 1. **Header Section**
- Purple gradient background (#667eea → #764ba2)
- Enhanced shadow with color
- Centered typography
- Responsive padding

#### 2. **Portfolio Overview Card**
- Decorative radial gradient pattern
- Layered depth effect
- Large icon (36px) with thick stroke
- Enhanced shadow (0 10px 30px)
- Rounded corners (20px)

#### 3. **Stock Cards**
- Gradient backgrounds (BUY/SELL/HOLD)
- Scale animation on expand (1.01)
- Cubic bezier transitions
- Subtle shine effect
- Deep shadows (0 8px 24px)

#### 4. **Action Badges**
- Gradient backgrounds:
  - BUY: #28a745 → #20c997
  - SELL: #dc3545 → #e74c3c
  - HOLD: #ffc107 → #ffb300
- White border overlay
- Uppercase text with letter spacing
- Enhanced shadows

#### 5. **Stats Cards (Glassmorphism)**
- Semi-transparent background (95% opacity)
- Backdrop blur effect (10px)
- Hover lift animation (translateY -4px)
- Dynamic shadows on hover
- Colored borders matching sentiment
- Large numbers (28px, weight 800)

#### 6. **Keyword Pills**
- Individual colored tags
- Green for positive, red for negative
- Gradient background container
- Rounded corners (12px)

#### 7. **Clickable Headlines**
- Full article links
- Hover slide effect (4px right)
- Source attribution in blue
- Smooth transitions (0.2s)
- Security attributes

### Color Palette

```css
Primary Gradient: #667eea → #764ba2
Background: #f5f7fa
Text Dark: #1a202c
Text Medium: #2c3e50

Success: #28a745 → #20c997
Danger: #dc3545 → #e74c3c
Warning: #ffc107 → #ffb300
Info: #007bff
```

### Animations

1. **Shine Effect** - Subtle moving gradient on cards
2. **Hover Lift** - Stats cards lift up on hover
3. **Scale Transform** - Expanded cards grow slightly
4. **Smooth Transitions** - Cubic bezier easing

---

## 📡 API Documentation

### Backend Proxy Endpoints

#### Get News for Single Ticker
```http
GET http://localhost:5001/api/news/<ticker>?limit=25
```

**Parameters:**
- `ticker` (path): Stock ticker symbol (e.g., AAPL, TSLA)
- `limit` (query): Number of articles (default: 25)

**Response:**
```json
{
  "ticker": "AAPL",
  "company_name": "AAPL",
  "news": {
    "headlines": ["..."],
    "sources": ["..."],
    "dates": ["..."],
    "links": ["..."],
    "count": 25
  },
  "success": true
}
```

#### Get News for Multiple Tickers (Batch)
```http
POST http://localhost:5001/api/news/batch
Content-Type: application/json

{
  "tickers": ["AAPL", "TSLA", "RELIANCE.NS"],
  "limit": 25
}
```

**Response:**
```json
{
  "results": [
    {
      "ticker": "AAPL",
      "news": {...},
      "success": true
    }
  ],
  "total_tickers": 3
}
```

#### Health Check
```http
GET http://localhost:5001/health
```

**Response:**
```json
{
  "status": "ok",
  "service": "FinGenius News Proxy"
}
```

---

## 🛠️ Tech Stack

### Frontend
- **React 18.3.1** - UI framework
- **Axios** - HTTP client
- **Lucide React** - Icon library
- **React Router** - Navigation
- **Tailwind CSS** - Utility-first CSS

### Backend
- **Flask 2.3.0** - Python web framework
- **Flask-CORS** - CORS handling
- **feedparser 6.0.10** - RSS feed parser

### Sentiment Analysis
- **Custom VADER-like Algorithm**
- **18 Positive Keywords**: surge, gain, profit, growth, rise, up, high, boost, jump, rally, strong, beat, record, success, positive, bullish, upgrade, outperform
- **18 Negative Keywords**: fall, drop, loss, decline, down, low, cut, crash, plunge, weak, miss, concern, risk, layoff, negative, bearish, downgrade, underperform
- **Compound Score Calculation**: Normalized between -1 and +1

---

## 🐛 Troubleshooting

### Backend Not Starting

**Issue**: Port 5001 already in use

**Solution**:
```bash
# Windows
netstat -ano | findstr :5001
taskkill /PID <PID> /F

# Change port in backend_news_proxy.py
app.run(debug=True, port=5002)  # Use different port
```

**Issue**: Flask not installed

**Solution**:
```bash
pip list | grep Flask
pip install -r requirements_news.txt
```

### CORS Errors

**Issue**: Still getting CORS errors

**Checklist**:
- ✅ Backend running on port 5001
- ✅ Using `http://localhost:5001` not `https`
- ✅ Flask-CORS installed
- ✅ Check browser console for actual request URL

### No News Showing

**Issue**: "No stocks found in your portfolio"

**Solution**:
1. Verify you're logged in
2. Add stocks to your portfolio first
3. Check backend terminal for logs
4. Refresh the page

**Issue**: News not loading for specific stocks

**Solution**:
- Check backend logs for errors
- Verify ticker symbol is correct
- Try with a different stock
- Check Google News RSS is accessible

### UI Issues

**Issue**: Styles not loading

**Solution**:
```bash
cd my-frontend
npm install
npm start
```

**Issue**: Icons not showing

**Solution**:
```bash
npm install lucide-react
```

---

## 💻 Development

### Available Scripts

In the `my-frontend` directory:

#### `npm start`
Runs the app in development mode at [http://localhost:3000](http://localhost:3000)

#### `npm test`
Launches the test runner in interactive watch mode

#### `npm run build`
Builds the app for production to the `build` folder

#### `npm run eject`
**Note: This is a one-way operation!**

Ejects from Create React App for full configuration control

### Project Structure

```
FinGenius/
├── backend_news_proxy.py       # Flask backend server
├── requirements_news.txt       # Python dependencies
├── README.md                   # This file
├── my-frontend/                # React application
│   ├── src/
│   │   ├── components/
│   │   │   └── StockNews/
│   │   │       ├── index.js    # Main component
│   │   │       └── CSS/
│   │   ├── App.js
│   │   └── index.js
│   ├── public/
│   ├── package.json
│   └── package-lock.json
```

### Key Files

- **`backend_news_proxy.py`**: Flask server that fetches news from Google News RSS
- **`StockNews/index.js`**: Main React component with sentiment analysis logic
- **`requirements_news.txt`**: Python package dependencies

### Environment Variables

Create `.env` file in `my-frontend/`:
```env
REACT_APP_BACKEND_URL=http://localhost:5001
```

---

## 🎯 Features Breakdown

### Sentiment Analysis Details

**Positive Keywords (18)**:
surge, gain, profit, growth, rise, up, high, boost, jump, rally, strong, beat, record, success, positive, bullish, upgrade, outperform

**Negative Keywords (18)**:
fall, drop, loss, decline, down, low, cut, crash, plunge, weak, miss, concern, risk, layoff, negative, bearish, downgrade, underperform

**Scoring Logic**:
```javascript
// Each keyword match adds/subtracts 0.3
score += positiveMatches * 0.3
score -= negativeMatches * 0.3

// Normalize to -1 to +1
compound = Math.max(-1, Math.min(1, score))
```

**Recommendation Thresholds**:
```javascript
BUY:  sentiment >= 0.15  AND positiveRatio > 0.4
SELL: sentiment <= -0.15 AND negativeRatio > 0.4
HOLD: Everything else
```

**Confidence Calculation**:
```javascript
confidence = 0.5 + (sentiment * 2) + (ratio * 0.3)
// Capped at 95%
```

---

## 🚀 Deployment

### Deploy Backend (Heroku Example)

1. Create `Procfile`:
```
web: python backend_news_proxy.py
```

2. Update port binding:
```python
port = int(os.environ.get('PORT', 5001))
app.run(host='0.0.0.0', port=port)
```

3. Deploy:
```bash
heroku create fingenius-news-api
git push heroku main
```

### Deploy Frontend (Netlify Example)

1. Build the app:
```bash
cd my-frontend
npm run build
```

2. Update backend URL in code:
```javascript
const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'https://your-backend.herokuapp.com';
```

3. Deploy `build/` folder to Netlify

---

## 📝 License

MIT License - feel free to use this project for learning or commercial purposes.

---

## 🙏 Acknowledgments

- Google News RSS for news data
- VADER sentiment analysis methodology
- React and Flask communities
- Lucide for beautiful icons

---

## 📧 Support

For issues or questions:
1. Check the [Troubleshooting](#troubleshooting) section
2. Review backend logs
3. Check browser console for errors

---

## 🔮 Future Enhancements

1. **Dark Mode** - Toggle for dark theme
2. **Export Feature** - Download analysis as PDF
3. **Historical Data** - Track sentiment over time
4. **Email Alerts** - Notify on significant sentiment changes
5. **More Sources** - Integrate additional news APIs
6. **Machine Learning** - Advanced sentiment models
7. **Social Sentiment** - Twitter/Reddit integration
8. **Price Correlation** - Compare sentiment vs stock price

---

**Built with ❤️ for better investment decisions**
