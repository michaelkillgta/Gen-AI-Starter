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
  28: {title: 'Labels on the auto fare function', file: 'fare.py', count: false, empty: 'no function yet', scenes: [
    {title: 'A function with no hints', code: `def auto_fare(km, night=False):\n    ...`, body: `Sai writes an auto fare calculator in Bengaluru. Nothing says what <code>km</code> or <code>night</code> should be. A teammate, the editor and an AI framework all have to guess.`,
     set: {m: fn('auto_fare', 0, -20), s1: shelf(-170, 90, 130, {h: 70, label: 'km: ?'}), s2: shelf(170, 90, 130, {h: 70, label: 'night: ?'})}},
    {title: 'Hints label each slot', code: `def auto_fare(km: float, night: bool = False) -> int:`, body: `<code>: float</code> and <code>: bool</code> say what each argument should be. <code>-&gt; int</code> says what comes back. They are labels for people and tools.`,
     set: {s1: {label: 'km: float'}, s2: {label: 'night: bool'}, r: note('m', '-> int', {z: 30})}},
    {title: 'Python does not enforce them', code: `auto_fare("four", "yes")   # runs until the maths fails`, body: `When the code runs, Python ignores hints. The wrong types go straight in. Hints are a promise, not a guard.`,
     set: {a: box('"four"', 'str', -170, 90, {size: 48, glow: true}), b: box('"yes"', 'str', 170, 90, {size: 48, glow: true})}},
    {title: 'Checkers read them before you run', code: `$ mypy fare.py\nerror: Argument 1 has incompatible type "str"; expected "float"`, body: `mypy, pyright and your editor read the hints and flag the bug while you type, long before a customer sees a wrong fare.`,
     set: {a: {glow: false}, b: {glow: false}, e: note('s1', 'expected float', {bad: true, z: 40})}},
    {title: 'AI frameworks build schemas from them', code: `{"km": {"type": "number"},\n "night": {"type": "boolean", "default": false}}`, body: `AI frameworks read your hints and build the JSON description the model sees. Good hints mean the model sends the right kinds of values.`,
     set: {e: null, a: null, b: null, sc: scan('m'), sch: box('schema', 'dict', 0, -160, {size: 54}), l: link('m', 'sch', {dash: true})}},
    {title: 'Richer hints', code: `def under_budget(menu: dict[str, int], coupon: str | None = None) -> list[str]:`, body: `<code>dict[str, int]</code> describes keys and values. <code>X | None</code> means "X or nothing". Use it for anything that may be missing, like a coupon.`,
     set: {sc: null, s2: {label: 'coupon: str | None'}, s1: {label: 'menu: dict[str, int]'}, r: note('m', '-> list[str]', {z: 30})}},
  ]},

  29: {title: 'The order factory', file: 'orders.py', count: false, empty: 'no class yet', scenes: [
    {title: 'Boilerplate classes', code: `class Order:\n    def __init__(self, dish, qty):\n        self.dish = dish\n        self.qty = qty`, body: `Many classes only hold data, like a food order. Writing <code>__init__</code>, <code>__repr__</code> and <code>__eq__</code> by hand for each one is slow and easy to get wrong.`,
     set: {C: cls('Order', -170, -40)}},
    {title: '@dataclass writes them for you', code: `from dataclasses import dataclass\n\n@dataclass\nclass Order:\n    dish: str\n    qty: int`, body: `List the fields with type hints. The decorator generates <code>__init__</code>, a readable <code>__repr__</code> and <code>__eq__</code>.`,
     set: {g1: fn('__init__', 20, -130, {size: 56}), g2: fn('__repr__', 110, -130, {size: 56}), g3: fn('__eq__', 200, -130, {size: 56}), l: link('C', 'g2', {dash: true})}},
    {title: 'Objects that print well', code: `o = Order("Ghee Roast", 2)\nprint(o)`, out: "Order(dish='Ghee Roast', qty=2)", body: `No more <code>&lt;Order object at 0x...&gt;</code>. Two orders with the same fields are also <code>==</code>.`,
     set: {o: shelf(80, 60, 230, {h: 90, alt: true, label: 'o'}), r1: box('"Ghee Roast"', 'str', 30, 60, {size: 46}), c1: box('2', 'int', 130, 60, {size: 46})}},
    {title: 'The shared cart trap', code: `@dataclass\nclass Cart:\n    items: list = []`, out: 'ValueError: mutable default <class list> for field items is not allowed', body: `A shared list default would mix up customers' carts, so dataclasses refuse it outright.`,
     set: {o: null, r1: null, c1: null, C: {v: 'Cart'}, e: note('C', 'ValueError', {bad: true, z: 40})}},
    {title: 'default_factory builds a fresh one', code: `from dataclasses import field\n\n@dataclass\nclass Cart:\n    items: list = field(default_factory=list)`, body: `<code>default_factory=list</code> calls <code>list()</code> for every new cart. Arjun and Meera each get their own.`,
     set: {e: null, a: shelf(-30, 90, 150, {h: 80, alt: true, label: 'arjun'}), b: shelf(150, 90, 150, {h: 80, alt: true, label: 'meera'}), ah: box('[]', 'list', -30, 90, {size: 46}), bh: box('[]', 'list', 150, 90, {size: 46})}},
    {title: 'frozen=True locks it', code: `@dataclass(frozen=True)\nclass Train:\n    number: str\n\nt.number = "x"`, out: "FrozenInstanceError: cannot assign to field 'number'", body: `A frozen dataclass cannot change after it is made. AI agents keep their settings in frozen dataclasses so nothing changes them by accident.`,
     set: {a: null, b: null, ah: null, bh: null, C: {v: 'Train'}, lk: note('C', 'frozen', {z: 40})}},
  ]},

  30: {title: 'Tracking a food order', file: 'status.py', count: false, empty: 'no states yet', scenes: [
    {title: 'Strings let typos in', code: `status = "deliverd"\nif status == "delivered":\n    ...`, body: `One missing letter and the check is silently False. No error, just a customer waiting for an order that already arrived.`,
     set: {s: box('"deliverd"', 'str', -120, 0, {glow: true}), w: note('s', 'typo, no error', {bad: true, z: 40})}},
    {title: 'An Enum is a fixed set of names', code: `from enum import Enum\n\nclass OrderStatus(Enum):\n    PLACED = "placed"\n    COOKING = "cooking"\n    DELIVERED = "delivered"`, body: `Each member is a single object with a name and a value. The allowed states are written once, in one place.`,
     set: {s: null, w: null, E: shelf(60, 0, 380, {h: 120, alt: true, label: 'class OrderStatus(Enum)', slots: 3, labels: ['PLACED', 'COOKING', 'DELIVERED']}), i: box('placed', 'enum', -67, 0, {size: 54}), r: box('cooking', 'enum', 60, 0, {size: 54}), d: box('delivered', 'enum', 187, 0, {size: 54})}},
    {title: 'Typos fail loudly', code: `OrderStatus.DELIVERD`, out: 'AttributeError: DELIVERD', body: `A misspelled member is an error at once, and your editor autocompletes the right one.`,
     set: {e: note('E', 'AttributeError', {bad: true, z: 60})}},
    {title: 'Compare members, not strings', code: `status = OrderStatus.COOKING\nif status is OrderStatus.COOKING:\n    print("Your food is being made")`, body: `Members are unique objects, so <code>is</code> works. The code reads like the order tracker it is.`,
     set: {e: null, st: tag('r', {text: 'status'}), sc: scan('r')}},
    {title: 'Turn text into a member', code: `OrderStatus("delivered")`, out: "<OrderStatus.DELIVERED: 'delivered'>", body: `Calling the Enum with a value finds the member. An unknown value like <code>OrderStatus("lost")</code> raises ValueError, so bad data cannot sneak in.`,
     set: {sc: null, st: tag('d', {text: 'status'})}},
    {title: 'str Enum works with JSON', code: `class Role(str, Enum):\n    USER = "user"\n\nRole.USER == "user"`, out: 'True', body: `A <code>str</code> Enum member is also a string, so it compares equal to text and drops straight into the JSON sent to an AI model.`,
     set: {E: {label: 'class Role(str, Enum)', slots: 1, labels: ['USER'], w: 160, x: 0}, i: null, r: null, d: null, st: null, u: box('"user"', 'enum', 0, 0, {size: 58, glow: true})}},
  ]},

  31: {title: 'Checking a train booking form', file: 'booking.py', count: false, empty: 'no model yet', scenes: [
    {title: 'Form data is untrusted', code: `form = {"name": "Lakshmi", "age": "21"}`, body: `A train booking form sends <code>age</code> as text, and next time someone may skip their name entirely. You must check the input before you book.`,
     set: {in1: box('"Lakshmi"', 'str', -190, -50, {size: 50}), in2: box('"21"', 'str', -190, 60, {size: 50})}},
    {title: 'Describe the shape once', code: `from pydantic import BaseModel\n\nclass Booking(BaseModel):\n    name: str\n    age: int`, body: `A Pydantic model is a class with type hints. It acts as a gate: data goes in, a checked object comes out.`,
     set: {G: shelf(0, 0, 150, {h: 300, alt: true, label: 'Booking gate'})}},
    {title: 'Check and convert', code: `b = Booking(**form)\nb.age`, out: '21', body: `Pydantic checks each field. The text <code>"21"</code> is converted to the number <code>21</code>. Your code gets clean, typed values.`,
     set: {o1: box('"Lakshmi"', 'str', 180, -50, {size: 50}), o2: box('21', 'int', 180, 60, {size: 50, glow: true}), l1: link('in2', 'o2', {dash: true})}},
    {title: 'Bad data is stopped', code: `Booking(age="twenty")`, out: "ValidationError: 2 validation errors\nname: Field required\nage: Input should be a valid integer", body: `Missing or wrong fields raise one ValidationError that lists every problem. Show it to the user, or send it back to an AI model so it can fix its answer.`,
     set: {o2: null, in1: null, in2: {v: '"twenty"'}, o1: null, l1: null, e: note('G', 'ValidationError', {bad: true, z: 60})}},
    {title: 'The schema comes for free', code: `Booking.model_json_schema()`, out: "{'properties': {'name': {...}, 'age': {...}}, 'required': ['name', 'age']}", body: `The same class produces a JSON schema. AI agents give this schema to the model as the tool definition: one source of truth for both sides.`,
     set: {e: null, in2: null, sch: box('schema', 'dict', 0, -170, {size: 54}), sc: scan('G')}},
    {title: 'Back to plain data', code: `b.model_dump()`, out: "{'name': 'Lakshmi', 'age': 21}", body: `<code>model_dump()</code> turns the object back into a dict, ready for JSON or saving. Pydantic is the gate at every border of your app.`,
     set: {sc: null, d: box('dict', 'dict', 180, 0, {size: 54}), l: link('G', 'd')}},
  ]},
};

