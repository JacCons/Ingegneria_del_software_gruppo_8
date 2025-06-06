export interface NotificaSegnalazione {
    _id?: string;
    timeStamp: Date;
    tipoNotifica: string;
    idSegnalazione: string;
    utenteDestinatarioId: string;
}