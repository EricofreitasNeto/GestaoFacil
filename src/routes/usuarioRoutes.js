/**
 * @swagger
 * /v1/usuarios:
 *   get:
 *     summary: Lista todos os usuários
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de usuários
 */
/**
 * @swagger
 * /v1/usuarios/{id}:
 *   get:
 *     summary: Busca usuário por ID
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
 *         description: Usuário encontrado
 *       404:
 *         description: Usuário não encontrado
 */
/**
 * @swagger
 * /v1/usuarios:
 *   post:
 *     summary: Cria um novo usuário
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
 *               cargo:
 *                 type: string
 *               email:
 *                 type: string
 *               telefone:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       201:
 *         description: Usuário criado
 *       400:
 *         description: Dados inválidos
 *       409:
 *         description: E-mail já cadastrado
 */
/**
 * @swagger
 * /v1/usuarios/{id}:
 *   put:
 *     summary: Atualiza um usuário existente
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
 *               cargo:
 *                 type: string
 *               email:
 *                 type: string
 *               telefone:
 *                 type: string
 *     responses:
 *       200:
 *         description: Usuário atualizado
 *       400:
 *         description: Dados inválidos
 *       404:
 *         description: Usuário não encontrado
 */
/**
 * @swagger
 * /v1/usuarios/{id}:
 *   delete:
 *     summary: Desativa um usuário
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
 *         description: Usuário desativado
 *       404:
 *         description: Usuário não encontrado
 */
const express = require("express");
const router = express.Router();
const usuarioController = require("../controllers/usuarioController");
const authMiddleware = require('../middlewares/authMiddleware');

// Apenas administradores podem criar, atualizar e deletar usuários
router.post("/", authMiddleware(['admin']), usuarioController.criar);
router.put("/:id", authMiddleware(['admin']), usuarioController.atualizar);
router.delete("/:id", authMiddleware(['admin']), usuarioController.desativar);

// Qualquer usuário autenticado pode listar e buscar
router.get("/", authMiddleware(), usuarioController.listar);
router.get("/:id", authMiddleware(), usuarioController.buscarPorId);

module.exports = router;

