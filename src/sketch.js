/*
LA MADRE — versión fiel a los códigos fuente entregados.
Traducción a p5.js por escenas: big_bang.pde / universi.pde / sol.txt / tierra.pde.
No mezcla todo en una sola simulación: cada escena conserva su lógica y se activa por escala.
*/

let scene = 0;
let targetScene = 0;
let sceneLerp = 0;
let rotX = 0.2, rotY = 0.7;
let dragging = false;
let lastMX = 0, lastMY = 0;
let fieldEnergy = 0;
let bigbang, universe, sol, earth;

const stageTexts = [
  'BIG BANG / CRISTAL ELÉCTRICO: partículas en XYZ, rayos vivos, mouse altera el campo y los impactos hacen explotar el núcleo.',
  'UNIVERSO: globo universal, membrana, polvo, filamentos y galaxias; el viaje se acerca desde lo cósmico hacia una galaxia central.',
  'GALAXIA / BRAZO DE ORIÓN: espiral de estrellas, halo, gas y cúmulos; la cámara viaja hacia una posición solar dentro del brazo.',
  'SOL / SISTEMA SOLAR: red solar azul-oro y roja interna basada en sol.txt; órbitas polares con sin/cos y pulso energético.',
  'TIERRA / CULTURAS: planeta madre con relieve procedural, nubes, marcador central, zonas culturales y frase como archivo sensible.'
];

function setup(){
  const c = createCanvas(windowWidth, windowHeight, WEBGL);
  c.parent('app');
  pixelDensity(1);
  smooth();
  strokeCap(ROUND);
  bigbang = new BigBangScene();
  universe = new UniverseScene();
  sol = new SolScene();
  earth = new EarthScene();
}

function draw(){
  background(0);
  const mouseSpeed = dist(mouseX, mouseY, pmouseX, pmouseY);
  fieldEnergy += mouseSpeed * 0.02;
  fieldEnergy *= 0.96;
  sceneLerp = lerp(sceneLerp, targetScene, 0.07);
  const nearest = round(sceneLerp);
  scene = constrain(nearest,0,4);
  document.getElementById('progress').style.width = ((sceneLerp/4)*100).toFixed(1)+'%';
  document.getElementById('stageText').innerText = stageTexts[scene];

  ambientLight(8,8,12);
  directionalLight(255,245,220,-0.6,0.2,-1);
  directionalLight(25,45,90,0.8,-0.2,1);
  rotateX(rotX);
  rotateY(rotY);

  const t = frameCount;
  if(scene===0) bigbang.draw(t);
  if(scene===1) universe.drawUniverse(t);
  if(scene===2) universe.drawPersonalGalaxy(t);
  if(scene===3) { universe.drawSolarSystemGhost(t); sol.draw(t); }
  if(scene===4) earth.draw(t);
}

