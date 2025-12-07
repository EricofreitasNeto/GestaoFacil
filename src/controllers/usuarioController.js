const { Usuario, Cliente } = require("../models");
const { normalizeClienteIds } = require("../utils/accessControl");

const STATUS_VALUES = ['pending', 'approved', 'rejected'];
const resolveStatus = (value, fallback) => {
  if (value === undefined || value === null || value === '') return fallback;
  const normalized = String(value).trim().toLowerCase();
  if (!STATUS_VALUES.includes(normalized)) {
    const error = new Error('Status informado é inválido');
    error.statusCode = 400;
    throw error;
  }
  return normalized;
};

const usuarioAttributes = { exclude: ['password'] };
const usuarioInclude = [{
  model: Cliente,
  as: 'clientes',
  attributes: ['id', 'nome'],
  through: { attributes: [] }
}];

const formatUsuario = (usuario) => {
  if (!usuario) return null;
  const plain = usuario.toJSON();
  plain.clienteIds = Array.isArray(plain.clientes) ? plain.clientes.map((c) => c.id) : [];
  return plain;
};

const usuarioController = {
  // Listar todos os usuários ativos
  async listar(req, res) {
    try {
      const usuarios = await Usuario.findAll({
        attributes: usuarioAttributes,
        include: usuarioInclude,
        order: [['nome', 'ASC']]
      });
      return res.status(200).json(usuarios.map(formatUsuario));
    } catch (error) {
      return res.status(500).json({ message: "Erro ao listar usuários", detalhes: error.message });
    }
  },

  // Buscar usuário por ID
  async buscarPorId(req, res) {
    try {
      const { id } = req.params;
      const usuario = await Usuario.findByPk(id, {
        attributes: usuarioAttributes,
        include: usuarioInclude
      });
      if (!usuario) return res.status(404).json({ message: "Usuário não encontrado" });
      return res.status(200).json(formatUsuario(usuario));
    } catch (error) {
      return res.status(500).json({ message: "Erro ao buscar usuário", detalhes: error.message });
    }
  },

  // Criar novo usuário
  async criar(req, res) {
    try {
      const { nome, cargo, email, telefone, password } = req.body;
      const clienteIds = normalizeClienteIds(req.body?.clienteIds ?? req.body?.clienteId);
      const status = resolveStatus(req.body?.status, 'approved');

      if (!nome || !cargo || !email || !password) {
        return res.status(400).json({ message: "Campos obrigatórios ausentes" });
      }

      if (clienteIds.length) {
        const clientes = await Cliente.findAll({ where: { id: clienteIds } });
        if (clientes.length !== clienteIds.length) {
          return res.status(400).json({ message: 'Um ou mais clientes informados não existem' });
        }
      }

      const novoUsuario = await Usuario.create({ nome, cargo, email, telefone, password, status });
      if (clienteIds.length) {
        await novoUsuario.setClientes(clienteIds);
      }
      const usuarioComRelacionamentos = await Usuario.findByPk(novoUsuario.id, {
        attributes: usuarioAttributes,
        include: usuarioInclude
      });

      return res.status(201).json(formatUsuario(usuarioComRelacionamentos));
    } catch (error) {
      if (error?.name === 'SequelizeUniqueConstraintError') {
        return res.status(409).json({ message: 'E-mail já cadastrado' });
      }
      if (error?.statusCode) {
        return res.status(error.statusCode).json({ message: error.message });
      }
      return res.status(500).json({ message: 'Erro ao criar usuário', detalhes: error.message });
    }
  },

  // Atualizar usuário existente
  async atualizar(req, res) {
    try {
      const { id } = req.params;
      const { nome, cargo, email, telefone } = req.body;
      const clienteIds = normalizeClienteIds(req.body?.clienteIds ?? req.body?.clienteId);
      const status = resolveStatus(req.body?.status, null);

      if (clienteIds.length) {
        const clientes = await Cliente.findAll({ where: { id: clienteIds } });
        if (clientes.length !== clienteIds.length) {
          return res.status(400).json({ message: 'Um ou mais clientes informados não existem' });
        }
      }

      const usuario = await Usuario.findByPk(id, { attributes: usuarioAttributes });
      if (!usuario) return res.status(404).json({ message: "Usuário não encontrado" });

      const updatePayload = {};
      if (nome !== undefined) updatePayload.nome = nome;
      if (cargo !== undefined) updatePayload.cargo = cargo;
      if (email !== undefined) updatePayload.email = email;
      if (telefone !== undefined) updatePayload.telefone = telefone;
      if (status) updatePayload.status = status;

      await usuario.update(updatePayload);
      if (req.body?.clienteIds !== undefined || req.body?.clienteId !== undefined) {
        await usuario.setClientes(clienteIds);
      }
      const usuarioAtualizado = await Usuario.findByPk(id, {
        attributes: usuarioAttributes,
        include: usuarioInclude
      });

      return res.status(200).json(formatUsuario(usuarioAtualizado));
    } catch (error) {
      if (error?.name === 'SequelizeUniqueConstraintError') {
        return res.status(409).json({ message: 'E-mail já cadastrado' });
      }
      const statusCode = error?.statusCode || 400;
      return res.status(statusCode).json({ message: "Erro ao atualizar usuário", detalhes: error.message });
    }
  },

  // Desativar usuário (soft delete)
  async desativar(req, res) {
    try {
      const { id } = req.params;
      const usuario = await Usuario.findByPk(id, { attributes: usuarioAttributes });
      if (!usuario) return res.status(404).json({ message: "Usuário não encontrado" });

      await usuario.destroy();
      return res.status(200).json({ mensagem: "Usuário desativado com sucesso" });
    } catch (error) {
      return res.status(500).json({ message: "Erro ao desativar usuário", detalhes: error.message });
    }
  }
};

module.exports = usuarioController;
