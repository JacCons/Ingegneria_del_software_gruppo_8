import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import request from 'supertest';
import app from '../../app';

var token = jwt.sign({ id: '6845748544ab7b1854aa440e', ruolo: 'UtenteCittadino' },
  process.env.SUPER_SECRET, { expiresIn: 86400 }); // create a valid jwt token

var tokenComunale = jwt.sign({ id: '682dec8ea10f80f9fe3edb80', ruolo: 'UtenteComunale' },
  process.env.SUPER_SECRET, { expiresIn: 86400 }); // create a valid jwt token

var tokenFDO = jwt.sign({ id: '68359370093b78890eeb69c2', ruolo: 'UtenteFDO' },
  process.env.SUPER_SECRET, { expiresIn: 86400 }); // create a valid jwt token

describe('Richiesta Allocazione FDO', () => {
  beforeAll(async () => { // establish connection to db
    jest.setTimeout(8000);

    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.close();
    }

    app.locals.db = await mongoose.connect(process.env.MONGODB_URI);
    await new Promise(resolve => setTimeout(resolve, 1000));
  });

  test('dovrei vedere le richieste di allocazione se sono un UtenteCounale', async () => {
    const res = await request(app)
      .get('/api/richieste-allocazione')
      .set('Authorization', `Bearer ${tokenComunale}`);
    console.log(res.body);
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('message');
  });

  test('dovrei vedere le richieste di allocazione se sono un UtenteFDO', async () => {
    const res = await request(app)
      .get('/api/richieste-allocazione')
      .set('Authorization', `Bearer ${tokenFDO}`);
    console.log(res.body);
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('message');
  });

  test('non dovrei vedere le richieste di allocazione se sono un UtenteCittadino', async () => {
    const res = await request(app)
      .get('/api/richieste-allocazione')
      .set('Authorization', `Bearer ${token}`);
    console.log(res.body);
    expect(res.statusCode).toBe(403);
    expect(res.body).toHaveProperty('message');
  });

  test('dovrei non poter creare una richiesta di allocazione se sono un UtenteCittadino', async () => {
    const res = await request(app)
      .post('/api/richieste-allocazione')
      .set('Authorization', `Bearer ${token}`)
      .send({
        zonaDiOperazione: {
          coordinateGps: {
            coordinates: [11.1219, 46.0677], // Coordinate di Trento
            raggio: 1000
          },
          fasciaOraria: 15,
          giornoSettimana: "lunedi"
        }
      });
    console.log(res.body);
    expect(res.statusCode).toBe(403);
    expect(res.body).toHaveProperty('message');
  });

    test('dovrei poter creare una richiesta di allocazione se sono un UtenteCommunale', async () => {
    const res = await request(app)
      .post('/api/richieste-allocazione')
      .set('Authorization', `Bearer ${tokenComunale}`)
      .send({
        zonaDiOperazione: {
          coordinateGps: {
            coordinates: [11.1219, 46.0677], // Coordinate di Trento
            raggio: 1000
          },
          fasciaOraria: 17,
          giornoSettimana: 'Lunedi'
        }
      });
    console.log(res.body.error);
    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('message');
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