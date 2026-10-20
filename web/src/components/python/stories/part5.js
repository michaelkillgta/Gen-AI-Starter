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
  32: {title: 'The UPI payment that failed', file: 'pay.py', count: false, empty: 'no payment yet', scenes: [
    {title: 'Errors stop everything', code: `result = pay(500, balance=320)`, out: 'PaymentError: balance too low', body: `Meera pays Rs 500 for concert tickets, but her wallet has Rs 320. An <b>exception</b> flies up and, with nothing to catch it, the whole app crashes.`,
     set: {t: fn('pay', -60, 0), e: err('PaymentError', 120, -60, {glow: true}), l: link('t', 'e', {label: 'raise'})}},
    {title: 'try marks the risky part', code: `try:\n    result = pay(500, balance=320)`, body: `Code inside <code>try</code> runs normally. If anything inside raises, Python jumps straight to a matching <code>except</code> block.`,
     set: {e: null, l: null, T: shelf(-60, 0, 220, {h: 200, alt: true, label: 'try'})}},
    {title: 'except catches it', code: `except PaymentError as e:\n    result = f"Payment failed: {e}"`, body: `The error is caught and turned into a friendly message: "Payment failed: balance too low". The app keeps running.`,
     set: {e: err('PaymentError', 140, -80), X: shelf(140, 60, 170, {h: 120, label: 'except PaymentError'}), m: box('"Payment failed..."', 'str', 140, 60, {size: 58}), c: link('e', 'X', {label: 'caught'})}},
    {title: 'else runs only on success', code: `else:\n    send_receipt()`, body: `<code>else</code> runs when the try block finished with no error. Keep success-only code, like sending a receipt, there.`,
     set: {ok: note('T', 'else: no error', {z: 60})}},
    {title: 'finally always runs', code: `finally:\n    close_payment_screen()`, body: `<code>finally</code> runs whether the payment worked, failed or returned early. Use it for cleanup.`,
     set: {ok: null, F: shelf(0, -150, 300, {h: 50, label: 'finally: always'})}},
    {title: 'Catch narrowly', code: `except Exception:            # too broad\nexcept (PaymentError, ValueError) as e:   # better`, body: `Catch the errors you expect. A bare <code>except:</code> also hides your own bugs. AI agents catch tool errors this way and send the message back to the model.`,
     set: {w: note('X', 'catch what you expect', {z: 70})}},
  ]},

  33: {title: 'The tatkal rush', file: 'tatkal.py', count: false, empty: 'no tries yet', scenes: [
    {title: 'Servers get busy', code: `result = book_tatkal()`, out: 'server busy', body: `At 10 AM sharp, everyone opens the train booking site for tatkal tickets. The server says busy. It usually recovers if you wait a moment and try again.`,
     set: {track: shelf(0, 0, 460, {h: 90, slots: 4, labels: ['try 1', 'try 2', 'try 3', 'try 4'], label: 'attempts'}), a1: err('busy', -172, 0)}},
    {title: 'Wait, then retry', code: `for attempt in range(4):\n    try:\n        return book_tatkal()\n    except ConnectionError:\n        time.sleep(delay)`, body: `A loop with try/except retries the booking. Each failure waits before the next try.`,
     set: {w1: note('a1', 'wait 1s', {z: 40})}},
    {title: 'Double the wait each time', code: `delay = base * 2 ** attempt   # 1, 2, 4, 8 s`, body: `<b>Exponential backoff</b> doubles the wait after each failure. It gives the server room to recover instead of hammering it.`,
     set: {a2: err('busy', -57, 0), w2: note('a2', 'wait 2s', {z: 40})}},
    {title: 'Add jitter', code: `time.sleep(delay + random.uniform(0, 1))`, body: `If a lakh people retry at exactly the same moment, they all fail again. A small random extra wait spreads them out.`,
     set: {a3: box('Booked!', 'response', 57, 0, {size: 60, glow: true}), w3: note('a3', 'success', {z: 40})}},
    {title: 'Know when to give up', code: `raise RuntimeError("Could not book after 4 tries")`, body: `Retry only temporary errors like "busy" or a timeout. A wrong password will never work, so stop at once and tell the user.`,
     set: {a3: {glow: false}, nb: note('track', 'retry busy, not wrong password', {z: 70})}},
    {title: 'tenacity does it in one line', code: `from tenacity import retry, stop_after_attempt, wait_exponential\n\n@retry(stop=stop_after_attempt(4), wait=wait_exponential())\ndef book_tatkal(): ...`, body: `The tenacity library wraps any function with retry and backoff. AI agents use it for calls to AI models that fail with 429 or 503.`,
     set: {d: fn('@retry', 0, -150, {size: 64})}},
  ]},

  34: {title: 'Reading a PNR status', file: 'pnr.py', count: false, empty: 'no reply yet', scenes: [
    {title: 'The reply is only text', code: `raw = '{"pnr": "4521876390", "status": "CNF"}'`, body: `The train app gets the PNR status as a <b>str</b> that looks like JSON. You cannot read <code>raw["status"]</code> yet.`,
     set: {r: box("'{\"pnr\"...'", 'str', -170, 0, {size: 70})}},
    {title: 'json.loads turns text into data', code: `import json\nticket = json.loads(raw)\nticket["status"]`, out: "'CNF'", body: `<code>json.loads</code> turns the text into Python objects: JSON objects become dicts, arrays become lists, <code>true</code> becomes <code>True</code>, <code>null</code> becomes <code>None</code>.`,
     set: {p: fn('json.loads', 0, 0, {size: 64}), d: box('dict', 'dict', 170, 0, {size: 64}), l1: link('r', 'p'), l2: link('p', 'd')}},
    {title: 'json.dumps goes back to text', code: `json.dumps({"confirmed": True, "waitlist": None})`, out: '\'{"confirmed": true, "waitlist": null}\'', body: `To send data to a server, turn it into JSON text with <code>json.dumps</code>.`,
     set: {b: link('d', 'r', {dash: true, label: 'dumps'})}},
    {title: 'Messy text breaks JSON', code: `raw = "Sure! Here it is: {'pnr': '4521876390'}"`, out: 'JSONDecodeError: Expecting property name enclosed in double quotes', body: `Extra words and single quotes are not valid JSON. AI models often reply like this. <code>json.loads</code> raises <code>JSONDecodeError</code>.`,
     set: {b: null, d: null, l2: null, r: {v: "Sure! Here it is..."}, e: err('JSONDecodeError', 170, 0, {size: 70})}},
    {title: 'Clean up, then parse', code: `match = re.search(r"\\{.*\\}", raw, re.S)\nargs = json.loads(match.group())`, body: `Pull out the part between the first { and the last }, then parse it. Ask the AI model for JSON-only output so this happens less.`,
     set: {e: null, c: fn('extract {...}', -60, -130, {size: 64}), d: box('dict', 'dict', 170, 0, {size: 64}), l2: link('p', 'd')}},
    {title: 'Still broken? Ask again', code: `except json.JSONDecodeError as e:\n    ask_model(f"Invalid JSON: {e}. Reply with JSON only.")`, body: `Wrap the parse in try/except and send the error back. An AI model fixes its own output on the next turn.`,
     set: {fix: note('p', 'Invalid JSON → ask again', {z: 40})}},
  ]},

  35: {title: 'The attendance sheet', file: 'files.py', count: false, empty: 'no paths yet', scenes: [
    {title: 'Paths are objects', code: `from pathlib import Path\nfolder = Path("college")`, body: `Divya keeps her class's attendance sheets in a folder. A <code>Path</code> knows how to join, check and read files on any computer.`,
     set: {D: shelf(-100, 0, 280, {h: 250, alt: true, label: 'college/'})}},
    {title: '/ joins path parts', code: `sheet = folder / "attendance.csv"\nsheet.name, sheet.suffix`, out: "('attendance.csv', '.csv')", body: `The <code>/</code> operator builds paths. <code>.name</code>, <code>.stem</code> and <code>.suffix</code> read the pieces.`,
     set: {f1: box('attendance.csv', 'path', -170, -60, {size: 60})}},
    {title: 'Read the whole file', code: `text = sheet.read_text(encoding="utf-8")`, body: `<code>read_text</code> opens, reads and closes the file in one call. Always pass <code>encoding="utf-8"</code> so Tamil, Telugu, Kannada and Malayalam names stay correct.`,
     set: {t: box('"name,attended..."', 'str', 140, -60, {size: 64}), l: link('f1', 't', {label: 'read_text'})}},
    {title: 'Check before you read', code: `if not sheet.exists():\n    print("No attendance sheet yet")`, body: `<code>exists()</code>, <code>is_file()</code> and <code>is_dir()</code> let you show a clear message instead of a crash.`,
     set: {ok: note('f1', 'exists() → True', {z: 40})}},
    {title: 'glob finds many files', code: `sheets = list(Path("college").glob("*.csv"))`, body: `<code>glob("*.csv")</code> returns every CSV in a folder. AI agents load a whole knowledge base this way.`,
     set: {ok: null, f2: box('cse.csv', 'path', -170, 60, {size: 50}), f3: box('ece.csv', 'path', -100, 60, {size: 50}), f4: box('mech.csv', 'path', -30, 60, {size: 50}), K: shelf(150, 70, 160, {h: 100, label: 'sheets (list)'})}},
    {title: 'CSV and JSON in one line each', code: `rows = list(csv.DictReader(open("cse.csv", encoding="utf-8")))\ncfg = json.loads(Path("settings.json").read_text())`, body: `Read CSV rows as dicts with <code>csv.DictReader</code>. Read JSON settings with json.loads on the text.`,
     set: {c1: box('settings.json', 'path', 140, -150, {size: 54}), c2: box('cse.csv', 'path', 30, -150, {size: 54})}},
  ]},

  36: {title: 'Keeping the SMS key secret', file: 'settings.py', count: false, empty: 'no settings yet', scenes: [
    {title: 'A key in the code leaks', code: `sms = SmsClient(api_key="live-9f2c...")`, body: `Arjun's college app sends SMS alerts. If he pushes this to GitHub, bots find the key within minutes and send spam on his account.`,
     set: {k: box('"live-9f2c..."', 'str', -100, 0, {glow: true}), w: note('k', 'leaked to GitHub', {bad: true, z: 40})}},
    {title: 'Put secrets in the environment', code: `# .env  (never committed)\nSMS_API_KEY=live-9f2c...\nCOLLEGE=PSG Tech`, body: `A <code>.env</code> file holds settings for your own computer. Add it to <code>.gitignore</code> so it never reaches GitHub.`,
     set: {k: null, w: null, E: shelf(-150, 0, 180, {h: 200, alt: true, label: '.env (ignored by git)'}), e1: box('KEY', 'str', -150, -40, {size: 50}), e2: box('COLLEGE', 'str', -150, 50, {size: 50})}},
    {title: 'load_dotenv copies it in', code: `from dotenv import load_dotenv\nload_dotenv()`, body: `<code>load_dotenv()</code> reads the file and puts each line into <code>os.environ</code>, the program's environment.`,
     set: {O: shelf(130, 0, 200, {h: 200, label: 'os.environ'}), l: link('E', 'O', {label: 'load_dotenv'})}},
    {title: 'Read with a default', code: `college = os.getenv("COLLEGE", "Anna University")\nkey = os.environ["SMS_API_KEY"]`, body: `<code>getenv</code> returns a default when the setting is missing. <code>os.environ[...]</code> raises KeyError, which is what you want for a required key.`,
     set: {m: box('"PSG Tech"', 'str', 130, -40, {size: 54}), kk: box('"live-..."', 'str', 130, 50, {size: 54})}},
    {title: 'Everything is text', code: `retries = int(os.getenv("MAX_RETRIES", "3"))`, body: `Environment values are always text. Convert numbers and flags yourself, just like form input.`,
     set: {r: box('"3" → 3', 'int', 0, 150, {size: 54})}},
    {title: 'Same code everywhere', body: `Your laptop, a test server and Vercel each set their own settings. The code never changes. AI API keys work exactly the same way.`,
     set: {v: note('O', 'laptop · test · Vercel', {z: 60})}},
  ]},

  37: {title: 'Will it rain in Chennai?', file: 'weather.py', count: false, empty: 'no request yet', scenes: [
    {title: 'Code that talks to the internet', code: `import requests\nres = requests.get(\n    "https://api.example.com/weather",\n    params={"city": "Chennai"}, timeout=10)`, body: `Karthik's app asks a weather service if it will rain in Chennai. <code>params</code> builds the query for you. <code>timeout</code> stops a slow server from freezing the app.`,
     set: {a: fn('your app', -170, 0), s: box('server', 'class', 170, 0, {size: 80}), q: link('a', 's', {label: 'GET ?city=Chennai'})}},
    {title: 'Check the status code', code: `res.status_code`, out: '200', body: `200 means OK. 4xx means your request was wrong (404 not found, 401 bad key). 5xx means the server failed.`,
     set: {st: note('s', '200 OK', {z: 40})}},
    {title: 'Read the JSON body', code: `data = res.json()\ndata["rain_chance"]`, out: '80', body: `<code>.json()</code> turns the response text into a dict, exactly like <code>json.loads</code>. 80% chance of rain: carry an umbrella.`,
     set: {d: box('dict', 'dict', 0, 120, {size: 60}), b: link('s', 'd', {label: '.json()'})}},
    {title: 'Turn errors into exceptions', code: `res.raise_for_status()`, out: 'HTTPError: 404 Client Error: Not Found', body: `<code>raise_for_status()</code> raises for any 4xx or 5xx, so you never read an error page as if it were weather data.`,
     set: {st: note('s', '404', {bad: true, z: 40})}},
    {title: 'Always set a timeout', code: `requests.get(url, timeout=10)`, out: 'requests.exceptions.Timeout', body: `Without a timeout, a stuck server can block forever. With one, you get an error you can retry with backoff.`,
     set: {st: note('s', 'timeout after 10s', {bad: true, z: 40})}},
    {title: 'httpx for many calls at once', code: `async with httpx.AsyncClient(timeout=10) as client:\n    r = await client.get(url, params={"city": city})`, body: `httpx works almost like requests, plus async, so an app can ask for Chennai, Kochi and Vizag weather at the same time. AI agents call several tools at once this way.`,
     set: {st: note('s', '200 OK', {z: 40}), a2: fn('Kochi call', -170, -140, {size: 56}), q2: link('a2', 's', {dash: true})}},
  ]},

  38: {title: 'Cleaning a messy SMS', file: 'sms.py', count: false, empty: 'no text yet', scenes: [
    {title: 're finds patterns in text', code: `import re\nre.findall(r"\\d{10}", sms)`, out: "['4521876390', '9876543210']", body: `A train SMS mixes a PNR, a phone number and a pincode. <code>\\d{10}</code> means exactly ten digits. <code>findall</code> returns every match.`,
     set: {t: box('"PNR 452187..."', 'str', -170, -60, {size: 64}), m1: box('"4521876390"', 'str', 0, -60, {size: 46}), m2: box('"9876543210"', 'str', 80, -60, {size: 46})}},
    {title: 're.sub hides private parts', code: `re.sub(r"\\d{6}(\\d{4})", r"XXXXXX\\1", sms)`, body: `Replace the first six digits of every phone number before you share a screenshot.`,
     set: {c: fn('re.sub', 170, -60, {size: 56})}},
    {title: 'Counter counts things', code: `from collections import Counter\nCounter(orders).most_common(1)`, out: "[('Biryani', 3)]", body: `Counter is a dict that counts. One line gives the most ordered dish at the canteen.`,
     set: {k: box('Counter', 'dict', -170, 90, {size: 60})}},
    {title: 'deque keeps the last N', code: `from collections import deque\nrecent = deque(maxlen=3)`, body: `A deque with <code>maxlen</code> drops the oldest item when full. Perfect for "show the last 3 orders", or an AI agent's last 3 messages.`,
     set: {Q: shelf(60, 90, 240, {h: 80, slots: 3, label: 'deque(maxlen=3)'}), q1: box('o2', 'str', -20, 90, {size: 44}), q2: box('o3', 'str', 60, 90, {size: 44}), q3: box('o4', 'str', 140, 90, {size: 44, glow: true}), out: note('Q', 'o1 dropped', {z: 50})}},
    {title: 'Dates and unique ids', code: `from datetime import date\n(date(2026, 1, 14) - date.today()).days\nstr(uuid.uuid4())`, body: `Count the days to Pongal, and give every order a unique id so it is easy to track.`,
     set: {q3: {glow: false}, out: null, ts: box('days left', 'int', 200, -150, {size: 50}), id: box('uuid', 'str', 120, -150, {size: 50})}},
    {title: 'Check the standard library first', body: `re, collections, itertools, functools, datetime, json and pathlib solve most everyday problems. They are fast, tested and already installed.`,
     set: {n: note('k', 'batteries included', {z: 40})}},
  ]},
};

