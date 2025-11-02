'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const now = new Date();
    await queryInterface.sequelize.query(
      `DELETE FROM "Locals" WHERE nome IN ('Matriz','Filial Norte','Filial Sul')`
    );

    await queryInterface.bulkInsert('Locals', [
      { nome: 'Matriz', createdAt: now, updatedAt: now },
      { nome: 'Filial Norte', createdAt: now, updatedAt: now },
      { nome: 'Filial Sul', createdAt: now, updatedAt: now },
    ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Locals', null, {});
  }
};
