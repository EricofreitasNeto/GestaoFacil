const express = require("express");
const router = express.Router();
const servicoController = require("../controllers/servicoController");
const authMiddleware = require('../middlewares/authMiddleware');

router.get("/",authMiddleware, servicoController.listar);
router.get("/:id",authMiddleware, servicoController.buscarPorId);
router.post("/",authMiddleware, servicoController.criar);
router.put("/:id",authMiddleware, servicoController.atualizar);
router.delete("/:id",authMiddleware, servicoController.desativar);

module.exports = router;