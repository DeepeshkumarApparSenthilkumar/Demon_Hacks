import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import axios from "axios";
import rateLimit from "express-rate-limit";
import NodeCache from "node-cache";

dotenv.config();

// ─── Validate environment ────────────────────────────────────────────────────
const REQUIRED_KEYS = ["CLAUDE_API_KEY", "MARKET_API_KEY", "NEWS_API_KEY"];
const missingKeys = REQUIRED_KEYS.filter((k) => !process.env[k]);
if (missingKeys.length > 0) {
  console.warn(`⚠️  Missing env vars: ${missingKeys.join(", ")}`);
  console.warn("   Copy server/.env.example → server/.env and add your keys");
}

const CLAUDE_KEY = process.env.CLAUDE_API_KEY;
const MARKET_KEY = process.env.MARKET_API_KEY;
const NEWS_KEY = process.env.NEWS_API_KEY;
const PORT = process.env.PORT || 3001;

// ─── Cache (reduce API calls) ────────────────────────────────────────────────
const cache = new NodeCache({ stdTTL: 60 }); // 60s default TTL

// ─── App setup ───────────────────────────────────────────────────────────────
const app = express();
app.use(express.json());
app.use(cors({
  origin: [
    "http://localhost:5173",
    "http://localhost:4173",
    "https://chi-trade.vercel.app",
    /\.vercel\.app$/,
  ],
  credentials: true,
}));

// Rate limiting
const limiter = rateLimit({ windowMs: 60_000, max: 60, message: { error: "Too many requests" } });
app.use("/api/", limiter);

// ─── Health check ────────────────────────────────────────────────────────────
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    keys: {
      claude: !!CLAUDE_KEY,
      market: !!MARKET_KEY,
      news: !!NEWS_KEY,
    },
  });
});

// ─── Claude AI proxy ─────────────────────────────────────────────────────────
app.post("/api/claude", async (req, res) => {
  if (!CLAUDE_KEY) return res.status(503).json({ error: "Claude API key not configured in server/.env" });

  const { messages, system } = req.body;
  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: "messages array required" });
  }

  try {
    const response = await axios.post(
      "https://api.anthropic.com/v1/messages",
      {
        model: "claude-sonnet-4-20250514",
        max_tokens: 1000,
        system: system || "You are a sharp Chicago-focused financial analyst. Be clear and concise, under 5 sentences. Never give financial advice.",
        messages,
      },
      {
        headers: {
          "x-api-key": CLAUDE_KEY,
          "anthropic-version": "2023-06-01",
          "Content-Type": "application/json",
        },
        timeout: 30000,
      }
    );
    res.json({ text: response.data.content?.[0]?.text || "" });
  } catch (err) {
    console.error("Claude error:", err.response?.data || err.message);
    res.status(err.response?.status || 500).json({
      error: err.response?.data?.error?.message || "Claude API error",
    });
  }
});

// ─── Market data proxy ────────────────────────────────────────────────────────
app.get("/api/quote/:symbol", async (req, res) => {
  const { symbol } = req.params;
  const cacheKey = `quote_${symbol}`;
  const cached = cache.get(cacheKey);
  if (cached) return res.json({ ...cached, cached: true });

  if (!MARKET_KEY) return res.status(503).json({ error: "Market API key not configured in server/.env" });

  try {
    const response = await axios.get("https://www.alphavantage.co/query", {
      params: { function: "GLOBAL_QUOTE", symbol, apikey: MARKET_KEY },
      timeout: 10000,
    });

    const q = response.data["Global Quote"];
    if (!q || !q["05. price"]) {
      return res.status(404).json({ error: "Symbol not found or API limit reached" });
    }

    const data = {
      symbol,
      price: parseFloat(q["05. price"]),
      change: parseFloat(q["09. change"]),
      pct: parseFloat(q["10. change percent"].replace("%", "")),
      volume: q["06. volume"],
      high: parseFloat(q["03. high"]),
      low: parseFloat(q["04. low"]),
      prevClose: parseFloat(q["08. previous close"]),
    };

    cache.set(cacheKey, data, 60);
    res.json(data);
  } catch (err) {
    console.error("Market error:", err.message);
    res.status(500).json({ error: "Market data unavailable" });
  }
});

