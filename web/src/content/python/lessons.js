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
L[1] = {t:'Variables, objects and type()', d:'A variable is a name tag on a value.', mins:25, core:true,
 goals:['Create variables and know what = really does','Understand that the type belongs to the value, not the name','Use type() to check what a value really is'],
 steps:[
  lab('Story: Divya\'s cricket club app', `<p>Press <b>Next</b> to play each scene and watch what the code does inside Python. Drag the room to look around.</p>`, 'story_1'),
  lab('Hands-on: Tag the box', ``, 'play_1'),
  rd('A variable is a name tag on a value', `<p>Karthik supports CSK. In Python he writes <code>team = "CSK"</code>. Python makes the value <code>"CSK"</code> first, then ties the name <code>team</code> to it, like a name tag.</p><p><code>type()</code> tells you what kind of value the tag points to.</p>`, R`team = "CSK"
print(team)
print(type(team))`, R`CSK
<class 'str'>`, {note:'In Python, = does not mean "equals" like in maths. It means "tie this name to this value".'}),
  rd('Dynamic typing: the tag can move', `<p>The same name can point to different kinds of values over time. This is <b>dynamic typing</b>. The type belongs to the value, not to the name.</p>`, R`jersey = 7         # an int
jersey = "Seven"   # now a str
jersey = 7.0       # now a float
print(type(jersey))`, R`<class 'float'>`),
  pr(R`team = "CSK"
team = "RCB"
print(team)`, 'What does this print?', ['CSK','RCB','An error'], 1, 'The second line moves the tag team to the new value "RCB". "CSK" is no longer used by team.'),
  rd('Why the type matters', `<p>Different types can do different things. Text has <code>.upper()</code>. A number does not. This one fails on purpose: a marks value stored as a number cannot be shouted in capitals.</p>`, R`marks = 87
print(type(marks))
print(marks.upper())   # fails on purpose`, R`<class 'int'>
AttributeError: 'int' object has no attribute 'upper'`, {note:'When code fails in a confusing way, print type(value) first. It finds most beginner bugs.'}),
  pr(R`price = 89.5
print(type(price))`, 'A masala dosa costs ₹89.5. What does type(price) return?', ["<class 'int'>","<class 'str'>","<class 'float'>"], 2, 'A number with a decimal point is a float.'),
  rd('Now in an AI agent', `<p>An AI agent works with the same kinds of values. The model name is text, the token limit is a whole number, and the temperature is a decimal. When an agent breaks, checking <code>type()</code> is still the first step.</p>`, R`model = "gpt-4o-mini"
max_tokens = 512
temperature = 0.2
print(type(model), type(max_tokens), type(temperature))`, R`<class 'str'> <class 'int'> <class 'float'>`),
  lab('Game: The type() scanner', `<p>Answer each one before the scanner reveals it. Every answer comes with the reason.</p>`, 'game_1'),
  task('Type this, run it, and name each type before you look at the output.', R`name = "Divya"
city = "Kochi"
cgpa = 8.7
semester = 5
in_hostel = True

print(type(name))
print(type(city))
print(type(cgpa))
print(type(semester))
print(type(in_hostel))`)
 ],
 sum:[['variable','A name tag on a value'],['value (object)','What Python stores, with a type'],['=','Ties a name to a value'],['dynamic typing','A name can point to different types over time'],['type(x)','Tells you the type of the value x points to']]};

L[2] = {t:'Data types: int, float, str, bool, None', d:'The five basic types inside every app, from food orders to AI replies.', mins:25, core:true,
 goals:['Know the five basic types and when each appears','Read a food order and name every type','Understand None as "no value yet"'],
 steps:[
  lab('Story: Unpacking a food order', `<p>Press <b>Next</b> to play each scene and watch what the code does inside Python. Drag the room to look around.</p>`, 'story_2'),
  lab('Hands-on: Sort the order', ``, 'play_2'),
  rd('Five types you will see every day', `<p>Almost every value in an app is one of five basic types. Here they are in a food order, and the same types in an AI agent.</p>`, null, null, {table:[['Type','In a food order','In an AI agent'],['int','qty = 2','max_tokens = 500'],['float','price = 89.5','temperature = 0.2'],['str','dish = "Masala Dosa"','model = "gpt-4o-mini"'],['bool','paid = True','stream = True'],['None','coupon = None','tool_choice = None']]}),
  rd('str and the quote trap', `<p>Anything inside quotes is text, even if it looks like a number. An order form often sends the quantity as <code>"2"</code>. The last line fails on purpose: Python will not add text to a number.</p>`, R`print("2" + "2")   # text is joined
print(2 + 2)       # numbers are added
print("2" + 2)     # fails on purpose`, R`22
4
TypeError: can only concatenate str (not "int") to str`),
  rd('None means "no value"', `<p><code>None</code> means "nothing here yet". No coupon on the order? The coupon is <code>None</code>. Check for it with <code>is None</code>. You will learn why in lesson 5.</p>`, R`coupon = None
if coupon is None:
    print("No coupon applied")`, R`No coupon applied`),
  pr(R`order = {"dish": "Ghee Roast Dosa", "price": 110.0, "paid": False}
print(type(order["paid"]))`, 'What does this print?', ["<class 'str'>","<class 'bool'>","<class 'NoneType'>"], 1, 'False without quotes is a bool. "False" with quotes would be a str.'),
  pr(R`print(type(250 / 5))`, 'Five friends split a ₹250 bill. What type does 250 / 5 give?', ["<class 'int'>","<class 'float'>","<class 'bool'>"], 1, 'The / operator always gives a float, even when the answer is whole. 250 / 5 is 50.0.'),
  rd('Now in an AI agent', `<p>A request to an AI model uses the same five types. Spot each one.</p>`, R`request = {"model": "gpt-4o-mini", "max_tokens": 300, "temperature": 0.2, "stream": True, "tool_choice": None}
for key, value in request.items():
    print(key, type(value).__name__)`, R`model str
max_tokens int
temperature float
stream bool
tool_choice NoneType`),
  lab('Game: Order sorter', `<p>Answer each one before the scanner reveals it. Every answer comes with the reason.</p>`, 'game_2'),
  task('Write a food order with one value of each type. Print the type of each value.', R`order = {
    "dish": "Chicken Biryani",   # str
    "qty": 2,                    # int
    "price": 249.0,              # float
    "paid": True,                # bool
    "coupon": None,              # None
}
for key, value in order.items():
    print(key, type(value))`)
 ],
 sum:[['int','Whole number: qty = 2, -50'],['float','Decimal number: price = 89.5'],['str','Text in quotes: "Masala Dosa"'],['bool','True or False (capital letters)'],['None','No value yet: coupon = None; check with is None']]};

L[3] = {t:'Operators: / vs //, %, **', d:'Split bills, count overs and work out chunk sizes.', mins:20,
 goals:['Know the difference between / and //','Use % for remainders and ** for powers','Combine comparison and logical operators'],
 steps:[
  lab('Story: Splitting the hostel bill', `<p>Press <b>Next</b> to play each scene and watch what the code does inside Python. Drag the room to look around.</p>`, 'story_3'),
  lab('Hands-on: Bill splitter', ``, 'play_3'),
  rd('Two kinds of division', `<p>Four friends share a ₹1,250 hostel dinner. <code>/</code> gives the exact share as a float. <code>//</code> gives whole rupees and drops the rest. <code>%</code> gives what is left over. <code>**</code> is power.</p>`, R`bill = 1250
friends = 4
print(bill / friends)    # exact share
print(bill // friends)   # whole rupees each
print(bill % friends)    # rupees left over
print(2 ** 10)           # power`, R`312.5
312
2
1024`),
  lab('Operator calculator', `<p>Change <code>a</code> and <code>b</code>. Try negative numbers with <code>//</code> and <code>%</code>. Floor division rounds down, so <code>-7 // 2</code> is <code>-4</code>, not <code>-3</code>.</p>`, 'ops'),
  rd('Overs from balls', `<p>A scoreboard shows overs, not balls. One over has 6 balls. <code>//</code> counts full overs and <code>%</code> counts the balls in the current over.</p>`, R`balls = 128
overs = balls // 6
extra = balls % 6
print(f"{overs}.{extra} overs")`, R`21.2 overs`),
  rd('= assigns, == compares', `<p>One equals sign stores a value. Two equals signs ask a question and give True or False.</p>`, R`runs = 180           # store
print(runs == 180)   # compare
print(runs > 200)    # compare`, R`True
False`),
  rd('and, or, not', `<p><code>and</code> needs both sides true. <code>or</code> needs one side true. <code>not</code> flips True and False.</p>`, R`has_ticket = True
is_late = False
can_enter = has_ticket and not is_late
print(can_enter)
print(not has_ticket)`, R`True
False`),
  pr(R`seats = 130
per_row = 12
print(seats // per_row, seats % per_row)`, 'A theatre has 130 seats, 12 in each row. How many full rows, and how many seats are left?', ['10.8 0','10 10','11 0'], 1, '12 fits into 130 ten times (120 seats). 130 - 120 = 10 seats are left for a shorter last row.'),
  pr(R`print(10 > 5 and 3 > 8 or 2 == 2)`, 'What does this print?', ['True','False','An error'], 0, 'and runs before or. (10 > 5 and 3 > 8) is False. False or (2 == 2) is True.'),
  rd('Now in an AI agent', `<p>An AI model reads a long document in chunks. The same maths decides how many chunks you need: <code>//</code> for full chunks, <code>%</code> for the leftover, and a round-up for the number of calls.</p>`, R`total_tokens = 1300
chunk_size = 512
full = total_tokens // chunk_size
left = total_tokens % chunk_size
calls = (total_tokens + chunk_size - 1) // chunk_size
print(full, left, calls)`, R`2 276 3`),
  lab('Game: Operator scanner', `<p>Answer each one before the scanner reveals it. Every answer comes with the reason.</p>`, 'game_3'),
  task('Split an Ooty trip cost among 6 friends in whole rupees, and find what is left over.', R`trip_cost = 7850   # in rupees
friends = 6
each = trip_cost // friends
left_over = trip_cost % friends
print("Each pays", each)        # 1308
print("Left over", left_over)   # 2`)
 ],
 sum:[['/','True division, always a float'],['//','Floor division, whole part only'],['%','Remainder after division'],['**','Power'],['== vs =','Compare vs store'],['and / or / not','Combine or flip conditions']]};

L[4] = {t:'Type conversion: int(), float(), str(), bool()', d:'Turn text from forms and apps into numbers you can use.', mins:22,
 goals:['Convert between str, int, float and bool','Know which conversions fail with ValueError','Handle a failed conversion safely'],
 steps:[
  lab('Story: The college fest form', `<p>Press <b>Next</b> to play each scene and watch what the code does inside Python. Drag the room to look around.</p>`, 'story_4'),
  lab('Hands-on: Conversion pipeline', ``, 'play_4'),
  rd('Why convert?', `<p>Harini is collecting registrations for her college fest in Coimbatore. Everything typed into a form arrives as <b>text</b>, even numbers. The last line fails on purpose: you cannot add a number to text.</p>`, R`team_size = "4"         # typed into the form
print(type(team_size))
print(team_size + 1)    # fails on purpose`, R`<class 'str'>
TypeError: can only concatenate str (not "int") to str`),
  rd('int(), float() and str()', `<p><code>int()</code> turns text into a whole number, <code>float()</code> into a decimal, and <code>str()</code> turns anything back into text.</p>`, R`team_size = int("4")
fee = float("149.50")
print(team_size + 1)
print(fee * team_size)
print("Team of " + str(team_size))`, R`5
598.0
Team of 4`),
  lab('Conversion lab', `<p>Type any text. See what each conversion gives you. Try <code>3.5</code>, <code>abc</code>, an empty box and <code>False</code>.</p>`, 'convert'),
  rd('The bool() surprise', `<p><code>bool()</code> does not read the words. Any text that is not empty is <code>True</code>, so a form answer of <code>"False"</code> becomes <code>True</code>. Compare the text instead.</p>`, R`needs_hostel = "False"
print(bool(needs_hostel))                # True (text is not empty)
print(needs_hostel.lower() == "true")    # False`, R`True
False`),
  rd('Handle bad input safely', `<p>Someone types "four" instead of 4. <code>int("four")</code> raises <code>ValueError</code>. Catch it and use a sensible default.</p>`, R`raw = "four"
try:
    team_size = int(raw)
except ValueError:
    print("Please type a number, like 4")
    team_size = 1
print(team_size)`, R`Please type a number, like 4
1`),
  pr(R`print(int("8.5"))`, 'A CGPA of "8.5" comes from a form. What does int("8.5") do?', ['8','9','ValueError'], 2, 'int() only accepts text that looks like a whole number. Use float("8.5") first, then int() if you need it.'),
  pr(R`print(int(8.99))`, 'What does this print?', ['8','9','8.99'], 0, 'int() on a float cuts off the decimal part. It does not round.'),
  rd('Now in an AI agent', `<p>Settings for an AI agent come from environment variables, which are always text. The same conversions turn them into numbers.</p>`, R`settings = {"MAX_RETRIES": "3", "TEMPERATURE": "0.2"}
retries = int(settings["MAX_RETRIES"])
temperature = float(settings["TEMPERATURE"])
print(retries + 1, temperature)`, R`4 0.2`),
  lab('Game: Conversion scanner', `<p>Answer each one before the scanner reveals it. Every answer comes with the reason.</p>`, 'game_4'),
  task('Read a UPI amount the user typed, safely.', R`text = input("Amount in rupees: ")
try:
    amount = float(text)
except ValueError:
    print("Please type a number, for example 250")
    amount = 0.0
print(type(amount), amount)`)
 ],
 sum:[['int("42")','Text to whole number'],['float("149.5")','Text to decimal'],['str(500)','Anything to text'],['bool(x)','Empty or zero is False; else True'],['ValueError','Text cannot be converted']]};

