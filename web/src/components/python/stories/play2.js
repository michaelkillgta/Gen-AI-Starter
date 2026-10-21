/* eslint-disable */
// @ts-nocheck
/*
 * Parts VI and VII hands-on activities: a different mechanic per lesson (39-46).
 * Plain DOM, no libraries. Loaded only when a lesson reaches its activity.
 */
import { esc, hlPy } from "../widgets";
import "./play.css";
import "./play2.css";

const q = (s, r) => r.querySelector(s);
const qa = (s, r) => [...r.querySelectorAll(s)];
const reduced = () => window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
const shake = n => { if (!n) return; n.classList.remove('pl-shake'); void n.offsetWidth; n.classList.add('pl-shake'); };

function shell(el, title, intro, body){
  el.innerHTML = `<div class="wg pl"><div class="wg-h"><span class="eyebrow">Activity · ${esc(title)}</span><span class="mini pl-score"></span></div>
    <p class="pl-intro">${intro}</p>${body}</div>`;
  return q('.pl', el);
}

/* ======================= 39 · Hall door: predict what prints ======================= */
function lesson39(el){
  const CASES = [
    {name: 'Normal exam', body: 'print("exam starts")', ret: 'nothing', lines: ['unlock', 'exam starts', 'lock', 'after the with'],
     qs: [['Does "lock" print?', true, '__exit__ always runs when the block ends.'], ['Does "after the with" print?', true, 'No error, so the program carries on.']]},
    {name: 'Fire alarm', body: 'print("exam starts")\nraise RuntimeError("fire alarm")', ret: 'nothing', lines: ['unlock', 'exam starts', 'lock', 'RuntimeError: fire alarm'],
     qs: [['Does "lock" print?', true, '__exit__ runs on the way out, even with an error.'], ['Does "after the with" print?', false, '__exit__ returned nothing, so the error keeps going and the program stops.']]},
    {name: 'Fire alarm, handled', body: 'print("exam starts")\nraise RuntimeError("fire alarm")', ret: 'True', lines: ['unlock', 'exam starts', 'lock', 'after the with'],
     qs: [['Does "lock" print?', true, '__exit__ always runs.'], ['Does "after the with" print?', true, '__exit__ returned True, which swallows the error.']]},
  ];
  let c = 0, k = 0, ok = 0, answered = 0;
  const root = shell(el, 'Hall door', 'Priya\'s exam hall is a context manager. Pick a scenario, read the code, then predict what prints. The door shows when Python locks the hall.',
    `<div class="pl-row pl2-cases"></div>
     <div class="pl-cols"><pre class="term-out pl2-src"></pre><div><div class="pl2-door"><div class="pl2-leaf"></div><span class="pl2-dl">Hall B</span></div><div class="pl2-qs"></div></div></div>
     <pre class="term-out pl2-out"></pre><p class="pl-fb" aria-live="polite"></p>`);
  const src = cs => `class ExamHall:\n    def __enter__(self):\n        print("unlock")\n    def __exit__(self, exc_type, exc, tb):\n        print("lock")\n        return ${cs.ret === 'True' ? 'True' : 'None'}\n\nwith ExamHall():\n${cs.body.split('\n').map(l => '    ' + l).join('\n')}\nprint("after the with")`;
  const door = st => { const d = q('.pl2-door', root); d.dataset.st = st; q('.pl2-dl', root).textContent = st === 'open' ? 'Hall B · open' : 'Hall B · locked'; };
  const draw = () => {
    const cs = CASES[c];
    q('.pl2-cases', root).innerHTML = CASES.map((x, i) => `<button class="chipb ${i === c ? 'on' : ''}" data-c="${i}">${esc(x.name)}</button>`).join('');
    qa('[data-c]', root).forEach(b => b.onclick = () => { c = +b.dataset.c; k = 0; q('.pl-fb', root).textContent = ''; q('.pl2-out', root).textContent = ''; door('locked'); draw(); });
    q('.pl2-src', root).innerHTML = hlPy(src(cs));
    const qq = cs.qs[k];
    q('.pl2-qs', root).innerHTML = qq ? `<p class="pl2-ask">${esc(qq[0])}</p><div class="pl-row"><button class="btn btn-ghost" data-a="1">Yes</button><button class="btn btn-ghost" data-a="0">No</button></div>`
      : `<p class="mini">Scenario done. ${c < CASES.length - 1 ? 'Try the next one.' : ''}</p>`;
    qa('[data-a]', root).forEach(b => b.onclick = () => answer(b.dataset.a === '1'));
    q('.pl-score', root).textContent = `${ok} of ${answered} right`;
  };
  const play = async cs => {
    const out = q('.pl2-out', root); out.textContent = '';
    for (const line of cs.lines){
      if (line === 'unlock') door('open');
      if (line === 'lock') door('locked');
      out.innerHTML += (/Error/.test(line) ? `<span class="pl-no">${esc(line)}</span>` : esc(line)) + '\n';
      await new Promise(r => setTimeout(r, reduced() ? 0 : 380));
    }
  };
  const answer = yes => {
    const cs = CASES[c], qq = cs.qs[k], good = yes === qq[1];
    answered++; ok += good;
    q('.pl-fb', root).innerHTML = `${good ? '<b class="pl-yes">Right.</b>' : '<b class="pl-no">Not this time.</b>'} ${esc(qq[2])}`;
    if (!good) shake(q('.pl2-qs', root));
    if (k === 0) play(cs);
    k++; draw();
  };
  door('locked'); draw();
}

