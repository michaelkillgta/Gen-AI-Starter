/* eslint-disable */
// @ts-nocheck
/*
 * Lesson 1 (Variables, objects and type()): a 3D story and a type() mini-game.
 * Pure CSS 3D + DOM, no libraries. Loaded only when the lesson reaches these steps.
 */
import { esc, hlPy } from "../widgets";
import "./stories.css";

const reduced = () => window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
const tcls = t => 't-' + t.toLowerCase();

/** One object box. Faces: top shows the type, front and side show the value. */
const cube = (id, v, t) => `<div class="st-cube ${tcls(t)}" data-b="${id}">
  <div class="f top"><span>${esc(t)}</span></div>
  <div class="f s"><span>${esc(v)}</span></div><div class="f n"></div>
  <div class="f e"><span>${esc(v)}</span></div><div class="f w"></div>
  <div class="st-puff">freed</div>
</div>`;

/** Lets the learner drag the room to turn it. Returns a cleanup function. */
function orbit(scene, world, start){
  let rz = start, down = null;
  const set = () => world.style.setProperty('--rz', rz + 'deg');
  set();
  const move = e => { if (down === null) return; rz = Math.max(-75, Math.min(15, rz + (e.clientX - down) * 0.35)); down = e.clientX; set(); };
  const up = () => { down = null; scene.classList.remove('grab'); };
  const press = e => { down = e.clientX; scene.classList.add('grab'); scene.setPointerCapture?.(e.pointerId); };
  scene.addEventListener('pointerdown', press);
  scene.addEventListener('pointermove', move);
  scene.addEventListener('pointerup', up);
  scene.addEventListener('pointercancel', up);
  return () => { scene.removeEventListener('pointerdown', press); scene.removeEventListener('pointermove', move); scene.removeEventListener('pointerup', up); scene.removeEventListener('pointercancel', up); };
}

/* ================= The story ================= */
const BOXES = {
  b1: {v: '"gpt-4o"', t: 'str', x: -175, y: -35},
  b2: {v: '512', t: 'int', x: -25, y: 55},
  b3: {v: '"512"', t: 'str', x: 115, y: -70},
  b4: {v: 'None', t: 'NoneType', x: 150, y: 85},
};

const SCENES = [
  {code: null, title: 'Meet Asha', body: 'Asha is building her first AI agent. When her code runs, Python gives her a big warehouse. Every value she creates becomes an <b>object</b>: a box with a value inside and a type stamped on top.',
   boxes: [], tags: {}},
  {code: 'model = "gpt-4o"', title: 'Python makes the box first', body: 'Python reads the right side first and builds a <b>str</b> box. Then <code>=</code> ties a name tag, <code>model</code>, to that box. The name is only a tag. The box holds the value.',
   boxes: ['b1'], tags: {model: 'b1'}},
  {code: 'tokens = 512', title: 'A second box', body: 'A whole number gives an <b>int</b> box. The tag <code>tokens</code> now points to it. Look at the top of each box: the type belongs to the box, not to the tag.',
   boxes: ['b1', 'b2'], tags: {model: 'b1', tokens: 'b2'}},
  {code: 'limit = tokens', title: 'Two tags, one box', body: 'No new box appears. <code>=</code> ties a second tag to the <b>same</b> box. Python does not copy the 512. <code>tokens</code> and <code>limit</code> are two names for one object.',
   boxes: ['b1', 'b2'], tags: {model: 'b1', tokens: 'b2', limit: 'b2'}},
  {code: 'tokens = "512"', title: 'The tag moves, the box stays', body: 'A web form sends the number as text. Python builds a new <b>str</b> box, and the <code>tokens</code> tag jumps to it. The int box did not change into a string. Only the tag moved. This is <b>dynamic typing</b>.',
   boxes: ['b1', 'b2', 'b3'], tags: {model: 'b1', tokens: 'b3', limit: 'b2'}},
  {code: 'limit = None', title: 'No tags left', body: '<code>limit</code> moves to the <b>None</b> box. Now no tag holds the int 512. Nobody can reach it, so Python frees it and reuses the memory. You never delete objects yourself.',
   boxes: ['b1', 'b2', 'b3', 'b4'], gone: ['b2'], tags: {model: 'b1', tokens: 'b3', limit: 'b4'}},
  {code: 'print(type(tokens))', title: 'type() is your x-ray', body: '<code>type()</code> follows the tag and reads the stamp on the box. <code>tokens</code> holds a <b>str</b>, so <code>tokens + 1</code> would crash. When agent code breaks, check <code>type()</code> first.',
   boxes: ['b1', 'b2', 'b3', 'b4'], gone: ['b2'], tags: {model: 'b1', tokens: 'b3', limit: 'b4'}, scan: 'b3', out: "<class 'str'>"},
];