L[5] = {t:'Truthy, falsy, and is vs ==', d:'How if decides, and how to check None.', mins:22, core:true,
 goals:['Know which values Python treats as False','Write short checks like if coupon:','Know when to use is and when to use =='],
 steps:[
  lab('Story: The if gate', `<p>Press <b>Next</b> to play each scene and watch what the code does inside Python. Drag the room to look around.</p>`, 'story_5'),
  lab('Hands-on: The if gate', ``, 'play_5'),
  rd('Every value is truthy or falsy', `<p>An <code>if</code> does not need True or False. Python asks each value: are you truthy or falsy?</p><p>Falsy values: <code>False</code>, <code>None</code>, <code>0</code>, <code>0.0</code>, <code>""</code>, <code>[]</code>, <code>{}</code>, <code>set()</code>. Everything else is truthy.</p>`, R`cart = []
if not cart:
    print("Your cart is empty")`, R`Your cart is empty`),
  lab('Does the if block run?', `<p>Pick a value. See whether <code>if value:</code> runs its block.</p>`, 'truthy'),
  rd('Short checks with truthy values', `<p>An empty coupon code is falsy, so <code>if coupon:</code> reads like plain English.</p>`, R`coupon = ""
if coupon:
    print("Applying", coupon)
else:
    print("No coupon, full price")`, R`No coupon, full price`),
  rd('== compares values, is compares identity', `<p><code>==</code> asks: do these have the same value? <code>is</code> asks: are these the same object? Two playlists with the same songs are equal, but they are still two separate lists.</p>`, R`mine = ["Kaavaalaa", "Naatu Naatu"]
yours = ["Kaavaalaa", "Naatu Naatu"]
shared = mine
print(mine == yours, mine is yours)
print(mine == shared, mine is shared)`, R`True False
True True`),
  rd('Use is only for None', `<p>There is only one <code>None</code>, so <code>is None</code> is the right check. Watch the trap: 0 runs is a real score, but <code>if not runs</code> treats it like "no score".</p>`, R`runs = 0
if runs is None:
    print("Score not entered yet")
if not runs:
    print("Out for a duck, or not entered?")`, R`Out for a duck, or not entered?`, {note:'if not x treats 0 and "" like None. When 0 is a real value, write if x is None.'}),
  pr(R`seat = None
if seat:
    print("Seat booked")
else:
    print("Pick a seat")`, 'What does this print?', ['Seat booked','Pick a seat','An error'], 1, 'seat is None, and None is falsy. So the else block runs.'),
  pr(R`orders = [0]
print(bool(orders))`, 'What does this print?', ['True','False','0'], 0, 'The list is not empty. It has one item. An item that is 0 does not make the list falsy.'),
  rd('Now in an AI agent', `<p>An AI agent checks whether the model asked for a tool in exactly this way.</p>`, R`reply = {"content": "It is 31 C in Chennai.", "tool_call": None}
if reply["tool_call"] is None:
    print("Final answer:", reply["content"])`, R`Final answer: It is 31 C in Chennai.`),
  lab('Game: Truthy or falsy?', `<p>Answer each one before the scanner reveals it. Every answer comes with the reason.</p>`, 'game_5'),
  task('Print a different message for no search, no results, and some results.', R`def describe(results):
    if results is None:
        return "search did not run"
    if not results:
        return "no restaurants found"
    return f"found {len(results)} restaurants"

print(describe(None))
print(describe([]))
print(describe(["Saravana Bhavan", "Paradise"]))`)
 ],
 sum:[['falsy','False, None, 0, 0.0, "", [], {}, set()'],['truthy','Everything else'],['==','Same value?'],['is','Same object?'],['is None','The correct way to check None']]};

L[6] = {t:'Strings, slicing and f-strings', d:'Cut, clean and fill text, from movie tickets to prompts.', mins:28, core:true,
 goals:['Slice strings with start, stop and step','Use split, join, strip and replace','Build messages with f-strings and multi-line strings'],
 steps:[
  lab('Story: Printing a movie ticket', `<p>Press <b>Next</b> to play each scene and watch what the code does inside Python. Drag the room to look around.</p>`, 'story_6'),
  lab('Hands-on: Slice ruler', ``, 'play_6'),
  rd('A string is a row of characters', `<p>Each character has a position called an index. Indexes start at <code>0</code>. Negative indexes count from the end: <code>-1</code> is the last character.</p>`, R`movie = "Jailer"
print(movie[0], movie[-1], len(movie))`, R`J r 6`),
  lab('Slicing playground', `<p>A slice is <code>s[start:stop:step]</code>. The start is included. The stop is not. Change the numbers, or click a preset.</p>`, 'slice'),
  rd('Hide a phone number with slicing', `<p>Slices make a <b>new</b> string. Show only the first and last digits of a phone number on a ticket.</p>`, R`phone = "9876543210"
masked = phone[:2] + "XXXXXX" + phone[-2:]
print(masked)`, R`98XXXXXX10`),
  rd('split, join, strip, replace', `<p>These four methods do most text cleaning. They return a new string; the original does not change.</p>`, R`raw = "  idli, dosa, vada  "
clean = raw.strip()              # remove outer spaces
items = clean.split(", ")        # ['idli', 'dosa', 'vada']
menu = " | ".join(items)
print(menu.replace("dosa", "masala dosa"))`, R`idli | masala dosa | vada`),
  rd('f-strings fill a template', `<p>Put <code>f</code> before the quotes, then write any variable inside <code>{}</code>. <code>:.2f</code> shows two decimals.</p>`, R`movie = "Leo"
row, seat = "H", 12
price = 190
print(f"{movie} | Seat {row}{seat} | Rs {price:.2f}")`, R`Leo | Seat H12 | Rs 190.00`),
  pr(R`code = "TN09"
print(code[::-1])`, 'What does this print?', ['TN09','90NT','T'], 1, 'A step of -1 walks backwards through the whole string.'),
  pr(R`items = "idli,dosa,,vada".split(",")
print(len(items))`, 'How many items does split give?', ['3','4','5'], 1, 'The empty text between the two commas becomes an empty item: ["idli", "dosa", "", "vada"].'),
  rd('Now in an AI agent', `<p>A prompt for an AI model is just a string. Multi-line f-strings are how agents fill a prompt template.</p>`, R`question = "Which trains go from Chennai to Bengaluru?"
context = "Shatabdi Express and Brindavan Express run daily."
prompt = f"""You are a helpful travel assistant.
Use only the context below.

Context: {context}
Question: {question}"""
print(prompt)`, R`You are a helpful travel assistant.
Use only the context below.

Context: Shatabdi Express and Brindavan Express run daily.
Question: Which trains go from Chennai to Bengaluru?`),
  lab('Game: String slicer', `<p>Answer each one before the scanner reveals it. Every answer comes with the reason.</p>`, 'game_6'),
  task('Clean messy dish names from a menu and print a neat bill line.', R`dishes = ["  Ghee Roast  ", "filter coffee", " PAROTTA"]
clean = [d.strip().title() for d in dishes]
print(" + ".join(clean))
total = 120 + 40 + 60
print(f"Total: Rs {total}")`)
 ],
 sum:[['s[a:b:c]','Slice: start included, stop excluded'],['split / join','Text to list / list to text'],['strip','Remove spaces at both ends'],['replace','Return a copy with text replaced'],['f"{x}"','Fill a template'],['"""..."""','Multi-line string, prompt templates']]};

L[7] = {t:'Control flow: if, for, while, break, continue', d:'Make decisions and repeat steps, ball by ball.', mins:28, core:true,
 goals:['Make decisions with if / elif / else','Loop with for and while, and control them with break and continue','Understand the rare for ... else'],
 steps:[
  lab('Story: The tatkal booking loop', `<p>Press <b>Next</b> to play each scene and watch what the code does inside Python. Drag the room to look around.</p>`, 'story_7'),
  lab('Hands-on: Robot loop', ``, 'play_7'),
  rd('if, elif, else', `<p>Python runs the first block whose condition is true. Indentation (4 spaces) shows which lines belong to the block.</p>`, R`attendance = 72
if attendance >= 85:
    print("Great attendance")
elif attendance >= 75:
    print("Safe for exams")
else:
    print("Short of attendance: below 75%")`, R`Short of attendance: below 75%`),
  rd('for: one over, ball by ball', `<p><code>for</code> repeats once for each item. An over has 6 balls, so <code>range(6)</code> gives 0 to 5.</p>`, R`runs = [1, 4, 0, 6, 2, 1]
total = 0
for ball in range(6):
    total += runs[ball]
print("Runs in the over:", total)`, R`Runs in the over: 14`),
  lab('Step through a loop', `<p>Press <b>Step</b> to run one line at a time. Watch <code>continue</code> skip an item and <code>break</code> stop the loop. Then remove the <code>"stop"</code> item and see the <code>else</code> block run.</p>`, 'loop'),
  rd('while, break and continue', `<p><code>while</code> repeats as long as a condition is true. Booking a tatkal ticket: keep trying, <code>break</code> when it works, and always stop after a few tries.</p>`, R`seats_free = [0, 0, 2]   # free seats on each try
attempt = 0
while attempt < 5:
    if seats_free[attempt] > 0:
        print("Booked on try", attempt + 1)
        break
    print("Try", attempt + 1, "failed, trying again")
    attempt += 1`, R`Try 1 failed, trying again
Try 2 failed, trying again
Booked on try 3`),
  pr(R`for ball in [1, 4, 0, 6]:
    if ball == 0:
        continue
    if ball == 6:
        break
    print(ball)`, 'What does this print?', ['1 4 0','1 4','1 4 6'], 1, 'continue skips the dot ball (0). break stops the loop at the six, before print runs.'),
  pr(R`for player in ["Gill", "Kohli"]:
    if player == "Dhoni":
        break
else:
    print("not in the squad")`, 'What does this print?', ['Nothing','not in the squad','Dhoni'], 1, 'The loop finished without break, so the else block runs. Read for ... else as "for ... if no break".'),
  rd('Now in an AI agent', `<p>An AI agent is a loop: ask the model, run a tool if it asks for one, repeat, and stop when it gives a final answer. This version uses a pretend model so you can run it.</p>`, R`replies = [{"tool": "get_weather"}, {"tool": None, "content": "It is 31 C in Chennai."}]

for step in range(5):                  # guard: at most 5 steps
    reply = replies[step]              # pretend call to the model
    if reply["tool"]:
        print("Running tool:", reply["tool"])
        continue                       # ask the model again
    print("Final answer:", reply["content"])
    break
else:
    print("Stopped: too many steps")`, R`Running tool: get_weather
Final answer: It is 31 C in Chennai.`, {ai:'This is the most important loop in the course. You will write it with a real model at the end.'}),
  lab('Game: Loop tracer', `<p>Answer each one before the scanner reveals it. Every answer comes with the reason.</p>`, 'game_7'),
  task('Search a squad list with for ... else.', R`squad = ["Rohit", "Gill", "Jadeja", "Bumrah"]
target = "Jadeja"
for player in squad:
    if player == target:
        print("Found", player)
        break
else:
    print(target, "is not in the squad")`)
 ],
 sum:[['if / elif / else','Run the first true branch'],['for','Repeat for each item'],['while','Repeat while a condition is true'],['break','Stop the loop now'],['continue','Skip to the next item'],['for ... else','else runs only if no break happened']]};

L[8] = {t:'Collections: list, tuple, dict, set', d:'Playlists, menus and unique viewers: which container to use.', mins:28, core:true,
 goals:['Choose between list, tuple, dict and set','Use the common methods of each','Understand why dict and set lookups are fast'],
 steps:[
  lab('Story: Four kinds of shelves', `<p>Press <b>Next</b> to play each scene and watch what the code does inside Python. Drag the room to look around.</p>`, 'story_8'),
  lab('Hands-on: Container sandbox', ``, 'play_8'),
  rd('Four containers', `<p>Each collection answers a different need.</p>`, null, null, {table:[['Type','Looks like','Ordered','Changeable','Use it for'],['list','["Kaavaalaa", "Hukum"]','yes','yes','a playlist, a queue'],['tuple','(17.38, 78.48)','yes','no','a location, fixed pairs'],['dict','{"Mon": "Idli"}','yes','yes','a menu by day, JSON'],['set','{"arjun", "meera"}','no','yes','unique viewers, fast "in"']]}),
  rd('list and dict', `<p>A list keeps items in order and can grow. A dict maps keys to values, like a hostel mess menu by day.</p>`, R`playlist = ["Kaavaalaa", "Hukum"]
playlist.append("Naatu Naatu")

menu = {"Mon": "Idli", "Tue": "Pongal"}
menu["Wed"] = "Poori"
print(len(playlist), menu["Wed"])
print(menu.get("Sun", "Biryani special"))`, R`3 Poori
Biryani special`, {note:'menu["Sun"] raises KeyError when the key is missing. menu.get("Sun", default) returns the default instead.'}),
  rd('tuple and set', `<p>A tuple cannot change, so it is good for fixed things like a location. A set keeps only unique items: count how many different people watched a reel.</p>`, R`charminar = (17.3616, 78.4747)    # latitude, longitude
viewers = ["arjun", "meera", "arjun", "sai", "meera"]
unique = set(viewers)
print(charminar[0])
print(len(unique), "sai" in unique)`, R`17.3616
3 True`),
  lab('Why sets are fast', `<p>To find an item, a list checks items one by one. A set jumps to the right place. Press <b>Search</b> and move the size slider.</p>`, 'bigo'),
  pr(R`liked = {"arjun", "meera"}
liked.add("arjun")
print(len(liked))`, 'Arjun likes the reel twice. What does this print?', ['2','3','An error'], 0, 'A set keeps only unique items. Adding arjun again does nothing.'),
  pr(R`seat = ["H", 12]
booked = {seat: "Divya"}`, 'What happens?', ['It works','TypeError: unhashable type','KeyError'], 1, 'A list can change, so it cannot be a dict key. Use a tuple: ("H", 12).'),
  rd('Now in an AI agent', `<p>An AI agent keeps chat history as a list of dicts, and skips duplicate documents with a set.</p>`, R`history = []
history.append({"role": "user", "content": "Best biryani in Hyderabad?"})
history.append({"role": "assistant", "content": "Try Paradise or Shah Ghouse."})

seen = set()
for doc in ["d1", "d7", "d1"]:
    seen.add(doc)
print(len(history), len(seen))`, R`2 2`),
  lab('Game: Container picker', `<p>Answer each one before the scanner reveals it. Every answer comes with the reason.</p>`, 'game_8'),
  task('Remove repeated songs from a playlist but keep their order.', R`songs = ["Hukum", "Kaavaalaa", "Hukum", "Arabic Kuthu", "Kaavaalaa"]
seen = set()
playlist = []
for s in songs:
    if s not in seen:      # fast check
        seen.add(s)
        playlist.append(s)
print(playlist)`)
 ],
 sum:[['list','Ordered, changeable sequence'],['tuple','Ordered, fixed; can be a dict key'],['dict','Key to value; JSON shape'],['set','Unique items; fast membership'],['O(1)','Same speed for any size (dict, set lookup)'],['O(n)','Slower as size grows (list search)']]};

