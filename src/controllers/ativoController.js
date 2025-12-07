const { Ativo, Local, Cliente, Servico } = require("../models");
const { Op } = require("sequelize");

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
      if (!ativo) return res.status(404).json({ message: "Ativo nÃ£o encontrado" });
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
        return res.status(400).json({ message: "Status invÃ¡lido", detalhes: `Permitidos: ${ALLOWED_STATUS.join(', ')}` });
      }

      // Restaura por numeroSerie se houver registro soft-deletado
      if (numeroSerie) {
        const softDeleted = await Ativo.findOne({
          where: { numeroSerie, deletedAt: { [Op.ne]: null } },
          paranoid: false
        });
        if (softDeleted) {
          await softDeleted.restore();
          await softDeleted.update({ nome, numeroSerie, status, detalhes, localId, clienteId });
          return res.status(201).json(softDeleted);
        }
      }
      const novoAtivo = await Ativo.create({ nome, numeroSerie, status, detalhes, localId, clienteId });
      return res.status(201).json(novoAtivo);
    } catch (error) {
      if (error?.name === 'SequelizeUniqueConstraintError') {
        const target = (error.errors && error.errors[0]?.path) || '';
        if (String(target).toLowerCase().includes('numeroserie')) {
          return res.status(409).json({ message: "NÃºmero de sÃ©rie jÃ¡ cadastrado" });
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
      if (!ativo) return res.status(404).json({ message: "Ativo nÃ£o encontrado" });

      if (status && !ALLOWED_STATUS.includes(String(status).toLowerCase())) {
        return res.status(400).json({ message: "Status invÃ¡lido", detalhes: `Permitidos: ${ALLOWED_STATUS.join(', ')}` });
      }

      await ativo.update({ nome, numeroSerie, status, detalhes, localId, clienteId });
      return res.status(200).json(ativo);
    } catch (error) {
      if (error?.name === 'SequelizeUniqueConstraintError') {
        const target = (error.errors && error.errors[0]?.path) || '';
        if (String(target).toLowerCase().includes('numeroserie')) {
          return res.status(409).json({ message: "NÃºmero de sÃ©rie jÃ¡ cadastrado" });
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
      if (!ativo) return res.status(404).json({ message: "Ativo nÃ£o encontrado" });

      
      // Bloqueia desativacao se houver servicos vinculados nao deletados
      const hasServicos = await require('../models').Servico.findOne({ where: { ativoId: id } });
      if (hasServicos) {
        return res.status(400).json({ message: 'Nao e permitido desativar o ativo enquanto houver servicos vinculados.' });
      }

      await ativo.destroy(); // com paranoid: true, isso faz soft delete
      return res.status(200).json({ message: "Ativo desativado com sucesso" });
    } catch (error) {
      return res.status(500).json({ message: "Erro ao desativar ativo", detalhes: error.message });
    }
  }
};

module.exports = ativoController;


