import mongoose, { Document, Schema } from 'mongoose';

const segnalazioneSchema = new Schema({
    timeStamp: {
        type: Date,
        default: Date.now
    },
    coordinateGps: {
        type: {
            type: String,
            enum: ['Point'],
            default: 'Point'
        },
        coordinates: {
            type: [Number],
            required: true
        }
    },
    tipologia: {
        type: String,
        enum: ['RISSA', 'SPACCIO', 'FURTO', 'DEGRADO', 'DISTURBO', 'VANDALISMO', 'ALTRO'],
        required: true
    },
    stato: {
        type: String,
        enum: ["aperto", "chiuso"]
    },
    telefonata: {
        type: Boolean,
        default: false
    },
    media: String,
    descrizione: String,
        idUtente: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'utenteRegistrato',
        required: true
    }
});

const segnalazioneModel = mongoose.model('segnalazione', segnalazioneSchema, 'segnalazioni');
export default segnalazioneModel;