export const games = {
  28: {title: 'Hint reader', show: 'card', q: 'What happens?', items: [
    card('def double(n: int) -> int:\n    return n * 2\nprint(double("Ha"))', 'HaHa', ['HaHa', 'TypeError', '4'], 'HaHa', 'Python ignores hints at run time. A checker would flag it.'),
    P('Which tool reports a\nwrong type before\nthe code runs?', 'mypy', ['Python', 'mypy'], 'mypy', 'Static checkers like mypy and pyright read hints.'),
    card('def order(coupon: str | None = None): ...\norder()', 'works', ['works', 'TypeError'], 'ok', 'coupon may be None, and None is the default.'),
    P('What does list[str]\ndescribe?', 'a list of strings', ['a str', 'a list of strings', 'a dict'], 'list[str]', 'The part in brackets describes the items.'),
    P('Why do AI agent frameworks\nlove type hints?', 'they build tool schemas', ['speed', 'they build tool schemas'], 'schema', 'Hints become the JSON schema the model reads.'),
  ]},
  29: {title: 'Dataclass check', show: 'card', q: 'What happens?', items: [
    card('@dataclass\nclass Order:\n    dish: str\n    qty: int\nprint(Order("Dosa", 2))', "Order(dish='Dosa', qty=2)", ["Order(dish='Dosa', qty=2)", '<Order object>', 'Error'], "Order(dish='Dosa', qty=2)", 'dataclass writes a readable __repr__.'),
    card('print(Order("Dosa", 2) == Order("Dosa", 2))', 'True', ['True', 'False'], 'True', 'dataclass writes __eq__ that compares fields.'),
    card('@dataclass\nclass Cart:\n    items: list = []', 'ValueError', ['works', 'ValueError'], 'ValueError: mutable default', 'Use field(default_factory=list).'),
    card('@dataclass\nclass Cart:\n    items: list = field(default_factory=list)\na, b = Cart(), Cart()\na.items.append("Vada")\nprint(b.items)', '[]', ['[]', "['Vada']"], '[]', 'Each cart got its own list.'),
    card('@dataclass(frozen=True)\nclass Train:\n    no: str\nTrain("12007").no = "1"', 'FrozenInstanceError', ['works', 'FrozenInstanceError'], 'FrozenInstanceError', 'Frozen dataclasses cannot change.'),
  ]},
  30: {title: 'Enum check', show: 'card', q: 'What happens?', items: [
    card('class S(Enum):\n    PLACED = "placed"\nprint(S("placed"))', 'S.PLACED', ['S.PLACED', 'placed', 'ValueError'], 'S.PLACED', 'Calling the Enum with a value finds the member.'),
    card('print(S("lost"))', 'ValueError', ['S.LOST', 'None', 'ValueError'], "ValueError: 'lost' is not a valid S", 'Unknown values are rejected.'),
    card('print(S.PLACED.value)', 'placed', ['PLACED', 'placed', 'S.PLACED'], 'placed', '.value is the stored value; .name is "PLACED".'),
    card('print(S.PLACED == "placed")', 'False', ['True', 'False'], 'False', 'A plain Enum member is not equal to its value.'),
    card('class R(str, Enum):\n    USER = "user"\nprint(R.USER == "user")', 'True', ['True', 'False'], 'True', 'A str Enum member is a string too.'),
    card('class B(Enum):\n    LOWER = 1\n    UPPER = 2\nprint([b.name for b in B])', "['LOWER', 'UPPER']", ["['LOWER', 'UPPER']", '[1, 2]', '[B.LOWER, B.UPPER]'], "['LOWER', 'UPPER']", 'You can loop over all members.'),
  ]},
  31: {title: 'Validation gate', show: 'card', q: 'What happens?', items: [
    card('class B(BaseModel):\n    age: int\nprint(B(age="21").age)', '21', ['21', '"21"', 'ValidationError'], '21', 'Pydantic converts "21" to the int 21.'),
    card('B(age="twenty")', 'ValidationError', ['works', 'ValidationError'], 'ValidationError', '"twenty" cannot become an int.'),
    card('B()', 'ValidationError', ['age is 0', 'ValidationError'], 'ValidationError: age Field required', 'age has no default, so it is required.'),
    card('class T(BaseModel):\n    berth: str = "lower"\nprint(T().berth)', 'lower', ['lower', 'None', 'ValidationError'], 'lower', 'Defaults fill missing fields.'),
    card('print(B(age=22).model_dump())', "{'age': 22}", ["{'age': 22}", 'B(age=22)', "'age=22'"], "{'age': 22}", 'model_dump returns a plain dict.'),
    P('Where does the tool\nschema for an AI model\ncome from?', 'model_json_schema()', ['model_dump()', 'model_json_schema()'], 'model_json_schema()', 'The model class produces its JSON schema.'),
  ]},
};

export const mountStory = (n, el) => story(el, stories[n]);
export const mountGame = (n, el) => game(el, games[n]);
