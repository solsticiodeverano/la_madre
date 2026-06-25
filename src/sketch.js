let dust, sun, system, earth;
let travel=0, targetTravel=0, rx=-0.18, ry=0.2, dragging=false, px=0, py=0;
const labels=[
  'Pre Big Bang: una red oscura de partículas concentra energía antes de explotar.',
  'Universo: la materia se enfría y aparecen galaxias, filamentos y polvo.',
  'Galaxia: el viaje entra en una espiral luminosa, como una memoria cósmica.',
  'Sistema solar / Sol: órbitas, pulsos y una red solar viva.',
  'Tierra: el planeta aparece como madre material; nacen zonas, rutas, culturas y relatos.'
];
function setup(){
  const c=createCanvas(windowWidth,windowHeight,WEBGL); c.parent('app'); pixelDensity(1); smooth();
  dust=new CosmicDust(900,760); sun=new NetworkSun(220); system=new SpiralSystem(); earth=new EarthCultures();
}
function draw(){
  background(1,1,8); let t=millis()/1000; travel=lerp(travel,targetTravel,.045);
  document.getElementById('progress').style.width=(travel*100).toFixed(1)+'%';
  let stage=floor(constrain(travel*5,0,4.999)); screenText(labels[stage]);
  orbitControlLight(); rotateX(rx); rotateY(ry+t*.025);
  let z=map(travel,0,1,900,-120); scale(map(travel,0,1,.55,1.25));
  push(); translate(0,0,z); drawStarfield(t); pop();
  let a0=1-softStep(.14,.28,travel); if(a0>0){push(); scale(1+travel*5); tintAlpha(a0); dust.draw(t,1+travel*7); pop();}
  let a1=softStep(.12,.32,travel)*(1-softStep(.48,.60,travel)); if(a1>0){push(); scale(map(travel,.12,.60,1.8,.8)); dust.draw(t,.85); drawGalaxies(t,a1); pop();}
  let a2=softStep(.42,.60,travel)*(1-softStep(.70,.82,travel)); if(a2>0){push(); scale(map(travel,.42,.82,1.5,.75)); drawMilkyWay(t,a2); pop();}
  let a3=softStep(.62,.78,travel)*(1-softStep(.86,.94,travel)); if(a3>0){push(); system.draw(t); pop();}
  let a4=softStep(.82,.96,travel); if(a4>0){push(); scale(map(a4,0,1,.25,1.65)); earth.draw(t); pop();}
}
function orbitControlLight(){ ambientLight(18); directionalLight(255,230,190,-.4,.25,-1); directionalLight(40,80,160,.8,-.3,.5); }
function drawStarfield(t){blendMode(ADD); for(let i=0;i<180;i++){let a=noise(i,1)*TWO_PI*9; let r=noise(i,2)*1200; let z=noise(i,3)*-1200; push(); translate(cos(a)*r,sin(a)*r,z); noStroke(); fill(255,random(20,90)); sphere(random(.4,1.4)); pop();} blendMode(BLEND);}
function drawGalaxies(t,a){blendMode(ADD); noFill(); for(let g=0;g<28;g++){push(); rotateZ(noise(g)*TWO_PI+t*.02); translate((noise(g,1)-.5)*950,(noise(g,2)-.5)*680,(noise(g,3)-.5)*500); stroke(120,180,255,55*a); beginShape(); for(let i=0;i<160;i++){let ang=i*.18; let r=i*.9; vertex(cos(ang)*r,sin(ang)*r,sin(i*.09+t)*18);} endShape(); pop();} blendMode(BLEND);}
function drawMilkyWay(t,a){blendMode(ADD); rotateX(1.08); for(let arm=0;arm<4;arm++){stroke(255,210,150,45*a); noFill(); beginShape(); for(let i=0;i<430;i++){let ang=i*.045+arm*HALF_PI+t*.045; let r=8+i*.85; vertex(cos(ang)*r,sin(ang)*r,sin(i*.05+t)*22);} endShape();} fill(255,220,120,150*a); noStroke(); sphere(22); blendMode(BLEND);}
function tintAlpha(a){}
function mouseWheel(e){targetTravel=constrain(targetTravel+e.delta*.00045,0,1); return false;}
function keyPressed(){if(key>='1'&&key<='5')targetTravel=(int(key)-1)/4; if(keyCode===DOWN_ARROW)targetTravel=constrain(targetTravel+.08,0,1); if(keyCode===UP_ARROW)targetTravel=constrain(targetTravel-.08,0,1); if(key==='s'||key==='S')saveCanvas('LA_MADRE_captura','png');}
function mousePressed(){dragging=true; px=mouseX; py=mouseY;} function mouseReleased(){dragging=false;} function mouseDragged(){if(dragging){ry+=(mouseX-px)*.006; rx+=(mouseY-py)*.006; px=mouseX; py=mouseY;}}
function windowResized(){resizeCanvas(windowWidth,windowHeight)}
