/* eslint-disable */
// @ts-nocheck
/* Lesson steps for the Python course: read, predict, lab and task cards per lesson, plus the roadmap, agent x-ray and 8-week plan. */
const R = String.raw;
const rd = (h, b, code, out, more) => Object.assign({k:'read', h, b, code, out}, more||{});
const pr = (code, q, o, a, x) => ({k:'predict', code, q, o, a, x});
const lab = (h, b, w, more) => Object.assign({k:'lab', h, b, w}, more||{});
const task = (b, code) => ({k:'task', b, code});

const PARTS = [
  {id:1, roman:'I', title:'Python Foundations', desc:'Variables, types, strings, loops and collections. The universal base for every Python program.', ch:[1,2,3,4,5,6,7,8,9,10]},
  {id:2, roman:'II', title:'Functions', desc:'The heart of agent code. Every tool an agent calls is a Python function.', ch:[11,12,13,14,15,16,17,18,19]},
  {id:3, roman:'III', title:'Object-Oriented Programming', desc:'Needed to read any framework. Frameworks expect you to subclass their classes.', ch:[20,21,22,23,24,25,26,27]},
  {id:4, roman:'IV', title:'Typing and Data Modelling', desc:'Type hints, dataclasses, enums and Pydantic. The layer that makes agent code readable.', ch:[28,29,30,31]},
  {id:5, roman:'V', title:'Practical Python for AI', desc:'LLM calls fail often. Robust agents are mostly good error handling, JSON and HTTP.', ch:[32,33,34,35,36,37,38]}
];

const NEXT_PARTS = [
  {roman:'VI', title:'Engineering Practices', desc:'Not in your notes yet. Plan these after Part V.', items:[['Context managers','with, __enter__ / __exit__'],['async / await','event loop, gather, semaphores'],['Environments','venv, pip, uv, pyproject.toml'],['Logging and pytest','levels, fixtures, mocking LLM calls']]},
  {roman:'VII', title:'Gen AI Ecosystem', desc:'Start after Phases I–VI. With functions and classes solid, a framework is readable in a day.', items:[['FastAPI','Pydantic models, async endpoints, streaming'],['LLM SDKs','messages, tool calling, structured output'],['RAG','chunking, embeddings, a vector DB'],['The agent loop','write it by hand, then use LangGraph']]}
];

const L = {};

/* ================= PART I ================= */
L[1] = {t:'Variables, objects and type()', d:'A variable is a name that points to an object.', mins:12, core:true,
 goals:['Create variables and know what = really does','Understand that the type belongs to the object, not the name','Use type() to debug agent inputs and API responses'],
 steps:[
  lab('Story: The object warehouse', `<p>Press <b>Next</b> to play each scene and watch what the code does inside Python. Drag the room to look around.</p>`, 'story_1'),
  rd('Dynamic typing: the type lives on the object', `<p>A name can point to objects of different types at different times. This is <b>dynamic typing</b>.</p><p>Python still has types. Every object has one. The name just does not keep a permanent type.</p>`, R`x = 10        # x -> int object
x = "Hello"   # x -> str object
x = 3.14      # x -> float object
print(type(x))`, R`<class 'float'>`),
  pr(R`x = 5
x = "AI"
print(x)`, 'What does this print?', ['5','AI','An error'], 1, 'The second line makes x point to a new string object. The old object 5 is no longer used by x.'),
  rd('Why this matters in GenAI code', `<p>Different types support different operations. A string has <code>.upper()</code>. An integer does not. When an agent gets a value from a tool or an API, check the type first.</p>`, R`user_query = 123
print(user_query.upper())`, R`AttributeError: 'int' object has no attribute 'upper'`, {ai:'Engineering rule: when code fails unexpectedly, run print(type(value)) first. It finds most bugs in agent inputs, tool outputs and API responses.'}),
  pr(R`score = 98.5
print(type(score))`, 'What does type(score) return?', ["<class 'int'>","<class 'str'>","<class 'float'>"], 2, 'A number with a decimal point is a float object.'),
  lab('Game: The type() scanner', `<p>Answer each one before the scanner reveals it. Every answer comes with the reason.</p>`, 'game_1'),
  task('Type this, run it, and name each type before you look at the output.', R`model = "qwen"
tokens = 150
temperature = 0.7
is_running = True

print(type(model))
print(type(tokens))
print(type(temperature))
print(type(is_running))`)
 ],
 sum:[['variable','A name that refers to an object'],['object','A value that Python stores, with a type'],['=','Makes a name refer to an object'],['dynamic typing','A name can refer to objects of different types over time'],['type(x)','Tells you the type of the object x points to']]};

L[2] = {t:'Data types: int, float, str, bool, None', d:'The five primitives inside every LLM payload.', mins:12, core:true,
 goals:['Know the five basic types and when each appears','Read an LLM config and name every type','Understand None as "no value yet"'],
 steps:[
  lab('Story: Unpacking an LLM reply', `<p>Press <b>Next</b> to play each scene and watch what the code does inside Python. Drag the room to look around.</p>`, 'story_2'),
  rd('Five types you will see every day', `<p>Almost every value in an LLM request is one of five basic types.</p>`, null, null, {table:[['Type','Example','In an agent'],['int','max_tokens = 500','token limits, retries, top_k'],['float','temperature = 0.2','temperature, scores, cost'],['str','model = "gpt-4o-mini"','prompts, model names, roles'],['bool','stream = True','feature flags, is_done'],['None','tool_choice = None','"no value yet", missing result']]}),
  lab('Sort the values', `<p>Each value has exactly one type. Pick it. Watch for the traps: quotes make a string, and <code>True</code> has a capital T.</p>`, 'types'),
  rd('str and the quote trap', `<p>Anything inside quotes is a string, even if it looks like a number. <code>"42"</code> is text with two characters. You cannot add it to the number <code>42</code>.</p>`, R`print("42" + "42")
print(42 + 42)
print("42" + 42)`, R`4242
84
TypeError: can only concatenate str (not "int") to str`),
  rd('None means "no value"', `<p><code>None</code> is a special object. It means "nothing is here yet". A function that has no <code>return</code> gives back <code>None</code>. A tool with no result can return <code>None</code>.</p><p>Check for it with <code>is None</code>. You will learn why in lesson 5.</p>`, R`result = None
if result is None:
    print("Tool has not run yet")`, R`Tool has not run yet`),
  pr(R`config = {"model": "gpt-4o-mini", "temperature": 0.2, "stream": False}
print(type(config["stream"]))`, 'What does this print?', ["<class 'str'>","<class 'bool'>","<class 'NoneType'>"], 1, 'False without quotes is a bool. "False" with quotes would be a str.'),
  pr(R`print(type(7 / 7))`, 'What does this print?', ["<class 'int'>","<class 'float'>","<class 'bool'>"], 1, 'The / operator always gives a float in Python 3, even when the result is a whole number. 7 / 7 is 1.0.'),
  lab('Game: Payload sorter', `<p>Answer each one before the scanner reveals it. Every answer comes with the reason.</p>`, 'game_2'),
  task('Write an LLM request config with one value of each type. Print the type of each value.', R`request = {
    "model": "llama-3.1-8b",   # str
    "max_tokens": 300,         # int
    "temperature": 0.3,        # float
    "stream": True,            # bool
    "stop": None,              # None
}
for key, value in request.items():
    print(key, type(value))`)
 ],
 sum:[['int','Whole number: 3, -7, 500'],['float','Decimal number: 0.2, 1.0'],['str','Text in quotes: "user"'],['bool','True or False (capital letters)'],['None','No value yet; check with is None']]};

L[3] = {t:'Operators: / vs //, %, **', d:'The maths behind chunk sizes, pages and thresholds.', mins:10,
 goals:['Know the difference between / and //','Use % for remainders and ** for powers','Combine comparison and logical operators'],
 steps:[
  lab('Story: Chunking a document', `<p>Press <b>Next</b> to play each scene and watch what the code does inside Python. Drag the room to look around.</p>`, 'story_3'),
  rd('Two kinds of division', `<p><code>/</code> is true division. It always gives a float. <code>//</code> is floor division. It drops the decimal part and rounds down.</p><p><code>%</code> gives the remainder. <code>**</code> is power.</p>`, R`print(17 / 5)    # true division
print(17 // 5)   # floor division
print(17 % 5)    # remainder
print(2 ** 10)   # power`, R`3.4
3
2
1024`),
  lab('Operator calculator', `<p>Change <code>a</code> and <code>b</code>. Try negative numbers with <code>//</code> and <code>%</code>. Floor division rounds down, so <code>-7 // 2</code> is <code>-4</code>, not <code>-3</code>.</p>`, 'ops'),
  rd('= assigns, == compares', `<p>One equals sign assigns. Two equals signs ask a question and give a bool.</p>`, R`tokens = 600          # assign
print(tokens == 600)  # compare -> True
print(tokens > 512)   # compare -> True`, R`True
True`),
  rd('and, or, not', `<p>Logical operators combine conditions. <code>and</code> needs both sides true. <code>or</code> needs one side true. <code>not</code> flips a bool.</p>`, R`is_logged_in = True
has_credits = False
can_call_llm = is_logged_in and has_credits
print(can_call_llm)
print(not has_credits)`, R`False
True`, {ai:'Agents use these for guards: "if step < max_steps and not done:".'}),
  pr(R`total_tokens = 1300
chunk_size = 512
print(total_tokens // chunk_size, total_tokens % chunk_size)`, 'How many full chunks, and how many tokens are left?', ['2.54 0','2 276','3 0'], 1, '512 fits into 1300 two times (1024). 1300 - 1024 = 276 tokens are left for a final, smaller chunk.'),
  pr(R`print(10 > 5 and 3 > 8 or 2 == 2)`, 'What does this print?', ['True','False','An error'], 0, 'and runs before or. (10 > 5 and 3 > 8) is False. False or (2 == 2) is True.'),
  lab('Game: Operator scanner', `<p>Answer each one before the scanner reveals it. Every answer comes with the reason.</p>`, 'game_3'),
  task('Calculate pages for a list of 47 retrieved documents with 10 per page.', R`docs = 47
per_page = 10
full_pages = docs // per_page
left_over = docs % per_page
pages = full_pages + (1 if left_over > 0 else 0)
print(full_pages, left_over, pages)   # 4 7 5`)
 ],
 sum:[['/','True division, always a float'],['//','Floor division, rounds down'],['%','Remainder after division'],['**','Power'],['== vs =','Compare vs assign'],['and / or / not','Combine or flip conditions']]};

L[4] = {t:'Type conversion: int(), float(), str(), bool()', d:'Turn env vars and LLM text into safe values.', mins:10,
 goals:['Convert between str, int, float and bool','Know which conversions fail with ValueError','Handle a failed conversion safely'],
 steps:[
  lab('Story: The conversion machines', `<p>Press <b>Next</b> to play each scene and watch what the code does inside Python. Drag the room to look around.</p>`, 'story_4'),
  rd('Why convert?', `<p>Many values arrive as text. <code>input()</code> returns a string. Environment variables are strings. LLM output is a string. Before you do maths, you convert.</p>`, R`retries = "3"           # from an env var
print(retries + 1)`, R`TypeError: can only concatenate str (not "int") to str`),
  lab('Conversion lab', `<p>Type any text. See what each conversion gives you. Try <code>3.5</code>, <code>abc</code>, an empty box and <code>False</code>.</p>`, 'convert'),
  rd('The bool() surprise', `<p><code>bool()</code> does not read the words. Any non-empty string is <code>True</code>. So <code>bool("False")</code> is <code>True</code>.</p><p>To read a flag from an env var, compare the text instead.</p>`, R`raw = "False"
print(bool(raw))                    # True (non-empty)
debug = raw.lower() in ("1", "true", "yes")
print(debug)                        # False`, R`True
False`),
  rd('Handle conversion errors', `<p><code>int("abc")</code> raises <code>ValueError</code>. In real code, catch it and use a safe default.</p>`, R`import os

try:
    max_retries = int(os.getenv("MAX_RETRIES", "3"))
except ValueError:
    max_retries = 3
print(max_retries)`, R`3`),
  pr(R`print(int("3.5"))`, 'What happens?', ['3','4','ValueError'], 2, 'int() only accepts text that looks like a whole number. First use float("3.5"), then int() if you need it.'),
  pr(R`print(int(3.99))`, 'What does this print?', ['3','4','3.99'], 0, 'int() on a float cuts off the decimal part. It does not round.'),
  lab('Game: Conversion scanner', `<p>Answer each one before the scanner reveals it. Every answer comes with the reason.</p>`, 'game_4'),
  task('Read a temperature from text the user typed, safely.', R`text = input("Temperature: ")
try:
    temperature = float(text)
except ValueError:
    print("Please type a number, for example 0.2")
    temperature = 0.2
print(type(temperature), temperature)`)
 ],
 sum:[['int("42")','Text to whole number'],['float("0.2")','Text to decimal'],['str(500)','Anything to text'],['bool(x)','Empty or zero is False; else True'],['ValueError','Text cannot be converted']]};

