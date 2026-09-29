"""Adds (or updates) Uma's post "Your PDF Isn't Just Text. That's Why AI Can Struggle With It." in
api/seed/posts.json, and puts her 5 visuals in web/public/blog/docling/ (full size, WebP).

Text: Uma's ChatGPT draft (29 Sept 2026), rewritten as plain prose in six parts and checked against
Docling's official docs (links at the end of the post). The example report in the pictures is made up.
Run from the repo root:  python scripts/seed-post-docling.py [--images]
"""
import io
import json
import os
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
POSTS = os.path.join(ROOT, "api", "seed", "posts.json")
IMG = "/blog/docling"
SIZE = (1774, 887)

# Uma's attachments -> published names (only needed when (re)making the images).
UPLOADS = os.path.expanduser(r"~/.claude/uploads/83318ce1-1683-4252-921c-a17a2e19d071")
SOURCES = {
    "pipeline": "6e80eb28-ChatGPT_Image_Sep_29_2026_05_30_26_PM.png",
    "not-just-text": "7313aa39-ChatGPT_Image_Sep_29_2026_05_29_54_PM.png",
    "structured": "4401659b-ChatGPT_Image_Sep_29_2026_05_30_03_PM.png",
    "layout": "e1b28840-ChatGPT_Image_Sep_29_2026_05_30_12_PM.png",
    "words-vs-document": "d63a3e16-ChatGPT_Image_Sep_29_2026_05_30_18_PM.png",
}

DOCS = "https://docling-project.github.io/docling/"
CLI = "https://docling-project.github.io/docling/reference/cli/"
MODEL = "https://github.com/docling-project/docling/blob/main/docs/concepts/docling_document.md"


def make_images():
    from PIL import Image

    out = os.path.join(ROOT, "web", "public", "blog", "docling")
    os.makedirs(out, exist_ok=True)
    for name, src in SOURCES.items():
        im = Image.open(os.path.join(UPLOADS, src)).convert("RGB")
        assert im.size == SIZE, (name, im.size)
        im.save(os.path.join(out, f"{name}.webp"), "WEBP", quality=90, method=6)


def p(*lines):
    return [{"type": "paragraph", "text": t} for t in lines]


def h(text, anchor=None):
    return {"type": "heading", "text": text, "id": anchor}


def img(name, alt, caption=None):
    return {"type": "image", "src": f"{IMG}/{name}.webp", "alt": alt, "width": SIZE[0], "height": SIZE[1],
            "caption": caption}


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


PIPELINE_ALT = (
    "From messy documents to useful AI answers, in six steps: 1, a PDF (a sample quarterly report with text, a "
    "table, an image and a chart); 2, Docling analyses layout, reading order, tables, images, sections and runs OCR "
    "on scans; 3, structured content (heading, paragraph, table, image, chart, section); 4, chunks; 5, embeddings "
    "turn chunks into vectors; 6, a RAG app answers \"What was the revenue in Q3 2024?\" with the right figure and "
    "its source. Better document structure leads to better AI answers; Docling is the document-understanding step, "
    "not the whole RAG system."
)

