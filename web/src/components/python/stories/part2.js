/* eslint-disable */
// @ts-nocheck
/* Part II · Functions (lessons 11-19): story and game data for the engine. */
import { story, game } from "./engine";

const box = (v, t, x, y, more) => ({kind: 'box', v, t, x, y, ...(more || {})});
const fn = (v, x, y, more) => box(v, 'function', x, y, {size: 84, ...(more || {})});
const tag = (on, more) => ({kind: 'tag', on, ...(more || {})});
const shelf = (x, y, w, more) => ({kind: 'shelf', x, y, w, ...(more || {})});
const note = (on, text, more) => ({kind: 'note', on, text, ...(more || {})});
const link = (from, to, more) => ({kind: 'link', from, to, ...(more || {})});
const scan = on => ({kind: 'scan', on});

export const stories = {
  11: {title: 'The bill split machine', file: 'split.py', count: false, empty: 'no function yet', scenes: [
    {title: 'def builds a machine', code: `def split_bill(total, people, tip=0):\n    return (total + tip) / people`, body: `Vignesh splits bills with his friends every weekend in Chennai. <code>def</code> does not run anything yet. It builds a <b>function</b>, a machine with input slots called <b>parameters</b>, and ties the name <code>split_bill</code> to it.`,
     set: {m: fn('split_bill', 0, -10), n: tag('m', {text: 'split_bill'})}},
    {title: 'Calling feeds the machine', code: `split_bill(1200, 4)`, body: `The call drops the <b>arguments</b> 1200 and 4 into the <code>total</code> and <code>people</code> slots. The machine runs its body from the top.`,
     set: {a: box('1200', 'int', -190, -60, {size: 56}), b: box('4', 'int', -190, 50, {size: 56}), l1: link('a', 'm', {label: 'total'}), l1b: link('b', 'm', {label: 'people'})}},
    {title: 'Defaults fill empty slots', body: `Nobody passed <code>tip</code>, so its default 0 is used. Defaults make the common call short, while a rare call can still say <code>tip=100</code>.`,
     set: {d: box('0', 'int', -60, 130, {size: 46}), l2: link('d', 'm', {label: 'tip', dash: true})}},
    {title: 'return sends a value back', out: '300.0', body: `<code>return</code> stops the function and hands a value back. Save it with a name: <code>share = split_bill(1200, 4)</code>.`,
     set: {r: box('300.0', 'float', 190, -10, {size: 64, glow: true}), l3: link('m', 'r', {label: 'return'}), rt: tag('r', {text: 'share'})}},
    {title: 'No return means None', code: `def show(total, people):\n    print(total / people)\n\nx = show(1200, 4)`, out: '300.0\nx is None', body: `A function without <code>return</code> still gives back <code>None</code>. If an AI agent's tool only prints, the model gets nothing back.`,
     set: {a: null, b: null, l1: null, l1b: null, d: null, l2: null, r: null, l3: null, rt: null, m: {v: 'show'}, n: {text: 'show'}, nn: box('None', 'NoneType', 180, 0), xt: tag('nn', {text: 'x'}), l4: link('m', 'nn')}},
    {title: 'The shared cart trap', code: `def add_item(item, cart=[]):\n    cart.append(item)\n    return cart`, out: "add_item('Idli') → ['Idli']\nadd_item('Vada') → ['Idli', 'Vada']  # surprise", body: `The default list is built <b>once</b>, and every call shares it. The next customer sees the last customer's idli. Use <code>cart=None</code> and make a new list inside.`,
     set: {nn: null, xt: null, l4: null, m: {v: 'add_item'}, n: {text: 'add_item'}, h: box("['Idli','Vada']", 'list', 170, 60, {glow: true}), l5: link('m', 'h', {label: 'shared!', dash: true}), w: note('h', 'one cart for everyone', {bad: true, z: 50})}},
  ]},

  12: {title: 'The canteen order', file: 'order.py', count: false, empty: 'no order yet', scenes: [
    {title: 'A function that takes anything', code: `def order(name, *items, **extras):`, body: `Lakshmi orders at the college canteen. <code>*items</code> collects any number of dishes into a <b>tuple</b>. <code>**extras</code> collects named options into a <b>dict</b>.`,
     set: {m: fn('order', 0, -100), A: shelf(-130, 70, 200, {h: 100, label: 'items (tuple)'}), K: shelf(130, 70, 200, {h: 100, alt: true, label: 'extras (dict)'})}},
    {title: 'Extra positions go to items', code: `order("Lakshmi", "Dosa", "Tea")`, out: "name='Lakshmi'  items=('Dosa', 'Tea')", body: `"Lakshmi" fills <code>name</code>. The leftovers "Dosa" and "Tea" are packed into the items tuple, in order.`,
     set: {p: box('"Lakshmi"', 'str', -200, -100, {size: 50}), lp: link('p', 'm', {label: 'name'}), a1: box('"Dosa"', 'str', -170, 70, {size: 48}), a2: box('"Tea"', 'str', -95, 70, {size: 48})}},
    {title: 'Named extras go to extras', code: `order("Lakshmi", "Dosa", spicy=True, parcel=True)`, out: "extras={'spicy': True, 'parcel': True}", body: `Named values land in the extras dict, key and value.`,
     set: {k1: box('spicy', 'dict', 85, 70, {size: 52}), k2: box('parcel', 'dict', 165, 70, {size: 52})}},
    {title: 'A form sends a dict', code: `ticket = {"source": "Chennai", "dest": "Madurai"}`, body: `A train booking form sends its answers as a dict. Now we need to pass that dict into a normal function. AI models send tool arguments the same way.`,
     set: {A: null, K: null, k1: null, k2: null, a1: null, a2: null, p: null, lp: null, m: {v: 'book'}, D: shelf(-140, 70, 210, {h: 100, alt: true, label: 'ticket (dict)'}), c: box('"Chennai"', 'str', -180, 70, {size: 48}), d: box('"Madurai"', 'str', -100, 70, {size: 48})}},
    {title: '** spreads a dict into names', code: `book(**ticket)\n# same as book(source="Chennai", dest="Madurai")`, body: `<code>**</code> at the call unpacks the dict: each key becomes a named argument. This one line is how every AI agent runs a tool call.`,
     set: {l1: link('c', 'm', {label: 'source='}), l2: link('d', 'm', {label: 'dest='})}},
    {title: '* spreads a list into positions', code: `bills = [120, 80, 50]\ntotal(*bills)   # total(120, 80, 50)`, body: `A single <code>*</code> unpacks a list into positions. <code>*</code> packs in a definition and unpacks in a call.`,
     set: {D: null, c: null, d: null, l1: null, l2: null, m: {v: 'total'}, L: shelf(-110, 80, 240, {h: 90, slots: 3, label: 'bills'}), n1: box('120', 'int', -190, 80, {size: 46}), n2: box('80', 'int', -110, 80, {size: 46}), n3: box('50', 'int', -30, 80, {size: 46}), l3: link('L', 'm', {label: '*bills'})}},
  ]},

  13: {title: 'The UPI pay function', file: 'pay.py', count: false, empty: 'no function yet', scenes: [
    {title: 'Markers in the signature', code: `def pay(amount, /, note="", *, upi_id):`, body: `The <code>/</code> and <code>*</code> are not parameters. They split the slots into three zones, and each zone accepts arguments differently.`,
     set: {P: shelf(-170, 0, 150, {h: 200, label: 'position only'}), E: shelf(0, 0, 150, {h: 200, alt: true, label: 'either way'}), K: shelf(170, 0, 150, {h: 200, label: 'name only'})}},
    {title: 'Before / : by position only', body: `<code>amount</code> sits before the slash, so callers pass it by position: <code>pay(250, ...)</code>. They cannot write <code>amount=250</code>.`,
     set: {q: box('amount', 'int', -170, 0)}},
    {title: 'Between: either way', body: `<code>note</code> can be passed as <code>pay(250, "dinner", ...)</code> or <code>pay(250, note="dinner", ...)</code>.`,
     set: {t: box('note', 'str', 0, 0)}},
    {title: 'After * : by name only', body: `<code>upi_id</code> sits after the star, so it must be named. Nobody can mix up the amount and the UPI ID by accident.`,
     set: {f: box('upi_id', 'str', 170, 0)}},
    {title: 'A good call', code: `pay(250, "dinner", upi_id="arjun@upi")`, out: 'Paid Rs 250 to arjun@upi', body: `Each argument lands in a zone that accepts it. AI SDKs make options like <code>temperature</code> name-only for the same reason.`,
     set: {ok: note('E', 'accepted', {z: 90})}},
    {title: 'A rejected call', code: `pay(250, "arjun@upi")`, out: "TypeError: pay() missing 1 required keyword-only argument: 'upi_id'", body: `Python checks the zones before the function runs. A wrong call fails at once with a clear TypeError, before any money moves.`,
     set: {ok: null, no: note('f', 'TypeError', {bad: true, z: 50})}},
  ]},

  14: {title: 'The payment counter', file: 'payments.py', count: false, empty: 'no functions yet', scenes: [
    {title: 'A function is a value', code: `def pay_upi(amount):\n    return f"Paid Rs {amount} by UPI"`, body: `A function is a value like any other, so a name, a list or a dict can hold it. The name <code>pay_upi</code> is only a tag on the function.`,
     set: {s: fn('pay_upi', -160, -80), st: tag('s', {text: 'pay_upi'})}},
    {title: 'Pass it without calling it', code: `f = pay_upi      # no ()\nf(250)`, out: "'Paid Rs 250 by UPI'", body: `Without brackets you pass the function itself. With <code>()</code> you call it. <code>f</code> and <code>pay_upi</code> are two tags on one machine.`,
     set: {ft: tag('s', {text: 'f'})}},
    {title: 'Put them in a dict', code: `PAYMENTS = {"upi": pay_upi, "card": pay_card}`, body: `A food app keeps a dict from each payment method's name to its function. AI agents keep a <b>tool registry</b> the same way.`,
     set: {ft: null, w: fn('pay_card', -160, 80), R: shelf(120, 0, 220, {h: 240, alt: true, label: 'PAYMENTS (dict)'}), k1: box('"upi"', 'str', 120, -60, {size: 54}), k2: box('"card"', 'str', 120, 60, {size: 54}), l1: link('k1', 's'), l2: link('k2', 'w')}},
    {title: 'The user picks by name', code: `choice = "card"`, body: `The user only taps a button that says "card". The app gets the <b>name</b>, as text.`,
     set: {c: note('k2', '"card"', {z: 80})}},
    {title: 'Look up and call', code: `fn = PAYMENTS[choice]\nprint(fn(349))`, out: "Paid Rs 349 by card", body: `The app looks up the name, gets the function, and calls it. When an AI model sends a tool name, the agent does exactly this.`,
     set: {c: null, sc: scan('w'), r: box('"Paid Rs 349"', 'str', -20, 150, {size: 52, glow: true}), l3: link('w', 'r')}},
    {title: 'Unknown names', code: `fn = PAYMENTS.get("crypto")\nif fn is None:\n    print("Not supported")`, body: `Use <code>.get</code> for names that might not exist, and show a clear message instead of crashing. AI models sometimes invent tool names too.`,
     set: {sc: null, r: null, l3: null, u: note('R', 'crypto? → Not supported', {bad: true, z: 40})}},
  ]},

  15: {title: 'Ranking the IPL batters', file: 'rank.py', count: false, empty: 'no players yet', scenes: [
    {title: 'Players arrive unsorted', code: `batters = [{"name": "Gill", "sr": 138},\n           {"name": "Klaasen", "sr": 171},\n           {"name": "Pant", "sr": 112}]`, body: `Divya wants a list of the fastest scorers this season, ranked by strike rate. Then only the ones above 120.`,
     set: {L: shelf(0, 0, 400, {h: 100, slots: 3, label: 'batters'}), a: box('Gill · 138', 'dict', -133, 0), b: box('Klaasen · 171', 'dict', 0, 0), c: box('Pant · 112', 'dict', 133, 0)}},
    {title: 'lambda: a tiny unnamed function', code: `by_sr = lambda b: b["sr"]`, body: `<code>lambda</code> writes a one-line function inline: input on the left of the colon, return value on the right.`,
     set: {lm: fn('lambda b', 0, -120, {size: 64})}},
    {title: 'sorted with a key', code: `best = sorted(batters, key=lambda b: b["sr"], reverse=True)`, body: `<code>sorted</code> calls the key function on each player and orders by the result. It returns a <b>new</b> list. The boxes slide into place: Klaasen, Gill, Pant.`,
     set: {b: {x: -133, glow: true}, a: {x: 0}, c: {x: 133}}},
    {title: 'filter keeps what passes', code: `fast = list(filter(lambda b: b["sr"] > 120, best))`, body: `<code>filter</code> keeps players where the function returns True. Pant drops out.`,
     set: {b: {glow: false}, c: {gone: true}}},
    {title: 'map changes every item', code: `names = list(map(lambda b: b["name"], fast))`, out: "['Klaasen', 'Gill']", body: `<code>map</code> applies a function to every item. Here it pulls out the names.`,
     set: {i1: box('"Klaasen"', 'str', -133, 120, {size: 46}), i2: box('"Gill"', 'str', 0, 120, {size: 46}), m1: link('b', 'i1'), m2: link('a', 'i2')}},
    {title: 'Comprehensions read better', code: `names = [b["name"] for b in best if b["sr"] > 120]`, body: `A list comprehension does map and filter in one readable line. Keep lambda for <code>key=</code>. AI agents rank search results the same way.`,
     set: {lm: null, cm: note('L', '[b["name"] for b in ... if ...]', {z: 80})}},
  ]},

  16: {title: 'The canteen token counter', file: 'tokens.py', count: false, empty: 'no names yet', scenes: [
    {title: 'Four rooms, one search order', body: `When Python sees a name, it searches four scopes in order: <b>L</b>ocal, <b>E</b>nclosing, <b>G</b>lobal, <b>B</b>uilt-in. The first match wins.`,
     set: {B: shelf(0, 0, 500, {h: 320, label: 'Built-in: print, len'}), G: shelf(0, 10, 400, {h: 250, alt: true, label: 'Global: the whole file'}), E: shelf(0, 20, 290, {h: 180, label: 'Enclosing: outer()'}), L: shelf(0, 30, 170, {h: 110, alt: true, label: 'Local: inner()'})}},
    {title: 'Names live in their room', code: `college = "PSG Tech"        # global\ndef outer():\n    dept = "CSE"            # enclosing\n    def inner():\n        roll = 21           # local`, body: `Each name is created in the scope where it is assigned.`,
     set: {gm: box('college', 'str', -160, -60, {size: 50}), ep: box('dept', 'str', -100, 50, {size: 50}), lm: box('roll', 'int', 0, 30, {size: 50})}},
    {title: 'The search walks outward', code: `        print(dept, college)`, out: 'CSE PSG Tech', body: `<code>dept</code> is not local, so Python checks the enclosing room and finds it. <code>college</code> is found in the global room. <code>print</code> comes from built-ins.`,
     set: {s1: scan('ep'), s2: {kind: 'scan', on: 'gm'}}},
    {title: 'Assigning makes a local name', code: `token = 0\ndef next_token():\n    token += 1`, out: 'UnboundLocalError', body: `Any assignment inside a function makes the name local, so Python never looks outside, and <code>token += 1</code> fails.`,
     set: {s1: null, s2: null, ep: null, lm: null, gm: null, c: box('token', 'int', -160, -60, {size: 50}), e: note('L', 'UnboundLocalError', {bad: true, z: 40})}},
    {title: 'A closure remembers', code: `def make_counter():\n    token = 0\n    def next_token():\n        nonlocal token\n        token += 1\n        return token\n    return next_token`, body: `The canteen hands out token numbers. <code>next_token</code> uses <code>token</code> from the enclosing room. <code>nonlocal</code> says "this is the outer token".`,
     set: {e: null, c: null, cc: box('token', 'int', -90, 60, {size: 50}), tk: fn('next_token', 30, 30, {size: 60}), lk: link('tk', 'cc', {dash: true})}},
    {title: 'The memory outlives the call', code: `counter = make_counter()\ncounter(); counter()\nprint(counter())`, out: '3', body: `<code>make_counter</code> has finished, but its <code>token</code> stays alive inside the closure. Decorators, and agents that remember settings, are built from this idea.`,
     set: {E: {label: 'closure cell'}, cc: {v: '3', glow: true}, tt: tag('tk', {text: 'counter'})}},
  ]},

  17: {title: 'Logging every payment', file: 'decorators.py', count: false, empty: 'no decorator yet', scenes: [
    {title: 'A plain payment function', code: `def pay(amount):\n    return f"Paid Rs {amount}"`, body: `Sai's shop app needs every payment logged, without editing each payment function. A <b>decorator</b> does this.`,
     set: {g: fn('pay', 0, 0), gt: tag('g', {text: 'pay'})}},
    {title: 'A function that wraps a function', code: `def log(fn):\n    def wrapper(*args, **kwargs):\n        print("payment:", args)\n        return fn(*args, **kwargs)\n    return wrapper`, body: `<code>log</code> takes a function and returns a new <code>wrapper</code>. The wrapper prints, then calls the original. It is a closure over <code>fn</code>.`,
     set: {L: shelf(0, 0, 220, {h: 180, alt: true, label: 'wrapper'})}},
    {title: '@ replaces the name', code: `@log\ndef pay(amount): ...\n# same as: pay = log(pay)`, body: `<code>@log</code> passes the function into <code>log</code> and ties the name to whatever comes back. The tag now points to the wrapper. The original lives inside it.`,
     set: {g: {size: 64}, w: fn('wrapper', 0, -150, {size: 60}), gt: tag('w', {text: 'pay'}), lk: link('w', 'g', {label: 'calls fn'})}},
    {title: 'Calls go through the wrapper', code: `pay(499)`, out: "payment: (499,)\n'Paid Rs 499'", body: `The call hits the wrapper first. It logs, then runs the real function and returns its result.`,
     set: {sc: scan('w'), r: note('g', '"Paid Rs 499"', {z: 50})}},
    {title: 'Decorators that register', code: `TOOLS = {}\ndef tool(fn):\n    TOOLS[fn.__name__] = fn\n    return fn\n\n@tool\ndef check_pnr(pnr): ...`, body: `A decorator can also just record the function and return it. This is how <code>@tool</code> builds a tool registry in AI frameworks.`,
     set: {sc: null, r: null, R: shelf(170, 80, 140, {h: 110, label: 'TOOLS'}), s: box('"check_pnr"', 'str', 170, 80, {size: 50})}},
    {title: 'Keep the name with wraps', code: `from functools import wraps\ndef log(fn):\n    @wraps(fn)\n    def wrapper(*a, **k): ...`, body: `Without <code>@wraps</code>, the wrapped function reports its name as "wrapper", and its docstring is lost. Always add it.`,
     set: {w: {v: 'wraps → pay'}}},
  ]},

  18: {title: 'The voice assistant reads the label', file: 'assistant.py', count: false, empty: 'no tools yet', scenes: [
    {title: 'Two tools, no descriptions', code: `def book(p, d): ...\ndef check(n): ...`, body: `Meera says "get me an auto to Central" to a voice assistant. It cannot read your code. It picks a tool from the name and the description only. With no descriptions, "book" and "check" tell it nothing.`,
     set: {a: fn('book', -110, -20), b: fn('check', 110, -20), qq: note('a', '?', {z: 40}), qq2: note('b', '?', {z: 40})}},
    {title: 'A docstring is the description', code: `def book(p, d):\n    """Book an auto rickshaw for a city ride."""`, body: `The first string inside a function is its <b>docstring</b>. Python stores it on <code>book.__doc__</code>, and AI frameworks send it to the model.`,
     set: {qq: note('a', 'Book an auto rickshaw', {z: 40})}},
    {title: 'Describe the arguments', code: `    """Book an auto rickshaw.\n\n    Args:\n        p: Pickup, e.g. "T Nagar".\n        d: Drop, e.g. "Chennai Central".\n    """`, body: `Say what each argument means and give an example. The model uses this to fill in the arguments correctly.`,
     set: {doc: shelf(-110, 120, 220, {h: 70, label: 'Args: pickup, drop'})}},
    {title: 'The framework builds a schema', code: `{"name": "book",\n "description": "Book an auto rickshaw.",\n "parameters": {"p": {"type": "string"}}}`, body: `From the name, the docstring and the type hints, the framework builds a description in JSON. This is all the model ever sees about your tool.`,
     set: {sc: scan('a'), sch: box('schema', 'dict', -110, -160, {size: 50})}},
    {title: 'Vague text, wrong tool', code: `def check(n):\n    """Check."""`, body: `"Check." tells the model nothing, so it may pick this tool for every question. Clear docstrings are part of building a good assistant.`,
     set: {sc: null, qq2: note('b', '"Check." ?', {bad: true, z: 40})}},
    {title: 'help() shows it to you too', code: `help(book)`, out: 'book(p, d)\n    Book an auto rickshaw.', body: `Docstrings also help people. <code>help()</code> and your editor show them when you hover a function.`,
     set: {qq2: note('b', '"Check a train PNR status."', {z: 40})}},
  ]},

  19: {title: 'Live commentary, ball by ball', file: 'commentary.py', count: false, empty: 'no commentary yet', scenes: [
    {title: 'A list builds everything first', code: `over = ["1", "FOUR", "dot", "SIX"]`, body: `A list holds all its items in memory at once. For live commentary, you would wait for the whole over before seeing anything.`,
     set: {L: shelf(0, -90, 420, {h: 80, slots: 4, label: 'list: all at once'}), w1: box('"1"', 'str', -158, -90, {size: 46}), w2: box('"FOUR"', 'str', -53, -90, {size: 46}), w3: box('"dot"', 'str', 53, -90, {size: 46}), w4: box('"SIX"', 'str', 158, -90, {size: 46})}},
    {title: 'yield makes a generator', code: `def live():\n    for ball in ["1", "FOUR", "dot", "SIX"]:\n        yield ball`, body: `A function with <code>yield</code> returns a <b>generator</b>. Calling it runs nothing yet. It waits until you ask for the next ball.`,
     set: {L: null, w1: null, w2: null, w3: null, w4: null, g: box('live()', 'generator', -170, 60, {size: 76}), gt: tag('g', {text: 'gen'}), C: shelf(80, 60, 300, {h: 80, slots: 4, label: 'screen'})}},
    {title: 'next() gets one ball', code: `next(gen)`, out: "'1'", body: `<code>next</code> runs the function until the next <code>yield</code>, hands out one value, then pauses right there.`,
     set: {t1: box('"1"', 'str', -10, 60, {size: 46, glow: true}), l: link('g', 't1')}},
    {title: 'A for loop pulls the rest', code: `for ball in gen:\n    print(ball, end=" ")`, out: 'FOUR dot SIX', body: `A <code>for</code> loop calls next for you. Each ball appears as soon as it is bowled. Chat apps stream AI replies word by word in exactly this way.`,
     set: {t1: {glow: false}, t2: box('"FOUR"', 'str', 50, 60, {size: 46}), t3: box('"dot"', 'str', 110, 60, {size: 46}), t4: box('"SIX"', 'str', 170, 60, {size: 46}), l: link('g', 't4')}},
    {title: 'Used up after one pass', code: `list(gen)`, out: '[]', body: `A generator runs once. When it is finished it stays empty. Call <code>live()</code> again for a fresh one.`,
     set: {g: {v: 'done', t: 'generator', glow: false}, e: note('g', 'over finished', {bad: true, z: 50})}},
    {title: 'Tiny memory, any length', code: `every_ball = (b for b in range(10**9))`, body: `A generator holds one item at a time, so it can walk a billion balls or a huge file with almost no memory.`,
     set: {e: null, t1: null, t2: null, t3: null, t4: null, l: null, C: null, g: {v: '(b for b ...)'}, m: note('g', '~200 bytes', {z: 60})}},
  ]},
};

