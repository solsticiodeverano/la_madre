// Actualiza la frase mostrada según el país ubicado bajo el punto rojo.
InstrumentEarth.prototype.updatePhrase = function(){
  this.buildPhraseIndex();

  for(const item of this.allPhrases){
    const pais = item.pais || '';
    const admin = item.admin || '';

    // Busca coincidencia por país o nombre administrativo.
    if(pais === this.selectedCountry || admin === this.selectedCountry){
      if(item.resultado && item.resultado.frase){
        this.phrase = item.resultado.frase;
        return;
      }
    }
  }

  // Si no hay frase cargada, muestra país/zona u océano.
  this.phrase = this.selectedCountry && this.selectedCountry !== 'Océano'
    ? `${this.selectedCountry} — ${this.zone}`
    : 'Océano — mové la Tierra bajo el punto rojo.';
};


// Devuelve el país correspondiente a una latitud/longitud.
InstrumentEarth.prototype.countryAt = function(lat, lon){
  const geo = this.assets.geo;

  // Fallback si no cargó el GeoJSON.
  if(!geo || !geo.features){
    return this.zone === 'ocean' ? 'Océano' : 'Tierra';
  }

  // Recorre polígonos del mapa hasta encontrar dónde cae el punto.
  for(const f of geo.features){
    const g = f.geometry;

    if(!g) continue;

    if(g.type === 'Polygon' && this.pointInPolygon(lat, lon, g.coordinates)){
      return this.featureName(f.properties || {});
    }

    if(g.type === 'MultiPolygon'){
      for(const poly of g.coordinates){
        if(this.pointInPolygon(lat, lon, poly)){
          return this.featureName(f.properties || {});
        }
      }
    }
  }

  return 'Océano';
};


// Normaliza el nombre visible del país.
InstrumentEarth.prototype.featureName = function(props){
  return props.name_es || props.name || props.admin || 'País';
};


// Verifica si un punto está dentro de un polígono GeoJSON.
// El primer anillo es borde exterior; los siguientes son agujeros.
InstrumentEarth.prototype.pointInPolygon = function(lat, lon, polygon){
  if(!polygon || !polygon[0]) return false;

  if(!this.pointInRing(lat, lon, polygon[0])) return false;

  // Si cae dentro de un agujero, no cuenta como adentro.
  for(let i=1; i<polygon.length; i++){
    if(this.pointInRing(lat, lon, polygon[i])){
      return false;
    }
  }

  return true;
};


// Algoritmo ray casting para saber si lat/lon cae dentro de un anillo.
InstrumentEarth.prototype.pointInRing = function(lat, lon, ring){
  let inside = false;

  for(let i=0, j=ring.length-1; i<ring.length; j=i++){
    const xi = ring[i][0]; // longitud
    const yi = ring[i][1]; // latitud
    const xj = ring[j][0];
    const yj = ring[j][1];

    const inter =
      ((yi > lat) != (yj > lat)) &&
      (lon < (xj - xi) * (lat - yi) / (yj - yi) + xi);

    if(inter) inside = !inside;
  }

  return inside;
};


// Asigna una zona sonora/visual según coordenadas y continente.
InstrumentEarth.prototype.zoneFromLatLon = function(lat, lon, country){
  if(lat > 66 || lat < -66) return 'polos';
  if(country === 'Océano') return 'ocean';

  const cont = this.continentAt(lat, lon);

  if(cont === 'North America' || cont === 'South America') return 'america';
  if(cont === 'Africa') return 'africa';
  if(cont === 'Asia') return 'asia';
  if(cont === 'Europe') return 'arab';
  if(cont === 'Oceania') return 'asia';

  return 'ocean';
};


// Detecta continente usando el mismo GeoJSON de países.
InstrumentEarth.prototype.continentAt = function(lat, lon){
  const geo = this.assets.geo;

  if(!geo || !geo.features) return '';

  for(const f of geo.features){
    const g = f.geometry;
    const props = f.properties || {};

    if(!g) continue;

    let hit = false;

    if(g.type === 'Polygon'){
      hit = this.pointInPolygon(lat, lon, g.coordinates);
    }

    if(g.type === 'MultiPolygon'){
      for(const poly of g.coordinates){
        if(this.pointInPolygon(lat, lon, poly)){
          hit = true;
          break;
        }
      }
    }

    if(hit){
      return props.continent || props.CONTINENT || props.region_un || props.region || '';
    }
  }

  return '';
};


// Convierte latitud/longitud a coordenadas 3D sobre una esfera.
InstrumentEarth.prototype.latLonToXYZ = function(lat, lon, r){
  const la = radians(lat);
  const lo = radians(lon);

  return createVector(
    r * cos(la) * sin(lo),
    -r * sin(la),
    r * cos(la) * cos(lo)
  );
};