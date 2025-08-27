const { Ativo, Local } = require("../models");

const ativoController = {
  // Listar todos os ativos
  async listar(req, res) {
    try {
      const ativos = await Ativo.findAll({
        include: [{ model: Local, as: "local" }]
      });
      return res.status(200).json(ativos);
    } catch (error) {
      return res.status(500).json({ erro: "Erro ao listar ativos", detalhes: error.message });
    }
  },

  // Buscar ativo por ID
  async buscarPorId(req, res) {
    try {
      const { id } = req.params;
      const ativo = await Ativo.findByPk(id, {
        include: [{ model: Local, as: "local" }]
      });
      if (!ativo) return res.status(404).json({ erro: "Ativo não encontrado" });
      return res.status(200).json(ativo);
    } catch (error) {
      return res.status(500).json({ erro: "Erro ao buscar ativo", detalhes: error.message });
    }
  },

  // Criar novo ativo
  async criar(req, res) {
    try {
      const { nome, numeroSerie, status, detalhes, localId } = req.body;
      const novoAtivo = await Ativo.create({ nome, numeroSerie, status, detalhes, localId });
      return res.status(201).json(novoAtivo);
    } catch (error) {
      return res.status(400).json({ erro: "Erro ao criar ativo", detalhes: error.message });
    }
  },

  // Atualizar ativo existente
  async atualizar(req, res) {
    try {
      const { id } = req.params;
      const { nome, numeroSerie, status, detalhes, localId } = req.body;
      const ativo = await Ativo.findByPk(id);
      if (!ativo) return res.status(404).json({ erro: "Ativo não encontrado" });

      await ativo.update({ nome, numeroSerie, status, detalhes, localId });
      return res.status(200).json(ativo);
    } catch (error) {
      return res.status(400).json({ erro: "Erro ao atualizar ativo", detalhes: error.message });
    }
  },

  // Desativar ativo (soft delete)
  async desativar(req, res) {
    try {
      const { id } = req.params;
      const ativo = await Ativo.findByPk(id);
      if (!ativo) return res.status(404).json({ erro: "Ativo não encontrado" });

      await ativo.destroy(); // com paranoid: true, isso faz soft delete
      return res.status(200).json({ mensagem: "Ativo desativado com sucesso" });
    } catch (error) {
      return res.status(500).json({ erro: "Erro ao desativar ativo", detalhes: error.message });
    }
  }
};

module.exports = ativoController;