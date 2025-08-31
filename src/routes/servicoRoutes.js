const express = require("express");
const router = express.Router();
const servicoController = require("../controllers/servicoController");
const authMiddleware = require('../middlewares/authMiddleware');

// Qualquer usuário autenticado pode acessar
router.get("/", authMiddleware(), servicoController.listar);
router.get("/:id", authMiddleware(), servicoController.buscarPorId);

// Apenas administradores podem modificar
router.post("/", authMiddleware(['admin']), servicoController.criar);
router.put("/:id", authMiddleware(['admin']), servicoController.atualizar);
router.delete("/:id", authMiddleware(['admin']), servicoController.desativar);

module.exports = router;