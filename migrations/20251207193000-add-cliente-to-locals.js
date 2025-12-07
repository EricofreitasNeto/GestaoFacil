'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('Locals', 'clienteId', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'clientes',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
    });

    await queryInterface.addIndex('Locals', ['clienteId'], {
      name: 'idx_locals_clienteId'
    });
  },

  async down(queryInterface) {
    await queryInterface.removeIndex('Locals', 'idx_locals_clienteId');
    await queryInterface.removeColumn('Locals', 'clienteId');
  }
};
