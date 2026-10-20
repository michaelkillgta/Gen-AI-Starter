/* eslint-disable */
// @ts-nocheck
/*
 * In-browser Python runner for the "Your turn" step. Real CPython (Pyodide,
 * WebAssembly) runs in a Web Worker in the visitor's browser: no server work.
 * Pyodide downloads only when someone presses Run for the first time.
 */
import { esc } from "./widgets";

const PYODIDE = 'https://cdn.jsdelivr.net/pyodide/v0.27.7/full/';
const TIMEOUT_MS = 10000;
// Pure-Python packages that are not in the Pyodide build, installed from PyPI on first use.
const PYPI = {dotenv: 'python-dotenv', tenacity: 'tenacity'};

const WORKER_SRC = `
let py = null;
const PYPI = ${JSON.stringify(PYPI)};
async function init(){
  importScripts(${JSON.stringify(PYODIDE)} + 'pyodide.js');
  py = await loadPyodide({ indexURL: ${JSON.stringify(PYODIDE)} });
}
onmessage = async (e) => {
  const { id, code, stdin } = e.data;
  const post = (type, text) => postMessage({ id, type, text });
  try {
    if (!py){ post('status', 'Loading Python in your browser (first run only)...'); await init(); }
    py.setStdout({ batched: s => post('out', s + '\\n') });
    py.setStderr({ batched: s => post('err', s + '\\n') });
    const lines = (stdin || '').split('\\n'); let i = 0;
    py.setStdin({ stdin: () => i < lines.length ? lines[i++] : undefined });
    post('status', 'Getting packages...');
    const quiet = { messageCallback: m => post('status', m), errorCallback: m => post('status', m) };
    await py.loadPackagesFromImports(code, quiet);
    const imports = py.pyimport('pyodide.code').find_imports(code).toJs();
    const extra = imports.filter(m => PYPI[m]);
    if (extra.length){
      await py.loadPackage('micropip', quiet);
      const micropip = py.pyimport('micropip');
      for (const m of extra){ try { await micropip.install(PYPI[m]); } catch (err) {} }
    }
    post('running', '');
    const t0 = performance.now();
    const globals = py.globals.get('dict')();
    await py.runPythonAsync(code, { globals });
    globals.destroy();
    postMessage({ id, type: 'done', ms: Math.round(performance.now() - t0) });
  } catch (err) {
    let msg = String(err && err.message || err);
    // Keep the part of the traceback that points at the learner's code.
    const k = msg.indexOf('File "<exec>"');
    if (k > 0) msg = 'Traceback (most recent call last):\\n  ' + msg.slice(k);
    post('error', msg);
  }
};`;

let worker = null, nextId = 1;
const handlers = new Map();
function getWorker(){
  if (worker) return worker;
  const url = URL.createObjectURL(new Blob([WORKER_SRC], { type: 'text/javascript' }));
  worker = new Worker(url);
  worker.onmessage = e => { const h = handlers.get(e.data.id); if (h) h(e.data); };
  return worker;
}
function killWorker(){ if (worker){ worker.terminate(); worker = null; } handlers.clear(); }

