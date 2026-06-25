/*
====================================================
CRISTAL ELECTRICO
VERSION FINAL
====================================================

- cámara orbital 360
- partículas flotando en XYZ
- rayos eléctricos vivos
- mouse altera el campo
- rayos convergen al cristal
- el cristal explota al 5to impacto
- rayos cambian OPACIDAD según cercanía

====================================================
CONTROLES

drag mouse -> rotar cámara
mover mouse -> alterar campo
mouse wheel -> zoom

====================================================
*/

import processing.event.MouseEvent;

ArrayList<Node> nodes =
  new ArrayList<Node>();

ArrayList<Bolt> bolts =
  new ArrayList<Bolt>();

Crystal crystal;

// =====================================================
// CAMARA
// =====================================================

float camRotX = 0.2;
float camRotY = 0.7;

float camDistance = 500;

// =====================================================

float fieldEnergy = 0;

// =====================================================

void setup() {

  size(1200, 900, P3D);

  smooth(4);

  crystal = new Crystal();

  // partículas
  for (int i = 0; i < 320; i++) {

    nodes.add(new Node());
  }

  strokeCap(ROUND);
}

// =====================================================

void draw() {

  background(2, 3, 8);

  // =====================================================
  // ENERGIA DEL MOUSE
  // =====================================================

  float mouseSpeed =
    dist(
    mouseX,
    mouseY,
    pmouseX,
    pmouseY
    );

  fieldEnergy += mouseSpeed * 0.02;

  fieldEnergy *= 0.96;

  // =====================================================
  // CAMARA ORBITAL
  // =====================================================

  float camX =
    cos(camRotY) *
    cos(camRotX) *
    camDistance;

  float camY =
    sin(camRotX) *
    camDistance;

  float camZ =
    sin(camRotY) *
    cos(camRotX) *
    camDistance;

  camera(
    camX,
    camY,
    camZ,

    0,
    0,
    0,

    0,
    1,
    0
    );

  // =====================================================
  // PARTICULAS
  // =====================================================

  for (Node n : nodes) {

    n.update();
    n.display();
  }

  // =====================================================
  // RAYOS
  // =====================================================

  if (random(1) < 0.08 + fieldEnergy*0.01) {

    spawnBolt();
  }

  for (int i = bolts.size()-1; i >= 0; i--) {

    Bolt b = bolts.get(i);

    b.update();
    b.display();

    if (b.dead) {

      bolts.remove(i);
    }
  }

  // =====================================================
  // CRISTAL
  // =====================================================

  crystal.update();
  crystal.display();
}

// =====================================================
// PARTICULAS
// =====================================================

class Node {

  PVector pos;

  PVector vel;

  float size;

  float pulse;

  // =====================================================

  Node() {

    pos =
      new PVector(
      random(-220, 220),
      random(-220, 220),
      random(-220, 220)
      );

    vel =
      PVector.random3D();

    vel.mult(random(0.1));

    size =
      random(2, 2);

    pulse =
      random(TWO_PI);
  }

  // =====================================================

  void update() {

    pulse += 0.02;

    // flotación orgánica
    PVector drift =
      PVector.random3D();

    drift.mult(0.01);

    vel.add(drift);

    // mouse agita nube
    vel.add(
      PVector.random3D()
      .mult(fieldEnergy * 0.03)
      );

    // atracción al cristal
    PVector toCore =
      PVector.sub(
      new PVector(0, 0, 0),
      pos
      );

    float d =
      toCore.mag();

    if (d < 260) {

      toCore.normalize();

      float force =
        map(
        d,
        260,
        0,
        0.001,
        0.05
        );

      force *= fieldEnergy * 0.08;

      toCore.mult(force);

      vel.add(toCore);
    }

    vel.mult(0.985);

    pos.add(vel);
  }

  // =====================================================

  void display() {

    float a =
      20 + sin(pulse)*10;

    // halo
    strokeWeight(size*2);

    stroke(
      20,
      18,
      25,
      a*0.2
      );

    point(
      pos.x,
      pos.y,
      pos.z
      );

    // núcleo
    strokeWeight(size*0.5);

    stroke(
      20,
      2,
      10,
      a
      );

    point(
      pos.x,
      pos.y,
      pos.z
      );
  }
}

// =====================================================
// CRISTAL
// =====================================================

class Crystal {

  float explode = 0;

  float squash = 1;

  int hits = 0;

  boolean exploding = false;

  // =====================================================

  void hit() {

    if (exploding) return;

    hits++;

    squash = 0.7;

    explode = 80;

    // explota al 5to impacto
    if (hits >= 3) {

      exploding = true;

      explode = 255;
    }
  }

  // =====================================================

  void update() {

    squash = lerp(
      squash,
      1,
      0.08
      );

    explode *= 0.94;
  }

  // =====================================================

  void display() {

    pushMatrix();

    rotateY(frameCount*0.01);
    rotateX(frameCount*0.006);

    scale(
      1,
      squash,
      1
      );

    // =====================================
    // EXPLOSION
    // =====================================

    if (exploding) {

      noFill();

      for (int i = 0; i < 8; i++) {

        stroke(
          70,
          120,
          200,
          explode * 0.15
          );

        strokeWeight(2);

        sphere(
          140 +
          i*40 +
          explode*1
          );
      }

      explode *= 0.96;

      // reset
      if (explode < 2) {

        exploding = false;

        hits = 0;

        explode = 0;
      }
    }

    // =====================================
    // HALO
    // =====================================

    noFill();

    stroke(
      40,
      40,
      40,
      20 + explode*0.15
      );

    strokeWeight(1);

    sphere(
      10 + explode*0.08
      );

    // =====================================
    // CRISTAL
    // =====================================

    noStroke();

    fill(
      80 + hits*6,
      90,
      0,
      40
      );

    drawCrystal(1);

    popMatrix();
  }
}