/* ======================= 40 · Kitchen timeline ======================= */
function lesson40(el){
  const DISHES = [['Dosa', 5], ['Biryani', 10], ['Filter coffee', 3], ['Pongal', 6]];
  const MODES = {
    seq: ['One by one', 'for d in dishes: await cook(d)'],
    gather: ['gather', 'await gather(*(cook(d) for d in dishes))'],
    sem: ['gather + Semaphore(2)', 'only 2 stoves at a time'],
  };
  const plan = mode => {
    if (mode === 'seq'){ let t = 0; return DISHES.map(([d, m]) => { const s = t; t += m; return [d, s, m]; }); }
    if (mode === 'gather') return DISHES.map(([d, m]) => [d, 0, m]);
    const free = [0, 0]; return DISHES.map(([d, m]) => { const i = free[0] <= free[1] ? 0 : 1; const s = free[i]; free[i] += m; return [d, s, m]; });
  };
  const total = mode => Math.max(...plan(mode).map(([, s, m]) => s + m));
  let mode = 'seq', done = {}, raf = 0;
  const root = shell(el, 'Kitchen timeline', 'Lakshmi cooks four dishes. Pick how the code runs them, guess the total time, then press Cook and watch the timeline. Try all three ways.',
    `<div class="pl-row pl2-modes"></div><code class="pl2-mcode"></code>
     <div class="pl2-gantt"></div>
     <div class="pl-row"><span class="pl-k">Your guess</span><span class="pl2-guess"></span></div>
     <p class="pl-fb" aria-live="polite"></p>`);
  const scale = 24;   // minutes on the axis
  const draw = (progress = 0) => {
    q('.pl2-modes', root).innerHTML = Object.entries(MODES).map(([k, [t]]) => `<button class="chipb ${k === mode ? 'on' : ''}" data-m="${k}">${esc(t)}${done[k] ? ' ✓' : ''}</button>`).join('');
    qa('[data-m]', root).forEach(b => b.onclick = () => { cancelAnimationFrame(raf); mode = b.dataset.m; q('.pl-fb', root).textContent = ''; draw(); });
    q('.pl2-mcode', root).textContent = MODES[mode][1];
    const p = plan(mode), now = progress * total(mode);
    q('.pl2-gantt', root).innerHTML = p.map(([d, s, m]) => {
      const w = Math.max(0, Math.min(m, now - s));
      return `<div class="pl2-lane"><span>${esc(d)}</span><div class="pl2-track"><i style="left:${s / scale * 100}%;width:${w / scale * 100}%"></i><b style="left:${s / scale * 100}%;width:${m / scale * 100}%"></b></div></div>`;
    }).join('') + `<div class="pl2-axis">${[0, 6, 12, 18, 24].map(t => `<span style="left:${t / scale * 100}%">${t} min</span>`).join('')}</div>`;
    const opts = [...new Set([total('seq'), total('gather'), total('sem'), 18].map(Number))].sort((a, b) => a - b);
    q('.pl2-guess', root).innerHTML = opts.map(t => `<button class="btn btn-ghost" data-g="${t}">${t} min</button>`).join('');
    qa('[data-g]', root).forEach(b => b.onclick = () => cook(+b.dataset.g));
    q('.pl-score', root).textContent = `${Object.keys(done).length}/3 ways tried`;
  };
  const cook = guess => {
    cancelAnimationFrame(raf);
    const t0 = performance.now(), T = total(mode), dur = reduced() ? 1 : 1600;
    const tick = t => {
      const pr = Math.min(1, (t - t0) / dur); draw(pr);
      if (pr < 1) { raf = requestAnimationFrame(tick); return; }
      done[mode] = true; draw(1);
      const why = mode === 'seq' ? 'Each dish waits for the one before: 5 + 10 + 3 + 6.' : mode === 'gather' ? 'All four cook together, so the longest dish (biryani, 10) sets the time.' : 'Two stoves: biryani on one, then the rest share the other until a stove frees up.';
      q('.pl-fb', root).innerHTML = `${guess === T ? '<b class="pl-yes">Right.</b>' : '<b class="pl-no">Not quite.</b>'} Total ${T} minutes. ${why}${Object.keys(done).length === 3 ? ' <b>All three tried.</b>' : ''}`;
    };
    raf = requestAnimationFrame(tick);
  };
  draw();
  return () => cancelAnimationFrame(raf);
}

