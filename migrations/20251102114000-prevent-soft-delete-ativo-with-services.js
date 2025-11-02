'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const qi = queryInterface;
    const fn = `
      CREATE OR REPLACE FUNCTION prevent_soft_delete_ativo_with_services() RETURNS trigger AS $$
      BEGIN
        IF NEW."deletedAt" IS NOT NULL AND (OLD."deletedAt" IS NULL OR NEW."deletedAt" <> OLD."deletedAt") THEN
          PERFORM 1 FROM "Servicos" s WHERE s."ativoId" = NEW.id AND s."deletedAt" IS NULL;
          IF FOUND THEN
            RAISE EXCEPTION 'Nao e permitido desativar ativo com servicos vinculados'
              USING ERRCODE = 'check_violation';
          END IF;
        END IF;
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;
    `;

    const trg = `
      CREATE TRIGGER trg_ativos_prevent_soft_delete_with_services
      BEFORE UPDATE OF "deletedAt" ON "Ativos"
      FOR EACH ROW
      WHEN (NEW."deletedAt" IS NOT NULL)
      EXECUTE FUNCTION prevent_soft_delete_ativo_with_services();
    `;

    try { await qi.sequelize.query(fn); } catch (_) {}
    try { await qi.sequelize.query(trg); } catch (_) {}
  },

  async down(queryInterface, Sequelize) {
    const qi = queryInterface;
    try { await qi.sequelize.query('DROP TRIGGER IF EXISTS trg_ativos_prevent_soft_delete_with_services ON "Ativos"'); } catch (_) {}
    try { await qi.sequelize.query('DROP FUNCTION IF EXISTS prevent_soft_delete_ativo_with_services()'); } catch (_) {}
  }
};

