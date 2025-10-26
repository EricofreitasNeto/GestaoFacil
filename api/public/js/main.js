/* Inicialização e funções gerais (main.js) */

// 🔧 Configuração da API
const API_BASE_URL = 'http://localhost:3000'; // Altere para ambiente local se necessário
let authToken = localStorage.getItem('authToken');
let currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');

// 📦 Controle de CRUD e paginação
let currentEntity = null;
let currentItemId = null;
const itemsPerPage = 10;
const currentPage = {
  clientes: 1,
  ativos: 1,
  servicos: 1,
  usuarios: 1,
  locais: 1,
  tiposServicos: 1
};

// 🎨 Elementos da interface
const UI = {
  loginPage: document.getElementById('login-page'),
  registerPage: document.getElementById('register-page'),
  mainLayout: document.getElementById('main-layout'),
  loginForm: document.getElementById('login-form'),
  registerForm: document.getElementById('register-form'),
  loginStatus: document.getElementById('login-status'),
  registerStatus: document.getElementById('register-status'),
  loginBtn: document.getElementById('login-btn'),
  registerBtn: document.getElementById('register-btn'),
  loginText: document.getElementById('login-text'),
  registerText: document.getElementById('register-text'),
  loginLoading: document.getElementById('login-loading'),
  registerLoading: document.getElementById('register-loading'),
  userName: document.getElementById('user-name'),
  userAvatar: document.getElementById('user-avatar'),
  userRoleBadge: document.getElementById('user-role-badge'),
  registerLink: document.getElementById('register-link'),
  backToLogin: document.getElementById('back-to-login'),
  logoutBtn: document.getElementById('logout-btn'),
  dropdownLogoutBtn: document.getElementById('dropdown-logout-btn'),
  sidebarToggle: document.getElementById('sidebarToggle'),
  contentWrapper: document.getElementById('content-wrapper'),
  sidebar: document.getElementById('sidebar'),
  confirmDeleteBtn: document.getElementById('confirm-delete-btn')
};

// 🚀 Inicialização
document.addEventListener('DOMContentLoaded', () => {
  authToken ? showMainLayout() && loadDashboardData() : showLoginPage();
  setupEventListeners();
});

// 🧩 Eventos globais
function setupEventListeners() {
  UI.loginForm.addEventListener('submit', handleLogin);
  UI.registerForm.addEventListener('submit', handleRegister);
  UI.registerLink.addEventListener('click', e => { e.preventDefault(); showRegisterPage(); });
  UI.backToLogin.addEventListener('click', e => { e.preventDefault(); showLoginPage(); });
  UI.logoutBtn.addEventListener('click', handleLogout);
  UI.dropdownLogoutBtn.addEventListener('click', handleLogout);
  UI.sidebarToggle.addEventListener('click', toggleSidebar);
  UI.confirmDeleteBtn.addEventListener('click', confirmDelete);

  document.querySelectorAll('.nav-link[data-section]').forEach(link => {
    link.addEventListener('click', e => {
      e.preventDefault();
      navigateToSection(link.getAttribute('data-section'));
    });
  });

  const crudMap = {
    clientes: ['client'],
    ativos: ['ativo'],
    servicos: ['servico'],
    usuarios: ['usuario'],
    locais: ['local'],
    tiposServicos: ['tipo-servico']
  };

  Object.entries(crudMap).forEach(([section, prefix]) => {
    document.getElementById(`save-${prefix}-btn`).addEventListener('click', window[`save${capitalize(prefix)}`]);
    document.getElementById(`search-${prefix}-btn`).addEventListener('click', window[`search${capitalize(section)}`]);
  });

  document.querySelectorAll('.modal').forEach(modal => {
    modal.addEventListener('hidden.bs.modal', () => {
      clearForm(modal.querySelector('form'));
      currentItemId = null;
    });
  });
}

// 📍 Navegação entre seções
function navigateToSection(section) {
  document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
  document.querySelector(`.nav-link[data-section="${section}"]`).classList.add('active');

  document.querySelectorAll('.content-section').forEach(s => s.style.display = 'none');
  document.getElementById(`${section}-section`).style.display = 'block';

  const loaders = {
    dashboard: loadDashboardData,
    clientes: loadClientes,
    ativos: loadAtivos,
    servicos: loadServicos,
    usuarios: loadUsuarios,
    locais: loadLocais,
    'tipos-servicos': loadTiposServicos
  };

  if (loaders[section]) loaders[section]();
}

// 📱 Sidebar responsiva
function toggleSidebar() {
  const isMobile = window.innerWidth < 576;
  if (isMobile) {
    UI.sidebar.classList.toggle('mobile-show');
    UI.contentWrapper.classList.toggle('mobile-pushed');
  } else {
    const compact = UI.sidebar.style.width === '80px';
    UI.sidebar.style.width = compact ? '250px' : '80px';
    UI.contentWrapper.style.marginLeft = compact ? '250px' : '80px';
    UI.contentWrapper.style.width = compact ? 'calc(100% - 250px)' : 'calc(100% - 80px)';

    document.querySelectorAll('.sidebar .nav-link span').forEach(span => {
      span.style.display = compact ? 'inline' : 'none';
    });
  }
}

// 🔠 Utilitário para capitalizar nomes
function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}