// =========================
// BIG_BANG.PDE — CRISTAL ELÉCTRICO
// =========================
class BBNode{
  constructor(){
    this.pos = createVector(random(-220,220),random(-220,220),random(-220,220));
    this.vel = p5.Vector.random3D().mult(random(0.1));
    this.size = 2;
    this.pulse = random(TWO_PI);
  }
  update(){
    this.pulse += 0.02;
    this.vel.add(p5.Vector.random3D().mult(0.01));
    this.vel.add(p5.Vector.random3D().mult(fieldEnergy*0.03));
    const toCore = p5.Vector.sub(createVector(0,0,0), this.pos);
    const d = toCore.mag();
    if(d < 260){
      toCore.normalize();
      let force = map(d,260,0,0.001,0.05) * fieldEnergy * 0.08;
      this.vel.add(toCore.mult(force));
    }
    this.vel.mult(0.985);
    this.pos.add(this.vel);
  }
  display(){
    const a = 20 + sin(this.pulse)*10;
    strokeWeight(this.size*2); stroke(20,18,25,a*0.2); point(this.pos.x,this.pos.y,this.pos.z);
    strokeWeight(this.size*.5); stroke(20,2,10,a); point(this.pos.x,this.pos.y,this.pos.z);
  }
}
class Crystal{
  constructor(){ this.explode=0; this.squash=1; this.hits=0; this.exploding=false; }
  hit(){ if(this.exploding) return; this.hits++; this.squash=.7; this.explode=80; if(this.hits>=3){this.exploding=true; this.explode=255;} }
  update(){ this.squash=lerp(this.squash,1,.08); this.explode*=.94; }
  display(){
    push(); rotateY(frameCount*.01); rotateX(frameCount*.006); scale(42,42*this.squash,42);
    if(this.exploding){ noFill(); for(let i=0;i<8;i++){ stroke(70,120,200,this.explode*.15); strokeWeight(2/42); sphere((140+i*40+this.explode)/42); } this.explode*=.96; if(this.explode<2){this.exploding=false; this.hits=0; this.explode=0;} }
    noFill(); stroke(40,40,40,20+this.explode*.15); strokeWeight(1/42); sphere((10+this.explode*.08)/42);
    noStroke(); fill(80+this.hits*6,90,0,40); drawCrystalGeom(1); pop();
  }
}
function drawCrystalGeom(s){
  beginShape(TRIANGLES);
  vertex(0,-s,0); vertex(-s*.5,0,-s*.5); vertex(s*.5,0,-s*.5);
  vertex(0,-s,0); vertex(s*.5,0,-s*.5); vertex(s*.5,0,s*.5);
  vertex(0,-s,0); vertex(s*.5,0,s*.5); vertex(-s*.5,0,s*.5);
  vertex(0,-s,0); vertex(-s*.5,0,s*.5); vertex(-s*.5,0,-s*.5);
  vertex(0,s,0); vertex(s*.5,0,-s*.5); vertex(-s*.5,0,-s*.5);
  vertex(0,s,0); vertex(s*.5,0,s*.5); vertex(s*.5,0,-s*.5);
  vertex(0,s,0); vertex(-s*.5,0,s*.5); vertex(s*.5,0,s*.5);
  vertex(0,s,0); vertex(-s*.5,0,-s*.5); vertex(-s*.5,0,s*.5);
  endShape();
}
class Bolt{
  constructor(start,end,hit){
    this.pts=[]; this.energy=255; this.dead=false; this.hitCrystal=hit;
    const segs=10;
    for(let i=0;i<=segs;i++){ let tt=i/segs; let p=p5.Vector.lerp(start,end,tt); p.add(p5.Vector.random3D().mult(6)); this.pts.push(p); }
  }
  update(crystal){ this.energy*=.88; if(this.energy<5)this.dead=true; if(this.hitCrystal&&this.energy>220){ crystal.hit(); this.hitCrystal=false; } }
  display(){
    const last=this.pts[this.pts.length-1]; let d=dist(last.x,last.y,last.z,0,0,0); let prox=constrain(map(d,320,0,.02,1),.02,1); let alpha=this.energy*prox;
    noFill(); strokeWeight(1); stroke(220,240,255,alpha); beginShape(); for(const p of this.pts) vertex(p.x,p.y,p.z); endShape();
    strokeWeight(4); stroke(120,180,255,alpha*.12); beginShape(); for(const p of this.pts) vertex(p.x,p.y,p.z); endShape();
    strokeWeight(10); stroke(120,180,255,alpha*.03); beginShape(); for(const p of this.pts) vertex(p.x,p.y,p.z); endShape();
  }
}
class BigBangScene{
  constructor(){ this.nodes=[]; this.bolts=[]; this.crystal=new Crystal(); for(let i=0;i<320;i++)this.nodes.push(new BBNode()); }
  draw(){
    push(); scale(1.45); blendMode(ADD);
    for(const n of this.nodes){ n.update(); n.display(); }
    if(random(1)<0.08+fieldEnergy*.01) this.spawnBolt();
    for(let i=this.bolts.length-1;i>=0;i--){ const b=this.bolts[i]; b.update(this.crystal); b.display(); if(b.dead)this.bolts.splice(i,1); }
    blendMode(BLEND); this.crystal.update(); this.crystal.display(); pop();
  }
  spawnBolt(){ const a=random(this.nodes); const hit=random(1)<fieldEnergy*.03; const end=hit?createVector(0,0,0):random(this.nodes).pos.copy(); this.bolts.push(new Bolt(a.pos.copy(),end,hit)); }
}

