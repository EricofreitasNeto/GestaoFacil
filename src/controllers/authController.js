const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Usuario, Cliente } = require('../models');

const PUBLIC_REGISTRATION_ROLES = (process.env.PUBLIC_REGISTRATION_ROLES || 'cliente')
  .split(',')
  .map((role) => role.trim().toLowerCase())
  .filter(Boolean);
const DEFAULT_PUBLIC_ROLE = PUBLIC_REGISTRATION_ROLES[0] || 'cliente';

exports.register = async (req, res) => {
  try {
    const { nome, email, cargo, telefone, password, confirmPassword } = req.body;

    if (password !== confirmPassword) {
      return res.status(400).json({ message: 'As senhas não coincidem' });
    }

    const existente = await Usuario.findOne({ where: { email } });
    if (existente) {
      return res.status(409).json({ message: 'E-mail já cadastrado' });
    }

    const normalizedCargo = typeof cargo === 'string' ? cargo.trim() : '';
    const cargoPermitido =
      normalizedCargo && PUBLIC_REGISTRATION_ROLES.includes(normalizedCargo.toLowerCase());

    if (normalizedCargo && !cargoPermitido) {
      return res.status(403).json({ message: 'Cargo informado não é permitido para cadastro público' });
    }

    const cargoFinal = cargoPermitido ? normalizedCargo : DEFAULT_PUBLIC_ROLE;

    const novoUsuario = await Usuario.create({ nome, email, cargo: cargoFinal, telefone, password });
    const { password: _omit, ...usuarioSemSenha } = novoUsuario.toJSON();
    return res.status(201).json(usuarioSemSenha);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Erro ao registrar usuário', detalhes: error.message });
  }
};

// Login padronizado para compatibilidade com o front
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const usuario = await Usuario.findOne({
      where: { email },
      include: [{
        model: Cliente,
        as: 'clientes',
        attributes: ['id', 'nome'],
        through: { attributes: [] }
      }]
    });
    if (!usuario) {
      return res.status(401).json({ message: 'Usuário não encontrado' });
    }

    const senhaValida = await bcrypt.compare(password, usuario.password);
    if (!senhaValida) {
      return res.status(401).json({ message: 'Senha incorreta' });
    }

    const clienteIds = Array.isArray(usuario.clientes) ? usuario.clientes.map((c) => c.id) : [];
    const payload = {
      id: usuario.id,
      nome: usuario.nome,
      email: usuario.email,
      cargo: usuario.cargo,
      clienteId: clienteIds[0] ?? null,
      clienteIds
    };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });

    return res.status(200).json({ token, user: payload, message: 'Login realizado com sucesso' });
  } catch (error) {
    console.error('Erro no login:', error);
    return res.status(500).json({ message: 'Erro ao fazer login', detalhes: error.message });
  }
};
