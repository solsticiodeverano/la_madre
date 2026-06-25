let MILKY_WAY_CACHE = null;

function initMilkyWay(){
  MILKY_WAY_CACHE = {
    stars: [],
    halo: []
  };

  randomSeed(44);

  const arms = 4;

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
        a: random(25, 150),
        w: random(.45, 1.35),
        warm: random(1)
      });
    }
  }

  for(let i = 0; i < 350; i++){
    const p = randPointSphere(random(300, 850));
    p.y *= .35;

    MILKY_WAY_CACHE.halo.push({
      p,
      a: random(8, 55),
      w: random(.35, .9)
    });
  }

  randomSeed();
}

function drawMilkyWay(t, a){
  if(!MILKY_WAY_CACHE){
    initMilkyWay();
  }

  blendMode(ADD);

  push();

  rotateX(1.05);
  rotateY(t * .035);

  // halo lejano
  for(const h of MILKY_WAY_CACHE.halo){
    stroke(130, 175, 255, h.a * a);
    strokeWeight(h.w);
    point(h.p.x, h.p.y, h.p.z);
  }

  // disco espiral de estrellas
  for(const s of MILKY_WAY_CACHE.stars){
    if(s.warm > .55){
      stroke(170, 215, 255, s.a * a);
    }else{
      stroke(255, 220, 175, s.a * .55 * a);
    }

    strokeWeight(s.w);
    point(s.x, s.y, s.z);
  }

  // núcleo galáctico suave
  noStroke();
  fill(255, 220, 150, 70 * a);
  sphere(22, 12, 8);

  fill(120, 180, 255, 22 * a);
  sphere(60, 10, 6);

  pop();

  blendMode(BLEND);
}