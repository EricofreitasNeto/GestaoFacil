const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Usuario } = require('../models');
const JWT_SECRET = process.env.JWT_SECRET;

exports.register = async (req, res) => {
  try {
    const { nome, email, cargo, telefone, password, confirmPassword } = req.body;

    // Validação de senha duplicada
    if (password !== confirmPassword) {
      return res.status(400).json({ erro: "As senhas não coincidem" });
    }

    // Verifica se o e-mail já existe
    const existente = await Usuario.findOne({ where: { email } });
    if (existente) {
      return res.status(409).json({ erro: "E-mail já cadastrado" });
    }

    // Cria o usuário
    const novoUsuario = await Usuario.create({ nome, email, cargo, telefone, password });

    // Remove o campo password da resposta
    const { password: _, ...usuarioSemSenha } = novoUsuario.toJSON();
    return res.status(201).json(usuarioSemSenha);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ erro: "Erro ao registrar usuário", detalhes: error.message });
  }
};exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const usuario = await Usuario.findOne({ where: { email } });
    if (!usuario) {
      return res.status(401).json({ erro: 'Usuário não encontrado' });
    }

    const senhaValida = await usuario.validPassword(password);
    if (!senhaValida) {
      return res.status(401).json({ erro: 'Senha incorreta' });
    }

    const token = jwt.sign(
      { id: usuario.id, email: usuario.email, cargo: usuario.cargo },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    return res.status(200).json({ token });
  } catch (error) {
    console.error("Erro no login:", error);
    return res.status(500).json({ erro: 'Erro ao fazer login', detalhes: error.message });
  }
};  