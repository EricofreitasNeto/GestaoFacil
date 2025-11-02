/* CRUD - Serviços */

async function loadServicos(page = 1) {
  try {
    const servicos = await apiRequest('/v1/servicos');
    const servicosList = document.getElementById('servicos-list');
    servicosList.innerHTML = '';

    const startIndex = (page - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedServicos = servicos.slice(startIndex, endIndex);

    paginatedServicos.forEach(servico => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${servico.descricao}</td>
        <td><span class="badge bg-${getStatusBadgeClass(servico.status)}">${servico.status}</span></td>
        <td>${servico.cliente?.nome || '—'}</td>
        <td>${servico.responsavel?.nome || '—'}</td>
        <td>${formatDate(servico.dataAgendada)}</td>
        <td class="table-actions text-end">
          <button class="btn btn-sm btn-info btn-action" onclick="viewServico(${servico.id})" title="Visualizar">
            <i class="bi bi-eye"></i>
          </button>
          ${currentUser?.cargo === 'admin' ? `
            <button class="btn btn-sm btn-warning btn-action" onclick="editServico(${servico.id})" title="Editar">
              <i class="bi bi-pencil"></i>
            </button>
            <button class="btn btn-sm btn-danger btn-action" onclick="askForDelete('servico', ${servico.id})" title="Remover">
              <i class="bi bi-trash"></i>
            </button>
          ` : ''}
        </td>
      `;
      servicosList.appendChild(row);
    });

    updatePagination('servicos', servicos.length, page);
  } catch (error) {
    showNotification('servicos-status', `Erro ao carregar serviços: ${error.message}`, false);
  }
}

async function saveServico() {
  if (currentUser?.cargo !== 'admin') {
    showNotification('servicos-status', 'Apenas administradores podem criar ou editar serviços.', false);
    return;
  }

  const form = document.getElementById('servico-form');
  const formData = new FormData(form);
  const servicoId = document.getElementById('servico-id').value;

  // Monta 'detalhes': usa JSON avançado se preenchido; caso contrário, usa campos estruturados amigáveis
  let detalhes = null;
  const detalhesValue = (formData.get('detalhes') || '').trim();
  if (detalhesValue) {
    try {
      detalhes = parseJsonField(detalhesValue);
    } catch (error) {
      showNotification('servicos-status', error.message, false);
      return;
    }
  } else {
    const det = {};
    const prioridade = (document.getElementById('servicoPrioridade')?.value || '').trim();
    const custoStr = (document.getElementById('servicoCusto')?.value || '').trim();
    const tempoStr = (document.getElementById('servicoTempoEstimado')?.value || '').trim();
    const materiais = (document.getElementById('servicoMateriais')?.value || '').trim();
    const observacoes = (document.getElementById('servicoObservacoes')?.value || '').trim();
    if (prioridade) det.prioridade = prioridade;
    if (custoStr) det.custoEstimado = Number(custoStr.replace(',', '.'));
    if (tempoStr) det.tempoEstimadoHoras = Number(tempoStr.replace(',', '.'));
    if (materiais) det.materiais = materiais;
    if (observacoes) det.observacoes = observacoes;
    detalhes = Object.keys(det).length ? det : null;
  }

  const payload = {
    descricao: formData.get('descricao'),
    status: formData.get('status'),
    dataAgendada: formData.get('dataAgendada') || null,
    dataConclusao: formData.get('dataConclusao') || null,
    clienteId: formData.get('clienteId') ? Number(formData.get('clienteId')) : null,
    usuarioId: formData.get('usuarioId') ? Number(formData.get('usuarioId')) : null,
    ativoId: formData.get('ativoId') ? Number(formData.get('ativoId')) : null,
    tipoServicoId: formData.get('tipoServicoId') ? Number(formData.get('tipoServicoId')) : null,
    detalhes
  };

  try {
    if (servicoId) {
      const res = await apiRequest(`/v1/servicos/${servicoId}`, {
        method: 'PUT',
        body: JSON.stringify(payload)
      });
      showNotification('servicos-status', res?.message || 'Serviço atualizado com sucesso!', true);
    } else {
      const res = await apiRequest('/v1/servicos', {
        method: 'POST',
        body: JSON.stringify(payload)
      });
      showNotification('servicos-status', res?.message || 'Serviço criado com sucesso!', true);
    }

    bootstrap.Modal.getInstance(document.getElementById('addServicoModal'))?.hide();
    await refreshAllDropdowns();
    loadServicos(currentPage.servicos || 1);
  } catch (error) {
handleApiError(error, 'servicos-status', [ { key: 'ativo', selector: '#servicoAtivo' } ]);

  }
}

async function deleteServico(id) {
  if (currentUser?.cargo !== 'admin') {
    showNotification('servicos-status', 'Apenas administradores podem remover serviços.', false);
    return;
  }

  try {
    const res = await apiRequest(`/v1/servicos/${id}`, { method: 'DELETE' });
    showNotification('servicos-status', res?.message || 'Serviço removido com sucesso!', true);
    loadServicos(currentPage.servicos || 1);
  } catch (error) {
    if (error?.status === 400) {
      showNotification('servicos-status', 'Nao e permitido excluir servico enquanto o ativo nao estiver desativado. Altere o status do ativo para "inativo" ou reatribua o servico.', false);
    } else {
    showNotification('servicos-status', `Erro ao remover servi�o: ${error.message}`, false);
    }
  }
}

async function searchServicos() {
  const term = document.getElementById('searchServico').value.toLowerCase();

  try {
    const servicos = await apiRequest('/v1/servicos');
    const filtered = servicos.filter(servico => {
      const descricaoMatch = servico.descricao.toLowerCase().includes(term);
      const statusMatch = servico.status.toLowerCase().includes(term);
      const clienteMatch = servico.cliente?.nome?.toLowerCase().includes(term);
      const responsavelMatch = servico.responsavel?.nome?.toLowerCase().includes(term);
      return descricaoMatch || statusMatch || clienteMatch || responsavelMatch;
    });

    const servicosList = document.getElementById('servicos-list');
    servicosList.innerHTML = '';

    filtered.forEach(servico => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${servico.descricao}</td>
        <td><span class="badge bg-${getStatusBadgeClass(servico.status)}">${servico.status}</span></td>
        <td>${servico.cliente?.nome || '—'}</td>
        <td>${servico.responsavel?.nome || '—'}</td>
        <td>${formatDate(servico.dataAgendada)}</td>
        <td class="table-actions text-end">
          <button class="btn btn-sm btn-info btn-action" onclick="viewServico(${servico.id})" title="Visualizar">
            <i class="bi bi-eye"></i>
          </button>
          ${currentUser?.cargo === 'admin' ? `
            <button class="btn btn-sm btn-warning btn-action" onclick="editServico(${servico.id})" title="Editar">
              <i class="bi bi-pencil"></i>
            </button>
            <button class="btn btn-sm btn-danger btn-action" onclick="askForDelete('servico', ${servico.id})" title="Remover">
              <i class="bi bi-trash"></i>
            </button>
          ` : ''}
        </td>
      `;
      servicosList.appendChild(row);
    });

    updatePagination('servicos', filtered.length, 1);
  } catch (error) {
    showNotification('servicos-status', `Erro ao buscar serviços: ${error.message}`, false);
  }
}

