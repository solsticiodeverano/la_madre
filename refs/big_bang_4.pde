// =====================================
// 🌌 UNIVERSO DELUXE FINAL
// =====================================

float scale = 0.1;
float targetScale = 0.1;
boolean dragging = false;

// timeline
float[] stops = {0.1, 0.25, 0.45, 0.65, 0.8, 0.95};
String[] labels = {
  "Big Bang", "Materia", "Universo",
  "Galaxias", "Sistema Solar", "Tierra"
};

// cámara
PVector cam = new PVector(0,0);

// datos
ArrayList<Particle> particles;
ArrayList<Galaxy> galaxies;
ArrayList<Planet> planets;

// =====================================

void setup() {
  size(900, 800);
  resetUniverse();
}

// =====================================
// RESET UNIVERSO (CLAVE)
// =====================================

void resetUniverse() {

  particles = new ArrayList<>();
  for (int i=0; i<500; i++) {
    particles.add(new Particle());
  }

  galaxies = new ArrayList<>();
  for (int i=0; i<300; i++) {
    float a = random(TWO_PI);
    float d = random(200, 1500);
    galaxies.add(new Galaxy(cos(a)*d, sin(a)*d));
  }

  planets = new ArrayList<>();
  for (int i=0; i<5; i++) {
    planets.add(new Planet(40 + i*25));
  }

  cam.set(0,0);
}

// =====================================

void draw() {

  fill(0, 20);
  rect(0,0,width,height);

  updateScale();
  updateFocus();

  float zoom = pow(10, scale * 2);

  pushMatrix();
  translate(width/2, height/2);
  scale(zoom);
  translate(-cam.x, -cam.y);

  // =====================================
  // ETAPAS
  // =====================================

  // 💥 BIG BANG
  if (scale < 0.2) {
    blendMode(ADD);
    for (Particle p : particles) {
      p.bigBang();
      p.displayTrail();
    }
    blendMode(BLEND);
  }

  // ⚛️ MATERIA
  else if (scale < 0.4) {
    for (Particle p : particles) {
      p.slow();
      p.displayTrail();
    }
  }

  // 🌌 UNIVERSO (heatmap)
  else if (scale < 0.6) {
    blendMode(ADD);
    for (Particle p : particles) {
      p.expand();
      p.displayTrail();
    }
    blendMode(BLEND);
  }

  // 🌠 GALAXIAS
  else if (scale < 0.8) {
    for (Galaxy g : galaxies) {
      g.expand();
      g.display();
    }
  }

  // 🪐 SISTEMA SOLAR + 🌍 TIERRA
  else {
    fill(255,200,0);
    ellipse(0,0,20,20); // sol

    for (Planet p : planets) {
      p.update();
      p.display();
    }

    // 🌍 Tierra destacada
    fill(0,150,255);
    ellipse(40,0,8,8);
  }

  popMatrix();

  resetMatrix();

  drawTimeline();
  drawSlider();
  drawInfo();
}

// =====================================
// PARTICLE (TRAILS)
// =====================================

class Particle {

  PVector pos, vel;
  ArrayList<PVector> trail;

  Particle() {
    pos = new PVector(0,0);
    vel = PVector.random2D().mult(random(1,3));
    trail = new ArrayList<>();
  }

  void bigBang() {
    pos.add(vel);
    vel.mult(1.02);
    save();
  }

  void slow() {
    pos.add(vel);
    vel.mult(0.98);
    save();
  }

  void expand() {
    pos.mult(1.002);
    save();
  }

  void save() {
    trail.add(pos.copy());
    if (trail.size() > 40) trail.remove(0);
  }

  void displayTrail() {

    noFill();
    beginShape();

    for (int i=0; i<trail.size(); i++) {

      float t = map(i,0,trail.size(),0,1);
      float a = map(i,0,trail.size(),0,255);

      stroke(255*t, 100*(1-t), 255-255*t, a);

      PVector p = trail.get(i);
      vertex(p.x, p.y);
    }

    endShape();
  }
}

// =====================================
// GALAXY
// =====================================

class Galaxy {
  PVector pos;

  Galaxy(float x, float y) {
    pos = new PVector(x,y);
  }

  void expand() {
    pos.mult(1.0005);
  }

  void display() {
    stroke(255);
    point(pos.x, pos.y);
  }
}

// =====================================
// PLANETS
// =====================================

class Planet {
  float r, a, s;

  Planet(float r_) {
    r=r_;
    a=random(TWO_PI);
    s=random(0.01,0.03);
  }

  void update() {
    a+=s;
  }

  void display() {
    float x = cos(a)*r;
    float y = sin(a)*r;

    fill(150,150,255);
    ellipse(x,y,6,6);
  }
}

// =====================================
// UI
// =====================================

void drawSlider() {

  float x = width - 40;

  stroke(200);
  line(x, 50, x, height-100);

  float y = map(scale, 0,1, height-100, 50);

  fill(255);
  ellipse(x, y, 15, 15);
}

void drawTimeline() {

  float y = height - 40;

  stroke(200);
  line(50, y, width-100, y);

  for (int i=0; i<stops.length; i++) {

    float x = map(i, 0, stops.length-1, 50, width-100);

    fill(255);
    ellipse(x, y, 10, 10);

    fill(200);
    textAlign(CENTER);
    text(labels[i], x, y+20);
  }
}

void drawInfo() {

  fill(255);
  textAlign(LEFT);

  float years = pow(scale,4) * 13.8e9;

  text("Escala: " + nf(scale,1,3), 20,30);
  text("Tiempo: " + nf(years/1e6,1,2) + " millones de años", 20,50);
}

// =====================================
// INPUT
// =====================================

void mousePressed() {

  float sx = width - 40;
  float sy = map(scale, 0,1, height-100, 50);

  if (dist(mouseX, mouseY, sx, sy) < 10) {
    dragging = true;
    return;
  }

  float y = height - 40;

  for (int i=0; i<stops.length; i++) {

    float x = map(i, 0, stops.length-1, 50, width-100);

    if (dist(mouseX, mouseY, x, y) < 10) {
      targetScale = stops[i];
      scale = targetScale;

      // 💥 reset real
      resetUniverse();
    }
  }
}

void mouseReleased() {
  dragging = false;
}

// teclado → mover cámara
void keyPressed() {

  float step = 20 / pow(10, scale * 2);

  if (keyCode == LEFT) cam.x -= step;
  if (keyCode == RIGHT) cam.x += step;
  if (keyCode == UP) cam.y -= step;
  if (keyCode == DOWN) cam.y += step;
}

// =====================================
// UPDATE
// =====================================

void updateScale() {

  if (dragging) {
    scale = map(mouseY, 50, height-100, 1, 0);
    targetScale = scale;
  } else {
    scale += (targetScale - scale) * 0.05;
  }
}

// foco automático
void updateFocus() {

  if (scale < 0.8) {
    cam.lerp(new PVector(0,0), 0.05);
  } else {
    cam.lerp(new PVector(0,0), 0.1);
  }
}
