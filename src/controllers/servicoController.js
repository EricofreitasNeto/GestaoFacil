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
      return res.status(500).json({ erro: "Erro ao listar serviços", detalhes: error.message });
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
      if (!servico) return res.status(404).json({ erro: "Serviço não encontrado" });
      return res.status(200).json(servico);
    } catch (error) {
      return res.status(500).json({ erro: "Erro ao buscar serviço", detalhes: error.message });
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
      return res.status(400).json({ erro: "Erro ao criar serviço", detalhes: error.message });
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
      if (!servico) return res.status(404).json({ erro: "Serviço não encontrado" });

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
      return res.status(400).json({ erro: "Erro ao atualizar serviço", detalhes: error.message });
    }
  },

  // Desativar serviço (soft delete)
  async desativar(req, res) {
    try {
      const { id } = req.params;
      const servico = await Servico.findByPk(id);
      if (!servico) return res.status(404).json({ erro: "Serviço não encontrado" });

      await servico.destroy(); // com paranoid: true, isso faz soft delete
      return res.status(200).json({ mensagem: "Serviço desativado com sucesso" });
    } catch (error) {
      return res.status(500).json({ erro: "Erro ao desativar serviço", detalhes: error.message });
    }
  }
};

module.exports = servicoController;