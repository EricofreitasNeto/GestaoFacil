/* CRUD - Clientes */

async function loadClientes(page = 1) {
  try {
    const clientes = await apiRequest('/v1/clientes');
    const clientesList = document.getElementById('clientes-list');
    clientesList.innerHTML = '';

    const startIndex = (page - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedClientes = clientes.slice(startIndex, endIndex);

    paginatedClientes.forEach(cliente => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${cliente.nome}</td>
        <td>${cliente.cnpj || '—'}</td>
        <td>${cliente.contatos || '—'}</td>
        <td class="table-actions text-end">
          <button class="btn btn-sm btn-info btn-action" onclick="viewCliente(${cliente.id})" title="Visualizar"><i class="bi bi-eye"></i></button>
          ${currentUser?.cargo === 'admin' ? `
            <button class="btn btn-sm btn-warning btn-action" onclick="editCliente(${cliente.id})" title="Editar"><i class="bi bi-pencil"></i></button>
            <button class="btn btn-sm btn-danger btn-action" onclick="askForDelete('cliente', ${cliente.id})" title="Remover"><i class="bi bi-trash"></i></button>
          ` : ''}
        </td>
      `;
      clientesList.appendChild(row);
    });

    updateClientDropdowns(clientes);
    updatePagination('clientes', clientes.length, page);
  } catch (error) {
    showNotification('clientes-status', `Erro ao carregar clientes: ${error.message}`, false);
  }
}

async function saveClient() {
  if (currentUser?.cargo !== 'admin') {
    showNotification('clientes-status', 'Apenas administradores podem criar ou editar clientes.', false);
    return;
  }

  const form = document.getElementById('client-form');
  const formData = new FormData(form);
  const payload = Object.fromEntries(formData.entries());
  const clientId = document.getElementById('client-id').value;

  // Se campo livre 'contatos' estiver vazio, monta a partir dos campos estruturados
  try {
    const nome = (document.getElementById('clientContactName')?.value || '').trim();
    const email = (document.getElementById('clientContactEmail')?.value || '').trim();
    const telefone = (document.getElementById('clientContactPhone')?.value || '').trim();
    const livre = (payload.contatos || '').trim();
    if (!livre && (nome || email || telefone)) {
      const partes = [];
      if (nome) partes.push(nome);
      if (email) partes.push(`<${email}>`);
      if (telefone) partes.push(`- ${telefone}`);
      payload.contatos = partes.join(' ').trim();
    }
  } catch (_) { /* ignora erros de leitura de campos */ }

  try {
    if (clientId) {
      const res = await apiRequest(`/v1/clientes/${clientId}`, {
        method: 'PUT',
        body: JSON.stringify(payload)
      });
      showNotification('clientes-status', res?.message || 'Cliente atualizado com sucesso!', true);
    } else {
      const res = await apiRequest('/v1/clientes', {
        method: 'POST',
        body: JSON.stringify(payload)
      });
      showNotification('clientes-status', res?.message || 'Cliente criado com sucesso!', true);
    }

    bootstrap.Modal.getInstance(document.getElementById('addClientModal'))?.hide();
    loadClientes(currentPage.clientes || 1);
  } catch (error) {
    handleApiError(error, 'clientes-status', [
      { key: 'nome', selector: '#clientName' },
      { key: 'cnpj', selector: '#clientCnpj' }
    ]);
  }
}

async function deleteCliente(id) {
  if (currentUser?.cargo !== 'admin') {
    showNotification('clientes-status', 'Apenas administradores podem remover clientes.', false);
    return;
  }

  try {
    const res = await apiRequest(`/v1/clientes/${id}`, { method: 'DELETE' });
    showNotification('clientes-status', res?.message || 'Cliente removido com sucesso!', true);
    loadClientes(currentPage.clientes || 1);
  } catch (error) {
    showNotification('clientes-status', `Erro ao remover cliente: ${error.message}`, false);
  }
}

async function searchClientes() {
  const searchTerm = document.getElementById('searchClient').value.toLowerCase();

  try {
    const clientes = await apiRequest('/v1/clientes');
    const filtered = clientes.filter(cliente =>
      cliente.nome.toLowerCase().includes(searchTerm) ||
      (cliente.cnpj && cliente.cnpj.toLowerCase().includes(searchTerm))
    );

    const clientesList = document.getElementById('clientes-list');
    clientesList.innerHTML = '';

    filtered.forEach(cliente => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${cliente.nome}</td>
        <td>${cliente.cnpj || '—'}</td>
        <td>${cliente.contatos || '—'}</td>
        <td class="table-actions text-end">
          <button class="btn btn-sm btn-info btn-action" onclick="viewCliente(${cliente.id})" title="Visualizar"><i class="bi bi-eye"></i></button>
          ${currentUser?.cargo === 'admin' ? `
            <button class="btn btn-sm btn-warning btn-action" onclick="editCliente(${cliente.id})" title="Editar"><i class="bi bi-pencil"></i></button>
            <button class="btn btn-sm btn-danger btn-action" onclick="askForDelete('cliente', ${cliente.id})" title="Remover"><i class="bi bi-trash"></i></button>
          ` : ''}
        </td>
      `;
      clientesList.appendChild(row);
    });

    updatePagination('clientes', filtered.length, 1);
  } catch (error) {
    showNotification('clientes-status', `Erro ao buscar clientes: ${error.message}`, false);
  }
}

async function viewCliente(id) {
  try {
    const cliente = await apiRequest(`/v1/clientes/${id}`);
    alert(`Cliente: ${cliente.nome}\nCNPJ: ${cliente.cnpj || '—'}\nContatos: ${cliente.contatos || '—'}`);
  } catch (error) {
    showNotification('clientes-status', `Erro ao carregar cliente: ${error.message}`, false);
  }
}

async function editCliente(id) {
  try {
    const cliente = await apiRequest(`/v1/clientes/${id}`);
    document.getElementById('client-id').value = cliente.id;
    document.getElementById('clientName').value = cliente.nome || '';
    document.getElementById('clientCnpj').value = cliente.cnpj || '';
    document.getElementById('clientContacts').value = cliente.contatos || '';
    // Limpa campos estruturados (não tentamos parsear string livre)
    const clear = id => { const el = document.getElementById(id); if (el) el.value = ''; };
    clear('clientContactName');
    clear('clientContactEmail');
    clear('clientContactPhone');

    bootstrap.Modal.getOrCreateInstance(document.getElementById('addClientModal')).show();
  } catch (error) {
    showNotification('clientes-status', `Erro ao editar cliente: ${error.message}`, false);
  }
}

window.loadClientes = loadClientes;
window.saveClient = saveClient;
window.deleteCliente = deleteCliente;
window.searchClientes = searchClientes;
window.viewCliente = viewCliente;
window.editCliente = editCliente;

// Limpa erros de campos ao digitar
document.getElementById('clientName')?.addEventListener('input', () => clearFieldError('#clientName'));
document.getElementById('clientCnpj')?.addEventListener('input', () => clearFieldError('#clientCnpj'));
