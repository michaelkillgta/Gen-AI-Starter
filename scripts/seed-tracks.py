"""Builds api/seed/tracks.json (two tracks, step-by-step stages with resources) and
re-homes the existing deep dives into those stages (api/seed/dives.json).

Sources merged: Uma's two research files (ChatGPT "Learning Generative AI From Scratch"
and Google's "Generative AI Learning Roadmap"), plus gaps filled in by hand.

Run from the repo root:  python scripts/seed-tracks.py
"""
import io
import json
import os

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SEED = os.path.join(ROOT, "api", "seed")


def r(title, by, url, kind, cost, note=None, tool=None):
    """One resource. kind: course | video | book | docs | paper | practice | community.
    cost: free | free-audit | paid | free-tier."""
    return {"title": title, "by": by, "url": url, "kind": kind, "cost": cost, "note": note, "tool": tool}


def stage(slug, title, weeks, why, topics, resources, project, done_when):
    return {
        "slug": slug,
        "title": title,
        "weeks": weeks,
        "why": why,
        "topics": topics,
        "resources": resources,
        "project": {"title": project[0], "text": project[1]},
        "done_when": done_when,
    }


# --------------------------------------------------------------------------- AI/ML track

AIML = {
    "slug": "ai-ml",
    "name": "AI/ML track",
    "who": "The big one · from zero",
    "tone": "light",
    "duration": "About 6 months at 8–10 hours a week",
    "blurb": "Python, the maths you actually need, classic machine learning, deep learning and shipping models. "
    "The foundation every AI job assumes.",
    "start_if": "Start here if you're new to coding or AI, or you want ML engineer or data scientist roles.",
    "position": 1,
    "stages": [
        stage(
            "python-and-tools",
            "Python and the everyday tools",
            "3 weeks",
            "Every model, notebook and API you'll touch is Python. Get comfortable before anything else.",
            ["Python basics and functions", "Classes and modules", "NumPy arrays", "Pandas dataframes",
             "Plotting with Matplotlib", "Jupyter and Google Colab", "Git and GitHub"],
            [
                r("CS50's Introduction to Programming with Python", "Harvard", "https://cs50.harvard.edu/python/",
                  "course", "free", "The clearest start if you've never coded."),
                r("Kaggle Learn: Python", "Kaggle", "https://www.kaggle.com/learn/python", "course", "free",
                  "Short lessons with exercises in the browser."),
                r("Kaggle Learn: Pandas", "Kaggle", "https://www.kaggle.com/learn/pandas", "course", "free"),
                r("NumPy: the absolute basics for beginners", "NumPy", "https://numpy.org/doc/stable/user/absolute_beginners.html",
                  "docs", "free"),
                r("Automate the Boring Stuff with Python", "Al Sweigart", "https://automatetheboringstuff.com/",
                  "book", "free", "Free to read online."),
                r("GitHub Skills", "GitHub", "https://skills.github.com/", "practice", "free",
                  "Learn Git by doing it in a real repo."),
            ],
            ("Explore a real dataset",
             "Pick a dataset you care about (IPL matches, your city's weather, exam results from Kaggle). "
             "Clean it with Pandas, make 5 charts, write what you found, and push the notebook to GitHub."),
            ["You can write functions and a small class without looking things up",
             "You can load, clean and group a CSV in Pandas",
             "Your notebook is on GitHub with a readable README"],
        ),
        stage(
            "maths-you-need",
            "The maths you actually need",
            "4 weeks (alongside stage 1)",
            "Not a maths degree: just enough linear algebra, calculus and probability to understand what a model is doing.",
            ["Vectors, matrices and dot products", "Derivatives and the chain rule", "Gradient descent",
             "Mean, variance and distributions", "Probability and Bayes' rule", "Why softmax and cross-entropy"],
            [
                r("Essence of Linear Algebra", "3Blue1Brown", "https://www.3blue1brown.com/topics/linear-algebra",
                  "video", "free", "Watch this first: pictures before formulas."),
                r("Essence of Calculus", "3Blue1Brown", "https://www.3blue1brown.com/topics/calculus", "video", "free"),
                r("Statistics and Probability", "Khan Academy", "https://www.khanacademy.org/math/statistics-probability",
                  "course", "free"),
                r("StatQuest", "Josh Starmer", "https://www.youtube.com/@statquest", "video", "free",
                  "Short, friendly explanations of every stats and ML idea."),
                r("Mathematics for Machine Learning", "Deisenroth, Faisal, Ong", "https://mml-book.github.io/",
                  "book", "free", "Free PDF. Use as a reference, not cover to cover."),
            ],
            ("Gradient descent by hand",
             "Implement linear regression with gradient descent in plain NumPy. Plot the loss going down, "
             "then try a learning rate that's too big and explain what happens."),
            ["You can explain a dot product and a gradient in your own words",
             "You can say why we take small steps downhill to train a model",
             "You know what mean, variance and a normal distribution are"],
        ),
        stage(
            "classic-ml",
            "Classic machine learning",
            "6 weeks",
            "Most real business problems are still solved with these models. They also teach you how to test any model honestly.",
            ["Supervised vs unsupervised learning", "Linear and logistic regression", "Decision trees, random forests, gradient boosting",
             "Train, validation and test splits", "Cross-validation and overfitting",
             "Metrics: accuracy, precision, recall, RMSE", "Feature engineering", "Clustering and PCA"],
            [
                r("Machine Learning Specialization", "Andrew Ng · DeepLearning.AI",
                  "https://www.coursera.org/specializations/machine-learning-introduction", "course", "free-audit",
                  "Audit for free, or apply for Coursera financial aid for the certificate."),
                r("Machine Learning Crash Course", "Google", "https://developers.google.com/machine-learning/crash-course",
                  "course", "free"),
                r("Kaggle Learn: Intro to Machine Learning", "Kaggle", "https://www.kaggle.com/learn/intro-to-machine-learning",
                  "course", "free", "Then take Intermediate Machine Learning."),
                r("scikit-learn User Guide", "scikit-learn", "https://scikit-learn.org/stable/user_guide.html", "docs", "free"),
                r("Hands-On Machine Learning (3rd edition) notebooks", "Aurélien Géron", "https://github.com/ageron/handson-ml3",
                  "book", "free", "The notebooks are free; the book itself is paid and worth it."),
            ],
            ("Two Kaggle problems, done properly",
             "Solve Kaggle's Titanic (classification) and House Prices (regression). Use cross-validation, compare "
             "3 models, and write down which features mattered and why."),
            ["You never judge a model on the data it trained on",
             "You can choose a metric that fits the problem",
             "You can explain why a random forest beat (or lost to) logistic regression"],
        ),
        stage(
            "deep-learning",
            "Deep learning",
            "8 weeks",
            "Neural networks power everything in the Gen AI track. Build one from scratch once, and nothing after feels like magic.",
            ["Neurons, layers and activations", "Backpropagation", "Training loops in PyTorch",
             "CNNs for images", "Overfitting fixes: augmentation, dropout, weight decay",
             "Transfer learning", "GPUs on Colab and Kaggle"],
            [
                r("Neural Networks: Zero to Hero", "Andrej Karpathy", "https://karpathy.ai/zero-to-hero.html", "video", "free",
                  "Builds a neural network engine from scratch. The single best resource here."),
                r("Practical Deep Learning for Coders", "fast.ai", "https://course.fast.ai/", "course", "free",
                  "Top-down and practical: working models from lesson one."),
                r("PyTorch: Learn the Basics", "PyTorch", "https://docs.pytorch.org/tutorials/beginner/basics/intro.html",
                  "docs", "free"),
                r("Dive into Deep Learning", "Zhang, Lipton, Li, Smola", "https://d2l.ai/", "book", "free",
                  "Free interactive book with runnable code."),
                r("MIT 6.S191: Introduction to Deep Learning", "MIT", "https://introtodeeplearning.com/", "video", "free"),
                r("Deep Learning Specialization", "Andrew Ng · DeepLearning.AI",
                  "https://www.coursera.org/specializations/deep-learning", "course", "free-audit"),
            ],
            ("From micrograd to a real classifier",
             "Follow Karpathy's micrograd lecture and build it yourself. Then train a CNN in PyTorch on a small image "
             "dataset you collect (for example, Indian dishes), first from scratch and then with transfer learning."),
            ["You can write a PyTorch training loop without copying it",
             "You can explain backpropagation with a small example",
             "You know how to spot and fix overfitting"],
        ),
        stage(
            "vision-and-language",
            "Vision and language",
            "4 weeks",
            "Most AI products see images or read text. Learn the standard models and how to adapt them with Hugging Face.",
            ["Image classification and detection", "Tokenization and embeddings", "Transformers for text and images",
             "The Hugging Face Hub, Datasets and Transformers libraries", "Fine-tuning a pretrained model"],
            [
                r("CS231n: Deep Learning for Computer Vision", "Stanford", "https://cs231n.stanford.edu/", "course", "free",
                  "Lectures and notes are free online."),
                r("CS224n: Natural Language Processing with Deep Learning", "Stanford",
                  "https://web.stanford.edu/class/cs224n/", "course", "free"),
                r("LLM Course", "Hugging Face", "https://huggingface.co/learn/llm-course", "course", "free",
                  "Transformers, tokenizers and fine-tuning, hands-on."),
                r("Computer Vision Course", "Hugging Face", "https://huggingface.co/learn/computer-vision-course",
                  "course", "free"),
            ],
            ("Fine-tune and publish",
             "Fine-tune a pretrained model (a small vision transformer or DistilBERT) on your own dataset, "
             "then publish the model with a proper model card on the Hugging Face Hub."),
            ["You can load any model from the Hub and run it",
             "You have fine-tuned a pretrained model on your own data",
             "Your model is public with a model card"],
        ),
        stage(
            "ship-ml",
            "Ship it: data, MLOps and deployment",
            "4 weeks",
            "A model in a notebook helps nobody. Learn to serve it, version it and watch it once people use it.",
            ["APIs with FastAPI", "Docker containers", "Demos with Gradio", "Hosting on Hugging Face Spaces",
             "Experiment tracking", "Data and model versioning", "Monitoring and drift"],
            [
                r("Made With ML", "Goku Mohandas", "https://madewithml.com/", "course", "free",
                  "Production ML end to end, written for engineers."),
                r("MLOps Zoomcamp", "DataTalks.Club", "https://github.com/DataTalksClub/mlops-zoomcamp", "course", "free",
                  "Free cohort course with homework and a community."),
                r("FastAPI Tutorial", "FastAPI", "https://fastapi.tiangolo.com/tutorial/", "docs", "free"),
                r("Docker: Get started", "Docker", "https://docs.docker.com/get-started/", "docs", "free"),
                r("Gradio Quickstart", "Gradio", "https://www.gradio.app/guides/quickstart", "docs", "free"),
                r("Hugging Face Spaces", "Hugging Face", "https://huggingface.co/docs/hub/spaces", "docs", "free-tier",
                  "Free hosting for demos."),
                r("Modal", "Modal", "https://modal.com/", "practice", "free-tier",
                  "Run heavy models on cloud GPUs by the second.", tool="modal"),
            ],
            ("Put your model on the internet",
             "Take your stage 4 or 5 model, wrap it in a FastAPI service inside Docker, add a Gradio demo on "
             "Hugging Face Spaces, and log every prediction so you can spot problems."),
            ["Anyone can try your model from a link",
             "Your service runs the same on your laptop and in the cloud",
             "You can tell when it starts getting worse"],
        ),
        stage(
            "portfolio-and-jobs",
            "Portfolio and interviews",
            "Ongoing",
            "Turn what you built into proof. Recruiters look for finished projects you can explain, not certificates.",
            ["Writing a strong README", "Explaining trade-offs", "Kaggle competitions",
             "ML system design interviews", "Reading papers"],
            [
                r("Kaggle Competitions", "Kaggle", "https://www.kaggle.com/competitions", "practice", "free"),
                r("Introduction to Machine Learning Interviews", "Chip Huyen", "https://huyenchip.com/ml-interviews-book/",
                  "book", "free"),
                r("Designing Machine Learning Systems", "Chip Huyen · O'Reilly",
                  "https://www.oreilly.com/library/view/designing-machine-learning/9781098107956/", "book", "paid"),
                r("Daily Papers", "Hugging Face", "https://huggingface.co/papers", "community", "free",
                  "The easiest way to follow new research."),
            ],
            ("Three projects you can explain",
             "Polish three projects from this track: each with a clear README, a live demo link, what you tried "
             "that didn't work, and what you'd do next. Then enter one Kaggle competition."),
            ["Three projects with live demos and honest READMEs",
             "You can walk an interviewer through one project's trade-offs in five minutes"],
        ),
    ],
}