L[5] = {t:'Truthy, falsy, and is vs ==', d:'How if decides, and how to check None.', mins:10, core:true,
 goals:['Know which values Python treats as False','Write short checks like if reply.get("tool_call"):','Know when to use is and when to use =='],
 steps:[
  lab('Story: The if gate', `<p>Press <b>Next</b> to play each scene and watch what the code does inside Python. Drag the room to look around.</p>`, 'story_5'),
  rd('Every value is truthy or falsy', `<p>An <code>if</code> does not need a bool. Python asks each value: are you truthy or falsy?</p><p>Falsy values: <code>False</code>, <code>None</code>, <code>0</code>, <code>0.0</code>, <code>""</code>, <code>[]</code>, <code>{}</code>, <code>set()</code>. Everything else is truthy.</p>`, R`messages = []
if not messages:
    print("No history yet")`, R`No history yet`),
  lab('Does the if block run?', `<p>Pick a value. See whether <code>if value:</code> runs its block.</p>`, 'truthy'),
  rd('== compares values, is compares identity', `<p><code>==</code> asks: do these two objects have the same value? <code>is</code> asks: are these the same object in memory?</p>`, R`a = [1, 2]
b = a          # same object
c = [1, 2]     # new object, same value
print(a == c, a is c)
print(a == b, a is b)`, R`True False
True True`),
  rd('Use is only for None, True, False', `<p>There is only one <code>None</code> object, so <code>is None</code> is the correct check. For numbers and strings, use <code>==</code>.</p>`, R`count = 0
if count is None:    # correct: "has it been set?"
    print("not set")
if not count:        # True for 0 too!
    print("zero or not set")`, R`zero or not set`, {note:'if not x treats 0 and "" like None. When 0 is a valid value, write if x is None.'}),
  pr(R`reply = {"content": "Hi", "tool_call": None}
if reply.get("tool_call"):
    print("call tool")
else:
    print("final answer")`, 'What does this print?', ['call tool','final answer','KeyError'], 1, 'tool_call is None, and None is falsy. So the else block runs.'),
  pr(R`x = [0]
print(bool(x))`, 'What does this print?', ['True','False','0'], 0, 'The list is not empty. It has one item. An item that is 0 does not make the list falsy.'),
  lab('Game: Truthy or falsy?', `<p>Answer each one before the scanner reveals it. Every answer comes with the reason.</p>`, 'game_5'),
  task('Write a check that prints a different message for None, an empty list, and a list with items.', R`def describe(results):
    if results is None:
        return "search did not run"
    if not results:
        return "search ran, found nothing"
    return f"found {len(results)} documents"

print(describe(None))
print(describe([]))
print(describe(["doc1", "doc2"]))`)
 ],
 sum:[['falsy','False, None, 0, 0.0, "", [], {}, set()'],['truthy','Everything else'],['==','Same value?'],['is','Same object?'],['is None','The correct way to check None']]};

L[6] = {t:'Strings, slicing and f-strings', d:'Prompts are strings. Learn to cut, join and fill them.', mins:15, core:true,
 goals:['Slice strings with start, stop and step','Use split, join, strip and replace','Build prompts with f-strings and multi-line strings'],
 steps:[
  lab('Story: Cutting a prompt', `<p>Press <b>Next</b> to play each scene and watch what the code does inside Python. Drag the room to look around.</p>`, 'story_6'),
  rd('A string is a sequence of characters', `<p>Each character has a position called an index. Indexes start at <code>0</code>. Negative indexes count from the end: <code>-1</code> is the last character.</p>`, R`s = "Python"
print(s[0], s[-1], len(s))`, R`P n 6`),
  lab('Slicing playground', `<p>A slice is <code>s[start:stop:step]</code>. The start is included. The stop is not. Change the numbers, or click a preset.</p>`, 'slice'),
  rd('split, join, strip, replace', `<p>These four methods do most text cleaning in RAG pipelines. They return a <b>new</b> string. The original string does not change.</p>`, R`raw = "  RAG, agents, tools  "
clean = raw.strip()               # "RAG, agents, tools"
parts = clean.split(", ")         # ['RAG', 'agents', 'tools']
joined = " | ".join(parts)        # "RAG | agents | tools"
fixed = joined.replace("RAG", "Retrieval")
print(fixed)`, R`Retrieval | agents | tools`),
  rd('f-strings fill a template', `<p>Put <code>f</code> before the quotes. Then write any variable or expression inside <code>{}</code>.</p>`, R`city = "Hyderabad"
temp = 31.456
print(f"Weather in {city}: {temp:.1f} C")`, R`Weather in Hyderabad: 31.5 C`),
  rd('Multi-line strings are prompt templates', `<p>Three quotes let a string go over many lines. Combine this with an f-string, and you have a prompt template.</p>`, R`question = "What is RAG?"
context = "RAG adds retrieved documents to the prompt."

prompt = f"""You are a helpful tutor.
Use only the context below.

Context: {context}
Question: {question}
"""
print(prompt)`, null, {ai:'Every agent framework builds its system prompt like this. A prompt is not a special type. It is just a str.'}),
  pr(R`s = "agent"
print(s[::-1])`, 'What does this print?', ['agent','tnega','a'], 1, 'A step of -1 walks backwards through the whole string.'),
  pr(R`words = "a,b,,c".split(",")
print(len(words))`, 'How many items does split give?', ['3','4','5'], 1, 'The empty text between the two commas becomes an empty string item: ["a", "b", "", "c"].'),
  lab('Game: String slicer', `<p>Answer each one before the scanner reveals it. Every answer comes with the reason.</p>`, 'game_6'),
  task('Build a prompt from a list of retrieved chunks.', R`chunks = ["  RAG retrieves documents. ", "Then the LLM answers.  "]
clean = [c.strip() for c in chunks]
context = "\n".join(clean)
prompt = f"""Answer using this context:
{context}

Question: How does RAG work?"""
print(prompt)`)
 ],
 sum:[['s[a:b:c]','Slice: start included, stop excluded'],['split / join','Text to list / list to text'],['strip','Remove spaces at both ends'],['replace','Return a copy with text replaced'],['f"{x}"','Fill a template'],['"""..."""','Multi-line string, prompt templates']]};

L[7] = {t:'Control flow: if, for, while, break, continue', d:'An agent is a bounded loop that checks for tool calls.', mins:15, core:true,
 goals:['Make decisions with if / elif / else','Loop with for and while, and control them with break and continue','Understand the rare for ... else'],
 steps:[
  lab('Story: The agent loop', `<p>Press <b>Next</b> to play each scene and watch what the code does inside Python. Drag the room to look around.</p>`, 'story_7'),
  rd('if, elif, else', `<p>Python runs the first block whose condition is true. Indentation (4 spaces) shows which lines belong to the block.</p>`, R`score = 0.72
if score > 0.8:
    print("high relevance")
elif score > 0.5:
    print("medium relevance")
else:
    print("drop this chunk")`, R`medium relevance`),
  rd('for and while', `<p><code>for</code> repeats once for each item. <code>while</code> repeats as long as a condition is true. Use <code>for</code> when you know the items. Use <code>while</code> when you wait for a condition.</p>`, R`for i in range(3):
    print("attempt", i)

step = 0
while step < 2:
    step += 1
print("steps:", step)`, R`attempt 0
attempt 1
attempt 2
steps: 2`),
  lab('Step through a loop', `<p>Press <b>Step</b> to run one line at a time. Watch <code>continue</code> skip an item and <code>break</code> stop the loop. Then remove the <code>"stop"</code> item and see the <code>else</code> block run.</p>`, 'loop'),
  rd('The agent loop is a for loop', `<p>A real agent asks the LLM, runs a tool if needed, and repeats. A <code>for</code> loop with <code>range(max_steps)</code> stops it from looping forever.</p>`, R`for step in range(5):            # max-steps guard
    reply = call_llm(history)
    if reply.get("tool_call"):
        history.append(run_tool(reply))
        continue                     # ask the LLM again
    print(reply["content"])
    break                            # final answer
else:
    print("Stopped: too many steps")`, null, {ai:'This is the most important loop in the course. You will write it by hand at the end.'}),
  pr(R`for n in [1, 2, 3, 4]:
    if n == 2:
        continue
    if n == 4:
        break
    print(n)`, 'What does this print?', ['1 2 3','1 3','1 3 4'], 1, 'continue skips 2. break stops the loop at 4 before print runs.'),
  pr(R`for doc in ["a", "b"]:
    if doc == "z":
        break
else:
    print("not found")`, 'What does this print?', ['Nothing','not found','z'], 1, 'The loop finished without break, so the else block runs. Read for ... else as "for ... if no break".'),
  lab('Game: Loop tracer', `<p>Answer each one before the scanner reveals it. Every answer comes with the reason.</p>`, 'game_7'),
  task('Write a search loop that uses for ... else.', R`docs = ["intro.md", "rag.md", "agents.md"]
target = "rag.md"
for doc in docs:
    if doc == target:
        print("Found", doc)
        break
else:
    print(target, "is not in the index")`)
 ],
 sum:[['if / elif / else','Run the first true branch'],['for','Repeat for each item'],['while','Repeat while a condition is true'],['break','Stop the loop now'],['continue','Skip to the next item'],['for ... else','else runs only if no break happened']]};

L[8] = {t:'Collections: list, tuple, dict, set', d:'Which container to use, and how fast each one is.', mins:18, core:true,
 goals:['Choose between list, tuple, dict and set','Use the common methods of each','Understand O(1) vs O(n) lookups'],
 steps:[
  lab('Story: Four kinds of shelves', `<p>Press <b>Next</b> to play each scene and watch what the code does inside Python. Drag the room to look around.</p>`, 'story_8'),
  rd('Four containers', `<p>Each collection answers a different need.</p>`, null, null, {table:[['Type','Looks like','Ordered','Changeable','Use it for'],['list','[1, 2, 3]','yes','yes','chat history, results'],['tuple','(1, 2)','yes','no','fixed pairs, dict keys'],['dict','{"role": "user"}','yes (3.7+)','yes','JSON payloads, configs'],['set','{"a", "b"}','no','yes','unique IDs, fast "in"']]}),
  rd('list and dict in agent code', `<p>A list keeps items in order. A dict maps keys to values. Chat history is a list of dicts.</p>`, R`messages = []
messages.append({"role": "user", "content": "Hi"})
messages.append({"role": "assistant", "content": "Hello!"})

config = {"model": "gpt-4o-mini", "temperature": 0.2}
config["temperature"] = 0.0
print(len(messages), config.get("top_p", 1.0))`, R`2 1.0`, {note:'config["top_p"] raises KeyError when the key is missing. config.get("top_p", 1.0) returns the default instead.'}),
  rd('tuple and set', `<p>A tuple cannot change, so Python can hash it. That is why a tuple can be a dict key and a list cannot. A set keeps only unique items.</p>`, R`cache = {("gpt-4o", "What is RAG?"): "RAG is ..."}

retrieved = ["d1", "d7", "d1", "d3", "d7"]
unique = set(retrieved)
print(len(unique), "d7" in unique)`, R`3 True`),
  lab('Why sets are fast', `<p>To find an item, a list checks items one by one. A set jumps to the right place with a hash. Press <b>Search</b> and move the size slider.</p>`, 'bigo'),
  pr(R`seen = {"d1", "d2"}
seen.add("d1")
print(len(seen))`, 'What does this print?', ['2','3','An error'], 0, 'A set keeps only unique items. Adding d1 again does nothing.'),
  pr(R`key = ["gpt-4o", "hi"]
cache = {key: "hello"}`, 'What happens?', ['It works','TypeError: unhashable type','KeyError'], 1, 'A list can change, so it cannot be hashed. Use a tuple: ("gpt-4o", "hi").'),
  lab('Game: Container picker', `<p>Answer each one before the scanner reveals it. Every answer comes with the reason.</p>`, 'game_8'),
  task('Remove duplicate chunk IDs but keep their first order.', R`ids = ["c3", "c1", "c3", "c2", "c1"]
seen = set()
ordered = []
for i in ids:
    if i not in seen:      # O(1) check
        seen.add(i)
        ordered.append(i)
print(ordered)             # ['c3', 'c1', 'c2']`)
 ],
 sum:[['list','Ordered, changeable sequence'],['tuple','Ordered, fixed; can be a dict key'],['dict','Key to value; JSON shape'],['set','Unique items; fast membership'],['O(1)','Same speed for any size (dict, set lookup)'],['O(n)','Slower as size grows (list search)']]};

