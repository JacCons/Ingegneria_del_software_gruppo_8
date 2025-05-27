export enum TipoUtente {
    CITTADINO = 'UtenteCittadino',
    COMUNALE = 'UtenteComune',
    FDO = 'UtenteFDO'
}

export enum TipoFDO {
    POLIZIA = 'POLIZIA',
    CARABINIERI = 'CARABINIERI',
    GUARDIA_DI_FINANZA = 'GUARDIA DI FINANZA'
}

export type GiornoSettimana = 'Lunedi' | 'Martedi' | 'Mercoledi' | 'Giovedi' | 'Venerdi' | 'Sabato' | 'Domenica';

export interface GeoPoint {
    type: 'Point';
    coordinates: number[]; // [longitude, latitude]
}

export interface GeoPolygon {
    type: 'Polygon';
    coordinates: number[]; // Array of coordinates forming a polygon
}

export interface ZonaDiOperazione {
    coordinateGps: GeoPolygon;
    fasceOrarie: number[]; // 0-23 range
    giorniSettimana: GiornoSettimana[];
}

export interface Utente {
    _id?: string;
    nome: string;
    cognome: string;
    telefono: string;
    tipoUtente?: TipoUtente;
    password?: string;
    TipoFDO?: TipoFDO;
    zoneDiOperazione?: ZonaDiOperazione[];
    disponibilità?: boolean;
    coordinateGps?: GeoPoint;
}