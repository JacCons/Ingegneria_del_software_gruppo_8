import mongoose, { Schema } from 'mongoose';
import { utenteRegistratoModel } from './utenteRegistrato.ts';

const utenteComunaleSchema = new Schema({
});

const UtenteComunaleModel = utenteRegistratoModel.discriminator(
    'UtenteComunale', 
    utenteComunaleSchema
);

export default UtenteComunaleModel;