export function story(el){
  let i = 0;
  el.innerHTML = `<div class="wg st">
    <div class="wg-h"><span class="eyebrow">Story · The object warehouse</span><span class="mini st-hint">Drag the room to turn it</span></div>
    <div class="st-grid">
      <div class="st-scene" aria-hidden="true">
        <div class="st-world">
          <div class="st-floor"></div>
          ${Object.entries(BOXES).map(([id, b]) => `<div class="st-slot" style="--x:${b.x}px;--y:${b.y}px">${cube(id, b.v, b.t)}</div>`).join('')}
          <div class="st-scan" hidden></div>
          ${['model', 'tokens', 'limit'].map(n => `<div class="st-tag" data-t="${n}"><span>${n}</span></div>`).join('')}
          <div class="st-read" hidden></div>
        </div>
      </div>
      <div class="st-side">
        <div class="eyebrow st-count"></div>
        <h3 class="st-title"></h3>
        <p class="st-body"></p>
        <div class="code st-code"><div class="chead"><span>asha_agent.py</span><span class="st-alive"></span></div><pre></pre></div>
        <p class="sr-only st-live" aria-live="polite"></p>
        <div class="st-nav">
          <button class="btn btn-ghost st-prev">← Back</button>
          <div class="st-dots">${SCENES.map((_, k) => `<button data-k="${k}" aria-label="Scene ${k + 1}"></button>`).join('')}</div>
          <button class="btn btn-ink st-next">Next →</button>
        </div>
      </div>
    </div>
  </div>`;
  const $ = s => el.querySelector(s), $$ = s => [...el.querySelectorAll(s)];
  const scene = $('.st-scene'), world = $('.st-world');
  const stopOrbit = orbit(scene, world, -32);

  function draw(){
    const sc = SCENES[i], gone = new Set(sc.gone || []);
    $('.st-count').textContent = `Scene ${i + 1} of ${SCENES.length}`;
    $('.st-title').textContent = sc.title;
    $('.st-body').innerHTML = sc.body;
    const lines = SCENES.slice(1, i + 1).map(s => s.code);
    $('.st-code pre').innerHTML = lines.length
      ? lines.map((l, k) => `<span class="${k === lines.length - 1 ? 'hl' : ''}">${hlPy(l)}</span>`).join('\n') + (sc.out ? `\n<span class="c"># ${esc(sc.out)}</span>` : '')
      : '<span class="c"># Asha has not written any code yet</span>';
    const alive = sc.boxes.filter(b => !gone.has(b)).length;
    $('.st-alive').textContent = sc.boxes.length ? `${alive} object${alive === 1 ? '' : 's'}${gone.size ? ' · 1 freed' : ''}` : '';
    $('.st-live').textContent = `${sc.title}. ${sc.code || ''}`;

    // boxes drop in, freed boxes sink away
    for (const [id] of Object.entries(BOXES)){
      const c = $(`[data-b="${id}"]`);
      c.classList.toggle('in', sc.boxes.includes(id));
      c.classList.toggle('gone', gone.has(id));
      c.classList.toggle('held', Object.values(sc.tags).includes(id));
    }
    // tags float above their box; several tags on one box stack up
    const stack = {};
    for (const t of ['model', 'tokens', 'limit']){
      const tag = $(`[data-t="${t}"]`), b = sc.tags[t];
      if (!b){ tag.classList.remove('on'); continue; }
      const k = stack[b] = (stack[b] || 0) + 1;
      tag.style.setProperty('--x', BOXES[b].x + 'px'); tag.style.setProperty('--y', BOXES[b].y + 'px');
      tag.style.setProperty('--lift', (k - 1) * 34 + 'px');
      tag.classList.add('on');
      tag.classList.toggle('moved', i > 0 && SCENES[i - 1].tags[t] && SCENES[i - 1].tags[t] !== b);
    }
    const scan = $('.st-scan'), read = $('.st-read');
    scan.hidden = read.hidden = !sc.scan;
    if (sc.scan){
      for (const n of [scan, read]){ n.style.setProperty('--x', BOXES[sc.scan].x + 'px'); n.style.setProperty('--y', BOXES[sc.scan].y + 'px'); }
      read.textContent = sc.out;
    }
    $$('.st-dots button').forEach((d, k) => { d.classList.toggle('on', k === i); d.classList.toggle('seen', k < i); });
    $('.st-prev').disabled = i === 0;
    $('.st-next').textContent = i === SCENES.length - 1 ? 'Replay ↺' : 'Next →';
  }
  $('.st-next').onclick = () => { i = i === SCENES.length - 1 ? 0 : i + 1; draw(); };
  $('.st-prev').onclick = () => { if (i > 0){ i--; draw(); } };
  $$('.st-dots button').forEach(d => d.onclick = () => { i = +d.dataset.k; draw(); });
  if (reduced()) el.querySelector('.st').classList.add('still');
  draw();
  return stopOrbit;
}

