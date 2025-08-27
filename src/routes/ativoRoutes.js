const express = require("express");
const router = express.Router();
const ativoController = require("../controllers/ativoController");

router.get("/", ativoController.listar);
router.get("/:id", ativoController.buscarPorId);
router.post("/", ativoController.criar);
router.put("/:id", ativoController.atualizar);
router.delete("/:id", ativoController.desativar);

module.exports = router;