// ─── Intraday chart data ──────────────────────────────────────────────────────
app.get("/api/chart/:symbol", async (req, res) => {
  const { symbol } = req.params;
  const { interval = "5min" } = req.query;
  const cacheKey = `chart_${symbol}_${interval}`;
  const cached = cache.get(cacheKey);
  if (cached) return res.json({ data: cached, cached: true });

  if (!MARKET_KEY) return res.status(503).json({ error: "Market API key not configured" });

  try {
    const response = await axios.get("https://www.alphavantage.co/query", {
      params: {
        function: "TIME_SERIES_INTRADAY",
        symbol,
        interval,
        outputsize: "compact",
        apikey: MARKET_KEY,
      },
      timeout: 10000,
    });

    const series = response.data[`Time Series (${interval})`];
    if (!series) return res.status(404).json({ error: "No chart data available" });

    const data = Object.entries(series)
      .slice(0, 78)
      .reverse()
      .map(([time, vals]) => ({
        t: time.slice(11, 16),
        v: parseFloat(vals["4. close"]),
      }));

    cache.set(cacheKey, data, 300);
    res.json({ data, cached: false });
  } catch (err) {
    console.error("Chart error:", err.message);
    res.status(500).json({ error: "Chart data unavailable" });
  }
});

// ─── News proxy ───────────────────────────────────────────────────────────────
app.get("/api/news", async (req, res) => {
  const cacheKey = "chicago_news";
  const cached = cache.get(cacheKey);
  if (cached) return res.json({ articles: cached, cached: true });

  if (!NEWS_KEY) return res.status(503).json({ error: "News API key not configured in server/.env" });

  try {
    const response = await axios.get("https://newsapi.org/v2/everything", {
      params: {
        q: "(Chicago OR CME OR CBOE OR Boeing OR \"United Airlines\") AND (stock OR finance OR market OR earnings)",
        language: "en",
        sortBy: "publishedAt",
        pageSize: 15,
        apiKey: NEWS_KEY,
      },
      timeout: 10000,
    });

    const articles = (response.data.articles || []).map((a) => ({
      id: a.url,
      headline: a.title,
      source: a.source?.name,
      date: a.publishedAt,
      url: a.url,
      description: a.description,
    }));

    cache.set(cacheKey, articles, 300);
    res.json({ articles, cached: false });
  } catch (err) {
    console.error("News error:", err.response?.data || err.message);
    res.status(500).json({ error: "News unavailable" });
  }
});

// ─── Index data (mocked enriched) ─────────────────────────────────────────────
app.get("/api/indices", async (req, res) => {
  const indices = ["SPY", "QQQ", "DIA", "VIX"];
  const cacheKey = "indices";
  const cached = cache.get(cacheKey);
  if (cached) return res.json({ data: cached, cached: true });

  if (!MARKET_KEY) {
    return res.json({ data: MOCK_INDICES, cached: false, mock: true });
  }

  try {
    const results = await Promise.allSettled(
      indices.map((sym) =>
        axios.get("https://www.alphavantage.co/query", {
          params: { function: "GLOBAL_QUOTE", symbol: sym, apikey: MARKET_KEY },
          timeout: 8000,
        })
      )
    );

    const data = results.map((r, i) => {
      const sym = indices[i];
      if (r.status === "fulfilled") {
        const q = r.value.data["Global Quote"];
        if (q && q["05. price"]) {
          return {
            id: sym,
            name: INDEX_NAMES[sym],
            value: parseFloat(q["05. price"]),
            change: parseFloat(q["10. change percent"].replace("%", "")),
          };
        }
      }
      return MOCK_INDICES.find((m) => m.id === sym) || { id: sym, name: sym, value: 0, change: 0 };
    });

    cache.set(cacheKey, data, 60);
    res.json({ data, cached: false });
  } catch (err) {
    res.json({ data: MOCK_INDICES, cached: false, mock: true });
  }
});

const INDEX_NAMES = { SPY: "S&P 500", QQQ: "Nasdaq", DIA: "Dow Jones", VIX: "VIX" };
const MOCK_INDICES = [
  { id: "SPY",  name: "S&P 500",   value: 5218.34, change: +0.42 },
  { id: "QQQ",  name: "Nasdaq",    value: 18340.55, change: -0.18 },
  { id: "DIA",  name: "Dow Jones", value: 38921.70, change: +0.11 },
  { id: "VIX",  name: "VIX",       value: 16.88,   change: +4.22 },
];

// ─── Start ────────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n🌆 ChiTrade Server running on http://localhost:${PORT}`);
  console.log(`   Keys loaded: Claude=${!!CLAUDE_KEY} Market=${!!MARKET_KEY} News=${!!NEWS_KEY}`);
  console.log(`   Health check: http://localhost:${PORT}/api/health\n`);
});
