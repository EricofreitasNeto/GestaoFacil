// Inicialização
document.addEventListener('DOMContentLoaded', function() {
    // Verificar se o usuário já está logado
    if (authToken) {
        showMainLayout();
        loadDashboardData();
    } else {
        showLoginPage();
    }

    // Configurar eventos
    setupEventListeners();
});

// Configurar event listeners
function setupEventListeners() {
    // Login
    loginForm.addEventListener('submit', handleLogin);
    
    // Registro
    registerForm.addEventListener('submit', handleRegister);
    
    // Navegação entre login e registro
    registerLink.addEventListener('click', function(e) {
        e.preventDefault();
        showRegisterPage();
    });
    
    backToLogin.addEventListener('click', function(e) {
        e.preventDefault();
        showLoginPage();
    });
    
    // Logout
    document.getElementById('logout-btn').addEventListener('click', handleLogout);
    document.getElementById('dropdown-logout-btn').addEventListener('click', handleLogout);
    
    // Navegação
    document.querySelectorAll('.nav-link[data-section]').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            navigateToSection(this.getAttribute('data-section'));
        });
    });
  }
    // Toggle sidebar em mobile
    //document.getElementById('sidebarToggle').addEventListener('click', toggleSidebar);