/* ======================= 41 · Terminal: set up a project ======================= */
function lesson41(el){
  const GOALS = [['venv', 'Make a venv'], ['act', 'Activate it'], ['pyd', 'Install pydantic inside it'], ['freeze', 'Save the exact versions'], ['ignore', 'Keep .venv out of git']];
  const CMDS = [
    ['python -m venv .venv'], ['source .venv/bin/activate'], ['pip install "pydantic>=2.5,<3"'], ['pip freeze > requirements.txt'], ['echo ".venv/" >> .gitignore'], ['git add .venv'], ['python -c "import pydantic"'],
  ];
  let S, log;
  const reset = () => { S = {venv: false, act: false, venvPkgs: [], globalPkgs: [], files: ['main.py'], ignore: false, staged: false, goals: new Set()}; log = []; };
  const root = shell(el, 'Set up a project', 'This is Arjun\'s hostel-bot folder. Click commands to run them in the terminal. Reach all five goals. The order matters: try a wrong one and see what happens.',
    `<div class="pl-cols"><div><div class="pl2-cmds"></div><pre class="term-out pl2-term"></pre></div>
     <div><div class="pl2-tree"></div><ul class="pl2-goals"></ul><button class="pl-link pl2-reset">Start over</button></div></div>`);
  const run = i => {
    const c = CMDS[i][0], prompt = S.act ? '(.venv) $ ' : '$ ';
    let out = '', bad = false;
    if (i === 0){ if (S.venv) out = 'Error: .venv already exists'; else { S.venv = true; S.files.push('.venv/'); S.goals.add('venv'); } }
    else if (i === 1){ if (!S.venv){ out = 'bash: .venv/bin/activate: No such file or directory'; bad = true; } else { S.act = true; S.goals.add('act'); } }
    else if (i === 2){ if (S.act){ S.venvPkgs = ['pydantic 2.11.3', 'pydantic-core 2.33.1', 'typing-extensions 4.12.2']; out = 'Successfully installed pydantic-2.11.3 (inside .venv)'; S.goals.add('pyd'); } else { S.globalPkgs = ['pydantic 2.11.3']; out = 'Successfully installed pydantic-2.11.3\n# warning: installed into the global Python, not the project'; bad = true; } }
    else if (i === 3){ if (!S.act){ out = '# froze the global Python, not this project'; bad = true; } else if (!S.venvPkgs.length){ out = '# requirements.txt is empty: nothing installed yet'; bad = true; } else { if (!S.files.includes('requirements.txt')) S.files.push('requirements.txt'); S.goals.add('freeze'); out = S.venvPkgs.map(p => p.replace(' ', '==')).join('\n'); } }
    else if (i === 4){ S.ignore = true; if (!S.files.includes('.gitignore')) S.files.push('.gitignore'); S.goals.add('ignore'); }
    else if (i === 5){ if (S.ignore) out = 'The following paths are ignored by one of your .gitignore files: .venv'; else { out = 'warning: adding 3,412 files from .venv (about 40 MB)'; bad = true; } }
    else if (i === 6){ out = S.act && S.venvPkgs.length ? '' : "ModuleNotFoundError: No module named 'pydantic'"; if (out) bad = true; if (!out) out = '# imported fine'; }
    log.push(`<span class="p">${esc(prompt)}</span>${esc(c)}` + (out ? `\n${bad ? `<span class="pl-no">${esc(out)}</span>` : esc(out)}` : ''));
    draw(); if (bad) shake(q('.pl2-term', root));
  };
  const draw = () => {
    q('.pl2-cmds', root).innerHTML = CMDS.map(([c], i) => `<button class="pl2-cmd" data-i="${i}"><span>$</span> ${esc(c)}</button>`).join('');
    qa('.pl2-cmd', root).forEach(b => b.onclick = () => run(+b.dataset.i));
    const t = q('.pl2-term', root); t.innerHTML = log.slice(-8).join('\n') || '<span class="c"># click a command</span>'; t.scrollTop = t.scrollHeight;
    q('.pl2-tree', root).innerHTML = `<div class="pl-k">hostel-bot/</div>${S.files.map(f => `<div class="pl2-f ${f === '.venv/' ? 'pl2-v' : ''}">${esc(f)}${f === '.venv/' ? `<small>${S.venvPkgs.length ? S.venvPkgs.map(esc).join(', ') : 'empty'}</small>` : ''}</div>`).join('')}
      ${S.globalPkgs.length ? `<div class="pl2-f pl2-g">global Python<small>${S.globalPkgs.map(esc).join(', ')} · shared by every project</small></div>` : ''}`;
    q('.pl2-goals', root).innerHTML = GOALS.map(([k, t]) => `<li class="${S.goals.has(k) ? 'on' : ''}">${S.goals.has(k) ? '✓' : '○'} ${esc(t)}</li>`).join('') + (S.goals.size === GOALS.length ? '<li class="pl-yes"><b>Project ready.</b> A teammate can now rebuild it from requirements.txt.</li>' : '');
    q('.pl-score', root).textContent = `${S.goals.size}/${GOALS.length} goals`;
  };
  q('.pl2-reset', root).onclick = () => { reset(); draw(); };
  reset(); draw();
}

