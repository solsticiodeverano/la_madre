// ============================================================
// LA MADRE — Trabajo Final Diseño Digital
// MAE UNTREF 2026
// Alejo Fraile
//
// Este archivo organiza la obra completa:
// - crea el lienzo 3D
// - inicializa las escenas
// - administra el recorrido temporal entre etapas
// - dibuja el universo, galaxia, sistema solar y Tierra
// - recibe interacción por teclado, mouse y scroll
// ============================================================



// ============================================================
// VARIABLES GLOBALES DE ESCENA
// ============================================================

// Objetos principales de cada etapa del recorrido
let preBigBang, dust, sun, system, earth, earthAssets;

// Variables de navegación general
// travel: posición actual del recorrido (0 a 1)
// targetTravel: destino hacia el que se interpola travel
let travel = 0;
let targetTravel = 0;

// Rotación general de la cámara/escena
let rx = -0.18;
let ry = 0.2;

// Variables auxiliares de drag
let dragging = false;
let px = 0;
let py = 0;



// ============================================================
// TEXTOS / FRASES POR ETAPA
// ============================================================
// En lugar de una sola etiqueta por escena, cada etapa tiene
// varias frases. Se puede mostrar una u otra según el tiempo
// para darle un tono más mítico, poético y cosmogónico.
//
// Etapas:
// 0 = Pre Big Bang / Kaos
// 1 = Universo / expansión
// 2 = Galaxia
// 3 = Sistema solar
// 4 = Tierra / La Madre
// ============================================================

const labels = [
  [
    'MESOPOTAMIA · Enūma Eliš — “Cuando en lo alto el cielo aún no había sido nombrado, y abajo la tierra firme no había sido llamada por su nombre.”',
    'GRECIA · Hesíodo, Teogonía — “En primer lugar existió el Caos.”',
    'INDIA · Rig Veda 10.129 — “Entonces no existía ni el no-ser ni el ser.”',
    'EGIPTO · cosmogonía heliopolitana — Atum emerge de las aguas primordiales del Nun.'
  ],
  [
    'Rig Veda 10.129 — “La oscuridad estaba oculta por la oscuridad al comienzo; todo esto era agua indiferenciada.”',
    'MESOPOTAMIA · Enūma Eliš — Apsû y Tiamat mezclaban sus aguas como un solo cuerpo.',
    'CHINA · Huainanzi — “El Dao comenzó en la vacuidad y de la vacuidad nació el universo.”',
    'COSMOLOGÍA — En los primeros minutos del universo se formaron hidrógeno y helio.'
  ],
  [
    'MAYA K’ICHE’ · Popol Vuh — “Fue medida la faz de la tierra. Fueron fijados sus cuatro rincones, sus cuatro lados.”',
    'ISLAM · Corán 37:6 — “Hemos adornado el cielo más próximo con el adorno de las estrellas.”',
    'GRECIA — la Vía Láctea como río celeste; astronomía moderna: una galaxia espiral barrada.',
    'ASTRONOMÍA — La Vía Láctea contiene cientos de miles de millones de estrellas.'
  ],
  [
    'POESÍA VÉDICA — “El Cielo es mi Padre… Mi Madre es la gran Tierra.”',
    'MESOPOTAMIA · Ur — el cielo y los ciclos planetarios ordenan calendario, siembra y rito.',
    'ASTRONOMÍA — La Tierra orbita alrededor del Sol a una distancia media de 149,6 millones de km.',
    'SISTEMA SOLAR — gravedad, rotación, estaciones y mareas organizan la vida terrestre.'
  ],
  [
    'ATHARVA VEDA 12.1 — “La Tierra es mi madre y yo soy su hijo.”',
    'ENHEDUANNA / INANNA — “Poderosa de cielo y tierra, tú eres su Inanna.”',
    'ANDES · Pachamama — la tierra como matriz, alimento y territorio vivo.',
    'TIERRA — corteza, agua, atmósfera, memoria geológica y culturas humanas.'
  ]
];


// ============================================================
// PRELOAD
// ============================================================
// Se ejecuta antes de setup().
// Acá se cargan assets necesarios para la escena Tierra.
// Si por algún motivo earth_world.js no cargó bien, se evita
// que toda la obra se rompa y se usa un objeto vacío.
// ============================================================

function preload() {
  if (typeof preloadEarthAssets === 'function') {
    earthAssets = preloadEarthAssets();
  } else {
    console.error('No cargó earth_world.js: revisá que esté en la misma carpeta que index.html');
    earthAssets = {};
  }
}



// ============================================================
// SETUP
// ============================================================
// Se ejecuta una sola vez al iniciar la obra.
// - crea el canvas en WEBGL
// - lo monta dentro del div #app
// - configura suavizado y tipografía
// - instancia las clases de cada escena
// ============================================================