export const games = {
  32: {title: 'Exception tracer', show: 'card', q: 'What does it print?', items: [
    card('try:\n    int("two hundred")\nexcept ValueError:\n    print("caught")', 'caught', ['caught', 'ValueError', 'nothing'], 'caught', 'The matching except block runs.'),
    card('try:\n    paid = True\nexcept ValueError:\n    print("bad")\nelse:\n    print("receipt")', 'receipt', ['bad', 'receipt', 'bad receipt'], 'receipt', 'else runs when there was no error.'),
    card('try:\n    {}["coupon"]\nexcept KeyError:\n    print("A")\nfinally:\n    print("B")', 'A B', ['A', 'B', 'A B'], 'A\nB', 'finally always runs, after except.'),
    card('try:\n    int("x")\nexcept KeyError:\n    print("caught")', 'ValueError', ['caught', 'ValueError', 'nothing'], 'ValueError: invalid literal', 'except KeyError does not match a ValueError, so it escapes.'),
    card('def pay():\n    try:\n        return "paid"\n    finally:\n        print("close screen")\nprint(pay())', 'close screen paid', ['paid', 'close screen paid', 'close screen'], 'close screen\npaid', 'finally runs even when try returns.'),
  ]},
  33: {title: 'Retry or not?', show: 'card', choices: ['retry', 'fail fast'], prose: true, q: 'Should the app retry this error?', items: [
    card('Train site says\n"server busy" at 10 AM', 'retry', null, 'wait and retry', 'Busy servers usually recover after a short wait.'),
    card('Wrong UPI PIN', 'fail fast', null, 'tell the user', 'The same wrong PIN will never start working.'),
    card('AI model API:\n503 Overloaded', 'retry', null, 'wait and retry', 'The server is busy; backoff gives it time.'),
    card('AI model API:\n401 Unauthorized (bad key)', 'fail fast', null, 'fix the key', 'A wrong key never starts working on its own.'),
    card('Read timeout after 10s', 'retry', null, 'retry with backoff', 'Timeouts are usually temporary.'),
  ]},
  34: {title: 'JSON parser', show: 'card', q: 'What happens?', items: [
    card('json.loads(\'{"berth": 32}\')["berth"]', '32', ['32', "'32'", 'Error'], '32', 'JSON numbers become ints.'),
    card("json.loads(\"{'status': 'CNF'}\")", 'JSONDecodeError', ["{'status': 'CNF'}", 'JSONDecodeError'], 'JSONDecodeError', 'JSON needs double quotes.'),
    card('json.loads("true")', 'True', ['True', "'true'", 'Error'], 'True', 'JSON true becomes Python True.'),
    card('json.dumps({"waitlist": None})', '\'{"waitlist": null}\'', ['\'{"waitlist": null}\'', '\'{"waitlist": None}\'', 'Error'], '\'{"waitlist": null}\'', 'Python None becomes JSON null.'),
    card('json.loads("[1, 2,]")', 'JSONDecodeError', ['[1, 2]', 'JSONDecodeError'], 'JSONDecodeError', 'Trailing commas are not allowed in JSON.'),
    card('type(json.loads(\'{"coaches": ["S4"]}\')["coaches"]).__name__', 'list', ['list', 'tuple', 'str'], 'list', 'JSON arrays become lists.'),
  ]},
  35: {title: 'Path lab', show: 'card', q: 'What does it give?', items: [
    card('Path("photos") / "ooty.jpg"', 'photos/ooty.jpg', ['photos/ooty.jpg', 'photosooty.jpg', 'TypeError'], "PosixPath('photos/ooty.jpg')", '/ joins path parts (Windows shows a backslash).'),
    card('Path("attendance.csv").suffix', '.csv', ['.csv', 'csv', 'attendance'], "'.csv'", '.suffix includes the dot.'),
    card('Path("attendance.csv").stem', 'attendance', ['attendance', 'attendance.csv', '.csv'], "'attendance'", '.stem is the name without the suffix.'),
    card('Path("missing.txt").read_text()', 'FileNotFoundError', ["''", 'None', 'FileNotFoundError'], 'FileNotFoundError', 'Reading a missing file raises. Check exists() first.'),
    card('Path("college").glob("*.csv")', 'a generator', ['a list', 'a generator', 'a str'], '<generator object ...>', 'Wrap it in list() to get a list.'),
  ]},
  36: {title: 'Secret keeper', show: 'card', q: 'What happens?', items: [
    card('# COLLEGE is not set\nos.getenv("COLLEGE", "Anna University")', 'Anna University', ['Anna University', 'None', 'KeyError'], "'Anna University'", 'getenv returns the default.'),
    card('# SMS_API_KEY is not set\nos.environ["SMS_API_KEY"]', 'KeyError', ['None', "''", 'KeyError'], "KeyError: 'SMS_API_KEY'", 'Square brackets raise for a missing setting.'),
    card('# RETRIES=3\nos.environ["RETRIES"] + 1', 'TypeError', ['4', '31', 'TypeError'], 'TypeError', 'The value is the text "3".'),
    P('Should .env be\ncommitted to GitHub?', 'no', ['yes', 'no'], 'no', 'Add .env to .gitignore. Commit a .env.example without real values.'),
    card('# DEBUG=False\nbool(os.getenv("DEBUG"))', 'True', ['True', 'False'], 'True', '"False" is non-empty text. Compare the text instead.'),
  ]},
  37: {title: 'HTTP status check', show: 'card', q: 'What does it mean?', items: [
    card('res.status_code == 200', 'success', ['success', 'client error', 'server error'], 'OK', '2xx means the request worked.'),
    card('res.status_code == 404', 'client error', ['success', 'client error', 'server error'], 'Not Found', '4xx: your request was wrong (a wrong address here).'),
    card('res.status_code == 503', 'server error', ['success', 'client error', 'server error'], 'Service Unavailable', '5xx: the server failed. Retry with backoff.'),
    card('res.raise_for_status()\n# status 401', 'HTTPError', ['nothing', 'HTTPError'], 'HTTPError: 401 Unauthorized', 'Any 4xx or 5xx raises.'),
    card('requests.get(url)\n# no timeout, server stuck', 'waits forever', ['waits forever', 'Timeout after 10s'], '(blocked)', 'Always pass timeout=.'),
    card('type(res.json()).__name__\n# body: {"temp_c": 31}', 'dict', ['dict', 'str', 'Response'], 'dict', '.json() parses the body.'),
  ]},
  38: {title: 'Toolbox quiz', show: 'card', q: 'What does it give?', items: [
    card('re.findall(r"\\d+", "S4 berth 32")', "['4', '32']", ["['4', '32']", "['S4', '32']", '[4, 32]'], "['4', '32']", '\\d+ matches runs of digits, as strings.'),
    card('re.sub(r"\\s+", " ", "Masala   Dosa")', "'Masala Dosa'", ["'Masala Dosa'", "'Masala   Dosa'", "'MasalaDosa'"], "'Masala Dosa'", '\\s+ matches runs of spaces.'),
    card('Counter(["Dosa", "Dosa", "Vada"]).most_common(1)', "[('Dosa', 2)]", ["[('Dosa', 2)]", "['Dosa']", "{'Dosa': 2}"], "[('Dosa', 2)]", 'A list of (item, count) pairs.'),
    card('d = deque(["o1", "o2", "o3"], maxlen=3)\nd.append("o4")\nlist(d)', "['o2', 'o3', 'o4']", ["['o2', 'o3', 'o4']", "['o1', 'o2', 'o3', 'o4']", "['o1', 'o2', 'o3']"], "['o2', 'o3', 'o4']", 'The oldest order is dropped.'),
    card('list(itertools.islice(["Rohit", "Gill", "Kohli"], 2))', "['Rohit', 'Gill']", ["['Rohit', 'Gill']", "['Gill', 'Kohli']", "['Rohit']"], "['Rohit', 'Gill']", 'islice takes the first 2 items.'),
    card('len(str(uuid.uuid4()))', '36', ['32', '36', '16'], '36', '32 hex digits plus 4 dashes.'),
  ]},
};

export const mountStory = (n, el) => story(el, stories[n]);
export const mountGame = (n, el) => game(el, games[n]);
