/*
========================================================
VIAJE COSMICO COMPLETO - FINAL FUNCIONAL 100%
Globo Universal → Galaxia Central → Brazo de Orión PERSONAL
Alex Hacohen - Cineasta Cósmico 2026
========================================================
CONTROLES: Drag=rotar, Wheel=zoom, R=reiniciar
*/

import processing.event.MouseEvent;

// =====================================================
// ESTADOS DEL VIAJE
// =====================================================
int STATE = 0; // 0=Universo, 1=Galaxia, 2=Personal
float transitionProgress = 0;
float transitionSpeed = 0.008;

// =====================================================
// UNIVERSO (Globo Central)
// =====================================================
float camRotX = 0.2, camRotY = 0.5, camDistance = 1800;
float universeBreath = 1, breathTime = 0;

ArrayList<Star> stars = new ArrayList<>();
ArrayList<Galaxy> galaxies = new ArrayList<>();
ArrayList<Filament> filaments = new ArrayList<>();
ArrayList<Dust> dusts = new ArrayList<>();
ArrayList<Planet> planets = new ArrayList<>();

// =====================================================
// GALAXIA CENTRAL
// =====================================================
float galacticTime = 0;
float renderScale = 6.0;
PVector solarPosCentral = new PVector(8.0, 0.01, -0.055);
ArrayList<GalacticStar> centralStars = new ArrayList<>();
ArrayList<GasParticle> centralGases = new ArrayList<>();
ArrayList<HaloStar> centralHalo = new ArrayList<>();
ArrayList<Cluster> centralClusters = new ArrayList<>();

// =====================================================
// GALAXIA PERSONAL (Brazo Orión)
// =====================================================
PVector camPosPersonal = new PVector(0, 5, 45);
PVector camTargetPersonal = new PVector(0, 0, 0);
float personalTime = 0;
ArrayList<GalacticStar> personalStars = new ArrayList<>();
ArrayList<HaloStar> personalHalo = new ArrayList<>();
PVector personalSolarPos;

void setup() {
  size(1400, 1000, P3D);
  smooth(8);
  
  generateUniverse();
  generateCentralGalaxy();
  generatePersonalGalaxy();
  
  println("🌌 VIAJE CÓSMICO COMPLETO - FUNCIONANDO");
  println("Presiona 'R' para reiniciar");
}

void draw() {
  background(0);
  
  // Transiciones automáticas
  if (STATE == 0 && transitionProgress > 0.95) {
    STATE = 1; 
    transitionProgress = 0; 
    println("🌀 → LLEGANDO A GALAXIA CENTRAL");
  } 
  else if (STATE == 1 && transitionProgress > 0.95) {
    STATE = 2; 
    transitionProgress = 0; 
    println("⭐ → BIENVENIDO A TU BRAZO DE ORIÓN");
  }
  
  transitionProgress += transitionSpeed;
  
  // Render por estado
  switch(STATE) {
    case 0: renderUniverse(); break;
    case 1: renderCentralGalaxy(); break;
    case 2: renderPersonalGalaxy(); break;
  }
  
  drawHUD();
}

// =====================================================
// RENDERIZADORES
// =====================================================

void renderUniverse() {
  breathTime += 0.003;
  universeBreath = 1 + sin(breathTime) * 0.05;
  
  setUniverseCamera();
  
  lights();
  rotateY(frameCount * 0.0006);
  scale(universeBreath);
  
  drawOuterMembrane();
  
  for (Filament f : filaments) { f.update(); f.display(); }
  for (Dust d : dusts) { d.update(); d.display(); }
  for (Star s : stars) { s.update(); s.display(); }
  for (Galaxy g : galaxies) { g.update(); g.display(); }
  
  drawCentralStar();
  for (Planet p : planets) { p.update(); p.display(); }
  drawVoid();
}

