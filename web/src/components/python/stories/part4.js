/* eslint-disable */
// @ts-nocheck
/* Part IV · Typing and Data Modelling (lessons 28-31): story and game data for the engine. */
import { story, game } from "./engine";

const box = (v, t, x, y, more) => ({kind: 'box', v, t, x, y, ...(more || {})});
const cls = (v, x, y, more) => box(v, 'class', x, y, {size: 80, ...(more || {})});
const fn = (v, x, y, more) => box(v, 'function', x, y, {size: 80, ...(more || {})});
const tag = (on, more) => ({kind: 'tag', on, ...(more || {})});
const shelf = (x, y, w, more) => ({kind: 'shelf', x, y, w, ...(more || {})});
const note = (on, text, more) => ({kind: 'note', on, text, ...(more || {})});
const link = (from, to, more) => ({kind: 'link', from, to, ...(more || {})});
const scan = on => ({kind: 'scan', on});
const card = (show, a, o, out, why, q) => ({show, code: show, a, o, out, why, ...(q ? {q} : {})});
const P = (...args) => ({...card(...args), prose: true});

export const stories = {
  28: {title: 'Labels on the slots', file: 'hints.py', count: false, empty: 'no function yet', scenes: [
    {title: 'A tool with no hints', code: `def get_weather(city, days=1):\n    ...`, body: `Nothing says what <code>city</code> or <code>days</code> should be. A teammate, your editor and an agent framework all have to guess.`,
     set: {m: fn('get_weather', 0, -20), s1: shelf(-170, 90, 130, {h: 70, label: 'city: ?'}), s2: shelf(170, 90, 130, {h: 70, label: 'days: ?'})}},
    {title: 'Hints label each slot', code: `def get_weather(city: str, days: int = 1) -> str:`, body: `<code>: str</code> and <code>: int</code> say what each argument should be. <code>-&gt; str</code> says what comes back. They are labels for people and tools.`,
     set: {s1: {label: 'city: str'}, s2: {label: 'days: int'}, r: note('m', '-> str', {z: 30})}},
    {title: 'Python does not enforce them', code: `get_weather(42, "three")   # runs anyway`, body: `At run time Python ignores hints. The wrong types go straight in. Hints are a contract, not a guard.`,
     set: {a: box('42', 'int', -170, 90, {size: 48, glow: true}), b: box('"three"', 'str', 170, 90, {size: 48, glow: true})}},
    {title: 'Checkers read them before you run', code: `$ mypy tools.py\nerror: Argument 1 has incompatible type "int"; expected "str"`, body: `mypy, pyright and your editor read the hints and flag the bug while you type. Cheap bugs caught before an expensive agent run.`,
     set: {a: {glow: false}, b: {glow: false}, e: note('s1', 'expected str', {bad: true, z: 40})}},
    {title: 'Frameworks build schemas from them', code: `{"city": {"type": "string"},\n "days": {"type": "integer", "default": 1}}`, body: `The OpenAI Agents SDK, LangChain and FastAPI read your hints and build the JSON schema the LLM sees. Good hints mean the model sends the right types.`,
     set: {e: null, a: null, b: null, sc: scan('m'), sch: box('schema', 'dict', 0, -160, {size: 54}), l: link('m', 'sch', {dash: true})}},
    {title: 'Richer hints', code: `def search(q: str, filters: dict[str, str] | None = None) -> list[str]:`, body: `<code>list[str]</code> describes the items. <code>X | None</code> (or <code>Optional[X]</code>) means "X or None". Use them for anything that may be missing.`,
     set: {sc: null, s2: {label: 'filters: dict | None'}, s1: {label: 'q: str'}, r: note('m', '-> list[str]', {z: 30})}},
  ]},

  29: {title: 'The message factory', file: 'models.py', count: false, empty: 'no class yet', scenes: [
    {title: 'Boilerplate classes', code: `class Message:\n    def __init__(self, role, content):\n        self.role = role\n        self.content = content`, body: `Many classes only hold data. Writing <code>__init__</code>, <code>__repr__</code> and <code>__eq__</code> by hand for each one is slow and easy to get wrong.`,
     set: {C: cls('Message', -170, -40)}},
    {title: '@dataclass writes them for you', code: `from dataclasses import dataclass\n\n@dataclass\nclass Message:\n    role: str\n    content: str`, body: `List the fields with type hints. The decorator generates <code>__init__</code>, a readable <code>__repr__</code> and <code>__eq__</code>.`,
     set: {g1: fn('__init__', 20, -130, {size: 56}), g2: fn('__repr__', 110, -130, {size: 56}), g3: fn('__eq__', 200, -130, {size: 56}), l: link('C', 'g2', {dash: true})}},
    {title: 'Objects that print well', code: `m = Message("user", "Hi")\nprint(m)`, out: "Message(role='user', content='Hi')", body: `No more <code>&lt;Message object at 0x...&gt;</code>. Two messages with the same fields are also <code>==</code>.`,
     set: {o: shelf(80, 60, 230, {h: 90, alt: true, label: 'm'}), r1: box('"user"', 'str', 30, 60, {size: 46}), c1: box('"Hi"', 'str', 130, 60, {size: 46})}},
    {title: 'The list default trap', code: `@dataclass\nclass Session:\n    history: list = []`, out: 'ValueError: mutable default <class list> for field history is not allowed', body: `A shared list default would leak between sessions, so dataclasses refuse it outright.`,
     set: {o: null, r1: null, c1: null, C: {v: 'Session'}, e: note('C', 'ValueError', {bad: true, z: 40})}},
    {title: 'default_factory builds a fresh one', code: `from dataclasses import field\n\n@dataclass\nclass Session:\n    history: list = field(default_factory=list)`, body: `<code>default_factory=list</code> calls <code>list()</code> for every new object. Each session gets its own empty history.`,
     set: {e: null, a: shelf(-30, 90, 150, {h: 80, alt: true, label: 'a'}), b: shelf(150, 90, 150, {h: 80, alt: true, label: 'b'}), ah: box('[]', 'list', -30, 90, {size: 46}), bh: box('[]', 'list', 150, 90, {size: 46})}},
    {title: 'frozen=True locks it', code: `@dataclass(frozen=True)\nclass Config:\n    model: str\n\ncfg.model = "x"`, out: "FrozenInstanceError: cannot assign to field 'model'", body: `A frozen dataclass cannot change after creation, like a tuple with names. Use it for settings that must stay fixed.`,
     set: {a: null, b: null, ah: null, bh: null, C: {v: 'Config'}, lk: note('C', 'frozen', {z: 40})}},
  ]},

  30: {title: 'Named states', file: 'states.py', count: false, empty: 'no states yet', scenes: [
    {title: 'Strings let typos in', code: `status = "runing"\nif status == "running":\n    ...`, body: `One missing letter and the check is silently False. No error, just a confused agent.`,
     set: {s: box('"runing"', 'str', -120, 0, {glow: true}), w: note('s', 'typo, no error', {bad: true, z: 40})}},
    {title: 'An Enum is a fixed set of names', code: `from enum import Enum\n\nclass Status(Enum):\n    IDLE = "idle"\n    RUNNING = "running"\n    DONE = "done"`, body: `Each member is a single object with a name and a value. The list of allowed states is written once, in one place.`,
     set: {s: null, w: null, E: shelf(60, 0, 380, {h: 120, alt: true, label: 'class Status(Enum)', slots: 3, labels: ['IDLE', 'RUNNING', 'DONE']}), i: box('idle', 'enum', -67, 0, {size: 54}), r: box('running', 'enum', 60, 0, {size: 54}), d: box('done', 'enum', 187, 0, {size: 54})}},
    {title: 'Typos fail loudly', code: `Status.RUNIN`, out: 'AttributeError: RUNIN', body: `A misspelled member is an error at once, and your editor autocompletes the right one.`,
     set: {e: note('E', 'AttributeError', {bad: true, z: 60})}},
    {title: 'Compare members, not strings', code: `state = Status.RUNNING\nif state is Status.RUNNING:\n    keep_going()`, body: `Members are unique objects, so <code>is</code> works. The code reads like the state machine it is.`,
     set: {e: null, st: tag('r', {text: 'state'}), sc: scan('r')}},
    {title: 'Turn text from JSON into a member', code: `Status("done")`, out: '<Status.DONE: \'done\'>', body: `Calling the Enum with a value finds the member. An unknown value like <code>Status("finished")</code> raises ValueError, so bad data cannot sneak in.`,
     set: {sc: null, st: tag('d', {text: 'state'})}},
    {title: 'StrEnum plays well with JSON', code: `from enum import StrEnum\n\nclass Role(StrEnum):\n    USER = "user"\n\nRole.USER == "user"`, out: 'True', body: `A StrEnum member is also a str, so it compares equal to text and drops straight into JSON messages for the API.`,
     set: {E: {label: 'class Role(StrEnum)', slots: 1, labels: ['USER'], w: 160, x: 0}, i: null, r: null, d: null, st: null, u: box('"user"', 'enum', 0, 0, {size: 58, glow: true})}},
  ]},

  31: {title: 'The validation gate', file: 'args.py', count: false, empty: 'no model yet', scenes: [
    {title: 'LLM output is untrusted', code: `raw = {"city": "Pune", "days": "3"}`, body: `The model sent <code>days</code> as text, and next time it may forget <code>city</code> entirely. Tools must check their input.`,
     set: {in1: box('"Pune"', 'str', -190, -50, {size: 50}), in2: box('"3"', 'str', -190, 60, {size: 50})}},
    {title: 'Describe the shape once', code: `from pydantic import BaseModel\n\nclass WeatherArgs(BaseModel):\n    city: str\n    days: int = 1`, body: `A Pydantic model is a class with type hints. It acts as a gate: data goes in, a checked object comes out.`,
     set: {G: shelf(0, 0, 150, {h: 300, alt: true, label: 'WeatherArgs gate'})}},
    {title: 'Validate and convert', code: `args = WeatherArgs(**raw)\nargs.days`, out: '3', body: `Pydantic checks each field. The text <code>"3"</code> is converted to the int <code>3</code>. Your tool gets clean, typed values.`,
     set: {o1: box('"Pune"', 'str', 180, -50, {size: 50}), o2: box('3', 'int', 180, 60, {size: 50, glow: true}), l1: link('in2', 'o2', {dash: true})}},
    {title: 'Bad data is stopped', code: `WeatherArgs(days="ten")`, out: "ValidationError: 2 validation errors\ncity: Field required\ndays: Input should be a valid integer", body: `Missing or wrong fields raise one ValidationError that lists every problem. Send that message back to the LLM so it can fix the call.`,
     set: {o2: {glow: false}, in1: null, in2: {v: '"ten"'}, o1: null, o2: null, l1: null, e: note('G', 'ValidationError', {bad: true, z: 60})}},
    {title: 'The schema comes for free', code: `WeatherArgs.model_json_schema()`, out: "{'properties': {'city': {'type': 'string'}, 'days': {'type': 'integer', 'default': 1}}, 'required': ['city']}", body: `The same class produces the JSON schema you give the model as the tool definition. One source of truth for both sides.`,
     set: {e: null, in2: null, sch: box('schema', 'dict', 0, -170, {size: 54}), sc: scan('G')}},
    {title: 'Back to plain data', code: `args.model_dump()`, out: "{'city': 'Pune', 'days': 3}", body: `<code>model_dump()</code> turns the object back into a dict, ready for JSON or logging. Pydantic is the gate at every border of your agent.`,
     set: {sc: null, d: box('dict', 'dict', 180, 0, {size: 54}), l: link('G', 'd')}},
  ]},
};