# --------------------------------------------------------------------------- Gen AI track

GENAI = {
    "slug": "gen-ai",
    "name": "Gen AI track",
    "who": "Flagship · build with LLMs",
    "tone": "dark",
    "duration": "About 4 months at 8–10 hours a week",
    "blurb": "How LLMs really work, then using them well: APIs, RAG, agents, evals, fine-tuning and shipping "
    "real AI products.",
    "start_if": "Start here if you know basic Python. Do AI/ML stages 1 to 4 first if you want to understand what's underneath.",
    "position": 2,
    "stages": [
        stage(
            "how-llms-work",
            "How LLMs actually work",
            "2 weeks",
            "Before building with LLMs, know what they are: next-word predictors trained on huge amounts of text. "
            "It explains both their magic and their mistakes.",
            ["Tokens and tokenization", "Embeddings", "Attention and the Transformer", "Pre-training vs fine-tuning",
             "Why models hallucinate", "Context windows"],
            [
                r("Intro to Large Language Models", "Andrej Karpathy", "https://www.youtube.com/watch?v=zjkBMFhNj_g",
                  "video", "free", "One hour, the best overview there is."),
                r("Deep Dive into LLMs like ChatGPT", "Andrej Karpathy", "https://www.youtube.com/watch?v=7xTGNNLPyMI",
                  "video", "free", "Longer and deeper: pre-training to reasoning models."),
                r("Neural Networks (Transformer chapters)", "3Blue1Brown", "https://www.3blue1brown.com/topics/neural-networks",
                  "video", "free", "Beautiful visual explanations of attention."),
                r("The Illustrated Transformer", "Jay Alammar", "https://jalammar.github.io/illustrated-transformer/",
                  "book", "free"),
                r("Tiktokenizer", "Community tool", "https://tiktokenizer.vercel.app/", "practice", "free",
                  "Type text and see exactly how a model splits it into tokens."),
            ],
            ("Explain it to a friend",
             "Write a one-page explainer (with pictures) of how an LLM turns your question into an answer, token by "
             "token. Use Tiktokenizer to show real tokens."),
            ["You can explain tokens, embeddings and attention without jargon",
             "You can say why an LLM confidently makes things up"],
        ),
        stage(
            "llm-apis",
            "Use LLM APIs well",
            "2 weeks",
            "Most Gen AI products are built on APIs. Learn prompting, structured outputs, streaming and costs properly.",
            ["Prompt engineering basics", "System prompts and few-shot examples", "Structured JSON outputs",
             "Streaming responses", "Tokens, cost and rate limits", "Handling errors and retries"],
            [
                r("Google AI Studio", "Google", "https://aistudio.google.com/", "practice", "free-tier",
                  "A free Gemini API key: the easiest way to start without paying."),
                r("Prompt engineering overview", "Anthropic",
                  "https://docs.claude.com/en/docs/build-with-claude/prompt-engineering/overview", "docs", "free"),
                r("Prompt engineering guide", "OpenAI", "https://platform.openai.com/docs/guides/prompt-engineering",
                  "docs", "free"),
                r("ChatGPT Prompt Engineering for Developers", "DeepLearning.AI",
                  "https://www.deeplearning.ai/short-courses/chatgpt-prompt-engineering-for-developers/", "course", "free"),
                r("Pydantic", "Pydantic", "https://docs.pydantic.dev/latest/", "docs", "free",
                  "Validate the JSON a model gives you."),
                r("Vercel AI SDK", "Vercel", "https://ai-sdk.dev/", "docs", "free",
                  "If you build in TypeScript.", tool="aisdk"),
            ],
            ("A study helper that returns clean data",
             "Build a command-line helper that turns a chapter of your notes into flashcards as validated JSON, "
             "streams the answer, retries on errors, and prints what each run cost."),
            ["Your app never crashes on a bad model reply",
             "You get the same JSON shape every time",
             "You know roughly what 1,000 requests would cost"],
        ),
        stage(
            "build-a-gpt",
            "Build a small GPT from scratch",
            "4 weeks",
            "Code the Transformer yourself once. After this, papers, model cards and fine-tuning all make sense.",
            ["Self-attention in code", "Causal masking", "Byte-pair encoding tokenizers", "Training a tiny language model",
             "Sampling: temperature, top-k, top-p", "The KV cache"],
            [
                r("Let's build GPT: from scratch, in code", "Andrej Karpathy", "https://www.youtube.com/watch?v=kCc8FmEb1nY",
                  "video", "free"),
                r("Let's build the GPT Tokenizer", "Andrej Karpathy", "https://www.youtube.com/watch?v=zduSFxRajkE",
                  "video", "free"),
                r("Build a Large Language Model (From Scratch)", "Sebastian Raschka", "https://github.com/rasbt/LLMs-from-scratch",
                  "book", "free", "The code and videos are free; the book is paid."),
                r("nanoGPT", "Andrej Karpathy", "https://github.com/karpathy/nanoGPT", "practice", "free"),
                r("Attention Is All You Need", "Vaswani et al.", "https://arxiv.org/abs/1706.03762", "paper", "free",
                  "The original Transformer paper. Read it after the videos."),
            ],
            ("Your own tiny GPT",
             "Train a small GPT on text in your own language (Hindi, Tamil, Telugu…) or on your favourite author, "
             "on a free Colab GPU. Add temperature and top-k sampling and compare the outputs."),
            ["Your model generates text that looks like the training data",
             "You can explain every line of your attention code"],
        ),
        stage(
            "rag",
            "RAG: answers from your own documents",
            "4 weeks",
            "Models don't know your notes, PDFs or company data. RAG finds the right passages and hands them to the model, with citations.",
            ["Parsing PDFs and documents", "Chunking", "Embeddings and vector search", "Hybrid search (keywords + meaning)",
             "Reranking", "Citations and saying “I don't know”", "Measuring answer quality"],
            [
                r("RAG From Scratch", "LangChain (Lance Martin)", "https://github.com/langchain-ai/rag-from-scratch",
                  "video", "free", "Short videos that build every RAG technique step by step."),
                r("Advanced RAG on Hugging Face documentation", "Hugging Face Cookbook",
                  "https://huggingface.co/learn/cookbook/advanced_rag", "practice", "free"),
                r("Sentence Transformers", "SBERT", "https://sbert.net/", "docs", "free", "Free, local embedding models."),
                r("pgvector", "pgvector", "https://github.com/pgvector/pgvector", "docs", "free",
                  "Vector search inside PostgreSQL."),
                r("Qdrant documentation", "Qdrant", "https://qdrant.tech/documentation/", "docs", "free-tier"),
                r("Docling", "IBM", "https://github.com/docling-project/docling", "docs", "free",
                  "Turn PDFs into clean text and tables.", tool="docling"),
                r("Ragas", "Ragas", "https://docs.ragas.io/", "docs", "free", "Metrics for RAG quality."),
            ],
            ("A study assistant for your notes",
             "Build a chat app over your own college notes and PDFs that cites the page for every answer and says "
             "“I don't know” when the notes don't cover it. (This is the Build Challenge project.)"),
            ["Every answer shows where it came from",
             "It refuses to guess when the answer isn't in your documents",
             "You have 20 test questions with expected answers"],
        ),
        stage(
            "agents-and-mcp",
            "Agents and MCP",
            "4 weeks",
            "Agents let a model take steps: call tools, read results and decide what's next. Learn to build ones that don't break.",
            ["The agent loop: reason, act, observe", "Tool calling", "Workflows vs agents", "State machines with LangGraph",
             "Model Context Protocol (MCP)", "Human approval steps", "Budgets and limits"],
            [
                r("Building effective agents", "Anthropic", "https://www.anthropic.com/engineering/building-effective-agents",
                  "book", "free", "Read this before any framework."),
                r("AI Agents Course", "Hugging Face", "https://huggingface.co/learn/agents-course", "course", "free"),
                r("Introduction to LangGraph", "LangChain Academy", "https://academy.langchain.com/courses/intro-to-langgraph",
                  "course", "free", tool="langgraph"),
                r("Model Context Protocol", "MCP", "https://modelcontextprotocol.io/", "docs", "free",
                  "The standard way to plug tools and data into AI apps."),
            ],
            ("An agent that asks before it acts",
             "Build an agent that plans your study week from your notes and calendar through MCP, stops for your "
             "approval before changing anything, and has a hard limit on steps and cost."),
            ["Your agent stops and asks when it isn't sure",
             "It can't loop forever or spend without limit",
             "You can replay every step it took"],
        ),
        stage(
            "evals-and-safety",
            "Evals, safety and security",
            "2 weeks",
            "You can't improve what you don't measure, and every AI app can be attacked. Test before your users do.",
            ["Writing test cases for AI", "LLM-as-judge (and its limits)", "Regression testing prompts",
             "Prompt injection", "OWASP Top 10 for LLM apps", "Tracing and debugging"],
            [
                r("Your AI Product Needs Evals", "Hamel Husain", "https://hamel.dev/blog/posts/evals/", "book", "free"),
                r("OWASP Top 10 for LLM Applications", "OWASP", "https://genai.owasp.org/llm-top-10/", "docs", "free"),
                r("Prompt injection series", "Simon Willison", "https://simonwillison.net/series/prompt-injection/",
                  "book", "free"),
                r("Promptfoo", "Promptfoo", "https://www.promptfoo.dev/docs/intro/", "docs", "free",
                  "Automated tests and red-teaming.", tool="promptfoo"),
                r("Arize Phoenix", "Arize", "https://arize.com/docs/phoenix", "docs", "free",
                  "See every step your app took, locally.", tool="arize"),
            ],
            ("Break your own app",
             "Write 30 test cases for your RAG app and 10 attack prompts (for example, a PDF that says “ignore "
             "your instructions”). Run them on every change and fix what fails."),
            ["You run your evals with one command",
             "You know your app's weakest spot and have a fix for it"],
        ),
        stage(
            "fine-tuning",
            "Fine-tuning and open models",
            "3 weeks",
            "Sometimes prompting isn't enough. Learn when to fine-tune, and how to do it cheaply on a free GPU.",
            ["When to fine-tune vs prompt vs RAG", "LoRA and QLoRA", "Preparing a dataset",
             "Running open models locally", "Quantization", "Reasoning models and RL (overview)"],
            [
                r("Unsloth documentation and free notebooks", "Unsloth", "https://docs.unsloth.ai/", "docs", "free",
                  "Fine-tune on a free Colab GPU."),
                r("PEFT", "Hugging Face", "https://huggingface.co/docs/peft", "docs", "free"),
                r("LLM Course: fine-tuning chapters", "Hugging Face", "https://huggingface.co/learn/llm-course",
                  "course", "free"),
                r("LoRA paper", "Hu et al.", "https://arxiv.org/abs/2106.09685", "paper", "free"),
                r("QLoRA paper", "Dettmers et al.", "https://arxiv.org/abs/2305.14314", "paper", "free"),
                r("Ollama", "Ollama", "https://ollama.com/", "practice", "free", "Run open models on your own laptop."),
                r("DeepSeek-R1 paper", "DeepSeek", "https://arxiv.org/abs/2501.12948", "paper", "free",
                  "How reasoning models are trained with reinforcement learning."),
            ],
            ("Beat the prompt",
             "Fine-tune a small open model (1–3B parameters) with QLoRA on a narrow task, such as turning messy notes "
             "into your college's exam format. Compare it with plain prompting, then run it locally with Ollama."),
            ["You can say when fine-tuning is worth it and when it isn't",
             "Your fine-tuned model beats the base model on your test set"],
        ),
        stage(
            "images-and-multimodal",
            "Images, audio and multimodal",
            "2 weeks (optional)",
            "Text is only one kind of generation. See how image, speech and vision-language models work, and where GANs and VAEs came from.",
            ["Diffusion models", "Text-to-image with Diffusers", "CLIP and image-text matching",
             "Speech-to-text with Whisper", "GANs and VAEs (the history)"],
            [
                r("Diffusion Models Course", "Hugging Face", "https://github.com/huggingface/diffusion-models-class",
                  "course", "free"),
                r("Diffusers documentation", "Hugging Face", "https://huggingface.co/docs/diffusers", "docs", "free"),
                r("CLIP paper", "Radford et al. · OpenAI", "https://arxiv.org/abs/2103.00020", "paper", "free"),
                r("Whisper", "OpenAI", "https://github.com/openai/whisper", "practice", "free",
                  "Open speech-to-text you can run yourself."),
                r("DCGAN tutorial", "PyTorch", "https://docs.pytorch.org/tutorials/beginner/dcgan_faces_tutorial.html",
                  "docs", "free", "Build a GAN once to see how generation started."),
            ],
            ("Lecture to notes",
             "Build a demo that turns a recorded lecture into notes with Whisper, then generates a diagram for one "
             "key idea with a diffusion model. Host it on Hugging Face Spaces."),
            ["You can explain how diffusion turns noise into an image",
             "Your demo works on a real recording"],
        ),
        stage(
            "ship-ai",
            "Ship a real AI product",
            "3 weeks",
            "Put it in front of real users: logins, limits, costs, speed and monitoring. This is what makes a project production-ready.",
            ["Serving open models (vLLM)", "Latency and cost", "Auth, rate limits and abuse",
             "Monitoring in production", "Staying current with research"],
            [
                r("AI Engineering", "Chip Huyen · O'Reilly",
                  "https://www.oreilly.com/library/view/ai-engineering/9781098166298/", "book", "paid",
                  "The best single book on building AI products."),
                r("vLLM documentation", "vLLM", "https://docs.vllm.ai/", "docs", "free"),
                r("Supabase", "Supabase", "https://supabase.com/docs", "docs", "free-tier",
                  "Database, login and storage for your app.", tool="supabase"),
                r("LMArena", "LMArena", "https://lmarena.ai/", "community", "free", "Compare models on real prompts."),
                r("Artificial Analysis", "Artificial Analysis", "https://artificialanalysis.ai/", "community", "free",
                  "Speed and price of every model."),
                r("r/LocalLLaMA", "Reddit", "https://www.reddit.com/r/LocalLLaMA/", "community", "free"),
            ],
            ("Launch it",
             "Deploy your RAG or agent app for real users with login, rate limits, a cost dashboard and your evals "
             "running on every change. Get 10 people to use it and fix what they hit."),
            ["Real people use your app from a link",
             "You know your cost per user and your slowest step",
             "Your evals run before every deploy"],
        ),
    ],
}

