import jwt from 'jsonwebtoken';
import request from 'supertest';
import app from '../../app';
import mongoose from 'mongoose';

var token = jwt.sign({ id: '6843ec9c2ee46eb0e87f0212', ruolo: 'UtenteCittadino' },
  process.env.SUPER_SECRET, { expiresIn: 86400 }); // create a valid jwt token

var tokenComunale = jwt.sign({ id: '682dec8ea10f80f9fe3edb80', ruolo: 'UtenteComunale' },
  process.env.SUPER_SECRET, { expiresIn: 86400 }); // create a valid jwt token

var tokenFDO = jwt.sign({ id: '68359370093b78890eeb69c2', ruolo: 'UtenteFDO' },
  process.env.SUPER_SECRET, { expiresIn: 86400 }); // create a valid jwt token


describe('Notifiche API', () => {
  beforeAll(async () => { // establish connection to db
    jest.setTimeout(8000);

    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.close();
    }

    app.locals.db = await mongoose.connect(process.env.MONGODB_URI);
    await new Promise(resolve => setTimeout(resolve, 1000));
  });

  test('Dovrebbe restituire tutte le notifiche segnalazioni dell\' utente', async () => {
    const res = await request(app)
      .get('/api/notifiche/notifiche-segnalazioni')
      .set('Authorization', `Bearer ${tokenFDO}`) // set the token in the header
      .send();
    console.log(res.body);
    console.log(res.body.message)
    console.log(res.body.error);
    console.log("status code: ", res.statusCode);
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('message');
    expect(res.body).toHaveProperty('data');
  });

  test('Dovrebbe restituire le notifiche riguardanti le richieste di allocazioni accettate da un UtenteFDO', async () => {
    const res = await request(app)
      .get('/api/notifiche/notifiche-conferma-richieste-allocazione')
      .set('Authorization', `Bearer ${tokenComunale}`) // set the token in the header
      .send();
    console.log(res.body);
    console.log(res.body.message)
    console.log(res.body.error);
    console.log("status code: ", res.statusCode);
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('message');
    expect(res.body).toHaveProperty('data');
  });

  afterAll(async () => {
    try {
      await mongoose.connection.close(true);
      await mongoose.disconnect();
    } catch (error) {
      console.error('Error closing the database connection:', error);
    }

  });

});