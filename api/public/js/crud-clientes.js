/* CRUD - Clientes */

async function loadClientes(page = 1) {
            try {
                const clientes = await apiRequest('/v1/clientes');
                const clientesList = document.getElementById('clientes-list');
                clientesList.innerHTML = '';
                
                // Paginação
                const startIndex = (page - 1) * itemsPerPage;
                const endIndex = startIndex + itemsPerPage;
                const paginatedClientes = clientes.slice(startIndex, endIndex);
                
                paginatedClientes.forEach(cliente => {
                    const row = document.createElement('tr');
                    row.innerHTML = `
                        <td>${cliente.nome}</td>
                        <td>${cliente.cnpj || 'N/A'}</td>
                        <td>${cliente.contatos}</td>
                        <td class="table-actions">
                            <button class="btn btn-sm btn-info btn-action" onclick="viewCliente(${cliente.id})"><i class="bi bi-eye"></i></button>
                            ${currentUser.cargo === 'admin' ? `
                            <button class="btn btn-sm btn-warning btn-action" onclick="editCliente(${cliente.id})"><i class="bi bi-pencil"></i></button>
                            <button class="btn btn-sm btn-danger btn-action" onclick="askForDelete('cliente', ${cliente.id})"><i class="bi bi-trash"></i></button>
                            ` : ''}
                        </td>
                    `;
                    clientesList.appendChild(row);
                });
                
                // Atualizar dropdowns de clientes em outros formulários
                updateClientDropdowns(clientes);
                
                // Atualizar paginação
                updatePagination('clientes', clientes.length, page);
            } catch (error) {
                showNotification('clientes-status', 'Erro ao carregar clientes: ' + error.message, false);
            }
        }

async function saveClient() {
            // Verificar se o usuário tem permissão
            if (currentUser.cargo !== 'admin') {
                alert('Acesso negado: apenas administradores podem criar/editar clientes.');
                return;
            }
            
            const formData = new FormData(document.getElementById('client-form'));
            const clientData = Object.fromEntries(formData.entries());
            const clientId = document.getElementById('client-id').value;
            
            try {
                if (clientId) {
                    // Editar cliente existente
                    await apiRequest(`/v1/clientes/${clientId}`, {
                        method: 'PUT',
                        body: JSON.stringify(clientData)
                    });
                    showNotification('clientes-status', 'Cliente atualizado com sucesso!', true);
                } else {
                    // Criar novo cliente
                    await apiRequest('/v1/clientes', {
                        method: 'POST',
                        body: JSON.stringify(clientData)
                    });
                    showNotification('clientes-status', 'Cliente criado com sucesso!', true);
                }
                
                // Fechar modal e recarregar lista
                bootstrap.Modal.getInstance(document.getElementById('addClientModal')).hide();
                loadClientes(currentPage.clientes);
            } catch (error) {
                showNotification('clientes-status', 'Erro ao salvar cliente: ' + error.message, false);
            }
        }

async function deleteCliente(id) {
            try {
                await apiRequest(`/v1/clientes/${id}`, {
                    method: 'DELETE'
                });
                showNotification('clientes-status', 'Cliente excluído com sucesso!', true);
                loadClientes(currentPage.clientes);
            } catch (error) {
                showNotification('clientes-status', 'Erro ao excluir cliente: ' + error.message, false);
            }
        }

async function searchClients() {
            const searchTerm = document.getElementById('searchClient').value.toLowerCase();
            try {
                const clientes = await apiRequest('/v1/clientes');
                const filteredClients = clientes.filter(cliente => 
                    cliente.nome.toLowerCase().includes(searchTerm) || 
                    (cliente.cnpj && cliente.cnpj.toLowerCase().includes(searchTerm))
                );
                
                const clientesList = document.getElementById('clientes-list');
                clientesList.innerHTML = '';
                
                filteredClients.forEach(cliente => {
                    const row = document.createElement('tr');
                    row.innerHTML = `
                        <td>${cliente.nome}</td>
                        <td>${cliente.cnpj || 'N/A'}</td>
                        <td>${cliente.contatos}</td>
                        <td class="table-actions">
                            <button class="btn btn-sm btn-info btn-action" onclick="viewCliente(${cliente.id})"><i class="bi bi-eye"></i></button>
                            ${currentUser.cargo === 'admin' ? `
                            <button class="btn btn-sm btn-warning btn-action" onclick="editCliente(${cliente.id})"><i class="bi bi-pencil"></i></button>
                            <button class="btn btn-sm btn-danger btn-action" onclick="askForDelete('cliente', ${cliente.id})"><i class="bi bi-trash"></i></button>
                            ` : ''}
                        </td>
                    `;
                    clientesList.appendChild(row);
                });
            } catch (error) {
                showNotification('clientes-status', 'Erro ao buscar clientes: ' + error.message, false);
            }
        }

async function viewCliente(id) {
            try {
                const cliente = await apiRequest(`/v1/clientes/${id}`);
                alert(`Detalhes do Cliente:\nNome: ${cliente.nome}\nCNPJ: ${cliente.cnpj || 'N/A'}\nContatos: ${cliente.contatos}`);
            } catch (error) {
                showNotification('clientes-status', 'Erro ao carregar cliente: ' + error.message, false);
            }
        }

async function editCliente(id) {
            try {
                const cliente = await apiRequest(`/v1/clientes/${id}`);
                document.getElementById('client-id').value = cliente.id;
                document.getElementById('clientName').value = cliente.nome;
                document.getElementById('clientCnpj').value = cliente.cnpj || '';
                document.getElementById('clientContacts').value = cliente.contatos;
                
                bootstrap.Modal.getOrCreateInstance(document.getElementById('addClientModal')).show();
            } catch (error) {
                showNotification('clientes-status', 'Erro ao carregar cliente: ' + error.message, false);
            }
        }