L[9] = {t:'Nested structures: chat history and LLM responses', d:'Lists of dicts in, nested dicts out.', mins:12, core:true,
 goals:['Read deep values with chained [ ] access','Add messages to chat history','Avoid KeyError and IndexError on real responses'],
 steps:[
  lab('Story: Walking a nested reply', `<p>Press <b>Next</b> to play each scene and watch what the code does inside Python. Drag the room to look around.</p>`, 'story_9'),
  rd('Chat history is a list of dicts', `<p>Each message is a dict with a <code>role</code> and <code>content</code>. The history is a list of these dicts, in order.</p>`, R`history = [
    {"role": "system", "content": "You are a tutor."},
    {"role": "user", "content": "What is RAG?"},
]
print(history[1]["content"])`, R`What is RAG?`),
  rd('Read the access path left to right', `<p>Each <code>[ ]</code> goes one level deeper. <code>history[1]</code> gives a dict. <code>["content"]</code> gives a string from that dict.</p><p>Use a number for a list position. Use a key for a dict.</p>`),
  lab('Click your way into a real response', `<p>This is the shape of a real chat completion response. Click any key or value. The page writes the Python path for you. Then try the three challenges.</p>`, 'json'),
  rd('Loop over nested data', `<p>Use a loop or a comprehension to pull out the parts you need.</p>`, R`results = [
    {"text": "RAG adds context", "score": 0.91},
    {"text": "Agents call tools", "score": 0.42},
]
good = [r["text"] for r in results if r["score"] > 0.5]
print(good)`, R`['RAG adds context']`),
  pr(R`resp = {"choices": [{"message": {"content": "Hi"}}]}
print(resp["choices"]["message"])`, 'What happens?', ['Hi','TypeError','{"content": "Hi"}'], 1, 'resp["choices"] is a list. You must pick an index first: resp["choices"][0]["message"].'),
  pr(R`msg = {"role": "user"}
print(msg.get("content", ""))`, 'What does this print?', ['None','An empty line','KeyError'], 1, '.get returns the default "" when the key is missing. print("") prints an empty line.'),
  lab('Game: Path finder', `<p>Answer each one before the scanner reveals it. Every answer comes with the reason.</p>`, 'game_9'),
  task('Print only the user messages from a chat history.', R`history = [
    {"role": "system", "content": "Be brief."},
    {"role": "user", "content": "Hi"},
    {"role": "assistant", "content": "Hello!"},
    {"role": "user", "content": "Explain RAG"},
]
for m in history:
    if m["role"] == "user":
        print(m["content"])`)
 ],
 sum:[['list of dicts','The shape of chat history'],['x[0]["key"]','Index for lists, key for dicts'],['.get(k, d)','Safe read with a default'],['KeyError','Dict key is missing'],['IndexError','List position does not exist']]};

L[10] = {t:'Mutable vs immutable, references and copies', d:'Why one change can appear in two places.', mins:15, core:true,
 goals:['Know which types can change in place','Understand that = copies the reference, not the object','Choose between a shallow and a deep copy'],
 steps:[
  lab('Story: Shared boxes', `<p>Press <b>Next</b> to play each scene and watch what the code does inside Python. Drag the room to look around.</p>`, 'story_10'),
  rd('Mutable and immutable', `<p>A <b>mutable</b> object can change in place: list, dict, set. An <b>immutable</b> object cannot: int, float, str, bool, None, tuple.</p><p>When you "change" a string, Python makes a new string.</p>`, R`s = "hi"
t = s.upper()     # new object
print(s, t)

items = [1, 2]
items.append(3)   # same object, changed
print(items)`, R`hi HI
[1, 2, 3]`),
  rd('= copies the reference', `<p><code>b = a</code> does not copy the list. It makes a second name for the <b>same</b> list. A change through <code>b</code> is visible through <code>a</code>.</p>`, R`a = ["hi"]
b = a
b.append("bye")
print(a)`, R`['hi', 'bye']`),
  lab('Copy lab', `<p>Pick how <code>b</code> is made from <code>a</code>. Then change <code>b</code>. Watch what happens to <code>a</code>. The tags show which objects are shared.</p>`, 'copy'),
  rd('Shallow vs deep copy', `<p>A <b>shallow copy</b> makes a new outer list, but the dicts inside are still shared. A <b>deep copy</b> copies everything, all the way down.</p>`, R`import copy
history = [{"role": "user", "content": "hi"}]
shallow = history.copy()
deep = copy.deepcopy(history)
shallow[0]["content"] = "CHANGED"
print(history[0]["content"])   # CHANGED (shared dict)
print(deep[0]["content"])      # hi`, null, {ai:'If two user sessions share one history list, one user can see the other user\'s messages. Give each session its own list.'}),
  pr(R`a = [1, 2]
b = a[:]
b.append(3)
print(a)`, 'What does this print?', ['[1, 2]','[1, 2, 3]','An error'], 0, 'a[:] makes a new list (a shallow copy). Changing b does not change a.'),
  pr(R`x = (1, [2])
x[1].append(3)
print(x)`, 'What happens?', ['TypeError: tuple is immutable','(1, [2, 3])','(1, [2])'], 1, 'The tuple cannot change which objects it holds. But the list inside it is mutable and can change.'),
  lab('Game: Reference tracer', `<p>Answer each one before the scanner reveals it. Every answer comes with the reason.</p>`, 'game_10'),
  task('Prove the shallow copy trap to yourself with id().', R`import copy
a = [{"k": 1}]
b = a.copy()
c = copy.deepcopy(a)
print(a is b, a[0] is b[0])   # False True
print(a is c, a[0] is c[0])   # False False`)
 ],
 sum:[['mutable','list, dict, set: change in place'],['immutable','int, str, tuple, ...: never change'],['b = a','Same object, two names'],['.copy() / [:]','Shallow: new outer, shared inner'],['copy.deepcopy','New objects all the way down']]};
/* ================= PART II ================= */
L[11] = {t:'Functions, return values and defaults', d:'Every agent tool is a function.', mins:14, core:true,
 goals:['Define functions with parameters and return values','Know the difference between return and print','Avoid the mutable default argument trap'],
 steps:[
  lab('Story: The tool machine', `<p>Press <b>Next</b> to play each scene and watch what the code does inside Python. Drag the room to look around.</p>`, 'story_11'),
  rd('A function is a named, reusable block', `<p><code>def</code> creates a function. Parameters are the names in the brackets. Arguments are the values you pass when you call it.</p>`, R`def search_docs(query, top_k=3):
    return [f"doc about {query}"] * top_k

print(search_docs("RAG", 2))`, R`['doc about RAG', 'doc about RAG']`),
  rd('return gives a value back; print only shows it', `<p><code>print</code> writes to the screen and gives back nothing. <code>return</code> hands a value back to the caller, so other code can use it. A function without <code>return</code> returns <code>None</code>.</p>`, R`def show(x):
    print(x)

def give(x):
    return x

a = show(5)   # prints 5
b = give(5)
print(a, b)`, R`5
None 5`, {ai:'An agent tool must return its result. If a tool only prints, the LLM gets None.'}),
  rd('Default arguments', `<p>A default value is used when the caller does not pass that argument. Put parameters with defaults after the ones without.</p>`, R`def call_llm(prompt, model="gpt-4o-mini", temperature=0.0):
    return f"{model} @ {temperature}: {prompt}"

print(call_llm("Hi"))
print(call_llm("Hi", temperature=0.7))`, R`gpt-4o-mini @ 0.0: Hi
gpt-4o-mini @ 0.7: Hi`),
  lab('The mutable default trap', `<p>Python creates a default value <b>once</b>, when it defines the function. A default list is then shared by every call. Call both versions a few times.</p>`, 'default'),
  pr(R`def add(msg, history=[]):
    history.append(msg)
    return history

add("a")
print(add("b"))`, 'What does this print?', ["['b']","['a', 'b']","An error"], 1, 'The same default list is reused. The first call left "a" in it.'),
  pr(R`def f():
    x = 1
print(f())`, 'What does this print?', ['1','None','An error'], 1, 'The function has no return statement, so it returns None.'),
  lab('Game: Call tracer', `<p>Answer each one before the scanner reveals it. Every answer comes with the reason.</p>`, 'game_11'),
  task('Write the safe version of add_msg, and test it twice.', R`def add_msg(msg, history=None):
    if history is None:
        history = []          # a new list for every call
    history.append(msg)
    return history

print(add_msg("hi"))     # ['hi']
print(add_msg("bye"))    # ['bye']`)
 ],
 sum:[['def','Create a function'],['parameter / argument','The name / the value passed in'],['return','Give a value back (default None)'],['default','Value used when the caller does not pass one'],['history=None','The safe pattern for mutable defaults']]};

L[12] = {t:'*args, **kwargs and unpacking', d:'How an agent calls tool(**args).', mins:14, core:true,
 goals:['Accept any number of arguments with *args and **kwargs','Unpack lists with * and dicts with **','Understand the line result = TOOLS[name](**args)'],
 steps:[
  lab('Story: Packing and unpacking arguments', `<p>Press <b>Next</b> to play each scene and watch what the code does inside Python. Drag the room to look around.</p>`, 'story_12'),
  rd('*args collects extra positional arguments', `<p>A star before a parameter collects all extra positional arguments into a <b>tuple</b>.</p>`, R`def total(*args):
    print(args)
    return sum(args)

print(total(1, 2, 3))`, R`(1, 2, 3)
6`),
  rd('**kwargs collects extra keyword arguments', `<p>Two stars collect extra keyword arguments into a <b>dict</b>.</p>`, R`def call_llm(prompt, **kwargs):
    print(kwargs)

call_llm("Hi", temperature=0.2, max_tokens=100)`, R`{'temperature': 0.2, 'max_tokens': 100}`),
  rd('The same stars also unpack', `<p>In a function <b>call</b>, <code>*</code> spreads a list into positional arguments. <code>**</code> spreads a dict into keyword arguments.</p>`, R`def search(query, top_k):
    return f"{top_k} results for {query}"

args_list = ["RAG", 3]
args_dict = {"query": "RAG", "top_k": 3}
print(search(*args_list))
print(search(**args_dict))`, R`3 results for RAG
3 results for RAG`),
  lab('From LLM JSON to a function call', `<p>The LLM sends tool arguments as a JSON string. Step through how one line of agent code turns it into a real function call. Then add an extra key the function does not accept.</p>`, 'unpack'),
  pr(R`def f(a, b, c):
    return a + b + c
nums = [1, 2, 3]
print(f(*nums))`, 'What does this print?', ['[1, 2, 3]','6','TypeError'], 1, '*nums unpacks into f(1, 2, 3).'),
  pr(R`def f(**kw):
    return type(kw).__name__
print(f(x=1))`, 'What does this print?', ['tuple','dict','kwargs'], 1, '**kw always collects keyword arguments into a dict.'),
  lab('Game: Unpacking scanner', `<p>Answer each one before the scanner reveals it. Every answer comes with the reason.</p>`, 'game_12'),
  task('Write a wrapper that passes every argument through to another function.', R`def call_llm(prompt, model="gpt-4o-mini", temperature=0.0):
    return f"{model}/{temperature}: {prompt}"

def logged_call(*args, **kwargs):
    print("args:", args, "kwargs:", kwargs)
    return call_llm(*args, **kwargs)

print(logged_call("Hi", temperature=0.5))`)
 ],
 sum:[['*args','Collect extra positional arguments (tuple)'],['**kwargs','Collect extra keyword arguments (dict)'],['f(*lst)','Unpack a list into positions'],['f(**d)','Unpack a dict into keywords'],['tool(**args)','How agents call tools from LLM JSON']]};

L[13] = {t:'Positional-only and keyword-only parameters', d:'Force clear calls with / and *.', mins:9,
 goals:['Read / and * in a function signature','Know which calls are valid','See why SDKs use keyword-only options'],
 steps:[
  lab('Story: Three kinds of slots', `<p>Press <b>Next</b> to play each scene and watch what the code does inside Python. Drag the room to look around.</p>`, 'story_13'),
  rd('Two ways to pass an argument', `<p>By <b>position</b>: <code>f(1, 2)</code>. By <b>keyword</b>: <code>f(a=1, b=2)</code>. Normally, both work. Two symbols in the signature can restrict this.</p>`),
  rd('/ and * in a signature', `<p>Everything <b>before</b> <code>/</code> is positional-only. Everything <b>after</b> <code>*</code> is keyword-only. Parameters between them accept both.</p>`, R`def call_llm(prompt, /, model="gpt-4o-mini", *, temperature=0.0):
    ...`, null, {table:[['Parameter','Position','Keyword'],['prompt','yes','no'],['model','yes','yes'],['temperature','no','yes']]}),
  lab('Valid call or TypeError?', `<p>Click each call. Decide first, then check.</p>`, 'sig'),
  rd('Why SDKs use keyword-only options', `<p>Compare <code>client.create("Hi", "gpt", 0.2, 500, True)</code> with <code>client.create("Hi", model="gpt", temperature=0.2)</code>. The second call is easy to read and safe to change. The OpenAI and Anthropic SDKs make most options keyword-only for this reason.</p>`),
  pr(R`def f(a, *, b):
    return a + b
print(f(1, 2))`, 'What happens?', ['3','TypeError','None'], 1, 'b is keyword-only. You must write f(1, b=2).'),
  lab('Game: Signature judge', `<p>Answer each one before the scanner reveals it. Every answer comes with the reason.</p>`, 'game_13'),
  task('Write a function with one positional-only and two keyword-only parameters. Try a call that breaks each rule.', R`def embed(text, /, *, model="text-embedding-3-small", normalize=True):
    return f"{model} normalize={normalize}: {text[:20]}"

print(embed("hello world", normalize=False))
# embed(text="hello")        -> TypeError
# embed("hello", "model-x")  -> TypeError`)
 ],
 sum:[['/','Parameters before it: position only'],['*','Parameters after it: keyword only'],['TypeError','Raised when a call breaks the rules'],['keyword-only options','Clear, safe API calls']]};

