let GALAXIES_CACHE = null;

// Genera una sola vez un conjunto de galaxias pequeñas.
// Se guarda en caché para no recalcular posiciones en cada frame.
function initGalaxies(){
  GALAXIES_CACHE = [];

  randomSeed(33);

  for(let g = 0; g < 70; g++){
    GALAXIES_CACHE.push({
      x: random(-950, 950),
      y: random(-620, 620),
      z: random(-520, 520),
      rot: random(TWO_PI),
      speed: random(.0015, .005),
      size: random(18, 48),
      arms: floor(random(2, 5)),
      tiltX: random(-.8, .8),
      tiltY: random(-.8, .8),
      points: floor(random(28, 46))
    });
  }

  randomSeed();
}

// Dibuja el campo de galaxias.
// t es el tiempo y a controla la opacidad/fade de la escena.
function drawGalaxies(t, a){
  if(!GALAXIES_CACHE){
    initGalaxies();
  }

  blendMode(ADD);

  for(const g of GALAXIES_CACHE){
    push();

    // Posición y orientación propia de cada galaxia.
    translate(g.x, g.y, g.z);
    rotateX(g.tiltX);
    rotateY(g.tiltY);
    rotateZ(g.rot + t * g.speed * 8);

    // Brazos espirales formados por puntos.
    for(let arm = 0; arm < g.arms; arm++){
      const armOffset = TWO_PI / g.arms * arm;

      for(let i = 0; i < g.points; i++){
        const q = i / g.points;
        const angle = q * 5.5 + armOffset + t * g.speed * 18;
        const radius = q * g.size * 2.2;

        const x = cos(angle) * radius;
        const y = sin(angle * 2.0) * 2.2;
        const z = sin(angle) * radius;

        // Los puntos se apagan hacia el borde del brazo.
        const alpha = map(q, 0, 1, 145, 0) * a;
        const sw = map(q, 0, 1, 1.45, .45);

        strokeWeight(sw);
        stroke(210, 230, 255, alpha);
        point(x, y, z);
      }
    }

    // Núcleo cálido central.
    noStroke();
    fill(255, 235, 200, 150 * a);
    sphere(g.size * .10, 8, 6);

    // Halo azul externo.
    fill(120, 170, 255, 18 * a);
    sphere(g.size * .42, 8, 6);

    pop();
  }

  blendMode(BLEND);
}