'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const qi = queryInterface;
    const fn = `
      CREATE OR REPLACE FUNCTION require_ativo_inativo_on_soft_delete() RETURNS trigger AS $$
      BEGIN
        IF NEW."deletedAt" IS NOT NULL AND (OLD."deletedAt" IS NULL OR NEW."deletedAt" <> OLD."deletedAt") THEN
          IF lower(coalesce(NEW.status,'')) <> 'inativo' THEN
            RAISE EXCEPTION 'Nao e permitido desativar ativo enquanto o status nao for inativo'
              USING ERRCODE = 'check_violation';
          END IF;
        END IF;
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;
    `;

    const trg = `
      CREATE TRIGGER trg_ativos_require_inativo_on_soft_delete
      BEFORE UPDATE OF "deletedAt" ON "Ativos"
      FOR EACH ROW
      WHEN (NEW."deletedAt" IS NOT NULL)
      EXECUTE FUNCTION require_ativo_inativo_on_soft_delete();
    `;

    try { await qi.sequelize.query(fn); } catch (_) {}
    try { await qi.sequelize.query(trg); } catch (_) {}
  },

  async down(queryInterface, Sequelize) {
    const qi = queryInterface;
    try { await qi.sequelize.query('DROP TRIGGER IF EXISTS trg_ativos_require_inativo_on_soft_delete ON "Ativos"'); } catch (_) {}
    try { await qi.sequelize.query('DROP FUNCTION IF EXISTS require_ativo_inativo_on_soft_delete()'); } catch (_) {}
  }
};