L[14] = {t:'Functions as objects and tool registries', d:'Store functions in a dict and call them by name.', mins:12, core:true,
 goals:['Store a function in a variable and in a dict','Pass a function into another function','Build the tool registry that every agent uses'],
 steps:[
  lab('Story: The tool registry', `<p>Press <b>Next</b> to play each scene and watch what the code does inside Python. Drag the room to look around.</p>`, 'story_14'),
  rd('A function is an object', `<p>Without brackets, <code>get_weather</code> is the function object itself. With brackets, <code>get_weather("Pune")</code> calls it. You can give a function another name.</p>`, R`def get_weather(city):
    return f"Sunny in {city}"

f = get_weather          # no () -> no call
print(f("Pune"))
print(f.__name__)`, R`Sunny in Pune
get_weather`),
  rd('Store functions in a dict', `<p>A dict can map a tool name (a string from the LLM) to the function that runs it. This is a <b>tool registry</b>.</p>`, R`def calculator(expr):
    return str(eval(expr))   # demo only

TOOLS = {
    "get_weather": get_weather,
    "calculator": calculator,
}
print(TOOLS["calculator"]("2 + 3"))`, R`5`, {note:'eval is unsafe with untrusted input. It is here only to keep the demo short.'}),
  lab('Dispatch a tool call', `<p>Pick what the LLM asked for. The agent looks the name up in <code>TOOLS</code> and calls it. Try the tool that does not exist.</p>`, 'registry'),
  rd('Pass a function to another function', `<p>Because functions are objects, you can pass them as arguments. <code>sorted(key=...)</code> and retry helpers work like this.</p>`, R`def run_twice(fn, value):
    return fn(fn(value))

print(run_twice(str.upper, "ok"))`, R`OK`),
  pr(R`def hi():
    return "hi"
x = hi
print(type(x).__name__)`, 'What does this print?', ['str','function','NoneType'], 1, 'x = hi stores the function. It does not call it.'),
  pr(R`TOOLS = {"a": len}
print(TOOLS.get("b", lambda *_: "unknown")("x"))`, 'What does this print?', ['1','unknown','KeyError'], 1, '"b" is missing, so .get returns the fallback function, and that function is then called.'),
  lab('Game: Registry runner', `<p>Answer each one before the scanner reveals it. Every answer comes with the reason.</p>`, 'game_14'),
  task('Build a safe dispatcher that returns an error string for an unknown tool.', R`def run_tool(name, args):
    fn = TOOLS.get(name)
    if fn is None:
        return f"Error: unknown tool {name!r}"
    return fn(**args)

print(run_tool("get_weather", {"city": "Chennai"}))
print(run_tool("send_email", {}))`)
 ],
 sum:[['fn vs fn()','The object vs a call'],['TOOLS dict','Tool name to function'],['TOOLS.get(name)','Safe lookup for unknown tools'],['higher-order function','Takes or returns a function']]};

L[15] = {t:'lambda, map() and filter()', d:'Small inline functions for sorting and filtering.', mins:12,
 goals:['Write a lambda','Transform with map and keep items with filter','Know when a comprehension is clearer'],
 steps:[
  lab('Story: Sorting search results', `<p>Press <b>Next</b> to play each scene and watch what the code does inside Python. Drag the room to look around.</p>`, 'story_15'),
  rd('lambda is a one-line function', `<p><code>lambda x: x * 2</code> is the same as a <code>def</code> with one <code>return</code>. It has no name. Use it for short key functions.</p>`, R`double = lambda x: x * 2
print(double(4))

docs = [{"id": 1, "score": 0.4}, {"id": 2, "score": 0.9}]
best = sorted(docs, key=lambda d: d["score"], reverse=True)
print(best[0]["id"])`, R`8
2`),
  rd('map transforms, filter keeps', `<p><code>map(f, items)</code> applies <code>f</code> to every item. <code>filter(f, items)</code> keeps items where <code>f</code> returns truthy. Both return lazy iterators, so wrap them in <code>list()</code> to see the result.</p>`),
  lab('Build a pipeline', `<p>Choose a filter and a map. See each score flow through. Compare the two ways to write the same thing.</p>`, 'pipeline'),
  rd('Prefer comprehensions for readability', `<p>Most Python teams prefer a list comprehension. It reads left to right and does both jobs in one line.</p>`, R`scores = [0.91, 0.42, 0.77]
a = list(map(lambda s: round(s, 1), filter(lambda s: s > 0.5, scores)))
b = [round(s, 1) for s in scores if s > 0.5]
print(a == b, b)`, R`True [0.9, 0.8]`),
  pr(R`print(list(filter(None, [0, 1, "", "a", None])))`, 'What does this print?', ["[0, 1, '', 'a', None]","[1, 'a']","[]"], 1, 'filter(None, ...) keeps only truthy items.'),
  pr(R`m = map(str.upper, ["a", "b"])
print(list(m), list(m))`, 'What does this print?', ["['A', 'B'] ['A', 'B']","['A', 'B'] []","An error"], 1, 'map is an iterator. After you use it once, it is empty.'),
  lab('Game: Lambda lab', `<p>Answer each one before the scanner reveals it. Every answer comes with the reason.</p>`, 'game_15'),
  task('Sort tool results by score, keep the top 2, and get only their text.', R`results = [
    {"text": "A", "score": 0.3},
    {"text": "B", "score": 0.95},
    {"text": "C", "score": 0.7},
]
top = sorted(results, key=lambda r: r["score"], reverse=True)[:2]
print([r["text"] for r in top])   # ['B', 'C']`)
 ],
 sum:[['lambda','Small unnamed function'],['map','Apply a function to every item'],['filter','Keep items that pass a test'],['sorted(key=)','Sort by a computed value'],['comprehension','Usually the clearer choice']]};

L[16] = {t:'Scope (LEGB) and closures', d:'Where Python looks for a name.', mins:16, core:true,
 goals:['Use the LEGB rule to find which value a name has','Understand UnboundLocalError','Write a closure and use nonlocal'],
 steps:[
  lab('Story: Where Python looks for a name', `<p>Press <b>Next</b> to play each scene and watch what the code does inside Python. Drag the room to look around.</p>`, 'story_16'),
  rd('Scope is where a name is visible', `<p>When Python sees a name, it searches four places in a fixed order. It stops at the first match.</p><ul><li><b>L</b>ocal: inside the current function</li><li><b>E</b>nclosing: inside an outer function</li><li><b>G</b>lobal: at the top of the file</li><li><b>B</b>uilt-in: names like <code>len</code> and <code>print</code></li></ul>`),
  lab('Watch Python search the layers', `<p>Each layer is a scope. Remove definitions of <code>model</code> and press <b>Look up</b>. Python searches from the top layer down.</p>`, 'legb'),
  rd('UnboundLocalError', `<p>If a function <b>assigns</b> to a name anywhere, Python treats that name as local in the whole function. Reading it before the assignment fails.</p>`, R`count = 0
def bump():
    count = count + 1   # count is local here
bump()`, R`UnboundLocalError: cannot access local variable 'count'`),
  rd('A closure remembers its enclosing variables', `<p>An inner function can use variables from the outer function, even after the outer function has returned. This is a <b>closure</b>. Use <code>nonlocal</code> to change such a variable.</p>`, R`def make_counter():
    calls = 0
    def counter():
        nonlocal calls
        calls += 1
        return calls
    return counter

tick = make_counter()
tick(); tick()
print(tick())`, R`3`, {ai:'Decorators (next lesson) are built from closures. So is a function that "remembers" an API key or a model name.'}),
  pr(R`x = "global"
def outer():
    x = "enclosing"
    def inner():
        return x
    return inner()
print(outer())`, 'What does this print?', ['global','enclosing','NameError'], 1, 'inner has no local x, so Python looks in the enclosing function and finds "enclosing".'),
  pr(R`fns = [lambda: i for i in range(3)]
print([f() for f in fns])`, 'What does this print?', ['[0, 1, 2]','[2, 2, 2]','[0, 0, 0]'], 1, 'All three lambdas read i when they are called. By then the loop has finished and i is 2. Fix it with lambda i=i: i.'),
  lab('Game: Scope detective', `<p>Answer each one before the scanner reveals it. Every answer comes with the reason.</p>`, 'game_16'),
  task('Write a closure that builds a prompt prefixer.', R`def make_prefixer(prefix):
    def add(text):
        return f"{prefix}: {text}"
    return add

as_system = make_prefixer("SYSTEM")
print(as_system("Be concise."))   # SYSTEM: Be concise.`)
 ],
 sum:[['LEGB','Local, Enclosing, Global, Built-in'],['UnboundLocalError','Read before local assignment'],['closure','Inner function that keeps outer variables'],['nonlocal','Change an enclosing variable'],['global','Change a module variable (use rarely)']]};

L[17] = {t:'Decorators', d:'How @tool registers your function.', mins:14, core:true,
 goals:['Understand that @deco means fn = deco(fn)','Write your own decorator with *args, **kwargs','Use functools.wraps and decorators with arguments'],
 steps:[
  lab('Story: Wrapping a tool', `<p>Press <b>Next</b> to play each scene and watch what the code does inside Python. Drag the room to look around.</p>`, 'story_17'),
  rd('@ is a shortcut', `<p>A decorator is a function that takes a function and returns a function. The <code>@</code> line is only a short way to write a reassignment.</p>`, R`@log_calls
def get_weather(city): ...

# is exactly the same as
def get_weather(city): ...
get_weather = log_calls(get_weather)`),
  rd('Write one', `<p>The inner <code>wrapper</code> is a closure. It runs extra code before and after it calls the original function.</p>`, R`from functools import wraps

def log_calls(fn):
    @wraps(fn)                  # keep fn's name and docstring
    def wrapper(*args, **kwargs):
        print("calling", fn.__name__, args)
        result = fn(*args, **kwargs)
        print("done")
        return result
    return wrapper

@log_calls
def get_weather(city):
    return f"Sunny in {city}"

print(get_weather("Pune"))`, R`calling get_weather ('Pune',)
done
Sunny in Pune`),
  lab('Stack decorators', `<p>Turn decorators on and off, then call the function. The top decorator is the outer layer, so it runs first and finishes last.</p>`, 'decorator'),
  rd('The @tool decorator in agent code', `<p>A registration decorator does not even need a wrapper. It saves the function in a dict and returns it unchanged.</p>`, R`TOOLS = {}

def tool(fn):
    TOOLS[fn.__name__] = fn
    return fn

@tool
def search_docs(query: str) -> list[str]:
    return []

print(list(TOOLS))`, R`['search_docs']`, {ai:'LangChain, the OpenAI Agents SDK and FastAPI routes all use decorators like this.'}),
  pr(R`def shout(fn):
    def w(*a):
        return fn(*a).upper()
    return w

@shout
def hi(name):
    return f"hi {name}"
print(hi.__name__)`, 'What does this print?', ['hi','w','shout'], 1, 'Without functools.wraps, the decorated name is the wrapper\'s name. That is why wraps is important.'),
  lab('Game: Decorator tracer', `<p>Answer each one before the scanner reveals it. Every answer comes with the reason.</p>`, 'game_17'),
  task('Write a decorator with an argument: @retry(times=3).', R`from functools import wraps

def retry(times):
    def deco(fn):
        @wraps(fn)
        def wrapper(*args, **kwargs):
            for attempt in range(1, times + 1):
                try:
                    return fn(*args, **kwargs)
                except Exception as e:
                    print("attempt", attempt, "failed:", e)
            raise RuntimeError("all retries failed")
        return wrapper
    return deco`)
 ],
 sum:[['@deco','fn = deco(fn)'],['wrapper(*args, **kwargs)','Accepts any call'],['functools.wraps','Keeps name and docstring'],['deco(arg)','A function that returns a decorator'],['stacking','Top decorator is the outermost layer']]};

