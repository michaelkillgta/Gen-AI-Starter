/* eslint-disable */
// @ts-nocheck
/* Parts VI and VII · Engineering practices and the Gen AI ecosystem (lessons 39-46): story and game data for the engine. */
import { story, game } from "./engine";

const box = (v, t, x, y, more) => ({kind: 'box', v, t, x, y, ...(more || {})});
const fn = (v, x, y, more) => box(v, 'function', x, y, {size: 76, ...(more || {})});
const err = (v, x, y, more) => box(v, 'error', x, y, {size: 60, ...(more || {})});
const shelf = (x, y, w, more) => ({kind: 'shelf', x, y, w, ...(more || {})});
const note = (on, text, more) => ({kind: 'note', on, text, ...(more || {})});
const link = (from, to, more) => ({kind: 'link', from, to, ...(more || {})});
const card = (show, a, o, out, why, q) => ({show, code: show, a, o, out, why, ...(q ? {q} : {})});
const P = (...args) => ({...card(...args), prose: true});

export const stories = {
  39: {title: 'Priya\'s exam hall', file: 'hall.py', count: false, empty: 'hall closed', scenes: [
    {title: 'Some things must be closed', code: `f = open("hall_ticket.txt")\n# ... forgot f.close()`, body: `Priya's college opens Hall B for the exam. Someone must unlock it before and lock it after, every time. Files and connections are the same: forget to close them and they leak.`,
     set: {H: shelf(0, 0, 300, {h: 220, alt: true, label: 'Hall B'}), f: box('file', 'path', -60, 0, {size: 60, glow: true}), w: note('f', 'still open', {bad: true, z: 40})}},
    {title: 'with does it for you', code: `with open("hall_ticket.txt") as f:\n    print(f.read())`, body: `<code>with</code> opens the file, runs your block, then closes it. You never write <code>close()</code>.`,
     set: {w: null, f: {glow: false}, ok: note('H', 'closed after the block', {z: 60})}},
    {title: '__enter__ runs first', code: `def __enter__(self):\n    print("Unlock Hall B")\n    return self`, body: `When the <code>with</code> line runs, Python calls <code>__enter__</code>. Its return value is the name after <code>as</code>.`,
     set: {ok: null, f: null, e: fn('__enter__', -200, -110, {size: 62}), l1: link('e', 'H', {label: 'unlock'})}},
    {title: '__exit__ runs last', code: `def __exit__(self, exc_type, exc, tb):\n    print("Lock Hall B")`, body: `When the block ends, Python calls <code>__exit__</code>. It runs on success, on return, and on errors.`,
     set: {x: fn('__exit__', 200, 110, {size: 62}), l2: link('H', 'x', {label: 'lock'})}},
    {title: 'Even during a fire alarm', code: `with ExamHall():\n    raise RuntimeError("fire alarm")`, out: 'Lock Hall B\nRuntimeError: fire alarm', body: `The error flies out of the block, but <code>__exit__</code> locks the hall on the way out. Then the error keeps going up to whoever catches it.`,
     set: {a: err('fire alarm', 0, 0, {glow: true}), n: note('x', 'still runs', {z: 40})}},
    {title: '@contextmanager is the short way', code: `@contextmanager\ndef hall(name):\n    print("Unlock")\n    try:\n        yield\n    finally:\n        print("Lock")`, body: `Before <code>yield</code> is the enter part, after it the exit part. AI agents use this for HTTP clients, database sessions and token budgets.`,
     set: {a: null, n: null, g: box('yield', 'generator', 0, -140, {size: 56})}},
  ]},

  40: {title: 'Lakshmi\'s food court counter', file: 'counter.py', count: false, empty: 'no orders yet', scenes: [
    {title: 'Waiting one by one', code: `for dish in orders:\n    cook(dish)        # stand at the stove`, body: `Lakshmi takes an order, then stands at the stove until it is ready, then takes the next. Dosa 5 min, biryani 10, coffee 3: the queue waits 18 minutes.`,
     set: {T: shelf(0, 0, 470, {h: 90, slots: 3, labels: ['Dosa 5', 'Biryani 10', 'Coffee 3'], label: 'one after another'}), d1: box('Dosa', 'str', -155, 0, {size: 50}), t: note('T', '18 minutes', {bad: true, z: 50})}},
    {title: 'async def can pause', code: `async def cook(dish, minutes):\n    await asyncio.sleep(minutes)`, body: `An <code>async</code> function can pause at <code>await</code>. While a dish cooks, Lakshmi is free to take the next order.`,
     set: {t: null, c: fn('async cook', -170, -130, {size: 64})}},
    {title: 'The event loop switches', code: `asyncio.run(main())`, body: `The <b>event loop</b> is Lakshmi herself: she keeps a list of paused jobs and switches to whichever one is ready.`,
     set: {L: box('event loop', 'class', 170, -130, {size: 70, glow: true}), l: link('L', 'c', {label: 'switches'})}},
    {title: 'gather cooks them together', code: `await asyncio.gather(cook("Dosa", 5),\n    cook("Biryani", 10), cook("Coffee", 3))`, out: "['Dosa ready', 'Biryani ready', 'Coffee ready']", body: `All three start at once. The total time is the longest dish, 10 minutes, not 18. Results come back in the order you asked.`,
     set: {L: {glow: false}, T: {label: 'all at once', labels: ['Dosa', 'Biryani', 'Coffee']}, d2: box('Biryani', 'str', 0, 0, {size: 50}), d3: box('Coffee', 'str', 155, 0, {size: 50}), t2: note('T', '10 minutes', {z: 50})}},
    {title: 'Only 2 stoves', code: `stoves = asyncio.Semaphore(2)\nasync with stoves:\n    ...`, body: `A <code>Semaphore(2)</code> lets two dishes cook at a time; the third waits. AI APIs limit how many calls you make, and agents respect that this way.`,
     set: {t2: null, s: box('Semaphore(2)', 'class', 0, 140, {size: 60})}},
    {title: 'Do not block the loop', code: `time.sleep(5)        # freezes everyone\nawait asyncio.sleep(5)  # lets others run`, body: `<code>time.sleep</code> inside async code is Lakshmi staring at the stove again: nobody else is served. Always <code>await</code> the waiting.`,
     set: {b: note('L', 'time.sleep blocks all', {bad: true, z: 50})}},
  ]},

  41: {title: 'Arjun\'s two projects', file: 'setup.sh', count: false, empty: 'no projects yet', scenes: [
    {title: 'One laptop, two projects', body: `Arjun's final-year project needs pydantic 2. His friend's hackathon code needs pydantic 1. Installed into the same Python, one of them breaks.`,
     set: {A: shelf(-140, 0, 200, {h: 200, alt: true, label: 'final-year project'}), B: shelf(140, 0, 200, {h: 200, alt: true, label: 'hackathon code'}), p: box('pydantic ?', 'str', 0, -150, {size: 60, glow: true}), w: note('p', 'which version?', {bad: true, z: 40})}},
    {title: 'A venv per project', code: `$ python -m venv .venv\n$ source .venv/bin/activate`, body: `A <b>virtual environment</b> is a private folder of packages inside each project. Activate it and pip installs go there.`,
     set: {p: null, w: null, va: box('.venv', 'path', -140, 60, {size: 54}), vb: box('.venv', 'path', 140, 60, {size: 54})}},
    {title: 'Each gets its own version', code: `(.venv) $ pip install "pydantic>=2.5,<3"`, body: `Project A gets pydantic 2, project B keeps pydantic 1. Neither knows about the other.`,
     set: {pa: box('pydantic 2.11', 'str', -140, -50, {size: 52}), pb: box('pydantic 1.10', 'str', 140, -50, {size: 52})}},
    {title: 'Versions are numbers, part by part', code: `"2.10" > "2.9"      # False as text\n(2, 10) > (2, 9)    # True as numbers`, body: `pip compares each part of a version as a number. <code>>=2.5,<3</code> means 2.5 or newer, but stop before 3.`,
     set: {r: note('pa', '>=2.5,<3', {z: 50})}},
    {title: 'pyproject.toml describes it', code: `[project]\nname = "hostel-bot"\ndependencies = ["pydantic>=2.5,<3"]`, body: `One file lists the project name, the Python version and the dependencies. Commit it; never commit <code>.venv</code>.`,
     set: {r: null, t: box('pyproject.toml', 'path', -140, -150, {size: 58})}},
    {title: 'uv does it all, fast', code: `$ uv add pydantic httpx\n$ uv run main.py`, body: `uv makes the venv, edits pyproject.toml and writes <code>uv.lock</code> with exact versions. A teammate runs <code>uv sync</code> and gets the same setup. AI agent projects start exactly this way.`,
     set: {k: box('uv.lock', 'path', 0, -150, {size: 54, glow: true})}},
  ]},

  42: {title: 'The cab app at midnight', file: 'cab.py', count: false, empty: 'no logs yet', scenes: [
    {title: 'Something broke, nobody knows what', body: `Kavya's cab app in Bengaluru failed at midnight. The code only had a few prints, and those went nowhere on the server.`,
     set: {a: fn('book_ride', -150, 0), e: err('???', 120, 0, {glow: true}), q: note('e', 'no clue', {bad: true, z: 40})}},
    {title: 'Logs with levels', code: `log.info("Ride booked")\nlog.warning("Driver 12 min away")\nlog.error("Payment failed")`, body: `Each message gets a level: DEBUG, INFO, WARNING, ERROR. On the server you keep INFO and above; on your laptop you can show DEBUG too.`,
     set: {q: null, e: null, Lg: shelf(120, 0, 220, {h: 220, slots: 3, labels: ['INFO', 'WARNING', 'ERROR'], label: 'log'}), l1: link('a', 'Lg', {label: 'log'})}},
    {title: 'The log shows the cause', code: `ERROR cab: Payment failed for ride R-104`, body: `Now the midnight failure has a time, a ride id and a reason. Kavya can fix the right thing.`,
     set: {f: note('Lg', 'Payment failed R-104', {z: 60})}},
    {title: 'A test proves the fix', code: `def test_fare():\n    assert fare(2) == 86`, body: `A test is a function that checks an answer with <code>assert</code>. pytest finds every <code>test_</code> function and runs it.`,
     set: {f: null, t: fn('test_fare', -150, -140, {size: 60}), ok: note('t', 'passed', {z: 40})}},
    {title: 'Do not call the real AI model', code: `fake = Mock(return_value="via outer ring road")`, body: `The app asks an AI model for the best route. In tests a <code>Mock</code> pretends to be the model: free, fast and the same answer every time.`,
     set: {m: box('Mock', 'class', -150, 140, {size: 60, glow: true}), l2: link('m', 'a', {label: 'fake answer', dash: true})}},
    {title: 'Fail first, then succeed', code: `Mock(side_effect=[TimeoutError(), "Book the 7:10 cab"])`, body: `<code>side_effect</code> makes the fake model time out once and then answer, so you can test your retry code without waiting.`,
     set: {m: {glow: false}, s: note('m', 'timeout, then answer', {z: 40})}},
  ]},

  43: {title: 'Rahul\'s metro card API', file: 'main.py', count: false, empty: 'server idle', scenes: [
    {title: 'The phone asks a server', code: `GET /balance?card=KM-2231`, body: `Rahul's Kochi Metro app shows the card balance. The phone sends a request; his Python server answers with JSON.`,
     set: {ph: box('phone app', 'class', -180, 0, {size: 66}), S: shelf(110, 0, 260, {h: 220, alt: true, label: 'FastAPI app'}), q: link('ph', 'S', {label: 'GET /balance'})}},
    {title: 'A decorator registers the route', code: `@app.get("/balance")\nasync def balance():\n    return {"balance": 140}`, body: `<code>@app.get</code> saves your function in a table of routes, exactly like the decorators in lesson 17.`,
     set: {r: fn('balance()', 110, -50, {size: 60})}},
    {title: 'Pydantic checks the body', code: `class Recharge(BaseModel):\n    card: str\n    amount: int = Field(gt=0)`, body: `A recharge request carries JSON. FastAPI checks it with a Pydantic model before your function runs.`,
     set: {m: box('Recharge', 'class', 110, 60, {size: 60})}},
    {title: 'Bad body? 422', code: `{"card": "KM-2231", "amount": "five hundred"}`, out: '422 Unprocessable Entity', body: `"five hundred" is not an int. FastAPI answers 422 with the reason, and your function never runs.`,
     set: {x: err('422', -40, -130, {glow: true}), q2: link('S', 'ph', {label: '422', dash: true})}},
    {title: '200 or 404', code: `raise HTTPException(status_code=404, detail="Card not found")`, body: `A good body gets 200 and the new balance. A card that does not exist gets 404, raised by your code.`,
     set: {x: null, o: note('S', '200 · 404 · 422', {z: 60})}},
    {title: 'Stream the reply', code: `return StreamingResponse(stream_reply())`, body: `A generator yields the answer word by word and FastAPI sends each piece at once. AI chat apps show replies as they are written this way.`,
     set: {o: null, g: box('yield words', 'generator', -40, 140, {size: 56})}},
  ]},

  44: {title: 'Sai\'s Vizag trip assistant', file: 'assistant.py', count: false, empty: 'no messages yet', scenes: [
    {title: 'A chat is a list', code: `messages = [{"role": "user", "content": "Plan a day in Vizag"}]`, body: `Sai's assistant sends the whole conversation each time. The model remembers nothing between calls: the list is the memory.`,
     set: {M: shelf(-120, 0, 230, {h: 240, slots: 3, labels: ['user', 'assistant', 'user'], label: 'messages'}), u1: box('user', 'dict', -120, -80, {size: 50})}},
    {title: 'The model replies', code: `response = client.messages.create(model=..., messages=messages)`, body: `The reply has text and <code>usage</code>: tokens in and out, which is the bill. Sai appends the reply to the list.`,
     set: {AI: box('AI model', 'class', 170, 0, {size: 76}), l: link('M', 'AI', {label: 'send all'}), a1: box('assistant', 'dict', -120, 0, {size: 50})}},
    {title: 'Describe a tool', code: `{"name": "get_weather",\n "input_schema": {"properties": {"city": ...}}}`, body: `A tool is a name, a description and a JSON schema. The model reads it and knows it can ask for the weather.`,
     set: {t: fn('get_weather', 170, -140, {size: 60})}},
    {title: 'The model asks, your code runs', code: `{"type": "tool_use", "name": "get_weather",\n "input": {"city": "Vizag"}}`, body: `The model never runs code. It sends a <code>tool_use</code> block. Sai's Python calls <code>get_weather("Vizag")</code>.`,
     set: {u: note('AI', 'tool_use: get_weather', {z: 50}), r: link('AI', 't', {dash: true, label: 'please call'})}},
    {title: 'Send the result back', code: `{"type": "tool_result", "tool_use_id": "toolu_01",\n "content": "Vizag: 30 C, humid"}`, body: `The result goes back as a <code>tool_result</code> with the same id. Then the model writes the final answer.`,
     set: {u: null, u2: box('tool_result', 'dict', -120, 80, {size: 50, glow: true})}},
    {title: 'Ask for checked JSON', code: `plan = DayPlan.model_validate_json(raw)`, body: `For data, ask for JSON and check it with Pydantic. A wrong shape fails at once instead of breaking the app later.`,
     set: {u2: {glow: false}, d: box('DayPlan', 'class', 170, 140, {size: 60})}},
  ]},

  45: {title: 'Nithya\'s rulebook bot', file: 'rag.py', count: false, empty: 'no chunks yet', scenes: [
    {title: 'The model does not know your rules', body: `Students in Nithya's Mysuru college ask "Can I write the exam with 70% attendance?". A plain AI model guesses. The answer is in the handbook.`,
     set: {bk: box('handbook', 'str', -180, 0, {size: 76}), q: note('bk', '120 pages', {z: 40})}},
    {title: 'Cut it into chunks', code: `chunks = chunk(handbook, size=200, overlap=40)`, body: `Split the book into small pieces with a little overlap, so no rule is cut in half.`,
     set: {q: null, c1: box('attendance', 'str', -40, -110, {size: 46}), c2: box('medical', 'str', -40, -30, {size: 46}), c3: box('library', 'str', -40, 50, {size: 46}), c4: box('hostel', 'str', -40, 130, {size: 46})}},
    {title: 'Turn chunks into vectors', code: `vector = embed(chunk)`, body: `An embedding model turns each chunk into a list of numbers. Texts with similar meaning get similar numbers.`,
     set: {DB: shelf(150, 10, 190, {h: 300, alt: true, label: 'vector DB'}), l: link('c2', 'DB', {label: 'embed'})}},
    {title: 'Find the nearest chunks', code: `hits = search("70% attendance, I was sick", k=2)`, body: `Embed the question too, then rank chunks by similarity and keep the top 2: the attendance rule and the medical leave rule.`,
     set: {c1: {glow: true}, c2: {glow: true}, k: note('DB', 'top k = 2', {z: 50})}},
    {title: 'Ground the prompt', code: `prompt = f"Answer only from these rules:\\n{context}\\nQuestion: {q}"`, body: `Put only those chunks in the prompt and ask the model to cite the rule number. The answer now comes from the handbook.`,
     set: {k: null, AI: box('AI model', 'class', 150, -150, {size: 60}), p: link('c1', 'AI', {label: 'context'})}},
    {title: 'Wrong chunk, wrong answer', body: `If retrieval misses the right chunk, the model has nothing to ground on and may invent a rule. When a RAG bot is wrong, check what it retrieved first.`,
     set: {c1: {glow: false}, c2: {glow: false}, c4: {glow: true}, w: note('c4', 'missed?', {bad: true, z: 40})}},
  ]},

  46: {title: 'Vikram\'s train trip agent', file: 'agent.py', count: false, empty: 'no steps yet', scenes: [
    {title: 'A question that needs tools', code: `"Is my ticket confirmed, and what should I pack?"`, body: `Vikram is taking the train from Chennai to Bengaluru. The answer needs his PNR status and the weather. The model cannot know either without tools.`,
     set: {H: shelf(-150, 0, 200, {h: 260, slots: 3, labels: ['user', 'tool', 'tool'], label: 'history'}), u: box('question', 'dict', -150, -90, {size: 48}), AI: box('model', 'class', 150, 0, {size: 76})}},
    {title: 'The model asks for check_pnr', code: `{"tool": "check_pnr", "args": {"pnr": "4521876390"}}`, body: `Step 1: the model replies with a tool call, not an answer.`,
     set: {l1: link('H', 'AI', {label: 'ask'}), t1: fn('check_pnr', 150, -140, {size: 56, glow: true})}},
    {title: 'Your loop runs it', code: `result = TOOLS[name](**args)\nhistory.append({"role": "tool", "content": result})`, body: `The loop looks the tool up by name, runs it and adds the result to the history: confirmed, coach S4, berth 32.`,
     set: {t1: {glow: false}, r1: box('CNF S4 32', 'str', -150, 0, {size: 48})}},
    {title: 'Ask again: weather', code: `{"tool": "weather", "args": {"city": "Bengaluru"}}`, body: `Step 2: with the PNR in the history, the model now asks for the weather. Drizzle.`,
     set: {t2: fn('weather', 150, 140, {size: 56}), r2: box('drizzle', 'str', -150, 90, {size: 48})}},
    {title: 'An answer ends the loop', code: `if "answer" in reply:\n    return reply["answer"]`, out: "'Confirmed in S4, berth 32. Carry a jacket.'", body: `Step 3: the model has what it needs and answers. The loop stops. A <code>max_steps</code> guard stops it anyway if the model never finishes.`,
     set: {a: note('AI', 'final answer', {z: 60}), g: box('max_steps = 5', 'int', 0, -150, {size: 50})}},
    {title: 'LangGraph names the parts', code: `g.add_node("model", model_node)\ng.add_node("tools", tools_node)\ng.add_edge("tools", "model")`, body: `LangGraph draws this same loop as a graph: the model node, the tools node and the edge that goes back. Write it by hand once and every framework becomes easy to read.`,
     set: {a: null, e: link('t2', 'AI', {dash: true, label: 'edge back'})}},
  ]},
};

