# LA MADRE

Trabajo Final — Diseño Digital  
MAE UNTREF 2026  
Materia: Diseño Digital  
Profesor: Javier de Azkue  
Autor: Alejo Fraile

## Descripción

**LA MADRE** es una pieza audiovisual generativa e interactiva realizada en **p5.js**, **p5.sound** y **WEBGL**.

El trabajo propone un recorrido visual y sonoro sobre el **eje del tiempo**: desde un estado previo al Big Bang, pasando por la formación del universo, la galaxia y el sistema solar, hasta llegar a la Tierra como cuerpo vivo, territorio ancestral, superficie geográfica y espacio cultural.

El nombre **LA MADRE** refiere a la **Madre Tierra// Madre Naturaleza** como origen material, soporte de la vida y punto de llegada del recorrido. La pieza trabaja la transición entre escalas cósmicas y planetarias, articulando una puesta en escena que combina partículas, redes, polvo, espirales, órbitas, sistemas, cartografías y sonido interactivo.

## Cómo abrir

Abrir `index.html` en un navegador con conexión a internet para cargar las librerías desde CDN.

El proyecto utiliza:

- `p5.js 1.9.4`
- `p5.sound 1.9.4`

## Controles

- **Scroll / flechas ↑↓**: avanzar o retroceder en el recorrido temporal.
- **Q / W / E / R / T**: cambiar entre escenas.
- **Click**: activar audio.
- **1 / 2 / 3 / 4**: disparar capas o eventos sonoros de la escena Tierra.
- **L / M / P**: cambiar modos sonoros.
- **S**: guardar captura PNG.

## Estructura del proyecto

- `index.html`: punto de entrada, interfaz y carga de librerías / scripts.
- `src/sketch.js`: timeline general, navegación entre escenas, controles, composición y render principal.
- `src/utils.js`: funciones auxiliares compartidas.
- `src/pre_big_bang.js`: escena inicial de concentración energética y pre-explosión.
- `src/cosmic_dust.js`: partículas y polvo cósmico del universo temprano.
- `src/galaxies.js`: visualización de galaxias y estructuras luminosas.
- `src/milky_way.js`: escena de espiral galáctica y transición de escala.
- `src/spiral_system.js`: sistema solar, órbitas y aproximación a la Tierra.
- `src/earth_world.js`: clase principal de la escena Tierra.
- `src/earth_world_geo.js`: datos y lógica geográfica de la Tierra.
- `src/earth_world_draw_audio.js`: dibujo de la Tierra, visualización de zonas y comportamiento sonoro.

## Recursos técnicos trabajados

El proyecto retoma y expande contenidos vistos en la materia:

- **Transformaciones** con `push()`, `pop()`, `translate()`, `rotate()` y `scale()`.
- **Animación trigonométrica** con `sin()` y `cos()`.
- **Movimiento orgánico** mediante `noise()`.
- **Objetos, clases y arrays** para organizar escenas, partículas, sistemas y comportamientos.
- **Composición 3D en WEBGL**.
- **Interacción** con teclado, mouse, scroll y click.
- **Diseño modular** del código en múltiples archivos.
- **Integración audiovisual** mediante `p5.sound`.

## Estructura narrativa / visual

La obra se organiza en cinco escenas encadenadas:

1. **Pre Big Bang**  
   Una red oscura de partículas concentra energía antes de la explosión.

2. **Universo**  
   La materia se expande, se enfría y aparecen polvo, filamentos y galaxias.

3. **Galaxia**  
  Las galaxias como concentración de movimientos espiralados.

4. **Sistema solar**  
   El sol gira y se traslada mientras todo el sistema gira entorno a esa estrella.

5. **Tierra / La Madre**  
   La escala se vuelve planetaria: aparecen zonas, geografía, territorios, capas sonoras y relaciones entre superficie, cultura y desplazamiento.

## Criterio estético

La estética general de **LA MADRE** combina oscuridad espacial, halos, partículas luminosas, redes energéticas, espirales y atmósferas planetarias. El recorrido parte de una visualidad abstracta y cósmica para ir acercándose progresivamente a una imagen de la Tierra entendida no solo como planeta, sino también como territorio sensible, superficie habitada e instrumento audiovisual.

La interfaz se mantiene mínima para no competir con la escena visual: fondo negro, tipografía blanca, barra de progreso y texto contextual por etapa. El color y la luz están organizados por transición de escala: tonos oscuros, dorados, rojos y azules en las fases cósmicas, y una aparición final de la Tierra como núcleo material y cultural del trabajo.
