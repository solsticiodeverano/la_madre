import processing.sound.*;

SoundFile musicaAmerica;
SoundFile musicaAsia;
SoundFile musicaAfrica;
SoundFile musicaArabic;
SoundFile musicaOcean;
SoundFile musicaPolos;

String zonaActual = "";
String zonaNueva = "";

SoundFile musicaActual = null;
SoundFile musicaEntrante = null;
SoundFile musicaSaliente = null;

String zonaEntrante = "";
String zonaSaliente = "";

boolean haciendoFade = false;

int inicioFade = 0;
int duracionFade = 3000;

boolean musicaMainOn = true;

void setupMusica() {
  musicaAmerica = new SoundFile(this, "music/america.wav");
  musicaAsia    = new SoundFile(this, "music/asia.mp3");
  musicaAfrica  = new SoundFile(this, "music/africa.mp3");
  musicaArabic  = new SoundFile(this, "music/arab.mp3");
  musicaOcean   = new SoundFile(this, "music/ocean.mp3");
  musicaPolos   = new SoundFile(this, "music/polos.wav");

  detenerMusica();
}

void actualizarMusica() {
  zonaNueva = obtenerZonaActual();

  if (!zonaNueva.equals(zonaActual) && !haciendoFade) {
    iniciarCambioMusica(zonaNueva);
  }

  actualizarFade();
}

void iniciarCambioMusica(String nuevaZona) {
  zonaSaliente = zonaActual;
  zonaEntrante = nuevaZona;

  musicaSaliente = musicaActual;
  musicaEntrante = obtenerMusicaPorZona(zonaEntrante);

  inicioFade = millis();
  haciendoFade = true;

  if (musicaEntrante != null) {
    musicaEntrante.stop();
    musicaEntrante.amp(0);
if (musicaMainOn) {
  musicaEntrante.loop();
  musicaEntrante.jump(segundoActualLoop());
}  }

  zonaActual = zonaEntrante;
}

void actualizarFade() {
  if (!haciendoFade) return;

  float t = (millis() - inicioFade) / float(duracionFade);
  t = constrain(t, 0, 1);

  if (musicaSaliente != null) {
    float volSalida = obtenerVolumenZona(zonaSaliente) * (1 - t);
    musicaSaliente.amp(volSalida);
  }

  if (musicaEntrante != null) {
    float volEntrada = obtenerVolumenZona(zonaEntrante) * t;
    musicaEntrante.amp(volEntrada);
  }

  if (t >= 1) {
    if (musicaSaliente != null) {
      musicaSaliente.stop();
    }

    musicaActual = musicaEntrante;
    musicaSaliente = null;
    musicaEntrante = null;
    haciendoFade = false;
  }
}

SoundFile obtenerMusicaPorZona(String zona) {
  if (zona.equals("america")) return musicaAmerica;
  if (zona.equals("asia")) return musicaAsia;
  if (zona.equals("africa")) return musicaAfrica;
  if (zona.equals("arabic")) return musicaArabic;
  if (zona.equals("ocean")) return musicaOcean;
  if (zona.equals("polos")) return musicaPolos;

  return null;
}

float obtenerVolumenZona(String zona) {
  if (zona.equals("ocean")) return 0.35;
  if (zona.equals("polos")) return 0.4;
  return 0.45;
}

void detenerMusica() {
  if (musicaAmerica != null) musicaAmerica.stop();
  if (musicaAsia != null) musicaAsia.stop();
  if (musicaAfrica != null) musicaAfrica.stop();
  if (musicaArabic != null) musicaArabic.stop();
  if (musicaOcean != null) musicaOcean.stop();
  if (musicaPolos != null) musicaPolos.stop();
}

String obtenerZonaActual() {
  if (selectedLat > 66 || selectedLat < -66) return "polos";

  if (selectedCountry.equals("Océano")) return "ocean";

  String continente = obtenerContinenteActual();

  if (continente.equals("North America")) return "america";
  if (continente.equals("South America")) return "america";
  if (continente.equals("Africa")) return "africa";
  if (continente.equals("Asia")) return "asia";
  if (continente.equals("Europe")) return "arabic";
  if (continente.equals("Oceania")) return "asia";

  return "ocean";
}

String obtenerContinenteActual() {
  for (int i = 0; i < features.size(); i++) {
    JSONObject feature = features.getJSONObject(i);
    JSONObject props = feature.getJSONObject("properties");
    JSONObject geometry = feature.getJSONObject("geometry");

    String type = geometry.getString("type");
    JSONArray coordinates = geometry.getJSONArray("coordinates");

    boolean estaDentro = false;

    if (type.equals("Polygon")) {
      estaDentro = puntoEnPolygon(selectedLat, selectedLon, coordinates);
    } else if (type.equals("MultiPolygon")) {
      for (int m = 0; m < coordinates.size(); m++) {
        JSONArray polygon = coordinates.getJSONArray(m);

        if (puntoEnPolygon(selectedLat, selectedLon, polygon)) {
          estaDentro = true;
          break;
        }
      }
    }

    if (estaDentro && !props.isNull("continent")) {
      return props.getString("continent");
    }
  }

  return "Ocean";
}

void setMusicaMain(boolean estado) {
  musicaMainOn = estado;

  if (!musicaMainOn) {
    if (musicaActual != null) musicaActual.stop();
    if (musicaEntrante != null) musicaEntrante.stop();
    if (musicaSaliente != null) musicaSaliente.stop();
  } else {
    SoundFile actual = obtenerMusicaPorZona(zonaActual);

    if (actual != null) {
      actual.stop();
      actual.amp(obtenerVolumenZona(zonaActual));
      actual.loop();
      actual.jump(segundoActualLoop());
      musicaActual = actual;
    }
  }
}
