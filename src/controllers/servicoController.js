const { Servico, Cliente, Usuario, Ativo, TipoServico } = require("../models");

const servicoController = {
  // Listar todos os serviços com seus relacionamentos
  async listar(req, res) {
    try {
      const servicos = await Servico.findAll({
        include: [
          { model: Cliente, as: "cliente" },
          { model: Usuario, as: "responsavel" },
          { model: Ativo, as: "ativo" },
          { model: TipoServico, as: "tipoServico" }
        ]
      });
      return res.status(200).json(servicos);
    } catch (error) {
      return res.status(500).json({ message: "Erro ao listar serviços", detalhes: error.message });
    }
  },

  // Buscar serviço por ID
  async buscarPorId(req, res) {
    try {
      const { id } = req.params;
      const servico = await Servico.findByPk(id, {
        include: [
          { model: Cliente, as: "cliente" },
          { model: Usuario, as: "responsavel" },
          { model: Ativo, as: "ativo" },
          { model: TipoServico, as: "tipoServico" }
        ]
      });
      if (!servico) return res.status(404).json({ message: "Serviço não encontrado" });
      return res.status(200).json(servico);
    } catch (error) {
      return res.status(500).json({ message: "Erro ao buscar serviço", detalhes: error.message });
    }
  },

  // Criar novo serviço
  async criar(req, res) {
    try {
      const {
        descricao,
        status,
        dataAgendada,
        dataConclusao,
        detalhes,
        clienteId,
        usuarioId,
        ativoId,
        tipoServicoId
      } = req.body;

      // Validação: não permitir criar serviço para ativo inativo ou soft-deletado
      if (ativoId) {
        const ativo = await Ativo.findByPk(ativoId, { paranoid: false, attributes: ['id', 'status', 'deletedAt'] });
        if (!ativo) {
          return res.status(400).json({ message: 'Ativo informado é inválido' });
        }
        const st = String(ativo.status || '').toLowerCase();
        if (ativo.deletedAt || st === 'inativo') {
          return res.status(400).json({ message: 'Não é permitido criar serviço para ativo desativado' });
        }
      }

      const novoServico = await Servico.create({
        descricao,
        status,
        dataAgendada,
        dataConclusao,
        detalhes,
        clienteId,
        usuarioId,
        ativoId,
        tipoServicoId
      });

      return res.status(201).json(novoServico);
    } catch (error) {
      return res.status(400).json({ message: "Erro ao criar serviço", detalhes: error.message });
    }
  },

  // Atualizar serviço existente
  async atualizar(req, res) {
    try {
      const { id } = req.params;
      const {
        descricao,
        status,
        dataAgendada,
        dataConclusao,
        detalhes,
        clienteId,
        usuarioId,
        ativoId,
        tipoServicoId
      } = req.body;

      const servico = await Servico.findByPk(id);
      if (!servico) return res.status(404).json({ message: "Serviço não encontrado" });

      // Validação: se ativoId foi informado, não permitir apontar para ativo inativo/soft-deletado
      if (typeof ativoId !== 'undefined' && ativoId !== null) {
        const ativo = await Ativo.findByPk(ativoId, { paranoid: false, attributes: ['id', 'status', 'deletedAt'] });
        if (!ativo) {
          return res.status(400).json({ message: 'Ativo informado é inválido' });
        }
        const st = String(ativo.status || '').toLowerCase();
        if (ativo.deletedAt || st === 'inativo') {
          return res.status(400).json({ message: 'Não é permitido atualizar serviço para ativo desativado' });
        }
      }

      await servico.update({
        descricao,
        status,
        dataAgendada,
        dataConclusao,
        detalhes,
        clienteId,
        usuarioId,
        ativoId,
        tipoServicoId
      });

      return res.status(200).json(servico);
    } catch (error) {
      return res.status(400).json({ message: "Erro ao atualizar serviço", detalhes: error.message });
    }
  },

  // Desativar serviço (soft delete)
  async desativar(req, res) {
    try {
      const { id } = req.params;
      const servico = await Servico.findByPk(id);
      if (!servico) return res.status(404).json({ message: "Serviço não encontrado" });

      await servico.destroy(); // com paranoid: true, isso faz soft delete
      return res.status(200).json({ message: "Serviço desativado com sucesso" });
    } catch (error) {
      return res.status(500).json({ message: "Erro ao desativar serviço", detalhes: error.message });
    }
  },

  // Criar novo serviço usando função do banco (create_servico)
  async criarDb(req, res) {
    try {
      const {
        descricao,
        status,
        dataAgendada,
        detalhes,
        clienteId,
        usuarioId,
        ativoId,
        tipoServicoId
      } = req.body;

      if (!descricao || !ativoId) {
        return res.status(400).json({ message: 'Campos obrigatórios: descricao, ativoId' });
      }

      let detalhesValue = detalhes;
      if (detalhes && typeof detalhes === 'object') {
        try { detalhesValue = JSON.stringify(detalhes); } catch (_) { detalhesValue = '{}'; }
      }

      const { sequelize } = require('../models');
      const rows = await sequelize.query(
        `SELECT create_servico(:descricao, :ativoId, :status, :clienteId, :usuarioId, :tipoServicoId, :dataAgendada, :detalhes) AS id`,
        {
          replacements: {
            descricao,
            ativoId,
            status: status || 'pendente',
            clienteId: Number.isInteger(clienteId) ? clienteId : null,
            usuarioId: Number.isInteger(usuarioId) ? usuarioId : null,
            tipoServicoId: Number.isInteger(tipoServicoId) ? tipoServicoId : null,
            dataAgendada: dataAgendada || null,
            detalhes: detalhesValue || '{}'
          },
          type: sequelize.QueryTypes.SELECT
        }
      );

      const servicoId = rows[0]?.id ?? rows.id;
      const criado = await Servico.findByPk(servicoId, {
        include: [
          { model: Cliente, as: 'cliente' },
          { model: Usuario, as: 'responsavel' },
          { model: Ativo, as: 'ativo' },
          { model: TipoServico, as: 'tipoServico' }
        ]
      });
      return res.status(201).json(criado);
    } catch (error) {
      return res.status(400).json({ message: 'Erro ao criar serviço (DB)', detalhes: error.message });
    }
  }
};

module.exports = servicoController;