void renderCentralGalaxy() {
  galacticTime += 0.00002;
  
  setCentralCamera();
  rotateY(galacticTime);
  
  for (HaloStar h : centralHalo) { h.update(galacticTime); h.display(); }
  for (GasParticle g : centralGases) { g.display(); }
  for (GalacticStar s : centralStars) { s.update(galacticTime); s.display(); }
  for (Cluster c : centralClusters) { c.display(); }
  
  drawGalacticCore();
  drawLocalBubbleCentral();
  drawSolarSystemCentral();
}

void renderPersonalGalaxy() {
  personalTime += 0.00015;
  
  updatePersonalCamera();
  setPersonalCamera();
  
  for (HaloStar h : personalHalo) { h.display(); }
  for (GalacticStar s : personalStars) { s.update(personalTime); s.display(); }
  
  drawPersonalCore();
  drawPersonalSolarSystem();
}

// =====================================================
// CÁMARAS
// =====================================================

float smoothstep(float x) {
  x = constrain(x, 0, 1);
  return x * x * (3 - 2 * x);
}

void setUniverseCamera() {
  float prog = smoothstep(transitionProgress);
  float dist = lerp(camDistance, 40, prog);
  
  float camX = cos(camRotY) * cos(camRotX) * dist;
  float camY = sin(camRotX) * dist;
  float camZ = sin(camRotY) * cos(camRotX) * dist;
  
  camera(camX, camY, camZ, 0, 0, 0, 0, 1, 0);
}

void setCentralCamera() {
  float prog = smoothstep(transitionProgress);
  camDistance = lerp(40, 30, prog);
  
  perspective(PI/3.0, float(width)/height, 0.1, 500);
  
  float camX = cos(camRotY) * cos(camRotX) * camDistance;
  float camY = sin(camRotX) * camDistance;
  float camZ = sin(camRotY) * cos(camRotX) * camDistance;
  
  camera(camX, camY, camZ, 0, 0, 0, 0, 1, 0);
}

void updatePersonalCamera() {
  PVector targetWorld = PVector.mult(personalSolarPos, renderScale);
  PVector desired = PVector.add(targetWorld, new PVector(2, 1.5, 8));
  
  camPosPersonal = PVector.lerp(camPosPersonal, desired, 0.012);
  camTargetPersonal = PVector.lerp(camTargetPersonal, targetWorld, 0.015);
}

void setPersonalCamera() {
  perspective(PI/3.0, float(width)/height, 0.1, 500);
  camera(camPosPersonal.x, camPosPersonal.y, camPosPersonal.z,
         camTargetPersonal.x, camTargetPersonal.y, camTargetPersonal.z,
         0, 1, 0);
}

// =====================================================
// GENERADORES
// =====================================================

PVector randomSpherePosition(float radius) {
  return PVector.random3D().mult(radius);
}

void generateUniverse() {
  // Estrellas
  for (int i = 0; i < 5000; i++) {
    PVector p = randomSpherePosition(random(200, 820));
    p.y *= 0.55;
    stars.add(new Star(p));
  }
  
  // Galaxias
  for (int i = 0; i < 100; i++) {
    PVector p = randomSpherePosition(random(320, 920));
    p.y *= 0.5;
    galaxies.add(new Galaxy(p));
  }
  
  // Filamentos y polvo
  for (int i = 0; i < 1000; i++) filaments.add(new Filament());
  for (int i = 0; i < 3000; i++) dusts.add(new Dust());
  
  // Planetas
  planets.add(new Planet(120, 8, color(220,120,80), 0.03));
  planets.add(new Planet(190,12,color(120,160,255),0.018));
  planets.add(new Planet(280,18,color(240,200,120),0.01));
}

