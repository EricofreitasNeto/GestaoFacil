const express = require("express");
const router = express.Router();
const localController = require("../controllers/localController");
const authMiddleware = require('../middlewares/authMiddleware');

router.get("/",authMiddleware, localController.listar);
router.get("/:id",authMiddleware, localController.buscarPorId);
router.post("/",authMiddleware, localController.criar);
router.put("/:id",authMiddleware, localController.atualizar);
router.delete("/:id",authMiddleware, localController.desativar);

module.exports = router;