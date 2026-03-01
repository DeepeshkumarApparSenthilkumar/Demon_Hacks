// promptBuilder.js
// Builds rich, data-packed prompts so Claude always has real context to reason from.
// This is what stops Claude from saying "I don't have access to real-time data."

import { MOCK_INDICES, MOCK_NEWS, CHICAGO_COMPANIES } from "./mockData.js";

// Sector-specific drivers Claude can use when no live news is available
const SECTOR_CONTEXT = {
  Utilities:   "Utility stocks are sensitive to interest rate changes, regulatory decisions, weather-driven demand, and energy transition costs. WEC Energy operates in the Midwest, so cold snaps, gas prices, and Wisconsin/Illinois regulatory updates are key drivers.",
  Aerospace:   "Aerospace stocks react to production rates, delivery schedules, defense contracts, and supply chain issues. Boeing specifically is watched for 737/787 program updates, FAA actions, and labor relations.",
  Finance:     "Financial sector stocks move on interest rate expectations, trading volumes, and earnings. CME and CBOE benefit from volatility spikes. Morningstar is driven by fund flows and data subscription trends.",
  Consumer:    "Consumer stocks are driven by same-store sales, commodity input costs (wheat, oil), and consumer confidence. McDonald's watches labor costs and franchise health. Mondelez tracks snacking demand globally.",
  Pharma:      "Pharma stocks react to FDA approvals, clinical trial data, patent cliffs, and pricing policy. AbbVie is particularly sensitive to Humira biosimilar competition and Skyrizi/Rinvoq pipeline updates.",
  Aviation:    "Airline stocks move on fuel prices, capacity guidance, fare trends, and load factors. United Airlines is a bellwether for business travel demand at O'Hare, one of the world's busiest hubs.",
  Agriculture: "Agriculture stocks track grain prices, crop yields, biofuel demand, and export volumes. ADM is exposed to soybean, corn, and wheat futures traded on the Chicago Board of Trade.",
};

const SECTOR_PEERS = {
  Utilities:   "sector peers NEE, DUK, SO are also under pressure from rising bond yields",
  Aerospace:   "sector peers RTX, LMT, GD provide context for defense vs commercial aerospace split",
  Finance:     "broader financials sector (XLF) and CME Group's own volume data are key comparables",
  Consumer:    "consumer staples (XLP) weakness or strength often reflects inflation expectations",
  Pharma:      "biotech/pharma sector (XBI, IBB) sentiment and FDA calendar drive moves",
  Aviation:    "JETS ETF and fuel prices (WTI crude at $78.44) are direct read-throughs",
  Agriculture: "CBOT corn, soybean, and wheat futures are direct inputs to ADM's margin story",
};

/**
 * Builds a rich system prompt with current market context
 */
export function buildSystemPrompt() {
  const today = new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" });

  const indexSummary = MOCK_INDICES
    .map(i => `${i.name}: ${i.value.toLocaleString()} (${i.change > 0 ? "+" : ""}${i.change.toFixed(2)}%)`)
    .join(" | ");

  const newsSummary = MOCK_NEWS.slice(0, 4)
    .map(n => `• [${n.sentiment}] ${n.headline} (${n.source}, ${n.date})`)
    .join("\n");

  return `You are ChiTrade AI — a Chicago-focused financial analyst and market intelligence assistant.

TODAY'S DATE: ${today}

CURRENT MARKET CONDITIONS:
${indexSummary}

VIX at ${MOCK_INDICES.find(i => i.id === "VIX")?.value ?? 16.88} indicates ${MOCK_INDICES.find(i => i.id === "VIX")?.value > 20 ? "elevated fear and hedging activity" : "relatively calm conditions with moderate uncertainty"}.

CHICAGO MARKET NEWS TODAY:
${newsSummary}

YOUR RULES:
- Always give a concrete, data-driven answer using the stock data and market context provided
- Reference specific numbers (price, % change, sector conditions, VIX level) in your reasoning
- Never say "I don't have access to real-time data" — you have the data above plus what's in the user message
- If you're uncertain about a specific catalyst, say what the LIKELY drivers are based on sector context
- Be direct, sharp, and under 3 sentences unless asked for more
- Never give financial advice or buy/sell recommendations`;
}

