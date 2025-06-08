import app from '../../app';
import request from 'supertest';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import utenteFDOModel from '../../models/utenteFDO.ts';

var token = jwt.sign({ id: '682dec8ea10f80f9fe3edb80', ruolo: 'UtenteComunale' },
    process.env.SUPER_SECRET, { expiresIn: 86400 }); // create a valid token


var token_cittadino = jwt.sign({ id: '6845748544ab7b1854aa440e', ruolo: 'UtenteCittadino' },
    process.env.SUPER_SECRET, { expiresIn: 86400 }); // create a valid token

describe('Registrazione Utente FDO', () => {
    beforeAll(async () => { // establish connection to db
        jest.setTimeout(8000);

        if (mongoose.connection.readyState !== 0) {
            await mongoose.connection.close();
        }

        app.locals.db = await mongoose.connect(process.env.MONGODB_URI);
        await new Promise(resolve => setTimeout(resolve, 1000));
    });

    test('dovrebbe registrare un nuovo utente FDO', async () => {
        const res = await request(app)
            .post('/api/utenti/register/fdo')
            .set('Authorization', `Bearer ${token}`) // set the token in the header
            .send({
                nome: 'Poliziotto',
                cognome: 'Bravo',
                TipoFDO: 'POLIZIA',
                telefono: '3368701655',
                password: 'Polizia-123'
            });

        console.log(res.body);
        expect(res.statusCode).toBe(201);
        expect(res.body).toHaveProperty('message');
        let createdUserId = res.body.data._id;
        if (createdUserId) {
            await utenteFDOModel.findByIdAndDelete(createdUserId);
            createdUserId = '';
        }
    });


    test('non dovrebbe registrare un nuovo utente FDO perché TipoFDO non è valido', async () => {
        const res = await request(app)
            .post('/api/utenti/register/fdo')
            .set('Authorization', `Bearer ${token}`) // set the token in the header
            .send({
                nome: 'Poliziotto',
                cognome: 'Bravo',
                TipoFDO: '',
                telefono: '3367701654',
                password: 'Polizia-123'
            });

        console.log(res.body);
        expect(res.statusCode).toBe(400);
        expect(res.body).toHaveProperty('message');
    });


    test('non dovrebbe registrare un nuovo utente FDO perché l utente autenticato è un cittadino', async () => {
        const res = await request(app)
            .post('/api/utenti/register/fdo')
            .set('Authorization', `Bearer ${token_cittadino}`) // set the token in the header
            .send({
                nome: 'Poliziotto',
                cognome: 'Bravo',
                TipoFDO: 'POLIZIA',
                telefono: '3367701654',
                password: 'Polizia-123'
            });

        console.log(res.body);
        expect(res.statusCode).toBe(403);
        expect(res.body).toHaveProperty('message');
    });

});

afterAll(async () => {
    try {
        await mongoose.connection.close(true);
        await mongoose.disconnect();
    } catch (error) {
        console.error('Error closing the database connection:', error);
    }
});
