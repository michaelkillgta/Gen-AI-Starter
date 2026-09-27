"""Builds api/seed/tracks.json (two tracks, step-by-step stages with resources) and
re-homes the existing deep dives into those stages (api/seed/dives.json).

Sources merged: Uma's research files (ChatGPT and Google roadmaps for Generative AI, and
for AI/ML from scratch), plus gaps filled in by hand.

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


def stage(slug, title, weeks, why, topics, resources, project, done_when, mistakes=None):
    """project: (title, text) or (title, text, how you'll know it works)."""
    return {
        "slug": slug,
        "title": title,
        "weeks": weeks,
        "why": why,
        "topics": topics,
        "resources": resources,
        "project": {"title": project[0], "text": project[1], "check": project[2] if len(project) > 2 else None},
        "done_when": done_when,
        "mistakes": mistakes or [],
    }


# --------------------------------------------------------------------------- AI/ML track
# Rebuilt (27 Sept 2026) from Uma's two AI/ML research files: the ChatGPT "Learning AI/ML
# from Scratch" roadmap (roles, 12–18 month phases, projects with metrics, assessment,
# careers) and the Google "Comprehensive AI and ML Roadmap" (maths depth, honest
# validation, leakage, imbalanced metrics, transformers from scratch, vision, RL, MLOps
# with drift monitoring). Written for students in India at about 10 hours a week.

AIML = {
    "slug": "ai-ml",
    "name": "AI/ML track",
    "who": "The big one · from zero",
    "tone": "light",
    "duration": "About 12 months at 10 hours a week",
    "blurb": "Python, the maths you actually need, classic machine learning, testing models honestly, deep learning, "
    "transformers, vision, generative models, reinforcement learning and shipping models. The foundation every AI job assumes.",
    "start_if": "Start here if you're new to coding or AI, or you want ML engineer, data scientist or research roles.",
    "position": 1,
    "overview": {
        "roles": [
            {"title": "Machine learning engineer",
             "text": "Builds, ships and looks after models inside real products. The most common AI job. "
                     "Every stage matters, stages 3, 4 and 10 most."},
            {"title": "Data scientist",
             "text": "Finds answers in data and builds models that support decisions. "
                     "Stages 1 to 4 and 11 matter most."},
            {"title": "AI engineer",
             "text": "Builds apps on top of existing models. Do stages 1 to 6 here, then move to the Gen AI track."},
            {"title": "Research engineer",
             "text": "Trains and studies new models. Needs strong maths (stage 2) and stages 5 to 9 in depth; "
                     "often a master's or PhD later."},
        ],
        "phases": [
            {"title": "Foundations", "when": "Months 1–2",
             "text": "Python, data tools and just enough maths to understand what a model does.",
             "stages": ["python-and-tools", "maths-you-need"]},
            {"title": "Core machine learning", "when": "Months 3–4",
             "text": "The classic models that still run most businesses, and how to test any model honestly.",
             "stages": ["classic-ml", "evaluate-honestly"]},
            {"title": "Deep learning", "when": "Months 5–8",
             "text": "Neural networks from scratch, then the transformers behind LLMs and the models that see.",
             "stages": ["deep-learning", "language-and-transformers", "computer-vision"]},
            {"title": "Beyond prediction", "when": "Months 9–10",
             "text": "Models that create images and agents that learn by trial and error.",
             "stages": ["generative-models", "reinforcement-learning"]},
            {"title": "Ship it and get hired", "when": "Months 10–12",
             "text": "Put models in front of people safely and fairly, then turn your work into proof.",
             "stages": ["ship-ml", "responsible-ai", "portfolio-and-jobs"]},
        ],
        "pace_note": "Timings assume about 10 hours a week. Studying full time? Roughly halve them. "
                     "Already code in Python? Skim stage 1.",
        "checks": [
            {"title": "Beat a baseline",
             "text": "Start every project with the simplest possible model. If your fancy model can't beat it, "
                     "something is wrong."},
            {"title": "Explain it without notes",
             "text": "After each stage, explain its main idea out loud in two minutes. The gaps show up fast."},
            {"title": "Rebuild without the tutorial",
             "text": "Rebuild one thing from each stage without looking. Copying along doesn't count."},
            {"title": "Show your work",
             "text": "Push every project to GitHub, share it on Kaggle and ask for feedback. Other eyes catch what "
                     "you miss."},
        ],
    },
    "stages": [
        stage(
            "python-and-tools",
            "Python, data and the everyday tools",
            "4 weeks",
            "Every model, notebook and API you'll touch is Python, and most real data sits in SQL databases. "
            "Get comfortable with both before anything else.",
            ["Python basics, functions and classes", "NumPy arrays and vectorised maths", "Pandas dataframes",
             "SQL: select, filter, join, group by", "Plotting with Matplotlib and Seaborn",
             "Jupyter, Google Colab and VS Code", "Git, GitHub and the terminal"],
            [
                r("CS50's Introduction to Programming with Python", "Harvard", "https://cs50.harvard.edu/python/",
                  "course", "free", "The clearest start if you've never coded."),
                r("Kaggle Learn: Python", "Kaggle", "https://www.kaggle.com/learn/python", "course", "free",
                  "Short lessons with exercises in the browser."),
                r("Kaggle Learn: Pandas", "Kaggle", "https://www.kaggle.com/learn/pandas", "course", "free"),
                r("NumPy: the absolute basics for beginners", "NumPy",
                  "https://numpy.org/doc/stable/user/absolute_beginners.html", "docs", "free"),
                r("Kaggle Learn: Intro to SQL", "Kaggle", "https://www.kaggle.com/learn/intro-to-sql", "course", "free",
                  "Real queries on real datasets, in the browser."),
                r("SQLBolt", "SQLBolt", "https://sqlbolt.com/", "practice", "free",
                  "Interactive SQL lessons, one idea at a time."),
                r("The Missing Semester of Your CS Education", "MIT", "https://missing.csail.mit.edu/", "course", "free",
                  "The terminal, Git and tools nobody teaches in class."),
                r("GitHub Skills", "GitHub", "https://skills.github.com/", "practice", "free",
                  "Learn Git by doing it in a real repo."),
            ],
            ("Explore a real dataset",
             "Pick a dataset you care about (IPL matches, your city's weather, exam results from Kaggle). Load it into "
             "SQLite and answer 5 questions with SQL, then clean it with Pandas, make 5 charts, write what you found, "
             "and push the notebook to GitHub.",
             "Someone else can clone your repo, run the notebook top to bottom without errors, and read your 5 findings "
             "in the README."),
            ["You can write functions and a small class without looking things up",
             "You can load, clean and group a CSV in Pandas, and write the same query in SQL",
             "Your notebook is on GitHub with a readable README"],
            ["Writing Python loops over rows when one NumPy or Pandas operation would do it",
             "Keeping everything in one giant notebook with cells that only work in a certain order",
             "Not using Git until the end, then losing work"],
        ),
        stage(
            "maths-you-need",
            "The maths you actually need",
            "5 weeks (keep revisiting)",
            "Not a maths degree: just enough linear algebra, calculus and probability to understand what a model is "
            "doing and to fix it when it breaks.",
            ["Vectors, matrices and dot products", "Matrix shapes and multiplication", "Eigenvectors and SVD (the idea behind PCA and LoRA)",
             "Derivatives, gradients and the chain rule", "Gradient descent and the learning rate",
             "Mean, variance and common distributions", "Probability and Bayes' rule",
             "Maximum likelihood: why training means minimising a loss",
             "Entropy, cross-entropy and KL divergence (the intuition)"],
            [
                r("Essence of Linear Algebra", "3Blue1Brown", "https://www.3blue1brown.com/topics/linear-algebra",
                  "video", "free", "Watch this first: pictures before formulas."),
                r("Essence of Calculus", "3Blue1Brown", "https://www.3blue1brown.com/topics/calculus", "video", "free"),
                r("Mathematics for Machine Learning and Data Science", "DeepLearning.AI",
                  "https://www.coursera.org/specializations/mathematics-for-machine-learning-and-data-science",
                  "course", "free-audit", "Maths taught with Python, aimed at ML beginners."),
                r("Statistics and Probability", "Khan Academy",
                  "https://www.khanacademy.org/math/statistics-probability", "course", "free"),
                r("Seeing Theory", "Brown University", "https://seeing-theory.brown.edu/", "practice", "free",
                  "Probability and statistics you can play with."),
                r("StatQuest", "Josh Starmer", "https://www.youtube.com/@statquest", "video", "free",
                  "Short, friendly explanations of every stats and ML idea."),
                r("Linear Algebra (18.06)", "Gilbert Strang · MIT OpenCourseWare",
                  "https://ocw.mit.edu/courses/18-06-linear-algebra-spring-2010/", "course", "free",
                  "Go deeper once the 3Blue1Brown pictures click."),
                r("Mathematics for Machine Learning", "Deisenroth, Faisal, Ong", "https://mml-book.github.io/",
                  "book", "free", "Free PDF. Use as a reference, not cover to cover."),
            ],
            ("Gradient descent by hand",
             "Implement linear regression with gradient descent in plain NumPy, no ML libraries. Plot the loss going "
             "down, try a learning rate that's too big and explain what happens, then check your answer against the "
             "closed-form solution.",
             "Your gradient descent weights match NumPy's least-squares answer to 3 decimal places."),
            ["You can explain a dot product and a gradient in your own words",
             "You can say why we take small steps downhill to train a model",
             "You can explain why classification models minimise cross-entropy",
             "You know what mean, variance and a normal distribution are"],
            ["Trying to finish a whole maths textbook before writing any ML code",
             "Memorising formulas without being able to draw what they mean",
             "Skipping matrix shapes, then fighting shape errors in every model"],
        ),
        stage(
            "classic-ml",
            "Classic machine learning",
            "6 weeks",
            "Most real business problems on tables of data (fraud, credit, sales, ranking) are still solved with these "
            "models. They're fast, cheap and easy to explain, and on tabular data they often beat deep learning.",
            ["Supervised vs unsupervised learning", "Linear regression, Ridge and Lasso (regularisation)",
             "Logistic regression", "Support vector machines and kernels", "Decision trees and random forests",
             "Gradient boosting: XGBoost, LightGBM, CatBoost", "Clustering: k-means and Gaussian mixtures",
             "PCA for fewer, better features", "Feature engineering: scaling, one-hot and target encoding",
             "scikit-learn pipelines"],
            [
                r("Machine Learning Specialization", "Andrew Ng · DeepLearning.AI",
                  "https://www.coursera.org/specializations/machine-learning-introduction", "course", "free-audit",
                  "The classic start. Audit for free, or apply for Coursera financial aid for the certificate."),
                r("Machine Learning Crash Course", "Google", "https://developers.google.com/machine-learning/crash-course",
                  "course", "free"),
                r("Kaggle Learn: Intro to Machine Learning", "Kaggle",
                  "https://www.kaggle.com/learn/intro-to-machine-learning", "course", "free",
                  "Then take Intermediate Machine Learning."),
                r("An Introduction to Statistical Learning (with Python)", "James, Witten, Hastie, Tibshirani",
                  "https://www.statlearning.com/", "book", "free", "Free PDF. The friendliest serious ML textbook."),
                r("scikit-learn User Guide", "scikit-learn", "https://scikit-learn.org/stable/user_guide.html", "docs",
                  "free"),
                r("XGBoost documentation", "XGBoost", "https://xgboost.readthedocs.io/", "docs", "free",
                  "Start with the Python tutorials."),
                r("Hands-On Machine Learning (3rd edition) notebooks", "Aurélien Géron",
                  "https://github.com/ageron/handson-ml3", "book", "free",
                  "The notebooks are free; the book itself is paid and worth it."),
                r("CS229: Machine Learning", "Stanford", "https://cs229.stanford.edu/", "course", "free",
                  "Advanced: the maths behind every model. Come back to it later."),
            ],
            ("Two Kaggle problems, done properly",
             "Solve Kaggle's Titanic (classification) and House Prices (regression) with scikit-learn pipelines. "
             "Compare a simple model, a random forest and XGBoost with cross-validation, and write down which features "
             "mattered and why.",
             "Your best model beats a simple baseline in cross-validation, and your Kaggle leaderboard score is close to "
             "your own validation score."),
            ["You never judge a model on the data it trained on",
             "You can explain what regularisation does and when you need it",
             "You can explain why gradient boosting beat (or lost to) logistic regression on your data"],
            ["Filling missing values or scaling on the whole dataset before splitting (that's leakage)",
             "Reaching for deep learning on table data where gradient boosting wins",
             "Trusting one lucky train/test split instead of cross-validation"],
        ),
        stage(
            "evaluate-honestly",
            "Test models honestly",
            "3 weeks",
            "A model that looks 99% accurate can be useless. Learn to measure properly before you trust any number, "
            "yours or anyone else's. This is what separates engineers from tutorial-followers.",
            ["Baselines first", "Train, validation and test splits", "Stratified k-fold cross-validation",
             "Time-series splits: never train on the future", "Group splits: the same person never in both sets",
             "Data leakage and how to catch it", "Confusion matrix, precision, recall and F1",
             "ROC-AUC vs PR-AUC for rare events", "RMSE vs MAE", "Bias vs variance, underfitting vs overfitting",
             "Learning curves", "Hyperparameter tuning with Optuna"],
            [
                r("Classification: accuracy, precision and recall", "Google Machine Learning Crash Course",
                  "https://developers.google.com/machine-learning/crash-course/classification/accuracy-precision-recall",
                  "course", "free", "The clearest explanation of why accuracy misleads."),
                r("Common pitfalls and recommended practices", "scikit-learn",
                  "https://scikit-learn.org/stable/common_pitfalls.html", "docs", "free",
                  "Short, and it covers leakage properly."),
                r("Cross-validation: evaluating estimator performance", "scikit-learn",
                  "https://scikit-learn.org/stable/modules/cross_validation.html", "docs", "free",
                  "Stratified, group and time-series splits with code."),
                r("Data Leakage", "Kaggle Learn", "https://www.kaggle.com/code/alexisbcook/data-leakage", "course",
                  "free", "Part of Intermediate Machine Learning."),
                r("Machine Learning Fundamentals: Bias and Variance", "StatQuest",
                  "https://www.youtube.com/watch?v=EuBBz3bI-aA", "video", "free"),
                r("Optuna", "Optuna", "https://optuna.org/", "docs", "free",
                  "Tunes hyperparameters for you, far better than grid search."),
            ],
            ("Break your own model",
             "Use Kaggle's Credit Card Fraud dataset (0.17% fraud). Show that “always say not fraud” scores "
             "99.8% accuracy. Build a real model and report precision, recall and PR-AUC instead. Then add a leak on "
             "purpose (a feature computed from the whole dataset) and show how it inflates the score.",
             "Your write-up shows the baseline, the leaky score and the honest score side by side, and your honest "
             "PR-AUC clearly beats the baseline."),
            ["You always compare against a baseline",
             "You can choose between precision and recall for a real problem and justify it",
             "You can explain data leakage with an example",
             "You can read a learning curve and say whether a model underfits or overfits"],
            ["Reporting accuracy on imbalanced data",
             "Shuffling time-series data, so the model peeks at the future",
             "Checking the test set again and again until the number looks good"],
        ),
        stage(
            "deep-learning",
            "Deep learning",
            "8 weeks",
            "Neural networks power everything in the rest of this track and the Gen AI track. Build one from scratch "
            "once, and nothing after feels like magic.",
            ["Neurons, layers and activations (ReLU, GELU)", "Loss functions", "Backpropagation and autograd",
             "Training loops in PyTorch", "Optimisers: SGD, Adam, AdamW",
             "Learning-rate schedules, warmup and gradient clipping",
             "Overfitting fixes: augmentation, dropout, weight decay, early stopping",
             "Batch and layer normalisation", "CNNs: convolution, stride, padding, pooling",
             "ResNets and skip connections", "Transfer learning", "GPUs on Colab and Kaggle"],
            [
                r("Neural Networks: Zero to Hero", "Andrej Karpathy", "https://karpathy.ai/zero-to-hero.html", "video",
                  "free", "Builds a neural network engine from scratch. The single best resource here."),
                r("Practical Deep Learning for Coders", "fast.ai", "https://course.fast.ai/", "course", "free",
                  "Top-down and practical: working models from lesson one."),
                r("PyTorch: Learn the Basics", "PyTorch",
                  "https://docs.pytorch.org/tutorials/beginner/basics/intro.html", "docs", "free"),
                r("Dive into Deep Learning", "Zhang, Lipton, Li, Smola", "https://d2l.ai/", "book", "free",
                  "Free interactive book with runnable code."),
                r("Understanding Deep Learning", "Simon J.D. Prince", "https://udlbook.github.io/udlbook/", "book",
                  "free", "Free PDF with excellent diagrams and notebooks."),
                r("MIT 6.S191: Introduction to Deep Learning", "MIT", "https://introtodeeplearning.com/", "video",
                  "free"),
                r("Deep Learning Specialization", "Andrew Ng · DeepLearning.AI",
                  "https://www.coursera.org/specializations/deep-learning", "course", "free-audit"),
                r("Deep Learning", "Goodfellow, Bengio, Courville", "https://www.deeplearningbook.org/", "book", "free",
                  "The classic reference. Read chapters when you need them."),
            ],
            ("From micrograd to a real classifier",
             "Follow Karpathy's micrograd lecture and build it yourself. Then train a CNN in PyTorch on a small image "
             "dataset you collect (for example, Indian dishes), first from scratch and then with transfer learning "
             "from a pretrained ResNet.",
             "Transfer learning beats your from-scratch model on the same validation set, and you can show the loss "
             "curves for both."),
            ["You can write a PyTorch training loop without copying it",
             "You can explain backpropagation with a small example",
             "You know how to spot and fix overfitting",
             "You can say why skip connections let very deep networks train"],
            ["Forgetting model.eval() and torch.no_grad() when evaluating",
             "A learning rate so high the loss turns into NaN",
             "Not normalising inputs",
             "Training for hours without checking the GPU is actually being used"],
        ),
        stage(
            "language-and-transformers",
            "Language models and transformers",
            "6 weeks",
            "Every LLM is a transformer trained to predict the next token. Build a small one yourself and the Gen AI "
            "track will make complete sense.",
            ["Text as tokens: byte-pair encoding", "Word embeddings: Word2Vec", "RNNs and LSTMs, and why they were slow",
             "Attention and self-attention", "The Transformer: multi-head attention, positions, layer norm",
             "Causal masking", "Encoders (BERT) vs decoders (GPT)", "Pre-training vs fine-tuning",
             "Parameter-efficient fine-tuning with LoRA"],
            [
                r("The Illustrated Transformer", "Jay Alammar", "https://jalammar.github.io/illustrated-transformer/",
                  "docs", "free", "Read this before any code: the whole idea in pictures."),
                r("Let's build GPT: from scratch, in code, spelled out", "Andrej Karpathy",
                  "https://www.youtube.com/watch?v=kCc8FmEb1nY", "video", "free",
                  "Two hours that demystify every LLM."),
                r("Let's build the GPT Tokenizer", "Andrej Karpathy", "https://www.youtube.com/watch?v=zduSFxRajkE",
                  "video", "free"),
                r("Build a Large Language Model (From Scratch): code", "Sebastian Raschka",
                  "https://github.com/rasbt/LLMs-from-scratch", "book", "free",
                  "The code and videos are free; the book is paid."),
                r("CS224n: Natural Language Processing with Deep Learning", "Stanford",
                  "https://web.stanford.edu/class/cs224n/", "course", "free"),
                r("LLM Course", "Hugging Face", "https://huggingface.co/learn/llm-course", "course", "free",
                  "Transformers, tokenizers and fine-tuning, hands-on."),
                r("Attention Is All You Need", "Vaswani et al., 2017", "https://arxiv.org/abs/1706.03762", "paper",
                  "free", "The paper that started it. Read it after the pictures and the code."),
                r("Speech and Language Processing", "Jurafsky & Martin", "https://web.stanford.edu/~jurafsky/slp3/",
                  "book", "free", "Free draft. The reference for NLP."),
            ],
            ("Your own tiny GPT, then a real fine-tune",
             "Train a small GPT from scratch on a text you like (Premchand stories, film dialogues, your college's "
             "notices). Then fine-tune DistilBERT for sentiment on Indian product reviews and compare it with a "
             "TF-IDF + logistic regression baseline.",
             "Validation loss goes down steadily, generated samples look like the training text, and fine-tuned "
             "DistilBERT beats the baseline's F1."),
            ["You can explain self-attention with a small example",
             "You can say why transformers train faster than RNNs",
             "You have trained a small language model from scratch",
             "You can explain when to use BERT-style vs GPT-style models"],
            ["Forgetting the causal mask, so the model cheats by seeing future tokens",
             "Comparing models with different tokenizers by raw loss",
             "Fine-tuning a big model before trying a simple baseline"],
        ),
        stage(
            "computer-vision",
            "Computer vision beyond classification",
            "4 weeks",
            "Real vision products don't just label a photo: they find things, outline them and run fast on small "
            "devices. Learn detection, segmentation and how to make models quick.",
            ["Object detection with YOLO", "Bounding boxes, IoU and mAP", "Segmentation with U-Net",
             "Vision Transformers (ViT)", "Labelling your own data", "Augmentation with Albumentations",
             "Exporting to ONNX for fast inference"],
            [
                r("CS231n: Deep Learning for Computer Vision", "Stanford", "https://cs231n.stanford.edu/", "course",
                  "free", "Lectures and notes are free online."),
                r("Computer Vision Course", "Hugging Face", "https://huggingface.co/learn/computer-vision-course",
                  "course", "free"),
                r("Ultralytics YOLO docs", "Ultralytics", "https://docs.ultralytics.com/", "docs", "free",
                  "Train a detector on your own data in an afternoon."),
                r("Roboflow Universe", "Roboflow", "https://universe.roboflow.com/", "practice", "free-tier",
                  "Thousands of labelled datasets, and a tool to label your own."),
                r("Albumentations", "Albumentations", "https://albumentations.ai/docs/", "docs", "free"),
                r("ONNX Runtime", "Microsoft", "https://onnxruntime.ai/docs/", "docs", "free",
                  "Run models fast on CPUs and phones."),
            ],
            ("Detect something useful",
             "Collect and label about 200 images of something that matters where you live (potholes, helmets on "
             "two-wheelers, crop diseases). Fine-tune a YOLO model, export it to ONNX, and run it on a phone video.",
             "You report mAP@50 on images the model never saw, and it runs in real time on a laptop CPU."),
            ["You can explain IoU and mAP",
             "You have trained a detector on data you labelled",
             "You can make a model faster with export and quantisation"],
            ["Frames from the same video in both training and test sets (leakage again)",
             "Measuring detection with accuracy instead of mAP",
             "Too few examples of the rare classes you care about most"],
        ),
        stage(
            "generative-models",
            "Generative models: GANs, VAEs and diffusion",
            "3 weeks",
            "Models that create images, audio and video are built on a few ideas. Learn them, and tools like Stable "
            "Diffusion stop being black boxes.",
            ["Autoencoders and VAEs: latent spaces", "GANs: generator vs discriminator", "Mode collapse and unstable training",
             "Diffusion: adding and removing noise", "Text-to-image: how text guides an image",
             "Judging generated images: FID", "Deepfakes, consent and watermarking"],
            [
                r("Diffusion Models Course", "Hugging Face", "https://huggingface.co/learn/diffusion-course", "course",
                  "free"),
                r("What are Diffusion Models?", "Lilian Weng",
                  "https://lilianweng.github.io/posts/2021-07-11-diffusion-models/", "docs", "free",
                  "Deep but clear. Read after the course."),
                r("DCGAN tutorial", "PyTorch", "https://docs.pytorch.org/tutorials/beginner/dcgan_faces_tutorial.html",
                  "docs", "free"),
                r("Diffusers", "Hugging Face", "https://huggingface.co/docs/diffusers", "docs", "free"),
                r("Generative Adversarial Nets", "Goodfellow et al., 2014", "https://arxiv.org/abs/1406.2661", "paper",
                  "free"),
            ],
            ("Generate, then judge",
             "Train a small GAN or VAE on Fashion-MNIST and save samples as training goes. Then use Diffusers to "
             "generate images with a pretrained diffusion model and compare the two approaches.",
             "You can show samples improving over training and explain one failure you saw, such as mode collapse."),
            ["You can explain how a GAN trains",
             "You can explain the noise-in, noise-out idea behind diffusion",
             "You can say why generated faces need consent"],
            ["Judging a generator only by a few good-looking samples",
             "Letting the discriminator get far stronger than the generator",
             "Using real people's photos without consent"],
        ),
        stage(
            "reinforcement-learning",
            "Reinforcement learning",
            "3 weeks",
            "Some problems have no labels, only rewards: games, robots, recommendations and training LLMs to follow "
            "instructions (RLHF). Reinforcement learning is how models learn from trial and error.",
            ["Agents, states, actions and rewards", "Markov decision processes and discounting", "Q-learning",
             "Deep Q-Networks: replay buffers and target networks", "Policy gradients and PPO",
             "RL for language models: RLHF and GRPO", "Gymnasium and Stable-Baselines3"],
            [
                r("Deep Reinforcement Learning Course", "Hugging Face", "https://huggingface.co/learn/deep-rl-course",
                  "course", "free", "Hands-on from Q-learning to PPO."),
                r("Spinning Up in Deep RL", "OpenAI", "https://spinningup.openai.com/", "docs", "free"),
                r("Reinforcement Learning: An Introduction", "Sutton & Barto",
                  "http://incompleteideas.net/book/the-book-2nd.html", "book", "free", "Free PDF. The classic."),
                r("Gymnasium", "Farama Foundation", "https://gymnasium.farama.org/", "docs", "free",
                  "The standard set of practice environments."),
                r("Stable-Baselines3", "Stable-Baselines3", "https://stable-baselines3.readthedocs.io/", "docs",
                  "free"),
                r("Illustrating Reinforcement Learning from Human Feedback", "Hugging Face",
                  "https://huggingface.co/blog/rlhf", "docs", "free", "How RL turns a base model into an assistant."),
            ],
            ("Teach an agent to balance, then land",
             "Solve CartPole with a Deep Q-Network you write yourself, then train PPO with Stable-Baselines3 on "
             "LunarLander. Plot the average reward as training goes.",
             "The average reward over 100 episodes passes the environment's “solved” mark: 475 for CartPole, "
             "200 for LunarLander."),
            ["You can explain states, actions, rewards and discounting",
             "You can say why DQN needs a replay buffer",
             "You can explain what RLHF adds to a language model"],
            ["Judging an agent by one lucky episode",
             "A reward the agent can game without solving the task",
             "Comparing runs without fixing the random seed"],
        ),
        stage(
            "ship-ml",
            "Ship it: MLOps and deployment",
            "6 weeks",
            "A model in a notebook helps nobody. Learn to serve it, version it, test it automatically and notice when it "
            "quietly gets worse once real people use it.",
            ["APIs with FastAPI and input validation", "Docker containers", "Demos with Gradio on Hugging Face Spaces",
             "Experiment tracking with MLflow", "Data versioning with DVC", "Automated tests and deploys with GitHub Actions",
             "Scheduled pipelines (Airflow or Prefect)", "Data drift and concept drift", "Monitoring with Evidently",
             "Cloud basics: SageMaker, Vertex AI or Azure ML, and GPU costs"],
            [
                r("Made With ML", "Goku Mohandas", "https://madewithml.com/", "course", "free",
                  "Production ML end to end, written for engineers."),
                r("MLOps Zoomcamp", "DataTalks.Club", "https://github.com/DataTalksClub/mlops-zoomcamp", "course",
                  "free", "Free cohort course with homework and a community."),
                r("FastAPI Tutorial", "FastAPI", "https://fastapi.tiangolo.com/tutorial/", "docs", "free"),
                r("Docker: Get started", "Docker", "https://docs.docker.com/get-started/", "docs", "free"),
                r("MLflow", "MLflow", "https://mlflow.org/docs/latest/index.html", "docs", "free",
                  "Track every experiment and which model is live."),
                r("DVC: Get Started", "DVC", "https://dvc.org/doc/start", "docs", "free",
                  "Version datasets without putting them in Git."),
                r("Evidently", "Evidently AI", "https://docs.evidentlyai.com/", "docs", "free",
                  "Drift and data-quality reports in a few lines."),
                r("Gradio Quickstart", "Gradio", "https://www.gradio.app/guides/quickstart", "docs", "free"),
                r("Hugging Face Spaces", "Hugging Face", "https://huggingface.co/docs/hub/spaces", "docs", "free-tier",
                  "Free hosting for demos."),
                r("Modal", "Modal", "https://modal.com/", "practice", "free-tier",
                  "Run heavy models on cloud GPUs by the second.", tool="modal"),
            ],
            ("Put your model on the internet, properly",
             "Take your stage 4 or 7 model. Wrap it in a FastAPI service inside Docker, track training runs with MLflow, "
             "version the data with DVC, run tests on every push with GitHub Actions, add a Gradio demo on Hugging Face "
             "Spaces, and log every prediction.",
             "Anyone can try it from a link, a push runs your tests automatically, and when you feed it shifted data on "
             "purpose, your Evidently drift report flags it."),
            ["Anyone can try your model from a link",
             "Your service runs the same on your laptop and in the cloud",
             "You can say which data and code trained the model that's live",
             "You can tell when it starts getting worse"],
            ["Preparing inputs one way in training and another way in the API",
             "No input validation, so one bad request crashes the service",
             "Never looking at the model again after launch"],
        ),
        stage(
            "responsible-ai",
            "Responsible AI: fairness, privacy and explanations",
            "2 weeks (alongside stage 10)",
            "Models make decisions about people: loans, jobs, admissions. Knowing how they fail some groups, how to "
            "explain them and what the law says about personal data is part of the job, not an extra.",
            ["Where bias comes from: data, labels and proxies", "Fairness metrics: demographic parity, equal opportunity",
             "Explaining predictions with SHAP", "Privacy, consent and anonymisation",
             "India's DPDP Act 2023 and Europe's GDPR", "Model cards and datasheets",
             "UNESCO's Recommendation on the Ethics of AI"],
            [
                r("Kaggle Learn: Intro to AI Ethics", "Kaggle", "https://www.kaggle.com/learn/intro-to-ai-ethics",
                  "course", "free", "Short and practical."),
                r("Fairness", "Google Machine Learning Crash Course",
                  "https://developers.google.com/machine-learning/crash-course/fairness", "course", "free"),
                r("Fairlearn", "Fairlearn", "https://fairlearn.org/", "docs", "free",
                  "Measure and reduce unfairness in scikit-learn models."),
                r("Interpretable Machine Learning", "Christoph Molnar",
                  "https://christophm.github.io/interpretable-ml-book/", "book", "free"),
                r("SHAP", "SHAP", "https://shap.readthedocs.io/", "docs", "free"),
                r("Model Cards for Model Reporting", "Mitchell et al., 2019", "https://arxiv.org/abs/1810.03993",
                  "paper", "free"),
                r("Recommendation on the Ethics of Artificial Intelligence", "UNESCO",
                  "https://www.unesco.org/en/artificial-intelligence/recommendation-ethics", "docs", "free"),
            ],
            ("Audit a model",
             "Take a model you built (or train one on the UCI Adult income dataset). Measure its results for each group, "
             "explain its predictions with SHAP, and write a model card that says what it's for, how it was tested and "
             "where it fails.",
             "Your model card shows results per group, names at least one real limitation and says who should not use "
             "the model."),
            ["You can name three ways bias gets into a model",
             "You can measure a model's results per group",
             "You can explain one prediction with SHAP",
             "You know the basics of India's data protection law"],
            ["Deleting the sensitive column and assuming the model is now fair (other columns act as proxies)",
             "Reporting one overall score that hides a group the model fails",
             "Collecting personal data without clear consent"],
        ),
        stage(
            "portfolio-and-jobs",
            "Portfolio, interviews and staying current",
            "Ongoing",
            "Turn what you built into proof. Recruiters look for finished projects you can explain, not certificates. "
            "And AI moves fast, so build a habit of keeping up.",
            ["Writing a strong README", "Explaining trade-offs", "Kaggle competitions",
             "ML interview questions: bias-variance, gradient descent, metrics",
             "ML system design interviews", "Coding interviews: data structures and algorithms",
             "Reading papers", "Newsletters and communities"],
            [
                r("Kaggle Competitions", "Kaggle", "https://www.kaggle.com/competitions", "practice", "free"),
                r("Introduction to Machine Learning Interviews", "Chip Huyen", "https://huyenchip.com/ml-interviews-book/",
                  "book", "free"),
                r("Designing Machine Learning Systems", "Chip Huyen · O'Reilly",
                  "https://www.oreilly.com/library/view/designing-machine-learning/9781098107956/", "book", "paid",
                  "The best book on ML system design interviews."),
                r("NeetCode", "NeetCode", "https://neetcode.io/", "practice", "free-tier",
                  "Structured practice for coding interviews."),
                r("The Batch", "DeepLearning.AI", "https://www.deeplearning.ai/the-batch/", "community", "free",
                  "A weekly newsletter on what matters in AI."),
                r("Daily Papers", "Hugging Face", "https://huggingface.co/papers", "community", "free",
                  "The easiest way to follow new research."),
            ],
            ("Four projects that prove it",
             "Polish four projects from this track: a tabular model tested honestly (stages 3–4), a vision system "
             "(stage 7), a transformer from scratch (stage 6) and a deployed, monitored service (stage 10). Each gets a "
             "clear README, a live demo, what didn't work and what you'd do next. Then enter one Kaggle competition.",
             "A stranger can open each repo, understand it from the README and try the live demo within 10 minutes."),
            ["Four projects with live demos and honest READMEs",
             "You can walk an interviewer through one project's trade-offs in five minutes",
             "You read one paper or newsletter a week"],
            ["Listing certificates instead of projects",
             "Projects copied from tutorials with nothing of your own",
             "Not being able to explain your own code in an interview"],
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
    "trees-still-win-on-tables": ("ai-ml", "classic-ml"),
    "accuracy-can-lie": ("ai-ml", "evaluate-honestly"),
    "leakage-when-your-model-cheats": ("ai-ml", "evaluate-honestly"),
    "why-ai-only-learns-from-its-mistakes": ("ai-ml", "deep-learning"),
    "attention-in-plain-words": ("ai-ml", "language-and-transformers"),
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
