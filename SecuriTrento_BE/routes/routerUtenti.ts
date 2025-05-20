import express from 'express';
import {generaCoordinateTrento} from '../middleware/middlewareGPS.ts'

import {
    getAllUtenti,
    getUtentiByType,
    getUtenteById,
    registerUser,
    deleteUtente
} from '../controllers/controllerUtente.ts';

const router = express.Router();

router.get('/', getAllUtenti);
router.get('/:tipo', getUtentiByType);
router.get('/id/:id', getUtenteById);
router.post('/register/:tipo', registerUser);
router.delete('/id/:id', deleteUtente);


export default router;