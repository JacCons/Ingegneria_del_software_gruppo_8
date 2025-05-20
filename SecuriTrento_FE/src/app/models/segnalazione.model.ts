export enum TipoSegnalazione {
  RISSA = 'rissa',
  SPACCIO = 'spaccio',
  FURTO = 'furto',
  DEGRADO = 'degrado su mezzo pubblico',
  DISTURBO = 'disturbo della quiete',
  VANDALISMO = 'vandalismo',
  ALTRO = 'altro'
}
export interface Segnalazione {
  _id?: string;
  timeStamp?: Date;
  coordinateGps?: {
    type?: string;
    coordinates?: number[];
  };
  tipologia: TipoSegnalazione;
  stato?: 'aperto' | 'chiuso';
  telefonata?: boolean;
  media?: string;
  descrizione?: string;
  idUtente?: string;
}
