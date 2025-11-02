'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const qi = queryInterface;

    // Garante a existência de FK para Ativos (ignora se já existir)
    try {
      await qi.sequelize.query(`
        ALTER TABLE "Servicos"
        ADD CONSTRAINT fk_servicos_ativo
        FOREIGN KEY ("ativoId") REFERENCES "Ativos"(id)
        ON UPDATE CASCADE
        ON DELETE RESTRICT
      `);
    } catch (_) { /* ignore if exists */ }

    // Verifica serviços sem ativo
    const [[{ count }]] = await qi.sequelize.query(
      'SELECT COUNT(*)::int AS count FROM "Servicos" WHERE "ativoId" IS NULL'
    );
    if (count > 0) {
      throw new Error(`Encontrados ${count} serviços com ativoId NULL. Corrija-os (atribua um ativo ou remova) e rode a migration novamente.`);
    }

    // Torna NOT NULL
    await qi.sequelize.query('ALTER TABLE "Servicos" ALTER COLUMN "ativoId" SET NOT NULL');
  },

  async down(queryInterface, Sequelize) {
    const qi = queryInterface;
    try {
      await qi.sequelize.query('ALTER TABLE "Servicos" ALTER COLUMN "ativoId" DROP NOT NULL');
    } catch (_) {}
    try {
      await qi.sequelize.query('ALTER TABLE "Servicos" DROP CONSTRAINT IF EXISTS fk_servicos_ativo');
    } catch (_) {}
  }
};

