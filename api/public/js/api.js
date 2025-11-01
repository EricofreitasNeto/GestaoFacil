/* Utilitários globais para comunicação com a API */

var API_BASE_URL = (function () {
  try {
    var meta = document.querySelector('meta[name="api-base-url"]');
    var metaUrl = meta && meta.getAttribute('content');
    var origin = window.location.origin;
    var isLocalhost = /^(localhost|127\.0\.0\.1)(:\\d+)?$/.test(window.location.hostname);
    // Produção: usa sempre a mesma origem da página
    if (!isLocalhost) return origin;
    // Desenvolvimento: permite meta ou fallback local
    return window.API_BASE_URL || metaUrl || 'http://localhost:3000';
  } catch (e) {
    return window.location.origin;
  }
})();
// expõe para inspeção quando necessário
window.API_BASE_URL = API_BASE_URL;

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
  const url = endpoint.startsWith('http') ? endpoint : new URL(endpoint, API_BASE_URL).toString();
  const config = { ...options };
  config.headers = {
    Accept: 'application/json',
    ...(options.headers || {})
  };

  if (config.body && !(config.body instanceof FormData) && !config.headers['Content-Type']) {
    config.headers['Content-Type'] = 'application/json';
  }

  // Só envia Authorization para origens confiáveis
  try {
    const requestOrigin = new URL(url, window.location.origin).origin;
    const allowedOrigins = [window.location.origin];
    try {
      const apiOrigin = new URL(API_BASE_URL, window.location.origin).origin;
      if (!allowedOrigins.includes(apiOrigin)) allowedOrigins.push(apiOrigin);
    } catch (_) { /* ignore */ }
    if (authToken && allowedOrigins.includes(requestOrigin)) {
      config.headers.Authorization = `Bearer ${authToken}`;
    }
  } catch (_) {
    if (authToken) {
      config.headers.Authorization = `Bearer ${authToken}`;
    }
  }

  const response = await fetch(url, config);
  let payload = null;
  const text = await response.text();
  if (text) {
    try {
      payload = JSON.parse(text);
    } catch (error) {
      console.error('NÃ£o foi possÃ­vel converter resposta em JSON:', error);
      payload = null;
    }
  }

  if (!response.ok) {
    const message = payload?.message || payload?.erro || `Erro ${response.status}`;
    const err = new Error(message); err.status = response.status; err.body = payload; throw err;
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
    throw new Error('Informe um JSON vÃ¡lido no campo de detalhes.');
  }
}

function formatDate(isoString) {
  if (!isoString) return 'â€”';
  try {
    return new Date(isoString).toLocaleDateString('pt-BR');
  } catch (error) {
    return 'â€”';
  }
}

window.apiRequest = apiRequest;
window.parseJsonField = parseJsonField;
window.formatDate = formatDate;

// Helper global e padronizado para cores de status
function getStatusBadgeClass(status) {
  if (!status) return 'secondary';
  const s = String(status).normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase().trim();
  switch (s) {
    case 'concluido':
    case 'concluido.':
    case 'ativo':
      return 'success';
    case 'em andamento':
      return 'primary';
    case 'agendado':
      return 'info';
    case 'manutencao':
      return 'warning';
    case 'cancelado':
    case 'inativo':
      return 'danger';
    case 'pendente':
    default:
      return 'secondary';
  }
}

window.getStatusBadgeClass = getStatusBadgeClass;






