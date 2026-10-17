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
  11: {title: 'The tool machine', file: 'tools.py', count: false, empty: 'no function yet', scenes: [
    {title: 'def builds a machine', code: `def get_weather(city, units="C"):\n    return f"31 {units} in {city}"`, body: `<code>def</code> does not run anything yet. It builds a <b>function object</b>, a machine with input slots called <b>parameters</b>, and ties the name <code>get_weather</code> to it. Every agent tool is a machine like this.`,
     set: {m: fn('get_weather', 0, -10), n: tag('m', {text: 'get_weather'})}},
    {title: 'Calling feeds the machine', code: `get_weather("Pune")`, body: `The call drops the <b>argument</b> <code>"Pune"</code> into the <code>city</code> slot. The machine runs its body from the top.`,
     set: {a: box('"Pune"', 'str', -190, -10), l1: link('a', 'm', {label: 'city'})}},
    {title: 'Defaults fill empty slots', body: `Nobody passed <code>units</code>, so its default <code>"C"</code> is used. Defaults make the common call short while the rare call can still say <code>units="F"</code>.`,
     set: {d: box('"C"', 'str', -60, 120, {size: 48}), l2: link('d', 'm', {label: 'units', dash: true})}},
    {title: 'return sends a value back', out: "'31 C in Pune'", body: `<code>return</code> stops the function and hands a new object back to the caller. Save it with a name: <code>report = get_weather("Pune")</code>.`,
     set: {r: box('"31 C in Pune"', 'str', 190, -10, {size: 70, glow: true}), l3: link('m', 'r', {label: 'return'}), rt: tag('r', {text: 'report'})}},
    {title: 'No return means None', code: `def log(msg):\n    print(msg)\n\nx = log("hi")`, out: 'hi\nx is None', body: `A function without <code>return</code> still returns something: <code>None</code>. If your tool forgets to return, the LLM gets nothing back.`,
     set: {a: null, l1: null, d: null, l2: null, r: null, l3: null, rt: null, m: {v: 'log'}, n: {text: 'log'}, nn: box('None', 'NoneType', 180, 0), xt: tag('nn', {text: 'x'}), l4: link('m', 'nn')}},
    {title: 'The mutable default trap', code: `def add(msg, history=[]):\n    history.append(msg)\n    return history`, out: "add('a') → ['a']\nadd('b') → ['a', 'b']  # surprise", body: `The default list is built <b>once</b>, when <code>def</code> runs, and every call shares it. History leaks between users. Use <code>history=None</code>, then create a new list inside.`,
     set: {nn: null, xt: null, l4: null, m: {v: 'add'}, n: {text: 'add'}, h: box("['a','b']", 'list', 170, 60, {glow: true}), l5: link('m', 'h', {label: 'shared!', dash: true}), w: note('h', 'one list for every call', {bad: true, z: 50})}},
  ]},

  12: {title: 'Packing and unpacking arguments', file: 'call.py', count: false, empty: 'no call yet', scenes: [
    {title: 'A function that takes anything', code: `def call_llm(prompt, *args, **kwargs):`, body: `<code>*args</code> collects extra positional values into a <b>tuple</b>. <code>**kwargs</code> collects extra keyword values into a <b>dict</b>. Wrapper functions use this to pass options through.`,
     set: {m: fn('call_llm', 0, -100), A: shelf(-130, 70, 200, {h: 100, label: 'args (tuple)'}), K: shelf(130, 70, 200, {h: 100, alt: true, label: 'kwargs (dict)'})}},
    {title: 'Positional extras go to args', code: `call_llm("Hi", "v2", "fast")`, out: "prompt='Hi'  args=('v2', 'fast')", body: `"Hi" fills <code>prompt</code>. The leftovers "v2" and "fast" are packed into the args tuple, in order.`,
     set: {p: box('"Hi"', 'str', -200, -100, {size: 50}), lp: link('p', 'm', {label: 'prompt'}), a1: box('"v2"', 'str', -170, 70, {size: 48}), a2: box('"fast"', 'str', -95, 70, {size: 48})}},
    {title: 'Keyword extras go to kwargs', code: `call_llm("Hi", temperature=0.2, max_tokens=100)`, out: "kwargs={'temperature': 0.2, 'max_tokens': 100}", body: `Named values land in the kwargs dict, key and value. The function can read <code>kwargs.get("temperature", 0.7)</code>.`,
     set: {a1: null, a2: null, k1: box('temp 0.2', 'dict', 85, 70, {size: 52}), k2: box('max 100', 'dict', 165, 70, {size: 52})}},
    {title: 'The LLM sends a dict', code: `args = {"city": "Pune", "days": 3}`, body: `When a model calls a tool, it sends the arguments as a dict, decoded from JSON. Now the agent must pass that dict into a normal function.`,
     set: {A: null, K: null, k1: null, k2: null, p: null, lp: null, m: {v: 'get_weather'}, D: shelf(-140, 70, 210, {h: 100, alt: true, label: 'args (dict)'}), c: box('"Pune"', 'str', -180, 70, {size: 48}), d: box('3', 'int', -100, 70, {size: 48})}},
    {title: '** spreads a dict into keywords', code: `get_weather(**args)\n# same as get_weather(city="Pune", days=3)`, body: `<code>**</code> at the call site unpacks the dict: each key becomes a keyword argument. This one line is how every agent runs a tool call.`,
     set: {l1: link('c', 'm', {label: 'city='}), l2: link('d', 'm', {label: 'days='})}},
    {title: '* spreads a list into positions', code: `nums = [1, 2, 3]\nadd(*nums)   # add(1, 2, 3)`, body: `A single <code>*</code> unpacks a list or tuple into positional arguments. <code>*</code> packs in a definition and unpacks in a call.`,
     set: {D: null, c: null, d: null, l1: null, l2: null, m: {v: 'add'}, L: shelf(-110, 80, 240, {h: 90, slots: 3, label: 'nums'}), n1: box('1', 'int', -190, 80, {size: 46}), n2: box('2', 'int', -110, 80, {size: 46}), n3: box('3', 'int', -30, 80, {size: 46}), l3: link('L', 'm', {label: '*nums'})}},
  ]},

  13: {title: 'Three kinds of slots', file: 'signature.py', count: false, empty: 'no function yet', scenes: [
    {title: 'Markers in the signature', code: `def search(query, /, top_k=5, *, filters=None):`, body: `The <code>/</code> and <code>*</code> are not parameters. They split the slots into three zones, and each zone accepts arguments in a different way.`,
     set: {P: shelf(-170, 0, 150, {h: 200, label: 'positional only'}), E: shelf(0, 0, 150, {h: 200, alt: true, label: 'either way'}), K: shelf(170, 0, 150, {h: 200, label: 'keyword only'})}},
    {title: 'Before / : by position only', body: `<code>query</code> sits before the slash, so callers must pass it by position. They cannot write <code>query="rag"</code>. You are free to rename it later without breaking anyone.`,
     set: {q: box('query', 'str', -170, 0)}},
    {title: 'Between: either way', body: `<code>top_k</code> can be passed as <code>search("rag", 3)</code> or <code>search("rag", top_k=3)</code>.`,
     set: {t: box('top_k', 'int', 0, 0)}},
    {title: 'After * : by name only', body: `<code>filters</code> sits after the star, so it must be named. <code>search("rag", 3, {...})</code> fails. Callers have to write <code>filters={...}</code>, which makes the call clear to read.`,
     set: {f: box('filters', 'dict', 170, 0)}},
    {title: 'A good call', code: `search("rag", top_k=3, filters={"lang": "en"})`, out: 'ok', body: `Each argument lands in a zone that accepts it. Keyword-only flags stop bugs like <code>send(msg, True)</code>, where nobody knows what True means.`,
     set: {ok: note('E', 'accepted', {z: 90})}},
    {title: 'A rejected call', code: `search(query="rag")`, out: "TypeError: search() got some positional-only arguments passed as keyword arguments: 'query'", body: `Python checks the zones before the function runs. A wrong call fails at once with a clear TypeError.`,
     set: {ok: null, no: note('q', 'TypeError', {bad: true, z: 50})}},
  ]},

  14: {title: 'The tool registry', file: 'registry.py', count: false, empty: 'no tools yet', scenes: [
    {title: 'A function is an object', code: `def search(q):\n    return f"results for {q}"`, body: `A function is an object like any other, so a name, a list or a dict can hold it. The name <code>search</code> is only a tag on the function box.`,
     set: {s: fn('search', -160, -80), st: tag('s', {text: 'search'})}},
    {title: 'Pass it without calling it', code: `f = search      # no ()\nf("rag")`, out: "'results for rag'", body: `Without parentheses you pass the function itself. With <code>()</code> you call it. <code>f</code> and <code>search</code> are two tags on one machine.`,
     set: {ft: tag('s', {text: 'f'})}},
    {title: 'Put tools in a dict', code: `TOOLS = {"search": search, "weather": get_weather}`, body: `A dict maps each tool's name to its function. This is a <b>tool registry</b>, the core of every agent framework.`,
     set: {ft: null, w: fn('get_weather', -160, 80), R: shelf(120, 0, 220, {h: 240, alt: true, label: 'TOOLS (dict)'}), k1: box('"search"', 'str', 120, -60, {size: 54}), k2: box('"weather"', 'str', 120, 60, {size: 54}), l1: link('k1', 's'), l2: link('k2', 'w')}},
    {title: 'The LLM picks by name', code: `call = {"name": "weather", "args": {"city": "Pune"}}`, body: `The model never runs code. It only sends the <b>name</b> of a tool and its arguments.`,
     set: {c: note('k2', '"weather"', {z: 80})}},
    {title: 'Look up and call', code: `fn = TOOLS[call["name"]]\nresult = fn(**call["args"])`, out: "'31 C in Pune'", body: `The agent looks up the name, gets the function, and calls it with the arguments. Two lines run any tool.`,
     set: {c: null, sc: scan('w'), r: box('"31 C"', 'str', -20, 150, {size: 52, glow: true}), l3: link('w', 'r')}},
    {title: 'Unknown names', code: `fn = TOOLS.get(name)\nif fn is None:\n    result = f"Unknown tool: {name}"`, body: `Models sometimes invent tool names. Use <code>.get</code> and send a clear error back to the model instead of crashing.`,
     set: {sc: null, r: null, l3: null, u: note('R', 'send_email? → Unknown tool', {bad: true, z: 40})}},
  ]},

  15: {title: 'Sorting search results', file: 'rank.py', count: false, empty: 'no results yet', scenes: [
    {title: 'Results arrive unsorted', code: `docs = [{"id": "a", "score": 0.4},\n        {"id": "b", "score": 0.9},\n        {"id": "c", "score": 0.7}]`, body: `A vector search returns documents with scores. We want the best first, then only the good ones.`,
     set: {L: shelf(0, 0, 400, {h: 100, slots: 3, label: 'docs'}), a: box('a · 0.4', 'dict', -133, 0), b: box('b · 0.9', 'dict', 0, 0), c: box('c · 0.7', 'dict', 133, 0)}},
    {title: 'lambda: a tiny unnamed function', code: `by_score = lambda d: d["score"]`, body: `<code>lambda</code> writes a one-line function inline: input on the left of the colon, return value on the right. It is the same as a small <code>def</code>.`,
     set: {lm: fn('lambda d', 0, -120, {size: 64})}},
    {title: 'sorted with a key', code: `best = sorted(docs, key=lambda d: d["score"], reverse=True)`, body: `<code>sorted</code> calls the key function on each item and orders by the result. It returns a <b>new</b> list. The boxes slide into place: b, c, a.`,
     set: {b: {x: -133, glow: true}, c: {x: 0}, a: {x: 133}}},
    {title: 'filter keeps what passes', code: `good = list(filter(lambda d: d["score"] > 0.5, best))`, body: `<code>filter</code> keeps items where the function returns True. Document a drops out.`,
     set: {b: {glow: false}, a: {gone: true}}},
    {title: 'map changes every item', code: `ids = list(map(lambda d: d["id"], good))`, out: "['b', 'c']", body: `<code>map</code> applies a function to every item. Here it pulls out the ids.`,
     set: {i1: box('"b"', 'str', -133, 120, {size: 46}), i2: box('"c"', 'str', 0, 120, {size: 46}), m1: link('b', 'i1'), m2: link('c', 'i2')}},
    {title: 'Comprehensions read better', code: `ids = [d["id"] for d in best if d["score"] > 0.5]`, body: `A list comprehension does map and filter in one readable line. Most Python code prefers it. Keep lambda for <code>key=</code> arguments.`,
     set: {lm: null, cm: note('L', '[d["id"] for d in ... if ...]', {z: 80})}},
  ]},

  16: {title: 'Where Python looks for a name', file: 'scope.py', count: false, empty: 'no names yet', scenes: [
    {title: 'Four rooms, one search order', body: `When Python sees a name, it searches four scopes in order: <b>L</b>ocal, <b>E</b>nclosing, <b>G</b>lobal, <b>B</b>uilt-in. The first match wins.`,
     set: {B: shelf(0, 0, 500, {h: 320, label: 'Built-in: print, len'}), G: shelf(0, 10, 400, {h: 250, alt: true, label: 'Global: module level'}), E: shelf(0, 20, 290, {h: 180, label: 'Enclosing: outer()'}), L: shelf(0, 30, 170, {h: 110, alt: true, label: 'Local: inner()'})}},
    {title: 'Names live in their room', code: `model = "gpt-4o"          # global\ndef outer():\n    prefix = "SYS"        # enclosing\n    def inner():\n        msg = "hi"        # local`, body: `Each name is created in the scope where it is assigned.`,
     set: {gm: box('model', 'str', -160, -60, {size: 50}), ep: box('prefix', 'str', -100, 50, {size: 50}), lm: box('msg', 'str', 0, 30, {size: 50})}},
    {title: 'The search walks outward', code: `        print(prefix, model)`, out: 'SYS gpt-4o', body: `<code>prefix</code> is not local, so Python checks the enclosing room and finds it. <code>model</code> is found in the global room. <code>print</code> comes from built-ins.`,
     set: {s1: scan('ep'), s2: {kind: 'scan', on: 'gm'}}},
    {title: 'Assigning makes a local name', code: `count = 0\ndef bump():\n    count += 1`, out: 'UnboundLocalError', body: `Any assignment inside a function makes the name local to that function, so Python never looks outside, and <code>count += 1</code> fails. Use <code>global</code> or, better, return a value.`,
     set: {s1: null, s2: null, ep: null, lm: null, gm: null, c: box('count', 'int', -160, -60, {size: 50}), e: note('L', 'UnboundLocalError', {bad: true, z: 40})}},
    {title: 'A closure remembers', code: `def make_counter():\n    count = 0\n    def tick():\n        nonlocal count\n        count += 1\n        return count\n    return tick`, body: `<code>tick</code> uses <code>count</code> from the enclosing room. <code>nonlocal</code> says "this is the outer count".`,
     set: {e: null, c: null, cc: box('count', 'int', -90, 60, {size: 50}), tk: fn('tick', 30, 30, {size: 60}), lk: link('tk', 'cc', {dash: true})}},
    {title: 'The memory outlives the call', code: `t = make_counter()\nt(); t()\nprint(t())`, out: '3', body: `<code>make_counter</code> has finished, but its <code>count</code> box stays alive inside the closure. Decorators and callbacks are built from this idea.`,
     set: {E: {label: 'closure cell'}, cc: {v: '3', glow: true}, tt: tag('tk', {text: 't'})}},
  ]},

  17: {title: 'Wrapping a tool', file: 'decorators.py', count: false, empty: 'no decorator yet', scenes: [
    {title: 'A plain tool', code: `def get_weather(city):\n    return f"Sunny in {city}"`, body: `We want every tool call logged, without editing each tool. A <b>decorator</b> does this.`,
     set: {g: fn('get_weather', 0, 0), gt: tag('g', {text: 'get_weather'})}},
    {title: 'A function that wraps a function', code: `def log(fn):\n    def wrapper(*args, **kwargs):\n        print("calling", fn.__name__)\n        return fn(*args, **kwargs)\n    return wrapper`, body: `<code>log</code> takes a function and returns a new <code>wrapper</code> function. The wrapper prints, then calls the original. It is a closure over <code>fn</code>.`,
     set: {L: shelf(0, 0, 220, {h: 180, alt: true, label: 'wrapper'})}},
    {title: '@ replaces the name', code: `@log\ndef get_weather(city): ...\n# same as: get_weather = log(get_weather)`, body: `<code>@log</code> passes the new function into <code>log</code> and ties the name to whatever comes back. The tag now points to the wrapper. The original lives inside it.`,
     set: {g: {size: 64}, w: fn('wrapper', 0, -150, {size: 60}), gt: tag('w', {text: 'get_weather'}), lk: link('w', 'g', {label: 'calls fn'})}},
    {title: 'Calls go through the wrapper', code: `get_weather("Pune")`, out: "calling get_weather\n'Sunny in Pune'", body: `The call hits the wrapper first. It logs, then runs the real function and returns its result.`,
     set: {sc: scan('w'), r: note('g', '"Sunny in Pune"', {z: 50})}},
    {title: 'Decorators that register', code: `TOOLS = {}\ndef tool(fn):\n    TOOLS[fn.__name__] = fn\n    return fn\n\n@tool\ndef search(q): ...`, body: `A decorator can also just record the function and return it unchanged. This is how <code>@tool</code> in LangChain and the OpenAI Agents SDK builds a registry.`,
     set: {sc: null, r: null, R: shelf(170, 80, 140, {h: 110, label: 'TOOLS'}), s: box('"search"', 'str', 170, 80, {size: 50})}},
    {title: 'Keep the name with wraps', code: `from functools import wraps\ndef log(fn):\n    @wraps(fn)\n    def wrapper(*a, **k): ...`, body: `Without <code>@wraps</code>, the wrapped tool reports its name as "wrapper", and its docstring is lost. Frameworks read both, so always add it.`,
     set: {w: {v: 'wraps → get_weather'}}},
  ]},

  18: {title: 'What the model reads', file: 'docs.py', count: false, empty: 'no tools yet', scenes: [
    {title: 'Two tools, no descriptions', code: `def search(q): ...\ndef lookup(q): ...`, body: `The LLM cannot see your code. It chooses a tool from the name and the description only. With no descriptions, "search" and "lookup" look the same.`,
     set: {a: fn('search', -110, -20), b: fn('lookup', 110, -20), qq: note('a', '?', {z: 40}), qq2: note('b', '?', {z: 40})}},
    {title: 'A docstring is the description', code: `def search(q):\n    """Search the company wiki for a topic."""`, body: `The first string inside a function is its <b>docstring</b>. Python stores it on <code>search.__doc__</code>, and frameworks send it to the model.`,
     set: {qq: note('a', 'Search the company wiki', {z: 40})}},
    {title: 'Describe the arguments', code: `    """Search the company wiki.\n\n    Args:\n        q: Topic to look up, e.g. "leave policy".\n    """`, body: `Say what each argument means and give an example. The model uses this to fill in the arguments correctly.`,
     set: {doc: shelf(-110, 120, 220, {h: 70, label: 'Args: q = topic'})}},
    {title: 'The framework builds a schema', code: `{"name": "search",\n "description": "Search the company wiki.",\n "parameters": {"q": {"type": "string"}}}`, body: `From the name, the docstring and the type hints, the framework builds a JSON schema. This is all the model ever sees about your tool.`,
     set: {sc: scan('a'), sch: box('schema', 'dict', -110, -160, {size: 50})}},
    {title: 'Vague text, wrong tool', code: `def lookup(q):\n    """Lookup."""`, body: `"Lookup." tells the model nothing, so it may pick this tool for every question. Clear docstrings are prompt engineering.`,
     set: {sc: null, qq2: note('b', '"Lookup." ?', {bad: true, z: 40})}},
    {title: 'help() shows it to you too', code: `help(search)`, out: 'search(q)\n    Search the company wiki.', body: `Docstrings also help humans. <code>help()</code> and your editor show them when you hover a function.`,
     set: {qq2: note('b', '"Find an order by its id."', {z: 40})}},
  ]},

  19: {title: 'Streaming tokens', file: 'stream.py', count: false, empty: 'no stream yet', scenes: [
    {title: 'A list builds everything first', code: `words = ["The", "sky", "is", "blue"]`, body: `A list holds all its items in memory at once. For a long LLM reply, the user would wait for the whole answer.`,
     set: {L: shelf(0, -90, 420, {h: 80, slots: 4, label: 'list: all at once'}), w1: box('"The"', 'str', -158, -90, {size: 46}), w2: box('"sky"', 'str', -53, -90, {size: 46}), w3: box('"is"', 'str', 53, -90, {size: 46}), w4: box('"blue"', 'str', 158, -90, {size: 46})}},
    {title: 'yield makes a generator', code: `def stream():\n    for w in ["The", "sky", "is", "blue"]:\n        yield w`, body: `A function with <code>yield</code> returns a <b>generator</b>. Calling it runs nothing yet. It waits until you ask for the next value.`,
     set: {L: null, w1: null, w2: null, w3: null, w4: null, g: box('stream()', 'generator', -170, 60, {size: 76}), gt: tag('g', {text: 'gen'}), C: shelf(80, 60, 300, {h: 80, slots: 4, label: 'screen'})}},
    {title: 'next() gets one token', code: `next(gen)`, out: "'The'", body: `<code>next</code> runs the function until the next <code>yield</code>, hands out one value, then pauses right there.`,
     set: {t1: box('"The"', 'str', -10, 60, {size: 46, glow: true}), l: link('g', 't1')}},
    {title: 'A for loop pulls the rest', code: `for token in gen:\n    print(token, end=" ")`, out: 'sky is blue', body: `A <code>for</code> loop calls next for you. Each token appears as soon as it is ready. This is exactly how streaming chat replies work.`,
     set: {t1: {glow: false}, t2: box('"sky"', 'str', 50, 60, {size: 46}), t3: box('"is"', 'str', 110, 60, {size: 46}), t4: box('"blue"', 'str', 170, 60, {size: 46}), l: link('g', 't4')}},
    {title: 'Used up after one pass', code: `list(gen)`, out: '[]', body: `A generator runs once. When it is finished it stays empty. Call <code>stream()</code> again for a fresh one.`,
     set: {g: {v: 'done', t: 'generator', glow: false}, e: note('g', 'exhausted', {bad: true, z: 50})}},
    {title: 'Tiny memory, any length', code: `big = (n * n for n in range(10**9))`, body: `A generator holds one item at a time, so it can walk a billion numbers or a huge file with almost no memory. The round brackets make a generator expression.`,
     set: {e: null, t1: null, t2: null, t3: null, t4: null, l: null, C: null, g: {v: '(n*n for n...)'}, m: note('g', '~200 bytes', {z: 60})}},
  ]},
};

