import express from 'express';
import segnalazioneModel from '../models/segnalazione.ts';
import mongoose from 'mongoose';

/**
 * @swagger
 * tags:
 *   name: Segnalazioni
 *   description: API per la gestione delle segnalazioni
 */
export class controllerSegnalazione {
  public router = express.Router();
  
  constructor() {
    this.initializeRoutes();
  }
  
  private initializeRoutes() {
    /**
     * @swagger
     * /segnalazioni:
     *   get:
     *     summary: Recupera tutte le segnalazioni
     *     tags: [Segnalazioni]
     *     responses:
     *       200:
     *         description: Lista di tutte le segnalazioni
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 success:
     *                   type: boolean
     *                 data:
     *                   type: array
     *                   items:
     *                     $ref: '#/components/schemas/Segnalazione'
     *                 count:
     *                   type: integer
     *                 message:
     *                   type: string
     *       500:
     *         description: Errore del server
     */
    this.router.get('/', this.getAllSegnalazioni);
    
    /**
     * @swagger
     * /segnalazioni/{id}:
     *   get:
     *     summary: Recupera una segnalazione tramite ID
     *     tags: [Segnalazioni]
     *     parameters:
     *       - in: path
     *         name: id
     *         schema:
     *           type: string
     *         required: true
     *         description: ID della segnalazione
     *     responses:
     *       200:
     *         description: Dettaglio segnalazione
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 success:
     *                   type: boolean
     *                 data:
     *                   $ref: '#/components/schemas/Segnalazione'
     *                 message:
     *                   type: string
     *       500:
     *         description: Errore del server
     */
    this.router.get('/:id', this.getSegnalazioneById);
    
    /**
     * @swagger
     * /segnalazioni:
     *   post:
     *     summary: Crea una nuova segnalazione
     *     tags: [Segnalazioni]
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             $ref: '#/components/schemas/SegnalazioneInput'
     *     responses:
     *       201:
     *         description: Segnalazione creata con successo
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 message:
     *                   type: string
     *                 data:
     *                   $ref: '#/components/schemas/Segnalazione'
     *       400:
     *         description: Dati invalidi
     *       500:
     *         description: Errore del server
     */
    this.router.post('/', this.createSegnalazione);
    
    /**
     * @swagger
     * /segnalazioni/{id}:
     *   put:
     *     summary: Aggiorna una segnalazione esistente
     *     tags: [Segnalazioni]
     *     parameters:
     *       - in: path
     *         name: id
     *         schema:
     *           type: string
     *         required: true
     *         description: ID della segnalazione
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             $ref: '#/components/schemas/SegnalazioneInput'
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
     *                 data:
     *                   $ref: '#/components/schemas/Segnalazione'
     *                 message:
     *                   type: string
     *       400:
     *         description: Dati non validi
     *       404:
     *         description: Segnalazione non trovata
     *       500:
     *         description: Errore del server
     */
    this.router.put('/:id', this.updateSegnalazione);
    
    /**
     * @swagger
     * /segnalazioni/{id}:
     *   delete:
     *     summary: Elimina una segnalazione
     *     tags: [Segnalazioni]
     *     parameters:
     *       - in: path
     *         name: id
     *         schema:
     *           type: string
     *         required: true
     *         description: ID della segnalazione
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
     *                 data:
     *                   $ref: '#/components/schemas/Segnalazione'
     *                 message:
     *                   type: string
     *       404:
     *         description: Segnalazione non trovata
     *       500:
     *         description: Errore del server
     */
    this.router.delete('/:id', this.deleteSegnalazione);
  }
  
  /**
   * Recupera tutte le segnalazioni
   */
  private getAllSegnalazioni =  async (req, res) => {
    try{
      const segnalazioni = await segnalazioneModel.find();
      return res.status(200).json({
          success: true,
          data: segnalazioni,
          count: segnalazioni.length,
          message: 'Segnalazioni retrieved successfully'
      });   

    } catch (error) {
      return res.status(500).json({
          success: false,
          message: 'Server error',
          error: error.message
      });
    }    
  }
  