# Where each existing deep dive now lives: slug -> (track, stage)
DIVE_HOME = {
    "use-ai-to-learn-not-to-copy": ("ai-ml", "python-and-tools"),
    "how-ai-learns-the-story-from-1943-to-chatgpt": ("ai-ml", "classic-ml"),
    "why-ai-only-learns-from-its-mistakes": ("ai-ml", "deep-learning"),
    "what-an-llm-actually-is": ("gen-ai", "how-llms-work"),
    "your-first-llm-api-call": ("gen-ai", "llm-apis"),
    "what-rag-is-and-why-models-need-it": ("gen-ai", "rag"),
    "reading-pdfs-pymupdf-docling-or-mineru": ("gen-ai", "rag"),
    "chunks-and-embeddings-simply": ("gen-ai", "rag"),
    "why-colbert-keeps-every-word": ("gen-ai", "rag"),
    "make-it-say-i-dont-know": ("gen-ai", "rag"),
    "an-agent-is-more-than-a-chatbot": ("gen-ai", "agents-and-mcp"),
    "know-when-to-stop": ("gen-ai", "agents-and-mcp"),
    "data-is-not-authority": ("gen-ai", "agents-and-mcp"),
    "decide-then-check-then-act": ("gen-ai", "agents-and-mcp"),
    "design-for-failure-halfway": ("gen-ai", "agents-and-mcp"),
    "give-agents-budgets": ("gen-ai", "agents-and-mcp"),
    "memory-is-not-truth": ("gen-ai", "agents-and-mcp"),
    "every-agent-needs-an-identity": ("gen-ai", "agents-and-mcp"),
    "test-against-attacks": ("gen-ai", "evals-and-safety"),
    "agreement-is-not-evidence": ("gen-ai", "evals-and-safety"),
    "test-your-answers-automatically": ("gen-ai", "evals-and-safety"),
}


