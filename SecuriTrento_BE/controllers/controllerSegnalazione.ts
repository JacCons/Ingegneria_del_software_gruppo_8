import segnalazioneModel from '../models/segnalazione.ts';
import mongoose from 'mongoose';
import { utenteRegistratoModel } from '../models/utenteRegistrato.ts';
import { creaNotifichePerNuovaSegnalazione } from './controllerNotifiche.ts';
import express from 'express';

/**
 * Recupera tutte le segnalazioni con filtri opzionali
 */
export const getAllSegnalazioni = async (req, res) => {
  const ruolo = req.loggedUser?.ruolo;
  const { dataDa, dataA, tipologia, stato } = req.query;

  if (ruolo === 'UtenteCittadino') {
    return res.status(403).json({
      success: false,
      message: 'Accesso negato'
    });
  }

  const tipologieValide = ['RISSA', 'SPACCIO', 'FURTO', 'DEGRADO', 'DISTURBO', 'VANDALISMO', 'ALTRO'];
  let tipologieFiltro: any = null;

  if (tipologia) {
    const tipologieInput = Array.isArray(tipologia) ? tipologia : [tipologia];

    tipologieFiltro = tipologieInput
      .map(tip => tip.toUpperCase())
      .filter(tip => tipologieValide.includes(tip));

    if (tipologieInput.length > 0 && tipologieFiltro.length === 0) {
      const tipologieInvalide = tipologieInput.filter(tip => !tipologieValide.includes(tip.toUpperCase()));
      return res.status(400).json({
        success: false,
        message: `Tipologie non valide: ${tipologieInvalide.join(', ')}. Valori consentiti: ${tipologieValide.join(', ')}`
      });
    }

    if (tipologieInput.length !== tipologieFiltro.length) {
      const tipologieInvalide = tipologieInput.filter(tip => !tipologieValide.includes(tip.toUpperCase()));
      console.log(`⚠️ Tipologie ignorate (non valide): ${tipologieInvalide.join(', ')}`);
    }
  }

  const statiValidi = ['aperto', 'chiuso'];
  if (stato && !statiValidi.includes(stato.toLowerCase())) {
    return res.status(400).json({
      success: false,
      message: `Stato non valido. Valori consentiti: ${statiValidi.join(', ')}`
    });
  }

  let dataInizio: Date;
  let dataFine: Date;

  if (dataDa) {
    dataInizio = new Date(dataDa);
    if (isNaN(dataInizio.getTime())) {
      return res.status(400).json({
        success: false,
        message: 'DataDa non valida. Formato richiesto: YYYY-MM-DD o ISO string'
      });
    }
    dataInizio = new Date(Date.UTC(
      dataInizio.getUTCFullYear(),
      dataInizio.getUTCMonth(),
      dataInizio.getUTCDate(),
      0, 0, 0, 0
    ));
  } else {
    const oggi = new Date();
    dataInizio = new Date(Date.UTC(
      oggi.getUTCFullYear(),
      oggi.getUTCMonth(),
      oggi.getUTCDate() - 30,
      0, 0, 0, 0
    ));
  }

  if (dataA) {
    dataFine = new Date(dataA);
    if (isNaN(dataFine.getTime())) {
      return res.status(400).json({
        success: false,
        message: 'DataA non valida. Formato richiesto: YYYY-MM-DD o ISO string'
      });
    }
    dataFine = new Date(Date.UTC(
      dataFine.getUTCFullYear(),
      dataFine.getUTCMonth(),
      dataFine.getUTCDate(),
      23, 59, 59, 999
    ));
  } else {
    const oggi = new Date();
    dataFine = new Date(Date.UTC(
      oggi.getUTCFullYear(),
      oggi.getUTCMonth(),
      oggi.getUTCDate(),
      23, 59, 59, 999
    ));
  }

  if (dataInizio > dataFine) {
    return res.status(400).json({
      success: false,
      message: `Range di date non valido: dataInizio (${dataInizio.toISOString()}) è successiva a dataFine (${dataFine.toISOString()})`
    });
  }

  try {
    const filtro: any = {};

    if (tipologieFiltro && tipologieFiltro.length > 0) {
      if (tipologieFiltro.length === 1) {
        // Singola tipologia
        filtro.tipologia = tipologieFiltro[0];
      } else {
        // Multiple tipologie - usa $in
        filtro.tipologia = { $in: tipologieFiltro };
      }
    }

    // filtro per stato
    if (stato) {
      filtro.stato = stato.toLowerCase();
    }

    filtro.timeStamp = {
      $gte: dataInizio,
      $lte: dataFine
    };

    if (dataDa === '2025-05-31') {
      console.log('🧪 TEST con date hardcoded per 2025-05-31:');
      const testStart = new Date('2025-05-31T00:00:00.000Z');
      const testEnd = new Date('2025-05-31T23:59:59.999Z');

      const testResult = await segnalazioneModel.find({
        timeStamp: {
          $gte: testStart,
          $lte: testEnd
        }
      }).countDocuments();

      console.log('📊 Test result con date hardcoded:', testResult);
      console.log('📊 Confronto timestamp esempio DB vs query:', {
        dbExample: '2025-05-31T08:55:28.315+00:00',
        queryStart: testStart.toISOString(),
        queryEnd: testEnd.toISOString(),
        isInRange: '2025-05-31T08:55:28.315+00:00 >= 2025-05-31T00:00:00.000Z && <= 2025-05-31T23:59:59.999Z'
      });
    }

    const segnalazioni = await segnalazioneModel
      .find(filtro)
      .sort({ timeStamp: -1 })
      .lean();

    return res.status(200).json({
      success: true,
      data: segnalazioni,
      count: segnalazioni.length,
      filtri: {
        tipologie: tipologieFiltro,
        stato: stato || null,
        dataDa: dataInizio.toISOString(),
        dataA: dataFine.toISOString(),
        isDefaultRange: !dataDa && !dataA
      },
      debug: {
        inputDates: { dataDa, dataA },
        processedDates: {
          dataInizio: dataInizio.toISOString(),
          dataFine: dataFine.toISOString()
        }
      },
      message: `${segnalazioni.length} segnalazioni trovate${!dataDa && !dataA ? ' (ultimi 30 giorni)' : ''}`
    });

  } catch (error) {
    console.error('Errore getAllSegnalazioni:', error);
    return res.status(500).json({
      success: false,
      message: 'Errore interno del server',
      error: (error as Error).message
    });
  }
};