void generateCentralGalaxy() {
  int numArms = 4;
  for (int arm = 0; arm < numArms; arm++) {
    float armOffset = TWO_PI / numArms * arm;
    for (int i = 0; i < 3000; i++) {
      float t = random(1);
      float r = pow(t, 0.5) * 15;
      float theta = armOffset + (r * 0.3) / (TWO_PI * tan(radians(12)));
      theta += random(-0.1, 0.1);
      
      PVector p = new PVector(cos(theta)*r, randomGaussian()*0.2, sin(theta)*r);
      if (PVector.dist(p, solarPosCentral) < 0.15 && random(1) < 0.85) continue;
      centralStars.add(new GalacticStar(p));
    }
  }
  
  // Halo, gas, cúmulos
  for (int i = 0; i < 1000; i++) {
    PVector p = PVector.random3D().mult(random(15,25));
    centralHalo.add(new HaloStar(p));
  }
  for (int i = 0; i < 6000; i++) {
    float r = random(1,15), theta = random(TWO_PI);
    PVector p = new PVector(cos(theta)*r, randomGaussian()*0.5, sin(theta)*r);
    centralGases.add(new GasParticle(p));
  }
  for (int i = 0; i < 50; i++) {
    PVector center = PVector.random3D().mult(random(10,25));
    centralClusters.add(new Cluster(center));
  }
}

void generatePersonalGalaxy() {
  int numArms = 4;
  float solarR = 8.2;
  float solarTheta = TWO_PI/numArms * 1 + solarR * 0.33;
  personalSolarPos = new PVector(cos(solarTheta)*solarR, randomGaussian()*0.03, sin(solarTheta)*solarR);
  
  for (int arm = 0; arm < numArms; arm++) {
    float armOffset = TWO_PI / numArms * arm;
    for (int i = 0; i < 6000; i++) {
      float r = pow(random(1), 0.7) * 15;
      float theta = armOffset + r * 0.33;
      float armThickness = 0.18 + r * 0.06;
      theta += randomGaussian() * armThickness;
      
      PVector p = new PVector(cos(theta)*r, randomGaussian()*0.12, sin(theta)*r);
      personalStars.add(new GalacticStar(p, arm));
    }
  }
  
  for (int i = 0; i < 1000; i++) {
    PVector p = PVector.random3D().mult(random(15,25));
    personalHalo.add(new HaloStar(p));
  }
}

// =====================================================
// CLASES COMPLETAS
// =====================================================

class Star {
  PVector pos; float pulse, size; color c;
  
  Star(PVector p) {
    pos = p.copy();
    pulse = random(TWO_PI);
    size = random(1,3);
    c = color(random(180,255), random(180,255), 255);
  }
  
  void update() {
    pulse += 0.02;
    pos.mult(1 + sin(pulse)*0.00003);
  }
  
  void display() {
    float a = 100 + sin(pulse)*80;
    strokeWeight(size);
    stroke(c, a);
    point(pos.x, pos.y, pos.z);
  }
}

class Galaxy {
  PVector pos; float rot, speed, size; int arms;
  
  Galaxy(PVector p) {
    pos = p.copy();
    rot = random(TWO_PI);
    speed = random(0.002,0.008);
    size = random(18,50);
    arms = int(random(2,5));
  }
  
  void update() { rot += speed; }
  
  void display() {
    pushMatrix();
    translate(pos.x, pos.y, pos.z);
    rotateY(rot);
    rotateZ(rot*0.4);
    
    for (int arm = 0; arm < arms; arm++) {
      float armOffset = TWO_PI/arms * arm;
      for (int i = 0; i < 40; i++) {
        float t = i/40.0;
        float angle = t*5.5 + armOffset + rot;
        float radius = t * size * 2.2;
        float x = cos(angle) * radius;
        float y = sin(angle*2.0) * 2;
        float z = sin(angle) * radius;
        float alpha = map(t, 0,1,180,0);
        
        strokeWeight(random(1,2.5));
        stroke(255,230,200,alpha);
        point(x,y,z);
      }
    }
    
    noStroke();
    fill(255,250,220,220);
    sphere(size*0.12);
    fill(180,200,255,18);
    sphere(size*0.4);
    popMatrix();
  }
}

class Filament {
  PVector a, b; float pulse, alpha;
  
  Filament() {
    a = randomSpherePosition(random(700,1100));
    a.y *= 0.5;
    b = PVector.add(a, PVector.random3D().mult(random(20,120)));
    alpha = random(6,40);
    pulse = random(TWO_PI);
  }
  
  void update() { pulse += 0.01; }
  