/* ======================= 42 · Log level dial ======================= */
function lesson42(el){
  const LEVELS = ['DEBUG', 'INFO', 'WARNING', 'ERROR', 'CRITICAL'];
  const LINES = [
    [0, 'fare formula: 50 + 18 * km'], [1, 'Ride R-104 booked: Koramangala to Indiranagar'], [0, 'driver search radius 2 km'], [2, 'Driver is 12 minutes away'],
    [1, 'Driver Ravi accepted R-104'], [2, 'Surge pricing on: 1.5x'], [3, 'Payment failed for ride R-104'], [4, 'Payment service is down'],
  ];
  const GOALS = [
    ['On your laptop, while fixing a bug: see everything.', 0],
    ['On the server: normal events and problems, no fare details.', 1],
    ['The night alert: only real failures.', 3],
    ['Wake the team only when a whole service is down.', 4],
  ];
  let g = 0, lvl = 2, done = new Set();
  const root = shell(el, 'Log level dial', 'Kavya\'s cab app wrote these logs at midnight. Turn the dial to choose the level. Only lines at that level or above show. Match each goal.',
    `<div class="pl-goal pl2-lgoal"></div>
     <div class="pl2-dial">${LEVELS.map((l, i) => `<button class="pl2-lv" data-l="${i}">${l}</button>`).join('')}</div>
     <pre class="term-out pl2-logs"></pre>
     <div class="pl-row"><button class="btn btn-ink pl2-check">Check this level</button></div>
     <p class="pl-fb" aria-live="polite"></p>`);
  const draw = () => {
    q('.pl2-lgoal', root).innerHTML = g < GOALS.length ? `<span class="pl-k">Goal ${g + 1} of ${GOALS.length}</span> ${esc(GOALS[g][0])}` : '<b>All goals matched.</b> Servers usually log at INFO; alerts fire on ERROR.';
    qa('.pl2-lv', root).forEach(b => b.classList.toggle('on', +b.dataset.l === lvl));
    const shown = LINES.filter(([l]) => l >= lvl);
    q('.pl2-logs', root).innerHTML = `<span class="c"># logging.basicConfig(level=logging.${LEVELS[lvl]})</span>\n` + LINES.map(([l, m]) => `<span class="${l >= lvl ? 'pl2-lvl' + l : 'pl2-hid'}">${LEVELS[l].padEnd(8)} cab: ${esc(m)}</span>`).join('\n') + `\n<span class="c"># ${shown.length} of ${LINES.length} lines shown</span>`;
    q('.pl-score', root).textContent = `${done.size}/${GOALS.length} matched`;
    q('.pl2-check', root).disabled = g >= GOALS.length;
  };
  qa('.pl2-lv', root).forEach(b => b.onclick = () => { lvl = +b.dataset.l; draw(); });
  q('.pl2-check', root).onclick = () => {
    const want = GOALS[g][1], fb = q('.pl-fb', root);
    if (lvl === want){ done.add(g); fb.innerHTML = `<b class="pl-yes">Right: ${LEVELS[want]}.</b> It shows ${LEVELS[want]} and everything more serious.`; g++; }
    else { fb.innerHTML = `<b class="pl-no">Not quite.</b> ${lvl < want ? 'Too much noise: some lines you do not need still show.' : 'Too quiet: lines you need are hidden.'}`; shake(q('.pl2-logs', root)); }
    draw();
  };
  draw();
}

