'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const now = new Date();
    const qi = queryInterface;

    // Idempotência: limpar ativos-alvo
    await qi.sequelize.query(
      `DELETE FROM "Ativos" WHERE "numeroSerie" IN ('SRV-APP-0001','RTR-CORE-0001','NB-ADM-0001')`
    );

    // Busca IDs por nomes únicos
    const [[{ id: matrizId }]] = await qi.sequelize.query(`SELECT id FROM "Locals" WHERE nome = 'Matriz' LIMIT 1`);
    const [[{ id: filialNorteId }]] = await qi.sequelize.query(`SELECT id FROM "Locals" WHERE nome = 'Filial Norte' LIMIT 1`);

    const [[{ id: acmeId }]] = await qi.sequelize.query(`SELECT id FROM clientes WHERE nome = 'Acme Corp' LIMIT 1`);
    const [[{ id: betaId }]] = await qi.sequelize.query(`SELECT id FROM clientes WHERE nome = 'Beta Ltda' LIMIT 1`);

    await qi.bulkInsert('Ativos', [
      {
        nome: 'Servidor Aplicação 01',
        numeroSerie: 'SRV-APP-0001',
        clienteId: acmeId,
        localId: matrizId,
        status: 'ativo',
        detalhes: JSON.stringify({ marca: 'Dell', garantia: '12m' }),
        createdAt: now, updatedAt: now
      },
      {
        nome: 'Roteador Core',
        numeroSerie: 'RTR-CORE-0001',
        clienteId: betaId,
        localId: filialNorteId,
        status: 'ativo',
        detalhes: JSON.stringify({ fabricante: 'Cisco', modelo: 'ASR1001' }),
        createdAt: now, updatedAt: now
      },
      {
        nome: 'Notebook ADM 01',
        numeroSerie: 'NB-ADM-0001',
        clienteId: acmeId,
        localId: matrizId,
        status: 'inativo',
        detalhes: JSON.stringify({ marca: 'Lenovo', motivo: 'Substituído' }),
        createdAt: now, updatedAt: now
      }
    ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Ativos', null, {});
  }
};
