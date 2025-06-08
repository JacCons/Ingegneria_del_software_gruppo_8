import jwt from 'jsonwebtoken';
import request from 'supertest';
import app from '../../app';
import mongoose from 'mongoose';

var token = jwt.sign({ id: '6843ec9c2ee46eb0e87f0212', ruolo: 'UtenteCittadino' },
  process.env.SUPER_SECRET, { expiresIn: 86400 }); // create a valid jwt token

var tokenComunale = jwt.sign({ id: '682dec8ea10f80f9fe3edb80', ruolo: 'UtenteComunale' },
  process.env.SUPER_SECRET, { expiresIn: 86400 }); // create a valid jwt token


describe('Segnalazioni API', () => {
  beforeAll(async () => { // establish connection to db
    jest.setTimeout(8000);

    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.close();
    }

    app.locals.db = await mongoose.connect(process.env.MONGODB_URI);
    await new Promise(resolve => setTimeout(resolve, 1000));
  });


  test('Dovrebbe creare una segnalazione valida con una tipologia valida, una descrizione valida e coordinate gps valide', async () => {
    const res = await request(app)
      .post('/api/segnalazioni')
      .set('Authorization', `Bearer ${token}`) // set the token in the header
      .send({
        tipologia: 'FURTO',
        descrizione: 'Segnalazione generica di furto',
        telefonata: 'false',
        media: 'https://example.com/media.jpg',
        coordinateGps: {
          coordinates: [11.121, 46.067],
        },
      });
    console.log(res.body.error);
    console.log(res.body.message);
    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('data');
  });

  test('Dovrebbe restituire un errore a causa di una tipologia non esistente', async () => {
    const res = await request(app)
      .post('/api/segnalazioni')
      .set('Authorization', `Bearer ${token}`) // set the token in the header
      .send({
        tipologia: 'tipologiaNonEsistetente',
        descrizione: 'Segnalazione generica di furto',
        telefonata: 'false',
        media: 'https://example.com/media.jpg',
        coordinateGps: {
          coordinates: [11.121, 46.067],
        },
      });
    console.log(res.body.error);
    console.log("status code: ", res.statusCode);
    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty('message');
  });

  test('Dovrebbe restituire un errore a causa della mancanza della tipologia', async () => {
    const res = await request(app)
      .post('/api/segnalazioni')
      .set('Authorization', `Bearer ${token}`) // set the token in the header
      .send({
        descrizione: 'Segnalazione generica di furto',
        telefonata: 'false',
        media: 'https://example.com/media.jpg',
        coordinateGps: {
          coordinates: [11.121, 46.067],
        },
      });
    console.log(res.body.error);
    console.log("status code: ", res.statusCode);
    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty('message');

  });

  test('Dovrebbe restituire un errore a causa della descrizione che supera il limite di 350 caratteri', async () => {
    const res = await request(app)
      .post('/api/segnalazioni')
      .set('Authorization', `Bearer ${token}`) // set the token in the header
      .send({
        tipologia: 'FURTO',
        descrizione: 'Segnalazione generica di furto con descrizione molto lunga che supera i limiti consentiti dalla validazione del server, quindi dovrebbe fallire ma serve ancora più lunga di questa per essere sicuri che la non funzioni siccome il limite è di 350 caratteri ma serve ancora più lunga perchè serve molto molto molto molto molto molto molto molto molto lunga come descrizione',
        telefonata: 'false',
        media: 'https://example.com/media.jpg',
        coordinateGps: {
          coordinates: [11.121, 46.067],
        },
      });
    console.log(res.body.error);
    console.log("status code: ", res.statusCode);
    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty('message');

  });

  test('Dovrebbe restituire un errore a causa della mancanza delle coordinate gps', async () => {
    const res = await request(app)
      .post('/api/segnalazioni')
      .set('Authorization', `Bearer ${token}`) // set the token in the header
      .send({
        tipologia: 'FURTO',
        descrizione: 'Segnalazione generica di furto',
        telefonata: 'false',
        media: 'https://example.com/media.jpg'
      });
    console.log(res.body.error);
    console.log("status code: ", res.statusCode);
    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty('message');

  });

  test('Dovrebbe restituire tutte le segnalazioni', async () => {
    const res = await request(app)
      .get('/api/segnalazioni')
      .set('Authorization', `Bearer ${tokenComunale}`)  // set the token in the header
      .send()
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