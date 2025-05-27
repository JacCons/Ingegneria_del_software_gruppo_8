import segnalazioneModel from '../models/segnalazione.ts';
import mongoose from 'mongoose';
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

    // Required fields validation
    const requiredFields = ['tipologia', 'idUtente']; // Adjust based on your model
    for (const field of requiredFields) {
      if (!dati[field]) {
        return res.status(400).json({
          success: false,
          message: `Campo obbligatorio mancante: ${field}`
        });
      }
    }

    // Verify idUtente is a valid MongoDB ObjectId
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
    };

    const nuovaSegnalazione = await segnalazioneModel.create(segnalazioneData);
    res.status(201).json({ message: 'Segnalazione creata', data: nuovaSegnalazione });
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