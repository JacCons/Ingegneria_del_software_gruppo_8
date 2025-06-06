export enum GiornoSettimana {
  LUNEDI = 'Lunedi',
  MARTEDI = 'Martedi',
  MERCOLEDI = 'Mercoledi',
  GIOVEDI = 'Giovedi',
  VENERDI = 'Venerdi',
  SABATO = 'Sabato',
  DOMENICA = 'Domenica'
}

export enum StatoRichiesta {
  ACCETTATO = 'accettato',
  IN_ATTESA = 'in attesa'
}

export interface RichiestaAllocazione {
  _id?: string;
  timeStamp?: Date;
  zonaDiOperazione: {
    coordinateGps?: {
      type?: string;
      coordinates?: number[];
    };
    fasciaOraria: number;
    giornoSettimana: GiornoSettimana;
  };
  stato?: StatoRichiesta;
}