  void display() {
    float aa = alpha + sin(pulse)*8;
    strokeWeight(1);
    stroke(255,140,80,aa);
    line(a.x,a.y,a.z, b.x,b.y,b.z);
  }
}

class Dust {
  PVector pos; float pulse;
  
  Dust() {
    pos = randomSpherePosition(random(250,1200));
    pos.y *= 0.5;
    pulse = random(TWO_PI);
  }
  
  void update() { pulse += 0.01; }
  
  void display() {
    float a = 5 + sin(pulse)*3;
    strokeWeight(1);
    stroke(180,100,70,a);
    point(pos.x,pos.y,pos.z);
  }
}

class Planet {
  float orbit, size; color c; float speed, angle, tilt;
  
  Planet(float o, float s, color cc, float sp) {
    orbit = o; size = s; c = cc; speed = sp;
    angle = random(TWO_PI);
    tilt = random(-0.5,0.5);
  }
  
  void update() { angle += speed; }
  
  void display() {
    pushMatrix();
    rotateX(tilt);
    float x = cos(angle)*orbit;
    float z = sin(angle)*orbit;
    translate(x,0,z);
    noStroke();
    fill(c);
    sphere(size);
    popMatrix();
  }
}

class GalacticStar {
  PVector pos, basePos; float pulse, size; color c; int arm = 0;
  
  GalacticStar(PVector p) {
    this(p, 0);
  }
  
  GalacticStar(PVector p, int a) {
    basePos = p.copy();
    pos = p.copy();
    arm = a;
    pulse = random(TWO_PI);
    size = random(0.5,2);
    
    float temp = random(1);
    if (temp < 0.6) c = color(255,220,180);
    else if (temp < 0.85) c = color(200,220,255);
    else c = color(100,150,255);
  }
  
  void update(float time) {
    pulse += 0.02;
    
    float r = sqrt(basePos.x*basePos.x + basePos.z*basePos.z);
    float omega = (r < 2.0) ? 110.0/r : 220.0/r;
    
    float a = atan2(basePos.z, basePos.x) + omega * time;
    pos.x = cos(a) * r;
    pos.z = sin(a) * r;
  }
  
  void display() {
    PVector p = PVector.mult(pos, renderScale);
    float d = p.mag();
    float alpha = constrain(map(d, 0, 80, 255, 20), 20, 255);
    float s = map(d, 0, 80, 2.5, 0.5);
    
    strokeWeight(size * s);
    stroke(c, alpha);
    point(p.x, p.y, p.z);
  }
}

class HaloStar {
  PVector pos; float pulse;
  
  HaloStar(PVector p) {
    pos = p.copy();
    pulse = random(TWO_PI);
  }
  
  void update(float t) {
    pulse += 0.01;
  }
  
  void display() {
    PVector p = PVector.mult(pos, renderScale);
    float d = p.mag();
    float alpha = map(d, 10, 120, 80, 5);
    
    strokeWeight(0.7);
    stroke(150, 180, 255, alpha);
    point(p.x, p.y, p.z);
  }
}

class GasParticle {
  PVector pos; color c;
  
  GasParticle(PVector p) {
    pos = p.copy();
    c = color(random(100,255), random(50,150), random(100,255));
  }
  
  void update(float t) {}
  
  void display() {
    PVector p = PVector.mult(pos, renderScale);
    float d = p.mag();
    float alpha = (d < 1) ? 30 : (d < 8 ? 4 : 1);
    
    strokeWeight(0.6);
    stroke(c, alpha);
    point(p.x, p.y, p.z);
  }
}

class Cluster {
  PVector center; ArrayList<PVector> pts = new ArrayList<>();
  
  Cluster(PVector c) {
    center = c.copy();
    for (int i = 0; i < 30; i++) {
      pts.add(PVector.random3D().mult(random(0.02, 0.1)));
    }
  }
  
