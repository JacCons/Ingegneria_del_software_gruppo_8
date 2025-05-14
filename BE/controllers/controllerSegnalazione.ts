import express from 'express';
import segnalazioneModel from '../models/segnalazione.ts';

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
  
  private getAllSegnalazioni = (req, res) => {
    res.json({ message: 'Lista segnalazioni' });
  }
  
  private getSegnalazioneById = (req, res) => {
    res.json({ message: `Dettaglio segnalazione ${req.params.id}` });
  }
  
  private createSegnalazione = (req, res) => {
    res.json({ message: 'Segnalazione creata', data: req.body });
  }
  
  private updateSegnalazione = (req, res) => {
    res.json({ message: `Segnalazione ${req.params.id} aggiornata` });
  }
  
  private deleteSegnalazione = (req, res) => {
    res.json({ message: `Segnalazione ${req.params.id} eliminata` });
  }
}

export default new controllerSegnalazione();