export const CHICAGO_COMPANIES = [
  { id: "BA",   name: "Boeing",          sector: "Aerospace",    exchange: "NYSE"   },
  { id: "MCD",  name: "McDonald's",      sector: "Consumer",     exchange: "NYSE"   },
  { id: "ABBV", name: "AbbVie",          sector: "Pharma",       exchange: "NYSE"   },
  { id: "CME",  name: "CME Group",       sector: "Finance",      exchange: "NASDAQ" },
  { id: "CBOE", name: "Cboe Global",     sector: "Finance",      exchange: "CBOE"   },
  { id: "UAL",  name: "United Airlines", sector: "Aviation",     exchange: "NASDAQ" },
  { id: "MDLZ", name: "Mondelez",        sector: "Consumer",     exchange: "NASDAQ" },
  { id: "ADM",  name: "Archer-Daniels",  sector: "Agriculture",  exchange: "NYSE"   },
  { id: "WEC",  name: "WEC Energy",      sector: "Utilities",    exchange: "NYSE"   },
  { id: "MS",   name: "Morningstar",     sector: "Finance",      exchange: "NASDAQ" },
];

export const MOCK_QUOTES = {
  BA:   { price: 178.42, change: -1.23, pct: -0.68, cap: "105B", pe: 22.1, vol: "4.2M" },
  MCD:  { price: 295.10, change: +2.87, pct: +0.98, cap: "213B", pe: 24.3, vol: "2.8M" },
  ABBV: { price: 167.55, change: -0.44, pct: -0.26, cap: "296B", pe: 18.7, vol: "5.1M" },
  CME:  { price: 223.80, change: +1.12, pct: +0.50, cap: "80B",  pe: 27.4, vol: "1.3M" },
  CBOE: { price: 198.71, change: +3.44, pct: +1.76, cap: "34B",  pe: 29.1, vol: "0.9M" },
  UAL:  { price: 61.20,  change: -2.10, pct: -3.32, cap: "20B",  pe: 7.4,  vol: "8.6M" },
  MDLZ: { price: 64.88,  change: +0.33, pct: +0.51, cap: "88B",  pe: 21.6, vol: "3.4M" },
  ADM:  { price: 48.15,  change: -0.88, pct: -1.80, cap: "25B",  pe: 11.2, vol: "2.7M" },
  WEC:  { price: 88.34,  change: -0.21, pct: -0.24, cap: "28B",  pe: 19.8, vol: "1.1M" },
  MS:   { price: 310.22, change: +0.55, pct: +0.18, cap: "66B",  pe: 35.2, vol: "0.6M" },
};

export const MOCK_INDICES = [
  { id: "SPY",  name: "S&P 500",    value: 5218.34,  change: +0.42, impact: "Moderate bullish signal for Chicago financials" },
  { id: "QQQ",  name: "Nasdaq",     value: 18340.55, change: -0.18, impact: "Tech pressure weighing on CME & CBOE" },
  { id: "DIA",  name: "Dow Jones",  value: 38921.70, change: +0.11, impact: "Boeing drag limits industrial gains" },
  { id: "VIX",  name: "VIX",        value: 16.88,    change: +4.22, impact: "Elevated volatility favors CBOE volumes" },
  { id: "ES",   name: "ES Futures", value: 5222.50,  change: +0.38, impact: "CME overnight session remains active" },
  { id: "CL",   name: "WTI Crude",  value: 78.44,    change: -1.12, impact: "Softer energy pressures ADM margins" },
];

export const MOCK_NEWS = [
  { id: 1, headline: "Boeing delays 787 deliveries amid fresh quality audits", source: "Chicago Tribune", date: "2h ago", sentiment: "Negative" },
  { id: 2, headline: "CME Group reports record options volume in Q1 2025",    source: "Crain's Chicago", date: "4h ago", sentiment: "Positive" },
  { id: 3, headline: "Chicago PMI rises to 52.4, signaling expansion",        source: "ISM",            date: "6h ago", sentiment: "Positive" },
  { id: 4, headline: "United Airlines cuts Q2 guidance on fare pressure",     source: "Reuters",        date: "8h ago", sentiment: "Negative" },
  { id: 5, headline: "Cboe launches new volatility product tied to Fed",      source: "Bloomberg",      date: "10h ago", sentiment: "Neutral"  },
  { id: 6, headline: "AbbVie's Skyrizi gains EU approval for new indication", source: "BioPharma Dive", date: "12h ago", sentiment: "Positive" },
];

export const MOCK_RISK = {
  overallRisk: "Moderate",
  reasoning: "Elevated VIX at 16.88 combined with Boeing delivery delays and United Airlines guidance cut creates pockets of sector-specific risk. CME volume records and AbbVie approval provide partial offset.",
  exposureFactors: [
    { factor: "Aerospace Supply Chain", level: "High",     ticker: "BA"   },
    { factor: "Aviation Demand Softness", level: "High",   ticker: "UAL"  },
    { factor: "Volatility Regime Shift",  level: "Moderate", ticker: "VIX" },
    { factor: "Commodity Headwinds",      level: "Moderate", ticker: "ADM" },
    { factor: "Options Flow Acceleration", level: "Low",   ticker: "CBOE" },
  ],
};

export const genSparkline = (base, vol = 0.025, n = 30) =>
  Array.from({ length: n }, (_, i) => ({
    t: i,
    v: base * (1 + (Math.random() - 0.49) * vol * (1 + i * 0.005)),
  }));
