// =====================================================
// SPIRAL SYSTEM — movimiento AlexClase + estética suave
// versión optimizada
// =====================================================

class SpiralSystem{
  constructor(){
    this.t = 0;
    this.sunSize = 72;

    this.a = [120, 175, 245, 320, 445, 585, 725, 860];
    this.b = [100, 150, 225, 285, 410, 535, 675, 810];
    this.sizes = [0.03, 0.07, 0.08, 0.04, 0.22, 0.18, 0.12, 0.11];
    this.speeds = [4.0, 3.2, 2.4, 1.9, 1.2, 0.9, 0.6, 0.4];

    this.cols = [
      [170, 180, 190],
      [230, 170, 95],
      [70, 150, 255],
      [230, 90, 65],
      [235, 190, 130],
      [240, 215, 165],
      [130, 220, 255],
      [90, 130, 255]
    ];

    this.trailSol = [];
    this.planetTrails = Array.from({length:8}, () => []);

    this.maxSunTrail = 220;
    this.maxPlanetTrail = 95;

    this.stars = [];

    randomSeed(2);
    for(let i = 0; i < 420; i++){
      this.stars.push({
        x: random(-3600, 3600),
        y: random(-2600, 2600),
        z: random(-3600, 3600),
        a: random(25, 135),
        w: random(.4, 1.1),
        tw: random(9999)
      });
    }
    randomSeed();
  }

  draw(externalT, focusEarth = 0){
    this.t += min(deltaTime || 16.6, 33) * 0.00055;

    const tt = this.t;
    focusEarth = constrain(focusEarth, 0, 1);

    push();

    scale(0.62);
    rotateX(0.43);
    rotateY(externalT * 0.05);

    this.drawStars(tt);

    const sunX = cos(tt) * 120;
    const sunZ = sin(tt) * 120;
    const sunY = -tt * 95;

    const earth = this.planetPosition(2, sunX, sunY, sunZ, tt);

    translate(
      -lerp(sunX, earth.x, focusEarth),
      -lerp(sunY, earth.y, focusEarth),
      -lerp(sunZ, earth.z, focusEarth)
    );

    scale(lerp(1.0, 4.2, focusEarth));

    this.trailSol.push(createVector(sunX, sunY, sunZ));
    if(this.trailSol.length > this.maxSunTrail) this.trailSol.shift();

    this.drawTrailSimple(this.trailSol, [255, 205, 110], 1.6);
    this.drawSun(sunX, sunY, sunZ, tt);

    for(let i = 0; i < 8; i++){
      this.drawPlanet(i, sunX, sunY, sunZ, tt);
    }

    pop();
  }

  planetPosition(i, sunX, sunY, sunZ, tt){
    const angle = tt * this.speeds[i];

    return createVector(
      sunX + cos(angle) * this.a[i],
      sunY + sin(angle * 2 + i) * 15,
      sunZ + sin(angle) * this.b[i]
    );
  }

  drawSun(sunX, sunY, sunZ, tt){
    push();
    translate(sunX, sunY, sunZ);
    rotateY(tt * 2);

    if(window.sun){
      scale(.28);
      window.sun.draw(tt);
    }else{
      noStroke();

      fill(255, 175, 65, 225);
      sphere(this.sunSize, 20, 12);

      blendMode(ADD);
      fill(255, 120, 35, 24);
      sphere(this.sunSize * 1.45, 12, 8);

      fill(255, 210, 90, 12);
      sphere(this.sunSize * 2.05, 10, 6);
      blendMode(BLEND);
    }

    pop();
  }

  drawPlanet(i, sunX, sunY, sunZ, tt){
    const pos = this.planetPosition(i, sunX, sunY, sunZ, tt);

    this.planetTrails[i].push(pos.copy());
    if(this.planetTrails[i].length > this.maxPlanetTrail){
      this.planetTrails[i].shift();
    }

    this.drawPlanetTrail(i);

    push();
    translate(pos.x, pos.y, pos.z);
    rotateY(frameCount * 0.02);

    const c = this.cols[i];
    const pr = max(3.2, this.sunSize * this.sizes[i]);

    noStroke();
    fill(c[0], c[1], c[2], 225);
    sphere(pr, 12, 8);

    // Aura solo en planetas grandes y Tierra, no todos
    if(i === 2 || i === 4 || i === 5){
      blendMode(ADD);
      fill(c[0], c[1], c[2], 22);
      sphere(pr * 1.8, 8, 6);
      blendMode(BLEND);
    }

    if(i === 2){
      blendMode(ADD);
      fill(80, 180, 255, 42);
      sphere(pr * 2.7, 8, 6);
      blendMode(BLEND);
    }

    if(i === 5 || i === 6 || i === 7){
      this.drawRing(pr);
    }

    pop();
  }

  drawRing(r){
    push();
    rotateX(radians(70));
    noFill();

    stroke(180, 210, 240, 80);
    strokeWeight(.9);
    ellipse(0, 0, r * 5.0, r * 2.5);

    stroke(220, 230, 255, 40);
    strokeWeight(.55);
    ellipse(0, 0, r * 6.5, r * 3.2);

    pop();
  }

  drawPlanetTrail(i){
    const tr = this.planetTrails[i];
    const c = this.cols[i];

    for(let j = 1; j < tr.length; j += 2){
      const p1 = tr[j - 1];
      const p2 = tr[j];
      const amt = j / tr.length;

      stroke(
        lerp(150, c[0], amt),
        lerp(185, c[1], amt),
        lerp(255, c[2], amt),
        map(j, 0, tr.length, 0, 100)
      );

      strokeWeight(.65);
      line(p1.x, p1.y, p1.z, p2.x, p2.y, p2.z);
    }
  }

  drawTrailSimple(tr, c, w){
    for(let i = 1; i < tr.length; i += 2){
      const p1 = tr[i - 1];
      const p2 = tr[i];

      stroke(c[0], c[1], c[2], map(i, 0, tr.length, 0, 135));
      strokeWeight(w);
      line(p1.x, p1.y, p1.z, p2.x, p2.y, p2.z);
    }
  }

  drawStars(t){
    push();
    blendMode(ADD);

    for(const s of this.stars){
      const blink = map(sin(t * 3.2 + s.tw), -1, 1, .7, 1.12);

      stroke(180, 220, 255, s.a * blink);
      strokeWeight(s.w);
      point(s.x, s.y, s.z);
    }

    blendMode(BLEND);
    pop();
  }
}