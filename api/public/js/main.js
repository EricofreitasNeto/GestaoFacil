/* Inicialização da aplicação web e controles de interface */

const UI = {
  loginPage: document.getElementById('login-page'),
  registerPage: document.getElementById('register-page'),
  mainLayout: document.getElementById('main-layout'),
  sidebar: document.getElementById('sidebar'),
  sidebarToggle: document.getElementById('sidebarToggle'),
  mobileMenuBtn: document.getElementById('mobileMenuBtn'),
  contentWrapper: document.getElementById('content-wrapper'),
  logoutBtn: document.getElementById('logout-btn'),
  dropdownLogoutBtn: document.getElementById('dropdown-logout-btn'),
  confirmDeleteBtn: document.getElementById('confirm-delete-btn'),
  pageTitle: document.getElementById('page-title')
};

const SECTION_TITLES = {
  dashboard: 'Dashboard',
  clientes: 'Clientes',
  ativos: 'Ativos',
  servicos: 'Serviços',
  locais: 'Locais',
  'tipos-servicos': 'Tipos de Serviço',
  usuarios: 'Usuários'
};

const SECTION_LOADERS = {
  dashboard: () => typeof loadDashboardData === 'function' && loadDashboardData(),
  clientes: page => typeof loadClientes === 'function' && loadClientes(page),
  ativos: page => typeof loadAtivos === 'function' && loadAtivos(page),
  servicos: page => typeof loadServicos === 'function' && loadServicos(page),
  locais: page => typeof loadLocais === 'function' && loadLocais(page),
  'tipos-servicos': page => typeof loadTiposServicos === 'function' && loadTiposServicos(page),
  usuarios: page => typeof loadUsuarios === 'function' && loadUsuarios(page)
};

const DELETE_HANDLERS = {
  cliente: id => typeof deleteCliente === 'function' && deleteCliente(id),
  ativo: id => typeof deleteAtivo === 'function' && deleteAtivo(id),
  servico: id => typeof deleteServico === 'function' && deleteServico(id),
  usuario: id => typeof deleteUsuario === 'function' && deleteUsuario(id),
  local: id => typeof deleteLocal === 'function' && deleteLocal(id),
  'tipo-servico': id => typeof deleteTipoServico === 'function' && deleteTipoServico(id)
};

let currentEntity = null;
let currentItemId = null;

function getPaginationKey(section) {
  return section === 'tipos-servicos' ? 'tiposServicos' : section;
}

function setupEventListeners() {
  if (window.loginForm) loginForm.addEventListener('submit', handleLogin);
  if (window.registerForm) registerForm.addEventListener('submit', handleRegister);

  if (window.registerLink)
    registerLink.addEventListener('click', e => {
      e.preventDefault();
      showRegisterPage();
    });

  if (window.backToLogin)
    backToLogin.addEventListener('click', e => {
      e.preventDefault();
      showLoginPage();
    });

  document.querySelectorAll('.nav-link[data-section]').forEach(link => {
    link.addEventListener('click', e => {
      e.preventDefault();
      navigateToSection(link.getAttribute('data-section'));
    });
  });

  UI.logoutBtn?.addEventListener('click', handleLogout);
  UI.dropdownLogoutBtn?.addEventListener('click', handleLogout);

  UI.sidebarToggle?.addEventListener('click', toggleSidebar);
  UI.mobileMenuBtn?.addEventListener('click', toggleSidebar);
  UI.confirmDeleteBtn?.addEventListener('click', confirmDelete);

  document.querySelectorAll('.modal').forEach(modal => {
    modal.addEventListener('hidden.bs.modal', () => {
      const form = modal.querySelector('form');
      if (form) clearForm(form);
      currentEntity = null;
      currentItemId = null;
    });
  });

  const searchButtons = [
    ['search-client-btn', () => typeof searchClientes === 'function' && searchClientes()],
    ['search-ativo-btn', () => typeof searchAtivos === 'function' && searchAtivos()],
    ['search-servico-btn', () => typeof searchServicos === 'function' && searchServicos()],
    ['search-usuario-btn', () => typeof searchUsuarios === 'function' && searchUsuarios()],
    ['search-local-btn', () => typeof searchLocais === 'function' && searchLocais()],
    ['search-tipo-servico-btn', () => typeof searchTiposServicos === 'function' && searchTiposServicos()]
  ];

  searchButtons.forEach(([id, handler]) => {
    const btn = document.getElementById(id);
    if (btn) btn.addEventListener('click', handler);
  });

  const saveButtons = [
    ['save-client-btn', () => typeof saveClient === 'function' && saveClient()],
    ['save-ativo-btn', () => typeof saveAtivo === 'function' && saveAtivo()],
    ['save-servico-btn', () => typeof saveServico === 'function' && saveServico()],
    ['save-usuario-btn', () => typeof saveUsuario === 'function' && saveUsuario()],
    ['save-local-btn', () => typeof saveLocal === 'function' && saveLocal()],
    ['save-tipo-servico-btn', () => typeof saveTipoServico === 'function' && saveTipoServico()]
  ];

  saveButtons.forEach(([id, handler]) => {
    const btn = document.getElementById(id);
    if (btn) btn.addEventListener('click', handler);
  });

  window.addEventListener('resize', handleResponsiveSidebar);
}