/* ======================= 43 · Send a request ======================= */
function lesson43(el){
  const ROUTES = [['GET', '/balance/{card}'], ['POST', '/recharge'], ['GET', '/stations/{code}']];
  const GOALS = [['200', 'Get a 200 OK'], ['404', 'Get a 404 Not Found'], ['422', 'Get a 422 (bad body)'], ['405', 'Get a 405 (wrong method)']];
  let cards = {'KM-2231': 140}, got = new Set();
  const root = shell(el, 'Send a request', 'This is Rahul\'s Kochi Metro API, running in your browser. Build a request, send it, and read the status code. Get all four codes.',
    `<div class="pl2-req">
       <div class="pl-row"><span class="pl-k">Method</span><select class="pl2-m"><option>GET</option><option>POST</option></select>
         <span class="pl-k">Path</span><select class="pl2-p"><option>/recharge</option><option>/balance/KM-2231</option><option>/balance/KM-9999</option><option>/stations/EDP</option></select></div>
       <div class="pl-row pl2-body"><span class="pl-k">Body</span><code>{"card":</code><select class="pl2-c"><option>"KM-2231"</option><option>"KM-9999"</option></select><code>, "amount":</code><input class="pl2-a" value="500" size="12" aria-label="amount"><code>}</code></div>
       <button class="btn btn-ink pl2-send">Send</button>
     </div>
     <pre class="term-out pl2-res"></pre><ul class="pl2-goals pl2-row"></ul><p class="pl-fb" aria-live="polite"></p>`);
  const handle = (m, p, body) => {
    const route = p === '/recharge' ? '/recharge' : p.startsWith('/balance/') ? '/balance/{card}' : '/stations/{code}';
    const allowed = ROUTES.filter(r => r[1] === route).map(r => r[0]);
    if (!allowed.includes(m)) return [405, {detail: 'Method Not Allowed'}, 'This path exists, but not for ' + m + '.'];
    if (route === '/stations/{code}') return [200, {code: 'EDP', name: 'Edappally', line: 'Aluva to Thripunithura'}, '{code} in the path became "EDP".'];
    if (route === '/balance/{card}'){ const c = p.split('/').pop(); return c in cards ? [200, {card: c, balance: cards[c]}, 'Found the card.'] : [404, {detail: 'Card not found'}, 'Your code raised HTTPException(404).']; }
    const amt = body.amount.trim();
    if (!/^-?\d+$/.test(amt)) return [422, {detail: [{loc: ['body', 'amount'], msg: 'Input should be a valid integer'}]}, 'Pydantic rejected the body before your function ran.'];
    if (+amt <= 0 || +amt > 3000) return [422, {detail: [{loc: ['body', 'amount'], msg: +amt <= 0 ? 'Input should be greater than 0' : 'Input should be less than or equal to 3000'}]}, 'Field(gt=0, le=3000) rejected it.'];
    if (!(body.card in cards)) return [404, {detail: 'Card not found'}, 'The body was fine, but the card does not exist.'];
    cards[body.card] += +amt;
    return [200, {card: body.card, balance: cards[body.card]}, 'Validated, recharged, answered.'];
  };
  const sync = () => { q('.pl2-body', root).hidden = q('.pl2-m', root).value !== 'POST'; };
  const draw = () => {
    q('.pl2-goals', root).innerHTML = GOALS.map(([k, t]) => `<li class="${got.has(k) ? 'on' : ''}">${got.has(k) ? '✓' : '○'} ${esc(t)}</li>`).join('');
    q('.pl-score', root).textContent = `${got.size}/4 codes`;
  };
  q('.pl2-m', root).onchange = sync;
  q('.pl2-send', root).onclick = () => {
    const m = q('.pl2-m', root).value, p = q('.pl2-p', root).value;
    const body = {card: JSON.parse(q('.pl2-c', root).value), amount: q('.pl2-a', root).value};
    const [st, json, why] = handle(m, p, body);
    got.add(String(st));
    const reqBody = m === 'POST' ? `\n${esc(JSON.stringify({card: body.card, amount: /^-?\d+$/.test(body.amount.trim()) ? +body.amount : body.amount}))}` : '';
    q('.pl2-res', root).innerHTML = `<span class="c"># request</span>\n${m} ${esc(p)}${reqBody}\n\n<span class="c"># response</span>\n<span class="${st === 200 ? 'pl-yes' : 'pl-no'}">${st} ${{200: 'OK', 404: 'Not Found', 405: 'Method Not Allowed', 422: 'Unprocessable Entity'}[st]}</span>\n${esc(JSON.stringify(json, null, 1))}`;
    q('.pl-fb', root).innerHTML = esc(why) + (got.size === 4 ? ' <b>All four codes found.</b>' : '');
    draw();
  };
  sync(); draw();
}

