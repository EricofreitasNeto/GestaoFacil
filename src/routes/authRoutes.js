/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Registra um novo usuário
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
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
 *     summary: Realiza login e retorna token JWT
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login realizado com sucesso
 *       401:
 *         description: Usuário não encontrado ou senha incorreta
 */
/**
 * @swagger
 * /auth/dados-secretos:
 *   post:
 *     summary: Retorna dados protegidos (JWT necessário)
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dados protegidos retornados
 *       401:
 *         description: Token inválido ou ausente
 *       403:
 *         description: Cargo não autorizado
 */
const express = require('express');
const router = express.Router();
const { register, login } = require('../controllers/authController');
const authMiddleware = require('../middlewares/authMiddleware');

// Rota protegida para teste
router.post('/dados-secretos', authMiddleware(), (req, res) => {
  res.json({ message: `Acesso autorizado, ${req.user.email}` });
});

// Rotas públicas
router.post('/register', register);
router.post('/login', login);

module.exports = router;