// =====================================================
// GEOMETRIA DEL CRISTAL
// =====================================================

void drawCrystal(float s) {

  beginShape(TRIANGLES);

  // top

  vertex(0, -s, 0);
  vertex(-s*0.5, 0, -s*0.5);
  vertex(s*0.5, 0, -s*0.5);

  vertex(0, -s, 0);
  vertex(s*0.5, 0, -s*0.5);
  vertex(s*0.5, 0, s*0.5);

  vertex(0, -s, 0);
  vertex(s*0.5, 0, s*0.5);
  vertex(-s*0.5, 0, s*0.5);

  vertex(0, -s, 0);
  vertex(-s*0.5, 0, s*0.5);
  vertex(-s*0.5, 0, -s*0.5);

  // bottom

  vertex(0, s, 0);
  vertex(s*0.5, 0, -s*0.5);
  vertex(-s*0.5, 0, -s*0.5);

  vertex(0, s, 0);
  vertex(s*0.5, 0, s*0.5);
  vertex(s*0.5, 0, -s*0.5);

  vertex(0, s, 0);
  vertex(-s*0.5, 0, s*0.5);
  vertex(s*0.5, 0, s*0.5);

  vertex(0, s, 0);
  vertex(-s*0.5, 0, -s*0.5);
  vertex(-s*0.5, 0, s*0.5);

  endShape();
}

// =====================================================
// RAYOS
// =====================================================

class Bolt {

  ArrayList<PVector> pts =
    new ArrayList<PVector>();

  float energy = 255;

  boolean dead = false;

  boolean hitCrystal = false;

  // =====================================================

  Bolt(
    PVector start,
    PVector end,
    boolean hit
    ) {

    hitCrystal = hit;

    int segs = 10;

    for (int i = 0; i <= segs; i++) {

      float t =
        i/(float)segs;

      PVector p =
        PVector.lerp(
        start,
        end,
        t
        );

      p.add(
        PVector.random3D()
        .mult(6)
        );

      pts.add(p);
    }
  }

  // =====================================================

  void update() {

    energy *= 0.88;

    if (energy < 5) {

      dead = true;
    }

    // golpe al cristal
    if (
      hitCrystal &&
      energy > 220
      ) {

      crystal.hit();

      hitCrystal = false;
    }
  }

  // =====================================================

  void display() {

    noFill();

    // ==========================================
    // DISTANCIA AL CRISTAL
    // ==========================================

    PVector last =
      pts.get(pts.size()-1);

    float d =
      dist(
      last.x,
      last.y,
      last.z,
      0,
      0,
      0
      );

    // cerca = más visible
    float proximity =
      map(
      d,
      320,
      0,
      0.02,
      1
      );

    proximity =
      constrain(
      proximity,
      0.02,
      1
      );

    // opacidad real
    float alpha =
      energy * proximity;

    // ==========================================
    // NUCLEO DEL RAYO
    // ==========================================

    strokeWeight(1);

    stroke(
      220,
      240,
      255,
      alpha
      );

    beginShape();

    for (PVector p : pts) {

      vertex(
        p.x,
        p.y,
        p.z
        );
    }

    endShape();

    // ==========================================
    // HALO EXTERIOR
    // ==========================================

    strokeWeight(4);

    stroke(
      120,
      180,
      255,
      alpha * 0.12
      );

    beginShape();

    for (PVector p : pts) {

      vertex(
        p.x,
        p.y,
        p.z
        );
    }

    endShape();

    // ==========================================
    // HALO LEJANO
    // ==========================================

    strokeWeight(10);

    stroke(
      120,
      180,
      255,
      alpha * 0.03
      );

    beginShape();

    for (PVector p : pts) {

      vertex(
        p.x,
        p.y,
        p.z
        );
    }

    endShape();
  }
}

// =====================================================
// CREAR RAYOS
// =====================================================

void spawnBolt() {

  Node a =
    nodes.get(
    int(random(nodes.size()))
    );

  boolean hitCrystal =
    random(1) <
    fieldEnergy * 0.03;

  PVector end;

  if (hitCrystal) {

    end =
      new PVector(0, 0, 0);

  } else {

    Node b =
      nodes.get(
      int(random(nodes.size()))
      );

    end = b.pos.copy();
  }

  bolts.add(
    new Bolt(
    a.pos.copy(),
    end,
    hitCrystal
    )
    );
}

// =====================================================
// CAMARA
// =====================================================

void mouseDragged() {

  camRotY +=
    (mouseX - pmouseX) * 0.01;

  camRotX +=
    (mouseY - pmouseY) * 0.01;
}

// =====================================================
// ZOOM
// =====================================================

void mouseWheel(MouseEvent event) {

  camDistance +=
    event.getCount() * 25;

  camDistance =
    constrain(
    camDistance,
    120,
    1200
    );
}
