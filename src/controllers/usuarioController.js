const { Usuario } = require("../models");

const usuarioController = {
  // Listar todos os usuários ativos
  async listar(req, res) {
    try {
      const usuarios = await Usuario.findAll({ attributes: { exclude: ['password'] } });
      return res.status(200).json(usuarios);
    } catch (error) {
      return res.status(500).json({ message: "Erro ao listar usuários", detalhes: error.message });
    }
  },

  // Buscar usuário por ID
  async buscarPorId(req, res) {
    try {
      const { id } = req.params;
      const usuario = await Usuario.findByPk(id, { attributes: { exclude: ['password'] } });
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

      // Validação básica
      if (!nome || !cargo || !email || !password) {
        return res.status(400).json({ message: "Campos obrigatórios ausentes" });
      }

      // Cria usuário com senha criptografada (via hook no modelo)
      const novoUsuario = await Usuario.create({ nome, cargo, email, telefone, password });

      // Remove o campo password da resposta
      const { password: _, ...usuarioSemSenha } = novoUsuario.toJSON();
      return res.status(201).json(usuarioSemSenha);
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
      const usuario = await Usuario.findByPk(id, { attributes: { exclude: ['password'] } });
      if (!usuario) return res.status(404).json({ message: "Usuário não encontrado" });

      await usuario.update({ nome, cargo, email, telefone });
      return res.status(200).json(usuario);
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
      const usuario = await Usuario.findByPk(id, { attributes: { exclude: ['password'] } });
      if (!usuario) return res.status(404).json({ message: "Usuário não encontrado" });

      await usuario.destroy(); // com paranoid: true, isso faz soft delete
      return res.status(200).json({ mensagem: "Usuário desativado com sucesso" });
    } catch (error) {
      return res.status(500).json({ message: "Erro ao desativar usuário", detalhes: error.message });
    }
  }
};

module.exports = usuarioController;