function setup() {
  const c = createCanvas(windowWidth, windowHeight, WEBGL);
  c.parent('app');

  pixelDensity(1);
  smooth();
  textFont('Arial');

  // Escena 0: red previa al Big Bang
  preBigBang = new PreBigBang(260);

  // Escena 1: polvo cósmico / universo temprano
  dust = new CosmicDust(900, 760);

  // Sol de red (queda disponible si se quiere reutilizar)
  sun = new NetworkSun(220);

  // Escena 3: sistema solar
  system = new SpiralSystem();

  // Escena 4: Tierra interactiva
  earth = (typeof InstrumentEarth === 'function')
    ? new InstrumentEarth(earthAssets)
    : new EarthCultures();
}



// ============================================================
// DRAW
// ============================================================
// Se ejecuta en loop. Es el corazón de la obra.
//
// Acá ocurre:
// 1. el avance temporal del recorrido
// 2. la actualización de la barra de progreso
// 3. la selección de la etapa actual
// 4. el dibujo progresivo de cada escena con fundidos
// ============================================================

function draw() {
  background(1, 1, 8);

  // Tiempo en segundos desde que arrancó la obra
  const t = millis() / 1000;

  // Interpolación suave del recorrido.
  // travel se acerca de a poco a targetTravel para que la navegación
  // no sea brusca sino cinematográfica.
  travel = lerp(travel, targetTravel, 0.055);

  // Actualiza barra de progreso HTML
  document.getElementById('progress').style.width =
    (travel * 100).toFixed(1) + '%';

  // stage define en qué escena estamos según travel:
  // 0 a 4
  const stage = floor(constrain(travel * 5, 0, 4.999));

  // Muestra texto de escena salvo en la etapa Tierra,
  // donde la propia escena puede dibujar sus textos / interfaz.
  if (!(earth && stage === 4)) {
    screenText(getStageLabel(stage, t));
  }

  // Iluminación general
  orbitControlLight();

  // Rotación base de la cámara/escena
  rotateX(rx);
  rotateY(ry);

  // Zoom general del recorrido:
  // al principio vemos más lejos, al final nos acercamos a la Tierra
  const z = map(travel, 0, 1, 900, -120);

  // Escala general del mundo
  scale(map(travel, 0, 1, 0.55, 1.25));

  // Fondo de estrellas
  push();
  translate(0, 0, z);
  drawStarfield(t);
  pop();



  // ==========================================================
  // ESCENA 0 — PRE BIG BANG
  // ==========================================================
  // a0 controla la aparición/desaparición de esta etapa.
  // Al principio vale 1 y luego se desvanece.
  // ==========================================================

  const a0 = 1 - softStep(0.12, 0.28, travel);

  if (a0 > 0.04) {
    // phase sirve para activar la transición interna del Big Bang
    const phase = softStep(0.0, 0.22, travel);

    push();
    scale(map(travel, 0, 0.28, 1.0, 2.8));
    preBigBang.draw(t, phase, a0);
    pop();
  }



  // ==========================================================
  // ESCENA 1 — UNIVERSO / POLVO / GALAXIAS TEMPRANAS
  // ==========================================================
  // Se funde después del Big Bang y se apaga antes de la galaxia.
  // ==========================================================

  const a1 =
    softStep(0.14, 0.26, travel) *
    (1 - softStep(0.42, 0.52, travel));

  if (a1 > 0.04) {
    push();
    scale(map(travel, 0.12, 0.56, 1.8, 0.8));

    // polvo cósmico
    dust.draw(t, 0.85);

    // galaxias / estructuras luminosas
    drawGalaxies(t, a1);

    pop();
  }



  // ==========================================================
  // ESCENA 2 — GALAXIA / VÍA LÁCTEA
  // ==========================================================
  // Aparece luego del universo temprano y antes del sistema solar.
  // ==========================================================

  const a2 =
    softStep(0.40, 0.52, travel) *
    (1 - softStep(0.66, 0.76, travel));

  if (a2 > 0.04) {
    push();
    scale(map(travel, 0.40, 0.76, 1.5, 0.75));
    drawMilkyWay(t, a2);
    pop();
  }



  // ==========================================================
  // ESCENA 3 — SISTEMA SOLAR
  // ==========================================================
  // Aparece cuando el viaje deja la escala galáctica y empieza
  // a acercarse a la Tierra.
  // focusEarth se usa para indicarle al sistema cuánto debe
  // enfatizar visualmente el planeta Tierra.
  // ==========================================================

  const a3 =
    softStep(0.62, 0.72, travel) *
    (1 - softStep(0.84, 0.90, travel));

  if (a3 > 0.04) {
    const focusEarth = softStep(0.74, 0.88, travel);

    push();
    system.draw(t, focusEarth);
    pop();
  }



  // ==========================================================
  // ESCENA 4 — TIERRA / LA MADRE
  // ==========================================================
  // Última etapa del recorrido.
  // La Tierra crece en escala, entra en primer plano y activa
  // su capa visual/sonora interactiva.
  // ==========================================================

  const a4 = softStep(0.86, 0.94, travel);

  if (a4 > 0.04) {
    push();
    scale(map(a4, 0, 1, 0.35, 1.65));
    earth.draw(t, a4);
    pop();
  }
}



