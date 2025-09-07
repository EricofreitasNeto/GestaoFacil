/**
 * @swagger
 * /auth/register:
 *   post:
 *     tags: [Autenticação]
 *     summary: Registra um novo usuário
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nome
 *               - email
 *               - cargo
 *               - telefone
 *               - password
 *               - confirmPassword
 *             properties:
 *               nome:
 *                 type: string
 *               email:
 *                 type: string
 *               cargo:
 *                 type: string
 *               telefone:
 *                 type: string
 *               password:
 *                 type: string
 *               confirmPassword:
 *                 type: string
 *     responses:
 *       201:
 *         description: Usuário registrado
 *       400:
 *         description: Senhas não coincidem
 *       409:
 *         description: E-mail já cadastrado
 */

/**
 * @swagger
 * /auth/login:
 *   post:
 *     tags: [Autenticação]
 *     summary: Realiza login e retorna token JWT
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login realizado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                   description: JWT para autenticação nas rotas protegidas
 *       401:
 *         description: Usuário não encontrado ou senha incorreta
 */

/**
 * @swagger
 * /auth/dados-secretos:
 *   post:
 *     tags: [Autenticação]
 *     summary: Retorna dados protegidos (JWT necessário)
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dados protegidos retornados
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Acesso autorizado, erico@teste.com
 *       401:
 *         description: Token inválido ou ausente
 *       403:
 *         description: Cargo não autorizado
 */

/**
 * @swagger
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 */

const express = require('express');
const router = express.Router();
const { register, login } = require('../controllers/authController');
const authMiddleware = require('../middlewares/authMiddleware');
const fetch = require('node-fetch'); // Se estiver usando Node.js < 18

// Rota protegida para teste
router.post('/dados-secretos', authMiddleware(), (req, res) => {
  res.json({ message: `Acesso autorizado, ${req.user.email}` });
});

// Rotas públicas
router.post('/register', register);
router.post('/login', login);

// 🔗 Rota de proxy para registro externo
router.post('/proxy/register', async (req, res) => {
  try {
    const response = await fetch('https://api.externa.com/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req.body)
    });

    const data = await response.json();
    res.status(response.status).json(data);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao conectar com a API externa.' });
  }
});

module.exports = router;
