InstrumentEarth.prototype.updatePhrase = function(){
  this.buildPhraseIndex();

  for(const item of this.allPhrases){
    const pais = item.pais || '';
    const admin = item.admin || '';

    if(pais === this.selectedCountry || admin === this.selectedCountry){
      if(item.resultado && item.resultado.frase){
        this.phrase = item.resultado.frase;
        return;
      }
    }
  }

  this.phrase = this.selectedCountry && this.selectedCountry !== 'Océano'
    ? `${this.selectedCountry} — ${this.zone}`
    : 'Océano — mové la Tierra bajo el punto rojo.';
};

InstrumentEarth.prototype.countryAt = function(lat, lon){
  const geo = this.assets.geo;

  if(!geo || !geo.features){
    return this.zone === 'ocean' ? 'Océano' : 'Tierra';
  }

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

InstrumentEarth.prototype.featureName = function(props){
  return props.name_es || props.name || props.admin || 'País';
};

InstrumentEarth.prototype.pointInPolygon = function(lat, lon, polygon){
  if(!polygon || !polygon[0]) return false;

  if(!this.pointInRing(lat, lon, polygon[0])) return false;

  for(let i=1; i<polygon.length; i++){
    if(this.pointInRing(lat, lon, polygon[i])){
      return false;
    }
  }

  return true;
};

InstrumentEarth.prototype.pointInRing = function(lat, lon, ring){
  let inside = false;

  for(let i=0, j=ring.length-1; i<ring.length; j=i++){
    const xi = ring[i][0];
    const yi = ring[i][1];
    const xj = ring[j][0];
    const yj = ring[j][1];

    const inter =
      ((yi > lat) != (yj > lat)) &&
      (lon < (xj - xi) * (lat - yi) / (yj - yi) + xi);

    if(inter) inside = !inside;
  }

  return inside;
};

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

InstrumentEarth.prototype.latLonToXYZ = function(lat, lon, r){
  const la = radians(lat);
  const lo = radians(lon);

  return createVector(
    r * cos(la) * sin(lo),
    -r * sin(la),
    r * cos(la) * cos(lo)
  );
};