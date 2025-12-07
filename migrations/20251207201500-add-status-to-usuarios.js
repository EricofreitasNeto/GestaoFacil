'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('Usuarios', 'status', {
      type: Sequelize.STRING,
      allowNull: false,
      defaultValue: 'pending'
    });
    await queryInterface.sequelize.query(`
      UPDATE "Usuarios"
      SET "status" = 'approved'
      WHERE "status" IS NULL OR "status" = ''
    `);
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('Usuarios', 'status');
  }
};