export const games = {
  28: {title: 'Hint reader', show: 'card', q: 'What happens?', items: [
    card('def f(x: int) -> int:\n    return x * 2\nprint(f("ab"))', 'abab', ['abab', 'TypeError', '4'], 'abab', 'Python ignores hints at run time. A checker would flag it.'),
    P('Which tool reports a\nwrong type before\nthe code runs?', 'mypy', ['Python', 'mypy'], 'mypy', 'Static checkers like mypy and pyright read hints.'),
    card('def f(x: str | None = None): ...\nf()', 'works', ['works', 'TypeError'], 'ok', 'x may be None, and None is the default.'),
    P('What does list[str]\ndescribe?', 'a list of strings', ['a str', 'a list of strings', 'a dict'], 'list[str]', 'The part in brackets describes the items.'),
    P('Why do agent frameworks\nlove type hints?', 'they build tool schemas', ['speed', 'they build tool schemas'], 'schema', 'Hints become the JSON schema the model reads.'),
  ]},
  29: {title: 'Dataclass check', show: 'card', q: 'What happens?', items: [
    card('@dataclass\nclass M:\n    role: str\n    content: str\nprint(M("user", "Hi"))', "M(role='user', content='Hi')", ["M(role='user', content='Hi')", '<M object>', 'Error'], "M(role='user', content='Hi')", 'dataclass writes a readable __repr__.'),
    card('print(M("a", "b") == M("a", "b"))', 'True', ['True', 'False'], 'True', 'dataclass writes __eq__ that compares fields.'),
    card('@dataclass\nclass S:\n    h: list = []', 'ValueError', ['works', 'ValueError'], 'ValueError: mutable default', 'Use field(default_factory=list).'),
    card('@dataclass\nclass S:\n    h: list = field(default_factory=list)\na, b = S(), S()\na.h.append(1)\nprint(b.h)', '[]', ['[]', '[1]'], '[]', 'Each object got its own list.'),
    card('@dataclass(frozen=True)\nclass C:\n    m: str\nC("x").m = "y"', 'FrozenInstanceError', ['works', 'FrozenInstanceError'], 'FrozenInstanceError', 'Frozen dataclasses cannot change.'),
  ]},
  30: {title: 'Enum check', show: 'card', q: 'What happens?', items: [
    card('class S(Enum):\n    A = "a"\nprint(S("a"))', 'S.A', ['S.A', 'a', 'ValueError'], 'S.A', 'Calling the Enum with a value finds the member.'),
    card('print(S("b"))', 'ValueError', ['S.B', 'None', 'ValueError'], "ValueError: 'b' is not a valid S", 'Unknown values are rejected.'),
    card('print(S.A.value)', 'a', ['A', 'a', 'S.A'], 'a', '.value is the stored value; .name is "A".'),
    card('print(S.A == "a")', 'False', ['True', 'False'], 'False', 'A plain Enum member is not equal to its value.'),
    card('class R(StrEnum):\n    U = "user"\nprint(R.U == "user")', 'True', ['True', 'False'], 'True', 'StrEnum members are strings too.'),
    card('print([m.name for m in S])', "['A']", ["['A']", "['a']", '[S.A]'], "['A']", 'You can loop over all members.'),
  ]},
  31: {title: 'Validation gate', show: 'card', q: 'What happens?', items: [
    card('class A(BaseModel):\n    n: int\nprint(A(n="5").n)', '5', ['5', '"5"', 'ValidationError'], '5', 'Pydantic converts "5" to the int 5.'),
    card('A(n="ten")', 'ValidationError', ['works', 'ValidationError'], 'ValidationError', '"ten" cannot become an int.'),
    card('A()', 'ValidationError', ['n is 0', 'ValidationError'], 'ValidationError: n Field required', 'n has no default, so it is required.'),
    card('class B(BaseModel):\n    n: int = 1\nprint(B().n)', '1', ['1', 'None', 'ValidationError'], '1', 'Defaults fill missing fields.'),
    card('print(A(n=2).model_dump())', "{'n': 2}", ["{'n': 2}", 'A(n=2)', "'n=2'"], "{'n': 2}", 'model_dump returns a plain dict.'),
    P('Where does the tool\nschema for the LLM\ncome from?', 'model_json_schema()', ['model_dump()', 'model_json_schema()'], 'model_json_schema()', 'The model class produces its JSON schema.'),
  ]},
};

export const mountStory = (n, el) => story(el, stories[n]);
export const mountGame = (n, el) => game(el, games[n]);
