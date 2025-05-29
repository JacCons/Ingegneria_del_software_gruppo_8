import express from 'express';
import { verificaUtente } from '../controllers/controllerAutenticazione.ts';
import { tokenChecker } from '../middleware/middlewareTokenChecker.ts';

const router = express.Router();

/**
 * @swagger
 * /api/login:
 *   post:
 *     summary: Verifica le credenziali dell'utente e restituisce un token JWT.
 *     tags:
 *       - Autenticazione
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               telefono:
 *                 type: number
 *                 example: "1489164451"
 *               password:
 *                 type: string
 *                 example: "password123"
 *     responses:
 *       200:
 *         description: Autenticazione avvenuta con successo, ritorna il token.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 token:
 *                   type: string
 *       401:
 *         description: Credenziali non valide.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 */
router.post('/', verificaUtente);

export default router;