"""Adds (or updates) Uma's post "ColBERT: When Normal Semantic Search Isn't Enough" in api/seed/posts.json,
with her 7 visuals in web/public/blog/colbert/ (converted to WebP by hand on 30 Sept 2026).

Text: written from Uma's outline, in plain prose. RAGatouille facts checked on 30 Sept 2026: latest PyPI
release 0.0.9.post2 (19 May 2025), last GitHub commit 17 May 2025, repo not archived; API from its README
(RAGPretrainedModel.from_pretrained / .index / .search, results carry "content", "score", "rank").
The code panel in the RAGatouille picture uses a class that doesn't exist, so the caption points to the
text. Run from the repo root:  python scripts/seed-post-colbert.py
"""
import io
import json
import os

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
POSTS = os.path.join(ROOT, "api", "seed", "posts.json")
IMG = "/blog/colbert"
DOCLING_POST = "/blog/docling-pdf-is-not-just-text"
MINERU_POST = "/blog/mineru-document-parsing-for-beginners"
REPO = "https://github.com/AnswerDotAI/RAGatouille"
PYPI = "https://pypi.org/project/ragatouille/"
COLBERT = "https://github.com/stanford-futuredata/ColBERT"
SIZE = (1672, 941)


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


def cta(label, href):
    return {"type": "cta", "label": label, "href": href}


BIG_IDEA = ("Semantic search looks at the ==whole chunk==. ColBERT looks at the ==important words== in your question "
            "and matches them with words in the document.")

COVER_ALT = (
    "Semantic search versus ColBERT. Left, semantic search works at chunk level: the whole query \"How many days "
    "can I cancel my annual subscription?\" becomes one vector and is compared with one vector per chunk, so it "
    "asks \"Is this whole chunk about my question?\". Right, ColBERT works at token level with late interaction: "
    "every word of the query gets its own representation and is matched with words in the passage, such as "
    "cancel, annual, subscription and days, giving a relevance score; it asks \"Which parts of this passage match "
    "my question?\"."
)

