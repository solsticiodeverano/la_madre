let MILKY_WAY_CACHE = null;

// Genera una vez la estructura base de la galaxia:
// estrellas del disco espiral + halo exterior.
function initMilkyWay(){
  MILKY_WAY_CACHE = {
    stars: [],
    halo: []
  };

  randomSeed(44);

  const arms = 4;

  // Crea 4 brazos espirales con estrellas distribuidas en radio y ángulo.
  for(let arm = 0; arm < arms; arm++){
    const armOffset = TWO_PI / arms * arm;

    for(let i = 0; i < 1400; i++){
      const q = random(1);
      const r = pow(q, .55) * 520;
      const theta = armOffset + r * .028 + randomGaussian() * .16;

      MILKY_WAY_CACHE.stars.push({
        x: cos(theta) * r,
        y: randomGaussian() * 16,
        z: sin(theta) * r,
        a: random(25, 150),   // alpha
        w: random(.45, 1.35), // grosor
        warm: random(1)       // mezcla cálida/fría
      });
    }
  }

  // Halo de partículas lejanas alrededor de la galaxia.
  for(let i = 0; i < 350; i++){
    const p = randPointSphere(random(300, 850));
    p.y *= .35; // aplana un poco el halo

    MILKY_WAY_CACHE.halo.push({
      p,
      a: random(8, 55),
      w: random(.35, .9)
    });
  }

  randomSeed();
}

// Dibuja la galaxia usando la caché ya generada.
// a controla la intensidad/fade de la escena.
function drawMilkyWay(t, a){
  if(!MILKY_WAY_CACHE){
    initMilkyWay();
  }

  blendMode(ADD);
  push();

  // Inclina la galaxia y la rota lentamente.
  rotateX(1.05);
  rotateY(t * .035);

  // Halo lejano.
  for(const h of MILKY_WAY_CACHE.halo){
    stroke(130, 175, 255, h.a * a);
    strokeWeight(h.w);
    point(h.p.x, h.p.y, h.p.z);
  }

  // Disco espiral principal.
  for(const s of MILKY_WAY_CACHE.stars){
    if(s.warm > .55){
      stroke(170, 215, 255, s.a * a);
    }else{
      stroke(255, 220, 175, s.a * .55 * a);
    }

    strokeWeight(s.w);
    point(s.x, s.y, s.z);
  }

  // Núcleo galáctico luminoso.
  noStroke();
  fill(255, 220, 150, 70 * a);
  sphere(22, 12, 8);

  fill(120, 180, 255, 22 * a);
  sphere(60, 10, 6);

  pop();
  blendMode(BLEND);
}