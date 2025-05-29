import mongoose, { Schema } from 'mongoose';
import { utenteRegistratoModel } from './utenteRegistrato.ts';

const utenteFDOSchema = new Schema({
    TipoFDO: {
        type: String,
        enum: ['POLIZIA', 'CARABINIERI', 'GUARDIA DI FINANZA'],
        required: true
    },
    zoneDiOperazione: [{
        coordinateGps: {
            type: {
                type: String,
                enum: ['Polygon'],
                default: 'Polygon'
            },
            coordinates: {
                type: [Number],
                required: true
            }
        },
        fasceOrarie: {
            type: [Number],
            validate: {
                validator: function (v) {
                    return v.every(ora => Number.isInteger(ora) && ora >= 0 && ora <= 23);
                },
                message: 'Le fasce orarie devono essere numeri interi tra 0 e 23' //0 = 00:00 - 00:59
            },
            required: true
        },
        giorniSettimana: {
            type: [String],
            enum: ['Lunedi', 'Martedi', 'Mercoledi', 'Giovedi', 'Venerdi', 'Sabato', 'Domenica'],
            default: ['Lunedi', 'Martedi', 'Mercoledi', 'Giovedi', 'Venerdi']
        }
    }],
    disponibilità: {
        type: Boolean, 
        default: true
    },
    idRichiesteAllocazioneAccettate: [{
        type: Schema.Types.ObjectId,
    }],
    coordinateGps: {
        type: {
            type: String,
            enum: ['Point'],
            default: 'Point'
        },
        coordinates: {
            type: [Number]
        }
    },
});

const UtenteFDOModel = utenteRegistratoModel.discriminator(
    'UtenteFDO',
    utenteFDOSchema
);

export default UtenteFDOModel;