BODY = [
    *p("You have 1,000 pages of documents. Someone asks one very specific question. Somewhere in there is the one "
       "paragraph that answers it. How does a RAG app find it?",
       "Most apps start with semantic search, and it works well most of the time. This post is about the times it "
       "doesn't, and about ColBERT, a way of searching that looks closer."),
    box("The one idea to remember", BIG_IDEA),

    h("The problem: finding the right piece", "part-1"),
    *p("In a RAG app, the AI doesn't read all 1,000 pages every time. First, a ==retriever== picks a handful of "
       "pieces that look relevant. Then the AI answers using only those pieces.",
       "So the answer can only be as good as the pieces the retriever picked. If it misses the paragraph with the "
       "answer, the AI never sees it."),
    takeaway("Good answers start with finding the right pieces."),

    h("How normal semantic search works", "part-2"),
    img("semantic-search",
        "Dense semantic search in five steps: 1, the user asks \"How many days can I cancel my annual "
        "subscription?\"; 2, an embedding model turns it into a dense vector; 3, one query vector represents the "
        "whole question; 4, similarity search compares it with each chunk's vector (scores 0.92, 0.78, 0.31, "
        "0.18); 5, the top chunks, about subscription policy and billing, are returned and passed to the LLM."),
    *p("Semantic search turns your question into ==one vector==, a list of numbers that captures its overall "
       "meaning. Every chunk of your documents gets one vector too. The search returns the chunks whose vectors are "
       "closest to the question's.",
       "That's great for ==broad meaning==. But take the question \"How many days can I cancel my annual "
       "subscription?\" Lots of chunks are about subscriptions: billing, renewals, monthly plans, cancelling. "
       "Semantic search can tell they're all on topic. It's less good at noticing which one mentions the 30 days "
       "you actually asked about."),
    takeaway("Semantic search finds chunks about the same topic, not always the one with the detail."),

    h("Enter ColBERT: matching word by word", "part-3"),
    img("colbert-tokens",
        "ColBERT finds relevant passages by comparing tokens, in six steps: 1, the question is split into tokens "
        "(how, many, days, can, I, cancel, my, annual, subscription); 2, each query token gets its own "
        "context-aware vector; 3, the document passage is split into tokens with vectors too; 4, late interaction: "
        "each query token is matched with its most similar document token (days with 30, cancel with cancel, "
        "annual with annual, subscription with subscription); 5, the best matches combine into one relevance score, "
        "0.92; 6, passages are ranked by score."),
    *p("ColBERT keeps a vector for ==every word== (strictly, every token), and each one is shaped by the words "
       "around it. When you search, it takes each word in your question, finds the best-matching word in a "
       "passage, and adds those matches up into a score. This is called ==late interaction==, because the question "
       "and the passage are only compared at search time, word by word.",
       "So for our question, \"cancel\", \"annual\", \"subscription\" and \"days\" each look for their own match. "
       "A passage that says \"cancel your annual subscription within 30 days\" scores high because every important "
       "word finds a partner."),
    box("Remember", "ColBERT doesn't just ask \"are these two texts generally similar?\" It asks ==which parts of "
                    "this passage match which parts of my question==."),
    takeaway("ColBERT compares words, not whole chunks."),

    h("ColBERT vs normal embeddings", "part-4"),
    {"type": "cards", "items": [
        {"title": "What gets stored", "text": "Semantic search: one vector per chunk. ColBERT: a vector for every "
                                              "token, each shaped by its context."},
        {"title": "How it matches", "text": "Semantic search: overall meaning. ColBERT: word-by-word matches, added "
                                            "up into a score."},
        {"title": "Complexity", "text": "Semantic search: simpler to set up. ColBERT: more moving parts."},
        {"title": "Storage", "text": "Semantic search: generally smaller. ColBERT: generally larger, since it keeps "
                                     "many vectors per passage."},
        {"title": "Good for", "text": "Semantic search: general retrieval. ColBERT: when fine details in the wording "
                                      "matter."},
    ]},
    *p("One thing to be clear about: ColBERT is ==not automatically better==. It's another way to retrieve, and it "
       "earns its extra cost when fine-grained matching matters."),
    takeaway("Different tool, different trade-off. Not a straight upgrade."),

    h("What is RAGatouille?", "part-5"),
    img("ragatouille",
        "ColBERT and RAGatouille. ColBERT is a token-level retrieval model; RAGatouille is a Python library that "
        "makes ColBERT easier to use, handling indexing and searching. A search for \"How many days can I cancel my "
        "annual subscription?\" returns the subscription policy passage first.",
        "The code in this picture is simplified. Use the code in Part 6."),
    *p("==ColBERT is the retrieval model==. ==RAGatouille is a Python library== that makes ColBERT easy to use: "
       "you give it documents, it builds the index, and you search it in a few lines.",
       f"A quick honest note on its status, checked on 30 Sept 2026. RAGatouille isn't new. Its latest release on "
       f"[PyPI]({PYPI}) is 0.0.9.post2, from May 2025, and the last change to its [GitHub project]({REPO}) was in "
       "the same month. The project isn't archived, but it hasn't been updated since."),
    box("So how should you use it?", "Treat RAGatouille as an easy way to ==learn and try ColBERT==. Before you "
                                     "build something serious on it, check what the current ColBERT tools are."),
    takeaway("ColBERT is the idea. RAGatouille is a handy way to try it."),

    h("Try it yourself", "part-6"),
    *p("Here's a tiny experiment you can run in a notebook. Four short documents:"),
    code("Annual subscription plans are billed every twelve months.\n"
         "Customers may cancel their annual subscription within 30 days of purchase.\n"
         "Monthly subscriptions can be cancelled at any time.\n"
         "Annual plans may renew automatically unless cancellation is requested."),
    *p("And one question: \"How many days can I cancel my annual subscription?\" This is the code, following "
       "RAGatouille's own README:"),
    code("pip install ragatouille", "bash"),
    code('from ragatouille import RAGPretrainedModel\n\n'
         'docs = [\n'
         '    "Annual subscription plans are billed every twelve months.",\n'
         '    "Customers may cancel their annual subscription within 30 days of purchase.",\n'
         '    "Monthly subscriptions can be cancelled at any time.",\n'
         '    "Annual plans may renew automatically unless cancellation is requested.",\n'
         ']\n\n'
         'RAG = RAGPretrainedModel.from_pretrained("colbert-ir/colbertv2.0")\n'
         'RAG.index(index_name="subscriptions", collection=docs)\n\n'
         'for r in RAG.search("How many days can I cancel my annual subscription?", k=3):\n'
         '    print(r["rank"], round(r["score"], 2), r["content"])', "python"),
    *p("You should see the ==\"within 30 days\" sentence ranked first==: it's the one where \"cancel\", "
       "\"annual\", \"subscription\" and \"days\" all find a match. The other sentences are about subscriptions "
       "too, so they still show up, just lower.",
       "Your exact scores will vary. What matters is the ranking."),
    takeaway("Four sentences are enough to see word-by-word matching at work."),

    h("ColBERT doesn't answer the question", "part-7"),
    img("retriever-llm",
        "From many documents to an answer: 1, many documents (research paper, user guide, report, web page) are the "
        "knowledge source; 2, ColBERT finds the relevant parts with token-level search for the query \"How does "
        "photosynthesis work in plants?\"; 3, the top matching passages come from different documents; 4, an LLM "
        "uses those passages to write a grounded answer and lists its sources."),
    *p("This trips up a lot of beginners. ColBERT is a ==retriever==. It finds useful passages. It doesn't write "
       "anything.",
       "Writing the answer is the ==LLM's job==. It reads the passages ColBERT found and turns them into a reply."),
    flow("Your question", "ColBERT finds passages", "LLM reads them", "Answer"),
    takeaway("ColBERT finds. The LLM answers."),

    h("Where Docling and MinerU fit", "part-8"),
    img("rag-pipeline",
        "RAG pipeline from documents to answers in seven steps: 1, a real-world PDF; 2, document extraction with "
        "Docling or MinerU into structured Markdown; 3, chunking; 4, retrieval with embeddings or ColBERT; 5, the "
        "most relevant passages; 6, an LLM that uses the question and passages; 7, a grounded final answer with "
        "sources.", "The whole pipeline. Click to enlarge for the details."),
    *p(f"If you've read our posts on [Docling]({DOCLING_POST}) and [Docling and MinerU]({MINERU_POST}), this is "
       "where they connect. Each tool has one job:"),
    ul("**Docling or MinerU** turn messy documents into clean, structured text.",
       "**ColBERT** finds the passages that matter for a question.",
       "**The LLM** writes the final answer from those passages."),
    flow("PDF", "Docling / MinerU", "Structured text", "Chunking", "ColBERT", "Relevant passages", "LLM", "Answer"),
    cta("Start with the Docling post", DOCLING_POST),
    takeaway("Better documents in, better passages out, better answers at the end."),

    h("The 10-second mental model", "part-9"),
    img("rag-3-steps",
        "RAG in three simple steps: 1, prepare: Docling or MinerU turn messy documents into clean, structured text; "
        "2, retrieve: ColBERT finds the most relevant passages for \"How many days can I cancel my annual "
        "subscription?\"; 3, generate: an LLM writes the final answer from those passages."),
    *p("If you remember one thing from this series, make it this:"),
    flow("Prepare", "Retrieve", "Generate"),
    *p("==Docling or MinerU prepare the document. ColBERT finds the useful parts. The LLM explains them.=="),

    h("When should you care about ColBERT?", "part-10"),
    *p("ColBERT is worth a look when:"),
    ul("your documents are full of detail, like policies, manuals or legal text",
       "questions are specific, and ==small wording differences matter==",
       "normal semantic search keeps returning passages that are on topic but miss the detail",
       "you want to learn how more advanced retrieval works"),
    *p("But ==don't use it just because it sounds advanced==. For many apps, normal embeddings plus a reranker "
       "(a second model that re-sorts the top results) is simpler and good enough."),
    takeaway("Start simple. Reach for ColBERT when the details keep getting missed."),

    h("The final takeaway", "part-11"),
    *p("Embeddings give you the ==big picture==. ColBERT gives retrieval a ==finer lens==. And in RAG, better "
       "retrieval means the LLM gets better context to work with."),
    flow("PDF", "Docling / MinerU", "Structured text", "Chunking", "Retrieval: embeddings or ColBERT",
         "Relevant chunks", "LLM", "Answer"),
    *p(f"**Also read:** [Your PDF Isn't Just Text]({DOCLING_POST}) and [Docling and MinerU: A Simple Guide to "
       f"Document Parsing]({MINERU_POST}), the first two parts of this series. Next: [RAG-Anything: RAG That "
       "Can Understand More Than Text](/blog/rag-anything-multimodal-rag)."),
    {"type": "links", "label": "References", "items": [
        {"label": "ColBERT on GitHub", "href": COLBERT},
        {"label": "RAGatouille on GitHub", "href": REPO},
        {"label": "RAGatouille on PyPI", "href": PYPI},
        {"label": "Our Docling post", "href": DOCLING_POST},
        {"label": "Docling and MinerU", "href": MINERU_POST},
        {"label": "RAG-Anything", "href": "/blog/rag-anything-multimodal-rag"},
    ]},
]

POST = {
    "slug": "colbert-when-semantic-search-isnt-enough",
    "category": "rag-and-documents",
    "title": "ColBERT: When Normal Semantic Search Isn't Enough",
    "excerpt": "A 10-minute beginner journey from embeddings to ColBERT to RAG: why matching word by word can find "
               "the passage that normal semantic search misses.",
    "cover": {"text": "ColBERT", "bg": "#211913", "fg": "#F2A93B",
              "image": {"src": f"{IMG}/semantic-vs-colbert.webp", "width": 1774, "height": 887, "alt": COVER_ALT}},
    # Was featured until the RAG-Anything post (1 Oct 2026).
    "featured": None,
    "dive": None,
    "body": BODY,
    "published_on": "2026-09-30",
    "learn": [
        "How normal semantic search works, and where it struggles",
        "What ColBERT does differently: matching word by word",
        "What RAGatouille is, and its honest current status",
        "Where ColBERT sits next to Docling, MinerU and the LLM",
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