L[18] = {t:'Docstrings', d:'The LLM reads your docstring to choose a tool.', mins:8,
 goals:['Write a docstring and read it with help() and __doc__','Write tool docstrings that an LLM can use well'],
 steps:[
  lab('Story: What the model reads', `<p>Press <b>Next</b> to play each scene and watch what the code does inside Python. Drag the room to look around.</p>`, 'story_18'),
  rd('A docstring is the first string in a function', `<p>Put a string in triple quotes as the first line of a function. Python stores it in <code>fn.__doc__</code>.</p>`, R`def get_weather(city: str) -> str:
    """Get the current weather for a city.

    Args:
        city: City name, for example "Hyderabad".
    """
    return "Sunny"

print(get_weather.__doc__.splitlines()[0])`, R`Get the current weather for a city.`),
  lab('Docstring to tool schema', `<p>Agent frameworks read your function name, type hints and docstring. They turn them into a JSON schema for the LLM. Edit the docstring and see the schema change.</p>`, 'schema'),
  rd('Write tool docstrings for the LLM', `<p>The LLM chooses tools only from their names and descriptions. A good tool docstring says <b>when</b> to use the tool, what each argument means, and what comes back.</p>`, null, null, {table:[['Weak','Strong'],['"Weather tool."','"Get current weather for one city. Use when the user asks about weather now. Returns a short text summary."'],['"q: query"','"query: a short search phrase, 2 to 6 words"']]}),
  pr(R`def f():
    x = 1
    """Not a docstring"""
print(f.__doc__)`, 'What does this print?', ['Not a docstring','None','An error'], 1, 'A docstring must be the first statement in the function body.'),
  lab('Game: Docstring check', `<p>Answer each one before the scanner reveals it. Every answer comes with the reason.</p>`, 'game_18'),
  task('Write a tool with a docstring a model can act on. Then print it with help().', R`def search_docs(query: str, top_k: int = 3) -> list[str]:
    """Search the company handbook.

    Use this when the user asks about HR, leave or policies.

    Args:
        query: A short search phrase, 2 to 6 words.
        top_k: How many passages to return (1 to 10).
    """
    return []

help(search_docs)`)
 ],
 sum:[['docstring','First string in a function, class or module'],['__doc__ / help()','Read a docstring'],['tool description','Built from your docstring by frameworks'],['good docstring','When to use, args, return value']]};

L[19] = {t:'Iterators, generators and yield', d:'How token streaming works.', mins:12, core:true,
 goals:['Understand iter() and next()','Write a generator with yield','Know why generators save memory'],
 steps:[
  lab('Story: Streaming tokens', `<p>Press <b>Next</b> to play each scene and watch what the code does inside Python. Drag the room to look around.</p>`, 'story_19'),
  rd('An iterator gives one item at a time', `<p>A <code>for</code> loop calls <code>iter()</code> on the list, then <code>next()</code> again and again. When the items run out, Python raises <code>StopIteration</code> and the loop ends.</p>`, R`it = iter(["a", "b"])
print(next(it))
print(next(it))
print(next(it))`, R`a
b
StopIteration`),
  rd('A generator is a function with yield', `<p><code>yield</code> gives one value and <b>pauses</b> the function. The next <code>next()</code> call continues from that exact point.</p>`, R`def stream_tokens(text):
    for word in text.split():
        yield word + " "

for tok in stream_tokens("RAG grounds answers"):
    print(tok, end="")`, R`RAG grounds answers `),
  lab('Stream tokens with next()', `<p>Press <b>next(gen)</b>. The arrow shows where the generator is paused. This is how a chat UI shows words one by one.</p>`, 'gen'),
  rd('Generator expressions', `<p>Use round brackets instead of square brackets to get a generator. It makes items only when you ask for them, so a million items do not fill your memory.</p>`, R`import sys
big_list = [n * n for n in range(1_000_000)]
big_gen = (n * n for n in range(1_000_000))
print(sys.getsizeof(big_list), sys.getsizeof(big_gen))`, R`8448728 200`, {note:'The exact byte counts change between Python versions. The list is millions of bytes. The generator is about 200 bytes.'}),
  pr(R`def g():
    yield 1
    yield 2
x = g()
print(type(x).__name__)`, 'What does this print?', ['int','generator','function'], 1, 'Calling a generator function does not run its body. It returns a generator object.'),
  pr(R`gen = (c for c in "ab")
print(list(gen), list(gen))`, 'What does this print?', ["['a', 'b'] ['a', 'b']","['a', 'b'] []","An error"], 1, 'A generator can be used only once.'),
  lab('Game: Generator lab', `<p>Answer each one before the scanner reveals it. Every answer comes with the reason.</p>`, 'game_19'),
  task('Write a generator that reads a big file line by line and yields only non-empty lines.', R`def read_chunks(path):
    with open(path, encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if line:
                yield line

# for chunk in read_chunks("handbook.txt"):
#     embed(chunk)`)
 ],
 sum:[['iterator','Gives items with next()'],['StopIteration','No more items'],['yield','Give a value and pause'],['generator','Lazy, one-pass sequence'],['( ... for ...)','Generator expression']]};
/* ================= PART III ================= */
L[20] = {t:'Classes, objects, __init__ and self', d:'Agents, memory stores and clients are classes.', mins:14, core:true,
 goals:['Define a class and create objects from it','Understand what __init__ and self do','Give objects their own methods'],
 steps:[
  lab('Story: The agent factory', `<p>Press <b>Next</b> to play each scene and watch what the code does inside Python. Drag the room to look around.</p>`, 'story_20'),
  rd('A class is a blueprint; an object is a thing built from it', `<p>The class <code>Agent</code> describes what every agent has and does. Each call to <code>Agent(...)</code> builds a new object with its own data.</p>`, R`class Agent:
    def __init__(self, name, model):
        self.name = name
        self.model = model

    def run(self, question):
        return f"{self.name} ({self.model}) answers: {question}"

a = Agent("Tutor", "gpt-4o-mini")
print(a.run("What is RAG?"))`, R`Tutor (gpt-4o-mini) answers: What is RAG?`),
  rd('__init__ and self', `<p><code>__init__</code> runs automatically when you create an object. It sets the starting data.</p><p><code>self</code> is the object itself. Python passes it for you: <code>a.run("hi")</code> becomes <code>Agent.run(a, "hi")</code>.</p>`),
  lab('Build objects from the blueprint', `<p>Create a few agents. Then call <code>run()</code> on one. See which object <code>self</code> refers to.</p>`, 'klass'),
  pr(R`class C:
    def __init__(self, x):
        self.x = x
a = C(1)
b = C(2)
a.x = 10
print(b.x)`, 'What does this print?', ['1','2','10'], 1, 'Each object has its own x. Changing a.x does not touch b.'),
  pr(R`class Bot:
    def hi():
        return "hi"
print(Bot().hi())`, 'What happens?', ['hi','TypeError','None'], 1, 'Python passes the object as the first argument, but hi has no self parameter. TypeError: takes 0 positional arguments but 1 was given.'),
  lab('Game: Object builder', `<p>Answer each one before the scanner reveals it. Every answer comes with the reason.</p>`, 'game_20'),
  task('Write a ChatSession class that stores its own history.', R`class ChatSession:
    def __init__(self, system_prompt):
        self.history = [{"role": "system", "content": system_prompt}]

    def add_user(self, text):
        self.history.append({"role": "user", "content": text})

s = ChatSession("Be brief.")
s.add_user("Hi")
print(len(s.history))   # 2`)
 ],
 sum:[['class','Blueprint'],['object / instance','One thing built from a class'],['__init__','Sets starting data'],['self','The current object'],['method','A function defined in a class']]};

L[21] = {t:'Instance vs class attributes', d:'Data per object vs data shared by all.', mins:10, core:true,
 goals:['Tell instance attributes from class attributes','Avoid the shared mutable class attribute bug'],
 steps:[
  lab('Story: Shared or personal?', `<p>Press <b>Next</b> to play each scene and watch what the code does inside Python. Drag the room to look around.</p>`, 'story_21'),
  rd('Two places to store data', `<p>An <b>instance attribute</b> is set on <code>self</code>, usually in <code>__init__</code>. Each object has its own. A <b>class attribute</b> is written in the class body. All objects share it.</p>`, R`class Agent:
    provider = "openai"            # class attribute: shared

    def __init__(self, name):
        self.name = name           # instance attribute: own

a, b = Agent("A"), Agent("B")
print(a.provider, b.provider, a.name, b.name)`, R`openai openai A B`),
  lab('The shared list bug', `<p>Toggle between a class-level list and a per-object list. Add a tool to <code>a1</code> only. Look at <code>a2</code>.</p>`, 'classattr'),
  rd('Assigning creates an instance attribute', `<p><code>a.provider = "anthropic"</code> does not change the class. It creates a new attribute on <code>a</code> only, which hides the class value for <code>a</code>.</p><p>But <code>a.tools.append(...)</code> changes the shared list in place. No new attribute is created.</p>`),
  pr(R`class A:
    n = 0
x, y = A(), A()
x.n = 5
print(A.n, y.n)`, 'What does this print?', ['5 5','0 0','0 5'], 1, 'x.n = 5 creates an instance attribute on x only. A.n and y.n are still 0.'),
  lab('Game: Attribute lookup', `<p>Answer each one before the scanner reveals it. Every answer comes with the reason.</p>`, 'game_21'),
  task('Use a class attribute for a shared constant and instance attributes for state.', R`class Agent:
    MAX_STEPS = 5                  # same for all agents

    def __init__(self, model):
        self.model = model
        self.history = []          # each agent has its own list`)
 ],
 sum:[['instance attribute','self.x: one per object'],['class attribute','In the class body: shared'],['shared list bug','Mutable class attribute changed in place'],['rule','Mutable state goes in __init__']]};

L[22] = {t:'Instance, class and static methods', d:'Alternative constructors like Agent.from_env().', mins:10,
 goals:['Know what each method type receives','Write an alternative constructor with @classmethod','Use @staticmethod for helpers'],
 steps:[
  lab('Story: Three kinds of methods', `<p>Press <b>Next</b> to play each scene and watch what the code does inside Python. Drag the room to look around.</p>`, 'story_22'),
  rd('Three kinds of method', `<p>The difference is what Python passes as the first argument.</p>`, null, null, {table:[['Kind','First parameter','Use it for'],['instance method','self (the object)','work with this object\'s data'],['@classmethod','cls (the class)','alternative constructors'],['@staticmethod','nothing','helpers that belong with the class']]}),
  rd('@classmethod: build an object another way', `<p>A class method gets the class as <code>cls</code>. It can call <code>cls(...)</code> to build an object from a config file or from environment variables.</p>`, R`import os

class Agent:
    def __init__(self, model, api_key):
        self.model = model
        self.api_key = api_key

    @classmethod
    def from_env(cls):
        return cls(os.getenv("MODEL", "gpt-4o-mini"), os.getenv("API_KEY", ""))

    @staticmethod
    def count_words(text):
        return len(text.split())

agent = Agent.from_env()
print(agent.model, Agent.count_words("hello there"))`, R`gpt-4o-mini 2`),
  pr(R`class A:
    @staticmethod
    def f(x):
        return x * 2
print(A().f(3))`, 'What does this print?', ['6','TypeError','None'], 0, 'A static method gets no automatic first argument, so x is 3 when called from an object or the class.'),
  pr(R`class A:
    @classmethod
    def who(cls):
        return cls.__name__
class B(A): pass
print(B.who())`, 'What does this print?', ['A','B','cls'], 1, 'cls is the class you called the method on. Here that is B. This is why class methods work well with inheritance.'),
  lab('Game: Method sorter', `<p>Answer each one before the scanner reveals it. Every answer comes with the reason.</p>`, 'game_22'),
  task('Add a from_dict class method to a Message class.', R`class Message:
    def __init__(self, role, content):
        self.role = role
        self.content = content

    @classmethod
    def from_dict(cls, d):
        return cls(d["role"], d["content"])

m = Message.from_dict({"role": "user", "content": "Hi"})
print(m.role, m.content)`)
 ],
 sum:[['self','The object: instance methods'],['cls','The class: @classmethod'],['@staticmethod','No automatic argument'],['from_env / from_dict','Typical class-method constructors']]};

L[23] = {t:'Encapsulation: _private and __mangled', d:'Read SDK code and know what not to touch.', mins:6,
 goals:['Read the underscore conventions','Know what name mangling does'],
 steps:[
  lab('Story: Inside an SDK client', `<p>Press <b>Next</b> to play each scene and watch what the code does inside Python. Drag the room to look around.</p>`, 'story_23'),
  rd('Three naming levels', `<p>Python has no real private attributes. It uses names to show intent.</p>`, null, null, {table:[['Name','Meaning'],['name','Public. Use it freely.'],['_name','Internal. Please do not use it from outside. Python does not stop you.'],['__name','Name mangling. Python renames it to _ClassName__name to avoid clashes in subclasses.']]}),
  rd('In practice', `<p>SDKs keep internals like <code>self._client</code> with one underscore. When you read their source code, the underscore tells you: this can change in any release, so do not depend on it.</p>`, R`class LLMClient:
    def __init__(self, key):
        self._client = "http-session"   # internal
        self.__key = key                # mangled

c = LLMClient("sk-123")
print(c._client)
print(c._LLMClient__key)`, R`http-session
sk-123`),
  pr(R`class A:
    def __init__(self):
        self.__x = 1
print(A().__x)`, 'What happens?', ['1','AttributeError','None'], 1, 'The attribute was renamed to _A__x, so __x is not found outside the class.'),
  lab('Game: Underscore check', `<p>Answer each one before the scanner reveals it. Every answer comes with the reason.</p>`, 'game_23'),
  task('Write a class with a public method and an internal helper.', R`class Retriever:
    def search(self, query):
        return self._rank(["d1", "d2"], query)

    def _rank(self, docs, query):      # internal helper
        return sorted(docs)`)
 ],
 sum:[['name','Public'],['_name','Internal by convention'],['__name','Mangled to _Class__name'],['rule','Do not depend on another library\'s _names']]};

