import app from '../../app';
import request from 'supertest';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';

var token = jwt.sign({ id: '682dec8ea10f80f9fe3edb80', ruolo: 'UtenteComunale' },
    process.env.SUPER_SECRET, { expiresIn: 86400 }); // create a valid token

var token_cittadino = jwt.sign({ id: '6845748544ab7b1854aa440e', ruolo: 'UtenteCittadino' },
    process.env.SUPER_SECRET, { expiresIn: 86400 }); // create a valid token


describe('GET di tutti gli utenti', () => {
    beforeAll(async () => {
        jest.setTimeout(8000);
        await mongoose.connect(process.env.MONGODB_URI!);
    });

    afterAll(async () => {
        await mongoose.connection.close();
    });

    test('dovrebbe ritornare tutti gli utenti', async () => {
        const res = await request(app)
            .get('/api/utenti')
            .set('Authorization', `Bearer ${token}`)
        console.log(res.body);
        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty('message');
        expect(res.body).toHaveProperty('data');
        expect(res.body).toHaveProperty('count');
    });

    test('Non dovrebbe ritornare tutti gli utenti perché il token appartiene ad un utente cittadino', async () => {
        const res = await request(app)
            .get('/api/utenti')
            .set('Authorization', `Bearer ${token_cittadino}`)
        console.log(res.body);
        expect(res.statusCode).toBe(403);
        expect(res.body).toHaveProperty('message');
    });

    test('Non dovrebbe ritornare tutti gli utenti perché il token appartiene ad un utente cittadino', async () => {
        const res = await request(app)
            .get('/api/utenti/comunale')
            .set('Authorization', `Bearer ${token}`)
        console.log(res.body);
        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty('message');
    });

    test('Non dovrebbe ritornare tutti gli utenti perché il token appartiene ad un utente cittadino', async () => {
        const res = await request(app)
            .get('/api/utenti/ciao')
            .set('Authorization', `Bearer ${token}`)
        console.log(res.body);
        expect(res.statusCode).toBe(400);
        expect(res.body).toHaveProperty('message');
    });

    test('Non dovrebbe ritornare tutti gli utenti perché il token appartiene ad un utente cittadino', async () => {
        const res = await request(app)
            .get('/api/utenti/id/6845748544ab7b1854aa440e')
            .set('Authorization', `Bearer ${token}`)
        console.log(res.body);
        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty('message');
        expect(res.body).toHaveProperty('data');
    });


});