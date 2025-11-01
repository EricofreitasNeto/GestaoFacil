const { Cliente } = require("../models");
const { Op } = require("sequelize");

const clienteController = {
  // Listar todos os clientes ativos
  async listar(req, res) {
    try {
      const clientes = await Cliente.findAll();
      return res.status(200).json(clientes);
    } catch (error) {
      return res.status(500).json({ message: "Erro ao listar clientes", detalhes: error.message });
    }
  },

  // Buscar cliente por ID
  async buscarPorId(req, res) {
    try {
      const { id } = req.params;
      const cliente = await Cliente.findByPk(id);
      if (!cliente) return res.status(404).json({ message: "Cliente não encontrado" });
      return res.status(200).json(cliente);
    } catch (error) {
      return res.status(500).json({ message: "Erro ao buscar cliente", detalhes: error.message });
    }
  },

  // Criar novo cliente
  async criar(req, res) {
    try {
      const { nome, cnpj, contatos } = req.body;
      // Soft-deleted restore logic
      const whereOr = [{ nome }];
      if (cnpj) whereOr.push({ cnpj });
      const softDeleted = await Cliente.findOne({ where: { [Op.or]: whereOr, deletedAt: { [Op.ne]: null } }, paranoid: false });
      if (softDeleted) {
        await softDeleted.restore();
        await softDeleted.update({ nome, cnpj, contatos });
        return res.status(201).json(softDeleted);
      }

      const novoCliente = await Cliente.create({ nome, cnpj, contatos });
      return res.status(201).json(novoCliente);
    } catch (error) {
      if (error?.name === 'SequelizeUniqueConstraintError') {
        const target = (error.errors && error.errors[0]?.path) || '';
        if (String(target).toLowerCase().includes('nome')) {
          return res.status(409).json({ message: 'Nome de cliente já cadastrado' });
        }
        if (String(target).toLowerCase().includes('cnpj')) {
          return res.status(409).json({ message: 'CNPJ já cadastrado' });
        }
        return res.status(409).json({ message: 'Registro já existe' });
      }
      return res.status(400).json({ message: "Erro ao criar cliente", detalhes: error.message });
    }
  },

  // Atualizar cliente existente
  async atualizar(req, res) {
    try {
      const { id } = req.params;
      const { nome, cnpj, contatos } = req.body;
      const cliente = await Cliente.findByPk(id);
      if (!cliente) return res.status(404).json({ message: "Cliente não encontrado" });

      await cliente.update({ nome, cnpj, contatos });
      return res.status(200).json(cliente);
    } catch (error) {
      if (error?.name === 'SequelizeUniqueConstraintError') {
        const target = (error.errors && error.errors[0]?.path) || '';
        if (String(target).toLowerCase().includes('nome')) {
          return res.status(409).json({ message: 'Nome de cliente já cadastrado' });
        }
        if (String(target).toLowerCase().includes('cnpj')) {
          return res.status(409).json({ message: 'CNPJ já cadastrado' });
        }
        return res.status(409).json({ message: 'Registro já existe' });
      }
      return res.status(400).json({ message: "Erro ao atualizar cliente", detalhes: error.message });
    }
  },

  // Desativar cliente (soft delete)
  async desativar(req, res) {
    try {
      const { id } = req.params;
      const cliente = await Cliente.findByPk(id);
      if (!cliente) return res.status(404).json({ message: "Cliente não encontrado" });

      await cliente.destroy(); // com paranoid: true, isso faz soft delete
      return res.status(200).json({ message: "Cliente desativado com sucesso" });
    } catch (error) {
      return res.status(500).json({ message: "Erro ao desativar cliente", detalhes: error.message });
    }
  }
};

module.exports = clienteController;


