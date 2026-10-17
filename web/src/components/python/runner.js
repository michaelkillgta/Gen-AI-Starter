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
export function mountRunner(el, { example, key }){
  const draftKey = 'ft_py_draft_' + key;
  let draft = '';
  try { draft = localStorage.getItem(draftKey) || ''; } catch (e) {}
  const notes = limits(example);
  const wantsInput = /\binput\s*\(/.test(example);
  el.innerHTML = `<div class="run">
    <div class="run-h"><span class="eyebrow">Try it here · real Python in your browser</span><span class="mini run-keys">Ctrl + Enter to run</span></div>
    <textarea class="run-ed" spellcheck="false" autocapitalize="off" autocomplete="off" aria-label="Your Python code" placeholder="Type the code here, without copying. Then press Run."></textarea>
    ${wantsInput ? '<textarea class="run-in" rows="2" spellcheck="false" aria-label="Program input, one line per input() call" placeholder="Input for input(), one line each"></textarea>' : ''}
    <div class="run-bar">
      <button class="btn btn-ink run-go">▶ Run</button>
      <button class="btn btn-ghost run-clear">Clear</button>
      <button class="run-peek">Stuck? Paste the example</button>
      <span class="mini run-state" aria-live="polite"></span>
    </div>
    ${notes.map(n => `<p class="run-note">${esc(n)}</p>`).join('')}
    <pre class="run-out" aria-live="polite" aria-label="Output"><span class="run-dim"># output appears here</span></pre>
  </div>`;
  const ed = el.querySelector('.run-ed'), out = el.querySelector('.run-out'), state = el.querySelector('.run-state'), go = el.querySelector('.run-go');
  const input = el.querySelector('.run-in');
  ed.value = draft;
  let running = false, timer = null, myId = 0;

  const save = () => { try { localStorage.setItem(draftKey, ed.value); } catch (e) {} };
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
    go.disabled = false; go.textContent = '▶ Run'; state.textContent = msg || '';
  };

  function run(){
    if (running) return;
    const code = ed.value;
    if (!code.trim()){ out.innerHTML = '<span class="run-dim"># type some code first</span>'; return; }
    running = true; go.disabled = true; go.textContent = 'Running...';
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
  el.querySelector('.run-clear').onclick = () => { ed.value = ''; save(); out.innerHTML = '<span class="run-dim"># output appears here</span>'; state.textContent = ''; ed.focus(); };
  el.querySelector('.run-peek').onclick = () => { ed.value = example; save(); ed.focus(); };

  // Leaving the step stops a running program.
  return () => { if (running){ killWorker(); } handlers.delete(myId); clearTimeout(timer); };
}
