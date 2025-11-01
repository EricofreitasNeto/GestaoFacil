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

  // Monta 'detalhes' de forma amigável: usa JSON avançado se preenchido; caso contrário, usa campos estruturados
  let detalhes = null;
  const detalhesValue = (formData.get('detalhes') || '').trim();
  if (detalhesValue) {
    try {
      detalhes = parseJsonField(detalhesValue);
    } catch (error) {
      showNotification('ativos-status', error.message, false);
      return;
    }
  } else {
    const det = {};
    const fabricante = (document.getElementById('ativoFabricante')?.value || '').trim();
    const modelo = (document.getElementById('ativoModelo')?.value || '').trim();
    const patrimonio = (document.getElementById('ativoPatrimonio')?.value || '').trim();
    const garantia = (document.getElementById('ativoGarantia')?.value || '').trim();
    const observacoes = (document.getElementById('ativoObservacoes')?.value || '').trim();
    if (fabricante) det.fabricante = fabricante;
    if (modelo) det.modelo = modelo;
    if (patrimonio) det.patrimonio = patrimonio;
    if (garantia) det.garantia = garantia; // ISO yyyy-mm-dd
    if (observacoes) det.observacoes = observacoes;
    detalhes = Object.keys(det).length ? det : null;
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
      const res = await apiRequest(`/v1/ativos/${ativoId}`, {
        method: 'PUT',
        body: JSON.stringify(payload)
      });
      showNotification('ativos-status', res?.message || 'Ativo atualizado com sucesso!', true);
    } else {
      const res = await apiRequest('/v1/ativos', {
        method: 'POST',
        body: JSON.stringify(payload)
      });
      showNotification('ativos-status', res?.message || 'Ativo criado com sucesso!', true);
    }

    bootstrap.Modal.getInstance(document.getElementById('addAtivoModal'))?.hide();
    loadAtivos(currentPage.ativos || 1);
  } catch (error) {
    handleApiError(error, 'ativos-status', [
      { key: 'série', selector: '#ativoNumeroSerie' },
      { key: 'serie', selector: '#ativoNumeroSerie' },
      { key: 'numeroserie', selector: '#ativoNumeroSerie' }
    ]);
  }
}

async function deleteAtivo(id) {
  if (currentUser?.cargo !== 'admin') {
    showNotification('ativos-status', 'Apenas administradores podem remover ativos.', false);
    return;
  }

  try {
    const res = await apiRequest(`/v1/ativos/${id}`, { method: 'DELETE' });
    showNotification('ativos-status', res?.message || 'Ativo removido com sucesso!', true);
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
    // Preenche campos estruturados
    const d = ativo.detalhes || {};
    const set = (id, val) => { const el = document.getElementById(id); if (el) el.value = val || ''; };
    set('ativoFabricante', d.fabricante || '');
    set('ativoModelo', d.modelo || '');
    set('ativoPatrimonio', d.patrimonio || '');
    set('ativoGarantia', d.garantia || '');
    set('ativoObservacoes', d.observacoes || '');
    // Mantém JSON avançado disponível
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

// Limpa erro do número de série ao digitar
document.getElementById('ativoNumeroSerie')?.addEventListener('input', () => clearFieldError('#ativoNumeroSerie'));

// Correção: evita recursão e padroniza mapeamento localmente
// Esta definição final substitui quaisquer anteriores e não chama window.getStatusBadgeClass.
window.getStatusBadgeClass = function (status) {
  try {
    var s = String(status || '')
      .normalize('NFD')
      .replace(/\p{Diacritic}/gu, '')
      .toLowerCase()
      .trim();
  } catch (e) {
    var s = (status || '').toString().toLowerCase().trim();
  }
  switch (s) {
    case 'concluido':
    case 'ativo':
      return 'success';
    case 'em andamento':
      return 'primary';
    case 'agendado':
      return 'info';
    case 'manutencao':
      return 'warning';
    case 'cancelado':
    case 'inativo':
      return 'danger';
    default:
      return 'secondary';
  }
};
