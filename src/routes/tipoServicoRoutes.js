const express = require("express");
const router = express.Router();
const tipoServicoController = require("../controllers/tipoServicoController");

router.get("/", tipoServicoController.listar);
router.get("/:id", tipoServicoController.buscarPorId);
router.post("/", tipoServicoController.criar);
router.put("/:id", tipoServicoController.atualizar);
router.patch("/:id/desativar", tipoServicoController.desativar);
router.delete("/:id", tipoServicoController.excluir);

module.exports = router;