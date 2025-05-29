import segnalazioneModel from '../models/segnalazione.ts';
import mongoose from 'mongoose';
import { utenteRegistratoModel } from '../models/utenteRegistrato.ts';
import { creaNotifichePerNuovaSegnalazione } from './controllerNotifiche.ts';
import express from 'express';

/**
 * Recupera tutte le segnalazioni
 */
export const getAllSegnalazioni = async (req, res) => {

  const ruolo = req.loggedUser?.ruolo;
  console.log('Ruolo utente:', ruolo);

  if (ruolo === 'UtenteCittadino') {
    return res.status(403).json({
      success: false,
      message: 'Accesso negato'
    });
  }

  try {
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
export const getSegnalazioneById = async (req, res) => {
  const ruolo = req.user?.ruolo;

  if (ruolo === 'UtenteCittadino') {
    return res.status(403).json({
      success: false,
      message: 'Accesso negato'
    });
  }
  
  try {
    const segnalazione = await segnalazioneModel.findById(req.params.id);
    return res.status(200).json({
      success: true,
      data: segnalazione,
      message: 'Segnalazione retrieved successfully'
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
 * Recupera le segnalazioni aperte nelle vicinanze di un utente FDO
 */
export const getSegnalazioniNearby = async (req, res) => {
  try {
    const { fdoId } = req.params;
    const { radius = 5000 } = req.query;
    
    const fdoUser = await utenteRegistratoModel.findOne({
      _id: fdoId,
      tipoUtente: 'UtenteFDO'
    }).lean() as any;
    
    if (!fdoUser) {
      return res.status(400).json({
        success: false,
        message: 'Utente FDO non trovato'
      });
    }
    
    if (!fdoUser.coordinateGps || !fdoUser.coordinateGps.coordinates) {
      return res.status(400).json({
        success: false,
        message: 'Posizione FDO non disponibile'
      });
    }

    const segnalazioniNearby = await segnalazioneModel.find({
      coordinateGps: {
        $near: {
          $geometry: fdoUser.coordinateGps,
          $maxDistance: Number(radius)
        }
      },
      $or: [
        { stato: 'aperto' },
        { stato: { $exists: false } },
        { stato: undefined },
        { stato: null }
      ]
    }).sort({ timeStamp: -1 });
    
    console.log('SEGNALAZIONI VICINE TROVATE:', segnalazioniNearby.length);
    
    return res.status(200).json({
      success: true,
      data: segnalazioniNearby,
      fdoPosition: fdoUser.coordinateGps,
      count: segnalazioniNearby.length,
      searchRadius: Number(radius),
      message: 'Segnalazioni vicine recuperate con successo'
    });
    
  } catch (error) {
    console.error('Errore getSegnalazioniNearby:', error);
    return res.status(500).json({
      success: false,
      message: 'Errore nel recupero segnalazioni nel raggio d\'azione',
      error: error.message
    });
  }
};

/**
 * Crea una nuova segnalazione
 */
export const createSegnalazione = async (req, res) => {
  
  const ruolo = req.user?.ruolo;

  if (ruolo === 'UtenteFDO' || ruolo === 'UtenteComunale') {
    return res.status(403).json({
      success: false,
      message: 'Accesso negato'
    });
  }
  
  try {
    const dati = req.body;
    if (!dati) {
      return res.status(400).json({
        success: false,
        message: 'Dati non validi'
      });
    }

    // check dei parametri obbligatori
    const requiredFields = ['tipologia', 'idUtente', 'coordinateGps'];
    for (const field of requiredFields) {
      if (!dati[field]) {
        return res.status(400).json({
          success: false,
          message: `Campo obbligatorio mancante: ${field}`
        });
      }
    }

    if (!mongoose.Types.ObjectId.isValid(dati.idUtente)) {
      return res.status(400).json({
        success: false,
        message: 'ID utente non valido'
      });
    }
    
    const segnalazioneData = {
      tipologia: dati.tipologia,
      descrizione: dati.descrizione || '',
      idUtente: dati.idUtente,
      coordinateGps: dati.coordinateGps
    };

    const nuovaSegnalazione = await segnalazioneModel.create(segnalazioneData);

    //creazione notifiche per la nuova segnalazione agli utentiFDO in un raggiod i 2.5km
    creaNotifichePerNuovaSegnalazione(nuovaSegnalazione._id.toString())
        .then((notificheCreate) => {
          console.log(`Notifiche create per la segnalazione ${nuovaSegnalazione._id}:`, notificheCreate);
        })
        .catch((error) => {
          console.error(`Errore creazione notifiche per segnalazione ${nuovaSegnalazione._id}:`, error);
        });

    res.status(201).json({ message: 'Segnalazione creata con successo e le FDO vicine sono state avvisate', data: nuovaSegnalazione });
  } catch (error) {
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
export const updateSegnalazione = async (req, res) => {
  
  const ruolo = req.user?.ruolo;

  if (ruolo === 'UtenteFDO' || ruolo === 'UtenteComunale') {
    return res.status(403).json({
      success: false,
      message: 'Accesso negato'
    });
  }
  
  try {
    const allowedFields = ['descrizione', 'media', 'stato'];
    const dati = {};

    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        dati[field] = req.body[field];
      }
    }

    if (Object.keys(dati).length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Nessun campo valido fornito'
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
export const deleteSegnalazione = async (req, res) => {  //solo by ID
  
  // Controlla il ruolo dell'utente
  
  try {
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
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
}