const card = (show, a, o, out, why, q) => ({show, code: show, a, o, out, why, ...(q ? {q} : {})});

export const games = {
  11: {title: 'Call tracer', show: 'card', q: 'What does it print?', items: [
    card('def f(x=2):\n    return x * 3\nprint(f())', '6', ['6', '2', 'None'], '6', 'No argument, so the default x=2 is used.'),
    card('def f(x):\n    x * 3\nprint(f(2))', 'None', ['6', 'None', 'Error'], 'None', 'There is no return, so the function returns None.'),
    card('def f(a, b=1):\n    return a + b\nprint(f(2, 5))', '7', ['3', '7', '6'], '7', 'b=5 replaces the default.'),
    card('def add(x, h=[]):\n    h.append(x); return h\nadd(1)\nprint(add(2))', '[1, 2]', ['[2]', '[1, 2]', 'Error'], '[1, 2]', 'The default list is shared between calls.'),
    card('def f():\n    return 1\n    return 2\nprint(f())', '1', ['1', '2', '[1, 2]'], '1', 'The first return ends the function.'),
    card('def f(city, units="C"):\n    return units\nprint(f("Pune", units="F"))', 'F', ['C', 'F', 'Pune'], 'F', 'A keyword argument overrides the default.'),
  ]},
  12: {title: 'Unpacking scanner', show: 'card', q: 'What does it print?', items: [
    card('def f(*args):\n    return args\nprint(f(1, 2))', '(1, 2)', ['[1, 2]', '(1, 2)', '1 2'], '(1, 2)', '*args is always a tuple.'),
    card('def f(**kw):\n    return kw\nprint(f(a=1))', "{'a': 1}", ["{'a': 1}", '(1,)', "['a']"], "{'a': 1}", '**kwargs is always a dict.'),
    card('def f(a, b):\n    return a - b\nprint(f(*[5, 2]))', '3', ['3', '-3', 'Error'], '3', '*[5, 2] becomes f(5, 2).'),
    card('def f(city, days):\n    return days\nprint(f(**{"city": "Pune", "days": 3}))', '3', ['3', 'Pune', 'Error'], '3', 'Each key becomes a keyword argument.'),
    card('def f(city):\n    return city\nf(**{"town": "Pune"})', 'TypeError', ['Pune', 'None', 'TypeError'], "TypeError: f() got an unexpected keyword argument 'town'", 'The dict keys must match the parameter names.'),
    card('first, *rest = [1, 2, 3]\nprint(rest)', '[2, 3]', ['[2, 3]', '(2, 3)', '3'], '[2, 3]', 'A starred name in an assignment collects the rest as a list.'),
  ]},
  13: {title: 'Signature judge', show: 'card', choices: ['works', 'TypeError'], q: 'def f(a, /, b, *, c): ...   Does this call work?', items: [
    card('f(1, 2, c=3)', 'works', null, 'ok', 'a by position, b by position, c by name.'),
    card('f(1, b=2, c=3)', 'works', null, 'ok', 'b can be positional or keyword.'),
    card('f(a=1, b=2, c=3)', 'TypeError', null, 'TypeError', 'a is positional-only, so a=1 is not allowed.'),
    card('f(1, 2, 3)', 'TypeError', null, 'TypeError', 'c is keyword-only. You must write c=3.'),
    card('f(1, c=3, b=2)', 'works', null, 'ok', 'Keyword arguments can come in any order.'),
    card('f(1, 2)', 'TypeError', null, "TypeError: f() missing 1 required keyword-only argument: 'c'", 'c has no default, so it is required.'),
  ]},
  14: {title: 'Registry runner', show: 'card', q: 'What happens?', items: [
    card('def hi(): return "hi"\nx = hi\nprint(type(x).__name__)', 'function', ['str', 'function', 'NoneType'], 'function', 'No parentheses: x holds the function itself.'),
    card('def hi(): return "hi"\nx = hi()\nprint(x)', 'hi', ['hi', 'function', 'None'], 'hi', 'With () the function runs and returns "hi".'),
    card('T = {"a": lambda: 1}\nprint(T["a"]())', '1', ['1', 'function', 'KeyError'], '1', 'Look up the function, then call it.'),
    card('T = {"a": lambda: 1}\nprint(T.get("b"))', 'None', ['None', '1', 'KeyError'], 'None', '.get returns None for a missing key.'),
    card('T = {"a": lambda: 1}\nT["b"]()', 'KeyError', ['None', 'KeyError', '1'], "KeyError: 'b'", 'Square brackets raise KeyError when the name is missing.'),
    card('fns = [len, str.upper]\nprint(fns[1]("ok"))', 'OK', ['OK', '2', 'ok'], "'OK'", 'Functions can live in a list too.'),
  ]},
  15: {title: 'Lambda lab', show: 'card', q: 'What does it give?', items: [
    card('sorted([3, 1, 2])', '[1, 2, 3]', ['[1, 2, 3]', '[3, 2, 1]', 'None'], '[1, 2, 3]', 'sorted returns a new ascending list.'),
    card('sorted(["bb", "a", "ccc"], key=len)', "['a', 'bb', 'ccc']", ["['a', 'bb', 'ccc']", "['ccc', 'bb', 'a']", "['a', 'ccc', 'bb']"], "['a', 'bb', 'ccc']", 'key=len sorts by length.'),
    card('list(filter(lambda x: x > 1, [0, 1, 2, 3]))', '[2, 3]', ['[2, 3]', '[1, 2, 3]', '[True, True]'], '[2, 3]', 'filter keeps items where the function is True.'),
    card('list(map(lambda x: x * 2, [1, 2]))', '[2, 4]', ['[2, 4]', '[1, 2, 1, 2]', '[3]'], '[2, 4]', 'map applies the function to each item.'),
    card('m = map(str.upper, "ab")\nlist(m); print(list(m))', '[]', ["['A', 'B']", '[]', 'Error'], '[]', 'map is lazy and runs once. The second list is empty.'),
    card('(lambda a, b: a + b)(2, 3)', '5', ['5', 'function', '23'], '5', 'You can call a lambda right away.'),
  ]},
  16: {title: 'Scope detective', show: 'card', q: 'What does it print?', items: [
    card('x = "global"\ndef f():\n    return x\nprint(f())', 'global', ['global', 'NameError', 'None'], 'global', 'Not local, so Python finds the global x.'),
    card('x = "global"\ndef f():\n    x = "local"\n    return x\nf(); print(x)', 'global', ['global', 'local', 'Error'], 'global', 'The assignment inside f made a separate local x.'),
    card('def outer():\n    x = "enc"\n    def inner():\n        return x\n    return inner()\nprint(outer())', 'enc', ['enc', 'NameError', 'None'], 'enc', 'inner finds x in the enclosing scope.'),
    card('n = 0\ndef f():\n    n += 1\nf()', 'UnboundLocalError', ['1', '0', 'UnboundLocalError'], 'UnboundLocalError', 'Assigning makes n local, and it has no value yet.'),
    card('def mk():\n    c = 0\n    def t():\n        nonlocal c; c += 1; return c\n    return t\nt = mk(); t(); print(t())', '2', ['1', '2', '0'], '2', 'The closure keeps c between calls.'),
    card('fns = [lambda: i for i in range(3)]\nprint([f() for f in fns])', '[2, 2, 2]', ['[0, 1, 2]', '[2, 2, 2]', '[0, 0, 0]'], '[2, 2, 2]', 'All lambdas read i when called, after the loop ended at 2.'),
  ]},
  17: {title: 'Decorator tracer', show: 'card', q: 'What does it print?', items: [
    card('def shout(fn):\n    def w(): return fn().upper()\n    return w\n@shout\ndef hi(): return "hi"\nprint(hi())', 'HI', ['hi', 'HI', 'None'], 'HI', 'hi now points to the wrapper, which upper-cases the result.'),
    card('# same shout, no @wraps\nprint(hi.__name__)', 'w', ['hi', 'w', 'shout'], "'w'", 'Without functools.wraps the name is the wrapper\'s.'),
    card('T = {}\ndef tool(fn):\n    T[fn.__name__] = fn; return fn\n@tool\ndef search(): ...\nprint(list(T))', "['search']", ["['search']", '[]', "['tool']"], "['search']", 'The decorator ran when def ran, and registered the name.'),
    card('def twice(fn):\n    def w(): fn(); fn()\n    return w\n@twice\ndef ping(): print("p")\nping()', 'p p', ['p', 'p p', 'nothing'], 'p\np', 'The wrapper calls the function two times.'),
    card('def deco(fn):\n    print("deco ran")\n    return fn\n@deco\ndef f(): ...', 'deco ran', ['deco ran', 'nothing', 'Error'], 'deco ran', 'Decorators run once, at definition time, not at call time.'),
  ]},
  18: {title: 'Docstring check', show: 'card', q: 'What does it print?', items: [
    card('def f():\n    """Add two numbers."""\nprint(f.__doc__)', 'Add two numbers.', ['Add two numbers.', 'None', 'f'], 'Add two numbers.', 'The first string in the body is the docstring.'),
    card('def f():\n    x = 1\n    """Not a docstring."""\nprint(f.__doc__)', 'None', ['Not a docstring.', 'None', 'Error'], 'None', 'A docstring must be the first statement.'),
    card('def f():\n    # Adds numbers\n    pass\nprint(f.__doc__)', 'None', ['Adds numbers', 'None', '# Adds numbers'], 'None', 'Comments are not docstrings. The model never sees them.'),
    card('Which helps the LLM most?\nA: """Search."""\nB: """Search the wiki for a topic."""', 'B', ['A', 'B'], 'B', 'Say what the tool does and on which data.'),
    card('def get(q):\n    """Get stuff."""\n# good tool name and docstring?', 'no', ['yes', 'no'], 'no', 'Both are vague. The model cannot tell when to use it.'),
  ]},
  19: {title: 'Generator lab', show: 'card', q: 'What does it print?', items: [
    card('def g():\n    yield 1\n    yield 2\nprint(type(g()).__name__)', 'generator', ['generator', 'int', 'function'], 'generator', 'Calling a generator function returns a generator.'),
    card('it = iter(["a", "b"])\nnext(it)\nprint(next(it))', 'b', ['a', 'b', 'StopIteration'], 'b', 'Each next moves one step forward.'),
    card('def g():\n    yield 1\nx = g()\nnext(x)\nnext(x)', 'StopIteration', ['1', 'None', 'StopIteration'], 'StopIteration', 'Nothing left to yield.'),
    card('gen = (c for c in "ab")\nlist(gen); print(list(gen))', '[]', ["['a', 'b']", '[]', 'Error'], '[]', 'A generator is used up after one pass.'),
    card('def g():\n    print("start")\n    yield 1\nx = g()', 'nothing', ['start', 'nothing', '1'], '(no output)', 'The body does not run until the first next().'),
    card('sum(n for n in range(4))', '6', ['6', '10', '4'], '6', '0 + 1 + 2 + 3 = 6, one item at a time.'),
  ]},
};

export const mountStory = (n, el) => story(el, stories[n]);
export const mountGame = (n, el) => game(el, games[n]);
