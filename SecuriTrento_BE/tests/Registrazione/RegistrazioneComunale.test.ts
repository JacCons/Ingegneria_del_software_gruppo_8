import app from '../../app';
import request from 'supertest';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import UtenteComunaleModel from '../../models/utenteComunale';

var token = jwt.sign({ id: '682dec8ea10f80f9fe3edb80', ruolo: 'UtenteComunale' },
    process.env.SUPER_SECRET, { expiresIn: 86400 }); // create a valid token

describe('Registrazione Utente Comunale', () => {
    beforeAll(async () => { // establish connection to db
        jest.setTimeout(8000);

        if (mongoose.connection.readyState !== 0) {
            await mongoose.connection.close();
        }

        app.locals.db = await mongoose.connect(process.env.MONGODB_URI);
        await new Promise(resolve => setTimeout(resolve, 1000));
    });

    test('dovrebbe registrare un nuovo utente comunale', async () => {
        const res = await request(app)
            .post('/api/utenti/register/comunale')
            .set('Authorization', `Bearer ${token}`) // set the token in the header
            .send({
                nome: 'Giorgio',
                cognome: 'Bianchi',
                telefono: '3398701654',
                password: 'Girolamo87'
            });

        console.log(res.body);
        console.log(res.body.error)
        expect(res.statusCode).toBe(201);
        expect(res.body).toHaveProperty('message');
        let createdUserId = res.body.data._id;
        if (createdUserId) {
            await UtenteComunaleModel.findByIdAndDelete(createdUserId);
            createdUserId = '';
        }
    });

    test('dovrebbe registrare un nuovo utente comunale', async () => {
        const res = await request(app)
            .post('/api/utenti/register/comunale')
            .set('Authorization', `Bearer ${token}`) // set the token in the header
            .send({
                nome: 'Giorgio',
                cognome: 'Bianchi',
                telefono: '3398701654',
                password: 'ciao'
            });

        console.log(res.body);
        expect(res.statusCode).toBe(400);
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