L[9] = {t:'Nested structures: orders, scorecards and replies', d:'Lists inside dicts inside lists, and how to reach any value.', mins:25, core:true,
 goals:['Read deep values with chained [ ] access','Loop over a list of dicts','Avoid KeyError and IndexError on real data'],
 steps:[
  lab('Story: Walking a food order', `<p>Press <b>Next</b> to play each scene and watch what the code does inside Python. Drag the room to look around.</p>`, 'story_9'),
  lab('Hands-on: Path finder', ``, 'play_9'),
  rd('A food order is nested data', `<p>A food delivery order is a dict. Inside it, <code>items</code> is a list, and each item is another dict.</p>`, R`order = {
    "restaurant": "Paradise, Secunderabad",
    "items": [
        {"dish": "Chicken Biryani", "qty": 2},
        {"dish": "Double Ka Meetha", "qty": 1},
    ],
}
print(order["items"][1]["dish"])`, R`Double Ka Meetha`),
  rd('Read the access path left to right', `<p>Each <code>[ ]</code> goes one level deeper. <code>order["items"]</code> gives a list. <code>[1]</code> gives a dict from that list. <code>["dish"]</code> gives the text.</p><p>Use a number for a list position. Use a key for a dict.</p>`),
  lab('Click your way into a real response', `<p>This is the shape of a real AI model response. Click any key or value. The page writes the Python path for you. Then try the three challenges.</p>`, 'json'),
  rd('Loop over a scorecard', `<p>Use a loop or a comprehension to pull out the parts you need.</p>`, R`batting = [
    {"name": "Gaikwad", "runs": 72, "balls": 48},
    {"name": "Dube", "runs": 18, "balls": 20},
    {"name": "Dhoni", "runs": 28, "balls": 11},
]
quick = [b["name"] for b in batting if b["runs"] > b["balls"]]
print(quick)`, R`['Gaikwad', 'Dhoni']`),
  pr(R`order = {"items": [{"dish": "Dosa"}]}
print(order["items"]["dish"])`, 'What happens?', ['Dosa','TypeError','KeyError'], 1, 'order["items"] is a list. Pick a position first: order["items"][0]["dish"].'),
  pr(R`item = {"dish": "Idli"}
print(item.get("note", ""))`, 'What does this print?', ['None','An empty line','KeyError'], 1, '.get returns the default "" when the key is missing. print("") prints an empty line.'),
  rd('Now in an AI agent', `<p>A real AI model reply is nested the same way. The answer text sits four levels deep.</p>`, R`resp = {"choices": [{"message": {"role": "assistant", "content": "Paradise is famous for biryani."}}]}
print(resp["choices"][0]["message"]["content"])`, R`Paradise is famous for biryani.`),
  lab('Game: Path finder', `<p>Answer each one before the scanner reveals it. Every answer comes with the reason.</p>`, 'game_9'),
  task('Print each dish and the total number of plates in an order.', R`order = {
    "restaurant": "Murugan Idli Shop",
    "items": [
        {"dish": "Idli", "qty": 4},
        {"dish": "Pongal", "qty": 1},
        {"dish": "Filter Coffee", "qty": 2},
    ],
}
total = 0
for item in order["items"]:
    print(item["dish"], "x", item["qty"])
    total += item["qty"]
print("Plates:", total)`)
 ],
 sum:[['list of dicts','Orders, scorecards, chat history'],['x[0]["key"]','Index for lists, key for dicts'],['.get(k, d)','Safe read with a default'],['KeyError','Dict key is missing'],['IndexError','List position does not exist']]};

L[10] = {t:'Mutable vs immutable, references and copies', d:'Why one friend\'s edit shows up for everyone.', mins:25, core:true,
 goals:['Know which types can change in place','Understand that = copies the reference, not the value','Choose between a shallow and a deep copy'],
 steps:[
  lab('Story: The shared trip list', `<p>Press <b>Next</b> to play each scene and watch what the code does inside Python. Drag the room to look around.</p>`, 'story_10'),
  lab('Hands-on: Copy lab', ``, 'play_10'),
  rd('Mutable and immutable', `<p>A <b>mutable</b> value can change in place: list, dict, set. An <b>immutable</b> value cannot: int, float, str, bool, None, tuple. "Changing" a string makes a new one.</p>`, R`city = "kochi"
loud = city.upper()      # a new string
print(city, loud)

packing = ["charger", "towel"]
packing.append("umbrella")   # same list, changed
print(packing)`, R`kochi KOCHI
['charger', 'towel', 'umbrella']`),
  rd('= copies the reference', `<p>Four friends plan a trip to Munnar. <code>arjun_list = trip</code> does not copy the list. Both names point to the <b>same</b> list, so Arjun's edit shows up for everyone.</p>`, R`trip = ["tickets"]
arjun_list = trip
arjun_list.append("snacks")
print(trip)`, R`['tickets', 'snacks']`),
  lab('Copy lab', `<p>Pick how <code>b</code> is made from <code>a</code>. Then change <code>b</code>. Watch what happens to <code>a</code>. The tags show which values are shared.</p>`, 'copy'),
  rd('Shallow vs deep copy', `<p>A <b>shallow copy</b> makes a new outer list, but the dicts inside are still shared. A <b>deep copy</b> copies everything.</p>`, R`import copy
expenses = [{"item": "cab", "amount": 1200}]
shallow = expenses.copy()
deep = copy.deepcopy(expenses)
shallow[0]["amount"] = 9999
print(expenses[0]["amount"])   # changed: the dict is shared
print(deep[0]["amount"])       # safe`, R`9999
1200`),
  pr(R`a = ["tickets"]
b = a[:]
b.append("snacks")
print(a)`, 'What does this print?', ["['tickets']","['tickets', 'snacks']",'An error'], 0, 'a[:] makes a new list (a shallow copy). Changing b does not change a.'),
  pr(R`trip = ("Munnar", ["tea"])
trip[1].append("spices")
print(trip)`, 'What happens?', ['TypeError: tuple is immutable',"('Munnar', ['tea', 'spices'])","('Munnar', ['tea'])"], 1, 'The tuple cannot change which values it holds. But the list inside it can change.'),
  rd('Now in an AI agent', `<p>If two users of a chat app share one history list, one user sees the other's messages. Give each session its own copy.</p>`, R`import copy
template = [{"role": "system", "content": "You are a travel helper."}]
divya = copy.deepcopy(template)
karthik = copy.deepcopy(template)
divya.append({"role": "user", "content": "Trains to Kochi?"})
print(len(divya), len(karthik))`, R`2 1`),
  lab('Game: Reference tracer', `<p>Answer each one before the scanner reveals it. Every answer comes with the reason.</p>`, 'game_10'),
  task('Prove the shallow copy trap to yourself with is.', R`import copy
a = [{"item": "cab"}]
b = a.copy()
c = copy.deepcopy(a)
print(a is b, a[0] is b[0])   # False True
print(a is c, a[0] is c[0])   # False False`)
 ],
 sum:[['mutable','list, dict, set: change in place'],['immutable','int, str, tuple, ...: never change'],['b = a','Same value, two names'],['.copy() / [:]','Shallow: new outer, shared inner'],['copy.deepcopy','New values all the way down']]};
/* ================= PART II ================= */
L[11] = {t:'Functions, return values and defaults', d:'Write a block once, use it everywhere. Every agent tool is a function.', mins:25, core:true,
 goals:['Define functions with parameters and return values','Know the difference between return and print','Avoid the mutable default argument trap'],
 steps:[
  lab('Story: The bill split machine', `<p>Press <b>Next</b> to play each scene and watch what the code does inside Python. Drag the room to look around.</p>`, 'story_11'),
  rd('A function is a named, reusable block', `<p>Vignesh splits bills with his friends every weekend in Chennai. Instead of doing the maths each time, he writes a function. <code>def</code> creates it. Parameters are the names in the brackets; arguments are the values you pass in.</p>`, R`def split_bill(total, people, tip=0):
    return round((total + tip) / people, 2)

print(split_bill(1250, 4))
print(split_bill(1780, 5, tip=70))`, R`312.5
370.0`),
  rd('return gives a value back; print only shows it', `<p><code>print</code> writes to the screen and gives back nothing. <code>return</code> hands a value back, so other code can use it. A function without <code>return</code> returns <code>None</code>.</p>`, R`def show_share(total, people):
    print(total / people)

def get_share(total, people):
    return total / people

a = show_share(600, 3)   # prints 200.0
b = get_share(600, 3)
print(a, b)`, R`200.0
None 200.0`),
  rd('Default arguments', `<p>A default value is used when the caller does not pass that argument. Put parameters with defaults after the ones without.</p>`, R`def auto_fare(km, night=False):
    fare = 30 + 15 * km
    return fare * 1.5 if night else fare

print(auto_fare(4))
print(auto_fare(4, night=True))`, R`90
135.0`),
  lab('The mutable default trap', `<p>Python creates a default value <b>once</b>, when it defines the function. A default list is then shared by every call. Call both versions a few times.</p>`, 'default'),
  pr(R`def add_item(item, cart=[]):
    cart.append(item)
    return cart

add_item("Idli")
print(add_item("Vada"))`, 'What does this print?', ["['Vada']","['Idli', 'Vada']","An error"], 1, 'The same default list is reused. The first call left "Idli" in it, so the next customer sees it.'),
  pr(R`def greet(name):
    message = f"Hi {name}"
print(greet("Meera"))`, 'What does this print?', ['Hi Meera','None','An error'], 1, 'The function has no return statement, so it returns None.'),
  rd('Now in an AI agent', `<p>An AI agent's tools are plain functions. The model asks for a tool, the agent calls the function, and the <b>returned</b> value goes back to the model. A tool that only prints sends the model nothing.</p>`, R`def get_weather(city, units="C"):
    return f"31 {units} and humid in {city}"

result = get_weather("Chennai")
print(result)`, R`31 C and humid in Chennai`),
  lab('Game: Call tracer', `<p>Answer each one before the scanner reveals it. Every answer comes with the reason.</p>`, 'game_11'),
  task('Write the safe version of add_item, so each customer gets their own cart.', R`def add_item(item, cart=None):
    if cart is None:
        cart = []          # a new cart for every call
    cart.append(item)
    return cart

print(add_item("Idli"))   # ['Idli']
print(add_item("Vada"))   # ['Vada']`)
 ],
 sum:[['def','Create a function'],['parameter / argument','The name / the value passed in'],['return','Give a value back (default None)'],['default','Value used when the caller does not pass one'],['cart=None','The safe pattern for mutable defaults']]};

