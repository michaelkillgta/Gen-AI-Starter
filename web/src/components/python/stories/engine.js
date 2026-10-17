/* eslint-disable */
// @ts-nocheck
/*
 * Story and game engine for the Python lessons. Pure CSS 3D + DOM, no libraries.
 *
 * story(el, spec): a 3D room with scenes the learner steps through.
 *   spec = { title, file, scenes: [{ title, body, code?, out?, set: { id: actor | null } }] }
 *   Actors carry over from scene to scene; `set` adds, changes or (null) removes them.
 *   Actor kinds (x: -250..250, y: -160..160 on the floor):
 *     box   { v, t, x, y, size?, gone?, glow? }    an object: value on the sides, type on top
 *     tag   { on: boxId | x, y, text?, alt? }       a name tag that floats above a box
 *     shelf { x, y, w, h?, label?, slots? }          a tray on the floor (list, dict, scope ...)
 *     link  { from, to, label?, dash? }              an arrow on the floor between two actors
 *     note  { on: id | x, y, text, z? }              a speech bubble that faces the camera
 *     scan  { on: id }                               the type() scanner beam
 *   spec.orphans: true dashes boxes that no tag points to (for reference lessons).
 *
 * game(el, spec): a conveyor with a scanner arch. Items arrive one at a time.
 *   spec = { title, show: 'cube' | 'card', choices, typeColors?, items: [{ show, t?, code, out, a, o?, why }] }
 */
import { esc, hlPy } from "../widgets";
import "./stories.css";

const reduced = () => window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
export const tcls = t => 't-' + String(t).toLowerCase().replace(/[^a-z0-9]+/g, '-');

const cubeHTML = (v, t) => `<div class="f top"><span>${esc(t)}</span></div>
  <div class="f s"><span>${esc(v)}</span></div><div class="f n"></div>
  <div class="f e"><span>${esc(v)}</span></div><div class="f w"></div>
  <div class="st-puff">freed</div>`;

/** Lets the learner drag the room to turn it. Returns a cleanup function. */
function orbit(scene, world, start){
  let rz = start, down = null;
  const set = () => world.style.setProperty('--rz', rz + 'deg');
  set();
  const move = e => { if (down === null) return; rz = Math.max(-75, Math.min(15, rz + (e.clientX - down) * 0.35)); down = e.clientX; set(); };
  const up = () => { down = null; scene.classList.remove('grab'); };
  const press = e => { down = e.clientX; scene.classList.add('grab'); try { scene.setPointerCapture(e.pointerId); } catch(_){} };
  scene.addEventListener('pointerdown', press);
  scene.addEventListener('pointermove', move);
  scene.addEventListener('pointerup', up);
  scene.addEventListener('pointercancel', up);
  return () => { scene.removeEventListener('pointerdown', press); scene.removeEventListener('pointermove', move); scene.removeEventListener('pointerup', up); scene.removeEventListener('pointercancel', up); };
}