BODY = [
    *p("Say you have a 100-page PDF and you want an AI to answer questions about it. The obvious plan is to extract "
       "the text and hand it over.",
       "Then you look at what came out.",
       "**What plain text extraction gave you:**"),
    code("Revenue\n2025\nCompany A 120\nCompany B 98\nCompany C 143\n..."),
    *p("The headings are mixed in with the paragraphs. The table has lost its shape. The images are gone, and the "
       "reading order can come out wrong. A document that looked neatly organised to you has turned into a pile of "
       "words.",
       "That's the problem Docling was built for."),

    h("What's actually inside a PDF", "part-1"),
    img("not-just-text",
        "A PDF is not just text. Left: a sample quarterly business review as you see it. Middle: the elements it "
        "contains, each with a different meaning: heading, text, image, table, chart and layout. Right: a structured "
        "document representation where each element is identified and organised: heading, paragraph, image, table, "
        "chart, section and footer.",
        "The example report in these pictures is made up."),
    *p("A PDF looks like a simple page, but it holds many different things: headings, paragraphs, tables, images, "
       "lists, captions, headers and footers, sections, and a page layout with a reading order that ties them "
       "together.",
       "When you look at a page, your brain sorts this out without effort. This is the title. This paragraph belongs "
       "under that heading. These numbers are a table. That picture is a figure.",
       "A basic text extractor doesn't necessarily keep any of those relationships. That matters, because everything "
       "after it, including the AI, only sees what the extractor hands over."),
    takeaway("A PDF is a structured document, not just text."),

    h("What Docling does", "part-2"),
    img("structured",
        "Docling turns messy documents into structured content. 1, a messy PDF as input; 2, Docling processing: "
        "layout analysis, reading order, detecting tables and images, understanding sections and handling scanned "
        "PDFs with OCR; 3, a structured DoclingDocument as output (heading, paragraph, image, table with header and "
        "rows, chart, section, footer), ready to export as Markdown, JSON or HTML."),
    *p("Docling is an open-source tool that converts documents into a structured representation instead of one long "
       "string of text. It was started by the AI for knowledge team at IBM Research Zurich, it's MIT licensed, and "
       "it now lives under the LF AI & Data Foundation.",
       f"Its core format is called [DoclingDocument]({MODEL}). It can hold text, tables, pictures, the heading "
       "hierarchy, layout information and reading order. So instead of a flat pile of words you get something "
       "closer to a tree:"),
    code("Document\n ├── Section\n │    ├── Heading\n │    ├── Paragraph\n │    └── Table\n │         ├── Header\n"
         " │         ├── Row\n │         └── Row\n └── Figure"),
    box("Good to know", "Docling isn't only for PDFs. It also reads DOCX, PPTX, XLSX, HTML and images, among other "
                        "formats."),
    takeaway("Docling keeps the document's structure instead of flattening it."),

    h("It reads the layout, not just the words", "part-3"),
    img("layout",
        "Docling understands the layout of your document. Left: the original PDF page. Middle: the structure Docling "
        "detected, with a numbered box around each part: 1 heading, 2 paragraph, 3 image, 4 table, 5 section, "
        "6 chart, 7 footer. Right: the list of detected elements and the reading order, from heading to footer."),
    *p("Before Docling can label anything, it has to work out what's on the page. It analyses the layout, finds each "
       "element (heading, paragraph, image, table, section, chart, footer) and works out the reading order, so a "
       "two-column page isn't read straight across.",
       "In the picture, every detected element gets a numbered box, and the list on the right shows the order it "
       "would be read in: heading first, then paragraph, image, table, and so on."),
    takeaway("It doesn't just read words. It finds and labels the parts of the page."),

    h("What about scanned PDFs?", "part-4"),
    flow("Normal PDF", "Read the content"),
    flow("Scanned PDF", "OCR", "Recognise the text"),
    *p("Some PDFs contain no selectable text at all. They're pictures of pages. Try to select a word and nothing "
       "happens.",
       "That's where OCR comes in. Optical character recognition looks at the pixels and recognises the text inside "
       "them. Docling supports OCR with several engines to choose from, such as Tesseract, EasyOCR and RapidOCR. On "
       "the command line it's switched on by default, and there's a --force-ocr option if you want it on every "
       "page.",
       "But OCR only finds letters. Docling's layout steps are what decide what those letters are: a heading, a "
       "table cell, a caption."),
    takeaway("OCR reads the pixels. Layout analysis works out what they mean."),

    h("Getting the words is not the same as keeping the document", "part-5"),
    img("words-vs-document",
        "Getting the words is not the same as understanding the document. 1, basic text extraction: the PDF becomes "
        "plain lines of text and numbers; all content is flattened and tables, layout and hierarchy are lost. "
        "2, Docling's structure-aware parsing: a heading, a paragraph, a table with its rows and columns, an image "
        "and a chart, exported as Markdown, JSON or HTML. Structure is preserved."),
    *p("Here's the comparison that matters. Basic extraction hands you the words: Revenue, 2024, Product, Revenue, "
       "A, 120, B, 98, C, 143. They're all there, but whatever reads them next has to guess which number belongs to "
       "which product.",
       "Docling hands you the same content with its shape: a heading, a paragraph, a table with columns, rows and "
       "cells, a figure, a section.",
       f"Then you choose how to get it out. The [command line]({CLI}) exports Markdown by default, and it also does "
       "JSON, YAML, HTML, plain text, DocTags and chunks. A table stays a table:"),
    code("# Annual Revenue\n\n## 2025 Results\n\nThe company reported...\n\n| Product | Revenue |\n"
         "|---------|---------|\n| A       | 120     |\n| B       | 98      |\n| C       | 143     |", "markdown"),
    *p("That's much more useful to an LLM than a flattened wall of words.",
       "**Try it yourself.** Install it and convert a PDF from the command line:"),
    code("pip install docling\ndocling report.pdf", "bash"),
    *p("Or do the same in Python:"),
    code('from docling.document_converter import DocumentConverter\n\nresult = DocumentConverter().convert("report.pdf")'
         "\nprint(result.document.export_to_markdown())", "python"),
    takeaway("Getting the words is not the same as keeping the document."),

    h("Where RAG comes in", "part-6"),
    flow("Your PDF", "Docling", "Structured document", "Chunking", "Embeddings", "Vector database", "Retrieval", "LLM",
         "Answer"),
    *p("Docling is not RAG. RAG, or retrieval-augmented generation, is a whole pipeline where an AI looks up the "
       "relevant pieces of your documents before it answers. Docling is one early stage of it.",
       "It prepares the document. The later stages decide how that information is chunked, embedded, stored and "
       "retrieved. Docling can help with chunking too: it has hybrid and hierarchical chunkers, and the command line "
       "can export chunks directly with --to chunks.",
       "Here's why it matters. Imagine you upload a company's annual report and ask, \"What was the revenue of "
       "Product B in 2025?\" If the table was destroyed during extraction, the AI has to guess which number belongs "
       "to which product. If the structure survived, the rest of the pipeline has much better information to work "
       "with.",
       "That's why document processing isn't a boring step hiding in the basement. It changes what your AI system "
       "has to work with."),
    takeaway("Docling gets the document ready. RAG uses it to answer questions."),
    box("One thing to be careful about",
        "You might hear Docling described as a tool that \"extracts everything without missing anything\". Don't "
        "repeat that. No document parser can honestly promise it for every PDF, scan, table, font or layout, and "
        "results depend on the document and the settings. A safer way to say it: Docling is designed to extract a "
        "document's content while keeping as much of its structure as it can. Run it on your own documents and "
        "check the output before you rely on it."),

    h("The mental model to remember"),
    pair(("Don't think", "PDF → Text → AI"),
         ("Think", "PDF → Document understanding → Structured data → AI")),
    flow("Messy PDF", "Docling: heading, paragraph, table, image, section, reading order", "Markdown or JSON",
         "Chunks / RAG", "AI application"),
    *p("A PDF isn't just text. It's a structured document, and Docling's job is to turn it into structured "
       "information your AI pipeline can use."),
    img("pipeline", PIPELINE_ALT, "The whole journey on one page. Click to enlarge."),
    {"type": "links", "label": "Official references", "items": [
        {"label": "Docling documentation", "href": DOCS},
        {"label": "Docling CLI reference", "href": CLI},
        {"label": "DoclingDocument structure", "href": MODEL},
    ]},
]

POST = {
    "slug": "docling-pdf-is-not-just-text",
    "category": "rag-and-documents",
    "title": "Your PDF Isn't Just Text. That's Why AI Can Struggle With It.",
    "excerpt": "Pull the text out of a PDF and the structure falls apart: headings, tables, reading order. Here's how "
               "Docling keeps it, and where it fits in a RAG system.",
    "cover": {
        "text": "Docling", "bg": "#211913", "fg": "#F2A93B",
        "image": {"src": f"{IMG}/pipeline.webp", "width": SIZE[0], "height": SIZE[1], "alt": PIPELINE_ALT},
    },
    # Newest post with a "featured" line = the Featured box on /blog.
    "featured": {"stat": "PDF ≠ text", "caption": "why AI struggles with documents, and how Docling keeps their "
                                                  "structure"},
    "dive": None,
    "body": BODY,
    "published_on": "2026-09-29",
    "learn": [
        "Why plain text extraction loses a document's structure",
        "What Docling does with a PDF",
        "How layout analysis, OCR and export formats fit together",
        "Where Docling sits in a RAG pipeline",
    ],
}


def main():
    if "--images" in sys.argv:
        make_images()
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
