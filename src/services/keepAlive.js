const axios = require('axios');

function toBool(value, fallback) {
  if (value === undefined) return fallback;
  if (typeof value === 'boolean') return value;
  const v = String(value).toLowerCase().trim();
  return v === '1' || v === 'true' || v === 'yes' || v === 'on';
}

function normalizeBaseUrl(base) {
  if (!base) return '';
  const hasProtocol = /^https?:\/\//i.test(base);
  let out = hasProtocol ? base : `https://${base}`;
  // remove trailing slash
  if (out.endsWith('/')) out = out.slice(0, -1);
  return out;
}

function resolveKeepAliveUrl() {
  // Highest priority: explicit env or option KEEP_ALIVE_URL
  if (process.env.KEEP_ALIVE_URL) return process.env.KEEP_ALIVE_URL;

  // Use a public base URL if provided (same variável já usada no config.js dinâmico)
  if (process.env.PUBLIC_API_BASE_URL) {
    const base = normalizeBaseUrl(process.env.PUBLIC_API_BASE_URL);
    return `${base}/teste`;
  }

  // Attempt Render external URL if available (falls back gracefully)
  const renderUrl = process.env.RENDER_EXTERNAL_URL || process.env.RENDER_EXTERNAL_HOSTNAME;
  if (renderUrl) {
    const base = normalizeBaseUrl(renderUrl);
    return `${base}/teste`;
  }

  // Local fallback (útil em dev). Em produção pode não evitar hibernação.
  const port = process.env.PORT || 3000;
  return `http://localhost:${port}/teste`;
}

function startKeepAlive(options = {}) {
  const appMode = process.env.APP_MODE || 'production';
  const url = options.url || resolveKeepAliveUrl();
  const intervalMs = Number(options.intervalMs || process.env.KEEP_ALIVE_INTERVAL_MS || 5 * 60 * 1000);
  const enabled = toBool(
    options.enabled !== undefined ? options.enabled : process.env.KEEP_ALIVE_ENABLED,
    appMode === 'production'
  );

  if (!enabled) {
    console.log('[keepAlive] Disabled (set KEEP_ALIVE_ENABLED=true to enable).');
    return { stop: () => {} };
  }

  console.log(`[keepAlive] Enabled. Pinging ${url} every ${Math.round(intervalMs / 1000)}s`);

  const timer = setInterval(async () => {
    try {
      const started = Date.now();
      const res = await axios.get(url, {
        timeout: 10000,
        headers: { 'User-Agent': 'GestaoFacil-KeepAlive/1.0' },
        validateStatus: () => true,
      });
      const ms = Date.now() - started;
      console.log(`[keepAlive] GET ${url} -> ${res.status} in ${ms}ms`);
    } catch (err) {
      const code = err?.code || err?.response?.status || 'ERR';
      console.warn(`[keepAlive] Request failed: ${code}`);
    }
  }, intervalMs);

  if (typeof timer.unref === 'function') timer.unref();

  return {
    stop: () => clearInterval(timer),
  };
}

module.exports = { startKeepAlive };
