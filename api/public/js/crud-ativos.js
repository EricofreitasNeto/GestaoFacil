/* CRUD - Ativos */

async function loadAtivos(page = 1) {
  try {
    const [ativos, locais] = await Promise.all([
      apiRequest('/v1/ativos'),
      apiRequest('/v1/locais')
    ]);

    const ativosList = document.getElementById('ativos-list');
    ativosList.innerHTML = '';

    const startIndex = (page - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedAtivos = ativos.slice(startIndex, endIndex);

    paginatedAtivos.forEach(ativo => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${ativo.nome}</td>
        <td>${ativo.numeroSerie || '—'}</td>
        <td><span class="badge bg-${getStatusBadgeClass(ativo.status)}">${ativo.status}</span></td>
        <td>${ativo.local?.nome || '—'}</td>
        <td class="table-actions text-end">
          <button class="btn btn-sm btn-info btn-action" onclick="viewAtivo(${ativo.id})" title="Visualizar"><i class="bi bi-eye"></i></button>
          ${currentUser?.cargo === 'admin' ? `
            <button class="btn btn-sm btn-warning btn-action" onclick="editAtivo(${ativo.id})" title="Editar"><i class="bi bi-pencil"></i></button>
            <button class="btn btn-sm btn-danger btn-action" onclick="askForDelete('ativo', ${ativo.id})" title="Remover"><i class="bi bi-trash"></i></button>
          ` : ''}
        </td>
      `;
      ativosList.appendChild(row);
    });

    updateAtivoDropdown(ativos);
    updateLocalDropdown(locais);
    updatePagination('ativos', ativos.length, page);
  } catch (error) {
    showNotification('ativos-status', `Erro ao carregar ativos: ${error.message}`, false);
  }
}

function getStatusBadgeClass(status) {
  switch ((status || '').toLowerCase()) {
    case 'concluído':
    case 'concluido':
    case 'ativo':
      return 'success';
    case 'em andamento':
    case 'manutencao':
    case 'manutenção':
      return 'warning';
    case 'cancelado':
    case 'inativo':
      return 'danger';
    default:
      return 'secondary';
  }
}

async function saveAtivo() {
  if (currentUser?.cargo !== 'admin') {
    showNotification('ativos-status', 'Apenas administradores podem criar ou editar ativos.', false);
    return;
  }

  const form = document.getElementById('ativo-form');
  const formData = new FormData(form);
  const ativoId = document.getElementById('ativo-id').value;

  let detalhes = null;
  const detalhesValue = formData.get('detalhes');
  if (detalhesValue) {
    try {
      detalhes = parseJsonField(detalhesValue);
    } catch (error) {
      showNotification('ativos-status', error.message, false);
      return;
    }
  }

  const payload = {
    nome: formData.get('nome'),
    numeroSerie: formData.get('numeroSerie') || null,
    status: formData.get('status'),
    localId: formData.get('localId') ? Number(formData.get('localId')) : null,
    detalhes
  };

  try {
    if (ativoId) {
      await apiRequest(`/v1/ativos/${ativoId}`, {
        method: 'PUT',
        body: JSON.stringify(payload)
      });
      showNotification('ativos-status', 'Ativo atualizado com sucesso!', true);
    } else {
      await apiRequest('/v1/ativos', {
        method: 'POST',
        body: JSON.stringify(payload)
      });
      showNotification('ativos-status', 'Ativo criado com sucesso!', true);
    }

    bootstrap.Modal.getInstance(document.getElementById('addAtivoModal'))?.hide();
    loadAtivos(currentPage.ativos || 1);
  } catch (error) {
    showNotification('ativos-status', `Erro ao salvar ativo: ${error.message}`, false);
  }
}

async function deleteAtivo(id) {
  if (currentUser?.cargo !== 'admin') {
    showNotification('ativos-status', 'Apenas administradores podem remover ativos.', false);
    return;
  }

  try {
    await apiRequest(`/v1/ativos/${id}`, { method: 'DELETE' });
    showNotification('ativos-status', 'Ativo removido com sucesso!', true);
    loadAtivos(currentPage.ativos || 1);
  } catch (error) {
    showNotification('ativos-status', `Erro ao remover ativo: ${error.message}`, false);
  }
}

async function searchAtivos() {
  const term = document.getElementById('searchAtivo').value.toLowerCase();

  try {
    const ativos = await apiRequest('/v1/ativos');
    const filtered = ativos.filter(ativo =>
      ativo.nome.toLowerCase().includes(term) ||
      (ativo.numeroSerie && ativo.numeroSerie.toLowerCase().includes(term)) ||
      (ativo.status && ativo.status.toLowerCase().includes(term))
    );

    const ativosList = document.getElementById('ativos-list');
    ativosList.innerHTML = '';

    filtered.forEach(ativo => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${ativo.nome}</td>
        <td>${ativo.numeroSerie || '—'}</td>
        <td><span class="badge bg-${getStatusBadgeClass(ativo.status)}">${ativo.status}</span></td>
        <td>${ativo.local?.nome || '—'}</td>
        <td class="table-actions text-end">
          <button class="btn btn-sm btn-info btn-action" onclick="viewAtivo(${ativo.id})" title="Visualizar"><i class="bi bi-eye"></i></button>
          ${currentUser?.cargo === 'admin' ? `
            <button class="btn btn-sm btn-warning btn-action" onclick="editAtivo(${ativo.id})" title="Editar"><i class="bi bi-pencil"></i></button>
            <button class="btn btn-sm btn-danger btn-action" onclick="askForDelete('ativo', ${ativo.id})" title="Remover"><i class="bi bi-trash"></i></button>
          ` : ''}
        </td>
      `;
      ativosList.appendChild(row);
    });

    updatePagination('ativos', filtered.length, 1);
  } catch (error) {
    showNotification('ativos-status', `Erro ao buscar ativos: ${error.message}`, false);
  }
}

async function viewAtivo(id) {
  try {
    const ativo = await apiRequest(`/v1/ativos/${id}`);
    const detalhes = ativo.detalhes ? JSON.stringify(ativo.detalhes, null, 2) : '—';
    alert(`Ativo: ${ativo.nome}\nNúmero de série: ${ativo.numeroSerie || '—'}\nStatus: ${ativo.status}\nLocal: ${ativo.local?.nome || '—'}\nDetalhes: ${detalhes}`);
  } catch (error) {
    showNotification('ativos-status', `Erro ao carregar ativo: ${error.message}`, false);
  }
}

async function editAtivo(id) {
  try {
    const ativo = await apiRequest(`/v1/ativos/${id}`);
    document.getElementById('ativo-id').value = ativo.id;
    document.getElementById('ativoNome').value = ativo.nome || '';
    document.getElementById('ativoNumeroSerie').value = ativo.numeroSerie || '';
    document.getElementById('ativoStatus').value = ativo.status || 'ativo';
    document.getElementById('ativoLocal').value = ativo.localId || '';
    document.getElementById('ativoDetalhes').value = ativo.detalhes ? JSON.stringify(ativo.detalhes, null, 2) : '';

    bootstrap.Modal.getOrCreateInstance(document.getElementById('addAtivoModal')).show();
  } catch (error) {
    showNotification('ativos-status', `Erro ao editar ativo: ${error.message}`, false);
  }
}

window.loadAtivos = loadAtivos;
window.saveAtivo = saveAtivo;
window.deleteAtivo = deleteAtivo;
window.searchAtivos = searchAtivos;
window.viewAtivo = viewAtivo;
window.editAtivo = editAtivo;
