/**
 * @swagger
 * /v1/servicos:
 *   get:
 *     tags: [ServiÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â§os]
 *     summary: Lista todos os serviÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â§os
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de serviÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â§os
 */
/**
 * @swagger
 * /v1/servicos/{id}:
 *   get:
 *     tags: [ServiÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â§os]
 *     summary: Busca serviÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â§o por ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: ServiÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â§o encontrado
 *       404:
 *         description: ServiÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â§o nÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â£o encontrado
 */
/**
 * @swagger
 * /v1/servicos:
 *   post:
 *     tags: [ServiÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â§os]
 *     summary: Cria um novo serviÃƒÂ§o (via funÃƒÂ§ÃƒÂ£o create_servico no banco)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [descricao, ativoId]
 *             properties:
 *               descricao:
 *                 type: string
 *               status:
 *                 type: string
 *               dataAgendada:
 *                 type: string
 *                 format: date-time
 *               detalhes:
 *                 type: object
 *               clienteId:
 *                 type: integer
 *               usuarioId:
 *                 type: integer
 *               ativoId:
 *                 type: integer
 *               tipoServicoId:
 *                 type: integer
 *     responses:
 *       201:
 *         description: ServiÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â§o criado
 *       400:
 *         description: Dados invÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¡lidos
 */
/**
 * @swagger
 * /v1/servicos/{id}:
 *   put:
 *     tags: [ServiÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â§os]
 *     summary: Atualiza um serviÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â§o existente
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [descricao, ativoId]
 *             properties:
 *               descricao:
 *                 type: string
 *               status:
 *                 type: string
 *               dataAgendada:
 *                 type: string
 *                 format: date-time
 *               detalhes:
 *                 type: object
 *               clienteId:
 *                 type: integer
 *               usuarioId:
 *                 type: integer
 *               ativoId:
 *                 type: integer
 *               tipoServicoId:
 *                 type: integer
 *     responses:
 *       200:
 *         description: ServiÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â§o atualizado
 *       400:
 *         description: Dados invÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¡lidos
 *       404:
 *         description: ServiÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â§o nÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â£o encontrado
 */
/**
 * @swagger
 * /v1/servicos/{id}:
 *   delete:
 *     tags: [ServiÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â§os]
 *     summary: Desativa um serviÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â§o
 *     security:
 *       - bearerAuth: []
 *     description: |
 *       RestriÃ§Ã£o: sÃ³ Ã© permitido desativar (soft delete) um serviÃ§o quando o ativo vinculado estiver com status 'inativo'. Caso contrÃ¡rio, retorna 400.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: ServiÃ§o desativado
 *       400:
 *         description: Bloqueado porque o ativo nÃ£o estÃ¡ 'inativo'
 *       404:
 *         description: ServiÃ§o nÃ£o encontrado
 */


const express = require("express");
const router = express.Router();
const servicoController = require("../controllers/servicoController");
const servicoGuardController = require("../controllers/servicoGuardController");
const maintenanceController = require("../controllers/maintenanceController");
const authMiddleware = require('../middlewares/authMiddleware');

// Qualquer usuÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¡rio autenticado pode acessar
router.get("/", authMiddleware(), servicoController.listar);
router.get("/:id", authMiddleware(), servicoController.buscarPorId);

// Apenas administradores podem modificar
router.post("/", authMiddleware(['admin']), servicoController.criarDb);
router.put("/:id", authMiddleware(['admin']), servicoController.atualizar);
router.delete("/:id", authMiddleware(['admin']), servicoGuardController.desativarChecked);

/**
 * @swagger
 * /v1/servicos/admin/fix-client-services:
 *   post:
 *     tags: [ServiÃƒÂ§os]
 *     summary: Admin - Corrige serviÃƒÂ§os de um cliente criando/associando um ativo e realocando serviÃƒÂ§os inconsistentes
 *     security:
 *       - bearerAuth: []
 *     requestBody:
      *       required: true
      *       content:
      *         application/json:
      *           schema:
      *             type: object
      *             required: [clienteId, numeroSerie]
      *             properties:
      *               clienteId:
      *                 type: integer
      *               numeroSerie:
      *                 type: string
      *               nome:
      *                 type: string
      *                 description: Nome do ativo a ser criado (opcional)
      *     parameters:
      *       - in: query
      *         name: dryRun
      *         schema:
      *           type: boolean
      *         description: Quando true, nÃƒÂ£o altera nada; apenas lista o que seria feito
 *     responses:
 *       200:
 *         description: OperaÃƒÂ§ÃƒÂ£o realizada, serviÃƒÂ§os realocados (se necessÃƒÂ¡rio)
 *       400:
 *         description: RequisiÃƒÂ§ÃƒÂ£o invÃƒÂ¡lida
 */
router.post("/admin/fix-client-services", authMiddleware(['admin']), maintenanceController.fixServicosCliente);

module.exports = router;
