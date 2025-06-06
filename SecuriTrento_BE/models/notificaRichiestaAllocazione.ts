import mongoose, { Schema } from 'mongoose';
import richiestaAllocazioneModel from './richiestaAllocazione.ts';
import UtenteFDOModel from './utenteFDO.ts';

const notificaRichiestaAllocazioneSchema = new Schema({
    timestamp: {
        type: Date,
        default: Date.now,
        required: true
    },
    tipoNotifica: {
        type: String,
        default: 'Richiesta Allocazione',
        immutable: true
    },
    richiestaAllocazioneId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'richiestaAllocazione',
        required: true
    },
    idUtenteFDO: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'UtenteFDO',
        required: true
    }
});

export default mongoose.model('notificaRichiestaAllocazione', notificaRichiestaAllocazioneSchema, 'notificheRichiestaAllocazione');
