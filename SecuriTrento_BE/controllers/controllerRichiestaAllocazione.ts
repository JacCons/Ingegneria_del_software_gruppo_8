import richiestaAllocazioneModel from '../models/richiestaAllocazione.ts'; 
import mongoose from 'mongoose';
import {creaNotificaConfermaRichiestaAllocazione} from './controllerNotifiche.ts';
import express from 'express';

/**
 * Recupera tutte le richieste allocazione
 */
export const getAllRichiesteAllocazione = async (req, res) => {
  const ruolo = req.loggedUser?.ruolo;
  if (ruolo === 'UtenteCittadino') {
    return res.status(403).json({
      success: false,
      message: 'Accesso negato'
    });
  }

  try {
    const richieste = await richiestaAllocazioneModel.find({stato: "in attesa" });
    return res.status(200).json({
      success: true,
      data: richieste,
      count: richieste.length,
      message: 'Richieste allocazione retrieved successfully'
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
 * Recupera una richiesta allocazione specifica tramite ID
 */
export const getRichiestaAllocazioneById = async (req, res) => {
  const ruolo = req.loggedUser?.ruolo;

  if (ruolo === 'UtenteCittadino') {
    return res.status(403).json({
      success: false,
      message: 'Accesso negato'
    });
  }
  
  try {
    const richiesta = await richiestaAllocazioneModel.findById(req.params.id);
    if (!richiesta) {
      return res.status(404).json({
        success: false,
        message: 'Richiesta allocazione non trovata'
      });
    }
    return res.status(200).json({
      success: true,
      data: richiesta,
      message: 'Richiesta allocazione retrieved successfully'
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
 * Crea una nuova richiesta allocazione
 */
export const createRichiestaAllocazione = async (req, res) => {
  
  
  const ruolo = req.loggedUser?.ruolo;
    console.log('Ruolo utente nella createRichiestaAllocazione:', ruolo);
  if (ruolo !== 'UtenteComunale') {
    return res.status(403).json({
      success: false,
      message: 'Accesso negato'
    });
  }

  console.log('Richiesta di allocazione ricevuta:', req.body);
  
  try {
    const dati = req.body;
    if (!dati) {
      return res.status(400).json({
        success: false,
        message: 'Dati non validi'
      });
    }

    // Required fields validation
    const requiredFields = ['zonaDiOperazione'];
    for (const field of requiredFields) {
      if (!dati[field]) {
        return res.status(400).json({
          success: false,
          message: `Campo obbligatorio mancante: ${field}`
        });
      }
    }

    // Validate zona di operazione
    if (!dati.zonaDiOperazione.coordinateGps?.coordinates || 
        !dati.zonaDiOperazione.fasciaOraria || 
        !dati.zonaDiOperazione.giornoSettimana) {
      return res.status(400).json({
        success: false,
        message: 'Zona di operazione incompleta'
      });
    }

    const richiestaData = {
      zonaDiOperazione: {
        coordinateGps: {
          type: 'Point',
          coordinates: dati.zonaDiOperazione.coordinateGps.coordinates,
          raggio: dati.zonaDiOperazione.coordinateGps.raggio  // Default radius if not provided
        },
        fasciaOraria: dati.zonaDiOperazione.fasciaOraria,
        giornoSettimana: dati.zonaDiOperazione.giornoSettimana
      }
    };

    const nuovaRichiesta = await richiestaAllocazioneModel.create(richiestaData);
    res.status(201).json({ 
      success: true,
      message: 'Richiesta allocazione creata', 
      data: nuovaRichiesta 
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
 * Aggiorna una richiesta allocazione esistente
 */
export const updateRichiestaAllocazione = async (req, res) => {
  const ruolo = req.loggedUser?.ruolo;
  const idFDO = req.loggedUser.id;

  if (ruolo !== 'UtenteFDO') {
    return res.status(403).json({
      success: false,
      message: 'Accesso negato'
    });
  }
  
  try {
    // Imposta sempre lo stato a "accettato"
    const dati = { stato: 'accettato' };

    const richiesta = await richiestaAllocazioneModel.findByIdAndUpdate(
      req.params.id,
      dati,
      { new: true, runValidators: true }
    );

    if (!richiesta) {
      return res.status(404).json({
        success: false,
        message: 'Richiesta allocazione non trovata'
      });
    }
    
    console.log("IDFDO = ",idFDO);
    console.log("richiesta = ", richiesta._id)

    const notifica = await creaNotificaConfermaRichiestaAllocazione(idFDO, richiesta._id.toString());

    return res.status(200).json({
      success: true,
      data: richiesta,
      message: 'Richiesta allocazione aggiornata con successo'
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
 * Elimina una richiesta allocazione tramite ID
 */
export const deleteRichiestaAllocazione = async (req, res) => {
  const ruolo = req.loggedUser?.ruolo;

  if (ruolo !== 'UtenteFDO' && ruolo !== 'UtenteComunale') {
    return res.status(403).json({
      success: false,
      message: 'Accesso negato'
    });
  }
  
  try {
    const richiesta = await richiestaAllocazioneModel.findByIdAndDelete(req.params.id);
    if (!richiesta) {
      return res.status(404).json({
        success: false,
        message: 'Richiesta allocazione non trovata'
      });
    }
    return res.status(200).json({
      success: true,
      data: richiesta,
      message: 'Richiesta allocazione eliminata con successo'
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
}