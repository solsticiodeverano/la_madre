function randPointSphere(r){
  const a=random(TWO_PI), z=random(-1,1), s=sqrt(1-z*z);
  return createVector(cos(a)*s*r, sin(a)*s*r, z*r);
}
function softStep(a,b,x){x=constrain((x-a)/(b-a),0,1);return x*x*(3-2*x)}
function glowPoint(x,y,z,s,r,g,b,a){
  noStroke(); push(); translate(x,y,z);
  fill(r,g,b,a*.10); sphere(s*3);
  fill(r,g,b,a*.35); sphere(s*1.55);
  fill(r,g,b,a); sphere(s*.55);
  pop();
}
function screenText(t){ document.getElementById('stageText').innerText=t; }
