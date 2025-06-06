import notificaSegnalazioneModel from "../models/notificaSegnalazione.ts";
import { utenteRegistratoModel } from "../models/utenteRegistrato.ts";
import mongoose from "mongoose";
import segnalazioneModel from "../models/segnalazione.ts";
import express from 'express';

const controllaECreaNotificheSegnalazioni = async (utenteDestinatarioId: string, coordinateGps: any, raggio: number = 2500) => {
    try {
        // trova segnalazioni max 8 ore fa nel raggio specificato
        const timeLimit = new Date(Date.now() - 8 * 60 * 60 * 1000);

        const segnalazioniVicine = await segnalazioneModel.find({
            coordinateGps: {
                $near: {
                    $geometry: coordinateGps,
                    $maxDistance: raggio
                }
            },
            timeStamp: { $gte: timeLimit },
            $or: [
                { stato: 'aperto' },
                { stato: { $exists: false } },
                { stato: null }
            ]
        });

        if (segnalazioniVicine.length === 0) {
            return { nuoveNotifiche: [], count: 0, raggio: raggio };
        }

        // controlla quali segnalazioni non hanno ancora notifica per questo FDO
        const segnalazioniIds = segnalazioniVicine.map(s => s._id);
        const notificheEsistenti = await notificaSegnalazioneModel.find({
            idSegnalazione: { $in: segnalazioniIds },
            destinatario: utenteDestinatarioId
        });

        const segnalazioniGiaNotificate = notificheEsistenti.map(n => n.idSegnalazione.toString());
        const segnalazioniDaNotificare = segnalazioniVicine.filter(
            s => !segnalazioniGiaNotificate.includes(s._id.toString())
        );

        const nuoveNotifiche: any[] = [];
        for (const segnalazione of segnalazioniDaNotificare) {
            const notifica = await notificaSegnalazioneModel.create({
                idSegnalazione: segnalazione._id,
                destinatario: utenteDestinatarioId,
                tipoNotifica: 'segnalazione',
                timestamp: new Date()
            });

            nuoveNotifiche.push(notifica);

            const oreFA = Math.round((Date.now() - segnalazione.timeStamp.getTime()) / (1000 * 60 * 60));
        }

        return {
            nuoveNotifiche: nuoveNotifiche,
            count: nuoveNotifiche.length,
            segnalazioniTotaliVicine: segnalazioniVicine.length,
            raggio: raggio
        };

    } catch (error) {
        console.error('Errore controllo segnalazioni:', error);
        return { nuoveNotifiche: [], count: 0, raggio: raggio, error: error.message };
    }
};

export const getNotificheSegnalazione = async (req, res) => {
    try {
        const { utenteDestinatarioId } = req.params;
        const { autoCheck = 'false', raggio = '2500' } = req.query;

        if (!utenteDestinatarioId) {
            return res.status(400).json({
                success: false,
                message: 'utenteDestinatarioId è richiesto'
            });
        }

        if (!mongoose.Types.ObjectId.isValid(utenteDestinatarioId)) {
            return res.status(400).json({
                success: false,
                message: 'utenteDestinatarioId non è un ID valido'
            });
        }

        // check raggio d'azione
        const raggio_m = parseInt(raggio as string);
        if (isNaN(raggio_m) || raggio_m <= 0 || raggio_m > 50000) {
            return res.status(400).json({
                success: false,
                message: 'Il raggio deve essere un numero positivo e massimo 50km (50000 metri)',
                error: 'INVALID_RADIUS'
            });
        }

        // controllo se l'utente esiste
        const utenteEsistente = await utenteRegistratoModel.findById(utenteDestinatarioId).lean() as any;

        if (!utenteEsistente) {
            console.log(`Utente non trovato: ${utenteDestinatarioId}`);
            return res.status(404).json({
                success: false,
                message: `Utente con ID ${utenteDestinatarioId} non trovato`,
                error: 'USER_NOT_FOUND'
            });
        }

        if (utenteEsistente.tipoUtente === 'UtenteFDO') {

            let nuoveNotificheCreate = 0;
            let controlloEffettuato = false;
            let errorControllo = null;
            let raggioUtilizzato = raggio_m;

            // check delle segnalazioni solo se autoCheck = true
            if (autoCheck === 'true' && utenteEsistente.coordinateGps) {
                controlloEffettuato = true;

                const risultatoControllo = await controllaECreaNotificheSegnalazioni(
                    utenteDestinatarioId,
                    utenteEsistente.coordinateGps,
                    raggio_m
                );

                nuoveNotificheCreate = risultatoControllo.count;
                errorControllo = risultatoControllo.error || null;
                raggioUtilizzato = risultatoControllo.raggio;


            } else if (autoCheck === 'true' && !utenteEsistente.coordinateGps) {
                console.error(`check notifiche richiesto ma FDO ${utenteEsistente.nome} senza coordinate GPS`);
            } else {
                console.error(`recupero notifiche esistenti (senza auto-controllo) per ${utenteEsistente.nome}`);
            }

            const notifiche = await notificaSegnalazioneModel
                .find({
                    destinatario: utenteDestinatarioId,
                    tipoNotifica: 'segnalazione'
                })
                .populate('idSegnalazione', 'tipologia descrizione coordinateGps timeStamp stato')
                .populate('destinatario', 'nome cognome')
                .sort({ timestamp: -1 }); // ordina per data decrescente

            const notificheConSegnalazioniComplete = await caricaSegnalazioniComplete(notifiche);

            res.status(200).json({
                success: true,
                data: notificheConSegnalazioniComplete,
                count: notificheConSegnalazioniComplete.length,
                autoCheck: autoCheck === 'true',
                controlloEffettuato: controlloEffettuato,
                nuoveNotificheCreate: nuoveNotificheCreate,
                raggio: raggioUtilizzato,
                raggioKm: (raggioUtilizzato / 1000).toFixed(1),
                errorControllo: errorControllo,
                destinatario: {
                    _id: utenteEsistente._id,
                    nome: utenteEsistente.nome,
                    cognome: utenteEsistente.cognome,
                    tipoUtente: utenteEsistente.tipoUtente
                },
                message: autoCheck === 'true'
                    ? controlloEffettuato
                        ? `Trovate ${notificheConSegnalazioniComplete.length} notifiche (${nuoveNotificheCreate} nuove create nel raggio di ${(raggioUtilizzato / 1000).toFixed(1)}km)`
                        : `Trovate ${notificheConSegnalazioniComplete.length} notifiche (auto-controllo non effettuato - no coordinate)`
                    : `Trovate ${notificheConSegnalazioniComplete.length} notifiche per ${utenteEsistente.nome} ${utenteEsistente.cognome}`
            });
        } else {
            res.status(400).json({
                success: false,
                message: `L'utente con ID ${utenteDestinatarioId} non è un UtenteFDO`,
                error: 'USER_NOT_FDO'
            });
        }

    } catch (error) {
        console.error('Errore nel recupero notifiche:', error);
        res.status(500).json({
            success: false,
            message: 'Errore interno del server',
            error: error.message
        });
    }
}

