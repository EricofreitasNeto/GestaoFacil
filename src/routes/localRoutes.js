const express = require("express");
const router = express.Router();
const localController = require("../controllers/localController");
const authMiddleware = require('../middlewares/authMiddleware');

// Qualquer usuário autenticado pode acessar
router.get("/", authMiddleware(), localController.listar);
router.get("/:id", authMiddleware(), localController.buscarPorId);

// Apenas administradores podem modificar
router.post("/", authMiddleware(['admin']), localController.criar);
router.put("/:id", authMiddleware(['admin']), localController.atualizar);
router.delete("/:id", authMiddleware(['admin']), localController.desativar);

module.exports = router;