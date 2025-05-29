import express from 'express';
import {
    getAllUtenti,
    getUtentiByType,
    getUtenteById,
    registerUser,
    deleteUtente,
    updateUtente
} from '../controllers/controllerUtente.ts';
import { tokenChecker } from '../middleware/middlewareTokenChecker.ts';

const router = express.Router();

/**
 * @swagger
 * /api/utenti:
 *   get:
 *     summary: Recupera tutti gli utenti
 *     tags: [Utenti]
 *     description: Restituisce una lista di tutti gli utenti registrati nel sistema
 *     responses:
 *       200:
 *         description: Lista di utenti recuperata con successo
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
 *                     $ref: '#/components/schemas/Utente'
 *                 count:
 *                   type: integer
 *                   description: Numero totale di utenti
 *                   example: 10
 *                 message:
 *                   type: string
 *                   example: Utenti recuperati con successo
 *       500:
 *         description: Errore del server
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/', tokenChecker, getAllUtenti);

/**
 * @swagger
 * /api/utenti/{tipo}:
 *   get:
 *     summary: Recupera utenti per tipo
 *     tags: [Utenti]
 *     description: Restituisce tutti gli utenti di un tipo specifico attivi (standard, comunale, fdo)
 *     parameters:
 *       - in: path
 *         name: tipo
 *         required: true
 *         schema:
 *           type: string
 *           enum: [standard, comunale, fdo]
 *         description: Tipo di utente da recuperare
 *     responses:
 *       200:
 *         description: Lista di utenti del tipo specificato recuperata con successo
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
 *                     $ref: '#/components/schemas/Utente'
 *                 count:
 *                   type: integer
 *                   example: 5
 *                 message:
 *                   type: string
 *                   example: Utenti di tipo standard recuperati con successo
 *       400:
 *         description: Tipo di utente non valido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Errore del server
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/:tipo', tokenChecker, getUtentiByType);

/**
 * @swagger
 * /api/utenti/id/{id}:
 *   get:
 *     summary: Recupera un utente specifico tramite ID
 *     tags: [Utenti]
 *     description: Restituisce i dettagli di un utente specifico identificato dall'ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID MongoDB dell'utente
 *     responses:
 *       200:
 *         description: Dettagli dell'utente recuperati con successo
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Utente'
 *                 message:
 *                   type: string
 *                   example: Utente recuperato con successo
 *       404:
 *         description: Utente non trovato
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Errore del server
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/id/:id', tokenChecker, getUtenteById);

/**
 * @swagger
 * /api/utenti/register/{tipo}:
 *   post:
 *     summary: Registra un nuovo utente
 *     tags: [Utenti]
 *     description: Crea un nuovo utente del tipo specificato (standard, comunale, fdo)
 *     parameters:
 *       - in: path
 *         name: tipo
 *         required: true
 *         schema:
 *           type: string
 *           enum: [standard, comunale, fdo]
 *         description: Tipo di utente da registrare
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             oneOf:
 *               - $ref: '#/components/schemas/UtenteRegistratoInput'
 *               - $ref: '#/components/schemas/UtenteComunaleInput'
 *               - $ref: '#/components/schemas/UtenteFDOInput'
 *     responses:
 *       201:
 *         description: Utente registrato con successo
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Utente'
 *                 message:
 *                   type: string
 *                   example: Utente standard registrato con successo
 *       400:
 *         description: Dati non validi o utente già esistente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Errore del server
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/register/:tipo', registerUser);

/**
 * @swagger
 * /api/utenti/{id}:
 *   delete:
 *     summary: Elimina un utente
 *     tags: [Utenti]
 *     description: Disattiva un utente specifico dal sistema
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID MongoDB dell'utente da eliminare
 *     responses:
 *       200:
 *         description: Utente eliminato con successo
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
 *                   example: Utente eliminato con successo
 *       404:
 *         description: Utente non trovato
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Errore del server
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

router.delete('/:id', tokenChecker, deleteUtente);


/**
 * @swagger
 * /api/utenti/{id}:
 *   put:
 *     summary: Aggiorna i dati di un utente esistente
 *     tags: [Utenti]
 *     description: Permette di aggiornare la password per tutti i tipi di utente. Per gli utenti FDO permette anche di aggiornare zoneDiOperazione e coordinateGps.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID MongoDB dell'utente da aggiornare
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               password:
 *                 type: string
 *                 format: password
 *                 minLength: 7
 *                 description: Nuova password (min 7 caratteri)
 *                 example: nuovaPassword123
 *               zoneDiOperazione:
 *                 type: array
 *                 description: Zone di operazione (solo per utenti FDO)
 *                 items:
 *                   type: object
 *                   required:
 *                     - coordinateGps
 *                     - fasceOrarie
 *                   properties:
 *                     coordinateGps:
 *                       type: object
 *                       properties:
 *                         type:
 *                           type: string
 *                           enum: [Polygon]
 *                           example: Polygon
 *                         coordinates:
 *                           type: array
 *                           items:
 *                             type: number
 *                           example: [11.12, 46.07]
 *                     fasceOrarie:
 *                       type: array
 *                       items:
 *                         type: number
 *                         minimum: 0
 *                         maximum: 23
 *                       example: [8, 9, 10, 11]
 *                       description: Ore del giorno (0-23)
 *                     giorniSettimana:
 *                       type: array
 *                       items:
 *                         type: string
 *                         enum: [Lunedi, Martedi, Mercoledi, Giovedi, Venerdi, Sabato, Domenica]
 *                       example: ["Lunedi", "Martedi", "Mercoledi"]
 *               coordinateGps:
 *                 type: object
 *                 description: Posizione attuale dell'agente (solo per utenti FDO)
 *                 properties:
 *                   type:
 *                     type: string
 *                     enum: [Point]
 *                     example: Point
 *                   coordinates:
 *                     type: array
 *                     items:
 *                       type: number
 *                     example: [11.12, 46.07]
 *     responses:
 *       200:
 *         description: Utente aggiornato con successo
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Utente'
 *                 message:
 *                   type: string
 *                   example: Utente aggiornato con successo
 *       400:
 *         description: Dati non validi, ID non valido o nessun campo da aggiornare
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *               examples:
 *                 invalidId:
 *                   value:
 *                     success: false
 *                     message: ID utente non valido
 *                 shortPassword:
 *                   value:
 *                     success: false
 *                     message: La password deve essere di almeno 7 caratteri
 *                 noData:
 *                   value:
 *                     success: false
 *                     message: Nessun campo valido fornito per l'aggiornamento
 *       404:
 *         description: Utente non trovato
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Errore del server
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.put('/:id', tokenChecker, updateUtente);

/**
 * @swagger
 * components:
 *   schemas:
 *     Utente:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           description: ID MongoDB dell'utente
 *           example: 60d21b4667d0d8992e610c85
 *         nome:
 *           type: string
 *           description: Nome dell'utente
 *           example: Mario
 *         cognome:
 *           type: string
 *           description: Cognome dell'utente
 *           example: Rossi
 *         telefono:
 *           type: string
 *           description: Numero di telefono dell'utente
 *           example: "3401234567"
 *         tipoUtente:
 *           type: string
 *           description: Tipo di utente (discriminator)
 *           enum: [UtenteRegistrato, UtenteComune, UtenteFDO]
 *           example: UtenteRegistrato
 *
 *     UtenteRegistrato:
 *       type: object
 *       required:
 *         - nome
 *         - cognome
 *         - telefono
 *         - password
 *       properties:
 *         nome:
 *           type: string
 *           example: Mario
 *         cognome:
 *           type: string
 *           example: Rossi
 *         telefono:
 *           type: string
 *           example: "3401234567"
 *         password:
 *           type: string
 *           format: password
 *           minLength: 7
 *           example: password123
 *
 *     UtenteComunale:
 *       allOf:
 *         - $ref: '#/components/schemas/UtenteRegistratoInput'
 *         - type: object
 *           properties:
 *             nome:
 *               type: string
 *               example: Mario
 *             cognome:
 *               type: string
 *               example: Rossi
 *             telefono:
 *               type: string
 *               example: "3401234567"
 *             password:
 *               type: string
 *               format: password
 *               minLength: 7
 *               example: password123
 *
 *     UtenteFDO:
 *       allOf:
 *         - $ref: '#/components/schemas/UtenteRegistratoInput'
 *         - type: object
 *           required:
 *             - TipoFDO
 *           properties:
 *             nome:
 *               type: string
 *               example: Mario
 *             cognome:
 *               type: string
 *               example: Rossi
 *             telefono:
 *               type: string
 *               example: "3401234567"
 *             password:
 *               type: string
 *               format: password
 *               minLength: 7
 *               example: password123
 *             TipoFDO:
 *               type: string
 *               enum: [POLIZIA, CARABINIERI, GUARDIA DI FINANZA]
 *               example: POLIZIA
 *             disponibilità:
 *               type: boolean
 *               example: true
 *             zoneDiOperazione:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   coordinateGps:
 *                     type: object
 *                     properties:
 *                       type:
 *                         type: string
 *                         example: Polygon
 *                       coordinates:
 *                         type: array
 *                         items:
 *                           type: number
 *                         example: [11.12, 46.07]
 *                   fasceOrarie:
 *                     type: array
 *                     items:
 *                       type: number
 *                     example: [8, 9, 10, 11]
 *                   giorniSettimana:
 *                     type: array
 *                     items:
 *                       type: string
 *                       enum: [Lunedi, Martedi, Mercoledi, Giovedi, Venerdi, Sabato, Domenica]
 *                     example: ["Lunedi", "Martedi", "Mercoledi"]
 *             coordinateGps:
 *               type: object
 *               properties:
 *                 type:
 *                   type: string
 *                   example: Point
 *                 coordinates:
 *                   type: array
 *                   items:
 *                     type: number
 *                   example: [11.12, 46.07]
 *
 */

export default router;