/** Notes for code that cannot fully run in a browser. */
function limits(code){
  const out = [];
  if (/\b(requests|httpx|urllib\.request|aiohttp)\b/.test(code)) out.push('Network calls are blocked in the browser runner. The rest of the code runs, but run the HTTP part on your laptop.');
  if (/\binput\s*\(/.test(code)) out.push('This code reads input. Type the input lines in the box below the editor.');
  if (/\bopen\s*\(|Path\(|read_text|load_dotenv/.test(code)) out.push('The browser has its own empty folder. Create the file first in your code (for example with Path("notes.txt").write_text("hi")), or run it on your laptop.');
  if (/asyncio\.run\s*\(/.test(code)) out.push('In the browser, use "await main()" at the top level instead of asyncio.run(main()).');
  return out;
}

/**
 * Mounts a runner into `el`.
 *  - Your turn (default): empty editor on the left, output on the right; the draft
 *    is kept per lesson (`key`). `example` is only pasted in on request.
 *  - inline: true: lives inside a code block in place of its <pre>. The editor is
 *    prefilled with the example; Run, Reset and Close sit in the block header.
 * Returns a cleanup function with .run() and .reset() attached.
 */
export function mountRunner(el, { example, key, inline = false, autorun = false, onState = null }){
  const draftKey = 'ft_py_draft_' + key;
  let draft = '';
  if (inline) draft = example;
  else try { draft = localStorage.getItem(draftKey) || ''; } catch (e) {}
  const notes = limits(example);
  const wantsInput = /\binput\s*\(/.test(example);
  const DIM = inline ? '# press Run to see the output' : '# output appears here';
  el.innerHTML = `<div class="run ${inline ? 'run-in-block' : ''}">
    ${inline ? '' : '<div class="run-h"><span class="eyebrow">Try it here · real Python in your browser</span><span class="mini run-keys">Ctrl + Enter to run</span></div>'}
    <div class="run-split">
      <div class="run-left">
        <textarea class="run-ed" wrap="soft" spellcheck="false" autocapitalize="off" autocomplete="off" aria-label="Python code" ${inline ? '' : 'placeholder="Type the code here, without copying. Then press Run."'}></textarea>
        ${wantsInput ? '<textarea class="run-in" rows="2" spellcheck="false" aria-label="Program input, one line per input() call" placeholder="Input for input(), one line each"></textarea>' : ''}
        ${inline ? '' : `<div class="run-bar">
          <button class="btn btn-ink run-go">▶ Run</button>
          <button class="btn btn-ghost run-clear">Clear</button>
          <button class="run-peek">Stuck? Paste the example</button>
        </div>`}
      </div>
      <div class="run-right">
        <div class="run-oh"><span>Output</span><span class="run-state" aria-live="polite"></span></div>
        <pre class="run-out" aria-live="polite" aria-label="Output"><span class="run-dim">${DIM}</span></pre>
      </div>
    </div>
    ${notes.map(n => `<p class="run-note">${esc(n)}</p>`).join('')}
  </div>`;
  const ed = el.querySelector('.run-ed'), out = el.querySelector('.run-out'), state = el.querySelector('.run-state'), go = el.querySelector('.run-go');
  const input = el.querySelector('.run-in');
  ed.value = draft;
  let running = false, timer = null, myId = 0;

  // The editor grows with its content (long lines wrap), so there is never a scrollbar inside it.
  const fit = () => {
    ed.style.height = 'auto';
    const line = parseFloat(getComputedStyle(ed).lineHeight) || 22;
    const min = (inline ? 2 : 8) * line + 26;
    ed.style.height = Math.min(Math.max(min, ed.scrollHeight + 2), 28 * line + 26) + 'px';
  };
  const save = () => { fit(); if (inline) return; try { localStorage.setItem(draftKey, ed.value); } catch (e) {} };
  ed.addEventListener('input', save);
  ed.addEventListener('keydown', e => {
    e.stopPropagation(); // keep lesson arrow-key shortcuts out of the editor
    if (e.key === 'Tab'){
      e.preventDefault();
      const s = ed.selectionStart, t = ed.selectionEnd;
      ed.value = ed.value.slice(0, s) + '    ' + ed.value.slice(t);
      ed.selectionStart = ed.selectionEnd = s + 4; save();
    } else if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)){ e.preventDefault(); run(); }
    else if (e.key === 'Enter'){
      // keep the indentation of the current line, and indent after a colon
      e.preventDefault();
      const s = ed.selectionStart, line = ed.value.slice(0, s).split('\n').pop();
      let ind = (line.match(/^\s*/) || [''])[0];
      if (/:\s*$/.test(line)) ind += '    ';
      ed.value = ed.value.slice(0, s) + '\n' + ind + ed.value.slice(ed.selectionEnd);
      ed.selectionStart = ed.selectionEnd = s + 1 + ind.length; save();
    }
  });
  if (input) input.addEventListener('keydown', e => e.stopPropagation());

  const write = (text, cls) => {
    if (out.querySelector('.run-dim')) out.innerHTML = '';
    out.insertAdjacentHTML('beforeend', cls ? `<span class="${cls}">${esc(text)}</span>` : esc(text));
    out.scrollTop = out.scrollHeight;
  };
  const finish = msg => {
    running = false; clearTimeout(timer); handlers.delete(myId);
    if (go){ go.disabled = false; go.textContent = '▶ Run'; }
    state.textContent = msg || ''; if (onState) onState('idle');
  };

  function run(){
    if (running) return;
    const code = ed.value;
    if (!code.trim()){ out.innerHTML = '<span class="run-dim"># type some code first</span>'; return; }
    running = true; if (go){ go.disabled = true; go.textContent = 'Running...'; } if (onState) onState('running');
    out.innerHTML = ''; state.textContent = 'Starting...'; myId = nextId++;
    handlers.set(myId, m => {
      if (m.type === 'status') state.textContent = m.text;
      else if (m.type === 'running'){ state.textContent = 'Running...'; timer = setTimeout(() => { killWorker(); write('\nStopped after 10 seconds. Is there a loop that never ends?\n', 'run-err'); finish('Stopped'); }, TIMEOUT_MS); }
      else if (m.type === 'out') write(m.text);
      else if (m.type === 'err') write(m.text, 'run-err');
      else if (m.type === 'error'){ write(m.text, 'run-err'); finish('Error'); }
      else if (m.type === 'done'){ if (!out.textContent) write('(no output)', 'run-dim'); finish(`Done · ${m.ms} ms`); }
    });
    try { getWorker().postMessage({ id: myId, code, stdin: input ? input.value : '' }); }
    catch (e) { write('Could not start Python in this browser: ' + e.message, 'run-err'); finish(''); }
  }
  const reset = () => { ed.value = inline ? example : ''; save(); out.innerHTML = `<span class="run-dim">${DIM}</span>`; state.textContent = ''; ed.focus(); };
  if (go) go.onclick = run;
  const clear = el.querySelector('.run-clear'); if (clear) clear.onclick = reset;
  const peek = el.querySelector('.run-peek');
  if (peek) peek.onclick = () => { ed.value = example; save(); ed.focus(); };
  fit();
  // Re-fit when the width changes (wrapping changes the height).
  let lastW = 0;
  const ro = new ResizeObserver(() => { if (ed.clientWidth !== lastW){ lastW = ed.clientWidth; fit(); } });
  ro.observe(ed);
  if (autorun) run();

  // Leaving the step stops a running program.
  const cleanup = () => { ro.disconnect(); if (running){ killWorker(); } handlers.delete(myId); clearTimeout(timer); };
  cleanup.run = run; cleanup.reset = reset;
  return cleanup;
}

/** A fragment, shell command or data sample: not worth a Run button. */
const notRunnable = code => {
  const lines = code.split('\n');
  return !code.trim() || /^[ \t]/.test(code) || /:\s*$/.test(lines[lines.length - 1]) || /^\s*(\$|pip |>>>|\{|\[)/.test(code) || code.includes('…');
};

const ICON_PLAY = '<svg width="11" height="11" viewBox="0 0 12 12" aria-hidden="true"><path d="M3 1.6v8.8a.6.6 0 0 0 .9.5l7-4.4a.6.6 0 0 0 0-1L3.9 1.1a.6.6 0 0 0-.9.5z" fill="currentColor"/></svg>';
const ICON_SPIN = '<svg class="run-spin" width="12" height="12" viewBox="0 0 12 12" aria-hidden="true"><circle cx="6" cy="6" r="4.5" fill="none" stroke="currentColor" stroke-width="1.8" stroke-dasharray="18 10" stroke-linecap="round"/></svg>';
const ICON_RESET = '<svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M2.5 8a5.5 5.5 0 1 0 1.7-4"/><path d="M2.5 2.5V5H5"/></svg>';
const ICON_CLOSE = '<svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><path d="M4 4l8 8M12 4l-8 8"/></svg>';
const ICON_COPY = '<svg class="i-copy" width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><rect x="5" y="5" width="8.5" height="9" rx="1.6"/><path d="M10.5 5V3.6A1.6 1.6 0 0 0 8.9 2H4.1A1.6 1.6 0 0 0 2.5 3.6v6.3A1.6 1.6 0 0 0 4.1 11.5H5"/></svg><svg class="i-ok" width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 8.5l3.2 3L13 4.5"/></svg>';

/** Turns a text "Copy" button into an icon button (course.js toggles .copied). */
function iconCopy(b){
  if (b.dataset.icon) return;
  b.dataset.icon = '1';
  b.classList.add('copy-btn');
  b.innerHTML = ICON_COPY;
  b.setAttribute('aria-label', 'Copy code'); b.title = 'Copy';
}

/** Adds a Run button (and an icon Copy button) to every Python code block in `root`. */
export function attachRunButtons(root){
  root.querySelectorAll('.code .chead [data-copy]').forEach(iconCopy);
  root.querySelectorAll('.code:not(.out)').forEach(block => {
    if (block.dataset.hl === '0' || block.dataset.run) return;
    const pre = block.querySelector('pre'), head = block.querySelector('.chead');
    if (!pre || !head) return;
    const code = pre.textContent.replace(/\s+$/, '');
    if (notRunnable(code)) return;
    block.dataset.run = '1';
    const btn = document.createElement('button');
    btn.className = 'run-btn';
    btn.setAttribute('aria-label', 'Run this code');
    const idle = () => { btn.innerHTML = ICON_PLAY + '<span>Run</span>'; btn.classList.remove('busy'); };
    const busy = () => { btn.innerHTML = ICON_SPIN + '<span>Running</span>'; btn.classList.add('busy'); };
    idle();
    const copy = head.querySelector('[data-copy]');
    // Predict headers say "run it in your head"; once answered, the Run button replaces that hint.
    if (!copy) head.querySelectorAll(':scope > span').forEach((sp, k) => { if (k > 0) sp.remove(); });
    if (copy) head.insertBefore(btn, copy); else head.append(btn);
    let host = null, api = null, extra = [];
    const iconBtn = (cls, label, svg) => { const b = document.createElement('button'); b.className = 'copy-btn ' + cls; b.title = label; b.setAttribute('aria-label', label); b.innerHTML = svg; head.append(b); extra.push(b); return b; };
    const close = () => { if (api) api(); host.remove(); host = null; api = null; pre.hidden = false; extra.forEach(b => b.remove()); extra = []; block.classList.remove('running-open'); idle(); };
    btn.onclick = () => {
      if (btn.classList.contains('busy')) return;
      if (host){ api.run(); return; }
      // Open in place: the code becomes editable on the left, output on the right.
      host = document.createElement('div');
      host.className = 'run-host';
      pre.hidden = true; pre.after(host);
      block.classList.add('running-open');
      api = mountRunner(host, { example: code, key: 'inline', inline: true, autorun: true, onState: st => (st === 'running' ? busy() : idle()) });
      iconBtn('run-reset', 'Reset to the original code', ICON_RESET).onclick = () => api.reset();
      iconBtn('run-close', 'Close the editor', ICON_CLOSE).onclick = close;
    };
  });
}
