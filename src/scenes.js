// Clase conservada para futuras integraciones.
// Actualmente no se dibuja encima del sistema solar principal.
class NetworkSun{

  // Crea dos redes de puntos alrededor de una esfera:
  // una interna dorada y otra externa rojiza.
  constructor(n = 360){
    this.a = [];
    this.b = [];

    for(let i = 0; i < n; i++){
      this.a.push(randPointSphere(220));
      this.b.push(randPointSphere(252));
    }
  }

  draw(t){
    push();

    // Rotación lenta del sol/red.
    rotateY(t * .22);
    rotateX(t * .13);

    // Núcleo solar pulsante.
    noStroke();
    ambientMaterial(125, 55, 8);
    sphere(130 + sin(t * 2) * 9);

    // Modo aditivo para sumar luz.
    blendMode(ADD);
    strokeWeight(1);

    // Red principal dorada.
    for(let i = 0; i < this.a.length; i++){
      let p = this.a[i].copy();

      // Noise modifica el radio para generar superficie orgánica.
      let n = noise(p.x * .01 + t, p.y * .01, p.z * .01);
      p.setMag(185 + n * 60);

      // Punto luminoso.
      glowPoint(p.x, p.y, p.z, 2, 255, 210, 80, 110);

      // Conecta algunos puntos cercanos.
      if(i % 3 == 0){
        for(let j = i + 1; j < min(i + 14, this.a.length); j++){
          let q = this.a[j].copy();
          q.setMag(185 + noise(q.x * .01 + t, q.y * .01, q.z * .01) * 60);

          let d = p.dist(q);

          if(d < 55){
            stroke(255, 190, 70, map(d, 0, 55, 120, 0));
            line(p.x, p.y, p.z, q.x, q.y, q.z);
          }
        }
      }
    }

    // Segunda capa: puntos rojos externos.
    for(let i = 0; i < this.b.length; i += 2){
      let p = this.b[i].copy();
      p.setMag(225 + 20 * sin(t * 3 + i));

      stroke(255, 55, 45, 55);
      point(p.x, p.y, p.z);
    }

    // Vuelve al modo de mezcla normal.
    blendMode(BLEND);
    pop();
  }
}


// Tierra alternativa/simple.
// Funciona como fallback si no carga InstrumentEarth.
class EarthCultures{

  // Genera nodos culturales distribuidos sobre una esfera.
  constructor(){
    this.nodes = [];

    let names = [
      'África',
      'Asia',
      'Europa',
      'América',
      'Oceanía',
      'Polos',
      'Mediterráneo',
      'Sinaí',
      'Ríos',
      'Selvas',
      'Desiertos',
      'Ciudades'
    ];

    for(let i = 0; i < names.length; i++){
      let p = randPointSphere(154);
      this.nodes.push({
        p,
        name: names[i]
      });
    }
  }

  draw(t){
    push();

    // Rotación lenta del planeta.
    rotateY(t * .12);
    rotateX(-.25 + sin(t * .5) * .08);

    // Esfera base de la Tierra.
    noStroke();
    fill(20, 55, 85);
    sphere(150);

    // Capas atmosféricas / luminosas.
    blendMode(ADD);
    fill(35, 180, 120, 70);
    sphere(153);

    fill(255, 255, 255, 15);
    sphere(164);

    // Dibuja nodos y conexiones culturales.
    strokeWeight(1.4);

    for(let i = 0; i < this.nodes.length; i++){
      let a = this.nodes[i].p;

      // Nodo luminoso.
      glowPoint(a.x, a.y, a.z, 4, 255, 205, 95, 190);

      // Conecta nodos cercanos.
      for(let j = i + 1; j < this.nodes.length; j++){
        let b = this.nodes[j].p;

        if(a.dist(b) < 210){
          stroke(255, 170, 80, 70);
          line(a.x, a.y, a.z, b.x, b.y, b.z);
        }
      }
    }

    blendMode(BLEND);
    pop();
  }
}