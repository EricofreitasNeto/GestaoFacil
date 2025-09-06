/**
 * @swagger
 * /v1/locais:
 *   get:
 *     tags: [Locais]
 *     summary: Lista todos os locais
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de locais
 */
/**
 * @swagger
 * /v1/locais/{id}:
 *   get:
 *     tags: [Locais]
 *     summary: Busca local por ID
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
 *         description: Local encontrado
 *       404:
 *         description: Local não encontrado
 */
/**
 * @swagger
 * /v1/locais:
 *   post:
 *    tags: [Locais]
 *     summary: Cria um novo local
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
 *     responses:
 *       201:
 *         description: Local criado
 *       400:
 *         description: Dados inválidos
 */
/**
 * @swagger
 * /v1/locais/{id}:
 *   put:
 *     tags: [Locais]
 *     summary: Atualiza um local existente
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
 *     responses:
 *       200:
 *         description: Local atualizado
 *       400:
 *         description: Dados inválidos
 *       404:
 *         description: Local não encontrado
 */
/**
 * @swagger
 * /v1/locais/{id}:
 *   delete:
 *     tags: [Locais]
 *     summary: Desativa um local
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
 *         description: Local desativado
 *       404:
 *         description: Local não encontrado
 */
//de
const express = require("express");
const router = express.Router();
const localController = require("../controllers/localController");
const authMiddleware = require('../middlewares/authMiddleware');

// Qualquer usuário autenticado pode acessar
router.get("/", authMiddleware(), localController.listar);
router.get("/:id", authMiddleware(), localController.buscarPorId);

// Apenas administradores podem modificar
router.post("/", authMiddleware(['admin']), localController.criar);
router.put("/:id", authMiddleware(['admin']), localController.atualizar);
router.delete("/:id", authMiddleware(['admin']), localController.desativar);

module.exports = router;