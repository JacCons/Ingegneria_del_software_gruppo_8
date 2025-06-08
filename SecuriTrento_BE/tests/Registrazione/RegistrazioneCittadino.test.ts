import app from '../../app';
import request from 'supertest';
import mongoose from 'mongoose';

describe('Registrazione Utente Cittadino', () => {
    beforeAll(async () => {
        jest.setTimeout(8000);
        await mongoose.connect(process.env.MONGODB_URI!);
    });

    afterAll(async () => {
        await mongoose.connection.close();
    });

    test('dovrebbe registrare un nuovo utente cittadino', async () => {
        const res = await request(app)
            .post('/api/utenti/register/standard')
            .send({
                nome: 'Mario',
                cognome: 'Rossi',
                telefono: '3558772356',
                password: 'Barca-2Cavallo'
            });
        console.log(res.body);
        expect(res.statusCode).toBe(201);
        expect(res.body).toHaveProperty('message');
    });

    test('Non dovrebbe registrare un nuovo utente cittadino perché i dati non sono validi', async () => {
        const res = await request(app)
            .post('/api/utenti/register/standard')
            .send({
                nome: '',
                cognome: 'Rossi',
                telefono: '3558772356',
                password: 'Barca-2Cavallo'
            });
        console.log(res.body);
        expect(res.statusCode).toBe(400);
        expect(res.body).toHaveProperty('message');
    });

    test('Non dovrebbe registrare un nuovo utente cittadino perché i dati non sono validi', async () => {
        const res = await request(app)
            .post('/api/utenti/register/standard')
            .send({
                nome: 'Mario',
                cognome: 'Rossi',
                telefono: '3558772356',
                password: '1234'
            });
        console.log(res.body);
        expect(res.statusCode).toBe(400);
        expect(res.body).toHaveProperty('message');
    });

    test('Non dovrebbe registrare un nuovo utente cittadino perché i dati non sono validi', async () => {
        const res = await request(app)
            .post('/api/utenti/register/standard')
            .send({
                nome: 'Mario',
                cognome: '',
                telefono: '355',
                password: '1234'
            });
        console.log(res.body);
        expect(res.statusCode).toBe(400);
        expect(res.body).toHaveProperty('message');
    });

    test('Non dovrebbe registrare un nuovo utente cittadino perché esiste già un utente a cui è associato il numero di telefono inserito', async () => {
        const res = await request(app)
            .post('/api/utenti/register/standard')
            .send({
                nome: 'Mario',
                cognome: 'Rossi',
                telefono: '1111111111',
                password: '1234'
            });
        console.log(res.body);
        expect(res.statusCode).toBe(400);
        expect(res.body).toHaveProperty('message');
    });
});
