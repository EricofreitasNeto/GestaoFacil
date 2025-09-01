const express = require("express");
const router = express.Router();
const clienteController = require("../controllers/clienteController");
const authMiddleware = require('../middlewares/authMiddleware');

// Qualquer usuário autenticado pode acessar
router.get("/", authMiddleware(), clienteController.listar);
router.get("/:id", authMiddleware(), clienteController.buscarPorId);

// Apenas administradores podem modificar////
router.post("/", authMiddleware(['admin']), clienteController.criar);
router.put("/:id", authMiddleware(['admin']), clienteController.atualizar);
router.delete("/:id", authMiddleware(['admin']), clienteController.desativar);

module.exports = router;