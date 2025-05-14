import express from 'express';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import controllerSegnalazione from './controllers/controllerSegnalazione.ts';

//import segnalazioniRouter from './controllers/controllerSegnalazione.ts';
dotenv.config();
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/securiTrento';

mongoose.connect(MONGODB_URI)
   .then(() => console.log('Successfully connected to MongoDB'))
   .catch(e => console.error('MongoDB connection error:', e.message));

const app = express();
app.use(express.json());

// Register routes with their base paths
app.use('/segnalazioni', controllerSegnalazione.router); //imposto il route path

app.listen(3000, () => {
  console.log(`Server running on port 3000`);
});

// ...rest of your app setup

export default app;