L[12] = {t:'*args, **kwargs and unpacking', d:'Take any number of items, and pass a dict straight into a function.', mins:25, core:true,
 goals:['Accept any number of arguments with *args and **kwargs','Unpack lists with * and dicts with **','Understand the line result = TOOLS[name](**args)'],
 steps:[
  lab('Story: The canteen order', `<p>Press <b>Next</b> to play each scene and watch what the code does inside Python. Drag the room to look around.</p>`, 'story_12'),
  rd('*args collects extra positional arguments', `<p>Lakshmi orders at the college canteen. She might order one item or five. A star before a parameter collects all of them into a <b>tuple</b>.</p>`, R`def order(*items):
    print(items)
    return len(items)

print(order("Dosa", "Vada", "Tea"))`, R`('Dosa', 'Vada', 'Tea')
3`),
  rd('**kwargs collects extra keyword arguments', `<p>Two stars collect extra named arguments into a <b>dict</b>, like the details on a train ticket form.</p>`, R`def book_ticket(name, **details):
    print(name, details)

book_ticket("Venkat", train="Shatabdi", berth="Window", age=21)`, R`Venkat {'train': 'Shatabdi', 'berth': 'Window', 'age': 21}`),
  rd('The same stars also unpack', `<p>In a function <b>call</b>, <code>*</code> spreads a list into positions and <code>**</code> spreads a dict into named arguments.</p>`, R`def fare(source, dest, seats):
    return f"{seats} seats from {source} to {dest}"

trip_list = ["Chennai", "Bengaluru", 2]
trip_dict = {"source": "Kochi", "dest": "Mysuru", "seats": 3}
print(fare(*trip_list))
print(fare(**trip_dict))`, R`2 seats from Chennai to Bengaluru
3 seats from Kochi to Mysuru`),
  lab('From LLM JSON to a function call', `<p>An AI model sends tool arguments as JSON text. Step through how one line of agent code turns it into a real function call. Then add an extra key the function does not accept.</p>`, 'unpack'),
  pr(R`def total(a, b, c):
    return a + b + c
bills = [120, 80, 50]
print(total(*bills))`, 'What does this print?', ['[120, 80, 50]','250','TypeError'], 1, '*bills unpacks into total(120, 80, 50).'),
  pr(R`def f(**kw):
    return type(kw).__name__
print(f(city="Madurai"))`, 'What does this print?', ['tuple','dict','kwargs'], 1, '**kw always collects named arguments into a dict.'),
  rd('Now in an AI agent', `<p>The model sends a tool name and a dict of arguments. One line with <code>**</code> runs any tool.</p>`, R`def get_weather(city, days=1):
    return f"{days}-day forecast for {city}: rain likely"

call = {"name": "get_weather", "args": {"city": "Kochi", "days": 3}}
print(get_weather(**call["args"]))`, R`3-day forecast for Kochi: rain likely`),
  lab('Game: Unpacking scanner', `<p>Answer each one before the scanner reveals it. Every answer comes with the reason.</p>`, 'game_12'),
  task('Write a wrapper that logs every order and passes it on.', R`def place_order(dish, qty=1, spicy=False):
    return f"{qty} x {dish}{' (spicy)' if spicy else ''}"

def logged(*args, **kwargs):
    print("args:", args, "kwargs:", kwargs)
    return place_order(*args, **kwargs)

print(logged("Chicken 65", qty=2, spicy=True))`)
 ],
 sum:[['*args','Collect extra positional arguments (tuple)'],['**kwargs','Collect extra named arguments (dict)'],['f(*lst)','Unpack a list into positions'],['f(**d)','Unpack a dict into named arguments'],['tool(**args)','How agents call tools from model JSON']]};

L[13] = {t:'Positional-only and keyword-only parameters', d:'Force clear calls with / and *, so nobody mixes up the amount and the UPI ID.', mins:15,
 goals:['Read / and * in a function signature','Know which calls are valid','See why SDKs use keyword-only options'],
 steps:[
  lab('Story: The UPI pay function', `<p>Press <b>Next</b> to play each scene and watch what the code does inside Python. Drag the room to look around.</p>`, 'story_13'),
  rd('Two ways to pass an argument', `<p>By <b>position</b>: <code>pay(250, "arjun@upi")</code>. By <b>keyword</b>: <code>pay(amount=250, upi_id="arjun@upi")</code>. Normally both work. Two symbols in the signature can restrict this.</p>`),
  rd('/ and * in a signature', `<p>Everything <b>before</b> <code>/</code> is positional-only. Everything <b>after</b> <code>*</code> is keyword-only. Parameters between them accept both.</p>`, R`def pay(amount, /, note="", *, upi_id):
    return f"Paid Rs {amount} to {upi_id} {note}".strip()

print(pay(250, "dinner", upi_id="arjun@upi"))`, R`Paid Rs 250 to arjun@upi dinner`, {table:[['Parameter','Position','Keyword'],['amount','yes','no'],['note','yes','yes'],['upi_id','no','yes']]}),
  lab('Valid call or TypeError?', `<p>Click each call. Decide first, then check.</p>`, 'sig'),
  rd('Why keyword-only helps', `<p>Compare <code>pay(250, "arjun@upi", True)</code> with <code>pay(250, upi_id="arjun@upi", save=True)</code>. The second is easy to read and hard to get wrong. Payment apps and AI SDKs make options keyword-only for this reason.</p>`),
  pr(R`def pay(amount, *, upi_id):
    return amount
print(pay(250, "arjun@upi"))`, 'What happens?', ['250','TypeError','None'], 1, 'upi_id is keyword-only. You must write pay(250, upi_id="arjun@upi").'),
  rd('Now in an AI agent', `<p>AI SDKs use the same rule: the prompt goes first, and options like <code>temperature</code> must be named.</p>`, R`def ask_model(prompt, /, *, model="gpt-4o-mini", temperature=0.0):
    return f"{model} at {temperature}: {prompt}"

print(ask_model("Best time to visit Ooty?", temperature=0.3))`, R`gpt-4o-mini at 0.3: Best time to visit Ooty?`),
  lab('Game: Signature judge', `<p>Answer each one before the scanner reveals it. Every answer comes with the reason.</p>`, 'game_13'),
  task('Write a recharge function with one positional-only and two keyword-only parameters.', R`def recharge(number, /, *, plan=299, data_gb=2):
    return f"Recharged {number[-4:]} with Rs {plan} plan, {data_gb} GB/day"

print(recharge("9876543210", plan=349))
# recharge(number="98...")      -> TypeError
# recharge("98...", 349)        -> TypeError`)
 ],
 sum:[['/','Parameters before it: position only'],['*','Parameters after it: keyword only'],['TypeError','Raised when a call breaks the rules'],['keyword-only options','Clear, safe calls']]};

L[14] = {t:'Functions as objects and tool registries', d:'Store functions in a dict and call them by name.', mins:25, core:true,
 goals:['Store a function in a variable and in a dict','Pass a function into another function','Build the tool registry that every agent uses'],
 steps:[
  lab('Story: The payment counter', `<p>Press <b>Next</b> to play each scene and watch what the code does inside Python. Drag the room to look around.</p>`, 'story_14'),
  rd('A function is a value', `<p>Without brackets, <code>pay_upi</code> is the function itself. With brackets, <code>pay_upi(250)</code> calls it. You can give a function another name.</p>`, R`def pay_upi(amount):
    return f"Paid Rs {amount} by UPI"

f = pay_upi            # no () -> no call
print(f(250))
print(f.__name__)`, R`Paid Rs 250 by UPI
pay_upi`),
  rd('Store functions in a dict', `<p>A food app supports many payment methods. A dict maps each method name to the function that handles it.</p>`, R`def pay_upi(amount):
    return f"Paid Rs {amount} by UPI"

def pay_card(amount):
    return f"Paid Rs {amount} by card"

def pay_cash(amount):
    return f"Pay Rs {amount} cash on delivery"

PAYMENTS = {"upi": pay_upi, "card": pay_card, "cash": pay_cash}
choice = "card"
print(PAYMENTS[choice](349))`, R`Paid Rs 349 by card`),
  lab('Dispatch a tool call', `<p>Pick what the AI model asked for. The agent looks the name up in <code>TOOLS</code> and calls it. Try the tool that does not exist.</p>`, 'registry'),
  rd('Pass a function to another function', `<p>Because functions are values, you can pass them in. <code>sorted(key=...)</code> works like this.</p>`, R`def apply_twice(fn, value):
    return fn(fn(value))

print(apply_twice(str.upper, "csk"))
print(sorted(["Kochi", "Ooty", "Goa"], key=len))`, R`CSK
['Goa', 'Ooty', 'Kochi']`),
  pr(R`def hi():
    return "hi"
x = hi
print(type(x).__name__)`, 'What does this print?', ['str','function','NoneType'], 1, 'x = hi stores the function. It does not call it.'),
  pr(R`PAYMENTS = {"upi": len}
print(PAYMENTS.get("crypto", lambda *_: "not supported")(100))`, 'What does this print?', ['3','not supported','KeyError'], 1, '"crypto" is missing, so .get returns the fallback function, and that function is then called.'),
  rd('Now in an AI agent', `<p>An AI agent's <b>tool registry</b> is exactly this dict. The model sends a tool name as text; the agent looks it up and calls it.</p>`, R`def get_weather(city):
    return f"31 C in {city}"

def get_train(source, dest):
    return f"Shatabdi from {source} to {dest} at 6:00"

TOOLS = {"get_weather": get_weather, "get_train": get_train}
call = {"name": "get_train", "args": {"source": "Chennai", "dest": "Mysuru"}}
print(TOOLS[call["name"]](**call["args"]))`, R`Shatabdi from Chennai to Mysuru at 6:00`),
  lab('Game: Registry runner', `<p>Answer each one before the scanner reveals it. Every answer comes with the reason.</p>`, 'game_14'),
  task('Build a safe dispatcher that returns an error for an unknown tool.', R`def get_weather(city):
    return f"Sunny in {city}"

TOOLS = {"get_weather": get_weather}

def run_tool(name, args):
    fn = TOOLS.get(name)
    if fn is None:
        return f"Error: unknown tool {name!r}"
    return fn(**args)

print(run_tool("get_weather", {"city": "Chennai"}))
print(run_tool("book_flight", {}))`)
 ],
 sum:[['fn vs fn()','The function vs a call'],['dict of functions','Name to function'],['.get(name)','Safe lookup for unknown names'],['higher-order function','Takes or returns a function']]};

L[15] = {t:'lambda, map() and filter()', d:'Small inline functions for sorting and filtering.', mins:22,
 goals:['Write a lambda','Transform with map and keep items with filter','Know when a comprehension is clearer'],
 steps:[
  lab('Story: Ranking the IPL batters', `<p>Press <b>Next</b> to play each scene and watch what the code does inside Python. Drag the room to look around.</p>`, 'story_15'),
  rd('lambda is a one-line function', `<p><code>lambda x: x * 2</code> is the same as a small <code>def</code>. It has no name. Use it for short key functions, like sorting batters by strike rate.</p>`, R`batters = [
    {"name": "Gill", "sr": 138.5},
    {"name": "Klaasen", "sr": 171.1},
    {"name": "Gaikwad", "sr": 141.2},
]
best = sorted(batters, key=lambda b: b["sr"], reverse=True)
print([b["name"] for b in best])`, R`['Klaasen', 'Gaikwad', 'Gill']`),
  rd('map transforms, filter keeps', `<p><code>map(f, items)</code> applies <code>f</code> to every item. <code>filter(f, items)</code> keeps items where <code>f</code> is truthy. Wrap them in <code>list()</code> to see the result.</p>`, R`prices = [89, 249, 60, 349, 99]
cheap = list(filter(lambda p: p < 100, prices))
with_gst = list(map(lambda p: round(p * 1.05), cheap))
print(cheap, with_gst)`, R`[89, 60, 99] [93, 63, 104]`),
  lab('Build a pipeline', `<p>Choose a filter and a map. See each value flow through. Compare the two ways to write the same thing.</p>`, 'pipeline'),
  rd('Prefer comprehensions for readability', `<p>Most Python teams prefer a list comprehension. It reads left to right and does both jobs in one line.</p>`, R`prices = [89, 249, 60, 349, 99]
a = list(map(lambda p: round(p * 1.05), filter(lambda p: p < 100, prices)))
b = [round(p * 1.05) for p in prices if p < 100]
print(a == b, b)`, R`True [93, 63, 104]`),
  pr(R`print(list(filter(None, [0, 120, "", "Dosa", None])))`, 'What does this print?', ["[0, 120, '', 'Dosa', None]","[120, 'Dosa']","[]"], 1, 'filter(None, ...) keeps only truthy items.'),
  pr(R`m = map(str.upper, ["csk", "rcb"])
print(list(m), list(m))`, 'What does this print?', ["['CSK', 'RCB'] ['CSK', 'RCB']","['CSK', 'RCB'] []","An error"], 1, 'map is used up after one pass. The second list is empty.'),
  rd('Now in an AI agent', `<p>An AI agent ranks search results by score and keeps the best ones, with exactly these tools.</p>`, R`results = [{"text": "Ooty in Nov", "score": 0.42}, {"text": "Munnar in Dec", "score": 0.91}, {"text": "Kodai in Jan", "score": 0.77}]
top = sorted(results, key=lambda r: r["score"], reverse=True)[:2]
print([r["text"] for r in top])`, R`['Munnar in Dec', 'Kodai in Jan']`),
  lab('Game: Lambda lab', `<p>Answer each one before the scanner reveals it. Every answer comes with the reason.</p>`, 'game_15'),
  task('Keep dishes under Rs 150, sorted from cheapest, and print only their names.', R`menu = [
    {"dish": "Mutton Biryani", "price": 320},
    {"dish": "Masala Dosa", "price": 90},
    {"dish": "Parotta", "price": 40},
    {"dish": "Fish Curry", "price": 180},
]
cheap = sorted([m for m in menu if m["price"] < 150], key=lambda m: m["price"])
print([m["dish"] for m in cheap])`)
 ],
 sum:[['lambda','Small unnamed function'],['map','Apply a function to every item'],['filter','Keep items that pass a test'],['sorted(key=)','Sort by a computed value'],['comprehension','Usually the clearer choice']]};

