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
            type: [Number]
        }
    },
    tipologia: {
        type: String,
        enum: ["rissa", "spaccio", "furto", "degrado su mezzo pubblico", "disturbo della quiete","vandalismo", "altro"],
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
    idUtente: String
});

const segnalazioneModel = mongoose.model('segnalazione', segnalazioneSchema, 'segnalazioni');
export default segnalazioneModel;