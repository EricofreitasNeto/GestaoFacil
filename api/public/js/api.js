/* Utilitários globais para comunicação com a API */

var API_BASE_URL = window.location.origin.includes('localhost')
  ? 'http://localhost:3000'
  : window.location.origin;

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
  const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint}`;
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
      console.error('Não foi possível converter resposta em JSON:', error);
      payload = null;
    }
  }

  if (!response.ok) {
    const message = payload?.message || payload?.erro || `Erro ${response.status}`;
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
    throw new Error('Informe um JSON válido no campo de detalhes.');
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