/* ================= Story ================= */
export function story(el, spec){
  // Full actor state for every scene.
  const states = [];
  let cur = {};
  for (const sc of spec.scenes){
    cur = {...cur};
    for (const [id, a] of Object.entries(sc.set || {})){
      if (a === null) delete cur[id];
      else cur[id] = {...(cur[id] || {}), ...a};
    }
    states.push(cur);
  }
  const kinds = {};
  states.forEach(s => Object.entries(s).forEach(([id, a]) => { kinds[id] = kinds[id] || a.kind || 'box'; }));

  const nodeHTML = (id, kind) => {
    if (kind === 'box') return `<div class="st-slot" data-id="${id}"><div class="st-cube"></div></div>`;
    if (kind === 'tag') return `<div class="st-tag" data-id="${id}"><span></span></div>`;
    if (kind === 'shelf') return `<div class="st-shelf" data-id="${id}"><div class="st-cells"></div><b></b></div>`;
    if (kind === 'link') return `<div class="st-link" data-id="${id}"><b></b></div>`;
    if (kind === 'note') return `<div class="st-note" data-id="${id}"></div>`;
    if (kind === 'scan') return `<div class="st-scan" data-id="${id}"></div>`;
    return '';
  };
  // Shelves and links sit on the floor, so draw them first.
  const order = id => ({shelf: 0, link: 1, box: 2, scan: 3, tag: 4, note: 5})[kinds[id]] ?? 6;
  const ids = Object.keys(kinds).sort((a, b) => order(a) - order(b));

  let i = 0;
  el.innerHTML = `<div class="wg st">
    <div class="wg-h"><span class="eyebrow">Story · ${esc(spec.title)}</span><span class="mini st-hint">Drag the room to turn it</span></div>
    <div class="st-grid">
      <div class="st-scene" aria-hidden="true">
        <div class="st-world"><div class="st-floor"></div>${ids.map(id => nodeHTML(id, kinds[id])).join('')}</div>
      </div>
      <div class="st-side">
        <div class="eyebrow st-count"></div>
        <h3 class="st-title"></h3>
        <p class="st-body"></p>
        <div class="code st-code"><div class="chead"><span>${esc(spec.file || 'agent.py')}</span><span class="st-alive"></span></div><pre></pre></div>
        <p class="sr-only st-live" aria-live="polite"></p>
        <div class="st-nav">
          <button class="btn btn-ghost st-prev">← Back</button>
          <div class="st-dots">${spec.scenes.map((_, k) => `<button data-k="${k}" aria-label="Scene ${k + 1}"></button>`).join('')}</div>
          <button class="btn btn-ink st-next">Next →</button>
        </div>
      </div>
    </div>
  </div>`;
  const $ = s => el.querySelector(s), $$ = s => [...el.querySelectorAll(s)];
  const scene = $('.st-scene'), world = $('.st-world');
  if (spec.view && spec.view.tilt) world.style.setProperty('--tilt', spec.view.tilt + 'deg');
  const stopOrbit = orbit(scene, world, spec.view && spec.view.rz != null ? spec.view.rz : -32);
  const node = id => world.querySelector(`[data-id="${id}"]`);
  const pos = (st, a) => {
    if (a.on && st[a.on]) return {x: st[a.on].x || 0, y: st[a.on].y || 0, base: st[a.on].kind === 'shelf' ? 6 : (st[a.on].size || 64)};
    return {x: a.x || 0, y: a.y || 0, base: a.z || 0};
  };
  const lastBox = {};

  function draw(){
    const sc = spec.scenes[i], st = states[i], prev = i > 0 ? states[i - 1] : {};
    $('.st-count').textContent = `Scene ${i + 1} of ${spec.scenes.length}`;
    $('.st-title').textContent = sc.title;
    $('.st-body').innerHTML = sc.body;
    const lines = [];
    spec.scenes.slice(0, i + 1).forEach((s, k) => { if (s.code) s.code.split('\n').forEach(l => lines.push([l, k === i])); });
    $('.st-code pre').innerHTML = lines.length
      ? lines.map(([l, now]) => `<span class="${now ? 'hl' : ''}">${hlPy(l) || ' '}</span>`).join('\n') + (sc.out ? '\n' + sc.out.split('\n').map(o => `<span class="c"># ${esc(o)}</span>`).join('\n') : '')
      : `<span class="c"># ${esc(spec.empty || 'no code yet')}</span>`;
    { const pre = $('.st-code pre'), hls = pre.querySelectorAll('.hl'), last = hls[hls.length - 1];
      pre.scrollTop = last ? Math.max(0, last.offsetTop + last.offsetHeight - pre.clientHeight + 40) : 0; }
    const boxes = Object.entries(st).filter(([, a]) => (a.kind || 'box') === 'box');
    const live = boxes.filter(([, a]) => !a.gone).length, gone = boxes.length - live;
    $('.st-alive').textContent = spec.count === false || !boxes.length ? '' : `${live} object${live === 1 ? '' : 's'}${gone ? ` · ${gone} freed` : ''}`;
    $('.st-live').textContent = `${sc.title}. ${sc.code || ''}`;

    const held = new Set(Object.values(st).filter(a => a.kind === 'tag' && a.on).map(a => a.on));
    const lift = {};
    for (const id of ids){
      const n = node(id), a = st[id], kind = kinds[id];
      if (!a){ n.classList.add('off'); n.classList.remove('in', 'on'); continue; }
      n.classList.remove('off');
      if (kind === 'box'){
        const c = n.firstChild, size = a.size || 64;
        n.style.setProperty('--x', (a.x || 0) + 'px'); n.style.setProperty('--y', (a.y || 0) + 'px'); n.style.setProperty('--cube', size + 'px');
        const sig = `${a.v}|${a.t}`;
        if (lastBox[id] !== sig){ c.innerHTML = cubeHTML(a.v, a.t); c.className = 'st-cube ' + tcls(a.t); if (lastBox[id]) c.classList.add('changed'); lastBox[id] = sig; }
        c.classList.add('in');
        c.classList.toggle('gone', !!a.gone);
        c.classList.toggle('glow', !!a.glow);
        c.classList.toggle('loose', !!spec.orphans && !held.has(id) && !a.gone);
      } else if (kind === 'tag'){
        const p = pos(st, a), key = a.on || `${p.x},${p.y}`, k = lift[key] = (lift[key] || 0) + 1;
        n.style.setProperty('--x', p.x + 'px'); n.style.setProperty('--y', p.y + 'px');
        n.style.setProperty('--base', p.base + 'px'); n.style.setProperty('--lift', (k - 1) * 34 + 'px');
        n.firstChild.textContent = a.text || id;
        n.classList.toggle('alt', !!a.alt);
        n.classList.add('on');
        const pa = prev[id];
        n.classList.toggle('moved', !!pa && (pa.on !== a.on || pa.x !== a.x || pa.y !== a.y));
      } else if (kind === 'shelf'){
        const w = a.w || 200, h = a.h || 80;
        n.style.cssText = `--x:${a.x || 0}px;--y:${a.y || 0}px;--w:${w}px;--h:${h}px`;
        n.querySelector('.st-cells').innerHTML = a.slots ? Array.from({length: a.slots}, (_, k) => `<i>${a.labels ? esc(a.labels[k] ?? '') : k}</i>`).join('') : '';
        n.querySelector('b').textContent = a.label || '';
        n.classList.toggle('alt', !!a.alt);
        n.classList.add('on');
      } else if (kind === 'link'){
        const A = st[a.from], B = st[a.to];
        if (!A || !B){ n.classList.add('off'); continue; }
        const dx = (B.x || 0) - (A.x || 0), dy = (B.y || 0) - (A.y || 0), len = Math.hypot(dx, dy);
        const pad = (B.kind === 'shelf' ? 10 : (B.size || 64) / 2 + 10);
        n.style.cssText = `--x:${A.x || 0}px;--y:${A.y || 0}px;--len:${Math.max(0, len - pad)}px;--ang:${Math.atan2(dy, dx)}rad`;
        n.querySelector('b').textContent = a.label || '';
        n.classList.toggle('dash', !!a.dash);
        n.classList.add('on');
      } else if (kind === 'note'){
        const p = pos(st, a);
        n.style.setProperty('--x', p.x + 'px'); n.style.setProperty('--y', p.y + 'px'); n.style.setProperty('--z', (p.base + (a.z ?? 40)) + 'px');
        n.textContent = a.text || '';
        n.classList.toggle('bad', !!a.bad);
        n.classList.add('on');
      } else if (kind === 'scan'){
        const p = pos(st, a);
        n.style.setProperty('--x', p.x + 'px'); n.style.setProperty('--y', p.y + 'px'); n.style.setProperty('--cube', p.base + 'px');
        n.classList.add('on');
      }
    }
    $$('.st-dots button').forEach((d, k) => { d.classList.toggle('on', k === i); d.classList.toggle('seen', k < i); });
    $('.st-prev').disabled = i === 0;
    $('.st-next').textContent = i === spec.scenes.length - 1 ? 'Replay ↺' : 'Next →';
  }
  $('.st-next').onclick = () => { i = i === spec.scenes.length - 1 ? 0 : i + 1; draw(); };
  $('.st-prev').onclick = () => { if (i > 0){ i--; draw(); } };
  $$('.st-dots button').forEach(d => d.onclick = () => { i = +d.dataset.k; draw(); });
  if (reduced()) el.querySelector('.st').classList.add('still');
  draw();
  return stopOrbit;
}