async function viewServico(id) {
  try {
    const servico = await apiRequest(`/v1/servicos/${id}`);
    const detalhes = servico.detalhes ? JSON.stringify(servico.detalhes, null, 2) : '—';
    alert(`Serviço: ${servico.descricao}
Status: ${servico.status}
Cliente: ${servico.cliente?.nome || '—'}
Responsável: ${servico.responsavel?.nome || '—'}
Ativo: ${servico.ativo?.nome || '—'}
Tipo: ${servico.tipoServico?.nome || '—'}
Detalhes: ${detalhes}`);
  } catch (error) {
    showNotification('servicos-status', `Erro ao carregar serviço: ${error.message}`, false);
  }
}

async function editServico(id) {
  try {
    const servico = await apiRequest(`/v1/servicos/${id}`);
    document.getElementById('servico-id').value = servico.id;
    document.getElementById('servicoDescricao').value = servico.descricao || '';
    document.getElementById('servicoStatus').value = servico.status || 'Pendente';
    document.getElementById('servicoDataAgendada').value = servico.dataAgendada ? servico.dataAgendada.substring(0, 10) : '';
    document.getElementById('servicoDataConclusao').value = servico.dataConclusao ? servico.dataConclusao.substring(0, 10) : '';
    document.getElementById('servicoCliente').value = servico.clienteId || '';
    document.getElementById('servicoUsuario').value = servico.usuarioId || '';
    document.getElementById('servicoAtivo').value = servico.ativoId || '';
    document.getElementById('servicoTipo').value = servico.tipoServicoId || '';
    // Preenche campos estruturados a partir de detalhes
    const d = servico.detalhes || {};
    const set = (id, val) => { const el = document.getElementById(id); if (el) el.value = val ?? ''; };
    set('servicoPrioridade', d.prioridade || '');
    set('servicoCusto', d.custoEstimado != null ? String(d.custoEstimado) : '');
    set('servicoTempoEstimado', d.tempoEstimadoHoras != null ? String(d.tempoEstimadoHoras) : '');
    set('servicoMateriais', d.materiais || '');
    set('servicoObservacoes', d.observacoes || '');
    // Mantém JSON avançado disponível
    document.getElementById('servicoDetalhes').value = servico.detalhes ? JSON.stringify(servico.detalhes, null, 2) : '';

    bootstrap.Modal.getOrCreateInstance(document.getElementById('addServicoModal')).show();
  } catch (error) {
    showNotification('servicos-status', `Erro ao editar serviço: ${error.message}`, false);
  }
}

window.loadServicos = loadServicos;
window.saveServico = saveServico;
window.deleteServico = deleteServico;
window.searchServicos = searchServicos;
window.viewServico = viewServico;
window.editServico = editServico;

// Limpa erro do select de ativo ao alterar
document.getElementById('servicoAtivo')?.addEventListener('change', () => clearFieldError('#servicoAtivo'));