L[16] = {t:'Scope (LEGB) and closures', d:'Where Python looks for a name, and functions that remember.', mins:28, core:true,
 goals:['Use the LEGB rule to find which value a name has','Understand UnboundLocalError','Write a closure and use nonlocal'],
 steps:[
  lab('Story: The canteen token counter', `<p>Press <b>Next</b> to play each scene and watch what the code does inside Python. Drag the room to look around.</p>`, 'story_16'),
  rd('Scope is where a name is visible', `<p>When Python sees a name, it searches four places in order and stops at the first match.</p><ul><li><b>L</b>ocal: inside the current function</li><li><b>E</b>nclosing: inside an outer function</li><li><b>G</b>lobal: at the top of the file</li><li><b>B</b>uilt-in: names like <code>len</code> and <code>print</code></li></ul>`, R`college = "Anna University"      # global
def outer():
    dept = "CSE"                   # enclosing
    def inner():
        roll = 21                  # local
        print(roll, dept, college, len(college))
    inner()
outer()`, R`21 CSE Anna University 15`),
  lab('Watch Python search the layers', `<p>Each layer is a scope. Remove definitions of <code>model</code> and press <b>Look up</b>. Python searches from the top layer down.</p>`, 'legb'),
  rd('UnboundLocalError', `<p>If a function <b>assigns</b> to a name anywhere, Python treats that name as local in the whole function. Reading it first fails. This one fails on purpose.</p>`, R`token = 0
def next_token():
    token = token + 1   # fails on purpose: token is local here
next_token()`, R`UnboundLocalError: cannot access local variable 'token' where it is not associated with a value`),
  rd('A closure remembers', `<p>The college canteen hands out token numbers. An inner function can keep using a variable from the outer function, even after the outer function has finished. This is a <b>closure</b>. <code>nonlocal</code> lets it change that variable.</p>`, R`def make_token_counter():
    token = 0
    def next_token():
        nonlocal token
        token += 1
        return token
    return next_token

counter = make_token_counter()
counter(); counter()
print("Your token:", counter())`, R`Your token: 3`),
  pr(R`city = "Chennai"
def outer():
    city = "Madurai"
    def inner():
        return city
    return inner()
print(outer())`, 'What does this print?', ['Chennai','Madurai','NameError'], 1, 'inner has no local city, so Python looks in the enclosing function and finds "Madurai".'),
  pr(R`fns = [lambda: i for i in range(3)]
print([f() for f in fns])`, 'What does this print?', ['[0, 1, 2]','[2, 2, 2]','[0, 0, 0]'], 1, 'All three lambdas read i when called, after the loop ended at 2. Fix it with lambda i=i: i.'),
  rd('Now in an AI agent', `<p>A closure can remember a setting, like the system prompt for a chatbot, so every message gets it automatically.</p>`, R`def make_prompter(role):
    def build(question):
        return f"You are a {role}. Question: {question}"
    return build

travel = make_prompter("Kerala travel guide")
print(travel("Best houseboat in Alleppey?"))`, R`You are a Kerala travel guide. Question: Best houseboat in Alleppey?`),
  lab('Game: Scope detective', `<p>Answer each one before the scanner reveals it. Every answer comes with the reason.</p>`, 'game_16'),
  task('Write a closure that adds GST to any price.', R`def make_gst(rate):
    def add(price):
        return round(price * (1 + rate), 2)
    return add

food_gst = make_gst(0.05)
print(food_gst(200))   # 210.0`)
 ],
 sum:[['LEGB','Local, Enclosing, Global, Built-in'],['UnboundLocalError','Read before local assignment'],['closure','Inner function that keeps outer variables'],['nonlocal','Change an enclosing variable'],['global','Change a module variable (use rarely)']]};

L[17] = {t:'Decorators', d:'Wrap a function to add logging, checks or retries.', mins:25, core:true,
 goals:['Understand that @deco means fn = deco(fn)','Write your own decorator with *args, **kwargs','Use functools.wraps and decorators with arguments'],
 steps:[
  lab('Story: Logging every payment', `<p>Press <b>Next</b> to play each scene and watch what the code does inside Python. Drag the room to look around.</p>`, 'story_17'),
  rd('@ is a shortcut', `<p>A decorator is a function that takes a function and returns a new one. The <code>@</code> line is only a short way to write <code>pay = log_payment(pay)</code>.</p>`, R`def log_payment(fn):
    def wrapper(amount):
        print("Payment started:", amount)
        return fn(amount)
    return wrapper

@log_payment
def pay(amount):
    return f"Paid Rs {amount}"

print(pay(499))`, R`Payment started: 499
Paid Rs 499`),
  rd('Write a proper one', `<p>Use <code>*args, **kwargs</code> so the wrapper accepts any call, and <code>functools.wraps</code> to keep the original name.</p>`, R`from functools import wraps

def log_calls(fn):
    @wraps(fn)
    def wrapper(*args, **kwargs):
        print("calling", fn.__name__, args, kwargs)
        result = fn(*args, **kwargs)
        print("done")
        return result
    return wrapper

@log_calls
def book_seat(movie, seat="H12"):
    return f"{movie}: {seat} booked"

print(book_seat("Leo", seat="F7"))`, R`calling book_seat ('Leo',) {'seat': 'F7'}
done
Leo: F7 booked`),
  lab('Stack decorators', `<p>Turn decorators on and off, then call the function. The top decorator is the outer layer, so it runs first and finishes last.</p>`, 'decorator'),
  pr(R`def shout(fn):
    def w(*a):
        return fn(*a).upper()
    return w

@shout
def team():
    return "csk"
print(team.__name__)`, 'What does this print?', ['team','w','shout'], 1, 'Without functools.wraps, the decorated name is the wrapper\'s name. That is why wraps matters.'),
  rd('Now in an AI agent', `<p>The <code>@tool</code> decorator in AI frameworks does not even need a wrapper. It saves the function in a registry and returns it unchanged.</p>`, R`TOOLS = {}

def tool(fn):
    TOOLS[fn.__name__] = fn
    return fn

@tool
def get_pnr_status(pnr: str) -> str:
    return f"PNR {pnr}: Confirmed, coach S4"

print(list(TOOLS))
print(TOOLS["get_pnr_status"]("4521876390"))`, R`['get_pnr_status']
PNR 4521876390: Confirmed, coach S4`, {ai:'LangChain, the OpenAI Agents SDK and FastAPI routes all use decorators like this.'}),
  lab('Game: Decorator tracer', `<p>Answer each one before the scanner reveals it. Every answer comes with the reason.</p>`, 'game_17'),
  task('Write a decorator with an argument: @retry(times=3), and test it on a payment that fails twice.', R`from functools import wraps

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
    return deco

tries = {"n": 0}

@retry(times=3)
def pay(amount):
    tries["n"] += 1
    if tries["n"] < 3:
        raise ConnectionError("bank server busy")
    return f"Paid Rs {amount}"

print(pay(250))`)
 ],
 sum:[['@deco','fn = deco(fn)'],['wrapper(*args, **kwargs)','Accepts any call'],['functools.wraps','Keeps name and docstring'],['deco(arg)','A function that returns a decorator'],['stacking','Top decorator is the outermost layer']]};

L[18] = {t:'Docstrings', d:'Explain your function in words. AI models read them to pick tools.', mins:15,
 goals:['Write a docstring and read it with help() and __doc__','Write tool docstrings that an AI model can use well'],
 steps:[
  lab('Story: The voice assistant reads the label', `<p>Press <b>Next</b> to play each scene and watch what the code does inside Python. Drag the room to look around.</p>`, 'story_18'),
  rd('A docstring is the first string in a function', `<p>Put a string in triple quotes as the first line of a function. Python stores it in <code>fn.__doc__</code>.</p>`, R`def book_auto(pickup: str, drop: str) -> str:
    """Book an auto rickshaw between two places.

    Args:
        pickup: Where to start, for example "T Nagar".
        drop: Where to go, for example "Chennai Central".
    """
    return f"Auto booked: {pickup} to {drop}"

print(book_auto.__doc__.splitlines()[0])`, R`Book an auto rickshaw between two places.`),
  lab('Docstring to tool schema', `<p>AI agent frameworks read your function name, type hints and docstring, and turn them into a description the model reads. Edit the docstring and see it change.</p>`, 'schema'),
  rd('Write docstrings a model can use', `<p>A model picks tools only from their names and descriptions. Say <b>when</b> to use the tool, what each argument means, and what comes back.</p>`, null, null, {table:[['Weak','Strong'],['"Auto tool."','"Book an auto rickshaw for a short city ride. Use when the user wants a ride now. Returns a booking line."'],['"p: place"','"pickup: the start point, for example a bus stop or metro station"']]}),
  pr(R`def f():
    x = 1
    """Not a docstring"""
print(f.__doc__)`, 'What does this print?', ['Not a docstring','None','An error'], 1, 'A docstring must be the first statement in the function body.'),
  rd('Now in an AI agent', `<p>When a user types "get me an auto to Central", the model reads each tool's docstring and picks the one that fits.</p>`, R`def book_auto(pickup, drop):
    """Book an auto rickshaw for a short city ride."""

def check_pnr(pnr):
    """Check the status of a train ticket by PNR number."""

for fn in (book_auto, check_pnr):
    print(fn.__name__, "->", fn.__doc__)`, R`book_auto -> Book an auto rickshaw for a short city ride.
check_pnr -> Check the status of a train ticket by PNR number.`),
  lab('Game: Docstring check', `<p>Answer each one before the scanner reveals it. Every answer comes with the reason.</p>`, 'game_18'),
  task('Write a tool with a docstring a model can act on. Then print it with help().', R`def find_restaurants(area: str, veg_only: bool = False) -> list[str]:
    """Find restaurants in an area of Bengaluru.

    Use this when the user asks where to eat nearby.

    Args:
        area: Neighbourhood name, for example "Indiranagar".
        veg_only: True to show only vegetarian places.
    """
    return ["MTR", "Vidyarthi Bhavan"]

help(find_restaurants)`)
 ],
 sum:[['docstring','First string in a function, class or module'],['__doc__ / help()','Read a docstring'],['tool description','Built from your docstring by frameworks'],['good docstring','When to use, args, return value']]};

L[19] = {t:'Iterators, generators and yield', d:'One item at a time, like live cricket commentary.', mins:25, core:true,
 goals:['Understand iter() and next()','Write a generator with yield','Know why generators save memory'],
 steps:[
  lab('Story: Live commentary, ball by ball', `<p>Press <b>Next</b> to play each scene and watch what the code does inside Python. Drag the room to look around.</p>`, 'story_19'),
  rd('An iterator gives one item at a time', `<p>A <code>for</code> loop calls <code>iter()</code> on the list, then <code>next()</code> again and again. When items run out, Python raises <code>StopIteration</code> and the loop ends. The last line fails on purpose.</p>`, R`balls = iter(["FOUR", "dot"])
print(next(balls))
print(next(balls))
print(next(balls))   # fails on purpose: no balls left`, R`FOUR
dot
StopIteration`),
  rd('A generator is a function with yield', `<p><code>yield</code> gives one value and <b>pauses</b> the function. The next call continues from that exact point, just like live commentary arriving ball by ball.</p>`, R`def commentary(over):
    for ball, result in enumerate(over, start=1):
        yield f"Ball {ball}: {result}"

for line in commentary(["1 run", "FOUR", "dot", "SIX"]):
    print(line)`, R`Ball 1: 1 run
Ball 2: FOUR
Ball 3: dot
Ball 4: SIX`),
  lab('Stream tokens with next()', `<p>Press <b>next(gen)</b>. The arrow shows where the generator is paused. This is how a chat app shows words one by one.</p>`, 'gen'),
  rd('Generator expressions save memory', `<p>Round brackets make a generator. It makes items only when asked, so a million items do not fill your phone's memory.</p>`, R`import sys
big_list = [n * n for n in range(1_000_000)]
big_gen = (n * n for n in range(1_000_000))
print(sys.getsizeof(big_list) > 1_000_000)   # millions of bytes
print(sys.getsizeof(big_gen) < 1_000)        # a few hundred bytes`, R`True
True`),
  pr(R`def g():
    yield "FOUR"
    yield "SIX"
x = g()
print(type(x).__name__)`, 'What does this print?', ['str','generator','function'], 1, 'Calling a generator function does not run its body. It returns a generator.'),
  pr(R`gen = (b for b in "46")
print(list(gen), list(gen))`, 'What does this print?', ["['4', '6'] ['4', '6']","['4', '6'] []","An error"], 1, 'A generator can be used only once.'),
  rd('Now in an AI agent', `<p>Chat apps stream an AI model's reply word by word with a generator, so you see the answer as it is written.</p>`, R`def stream_reply(text):
    for word in text.split():
        yield word

for word in stream_reply("Munnar is best from September to March"):
    print(word, end=" ")
print()`, R`Munnar is best from September to March`),
  lab('Game: Generator lab', `<p>Answer each one before the scanner reveals it. Every answer comes with the reason.</p>`, 'game_19'),
  task('Write a generator that reads a file line by line and yields only lines that are not empty.', R`from pathlib import Path

Path("menu.txt").write_text("Idli\n\nDosa\n  \nVada\n", encoding="utf-8")

def read_items(path):
    with open(path, encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if line:
                yield line

print(list(read_items("menu.txt")))`)
 ],
 sum:[['iterator','Gives items with next()'],['StopIteration','No more items'],['yield','Give a value and pause'],['generator','Lazy, one-pass sequence'],['( ... for ...)','Generator expression']]};