  void display() {
    pushMatrix();
    PVector c = PVector.mult(center, renderScale);
    translate(c.x, c.y, c.z);
    
    stroke(255, 240, 200, 120);
    strokeWeight(1.2);
    
    for (PVector p : pts) {
      PVector sp = PVector.mult(p, renderScale);
      point(sp.x, sp.y, sp.z);
    }
    popMatrix();
  }
}

// =====================================================
// DIBUJOS ESPECÍFICOS
// =====================================================

void drawCentralStar() {
  pushMatrix();
  noStroke();
  for (int i = 0; i < 10; i++) {
    fill(255, 180, 80, 10);
    sphere(40 + i*14 + sin(frameCount*0.02+i)*6);
  }
  fill(255, 240, 180);
  sphere(34);
  popMatrix();
}

void drawVoid() {
  pushMatrix();
  noStroke();
  fill(0);
  sphere(90);
  popMatrix();
}

void drawOuterMembrane() {
  pushMatrix();
  noFill();
  for (int i = 0; i < 12; i++) {
    stroke(255, 60, 30, 7);
    strokeWeight(2);
    sphere(1180 + i*10 + sin(frameCount*0.01+i)*16);
  }
  popMatrix();
}

void drawGalacticCore() {
  pushMatrix();
  noStroke();
  fill(255, 220, 140, 20);
  sphere(1.5);
  fill(0);
  sphere(0.05);
  popMatrix();
}

void drawLocalBubbleCentral() {
  pushMatrix();
  translate(solarPosCentral.x*renderScale, solarPosCentral.y*renderScale, solarPosCentral.z*renderScale);
  noFill();
  stroke(120, 180, 255, 10);
  sphere(0.4);
  popMatrix();
}

void drawSolarSystemCentral() {
  pushMatrix();
  translate(solarPosCentral.x*renderScale, solarPosCentral.y*renderScale, solarPosCentral.z*renderScale);
  fill(255, 240, 180);
  sphere(0.05);
  popMatrix();
}

void drawPersonalCore() {
  pushMatrix();
  noStroke();
  fill(255, 220, 140, 60);
  sphere(1.3);
  popMatrix();
}

void drawPersonalSolarSystem() {
  pushMatrix();
  PVector p = PVector.mult(personalSolarPos, renderScale);
  translate(p.x, p.y, p.z);
  fill(255, 240, 180);
  sphere(0.05);
  popMatrix();
}

// =====================================================
// HUD NARRATIVO
// =====================================================

void drawHUD() {
  hint(DISABLE_DEPTH_TEST);
  
  String[] phases = {"🌌 GLOBO UNIVERSAL", "🌀 GALAXIA CENTRAL", "⭐ TU BRAZO ORIÓN"};
  fill(255, 220, 180);
  textSize(20);
  text(phases[STATE], 20, 35);
  
  fill(255, 180);
  textSize(14);
  text("Progreso: " + nf(transitionProgress*100, 1, 0) + "%", 20, 60);
  text("Drag: rotar | Wheel: zoom | R: reiniciar", 20, height-40);
  
  hint(ENABLE_DEPTH_TEST);
}

// =====================================================
// CONTROLES
// =====================================================

void mouseDragged() {
  camRotY += (mouseX - pmouseX) * 0.01;
  camRotX += (mouseY - pmouseY) * 0.01;
  camRotX = constrain(camRotX, -HALF_PI, HALF_PI);
}

void mouseWheel(MouseEvent e) {
  if (STATE == 0) {
    camDistance += e.getCount() * 40;
    camDistance = constrain(camDistance, 300, 5000);
  } else if (STATE == 1) {
    camDistance += e.getCount() * 2;
    camDistance = constrain(camDistance, 5, 100);
  } else {
    camPosPersonal.z += e.getCount() * 1.2;
    camPosPersonal.z = constrain(camPosPersonal.z, 10, 120);
  }
}

void keyPressed() {
  if (key == 'r' || key == 'R') {
    STATE = 0;
    transitionProgress = 0;
    camDistance = 1800;
    camRotX = 0.2;
    camRotY = 0.5;
    camPosPersonal.set(0, 5, 45);
    println("🔄 VIAJE REINICIADO");
  }
}
