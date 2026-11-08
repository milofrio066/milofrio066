// Genera los SVG animados del perfil de GitHub (milofrio066).
// Uso: node scripts/build-assets.mjs  → escribe ./assets/*.svg y ./preview.html
// Los SVG usan solo CSS + SMIL (sin JS ni fuentes externas) para que GitHub los anime al mostrarlos como <img>.
import { writeFileSync, readFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const out = join(root, 'assets');
mkdirSync(out, { recursive: true });

const C = {
  bg: '#05060f', panel: '#0a0d1f', panel2: '#0e1230', cyan: '#00f0ff', violet: '#7b5cff',
  magenta: '#ff3df2', green: '#3dff9a', amber: '#ffcf5c', text: '#d7defc', muted: '#7d86b3', line: '#1c2347',
};
const MONO = "'JetBrains Mono','Fira Code','Cascadia Code','SF Mono',Consolas,ui-monospace,monospace";
const SANS = "'Segoe UI','Inter',system-ui,-apple-system,'Helvetica Neue',Arial,sans-serif";
const CW = 0.6; // ancho aproximado de un carácter monoespaciado (em)
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
let seed = 66;
const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
const r2 = (n) => +n.toFixed(2);

const svg = (w, h, body, css = '') => `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" fill="none">
<style>
text{font-family:${SANS}}
.mono{font-family:${MONO}}
@keyframes blink{0%,49%{opacity:1}50%,100%{opacity:0}}
@keyframes pulse{0%,100%{opacity:.3}50%{opacity:1}}
.blink{animation:blink 1.1s steps(1) infinite}
.pulse{animation:pulse 2.4s ease-in-out infinite}
${css}
@media (prefers-reduced-motion:reduce){*{animation:none!important}}
</style>
${body}
</svg>
`;

const glow = (id, sd = 5) => `<filter id="${id}" x="-30%" y="-60%" width="160%" height="220%"><feGaussianBlur stdDeviation="${sd}" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>`;
const brandGrad = (id, extra = '') => `<linearGradient id="${id}" ${extra}><stop offset="0" stop-color="${C.cyan}"/><stop offset=".5" stop-color="${C.violet}"/><stop offset="1" stop-color="${C.magenta}"/></linearGradient>`;

// Convierte puntos [t(s), valor] en un <animate> SMIL en bucle.
function anim(attr, pts, total, mode = 'linear') {
  const p = [...pts].sort((a, b) => a[0] - b[0]);
  if (p[0][0] > 0) p.unshift([0, p[0][1]]);
  if (p.at(-1)[0] < total) p.push([total, p.at(-1)[1]]);
  let last = 0;
  const kt = p.map(([t]) => (last = Math.min(1, Math.max(last, t / total))).toFixed(4));
  kt[0] = '0';
  kt[kt.length - 1] = '1';
  const vals = p.map(([, v]) => (typeof v === 'number' ? r2(v) : v));
  return `<animate attributeName="${attr}" dur="${total}s" repeatCount="indefinite" calcMode="${mode}" keyTimes="${kt.join(';')}" values="${vals.join(';')}"/>`;
}
const typePts = (start, dur, n, cw) => Array.from({ length: n + 1 }, (_, k) => [start + (dur * k) / n, k * cw]);
const erasePts = (start, dur, n, cw) => Array.from({ length: n + 1 }, (_, k) => [start + (dur * k) / n, (n - k) * cw]);

const corners = (x, y, w, h, l, color, sw = 2) => `<g stroke="${color}" stroke-width="${sw}" stroke-linecap="square">
<path d="M${x} ${y + l}V${y}H${x + l}"/><path d="M${x + w - l} ${y}H${x + w}V${y + l}"/>
<path d="M${x} ${y + h - l}V${y + h}H${x + l}"/><path d="M${x + w - l} ${y + h}H${x + w}V${y + h - l}"/></g>`;

function chip(x, y, label, { size = 12, color = C.cyan, pad = 12, h = 26, fill = 'none' } = {}) {
  const w = label.length * size * CW + pad * 2;
  return {
    w,
    el: `<rect x="${r2(x)}" y="${y}" width="${r2(w)}" height="${h}" rx="${h / 2}" fill="${fill}" stroke="${color}" stroke-opacity=".45"/>
<text class="mono" x="${r2(x + pad)}" y="${y + h / 2 + size * 0.36}" font-size="${size}" fill="${color}">${esc(label)}</text>`,
  };
}

/* ───────────────────────────── HERO ───────────────────────────── */
function hero() {
  const W = 1200, H = 420, HZ = 300;
  // Estrellas
  let stars = '';
  for (let i = 0; i < 80; i++) {
    const x = r2(rnd() * W), y = r2(rnd() * (HZ - 20)), r = r2(0.5 + rnd() * 1.4);
    stars += `<circle cx="${x}" cy="${y}" r="${r}" fill="${rnd() > 0.8 ? C.cyan : '#ffffff'}" class="tw" style="animation-duration:${r2(2 + rnd() * 4)}s;animation-delay:-${r2(rnd() * 5)}s"/>`;
  }
  // Suelo en perspectiva
  let floor = '';
  for (let i = -16; i <= 16; i++) floor += `<line x1="${600 + i * 90}" y1="${H}" x2="600" y2="${HZ - 60}" stroke="${C.violet}" stroke-opacity=".35"/>`;
  for (let i = 0; i < 9; i++) {
    floor += `<line x1="0" x2="${W}" y1="${HZ}" y2="${HZ}" stroke="${C.cyan}" stroke-opacity=".5">
<animate attributeName="y1" values="${HZ};${H}" dur="4.5s" begin="-${r2(i * 0.5)}s" repeatCount="indefinite" calcMode="spline" keyTimes="0;1" keySplines=".55 0 1 1"/>
<animate attributeName="y2" values="${HZ};${H}" dur="4.5s" begin="-${r2(i * 0.5)}s" repeatCount="indefinite" calcMode="spline" keyTimes="0;1" keySplines=".55 0 1 1"/>
<animate attributeName="stroke-opacity" values="0;.7" dur="4.5s" begin="-${r2(i * 0.5)}s" repeatCount="indefinite"/></line>`;
  }

  // Órbitas con nodos tecnológicos
  const ox = 960, oy = 170;
  const ell = (rx, ry) => `M${ox - rx} ${oy}a${rx} ${ry} 0 1 0 ${rx * 2} 0a${rx} ${ry} 0 1 0 ${-rx * 2} 0`;
  const rings = [
    { rx: 175, ry: 46, dur: 14, nodes: ['AI', 'WEB'], color: C.cyan },
    { rx: 125, ry: 82, dur: 10, nodes: ['IoT', 'SEC'], color: C.violet },
    { rx: 82, ry: 82, dur: 7, nodes: ['DATA'], color: C.magenta },
  ];
  let orbit = '';
  rings.forEach((rg, ri) => {
    orbit += `<path id="orb${ri}" d="${ell(rg.rx, rg.ry)}" stroke="${rg.color}" stroke-opacity=".35" stroke-dasharray="${ri === 2 ? '3 7' : 'none'}"/>`;
    rg.nodes.forEach((n, ni) => {
      const begin = -((rg.dur / rg.nodes.length) * ni) - ri;
      const w = n.length * 7.2 + 16;
      orbit += `<g><animateMotion dur="${rg.dur}s" begin="${begin}s" repeatCount="indefinite"><mpath href="#orb${ri}"/></animateMotion>
<circle r="14" fill="${rg.color}" opacity=".15"/><circle r="4" fill="${rg.color}" filter="url(#g2)"/>
<rect x="${-w / 2}" y="-34" width="${w}" height="18" rx="4" fill="${C.bg}" stroke="${rg.color}" stroke-opacity=".6"/>
<text class="mono" x="0" y="-21" font-size="11" fill="${rg.color}" text-anchor="middle">${n}</text></g>`;
    });
  });
  const core = `<circle cx="${ox}" cy="${oy}" r="46" fill="url(#coreG)"/>
<circle cx="${ox}" cy="${oy}" r="30" stroke="${C.cyan}" stroke-opacity=".8" stroke-dasharray="4 6"><animateTransform attributeName="transform" type="rotate" from="0 ${ox} ${oy}" to="360 ${ox} ${oy}" dur="12s" repeatCount="indefinite"/></circle>
<circle cx="${ox}" cy="${oy}" r="40" stroke="${C.magenta}" stroke-opacity=".5" stroke-dasharray="40 30"><animateTransform attributeName="transform" type="rotate" from="360 ${ox} ${oy}" to="0 ${ox} ${oy}" dur="9s" repeatCount="indefinite"/></circle>
<circle cx="${ox}" cy="${oy}" r="12" fill="${C.cyan}" filter="url(#g1)" class="pulse"/>
<polygon points="${[0, 1, 2, 3, 4, 5].map((k) => `${r2(ox + 58 * Math.cos((Math.PI / 3) * k + Math.PI / 6))},${r2(oy + 58 * Math.sin((Math.PI / 3) * k + Math.PI / 6))}`).join(' ')}" stroke="${C.cyan}" stroke-opacity=".25"/>`;

  // Rol con efecto de tipeo en bucle
  const roles = ['Systems Engineering Student', 'Full-Stack Software Developer', 'AI · Cybersecurity · IoT Builder', 'Currently building nextONE_'];
  const rx0 = 98, ry = 238, fs = 22, cw = fs * CW, slot = 4, total = slot * roles.length;
  let roleEls = '';
  const cursorPts = [[0, 0]];
  roles.forEach((role, i) => {
    const n = role.length, s = i * slot, Wd = n * cw + 2;
    const pts = [[0, 0], ...typePts(s + 0.2, 1.4, n, cw), [s + 3.3, n * cw], ...erasePts(s + 3.3, 0.5, n, cw)];
    cursorPts.push(...pts.slice(1));
    roleEls += `<clipPath id="rc${i}"><rect x="${rx0}" y="${ry - 24}" height="34" width="0">${anim('width', pts.map(([t, v]) => [t, v === n * cw ? Wd : v]), total, 'discrete')}</rect></clipPath>
<text class="mono" x="${rx0}" y="${ry}" font-size="${fs}" fill="${C.text}" clip-path="url(#rc${i})">${esc(role)}</text>`;
  });
  const cursor = `<rect y="${ry - 20}" width="12" height="24" fill="${C.cyan}" class="blink">${anim('x', cursorPts.map(([t, v]) => [t, rx0 + v + 3]), total, 'discrete')}</rect>`;

  // Chips
  let cx = 70, chips = '';
  for (const label of ['◉ PEREIRA · CO', 'FULL-STACK', 'AI', 'CYBERSECURITY', 'IoT', 'DATA']) {
    const c = chip(cx, 268, label, { color: label.startsWith('◉') ? C.green : C.cyan });
    chips += c.el;
    cx += c.w + 10;
  }

  const name = 'JUAN CAMILO MARÍN';
  const css = `
@keyframes tw{0%,100%{opacity:.15}50%{opacity:1}}
.tw{animation:tw 3s ease-in-out infinite}
@keyframes g1{0%,90%,100%{opacity:0;transform:translate(0,0)}91%{opacity:.85;transform:translate(-5px,1px)}93%{opacity:.85;transform:translate(4px,-2px)}95%{opacity:0}}
@keyframes g2{0%,90%,100%{opacity:0;transform:translate(0,0)}91%{opacity:.85;transform:translate(5px,-1px)}93%{opacity:.85;transform:translate(-3px,2px)}95%{opacity:0}}
.gl1{animation:g1 5s infinite}.gl2{animation:g2 5s infinite}
@keyframes boot{0%{opacity:0}100%{opacity:1}}
.boot{animation:boot 1.2s ease-out both}`;

  const body = `<defs>
<radialGradient id="bgG" cx=".3" cy=".25" r="1"><stop offset="0" stop-color="#16124a"/><stop offset=".55" stop-color="${C.bg}"/></radialGradient>
<radialGradient id="coreG"><stop offset="0" stop-color="${C.cyan}" stop-opacity=".55"/><stop offset=".5" stop-color="${C.violet}" stop-opacity=".2"/><stop offset="1" stop-color="${C.violet}" stop-opacity="0"/></radialGradient>
<linearGradient id="nameG" gradientUnits="userSpaceOnUse" x1="70" y1="0" x2="720" y2="0" spreadMethod="repeat">
<stop offset="0" stop-color="${C.cyan}"/><stop offset=".35" stop-color="${C.violet}"/><stop offset=".7" stop-color="${C.magenta}"/><stop offset="1" stop-color="${C.cyan}"/>
<animateTransform attributeName="gradientTransform" type="translate" from="0 0" to="650 0" dur="6s" repeatCount="indefinite"/></linearGradient>
<linearGradient id="floorFade" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${C.bg}"/><stop offset=".6" stop-color="${C.bg}" stop-opacity="0"/></linearGradient>
<linearGradient id="scanG" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${C.cyan}" stop-opacity="0"/><stop offset="1" stop-color="${C.cyan}" stop-opacity=".25"/></linearGradient>
${brandGrad('frameG')}
<pattern id="scanlines" width="4" height="4" patternUnits="userSpaceOnUse"><rect width="4" height="1" fill="#fff" opacity=".035"/></pattern>
<clipPath id="frame"><rect width="${W}" height="${H}" rx="18"/></clipPath>
<clipPath id="floorClip"><rect y="${HZ}" width="${W}" height="${H - HZ}"/></clipPath>
${glow('g1', 6)}${glow('g2', 3)}
</defs>
<g clip-path="url(#frame)">
<rect width="${W}" height="${H}" fill="url(#bgG)"/>
${stars}
<g clip-path="url(#floorClip)">${floor}<rect y="${HZ}" width="${W}" height="${H - HZ}" fill="url(#floorFade)"/></g>
<line x1="0" x2="${W}" y1="${HZ}" y2="${HZ}" stroke="${C.magenta}" stroke-opacity=".6" filter="url(#g2)"/>
<g class="boot">${orbit}${core}</g>
<g class="boot">
<text class="mono" x="70" y="40" font-size="12" fill="${C.muted}" letter-spacing="1.5">SYS://MILOFRIO066 <tspan fill="${C.line}">│</tspan> BUILDING TECHNOLOGY WITH PURPOSE</text>
<circle cx="1028" cy="36" r="4" fill="${C.green}" class="pulse"/>
<text class="mono" x="1040" y="40" font-size="12" fill="${C.green}" letter-spacing="1.5">ONLINE</text>
<text class="mono" x="70" y="104" font-size="14" fill="${C.cyan}" letter-spacing="2">▸ HELLO WORLD, I'M</text>
<text x="70" y="172" font-size="56" font-weight="800" letter-spacing="2" fill="${C.cyan}" class="gl1">${name}</text>
<text x="70" y="172" font-size="56" font-weight="800" letter-spacing="2" fill="${C.magenta}" class="gl2">${name}</text>
<text x="70" y="172" font-size="56" font-weight="800" letter-spacing="2" fill="url(#nameG)" filter="url(#g2)">${name}</text>
<text class="mono" x="70" y="${ry}" font-size="${fs}" fill="${C.magenta}">&gt;</text>
${roleEls}${cursor}
${chips}
</g>
<rect width="${W}" height="${H}" fill="url(#scanlines)"/>
<rect x="0" y="-80" width="${W}" height="80" fill="url(#scanG)"><animate attributeName="y" values="-80;${H}" dur="7s" repeatCount="indefinite"/></rect>
${corners(16, 16, W - 32, H - 32, 26, C.cyan)}
</g>
<rect x=".5" y=".5" width="${W - 1}" height="${H - 1}" rx="18" stroke="url(#frameG)" stroke-opacity=".7"/>`;
  return svg(W, H, body, css);
}

/* ─────────────────────── ENCABEZADOS DE SECCIÓN ─────────────────────── */
function header(num, title, tag) {
  const W = 1200, H = 70, tx = 92, titleW = title.length * 22;
  const lx = tx + titleW + 24, tagW = tag.length * 13 * CW;
  const lineEnd = W - tagW - 30;
  return svg(W, H, `<defs>${brandGrad('hg')}${glow('hgl', 3)}
<linearGradient id="pulseG" gradientUnits="userSpaceOnUse" x1="0" x2="160"><stop offset="0" stop-color="${C.cyan}" stop-opacity="0"/><stop offset=".5" stop-color="${C.cyan}"/><stop offset="1" stop-color="${C.magenta}" stop-opacity="0"/></linearGradient></defs>
<text class="mono" x="8" y="45" font-size="18" fill="${C.magenta}">//${num}</text>
<rect x="68" y="25" width="10" height="24" fill="${C.cyan}" class="blink"/>
<text x="${tx}" y="47" font-size="28" font-weight="800" letter-spacing="3" fill="url(#hg)" filter="url(#hgl)">${esc(title)}</text>
<line x1="${lx}" x2="${lineEnd}" y1="37" y2="37" stroke="${C.line}" stroke-width="2"/>
<rect x="${lx}" y="35" width="160" height="4" fill="url(#pulseG)"><animate attributeName="x" values="${lx - 160};${lineEnd}" dur="3.2s" repeatCount="indefinite"/></rect>
<circle cx="${lineEnd}" cy="37" r="4" fill="${C.cyan}" class="pulse"/>
<text class="mono" x="${W - 8}" y="42" font-size="13" fill="${C.muted}" text-anchor="end">${esc(tag)}</text>`, '');
}

/* ───────────────────────────── TERMINAL ───────────────────────────── */
function terminal() {
  const W = 1200, H = 370, x0 = 40, fs = 16, cw = fs * CW, total = 22, y0 = 92, lh = 31;
  const prompt = `<tspan fill="${C.green}">milo</tspan><tspan fill="${C.muted}">@</tspan><tspan fill="${C.cyan}">nextone</tspan><tspan fill="${C.muted}">:~$</tspan>`;
  const promptLen = 'milo@nextone:~$ '.length;
  const lines = [
    { cmd: 'whoami' },
    { out: [['Juan Camilo Marín', C.text, 700], [' — Systems Engineering student & software developer', C.muted]] },
    { cmd: 'cat mission.txt' },
    { out: [['"Turning real-world problems into functional technology — from idea to deployment."', C.amber]] },
    { cmd: 'ls ./interests' },
    { out: [['full-stack/  ', C.cyan], ['artificial-intelligence/  ', C.violet], ['cybersecurity/  ', C.magenta], ['iot/  ', C.green], ['data-science/', C.amber]] },
    { cmd: './now --status' },
    { out: [['▸ ', C.green], ['building nextONE', C.text, 700], ['  ·  learning AI & software architecture  ·  open to collaborate', C.muted]] },
  ];
  let t = 0.8, els = '';
  lines.forEach((ln, i) => {
    const y = y0 + i * lh;
    if (ln.cmd) {
      const n = ln.cmd.length, cx = x0 + promptLen * cw;
      els += `<text class="mono" x="${x0}" y="${y}" font-size="${fs}" opacity="0">${prompt}${anim('opacity', [[0, 0], [t, 0], [t, 1]], total, 'discrete')}</text>`;
      t += 0.35;
      els += `<clipPath id="tc${i}"><rect x="${cx}" y="${y - 18}" height="26" width="0">${anim('width', [[0, 0], ...typePts(t, n * 0.08, n, cw).map(([a, v]) => [a, v + (v ? 2 : 0)])], total, 'discrete')}</rect></clipPath>
<text class="mono" x="${cx}" y="${y}" font-size="${fs}" fill="${C.text}" clip-path="url(#tc${i})">${esc(ln.cmd)}</text>`;
      t += n * 0.08 + 0.45;
    } else {
      const n = ln.out.reduce((a, [s]) => a + s.length, 0), w = n * cw + 20;
      els += `<clipPath id="tc${i}"><rect x="${x0}" y="${y - 18}" height="26" width="0">${anim('width', [[0, 0], [t, 0], [t + 0.5, w]], total)}</rect></clipPath>
<text class="mono" x="${x0}" y="${y}" font-size="${fs}" clip-path="url(#tc${i})" xml:space="preserve">${ln.out.map(([s, c, fw]) => `<tspan fill="${c}"${fw ? ` font-weight="${fw}"` : ''}>${esc(s)}</tspan>`).join('')}</text>`;
      t += 1.1;
    }
  });
  const yl = y0 + lines.length * lh;
  els += `<g opacity="0">${anim('opacity', [[0, 0], [t, 0], [t, 1]], total, 'discrete')}
<text class="mono" x="${x0}" y="${yl}" font-size="${fs}">${prompt}</text>
<rect x="${x0 + promptLen * cw}" y="${yl - 15}" width="10" height="19" fill="${C.cyan}" class="blink"/></g>`;
  // Panel de métricas a la derecha
  const bars = Array.from({ length: 14 }, (_, k) => {
    const h1 = r2(8 + rnd() * 34), h2 = r2(8 + rnd() * 34), x = 1000 + k * 11;
    return `<rect x="${x}" width="6" rx="1" fill="${k % 3 ? C.violet : C.cyan}" opacity=".8" y="${300 - h1}" height="${h1}">
<animate attributeName="height" values="${h1};${h2};${h1}" dur="${r2(1.4 + rnd() * 1.6)}s" repeatCount="indefinite"/>
<animate attributeName="y" values="${300 - h1};${300 - h2};${300 - h1}" dur="${r2(1.4 + rnd() * 1.6)}s" repeatCount="indefinite"/></rect>`;
  }).join('');
  const body = `<defs>${brandGrad('tg')}<clipPath id="tclip"><rect width="${W}" height="${H}" rx="14"/></clipPath></defs>
<g clip-path="url(#tclip)">
<rect width="${W}" height="${H}" fill="${C.panel}"/>
<rect width="${W}" height="44" fill="${C.panel2}"/>
<circle cx="28" cy="22" r="6" fill="#ff5f57"/><circle cx="50" cy="22" r="6" fill="#febc2e"/><circle cx="72" cy="22" r="6" fill="#28c840"/>
<text class="mono" x="${W / 2}" y="27" font-size="13" fill="${C.muted}" text-anchor="middle">milo@nextone: ~/profile — zsh</text>
<text class="mono" x="${W - 24}" y="27" font-size="12" fill="${C.green}" text-anchor="end">● LIVE</text>
<g opacity="0">${anim('opacity', [[0, 0], [0.01, 1], [total - 0.8, 1], [total - 0.2, 0]], total)}${els}</g>
<g transform="translate(0,0)">
<rect x="984" y="214" width="186" height="104" rx="10" fill="${C.bg}" stroke="${C.line}"/>
<text class="mono" x="1000" y="236" font-size="11" fill="${C.muted}">COMMITS · BUILD · SHIP</text>
${bars}
</g>
</g>
<rect x=".5" y=".5" width="${W - 1}" height="${H - 1}" rx="14" stroke="url(#tg)" stroke-opacity=".55"/>`;
  return svg(W, H, body);
}

/* ─────────────────────────── TARJETAS DE PROYECTO ─────────────────────────── */
function wrap(text, max) {
  const words = text.split(' '), lines = [];
  let cur = '';
  for (const w of words) {
    if ((cur + ' ' + w).trim().length > max) { lines.push(cur.trim()); cur = w; } else cur += ' ' + w;
  }
  if (cur.trim()) lines.push(cur.trim());
  return lines;
}

const visuals = {
  network(bx, by, bw, bh) {
    const cx = bx + bw / 2, cy = by + bh / 2;
    const nodes = [[0, 0, 9], [-52, -48, 5], [50, -55, 6], [62, 18, 5], [28, 68, 6], [-46, 58, 5], [-66, 4, 6]];
    const edges = [[0, 1], [0, 2], [0, 3], [0, 4], [0, 5], [0, 6], [1, 2], [3, 4], [5, 6], [2, 3], [6, 1]];
    let s = '';
    edges.forEach(([a, b]) => { s += `<line x1="${cx + nodes[a][0]}" y1="${cy + nodes[a][1]}" x2="${cx + nodes[b][0]}" y2="${cy + nodes[b][1]}" stroke="${C.violet}" stroke-opacity=".45"/>`; });
    edges.slice(0, 6).forEach(([a, b], i) => {
      s += `<circle r="2.6" fill="${C.cyan}"><animateMotion dur="${r2(1.6 + i * 0.25)}s" begin="-${r2(i * 0.4)}s" repeatCount="indefinite" path="M${cx + nodes[a][0]} ${cy + nodes[a][1]}L${cx + nodes[b][0]} ${cy + nodes[b][1]}"/></circle>`;
    });
    nodes.forEach(([x, y, r], i) => {
      s += `<circle cx="${cx + x}" cy="${cy + y}" r="${r * 2.2}" fill="${i ? C.violet : C.cyan}" opacity=".15" class="pulse" style="animation-delay:-${i * 0.35}s"/><circle cx="${cx + x}" cy="${cy + y}" r="${r}" fill="${i ? C.violet : C.cyan}"/>`;
    });
    return s;
  },
  radar(bx, by, bw, bh) {
    const cx = bx + bw / 2, cy = by + bh / 2, R = 72;
    let s = [24, 48, 72].map((r) => `<circle cx="${cx}" cy="${cy}" r="${r}" stroke="${C.green}" stroke-opacity=".3"/>`).join('');
    s += `<line x1="${cx - R}" x2="${cx + R}" y1="${cy}" y2="${cy}" stroke="${C.green}" stroke-opacity=".2"/><line y1="${cy - R}" y2="${cy + R}" x1="${cx}" x2="${cx}" stroke="${C.green}" stroke-opacity=".2"/>`;
    let wedges = '';
    for (let k = 0; k < 8; k++) {
      const a1 = (-k * 6 * Math.PI) / 180, a2 = (-(k + 1) * 6 * Math.PI) / 180;
      wedges += `<path d="M${cx} ${cy}L${r2(cx + R * Math.cos(a1))} ${r2(cy + R * Math.sin(a1))}A${R} ${R} 0 0 0 ${r2(cx + R * Math.cos(a2))} ${r2(cy + R * Math.sin(a2))}Z" fill="${C.green}" opacity="${r2(0.45 - k * 0.055)}"/>`;
    }
    s += `<g>${wedges}<line x1="${cx}" y1="${cy}" x2="${cx + R}" y2="${cy}" stroke="${C.green}" stroke-width="2"/><animateTransform attributeName="transform" type="rotate" from="0 ${cx} ${cy}" to="360 ${cx} ${cy}" dur="3.6s" repeatCount="indefinite"/></g>`;
    [[30, -40, C.magenta], [-44, 22, C.green], [18, 50, C.amber], [-20, -28, C.green]].forEach(([x, y, c], i) => {
      s += `<circle cx="${cx + x}" cy="${cy + y}" r="4" fill="${c}" class="pulse" style="animation-duration:1.8s;animation-delay:-${i * 0.9}s"/>`;
    });
    s += `<text class="mono blink" x="${bx + 10}" y="${by + bh - 10}" font-size="10" fill="${C.magenta}">⚠ DEAUTH DETECTED</text>`;
    return s;
  },
  growth(bx, by, bw, bh) {
    let s = '';
    const base = by + bh - 24, n = 7, bwid = 12, gap = (bw - 30 - n * bwid) / (n - 1);
    const pts = [];
    for (let i = 0; i < n; i++) {
      const x = bx + 15 + i * (bwid + gap), h = 20 + i * 15, h0 = h * 0.35;
      pts.push(`${r2(x + bwid / 2)},${r2(base - h - 10)}`);
      s += `<rect x="${r2(x)}" width="${bwid}" rx="2" fill="url(#barG)" y="${base - h}" height="${h}">
<animate attributeName="height" values="${h0};${h};${h};${h0}" keyTimes="0;.35;.85;1" dur="4s" begin="${r2(i * 0.12)}s" repeatCount="indefinite"/>
<animate attributeName="y" values="${base - h0};${base - h};${base - h};${base - h0}" keyTimes="0;.35;.85;1" dur="4s" begin="${r2(i * 0.12)}s" repeatCount="indefinite"/></rect>`;
    }
    s += `<polyline points="${pts.join(' ')}" stroke="${C.amber}" stroke-width="2.5" stroke-linejoin="round" stroke-dasharray="320" stroke-dashoffset="320"><animate attributeName="stroke-dashoffset" values="320;0;0;320" keyTimes="0;.4;.85;1" dur="4s" repeatCount="indefinite"/></polyline>`;
    s += `<line x1="${bx + 10}" x2="${bx + bw - 10}" y1="${base}" y2="${base}" stroke="${C.line}" stroke-width="2"/>`;
    s += `<text class="mono" x="${bx + 10}" y="${by + 20}" font-size="10" fill="${C.green}">SCORE ▲ EXPLAINABLE</text>`;
    return s;
  },
  wave(bx, by, bw, bh) {
    const sine = (amp, period, yc, phase = 0) => {
      let d = '';
      for (let x = 0; x <= bw * 2 + period; x += 4) d += `${x ? 'L' : 'M'}${r2(bx + x)} ${r2(yc + amp * Math.sin(((x / period) * 2 + phase) * Math.PI))}`;
      return d;
    };
    let s = '';
    for (let i = 1; i < 6; i++) s += `<line x1="${bx}" x2="${bx + bw}" y1="${by + (bh / 6) * i}" y2="${by + (bh / 6) * i}" stroke="${C.line}"/>`;
    s += `<g clip-path="url(#vclip)">
<path d="${sine(26, 80, by + bh / 2)}" stroke="${C.cyan}" stroke-width="2.5"><animateTransform attributeName="transform" type="translate" from="0 0" to="-80 0" dur="2s" repeatCount="indefinite"/></path>
<path d="${sine(14, 53.3333, by + bh / 2, 0.5)}" stroke="${C.magenta}" stroke-width="1.5" opacity=".7"><animateTransform attributeName="transform" type="translate" from="-53.3333 0" to="0 0" dur="1.6s" repeatCount="indefinite"/></path></g>`;
    const bxm = bx + bw - 34, bym = by + 14;
    s += `<path d="M${bxm + 12} ${bym}L${bxm} ${bym + 22}H${bxm + 10}L${bxm + 6} ${bym + 38}L${bxm + 20} ${bym + 14}H${bxm + 10}Z" fill="${C.amber}" filter="url(#cg)" class="pulse"/>`;
    s += `<text class="mono" x="${bx + 10}" y="${by + bh - 10}" font-size="10" fill="${C.cyan}">kWh · FORECAST</text>`;
    return s;
  },
};

function card({ id, idx, title, subtitle, desc, tags, status, statusColor, link, visual, accent }) {
  const W = 600, H = 310, per = 2 * (W + H - 4);
  const lines = wrap(desc, 38).slice(0, 3);
  let tx = 32, tagEls = '';
  for (const t of tags) { const c = chip(tx, 230, t, { size: 12, color: accent, h: 26, pad: 10 }); tagEls += c.el; tx += c.w + 8; }
  const bx = 412, by = 56, bw = 160, bh = 190;
  const stW = status.length * 11 * CW + 30;
  const body = `<defs>
<linearGradient id="bg${id}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${C.panel2}"/><stop offset="1" stop-color="${C.bg}"/></linearGradient>
<linearGradient id="bd${id}" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="${C.cyan}"/><stop offset=".5" stop-color="${accent}"/><stop offset="1" stop-color="${C.magenta}"/></linearGradient>
<linearGradient id="barG" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="${C.violet}"/><stop offset="1" stop-color="${C.green}"/></linearGradient>
<clipPath id="vclip"><rect x="${bx}" y="${by}" width="${bw}" height="${bh}" rx="10"/></clipPath>
${glow('cg', 3)}
</defs>
<rect x="1" y="1" width="${W - 2}" height="${H - 2}" rx="16" fill="url(#bg${id})" stroke="${C.line}" stroke-width="2"/>
<rect x="1" y="1" width="${W - 2}" height="${H - 2}" rx="16" stroke="url(#bd${id})" stroke-width="2.5" stroke-dasharray="220 ${per - 220}" filter="url(#cg)">
<animate attributeName="stroke-dashoffset" from="0" to="-${per}" dur="7s" repeatCount="indefinite"/></rect>
<text class="mono" x="32" y="42" font-size="12" fill="${C.muted}" letter-spacing="2">PROJECT_${idx}</text>
<rect x="${bx + bw - stW}" y="24" width="${stW}" height="24" rx="12" fill="${statusColor}" fill-opacity=".1" stroke="${statusColor}" stroke-opacity=".6"/>
<circle cx="${bx + bw - stW + 13}" cy="36" r="3.5" fill="${statusColor}" class="pulse"/>
<text class="mono" x="${bx + bw - stW + 22}" y="40" font-size="11" fill="${statusColor}">${esc(status)}</text>
<text x="32" y="98" font-size="34" font-weight="800" fill="#ffffff" letter-spacing=".5">${esc(title)}</text>
<text class="mono" x="32" y="126" font-size="12.5" fill="${accent}" letter-spacing="1.5">${esc(subtitle)}</text>
${lines.map((l, i) => `<text x="32" y="${162 + i * 24}" font-size="16.5" fill="${C.text}" opacity=".9">${esc(l)}</text>`).join('')}
${tagEls}
<text class="mono" x="32" y="288" font-size="12" fill="${C.muted}">↗ ${esc(link)}</text>
<rect x="${bx}" y="${by}" width="${bw}" height="${bh}" rx="10" fill="${C.bg}" stroke="${C.line}"/>
${visuals[visual](bx, by, bw, bh)}
${corners(bx - 4, by - 4, bw + 8, bh + 8, 12, accent, 1.5)}`;
  return svg(W, H, body);
}

const projects = [
  { id: 'nextone', idx: '01', title: 'nextONE', subtitle: 'TECH COMMUNITY PLATFORM', desc: 'Centralizes events, webinars, projects, community interactions and analytics for tech ecosystems.', tags: ['React', 'TypeScript', 'Supabase'], status: 'LIVE', statusColor: C.green, link: 'nextone-opal.vercel.app', visual: 'network', accent: C.cyan },
  { id: 'airlock', idx: '02', title: 'Airlock', subtitle: 'IoT & NETWORK SECURITY', desc: 'ESP32 + Flask system that detects Wi-Fi deauth attacks and suspicious BLE activity in real time with ML.', tags: ['ESP32', 'Python', 'Flask', 'ML'], status: 'REPO', statusColor: C.cyan, link: 'github.com/milofrio066/Airlock', visual: 'radar', accent: C.green },
  { id: 'raiz', idx: '03', title: 'Raíz', subtitle: 'FINTECH · FINANCIAL INCLUSION', desc: 'A financial passport built from real economic activity, connecting informal workers with formal credit.', tags: ['JavaScript', 'Fintech', 'Data'], status: 'LIVE', statusColor: C.green, link: 'raiz-jet.vercel.app', visual: 'growth', accent: C.amber },
  { id: 'energy', idx: '04', title: 'Energy ML', subtitle: 'DATA SCIENCE · FORECASTING', desc: "End-to-end ML pipeline predicting hourly energy consumption in Colombia's non-interconnected zones.", tags: ['Python', 'Pandas', 'Scikit-learn'], status: 'R&D', statusColor: C.magenta, link: 'github.com/milofrio066', visual: 'wave', accent: C.violet },
];

/* ───────────────────────────── STACK ───────────────────────────── */
function stack() {
  const rows = [
    ['LANGUAGES', ['Python', 'JavaScript', 'TypeScript', 'HTML', 'CSS'], C.cyan],
    ['FRONT · BACK', ['React', 'Vite', 'Node.js', 'Flask', 'REST APIs'], C.violet],
    ['DATA · INFRA', ['PostgreSQL', 'Supabase', 'Vercel', 'Git', 'GitHub'], C.magenta],
    ['AI · DATA · IoT', ['Machine Learning', 'Pandas', 'Scikit-learn', 'ESP32', 'Network Security'], C.green],
    ['APPROACH', ['Full-Stack', 'Software Architecture', 'UI/UX', 'Data Analysis'], C.amber],
  ];
  const W = 1200, rowH = 58, top = 36, H = top + rows.length * rowH + 14;
  let els = '', mask = '', k = 0;
  rows.forEach(([label, items, color], i) => {
    const y = top + i * rowH;
    els += `<text class="mono" x="40" y="${y + 22}" font-size="13" fill="${color}" letter-spacing="1.5">${esc(label)}</text>
<line x1="190" x2="250" y1="${y + 17}" y2="${y + 17}" stroke="${color}" stroke-opacity=".4" stroke-dasharray="3 4"/><circle cx="254" cy="${y + 17}" r="3" fill="${color}"/>`;
    let x = 270;
    items.forEach((it) => {
      const w = it.length * 14 * CW + 32;
      els += `<rect x="${r2(x)}" y="${y}" width="${r2(w)}" height="34" rx="8" fill="${color}" fill-opacity=".06" stroke="${color}" stroke-opacity=".5" class="ch" style="animation-delay:${r2(k * 0.18)}s"/>
<text class="mono" x="${r2(x + 16)}" y="${y + 22}" font-size="14" fill="${C.text}">${esc(it)}</text>`;
      mask += `<rect x="${r2(x)}" y="${y}" width="${r2(w)}" height="34" rx="8" fill="#fff"/>`;
      x += w + 12;
      k++;
    });
  });
  const css = `@keyframes ch{0%,100%{stroke-opacity:.35}8%{stroke-opacity:1}20%{stroke-opacity:.35}}.ch{animation:ch 4.5s ease-in-out infinite}`;
  return svg(W, H, `<defs>${brandGrad('sg')}
<linearGradient id="shine" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset=".5" stop-color="#fff" stop-opacity=".22"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient>
<mask id="chipMask">${mask}</mask></defs>
<rect x="1" y="1" width="${W - 2}" height="${H - 2}" rx="14" fill="${C.panel}" stroke="url(#sg)" stroke-opacity=".5"/>
${els}
<g mask="url(#chipMask)"><rect y="0" width="220" height="${H}" fill="url(#shine)" transform="skewX(-20)"><animate attributeName="x" values="-300;1500" dur="4.5s" repeatCount="indefinite"/></rect></g>`, css);
}

/* ───────────────────────────── FOCUS ───────────────────────────── */
function focus() {
  const W = 1200, H = 214;
  const ms = [
    ['M-01', 'Developing nextONE & refining its UX', C.cyan],
    ['M-02', 'Strengthening full-stack engineering', C.violet],
    ['M-03', 'Exploring AI-powered apps & cybersecurity', C.magenta],
    ['M-04', 'Shipping projects with measurable impact', C.green],
  ];
  let els = '';
  ms.forEach(([code, title, color], i) => {
    const x = (i % 2) * 604, y = Math.floor(i / 2) * 110, w = 596, bw = w - 48;
    els += `<rect x="${x + 1}" y="${y + 1}" width="${w - 2}" height="98" rx="12" fill="${C.panel}" stroke="${C.line}" stroke-width="2"/>
<text class="mono" x="${x + 24}" y="${y + 34}" font-size="13" fill="${color}" letter-spacing="1.5">${code}</text>
<text x="${x + 84}" y="${y + 35}" font-size="18" font-weight="600" fill="${C.text}">${esc(title)}</text>
<circle cx="${x + w - 92}" cy="${y + 30}" r="4" fill="${C.green}" class="pulse" style="animation-delay:-${i * 0.6}s"/>
<text class="mono" x="${x + w - 82}" y="${y + 34}" font-size="11" fill="${C.green}">ACTIVE</text>
<clipPath id="fb${i}"><rect x="${x + 24}" y="${y + 62}" width="${bw}" height="8" rx="4"/></clipPath>
<rect x="${x + 24}" y="${y + 62}" width="${bw}" height="8" rx="4" fill="${C.line}"/>
<g clip-path="url(#fb${i})"><rect x="${x + 24}" y="${y + 62}" width="200" height="8" rx="4" fill="url(#fg${i})">
<animate attributeName="x" values="${x - 180};${x + 24 + bw}" dur="${r2(2.4 + i * 0.35)}s" begin="-${r2(i * 0.7)}s" repeatCount="indefinite"/></rect></g>
<linearGradient id="fg${i}" x1="0" x2="1"><stop offset="0" stop-color="${color}" stop-opacity="0"/><stop offset=".7" stop-color="${color}"/><stop offset="1" stop-color="#fff"/></linearGradient>`;
  });
  return svg(W, H, els);
}

/* ───────────────────────────── FOOTER ───────────────────────────── */
function footer() {
  const W = 1200, H = 220;
  const sine = (amp, period, yc) => {
    let d = '';
    for (let x = 0; x <= W + period; x += 6) d += `${x ? 'L' : 'M'}${x} ${r2(yc + amp * Math.sin((x / period) * 2 * Math.PI))}`;
    return d;
  };
  const waves = [[18, 300, 150, C.cyan, 6, 0.6], [12, 200, 156, C.violet, 4.5, 0.5], [8, 150, 162, C.magenta, 3.5, 0.45]]
    .map(([a, p, y, c, d, o], i) => `<path d="${sine(a, p, y)}" stroke="${c}" stroke-width="2" opacity="${o}"><animateTransform attributeName="transform" type="translate" from="${i % 2 ? -p : 0} 0" to="${i % 2 ? 0 : -p} 0" dur="${d}s" repeatCount="indefinite"/></path>`).join('');
  return svg(W, H, `<defs>
<linearGradient id="ftG" gradientUnits="userSpaceOnUse" x1="250" x2="950" spreadMethod="repeat"><stop offset="0" stop-color="${C.cyan}"/><stop offset=".5" stop-color="${C.magenta}"/><stop offset="1" stop-color="${C.cyan}"/>
<animateTransform attributeName="gradientTransform" type="translate" from="0 0" to="700 0" dur="6s" repeatCount="indefinite"/></linearGradient>
${brandGrad('fb')}${glow('fgl', 4)}
<linearGradient id="fade" x1="0" x2="1"><stop offset="0" stop-color="${C.bg}"/><stop offset=".15" stop-color="${C.bg}" stop-opacity="0"/><stop offset=".85" stop-color="${C.bg}" stop-opacity="0"/><stop offset="1" stop-color="${C.bg}"/></linearGradient>
<clipPath id="fc"><rect width="${W}" height="${H}" rx="18"/></clipPath></defs>
<g clip-path="url(#fc)">
<rect width="${W}" height="${H}" fill="${C.bg}"/>
${waves}
<rect width="${W}" height="${H}" fill="url(#fade)"/>
<text x="${W / 2}" y="80" font-size="34" font-weight="800" letter-spacing="2" text-anchor="middle" fill="url(#ftG)" filter="url(#fgl)">LET'S BUILD SOMETHING MEANINGFUL</text>
<text class="mono" x="${W / 2}" y="206" font-size="13" fill="${C.muted}" text-anchor="middle" letter-spacing="2">// END OF TRANSMISSION · MILOFRIO066 · PEREIRA, CO<tspan fill="${C.cyan}" class="blink"> █</tspan></text>
</g>
<rect x=".5" y=".5" width="${W - 1}" height="${H - 1}" rx="18" stroke="url(#fb)" stroke-opacity=".6"/>`);
}

/* ───────────────────────────── ESCRITURA ───────────────────────────── */
const files = {
  'hero.svg': hero(),
  'terminal.svg': terminal(),
  'stack.svg': stack(),
  'focus.svg': focus(),
  'footer.svg': footer(),
  'header-about.svg': header('01', 'ABOUT_ME', '[ whoami ]'),
  'header-projects.svg': header('02', 'FEATURED_PROJECTS', '[ ls ./projects ]'),
  'header-stack.svg': header('03', 'TECH_STACK', '[ cat stack.json ]'),
  'header-focus.svg': header('04', 'CURRENT_FOCUS', '[ ./missions --active ]'),
  'header-activity.svg': header('05', 'GITHUB_ACTIVITY', '[ git log --graph ]'),
};
for (const p of projects) files[`card-${p.id}.svg`] = card(p);
for (const [name, content] of Object.entries(files)) writeFileSync(join(out, name), content);

// Vista previa local que imita el contenedor del README de GitHub (modo oscuro).
const readme = readFileSync(join(root, 'README.md'), 'utf8');
writeFileSync(join(root, 'preview.html'), `<!doctype html><html lang="es"><head><meta charset="utf-8"><title>Vista previa · milofrio066</title>
<style>body{margin:0;background:#0d1117;color:#e6edf3;font-family:-apple-system,'Segoe UI',sans-serif}
.box{max-width:900px;margin:32px auto;border:1px solid #30363d;border-radius:8px;padding:32px}img{max-width:100%}a{color:#4493f8}p{margin:0 0 16px}</style></head>
<body><div class="box">${readme}</div></body></html>`);
console.log(`OK · ${Object.keys(files).length} SVG en assets/ + preview.html`);
