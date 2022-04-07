import { AfterViewInit, Component, ElementRef, ViewChild } from '@angular/core';
import * as mapboxgl from 'mapbox-gl';

interface MarkerColor {
  color: string;
  marker?: mapboxgl.Marker | any;
  cent?: [number, number]
}

@Component({
  selector: 'app-markers',
  templateUrl: './markers.component.html',
  styles: [
    `
    .mapa-container {
      height: 100%;
      width: 100%; 
    }

    .list-group {
      position: fixed;
      top: 20px;
      right: 20px;
      z-index: 99;
    }
    li {
      cursor: pointer;
    }
    `
  ]
})
export class MarkersComponent implements AfterViewInit {

  @ViewChild('map') divMapa!: ElementRef;
  map!: mapboxgl.Map;
  zoomLevel: number = 15;
  center: [number, number] = [ -64.18861135615921, -31.419908126734594 ];

  // Arreglo de marcadores
  markers: MarkerColor[] = [];

  constructor() { }

  ngAfterViewInit(): void {

    this.map = new mapboxgl.Map({
      container: this.divMapa.nativeElement,
      style: 'mapbox://styles/mapbox/streets-v11',
      center: this.center,
      zoom: this.zoomLevel
    });

    this.readMarkersLocalStorage();
  }


  addMarker() {

    const color = "#xxxxxx".replace(/x/g, y=>(Math.random()*16|0).toString(16));

    const newMarker = new mapboxgl.Marker({
      draggable: true,
      color
    })
      .setLngLat( this.center )
      .addTo( this.map );
      
    this.markers.push({
      color,
      marker: newMarker
    });

    this.saveMarkersLocalStorage()

    newMarker.on('dragend', () => {
      this.saveMarkersLocalStorage();
    })
  }

  goMarker( marker: mapboxgl.Marker ) {
    this.map.flyTo({
      center: marker.getLngLat()
    });
  }


  saveMarkersLocalStorage() {

    const lngLatArr: MarkerColor[] = [];

    this.markers.forEach( m => {

      const color = m.color;
      const { lng, lat } = m.marker!.getLngLat();

      lngLatArr.push({
        color: color,
        cent: [ lng, lat ]
      });
    })

    localStorage.setItem('markers', JSON.stringify(lngLatArr) );

  }

  readMarkersLocalStorage() {
    
    if ( !localStorage.getItem('markers') ) {
      return;
    }

    const lngLatArr: MarkerColor[] = JSON.parse( localStorage.getItem('markers')! );

    lngLatArr.forEach( m => {

      const newMarker = new mapboxgl.Marker({
        color: m.color,
        draggable: true
      })
        .setLngLat( m.cent! )
        .addTo( this.map );

      this.markers.push({
        marker: newMarker,
        color: m.color
      });

      newMarker.on('dragend', () => {
        this.saveMarkersLocalStorage();
      })
    }); 
  }

  deleteMarker(i:number){
    this.markers[i].marker?.remove();
    this.markers.splice(i, 1);
    this.saveMarkersLocalStorage();
  }
}