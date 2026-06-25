// =====================================================
// WORLD.JS — Tierra instrumento
// Porta la lógica de tierra.pde / musica.pde / frases.pde / pad.pde
// sin fundirla con sistema solar: se activa solo en la última escena.
// =====================================================

let EARTH_ASSETS = null;

function preloadEarthAssets(){
  const a = {
    world: null,
    geo: null,
    phrases: {},
    sounds: {}
  };

  // textura: en tu carpeta data se llama world.jpg
  a.world = loadImage('data/world.jpg');

  // tu geo puede estar como custom.geo o custom.geo.json. Primero intento custom.geo.
  a.geo = loadJSON('data/custom.geo.json',
    (g)=>{ a.geo = g; },
    ()=>{ loadJSON('data/custom.geo.json', (g)=>{ a.geo = g; }, ()=>{}); }
  );

  const phraseFiles = ['africa','antartica','ocean','north_america','south_america','asia','europe','oceania'];
  for(const name of phraseFiles){
    a.phrases[name] = loadJSON(`data/frases/${name}.json`, ()=>{}, ()=>{});
  }

  const soundFiles = {
    africa:'africa.mp3', africa2:'africa2.wav', america:'america.wav',
    arab:'arab.mp3', arab2:'arab2.wav', asia:'asia.mp3', asia2:'asia2.wav',
    ocean:'ocean.mp3', ocean2:'ocean2.wav', polos:'polos.wav',
    kick:'kick.mp3', clap:'clap.mp3', pad:'pad.mp3'
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
    this.selectedLat = 0;
    this.selectedLon = 0;
    this.selectedCountry = 'Océano';
    this.zone = 'ocean';
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
    this.zoneVolumes = {ocean:.35, polos:.4, america:.45, asia:.45, africa:.45, arab:.45};
    this.cloudSeed = [];
    this.markerPulse = 0;

    randomSeed(12);
    for(let i=0;i<140;i++){
      const lat=random(-80,80), lon=random(-180,180);
      this.cloudSeed.push({lat,lon,s:random(3,10),a:random(10,42),spd:random(.015,.055)});
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
        for(const item of file.resultados) this.allPhrases.push(item);
      }
    }
  }

  draw(t, intro=1){
    this.rot += 0.0025;
    if(frameCount % 8 === 0) this.updateSelection();
    if(frameCount % 12 === 0) this.updatePhrase();
    this.updateAudioClock();

    push();
    rotateY(this.rot);
    rotateX(-0.08 + sin(t*.45)*0.035);

    // La entrada empieza liviana: textura simple. Recién al final aparecen nubes/frase/audio.
    const detail = intro < .45 ? 24 : 48;
    noStroke();
    if(this.assets.world){
      texture(this.assets.world);
      sphere(this.r, detail, detail/2);
    }else{
      fill(15,55,90); sphere(this.r, detail, detail/2);
    }

    if(intro > .28){
      this.drawAtmosphere(intro);
    }
    if(intro > .55){
      this.drawClouds(t, intro);
      this.drawCenterMarker3D(t);
    }
    pop();

    if(intro > .68){
      this.drawHUD(intro);
      this.drawPadUI();
    }
  }

  drawAtmosphere(intro){
    push();
    blendMode(ADD);
    noStroke();
    fill(80,170,255,30*intro); sphere(this.r*1.018, 32, 16);
    fill(255,255,255,12*intro); sphere(this.r*1.055, 24, 12);
    blendMode(BLEND);
    pop();
  }

  drawClouds(t, intro){
    blendMode(ADD);
    noStroke();
    for(const c of this.cloudSeed){
      const lon = c.lon + t*12*c.spd;
      const p = this.latLonToXYZ(c.lat, lon, this.r+5);
      push(); translate(p.x,p.y,p.z);
      fill(255, c.a*intro);
      sphere(c.s, 8, 6);
      pop();
    }
    blendMode(BLEND);
  }

  drawCenterMarker3D(t){
    const p = this.latLonToXYZ(this.selectedLat, this.selectedLon, this.r+9);
    push(); translate(p.x,p.y,p.z);
    blendMode(ADD);
    noStroke();
    fill(255,70,45,140); sphere(3+sin(t*4)*1,8,6);
    fill(255,60,40,30); sphere(12+sin(t*3)*4,10,8);
    blendMode(BLEND);
    pop();
  }

  drawHUD(intro){
  push();
  resetMatrix();
  camera();
  noLights();

  const fade = constrain((intro-.68)/.32,0,1);

  rectMode(CORNER);
  noStroke();

  fill(0,160*fade);
  rect(18, height-132, 410, 112, 16);

  fill(255,225*fade);
  textAlign(LEFT, TOP);
  textSize(15);
  text(
    `LAT  : ${nf(this.selectedLat,1,2)}\nLON  : ${nf(this.selectedLon,1,2)}\nPAIS : ${this.selectedCountry}\nZONA : ${this.zone}\nAUDIO: ${this.audioReady ? 'activo' : 'click para activar'}`,
    36,
    height-118
  );

  fill(0,150*fade);
  rect(width*.09, 30, width*.82, 92, 20);

  textAlign(CENTER, CENTER);
  textSize(22);
  fill(255,220,180,230*fade);
  text(
    this.phrase || 'El archivo todavía no habla desde este lugar.',
    width*.11,
    36,
    width*.78,
    82
  );

  pop();
}

 drawPadUI(){
  push();
  resetMatrix();
  camera();
  noLights();

  const s=18, gap=8, x=width-135, y=height-42;
  fill(255,150);
  textAlign(RIGHT,CENTER);
  textSize(11);
  text(`${this.mode} ${floor(this.beat/4)}`, x-8, y+s/2);

  this.padButton(x,y,s,this.kickOn || frameCount-this.markerPulse<8, [255,140,0]);
  this.padButton(x+(s+gap),y,s,this.clapOn, [0,255,120]);
  this.padButton(x+(s+gap)*2,y,s,this.mainOn, [255,220,90]);
  this.padButton(x+(s+gap)*3,y,s,this.padOn, [180,80,255]);

  pop();
}

  padButton(x,y,s,on,c){
    if(on){ noStroke(); fill(c[0],c[1],c[2],85); rect(x-3,y-3,s+6,s+6); fill(c[0],c[1],c[2],135); rect(x,y,s,s); }
    else { noFill(); stroke(c[0],c[1],c[2],160); rect(x,y,s,s); }
  }

  updateSelection(){
    // aproximación estable para web: el centro de visión se traduce a lat/lon.
    this.selectedLat = constrain(degrees(rx)*0.72, -82, 82);
    this.selectedLon = this.normLon(-degrees(ry + this.rot));
    this.selectedCountry = this.countryAt(this.selectedLat, this.selectedLon);
    this.zone = this.zoneFromLatLon(this.selectedLat, this.selectedLon, this.selectedCountry);
    if(this.zone !== this.prevZone){
      this.changeZoneSound(this.zone);
      this.prevZone = this.zone;
    }
  }

  updatePhrase(){
    this.buildPhraseIndex();
    for(const item of this.allPhrases){
      const pais = item.pais || '';
      const admin = item.admin || '';
      if(pais === this.selectedCountry || admin === this.selectedCountry){
        if(item.resultado && item.resultado.frase) this.phrase = item.resultado.frase;
        return;
      }
    }
    this.phrase = 'El archivo todavía no habla desde este lugar.';
  }

  countryAt(lat, lon){
    const geo = this.assets.geo;
    if(!geo || !geo.features) return this.zone === 'ocean' ? 'Océano' : 'Tierra';
    for(const f of geo.features){
      const g = f.geometry; if(!g) continue;
      if(g.type === 'Polygon' && this.pointInPolygon(lat, lon, g.coordinates)) return this.featureName(f.properties||{});
      if(g.type === 'MultiPolygon'){
        for(const poly of g.coordinates){ if(this.pointInPolygon(lat, lon, poly)) return this.featureName(f.properties||{}); }
      }
    }
    return 'Océano';
  }

  featureName(props){ return props.name_es || props.name || props.admin || 'País'; }

  pointInPolygon(lat, lon, polygon){
    if(!polygon || !polygon[0]) return false;
    if(!this.pointInRing(lat, lon, polygon[0])) return false;
    for(let i=1;i<polygon.length;i++) if(this.pointInRing(lat, lon, polygon[i])) return false;
    return true;
  }

  pointInRing(lat, lon, ring){
    let inside=false;
    for(let i=0,j=ring.length-1;i<ring.length;j=i++){
      const xi=ring[i][0], yi=ring[i][1], xj=ring[j][0], yj=ring[j][1];
      const inter=((yi>lat)!=(yj>lat)) && (lon < (xj-xi)*(lat-yi)/(yj-yi)+xi);
      if(inter) inside=!inside;
    }
    return inside;
  }

  zoneFromLatLon(lat, lon, country){
    if(lat > 66 || lat < -66) return 'polos';
    if(country === 'Océano') return 'ocean';
    const cont = this.continentAt(lat, lon);
    if(cont === 'North America' || cont === 'South America') return 'america';
    if(cont === 'Africa') return 'africa';
    if(cont === 'Asia') return 'asia';
    if(cont === 'Europe') return 'arab';
    if(cont === 'Oceania') return 'asia';
    return 'ocean';
  }

  continentAt(lat, lon){
    const geo = this.assets.geo;
    if(!geo || !geo.features) return '';
    for(const f of geo.features){
      const g=f.geometry, props=f.properties||{}; if(!g) continue;
      let hit=false;
      if(g.type==='Polygon') hit=this.pointInPolygon(lat,lon,g.coordinates);
      if(g.type==='MultiPolygon') for(const poly of g.coordinates){ if(this.pointInPolygon(lat,lon,poly)){hit=true;break;} }
      if(hit) return props.continent || props.CONTINENT || props.region_un || props.region || '';
    }
    return '';
  }

  latLonToXYZ(lat, lon, r){
    const la=radians(lat), lo=radians(lon);
    return createVector(r*cos(la)*sin(lo), -r*sin(la), r*cos(la)*cos(lo));
  }

  normLon(lon){ while(lon>180)lon-=360; while(lon<-180)lon+=360; return lon; }

  activateAudio(){
    if(this.audioReady) return;
    userStartAudio();
    this.audioReady = true;
    this.lastBeat = millis();
    const pad=this.assets.sounds && this.assets.sounds.pad;
    if(pad){ pad.setVolume(.28); pad.loop(); this.padOn=true; }
    this.changeZoneSound(this.zone);
  }

  changeZoneSound(zone){
    if(!this.audioReady || !this.mainOn) return;
    const s = this.mainSoundFor(zone);
    if(s === this.currentMain) return;
    if(this.currentMain){ this.currentMain.stop(); }
    this.currentMain = s;
    if(this.currentMain){
      this.currentMain.setVolume(this.zoneVolumes[zone] || .4);
      this.currentMain.loop();
    }
  }

  mainSoundFor(zone){
    const snd=this.assets.sounds || {};
    if(zone==='america') return snd.america;
    if(zone==='africa') return snd.africa;
    if(zone==='asia') return snd.asia;
    if(zone==='arab') return snd.arab;
    if(zone==='polos') return snd.polos;
    return snd.ocean;
  }

  updateAudioClock(){
    if(!this.audioReady) return;
    const interval = 60000/this.bpm;
    while(millis() - this.lastBeat >= interval){
      this.lastBeat += interval;
      this.beat++;
      const beatInBar = this.beat % 4;
      if(this.kickOn) this.trigger('kick');
      if(this.clapOn && (beatInBar===1 || beatInBar===3)) this.trigger('clap');
    }
  }

  trigger(name){
    const s=this.assets.sounds && this.assets.sounds[name];
    if(s){ s.stop(); s.setVolume(.7); s.play(); }
    this.markerPulse = frameCount;
  }

  handleKey(k){
    if(k==='l'||k==='L'){ this.mode='L'; this.kickOn=true; this.clapOn=false; this.activateAudio(); }
    if(k==='m'||k==='M'){ this.mode='M'; this.kickOn=false; this.clapOn=false; this.activateAudio(); }
    if(k==='p'||k==='P'){ this.mode='P'; this.kickOn=true; this.clapOn=true; this.activateAudio(); }
    if(k==='1'){ if(this.mode==='M') this.trigger('kick'); else this.kickOn=!this.kickOn; }
    if(k==='2'){ if(this.mode==='M') this.trigger('clap'); else this.clapOn=!this.clapOn; }
    if(k==='3'){ this.mainOn=!this.mainOn; if(!this.mainOn && this.currentMain) this.currentMain.stop(); else this.changeZoneSound(this.zone); }
    if(k==='4'){ this.padOn=!this.padOn; const pad=this.assets.sounds && this.assets.sounds.pad; if(pad){ if(this.padOn) pad.loop(); else pad.stop(); } }
  }
}
