/* CRUD - Usuários */

async function loadUsuarios(page = 1) {
            try {
                const usuarios = await apiRequest('/v1/usuarios');
                const usuariosList = document.getElementById('usuarios-list');
                usuariosList.innerHTML = '';
                
                // Paginação
                const startIndex = (page - 1) * itemsPerPage;
                const endIndex = startIndex + itemsPerPage;
                const paginatedUsuarios = usuarios.slice(startIndex, endIndex);
                
                paginatedUsuarios.forEach(usuario => {
                    const row = document.createElement('tr');
                    row.innerHTML = `
                        <td>${usuario.nome}</td>
                        <td>${usuario.email}</td>
                        <td>${usuario.cargo}</td>
                        <td>${usuario.telefone || 'N/A'}</td>
                        <td class="table-actions">
                            <button class="btn btn-sm btn-info btn-action" onclick="viewUsuario(${usuario.id})"><i class="bi bi-eye"></i></button>
                            ${currentUser.cargo === 'admin' ? `
                            <button class="btn btn-sm btn-warning btn-action" onclick="editUsuario(${usuario.id})"><i class="bi bi-pencil"></i></button>
                            <button class="btn btn-sm btn-danger btn-action" onclick="askForDelete('usuario', ${usuario.id})"><i class="bi bi-trash"></i></button>
                            ` : ''}
                        </td>
                    `;
                    usuariosList.appendChild(row);
                });
                
                // Atualizar paginação
                updatePagination('usuarios', usuarios.length, page);
            } catch (error) {
                showNotification('usuarios-status', 'Erro ao carregar usuários: ' + error.message, false);
            }
        }

async function saveUsuario() {
            // Verificar se o usuário tem permissão
            if (currentUser.cargo !== 'admin') {
                alert('Acesso negado: apenas administradores podem criar/editar usuários.');
                return;
            }
            
            const formData = new FormData(document.getElementById('usuario-form'));
            const usuarioData = Object.fromEntries(formData.entries());
            const usuarioId = document.getElementById('usuario-id').value;
            
            try {
                if (usuarioId) {
                    // Editar usuário existente
                    await apiRequest(`/v1/usuarios/${usuarioId}`, {
                        method: 'PUT',
                        body: JSON.stringify(usuarioData)
                    });
                    showNotification('usuarios-status', 'Usuário atualizado com sucesso!', true);
                } else {
                    // Criar novo usuário
                    await apiRequest('/v1/usuarios', {
                        method: 'POST',
                        body: JSON.stringify(usuarioData)
                    });
                    showNotification('usuarios-status', 'Usuário criado com sucesso!', true);
                }
                
                // Fechar modal e recarregar lista
                bootstrap.Modal.getInstance(document.getElementById('addUsuarioModal')).hide();
                loadUsuarios(currentPage.usuarios);
            } catch (error) {
                showNotification('usuarios-status', 'Erro ao salvar usuário: ' + error.message, false);
            }
        }

async function deleteUsuario(id) {
            try {
                await apiRequest(`/v1/usuarios/${id}`, {
                    method: 'DELETE'
                });
                showNotification('usuarios-status', 'Usuário excluído com sucesso!', true);
                loadUsuarios(currentPage.usuarios);
            } catch (error) {
                showNotification('usuarios-status', 'Erro ao excluir usuário: ' + error.message, false);
            }
        }

async function searchUsuarios() {
            const searchTerm = document.getElementById('searchUsuario').value.toLowerCase();
            try {
                const usuarios = await apiRequest('/v1/usuarios');
                const filteredUsuarios = usuarios.filter(usuario => 
                    usuario.nome.toLowerCase().includes(searchTerm) || 
                    usuario.email.toLowerCase().includes(searchTerm) ||
                    usuario.cargo.toLowerCase().includes(searchTerm)
                );
                
                const usuariosList = document.getElementById('usuarios-list');
                usuariosList.innerHTML = '';
                
                filteredUsuarios.forEach(usuario => {
                    const row = document.createElement('tr');
                    row.innerHTML = `
                        <td>${usuario.nome}</td>
                        <td>${usuario.email}</td>
                        <td>${usuario.cargo}</td>
                        <td>${usuario.telefone || 'N/A'}</td>
                        <td class="table-actions">
                            <button class="btn btn-sm btn-info btn-action" onclick="viewUsuario(${usuario.id})"><i class="bi bi-eye"></i></button>
                            ${currentUser.cargo === 'admin' ? `
                            <button class="btn btn-sm btn-warning btn-action" onclick="editUsuario(${usuario.id})"><i class="bi bi-pencil"></i></button>
                            <button class="btn btn-sm btn-danger btn-action" onclick="askForDelete('usuario', ${usuario.id})"><i class="bi bi-trash"></i></button>
                            ` : ''}
                        </td>
                    `;
                    usuariosList.appendChild(row);
                });
            } catch (error) {
                showNotification('usuarios-status', 'Erro ao buscar usuários: ' + error.message, false);
            }
        }

