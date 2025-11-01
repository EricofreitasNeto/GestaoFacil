/* CRUD - Tipos de Serviços */

async function loadTiposServicos(page = 1) {
  try {
    const tipos = await apiRequest('/v1/tipos-servicos');
    const tiposList = document.getElementById('tipos-servicos-list');
    tiposList.innerHTML = '';

    const startIndex = (page - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedTipos = tipos.slice(startIndex, endIndex);

    paginatedTipos.forEach(tipo => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${tipo.nome}</td>
        <td>${tipo.descricao || '—'}</td>
        <td><span class="badge ${tipo.ativo ? 'bg-success' : 'bg-secondary'}">
          ${tipo.ativo ? 'Ativo' : 'Inativo'}
        </span></td>
        <td class="table-actions text-end">
          <button class="btn btn-sm btn-info btn-action" onclick="viewTipoServico(${tipo.id})" title="Visualizar">
            <i class="bi bi-eye"></i>
          </button>
          ${currentUser?.cargo === 'admin' ? `
            <button class="btn btn-sm btn-warning btn-action" onclick="editTipoServico(${tipo.id})" title="Editar">
              <i class="bi bi-pencil"></i>
            </button>
            <button class="btn btn-sm btn-danger btn-action" onclick="askForDelete('tipo-servico', ${tipo.id})" title="Remover">
              <i class="bi bi-trash"></i>
            </button>
          ` : ''}
        </td>
      `;
      tiposList.appendChild(row);
    });

    updateTipoServicoDropdown(tipos);
    updatePagination('tipos-servicos', tipos.length, page);
  } catch (error) {
    showNotification('tipos-servicos-status', `Erro ao carregar tipos de serviço: ${error.message}`, false);
  }
}

async function saveTipoServico() {
  if (currentUser?.cargo !== 'admin') {
    showNotification('tipos-servicos-status', 'Apenas administradores podem criar ou editar tipos de serviço.', false);
    return;
  }

  const form = document.getElementById('tipo-servico-form');
  const formData = new FormData(form);
  const tipoId = document.getElementById('tipo-servico-id').value;

  const payload = {
    nome: formData.get('nome'),
    descricao: formData.get('descricao') || null,
    ativo: formData.get('ativo') === 'on'
  };

  try {
    if (tipoId) {
      const res = await apiRequest(`/v1/tipos-servicos/${tipoId}`, {
        method: 'PUT',
        body: JSON.stringify(payload)
      });
      showNotification('tipos-servicos-status', res?.message || 'Tipo de serviço atualizado com sucesso!', true);
    } else {
      const res = await apiRequest('/v1/tipos-servicos', {
        method: 'POST',
        body: JSON.stringify(payload)
      });
      showNotification('tipos-servicos-status', res?.message || 'Tipo de serviço criado com sucesso!', true);
    }

    bootstrap.Modal.getInstance(document.getElementById('addTipoServicoModal'))?.hide();
    await refreshAllDropdowns();
    loadTiposServicos(currentPage.tiposServicos || 1);
  } catch (error) {
    showNotification('tipos-servicos-status', `Erro ao salvar tipo de serviço: ${error.message}`, false);
  }
}

async function deleteTipoServico(id) {
  if (currentUser?.cargo !== 'admin') {
    showNotification('tipos-servicos-status', 'Apenas administradores podem remover tipos de serviço.', false);
    return;
  }

  try {
    const res = await apiRequest(`/v1/tipos-servicos/${id}`, { method: 'DELETE' });
    showNotification('tipos-servicos-status', res?.message || 'Tipo de serviço removido com sucesso!', true);
    loadTiposServicos(currentPage.tiposServicos || 1);
  } catch (error) {
    showNotification('tipos-servicos-status', `Erro ao remover tipo de serviço: ${error.message}`, false);
  }
}

async function searchTiposServicos() {
  const term = document.getElementById('searchTipoServico').value.toLowerCase();

  try {
    const tipos = await apiRequest('/v1/tipos-servicos');
    const filtered = tipos.filter(tipo =>
      tipo.nome.toLowerCase().includes(term) ||
      (tipo.descricao && tipo.descricao.toLowerCase().includes(term))
    );

    const tiposList = document.getElementById('tipos-servicos-list');
    tiposList.innerHTML = '';

    filtered.forEach(tipo => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${tipo.nome}</td>
        <td>${tipo.descricao || '—'}</td>
        <td><span class="badge ${tipo.ativo ? 'bg-success' : 'bg-secondary'}">
          ${tipo.ativo ? 'Ativo' : 'Inativo'}
        </span></td>
        <td class="table-actions text-end">
          <button class="btn btn-sm btn-info btn-action" onclick="viewTipoServico(${tipo.id})" title="Visualizar">
            <i class="bi bi-eye"></i>
          </button>
          ${currentUser?.cargo === 'admin' ? `
            <button class="btn btn-sm btn-warning btn-action" onclick="editTipoServico(${tipo.id})" title="Editar">
              <i class="bi bi-pencil"></i>
            </button>
            <button class="btn btn-sm btn-danger btn-action" onclick="askForDelete('tipo-servico', ${tipo.id})" title="Remover">
              <i class="bi bi-trash"></i>
            </button>
          ` : ''}
        </td>
      `;
      tiposList.appendChild(row);
    });

    updatePagination('tipos-servicos', filtered.length, 1);
  } catch (error) {
    showNotification('tipos-servicos-status', `Erro ao buscar tipos de serviço: ${error.message}`, false);
  }
}

async function viewTipoServico(id) {
  try {
    const tipo = await apiRequest(`/v1/tipos-servicos/${id}`);
    alert(`Tipo de serviço: ${tipo.nome}
Descrição: ${tipo.descricao || '—'}
Status: ${tipo.ativo ? 'Ativo' : 'Inativo'}`);
  } catch (error) {
    showNotification('tipos-servicos-status', `Erro ao carregar tipo de serviço: ${error.message}`, false);
  }
}

async function editTipoServico(id) {
  try {
    const tipo = await apiRequest(`/v1/tipos-servicos/${id}`);
    document.getElementById('tipo-servico-id').value = tipo.id;
    document.getElementById('tipoServicoNome').value = tipo.nome || '';
    document.getElementById('tipoServicoDescricao').value = tipo.descricao || '';
    document.getElementById('tipoServicoAtivo').checked = Boolean(tipo.ativo);

    bootstrap.Modal.getOrCreateInstance(document.getElementById('addTipoServicoModal')).show();
  } catch (error) {
    showNotification('tipos-servicos-status', `Erro ao editar tipo de serviço: ${error.message}`, false);
  }
}

window.loadTiposServicos = loadTiposServicos;
window.saveTipoServico = saveTipoServico;
window.deleteTipoServico = deleteTipoServico;
window.searchTiposServicos = searchTiposServicos;
window.viewTipoServico = viewTipoServico;
window.editTipoServico = editTipoServico;