/**
 * Builds a stock-specific analysis prompt packed with all available data
 */
export function buildStockPrompt(company, quote, allQuotes = {}) {
  const sector = company.sector;
  const sectorCtx = SECTOR_CONTEXT[sector] || "";
  const peerCtx = SECTOR_PEERS[sector] || "";

  // Find relevant news for this company
  const relevantNews = MOCK_NEWS.filter(n =>
    n.headline.toLowerCase().includes(company.name.toLowerCase()) ||
    n.headline.toLowerCase().includes(company.id.toLowerCase()) ||
    n.headline.toLowerCase().includes(sector.toLowerCase())
  );

  // Find sector peers in our universe for comparison
  const sectorPeers = CHICAGO_COMPANIES
    .filter(c => c.sector === sector && c.id !== company.id)
    .map(c => {
      const pq = allQuotes[c.id];
      return pq ? `${c.id} ${pq.pct > 0 ? "+" : ""}${pq.pct?.toFixed(2)}%` : c.id;
    });

  const vix = MOCK_INDICES.find(i => i.id === "VIX");
  const spy = MOCK_INDICES.find(i => i.id === "SPY");

  return `Analyze this stock move with the data below. Give a direct 2-3 sentence explanation of what's driving the price action today.

STOCK DATA:
- Company: ${company.name} (${company.id}) | Sector: ${sector} | Exchange: ${company.exchange}
- Price: $${quote?.price?.toFixed(2) ?? "N/A"}
- Today's Change: ${quote?.pct > 0 ? "+" : ""}${quote?.pct?.toFixed(2) ?? 0}% (${quote?.change > 0 ? "+" : ""}$${quote?.change?.toFixed(2) ?? 0})
- Volume: ${quote?.vol || quote?.volume || "normal"}
- Market Cap: ${quote?.cap || "N/A"} | P/E: ${quote?.pe || "N/A"}

BROADER MARKET TODAY:
- S&P 500: ${spy?.change > 0 ? "+" : ""}${spy?.change?.toFixed(2)}% — market is ${Math.abs(spy?.change) < 0.3 ? "roughly flat" : spy?.change > 0 ? "up today" : "down today"}
- VIX: ${vix?.value} (${vix?.change > 0 ? "+" : ""}${vix?.change?.toFixed(2)}%) — ${vix?.value > 20 ? "fear elevated" : "calm conditions"}
${sectorPeers.length > 0 ? `- Chicago sector peers: ${sectorPeers.join(", ")}` : ""}

SECTOR CONTEXT:
${sectorCtx}
Note: ${peerCtx}

${relevantNews.length > 0 ? `RELEVANT NEWS:\n${relevantNews.map(n => `• [${n.sentiment}] ${n.headline}`).join("\n")}` : "No specific news today — use sector context and market conditions to explain the move."}

Based on all of the above, explain in 2-3 sentences what is most likely driving ${company.name}'s ${quote?.pct > 0 ? "gain" : "decline"} today. Be specific and reference the actual numbers.`;
}

/**
 * Builds a market-wide summary prompt
 */
export function buildMarketSummaryPrompt() {
  const allCompanies = CHICAGO_COMPANIES.map(c => c.id).join(", ");
  const indexLines = MOCK_INDICES.map(i =>
    `${i.name} (${i.id}): ${i.value.toLocaleString()} | ${i.change > 0 ? "+" : ""}${i.change.toFixed(2)}%`
  ).join("\n");

  return `Give a sharp 3-4 sentence summary of today's Chicago market conditions based on this data:

INDICES:
${indexLines}

CHICAGO NEWS:
${MOCK_NEWS.map(n => `[${n.sentiment}] ${n.headline}`).join("\n")}

Focus on: overall market tone, what it means for Chicago-listed companies specifically, and the one or two biggest risks or opportunities right now.`;
}
