/* Utilitarios globais para comunicacao com a API */

// Estrategia de resolucao para API_BASE_URL (ordem):
// 1) window.API_BASE_URL (definido antes destes scripts)
// 2) <meta name="api-base-url" content="...">
// 3) localhost → http://localhost:3000
// 4) mesma origem do app
;(function () {
  try {
    var metaEl = document.querySelector('meta[name="api-base-url"]');
    var metaUrl = metaEl && metaEl.getAttribute('content');
    var isLocalhost = /^(localhost|127\.0\.0\.1)(:\\d+)?$/.test(window.location.host);
    var fallbackLocal = 'http://localhost:3000';
    var fallbackOrigin = window.location.origin;

    window.API_BASE_URL = window.API_BASE_URL || metaUrl || (isLocalhost ? fallbackLocal : fallbackOrigin);
  } catch (e) {
    window.API_BASE_URL = window.location.origin.includes('localhost')
      ? 'http://localhost:3000'
      : window.location.origin;
  }
})();

var authToken = localStorage.getItem('authToken') || null;
var currentUser = {};
try {
  currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
} catch (error) {
  currentUser = {};
}

var itemsPerPage = 10;
var currentPage = {
  clientes: 1,
  ativos: 1,
  servicos: 1,
  usuarios: 1,
  locais: 1,
  tiposServicos: 1
};

async function apiRequest(endpoint, options = {}) {
  const base = (typeof window !== 'undefined' && window.API_BASE_URL)
    ? window.API_BASE_URL
    : (window.location.origin.includes('localhost') ? 'http://localhost:3000' : window.location.origin);
  const url = endpoint.startsWith('http') ? endpoint : `${base}${endpoint}`;

  const config = { ...options };
  config.headers = {
    Accept: 'application/json',
    ...(options.headers || {})
  };

  if (config.body && !(config.body instanceof FormData) && !config.headers['Content-Type']) {
    config.headers['Content-Type'] = 'application/json';
  }

  if (authToken) {
    config.headers.Authorization = `Bearer ${authToken}`;
  }

  const response = await fetch(url, config);
  let payload = null;
  const text = await response.text();
  if (text) {
    try {
      payload = JSON.parse(text);
    } catch (error) {
      console.error('Nao foi possivel converter resposta em JSON:', error);
      payload = null;
    }
  }

  if (!response.ok) {
    const message = (payload && (payload.message || payload.erro)) || `Erro ${response.status}`;
    throw new Error(message);
  }

  return payload;
}

function parseJsonField(value) {
  if (!value || typeof value !== 'string') {
    return null;
  }

  try {
    return JSON.parse(value);
  } catch (error) {
    throw new Error('Informe um JSON valido no campo de detalhes.');
  }
}

function formatDate(isoString) {
  if (!isoString) return '—';
  try {
    return new Date(isoString).toLocaleDateString('pt-BR');
  } catch (error) {
    return '—';
  }
}

window.apiRequest = apiRequest;
window.parseJsonField = parseJsonField;
window.formatDate = formatDate;

