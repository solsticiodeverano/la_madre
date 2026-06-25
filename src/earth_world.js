let EARTH_ASSETS = null;

function preloadEarthAssets(){
  const a = {
    world: null,
    geo: null,
    phrases: {},
    sounds: {}
  };

  a.world = loadImage('data/world.jpg');

  a.geo = loadJSON('data/custom.geo.json',
    (g)=>{ a.geo = g; },
    ()=>{ loadJSON('data/custom.geo.json', (g)=>{ a.geo = g; }, ()=>{}); }
  );

  const phraseFiles = [
    'africa','antartica','ocean','north_america',
    'south_america','asia','europe','oceania'
  ];

  for(const name of phraseFiles){
    a.phrases[name] = loadJSON(`data/frases/${name}.json`, ()=>{}, ()=>{});
  }

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

class InstrumentEarth{
  constructor(assets){
    this.assets = assets || EARTH_ASSETS || {};

    this.r = 155;
    this.rot = 0;

    // punto inicial en África
this.markerLat = 0;
this.markerLon = -160;

this.selectedLat = this.markerLat;
this.selectedLon = this.normLon(this.markerLon - 180);
this.selectedCountry = 'África';
this.selectedRegion = 'Africa';
this.zone = 'africa';

    this.prevZone = '';
    this.phrase = 'El archivo todavía no habla desde este lugar.';
    this.allPhrases = [];

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

    this.zoneVolumes = {
      ocean:.35,
      polos:.4,
      america:.45,
      asia:.45,
      africa:.45,
      arab:.45
    };

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

  draw(t, intro=1){
  this.updateSelection();

  if(frameCount % 12 === 0){
    this.updatePhrase();
  }

  this.updateAudioClock();

  push();

  const detail = intro < .45 ? 24 : 48;

  noStroke();

  if(this.assets.world){
    texture(this.assets.world);
    sphere(this.r, detail, detail/2);
  }else{
    fill(15,55,90);
    sphere(this.r, detail, detail/2);
  }

  if(intro > .28){
    this.drawAtmosphere(intro);
  }

  if(intro > .55){
    this.drawClouds(t, intro);
  }

  // punto rojo pegado al globo
  this.drawMarkerOnGlobe(t, intro);

  pop();

  if(intro > .05){
    this.drawHUD(intro);
    this.drawPadUI();
  }
}

  updateSelection(){
  this.markerLat = constrain(this.markerLat, -85, 85);
  this.markerLon = this.normLon(this.markerLon);

  // VISUAL: donde está el punto en la textura
  rx = -radians(this.markerLat);
  ry = -radians(this.markerLon);

  // GEOJSON: coordenada real corregida
  this.selectedLat = this.markerLat;
  this.selectedLon = this.normLon(this.markerLon + 180);

  this.selectedCountry = this.countryAt(this.selectedLat, this.selectedLon);
  this.selectedRegion = this.continentAt(this.selectedLat, this.selectedLon);

  this.zone = this.zoneFromLatLon(
    this.selectedLat,
    this.selectedLon,
    this.selectedCountry
  );

  if(this.zone !== this.prevZone){
    this.changeZoneSound(this.zone);
    this.prevZone = this.zone;
  }
}

  invRotateY(p, a){
    const ca = cos(-a);
    const sa = sin(-a);

    const x = p.x * ca + p.z * sa;
    const z = -p.x * sa + p.z * ca;

    return createVector(x, p.y, z);
  }

  invRotateX(p, a){
    const ca = cos(-a);
    const sa = sin(-a);

    const y = p.y * ca - p.z * sa;
    const z = p.y * sa + p.z * ca;

    return createVector(p.x, y, z);
  }

  normLon(lon){
    while(lon > 180) lon -= 360;
    while(lon < -180) lon += 360;
    return lon;
  }
}

InstrumentEarth.prototype.handleDrag = function(dx, dy){
  this.markerLon -= dx * 0.35;
  this.markerLat -= dy * 0.35;

  this.markerLat = constrain(this.markerLat, -85, 85);
  this.markerLon = this.normLon(this.markerLon);
};

InstrumentEarth.prototype.handleClick = function(){
  this.activateAudio();
};