const express = require("express");
const router = express.Router();
const servicoController = require("../controllers/servicoController");

router.get("/", servicoController.listar);
router.get("/:id", servicoController.buscarPorId);
router.post("/", servicoController.criar);
router.put("/:id", servicoController.atualizar);
router.delete("/:id", servicoController.desativar);

module.exports = router;