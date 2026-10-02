"""Adds (or updates) Uma's post "RAG-Anything: RAG That Can Understand More Than Text" in api/seed/posts.json,
with her 5 visuals in web/public/blog/rag-anything/ (converted to WebP by hand on 1 Oct 2026).

Text: written from Uma's draft in plain prose. RAG-Anything facts checked on 1 Oct 2026 against its README,
GitHub and PyPI: by HKUDS, MIT licence, built on LightRAG (multimodal knowledge graph), parsers MinerU,
Docling or PaddleOCR, handles PDFs, Office files, images, tables and equations; latest release 1.4.1
(2 Sept 2026), last commit 15 Sept 2026. It doesn't take video or audio as input, so our experiment feeds it
frames we extract ourselves through insert_content_list (from the README).
Run from the repo root:  python scripts/seed-post-rag-anything.py
"""
import io
import json
import os

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
POSTS = os.path.join(ROOT, "api", "seed", "posts.json")
IMG = "/blog/rag-anything"
SIZE = (1672, 941)
DOCLING_POST = "/blog/docling-pdf-is-not-just-text"
MINERU_POST = "/blog/mineru-document-parsing-for-beginners"
COLBERT_POST = "/blog/colbert-when-semantic-search-isnt-enough"
REPO = "https://github.com/HKUDS/RAG-Anything"
PYPI = "https://pypi.org/project/raganything/"
LIGHTRAG = "https://github.com/HKUDS/LightRAG"
# Uma's own recording of the experiment (title "Rag-Anything", 5:55).
VIDEO = "7KQZ4VNqlS4"
VIDEO_URL = f"https://youtu.be/{VIDEO}"
# Uma's notebook for the experiment.
COLAB = "https://colab.research.google.com/drive/1ubJ0UWTxWMLflmLO1bCOx6o5ZToIRRkz"


def p(*lines):
    return [{"type": "paragraph", "text": t} for t in lines]


def h(text, anchor=None):
    return {"type": "heading", "text": text, "id": anchor}


def img(name, alt, caption=None, size=SIZE):
    return {"type": "image", "src": f"{IMG}/{name}.webp", "alt": alt, "width": size[0], "height": size[1],
            "caption": caption}


def ul(*items):
    return {"type": "list", "ordered": False, "items": list(items)}


def flow(*items, repeat=None):
    return {"type": "flow", "items": list(items), "repeat": repeat}


def code(text, language="text"):
    return {"type": "code", "language": language, "code": text}


def box(label, text):
    return {"type": "callout", "label": label, "text": text}


def takeaway(text):
    return box("Takeaway", text)


def pair(*items):
    return {"type": "pair", "items": [{"label": a, "text": b} for a, b in items]}


def cta(label, href):
    return {"type": "cta", "label": label, "href": href}


BIG_IDEA = ("RAG-Anything doesn't cram everything into ==one giant embedding==. Each type of content is ==understood "
            "its own way==, then connected into ==one searchable knowledge base==.")

COVER_ALT = (
    "Text-only RAG versus multimodal documents. Left, the traditional way: PDF, text extraction, embeddings, search, "
    "LLM, and what gets lost: details in images, table structure, diagrams and video content, so answers are based "
    "only on text. Right, the real world: documents mix text, images, tables, diagrams and video, so a multimodal "
    "pipeline processes each type (for example with Docling or MinerU), retrieves across all of them and lets an LLM "
    "answer using everything, not just text."
)