def main():
    tracks = [AIML, GENAI]
    for t in tracks:
        for i, s in enumerate(t["stages"], 1):
            s["position"] = i

    with io.open(os.path.join(SEED, "dives.json"), encoding="utf-8") as f:
        dives = json.load(f)
    order = {}
    for t in tracks:
        for s in t["stages"]:
            order[(t["slug"], s["slug"])] = s["position"]
    old_index = {d["slug"]: i for i, d in enumerate(dives)}
    for d in dives:
        track, stg = DIVE_HOME[d["slug"]]
        d["track"], d["stage"] = track, stg
    # Number dives within each track: by stage, then original order.
    for t in tracks:
        mine = sorted((d for d in dives if d["track"] == t["slug"]),
                      key=lambda d: (order[(t["slug"], d["stage"])], old_index[d["slug"]]))
        for i, d in enumerate(mine, 1):
            d["position"] = i
    dives.sort(key=lambda d: (d["track"] != "ai-ml", d["position"]))

    with io.open(os.path.join(SEED, "tracks.json"), "w", encoding="utf-8") as f:
        json.dump(tracks, f, ensure_ascii=False, indent=2)
        f.write("\n")
    with io.open(os.path.join(SEED, "dives.json"), "w", encoding="utf-8") as f:
        json.dump(dives, f, ensure_ascii=False, indent=2)
        f.write("\n")
    n = sum(len(s["resources"]) for t in tracks for s in t["stages"])
    print(f"tracks: {len(tracks)}, stages: {sum(len(t['stages']) for t in tracks)}, resources: {n}, dives: {len(dives)}")


if __name__ == "__main__":
    main()