/* ================= The type() scanner game ================= */
const ITEMS = [
  ['"gpt-4o"', 'str', 'Quotes make a str.'],
  ['0.7', 'float', 'A decimal point makes a float. This is a typical temperature value.'],
  ['512', 'int', 'A whole number with no quotes is an int.'],
  ['True', 'bool', 'True and False, with a capital letter and no quotes, are bool.'],
  ['None', 'NoneType', 'None is the only object of type NoneType. Tools return it when there is no result.'],
  ['"512"', 'str', 'It looks like a number, but the quotes make it a str. Tool outputs and form data often arrive like this.'],
  ['3.0', 'float', 'The .0 still makes it a float, even though the value is whole.'],
  ['"True"', 'str', 'Quotes again. This is text, not a bool. "False" in quotes is also a str.'],
];
const TYPES = ['str', 'int', 'float', 'bool', 'NoneType'];

export function typeScanner(el){
  let i = 0, score = 0, streak = 0, best = 0, answered = false;
  el.innerHTML = `<div class="wg st">
    <div class="wg-h"><span class="eyebrow">Game · The type() scanner</span><span class="mini st-score"></span></div>
    <div class="sg-scene" aria-hidden="true">
      <div class="sg-world">
        <div class="sg-belt"></div>
        <div class="sg-arch"><i></i></div>
        <div class="sg-item"></div>
      </div>
    </div>
    <div class="term-out sg-out"></div>
    <div class="sg-pick" role="group" aria-label="Pick the type">${TYPES.map(t => `<button class="chipb ${tcls(t)}" data-t="${t}">${t}</button>`).join('')}</div>
    <div class="sg-fb" aria-live="polite"></div>
  </div>`;
  const $ = s => el.querySelector(s), $$ = s => [...el.querySelectorAll(s)];
  const item = $('.sg-item'), belt = $('.sg-belt'), arch = $('.sg-arch');
  const timers = [];
  const later = (fn, ms) => timers.push(setTimeout(fn, reduced() ? 0 : ms));

  function score_(){ $('.st-score').textContent = `Score ${score}/${ITEMS.length}${streak > 1 ? ` · streak ${streak}` : ''}`; }
  function load(){
    answered = false;
    const [v, t] = ITEMS[i];
    item.className = 'sg-item';
    item.innerHTML = cube('g', v, '?');
    belt.classList.add('run'); item.classList.add('enter');
    later(() => { belt.classList.remove('run'); item.classList.remove('enter'); }, 700);
    $('.sg-out').innerHTML = `<span class="p">&gt;&gt;&gt;</span> x = ${hlPy(v)}\n<span class="p">&gt;&gt;&gt;</span> type(x)\n<span class="p"># your call...</span>`;
    $('.sg-fb').innerHTML = `<span class="mini">Box ${i + 1} of ${ITEMS.length}</span>`;
    $$('.sg-pick button').forEach(b => { b.disabled = false; b.classList.remove('good', 'bad'); });
    score_();
  }
  function answer(pick){
    if (answered) return; answered = true;
    const [v, t, why] = ITEMS[i], ok = pick === t;
    $$('.sg-pick button').forEach(b => { b.disabled = true; if (b.dataset.t === t) b.classList.add('good'); else if (b.dataset.t === pick) b.classList.add('bad'); });
    arch.classList.add('scan');
    later(() => {
      arch.classList.remove('scan');
      item.innerHTML = cube('g', v, t);
      item.classList.add(ok ? 'ok' : 'no');
      if (ok){ score++; streak++; best = Math.max(best, streak); } else streak = 0;
      $('.sg-out').innerHTML = `<span class="p">&gt;&gt;&gt;</span> x = ${hlPy(v)}\n<span class="p">&gt;&gt;&gt;</span> type(x)\n&lt;class '${t}'&gt;`;
      const last = i === ITEMS.length - 1;
      $('.sg-fb').innerHTML = `<b class="${ok ? 'yes' : 'nope'}">${ok ? 'Correct.' : `Not quite. It is ${t}.`}</b> ${esc(why)} <button class="btn btn-ink sg-next">${last ? 'See your score →' : 'Next box →'}</button>`;
      score_();
      $('.sg-next').onclick = () => { if (last) end(); else { item.classList.add('leave'); later(() => { i++; load(); }, 450); } };
      $('.sg-next').focus({preventScroll: true});
    }, 650);
  }
  function end(){
    const msg = score === ITEMS.length ? 'Perfect. You read types exactly like Python does.'
      : score >= 6 ? 'Strong. Check the ones with quotes again: quotes always mean str.'
      : 'Good start. Remember: quotes mean str, a decimal point means float, a capital True or False means bool.';
    item.className = 'sg-item'; item.innerHTML = '';
    $('.sg-out').innerHTML = `<span class="p"># scanner finished</span>\nscore = ${score}  <span class="c"># out of ${ITEMS.length}, best streak ${best}</span>`;
    $('.sg-fb').innerHTML = `<b class="yes">${score}/${ITEMS.length}</b> ${msg} <button class="btn btn-ghost sg-again">Play again ↺</button>`;
    $$('.sg-pick button').forEach(b => b.disabled = true);
    $('.sg-again').onclick = () => { i = 0; score = 0; streak = 0; best = 0; load(); };
  }
  $$('.sg-pick button').forEach(b => b.onclick = () => answer(b.dataset.t));
  if (reduced()) el.querySelector('.st').classList.add('still');
  load();
  return () => timers.forEach(clearTimeout);
}
