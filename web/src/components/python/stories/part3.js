/* eslint-disable */
// @ts-nocheck
/* Part III · Object-Oriented Programming (lessons 20-27): story and game data for the engine. */
import { story, game } from "./engine";

const box = (v, t, x, y, more) => ({kind: 'box', v, t, x, y, ...(more || {})});
const cls = (v, x, y, more) => box(v, 'class', x, y, {size: 84, ...(more || {})});
const fn = (v, x, y, more) => box(v, 'function', x, y, {size: 64, ...(more || {})});
const tag = (on, more) => ({kind: 'tag', on, ...(more || {})});
const shelf = (x, y, w, more) => ({kind: 'shelf', x, y, w, ...(more || {})});
const note = (on, text, more) => ({kind: 'note', on, text, ...(more || {})});
const link = (from, to, more) => ({kind: 'link', from, to, ...(more || {})});
const scan = on => ({kind: 'scan', on});
const card = (show, a, o, out, why, q) => ({show, code: show, a, o, out, why, ...(q ? {q} : {})});
const P = (...args) => ({...card(...args), prose: true});

export const stories = {
  20: {title: 'The student ID card printer', file: 'student.py', count: false, empty: 'no class yet', scenes: [
    {title: 'A class is a blueprint', code: `class Student:\n    def __init__(self, name, roll):\n        self.name = name\n        self.roll = roll`, body: `Joseph builds the student portal for his college in Kochi. <code>class</code> builds a blueprint. It describes what every student will hold and do, but it is not a student yet.`,
     set: {A: cls('Student', -170, 0), At: tag('A', {text: 'Student'})}},
    {title: 'Calling the class builds an object', code: `fathima = Student("Fathima", 21)`, body: `<code>Student("Fathima", 21)</code> makes a new empty object, then runs <code>__init__</code> on it to fill it in. The new object is an <b>instance</b> of Student.`,
     set: {T: shelf(80, -70, 230, {h: 110, alt: true, label: 'fathima (Student)'}), l1: link('A', 'T', {label: 'builds'}), tt: tag('T', {text: 'fathima'})}},
    {title: 'self is the new object', body: `Inside <code>__init__</code>, <code>self</code> is the object being built. <code>self.name = name</code> stores the name <b>on that object</b>.`,
     set: {n1: box('"Fathima"', 'str', 30, -70, {size: 50}), m1: box('21', 'int', 130, -70, {size: 50}), st: tag('T', {text: 'self'})}},
    {title: 'Each object has its own data', code: `joseph = Student("Joseph", 22)`, body: `A second call builds a second object with its own attributes. Changing <code>joseph.roll</code> never touches <code>fathima</code>.`,
     set: {st: null, C: shelf(80, 90, 230, {h: 110, label: 'joseph (Student)'}), l2: link('A', 'C'), ct: tag('C', {text: 'joseph'}), n2: box('"Joseph"', 'str', 30, 90, {size: 50}), m2: box('22', 'int', 130, 90, {size: 50})}},
    {title: 'Methods live on the class', code: `    def id_card(self):\n        return f"{self.roll} | {self.name}"`, body: `A method lives once, on the class. Every student uses the same code, but with their own data.`,
     set: {r: fn('id_card', -170, 130), lr: link('A', 'r', {dash: true})}},
    {title: 'obj.method() passes self for you', code: `fathima.id_card()\n# same as Student.id_card(fathima)`, out: "'21 | Fathima'", body: `Python puts the object in as <code>self</code>. AI agents, chat sessions and API clients are classes built in exactly this way.`,
     set: {sc: scan('T'), o: note('T', 'self = fathima', {z: 30})}},
  ]},

  21: {title: 'One college, many students', file: 'college.py', count: false, empty: 'no class yet', scenes: [
    {title: 'An attribute on the class', code: `class Student:\n    college = "Anna University"\n    def __init__(self, name):\n        self.name = name`, body: `<code>college</code> lives on the class, once. <code>name</code> is set on each object in <code>__init__</code>.`,
     set: {K: shelf(0, -100, 260, {h: 100, label: 'class Student'}), p: box('"Anna Univ"', 'str', 0, -100, {size: 52})}},
    {title: 'Objects look up to the class', code: `a, b = Student("Karthik"), Student("Harini")\na.college, b.college`, out: "('Anna University', 'Anna University')", body: `Neither student has their own <code>college</code>. Python checks the object first, then the class, and finds the shared value.`,
     set: {a: shelf(-130, 80, 180, {h: 90, alt: true, label: 'a'}), b: shelf(130, 80, 180, {h: 90, alt: true, label: 'b'}), an: box('"Karthik"', 'str', -130, 80, {size: 46}), bn: box('"Harini"', 'str', 130, 80, {size: 46}), l1: link('a', 'K', {dash: true}), l2: link('b', 'K', {dash: true})}},
    {title: 'Assigning on an object shadows', code: `b.college = "PSG Tech"`, body: `This does not change the class. It creates a new attribute on <code>b</code> only. Now <code>b</code> finds its own value first. <code>a</code> still sees "Anna University".`,
     set: {bp: box('"PSG Tech"', 'str', 175, 80, {size: 46, glow: true}), bn: {x: 95}, l2: null}},
    {title: 'Change the class, change everyone', code: `Student.college = "VIT"\na.college`, out: "'VIT'", body: `Assigning on the class changes the shared value for every object that has no value of its own.`,
     set: {bp: {glow: false}, p: {v: '"VIT"', glow: true}}},
    {title: 'The shared list trap', code: `class Room:\n    complaints = []          # shared by all!\nx, y = Room(), Room()\nx.complaints.append("fan")\ny.complaints`, out: "['fan']", body: `A mutable class attribute is one list for every object. One hostel room's complaint shows up in every room.`,
     set: {p: {glow: false}, h: box("['fan']", 'list', 80, -100, {size: 52, glow: true}), w: note('K', 'one list for all', {bad: true, z: 40})}},
    {title: 'Fix: create it in __init__', code: `    def __init__(self):\n        self.complaints = []`, body: `Make per-object data in <code>__init__</code>. Keep class attributes for constants. AI agents keep their own history the same way.`,
     set: {w: null, h: null, ah: box('[]', 'list', -85, 80, {size: 46}), bh: box("['fan']", 'list', 130, 80, {size: 40})}},
  ]},

  22: {title: 'Three kinds of methods', file: 'admission.py', count: false, empty: 'no class yet', scenes: [
    {title: 'Instance methods get self', code: `class Student:\n    def greet(self):\n        return "Welcome, " + self.name`, body: `A normal method receives the object as <code>self</code>, so it can read and change that student's data.`,
     set: {K: cls('Student', -170, -40), i: fn('greet(self)', 20, -110), a: shelf(170, 60, 160, {h: 90, alt: true, label: 'anjali'}), l1: link('i', 'a', {label: 'self'})}},
    {title: 'Class methods get cls', code: `    @classmethod\n    def from_form(cls, form):\n        return cls(form["name"], int(form["roll"]))`, body: `<code>@classmethod</code> passes the class itself as <code>cls</code>. It is perfect for another way to build an object, like from an admission form.`,
     set: {c: fn('from_form(cls)', 20, 20), l2: link('c', 'K', {label: 'cls', dash: true})}},
    {title: 'A second way to build', code: `s = Student.from_form({"name": "Anjali", "roll": "42"})`, body: `<code>from_form</code> reads the form and calls <code>cls(...)</code> to build a ready student. AI agents use <code>from_env()</code> the same way.`,
     set: {n: shelf(170, -110, 160, {h: 80, alt: true, label: 'new student'}), l3: link('c', 'n', {label: 'returns'})}},
    {title: 'Static methods get nothing', code: `    @staticmethod\n    def valid_roll(roll):\n        return 1 <= roll <= 120`, body: `<code>@staticmethod</code> gets no automatic first argument. It is a plain helper that lives inside the class because it belongs to the topic.`,
     set: {s: fn('valid_roll', 20, 140), sw: note('s', 'no self, no cls', {z: 30})}},
    {title: 'How to choose', body: `Needs the object's data? Instance method. Builds objects in another way? Class method. Just a helper? Static method, or a normal function.`,
     set: {sw: null, o1: note('i', 'object data', {z: 30}), o2: note('c', 'builds objects', {z: 30}), o3: note('s', 'pure helper', {z: 30})}},
  ]},

  23: {title: 'Inside a banking app', file: 'bank.py', count: false, empty: 'no class yet', scenes: [
    {title: 'Public attributes', code: `class BankAccount:\n    def __init__(self, owner, pin):\n        self.owner = owner`, body: `Names with no underscore are public. You are expected to read and use them.`,
     set: {C: shelf(0, 0, 440, {h: 260, alt: true, label: 'acc = BankAccount("Venkat", "4821")'}), m: box('owner', 'str', -140, -60)}},
    {title: 'One underscore: internal', code: `        self._server = "sbi-node-7"`, body: `<code>_server</code> is a promise between programmers: "internal, may change". Python does not block access. You can touch it, but updates may break your code.`,
     set: {c: box('_server', 'str', 0, -60), w: note('c', 'please do not touch', {z: 40})}},
    {title: 'Two underscores: name mangling', code: `        self.__pin = pin`, body: `<code>__pin</code> is renamed to <code>_BankAccount__pin</code> behind the scenes. It stops subclasses from overwriting it by accident.`,
     set: {w: null, k: box('__pin', 'str', 140, -60, {glow: true})}},
    {title: 'Accessing it fails, mostly', code: `acc.__pin`, out: "AttributeError: 'BankAccount' object has no attribute '__pin'", body: `From outside, <code>__pin</code> does not exist under that name.`,
     set: {k: {glow: false}, e: note('k', 'AttributeError', {bad: true, z: 40})}},
    {title: 'The real name still works', code: `acc._BankAccount__pin`, out: "'4821'", body: `The renamed attribute is still there. Mangling is not security. Never store real secrets in attributes and assume they are hidden.`,
     set: {e: null, k: {v: '_BankAccount__pin', size: 76}, sc: scan('k')}},
    {title: 'Dunder names are different', code: `__init__, __repr__, __len__`, body: `Names with two underscores on <b>both</b> sides are special methods Python calls itself. They are never mangled. AI SDKs use the same conventions, so this helps you read their code.`,
     set: {sc: null, d: box('__init__', 'function', 0, 80), r: box('__repr__', 'function', 140, 80)}},
  ]},

  24: {title: 'The attendance tracker', file: 'attendance.py', count: false, empty: 'no class yet', scenes: [
    {title: 'A value that depends on others', code: `class Student:\n    def __init__(self, attended, held):\n        self.attended = attended\n        self.held = held`, body: `Harini's attendance is classes attended divided by classes held. It should always be right, even after she attends more classes.`,
     set: {U: shelf(0, 0, 420, {h: 220, alt: true, label: 's = Student(54, 70)'}), p: box('54', 'int', -130, -40), c: box('70', 'int', 0, -40)}},
    {title: '@property computes on read', code: `    @property\n    def attendance(self):\n        return round(100 * self.attended / self.held, 1)`, body: `<code>@property</code> turns a method into something you read like an attribute, with no brackets. Python runs it every time.`,
     set: {t: box('attendance', 'function', 130, -40, {glow: true}), l1: link('p', 't'), l2: link('c', 't')}},
    {title: 'Always up to date', code: `s.attended += 3\ns.attendance`, out: '81.4', body: `There is no stored percentage to forget to update. Read it and it is computed fresh: 57 out of 70.`,
     set: {t: {glow: false}, p: {v: '57', glow: true}, o: note('t', '81.4%', {z: 30})}},
    {title: 'A setter can check values', code: `    @marks.setter\n    def marks(self, value):\n        if not 0 <= value <= 100:\n            raise ValueError("0 to 100")\n        self._marks = value`, body: `A setter runs when someone assigns the attribute. Here it rejects marks outside 0 to 100.`,
     set: {p: {glow: false}, o: null, tp: box('_marks', 'int', -60, 80, {size: 70}), g: fn('setter', 110, 80)}},
    {title: 'Bad values never get in', code: `exam.marks = 120`, out: 'ValueError: 0 to 100', body: `The assignment looks normal, but the setter raises an error. The stored value stays valid.`,
     set: {e: note('g', 'ValueError', {bad: true, z: 40})}},
    {title: 'No setter means read-only', code: `s.attendance = 100`, out: "AttributeError: property 'attendance' of 'Student' object has no setter", body: `A property with only a getter cannot be assigned. Nobody can fake 100% attendance. AI usage trackers compute token totals the same way.`,
     set: {e: null, r: note('t', 'read-only', {z: 30})}},
  ]},

  25: {title: 'The food cart object', file: 'cart.py', count: false, empty: 'no class yet', scenes: [
    {title: 'A plain object prints badly', code: `print(Order("Masala Dosa", 2))`, out: '<__main__.Order object at 0x7f3a...>', body: `Python does not know how to show your object, so it prints a memory address. Dunder methods teach it.`,
     set: {A: shelf(0, 0, 440, {h: 260, alt: true, label: 'class Order'}), o: note('A', '<Order object at 0x7f...>', {bad: true, z: 60})}},
    {title: '__repr__ and __str__', code: `    def __str__(self):\n        return f"{self.qty} x {self.dish}"`, out: '2 x Masala Dosa', body: `<code>print</code> calls <code>__str__</code>. Lists and logs call <code>__repr__</code>. Make them show what you need.`,
     set: {o: note('A', '2 x Masala Dosa', {z: 60}), r: fn('__str__', -150, -60)}},
    {title: '__len__ makes len() work', code: `    def __len__(self):\n        return len(self.items)`, body: `Now <code>len(cart)</code> gives the number of items. A cart with <code>__len__</code> is also falsy when it is empty.`,
     set: {l: fn('__len__', -50, -60)}},
    {title: '__eq__ defines ==', code: `    def __eq__(self, other):\n        return sorted(self.items) == sorted(other.items)`, body: `Without it, <code>==</code> checks if they are the same object. With it, two carts with the same dishes are equal.`,
     set: {e: fn('__eq__', 50, -60)}},
    {title: '__call__ makes it callable', code: `    def __call__(self, item):\n        self.items.append(item)\n\ncart("Vada")`, body: `An object with <code>__call__</code> can be called like a function. Many AI tool and model classes work this way.`,
     set: {c: fn('__call__', 150, -60, {glow: true})}},
    {title: 'Python calls them for you', body: `You rarely call dunders directly. Python calls <code>__len__</code> for <code>len(x)</code>, <code>__eq__</code> for <code>==</code>, and <code>__call__</code> for <code>x()</code>. That is how your classes plug into the language.`,
     set: {c: {glow: false}, o: null, p1: note('l', 'len(x)', {z: 30}), p2: note('e', 'x == y', {z: 30}), p3: note('c', 'x()', {z: 30}), p4: note('r', 'print(x)', {z: 30})}},
  ]},

  26: {title: 'Building a food app from parts', file: 'food_app.py', count: false, empty: 'no classes yet', scenes: [
    {title: 'Inheritance: is a', code: `class Ticket:\n    def price(self): ...\n\nclass TatkalTicket(Ticket):\n    def price(self): ...   # adds Rs 400`, body: `A subclass <b>is a</b> kind of its parent. A tatkal ticket is a ticket. It gets every method and can replace some.`,
     set: {B: cls('Ticket', -150, -80), R: cls('Tatkal', -150, 90), l1: link('R', 'B', {label: 'is a'})}},
    {title: 'Deep trees get fragile', body: `Add a ladies quota ticket, a senior citizen ticket, a tatkal senior ladies ticket... Every mix needs a new subclass, and a change at the top ripples down.`,
     set: {X: cls('Senior...', -40, 150, {size: 60}), Y: cls('Ladies...', -260, 150, {size: 60}), l2: link('X', 'R', {dash: true}), l3: link('Y', 'R', {dash: true}), w: note('R', 'too many subclasses', {bad: true, z: 40})}},
    {title: 'Composition: has a', code: `class FoodApp:\n    def __init__(self, cart, payment, delivery):\n        self.cart = cart\n        self.payment = payment\n        self.delivery = delivery`, body: `A food app <b>has a</b> cart, a payment method and a delivery partner. Each part is its own small object.`,
     set: {B: null, R: null, X: null, Y: null, l1: null, l2: null, l3: null, w: null,
      A: shelf(60, 0, 300, {h: 280, alt: true, label: 'app'}), llm: box('UPI', 'class', -10, -70, {size: 64}), mem: box('Cart', 'class', 120, -70, {size: 64}), tl: box('Delivery', 'class', 50, 70, {size: 64})}},
    {title: 'Swap a part in one line', code: `app = FoodApp(cart=Cart(), payment=Card(), delivery=Delivery())`, body: `Want card payment? Pass a different object. No new subclass, no change to FoodApp. Tests can pass a fake payment.`,
     set: {llm: {v: 'Card', glow: true}}},
    {title: 'Delegate the work', code: `    def checkout(self):\n        return self.payment.pay(self.cart.total())`, body: `The app asks its parts to do their jobs. Each part can be understood and tested alone.`,
     set: {llm: {glow: false}, d1: link('mem', 'llm', {label: 'total'})}},
    {title: 'Rule of thumb', body: `Prefer "has a" for building apps and AI agents: an agent has a model, memory and tools. Use "is a" when a framework asks you to subclass its base class.`,
     set: {r: note('A', 'has a > is a', {z: 60})}},
  ]},

  27: {title: 'One interface, many apps', file: 'payments.py', count: false, empty: 'no interface yet', scenes: [
    {title: 'A contract for every payment app', code: `from abc import ABC, abstractmethod\n\nclass PaymentApp(ABC):\n    @abstractmethod\n    def pay(self, amount: int) -> str: ...`, body: `An abstract base class lists the methods every payment app must have. It cannot be used on its own.`,
     set: {I: shelf(0, -100, 300, {h: 100, label: 'PaymentApp (ABC)'}), g: fn('pay()', 0, -100)}},
    {title: 'Real apps fill it in', code: `class QuickPay(PaymentApp):\n    def pay(self, amount): ...\n\nclass BharatWallet(PaymentApp):\n    def pay(self, amount): ...`, body: `Each app implements <code>pay</code> its own way. These two app names are made up for the lesson.`,
     set: {o: box('QuickPay', 'class', -130, 80, {size: 70}), l: box('BharatWallet', 'class', 130, 80, {size: 70}), lo: link('o', 'I', {label: 'implements'}), ll: link('l', 'I', {label: 'implements'})}},
    {title: 'Code against the contract', code: `def checkout(app: PaymentApp, amount):\n    return app.pay(amount)`, body: `<code>checkout</code> works with any payment app. Switching apps is one changed line.`,
     set: {sc: scan('l')}},
    {title: 'Missing methods are caught early', code: `class Broken(PaymentApp):\n    pass\n\nBroken()`, out: "TypeError: Can't instantiate abstract class Broken without an implementation for abstract method 'pay'", body: `If a subclass forgets <code>pay</code>, Python refuses to build it. The error appears at once, not halfway through a payment.`,
     set: {sc: null, b: box('Broken', 'class', 0, 80, {size: 60}), e: note('b', 'TypeError', {bad: true, z: 40})}},
    {title: 'Protocol: no inheritance needed', code: `from typing import Protocol\n\nclass Payer(Protocol):\n    def pay(self, amount: int) -> str: ...`, body: `A Protocol checks shape, not family. Any class with a matching <code>pay</code> method fits, even one from a library you cannot change.`,
     set: {b: null, e: null, lo: {dash: true, label: 'fits'}, ll: {dash: true, label: 'fits'}, I: {label: 'Payer (Protocol)'}}},
    {title: 'Which to use', body: `Use an ABC when you own the classes and want errors at creation time. Use a Protocol when you only care that an object has the right methods. AI agents swap OpenAI, Anthropic or Ollama behind one interface like this.`,
     set: {n: note('I', 'ABC: family · Protocol: shape', {z: 60})}},
  ]},
};

