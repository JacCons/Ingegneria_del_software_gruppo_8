import { utenteRegistratoModel } from '../models/utenteRegistrato.ts';
import utenteComunaleModel from '../models/utenteComunale.ts';
import utenteFDOModel from '../models/utenteFDO.ts';
import mongoose from 'mongoose';
import express from 'express';
import bcrypt from 'bcrypt';

/**
 * Recupera tutti gli utenti
 */
export const getAllUtenti = async (req, res) => {
    
    const ruolo = req.loggedUser?.ruolo;

    if (ruolo !== 'UtenteComunale') {
        return res.status(403).json({
            success: false,
            message: 'Accesso negato'
        });
    }
    
    try {
        const utenti = await utenteRegistratoModel.find();
        return res.status(200).json({
            success: true,
            data: utenti,
            count: utenti.length,
            message: 'Utenti recuperati con successo'
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Errore del server',
            error: error.message
        });
    }
};

/**
 * Recupera gli utenti per tipo specifico
 */
export const getUtentiByType = async (req, res) => {
    
    const ruolo = req.loggedUser?.ruolo;
    if (ruolo !== 'UtenteComunale') {
        return res.status(403).json({
            success: false,
            message: 'Accesso negato'
        });
    }
    
    try {
        const { tipo } = req.params;
        let utenti;

        switch (tipo) {
            case 'standard':
                utenti = await utenteRegistratoModel.find({ tipoUtente: 'UtenteRegistrato' });
                break;
            case 'comunale':
                utenti = await utenteComunaleModel.find({stato: 'Attivo'});
                break;
            case 'fdo':
                utenti = await utenteFDOModel.find({stato: 'Attivo'});
                break;
            default:
                return res.status(400).json({
                    success: false,
                    message: 'Tipo utente non valido'
                });
        }

        return res.status(200).json({
            success: true,
            data: utenti,
            count: utenti.length,
            message: `Utenti di tipo ${tipo} recuperati con successo`
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Errore del server',
            error: error.message
        });
    }
};

/**
 * Recupera un utente specifico tramite ID
 */
export const getUtenteById = async (req, res) => {
    
    const ruolo = req.loggedUser?.ruolo;

    if (ruolo !== 'UtenteComunale') {
        return res.status(403).json({
            success: false,
            message: 'Accesso negato'
        });
    }
    
    
    try {
        const utente = await utenteRegistratoModel.findById(req.params.id);

        if (!utente) {
            return res.status(404).json({
                success: false,
                message: 'Utente non trovato'
            });
        }

        return res.status(200).json({
            success: true,
            data: utente,
            message: 'Utente recuperato con successo'
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Errore del server',
            error: error.message
        });
    }
};

/**
 * Registra un nuovo utente del tipo specificato
 */
export const registerUser = async (req, res) => {
    try {
        const { tipo } = req.params;
        const {
            nome,
            cognome,
            telefono,
            password,
            // campi specifici per utenteFDO
            TipoFDO,
            zoneDiOperazione,
            disponibilità,
            coordinateGps
        } = req.body;

        if (!nome) {
            return res.status(400).json({
                success: false,
                message: 'Il nome è obbligatorio'
            });
        }
        if (!cognome) {
            return res.status(400).json({
                success: false,
                message: 'Il cognome è obbligatorio'
            });
        }

        if (!password || password.length < 7) {
            return res.status(400).json({
                success: false,
                message: 'La password deve essere di almeno 7 caratteri'
            });
        }

        if (!telefono || telefono.length < 10) {
            return res.status(400).json({
                success: false,
                message: 'Il numero di telefono deve essere di almeno 10 cifre'
            });
        }

        // verifica se il numero di telefono è già in uso
        const existingUser = await utenteRegistratoModel.findOne({ telefono });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'Telefono già registrata'
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        let newUser;

        switch (tipo.toLowerCase()) {
            case 'comunale':

                newUser = new utenteComunaleModel({
                    nome,
                    cognome,
                    telefono,
                    password: hashedPassword,
                    tipoUtente: 'UtenteComunale',
                });
                break;

            case 'fdo':
                /*
                if (!TipoFDO) {
                    return res.status(400).json({
                        success: false,
                        message: 'Il campo TipoFDO è obbligatorio per utenti FDO'
                    });
                }*/

                newUser = new utenteFDOModel({
                    nome,
                    cognome,
                    telefono,
                    password: hashedPassword,
                    TipoFDO,
                    zoneDiOperazione: zoneDiOperazione || [],
                    disponibilità: disponibilità !== undefined ? disponibilità : true,
                    coordinateGps
                });
                break;

            case 'standard':
            default:
                newUser = new utenteRegistratoModel({
                    nome,
                    cognome,
                    telefono,
                    password: hashedPassword
                });
                break;
        }

        const savedUser = await newUser.save();

        return res.status(201).json({
            success: true,
            data: savedUser,
            message: `Utente ${tipo} registrato con successo`
        });

    } catch (error) {
        console.error('Errore registrazione utente:', error);
        return res.status(500).json({
            success: false,
            message: 'Errore del server durante la registrazione',
            error: error.message
        });
    }
};