function navigateToSection(section) {
  document.querySelectorAll('.content-section').forEach(sec => (sec.style.display = 'none'));
  const target = document.getElementById(`${section}-section`);
  if (target) target.style.display = 'block';

  document.querySelectorAll('.nav-link[data-section]').forEach(link => {
    link.classList.toggle('active', link.getAttribute('data-section') === section);
  });

  if (UI.pageTitle) UI.pageTitle.textContent = SECTION_TITLES[section] || 'GestãoFácil';

  const loader = SECTION_LOADERS[section];
  const key = getPaginationKey(section);
  const page = currentPage?.[key] || 1;
  if (loader) loader(page);

  if (window.innerWidth < 768) UI.sidebar?.classList.remove('mobile-open');
}

function toggleSidebar() {
  if (window.innerWidth < 768) {
    UI.sidebar?.classList.toggle('mobile-open');
  } else {
    UI.sidebar?.classList.toggle('collapsed');
    UI.contentWrapper?.classList.toggle('expanded');
  }
}

function handleResponsiveSidebar() {
  if (window.innerWidth >= 768) UI.sidebar?.classList.remove('mobile-open');
}

function showNotification(elementId, message, isSuccess = true) {
  const el = document.getElementById(elementId);
  if (!el) return;
  el.textContent = message;
  el.className = `api-status ${isSuccess ? 'success' : 'error'} show`;
}

// Utilitários de erro por campo e tratamento padrão
function markFieldError(selector, message) {
  const el = document.querySelector(selector);
  if (!el) return;
  el.classList.add('is-invalid');
  let fb = el.parentElement && el.parentElement.querySelector('.invalid-feedback');
  if (!fb) {
    fb = document.createElement('div');
    fb.className = 'invalid-feedback';
    el.parentElement && el.parentElement.appendChild(fb);
  }
  if (fb) fb.textContent = message || '';
}

function clearFieldError(selector) {
  const el = document.querySelector(selector);
  if (!el) return;
  el.classList.remove('is-invalid');
  const fb = el.parentElement && el.parentElement.querySelector('.invalid-feedback');
  if (fb) fb.textContent = '';
}

function handleApiError(err, fallbackElementId, fieldMap = []) {
  if (!err || typeof err !== 'object') {
    showNotification(fallbackElementId, 'Erro desconhecido', false);
    return;
  }
  const msg = String(err.message || '').toLowerCase();
  const status = err.status || 0;

  if (status === 401) {
    try { localStorage.removeItem('authToken'); } catch (_) {}
    if (typeof showLoginPage === 'function') showLoginPage();
    return;
  }
  if (status === 403) {
    showNotification(fallbackElementId, 'Acesso negado', false);
    return;
  }
  if (status === 409) {
    for (const { key, selector } of fieldMap) {
      if (msg.includes(key)) {
        markFieldError(selector, err.message);
        return;
      }
    }
    showNotification(fallbackElementId, err.message || 'Registro já existe', false);
    return;
  }
  if (status === 400) {
    showNotification(fallbackElementId, err.message || 'Dados inválidos', false);
    return;
  }
  showNotification(fallbackElementId, err.message || 'Erro no servidor', false);
}

window.markFieldError = markFieldError;
window.clearFieldError = clearFieldError;
window.handleApiError = handleApiError;

function clearForm(form) {
  if (!form) return;
  form.reset();
  const hiddenId = form.querySelector('input[type="hidden"][name="id"], input[type="hidden"][id$="-id"]');
  if (hiddenId) hiddenId.value = '';
}

function askForDelete(entity, itemId) {
  currentEntity = entity;
  currentItemId = itemId;
  const modal = bootstrap.Modal.getOrCreateInstance(document.getElementById('confirmDeleteModal'));
  modal?.show();
}

async function confirmDelete() {
  if (!currentEntity || !currentItemId) return;
  const handler = DELETE_HANDLERS[currentEntity];
  if (typeof handler === 'function') await handler(currentItemId);
  bootstrap.Modal.getInstance(document.getElementById('confirmDeleteModal'))?.hide();
  currentEntity = null;
  currentItemId = null;
}

