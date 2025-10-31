/**
 * @swagger
 * /v1/ativos:
 *   get:
 *     tags:
 *       - Ativos
 *     summary: Lista todos os ativos
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de ativos
 */

/**
 * @swagger
 * /v1/ativos/{id}:
 *   get:
 *     tags:
 *       - Ativos
 *     summary: Busca ativo por ID
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
 *         description: Ativo encontrado
 *       404:
 *         description: Ativo não encontrado
 */

/**
 * @swagger
 * /v1/ativos:
 *   post:
 *     tags:
 *       - Ativos
 *     summary: Cria um novo ativo
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
 *               numeroSerie:
 *                 type: string
 *               status:
 *                 type: string
 *               localId:
 *                 type: integer
 *               detalhes:
 *                 type: object
 *     responses:
 *       201:
 *         description: Ativo criado
 *       400:
 *         description: Dados inválidos
 *       403:
 *         description: Não autorizado
 */

/**
 * @swagger
 * /v1/ativos/{id}:
 *   put:
 *     tags:
 *       - Ativos
 *     summary: Atualiza um ativo existente
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
 *               numeroSerie:
 *                 type: string
 *               status:
 *                 type: string
 *               localId:
 *                 type: integer
 *               detalhes:
 *                 type: object
 *     responses:
 *       200:
 *         description: Ativo atualizado
 *       400:
 *         description: Dados inválidos
 *       404:
 *         description: Ativo não encontrado
 *       403:
 *         description: Não autorizado
 */

/**
 * @swagger
 * /v1/ativos/{id}:
 *   delete:
 *     tags:
 *       - Ativos
 *     summary: Remove (desativa) um ativo
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
 *         description: Ativo removido/desativado
 *       404:
 *         description: Ativo não encontrado
 *       403:
 *         description: Não autorizado
 */

const express = require("express");
const router = express.Router();
const ativoController = require("../controllers/ativoController");
const authMiddleware = require('../middlewares/authMiddleware');

// Qualquer usuário autenticado pode acessar
router.get("/", authMiddleware(), ativoController.listar);
router.get("/:id", authMiddleware(), ativoController.buscarPorId);

// Apenas administradores podem modificar
router.post("/", authMiddleware(['admin']), ativoController.criar);
router.put("/:id", authMiddleware(['admin']), ativoController.atualizar);
router.delete("/:id", authMiddleware(['admin']), ativoController.desativar);

module.exports = router;

