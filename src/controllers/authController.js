const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Usuario, Cliente } = require('../models');

const DEFAULT_PENDING_ROLE = process.env.DEFAULT_PENDING_ROLE || 'aguardando';

exports.register = async (req, res) => {
  try {
    const { nome, email, telefone, password, confirmPassword } = req.body;

    if (password !== confirmPassword) {
      return res.status(400).json({ message: 'As senhas não coincidem' });
    }

    const existente = await Usuario.findOne({ where: { email } });
    if (existente) {
      return res.status(409).json({ message: 'E-mail já cadastrado' });
    }

    const novoUsuario = await Usuario.create({
      nome,
      email,
      cargo: DEFAULT_PENDING_ROLE,
      telefone,
      password,
      status: 'pending'
    });
    const { password: _omit, ...usuarioSemSenha } = novoUsuario.toJSON();
    return res.status(201).json({
      ...usuarioSemSenha,
      message: 'Cadastro recebido. Aguarde aprovação do administrador.'
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Erro ao registrar usuário', detalhes: error.message });
  }
};

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

    if (String(usuario.status || '').toLowerCase() !== 'approved') {
      return res.status(403).json({
        message: usuario.status === 'rejected'
          ? 'Cadastro rejeitado. Entre em contato com o administrador.'
          : 'Cadastro ainda não aprovado. Aguarde a análise do administrador.'
      });
    }

    const clienteIds = Array.isArray(usuario.clientes) ? usuario.clientes.map((c) => c.id) : [];
    const payload = {
      id: usuario.id,
      nome: usuario.nome,
      email: usuario.email,
      cargo: usuario.cargo,
      status: usuario.status,
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
