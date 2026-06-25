String[] archivosFrases = {
  "frases/africa.json",
  "frases/antartica.json",
    "frases/ocean.json",
  "frases/north_america.json",
  "frases/south_america.json",
  "frases/asia.json",
  "frases/europe.json",
  "frases/oceania.json"
};

JSONArray todasLasFrases;
String fraseActual = "";

void setupFrases() {
  todasLasFrases = new JSONArray();

  for (int i = 0; i < archivosFrases.length; i++) {
    JSONObject data = loadJSONObject(archivosFrases[i]);
    JSONArray resultados = data.getJSONArray("resultados");

    for (int j = 0; j < resultados.size(); j++) {
      todasLasFrases.append(resultados.getJSONObject(j));
    }
  }
}

void actualizarFrase() {
  fraseActual = obtenerFrasePorPais(selectedCountry);
}

String obtenerFrasePorPais(String pais) {
  for (int i = 0; i < todasLasFrases.size(); i++) {
    JSONObject item = todasLasFrases.getJSONObject(i);

    String nombrePais = item.getString("pais");
    String admin = item.getString("admin");

    if (nombrePais.equals(pais) || admin.equals(pais)) {
      JSONObject resultado = item.getJSONObject("resultado");
      return resultado.getString("frase");
    }
  }

  return "";
}

void dibujarFrase() {
  if (fraseActual.equals("")) {
    fraseActual = "El archivo todavía no habla desde este lugar.";
  }

  hint(DISABLE_DEPTH_TEST);
  camera();
  noLights();

  fill(0, 160);
  noStroke();
  rectMode(CENTER);
  rect(width, 90, width * 0.82, 90, 20);

  textAlign(CENTER, CENTER);
  textSize(25);
  fill(255, 220, 180, 230);

  text(fraseActual, width * 0.1, 50, width * 0.8, 80);

  hint(ENABLE_DEPTH_TEST);
}
