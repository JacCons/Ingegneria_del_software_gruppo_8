import express from 'express';
import { tokenChecker } from '../middleware/middlewareTokenChecker.ts';
import { getNotificheSegnalazione } from '../controllers/controllerNotifiche.ts';

const router = express.Router();

/**
 * @swagger
 * /api/notifiche/notifiche-segnalazioni/destinatario/{utenteDestinatarioId}:
 *   get:
 *     summary: Recupera notifiche segnalazioni per un utente FDO
 *     description: |
 *       Recupera tutte le notifiche di segnalazioni per un utente FDO specifico. 
 *       Può opzionalmente controllare e creare nuove notifiche per segnalazioni 
 *       recenti (max 8 ore) nel raggio specificato.
 *     tags:
 *       - Notifiche
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: utenteDestinatarioId
 *         required: true
 *         schema:
 *           type: string
 *           pattern: '^[0-9a-fA-F]{24}$'
 *           example: "64f1a2b3c4d5e6f7a8b9c0d1"
 *         description: ID MongoDB dell'utente FDO destinatario delle notifiche
 *       - in: query
 *         name: autoCheck
 *         required: false
 *         schema:
 *           type: string
 *           enum: ["true", "false"]
 *           default: "false"
 *           example: "true"
 *         description: |
 *           Se true, controlla automaticamente segnalazioni recenti nel raggio 
 *           e crea nuove notifiche se necessario. Se false, recupera solo 
 *           notifiche esistenti.
 *       - in: query
 *         name: raggio
 *         required: false
 *         schema:
 *           type: string
 *           pattern: '^[0-9]+$'
 *           minimum: 1
 *           maximum: 50000
 *           default: "2500"
 *           example: "2500"
 *         description: |
 *           Raggio in metri per la ricerca di segnalazioni (solo se autoCheck=true).
 *           Minimo 1m, massimo 50km (50000m). Default 2.5km (2500m).
 *     responses:
 *       200:
 *         description: Notifiche recuperate con successo
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
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                         example: "64f1a2b3c4d5e6f7a8b9c0d1"
 *                       tipoNotifica:
 *                         type: string
 *                         example: "segnalazione"
 *                       timestamp:
 *                         type: string
 *                         format: date-time
 *                         example: "2025-05-29T10:30:00.000Z"
 *                       destinatario:
 *                         type: object
 *                         properties:
 *                           _id:
 *                             type: string
 *                             example: "64f1a2b3c4d5e6f7a8b9c0d1"
 *                           nome:
 *                             type: string
 *                             example: "Mario"
 *                           cognome:
 *                             type: string
 *                             example: "Rossi"
 *                       idSegnalazione:
 *                         type: object
 *                         properties:
 *                           _id:
 *                             type: string
 *                             example: "64f1a2b3c4d5e6f7a8b9c0d1"
 *                           tipologia:
 *                             type: string
 *                             example: "Furto"
 *                           descrizione:
 *                             type: string
 *                             example: "Furto di bicicletta in via Roma"
 *                           coordinateGps:
 *                             type: object
 *                             properties:
 *                               type:
 *                                 type: string
 *                                 example: "Point"
 *                               coordinates:
 *                                 type: array
 *                                 items:
 *                                   type: number
 *                                 example: [11.1219482, 46.0664014]
 *                           timeStamp:
 *                             type: string
 *                             format: date-time
 *                             example: "2025-05-29T08:15:00.000Z"
 *                           stato:
 *                             type: string
 *                             example: "aperto"
 *                 count:
 *                   type: integer
 *                   example: 5
 *                   description: Numero totale di notifiche trovate
 *                 autoCheck:
 *                   type: boolean
 *                   example: true
 *                   description: Indica se è stato richiesto il controllo automatico
 *                 controlloEffettuato:
 *                   type: boolean
 *                   example: true
 *                   description: Indica se è stato effettuato il controllo automatico
 *                 nuoveNotificheCreate:
 *                   type: integer
 *                   example: 2
 *                   description: Numero di nuove notifiche create con questo controllo
 *                 raggio:
 *                   type: integer
 *                   example: 2500
 *                   description: Raggio utilizzato per la ricerca (in metri)
 *                 raggioKm:
 *                   type: string
 *                   example: "2.5"
 *                   description: Raggio utilizzato per la ricerca (in chilometri)
 *                 errorControllo:
 *                   type: string
 *                   nullable: true
 *                   example: null
 *                   description: Eventuale errore durante il controllo automatico
 *                 destinatario:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                       example: "64f1a2b3c4d5e6f7a8b9c0d1"
 *                     nome:
 *                       type: string
 *                       example: "Mario"
 *                     cognome:
 *                       type: string
 *                       example: "Rossi"
 *                     tipoUtente:
 *                       type: string
 *                       example: "UtenteFDO"
 *                 message:
 *                   type: string
 *                   example: "Trovate 5 notifiche (2 nuove create nel raggio di 2.5km)"
 *             examples:
 *               con_autocheck:
 *                 summary: Risposta con autoCheck=true
 *                 value:
 *                   success: true
 *                   data: []
 *                   count: 3
 *                   autoCheck: true
 *                   controlloEffettuato: true
 *                   nuoveNotificheCreate: 2
 *                   raggio: 2500
 *                   raggioKm: "2.5"
 *                   errorControllo: null
 *                   destinatario:
 *                     _id: "64f1a2b3c4d5e6f7a8b9c0d1"
 *                     nome: "Mario"
 *                     cognome: "Rossi"
 *                     tipoUtente: "UtenteFDO"
 *                   message: "Trovate 3 notifiche (2 nuove create nel raggio di 2.5km)"
 *               senza_autocheck:
 *                 summary: Risposta con autoCheck=false (default)
 *                 value:
 *                   success: true
 *                   data: []
 *                   count: 3
 *                   autoCheck: false
 *                   controlloEffettuato: false
 *                   nuoveNotificheCreate: 0
 *                   raggio: 2500
 *                   raggioKm: "2.5"
 *                   errorControllo: null
 *                   destinatario:
 *                     _id: "64f1a2b3c4d5e6f7a8b9c0d1"
 *                     nome: "Mario"
 *                     cognome: "Rossi"
 *                     tipoUtente: "UtenteFDO"
 *                   message: "Trovate 3 notifiche per Mario Rossi"
 *       400:
 *         description: Errore nei parametri di input
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
 *                 error:
 *                   type: string
 *             examples:
 *               id_mancante:
 *                 summary: ID utente mancante
 *                 value:
 *                   success: false
 *                   message: "utenteDestinatarioId è richiesto"
 *               id_invalido:
 *                 summary: ID utente non valido
 *                 value:
 *                   success: false
 *                   message: "utenteDestinatarioId non è un ID valido"
 *               raggio_invalido:
 *                 summary: Raggio non valido
 *                 value:
 *                   success: false
 *                   message: "Il raggio deve essere un numero positivo e massimo 50km (50000 metri)"
 *                   error: "INVALID_RADIUS"
 *               utente_non_fdo:
 *                 summary: Utente non è FDO
 *                 value:
 *                   success: false
 *                   message: "L'utente con ID 64f1a2b3c4d5e6f7a8b9c0d1 non è un UtenteFDO"
 *                   error: "USER_NOT_FDO"
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         description: Utente non trovato
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
 *                   example: "Utente con ID 64f1a2b3c4d5e6f7a8b9c0d1 non trovato"
 *                 error:
 *                   type: string
 *                   example: "USER_NOT_FOUND"
 *       500:
 *         description: Errore interno del server
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
router.get('/notifiche-segnalazioni/destinatario/:utenteDestinatarioId', tokenChecker, getNotificheSegnalazione);

export default router;