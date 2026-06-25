float nubeTiempo = 0;

void dibujarNubes() {
  float radioNubes = radio + 3;

  noStroke();

  for (int i = 0; i < detalle; i++) {
    float lat1 = map(i, 0, detalle, -HALF_PI, HALF_PI);
    float lat2 = map(i + 1, 0, detalle, -HALF_PI, HALF_PI);

    beginShape(QUAD_STRIP);

    for (int j = 0; j <= detalle; j++) {
      float lon = map(j, 0, detalle, -PI, PI);

      float n1 = noise(
        cos(lon) * 2.5 + 10,
        sin(lon) * 2.5 + 20,
        sin(lat1) * 3.0 + nubeTiempo
      );

      float n2 = noise(
        cos(lon) * 2.5 + 10,
        sin(lon) * 2.5 + 20,
        sin(lat2) * 3.0 + nubeTiempo
      );

      float polo1 = abs(sin(lat1));
      float polo2 = abs(sin(lat2));

      float densidad1 = n1 * 0.75 + polo1 * 0.35;
      float densidad2 = n2 * 0.75 + polo2 * 0.35;

      float alpha1 = map(densidad1, 0.62, 1.15, 0, 45);
      float alpha2 = map(densidad2, 0.62, 1.15, 0, 45);

      alpha1 = constrain(alpha1, 0, 105);
      alpha2 = constrain(alpha2, 0, 45);

      fill(255, alpha1*5);

      vertex(
        radioNubes * cos(lat1) * sin(lon),
        -radioNubes * sin(lat1),
        radioNubes * cos(lat1) * cos(lon)
      );

      fill(255, alpha2*5);

      vertex(
        radioNubes * cos(lat2) * sin(lon),
        -radioNubes * sin(lat2),
        radioNubes * cos(lat2) * cos(lon)
      );
    }

    endShape();
  }

  nubeTiempo += 0.006;
}
