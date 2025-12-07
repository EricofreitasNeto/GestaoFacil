'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    const statements = [
      `
      CREATE OR REPLACE FUNCTION enforce_servico_cliente_match()
      RETURNS trigger AS $$
      DECLARE
        ativo_cliente INTEGER;
      BEGIN
        IF NEW."ativoId" IS NULL THEN
          RAISE EXCEPTION 'ativoId não pode ser nulo' USING ERRCODE = 'check_violation';
        END IF;

        SELECT "clienteId" INTO ativo_cliente FROM "Ativos"
        WHERE id = NEW."ativoId";

        IF ativo_cliente IS NULL THEN
          RAISE EXCEPTION 'Ativo informado não existe' USING ERRCODE = 'foreign_key_violation';
        END IF;

        IF NEW."clienteId" IS NULL THEN
          NEW."clienteId" = ativo_cliente;
        ELSIF NEW."clienteId" <> ativo_cliente THEN
          RAISE EXCEPTION 'Cliente não corresponde ao ativo informado'
            USING ERRCODE = 'check_violation';
        END IF;

        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;
      `,
      `
      CREATE TRIGGER trg_servicos_match_cliente_insert
      BEFORE INSERT ON "Servicos"
      FOR EACH ROW
      EXECUTE FUNCTION enforce_servico_cliente_match();
      `,
      `
      CREATE TRIGGER trg_servicos_match_cliente_update
      BEFORE UPDATE OF "clienteId", "ativoId" ON "Servicos"
      FOR EACH ROW
      EXECUTE FUNCTION enforce_servico_cliente_match();
      `
    ];

    for (const stmt of statements) {
      try {
        // eslint-disable-next-line no-await-in-loop
        await queryInterface.sequelize.query(stmt);
      } catch (error) {
        console.warn('[migration] Ignorando erro ao criar trigger enforce_servico_cliente_match:', error.message);
      }
    }
  },

  async down(queryInterface) {
    const statements = [
      'DROP TRIGGER IF EXISTS trg_servicos_match_cliente_insert ON "Servicos";',
      'DROP TRIGGER IF EXISTS trg_servicos_match_cliente_update ON "Servicos";',
      'DROP FUNCTION IF EXISTS enforce_servico_cliente_match();'
    ];

    for (const stmt of statements) {
      try {
        // eslint-disable-next-line no-await-in-loop
        await queryInterface.sequelize.query(stmt);
      } catch (error) {
        console.warn('[migration] Ignorando erro ao remover trigger enforce_servico_cliente_match:', error.message);
      }
    }
  }
};
