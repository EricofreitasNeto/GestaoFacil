/* CRUD - Usuários */

const STATUS_META = {
  pending: { label: 'Pendente', badge: 'bg-warning text-dark' },
  approved: { label: 'Aprovado', badge: 'bg-success' },
  rejected: { label: 'Rejeitado', badge: 'bg-secondary' }
};

const formatUsuarioClientes = (usuario) => {
  if (Array.isArray(usuario?.clientes) && usuario.clientes.length) {
    return usuario.clientes.map((c) => c.nome).join(', ');
  }
  return '-';
};

const renderStatusBadge = (status) => {
  const normalized = String(status || '').toLowerCase();
  const meta = STATUS_META[normalized] || { label: 'Indefinido', badge: 'bg-secondary' };
  return `<span class="badge ${meta.badge}">${meta.label}</span>`;
};

async function loadUsuarios(page = 1) {
  if (currentUser?.cargo !== 'admin') {
    showNotification('usuarios-status', 'Apenas administradores podem visualizar usuários.', false);
    return;
  }

  try {
    const usuarios = await apiRequest('/v1/usuarios');
    const usuariosList = document.getElementById('usuarios-list');
    usuariosList.innerHTML = '';

    const startIndex = (page - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedUsuarios = usuarios.slice(startIndex, endIndex);

    paginatedUsuarios.forEach(usuario => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${usuario.nome}</td>
        <td>${usuario.email}</td>
        <td>${usuario.cargo}</td>
        <td>${formatUsuarioClientes(usuario)}</td>
        <td>${renderStatusBadge(usuario.status)}</td>
        <td>${usuario.telefone || '-'}</td>
        <td class="table-actions text-end">
          ${String(usuario.status || '').toLowerCase() === 'pending' ? `
            <button class="btn btn-sm btn-success btn-action" onclick="approveUsuario(${usuario.id})" title="Aprovar">
              <i class="bi bi-check2"></i>
            </button>
          ` : ''}
          <button class="btn btn-sm btn-info btn-action" onclick="viewUsuario(${usuario.id})" title="Visualizar">
            <i class="bi bi-eye"></i>
          </button>
          <button class="btn btn-sm btn-warning btn-action" onclick="editUsuario(${usuario.id})" title="Editar">
            <i class="bi bi-pencil"></i>
          </button>
          <button class="btn btn-sm btn-danger btn-action" onclick="askForDelete('usuario', ${usuario.id})" title="Remover">
            <i class="bi bi-trash"></i>
          </button>
        </td>
      `;
      usuariosList.appendChild(row);
    });

    updateUsuarioDropdown(usuarios);
    updatePagination('usuarios', usuarios.length, page);
  } catch (error) {
    showNotification('usuarios-status', `Erro ao carregar usuários: ${error.message}`, false);
  }
}

async function saveUsuario() {
  if (currentUser?.cargo !== 'admin') {
    showNotification('usuarios-status', 'Apenas administradores podem criar ou editar usuários.', false);
    return;
  }

  const form = document.getElementById('usuario-form');
  const formData = new FormData(form);
  const usuarioId = document.getElementById('usuario-id').value;

  const clienteOptions = document.getElementById('usuarioClientes');
  const clienteIds = clienteOptions
    ? Array.from(clienteOptions.selectedOptions)
        .map((opt) => Number(opt.value))
        .filter((value) => Number.isInteger(value))
    : [];

  const payload = {
    nome: formData.get('nome'),
    cargo: formData.get('cargo'),
    email: formData.get('email'),
    telefone: formData.get('telefone') || null,
    clienteIds
  };
  let statusValue = formData.get('status');
  if (!statusValue && !usuarioId) statusValue = 'approved';
  if (statusValue) payload.status = statusValue;

  if (!usuarioId && formData.get('password')) {
    payload.password = formData.get('password');
  }

  try {
    if (usuarioId) {
      const res = await apiRequest(`/v1/usuarios/${usuarioId}`, {
        method: 'PUT',
        body: JSON.stringify(payload)
      });
      showNotification('usuarios-status', res?.message || 'Usuário atualizado com sucesso!', true);
    } else {
      if (!payload.password) {
        showNotification('usuarios-status', 'Defina uma senha para o novo usuário.', false);
        return;
      }
      const res = await apiRequest('/v1/usuarios', {
        method: 'POST',
        body: JSON.stringify(payload)
      });
      showNotification('usuarios-status', res?.message || 'Usuário criado com sucesso!', true);
    }

    bootstrap.Modal.getInstance(document.getElementById('addUsuarioModal'))?.hide();
    await refreshAllDropdowns();
    loadUsuarios(currentPage.usuarios || 1);
  } catch (error) {
    showNotification('usuarios-status', `Erro ao salvar usuário: ${error.message}`, false);
  }
}

async function deleteUsuario(id) {
  if (currentUser?.cargo !== 'admin') {
    showNotification('usuarios-status', 'Apenas administradores podem remover usuários.', false);
    return;
  }

  try {
    const res = await apiRequest(`/v1/usuarios/${id}`, { method: 'DELETE' });
    showNotification('usuarios-status', res?.message || 'Usuário removido com sucesso!', true);
    loadUsuarios(currentPage.usuarios || 1);
  } catch (error) {
    showNotification('usuarios-status', `Erro ao remover usuário: ${error.message}`, false);
  }
}

async function searchUsuarios() {
  const term = document.getElementById('searchUsuario').value.toLowerCase();

  try {
    const usuarios = await apiRequest('/v1/usuarios');
    const filtered = usuarios.filter(usuario =>
      usuario.nome.toLowerCase().includes(term) ||
      usuario.email.toLowerCase().includes(term) ||
      usuario.cargo.toLowerCase().includes(term) ||
      (usuario.status && usuario.status.toLowerCase().includes(term))
    );

    const usuariosList = document.getElementById('usuarios-list');
    usuariosList.innerHTML = '';

    filtered.forEach(usuario => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${usuario.nome}</td>
        <td>${usuario.email}</td>
        <td>${usuario.cargo}</td>
        <td>${formatUsuarioClientes(usuario)}</td>
        <td>${renderStatusBadge(usuario.status)}</td>
        <td>${usuario.telefone || '-'}</td>
        <td class="table-actions text-end">
          ${String(usuario.status || '').toLowerCase() === 'pending' ? `
            <button class="btn btn-sm btn-success btn-action" onclick="approveUsuario(${usuario.id})" title="Aprovar">
              <i class="bi bi-check2"></i>
            </button>
          ` : ''}
          <button class="btn btn-sm btn-info btn-action" onclick="viewUsuario(${usuario.id})" title="Visualizar">
            <i class="bi bi-eye"></i>
          </button>
          <button class="btn btn-sm btn-warning btn-action" onclick="editUsuario(${usuario.id})" title="Editar">
            <i class="bi bi-pencil"></i>
          </button>
          <button class="btn btn-sm btn-danger btn-action" onclick="askForDelete('usuario', ${usuario.id})" title="Remover">
            <i class="bi bi-trash"></i>
          </button>
        </td>
      `;
      usuariosList.appendChild(row);
    });

    updatePagination('usuarios', filtered.length, 1);
  } catch (error) {
    showNotification('usuarios-status', `Erro ao buscar usuários: ${error.message}`, false);
  }
}

