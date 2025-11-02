'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const now = new Date();
    // Idempotência: remove registros-alvo antes de inserir
    await queryInterface.sequelize.query(
      `DELETE FROM "TipoServicos" WHERE nome IN ('Instalação','Manutenção','Suporte')`
    );

    await queryInterface.bulkInsert('TipoServicos', [
      { nome: 'Instalação', descricao: 'Instalação de equipamentos', ativo: true, createdAt: now, updatedAt: now },
      { nome: 'Manutenção', descricao: 'Manutenção preventiva e corretiva', ativo: true, createdAt: now, updatedAt: now },
      { nome: 'Suporte', descricao: 'Atendimento e suporte técnico', ativo: true, createdAt: now, updatedAt: now },
    ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('TipoServicos', null, {});
  }
};