/* ======================= 44 · Build the conversation ======================= */
function lesson44(el){
  const ROUNDS = [
    {title: 'A plain question', cards: [
      ['user', 'Plan one day in Vizag under Rs 1000.'],
      ['assistant', 'Morning RK Beach, noon Kailasagiri, evening the submarine museum.'],
    ]},
    {title: 'A tool round trip', cards: [
      ['user', 'Should I carry an umbrella in Vizag today?'],
      ['assistant', 'tool_use · get_weather({"city": "Vizag"}) · id toolu_01'],
      ['user', 'tool_result · toolu_01 · "Vizag: 30 C, 70% rain"'],
      ['assistant', 'Yes, 70% chance of rain. Carry an umbrella.'],
    ]},
    {title: 'Two tools at once', cards: [
      ['user', 'Weather and train times for Araku tomorrow?'],
      ['assistant', 'tool_use · get_weather({"city": "Araku"}) + tool_use · trains({"to": "Araku"})'],
      ['user', 'tool_result · weather "22 C, misty" + tool_result · trains "6:45 AM, 9:10 AM"'],
      ['assistant', 'Misty, 22 C. Take the 6:45 AM train for the best views.'],
    ]},
  ];
  let r = 0, built = [], pool = [], mistakes = 0, finished = new Set();
  const root = shell(el, 'Build the conversation', 'Sai\'s assistant must send messages in the right order. Tap the cards to stack the <code>messages</code> list from first to last. Tool requests come from the assistant; tool results go back in a user message.',
    `<div class="pl-row pl2-rounds"></div>
     <div class="pl-cols"><div><div class="pl-k">Cards</div><div class="pl2-pool"></div></div>
     <div><div class="pl-k">messages = [</div><ol class="pl2-stack"></ol><div class="pl-k">]</div></div></div>
     <p class="pl-fb" aria-live="polite"></p>`);
  const start = i => { r = i; built = []; mistakes = 0; pool = ROUNDS[r].cards.map((c, k) => k).sort(() => Math.random() - .5); q('.pl-fb', root).textContent = ''; draw(); };
  const draw = () => {
    const R = ROUNDS[r];
    q('.pl2-rounds', root).innerHTML = ROUNDS.map((x, i) => `<button class="chipb ${i === r ? 'on' : ''}" data-r="${i}">${esc(x.title)}${finished.has(i) ? ' ✓' : ''}</button>`).join('');
    qa('[data-r]', root).forEach(b => b.onclick = () => start(+b.dataset.r));
    q('.pl2-pool', root).innerHTML = pool.map(k => `<button class="pl2-msg pl2-${R.cards[k][0]}" data-k="${k}"><b>${R.cards[k][0]}</b>${esc(R.cards[k][1])}</button>`).join('') || '<p class="mini">All placed.</p>';
    q('.pl2-stack', root).innerHTML = built.map(k => `<li class="pl2-msg pl2-${R.cards[k][0]}"><b>${R.cards[k][0]}</b>${esc(R.cards[k][1])}</li>`).join('') || '<li class="mini pl2-empty">tap the first message</li>';
    qa('.pl2-pool .pl2-msg', root).forEach(b => b.onclick = () => place(+b.dataset.k, b));
    q('.pl-score', root).textContent = `${finished.size}/${ROUNDS.length} rounds`;
  };
  const place = (k, node) => {
    const want = built.length, fb = q('.pl-fb', root);
    if (k !== want){
      mistakes++; shake(node);
      const card = ROUNDS[r].cards[k];
      fb.innerHTML = `<b class="pl-no">Not next.</b> ${want === 0 ? 'A conversation starts with the user.' : card[1].startsWith('tool_result') ? 'A tool result can only come after the assistant asked for that tool.' : 'Messages take turns: look at who spoke last.'}`;
      return;
    }
    built.push(k); pool = pool.filter(x => x !== k);
    fb.innerHTML = built.length === ROUNDS[r].cards.length ? `<b class="pl-yes">Done${mistakes ? `, ${mistakes} wrong tries` : ', no mistakes'}.</b> This whole list is sent on every call: the model has no other memory.` : '<span class="mini">Good. What comes next?</span>';
    if (built.length === ROUNDS[r].cards.length) finished.add(r);
    draw();
  };
  start(0);
}