/* ================= PART III ================= */
L[20] = {t:'Classes, objects, __init__ and self', d:'A blueprint for students, tickets and AI agents.', mins:25, core:true,
 goals:['Define a class and create objects from it','Understand what __init__ and self do','Give objects their own methods'],
 steps:[
  lab('Story: The student ID card printer', `<p>Press <b>Next</b> to play each scene and watch what the code does inside Python. Drag the room to look around.</p>`, 'story_20'),
  rd('A class is a blueprint; an object is one thing built from it', `<p>Joseph builds the student portal for his college in Kochi. The class <code>Student</code> describes what every student has and does. Each call to <code>Student(...)</code> builds a new object with its own data.</p>`, R`class Student:
    def __init__(self, name, roll, cgpa):
        self.name = name
        self.roll = roll
        self.cgpa = cgpa

    def id_card(self):
        return f"{self.roll} | {self.name} | CGPA {self.cgpa}"

s = Student("Fathima", 21, 8.9)
print(s.id_card())`, R`21 | Fathima | CGPA 8.9`),
  rd('__init__ and self', `<p><code>__init__</code> runs automatically when you create an object. It sets the starting data.</p><p><code>self</code> is the object itself. Python passes it for you: <code>s.id_card()</code> becomes <code>Student.id_card(s)</code>.</p>`, R`class Ticket:
    def __init__(self, movie, seat):
        self.movie = movie
        self.seat = seat

a = Ticket("Leo", "H12")
b = Ticket("Jailer", "F7")
print(a.movie, a.seat)
print(b.movie, b.seat)`, R`Leo H12
Jailer F7`),
  lab('Build objects from the blueprint', `<p>Create a few objects. Then call a method on one. See which object <code>self</code> refers to.</p>`, 'klass'),
  pr(R`class Student:
    def __init__(self, cgpa):
        self.cgpa = cgpa
a = Student(8.1)
b = Student(9.2)
a.cgpa = 10
print(b.cgpa)`, 'What does this print?', ['8.1','9.2','10'], 1, 'Each object has its own cgpa. Changing a.cgpa does not touch b.'),
  pr(R`class Bot:
    def hi():
        return "Vanakkam"
print(Bot().hi())`, 'What happens?', ['Vanakkam','TypeError','None'], 1, 'Python passes the object as the first argument, but hi has no self parameter: TypeError.'),
  rd('Now in an AI agent', `<p>AI agents, chat sessions and API clients are classes too. Each chat session object keeps its own history.</p>`, R`class ChatSession:
    def __init__(self, system_prompt):
        self.history = [{"role": "system", "content": system_prompt}]

    def add_user(self, text):
        self.history.append({"role": "user", "content": text})

divya = ChatSession("You are a college helpdesk.")
divya.add_user("When do sem exams start?")
print(len(divya.history))`, R`2`),
  lab('Game: Object builder', `<p>Answer each one before the scanner reveals it. Every answer comes with the reason.</p>`, 'game_20'),
  task('Write a MovieTicket class with a method that prints the ticket.', R`class MovieTicket:
    def __init__(self, movie, seat, price):
        self.movie = movie
        self.seat = seat
        self.price = price

    def print_ticket(self):
        return f"{self.movie} | Seat {self.seat} | Rs {self.price}"

t = MovieTicket("Manjummel Boys", "G9", 180)
print(t.print_ticket())`)
 ],
 sum:[['class','Blueprint'],['object / instance','One thing built from a class'],['__init__','Sets starting data'],['self','The current object'],['method','A function defined in a class']]};

L[21] = {t:'Instance vs class attributes', d:'Data for each student vs data shared by the whole college.', mins:20, core:true,
 goals:['Tell instance attributes from class attributes','Avoid the shared mutable class attribute bug'],
 steps:[
  lab('Story: One college, many students', `<p>Press <b>Next</b> to play each scene and watch what the code does inside Python. Drag the room to look around.</p>`, 'story_21'),
  rd('Two places to store data', `<p>An <b>instance attribute</b> is set on <code>self</code>, usually in <code>__init__</code>. Each object has its own. A <b>class attribute</b> is written in the class body, and all objects share it.</p>`, R`class Student:
    college = "Anna University"     # shared by every student

    def __init__(self, name):
        self.name = name            # each student's own

a, b = Student("Karthik"), Student("Harini")
print(a.college, b.college)
print(a.name, b.name)`, R`Anna University Anna University
Karthik Harini`),
  lab('The shared list bug', `<p>Toggle between a class-level list and a per-object list. Add a tool to <code>a1</code> only. Look at <code>a2</code>.</p>`, 'classattr'),
  rd('The shared list bug in a hostel', `<p>A mutable class attribute is one list for every object. Here every student ends up with Karthik's complaint. This is the bug.</p>`, R`class HostelRoom:
    complaints = []                 # shared by ALL rooms: bug

r1, r2 = HostelRoom(), HostelRoom()
r1.complaints.append("fan not working")
print(r2.complaints)`, R`['fan not working']`, {note:'Put per-object lists in __init__: self.complaints = []. Keep class attributes for constants.'}),
  pr(R`class Student:
    fee = 50000
x, y = Student(), Student()
x.fee = 25000      # scholarship
print(Student.fee, y.fee)`, 'What does this print?', ['25000 25000','50000 50000','50000 25000'], 1, 'x.fee = 25000 creates an attribute on x only. Student.fee and y.fee are still 50000.'),
  rd('Now in an AI agent', `<p>Agents use a class attribute for a shared limit and instance attributes for each agent's own memory.</p>`, R`class Agent:
    MAX_STEPS = 5                   # same for all agents

    def __init__(self, user):
        self.user = user
        self.history = []           # each agent has its own

a, b = Agent("Sai"), Agent("Meera")
a.history.append("Book a cab")
print(Agent.MAX_STEPS, len(a.history), len(b.history))`, R`5 1 0`),
  lab('Game: Attribute lookup', `<p>Answer each one before the scanner reveals it. Every answer comes with the reason.</p>`, 'game_21'),
  task('Fix the hostel room so each room has its own complaints list.', R`class HostelRoom:
    BLOCK = "B Block"               # shared constant

    def __init__(self, number):
        self.number = number
        self.complaints = []        # each room's own list

r1, r2 = HostelRoom(101), HostelRoom(102)
r1.complaints.append("fan not working")
print(r1.complaints, r2.complaints)`)
 ],
 sum:[['instance attribute','self.x: one per object'],['class attribute','In the class body: shared'],['shared list bug','Mutable class attribute changed in place'],['rule','Mutable state goes in __init__']]};

L[22] = {t:'Instance, class and static methods', d:'Build objects from a form, and keep helpers with the class.', mins:20,
 goals:['Know what each method type receives','Write an alternative constructor with @classmethod','Use @staticmethod for helpers'],
 steps:[
  lab('Story: Three kinds of methods', `<p>Press <b>Next</b> to play each scene and watch what the code does inside Python. Drag the room to look around.</p>`, 'story_22'),
  rd('Three kinds of method', `<p>The difference is what Python passes as the first argument.</p>`, null, null, {table:[['Kind','First parameter','Use it for'],['instance method','self (the object)','work with this object\'s data'],['@classmethod','cls (the class)','other ways to build an object'],['@staticmethod','nothing','helpers that belong with the class']]}),
  rd('Build a student from a form', `<p>An admission form sends a dict. A class method gets the class as <code>cls</code> and builds the object. A static method checks a roll number and needs no object at all.</p>`, R`class Student:
    def __init__(self, name, roll):
        self.name = name
        self.roll = roll

    def greet(self):                       # instance method
        return f"Welcome, {self.name}"

    @classmethod
    def from_form(cls, form):              # class method
        return cls(form["name"], int(form["roll"]))

    @staticmethod
    def valid_roll(roll):                  # static method
        return 1 <= roll <= 120

s = Student.from_form({"name": "Anjali", "roll": "42"})
print(s.greet(), s.roll, Student.valid_roll(s.roll))`, R`Welcome, Anjali 42 True`),
  pr(R`class Fare:
    @staticmethod
    def auto(km):
        return 30 + 15 * km
print(Fare().auto(4))`, 'What does this print?', ['90','TypeError','None'], 0, 'A static method gets no automatic first argument, so km is 4 when called from an object or the class.'),
  pr(R`class Ticket:
    @classmethod
    def kind(cls):
        return cls.__name__
class TatkalTicket(Ticket): pass
print(TatkalTicket.kind())`, 'What does this print?', ['Ticket','TatkalTicket','cls'], 1, 'cls is the class you called the method on: TatkalTicket.'),
  rd('Now in an AI agent', `<p>AI agents are often built with a class method like <code>from_env()</code>, which reads settings and returns a ready agent.</p>`, R`class Agent:
    def __init__(self, model, temperature):
        self.model = model
        self.temperature = temperature

    @classmethod
    def from_settings(cls, settings):
        return cls(settings.get("MODEL", "gpt-4o-mini"), float(settings.get("TEMPERATURE", "0.2")))

agent = Agent.from_settings({"TEMPERATURE": "0.5"})
print(agent.model, agent.temperature)`, R`gpt-4o-mini 0.5`),
  lab('Game: Method sorter', `<p>Answer each one before the scanner reveals it. Every answer comes with the reason.</p>`, 'game_22'),
  task('Add a from_dict class method to an Order class.', R`class Order:
    def __init__(self, dish, qty):
        self.dish = dish
        self.qty = qty

    @classmethod
    def from_dict(cls, d):
        return cls(d["dish"], d["qty"])

o = Order.from_dict({"dish": "Chicken 65", "qty": 2})
print(o.dish, o.qty)`)
 ],
 sum:[['self','The object: instance methods'],['cls','The class: @classmethod'],['@staticmethod','No automatic argument'],['from_form / from_dict','Typical class-method constructors']]};

L[23] = {t:'Encapsulation: _private and __mangled', d:'What a banking app keeps "inside", and why.', mins:15,
 goals:['Read the underscore conventions','Know what name mangling does'],
 steps:[
  lab('Story: Inside a banking app', `<p>Press <b>Next</b> to play each scene and watch what the code does inside Python. Drag the room to look around.</p>`, 'story_23'),
  rd('Three naming levels', `<p>Python has no truly private attributes. It uses names to show intent.</p>`, null, null, {table:[['Name','Meaning'],['name','Public. Use it freely.'],['_name','Internal. Please do not use it from outside. Python does not stop you.'],['__name','Name mangling. Python renames it to _ClassName__name to avoid clashes in subclasses.']]}),
  rd('In practice', `<p>A banking app keeps the balance public, a helper internal, and the PIN mangled. The last line shows mangling is not security: the value can still be reached.</p>`, R`class BankAccount:
    def __init__(self, owner, pin):
        self.owner = owner           # public
        self._server = "sbi-node-7"  # internal
        self.__pin = pin             # mangled

acc = BankAccount("Venkat", "4821")
print(acc.owner, acc._server)
print(acc._BankAccount__pin)   # still reachable: not real security`, R`Venkat sbi-node-7
4821`, {note:'Never store real secrets in attributes and assume they are hidden. Keep them out of the code entirely (lesson 36).'}),
  pr(R`class Account:
    def __init__(self):
        self.__pin = "1234"
print(Account().__pin)`, 'What happens?', ['1234','AttributeError','None'], 1, 'The attribute was renamed to _Account__pin, so __pin is not found outside the class.'),
  rd('Now in an AI agent', `<p>AI SDKs keep their HTTP connection in <code>self._client</code>. The single underscore says: this can change in any release, so do not depend on it.</p>`, R`class LLMClient:
    def __init__(self, model):
        self.model = model                 # public
        self._client = "http-session"      # internal

c = LLMClient("gpt-4o-mini")
print(c.model)`, R`gpt-4o-mini`),
  lab('Game: Underscore check', `<p>Answer each one before the scanner reveals it. Every answer comes with the reason.</p>`, 'game_23'),
  task('Write a class with a public method and an internal helper.', R`class Wallet:
    def __init__(self, balance):
        self.balance = balance

    def pay(self, amount):
        if self._can_pay(amount):
            self.balance -= amount
            return f"Paid Rs {amount}, left Rs {self.balance}"
        return "Not enough balance"

    def _can_pay(self, amount):      # internal helper
        return amount <= self.balance

w = Wallet(500)
print(w.pay(180))
print(w.pay(400))`)
 ],
 sum:[['name','Public'],['_name','Internal by convention'],['__name','Mangled to _Class__name'],['rule','Do not depend on another library\'s _names']]};

L[24] = {t:'The @property decorator', d:'Attendance % that is always up to date, and values you can check.', mins:18,
 goals:['Use @property for a computed value','Add a setter that validates'],
 steps:[
  lab('Story: The attendance tracker', `<p>Press <b>Next</b> to play each scene and watch what the code does inside Python. Drag the room to look around.</p>`, 'story_24'),
  rd('A method you read like an attribute', `<p>Harini's attendance should always be classes attended divided by classes held. <code>@property</code> lets you write <code>s.attendance</code> with no brackets, and Python computes it fresh each time.</p>`, R`class Student:
    def __init__(self, attended, held):
        self.attended = attended
        self.held = held

    @property
    def attendance(self):
        return round(100 * self.attended / self.held, 1)

s = Student(54, 70)
print(s.attendance)
s.attended += 3
print(s.attendance)`, R`77.1
81.4`),
  rd('Validate with a setter', `<p>Add a <code>@name.setter</code> to check a value every time it is assigned. Marks must be between 0 and 100. The last line fails on purpose.</p>`, R`class Exam:
    def __init__(self, marks):
        self.marks = marks               # goes through the setter

    @property
    def marks(self):
        return self._marks

    @marks.setter
    def marks(self, value):
        if not 0 <= value <= 100:
            raise ValueError("marks must be between 0 and 100")
        self._marks = value

e = Exam(88)
print(e.marks)
e.marks = 120   # fails on purpose`, R`88
ValueError: marks must be between 0 and 100`),
  pr(R`class Student:
    @property
    def cgpa(self):
        return 8.5
s = Student()
print(s.cgpa())`, 'What happens?', ['8.5','TypeError','None'], 1, 's.cgpa already gives 8.5. Then 8.5() fails: TypeError: \'float\' object is not callable.'),
  rd('Now in an AI agent', `<p>An AI usage tracker uses a property for the total token count, so it can never get out of sync.</p>`, R`class Usage:
    def __init__(self, prompt, completion):
        self.prompt = prompt
        self.completion = completion

    @property
    def total_tokens(self):
        return self.prompt + self.completion

print(Usage(42, 18).total_tokens)`, R`60`, {ai:'Pydantic (lesson 31) does this kind of validation for you, with less code.'}),
  lab('Game: Property tester', `<p>Answer each one before the scanner reveals it. Every answer comes with the reason.</p>`, 'game_24'),
  task('Add a read-only property that warns when attendance is below 75%.', R`class Student:
    def __init__(self, name, attended, held):
        self.name = name
        self.attended = attended
        self.held = held

    @property
    def status(self):
        pct = 100 * self.attended / self.held
        return "Safe" if pct >= 75 else f"Short: {pct:.0f}%"

print(Student("Arjun", 60, 72).status)
print(Student("Meera", 48, 72).status)`)
 ],
 sum:[['@property','Read a method like an attribute'],['@x.setter','Run code when x is assigned'],['_x','Where the real value is stored'],['read-only','A property with no setter']]};

