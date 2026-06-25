// Polvo cósmico: nube de partículas distribuidas en una esfera 3D.
class CosmicDust{
  constructor(n, r){
    this.p = [];
    this.seed = [];
    this.bright = [];
    this.size = [];

    // Crea n partículas con posición, brillo y tamaño propios.
    for(let i = 0; i < n; i++){
      this.p.push(randPointSphere(random(r * .12, r)));
      this.seed.push(random(9999));
      this.bright.push(random(.45, 1.2));
      this.size.push(random(.45, 1.7));
    }
  }

  draw(t, spread = 1){
    // Suma luz entre partículas para efecto estelar.
    blendMode(ADD);

    for(let i = 0; i < this.p.length; i++){
      const p = this.p[i];

      // Noise genera variación orgánica en brillo/tamaño.
      const n = noise(
        p.x * .004 + t * .08,
        p.y * .004,
        p.z * .004
      );

      // Parpadeo suave con seno.
      const blink = map(
        sin(t * 5.5 + this.seed[i]),
        -1, 1,
        .55, 1.35
      );

      // Pulso mínimo de expansión/contracción.
      const k = 1 + sin(t * 1.5 + this.seed[i]) * .006;

      const x = p.x * k * spread;
      const y = p.y * k * spread;
      const z = p.z * k * spread;

      const alpha = constrain((55 + 150 * n) * blink * this.bright[i], 15, 230);
      const s = this.size[i] * map(n, 0, 1, .55, 1.35);

      // Halo azul externo.
      stroke(70, 140, 255, alpha * .18);
      strokeWeight(s * 2.2);
      point(x, y, z);

      // Núcleo luminoso.
      stroke(185, 225, 255, alpha);
      strokeWeight(s);
      point(x, y, z);

      // Destellos en partículas más brillantes.
      if(n > .88 && this.bright[i] > 1.0){
        const ray = s * 3.5;
        stroke(160, 220, 255, alpha * .35);
        strokeWeight(.45);
        line(x - ray, y, z, x + ray, y, z);
        line(x, y - ray, z, x, y + ray, z);
      }
    }

    // Vuelve al modo normal de mezcla.
    blendMode(BLEND);
  }
}