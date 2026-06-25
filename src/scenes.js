class CosmicDust{
  constructor(n,r){this.p=[];this.seed=[];for(let i=0;i<n;i++){this.p.push(randPointSphere(random(r*.15,r)));this.seed.push(random(9999));}}
  draw(t,spread=1){blendMode(ADD); noStroke();
    for(let i=0;i<this.p.length;i++){let p=this.p[i]; let n=noise(p.x*.006+t,p.y*.006,p.z*.006); let k=1+sin(t*2+this.seed[i])*0.02; fill(255,210+45*n,120+80*n,40+80*n); push(); translate(p.x*k*spread,p.y*k*spread,p.z*k*spread); sphere(map(n,0,1,.8,2.8)); pop();}
    blendMode(BLEND);
  }
}
class NetworkSun{
  constructor(n=360){this.a=[];this.b=[];for(let i=0;i<n;i++){this.a.push(randPointSphere(220));this.b.push(randPointSphere(252));}}
  draw(t){push(); rotateY(t*.22); rotateX(t*.13); noStroke(); ambientMaterial(125,55,8); sphere(130+sin(t*2)*9);
    blendMode(ADD); strokeWeight(1);
    for(let i=0;i<this.a.length;i++){let p=this.a[i].copy(); let n=noise(p.x*.01+t,p.y*.01,p.z*.01); p.setMag(185+n*60); glowPoint(p.x,p.y,p.z,2,255,210,80,110); if(i%3==0){for(let j=i+1;j<min(i+14,this.a.length);j++){let q=this.a[j].copy();q.setMag(185+noise(q.x*.01+t,q.y*.01,q.z*.01)*60); let d=p.dist(q); if(d<55){stroke(255,190,70,map(d,0,55,120,0)); line(p.x,p.y,p.z,q.x,q.y,q.z);}}}}
    for(let i=0;i<this.b.length;i+=2){let p=this.b[i].copy();p.setMag(225+20*sin(t*3+i)); stroke(255,55,45,55); point(p.x,p.y,p.z)} blendMode(BLEND); pop();
  }
}
class SpiralSystem{
  constructor(){this.planets=[];for(let i=0;i<7;i++)this.planets.push({r:70+i*42,s:random(.15,.6),z:random(-25,25),sz:5+i*1.8,c:[random(80,255),random(90,210),random(120,255)]});}
  draw(t){push(); rotateX(1.12); blendMode(ADD); stroke(255,180,90,45); noFill(); for(let r=60;r<370;r+=42){beginShape(); for(let a=0;a<TWO_PI;a+=.06) vertex(cos(a)*r,sin(a)*r,0); endShape();}
    for(let p of this.planets){let a=t*p.s+p.r*.013; push(); translate(cos(a)*p.r,sin(a)*p.r,p.z); noStroke(); fill(...p.c,210); sphere(p.sz); pop();}
    blendMode(BLEND); pop();
  }
}
class EarthCultures{
  constructor(){this.nodes=[]; let names=['África','Asia','Europa','América','Oceanía','Polos','Mediterráneo','Sinaí','Ríos','Selvas','Desiertos','Ciudades']; for(let i=0;i<names.length;i++){let p=randPointSphere(154); this.nodes.push({p,name:names[i]});}}
  draw(t){push(); rotateY(t*.12); rotateX(-.25+sin(t*.5)*.08); noStroke(); fill(20,55,85); sphere(150); blendMode(ADD); fill(35,180,120,70); sphere(153); fill(255,255,255,15); sphere(164);
    strokeWeight(1.4); for(let i=0;i<this.nodes.length;i++){let a=this.nodes[i].p; glowPoint(a.x,a.y,a.z,4,255,205,95,190); for(let j=i+1;j<this.nodes.length;j++){let b=this.nodes[j].p; if(a.dist(b)<210){stroke(255,170,80,70); line(a.x,a.y,a.z,b.x,b.y,b.z)}}}
    blendMode(BLEND); pop();
  }
}
