const express = require("express");
const router = express.Router();
const ativoController = require("../controllers/ativoController");
const authMiddleware = require('../middlewares/authMiddleware');

router.get("/",authMiddleware,  ativoController.listar);
router.get("/:id",authMiddleware,  ativoController.buscarPorId);
router.post("/",authMiddleware,  ativoController.criar);
router.put("/:id",authMiddleware,  ativoController.atualizar);
router.delete("/:id",authMiddleware,  ativoController.desativar);

module.exports = router;