// ============================================================
// getStageLabel(stage, t)
// ============================================================
// Devuelve una frase para la escena actual.
// Cada escena tiene varias frases; esta función elige una
// según el tiempo, para que el texto vaya rotando.
// ============================================================

function getStageLabel(stage, t) {
  const arr = labels[stage] || [''];
  const index = floor(t / 7) % arr.length; // cambia cada 7 segundos
  return arr[index];
}



// ============================================================
// orbitControlLight()
// ============================================================
// Define la iluminación general del mundo 3D.
// Se usa una luz ambiente baja y dos direccionales:
// una cálida y una fría, para modelar volumen.
// ============================================================

function orbitControlLight() {
  ambientLight(18);
  directionalLight(255, 230, 190, -0.4, 0.25, -1);
  directionalLight(40, 80, 160, 0.8, -0.3, 0.5);
}



// ============================================================
// drawStarfield(t)
// ============================================================
// Dibuja un campo de estrellas al fondo.
//
// Cada estrella se posiciona en coordenadas pseudoaleatorias
// usando noise() para distribuirlas en el espacio.
// Se usa blendMode(ADD) para que la suma de luz genere
// una atmósfera más brillante y cósmica.
// ============================================================

function drawStarfield(t) {
  blendMode(ADD);

  for (let i = 0; i < 180; i++) {
    const a = noise(i, 1) * TWO_PI * 9;
    const r = noise(i, 2) * 1200;
    const z = noise(i, 3) * -1200;

    push();
    translate(cos(a) * r, sin(a) * r, z);
    noStroke();

    fill(
      170 + random(20, 60),
      210 + random(10, 35),
      255,
      random(18, 65)
    );

    sphere(random(0.18, 0.65));
    pop();
  }

  blendMode(BLEND);
}



// ============================================================
// tintAlpha(a)
// ============================================================
// Función reservada para futuras variaciones de transparencia.
// Por ahora queda vacía.
// ============================================================

function tintAlpha(a) {}



// ============================================================
// mouseWheel(e)
// ============================================================
// El scroll controla el avance temporal de la obra.
// e.delta se transforma en una variación pequeña de targetTravel.
// ============================================================

function mouseWheel(e) {
  targetTravel = constrain(targetTravel + e.delta * 0.00045, 0, 1);
  return false;
}



// ============================================================
// keyPressed()
// ============================================================
// Controles de teclado:
//
// Q / W / E / R / T -> saltar a escenas
// Flechas -> avance fino
// S -> captura
// El resto de las teclas se derivan a la escena Tierra
// para activar sus capas sonoras o interacciones.
// ============================================================

function keyPressed() {
  const k = key.toLowerCase();

  // Saltos directos entre escenas
  if (k === 'q') targetTravel = 0 / 4; // Pre Big Bang
  if (k === 'w') targetTravel = 1 / 4; // Universo
  if (k === 'e') targetTravel = 2 / 4; // Galaxia
  if (k === 'r') targetTravel = 3 / 4; // Sistema solar
  if (k === 't') targetTravel = 4 / 4; // Tierra

  // Avance / retroceso fino
  if (keyCode === DOWN_ARROW) {
    targetTravel = constrain(targetTravel + 0.08, 0, 1);
  }

  if (keyCode === UP_ARROW) {
    targetTravel = constrain(targetTravel - 0.08, 0, 1);
  }

  // Captura de pantalla
  if (k === 's') {
    saveCanvas('LA_MADRE_captura', 'png');
  }

  // Delegar teclado a la escena Tierra para audio e interacción
  if (earth) {
    earth.handleKey(key);
  }
}



// ============================================================
// mousePressed()
// ============================================================
// Delegación del click a la escena Tierra.
// Sirve, por ejemplo, para activar audio o interacción interna.
// ============================================================

function mousePressed() {
  if (earth) {
    earth.handleClick();
  }
}



// ============================================================
// mouseReleased()
// ============================================================
// Cierra el estado de arrastre del mouse.
// ============================================================

function mouseReleased() {
  dragging = false;
}



// ============================================================
// mouseDragged()
// ============================================================
// Envía el desplazamiento del mouse a la escena Tierra,
// que puede usarlo para rotar, mover o alterar la interfaz.
// ============================================================

function mouseDragged() {
  if (earth) {
    earth.handleDrag(mouseX - pmouseX, mouseY - pmouseY);
  }
}



// ============================================================
// windowResized()
// ============================================================
// Ajusta el tamaño del canvas si cambia el tamaño de ventana.
// ============================================================

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}