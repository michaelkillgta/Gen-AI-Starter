"""Adds (or updates) the AI/ML track's deep dives on ideas from Uma's AI/ML research files:
testing models honestly, leakage, tree models on tabular data and attention.

Run from the repo root, then run scripts/seed-tracks.py to place them in their stages:
    python scripts/seed-aiml-dives.py && python scripts/seed-tracks.py
"""
import importlib.util
import io
import json
import os

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PATH = os.path.join(ROOT, "api", "seed", "dives.json")

# Reuse the block helpers from the other dive script.
_spec = importlib.util.spec_from_file_location("bodies", os.path.join(ROOT, "scripts", "seed-dive-bodies.py"))
_b = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(_b)
p, h, cards, compare, callout, try_it, interview = (
    _b.p, _b.h, _b.cards, _b.compare, _b.callout, _b.try_it, _b.interview)


NEW = [
    dict(
        slug="trees-still-win-on-tables",
        title="Trees still win on tables",
        stage="classic-ml",
        tools=[],
        tldr=[
            "For data in rows and columns (sales, marks, transactions), gradient-boosted trees usually beat deep learning.",
            "They train in minutes on a laptop, need little tuning and are easy to explain.",
            "Try XGBoost or LightGBM first; reach for neural networks when the data is images, audio or text.",
        ],
        body=[
            p("It's tempting to throw a neural network at every problem. But look inside a bank's fraud system, an "
              "e-commerce ranking engine or a sales forecast and you'll usually find gradient-boosted trees, not deep "
              "learning. On tabular data they keep winning."),
            h("How boosting works, in plain words"),
            p("A single decision tree asks yes/no questions (“Is the amount above ₹50,000?”) and is easy "
              "to fool. Boosting builds hundreds of small trees one after another. Each new tree focuses on the mistakes "
              "the trees before it still make. Added together, they make a strong model."),
            h("Why they beat neural networks on tables"),
            cards(
                ("Columns mean different things", "Age, city and amount are unrelated scales. Trees split on each column "
                                                  "separately; neural networks struggle with that mix."),
                ("Less data needed", "Thousands of rows are enough for trees. Deep learning usually wants far more."),
                ("Fast and cheap", "Training takes minutes on a laptop CPU, and predictions take microseconds."),
                ("Easy to explain", "You can show which features drove a decision, which banks and regulators need."),
            ),
            compare("Deep learning first", ["Big network on a CSV", "Hours of tuning on a GPU"], "Often worse, hard to explain",
                    "Boosted trees first", ["XGBoost with defaults", "Minutes on a laptop"], "Strong baseline to beat"),
            callout("Use the simplest model that works. On tables, that's usually gradient-boosted trees."),
        ],
        try_it=try_it(
            "20 minutes",
            "Compare logistic regression, a random forest and XGBoost on the same data with cross-validation "
            "(“pip install scikit-learn xgboost”).",
            """
from sklearn.datasets import load_breast_cancer
from sklearn.ensemble import RandomForestClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import cross_val_score
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import StandardScaler
from xgboost import XGBClassifier

X, y = load_breast_cancer(return_X_y=True)
models = {
    "logistic regression": make_pipeline(StandardScaler(), LogisticRegression(max_iter=1000)),
    "random forest": RandomForestClassifier(random_state=0),
    "xgboost": XGBClassifier(eval_metric="logloss"),
}
for name, model in models.items():
    scores = cross_val_score(model, X, y, cv=5, scoring="roc_auc")
    print(f"{name:20} {scores.mean():.3f} ± {scores.std():.3f}")
""",
        ),
        interview=interview(
            "Would you use deep learning for a fraud detection model on transaction data?",
            "Probably not first. Start with gradient-boosted trees: they're usually as accurate or better on tabular "
            "data, faster, cheaper and explainable. Consider deep learning if there's sequence or text data they can't use.",
        ),
    ),
    dict(
        slug="accuracy-can-lie",
        title="Accuracy can lie",
        stage="evaluate-honestly",
        tools=[],
        tldr=[
            "If 99% of transactions are genuine, a model that always says “genuine” is 99% accurate and useless.",
            "Measure what matters instead: precision, recall and PR-AUC.",
            "Always compare against the dumbest possible model first.",
        ],
        body=[
            p("A student proudly reports a fraud detector with 99.8% accuracy. Then someone checks: it never flags a "
              "single fraud. Only 0.2% of transactions were fraud, so answering “not fraud” every time scores "
              "99.8%. The model learned nothing."),
            h("Four outcomes, not one number"),
            cards(
                ("True positive", "It said fraud, and it was fraud. What you want."),
                ("False positive", "It said fraud, but it was genuine. An annoyed customer."),
                ("False negative", "It said genuine, but it was fraud. Money lost."),
                ("True negative", "It said genuine, and it was. The easy, common case."),
            ),
            h("Precision and recall, in plain words"),
            p("Precision: of everything the model flagged, how much was really fraud? Recall: of all the real fraud, how "
              "much did the model catch? Which one matters more depends on the cost of each mistake. For cancer "
              "screening, missing a case is worst, so you want high recall. For a spam filter, hiding a real email is "
              "worst, so you want high precision."),
            compare("Accuracy only", ["99.8% accurate", "Looks great"], "Catches zero fraud",
                    "Precision, recall, PR-AUC", ["Compared with a baseline", "Tied to the cost of mistakes"],
                    "Shows what the model really does"),
            callout("Before you trust a score, ask: what would a model that always gives the same answer get?"),
        ],
        try_it=try_it(
            "15 minutes",
            "See accuracy lie on an imbalanced dataset, then measure properly.",
            """
from sklearn.datasets import make_classification
from sklearn.dummy import DummyClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import accuracy_score, average_precision_score, classification_report
from sklearn.model_selection import train_test_split

X, y = make_classification(n_samples=20000, weights=[0.99], random_state=0)   # 1% positives
X_tr, X_te, y_tr, y_te = train_test_split(X, y, stratify=y, random_state=0)

for model in [DummyClassifier(strategy="most_frequent"), LogisticRegression(max_iter=1000)]:
    model.fit(X_tr, y_tr)
    print(type(model).__name__, "accuracy:", round(accuracy_score(y_te, model.predict(X_te)), 3),
          "PR-AUC:", round(average_precision_score(y_te, model.predict_proba(X_te)[:, 1]), 3))
print(classification_report(y_te, model.predict(X_te)))
""",
        ),
        interview=interview(
            "Your model has 98% accuracy. Is it good?",
            "It depends on the class balance and the cost of each mistake. Ask what a constant baseline scores, then "
            "look at precision, recall and PR-AUC for the class that matters, and pick the threshold based on the "
            "cost of false positives versus false negatives.",
        ),
    ),
    dict(
        slug="leakage-when-your-model-cheats",
        title="Leakage: when your model cheats",
        stage="evaluate-honestly",
        tools=[],
        tldr=[
            "Leakage is when information from the test data, or from the future, sneaks into training.",
            "It makes scores look amazing in your notebook and collapse in the real world.",
            "Split first, then do every calculation on the training data only.",
        ],
        body=[
            p("Your model predicts which students will fail an exam with 97% accuracy. It's put into use, and it's no "
              "better than guessing. What went wrong? One feature was “attended the re-exam”: only students who "
              "failed take the re-exam. The model had the answer hidden in its inputs."),
            h("Three common kinds of leakage"),
            cards(
                ("Features from the future", "A column that's only known after the outcome, like “refund issued” "
                                             "when predicting fraud."),
                ("Preparing data before splitting", "Scaling or filling gaps using averages from the whole dataset lets "
                                                    "test data shape training."),
                ("The same thing in both sets", "Photos from one video, or one patient's scans, in both training and "
                                                "test. The model memorises the person, not the pattern."),
            ),
            h("How to catch it"),
            cards(
                ("Too good to be true", "If a score is much better than published results, suspect leakage first."),
                ("Check top features", "If the most important feature is something you wouldn't know at prediction "
                                       "time, it's a leak."),
                ("Use pipelines", "Put every preparation step in a scikit-learn Pipeline so it's learned inside each "
                                  "training fold only."),
            ),
            callout("Ask of every feature: would I really have this at the moment I make the prediction?"),
        ],
        try_it=try_it(
            "15 minutes",
            "Watch leakage inflate a score. Selecting features on the whole dataset makes pure noise look predictive.",
            """
import numpy as np
from sklearn.feature_selection import SelectKBest, f_classif
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import cross_val_score
from sklearn.pipeline import make_pipeline

rng = np.random.default_rng(0)
X = rng.normal(size=(200, 5000))          # pure noise
y = rng.integers(0, 2, size=200)          # random labels: nothing to learn

leaky_X = SelectKBest(f_classif, k=20).fit_transform(X, y)   # selected using ALL rows
print("leaky :", cross_val_score(LogisticRegression(), leaky_X, y, cv=5).mean())

honest = make_pipeline(SelectKBest(f_classif, k=20), LogisticRegression())
print("honest:", cross_val_score(honest, X, y, cv=5).mean())   # about 0.5, as it should be
""",
        ),
        interview=interview(
            "What is data leakage and how do you prevent it?",
            "Information unavailable at prediction time reaching training, through future features, preprocessing "
            "before the split, or shared entities across splits. Prevent it with pipelines fit only on training folds, "
            "time-based or group splits where needed, and by checking suspiciously strong features.",
        ),
    ),
    dict(
        slug="attention-in-plain-words",
        title="Attention in plain words",
        stage="language-and-transformers",
        tools=[],
        tldr=[
            "Attention lets every word look at every other word and decide which ones matter for its meaning.",
            "Because all words are processed at once, transformers train much faster than older models that read word by word.",
            "It's the one idea behind every LLM you use.",
        ],
        body=[
            p("Read this: “The bank was crowded because it was payday.” You know “bank” means money, not "
              "a river, because of “payday”. And you know “it” refers to the bank. You connected words "
              "across the sentence. Attention is how a model does the same."),
            h("How it works"),
            cards(
                ("Query", "Each word asks a question: which other words help explain me?"),
                ("Key", "Each word also advertises what it offers, like a label."),
                ("Match", "Queries are compared with keys. Good matches get high scores; softmax turns scores into weights."),
                ("Value", "Each word's new meaning is a weighted mix of the other words' information."),
            ),
            h("Why it replaced RNNs"),
            compare("RNNs and LSTMs", ["Read one word at a time", "Early words fade by the end"], "Slow to train, forgetful",
                    "Transformers", ["Look at all words at once", "Any word can attend to any other"],
                    "Fast on GPUs, strong on long text"),
            p("For writing text, GPT-style models add a causal mask: each word may only attend to the words before it, "
              "so the model can't peek at the answer it's supposed to predict."),
            callout("Attention is a learned, weighted look-up: every word gathers what it needs from the others."),
        ],
        try_it=try_it(
            "20 minutes",
            "Compute self-attention by hand in NumPy for a 3-word sentence, with a causal mask.",
            """
import numpy as np

rng = np.random.default_rng(0)
x = rng.normal(size=(3, 4))                  # 3 words, 4 numbers each
Wq, Wk, Wv = (rng.normal(size=(4, 4)) for _ in range(3))
Q, K, V = x @ Wq, x @ Wk, x @ Wv

scores = Q @ K.T / np.sqrt(4)                # how well each query matches each key
scores[np.triu_indices(3, k=1)] = -np.inf    # causal mask: no looking ahead
weights = np.exp(scores) / np.exp(scores).sum(axis=1, keepdims=True)

print(weights.round(2))                      # each row sums to 1
print(weights @ V)                           # new meaning for each word
""",
        ),
        interview=interview(
            "Explain self-attention.",
            "Each token makes a query, key and value. Query-key dot products, scaled and softmaxed, give weights; each "
            "output is the weighted sum of values. It relates all tokens in parallel, which is why transformers scale "
            "better than RNNs. Mention the causal mask for decoders.",
        ),
    ),
]


def main():
    with io.open(PATH, encoding="utf-8") as f:
        dives = json.load(f)
    by_slug = {d["slug"]: d for d in dives}
    for n in NEW:
        d = by_slug.get(n["slug"])
        if d is None:
            d = {"slug": n["slug"], "track": "ai-ml", "position": 999, "published": True, "read_minutes": None}
            dives.append(d)
        d.update(title=n["title"], stage=n["stage"], tldr=n["tldr"], tools=n["tools"], body=n["body"],
                 try_it=n["try_it"], interview=n["interview"], read_minutes=None)
    with io.open(PATH, "w", encoding="utf-8") as f:
        json.dump(dives, f, ensure_ascii=False, indent=2)
        f.write("\n")
    print(f"AI/ML deep dives written: {len(NEW)}; total dives: {len(dives)}")


if __name__ == "__main__":
    main()
