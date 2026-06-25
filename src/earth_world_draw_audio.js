InstrumentEarth.prototype.drawAtmosphere = function(intro){
  push();

  blendMode(ADD);

  noStroke();

  fill(80,170,255,30 * intro);
  sphere(this.r * 1.018, 32, 16);

  fill(255,255,255,12 * intro);
  sphere(this.r * 1.055, 24, 12);

  blendMode(BLEND);

  pop();
};

InstrumentEarth.prototype.drawClouds = function(t, intro){
  const radioNubes = this.r + 3;
  const detalle = 44;

  noStroke();
  blendMode(ADD);

  for(let i = 0; i < detalle; i++){
    const lat1 = map(i, 0, detalle, -HALF_PI, HALF_PI);
    const lat2 = map(i + 1, 0, detalle, -HALF_PI, HALF_PI);

    beginShape(QUAD_STRIP);

    for(let j = 0; j <= detalle; j++){
      const lon = map(j, 0, detalle, -PI, PI);

      const n1 = noise(
        cos(lon) * 2.5 + 10,
        sin(lon) * 2.5 + 20,
        sin(lat1) * 3.0 + t * 0.35
      );

      const n2 = noise(
        cos(lon) * 2.5 + 10,
        sin(lon) * 2.5 + 20,
        sin(lat2) * 3.0 + t * 0.35
      );

      const polo1 = abs(sin(lat1));
      const polo2 = abs(sin(lat2));

      const densidad1 = n1 * 0.75 + polo1 * 0.35;
      const densidad2 = n2 * 0.75 + polo2 * 0.35;

      let alpha1 = map(densidad1, 0.62, 1.15, 0, 45);
      let alpha2 = map(densidad2, 0.62, 1.15, 0, 45);

      alpha1 = constrain(alpha1, 0, 45);
      alpha2 = constrain(alpha2, 0, 45);

      fill(255, alpha1 * 1.8 * intro);
      vertex(
        radioNubes * cos(lat1) * sin(lon),
        -radioNubes * sin(lat1),
        radioNubes * cos(lat1) * cos(lon)
      );

      fill(255, alpha2 * 1.8 * intro);
      vertex(
        radioNubes * cos(lat2) * sin(lon),
        -radioNubes * sin(lat2),
        radioNubes * cos(lat2) * cos(lon)
      );
    }

    endShape();
  }

  blendMode(BLEND);
};

InstrumentEarth.prototype.drawCenterMarkerHUD = function(t, intro){
  push();

  resetMatrix();
  camera();
  noLights();

  drawingContext.disable(drawingContext.DEPTH_TEST);

  noStroke();
  blendMode(ADD);

  fill(255, 0, 0, 120);
  ellipse(0, 0, 42, 42);

  fill(255, 0, 0, 255);
  ellipse(
    0,
    0,
    16 + sin(t * 5) * 3,
    16 + sin(t * 5) * 3
  );

  blendMode(BLEND);

  drawingContext.enable(drawingContext.DEPTH_TEST);

  pop();
};

InstrumentEarth.prototype.drawMarkerOnGlobe = function(t, intro){
  const p = this.latLonToXYZ(
    this.markerLat,
    this.markerLon,
    this.r + 5
  );

  push();
  translate(p.x, p.y, p.z);

  noStroke();
  blendMode(ADD);

  // halo rojo más chico y menos transparente
  const pulse = 1 + sin(t * 4.2) * 0.12;

  fill(255, 0, 0, 165 * intro);
  sphere(5.8 * pulse, 12, 8);

  // núcleo
  fill(255, 20, 20, 255 * intro);
  sphere(2.4, 10, 6);

  blendMode(BLEND);
  pop();
};

InstrumentEarth.prototype.drawHUD = function(intro){
  const el = document.getElementById('stageText');

  if(el){
    el.innerText =
      "LAT: " + nf(this.selectedLat, 1, 2) +
      " | LON: " + nf(this.selectedLon, 1, 2) +
      " | PAIS: " + this.selectedCountry +
      " | REGION: " + this.selectedRegion +
      " | ZONA: " + this.zone +
      " | AUDIO: " + (this.audioReady ? "activo" : "click para activar");
  }
};

