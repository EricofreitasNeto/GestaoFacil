'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const qi = queryInterface;
    const sql = [];

    // Usuarios: email unique among active (deletedAt IS NULL)
    sql.push(`CREATE UNIQUE INDEX IF NOT EXISTS uniq_usuarios_email_deleted ON "Usuarios" (lower(email), "deletedAt")`);

    // Clientes: nome unique among active; cnpj unique among active
    sql.push(`CREATE UNIQUE INDEX IF NOT EXISTS uniq_clientes_nome_deleted ON clientes (lower(nome), "deletedAt")`);
    sql.push(`CREATE UNIQUE INDEX IF NOT EXISTS uniq_clientes_cnpj_deleted ON clientes (cnpj, "deletedAt")`);

    // Locais: nome unique among active (table assumed plural default "Locals")
    sql.push(`CREATE UNIQUE INDEX IF NOT EXISTS uniq_locais_nome_deleted ON "Locals" (lower(nome), "deletedAt")`);

    // TipoServicos: nome unique among active (default plural "TipoServicos")
    sql.push(`CREATE UNIQUE INDEX IF NOT EXISTS uniq_tiposervicos_nome_deleted ON "TipoServicos" (lower(nome), "deletedAt")`);

    // Ativos: numeroSerie unique among active (default plural "Ativos")
    sql.push(`CREATE UNIQUE INDEX IF NOT EXISTS uniq_ativos_numeroserie_deleted ON "Ativos" (lower("numeroSerie"), "deletedAt")`);

    for (const stmt of sql) {
      try { await qi.sequelize.query(stmt); } catch (e) { /* ignore if fails */ }
    }
  },

  async down(queryInterface, Sequelize) {
    const qi = queryInterface;
    const sql = [
      'DROP INDEX IF EXISTS uniq_usuarios_email_deleted',
      'DROP INDEX IF EXISTS uniq_clientes_nome_deleted',
      'DROP INDEX IF EXISTS uniq_clientes_cnpj_deleted',
      'DROP INDEX IF EXISTS uniq_locais_nome_deleted',
      'DROP INDEX IF EXISTS uniq_tiposervicos_nome_deleted',
      'DROP INDEX IF EXISTS uniq_ativos_numeroserie_deleted',
    ];
    for (const stmt of sql) {
      try { await qi.sequelize.query(stmt); } catch (e) { /* ignore */ }
    }
  }
};

