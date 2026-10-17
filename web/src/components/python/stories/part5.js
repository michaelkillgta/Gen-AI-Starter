/* eslint-disable */
// @ts-nocheck
/* Part V · Practical Python for AI (lessons 32-38): story and game data for the engine. */
import { story, game } from "./engine";

const box = (v, t, x, y, more) => ({kind: 'box', v, t, x, y, ...(more || {})});
const fn = (v, x, y, more) => box(v, 'function', x, y, {size: 76, ...(more || {})});
const err = (v, x, y, more) => box(v, 'error', x, y, {size: 60, ...(more || {})});
const tag = (on, more) => ({kind: 'tag', on, ...(more || {})});
const shelf = (x, y, w, more) => ({kind: 'shelf', x, y, w, ...(more || {})});
const note = (on, text, more) => ({kind: 'note', on, text, ...(more || {})});
const link = (from, to, more) => ({kind: 'link', from, to, ...(more || {})});
const scan = on => ({kind: 'scan', on});
const card = (show, a, o, out, why, q) => ({show, code: show, a, o, out, why, ...(q ? {q} : {})});
const P = (...args) => ({...card(...args), prose: true});

export const stories = {
  32: {title: 'When a tool breaks', file: 'safe_tool.py', count: false, empty: 'no tool call yet', scenes: [
    {title: 'Errors stop everything', code: `result = get_weather(**args)`, out: "KeyError: 'city'", body: `The model forgot the <code>city</code> argument. An <b>exception</b> flies up and, with nothing to catch it, crashes the whole agent run.`,
     set: {t: fn('get_weather', -60, 0), e: err('KeyError', 120, -60, {glow: true}), l: link('t', 'e', {label: 'raise'})}},
    {title: 'try marks the risky part', code: `try:\n    result = get_weather(**args)`, body: `Code inside <code>try</code> runs normally. If anything inside raises, Python jumps straight to a matching <code>except</code> block.`,
     set: {e: null, l: null, T: shelf(-60, 0, 220, {h: 200, alt: true, label: 'try'})}},
    {title: 'except catches it', code: `except KeyError as e:\n    result = f"Tool error: missing {e}"`, body: `The error is caught and turned into a message. The agent sends that text back to the LLM, which usually fixes its call on the next step.`,
     set: {e: err('KeyError', 140, -80), X: shelf(140, 60, 170, {h: 120, label: 'except KeyError'}), m: box('"Tool error..."', 'str', 140, 60, {size: 58}), c: link('e', 'X', {label: 'caught'})}},
    {title: 'else runs only on success', code: `else:\n    log("tool ok")`, body: `<code>else</code> runs when the try block finished with no error. Keep success-only code there so the try block stays small.`,
     set: {ok: note('T', 'else: no error', {z: 60})}},
    {title: 'finally always runs', code: `finally:\n    session.close()`, body: `<code>finally</code> runs whether the tool succeeded, failed or returned early. Use it to close files, connections and timers.`,
     set: {ok: null, F: shelf(0, -150, 300, {h: 50, label: 'finally: always'})}},
    {title: 'Catch narrowly', code: `except Exception:      # too broad\nexcept (KeyError, ValueError) as e:   # better`, body: `Catch the errors you expect and can explain to the model. A bare <code>except:</code> also hides your own bugs, so tests pass while the agent misbehaves.`,
     set: {w: note('X', 'catch what you expect', {z: 70})}},
  ]},

  33: {title: 'Surviving a busy API', file: 'retry.py', count: false, empty: 'no calls yet', scenes: [
    {title: 'APIs fail sometimes', code: `resp = call_llm(prompt)`, out: '429 Too Many Requests', body: `Rate limits (429) and overloaded servers (503) are normal. They usually go away if you wait a moment and try again.`,
     set: {track: shelf(0, 0, 460, {h: 90, slots: 4, labels: ['try 1', 'try 2', 'try 3', 'try 4'], label: 'attempts'}), a1: err('429', -172, 0)}},
    {title: 'Wait, then retry', code: `for attempt in range(4):\n    try:\n        return call_llm(prompt)\n    except RateLimitError:\n        time.sleep(delay)`, body: `A loop with try/except retries the call. Each failure waits before the next attempt.`,
     set: {w1: note('a1', 'wait 1s', {z: 40})}},
    {title: 'Double the wait each time', code: `delay = base * 2 ** attempt   # 1, 2, 4, 8 s`, body: `<b>Exponential backoff</b> doubles the delay after each failure. It gives the server room to recover instead of hammering it.`,
     set: {a2: err('503', -57, 0), w2: note('a2', 'wait 2s', {z: 40})}},
    {title: 'Add jitter', code: `time.sleep(delay + random.uniform(0, 1))`, body: `If a thousand clients retry at exactly the same moment, they all fail again. A small random extra delay spreads them out.`,
     set: {a3: box('200 OK', 'response', 57, 0, {size: 60, glow: true}), w3: note('a3', 'success', {z: 40})}},
    {title: 'Know when to give up', code: `raise RuntimeError("LLM unavailable after 4 tries")`, body: `Retry only temporary errors. A 401 (bad key) or 400 (bad request) will never succeed, so fail fast and report it.`,
     set: {a3: {glow: false}, nb: note('track', 'retry 429 / 503, not 400 / 401', {z: 70})}},
    {title: 'tenacity does it in one line', code: `from tenacity import retry, stop_after_attempt, wait_exponential\n\n@retry(stop=stop_after_attempt(4), wait=wait_exponential())\ndef call_llm(prompt): ...`, body: `The tenacity library wraps any function with retry, backoff and jitter. It is a decorator, just like the ones you wrote earlier.`,
     set: {d: fn('@retry', 0, -150, {size: 64})}},
  ]},

  34: {title: 'Reading the model\'s JSON', file: 'parse_args.py', count: false, empty: 'no reply yet', scenes: [
    {title: 'The reply is only text', code: `raw = '{"city": "Pune", "days": 3}'`, body: `Tool arguments arrive as a <b>str</b> that looks like JSON. You cannot read <code>raw["city"]</code> yet.`,
     set: {r: box("'{\"city\"...'", 'str', -170, 0, {size: 70})}},
    {title: 'json.loads turns text into data', code: `import json\nargs = json.loads(raw)\nargs["city"]`, out: "'Pune'", body: `<code>json.loads</code> parses the text into Python objects: JSON objects become dicts, arrays become lists, <code>true</code> becomes <code>True</code>, <code>null</code> becomes <code>None</code>.`,
     set: {p: fn('json.loads', 0, 0, {size: 64}), d: box('dict', 'dict', 170, 0, {size: 64}), l1: link('r', 'p'), l2: link('p', 'd')}},
    {title: 'json.dumps goes back to text', code: `json.dumps({"ok": True, "items": None})`, out: '\'{"ok": true, "items": null}\'', body: `To send a tool result back to the model, turn it into JSON text with <code>json.dumps</code>.`,
     set: {b: link('d', 'r', {dash: true, label: 'dumps'})}},
    {title: 'Models break JSON', code: `raw = "Sure! \`\`\`json\\n{'city': 'Pune'}\\n\`\`\`"`, out: 'JSONDecodeError: Expecting property name enclosed in double quotes', body: `Extra words, code fences and single quotes are not valid JSON. <code>json.loads</code> raises <code>JSONDecodeError</code>.`,
     set: {b: null, d: null, l2: null, r: {v: "Sure! ```json..."}, e: err('JSONDecodeError', 170, 0, {size: 70})}},
    {title: 'Clean up, then parse', code: `match = re.search(r"\\{.*\\}", raw, re.S)\nargs = json.loads(match.group())`, body: `Pull out the part between the first { and the last }, then parse it. Ask for JSON mode or structured output from the API so this happens less.`,
     set: {e: null, c: fn('extract {...}', -60, -130, {size: 64}), d: box('dict', 'dict', 170, 0, {size: 64}), l2: link('p', 'd')}},
    {title: 'Still broken? Tell the model', code: `except json.JSONDecodeError as e:\n    messages.append({"role": "user",\n        "content": f"Invalid JSON: {e}. Reply with JSON only."})`, body: `Wrap the parse in try/except and send the error back. The model fixes its own output on the next turn.`,
     set: {fix: note('p', 'Invalid JSON → ask again', {z: 40})}},
  ]},

  35: {title: 'Loading the knowledge base', file: 'files.py', count: false, empty: 'no paths yet', scenes: [
    {title: 'Paths are objects', code: `from pathlib import Path\nprompts = Path("prompts")`, body: `A <code>Path</code> knows how to join, check and read files on Windows, macOS and Linux. No more fragile string paths.`,
     set: {D: shelf(-100, 0, 280, {h: 250, alt: true, label: 'prompts/'})}},
    {title: '/ joins path parts', code: `system = prompts / "system.txt"\nsystem.name, system.suffix`, out: "('system.txt', '.txt')", body: `The <code>/</code> operator builds paths. <code>.name</code>, <code>.stem</code> and <code>.suffix</code> read the pieces.`,
     set: {f1: box('system.txt', 'path', -170, -60, {size: 60})}},
    {title: 'Read the whole file', code: `text = system.read_text(encoding="utf-8")`, body: `<code>read_text</code> opens, reads and closes the file in one call. Always pass <code>encoding="utf-8"</code>, or Indian-language text may break on Windows.`,
     set: {t: box('"You are..."', 'str', 140, -60, {size: 64}), l: link('f1', 't', {label: 'read_text'})}},
    {title: 'Check before you read', code: `if not system.exists():\n    raise FileNotFoundError(system)`, body: `<code>exists()</code>, <code>is_file()</code> and <code>is_dir()</code> let you give a clear error instead of a stack trace.`,
     set: {ok: note('f1', 'exists() → True', {z: 40})}},
    {title: 'glob finds many files', code: `docs = list(Path("kb").glob("*.md"))`, body: `<code>glob("*.md")</code> returns every Markdown file in a folder. Use <code>rglob</code> to search subfolders too. This is how you load a RAG knowledge base.`,
     set: {ok: null, f2: box('a.md', 'path', -170, 60, {size: 50}), f3: box('b.md', 'path', -100, 60, {size: 50}), f4: box('c.md', 'path', -30, 60, {size: 50}), K: shelf(150, 70, 160, {h: 100, label: 'docs (list)'})}},
    {title: 'JSON and CSV in one line each', code: `cfg = json.loads(Path("config.json").read_text())\nrows = list(csv.DictReader(open("faq.csv", encoding="utf-8")))`, body: `Read JSON config with json.loads on the text. Read CSV rows as dicts with <code>csv.DictReader</code>.`,
     set: {c1: box('config.json', 'path', 140, -150, {size: 54}), c2: box('faq.csv', 'path', 30, -150, {size: 54})}},
  ]},

  36: {title: 'Keeping the key secret', file: 'settings.py', count: false, empty: 'no settings yet', scenes: [
    {title: 'A key in the code leaks', code: `client = OpenAI(api_key="sk-live-123...")`, body: `Push this to GitHub and bots find the key within minutes. Your account pays for their usage.`,
     set: {k: box('"sk-live..."', 'str', -100, 0, {glow: true}), w: note('k', 'leaked to GitHub', {bad: true, z: 40})}},
    {title: 'Put secrets in the environment', code: `# .env  (never committed)\nOPENAI_API_KEY=sk-live-123...\nMODEL=gpt-4o-mini`, body: `A <code>.env</code> file holds settings for your machine. Add it to <code>.gitignore</code> so it never reaches the repository.`,
     set: {k: null, w: null, E: shelf(-150, 0, 180, {h: 200, alt: true, label: '.env (ignored by git)'}), e1: box('KEY', 'str', -150, -40, {size: 50}), e2: box('MODEL', 'str', -150, 50, {size: 50})}},
    {title: 'load_dotenv copies it in', code: `from dotenv import load_dotenv\nload_dotenv()`, body: `<code>load_dotenv()</code> reads the file and puts each line into <code>os.environ</code>, the process environment.`,
     set: {O: shelf(130, 0, 200, {h: 200, label: 'os.environ'}), l: link('E', 'O', {label: 'load_dotenv'})}},
    {title: 'Read with a default', code: `model = os.getenv("MODEL", "gpt-4o-mini")\nkey = os.environ["OPENAI_API_KEY"]`, body: `<code>getenv</code> returns a default when the variable is missing. <code>os.environ[...]</code> raises KeyError, which is what you want for a required key.`,
     set: {m: box('"gpt-4o..."', 'str', 130, -40, {size: 54}), kk: box('"sk-..."', 'str', 130, 50, {size: 54})}},
    {title: 'Everything is a string', code: `retries = int(os.getenv("RETRIES", "3"))`, body: `Environment values are always text. Convert numbers and flags yourself, just like form input.`,
     set: {r: box('"3" → 3', 'int', 0, 150, {size: 54})}},
    {title: 'Same code everywhere', body: `Your laptop, the CI server and Vercel each set their own variables. The code never changes, only the environment does.`,
     set: {v: note('O', 'laptop · CI · Vercel', {z: 60})}},
  ]},

  37: {title: 'Calling a real API', file: 'weather_tool.py', count: false, empty: 'no request yet', scenes: [
    {title: 'A tool that calls the internet', code: `import requests\nresp = requests.get(\n    "https://api.example.com/weather",\n    params={"city": "Pune"}, timeout=10)`, body: `Most useful tools call an HTTP API. <code>params</code> builds the query string for you. <code>timeout</code> stops a slow server from freezing your agent.`,
     set: {a: fn('your tool', -170, 0), s: box('server', 'class', 170, 0, {size: 80}), q: link('a', 's', {label: 'GET ?city=Pune'})}},
    {title: 'Check the status code', code: `resp.status_code`, out: '200', body: `200 means OK. 4xx means your request was wrong (404 not found, 401 bad key). 5xx means the server failed.`,
     set: {st: note('s', '200 OK', {z: 40})}},
    {title: 'Read the JSON body', code: `data = resp.json()\ndata["temp"]`, out: '31.5', body: `<code>.json()</code> parses the response text into a dict, exactly like <code>json.loads</code>.`,
     set: {d: box('dict', 'dict', 0, 120, {size: 60}), b: link('s', 'd', {label: '.json()'})}},
    {title: 'Turn errors into exceptions', code: `resp.raise_for_status()`, out: 'HTTPError: 404 Client Error: Not Found', body: `<code>raise_for_status()</code> raises for any 4xx or 5xx, so you never parse an error page as if it were data. Catch it and tell the model.`,
     set: {st: note('s', '404', {bad: true, z: 40})}},
    {title: 'Always set a timeout', code: `requests.get(url, timeout=10)`, out: 'requests.exceptions.Timeout', body: `Without a timeout, a hung server can block forever. With one, you get an exception you can retry with backoff.`,
     set: {st: note('s', 'timeout after 10s', {bad: true, z: 40})}},
    {title: 'httpx for async agents', code: `async with httpx.AsyncClient(timeout=10) as client:\n    resp = await client.get(url, params=params)`, body: `httpx has almost the same API as requests, plus async support. Async agents can call several tools at the same time.`,
     set: {st: note('s', '200 OK', {z: 40}), a2: fn('tool 2', -170, -140, {size: 56}), q2: link('a2', 's', {dash: true})}},
  ]},

  38: {title: 'The standard toolbox', file: 'utils.py', count: false, empty: 'no tools yet', scenes: [
    {title: 're finds patterns in text', code: `import re\nre.findall(r"\\d+", "top 3 of 10 docs")`, out: "['3', '10']", body: `A regular expression describes a pattern. <code>\\d+</code> means "one or more digits". <code>findall</code> returns every match.`,
     set: {t: box('"top 3 of 10"', 'str', -170, -60, {size: 64}), m1: box('"3"', 'str', 0, -60, {size: 46}), m2: box('"10"', 'str', 70, -60, {size: 46})}},
    {title: 're.sub cleans model output', code: `clean = re.sub(r"<think>.*?</think>", "", reply, flags=re.S)`, body: `Remove reasoning tags, code fences or extra whitespace before you show or parse a reply. <code>.*?</code> matches as little as possible.`,
     set: {c: fn('re.sub', 170, -60, {size: 56})}},
    {title: 'Counter counts things', code: `from collections import Counter\nCounter(words).most_common(2)`, out: "[('rag', 3), ('agent', 2)]", body: `Counter is a dict that counts. One line gives you the most common words, tools or errors.`,
     set: {k: box('Counter', 'dict', -170, 90, {size: 60})}},
    {title: 'deque keeps the last N', code: `from collections import deque\nmemory = deque(maxlen=3)`, body: `A deque with <code>maxlen</code> drops the oldest item when full. Perfect for "remember the last 3 turns" memory.`,
     set: {Q: shelf(60, 90, 240, {h: 80, slots: 3, label: 'deque(maxlen=3)'}), q1: box('t2', 'str', -20, 90, {size: 44}), q2: box('t3', 'str', 60, 90, {size: 44}), q3: box('t4', 'str', 140, 90, {size: 44, glow: true}), out: note('Q', 't1 dropped', {z: 50})}},
    {title: 'Time and ids for tracing', code: `from datetime import datetime, timezone\nimport uuid\nstamp = datetime.now(timezone.utc).isoformat()\ntrace_id = str(uuid.uuid4())`, body: `Store times in UTC with a timezone, and give every agent run a unique id. Logs from many runs stay easy to follow.`,
     set: {q3: {glow: false}, out: null, ts: box('UTC time', 'str', 200, -150, {size: 50}), id: box('uuid', 'str', 120, -150, {size: 50})}},
    {title: 'Check the standard library first', body: `itertools, functools, collections, datetime, re, json and pathlib solve most everyday problems. They are fast, tested and already installed.`,
     set: {n: note('k', 'batteries included', {z: 40})}},
  ]},
};

