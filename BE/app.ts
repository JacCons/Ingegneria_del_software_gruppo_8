import express from 'express';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import swaggerSpec from './config/swaggerConfig.ts';
import swaggerUi from 'swagger-ui-express';
import routerSegnalazione from './routes/routerSegnalazione.ts';


dotenv.config();
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/securiTrento';

mongoose.connect(MONGODB_URI)
   .then(() => console.log('Successfully connected to MongoDB'))
   .catch(e => console.error('MongoDB connection error:', e.message));

const app = express();
app.use(express.json());

app.use('/segnalazioni', routerSegnalazione); //imposto il route path
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));


app.listen(3000, () => {
  console.log(`Server running on port 3000`);
  console.log(`Swagger documentation available at http://localhost:3000/api-docs`);
});

export default app;