export const games = {
  39: {title: 'with-block tracer', show: 'card', q: 'What happens?', items: [
    card('with open("t.txt", "w") as f:\n    f.write("hi")\nprint(f.closed)', 'True', ['True', 'False', 'Error'], 'True', 'The file is closed as soon as the with block ends.'),
    card('class H:\n    def __enter__(self): return "Hall B"\n    def __exit__(self, *a): pass\nwith H() as h:\n    print(h)', 'Hall B', ['Hall B', '<H object>', 'None'], 'Hall B', 'The value after as is whatever __enter__ returns.'),
    card('# __exit__ prints "lock"\nwith Hall():\n    raise ValueError("x")', 'lock, then ValueError', ['ValueError only', 'lock, then ValueError', 'lock only'], 'lock\nValueError: x', '__exit__ runs first, then the error keeps going because __exit__ returned nothing.'),
    card('# __exit__ returns True\nwith Hall():\n    raise ValueError("x")\nprint("after")', 'after', ['after', 'ValueError'], 'after', 'Returning True swallows the error.'),
    P('Where does clean-up go in\na @contextmanager function?', 'after yield, in finally', ['before yield', 'after yield, in finally'], 'after yield, in finally', 'finally makes it run even if the block raised.'),
  ]},
  40: {title: 'Event loop quiz', show: 'card', q: 'What happens?', items: [
    card('async def f():\n    return 1\nprint(type(f()).__name__)', 'coroutine', ['int', 'coroutine', 'function'], 'coroutine', 'Calling an async function makes a coroutine; it has not run yet.'),
    P('gather(wait 0.2, wait 0.5, wait 0.3)\ntotal time?', 'about 0.5 s', ['about 1.0 s', 'about 0.5 s'], 'about 0.5 s', 'They wait together; the longest one sets the time.'),
    card('await asyncio.gather(cook("Dosa", 5), cook("Coffee", 1))', "['Dosa ready', 'Coffee ready']", ["['Dosa ready', 'Coffee ready']", "['Coffee ready', 'Dosa ready']"], "['Dosa ready', 'Coffee ready']", 'Results come back in the order you passed them, not finishing order.'),
    P('Semaphore(2), four 0.5 s jobs.\nTotal time?', 'about 1.0 s', ['about 0.5 s', 'about 1.0 s', 'about 2.0 s'], 'about 1.0 s', 'Two run, then the other two: two rounds of 0.5 s.'),
    P('time.sleep(1) inside\nan async def. Problem?', 'blocks everything', ['nothing', 'blocks everything'], 'blocks everything', 'It freezes the event loop. Use await asyncio.sleep.'),
  ]},
  41: {title: 'Setup check', show: 'card', q: 'What is it?', items: [
    card('"2.10" > "2.9"', 'False', ['True', 'False'], 'False', 'Text compares letter by letter, and "1" is smaller than "9".'),
    P('Does pydantic>=2.5,<3\nallow version 3.0?', 'no', ['yes', 'no'], 'no', '<3 stops just before version 3.'),
    P('Commit the .venv folder\nto GitHub?', 'no', ['yes', 'no'], 'no', 'It is big and machine-specific. Commit pyproject.toml and the lock file.'),
    P('Which file has the exact\nversions uv installed?', 'uv.lock', ['pyproject.toml', 'uv.lock', 'README.md'], 'uv.lock', 'pyproject.toml has the rules; uv.lock has the exact versions.'),
    card('import tomllib\ntomllib.loads(\'name = "bot"\')["name"]', "'bot'", ["'bot'", 'bot.toml', 'Error'], "'bot'", 'tomllib turns TOML text into a dict.'),
  ]},
  42: {title: 'Log or test?', show: 'card', q: 'What happens?', items: [
    card('# level=WARNING\nlog.info("searching")\nlog.error("payment failed")', 'only the error shows', ['both show', 'only the error shows', 'nothing shows'], 'ERROR: payment failed', 'INFO is below WARNING, so it is hidden.'),
    card('def test_fare():\n    assert 50 + 18 * 3 == 100\ntest_fare()', 'AssertionError', ['passes', 'AssertionError'], 'AssertionError', '50 + 54 is 104.'),
    card('m = Mock(return_value="OK")\nm("hi"); m("again")\nm.call_count', '2', ['1', '2', '"OK"'], '2', 'A Mock counts every call.'),
    card('m = Mock(side_effect=[ValueError(), "done"])\nm()', 'ValueError', ['"done"', 'ValueError'], 'ValueError', 'The first call raises; the second would return "done".'),
    P('pytest runs which\nfunctions?', 'test_ functions', ['all functions', 'test_ functions', 'main()'], 'test_ functions', 'In files named test_*.py, every function named test_* runs.'),
  ]},
  43: {title: 'Request or response?', show: 'card', q: 'What does the server answer?', items: [
    P('POST /recharge\n{"card": "KM-2231", "amount": 500}', '200', ['200', '404', '422'], '200 {"balance": 640}', 'A valid body and a known card.'),
    P('POST /recharge\n{"card": "KM-9999", "amount": 100}', '404', ['200', '404', '422'], '404 Card not found', 'The body is valid, but the card does not exist.'),
    P('POST /recharge\n{"card": "KM-2231", "amount": "five hundred"}', '422', ['200', '404', '422'], '422 Unprocessable Entity', 'Pydantic rejects it before your code runs.'),
    P('POST /recharge\n{"card": "KM-2231", "amount": -50}', '422', ['200', '404', '422'], 'Input should be greater than 0', 'Field(gt=0) forbids negative amounts.'),
    P('GET /stations/EDP\nroute: "/stations/{code}"', 'code = "EDP"', ['code = "EDP"', '404'], '{"code": "EDP", ...}', 'The {code} part of the path becomes a parameter.'),
  ]},
  44: {title: 'SDK check', show: 'card', q: 'What is it?', items: [
    P('Does the model remember\nthe last call by itself?', 'no', ['yes', 'no'], 'no', 'You send the whole messages list every time.'),
    P('Model replies with tool_use.\nWho runs the function?', 'your code', ['the model', 'your code'], 'your code', 'The model only asks; your code runs it and sends a tool_result.'),
    card('block = {"id": "toolu_01", ...}\n# reply\n{"type": "tool_result", "tool_use_id": ?}', '"toolu_01"', ['"toolu_01"', '"get_weather"'], '"toolu_01"', 'The result carries the same id as the request.'),
    P('Where does the API key go?', 'environment / .env', ['in the code', 'environment / .env'], 'os.environ', 'Never in the code (lesson 36).'),
    card('DayPlan.model_validate_json(\n  \'{"city": "Vizag"}\')', 'ValidationError', ['DayPlan', 'ValidationError'], 'ValidationError', 'places and budget_rs are missing.'),
  ]},
  45: {title: 'Retrieval check', show: 'card', q: 'What is it?', items: [
    P('Why add overlap\nbetween chunks?', 'no rule gets cut in half', ['save space', 'no rule gets cut in half'], 'no rule gets cut in half', 'A sentence split at a border still appears whole in one chunk.'),
    P('Scores: 0.62, 0.05, 0.41.\nTop 2?', '0.62 and 0.41', ['0.62 and 0.41', '0.05 and 0.41'], '0.62 and 0.41', 'Higher similarity means closer meaning.'),
    card('cosine(same text, same text)', '1.0', ['0.0', '1.0', '2.0'], '1.0', 'A vector points exactly the same way as itself.'),
    P('The bot invents a hostel rule.\nCheck first?', 'what was retrieved', ['the model size', 'what was retrieved'], 'what was retrieved', 'If the right chunk is missing, the model has nothing to ground on.'),
    P('Where do real embeddings\ncome from?', 'an embedding model', ['word counts', 'an embedding model'], 'an embedding model', 'Word counts only show the idea; real vectors capture meaning.'),
  ]},
  46: {title: 'Loop tracer', show: 'card', q: 'What does the loop do next?', items: [
    P('reply = {"tool": "weather",\n "args": {"city": "Ooty"}}', 'run the tool', ['run the tool', 'return the answer'], 'TOOLS["weather"](city="Ooty")', 'A tool call means: run it, add the result, ask again.'),
    P('reply = {"answer": "Carry a jacket"}', 'return the answer', ['run the tool', 'return the answer'], "'Carry a jacket'", 'An answer ends the loop.'),
    P('The model asked for "book_flight",\nwhich is not in TOOLS.', 'send "Tool error" back', ['crash', 'send "Tool error" back'], 'Tool error: no tool called book_flight', 'The model can fix its request on the next step.'),
    P('The model asks for tools\n50 times in a row.', 'stop at max_steps', ['loop forever', 'stop at max_steps'], 'Stopped: too many steps', 'The guard protects your bill and your users.'),
    P('In LangGraph, what makes\nit a loop?', 'the edge from tools back to model', ['add_node', 'the edge from tools back to model'], 'g.add_edge("tools", "model")', 'Nodes are steps; the edge back repeats them.'),
  ]},
};

export const mountStory = (n, el) => story(el, stories[n]);
export const mountGame = (n, el) => game(el, games[n]);
