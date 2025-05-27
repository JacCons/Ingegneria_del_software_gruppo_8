import { utenteRegistratoModel } from '../models/utenteRegistrato.ts';
import mongoose from 'mongoose';
import express from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
dotenv.config();

export const verificaUtente = async (req, res) => {
    const { telefono, password } = req.body;

    try {
        const utente = await utenteRegistratoModel.findOne({ telefono });
        if (!utente) {
            return res.status(401).json({ message: 'Utente non trovato' });
        }

        const isPasswordValid = await bcrypt.compare(password, utente.password);
        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Password errata' });
        }

        const token = jwt.sign(
            { id: utente._id, ruolo: utente.tipoUtente },
            process.env.SUPER_SECRET!,
            { expiresIn: '1h' }
        );

        return res.status(200).json({
            message: 'Login effettuato con successo',
            token,
            utente
        });
    } catch (error) {
        return res.status(500).json({
            message: 'Errore del server',
            error: error.message
        });
    }
}