// =========================
// UNIVERSI.PDE — Universo + Galaxia + Brazo
// =========================
function randomSpherePosition(radius){ return p5.Vector.random3D().mult(radius); }
class UStar{ constructor(p){ this.p=p; this.seed=random(999); } update(){ } display(){ const a=90+80*noise(this.seed,frameCount*.01); stroke(255,230,180,a); strokeWeight(random(.5,1.4)); point(this.p.x,this.p.y,this.p.z); } }
class UGalaxy{ constructor(p){ this.p=p; this.rot=random(TWO_PI); this.s=random(.5,2); } display(){ push(); translate(this.p.x,this.p.y,this.p.z); rotateZ(this.rot+frameCount*.001); noFill(); stroke(120,170,255,90); beginShape(); for(let i=0;i<80;i++){ let a=i*.22; let r=i*.25*this.s; vertex(cos(a)*r,sin(a)*r,0); } endShape(); pop(); } }
class Filament{ constructor(){ this.a=randomSpherePosition(random(250,820)); this.b=p5.Vector.add(this.a,p5.Vector.random3D().mult(random(35,120))); this.seed=random(99); } update(){ } display(){ stroke(80,120,255,18+28*noise(this.seed,frameCount*.006)); strokeWeight(.7); line(this.a.x,this.a.y,this.a.z,this.b.x,this.b.y,this.b.z); } }
class Dust{ constructor(){ this.p=randomSpherePosition(random(100,850)); this.seed=random(900); } display(){ stroke(255,120,80,18); strokeWeight(.8); point(this.p.x,this.p.y,this.p.z); } }
class GalacticStar{ constructor(p){ this.p=p; this.seed=random(999); } update(time){ const a=time+this.seed*.0001; this.rp=createVector(this.p.x*cos(a)-this.p.z*sin(a),this.p.y,this.p.x*sin(a)+this.p.z*cos(a)); } display(k=16){ const p=this.rp||this.p; stroke(255,230,170,55); strokeWeight(.7); point(p.x*k,p.y*k,p.z*k); } }
class GasParticle{ constructor(p){this.p=p; this.c=random(1)} display(k=16){ stroke(120,80,255,12); strokeWeight(1.2); point(this.p.x*k,this.p.y*k,this.p.z*k); } }
class HaloStar{ constructor(p){this.p=p} update(time){} display(k=16){ stroke(130,170,255,30); strokeWeight(.6); point(this.p.x*k,this.p.y*k,this.p.z*k); } }
class Cluster{ constructor(c){this.c=c; this.pts=[]; for(let i=0;i<18;i++) this.pts.push(p5.Vector.add(c,p5.Vector.random3D().mult(random(.05,.5))));} display(k=16){ stroke(255,210,120,70); strokeWeight(1.2); for(const p of this.pts) point(p.x*k,p.y*k,p.z*k); } }
class UniverseScene{
  constructor(){
    this.stars=[]; this.galaxies=[]; this.filaments=[]; this.dusts=[]; this.centralStars=[]; this.centralGases=[]; this.centralHalo=[]; this.centralClusters=[]; this.personalStars=[]; this.personalHalo=[]; this.solarPosCentral=createVector(8,.01,-.055); this.personalSolarPos=createVector(6,.01,1.1);
    for(let i=0;i<1600;i++){let p=randomSpherePosition(random(200,820)); p.y*=.55; this.stars.push(new UStar(p));}
    for(let i=0;i<70;i++){let p=randomSpherePosition(random(320,920)); p.y*=.5; this.galaxies.push(new UGalaxy(p));}
    for(let i=0;i<500;i++)this.filaments.push(new Filament()); for(let i=0;i<900;i++)this.dusts.push(new Dust());
    for(let arm=0;arm<4;arm++){let armOffset=TWO_PI/4*arm; for(let i=0;i<1600;i++){let tt=random(1); let r=pow(tt,.5)*15; let theta=armOffset+(r*.3)/(TWO_PI*tan(radians(12)))+random(-.1,.1); this.centralStars.push(new GalacticStar(createVector(cos(theta)*r,randomGaussian()*.2,sin(theta)*r)));}}
    for(let i=0;i<700;i++)this.centralHalo.push(new HaloStar(p5.Vector.random3D().mult(random(15,25))));
    for(let i=0;i<1000;i++){let r=random(1,15), th=random(TWO_PI); this.centralGases.push(new GasParticle(createVector(cos(th)*r,randomGaussian()*.5,sin(th)*r)));}
    for(let i=0;i<25;i++)this.centralClusters.push(new Cluster(p5.Vector.random3D().mult(random(10,25))));
    for(let arm=0;arm<4;arm++){let armOffset=TWO_PI/4*arm; for(let i=0;i<1200;i++){let tt=random(1); let r=pow(tt,.7)*10; let theta=armOffset+r*.55+random(-.12,.12); this.personalStars.push(new GalacticStar(createVector(cos(theta)*r,randomGaussian()*.13,sin(theta)*r)));}}
    for(let i=0;i<400;i++)this.personalHalo.push(new HaloStar(p5.Vector.random3D().mult(random(8,16))));
  }
  drawUniverse(){ push(); scale(.72+sin(frameCount*.003)*.03); noFill(); stroke(60,90,170,35); sphere(620); for(const f of this.filaments){f.update();f.display();} for(const d of this.dusts)d.display(); for(const s of this.stars){s.update();s.display();} for(const g of this.galaxies)g.display(); this.drawCentralStar(); pop(); }
  drawCentralStar(){ push(); noStroke(); blendMode(ADD); fill(255,210,80,80); sphere(25); fill(255,120,30,50); sphere(50); blendMode(BLEND); pop(); }
  drawPersonalGalaxy(){ push(); scale(2.4); rotateX(1.05); let time=frameCount*.0008; for(const h of this.centralHalo)h.display(15); for(const g of this.centralGases)g.display(15); for(const s of this.centralStars){s.update(time); s.display(15);} for(const c of this.centralClusters)c.display(15); this.drawGalacticCore(); this.drawSolarSystemCentral(); pop(); }
  drawGalacticCore(){ push(); noStroke(); blendMode(ADD); fill(255,190,90,160); sphere(35); fill(255,90,30,45); sphere(90); blendMode(BLEND); pop(); }
  drawSolarSystemCentral(){ push(); translate(this.solarPosCentral.x*15,this.solarPosCentral.y*15,this.solarPosCentral.z*15); noStroke(); fill(120,190,255,170); sphere(5); pop(); }
  drawSolarSystemGhost(){ push(); scale(2.2); rotateX(1.15); stroke(255,180,90,35); noFill(); for(let r=42;r<260;r+=36){ beginShape(); for(let a=0;a<TWO_PI+.02;a+=.06) vertex(cos(a)*r,sin(a)*r,0); endShape(); } pop(); }
}

