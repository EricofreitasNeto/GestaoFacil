/* Autenticação (login, registro, logout) e controle de layout de usuário */

async function handleLogin(e) {
            e.preventDefault();
            
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            
            loginText.style.display = 'none';
            loginLoading.style.display = 'inline-block';
            loginStatus.className = 'api-status';
            
            try {
                const response = await fetch(`${API_BASE_URL}/auth/login`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ email, password })
                });
                
                const data = await response.json();
                
                if (response.ok) {
                    authToken = data.token;
                    localStorage.setItem('authToken', authToken);
                    
                    // Decodificar o token JWT para obter informações do usuário
                    const payload = JSON.parse(atob(authToken.split('.')[1]));
                    currentUser = {
                        id: payload.id,
                        nome: payload.nome,
                        email: payload.email,
                        cargo: payload.cargo
                    };
                    
                    localStorage.setItem('currentUser', JSON.stringify(currentUser));
                    
                    showMainLayout();
                    loadDashboardData();
                } else {
                    loginStatus.textContent = data.message || 'Erro ao fazer login';
                    loginStatus.className = 'api-status error';
                }
            } catch (error) {
                loginStatus.textContent = 'Erro de conexão. Verifique se o servidor está rodando.';
                loginStatus.className = 'api-status error';
            } finally {
                loginText.style.display = 'inline-block';
                loginLoading.style.display = 'none';
            }
        }

async function handleRegister(e) {
            e.preventDefault();
            
            const nome = document.getElementById('register-name').value;
            const email = document.getElementById('register-email').value;
            const cargo = document.getElementById('register-cargo').value;
            const telefone = document.getElementById('register-phone').value;
            const password = document.getElementById('register-password').value;
            const confirmPassword = document.getElementById('register-confirm-password').value;
            
            if (password !== confirmPassword) {
                registerStatus.textContent = 'As senhas não coincidem';
                registerStatus.className = 'api-status error';
                return;
            }
            
            registerText.style.display = 'none';
            registerLoading.style.display = 'inline-block';
            registerStatus.className = 'api-status';
            
            try {
                const response = await fetch(`${API_BASE_URL}/auth/register`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ nome, email, cargo, telefone, password, confirmPassword })
                });
                
                const data = await response.json();
                
                if (response.ok) {
                    registerStatus.textContent = 'Conta criada com sucesso! Faça login para continuar.';
                    registerStatus.className = 'api-status success';
                    
                    // Limpar formulário
                    document.getElementById('register-form').reset();
                    
                    // Voltar para a página de login após 2 segundos
                    setTimeout(() => {
                        showLoginPage();
                    }, 2000);
                } else {
                    registerStatus.textContent = data.message || 'Erro ao criar conta';
                    registerStatus.className = 'api-status error';
                }
            } catch (error) {
                registerStatus.textContent = 'Erro de conexão. Verifique se o servidor está rodando.';
                registerStatus.className = 'api-status error';
            } finally {
                registerText.style.display = 'inline-block';
                registerLoading.style.display = 'none';
            }
        }

function handleLogout(e) {
            if (e) e.preventDefault();
            
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
            
            // Atualizar informações do usuário
            if (currentUser.nome) {
                userNameElement.textContent = currentUser.nome;
                userAvatarElement.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser.nome)}&background=4e73df&color=fff`;
                
                // Atualizar badge de cargo
                if (currentUser.cargo) {
                    userRoleBadge.textContent = currentUser.cargo;
                    let badgeColor = 'bg-secondary';
                    
                    switch(currentUser.cargo) {
                        case 'admin':
                            badgeColor = 'bg-danger';
                            break;
                        case 'tecnico':
                            badgeColor = 'bg-warning';
                            break;
                        case 'usuario':
                            badgeColor = 'bg-info';
                            break;
                    }
                    
                    userRoleBadge.className = `badge ${badgeColor} role-badge`;
                    
                    // Mostrar/ocultar elementos baseados no cargo
                    updateUIForUserRole(currentUser.cargo);
                }
            }
        }

function updateUIForUserRole(role) {
            // Mostrar/ocultar menus baseados no cargo
            const adminMenus = document.querySelectorAll('.admin-only');
            adminMenus.forEach(menu => {
                if (role === 'admin') {
                    menu.classList.add('visible');
                } else {
                    menu.classList.remove('visible');
                }
            });
            
            // Mostrar/ocultar botões baseados no cargo
            const adminButtons = document.querySelectorAll('.btn-admin-only');
            adminButtons.forEach(button => {
                if (role === 'admin') {
                    button.classList.add('visible');
                } else {
                    button.classList.remove('visible');
                }
            });
        }

