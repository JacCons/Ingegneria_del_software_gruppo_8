import mongoose, { Document, Schema } from 'mongoose';

const segnalazioneSchema = new Schema({
    timeStamp: {
        type: Date,
        default: Date.now
    },
    coordinateGPS: {
        lat: Number,
        lng: Number
    },
    tipologia: {
        type: String,
        enum: ["rissa", "spaccio", "furto", "degrado su mezzo pubblico", "disturbo della quiete","vandalismo", "altro"],
        required: true
    },
    stato: {
        type: String,
        enum: ["aperto", "chiuso"],
        required: true
    },
    telefonata: Boolean,
    media: String,
    descrizione: String,
    idUtente: String
});

const segnalazioneModel = mongoose.model('segnalazione', segnalazioneSchema, 'segnalazioni');
export default segnalazioneModel;