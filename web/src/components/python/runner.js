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
 * Mounts the editor into `el`. `example` is the lesson snippet (shown above, not
 * pre-filled), `key` keeps each lesson's draft in this browser.
 */
export function mountRunner(el, { example, key, prefill = false, autorun = false, onState = null, onClose = null }){
  const draftKey = 'ft_py_draft_' + key;
  let draft = '';
  if (prefill) draft = example;
  else try { draft = localStorage.getItem(draftKey) || ''; } catch (e) {}
  const notes = limits(example);
  const wantsInput = /\binput\s*\(/.test(example);
  el.innerHTML = `<div class="run">
    <div class="run-h"><span class="eyebrow">${prefill ? 'Edit and run this example' : 'Try it here · real Python in your browser'}</span><span class="run-hr"><span class="mini run-keys">Ctrl + Enter to run</span>${onClose ? '<button class="run-x" aria-label="Close the runner" title="Close">×</button>' : ''}</span></div>
    <textarea class="run-ed" spellcheck="false" autocapitalize="off" autocomplete="off" aria-label="Your Python code" placeholder="Type the code here, without copying. Then press Run."></textarea>
    ${wantsInput ? '<textarea class="run-in" rows="2" spellcheck="false" aria-label="Program input, one line per input() call" placeholder="Input for input(), one line each"></textarea>' : ''}
    <div class="run-bar">
      <button class="btn btn-ink run-go">▶ Run</button>
      <button class="btn btn-ghost run-clear">${prefill ? 'Reset' : 'Clear'}</button>
      ${prefill ? '' : '<button class="run-peek">Stuck? Paste the example</button>'}
      <span class="mini run-state" aria-live="polite"></span>
    </div>
    ${notes.map(n => `<p class="run-note">${esc(n)}</p>`).join('')}
    <pre class="run-out" aria-live="polite" aria-label="Output"><span class="run-dim"># output appears here</span></pre>
  </div>`;
  const ed = el.querySelector('.run-ed'), out = el.querySelector('.run-out'), state = el.querySelector('.run-state'), go = el.querySelector('.run-go');
  const input = el.querySelector('.run-in');
  ed.value = draft;
  let running = false, timer = null, myId = 0;

  const save = () => { if (prefill) return; try { localStorage.setItem(draftKey, ed.value); } catch (e) {} };
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
    go.disabled = false; go.textContent = '▶ Run'; state.textContent = msg || ''; if (onState) onState('idle');
  };

  function run(){
    if (running) return;
    const code = ed.value;
    if (!code.trim()){ out.innerHTML = '<span class="run-dim"># type some code first</span>'; return; }
    running = true; go.disabled = true; go.textContent = 'Running...'; if (onState) onState('running');
    out.innerHTML = ''; state.textContent = 'Starting...'; myId = nextId++;
    handlers.set(myId, m => {
      if (m.type === 'status') state.textContent = m.text;
      else if (m.type === 'running'){ state.textContent = 'Running...'; timer = setTimeout(() => { killWorker(); write('\nStopped after 10 seconds. Is there a loop that never ends?\n', 'run-err'); finish('Stopped'); }, TIMEOUT_MS); }
      else if (m.type === 'out') write(m.text);
      else if (m.type === 'err') write(m.text, 'run-err');
      else if (m.type === 'error'){ write(m.text, 'run-err'); finish('Finished with an error'); }
      else if (m.type === 'done'){ if (!out.textContent) write('(no output)', 'run-dim'); finish(`Done in ${m.ms} ms`); }
    });
    try { getWorker().postMessage({ id: myId, code, stdin: input ? input.value : '' }); }
    catch (e) { write('Could not start Python in this browser: ' + e.message, 'run-err'); finish(''); }
  }
  go.onclick = run;
  el.querySelector('.run-clear').onclick = () => { ed.value = prefill ? example : ''; save(); out.innerHTML = '<span class="run-dim"># output appears here</span>'; state.textContent = ''; ed.focus(); };
  const peek = el.querySelector('.run-peek');
  if (peek) peek.onclick = () => { ed.value = example; save(); ed.focus(); };
  if (prefill) ed.rows = Math.min(18, Math.max(4, example.split('\n').length + 1));
  if (onClose) el.querySelector('.run-x').onclick = onClose;
  el.runNow = run;
  if (autorun) run();

  // Leaving the step stops a running program.
  return () => { if (running){ killWorker(); } handlers.delete(myId); clearTimeout(timer); };
}

/** A fragment, shell command or data sample: not worth a Run button. */
const notRunnable = code => {
  const lines = code.split('\n');
  return !code.trim() || /^[ \t]/.test(code) || /:\s*$/.test(lines[lines.length - 1]) || /^\s*(\$|pip |>>>|\{|\[)/.test(code) || code.includes('…');
};

const ICON_PLAY = '<svg width="11" height="11" viewBox="0 0 12 12" aria-hidden="true"><path d="M3 1.6v8.8a.6.6 0 0 0 .9.5l7-4.4a.6.6 0 0 0 0-1L3.9 1.1a.6.6 0 0 0-.9.5z" fill="currentColor"/></svg>';
const ICON_SPIN = '<svg class="run-spin" width="12" height="12" viewBox="0 0 12 12" aria-hidden="true"><circle cx="6" cy="6" r="4.5" fill="none" stroke="currentColor" stroke-width="1.8" stroke-dasharray="18 10" stroke-linecap="round"/></svg>';
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
    let box = null;
    const close = () => { if (box){ box.remove(); box = null; } idle(); };
    btn.onclick = () => {
      if (btn.classList.contains('busy')) return;
      if (box){ box.runNow(); return; }
      box = document.createElement('div');
      box.className = 'run-inline';
      const next = block.nextElementSibling;
      (next && next.classList.contains('out') ? next : block).after(box);
      mountRunner(box, { example: code, key: 'inline', prefill: true, autorun: true, onClose: close, onState: s => (s === 'running' ? busy() : idle()) });
    };
  });
}