L[24] = {t:'The @property decorator', d:'Computed values and validation that look like attributes.', mins:8,
 goals:['Use @property for a computed value','Add a setter that validates'],
 steps:[
  lab('Story: Smart attributes', `<p>Press <b>Next</b> to play each scene and watch what the code does inside Python. Drag the room to look around.</p>`, 'story_24'),
  rd('A method that you read like an attribute', `<p><code>@property</code> lets you write <code>agent.message_count</code> without brackets. Python calls the method for you.</p>`, R`class Agent:
    def __init__(self):
        self.history = []

    @property
    def message_count(self):
        return len(self.history)

a = Agent()
a.history.append({"role": "user", "content": "hi"})
print(a.message_count)`, R`1`),
  rd('Validate with a setter', `<p>Add a <code>@name.setter</code> to check a value every time someone assigns it.</p>`, R`class Config:
    def __init__(self, temperature=0.2):
        self.temperature = temperature      # goes through the setter

    @property
    def temperature(self):
        return self._temperature

    @temperature.setter
    def temperature(self, value):
        if not 0 <= value <= 2:
            raise ValueError("temperature must be between 0 and 2")
        self._temperature = value

c = Config()
c.temperature = 5`, R`ValueError: temperature must be between 0 and 2`, {ai:'Pydantic (lesson 31) does this kind of validation for you, with less code.'}),
  pr(R`class A:
    @property
    def x(self):
        return 42
a = A()
print(a.x())`, 'What happens?', ['42','TypeError','None'], 1, 'a.x already returns 42. Then 42() fails: TypeError: \'int\' object is not callable.'),
  lab('Game: Property tester', `<p>Answer each one before the scanner reveals it. Every answer comes with the reason.</p>`, 'game_24'),
  task('Add a read-only property total_tokens to a usage class.', R`class Usage:
    def __init__(self, prompt, completion):
        self.prompt = prompt
        self.completion = completion

    @property
    def total_tokens(self):
        return self.prompt + self.completion

print(Usage(42, 18).total_tokens)   # 60`)
 ],
 sum:[['@property','Read a method like an attribute'],['@x.setter','Run code when x is assigned'],['_x','Where the real value is stored'],['read-only','A property with no setter']]};

L[25] = {t:'Dunder methods', d:'Make your objects work with print, len, == and ().', mins:14,
 goals:['Know what __repr__, __str__, __eq__, __len__, __call__ and __iter__ do','See which Python syntax calls which method'],
 steps:[
  lab('Story: Teaching objects Python', `<p>Press <b>Next</b> to play each scene and watch what the code does inside Python. Drag the room to look around.</p>`, 'story_25'),
  rd('Python syntax calls dunder methods', `<p>"Dunder" means double underscore. When you write <code>len(x)</code>, Python calls <code>x.__len__()</code>. When you write <code>x()</code>, it calls <code>x.__call__()</code>.</p>`),
  lab('Which method runs?', `<p>Click a line of normal Python. See which dunder method Python calls on the agent object, and what it returns.</p>`, 'dunder'),
  rd('__repr__ vs __str__', `<p><code>__repr__</code> is for developers. It should look like code and appears in logs and the REPL. <code>__str__</code> is for users and is used by <code>print()</code>. If you only write one, write <code>__repr__</code>.</p>`, R`class Agent:
    def __init__(self, model):
        self.model = model
    def __repr__(self):
        return f"Agent(model={self.model!r})"

print([Agent("gpt-4o")])`, R`[Agent(model='gpt-4o')]`),
  pr(R`class A:
    def __len__(self):
        return 0
print(bool(A()))`, 'What does this print?', ['True','False','An error'], 1, 'With no __bool__, Python uses __len__. A length of 0 is falsy.'),
  lab('Game: Dunder detective', `<p>Answer each one before the scanner reveals it. Every answer comes with the reason.</p>`, 'game_25'),
  task('Make a ToolRegistry that supports len(), "in" and calling by name.', R`class ToolRegistry:
    def __init__(self):
        self._tools = {}
    def add(self, fn):
        self._tools[fn.__name__] = fn
        return fn
    def __len__(self):
        return len(self._tools)
    def __contains__(self, name):
        return name in self._tools
    def __call__(self, name, **args):
        return self._tools[name](**args)

reg = ToolRegistry()
@reg.add
def ping(): return "pong"
print(len(reg), "ping" in reg, reg("ping"))`)
 ],
 sum:[['__repr__','Developer text (logs)'],['__str__','User text (print)'],['__eq__','=='],['__len__','len()'],['__call__','obj()'],['__iter__','for x in obj']]};

L[26] = {t:'Composition vs inheritance', d:'"Has a" usually beats "is a".', mins:10,
 goals:['Tell is-a from has-a relationships','Choose composition for agents'],
 steps:[
  lab('Story: Building an agent from parts', `<p>Press <b>Next</b> to play each scene and watch what the code does inside Python. Drag the room to look around.</p>`, 'story_26'),
  rd('Inheritance: is-a', `<p>A subclass gets all methods of its parent and can change some. Use it when B really <b>is a</b> kind of A.</p>`, R`class BaseTool:
    def run(self, **args):
        raise NotImplementedError

class WeatherTool(BaseTool):           # a WeatherTool IS a tool
    def run(self, city):
        return f"Sunny in {city}"`),
  rd('Composition: has-a', `<p>An object holds other objects and uses them. A RAG agent <b>has an</b> LLM client and <b>has a</b> retriever. You can swap either part.</p>`, R`class RAGAgent:
    def __init__(self, llm, retriever):
        self.llm = llm                 # has an LLM
        self.retriever = retriever     # has a retriever

    def ask(self, q):
        docs = self.retriever.search(q)
        return self.llm.complete(q, docs)`, null, {ai:'Production agents mostly use composition. To test, pass in a fake LLM. To change provider, pass in a different client.'}),
  pr(null, 'A ChatBot needs an OpenAI client, a vector store and a logger. Which design is best?', ['class ChatBot(OpenAI, VectorStore, Logger)','class ChatBot with self.llm, self.store, self.log','Copy the code of all three into ChatBot'], 1, 'A chatbot is not a vector store. It has one. Composition keeps the parts separate and swappable.'),
  lab('Game: Is a or has a?', `<p>Answer each one before the scanner reveals it. Every answer comes with the reason.</p>`, 'game_26'),
  task('Write a fake LLM and pass it into an agent for a test.', R`class FakeLLM:
    def complete(self, q, docs):
        return f"fake answer to {q} using {len(docs)} docs"

class FakeRetriever:
    def search(self, q):
        return ["d1", "d2"]

agent = RAGAgent(FakeLLM(), FakeRetriever())
print(agent.ask("What is RAG?"))`)
 ],
 sum:[['inheritance','is-a; class B(A)'],['super()','Call the parent version'],['composition','has-a; objects inside objects'],['rule','Prefer composition for agents']]};

L[27] = {t:'Abstract base classes and Protocols', d:'Swap OpenAI, Anthropic or Ollama behind one interface.', mins:12,
 goals:['Force subclasses to implement methods with abc','Describe a shape with a Protocol','Choose between the two'],
 steps:[
  lab('Story: One interface, many models', `<p>Press <b>Next</b> to play each scene and watch what the code does inside Python. Drag the room to look around.</p>`, 'story_27'),
  rd('An ABC is a contract you must inherit', `<p>An abstract base class lists methods that every subclass must write. Python refuses to create an object of a class that is missing one.</p>`, R`from abc import ABC, abstractmethod

class LLM(ABC):
    @abstractmethod
    def complete(self, prompt: str) -> str: ...

class Broken(LLM):
    pass

Broken()`, R`TypeError: Can't instantiate abstract class Broken without an implementation for abstract method 'complete'`),
  rd('A Protocol is a shape you only need to match', `<p>A <code>Protocol</code> does not need inheritance. Any class with the right methods matches. This is "duck typing" that type checkers can verify.</p>`, R`from typing import Protocol

class Embedder(Protocol):
    def embed(self, text: str) -> list[float]: ...

class LocalEmbedder:                    # no inheritance
    def embed(self, text: str) -> list[float]:
        return [0.1, 0.2]

def index(e: Embedder, docs):
    return [e.embed(d) for d in docs]

print(index(LocalEmbedder(), ["a"]))`, R`[[0.1, 0.2]]`),
  rd('Which one?', `<p>Use an <b>ABC</b> when you own the base class and want a hard error at creation time. Use a <b>Protocol</b> when you want to accept classes from other libraries without changing them.</p>`),
  pr(null, 'You want your agent to accept any object with a .complete(prompt) method, including a third-party client you cannot edit. Which tool fits?', ['An ABC','A Protocol','A dataclass'], 1, 'A Protocol matches by shape, so the third-party class does not need to inherit from anything.'),
  lab('Game: Interface check', `<p>Answer each one before the scanner reveals it. Every answer comes with the reason.</p>`, 'game_27'),
  task('Write two LLM classes that both match one Protocol, and swap them.', R`from typing import Protocol

class ChatModel(Protocol):
    def complete(self, prompt: str) -> str: ...

class OpenAIModel:
    def complete(self, prompt): return "openai: " + prompt

class OllamaModel:
    def complete(self, prompt): return "ollama: " + prompt

def answer(model: ChatModel, q: str) -> str:
    return model.complete(q)

print(answer(OpenAIModel(), "hi"), answer(OllamaModel(), "hi"))`)
 ],
 sum:[['ABC','Base class with required methods'],['@abstractmethod','Must be implemented'],['Protocol','Structural interface; no inheritance'],['duck typing','If it has the method, it works']]};

/* ================= PART IV ================= */
L[28] = {t:'Type hints', d:'Frameworks read your hints to build tool schemas.', mins:12, core:true,
 goals:['Read and write the common hints','Know that hints do not stop wrong values at run time'],
 steps:[
  lab('Story: Labels on the slots', `<p>Press <b>Next</b> to play each scene and watch what the code does inside Python. Drag the room to look around.</p>`, 'story_28'),
  rd('Hints describe what a value should be', `<p>A type hint tells readers, editors and frameworks what a value should be. Python itself does not check it when the code runs.</p>`, R`from typing import Any, Callable, Literal

def call_llm(
    messages: list[dict[str, Any]],
    model: str = "gpt-4o-mini",
    temperature: float = 0.0,
    tool_choice: str | None = None,
    role: Literal["user", "system"] = "user",
) -> str:
    ...`),
  rd('The hints you will see most', ``, null, null, {table:[['Hint','Means'],['list[str]','a list of strings'],['dict[str, Any]','string keys, any values (JSON)'],['str | None','a string or None (same as Optional[str])'],['Literal["a", "b"]','only these exact values'],['Callable[[str], str]','a function that takes a str and returns a str'],['TypedDict','a dict with fixed keys and types']]}),
  rd('Hints do not stop bad values', `<p>This runs with no error. A tool like mypy, pyright or your editor would warn you. Pydantic (lesson 31) is what checks values at run time.</p>`, R`def double(n: int) -> int:
    return n * 2

print(double("ab"))`, R`abab`, {ai:'The OpenAI Agents SDK, LangChain and FastAPI all read your hints to create the JSON schema that the LLM or the client sees.'}),
  pr(null, 'Which hint means "a list of chat messages, where each message is a dict with string keys"?', ['list[str]','dict[str, list]','list[dict[str, Any]]'], 2, 'The outer type is a list. Each item is a dict with str keys and any values.'),
  lab('Game: Hint reader', `<p>Answer each one before the scanner reveals it. Every answer comes with the reason.</p>`, 'game_28'),
  task('Add full type hints to a retrieval function.', R`def top_k(results: list[dict[str, float | str]], k: int = 3) -> list[str]:
    ranked = sorted(results, key=lambda r: r["score"], reverse=True)
    return [str(r["text"]) for r in ranked[:k]]`)
 ],
 sum:[['list[str]','List of strings'],['X | None','Optional value'],['Literal','Fixed allowed values'],['Callable','A function type'],['runtime','Hints are not checked']]};