// =========================
// SOL.TXT — red principal + red roja interna
// =========================
class SolScene{
  constructor(){
    this.NUM=620; this.points=[]; this.redPoints=[]; this.seed=[]; this.seedR=[]; this.CORE_R=224; this.FIELD_R=220; this.RED_R=250; this.rX=0; this.rY=0;
    for(let i=0;i<this.NUM;i++){ const theta=random(TWO_PI); const phi=acos(random(-1,1)); const v=createVector(sin(phi)*cos(theta),sin(phi)*sin(theta),cos(phi)); this.seed.push(v); this.seedR.push(createVector(sin(phi)*cos(theta+random(-.2,.2)),sin(phi)*sin(theta+random(-.2,.2)),cos(phi))); this.points.push(createVector()); this.redPoints.push(createVector()); }
  }
  draw(){ push(); this.drawStars(); rotateX(this.rX); rotateY(this.rY); this.rX+=.002; this.rY+=.003; const pulse=sin(frameCount*.03); const energy=map(pulse,-1,1,0,1); this.updatePoints(energy); this.updateRedPoints(energy); noStroke(); fill(125,60,0); sphereDetail(36); sphere(this.CORE_R); blendMode(ADD);
    for(let i=0;i<this.points.length;i++){ const a=this.points[i]; for(let j=i+1;j<min(i+28,this.points.length);j++){ const b=this.points[j]; const d=p5.Vector.dist(a,b); const threshold=18+energy*25; if(d<threshold){ const alpha=map(d,0,threshold,180,0); stroke(255,200+energy*55,80,alpha); strokeWeight(1.1); line(a.x,a.y,a.z,b.x,b.y,b.z); const mid=p5.Vector.add(a,b).mult(.5); if(mid.mag()>this.CORE_R){ let dir=mid.copy().normalize(); let spread=6+energy*10; let noiseDir=createVector(dir.x+random(-.4,.4),dir.y+random(-.4,.4),dir.z+random(-.4,.4)).normalize(); let end=p5.Vector.add(mid,p5.Vector.mult(noiseDir,spread)); stroke(255,255,200+energy*55,alpha*.4); strokeWeight(.8); line(mid.x,mid.y,mid.z,end.x,end.y,end.z); } } } }
    for(let i=0;i<this.redPoints.length;i++){ const a=this.redPoints[i]; for(let j=i+1;j<min(i+22,this.redPoints.length);j++){ const b=this.redPoints[j]; const d=p5.Vector.dist(a,b); const threshold=14+energy*18; if(d<threshold){ const alpha=map(d,0,threshold,140,0); stroke(255,80,60,alpha*.6); strokeWeight(.9); line(a.x,a.y,a.z,b.x,b.y,b.z); } } }
    for(const p of this.points){ const n=noise(p.x*.01,p.y*.01,p.z*.01+frameCount*.01); stroke(255,240,180,60); strokeWeight(map(n,0,1,1,1+energy*4)); point(p.x,p.y,p.z); }
    blendMode(BLEND); pop(); }
  updatePoints(energy){ for(let i=0;i<this.NUM;i++){ const s=this.seed[i]; const tt=frameCount*.01; const n=noise(s.x*2+tt,s.y*2+tt,s.z*2+tt); const off=this.FIELD_R+map(n,0,1,-20,20); const jitter=1.5+energy*2; this.points[i].set(s.x*off+random(-jitter,jitter),s.y*off+random(-jitter,jitter),s.z*off+random(-jitter,jitter)); } }
  updateRedPoints(energy){ for(let i=0;i<this.NUM;i++){ const s=this.seedR[i]; const tt=frameCount*.02; const n=noise(s.x*2+tt,s.y*2+tt,s.z*2+tt); const off=this.RED_R+map(n,0,1,-10,10); const jitter=1+energy*1.5; this.redPoints[i].set(s.x*off+random(-jitter,jitter),s.y*off+random(-jitter,jitter),s.z*off+random(-jitter,jitter)); } }
  drawStars(){ push(); blendMode(ADD); for(let i=0;i<60;i++){ stroke(255,random(20,120)); strokeWeight(1); point(random(-width,width),random(-height,height),random(-900,-200)); } blendMode(BLEND); pop(); }
}

