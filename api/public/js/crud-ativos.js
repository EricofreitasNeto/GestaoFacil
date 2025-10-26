/* CRUD - Ativos */

async function loadAtivos(page = 1) {
            try {
                const ativos = await apiRequest('/v1/ativos');
                const ativosList = document.getElementById('ativos-list');
                ativosList.innerHTML = '';
                
                // Paginação
                const startIndex = (page - 1) * itemsPerPage;
                const endIndex = startIndex + itemsPerPage;
                const paginatedAtivos = ativos.slice(startIndex, endIndex);
                
                paginatedAtivos.forEach(ativo => {
                    const row = document.createElement('tr');
                    row.innerHTML = `
                        <td>${ativo.codigo}</td>
                        <td>${ativo.nome}</td>
                        <td>${ativo.tipo}</td>
                        <td><span class="badge bg-${getStatusBadgeClass(ativo.status)}">${ativo.status}</span></td>
                        <td>${ativo.cliente?.nome || 'N/A'}</td>
                        <td class="table-actions">
                            <button class="btn btn-sm btn-info btn-action" onclick="viewAtivo(${ativo.id})"><i class="bi bi-eye"></i></button>
                            ${currentUser.cargo === 'admin' ? `
                            <button class="btn btn-sm btn-warning btn-action" onclick="editAtivo(${ativo.id})"><i class="bi bi-pencil"></i></button>
                            <button class="btn btn-sm btn-danger btn-action" onclick="askForDelete('ativo', ${ativo.id})"><i class="bi bi-trash"></i></button>
                            ` : ''}
                        </td>
                    `;
                    ativosList.appendChild(row);
                });
                
                // Atualizar dropdown de ativos no formulário de serviços
                updateAtivoDropdown(ativos);
                
                // Atualizar paginação
                updatePagination('ativos', ativos.length, page);
            } catch (error) {
                showNotification('ativos-status', 'Erro ao carregar ativos: ' + error.message, false);
            }
        }

async function saveAtivo() {
            // Verificar se o usuário tem permissão
            if (currentUser.cargo !== 'admin') {
                alert('Acesso negado: apenas administradores podem criar/editar ativos.');
                return;
            }
            
            const formData = new FormData(document.getElementById('ativo-form'));
            const ativoData = Object.fromEntries(formData.entries());
            const ativoId = document.getElementById('ativo-id').value;
            
            // Converter IDs para números
            if (ativoData.clienteId) ativoData.clienteId = parseInt(ativoData.clienteId);
            if (ativoData.localId) ativoData.localId = parseInt(ativoData.localId);
            
            try {
                if (ativoId) {
                    // Editar ativo existente
                    await apiRequest(`/v1/ativos/${ativoId}`, {
                        method: 'PUT',
                        body: JSON.stringify(ativoData)
                    });
                    showNotification('ativos-status', 'Ativo atualizado com sucesso!', true);
                } else {
                    // Criar novo ativo
                    await apiRequest('/v1/ativos', {
                        method: 'POST',
                        body: JSON.stringify(ativoData)
                    });
                    showNotification('ativos-status', 'Ativo criado com sucesso!', true);
                }
                
                // Fechar modal e recarregar lista
                bootstrap.Modal.getInstance(document.getElementById('addAtivoModal')).hide();
                loadAtivos(currentPage.ativos);
            } catch (error) {
                showNotification('ativos-status', 'Erro ao salvar ativo: ' + error.message, false);
            }
        }

async function deleteAtivo(id) {
            try {
                await apiRequest(`/v1/ativos/${id}`, {
                    method: 'DELETE'
                });
                showNotification('ativos-status', 'Ativo excluído com sucesso!', true);
                loadAtivos(currentPage.ativos);
            } catch (error) {
                showNotification('ativos-status', 'Erro ao excluir ativo: ' + error.message, false);
            }
        }

async function searchAtivos() {
            const searchTerm = document.getElementById('searchAtivo').value.toLowerCase();
            try {
                const ativos = await apiRequest('/v1/ativos');
                const filteredAtivos = ativos.filter(ativo => 
                    ativo.codigo.toLowerCase().includes(searchTerm) || 
                    ativo.nome.toLowerCase().includes(searchTerm) ||
                    ativo.tipo.toLowerCase().includes(searchTerm)
                );
                
                const ativosList = document.getElementById('ativos-list');
                ativosList.innerHTML = '';
                
                filteredAtivos.forEach(ativo => {
                    const row = document.createElement('tr');
                    row.innerHTML = `
                        <td>${ativo.codigo}</td>
                        <td>${ativo.nome}</td>
                        <td>${ativo.tipo}</td>
                        <td><span class="badge bg-${getStatusBadgeClass(ativo.status)}">${ativo.status}</span></td>
                        <td>${ativo.cliente?.nome || 'N/A'}</td>
                        <td class="table-actions">
                            <button class="btn btn-sm btn-info btn-action" onclick="viewAtivo(${ativo.id})"><i class="bi bi-eye"></i></button>
                            ${currentUser.cargo === 'admin' ? `
                            <button class="btn btn-sm btn-warning btn-action" onclick="editAtivo(${ativo.id})"><i class="bi bi-pencil"></i></button>
                            <button class="btn btn-sm btn-danger btn-action" onclick="askForDelete('ativo', ${ativo.id})"><i class="bi bi-trash"></i></button>
                            ` : ''}
                        </td>
                    `;
                    ativosList.appendChild(row);
                });
            } catch (error) {
                showNotification('ativos-status', 'Erro ao buscar ativos: ' + error.message, false);
            }
        }

