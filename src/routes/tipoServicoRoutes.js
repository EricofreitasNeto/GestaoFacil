const express = require("express");
const router = express.Router();
const tipoServicoController = require("../controllers/tipoServicoController");
const authMiddleware = require('../middlewares/authMiddleware');

router.get("/",authMiddleware, tipoServicoController.listar);
router.get("/:id",authMiddleware, tipoServicoController.buscarPorId);
router.post("/",authMiddleware, tipoServicoController.criar);
router.put("/:id",authMiddleware, tipoServicoController.atualizar);
router.patch("/:id/desativar",authMiddleware, tipoServicoController.desativar);
router.delete("/:id",authMiddleware, tipoServicoController.excluir);

module.exports = router;