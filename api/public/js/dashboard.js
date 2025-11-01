/* Funções do Dashboard (carregar dados e gráficos) */

// Mapeamento de status com fallback global
function getStatusBadgeClass(status) {
  return (typeof window !== 'undefined' && typeof window.getStatusBadgeClass === 'function')
    ? window.getStatusBadgeClass(status)
    : 'secondary';
}

// Carrega os dados principais do dashboard (dados reais do banco)
async function loadDashboardData() {
  try {
    const [clientes, ativos, servicos, usuarios] = await Promise.all([
      apiRequest('/v1/clientes'),
      apiRequest('/v1/ativos'),
      apiRequest('/v1/servicos'),
      currentUser?.cargo === 'admin' ? apiRequest('/v1/usuarios') : Promise.resolve([])
    ]);

    // Estatísticas
    const setText = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = String(val ?? 0); };
    setText('stats-clientes', clientes?.length || 0);
    setText('stats-ativos', ativos?.length || 0);
    setText('stats-servicos', servicos?.length || 0);
    setText('stats-usuarios', usuarios?.length || 0);

    // Gráficos e lista recentes usando dados reais
    loadCharts(servicos || []);
    loadRecentServices(servicos || []);
  } catch (error) {
    console.error('Erro ao carregar dados do dashboard:', error);
  }
}

// Gráficos principais do painel
function loadCharts(servicos) {
  const safeNormalize = (s) => {
    if (!s) return '';
    try { return String(s).normalize('NFD').replace(/\p{Diacritic}/gu, ''); } catch (_) { return String(s); }
  };

  // 1) Serviços por status (base real)
  const statusCount = {};
  servicos.forEach(sv => {
    const raw = sv.status || 'Pendente';
    const key = safeNormalize(raw).trim();
    statusCount[raw] = (statusCount[raw] || 0) + 1; // mantém rótulo original para exibir legível
  });
  const statusLabels = Object.keys(statusCount);
  const statusData = statusLabels.map(l => statusCount[l]);

  if (document.getElementById('servicesChart')) {
    const ctx = document.getElementById('servicesChart').getContext('2d');
    if (window._servicesChart) window._servicesChart.destroy();
    window._servicesChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: statusLabels,
        datasets: [{
          label: 'Serviços por Status',
          data: statusData,
          backgroundColor: ['#4e73df', '#1cc88a', '#36b9cc', '#f6c23e', '#e74a3b', '#858796']
        }]
      },
      options: {
        maintainAspectRatio: false,
        scales: { y: { beginAtZero: true, ticks: { precision: 0 } } }
      }
    });
  }

  // 2) Tipos de serviço (base real via servico.tipoServico?.nome)
  const typeCount = {};
  servicos.forEach(sv => {
    const label = (sv.tipoServico?.nome) || 'Sem tipo';
    typeCount[label] = (typeCount[label] || 0) + 1;
  });
  const typeLabels = Object.keys(typeCount);
  const typeData = typeLabels.map(l => typeCount[l]);

  if (document.getElementById('serviceTypesChart')) {
    const tctx = document.getElementById('serviceTypesChart').getContext('2d');
    if (window._serviceTypesChart) window._serviceTypesChart.destroy();
    window._serviceTypesChart = new Chart(tctx, {
      type: 'doughnut',
      data: {
        labels: typeLabels,
        datasets: [{
          data: typeData,
          backgroundColor: ['#4e73df', '#1cc88a', '#36b9cc', '#f6c23e', '#e74a3b', '#858796', '#20c997']
        }]
      },
      options: { maintainAspectRatio: false }
    });
  }
}

// Lista dos serviços mais recentes
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

// Usa o helper global definido em api.js
