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
  'tipos-servicos': 'Tipos de serviço',
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
  if (window.loginForm) {
    loginForm.addEventListener('submit', handleLogin);
  }
  if (window.registerForm) {
    registerForm.addEventListener('submit', handleRegister);
  }
  if (window.registerLink) {
    registerLink.addEventListener('click', event => {
      event.preventDefault();
      showRegisterPage();
    });
  }
  if (window.backToLogin) {
    backToLogin.addEventListener('click', event => {
      event.preventDefault();
      showLoginPage();
    });
  }

  document.querySelectorAll('.nav-link[data-section]').forEach(link => {
    link.addEventListener('click', event => {
      event.preventDefault();
      const section = link.getAttribute('data-section');
      navigateToSection(section);
    });
  });

  UI.logoutBtn?.addEventListener('click', handleLogout);
  UI.dropdownLogoutBtn?.addEventListener('click', handleLogout);

  UI.sidebarToggle?.addEventListener('click', toggleSidebar);
  UI.mobileMenuBtn?.addEventListener('click', toggleSidebar);

  UI.confirmDeleteBtn?.addEventListener('click', confirmDelete);

  document.querySelectorAll('.modal').forEach(modalElement => {
    modalElement.addEventListener('hidden.bs.modal', () => {
      const form = modalElement.querySelector('form');
      if (form) {
        clearForm(form);
      }
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
    const button = document.getElementById(id);
    if (button) {
      button.addEventListener('click', handler);
    }
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
    const button = document.getElementById(id);
    if (button) {
      button.addEventListener('click', handler);
    }
  });

  window.addEventListener('resize', handleResponsiveSidebar);
}

function navigateToSection(section) {
  const sections = document.querySelectorAll('.content-section');
  sections.forEach(area => {
    area.style.display = 'none';
  });

  const target = document.getElementById(`${section}-section`);
  if (target) {
    target.style.display = 'block';
  }

  document.querySelectorAll('.nav-link[data-section]').forEach(link => {
    link.classList.toggle('active', link.getAttribute('data-section') === section);
  });

  if (UI.pageTitle) {
    UI.pageTitle.textContent = SECTION_TITLES[section] || 'GestãoFácil';
  }

  const loader = SECTION_LOADERS[section];
  const key = getPaginationKey(section);
  const page = currentPage?.[key] || 1;
  if (loader) {
    loader(page);
  }

  if (window.innerWidth < 768) {
    UI.sidebar?.classList.remove('mobile-open');
  }
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
  if (window.innerWidth >= 768) {
    UI.sidebar?.classList.remove('mobile-open');
  }
}

function showNotification(elementId, message, isSuccess = true) {
  const element = document.getElementById(elementId);
  if (!element) return;

  element.textContent = message;
  element.className = `api-status ${isSuccess ? 'success' : 'error'} show`;
}

function clearForm(form) {
  if (!form) return;
  form.reset();
  const hiddenId = form.querySelector('input[type="hidden"][name="id"], input[type="hidden"][id$="-id"]');
  if (hiddenId) {
    hiddenId.value = '';
  }
}

function askForDelete(entity, itemId) {
  currentEntity = entity;
  currentItemId = itemId;
  const modalElement = document.getElementById('confirmDeleteModal');
  if (modalElement) {
    const modal = bootstrap.Modal.getOrCreateInstance(modalElement);
    modal.show();
  }
}

async function confirmDelete() {
  if (!currentEntity || !currentItemId) return;

  const handler = DELETE_HANDLERS[currentEntity];
  if (typeof handler === 'function') {
    await handler(currentItemId);
  }

  const modalElement = document.getElementById('confirmDeleteModal');
  if (modalElement) {
    bootstrap.Modal.getInstance(modalElement)?.hide();
  }

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

  container.innerHTML = '';

  const createButton = (label, targetPage, disabled = false) => {
    const button = document.createElement('button');
    button.textContent = label;
    if (disabled) {
      button.disabled = true;
    }
    if (targetPage === currentPage[key]) {
      button.classList.add('active');
    }
    button.addEventListener('click', () => {
      currentPage[key] = targetPage;
      const loader = SECTION_LOADERS[section];
      if (loader) {
        loader(targetPage);
      }
    });
    return button;
  };

  container.appendChild(createButton('Anterior', Math.max(1, currentPage[key] - 1), currentPage[key] === 1));

  for (let i = 1; i <= totalPages; i += 1) {
    container.appendChild(createButton(i, i));
  }

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

function updateClientDropdowns(clientes) {
  const clienteSelect = document.getElementById('servicoCliente');
  if (!clienteSelect) return;
  clienteSelect.innerHTML = '<option value="">Selecione</option>';
  clientes.forEach(cliente => {
    const option = document.createElement('option');
    option.value = cliente.id;
    option.textContent = cliente.nome;
    clienteSelect.appendChild(option);
  });
}

function updateLocalDropdown(locais) {
  const localSelect = document.getElementById('ativoLocal');
  if (!localSelect) return;
  localSelect.innerHTML = '<option value="">Selecione</option>';
  locais.forEach(local => {
    const option = document.createElement('option');
    option.value = local.id;
    option.textContent = local.nome;
    localSelect.appendChild(option);
  });
}

function updateAtivoDropdown(ativos) {
  const ativoSelect = document.getElementById('servicoAtivo');
  if (!ativoSelect) return;
  ativoSelect.innerHTML = '<option value="">Selecione</option>';
  ativos.forEach(ativo => {
    const option = document.createElement('option');
    option.value = ativo.id;
    option.textContent = ativo.nome;
    ativoSelect.appendChild(option);
  });
}

function updateUsuarioDropdown(usuarios) {
  const usuarioSelect = document.getElementById('servicoUsuario');
  if (!usuarioSelect) return;
  usuarioSelect.innerHTML = '<option value="">Selecione</option>';
  usuarios.forEach(usuario => {
    const option = document.createElement('option');
    option.value = usuario.id;
    option.textContent = usuario.nome;
    usuarioSelect.appendChild(option);
  });
}

function updateTipoServicoDropdown(tipos) {
  const tipoSelect = document.getElementById('servicoTipo');
  if (!tipoSelect) return;
  tipoSelect.innerHTML = '<option value="">Selecione</option>';
  tipos.forEach(tipo => {
    const option = document.createElement('option');
    option.value = tipo.id;
    option.textContent = tipo.nome;
    tipoSelect.appendChild(option);
  });
}

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
