/* CRUD - Locais */

async function loadLocais(page = 1) {
  try {
    const locais = await apiRequest('/v1/locais');
    const locaisList = document.getElementById('locais-list');
    locaisList.innerHTML = '';

    const startIndex = (page - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedLocais = locais.slice(startIndex, endIndex);

    paginatedLocais.forEach(local => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${local.nome}</td>
        <td>${formatDate(local.createdAt)}</td>
        <td>${local.cliente?.nome || '-'}</td>
        <td>${local.cliente?.nome || '-'}</td>
        <td class="table-actions text-end">
          <button class="btn btn-sm btn-info btn-action" onclick="viewLocal(${local.id})" title="Visualizar">
            <i class="bi bi-eye"></i>
          </button>
          ${currentUser?.cargo === 'admin' ? `
            <button class="btn btn-sm btn-warning btn-action" onclick="editLocal(${local.id})" title="Editar">
              <i class="bi bi-pencil"></i>
            </button>
            <button class="btn btn-sm btn-danger btn-action" onclick="askForDelete('local', ${local.id})" title="Remover">
              <i class="bi bi-trash"></i>
            </button>
          ` : ''}
        </td>
      `;
      locaisList.appendChild(row);
    });

    updateLocalDropdown(locais);
    updatePagination('locais', locais.length, page);
  } catch (error) {
    showNotification('locais-status', `Erro ao carregar locais: ${error.message}`, false);
  }
}

async function saveLocal() {
  if (currentUser?.cargo !== 'admin') {
    showNotification('locais-status', 'Apenas administradores podem criar ou editar locais.', false);
    return;
  }

  const form = document.getElementById('local-form');
  const formData = new FormData(form);
  const localId = document.getElementById('local-id').value;
  const payload = {
    nome: formData.get('nome'),
    clienteId: formData.get('clienteId') ? Number(formData.get('clienteId')) : null
  };

  try {
    if (localId) {
      const res = await apiRequest(`/v1/locais/${localId}`, {
        method: 'PUT',
        body: JSON.stringify(payload)
      });
      showNotification('locais-status', res?.message || 'Local atualizado com sucesso!', true);
    } else {
      const res = await apiRequest('/v1/locais', {
        method: 'POST',
        body: JSON.stringify(payload)
      });
      showNotification('locais-status', res?.message || 'Local criado com sucesso!', true);
    }

    bootstrap.Modal.getInstance(document.getElementById('addLocalModal'))?.hide();
    await refreshAllDropdowns();
    loadLocais(currentPage.locais || 1);
  } catch (error) {
    showNotification('locais-status', `Erro ao salvar local: ${error.message}`, false);
  }
}

async function deleteLocal(id) {
  if (currentUser?.cargo !== 'admin') {
    showNotification('locais-status', 'Apenas administradores podem remover locais.', false);
    return;
  }

  try {
    const res = await apiRequest(`/v1/locais/${id}`, { method: 'DELETE' });
    showNotification('locais-status', res?.message || 'Local removido com sucesso!', true);
    loadLocais(currentPage.locais || 1);
  } catch (error) {
    showNotification('locais-status', `Erro ao remover local: ${error.message}`, false);
  }
}

async function searchLocais() {
  const term = document.getElementById('searchLocal').value.toLowerCase();

  try {
    const locais = await apiRequest('/v1/locais');
    const filtered = locais.filter(local =>
      local.nome.toLowerCase().includes(term)
    );

    const locaisList = document.getElementById('locais-list');
    locaisList.innerHTML = '';

    filtered.forEach(local => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${local.nome}</td>
        <td>${formatDate(local.createdAt)}</td>
        <td>${local.cliente?.nome || '-'}</td>
        <td class="table-actions text-end">
          <button class="btn btn-sm btn-info btn-action" onclick="viewLocal(${local.id})" title="Visualizar">
            <i class="bi bi-eye"></i>
          </button>
          ${currentUser?.cargo === 'admin' ? `
            <button class="btn btn-sm btn-warning btn-action" onclick="editLocal(${local.id})" title="Editar">
              <i class="bi bi-pencil"></i>
            </button>
            <button class="btn btn-sm btn-danger btn-action" onclick="askForDelete('local', ${local.id})" title="Remover">
              <i class="bi bi-trash"></i>
            </button>
          ` : ''}
        </td>
      `;
      locaisList.appendChild(row);
    });

    updatePagination('locais', filtered.length, 1);
  } catch (error) {
    showNotification('locais-status', `Erro ao buscar locais: ${error.message}`, false);
  }
}

async function viewLocal(id) {
  try {
    const local = await apiRequest(`/v1/locais/${id}`);
    alert(`Local: ${local.nome}\nCriado em: ${formatDate(local.createdAt)}\nCliente: ${local.cliente?.nome || '-'}`);
  } catch (error) {
    showNotification('locais-status', `Erro ao carregar local: ${error.message}`, false);
  }
}

async function editLocal(id) {
  try {
    const local = await apiRequest(`/v1/locais/${id}`);
    document.getElementById('local-id').value = local.id;
    document.getElementById('localNome').value = local.nome || '';
    const clienteSelect = document.getElementById('localCliente');
    if (clienteSelect) clienteSelect.value = local.clienteId || '';

    bootstrap.Modal.getOrCreateInstance(document.getElementById('addLocalModal')).show();
  } catch (error) {
    showNotification('locais-status', `Erro ao editar local: ${error.message}`, false);
  }
}

window.loadLocais = loadLocais;
window.saveLocal = saveLocal;
window.deleteLocal = deleteLocal;
window.searchLocais = searchLocais;
window.viewLocal = viewLocal;
window.editLocal = editLocal;


