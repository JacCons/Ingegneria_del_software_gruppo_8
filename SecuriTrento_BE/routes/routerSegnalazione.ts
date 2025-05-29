import express from 'express';
import {generaCoordinateTrento} from '../middleware/middlewareGPS.ts'

import {
  getAllSegnalazioni,
  getSegnalazioneById,
  getSegnalazioniNearby,
  createSegnalazione,
  updateSegnalazione,
  deleteSegnalazione
} from '../controllers/controllerSegnalazione.ts';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Segnalazioni
 *   description: API per la gestione delle segnalazioni
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Segnalazione:
 *       type: object
 *       required:
 *         - tipologia
 *       properties:
 *         _id:
 *           type: string
 *           description: ID automatico generato da MongoDB
 *           example: 60d21b4967d0d8992e610c85
 *         timeStamp:
 *           type: string
 *           format: date-time
 *           description: Data e ora della segnalazione
 *           example: "2023-05-18T14:30:00Z"
 *         coordinateGps:
 *           type: object
 *           properties:
 *             type:
 *               type: string
 *               enum: [Point]
 *               description: Tipo GeoJSON
 *               example: Point
 *             coordinates:
 *               type: array
 *               items:
 *                 type: number
 *               description: Coordinate [longitudine, latitudine]
 *               example: [11.12, 46.07]
 *         tipologia:
 *           type: string
 *           enum: [rissa, spaccio, furto, degrado su mezzo pubblico, disturbo della quiete, vandalismo, altro]
 *           description: Tipo di segnalazione
 *           example: furto
 *         stato:
 *           type: string
 *           enum: [aperto, chiuso]
 *           description: Stato attuale della segnalazione
 *           example: aperto
 *         telefonata:
 *           type: boolean
 *           description: Flag che indica se è stata effettuata una telefonata
 *           default: false
 *           example: false
 *         media:
 *           type: string
 *           description: URL del media allegato (immagine/video)
 *           example: "https://example.com/media/image123.jpg"
 *         descrizione:
 *           type: string
 *           description: Descrizione dettagliata della segnalazione
 *           example: "Ho notato un individuo sospetto che cercava di forzare la portiera di un'auto"
 *         idUtente:
 *           type: string
 *           description: Identificativo dell'utente che ha effettuato la segnalazione
 *           example: "user123"
 */

/**
 * @swagger
 * /api/segnalazioni:
 *   get:
 *     summary: Recupera tutte le segnalazioni
 *     tags: [Segnalazioni]
 *     description: Restituisce un array contenente tutte le segnalazioni presenti nel database
 *     responses:
 *       200:
 *         description: Lista di segnalazioni recuperata con successo
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Segnalazione'
 *       500:
 *         description: Errore del server
 */
router.get('/', getAllSegnalazioni);

/**
 * @swagger
 * /api/segnalazioni/nearby/{fdoId}:
 *   get:
 *     summary: Recupera segnalazioni nelle vicinanze di un utente FDO
 *     tags: [Segnalazioni]
 *     description: Restituisce tutte le segnalazioni aperte in un raggio specifico dalla posizione corrente dell'utente FDO
 *     parameters:
 *       - in: path
 *         name: fdoId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID MongoDB dell'utente FDO
 *       - in: query
 *         name: radius
 *         required: false
 *         schema:
 *           type: number
 *           default: 5000
 *         description: Raggio di ricerca in metri
 *     responses:
 *       200:
 *         description: Segnalazioni nearby recuperate con successo
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Segnalazione'
 *                 count:
 *                   type: integer
 *                   example: 3
 */
router.get('/nearby/:fdoId', getSegnalazioniNearby);

/**
 * @swagger
 * /api/segnalazioni/{id}:
 *   get:
 *     summary: Recupera una segnalazione specifica
 *     tags: [Segnalazioni]
 *     description: Restituisce una segnalazione in base all'ID fornito
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID MongoDB della segnalazione
 *     responses:
 *       200:
 *         description: Segnalazione recuperata con successo
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Segnalazione'
 *       404:
 *         description: Segnalazione non trovata
 *       500:
 *         description: Errore del server
 */
router.get('/:id', getSegnalazioneById);

/**
 * @swagger
 * /api/segnalazioni:
 *   post:
 *     summary: Crea una nuova segnalazione
 *     tags: [Segnalazioni]
 *     description: Crea una nuova segnalazione nel database. Coordinate di Trento generate automaticamente se non fornite.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - tipologia
 *             properties:
 *               tipologia:
 *                 type: string
 *                 enum: [rissa, spaccio, furto, degrado su mezzo pubblico, disturbo della quiete, vandalismo, altro]
 *                 example: furto
 *               descrizione:
 *                 type: string
 *                 example: "Ho visto una persona che rubava uno zaino"
 *               telefonata:
 *                 type: boolean
 *                 example: false
 *               media:
 *                 type: string
 *                 example: "https://example.com/foto.jpg"
 *               idUtente:
 *                 type: string
 *                 example: "user456"
 *               coordinateGps:
 *                 type: object
 *                 properties:
 *                   coordinates:
 *                     type: array
 *                     items:
 *                       type: number
 *                     example: [11.12, 46.07]
 *     responses:
 *       201:
 *         description: Segnalazione creata con successo
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Segnalazione'
 *       400:
 *         description: Dati non validi
 *       500:
 *         description: Errore del server
 */
router.post('/',generaCoordinateTrento, createSegnalazione);

/**
 * @swagger
 * /api/segnalazioni/{id}:
 *   put:
 *     summary: Aggiorna una segnalazione esistente
 *     tags: [Segnalazioni]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID MongoDB della segnalazione
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               tipologia:
 *                 type: string
 *                 enum: [rissa, spaccio, furto, degrado su mezzo pubblico, disturbo della quiete, vandalismo, altro]
 *               descrizione:
 *                 type: string
 *               stato:
 *                 type: string
 *                 enum: [aperto, chiuso]
 *               telefonata:
 *                 type: boolean
 *               media:
 *                 type: string
 *     responses:
 *       200:
 *         description: Segnalazione aggiornata con successo
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Segnalazione'
 *       404:
 *         description: Segnalazione non trovata
 *       500:
 *         description: Errore del server
 */
router.put('/:id', updateSegnalazione);

/**
 * @swagger
 * /api/segnalazioni/{id}:
 *   delete:
 *     summary: Elimina una segnalazione
 *     tags: [Segnalazioni]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID MongoDB della segnalazione
 *     responses:
 *       200:
 *         description: Segnalazione eliminata con successo
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Segnalazione eliminata con successo"
 *       404:
 *         description: Segnalazione non trovata
 *       500:
 *         description: Errore del server
 */
router.delete('/:id', deleteSegnalazione);

export default router;