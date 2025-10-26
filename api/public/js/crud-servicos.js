/* CRUD - Serviços */

async function loadServicos(page = 1) {
            try {
                const servicos = await apiRequest('/v1/servicos');
                const servicosList = document.getElementById('servicos-list');
                servicosList.innerHTML = '';
                
                // Paginação
                const startIndex = (page - 1) * itemsPerPage;
                const endIndex = startIndex + itemsPerPage;
                const paginatedServicos = servicos.slice(startIndex, endIndex);
                
                paginatedServicos.forEach(servico => {
                    const row = document.createElement('tr');
                    row.innerHTML = `
                        <td>${servico.descricao}</td>
                        <td><span class="badge bg-${getStatusBadgeClass(servico.status)}">${servico.status}</span></td>
                        <td>${new Date(servico.dataAgendada).toLocaleDateString()}</td>
                        <td>${servico.cliente?.nome || 'N/A'}</td>
                        <td>${servico.tipoServico?.nome || 'N/A'}</td>
                        <td class="table-actions">
                            <button class="btn btn-sm btn-info btn-action" onclick="viewServico(${servico.id})"><i class="bi bi-eye"></i></button>
                            ${currentUser.cargo === 'admin' ? `
                            <button class="btn btn-sm btn-warning btn-action" onclick="editServico(${servico.id})"><i class="bi bi-pencil"></i></button>
                            <button class="btn btn-sm btn-danger btn-action" onclick="askForDelete('servico', ${servico.id})"><i class="bi bi-trash"></i></button>
                            ` : ''}
                        </td>
                    `;
                    servicosList.appendChild(row);
                });
                
                // Atualizar paginação
                updatePagination('servicos', servicos.length, page);
            } catch (error) {
                showNotification('servicos-status', 'Erro ao carregar serviços: ' + error.message, false);
            }
        }

async function saveServico() {
            // Verificar se o usuário tem permissão
            if (currentUser.cargo !== 'admin') {
                alert('Acesso negado: apenas administradores podem criar/editar serviços.');
                return;
            }
            
            const formData = new FormData(document.getElementById('servico-form'));
            const servicoData = Object.fromEntries(formData.entries());
            const servicoId = document.getElementById('servico-id').value;
            
            // Converter IDs para números
            if (servicoData.clienteId) servicoData.clienteId = parseInt(servicoData.clienteId);
            if (servicoData.tipoServicoId) servicoData.tipoServicoId = parseInt(servicoData.tipoServicoId);
            if (servicoData.ativoId) servicoData.ativoId = parseInt(servicoData.ativoId);
            if (servicoData.usuarioId) servicoData.usuarioId = parseInt(servicoData.usuarioId);
            
            try {
                if (servicoId) {
                    // Editar serviço existente
                    await apiRequest(`/v1/servicos/${servicoId}`, {
                        method: 'PUT',
                        body: JSON.stringify(servicoData)
                    });
                    showNotification('servicos-status', 'Serviço atualizado com sucesso!', true);
                } else {
                    // Criar novo serviço
                    await apiRequest('/v1/servicos', {
                        method: 'POST',
                        body: JSON.stringify(servicoData)
                    });
                    showNotification('servicos-status', 'Serviço criado com sucesso!', true);
                }
                
                // Fechar modal e recarregar lista
                bootstrap.Modal.getInstance(document.getElementById('addServicoModal')).hide();
                loadServicos(currentPage.servicos);
            } catch (error) {
                showNotification('servicos-status', 'Erro ao salvar serviço: ' + error.message, false);
            }
        }

async function deleteServico(id) {
            try {
                await apiRequest(`/v1/servicos/${id}`, {
                    method: 'DELETE'
                });
                showNotification('servicos-status', 'Serviço excluído com sucesso!', true);
                loadServicos(currentPage.servicos);
            } catch (error) {
                showNotification('servicos-status', 'Erro ao excluir serviço: ' + error.message, false);
            }
        }

async function searchServicos() {
            const searchTerm = document.getElementById('searchServico').value.toLowerCase();
            try {
                const servicos = await apiRequest('/v1/servicos');
                const filteredServicos = servicos.filter(servico => 
                    servico.descricao.toLowerCase().includes(searchTerm) || 
                    servico.status.toLowerCase().includes(searchTerm) ||
                    (servico.cliente?.nome && servico.cliente.nome.toLowerCase().includes(searchTerm))
                );
                
                const servicosList = document.getElementById('servicos-list');
                servicosList.innerHTML = '';
                
                filteredServicos.forEach(servico => {
                    const row = document.createElement('tr');
                    row.innerHTML = `
                        <td>${servico.descricao}</td>
                        <td><span class="badge bg-${getStatusBadgeClass(servico.status)}">${servico.status}</span></td>
                        <td>${new Date(servico.dataAgendada).toLocaleDateString()}</td>
                        <td>${servico.cliente?.nome || 'N/A'}</td>
                        <td>${servico.tipoServico?.nome || 'N/A'}</td>
                        <td class="table-actions">
                            <button class="btn btn-sm btn-info btn-action" onclick="viewServico(${servico.id})"><i class="bi bi-eye"></i></button>
                            ${currentUser.cargo === 'admin' ? `
                            <button class="btn btn-sm btn-warning btn-action" onclick="editServico(${servico.id})"><i class="bi bi-pencil"></i></button>
                            <button class="btn btn-sm btn-danger btn-action" onclick="askForDelete('servico', ${servico.id})"><i class="bi bi-trash"></i></button>
                            ` : ''}
                        </td>
                    `;
                    servicosList.appendChild(row);
                });
            } catch (error) {
                showNotification('servicos-status', 'Erro ao buscar serviços: ' + error.message, false);
            }
        }

