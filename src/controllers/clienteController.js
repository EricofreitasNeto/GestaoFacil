const { Cliente } = require("../models");

const clienteController = {
  // Listar todos os clientes ativos
  async listar(req, res) {
    try {
      const clientes = await Cliente.findAll();
      return res.status(200).json(clientes);
    } catch (error) {
      return res.status(500).json({ erro: "Erro ao listar clientes", detalhes: error.message });
    }
  },

  // Buscar cliente por ID
  async buscarPorId(req, res) {
    try {
      const { id } = req.params;
      const cliente = await Cliente.findByPk(id);
      if (!cliente) return res.status(404).json({ erro: "Cliente não encontrado" });
      return res.status(200).json(cliente);
    } catch (error) {
      return res.status(500).json({ erro: "Erro ao buscar cliente", detalhes: error.message });
    }
  },

  // Criar novo cliente
  async criar(req, res) {
    try {
      const { nome, cnpj, contatos } = req.body;
      const novoCliente = await Cliente.create({ nome, cnpj, contatos });
      return res.status(201).json(novoCliente);
    } catch (error) {
      return res.status(400).json({ erro: "Erro ao criar cliente", detalhes: error.message });
    }
  },

  // Atualizar cliente existente
  async atualizar(req, res) {
    try {
      const { id } = req.params;
      const { nome, cnpj, contatos } = req.body;
      const cliente = await Cliente.findByPk(id);
      if (!cliente) return res.status(404).json({ erro: "Cliente não encontrado" });

      await cliente.update({ nome, cnpj, contatos });
      return res.status(200).json(cliente);
    } catch (error) {
      return res.status(400).json({ erro: "Erro ao atualizar cliente", detalhes: error.message });
    }
  },

  // Desativar cliente (soft delete)
  async desativar(req, res) {
    try {
      const { id } = req.params;
      const cliente = await Cliente.findByPk(id);
      if (!cliente) return res.status(404).json({ erro: "Cliente não encontrado" });

      await cliente.destroy(); // com paranoid: true, isso faz soft delete
      return res.status(200).json({ mensagem: "Cliente desativado com sucesso" });
    } catch (error) {
      return res.status(500).json({ erro: "Erro ao desativar cliente", detalhes: error.message });
    }
  }
};

module.exports = clienteController;