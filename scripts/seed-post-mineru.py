"""Adds (or updates) Uma's post "Docling and MinerU: A Simple Guide to Document Parsing" in
api/seed/posts.json, with her "MinerU & Docling" infographic as the cover (web/public/blog/mineru-docling/).

Text: written on 30 Sept 2026 from Uma's notes and her Colab run (MinerU 4.0.10 on bitcoin.pdf), kept
basic on purpose: the deeper Docling details live in the Docling post, which this one links to. MinerU
facts checked against its official README (four tiers, input formats, outputs, local by default,
Python >=3.10,<3.15, `mineru-kit parse ... --tier standard`).
Run from the repo root:  python scripts/seed-post-mineru.py
"""
import io
import json
import os

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
POSTS = os.path.join(ROOT, "api", "seed", "posts.json")

REPO = "https://github.com/opendatalab/MinerU"
TIERS = "https://opendatalab.github.io/MinerU/usage/tiers/"
QUICK = "https://opendatalab.github.io/MinerU/quick_start/"
DOCLING_POST = "/blog/docling-pdf-is-not-just-text"
IMG = "/blog/mineru-docling/overview.webp"
OVERVIEW_ALT = (
    "MinerU and Docling: two document parsing tools that help AI understand your files. 1, a real-world PDF (the "
    "Bitcoin paper) holds headings, paragraphs, images, tables, equations and multiple columns. 2, MinerU and "
    "Docling side by side: MinerU has a model-based pipeline with Flash, Basic, Standard and Advanced tiers and a "
    "document library for agent-style reading; Docling is a document parsing and conversion tool for PDF, DOCX, "
    "PPTX and XLSX that focuses on structured output for RAG. 3, structured output: Markdown, tables, images, "
    "equations and clean text. Below, how it fits in an AI pipeline (PDF, MinerU or Docling, structured content, "
    "chunking, embeddings, vector database, RAG and LLM) and quick takeaways: both are document parsing tools, use "
    "either or both, and see the Docling blog for more."
)


def p(*lines):
    return [{"type": "paragraph", "text": t} for t in lines]


def h(text, anchor=None):
    return {"type": "heading", "text": text, "id": anchor}


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


