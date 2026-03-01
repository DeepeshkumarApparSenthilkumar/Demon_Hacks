# ChiTrade 🌆
### Trade Smarter. Chicago Faster.
*Understand how Chicago moves the market — and how the market moves Chicago.*

---

Hey, so you just downloaded ChiTrade. Before anything else — this is a full-stack app, meaning there's a backend (Node.js) and a frontend (React) that need to run at the same time. Don't worry, it's not complicated at all. This guide will walk you through everything step by step, including how to set it up inside VS Code which is honestly the best way to work with this.

---

## What you actually need installed first

Before you touch anything, make sure you have these on your machine:

**Node.js** — This is the engine that runs everything. Go to [nodejs.org](https://nodejs.org) and download the LTS version (the one that says "Recommended For Most Users"). If you're not sure whether you already have it, open a terminal and type `node -v`. If you see a version number, you're good.

**VS Code** — If you don't have it, grab it at [code.visualstudio.com](https://code.visualstudio.com). It's free.

That's genuinely it. You don't need anything else.

---

## Opening the project in VS Code

1. Unzip the `ChiTrade-fullstack.zip` file somewhere on your computer — your Desktop, Documents, wherever. Just remember where you put it.

2. Open VS Code.

3. Click **File → Open Folder** and select the `chitrade-export` folder you just unzipped. The whole project will appear in the left sidebar.

You'll see two main folders inside: `server` and `client`. The server is the backend that holds your API keys securely. The client is the React app that runs in your browser.

---

## Opening the terminal in VS Code

This is how you'll run all the commands. In VS Code, go to the top menu and click **Terminal → New Terminal**. A terminal panel will open at the bottom of your screen. All the commands below get typed in there.

One tip: you can split the terminal into two panels by clicking the split icon (looks like a rectangle divided in half) in the top right of the terminal panel. You'll need this later to run the server and client at the same time.

---

## Step 1 — Install dependencies

In the terminal, make sure you're in the root folder of the project (it should say `chitrade-export` in your terminal path). Then run:

```bash
npm run setup
```

This installs all the packages needed for both the server and the client. It takes about 30–60 seconds. You'll see a bunch of text scroll by — that's normal. When it's done it'll say "Done!" and give you the next steps.

If for some reason that doesn't work, you can do it manually:

```bash
cd server
npm install
cd ../client
npm install
cd ..
```

---

## Step 2 — Set up your API keys

This is the important part. Your API keys never go into the code — they live in a file called `.env` inside the `server` folder. This file is private and gets ignored by Git so it'll never accidentally get shared.

In VS Code, look at the left sidebar file tree. Navigate to `server` → you'll see a file called `.env.example`. Right-click it and select **Copy**, then paste it in the same `server` folder and rename the copy to `.env` (just `.env`, no "example").

Now open that `.env` file and fill in your keys:

```
CLAUDE_API_KEY=your_claude_key_here
MARKET_API_KEY=your_alphavantage_key_here
NEWS_API_KEY=your_newsapi_key_here
PORT=3001
NODE_ENV=development
```

Save the file. That's it — your keys are now secured on the server side and the browser will never see them.

**Where to get each key (all free):**

| Key | Where to get it | Free tier |
|-----|-----------------|-----------|
| `CLAUDE_API_KEY` | [console.anthropic.com](https://console.anthropic.com) → API Keys → Create Key | $5 free credit to start |
| `MARKET_API_KEY` | [alphavantage.co](https://www.alphavantage.co/support/#api-key) → Get Free API Key | 25 requests/day |
| `NEWS_API_KEY` | [newsapi.org/register](https://newsapi.org/register) | 100 requests/day |

---

## Step 3 — Run the app

Now the fun part. You need two terminals running at the same time — one for the server, one for the client. Split your terminal in VS Code (Terminal → Split Terminal).

**In the first terminal (server):**
```bash
cd server
npm run dev
```

You should see:
```
🌆 ChiTrade Server running on http://localhost:3001
   Keys loaded: Claude=true Market=true News=true
```

**In the second terminal (client):**
```bash
cd client
npm run dev
```

You should see:
```
  VITE v5.x.x  ready in 300ms
  ➜  Local:   http://localhost:5173/
```

Now open your browser and go to **http://localhost:5173** — ChiTrade is running.

---

## The quick version (one command)

If you just want to start everything at once from the root folder, you can also run:

```bash
npm run dev
```

This starts both server and client together. The only thing is the output from both gets mixed together in one terminal, so if something breaks it can be slightly harder to see which one errored. Up to you.

---

## Project structure explained

Here's what everything is and why it exists:

```
chitrade-export/
│
├── server/                  ← Node.js + Express backend
│   ├── index.js             ← All API routes live here (Claude, stocks, news)
│   ├── .env                 ← YOUR KEYS GO HERE (never commit this)
│   ├── .env.example         ← Template showing what keys are needed
│   └── package.json         ← Server dependencies
│
├── client/                  ← React frontend
│   ├── src/
│   │   ├── App.jsx          ← Main app, screen routing
│   │   ├── api.js           ← All fetch calls go to /api/* (your server)
│   │   ├── mockData.js      ← Fallback data when APIs are unavailable
│   │   ├── screens/         ← One file per screen
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Companies.jsx
│   │   │   ├── ChicagoMap.jsx   ← Mapbox interactive map
│   │   │   ├── Indices.jsx
│   │   │   ├── News.jsx
│   │   │   ├── AIAssistant.jsx
│   │   │   ├── Risk.jsx
│   │   │   └── Settings.jsx
│   │   └── components/      ← Shared UI pieces
│   │       ├── DNABackground.jsx  ← Animated canvas background
│   │       ├── TopBar.jsx
│   │       ├── LeftNav.jsx
│   │       └── UI.jsx           ← Buttons, badges, sparklines, cards
│   └── package.json
│
├── package.json             ← Root scripts (runs both server + client)
├── .gitignore               ← Keeps .env out of git
└── README.md                ← You're reading this
```

---

## What each screen does

**Dashboard** — Your home base. Shows all 10 Chicago-headquartered companies with live prices, sparkline charts, and a one-click AI explanation button for each stock's daily move.

**Companies** — Click into any company for a full chart (1D / 1W / 1M / 1Y), fundamentals like market cap and P/E ratio, and a detailed AI-generated summary of what's driving the stock.

**Chicago Map** — This is the fun one. An interactive 3D Mapbox map of Chicago showing the actual HQ locations of every company as pins. Click a pin and a card pops up with live stats and an AI summary. There are also pulsing "hotspot" overlays showing economic activity zones around the city — the Loop, O'Hare, Fulton Market, etc. You can toggle these on and off.

**Indices** — Tracks S&P 500, Nasdaq, Dow Jones, and VIX with one-click AI analysis explaining what the day's moves mean specifically for Chicago companies.

**News** — Live financial news filtered for Chicago relevance. Click any article to expand it and run an AI impact assessment — positive, negative, or neutral — for local companies.

**AI Assistant** — Full chat interface powered by Claude. Ask it anything: "Why is Boeing down?", "What should I watch this week?", "How do CME futures affect local stocks?" It stays focused on Chicago market context.

**Risk Analysis** — Aggregates volatility signals, news sentiment, and stock moves into an overall risk score (Low / Moderate / High) with a structured breakdown. Powered by Claude and returns clean JSON.

**Settings** — Shows the status of each API key (configured or missing) and has the setup instructions in case you need them again.

---

## Recommended VS Code extensions

These aren't required but they make working on the code way nicer:

- **ES7+ React/Redux/React-Native snippets** — autocomplete for React components
- **Tailwind CSS IntelliSense** — autocomplete for Tailwind class names
- **Prettier** — auto-formats your code on save
- **GitLens** — makes Git history way more readable

To install: hit `Ctrl+Shift+X` (or `Cmd+Shift+X` on Mac) to open Extensions, search by name, click Install.

---

## Troubleshooting

**"Cannot find module" error when starting the server**
You probably need to install dependencies. Run `npm install` inside the `server` folder.

**The AI features just show a warning message**
Your `CLAUDE_API_KEY` is either missing from `server/.env` or incorrect. Double-check the key at [console.anthropic.com](https://console.anthropic.com).

**Stock prices aren't updating / showing mock data**
Alpha Vantage free tier has a limit of 25 requests per day. Once you hit it, the app automatically falls back to realistic mock data so everything still looks good.

**The map isn't loading**
Check your browser console (F12 → Console) for a Mapbox error. The token is already embedded in the app, so this is usually a network issue.

**Port 3001 already in use**
Something else on your machine is using that port. Either close that other program, or change `PORT=3001` to `PORT=3002` in your `server/.env` — then also update the proxy in `client/vite.config.js` to match.

**White screen on startup**
Open browser dev tools (F12) and look at the Console tab. There's almost always a helpful error message there that points directly to what's wrong.

---

## A note on API costs

Claude is the only API here that costs money, and it's very cheap for personal use. A typical session exploring the app will use maybe $0.01–0.05 worth of API credits. The free $5 Anthropic gives you when you sign up will last a long time for personal use.

Alpha Vantage and NewsAPI are completely free within their daily limits. The app handles hitting those limits gracefully — it just falls back to mock data without breaking anything.

---

## Tech stack

- **React 18** with Vite for the frontend
- **Node.js + Express** for the backend API proxy
- **Tailwind CSS** for styling
- **Recharts** for stock charts and sparklines
- **Mapbox GL JS** for the interactive Chicago map
- **Claude API** (claude-sonnet-4-20250514) for all AI features
- **Alpha Vantage** for stock quotes and chart data
- **NewsAPI** for financial news

---

Built for Chicago. 🌆
