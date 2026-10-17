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
  20: {title: 'The agent factory', file: 'agent.py', count: false, empty: 'no class yet', scenes: [
    {title: 'A class is a blueprint', code: `class Agent:\n    def __init__(self, name, model="gpt-4o-mini"):\n        self.name = name\n        self.model = model`, body: `<code>class</code> builds a blueprint object. It describes what every agent will hold and do, but it is not an agent yet.`,
     set: {A: cls('Agent', -170, 0), At: tag('A', {text: 'Agent'})}},
    {title: 'Calling the class builds an object', code: `tutor = Agent("Tutor")`, body: `<code>Agent("Tutor")</code> makes a new empty object, then runs <code>__init__</code> on it to fill it in. The new object is an <b>instance</b> of Agent.`,
     set: {T: shelf(80, -70, 230, {h: 110, alt: true, label: 'tutor (Agent object)'}), l1: link('A', 'T', {label: 'builds'}), tt: tag('T', {text: 'tutor'})}},
    {title: 'self is the new object', body: `Inside <code>__init__</code>, <code>self</code> is the object being built. <code>self.name = name</code> stores the name <b>on that object</b>.`,
     set: {n1: box('"Tutor"', 'str', 30, -70, {size: 50}), m1: box('"gpt-4o..."', 'str', 130, -70, {size: 50}), st: tag('T', {text: 'self'})}},
    {title: 'Each object has its own data', code: `coder = Agent("Coder", "gpt-4o")`, body: `A second call builds a second object with its own attributes. Changing <code>coder.model</code> never touches <code>tutor</code>.`,
     set: {st: null, C: shelf(80, 90, 230, {h: 110, label: 'coder (Agent object)'}), l2: link('A', 'C'), ct: tag('C', {text: 'coder'}), n2: box('"Coder"', 'str', 30, 90, {size: 50}), m2: box('"gpt-4o"', 'str', 130, 90, {size: 50})}},
    {title: 'Methods are functions on the class', code: `    def run(self, q):\n        return f"{self.name} ({self.model}) answers: {q}"`, body: `A method lives once, on the class. Every instance uses the same code, but with its own data.`,
     set: {r: fn('run', -170, 130), lr: link('A', 'r', {dash: true})}},
    {title: 'obj.method() passes self for you', code: `tutor.run("What is RAG?")\n# same as Agent.run(tutor, "What is RAG?")`, out: "'Tutor (gpt-4o-mini) answers: What is RAG?'", body: `Python puts the object in front of the call as <code>self</code>. Forget <code>self</code> in the definition and you get a TypeError.`,
     set: {sc: scan('T'), o: note('T', 'self = tutor', {z: 30})}},
  ]},

  21: {title: 'Shared or personal?', file: 'attrs.py', count: false, empty: 'no class yet', scenes: [
    {title: 'An attribute on the class', code: `class Agent:\n    provider = "openai"          # class attribute\n    def __init__(self, name):\n        self.name = name         # instance attribute`, body: `<code>provider</code> lives on the class, once. <code>name</code> is set on each object in <code>__init__</code>.`,
     set: {K: shelf(0, -100, 260, {h: 100, label: 'class Agent'}), p: box('"openai"', 'str', 0, -100, {size: 52})}},
    {title: 'Instances look up to the class', code: `a, b = Agent("A"), Agent("B")\na.provider, b.provider`, out: "('openai', 'openai')", body: `Neither object has its own <code>provider</code>. Python checks the object first, then the class, and finds the shared value.`,
     set: {a: shelf(-130, 80, 180, {h: 90, alt: true, label: 'a'}), b: shelf(130, 80, 180, {h: 90, alt: true, label: 'b'}), an: box('"A"', 'str', -130, 80, {size: 46}), bn: box('"B"', 'str', 130, 80, {size: 46}), l1: link('a', 'K', {dash: true}), l2: link('b', 'K', {dash: true})}},
    {title: 'Assigning on an object shadows', code: `b.provider = "ollama"`, body: `This does not change the class. It creates a new attribute on <code>b</code> only. Now <code>b</code> finds its own value first. <code>a</code> still sees "openai".`,
     set: {bp: box('"ollama"', 'str', 175, 80, {size: 46, glow: true}), bn: {x: 95}, l2: null}},
    {title: 'Change the class, change everyone', code: `Agent.provider = "anthropic"\na.provider`, out: "'anthropic'", body: `Assigning on the class changes the shared value for every object that has no value of its own.`,
     set: {bp: {glow: false}, p: {v: '"anthropic"', glow: true}}},
    {title: 'The shared list trap', code: `class Bot:\n    history = []          # shared by all!\nx, y = Bot(), Bot()\nx.history.append("hi")\ny.history`, out: "['hi']", body: `A mutable class attribute is one list for every object. One user's messages appear in another's history.`,
     set: {p: {glow: false}, h: box("['hi']", 'list', 80, -100, {size: 52, glow: true}), w: note('K', 'one list for all', {bad: true, z: 40})}},
    {title: 'Fix: create it in __init__', code: `    def __init__(self):\n        self.history = []`, body: `Make per-object data in <code>__init__</code>. Keep class attributes for constants and counters that really are shared.`,
     set: {w: null, h: null, ah: box('[]', 'list', -85, 80, {size: 46}), bh: box("['hi']", 'list', 130, 80, {size: 40})}},
  ]},

  22: {title: 'Three kinds of methods', file: 'methods.py', count: false, empty: 'no class yet', scenes: [
    {title: 'Instance methods get self', code: `class Agent:\n    def ask(self, q):\n        return self.model + ": " + q`, body: `A normal method receives the object as <code>self</code>, so it can read and change that object's data.`,
     set: {K: cls('Agent', -170, -40), i: fn('ask(self)', 20, -110), a: shelf(170, 60, 160, {h: 90, alt: true, label: 'agent'}), l1: link('i', 'a', {label: 'self'})}},
    {title: 'Class methods get cls', code: `    @classmethod\n    def from_env(cls):\n        return cls(os.environ["MODEL"])`, body: `<code>@classmethod</code> passes the class itself as <code>cls</code>. It is perfect for alternative constructors.`,
     set: {c: fn('from_env(cls)', 20, 20), l2: link('c', 'K', {label: 'cls', dash: true})}},
    {title: 'A second way to build', code: `agent = Agent.from_env()`, body: `<code>from_env</code> reads the settings and calls <code>cls(...)</code> to build a ready agent. Subclasses get the right type automatically, because <code>cls</code> is whichever class you called it on.`,
     set: {n: shelf(170, -110, 160, {h: 80, alt: true, label: 'new agent'}), l3: link('c', 'n', {label: 'returns'})}},
    {title: 'Static methods get nothing', code: `    @staticmethod\n    def count_words(text):\n        return len(text.split())`, body: `<code>@staticmethod</code> gets no automatic first argument. It is a plain function that lives inside the class because it belongs to the topic.`,
     set: {s: fn('count_words', 20, 140), sw: note('s', 'no self, no cls', {z: 30})}},
    {title: 'How to choose', body: `Needs the object's data? Instance method. Builds or configures the class? Class method. Just a helper? Static method, or a normal function in the module.`,
     set: {sw: null, o1: note('i', 'object data', {z: 30}), o2: note('c', 'builds objects', {z: 30}), o3: note('s', 'pure helper', {z: 30})}},
  ]},

  23: {title: 'Inside an SDK client', file: 'client.py', count: false, empty: 'no class yet', scenes: [
    {title: 'Public attributes', code: `class LLMClient:\n    def __init__(self, key):\n        self.model = "gpt-4o"`, body: `Names with no underscore are the public API. You are expected to read and use them.`,
     set: {C: shelf(0, 0, 440, {h: 260, alt: true, label: 'client = LLMClient(key)'}), m: box('model', 'str', -140, -60)}},
    {title: 'One underscore: internal', code: `        self._client = HttpSession()`, body: `<code>_client</code> is a promise between programmers: "internal, may change". Python does not block access. You can touch it, but SDK updates may break your code.`,
     set: {c: box('_client', 'class', 0, -60), w: note('c', 'please do not touch', {z: 40})}},
    {title: 'Two underscores: name mangling', code: `        self.__key = key`, body: `<code>__key</code> is renamed to <code>_LLMClient__key</code> behind the scenes. It is not security. It stops subclasses from overwriting the attribute by accident.`,
     set: {w: null, k: box('__key', 'str', 140, -60, {glow: true})}},
    {title: 'Accessing it fails, mostly', code: `client.__key`, out: "AttributeError: 'LLMClient' object has no attribute '__key'", body: `From outside, <code>__key</code> does not exist under that name.`,
     set: {k: {glow: false}, e: note('k', 'AttributeError', {bad: true, z: 40})}},
    {title: 'The real name still works', code: `client._LLMClient__key`, out: "'sk-...'", body: `The renamed attribute is still there. Never put secrets in attributes and assume they are hidden.`,
     set: {e: null, k: {v: '_LLMClient__key', size: 76}, sc: scan('k')}},
    {title: 'Dunder names are different', code: `__init__, __repr__, __len__`, body: `Names with two underscores on <b>both</b> sides are special methods Python calls itself. They are never mangled.`,
     set: {sc: null, d: box('__init__', 'function', 0, 80), r: box('__repr__', 'function', 140, 80)}},
  ]},

  24: {title: 'Smart attributes', file: 'usage.py', count: false, empty: 'no class yet', scenes: [
    {title: 'A value that depends on others', code: `class Usage:\n    def __init__(self, prompt, completion):\n        self.prompt = prompt\n        self.completion = completion`, body: `Token usage has a prompt count and a completion count. The total should always be their sum, even after they change.`,
     set: {U: shelf(0, 0, 420, {h: 220, alt: true, label: 'u = Usage(42, 18)'}), p: box('42', 'int', -130, -40), c: box('18', 'int', 0, -40)}},
    {title: '@property computes on read', code: `    @property\n    def total_tokens(self):\n        return self.prompt + self.completion`, body: `<code>@property</code> turns a method into something you read like an attribute, with no parentheses. Python runs it every time.`,
     set: {t: box('total', 'function', 130, -40, {glow: true}), l1: link('p', 't'), l2: link('c', 't')}},
    {title: 'Always up to date', code: `u.completion = 30\nu.total_tokens`, out: '72', body: `There is no stored total to forget to update. Read it and it is computed fresh.`,
     set: {t: {glow: false}, c: {v: '30', glow: true}, o: note('t', '72', {z: 30})}},
    {title: 'A setter can validate', code: `    @temperature.setter\n    def temperature(self, v):\n        if not 0 <= v <= 2:\n            raise ValueError("0 to 2")\n        self._temperature = v`, body: `A setter runs when someone assigns the attribute. Here it rejects bad temperatures before they reach the API.`,
     set: {c: {glow: false}, o: null, tp: box('_temperature', 'float', -60, 80, {size: 70}), g: fn('setter', 110, 80)}},
    {title: 'Bad values never get in', code: `agent.temperature = 5`, out: 'ValueError: 0 to 2', body: `The assignment looks normal, but the setter raises an error. The stored value stays valid.`,
     set: {e: note('g', 'ValueError', {bad: true, z: 40})}},
    {title: 'No setter means read-only', code: `u.total_tokens = 100`, out: "AttributeError: property 'total_tokens' of 'Usage' object has no setter", body: `A property with only a getter cannot be assigned. Good for values that must always be computed.`,
     set: {e: null, r: note('t', 'read-only', {z: 30})}},
  ]},

  25: {title: 'Teaching objects Python', file: 'dunder.py', count: false, empty: 'no class yet', scenes: [
    {title: 'A plain object prints badly', code: `print(Agent("gpt-4o"))`, out: '<__main__.Agent object at 0x7f3a...>', body: `Python does not know how to show your object, so it prints a memory address. Dunder methods teach it.`,
     set: {A: shelf(0, 0, 440, {h: 260, alt: true, label: 'class Agent'}), o: note('A', '<Agent object at 0x7f...>', {bad: true, z: 60})}},
    {title: '__repr__ for print and debugging', code: `    def __repr__(self):\n        return f"Agent(model={self.model!r})"`, out: "Agent(model='gpt-4o')", body: `<code>print</code>, the REPL and lists of objects all call <code>__repr__</code>. Make it show what you need when debugging.`,
     set: {o: note('A', "Agent(model='gpt-4o')", {z: 60}), r: fn('__repr__', -150, -60)}},
    {title: '__len__ makes len() work', code: `    def __len__(self):\n        return len(self.history)`, body: `Now <code>len(memory)</code> gives the number of messages. An object with <code>__len__</code> is also falsy when its length is 0.`,
     set: {l: fn('__len__', -50, -60)}},
    {title: '__eq__ defines ==', code: `    def __eq__(self, other):\n        return self.model == other.model`, body: `Without it, <code>==</code> compares identity, like <code>is</code>. With it, two agents with the same model are equal.`,
     set: {e: fn('__eq__', 50, -60)}},
    {title: '__call__ makes it callable', code: `    def __call__(self, q):\n        return self.ask(q)\n\nagent("Hi")`, body: `An object with <code>__call__</code> can be called like a function. Many tool and model classes in frameworks work this way.`,
     set: {c: fn('__call__', 150, -60, {glow: true})}},
    {title: 'Python calls them for you', body: `You rarely call dunders directly. Python calls <code>__len__</code> for <code>len(x)</code>, <code>__eq__</code> for <code>==</code>, and <code>__call__</code> for <code>x()</code>. That is how your classes plug into the language.`,
     set: {c: {glow: false}, o: null, p1: note('l', 'len(x)', {z: 30}), p2: note('e', 'x == y', {z: 30}), p3: note('c', 'x()', {z: 30}), p4: note('r', 'print(x)', {z: 30})}},
  ]},

  26: {title: 'Building an agent from parts', file: 'compose.py', count: false, empty: 'no classes yet', scenes: [
    {title: 'Inheritance: is a', code: `class BaseAgent:\n    def run(self, q): ...\n\nclass ResearchAgent(BaseAgent):\n    def run(self, q): ...   # override`, body: `A subclass <b>is a</b> kind of its parent. It gets every method and can replace some. Good for small, stable families.`,
     set: {B: cls('BaseAgent', -150, -80), R: cls('Research', -150, 90), l1: link('R', 'B', {label: 'is a'})}},
    {title: 'Deep trees get fragile', body: `Add a cached agent, a streaming agent, a cached streaming research agent... Every combination needs a new subclass, and a change at the top ripples down.`,
     set: {X: cls('Cached...', -40, 150, {size: 60}), Y: cls('Stream...', -260, 150, {size: 60}), l2: link('X', 'R', {dash: true}), l3: link('Y', 'R', {dash: true}), w: note('R', 'too many subclasses', {bad: true, z: 40})}},
    {title: 'Composition: has a', code: `class Agent:\n    def __init__(self, llm, memory, tools):\n        self.llm = llm\n        self.memory = memory\n        self.tools = tools`, body: `An agent <b>has a</b> model client, a memory and some tools. Each part is its own small object.`,
     set: {B: null, R: null, X: null, Y: null, l1: null, l2: null, l3: null, w: null,
      A: shelf(60, 0, 300, {h: 280, alt: true, label: 'agent'}), llm: box('OpenAIClient', 'class', -10, -70, {size: 64}), mem: box('Memory', 'class', 120, -70, {size: 64}), tl: box('Tools', 'class', 50, 70, {size: 64})}},
    {title: 'Swap a part in one line', code: `agent = Agent(llm=OllamaClient(), memory=Memory(), tools=tools)`, body: `Want a local model? Pass a different client. No new subclass, no change to Agent. Tests can pass a fake client.`,
     set: {llm: {v: 'OllamaClient', glow: true}}},
    {title: 'Delegate the work', code: `    def ask(self, q):\n        self.memory.add(q)\n        return self.llm.complete(self.memory.messages)`, body: `The agent asks its parts to do their jobs. Each part can be understood and tested alone.`,
     set: {llm: {glow: false}, d1: link('mem', 'llm', {label: 'messages'})}},
    {title: 'Rule of thumb', body: `Prefer "has a" for building agents. Use "is a" when a framework asks you to subclass its base class, like a LangChain tool or a Pydantic model.`,
     set: {r: note('A', 'has a > is a', {z: 60})}},
  ]},

  27: {title: 'One interface, many models', file: 'models.py', count: false, empty: 'no interface yet', scenes: [
    {title: 'A contract for every model', code: `from abc import ABC, abstractmethod\n\nclass ChatModel(ABC):\n    @abstractmethod\n    def generate(self, prompt: str) -> str: ...`, body: `An abstract base class lists the methods every model must have. It cannot be used on its own.`,
     set: {I: shelf(0, -100, 300, {h: 100, label: 'ChatModel (ABC)'}), g: fn('generate()', 0, -100)}},
    {title: 'Concrete models fill it in', code: `class OpenAIModel(ChatModel):\n    def generate(self, prompt): ...\n\nclass OllamaModel(ChatModel):\n    def generate(self, prompt): ...`, body: `Each provider implements <code>generate</code> its own way: an HTTP call to OpenAI, or to a local Ollama server.`,
     set: {o: box('OpenAI', 'class', -130, 80, {size: 70}), l: box('Ollama', 'class', 130, 80, {size: 70}), lo: link('o', 'I', {label: 'implements'}), ll: link('l', 'I', {label: 'implements'})}},
    {title: 'Code against the contract', code: `def answer(model: ChatModel, q):\n    return model.generate(q)`, body: `<code>answer</code> works with any ChatModel. Switching providers is one changed line where you build the model.`,
     set: {sc: scan('l')}},
    {title: 'Missing methods are caught early', code: `class Broken(ChatModel):\n    pass\n\nBroken()`, out: "TypeError: Can't instantiate abstract class Broken without an implementation for abstract method 'generate'", body: `If a subclass forgets <code>generate</code>, Python refuses to build it. The error appears at once, not deep inside an agent run.`,
     set: {sc: null, b: box('Broken', 'class', 0, 80, {size: 60}), e: note('b', 'TypeError', {bad: true, z: 40})}},
    {title: 'Protocol: no inheritance needed', code: `from typing import Protocol\n\nclass ChatModel(Protocol):\n    def generate(self, prompt: str) -> str: ...`, body: `A Protocol checks shape, not family. Any class with a matching <code>generate</code> method fits, even one from a library you cannot change. This is duck typing your type checker understands.`,
     set: {b: null, e: null, lo: {dash: true, label: 'fits'}, ll: {dash: true, label: 'fits'}, I: {label: 'ChatModel (Protocol)'}}},
    {title: 'Which to use', body: `Use an ABC when you own the classes and want errors at creation time. Use a Protocol when you only care that an object has the right methods.`,
     set: {n: note('I', 'ABC: family · Protocol: shape', {z: 60})}},
  ]},
};

