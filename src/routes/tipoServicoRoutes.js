/**
 * @swagger
 * /v1/tipos-servicos:
 *   get:
 *     tags: [Tipos de Serviços]
 *     summary: Lista todos os tipos de serviço
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de tipos de serviço
 */
/**
 * @swagger
 * /v1/tipos-servicos/{id}:
 *   get:
 *     tags: [Tipos de Serviços]
 *     summary: Busca tipo de serviço por ID
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
 *         description: Tipo de serviço encontrado
 *       404:
 *         description: Tipo de serviço não encontrado
 */
/**
 * @swagger
 * /v1/tipos-servicos:
 *   post:
 *     tags: [Tipos de Serviços]
 *     summary: Cria um novo tipo de serviço
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nome:
 *                 type: string
 *               descricao:
 *                 type: string
 *     responses:
 *       201:
 *         description: Tipo de serviço criado
 *       400:
 *         description: Dados inválidos
 */
/**
 * @swagger
 * /v1/tipos-servicos/{id}:
 *   put:
 *     tags: [Tipos de Serviços]
 *     summary: Atualiza um tipo de serviço existente
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
 *             properties:
 *               nome:
 *                 type: string
 *               descricao:
 *                 type: string
 *     responses:
 *       200:
 *         description: Tipo de serviço atualizado
 *       400:
 *         description: Dados inválidos
 *       404:
 *         description: Tipo de serviço não encontrado
 */
/**
 * @swagger
 * /v1/tipos-servicos/{id}/desativar:
 *   patch:
 *     tags: [Tipos de Serviços]
 *     summary: Desativa um tipo de serviço
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
 *         description: Tipo de serviço desativado
 *       404:
 *         description: Tipo de serviço não encontrado
 */
/**
 * @swagger
 * /v1/tipos-servicos/{id}:
 *   delete:
 *     tags: [Tipos de Serviços]
 *     summary: Exclui definitivamente um tipo de serviço
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
 *         description: Tipo de serviço excluído
 *       404:
 *         description: Tipo de serviço não encontrado
 */



const express = require("express");
const router = express.Router();
const tipoServicoController = require("../controllers/tipoServicoController");
const authMiddleware = require('../middlewares/authMiddleware');

// Qualquer usuário autenticado pode acessar
router.get("/", authMiddleware(), tipoServicoController.listar);
router.get("/:id", authMiddleware(), tipoServicoController.buscarPorId);

// Apenas administradores podem modificar
router.post("/", authMiddleware(['admin']), tipoServicoController.criar);
router.put("/:id", authMiddleware(['admin']), tipoServicoController.atualizar);
router.patch("/:id/desativar", authMiddleware(['admin']), tipoServicoController.desativar);
router.delete("/:id", authMiddleware(['admin']), tipoServicoController.excluir);

module.exports = router;