import mongoose, { Document, Schema } from 'mongoose';

const segnalazioneSchema = new Schema({
    timeStamp: Date,
    coordinateGPS: Number,
    tipologia: String,
    stato: String,
    telefonata: Boolean,
    media: String,
    descrizione: String,
    idUtente: String
});

const segnalazioneModel = mongoose.model('segnalazione', segnalazioneSchema, 'segnalazioni');
export default segnalazioneModel;