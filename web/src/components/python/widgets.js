/* eslint-disable */
// @ts-nocheck
/* Code highlighting helpers and the interactive lab widgets (W.<name>) used by lesson steps. */
/* ============ helpers ============ */
const esc = s => String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
const KW = new Set('False None True and as assert async await break class continue def del elif else except finally for from global if import in is lambda nonlocal not or pass raise return try while with yield'.split(' '));
const BI = new Set('print len type int float str bool list dict set tuple range enumerate zip sorted any all min max sum map filter iter next isinstance super open input id repr help'.split(' '));
function hlPy(src){
  const re = /(#[^\n]*)|([rbfRBF]{0,2}"""[\s\S]*?"""|[rbfRBF]{0,2}'''[\s\S]*?'''|[rbfRBF]{0,2}"(?:\\.|[^"\\\n])*"|[rbfRBF]{0,2}'(?:\\.|[^'\\\n])*')|(@[A-Za-z_][\w.]*)|(\b\d[\d_]*(?:\.\d+)?(?:e[+-]?\d+)?\b)|([A-Za-z_]\w*)/g;
  let out = '', last = 0, m;
  while ((m = re.exec(src))){
    out += esc(src.slice(last, m.index));
    if (m[1]) out += '<span class="c">'+esc(m[1])+'</span>';
    else if (m[2]) out += '<span class="s">'+esc(m[2])+'</span>';
    else if (m[3]) out += '<span class="dec">'+esc(m[3])+'</span>';
    else if (m[4]) out += '<span class="nm">'+esc(m[4])+'</span>';
    else if (m[5]) out += KW.has(m[5]) ? '<span class="k">'+m[5]+'</span>' : BI.has(m[5]) ? '<span class="f">'+m[5]+'</span>' : m[5];
    last = re.lastIndex;
  }
  return out + esc(src.slice(last));
}
const H = html => { const t = document.createElement('template'); t.innerHTML = html.trim(); return t.content.firstElementChild; };
const $ = (sel, root=document) => root.querySelector(sel);
const $$ = (sel, root=document) => [...root.querySelectorAll(sel)];
const codeLines = (src) => src.split('\n').map((l,i)=>`<span class="ln" data-l="${i+1}">${hlPy(l)||' '}</span>`).join('');
const pyRepr = v => {
  if (v === null || v === undefined) return 'None';
  if (v === true) return 'True'; if (v === false) return 'False';
  if (typeof v === 'string') return "'" + v.replace(/\\/g,'\\\\').replace(/'/g,"\\'") + "'";
  if (typeof v === 'number') return Number.isInteger(v) && !Object.is(v,-0) ? String(v) : String(v);
  if (Array.isArray(v)) return '[' + v.map(pyRepr).join(', ') + ']';
  if (typeof v === 'object') return '{' + Object.entries(v).map(([k,x]) => pyRepr(k)+': '+pyRepr(x)).join(', ') + '}';
  return String(v);
};
const pyFloat = x => (Number.isFinite(x) ? (Number.isInteger(x) ? x.toFixed(1) : String(+x.toPrecision(15))) : (Number.isNaN(x)?'nan':(x>0?'inf':'-inf')));
const sleep = ms => new Promise(r => setTimeout(r, ms));
const reduced = () => window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
const W = {};
const frame = (title, inner) => `<div class="wg"><div class="wg-h"><span class="eyebrow">Interactive · ${title}</span></div>${inner}</div>`;

/* ---- lesson stories and games: loaded only when a lesson reaches them ---- */
const lazyWidget = (load, name, n) => el => {
  let dispose = null, dead = false;
  el.innerHTML = '<div class="wg"><p class="mini">Loading...</p></div>';
  load().then(m => { if (!dead) dispose = m[name](n, el); }, () => { if (!dead) el.innerHTML = '<div class="note">This part could not load. Check your connection and open the step again.</div>'; });
  return () => { dead = true; if (typeof dispose === 'function') dispose(); };
};
// Each part's stories and games live in one file under stories/.
const STORY_PARTS = [
  [10, () => import('./stories/part1.js')],
  [19, () => import('./stories/part2.js')],
  [27, () => import('./stories/part3.js')],
  [31, () => import('./stories/part4.js')],
  [38, () => import('./stories/part5.js')],
];
const partFile = n => STORY_PARTS.find(([last]) => n <= last)[1];
// Hands-on activities: a different mechanic per lesson.
for (let n = 1; n <= 10; n++) W['play_' + n] = lazyWidget(() => import('./stories/play1.js'), 'mountPlay', n);
for (let n = 1; n <= 38; n++){
  W['story_' + n] = lazyWidget(partFile(n), 'mountStory', n);
  W['game_' + n] = lazyWidget(partFile(n), 'mountGame', n);
}

/* ---- ch1: names and objects ---- */
W.refs = el => {
  const STEPS = [
    ['x = 10', s => s.bind('x', s.obj(10,'int'))],
    ['y = x', s => s.bind('y', s.names.x)],
    ['x = "Hello"', s => s.bind('x', s.obj('"Hello"','str'))],
    ['x = 3.14', s => s.bind('x', s.obj('3.14','float'))],
    ['y = None', s => s.bind('y', s.obj('None','NoneType'))],
  ];
  let i = 0, st;
  const reset = () => { st = {names:{}, objs:[], n:0, obj(v,t){ const o={id:++this.n,v,t}; this.objs.push(o); return o.id; }, bind(nm,id){ this.names[nm]=id; }}; i = 0; };
  reset();
  el.innerHTML = frame('names point to objects', `
    <div class="row" id="rf-btns"></div>
    <div class="refs" id="rf-stage"><svg id="rf-svg"></svg><div class="names" id="rf-names"></div><div class="objs" id="rf-objs"></div></div>
    <div class="term-out" id="rf-out"></div>`);
  const btns = $('#rf-btns', el), out = $('#rf-out', el);
  function draw(){
    btns.innerHTML = STEPS.map((s,k)=>`<button class="chipb ${k<i?'on':''}" data-k="${k}" ${k!==i?'disabled style="opacity:'+(k<i?1:.45)+'"':''}>${esc(s[0])}</button>`).join('') + `<button class="chipb" id="rf-reset">Reset</button>`;
    const used = new Set(Object.values(st.names));
    $('#rf-names', el).innerHTML = Object.keys(st.names).map(n=>`<span class="ntag" data-n="${n}">${n}</span>`).join('') || '<span class="mini" style="align-self:flex-end">no names yet</span>';
    $('#rf-objs', el).innerHTML = st.objs.map(o=>`<div class="obj ${used.has(o.id)?'':'orphan'}" data-o="${o.id}"><span class="v">${esc(o.v)}</span><span class="ty">${o.t}</span></div>`).join('') || '<span class="mini">objects appear here</span>';
    const lines = Object.entries(st.names).map(([n,id])=>`<span class="p">&gt;&gt;&gt;</span> type(${n})\n&lt;class '${st.objs.find(o=>o.id===id).t}'&gt;`);
    const orphans = st.objs.filter(o=>!used.has(o.id)).length;
    out.innerHTML = (lines.join('\n') || '<span class="p"># click x = 10 to start</span>') + (orphans?`\n<span class="p"># ${orphans} object(s) with no name: Python can free them</span>`:'');
    $$('button[data-k]', btns).forEach(b => b.onclick = () => { STEPS[+b.dataset.k][1](st); i++; draw(); });
    $('#rf-reset', btns).onclick = () => { reset(); draw(); };
    requestAnimationFrame(lines2);
  }
  function lines2(){
    const stage = $('#rf-stage', el), svg = $('#rf-svg', el); if (!stage) return;
    const r0 = stage.getBoundingClientRect();
    svg.innerHTML = `<defs><marker id="rfa" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0L10 5L0 10z" fill="var(--amber)"/></marker></defs>` +
      Object.entries(st.names).map(([n,id])=>{
        const a = $(`[data-n="${n}"]`, el).getBoundingClientRect(), b = $(`[data-o="${id}"]`, el).getBoundingClientRect();
        const x1=a.right-r0.left, y1=a.top+a.height/2-r0.top, x2=b.left-r0.left-4, y2=b.top+b.height/2-r0.top;
        const mx=(x1+x2)/2;
        return `<path d="M${x1} ${y1} C${mx} ${y1} ${mx} ${y2} ${x2} ${y2}" fill="none" stroke="var(--amber)" stroke-width="2" marker-end="url(#rfa)"/>`;
      }).join('');
  }
  draw();
  const ro = new ResizeObserver(()=>lines2()); ro.observe(el);
  return () => ro.disconnect();
};

/* ---- ch2: type sorter ---- */
W.types = el => {
  const items = [['42','int'],['3.14','float'],['"42"','str'],['True','bool'],['None','NoneType'],['""','str'],['0.0','float'],['-7','int'],['"None"','str'],['False','bool'],['1e3','float'],['"True"','str']];
  let k = 0, score = 0, answered = false;
  const types = ['int','float','str','bool','NoneType'];
  el.innerHTML = frame('name the type', `<div class="col">
    <div class="row" style="justify-content:space-between"><span class="mini" id="ty-n"></span><span class="mini" id="ty-s"></span></div>
    <div style="font-family:var(--f-mono);font-size:30px;font-weight:700;text-align:center;padding:16px;background:var(--paper);border:1px solid var(--line);border-radius:12px" id="ty-v"></div>
    <div class="row" id="ty-b" style="justify-content:center"></div>
    <div class="term-out" id="ty-o"></div></div>`);
  function show(){
    const [v] = items[k]; answered = false;
    $('#ty-n', el).textContent = `Value ${k+1} of ${items.length}`; $('#ty-s', el).textContent = `Score ${score}`;
    $('#ty-v', el).textContent = v;
    $('#ty-b', el).innerHTML = types.map(t=>`<button class="chipb" data-t="${t}">${t}</button>`).join('');
    $('#ty-o', el).innerHTML = `<span class="p">&gt;&gt;&gt;</span> type(${esc(v)})`;
    $$('#ty-b button', el).forEach(b => b.onclick = () => pick(b));
  }
  function pick(b){
    if (answered) return; answered = true;
    const [v,t] = items[k], ok = b.dataset.t === t; if (ok) score++;
    $$('#ty-b button', el).forEach(x => { if (x.dataset.t===t) x.classList.add('good'); else if (x===b) x.classList.add('bad'); });
    $('#ty-o', el).innerHTML = `<span class="p">&gt;&gt;&gt;</span> type(${esc(v)})\n&lt;class '${t}'&gt;  <span class="${ok?'ok':'e'}">${ok?'correct':'not quite'}</span>`;
    $('#ty-s', el).textContent = `Score ${score}`;
    const nx = H(`<button class="chipb on">${k<items.length-1?'Next value →':'Start again'}</button>`);
    nx.onclick = () => { if (k<items.length-1) k++; else { k=0; score=0; } show(); };
    $('#ty-b', el).append(nx);
  }
  show();
};

/* ---- ch3: operators ---- */
W.ops = el => {
  el.innerHTML = frame('operator calculator', `<div class="col">
    <div class="row"><label class="lbl">a<input class="inp" id="op-a" type="number" value="1250" step="1" style="width:110px"></label><label class="lbl">b<input class="inp" id="op-b" type="number" value="4" step="1" style="width:110px"></label>
    <span class="row" style="margin-left:auto">${[[1250,4],[128,6],[-7,2],[2,10],[9,0]].map(p=>`<button class="chipb" data-p="${p}">${p[0]}, ${p[1]}</button>`).join('')}</span></div>
    <div class="tablewrap"><table class="cmp" id="op-t"></table></div></div>`);
  const fmt = v => typeof v === 'bigint' ? v.toString() : v;
  function calc(){
    const a = parseInt($('#op-a', el).value||'0',10), b = parseInt($('#op-b', el).value||'0',10);
    const zero = '<span style="color:var(--bad)">ZeroDivisionError</span>';
    let pow; try { pow = (b>=0 && b<=300) ? (BigInt(a)**BigInt(b)).toString() : pyFloat(Math.pow(a,b)); if (pow.length>40) pow = pow.slice(0,18)+'…('+pow.length+' digits)'; } catch(e){ pow='…'; }
    const rows = [
      ['a / b', b===0?zero:pyFloat(a/b), 'true division, always float'],
      ['a // b', b===0?zero:Math.floor(a/b), 'floor division, rounds down'],
      ['a % b', b===0?zero:(a - b*Math.floor(a/b)), 'remainder (sign follows b)'],
      ['a ** b', pow, 'power'],
      ['a == b', a===b?'True':'False', 'equal?'],
      ['a > b', a>b?'True':'False', 'greater?'],
      ['a > 10 and b > 10', (a>10&&b>10)?'True':'False', 'both must be true'],
      ['a > 10 or b > 10', (a>10||b>10)?'True':'False', 'one is enough'],
      ['not a == b', a!==b?'True':'False', 'flip the result'],
    ];
    $('#op-t', el).innerHTML = `<tr><th>Expression</th><th>Result</th><th>Why</th></tr>` + rows.map(r=>`<tr><td><code>${r[0]}</code></td><td style="font-family:var(--f-mono);font-weight:700">${fmt(r[1])}</td><td class="mini">${r[2]}</td></tr>`).join('');
  }
  $$('input', el).forEach(i => i.oninput = calc);
  $$('[data-p]', el).forEach(b => b.onclick = () => { const [x,y]=b.dataset.p.split(','); $('#op-a', el).value=x; $('#op-b', el).value=y; calc(); });
  calc();
};

/* ---- ch4: conversion ---- */
W.convert = el => {
  el.innerHTML = frame('what does each conversion give?', `<div class="col">
    <label class="lbl">text = input()  # you type:<input class="inp" id="cv-i" value="42" style="max-width:320px" autocomplete="off"></label>
    <div class="row">${['42',' 7 ','3.5','-12','abc','','False','0','1e3','1_000'].map(p=>`<button class="chipb" data-p="${esc(p)}">${p===''?'(empty)':esc(JSON.stringify(p))}</button>`).join('')}</div>
    <div class="term-out" id="cv-o"></div></div>`);
  function run(){
    const s = $('#cv-i', el).value, r = pyRepr(s);
    const isInt = /^\s*[+-]?\d+(?:_\d+)*\s*$/.test(s);
    const isFloat = /^\s*[+-]?(?:(?:\d+(?:_\d+)*)?\.\d+(?:_\d+)*|\d+(?:_\d+)*\.?)(?:[eE][+-]?\d+)?\s*$/.test(s) || /^\s*[+-]?(inf|infinity|nan)\s*$/i.test(s);
    const err = fn => `<span class="e">ValueError: invalid literal for ${fn}: ${esc(r)}</span>`;
    const iv = isInt ? String(parseInt(s.replace(/_/g,''),10)) : err("int() with base 10");
    const fv = isFloat ? pyFloat(parseFloat(s.replace(/_/g,''))) : `<span class="e">ValueError: could not convert string to float: ${esc(r)}</span>`;
    $('#cv-o', el).innerHTML =
      `<span class="p">&gt;&gt;&gt;</span> text\n${esc(r)}\n`+
      `<span class="p">&gt;&gt;&gt;</span> int(text)\n${iv}\n`+
      `<span class="p">&gt;&gt;&gt;</span> float(text)\n${fv}\n`+
      `<span class="p">&gt;&gt;&gt;</span> bool(text)\n${s.length?'True':'False'}  <span class="p"># ${s.length?'any non-empty text is True':'only empty text is False'}</span>\n`+
      `<span class="p">&gt;&gt;&gt;</span> str(text) == text\nTrue`;
  }
  $('#cv-i', el).oninput = run;
  $$('[data-p]', el).forEach(b => b.onclick = () => { $('#cv-i', el).value = b.dataset.p; run(); });
  run();
};

/* ---- ch5: truthy ---- */
W.truthy = el => {
  const vals = [['0',false],['1',true],['""',false],['"hi"',true],['" "',true],['[]',false],['[0]',true],['{}',false],['None',false],['False',false],['0.0',false],['"False"',true]];
  el.innerHTML = frame('if value:', `<div class="col">
    <div class="row" id="tf-b">${vals.map((v,i)=>`<button class="chipb" data-i="${i}">${esc(v[0])}</button>`).join('')}</div>
    <div class="codebox" id="tf-c"></div>
    <div class="term-out" id="tf-o"><span class="p"># pick a value above</span></div>
    <hr style="border:0;border-top:1px solid var(--line);margin:6px 0">
    <div class="codebox">${codeLines('a = [1, 2]\nb = a\nc = [1, 2]')}</div>
    <div class="row">${['a == b','a is b','a == c','a is c'].map(e=>`<button class="chipb" data-e="${e}">${e}</button>`).join('')}</div>
    <div class="term-out" id="tf-o2"><span class="p"># compare: b is the same list as a; c is a new list</span></div></div>`);
  $$('[data-i]', el).forEach(b => b.onclick = () => {
    $$('[data-i]', el).forEach(x=>x.classList.remove('on')); b.classList.add('on');
    const [v,t] = vals[+b.dataset.i];
    $('#tf-c', el).innerHTML = codeLines(`value = ${v}\nif value:\n    print("runs")\nelse:\n    print("skipped")`);
    $$('#tf-c .ln', el).forEach(l => { const n=+l.dataset.l; if ((t && n===3) || (!t && n===5)) l.classList.add('on'); if ((t && n>=4) || (!t && n===3)) l.classList.add('skip'); });
    $('#tf-o', el).innerHTML = `${t?'runs':'skipped'}\n<span class="p">&gt;&gt;&gt;</span> bool(${esc(v)})\n${t?'True':'False'}`;
  });
  const res = {'a == b':['True','same object, same value'],'a is b':['True','b = a gives the same object'],'a == c':['True','equal values'],'a is c':['False','c is a different object with an equal value']};
  $$('[data-e]', el).forEach(b => b.onclick = () => { const [r,why]=res[b.dataset.e]; $('#tf-o2', el).innerHTML = `<span class="p">&gt;&gt;&gt;</span> ${b.dataset.e}\n${r}  <span class="p"># ${why}</span>`; });
};

/* ---- ch6: slicing ---- */
W.slice = el => {
  el.innerHTML = frame('s[start:stop:step]', `<div class="col">
    <div class="row"><label class="lbl" style="flex:1;min-width:200px">s =<input class="inp" id="sl-s" value="Hello, RAG!" maxlength="24"></label>
    <label class="lbl">start<input class="inp" id="sl-a" placeholder="none" style="width:72px"></label>
    <label class="lbl">stop<input class="inp" id="sl-b" placeholder="none" style="width:72px"></label>
    <label class="lbl">step<input class="inp" id="sl-c" placeholder="none" style="width:72px"></label></div>
    <div class="row">${[['0','5',''],['7','',''],['-4','',''],['','','-1'],['','','2'],['-1','-6','-1']].map(p=>`<button class="chipb" data-p="${p.join('|')}">s[${p[0]}:${p[1]}${p[2]?':'+p[2]:''}]</button>`).join('')}</div>
    <div class="ruler" id="sl-r"></div>
    <div class="term-out" id="sl-o"></div>
    <p class="mini" style="margin:0">Top numbers: positive index. Bottom numbers: negative index. Small amber numbers: the order Python picks characters.</p></div>`);
  const num = id => { const v = $(id, el).value.trim(); if (v==='' || v==='-') return null; const n = parseInt(v,10); return Number.isNaN(n)?null:n; };
  function run(){
    const s = $('#sl-s', el).value, L = s.length; let a = num('#sl-a'), b = num('#sl-b'), c = num('#sl-c');
    const label = `s[${a??''}:${b??''}${c!==null?':'+c:''}]`;
    let picked = [], err = null;
    if (c === 0) err = 'ValueError: slice step cannot be zero';
    else {
      const step = c ?? 1, lower = step>0?0:-1, upper = step>0?L:L-1;
      const adj = (v, dflt) => { if (v===null) return dflt; if (v<0){ v+=L; if (v<lower) v=lower; } else if (v>upper) v=upper; return v; };
      const start = adj(a, step<0?upper:lower), stop = adj(b, step<0?lower:upper);
      for (let i=start; step>0? i<stop : i>stop; i+=step) picked.push(i);
    }
    $('#sl-r', el).innerHTML = [...s].map((ch,i)=>{ const o = picked.indexOf(i); return `<div class="cell ${o>=0?'sel':''}"><span class="ord">${o>=0?o+1:''}</span><span class="ip">${i}</span><span class="ch2">${esc(ch)}</span><span class="in">${i-L}</span></div>`; }).join('');
    $('#sl-o', el).innerHTML = `<span class="p">&gt;&gt;&gt;</span> ${esc(label)}\n` + (err?`<span class="e">${err}</span>`:esc(pyRepr(picked.map(i=>s[i]).join(''))));
  }
  $$('input', el).forEach(i => i.oninput = run);
  $$('[data-p]', el).forEach(b => b.onclick = () => { const [x,y,z]=b.dataset.p.split('|'); $('#sl-a', el).value=x; $('#sl-b', el).value=y; $('#sl-c', el).value=z; run(); });
  $('#sl-a', el).value='0'; $('#sl-b', el).value='5'; run();
};

/* ---- ch7: loop stepper ---- */
W.loop = el => {
  const src = (tools) => `tools = ${pyRepr(tools)}
for tool in tools:
    if tool == "skip_me":
        continue
    if tool == "stop":
        break
    print("Running", tool)
else:
    print("All tools ran")
print("Done")`;
  let withStop = true, trace = [], pos = -1, timer = null;
  el.innerHTML = frame('step through the loop', `<div class="col">
    <div class="row"><button class="btn btn-ink" id="lp-step">Step</button><button class="btn btn-ghost" id="lp-play">Play</button><button class="btn btn-ghost" id="lp-reset">Reset</button>
    <label class="row mini" style="margin-left:auto;gap:6px"><input type="checkbox" id="lp-stop" checked> include "stop" in tools</label></div>
    <div class="split"><div class="codebox" id="lp-c"></div><div class="col"><div class="vars" id="lp-v"></div><div class="term-out" id="lp-o" style="flex:1"></div><div class="mini" id="lp-why"></div></div></div></div>`);
  function build(){
    const tools = withStop ? ['search','skip_me','calculator','stop','weather'] : ['search','skip_me','calculator','weather'];
    trace = [{l:1, v:{}, why:'Create the list.'}]; let out = [], broke = false;
    for (const t of tools){
      trace.push({l:2, v:{tool:t}, why:`Take the next item: tool = "${t}".`});
      trace.push({l:3, v:{tool:t}, why:t==='skip_me'?'The condition is True.':'The condition is False.'});
      if (t==='skip_me'){ trace.push({l:4, v:{tool:t}, why:'continue: skip the rest of the block. Go to the next item.'}); continue; }
      trace.push({l:5, v:{tool:t}, why:t==='stop'?'The condition is True.':'The condition is False.'});
      if (t==='stop'){ trace.push({l:6, v:{tool:t}, why:'break: leave the loop now. The else block is skipped.'}); broke = true; break; }
      out = out.concat([`Running ${t}`]); trace.push({l:7, v:{tool:t}, out:[...out], why:'Print a line.'});
    }
    if (!broke){ trace.push({l:2, v:{tool:tools.at(-1)}, why:'No more items. The loop ends normally.'}); out = out.concat(['All tools ran']); trace.push({l:9, v:{tool:tools.at(-1)}, out:[...out], why:'No break happened, so the else block runs.'}); }
    out = out.concat(['Done']); trace.push({l:10, v:{tool:withStop?'stop':tools.at(-1)}, out:[...out], why:'The first line after the loop.'});
    let last = []; trace.forEach(t => { if (t.out) last = t.out; else t.out = last; });
    $('#lp-c', el).innerHTML = codeLines(src(tools)); pos = -1; render();
  }
  function render(){
    $$('#lp-c .ln', el).forEach(l => l.classList.toggle('on', pos>=0 && +l.dataset.l === trace[pos].l));
    const t = pos>=0 ? trace[pos] : null;
    $('#lp-v', el).innerHTML = t && t.v.tool ? `<span class="var">tool = <b>"${t.v.tool}"</b></span>` : '<span class="var mini">no variables yet</span>';
    $('#lp-o', el).innerHTML = t && t.out.length ? esc(t.out.join('\n')) : '<span class="p"># output</span>';
    $('#lp-why', el).textContent = t ? `Step ${pos+1}/${trace.length}: ${t.why}` : 'Press Step to run line 1.';
    $('#lp-step', el).disabled = pos >= trace.length-1;
  }
  const stopPlay = () => { clearInterval(timer); timer = null; $('#lp-play', el).textContent = 'Play'; };
  $('#lp-step', el).onclick = () => { if (pos < trace.length-1){ pos++; render(); } };
  $('#lp-play', el).onclick = () => { if (timer) return stopPlay(); if (pos>=trace.length-1) pos=-1; $('#lp-play', el).textContent='Pause'; timer = setInterval(()=>{ if (pos>=trace.length-1) return stopPlay(); pos++; render(); }, 650); };
  $('#lp-reset', el).onclick = () => { stopPlay(); pos=-1; render(); };
  $('#lp-stop', el).onchange = e => { stopPlay(); withStop = e.target.checked; build(); };
  build();
  return () => stopPlay();
};

/* ---- ch8: list vs set ---- */
W.bigo = el => {
  el.innerHTML = frame('list search vs set lookup', `<div class="col">
    <div class="split">
      <div><div class="mini" style="margin-bottom:6px"><code>"doc_x" in docs_list</code> checks one by one</div><div class="boxes" id="bo-l"></div><div class="mini" id="bo-lc" style="margin-top:6px">0 checks</div></div>
      <div><div class="mini" style="margin-bottom:6px"><code>"doc_x" in docs_set</code> uses hash("doc_x")</div><div class="boxes" id="bo-s"></div><div class="mini" id="bo-sc" style="margin-top:6px">0 checks</div></div>
    </div>
    <div class="row"><button class="btn btn-ink" id="bo-go">Search</button><span class="mini">The target is placed at a random position.</span></div>
    <hr style="border:0;border-top:1px solid var(--line);margin:6px 0">
    <label class="lbl">Number of documents: <b id="bo-nv" style="font-size:14px;color:var(--ink)"></b><input type="range" id="bo-n" min="1" max="6" step="0.01" value="3"></label>
    <div class="bar-row"><span>list (worst)</span><div class="bar"><i id="bo-b1" style="width:100%"></i></div><span class="mono" id="bo-t1"></span></div>
    <div class="bar-row"><span>set (average)</span><div class="bar b"><i id="bo-b2"></i></div><span class="mono" id="bo-t2"></span></div></div>`);
  const N = 48; $('#bo-l', el).innerHTML = $('#bo-s', el).innerHTML = Array.from({length:N},()=>'<span></span>').join('');
  let busy = false;
  $('#bo-go', el).onclick = async () => {
    if (busy) return; busy = true;
    const target = 10 + Math.floor(Math.random()*(N-10));
    const lb = $$('#bo-l span', el), sb = $$('#bo-s span', el);
    [...lb,...sb].forEach(b=>b.className='');
    const bucket = (target*7)%N;
    sb[bucket].className = 'scan'; await sleep(reduced()?0:220); sb[bucket].className = 'hit'; $('#bo-sc', el).textContent = '1 check (jump to the hash bucket)';
    for (let i=0;i<=target;i++){ lb[i].className = i===target?'hit':'scan'; $('#bo-lc', el).textContent = `${i+1} checks`; if (!reduced()) await sleep(45); }
    busy = false;
  };
  const upd = () => {
    const n = Math.round(10 ** +$('#bo-n', el).value);
    $('#bo-nv', el).textContent = n.toLocaleString('en-IN');
    $('#bo-t1', el).textContent = n.toLocaleString('en-IN') + ' checks';
    $('#bo-t2', el).textContent = '1 check';
    $('#bo-b2', el).style.width = Math.max(100/n, 0.6) + '%';
  };
  $('#bo-n', el).oninput = upd; upd();
};
/* ---- ch9: JSON explorer ---- */
W.json = el => {
  const resp = {id:'chatcmpl-9x2', model:'gpt-4o-mini', choices:[{index:0, finish_reason:'tool_calls', message:{role:'assistant', content:'Let me check the weather.', tool_calls:[{id:'call_1', type:'function', function:{name:'get_weather', arguments:'{"city": "Hyderabad"}'}}]}}], usage:{prompt_tokens:42, completion_tokens:18, total_tokens:60}};
  const paths = [];
  const P = p => { paths.push(p); return paths.length-1; };
  const prim = (v,p) => `<span class="jv ${typeof v==='string'?'js':'jn'}" data-p="${P(p)}">${esc(JSON.stringify(v))}</span>`;
  function r(v, p, ind){
    const pad = ' '.repeat(ind+2);
    if (Array.isArray(v)) return '[\n' + v.map((x,i)=>`${pad}<span class="jk" data-p="${P([...p,i])}" title="index ${i}">[${i}]</span> ${r(x,[...p,i],ind+2)}`).join(',\n') + '\n' + ' '.repeat(ind) + ']';
    if (v && typeof v === 'object') return '{\n' + Object.entries(v).map(([k,x])=>`${pad}<span class="jk" data-p="${P([...p,k])}">"${esc(k)}"</span>: ${r(x,[...p,k],ind+2)}`).join(',\n') + '\n' + ' '.repeat(ind) + '}';
    return prim(v,p);
  }
  const fmt = p => 'response' + p.map(k => typeof k === 'number' ? `[${k}]` : `["${k}"]`).join('');
  const get = p => p.reduce((o,k)=>o[k], resp);
  const goals = [
    ['Get the assistant text', ['choices',0,'message','content']],
    ['Get the tool name', ['choices',0,'message','tool_calls',0,'function','name']],
    ['Get the completion token count', ['usage','completion_tokens']],
  ];
  const doneG = new Set();
  el.innerHTML = frame('click into the response', `<div class="col">
    <div class="row" id="js-g"></div>
    <div class="jt" id="js-t">${r(resp, [], 0)}</div>
    <div class="path" id="js-p"><span style="color:var(--code-dim)"># click a key or a value</span></div>
    <div class="term-out" id="js-o"></div></div>`);
  const drawG = () => $('#js-g', el).innerHTML = goals.map((g,i)=>`<span class="chipb ${doneG.has(i)?'good':''}" style="cursor:default">${doneG.has(i)?'✓ ':''}${g[0]}</span>`).join('');
  drawG();
  $('#js-t', el).addEventListener('click', e => {
    const t = e.target.closest('[data-p]'); if (!t) return;
    $$('.pick', el).forEach(x=>x.classList.remove('pick')); t.classList.add('pick');
    const p = paths[+t.dataset.p], v = get(p);
    $('#js-p', el).innerHTML = hlPy(fmt(p));
    const ty = Array.isArray(v)?'list':v===null?'NoneType':typeof v==='object'?'dict':typeof v==='string'?'str':Number.isInteger(v)?'int':'float';
    let note = '';
    goals.forEach((g,i)=>{ if (JSON.stringify(g[1])===JSON.stringify(p)){ doneG.add(i); note = `\n<span class="ok"># challenge done: ${g[0].toLowerCase()}</span>`; } });
    if (p.at(-1)==='arguments') note += `\n<span class="p"># this is a str, not a dict. Use json.loads() first (lesson 34)</span>`;
    const shown = Array.isArray(v) ? `[… ${v.length} item(s)]` : (v && typeof v==='object') ? `{… ${Object.keys(v).length} keys}` : pyRepr(v);
    $('#js-o', el).innerHTML = `${esc(shown)}  <span class="p"># type: ${ty}</span>${note}`;
    drawG();
  });
};

/* ---- ch10: copies ---- */
W.copy = el => {
  let mode = 'assign', a, b, log = [];
  const ids = new WeakMap(); let nid = 100;
  const id = o => { if (!ids.has(o)) ids.set(o, ++nid); return ids.get(o); };
  const reset = () => { a = [{role:'user', content:'hi'}]; b = mode==='assign' ? a : mode==='shallow' ? [...a] : structuredClone(a); log = []; };
  const codeFor = {assign:'b = a', shallow:'b = a.copy()', deep:'b = copy.deepcopy(a)'};
  el.innerHTML = frame('= vs copy() vs deepcopy()', `<div class="col">
    <div class="row"><span class="mini">How is b made?</span>${Object.entries(codeFor).map(([k,v])=>`<button class="chipb" data-m="${k}">${v}</button>`).join('')}</div>
    <div class="row"><span class="mini">Then change b:</span><button class="chipb" data-a="append">b.append({…})</button><button class="chipb" data-a="edit">b[0]["content"] = "CHANGED"</button></div>
    <div class="codebox" id="cp-c"></div>
    <div class="memgrid" id="cp-m"></div>
    <div class="flags" id="cp-f"></div></div>`);
  function draw(){
    $$('[data-m]', el).forEach(x=>x.classList.toggle('on', x.dataset.m===mode));
    $('#cp-c', el).innerHTML = codeLines(`a = [{"role": "user", "content": "hi"}]\n${codeFor[mode]}${log.length?'\n'+log.join('\n'):''}`);
    const shared = new Set(a.filter(x=>b.includes(x)).map(id));
    const box = (n, lst) => `<div class="mem"><span class="lab">${n}</span> → list <span class="idtag ${a===b?'shared':''}">#${id(lst)}</span>${lst.map((m,i)=>`<div style="margin-top:6px;padding-left:12px">[${i}] dict <span class="idtag ${shared.has(id(m))?'shared':''}">#${id(m)}</span><br><span style="color:var(--ink-2)">${esc(pyRepr(m))}</span></div>`).join('')}</div>`;
    $('#cp-m', el).innerHTML = box('a', a) + box('b', b);
    const f1 = a===b, f2 = a[0]===b[0];
    $('#cp-f', el).innerHTML = `<span class="flag ${f1?'t':'f'}">a is b → ${f1?'True':'False'}</span><span class="flag ${f2?'t':'f'}">a[0] is b[0] → ${f2?'True':'False'}</span><span class="mini">Red tags = objects shared by a and b. A change to a shared object shows in both.</span>`;
  }
  $$('[data-m]', el).forEach(x => x.onclick = () => { mode = x.dataset.m; reset(); draw(); });
  $$('[data-a]', el).forEach(x => x.onclick = () => {
    if (x.dataset.a==='append'){ b.push({role:'assistant', content:'new'}); log.push('b.append({"role": "assistant", "content": "new"})'); }
    else { b[0].content = 'CHANGED'; log.push('b[0]["content"] = "CHANGED"'); }
    if (log.length > 4) { reset(); }
    draw();
  });
  reset(); draw();
};

/* ---- ch11: mutable default ---- */
W.default = el => {
  const msgs = ['"hi"','"bye"','"ok"','"again"'];
  let bad = [], k = 0, logB = [], logG = [];
  el.innerHTML = frame('call it again and again', `<div class="col">
    <div class="row"><button class="btn btn-ink" id="df-call">Call add_msg("hi")</button><button class="btn btn-ghost" id="df-r">Reset</button></div>
    <div class="split">
      <div class="col"><span class="pill" style="background:var(--bad-soft);color:var(--bad);border:0;align-self:flex-start">BAD: history=[]</span><div class="codebox">${codeLines('def add_msg(msg, history=[]):\n    history.append(msg)\n    return history')}</div><div class="term-out" id="df-b"></div></div>
      <div class="col"><span class="pill" style="background:var(--good-soft);color:var(--good);border:0;align-self:flex-start">GOOD: history=None</span><div class="codebox">${codeLines('def add_msg(msg, history=None):\n    if history is None:\n        history = []\n    history.append(msg)\n    return history')}</div><div class="term-out" id="df-g"></div></div>
    </div><p class="mini" style="margin:0" id="df-n"></p></div>`);
  function draw(){
    $('#df-call', el).textContent = `Call add_msg(${msgs[k % msgs.length]})`;
    $('#df-b', el).innerHTML = logB.join('\n') || '<span class="p"># no calls yet</span>';
    $('#df-g', el).innerHTML = logG.join('\n') || '<span class="p"># no calls yet</span>';
    $('#df-n', el).textContent = logB.length > 1 ? 'The bad version keeps one list, created when Python ran the def line. Every call adds to that same list.' : '';
  }
  $('#df-call', el).onclick = () => {
    const m = msgs[k % msgs.length].replace(/"/g,''); bad.push(m);
    logB.push(`<span class="p">&gt;&gt;&gt;</span> add_msg(${pyRepr(m)})\n<span class="${bad.length>1?'e':''}">${esc(pyRepr(bad))}</span>`);
    logG.push(`<span class="p">&gt;&gt;&gt;</span> add_msg(${pyRepr(m)})\n<span class="ok">${esc(pyRepr([m]))}</span>`);
    k++; draw();
  };
  $('#df-r', el).onclick = () => { bad=[]; k=0; logB=[]; logG=[]; draw(); };
  draw();
};

/* ---- ch12: unpacking ---- */
W.unpack = el => {
  let step = 0, extra = false;
  el.innerHTML = frame('result = TOOLS[name](**args)', `<div class="col">
    <div class="codebox">${codeLines('def search_docs(query: str, top_k: int = 3):\n    return f"{top_k} docs for {query}"')}</div>
    <div class="row"><button class="btn btn-ink" id="up-n">Next step</button><button class="btn btn-ghost" id="up-r">Reset</button>
    <label class="row mini" style="gap:6px;margin-left:auto"><input type="checkbox" id="up-x"> LLM adds an extra "limit": 5</label></div>
    <div class="col" id="up-s"></div></div>`);
  function draw(){
    const raw = extra ? '{"query": "leave policy", "top_k": 2, "limit": 5}' : '{"query": "leave policy", "top_k": 2}';
    const args = JSON.parse(raw);
    const parts = [];
    parts.push(`<div class="term-out"><span class="p"># 1. the LLM sends a string</span>\n<span class="p">&gt;&gt;&gt;</span> raw = reply["tool_call"]["arguments"]\n${esc(pyRepr(raw))}  <span class="p"># type: str</span></div>`);
    if (step>=1) parts.push(`<div class="term-out"><span class="p"># 2. parse the string</span>\n<span class="p">&gt;&gt;&gt;</span> args = json.loads(raw)\n${esc(pyRepr(args))}  <span class="p"># type: dict</span></div>`);
    if (step>=2) parts.push(`<div class="wg" style="margin:0;box-shadow:none"><div class="mini" style="margin-bottom:8px"># 3. ** spreads each key into a keyword argument</div><div class="col">${Object.entries(args).map(([k,v])=>{ const ok = k==='query'||k==='top_k'; return `<div class="row" style="font-family:var(--f-mono);font-size:14px"><span class="var">${esc(pyRepr(k))}: <b>${esc(pyRepr(v))}</b></span><span>→</span><span class="var" style="${ok?'':'border-color:var(--bad);background:var(--bad-soft)'}">${ok?`parameter <b>${k}</b> = ${esc(pyRepr(v))}`:`no parameter named <b>${k}</b>`}</span></div>`; }).join('')}</div></div>`);
    if (step>=3) parts.push(`<div class="term-out"><span class="p"># 4. the call Python actually makes</span>\n<span class="p">&gt;&gt;&gt;</span> search_docs(${Object.entries(args).map(([k,v])=>`${k}=${pyRepr(v)}`).join(', ')})\n${extra?`<span class="e">TypeError: search_docs() got an unexpected keyword argument 'limit'</span>\n<span class="p"># catch this and send "Tool error: ..." back to the LLM (lesson 32)</span>`:`<span class="ok">'2 docs for leave policy'</span>`}</div>`);
    $('#up-s', el).innerHTML = parts.join('');
    $('#up-n', el).disabled = step >= 3;
  }
  $('#up-n', el).onclick = () => { step++; draw(); };
  $('#up-r', el).onclick = () => { step = 0; draw(); };
  $('#up-x', el).onchange = e => { extra = e.target.checked; draw(); };
  draw();
};

/* ---- ch13: signatures ---- */
W.sig = el => {
  const calls = [
    ['call_llm("Hi")', true, 'prompt by position. Defaults fill the rest.'],
    ['call_llm(prompt="Hi")', false, "TypeError: prompt is positional-only (it is before /)."],
    ['call_llm("Hi", "gpt-4o")', true, 'model can be passed by position.'],
    ['call_llm("Hi", model="gpt-4o")', true, 'model can also be passed by keyword.'],
    ['call_llm("Hi", temperature=0.2)', true, 'temperature is keyword-only, and it is passed as a keyword.'],
    ['call_llm("Hi", "gpt-4o", 0.2)', false, 'TypeError: takes from 1 to 2 positional arguments but 3 were given. temperature is after *.'],
  ];
  el.innerHTML = frame('valid or TypeError?', `<div class="col">
    <div class="codebox">${codeLines('def call_llm(prompt, /, model="gpt-4o-mini", *, temperature=0.0): ...')}</div>
    <div class="col" id="sg-l">${calls.map((c,i)=>`<div class="row" style="justify-content:space-between;background:var(--paper);border:1px solid var(--line);border-radius:10px;padding:8px 10px" data-i="${i}"><code style="font-size:14px;white-space:normal">${esc(c[0])}</code><span class="row"><button class="chipb" data-g="1">valid</button><button class="chipb" data-g="0">TypeError</button></span><div class="mini" style="flex-basis:100%" hidden></div></div>`).join('')}</div></div>`);
  $$('#sg-l [data-i]', el).forEach(row => $$('button', row).forEach(b => b.onclick = () => {
    const c = calls[+row.dataset.i], ok = (b.dataset.g==='1') === c[1];
    $$('button', row).forEach(x => { x.disabled = true; if ((x.dataset.g==='1')===c[1]) x.classList.add('good'); else if (x===b) x.classList.add('bad'); });
    const n = $('.mini', row); n.hidden = false; n.textContent = (ok?'Correct. ':'Not quite. ') + c[2];
  }));
};

/* ---- ch14: registry ---- */
W.registry = el => {
  const TOOLS = {get_weather:a=>`Sunny in ${a.city}`, calculator:a=>String(a.expr.split('*').map(Number).reduce((x,y)=>x*y)), search_docs:a=>`3 passages about '${a.query}'`};
  const asks = [['get_weather',{city:'Pune'}],['calculator',{expr:'12 * 7'}],['search_docs',{query:'leave policy'}],['send_email',{to:'hr@example.com'}]];
  el.innerHTML = frame('dispatch by name', `<div class="col">
    <div class="row"><span class="mini">The LLM asks for:</span>${asks.map((a,i)=>`<button class="chipb" data-i="${i}">${a[0]}</button>`).join('')}</div>
    <div class="split"><div class="codebox" id="rg-c">${codeLines('TOOLS = {\n    "get_weather": get_weather,\n    "calculator": calculator,\n    "search_docs": search_docs,\n}\n\nname, args = tool_call["name"], tool_call["args"]\nfn = TOOLS.get(name)\nif fn is None:\n    result = f"Error: unknown tool {name}"\nelse:\n    result = fn(**args)')}</div>
    <div class="term-out" id="rg-o"><span class="p"># pick a request</span></div></div></div>`);
  $$('[data-i]', el).forEach(b => b.onclick = async () => {
    $$('[data-i]', el).forEach(x=>x.classList.toggle('on', x===b));
    const [name, args] = asks[+b.dataset.i], fn = TOOLS[name];
    const seq = fn ? [7,8,9,11,12] : [7,8,9,10];
    const lines = $$('#rg-c .ln', el);
    const keyLine = {get_weather:2, calculator:3, search_docs:4}[name];
    for (const n of seq){ lines.forEach(l=>l.classList.toggle('on', +l.dataset.l===n || (n===8 && +l.dataset.l===keyLine))); if (!reduced()) await sleep(260); }
    $('#rg-o', el).innerHTML = `<span class="p">&gt;&gt;&gt;</span> name, args\n(${esc(pyRepr(name))}, ${esc(pyRepr(args))})\n<span class="p">&gt;&gt;&gt;</span> fn = TOOLS.get(name)\n${fn?`&lt;function ${name}&gt;`:'None'}\n<span class="p">&gt;&gt;&gt;</span> result\n${fn?`<span class="ok">${esc(pyRepr(fn(args)))}</span>`:`<span class="e">'Error: unknown tool send_email'</span>\n<span class="p"># this text goes back to the LLM, so it can choose a real tool</span>`}`;
  });
};

/* ---- ch15: pipeline ---- */
W.pipeline = el => {
  const scores = [0.91, 0.42, 0.77, 0.15, 0.88, 0.63];
  const F = {'lambda s: s > 0.5':s=>s>0.5, 'lambda s: s > 0.8':s=>s>0.8, 'None (keep truthy)':s=>!!s};
  const M = {'lambda s: round(s, 1)':s=>+s.toFixed(1), 'lambda s: int(s * 100)':s=>Math.floor(s*100+1e-9), 'lambda s: f"{s:.0%}"':s=>Math.round(s*100)+'%'};
  let f = Object.keys(F)[0], m = Object.keys(M)[0];
  el.innerHTML = frame('filter → map', `<div class="col">
    <div class="row"><span class="mini" style="width:52px">filter</span>${Object.keys(F).map(k=>`<button class="chipb" data-f="${esc(k)}">${esc(k)}</button>`).join('')}</div>
    <div class="row"><span class="mini" style="width:52px">map</span>${Object.keys(M).map(k=>`<button class="chipb" data-m="${esc(k)}">${esc(k)}</button>`).join('')}</div>
    <div id="pp-v" class="col" style="gap:10px"></div>
    <div class="codebox" id="pp-c"></div></div>`);
  function draw(){
    $$('[data-f]', el).forEach(x=>x.classList.toggle('on', x.dataset.f===f));
    $$('[data-m]', el).forEach(x=>x.classList.toggle('on', x.dataset.m===m));
    const kept = scores.filter(F[f]), mapped = kept.map(M[m]);
    const chip = (t, cls='') => `<span class="var ${cls}" style="${cls==='x'?'text-decoration:line-through;opacity:.4':''}">${esc(typeof t==='string'?pyRepr(t):String(t))}</span>`;
    $('#pp-v', el).innerHTML =
      `<div class="row"><span class="mini" style="width:70px">scores</span>${scores.map(s=>chip(s)).join('')}</div>`+
      `<div class="row"><span class="mini" style="width:70px">filter</span>${scores.map(s=>chip(s, F[f](s)?'':'x')).join('')}</div>`+
      `<div class="row"><span class="mini" style="width:70px">map</span>${mapped.map(v=>chip(v)).join('') || '<span class="mini">[] (nothing passed)</span>'}</div>`;
    const fl = f.startsWith('None') ? 'None' : f, mExpr = m.replace('lambda s: ','');
    const cond = f.startsWith('None') ? 's' : f.replace('lambda s: ','');
    $('#pp-c', el).innerHTML = codeLines(`scores = ${pyRepr(scores)}\nresult = list(map(${m}, filter(${fl}, scores)))\nresult = [${mExpr} for s in scores if ${cond}]   # same thing\n# ${pyRepr(mapped)}`);
  }
  $$('[data-f]', el).forEach(x => x.onclick = () => { f = x.dataset.f; draw(); });
  $$('[data-m]', el).forEach(x => x.onclick = () => { m = x.dataset.m; draw(); });
  draw();
};

/* ---- ch16: LEGB 3D ---- */
W.legb = el => {
  const layers = [
    {k:'L', name:'Local', where:'inside run()', val:'"local-model"', on:true},
    {k:'E', name:'Enclosing', where:'inside make_agent()', val:'"enclosing-model"', on:true},
    {k:'G', name:'Global', where:'top of the file', val:'"global-model"', on:true},
    {k:'B', name:'Built-in', where:'len, print, type …', val:null, on:true},
  ];
  let target = 'model', busy = false;
  el.innerHTML = frame('LEGB lookup', `<div class="legb">
    <div class="scene"><div class="scene-in" id="lg-s"></div></div>
    <div class="col">
      <div class="codebox" id="lg-c"></div>
      <div class="row"><span class="mini">Define model in:</span>${layers.slice(0,3).map((l,i)=>`<label class="row mini" style="gap:4px"><input type="checkbox" data-i="${i}" checked>${l.k}</label>`).join('')}</div>
      <div class="row"><span class="mini">Look up:</span>${['model','len','api_key'].map(n=>`<button class="chipb" data-t="${n}">${n}</button>`).join('')}<button class="btn btn-ink" id="lg-go" style="padding:7px 14px">Look up</button></div>
      <div class="term-out" id="lg-o"><span class="p"># press Look up</span></div>
    </div></div>`);
  function draw(){
    $('#lg-s', el).innerHTML = layers.map((l,i)=>{
      const z = (3-i)*74;
      const v = l.k==='B' ? (target==='len'?'len = &lt;built-in&gt;':'print, len, type …') : (l.on ? `model = ${esc(l.val)}` : '<span style="opacity:.5">no model here</span>');
      return `<div class="plane" data-k="${l.k}" style="transform:translateZ(${z}px)"><b>${l.k} · ${l.name}</b><span class="pw">${l.where}</span><span class="pv">${v}</span></div>`;
    }).join('');
    const [L,E,G] = layers.map(l=>l.on);
    $('#lg-c', el).innerHTML = codeLines(`${G?'model = "global-model"':'# (no global model)'}

def make_agent():
    ${E?'model = "enclosing-model"':'pass  # no enclosing model'}
    def run():
        ${L?'model = "local-model"':'# no local model'}
        print(${target})
    run()`);
    $$('[data-t]', el).forEach(x=>x.classList.toggle('on', x.dataset.t===target));
  }
  $$('input[data-i]', el).forEach(c => c.onchange = () => { layers[+c.dataset.i].on = c.checked; draw(); });
  $$('[data-t]', el).forEach(b => b.onclick = () => { target = b.dataset.t; draw(); });
  $('#lg-go', el).onclick = async () => {
    if (busy) return; busy = true; draw();
    const planes = $$('.plane', el); let found = null; const steps = [];
    for (let i=0;i<4;i++){
      const l = layers[i], p = planes[i];
      p.classList.add('look'); p.style.transform += ' translateZ(18px)';
      const has = target==='model' ? (l.k!=='B' && l.on) : target==='len' ? l.k==='B' : false;
      steps.push(`${l.k}: ${has?'found':'not here'}`);
      $('#lg-o', el).innerHTML = `<span class="p"># looking for ${target}</span>\n` + steps.join('\n');
      if (!reduced()) await sleep(520);
      if (has){ found = l; p.classList.remove('look'); p.classList.add('found'); break; }
      p.classList.remove('look'); p.style.transform = p.style.transform.replace(' translateZ(18px)','');
    }
    const val = found ? (target==='len' ? '<built-in function len>' : found.val.replace(/"/g,'')) : null;
    $('#lg-o', el).innerHTML = `<span class="p"># looking for ${target}</span>\n` + steps.join('\n') + '\n' + (found ? `<span class="ok">${esc(val)}</span>  <span class="p"># Python stops at the first match</span>` : `<span class="e">NameError: name '${target}' is not defined</span>`);
    busy = false;
  };
  draw();
};

/* ---- ch17: decorators ---- */
W.decorator = el => {
  const decos = [{n:'timer', on:true}, {n:'log_calls', on:true}, {n:'retry(times=3)', on:false}];
  let busy = false;
  el.innerHTML = frame('decorators wrap like layers', `<div class="col">
    <div class="row"><span class="mini">Decorators:</span>${decos.map((d,i)=>`<label class="row mini" style="gap:4px"><input type="checkbox" data-i="${i}" ${d.on?'checked':''}>@${d.n}</label>`).join('')}<button class="btn btn-ink" id="dc-go" style="margin-left:auto;padding:7px 14px">Call get_weather("Pune")</button></div>
    <div class="split"><div><div class="codebox" id="dc-c"></div><div id="dc-n"></div></div><div class="term-out" id="dc-o"><span class="p"># call the function</span></div></div></div>`);
  function draw(){
    const on = decos.filter(d=>d.on);
    $('#dc-c', el).innerHTML = codeLines(on.map(d=>'@'+d.n).join('\n') + (on.length?'\n':'') + 'def get_weather(city):\n    return f"Sunny in {city}"');
    let inner = `<div class="nest fn" data-n="fn"><span class="nl">get_weather</span><span class="mini">the original function</span></div>`;
    [...on].reverse().forEach(d => { inner = `<div class="nest" data-n="${d.n}"><span class="nl">@${d.n} wrapper</span>${inner}</div>`; });
    $('#dc-n', el).innerHTML = inner;
  }
  $$('input', el).forEach(c => c.onchange = () => { decos[+c.dataset.i].on = c.checked; draw(); });
  $('#dc-go', el).onclick = async () => {
    if (busy) return; busy = true; const on = decos.filter(d=>d.on); const out = [];
    const pulse = async (n, line) => { const node = $(`[data-n="${n}"]`, el); node && node.classList.add('pulse'); out.push(line); $('#dc-o', el).innerHTML = out.join('\n'); if (!reduced()) await sleep(420); node && node.classList.remove('pulse'); };
    const before = {timer:'timer: start clock', log_calls:"log: calling get_weather('Pune')", 'retry(times=3)':'retry: attempt 1'};
    const after = {timer:'timer: took 0.01s', log_calls:"log: returned 'Sunny in Pune'", 'retry(times=3)':'retry: success, no more attempts'};
    for (const d of on) await pulse(d.n, '  '.repeat(on.indexOf(d)) + '→ ' + before[d.n]);
    await pulse('fn', '  '.repeat(on.length) + '● get_weather runs');
    for (const d of [...on].reverse()) await pulse(d.n, '  '.repeat(on.indexOf(d)) + '← ' + after[d.n]);
    out.push(`<span class="ok">'Sunny in Pune'</span>`); $('#dc-o', el).innerHTML = out.join('\n');
    busy = false;
  };
  draw();
};

/* ---- ch18: docstring to schema ---- */
W.schema = el => {
  el.innerHTML = frame('function → JSON schema', `<div class="split">
    <div class="col">
      <label class="lbl">Docstring (first paragraph = description)<textarea class="inp" id="sc-d" rows="3">Get the current weather for one city. Use when the user asks about weather now.</textarea></label>
      <label class="lbl">city: description<input class="inp" id="sc-c" value='City name, for example "Hyderabad"'></label>
      <label class="row mini" style="gap:6px"><input type="checkbox" id="sc-x"> add parameter days: int = 1</label>
      <div class="codebox" id="sc-f"></div>
    </div>
    <div class="term-out" id="sc-o" style="font-size:12.5px"></div></div>`);
  function run(){
    const d = $('#sc-d', el).value.trim(), c = $('#sc-c', el).value.trim(), x = $('#sc-x', el).checked;
    const props = {city:{type:'string', description:c}}; if (x) props.days = {type:'integer', description:'Number of days, 1 to 7', default:1};
    const schema = {type:'function', function:{name:'get_weather', description:d.split(/\n\s*\n/)[0], parameters:{type:'object', properties:props, required:['city']}}};
    $('#sc-f', el).innerHTML = codeLines(`def get_weather(city: str${x?', days: int = 1':''}) -> str:\n    """${d}\n\n    Args:\n        city: ${c}${x?'\n        days: Number of days, 1 to 7':''}\n    """`);
    $('#sc-o', el).innerHTML = `<span class="p"># what the LLM receives</span>\n` + esc(JSON.stringify(schema, null, 2));
  }
  $$('textarea,input', el).forEach(i => i.oninput = run); $('#sc-x', el).onchange = run;
  run();
};

/* ---- ch19: generator ---- */
W.gen = el => {
  const text = 'RAG grounds answers in your own documents.';
  const toks = text.split(' ');
  let i = -1, done = false, started = false;
  el.innerHTML = frame('next(gen)', `<div class="col">
    <div class="split"><div class="codebox" id="gn-c">${codeLines('def stream_tokens(text):\n    for word in text.split():\n        yield word + " "\n    # end of function\n\ngen = stream_tokens(answer)')}</div>
    <div class="col"><div class="row"><button class="btn btn-ink" id="gn-n">next(gen)</button><button class="btn btn-ghost" id="gn-r">Reset</button></div>
    <div class="vars" id="gn-v"></div>
    <div style="background:var(--paper);border:1px solid var(--line);border-radius:10px;padding:12px;min-height:76px;font-size:18px" id="gn-ui"><span class="mini">Chat window</span><br><span id="gn-t"></span><span style="display:inline-block;width:8px;height:18px;background:var(--amber);vertical-align:-3px;margin-left:2px" id="gn-cur"></span></div>
    <div class="term-out" id="gn-o"></div></div></div></div>`);
  function draw(){
    $$('#gn-c .ln', el).forEach(l => l.classList.toggle('on', (started && !done && +l.dataset.l===3) || (done && +l.dataset.l===4) || (!started && +l.dataset.l===6)));
    $('#gn-v', el).innerHTML = `<span class="var">state: <b>${!started?'created, not started':done?'finished':'paused at yield'}</b></span>` + (started && !done ? `<span class="var">word = <b>${esc(pyRepr(toks[i]))}</b></span>` : '');
    $('#gn-t', el).textContent = toks.slice(0, Math.max(0,i+1)).join(' ');
    $('#gn-cur', el).style.visibility = done ? 'hidden' : 'visible';
    $('#gn-n', el).disabled = done && i >= toks.length;
  }
  const log = [];
  $('#gn-n', el).onclick = () => {
    started = true;
    if (i < toks.length-1){ i++; log.push(`<span class="p">&gt;&gt;&gt;</span> next(gen)\n${esc(pyRepr(toks[i]+' '))}`); }
    else { done = true; i = toks.length; log.push(`<span class="p">&gt;&gt;&gt;</span> next(gen)\n<span class="e">StopIteration</span>  <span class="p"># a for loop stops here quietly</span>`); }
    $('#gn-o', el).innerHTML = log.slice(-4).join('\n'); draw();
  };
  $('#gn-r', el).onclick = () => { i=-1; done=false; started=false; log.length=0; $('#gn-o', el).innerHTML = '<span class="p"># calling stream_tokens() did not run any code yet</span>'; draw(); };
  $('#gn-r', el).onclick();
};
/* ---- ch20: class → objects ---- */
W.klass = el => {
  let objs = [], nid = 0x7f3a10;
  el.innerHTML = frame('class Agent → objects', `<div class="col">
    <div class="split">
      <div class="blue-card"><b style="color:var(--blue)">class Agent</b> <span class="mini">(blueprint, not an agent yet)</span><br>__init__(self, name, model)<br>run(self, question)</div>
      <div class="col"><div class="row"><input class="inp" id="kl-n" value="Tutor" style="flex:1;min-width:100px" aria-label="name"><select class="inp" id="kl-m" aria-label="model"><option>gpt-4o-mini</option><option>claude-haiku</option><option>llama-3.1-8b</option></select></div>
      <button class="btn btn-ink" id="kl-go">a = Agent(name, model)</button></div>
    </div>
    <div class="insts" id="kl-i"></div>
    <div class="term-out" id="kl-o"><span class="p"># create an object, then call run() on it</span></div></div>`);
  const draw = () => {
    $('#kl-i', el).innerHTML = objs.map((o,i)=>`<div class="inst"><div class="hd">${o.v} <span>at 0x${o.addr.toString(16)}</span></div>self.name = ${esc(pyRepr(o.name))}<br>self.model = ${esc(pyRepr(o.model))}<br><button class="chipb" data-i="${i}" style="margin-top:8px">${o.v}.run("What is RAG?")</button></div>`).join('') || '<span class="mini">No objects yet.</span>';
    $$('[data-i]', el).forEach(b => b.onclick = () => { const o = objs[+b.dataset.i]; $('#kl-o', el).innerHTML = `<span class="p">&gt;&gt;&gt;</span> ${o.v}.run("What is RAG?")\n<span class="p"># Python calls Agent.run(${o.v}, "What is RAG?"), so self is ${o.v}</span>\n<span class="ok">'${esc(o.name)} (${esc(o.model)}) answers: What is RAG?'</span>`; });
  };
  $('#kl-go', el).onclick = () => {
    if (objs.length >= 6) { $('#kl-o', el).innerHTML = '<span class="p"># six objects is enough to see the idea. Reset the lesson step to start over.</span>'; return; }
    objs.push({v:'abcdef'[objs.length], name:$('#kl-n', el).value || 'Agent', model:$('#kl-m', el).value, addr:(nid += 0x60)});
    $('#kl-go', el).textContent = `${'abcdef'[Math.min(objs.length,5)]} = Agent(name, model)`;
    draw();
  };
  draw();
};

/* ---- ch21: class attribute bug ---- */
W.classattr = el => {
  let shared = true, a1 = [], a2 = [], cls = [];
  el.innerHTML = frame('shared list vs own list', `<div class="col">
    <div class="row"><button class="chipb on" data-s="1">tools = [] in class body</button><button class="chipb" data-s="0">self.tools = [] in __init__</button></div>
    <div class="codebox" id="ca-c"></div>
    <div class="row"><button class="btn btn-ink" id="ca-a">a1.tools.append("search")</button><button class="btn btn-ghost" id="ca-r">Reset</button></div>
    <div class="memgrid" id="ca-m"></div></div>`);
  function draw(){
    $$('[data-s]', el).forEach(x=>x.classList.toggle('on', (x.dataset.s==='1')===shared));
    $('#ca-c', el).innerHTML = codeLines(shared ? 'class Agent:\n    tools = []              # ONE list for the class\n\na1, a2 = Agent(), Agent()' : 'class Agent:\n    def __init__(self):\n        self.tools = []     # a new list per object\n\na1, a2 = Agent(), Agent()');
    const t1 = shared ? cls : a1, t2 = shared ? cls : a2;
    $('#ca-m', el).innerHTML = `<div class="mem"><span class="lab">a1.tools</span> <span class="idtag ${shared?'shared':''}">${shared?'Agent.tools':'own list'}</span><br>${esc(pyRepr(t1))}</div><div class="mem"><span class="lab">a2.tools</span> <span class="idtag ${shared?'shared':''}">${shared?'Agent.tools':'own list'}</span><br><span style="${shared&&t2.length?'color:var(--bad);font-weight:700':''}">${esc(pyRepr(t2))}</span>${shared&&t2.length?'<br><span class="mini">a2 never asked for this tool</span>':''}</div>`;
  }
  $$('[data-s]', el).forEach(x => x.onclick = () => { shared = x.dataset.s==='1'; a1=[]; a2=[]; cls=[]; draw(); });
  $('#ca-a', el).onclick = () => { (shared?cls:a1).push('search'); draw(); };
  $('#ca-r', el).onclick = () => { a1=[]; a2=[]; cls=[]; draw(); };
  draw();
};

/* ---- ch25: dunder map ---- */
W.dunder = el => {
  const rows = [
    ['print(agent)','__str__',"Tutor using gpt-4o"],
    ['repr(agent)','__repr__',"Agent(name='Tutor', model='gpt-4o')"],
    ['len(agent)','__len__','3   # number of messages'],
    ['agent == other','__eq__','True   # same name and model'],
    ['agent("Hi")','__call__',"'Tutor says: Hi'"],
    ['for m in agent: ...','__iter__','yields each message in history'],
    ['"Hi" in agent','__contains__','True   # Hi is in history'],
    ['if agent: ...','__bool__ (or __len__)','True   # has messages'],
  ];
  el.innerHTML = frame('syntax → method', `<div class="col">
    <div class="row">${rows.map((r,i)=>`<button class="chipb" data-i="${i}">${esc(r[0])}</button>`).join('')}</div>
    <div class="split"><div class="term-out" id="du-o"><span class="p"># click a line of Python</span></div><div class="codebox" id="du-c"></div></div></div>`);
  const cls = `class Agent:
    def __init__(self, name, model):
        self.name, self.model = name, model
        self.history = ["Hi", "Hello!", "Explain RAG"]
    def __str__(self):
        return f"{self.name} using {self.model}"
    def __repr__(self):
        return f"Agent(name={self.name!r}, model={self.model!r})"
    def __len__(self):
        return len(self.history)
    def __eq__(self, other):
        return (self.name, self.model) == (other.name, other.model)
    def __call__(self, msg):
        return f"{self.name} says: {msg}"
    def __iter__(self):
        return iter(self.history)
    def __contains__(self, msg):
        return msg in self.history`;
  $('#du-c', el).innerHTML = codeLines(cls);
  const lineOf = {__str__:5,__repr__:7,__len__:9,__eq__:11,__call__:13,__iter__:15,__contains__:17,'__bool__ (or __len__)':9};
  $$('[data-i]', el).forEach(b => b.onclick = () => {
    $$('[data-i]', el).forEach(x=>x.classList.toggle('on', x===b));
    const [src, m, res] = rows[+b.dataset.i];
    $('#du-o', el).innerHTML = `<span class="p">&gt;&gt;&gt;</span> ${esc(src)}\n<span class="p"># Python calls agent.${m.split(' ')[0]}(${m==='__eq__'?'other':m==='__call__'?'"Hi"':m==='__contains__'?'"Hi"':''})</span>\n${esc(res)}`;
    $$('#du-c .ln', el).forEach(l => { const n=+l.dataset.l, s=lineOf[m]; l.classList.toggle('on', n===s || n===s+1); });
  });
};

/* ---- ch31: pydantic ---- */
W.pydantic = el => {
  const presets = {
    'valid': '{"city": "Pune", "days": 3, "units": "C"}',
    'string number': '{"city": "Pune", "days": "5"}',
    'out of range': '{"city": "Pune", "days": 12, "units": "K"}',
    'missing city': '{"days": 2}',
    'wrong type': '{"city": 42, "days": "two"}',
  };
  el.innerHTML = frame('WeatherArgs.model_validate_json(raw)', `<div class="col">
    <div class="codebox">${codeLines('class WeatherArgs(BaseModel):\n    city: str\n    days: int = Field(default=1, ge=1, le=7)\n    units: Literal["C", "F"] = "C"')}</div>
    <div class="row">${Object.keys(presets).map(k=>`<button class="chipb" data-k="${k}">${k}</button>`).join('')}</div>
    <textarea class="inp" id="pd-i" rows="2" aria-label="raw JSON from the LLM"></textarea>
    <div class="row"><button class="btn btn-ink" id="pd-go">Validate</button></div>
    <div class="term-out" id="pd-o"></div></div>`);
  function validate(){
    const raw = $('#pd-i', el).value; let d;
    try { d = JSON.parse(raw); } catch(e){ return out(`<span class="e">ValidationError: 1 validation error\n  Invalid JSON: ${esc(e.message)}</span>`); }
    if (!d || typeof d !== 'object' || Array.isArray(d)) return out(`<span class="e">ValidationError: Input should be an object</span>`);
    const errs = [], res = {};
    if (!('city' in d)) errs.push(['city','Field required','missing']);
    else if (typeof d.city !== 'string') errs.push(['city','Input should be a valid string','string_type']);
    else res.city = d.city;
    let days = 'days' in d ? d.days : 1;
    if (typeof days === 'string' && /^\s*-?\d+\s*$/.test(days)) days = parseInt(days,10);
    if (typeof days === 'boolean' || typeof days !== 'number' || !Number.isInteger(days)) errs.push(['days','Input should be a valid integer, unable to parse string as an integer','int_parsing']);
    else if (days < 1) errs.push(['days','Input should be greater than or equal to 1','greater_than_equal']);
    else if (days > 7) errs.push(['days','Input should be less than or equal to 7','less_than_equal']);
    else res.days = days;
    const units = 'units' in d ? d.units : 'C';
    if (units !== 'C' && units !== 'F') errs.push(['units',"Input should be 'C' or 'F'",'literal_error']); else res.units = units;
    if (errs.length) return out(`<span class="e">ValidationError: ${errs.length} validation error${errs.length>1?'s':''} for WeatherArgs</span>\n` + errs.map(e=>`<span class="e">${e[0]}</span>\n  ${esc(e[1])} <span class="p">[type=${e[2]}]</span>`).join('\n') + `\n<span class="p"># send these messages back to the LLM so it can fix its arguments</span>`);
    const conv = typeof d.days === 'string' ? `\n<span class="p"># "${esc(d.days)}" was converted to the int ${res.days}</span>` : '';
    out(`<span class="p">&gt;&gt;&gt;</span> args.model_dump()\n<span class="ok">${esc(pyRepr(res))}</span>${conv}`);
  }
  const out = h => $('#pd-o', el).innerHTML = h;
  $$('[data-k]', el).forEach(b => b.onclick = () => { $('#pd-i', el).value = presets[b.dataset.k]; validate(); });
  $('#pd-go', el).onclick = validate;
  $('#pd-i', el).value = presets['string number']; validate();
};

/* ---- ch32: exceptions path ---- */
W.exc = el => {
  const code = `try:
    result = call_tool(name, args)
    print("tool returned")
except ValueError as e:
    result = f"Tool error: {e}"
else:
    log("tool ok")
finally:
    close_connection()
send_to_llm(result)`;
  const paths = {
    ok:[[1,'enter try'],[2,'call succeeds'],[3,'next line in try runs'],[6,'no error, so else runs'],[7,''],[8,'finally always runs'],[9,''],[10,'program continues']],
    value:[[1,'enter try'],[2,'ValueError raised here'],[4,'matching except found'],[5,'turn the error into text'],[8,'finally always runs'],[9,''],[10,'program continues']],
    key:[[1,'enter try'],[2,'KeyError raised here'],[4,'except ValueError does not match KeyError'],[8,'finally still runs'],[9,''],[0,'KeyError goes up and the program stops']],
  };
  const outs = {ok:'tool returned\nlog: tool ok\nconnection closed\n<span class="ok">sent: Sunny in Pune</span>', value:'connection closed\n<span class="ok">sent: Tool error: city is required</span>', key:'connection closed\n<span class="e">Traceback (most recent call last):\nKeyError: \'city\'</span>'};
  let mode = 'ok', busy = false;
  el.innerHTML = frame('try / except / else / finally', `<div class="col">
    <div class="row"><span class="mini">The tool:</span><button class="chipb on" data-m="ok">works</button><button class="chipb" data-m="value">raises ValueError</button><button class="chipb" data-m="key">raises KeyError</button><button class="btn btn-ink" id="ex-go" style="margin-left:auto;padding:7px 14px">Run</button></div>
    <div class="split"><div class="codebox" id="ex-c">${codeLines(code)}</div><div class="col"><div class="mini" id="ex-w">Press Run.</div><div class="term-out" id="ex-o"></div></div></div></div>`);
  $$('[data-m]', el).forEach(b => b.onclick = () => { mode = b.dataset.m; $$('[data-m]', el).forEach(x=>x.classList.toggle('on', x===b)); });
  $('#ex-go', el).onclick = async () => {
    if (busy) return; busy = true;
    const lines = $$('#ex-c .ln', el); lines.forEach(l=>l.className='ln');
    const visited = new Set(); $('#ex-o', el).innerHTML = '';
    for (const [n, why] of paths[mode]){
      lines.forEach(l=>l.classList.remove('on'));
      if (n){ const l = lines[n-1]; l.classList.add('on'); visited.add(n); }
      if (why) $('#ex-w', el).textContent = why;
      if (!reduced()) await sleep(520);
    }
    lines.forEach((l,i)=>{ l.classList.remove('on'); if (!visited.has(i+1)) l.classList.add('skip'); });
    $('#ex-o', el).innerHTML = outs[mode]; busy = false;
  };
};

/* ---- ch33: retry timeline ---- */
W.retry = el => {
  el.innerHTML = frame('exponential backoff', `<div class="col">
    <div class="row"><label class="lbl" style="flex:1;min-width:200px">Chance one attempt fails: <b id="rt-pv" style="color:var(--ink);font-size:14px"></b><input type="range" id="rt-p" min="0" max="95" value="60"></label>
    <label class="row mini" style="gap:6px"><input type="checkbox" id="rt-j" checked> jitter</label>
    <button class="btn btn-ink" id="rt-go">Run request</button></div>
    <div class="tl" id="rt-t"></div>
    <div class="term-out" id="rt-o"><span class="p"># max_attempts = 5, base = 1s, wait = base * 2 ** attempt</span></div></div>`);
  const pv = () => $('#rt-pv', el).textContent = $('#rt-p', el).value + '%';
  $('#rt-p', el).oninput = pv; pv();
  let busy = false;
  $('#rt-go', el).onclick = async () => {
    if (busy) return; busy = true;
    const p = +$('#rt-p', el).value / 100, jit = $('#rt-j', el).checked, tl = $('#rt-t', el);
    tl.innerHTML = ''; let total = 0, log = [];
    for (let a = 0; a < 5; a++){
      const fail = Math.random() < p, code = fail ? (Math.random()<.7 ? 429 : 503) : 200;
      const row = H(`<div class="tl-row"><span>attempt ${a+1}</span><div class="tl-track"><span class="tl-call ${fail?'fail':'ok'}">${code}${fail?(code===429?' Too Many Requests':' Overloaded'):' OK'}</span></div></div>`);
      tl.append(row); log.push(`attempt ${a+1}: ${code}`);
      if (!fail){ log.push(`<span class="ok">success after ${total.toFixed(1)}s of waiting</span>`); break; }
      if (a === 4){ log.push(`<span class="e">gave up after 5 attempts: raise the error</span>`); break; }
      const wait = 2 ** a + (jit ? Math.random()*0.5 : 0); total += wait;
      const w = H(`<div class="tl-wait" style="width:0"></div>`), lab = H(`<span>wait ${wait.toFixed(1)}s</span>`);
      $('.tl-track', row).append(w, lab);
      if (!reduced()){ for (let t=0; t<=10; t++){ w.style.width = (wait*14*t/10) + 'px'; await sleep(wait*10); } } else w.style.width = (wait*14)+'px';
      log.push(`  wait ${wait.toFixed(1)}s`);
      $('#rt-o', el).innerHTML = log.join('\n');
    }
    $('#rt-o', el).innerHTML = log.join('\n'); busy = false;
  };
};

/* ---- ch34: JSON repair ---- */
W.jsonfix = el => {
  const F = '```';
  const presets = {
    'clean JSON': '{"city": "Pune", "days": 2}',
    'in a code fence': `Sure! Here are the arguments:\n${F}json\n{"city": "Pune", "days": 2}\n${F}`,
    'trailing comma': '{"city": "Pune", "days": 2,}',
    'single quotes': "{'city': 'Pune', 'days': 2}",
    'cut off': '{"city": "Pune", "da',
  };
  el.innerHTML = frame('parse_llm_json(text)', `<div class="col">
    <div class="row">${Object.keys(presets).map(k=>`<button class="chipb" data-k="${k}">${k}</button>`).join('')}</div>
    <textarea class="inp" id="jf-i" rows="4" aria-label="LLM output"></textarea>
    <div class="row"><button class="btn btn-ink" id="jf-go">Parse</button></div>
    <div class="col" id="jf-s"></div></div>`);
  const tryP = s => { try { return [true, JSON.parse(s)]; } catch(e){ return [false, e.message]; } };
  function run(){
    const text = $('#jf-i', el).value, steps = [];
    let [ok, v] = tryP(text);
    steps.push(['json.loads(text)', ok, ok ? pyRepr(v) : 'JSONDecodeError']);
    if (!ok){
      const m = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/) || text.match(/\{[\s\S]*\}/);
      const inner = m ? (m[1] ?? m[0]) : null;
      if (inner !== null && inner !== text){ [ok, v] = tryP(inner); steps.push(['strip fence / take {…} with re.search', ok, ok ? pyRepr(v) : 'still invalid']); }
      else steps.push(['strip fence / take {…} with re.search', false, 'no {…} block found']);
      if (!ok && inner){
        const fixed = inner.replace(/,\s*([}\]])/g,'$1').replace(/'/g,'"');
        [ok, v] = tryP(fixed); steps.push(['remove trailing commas, swap \' for "', ok, ok ? pyRepr(v) : 'still invalid']);
      }
      if (!ok) steps.push(['give up: ask the LLM to resend valid JSON', null, 'send the error text back as the tool result']);
    }
    $('#jf-s', el).innerHTML = steps.map((s,i)=>`<div class="row" style="background:var(--paper);border:1px solid ${s[1]===true?'var(--good)':s[1]===false?'var(--bad)':'var(--line)'};border-radius:10px;padding:8px 12px;animation:rise .25s ${i*.08}s both"><span class="pill" style="border:0;background:${s[1]===true?'var(--good-soft)':s[1]===false?'var(--bad-soft)':'var(--sunk)'};color:${s[1]===true?'var(--good)':s[1]===false?'var(--bad)':'var(--ink-2)'}">${s[1]===true?'OK':s[1]===false?'FAIL':'NEXT'}</span><code style="white-space:normal">${esc(s[0])}</code><span class="mini" style="flex-basis:100%;font-family:var(--f-mono)">${esc(s[2])}</span></div>`).join('');
  }
  $$('[data-k]', el).forEach(b => b.onclick = () => { $('#jf-i', el).value = presets[b.dataset.k]; run(); });
  $('#jf-go', el).onclick = run;
  $('#jf-i', el).value = presets['in a code fence']; run();
};

/* ---- ch37: status codes ---- */
W.status = el => {
  const S = {200:['OK','Success. Read the body with res.json().','use the result'],201:['Created','A new item was created.','use the result'],400:['Bad Request','Your request is wrong (bad JSON, bad field).','fix the request, do not retry'],401:['Unauthorized','The API key is missing or wrong.','check your key, do not retry'],403:['Forbidden','The key is valid but not allowed to do this.','do not retry'],404:['Not Found','The URL or the item does not exist.','do not retry'],408:['Request Timeout','The server waited too long for you.','retry with backoff'],429:['Too Many Requests','You hit a rate limit.','retry with backoff (read Retry-After)'],500:['Internal Server Error','The server crashed on this request.','retry a few times'],502:['Bad Gateway','A server in the middle failed.','retry with backoff'],503:['Service Unavailable','The service is overloaded or down.','retry with backoff']};
  el.innerHTML = frame('status codes', `<div class="col"><div class="status-grid">${Object.keys(S).map(c=>`<button data-c="${c}" data-g="${c[0]}">${c}</button>`).join('')}</div><div class="term-out" id="st-o"><span class="p"># 2xx = success · 4xx = your request is the problem · 5xx = the server is the problem</span></div></div>`);
  $$('[data-c]', el).forEach(b => b.onclick = () => { $$('[data-c]', el).forEach(x=>x.classList.toggle('on', x===b)); const [n, m, act] = S[b.dataset.c]; const retry = /retry/.test(act) && !/not retry/.test(act); $('#st-o', el).innerHTML = `${b.dataset.c} ${n}\n${esc(m)}\n<span class="${retry?'ok':'e'}">agent: ${esc(act)}</span>`; });
};

/* ---- ch38: regex tester ---- */
W.regex = el => {
  const F = '```';
  const presets = {
    'remove <think>': ['<think>.*?</think>', 's', '<think>The user wants weather.\nCall the tool.</think>It is sunny in Pune.'],
    'fenced JSON': [F+'json\\s*(.*?)\\s*'+F, 's', `Here you go:\n${F}json\n{"city": "Pune"}\n${F}\nDone.`],
    'numbers': ['\\d+(?:\\.\\d+)?', '', 'Used 1532 tokens, cost $0.0021, 3 tool calls.'],
    'emails': ['[\\w.+-]+@[\\w-]+\\.[\\w.]+', '', 'Contact hr@acme.in or uma.dev@example.com for access.'],
    'citations [n]': ['\\[(\\d+)\\]', '', 'RAG reduces errors [1] and adds sources [2][3].'],
  };
  el.innerHTML = frame('re.findall(pattern, text)', `<div class="col">
    <div class="row">${Object.keys(presets).map(k=>`<button class="chipb" data-k="${esc(k)}">${esc(k)}</button>`).join('')}</div>
    <div class="row"><label class="lbl" style="flex:1;min-width:220px">pattern = r"…"<input class="inp" id="rx-p" autocomplete="off" spellcheck="false"></label>
    <label class="row mini" style="gap:4px"><input type="checkbox" id="rx-s"> re.S</label><label class="row mini" style="gap:4px"><input type="checkbox" id="rx-i"> re.I</label></div>
    <label class="lbl">text<textarea class="inp" id="rx-t" rows="3" spellcheck="false"></textarea></label>
    <div class="rx-text" id="rx-v"></div>
    <div class="term-out" id="rx-o"></div></div>`);
  function run(){
    const p = $('#rx-p', el).value, t = $('#rx-t', el).value;
    let re; try { re = new RegExp(p, 'g' + ($('#rx-s', el).checked?'s':'') + ($('#rx-i', el).checked?'i':'')); } catch(e){ $('#rx-v', el).textContent = t; $('#rx-o', el).innerHTML = `<span class="e">re.error: ${esc(e.message)}</span>`; return; }
    if (!p){ $('#rx-v', el).textContent = t; $('#rx-o', el).innerHTML = '<span class="p"># type a pattern</span>'; return; }
    let html = '', last = 0, found = [], m, guard = 0;
    while ((m = re.exec(t)) && guard++ < 200){ if (m[0] === '') { re.lastIndex++; continue; } html += esc(t.slice(last, m.index)) + '<mark>' + esc(m[0]) + '</mark>'; last = m.index + m[0].length; found.push(m.length > 1 ? m[1] : m[0]); }
    html += esc(t.slice(last));
    $('#rx-v', el).innerHTML = html;
    $('#rx-o', el).innerHTML = `<span class="p">&gt;&gt;&gt;</span> re.findall(r${esc(pyRepr(p).replace(/\\\\/g,'\\'))}, text${$('#rx-s', el).checked?', re.S':''})\n${esc(pyRepr(found))}`;
  }
  $$('input,textarea', el).forEach(i => { i.oninput = run; i.onchange = run; });
  $$('[data-k]', el).forEach(b => b.onclick = () => { const [p, f, t] = presets[b.dataset.k]; $('#rx-p', el).value = p; $('#rx-t', el).value = t; $('#rx-s', el).checked = f.includes('s'); $('#rx-i', el).checked = false; run(); });
  $$('[data-k]', el)[0].onclick();
};

export { esc, KW, BI, hlPy, H, $, $$, codeLines, pyRepr, pyFloat, sleep, reduced, W, frame };
