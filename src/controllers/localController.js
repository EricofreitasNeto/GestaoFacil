const { Local, Ativo } = require("../models");

const localController = {
  // Listar todos os locais
  async listar(req, res) {
    try {
      const locais = await Local.findAll({
        include: [{ model: Ativo, as: "ativos" }]
      });
      return res.status(200).json(locais);
    } catch (error) {
      return res.status(500).json({ erro: "Erro ao listar locais", detalhes: error.message });
    }
  },

  // Buscar local por ID
  async buscarPorId(req, res) {
    try {
      const { id } = req.params;
      const local = await Local.findByPk(id, {
        include: [{ model: Ativo, as: "ativos" }]
      });
      if (!local) return res.status(404).json({ erro: "Local não encontrado" });
      return res.status(200).json(local);
    } catch (error) {
      return res.status(500).json({ erro: "Erro ao buscar local", detalhes: error.message });
    }
  },

  // Criar novo local
  async criar(req, res) {
    try {
      const { nome } = req.body;
      const novoLocal = await Local.create({ nome });
      return res.status(201).json(novoLocal);
    } catch (error) {
      return res.status(400).json({ erro: "Erro ao criar local", detalhes: error.message });
    }
  },

  // Atualizar local existente
  async atualizar(req, res) {
    try {
      const { id } = req.params;
      const { nome } = req.body;
      const local = await Local.findByPk(id);
      if (!local) return res.status(404).json({ erro: "Local não encontrado" });

      await local.update({ nome });
      return res.status(200).json(local);
    } catch (error) {
      return res.status(400).json({ erro: "Erro ao atualizar local", detalhes: error.message });
    }
  },

  // Desativar local (soft delete)
  async desativar(req, res) {
    try {
      const { id } = req.params;
      const local = await Local.findByPk(id);
      if (!local) return res.status(404).json({ erro: "Local não encontrado" });

      await local.destroy(); // com paranoid: true, isso faz soft delete
      return res.status(200).json({ mensagem: "Local desativado com sucesso" });
    } catch (error) {
      return res.status(500).json({ erro: "Erro ao desativar local", detalhes: error.message });
    }
  }
};

module.exports = localController;