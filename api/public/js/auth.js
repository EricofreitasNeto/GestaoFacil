/* Fluxo de autenticação e controle de layout vinculado ao usuário */

const loginPage = document.getElementById('login-page');
const registerPage = document.getElementById('register-page');
const mainLayout = document.getElementById('main-layout');
const loginForm = document.getElementById('login-form');
const registerForm = document.getElementById('register-form');
const loginStatus = document.getElementById('login-status');
const registerStatus = document.getElementById('register-status');
const loginText = document.getElementById('login-text');
const registerText = document.getElementById('register-text');
const loginLoading = document.getElementById('login-loading');
const registerLoading = document.getElementById('register-loading');
const registerLink = document.getElementById('register-link');
const backToLogin = document.getElementById('back-to-login');
const userNameElement = document.getElementById('user-name');
const userAvatarElement = document.getElementById('user-avatar');
const userRoleBadge = document.getElementById('user-role-badge');

function setStatus(element, message, type = 'info') {
  if (!element) return;
  element.textContent = message;
  element.className = `api-status ${type !== 'info' ? type : ''}`.trim();
  if (message) element.classList.add('show');
  else element.classList.remove('show');
}

async function handleLogin(event) {
  event.preventDefault();

  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;

  loginText.style.display = 'none';
  loginLoading.style.display = 'inline-block';
  setStatus(loginStatus, '');

  try {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Erro ao fazer login');

    authToken = data.token;
    localStorage.setItem('authToken', authToken);

    const payload = JSON.parse(atob(authToken.split('.')[1]));
    const tokenClienteIds = Array.isArray(payload.clienteIds) ? payload.clienteIds.filter((id) => Number.isFinite(Number(id))).map(Number) : [];
    const primaryClienteId = payload.clienteId ?? tokenClienteIds[0] ?? null;
    currentUser = {
      id: payload.id,
      nome: payload.nome,
      email: payload.email,
      cargo: payload.cargo,
      clienteId: primaryClienteId ?? null,
      clienteIds: tokenClienteIds.length ? tokenClienteIds : (primaryClienteId ? [primaryClienteId] : [])
    };
    localStorage.setItem('currentUser', JSON.stringify(currentUser));

    showMainLayout();
    if (typeof loadDashboardData === 'function') loadDashboardData();
    if (typeof refreshAllDropdowns === 'function') refreshAllDropdowns();
  } catch (error) {
    setStatus(loginStatus, error.message || 'Erro de conexão. Tente novamente.', 'error');
  } finally {
    loginText.style.display = 'inline-block';
    loginLoading.style.display = 'none';
  }
}

async function handleRegister(event) {
  event.preventDefault();

  const nome = document.getElementById('register-name').value;
  const email = document.getElementById('register-email').value;
  const cargo = document.getElementById('register-cargo').value;
  const telefone = document.getElementById('register-phone').value;
  const password = document.getElementById('register-password').value;
  const confirmPassword = document.getElementById('register-confirm-password').value;

  if (password !== confirmPassword) {
    setStatus(registerStatus, 'As senhas não coincidem.', 'error');
    return;
  }

  registerText.style.display = 'none';
  registerLoading.style.display = 'inline-block';
  setStatus(registerStatus, '');

  try {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nome, email, cargo, telefone, password, confirmPassword })
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Erro ao criar conta');

    setStatus(registerStatus, 'Conta criada com sucesso! Faça login para continuar.', 'success');
    registerForm.reset();

    setTimeout(() => showLoginPage(), 1500);
  } catch (error) {
    setStatus(registerStatus, error.message || 'Erro de conexão. Tente novamente.', 'error');
  } finally {
    registerText.style.display = 'inline-block';
    registerLoading.style.display = 'none';
  }
}

function handleLogout(event) {
  if (event) event.preventDefault();
  authToken = null;
  currentUser = {};
  localStorage.removeItem('authToken');
  localStorage.removeItem('currentUser');
  showLoginPage();
}

function showLoginPage() {
  loginPage.style.display = 'flex';
  registerPage.style.display = 'none';
  mainLayout.style.display = 'none';
}

function showRegisterPage() {
  loginPage.style.display = 'none';
  registerPage.style.display = 'flex';
  mainLayout.style.display = 'none';
}

function showMainLayout() {
  loginPage.style.display = 'none';
  registerPage.style.display = 'none';
  mainLayout.style.display = 'block';

  if (currentUser?.nome) {
    userNameElement.textContent = currentUser.nome;
    userAvatarElement.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser.nome)}&background=4e73df&color=fff`;
  }

  if (currentUser?.cargo) {
    userRoleBadge.textContent = currentUser.cargo;
    let badgeClass = 'bg-secondary';
    switch (currentUser.cargo) {
      case 'admin': badgeClass = 'bg-danger'; break;
      case 'tecnico': badgeClass = 'bg-warning text-dark'; break;
      case 'usuario': badgeClass = 'bg-info text-dark'; break;
    }
    userRoleBadge.className = `badge ${badgeClass} role-badge`;
    updateUIForUserRole(currentUser.cargo);
  }

  if (typeof navigateToSection === 'function') navigateToSection('dashboard');
}

function updateUIForUserRole(role) {
  const adminMenus = document.querySelectorAll('.admin-only');
  const adminButtons = document.querySelectorAll('.btn-admin-only');

  adminMenus.forEach(menu => menu.classList.toggle('visible', role === 'admin'));
  adminButtons.forEach(button => button.classList.toggle('visible', role === 'admin'));
}

window.handleLogin = handleLogin;
window.handleRegister = handleRegister;
window.handleLogout = handleLogout;
window.showLoginPage = showLoginPage;
window.showRegisterPage = showRegisterPage;
window.showMainLayout = showMainLayout;
window.updateUIForUserRole = updateUIForUserRole;
window.registerLink = registerLink;
window.backToLogin = backToLogin;
window.loginForm = loginForm;
window.registerForm = registerForm;
