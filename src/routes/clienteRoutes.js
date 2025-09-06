/**
 * @swagger
 * /v1/clientes:
 *   get:
 *     summary: Lista todos os clientes
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de clientes
 */
/**
 * @swagger
 * /v1/clientes/{id}:
 *   get:
 *     summary: Busca cliente por ID
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
 *         description: Cliente encontrado
 *       404:
 *         description: Cliente não encontrado
 */
/**
 * @swagger
 * /v1/clientes:
 *   post:
 *     summary: Cria um novo cliente
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
 *               cnpj:
 *                 type: string
 *               contatos:
 *                 type: string
 *     responses:
 *       201:
 *         description: Cliente criado
 *       400:
 *         description: Dados inválidos
 */
/**
 * @swagger
 * /v1/clientes/{id}:
 *   put:
 *     summary: Atualiza um cliente existente
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
 *               cnpj:
 *                 type: string
 *               contatos:
 *                 type: string
 *     responses:
 *       200:
 *         description: Cliente atualizado
 *       400:
 *         description: Dados inválidos
 *       404:
 *         description: Cliente não encontrado
 */
/**
 * @swagger
 * /v1/clientes/{id}:
 *   delete:
 *     summary: Desativa um cliente
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
 *         description: Cliente desativado
 *       404:
 *         description: Cliente não encontrado
 */
const express = require("express");
const router = express.Router();
const clienteController = require("../controllers/clienteController");
const authMiddleware = require('../middlewares/authMiddleware');

// Qualquer usuário autenticado pode acessar
router.get("/", clienteController.listar);
router.get("/:id", authMiddleware(), clienteController.buscarPorId);

// Apenas administradores podem modificar
router.post("/", authMiddleware(['admin']), clienteController.criar);
router.put("/:id", authMiddleware(['admin']), clienteController.atualizar);
router.delete("/:id", authMiddleware(['admin']), clienteController.desativar);

module.exports = router;