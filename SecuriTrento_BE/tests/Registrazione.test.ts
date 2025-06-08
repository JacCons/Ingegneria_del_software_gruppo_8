import app from '../app';
import request from 'supertest';

describe('Registrazione API', () => {
  test('dovrebbe registrare un nuovo utente', async () => {
    const res = await request(app)
      .post('/api/utenti/register/standard')
      .send({
        nome: 'Mario',
        cognome: 'Rossi',
        telefono: '3558792356',
        password: 'Barca-2Cavallo'
      });
    console.log(res.body);
    expect(res.statusCode).toBe(201); 
    expect(res.body).toHaveProperty('message');
  });
});