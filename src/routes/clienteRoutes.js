const express = require("express");
const router = express.Router();
const clienteController = require("../controllers/clienteController");

router.get("/", clienteController.listar);
router.get("/:id", clienteController.buscarPorId);
router.post("/", clienteController.criar);
router.put("/:id", clienteController.atualizar);
router.delete("/:id", clienteController.desativar);

module.exports = router;