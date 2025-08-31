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