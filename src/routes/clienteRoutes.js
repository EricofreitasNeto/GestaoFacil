const express = require("express");
const router = express.Router();
const clienteController = require("../controllers/clienteController");
const authMiddleware = require('../middlewares/authMiddleware');

router.get("/",authMiddleware,  clienteController.listar);
router.get("/:id",authMiddleware,  clienteController.buscarPorId);
router.post("/",authMiddleware,  clienteController.criar);
router.put("/:id",authMiddleware,  clienteController.atualizar);
router.delete("/:id",authMiddleware,  clienteController.desativar);

module.exports = router;