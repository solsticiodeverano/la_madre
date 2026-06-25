// Assets globales de la Tierra.
// Se cargan en preload() para que estén disponibles antes de iniciar la escena.
let EARTH_ASSETS = null;


// Carga imagen del mundo, GeoJSON, frases por región y sonidos.
function preloadEarthAssets(){
  const a = {
    world: null,
    geo: null,
    phrases: {},
    sounds: {}
  };

  // Textura visual del planeta.
  a.world = loadImage('data/world.jpg');

  // Mapa GeoJSON para detectar país/continente según latitud y longitud.
  a.geo = loadJSON('data/custom.geo.json',
    (g)=>{ a.geo = g; },
    ()=>{ loadJSON('data/custom.geo.json', (g)=>{ a.geo = g; }, ()=>{}); }
  );

  // Archivos JSON con frases por zona geográfica.
  const phraseFiles = [
    'africa','antartica','ocean','north_america',
    'south_america','asia','europe','oceania'
  ];

  for(const name of phraseFiles){
    a.phrases[name] = loadJSON(`data/frases/${name}.json`, ()=>{}, ()=>{});
  }

  // Banco de sonidos por zona y sonidos percusivos.
  const soundFiles = {
    africa:'africa.mp3',
    africa2:'africa2.wav',
    america:'america.wav',
    arab:'arab.mp3',
    arab2:'arab2.wav',
    asia:'asia.mp3',
    asia2:'asia2.wav',
    ocean:'ocean.mp3',
    ocean2:'ocean2.wav',
    polos:'polos.wav',
    kick:'kick.mp3',
    clap:'clap.mp3',
    pad:'pad.mp3'
  };

  for(const k in soundFiles){
    a.sounds[k] = loadSound(`data/music/${soundFiles[k]}`, ()=>{}, ()=>{});
  }

  EARTH_ASSETS = a;
  return a;
}


// Escena Tierra: planeta navegable, detección geográfica y audio por zonas.
class InstrumentEarth{
  constructor(assets){
    this.assets = assets || EARTH_ASSETS || {};

    this.r = 155;
    this.rot = 0;

    // Punto inicial sobre el globo.
    this.markerLat = 0;
    this.markerLon = -160;

    // Coordenada seleccionada corregida para el GeoJSON.
    this.selectedLat = this.markerLat;
    this.selectedLon = this.normLon(this.markerLon - 180);
    this.selectedCountry = 'África';
    this.selectedRegion = 'Africa';
    this.zone = 'africa';

    this.prevZone = '';
    this.phrase = 'El archivo todavía no habla desde este lugar.';
    this.allPhrases = [];

    // Estados de audio.
    this.audioReady = false;
    this.mainOn = true;
    this.padOn = false;
    this.kickOn = false;
    this.clapOn = false;

    this.mode = 'L';
    this.bpm = 120;
    this.lastBeat = 0;
    this.beat = 0;
    this.currentMain = null;

    // Volumen base por zona.
    this.zoneVolumes = {
      ocean:.35,
      polos:.4,
      america:.45,
      asia:.45,
      africa:.45,
      arab:.45
    };

    // Semillas de nubes y pulso del marcador.
    this.cloudSeed = [];
    this.markerPulse = 0;

    randomSeed(12);
    for(let i=0;i<140;i++){
      const lat = random(-80,80);
      const lon = random(-180,180);

      this.cloudSeed.push({
        lat,
        lon,
        s: random(3,10),
        a: random(10,42),
        spd: random(.015,.055)
      });
    }
    randomSeed();

    this.buildPhraseIndex();
  }


  // Unifica todas las frases cargadas en un solo índice.
  buildPhraseIndex(){
    const p = this.assets.phrases || {};
    this.allPhrases = [];

    for(const key in p){
      const file = p[key];

      if(file && file.resultados){
        for(const item of file.resultados){
          this.allPhrases.push(item);
        }
      }
    }
  }


  // Dibuja el planeta y sus capas visuales.
  draw(t, intro=1){
    this.updateSelection();

    // Actualiza frase cada algunos frames para no recalcular todo siempre.
    if(frameCount % 12 === 0){
      this.updatePhrase();
    }

    this.updateAudioClock();

    push();

    // Menos detalle durante la entrada, más detalle cuando ya está visible.
    const detail = intro < .45 ? 24 : 48;

    noStroke();

    // Esfera con textura del mundo. Si no carga, usa color base.
    if(this.assets.world){
      texture(this.assets.world);
      sphere(this.r, detail, detail/2);
    }else{
      fill(15,55,90);
      sphere(this.r, detail, detail/2);
    }

    // Atmósfera y nubes aparecen progresivamente.
    if(intro > .28){
      this.drawAtmosphere(intro);
    }

    if(intro > .55){
      this.drawClouds(t, intro);
    }

    // Marcador rojo fijado a la superficie del globo.
    this.drawMarkerOnGlobe(t, intro);

    pop();

    // HUD y controles visuales de audio.
    if(intro > .05){
      this.drawHUD(intro);
      this.drawPadUI();
    }
  }


  // Actualiza lat/lon, país, continente y zona sonora según el marcador.
  updateSelection(){
    this.markerLat = constrain(this.markerLat, -85, 85);
    this.markerLon = this.normLon(this.markerLon);

    // Rota visualmente la Tierra para ubicar el punto rojo.
    rx = -radians(this.markerLat);
    ry = -radians(this.markerLon);

    // Corrige coordenada para búsqueda en GeoJSON.
    this.selectedLat = this.markerLat;
    this.selectedLon = this.normLon(this.markerLon + 180);

    this.selectedCountry = this.countryAt(this.selectedLat, this.selectedLon);
    this.selectedRegion = this.continentAt(this.selectedLat, this.selectedLon);

    this.zone = this.zoneFromLatLon(
      this.selectedLat,
      this.selectedLon,
      this.selectedCountry
    );

    // Si cambia de zona, cambia también el sonido principal.
    if(this.zone !== this.prevZone){
      this.changeZoneSound(this.zone);
      this.prevZone = this.zone;
    }
  }


  // Rotación inversa en eje Y para convertir coordenadas.
  invRotateY(p, a){
    const ca = cos(-a);
    const sa = sin(-a);

    const x = p.x * ca + p.z * sa;
    const z = -p.x * sa + p.z * ca;

    return createVector(x, p.y, z);
  }


  // Rotación inversa en eje X para convertir coordenadas.
  invRotateX(p, a){
    const ca = cos(-a);
    const sa = sin(-a);

    const y = p.y * ca - p.z * sa;
    const z = p.y * sa + p.z * ca;

    return createVector(p.x, y, z);
  }


  // Normaliza longitud para que siempre quede entre -180 y 180.
  normLon(lon){
    while(lon > 180) lon -= 360;
    while(lon < -180) lon += 360;
    return lon;
  }
}


// Arrastre del mouse: mueve el punto rojo sobre la Tierra.
InstrumentEarth.prototype.handleDrag = function(dx, dy){
  this.markerLon -= dx * 0.35;
  this.markerLat -= dy * 0.35;

  this.markerLat = constrain(this.markerLat, -85, 85);
  this.markerLon = this.normLon(this.markerLon);
};


// Click: activa el sistema de audio.
InstrumentEarth.prototype.handleClick = function(){
  this.activateAudio();
};