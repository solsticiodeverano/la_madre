class CosmicDust{
  constructor(n,r){this.p=[];this.seed=[];for(let i=0;i<n;i++){this.p.push(randPointSphere(random(r*.15,r)));this.seed.push(random(9999));}}
  draw(t,spread=1){blendMode(ADD); noStroke();
    for(let i=0;i<this.p.length;i++){let p=this.p[i]; let n=noise(p.x*.006+t,p.y*.006,p.z*.006); let k=1+sin(t*2+this.seed[i])*0.02; fill(255,210+45*n,120+80*n,40+80*n); push(); translate(p.x*k*spread,p.y*k*spread,p.z*k*spread); sphere(map(n,0,1,.8,2.8)); pop();}
    blendMode(BLEND);
  }
}

// Se conserva para próximas integraciones, pero YA NO se dibuja encima del sistema solar.
class NetworkSun{
  constructor(n=360){this.a=[];this.b=[];for(let i=0;i<n;i++){this.a.push(randPointSphere(220));this.b.push(randPointSphere(252));}}
  draw(t){push(); rotateY(t*.22); rotateX(t*.13); noStroke(); ambientMaterial(125,55,8); sphere(130+sin(t*2)*9);
    blendMode(ADD); strokeWeight(1);
    for(let i=0;i<this.a.length;i++){let p=this.a[i].copy(); let n=noise(p.x*.01+t,p.y*.01,p.z*.01); p.setMag(185+n*60); glowPoint(p.x,p.y,p.z,2,255,210,80,110); if(i%3==0){for(let j=i+1;j<min(i+14,this.a.length);j++){let q=this.a[j].copy();q.setMag(185+noise(q.x*.01+t,q.y*.01,q.z*.01)*60); let d=p.dist(q); if(d<55){stroke(255,190,70,map(d,0,55,120,0)); line(p.x,p.y,p.z,q.x,q.y,q.z);}}}}
    for(let i=0;i<this.b.length;i+=2){let p=this.b[i].copy();p.setMag(225+20*sin(t*3+i)); stroke(255,55,45,55); point(p.x,p.y,p.z)} blendMode(BLEND); pop();
  }
}

// =====================================================
// SISTEMA SOLAR — port fiel de alexClase2v2.pde
// Reemplaza al sol grande: sol en espiral + órbitas elípticas + trails.
// Optimizado para web: trails más cortos y estrellas precomputadas.
// =====================================================
class SpiralSystem{
  constructor(){
    this.t = 0;
    this.sunSize = 90;
    this.a = [120, 175, 245, 320, 445, 585, 725, 860];
    this.b = [100, 150, 225, 285, 410, 535, 675, 810];
    this.sizes = [0.03, 0.07, 0.08, 0.04, 0.22, 0.18, 0.12, 0.11];
    this.speeds = [4.0, 3.2, 2.4, 1.9, 1.2, 0.9, 0.6, 0.4];
    this.cols = [
      [180,180,180],
      [255,180,80],
      [0,120,255],
      [255,80,50],
      [255,200,120],
      [255,220,160],
      [120,220,255],
      [80,120,255]
    ];
    this.trailSol = [];
    this.planetTrails = Array.from({length:8},()=>[]);
    this.maxSunTrail = 420;
    this.maxPlanetTrail = 260;
    this.stars = [];
    randomSeed(2);
    for(let i=0;i<800;i++){
      this.stars.push({
        x:random(-3600,3600), y:random(-2600,2600), z:random(-3600,3600),
        a:random(35,220), w:random(1,2.4)
      });
    }
    randomSeed();
  }

  draw(externalT, focusEarth=0){
    this.t += min(deltaTime || 16.6, 33) * 0.00055;
    const tt = this.t;
    focusEarth = constrain(focusEarth,0,1);

    push();
    scale(0.62);
    rotateX(0.43);
    rotateY(externalT*0.05);

    this.drawStars();

    // SOL ESPIRAL: misma lógica del PDE, pero centrada para web.
    const sunX = cos(tt) * 120;
    const sunZ = sin(tt) * 120;
    const sunY = -tt * 95;

    // Cámara narrativa: al principio sigue el sol como en el PDE.
    // En el final del tramo, el centro del zoom deja de ser el sol
    // y pasa a ser la Tierra real orbitando alrededor del sol.
    const earth = this.planetPosition(2, sunX, sunY, sunZ, tt);
    const targetX = lerp(sunX, earth.x, focusEarth);
    const targetY = lerp(sunY, earth.y, focusEarth);
    const targetZ = lerp(sunZ, earth.z, focusEarth);
    translate(-targetX, -targetY, -targetZ);

    // Acercamiento progresivo hacia la Tierra: no nace del sol,
    // la cámara viaja hasta el planeta azul que ya estaba orbitando.
    const zoomToEarth = lerp(1.0, 4.2, focusEarth);
    scale(zoomToEarth);

    this.trailSol.push(createVector(sunX,sunY,sunZ));
    if(this.trailSol.length > this.maxSunTrail) this.trailSol.shift();
    this.drawTrailSimple(this.trailSol, [255,200,80], 4.2);

    // SOL: ya no es el sol-red enorme. Es el sol claro del sistema solar de clase.
    push();
    translate(sunX,sunY,sunZ);
    rotateY(tt*2);
    noStroke();
    fill(255,180,0,240);
    sphere(this.sunSize, 28, 18);
    // pequeño halo sin ocupar toda la escena
    blendMode(ADD);
    fill(255,130,20,35); sphere(this.sunSize*1.45, 20, 12);
    fill(255,220,90,20); sphere(this.sunSize*2.1, 18, 10);
    blendMode(BLEND);
    pop();

    for(let i=0;i<8;i++) this.drawPlanet(i, sunX, sunY, sunZ, tt);
    pop();
  }