function updatePagination(section, totalItems, page) {
  const container = document.getElementById(`${section}-pagination`);
  if (!container) return;

  const key = getPaginationKey(section);
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));
  currentPage[key] = Math.min(page, totalPages);

  if (totalPages <= 1) {
    container.innerHTML = '';
    return;
  }

  const createButton = (label, targetPage, disabled = false) => {
    const btn = document.createElement('button');
    btn.textContent = label;
    if (disabled) btn.disabled = true;
    if (targetPage === currentPage[key]) btn.classList.add('active');
    btn.addEventListener('click', () => {
      currentPage[key] = targetPage;
      const loader = SECTION_LOADERS[section];
      if (loader) loader(targetPage);
    });
    return btn;
  };

  container.innerHTML = '';
  container.appendChild(createButton('Anterior', Math.max(1, currentPage[key] - 1), currentPage[key] === 1));

  for (let i = 1; i <= totalPages; i++) container.appendChild(createButton(i, i));

  container.appendChild(createButton('Próximo', Math.min(totalPages, currentPage[key] + 1), currentPage[key] === totalPages));
}

async function refreshAllDropdowns() {
  try {
    const [clientes, locais, ativos, usuarios, tiposServicos] = await Promise.all([
      apiRequest('/v1/clientes'),
      apiRequest('/v1/locais'),
      apiRequest('/v1/ativos'),
      currentUser?.cargo === 'admin' ? apiRequest('/v1/usuarios') : Promise.resolve([]),
      apiRequest('/v1/tipos-servicos')
    ]);

    updateClientDropdowns(clientes || []);
    updateLocalDropdown(locais || []);
    updateAtivoDropdown(ativos || []);
    updateUsuarioDropdown(usuarios || []);
    updateTipoServicoDropdown(tiposServicos || []);
  } catch (error) {
    console.warn('Não foi possível atualizar listas auxiliares:', error.message);
  }
}

/* Atualização de selects (dropdowns) */
function updateClientDropdowns(clientes) {
  const select = document.getElementById('servicoCliente');
  if (!select) return;
  select.innerHTML = '<option value="">Selecione</option>';
  clientes.forEach(c => {
    const opt = document.createElement('option');
    opt.value = c.id;
    opt.textContent = c.nome;
    select.appendChild(opt);
  });
}

function updateLocalDropdown(locais) {
  const select = document.getElementById('ativoLocal');
  if (!select) return;
  select.innerHTML = '<option value="">Selecione</option>';
  locais.forEach(l => {
    const opt = document.createElement('option');
    opt.value = l.id;
    opt.textContent = l.nome;
    select.appendChild(opt);
  });
}

function updateAtivoDropdown(ativos) {
  const select = document.getElementById('servicoAtivo');
  if (!select) return;
  select.innerHTML = '<option value="">Selecione</option>';
  ativos.forEach(a => {
    const opt = document.createElement('option');
    opt.value = a.id;
    opt.textContent = a.nome;
    select.appendChild(opt);
  });
}

function updateUsuarioDropdown(usuarios) {
  const select = document.getElementById('servicoUsuario');
  if (!select) return;
  select.innerHTML = '<option value="">Selecione</option>';
  usuarios.forEach(u => {
    const opt = document.createElement('option');
    opt.value = u.id;
    opt.textContent = u.nome;
    select.appendChild(opt);
  });
}

function updateTipoServicoDropdown(tipos) {
  const select = document.getElementById('servicoTipo');
  if (!select) return;
  select.innerHTML = '<option value="">Selecione</option>';
  tipos.forEach(t => {
    const opt = document.createElement('option');
    opt.value = t.id;
    opt.textContent = t.nome;
    select.appendChild(opt);
  });
}

/* Exporta funções globais */
window.askForDelete = askForDelete;
window.showNotification = showNotification;
window.clearForm = clearForm;
window.updatePagination = updatePagination;
window.updateClientDropdowns = updateClientDropdowns;
window.updateLocalDropdown = updateLocalDropdown;
window.updateAtivoDropdown = updateAtivoDropdown;
window.updateUsuarioDropdown = updateUsuarioDropdown;
window.updateTipoServicoDropdown = updateTipoServicoDropdown;
window.refreshAllDropdowns = refreshAllDropdowns;
window.navigateToSection = navigateToSection;

/* Inicialização */
window.addEventListener('DOMContentLoaded', () => {
  setupEventListeners();

  if (authToken) {
    showMainLayout();
    refreshAllDropdowns();
    SECTION_LOADERS.dashboard();
  } else {
    showLoginPage();
  }
});
