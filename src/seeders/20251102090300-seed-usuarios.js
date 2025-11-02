'use strict';

const bcrypt = require('bcryptjs');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const now = new Date();
    const hash = (pwd) => bcrypt.hashSync(pwd, 10);
    await queryInterface.sequelize.query(
      `DELETE FROM "Usuarios" WHERE lower(email) IN ('admin@gestaofacil.local','joao@gestaofacil.local','maria@gestaofacil.local')`
    );

    await queryInterface.bulkInsert('Usuarios', [
      { nome: 'Admin', cargo: 'Administrador', email: 'admin@gestaofacil.local', telefone: '11999990000', password: hash('admin123'), createdAt: now, updatedAt: now },
      { nome: 'João Silva', cargo: 'Técnico', email: 'joao@gestaofacil.local', telefone: '11988887777', password: hash('senha123'), createdAt: now, updatedAt: now },
      { nome: 'Maria Souza', cargo: 'Coordenadora', email: 'maria@gestaofacil.local', telefone: '11977776666', password: hash('senha123'), createdAt: now, updatedAt: now },
    ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Usuarios', null, {});
  }
};