export const games = {
  32: {title: 'Exception tracer', show: 'card', q: 'What does it print?', items: [
    card('try:\n    1 / 0\nexcept ZeroDivisionError:\n    print("caught")', 'caught', ['caught', 'ZeroDivisionError', 'nothing'], 'caught', 'The matching except block runs.'),
    card('try:\n    x = 1\nexcept ValueError:\n    print("bad")\nelse:\n    print("ok")', 'ok', ['bad', 'ok', 'bad ok'], 'ok', 'else runs when there was no error.'),
    card('try:\n    {}["k"]\nexcept KeyError:\n    print("A")\nfinally:\n    print("B")', 'A B', ['A', 'B', 'A B'], 'A\nB', 'finally always runs, after except.'),
    card('try:\n    int("x")\nexcept KeyError:\n    print("caught")', 'ValueError', ['caught', 'ValueError', 'nothing'], 'ValueError: invalid literal', 'except KeyError does not match a ValueError, so it escapes.'),
    card('def f():\n    try:\n        return "try"\n    finally:\n        print("fin")\nprint(f())', 'fin try', ['try', 'fin try', 'fin'], 'fin\ntry', 'finally runs even when try returns.'),
  ]},
  33: {title: 'Retry or not?', show: 'card', choices: ['retry', 'fail fast'], prose: true, q: 'Should the agent retry this error?', items: [
    card('429 Too Many Requests', 'retry', null, 'wait and retry', 'Rate limits clear after a short wait.'),
    card('401 Unauthorized\n(bad API key)', 'fail fast', null, 'fix the key', 'A wrong key never starts working on its own.'),
    card('503 Service Unavailable', 'retry', null, 'wait and retry', 'The server is busy; backoff gives it time.'),
    card('400 Bad Request\n(invalid parameter)', 'fail fast', null, 'fix the request', 'The same request will fail every time.'),
    card('Read timeout after 10s', 'retry', null, 'retry with backoff', 'Timeouts are usually temporary.'),
  ]},
  34: {title: 'JSON parser', show: 'card', q: 'What happens?', items: [
    card('json.loads(\'{"a": 1}\')["a"]', '1', ['1', "'1'", 'Error'], '1', 'JSON numbers become ints.'),
    card("json.loads(\"{'a': 1}\")", 'JSONDecodeError', ["{'a': 1}", 'JSONDecodeError'], 'JSONDecodeError', 'JSON needs double quotes.'),
    card('json.loads("true")', 'True', ['True', "'true'", 'Error'], 'True', 'JSON true becomes Python True.'),
    card('json.dumps({"x": None})', '\'{"x": null}\'', ['\'{"x": null}\'', '\'{"x": None}\'', 'Error'], '\'{"x": null}\'', 'Python None becomes JSON null.'),
    card('json.loads("[1, 2,]")', 'JSONDecodeError', ['[1, 2]', 'JSONDecodeError'], 'JSONDecodeError', 'Trailing commas are not allowed in JSON.'),
    card('type(json.loads(\'{"a": [1]}\')["a"]).__name__', 'list', ['list', 'tuple', 'str'], 'list', 'JSON arrays become lists.'),
  ]},
  35: {title: 'Path lab', show: 'card', q: 'What does it give?', items: [
    card('Path("docs") / "a.md"', 'docs/a.md', ['docs/a.md', 'docsa.md', 'TypeError'], "PosixPath('docs/a.md')", '/ joins path parts (Windows shows a backslash).'),
    card('Path("notes.txt").suffix', '.txt', ['.txt', 'txt', 'notes'], "'.txt'", '.suffix includes the dot.'),
    card('Path("notes.txt").stem', 'notes', ['notes', 'notes.txt', '.txt'], "'notes'", '.stem is the name without the suffix.'),
    card('Path("missing.txt").read_text()', 'FileNotFoundError', ["''", 'None', 'FileNotFoundError'], 'FileNotFoundError', 'Reading a missing file raises. Check exists() first.'),
    card('Path("kb").glob("*.md")', 'a generator', ['a list', 'a generator', 'a str'], '<generator object ...>', 'Wrap it in list() to get a list.'),
  ]},
  36: {title: 'Secret keeper', show: 'card', q: 'What happens?', items: [
    card('# MODEL is not set\nos.getenv("MODEL", "mini")', 'mini', ['mini', 'None', 'KeyError'], "'mini'", 'getenv returns the default.'),
    card('# KEY is not set\nos.environ["KEY"]', 'KeyError', ['None', "''", 'KeyError'], "KeyError: 'KEY'", 'Square brackets raise for a missing variable.'),
    card('# RETRIES=3\nos.environ["RETRIES"] + 1', 'TypeError', ['4', '31', 'TypeError'], 'TypeError', 'The value is the string "3".'),
    P('Should .env be\ncommitted to git?', 'no', ['yes', 'no'], 'no', 'Add .env to .gitignore. Commit a .env.example without real values.'),
    card('# DEBUG=False\nbool(os.getenv("DEBUG"))', 'True', ['True', 'False'], 'True', '"False" is a non-empty string. Compare the text instead.'),
  ]},
  37: {title: 'HTTP status check', show: 'card', q: 'What does it mean?', items: [
    card('resp.status_code == 200', 'success', ['success', 'client error', 'server error'], 'OK', '2xx means the request worked.'),
    card('resp.status_code == 404', 'client error', ['success', 'client error', 'server error'], 'Not Found', '4xx: your request was wrong (bad URL here).'),
    card('resp.status_code == 503', 'server error', ['success', 'client error', 'server error'], 'Service Unavailable', '5xx: the server failed. Retry with backoff.'),
    card('resp.raise_for_status()\n# status 401', 'HTTPError', ['nothing', 'HTTPError'], 'HTTPError: 401 Unauthorized', 'Any 4xx or 5xx raises.'),
    card('requests.get(url)\n# no timeout, server hangs', 'waits forever', ['waits forever', 'Timeout after 10s'], '(blocked)', 'Always pass timeout=.'),
    card('type(resp.json()).__name__\n# body: {"temp": 31}', 'dict', ['dict', 'str', 'Response'], 'dict', '.json() parses the body.'),
  ]},
  38: {title: 'Toolbox quiz', show: 'card', q: 'What does it give?', items: [
    card('re.findall(r"\\d+", "a1b22")', "['1', '22']", ["['1', '22']", "['1', '2', '2']", '[1, 22]'], "['1', '22']", '\\d+ matches runs of digits, as strings.'),
    card('re.sub(r"\\s+", " ", "a   b")', "'a b'", ["'a b'", "'a   b'", "'ab'"], "'a b'", '\\s+ matches runs of whitespace.'),
    card('Counter("aab").most_common(1)', "[('a', 2)]", ["[('a', 2)]", "['a']", "{'a': 2}"], "[('a', 2)]", 'A list of (item, count) pairs.'),
    card('d = deque([1, 2, 3], maxlen=3)\nd.append(4)\nlist(d)', '[2, 3, 4]', ['[2, 3, 4]', '[1, 2, 3, 4]', '[1, 2, 3]'], '[2, 3, 4]', 'The oldest item is dropped.'),
    card('list(itertools.islice(range(100), 3))', '[0, 1, 2]', ['[0, 1, 2]', '[1, 2, 3]', '[0, 1, 2, 3]'], '[0, 1, 2]', 'islice takes the first 3 items lazily.'),
    card('len(str(uuid.uuid4()))', '36', ['32', '36', '16'], '36', '32 hex digits plus 4 dashes.'),
  ]},
};

export const mountStory = (n, el) => story(el, stories[n]);
export const mountGame = (n, el) => game(el, games[n]);
