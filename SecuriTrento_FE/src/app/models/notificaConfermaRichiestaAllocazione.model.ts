import { RichiestaAllocazione } from "./richieste-allocazione.model";
import { Utente } from "./utente.model";

export interface NotificaConfermaRichiestaAllocazione {
    _id?: string;
    timestamp: Date;
    richiestaAllocazione: RichiestaAllocazione;
    utenteFDO: Utente;
}