InstrumentEarth.prototype.drawPadUI = function(){
  push();

  resetMatrix();
  camera();
  noLights();

  const s = 18;
  const gap = 8;
  const x = width - 135;
  const y = height - 42;

  fill(255,150);
  textAlign(RIGHT,CENTER);
  textSize(11);
  text(`${this.mode} ${floor(this.beat/4)}`, x - 8, y + s/2);

  this.padButton(x, y, s, this.kickOn || frameCount - this.markerPulse < 8, [255,140,0]);
  this.padButton(x + (s + gap), y, s, this.clapOn, [0,255,120]);
  this.padButton(x + (s + gap) * 2, y, s, this.mainOn, [255,220,90]);
  this.padButton(x + (s + gap) * 3, y, s, this.padOn, [180,80,255]);

  pop();
};

InstrumentEarth.prototype.padButton = function(x, y, s, on, c){
  if(on){
    noStroke();

    fill(c[0], c[1], c[2], 85);
    rect(x - 3, y - 3, s + 6, s + 6);

    fill(c[0], c[1], c[2], 135);
    rect(x, y, s, s);
  }else{
    noFill();
    stroke(c[0], c[1], c[2], 160);
    rect(x, y, s, s);
  }
};

InstrumentEarth.prototype.activateAudio = function(){
  if(this.audioReady) return;

  userStartAudio();

  this.audioReady = true;
  this.lastBeat = millis();

  const pad = this.assets.sounds && this.assets.sounds.pad;

  if(pad){
    pad.setVolume(.28);
    pad.loop();
    this.padOn = true;
  }

  this.changeZoneSound(this.zone);
};

InstrumentEarth.prototype.changeZoneSound = function(zone){
  if(!this.audioReady || !this.mainOn) return;

  const incoming = this.mainSoundFor(zone);
  if(!incoming || incoming === this.currentMain) return;

  const outgoing = this.currentMain;
  const dur = 3.0; // segundos, como tu PDE viejo

  incoming.stop();
  incoming.setVolume(0);
  incoming.loop();

  const targetVol = this.zoneVolumes[zone] || .45;

  incoming.setVolume(targetVol, dur);

  if(outgoing){
    outgoing.setVolume(0, dur);
    setTimeout(()=>{
      outgoing.stop();
    }, dur * 1000 + 80);
  }

  this.currentMain = incoming;
};

InstrumentEarth.prototype.mainSoundFor = function(zone){
  const snd = this.assets.sounds || {};

  if(zone === 'america') return snd.america;
  if(zone === 'africa') return snd.africa;
  if(zone === 'asia') return snd.asia;
  if(zone === 'arab') return snd.arab;
  if(zone === 'polos') return snd.polos;

  return snd.ocean;
};

InstrumentEarth.prototype.updateAudioClock = function(){
  if(!this.audioReady) return;

  const interval = 60000 / this.bpm;

  while(millis() - this.lastBeat >= interval){
    this.lastBeat += interval;
    this.beat++;

    const beatInBar = this.beat % 4;

    if(this.kickOn){
      this.trigger('kick');
    }

    if(this.clapOn && (beatInBar === 1 || beatInBar === 3)){
      this.trigger('clap');
    }
  }
};

InstrumentEarth.prototype.trigger = function(name){
  const s = this.assets.sounds && this.assets.sounds[name];

  if(s){
    s.stop();
    s.setVolume(.7);
    s.play();
  }

  this.markerPulse = frameCount;
};

InstrumentEarth.prototype.handleKey = function(k){
  if(k === 'l' || k === 'L'){
    this.mode = 'L';
    this.kickOn = true;
    this.clapOn = false;
    this.activateAudio();
  }

  if(k === 'm' || k === 'M'){
    this.mode = 'M';
    this.kickOn = false;
    this.clapOn = false;
    this.activateAudio();
  }

  if(k === 'p' || k === 'P'){
    this.mode = 'P';
    this.kickOn = true;
    this.clapOn = true;
    this.activateAudio();
  }

  if(k === '1'){
    if(this.mode === 'M'){
      this.trigger('kick');
    }else{
      this.kickOn = !this.kickOn;
    }
  }

  if(k === '2'){
    if(this.mode === 'M'){
      this.trigger('clap');
    }else{
      this.clapOn = !this.clapOn;
    }
  }

  if(k === '3'){
    this.mainOn = !this.mainOn;

    if(!this.mainOn && this.currentMain){
      this.currentMain.stop();
    }else{
this.currentMain = null;
this.changeZoneSound(this.zone);    }
  }

  if(k === '4'){
    this.padOn = !this.padOn;

    const pad = this.assets.sounds && this.assets.sounds.pad;

    if(pad){
      if(this.padOn){
        pad.loop();
      }else{
        pad.stop();
      }
    }
  }
};