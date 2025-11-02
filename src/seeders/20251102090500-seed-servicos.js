'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const now = new Date();
    const qi = queryInterface;

    // Idempotência: remover serviços-alvo pelo campo de descrição conhecido
    await qi.sequelize.query(
      `DELETE FROM "Servicos" WHERE descricao IN ('Instalação de servidor de aplicação','Manutenção preventiva no roteador core')`
    );

    // Lookups por campos únicos
    const [[{ id: acmeId }]] = await qi.sequelize.query(`SELECT id FROM clientes WHERE nome = 'Acme Corp' LIMIT 1`);
    const [[{ id: betaId }]] = await qi.sequelize.query(`SELECT id FROM clientes WHERE nome = 'Beta Ltda' LIMIT 1`);

    const [[{ id: adminId }]] = await qi.sequelize.query(`SELECT id FROM "Usuarios" WHERE lower(email) = 'admin@gestaofacil.local' LIMIT 1`);
    const [[{ id: joaoId }]] = await qi.sequelize.query(`SELECT id FROM "Usuarios" WHERE lower(email) = 'joao@gestaofacil.local' LIMIT 1`);

    const [[{ id: tipoInstalacaoId }]] = await qi.sequelize.query(`SELECT id FROM "TipoServicos" WHERE nome = 'Instalação' LIMIT 1`);
    const [[{ id: tipoManutencaoId }]] = await qi.sequelize.query(`SELECT id FROM "TipoServicos" WHERE nome = 'Manutenção' LIMIT 1`);

    const [[{ id: ativoSrv01Id }]] = await qi.sequelize.query(`SELECT id FROM "Ativos" WHERE "numeroSerie" = 'SRV-APP-0001' LIMIT 1`);
    const [[{ id: ativoRtrId }]] = await qi.sequelize.query(`SELECT id FROM "Ativos" WHERE "numeroSerie" = 'RTR-CORE-0001' LIMIT 1`);
    // NB-ADM-0001 é inativo: não usar para serviços, por trigger

    await qi.bulkInsert('Servicos', [
      {
        descricao: 'Instalação de servidor de aplicação',
        status: 'concluido',
        clienteId: acmeId,
        usuarioId: adminId,
        ativoId: ativoSrv01Id,
        tipoServicoId: tipoInstalacaoId,
        dataAgendada: new Date(now.getTime() - 7 * 86400000),
        dataConclusao: new Date(now.getTime() - 6 * 86400000),
        detalhes: JSON.stringify({ versao: 'v1.0.0' }),
        createdAt: now, updatedAt: now
      },
      {
        descricao: 'Manutenção preventiva no roteador core',
        status: 'em_andamento',
        clienteId: betaId,
        usuarioId: joaoId,
        ativoId: ativoRtrId,
        tipoServicoId: tipoManutencaoId,
        dataAgendada: new Date(now.getTime() + 2 * 86400000),
        dataConclusao: null,
        detalhes: JSON.stringify({ checklist: ['backup config', 'verificar BGP'] }),
        createdAt: now, updatedAt: now
      }
    ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Servicos', null, {});
  }
};
