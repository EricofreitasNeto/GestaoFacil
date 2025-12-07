'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('Usuarios', 'clienteId', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'clientes',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
    });

    await queryInterface.addIndex('Usuarios', ['clienteId'], {
      name: 'idx_usuarios_clienteId'
    });

    const enhanceCreateServicoFn = `
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
        v_usuario_cliente INTEGER;
        v_id INTEGER;
      BEGIN
        IF coalesce(trim(p_descricao), '') = '' THEN
          RAISE EXCEPTION 'Descricao e obrigatoria' USING ERRCODE = 'not_null_violation';
        END IF;

        PERFORM 1 FROM "Ativos" a WHERE a.id = p_ativo_id AND a."deletedAt" IS NULL;
        IF NOT FOUND THEN
          RAISE EXCEPTION 'Ativo % inexistente ou excluido', p_ativo_id USING ERRCODE = 'foreign_key_violation';
        END IF;

        PERFORM 1 FROM "Ativos" a WHERE a.id = p_ativo_id AND lower(coalesce(a.status,'')) = 'inativo';
        IF FOUND THEN
          RAISE EXCEPTION 'Nao e permitido criar servico para ativo desativado' USING ERRCODE = 'check_violation';
        END IF;

        SELECT a."clienteId" INTO v_cliente_id FROM "Ativos" a WHERE a.id = p_ativo_id;
        IF p_cliente_id IS NOT NULL AND p_cliente_id <> v_cliente_id THEN
          RAISE EXCEPTION 'Cliente informado (%) difere do cliente do ativo (%)', p_cliente_id, v_cliente_id USING ERRCODE = 'check_violation';
        END IF;

        IF p_usuario_id IS NOT NULL THEN
          SELECT u."clienteId" INTO v_usuario_cliente
          FROM "Usuarios" u
          WHERE u.id = p_usuario_id AND u."deletedAt" IS NULL;

          IF NOT FOUND THEN
            RAISE EXCEPTION 'Usuario % inexistente ou excluido', p_usuario_id USING ERRCODE = 'foreign_key_violation';
          END IF;

          IF v_usuario_cliente IS NOT NULL AND v_usuario_cliente <> v_cliente_id THEN
            RAISE EXCEPTION 'Usuario informado nao pertence ao cliente do ativo' USING ERRCODE = 'check_violation';
          END IF;
        END IF;

        IF p_tipo_servico_id IS NOT NULL THEN
          PERFORM 1 FROM "TipoServicos" t WHERE t.id = p_tipo_servico_id AND t."deletedAt" IS NULL;
          IF NOT FOUND THEN
            RAISE EXCEPTION 'Tipo de servico % inexistente ou excluido', p_tipo_servico_id USING ERRCODE = 'foreign_key_violation';
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

    await queryInterface.sequelize.query(enhanceCreateServicoFn);
  },

  async down(queryInterface) {
    const revertCreateServicoFn = `
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
          RAISE EXCEPTION 'Descricao e obrigatoria' USING ERRCODE = 'not_null_violation';
        END IF;

        PERFORM 1 FROM "Ativos" a WHERE a.id = p_ativo_id AND a."deletedAt" IS NULL;
        IF NOT FOUND THEN
          RAISE EXCEPTION 'Ativo % inexistente ou excluido', p_ativo_id USING ERRCODE = 'foreign_key_violation';
        END IF;

        PERFORM 1 FROM "Ativos" a WHERE a.id = p_ativo_id AND lower(coalesce(a.status,'')) = 'inativo';
        IF FOUND THEN
          RAISE EXCEPTION 'Nao e permitido criar servico para ativo desativado' USING ERRCODE = 'check_violation';
        END IF;

        SELECT a."clienteId" INTO v_cliente_id FROM "Ativos" a WHERE a.id = p_ativo_id;
        IF p_cliente_id IS NOT NULL AND p_cliente_id <> v_cliente_id THEN
          RAISE EXCEPTION 'Cliente informado (%) difere do cliente do ativo (%)', p_cliente_id, v_cliente_id USING ERRCODE = 'check_violation';
        END IF;

        IF p_usuario_id IS NOT NULL THEN
          PERFORM 1 FROM "Usuarios" u WHERE u.id = p_usuario_id AND u."deletedAt" IS NULL;
          IF NOT FOUND THEN
            RAISE EXCEPTION 'Usuario % inexistente ou excluido', p_usuario_id USING ERRCODE = 'foreign_key_violation';
          END IF;
        END IF;

        IF p_tipo_servico_id IS NOT NULL THEN
          PERFORM 1 FROM "TipoServicos" t WHERE t.id = p_tipo_servico_id AND t."deletedAt" IS NULL;
          IF NOT FOUND THEN
            RAISE EXCEPTION 'Tipo de servico % inexistente ou excluido', p_tipo_servico_id USING ERRCODE = 'foreign_key_violation';
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

    await queryInterface.removeIndex('Usuarios', 'idx_usuarios_clienteId');
    await queryInterface.removeColumn('Usuarios', 'clienteId');
    await queryInterface.sequelize.query(revertCreateServicoFn);
  }
};
