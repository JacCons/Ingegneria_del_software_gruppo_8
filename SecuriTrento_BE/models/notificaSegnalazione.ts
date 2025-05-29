import mongoose, { Schema } from 'mongoose';

const notificaSegnalazioneSchema = new Schema({
  timestamp: {
    type: Date,
    default: Date.now,
    required: true
  },
  tipoNotifica: {
    type: String,
    default: 'segnalazione',
    immutable: true
  },
  idSegnalazione: {
    type: Schema.Types.ObjectId,
    ref: 'Segnalazione',
    required: true
  },
  utenteDestinatarioId: {
    type: Schema.Types.ObjectId,
    ref: 'UtenteRegistrato',
    required: true
  }
}, {
  collection: 'notifiche' 
});

const notificaSegnalazioneModel = mongoose.model('NotificaSegnalazione', notificaSegnalazioneSchema);

export default notificaSegnalazioneModel;