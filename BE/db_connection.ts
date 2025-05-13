import mongoose from 'mongoose';
import dotenv from 'dotenv';
import segnalazioneModel from './models/segnalazione.ts';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/securiTrento';

mongoose.connect(MONGODB_URI)
   .then(() => console.log('Successfully connected to MongoDB'))
   .catch(e => console.error('MongoDB connection error:', e.message));

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