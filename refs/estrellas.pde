int cantidadEstrellas = 380;

float[] starX = new float[cantidadEstrellas];
float[] starY = new float[cantidadEstrellas];
float[] starZ = new float[cantidadEstrellas];

float[] starSize = new float[cantidadEstrellas];
float[] starBase = new float[cantidadEstrellas];
float[] starSeed = new float[cantidadEstrellas];
float[] starSpeed = new float[cantidadEstrellas];
float[] starBlur = new float[cantidadEstrellas];

void setupEstrellas() {
  for (int i = 0; i < cantidadEstrellas; i++) {
    starX[i] = random(-width * 1.8, width * 1.8);
    starY[i] = random(-height * 1.8, height * 1.8);
    starZ[i] = random(-1200, 300);

    starSize[i] = random(1.2, 3.8);
    starBase[i] = random(40, 230);
    starSeed[i] = random(1000);
    starSpeed[i] = random(0.002, 0.012);
    starBlur[i] = random(1.5, 2);
  }
}

void dibujarEstrellas() {
  hint(DISABLE_DEPTH_TEST);

  pushMatrix();

  translate(
    width/2 - rotY * 80,
    height/2 - rotX * 80,
    -700
  );

  noStroke();

  for (int i = 0; i < cantidadEstrellas; i++) {
    float t = frameCount * starSpeed[i] + starSeed[i];

    float aparecer =
      noise(starSeed[i], frameCount * 0.002);

    float titilo =
      noise(starSeed[i] + 80, t * 3.0);

    float pulso =
      sin(t * TWO_PI) * 0.5 + 0.5;

    float alpha =
      starBase[i] *
      map(aparecer, 0.15, 0.95, 0.05, 1.0) *
      map(titilo, 0, 1, 0.45, 1.4) *
      map(pulso, 0, 1, 0.75, 1.15);

    alpha = constrain(alpha, 0, 255);

    float tam =
      starSize[i] *
      map(titilo, 0, 1, 0.7, 1.6);

    pushMatrix();
    translate(starX[i], starY[i], starZ[i]);

    // brillo difuso
    fill(255, alpha * 0.10);
    ellipse(0, 0, tam * starBlur[i] * 2.5, tam * starBlur[i] * 2.5);

    fill(255, alpha * 0.22);
    ellipse(0, 0, tam * starBlur[i], tam * starBlur[i]);

    // núcleo brillante
    fill(255, alpha);
    ellipse(0, 0, tam, tam);

    popMatrix();
  }

  popMatrix();

  hint(ENABLE_DEPTH_TEST);
}
