JSONObject geojson;
JSONArray features;

PGraphics maskMap;
PImage worldTexture;

float rotY = 0;
float rotX = 0;

float radio = 220;
int detalle = 240;

float selectedLat = 0;
float selectedLon = 0;

String selectedCountry = "Océano";

void setup() {
  size(900, 900, P3D);
  smooth(8);

  geojson = loadJSONObject("custom.geo.json");
  features = geojson.getJSONArray("features");

  worldTexture = loadImage("world.jpg");

  maskMap = createGraphics(2048, 1024);
  generarMapaDesdeGeoJSON();

  setupEstrellas();
  setupMusica();
  setupFrases();
  setupPad();
}

void draw() {
  background(0);

  dibujarEstrellas();

  ambientLight(5, 5, 8);

  directionalLight(255, 245, 220, -0.6, 0.2, -1);
  directionalLight(25, 45, 90, 0.8, -0.2, 1);

  pushMatrix();
  translate(width/2, height/2);

  rotateX(rotX);
  rotateY(rotY);

  dibujarPlaneta();
  dibujarNubes();
  dibujarPad();
  popMatrix();

  seleccionarCoordenadaCentral();
  selectedCountry = obtenerPaisPorLatLon(selectedLat, selectedLon);



  seleccionarCoordenadaCentral();
  selectedCountry = obtenerPaisPorLatLon(selectedLat, selectedLon);

  actualizarMusica();
  actualizarPad();
  actualizarFrase();
  
  dibujarMarcadorCentral();
  dibujarInfoAbajoIzquierda();
  dibujarFrase();
}

void generarMapaDesdeGeoJSON() {
  maskMap.beginDraw();
  maskMap.background(0);
  maskMap.noStroke();
  maskMap.fill(255);

  for (int i = 0; i < features.size(); i++) {
    JSONObject feature = features.getJSONObject(i);
    JSONObject geometry = feature.getJSONObject("geometry");

    String type = geometry.getString("type");
    JSONArray coordinates = geometry.getJSONArray("coordinates");

    if (type.equals("Polygon")) {
      dibujarPoligonoEnMapa(coordinates);
    } else if (type.equals("MultiPolygon")) {
      for (int m = 0; m < coordinates.size(); m++) {
        JSONArray polygon = coordinates.getJSONArray(m);
        dibujarPoligonoEnMapa(polygon);
      }
    }
  }

  maskMap.endDraw();
}

void dibujarPoligonoEnMapa(JSONArray polygon) {
  JSONArray exterior = polygon.getJSONArray(0);

  maskMap.beginShape();

  for (int i = 0; i < exterior.size(); i++) {
    JSONArray punto = exterior.getJSONArray(i);

    float lon = punto.getFloat(0);
    float lat = punto.getFloat(1);

    float x = lonToU(lon) * maskMap.width;
    float y = latToV(lat) * maskMap.height;

    maskMap.vertex(x, y);
  }

  maskMap.endShape(CLOSE);
}

void dibujarPlaneta() {
  float frecuencia = 3.0;
  float amplitudTierra = 5;
  float profundidadOceano = 2;

  ambient(180);
  specular(40);
  shininess(8);

  stroke(0, 8);
  strokeWeight(0.12);

  for (int i = 0; i < detalle; i++) {
    float lat1 = map(i, 0, detalle, -HALF_PI, HALF_PI);
    float lat2 = map(i + 1, 0, detalle, -HALF_PI, HALF_PI);

    beginShape(QUAD_STRIP);

    for (int j = 0; j <= detalle; j++) {
      float lon = map(j, 0, detalle, -PI, PI);

      float geoLon = degrees(lon);

      float u = lonToU(geoLon);
      float v1 = latToV(degrees(lat1));
      float v2 = latToV(degrees(lat2));

      boolean tierra1 = esTierra(u, v1);
      boolean tierra2 = esTierra(u, v2);

      color c1 = colorTextura(u, v1);
      color c2 = colorTextura(u, v2);

      float n1 = noise(
        cos(lon) * frecuencia,
        sin(lat1) * frecuencia,
        frameCount * 0.002
      );

      float n2 = noise(
        cos(lon) * frecuencia,
        sin(lat2) * frecuencia,
        frameCount * 0.002
      );

      float r1 = radio - profundidadOceano;
      float r2 = radio - profundidadOceano;

      if (tierra1) r1 = radio + n1 * amplitudTierra;
      if (tierra2) r2 = radio + n2 * amplitudTierra;

      fill(c1);

      vertex(
        r1 * cos(lat1) * sin(lon),
        -r1 * sin(lat1),
        r1 * cos(lat1) * cos(lon)
      );

      fill(c2);

      vertex(
        r2 * cos(lat2) * sin(lon),
        -r2 * sin(lat2),
        r2 * cos(lat2) * cos(lon)
      );
    }

    endShape();
  }
}

color colorTextura(float u, float v) {
  float x = u * (worldTexture.width - 1);
  float y = v * (worldTexture.height - 1);

  int x1 = floor(x);
  int y1 = floor(y);
  int x2 = constrain(x1 + 1, 0, worldTexture.width - 1);
  int y2 = constrain(y1 + 1, 0, worldTexture.height - 1);

  float tx = x - x1;
  float ty = y - y1;

  color c11 = worldTexture.get(x1, y1);
  color c21 = worldTexture.get(x2, y1);
  color c12 = worldTexture.get(x1, y2);
  color c22 = worldTexture.get(x2, y2);

  color arriba = lerpColor(c11, c21, tx);
  color abajo = lerpColor(c12, c22, tx);

  return lerpColor(arriba, abajo, ty);
}