/* ================= Game ================= */
export function game(el, spec){
  let i = 0, score = 0, streak = 0, best = 0, answered = false;
  const N = spec.items.length;
  const colorOf = c => spec.typeColors ? tcls(c) : '';
  el.innerHTML = `<div class="wg st">
    <div class="wg-h"><span class="eyebrow">Game · ${esc(spec.title)}</span><span class="mini st-score"></span></div>
    <div class="sg-scene" aria-hidden="true">
      <div class="sg-world">
        <div class="sg-belt"></div>
        <div class="sg-arch"><i></i></div>
        <div class="sg-item"></div>
      </div>
    </div>
    <div class="term-out sg-out"></div>
    <p class="sg-q"></p>
    <div class="sg-pick" role="group" aria-label="Pick an answer"></div>
    <div class="sg-fb" aria-live="polite"></div>
  </div>`;
  const $ = s => el.querySelector(s), $$ = s => [...el.querySelectorAll(s)];
  const item = $('.sg-item'), belt = $('.sg-belt'), arch = $('.sg-arch');
  const timers = [];
  const later = (fn, ms) => timers.push(setTimeout(fn, reduced() ? 0 : ms));
  const term = (code, out) => code.split('\n').map(l => `<span class="p">&gt;&gt;&gt;</span> ${hlPy(l)}`).join('\n') + '\n' + (out == null ? '<span class="p"># your call...</span>' : esc(out));
  const visual = (it, revealed) => (it.card || spec.show === 'card')
    ? `<div class="sg-card ${revealed ? 'rev' : ''}"><pre>${hlPy(it.show)}</pre></div>`
    : `<div class="st-cube in ${tcls(revealed ? (it.t || it.a) : '?')}">${cubeHTML(it.show, revealed ? (it.t || it.a) : '?')}</div>`;

  function scoreLine(){ $('.st-score').textContent = `Score ${score}/${N}${streak > 1 ? ` · streak ${streak}` : ''}`; }
  function load(){
    answered = false;
    const it = spec.items[i], opts = it.o || spec.choices;
    item.className = 'sg-item';
    item.innerHTML = visual(it, false);
    belt.classList.add('run'); item.classList.add('enter');
    later(() => { belt.classList.remove('run'); item.classList.remove('enter'); }, 700);
    $('.sg-out').innerHTML = term(it.code, null);
    $('.sg-q').textContent = it.q || spec.q || '';
    $('.sg-pick').innerHTML = opts.map(o => `<button class="chipb ${colorOf(o)}" data-o="${esc(o)}">${esc(o)}</button>`).join('');
    $$('.sg-pick button').forEach(b => b.onclick = () => answer(b.dataset.o));
    $('.sg-fb').innerHTML = `<span class="mini">Item ${i + 1} of ${N}</span>`;
    scoreLine();
  }
  function answer(pick){
    if (answered) return; answered = true;
    const it = spec.items[i], ok = pick === it.a;
    $$('.sg-pick button').forEach(b => { b.disabled = true; if (b.dataset.o === it.a) b.classList.add('good'); else if (b.dataset.o === pick) b.classList.add('bad'); });
    arch.classList.add('scan');
    later(() => {
      arch.classList.remove('scan');
      item.innerHTML = visual(it, true);
      item.classList.add(ok ? 'ok' : 'no');
      if (ok){ score++; streak++; best = Math.max(best, streak); } else streak = 0;
      $('.sg-out').innerHTML = term(it.code, it.out);
      const last = i === N - 1;
      $('.sg-fb').innerHTML = `<b class="${ok ? 'yes' : 'nope'}">${ok ? 'Correct.' : `Not quite. The answer is ${esc(it.a)}.`}</b> ${esc(it.why)} <button class="btn btn-ink sg-next">${last ? 'See your score →' : 'Next →'}</button>`;
      scoreLine();
      $('.sg-next').onclick = () => { if (last) end(); else { item.classList.add('leave'); later(() => { i++; load(); }, 450); } };
      $('.sg-next').focus({preventScroll: true});
    }, 650);
  }
  function end(){
    const e = spec.end || {};
    const msg = score === N ? (e.perfect || 'Perfect score.') : score >= Math.ceil(N * 0.7) ? (e.good || 'Strong. Replay the ones you missed.') : (e.low || 'Good start. Read the explanations, then play again.');
    item.className = 'sg-item'; item.innerHTML = '';
    $('.sg-out').innerHTML = `<span class="p"># finished</span>\nscore = ${score}  <span class="c"># out of ${N}, best streak ${best}</span>`;
    $('.sg-q').textContent = '';
    $('.sg-fb').innerHTML = `<b class="yes">${score}/${N}</b> ${esc(msg)} <button class="btn btn-ghost sg-again">Play again ↺</button>`;
    $$('.sg-pick button').forEach(b => b.disabled = true);
    $('.sg-again').onclick = () => { i = 0; score = 0; streak = 0; best = 0; load(); };
  }
  if (reduced()) el.querySelector('.st').classList.add('still');
  load();
  return () => timers.forEach(clearTimeout);
}
