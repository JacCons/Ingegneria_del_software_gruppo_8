import { Segnalazione } from "./segnalazione.model";

export interface NotificaSegnalazione {
    _id?: string;
    timeStamp: Date;
    tipoNotifica: string;
    idSegnalazione: string;
    segnalazioneCompleta: Segnalazione
    utenteDestinatarioId: string;
}