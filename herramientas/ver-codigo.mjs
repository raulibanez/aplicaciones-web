// Publica la página final de la práctica de la UT2 en ut02/ejemplos/videojuego (02/11/2026):
// la página en vivo («Ver ejemplo», diapositiva 10) y sus páginas de código con botón Copiar
// («Ver HTML» y «Ver CSS», diapositiva 04). Lee ../Ejemplos/ut02-videojuego.
// Uso: node herramientas/ver-codigo.mjs
import { readFileSync, writeFileSync, mkdirSync, cpSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const raiz = fileURLToPath(new URL('../..', import.meta.url));
const origen = `${raiz}/Ejemplos/ut02-videojuego`;
const destino = `${raiz}/aplicaciones-web/ut02/ejemplos/videojuego`;
const imgs = 'https://raulibanez.github.io/aplicaciones-web/ut02/ejemplos/videojuego/img/';

const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

function pagina({ titulo, archivo, nota, panel, codigo }) {
  const lineas = codigo.replace(/\r\n/g, '\n').replace(/\n+$/, '').split('\n')
    .map((l) => `<span class="l">${esc(l) || ' '}</span>`).join('');
  return `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${titulo}</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;700;800&family=JetBrains+Mono:wght@400;600&display=swap" rel="stylesheet">
<style>
  :root { --navy: #041C3F; --green: #A5E070; --green-dark: #0A6E1A; --cyan: #1CCFE3; --gray: #E3ECF3; --line: #D6E0EA; }
  * { box-sizing: border-box; }
  body { margin: 0; background: var(--gray); color: var(--navy); font-family: 'Plus Jakarta Sans', system-ui, sans-serif; }
  header { position: sticky; top: 0; z-index: 1; display: flex; flex-wrap: wrap; align-items: center; gap: 16px 24px; padding: 20px 32px; background: var(--navy); color: #fff; }
  header h1 { margin: 0; font-size: 26px; font-weight: 800; font-family: 'JetBrains Mono', monospace; }
  header p { margin: 0; flex: 1; min-width: 280px; font-size: 17px; line-height: 1.4; color: #c9d6e6; }
  header p code { font-family: 'JetBrains Mono', monospace; color: var(--green); }
  .botones { display: flex; gap: 12px; }
  .boton { border: 0; border-radius: 999px; padding: 12px 26px; font: 700 18px 'Plus Jakarta Sans', system-ui, sans-serif; cursor: pointer; text-decoration: none; }
  .copiar { background: var(--green); color: var(--navy); box-shadow: 0 2px 0 var(--green-dark); }
  .copiar:hover { background: var(--cyan); box-shadow: none; }
  .codepen { background: transparent; color: #fff; border: 3px solid rgba(255,255,255,.4); padding: 9px 23px; }
  .codepen:hover { border-color: var(--cyan); }
  pre { margin: 24px 32px 48px; padding: 24px 0; background: #fff; border: 3px solid var(--line); border-radius: 16px; overflow-x: auto; font: 19px/1.55 'JetBrains Mono', monospace; counter-reset: l; }
  .l { display: block; padding: 0 28px 0 0; }
  .l::before { counter-increment: l; content: counter(l); display: inline-block; width: 4.2em; padding-right: 1.4em; text-align: right; color: #a8b4c4; user-select: none; }
</style>
</head>
<body>
<header>
  <h1>${archivo}</h1>
  <p>${nota}</p>
  <div class="botones">
    <button type="button" class="boton copiar" id="copiar">Copiar ${panel}</button>
    <a class="boton codepen" href="https://codepen.io/pen/" target="_blank" rel="noopener">Nuevo pen</a>
  </div>
</header>
<pre id="codigo">${lineas}</pre>
<script>
  const boton = document.getElementById('copiar');
  const texto = [...document.querySelectorAll('#codigo .l')].map((l) => l.textContent).join('\\n') + '\\n';
  function avisa(msg) { const t = boton.textContent; boton.textContent = msg; setTimeout(() => { boton.textContent = t; }, 1800); }
  boton.addEventListener('click', async () => {
    try { await navigator.clipboard.writeText(texto); avisa('Copiado ✓'); }
    catch {
      const r = document.createRange(); r.selectNodeContents(document.getElementById('codigo'));
      const s = getSelection(); s.removeAllRanges(); s.addRange(r);
      avisa(document.execCommand('copy') ? 'Copiado ✓' : 'Pulsa Ctrl+C');
    }
  });
</script>
</body>
</html>
`;
}

mkdirSync(destino, { recursive: true });

const html = readFileSync(`${origen}/index.html`, 'utf8').replace(/src="img\//g, `src="${imgs}`);
writeFileSync(`${destino}/ver-html.html`, pagina({
  titulo: 'index.html · Mi videojuego favorito',
  archivo: 'index.html',
  nota: 'El HTML de «Mi videojuego favorito», igual antes y después. Va al panel HTML de CodePen. Las imágenes llevan su dirección completa para verse en CodePen; en tu carpeta son <code>img/stk1.jpg</code>…',
  panel: 'HTML',
  codigo: html,
}));

const css = readFileSync(`${origen}/style.css`, 'utf8');
writeFileSync(`${destino}/ver-css.html`, pagina({
  titulo: 'style.css · Mi videojuego favorito',
  archivo: 'style.css',
  nota: 'La hoja de estilo de la parte 3 de la práctica: la página del «después». Va al panel CSS de CodePen.',
  panel: 'CSS',
  codigo: css,
}));

for (const f of ['index.html', 'style.css', 'img']) cpSync(`${origen}/${f}`, `${destino}/${f}`, { recursive: true });

console.log('ok');
