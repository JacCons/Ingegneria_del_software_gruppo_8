import express from 'express';
import segnalazioneModel from '../models/segnalazione.ts';
import mongoose from 'mongoose';

export class controllerSegnalazione {
  public router = express.Router();
  
  constructor() {
    this.initializeRoutes();
  }
  
  private initializeRoutes() {
    this.router.get('/', this.getAllSegnalazioni); //associa la funzione getAllSegnalazioni alla chiamata get sul path '/'
    this.router.get('/:id', this.getSegnalazioneById);
    this.router.post('/', this.createSegnalazione);
    this.router.put('/:id', this.updateSegnalazione);
    this.router.delete('/:id', this.deleteSegnalazione);
  }
  
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
  
  private updateSegnalazione = (req, res) => { // solo by ID
    res.json({ message: `Segnalazione ${req.params.id} aggiornata` });
  }
  
  private deleteSegnalazione = (req, res) => {  //solo by ID
    res.json({ message: `Segnalazione ${req.params.id} eliminata` });
  }
}

export default new controllerSegnalazione();