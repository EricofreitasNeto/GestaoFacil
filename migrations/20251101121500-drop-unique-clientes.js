'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const qi = queryInterface;
    const stmts = [
      'ALTER TABLE clientes DROP CONSTRAINT IF EXISTS clientes_nome_key',
      'ALTER TABLE clientes DROP CONSTRAINT IF EXISTS clientes_cnpj_key',
      'DROP INDEX IF EXISTS clientes_nome_key',
      'DROP INDEX IF EXISTS clientes_cnpj_key'
    ];
    for (const s of stmts) {
      try { await qi.sequelize.query(s); } catch (e) { /* ignore */ }
    }
  },
  async down(queryInterface, Sequelize) {
    const qi = queryInterface;
    const stmts = [
      'ALTER TABLE clientes ADD CONSTRAINT clientes_nome_key UNIQUE (nome)',
      'ALTER TABLE clientes ADD CONSTRAINT clientes_cnpj_key UNIQUE (cnpj)'
    ];
    for (const s of stmts) {
      try { await qi.sequelize.query(s); } catch (e) { /* ignore */ }
    }
  }
};