  /**
   * Recupera una segnalazione specifica tramite ID
   */
  private getSegnalazioneById = async (req, res) => {
    try{
      const segnalazione = await segnalazioneModel.findById(req.params.id);
      return res.status(200).json({
          success: true,
          data: segnalazione,
          message: 'Segnalazione retrieved successfully'
      });   
    }catch (error) {
      return res.status(500).json({
          success: false,
          message: 'Server error',
          error: error.message
      });
    }    
  }
  
  /**
   * Crea una nuova segnalazione
   */
  private createSegnalazione = async (req, res) => {
    try{
      const dati = req.body;
      if (!dati) {
        return res.status(400).json({
          success: false,
          message: 'Dati non validi'
        });
      }

      // Required fields validation
      const requiredFields = ['tipologia']; // Adjust based on your model
      for (const field of requiredFields) {
        if (!dati[field]) {
          return res.status(400).json({
            success: false,
            message: `Campo obbligatorio mancante: ${field}`
          });
        }
      }

      const nuovaSegnalazione = await segnalazioneModel.create(dati);
      
      
      res.status(201).json({ message: 'Segnalazione creata', data: nuovaSegnalazione });
      res.json({ message: 'Segnalazione creata', data: nuovaSegnalazione });
    }catch(error){
      return res.status(500).json({
          success: false,
          message: 'Server error',
          error: error.message
      });
    }    
  }
  
  /**
   * Aggiorna una segnalazione esistente
   */
  private updateSegnalazione = async (req, res) => {
    try {
      const dati = req.body;
      if (!dati) {
        return res.status(400).json({
          success: false,
          message: 'Dati non validi'
        });
      }

      const segnalazione = await segnalazioneModel.findByIdAndUpdate(
        req.params.id,
        dati,
        { new: true, runValidators: true }
      );

      if (!segnalazione) {
        return res.status(404).json({
          success: false,
          message: 'Segnalazione non trovata'
        });
      }

      return res.status(200).json({
        success: true,
        data: segnalazione,
        message: 'Segnalazione aggiornata con successo'
      });

    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Server error',
        error: error.message
      });
    }
  }
  
  /**
   * Elimina una segnalazione tramite ID
   */
  private deleteSegnalazione = async (req, res) => {  //solo by ID
    try{
      const segnalazione = await segnalazioneModel.findByIdAndDelete(req.params.id);
      if (!segnalazione) {
        return res.status(404).json({
          success: false,
          message: 'Segnalazione not found'
        });
      }
      return res.status(200).json({
          success: true,
          data: segnalazione,
          message: 'Segnalazione deleted successfully'
      });   
    }catch (error) {
      return res.status(500).json({
          success: false,
          message: 'Server error',
          error: error.message
      });
    }    
  }
}

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
 *           description: ID autogenerato della segnalazione
 *         tipologia:
 *           type: string
 *           description: Tipo di segnalazione
 *         descrizione:
 *           type: string
 *           description: Descrizione dettagliata della segnalazione
 *         data:
 *           type: string
 *           format: date
 *           description: Data della segnalazione
 *         stato:
 *           type: string
 *           enum: [aperta, in lavorazione, risolta, chiusa]
 *           description: Stato corrente della segnalazione
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Data di creazione del record
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Data dell'ultimo aggiornamento
 *     SegnalazioneInput:
 *       type: object
 *       required:
 *         - tipologia
 *       properties:
 *         tipologia:
 *           type: string
 *           description: Tipo di segnalazione
 *         descrizione:
 *           type: string
 *           description: Descrizione dettagliata della segnalazione
 *         data:
 *           type: string
 *           format: date
 *           description: Data della segnalazione
 *         stato:
 *           type: string
 *           enum: [aperta, in lavorazione, risolta, chiusa]
 *           description: Stato della segnalazione
 */
 
export default new controllerSegnalazione();