/* ======================= 45 · Tune the retriever ======================= */
function lesson45(el){
  const RULES = [
    'Attendance: students need 75% attendance in each subject to write the final exam.',
    'Medical leave: up to 10% extra attendance is allowed with a doctor\'s certificate.',
    'Library: books can be borrowed for 14 days. The late fee is Rs 2 per day.',
    'Hostel: gates close at 9:30 PM. Late entry needs the warden\'s permission.',
    'Canteen: open from 7 AM to 9 PM, closed on Sundays.',
    'Exams: bring your hall ticket and college ID card to every exam.',
    'Lab: wear shoes and a lab coat. No food inside the lab.',
    'Fees: the semester fee is due by the 10th of the first month.',
  ];
  const QS = [
    ['I was sick for two weeks. Can I still write the exam with 70% attendance?', [0, 1]],
    ['What time do the hostel gates close?', [3]],
    ['How much is the fine for a late library book?', [2]],
  ];
  const STOP = new Set('a an the is are can i do to of in for with my and what how much time at be by on it every your still'.split(' '));
  const words = t => (t.toLowerCase().match(/[a-z0-9]+/g) || []).filter(w => !STOP.has(w));
  const vec = t => words(t).reduce((m, w) => (m[w] = (m[w] || 0) + 1, m), {});
  const cos = (a, b) => { let d = 0; for (const w in a) d += a[w] * (b[w] || 0); const na = Math.hypot(...Object.values(a)), nb = Math.hypot(...Object.values(b)); return na && nb ? d / (na * nb) : 0; };
  let qi = 0, k = 3, solved = {};
  const root = shell(el, 'Tune the retriever', 'Nithya\'s bot searches the rulebook. Pick a question, then set <b>k</b>, how many chunks go into the prompt. Find the smallest k that still includes every rule needed (marked ★).',
    `<div class="pl-row pl2-qsel"></div>
     <div class="pl-row"><span class="pl-k">top k</span><input type="range" min="1" max="8" class="pl2-k" aria-label="top k"><b class="pl2-kv"></b><button class="btn btn-ghost pl2-lock">This k is enough</button></div>
     <div class="pl-cols"><div class="pl2-ranks"></div><pre class="term-out pl2-prompt"></pre></div>
     <p class="pl-fb" aria-live="polite"></p>`);
  const ranked = () => { const v = vec(QS[qi][0]); return RULES.map((t, i) => [i, cos(v, vec(t))]).sort((a, b) => b[1] - a[1]); };
  const draw = () => {
    q('.pl2-qsel', root).innerHTML = QS.map((x, i) => `<button class="chipb ${i === qi ? 'on' : ''}" data-q="${i}">Question ${i + 1}${solved[i] ? ' ✓' : ''}</button>`).join('');
    qa('[data-q]', root).forEach(b => b.onclick = () => { qi = +b.dataset.q; k = 3; q('.pl-fb', root).textContent = ''; draw(); });
    q('.pl2-k', root).value = k; q('.pl2-kv', root).textContent = k;
    const rk = ranked(), need = QS[qi][1];
    q('.pl2-ranks', root).innerHTML = `<p class="pl2-qtext">"${esc(QS[qi][0])}"</p>` + rk.map(([i, s], pos) => `<div class="pl2-rank ${pos < k ? 'in' : ''}"><span class="pl2-bar" style="width:${Math.round(s * 100)}%"></span><b>${s.toFixed(2)}</b> ${need.includes(i) ? '★ ' : ''}${esc(RULES[i].split(':')[0])}</div>`).join('');
    const ctx = rk.slice(0, k).map(([i], n) => `[${n + 1}] ${RULES[i]}`).join('\n');
    q('.pl2-prompt', root).textContent = `Answer only from these rules. Cite [n].\n\n${ctx}\n\nQuestion: ${QS[qi][0]}`;
    q('.pl-score', root).textContent = `${Object.keys(solved).length}/${QS.length} tuned`;
  };
  q('.pl2-k', root).oninput = e => { k = +e.target.value; draw(); };
  q('.pl2-lock', root).onclick = () => {
    const rk = ranked().map(([i]) => i), need = QS[qi][1], fb = q('.pl-fb', root);
    const minK = Math.max(...need.map(i => rk.indexOf(i))) + 1, hasAll = need.every(i => rk.indexOf(i) < k);
    if (!hasAll){ fb.innerHTML = `<b class="pl-no">A ★ rule is missing.</b> The model would have to guess. Raise k.`; shake(q('.pl2-ranks', root)); return; }
    if (k > minK){ fb.innerHTML = `<b class="pl-no">It works, but k = ${minK} is enough.</b> Extra chunks cost tokens and can distract the model.`; return; }
    solved[qi] = true; fb.innerHTML = `<b class="pl-yes">Right, k = ${k}.</b> That is the smallest k that still puts every ★ rule in the prompt.${Object.keys(solved).length === QS.length ? ' <b>All questions tuned.</b>' : ''}`; draw();
  };
  draw();
}

