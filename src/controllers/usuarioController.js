const { Usuario, Cliente } = require("../models");

const usuarioAttributes = { exclude: ['password'] };
const usuarioInclude = [{ model: Cliente, as: 'cliente', attributes: ['id', 'nome'] }];

const parseNullableClienteId = (value) => {
  if (value === undefined || value === null || value === '') return null;
  const parsed = Number(value);
  if (Number.isNaN(parsed)) return NaN;
  return parsed;
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
      return res.status(200).json(usuarios);
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
      return res.status(200).json(usuario);
    } catch (error) {
      return res.status(500).json({ message: "Erro ao buscar usuário", detalhes: error.message });
    }
  },

  // Criar novo usuário
  async criar(req, res) {
    try {
      const { nome, cargo, email, telefone, password } = req.body;
      const clienteId = parseNullableClienteId(req.body?.clienteId);

      if (!nome || !cargo || !email || !password) {
        return res.status(400).json({ message: "Campos obrigatórios ausentes" });
      }

      if (Number.isNaN(clienteId)) {
        return res.status(400).json({ message: 'clienteId informado é inválido' });
      }

      if (clienteId !== null) {
        const cliente = await Cliente.findByPk(clienteId);
        if (!cliente) {
          return res.status(400).json({ message: 'Cliente informado não existe' });
        }
      }

      const novoUsuario = await Usuario.create({ nome, cargo, email, telefone, password, clienteId });
      const usuarioComRelacionamentos = await Usuario.findByPk(novoUsuario.id, {
        attributes: usuarioAttributes,
        include: usuarioInclude
      });

      return res.status(201).json(usuarioComRelacionamentos);
    } catch (error) {
      if (error?.name === 'SequelizeUniqueConstraintError') {
        return res.status(409).json({ message: 'E-mail já cadastrado' });
      }
      return res.status(500).json({ message: 'Erro ao criar usuário', detalhes: error.message });
    }
  },

  // Atualizar usuário existente
  async atualizar(req, res) {
    try {
      const { id } = req.params;
      const { nome, cargo, email, telefone } = req.body;
      const clienteId = parseNullableClienteId(req.body?.clienteId);

      if (Number.isNaN(clienteId)) {
        return res.status(400).json({ message: 'clienteId informado é inválido' });
      }

      if (clienteId !== null) {
        const cliente = await Cliente.findByPk(clienteId);
        if (!cliente) {
          return res.status(400).json({ message: 'Cliente informado não existe' });
        }
      }

      const usuario = await Usuario.findByPk(id, { attributes: usuarioAttributes });
      if (!usuario) return res.status(404).json({ message: "Usuário não encontrado" });

      await usuario.update({ nome, cargo, email, telefone, clienteId });
      const usuarioAtualizado = await Usuario.findByPk(id, {
        attributes: usuarioAttributes,
        include: usuarioInclude
      });

      return res.status(200).json(usuarioAtualizado);
    } catch (error) {
      if (error?.name === 'SequelizeUniqueConstraintError') {
        return res.status(409).json({ message: 'E-mail já cadastrado' });
      }
      return res.status(400).json({ message: "Erro ao atualizar usuário", detalhes: error.message });
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