// =========================
// TIERRA.PDE — planeta, nubes, pad/frases/zonas
// =========================
class EarthScene{
  constructor(){ this.radio=220; this.detalle=90; this.clouds=[]; this.zonas=['África','Asia','Europa','América','Oceanía','Polos','Sinaí','Mediterráneo','Selvas','Desiertos','Ríos','Ciudades']; this.frases=['la materia empieza a recordar','la tierra aparece como madre','cada zona emite música y archivo','del polvo nacen culturas','un planeta como interfaz sensible']; for(let i=0;i<120;i++){this.clouds.push({lat:random(-PI/2,PI/2),lon:random(-PI,PI),s:random(4,16),v:random(.001,.004)});} }
  draw(){ push(); rotateY(frameCount*.004); rotateX(-.12); this.dibujarPlaneta(); this.dibujarNubes(); this.dibujarPad(); pop(); this.dibujarInfo(); }
  colorTexture(u,v,isLand){ if(isLand){ let n=noise(u*12,v*8,frameCount*.002); return color(80+80*n,85+55*n,45+25*n); } let n=noise(u*8,v*8,2); return color(5+20*n,30+50*n,70+90*n); }
  landMask(lon,lat){ let u=(lon+PI)/TWO_PI, v=(lat+HALF_PI)/PI; let continental=noise(u*5.2,v*3.1) + .35*noise(u*15,v*9); return continental>.62 || abs(lat)>1.25; }
  dibujarPlaneta(){ ambientMaterial(180); specularMaterial(40); shininess(8); stroke(0,8); strokeWeight(.12); for(let i=0;i<this.detalle;i++){ let lat1=map(i,0,this.detalle,-HALF_PI,HALF_PI); let lat2=map(i+1,0,this.detalle,-HALF_PI,HALF_PI); beginShape(QUAD_STRIP); for(let j=0;j<=this.detalle;j++){ let lon=map(j,0,this.detalle,-PI,PI); let u=(lon+PI)/TWO_PI; let v1=(lat1+HALF_PI)/PI, v2=(lat2+HALF_PI)/PI; let land1=this.landMask(lon,lat1), land2=this.landMask(lon,lat2); let n1=noise(cos(lon)*3,sin(lat1)*3,frameCount*.002); let n2=noise(cos(lon)*3,sin(lat2)*3,frameCount*.002); let r1=this.radio-2+(land1?n1*5:0); let r2=this.radio-2+(land2?n2*5:0); fill(this.colorTexture(u,v1,land1)); vertex(r1*cos(lat1)*sin(lon),-r1*sin(lat1),r1*cos(lat1)*cos(lon)); fill(this.colorTexture(u,v2,land2)); vertex(r2*cos(lat2)*sin(lon),-r2*sin(lat2),r2*cos(lat2)*cos(lon)); } endShape(); } }
  dibujarNubes(){ blendMode(ADD); noStroke(); for(const c of this.clouds){ c.lon+=c.v; let r=this.radio+8; let x=r*cos(c.lat)*sin(c.lon), y=-r*sin(c.lat), z=r*cos(c.lat)*cos(c.lon); push(); translate(x,y,z); fill(255,255,255,28); sphere(c.s); pop(); } blendMode(BLEND); }
  dibujarPad(){ blendMode(ADD); for(let i=0;i<this.zonas.length;i++){ let lat=map(i,0,this.zonas.length-1,-1.0,1.0); let lon=i*GOLDEN_ANGLE+frameCount*.002; let r=this.radio+18; let p=createVector(r*cos(lat)*sin(lon),-r*sin(lat),r*cos(lat)*cos(lon)); stroke(255,190,70,130); strokeWeight(3); point(p.x,p.y,p.z); if(i>0){ let lat2=map(i-1,0,this.zonas.length-1,-1.0,1.0); let lon2=(i-1)*GOLDEN_ANGLE+frameCount*.002; let q=createVector(r*cos(lat2)*sin(lon2),-r*sin(lat2),r*cos(lat2)*cos(lon2)); stroke(255,120,80,45); strokeWeight(1); line(p.x,p.y,p.z,q.x,q.y,q.z); } } blendMode(BLEND); }
  dibujarInfo(){ resetMatrix(); camera(); noLights(); const z=this.zonas[floor((frameCount*.01)%this.zonas.length)]; const fr=this.frases[floor((frameCount*.006)%this.frases.length)]; push(); translate(-width/2+24,height/2-92,0); fill(255); textSize(16); textAlign(LEFT,BOTTOM); text('LAT : '+nf(sin(frameCount*.004)*62,1,2)+'\nLON : '+nf(((frameCount*.12)%360)-180,1,2)+'\nZONA: '+z+'\n“'+fr+'”',0,0); pop(); }
}
const GOLDEN_ANGLE = 2.399963229728653;

// =========================
// CONTROLES
// =========================
function keyPressed(){ if(key>='1'&&key<='5') targetScene=int(key)-1; if(keyCode===DOWN_ARROW||key===' ') targetScene=constrain(targetScene+1,0,4); if(keyCode===UP_ARROW) targetScene=constrain(targetScene-1,0,4); if(key==='s'||key==='S') saveCanvas('LA_MADRE_captura','png'); }
function mouseWheel(e){ targetScene=constrain(targetScene + (e.delta>0?1:-1),0,4); return false; }
function mousePressed(){ dragging=true; lastMX=mouseX; lastMY=mouseY; }
function mouseReleased(){ dragging=false; }
function mouseDragged(){ if(dragging){ rotY += (mouseX-lastMX)*.01; rotX += (mouseY-lastMY)*.01; rotX=constrain(rotX,-HALF_PI,HALF_PI); lastMX=mouseX; lastMY=mouseY; } }
function windowResized(){ resizeCanvas(windowWidth,windowHeight); }
