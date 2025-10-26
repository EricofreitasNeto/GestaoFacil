/* Funções do dashboard (carregar dados e gráficos) */

async function loadDashboardData() {
            try {
                // Carregar estatísticas
                const [clientes, ativos, servicos, usuarios] = await Promise.all([
                    apiRequest('/v1/clientes'),
                    apiRequest('/v1/ativos'),
                    apiRequest('/v1/servicos'),
                    currentUser.cargo === 'admin' ? apiRequest('/v1/usuarios') : Promise.resolve([])
                ]);
                
                // Atualizar estatísticas
                document.getElementById('stats-clientes').textContent = clientes.length;
                document.getElementById('stats-ativos').textContent = ativos.length;
                document.getElementById('stats-servicos').textContent = servicos.length;
                document.getElementById('stats-usuarios').textContent = usuarios.length;
                
                // Carregar gráficos
                loadCharts(servicos);
                
                // Carregar serviços recentes
                loadRecentServices(servicos);
            } catch (error) {
                console.error('Erro ao carregar dados do dashboard:', error);
            }
        }

function loadCharts(servicos) {
            // Gráfico de serviços por status
            const statusCount = {};
            servicos.forEach(servico => {
                statusCount[servico.status] = (statusCount[servico.status] || 0) + 1;
            });
            
            const statusCtx = document.getElementById('servicesChart').getContext('2d');
            new Chart(statusCtx, {
                type: 'bar',
                data: {
                    labels: Object.keys(statusCount),
                    datasets: [{
                        label: 'Serviços por Status',
                        data: Object.values(statusCount),
                        backgroundColor: ['#4e73df', '#1cc88a', '#36b9cc', '#f6c23e', '#e74a3b'],
                    }]
                },
                options: {
                    maintainAspectRatio: false,
                    scales: {
                        y: {
                            beginAtZero: true,
                            ticks: {
                                precision: 0
                            }
                        }
                    }
                }
            });
            
            // Gráfico de tipos de serviços (simulado)
            const typesCtx = document.getElementById('serviceTypesChart').getContext('2d');
            new Chart(typesCtx, {
                type: 'doughnut',
                data: {
                    labels: ['Manutenção', 'Instalação', 'Suporte', 'Consultoria'],
                    datasets: [{
                        data: [35, 25, 20, 20],
                        backgroundColor: ['#4e73df', '#1cc88a', '#36b9cc', '#f6c23e']
                    }]
                },
                options: {
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            display: false
                        }
                    }
                }
            });
        }

function loadRecentServices(servicos) {
            const recentServicesContainer = document.getElementById('recent-services');
            recentServicesContainer.innerHTML = '';
            
            // Ordenar serviços por data (mais recentes primeiro)
            const recentServices = servicos
                .sort((a, b) => new Date(b.dataAgendada) - new Date(a.dataAgendada))
                .slice(0, 5);
            
            recentServices.forEach(servico => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>#${servico.id}</td>
                    <td>${servico.cliente?.nome || 'N/A'}</td>
                    <td>${servico.descricao}</td>
                    <td>${new Date(servico.dataAgendada).toLocaleDateString()}</td>
                    <td><span class="badge bg-${getStatusBadgeClass(servico.status)}">${servico.status}</span></td>
                `;
                recentServicesContainer.appendChild(row);
            });
        }

function getStatusBadgeClass(status) {
            switch(status) {
                case 'Concluído': return 'success';
                case 'Em Andamento': return 'primary';
                case 'Agendado': return 'info';
                case 'Cancelado': return 'danger';
                default: return 'secondary';
            }
        }

