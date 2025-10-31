/* FunÃ§Ãµes do dashboard (carregar dados e grÃ¡ficos) */

// Override padronizado para mapeamento de status
function getStatusBadgeClass(status) {
  return (typeof window !== 'undefined' && typeof window.getStatusBadgeClass === 'function')
    ? window.getStatusBadgeClass(status)
    : 'secondary';
}

async function loadDashboardData() {
            try {
                // Carregar estatÃ­sticas
                const [clientes, ativos, servicos, usuarios] = await Promise.all([
                    apiRequest('/v1/clientes'),
                    apiRequest('/v1/ativos'),
                    apiRequest('/v1/servicos'),
                    currentUser.cargo === 'admin' ? apiRequest('/v1/usuarios') : Promise.resolve([])
                ]);
                
                // Atualizar estatÃ­sticas
                document.getElementById('stats-clientes').textContent = clientes.length;
                document.getElementById('stats-ativos').textContent = ativos.length;
                document.getElementById('stats-servicos').textContent = servicos.length;
                document.getElementById('stats-usuarios').textContent = usuarios.length;
                
                // Carregar grÃ¡ficos
                loadCharts(servicos);
                
                // Carregar serviÃ§os recentes
                loadRecentServices(servicos);
            } catch (error) {
                console.error('Erro ao carregar dados do dashboard:', error);
            }
        }

function loadCharts(servicos) {
            // GrÃ¡fico de serviÃ§os por status
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
                        label: 'ServiÃ§os por Status',
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
            
            // GrÃ¡fico de tipos de serviÃ§os (simulado)
            const typesCtx = document.getElementById('serviceTypesChart').getContext('2d');
            new Chart(typesCtx, {
                type: 'doughnut',
                data: {
                    labels: ['ManutenÃ§Ã£o', 'InstalaÃ§Ã£o', 'Suporte', 'Consultoria'],
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
            
            // Ordenar serviÃ§os por data (mais recentes primeiro)
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
                case 'ConcluÃ­do': return 'success';
                case 'Em Andamento': return 'primary';
                case 'Agendado': return 'info';
                case 'Cancelado': return 'danger';
                default: return 'secondary';
            }
        }

