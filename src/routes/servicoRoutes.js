/**
 * @swagger
 * /v1/servicos:
 *   get:
 *     tags: [ServiÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â§os]
 *     summary: Lista todos os serviÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â§os
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de serviÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â§os
 */
/**
 * @swagger
 * /v1/servicos/{id}:
 *   get:
 *     tags: [ServiÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â§os]
 *     summary: Busca serviÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â§o por ID
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
 *         description: ServiÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â§o encontrado
 *       404:
 *         description: ServiÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â§o nÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â£o encontrado
 */
/**
 * @swagger
 * /v1/servicos:
 *   post:
 *     tags: [ServiÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â§os]
 *     summary: Cria um novo serviÃƒÆ’Ã‚Â§o (via funÃƒÆ’Ã‚Â§ÃƒÆ’Ã‚Â£o create_servico no banco)
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
 *         description: ServiÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â§o criado
 *       400:
 *         description: Dados invÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¡lidos
 */
/**
 * @swagger
 * /v1/servicos/{id}:
 *   put:
 *     tags: [ServiÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â§os]
 *     summary: Atualiza um serviÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â§o existente
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
 *         description: ServiÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â§o atualizado
 *       400:
 *         description: Dados invÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¡lidos
 *       404:
 *         description: ServiÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â§o nÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â£o encontrado
 */
/**
 * @swagger
 * /v1/servicos/{id}:
 *   delete:
 *     tags: [ServiÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â§os]
 *     summary: Desativa um serviÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â§o
 *     security:
 *       - bearerAuth: []
 *     description: |
 *       RestriÃƒÂ§ÃƒÂ£o: sÃƒÂ³ ÃƒÂ© permitido desativar (soft delete) um serviÃƒÂ§o quando o ativo vinculado estiver com status 'inativo'. Caso contrÃƒÂ¡rio, retorna 400.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: ServiÃƒÂ§o desativado
 *       400:
 *         description: Bloqueado porque o ativo nÃƒÂ£o estÃƒÂ¡ 'inativo'
 *       404:
 *         description: ServiÃƒÂ§o nÃƒÂ£o encontrado
 */


const express = require("express");
const router = express.Router();
const servicoController = require("../controllers/servicoController");
const maintenanceController = require("../controllers/maintenanceController");
const authMiddleware = require('../middlewares/authMiddleware');

// Qualquer usuário autenticado pode acessar
router.get("/", authMiddleware(), servicoController.listar);
router.get("/:id", authMiddleware(), servicoController.buscarPorId);

// CRUD disponível para perfis autenticados (controle de escopo realizado no controller)
router.post("/", authMiddleware(), servicoController.criarDb);
router.put("/:id", authMiddleware(), servicoController.atualizar);
router.delete("/:id", authMiddleware(), servicoController.desativar);

/**
 * @swagger
 * /v1/servicos/admin/fix-client-services:
 *   post:
 *     tags: [ServiÃƒÆ’Ã‚Â§os]
 *     summary: Admin - Corrige serviÃƒÆ’Ã‚Â§os de um cliente criando/associando um ativo e realocando serviÃƒÆ’Ã‚Â§os inconsistentes
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
      *         description: Quando true, nÃƒÆ’Ã‚Â£o altera nada; apenas lista o que seria feito
 *     responses:
 *       200:
 *         description: OperaÃƒÆ’Ã‚Â§ÃƒÆ’Ã‚Â£o realizada, serviÃƒÆ’Ã‚Â§os realocados (se necessÃƒÆ’Ã‚Â¡rio)
 *       400:
 *         description: RequisiÃƒÆ’Ã‚Â§ÃƒÆ’Ã‚Â£o invÃƒÆ’Ã‚Â¡lida
 */
router.post("/admin/fix-client-services", authMiddleware(['admin']), maintenanceController.fixServicosCliente);

module.exports = router;