export const games = {
  20: {title: 'Object builder', show: 'card', q: 'What does it print?', items: [
    card('class Student:\n    def __init__(self, name):\n        self.name = name\nprint(Student("Divya").name)', 'Divya', ['Divya', 'None', 'Error'], 'Divya', '__init__ stored name on the new object.'),
    card('class S:\n    def __init__(self, cgpa): self.cgpa = cgpa\na, b = S(8.1), S(9.2)\na.cgpa = 10\nprint(b.cgpa)', '9.2', ['10', '9.2', '8.1'], '9.2', 'Each object has its own cgpa.'),
    card('class Bot:\n    def hi():\n        return "Vanakkam"\nBot().hi()', 'TypeError', ['Vanakkam', 'TypeError', 'None'], 'TypeError: Bot.hi() takes 0 positional arguments but 1 was given', 'Python passes the object as self, but hi has no slot for it.'),
    card('class Cart:\n    def __init__(self): self.items = []\n    def add(self, i): self.items.append(i)\nc = Cart(); c.add("Dosa"); c.add("Vada")\nprint(len(c.items))', '2', ['2', '1', '0'], '2', 'Both calls appended to the same cart.'),
    card('class Ticket: pass\nprint(type(Ticket()).__name__)', 'Ticket', ['Ticket', 'object', 'class'], 'Ticket', 'The object is an instance of Ticket.'),
  ]},
  21: {title: 'Attribute lookup', show: 'card', q: 'What does it print?', items: [
    card('class S:\n    fee = 50000\nx, y = S(), S()\nx.fee = 25000\nprint(S.fee, y.fee)', '50000 50000', ['25000 25000', '50000 50000', '50000 25000'], '50000 50000', 'x.fee = 25000 made an attribute on x only.'),
    card('class S:\n    college = "PSG"\nS.college = "VIT"\nprint(S().college)', 'VIT', ['PSG', 'VIT', 'Error'], 'VIT', 'The object finds the class value.'),
    card('class Room:\n    complaints = []\nRoom().complaints.append("fan")\nprint(Room().complaints)', "['fan']", ['[]', "['fan']", 'Error'], "['fan']", 'The class list is shared by every room.'),
    card('class Room:\n    def __init__(self):\n        self.complaints = []\nRoom().complaints.append("fan")\nprint(Room().complaints)', '[]', ['[]', "['fan']", 'Error'], '[]', 'Each room builds its own list.'),
    card('class S:\n    college = "PSG"\ns = S()\nprint("college" in vars(s))', 'False', ['True', 'False'], 'False', 'The object has no own college. It reads it from the class.'),
  ]},
  22: {title: 'Method sorter', show: 'card', prose: true, choices: ['instance', 'class', 'static'], q: 'Which kind of method fits best?', items: [
    card('Build a student from an\nadmission form dict', 'class', null, '@classmethod', 'Another way to build objects needs cls.'),
    card('Add a dish to this\ncustomer\'s cart', 'instance', null, 'def add(self, dish)', 'It changes one object\'s data, so it needs self.'),
    card('Check if a roll number\nis between 1 and 120', 'static', null, '@staticmethod', 'A pure helper that needs no object or class.'),
    card('Return this ticket\'s\nseat number', 'instance', null, 'def seat_no(self)', 'It reads one object\'s data.'),
    card('Load an agent config\nfrom settings', 'class', null, '@classmethod', 'Another way to build objects: cls(**config).'),
    card('Work out an auto fare\nfrom km', 'static', null, '@staticmethod', 'It only looks at the number passed in.'),
  ]},
  23: {title: 'Underscore check', show: 'card', q: 'What happens?', items: [
    card('class A:\n    def __init__(self):\n        self._server = "node-7"\nprint(A()._server)', 'node-7', ['node-7', 'AttributeError', 'None'], 'node-7', 'One underscore is only a convention. Access still works.'),
    card('class A:\n    def __init__(self):\n        self.__pin = "4821"\nprint(A().__pin)', 'AttributeError', ['4821', 'AttributeError', 'None'], 'AttributeError', 'The name was mangled to _A__pin.'),
    card('print(A()._A__pin)', '4821', ['4821', 'AttributeError', 'None'], '4821', 'The mangled name is still reachable.'),
    P('Is __init__ mangled?', 'no', ['yes', 'no'], 'no', 'Names with two underscores on both sides are never mangled.'),
    P('Should you store a real\nbank PIN in self.__pin\nto keep it secret?', 'no', ['yes', 'no'], 'no', 'Mangling is not security. Keep secrets out of the code.'),
  ]},
  24: {title: 'Property tester', show: 'card', q: 'What happens?', items: [
    card('class S:\n    def __init__(s): s.a, s.h = 54, 72\n    @property\n    def pct(s): return 100 * s.a // s.h\nprint(S().pct)', '75', ['75', 'function', 'Error'], '75', 'Read it like an attribute. Python runs the method.'),
    card('s = S()\nprint(s.pct())', 'TypeError', ['75', 'TypeError', 'None'], "TypeError: 'int' object is not callable", 's.pct is already 75. Then 75() fails.'),
    card('s = S()\ns.a = 72\nprint(s.pct)', '100', ['75', '100', '72'], '100', 'Computed fresh on every read.'),
    card('s = S()\ns.pct = 100', 'AttributeError', ['works', 'AttributeError', 'None'], "AttributeError: property 'pct' of 'S' object has no setter", 'No setter, so it is read-only. No faking attendance.'),
    card('# setter raises if marks > 100\nexam.marks = 120', 'ValueError', ['works', 'ValueError', 'None'], 'ValueError', 'The setter checks every assignment.'),
  ]},
  25: {title: 'Dunder detective', show: 'card', q: 'What happens?', items: [
    card('class Cart:\n    def __init__(s): s.items = ["Dosa", "Vada"]\n    def __len__(s): return len(s.items)\nprint(len(Cart()))', '2', ['2', 'TypeError', '0'], '2', 'len() calls __len__.'),
    card('class Order: pass\nprint(Order() == Order())', 'False', ['True', 'False'], 'False', 'Without __eq__, == checks if they are the same object.'),
    card('class O:\n    def __repr__(s): return "Order!"\nprint([O()])', '[Order!]', ['[Order!]', '[<O object>]', 'Order!'], '[Order!]', 'Lists show their items with __repr__.'),
    card('class Fare:\n    def __call__(s, km): return 30 + 15 * km\nf = Fare()\nprint(f(4))', '90', ['90', 'TypeError', '4'], '90', '__call__ makes the object callable.'),
    card('class Cart:\n    def __len__(s): return 0\nprint(bool(Cart()))', 'False', ['True', 'False'], 'False', 'With no __bool__, Python uses __len__: 0 is falsy.'),
  ]},
  26: {title: 'Is a or has a?', show: 'card', prose: true, choices: ['is a', 'has a'], q: 'Inheritance (is a) or composition (has a)?', items: [
    card('A food app and\nits cart', 'has a', null, 'self.cart = Cart()', 'A food app has a cart. A cart is not a kind of app.'),
    card('A TatkalTicket and\na Ticket', 'is a', null, 'class TatkalTicket(Ticket)', 'A tatkal ticket really is a kind of ticket.'),
    card('An AI agent and its\nmodel client', 'has a', null, 'self.llm = client', 'Pass the client in so you can swap providers.'),
    card('A Pydantic model for\na booking form', 'is a', null, 'class Booking(BaseModel)', 'Pydantic models subclass BaseModel.'),
    card('An app that needs\ncaching and logging', 'has a', null, 'App(cache=..., logger=...)', 'Combine parts instead of a subclass for every mix.'),
  ]},
  27: {title: 'Interface check', show: 'card', q: 'What happens?', items: [
    card('class Pay(ABC):\n    @abstractmethod\n    def pay(s, amt): ...\nPay()', 'TypeError', ['works', 'TypeError', 'None'], "TypeError: Can't instantiate abstract class Pay", 'An ABC with abstract methods cannot be built.'),
    card('class QuickPay(Pay):\n    def pay(s, amt): return "paid"\nprint(QuickPay().pay(250))', 'paid', ['paid', 'TypeError', 'None'], 'paid', 'All abstract methods are implemented.'),
    card('class Half(Pay):\n    pass\nHalf()', 'TypeError', ['works', 'TypeError'], 'TypeError', 'pay is still missing.'),
    P('A class with a matching\npay() method but no\ninheritance fits a…', 'Protocol', ['ABC', 'Protocol'], 'Protocol', 'Protocols check the shape, not the parent class.'),
    P('def checkout(app: Payer)\nWhich apps can you pass?', 'any that fit', ['only one app', 'any that fit'], 'any that fit', 'Code against the interface, swap apps freely.'),
  ]},
};

export const mountStory = (n, el) => story(el, stories[n]);
export const mountGame = (n, el) => game(el, games[n]);