/**
 * Disattiva un utente esistente
 */
export const deleteUtente = async (req, res) => {  //solo by ID
    
    const ruolo = req.loggedUser?.ruolo;

    if (ruolo !== 'UtenteComunale') {
        return res.status(403).json({
            success: false,
            message: 'Accesso negato'
        });
    }
    
    
    try {
        let utente = await utenteRegistratoModel.findByIdAndUpdate(
            req.params.id, 
            {stato: 'Disattivato'}, 
            { new: true });
        if (!utente) {
            return res.status(404).json({
                success: false,
                message: 'Utente not found'
            });
        }
        return res.status(200).json({
            success: true,
            data: utente,
            message: 'Utente disabled successfully'
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
 * Aggiorna l'utente esistente
 * Permette di aggiornare la password per tutti gli utenti
 * Per utenti FDO permette anche di aggiornare zoneDiOperazione e coordinateGps
 */
export const updateUtente = async (req, res) => {
    
    const ruolo = req.loggedUser?.ruolo;

    if (ruolo !== 'UtenteComunale') {
        return res.status(403).json({
            success: false,
            message: 'Accesso negato'
        });
    }
    
    try {
        const { id } = req.params;
        const { password, zoneDiOperazione, coordinateGps } = req.body;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: 'ID utente non valido'
            });
        }

        const utente = await utenteRegistratoModel.findById(id);
        if (!utente) {
            return res.status(404).json({
                success: false,
                message: 'Utente non trovato'
            });
        }

        const datiAggiornamento = {} as any;

        if (password) {
            if (password.length < 7) {
                return res.status(400).json({
                    success: false,
                    message: 'La password deve essere di almeno 7 caratteri'
                });
            }

            datiAggiornamento.password = await bcrypt.hash(password, 10);
        }

        //update specifici per utenteFDO
        if (utente.tipoUtente === 'UtenteFDO') {
            if (zoneDiOperazione) {
                if (!Array.isArray(zoneDiOperazione)) {
                    return res.status(400).json({
                        success: false,
                        message: 'Il campo zoneDiOperazione deve essere un array'
                    });
                }

                for (const zona of zoneDiOperazione) {
                    if (!zona.coordinateGps || !zona.fasceOrarie || !Array.isArray(zona.fasceOrarie)) {
                        return res.status(400).json({
                            success: false,
                            message: 'Ogni zona deve avere coordinateGps e fasceOrarie valide'
                        });
                    }
                }

                datiAggiornamento.zoneDiOperazione = zoneDiOperazione;
            }

            if (coordinateGps) {
                if (!coordinateGps.coordinates || !Array.isArray(coordinateGps.coordinates)) {
                    return res.status(400).json({
                        success: false,
                        message: 'Il campo coordinateGps deve avere coordinate valide'
                    });
                }

                datiAggiornamento.coordinateGps = coordinateGps;
            }

            if (Object.keys(datiAggiornamento).length === 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Nessun campo valido fornito per l\'aggiornamento'
                });
            }

            const utenteAggiornato = await utenteFDOModel.findByIdAndUpdate(
                id,
                datiAggiornamento,
                { new: true, runValidators: true }
            );

            return res.status(200).json({
                success: true,
                data: utenteAggiornato,
                message: 'Utente FDO aggiornato con successo'
            });
        } else {
            if (Object.keys(datiAggiornamento).length === 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Nessun campo valido fornito per l\'aggiornamento'
                });
            }

            const utenteAggiornato = await utenteRegistratoModel.findByIdAndUpdate(
                id,
                datiAggiornamento,
                { new: true, runValidators: true }
            );

            return res.status(200).json({
                success: true,
                data: utenteAggiornato,
                message: 'Utente aggiornato con successo'
            });
        }
    } catch (error) {
        console.error('Errore aggiornamento utente:', error);
        return res.status(500).json({
            success: false,
            message: 'Errore del server durante l\'aggiornamento',
            error: error.message
        });
    }
};
