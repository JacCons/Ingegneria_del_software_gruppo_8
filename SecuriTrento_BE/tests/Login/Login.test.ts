import app from '../../app';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';


describe('Login API', () => {
  beforeAll(async () => { // establish connection to db
      jest.setTimeout(8000);

      if (mongoose.connection.readyState !== 0) {
        await mongoose.connection.close();
      }

      app.locals.db = await mongoose.connect(process.env.MONGODB_URI);
      await new Promise(resolve => setTimeout(resolve, 1000));
    });

  test('dovrebbe effettuare una login con successo', async () => {
    const res = await request(app)
      .post('/api/login')
      .send({
        telefono: '1111111111',
        password: 'password'
      });
    console.log(res.body);
    expect(res.statusCode).toBe(200); 
    expect(res.body).toHaveProperty('message');
    expect(res.body).toHaveProperty('token');
    expect(res.body).toHaveProperty('utente');
  });

  test('dovrebbe fallire una login con password sbagliata', async () => {
    const res = await request(app)
      .post('/api/login')
      .send({
        telefono: '1111111111',
        password: 'passwordsbagliata'
      });
    console.log(res.body.error);
    console.log(res.body.message);
    expect(res.statusCode).toBe(401); 
    expect(res.body).toHaveProperty('message');
  });

  test('dovrebbe fallire una login con telefono non valido', async () => {
    const res = await request(app)
      .post('/api/login')
      .send({
        telefono: '1111111112',
        password: 'password'
      });
    console.log(res.body);
    expect(res.statusCode).toBe(401); 
    expect(res.body).toHaveProperty('message');
  });

  test('dovrebbe fallire una login con password vuota', async () => {
    const res = await request(app)
      .post('/api/login')
      .send({
        telefono: '1111111111',
        password: ''
      });
    console.log(res.body);
    expect(res.statusCode).toBe(401); 
    expect(res.body).toHaveProperty('message');
  });

  test('dovrebbe fallire una login con telefono vuoto', async () => {
    const res = await request(app)
      .post('/api/login')
      .send({
        telefono: '',
        password: 'password'
      });
    console.log(res.body);
    expect(res.statusCode).toBe(401); 
    expect(res.body).toHaveProperty('message');
  });

    test('dovrebbe fallire una login senza password', async () => {
    const res = await request(app)
      .post('/api/login')
      .send({
        telefono: '1111111111'
      });
    console.log(res.body);
    expect(res.statusCode).toBe(401); 
    expect(res.body).toHaveProperty('message');
  });

  test('dovrebbe fallire una login senza numero di telefono', async () => {
    const res = await request(app)
      .post('/api/login')
      .send({
        password: 'password'
      });
    console.log(res.body);
    expect(res.statusCode).toBe(401); 
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
  


 