L[29] = {t:'Dataclasses and field(default_factory=...)', d:'Clean state classes without the mutable-default bug.', mins:10, core:true,
 goals:['Write a @dataclass','Use field(default_factory=list) for mutable defaults'],
 steps:[
  lab('Story: The message factory', `<p>Press <b>Next</b> to play each scene and watch what the code does inside Python. Drag the room to look around.</p>`, 'story_29'),
  rd('@dataclass writes __init__ for you', `<p>List the fields with type hints. The decorator creates <code>__init__</code>, <code>__repr__</code> and <code>__eq__</code>.</p>`, R`from dataclasses import dataclass

@dataclass
class Message:
    role: str
    content: str

m = Message("user", "Hi")
print(m)`, R`Message(role='user', content='Hi')`),
  rd('Mutable defaults need default_factory', `<p>A dataclass refuses <code>history: list = []</code>, because that one list would be shared. <code>field(default_factory=list)</code> means: call <code>list()</code> to make a <b>new</b> list for every object.</p>`, R`from dataclasses import dataclass, field
from typing import Any

@dataclass
class Agent:
    model: str
    history: list[dict[str, Any]] = field(default_factory=list)

a, b = Agent("gpt"), Agent("gpt")
a.history.append({"role": "user", "content": "hi"})
print(len(a.history), len(b.history))`, R`1 0`),
  pr(R`from dataclasses import dataclass
@dataclass
class A:
    tags: list = []`, 'What happens?', ['It works','ValueError: mutable default','Every object shares tags'], 1, 'Dataclasses protect you: ValueError: mutable default <class \'list\'> for field tags is not allowed: use default_factory.'),
  lab('Game: Dataclass check', `<p>Answer each one before the scanner reveals it. Every answer comes with the reason.</p>`, 'game_29'),
  task('Write the AgentState dataclass from the agent loop.', R`from dataclasses import dataclass, field

@dataclass
class AgentState:
    model: str
    max_steps: int = 5
    steps: int = 0
    history: list[dict] = field(default_factory=list)`)
 ],
 sum:[['@dataclass','Auto __init__, __repr__, __eq__'],['field(default_factory=list)','New list per object'],['frozen=True','Make objects immutable']]};

L[30] = {t:'Enums for agent states and roles', d:'No more typo bugs in "runing".', mins:7,
 goals:['Define an Enum','Use str enums that compare with plain strings'],
 steps:[
  lab('Story: Named states', `<p>Press <b>Next</b> to play each scene and watch what the code does inside Python. Drag the room to look around.</p>`, 'story_30'),
  rd('An Enum is a fixed set of named values', `<p>Strings allow typos. An Enum gives you a fixed list. A typo becomes an error you see at once.</p>`, R`from enum import Enum

class Status(str, Enum):
    PENDING = "pending"
    RUNNING = "running"
    DONE = "done"

s = Status.RUNNING
print(s.value, s == "running")
print(Status("done"))`, R`running True
Status.DONE`),
  rd('Roles in chat messages', `<p>Inheriting from <code>str</code> means the Enum value works anywhere a string is expected, such as in a JSON payload.</p>`, R`class Role(str, Enum):
    SYSTEM = "system"
    USER = "user"
    ASSISTANT = "assistant"
    TOOL = "tool"

msg = {"role": Role.USER.value, "content": "Hi"}`),
  pr(R`from enum import Enum
class S(Enum):
    A = "a"
print(S("b"))`, 'What happens?', ['S.B','None','ValueError'], 2, '"b" is not a valid value of S, so Python raises ValueError. This catches bad data early.'),
  lab('Game: Enum check', `<p>Answer each one before the scanner reveals it. Every answer comes with the reason.</p>`, 'game_30'),
  task('Use an Enum to drive an agent state machine.', R`from enum import Enum

class Step(str, Enum):
    THINK = "think"
    ACT = "act"
    ANSWER = "answer"

state = Step.THINK
if state is Step.THINK:
    state = Step.ACT
print(state.value)`)
 ],
 sum:[['Enum','Fixed named values'],['str, Enum','Values also work as strings'],['.value','The raw value'],['Status("done")','Look up by value']]};

L[31] = {t:'Pydantic', d:'Validate LLM output and tool arguments.', mins:15, core:true,
 goals:['Define a BaseModel and validate data with it','Add rules with Field','Convert with model_dump() and get a JSON schema'],
 steps:[
  lab('Story: The validation gate', `<p>Press <b>Next</b> to play each scene and watch what the code does inside Python. Drag the room to look around.</p>`, 'story_31'),
  rd('BaseModel describes and checks data', `<p>A Pydantic model looks like a dataclass. The difference: it <b>checks</b> the data at run time and converts it where it safely can.</p>`, R`from pydantic import BaseModel

class WeatherArgs(BaseModel):
    city: str
    days: int = 1

args = WeatherArgs(city="Pune", days="3")
print(args.days, type(args.days))`, R`3 <class 'int'>`),
  lab('Validate tool arguments', `<p>Edit the JSON that an LLM sent. Press <b>Validate</b>. See the clean object or the errors that Pydantic reports.</p>`, 'pydantic'),
  rd('model_dump and JSON schema', `<p><code>model_dump()</code> turns the object back into a dict. <code>model_json_schema()</code> describes the model as JSON Schema, which is exactly what tool calling and structured output need.</p>`, R`print(args.model_dump())
print(WeatherArgs.model_json_schema()["required"])`, R`{'city': 'Pune', 'days': 3}
['city']`, {ai:'FastAPI uses the same models for request and response bodies. Learn Pydantic once and you use it everywhere.'}),
  pr(R`from pydantic import BaseModel
class A(BaseModel):
    n: int
A(n="ten")`, 'What happens?', ['n is "ten"','n is 10','ValidationError'], 2, '"ten" cannot be converted to an int, so Pydantic raises a ValidationError that names the field and the problem.'),
  lab('Game: Validation gate', `<p>Answer each one before the scanner reveals it. Every answer comes with the reason.</p>`, 'game_31'),
  task('Validate structured output from an LLM and handle failure.', R`from pydantic import BaseModel, Field, ValidationError

class Answer(BaseModel):
    summary: str
    confidence: float = Field(ge=0, le=1)

raw = '{"summary": "RAG adds context", "confidence": 1.4}'
try:
    a = Answer.model_validate_json(raw)
except ValidationError as e:
    print(e.errors()[0]["msg"])`)
 ],
 sum:[['BaseModel','Typed, validated data class'],['Field(ge=, le=)','Extra rules'],['ValidationError','Data does not match'],['model_dump()','Object to dict'],['model_json_schema()','Schema for the LLM']]};
/* ================= PART V ================= */
L[32] = {t:'Exceptions: try, except, else, finally', d:'When a tool fails, tell the LLM and keep going.', mins:14, core:true,
 goals:['Catch errors with try / except','Know when else and finally run','raise errors and write custom exception classes'],
 steps:[
  rd('An exception stops the program, unless you catch it', `<p>Code inside <code>try</code> runs normally. If an error happens, Python jumps to the matching <code>except</code> block. The program does not crash.</p>`, R`try:
    n = int("abc")
except ValueError as e:
    print("Bad number:", e)`, R`Bad number: invalid literal for int() with base 10: 'abc'`),
  lab('Follow the path', `<p>Choose what the tool does. Press <b>Run</b>. See which blocks run, and in which order.</p>`, 'exc'),
  rd('raise and custom exceptions', `<p>Use <code>raise</code> to signal a problem yourself. A custom exception class makes the error easy to catch by name.</p>`, R`class ToolError(Exception):
    """A tool failed in a way the LLM should know about."""

def get_weather(city):
    if not city:
        raise ToolError("city is required")
    return f"Sunny in {city}"

try:
    get_weather("")
except ToolError as e:
    result = f"Tool error: {e}"    # send this back to the LLM
print(result)`, R`Tool error: city is required`, {ai:'In the agent loop, a failed tool does not crash the agent. The error text goes back to the LLM, and the LLM can try again with better arguments.'}),
  pr(R`try:
    x = 1
except Exception:
    print("A")
else:
    print("B")
finally:
    print("C")`, 'What does this print?', ['A C','B C','C'], 1, 'No error, so except is skipped, else runs, and finally always runs.'),
  pr(R`try:
    {}["k"]
except ValueError:
    print("value")
finally:
    print("cleanup")`, 'What happens?', ['value, then cleanup','cleanup, then KeyError crashes the program','Nothing'], 1, 'KeyError is not a ValueError, so it is not caught. finally still runs before the error goes up.'),
  task('Wrap a tool call the way an agent does.', R`def safe_call(fn, **args):
    try:
        return fn(**args)
    except TypeError as e:
        return f"Tool error: bad arguments ({e})"
    except Exception as e:
        return f"Tool error: {e}"

print(safe_call(get_weather, city="Pune"))
print(safe_call(get_weather, town="Pune"))`)
 ],
 sum:[['try / except','Catch an error'],['else','Runs only if no error'],['finally','Always runs (cleanup)'],['raise','Signal an error'],['custom exception','class MyError(Exception)']]};

L[33] = {t:'Retry with backoff and tenacity', d:'Survive 429 and 503 errors.', mins:10, core:true,
 goals:['Write retry with exponential backoff by hand','Use tenacity for the same thing in one decorator'],
 steps:[
  rd('Why retry?', `<p>LLM APIs fail often for short times: <code>429 Too Many Requests</code>, <code>503 Overloaded</code>, timeouts. The fix is to wait and try again. Each wait is longer than the last: 1s, 2s, 4s. This is <b>exponential backoff</b>.</p>`),
  lab('Watch backoff happen', `<p>Set how often the API fails. Press <b>Run request</b>. The page runs the attempts at 10x speed.</p>`, 'retry'),
  rd('Write it once by hand', `<p>Writing it yourself once makes the library easy to understand.</p>`, R`import random, time

def call_with_retry(fn, max_attempts=4, base=1.0):
    for attempt in range(max_attempts):
        try:
            return fn()
        except ConnectionError:
            if attempt == max_attempts - 1:
                raise
            wait = base * 2 ** attempt + random.uniform(0, 0.5)   # jitter
            print(f"retry in {wait:.1f}s")
            time.sleep(wait)`),
  rd('Then use tenacity', `<p>The same idea in one decorator.</p>`, R`from tenacity import retry, stop_after_attempt, wait_exponential

@retry(stop=stop_after_attempt(4), wait=wait_exponential(multiplier=1, max=10))
def call_llm(prompt):
    ...`, null, {note:'Retry only errors that can pass: 429, 5xx, timeouts. Do not retry 400 or 401. The same bad request fails every time.'}),
  pr(R`base = 1
print([base * 2 ** a for a in range(4)])`, 'What does this print?', ['[1, 2, 3, 4]','[1, 2, 4, 8]','[2, 4, 6, 8]'], 1, '2 ** 0 is 1, then 2, 4, 8.'),
  task('Add jitter and a maximum wait to your hand-written retry.', R`wait = min(10, base * 2 ** attempt) + random.uniform(0, 0.5)`)
 ],
 sum:[['backoff','Wait longer after each failure'],['jitter','A small random extra wait'],['429 / 503','Retry these'],['400 / 401','Do not retry these'],['tenacity','@retry(stop=..., wait=...)']]};

L[34] = {t:'JSON and malformed LLM output', d:'Parse tool arguments safely.', mins:10, core:true,
 goals:['Use json.loads and json.dumps','Clean up common LLM JSON mistakes','Fall back safely when JSON is broken'],
 steps:[
  rd('loads and dumps', `<p><code>json.loads</code> turns a JSON <b>s</b>tring into Python objects. <code>json.dumps</code> turns Python objects into a JSON string. Remember: the <b>s</b> means string.</p>`, R`import json
raw = '{"city": "Pune", "days": 2}'
args = json.loads(raw)
print(args["city"])
print(json.dumps({"ok": True, "items": None}))`, R`Pune
{"ok": true, "items": null}`),
  rd('Tool arguments arrive as a string', `<p>The LLM sends tool arguments as JSON text. Your agent must parse it before it can call <code>tool(**args)</code>.</p>`, R`args = json.loads(reply["tool_call"]["arguments"])`),
  lab('Repair LLM output', `<p>Pick a real kind of broken output. Press <b>Parse</b> and watch each repair step.</p>`, 'jsonfix'),
  pr(R`import json
print(json.loads("{'a': 1}"))`, 'What happens?', ["{'a': 1}","JSONDecodeError","{'a': '1'}"], 1, 'JSON requires double quotes. Single quotes are Python syntax, not JSON.'),
  task('Write a parse_llm_json function with a fence fallback.', R`import json, re

def parse_llm_json(text):
    try:
        return json.loads(text)
    except json.JSONDecodeError:
        m = re.search(r"\{.*\}", text, re.S)     # first { to last }
        if m:
            return json.loads(m.group(0))
        raise`)
 ],
 sum:[['json.loads','JSON string to Python'],['json.dumps','Python to JSON string'],['JSONDecodeError','Invalid JSON'],['true / null','JSON spelling of True / None']]};

