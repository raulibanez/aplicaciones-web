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
 * 11. Practica CSS (UT2): <div class="practica-css" data-bloques="…"></div>. El HTML se lee, el CSS se
 *     escribe y la página cambia al lado; un encargo cada vez, con Comprobar, Pista y Ver solución.
 *     Los ejercicios están en AW.practicaCss.
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

  // PHP (UT3, wp-config.php): comentarios, cadenas, variables $…, define() y constantes
  function resaltaPhp(src) {
    let out = '', i = 0;
    const re = /(\/\*[\s\S]*?\*\/|\/\/[^\n]*|#[^\n]*)|('(?:[^'\\]|\\.)*'|"(?:[^"\\]|\\.)*")|(\$[A-Za-z_]\w*)|(<\?php|\?>)|(\b\d+(?:\.\d+)?\b)|([A-Za-z_]\w*)(?=\s*\()|(\b(?:true|false|null|TRUE|FALSE|NULL)\b)|([{}()[\];,=])/g;
    let m;
    while ((m = re.exec(src))) {
      out += esc(src.slice(i, m.index)); i = re.lastIndex;
      if (m[1]) out += span('com', m[1]);
      else if (m[2]) out += span('str', m[2]);
      else if (m[3]) out += span('attr', m[3]);
      else if (m[4]) out += span('tag', m[4]);
      else if (m[5]) out += span('num', m[5]);
      else if (m[6]) out += span('fn', m[6]);
      else if (m[7]) out += span('kw', m[7]);
      else if (m[8]) out += span('punc', m[8]);
    }
    return out + esc(src.slice(i));
  }

  AW.resalta = { html: resaltaHtml, css: resaltaCss, js: resaltaJs, javascript: resaltaJs, php: resaltaPhp };

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

  // Solo lo visto hasta la sesión 3 (bloques 2.1 a 2.3): el interactivo va al final de ese bloque
  AW.bancos.completarCss = [
    { cod: '<link rel="___" href="style.css">', ok: ['stylesheet'], pista: 'Dice qué es el archivo: una hoja de estilo.', fam: 'enlazar la hoja' },
    { cod: '<link rel="stylesheet" ___="style.css">', ok: ['href'], pista: 'La ruta del archivo, como en los enlaces.', fam: 'enlazar la hoja' },
    { cod: '___destacado {\n  background: #a5e070;\n}', ok: ['.'], pista: 'Lo que va delante de una clase en el CSS.', fam: 'selectores' },
    { cod: 'nav ___ {\n  color: white;\n}\n/* los enlaces de dentro del nav */', ok: ['a'], pista: 'La etiqueta de los enlaces.', fam: 'selectores' },
    { cod: 'h1 {\n  ___: #041c3f;\n}', ok: ['color'], pista: 'El color del texto.', fam: 'colores' },
    { cod: 'body {\n  ___: #fefefe;\n}', ok: ['background', 'background-color'], pista: 'El color de fondo.', fam: 'colores' },
    { cod: ':root {\n  --accent: #a5e070;\n}\nh2 {\n  color: ___(--accent);\n}', ok: ['var'], pista: 'Lo que usa un color guardado en la paleta.', fam: 'paleta' },
    { cod: 'body {\n  ___: Arial, sans-serif;\n}', ok: ['font-family'], pista: 'El tipo de letra.', fam: 'letra' },
    { cod: 'h1 {\n  font-size: 2.5___;\n}', ok: ['rem'], pista: 'La unidad del curso para el texto: 1 vale 16 px.', fam: 'medidas' },
    { cod: 'h1 {\n  font-weight: ___;\n}', ok: ['bold', '700'], pista: 'Negrita.', fam: 'letra' },
    { cod: 'h1 {\n  ___: center;\n}', ok: ['text-align'], pista: 'Centra el texto.', fam: 'letra' },
    { cod: 'p {\n  ___: 1.6;\n}', ok: ['line-height'], pista: 'El espacio entre las líneas.', fam: 'letra' },
    { cod: '.tarjeta {\n  ___: 1rem 2rem;\n}', ok: ['padding', 'margin'], pista: 'Espacio entre el contenido y el borde, dentro de la caja.', fam: 'caja' },
    { cod: '.ficha {\n  border: 2px ___ #041c3f;\n}', ok: ['solid', 'dashed', 'dotted'], pista: 'El estilo de la línea: continua.', fam: 'caja' },
    { cod: 'h2 {\n  margin-___: 2rem;\n}\n/* solo el margen de arriba */', ok: ['top'], pista: 'Arriba, en inglés.', fam: 'caja' },
    { cod: 'td {\n  border-___: 1px solid #d6e0ea;\n}\n/* solo la línea de abajo */', ok: ['bottom'], pista: 'Abajo, en inglés.', fam: 'caja' },
    { cod: '.tarjeta {\n  border-___: 12px;\n}', ok: ['radius'], pista: 'Redondea las esquinas.', fam: 'caja' },
    { cod: 'main {\n  max-width: 60rem;\n  margin: 0 ___;\n}', ok: ['auto'], pista: 'El valor que centra la caja.', fam: 'caja' }
  ];

  AW.tiposErrorCss = [
    'Falta el punto y coma',
    'Falta una llave { o }',
    'Clase sin el punto',
    'Propiedad mal escrita',
    'Valor sin unidad o unidad separada',
    'Color mal escrito',
    'El link no enlaza la hoja: falta rel o la ruta no coincide',
    'Seudoclase mal escrita'
  ];
  AW.bancos.errorCss = [
    { lineas: ['h1 {', '  color: #041c3f', '  font-size: 2rem;', '}'], linea: 1, tipos: [0], exp: 'Sin el punto y coma, el navegador lee «#041c3f font-size: 2rem» como un solo valor y descarta las dos declaraciones.' },
    { lineas: ['th {', '  background: #a5e070', '  color: #041c3f;', '}'], linea: 1, tipos: [0], exp: 'Falta el punto y coma tras el color de fondo: se pierde también el color del texto.' },
    { lineas: ['nav a', '  color: white;', '  text-decoration: none;', '}'], linea: 0, tipos: [1], exp: 'Falta la llave de apertura después del selector.' },
    { lineas: ['<p class="destacado">Novedad</p>', '', 'destacado {', '  font-weight: 700;', '}'], linea: 2, tipos: [2], exp: 'Sin el punto, «destacado» busca una etiqueta llamada así, que no existe. Es .destacado.' },
    { lineas: ['h1 {', '  font-sise: 2rem;', '}'], linea: 1, tipos: [3], exp: 'La propiedad es font-size. El navegador ignora las que no conoce, sin avisar.' },
    { lineas: ['h2 {', '  colour: #017ce9;', '}'], linea: 1, tipos: [3], exp: 'La propiedad es color, con la grafía americana.' },
    { lineas: ['main {', '  max-width: 60;', '  margin: 0 auto;', '}'], linea: 1, tipos: [4], exp: 'Todo tamaño distinto de 0 lleva unidad: 60rem.' },
    { lineas: ['button {', '  padding: 0.75 rem 1.5rem;', '}'], linea: 1, tipos: [4], exp: 'Número y unidad van juntos: 0.75rem. Con espacio son dos valores.' },
    { lineas: ['header {', '  background: #041c3;', '}'], linea: 1, tipos: [5], exp: 'Un color hexadecimal lleva seis cifras (o tres); cinco no vale.' },
    { lineas: ['<head>', '  <link href="style.css">', '</head>'], linea: 1, tipos: [6], exp: 'Sin rel="stylesheet" el navegador no sabe que ese archivo es una hoja de estilo.' },
    { lineas: ['<link rel="stylesheet" href="css/Style.css">', '<!-- el archivo es style.css, junto a index.html -->'], linea: 0, tipos: [6], exp: 'La ruta tiene una carpeta que no existe y una mayúscula: en el servidor no coincide.' },
    { lineas: ['nav a: hover {', '  background: #041c3f;', '}'], linea: 0, tipos: [7], exp: 'La seudoclase va pegada al selector, sin espacio: a:hover. Con espacio busca un elemento dentro del enlace.' }
  ];

  AW.bancos.emparejarCss = [
    { titulo: 'Caja y letra', pares: [
      ['padding', 'Espacio entre el contenido y el borde, dentro de la caja'],
      ['margin', 'Separación con las cajas de al lado, fuera del borde'],
      ['border-radius', 'Redondea las esquinas de la caja'],
      ['font-family', 'El tipo de letra'],
      ['line-height', 'El espacio entre las líneas de texto'],
      ['text-align', 'Alinea el texto: izquierda, centro o derecha'] ] },
    { titulo: 'Las recetas', pares: [
      ['display: flex', 'Pone en fila lo que hay dentro: el menú'],
      ['justify-content', 'Decide dónde va la fila: al principio, al centro o al final'],
      ['gap', 'Hueco entre los hijos, sin márgenes'],
      ['grid-template-columns', 'Cuántas columnas hay y de qué ancho'],
      ['grid-template-areas', 'Dibuja la maqueta con nombres de zona'],
      ['@media (min-width: 48rem)', 'Reglas que se aplican solo a partir de ese ancho'] ] },
    { titulo: 'Colores y medidas', pares: [
      ['color', 'El color del texto'],
      ['background', 'El color de fondo'],
      ['var(--accent)', 'Usa el color guardado en la paleta'],
      ['1rem', '16 px: la letra de la página'],
      ['max-width', 'La caja crece hasta ahí y se encoge si no cabe'],
      [':hover', 'Cuando el ratón está encima del elemento'] ] },
    { titulo: 'Selectores', pares: [
      ['.aviso', 'Los elementos con la clase aviso'],
      ['nav a', 'Los enlaces que están dentro del nav'],
      ['h1, h2', 'Los dos elementos, con la misma regla'],
      ['p', 'Todos los párrafos de la página'],
      ['header p', 'Solo los párrafos de la cabecera'],
      ['body', 'La página entera: su letra y su color los heredan todos'] ] }
  ];

  // selector: HTML de pocas líneas, líneas objetivo (desde 0) y cuatro selectores; el acierto se calcula
  // de verdad con querySelectorAll sobre el fragmento, así que solo uno debe alcanzar justo el objetivo
  AW.bancos.selector = [
    { html: ['<nav>', '  <ul>', '    <li><a href="#que-es">Qué es</a></li>', '    <li><a href="#ficha" class="activo">Ficha</a></li>', '  </ul>', '</nav>', '<p>Lee <a href="#">más</a>.</p>'], objetivo: [3], opciones: ['nav .activo', 'nav a', 'activo', 'a .activo'], pista: 'El enlace lleva una clase; combínala con nav.' },
    { html: ['<table>', '  <tr>', '    <th>Versión</th>', '    <td>1.4</td>', '  </tr>', '</table>'], objetivo: [2], opciones: ['th', 'td', 'table', 'tr'], pista: 'Es una celda de cabecera.' },
    { html: ['<header>', '  <h1>SuperTuxKart</h1>', '  <p>¿El mejor juego?</p>', '</header>', '<main>', '  <p>Es un juego libre.</p>', '</main>'], objetivo: [2], opciones: ['header p', 'p', 'main p', 'header h1'], pista: 'Solo el párrafo de la cabecera: uno dentro de otro.' },
    { html: ['<ul class="menu">', '  <li>Inicio</li>', '  <li class="activo">Ficha</li>', '  <li>Opinión</li>', '</ul>'], objetivo: [2], opciones: ['.activo', 'li', 'activo', '.menu'], pista: 'Selector de clase.' },
    { html: ['<form>', '  <label>Nombre</label>', '  <input type="text">', '  <button>Enviar</button>', '</form>', '<button>Volver</button>'], objetivo: [3], opciones: ['form button', 'button', 'button form', '.button'], pista: 'Solo el botón que está dentro del formulario.' },
    { html: ['<footer>', '  <p>Autor: <a href="mailto:x@x.es">Raúl</a></p>', '  <p>© 2026</p>', '</footer>'], objetivo: [1], opciones: ['footer a', 'footer p', 'a footer', 'footer'], pista: 'El enlace que está dentro del pie.' },
    { html: ['<h1>Título</h1>', '<h2>Sección</h2>', '<h3>Apartado</h3>', '<p>Texto</p>'], objetivo: [0, 1, 2], opciones: ['h1, h2, h3', 'h1 h2 h3', 'h', 'p'], pista: 'Varios a la vez, con comas.' },
    { html: ['<nav>', '  <ul>', '    <li><a href="#">Qué es</a></li>', '    <li><a href="#">Ficha</a></li>', '  </ul>', '</nav>'], objetivo: [1], opciones: ['nav ul', 'nav li', 'nav a', 'nav'], pista: 'La lista, no sus elementos.' },
    { html: ['<article>', '  <h2>Noticia</h2>', '  <p class="entradilla">Primer párrafo.</p>', '  <p>Segundo párrafo.</p>', '</article>'], objetivo: [2], opciones: ['.entradilla', 'article p', 'p', 'entradilla'], pista: 'El párrafo que lleva una clase.' },
    { html: ['<aside>', '  <h2>Capturas</h2>', '  <figure>', '    <img src="stk1.jpg" alt="Circuito">', '    <figcaption>Circuito</figcaption>', '  </figure>', '</aside>'], objetivo: [3], opciones: ['aside img', 'figure', 'aside figcaption', 'img figure'], pista: 'La imagen dentro del lateral.' },
    { html: ['<main>', '  <h2>Qué es</h2>', '  <p>Texto</p>', '  <h2>Personajes</h2>', '</main>'], objetivo: [1, 3], opciones: ['main h2', 'main p', 'h2 main', 'main'], pista: 'Los dos encabezados de main.' }
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

  // UT2 · 2.2 Selectores (quiz «el selector del menú»)
  AW.preguntas.selectores = [
    { p: '¿Dónde va el CSS de tu página?', o: ['En una hoja aparte, `style.css`, enlazada con `<link>`', 'En el atributo `style` de cada etiqueta', 'Dentro de cada párrafo', 'En los atributos `font` y `align`'], c: 0, exp: 'Una hoja aparte vale para todas las páginas: se cambia una vez y cambia todo el sitio.' },
    { p: '¿Dónde va el `<link rel="stylesheet">`?', o: ['Dentro del `<head>`', 'Al final del `<body>`', 'Dentro del archivo CSS', 'Antes del `<!DOCTYPE html>`'], c: 0, exp: 'En el head, con href apuntando al archivo. Si no cambia nada, revisa la ruta y el nombre: minúsculas, sin espacios.' },
    { p: 'Se te olvida cerrar la llave de una regla. ¿Qué pasa?', o: ['El navegador avisa con un error', 'Deja de funcionar lo que viene después, sin aviso', 'Nada: el navegador la cierra', 'Solo falla esa regla'], c: 1, exp: 'El navegador no avisa: descarta lo que no entiende. Sin la llave, se pierde todo lo que viene detrás.' },
    { p: '¿Qué selector alcanza todo lo que lleva `class="precio"`?', o: ['`.precio`', '`precio`', '`*precio`', '`(precio)`'], c: 0, exp: 'La clase se escribe con un punto delante. precio a secas buscaría una etiqueta <precio>, que no existe.' },
    { p: '¿A qué alcanza `header p`?', o: ['A los `p` que están dentro del `header`', 'Al `header` y a todos los `p`', 'A los `header` que están dentro de un `p`', 'A nada: falta una coma'], c: 0, exp: 'Con un espacio, el segundo está dentro del primero. Con una coma serían los dos: header y todos los p.' },
    { p: '¿Qué selector alcanza solo el enlace del pie?', cod: '<p>Lee <a href="#">más</a>.</p>\n<footer>\n  <a href="#">Aviso legal</a>\n</footer>', o: ['`footer a`', '`a`', '`a footer`', '`.footer a`'], c: 0, exp: 'footer a: los enlaces dentro del footer. a los alcanza todos; a footer, un footer dentro de un enlace; .footer busca una clase que no hay.' },
    { p: '`h1, h2 { color: navy; }`, ¿qué hace?', o: ['Pone en azul marino los h1 y los h2', 'Pone en azul marino los h2 que están dentro de un h1', 'Solo los h1', 'Nada: falta un punto'], c: 0, exp: 'Con comas, la misma regla vale para varios selectores a la vez.' },
    { p: 'En la pestaña Estilos de DevTools, una declaración sale tachada. ¿Qué significa?', o: ['Que perdió frente a otra regla', 'Que tiene un error de escritura', 'Que está comentada', 'Que se ha borrado del archivo'], c: 0, exp: 'Lo tachado perdió: otra regla más concreta, o escrita después, le gana. Un error de escritura sale con un triángulo amarillo.' },
    { p: 'Sin CSS, un `<h1>` ya se ve grande y en negrita. ¿Por qué?', o: ['Por la hoja de estilo del navegador (user-agent)', 'Porque HTML lleva el tamaño dentro de la etiqueta', 'Por la fuente del sistema', 'Porque el h1 es una imagen'], c: 0, exp: 'Cada navegador trae su hoja de estilo por defecto. DevTools la enseña como «hoja de estilo de user-agent».' },
    { p: 'Cambias un color en DevTools y recargas la página. ¿Qué pasa?', o: ['Vuelve el color de antes: DevTools es para probar', 'El cambio se guarda en style.css', 'El cambio se publica en GitHub', 'La página da error'], c: 0, exp: 'Lo que tocas en DevTools se pierde al recargar. Si te gusta, lo escribes en tu hoja.' }
  ];

  // UT2 · 2.5 Las recetas (quiz «el menú a la derecha»)
  AW.preguntas.flexbox = [
    { p: '¿Qué línea de la receta pone los enlaces del menú en fila?', o: ['`display: flex`', '`list-style: none`', '`text-decoration: none`', '`padding: 0`'], c: 0, exp: 'display: flex en el ul pone en fila lo que tiene dentro. list-style quita las viñetas y text-decoration, el subrayado.' },
    { p: 'En la receta del menú, ¿para qué es `list-style: none`?', o: ['Quita las viñetas de la lista', 'Pone los enlaces en fila', 'Quita el subrayado', 'Quita el color'], c: 0, exp: 'El menú es una lista, y las listas traen viñetas. list-style: none las quita.' },
    { p: '¿Qué cambias para que el menú quede centrado?', o: ['`justify-content: center`', '`text-align: middle`', '`align: center`', '`margin: center`'], c: 0, exp: 'En un flex, justify-content decide dónde va la fila: flex-start, center o flex-end.' },
    { p: '¿Qué separa los enlaces del menú sin usar márgenes?', o: ['`gap`', '`space`', '`border`', '`line-height`'], c: 0, exp: 'gap pone el hueco entre los hijos, y solo entre ellos. Funciona igual en la galería.' },
    { p: 'En la receta de la galería, ¿qué cambias para tener tres columnas?', o: ['`repeat(3, 1fr)`', '`gap: 3`', '`grid-column: span 3`', '`width: 3fr`'], c: 0, exp: 'repeat(3, 1fr) son tres columnas iguales: 1fr es una parte del espacio.' },
    { p: 'Con `grid-template-columns: 2fr 1fr`, ¿cómo quedan las columnas?', o: ['La primera, el doble de ancha que la segunda', 'La primera mide 2 rem', 'Hay tres columnas', 'Las dos iguales'], c: 0, exp: 'fr es una parte del espacio libre: 2fr y 1fr reparten en tres partes, dos para el main y una para el aside.' },
    { p: '`.destacada { grid-column: span 2; }`, ¿qué hace?', o: ['La captura ocupa dos columnas', 'La captura se ve dos veces', 'Pone dos capturas en fila', 'Deja dos huecos vacíos'], c: 0, exp: 'span 2 hace que esa caja ocupe dos columnas de la rejilla: así se destaca una captura.' },
    { p: '¿Qué hace `@media (min-width: 48rem) { … }`?', o: ['Aplica esas reglas solo desde 48rem de ancho', 'Aplica esas reglas solo en el móvil', 'Pone la página a 48rem de ancho', 'Cambia la letra a 48rem'], c: 0, exp: 'Es una media query: sus reglas solo valen cuando la pantalla mide al menos 48rem (768 px). La base, el móvil, va fuera.' },
    { p: '¿Cómo compruebas en clase cómo se ve tu página en un móvil?', o: ['DevTools, modo dispositivo (Ctrl+Mayús+M)', 'Con el zoom del navegador', 'Cambiando el tamaño de letra del navegador', 'Con el validador de CSS'], c: 0, exp: 'El modo dispositivo enseña la página al ancho de un teléfono, por ejemplo 375 px.' },
    { p: '`nav a:hover`, ¿cuándo se aplica?', o: ['Con el ratón encima del enlace', 'Al pulsar el enlace', 'Siempre', 'Cuando el enlace ya se ha visitado'], c: 0, exp: ':hover es el estado del elemento con el ratón encima: así el visitante ve que el menú responde.' }
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
        if (p.cod) ponVentana(lang === 'css' ? 'style.css' : 'index.html', AW.resalta[lang](p.cod));
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

  /* ---------- simulador de la caja: margin, border y padding, lado a lado (UT2) ----------
     <div class="caja-sim"></div> monta un grupo de deslizadores por propiedad («los 4» y cada lado),
     con la unidad elegible (rem o px: al cambiarla, los valores se convierten con 1rem = 16px), la ficha
     técnica de la página de SuperTuxKart entre dos párrafos y el CSS que sale, escrito de la forma más
     corta (1, 2 o 4 valores). La casilla «Ver las capas» pinta el margen y el relleno con los colores de
     DevTools. La vista va a 1,5 veces su tamaño para que se lea proyectada. */
  function montaCaja(el) {
    const LADOS = ['top', 'right', 'bottom', 'left'];
    const PROPS = [
      { p: 'margin', u0: 'rem', ini: 1, rango: { rem: [3, 0.25], px: [48, 4] } },
      { p: 'border', u0: 'px', ini: 2, rango: { rem: [1, 0.125], px: [16, 1] } },
      { p: 'padding', u0: 'rem', ini: 1, rango: { rem: [3, 0.25], px: [48, 4] } }
    ];
    const ESCALA = 1.5;
    const val = {};
    const prop = (p) => PROPS.find((x) => x.p === p);
    const txt = (n, u) => (n === 0 ? '0' : n + u);
    const px = (n, u) => n * (u === 'rem' ? 16 : 1) * ESCALA + 'px';
    const redondea = (n, paso) => parseFloat((Math.round(n / paso) * paso).toFixed(4));
    const junto = (a, u) => {
      const [t, r, b, l] = a.map((n) => txt(n, u));
      if (t === r && r === b && b === l) return t;
      if (t === b && r === l) return t + ' ' + r;
      return [t, r, b, l].join(' ');
    };
    const fila = (x, lado, i) => '<label class="cs-fila' + (lado ? '' : ' cs-todos') + '"><span>' + (lado || 'los 4') + '</span>'
      + '<input type="range" min="0" data-p="' + x.p + '" data-i="' + (lado ? i : 'todos') + '"><output></output></label>';
    el.innerHTML = '<div class="cs-mandos">'
      + PROPS.map((x) => '<div class="cs-grupo cs-' + x.p + '"><p class="cs-titulo">' + x.p
        + '<span class="cs-unidad"><button type="button" data-p="' + x.p + '" data-u="rem">rem</button> / <button type="button" data-p="' + x.p + '" data-u="px">px</button></span></p>'
        + fila(x, '', 0) + LADOS.map((l, i) => fila(x, l, i)).join('') + '</div>').join('')
      + '</div>'
      + '<div class="ventana cs-ventana"><div class="ventana-barra"><i></i><i></i><i></i><span>style.css</span></div><pre class="cod compacto"></pre></div>'
      + '<div class="cs-vista"><div class="cs-lienzo">'
      + '<p class="cs-texto">SuperTuxKart es un juego de carreras de karts libre y gratuito. Salió en 2004 y sigue actualizándose.</p>'
      + '<div class="cs-margen"><div class="cs-caja"><div class="cs-contenido"><b>Ficha técnica</b><br>Primera versión: 2004<br>Licencia: GPL</div></div></div>'
      + '<p class="cs-texto">Se puede jugar en Windows, Linux, macOS y Android.</p></div>'
      + '<p class="cs-leyenda"><span class="m">margin</span><span class="b">border</span><span class="p">padding</span><span class="c">contenido</span></p>'
      + '<div class="cs-botones"><label class="cs-ver"><input type="checkbox"> Ver las capas</label>'
      + '<button type="button" class="btn btn-ghost cs-reinicia">Volver a empezar</button></div></div>';
    // la unidad de un grupo: el rango de sus deslizadores y cuál de las dos sale en negrita
    const ponUnidad = (x) => {
      const [max, paso] = x.rango[x.u];
      el.querySelectorAll('input[data-p="' + x.p + '"]').forEach((inp) => { inp.max = max; inp.step = paso; });
      el.querySelectorAll('.cs-unidad button[data-p="' + x.p + '"]').forEach((b) => b.classList.toggle('activa', b.dataset.u === x.u));
    };
    const pinta = () => {
      const m = val.margin, b = val.border, p = val.padding;
      const um = prop('margin').u, ub = prop('border').u, up = prop('padding').u;
      el.querySelector('.cs-margen').style.padding = m.map((n) => px(n, um)).join(' ');
      const caja = el.querySelector('.cs-caja');
      caja.style.borderWidth = b.map((n) => px(n, ub)).join(' ');
      caja.style.padding = p.map((n) => px(n, up)).join(' ');
      el.querySelectorAll('.cs-fila input').forEach((inp) => {
        const a = val[inp.dataset.p];
        const u = prop(inp.dataset.p).u;
        if (inp.dataset.i === 'todos') {
          inp.value = a[0];
          inp.nextElementSibling.textContent = a.every((n) => n === a[0]) ? txt(a[0], u) : '—';
        } else {
          inp.value = a[+inp.dataset.i];
          inp.nextElementSibling.textContent = txt(a[+inp.dataset.i], u);
        }
      });
      // los cuatro iguales, en una línea; si no, solo los lados que tienen borde
      const linea = (n) => (n ? n + ub + ' solid #041c3f' : '0');
      const bordes = b.every((n) => n === b[0])
        ? ['  border: ' + linea(b[0]) + ';']
        : LADOS.map((l, i) => (b[i] ? '  border-' + l + ': ' + linea(b[i]) + ';' : '')).filter(Boolean);
      const css = ['.ficha {', '  background: #e3ecf3;', '  margin: ' + junto(m, um) + ';', ...bordes, '  padding: ' + junto(p, up) + ';', '}'].join('\n');
      el.querySelector('pre').innerHTML = AW.resalta.css(css);
    };
    const reinicia = () => {
      PROPS.forEach((x) => { x.u = x.u0; val[x.p] = [x.ini, x.ini, x.ini, x.ini]; ponUnidad(x); });
      pinta();
    };
    el.querySelector('.cs-ver input').addEventListener('change', (e) => el.classList.toggle('cs-capas', e.target.checked));
    el.querySelectorAll('.cs-unidad button').forEach((btn) => btn.addEventListener('click', () => {
      const x = prop(btn.dataset.p);
      if (x.u === btn.dataset.u) return;
      const factor = btn.dataset.u === 'px' ? 16 : 1 / 16;
      x.u = btn.dataset.u;
      val[x.p] = val[x.p].map((n) => Math.min(redondea(n * factor, x.rango[x.u][1]), x.rango[x.u][0]));
      ponUnidad(x);
      pinta();
    }));
    el.addEventListener('input', (e) => {
      const inp = e.target.closest('input[type="range"]');
      if (!inp) return;
      const a = val[inp.dataset.p];
      const n = parseFloat(inp.value);
      if (inp.dataset.i === 'todos') a.fill(n); else a[+inp.dataset.i] = n;
      pinta();
    });
    el.querySelector('.cs-reinicia').addEventListener('click', reinicia);
    reinicia();
  }

  /* ---------- practica CSS: el HTML que se lee, el CSS que se escribe y la página al lado (UT2) ----------
     <div class="practica-css"></div> monta tres ventanas: index.html (solo se lee), style.css (un editor,
     siempre vacío al empezar: el alumno escribe la regla entera) y la página, que cambia mientras se escribe.
     Arriba, un encargo cada vez, en una frase. data-bloques elige bloques de AW.practicaCss (sin él, todos).

     Comprobar no mira el texto ni pide un valor exacto: pinta la página con el CSS del alumno y sin CSS en un
     iframe oculto, y mira en el estilo calculado si se cumple lo que se pide («quiere») y si nada más ha
     cambiado. Vale cualquier rojo para «en rojo» y cualquier relleno mayor para «aumenta el espacio». Si no se
     cumple, primero avisa de lo que el navegador calla: llaves, punto y coma, propiedades o valores que no
     existen, selectores que no alcanzan nada. Lo de :hover se mira otra vez con todos los elementos «con el
     ratón encima».

     Ayudas para unir las tres ventanas: en el HTML se marca en azul lo que alcanza el selector de la regla
     donde está el cursor, y pasar el ratón por una línea del HTML señala ese elemento en la página (y al revés).

     Cada ejercicio: pide (el encargo), sol (una solución, para «Ver solución» y «Así tiene que quedar»),
     pistas (dos), exp (se lee al acertar) y quiere, la lista de lo que tiene que cumplirse:
       { en: 'h1', p: 'color', vale: 'rojo' }      en: selector de los elementos; p: propiedad o grupo (padding,
                                                   margin, border, border-bottom, border-radius, background…)
       vale: un color por su nombre en español (rojo, naranja, amarillo, verde, azul, gris, blanco, negro),
             'mayor' (más que sin CSS), 'hay' (un borde que se ve), 'otro' (distinto que sin CSS) o el valor
             calculado tal cual ('center', '700', 'none', 'arial').
             También una lista de valores (['inline', 'inline-block']), 'columnas:2' (una rejilla de dos columnas)
             y 'libre' (ese elemento puede cambiar eso sin que cuente: no se pide ni se castiga).
       encima: true   se pide con el ratón encima.      deja: 'margin' o una lista   otros grupos que pueden cambiar.
     formas: varias listas «quiere» cuando hay más de una manera buena. usa: expresiones que el CSS tiene que
     llevar aunque la página se vea igual (para pedir var()). lineas: las que señala la primera pista.
     css (en el bloque o en el ejercicio): lo que ya está escrito en style.css al empezar. Solo lo lleva el
     bloque del examen, que trae la paleta en :root como el examen de verdad; en los demás empieza vacío. */
  AW.practicaCss = {
    paginas: {
      texto: [
        '<body>',
        '  <h1>SuperTuxKart</h1>',
        '  <p class="destacado">Un juego de carreras gratis.</p>',
        '  <h2>Historia</h2>',
        '  <p>Salió en 2004.</p>',
        '  <p>Lee la <a href="#">guía</a>.</p>',
        '</body>'
      ],
      menu: [
        '<nav>',
        '  <a href="#">Inicio</a>',
        '  <a href="#">Personajes</a>',
        '  <a href="#">Circuitos</a>',
        '</nav>',
        '<p>Juega gratis. Lee la <a href="#">guía</a>.</p>'
      ],
      ficha: [
        '<h1>SuperTuxKart</h1>',
        '<img src="img/stk-mini-1.jpg" alt="Una carrera" width="160">',
        '<div class="ficha">',
        '  <h2>Ficha técnica</h2>',
        '  <p>Licencia: GPL</p>',
        '</div>',
        '<button>Jugar</button>'
      ],
      pagina: [
        '<header><h1>SuperTuxKart</h1></header>',
        '<main>',
        '  <h2>El juego</h2>',
        '  <p>Lee la <a href="#">guía</a>.</p>',
        '</main>',
        '<aside>',
        '  <h3>Capturas</h3>',
        '  <img src="img/stk-mini-1.jpg" alt="Una carrera" width="120">',
        '</aside>',
        '<footer><p>Hecho por Ana.</p></footer>'
      ],
      tabla: [
        '<table>',
        '  <tr><th>Dato</th><th>Valor</th></tr>',
        '  <tr><td>Año</td><td>2004</td></tr>',
        '  <tr><td>Licencia</td><td>GPL</td></tr>',
        '  <tr><td>Precio</td><td>Gratis</td></tr>',
        '  <tr><td>Jugadores</td><td>De 1 a 8</td></tr>',
        '</table>'
      ],
      lista: [
        '<nav>',
        '  <ul>',
        '    <li><a href="#">Inicio</a></li>',
        '    <li><a href="#">Personajes</a></li>',
        '    <li><a href="#">Circuitos</a></li>',
        '  </ul>',
        '</nav>'
      ],
      galeria: [
        '<div class="galeria">',
        '  <img src="img/stk-mini-1.jpg" alt="Captura 1" width="150">',
        '  <img src="img/stk-mini-2.jpg" alt="Captura 2" width="150">',
        '  <img src="img/stk-mini-3.jpg" alt="Captura 3" width="150">',
        '  <img src="img/stk-mini-4.jpg" alt="Captura 4" width="150">',
        '</div>'
      ]
    },
    // ampliación de la página (1,5 si no se dice): la de la ficha es más alta
    zoom: { ficha: 1.2, pagina: 1.2 },
    bloques: [
      { id: 'etiqueta', nombre: 'Etiqueta y color', pagina: 'texto', ejercicios: [
        { id: 'titulo',
          pide: 'Pon el título «SuperTuxKart» en rojo.',
          sol: 'h1 {\n  color: red;\n}',
          quiere: [{ en: 'h1', p: 'color', vale: 'rojo' }],
          pistas: ['El título es la línea 2 del HTML: la etiqueta `h1`. El selector es el nombre de la etiqueta.', 'La propiedad del color del texto es `color`. Rojo es `red`.'],
          exp: '`h1` elige el título y `color` pinta su texto.' },
        { id: 'fondo',
          pide: 'Pon un fondo amarillo al título «SuperTuxKart».',
          sol: 'h1 {\n  background: yellow;\n}',
          quiere: [{ en: 'h1', p: 'background', vale: 'amarillo' }],
          pistas: ['El título es la línea 2 del HTML: la etiqueta `h1`.', 'La propiedad del fondo es `background`. Amarillo es `yellow`.'],
          exp: '`background` pinta el fondo del elemento.' },
        { id: 'parrafos',
          pide: 'Pon todos los párrafos en gris.',
          sol: 'p {\n  color: gray;\n}',
          quiere: [{ en: 'p', p: 'color', vale: 'gris' }],
          pistas: ['Los párrafos son las líneas 3, 5 y 6 del HTML. Su etiqueta es `p`.', 'La propiedad del color del texto es `color`. Gris es `gray`.'],
          exp: 'El selector `p` llega a todos los párrafos de la página.' },
        { id: 'enlace',
          pide: 'Pon el enlace en verde.',
          sol: 'a {\n  color: green;\n}',
          quiere: [{ en: 'a', p: 'color', vale: 'verde' }],
          pistas: ['El enlace está en la línea 6 del HTML, dentro del párrafo. Su etiqueta es `a`.', 'La regla es para `a`, no para `p`. Verde es `green`.'],
          exp: 'El enlace es la etiqueta `a`. Con el color puesto en `p`, el enlace sigue azul: el navegador da a los enlaces su propio color.' }
      ] },
      { id: 'clase', nombre: 'Clase y comas', pagina: 'texto', ejercicios: [
        { id: 'clase',
          pide: 'Pon un fondo verde solo al primer párrafo.',
          sol: '.destacado {\n  background: lightgreen;\n}',
          quiere: [{ en: '.destacado', p: 'background', vale: 'verde' }],
          pistas: ['El primer párrafo es la línea 3 del HTML. Es el único que lleva `class="destacado"`.', 'Una clase se escribe en el CSS con un punto delante: `.destacado`. La propiedad del fondo es `background`.'],
          exp: '`.destacado` llega solo a los elementos que llevan esa clase. `p` habría cambiado los tres párrafos.' },
        { id: 'comas',
          pide: 'Pon los dos títulos en azul.',
          sol: 'h1, h2 {\n  color: blue;\n}',
          quiere: [{ en: 'h1, h2', p: 'color', vale: 'azul' }],
          pistas: ['Los títulos son las líneas 2 y 4 del HTML: un `h1` y un `h2`.', 'Con una coma, una sola regla vale para los dos: `h1, h2`. Azul es `blue`.'],
          exp: 'La coma junta selectores: la regla vale para `h1` y para `h2`.' }
      ] },
      { id: 'dentro', nombre: 'Uno dentro de otro', pagina: 'menu', ejercicios: [
        { id: 'menu',
          pide: 'Pon en rojo solo los enlaces del menú.',
          sol: 'nav a {\n  color: red;\n}',
          quiere: [{ en: 'nav a', p: 'color', vale: 'rojo' }],
          pistas: ['Los enlaces del menú son las líneas 2, 3 y 4 del HTML. Están dentro de `nav`. El otro enlace está dentro de `p`.', 'Dos selectores separados por un espacio: `nav a` llega a los `a` que están dentro de `nav`.'],
          exp: '`nav a` llega solo a los enlaces que están dentro de `nav`. `a` habría cambiado también el del párrafo.' },
        { id: 'parrafo',
          pide: 'Pon en verde solo el enlace del párrafo.',
          sol: 'p a {\n  color: green;\n}',
          quiere: [{ en: 'p a', p: 'color', vale: 'verde' }],
          pistas: ['Ese enlace está en la línea 6 del HTML, dentro de un `p`.', 'Igual que con el menú, ahora con el párrafo: `p a`.'],
          exp: '`p a` llega a los enlaces que están dentro de un párrafo.' }
      ] },
      { id: 'letra', nombre: 'La letra', pagina: 'texto', ejercicios: [
        { id: 'familia', lineas: [0],
          pide: 'Pon toda la página con la letra Arial.',
          sol: 'body {\n  font-family: Arial, sans-serif;\n}',
          quiere: [{ en: 'h1, h2, p, a', p: 'font-family', vale: 'arial' }],
          pistas: ['Toda la página está dentro de `body`: la línea 1 del HTML. Lo que pones en `body` llega a todo el texto.', 'La propiedad que elige la letra es `font-family`.'],
          exp: 'La letra se pone una vez en `body`. La heredan los títulos, los párrafos y los enlaces.' },
        { id: 'tamano',
          pide: 'Haz más grande el título «SuperTuxKart».',
          sol: 'h1 {\n  font-size: 3rem;\n}',
          quiere: [{ en: 'h1', p: 'font-size', vale: 'mayor' }],
          pistas: ['El título es la línea 2 del HTML: la etiqueta `h1`.', 'La propiedad del tamaño de la letra es `font-size`. El número y la unidad van juntos: `3rem`.'],
          exp: '`font-size` cambia el tamaño de la letra. `1rem` es el tamaño normal del texto; `3rem`, tres veces más.' },
        { id: 'centrar',
          pide: 'Centra el título «SuperTuxKart».',
          sol: 'h1 {\n  text-align: center;\n}',
          quiere: [{ en: 'h1', p: 'text-align', vale: 'center' }],
          pistas: ['El título es la línea 2 del HTML: la etiqueta `h1`.', 'La propiedad es `text-align` y el valor, `center`.'],
          exp: '`text-align` coloca el texto a la izquierda (`left`), en el centro (`center`) o a la derecha (`right`).' },
        { id: 'negrita',
          pide: 'Pon en negrita el primer párrafo.',
          sol: '.destacado {\n  font-weight: bold;\n}',
          quiere: [{ en: '.destacado', p: 'font-weight', vale: '700' }],
          pistas: ['El primer párrafo es la línea 3 del HTML y lleva `class="destacado"`. El selector es `.destacado`.', 'La propiedad de la negrita es `font-weight` y el valor, `bold`.'],
          exp: '`font-weight: bold` pone el texto en negrita.' },
        { id: 'consolas',
          pide: 'Pon los dos títulos con la letra Consolas.',
          sol: 'h1, h2 {\n  font-family: Consolas, monospace;\n}',
          quiere: [{ en: 'h1, h2', p: 'font-family', vale: 'consolas' }],
          pistas: ['Los títulos son las líneas 2 y 4 del HTML: `h1` y `h2`. Con una coma, una regla vale para los dos.', 'La propiedad que elige la letra es `font-family`.'],
          exp: 'La letra se puede cambiar solo en algunos elementos. El resto sigue con la suya.' }
      ] },
      { id: 'caja', nombre: 'La caja', pagina: 'ficha', ejercicios: [
        { id: 'borde',
          pide: 'Pon un borde a la ficha técnica.',
          sol: '.ficha {\n  border: 2px solid black;\n}',
          quiere: [{ en: '.ficha', p: 'border', vale: 'hay' }],
          pistas: ['La ficha técnica es la línea 3 del HTML: un `div` con `class="ficha"`. El selector es `.ficha`.', 'La propiedad es `border`. Lleva tres valores separados por espacios: el grosor, el tipo de línea y el color. Por ejemplo, `2px solid black`.'],
          exp: '`border` dibuja la línea de la caja: grosor, tipo y color.' },
        { id: 'fondo',
          pide: 'Pon un fondo gris a la ficha técnica.',
          sol: '.ficha {\n  background: lightgray;\n}',
          quiere: [{ en: '.ficha', p: 'background', vale: 'gris' }],
          pistas: ['La ficha técnica es la línea 3 del HTML. El selector es `.ficha`.', 'La propiedad del fondo es `background`. Un gris claro es `lightgray`.'],
          exp: 'El fondo llega hasta el borde de la caja.' },
        { id: 'relleno',
          pide: 'Aumenta el espacio entre el texto del botón y su borde.',
          sol: 'button {\n  padding: 1rem;\n}',
          quiere: [{ en: 'button', p: 'padding', vale: 'mayor' }],
          pistas: ['El botón es la línea 7 del HTML: la etiqueta `button`.', 'El espacio entre el contenido y el borde es el relleno: `padding`. Por ejemplo, `1rem`.'],
          exp: '`padding` es el espacio entre el contenido y el borde de la caja.' },
        { id: 'esquinas',
          pide: 'Redondea las esquinas de la imagen.',
          sol: 'img {\n  border-radius: 12px;\n}',
          quiere: [{ en: 'img', p: 'border-radius', vale: 'mayor' }],
          pistas: ['La imagen es la línea 2 del HTML: la etiqueta `img`.', 'La propiedad de las esquinas redondeadas es `border-radius`. Por ejemplo, `12px`.'],
          exp: '`border-radius` redondea las esquinas. Cuanto mayor es el número, más redondas.' },
        { id: 'margen',
          pide: 'Separa la ficha técnica de la imagen.',
          sol: '.ficha {\n  margin-top: 2rem;\n}',
          formas: [[{ en: '.ficha', p: 'margin-top', vale: 'mayor', deja: 'margin' }], [{ en: 'img', p: 'margin-bottom', vale: 'mayor', deja: 'margin' }]],
          pistas: ['La ficha técnica es la línea 3 del HTML: `.ficha`. La imagen está justo encima.', 'El espacio por fuera de la caja es el margen: `margin`. Solo el lado de arriba es `margin-top`.'],
          exp: '`margin` aparta la caja de las demás. `margin-top` es solo el lado de arriba.' },
        { id: 'linea',
          pide: 'Pon un borde solo debajo del título «SuperTuxKart».',
          sol: 'h1 {\n  border-bottom: 4px solid green;\n}',
          quiere: [{ en: 'h1', p: 'border-bottom', vale: 'hay' }],
          pistas: ['El título es la línea 1 del HTML: la etiqueta `h1`.', 'Es un borde de un solo lado. El lado va en el nombre: `border-bottom` es el de abajo.'],
          exp: '`border-bottom` dibuja solo la línea de abajo. `border` habría dibujado los cuatro lados.' }
      ] },
      { id: 'raton', nombre: 'El menú y el ratón', pagina: 'menu', ejercicios: [
        { id: 'subrayado',
          pide: 'Quita el subrayado a los enlaces del menú.',
          sol: 'nav a {\n  text-decoration: none;\n}',
          quiere: [{ en: 'nav a', p: 'text-decoration', vale: 'none' }],
          pistas: ['Los enlaces del menú son las líneas 2, 3 y 4 del HTML. El selector es `nav a`.', 'La propiedad es `text-decoration` y el valor, `none`.'],
          exp: '`text-decoration: none` quita el subrayado que el navegador pone a los enlaces.' },
        { id: 'encima',
          pide: 'Cambia el fondo de los enlaces del menú cuando el ratón está encima.',
          sol: 'nav a:hover {\n  background: yellow;\n}',
          quiere: [{ en: 'nav a', p: 'background', vale: 'otro', encima: true }],
          pistas: ['El selector de los enlaces del menú es `nav a`. Para «con el ratón encima» se le añade `:hover`, sin espacio.', 'El selector es `nav a:hover` y la propiedad del fondo, `background`.'],
          exp: '`:hover` es el elemento con el ratón encima. Pasa el ratón por el menú de «Tu página» para verlo.' }
      ] },
      { id: 'zonas', nombre: 'Las zonas de la página', pagina: 'pagina', ejercicios: [
        { id: 'fondo', lineas: [],
          pide: 'Pon el fondo de toda la página en negro y el texto en blanco.',
          sol: 'body {\n  background: black;\n  color: white;\n}',
          formas: [[{ en: 'body', p: 'background', vale: 'negro' }, { en: 'h1, h2, h3, p', p: 'color', vale: 'blanco' }, { en: 'a', p: 'color', vale: 'libre' }],
            [{ en: 'html', p: 'background', vale: 'negro' }, { en: 'h1, h2, h3, p', p: 'color', vale: 'blanco' }, { en: 'a', p: 'color', vale: 'libre' }]],
          pistas: ['Toda la página está dentro de `body`. Son dos líneas en la regla `body`.', 'El fondo es `background` y el color del texto, `color`. Negro es `black` y blanco, `white`.'],
          exp: 'El fondo y el color del texto de toda la página se ponen en `body`. Los enlaces siguen con su color.' },
        { id: 'titulos',
          pide: 'Pon los tres títulos en verde.',
          sol: 'h1, h2, h3 {\n  color: green;\n}',
          quiere: [{ en: 'h1, h2, h3', p: 'color', vale: 'verde' }],
          pistas: ['Los títulos están en las líneas 1, 3 y 7 del HTML: `h1`, `h2` y `h3`.', 'Con comas, una sola regla vale para los tres: `h1, h2, h3`. La propiedad es `color`.'],
          exp: 'Las comas juntan tantos selectores como haga falta.' },
        { id: 'pie',
          pide: 'Pon un borde solo encima del pie de página.',
          sol: 'footer {\n  border-top: 2px solid black;\n}',
          quiere: [{ en: 'footer', p: 'border-top', vale: 'hay' }],
          pistas: ['El pie de página es la línea 10 del HTML: la etiqueta `footer`.', 'El borde de un solo lado lleva el lado en el nombre: `border-top` es el de arriba.'],
          exp: '`border-top` dibuja solo el borde de arriba.' },
        { id: 'centro',
          pide: 'Centra el texto del pie de página.',
          sol: 'footer {\n  text-align: center;\n}',
          quiere: [{ en: 'footer p', p: 'text-align', vale: 'center' }],
          pistas: ['El pie de página es la línea 10 del HTML: la etiqueta `footer`.', 'La propiedad es `text-align` y el valor, `center`.'],
          exp: '`text-align` se pone en la zona y lo hereda el texto que hay dentro.' }
      ] },
      { id: 'tabla', nombre: 'La tabla', pagina: 'tabla', ejercicios: [
        { id: 'cabecera',
          pide: 'Pon un fondo verde a la cabecera de la tabla.',
          sol: 'th {\n  background: lightgreen;\n}',
          formas: [[{ en: 'th', p: 'background', vale: 'verde' }], [{ en: 'tr:first-child', p: 'background', vale: 'verde' }]],
          pistas: ['La cabecera es la línea 2 del HTML. Sus celdas son las etiquetas `th`.', 'El selector es `th` y la propiedad del fondo, `background`.'],
          exp: '`th` son las celdas de la cabecera; `td`, las demás.' },
        { id: 'celdas',
          pide: 'Aumenta el espacio dentro de todas las celdas de la tabla.',
          sol: 'th, td {\n  padding: 0.5rem 1rem;\n}',
          quiere: [{ en: 'th, td', p: 'padding', vale: 'mayor' }],
          pistas: ['Las celdas son `th` (las de la cabecera) y `td` (las demás). Con una coma, una regla vale para las dos.', 'El espacio por dentro es el relleno: `padding`.'],
          exp: 'Con `padding` en las celdas, la tabla respira y se lee mejor.' },
        { id: 'lineas',
          pide: 'Pon un borde debajo de cada celda de la tabla.',
          sol: 'th, td {\n  border-bottom: 1px solid gray;\n}',
          quiere: [{ en: 'th, td', p: 'border-bottom', vale: 'hay' }],
          pistas: ['Las celdas son `th` y `td`. El selector es `th, td`.', 'El borde de abajo es `border-bottom`. Lleva el grosor, el tipo de línea y el color.'],
          exp: 'Una línea fina bajo cada fila separa los datos sin recargar la tabla.' },
        { id: 'cebra', lineas: [2, 4],
          pide: 'Pon un fondo gris a las filas pares de la tabla.',
          sol: 'tr:nth-child(even) {\n  background: lightgray;\n}',
          formas: [[{ en: 'tr:nth-child(even)', p: 'background', vale: 'gris' }], [{ en: 'tr:nth-child(even) td', p: 'background', vale: 'gris' }]],
          pistas: ['Las filas son las etiquetas `tr`. Las pares son la segunda y la cuarta: las líneas 3 y 5 del HTML.', 'A `tr` se le añade `:nth-child(even)`, sin espacio. `even` significa «pares».'],
          exp: '`tr:nth-child(even)` elige las filas pares. Con `odd`, las impares.' }
      ] },
      { id: 'fila', nombre: 'El menú en fila', pagina: 'lista', ejercicios: [
        { id: 'puntos', lineas: [1],
          pide: 'Quita los puntos de la lista del menú.',
          sol: 'nav ul {\n  list-style: none;\n}',
          quiere: [{ en: 'li', p: 'list-style-type', vale: 'none' }],
          pistas: ['La lista es la línea 2 del HTML: la etiqueta `ul`, dentro de `nav`.', 'La propiedad de los puntos de una lista es `list-style` y el valor, `none`.'],
          exp: '`list-style: none` quita los puntos de la lista.' },
        { id: 'fila', lineas: [1],
          pide: 'Pon los enlaces del menú en fila.',
          sol: 'nav ul {\n  display: flex;\n}',
          formas: [[{ en: 'ul', p: 'display', vale: 'flex', deja: ['padding', 'margin', 'gap', 'justify-content'] }, { en: 'li', p: 'list-style-type', vale: 'libre' }], [{ en: 'li', p: 'display', vale: ['inline', 'inline-block'], deja: ['padding', 'margin'] }, { en: 'li', p: 'list-style-type', vale: 'libre' }]],
          pistas: ['Los enlaces están dentro de la lista: la etiqueta `ul`, en la línea 2 del HTML. La regla es para la lista.', 'La propiedad es `display` y el valor, `flex`: pone en fila lo que hay dentro.'],
          exp: '`display: flex` en la lista pone sus elementos en fila.' },
        { id: 'centrado', lineas: [1],
          pide: 'Pon el menú en fila y centrado.',
          sol: 'nav ul {\n  display: flex;\n  justify-content: center;\n}',
          quiere: [{ en: 'ul', p: 'display', vale: 'flex', deja: ['padding', 'margin', 'gap', 'justify-content'] }, { en: 'li', p: 'list-style-type', vale: 'libre' }, { en: 'ul', p: 'justify-content', vale: 'center' }],
          pistas: ['Son dos líneas en la regla de la lista, `nav ul`. La primera la pone en fila: `display: flex`.', 'La segunda dice dónde va la fila: `justify-content: center`.'],
          exp: '`justify-content` coloca la fila: al principio (`flex-start`), en el centro (`center`) o al final (`flex-end`).' },
        { id: 'separa', lineas: [1],
          pide: 'Pon el menú en fila y separa los enlaces.',
          sol: 'nav ul {\n  display: flex;\n  gap: 2rem;\n}',
          formas: [[{ en: 'ul', p: 'display', vale: 'flex', deja: ['padding', 'margin', 'gap', 'justify-content'] }, { en: 'li', p: 'list-style-type', vale: 'libre' }, { en: 'ul', p: 'gap', vale: 'mayor' }],
            [{ en: 'ul', p: 'display', vale: 'flex', deja: ['padding', 'margin', 'gap', 'justify-content'] }, { en: 'li', p: 'list-style-type', vale: 'libre' }, { en: 'li', p: 'margin', vale: 'mayor' }],
            [{ en: 'ul', p: 'display', vale: 'flex', deja: ['padding', 'margin', 'gap', 'justify-content'] }, { en: 'li', p: 'list-style-type', vale: 'libre' }, { en: 'li', p: 'padding', vale: 'mayor' }],
            [{ en: 'ul', p: 'display', vale: 'flex', deja: ['padding', 'margin', 'gap', 'justify-content'] }, { en: 'li', p: 'list-style-type', vale: 'libre' }, { en: 'a', p: 'margin', vale: 'mayor' }],
            [{ en: 'ul', p: 'display', vale: 'flex', deja: ['padding', 'margin', 'gap', 'justify-content'] }, { en: 'li', p: 'list-style-type', vale: 'libre' }, { en: 'a', p: 'padding', vale: 'mayor' }]],
          pistas: ['Son dos líneas en la regla de la lista, `nav ul`. La primera la pone en fila: `display: flex`.', 'El espacio entre los elementos de la fila es `gap`. Por ejemplo, `2rem`.'],
          exp: '`gap` separa los elementos de la fila sin tocar los márgenes.' }
      ] },
      { id: 'variados', nombre: 'Más difíciles', pagina: 'texto', ejercicios: [
        { id: 'titulo',
          pide: 'Pon el título «SuperTuxKart» centrado, en blanco y con fondo azul.',
          sol: 'h1 {\n  text-align: center;\n  color: white;\n  background: blue;\n}',
          quiere: [{ en: 'h1', p: 'text-align', vale: 'center' }, { en: 'h1', p: 'color', vale: 'blanco' }, { en: 'h1', p: 'background', vale: 'azul' }],
          pistas: ['Son tres líneas dentro de una sola regla `h1`. Cada línea termina en punto y coma.', 'Las propiedades son `text-align`, `color` y `background`.'],
          exp: 'Una regla puede llevar varias líneas. Cada una termina en punto y coma.' },
        { id: 'dos',
          pide: 'Pon los dos títulos en verde y los párrafos en gris.',
          sol: 'h1, h2 {\n  color: green;\n}\n\np {\n  color: gray;\n}',
          quiere: [{ en: 'h1, h2', p: 'color', vale: 'verde' }, { en: 'p', p: 'color', vale: 'gris' }],
          pistas: ['Son dos reglas, una debajo de la otra: una para los títulos y otra para los párrafos.', 'Los selectores son `h1, h2` y `p`. La propiedad de las dos reglas es `color`.'],
          exp: 'Cada regla tiene su selector. La hoja de estilo es una lista de reglas.' },
        { id: 'destacado',
          pide: 'Pon en negrita y con fondo amarillo solo el primer párrafo.',
          sol: '.destacado {\n  font-weight: bold;\n  background: yellow;\n}',
          quiere: [{ en: '.destacado', p: 'font-weight', vale: '700' }, { en: '.destacado', p: 'background', vale: 'amarillo' }],
          pistas: ['El primer párrafo lleva `class="destacado"`: el selector es `.destacado`. Son dos líneas en la misma regla.', 'Las propiedades son `font-weight` y `background`.'],
          exp: 'Con la clase, la regla llega solo al párrafo que la lleva.' },
        { id: 'caja', pagina: 'ficha',
          pide: 'Haz una caja con la ficha técnica: fondo gris, borde y espacio por dentro.',
          sol: '.ficha {\n  background: lightgray;\n  border: 2px solid black;\n  padding: 1rem;\n}',
          quiere: [{ en: '.ficha', p: 'background', vale: 'gris' }, { en: '.ficha', p: 'border', vale: 'hay' }, { en: '.ficha', p: 'padding', vale: 'mayor' }],
          pistas: ['Son tres líneas dentro de la regla `.ficha`.', 'Las propiedades son `background`, `border` y `padding`. El espacio por dentro es el relleno.'],
          exp: 'Fondo, borde y relleno: las tres cosas que hacen una caja.' },
        { id: 'boton', pagina: 'ficha',
          pide: 'Haz el botón más grande: letra más grande, más espacio por dentro y esquinas redondeadas.',
          sol: 'button {\n  font-size: 1.5rem;\n  padding: 1rem;\n  border-radius: 12px;\n}',
          quiere: [{ en: 'button', p: 'font-size', vale: 'mayor' }, { en: 'button', p: 'padding', vale: 'mayor' }, { en: 'button', p: 'border-radius', vale: 'mayor' }],
          pistas: ['El botón es la línea 7 del HTML: la etiqueta `button`. Son tres líneas en la misma regla.', 'Las propiedades son `font-size`, `padding` y `border-radius`.'],
          exp: 'Con tres líneas, el botón del navegador pasa a ser un botón tuyo.' },
        { id: 'botones', pagina: 'menu',
          pide: 'Haz que los enlaces del menú parezcan botones: fondo azul, letra blanca, sin subrayado y con espacio por dentro.',
          sol: 'nav a {\n  background: blue;\n  color: white;\n  text-decoration: none;\n  padding: 0.5rem 1rem;\n}',
          quiere: [{ en: 'nav a', p: 'background', vale: 'azul' }, { en: 'nav a', p: 'color', vale: 'blanco' }, { en: 'nav a', p: 'text-decoration', vale: 'none' }, { en: 'nav a', p: 'padding', vale: 'mayor' }],
          pistas: ['El selector de los enlaces del menú es `nav a`. Son cuatro líneas en la misma regla.', 'Las propiedades son `background`, `color`, `text-decoration` y `padding`.'],
          exp: 'Es el menú de casi todas las webs: enlaces con fondo, sin subrayado y con relleno.' },
        { id: 'centrar', pagina: 'ficha',
          pide: 'Pon un borde a la ficha técnica, hazla más estrecha y céntrala.',
          sol: '.ficha {\n  border: 2px solid black;\n  max-width: 15rem;\n  margin: 0 auto;\n}',
          quiere: [{ en: '.ficha', p: 'border', vale: 'hay' }, { en: '.ficha', p: 'margin-left', vale: 'mayor', deja: ['margin', 'max-width'] }, { en: '.ficha', p: 'margin-right', vale: 'mayor' }],
          pistas: ['Son tres líneas en la regla `.ficha`: el borde, el ancho máximo y el margen.', 'El ancho máximo es `max-width`. Para centrar una caja, el margen de los lados es `auto`: `margin: 0 auto`.'],
          exp: 'Con un ancho máximo y `margin: 0 auto`, la caja queda centrada. Así se centra una zona de la página.' },
        { id: 'lateral', pagina: 'pagina',
          pide: 'Haz una caja con el lateral: fondo gris, borde, esquinas redondeadas y espacio por dentro.',
          sol: 'aside {\n  background: lightgray;\n  border: 1px solid gray;\n  border-radius: 12px;\n  padding: 1rem;\n}',
          quiere: [{ en: 'aside', p: 'background', vale: 'gris' }, { en: 'aside', p: 'border', vale: 'hay' }, { en: 'aside', p: 'border-radius', vale: 'mayor' }, { en: 'aside', p: 'padding', vale: 'mayor' }],
          pistas: ['El lateral es la línea 6 del HTML: la etiqueta `aside`. Son cuatro líneas en la misma regla.', 'Las propiedades son `background`, `border`, `border-radius` y `padding`.'],
          exp: 'Es la caja del lateral de tu página: fondo, borde, esquinas y relleno.' },
        { id: 'raton', pagina: 'menu',
          pide: 'Cambia el fondo y el color de los enlaces del menú cuando el ratón está encima.',
          sol: 'nav a:hover {\n  background: blue;\n  color: white;\n}',
          quiere: [{ en: 'nav a', p: 'background', vale: 'otro', encima: true }, { en: 'nav a', p: 'color', vale: 'otro', encima: true }],
          pistas: ['El selector de los enlaces del menú con el ratón encima es `nav a:hover`. Son dos líneas en la regla.', 'Las propiedades son `background` y `color`.'],
          exp: 'Con `:hover` el enlace avisa de que se puede pulsar.' },
        { id: 'cebra', pagina: 'tabla',
          pide: 'Haz una tabla de cebra: más espacio en todas las celdas y fondo gris en las filas pares.',
          sol: 'th, td {\n  padding: 0.5rem 1rem;\n}\n\ntr:nth-child(even) {\n  background: lightgray;\n}',
          formas: [[{ en: 'th, td', p: 'padding', vale: 'mayor' }, { en: 'tr:nth-child(even)', p: 'background', vale: 'gris' }],
            [{ en: 'th, td', p: 'padding', vale: 'mayor' }, { en: 'tr:nth-child(even) td', p: 'background', vale: 'gris' }]],
          pistas: ['Son dos reglas: una para las celdas, `th, td`, y otra para las filas pares.', 'Las filas pares son `tr:nth-child(even)`. Las propiedades son `padding` y `background`.'],
          exp: 'Es la receta de la tabla: relleno en las celdas y las filas pares de otro color.' },
        { id: 'galeria', pagina: 'galeria',
          pide: 'Pon las capturas en una rejilla de dos columnas.',
          sol: '.galeria {\n  display: grid;\n  grid-template-columns: 1fr 1fr;\n}',
          quiere: [{ en: '.galeria', p: 'rejilla', vale: 'columnas:2' }, { en: '.galeria img', p: 'display', vale: 'libre' }],
          pistas: ['La caja de las capturas es la línea 1 del HTML: `.galeria`. Son dos líneas: una dice que es una rejilla y otra, cuántas columnas tiene.', 'La rejilla es `display: grid`. Dos columnas iguales: `grid-template-columns: 1fr 1fr`.'],
          exp: '`display: grid` hace la rejilla y `grid-template-columns` dice cuántas columnas tiene. `1fr 1fr` son dos iguales.' },
        { id: 'paleta', lineas: [1],
          pide: 'Guarda un color verde en la paleta con el nombre --accent. Ponlo de fondo al título «SuperTuxKart».',
          sol: ':root {\n  --accent: #a5e070;\n}\n\nh1 {\n  background: var(--accent);\n}',
          quiere: [{ en: 'h1', p: 'background', vale: 'verde' }],
          usa: [{ re: /--accent\s*:/, msg: 'Falta guardar el color en la paleta. Va dentro de `:root`, con el nombre `--accent`.' },
            { re: /background(-color)?\s*:\s*var\(\s*--accent\s*\)/, msg: 'El fondo se ve bien, pero el color está escrito a mano. Se pide usar la variable: `var(--accent)`.' }],
          pistas: ['Son dos reglas. La primera es la paleta: `:root { --accent: … ; }`. La segunda es para el título, `h1`.', 'En la regla `h1`, el fondo usa la variable: `background: var(--accent);`'],
          exp: 'El color está escrito una sola vez, en `:root`. Si lo cambias ahí, cambia en todos los sitios que usan `var(--accent)`.' }
      ] },
      { id: 'examen', nombre: 'Como en el examen', pagina: 'pagina', css: ':root {\n  --background: #0b0f0c;\n  --text: #d7f5dc;\n  --accent: #3ddc84;\n}\n\n', ejercicios: [
        { id: 'fondo', lineas: [],
          pide: 'Pon el fondo de la página con el color --background y el texto con el color --text.',
          sol: ':root {\n  --background: #0b0f0c;\n  --text: #d7f5dc;\n  --accent: #3ddc84;\n}\n\n' + 'body {\n  background: var(--background);\n  color: var(--text);\n}',
          formas: [[{ en: 'body', p: 'background', vale: 'rgb(11, 15, 12)' }, { en: 'h1, h2, h3, p', p: 'color', vale: 'rgb(215, 245, 220)' }, { en: 'a', p: 'color', vale: 'libre' }],
            [{ en: 'html', p: 'background', vale: 'rgb(11, 15, 12)' }, { en: 'h1, h2, h3, p', p: 'color', vale: 'rgb(215, 245, 220)' }, { en: 'a', p: 'color', vale: 'libre' }]],
          usa: [{ re: /background(-color)?\s*:[^;}]*var\(\s*--background\s*\)/, msg: 'Se ve bien, pero el color está escrito a mano. Se pide usar la variable: `var(--background)`.' }, { re: /color\s*:[^;}]*var\(\s*--text\s*\)/, msg: 'Se ve bien, pero el color está escrito a mano. Se pide usar la variable: `var(--text)`.' }],
          pistas: ['La paleta ya está escrita en `:root`. Escribe debajo una regla para `body`, con dos líneas.', 'Un color de la paleta se usa con `var()`: `background: var(--background);` y `color: var(--text);`'],
          exp: 'Los colores están en la paleta. En las reglas se usan por su nombre, con `var()`.' },
        { id: 'titulos',
          pide: 'Pon los tres títulos con el color --accent.',
          sol: ':root {\n  --background: #0b0f0c;\n  --text: #d7f5dc;\n  --accent: #3ddc84;\n}\n\n' + 'h1, h2, h3 {\n  color: var(--accent);\n}',
          quiere: [{ en: 'h1, h2, h3', p: 'color', vale: 'rgb(61, 220, 132)' }],
          usa: [{ re: /color\s*:[^;}]*var\(\s*--accent\s*\)/, msg: 'Se ve bien, pero el color está escrito a mano. Se pide usar la variable: `var(--accent)`.' }],
          pistas: ['Los títulos son `h1`, `h2` y `h3`. Con comas, una sola regla vale para los tres.', 'La propiedad es `color` y el valor, `var(--accent)`.'],
          exp: 'Si cambias `--accent` en la paleta, cambian los tres títulos a la vez.' },
        { id: 'cabecera',
          pide: 'Pon un borde solo debajo de la cabecera, con el color --accent.',
          sol: ':root {\n  --background: #0b0f0c;\n  --text: #d7f5dc;\n  --accent: #3ddc84;\n}\n\n' + 'header {\n  border-bottom: 3px solid var(--accent);\n}',
          quiere: [{ en: 'header', p: 'border-bottom', vale: 'hay' }, { en: 'header', p: 'border-bottom-color', vale: 'rgb(61, 220, 132)' }],
          usa: [{ re: /border-bottom(-color)?\s*:[^;}]*var\(\s*--accent\s*\)/, msg: 'Se ve bien, pero el color está escrito a mano. Se pide usar la variable: `var(--accent)`.' }],
          pistas: ['La cabecera es la línea 1 del HTML: la etiqueta `header`. El borde de abajo es `border-bottom`.', 'Lleva el grosor, el tipo de línea y el color: `3px solid var(--accent)`.'],
          exp: 'El color del borde también puede venir de la paleta.' },
        { id: 'raton',
          pide: 'Con el ratón encima, el enlace tiene el fondo --accent y el texto --background.',
          sol: ':root {\n  --background: #0b0f0c;\n  --text: #d7f5dc;\n  --accent: #3ddc84;\n}\n\n' + 'a:hover {\n  background: var(--accent);\n  color: var(--background);\n}',
          quiere: [{ en: 'a', p: 'background', vale: 'rgb(61, 220, 132)', encima: true }, { en: 'a', p: 'color', vale: 'rgb(11, 15, 12)', encima: true }],
          usa: [{ re: /background(-color)?\s*:[^;}]*var\(\s*--accent\s*\)/, msg: 'Se ve bien, pero el color está escrito a mano. Se pide usar la variable: `var(--accent)`.' }, { re: /color\s*:[^;}]*var\(\s*--background\s*\)/, msg: 'Se ve bien, pero el color está escrito a mano. Se pide usar la variable: `var(--background)`.' }],
          pistas: ['El enlace con el ratón encima es `a:hover`. Son dos líneas en la regla.', '`background: var(--accent);` y `color: var(--background);`'],
          exp: 'Es la última tarea del examen: el enlace cambia de fondo y de color con el ratón encima.' }
      ] }
    ]
  };

  // Lo que se compara: lo del texto, solo en los elementos que tienen texto propio (así da igual poner la
  // letra en body o en cada etiqueta, si se ve lo mismo); lo de la caja, en todos.
  const PC_LADOS = ['top', 'right', 'bottom', 'left'];
  const PC_TEXTO = ['color', 'font-family', 'font-size', 'font-weight', 'font-style', 'line-height', 'text-align', 'text-decoration-line'];
  const PC_CAJA = ['background-color', 'max-width', 'display', 'justify-content', 'column-gap', 'row-gap', 'grid-template-columns', 'border-top-left-radius', 'border-top-right-radius', 'border-bottom-right-radius', 'border-bottom-left-radius']
    .concat(...PC_LADOS.map((l) => ['margin-' + l, 'padding-' + l, 'border-' + l + '-width', 'border-' + l + '-style', 'border-' + l + '-color']));
  const PC_CONOCIDAS = ['color', 'background', 'background-color', 'font-family', 'font-size', 'font-weight', 'line-height', 'text-align', 'text-decoration',
    'padding', 'margin', 'border', 'border-radius', 'max-width', 'width', 'display', 'gap', 'justify-content', 'list-style', 'grid-template-columns']
    .concat(...PC_LADOS.map((l) => ['margin-' + l, 'padding-' + l, 'border-' + l]));
  // El nombre que escribiría el alumno: border-top-width es «border»
  const pcNombre = (p) => p.replace(/^(margin|padding)-.+$/, '$1').replace(/^border-.+-radius$/, 'border-radius')
    .replace(/^border-(top|right|bottom|left)-.+$/, 'border').replace('background-color', 'background').replace('text-decoration-line', 'text-decoration')
    .replace(/^(column|row)-gap$/, 'gap').replace('list-style-type', 'list-style');
  const pcCorto = (s) => { s = s.trim().replace(/\s+/g, ' '); return s.length > 44 ? s.slice(0, 44) + '…' : s; };
  function pcDistancia(a, b) {
    const d = [];
    for (let i = 0; i <= a.length; i++) d[i] = [i];
    for (let j = 1; j <= b.length; j++) d[0][j] = j;
    for (let i = 1; i <= a.length; i++) for (let j = 1; j <= b.length; j++) d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
    return d[a.length][b.length];
  }

  // Grupos de propiedades: «padding» son los cuatro lados; «border-bottom», el grosor, el tipo y el color de abajo
  const PC_GRUPOS = {
    background: ['background-color'],
    'text-decoration': ['text-decoration-line'],
    'list-style': ['list-style-type'],
    gap: ['column-gap', 'row-gap'],
    rejilla: ['display', 'grid-template-columns', 'column-gap', 'row-gap'],
    padding: PC_LADOS.map((l) => 'padding-' + l),
    margin: PC_LADOS.map((l) => 'margin-' + l),
    'border-radius': ['border-top-left-radius', 'border-top-right-radius', 'border-bottom-right-radius', 'border-bottom-left-radius'],
    border: [].concat(...PC_LADOS.map((l) => ['border-' + l + '-width', 'border-' + l + '-style', 'border-' + l + '-color']))
  };
  PC_LADOS.forEach((l) => { PC_GRUPOS['border-' + l] = ['border-' + l + '-width', 'border-' + l + '-style', 'border-' + l + '-color']; });
  const pcProps = (p) => PC_GRUPOS[p] || [p];
  // Los nombres en español que le valen a un color calculado («rgb(255, 0, 0)» es rojo). Sin color, null.
  const PC_COLORES = ['rojo', 'naranja', 'amarillo', 'verde', 'azul', 'morado', 'rosa', 'gris', 'blanco', 'negro'];
  function pcColor(v) {
    const m = /rgba?\(\s*([\d.]+)[,\s]+([\d.]+)[,\s]+([\d.]+)(?:\s*[,\/]\s*([\d.]+))?/.exec(v || '');
    if (!m || (m[4] !== undefined && parseFloat(m[4]) === 0)) return null;
    const r = +m[1], g = +m[2], b = +m[3], max = Math.max(r, g, b), min = Math.min(r, g, b), c = max - min, luz = (max + min) / 510;
    // casi sin color: blanco, gris o negro según la luz (un gris muy claro vale también como blanco)
    if (c < 30) return luz > 0.94 ? ['blanco'] : luz < 0.2 ? ['negro'] : luz > 0.9 ? ['gris', 'blanco'] : ['gris'];
    let h = max === r ? ((g - b) / c) % 6 : max === g ? (b - r) / c + 2 : (r - g) / c + 4;
    h = (h * 60 + 360) % 360;
    return [h < 15 || h >= 345 ? 'rojo' : h < 45 ? 'naranja' : h < 70 ? 'amarillo' : h < 170 ? 'verde' : h < 260 ? 'azul' : h < 300 ? 'morado' : 'rosa'];
  }
  // ¿Cumple un elemento lo que se pide? U: su estilo con el CSS del alumno; B: sin CSS
  function pcCumple(q, U, B) {
    const ps = pcProps(q.p);
    const suma = (o) => ps.filter((p) => /width|radius|size|margin|padding|gap/.test(p)).reduce((s, p) => s + (parseFloat(o[p]) || 0), 0);
    if (Array.isArray(q.vale)) return q.vale.includes(U[ps[0]]);
    if (/^columnas:/.test(q.vale)) return U.display === 'grid' && U['grid-template-columns'].trim().split(/\s+/).length === +q.vale.slice(9);
    if (PC_COLORES.includes(q.vale)) return (pcColor(U[ps[0]]) || []).includes(q.vale);
    if (q.vale === 'mayor') return suma(U) > suma(B) + 0.5;
    if (q.vale === 'otro') return ps.some((p) => U[p] !== B[p]);
    if (q.vale === 'hay') return ps.filter((p) => /-width$/.test(p)).every((p) => parseFloat(U[p]) > 0 && U[p.replace('-width', '-style')] !== 'none');
    return U[ps[0]] === q.vale;
  }

  // Lee la hoja como lo haría una persona: reglas con su selector y sus líneas, y los avisos de lo que
  // está mal escrito. El navegador se calla estos fallos y por eso el alumno no los ve.
  function pcAnaliza(css) {
    const avisos = [], reglas = [];
    let t = css.replace(/\/\*[\s\S]*?\*\//g, (m) => m.replace(/[^\n]/g, ' '));
    if (t.includes('/*')) { avisos.push('Hay un comentario sin cerrar. Un comentario termina con `*/`.'); t = t.slice(0, t.indexOf('/*')); }
    let i = 0, pendiente = null;
    while (i < t.length) {
      const a = t.indexOf('{', i);
      if (a < 0) {
        const resto = t.slice(i), sin = resto.replace(/\}/g, '');
        if (sin !== resto) avisos.push('Sobra una llave de cierre `}`.');
        if (sin.trim()) {
          if (/[:;]/.test(sin.replace(/:(hover|root|nth-child|first-child|last-child)/g, ''))) avisos.push('«' + pcCorto(sin) + '» está fuera de una regla. Las líneas van dentro de las llaves: `selector { propiedad: valor; }`');
          else { pendiente = { sel: sin.trim(), ini: i + resto.search(/\S/) }; avisos.push('Después del selector `' + pcCorto(sin) + '` falta la llave `{`.'); }
        }
        break;
      }
      let sel = t.slice(i, a), ini = i;
      if (sel.includes('}')) { avisos.push('Sobra una llave de cierre `}`.'); ini = i + sel.lastIndexOf('}') + 1; sel = t.slice(ini, a); }
      const c = t.indexOf('}', a + 1), o = t.indexOf('{', a + 1);
      let fin, sig;
      if (c >= 0 && (o < 0 || c < o)) { fin = c; sig = c + 1; }
      else {
        // sin llave de cierre: la regla llega hasta la línea del selector siguiente, o hasta el final
        fin = o < 0 ? t.length : Math.max(t.lastIndexOf('\n', o), a + 1);
        sig = fin;
        avisos.push('Falta la llave de cierre `}` de la regla `' + pcCorto(sel) + '`.');
      }
      const regla = { sel: sel.trim(), ini: ini, fin: sig, decls: [] };
      if (!regla.sel) avisos.push('Hay una llave `{` sin selector delante. El selector dice a qué elementos llega la regla.');
      t.slice(a + 1, fin).split(';').forEach((trozo) => {
        // dos líneas en el mismo trozo: a la primera le falta el punto y coma
        const partes = trozo.split(/\n(?=\s*-{0,2}[a-zA-Z][\w-]*\s*:)/).filter((x) => x.trim());
        partes.forEach((x, k) => {
          const p = x.trim(), dos = p.indexOf(':');
          if (dos < 0) { avisos.push('A «' + pcCorto(p) + '» le faltan los dos puntos. Una línea es `propiedad: valor;`'); return; }
          const prop = p.slice(0, dos).trim(), val = p.slice(dos + 1).trim();
          if (k < partes.length - 1) avisos.push('Falta el punto y coma al final de «' + pcCorto(p) + '».');
          if (/\s/.test(prop)) { avisos.push('El nombre de una propiedad no lleva espacios: «' + pcCorto(prop) + '». Las palabras se unen con un guion, como en `font-size`.'); return; }
          if (!val) { avisos.push('A la línea «' + prop + ':» le falta el valor.'); return; }
          regla.decls.push({ prop: prop, val: val });
        });
      });
      reglas.push(regla);
      i = sig;
    }
    return { reglas: reglas, avisos: avisos, pendiente: pendiente };
  }

  // Una línea que el navegador no entiende: devuelve el aviso, o null si vale
  function pcDeclaracion(d) {
    if (d.prop.startsWith('--')) return null;
    const p = d.prop.toLowerCase(), v = d.val.replace(/\s*!important\s*$/, '');
    if (!CSS.supports(p, 'inherit')) {
      let mejor = null, min = 3;
      PC_CONOCIDAS.forEach((c) => { const n = pcDistancia(p, c); if (n < min) { min = n; mejor = c; } });
      return 'El navegador no conoce la propiedad «' + p + '».' + (mejor ? ' ¿Querías escribir `' + mejor + '`?' : ' Revisa cómo está escrita.');
    }
    const linea = '«' + p + ': ' + pcCorto(v) + '»';
    if (/var\(/.test(v)) return null;
    if (CSS.supports(p, v)) {
      // vale, pero sin tipo de línea el borde no se dibuja
      const sinTipo = /^border(-(top|right|bottom|left))?$/.test(p) && !/^(0|none|inherit|initial|unset)$/.test(v) && !/\b(solid|dashed|dotted|double|groove|ridge|inset|outset|none|hidden)\b/.test(v);
      return sinTipo ? 'A ' + linea + ' le falta el tipo de línea: `solid`. Sin él, el borde no se dibuja.' : null;
    }
    if (/color|background|border/.test(p)) {
      if (/^([0-9a-f]{3}|[0-9a-f]{6})$/i.test(v) && /\d/.test(v)) return 'En ' + linea + ' falta la almohadilla. Un color en hexadecimal empieza por `#`.';
      const hex = v.match(/#[\w]*/);
      if (hex && !/^#[0-9a-f]*$/i.test(hex[0])) return 'En ' + linea + ' el color lleva algo que no vale. Un color en hexadecimal solo lleva cifras del 0 al 9 y letras de la a a la f.';
      if (hex && hex[0].length !== 7 && hex[0].length !== 4) return 'En ' + linea + ' el color no tiene seis cifras detrás de la almohadilla.';
    }
    if (/\d\s+(rem|px|em|%)(\s|$)/.test(v)) return 'En ' + linea + ' sobra el espacio entre el número y la unidad. Van juntos: `1rem`.';
    if (/\d,\d/.test(v)) return 'En ' + linea + ' los decimales van con punto, no con coma: `1.5rem`.';
    if (/(^|\s)\d*\.?\d+(\s|$)/.test(v) && /size|margin|padding|border|width|radius/.test(p)) return 'En ' + linea + ' falta la unidad detrás del número: `rem` o `px`.';
    return 'El navegador no entiende el valor de ' + linea + '. Revisa cómo está escrito.';
  }

  // Los elementos que alcanza un selector (sin contar :hover), o null si el navegador no lo entiende
  function pcAlcance(doc, sel) {
    const s = sel.replace(/::?(hover|focus|active|visited|link)\b/g, '').trim();
    try { return [...doc.querySelectorAll(s || '*')]; } catch (e) { return null; }
  }
  function pcSinAlcance(doc, sel) {
    const m = sel.trim();
    if (/^[a-zA-Z][\w-]*$/.test(m) && doc.querySelector('.' + m)) return '«' + m + '» es una clase del HTML. En el CSS, una clase lleva un punto delante: `.' + m + '`.';
    if (/^[.#][a-zA-Z][\w-]*$/.test(m) && doc.querySelector(m.slice(1))) return '`' + m.slice(1) + '` es una etiqueta. Se escribe sin nada delante: `' + m.slice(1) + '`.';
    return 'El selector `' + pcCorto(m) + '` no alcanza nada: en el HTML no hay ningún elemento así.';
  }

  function montaPractica(el) {
    const P = AW.practicaCss;
    const pedidos = (el.dataset.bloques || '').split(',').map((s) => s.trim()).filter(Boolean);
    const lista = [];
    P.bloques.forEach((b) => {
      if (pedidos.length && !pedidos.includes(b.id)) return;
      b.ejercicios.forEach((e) => {
        const pagina = e.pagina || b.pagina;
        lista.push(Object.assign({}, e, { clave: b.id + '/' + e.id, bloque: b, pagina: pagina, html: P.paginas[pagina], formas: e.formas || [e.quiere], css: e.css || b.css || '' }));
      });
    });
    if (!lista.length) { el.textContent = 'No hay ejercicios para: ' + (el.dataset.bloques || ''); return; }
    const CLAVE = 'aw-practica-css';
    // lo hecho se guarda en este navegador: 'ok' (resuelto) o 'sol' (visto con la solución)
    let hecho = {};
    try { hecho = JSON.parse(localStorage.getItem(CLAVE)) || {}; } catch (e) { hecho = {}; }
    const guarda = () => { try { localStorage.setItem(CLAVE, JSON.stringify(hecho)); } catch (e) { /* sin almacenamiento, sigue funcionando */ } };

    el.innerHTML =
      '<div class="pc-cab"><span class="pill">Practica CSS</span><select class="pc-bloque" aria-label="Bloque de ejercicios"></select><p class="pc-donde"></p><div class="pc-puntos"></div>'
      + '<button type="button" class="btn btn-ghost pc-ant">← Anterior</button><button type="button" class="btn btn-ghost pc-sig">Siguiente →</button></div>'
      + '<div class="pc-pide"><span class="pc-num"></span><p></p></div>'
      + '<div class="pc-izq">'
      + '<div class="ventana pc-html"><div class="ventana-barra"><i></i><i></i><i></i><span>index.html</span><span class="ruta"></span></div><pre class="ej-cod"></pre></div>'
      + '<div class="ventana pc-css"><div class="ventana-barra"><i></i><i></i><i></i><span>style.css</span><span class="ruta">Aquí escribes tú</span></div>'
      + '<div class="pc-editor"><pre aria-hidden="true"></pre><textarea spellcheck="false" autocomplete="off" autocapitalize="off" wrap="off" aria-label="style.css" placeholder="selector {&#10;  propiedad: valor;&#10;}"></textarea></div></div>'
      + '<div class="pc-botones ej-fila"><button type="button" class="btn btn-primary pc-comprobar">Comprobar</button><button type="button" class="btn btn-ghost pc-pista">Pista</button>'
      + '<button type="button" class="btn btn-ghost pc-solucion">Ver solución</button><button type="button" class="btn btn-ghost pc-reinicia">Volver a empezar</button></div>'
      + '</div>'
      + '<div class="pc-der">'
      + '<div class="resultado pc-vista"><div class="resultado-barra pc-pestanas"><button type="button" data-v="tuya" aria-pressed="true">Tu página</button><button type="button" data-v="meta" aria-pressed="false">Así tiene que quedar</button></div>'
      + '<iframe class="pc-tuya" title="Tu página"></iframe><iframe class="pc-meta" title="Así tiene que quedar" hidden></iframe></div>'
      + '<div class="pc-fb" aria-live="polite"></div>'
      + '</div>'
      + '<iframe class="pc-banco" aria-hidden="true" tabindex="-1"></iframe>';
    const $ = (s) => el.querySelector(s);
    const ta = $('textarea'), pinta0 = $('.pc-editor pre'), htmlPre = $('.pc-html pre'), nota = $('.pc-html .ruta'), fb = $('.pc-fb');
    const marcos = { tuya: $('.pc-tuya'), meta: $('.pc-meta'), banco: $('.pc-banco') };
    const NOTA = 'Solo se lee';
    const borrador = {};
    let n = -1, ex = null, nPista = 0, conSol = false;
    // Que las teclas dentro del ejercicio no cambien de diapositiva
    el.addEventListener('keydown', (e) => e.stopPropagation());

    const di = (tipo, titulo, texto) => {
      fb.className = 'pc-fb' + (tipo ? ' ' + tipo : '');
      fb.dataset.tipo = tipo;
      fb.innerHTML = (titulo ? '<b>' + esc(titulo) + '</b>' : '') + '<span>' + fmtQuiz(texto) + '</span>';
    };
    const lineasHtml = () => [...htmlPre.querySelectorAll('.ej-linea')];
    const linea = (i) => htmlPre.querySelector('.ej-linea[data-i="' + i + '"]');
    const css = (marco, texto) => { marcos[marco].contentDocument.getElementById('aw-css').textContent = texto; };

    // Escribe la página en un iframe. Cada etiqueta lleva su línea del HTML en data-l.
    function escribe(marco, extra, unida) {
      const d = marcos[marco].contentDocument;
      const cuerpo = ex.html.map((l, i) => l.replace(/<([a-zA-Z][\w-]*)/g, '<$1 data-l="' + i + '"')).join('\n');
      d.open();
      d.write('<!DOCTYPE html><html lang="es"><head><meta charset="utf-8"><style>' + extra + '</style><style id="aw-css"></style></head>' + cuerpo + '</html>');
      d.close();
      if (!unida) return;
      d.addEventListener('click', (e) => { if (e.target.closest && e.target.closest('a')) e.preventDefault(); });
      // el ratón sobre un elemento de la página enciende su línea en el HTML
      d.addEventListener('mouseover', (e) => {
        const x = e.target.closest && e.target.closest('[data-l]');
        lineasHtml().forEach((f) => f.classList.toggle('mira', !!x && f.dataset.i === x.dataset.l));
      });
      d.documentElement.addEventListener('mouseleave', () => lineasHtml().forEach((f) => f.classList.remove('mira')));
    }
    const vistaCss = () => 'html{zoom:' + (parseFloat(el.dataset.zoom) || P.zoom[ex.pagina] || 1.5) + '}[data-aw-mira]{outline:3px solid #017CE9!important;outline-offset:2px;box-shadow:inset 0 0 0 999px rgba(1,124,233,.16)!important}';
    function mira(i) {
      ['tuya', 'meta'].forEach((m) => {
        const d = marcos[m].contentDocument;
        d.querySelectorAll('[data-aw-mira]').forEach((x) => x.removeAttribute('data-aw-mira'));
        if (i !== null) d.querySelectorAll('[data-l="' + i + '"]').forEach((x) => x.setAttribute('data-aw-mira', ''));
      });
    }

    // El estilo calculado de cada elemento con una hoja dada. «encima» pone todos los elementos como si
    // tuvieran el ratón encima (:hover pasa a ser una clase que llevan todos).
    function foto(hoja, encima) {
      const d = marcos.banco.contentDocument, w = marcos.banco.contentWindow;
      d.getElementById('aw-css').textContent = encima ? hoja.replace(/:hover\b/g, '.aw-encima') : hoja;
      return [...d.querySelectorAll('html, body, body *')].map((x) => {
        x.classList.toggle('aw-encima', !!encima);
        const cs = w.getComputedStyle(x), v = {};
        if ([...x.childNodes].some((h) => h.nodeType === 3 && h.textContent.trim())) {
          PC_TEXTO.forEach((p) => { v[p] = cs.getPropertyValue(p); });
          v['font-family'] = v['font-family'].split(',')[0].replace(/["']/g, '').trim().toLowerCase();
        }
        PC_CAJA.forEach((p) => { v[p] = cs.getPropertyValue(p); });
        if (x.tagName === 'LI') v['list-style-type'] = cs.getPropertyValue('list-style-type');
        // el color de un borde que no se dibuja no cuenta
        PC_LADOS.forEach((l) => { if (v['border-' + l + '-style'] === 'none' || parseFloat(v['border-' + l + '-width']) === 0) v['border-' + l + '-color'] = '-'; });
        return { el: x, l: x.dataset.l === undefined ? null : +x.dataset.l, tag: x.tagName.toLowerCase(), v: v };
      });
    }
    // u: la página con el CSS del alumno; b: sin CSS; forma: la lista «quiere».
    // bien, mal y faltan son de lo que se pide; sobran, lo que ha cambiado sin que se pida.
    function evalua(u, b, forma, encima) {
      const d = marcos.banco.contentDocument;
      const r = { mal: [], sobran: [], faltan: [], bien: [], info: u };
      const libre = u.map(() => new Set());
      forma.forEach((q) => {
        if (q.encima && !encima) return;
        const els = new Set(d.querySelectorAll(q.en)), ps = pcProps(q.p);
        // lo que puede cambiar: lo pedido, lo que se deja y, con la letra, los espacios que dependen de ella
        const puede = ps.concat(...[].concat(q.deja || []).map(pcProps), q.p === 'font-size' ? PC_GRUPOS.margin.concat(PC_GRUPOS.padding) : []);
        u.forEach((x, i) => {
          if (!els.has(x.el)) return;
          puede.forEach((p) => libre[i].add(p));
          if (q.vale === 'libre') return;
          const igual = ps.every((p) => x.v[p] === b[i].v[p]);
          (pcCumple(q, x.v, b[i].v) ? r.bien : igual ? r.faltan : r.mal).push({ i: i, p: ps.find((p) => x.v[p] !== b[i].v[p]) || ps[0], q: q });
        });
      });
      u.forEach((x, i) => Object.keys(x.v).forEach((p) => { if (!libre[i].has(p) && x.v[p] !== b[i].v[p]) r.sobran.push({ i: i, p: p }); }));
      r.total = r.mal.length + r.sobran.length + r.faltan.length;
      return r;
    }
    function explica(r, encima) {
      const nums = (xs) => [...new Set(xs.map((x) => r.info[x.i].l).filter((l) => l !== null))].sort((p, q) => p - q).map((l) => l + 1);
      const donde = (xs) => {
        const ls = nums(xs);
        if (!ls.length) return 'la página entera';
        return ls.length === 1 ? 'la línea ' + ls[0] + ' del HTML' : 'las líneas ' + ls.slice(0, -1).join(', ') + ' y ' + ls[ls.length - 1] + ' del HTML';
      };
      const cuando = encima ? ' con el ratón encima' : '';
      const objetivos = new Set(r.bien.concat(r.faltan, r.mal).map((x) => x.i));
      if (r.mal.length) {
        const m = r.mal[0], nombre = '`' + pcNombre(m.p) + '`';
        if (PC_COLORES.includes(m.q.vale)) return 'Has cambiado el color en ' + donde([m]) + ', pero no es ' + m.q.vale + '.';
        if (m.q.vale === 'mayor') return 'Has cambiado ' + nombre + ' en ' + donde([m]) + ', pero tiene que ser más grande que antes.';
        if (m.q.vale === 'hay') return 'El borde de ' + donde([m]) + ' no está en todos los lados que se piden.';
        if (/^columnas:/.test(m.q.vale)) return 'En ' + donde([m]) + ' todavía no hay una rejilla de ' + m.q.vale.slice(9) + ' columnas. Hacen falta dos líneas: `display` y `grid-template-columns`.';
        return 'Has cambiado ' + nombre + ' en ' + donde([m]) + ', pero el valor no es el que se pide.';
      }
      if (r.sobran.length) {
        const fuera = r.sobran.filter((x) => !objetivos.has(x.i)), s0 = r.sobran[0];
        // lo que solo se pide con el ratón encima no puede cambiar sin él
        if (!encima && !r.faltan.length && !r.bien.length) return 'La página ha cambiado sin el ratón encima: ' + donde(r.sobran) + '. El cambio se pide solo con el ratón encima.';
        if (!r.faltan.length) {
          if (fuera.length) return 'Lo que se pide está bien, pero también ' + (nums(fuera).length > 1 ? 'han' : 'ha') + ' cambiado ' + donde(fuera) + cuando + '. Tu selector alcanza de más.';
          const lado = (p) => pcNombre(p.replace(/^(margin|padding|border)-(top|right|bottom|left)$/, '$1'));
          return r.bien.some((x) => x.i === s0.i && lado(x.q.p) === pcNombre(s0.p))
            ? 'Lo que se pide está bien, pero has cambiado más lados de los que se piden. Revisa `' + pcNombre(s0.p) + '`.'
            : 'Lo que se pide está bien, pero en ' + donde([s0]) + ' has cambiado algo más: `' + pcNombre(s0.p) + '`. Eso no se pide.';
        }
        return fuera.length
          ? 'Tu regla cambia ' + donde(fuera) + cuando + ', pero no cambia lo que se pide. Revisa el selector.'
          : 'Has cambiado `' + pcNombre(s0.p) + '` y se pide otra cosa. Lee otra vez la frase de arriba.';
      }
      if (r.bien.length) {
        const otras = r.faltan.filter((x) => !r.bien.some((y) => y.i === x.i));
        if (otras.length && !nums(otras).length) return 'Vas bien, pero falta una parte de lo que se pide. Lee otra vez la frase de arriba.';
        return otras.length ? 'Vas bien. ' + (nums(otras).length > 1 ? 'Falta que cambien' : 'Falta que cambie') + ' también ' + donde(otras) + cuando + '.' : 'Vas bien, pero falta algo más en ' + donde([r.faltan[0]]) + '.';
      }
      if (ta.value.trim() === ex.css.trim()) return ex.css ? 'Todavía no has escrito tu regla. La paleta ya está: escribe debajo.' : 'style.css está vacío. Escribe una regla.';
      return 'Lo que has escrito no cambia lo que se pide' + cuando + '. Revisa el selector y la propiedad.'
        + (!encima && /:hover/.test(ta.value) ? ' Lo que va con `:hover` solo se ve con el ratón encima.' : '');
    }

    function comprobar() {
      const hoja = ta.value, an = pcAnaliza(hoja), d = marcos.banco.contentDocument;
      const avisos = an.avisos.slice();
      an.reglas.forEach((r) => {
        if (r.sel) {
          const al = pcAlcance(d, r.sel);
          if (al === null) avisos.push(/^<\/?[a-zA-Z]/.test(r.sel) ? 'En el CSS, la etiqueta se escribe sin los signos `<` y `>`: `' + r.sel.replace(/[<>\/\s]/g, '') + '`.' : 'El navegador no entiende el selector «' + pcCorto(r.sel) + '». Revisa cómo está escrito.');
          else if (!al.length) avisos.push(pcSinAlcance(d, r.sel));
        }
        r.decls.forEach((x) => { const a = pcDeclaracion(x); if (a) avisos.push(a); });
      });
      // primero sin el ratón y, si se pide algo con el ratón encima, otra vez con él; de las formas buenas, la que más se acerca
      let dif = null, encima = false;
      (ex.formas.some((f) => f.some((q) => q.encima)) ? [false, true] : [false]).some((h) => {
        const u = foto(hoja, h), b = foto(ex.css, h);
        const r = ex.formas.map((f) => evalua(u, b, f, h)).reduce((a, c) => (c.total < a.total ? c : a));
        if (r.total) { dif = r; encima = h; }
        return !!r.total;
      });
      if (dif) { di('ko', 'Todavía no', avisos.length ? avisos[0] : explica(dif, encima)); return; }
      const falta = (ex.usa || []).find((x) => !x.re.test(hoja));
      if (falta) { di('ko', 'Todavía no', falta.msg); return; }
      hecho[ex.clave] = conSol && hecho[ex.clave] !== 'ok' ? 'sol' : 'ok';
      guarda();
      const quedan = lista.filter((x) => !hecho[x.clave]).length;
      di('ok', 'Correcto', ex.exp + (avisos.length ? ' Ojo: ' + avisos[0] : '') + (quedan ? ' Pulsa «Siguiente».' : ' Has terminado los ' + lista.length + ' ejercicios.'));
      cabecera();
    }
    function pista() {
      if (nPista === 0) {
        // la primera pista señala en el HTML lo que hay que cambiar
        const d = marcos.banco.contentDocument;
        const ls = ex.lineas || [...new Set([].concat(...ex.formas[0].filter((q) => q.vale !== 'libre').map((q) => [...d.querySelectorAll(q.en)].map((x) => x.dataset.l))))].filter((l) => l !== undefined);
        ls.forEach((i) => { const f = linea(i); if (f) f.classList.add('objetivo'); });
      }
      nPista = Math.min(nPista + 1, ex.pistas.length);
      di('pista', 'Pista ' + nPista + ' de ' + ex.pistas.length, ex.pistas[nPista - 1]);
      $('.pc-pista').textContent = nPista < ex.pistas.length ? 'Otra pista' : 'Pista';
    }
    function solucion() {
      conSol = true;
      if (!hecho[ex.clave]) { hecho[ex.clave] = 'sol'; guarda(); }
      ta.value = ex.sol; vista('tuya'); pinta();
      di('pista', 'Solución', 'Está escrita en style.css. ' + ex.exp);
      cabecera();
    }

    // Colorea el editor, pasa el CSS a la página y marca en el HTML lo que alcanza el selector
    function pinta() {
      pinta0.innerHTML = AW.resalta.css(ta.value) + '\n';
      pinta0.scrollTop = ta.scrollTop; pinta0.scrollLeft = ta.scrollLeft;
      css('tuya', ta.value);
      alcance();
    }
    function alcance() {
      const an = pcAnaliza(ta.value), pos = ta.selectionStart;
      // la regla donde está el cursor; si está entre dos, la de antes
      let r = an.reglas[0] || null;
      an.reglas.forEach((x) => { if (x.ini <= pos) r = x; });
      if (an.pendiente && (an.pendiente.ini <= pos || !r)) r = an.pendiente;
      const al = r && r.sel ? pcAlcance(marcos.banco.contentDocument, r.sel) : null;
      const ls = new Set((al || []).filter((x) => x.dataset.l !== undefined).map((x) => x.dataset.l));
      lineasHtml().forEach((f) => f.classList.toggle('alcanza', ls.has(f.dataset.i)));
      nota.innerHTML = ls.size ? 'En azul, lo que alcanza <b>' + esc(pcCorto(r.sel)) + '</b>' : NOTA;
    }
    function vista(v) {
      el.querySelectorAll('.pc-pestanas button').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.v === v)));
      marcos.tuya.hidden = v !== 'tuya'; marcos.meta.hidden = v !== 'meta';
      $('.pc-vista').classList.toggle('meta', v === 'meta');
    }
    // Arriba: el bloque (un desplegable para saltar a otro), por dónde vas y un punto por cada ejercicio del bloque
    const bloques = [...new Set(lista.map((x) => x.bloque))];
    const delBloque = (b) => lista.map((x, k) => k).filter((k) => lista[k].bloque === b);
    function cabecera() {
      $('.pc-donde').textContent = 'Ejercicio ' + (n + 1) + ' de ' + lista.length;
      $('.pc-num').textContent = n + 1;
      $('.pc-bloque').innerHTML = bloques.map((b, i) => {
        const suyos = delBloque(b);
        return '<option value="' + i + '"' + (b === ex.bloque ? ' selected' : '') + '>' + (i + 1) + '. ' + esc(b.nombre) + ' (' + suyos.filter((k) => hecho[lista[k].clave]).length + ' de ' + suyos.length + ')</option>';
      }).join('');
      $('.pc-puntos').innerHTML = delBloque(ex.bloque).map((k) => '<button type="button" data-k="' + k + '" class="' + (hecho[lista[k].clave] || '') + (k === n ? ' aqui' : '')
        + '" title="Ejercicio ' + (k + 1) + '" aria-label="Ejercicio ' + (k + 1) + '"></button>').join('');
      $('.pc-ant').disabled = n === 0;
      $('.pc-sig').disabled = n === lista.length - 1;
      $('.pc-sig').classList.toggle('btn-primary', !!hecho[ex.clave] && n < lista.length - 1);
      $('.pc-sig').classList.toggle('btn-ghost', !(hecho[ex.clave] && n < lista.length - 1));
    }
    function carga(k) {
      if (ex) borrador[ex.clave] = ta.value;
      n = k; ex = lista[n]; nPista = 0; conSol = false;
      escribe('banco', '', false);
      escribe('tuya', vistaCss(), true);
      escribe('meta', vistaCss(), true);
      css('meta', ex.sol);
      htmlPre.innerHTML = ex.html.map((l, i) => '<div class="ej-linea" data-i="' + i + '"><i>' + (i + 1) + '</i><span>' + AW.resalta.html(l) + '</span></div>').join('');
      lineasHtml().forEach((f) => {
        f.addEventListener('mouseenter', () => mira(f.dataset.i));
        f.addEventListener('mouseleave', () => mira(null));
      });
      $('.pc-pide p').innerHTML = fmtQuiz(ex.pide);
      $('.pc-pista').textContent = 'Pista';
      ta.value = borrador[ex.clave] !== undefined ? borrador[ex.clave] : ex.css;
      ta.selectionStart = ta.selectionEnd = ta.value.length;
      ta.scrollTop = 0; ta.scrollLeft = 0;
      vista('tuya');
      di('', '', (ex.css ? 'La paleta ya está escrita. Escribe tu regla debajo' : 'Escribe la regla en style.css') + ' y mira «Tu página». Cuando termines, pulsa «Comprobar».');
      cabecera();
      pinta();
    }

    // Tabulador y sangría dentro del editor; Ctrl+Intro comprueba
    const inserta = (txt) => { if (!document.execCommand || !document.execCommand('insertText', false, txt)) { ta.setRangeText(txt, ta.selectionStart, ta.selectionEnd, 'end'); ta.dispatchEvent(new Event('input')); } };
    ta.addEventListener('keydown', (e) => {
      if (e.key === 'Tab' && !e.shiftKey) { e.preventDefault(); inserta('  '); }
      else if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) { e.preventDefault(); comprobar(); }
      else if (e.key === '}' && !e.ctrlKey && !e.metaKey) {
        // la llave de cierre, sola en su línea, va a la primera columna: se lleva la sangría que tenga delante
        const ini = ta.value.lastIndexOf('\n', ta.selectionStart - 1) + 1, delante = ta.value.slice(ini, ta.selectionStart);
        if (delante && !delante.trim()) { e.preventDefault(); ta.setSelectionRange(ini, ta.selectionEnd); inserta('}'); }
      }
      else if (e.key === 'Enter') {
        const antes = ta.value.slice(0, ta.selectionStart), ultima = antes.slice(antes.lastIndexOf('\n') + 1);
        const sangria = /\{\s*$/.test(ultima) ? '  ' : ultima.match(/^\s*/)[0];
        if (sangria) { e.preventDefault(); inserta('\n' + sangria); }
      }
    });
    ta.addEventListener('input', () => {
      vista('tuya');
      if (fb.dataset.tipo === 'ok' || fb.dataset.tipo === 'ko') di('', '', 'Cuando termines, pulsa «Comprobar».');
      pinta();
    });
    ta.addEventListener('scroll', () => { pinta0.scrollTop = ta.scrollTop; pinta0.scrollLeft = ta.scrollLeft; });
    ['keyup', 'click', 'focus'].forEach((t) => ta.addEventListener(t, alcance));
    $('.pc-comprobar').addEventListener('click', comprobar);
    $('.pc-pista').addEventListener('click', pista);
    $('.pc-solucion').addEventListener('click', solucion);
    $('.pc-reinicia').addEventListener('click', () => { ta.value = ex.css; nPista = 0; $('.pc-pista').textContent = 'Pista'; lineasHtml().forEach((f) => f.classList.remove('objetivo')); di('', '', 'style.css está como al principio.'); vista('tuya'); pinta(); ta.focus(); });
    $('.pc-ant').addEventListener('click', () => { if (n > 0) carga(n - 1); });
    $('.pc-sig').addEventListener('click', () => { if (n < lista.length - 1) carga(n + 1); });
    $('.pc-puntos').addEventListener('click', (e) => { const b = e.target.closest('button'); if (b) carga(+b.dataset.k); });
    // otro bloque: su primer ejercicio sin hacer
    $('.pc-bloque').addEventListener('change', (e) => { const ks = delBloque(bloques[+e.target.value]), k = ks.find((i) => !hecho[lista[i].clave]); carga(k === undefined ? ks[0] : k); });
    el.querySelectorAll('.pc-pestanas button').forEach((b) => b.addEventListener('click', () => vista(b.dataset.v)));

    const primero = lista.findIndex((x) => !hecho[x.clave]);
    carga(primero < 0 ? 0 : primero);
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
    // Captura de móvil: el mismo teléfono, en grande, con la página entera para recorrerla con la rueda
    const movil = fig.closest('.movil');
    if (movil) {
      v.classList.add('visor-movil');
      v.querySelector('img').outerHTML = '<div class="movil" style="' + esc(movil.getAttribute('style') || '') + '">'
        + movil.querySelector('.movil-estado').outerHTML
        + '<figure class="foto"><div class="captura-scroll"><img alt=""></div></figure></div>';
    }
    v.querySelector('img').src = img.dataset.grande || img.currentSrc || img.src;   // data-grande: versión completa distinta de la miniatura
    v.querySelector('img').alt = img.alt;
    // Captura muy alta (una página entera): a su ancho, y se recorre con la rueda
    if (!movil) {
      const im = v.querySelector('img');
      const larga = () => { if (im.naturalHeight > im.naturalWidth * 1.4) v.classList.add('visor-larga'); };
      if (im.complete) larga(); else im.addEventListener('load', larga);
    }
    const tarjeta = fig.classList.contains('tarjeta');
    if (tarjeta) v.classList.add('visor-tarjeta');
    const pie = cred ? (tarjeta ? (cred.querySelector('small') || cred).innerHTML : cred.innerHTML) : '';
    if (pie) v.querySelector('.visor-pie').innerHTML = pie; else v.querySelector('.visor-pie').remove();
    const cierra = () => { v.remove(); document.removeEventListener('keydown', tecla, true); };
    const tecla = (e) => { if (e.key === 'Escape') { e.stopPropagation(); cierra(); } };
    v.addEventListener('click', (e) => { if (!e.target.closest('a') && !e.target.closest('.visor-movil .movil')) cierra(); });
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
   *   data-codigo:   en su lugar, el código de un <script type="text/plain" id="…"> con resaltado (data-lang, css por defecto).
   *   data-falta:    aviso si la página de data-solucion todavía no está publicada (se comprueba por http; por file:// se abre).
   * Además de la píldora, cualquier elemento con la clase .abre-modal y estos atributos abre el mismo modal.
   */
  function abreSolucion(btn) {
    const url = btn.dataset.solucion, captura = btn.dataset.captura, codigo = btn.dataset.codigo;
    const titulo = esc(btn.dataset.titulo || 'Así tiene que quedar');
    const nota = esc(btn.dataset.nota || 'Sin CSS se ve así de sencillo: lo que importa es que las etiquetas sean las correctas.');
    const v = document.createElement('div');
    v.className = 'visor visor-solucion';
    const cuerpo = codigo ? '<pre class="cod solucion-codigo"></pre>'
      : captura ? '<div class="solucion-scroll"><img alt="Resultado esperado"></div>'
      : '<iframe title="' + titulo + '" sandbox="allow-same-origin"></iframe>';
    v.innerHTML = '<div class="solucion-marco">'
      + '<div class="resultado-barra"><i></i><i></i><i></i><span class="url">' + titulo + '</span>'
      + (url ? '<a class="solucion-abrir" target="_blank" rel="noopener">Abrir en una pestaña nueva</a>' : '') + '</div>'
      + cuerpo
      + '<p class="solucion-nota">' + nota + '</p></div>'
      + '<button class="visor-cerrar" aria-label="Cerrar">×</button>';
    if (codigo) {
      const fuente = document.getElementById(codigo);
      const f = AW.resalta[(btn.dataset.lang || 'css').toLowerCase()] || esc;
      v.querySelector('pre').innerHTML = fuente ? f(fuente.textContent.replace(/^\n/, '')) : 'No encuentro el código #' + esc(codigo);
    } else if (url) {
      // data-alternativa: otra página para comparar (la misma sin CSS, por ejemplo), con un interruptor en la barra.
      // data-etiquetas="Con CSS|Sin CSS", data-titulo-alternativa, data-nota-alternativa; data-vista="1" abre la alternativa.
      const iframe = v.querySelector('iframe');
      const abrir = v.querySelector('.solucion-abrir');
      const notaEl = v.querySelector('.solucion-nota');
      const falta = document.createElement('p');
      falta.className = 'solucion-falta';
      falta.hidden = true;
      falta.textContent = btn.dataset.falta || '';
      iframe.after(falta);
      const vistas = [{ url, titulo: btn.dataset.titulo || 'Así tiene que quedar', nota: notaEl.textContent }];
      if (btn.dataset.alternativa) {
        vistas.push({ url: btn.dataset.alternativa, titulo: btn.dataset.tituloAlternativa || '', nota: btn.dataset.notaAlternativa || '' });
        const [e0, e1] = (btn.dataset.etiquetas || 'Con CSS|Sin CSS').split('|');
        abrir.insertAdjacentHTML('beforebegin', '<span class="solucion-vistas"><button type="button">' + esc(e0) + '</button><button type="button">' + esc(e1) + '</button></span>');
        v.querySelectorAll('.solucion-vistas button').forEach((b, k) => b.addEventListener('click', (e) => { e.stopPropagation(); muestra(k); }));
      }
      const muestra = (k) => {
        const x = vistas[k];
        v.querySelector('.resultado-barra .url').textContent = x.titulo;
        iframe.title = x.titulo;
        notaEl.textContent = x.nota;
        abrir.href = x.url;
        v.querySelectorAll('.solucion-vistas button').forEach((b, i) => b.setAttribute('aria-pressed', String(i === k)));
        const pon = (ok) => { iframe.hidden = !ok; falta.hidden = ok; abrir.hidden = !ok; notaEl.hidden = !ok || !x.nota; if (ok) iframe.src = x.url; };
        if (btn.dataset.falta && /^https?:$/.test(location.protocol)) fetch(x.url, { method: 'HEAD' }).then((r) => pon(r.ok)).catch(() => pon(true));
        else pon(true);
      };
      muestra(Math.min(parseInt(btn.dataset.vista || '0', 10) || 0, vistas.length - 1));
    } else v.querySelector('img').src = captura;
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

  /* Guía paso a paso (UT3): <div class="guia" data-guia="clave" data-base="img/guias/"></div>
     Los pasos están en AW.guias[clave] = [{ t: 'texto con <b>', img: 'nombre', m: [[x, y, an, al], …] }, …]
     (m en % de la captura: lo que hay que pulsar o mirar; z, opcional, los índices de m a los que se acerca). Cada paso enseña la captura acercada a esas
     zonas, con un foco que oscurece lo demás. «Siguiente», «Anterior», los segmentos de arriba y, en la
     presentación, las flechas: → avanza paso a paso y solo después del último pasa a la diapositiva siguiente.
     Si el primer paso lleva  tramo: {…}, la guía va por tramos (montaGuiaTramos, más abajo). */

  // zona de la captura que se ve (en % de la captura: x, y y ancho), con la forma de la caja de W × H píxeles.
  // ratio = alto / ancho de la captura. entera: la captura entera; centra: entera y centrada (guías por tramos)
  function zonaGuia(p, ratio, W, H, entera, centra) {
    const forma = (H / W) / ratio;
    const m = p.z ? p.z.map((k) => p.m[k]) : p.m;
    if (entera || !m.length) {
      if (!centra) return [0, 0, 100];
      const w = Math.max(100, 100 / forma);
      return [(100 - w) / 2, (100 - w * forma) / 2, w];
    }
    const x0 = Math.min(...m.map((r) => r[0])), y0 = Math.min(...m.map((r) => r[1]));
    const x1 = Math.max(...m.map((r) => r[0] + r[2])), y1 = Math.max(...m.map((r) => r[1] + r[3]));
    if (p.encaja) {
      // resultado de un tramo: la zona entera con un margen; como mucho, al doble de la pantalla entera
      // (minw: el ancho mínimo del encuadre). Si cabe, el encuadre no se sale de la captura (así no quedan franjas oscuras)
      const w = Math.max((x1 - x0) * 1.1, (y1 - y0) * 1.16 / forma, p.minw || 50), h = w * forma;
      let x = (x0 + x1) / 2 - w / 2, y = (y0 + y1) / 2 - h / 2;
      x = w <= 100 ? Math.min(Math.max(x, 0), 100 - w) : (100 - w) / 2;
      y = h <= 100 ? Math.min(Math.max(y, 0), 100 - h) : (100 - h) / 2;
      // si falta poco para el borde de arriba o el de la izquierda, se pega a él (no queda una barra cortada)
      if (x > 0 && x < 4 && x1 <= w) x = 0;
      if (y > 0 && y < 6 && y1 <= h) y = 0;
      return [x, y, w];
    }
    let w = Math.max(x1 - x0 + 16, 42), h = Math.max(y1 - y0 + 16, 30);
    if (h / w > forma) w = h / forma; else h = w * forma;
    w = Math.min(w, 100); h = Math.min(h, 100);
    const x = Math.min(Math.max((x0 + x1) / 2 - w / 2, 0), 100 - w);
    const y = Math.min(Math.max((y0 + y1) / 2 - h / 2, 0), Math.max(0, 100 - h));
    return [x, y, w];
  }

  // la pantalla de una guía: dos capas que se funden, el foco que oscurece y las marcas naranjas.
  // muestra(p, { entera, cambia }) enseña el paso p; recoloca() lo vuelve a encuadrar sin animación
  function visorGuia(pantalla, base, extra, centra) {
    pantalla.innerHTML =
      '<div class="guia-capa"><img alt=""></div><div class="guia-capa"><img alt=""></div>' +
      '<svg class="guia-foco" aria-hidden="true"><defs><mask maskUnits="userSpaceOnUse"><rect class="guia-todo" fill="#fff"></rect><g class="guia-huecos"></g></mask></defs><rect class="guia-velo"></rect><g class="guia-marcos"></g></svg>' +
      (extra || '');
    const $ = (s) => pantalla.querySelector(s);
    const capas = [...pantalla.querySelectorAll('.guia-capa')];
    const foco = $('.guia-foco'), todo = $('.guia-todo'), velo = $('.guia-velo'), huecos = $('.guia-huecos'), marcos = $('.guia-marcos');
    const mid = 'guia-mask-' + Math.random().toString(36).slice(2, 8);
    foco.querySelector('mask').id = mid; velo.setAttribute('mask', 'url(#' + mid + ')');
    let delante = 0, turno = 0, actual = null, entera = false;
    // coloca una capa: translate en píxeles de la pantalla y luego escala (así el zoom va en línea recta)
    function encuadra(capa, p) {
      const img = capa.querySelector('img');
      const pw = pantalla.clientWidth, ratio = img.naturalHeight / img.naturalWidth || 0.57;
      const [x, y, w] = zonaGuia(p, ratio, pw, pantalla.clientHeight, entera, centra), s = 100 / w;
      capa.style.width = pw + 'px';
      capa.style.transform = 'translate(' + (-x / 100 * pw * s) + 'px,' + (-y / 100 * pw * ratio * s) + 'px) scale(' + s + ')';
      return { x, y, s, pw, ph: pw * ratio };
    }
    // marcas y foco en píxeles de la pantalla: borde fino y esquinas redondas a cualquier zoom
    function marca(p, g) {
      const W = pantalla.clientWidth, H = pantalla.clientHeight;
      foco.setAttribute('viewBox', '0 0 ' + W + ' ' + H);
      for (const r of [todo, velo]) { r.setAttribute('width', W); r.setAttribute('height', H); }
      const caja = (r) => {
        let x = (r[0] - g.x) / 100 * g.pw * g.s - 8, y = (r[1] - g.y) / 100 * g.ph * g.s - 8;
        const w = r[2] / 100 * g.pw * g.s + 16, h = r[3] / 100 * g.ph * g.s + 16;
        const x2 = Math.min(x + w, W - 3), y2 = Math.min(y + h, H - 3);
        x = Math.max(x, 3); y = Math.max(y, 3);
        return [x, y, Math.max(x2 - x, 10), Math.max(y2 - y, 10)];
      };
      // marcas apiladas que se tocan (ajustes uno debajo de otro): una sola caja.
      // marcas una al lado de otra que se tocan: se reparte el hueco y cada una conserva su borde
      // las marcas que quedan casi fuera del encuadre no se dibujan (solo asomaría un borde suelto)
      const dentro = (r) => {
        const x = (r[0] - g.x) / 100 * g.pw * g.s, y = (r[1] - g.y) / 100 * g.ph * g.s, w = r[2] / 100 * g.pw * g.s, h = r[3] / 100 * g.ph * g.s;
        const vw = Math.min(x + w, W) - Math.max(x, 0), vh = Math.min(y + h, H) - Math.max(y, 0);
        return vw > 0 && vh > 0 && (vw * vh) / (w * h) >= 0.5;
      };
      const ms = p.m.filter(dentro);
      const orig = ms.map((r) => caja([r[0], r[1], r[2], r[3]]).map((v, k) => k < 2 ? v + 8 : v - 16));
      const rects = ms.map(caja);
      const solapa = (a, b, m = 6) => a[0] < b[0] + b[2] + m && b[0] < a[0] + a[2] + m && a[1] < b[1] + b[3] + m && b[1] < a[1] + a[3] + m;
      const apiladas = (a, b) => (Math.min(a[0] + a[2], b[0] + b[2]) - Math.max(a[0], b[0])) > 0.6 * Math.min(a[2], b[2]);
      for (let hay = true; hay;) {
        hay = false;
        for (let a = 0; a < rects.length && !hay; a++) for (let b = a + 1; b < rects.length && !hay; b++) {
          const A = rects[a], B = rects[b];
          if (!solapa(A, B) || !apiladas(A, B)) continue;
          const x = Math.min(A[0], B[0]), y = Math.min(A[1], B[1]);
          rects[a] = [x, y, Math.max(A[0] + A[2], B[0] + B[2]) - x, Math.max(A[1] + A[3], B[1] + B[3]) - y];
          orig[a] = rects[a]; rects.splice(b, 1); orig.splice(b, 1); hay = true;
        }
      }
      for (let a = 0; a < rects.length; a++) for (let b = 0; b < rects.length; b++) {
        if (a === b || !solapa(rects[a], rects[b], 0) || apiladas(rects[a], rects[b])) continue;
        const A = rects[a], B = rects[b];
        if (orig[a][0] + orig[a][2] <= orig[b][0] + 1) {      // A a la izquierda de B
          const corte = (orig[a][0] + orig[a][2] + orig[b][0]) / 2;
          A[2] = Math.max(10, corte - 3 - A[0]); const fin = B[0] + B[2]; B[0] = corte + 3; B[2] = Math.max(10, fin - B[0]);
        }
      }
      const rect = (r, extra) => '<rect x="' + r[0] + '" y="' + r[1] + '" width="' + r[2] + '" height="' + r[3] + '" rx="12"' + extra + '></rect>';
      huecos.innerHTML = rects.map((r) => rect(r, ' fill="#000"')).join('');
      marcos.innerHTML = rects.map((r) => rect(r, ' class="halo"') + rect(r, ' class="borde"')).join('');
    }
    // Versión 3: la captura de un paso es siempre la suya.
    // - Si la captura nueva tarda más de 120 ms, la anterior se quita: nunca queda a la vista la captura de otro paso.
    // - Si la petición falla o se atasca (6 s), se pide otra vez con otra dirección (?r=…), que no se suma a la atascada.
    // - Si falla tres veces, sale un aviso con un botón para intentarlo otra vez.
    const aviso = document.createElement('button');
    aviso.type = 'button'; aviso.className = 'guia-aviso'; aviso.hidden = true;
    aviso.textContent = 'No se ha cargado la captura de este paso. Pulsa aquí para intentarlo otra vez.';
    pantalla.appendChild(aviso);
    let tEspera = 0, tPlazo = 0;
    aviso.addEventListener('click', (e) => { e.stopPropagation(); if (actual) muestra(actual, { entera, cambia: true }); });
    function muestra(p, op) {
      const mio = ++turno, src = base + p.img + '.webp', cap = capas[delante];
      actual = p; entera = !!op.entera;
      clearTimeout(tEspera); clearTimeout(tPlazo);
      aviso.hidden = true;
      const capImg = cap.querySelector('img');
      if (!op.cambia && capImg.dataset.cual === src && cap.classList.contains('visible')) {
        // mismo paso (pantalla entera): zoom en línea recta; las marcas vuelven al terminar
        foco.classList.remove('visible');
        cap.classList.add('mueve');
        const g = encuadra(cap, p);
        setTimeout(() => { if (mio === turno) { marca(p, g); foco.classList.add('visible'); } }, 650);
        return;
      }
      // paso nuevo: la capa de detrás carga la captura ya encuadrada y aparece con un fundido
      const nueva = capas[1 - delante], img = nueva.querySelector('img');
      foco.classList.remove('visible');
      pantalla.dataset.paso = p.img;
      tEspera = setTimeout(() => {
        if (mio !== turno) return;
        capas.forEach((c) => c.classList.remove('visible'));
        pantalla.classList.add('cargando');
      }, 120);
      let intentos = 0;
      const listo = () => {
        if (mio !== turno) return;
        if (!img.naturalWidth) { falla(); return; }
        clearTimeout(tEspera); clearTimeout(tPlazo);
        pantalla.classList.remove('cargando');
        img.dataset.cual = src;
        nueva.classList.remove('mueve');
        const g = encuadra(nueva, p);
        void nueva.offsetWidth;
        nueva.classList.add('visible'); cap.classList.remove('visible');
        delante = 1 - delante;
        setTimeout(() => { if (mio === turno) { marca(p, g); foco.classList.add('visible'); } }, 420);
      };
      const falla = () => {
        if (mio !== turno) return;
        clearTimeout(tPlazo);
        if (++intentos < 3) { carga(src + '?r=' + Date.now() + '-' + intentos); return; }
        clearTimeout(tEspera);
        capas.forEach((c) => c.classList.remove('visible'));
        pantalla.classList.remove('cargando');
        aviso.hidden = false;
      };
      const carga = (url) => {
        img.dataset.cual = '';
        img.onload = listo; img.onerror = falla;
        tPlazo = setTimeout(falla, 6000);
        img.src = url;
      };
      img.alt = (p.t || '').replace(/<[^>]+>/g, '');
      if (img.dataset.cual === src && img.complete && img.naturalWidth) listo(); else carga(src);
    }
    function recoloca() {
      if (!actual) return;
      const c = capas[delante]; if (!c.querySelector('img').complete || !pantalla.clientWidth || !c.classList.contains('visible')) return;
      c.classList.remove('mueve'); const g = encuadra(c, actual); marca(actual, g);
    }
    return { muestra, recoloca };
  }

  function montaGuia(el) {
    const pasos = (AW.guias || {})[el.dataset.guia];
    if (!pasos || !pasos.length) { el.textContent = 'Faltan los pasos de la guía ' + el.dataset.guia; return; }
    if (pasos[0].tramo) { montaGuiaTramos(el, pasos); return; }
    const base = el.dataset.base || 'img/guias/';
    el.innerHTML =
      '<div class="guia-lado">' +
        '<div class="guia-barra" role="tablist">' + pasos.map((_, i) => '<button type="button" role="tab" aria-label="Paso ' + (i + 1) + '"></button>').join('') + '</div>' +
        '<p class="guia-cuenta"></p>' +
        '<p class="guia-texto" aria-live="polite"></p>' +
        '<div class="guia-botones"><button type="button" class="btn btn-ghost guia-ant">← Anterior</button><button type="button" class="btn btn-primary guia-sig">Siguiente →</button></div>' +
        '<button type="button" class="guia-entera" aria-pressed="false">Ver la pantalla entera</button>' +
      '</div>' +
      '<div class="guia-pantalla"></div>';
    const $ = (s) => el.querySelector(s);
    const segs = [...el.querySelectorAll('.guia-barra button')];
    const pantalla = $('.guia-pantalla'), visor = visorGuia(pantalla, base);
    let i = 0, entera = false;
    // las capturas se piden al llegar a la diapositiva, no todas al abrir la presentación (menos peticiones a la vez)
    let pedidas = false;
    const precarga = () => { if (pedidas) return; pedidas = true; pasos.forEach((p) => { const im = new Image(); im.src = base + p.img + '.webp'; }); };
    function pinta(cambiaPaso) {
      const p = pasos[i];
      segs.forEach((s, k) => { s.classList.toggle('hecho', k < i); s.classList.toggle('actual', k === i); s.setAttribute('aria-selected', k === i); });
      $('.guia-cuenta').textContent = 'Paso ' + (i + 1) + ' de ' + pasos.length;
      $('.guia-texto').innerHTML = p.t;
      $('.guia-ant').disabled = i === 0;
      $('.guia-sig').disabled = i === pasos.length - 1;
      $('.guia-entera').textContent = entera ? 'Acercar a lo importante' : 'Ver la pantalla entera';
      $('.guia-entera').setAttribute('aria-pressed', entera);
      visor.muestra(p, { entera, cambia: cambiaPaso });
    }
    const ir = (k) => { const n = Math.max(0, Math.min(pasos.length - 1, k)); if (n !== i) { i = n; entera = false; pinta(true); } };
    $('.guia-ant').addEventListener('click', () => ir(i - 1));
    $('.guia-sig').addEventListener('click', () => ir(i + 1));
    segs.forEach((s, k) => s.addEventListener('click', () => ir(k)));
    const alterna = () => { entera = !entera; pinta(false); };
    $('.guia-entera').addEventListener('click', alterna);
    pantalla.addEventListener('click', alterna);
    // en la presentación, las flechas recorren los pasos antes de cambiar de diapositiva
    window.addEventListener('keydown', (e) => {
      const sec = el.closest('section');
      if (!sec || !sec.hasAttribute('data-deck-active') || e.altKey || e.ctrlKey || e.metaKey) return;
      if (e.target.closest && e.target.closest('input, textarea, select')) return;
      const avanza = ['ArrowRight', 'PageDown', ' '].includes(e.key), vuelve = ['ArrowLeft', 'PageUp'].includes(e.key);
      if (avanza && i < pasos.length - 1) { e.preventDefault(); e.stopImmediatePropagation(); ir(i + 1); }
      else if (vuelve && i > 0) { e.preventDefault(); e.stopImmediatePropagation(); ir(i - 1); }
    }, true);
    // al llegar a la diapositiva o cambiar el tamaño, se recoloca sin animación
    const recoloca = () => { if (el.closest('section')?.hasAttribute('data-deck-active')) { precarga(); visor.recoloca(); } };
    const stage = document.querySelector('deck-stage');
    if (stage) stage.addEventListener('slidechange', () => setTimeout(recoloca, 50));
    window.addEventListener('resize', recoloca);
    pinta(true);
    setTimeout(recoloca, 400);
  }

  /* Guía por tramos (versión 3). El primer paso de cada tramo lleva
       tramo: { nombre: 'El menú', corto: 'Menú', resumen: 'una frase con <b>',
                comprueba: { img: 'captura', zona: [x, y, an, al], lista: ['Lo que se ve.', …], t: 'texto (si no hay lista)' } }
     (el dato detalle: true de algunos pasos ya no se usa). Aparte, la guía puede llevar
       AW.guiasPartes[clave] = {
         partes: { antes, titulo, entradilla, figura, lista: [{ parte, nombre, t }], movil: { titulo, t, figuras } },
         tramos: [{ forma: 'tira' | 'fila' | 'lado', figuras: [figura, …], pie, texto: ['frase', …] }, …]   (uno por tramo)
         comprueba: { 8: { figura } }                                                                   (figura de más en la comprobación del tramo 9)
       }
     con figura = { img, wh: [ancho, alto], recorte?: [x, y, an, al], velo?, alt, pie?, max?,
                    zonas: [{ r: [x, y, an, al], tipo: 'foco' | 'caja' | 'marco' | 'punto', parte?, n?, et?, pos?: 'arriba' | 'abajo' | 'izq', al? }] }
     (todo en % de la captura; las marcas y las etiquetas son capas HTML encima de la captura).
     Vistas: partes (la cabecera terminada y sus partes) → por cada tramo: entrada (la parte, en grande) → pasos → comprobación.
     Anterior y Siguiente van siempre abajo a la izquierda, en el mismo sitio en todas las vistas.
     → recorre la secuencia y, después de la última comprobación, pasa a la diapositiva siguiente.
     La posición se recuerda solo mientras la presentación está abierta: al recargar, la guía empieza por el principio. */
  function pliegaCabecera(el) {
    const sec = el.closest('section');
    if (!sec) return '';
    let top = el;
    while (top.parentElement && top.parentElement !== sec) top = top.parentElement;
    if (top.parentElement !== sec) return '';
    const antes = [];
    for (let n = sec.firstElementChild; n && n !== top; n = n.nextElementSibling) {
      if (!n.matches('aside.notas, .seccion-pill, [data-slide-num], script, style')) antes.push(n);
    }
    const h = antes.map((n) => n.matches('h1, h2') ? n : n.querySelector('h1, h2')).find(Boolean);
    const k = antes.map((n) => n.matches('p') ? n : n.querySelector('p')).find((x) => x && !(h && h.contains(x)));
    antes.forEach((n) => n.classList.add('guia-plegado'));
    sec.classList.add('con-guia-tramos');
    return (k ? '<span>' + esc(k.textContent.trim()) + '</span>' : '') + (h ? '<b>' + esc(h.textContent.trim()) + '</b>' : '');
  }

  // Una captura limpia con sus marcas y etiquetas encima (capas HTML, en % de la captura).
  // recorte: la parte de la captura que se ve; las zonas se dan en % de la captura entera.
  function lamina(f, base) {
    const [W, H] = f.wh, rc = f.recorte || [0, 0, 100, 100];
    const ar = (W * rc[2]) / (H * rc[3]);
    const pc = (v) => (Math.round(v * 100) / 100) + '%';
    const q = (r) => [(r[0] - rc[0]) / rc[2] * 100, (r[1] - rc[1]) / rc[3] * 100, r[2] / rc[2] * 100, r[3] / rc[3] * 100];
    const zs = (f.zonas || []).map((z) => Object.assign({ tipo: 'foco', pos: 'arriba' }, z, { q: q(z.r) }));
    // sitio para las etiquetas que van fuera de la captura (arriba o abajo) o a su izquierda
    const pos = new Set(zs.filter((z) => (z.n || z.et) && (z.pos === 'izq' || (z.fuera ?? f.fuera))).map((z) => z.pos));
    const dp = (z) => z.parte ? ' data-parte="' + z.parte + '"' : '';
    let h = '<figure class="gl' + [...pos].map((p) => ' con-' + p).join('') + '" data-ar="' + ar.toFixed(4) + '"' + (f.max ? ' data-max="' + f.max + '"' : '') + '>' +
      '<div class="gl-marco" style="aspect-ratio:' + ar.toFixed(4) + '">' +
      '<div class="gl-img"><img alt="' + esc(f.alt || '') + '" src="' + esc(base + f.img + '.webp') + '" style="width:' + pc(10000 / rc[2]) + ';left:' + pc(-rc[0] / rc[2] * 100) + ';top:' + pc(-rc[1] / rc[3] * 100) + '"></div>';
    if (f.velo) {
      // velo que oscurece lo demás, con un hueco (6 px más grande) en cada foco y en cada caja
      const id = 'gl-' + Math.random().toString(36).slice(2, 9);
      const hueco = (z) => '<rect rx="10" fill="#000" style="x:calc(' + pc(z.q[0]) + ' - 6px);y:calc(' + pc(z.q[1]) + ' - 6px);width:calc(' + pc(z.q[2]) + ' + 12px);height:calc(' + pc(z.q[3]) + ' + 12px)"></rect>';
      h += '<svg class="gl-velo" aria-hidden="true"><defs><mask id="' + id + '" maskUnits="userSpaceOnUse" x="0" y="0" width="100%" height="100%"><rect width="100%" height="100%" fill="#fff"></rect>' +
        zs.filter((z) => z.tipo === 'foco' || z.tipo === 'caja').map(hueco).join('') + '</mask></defs><rect width="100%" height="100%" mask="url(#' + id + ')"></rect></svg>';
    }
    zs.forEach((z) => {
      h += '<span class="gl-zona ' + z.tipo + '"' + dp(z) + ' style="left:' + pc(z.q[0]) + ';top:' + pc(z.q[1]) + ';width:' + pc(z.q[2]) + ';height:' + pc(z.q[3]) + '"></span>';
    });
    // etiquetas: arriba, abajo o a la izquierda de su zona, unidas a ella por una raya.
    // fuera (de la figura o de la zona): la etiqueta va fuera de la captura, en el borde de arriba o de abajo
    zs.filter((z) => z.n || z.et).forEach((z) => {
      const cx = z.q[0] + z.q[2] / 2, fuera = z.fuera ?? f.fuera, azul = z.tipo === 'caja' ? ' azul' : '';
      let al = z.al || (cx < 12 ? 'izq' : cx > 88 ? 'der' : 'centro'), x, y, linea = '';
      if (z.pos === 'izq') { al = 'centro'; x = z.q[0]; y = z.q[1] + z.q[3] / 2; }
      else {
        x = al === 'izq' ? z.q[0] : al === 'der' ? z.q[0] + z.q[2] : cx;
        const lx = al === 'izq' ? 'calc(' + pc(z.q[0]) + ' + 21px)' : al === 'der' ? 'calc(' + pc(z.q[0] + z.q[2]) + ' - 24px)' : 'calc(' + pc(cx) + ' - 1.5px)';
        if (z.pos === 'abajo') {
          const b = z.q[1] + z.q[3]; y = fuera ? 100 : b;
          linea = 'top:' + pc(b) + ';height:calc(' + pc(y - b) + ' + 14px)';
        } else {
          y = fuera ? 0 : z.q[1];
          linea = 'top:calc(' + pc(y) + ' - 14px);height:calc(' + pc(z.q[1] - y) + ' + 14px)';
        }
        h += '<i class="gl-linea' + azul + '"' + dp(z) + ' style="left:' + lx + ';' + linea + '"></i>';
      }
      h += '<span class="gl-et ' + z.pos + ' al-' + al + (z.n ? ' num' : '') + azul + '"' + dp(z) + ' style="left:' + pc(x) + ';top:' + pc(y) + '">' +
        (z.n ? '<b>' + z.n + '</b>' : '') + (z.et ? '<span>' + z.et + '</span>' : '') + '</span>';
    });
    return h + '</div>' + (f.pie ? '<figcaption>' + f.pie + '</figcaption>' : '') + '</figure>';
  }
  // Esquema de cajas: los contenedores (azul, discontinuo) con lo que llevan dentro, en fila;
  // con col: true, lo que lleva el contenedor va uno debajo de otro, en cajas bajas (nombre y detalle en una línea).
  // e = { arbol: { id, n, d?, w?, col?, hijos: [...] }, foco: ['id', …], pie? }; lo que no está en foco sale atenuado
  // (w, el ancho de la caja, solo cuenta en una fila)
  function esquema(e) {
    const foco = new Set(e.foco || []);
    const nodo = (x, enCol) => {
      const cont = !!x.hijos, f = foco.has(x.id) ? ' foco' : '';
      return '<div class="ge ' + (cont ? 'ge-cont' : 'ge-widget') + f + '"' + (x.w && !enCol ? ' style="flex:0 0 ' + x.w + '"' : '') + '>' +
        '<p class="ge-n">' + x.n + (x.d ? ' <small>' + x.d + '</small>' : '') + '</p>' +
        (cont ? '<div class="ge-hijos' + (x.col ? ' col' : '') + '">' + x.hijos.map((h) => nodo(h, !!x.col)).join('') + '</div>' : '') + '</div>';
    };
    return '<figure class="ge-figura">' + nodo(e.arbol) + (e.pie ? '<figcaption>' + e.pie + '</figcaption>' : '') + '</figure>';
  }
  // figuras que van al lado del texto: tan altas como quepan (sin pasar de su max, en px)
  function ajustaLaminas(caja) {
    if (!caja || !caja.clientHeight) return;
    const figs = [...caja.querySelectorAll('.gl')];
    const pie = caja.querySelector(':scope > figcaption');
    const alto = caja.clientHeight - (pie ? pie.offsetHeight + 14 : 0);
    figs.forEach((g) => {
      const cap = g.querySelector('figcaption'), ar = +g.dataset.ar, max = +g.dataset.max || 1100;
      const a = alto - (cap ? cap.offsetHeight + 10 : 0) - parseFloat(getComputedStyle(g).paddingTop) - parseFloat(getComputedStyle(g).paddingBottom);
      g.querySelector('.gl-marco').style.width = Math.round(Math.min(max, a * ar)) + 'px';
    });
  }

  function montaGuiaTramos(el, pasos) {
    const base = el.dataset.base || 'img/guias/';
    const datos = (AW.guiasPartes || {})[el.dataset.guia] || {};
    const conPartes = !!datos.partes;
    const tramos = [];
    pasos.forEach((p, k) => {
      if (p.tramo) tramos.push(Object.assign({}, p.tramo, { ks: [], entrada: (datos.tramos || [])[tramos.length] || null }));
      tramos[tramos.length - 1].ks.push(k);
    });
    // ---- estado: solo en memoria ----
    let pos = conPartes ? { tipo: 'partes', n: -1 } : { tipo: 'entrada', n: 0 }, entera = false;
    const secuencia = () => {
      const s = conPartes ? [{ tipo: 'partes', n: -1 }] : [];
      tramos.forEach((tr, n) => {
        s.push({ tipo: 'entrada', n });
        tr.ks.forEach((k) => s.push({ tipo: 'paso', n, k }));
        if (tr.comprueba) s.push({ tipo: 'comprueba', n });
      });
      return s;
    };
    const SEC = secuencia();
    const igual = (a, b) => a.tipo === b.tipo && a.n === b.n && (a.tipo !== 'paso' || a.k === b.k);

    // ---- estructura ----
    const botones = (sig) => '<div class="gt-botones"><button type="button" class="btn btn-ghost gt-ant">← Anterior</button><button type="button" class="btn btn-primary gt-sig">' + sig + '</button></div>';
    const pie = (extra, sig) => '<div class="gt-pie">' + (extra || '') + botones(sig || 'Siguiente →') + '</div>';
    const iconoPartes = '<svg viewBox="0 0 20 20" aria-hidden="true"><rect x="1" y="4" width="18" height="12" rx="2.5" fill="none" stroke="currentColor" stroke-width="2"/><rect x="4" y="8" width="3.2" height="4" rx="1"/><rect x="9" y="9" width="3.4" height="2" rx="1"/><rect x="14" y="9" width="3" height="2" rx="1"/></svg>';
    const titulo = pliegaCabecera(el);
    const P = datos.partes || {};
    el.classList.add('con-tramos');
    el.innerHTML =
      '<div class="gt-barra"><p class="gt-titulo">' + titulo + '</p></div>' +
      '<nav class="gt-indice" aria-label="Partes de la guía">' +
        (conPartes ? '<button type="button" class="gt-i-partes" data-n="-1"><span class="gt-i-num">' + iconoPartes + '</span><span class="gt-i-nombre">' + esc(P.corto || 'Las partes') + '</span></button>' : '') +
        tramos.map((tr, n) => '<button type="button" data-n="' + n + '"><span class="gt-i-num">' + (n + 1) + '</span><span class="gt-i-nombre">' + esc(tr.corto || tr.nombre) + '</span></button>').join('') +
      '</nav>' +
      '<div class="gt-cuerpo">' +
        (conPartes ?
        '<div class="gt-partes" hidden>' +
          '<div class="gt-cabeza"><p class="gt-tramo-n">' + (P.antes || '') + '</p><h3 class="gt-nombre">' + (P.titulo || '') + '</h3>' +
            (P.entradilla ? '<p class="gt-entradilla">' + P.entradilla + '</p>' : '') + '</div>' +
          '<div class="gt-partes-figura">' + (P.figura ? lamina(P.figura, base) : '') + '</div>' +
          '<ol class="gt-lista-partes">' + (P.lista || []).map((x, j) => '<li data-parte="' + x.parte + '"><b class="gt-lp-num">' + (j + 1) + '</b><p><b>' + x.nombre + '</b>. ' + x.t + '</p></li>').join('') + '</ol>' +
          (P.movil ? '<div class="gt-partes-movil"><p class="gt-sub">' + P.movil.titulo + '</p><p class="gt-movil-t">' + P.movil.t + '</p>' +
            '<div class="gt-moviles">' + P.movil.figuras.map((f) => lamina(f, base)).join('') + '</div></div>' : '') +
          pie() +
        '</div>' : '') +
        '<div class="gt-entrada" hidden>' +
          '<div class="gt-cabeza"><p class="gt-tramo-n"></p><h3 class="gt-nombre"></h3></div>' +
          '<div class="gt-entrada-cuerpo"></div>' +
          pie('', 'Empezar el tramo →') +
        '</div>' +
        '<div class="gt-paso" hidden>' +
          '<div class="gt-lado">' +
            '<div class="gt-progreso"><p class="gt-tramo-de"></p><p class="gt-cuenta"></p><div class="gt-puntos"></div></div>' +
            '<p class="gt-texto" aria-live="polite"></p>' +
            pie('<button type="button" class="guia-entera" aria-pressed="false">Ver la pantalla entera</button>') +
          '</div>' +
          '<div class="guia-pantalla"></div>' +
        '</div>' +
        '<div class="gt-comprueba" hidden>' +
          '<p class="gt-cuenta"><span class="gt-tramo-de"></span><span>Comprueba el resultado</span></p>' +
          '<div class="gt-comprueba-cuerpo">' +
            '<div class="guia-pantalla"></div>' +
            '<div class="gt-comprueba-lado"><ul class="gt-lista"></ul><p class="gt-nota">Si algo no se ve así, repasa los pasos de este tramo.</p><div class="gt-comprueba-extra"></div></div>' +
          '</div>' +
          pie() +
        '</div>' +
      '</div>';
    const $ = (s, r) => (r || el).querySelector(s);
    const $$ = (s, r) => [...(r || el).querySelectorAll(s)];
    const vPartes = $('.gt-partes'), vEntrada = $('.gt-entrada'), vPaso = $('.gt-paso'), vComp = $('.gt-comprueba');
    const vistas = { partes: vPartes, entrada: vEntrada, paso: vPaso, comprueba: vComp };
    const botIndice = $$('.gt-indice button');
    const puntos = $('.gt-puntos'), lista = $('.gt-lista'), cuerpoEntrada = $('.gt-entrada-cuerpo'), extraComp = $('.gt-comprueba-extra');
    const visorPaso = visorGuia($('.guia-pantalla', vPaso), base, '', true);
    const visorComp = visorGuia($('.guia-pantalla', vComp), base, '<p class="guia-rotulo">✓ Así tiene que verse ahora</p>', true);
    const stage = document.querySelector('deck-stage');

    // las capturas de un tramo se piden al llegar a él (no las 52 de golpe al abrir la presentación)
    const pedido = new Set(), precarga = {};
    function pide(n) {
      if (n < 0 || n >= tramos.length || pedido.has(n)) return;
      pedido.add(n);
      const tr = tramos[n];
      tr.ks.forEach((k) => { const im = new Image(); im.src = base + pasos[k].img + '.webp'; });
      if (tr.comprueba) { const im = new Image(); im.src = base + tr.comprueba.img + '.webp'; precarga[tr.comprueba.img] = im; }
    }

    // en la vista de las partes, señalar una parte de la lista la enciende en la captura (y al revés)
    if (vPartes) {
      const fig = $('.gt-partes-figura .gl', vPartes);
      const enciende = (parte) => {
        if (!fig) return;
        fig.classList.toggle('hay-activa', !!parte);
        $$('[data-parte]', vPartes).forEach((x) => x.classList.toggle('activa', !!parte && x.dataset.parte === parte));
      };
      $$('[data-parte]', vPartes).forEach((x) => {
        x.addEventListener('mouseenter', () => enciende(x.dataset.parte));
        x.addEventListener('mouseleave', () => enciende(null));
      });
    }

    // tamaño de la captura de la comprobación: la zona del resultado con un margen, como mucho al 210 %.
    // Si la zona es estrecha, la captura va a la izquierda y la lista a su derecha (.estrecha); si no, la lista va debajo.
    // Devuelve el ancho mínimo del encuadre (en % de la captura) que corresponde a ese zoom máximo
    function encajaComprueba(c) {
      const pant = $('.guia-pantalla', vComp), im = precarga[c.img], MAX = 2.1;
      const iw = (im && im.naturalWidth) || 1600, ih = (im && im.naturalHeight) || 911;
      const ew = c.zona[2] / 100 * iw * 1.25;
      let eh = c.zona[3] / 100 * ih * 1.6;
      vComp.classList.remove('estrecha'); pant.style.width = ''; pant.style.height = '';
      const cuerpo = $('.gt-comprueba-cuerpo', vComp), lado = $('.gt-comprueba-lado', vComp);
      const W = cuerpo.clientWidth;
      let A = cuerpo.clientHeight, s = Math.min(MAX, W / ew, A / eh);
      const ancho = Math.round(Math.max(ew * s, 900));
      if (ancho <= W - 600) {
        vComp.classList.add('estrecha');
        pant.style.width = ancho + 'px';
        eh = Math.max(eh, Math.min(lado.offsetHeight, 520) / s);   // la captura, al menos tan alta como la lista (hasta 520 px)
      } else {
        A -= lado.offsetHeight + 22;
        s = Math.min(MAX, W / ew, A / eh);
      }
      pant.style.height = Math.round(Math.max(Math.min(eh * s, A), Math.min(340, A))) + 'px';
      return pant.clientWidth / (MAX * iw) * 100;
    }

    // ---- pintar ----
    let entradaDe = -1;
    function pinta(cambia) {
      const i = SEC.findIndex((x) => igual(x, pos)), tr = tramos[pos.n];
      el.dataset.pantalla = pos.tipo;
      for (const t in vistas) if (vistas[t]) vistas[t].hidden = t !== pos.tipo;
      // índice: el actual en azul oscuro; los anteriores al actual, en verde con ✓ (por posición)
      botIndice.forEach((b) => {
        const n = +b.dataset.n, a = n === pos.n, h = n < pos.n;
        b.classList.toggle('hecho', h); b.classList.toggle('actual', a);
        if (a) b.setAttribute('aria-current', 'step'); else b.removeAttribute('aria-current');
        if (n >= 0) $('.gt-i-num', b).textContent = h ? '✓' : n + 1;
        b.setAttribute('aria-label', n < 0 ? (P.titulo || 'Las partes') : 'Tramo ' + (n + 1) + ': ' + tramos[n].nombre);
      });
      const vista = vistas[pos.tipo];
      $('.gt-ant', vista).disabled = i === 0;
      if (pos.tipo !== 'entrada') $('.gt-sig', vista).textContent = i === SEC.length - 1 ? 'Diapositiva siguiente →' : 'Siguiente →';
      if (tr) $$('.gt-tramo-de', vista).forEach((e) => { e.textContent = tr.nombre; });
      if (pos.n >= 0) { pide(pos.n); pide(pos.n + 1); }
      if (pos.tipo === 'entrada') {
        const e = tr.entrada;
        $('.gt-tramo-n', vEntrada).textContent = 'Tramo ' + (pos.n + 1) + ' de ' + tramos.length + ' · ' + tr.ks.length + (tr.ks.length === 1 ? ' paso' : ' pasos');
        $('.gt-nombre', vEntrada).textContent = tr.nombre;
        if (entradaDe !== pos.n) {
          entradaDe = pos.n;
          const forma = e && e.figuras ? e.forma || 'tira' : 'sin';
          vEntrada.className = 'gt-entrada forma-' + forma;
          const texto = e && e.texto ? e.texto : [tr.resumen || ''];
          const explica = '<div class="gt-explica">' + texto.map((t) => '<p>' + t + '</p>').join('') + '</div>';
          cuerpoEntrada.innerHTML =
            (e && e.figuras ? '<div class="gt-figura">' + e.figuras.map((f) => lamina(f, base)).join('') + (e.pie ? '<figcaption>' + e.pie + '</figcaption>' : '') + '</div>' : '') +
            (e && e.cerca ? '<div class="gt-fila"><div class="gt-cerca"' + (e.cerca.ancho ? ' style="width:' + e.cerca.ancho + 'px"' : '') + '>' + lamina(e.cerca, base) + '</div>' + explica + '</div>'
              : e && e.esquema ? '<div class="gt-fila"><div class="gt-cerca">' + esquema(e.esquema) + '</div>' + explica + '</div>' : explica);
        }
        ajustaLaminas($('.gt-entrada.forma-lado .gt-figura', el));
      } else if (pos.tipo === 'paso') {
        const p = pasos[pos.k], j = tr.ks.indexOf(pos.k);
        $('.gt-cuenta', vPaso).textContent = 'Paso ' + (j + 1) + ' de ' + tr.ks.length;
        puntos.innerHTML = tr.ks.map((k, q) => '<button type="button" data-k="' + k + '" aria-label="Paso ' + (q + 1) + '" class="' +
          (k === pos.k ? 'actual' : q < j ? 'hecho' : '') + '"' + (k === pos.k ? ' aria-current="step"' : '') + '></button>').join('');
        $('.gt-texto', vPaso).innerHTML = p.t;
        const ent = $('.guia-entera', vPaso);
        ent.textContent = entera ? 'Acercar a lo importante' : 'Ver la pantalla entera';
        ent.setAttribute('aria-pressed', entera);
        visorPaso.muestra(p, { entera, cambia });
      } else if (pos.tipo === 'comprueba') {
        const c = tr.comprueba, l = c.lista && c.lista.length ? c.lista : [c.t || ''];
        lista.innerHTML = l.map((t, j) => '<li><label><input type="checkbox" data-j="' + j + '"><span>' + t + '</span></label></li>').join('');
        const x = (datos.comprueba || {})[pos.n];
        extraComp.innerHTML = x && x.figura ? lamina(x.figura, base) : '';
        const minw = encajaComprueba(c);
        visorComp.muestra({ t: '', img: c.img, m: [c.zona], encaja: true, minw }, { entera, cambia });
      }
      // si el foco se ha quedado en una vista que ya no se ve, pasa al botón Siguiente de la vista nueva
      const a = document.activeElement;
      if (a && el.contains(a) && a.closest('[hidden]')) $('.gt-sig', vista).focus({ preventScroll: true });
    }

    // ---- moverse ----
    function ir(p) {
      if (!p) return;
      const cambia = !igual(p, pos);
      pos = p; entera = false;
      pinta(cambia);
    }
    // un paso de la secuencia hacia delante (1) o hacia atrás (-1); false si se sale de la guía
    function mueve(d) {
      const j = SEC.findIndex((x) => igual(x, pos)) + d;
      if (j < 0 || j >= SEC.length) return false;
      ir(SEC[j]); return true;
    }
    $$('.gt-ant').forEach((b) => b.addEventListener('click', () => mueve(-1)));
    $$('.gt-sig').forEach((b) => b.addEventListener('click', () => { if (!mueve(1) && stage) stage.next(); }));
    botIndice.forEach((b) => b.addEventListener('click', () => { const n = +b.dataset.n; ir(n < 0 ? { tipo: 'partes', n: -1 } : { tipo: 'entrada', n }); }));
    puntos.addEventListener('click', (e) => { const b = e.target.closest('button'); if (b) ir({ tipo: 'paso', n: pos.n, k: +b.dataset.k }); });
    const alterna = () => { entera = !entera; pinta(false); };
    $('.guia-entera', vPaso).addEventListener('click', alterna);
    $('.guia-pantalla', vPaso).addEventListener('click', alterna);
    $('.guia-pantalla', vComp).addEventListener('click', alterna);

    // en la presentación, → y ← recorren la guía; al salirse por un extremo, cambian de diapositiva como siempre
    window.addEventListener('keydown', (e) => {
      const sec = el.closest('section');
      if (!sec || !sec.hasAttribute('data-deck-active') || e.altKey || e.ctrlKey || e.metaKey) return;
      const t = e.target;
      if (t.closest && t.closest('textarea, select, input:not([type="checkbox"])')) return;
      const avanza = ['ArrowRight', 'PageDown', ' '].includes(e.key), vuelve = ['ArrowLeft', 'PageUp'].includes(e.key);
      if (!avanza && !vuelve) return;
      const dentro = t.closest && el.contains(t);
      // la barra espaciadora pulsa el botón o la casilla que tiene el foco (y no cambia de diapositiva)
      if (e.key === ' ' && dentro && t.closest('button, input')) { e.stopImmediatePropagation(); return; }
      if (mueve(avanza ? 1 : -1)) { e.preventDefault(); e.stopImmediatePropagation(); return; }
      // en una casilla, deck-stage no atiende las flechas: se le pide el cambio de diapositiva
      if (dentro && t.matches('input') && stage) { e.preventDefault(); e.stopImmediatePropagation(); if (avanza) stage.next(); else stage.prev(); }
    }, true);
    // al llegar a la diapositiva o cambiar el tamaño, se recoloca sin animación
    const recoloca = () => {
      if (!el.closest('section')?.hasAttribute('data-deck-active')) return;
      if (pos.tipo === 'paso') visorPaso.recoloca();
      else if (pos.tipo === 'comprueba') visorComp.recoloca();
      else if (pos.tipo === 'entrada') ajustaLaminas($('.gt-entrada.forma-lado .gt-figura', el));
    };
    if (stage) stage.addEventListener('slidechange', () => setTimeout(recoloca, 50));
    window.addEventListener('resize', recoloca);
    pinta(true);
  }

  /* Anatomía de una página (UT3): <div class="anatomia" data-anatomia="clave" data-base="img/guias/"></div>
     AW.anatomias[clave] = [{ titulo, img, arbol }], con arbol = { n: 'Contenedor', d: 'en fila · 44 %', c: 1, r: [x, y, an, al], h: [hijos] }
     (r en % de la captura de la sección). A la izquierda, el árbol de contenedores y widgets; a la derecha, la
     sección con sus cajas. Señalar un elemento del árbol enciende su caja y al revés. En la presentación, →
     recorre los elementos uno a uno, luego la sección siguiente y, al final, pasa de diapositiva. */
  function montaAnatomia(el) {
    const secs = (AW.anatomias || {})[el.dataset.anatomia];
    if (!secs || !secs.length) { el.textContent = 'Falta la anatomía ' + el.dataset.anatomia; return; }
    const base = el.dataset.base || 'img/guias/';
    // nodos en orden, con nivel; los contenedores iguales a su hermano anterior salen plegados
    const firma = (n) => n.n + '(' + (n.h || []).map(firma).join(',') + ')';
    secs.forEach((s) => {
      s.nodos = [];
      const recorre = (n, nivel, oculto) => {
        n.k = s.nodos.length; n.nivel = nivel; n.oculto = oculto; s.nodos.push(n);
        let previo = null;
        (n.h || []).forEach((h) => {
          h.repe = !!(previo && h.c && firma(previo) === firma(h));
          recorre(h, nivel + 1, oculto || false);
          previo = h;
        });
      };
      recorre(s.arbol, 0, false);
    });
    el.innerHTML = '<div class="an-pestanas" role="tablist">' + secs.map((s, i) => '<button type="button" role="tab"><span>' + (i + 1) + '</span>' + esc(s.titulo) + '</button>').join('') + '</div>' +
      '<div class="an-cuerpo"><ol class="an-arbol"></ol><div class="an-marco"><div class="an-lienzo"><img alt=""><div class="an-cajas"></div></div></div></div>';
    const pest = [...el.querySelectorAll('.an-pestanas button')];
    const arbol = el.querySelector('.an-arbol'), marco = el.querySelector('.an-marco'), lienzo = el.querySelector('.an-lienzo');
    const img = lienzo.querySelector('img'), cajas = lienzo.querySelector('.an-cajas');
    let s = 0, sel = 0;
    const plegados = new Set();
    function visibles() {
      // un nodo se ve si ningún antepasado está plegado
      const S = secs[s], vis = [];
      const anda = (n, tapado) => { if (!tapado) vis.push(n); const pl = plegados.has(s + ':' + n.k); (n.h || []).forEach((h) => anda(h, tapado || pl)); };
      anda(S.arbol, false);
      return vis;
    }
    function encaja() {
      const r = img.naturalWidth / img.naturalHeight || 2;
      const mw = marco.clientWidth, mh = marco.clientHeight;
      let w = mw, h = mw / r;
      if (h > mh) { h = mh; w = mh * r; }
      lienzo.style.width = w + 'px'; lienzo.style.height = h + 'px';
    }
    function seccion(i) {
      s = i; sel = 0;
      const S = secs[s];
      plegados.clear();
      S.nodos.forEach((n) => { if (n.repe) plegados.add(s + ':' + n.k); });
      pest.forEach((b, k) => { b.classList.toggle('actual', k === s); b.setAttribute('aria-selected', k === s); });
      img.onload = () => { encaja(); };
      img.src = base + S.img + '.webp'; img.alt = 'Sección ' + S.titulo;
      cajas.innerHTML = S.nodos.map((n) => '<div class="an-caja' + (n.c ? ' contenedor' : '') + '" data-k="' + n.k + '" style="left:' + n.r[0] + '%;top:' + n.r[1] + '%;width:' + n.r[2] + '%;height:' + n.r[3] + '%"><span>' + esc(n.n) + (n.c ? '' : (n.d && /^h\d|^p /.test(n.d) ? ' ' + esc(n.d.split(' · ')[0]) : '')) + '</span></div>').join('');
      cajas.querySelectorAll('.an-caja').forEach((c) => {
        c.addEventListener('mouseenter', () => marca(+c.dataset.k));
        c.addEventListener('click', (e) => { e.stopPropagation(); marca(+c.dataset.k); });
      });
      pintaArbol();
      marca(0);
    }
    function pintaArbol() {
      const S = secs[s];
      arbol.innerHTML = visibles().map((n) => {
        const pl = plegados.has(s + ':' + n.k);
        const flecha = n.c ? (n.d.startsWith('en fila') ? '→' : '↓') : '';
        return '<li style="--nivel:' + n.nivel + '"><button type="button" class="an-nodo' + (n.c ? ' contenedor' : '') + '" data-k="' + n.k + '">' +
          '<b>' + esc(n.n) + (flecha ? ' <i>' + flecha + '</i>' : '') + '</b> <small>' + esc(pl ? n.d + ' · igual que la anterior (+)' : (n.d || '')) + '</small></button></li>';
      }).join('');
      arbol.querySelectorAll('.an-nodo').forEach((b) => {
        const k = +b.dataset.k;
        b.addEventListener('mouseenter', () => marca(k));
        b.addEventListener('focus', () => marca(k));
        b.addEventListener('click', () => { const id = s + ':' + k; if (plegados.has(id)) { plegados.delete(id); pintaArbol(); } marca(k); });
      });
      marca(sel);
    }
    function marca(k) {
      sel = k;
      cajas.classList.add('con-foco');
      cajas.querySelectorAll('.an-caja').forEach((c) => c.classList.toggle('foco', +c.dataset.k === k));
      arbol.querySelectorAll('.an-nodo').forEach((b) => b.classList.toggle('foco', +b.dataset.k === k));
      const b = arbol.querySelector('.an-nodo.foco');
      if (b) b.scrollIntoView({ block: 'nearest' });
    }
    pest.forEach((b, i) => b.addEventListener('click', () => seccion(i)));
    // → recorre los elementos visibles; al final de una sección, la siguiente
    window.addEventListener('keydown', (e) => {
      const sec = el.closest('section');
      if (!sec || !sec.hasAttribute('data-deck-active') || e.altKey || e.ctrlKey || e.metaKey) return;
      const avanza = ['ArrowRight', 'PageDown', ' '].includes(e.key), vuelve = ['ArrowLeft', 'PageUp'].includes(e.key);
      if (!avanza && !vuelve) return;
      const vis = visibles().map((n) => n.k), pos = vis.indexOf(sel);
      if (avanza) {
        if (pos < vis.length - 1) marca(vis[pos + 1]);
        else if (s < secs.length - 1) seccion(s + 1);
        else return;
      } else {
        if (pos > 0) marca(vis[pos - 1]);
        else if (s > 0) { seccion(s - 1); const v = visibles(); marca(v[v.length - 1].k); }
        else return;
      }
      e.preventDefault(); e.stopImmediatePropagation();
    }, true);
    const stage = document.querySelector('deck-stage');
    if (stage) stage.addEventListener('slidechange', () => { if (el.closest('section')?.hasAttribute('data-deck-active')) encaja(); });
    window.addEventListener('resize', encaja);
    seccion(0);
  }

  function init() {
    const stage = document.querySelector('deck-stage');
    if (!stage) return;
    numera(stage);
    document.querySelectorAll('pre.cod[data-lang]').forEach(montaCodigo);
    document.querySelectorAll('.resultado[data-codigo]').forEach(montaResultado);
    document.querySelectorAll('.ej[data-tipo]').forEach(montaEjercicio);
    document.querySelectorAll('.caja-sim').forEach(montaCaja);
    document.querySelectorAll('.practica-css').forEach(montaPractica);
    document.querySelectorAll('.quiz').forEach(montaQuiz);
    document.querySelectorAll('.revela').forEach(montaRevela);
    document.querySelectorAll('.galeria').forEach(montaGaleria);
    document.querySelectorAll('.foto').forEach(montaFoto);
    document.querySelectorAll('.pill-solucion, .abre-modal').forEach(montaSolucion);
    document.querySelectorAll('section.chuleta').forEach(montaChuleta);
    document.querySelectorAll('.guia[data-guia]').forEach(montaGuia);
    document.querySelectorAll('.anatomia[data-anatomia]').forEach(montaAnatomia);
    montaBuscador(stage);
    montaVolver(stage);
    montaNotas(stage);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
