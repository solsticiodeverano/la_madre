import processing.sound.*;

SoundFile[] kicks = new SoundFile[4];
SoundFile[] claps = new SoundFile[2];
SoundFile pad;

int kickVoice = 0;
int clapVoice = 0;

boolean kickOn = true;
boolean clapOn = false;
boolean mainOn = true;
boolean padOn = true;

char modoPad = 'L';

float bpm = 120.0;
float msPorBeat = 60000.0 / bpm;

int beatsPorCompas = 4;
int totalCompases = 161;

int inicioReloj;
float proximoBeatMs;
int beatContador = 0;

int flashKick = 0;
int flashClap = 0;
int flashMain = 0;
int flashPad = 0;

boolean padSonando = false;

void setupPad() {
  for (int i = 0; i < kicks.length; i++) {
    kicks[i] = new SoundFile(this, "music/kick.mp3");
    kicks[i].amp(0.8);
  }

  for (int i = 0; i < claps.length; i++) {
    claps[i] = new SoundFile(this, "music/clap.mp3");
    claps[i].amp(0.8);
  }

  pad = new SoundFile(this, "music/pad.mp3");
  pad.amp(0.35);

  iniciarRelojMusical();
  iniciarPad();
}

void iniciarRelojMusical() {
  inicioReloj = millis();
  beatContador = 0;
  proximoBeatMs = millis(); // primer golpe inmediato
}

void actualizarPad() {
  int ahora = millis();

  while (ahora >= proximoBeatMs) {
    tocarBeat();

    beatContador++;
    proximoBeatMs += msPorBeat;
  }

  if (padOn && !padSonando) iniciarPad();
  if (!padOn && padSonando) apagarPad();
}

void tocarBeat() {
  int compas = compasActual();
  int beatDelCompas = beatContador % beatsPorCompas;

  if (modoPad == 'L') {
    kickOn = true;
    clapOn = false;
  }

  if (modoPad == 'P') {
    kickOn = !(compas >= 0 && compas < 17) &&
             !(compas >= 113 && compas < 129);

    clapOn = (compas >= 49 && compas < 113) ||
             (compas >= 129 && compas < 161);

    padOn = true;
    mainOn = true;
  }

  if (kickOn) {
    tocarKick();
  }

  if (clapOn && (beatDelCompas == 1 || beatDelCompas == 3)) {
    tocarClap();
  }
}

void keyPad(char k) {
  if (k == 'l' || k == 'L') {
    modoPad = 'L';
    kickOn = true;
    clapOn = false;
    iniciarRelojMusical();
    iniciarPad();
  }

  if (k == 'm' || k == 'M') {
    modoPad = 'M';
    kickOn = false;
    clapOn = false;
  }

  if (k == 'p' || k == 'P') {
    modoPad = 'P';
    padOn = true;
    mainOn = true;
    iniciarRelojMusical();
    setMusicaMain(true);
    iniciarPad();
  }

  if (k == '1') {
    if (modoPad == 'M') tocarKick();
    flashKick = millis();
  }

  if (k == '2') {
    if (modoPad == 'M') tocarClap();
    else clapOn = !clapOn;

    flashClap = millis();
  }

  if (k == '3') {
    mainOn = !mainOn;
    setMusicaMain(mainOn);
    flashMain = millis();
  }

  if (k == '4') {
    padOn = !padOn;

    if (padOn) iniciarPad();
    else apagarPad();

    flashPad = millis();
  }
}

void tocarKick() {
  kicks[kickVoice].stop();
  kicks[kickVoice].play();
  kickVoice = (kickVoice + 1) % kicks.length;
  flashKick = millis();
}

void tocarClap() {
  claps[clapVoice].stop();
  claps[clapVoice].play();
  clapVoice = (clapVoice + 1) % claps.length;
  flashClap = millis();
}

void iniciarPad() {
  pad.stop();
  pad.loop();
  pad.jump(segundoActualLoop());
  padSonando = true;
  flashPad = millis();
}

void apagarPad() {
  pad.stop();
  padSonando = false;
}

float segundoActualLoop() {
  float totalSegundos = totalCompases * beatsPorCompas * (60.0 / bpm);
  float transcurrido = (millis() - inicioReloj) / 1000.0;
  return transcurrido % totalSegundos;
}

int beatActual() {
  return beatContador;
}

int compasActual() {
  return int(beatContador / beatsPorCompas);
}

void dibujarPad() {
  hint(DISABLE_DEPTH_TEST);
  camera();
  noLights();

  int s = 18;
  int gap = 8;

  int x = width - 120;
  int y = height - 40;

  dibujarBoton(x, y, s, kickOn || millis() - flashKick < 120);
  dibujarBoton(x + (s + gap), y, s, clapOn || millis() - flashClap < 120);
  dibujarBoton(x + (s + gap) * 2, y, s, mainOn || millis() - flashMain < 120);
  dibujarBoton(x + (s + gap) * 3, y, s, padOn || millis() - flashPad < 120);

  fill(255, 170);
  textAlign(RIGHT, CENTER);
  textSize(11);
  text(modoPad + " " + compasActual(), x - 8, y + s / 2);

  hint(ENABLE_DEPTH_TEST);
}

void dibujarBoton(int x, int y, int s, boolean on) {
  if (modoPad == 'L') stroke(255, 140, 0, 180);
  if (modoPad == 'M') stroke(0, 255, 120, 180);
  if (modoPad == 'P') stroke(180, 80, 255, 190);

  if (on) {
    noStroke();

    if (modoPad == 'L') fill(255, 140, 0, 80);
    if (modoPad == 'M') fill(0, 255, 120, 80);
    if (modoPad == 'P') fill(180, 80, 255, 90);

    rect(x - 3, y - 3, s + 6, s + 6);

    if (modoPad == 'L') fill(255, 140, 0, 120);
    if (modoPad == 'M') fill(0, 255, 120, 120);
    if (modoPad == 'P') fill(180, 80, 255, 130);

    rect(x, y, s, s);
  } else {
    noFill();
    rect(x, y, s, s);
  }
}
