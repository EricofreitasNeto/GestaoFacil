const express = require("express");
const router = express.Router();
const tipoServicoController = require("../controllers/tipoServicoController");
const authMiddleware = require('../middlewares/authMiddleware');

// Qualquer usuário autenticado pode acessar
router.get("/", authMiddleware(), tipoServicoController.listar);
router.get("/:id", authMiddleware(), tipoServicoController.buscarPorId);

// Apenas administradores podem modificar
router.post("/", authMiddleware(['admin']), tipoServicoController.criar);
router.put("/:id", authMiddleware(['admin']), tipoServicoController.atualizar);
router.patch("/:id/desativar", authMiddleware(['admin']), tipoServicoController.desativar);
router.delete("/:id", authMiddleware(['admin']), tipoServicoController.excluir);

module.exports = router;