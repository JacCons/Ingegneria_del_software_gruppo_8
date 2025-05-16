import mongoose, { Document, Schema } from 'mongoose';

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
    }
    //storicoSegnalazioni: lista di segnalazioni
});

const utenteRegistratoModel = mongoose.model('utenteCittadino', utenteRegistratoSchema, 'utentiCittadini');
export default utenteRegistratoModel;