import { Injectable } from '@angular/core';
import * as L from 'leaflet';
import { icon, Marker } from 'leaflet';
import 'leaflet.markercluster';

@Injectable({
  providedIn: 'root'
})
export class MappaService {
  private map: L.Map | null = null;
  private readonly TRENTO_COORDINATES: L.LatLngExpression = [46.0748, 11.1217];
  private readonly DEFAULT_ZOOM = 13;
  private markerClusterGroup!: L.MarkerClusterGroup;

  constructor() { 
    // ✅ Fix globale delle icone per static sites
    this.fixLeafletIcons();
  }

  // ✅ Fix una volta sola nel constructor
  private fixLeafletIcons(): void {
    delete (L.Icon.Default.prototype as any)._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: 'assets/marker-icon-2x.png',  // ✅ Punto alle icone copiate
      iconUrl: 'assets/marker-icon.png',           // ✅ Punto alle icone copiate
      shadowUrl: 'assets/marker-shadow.png',       // ✅ Punto alle icone copiate
    });
  }

  /**
   * Inizializza e ritorna una mappa Leaflet centrata su Trento
   * @param elementId - ID dell'elemento HTML dove verrà renderizzata la mappa
   * @returns L.Map - L'istanza della mappa Leaflet
   */
  initMap(elementId: string): L.Map {
    // ✅ Usa i percorsi corretti per le icone copiate
    const iconRetinaUrl = 'assets/marker-icon-2x.png';  // ✅ Icone copiate da leaflet
    const iconUrl = 'assets/marker-icon.png';            // ✅ Icone copiate da leaflet  
    const shadowUrl = 'assets/marker-shadow.png';        // ✅ Icone copiate da leaflet

    const iconDefault = icon({
      iconRetinaUrl,
      iconUrl,
      shadowUrl,
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      tooltipAnchor: [16, -28],
      shadowSize: [41, 41]
    });
    Marker.prototype.options.icon = iconDefault;

    // ✅ Configurazione mappa per static sites
    this.map = L.map(elementId, {
      preferCanvas: false  // ✅ Importante per static deployment
    }).setView(this.TRENTO_COORDINATES, this.DEFAULT_ZOOM);

    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, &copy; <a href="https://carto.com/attributions">CARTO</a>',
      maxZoom: 19
    }).addTo(this.map);

    // ✅ Cluster con configurazione static-safe
    try {
      this.markerClusterGroup = L.markerClusterGroup({
        animate: false,           // ✅ Disabilita animazioni
        animateAddingMarkers: false,
        chunkedLoading: false     // ✅ Importante per static sites
      });
      this.map.addLayer(this.markerClusterGroup);
    } catch (error) {
      console.error('❌ Errore cluster group:', error);
    }

    return this.map;
  }

  addMarkerToCluster(latLng: [number, number]): L.Marker {
    const marker = L.marker(latLng);
    try {
      this.markerClusterGroup.addLayer(marker);
    } catch (error) {
      console.warn('⚠️ Fallback: aggiunto marker diretto');
      if (this.map) marker.addTo(this.map);
    }
    return marker;
  }

  clearMarkers(): void {
    try {
      this.markerClusterGroup.clearLayers();
    } catch (error) {
      console.warn('⚠️ Errore clear cluster, uso fallback');
    }
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
