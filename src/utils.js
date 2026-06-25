// Devuelve un punto aleatorio distribuido sobre la superficie de una esfera de radio r.
function randPointSphere(r){
  const a = random(TWO_PI);
  const z = random(-1, 1);
  const s = sqrt(1 - z * z);

  return createVector(
    cos(a) * s * r,
    sin(a) * s * r,
    z * r
  );
}

// Interpolación suave entre a y b.
// Se usa para fundidos y transiciones de escenas.
function softStep(a, b, x){
  x = constrain((x - a) / (b - a), 0, 1);
  return x * x * (3 - 2 * x);
}

// Dibuja un punto luminoso con tres capas de esfera.
function glowPoint(x, y, z, s, r, g, b, a){
  noStroke();
  push();
  translate(x, y, z);

  fill(r, g, b, a * .10);
  sphere(s * 3);

  fill(r, g, b, a * .35);
  sphere(s * 1.55);

  fill(r, g, b, a);
  sphere(s * .55);

  pop();
}

// Actualiza el texto visible en la interfaz inferior.
function screenText(t){
  document.getElementById('stageText').innerText = t;
}