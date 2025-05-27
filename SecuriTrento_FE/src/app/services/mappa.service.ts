import { Injectable } from '@angular/core';
import * as L from 'leaflet';
import 'leaflet.markercluster';

@Injectable({
  providedIn: 'root'
})
export class MappaService {
  private map: L.Map | null = null;
  private readonly TRENTO_COORDINATES: L.LatLngExpression = [46.0748, 11.1217]; // Coordinate di Trento [latitudine, longitudine]
  private readonly DEFAULT_ZOOM = 13;
  private markerClusterGroup!: L.MarkerClusterGroup;

  constructor() { }

  /**
   * Inizializza e ritorna una mappa Leaflet centrata su Trento
   * @param elementId - ID dell'elemento HTML dove verrà renderizzata la mappa
   * @returns L.Map - L'istanza della mappa Leaflet
   */
  initMap(elementId: string): L.Map {
    // Crea un'istanza della mappa nel contenitore specificato
    this.map = L.map(elementId).setView(this.TRENTO_COORDINATES, this.DEFAULT_ZOOM);

    // PER MODIFICARE LO STILE DELLA MAPPA
// L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
//       attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community',
//       maxZoom: 18
//     }).addTo(this.map);

    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, &copy; <a href="https://carto.com/attributions">CARTO</a>',
      maxZoom: 19
    }).addTo(this.map);

    this.markerClusterGroup = L.markerClusterGroup();
    this.map.addLayer(this.markerClusterGroup);
    return this.map;
  }

  addMarkerToCluster(latLng: [number, number]): L.Marker {
    const marker = L.marker(latLng);
    this.markerClusterGroup.addLayer(marker);
    return marker;
  }

  clearMarkers(): void {
    this.markerClusterGroup.clearLayers();
  }

  /**
   * Ritorna l'istanza corrente della mappa se esiste
   * @returns L.Map | null - L'istanza della mappa o null se non è stata inizializzata
   */
  getMap(): L.Map | null {
    return this.map;
  }

  /**
   * Aggiunge un marker alla posizione specificata
   * @param position - Coordinate [lat, lng] del marker
   * @param options - Opzioni del marker (opzionale)
   * @returns L.Marker - L'istanza del marker creato
   */
  addMarker(position: [number, number], options?: L.MarkerOptions): L.Marker {
    if (!this.map) {
      throw new Error('La mappa non è stata inizializzata');
    }

    const marker = L.marker(position, options).addTo(this.map);
    return marker;
  }

  /**
   * Reimposta la vista della mappa su Trento
   */
  resetView(): void {
    if (this.map) {
      this.map.setView(this.TRENTO_COORDINATES, this.DEFAULT_ZOOM);
    }
  }
}
