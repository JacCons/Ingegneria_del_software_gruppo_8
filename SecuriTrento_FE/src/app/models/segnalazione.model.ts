export interface Segnalazione {
  _id?: string;
  timeStamp?: Date;
  coordinateGps?: {
    type?: string;
    coordinates?: number[];
  };
  tipologia: 'rissa' | 'spaccio' | 'furto' | 'degrado su mezzo pubblico' | 'disturbo della quiete' | 'vandalismo' | 'altro';
  stato?: 'aperto' | 'chiuso';
  telefonata?: boolean;
  media?: string;
  descrizione?: string;
  idUtente?: string;
}
