import express from 'express';
import {generaCoordinateTrento} from '../middleware/middlewareGPS.ts'

import {
  getAllSegnalazioni,
  getSegnalazioneById,
  createSegnalazione,
  updateSegnalazione,
  deleteSegnalazione
} from '../controllers/controllerSegnalazione.ts';

const router = express.Router();

router.get('/', getAllSegnalazioni);
router.get('/:id', getSegnalazioneById);
router.post('/',generaCoordinateTrento, createSegnalazione);
router.put('/:id', updateSegnalazione);
router.delete('/:id', deleteSegnalazione);

export default router;