BODY = [
    *p("You upload a PDF to an AI app and ask, \"Summarise this chapter.\" A few seconds later, you have a summary.",
       "It feels like magic. But how did the AI actually read that PDF? There's an important step that happens "
       "before the AI sees a single word, and that's what this post is about.",
       f"We'll keep it simple and meet two tools that do this job, Docling and MinerU. If you want the deeper "
       f"version first, [read our Docling post]({DOCLING_POST})."),

    h("A PDF isn't a clean page of text", "part-1"),
    *p("A PDF can hold a heading, then a paragraph, then a picture, a table, an equation and another section, all "
       "arranged on the page in columns and boxes."),
    flow("Heading", "Paragraph", "Image", "Table", "Equation", "Next section"),
    *p("If you simply pull out all the text, that neat page can turn into a blob like this:"),
    code("Electric field...\n12.5\nFigure 4\nE = F/q\ncurrent..."),
    *p("The words are there. What they belong to is gone. Which number goes with which row? Is \"Figure 4\" a "
       "heading? Nobody knows any more, including the AI."),
    takeaway("A PDF is a layout, not a list of words."),

    h("What document parsing means", "part-2"),
    *p("In simple words, document parsing means taking a document and working out what's inside it. Instead of one "
       "big pile of text, you get the pieces, each with a label:"),
    flow("PDF", "Document parser", "Heading, paragraph, table, image, section, equation"),
    *p("The important part isn't just getting the words. It's knowing where each word belongs: this is a title, "
       "this is a table cell, this caption goes with that figure.",
       f"Our [Docling post]({DOCLING_POST}#part-3) shows this step by step, with a real page and every part labelled."),
    takeaway("Parsing keeps the shape of the document, not just its words."),

    h("Why AI needs this", "part-3"),
    *p("Say you're building a study app, and a student uploads Physics Chapter 5. Later, the app has to find the "
       "right part of that chapter to answer a question. That's RAG: the AI looks things up in your documents "
       "before it answers.",
       "If the chapter went in as a blob, the app searches through the blob. If it was parsed first, the app knows "
       "the chapter, the section, the equation and the figure, and every piece it finds comes with that context."),
    flow("PDF", "Document parsing", "Structured content", "Chunking", "Embeddings", "Vector database", "RAG answer"),
    takeaway("Good answers start with a well-parsed document."),

    h("Docling and MinerU: same goal, different tools", "part-4"),
    *p(f"You may already know Docling from [our Docling post]({DOCLING_POST}). MinerU is in the same category: an "
       "open-source document parser, from the OpenDataLab team. You give either one a document, and you get back "
       "structured content your app can use."),
    box("Tell the neighbours",
        "Your neighbour's kid just built a RAG app with Docling, and now the whole colony is talking about it. Relax. "
        "You're about to learn MinerU, which does the same job its own way. Next family function, you get to say, "
        "\"Oh, I tried both.\""),
    *p("So which one is right? Both. They solve the same problem with different engines. The simplest way to "
       "remember the difference:"),
    pair(("Docling", "\"Give me a document and I'll turn it into a structured document object.\""),
         ("MinerU", "\"Give me documents and I'll parse them so an app or an AI agent can read, search and point to "
                    "exact pages.\"")),
    *p("A few basics about MinerU:"),
    ul("It reads PDFs and images, and also Word, PowerPoint, Excel, EPUB and HTML files, among others.",
       "It can give you the result as Markdown, HTML, LaTeX and a few other formats.",
       "It runs on your own computer by default. Your documents aren't uploaded anywhere unless you set that up."),
    box("More on Docling", f"How it reads layout, handles scanned pages and exports Markdown is all in [our Docling "
                           f"post]({DOCLING_POST})."),
    takeaway("Docling and MinerU are neighbours, not rivals. Same job, different engines."),

    h("MinerU's four speed settings", "part-5"),
    *p("MinerU lets you choose how hard it works on a document. It calls these tiers:"),
    flow("Flash: fast previews and indexing", "Basic: adds OCR and small models",
         "Standard: for more demanding layouts", "Advanced: most effort, for the hardest documents"),
    *p("Think of it like choosing between a quick glance and a careful read. A simple, clean PDF is fine with Flash. "
       "A scanned textbook full of tables and equations is where Standard and Advanced earn their time."),
    takeaway("Pick the tier that matches how messy your document is."),

    h("Try it yourself", "part-6"),
    *p("You can try MinerU for free in Google Colab. Install it, upload a PDF (the classic Bitcoin paper works well), "
       "and run one command:"),
    code('!pip install -U "mineru>=4.0,<5"', "bash"),
    code('!mineru-kit parse "/content/bitcoin.pdf" -o "/content/bitcoin_standard.md" --tier standard', "bash"),
    *p("The first run downloads some model files, so it can look busy for a while. That's normal. Don't stop it and "
       "don't run it twice. When it finishes, open the Markdown file and look for headings, paragraphs, lists and "
       "tables.",
       f"Then do the fun part: run the same PDF through Docling ([the commands are here]({DOCLING_POST}#part-5)) "
       "and put the two results side by side. Don't ask "
       "\"Which tool is better?\" Ask \"Which one keeps what I need from my documents?\""),
    box("Good to know", "MinerU needs Python 3.10 to 3.14. Colab's Python works."),
    takeaway("The best parser is the one that works on your documents. Test it."),

    h("The one thing to remember"),
    *p("Think of a messy school bag. Books, notes, pens and receipts, all thrown in together. Before you can find "
       "anything, you sort it. Document parsing does that for documents."),
    flow("Messy PDF", "Sort what's inside", "Heading, paragraph, table, image, section", "AI-ready content"),
    pair(("Don't think", "PDF → Text → AI"), ("Think", "PDF → Structure → AI")),
    *p("Docling or MinerU, the idea is the same: turn messy documents into structured information that software and "
       f"AI can work with. That's the whole game. For the full picture, [read our Docling post]({DOCLING_POST})."),
    {"type": "links", "label": "Official references", "items": [
        {"label": "MinerU on GitHub", "href": REPO},
        {"label": "MinerU tiers", "href": TIERS},
        {"label": "MinerU quick start", "href": QUICK},
        {"label": "Our Docling post", "href": DOCLING_POST},
    ]},
]

POST = {
    "slug": "mineru-document-parsing-for-beginners",
    "category": "rag-and-documents",
    "title": "Docling and MinerU: A Simple Guide to Document Parsing",
    "excerpt": "How does an AI app actually read your PDF? A simple guide to document parsing and two tools that do "
               "it, Docling and MinerU, with a free Colab command to try it yourself.",
    "cover": {"text": "Docling & MinerU", "bg": "#211913", "fg": "#F2A93B",
              "image": {"src": IMG, "width": 1536, "height": 1024, "alt": OVERVIEW_ALT}},
    # Newest post with a "featured" line = the Featured box on /blog and the homepage card.
    "featured": {"stat": "Docling & MinerU", "caption": "a simple guide to document parsing"},
    "dive": None,
    "body": BODY,
    "published_on": "2026-09-30",
    "learn": [
        "What document parsing is, in plain words",
        "Why AI apps need a parsed document, not a text blob",
        "What Docling and MinerU are, and how they differ",
        "How to try MinerU in Google Colab",
    ],
}


def main():
    with io.open(POSTS, encoding="utf-8") as f:
        posts = json.load(f)
    posts = [x for x in posts if x["slug"] != POST["slug"]]
    # Only one Featured post at a time.
    for x in posts:
        x["featured"] = None
    posts.insert(0, POST)
    with io.open(POSTS, "w", encoding="utf-8", newline="\n") as f:
        json.dump(posts, f, ensure_ascii=False, indent=2)
        f.write("\n")
    print(f"posts: {len(posts)}; '{POST['slug']}' has {len(BODY)} blocks")


if __name__ == "__main__":
    main()
