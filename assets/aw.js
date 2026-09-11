/* Motor común de las presentaciones de Aplicaciones Web (0228).
 *
 *  1. Numera las diapositivas ("03 / 51").
 *  2. Quiz de opción múltiple:
 *       <div class="quiz" data-correct="1" data-ok="..." data-ko="...">
 *         <p class="quiz-fb">Selecciona una opción.</p>
 *         <div class="quiz-opts"> <button class="quiz-opt">…</button> … </div>
 *         <button class="btn btn-ghost quiz-reset">Reiniciar</button>
 *       </div>
 *  3. Panel que se revela (pregunta a la clase):
 *       <div class="revela"> <div class="revela-cuerpo">…</div> <button class="btn btn-primary revela-btn">Ver ideas</button> </div>
 *  4. Galería de fotos en el mismo hueco, con flechas y pie que cambia:
 *       <div class="galeria"> <figure class="foto" data-pie="Figura 1.2. …">…</figure> … </div>
 *     Un elemento de la misma diapositiva con data-ir="2" salta a la segunda foto.
 *  5. Código con resaltado de sintaxis, sin dependencias:
 *       <pre class="cod" data-lang="html">…</pre>      html, css o js (el contenido va escapado: &lt; &gt; &amp;)
 *  6. Código y resultado: una ventana de navegador que renderiza el código de un <pre class="cod">:
 *       <pre class="cod" data-lang="html" id="ej1">…</pre>
 *       <div class="resultado" data-codigo="ej1"></div>
 *  7. Ejercicios interactivos con Comprobar, Pista, Resolver y Otro ejercicio:
 *       <div class="ej" data-tipo="…"></div>
 *     Los tipos de este módulo están pendientes de acordar; el armazón (botones, racha de aciertos,
 *     mensajes) es el mismo que en CL32 y cada tipo se añade en AW.montadores.
 */
