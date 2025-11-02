'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const now = new Date();
    await queryInterface.sequelize.query(
      `DELETE FROM clientes WHERE nome IN ('Acme Corp','Beta Ltda','Gamma Serviços')`
    );

    await queryInterface.bulkInsert('clientes', [
      { nome: 'Acme Corp', cnpj: '12.345.678/0001-90', contatos: 'contato@acme.com', createdAt: now, updatedAt: now },
      { nome: 'Beta Ltda', cnpj: '98.765.432/0001-10', contatos: 'suporte@beta.com.br', createdAt: now, updatedAt: now },
      { nome: 'Gamma Serviços', cnpj: '11.222.333/0001-44', contatos: 'gamma@gamma.com', createdAt: now, updatedAt: now },
    ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('clientes', null, {});
  }
};
