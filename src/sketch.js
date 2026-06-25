let dust, sun, system, earth, earthAssets;
let travel=0, targetTravel=0, rx=-0.18, ry=0.2, dragging=false, px=0, py=0;
const labels=[
  'Pre Big Bang: una red oscura de partículas concentra energía antes de explotar.',
  'Universo: la materia se enfría y aparecen galaxias, filamentos y polvo.',
  'Galaxia: el viaje entra en una espiral luminosa, como una memoria cósmica.',
  'Sistema solar: la Tierra orbita alrededor del sol y la cámara empieza a buscarla.',
  'Tierra / La Madre: entramos al planeta; nacen zonas, rutas, culturas y relatos.'
];
function preload(){
  // Guard anti-pantalla Loading: si earth_world.js no cargó, no rompe toda la obra.
  if (typeof preloadEarthAssets === 'function') {
    earthAssets = preloadEarthAssets();
  } else {
    console.error('No cargó earth_world.js: revisá que esté en la misma carpeta que index.html');
    earthAssets = {};
  }
}

function setup(){
  const c=createCanvas(windowWidth,windowHeight,WEBGL); 
  c.parent('app'); 
  pixelDensity(1); 
  smooth();
  textFont('Arial');

  dust=new CosmicDust(900,760); 
  sun=new NetworkSun(220); 
  system=new SpiralSystem();
  earth = (typeof InstrumentEarth === 'function') ? new InstrumentEarth(earthAssets) : new EarthCultures();
}
function draw(){
  background(1,1,8);

  const t = millis() / 1000;
  travel = lerp(travel, targetTravel, .055);

  document.getElementById('progress').style.width = (travel * 100).toFixed(1) + '%';

  const stage = floor(constrain(travel * 5, 0, 4.999));

  if(!(earth && stage === 4)){
    screenText(labels[stage]);
  }

  orbitControlLight();

  rotateX(rx);
  rotateY(ry);

  const z = map(travel, 0, 1, 900, -120);
  scale(map(travel, 0, 1, .55, 1.25));

  push();
  translate(0, 0, z);
  drawStarfield(t);
  pop();

  const a0 = 1 - softStep(.12, .22, travel);
  if(a0 > .04){
    push();
    scale(1 + travel * 5);
    dust.draw(t, 1 + travel * 7);
    pop();
  }

  const a1 = softStep(.14, .26, travel) * (1 - softStep(.42, .52, travel));
  if(a1 > .04){
    push();
    scale(map(travel, .12, .56, 1.8, .8));
    dust.draw(t, .85);
    drawGalaxies(t, a1);
    pop();
  }

  const a2 = softStep(.40, .52, travel) * (1 - softStep(.66, .76, travel));
  if(a2 > .04){
    push();
    scale(map(travel, .40, .76, 1.5, .75));
    drawMilkyWay(t, a2);
    pop();
  }

  const a3 = softStep(.62, .72, travel) * (1 - softStep(.84, .90, travel));
  if(a3 > .04){
    const focusEarth = softStep(.74, .88, travel);
    push();
    system.draw(t, focusEarth);
    pop();
  }

  const a4 = softStep(.86, .94, travel);
  if(a4 > .04){
    push();
    scale(map(a4, 0, 1, .35, 1.65));
    earth.draw(t, a4);
    pop();
  }
}
function orbitControlLight(){ ambientLight(18); directionalLight(255,230,190,-.4,.25,-1); directionalLight(40,80,160,.8,-.3,.5); }
function drawStarfield(t){blendMode(ADD); for(let i=0;i<180;i++){let a=noise(i,1)*TWO_PI*9; let r=noise(i,2)*1200; let z=noise(i,3)*-1200; push(); translate(cos(a)*r,sin(a)*r,z); noStroke(); fill(255,random(20,90)); sphere(random(.4,1.4)); pop();} blendMode(BLEND);}
function drawGalaxies(t,a){blendMode(ADD); noFill(); for(let g=0;g<28;g++){push(); rotateZ(noise(g)*TWO_PI+t*.02); translate((noise(g,1)-.5)*950,(noise(g,2)-.5)*680,(noise(g,3)-.5)*500); stroke(120,180,255,55*a); beginShape(); for(let i=0;i<160;i++){let ang=i*.18; let r=i*.9; vertex(cos(ang)*r,sin(ang)*r,sin(i*.09+t)*18);} endShape(); pop();} blendMode(BLEND);}
function drawMilkyWay(t,a){blendMode(ADD); rotateX(1.08); for(let arm=0;arm<4;arm++){stroke(255,210,150,45*a); noFill(); beginShape(); for(let i=0;i<430;i++){let ang=i*.045+arm*HALF_PI+t*.045; let r=8+i*.85; vertex(cos(ang)*r,sin(ang)*r,sin(i*.05+t)*22);} endShape();} fill(255,220,120,150*a); noStroke(); sphere(22); blendMode(BLEND);}
function tintAlpha(a){}
function mouseWheel(e){targetTravel=constrain(targetTravel+e.delta*.00045,0,1); return false;}

function keyPressed(){
  if(key>='1'&&key<='5') targetTravel=(int(key)-1)/4;
  if(keyCode===DOWN_ARROW) targetTravel=constrain(targetTravel+.08,0,1);
  if(keyCode===UP_ARROW) targetTravel=constrain(targetTravel-.08,0,1);
  if(key==='s'||key==='S') saveCanvas('LA_MADRE_captura','png');
  if(earth) earth.handleKey(key);
}

function mousePressed(){
  if(earth){
    earth.handleClick();
  }
}

function mouseReleased(){
  dragging = false;
}

function mouseDragged(){
  if(earth){
    earth.handleDrag(mouseX - pmouseX, mouseY - pmouseY);
  }
}

function windowResized(){resizeCanvas(windowWidth,windowHeight)}