/* ======================= 46 · Be the agent loop ======================= */
function lesson46(el){
  const RUNS = [
    {title: 'Train trip', q: 'Is my ticket confirmed, and what should I pack?', replies: [
      {tool: 'check_pnr', args: {pnr: '4521876390'}, result: 'PNR 4521876390: CNF, coach S4, berth 32'},
      {tool: 'weather', args: {city: 'Bengaluru'}, result: 'Bengaluru: 24 C, light drizzle'},
      {answer: 'Confirmed in S4, berth 32. Bengaluru has drizzle, so carry a jacket.'},
    ]},
    {title: 'A tool that does not exist', q: 'Book me a flight back on Sunday.', replies: [
      {tool: 'book_flight', args: {day: 'Sunday'}, missing: true},
      {answer: 'I cannot book flights, but the Sunday 4:30 PM train has seats.'},
    ]},
    {title: 'A model that never stops', q: 'Keep checking the weather in Ooty.', replies: Array.from({length: 4}, () => ({tool: 'weather', args: {city: 'Ooty'}, result: 'Ooty: 14 C, foggy'})), maxSteps: 3},
  ];
  const ACTIONS = [['run', 'Run the tool, add the result'], ['error', 'Send "Tool error" back'], ['answer', 'Return the answer to the user'], ['stop', 'Stop: too many steps']];
  let r = 0, step = 0, history = [], fin = new Set(), wrong = 0;
  const root = shell(el, 'Be the agent loop', 'You are the <code>for</code> loop. Each time the model replies, choose what the loop does next. The history on the right is what the model sees on the next step.',
    `<div class="pl-row pl2-runs"></div>
     <div class="pl-cols"><div><div class="pl-k">Model replied</div><pre class="term-out pl2-reply"></pre><div class="pl2-acts"></div></div>
     <div><div class="pl-k">history</div><ol class="pl2-hist"></ol></div></div>
     <p class="pl-fb" aria-live="polite"></p>`);
  const R = () => RUNS[r];
  const cur = () => R().replies[step];
  const start = i => { r = i; step = 0; wrong = 0; history = [['user', R().q]]; q('.pl-fb', root).textContent = ''; draw(); };
  const right = () => { const c = cur(); if (!c) return null; if (R().maxSteps && step >= R().maxSteps) return 'stop'; return c.answer ? 'answer' : c.missing ? 'error' : 'run'; };
  const draw = () => {
    q('.pl2-runs', root).innerHTML = RUNS.map((x, i) => `<button class="chipb ${i === r ? 'on' : ''}" data-r="${i}">${esc(x.title)}${fin.has(i) ? ' ✓' : ''}</button>`).join('');
    qa('[data-r]', root).forEach(b => b.onclick = () => start(+b.dataset.r));
    const c = cur(), over = fin.has(r) && step === -1;
    q('.pl2-reply', root).innerHTML = over || !c ? '<span class="c"># loop finished</span>' : `<span class="c"># step ${step + 1}${R().maxSteps ? ` of max_steps = ${R().maxSteps}` : ''}</span>\n` + esc(JSON.stringify(c.answer ? {answer: c.answer} : {tool: c.tool, args: c.args}, null, 1));
    q('.pl2-acts', root).innerHTML = over || !c ? '' : ACTIONS.map(([k, t]) => `<button class="btn btn-ghost" data-a="${k}">${esc(t)}</button>`).join('');
    qa('[data-a]', root).forEach(b => b.onclick = () => act(b.dataset.a, b));
    q('.pl2-hist', root).innerHTML = history.map(([role, text]) => `<li class="pl2-msg pl2-${role === 'tool' ? 'tool' : role}"><b>${role}</b>${esc(text)}</li>`).join('');
    q('.pl-score', root).textContent = `${fin.size}/${RUNS.length} runs`;
  };
  const act = (a, node) => {
    const want = right(), c = cur(), fb = q('.pl-fb', root);
    if (a !== want){
      wrong++; shake(node);
      fb.innerHTML = `<b class="pl-no">Not this one.</b> ${want === 'stop' ? 'The step limit is reached. The guard must stop the loop.' : want === 'error' ? `There is no tool called ${esc(c.tool)}. Do not crash: tell the model.` : want === 'answer' ? 'The model gave an answer, not a tool call.' : 'The model asked for a tool that exists. Run it.'}`;
      return;
    }
    if (a === 'run'){ history.push(['tool', c.result]); step++; fb.innerHTML = `<span class="mini">Ran ${esc(c.tool)}. The result is in the history; ask the model again.</span>`; }
    else if (a === 'error'){ history.push(['tool', `Tool error: no tool called ${c.tool}`]); step++; fb.innerHTML = '<span class="mini">The model sees the error and can change its plan.</span>'; }
    else { history.push(['assistant', a === 'answer' ? c.answer : 'Stopped: too many steps']); fin.add(r); step = -1; fb.innerHTML = `<b class="pl-yes">Loop finished${wrong ? `, ${wrong} wrong tries` : ', no mistakes'}.</b> ${a === 'stop' ? 'Without max_steps this model would run up the bill forever.' : 'That is the whole agent loop: ask, run, add, repeat.'}`; }
    draw();
  };
  start(0);
}

const ALL = {39: lesson39, 40: lesson40, 41: lesson41, 42: lesson42, 43: lesson43, 44: lesson44, 45: lesson45, 46: lesson46};
export const mountPlay = (n, el) => ALL[n](el);
