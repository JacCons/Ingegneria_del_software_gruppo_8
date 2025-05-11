import mongoose from 'mongoose';
import segnalazioneModel from './models/segnalazione.ts';

mongoose.connect('mongodb+srv://jacopoconsolaro:aro5NPYUJaGYALWp@cluster0.hjkejiu.mongodb.net/securiTrento')
   .then(() => console.log('OK'))
   .catch(e => console.error('ERR:', e.message));
//aro5NPYUJaGYALWp

// Create a new document based on your model
const newSegnalazione = new segnalazioneModel({
    timeStamp: new Date(),
    coordinateGPS: 4.2313,
    tipologia: "test",
    stato: "aperto",
    telefonata: true,
    media: "foto",
    descrizione: "descriz",
    idUtente: "1283123123123"
  });
  
  // Save the document to the database
  newSegnalazione.save()
    .then(doc => console.log('Document saved:', doc))
    .catch(err => console.error('Error saving document:', err));