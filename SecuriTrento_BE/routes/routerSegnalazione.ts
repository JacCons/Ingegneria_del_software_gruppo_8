import express from 'express';
import {generaCoordinateTrento} from '../middleware/middlewareGPS.ts'

import {
  getAllSegnalazioni,
  getSegnalazioneById,
  getSegnalazioniNearby,
  getSegnalazioniByUtente,
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
 *           enum: [RISSA, SPACCIO, FURTO, DEGRADO, DISTURBO, VANDALISMO, ALTRO]
 *           description: Tipo di segnalazione
 *           example: FURTO
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
 *     summary: Recupera tutte le segnalazioni con filtri opzionali
 *     tags: [Segnalazioni]
 *     description: |
 *       Restituisce un array contenente le segnalazioni filtrate in base ai parametri forniti.
 *       
 *       **Filtro Date:**
 *       - Se non vengono forniti parametri di data, vengono restituite le segnalazioni degli ultimi 30 giorni
 *       - È possibile specificare un range personalizzato usando dataDa e/o dataA
 *       - Le date vengono automaticamente impostate all'inizio (00:00:00) e fine giornata (23:59:59)
 *       
 *       **Filtro Tipologie (Multi-Select):**
 *       - È possibile filtrare per una o più tipologie contemporaneamente
 *       - Usa parametri multipli con lo stesso nome: ?tipologia=FURTO&tipologia=SPACCIO
 *       - Se nessuna tipologia viene specificata, vengono restituite tutte le tipologie
 *       - Tipologie non valide vengono ignorate con un warning
 *       
 *       **Permessi:**
 *       - Accessibile solo a UtenteFDO e UtenteComunale
 *       - UtenteCittadino: accesso negato (403)
 *     parameters:
 *       - in: query
 *         name: dataDa
 *         required: false
 *         schema:
 *           type: string
 *           format: date
 *           example: "2024-05-01"
 *         description: |
 *           Data di inizio del range di ricerca (formato YYYY-MM-DD o ISO string).
 *           Se omesso, viene utilizzata la data di 30 giorni fa come default.
 *       - in: query
 *         name: dataA
 *         required: false
 *         schema:
 *           type: string
 *           format: date
 *           example: "2024-05-31"
 *         description: |
 *           Data di fine del range di ricerca (formato YYYY-MM-DD o ISO string).
 *           Se omesso, viene utilizzata la data odierna come default.
 *       - in: query
 *         name: tipologia
 *         required: false
 *         style: form
 *         explode: true
 *         schema:
 *           type: array
 *           items:
 *             type: string
 *             enum: [RISSA, SPACCIO, FURTO, DEGRADO, DISTURBO, VANDALISMO, ALTRO]
 *           example: ["FURTO", "SPACCIO"]
 *         description: |
 *           Filtra per una o più tipologie di segnalazione (case-insensitive).
 *           
 *           **Modalità di utilizzo:**
 *           - Singola tipologia: `?tipologia=FURTO`
 *           - Multiple tipologie: `?tipologia=FURTO&tipologia=SPACCIO&tipologia=RISSA`
 *           
 *           **Comportamento:**
 *           - Se omesso: vengono restituite tutte le tipologie
 *           - Tipologie non valide vengono ignorate automaticamente
 *           - Se tutte le tipologie sono non valide, viene restituito errore 400
 *       - in: query
 *         name: stato
 *         required: false
 *         schema:
 *           type: string
 *           enum: [aperto, chiuso]
 *           example: aperto
 *         description: Filtra per stato della segnalazione (case-insensitive)
 *     responses:
 *       200:
 *         description: Lista di segnalazioni recuperata con successo
 *         content:
 *           application/json:
 *             examples:
 *               default_range:
 *                 summary: Esempio con range di default (ultimi 30 giorni)
 *                 value:
 *                   success: true
 *                   data: []
 *                   count: 15
 *                   filtri:
 *                     tipologie: null
 *                     stato: null
 *                     dataDa: "2024-05-07T00:00:00.000Z"
 *                     dataA: "2024-06-06T23:59:59.999Z"
 *                     isDefaultRange: true
 *                   message: "15 segnalazioni trovate (ultimi 30 giorni)"
 *               single_tipologia:
 *                 summary: Esempio con singola tipologia
 *                 value:
 *                   success: true
 *                   data: []
 *                   count: 8
 *                   filtri:
 *                     tipologie: ["FURTO"]
 *                     stato: null
 *                     dataDa: "2024-05-07T00:00:00.000Z"
 *                     dataA: "2024-06-06T23:59:59.999Z"
 *                     isDefaultRange: true
 *                   message: "8 segnalazioni trovate (ultimi 30 giorni)"
 *               multiple_tipologie:
 *                 summary: Esempio con multiple tipologie
 *                 value:
 *                   success: true
 *                   data: []
 *                   count: 12
 *                   filtri:
 *                     tipologie: ["FURTO", "SPACCIO", "RISSA"]
 *                     stato: "aperto"
 *                     dataDa: "2024-05-01T00:00:00.000Z"
 *                     dataA: "2024-05-31T23:59:59.999Z"
 *                     isDefaultRange: false
 *                   message: "12 segnalazioni trovate"
 *               custom_filter:
 *                 summary: Esempio con tutti i filtri personalizzati
 *                 value:
 *                   success: true
 *                   data: []
 *                   count: 5
 *                   filtri:
 *                     tipologie: ["FURTO", "VANDALISMO"]
 *                     stato: "aperto"
 *                     dataDa: "2024-05-01T00:00:00.000Z"
 *                     dataA: "2024-05-31T23:59:59.999Z"
 *                     isDefaultRange: false
 *                   message: "5 segnalazioni trovate"
 *       400:
 *         description: Parametri non validi
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
 *             examples:
 *               all_tipologie_invalid:
 *                 summary: Tutte le tipologie sono non valide
 *                 value:
 *                   success: false
 *                   message: "Tipologie non valide: INVALID1, INVALID2. Valori consentiti: RISSA, SPACCIO, FURTO, DEGRADO, DISTURBO, VANDALISMO, ALTRO"
 *               invalid_stato:
 *                 summary: Stato non valido
 *                 value:
 *                   success: false
 *                   message: "Stato non valido. Valori consentiti: aperto, chiuso"
 *               invalid_date:
 *                 summary: Data non valida
 *                 value:
 *                   success: false
 *                   message: "DataDa non valida. Formato richiesto: YYYY-MM-DD o ISO string"
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
 *                   example: "Accesso negato"
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
 *                   example: "Errore interno del server"
 *                 error:
 *                   type: string
 *                   example: "Database connection failed"
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
 *                   example: "Accesso negato"
 */
router.get('/nearby/:fdoId', getSegnalazioniNearby);



/**
 * @swagger
 * /api/segnalazioni/mySegnalazioni:
 *   get:
 *     summary: Recupera le segnalazioni dell'utente corrente
 *     tags: [Segnalazioni]
 *     description: Restituisce tutte le segnalazioni effettuate dall'utente autenticato
 *     responses:
 *       200:
 *         description: Segnalazioni recuperate con successo
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
 *                   example: "Accesso negato"
 */
router.get('/mySegnalazioni', getSegnalazioniByUtente)

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
 *                   example: "Accesso negato"
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
 *                 enum: [RISSA, SPACCIO, FURTO, DEGRADO, DISTURBO, VANDALISMO, ALTRO]
 *                 example: FURTO
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
 *                   example: "Accesso negato"
 *       500:
 *         description: Errore del server
 */
router.post('/', createSegnalazione); //generaCoordinateTrento prima cera ma ora è da fare il ceck se le coordinate sono dentro trento è nel middlewhare GPS questo

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
 *                 enum: [RISSA, SPACCIO, FURTO, DEGRADO, DISTURBO, VANDALISMO, ALTRO]
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
 *                   example: "Accesso negato"
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
 *                   example: "Accesso negato"
 *       404:
 *         description: Segnalazione non trovata
 *       500:
 *         description: Errore del server
 */
router.delete('/:id', deleteSegnalazione);

export default router;