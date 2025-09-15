// Configuração da API
const API_BASE_URL = 'http://localhost:3000';
let authToken = localStorage.getItem('authToken');
let currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');

// Variáveis para controle do CRUD
let currentEntity = null;
let currentItemId = null;
let currentPage = {
    clientes: 1,
    ativos: 1,
    servicos: 1,
    usuarios: 1,
    locais: 1,
    tiposervico: 1
};
const itemsPerPage = 10;

// Funções utilitárias
function clearForm(form) {
    if (form) {
        form.reset();
        const hiddenId = form.querySelector('input[type="hidden"]');
        if (hiddenId) hiddenId.value = '';
    }
}

function showNotification(elementId, message, isSuccess = true) {
    const element = document.getElementById(elementId);
    if (element) {
        element.textContent = message;
        element.className = isSuccess ? 'api-status success' : 'api-status error';
        setTimeout(() => {
            element.className = 'api-status';
        }, 5000);
    }
}

function getStatusBadgeClass(status) {
    switch(status) {
        case 'Concluído': return 'success';
        case 'Em Andamento': return 'primary';
        case 'Agendado': return 'info';
        case 'Cancelado': return 'danger';
        default: return 'secondary';
    }
}

async function apiRequest(url, options = {}) {
    const defaultOptions = {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authToken}`
        }
    };
    
    const mergedOptions = { ...defaultOptions, ...options };
    
    try {
        const response = await fetch(`${API_BASE_URL}${url}`, mergedOptions);
        
        if (response.status === 401) {
            // Token inválido ou expirado
            handleLogout();
            throw new Error('Sessão expirada. Faça login novamente.');
        }
        
        if (response.status === 403) {
            // Acesso negado - cargo insuficiente
            throw new Error('Acesso negado: seu cargo não tem permissão para esta ação.');
        }
        
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || `Erro na requisição: ${response.status} ${response.statusText}`);
        }
        
        return await response.json();
    } catch (error) {
        console.error('Erro na requisição API:', error);
        throw error;
    }
}

function confirmDelete() {
    if (currentEntity && currentItemId) {
        if (currentEntity === 'cliente') {
            deleteCliente(currentItemId);
        } else if (currentEntity === 'ativo') {
            deleteAtivo(currentItemId);
        } else if (currentEntity === 'servico') {
            deleteServico(currentItemId);
        } else if (currentEntity === 'usuario') {
            deleteUsuario(currentItemId);
        } else if (currentEntity === 'local') {
            deleteLocal(currentItemId);
        } else if (currentEntity === 'tipo-servico') {
            deleteTipoServico(currentItemId);
        }
    }
    bootstrap.Modal.getInstance(document.getElementById('confirmDeleteModal')).hide();
}

function askForDelete(entity, id) {
    currentEntity = entity;
    currentItemId = id;
    bootstrap.Modal.getOrCreateInstance(document.getElementById('confirmDeleteModal')).show();
}

function updatePagination(entity, totalItems, currentPage) {
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const paginationElement = document.getElementById(`${entity}-pagination`);
    
    if (!paginationElement) return;
    
    paginationElement.innerHTML = '';
    
    if (totalPages <= 1) return;
    
    // Botão anterior
    const prevLi = document.createElement('li');
    prevLi.className = `page-item ${currentPage === 1 ? 'disabled' : ''}`;
    prevLi.innerHTML = `<a class="page-link" href="#" onclick="changePage('${entity}', ${currentPage - 1})">Anterior</a>`;
    paginationElement.appendChild(prevLi);
    
    // Páginas
    for (let i = 1; i <= totalPages; i++) {
        const pageLi = document.createElement('li');
        pageLi.className = `page-item ${i === currentPage ? 'active' : ''}`;
        pageLi.innerHTML = `<a class="page-link" href="#" onclick="changePage('${entity}', ${i})">${i}</a>`;
        paginationElement.appendChild(pageLi);
    }
    
    // Botão próximo
    const nextLi = document.createElement('li');
    nextLi.className = `page-item ${currentPage === totalPages ? 'disabled' : ''}`;
    nextLi.innerHTML = `<a class="page-link" href="#" onclick="changePage('${entity}', ${currentPage + 1})">Próximo</a>`;
    paginationElement.appendChild(nextLi);
}

function changePage(entity, page) {
    currentPage[entity] = page;
    
    if (entity === 'clientes') {
        loadClientes(page);
    } else if (entity === 'ativos') {
        loadAtivos(page);
    } else if (entity === 'servicos') {
        loadServicos(page);
    } else if (entity === 'usuarios') {
        loadUsuarios(page);
    } else if (entity === 'locais') {
        loadLocais(page);
    } else if (entity === 'tipo-servico') {
        loadTiposServico(page);
    }
}