async function viewUsuario(id) {
  try {
    const usuario = await apiRequest(`/v1/usuarios/${id}`);
    alert(`Usuário: ${usuario.nome}
E-mail: ${usuario.email}
Cargo: ${usuario.cargo}
Status: ${STATUS_META[usuario.status]?.label || usuario.status || 'Indefinido'}
Clientes: ${formatUsuarioClientes(usuario)}
Telefone: ${usuario.telefone || '-'}`);
  } catch (error) {
    showNotification('usuarios-status', `Erro ao carregar usuário: ${error.message}`, false);
  }
}

async function editUsuario(id) {
  try {
    const usuario = await apiRequest(`/v1/usuarios/${id}`);
    document.getElementById('usuario-id').value = usuario.id;
    document.getElementById('usuarioNome').value = usuario.nome || '';
    document.getElementById('usuarioEmail').value = usuario.email || '';
    document.getElementById('usuarioCargo').value = usuario.cargo || '';
    const statusSelect = document.getElementById('usuarioStatus');
    if (statusSelect) statusSelect.value = (usuario.status || 'approved');
    const clienteSelect = document.getElementById('usuarioClientes');
    if (clienteSelect) {
      const ids = Array.isArray(usuario.clienteIds)
        ? usuario.clienteIds
        : (Array.isArray(usuario.clientes) ? usuario.clientes.map((c) => c.id) : []);
      Array.from(clienteSelect.options).forEach((option) => {
        option.selected = ids.includes(Number(option.value));
      });
    }
    document.getElementById('usuarioTelefone').value = usuario.telefone || '';
    document.getElementById('usuarioPassword').value = '';

    bootstrap.Modal.getOrCreateInstance(document.getElementById('addUsuarioModal')).show();
  } catch (error) {
    showNotification('usuarios-status', `Erro ao editar usuário: ${error.message}`, false);
  }
}

async function approveUsuario(id) {
  try {
    await apiRequest(`/v1/usuarios/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ status: 'approved' })
    });
    showNotification('usuarios-status', 'Usuário aprovado com sucesso!', true);
    await refreshAllDropdowns();
    loadUsuarios(currentPage.usuarios || 1);
  } catch (error) {
    showNotification('usuarios-status', `Erro ao aprovar usuário: ${error.message}`, false);
  }
}

window.loadUsuarios = loadUsuarios;
window.saveUsuario = saveUsuario;
window.deleteUsuario = deleteUsuario;
window.searchUsuarios = searchUsuarios;
window.viewUsuario = viewUsuario;
window.editUsuario = editUsuario;
window.approveUsuario = approveUsuario;
