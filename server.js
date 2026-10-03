const http = require("http"), fs = require("fs"), path = require("path");

try {
  for (const line of fs.readFileSync(path.join(__dirname, ".env"), "utf8").split(/\r?\n/)) {
    const m = line.match(/^\s*([\w.]+)\s*=\s*(.*?)\s*$/);
    if (m && !line.trim().startsWith("#") && !(m[1] in process.env)) process.env[m[1]] = m[2].replace(/^['"]|['"]$/g, "");
  }
} catch { console.warn("No .env file found."); }

const env = (...names) => { for (const n of names) if (process.env[n]) return process.env[n]; };
const AZ_KEY = env("AZURE_OPENAI_API_KEY", "AZURE_API_KEY");
const AZ_BASE = (env("AZURE_OPENAI_ENDPOINT", "AZURE_ENDPOINT") || "").replace(/\/openai.*$/, "").replace(/\/+$/, "");
const DEPLOYMENT = env("AZURE_DEPLOYMENT_NAME", "AZURE_OPENAI_DEPLOYMENT") || "gpt-4.1-mini";
const FC_KEY = env("FIRECRAWL_API_KEY", "FIRECRAWL_KEY");
const PORT = process.env.PORT || 3000;
const MAX_SEARCHES = 2;
const RESULTS = 3;
const CHARS_PER_PAGE = 1500;

if (!AZ_KEY || !AZ_BASE) console.warn("Azure key or endpoint missing from .env, so chat will fail.");
if (!FC_KEY) console.warn("FIRECRAWL_API_KEY missing, so the tree will answer without web search.");

async function webSearch(query) {
  const r = await fetch("https://api.firecrawl.dev/v2/search", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: "Bearer " + FC_KEY },
    body: JSON.stringify({ query, limit: RESULTS, scrapeOptions: { formats: ["markdown"] } })
  });
  const j = await r.json().catch(() => ({}));
  if (!r.ok || j.success === false) throw new Error("Firecrawl: " + (j.error || j.message || r.status));
  const list = Array.isArray(j.data) ? j.data : (j.data?.web || []);
  return list.map(x => ({
    title: x.title || x.metadata?.title || x.url || "Source",
    url: x.url || x.metadata?.sourceURL || "",
    text: (x.markdown || x.description || "").slice(0, CHARS_PER_PAGE)
  })).filter(x => x.url);
}

const TOOLS = [{
  type: "function",
  function: {
    name: "web_search",
    description: "Search the live web for current, specific info (a program, internship, deadline, requirement, club, salary, tool). Do NOT use it for greetings, general advice, or things you already know well.",
    parameters: { type: "object", properties: { query: { type: "string", description: "Short, specific search query" } }, required: ["query"] }
  }
}];

async function azure(messages, useTools) {
  const r = await fetch(`${AZ_BASE}/openai/v1/chat/completions`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "api-key": AZ_KEY },
    body: JSON.stringify({ model: DEPLOYMENT, messages, temperature: 0.5, ...(useTools ? { tools: TOOLS } : {}) })
  });
  const j = await r.json().catch(() => ({}));
  if (!r.ok || j.error) throw new Error("Azure: " + (j.error?.message || r.status));
  return j.choices[0].message;
}

async function chat(clientMessages) {
  const messages = clientMessages
    .filter(m => m && ["system", "user", "assistant"].includes(m.role) && typeof m.content === "string")
    .slice(-24).map(m => ({ role: m.role, content: m.content.slice(0, 6000) }));
  const sources = [], seen = new Set();
  let searches = 0;

  for (let round = 0; round <= MAX_SEARCHES; round++) {
    const canSearch = FC_KEY && searches < MAX_SEARCHES;
    const msg = await azure(messages, canSearch);
    if (!msg.tool_calls?.length) {
      return { choices: [{ message: { content: msg.content || "", annotations: sources.map(s => ({ type: "url_citation", url_citation: s })) } }] };
    }
    messages.push(msg);
    for (const call of msg.tool_calls) {
      let out;
      try {
        if (searches >= MAX_SEARCHES) throw new Error("Search limit reached for this message.");
        searches++;
        const q = JSON.parse(call.function.arguments).query;
        console.log("searching:", q);
        const results = await webSearch(q);
        results.forEach(s => { if (!seen.has(s.url)) { seen.add(s.url); sources.push({ url: s.url, title: s.title }); } });
        out = results.map((s, i) => `[${i + 1}] ${s.title}\n${s.url}\n${s.text}`).join("\n\n") || "No results found.";
      } catch (e) { out = "Search failed: " + e.message; console.warn(e.message); }
      messages.push({ role: "tool", tool_call_id: call.id, content: out });
    }
  }
  throw new Error("Search loop did not finish");
}

const FILES = {
  "/": ["index.html", "text/html"], "/index.html": ["index.html", "text/html"],
  "/style.css": ["style.css", "text/css"], "/app.js": ["app.js", "text/javascript"],
  "/SoothingSounds.mp3": ["SoothingSounds.mp3", "audio/mpeg"]
};
const json = (res, code, obj) => { res.writeHead(code, { "Content-Type": "application/json" }); res.end(JSON.stringify(obj)); };

http.createServer(async (req, res) => {
  const url = req.url.split("?")[0];

  if (req.method === "POST" && url === "/api/chat") {
    if (!AZ_KEY || !AZ_BASE) return json(res, 500, { error: { message: "Azure key/endpoint missing from .env" } });
    let body = "";
    for await (const c of req) { body += c; if (body.length > 200000) return json(res, 413, { error: { message: "Request too large" } }); }
    try {
      const { messages } = JSON.parse(body);
      if (!Array.isArray(messages)) throw new Error("Bad request");
      json(res, 200, await chat(messages));
    } catch (e) { console.error(e.message); json(res, 502, { error: { message: e.message } }); }
    return;
  }

  const f = FILES[url];
  const file = f && path.join(__dirname, f[0]);
  if (!f || !fs.existsSync(file)) { res.writeHead(404); return res.end("Not found"); }
  const size = fs.statSync(file).size, text = /^text|javascript/.test(f[1]), type = f[1] + (text ? "; charset=utf-8" : "");
  const range = /bytes=(\d+)-(\d*)/.exec(req.headers.range || "");
  if (range) {
    const start = +range[1], end = range[2] ? Math.min(+range[2], size - 1) : size - 1;
    res.writeHead(206, { "Content-Type": type, "Content-Range": `bytes ${start}-${end}/${size}`, "Accept-Ranges": "bytes", "Content-Length": end - start + 1 });
    return fs.createReadStream(file, { start, end }).pipe(res);
  }
  res.writeHead(200, { "Content-Type": type, "Accept-Ranges": "bytes", "Content-Length": size });
  fs.createReadStream(file).pipe(res);
}).listen(PORT, () => console.log(`Tree of Wisdom running at http://localhost:${PORT}`));