const BASE = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL}/api`
  : "/api";

async function request(path, options = {}) {
  try {
    const res = await fetch(`${BASE}${path}`, {
      headers: { "Content-Type": "application/json" },
      ...options,
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
    return { data, error: null };
  } catch (err) {
    console.error(`[API] ${path}:`, err.message);
    return { data: null, error: err.message };
  }
}

// ─── Claude AI ───────────────────────────────────────────────────────────────
export async function askClaude(messages, system = "") {
  const { data, error } = await request("/claude", {
    method: "POST",
    body: JSON.stringify({ messages, system }),
  });
  if (error) return `⚠️ ${error}`;
  return data?.text || "No response received.";
}

// ─── Market data ─────────────────────────────────────────────────────────────
export async function fetchQuote(symbol) {
  const { data, error } = await request(`/quote/${symbol}`);
  return { data, error };
}

export async function fetchChart(symbol, interval = "5min") {
  const { data, error } = await request(`/chart/${symbol}?interval=${interval}`);
  return { data: data?.data, error };
}

export async function fetchIndices() {
  const { data, error } = await request("/indices");
  return { data: data?.data, error, mock: data?.mock };
}

// ─── News ─────────────────────────────────────────────────────────────────────
export async function fetchNews() {
  const { data, error } = await request("/news");
  return { data: data?.articles, error };
}

// ─── Health ───────────────────────────────────────────────────────────────────
export async function checkHealth() {
  const { data } = await request("/health");
  return data;
}
