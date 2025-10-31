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

  try {
    if (clientId) {
      await apiRequest(`/v1/clientes/${clientId}`, {
        method: 'PUT',
        body: JSON.stringify(payload)
      });
      showNotification('clientes-status', 'Cliente atualizado com sucesso!', true);
    } else {
      await apiRequest('/v1/clientes', {
        method: 'POST',
        body: JSON.stringify(payload)
      });
      showNotification('clientes-status', 'Cliente criado com sucesso!', true);
    }

    bootstrap.Modal.getInstance(document.getElementById('addClientModal'))?.hide();
    loadClientes(currentPage.clientes || 1);
  } catch (error) {
    showNotification('clientes-status', `Erro ao salvar cliente: ${error.message}`, false);
  }
}

async function deleteCliente(id) {
  if (currentUser?.cargo !== 'admin') {
    showNotification('clientes-status', 'Apenas administradores podem remover clientes.', false);
    return;
  }

  try {
    await apiRequest(`/v1/clientes/${id}`, { method: 'DELETE' });
    showNotification('clientes-status', 'Cliente removido com sucesso!', true);
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
