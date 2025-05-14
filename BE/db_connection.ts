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
  coordinateGPS: {
    lat: 46.0705,
    lng: 11.1190
  },
  tipologia: "vandalismo",
  stato: "aperto",
  telefonata: false,
  media: "/uploads/foto123.jpg", // o un URL tipo: "https://sito.it/uploads/foto123.jpg"
  descrizione: "Vetri rotti alla fermata dell'autobus vicino al parco.",
    idUtente: "user_6456a21c8efb"
  });
  
// Save the document to the database
newSegnalazione.save()
    .then(doc => console.log('Document saved:', doc))
    .catch(err => console.error('Error saving document:', err));