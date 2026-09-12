# Aplicaciones Web (0228)

Materiales del módulo profesional **Aplicaciones Web** (código 0228) del ciclo formativo de grado medio de **Sistemas Microinformáticos y Redes**, en formato presentación 16:9 para web. Los alumnos siguen las presentaciones en clase y estudian desde ellas: no hay libro de texto. El módulo se aprende haciendo: cada unidad se diseña desde la práctica (páginas que se escriben, aplicaciones que se instalan y configuran) y las presentaciones son el apoyo teórico de esas prácticas.

Adaptado al currículo de **Castilla y León** (BOCyL n.º 173, de 9 de septiembre de 2009, título regulado por el Real Decreto 1691/2007). El módulo tiene 102 horas en primer curso y cinco resultados de aprendizaje: gestores de contenidos, sistemas de gestión de aprendizaje a distancia, servicios de gestión de archivos web, aplicaciones de ofimática web y aplicaciones web de escritorio. Contenidos actualizados para el curso 2026-27: herramientas, versiones y servicios comprobados con fuente y fecha, y la inteligencia artificial tratada como herramienta profesional.

## Unidades

| UT | Título | RA | Sesiones | Evaluación |
|---|---|---|---|---|
| 0 | Presentación del módulo | — | 1 | 1.ª |
| 1 | La web y HTML | RA1 | 18 | 1.ª |
| 2 | CSS | RA1 | 14 | 1.ª |
| 3 | WordPress | RA1 | 15 | 2.ª |
| 4 | Moodle | RA2 | 13 | 2.ª |
| 5 | Entorno digital en la nube | RA3, RA4, RA5 | 19 | 3.ª |
| 6 | JavaScript (si sobra tiempo, sin peso) | — | 6 | 3.ª |

Sesiones de 50 minutos, tres a la semana.

## Estructura

```
index.html          Portada con las unidades de trabajo
assets/             Motor de diapositivas (deck-stage.js), estilos y ejercicios (aw.css, aw.js), iconos y manchas de color (SVG)
plantilla/          Un ejemplo de cada tipo de diapositiva y la paleta del módulo
ut00/               Presentación del módulo (primera sesión)
ut01/ ... ut06/     Una presentación por unidad (index.html + img/)
```

## Cómo se construye una unidad

1. Se diseña primero la práctica de la unidad: qué producen los alumnos, con qué herramienta, en cuántas sesiones, si se permite la inteligencia artificial y cómo se evalúa en clase.
2. Se prepara y revisa un guion de la unidad con la teoría necesaria para esa práctica (material de trabajo, fuera de lo publicado).
3. Con el guion aprobado se genera `utNN/index.html` usando los tipos de diapositiva de `plantilla/`.
4. Se añaden las imágenes a `utNN/img/` (JPG optimizado; PNG para capturas de pantalla; SVG para esquemas propios), cada una con su crédito.
5. Se comprueba en el navegador, se publica en GitHub Pages y se enlaza desde `index.html`.

## Tipos de diapositiva

Cada `<section>` lleva `data-label` (nombre en el carril de miniaturas) y `data-notas` (notas del orador). En `plantilla/index.html` hay un ejemplo de cada tipo: portada de módulo, portada de unidad, índice, objetivos, texto con imagen, definición, pasos, tabla, comparativa, código, código y resultado, imagen completa, dos imágenes, galería, vídeo, quiz, pregunta a la clase (texto o imagen), cifra destacada, cita, ejercicio, ejercicio interactivo, nota, resumen, recursos y cierre.

## Código con resaltado y resultado

El resaltado de sintaxis está en `assets/aw.js`, sin librerías externas. Admite HTML, CSS y JavaScript; el contenido va con `<`, `>` y `&` escapados y `data-marca` resalta líneas:

```html
<div class="ventana">
  <div class="ventana-barra"><i></i><i></i><i></i><span>index.html</span></div>
  <pre class="cod" data-lang="html" data-marca="3-5" id="ej1">…código escapado…</pre>
</div>
```

La diapositiva de **código y resultado** añade una ventana de navegador que renderiza de verdad el código de un `<pre class="cod">` (aw.js lo mete en un iframe con `srcdoc`). Para CSS o JavaScript sueltos, `data-html` aporta el HTML de base; `data-zoom` ajusta la escala del resultado:

```html
<div class="resultado" data-codigo="ej1" data-url="localhost/index.html" data-zoom="1.5"></div>
```

## Ejercicios interactivos

En `assets/aw.js` están los generadores de ejercicios. Se insertan en una diapositiva con:

```html
<div class="ej" data-tipo="…"></div>
```