/**
 * Recupera una segnalazione specifica tramite ID della segnalazione
 */
export const getSegnalazioneById = async (req, res) => {
  const ruolo = req.loggedUser?.ruolo;

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


export const getSegnalazioniByUtente = async (req, res) => {
  const ruolo = req.loggedUser?.ruolo;
  const idUtente = req.loggedUser.id;

  if (ruolo === 'UtenteFDO' || ruolo === 'UtenteComunale') {
    return res.status(403).json({
      success: false,
      message: 'Accesso negato'
    });
  }

  try {
    const segnalazioni = await segnalazioneModel.find({ idUtente });
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
 * Crea una nuova segnalazione
 */
export const createSegnalazione = async (req, res) => {

  const ruolo = req.loggedUser?.ruolo;
  console.log('Ruolo utente:', ruolo);
  const idUtentetk = req.loggedUser.id;

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
    
    const tipologieValide = ['RISSA', 'SPACCIO', 'FURTO', 'DEGRADO', 'DISTURBO', 'VANDALISMO', 'ALTRO'];

    // check dei parametri obbligatori
    const requiredFields = ['tipologia', 'coordinateGps'];
    for (const field of requiredFields) {
      if (!dati[field]) {
        return res.status(400).json({
          success: false,
          message: `Campo obbligatorio mancante: ${field}`
        });
      }
    }

    if (!dati.descrizione){
      if (dati.descrizione.length > 350) {
        return res.status(400).json({
          success: false,
          message: 'Descrizione non valida: deve essere una stringa di massimo 350 caratteri'
        });
      }
    }

    const tipologiaNormalizzata = dati.tipologia.toUpperCase().trim();
    
    if (!tipologieValide.includes(tipologiaNormalizzata)) {
      return res.status(400).json({
        success: false,
        message: `Tipologia non valida: "${dati.tipologia}". Valori consentiti: ${tipologieValide.join(', ')}`
      });
    }

    if (!mongoose.Types.ObjectId.isValid(idUtentetk)) {
      return res.status(400).json({
        success: false,
        message: 'ID utente non valido'
      });
    }

    const segnalazioneData = {
      tipologia: dati.tipologia,
      descrizione: dati.descrizione || '',
      idUtente: idUtentetk,
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

  const ruolo = req.loggedUser?.ruolo;

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