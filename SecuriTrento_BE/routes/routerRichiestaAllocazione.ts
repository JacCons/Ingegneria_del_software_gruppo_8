import express from 'express';
import {
    getAllRichiesteAllocazione,
    getRichiestaAllocazioneById,
    createRichiestaAllocazione,
    updateRichiestaAllocazione,
    deleteRichiestaAllocazione
} from '../controllers/controllerRichiestaAllocazione.ts';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Richieste Allocazione
 *   description: API per la gestione delle richieste di allocazione delle forze dell'ordine
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     RichiestaAllocazione:
 *       type: object
 *       required:
 *         - idRichiestaAllocazione
 *         - zonaDiOperazione
 *       properties:
 *         _id:
 *           type: string
 *           description: ID automatico generato da MongoDB
 *           example: 60d21b4967d0d8992e610c85
 *         idRichiestaAllocazione:
 *           type: string
 *           description: ID univoco della richiesta di allocazione
 *           example: REQ_001
 *         zonaDiOperazione:
 *           type: object
 *           required:
 *             - coordinateGps
 *             - fasciaOraria
 *             - giornoSettimana
 *           properties:
 *             coordinateGps:
 *               type: object
 *               properties:
 *                 type:
 *                   type: string
 *                   enum: [Point]
 *                   description: Tipo GeoJSON
 *                   example: Point
 *                 coordinates:
 *                   type: array
 *                   items:
 *                     type: number
 *                   description: Coordinate [longitudine, latitudine]
 *                   example: [11.12, 46.07]
 *             fasciaOraria:
 *               type: string
 *               description: Fascia oraria dell'operazione
 *               example: "08:00-12:00"
 *             giornoSettimana:
 *               type: string
 *               description: Giorno della settimana
 *               example: "lunedì"
 *         stato:
 *           type: string
 *           enum: [pendente, assegnata, completata, annullata]
 *           description: Stato attuale della richiesta
 *           default: pendente
 *           example: pendente
 *         timeStampCreazione:
 *           type: string
 *           format: date-time
 *           description: Data e ora di creazione della richiesta
 *           example: "2023-05-18T14:30:00Z"
 *
 *     RichiestaAllocazioneInput:
 *       type: object
 *       required:
 *         - idRichiestaAllocazione
 *         - zonaDiOperazione
 *       properties:
 *         idRichiestaAllocazione:
 *           type: string
 *           description: ID univoco della richiesta di allocazione
 *           example: REQ_001
 *         zonaDiOperazione:
 *           type: object
 *           required:
 *             - coordinateGps
 *             - fasciaOraria
 *             - giornoSettimana
 *           properties:
 *             coordinateGps:
 *               type: object
 *               properties:
 *                 coordinates:
 *                   type: array
 *                   items:
 *                     type: number
 *                   example: [11.12, 46.07]
 *             fasciaOraria:
 *               type: string
 *               example: "08:00-12:00"
 *             giornoSettimana:
 *               type: string
 *               example: "lunedì"
 */

/**
 * @swagger
 * /api/richieste-allocazione:
 *   get:
 *     summary: Recupera tutte le richieste di allocazione
 *     tags: [Richieste Allocazione]
 *     description: Restituisce un array contenente tutte le richieste di allocazione presenti nel database
 *     responses:
 *       200:
 *         description: Lista di richieste di allocazione recuperata con successo
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
 *                     $ref: '#/components/schemas/RichiestaAllocazione'
 *                 count:
 *                   type: integer
 *                   description: Numero totale di richieste
 *                   example: 15
 *                 message:
 *                   type: string
 *                   example: Richieste allocazione retrieved successfully
 *       403:
 *         description: Accesso negato
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: Accesso negato
 *       500:
 *         description: Errore del server
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: Server error
 */
router.get('/', getAllRichiesteAllocazione);

/**
 * @swagger
 * /api/richieste-allocazione/{id}:
 *   get:
 *     summary: Recupera una richiesta di allocazione specifica
 *     tags: [Richieste Allocazione]
 *     description: Restituisce una richiesta di allocazione in base all'ID fornito
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID MongoDB della richiesta di allocazione
 *         example: 60d21b4967d0d8992e610c85
 *     responses:
 *       200:
 *         description: Richiesta di allocazione recuperata con successo
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/RichiestaAllocazione'
 *                 message:
 *                   type: string
 *                   example: Richiesta allocazione retrieved successfully
 *       403:
 *         description: Accesso negato
 *       404:
 *         description: Richiesta di allocazione non trovata
 *       500:
 *         description: Errore del server
 */
router.get('/:id', getRichiestaAllocazioneById);

/**
 * @swagger
 * /api/richieste-allocazione:
 *   post:
 *     summary: Crea una nuova richiesta di allocazione
 *     tags: [Richieste Allocazione]
 *     description: Crea una nuova richiesta di allocazione nel database
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           example:
 *             idRichiestaAllocazione: "REQ_001"
 *             zonaDiOperazione:
 *               coordinateGps:
 *                 coordinates: [11.12, 46.07]
 *               fasciaOraria: "08:00-12:00"
 *               giornoSettimana: "lunedì"
 *     responses:
 *       201:
 *         description: Richiesta di allocazione creata con successo
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/RichiestaAllocazione'
 *                 message:
 *                   type: string
 *                   example: Richiesta allocazione creata
 *       400:
 *         description: Dati non validi
 *       403:
 *         description: Accesso negato
 *       500:
 *         description: Errore del server
 */
router.post('/', createRichiestaAllocazione);

/**
 * @swagger
 * /api/richieste-allocazione/{id}:
 *   put:
 *     summary: Accetta una richiesta di allocazione
 *     tags: [Richieste Allocazione]
 *     description: Imposta lo stato della richiesta di allocazione su "accettato"
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID MongoDB della richiesta di allocazione
 *     requestBody:
 *       required: false
 *     responses:
 *       200:
 *         description: Richiesta di allocazione aggiornata con successo
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/RichiestaAllocazione'
 *                 message:
 *                   type: string
 *                   example: Richiesta allocazione aggiornata con successo
 *       403:
 *         description: Accesso negato
 *       404:
 *         description: Richiesta non trovata
 *       500:
 *         description: Errore del server
 */
router.put('/:id', updateRichiestaAllocazione);

/**
 * @swagger
 * /api/richieste-allocazione/{id}:
 *   delete:
 *     summary: Elimina una richiesta di allocazione
 *     tags: [Richieste Allocazione]
 *     description: Elimina una richiesta di allocazione dal sistema
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID MongoDB della richiesta di allocazione
 *     responses:
 *       200:
 *         description: Richiesta di allocazione eliminata con successo
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/RichiestaAllocazione'
 *                 message:
 *                   type: string
 *                   example: Richiesta allocazione deleted successfully
 *       403:
 *         description: Accesso negato
 *       404:
 *         description: Richiesta non trovata
 *       500:
 *         description: Errore del server
 */
router.delete('/:id', deleteRichiestaAllocazione);

export default router;