BODY = [
    *p("You probably know the basic RAG flow by now:"),
    flow("PDF", "Text", "Embeddings", "Search", "LLM"),
    *p("Pretty simple. But what if your information ==isn't just text==? What if it's a PDF with charts, a "
       "screenshot, a table, a lecture video or a voice note?",
       "That's where things get messy, and where RAG-Anything gets interesting.",
       f"▶ [Watch my 6-minute RAG-Anything demo](#video-{VIDEO})"),
    cta("Try it yourself: open the Colab notebook", COLAB),
    box("The one idea to remember", BIG_IDEA),

    h("A PDF and a video walk into a RAG app", "part-1"),
    *p("Imagine you upload two files:"),
    code("RAG.pdf                 the PDF explains RAG\nRAG-explanation.mp4     the video demonstrates it"),
    *p("Then you ask: ==\"Does the video actually demonstrate what the PDF explains?\"==",
       "A text-only RAG app is stuck. It can read the PDF, but the video is invisible to it. To answer, your app has "
       "to understand ==two different kinds of content== and connect them."),
    takeaway("Real questions often span more than one kind of content."),

    h("The old way: a lot of wires", "part-2"),
    *p("Without a framework, you build a separate path for every type of content:"),
    ul("**PDF:** a parser like Docling or MinerU",
       "**Video:** frame extraction",
       "**Audio:** a speech-to-text model",
       "**Images:** a vision model",
       "**Everything:** embeddings, a vector database, a retriever and an LLM"),
    *p("That's ==a lot of wires==. You become the person connecting every tool to every other tool, and fixing it "
       "every time one of them changes."),
    takeaway("Multimodal RAG by hand works, but the plumbing is the hard part."),

    h("RAG-Anything's idea", "part-3"),
    img("orchestration",
        "RAG-Anything as an orchestration layer that connects different tools and data types for multimodal RAG. "
        "Inputs: PDFs and documents, images, tables, video, audio and other formats. It uses tools for document "
        "extraction (Docling, MinerU), image understanding, table parsing, audio processing and chunking, and runs "
        "three steps: understand each type, retrieve across all of them, and answer.",
        "In the real library, the inputs are documents, images, tables and equations. We handle video ourselves, "
        "in Part 4."),
    *p(f"[RAG-Anything]({REPO}) is an open-source framework from the HKUDS lab at the University of Hong Kong. "
       "Instead of you wiring every tool together, it runs the whole multimodal pipeline: it ==parses the "
       "document==, ==understands each part== (text, images, tables, equations) and ==connects them== into one "
       "knowledge base you can ask questions about.",
       f"It's built on [LightRAG]({LIGHTRAG}), which stores knowledge as a graph: things and how they relate. For "
       "parsing it plugs in tools you may already know, [MinerU]" f"({MINERU_POST}) or [Docling]({DOCLING_POST}). It "
       "reads PDFs, Office files and images."),
    box("Not an \"OpenAI wrapper\"", "RAG-Anything isn't just a thin layer over one AI model. It's the ==glue== "
                                    "that coordinates the parser, the vision model, the text model and the "
                                    "knowledge base, and you choose which models to plug in."),
    *p(f"Status, checked on 1 Oct 2026: it's MIT licensed and actively updated. The latest release on [PyPI]({PYPI}) "
       "is 1.4.1, from 2 September 2026."),
    code("pip install 'raganything[all]'", "bash"),
    takeaway("RAG-Anything is the glue between the tools, so you don't have to be."),

    h("What about video?", "part-4"),
    img("video-to-knowledge",
        "From video to searchable knowledge in five steps: 1, a 10-minute video; 2, find important moments from "
        "scene changes or slides; 3, pick three frames, at 2:15 (what RAG is), 5:40 (chunking) and 8:30 "
        "(retrieval); 4, a vision-language model looks at each frame, reads any text and understands what's "
        "happening; 5, each frame becomes a text description stored for RAG. Don't send thousands of frames: a "
        "10-minute video can have 18,000 or more.",
        "Three frames, three descriptions. That's the whole trick."),
    *p("One honest note first: RAG-Anything ==doesn't take video files directly==. So we do the video part "
       "ourselves, and it's simpler than it sounds.",
       "Do we send the whole video to an expensive video AI? No. We ==pick a few important moments==, grab one "
       "frame from each, and ask a vision model: \"What is happening here?\" Each answer becomes a short "
       "description, and those descriptions are what we search."),
    flow("Video", "Find important moments", "3 frames", "Vision model", "Searchable descriptions"),
    box("Why only 3 frames?", "A 10-minute video has thousands of frames. At 30 frames a second, that's 18,000. We're "
                              "learning, not ==burning money==, so 3 useful frames are plenty. Smarter frame "
                              "picking can come later."),
    takeaway("Turn a video into a few pictures, and the pictures into words."),

    h("Our experiment", "part-5"),
    img("pdf-plus-video",
        "PDF plus video into connected knowledge. A Machine Learning Basics PDF is processed into text chunks; a "
        "Gradient Descent video gives a few important frames that a vision model turns into visual chunks with "
        "captions. Both go into one connected knowledge base. The question \"What does the PDF explain, and does "
        "the video demonstrate it?\" retrieves text and visual chunks, and the answer says the PDF explains gradient "
        "descent and the video demonstrates it step by step."),
    *p("Here's the plan:"),
    ul("**The PDF** goes through RAG-Anything's normal document pipeline.",
       "**The video** becomes 3 frames. Each one goes in as an image with a caption saying which moment it is.",
       "Then we ask one question across both: ==\"What does the PDF explain, and does the video demonstrate "
       "it?\"=="),
    box("Run it in Colab", f"Everything in this part is in my notebook, ready to run: [open the Colab notebook]({COLAB})."),
    *p("Grabbing a frame is one command per moment with ffmpeg:"),
    code("ffmpeg -ss 00:02:15 -i RAG-explanation.mp4 -frames:v 1 frame_0215.jpg", "bash"),
    *p("And this is the RAG-Anything part. It assumes you've already set up RAG-Anything with your chosen models, as in "
       "the project's README:"),
    code('frames = [\n'
         '    {"type": "image", "img_path": "/abs/path/frame_0215.jpg",\n'
         '     "image_caption": ["Video at 2:15: what RAG is"], "page_idx": 0},\n'
         '    {"type": "image", "img_path": "/abs/path/frame_0540.jpg",\n'
         '     "image_caption": ["Video at 5:40: chunking"], "page_idx": 1},\n'
         '    {"type": "image", "img_path": "/abs/path/frame_0830.jpg",\n'
         '     "image_caption": ["Video at 8:30: retrieval"], "page_idx": 2},\n'
         ']\n\n'
         'await rag.process_document_complete(file_path="RAG.pdf", output_dir="./output")\n'
         'await rag.insert_content_list(content_list=frames, file_path="RAG-explanation.mp4")\n\n'
         'answer = await rag.aquery(\n'
         '    "What does the PDF explain, and does the video demonstrate it?", mode="hybrid"\n'
         ')', "python"),
    *p(f"**Watch it run.** I recorded the whole experiment. You can also [watch it on YouTube]({VIDEO_URL})."),
    {"type": "video", "youtube_id": VIDEO, "title": "Rag-Anything (Uma's demo video)", "caption": "Rag-Anything · 5:55"},
    takeaway("PDF in one door, frames in another, one question across both."),

    h("Why this is powerful", "part-6"),
    *p("The PDF might say: \"RAG retrieves relevant documents before generating an answer.\"",
       "The video might show it happening on screen:"),
    flow("Question", "Retriever", "Documents", "LLM", "Answer"),
    *p("On their own, each one tells half the story. Connected, your system can say ==\"yes, the video demonstrates "
       "exactly what the PDF explains\"==, and point to both."),
    takeaway("That's multimodal RAG: knowledge from different formats, connected."),

    h("The one thing to remember", "part-7"),
    box("Remember", BIG_IDEA),
    pair(("Don't think", "Everything goes into one giant embedding."),
         ("Think", "Each type is understood its own way, then connected into one searchable knowledge base.")),

    h("Normal RAG vs multimodal RAG", "part-8"),
    img("normal-vs-multimodal",
        "Normal RAG versus multimodal RAG. Normal RAG works mainly with text: upload a PDF, extract text, create "
        "embeddings, search, and an LLM answers. Multimodal RAG takes PDFs, images, tables and video: it "
        "understands each type with the right tool, retrieves across all of them, uses an LLM or vision-language "
        "model to reason, and answers. Find the relevant information, whatever form it came in."),
    pair(("Normal RAG", "\"Find me some relevant text.\""),
         ("Multimodal RAG", "\"Find me the relevant information, whatever form it came in.\"")),
    takeaway("Same idea as RAG, just more kinds of knowledge."),

    h("Where Docling, MinerU and ColBERT fit", "part-9"),
    *p("If you've followed this series, the pieces now click together:"),
    ul(f"**[Docling]({DOCLING_POST})** and **[MinerU]({MINERU_POST})** turn messy documents into clean, structured "
       "content. RAG-Anything can use either as its parser.",
       f"**[ColBERT]({COLBERT_POST})** is one way to find the right passages once the content is ready.",
       "**RAG-Anything** connects all of it, and adds the non-text parts: images, tables, equations and, with a "
       "little help, video."),
    cta("Start the series with the Docling post", DOCLING_POST),
    *p(f"**Also read:** [ColBERT: When Normal Semantic Search Isn't Enough]({COLBERT_POST}) and [Docling and MinerU: "
       f"A Simple Guide to Document Parsing]({MINERU_POST}). Next: [LangGraph: How AI Agents Actually Follow a "
       "Workflow](/blog/langgraph-ai-agents-workflow)."),
    {"type": "links", "label": "References", "items": [
        {"label": "My Colab notebook", "href": COLAB},
        {"label": "My walkthrough video", "href": VIDEO_URL},
        {"label": "RAG-Anything on GitHub", "href": REPO},
        {"label": "RAG-Anything on PyPI", "href": PYPI},
        {"label": "LightRAG on GitHub", "href": LIGHTRAG},
        {"label": "Our ColBERT post", "href": COLBERT_POST},
        {"label": "Our Docling post", "href": DOCLING_POST},
    ]},
]

