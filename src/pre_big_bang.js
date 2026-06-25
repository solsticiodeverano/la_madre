// Escena inicial: materia oscura comprimida antes de la expansión.
class PreBigBang{
  constructor(count = 260){
    this.nodes = [];
    this.bolts = [];

    this.energy = 0;
    this.lastPhase = 0;

    // Estado del destello de Big Bang.
    this.bang = 0;
    this.bangTriggered = false;

    // Crea las partículas iniciales.
    for(let i = 0; i < count; i++){
      this.nodes.push(new PreNode());
    }
  }

  draw(t, phase = 0, alpha = 1){
    // Suaviza la entrada de energía.
    this.energy = lerp(this.energy, phase, 0.04);

    // Dispara el Big Bang una sola vez al empezar el avance.
    if(phase > 0.08 && !this.bangTriggered){
      this.bang = 1;
      this.bangTriggered = true;
    }

    // Resetea el disparo si se vuelve al inicio.
    if(phase < 0.03){
      this.bangTriggered = false;
      this.bang = 0;
    }

    push();
    blendMode(ADD);

    // Rotación lenta de la nube inicial.
    rotateY(t * 0.08);
    rotateX(sin(t * 0.3) * 0.12);

    // Actualiza y dibuja partículas.
    for(const n of this.nodes){
      n.update(this.energy);
      n.display(alpha);
    }

    // Genera rayos eléctricos con más frecuencia cuando sube la energía.
    if(random(1) < 0.035 + this.energy * 0.08){
      this.spawnBolt();
    }

    // Actualiza y elimina rayos apagados.
    for(let i = this.bolts.length - 1; i >= 0; i--){
      const b = this.bolts[i];
      b.update();
      b.display(alpha);

      if(b.dead){
        this.bolts.splice(i, 1);
      }
    }

    // Destello expansivo de transición.
    if(this.bang > 0.01){
      this.drawBang(t, alpha);
      this.bang *= 0.935;
    }

    blendMode(BLEND);
    pop();
  }

  // Dibuja ondas esféricas y halos del Big Bang.
  drawBang(t, alpha){
    const b = this.bang;
    const inv = 1 - b;

    push();
    noFill();

    // Ondas expansivas.
    for(let i = 0; i < 7; i++){
      const r = 18 + inv * 320 + i * 28;
      const a = b * alpha * map(i, 0, 6, 115, 8);

      stroke(120, 180, 255, a * 0.55);
      strokeWeight(1.1);
      sphere(r, 24, 12);

      stroke(255, 220, 160, a * 0.22);
      strokeWeight(0.7);
      sphere(r * 0.72, 18, 10);
    }

    // Halo central.
    noStroke();

    fill(255, 230, 180, 120 * b * alpha);
    sphere(18 + inv * 55, 18, 10);

    fill(90, 160, 255, 55 * b * alpha);
    sphere(45 + inv * 150, 18, 10);

    fill(255, 120, 70, 32 * b * alpha);
    sphere(75 + inv * 230, 18, 10);

    pop();
  }

  // Crea un rayo entre una partícula y el centro u otra partícula.
  spawnBolt(){
    const a = random(this.nodes);
    const hitCore = random(1) < 0.35 + this.energy * 0.4;
    const end = hitCore ? createVector(0,0,0) : random(this.nodes).pos.copy();

    this.bolts.push(new PreBolt(a.pos.copy(), end));
  }
}


// Partícula de la nube previa al Big Bang.
class PreNode{
  constructor(){
    this.pos = createVector(
      random(-230, 230),
      random(-230, 230),
      random(-230, 230)
    );

    this.vel = p5.Vector.random3D().mult(random(0.02, 0.18));
    this.seed = random(9999);
    this.size = random(0.7, 1.8);
  }

  update(energy){
    // Movimiento errático suave.
    const drift = p5.Vector.random3D().mult(0.01 + energy * 0.015);
    this.vel.add(drift);

    // Atracción hacia el centro según la energía.
    const toCore = p5.Vector.mult(this.pos, -1);
    const d = toCore.mag();

    if(d < 320){
      toCore.normalize();
      toCore.mult(map(d, 320, 0, 0.0005, 0.018) * energy);
      this.vel.add(toCore);
    }

    this.vel.mult(0.985);
    this.pos.add(this.vel);
  }

  display(alpha){
    // Parpadeo individual de cada partícula.
    const blink = map(sin(frameCount * 0.04 + this.seed), -1, 1, 0.55, 1.2);
    const a = 70 * blink * alpha;

    // Halo.
    stroke(50, 80, 150, a * 0.22);
    strokeWeight(this.size * 2.4);
    point(this.pos.x, this.pos.y, this.pos.z);

    // Núcleo.
    stroke(155, 205, 255, a);
    strokeWeight(this.size * 0.8);
    point(this.pos.x, this.pos.y, this.pos.z);
  }
}


// Rayo eléctrico entre puntos de la nube.
class PreBolt{
  constructor(start, end){
    this.pts = [];
    this.energy = 255;
    this.dead = false;

    const segs = 9;

    // Construye una línea quebrada entre inicio y fin.
    for(let i = 0; i <= segs; i++){
      const amt = i / segs;
      const p = p5.Vector.lerp(start, end, amt);
      p.add(p5.Vector.random3D().mult(8));
      this.pts.push(p);
    }
  }

  update(){
    // El rayo se apaga con el tiempo.
    this.energy *= 0.86;
    if(this.energy < 5) this.dead = true;
  }

  display(alpha){
    noFill();

    // Línea blanca principal.
    stroke(220, 240, 255, this.energy * 0.72 * alpha);
    strokeWeight(1.0);
    beginShape();
    for(const p of this.pts) vertex(p.x, p.y, p.z);
    endShape();

    // Glow azul externo.
    stroke(90, 160, 255, this.energy * 0.12 * alpha);
    strokeWeight(4);
    beginShape();
    for(const p of this.pts) vertex(p.x, p.y, p.z);
    endShape();
  }
}