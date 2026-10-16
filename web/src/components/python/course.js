/* eslint-disable */
// @ts-nocheck
/* The Python course app: home roadmap, lesson player and full notes. Mounted by PythonCourse.tsx. */
import { PARTS, NEXT_PARTS, L, AGENT, WEEKS, INTERVIEW } from "@/content/python/lessons";
import notes from "@/content/python/notes.json";
import { esc, hlPy, H, $, $$, codeLines, pyRepr, pyFloat, sleep, reduced, W, frame } from "./widgets";

/** Wires the course into the markup inside `root`. Returns a cleanup function. */
export function mountCourse(root, { toggleTheme }) {
  /* ============ state ============ */
  const KEY = 'ft_python_brand_v1';
  let S = {done:{}, seen:{}, last:null};
  try { const raw = localStorage.getItem(KEY); if (raw) S = Object.assign(S, JSON.parse(raw)); } catch(e){}
  const save = () => { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch(e){} };
  const TOTAL = Object.keys(L).length;
  const hasLab = n => L[n].steps.some(s => s.k === 'lab');
  const partOf = n => PARTS.find(p => p.ch.includes(n));
  const toast = msg => { const t = H(`<div class="toast" role="status">${esc(msg)}</div>`); root.append(t); setTimeout(()=>t.remove(), 1800); };

  /* ============ theme: uses the site's header toggle key ============ */
  $('#themeBtn2').onclick = toggleTheme;

  /* ============ home ============ */
  let filter = 'all';
  function renderHome(){
    const done = Object.keys(S.done).filter(k => S.done[k]).length;
    $('#ringNum').textContent = `${done}/${TOTAL}`;
    $('#ringArc').setAttribute('stroke-dashoffset', 94.25 * (1 - done / TOTAL));
    const next = S.last && L[S.last] ? S.last : (Object.keys(L).map(Number).find(n => !S.done[n]) || 1);
    $('#continueBtn').textContent = S.last ? `Continue lesson ${next} →` : 'Start lesson 1 →';
    $('#continueBtn').onclick = () => openLesson(next, S.last ? (S.seen[next] || 0) : 0);

    // 3D stack: Part I at the bottom
    $('#stack').innerHTML = PARTS.map((p, i) => {
      const d = p.ch.filter(n => S.done[n]).length;
      return `<div class="plate" tabindex="0" role="button" data-part="${p.id}" style="transform:translateZ(${i*62}px)" aria-label="Part ${p.roman}: ${esc(p.title)}">
        <div class="pm"><b>PART ${p.roman}</b><span>${d}/${p.ch.length} learned · ${p.ch.reduce((a,n)=>a+L[n].mins,0)} min</span></div><div class="pt">${esc(p.title)}</div><div class="pbar"><i style="width:${d/p.ch.length*100}%"></i></div></div>`;
    }).join('');
    $$('#stack .plate').forEach((pl, i) => {
      const base = i * 62;
      const up = () => pl.style.transform = `translateZ(${base + 30}px) translateX(-10px)`;
      const down = () => pl.style.transform = `translateZ(${base}px)`;
      pl.onmouseenter = up; pl.onmouseleave = down; pl.onfocus = up; pl.onblur = down;
      const go = () => document.getElementById('part-' + pl.dataset.part).scrollIntoView({behavior: reduced() ? 'auto' : 'smooth', block:'start'});
      pl.onclick = go; pl.onkeydown = e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); go(); } };
    });

    // parts
    const show = n => filter === 'all' || (filter === 'todo' && !S.done[n]) || (filter === 'lab' && hasLab(n));
    $('#parts').innerHTML = PARTS.map(p => {
      const list = p.ch.filter(show);
      const d = p.ch.filter(n => S.done[n]).length;
      return `<div class="part" id="part-${p.id}"><div class="part-side"><div class="roman">${p.roman}</div><h3>${esc(p.title)}</h3><p>${esc(p.desc)}</p><div class="meta">${d}/${p.ch.length} learned · ${p.ch.reduce((a,n)=>a+L[n].mins,0)} min</div></div>
        <div class="chapters">${list.map(n => {
          const c = L[n], st = S.done[n] ? 'done' : (S.seen[n] ? 'partial' : '');
          return `<button class="ch ${st}" data-ch="${n}"><span class="n"><span>Lesson ${n} · ${c.mins} min</span><span class="check" aria-hidden="true">✓</span></span><span class="t">${esc(c.t)}</span><span class="d">${esc(c.d)}</span><span class="badges">${hasLab(n)?'<span class="pill lab">INTERACTIVE LAB</span>':''}${c.core?'<span class="pill core">AGENT CORE</span>':''}${S.seen[n] && !S.done[n] ? `<span class="pill">step ${S.seen[n]+1}</span>` : ''}</span></button>`;
        }).join('') || '<p class="mini">Nothing here for this filter.</p>'}</div></div>`;
    }).join('') + NEXT_PARTS.map(p => `<div class="part locked"><div class="part-side"><div class="roman" style="color:var(--ink-3)">${p.roman}</div><h3>${esc(p.title)}</h3><p>${esc(p.desc)}</p><div class="meta">coming next</div></div>
        <div class="chapters">${p.items.map(it => `<div class="ch"><span class="n"><span>Planned</span></span><span class="t">${esc(it[0])}</span><span class="d">${esc(it[1])}</span></div>`).join('')}</div></div>`).join('');
    $$('#parts [data-ch]').forEach(b => b.onclick = () => openLesson(+b.dataset.ch, S.seen[+b.dataset.ch] || 0));
  }
  $$('#filterTabs button').forEach(b => b.onclick = () => { filter = b.dataset.f; $$('#filterTabs button').forEach(x => x.setAttribute('aria-selected', x === b)); renderHome(); });

  /* x-ray */
  (function(){
    const used = new Set(AGENT.filter(a => a[1]).map(a => a[1]));
    $('#xraySide h4').textContent = `${AGENT.length} lines, ${used.size} lessons`;
    $('#xrayCode').innerHTML = AGENT.map((a, i) => `<div class="xl" data-i="${i}" ${a[1]?'':'style="cursor:default"'}><span class="ln">${i+1}</span><pre>${hlPy(a[0]) || ' '}</pre><span class="cc">${a[1] ? 'L' + a[1] : ''}</span></div>`).join('');
    $$('#xrayCode .xl').forEach(row => row.onclick = () => {
      const a = AGENT[+row.dataset.i]; if (!a[1]) return;
      $$('#xrayCode .xl').forEach(r => r.classList.toggle('on', AGENT[+r.dataset.i][1] === a[1]));
      const c = L[a[1]];
      $('#xraySide').innerHTML = `<div class="eyebrow">Line ${+row.dataset.i+1}${a[2] ? ' · ' + esc(a[2]) : ''}</div><h4>Lesson ${a[1]}: ${esc(c.t)}</h4><p>${esc(c.d)}</p><p class="mini">Highlighted: every line that uses this lesson.</p><button class="btn btn-ink" id="xrGo">Open lesson ${a[1]} →</button>`;
      $('#xrGo').onclick = () => openLesson(a[1], 0);
    });
  })();

  /* plan */
  $('#planWeeks').innerHTML = WEEKS.map(w => `<div class="week"><b>${w[0]}</b><span>${esc(w[1])}</span>${w[2] ? `<button class="btn btn-ghost" style="padding:7px 12px;font-size:13.5px" data-ch="${w[2]}">Open lesson ${w[2]} →</button>` : '<span></span>'}</div>`).join('');
  $('#planInterview').innerHTML = INTERVIEW.map(c => `<div class="box"><h4>${esc(c.h)}</h4><p class="sub">${esc(c.sub)}</p><ul class="qlist">${c.items.map(it => `<li><span style="flex:1">${esc(it[0])}</span>${it[1] ? `<button data-ch="${it[1]}">L${it[1]} →</button>` : ''}</li>`).join('')}</ul></div>`).join('');
  $$('#planWeeks [data-ch], #planInterview [data-ch]').forEach(b => b.onclick = () => openLesson(+b.dataset.ch, 0));
  $$('#planTabs button').forEach(b => b.onclick = () => {
    $$('#planTabs button').forEach(x => x.setAttribute('aria-selected', x === b));
    $('#planWeeks').hidden = b.dataset.p !== 'weeks'; $('#planInterview').hidden = b.dataset.p !== 'interview'; $('#planSkip').hidden = b.dataset.p !== 'skip';
  });

  /* ============ lesson player ============ */
  let cur = null, idx = 0, cleanup = null, answered = {};
  const stepsOf = n => [{k:'intro'}, ...L[n].steps, {k:'summary'}];

  function codeBlock(src, out){
    if (!src) return '';
    const id = 'c' + Math.random().toString(36).slice(2, 8);
    let h = `<div class="code"><div class="chead"><span>Python</span><button data-copy="${id}">Copy</button></div><pre id="${id}">${hlPy(src)}</pre></div>`;
    if (out) h += `<div class="code out"><div class="chead"><span>Output</span></div><pre>${esc(out)}</pre></div>`;
    return h;
  }
  function tableBlock(t){
    if (!t) return '';
    return `<div class="tablewrap"><table class="cmp"><tr>${t[0].map(c => `<th>${esc(c)}</th>`).join('')}</tr>${t.slice(1).map(r => `<tr>${r.map((c, i) => `<td>${i === 0 ? `<code>${esc(c)}</code>` : esc(c)}</td>`).join('')}</tr>`).join('')}</table></div>`;
  }

  function openLesson(n, step){
    cur = n; idx = Math.min(step || 0, stepsOf(n).length - 1); answered = {};
    S.last = n; save();
    $('#lesson').hidden = false; document.body.style.overflow = 'hidden';
    noteKey = null; setMode('learn'); $('#lMode').hidden = false;
    const p = partOf(n);
    $('#lWhere').textContent = `Part ${p.roman} · ${p.title} · Lesson ${n} of ${TOTAL}`;
    $('#lTitle').textContent = L[n].t;
    if (location.hash !== '#lesson-' + n) history.replaceState(null, '', '#lesson-' + n);
    renderStep();
  }
  function closeLesson(){
    if (cleanup) { try { cleanup(); } catch(e){} cleanup = null; }
    $('#lesson').hidden = true; document.body.style.overflow = '';
    const app = noteKey && !isChKey(noteKey); noteKey = null; mode = 'learn';
    history.replaceState(null, '', app ? '#fullnotes' : '#roadmap');
    renderHome();
    if (app) { $('#fullnotes').scrollIntoView({block:'start'}); return; }
    const card = $(`#parts [data-ch="${cur}"]`); if (card) { card.scrollIntoView({block:'center'}); card.focus({preventScroll:true}); }
  }

  function renderStep(){
    if (cleanup) { try { cleanup(); } catch(e){} cleanup = null; }
    const steps = stepsOf(cur), st = steps[idx], c = L[cur];
    S.seen[cur] = Math.max(S.seen[cur] || 0, idx); save();
    $('#lSegs').innerHTML = steps.map((s, i) => `<button class="${i === idx ? 'cur' : i <= (S.seen[cur]||0) ? 'seen' : ''}" data-i="${i}" title="Step ${i+1}" aria-label="Go to step ${i+1}"></button>`).join('');
    $$('#lSegs button').forEach(b => b.onclick = () => { idx = +b.dataset.i; renderStep(); });
    const stage = $('#lStage');
    stage.classList.toggle('wide', st.k === 'lab');
    let html = '';
    if (st.k === 'intro'){
      html = `<div class="kind read">Lesson ${cur} · ${c.mins} min · ${steps.length - 2} steps</div><h2>${esc(c.t)}</h2><div class="body"><p>${esc(c.d)}</p><p><b>After this lesson you can:</b></p></div><ul class="intro-goals">${c.goals.map(g => `<li>${esc(g)}</li>`).join('')}</ul>
        <div class="row mini" style="gap:16px">${c.steps.some(s=>s.k==='lab')?'<span class="pill lab">INTERACTIVE LAB</span>':''}<span>${c.steps.filter(s=>s.k==='predict').length} predict questions</span><span>1 coding task</span></div>
        <div class="master" style="margin-top:16px"><p>Want every detail first? The full notes for this lesson have all the examples, tables and practice questions.</p><button class="btn btn-ghost" id="toNotes">Read the full notes →</button></div>`;
    } else if (st.k === 'read'){
      html = `<div class="kind read">Read</div><h2>${esc(st.h)}</h2><div class="body">${st.b || ''}</div>${tableBlock(st.table)}${codeBlock(st.code, st.out)}${st.note ? `<div class="note">${esc(st.note)}</div>` : ''}${st.ai ? `<div class="note ai">${esc(st.ai)}</div>` : ''}`;
    } else if (st.k === 'lab'){
      html = `<div class="kind lab">Interactive lab</div><h2>${esc(st.h)}</h2><div class="body">${st.b || ''}</div><div id="wmount"></div>${st.note ? `<div class="note">${esc(st.note)}</div>` : ''}`;
    } else if (st.k === 'predict'){
      const a = answered[idx];
      html = `<div class="kind predict">Predict first</div><h2>${esc(st.q)}</h2>${st.code ? `<div class="code"><div class="chead"><span>Python</span><span>run it in your head</span></div><pre>${hlPy(st.code)}</pre></div>` : ''}
        <div class="opts">${st.o.map((o, i) => `<button class="opt ${a !== undefined ? (i === st.a ? 'right' : i === a ? 'wrong' : '') : ''}" data-o="${i}" ${a !== undefined ? 'disabled' : ''}><span class="lt">${'ABCD'[i]}</span><code>${esc(o)}</code></button>`).join('')}</div>
        <div id="explain">${a !== undefined ? explainHTML(st, a) : ''}</div>`;
    } else if (st.k === 'task'){
      html = `<div class="kind task">Your turn · on your laptop</div><h2>Type it. Run it. No AI help.</h2><div class="body"><p>${esc(st.b)}</p></div>${codeBlock(st.code)}<div class="note">Close this page while you type. Then compare. If you needed to look, do it again tomorrow.</div>`;
    } else if (st.k === 'summary'){
      const on = !!S.done[cur], nx = L[cur + 1] ? cur + 1 : null;
      html = `<div class="kind read">Summary</div><h2>Remember these</h2><div class="terms">${c.sum.map(t => `<div class="term"><b>${esc(t[0])}</b><span>${esc(t[1])}</span></div>`).join('')}</div>
        <div class="master ${on ? 'on' : ''}" id="masterBox"><p>${on ? '<b>Learned from memory.</b> This lesson counts in your progress.' : 'Can you write the coding task from memory, without looking? Only then mark it.'}</p><button class="btn ${on ? 'btn-ghost' : 'btn-amber'}" id="masterBtn">${on ? 'Unmark' : '✓ I can write it from memory'}</button></div>
        ${nx ? `<div style="margin-top:18px"><button class="btn btn-ink" id="nextLesson">Next: Lesson ${nx}, ${esc(L[nx].t)} →</button></div>` : '<p class="body" style="margin-top:18px">This is the last lesson in your notes. Next: Phase VI, engineering practices.</p>'}`;
    }
    stage.innerHTML = `<div class="card">${html}</div>`;
    $('#lScroll').scrollTop = 0;

    // wire
    $$('[data-copy]', stage).forEach(b => b.onclick = () => {
      const txt = document.getElementById(b.dataset.copy).textContent;
      const done = () => { b.textContent = 'Copied'; setTimeout(() => b.textContent = 'Copy', 1300); };
      try { navigator.clipboard.writeText(txt).then(done, () => selectText(b.dataset.copy)); } catch(e){ selectText(b.dataset.copy); }
    });
    if (st.k === 'lab'){ try { const r = W[st.w]($('#wmount')); if (typeof r === 'function') cleanup = r; } catch(e){ $('#wmount').innerHTML = `<div class="note">This lab could not start: ${esc(e.message)}</div>`; console.error(e); } }
    if (st.k === 'predict'){
      $$('.opt', stage).forEach(b => b.onclick = () => {
        const i = +b.dataset.o; answered[idx] = i;
        $$('.opt', stage).forEach((x, j) => { x.disabled = true; if (j === st.a) x.classList.add('right'); else if (j === i) x.classList.add('wrong'); });
        $('#explain').innerHTML = explainHTML(st, i); updateNav();
      });
    }
    { const tn = $('#toNotes'); if (tn) tn.onclick = () => openNotes(cur); }
    if (st.k === 'summary'){
      $('#masterBtn').onclick = () => { S.done[cur] = !S.done[cur]; if (!S.done[cur]) delete S.done[cur]; save(); if (S.done[cur]) toast(`Lesson ${cur} marked as learned`); renderStep(); };
      const nb = $('#nextLesson'); if (nb) nb.onclick = () => openLesson(cur + 1, 0);
    }
    updateNav();
  }
  function explainHTML(st, i){ const ok = i === st.a; return `<div class="explain ${ok ? '' : 'no'}"><b>${ok ? 'Correct.' : 'Not quite. The answer is ' + 'ABCD'[st.a] + '.'}</b>${esc(st.x)}</div>`; }
  function selectText(id){ const r = document.createRange(); r.selectNodeContents(document.getElementById(id)); const s = getSelection(); s.removeAllRanges(); s.addRange(r); }
  function updateNav(){
    if (mode === 'notes'){
      const pv = noteNeighbour(-1), nx = noteNeighbour(1);
      $('#lCount').innerHTML = (isChKey(noteKey) ? `Lesson ${noteKey} notes` : `Appendix ${noteKey}`) + ' <span class="kbd">←</span> <span class="kbd">→</span>';
      $('#lPrev').disabled = !pv; $('#lPrev').textContent = '← ' + (pv ? (isChKey(pv) ? 'Lesson ' + pv : 'Appendix ' + pv) : 'Back');
      $('#lNext').textContent = nx ? (isChKey(nx) ? 'Lesson ' + nx : 'Appendix ' + nx) + ' →' : 'Back to roadmap';
      return;
    }
    $('#lPrev').textContent = '← Back';
    const steps = stepsOf(cur), st = steps[idx];
    $('#lCount').innerHTML = `Step ${idx + 1} / ${steps.length} <span class="kbd">←</span> <span class="kbd">→</span>`;
    $('#lPrev').disabled = idx === 0;
    const last = idx === steps.length - 1;
    $('#lNext').textContent = last ? 'Back to roadmap' : (st.k === 'predict' && answered[idx] === undefined) ? 'Skip →' : (st.k === 'intro' ? 'Start →' : 'Next →');
  }
  $('#lPrev').onclick = () => { if (mode === 'notes') { const k = noteNeighbour(-1); if (k) openNotes(k); return; } if (idx > 0) { idx--; renderStep(); } };
  $('#lNext').onclick = () => { if (mode === 'notes') { const k = noteNeighbour(1); if (k) openNotes(k); else closeLesson(); return; } if (idx < stepsOf(cur).length - 1) { idx++; renderStep(); } else closeLesson(); };
  $('#lClose').onclick = closeLesson;
  const onKey = e => {
    if ($('#lesson').hidden) return;
    const tag = (e.target.tagName || '').toLowerCase();
    if (tag === 'input' || tag === 'textarea' || tag === 'select') return;
    if (e.key === 'ArrowRight') { e.preventDefault(); $('#lNext').click(); }
    else if (e.key === 'ArrowLeft') { e.preventDefault(); $('#lPrev').click(); }
    else if (e.key === 'Escape') closeLesson();
    else if ($('.opt') && /^[a-dA-D1-4]$/.test(e.key)) { const i = /\d/.test(e.key) ? +e.key - 1 : 'abcd'.indexOf(e.key.toLowerCase()); const b = $$('.opt')[i]; if (b && !b.disabled) b.click(); }
  };
  document.addEventListener('keydown', onKey);
  function fromHash(){
    const nm = location.hash.match(/^#notes-(\d+|[ABC])$/);
    if (nm) { if (noteKey !== nm[1] || $('#lesson').hidden) openNotes(nm[1]); return; }
    const m = location.hash.match(/^#lesson-(\d+)$/);
    if (m && L[+m[1]]) { if (cur !== +m[1] || $('#lesson').hidden) openLesson(+m[1], S.seen[+m[1]] || 0); }
    else if (!$('#lesson').hidden) closeLesson();
  }
  window.addEventListener('hashchange', fromHash);


  /* ============ full notes ============ */
  const NOTES = notes;
  let mode = 'learn', noteKey = null;
  const isChKey = k => /^\d+$/.test(String(k));
  const APP_ORDER = ['A', 'B', 'C'];
  if (!S.gaps) S.gaps = {};

  function setMode(m){
    mode = m;
    $$('#lMode button').forEach(b => b.setAttribute('aria-selected', b.dataset.m === m));
    $('#lSegs').hidden = m === 'notes';
    $('#lStage').classList.toggle('notes-stage', m === 'notes');
  }
  function openNotes(key){
    if (cleanup) { try { cleanup(); } catch(e){} cleanup = null; }
    key = String(key); noteKey = key;
    const ch = isChKey(key), d = ch ? NOTES.chapters[key] : NOTES.appendix[key];
    if (!d) return;
    if (ch) { cur = +key; S.last = cur; save(); }
    $('#lesson').hidden = false; document.body.style.overflow = 'hidden';
    setMode('notes');
    $('#lMode').hidden = !ch;
    if (ch){ const p = partOf(cur); $('#lWhere').textContent = `Part ${p.roman} · ${p.title} · Lesson ${cur} · Full notes`; $('#lTitle').textContent = L[cur].t; }
    else { $('#lWhere').textContent = `Appendix ${key} · Full notes`; $('#lTitle').textContent = d.title; }
    if (location.hash !== '#notes-' + key) history.replaceState(null, '', '#notes-' + key);

    const toc = d.toc.map(([id, t]) => `<button data-to="n-${esc(id)}">${esc(t)}</button>`).join('');
    const head = ch
      ? `<div class="nhead"><span class="kind read" style="margin:0">Lesson ${cur} · full notes</span>${hasLab(cur) ? '<span class="pill lab">HAS AN INTERACTIVE LAB</span>' : ''}</div><h2>${esc(L[cur].t)}</h2>`
      : `<div class="nhead"><span class="kind read" style="margin:0">Appendix ${key}</span></div><h2>${esc(d.title)}</h2>`;
    const nextK = noteNeighbour(1);
    const end = ch
      ? `<div class="notes-end"><button class="btn btn-amber" id="nToLearn">Practise lesson ${cur} interactively →</button>${nextK ? `<button class="btn btn-ghost" id="nToNext">${isChKey(nextK) ? 'Notes for lesson ' + nextK : 'Appendix ' + nextK} →</button>` : ''}</div>`
      : (nextK ? `<div class="notes-end"><button class="btn btn-ghost" id="nToNext">Appendix ${nextK} →</button></div>` : '');
    const stage = $('#lStage');
    stage.classList.remove('wide');
    stage.innerHTML = `<div class="card nwrap">
      <nav class="ntoc" aria-label="In these notes"><div class="eyebrow">In these notes</div>${toc}</nav>
      <article class="notes">${head}
        ${toc ? `<details class="ntoc-m"><summary>Jump to a section (${d.toc.length})</summary><nav class="ntoc" aria-label="Sections">${toc}</nav></details>` : ''}
        ${d.html}${end}</article></div>`;
    $('#lScroll').scrollTop = 0;

    $$('.code[data-hl="1"] pre', stage).forEach(pre => { pre.innerHTML = hlPy(pre.textContent); });
    $$('.code [data-copy]', stage).forEach(b => b.onclick = () => {
      const pre = b.closest('.code').querySelector('pre');
      const ok = () => { b.textContent = 'Copied'; setTimeout(() => b.textContent = 'Copy', 1300); };
      const sel = () => { const r = document.createRange(); r.selectNodeContents(pre); const s = getSelection(); s.removeAllRanges(); s.addRange(r); };
      try { navigator.clipboard.writeText(pre.textContent).then(ok, sel); } catch(e){ sel(); }
    });
    $$('[data-to]', stage).forEach(b => b.onclick = () => {
      const t = document.getElementById(b.dataset.to); if (!t) return;
      t.scrollIntoView({behavior: reduced() ? 'auto' : 'smooth', block: 'start'});
      const m = b.closest('details'); if (m) m.open = false;
    });
    if (key === 'B') wireChecklist(stage);
    const tl = $('#nToLearn'); if (tl) tl.onclick = () => openLesson(cur, S.seen[cur] || 0);
    const tn = $('#nToNext'); if (tn) tn.onclick = () => openNotes(nextK);
    updateNav();
  }
  function noteNeighbour(dir){
    if (isChKey(noteKey)){
      const n = +noteKey + dir;
      if (NOTES.chapters[n]) return String(n);
      return dir > 0 ? 'A' : null;
    }
    const i = APP_ORDER.indexOf(noteKey) + dir;
    if (i < 0) return String(Math.max(...Object.keys(NOTES.chapters).map(Number)));
    return APP_ORDER[i] || null;
  }
  function wireChecklist(stage){
    $$('table.cmp tbody tr', stage).forEach(tr => {
      const tds = tr.children; if (tds.length < 3 || tds[0].textContent.trim() !== '☐') return;
      const last = tds[tds.length - 1], n = parseInt(last.textContent, 10);
      const box = document.createElement('input'); box.type = 'checkbox';
      if (n && L[n]){
        box.checked = !!S.done[n]; box.setAttribute('aria-label', 'Learned: lesson ' + n);
        box.onchange = () => { if (box.checked) S.done[n] = true; else delete S.done[n]; save(); toast(box.checked ? `Lesson ${n} marked as learned` : `Lesson ${n} unmarked`); };
        last.innerHTML = `<button data-open="${n}">Lesson ${n} →</button>`;
        last.firstChild.onclick = () => openLesson(n, S.seen[n] || 0);
      } else {
        const k = tds[1].textContent.trim().slice(0, 40);
        box.checked = !!S.gaps[k]; box.setAttribute('aria-label', 'Done: ' + k);
        box.onchange = () => { S.gaps[k] = box.checked; save(); };
      }
      tds[0].textContent = ''; tds[0].append(box);
    });
  }
  $$('#lMode button').forEach(b => b.onclick = () => {
    if (b.dataset.m === mode) return;
    if (b.dataset.m === 'notes') openNotes(cur); else openLesson(cur, S.seen[cur] || 0);
  });
  $$('#home [data-notes]').forEach(b => b.onclick = () => openNotes(b.dataset.notes));

  renderHome();
  fromHash();

  return () => {
    document.removeEventListener('keydown', onKey);
    window.removeEventListener('hashchange', fromHash);
    document.body.style.overflow = '';
    root.querySelectorAll('.toast').forEach(t => t.remove());
  };
}
