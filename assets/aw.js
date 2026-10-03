/* Motor común de las presentaciones de Aplicaciones Web (0228).
 *
 *  1. Numera las diapositivas ("03 / 51").
 *  2. Quiz de opción múltiple:
 *       <div class="quiz" data-correct="1" data-ok="..." data-ko="...">
 *         <p class="quiz-fb">Selecciona una opción.</p>
 *         <div class="quiz-opts"> <button class="quiz-opt">…</button> … </div>
 *         <button class="btn btn-ghost quiz-reset">Reiniciar</button>
 *       </div>
 *     Con data-preguntas="clave" se añade «Otra pregunta», que pasa por las de AW.preguntas.clave.
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
 *     Con data-real en el <pre>, el resultado ejecuta ese código en vez del visible (URL recortadas con «…»).
 *  7. Ejercicios interactivos con Comprobar, Pista, Resolver y Otro ejercicio:
 *       <div class="ej" data-tipo="…" data-banco="…" data-tipos="…" data-enunciado="…"></div>
 *     Tipos: completar, ordenar, error, emparejar (UT1) y selector (UT2). data-banco elige otro banco
 *     de AW.bancos (por ejemplo completarCss), data-tipos otra lista de tipos de error (tiposErrorCss)
 *     y data-enunciado otro texto de cabecera. El armazón (botones, racha, mensajes) es común.
 *  8. Notas del profesor: cada sección lleva un <aside class="notas">…</aside> como primer hijo
 *     (HTML, oculto por CSS). La tecla N abre assets/notas.html en una ventana aparte con las
 *     notas de la diapositiva actual; se actualiza al cambiar de diapositiva.
 *  9. Buscador dentro de la unidad: la tecla B (o el botón «Buscar» de la barra flotante) abre un panel
 *     que busca en el rótulo y el texto visible de las diapositivas de esta presentación, sin las notas.
 * 10. Chuleta de etiquetas (<section class="chuleta">, estilos en aw.css): colorea el código de cada
 *     fila y monta el botón «Modo repaso» (.ch-repaso), que difumina las explicaciones de todas las
 *     chuletas; pasar el ratón o pulsar una fila la descubre. Con data-ch="css", chuleta de CSS (UT2).
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
    return span('punc', m[1]) + span('tag', m[2]) + resaltaAtributos(m[3]) + span('punc', m[4]);
  }
  function resaltaAtributos(attrs) {
    // attrs: ' href="x" download' (también sueltos, como en la chuleta)
    let out = '';
    const re = /([^\s=]+)(\s*=\s*)("(?:[^"]*)"|'(?:[^']*)'|[^\s>]+)|(\S+)/g;
    let i = 0, a;
    while ((a = re.exec(attrs))) {
      out += esc(attrs.slice(i, a.index)); i = re.lastIndex;
      if (a[1]) out += span('attr', a[1]) + span('punc', a[2]) + span('str', a[3]);
      else out += span('attr', a[4]);
    }
    return out + esc(attrs.slice(i));
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
    // data-real: el código completo cuando el visible va abreviado (una URL recortada con «…») o lleva
    // estilos de presentación que no se enseñan
    const src = pre.dataset.real !== undefined ? pre.dataset.real : pre.dataset.src !== undefined ? pre.dataset.src : pre.textContent;
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
    { cod: '<a href="https://ejemplo.es" ___="_blank">\n  Abrir en pestaña nueva</a>', ok: ['target'], pista: 'Dónde se abre el enlace.', fam: 'enlaces' },
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
    { lineas: ['<p>¿A qué juegas?</p>', '<input type="checkbox" id="parchis"> Parchís', '<button>Enviar</button>'], linea: 1, tipos: [7], exp: 'La casilla lleva id, pero le falta name, que es lo que viaja al servidor: name="juegos" y su value.' },
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

  /* ---------- bancos de CSS (UT2) ----------
     Se eligen desde la diapositiva con data-banco="completarCss" (y data-tipos="tiposErrorCss" en el de errores). */

  AW.bancos.completarCss = [
    { cod: '<link rel="___" href="estilos.css">', ok: ['stylesheet'], pista: 'Dice qué relación tiene el archivo con la página: es una hoja de estilo.', fam: 'enlazar la hoja' },
    { cod: '<link rel="stylesheet" ___="estilos.css">', ok: ['href'], pista: 'La ruta del archivo, como en los enlaces.', fam: 'enlazar la hoja' },
    { cod: 'h1 {\n  ___: #041c3f;\n}', ok: ['color'], pista: 'El color del texto.', fam: 'colores' },
    { cod: 'body {\n  ___: #fefefe;\n}', ok: ['background-color', 'background'], pista: 'El color de fondo.', fam: 'colores' },
    { cod: 'body {\n  ___: "Segoe UI", system-ui, sans-serif;\n}', ok: ['font-family'], pista: 'La pila de tipos de letra.', fam: 'tipografía' },
    { cod: 'h1 {\n  font-size: 2.5___;\n}', ok: ['rem', 'em'], pista: 'Unidad relativa al tamaño de letra de la raíz.', fam: 'unidades' },
    { cod: '.tarjeta {\n  ___: 1rem 2rem;\n}', ok: ['padding', 'margin'], pista: 'Espacio entre el contenido y el borde, dentro de la caja.', fam: 'caja' },
    { cod: 'main {\n  max-width: 60rem;\n  margin: 0 ___;\n}', ok: ['auto'], pista: 'El valor que reparte el margen y centra la caja.', fam: 'caja' },
    { cod: '.tarjeta {\n  border-___: 12px;\n}', ok: ['radius'], pista: 'Redondea las esquinas.', fam: 'caja' },
    { cod: '* {\n  ___: border-box;\n}', ok: ['box-sizing'], pista: 'Hace que el ancho incluya relleno y borde.', fam: 'caja' },
    { cod: 'img {\n  ___: 100%;\n  height: auto;\n}', ok: ['max-width', 'width'], pista: 'Que la imagen nunca desborde su caja.', fam: 'imágenes' },
    { cod: 'nav ul {\n  display: ___;\n  gap: 1rem;\n}', ok: ['flex'], pista: 'Coloca a los hijos en fila.', fam: 'flexbox' },
    { cod: 'header {\n  display: flex;\n  ___: space-between;\n}', ok: ['justify-content'], pista: 'Reparte el espacio en el eje principal.', fam: 'flexbox' },
    { cod: '.centro {\n  display: flex;\n  justify-content: center;\n  ___: center;\n}', ok: ['align-items'], pista: 'Alinea en el eje cruzado.', fam: 'flexbox' },
    { cod: 'nav ul {\n  display: flex;\n  ___: 1.5rem;\n}', ok: ['gap'], pista: 'El hueco entre los hijos.', fam: 'flexbox' },
    { cod: 'nav ul {\n  ___: none;\n  padding: 0;\n}', ok: ['list-style', 'list-style-type'], pista: 'Quita las viñetas de la lista.', fam: 'listas' },
    { cod: 'nav a {\n  ___: none;\n}', ok: ['text-decoration'], pista: 'Quita el subrayado del enlace.', fam: 'texto' },
    { cod: 'nav a___ {\n  background: #041c3f;\n}', ok: [':hover', 'hover'], pista: 'Cuando el ratón está encima.', fam: 'estados' },
    { cod: 'nav a {\n  ___: background-color .2s;\n}', ok: ['transition'], pista: 'Suaviza el cambio de un valor.', fam: 'estados' },
    { cod: 'table {\n  ___: collapse;\n}', ok: ['border-collapse'], pista: 'Une los bordes de las celdas en uno solo.', fam: 'tablas' },
    { cod: 'tbody tr:nth-child(___) {\n  background: #e3ecf3;\n}', ok: ['even', '2n'], pista: 'Las filas pares.', fam: 'tablas' },
    { cod: 'body {\n  display: ___;\n  grid-template-areas: "header" "main";\n}', ok: ['grid'], pista: 'Filas y columnas a la vez.', fam: 'grid' },
    { cod: '@___ (min-width: 48rem) {\n  body { grid-template-columns: 2fr 1fr; }\n}', ok: ['media'], pista: 'Reglas que solo se aplican a partir de un ancho.', fam: 'responsive' },
    { cod: 'nav {\n  position: ___;\n  top: 0;\n}', ok: ['sticky'], pista: 'Normal hasta que llega al borde; entonces se queda pegado.', fam: 'posición' },
    { cod: ':root {\n  --acento: #a5e070;\n}\nh2 {\n  color: ___(--acento);\n}', ok: ['var'], pista: 'La función que lee una variable.', fam: 'variables' }
  ];

  AW.tiposErrorCss = [
    'Falta el punto y coma',
    'Falta una llave { o }',
    'Clase sin el punto o id sin la almohadilla',
    'Propiedad mal escrita',
    'Valor sin unidad o unidad separada',
    'Color mal escrito',
    'El link no enlaza la hoja: falta rel o la ruta no coincide',
    'Propiedad de flexbox o grid en el elemento equivocado',
    'Media query mal escrita',
    'Seudoclase mal escrita'
  ];
  AW.bancos.errorCss = [
    { lineas: ['h1 {', '  color: #041c3f', '  font-size: 2rem;', '}'], linea: 1, tipos: [0], exp: 'Sin el punto y coma, el navegador lee «#041c3f font-size: 2rem» como un solo valor y descarta las dos declaraciones.' },
    { lineas: ['th {', '  background: #a5e070', '  color: #041c3f;', '}'], linea: 1, tipos: [0], exp: 'Falta el punto y coma tras el color de fondo: se pierde también el color del texto.' },
    { lineas: ['nav a', '  color: white;', '  text-decoration: none;', '}'], linea: 0, tipos: [1], exp: 'Falta la llave de apertura después del selector.' },
    { lineas: ['<p class="destacado">Novedad</p>', '', 'destacado {', '  font-weight: 700;', '}'], linea: 2, tipos: [2], exp: 'Sin el punto, «destacado» busca una etiqueta llamada así, que no existe. Es .destacado.' },
    { lineas: ['<div id="ficha">…</div>', '', '.ficha {', '  border: 1px solid #d6e0ea;', '}'], linea: 2, tipos: [2], exp: 'El elemento tiene id, no clase: el selector es #ficha.' },
    { lineas: ['h1 {', '  font-sise: 2rem;', '}'], linea: 1, tipos: [3], exp: 'La propiedad es font-size. El navegador ignora las que no conoce, sin avisar.' },
    { lineas: ['h2 {', '  colour: #017ce9;', '}'], linea: 1, tipos: [3], exp: 'La propiedad es color, con la grafía americana.' },
    { lineas: ['main {', '  max-width: 60;', '  margin: 0 auto;', '}'], linea: 1, tipos: [4], exp: 'Todo tamaño distinto de 0 lleva unidad: 60rem, 60%, 60px.' },
    { lineas: ['button {', '  padding: 0.75 rem 1.5rem;', '}'], linea: 1, tipos: [4], exp: 'Número y unidad van juntos: 0.75rem. Con espacio son dos valores.' },
    { lineas: ['header {', '  background: #041c3;', '}'], linea: 1, tipos: [5], exp: 'Un color hexadecimal tiene 3 o 6 dígitos (u 8 con transparencia); 5 no vale.' },
    { lineas: ['<head>', '  <link href="estilos.css">', '</head>'], linea: 1, tipos: [6], exp: 'Sin rel="stylesheet" el navegador no sabe que ese archivo es una hoja de estilo.' },
    { lineas: ['<link rel="stylesheet" href="css/Estilos.css">', '<!-- el archivo es estilos.css, junto a index.html -->'], linea: 0, tipos: [6], exp: 'La ruta tiene una carpeta que no existe y una mayúscula: en el servidor no coincide.' },
    { lineas: ['nav ul {', '  list-style: none;', '}', 'nav li {', '  justify-content: space-between;', '}'], linea: 4, tipos: [7], exp: 'justify-content se pone en el contenedor flex (nav ul con display: flex), no en los hijos.' },
    { lineas: ['.galeria img {', '  display: grid;', '  grid-template-columns: 1fr 1fr;', '}'], linea: 1, tipos: [7], exp: 'La rejilla se declara en el contenedor (.galeria); las imágenes son los elementos que se colocan.' },
    { lineas: ['@media min-width: 48rem {', '  body { grid-template-columns: 2fr 1fr; }', '}'], linea: 0, tipos: [8], exp: 'La condición va entre paréntesis: @media (min-width: 48rem).' },
    { lineas: ['nav a: hover {', '  background: #041c3f;', '}'], linea: 0, tipos: [9], exp: 'La seudoclase va pegada al selector, sin espacio: a:hover. Con espacio busca un descendiente.' }
  ];

  AW.bancos.emparejarCss = [
    { titulo: 'Caja y texto', pares: [
      ['padding', 'Espacio entre el contenido y el borde, dentro de la caja'],
      ['margin', 'Separación con las cajas de al lado, fuera del borde'],
      ['border-radius', 'Redondea las esquinas de la caja'],
      ['font-family', 'Tipo de letra, con su pila de reserva'],
      ['line-height', 'Altura de cada línea de texto'],
      ['box-sizing: border-box', 'El ancho incluye relleno y borde'] ] },
    { titulo: 'Flexbox y grid', pares: [
      ['display: flex', 'Coloca a los hijos en una fila o en una columna'],
      ['justify-content', 'Reparte el espacio sobrante en el eje principal'],
      ['align-items', 'Alinea los hijos en el eje cruzado'],
      ['gap', 'Hueco entre los hijos, sin márgenes'],
      ['grid-template-columns', 'Cuántas columnas hay y de qué ancho'],
      ['grid-template-areas', 'Dibuja la maqueta con nombres de zona'] ] },
    { titulo: 'Responsive, estados y posición', pares: [
      ['@media (min-width: 48rem)', 'Reglas que se aplican solo a partir de ese ancho'],
      ['max-width', 'La caja crece hasta ahí y se encoge si no cabe'],
      [':hover', 'Cuando el ratón está encima del elemento'],
      ['transition', 'Suaviza el cambio de un valor'],
      ['position: sticky', 'Se queda pegado al llegar al borde de la ventana'],
      ['z-index', 'Qué caja queda encima cuando se solapan'] ] },
    { titulo: 'Selectores', pares: [
      ['.aviso', 'Los elementos con esa clase'],
      ['#ficha', 'El elemento con ese id, único en la página'],
      ['nav a', 'Los enlaces dentro de nav, a cualquier nivel'],
      ['ul > li', 'Solo los hijos directos'],
      ['h1, h2', 'Los dos elementos, con la misma regla'],
      ['*', 'Todos los elementos'] ] }
  ];

  // selector: HTML de pocas líneas, líneas objetivo (desde 0) y cuatro selectores; el acierto se calcula
  // de verdad con querySelectorAll sobre el fragmento, así que solo uno debe alcanzar justo el objetivo
  AW.bancos.selector = [
    { html: ['<nav>', '  <ul>', '    <li><a href="#que-es">Qué es</a></li>', '    <li><a href="#ficha" class="activo">Ficha</a></li>', '  </ul>', '</nav>', '<p>Lee <a href="#">más</a>.</p>'], objetivo: [3], opciones: ['nav .activo', 'nav a', '#activo', 'a .activo'], pista: 'El enlace lleva una clase; combínala con nav.' },
    { html: ['<table id="ficha">', '  <tr>', '    <th>Versión</th>', '    <td>1.4</td>', '  </tr>', '</table>'], objetivo: [2], opciones: ['th', 'td', '#ficha *', 'tr'], pista: 'Es una celda de cabecera.' },
    { html: ['<header>', '  <h1>SuperTuxKart</h1>', '  <p>¿El mejor juego?</p>', '</header>', '<main>', '  <p>Es un juego libre.</p>', '</main>'], objetivo: [2], opciones: ['header p', 'p', 'main p', 'header > h1'], pista: 'Solo el párrafo de la cabecera: descendiente.' },
    { html: ['<ul class="menu">', '  <li>Inicio</li>', '  <li class="activo">Ficha</li>', '  <li>Opinión</li>', '</ul>'], objetivo: [2], opciones: ['.activo', 'li', 'activo', '.menu'], pista: 'Selector de clase.' },
    { html: ['<form>', '  <input type="text" name="nombre">', '  <input type="email" name="correo">', '  <button>Enviar</button>', '</form>'], objetivo: [2], opciones: ['input[type="email"]', 'input', 'form > button', 'email'], pista: 'Selector de atributo.' },
    { html: ['<section id="personajes">', '  <h3>Personajes</h3>', '  <ul>', '    <li>Tux</li>', '    <li>Gnu</li>', '  </ul>', '</section>'], objetivo: [3, 4], opciones: ['#personajes li', 'personajes li', '#personajes > li', 'ul'], pista: 'Los li no son hijos directos de la sección.' },
    { html: ['<p>Texto normal.</p>', '<p class="destacado">Texto destacado.</p>', '<div class="destacado">Aviso.</div>'], objetivo: [1], opciones: ['p.destacado', '.destacado', 'p', 'p .destacado'], pista: 'Elemento y clase, pegados.' },
    { html: ['<footer>', '  <p>Autor: <a href="mailto:x@x.es">Raúl</a></p>', '  <p>© 2026</p>', '</footer>'], objetivo: [1], opciones: ['footer a', 'footer p', 'a footer', 'footer'], pista: 'El enlace que está dentro del pie.' },
    { html: ['<h1>Título</h1>', '<h2>Sección</h2>', '<h3>Apartado</h3>', '<p>Texto</p>'], objetivo: [0, 1, 2], opciones: ['h1, h2, h3', 'h1 h2 h3', 'h', '*'], pista: 'Agrupación con comas.' },
    { html: ['<nav>', '  <ul>', '    <li><a href="#">Qué es</a></li>', '    <li><a href="#">Ficha</a></li>', '  </ul>', '</nav>'], objetivo: [1], opciones: ['nav ul', 'nav li', 'nav *', 'nav'], pista: 'La lista, no sus elementos.' },
    { html: ['<article>', '  <h2>Noticia</h2>', '  <p>Primer párrafo.</p>', '  <p>Segundo párrafo.</p>', '</article>'], objetivo: [2], opciones: ['article p:first-of-type', 'article p', 'article > p:first-child', 'p'], pista: 'El primer párrafo de su tipo; el primer hijo es el h2.' },
    { html: ['<table>', '  <tr><td>1</td></tr>', '  <tr><td>2</td></tr>', '  <tr><td>3</td></tr>', '  <tr><td>4</td></tr>', '</table>'], objetivo: [2, 4], opciones: ['tr:nth-child(even)', 'tr:nth-child(odd)', 'tr', 'tr:even'], pista: 'Las filas pares: nth-child.' },
    { html: ['<aside>', '  <h2>Capturas</h2>', '  <figure>', '    <img src="stk1.jpg" alt="Circuito">', '    <figcaption>Circuito</figcaption>', '  </figure>', '</aside>'], objetivo: [3], opciones: ['aside img', 'figure', 'aside figcaption', 'img figure'], pista: 'La imagen dentro del lateral.' },
    { html: ['<a href="#" class="boton">Ver</a>', '<a href="#" class="boton grande">Descargar</a>', '<button class="grande">Enviar</button>'], objetivo: [1], opciones: ['.boton.grande', '.boton', '.grande', '.boton .grande'], pista: 'Dos clases en el mismo elemento se encadenan sin espacio.' },
    { html: ['<div id="ficha">', '  <p>Versión 1.4</p>', '</div>', '<div class="ficha">', '  <p>Otra ficha</p>', '</div>'], objetivo: [0], opciones: ['#ficha', '.ficha', 'ficha', 'div'], pista: 'Almohadilla para el id.' },
    { html: ['<main>', '  <h2>Qué es</h2>', '  <p>Texto</p>', '  <h2>Personajes</h2>', '</main>'], objetivo: [1, 3], opciones: ['main h2', 'main > p', 'h2 main', 'main *'], pista: 'Los dos encabezados de main.' }
  ];

  /* ---------- preguntas de repaso de los quiz («Otra pregunta») ----------
     Un quiz con data-preguntas="clave" pasa por las preguntas de AW.preguntas.clave, sobre lo visto
     justo antes. p: enunciado; o: opciones; c: índice de la correcta (desde 0); exp: explicación, que
     sale al responder, se acierte o no. Lo que va entre `acentos graves` se pinta como código.
     cod (opcional): código que se enseña en la ventana del quiz; lang: html (defecto) o css. */
  AW.preguntas = AW.preguntas || {};

  // UT1 · 1.1 Internet y la web (diapositiva 18)
  AW.preguntas.peticion = [
    { p: '¿Qué es una aplicación web?', o: ['Un programa al que se accede desde el navegador, sin instalar nada', 'Un programa que se instala en el ordenador', 'Cualquier app que se descarga en el móvil', 'Una página hecha solo con HTML'], c: 0, exp: 'Se usa desde el navegador, a través de una red, sin instalar nada en el equipo: el correo web, Classroom, un gestor de contenidos.' },
    { p: '¿Es lo mismo Internet que la web?', o: ['Sí, son dos nombres de lo mismo', 'No: la web es uno de los servicios que funcionan sobre Internet', 'No: Internet es uno de los servicios de la web', 'Sí, desde que existe HTTPS'], c: 1, exp: 'Internet es la infraestructura: cables, routers y protocolos. La web es uno de sus servicios, como el correo.' },
    { p: '¿Quién puso en marcha la web, y dónde?', o: ['Tim Berners-Lee, en el CERN, en 1990', 'ARPANET, en cuatro universidades, en 1969', 'Google, en 1998', 'Microsoft, con Internet Explorer, en 1995'], c: 0, exp: 'Tim Berners-Lee la propuso en el CERN en 1989 y la puso en marcha en diciembre de 1990. ARPANET, de 1969, es el origen de Internet, no de la web.' },
    { p: 'HTML y HTTP, ¿en qué se diferencian?', o: ['Son lo mismo con otro nombre', 'HTTP es la versión nueva de HTML', 'HTML es el lenguaje de la página; HTTP, el protocolo para pedirla', 'HTML cifra lo que envía HTTP'], c: 2, exp: 'HTML es el lenguaje en que se escribe la página; HTTP, el protocolo con que el navegador se la pide al servidor. Es la confusión típica del examen.' },
    { p: '¿Qué añade HTTPS a HTTP?', o: ['Más velocidad', 'Cifrado: el candado del navegador', 'Imágenes y vídeo', 'Nada, es otro nombre'], c: 1, exp: 'HTTPS es HTTP cifrado con TLS. Hoy es lo normal y los navegadores avisan si falta.' },
    { p: 'En una URL, ¿qué parte no llega al servidor?', o: ['Lo que va tras `#`, el fragmento', 'Lo que va tras `?`, la consulta', 'El dominio', 'La ruta de carpetas'], c: 0, exp: 'Lo que va tras # es un punto dentro de la página y solo lo usa el navegador. Lo que va tras ? son datos para el servidor.' },
    { p: 'El servidor responde con un 404. ¿Qué ha pasado?', o: ['Todo ha ido bien', 'No encuentra esa página: dirección mal escrita o página borrada', 'No tienes permiso para verla', 'El programa del servidor ha fallado'], c: 1, exp: '404 Not Found: el servidor no encuentra el recurso. 200 es éxito, 403 es sin permiso y 500, un fallo del servidor.' },
    { p: 'Un error 500, ¿de quién es la culpa?', o: ['Del navegador', 'De una dirección mal escrita', 'Del programa del servidor', 'De tu conexión a Internet'], c: 2, exp: '500 Internal Server Error: el programa del servidor ha fallado al generar la página. Los 4xx son errores del cliente; los 5xx, del servidor.' },
    { p: '¿Por qué hoy se usa SSH y no Telnet para administrar un servidor?', o: ['SSH es más rápido', 'Telnet enviaba usuario y contraseña sin cifrar', 'Telnet solo funciona en Windows', 'SSH no necesita Internet'], c: 1, exp: 'Telnet mandaba todo en claro, contraseña incluida; SSH cifra. Lo mismo pasa con FTP y SFTP.' },
    { p: 'Tu correo, tu banco o Classroom, que piden iniciar sesión, forman parte de…', o: ['La surface web', 'La deep web', 'La dark web', 'Ninguna: no son web'], c: 1, exp: 'La deep web es lo que los buscadores no indexan porque hace falta iniciar sesión. Es la mayor parte de la web y es legítima. A la dark web solo se llega con software como Tor.' },
    { p: 'Pulsas F12 y abres la pestaña Red. ¿Qué ves al recargar?', o: ['El HTML de la página con colores', 'Tus contraseñas guardadas', 'Cada archivo que ha viajado, con su código de estado', 'Los avisos del antivirus'], c: 2, exp: 'La pestaña Red (Network) enseña cada petición: el archivo, su código de estado, su tipo y su tamaño.' }
  ];

  // UT1 · 1.3 HTML: estructura y texto (diapositiva 49)
  AW.preguntas.html = [
    { p: '¿Qué tipo de lenguaje es HTML?', o: ['De programación', 'De marcas: etiquetas que dicen qué es cada cosa', 'De estilos', 'De bases de datos'], c: 1, exp: 'HTML marca qué es cada cosa: un título, un párrafo, un enlace. No toma decisiones, así que no es un lenguaje de programación.' },
    { p: '¿Qué lenguaje decide cómo se ve la página: colores, letra, columnas?', o: ['HTML', 'CSS', 'JavaScript', 'HTTP'], c: 1, exp: 'HTML dice qué hay; CSS, cómo se ve; JavaScript, qué hace. CSS llega en la unidad 2.' },
    { p: '¿Qué va dentro del `<head>`?', o: ['Lo que se ve: títulos y párrafos', 'Lo que no se ve: charset, title, description', 'Solo el `<h1>`', 'Los comentarios'], c: 1, exp: 'El head lleva los datos de la página que no se pintan. Lo que se ve va en el body.' },
    { p: '¿Para qué sirve `<meta charset="utf-8">`?', o: ['Para que el móvil no encoja la página', 'Para que se vean bien las tildes y las eñes', 'Para el título de la pestaña', 'Para el idioma de la página'], c: 1, exp: 'Es la codificación y va siempre. El móvil es cosa del viewport; la pestaña, del title; el idioma, del lang.' },
    { p: '¿Dónde se indica el idioma de la página?', o: ['`<html lang="es">`', '`<meta charset="es">`', '`<body idioma="es">`', '`<title>es</title>`'], c: 0, exp: 'Con el atributo lang de la etiqueta html. Lo usan los buscadores y los lectores de pantalla.' },
    { p: '¿Cuál está bien anidado?', o: ['`<p><strong>así</strong></p>`', '`<p><strong>así</p></strong>`', '`<strong><p>así</strong></p>`', '`<p><strong>así</p>`'], c: 0, exp: 'Lo último que se abre es lo primero que se cierra: primero </strong> y luego </p>.' },
    { p: 'Escribes diez espacios seguidos entre dos palabras de un párrafo. ¿Qué se ve?', o: ['Diez espacios', 'Un espacio', 'Un salto de línea', 'Un error'], c: 1, exp: 'Los espacios y los saltos de línea se colapsan en uno. Para separar párrafos, <p>; para un salto, <br>.' },
    { p: '¿Cuál es un elemento vacío, sin contenido ni etiqueta de cierre?', o: ['`<p>`', '`<br>`', '`<h1>`', '`<a>`'], c: 1, exp: 'br, hr, img, meta e input no tienen contenido ni cierre.' },
    { p: 'Después del `<h1>`, ¿qué encabezado toca para las secciones?', o: ['Otro `<h1>`', '`<h2>`', '`<h3>`', 'Da igual: solo cambia el tamaño'], c: 1, exp: 'Sin saltarse niveles: h1 es el título, h2 las secciones y h3 lo que va dentro de ellas.' },
    { p: '¿Cómo separas dos párrafos?', o: ['Con dos `<br>`', 'Con un `<p>` para cada uno', 'Con un `<hr>`', 'Con una línea en blanco en el código'], c: 1, exp: 'Cada párrafo en su <p>. <br> es un salto dentro del párrafo, <hr> un cambio de tema, y las líneas en blanco del código no se ven.' },
    { p: 'Tu página tiene un error de HTML. ¿Qué hace el navegador?', o: ['Enseña un mensaje de error', 'No carga la página', 'Ignora lo que no entiende y pinta lo que puede', 'Lo corrige en tu archivo'], c: 2, exp: 'El navegador no avisa: una página con errores puede verse casi bien. Por eso se pasa por el validador.' },
    { p: 'Lo que escribes en un comentario `<!-- -->`…', o: ['Se ve en gris en la página', 'No se ve en la página, pero sí en «ver código fuente»', 'No lo puede ver nadie', 'Solo se ve en el móvil'], c: 1, exp: 'El comentario no se pinta, pero viaja con el HTML y cualquiera lo lee en el código fuente. Nada privado.' },
    { p: 'En esta línea, ¿qué es `href`?', cod: '<a href="https://www.rae.es">Diccionario</a>', o: ['El contenido', 'Un atributo', 'La etiqueta de cierre', 'Un elemento vacío'], c: 1, exp: 'Un atributo: nombre="valor", dentro de la etiqueta de apertura y con comillas. «Diccionario» es el contenido.' }
  ];

  // UT1 · 1.7 Formularios (diapositiva 78)
  AW.preguntas.formularios = [
    { p: '¿Qué atributo del `<form>` dice a dónde van los datos?', o: ['`action`', '`method`', '`name`', '`href`'], c: 0, exp: 'action es a dónde; method, cómo: GET o POST.' },
    { p: '¿Qué indica el atributo `method` del formulario?', o: ['A dónde van los datos', 'Cómo se envían: GET o POST', 'El tipo de cada campo', 'El texto del botón'], c: 1, exp: 'method es cómo se envían; action, a dónde.' },
    { p: 'Con `<label for="correo">`, ¿qué consigues?', o: ['Que el correo se envíe', 'Conectar la etiqueta con el campo que tiene `id="correo"`', 'Que el campo sea obligatorio', 'Que el navegador compruebe la @'], c: 1, exp: 'for apunta al id del campo: el texto se hace clicable y el lector de pantalla sabe qué es ese campo.' },
    { p: '¿Qué `type` oculta lo que se escribe?', o: ['`password`', '`hidden`', '`text`', '`secret`'], c: 0, exp: 'password enseña puntos en lugar de letras. hidden es otra cosa: un campo que no se ve en absoluto.' },
    { p: '¿Qué hace `required`?', o: ['No deja enviar el campo vacío: el navegador avisa', 'Pone el cursor en ese campo', 'Pone un texto de ejemplo en gris', 'Guarda lo escrito para la próxima vez'], c: 0, exp: 'required obliga a rellenar el campo. El cursor es autofocus y el texto de ejemplo, placeholder.' },
    { p: '¿Por qué `placeholder` no sustituye al `<label>`?', o: ['Porque desaparece al escribir', 'Porque no funciona en el móvil', 'Porque solo admite números', 'Porque ya no se usa'], c: 0, exp: 'El texto de ejemplo se borra en cuanto escribes y ya no se sabe qué pedía el campo. El label se queda.' },
    { p: '¿Qué atributo pone un valor inicial en el campo?', o: ['`value`', '`placeholder`', '`name`', '`autofocus`'], c: 0, exp: 'value es el valor que ya trae el campo, y se envía si no lo cambias. placeholder es solo un ejemplo en gris y no se envía.' },
    { p: 'Un `type` que el navegador no conoce se trata como…', o: ['`text`', '`hidden`', 'Un error: el formulario no se envía', '`number`'], c: 0, exp: 'Si el navegador no conoce un tipo, lo trata como text. Por eso un tipo nuevo no rompe nada en un navegador viejo.' },
    { p: 'Un `<input>` metido dentro de su `<label>`…', o: ['Necesita for e id', 'No necesita for ni id', 'No se envía', 'No es válido'], c: 1, exp: 'Si el campo va dentro del label, ya están conectados: no hacen falta for ni id.' },
    { p: '¿Qué ganas con `type="email"` frente a `type="text"`?', o: ['Que se envíe un correo al pulsar el botón', 'Que el navegador compruebe que tiene @ antes de enviar', 'Que el dato viaje cifrado', 'Nada: solo cambia el nombre'], c: 1, exp: 'Cada type cambia lo que hace el navegador: email comprueba el formato, number saca el teclado numérico en el móvil y date, un calendario.' }
  ];

  // UT2 · 2.1 CSS y selectores (diapositiva 14)
  AW.preguntas.selectores = [
    { p: '¿Qué quiere decir «en cascada» en CSS?', o: ['Que hay un orden para decidir qué regla gana si varias afectan al mismo elemento', 'Que las reglas se leen de abajo arriba', 'Que una hoja enlaza con la siguiente', 'Que solo sirve para listas'], c: 0, exp: 'Cuando varias reglas afectan al mismo elemento, la cascada decide cuál gana. Lo tachado en DevTools es lo que perdió.' },
    { p: '¿Qué forma de aplicar CSS usamos en el módulo?', o: ['Una hoja externa enlazada con `<link>`', 'El atributo `style` en cada etiqueta', 'Un `<style>` en cada página', 'Los atributos `font` y `align`'], c: 0, exp: 'Una hoja para todo el sitio: se cambia una vez y cambian todas las páginas. style en línea mezcla contenido y aspecto.' },
    { p: '¿Dónde va el `<link rel="stylesheet">`?', o: ['Dentro del `<head>`', 'Al final del `<body>`', 'Dentro del archivo CSS', 'Antes del `<!DOCTYPE html>`'], c: 0, exp: 'En el head, con href apuntando al archivo. Si no cambia nada, revisa la ruta y el nombre: minúsculas y sin espacios.' },
    { p: 'Se te olvida cerrar la llave de una regla. ¿Qué pasa?', o: ['El navegador avisa con un error', 'Deja de funcionar lo que viene después, sin aviso', 'Nada: el navegador la cierra', 'Solo falla esa regla'], c: 1, exp: 'Es el error más común de la unidad: todo lo que viene detrás deja de funcionar y el navegador no avisa. Indentar ayuda a verlo.' },
    { p: '¿Qué selector alcanza todo lo que lleva `class="precio"`?', o: ['`.precio`', '`#precio`', '`precio`', '`*precio`'], c: 0, exp: 'El punto es para las clases y la almohadilla para el id. precio a secas buscaría una etiqueta <precio>, que no existe.' },
    { p: 'Clase e id, ¿en qué se diferencian?', o: ['La clase se repite; el id es único en la página', 'El id se repite; la clase es única', 'La clase es para CSS; el id, solo para JavaScript', 'No hay diferencia'], c: 0, exp: 'La clase se pone en todos los elementos que haga falta y es la que más se usa. El id es único y lo reservamos para las anclas.' },
    { p: '¿A qué alcanza `ul > li`?', o: ['Solo a los `li` hijos directos de la `ul`', 'A todos los `li` de dentro, a cualquier nivel', 'A la `ul` que tenga algún `li`', 'A los `li` y a la `ul`'], c: 0, exp: 'El > solo baja un nivel. Con un espacio, ul li, alcanzaría también los li de las listas anidadas.' },
    { p: '¿A qué alcanza `.boton.grande`, sin espacio?', o: ['Al elemento que tiene las dos clases', 'A un `.grande` que está dentro de un `.boton`', 'A los `.boton` y a los `.grande`', 'A nada: no es válido'], c: 0, exp: 'Pegadas, las dos clases van en el mismo elemento. Con espacio, .boton .grande, sería un descendiente.' },
    { p: '¿Qué selector alcanza solo el campo del correo?', cod: '<input type="text" name="nombre">\n<input type="email" name="correo">\n<button>Enviar</button>', o: ['`input[type="email"]`', '`input`', '`.email`', '`#email`'], c: 0, exp: 'El selector de atributo va entre corchetes: los input cuyo type es email. .email y #email buscan una clase y un id que no están.' },
    { p: '¿Qué nombre de clase es mejor?', o: ['`.precio`', '`.rojo`', '`.estilo1`', '`.caja2`'], c: 0, exp: 'El nombre dice qué es, no cómo se ve: el día que el rojo pase a azul, .rojo miente.' },
    { p: 'En la pestaña Estilos de DevTools, una declaración sale tachada. ¿Qué significa?', o: ['Que perdió frente a otra regla', 'Que tiene un error de escritura', 'Que está comentada', 'Que se ha borrado del archivo'], c: 0, exp: 'Tachado es que otra regla ganó. Lo que el navegador no entiende lleva un triángulo amarillo.' },
    { p: 'Sin CSS, un `<h1>` ya se ve grande y en negrita. ¿Por qué?', o: ['Por la hoja de estilo del navegador (user-agent)', 'Porque HTML lleva el tamaño dentro de la etiqueta', 'Por la fuente del sistema', 'Porque el h1 es una imagen'], c: 0, exp: 'Cada navegador trae una hoja con estilos por defecto. En DevTools aparece como hoja de estilo de user-agent.' },
    { p: '¿Existe CSS4?', o: ['No: desde 2000 CSS avanza por módulos, cada uno con su nivel', 'Sí, desde 2020', 'Sí, pero solo en Chrome', 'No: CSS dejó de actualizarse en CSS3'], c: 0, exp: 'Tras CSS2 se dejó de numerar: Flexbox, Grid o Selectores tienen cada uno su nivel. No existe ni existirá un CSS4.' }
  ];

  // UT2 · 2.3 Bloque, línea y flexbox (diapositiva 35)
  AW.preguntas.flexbox = [
    { p: '¿Dónde se pone `display: flex`?', o: ['En el contenedor: coloca a sus hijos directos', 'En cada hijo que quieres mover', 'Siempre en el `<body>`', 'En el texto que quieres centrar'], c: 0, exp: 'El contenedor decide la dirección, el reparto y la alineación; los hijos se adaptan.' },
    { p: '¿Qué propiedad reparte el espacio en el eje principal?', o: ['`justify-content`', '`align-items`', '`flex-direction`', '`text-align`'], c: 0, exp: 'justify-content reparte en el eje principal; align-items alinea en el cruzado.' },
    { p: 'En una fila flex, ¿qué alinea los hijos en vertical?', o: ['`align-items`', '`justify-content`', '`vertical-align`', '`flex-wrap`'], c: 0, exp: 'En una fila, el eje cruzado es el vertical, y ahí alinea align-items.' },
    { p: '¿Cómo centras una caja en las dos direcciones?', o: ['`justify-content` y `align-items` en `center`', '`text-align: center`', '`margin: center`', '`align: middle`'], c: 0, exp: 'En el contenedor flex, justify-content: center y align-items: center. Se acabó el meme de cómo centrar un div.' },
    { p: '¿Qué pone los hijos uno debajo de otro?', o: ['`flex-direction: column`', '`justify-content: column`', '`flex-direction: row`', '`align-items: column`'], c: 0, exp: 'flex-direction cambia el eje principal: row (por defecto) en fila, column en columna.' },
    { p: 'Con `main { flex: 2; }` y `aside { flex: 1; }`…', o: ['main ocupa el doble que aside', 'aside ocupa el doble que main', 'Ocupan lo mismo', 'main va segundo y aside primero'], c: 0, exp: 'flex reparte el espacio en proporción: 2 frente a 1. Con flex: 1 en todos, a partes iguales.' },
    { p: 'Los hijos no caben en la fila. ¿Qué les deja saltar de línea?', o: ['`flex-wrap: wrap`', '`flex-direction: column`', '`gap: wrap`', '`white-space: wrap`'], c: 0, exp: 'flex-wrap: wrap los deja saltar a otra línea cuando no caben. column los pondría todos en columna, quepan o no.' },
    { p: '¿Qué separa los hijos de un flex sin usar márgenes?', o: ['`gap`', '`padding`', '`space`', '`border`'], c: 0, exp: 'gap pone el hueco entre los hijos y solo entre ellos. Funciona igual en grid.' },
    { p: '`display: none` frente a `visibility: hidden`…', o: ['none quita el elemento; hidden lo oculta pero deja el hueco', 'Son lo mismo', 'hidden lo quita; none deja el hueco', 'none solo funciona en flex'], c: 0, exp: 'none lo quita del todo, como si no estuviera. hidden lo hace invisible, pero sigue ocupando su sitio.' },
    { p: '¿Qué valor de `display` va dentro del texto y no acepta ancho ni alto?', o: ['`inline`', '`block`', '`inline-block`', '`flex`'], c: 0, exp: 'inline va en la línea, como a, strong o span. inline-block también, pero con ancho, alto y relleno.' },
    { p: 'En el menú, ¿por qué el `ul` lleva `padding: 0`?', o: ['Para quitar la sangría que el navegador pone a las listas', 'Para quitar las viñetas', 'Para poner los li en fila', 'Para que el enlace sea clicable'], c: 0, exp: 'Las listas traen sangría por defecto. Las viñetas se quitan con list-style: none y la fila la hace display: flex.' },
    { p: '¿Por qué `nav a` lleva `display: block`?', o: ['Para que toda la caja del enlace sea clicable', 'Para poner los enlaces en fila', 'Para quitar el subrayado', 'Para que cambie al pasar el ratón'], c: 0, exp: 'Como bloque, el relleno forma parte del enlace y se puede pulsar en toda la caja, no solo en las letras.' },
    { p: '¿Qué seudoclase se activa al llegar a un enlace con el tabulador?', o: ['`:focus`', '`:hover`', '`:active`', '`:visited`'], c: 0, exp: ':hover es el ratón encima, :active mientras pulsas y :visited si ya lo visitaste. No quites el outline del :focus sin poner otro.' }
  ];

  // UT2 · 2.5 Grid y position (diapositiva 49)
  AW.preguntas.grid = [
    { p: 'Grid o flexbox: ¿cuál es la regla práctica?', o: ['Grid reparte la página; flex ordena lo de dentro de cada zona', 'Flex reparte la página; grid ordena cada zona', 'Grid ha sustituido a flexbox', 'Flexbox solo sirve para centrar'], c: 0, exp: 'Flexbox trabaja en una dirección; grid, en dos: filas y columnas a la vez.' },
    { p: '¿Qué significa `fr` en grid?', o: ['Una fracción del espacio libre', 'Una fila', 'El tamaño de la fuente', 'Un marco (frame)'], c: 0, exp: '1fr 1fr 1fr son tres partes iguales del espacio que queda libre.' },
    { p: '`repeat(3, 1fr)` es lo mismo que…', o: ['`1fr 1fr 1fr`', '`3fr`', '`1fr 3`', '`33%`'], c: 0, exp: 'repeat escribe tres veces 1fr: tres columnas iguales. 3fr sería una sola columna.' },
    { p: 'Con `grid-template-columns`, un lateral fijo de 12rem a la izquierda y el resto para el contenido:', o: ['`12rem 1fr`', '`1fr 12rem`', '`12rem`', '`12rem 100%`'], c: 0, exp: 'Las columnas se dicen de izquierda a derecha: el lateral fijo y luego 1fr, el resto. Con 100 % se saldría de la página.' },
    { p: '¿Qué hace esta rejilla?', lang: 'css', cod: '.galeria {\n  display: grid;\n  grid-template-columns:\n    repeat(auto-fit, minmax(14rem, 1fr));\n}', o: ['Mete tantas columnas como quepan, sin media query', 'Hace 14 columnas', 'Hace una sola columna de 14rem', 'Repite la fila de arriba'], c: 0, exp: 'Cada columna mide al menos 14rem y caben más o menos según el ancho. Es la rejilla responsive sin media query.' },
    { p: '¿Para qué sirve `grid-template-areas`?', o: ['Para dibujar la maqueta con el nombre de cada zona', 'Para poner nombre a las clases', 'Para contar las celdas de la rejilla', 'Para hacer la página responsive sola'], c: 0, exp: 'Se ve el dibujo de la página en el propio CSS: cambiar la maqueta es cambiar las comillas. Cada zona se asigna con grid-area.' },
    { p: 'La captura destacada de la galería tiene que ocupar dos columnas:', o: ['`grid-column: span 2`', '`grid-row: span 2`', '`column-span: 2`', '`width: 200%`'], c: 0, exp: 'span 2 cuenta celdas. grid-row: span 2 la haría más alta, no más ancha.' },
    { p: '`grid-column: 1 / 3` ocupa…', o: ['Dos columnas: de la línea 1 a la línea 3', 'Tres columnas', 'La columna 1 y la 3', 'Un tercio de la fila'], c: 0, exp: 'Con la barra se cuentan líneas de la rejilla, no celdas: de la línea 1 a la 3 hay dos columnas.' },
    { p: '¿Qué hace que una imagen llene su celda sin deformarse?', o: ['`object-fit: cover`', '`object-fit: fill`', '`display: block`', '`float: left`'], c: 0, exp: 'Con width y height al 100 %, object-fit: cover recorta lo que sobra en vez de estirar la imagen. fill la estira.' },
    { p: 'Una caja con `position: absolute` se coloca respecto a…', o: ['El ancestro más cercano posicionado; si no hay, la página', 'Siempre la página', 'La ventana, aunque hagas scroll', 'Su sitio normal, dejando el hueco'], c: 0, exp: 'Sale del flujo y busca el ancestro más cercano con position distinto de static. Respecto a la ventana es fixed; desde su sitio, relative.' },
    { p: 'Pones una etiqueta con `absolute` sobre una foto. ¿Qué necesita el `figure`?', o: ['`position: relative`', '`position: absolute`', '`display: grid`', '`z-index: 1`'], c: 0, exp: 'relative en el figure lo convierte en la referencia: la etiqueta se coloca respecto a la foto y no respecto a la página.' },
    { p: 'Un botón «subir» abajo a la derecha que no se mueve con el scroll:', o: ['`position: fixed`', '`position: sticky`', '`position: relative`', '`position: static`'], c: 0, exp: 'fixed se coloca respecto a la ventana y no se mueve. sticky solo se pega al llegar al borde.' },
    { p: 'Dos cajas posicionadas se tapan. ¿Qué decide cuál queda encima?', o: ['`z-index`', '`top`', '`order`', '`display`'], c: 0, exp: 'top, right, bottom y left dicen dónde; z-index, quién queda encima: gana el número más alto.' }
  ];

  /* ---------- montadores de los ejercicios ---------- */
  const norm = (s) => String(s).trim().toLowerCase().replace(/^<\/?|>$/g, '').replace(/^<|>$/g, '').replace(/;$/, '').trim();
  // Cada diapositiva puede elegir su banco (data-banco) y su enunciado (data-enunciado)
  const bancoDe = (el, def) => AW.bancos[el.dataset.banco] || AW.bancos[def];

  function montaCompletar(el) {
    const st = armazon(el, el.dataset.enunciado || 'Escribe la etiqueta o el atributo que falta en el hueco. Solo el nombre, sin < >.');
    const banco = bancoDe(el, 'completar');
    let caso = null;
    function nuevo() {
      caso = eligeOtro(banco, caso);
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
    const banco = bancoDe(el, 'ordenar');
    let juego = null, orden = [];
    function nuevo() {
      juego = eligeOtro(banco, juego);
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
    const st = armazon(el, el.dataset.enunciado || 'Hay un error en el fragmento. Pulsa la línea donde está y elige de qué tipo es.');
    const banco = bancoDe(el, 'error');
    const tiposLista = AW[el.dataset.tipos] || AW.tiposError;
    let caso = null, linea = -1;
    function nuevo() {
      caso = eligeOtro(banco, caso); linea = -1;
      st.cuerpo.innerHTML = '<pre class="ej-cod pulsable">' + caso.lineas.map((l, i) => '<div class="ej-linea" data-i="' + i + '"><i>' + (i + 1) + '</i><span>' + esc(l) + '</span></div>').join('') + '</pre>' +
        '<div class="ej-campos ej-campos-1"><label class="ej-campo"><span>Tipo de error</span>' + selectHtml('tipo', tiposLista, 'Elige el tipo…') + '</label></div>' +
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
    const explica = () => { const r = st.cuerpo.querySelector('.ej-respuesta'); r.innerHTML = '<b>' + esc(tiposLista[caso.tipos[0]]) + '.</b> ' + esc(caso.exp); r.hidden = false; };
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
    const st = armazon(el, el.dataset.enunciado || 'Une cada etiqueta o atributo con lo que hace. Las funciones están desordenadas.');
    const banco = bancoDe(el, 'emparejar');
    let juego = null, pares = [], opciones = [];
    function nuevo() {
      juego = eligeOtro(banco, juego);
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

  /* selector: HTML con líneas objetivo y cuatro selectores; el acierto se calcula con querySelectorAll
     sobre el propio fragmento (cada etiqueta lleva su número de línea en data-l) */
  function montaSelector(el) {
    const st = armazon(el, el.dataset.enunciado || 'Elige el selector que alcanza justo el elemento marcado, y solo ese.');
    const banco = bancoDe(el, 'selector');
    let caso = null, elegida = -1, resultados = [];
    // Devuelve el conjunto de líneas que alcanza un selector, o null si la sintaxis no vale
    function alcanza(sel) {
      const t = document.createElement('template');
      t.innerHTML = caso.html.map((l, i) => l.replace(/<([a-zA-Z][\w-]*)/g, '<$1 data-l="' + i + '"')).join('\n');
      let nodos;
      try { nodos = t.content.querySelectorAll(sel); } catch (e) { return null; }
      const s = new Set();
      nodos.forEach((n) => { if (n.dataset && n.dataset.l !== undefined) s.add(+n.dataset.l); });
      return s;
    }
    const igual = (a, b) => a.size === b.size && [...a].every((x) => b.has(x));
    function nuevo() {
      caso = eligeOtro(banco, caso); elegida = -1;
      const obj = new Set(caso.objetivo);
      resultados = caso.opciones.map(alcanza);
      const orden = baraja(caso.opciones.map((_, k) => k));   // la correcta no siempre en el mismo sitio
      st.cuerpo.innerHTML = '<pre class="ej-cod">' + caso.html.map((l, i) => '<div class="ej-linea' + (obj.has(i) ? ' objetivo' : '') + '" data-i="' + i + '"><i>' + (i + 1) + '</i><span>' + esc(l) + '</span></div>').join('') + '</pre>' +
        '<div class="ej-opciones">' + orden.map((k) => '<button type="button" class="ej-opcion" data-k="' + k + '">' + esc(caso.opciones[k]) + '</button>').join('') + '</div>' +
        '<div class="ej-respuesta" hidden></div>';
      st.cuerpo.querySelectorAll('.ej-opcion').forEach((b) => b.addEventListener('click', () => {
        st.cuerpo.querySelectorAll('.ej-opcion').forEach((x) => x.classList.remove('sel'));
        b.classList.add('sel'); elegida = +b.dataset.k; limpia();
      }));
      st.nuevo();
    }
    const limpia = () => st.cuerpo.querySelectorAll('.ej-linea').forEach((x) => x.classList.remove('ok', 'ko'));
    function pinta(k) {
      limpia();
      const obj = new Set(caso.objetivo), r = resultados[k];
      if (!r) return;
      r.forEach((i) => { const f = st.cuerpo.querySelector('.ej-linea[data-i="' + i + '"]'); if (f) f.classList.add(obj.has(i) ? 'ok' : 'ko'); });
    }
    const correcta = () => resultados.findIndex((r) => r && igual(r, new Set(caso.objetivo)));
    const marca = (k, clase) => { const b = st.cuerpo.querySelector('.ej-opcion[data-k="' + k + '"]'); b.classList.remove('ok', 'ko', 'pista'); b.classList.add(clase); };
    function comprobar() {
      if (elegida < 0) { st.mensaje('Elige primero un selector.'); return; }
      const obj = new Set(caso.objetivo), r = resultados[elegida];
      pinta(elegida);
      if (r === null) { marca(elegida, 'ko'); st.fallo('Ese selector no es válido: el navegador no lo entiende y la regla entera se ignora.'); return; }
      if (igual(r, obj)) { marca(elegida, 'ok'); st.acierto('Correcto: alcanza justo lo marcado.'); return; }
      marca(elegida, 'ko');
      if (r.size === 0) st.fallo('No alcanza nada: en este HTML no hay ningún elemento que cumpla ese selector.');
      else if ([...obj].every((x) => r.has(x))) st.fallo('Alcanza lo marcado, pero también lo que está en rojo. Hace falta uno más concreto.');
      else st.fallo('Alcanza otra cosa (en rojo), no lo marcado.');
    }
    function pista() { st.ayuda(); st.mensaje('Pista: ' + caso.pista); }
    function resolver() {
      st.ayuda(); st.resuelto = true;
      const k = correcta();
      st.cuerpo.querySelectorAll('.ej-opcion').forEach((x) => x.classList.remove('sel', 'ok', 'ko'));
      if (k >= 0) { marca(k, 'ok'); pinta(k); }
      const r = st.cuerpo.querySelector('.ej-respuesta');
      r.innerHTML = '<b>' + esc(caso.opciones[k]) + '.</b> ' + esc(caso.pista) + ' Los otros: ' + caso.opciones.map((o, i) => {
        if (i === k) return null;
        const s = resultados[i];
        return '<code>' + esc(o) + '</code> ' + (s === null ? 'no es válido' : s.size === 0 ? 'no alcanza nada' : 'alcanza ' + (s.size === 1 ? 'la línea ' : 'las líneas ') + [...s].sort((a, b) => a - b).map((x) => x + 1).join(', '));
      }).filter(Boolean).join('; ') + '.';
      r.hidden = false; st.mensaje('');
    }
    st.botones.comprobar.addEventListener('click', comprobar);
    st.botones.pista.addEventListener('click', pista);
    st.botones.resolver.addEventListener('click', resolver);
    st.botones.otro.addEventListener('click', nuevo);
    nuevo();
  }

  AW.montadores = { completar: montaCompletar, ordenar: montaOrdenar, error: montaError, emparejar: montaEmparejar, selector: montaSelector };
  function montaEjercicio(el) {
    const m = AW.montadores[el.dataset.tipo];
    if (!m) { el.textContent = 'Tipo de ejercicio pendiente: ' + el.dataset.tipo; return; }
    m(el);
  }

  /* ---------- quiz de opción múltiple ---------- */
  function montaQuiz(q) {
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
      // Se lee al pulsar: «Otra pregunta» cambia la correcta
      const correcta = parseInt(q.dataset.correct, 10);
      q.setAttribute('data-answered', '');
      opts[correcta].classList.add('correct');
      if (i !== correcta) o.classList.add('wrong');
      if (fb) fb.textContent = i === correcta ? (q.dataset.ok || 'Correcto.') : (q.dataset.ko || 'Incorrecto.');
    }));
    const r = q.querySelector('.quiz-reset');
    if (r) r.addEventListener('click', reset);
    const banco = AW.preguntas[q.dataset.preguntas];
    if (r && banco && banco.length) montaOtraPregunta(q, r, opts, banco, reset);
  }

  /* «Otra pregunta», a la derecha de Reiniciar: alterna la pregunta de la diapositiva con las del banco,
     barajadas y con las opciones en otro orden. Una pregunta con cod enseña ese código en la ventana
     del quiz, que se crea si la diapositiva no la tiene; sin cod, la ventana se oculta. */
  const fmtQuiz = (s) => esc(s).replace(/`([^`]+)`/g, '<code class="en-linea">$1</code>');
  function montaOtraPregunta(q, r, opts, banco, reset) {
    const h2 = q.querySelector('h2');
    const textos = opts.map((o) => o.querySelector(':scope > span:not(.letra)'));
    let ventana = q.querySelector('.ventana');
    const original = {
      h: h2.innerHTML, o: textos.map((t) => t.innerHTML),
      c: q.dataset.correct, ok: q.dataset.ok, ko: q.dataset.ko,
      ventana: ventana && { nombre: ventana.querySelector('.ventana-barra span').textContent, cod: ventana.querySelector('pre').innerHTML }
    };
    const ponVentana = (nombre, html) => {
      if (!ventana) {
        ventana = document.createElement('div');
        ventana.className = 'ventana';
        ventana.style.marginTop = '24px';
        ventana.innerHTML = '<div class="ventana-barra"><i></i><i></i><i></i><span></span></div><pre class="cod compacto"></pre>';
        h2.after(ventana);
      }
      ventana.style.display = '';
      ventana.querySelector('.ventana-barra span').textContent = nombre;
      ventana.querySelector('pre').innerHTML = html;
    };
    const quitaVentana = () => { if (ventana) ventana.style.display = 'none'; };
    const pon = (p) => {
      if (p === original) {
        h2.innerHTML = p.h;
        textos.forEach((t, k) => { t.innerHTML = p.o[k]; opts[k].style.display = ''; });
        Object.assign(q.dataset, { correct: p.c, ok: p.ok, ko: p.ko });
        if (p.ventana) ponVentana(p.ventana.nombre, p.ventana.cod); else quitaVentana();
      } else {
        const orden = baraja(p.o.map((_, k) => k));
        h2.innerHTML = fmtQuiz(p.p);
        opts.forEach((o, k) => {
          o.style.display = k < orden.length ? '' : 'none';
          if (k < orden.length) textos[k].innerHTML = fmtQuiz(p.o[orden[k]]);
        });
        Object.assign(q.dataset, { correct: orden.indexOf(p.c), ok: 'Correcto. ' + p.exp, ko: 'No. ' + p.exp });
        const lang = p.lang || 'html';
        if (p.cod) ponVentana(lang === 'css' ? 'estilos.css' : 'index.html', AW.resalta[lang](p.cod));
        else quitaVentana();
      }
      reset();
    };
    let lista = [original].concat(baraja(banco)), i = 0;
    const b = document.createElement('button');
    b.className = 'btn btn-primary quiz-otra';
    b.textContent = 'Otra pregunta';
    b.addEventListener('click', () => {
      i = (i + 1) % lista.length;
      if (i === 0) lista = [original].concat(baraja(banco));
      pon(lista[i]);
    });
    r.after(b);
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

  /* ---------- píldora «cómo tiene que quedar»: la solución de un ejercicio en un modal ----------
   * <button class="pill-solucion" data-solucion="soluciones/ej03.html" data-titulo="Ejercicio 3">Cómo tiene que quedar</button>
   *   data-solucion: página HTML que se muestra renderizada en un iframe (nunca el código).
   *   data-captura:  en su lugar, una imagen (para el simulacro y el examen, donde no se debe poder inspeccionar).
   *   data-nota:     frase al pie; por defecto recuerda que sin CSS se ve así de sencillo.
   */
  function abreSolucion(btn) {
    const url = btn.dataset.solucion, captura = btn.dataset.captura;
    const titulo = esc(btn.dataset.titulo || 'Así tiene que quedar');
    const nota = esc(btn.dataset.nota || 'Sin CSS se ve así de sencillo: lo que importa es que las etiquetas sean las correctas.');
    const v = document.createElement('div');
    v.className = 'visor visor-solucion';
    v.innerHTML = '<div class="solucion-marco">'
      + '<div class="resultado-barra"><i></i><i></i><i></i><span class="url">' + titulo + '</span>'
      + (url ? '<a class="solucion-abrir" target="_blank" rel="noopener">Abrir en una pestaña nueva</a>' : '') + '</div>'
      + (captura ? '<div class="solucion-scroll"><img alt="Resultado esperado"></div>' : '<iframe title="Resultado esperado" sandbox="allow-same-origin"></iframe>')
      + '<p class="solucion-nota">' + nota + '</p></div>'
      + '<button class="visor-cerrar" aria-label="Cerrar">×</button>';
    if (url) { v.querySelector('iframe').src = url; v.querySelector('.solucion-abrir').href = url; }
    else v.querySelector('img').src = captura;
    const cierra = () => { v.remove(); document.removeEventListener('keydown', tecla, true); };
    const tecla = (e) => { if (e.key === 'Escape') { e.stopPropagation(); cierra(); } };
    v.addEventListener('click', (e) => { if (!e.target.closest('.solucion-marco') || e.target.closest('.visor-cerrar')) cierra(); });
    v.querySelector('.visor-cerrar').addEventListener('click', cierra);
    document.addEventListener('keydown', tecla, true);
    document.body.appendChild(v);
  }
  function montaSolucion(btn) {
    btn.addEventListener('click', (e) => { e.stopPropagation(); abreSolucion(btn); });
  }


  /* ---------- volver: botón «Inicio» en la barra flotante del motor y pastilla de sección clicable ----------
   * La barra flotante (.overlay, dentro del shadow DOM de deck-stage) aparece al mover el ratón y se oculta en
   * presentación e impresión: ahí va un enlace a la página principal del módulo (../). La pastilla verde con el
   * número de sección (data-seccion) pasa a ser un botón que salta al índice de la unidad (la diapositiva cuya
   * etiqueta empieza por «Índice»; si no hay, la segunda).
   */
  /* ---------- chuleta de etiquetas ----------
   * <div class="ch-fila"><code>&lt;p&gt;…&lt;/p&gt;</code><span>Párrafo</span></div>
   * El código que no empieza por < ni & son atributos sueltos (href="…", required).
   * Con data-ch="css" en la sección (chuleta de CSS), «propiedad: valor» se colorea como atributo y valor,
   * una regla entera como selector y declaraciones, y lo demás como selector. class="v" marca un valor
   * suelto (px, #dc143c) y class="at" un atributo de HTML (style="…"). */
  function resaltaDecl(d) {
    const m = d.match(/^(\s*)(--[\w-]+|[a-z-]+)(\s*:\s*)([\s\S]*)$/);
    return m ? esc(m[1]) + span('attr', m[2]) + span('punc', m[3]) + span('str', m[4]) : esc(d);
  }
  function resaltaChCss(t) {
    if (/^\/\*/.test(t)) return span('com', t);
    const r = t.match(/^([^{]*?)(\s*\{\s*)([\s\S]*?)(\s*\}\s*)$/);
    if (r) return span(r[1].startsWith('@') ? 'kw' : 'tag', r[1]) + span('punc', r[2]) +
      r[3].split(/(;\s*)/).map((p, i) => (i % 2 ? span('punc', p) : resaltaDecl(p))).join('') + span('punc', r[4]);
    if (/^(--[\w-]+|[a-z-]+)\s*:\s/.test(t)) return resaltaDecl(t);
    return span('tag', t);
  }
  function montaChuleta(sec) {
    const css = sec.dataset.ch === 'css';
    sec.querySelectorAll('.ch-fila > code').forEach((c) => {
      const t = c.textContent;
      if (/^[<&]/.test(t)) c.innerHTML = resaltaHtml(t);
      else if (!css || c.classList.contains('at')) c.innerHTML = resaltaAtributos(t);
      else if (c.classList.contains('v')) c.innerHTML = span('str', t);
      else c.innerHTML = resaltaChCss(t);
    });
    const b = sec.querySelector('.ch-repaso');
    if (b) b.addEventListener('click', (e) => {
      e.stopPropagation();
      const on = document.body.classList.toggle('ch-repasando');
      document.querySelectorAll('.ch-repaso').forEach((x) => {
        x.setAttribute('aria-pressed', String(on));
        x.textContent = on ? 'Ver todo' : 'Modo repaso';
      });
      document.querySelectorAll('.chuleta .ch-fila').forEach((f) => {
        f.classList.remove('visto');
        if (on) f.setAttribute('role', 'button'); else f.removeAttribute('role');
      });
    });
    sec.addEventListener('click', (e) => {
      const f = e.target.closest('.ch-fila');
      if (f && document.body.classList.contains('ch-repasando')) f.classList.toggle('visto');
    });
  }

  function montaVolver(stage) {
    const overlay = stage.shadowRoot && stage.shadowRoot.querySelector('.overlay');
    if (overlay && !overlay.querySelector('.inicio')) {
      const sep = document.createElement('span'); sep.className = 'divider';
      const a = document.createElement('a');
      a.className = 'btn inicio'; a.href = '../'; a.title = 'Volver al índice del módulo';
      a.textContent = 'Inicio';
      a.style.cssText = 'color:inherit;text-decoration:none;cursor:pointer;padding:0 10px';
      overlay.append(sep, a);
    }
    const secs = [...stage.querySelectorAll(':scope > section')];
    let idx = secs.findIndex((s) => /^índice/i.test(s.dataset.label || ''));
    if (idx < 0) idx = Math.min(1, secs.length - 1);
    secs.forEach((s) => {
      if (!s.dataset.seccion || s.querySelector(':scope > .seccion-pill')) return;
      const b = document.createElement('button');
      b.type = 'button'; b.className = 'seccion-pill'; b.textContent = s.dataset.seccion;
      b.title = 'Ir al índice de la unidad';
      b.addEventListener('click', (e) => { e.stopPropagation(); stage.goTo(idx); });
      s.appendChild(b);
    });
  }

  /* ---------- notas del profesor (tecla N) ----------
   * La ventana assets/notas.html se abre con window.open y habla con esta página por postMessage:
   *   ventana -> deck   {aw:'hola'}             pide el estado (al abrir y cada segundo, por si el deck se recarga)
   *                     {aw:'ir', index}        salta a una diapositiva
   *   deck -> ventana   {aw:'estado', ...}      deck, título, índice actual y lista de diapositivas con sus notas
   *                     {aw:'diapo', index}     ha cambiado la diapositiva actual
   */
  const URL_NOTAS = (document.currentScript && document.currentScript.src || '../assets/aw.js').replace(/aw\.js.*$/, 'notas.html');
  let ventanaNotas = null;

  function idDeck() {
    // /ut01/, /ut01/index.html o /ut01/otra.html -> 'ut01'
    return location.pathname.replace(/\/[^/]*\.html?$/, '').replace(/\/$/, '').split('/').pop() || 'deck';
  }

  function estadoNotas(stage) {
    const secs = [...stage.querySelectorAll(':scope > section')];
    return {
      aw: 'estado',
      deck: idDeck(),
      titulo: document.title,
      index: stage.index || 0,
      diapos: secs.map((s, i) => {
        const aside = s.querySelector(':scope > aside.notas');
        return {
          n: i + 1,
          label: s.dataset.label || ('Diapositiva ' + (i + 1)),
          seccion: s.dataset.seccion || '',
          criterio: s.dataset.criterio || '',
          notas: aside ? aside.innerHTML.trim() : '',
        };
      }),
    };
  }

  function enviaNotas(msg) {
    if (!ventanaNotas || ventanaNotas.closed) return;
    try { ventanaNotas.postMessage(msg, '*'); } catch (e) {}
  }

  function abreNotas() {
    if (ventanaNotas && !ventanaNotas.closed) { ventanaNotas.focus(); return; }
    ventanaNotas = window.open(URL_NOTAS, 'aw-notas', 'popup,width=980,height=760');
  }

  function montaNotas(stage) {
    window.addEventListener('keydown', (e) => {
      if ((e.key !== 'n' && e.key !== 'N') || e.ctrlKey || e.metaKey || e.altKey) return;
      const t = e.composedPath ? e.composedPath()[0] : e.target;
      if (t && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName))) return;
      e.preventDefault();
      abreNotas();
    });
    window.addEventListener('message', (e) => {
      const d = e.data;
      if (!d || typeof d !== 'object' || !d.aw) return;
      if (d.aw === 'hola') { ventanaNotas = e.source; enviaNotas(estadoNotas(stage)); }
      else if (d.aw === 'ir' && typeof d.index === 'number') stage.goTo(d.index);
    });
    stage.addEventListener('slidechange', (e) => enviaNotas({ aw: 'diapo', index: e.detail.index }));
  }
  AW.abreNotas = abreNotas;

  /* ---------- buscador dentro de la unidad (tecla B y botón «Buscar» en la barra flotante) ----------
   * Busca solo en esta presentación: las diapositivas ya están en el DOM, así que no descarga nada y
   * funciona igual en GitHub Pages, en un servidor local o abriendo el archivo. El índice se construye
   * la primera vez que se abre el panel: por diapositiva, su rótulo (data-label), la sección y el texto
   * visible, sin las notas del profesor ni los ejercicios generados. Se compara sin tildes ni mayúsculas.
   */
  function normaliza(s) {
    // Carácter a carácter para que las posiciones coincidan con el texto original (los fragmentos resaltados)
    return s.split('').map((c) => {
      const d = c.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
      return d.length === 1 ? d : c;
    }).join('');
  }
  // textContent pega las palabras de bloques contiguos («servidorEl»): se añade un espacio al cerrar cada bloque
  const BLOQUES = /^(P|H[1-6]|LI|UL|OL|DIV|SECTION|ARTICLE|ASIDE|HEADER|FOOTER|FIGURE|FIGCAPTION|TABLE|TR|TD|TH|BR|BLOCKQUOTE|DT|DD|PRE)$/;
  function textoVisible(el) {
    let t = '';
    el.childNodes.forEach((n) => {
      if (n.nodeType === 3) t += n.textContent;
      else if (n.nodeType === 1) { t += textoVisible(n); if (BLOQUES.test(n.tagName)) t += ' '; }
    });
    return t;
  }
  function indiceBusqueda(stage) {
    return [...stage.querySelectorAll(':scope > section')].map((s, i) => {
      const c = s.cloneNode(true);
      c.querySelectorAll('aside.notas, .seccion-pill, [data-slide-num], .ej, .resultado, script, style').forEach((n) => n.remove());
      const texto = textoVisible(c).replace(/\s+/g, ' ').trim();
      const label = (s.dataset.label || ('Diapositiva ' + (i + 1))).replace(/^\S+\s·\s/, '');
      return {
        i, label, texto,
        seccion: s.dataset.seccion || '',
        criterio: s.dataset.criterio || '',
        nLabel: normaliza(label),
        nTexto: normaliza(texto),
      };
    });
  }
  // Fragmento del texto alrededor del primer término, con todos los términos resaltados
  function fragmento(d, terminos) {
    const ANTES = 60, LARGO = 190;
    let pos = -1;
    for (const t of terminos) { const p = d.nTexto.indexOf(t); if (p >= 0 && (pos < 0 || p < pos)) pos = p; }
    if (pos < 0) return '';
    let ini = Math.max(0, pos - ANTES);
    if (ini > 0) { const sp = d.nTexto.lastIndexOf(' ', ini); ini = sp > 0 ? sp + 1 : ini; }
    let fin = Math.min(d.nTexto.length, ini + LARGO);
    if (fin < d.nTexto.length) { const sp = d.nTexto.indexOf(' ', fin); if (sp > 0 && sp - fin < 20) fin = sp; }
    const nTrozo = d.nTexto.slice(ini, fin), trozo = d.texto.slice(ini, fin);
    // Marcas por carácter de cada acierto, sin solapar
    const marcas = new Array(nTrozo.length + 1).fill(0);
    for (const t of terminos) {
      let p = nTrozo.indexOf(t);
      while (p >= 0) { for (let k = p; k < p + t.length; k++) marcas[k] = 1; p = nTrozo.indexOf(t, p + t.length); }
    }
    let html = '', dentro = false;
    for (let k = 0; k < trozo.length; k++) {
      if (marcas[k] && !dentro) { html += '<mark>'; dentro = true; }
      if (!marcas[k] && dentro) { html += '</mark>'; dentro = false; }
      html += esc(trozo[k]);
    }
    if (dentro) html += '</mark>';
    return (ini > 0 ? '… ' : '') + html + (fin < d.nTexto.length ? ' …' : '');
  }
  function buscaEn(indice, q) {
    const terminos = normaliza(q).split(/\s+/).filter(Boolean);
    if (!terminos.length) return [];
    const res = [];
    indice.forEach((d) => {
      let puntos = 0;
      for (const t of terminos) {
        const enLabel = d.nLabel.indexOf(t) >= 0, enTexto = d.nTexto.indexOf(t) >= 0;
        if (!enLabel && !enTexto) { puntos = -1; break; }
        puntos += enLabel ? 10 : 1;
      }
      if (puntos > 0) res.push({ d, puntos });
    });
    res.sort((a, b) => b.puntos - a.puntos || a.d.i - b.d.i);
    return res.slice(0, 40).map((r) => Object.assign({ frag: fragmento(r.d, terminos) }, r.d));
  }

  let panelBusqueda = null;
  function abreBuscador(stage) {
    if (panelBusqueda) { panelBusqueda.querySelector('input').focus(); return; }
    if (!stage.__indiceBusqueda) stage.__indiceBusqueda = indiceBusqueda(stage);
    const indice = stage.__indiceBusqueda;
    const p = document.createElement('div');
    p.className = 'buscador';
    p.setAttribute('role', 'dialog');
    p.setAttribute('aria-label', 'Buscar en la unidad');
    p.innerHTML =
      '<div class="buscador-caja">' +
        '<div class="buscador-cabecera"><input type="text" autocomplete="off" spellcheck="false" placeholder="Buscar en esta unidad…" aria-label="Buscar en esta unidad">' +
        '<button type="button" class="buscador-cerrar" aria-label="Cerrar">×</button></div>' +
        '<ol class="buscador-lista" hidden></ol>' +
        '<p class="buscador-vacio"></p>' +
        '<div class="buscador-pie"><span><kbd>↑</kbd><kbd>↓</kbd>moverse</span><span><kbd>Enter</kbd>ir a la diapositiva</span><span><kbd>Esc</kbd>cerrar</span></div>' +
      '</div>';
    const input = p.querySelector('input'), lista = p.querySelector('.buscador-lista'), vacio = p.querySelector('.buscador-vacio');
    let resultados = [], sel = 0;
    const cierra = () => { p.remove(); panelBusqueda = null; };
    const marca = () => {
      [...lista.children].forEach((li, k) => li.toggleAttribute('data-sel', k === sel));
      const li = lista.children[sel];
      if (li && li.scrollIntoView) li.scrollIntoView({ block: 'nearest' });
    };
    const ve = (k) => { const r = resultados[k]; if (!r) return; cierra(); stage.goTo(r.i); };
    const pinta = () => {
      const q = input.value.trim();
      resultados = q ? buscaEn(indice, q) : [];
      sel = 0;
      lista.innerHTML = resultados.map((r) =>
        '<li><span class="b-num">' + String(r.i + 1).padStart(2, '0') + '</span>' +
        '<span class="b-titulo">' + (r.seccion ? '<span class="b-pill">' + esc(r.criterio ? r.seccion + ' · ' + r.criterio : r.seccion) + '</span>' : '') +
        esc(r.label) + '</span>' +
        (r.frag ? '<p class="b-frag">' + r.frag + '</p>' : '') + '</li>').join('');
      lista.hidden = !resultados.length;
      vacio.hidden = !!resultados.length;
      vacio.textContent = !q ? 'Escribe para buscar en las ' + indice.length + ' diapositivas de esta unidad.'
        : 'Nada en esta unidad para «' + q + '».';
      marca();
    };
    input.addEventListener('input', pinta);
    // Que las teclas del panel no lleguen al motor ni a los demás atajos (N, B)
    p.addEventListener('keydown', (e) => {
      e.stopPropagation();
      if (e.key === 'Escape') { e.preventDefault(); cierra(); }
      else if (e.key === 'ArrowDown') { e.preventDefault(); if (resultados.length) { sel = (sel + 1) % resultados.length; marca(); } }
      else if (e.key === 'ArrowUp') { e.preventDefault(); if (resultados.length) { sel = (sel - 1 + resultados.length) % resultados.length; marca(); } }
      else if (e.key === 'Enter') { e.preventDefault(); ve(sel); }
    });
    lista.addEventListener('click', (e) => {
      const li = e.target.closest('li');
      if (li) ve([...lista.children].indexOf(li));
    });
    p.querySelector('.buscador-cerrar').addEventListener('click', cierra);
    p.addEventListener('click', (e) => { if (e.target === p) cierra(); });
    document.body.appendChild(p);
    panelBusqueda = p;
    pinta();
    input.focus();
  }

  function montaBuscador(stage) {
    const overlay = stage.shadowRoot && stage.shadowRoot.querySelector('.overlay');
    if (overlay && !overlay.querySelector('.buscar')) {
      const sep = document.createElement('span'); sep.className = 'divider';
      const b = document.createElement('button');
      b.type = 'button'; b.className = 'btn buscar'; b.title = 'Buscar en esta unidad (B)';
      b.innerHTML = 'Buscar<span class="kbd" style="display:inline-flex;align-items:center;justify-content:center;min-width:16px;height:16px;margin-left:6px;padding:0 4px;border-radius:3px;background:rgba(255,255,255,.14);font-size:10px;font-weight:600">B</span>';
      b.addEventListener('click', () => abreBuscador(stage));
      overlay.append(sep, b);
    }
    window.addEventListener('keydown', (e) => {
      if ((e.key !== 'b' && e.key !== 'B') || e.ctrlKey || e.metaKey || e.altKey) return;
      const t = e.composedPath ? e.composedPath()[0] : e.target;
      if (t && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName))) return;
      e.preventDefault();
      abreBuscador(stage);
    });
  }
  AW.abreBuscador = () => { const s = document.querySelector('deck-stage'); if (s) abreBuscador(s); };

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
    document.querySelectorAll('.pill-solucion').forEach(montaSolucion);
    document.querySelectorAll('section.chuleta').forEach(montaChuleta);
    montaBuscador(stage);
    montaVolver(stage);
    montaNotas(stage);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