L[25] = {t:'Dunder methods', d:'Make your objects work with print, len, == and ().', mins:25,
 goals:['Know what __repr__, __str__, __eq__, __len__, __call__ and __iter__ do','See which Python syntax calls which method'],
 steps:[
  lab('Story: The food cart object', `<p>Press <b>Next</b> to play each scene and watch what the code does inside Python. Drag the room to look around.</p>`, 'story_25'),
  rd('Python syntax calls dunder methods', `<p>"Dunder" means double underscore. When you write <code>len(cart)</code>, Python calls <code>cart.__len__()</code>. When you write <code>cart1 == cart2</code>, it calls <code>__eq__</code>.</p>`, R`class Cart:
    def __init__(self, items):
        self.items = items
    def __len__(self):
        return len(self.items)
    def __eq__(self, other):
        return sorted(self.items) == sorted(other.items)

a = Cart(["Dosa", "Vada"])
b = Cart(["Vada", "Dosa"])
print(len(a), a == b)`, R`2 True`),
  lab('Which method runs?', `<p>Click a line of normal Python. See which dunder method Python calls on the object, and what it returns.</p>`, 'dunder'),
  rd('__repr__ vs __str__', `<p><code>__repr__</code> is for developers and shows in lists and logs. <code>__str__</code> is for users and is used by <code>print()</code>. If you only write one, write <code>__repr__</code>.</p>`, R`class Order:
    def __init__(self, dish, qty):
        self.dish = dish
        self.qty = qty
    def __repr__(self):
        return f"Order({self.dish!r}, {self.qty})"
    def __str__(self):
        return f"{self.qty} x {self.dish}"

o = Order("Masala Dosa", 2)
print(o)
print([o])`, R`2 x Masala Dosa
[Order('Masala Dosa', 2)]`),
  pr(R`class Cart:
    def __len__(self):
        return 0
print(bool(Cart()))`, 'What does this print?', ['True','False','An error'], 1, 'With no __bool__, Python uses __len__. An empty cart (length 0) is falsy.'),
  rd('Now in an AI agent', `<p>An AI tool registry can support <code>len()</code>, <code>in</code> and being called by name, just like built-in types.</p>`, R`class ToolRegistry:
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
def check_pnr(pnr): return f"PNR {pnr}: Confirmed"
print(len(reg), "check_pnr" in reg, reg("check_pnr", pnr="4521876390"))`, R`1 True PNR 4521876390: Confirmed`),
  lab('Game: Dunder detective', `<p>Answer each one before the scanner reveals it. Every answer comes with the reason.</p>`, 'game_25'),
  task('Make a Playlist that supports len(), "in", and a for loop.', R`class Playlist:
    def __init__(self, songs):
        self.songs = songs
    def __len__(self):
        return len(self.songs)
    def __contains__(self, song):
        return song in self.songs
    def __iter__(self):
        return iter(self.songs)

p = Playlist(["Hukum", "Kaavaalaa", "Naatu Naatu"])
print(len(p), "Hukum" in p)
for song in p:
    print(song)`)
 ],
 sum:[['__repr__','Developer text (logs)'],['__str__','User text (print)'],['__eq__','=='],['__len__','len()'],['__call__','obj()'],['__iter__','for x in obj']]};

L[26] = {t:'Composition vs inheritance', d:'A food app has a cart and a payment; it is not one.', mins:20,
 goals:['Tell is-a from has-a relationships','Choose composition for agents'],
 steps:[
  lab('Story: Building a food app from parts', `<p>Press <b>Next</b> to play each scene and watch what the code does inside Python. Drag the room to look around.</p>`, 'story_26'),
  rd('Inheritance: is-a', `<p>A subclass gets all methods of its parent and can change some. Use it when B really <b>is a</b> kind of A: a tatkal ticket is a kind of ticket.</p>`, R`class Ticket:
    def __init__(self, fare):
        self.fare = fare
    def price(self):
        return self.fare

class TatkalTicket(Ticket):        # a TatkalTicket IS a Ticket
    def price(self):
        return self.fare + 400     # tatkal charge

print(Ticket(800).price(), TatkalTicket(800).price())`, R`800 1200`),
  rd('Composition: has-a', `<p>A food app <b>has a</b> cart and <b>has a</b> payment method. It holds those objects and uses them. You can swap the payment method without touching the app.</p>`, R`class Cart:
    def __init__(self):
        self.items = []
    def total(self):
        return sum(price for _, price in self.items)

class UPI:
    def pay(self, amount):
        return f"Paid Rs {amount} by UPI"

class FoodApp:
    def __init__(self, cart, payment):
        self.cart = cart            # has a cart
        self.payment = payment      # has a payment method
    def checkout(self):
        return self.payment.pay(self.cart.total())

app = FoodApp(Cart(), UPI())
app.cart.items += [("Biryani", 249), ("Lassi", 60)]
print(app.checkout())`, R`Paid Rs 309 by UPI`),
  pr(null, 'A chatbot needs an AI model client, a search index and a logger. Which design is best?', ['class ChatBot(ModelClient, SearchIndex, Logger)','class ChatBot with self.llm, self.index, self.log','Copy the code of all three into ChatBot'], 1, 'A chatbot is not a search index. It has one. Composition keeps the parts separate and swappable.'),
  rd('Now in an AI agent', `<p>Production AI agents mostly use composition. To test, pass in a fake model. To change provider, pass in a different client.</p>`, R`class Agent:
    def __init__(self, llm, memory):
        self.llm = llm
        self.memory = memory
    def ask(self, q):
        self.memory.append(q)
        return self.llm.complete(q)

class FakeLLM:
    def complete(self, q):
        return f"(test) answer to: {q}"

agent = Agent(FakeLLM(), [])
print(agent.ask("Trains from Vizag to Hyderabad?"))`, R`(test) answer to: Trains from Vizag to Hyderabad?`),
  lab('Game: Is a or has a?', `<p>Answer each one before the scanner reveals it. Every answer comes with the reason.</p>`, 'game_26'),
  task('Swap the payment method in the food app without changing FoodApp.', R`class Card:
    def pay(self, amount):
        return f"Paid Rs {amount} by card"

class Cash:
    def pay(self, amount):
        return f"Pay Rs {amount} on delivery"

class FoodApp:
    def __init__(self, payment):
        self.payment = payment
    def checkout(self, total):
        return self.payment.pay(total)

print(FoodApp(Card()).checkout(420))
print(FoodApp(Cash()).checkout(420))`)
 ],
 sum:[['inheritance','is-a; class B(A)'],['super()','Call the parent version'],['composition','has-a; objects inside objects'],['rule','Prefer composition for agents']]};

L[27] = {t:'Abstract base classes and Protocols', d:'One payment interface, many UPI apps behind it.', mins:22,
 goals:['Force subclasses to implement methods with abc','Describe a shape with a Protocol','Choose between the two'],
 steps:[
  lab('Story: One interface, many apps', `<p>Press <b>Next</b> to play each scene and watch what the code does inside Python. Drag the room to look around.</p>`, 'story_27'),
  rd('An ABC is a contract you must inherit', `<p>An abstract base class lists methods every subclass must write. Python refuses to create an object of a class that is missing one. This fails on purpose.</p>`, R`from abc import ABC, abstractmethod

class PaymentApp(ABC):
    @abstractmethod
    def pay(self, amount: int) -> str: ...

class Broken(PaymentApp):
    pass

Broken()   # fails on purpose`, R`TypeError: Can't instantiate abstract class Broken without an implementation for abstract method 'pay'`),
  rd('A Protocol is a shape you only need to match', `<p>A <code>Protocol</code> does not need inheritance. Any class with the right method matches, even one from a library you cannot edit.</p>`, R`from typing import Protocol

class Payer(Protocol):
    def pay(self, amount: int) -> str: ...

class QuickPay:                       # no inheritance
    def pay(self, amount):
        return f"QuickPay: Rs {amount}"

class BharatWallet:
    def pay(self, amount):
        return f"BharatWallet: Rs {amount}"

def checkout(app: Payer, amount: int):
    return app.pay(amount)

print(checkout(QuickPay(), 250))
print(checkout(BharatWallet(), 250))`, R`QuickPay: Rs 250
BharatWallet: Rs 250`),
  rd('Which one?', `<p>Use an <b>ABC</b> when you own the base class and want a hard error when an object is created. Use a <b>Protocol</b> when you want to accept classes from other libraries without changing them.</p>`),
  pr(null, 'Your app must accept any object with a .pay(amount) method, including a payment SDK you cannot edit. Which tool fits?', ['An ABC','A Protocol','A dataclass'], 1, 'A Protocol matches by shape, so the SDK class does not need to inherit from anything.'),
  rd('Now in an AI agent', `<p>An agent can talk to OpenAI, Anthropic or a local Ollama model through one interface, and you swap providers by passing a different object.</p>`, R`from typing import Protocol

class ChatModel(Protocol):
    def complete(self, prompt: str) -> str: ...

class OpenAIModel:
    def complete(self, prompt): return "openai: " + prompt

class OllamaModel:
    def complete(self, prompt): return "ollama: " + prompt

def answer(model: ChatModel, q: str) -> str:
    return model.complete(q)

print(answer(OpenAIModel(), "hi"), "|", answer(OllamaModel(), "hi"))`, R`openai: hi | ollama: hi`),
  lab('Game: Interface check', `<p>Answer each one before the scanner reveals it. Every answer comes with the reason.</p>`, 'game_27'),
  task('Write a Notifier ABC with two working subclasses: SMS and WhatsApp.', R`from abc import ABC, abstractmethod

class Notifier(ABC):
    @abstractmethod
    def send(self, to: str, text: str) -> str: ...

class SMS(Notifier):
    def send(self, to, text):
        return f"SMS to {to}: {text}"

class WhatsApp(Notifier):
    def send(self, to, text):
        return f"WhatsApp to {to}: {text}"

for n in (SMS(), WhatsApp()):
    print(n.send("+91 98XXXXXX10", "Your order is out for delivery"))`)
 ],
 sum:[['ABC','Base class with required methods'],['@abstractmethod','Must be implemented'],['Protocol','Structural interface; no inheritance'],['duck typing','If it has the method, it works']]};

/* ================= PART IV ================= */
L[28] = {t:'Type hints', d:'Label what each value should be. AI frameworks read the labels.', mins:22, core:true,
 goals:['Read and write the common hints','Know that hints do not stop wrong values at run time'],
 steps:[
  lab('Story: Labels on the auto fare function', `<p>Press <b>Next</b> to play each scene and watch what the code does inside Python. Drag the room to look around.</p>`, 'story_28'),
  rd('Hints describe what a value should be', `<p>Sai writes an auto fare calculator for Bengaluru. A type hint tells readers, editors and frameworks what each value should be. Python itself does not check it when the code runs.</p>`, R`def auto_fare(km: float, night: bool = False) -> int:
    fare = 30 + 15 * km
    return round(fare * 1.5 if night else fare)

print(auto_fare(4.2))
print(auto_fare(4.2, night=True))`, R`93
140`),
  rd('The hints you will see most', ``, null, null, {table:[['Hint','Means','Example'],['list[str]','a list of strings','songs: list[str]'],['dict[str, int]','string keys, int values','marks: dict[str, int]'],['str | None','a string or None','coupon: str | None'],['Literal["veg", "non-veg"]','only these exact values','food: Literal[...]'],['Callable[[int], str]','a function from int to str','formatter: Callable[...]']]}),
  rd('Hints in action', `<p>Hints make it clear what a function expects and gives back. This one takes a dict of marks and returns the top scorer.</p>`, R`def topper(marks: dict[str, int]) -> str:
    return max(marks, key=marks.get)

print(topper({"Divya": 91, "Karthik": 87, "Lakshmi": 95}))`, R`Lakshmi`),
  rd('Hints do not stop bad values', `<p>This runs with no error, even though the hint says <code>int</code>. Your editor or a tool like mypy would warn you. Pydantic (lesson 31) is what checks values at run time.</p>`, R`def double(n: int) -> int:
    return n * 2

print(double("Ha"))`, R`HaHa`),
  pr(null, 'Which hint means "a list of orders, where each order is a dict with string keys"?', ['list[str]','dict[str, list]','list[dict[str, Any]]'], 2, 'The outer type is a list. Each item is a dict with str keys and any values.'),
  rd('Now in an AI agent', `<p>AI frameworks like the OpenAI Agents SDK, LangChain and FastAPI read your hints and build the JSON description the model sees. Good hints mean the model sends the right kinds of values.</p>`, R`def get_weather(city: str, days: int = 1) -> str:
    return f"{days}-day forecast for {city}"

print(get_weather.__annotations__)`, R`{'city': <class 'str'>, 'days': <class 'int'>, 'return': <class 'str'>}`),
  lab('Game: Hint reader', `<p>Answer each one before the scanner reveals it. Every answer comes with the reason.</p>`, 'game_28'),
  task('Add full type hints to a function that finds dishes under a budget.', R`def under_budget(menu: dict[str, int], budget: int) -> list[str]:
    return [dish for dish, price in menu.items() if price <= budget]

menu = {"Idli": 40, "Biryani": 249, "Parotta": 50, "Fish Curry": 180}
print(under_budget(menu, 100))`)
 ],
 sum:[['list[str]','List of strings'],['X | None','Optional value'],['Literal','Fixed allowed values'],['Callable','A function type'],['runtime','Hints are not checked']]};

