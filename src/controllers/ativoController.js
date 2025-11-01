const { Ativo, Local, Cliente } = require("../models");

const ALLOWED_STATUS = ["ativo", "manutencao", "inativo"]; // valores aceitos

const ativoController = {
  // Listar todos os ativos
  async listar(req, res) {
    try {
      const ativos = await Ativo.findAll({
        include: [
          { model: Local, as: "local" },
          { model: Cliente, as: "cliente", attributes: ["id", "nome"] }
        ]
      });
      return res.status(200).json(ativos);
    } catch (error) {
      return res.status(500).json({ message: "Erro ao listar ativos", detalhes: error.message });
    }
  },

  // Buscar ativo por ID
  async buscarPorId(req, res) {
    try {
      const { id } = req.params;
      const ativo = await Ativo.findByPk(id, {
        include: [
          { model: Local, as: "local" },
          { model: Cliente, as: "cliente", attributes: ["id", "nome"] }
        ]
      });
      if (!ativo) return res.status(404).json({ message: "Ativo não encontrado" });
      return res.status(200).json(ativo);
    } catch (error) {
      return res.status(500).json({ message: "Erro ao buscar ativo", detalhes: error.message });
    }
  },

  // Criar novo ativo
  async criar(req, res) {
    try {
      const { nome, numeroSerie, status, detalhes, localId, clienteId } = req.body;

      if (status && !ALLOWED_STATUS.includes(String(status).toLowerCase())) {
        return res.status(400).json({ message: "Status inválido", detalhes: `Permitidos: ${ALLOWED_STATUS.join(', ')}` });
      }

      const novoAtivo = await Ativo.create({ nome, numeroSerie, status, detalhes, localId, clienteId });
      return res.status(201).json(novoAtivo);
    } catch (error) {
      if (error?.name === 'SequelizeUniqueConstraintError') {
        const target = (error.errors && error.errors[0]?.path) || '';
        if (String(target).toLowerCase().includes('numeroserie')) {
          return res.status(409).json({ message: "Número de série já cadastrado" });
        }
      }
      return res.status(400).json({ message: "Erro ao criar ativo", detalhes: error.message });
    }
  },

  // Atualizar ativo existente
  async atualizar(req, res) {
    try {
      const { id } = req.params;
      const { nome, numeroSerie, status, detalhes, localId, clienteId } = req.body;
      const ativo = await Ativo.findByPk(id);
      if (!ativo) return res.status(404).json({ message: "Ativo não encontrado" });

      if (status && !ALLOWED_STATUS.includes(String(status).toLowerCase())) {
        return res.status(400).json({ message: "Status inválido", detalhes: `Permitidos: ${ALLOWED_STATUS.join(', ')}` });
      }

      await ativo.update({ nome, numeroSerie, status, detalhes, localId, clienteId });
      return res.status(200).json(ativo);
    } catch (error) {
      if (error?.name === 'SequelizeUniqueConstraintError') {
        const target = (error.errors && error.errors[0]?.path) || '';
        if (String(target).toLowerCase().includes('numeroserie')) {
          return res.status(409).json({ message: "Número de série já cadastrado" });
        }
      }
      return res.status(400).json({ message: "Erro ao atualizar ativo", detalhes: error.message });
    }
  },

  // Desativar ativo (soft delete)
  async desativar(req, res) {
    try {
      const { id } = req.params;
      const ativo = await Ativo.findByPk(id);
      if (!ativo) return res.status(404).json({ message: "Ativo não encontrado" });

      await ativo.destroy(); // com paranoid: true, isso faz soft delete
      return res.status(200).json({ message: "Ativo desativado com sucesso" });
    } catch (error) {
      return res.status(500).json({ message: "Erro ao desativar ativo", detalhes: error.message });
    }
  }
};

module.exports = ativoController;

