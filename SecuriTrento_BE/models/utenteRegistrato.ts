import mongoose, { Document, Schema } from 'mongoose';

const opzioniSchema = {
    discriminatorKey: 'tipoUtente',
    collection: 'utenti'
};

const utenteRegistratoSchema = new Schema({
    nome: {
        type: String,
        required: true
    },
    cognome: {
        type: String,
        required: true
    },
    telefono: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    tipoUtente: {
        type: String,
        default: 'UtenteCittadino'
    }
}, opzioniSchema);

utenteRegistratoSchema.set('toJSON', {
    transform: function (doc, ret) {
        delete ret.password;  // remove password field when exposing
        return ret;
    }
});

const utenteRegistratoModel = mongoose.model('utenteRegistrato', utenteRegistratoSchema);
export { utenteRegistratoSchema, utenteRegistratoModel };