/* eslint-disable */
// @ts-nocheck
/*
 * Part I hands-on activities: a different mechanic per lesson (1-10).
 * Plain DOM + pointer events, no libraries. Loaded only when a lesson reaches its activity.
 */
import { esc, hlPy } from "../widgets";
import "./play.css";

const q = (s, r) => r.querySelector(s);
const qa = (s, r) => [...r.querySelectorAll(s)];
const reduced = () => window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;

function shell(el, title, intro, body){
  el.innerHTML = `<div class="wg pl"><div class="wg-h"><span class="eyebrow">Activity · ${esc(title)}</span><span class="mini pl-score"></span></div>
    <p class="pl-intro">${intro}</p>${body}</div>`;
  return q('.pl', el);
}
const pyRepr = v => v.t === 'str' ? strRepr(v.v) : v.t === 'float' ? floatRepr(v.v) : v.t === 'bool' ? (v.v ? 'True' : 'False') : v.t === 'NoneType' ? 'None' : String(v.v);
const floatRepr = x => Number.isInteger(x) ? x.toFixed(1) : String(+x.toPrecision(15));
const strRepr = s => "'" + String(s).replace(/\\/g, '\\\\').replace(/'/g, "\\'").replace(/\n/g, '\\n') + "'";
const shake = n => { n.classList.remove('pl-shake'); void n.offsetWidth; n.classList.add('pl-shake'); };

/**
 * Drag items onto targets with a pointer (mouse or touch), or tap an item then tap a target.
 * onDrop(item, target) returns true when the move is accepted.
 */
function dragDrop(root, itemSel, targetSel, onDrop){
  let drag = null, picked = null;
  const targetAt = (x, y) => { const t = document.elementFromPoint(x, y); return t && root.contains(t) ? t.closest(targetSel) : null; };
  const clearHover = () => qa('.pl-hover', root).forEach(t => t.classList.remove('pl-hover'));
  const down = e => {
    const it = e.target.closest(itemSel); if (!it || !root.contains(it) || it.classList.contains('pl-off')) return;
    e.preventDefault();
    const r = it.getBoundingClientRect();
    const ghost = it.cloneNode(true); ghost.classList.add('pl-ghost');
    ghost.style.cssText = `width:${r.width}px;left:${r.left}px;top:${r.top}px`;
    (root.closest('.pyc') || document.body).appendChild(ghost);
    drag = {it, ghost, dx: e.clientX - r.left, dy: e.clientY - r.top, x0: e.clientX, y0: e.clientY, moved: false};
    it.classList.add('pl-lift');
  };
  const move = e => {
    if (!drag) return;
    if (Math.abs(e.clientX - drag.x0) + Math.abs(e.clientY - drag.y0) > 6) drag.moved = true;
    drag.ghost.style.left = (e.clientX - drag.dx) + 'px'; drag.ghost.style.top = (e.clientY - drag.dy) + 'px';
    clearHover(); const t = targetAt(e.clientX, e.clientY); if (t) t.classList.add('pl-hover');
  };
  const up = e => {
    if (!drag) return;
    const {it, ghost, moved} = drag; drag = null; ghost.remove(); it.classList.remove('pl-lift'); clearHover();
    if (!moved){ // tap to pick, tap a target to drop
      qa('.pl-picked', root).forEach(n => n.classList.remove('pl-picked'));
      picked = picked === it ? null : it; if (picked) it.classList.add('pl-picked');
      return;
    }
    const t = targetAt(e.clientX, e.clientY);
    if (t) onDrop(it, t);
  };
  const tapTarget = e => {
    if (!picked) return; const t = e.target.closest(targetSel); if (!t || !root.contains(t)) return;
    const it = picked; picked = null; it.classList.remove('pl-picked'); onDrop(it, t);
  };
  root.addEventListener('pointerdown', down);
  window.addEventListener('pointermove', move);
  window.addEventListener('pointerup', up);
  root.addEventListener('click', tapTarget);
  return () => { root.removeEventListener('pointerdown', down); window.removeEventListener('pointermove', move); window.removeEventListener('pointerup', up); root.removeEventListener('click', tapTarget); qa('.pl-ghost', root.closest('.pyc') || document.body).forEach(g => g.remove()); };
}

/* ======================= 1 · Tag the box ======================= */
function lesson1(el){
  const STEPS = [
    {code: 'model = "gpt-4o"', tag: 'model', make: {v: '"gpt-4o"', t: 'str'}, why: 'Python builds the str box first, then ties the name to it.'},
    {code: 'tokens = 512', tag: 'tokens', make: {v: '512', t: 'int'}, why: 'A new int box, and the tag tokens goes on it.'},
    {code: 'limit = tokens', tag: 'limit', same: 'tokens', why: 'No new box. = copies the arrow, so limit points to the same box as tokens.'},
    {code: 'tokens = "512"', tag: 'tokens', make: {v: '"512"', t: 'str'}, why: 'A new str box. Only the tokens tag moves; limit stays on the int.'},
    {code: 'limit = None', tag: 'limit', make: {v: 'None', t: 'NoneType'}, why: 'limit moves to None. Nobody holds the int 512 now, so Python frees it.'},
  ];
  let i = 0, boxes = [], tags = {}, tries = 0, wrong = 0;
  const root = shell(el, 'Tag the box', 'Each line of code arrives below. Drag its name tag onto the box it should point to. Watch for lines that make a <b>new</b> box and lines that do not.',
    `<div class="pl-line"><span class="pl-k">Line</span><code class="pl-code"></code></div>
     <div class="pl-tray"><span class="pl-k">Name tag</span><div class="pl-tags"></div></div>
     <div class="pl-boxes"></div>
     <p class="pl-fb" aria-live="polite"></p>
     <div class="pl-types"></div>`);
  const draw = () => {
    const st = STEPS[i];
    q('.pl-code', root).innerHTML = st ? hlPy(st.code) : '<span class="c"># all lines done</span>';
    q('.pl-tags', root).innerHTML = st ? `<button class="pl-tag pl-item" data-tag="${st.tag}">${st.tag}</button>` : '';
    q('.pl-boxes', root).innerHTML = boxes.map(b => {
      const on = Object.entries(tags).filter(([, id]) => id === b.id).map(([n]) => n);
      return `<div class="pl-box pl-drop t-${b.t.toLowerCase()} ${b.isNew ? 'pl-new' : ''} ${on.length || b.isNew ? '' : 'pl-freed'}" data-id="${b.id}">
        <span class="pl-btype">${b.t}</span><span class="pl-bval">${esc(b.v)}</span>
        <span class="pl-on">${on.map(n => `<i>${n}</i>`).join('') || (b.isNew ? '<em>new</em>' : '<em>freed</em>')}</span></div>`;
    }).join('') || '<p class="mini">No boxes yet.</p>';
    q('.pl-types', root).innerHTML = Object.entries(tags).map(([n, id]) => `<code>type(${n})</code> → <b>${boxes.find(b => b.id === id).t}</b>`).join(' · ');
    q('.pl-score', root).textContent = `Line ${Math.min(i + 1, STEPS.length)} of ${STEPS.length}`;
  };
  const begin = () => {
    const st = STEPS[i]; if (!st) return;
    boxes.forEach(b => b.isNew = false);
    if (st.make) boxes.push({id: 'b' + i, v: st.make.v, t: st.make.t, isNew: true});
    draw();
  };
  const stop = dragDrop(root, '.pl-item', '.pl-drop', (it, target) => {
    const st = STEPS[i]; tries++;
    const want = st.make ? 'b' + i : tags[st.same];
    if (target.dataset.id !== want){
      wrong++; shake(target);
      q('.pl-fb', root).innerHTML = `<b class="pl-no">Not that one.</b> ${st.make ? 'This line builds a new box. Put the tag on the box marked <em>new</em>.' : `Look at where <code>${st.same}</code> points right now.`}`;
      return;
    }
    tags[st.tag] = want;
    q('.pl-fb', root).innerHTML = `<b class="pl-yes">Right.</b> ${st.why}`;
    i++;
    if (i < STEPS.length) setTimeout(begin, reduced() ? 0 : 700);
    else { boxes.forEach(b => b.isNew = false); draw(); q('.pl-fb', root).innerHTML += ` <b>Done in ${tries} drops${wrong ? `, ${wrong} wrong` : ', no mistakes'}.</b> <button class="btn btn-ghost pl-again">Play again ↺</button>`; q('.pl-again', root).onclick = () => { i = 0; boxes = []; tags = {}; tries = wrong = 0; q('.pl-fb', root).textContent = ''; begin(); }; }
  });
  begin();
  return stop;
}

/* ======================= 2 · Type bins ======================= */
function lesson2(el){
  const ITEMS = [
    ['"Paris"', 'str', 'Quotes make a str.'], ['42', 'int', 'Whole number, no quotes.'], ['0.7', 'float', 'Decimal point.'],
    ['True', 'bool', 'Capital T, no quotes.'], ['None', 'None', 'No value at all.'], ['"42"', 'str', 'Quotes win: text that looks like a number.'],
    ['3.0', 'float', 'Still a float: it has a point.'], ['"False"', 'str', 'In quotes, so text.'], ['-1', 'int', 'Negative whole numbers are int.'],
    ['1e3', 'float', 'Scientific notation is always float.'], ['""', 'str', 'An empty string is still a str.'], ['False', 'bool', 'A real bool.'],
  ];
  const BINS = ['str', 'int', 'float', 'bool', 'None'];
  let queue = [], placed = {}, ok = 0, bad = 0;
  const root = shell(el, 'Sort the reply', 'These values came back in an LLM reply. Drag each one into the bin for its type. Three at a time arrive on the tray.',
    `<div class="pl-tray pl-vals"></div><div class="pl-bins">${BINS.map(b => `<div class="pl-bin pl-drop t-${b === 'None' ? 'nonetype' : b}" data-bin="${b}"><b>${b === 'None' ? 'NoneType' : b}</b><div class="pl-in"></div></div>`).join('')}</div><p class="pl-fb" aria-live="polite"></p>`);
  const reset = () => { queue = ITEMS.map((x, k) => ({k, v: x[0], t: x[1], why: x[2]})).sort(() => Math.random() - .5); placed = {}; ok = bad = 0; draw(); q('.pl-fb', root).textContent = ''; };
  const draw = () => {
    q('.pl-vals', root).innerHTML = queue.slice(0, 3).map(x => `<button class="pl-chip pl-item" data-k="${x.k}">${esc(x.v)}</button>`).join('') || '<span class="mini">Tray empty.</span>';
    BINS.forEach(b => { q(`[data-bin="${b}"] .pl-in`, root).innerHTML = (placed[b] || []).map(v => `<span>${esc(v)}</span>`).join(''); });
    q('.pl-score', root).textContent = `${ok} right · ${bad} wrong · ${queue.length} left`;
  };
  const stop = dragDrop(root, '.pl-item', '.pl-drop', (it, bin) => {
    const x = queue.find(z => String(z.k) === it.dataset.k); if (!x) return;
    if (bin.dataset.bin !== x.t){ bad++; shake(bin); q('.pl-fb', root).innerHTML = `<b class="pl-no">${esc(x.v)} is not ${bin.dataset.bin}.</b> Hint: ${x.why}`; draw(); return; }
    ok++; (placed[x.t] = placed[x.t] || []).push(x.v); queue = queue.filter(z => z !== x);
    q('.pl-fb', root).innerHTML = `<b class="pl-yes">${esc(x.v)} → ${x.t === 'None' ? 'NoneType' : x.t}.</b> ${x.why}`;
    draw();
    if (!queue.length){ q('.pl-fb', root).innerHTML += ` <b>All sorted, ${bad ? bad + ' mistakes' : 'no mistakes'}.</b> <button class="btn btn-ghost pl-again">Play again ↺</button>`; q('.pl-again', root).onclick = reset; }
  });
  reset();
  return stop;
}

/* ======================= 3 · Chunk lab ======================= */
function lesson3(el){
  const GOALS = [
    ['Exactly 4 full chunks and no leftover', (t, s) => Math.floor(t / s) === 4 && t % s === 0],
    ['A leftover of exactly 100 tokens', (t, s) => t % s === 100],
    ['3 calls when rounded up, but only 2 full chunks', (t, s) => Math.floor(t / s) === 2 && t % s > 0],
    ['total / size gives exactly 2.5', (t, s) => t / s === 2.5],
  ];
  const root = shell(el, 'Chunk lab', 'Slide the document length and the chunk size. The bar splits into chunks live. Then hit each goal on the right.',
    `<div class="pl-cols"><div>
      <label class="pl-slider">Document: <b class="pl-t"></b> tokens<input type="range" min="100" max="3000" step="10" value="1250" class="pl-rt" aria-label="Document length in tokens"></label>
      <label class="pl-slider">Chunk size: <b class="pl-s"></b> tokens<input type="range" min="128" max="1024" step="32" value="512" class="pl-rs" aria-label="Chunk size in tokens"></label>
      <div class="pl-bar" aria-hidden="true"></div>
      <div class="term-out pl-calc"></div></div>
      <ul class="pl-goals"></ul></div>`);
  const t$ = q('.pl-rt', root), s$ = q('.pl-rs', root);
  const draw = () => {
    const t = +t$.value, s = +s$.value, full = Math.floor(t / s), rest = t % s, calls = Math.ceil(t / s);
    q('.pl-t', root).textContent = t; q('.pl-s', root).textContent = s;
    q('.pl-bar', root).innerHTML = Array.from({length: full}, () => `<i style="flex:${s}">${s}</i>`).join('') + (rest ? `<i class="pl-rest" style="flex:${rest}">${rest}</i>` : '');
    q('.pl-calc', root).innerHTML = `<span class="p">&gt;&gt;&gt;</span> ${t} / ${s}\n${floatRepr(t / s)}\n<span class="p">&gt;&gt;&gt;</span> ${t} // ${s}   <span class="c"># full chunks</span>\n${full}\n<span class="p">&gt;&gt;&gt;</span> ${t} % ${s}    <span class="c"># leftover tokens</span>\n${rest}\n<span class="p">&gt;&gt;&gt;</span> (${t} + ${s} - 1) // ${s}   <span class="c"># API calls</span>\n${calls}`;
    let done = 0;
    q('.pl-goals', root).innerHTML = GOALS.map(([txt, f]) => { const ok = f(t, s); done += ok; return `<li class="${ok ? 'pl-met' : ''}"><span>${ok ? '✓' : '○'}</span>${txt}</li>`; }).join('');
    q('.pl-score', root).textContent = `${done}/${GOALS.length} goals met right now`;
  };
  t$.oninput = s$.oninput = draw; draw();
}

/* ======================= 4 · Conversion pipeline ======================= */
function lesson4(el){
  const S = (v) => ({v, t: 'str'});
  const TASKS = [
    {from: S('42'), want: {v: 42, t: 'int'}, hint: 'One step is enough.'},
    {from: S('3.9'), want: {v: 3, t: 'int'}, hint: 'int() cannot read a decimal point. Go through float first.'},
    {from: S('False'), want: {v: false, t: 'bool'}, hint: 'bool("False") is True. Compare the text instead.'},
    {from: S(' Pune\n'), want: {v: 'pune', t: 'str'}, hint: 'Clean the spaces and the capital letter.'},
    {from: S('1e3'), want: {v: 1000, t: 'int'}, hint: 'Scientific notation needs float() before int().'},
  ];
  const err = (name, msg) => ({err: `${name}: ${msg}`});
  const OPS = {
    'strip()': x => x.t === 'str' ? S(x.v.trim()) : err('AttributeError', `'${x.t}' object has no attribute 'strip'`),
    'lower()': x => x.t === 'str' ? S(x.v.toLowerCase()) : err('AttributeError', `'${x.t}' object has no attribute 'lower'`),
    'int()': x => x.t === 'str' ? (/^\s*[+-]?\d+\s*$/.test(x.v) ? {v: parseInt(x.v, 10), t: 'int'} : err('ValueError', `invalid literal for int() with base 10: ${strRepr(x.v)}`)) : x.t === 'float' ? {v: Math.trunc(x.v), t: 'int'} : x.t === 'bool' ? {v: +x.v, t: 'int'} : {v: x.v, t: 'int'},
    'float()': x => x.t === 'str' ? (/^\s*[+-]?(\d+\.?\d*|\.\d+)(e[+-]?\d+)?\s*$/i.test(x.v) ? {v: parseFloat(x.v), t: 'float'} : err('ValueError', `could not convert string to float: ${strRepr(x.v)}`)) : {v: +x.v, t: 'float'},
    'bool()': x => ({v: x.t === 'str' ? x.v.length > 0 : !!x.v, t: 'bool'}),
    '== "true"': x => ({v: x.t === 'str' && x.v === 'true', t: 'bool'}),
    'str()': x => S(x.t === 'str' ? x.v : pyRepr(x)),
  };
  const show = x => x.t === 'str' ? strRepr(x.v) : pyRepr(x);
  let k = 0, pipe = [], solved = 0;
  const root = shell(el, 'Conversion pipeline', 'Messy text comes in on the left. Tap blocks to build a pipeline, then run it. Every step shows the value and its type.',
    `<div class="pl-task"></div><div class="pl-palette">${Object.keys(OPS).map(o => `<button class="chipb pl-op" data-op='${o}'>${esc(o)}</button>`).join('')}</div>
     <div class="pl-pipe" aria-label="Your pipeline"></div>
     <div class="pl-bar2"><button class="btn btn-ink pl-run">▶ Run pipeline</button><button class="btn btn-ghost pl-clear">Clear</button><button class="pl-link pl-hint">Hint</button></div>
     <div class="pl-trace" aria-live="polite"></div>`);
  const draw = () => {
    const t = TASKS[k];
    q('.pl-task', root).innerHTML = `<span class="pl-k">Task ${k + 1} of ${TASKS.length}</span> Turn <code>${esc(show(t.from))}</code> (str) into <code>${esc(show(t.want))}</code> (${t.want.t})`;
    q('.pl-pipe', root).innerHTML = `<span class="pl-in">${esc(show(t.from))}</span>` + pipe.map((o, n) => `<span class="pl-arrow">→</span><button class="pl-step" data-n="${n}" title="Remove">${esc(o)} ×</button>`).join('') + (pipe.length ? '' : '<span class="mini">tap blocks above</span>');
    qa('.pl-step', root).forEach(b => b.onclick = () => { pipe.splice(+b.dataset.n, 1); draw(); });
    q('.pl-score', root).textContent = `${solved} solved`;
  };
  qa('.pl-op', root).forEach(b => b.onclick = () => { if (pipe.length < 4){ pipe.push(b.dataset.op); draw(); } });
  q('.pl-clear', root).onclick = () => { pipe = []; q('.pl-trace', root).textContent = ''; draw(); };
  q('.pl-hint', root).onclick = () => { q('.pl-trace', root).innerHTML = `<p class="mini">${TASKS[k].hint}</p>`; };
  q('.pl-run', root).onclick = () => {
    const t = TASKS[k]; let x = t.from; const rows = [`<span class="p">start</span> ${esc(show(x))} <i>${x.t}</i>`];
    for (const o of pipe){ const r = OPS[o](x); if (r.err){ rows.push(`<span class="p">${esc(o)}</span> <b class="pl-no">${esc(r.err)}</b>`); x = null; break; } x = r; rows.push(`<span class="p">${esc(o)}</span> ${esc(show(x))} <i>${x.t}</i>`); }
    const good = x && x.t === t.want.t && x.v === t.want.v;
    q('.pl-trace', root).innerHTML = `<div class="term-out">${rows.join('\n')}</div><p class="pl-fb">${good ? `<b class="pl-yes">Solved.</b> <code>${pipe.map(o => o).join(' → ')}</code> ${k < TASKS.length - 1 ? '<button class="btn btn-ink pl-next">Next task →</button>' : '<b>All tasks done.</b>'}` : x ? `<b class="pl-no">Close.</b> You got <code>${esc(show(x))}</code> (${x.t}). ${t.hint}` : '<b class="pl-no">The pipeline broke.</b> Read the error, then change a block.'}</p>`;
    if (good){ solved++; draw(); const nx = q('.pl-next', root); if (nx) nx.onclick = () => { k++; pipe = []; q('.pl-trace', root).textContent = ''; draw(); }; }
  };
  draw();
}

/* ======================= 5 · The if gate ======================= */
function lesson5(el){
  const VALS = [['0', false], ['"hi"', true], ['[]', false], ['" "', true], ['None', false], ['[0]', true], ['0.0', false], ['{}', false], ['-1', true], ['"False"', true], ['""', false], ['{"a": 1}', true]];
  const PAIRS = [
    ['a = ["doc"]\nb = ["doc"]', '==', 'Same value, two separate lists.'],
    ['a = ["doc"]\nb = a', 'both', 'Two names, one list: equal and identical.'],
    ['x = None\ny = None', 'both', 'There is only one None object.'],
    ['a = 1\nb = True', '==', '1 == True, but they are different objects.'],
    ['a = "hi"\nb = "HI"', 'neither', 'Different text, so not equal.'],
  ];
  let round = 1, i = 0, ok = 0, items = [];
  const root = shell(el, 'The if gate', 'Round 1: each value walks up to an <code>if</code> gate. Does it get through (truthy) or get blocked (falsy)? Round 2: which comparison is True?',
    `<div class="pl-gate"><div class="pl-walker" aria-live="polite"></div><div class="pl-gatebar"></div></div><div class="pl-choice"></div><p class="pl-fb" aria-live="polite"></p>`);
  const next = () => {
    const fb = q('.pl-fb', root);
    if (round === 1 && i >= items.length){ round = 2; i = 0; fb.innerHTML += ' <b>Round 2!</b>'; }
    if (round === 2 && i >= PAIRS.length){
      q('.pl-walker', root).innerHTML = ''; q('.pl-choice', root).innerHTML = `<button class="btn btn-ghost pl-again">Play again ↺</button>`;
      fb.innerHTML = `<b>Finished: ${ok} of ${items.length + PAIRS.length} right.</b> Falsy is short: 0, 0.0, "", [], {}, None, False. Use == for values and is only for None.`;
      q('.pl-again', root).onclick = start; return;
    }
    q('.pl-walker', root).classList.remove('pl-pass', 'pl-block');
    if (round === 1){
      const [v] = items[i];
      q('.pl-walker', root).innerHTML = `<code class="pl-val">${esc(v)}</code><span class="mini">if ${esc(v)}: ...</span>`;
      q('.pl-choice', root).innerHTML = `<button class="btn btn-ghost pl-c" data-a="0">✋ Blocked (falsy)</button><button class="btn btn-ink pl-c" data-a="1">Through (truthy) →</button>`;
    } else {
      const [code] = PAIRS[i];
      q('.pl-walker', root).innerHTML = `<pre class="pl-pair">${hlPy(code)}</pre><span class="mini">Which is True: a == b, a is b?</span>`;
      q('.pl-choice', root).innerHTML = ['==', 'is', 'both', 'neither'].map(a => `<button class="chipb pl-c" data-a="${a}">${a === '==' ? 'only ==' : a === 'is' ? 'only is' : a}</button>`).join('');
    }
    qa('.pl-c', root).forEach(b => b.onclick = () => answer(b.dataset.a));
    q('.pl-score', root).textContent = `Round ${round} · ${ok} right`;
  };
  const answer = a => {
    const fb = q('.pl-fb', root), w = q('.pl-walker', root);
    if (round === 1){
      const [v, truthy] = items[i], good = (a === '1') === truthy; ok += good;
      w.classList.remove('pl-pass', 'pl-block'); void w.offsetWidth; w.classList.add(truthy ? 'pl-pass' : 'pl-block');
      fb.innerHTML = `${good ? '<b class="pl-yes">Right.</b>' : '<b class="pl-no">Not quite.</b>'} <code>bool(${esc(v)})</code> is <b>${truthy ? 'True' : 'False'}</b>.`;
    } else {
      const [, ans, why] = PAIRS[i], good = a === ans; ok += good;
      fb.innerHTML = `${good ? '<b class="pl-yes">Right.</b>' : `<b class="pl-no">It is ${ans === 'both' ? 'both' : ans === 'neither' ? 'neither' : 'only ' + ans}.</b>`} ${why}`;
    }
    i++; qa('.pl-c', root).forEach(b => b.disabled = true); setTimeout(next, reduced() ? 300 : 1100);
  };
  const start = () => { round = 1; i = 0; ok = 0; items = [...VALS].sort(() => Math.random() - .5).slice(0, 8); q('.pl-fb', root).textContent = ''; next(); };
  start();
}

/* ======================= 6 · Slice ruler ======================= */
function lesson6(el){
  const S = 'agentic AI';
  const GOALS = [['gent', 'the word "gent"'], ['AI', 'the last two characters'], ['agentic', 'the first word'], ['IA citnega', 'the whole string backwards'], ['aetcA', 'every second character, starting at the first']];
  let a = 0, b = S.length, step = 1, g = 0, solved = new Set();
  const root = shell(el, 'Slice ruler', `Drag the two handles (or use the buttons) to choose <code>start</code> and <code>stop</code>. Change the step. Make the slice match the target.`,
    `<div class="pl-goal"></div><div class="pl-ruler" aria-hidden="true"><div class="pl-cells"></div><div class="pl-h pl-ha" data-h="a">start</div><div class="pl-h pl-hb" data-h="b">stop</div></div>
     <div class="pl-ctrl"><span>start <button class="chipb" data-d="a-">−</button><button class="chipb" data-d="a+">+</button></span><span>stop <button class="chipb" data-d="b-">−</button><button class="chipb" data-d="b+">+</button></span>
     <span>step ${[1, 2, -1].map(s => `<button class="chipb pl-sstep" data-s="${s}">${s}</button>`).join('')}</span></div>
     <div class="term-out pl-expr"></div><p class="pl-fb" aria-live="polite"></p>`);
  const py = (s, start, stop, st) => { // Python slicing on a string
    const n = s.length; const norm = (x, def) => x == null ? def : x < 0 ? Math.max(x + n, st > 0 ? 0 : -1) : Math.min(x, st > 0 ? n : n - 1);
    let out = '', i = norm(start, st > 0 ? 0 : n - 1); const end = norm(stop, st > 0 ? n : -1);
    if (st > 0) for (; i < end; i += st) out += s[i]; else for (; i > end; i += st) out += s[i];
    return out;
  };
  const W = () => q('.pl-cells', root).getBoundingClientRect().width / S.length;
  const draw = () => {
    const cw = W();
    q('.pl-cells', root).innerHTML = S.split('').map((ch, k) => { const inSlice = step > 0 ? (k >= a && k < b && (k - a) % step === 0) : (k <= a && k > b); return `<span class="${inSlice ? 'pl-sel' : ''}"><b>${ch === ' ' ? '␣' : ch}</b><i>${k}</i><i>${k - S.length}</i></span>`; }).join('');
    q('.pl-ha', root).style.left = (a + (step < 0 ? 1 : 0)) * cw + 'px'; q('.pl-hb', root).style.left = (b + (step < 0 ? 1 : 0)) * cw + 'px';
    const stopNull = step < 0 && b === -1, res = py(S, a, stopNull ? null : b, step), [target, label] = GOALS[g];
    const expr = `s[${a}:${stopNull ? '' : b}${step !== 1 ? ':' + step : ''}]`;
    q('.pl-goal', root).innerHTML = `<span class="pl-k">Target ${g + 1} of ${GOALS.length}</span> Get ${label}: <code>${strRepr(target)}</code>`;
    q('.pl-expr', root).innerHTML = `<span class="p">&gt;&gt;&gt;</span> s = ${strRepr(S)}\n<span class="p">&gt;&gt;&gt;</span> ${expr}\n${strRepr(res)}`;
    qa('.pl-sstep', root).forEach(x => x.classList.toggle('on', +x.dataset.s === step));
    if (res === target && !solved.has(g)){
      solved.add(g); q('.pl-fb', root).innerHTML = `<b class="pl-yes">Got it!</b> <code>${expr}</code> ${g < GOALS.length - 1 ? '<button class="btn btn-ink pl-next">Next target →</button>' : '<b>All targets done.</b> Slices never change the string; they build a new one.'}`;
      const nx = q('.pl-next', root); if (nx) nx.onclick = () => { g++; q('.pl-fb', root).textContent = ''; draw(); };
    }
    q('.pl-score', root).textContent = `${solved.size}/${GOALS.length} targets`;
  };
  const clamp = () => { const lo = step > 0 ? 0 : -1, hi = step > 0 ? S.length : S.length - 1; a = Math.max(lo, Math.min(hi, a)); b = Math.max(lo, Math.min(hi, b)); };
  qa('[data-d]', root).forEach(x => x.onclick = () => { const [h, d] = [x.dataset.d[0], x.dataset.d[1]]; if (h === 'a') a += d === '+' ? 1 : -1; else b += d === '+' ? 1 : -1; clamp(); draw(); });
  qa('.pl-sstep', root).forEach(x => x.onclick = () => { step = +x.dataset.s; if (step < 0){ a = S.length - 1; b = -1; } else if (a > b){ a = 0; b = S.length; } clamp(); draw(); });
  let dragging = null;
  const down = e => { const h = e.target.closest('.pl-h'); if (!h) return; dragging = h.dataset.h; e.preventDefault(); };
  const move = e => { if (!dragging) return; const r = q('.pl-cells', root).getBoundingClientRect(); let k = Math.round((e.clientX - r.left) / W()) - (step < 0 ? 1 : 0); if (dragging === 'a') a = k; else b = k; clamp(); draw(); };
  const up = () => { dragging = null; };
  root.addEventListener('pointerdown', down); window.addEventListener('pointermove', move); window.addEventListener('pointerup', up);
  const ro = new ResizeObserver(draw); ro.observe(q('.pl-ruler', root));
  draw();
  return () => { root.removeEventListener('pointerdown', down); window.removeEventListener('pointermove', move); window.removeEventListener('pointerup', up); ro.disconnect(); };
}

/* ======================= 7 · Robot loop ======================= */
function lesson7(el){
  const LEVELS = [
    {doc: 3, hint: 'Use a for loop with exactly the right number of steps.', needBreak: false},
    {doc: 5, hint: 'Pick a big range, then add "if found: break" so it stops at the document.', needBreak: true, maxN: 9},
    {doc: null, hint: 'The document moves each run. Only a loop with break (and a guard) always works.', needBreak: true},
  ];
  const CELLS = 9;
  let lv = 0, loop = 'for', n = 3, brk = false, guard = true, running = false, timers = [], doc = 3;
  const root = shell(el, 'Robot loop', 'Program the robot to reach the document 📄 and stop there. Build the loop, press Run and watch each step.',
    `<div class="pl-level"></div><div class="pl-track" aria-hidden="true"></div>
     <div class="pl-cols"><div class="pl-prog">
       <div class="pl-row"><span class="pl-k">Loop</span><button class="chipb pl-lp" data-l="for">for step in range(N)</button><button class="chipb pl-lp" data-l="while">while True</button></div>
       <div class="pl-row pl-nrow"><span class="pl-k">N</span><button class="chipb" data-n="-">−</button><b class="pl-n"></b><button class="chipb" data-n="+">+</button></div>
       <label class="pl-row"><input type="checkbox" class="pl-brk"> <code>if found: break</code></label>
       <label class="pl-row pl-grow"><input type="checkbox" class="pl-guard" checked> guard: stop after 12 steps</label>
       <div class="pl-bar2"><button class="btn btn-ink pl-go">▶ Run</button></div></div>
       <div class="code pl-src"><div class="chead"><span>robot.py</span></div><pre></pre></div></div>
     <p class="pl-fb" aria-live="polite"></p>`);
  const src = () => loop === 'for'
    ? [`for step in range(${n}):`, `    move()`, ...(brk ? ['    if found():', '        break'] : [])]
    : [`steps = 0`, `while True:`, `    move()`, `    steps += 1`, ...(brk ? ['    if found():', '        break'] : []), ...(guard ? ['    if steps >= 12:', '        break   # guard'] : [])];
  const draw = (pos = 0, hl = -1) => {
    const L = LEVELS[lv];
    q('.pl-level', root).innerHTML = `<span class="pl-k">Level ${lv + 1} of ${LEVELS.length}</span> ${L.hint}`;
    q('.pl-track', root).innerHTML = Array.from({length: CELLS}, (_, k) => `<span class="${k === doc ? 'pl-doc' : ''}">${k === pos ? '🤖' : k === doc ? '📄' : ''}<i>${k}</i></span>`).join('') + '<span class="pl-wall">wall</span>';
    qa('.pl-lp', root).forEach(b => b.classList.toggle('on', b.dataset.l === loop));
    q('.pl-nrow', root).hidden = loop !== 'for'; q('.pl-grow', root).hidden = loop !== 'while';
    q('.pl-n', root).textContent = n; q('.pl-brk', root).checked = brk; q('.pl-guard', root).checked = guard;
    q('.pl-src pre', root).innerHTML = src().map((l, k) => `<span class="${k === hl ? 'hl' : ''}">${hlPy(l)}</span>`).join('\n');
    q('.pl-score', root).textContent = `Level ${lv + 1}`;
  };
  const run = () => {
    if (running) return; running = true; q('.pl-go', root).disabled = true;
    if (LEVELS[lv].doc == null) doc = 2 + Math.floor(Math.random() * 5);
    const frames = []; let pos = 0, steps = 0, outcome = '';
    const moveLine = loop === 'for' ? 1 : 2;
    while (true){
      if (loop === 'for' && steps >= n){ outcome = pos === doc ? 'ok' : pos < doc ? 'short' : 'over'; break; }
      pos++; steps++;
      if (pos >= CELLS){ frames.push([CELLS - 1, moveLine]); outcome = 'wall'; break; }
      frames.push([pos, moveLine]);
      if (brk && pos === doc){ frames.push([pos, src().indexOf('        break')]); outcome = 'ok'; break; }
      if (loop === 'while' && guard && steps >= 12){ outcome = pos === doc ? 'ok' : 'guard'; break; }
      if (steps > 40){ outcome = 'forever'; break; }
    }
    const MSG = {
      ok: '<b class="pl-yes">The robot stopped on the document.</b>',
      short: `<b class="pl-no">Stopped too early.</b> range(${n}) ran ${n} times, but the document is ${doc} steps away.`,
      over: `<b class="pl-no">Walked past it.</b> The loop kept going after the document. ${brk ? '' : 'Add "if found: break".'}`,
      wall: '<b class="pl-no">Crashed into the wall.</b> Nothing stopped the loop at the document.',
      guard: '<b class="pl-no">The guard stopped it.</b> Good safety net, but without "if found: break" it never stops at the document.',
      forever: '<b class="pl-no">This loop never ends.</b> while True needs a break or a guard. In an agent that means a huge bill.',
    };
    frames.forEach(([p, l], k) => timers.push(setTimeout(() => draw(p, l), reduced() ? 0 : 380 * (k + 1))));
    timers.push(setTimeout(() => {
      running = false; q('.pl-go', root).disabled = false;
      const L = LEVELS[lv];
      const pass = outcome === 'ok' && (!L.needBreak || brk);
      q('.pl-fb', root).innerHTML = MSG[outcome] + (outcome === 'ok' && L.needBreak && !brk ? ' It worked this time, but use break so it works for any distance.' : '') + (pass ? (lv < LEVELS.length - 1 ? ' <button class="btn btn-ink pl-next">Next level →</button>' : ' <b>All levels done.</b> A real agent loop is exactly this: a bounded loop that breaks when the job is done.') : '');
      const nx = q('.pl-next', root); if (nx) nx.onclick = () => { lv++; doc = LEVELS[lv].doc ?? 4; q('.pl-fb', root).textContent = ''; draw(); };
    }, reduced() ? 0 : 380 * (frames.length + 1)));
  };
  qa('.pl-lp', root).forEach(b => b.onclick = () => { loop = b.dataset.l; draw(); });
  qa('[data-n]', root).forEach(b => b.onclick = () => { n = Math.max(1, Math.min(LEVELS[lv].maxN || 12, n + (b.dataset.n === '+' ? 1 : -1))); draw(); });
  q('.pl-brk', root).onchange = e => { brk = e.target.checked; draw(); };
  q('.pl-guard', root).onchange = e => { guard = e.target.checked; draw(); };
  q('.pl-go', root).onclick = run;
  draw();
  return () => timers.forEach(clearTimeout);
}

/* ======================= 8 · Container sandbox ======================= */
function lesson8(el){
  const make = () => ({list: ['d1', 'd2'], tuple: ['d1', 'd2'], dict: [['d1', 0.9], ['d2', 0.7]], set: ['d1', 'd2']});
  let C = make(), tried = new Set();
  const OPS = [['add', 'Add "d3"'], ['dup', 'Add "d1" again'], ['change', 'Change the first item'], ['find', 'Is "d2" in it?']];
  const root = shell(el, 'Container sandbox', 'Same data, four containers. Try each action on each one and see what Python allows. Try all 16 to finish.',
    `<div class="pl-ops">${OPS.map(([k, t]) => `<button class="chipb pl-opb" data-op="${k}">${t}</button>`).join('')}</div>
     <div class="pl-cont"></div><div class="term-out pl-log"></div>
     <div class="pl-race"><button class="btn btn-ghost pl-racego">Race: find "d9999" in 10,000 items</button><div class="pl-lanes"><div><span>list</span><i class="pl-lane-l"></i><b class="pl-cl">0</b></div><div><span>set</span><i class="pl-lane-s"></i><b class="pl-cs">0</b></div></div></div>`);
  let op = 'add';
  const view = (k) => k === 'list' ? `[${C.list.map(x => `"${x}"`).join(', ')}]` : k === 'tuple' ? `(${C.tuple.map(x => `"${x}"`).join(', ')})` : k === 'dict' ? `{${C.dict.map(([a, b]) => `"${a}": ${b}`).join(', ')}}` : `{${C.set.map(x => `"${x}"`).join(', ')}}`;
  const draw = () => {
    q('.pl-cont', root).innerHTML = ['list', 'tuple', 'dict', 'set'].map(k => `<button class="pl-ct pl-${k}" data-k="${k}"><b>${k}</b><code>${esc(view(k))}</code><span class="mini">${['add', 'dup', 'change', 'find'].map(o => tried.has(k + o) ? '●' : '○').join('')}</span></button>`).join('');
    qa('.pl-opb', root).forEach(b => b.classList.toggle('on', b.dataset.op === op));
    qa('.pl-ct', root).forEach(b => b.onclick = () => act(b.dataset.k, b));
    q('.pl-score', root).textContent = `${tried.size}/16 tried`;
  };
  const act = (k, node) => {
    let code = '', res = '', bad = false;
    const r = {
      list: {add: () => { C.list.push('d3'); return ['docs.append("d3")', 'added at the end']; }, dup: () => { C.list.push('d1'); return ['docs.append("d1")', 'lists keep duplicates']; }, change: () => { C.list[0] = 'NEW'; return ['docs[0] = "NEW"', 'lists can change in place']; }, find: () => ['"d2" in docs', `True · checked items one by one`]},
      tuple: {add: () => { bad = true; return ['docs.append("d3")', "AttributeError: 'tuple' object has no attribute 'append'"]; }, dup: () => { bad = true; return ['docs.append("d1")', "AttributeError: tuples cannot grow"]; }, change: () => { bad = true; return ['docs[0] = "NEW"', "TypeError: 'tuple' object does not support item assignment"]; }, find: () => ['"d2" in docs', 'True · checked items one by one']},
      dict: {add: () => { if (!C.dict.find(x => x[0] === 'd3')) C.dict.push(['d3', 0.5]); return ['scores["d3"] = 0.5', 'new key added']; }, dup: () => { C.dict[0][1] = 0.1; return ['scores["d1"] = 0.1', 'keys are unique: the old value is replaced']; }, change: () => { C.dict[0][1] = 1.0; return ['scores["d1"] = 1.0', 'change a value by its key']; }, find: () => ['"d2" in scores', 'True · instant, jumps straight to the key']},
      set: {add: () => { if (!C.set.includes('d3')) C.set.push('d3'); return ['seen.add("d3")', 'added']; }, dup: () => ['seen.add("d1")', 'already there, nothing happens: sets keep one of each']},
    }[k];
    r.change = r.change || (() => { bad = true; return ['seen[0] = "NEW"', "TypeError: 'set' object is not subscriptable (no order, no positions)"]; });
    r.find = r.find || (() => ['"d2" in seen', 'True · instant, jumps straight to it']);
    [code, res] = r[op](); tried.add(k + op);
    q('.pl-log', root).innerHTML = `<span class="p">&gt;&gt;&gt;</span> ${hlPy(code)}   <span class="c"># on the ${k}</span>\n${bad ? `<span class="pl-no">${esc(res)}</span>` : esc(res)}`;
    draw(); if (bad) shake(q(`.pl-${k}`, root));
    if (tried.size === 16) q('.pl-log', root).innerHTML += `\n<span class="c"># all 16 done: list = ordered + growing, tuple = locked, dict = lookup by key, set = unique + fast "in"</span>`;
  };
  qa('.pl-opb', root).forEach(b => b.onclick = () => { op = b.dataset.op; draw(); });
  let raf = 0;
  q('.pl-racego', root).onclick = () => {
    cancelAnimationFrame(raf); const t0 = performance.now();
    const tick = t => { const p = Math.min(1, (t - t0) / 2200); q('.pl-lane-l', root).style.width = p * 100 + '%'; q('.pl-cl', root).textContent = Math.round(p * 10000).toLocaleString() + ' checks'; q('.pl-lane-s', root).style.width = '100%'; q('.pl-cs', root).textContent = '1 check'; if (p < 1) raf = requestAnimationFrame(tick); };
    raf = requestAnimationFrame(tick);
  };
  q('.pl-ops', root).insertAdjacentHTML('beforeend', '<button class="pl-link pl-reset">Reset data</button>');
  q('.pl-reset', root).onclick = () => { C = make(); draw(); };
  draw();
  return () => cancelAnimationFrame(raf);
}

/* ======================= 9 · Path finder tree ======================= */
function lesson9(el){
  const DATA = {id: 'chatcmpl-9x', choices: [{index: 0, message: {role: 'assistant', content: 'Paris is the capital.', tool_calls: [{function: {name: 'get_weather', arguments: '{"city": "Paris"}'}}]}, finish_reason: 'tool_calls'}], usage: {prompt_tokens: 42, completion_tokens: 18, total_tokens: 60}};
  const GOALS = [
    ['the reply text', '["choices"][0]["message"]["content"]'],
    ['the total tokens', '["usage"]["total_tokens"]'],
    ['the name of the tool the model wants', '["choices"][0]["message"]["tool_calls"][0]["function"]["name"]'],
    ['why the model stopped', '["choices"][0]["finish_reason"]'],
  ];
  let g = 0, done = new Set();
  const root = shell(el, 'Path finder', 'This is a real-shaped LLM reply. Click your way down the tree to the value you need. The Python path builds itself as you click.',
    `<div class="pl-goal"></div><div class="pl-cols"><div class="pl-tree" role="tree"></div><div><div class="term-out pl-path"></div><p class="pl-fb" aria-live="polite"></p></div></div>`);
  const typeOf = v => v === null ? 'None' : Array.isArray(v) ? 'list' : typeof v === 'object' ? 'dict' : typeof v === 'string' ? 'str' : Number.isInteger(v) ? 'int' : 'float';
  const label = v => typeof v === 'string' ? strRepr(v.length > 30 ? v.slice(0, 29) + '…' : v) : typeof v === 'object' ? (Array.isArray(v) ? `[${v.length} item${v.length === 1 ? '' : 's'}]` : `{${Object.keys(v).length} keys}`) : String(v);
  const tree = (v, path) => {
    if (typeof v !== 'object' || v === null) return '';
    const entries = Array.isArray(v) ? v.map((x, k) => [k, x]) : Object.entries(v);
    return `<ul>${entries.map(([k, x]) => { const p = path + (Array.isArray(v) ? `[${k}]` : `["${k}"]`); return `<li><button class="pl-node" data-p='${p}'><span class="pl-key">${Array.isArray(v) ? `[${k}]` : `"${k}"`}</span> <span class="pl-tv t-${typeOf(x).toLowerCase()}">${typeOf(x)}</span> <span class="pl-lv">${esc(label(x))}</span></button>${tree(x, p)}</li>`; }).join('')}</ul>`;
  };
  q('.pl-tree', root).innerHTML = `<button class="pl-node" data-p=""><span class="pl-key">resp</span> <span class="pl-tv t-dict">dict</span></button>` + tree(DATA, '');
  const get = p => { let v = DATA; const re = /\[(\d+|"[^"]*")\]/g; let m; while ((m = re.exec(p))){ const k = m[1][0] === '"' ? m[1].slice(1, -1) : +m[1]; v = v[k]; } return v; };
  const drawGoal = () => { q('.pl-goal', root).innerHTML = `<span class="pl-k">Goal ${g + 1} of ${GOALS.length}</span> Find ${GOALS[g][0]}`; q('.pl-score', root).textContent = `${done.size}/${GOALS.length} found`; };
  q('.pl-tree', root).addEventListener('click', e => {
    const n = e.target.closest('.pl-node'); if (!n) return;
    qa('.pl-node.on', root).forEach(x => x.classList.remove('on')); n.classList.add('on');
    const p = n.dataset.p, v = get(p), steps = (p.match(/\[/g) || []).length;
    q('.pl-path', root).innerHTML = `<span class="p">&gt;&gt;&gt;</span> resp${esc(p)}\n${esc(typeof v === 'object' ? JSON.stringify(v).slice(0, 80) + (JSON.stringify(v).length > 80 ? '…' : '') : typeof v === 'string' ? strRepr(v) : String(v))}\n<span class="c"># ${steps} step${steps === 1 ? '' : 's'}, type ${typeOf(v)}</span>`;
    const fb = q('.pl-fb', root);
    if (p === GOALS[g][1]){
      done.add(g); fb.innerHTML = `<b class="pl-yes">Found it.</b> Each bracket opened one level: dict keys use "quotes", list positions use numbers. ${g < GOALS.length - 1 ? '<button class="btn btn-ink pl-next">Next goal →</button>' : '<b>All goals found.</b>'}`;
      const nx = q('.pl-next', root); if (nx) nx.onclick = () => { g++; fb.textContent = ''; drawGoal(); };
    } else if (GOALS[g][1].startsWith(p)) fb.innerHTML = '<span class="mini">On the right track. Keep going down.</span>';
    else fb.innerHTML = '<span class="mini">That is not on the way. Go back up and try another branch.</span>';
    drawGoal();
  });
  drawGoal();
}

/* ======================= 10 · Copy lab ======================= */
function lesson10(el){
  const METHODS = [['=', 'other = history'], ['[:]', 'other = history[:]'], ['deep', 'other = copy.deepcopy(history)']];
  const ACTIONS = [['append', 'other.append({"content": "bye"})'], ['inner', 'other[0]["content"] = "CHANGED"']];
  const sees = (m, a) => m === '=' ? true : m === '[:]' ? a === 'inner' : false;
  let m = '=', a = 'append', done = new Set(), ok = 0, phase = 'predict';
  const root = shell(el, 'Copy lab', 'Pick how <code>other</code> is made and what you change through it. Predict whether <code>history</code> changes too, then check the wires.',
    `<div class="pl-row"><span class="pl-k">1 · Make other</span>${METHODS.map(([k, c]) => `<button class="chipb pl-m" data-m="${k}">${esc(c)}</button>`).join('')}</div>
     <div class="pl-row"><span class="pl-k">2 · Change it</span>${ACTIONS.map(([k, c]) => `<button class="chipb pl-a" data-a="${k}">${esc(c)}</button>`).join('')}</div>
     <div class="pl-row"><span class="pl-k">3 · Does history change?</span><button class="btn btn-ghost pl-p" data-p="1">Yes</button><button class="btn btn-ghost pl-p" data-p="0">No</button></div>
     <div class="pl-wires" aria-live="polite"></div><p class="pl-fb" aria-live="polite"></p>`);
  const diagram = (show) => {
    const outerShared = m === '=', innerShared = m !== 'deep';
    const changedInner = show && a === 'inner', appended = show && a === 'append';
    const histItems = [`<span class="pl-d ${innerShared ? 'pl-shared' : ''}">{"content": ${changedInner && innerShared ? '"CHANGED"' : '"hi"'}}</span>`, ...(appended && outerShared ? ['<span class="pl-d pl-shared">{"content": "bye"}</span>'] : [])];
    const otherItems = [`<span class="pl-d ${innerShared ? 'pl-shared' : ''}">{"content": ${changedInner ? '"CHANGED"' : '"hi"'}}</span>`, ...(appended ? ['<span class="pl-d">{"content": "bye"}</span>'] : [])];
    return `<div class="pl-wrow"><code class="pl-name">history</code><span class="pl-w">→</span><span class="pl-list ${outerShared ? 'pl-shared' : ''}">list #1 [ ${histItems.join(' ')} ]</span></div>
      <div class="pl-wrow"><code class="pl-name">other</code><span class="pl-w">→</span><span class="pl-list ${outerShared ? 'pl-shared' : ''}">${outerShared ? 'list #1 (same list!)' : `list #2 [ ${otherItems.join(' ')} ]`}</span></div>
      <p class="mini">Highlighted = shared between both names.${m === '[:]' ? ' [:] makes a new outer list, but the dicts inside are still shared.' : ''}</p>`;
  };
  const draw = () => {
    qa('.pl-m', root).forEach(b => b.classList.toggle('on', b.dataset.m === m));
    qa('.pl-a', root).forEach(b => b.classList.toggle('on', b.dataset.a === a));
    q('.pl-wires', root).innerHTML = diagram(phase === 'shown');
    q('.pl-score', root).textContent = `${done.size}/6 combos · ${ok} predicted right`;
  };
  qa('.pl-m', root).forEach(b => b.onclick = () => { m = b.dataset.m; phase = 'predict'; q('.pl-fb', root).textContent = ''; draw(); });
  qa('.pl-a', root).forEach(b => b.onclick = () => { a = b.dataset.a; phase = 'predict'; q('.pl-fb', root).textContent = ''; draw(); });
  qa('.pl-p', root).forEach(b => b.onclick = () => {
    const truth = sees(m, a), good = (b.dataset.p === '1') === truth, key = m + a;
    if (!done.has(key)){ done.add(key); ok += good; }
    phase = 'shown'; draw();
    q('.pl-fb', root).innerHTML = `${good ? '<b class="pl-yes">Right.</b>' : '<b class="pl-no">Not this time.</b>'} history ${truth ? '<b>does</b>' : 'does <b>not</b>'} change. ${
      m === '=' ? '= copies the arrow, not the list: one list, two names.' : m === '[:]' ? (a === 'append' ? 'The outer list is new, so appending only touches other.' : 'The outer list is new, but both lists hold the same dict, so the change shows in both.') : 'deepcopy copied the dicts too: nothing is shared.'}${done.size === 6 ? ` <b>All 6 combos done.</b>` : ''}`;
  });
  draw();
}

const ALL = {1: lesson1, 2: lesson2, 3: lesson3, 4: lesson4, 5: lesson5, 6: lesson6, 7: lesson7, 8: lesson8, 9: lesson9, 10: lesson10};
export const TITLES = {1: 'Tag the box', 2: 'Sort the reply', 3: 'Chunk lab', 4: 'Conversion pipeline', 5: 'The if gate', 6: 'Slice ruler', 7: 'Robot loop', 8: 'Container sandbox', 9: 'Path finder', 10: 'Copy lab'};
export const mountPlay = (n, el) => ALL[n](el);