(function () {
  'use strict';

  const AW = (window.AW = window.AW || {});

  /* ---------- utilidades ---------- */
  const rnd = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
  const baraja = (a) => { const b = a.slice(); for (let i = b.length - 1; i > 0; i--) { const j = rnd(0, i); [b[i], b[j]] = [b[j], b[i]]; } return b; };
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  function eligeOtro(lista, ultimo) {
    if (lista.length < 2) return lista[0];
    let x; do { x = lista[rnd(0, lista.length - 1)]; } while (x === ultimo);
    return x;
  }
  AW.util = { rnd, baraja, esc, eligeOtro };

  /* ---------- resaltado de sintaxis ----------
     Tokenizadores sencillos por expresiones regulares. Devuelven HTML con <span class="tok-…">.
     Bastan para los fragmentos de clase: no pretenden cubrir todo el lenguaje. */
  const span = (cls, txt) => '<span class="tok-' + cls + '">' + esc(txt) + '</span>';

  function resaltaCss(src) {
    let out = '', i = 0;
    const re = /(\/\*[\s\S]*?\*\/)|("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*')|(@[a-zA-Z-]+)|([^{};]+?)(\s*\{)|([a-zA-Z-]+)(\s*:)|(#[0-9a-fA-F]{3,8}\b|-?\d*\.?\d+(?:px|em|rem|%|vh|vw|s|ms|deg|fr)?\b)|([{};:,>])/g;
    let m;
    while ((m = re.exec(src))) {
      out += esc(src.slice(i, m.index)); i = re.lastIndex;
      if (m[1]) out += span('com', m[1]);
      else if (m[2]) out += span('str', m[2]);
      else if (m[3]) out += span('kw', m[3]);
      else if (m[4] !== undefined) out += span('sel', m[4]) + span('punc', m[5]);
      else if (m[6] !== undefined) out += span('prop', m[6]) + span('punc', m[7]);
      else if (m[8]) out += span('num', m[8]);
      else if (m[9]) out += span('punc', m[9]);
    }
    return out + esc(src.slice(i));
  }

  const KW_JS = /^(?:const|let|var|function|return|if|else|for|while|do|switch|case|break|continue|new|class|extends|import|export|from|default|try|catch|finally|throw|typeof|instanceof|in|of|this|true|false|null|undefined|async|await|yield|static|super)$/;
  function resaltaJs(src) {
    let out = '', i = 0;
    const re = /(\/\/[^\n]*|\/\*[\s\S]*?\*\/)|(`(?:[^`\\]|\\.)*`|"(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*')|(\b\d+(?:\.\d+)?\b)|([A-Za-z_$][\w$]*)(?=\s*\()|([A-Za-z_$][\w$]*)|([{}()[\];,.=+\-*\/<>!&|?:])/g;
    let m;
    while ((m = re.exec(src))) {
      out += esc(src.slice(i, m.index)); i = re.lastIndex;
      if (m[1]) out += span('com', m[1]);
      else if (m[2]) out += span('str', m[2]);
      else if (m[3]) out += span('num', m[3]);
      else if (m[4]) out += KW_JS.test(m[4]) ? span('kw', m[4]) : span('fn', m[4]);
      else if (m[5]) out += KW_JS.test(m[5]) ? span('kw', m[5]) : esc(m[5]);
      else if (m[6]) out += span('punc', m[6]);
    }
    return out + esc(src.slice(i));
  }

  function resaltaEtiqueta(tag) {
    // tag: "<a href="x" class='y'>" o "</a>" o "<img … />"
    const m = tag.match(/^(<\/?)([a-zA-Z][\w-]*)([\s\S]*?)(\/?>)$/);
    if (!m) return esc(tag);
    let out = span('punc', m[1]) + span('tag', m[2]);
    const attrs = m[3];
    const re = /([^\s=]+)(\s*=\s*)("(?:[^"]*)"|'(?:[^']*)'|[^\s>]+)|(\S+)/g;
    let i = 0, a;
    while ((a = re.exec(attrs))) {
      out += esc(attrs.slice(i, a.index)); i = re.lastIndex;
      if (a[1]) out += span('attr', a[1]) + span('punc', a[2]) + span('str', a[3]);
      else out += span('attr', a[4]);
    }
    out += esc(attrs.slice(i));
    return out + span('punc', m[4]);
  }
  function resaltaHtml(src) {
    let out = '', i = 0;
    const re = /(<!--[\s\S]*?-->)|(<!DOCTYPE[^>]*>)|(<style\b[^>]*>)([\s\S]*?)(<\/style>)|(<script\b[^>]*>)([\s\S]*?)(<\/script>)|(<\/?[a-zA-Z][^>]*>)|(&[a-zA-Z#0-9]+;)/gi;
    let m;
    while ((m = re.exec(src))) {
      out += esc(src.slice(i, m.index)); i = re.lastIndex;
      if (m[1]) out += span('com', m[1]);
      else if (m[2]) out += span('doctype', m[2]);
      else if (m[3]) out += resaltaEtiqueta(m[3]) + resaltaCss(m[4]) + resaltaEtiqueta(m[5]);
      else if (m[6]) out += resaltaEtiqueta(m[6]) + resaltaJs(m[7]) + resaltaEtiqueta(m[8]);
      else if (m[9]) out += resaltaEtiqueta(m[9]);
      else if (m[10]) out += span('num', m[10]);
    }
    return out + esc(src.slice(i));
  }

  AW.resalta = { html: resaltaHtml, css: resaltaCss, js: resaltaJs, javascript: resaltaJs };

  function montaCodigo(pre) {
    const lang = (pre.dataset.lang || '').toLowerCase();
    const f = AW.resalta[lang];
    if (!f) return;
    // Se conserva el texto fuente para el bloque "resultado" y para copiar
    const src = pre.textContent.replace(/^\n/, '').replace(/\s+$/, '');
    pre.dataset.src = src;
    let html = f(src);
    // Líneas marcadas con data-marca="3,5-6" (numeradas desde 1)
    if (pre.dataset.marca) {
      const marcas = new Set();
      pre.dataset.marca.split(',').forEach((r) => {
        const [a, b] = r.split('-').map((n) => parseInt(n, 10));
        for (let k = a; k <= (isNaN(b) ? a : b); k++) marcas.add(k);
      });
      html = html.split('\n').map((l, k) => (marcas.has(k + 1) ? '<mark>' + l + '</mark>' : l)).join('\n');
    }
    pre.innerHTML = html;
  }

  /* ---------- código y resultado ---------- */
  function montaResultado(div) {
    const pre = document.getElementById(div.dataset.codigo);
    if (!pre) { div.textContent = 'No encuentro el código #' + div.dataset.codigo; return; }
    const src = pre.dataset.src !== undefined ? pre.dataset.src : pre.textContent;
    const lang = (pre.dataset.lang || 'html').toLowerCase();
    let doc;
    if (lang === 'css') doc = '<!DOCTYPE html><meta charset="utf-8"><style>' + src + '</style>' + (div.dataset.html || '');
    else if (lang === 'js' || lang === 'javascript') doc = '<!DOCTYPE html><meta charset="utf-8">' + (div.dataset.html || '') + '<script>' + src + '<\/script>';
    else doc = src;
    // El lienzo es de 1920 px: se amplía el resultado para que se lea como el resto de la diapositiva (data-zoom, 1.5 por defecto)
    const zoom = parseFloat(div.dataset.zoom || '1.5');
    if (zoom !== 1) doc = '<style>html{zoom:' + zoom + '}</style>' + doc;
    if (!div.querySelector('.resultado-barra')) {
      const barra = document.createElement('div');
      barra.className = 'resultado-barra';
      barra.innerHTML = '<i></i><i></i><i></i><span class="url">' + esc(div.dataset.url || 'localhost/index.html') + '</span>';
      div.prepend(barra);
    }
    const iframe = document.createElement('iframe');
    iframe.title = 'Resultado en el navegador';
    iframe.setAttribute('sandbox', 'allow-scripts allow-same-origin');
    iframe.srcdoc = doc;
    div.appendChild(iframe);
  }

  /* ---------- armazón común de los ejercicios ---------- */
  function armazon(el, enunciado) {
    el.innerHTML =
      '<p class="ej-enunciado">' + esc(enunciado) + '</p>' +
      '<div class="ej-cuerpo"></div>' +
      '<div class="ej-fila">' +
      '  <button class="btn btn-primary ej-comprobar">Comprobar</button>' +
      '  <button class="btn btn-ghost ej-pista">Pista</button>' +
      '  <button class="btn btn-ghost ej-resolver">Resolver</button>' +
      '  <button class="btn btn-ghost ej-otro">Otro ejercicio</button>' +
      '  <span class="ej-racha">Aciertos seguidos: <b>0</b></span>' +
      '</div>' +
      '<p class="ej-fb"></p>';
    const $ = (s) => el.querySelector(s);
    const st = { cuerpo: $('.ej-cuerpo'), fb: $('.ej-fb'), racha: $('.ej-racha b'), aciertos: 0, conPista: false, resuelto: false };
    st.mensaje = (t, clase) => { st.fb.textContent = t; st.fb.className = 'ej-fb' + (clase ? ' ' + clase : ''); };
    st.acierto = (t) => { if (!st.resuelto && !st.conPista) { st.aciertos++; st.racha.textContent = st.aciertos; } st.resuelto = true; st.mensaje(t, 'ok'); };
    st.fallo = (t) => { st.aciertos = 0; st.racha.textContent = '0'; st.mensaje(t, 'ko'); };
    st.ayuda = () => { st.conPista = true; st.aciertos = 0; st.racha.textContent = '0'; };
    st.nuevo = () => { st.conPista = false; st.resuelto = false; st.mensaje(''); };
    st.botones = { comprobar: $('.ej-comprobar'), pista: $('.ej-pista'), resolver: $('.ej-resolver'), otro: $('.ej-otro') };
    // Que las teclas dentro del ejercicio no cambien de diapositiva
    el.addEventListener('keydown', (e) => e.stopPropagation());
    return st;
  }
  function selectHtml(clase, opciones, vacio) {
    return '<select class="ej-select ' + clase + '"><option value="">' + esc(vacio || 'Elige…') + '</option>' +
      opciones.map((o, i) => '<option value="' + i + '">' + esc(o) + '</option>').join('') + '</select>';
  }
  AW.armazon = armazon;
  AW.selectHtml = selectHtml;

  /* ---------- bancos de ejercicios ----------
     Se pueden ampliar sin tocar los montadores. Cada unidad añade los suyos con AW.bancos.<tipo>.push(...)
     desde un <script> propio, o directamente aquí. */
  AW.bancos = AW.bancos || {};

  // completar: fragmento con un hueco «___»; respuestas aceptadas (sin < >); pista; familia
  AW.bancos.completar = [
    { cod: '<!DOCTYPE ___>', ok: ['html'], pista: 'Es la primera línea de todo documento HTML actual.', fam: 'estructura' },
    { cod: '<html ___="es">', ok: ['lang'], pista: 'Atributo que dice en qué idioma está la página.', fam: 'estructura' },
    { cod: '<head>\n  <meta ___="utf-8">\n</head>', ok: ['charset'], pista: 'Sin él, las tildes salen mal.', fam: 'estructura' },
    { cod: '<head>\n  <___>Mi videojuego favorito</___>\n</head>', ok: ['title'], pista: 'Es lo que se ve en la pestaña del navegador.', fam: 'estructura' },
    { cod: '<___>\n  <h1>Reparación de móviles</h1>\n</___>', ok: ['body'], pista: 'Todo lo que se ve va dentro de esta etiqueta.', fam: 'estructura' },
    { cod: '<___>El mejor juego de la historia</___>\n<p>Salió en 1990.</p>', ok: ['h1', 'h2'], pista: 'Un título. El más importante de la página solo puede haber uno.', fam: 'texto' },
    { cod: '<___>Guybrush quiere ser pirata.</___>', ok: ['p'], pista: 'Un párrafo de texto.', fam: 'texto' },
    { cod: '<p>Entrega antes del <___>viernes</___>.</p>', ok: ['strong', 'b', 'em', 'mark'], pista: 'Marca una palabra como importante.', fam: 'texto' },
    { cod: '<___>\n  <li>Pantallas</li>\n  <li>Baterías</li>\n</___>', ok: ['ul'], pista: 'Lista con viñetas, sin orden.', fam: 'listas' },
    { cod: '<ol>\n  <___>Descarga el instalador</___>\n  <___>Ejecútalo</___>\n</ol>', ok: ['li'], pista: 'Cada elemento de una lista.', fam: 'listas' },
    { cod: '<___>\n  <dt>HTML</dt>\n  <dd>Lenguaje de marcas de la web</dd>\n</___>', ok: ['dl'], pista: 'Lista de definiciones: término y definición.', fam: 'listas' },
    { cod: '<a ___="https://developer.mozilla.org">MDN</a>', ok: ['href'], pista: 'El atributo que dice a dónde va el enlace.', fam: 'enlaces' },
    { cod: '<___ href="contacto.html">Contacto</___>', ok: ['a'], pista: 'La etiqueta de los enlaces.', fam: 'enlaces' },
    { cod: '<a href="___:info@ejemplo.es">Escríbenos</a>', ok: ['mailto'], pista: 'Abre el programa de correo.', fam: 'enlaces' },
    { cod: '<h2 ___="personajes">Personajes</h2>\n<a href="#personajes">Ir a personajes</a>', ok: ['id'], pista: 'Identificador único al que apunta el ancla.', fam: 'enlaces' },
    { cod: '<a href="https://ejemplo.es" ___="_blank" rel="noopener">Abrir en pestaña nueva</a>', ok: ['target'], pista: 'Dónde se abre el enlace.', fam: 'enlaces' },
    { cod: '<img src="portada.jpg" ___="Portada del juego">', ok: ['alt'], pista: 'Texto alternativo: obligatorio por accesibilidad.', fam: 'imágenes' },
    { cod: '<img ___="img/logo.png" alt="Logotipo">', ok: ['src'], pista: 'La ruta del archivo de imagen.', fam: 'imágenes' },
    { cod: '<figure>\n  <img src="foto.jpg" alt="Isla Mêlée">\n  <___>La isla al anochecer</___>\n</figure>', ok: ['figcaption'], pista: 'El pie de una figura.', fam: 'imágenes' },
    { cod: '<table>\n  <tr>\n    <___>Nombre</___>\n    <___>Año</___>\n  </tr>\n</table>', ok: ['th'], pista: 'Celda de cabecera de una tabla.', fam: 'tablas' },
    { cod: '<table>\n  <tr>\n    <td ___="2">Recreo</td>\n  </tr>\n</table>', ok: ['colspan'], pista: 'Une la celda con la de al lado.', fam: 'tablas' },
    { cod: '<form action="enviar.php" ___="post">\n  …\n</form>', ok: ['method'], pista: 'GET o POST.', fam: 'formularios' },
    { cod: '<label for="nombre">Nombre</label>\n<input ___="nombre" name="nombre" type="text">', ok: ['id'], pista: 'Conecta la etiqueta con el campo.', fam: 'formularios' },
    { cod: '<input type="email" ___="correo" required>', ok: ['name'], pista: 'Sin él, el dato no viaja al servidor.', fam: 'formularios' },
    { cod: '<input type="text" name="ciudad" ___="Escribe tu ciudad">', ok: ['placeholder'], pista: 'Texto gris de ejemplo dentro del campo.', fam: 'formularios' },
    { cod: '<___ name="destino">\n  <option>París</option>\n  <option>Roma</option>\n</___>', ok: ['select'], pista: 'Lista desplegable.', fam: 'formularios' },
    { cod: '<___ name="opinion" rows="4"></___>', ok: ['textarea'], pista: 'Campo de texto de varias líneas.', fam: 'formularios' },
    { cod: '<___ type="submit">Enviar</___>', ok: ['button'], pista: 'Botón que envía el formulario.', fam: 'formularios' },
    { cod: '<!-- ___ -->', ok: ['comentario', 'un comentario', 'texto'], pista: 'Lo que va dentro no se muestra. Escribe la palabra «comentario».', fam: 'normas' },
    { cod: '<___>\n  <nav>…</nav>\n</___>\n<main>…</main>', ok: ['header'], pista: 'La cabecera de la página, con el logotipo y el menú.', fam: 'semántica' }
  ];

  // ordenar: juegos de pasos en su orden correcto
  AW.bancos.ordenar = [
    { titulo: 'Qué pasa cuando escribes una dirección en el navegador', pasos: [
      'Escribes la dirección y pulsas Intro',
      'El navegador pregunta al DNS qué IP tiene ese dominio',
      'El navegador se conecta al servidor por HTTPS',
      'El navegador pide la página (petición GET)',
      'El servidor devuelve la respuesta con el código 200 y el HTML',
      'El navegador lee el HTML y pinta la página' ] },
    { titulo: 'Publicar tu primera página en GitHub Pages', pasos: [
      'Crear la cuenta de GitHub',
      'Crear el repositorio público tuusuario.github.io',
      'Crear el archivo index.html y guardarlo (commit)',
      'Entrar en Settings y en el apartado Pages',
      'Elegir Deploy from a branch, rama main, y guardar',
      'Esperar y abrir https://tuusuario.github.io' ] },
    { titulo: 'Escribir y comprobar una página HTML', pasos: [
      'Crear la carpeta del proyecto',
      'Crear index.html con el esqueleto del documento',
      'Escribir el contenido dentro de body',
      'Abrir el archivo en el navegador',
      'Pasar el código por el validador y corregir los errores',
      'Subirlo al repositorio' ] }
  ];

  // error: líneas de código, índice (desde 0) de la línea con el error, tipos aceptados (índices de AW.tiposError) y explicación
  AW.tiposError = [
    'Etiqueta sin cerrar',
    'Etiquetas mal anidadas',
    'Atributo sin comillas o mal escrito',
    'Falta el atributo alt en una imagen',
    'Un li fuera de una lista',
    'Atributo obsoleto: eso se hace con CSS',
    'Ruta o nombre de archivo con mayúsculas o espacios',
    'Falta name: el dato no se envía',
    'Falta el DOCTYPE o la codificación'
  ];
  AW.bancos.error = [
    { lineas: ['<ul>', '  <li>Pantallas</li>', '  <li>Baterías', '  <li>Cámaras</li>', '</ul>'], linea: 2, tipos: [0], exp: 'La segunda línea de la lista abre un li y no lo cierra.' },
    { lineas: ['<p>Guybrush quiere ser <strong>pirata</p></strong>', '<p>Y lo consigue.</p>'], linea: 0, tipos: [1], exp: 'Se abre strong dentro de p, así que hay que cerrar strong antes que p.' },
    { lineas: ['<a href=https://www.rae.es target="_blank">RAE</a>'], linea: 0, tipos: [2], exp: 'El valor de href va entre comillas, como todos los valores de atributo.' },
    { lineas: ['<figure>', '  <img src="img/portada.jpg">', '  <figcaption>Portada</figcaption>', '</figure>'], linea: 1, tipos: [3], exp: 'Toda imagen lleva alt con un texto alternativo; si es decorativa, alt vacío.' },
    { lineas: ['<h2>Personajes</h2>', '<li>Guybrush</li>', '<li>LeChuck</li>'], linea: 1, tipos: [4], exp: 'Los li solo pueden ir dentro de ul, ol o menu. Falta la lista que los envuelve.' },
    { lineas: ['<table border="1">', '  <tr><th>Nombre</th><th>Año</th></tr>', '  <tr><td>Monkey Island</td><td>1990</td></tr>', '</table>'], linea: 0, tipos: [5], exp: 'border es un atributo de presentación de HTML 4. Los bordes se ponen con CSS.' },
    { lineas: ['<img src="Fotos/Mi Foto.JPG" alt="Yo">'], linea: 0, tipos: [6], exp: 'En el servidor, Fotos y fotos son carpetas distintas y los espacios rompen la ruta. Minúsculas, sin espacios ni tildes.' },
    { lineas: ['<form action="alta.php" method="post">', '  <label for="correo">Correo</label>', '  <input id="correo" type="email">', '  <button>Enviar</button>', '</form>'], linea: 2, tipos: [7], exp: 'El campo tiene id pero no name. Sin name, el valor no viaja en la petición.' },
    { lineas: ['<html lang="es">', '<head>', '  <title>Mi página</title>', '</head>'], linea: 0, tipos: [8], exp: 'Falta <!DOCTYPE html> antes de html (y la meta charset en head).' },
    { lineas: ['<p align="center">Bienvenidos</p>'], linea: 0, tipos: [5], exp: 'align ya no se usa. Centrar el texto es cosa de CSS (text-align).' },
    { lineas: ['<h1>Mi libro favorito<h1>', '<p>El señor de los anillos</p>'], linea: 0, tipos: [0], exp: 'La segunda etiqueta debería ser de cierre: </h1>. Falta la barra.' },
    { lineas: ['<input type="checkbox" id="parchis" value="parchis"> Parchís', '<input type="checkbox" id="ajedrez" value="ajedrez"> Ajedrez'], linea: 0, tipos: [7], exp: 'Las casillas llevan id pero no name. Sin name no se envían. (Error copiado de un libro de texto.)' },
    { lineas: ['<ol>', '  <li><a href="#inicio">Inicio</li></a>', '</ol>'], linea: 1, tipos: [1], exp: 'El enlace se abre dentro del li: hay que cerrar a antes que li.' },
    { lineas: ['<img src="logo.png" alt="Logotipo" width=200>'], linea: 0, tipos: [2], exp: 'El valor de width va entre comillas: width="200".' },
    { lineas: ['<font color="red">Oferta</font>'], linea: 0, tipos: [5], exp: 'font es un elemento obsoleto. El color se pone con CSS.' }
  ];

  // emparejar: juegos de seis parejas etiqueta o atributo → función
  AW.bancos.emparejar = [
    { titulo: 'Formularios', pares: [
      ['<label>', 'Texto del campo, clicable, unido al campo por for e id'],
      ['name', 'Nombre con el que viaja el dato al servidor'],
      ['required', 'No se puede enviar si el campo está vacío'],
      ['placeholder', 'Texto de ejemplo en gris dentro del campo'],
      ['<select>', 'Lista desplegable de opciones'],
      ['<textarea>', 'Campo de texto de varias líneas'] ] },
    { titulo: 'Estructura y texto', pares: [
      ['<!DOCTYPE html>', 'Declara que el documento es HTML actual'],
      ['<head>', 'Lo que el navegador necesita saber y no se ve'],
      ['<meta charset="utf-8">', 'Codificación: tildes y eñes se escriben tal cual'],
      ['<h1>', 'Título principal, solo uno por página'],
      ['<strong>', 'Texto importante'],
      ['<br>', 'Salto de línea dentro de un párrafo'] ] },
    { titulo: 'Imágenes, tablas y semántica', pares: [
      ['alt', 'Texto alternativo de una imagen'],
      ['<figcaption>', 'Pie de una figura'],
      ['colspan', 'Una celda ocupa varias columnas'],
      ['<th>', 'Celda de cabecera de una tabla'],
      ['<nav>', 'Zona con el menú de navegación'],
      ['<main>', 'El contenido principal de la página'] ] },
    { titulo: 'Enlaces y listas', pares: [
      ['href', 'Destino de un enlace'],
      ['mailto:', 'Enlace que abre el correo'],
      ['#seccion', 'Enlace a un ancla de la misma página'],
      ['<ol>', 'Lista numerada'],
      ['<dl>', 'Lista de definiciones'],
      ['target="_blank"', 'El enlace se abre en una pestaña nueva'] ] }
  ];

  /* ---------- montadores de los ejercicios ---------- */
  const norm = (s) => String(s).trim().toLowerCase().replace(/^<\/?|>$/g, '').replace(/^<|>$/g, '').trim();

  function montaCompletar(el) {
    const st = armazon(el, 'Escribe la etiqueta o el atributo que falta en el hueco. Solo el nombre, sin < >.');
    let caso = null;
    function nuevo() {
      caso = eligeOtro(AW.bancos.completar, caso);
      const lineas = caso.cod.split('\n').map((l, i) =>
        '<div class="ej-linea"><i>' + (i + 1) + '</i><span>' + esc(l).replace(/___/g, '<span class="hueco">___</span>') + '</span></div>').join('');
      st.cuerpo.innerHTML = '<pre class="ej-cod">' + lineas + '</pre>' +
        '<div class="ej-campos ej-campos-1"><label class="ej-campo"><span>Lo que falta (' + esc(caso.fam) + ')</span>' +
        '<input class="ej-texto mono" type="text" autocomplete="off" spellcheck="false" placeholder="Escribe aquí"></label></div>';
      st.nuevo();
      st.cuerpo.querySelector('input').addEventListener('keydown', (e) => { if (e.key === 'Enter') comprobar(); });
    }
    const inp = () => st.cuerpo.querySelector('input');
    const marca = (clase) => { const i = inp(); i.classList.remove('ok', 'ko', 'pista'); i.classList.add(clase); };
    const rellena = (v) => { st.cuerpo.querySelectorAll('.hueco').forEach((h) => (h.textContent = v)); };
    function comprobar() {
      const v = norm(inp().value);
      if (!v) { marca('ko'); st.mensaje('Escribe algo.'); return; }
      if (caso.ok.map(norm).includes(v)) { marca('ok'); rellena(v); st.acierto('Correcto: ' + caso.ok[0] + '.'); }
      else { marca('ko'); st.fallo('No es «' + inp().value.trim() + '». Fíjate en el contexto y pide una pista.'); }
    }
    function pista() { st.ayuda(); marca('pista'); st.mensaje('Pista: ' + caso.pista); }
    function resolver() { st.ayuda(); st.resuelto = true; inp().value = caso.ok[0]; marca('ok'); rellena(caso.ok[0]); st.mensaje('Solución: ' + caso.ok[0] + (caso.ok.length > 1 ? ' (también valdría ' + caso.ok.slice(1).join(', ') + ')' : '') + '.'); }
    st.botones.comprobar.addEventListener('click', comprobar);
    st.botones.pista.addEventListener('click', pista);
    st.botones.resolver.addEventListener('click', resolver);
    st.botones.otro.addEventListener('click', nuevo);
    nuevo();
  }

  function montaOrdenar(el) {
    const st = armazon(el, 'Los pasos están desordenados. Pon a cada uno su número de orden.');
    let juego = null, orden = [];
    function nuevo() {
      juego = eligeOtro(AW.bancos.ordenar, juego);
      orden = baraja(juego.pasos.map((_, i) => i));
      const n = juego.pasos.length;
      st.cuerpo.innerHTML = '<p class="ej-caso-titulo">' + esc(juego.titulo) + '</p><ol class="ej-orden">' +
        orden.map((k, i) => '<li>' + selectHtml('o' + i, juego.pasos.map((_, j) => String(j + 1)), 'N.º') + '<span>' + esc(juego.pasos[k]) + '</span></li>').join('') + '</ol>';
      st.nuevo();
    }
    const sel = (i) => st.cuerpo.querySelector('select.o' + i);
    const marca = (s, clase) => { s.classList.remove('ok', 'ko', 'pista'); s.classList.add(clase); };
    function comprobar() {
      let mal = 0, vacios = 0;
      orden.forEach((k, i) => { const s = sel(i); if (s.value === '') { vacios++; marca(s, 'ko'); return; } const ok = +s.value === k; marca(s, ok ? 'ok' : 'ko'); if (!ok) mal++; });
      if (!mal && !vacios) st.acierto('Correcto: los pasos están en orden.');
      else st.fallo((vacios ? vacios + ' sin número. ' : '') + (mal ? mal + ' mal colocados. ' : '') + 'Piensa qué tiene que existir antes de cada paso.');
    }
    function pista() {
      const i = orden.findIndex((k, idx) => +sel(idx).value !== k);
      if (i < 0) { st.mensaje('Ya está todo bien.', 'ok'); return; }
      st.ayuda(); const s = sel(i); s.value = String(orden[i]); marca(s, 'pista');
      st.mensaje('«' + juego.pasos[orden[i]] + '» es el paso ' + (orden[i] + 1) + '.');
    }
    function resolver() { st.ayuda(); st.resuelto = true; orden.forEach((k, i) => { const s = sel(i); s.value = String(k); marca(s, 'ok'); }); st.mensaje('Orden correcto: ' + juego.pasos.map((p, j) => (j + 1) + ' ' + p).join(' · ')); }
    st.botones.comprobar.addEventListener('click', comprobar);
    st.botones.pista.addEventListener('click', pista);
    st.botones.resolver.addEventListener('click', resolver);
    st.botones.otro.addEventListener('click', nuevo);
    nuevo();
  }

  function montaError(el) {
    const st = armazon(el, 'Hay un error en el fragmento. Pulsa la línea donde está y elige de qué tipo es.');
    let caso = null, linea = -1;
    function nuevo() {
      caso = eligeOtro(AW.bancos.error, caso); linea = -1;
      st.cuerpo.innerHTML = '<pre class="ej-cod pulsable">' + caso.lineas.map((l, i) => '<div class="ej-linea" data-i="' + i + '"><i>' + (i + 1) + '</i><span>' + esc(l) + '</span></div>').join('') + '</pre>' +
        '<div class="ej-campos ej-campos-1"><label class="ej-campo"><span>Tipo de error</span>' + selectHtml('tipo', AW.tiposError, 'Elige el tipo…') + '</label></div>' +
        '<div class="ej-respuesta" hidden></div>';
      st.cuerpo.querySelectorAll('.ej-linea').forEach((d) => d.addEventListener('click', () => {
        st.cuerpo.querySelectorAll('.ej-linea').forEach((x) => x.classList.remove('sel', 'ok', 'ko', 'pista'));
        d.classList.add('sel'); linea = +d.dataset.i;
      }));
      st.nuevo();
    }
    const sel = () => st.cuerpo.querySelector('select.tipo');
    const fila = (i) => st.cuerpo.querySelector('.ej-linea[data-i="' + i + '"]');
    const marca = (s, clase) => { s.classList.remove('ok', 'ko', 'pista'); s.classList.add(clase); };
    const explica = () => { const r = st.cuerpo.querySelector('.ej-respuesta'); r.innerHTML = '<b>' + esc(AW.tiposError[caso.tipos[0]]) + '.</b> ' + esc(caso.exp); r.hidden = false; };
    function comprobar() {
      const s = sel();
      if (linea < 0) { st.mensaje('Pulsa primero la línea del error.'); return; }
      const okLinea = linea === caso.linea;
      fila(linea).classList.remove('sel'); fila(linea).classList.add(okLinea ? 'ok' : 'ko');
      if (s.value === '') { marca(s, 'ko'); st.mensaje(okLinea ? 'La línea es esa. Ahora elige el tipo de error.' : 'Esa línea está bien. Y falta elegir el tipo.'); if (!okLinea) st.fallo('Esa línea está bien. Y falta elegir el tipo.'); return; }
      const okTipo = caso.tipos.includes(+s.value);
      marca(s, okTipo ? 'ok' : 'ko');
      if (okLinea && okTipo) { st.acierto('Correcto.'); explica(); }
      else st.fallo(okLinea ? 'La línea es esa, pero el tipo no.' : okTipo ? 'El tipo es ese, pero no está en esa línea.' : 'Ni la línea ni el tipo. Lee el fragmento etiqueta a etiqueta.');
    }
    function pista() { st.ayuda(); st.cuerpo.querySelectorAll('.ej-linea').forEach((x) => x.classList.remove('sel', 'ok', 'ko', 'pista')); fila(caso.linea).classList.add('pista'); linea = caso.linea; st.mensaje('El error está en la línea ' + (caso.linea + 1) + '. ¿De qué tipo es?'); }
    function resolver() { st.ayuda(); st.resuelto = true; st.cuerpo.querySelectorAll('.ej-linea').forEach((x) => x.classList.remove('sel', 'ok', 'ko', 'pista')); fila(caso.linea).classList.add('ok'); const s = sel(); s.value = String(caso.tipos[0]); marca(s, 'ok'); explica(); st.mensaje(''); }
    st.botones.comprobar.addEventListener('click', comprobar);
    st.botones.pista.addEventListener('click', pista);
    st.botones.resolver.addEventListener('click', resolver);
    st.botones.otro.addEventListener('click', nuevo);
    nuevo();
  }

  function montaEmparejar(el) {
    const st = armazon(el, 'Une cada etiqueta o atributo con lo que hace. Las funciones están desordenadas.');
    let juego = null, pares = [], opciones = [];
    function nuevo() {
      juego = eligeOtro(AW.bancos.emparejar, juego);
      pares = baraja(juego.pares.map((p, i) => ({ izq: p[0], i })));
      opciones = baraja(juego.pares.map((p, i) => ({ txt: p[1], i })));
      st.cuerpo.innerHTML = '<p class="ej-caso-titulo">' + esc(juego.titulo) + '</p><ol class="ej-pares">' + pares.map((p, k) =>
        '<li class="ej-par par-ancho"><span class="ej-par-num">' + (k + 1) + '</span><span class="ej-par-texto"><code>' + esc(p.izq) + '</code></span>' +
        '<select class="ej-select e' + k + '"><option value="">Función…</option>' + opciones.map((o) => '<option value="' + o.i + '">' + esc(o.txt) + '</option>').join('') + '</select></li>').join('') + '</ol>';
      st.nuevo();
    }
    const sel = (k) => st.cuerpo.querySelector('select.e' + k);
    const marca = (s, clase) => { s.classList.remove('ok', 'ko', 'pista'); s.classList.add(clase); };
    function comprobar() {
      let mal = 0, vacios = 0;
      pares.forEach((p, k) => { const s = sel(k); if (s.value === '') { vacios++; marca(s, 'ko'); return; } const ok = +s.value === p.i; marca(s, ok ? 'ok' : 'ko'); if (!ok) mal++; });
      if (!mal && !vacios) st.acierto('Correcto: las seis parejas.');
      else st.fallo((vacios ? vacios + ' sin elegir. ' : '') + (mal ? mal + ' mal. ' : '') + 'Piensa qué hace cada una en una página real.');
    }
    function pista() {
      const k = pares.findIndex((p, idx) => +sel(idx).value !== p.i);
      if (k < 0) { st.mensaje('Ya está todo bien.', 'ok'); return; }
      st.ayuda(); const s = sel(k); s.value = String(pares[k].i); marca(s, 'pista');
      st.mensaje(pares[k].izq + ': ' + juego.pares[pares[k].i][1] + '.');
    }
    function resolver() { st.ayuda(); st.resuelto = true; pares.forEach((p, k) => { const s = sel(k); s.value = String(p.i); marca(s, 'ok'); }); st.mensaje('Resuelto. Cambia de juego con «Otro ejercicio».'); }
    st.botones.comprobar.addEventListener('click', comprobar);
    st.botones.pista.addEventListener('click', pista);
    st.botones.resolver.addEventListener('click', resolver);
    st.botones.otro.addEventListener('click', nuevo);
    nuevo();
  }

  AW.montadores = { completar: montaCompletar, ordenar: montaOrdenar, error: montaError, emparejar: montaEmparejar };
  function montaEjercicio(el) {
    const m = AW.montadores[el.dataset.tipo];
    if (!m) { el.textContent = 'Tipo de ejercicio pendiente: ' + el.dataset.tipo; return; }
    m(el);
  }

  /* ---------- quiz de opción múltiple ---------- */
  function montaQuiz(q) {
    const correcta = parseInt(q.dataset.correct, 10);
    const opts = [...q.querySelectorAll('.quiz-opt')];
    const fb = q.querySelector('.quiz-fb');
    const inicial = fb ? fb.textContent : '';
    const reset = () => {
      q.removeAttribute('data-answered');
      opts.forEach((o) => o.classList.remove('correct', 'wrong'));
      if (fb) fb.textContent = inicial;
    };
    opts.forEach((o, i) => o.addEventListener('click', () => {
      if (q.hasAttribute('data-answered')) return;
      q.setAttribute('data-answered', '');
      opts[correcta].classList.add('correct');
      if (i !== correcta) o.classList.add('wrong');
      if (fb) fb.textContent = i === correcta ? (q.dataset.ok || 'Correcto.') : (q.dataset.ko || 'Incorrecto.');
    }));
    const r = q.querySelector('.quiz-reset');
    if (r) r.addEventListener('click', reset);
  }

  /* ---------- panel que se revela (pregunta a la clase) ---------- */
  function montaRevela(r) {
    const btn = r.querySelector('.revela-btn');
    const textoVer = btn ? btn.textContent : 'Revelar';
    const pon = (v) => {
      r.toggleAttribute('data-revelado', v);
      if (btn) btn.textContent = v ? 'Ocultar' : textoVer;
    };
    if (btn) btn.addEventListener('click', (e) => { e.stopPropagation(); pon(!r.hasAttribute('data-revelado')); });
    r.addEventListener('click', () => { if (!r.hasAttribute('data-revelado')) pon(true); });
  }

  /* ---------- visor a pantalla completa para las fotos ---------- */
  function abreVisor(fig) {
    const img = fig.querySelector('img');
    const cred = fig.querySelector('.credito');
    const v = document.createElement('div');
    v.className = 'visor';
    v.innerHTML = '<img alt=""><div class="visor-pie"></div><button class="visor-cerrar" aria-label="Cerrar">×</button>';
    v.querySelector('img').src = img.dataset.grande || img.currentSrc || img.src;   // data-grande: versión completa distinta de la miniatura
    v.querySelector('img').alt = img.alt;
    const tarjeta = fig.classList.contains('tarjeta');
    if (tarjeta) v.classList.add('visor-tarjeta');
    const pie = cred ? (tarjeta ? (cred.querySelector('small') || cred).innerHTML : cred.innerHTML) : '';
    if (pie) v.querySelector('.visor-pie').innerHTML = pie; else v.querySelector('.visor-pie').remove();
    const cierra = () => { v.remove(); document.removeEventListener('keydown', tecla, true); };
    const tecla = (e) => { if (e.key === 'Escape') { e.stopPropagation(); cierra(); } };
    v.addEventListener('click', (e) => { if (!e.target.closest('a')) cierra(); });
    document.addEventListener('keydown', tecla, true);
    document.body.appendChild(v);
  }
  function montaFoto(fig) {
    const img = fig.querySelector('img');
    if (!img) return;
    img.addEventListener('click', (e) => { e.stopPropagation(); abreVisor(fig); });
  }

  /* ---------- galería: varias fotos en el mismo hueco ---------- */
  function montaGaleria(g) {
    const figs = [...g.querySelectorAll(':scope > .foto')];
    if (figs.length < 2) return;
    const marco = document.createElement('div');
    marco.className = 'galeria-marco';
    figs.forEach((f) => marco.appendChild(f));
    const abajo = document.createElement('div');
    abajo.className = 'galeria-abajo';
    abajo.innerHTML = '<p class="galeria-pie"></p><div class="galeria-nav"><button type="button" aria-label="Foto anterior">‹</button><span class="galeria-cont"></span><button type="button" aria-label="Foto siguiente">›</button></div>';
    g.append(marco, abajo);
    const pie = abajo.querySelector('.galeria-pie');
    const cont = abajo.querySelector('.galeria-cont');
    const [ant, sig] = abajo.querySelectorAll('button');
    const sec = g.closest('section');
    const saltos = sec ? [...sec.querySelectorAll('[data-ir]')] : [];
    let i = 0;
    const muestra = (n) => {
      i = (n + figs.length) % figs.length;
      figs.forEach((f, k) => f.classList.toggle('activa', k === i));
      pie.innerHTML = figs[i].dataset.pie || '';
      cont.textContent = (i + 1) + ' / ' + figs.length;
      saltos.forEach((s) => s.classList.toggle('activa', Number(s.dataset.ir) === i + 1));
    };
    ant.addEventListener('click', (e) => { e.stopPropagation(); muestra(i - 1); });
    sig.addEventListener('click', (e) => { e.stopPropagation(); muestra(i + 1); });
    saltos.forEach((s) => s.addEventListener('click', (e) => { e.stopPropagation(); muestra(Number(s.dataset.ir) - 1); }));
    muestra(0);
  }

  /* ---------- numeración ---------- */
  function numera(stage) {
    const secs = [...stage.querySelectorAll(':scope > section')];
    secs.forEach((s, i) => {
      if (s.querySelector('[data-slide-num]')) return;
      const n = document.createElement('span');
      n.setAttribute('data-slide-num', '');
      n.textContent = String(i + 1).padStart(2, '0') + ' / ' + secs.length;
      if (getComputedStyle(s).position === 'static') s.style.position = 'relative';
      s.appendChild(n);
    });
  }

  function init() {
    const stage = document.querySelector('deck-stage');
    if (!stage) return;
    numera(stage);
    document.querySelectorAll('pre.cod[data-lang]').forEach(montaCodigo);
    document.querySelectorAll('.resultado[data-codigo]').forEach(montaResultado);
    document.querySelectorAll('.ej[data-tipo]').forEach(montaEjercicio);
    document.querySelectorAll('.quiz').forEach(montaQuiz);
    document.querySelectorAll('.revela').forEach(montaRevela);
    document.querySelectorAll('.galeria').forEach(montaGaleria);
    document.querySelectorAll('.foto').forEach(montaFoto);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