const card = (show, a, o, out, why, q) => ({show, code: show, a, o, out, why, ...(q ? {q} : {})});
const P = (...args) => ({...card(...args), prose: true});

export const games = {
  11: {title: 'Call tracer', show: 'card', q: 'What does it print?', items: [
    card('def fare(km=2):\n    return 30 + 15 * km\nprint(fare())', '60', ['60', '30', 'None'], '60', 'No argument, so the default km=2 is used.'),
    card('def share(t, p):\n    t / p\nprint(share(600, 3))', 'None', ['200.0', 'None', 'Error'], 'None', 'There is no return, so the function returns None.'),
    card('def total(a, tip=50):\n    return a + tip\nprint(total(500, 100))', '600', ['550', '600', '650'], '600', 'tip=100 replaces the default.'),
    card('def add(x, cart=[]):\n    cart.append(x); return cart\nadd("Idli")\nprint(add("Vada"))', "['Idli', 'Vada']", ["['Vada']", "['Idli', 'Vada']", 'Error'], "['Idli', 'Vada']", 'The default list is shared between calls.'),
    card('def status():\n    return "Paid"\n    return "Pending"\nprint(status())', 'Paid', ['Paid', 'Pending', "['Paid', 'Pending']"], 'Paid', 'The first return ends the function.'),
    card('def weather(city, units="C"):\n    return units\nprint(weather("Kochi", units="F"))', 'F', ['C', 'F', 'Kochi'], 'F', 'A named argument overrides the default.'),
  ]},
  12: {title: 'Unpacking scanner', show: 'card', q: 'What does it print?', items: [
    card('def order(*items):\n    return items\nprint(order("Dosa", "Tea"))', "('Dosa', 'Tea')", ["['Dosa', 'Tea']", "('Dosa', 'Tea')", 'Dosa Tea'], "('Dosa', 'Tea')", '*args is always a tuple.'),
    card('def opts(**kw):\n    return kw\nprint(opts(spicy=True))', "{'spicy': True}", ["{'spicy': True}", '(True,)', "['spicy']"], "{'spicy': True}", '**kwargs is always a dict.'),
    card('def change(paid, bill):\n    return paid - bill\nprint(change(*[500, 320]))', '180', ['180', '-180', 'Error'], '180', '*[500, 320] becomes change(500, 320).'),
    card('def book(src, dest):\n    return dest\nprint(book(**{"src": "Chennai", "dest": "Madurai"}))', 'Madurai', ['Madurai', 'Chennai', 'Error'], 'Madurai', 'Each key becomes a named argument.'),
    card('def book(src):\n    return src\nbook(**{"from": "Kochi"})', 'TypeError', ['Kochi', 'None', 'TypeError'], "TypeError: book() got an unexpected keyword argument 'from'", 'The dict keys must match the parameter names.'),
    card('first, *rest = ["Rohit", "Gill", "Kohli"]\nprint(rest)', "['Gill', 'Kohli']", ["['Gill', 'Kohli']", "('Gill', 'Kohli')", "'Kohli'"], "['Gill', 'Kohli']", 'A starred name in an assignment collects the rest as a list.'),
  ]},
  13: {title: 'Signature judge', show: 'card', choices: ['works', 'TypeError'], q: 'def pay(amount, /, note, *, upi_id): ...   Does this call work?', items: [
    card('pay(250, "dinner", upi_id="arjun@upi")', 'works', null, 'ok', 'amount by position, note by position, upi_id by name.'),
    card('pay(250, note="dinner", upi_id="arjun@upi")', 'works', null, 'ok', 'note can be positional or named.'),
    card('pay(amount=250, note="tea", upi_id="sai@upi")', 'TypeError', null, 'TypeError', 'amount is position-only, so amount=250 is not allowed.'),
    card('pay(250, "dinner", "arjun@upi")', 'TypeError', null, 'TypeError', 'upi_id is name-only. You must write upi_id="arjun@upi".'),
    card('pay(250, upi_id="meera@upi", note="movie")', 'works', null, 'ok', 'Named arguments can come in any order.'),
    card('pay(250, "dinner")', 'TypeError', null, "TypeError: pay() missing 1 required keyword-only argument: 'upi_id'", 'upi_id has no default, so it is required.'),
  ]},
  14: {title: 'Registry runner', show: 'card', q: 'What happens?', items: [
    card('def pay_upi(): return "paid"\nx = pay_upi\nprint(type(x).__name__)', 'function', ['str', 'function', 'NoneType'], 'function', 'No brackets: x holds the function itself.'),
    card('def pay_upi(): return "paid"\nx = pay_upi()\nprint(x)', 'paid', ['paid', 'function', 'None'], 'paid', 'With () the function runs and returns "paid".'),
    card('P = {"upi": lambda: "UPI ok"}\nprint(P["upi"]())', 'UPI ok', ['UPI ok', 'function', 'KeyError'], 'UPI ok', 'Look up the function, then call it.'),
    card('P = {"upi": lambda: "UPI ok"}\nprint(P.get("cash"))', 'None', ['None', 'UPI ok', 'KeyError'], 'None', '.get returns None for a missing key.'),
    card('P = {"upi": lambda: "UPI ok"}\nP["cash"]()', 'KeyError', ['None', 'KeyError', 'UPI ok'], "KeyError: 'cash'", 'Square brackets raise KeyError when the name is missing.'),
    card('fns = [len, str.upper]\nprint(fns[1]("csk"))', 'CSK', ['CSK', '3', 'csk'], "'CSK'", 'Functions can live in a list too.'),
  ]},
  15: {title: 'Lambda lab', show: 'card', q: 'What does it give?', items: [
    card('sorted([171, 138, 112])', '[112, 138, 171]', ['[112, 138, 171]', '[171, 138, 112]', 'None'], '[112, 138, 171]', 'sorted returns a new list, smallest first.'),
    card('sorted(["Ooty", "Goa", "Kochi"], key=len)', "['Goa', 'Ooty', 'Kochi']", ["['Goa', 'Ooty', 'Kochi']", "['Kochi', 'Ooty', 'Goa']", "['Goa', 'Kochi', 'Ooty']"], "['Goa', 'Ooty', 'Kochi']", 'key=len sorts by length.'),
    card('list(filter(lambda p: p < 100, [89, 249, 60]))', '[89, 60]', ['[89, 60]', '[249]', '[True, False, True]'], '[89, 60]', 'filter keeps dishes under Rs 100.'),
    card('list(map(lambda r: r * 2, [4, 6]))', '[8, 12]', ['[8, 12]', '[4, 6, 4, 6]', '[10]'], '[8, 12]', 'map applies the function to each item.'),
    card('m = map(str.upper, ["mi", "rr"])\nlist(m); print(list(m))', '[]', ["['MI', 'RR']", '[]', 'Error'], '[]', 'map runs once. The second list is empty.'),
    card('(lambda bill, tip: bill + tip)(500, 50)', '550', ['550', 'function', '50050'], '550', 'You can call a lambda right away.'),
  ]},
  16: {title: 'Scope detective', show: 'card', q: 'What does it print?', items: [
    card('city = "Chennai"\ndef f():\n    return city\nprint(f())', 'Chennai', ['Chennai', 'NameError', 'None'], 'Chennai', 'Not local, so Python finds the global city.'),
    card('city = "Chennai"\ndef f():\n    city = "Madurai"\n    return city\nf(); print(city)', 'Chennai', ['Chennai', 'Madurai', 'Error'], 'Chennai', 'The assignment inside f made a separate local city.'),
    card('def outer():\n    dept = "CSE"\n    def inner():\n        return dept\n    return inner()\nprint(outer())', 'CSE', ['CSE', 'NameError', 'None'], 'CSE', 'inner finds dept in the enclosing scope.'),
    card('token = 0\ndef f():\n    token += 1\nf()', 'UnboundLocalError', ['1', '0', 'UnboundLocalError'], 'UnboundLocalError', 'Assigning makes token local, and it has no value yet.'),
    card('def mk():\n    t = 0\n    def nxt():\n        nonlocal t; t += 1; return t\n    return nxt\nc = mk(); c(); print(c())', '2', ['1', '2', '0'], '2', 'The closure keeps t between calls.'),
    card('fns = [lambda: i for i in range(3)]\nprint([f() for f in fns])', '[2, 2, 2]', ['[0, 1, 2]', '[2, 2, 2]', '[0, 0, 0]'], '[2, 2, 2]', 'All lambdas read i when called, after the loop ended at 2.'),
  ]},
  17: {title: 'Decorator tracer', show: 'card', q: 'What does it print?', items: [
    card('def shout(fn):\n    def w(): return fn().upper()\n    return w\n@shout\ndef team(): return "csk"\nprint(team())', 'CSK', ['csk', 'CSK', 'None'], 'CSK', 'team now points to the wrapper, which upper-cases the result.'),
    card('# same shout, no @wraps\nprint(team.__name__)', 'w', ['team', 'w', 'shout'], "'w'", 'Without functools.wraps the name is the wrapper\'s.'),
    card('T = {}\ndef tool(fn):\n    T[fn.__name__] = fn; return fn\n@tool\ndef check_pnr(): ...\nprint(list(T))', "['check_pnr']", ["['check_pnr']", '[]', "['tool']"], "['check_pnr']", 'The decorator ran when def ran, and saved the name.'),
    card('def twice(fn):\n    def w(): fn(); fn()\n    return w\n@twice\ndef cheer(): print("Whistle")\ncheer()', 'Whistle Whistle', ['Whistle', 'Whistle Whistle', 'nothing'], 'Whistle\nWhistle', 'The wrapper calls the function two times.'),
    card('def deco(fn):\n    print("deco ran")\n    return fn\n@deco\ndef pay(): ...', 'deco ran', ['deco ran', 'nothing', 'Error'], 'deco ran', 'Decorators run once, when the function is defined, not when it is called.'),
  ]},
  18: {title: 'Docstring check', show: 'card', q: 'What does it print?', items: [
    card('def fare():\n    """Auto fare in rupees."""\nprint(fare.__doc__)', 'Auto fare in rupees.', ['Auto fare in rupees.', 'None', 'fare'], 'Auto fare in rupees.', 'The first string in the body is the docstring.'),
    card('def fare():\n    km = 2\n    """Auto fare."""\nprint(fare.__doc__)', 'None', ['Auto fare.', 'None', 'Error'], 'None', 'A docstring must be the first statement.'),
    card('def fare():\n    # Auto fare\n    pass\nprint(fare.__doc__)', 'None', ['Auto fare', 'None', '# Auto fare'], 'None', 'Comments are not docstrings. An AI model never sees them.'),
    P('Which helps an AI assistant most?\nA: """Book."""\nB: """Book an auto for a city ride."""', 'B', ['A', 'B'], 'B', 'Say what the tool does and when to use it.'),
    P('def do(x):\n    """Does stuff."""\n# good tool name and docstring?', 'no', ['yes', 'no'], 'no', 'Both are vague. The model cannot tell when to use it.'),
  ]},
  19: {title: 'Generator lab', show: 'card', q: 'What does it print?', items: [
    card('def live():\n    yield "FOUR"\n    yield "SIX"\nprint(type(live()).__name__)', 'generator', ['generator', 'str', 'function'], 'generator', 'Calling a generator function returns a generator.'),
    card('it = iter(["dot", "FOUR"])\nnext(it)\nprint(next(it))', 'FOUR', ['dot', 'FOUR', 'StopIteration'], 'FOUR', 'Each next moves one step forward.'),
    card('def live():\n    yield "SIX"\nx = live()\nnext(x)\nnext(x)', 'StopIteration', ['SIX', 'None', 'StopIteration'], 'StopIteration', 'Nothing left to yield.'),
    card('gen = (b for b in "46")\nlist(gen); print(list(gen))', '[]', ["['4', '6']", '[]', 'Error'], '[]', 'A generator is used up after one pass.'),
    card('def live():\n    print("Toss done")\n    yield "dot"\nx = live()', 'nothing', ['Toss done', 'nothing', 'dot'], '(no output)', 'The body does not run until the first next().'),
    card('sum(r for r in [1, 4, 0, 6])', '11', ['11', '4', '1406'], '11', '1 + 4 + 0 + 6 = 11, one ball at a time.'),
  ]},
};

export const mountStory = (n, el) => story(el, stories[n]);
export const mountGame = (n, el) => game(el, games[n]);
