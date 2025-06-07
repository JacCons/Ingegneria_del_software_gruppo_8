import mongoose, { Schema } from 'mongoose';

const richiestaAllocazioneSchema = new Schema({
    timeStamp: {
        type: Date,
        default: Date.now
    },
    zonaDiOperazione: {
        coordinateGps: {
            type: {
                type: String,
                enum: ['Point'],
                default: 'Point'
            },
            coordinates: {
                type: [Number],
                required: true
            },
            raggio: {
                type: Number,
                required: true
            }
        },
        fasciaOraria: {
            type: Number,
            validate: {
                validator: function (v) {
                    return Number.isInteger(v) && v >= 0 && v <= 23;
                },
                message: 'La fascia oraria deve essere un numero intero tra 0 e 23' //0 = 00:00 - 00:59
            },
            required: true
        },
        giornoSettimana: {
            type: String,
            enum: ['Lunedi', 'Martedi', 'Mercoledi', 'Giovedi', 'Venerdi', 'Sabato', 'Domenica'],
            required: true
        }
    },
    stato: {
        type: String,
        enum: ["accettato", "in attesa"],
        default: "in attesa"
    },
});

const richiestaAllocazioneModel = mongoose.model('richiestaAllocazione', richiestaAllocazioneSchema, 'richiesteAllocazione');
export default richiestaAllocazioneModel;