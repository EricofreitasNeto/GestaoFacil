const express = require("express");
const router = express.Router();
const usuarioController = require("../controllers/usuarioController");
const authMiddleware = require('../middlewares/authMiddleware');

// Apenas administradores podem criar, atualizar e deletar usuários
router.post("/", authMiddleware(['admin']), usuarioController.criar);
router.put("/:id", authMiddleware(['admin']), usuarioController.atualizar);
router.delete("/:id", authMiddleware(['admin']), usuarioController.desativar);

// Qualquer usuário autenticado pode listar e buscar
router.get("/", authMiddleware(), usuarioController.listar);
router.get("/:id", authMiddleware(), usuarioController.buscarPorId);

module.exports = router;