export const games = {
  20: {title: 'Object builder', show: 'card', q: 'What does it print?', items: [
    card('class A:\n    def __init__(self, x):\n        self.x = x\nprint(A(5).x)', '5', ['5', 'None', 'Error'], '5', '__init__ stored x on the new object.'),
    card('a, b = A(1), A(2)\na.x = 10\nprint(b.x)', '2', ['10', '2', '1'], '2', 'Each object has its own x.'),
    card('class Bot:\n    def hi():\n        return "hi"\nBot().hi()', 'TypeError', ['hi', 'TypeError', 'None'], 'TypeError: Bot.hi() takes 0 positional arguments but 1 was given', 'Python passes the object as self, but hi has no slot for it.'),
    card('class S:\n    def __init__(self):\n        self.h = []\n    def add(self, m):\n        self.h.append(m)\ns = S(); s.add("a"); s.add("b")\nprint(len(s.h))', '2', ['2', '1', '0'], '2', 'Both calls appended to the same object.'),
    card('class A: pass\nprint(type(A()).__name__)', 'A', ['A', 'object', 'class'], 'A', 'The object is an instance of A.'),
  ]},
  21: {title: 'Attribute lookup', show: 'card', q: 'What does it print?', items: [
    card('class A:\n    n = 0\nx, y = A(), A()\nx.n = 5\nprint(A.n, y.n)', '0 0', ['5 5', '0 0', '0 5'], '0 0', 'x.n = 5 made an attribute on x only.'),
    card('class A:\n    n = 0\nA.n = 3\nprint(A().n)', '3', ['0', '3', 'Error'], '3', 'The object finds the class value.'),
    card('class B:\n    items = []\nB().items.append(1)\nprint(B().items)', '[1]', ['[]', '[1]', 'Error'], '[1]', 'The class list is shared by every object.'),
    card('class B:\n    def __init__(self):\n        self.items = []\nB().items.append(1)\nprint(B().items)', '[]', ['[]', '[1]', 'Error'], '[]', 'Each object builds its own list.'),
    card('class A:\n    kind = "agent"\na = A()\nprint("kind" in vars(a))', 'False', ['True', 'False'], 'False', 'The object has no own kind. It reads it from the class.'),
  ]},
  22: {title: 'Method sorter', show: 'card', prose: true, choices: ['instance', 'class', 'static'], q: 'Which kind of method fits best?', items: [
    card('Build an agent from\nenvironment variables', 'class', null, '@classmethod', 'An alternative constructor needs cls.'),
    card('Add a message to this\nagent\'s history', 'instance', null, 'def add(self, msg)', 'It changes one object\'s data, so it needs self.'),
    card('Count the words in\nany string', 'static', null, '@staticmethod', 'A pure helper that needs no object or class.'),
    card('Return the agent\'s\ncurrent model name', 'instance', null, 'def model_name(self)', 'It reads one object\'s data.'),
    card('Load an agent config\nfrom a YAML file', 'class', null, '@classmethod', 'Another way to build objects: cls(**config).'),
    card('Check that a temperature\nis between 0 and 2', 'static', null, '@staticmethod', 'It only looks at the number passed in.'),
  ]},
  23: {title: 'Underscore check', show: 'card', q: 'What happens?', items: [
    card('class C:\n    def __init__(self):\n        self._x = 1\nprint(C()._x)', '1', ['1', 'AttributeError', 'None'], '1', 'One underscore is only a convention. Access still works.'),
    card('class C:\n    def __init__(self):\n        self.__x = 1\nprint(C().__x)', 'AttributeError', ['1', 'AttributeError', 'None'], 'AttributeError', 'The name was mangled to _C__x.'),
    card('print(C()._C__x)', '1', ['1', 'AttributeError', 'None'], '1', 'The mangled name is still reachable.'),
    P('Is __init__ mangled?', 'no', ['yes', 'no'], 'no', 'Names with two underscores on both sides are never mangled.'),
    P('Should you store an\nAPI key in self.__key\nto keep it secret?', 'no', ['yes', 'no'], 'no', 'Mangling is not security. Keep secrets in env vars.'),
  ]},
  24: {title: 'Property tester', show: 'card', q: 'What happens?', items: [
    card('class U:\n    def __init__(s): s.a, s.b = 2, 3\n    @property\n    def total(s): return s.a + s.b\nprint(U().total)', '5', ['5', 'function', 'Error'], '5', 'Read it like an attribute. Python runs the method.'),
    card('u = U()\nprint(u.total())', 'TypeError', ['5', 'TypeError', 'None'], "TypeError: 'int' object is not callable", 'u.total is already 5. Then 5() fails.'),
    card('u = U()\nu.a = 10\nprint(u.total)', '13', ['5', '13', '10'], '13', 'Computed fresh on every read.'),
    card('u = U()\nu.total = 1', 'AttributeError', ['works', 'AttributeError', 'None'], "AttributeError: property 'total' of 'U' object has no setter", 'No setter, so it is read-only.'),
    card('# setter raises if v > 2\nagent.temperature = 5', 'ValueError', ['works', 'ValueError', 'None'], 'ValueError', 'The setter validates every assignment.'),
  ]},
  25: {title: 'Dunder detective', show: 'card', q: 'What happens?', items: [
    card('class M:\n    def __init__(s): s.h = [1, 2]\n    def __len__(s): return len(s.h)\nprint(len(M()))', '2', ['2', 'TypeError', '0'], '2', 'len() calls __len__.'),
    card('class A: pass\nprint(A() == A())', 'False', ['True', 'False'], 'False', 'Without __eq__, == compares identity.'),
    card('class A:\n    def __repr__(s): return "A!"\nprint([A()])', '[A!]', ['[A!]', '[<A object>]', 'A!'], '[A!]', 'Lists show their items with __repr__.'),
    card('class T:\n    def __call__(s, x): return x * 2\nt = T()\nprint(t(4))', '8', ['8', 'TypeError', '4'], '8', '__call__ makes the object callable.'),
    card('class E:\n    def __len__(s): return 0\nprint(bool(E()))', 'False', ['True', 'False'], 'False', 'With no __bool__, Python uses __len__: 0 is falsy.'),
  ]},
  26: {title: 'Is a or has a?', show: 'card', prose: true, choices: ['is a', 'has a'], q: 'Inheritance (is a) or composition (has a)?', items: [
    card('An Agent and its\nmemory store', 'has a', null, 'self.memory = Memory()', 'An agent has a memory. Memory is not a kind of agent.'),
    card('Your tool class and\nLangChain BaseTool', 'is a', null, 'class MyTool(BaseTool)', 'The framework asks you to subclass its base class.'),
    card('An Agent and its\nLLM client', 'has a', null, 'self.llm = client', 'Pass the client in so you can swap providers.'),
    card('A Pydantic model for\ntool arguments', 'is a', null, 'class Args(BaseModel)', 'Pydantic models subclass BaseModel.'),
    card('An agent that needs\ncaching and logging', 'has a', null, 'Agent(cache=..., logger=...)', 'Combine parts instead of building a subclass for every mix.'),
  ]},
  27: {title: 'Interface check', show: 'card', q: 'What happens?', items: [
    card('class M(ABC):\n    @abstractmethod\n    def gen(s): ...\nM()', 'TypeError', ['works', 'TypeError', 'None'], "TypeError: Can't instantiate abstract class M", 'An ABC with abstract methods cannot be built.'),
    card('class Ok(M):\n    def gen(s): return "hi"\nprint(Ok().gen())', 'hi', ['hi', 'TypeError', 'None'], 'hi', 'All abstract methods are implemented.'),
    card('class Half(M):\n    pass\nHalf()', 'TypeError', ['works', 'TypeError'], 'TypeError', 'gen is still missing.'),
    P('A class with a matching\ngenerate() method but\nno inheritance fits a…', 'Protocol', ['ABC', 'Protocol'], 'Protocol', 'Protocols check the shape, not the parent class.'),
    P('def answer(m: ChatModel)\nWhich models can you pass?', 'any that fit', ['only OpenAI', 'any that fit'], 'any that fit', 'Code against the interface, swap providers freely.'),
  ]},
};

export const mountStory = (n, el) => story(el, stories[n]);
export const mountGame = (n, el) => game(el, games[n]);