boolean esTierra(float u, float v) {
  int x = int(u * (maskMap.width - 1));
  int y = int(v * (maskMap.height - 1));

  x = constrain(x, 0, maskMap.width - 1);
  y = constrain(y, 0, maskMap.height - 1);

  color c = maskMap.get(x, y);

  return brightness(c) > 10;
}

void seleccionarCoordenadaCentral() {
  PVector p = new PVector(0, 0, radio);

  p = invRotateX(p, rotX);
  p = invRotateY(p, rotY);

  selectedLat = degrees(asin(-p.y / radio));
  selectedLon = normalizarLon(degrees(atan2(p.x, p.z)));
}

String obtenerPaisPorLatLon(float lat, float lon) {
  for (int i = 0; i < features.size(); i++) {
    JSONObject feature = features.getJSONObject(i);
    JSONObject props = feature.getJSONObject("properties");
    JSONObject geometry = feature.getJSONObject("geometry");

    String type = geometry.getString("type");
    JSONArray coordinates = geometry.getJSONArray("coordinates");

    if (type.equals("Polygon")) {
      if (puntoEnPolygon(lat, lon, coordinates)) {
        return nombrePais(props);
      }
    } else if (type.equals("MultiPolygon")) {
      for (int m = 0; m < coordinates.size(); m++) {
        JSONArray polygon = coordinates.getJSONArray(m);

        if (puntoEnPolygon(lat, lon, polygon)) {
          return nombrePais(props);
        }
      }
    }
  }

  return "Océano";
}

String nombrePais(JSONObject props) {
  if (!props.isNull("name_es")) return props.getString("name_es");
  if (!props.isNull("name")) return props.getString("name");
  if (!props.isNull("admin")) return props.getString("admin");

  return "País";
}

boolean puntoEnPolygon(float lat, float lon, JSONArray polygon) {
  JSONArray exterior = polygon.getJSONArray(0);

  if (!puntoEnAnillo(lat, lon, exterior)) {
    return false;
  }

  for (int i = 1; i < polygon.size(); i++) {
    JSONArray agujero = polygon.getJSONArray(i);

    if (puntoEnAnillo(lat, lon, agujero)) {
      return false;
    }
  }

  return true;
}

boolean puntoEnAnillo(float lat, float lon, JSONArray ring) {
  boolean dentro = false;

  for (int i = 0, j = ring.size() - 1; i < ring.size(); j = i++) {
    JSONArray pi = ring.getJSONArray(i);
    JSONArray pj = ring.getJSONArray(j);

    float xi = pi.getFloat(0);
    float yi = pi.getFloat(1);

    float xj = pj.getFloat(0);
    float yj = pj.getFloat(1);

    boolean intersecta =
      ((yi > lat) != (yj > lat)) &&
      (lon < (xj - xi) * (lat - yi) / (yj - yi) + xi);

    if (intersecta) dentro = !dentro;
  }

  return dentro;
}

float lonToU(float lonDeg) {
  lonDeg = normalizarLon(lonDeg);
  float u = (lonDeg + 180.0) / 360.0;
  return constrain(u, 0, 1);
}

float latToV(float latDeg) {
  float v = (90.0 - latDeg) / 180.0;
  return constrain(v, 0, 1);
}

void dibujarMarcadorCentral() {
  hint(DISABLE_DEPTH_TEST);
  camera();
  noLights();

  noStroke();

  fill(255, 0, 0, 80);
  ellipse(width/2, height/2, 30, 30);

  fill(255, 0, 0);
  ellipse(width/2, height/2, 14, 14);

  hint(ENABLE_DEPTH_TEST);
}

void dibujarInfoAbajoIzquierda() {
  hint(DISABLE_DEPTH_TEST);
  camera();
  noLights();

  fill(255);
  textSize(22);
  textAlign(LEFT, BOTTOM);

  text(
    "LAT  : " + nf(selectedLat, 1, 2) +
    "\nLON  : " + nf(selectedLon, 1, 2) +
    "\nPAIS : " + selectedCountry +
    "\nZONA : " + zonaActual,
    20,
    height - 20
  );

  hint(ENABLE_DEPTH_TEST);
}

void mouseDragged() {
  rotY += (mouseX - pmouseX) * 0.01;
  rotX += (mouseY - pmouseY) * 0.01;

  rotX = constrain(rotX, -HALF_PI, HALF_PI);
}

PVector invRotateY(PVector p, float a) {
  float ca = cos(-a);
  float sa = sin(-a);

  float x = p.x * ca + p.z * sa;
  float z = -p.x * sa + p.z * ca;

  return new PVector(x, p.y, z);
}

PVector invRotateX(PVector p, float a) {
  float ca = cos(-a);
  float sa = sin(-a);

  float y = p.y * ca - p.z * sa;
  float z = p.y * sa + p.z * ca;

  return new PVector(p.x, y, z);
}

float normalizarLon(float lon) {
  while (lon > 180) lon -= 360;
  while (lon < -180) lon += 360;

  return lon;
}

void keyPressed() {
  keyPad(key);
}