Cada ejercicio tiene los botones Comprobar, Pista, Resolver y Otro ejercicio, y cuenta los aciertos seguidos. Tipos disponibles:

- `completar`: un fragmento con un hueco y la etiqueta o el atributo que falta.
- `ordenar`: los pasos de un procedimiento desordenados (una petición web, publicar en GitHub Pages, instalar una aplicación).
- `error`: un fragmento con un error; se marca la línea y se elige el tipo.
- `emparejar`: seis etiquetas o atributos y sus funciones.
- `selector`: un HTML con una o varias líneas marcadas y cuatro selectores CSS; el acierto se calcula de verdad con `querySelectorAll` sobre el fragmento y se pinta en el código lo que alcanza el selector elegido.

Los bancos están en `AW.bancos` dentro de `assets/aw.js` y se amplían añadiendo entradas (o desde un `<script>` de la unidad con `AW.bancos.completar.push(…)`), sin tocar los generadores. Cada diapositiva puede elegir otro banco con `data-banco` (por ejemplo `data-banco="completarCss"`), otra lista de tipos de error con `data-tipos` y otro enunciado con `data-enunciado`; así la UT2 reutiliza los generadores de la UT1 con contenido de CSS. Los quiz de opción múltiple usan la clase `quiz` con `data-correct`.

## Pregunta a la clase

Diapositiva con una pregunta y un panel de ideas que se revela al pulsar (texto, imágenes o una sola imagen):

```html
<div class="revela">
  <div class="revela-cuerpo">… ideas del profesor …</div>
  <button class="btn btn-primary revela-btn">Ver ideas</button>
</div>
```

## Fotos y capturas con atribución

Toda imagen ajena va dentro de una figura con su crédito. La marca © es visible siempre, la ficha aparece al pasar el ratón (y al imprimir) y un clic abre la imagen a pantalla completa (Esc o clic para cerrar). Si la imagen de la diapositiva es un recorte o una miniatura, `data-grande` en la `img` indica el archivo completo. Las capturas de webs y aplicaciones llevan la fecha de consulta:

```html
<figure class="foto">
  <img src="img/captura.jpg" alt="…" title="Captura de ejemplo.es · 11 de septiembre de 2026">
  <figcaption class="credito"><b>ejemplo.es</b>. Captura de pantalla, 11 de septiembre de 2026. Marca registrada de su titular.</figcaption>
</figure>
```

Mientras una captura no está hecha, su hueco se marca con `<div class="img-slot">` y una descripción de lo que va ahí.

## Galería de fotos

Varias fotos en el mismo hueco, con flechas para pasar y un pie que cambia con cada una. Un elemento de la misma diapositiva con `data-ir="2"` salta a la segunda foto al pulsarlo:

```html
<div class="galeria">
  <figure class="foto" data-pie="<b>Figura 1.2.</b> …">…</figure>
  <figure class="foto" data-pie="<b>Figura 1.3.</b> …">…</figure>
</div>
```

Por defecto la galería ocupa toda la altura del hueco; con `style="--galeria-alto:560px;--galeria-flex:none"` se fija la altura del marco.

## Ver las presentaciones en local

Las miniaturas del carril lateral toman los estilos de `assets/aw.css`; abriendo el HTML directamente desde disco (`file://`) el navegador no se los pasa y las miniaturas salen sin estilo. En GitHub Pages funciona sin más. Para verlo igual en local, sirve la carpeta con un servidor sencillo:

```
python -m http.server 8000
```

y abre `http://localhost:8000/`.

## Navegación

Flechas o espacio para avanzar, Inicio y Fin para ir al principio o al final, R para volver a la primera. Ctrl+P imprime una página por diapositiva.

## Licencia

- **Contenido** (diapositivas, textos, esquemas e imágenes propias): [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/deed.es), ver `LICENSE`. Se puede copiar, adaptar y reutilizar, incluso con fines comerciales, citando la autoría y compartiendo el resultado bajo la misma licencia.
- **Código** (`assets/deck-stage.js`, `assets/aw.js`, `assets/aw.css`): [MIT](LICENSE-CODE), ver `LICENSE-CODE`.
- **Excepción: material de terceros.** Las fotografías, capturas de pantalla y logotipos ajenos no están cubiertos por la licencia anterior. Cada uno lleva su crédito y su licencia en el `figcaption` de la figura y se usan con fines educativos. Para reutilizarlos hay que acudir a la licencia original de cada uno.

Autoría: Raúl Ibáñez, 2026. Atribución sugerida: «Raúl Ibáñez, *Aplicaciones Web (0228)*, CC BY-SA 4.0».
