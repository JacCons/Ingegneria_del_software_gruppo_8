import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import express from 'express';
dotenv.config();

declare global {
    namespace Express {
        interface Request {
            loggedUser?: any;
        }
    }
}

export const tokenChecker = (
    req: express.Request,
    res: express.Response,
    next: express.NextFunction,
) => {

    // header or url parameters or post parameters
    const token = req.headers['authorization']?.split(' ')[1];

    if (!token) res.status(401).json({
        success: false, message: 'No token provided.'
    })
    
    // decode token, verifies secret and checks expiration
    jwt.verify(token, process.env.SUPER_SECRET, function (err, decoded) {
        if (err) {
            return res.status(403).json({ success: false, message: 'Token not valid' });
        } else {
            console.log('Decoded JWT:', decoded); // <-- DEBUG: controlla cosa contiene
            req.loggedUser = decoded;
            next();
        }
    });
};