/**
 * @swagger
 * /v1/servicos:
 *   get:
 *     summary: Lista todos os serviços
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de serviços
 */
/**
 * @swagger
 * /v1/servicos/{id}:
 *   get:
 *     summary: Busca serviço por ID
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
 *         description: Serviço encontrado
 *       404:
 *         description: Serviço não encontrado
 */
/**
 * @swagger
 * /v1/servicos:
 *   post:
 *     summary: Cria um novo serviço
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               descricao:
 *                 type: string
 *               status:
 *                 type: string
 *               dataAgendada:
 *                 type: string
 *                 format: date-time
 *               dataConclusao:
 *                 type: string
 *                 format: date-time
 *               detalhes:
 *                 type: string
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
 *         description: Serviço criado
 *       400:
 *         description: Dados inválidos
 */
/**
 * @swagger
 * /v1/servicos/{id}:
 *   put:
 *     summary: Atualiza um serviço existente
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
 *               descricao:
 *                 type: string
 *               status:
 *                 type: string
 *               dataAgendada:
 *                 type: string
 *                 format: date-time
 *               dataConclusao:
 *                 type: string
 *                 format: date-time
 *               detalhes:
 *                 type: string
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
 *         description: Serviço atualizado
 *       400:
 *         description: Dados inválidos
 *       404:
 *         description: Serviço não encontrado
 */
/**
 * @swagger
 * /v1/servicos/{id}:
 *   delete:
 *     summary: Desativa um serviço
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
 *         description: Serviço desativado
 *       404:
 *         description: Serviço não encontrado
 */
const express = require("express");
const router = express.Router();
const servicoController = require("../controllers/servicoController");
const authMiddleware = require('../middlewares/authMiddleware');

// Qualquer usuário autenticado pode acessar
router.get("/", authMiddleware(), servicoController.listar);
router.get("/:id", authMiddleware(), servicoController.buscarPorId);

// Apenas administradores podem modificar
router.post("/", authMiddleware(['admin']), servicoController.criar);
router.put("/:id", authMiddleware(['admin']), servicoController.atualizar);
router.delete("/:id", authMiddleware(['admin']), servicoController.desativar);

module.exports = router;