L[35] = {t:'Files with pathlib: text, CSV, JSON', d:'Load prompts and knowledge bases.', mins:9,
 goals:['Build paths with pathlib','Read and write text, JSON and CSV'],
 steps:[
  rd('Path objects', `<p><code>Path</code> joins folders with <code>/</code> and works the same on Windows, macOS and Linux.</p>`, R`from pathlib import Path

root = Path("data")
prompt_file = root / "prompts" / "system.txt"
print(prompt_file.name, prompt_file.suffix, prompt_file.exists())`, R`system.txt .txt False`),
  rd('Text and JSON', ``, R`import json
from pathlib import Path

p = Path("notes.txt")
p.write_text("RAG notes", encoding="utf-8")
print(p.read_text(encoding="utf-8"))

cfg = Path("config.json")
cfg.write_text(json.dumps({"model": "gpt-4o-mini"}, indent=2))
print(json.loads(cfg.read_text())["model"])`, R`RAG notes
gpt-4o-mini`),
  rd('CSV with DictReader', `<p>Each row becomes a dict. Values are always strings, so convert numbers yourself.</p>`, R`import csv
with open("evals.csv", newline="", encoding="utf-8") as f:
    for row in csv.DictReader(f):
        print(row["question"], float(row["score"]))`),
  pr(R`from pathlib import Path
print(Path("docs") / "a.md")`, 'What does this print on Linux?', ['docs/a.md','docsa.md','TypeError'], 0, 'The / operator joins path parts with the correct separator.'),
  task('Load every .md file in a folder into a list of documents.', R`from pathlib import Path

docs = []
for path in Path("knowledge").glob("*.md"):
    docs.append({"source": path.name, "text": path.read_text(encoding="utf-8")})
print(len(docs))`)
 ],
 sum:[['Path / "x"','Join paths'],['read_text / write_text','Text files'],['json.loads(p.read_text())','JSON files'],['csv.DictReader','Rows as dicts'],['glob("*.md")','Find files']]};

L[36] = {t:'Environment variables and python-dotenv', d:'Never hardcode an API key.', mins:7,
 goals:['Read settings from os.environ','Load a .env file with python-dotenv','Keep keys out of Git'],
 steps:[
  rd('Read from the environment', `<p><code>os.environ["KEY"]</code> fails if the key is missing. <code>os.getenv("KEY", default)</code> returns a default.</p>`, R`import os
key = os.getenv("OPENAI_API_KEY")
if key is None:
    raise RuntimeError("Set OPENAI_API_KEY first")`),
  rd('.env files', `<p>Put local secrets in a file called <code>.env</code>. Load it once at start-up. Add <code>.env</code> to <code>.gitignore</code> so it never goes to GitHub.</p>`, R`# .env
OPENAI_API_KEY=sk-...
MODEL=gpt-4o-mini

# app.py
from dotenv import load_dotenv
import os
load_dotenv()
print(os.getenv("MODEL"))`, R`gpt-4o-mini`, {note:'Every environment variable is a string. Convert numbers and flags yourself (lesson 4).'}),
  pr(R`import os
os.environ["RETRIES"] = "3"
print(os.environ["RETRIES"] + 1)`, 'What happens?', ['4','31','TypeError'], 2, 'The value is the string "3". Use int(os.environ["RETRIES"]) + 1.'),
  task('Make a small settings loader with safe defaults.', R`import os
from dotenv import load_dotenv

load_dotenv()
SETTINGS = {
    "model": os.getenv("MODEL", "gpt-4o-mini"),
    "max_retries": int(os.getenv("MAX_RETRIES", "3")),
    "debug": os.getenv("DEBUG", "false").lower() == "true",
}
print(SETTINGS)`)
 ],
 sum:[['os.getenv(k, d)','Read with a default'],['os.environ[k]','Read or KeyError'],['load_dotenv()','Load .env into the environment'],['.gitignore','Keep .env out of Git']]};

L[37] = {t:'HTTP with requests and httpx', d:'Call real APIs inside your tools.', mins:12,
 goals:['Make GET and POST requests','Read status codes and decide what to do','Send headers and bearer tokens; know when to use httpx'],
 steps:[
  rd('A request and a response', `<p>Your code sends a <b>method</b> (GET, POST), a <b>URL</b>, <b>headers</b> and sometimes a JSON <b>body</b>. The server returns a <b>status code</b>, headers and a body.</p>`, R`import requests

res = requests.get(
    "https://api.example.com/weather",
    params={"city": "Pune"},
    headers={"Authorization": f"Bearer {key}"},
    timeout=10,
)
res.raise_for_status()      # error for 4xx and 5xx
data = res.json()`, null, {note:'Always set a timeout. Without one, a slow server can freeze your agent forever.'}),
  lab('What should your agent do?', `<p>Click a status code. See what it means and whether your agent should retry.</p>`, 'status'),
  rd('httpx: the same API, plus async', `<p><code>httpx</code> works almost like <code>requests</code>, but it also has an async client. LLM SDKs use it inside.</p>`, R`import httpx, asyncio

async def fetch(city):
    async with httpx.AsyncClient(timeout=10) as client:
        r = await client.get("https://api.example.com/weather", params={"city": city})
        r.raise_for_status()
        return r.json()

# asyncio.run(fetch("Pune"))`),
  pr(null, 'Your tool gets 401 Unauthorized. What should the agent do?', ['Retry with backoff','Stop and report a bad or missing API key','Parse the body as JSON'], 1, 'A retry sends the same wrong key again. Fix the credentials instead.'),
  task('Write a weather tool with a timeout and clear error messages.', R`import requests

def get_weather(city: str) -> str:
    try:
        r = requests.get("https://wttr.in/" + city, params={"format": 3}, timeout=8)
        r.raise_for_status()
        return r.text.strip()
    except requests.Timeout:
        return "Tool error: weather service timed out"
    except requests.HTTPError as e:
        return f"Tool error: HTTP {e.response.status_code}"`)
 ],
 sum:[['GET / POST','Read / send data'],['timeout=','Always set one'],['raise_for_status()','Error on 4xx/5xx'],['.json()','Parse the body'],['httpx.AsyncClient','Async HTTP']]};

L[38] = {t:'Regex and the standard library', d:'re, collections, itertools, functools, datetime, uuid.', mins:15,
 goals:['Extract text from LLM output with re','Use defaultdict, Counter and deque','Know what itertools, functools, datetime and uuid give you'],
 steps:[
  rd('re: find patterns in text', `<p>A regular expression describes a text pattern. <code>re.search</code> finds the first match. <code>re.findall</code> finds all. <code>re.sub</code> replaces.</p>`, R`import re
text = "<think>plan...</think>The answer is 42."
clean = re.sub(r"<think>.*?</think>", "", text, flags=re.S)
print(clean)
print(re.findall(r"\d+", "top 3 of 10 docs"))`, R`The answer is 42.
['3', '10']`),
  lab('Regex tester', `<p>Pick a preset or write your own pattern. Matches are marked in the text.</p>`, 'regex', {note:'This tester runs in your browser, which uses JavaScript regex. For these patterns it matches Python\'s re module.'}),
  rd('collections', `<p>Three containers save a lot of code in agents.</p>`, R`from collections import defaultdict, Counter, deque

by_source = defaultdict(list)          # no KeyError
by_source["handbook"].append("chunk 1")

words = Counter("rag rag agent".split())
print(words.most_common(1))

memory = deque(maxlen=3)               # sliding window
for m in ["m1", "m2", "m3", "m4"]:
    memory.append(m)
print(list(memory))`, R`[('rag', 2)]
['m2', 'm3', 'm4']`),
  rd('itertools, functools, datetime, uuid', ``, R`from itertools import islice, chain
from functools import lru_cache
from datetime import datetime, timezone
import uuid

print(list(islice(range(100), 3)))          # [0, 1, 2]
print(list(chain([1], [2, 3])))             # [1, 2, 3]

@lru_cache(maxsize=256)
def embed(text): ...                         # cache repeated calls

print(datetime.now(timezone.utc).isoformat()[:10])
print(str(uuid.uuid4())[:8])                # trace id`),
  pr(R`from collections import deque
d = deque([1, 2, 3], maxlen=3)
d.append(4)
print(list(d))`, 'What does this print?', ['[1, 2, 3, 4]','[2, 3, 4]','[1, 2, 3]'], 1, 'A deque with maxlen drops the oldest item when you add a new one.'),
  task('Extract a fenced JSON block from model text.', R`import re, json
text = 'Sure!\n` + '```json\\n{"city": "Pune"}\\n```' + R`'
m = re.search(r"` + '```json\\s*(.*?)\\s*```' + R`", text, re.S)
args = json.loads(m.group(1))
print(args["city"])`)
 ],
 sum:[['re.search / findall / sub','Find, find all, replace'],['re.S','. also matches newlines'],['defaultdict','Dict with automatic defaults'],['Counter','Count items'],['deque(maxlen=n)','Sliding window memory'],['lru_cache','Cache function results'],['uuid4()','Unique id']]};

/* ============ Agent x-ray ============ */
const AGENT = [
  ['import asyncio, json', 38, 'stdlib modules'],
  ['from dataclasses import dataclass, field', 29, 'dataclasses'],
  ['from typing import Any, Callable', 28, 'type hints'],
  ['from pydantic import BaseModel', 31, 'Pydantic'],
  ['', 0, ''],
  ['TOOLS: dict[str, Callable] = {}', 14, 'functions stored in a dict'],
  ['', 0, ''],
  ['def tool(fn):', 17, 'a registration decorator'],
  ['    TOOLS[fn.__name__] = fn', 14, 'register by name'],
  ['    return fn', 17, ''],
  ['', 0, ''],
  ['class WeatherArgs(BaseModel):', 31, 'schema for the LLM'],
  ['    city: str', 28, ''],
  ['', 0, ''],
  ['@tool', 17, 'decorator in use'],
  ['async def get_weather(city: str) -> str:', 28, 'typed tool'],
  ['    return f"Sunny in {city}"', 6, 'f-string'],
  ['', 0, ''],
  ['@dataclass', 29, ''],
  ['class Agent:', 20, 'a class'],
  ['    model: str', 28, ''],
  ['    history: list[dict[str, Any]] = field(default_factory=list)', 29, 'no shared-list bug'],
  ['', 0, ''],
  ['    async def run(self, user_msg: str) -> str:', 20, 'method with self'],
  ['        self.history.append({"role": "user", "content": user_msg})', 9, 'list of dicts'],
  ['        for _ in range(5):', 7, 'max-steps guard'],
  ['            reply = await call_llm(self.model, self.history)', 37, 'the LLM HTTP call'],
  ['            if reply.get("tool_call"):', 5, 'truthy check'],
  ['                name = reply["tool_call"]["name"]', 9, 'nested access'],
  ['                args = json.loads(reply["tool_call"]["arguments"])', 34, 'parse LLM JSON'],
  ['                try:', 32, 'tools can fail'],
  ['                    result = await TOOLS[name](**args)', 12, '**kwargs unpacking'],
  ['                except Exception as e:', 32, ''],
  ['                    result = f"Tool error: {e}"', 32, 'error goes back to the LLM'],
  ['                self.history.append({"role": "tool", "content": result})', 9, ''],
  ['            else:', 7, ''],
  ['                return reply["content"]', 7, 'final answer, stop'],
  ['        return "Stopped: too many steps"', 7, '']
];

const WEEKS = [
  ['Weeks 1–2','Part I (lessons 1–10) and lessons 11–12. Solve one easy DSA problem every day.', 1],
  ['Week 3','Rest of Part II: tool registries, scope, decorators, generators.', 14],
  ['Week 4','Part III: classes, attributes, methods, dunders, protocols.', 20],
  ['Week 5','Part IV: type hints, dataclasses, enums and a lot of Pydantic.', 28],
  ['Week 6','Part V: exceptions, retry, JSON, files, env vars, HTTP. Build a CLI chatbot with retries.', 32],
  ['Weeks 7–8','Phases VI–VII: async, FastAPI, RAG, then write the agent loop by hand.', 0],
  ['Ongoing','Interview concept questions, plus 3 to 4 DSA problems each week.', 0]
];

const INTERVIEW = [
  {h:'Python concept questions', sub:'Explain clearly and write live', items:[['List vs tuple, and why tuples can be dict keys',8],['Mutable default arguments',11],['is vs ==',5],['Shallow vs deep copy',10],['*args and **kwargs',12],['How decorators work; write one live',17],['Generators vs lists (memory)',19],['How a dict works inside (hashing)',8],['@staticmethod vs @classmethod',22],['__repr__ vs __str__',25]]},
  {h:'DSA in Python (60–80 problems)', sub:'Easy to medium patterns for Gen AI roles in India', items:[['Arrays and strings',6],['Hash maps with dict and Counter',38],['Two pointers and sliding window',0],['Stack and queue with deque',38],['Sorting with key=',15],['Recursion; simple BFS and DFS',0]]},
  {h:'Gen AI practical rounds', sub:'Machine-coding tasks you may get', items:[['Call an LLM with retries',33],['Parse and validate LLM JSON',34],['Validate tool args with Pydantic',31],['Design the agent loop',7]]}
];

export { PARTS, NEXT_PARTS, L, AGENT, WEEKS, INTERVIEW };
