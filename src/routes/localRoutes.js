const express = require("express");
const router = express.Router();
const localController = require("../controllers/localController");

router.get("/", localController.listar);
router.get("/:id", localController.buscarPorId);
router.post("/", localController.criar);
router.put("/:id", localController.atualizar);
router.delete("/:id", localController.desativar);

module.exports = router;