const caricaSegnalazioniComplete = async (notifiche: any[]): Promise<any[]> => {
    try {
        const segnalazioniIds = notifiche.map(notifica => 
            notifica.idSegnalazione._id || notifica.idSegnalazione
        );

        console.log(`🔍 Caricamento ${segnalazioniIds.length} segnalazioni complete...`);

        const segnalazioniComplete = await segnalazioneModel.find({
            _id: { $in: segnalazioniIds }
        }).lean(); // .lean() per performance migliori

        const segnalazioniMap = new Map();
        segnalazioniComplete.forEach(segnalazione => {
            segnalazioniMap.set(segnalazione._id.toString(), segnalazione);
        });

        // aggiungi segnalazione completa a ogni notifica
        const notificheArricchite = notifiche.map(notifica => {
            const segnalazioneId = notifica.idSegnalazione._id || notifica.idSegnalazione;
            const segnalazioneCompleta = segnalazioniMap.get(segnalazioneId.toString());

            return {
                ...notifica.toObject(),
                segnalazioneCompleta: segnalazioneCompleta || null
            };
        });

        return notificheArricchite;

    } catch (error) {
        console.error('❌ Errore caricamento segnalazioni complete:', error);
        // ritorna le notifiche originali se fallisce
        return notifiche.map(n => ({ ...n.toObject(), segnalazioneCompleta: null }));
    }
};

export const creaNotifichePerNuovaSegnalazione = async (idSegnalazione: string) => {
    try {
        const segnalazione = await segnalazioneModel.findById(idSegnalazione);
        if (!segnalazione || !segnalazione.coordinateGps) {
            console.log(`Segnalazione non trovata o senza coordinate`);
            return [];
        }

        // trova FDO nel raggio di 2500 metri
        const fdoVicini = await utenteRegistratoModel.find({
            tipoUtente: 'UtenteFDO',
            coordinateGps: {
                $near: {
                    $geometry: segnalazione.coordinateGps,
                    $maxDistance: 2500
                }
            }
        });

        // crea notifiche per tutti gli FDO vicini
        const notificheCreate: any[] = [];
        for (const fdo of fdoVicini) {
            // controlla se esiste già una notifica
            const notificaEsistente = await notificaSegnalazioneModel.findOne({
                idSegnalazione: idSegnalazione,
                destinatario: fdo._id
            });

            if (!notificaEsistente) {
                const notifica = await notificaSegnalazioneModel.create({
                    idSegnalazione: idSegnalazione,
                    destinatario: fdo._id,
                    tipoNotifica: 'segnalazione',
                    timestamp: new Date()
                });
                notificheCreate.push(notifica);
                console.log(`Notifica creata per FDO ${fdo.nome} ${fdo.cognome}`);
            } else {
                console.log(`Notifica già esistente per FDO ${fdo.nome} ${fdo.cognome}`);
            }
        }

        return notificheCreate;

    } catch (error) {
        console.error('Errore creazione notifiche per nuova segnalazione:', error);
        return [];
    }
}

export const getNotificheRichiesteAllocazione = async (req, res) => {
    //restituire le notifiche CONFERMA RICHIESTA ALLOCAZIONE (IGNORA IL CAMPO DESTINATARIO,
    //  per le richieste allocazione non è necessario, devi restituire TUTTE le notifiche di tipo "richiestaAllocazione"
    // che rappresentano la CONFERMA RICHIESTA ALLOCAZIONE)

    try {
        const notifiche = [];

        res.status(200).json({
            success: true,
            data: notifiche,
            count: notifiche.length,
            message: 'Funzionalità notifiche richieste allocazione in sviluppo'
        });

    } catch (error) {
        console.error('Errore nel recupero notifiche richieste allocazione:', error);
        res.status(500).json({
            success: false,
            message: 'Errore interno del server',
            error: error.message
        });
    }
}
