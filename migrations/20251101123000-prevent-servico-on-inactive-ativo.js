'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const qi = queryInterface;
    const createFn = `
      CREATE OR REPLACE FUNCTION prevent_servico_in_inactive_ativo() RETURNS trigger AS $$
      BEGIN
        IF NEW."ativoId" IS NOT NULL THEN
          -- Bloqueia quando o ativo está inativo ou soft-deletado
          PERFORM 1 FROM "Ativos" a
           WHERE a.id = NEW."ativoId"
             AND (lower(coalesce(a.status, '')) = 'inativo' OR a."deletedAt" IS NOT NULL);
          IF FOUND THEN
            RAISE EXCEPTION 'Não é permitido criar/atualizar serviço para ativo desativado'
              USING ERRCODE = 'check_violation';
          END IF;
        END IF;
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;
    `;

    const createTrigInsert = `
      CREATE TRIGGER trg_servicos_prevent_inactive_ativo_ins
      BEFORE INSERT ON "Servicos"
      FOR EACH ROW
      EXECUTE FUNCTION prevent_servico_in_inactive_ativo();
    `;

    const createTrigUpdate = `
      CREATE TRIGGER trg_servicos_prevent_inactive_ativo_upd
      BEFORE UPDATE OF "ativoId" ON "Servicos"
      FOR EACH ROW
      EXECUTE FUNCTION prevent_servico_in_inactive_ativo();
    `;

    // Cria função e triggers (ignora se já existirem)
    for (const stmt of [createFn, createTrigInsert, createTrigUpdate]) {
      try { await qi.sequelize.query(stmt); } catch (_) { /* ignore */ }
    }
  },

  async down(queryInterface, Sequelize) {
    const qi = queryInterface;
    const drops = [
      'DROP TRIGGER IF EXISTS trg_servicos_prevent_inactive_ativo_ins ON "Servicos"',
      'DROP TRIGGER IF EXISTS trg_servicos_prevent_inactive_ativo_upd ON "Servicos"',
      'DROP FUNCTION IF EXISTS prevent_servico_in_inactive_ativo()'
    ];
    for (const stmt of drops) {
      try { await qi.sequelize.query(stmt); } catch (_) { /* ignore */ }
    }
  }
};

