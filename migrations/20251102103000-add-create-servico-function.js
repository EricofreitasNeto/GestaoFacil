'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const qi = queryInterface;
    const createFn = `
      CREATE OR REPLACE FUNCTION create_servico(
        p_descricao TEXT,
        p_ativo_id INTEGER,
        p_status TEXT DEFAULT 'pendente',
        p_cliente_id INTEGER DEFAULT NULL,
        p_usuario_id INTEGER DEFAULT NULL,
        p_tipo_servico_id INTEGER DEFAULT NULL,
        p_data_agendada TIMESTAMPTZ DEFAULT NULL,
        p_detalhes JSONB DEFAULT '{}'::jsonb
      ) RETURNS INTEGER AS $$
      DECLARE
        v_cliente_id INTEGER;
        v_id INTEGER;
      BEGIN
        IF coalesce(trim(p_descricao), '') = '' THEN
          RAISE EXCEPTION 'Descrição é obrigatória' USING ERRCODE = 'not_null_violation';
        END IF;

        -- Valida ativo existente e não soft-deletado
        PERFORM 1 FROM "Ativos" a WHERE a.id = p_ativo_id AND a."deletedAt" IS NULL;
        IF NOT FOUND THEN
          RAISE EXCEPTION 'Ativo % inexistente ou excluído', p_ativo_id USING ERRCODE = 'foreign_key_violation';
        END IF;

        -- Bloqueia ativo inativo (reforço ao trigger)
        PERFORM 1 FROM "Ativos" a WHERE a.id = p_ativo_id AND lower(coalesce(a.status,'')) = 'inativo';
        IF FOUND THEN
          RAISE EXCEPTION 'Não é permitido criar serviço para ativo desativado' USING ERRCODE = 'check_violation';
        END IF;

        -- Determina cliente a partir do ativo e valida coerência
        SELECT a."clienteId" INTO v_cliente_id FROM "Ativos" a WHERE a.id = p_ativo_id;
        IF p_cliente_id IS NOT NULL AND p_cliente_id <> v_cliente_id THEN
          RAISE EXCEPTION 'Cliente informado (%) difere do cliente do ativo (%)', p_cliente_id, v_cliente_id USING ERRCODE = 'check_violation';
        END IF;

        -- Valida usuário (se informado)
        IF p_usuario_id IS NOT NULL THEN
          PERFORM 1 FROM "Usuarios" u WHERE u.id = p_usuario_id AND u."deletedAt" IS NULL;
          IF NOT FOUND THEN
            RAISE EXCEPTION 'Usuário % inexistente ou excluído', p_usuario_id USING ERRCODE = 'foreign_key_violation';
          END IF;
        END IF;

        -- Valida tipo de serviço (se informado)
        IF p_tipo_servico_id IS NOT NULL THEN
          PERFORM 1 FROM "TipoServicos" t WHERE t.id = p_tipo_servico_id AND t."deletedAt" IS NULL;
          IF NOT FOUND THEN
            RAISE EXCEPTION 'Tipo de serviço % inexistente ou excluído', p_tipo_servico_id USING ERRCODE = 'foreign_key_violation';
          END IF;
        END IF;

        INSERT INTO "Servicos"(
          descricao, status, "clienteId", "usuarioId", "ativoId", "tipoServicoId",
          "dataAgendada", "dataConclusao", detalhes, "createdAt", "updatedAt"
        ) VALUES (
          p_descricao, coalesce(p_status, 'pendente'), v_cliente_id, p_usuario_id, p_ativo_id, p_tipo_servico_id,
          p_data_agendada, NULL, coalesce(p_detalhes, '{}'::jsonb), NOW(), NOW()
        ) RETURNING id INTO v_id;

        RETURN v_id;
      END;
      $$ LANGUAGE plpgsql;
    `;

    await qi.sequelize.query(createFn);
  },

  async down(queryInterface, Sequelize) {
    const qi = queryInterface;
    await qi.sequelize.query('DROP FUNCTION IF EXISTS create_servico(TEXT, INTEGER, TEXT, INTEGER, INTEGER, INTEGER, TIMESTAMPTZ, JSONB)');
  }
};