  planetPosition(i, sunX, sunY, sunZ, tt){
    const angle = tt * this.speeds[i];
    const x = cos(angle) * this.a[i];
    const z = sin(angle) * this.b[i];
    const y = sin(angle*2+i) * 15;
    return createVector(sunX+x, sunY+y, sunZ+z);
  }

  drawPlanet(i, sunX, sunY, sunZ, tt){
    const pos = this.planetPosition(i, sunX, sunY, sunZ, tt);
    const px = pos.x, py = pos.y, pz = pos.z;

    this.planetTrails[i].push(createVector(px,py,pz));
    if(this.planetTrails[i].length > this.maxPlanetTrail) this.planetTrails[i].shift();
    this.drawPlanetTrail(i);

    push();
    translate(px,py,pz);
    rotateY(frameCount*0.02);
    noStroke();
    const c=this.cols[i];
    fill(c[0],c[1],c[2],235);
    const pr = max(3.5,this.sunSize*this.sizes[i]);
    sphere(pr, 18, 12);
    if(i===2){
      blendMode(ADD);
      fill(80,180,255,38); sphere(pr*2.8,14,8);
      blendMode(BLEND);
    }
    if(i===5 || i===6 || i===7) this.drawRing(max(3.5,this.sunSize*this.sizes[i]));
    pop();
  }

  drawRing(r){
    push();
    rotateX(radians(70));
    noFill();
    stroke(210,210,210,120);
    strokeWeight(1.5);
    ellipse(0,0,r*5,r*2.5);
    ellipse(0,0,r*6.5,r*3.2);
    pop();
  }

  drawPlanetTrail(i){
    const tr=this.planetTrails[i];
    const c=this.cols[i];
    for(let j=max(1,tr.length-this.maxPlanetTrail);j<tr.length;j++){
      const p1=tr[j-1], p2=tr[j];
      const amt=j/tr.length;
      stroke(
        lerp(255,c[0],amt),
        lerp(255,c[1],amt),
        lerp(255,c[2],amt),
        map(j,0,tr.length,12,210)
      );
      strokeWeight(1.15);
      line(p1.x,p1.y,p1.z,p2.x,p2.y,p2.z);
    }
  }

  drawTrailSimple(tr,c,w){
    for(let i=1;i<tr.length;i++){
      const p1=tr[i-1], p2=tr[i];
      stroke(c[0],c[1],c[2],map(i,0,tr.length,0,210));
      strokeWeight(w);
      line(p1.x,p1.y,p1.z,p2.x,p2.y,p2.z);
    }
  }

  drawStars(){
    push();
    blendMode(ADD);
    for(const s of this.stars){
      stroke(255,s.a);
      strokeWeight(s.w);
      point(s.x,s.y,s.z);
    }
    blendMode(BLEND);
    pop();
  }
}

class EarthCultures{
  constructor(){this.nodes=[]; let names=['África','Asia','Europa','América','Oceanía','Polos','Mediterráneo','Sinaí','Ríos','Selvas','Desiertos','Ciudades']; for(let i=0;i<names.length;i++){let p=randPointSphere(154); this.nodes.push({p,name:names[i]});}}
  draw(t){push(); rotateY(t*.12); rotateX(-.25+sin(t*.5)*.08); noStroke(); fill(20,55,85); sphere(150); blendMode(ADD); fill(35,180,120,70); sphere(153); fill(255,255,255,15); sphere(164);
    strokeWeight(1.4); for(let i=0;i<this.nodes.length;i++){let a=this.nodes[i].p; glowPoint(a.x,a.y,a.z,4,255,205,95,190); for(let j=i+1;j<this.nodes.length;j++){let b=this.nodes[j].p; if(a.dist(b)<210){stroke(255,170,80,70); line(a.x,a.y,a.z,b.x,b.y,b.z)}}}
    blendMode(BLEND); pop();
  }
}