# Tools used: shown as Toolkit pills just before the first part.
TOOLS_USED = {"type": "links", "label": "Tools used", "items": [{"label": "RAG-Anything", "href": "/toolkit/raganything"}, {"label": "MinerU", "href": "/toolkit/mineru"}, {"label": "Docling", "href": "/toolkit/docling"}]}
BODY.insert(next(i for i, b in enumerate(BODY) if b["type"] == "heading"), TOOLS_USED)

POST = {
    "slug": "rag-anything-multimodal-rag",
    "category": "rag-and-documents",
    "title": "RAG-Anything: RAG That Can Understand More Than Text",
    "excerpt": "Basic RAG reads text. Real knowledge also lives in images, tables and videos. Here's how RAG-Anything "
               "connects them, and a small PDF-plus-video experiment you can try.",
    "cover": {"text": "RAG-Anything", "bg": "#211913", "fg": "#F2A93B",
              "image": {"src": f"{IMG}/text-vs-multimodal.webp", "width": SIZE[0], "height": SIZE[1],
                        "alt": COVER_ALT}},
    # Was featured until the LangGraph post (1 Oct 2026).
    "featured": None,
    "dive": None,
    "body": BODY,
    "published_on": "2026-10-01",
    "learn": [
        "Why text-only RAG misses a lot of real-world knowledge",
        "What RAG-Anything is, and what it does and doesn't handle",
        "How to turn a video into searchable knowledge with just 3 frames",
        "Where Docling, MinerU and ColBERT fit in a multimodal pipeline",
    ],
}


def main():
    with io.open(POSTS, encoding="utf-8") as f:
        posts = json.load(f)
    posts = [x for x in posts if x["slug"] != POST["slug"]]
    posts.insert(0, POST)
    with io.open(POSTS, "w", encoding="utf-8", newline="\n") as f:
        json.dump(posts, f, ensure_ascii=False, indent=2)
        f.write("\n")
    print(f"posts: {len(posts)}; '{POST['slug']}' has {len(BODY)} blocks")


if __name__ == "__main__":
    main()
