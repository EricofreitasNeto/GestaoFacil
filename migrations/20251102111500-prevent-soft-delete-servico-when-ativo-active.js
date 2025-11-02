'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const qi = queryInterface;
    const fn = `
      CREATE OR REPLACE FUNCTION prevent_soft_delete_servico_when_ativo_active() RETURNS trigger AS $$
      BEGIN
        IF NEW."deletedAt" IS NOT NULL AND (OLD."deletedAt" IS NULL OR NEW."deletedAt" <> OLD."deletedAt") THEN
          IF NEW."ativoId" IS NOT NULL THEN
            PERFORM 1 FROM "Ativos" a
             WHERE a.id = NEW."ativoId"
               AND (lower(coalesce(a.status,'')) <> 'inativo' OR a."deletedAt" IS NOT NULL);
            IF FOUND THEN
              RAISE EXCEPTION 'Nao e permitido excluir servico enquanto o ativo nao estiver desativado'
                USING ERRCODE = 'check_violation';
            END IF;
          END IF;
        END IF;
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;
    `;

    const trg = `
      CREATE TRIGGER trg_servicos_prevent_soft_delete_ativo_active
      BEFORE UPDATE OF "deletedAt" ON "Servicos"
      FOR EACH ROW
      WHEN (NEW."deletedAt" IS NOT NULL)
      EXECUTE FUNCTION prevent_soft_delete_servico_when_ativo_active();
    `;

    try { await qi.sequelize.query(fn); } catch (_) {}
    try { await qi.sequelize.query(trg); } catch (_) {}
  },

  async down(queryInterface, Sequelize) {
    const qi = queryInterface;
    try { await qi.sequelize.query('DROP TRIGGER IF EXISTS trg_servicos_prevent_soft_delete_ativo_active ON "Servicos"'); } catch (_) {}
    try { await qi.sequelize.query('DROP FUNCTION IF EXISTS prevent_soft_delete_servico_when_ativo_active()'); } catch (_) {}
  }
};