L[29] = {t:'Dataclasses and field(default_factory=...)', d:'Clean classes for orders and records, without the shared-list bug.', mins:20, core:true,
 goals:['Write a @dataclass','Use field(default_factory=list) for mutable defaults'],
 steps:[
  lab('Story: The order factory', `<p>Press <b>Next</b> to play each scene and watch what the code does inside Python. Drag the room to look around.</p>`, 'story_29'),
  rd('@dataclass writes __init__ for you', `<p>List the fields with type hints. The decorator creates <code>__init__</code>, a readable <code>__repr__</code> and <code>__eq__</code>.</p>`, R`from dataclasses import dataclass

@dataclass
class Order:
    dish: str
    qty: int
    price: float

o = Order("Ghee Roast", 2, 120.0)
print(o)
print(o == Order("Ghee Roast", 2, 120.0))`, R`Order(dish='Ghee Roast', qty=2, price=120.0)
True`),
  rd('Mutable defaults need default_factory', `<p>A dataclass refuses <code>items: list = []</code>, because that one list would be shared by every cart. <code>field(default_factory=list)</code> makes a <b>new</b> list for every object.</p>`, R`from dataclasses import dataclass, field

@dataclass
class Cart:
    customer: str
    items: list[str] = field(default_factory=list)

a, b = Cart("Arjun"), Cart("Meera")
a.items.append("Biryani")
print(a.items, b.items)`, R`['Biryani'] []`),
  pr(R`from dataclasses import dataclass
@dataclass
class Cart:
    items: list = []`, 'What happens?', ['It works','ValueError: mutable default','Every cart shares items'], 1, 'Dataclasses protect you: ValueError: mutable default <class \'list\'> for field items is not allowed: use default_factory.'),
  rd('frozen=True locks it', `<p>A frozen dataclass cannot change after creation. Use it for things that must stay fixed, like a train's details. The last line fails on purpose.</p>`, R`from dataclasses import dataclass

@dataclass(frozen=True)
class Train:
    number: str
    name: str

t = Train("12007", "Shatabdi Express")
print(t.name)
t.name = "Other"   # fails on purpose`, R`Shatabdi Express
dataclasses.FrozenInstanceError: cannot assign to field 'name'`),
  rd('Now in an AI agent', `<p>AI agents keep their state in a dataclass: the model, a step counter and a history that is new for each agent.</p>`, R`from dataclasses import dataclass, field

@dataclass
class AgentState:
    model: str
    max_steps: int = 5
    steps: int = 0
    history: list[dict] = field(default_factory=list)

s = AgentState("gpt-4o-mini")
s.history.append({"role": "user", "content": "Plan a Hampi trip"})
print(s.model, s.steps, len(s.history))`, R`gpt-4o-mini 0 1`),
  lab('Game: Dataclass check', `<p>Answer each one before the scanner reveals it. Every answer comes with the reason.</p>`, 'game_29'),
  task('Write a Student dataclass with a list of subjects, and add one subject.', R`from dataclasses import dataclass, field

@dataclass
class Student:
    name: str
    roll: int
    subjects: list[str] = field(default_factory=list)

s = Student("Venkat", 14)
s.subjects.append("Python")
print(s)`)
 ],
 sum:[['@dataclass','Auto __init__, __repr__, __eq__'],['field(default_factory=list)','New list per object'],['frozen=True','Make objects immutable']]};

L[30] = {t:'Enums for states and roles', d:'Order status without typo bugs like "deliverd".', mins:18,
 goals:['Define an Enum','Use str enums that compare with plain strings'],
 steps:[
  lab('Story: Tracking a food order', `<p>Press <b>Next</b> to play each scene and watch what the code does inside Python. Drag the room to look around.</p>`, 'story_30'),
  rd('Strings let typos in', `<p>A food order moves through steps: placed, cooking, out for delivery, delivered. With plain strings, one typo and the check is silently False.</p>`, R`status = "deliverd"           # typo
if status == "delivered":
    print("Rate your order")
else:
    print("Still waiting...")    # wrong, and no error`, R`Still waiting...`),
  rd('An Enum is a fixed set of named values', `<p>An Enum gives you a fixed list. A typo becomes an error you see at once, and your editor can autocomplete the names.</p>`, R`from enum import Enum

class OrderStatus(str, Enum):
    PLACED = "placed"
    COOKING = "cooking"
    OUT_FOR_DELIVERY = "out_for_delivery"
    DELIVERED = "delivered"

s = OrderStatus.COOKING
print(s.value, s == "cooking")
print(OrderStatus("delivered"))`, R`cooking True
OrderStatus.DELIVERED`),
  pr(R`from enum import Enum
class Food(Enum):
    VEG = "veg"
print(Food("vegan"))`, 'What happens?', ['Food.VEGAN','None','ValueError'], 2, '"vegan" is not a valid value, so Python raises ValueError. Bad data is caught early.'),
  rd('Loop over all members', `<p>You can loop over an Enum to show every option, for example in a dropdown.</p>`, R`from enum import Enum

class Berth(str, Enum):
    LOWER = "lower"
    MIDDLE = "middle"
    UPPER = "upper"
    SIDE_LOWER = "side lower"

print([b.value for b in Berth])`, R`['lower', 'middle', 'upper', 'side lower']`),
  rd('Now in an AI agent', `<p>Chat messages have fixed roles. A <code>str</code> Enum works anywhere a string is expected, such as in the JSON sent to an AI model.</p>`, R`from enum import Enum

class Role(str, Enum):
    SYSTEM = "system"
    USER = "user"
    ASSISTANT = "assistant"

msg = {"role": Role.USER.value, "content": "Best filter coffee in Mysuru?"}
print(msg["role"], Role.USER == "user")`, R`user True`),
  lab('Game: Enum check', `<p>Answer each one before the scanner reveals it. Every answer comes with the reason.</p>`, 'game_30'),
  task('Use an Enum to move an order to its next status.', R`from enum import Enum

class OrderStatus(str, Enum):
    PLACED = "placed"
    COOKING = "cooking"
    OUT_FOR_DELIVERY = "out_for_delivery"
    DELIVERED = "delivered"

steps = list(OrderStatus)
status = OrderStatus.COOKING
status = steps[steps.index(status) + 1]
print(status.value)`)
 ],
 sum:[['Enum','Fixed named values'],['str, Enum','Values also work as strings'],['.value','The raw value'],['OrderStatus("delivered")','Look up by value']]};

L[31] = {t:'Pydantic', d:'Check form data and AI output before you trust it.', mins:25, core:true,
 goals:['Define a BaseModel and validate data with it','Add rules with Field','Convert with model_dump() and get a JSON schema'],
 steps:[
  lab('Story: Checking a train booking form', `<p>Press <b>Next</b> to play each scene and watch what the code does inside Python. Drag the room to look around.</p>`, 'story_31'),
  rd('BaseModel describes and checks data', `<p>A booking form sends everything as text. A Pydantic model looks like a dataclass, but it <b>checks</b> the data when the code runs and converts it where it safely can. The age "21" becomes the number 21.</p>`, R`from pydantic import BaseModel

class Booking(BaseModel):
    name: str
    age: int
    train: str = "12007"

b = Booking(name="Lakshmi", age="21")
print(b.age, type(b.age))
print(b.train)`, R`21 <class 'int'>
12007`),
  lab('Validate tool arguments', `<p>Edit the JSON that an AI model sent. Press <b>Validate</b>. See the clean object or the errors that Pydantic reports.</p>`, 'pydantic'),
  rd('Rules with Field and Literal', `<p>Add rules: age must be 5 to 120, and the berth must be one of a fixed list. Bad data raises one error that lists every problem.</p>`, R`from typing import Literal
from pydantic import BaseModel, Field, ValidationError

class Booking(BaseModel):
    name: str
    age: int = Field(ge=5, le=120)
    berth: Literal["lower", "middle", "upper"] = "lower"

try:
    Booking(name="Arjun", age=150, berth="window")
except ValidationError as e:
    for err in e.errors():
        print(err["loc"][0], "->", err["type"])`, R`age -> less_than_equal
berth -> literal_error`),
  rd('model_dump and JSON schema', `<p><code>model_dump()</code> turns the object back into a dict. <code>model_json_schema()</code> describes the model as JSON Schema.</p>`, R`from pydantic import BaseModel

class Booking(BaseModel):
    name: str
    age: int

b = Booking(name="Sai", age=22)
print(b.model_dump())
print(Booking.model_json_schema()["required"])`, R`{'name': 'Sai', 'age': 22}
['name', 'age']`),
  pr(R`from pydantic import BaseModel
class Booking(BaseModel):
    age: int
Booking(age="twenty")`, 'What happens?', ['age is "twenty"','age is 20','ValidationError'], 2, '"twenty" cannot be converted to an int, so Pydantic raises a ValidationError that names the field and the problem.'),
  rd('Now in an AI agent', `<p>An AI model sends tool arguments as JSON. Pydantic checks them before your tool runs, and the same class gives the model its schema. FastAPI uses the same models too.</p>`, R`from pydantic import BaseModel

class WeatherArgs(BaseModel):
    city: str
    days: int = 1

raw = '{"city": "Chennai", "days": "3"}'
args = WeatherArgs.model_validate_json(raw)
print(args.city, args.days + 1)`, R`Chennai 4`),
  lab('Game: Validation gate', `<p>Answer each one before the scanner reveals it. Every answer comes with the reason.</p>`, 'game_31'),
  task('Validate AI output and print a clear message when it is wrong.', R`from pydantic import BaseModel, Field, ValidationError

class Review(BaseModel):
    restaurant: str
    rating: float = Field(ge=0, le=5)

raw = '{"restaurant": "MTR, Bengaluru", "rating": 6.5}'
try:
    r = Review.model_validate_json(raw)
    print(r)
except ValidationError as e:
    print("Bad AI output:", e.errors()[0]["msg"])`)
 ],
 sum:[['BaseModel','Typed, validated data class'],['Field(ge=, le=)','Extra rules'],['ValidationError','Data does not match'],['model_dump()','Object to dict'],['model_json_schema()','Schema for the AI model']]};
/* ================= PART V ================= */
L[32] = {t:'Exceptions: try, except, else, finally', d:'When a tool fails, tell the LLM and keep going.', mins:14, core:true,
 goals:['Catch errors with try / except','Know when else and finally run','raise errors and write custom exception classes'],
 steps:[
  lab('Story: When a tool breaks', `<p>Press <b>Next</b> to play each scene and watch what the code does inside Python. Drag the room to look around.</p>`, 'story_32'),
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
  lab('Game: Exception tracer', `<p>Answer each one before the scanner reveals it. Every answer comes with the reason.</p>`, 'game_32'),
  task('Wrap a tool call the way an agent does.', R`def get_weather(city):
    return f"Sunny in {city}"

def safe_call(fn, **args):
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
  lab('Story: Surviving a busy API', `<p>Press <b>Next</b> to play each scene and watch what the code does inside Python. Drag the room to look around.</p>`, 'story_33'),
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
  lab('Game: Retry or not?', `<p>Answer each one before the scanner reveals it. Every answer comes with the reason.</p>`, 'game_33'),
  task('Add jitter and a maximum wait to your hand-written retry.', R`import random

base = 1
for attempt in range(5):
    wait = min(10, base * 2 ** attempt) + random.uniform(0, 0.5)
    print(f"attempt {attempt}: wait {wait:.2f}s")`)
 ],
 sum:[['backoff','Wait longer after each failure'],['jitter','A small random extra wait'],['429 / 503','Retry these'],['400 / 401','Do not retry these'],['tenacity','@retry(stop=..., wait=...)']]};

L[34] = {t:'JSON and malformed LLM output', d:'Parse tool arguments safely.', mins:10, core:true,
 goals:['Use json.loads and json.dumps','Clean up common LLM JSON mistakes','Fall back safely when JSON is broken'],
 steps:[
  lab('Story: Reading JSON from the model', `<p>Press <b>Next</b> to play each scene and watch what the code does inside Python. Drag the room to look around.</p>`, 'story_34'),
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
  lab('Game: JSON parser', `<p>Answer each one before the scanner reveals it. Every answer comes with the reason.</p>`, 'game_34'),
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
  lab('Story: Loading the knowledge base', `<p>Press <b>Next</b> to play each scene and watch what the code does inside Python. Drag the room to look around.</p>`, 'story_35'),
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
  lab('Game: Path lab', `<p>Answer each one before the scanner reveals it. Every answer comes with the reason.</p>`, 'game_35'),
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
  lab('Story: Keeping the key secret', `<p>Press <b>Next</b> to play each scene and watch what the code does inside Python. Drag the room to look around.</p>`, 'story_36'),
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
  lab('Game: Secret keeper', `<p>Answer each one before the scanner reveals it. Every answer comes with the reason.</p>`, 'game_36'),
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
  lab('Story: Calling a real API', `<p>Press <b>Next</b> to play each scene and watch what the code does inside Python. Drag the room to look around.</p>`, 'story_37'),
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
  lab('Game: HTTP status check', `<p>Answer each one before the scanner reveals it. Every answer comes with the reason.</p>`, 'game_37'),
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
  lab('Story: The standard toolbox', `<p>Press <b>Next</b> to play each scene and watch what the code does inside Python. Drag the room to look around.</p>`, 'story_38'),
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
  lab('Game: Toolbox quiz', `<p>Answer each one before the scanner reveals it. Every answer comes with the reason.</p>`, 'game_38'),
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
