"""Adds (or updates) Uma's post "How AI Actually Learns" in api/seed/posts.json.

Text: Uma's post, 28 Sept 2026, with her short-paragraph rhythm kept.
Images: web/public/blog/how-ai-actually-learns/ (her screenshots, full resolution, WebP).
Run from the repo root:  python scripts/seed-post-how-ai-learns.py
"""
import io
import json
import os

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PATH = os.path.join(ROOT, "api", "seed", "posts.json")
IMG = "/blog/how-ai-actually-learns"
VIDEO = "yd901VdqxPU"
TM = "https://teachablemachine.withgoogle.com/"


def p(*lines):
    return [{"type": "paragraph", "text": t} for t in lines]


def h(text, anchor=None):
    return {"type": "heading", "text": text, "id": anchor}


def img(name, w, hgt, alt, caption=None):
    return {"type": "image", "src": f"{IMG}/{name}.webp", "alt": alt, "width": w, "height": hgt, "caption": caption}


def video(caption):
    return {"type": "video", "youtube_id": VIDEO, "title": "Teachable Machine walkthrough (1:23)", "caption": caption}


def ul(*items):
    return {"type": "list", "ordered": False, "items": list(items)}


def flow(*items):
    return {"type": "flow", "items": list(items)}


MAP = img(
    "how-ai-learns", 1312, 1199,
    "Infographic: How AI actually learns in 5 minutes with your webcam. Ten panels: open Teachable Machine, create two "
    "classes (phone and empty hand), record examples, train the model, test it (98% phone), break it with a TV remote "
    "(92% phone), see what it actually learned (same room, same hand, similar background), change the situation "
    "(left hand, low light, far away), the big idea (it finds patterns in your examples) and why it trains so fast "
    "(transfer learning).",
    "The whole experiment on one page. Click to enlarge.",
)

BODY = [
    *p(
        "Everywhere we look, someone is talking about AI.",
        "ChatGPT. Face unlock. Recommendation systems. Self-driving cars.",
        "But there is one question that gets surprisingly confusing when you first enter AI:",
        "How does a computer actually learn?",
        "You can read about neural networks for hours.",
        "Or you can teach one yourself in a few minutes.",
        "That's what I did with Google's [Teachable Machine](/toolkit/teachable). It runs in the browser and lets you "
        "create simple machine-learning models using images, sounds, or poses.",
        f"[Open Teachable Machine →]({TM})",
        "And this tiny experiment made the basic idea of machine learning much easier for me to understand.",
    ),
    h("First, See the Whole Thing"),
    *p("Before getting into the individual steps, look at this image."),
    MAP,
    *p("Think of this image as the map for the entire experiment:"),
    flow("Give examples", "Train", "Test", "Change the situation", "See where the model fails",
         "Understand what it learned"),
    *p(
        "You don't even need to read the article yet.",
        "Just look at the flow.",
        "Want to see the whole experiment?",
    ),
    video("▶ The full Teachable Machine walkthrough. It's about 1 minute 23 seconds, and it shows the actual process "
          "from beginning to prediction."),
    *p("Now let's break down what happened."),

    h("Step 1: Open Teachable Machine", "step-1"),
    *p(
        "Start at the Teachable Machine homepage.",
        "The idea is simple:",
        "You give the computer examples, and it learns to distinguish between them.",
        "Click **Get Started**.",
    ),
    img("step-1-get-started", 3086, 1344,
        "Step 1: the Teachable Machine homepage, with an arrow pointing to the blue Get Started button."),
    *p("No Python.", "No installing libraries.", "No terminal.", "We're just going to experiment."),

    h("Step 2: Choose What You Want the Computer to Learn", "step-2"),
    *p("Teachable Machine gives you different types of projects."),
    *p("You can teach it using:"),
    ul("Images", "Audio", "Poses"),
    *p("For this experiment, we want images.", "So choose **Image Project**."),
    img("step-2-image-project", 2948, 1408,
        "Step 2: the New Project screen with Image Project, Audio Project and Pose Project; an arrow points to Image "
        "Project."),
    *p(
        "This is already an important ML idea.",
        "We're defining what kind of information the model is going to learn from.",
        "In our case:",
    ),
    flow("Images", "Prediction"),

    h("Step 3: Choose the Image Model", "step-3"),
    *p(
        "You'll see options for the image model.",
        "For a normal beginner experiment, choose the **Standard Image Model**.",
    ),
    img("step-3-standard-model", 2814, 1504,
        "Step 3: the New Image Project dialog with Standard image model and Embedded image model; an arrow points to "
        "Standard image model."),
    *p(
        "Don't get stuck on the technical details here.",
        "We're not trying to build the next computer-vision research system.",
        "We're trying to understand one thing:",
        "How can examples teach a machine to recognize something?",
        "That is today's experiment.",
    ),

    h("Step 4: Create Your Classes", "step-4"),
    *p(
        "Now the interesting part begins.",
        "A class simply means:",
        "“This is category A.”",
        "and",
        "“This is category B.”",
        "In our experiment, let's use:",
    ),
    ul("**Class 1:** Spectacles", "**Class 2:** Phone"),
    img("step-4-classes", 3074, 1344,
        "Step 4: two classes named Spectacles and Phone, each with an Upload button, and notes to upload images of "
        "different spectacles and different smartphones."),
    *p(
        "Now we're essentially telling the system:",
        "“These are the two things I want you to learn to distinguish.”",
        "This is where machine learning starts feeling less mysterious.",
        "We're not writing a giant list of rules like:",
    ),
    {"type": "code", "language": "text",
     "code": "If shape = this\nand color = this\nand position = this\nthen it's a phone."},
    *p("We're providing examples."),

    h("Step 5: Give It Examples", "step-5"),
    *p(
        "Now we need to actually teach it.",
        "Click **Upload** and give the first class examples of spectacles.",
        "Then do the same for the phone class.",
    ),
    img("step-5-upload-class-1", 2912, 1468,
        "Step 5: the upload panel for Class 1, with the “Choose images from your files” button highlighted "
        "for uploading pictures of spectacles."),
    *p("For example:"),
    ul("**Spectacles class:** upload several images of spectacles.",
       "**Phone class:** upload several images of phones."),
    img("step-5-upload-class-2", 2672, 1600,
        "Moving on to Class 2: an arrow points to its Upload button to add phone images, with a reminder that no class "
        "should be left empty."),
    *p(
        "And here's where something very important is happening.",
        "You aren't giving the model a definition of a phone.",
        "You're giving it examples of phones.",
        "You aren't explaining:",
        "“A phone is a rectangular electronic device with a screen.”",
        "You're simply saying:",
        "“Here are examples that belong to Class 2.”",
        "That's the fundamental idea we want to understand.",
    ),

    h("Step 6: More Examples Don't Automatically Mean Better", "step-6"),
    *p(
        "Imagine you give the model only one photo of spectacles.",
        "Then you give it one photo of a phone.",
        "It has very little information to work with.",
        "Now imagine you give it many examples.",
    ),
    ul("Different angles.", "Different positions.", "Different backgrounds.", "Different lighting.",
       "Different objects."),
    *p(
        "Now it has more variety to learn from.",
        "This leads to one of the biggest lessons in machine learning:",
    ),
    {"type": "callout", "label": "Key idea", "text": "The quality and variety of your training examples matter."},
    *p(
        "The model can only learn patterns that exist in the data you give it.",
        "That's why real machine learning datasets are such a big deal.",
    ),

    h("Step 7: Train the Model", "step-7"),
    *p("Now comes the button everyone wants to press.", "**Train Model**."),
    img("step-7-train", 2754, 1536,
        "Step 7: both classes have images, and an arrow points to the Train Model button in the Training panel."),
    *p(
        "Click it.",
        "Wait.",
        "And now the model has been trained using the examples you provided.",
        "This is the moment where people often imagine:",
        "“The AI has now understood what a phone is.”",
        "Not quite.",
        "And this is where things get interesting.",
    ),

    h("Step 8: Let's Test It", "step-8"),
    *p(
        "Once training is finished, the model gives you a live prediction.",
        "Point the webcam at something from your training examples.",
        "You'll see probabilities for the different classes.",
    ),
    img("step-8-prediction", 2912, 1462,
        "Step 8: the trained model's webcam preview. The output shows 39% for Class 1 and 61% for Class 2, with arrows "
        "explaining that the model matched the object to Class 2."),
    *p("For example:"),
    ul("Spectacles: 39%", "Phone: 61%"),
    *p(
        "The model is basically saying:",
        "“Based on what I learned from the examples, this input looks more like Class 2.”",
        "That prediction is called **inference**.",
        "You don't need to memorize that word yet.",
        "Just remember:",
    ),
    {"type": "cards", "items": [
        {"title": "Training", "text": "Learn from examples."},
        {"title": "Inference", "text": "Use what was learned to make a prediction."},
    ]},
    *p("That's a very important distinction in AI."),

    h("Now Let's Break the Model"),
    *p(
        "This is my favorite part.",
        "Don't just show the model the exact examples you trained it on.",
        "Try to fool it.",
    ),
    ul("Give it a different background.", "Change the lighting.", "Change the angle.", "Use a different phone.",
       "Move the object farther away.", "Show it something that looks visually similar."),
    *p(
        "And watch what happens.",
        "Because now we're asking the real question:",
    ),
    {"type": "callout", "label": "The real question",
     "text": "Did the model actually learn the thing we wanted it to learn? Or did it simply find some patterns in our "
             "training examples?"},

    h("What Did It Actually Learn?"),
    *p("This is where the experiment becomes machine learning.", "Suppose every phone image you uploaded had:"),
    ul("a similar background", "the phone in roughly the same position", "the same type of lighting",
       "your hand appearing in the same way"),
    *p(
        "You might think:",
        "“I taught it what a phone looks like.”",
        "But the model doesn't know what “phone” means in the human sense.",
        "It is learning patterns from the input examples.",
        "So some patterns you never intended to teach can become useful to the model.",
        "That's why changing the situation can make the prediction worse.",
        "And suddenly we get a much better understanding of why training data matters.",
    ),

    h("This Is the Core Machine Learning Loop"),
    *p("Look at the big image again."),
    MAP,
    *p("You can reduce the whole experiment to this:"),
    flow("Examples", "Training", "Learn patterns", "New input", "Prediction", "Test the prediction",
         "Improve the examples"),
    *p(
        "That's the basic loop.",
        "Not all of modern AI works exactly like this, but this experiment gives you the intuition behind supervised "
        "learning and classification.",
    ),

    h("And Then There Is the Sneaky Problem"),
    *p("Imagine you trained the model using:"),
    ul("**Phone:** always in your right hand.", "**Spectacles:** always on a table."),
    *p("Now you test:"),
    ul("**Phone:** in your left hand."),
    *p(
        "The model may struggle.",
        "Why?",
        "Because your original data had a pattern you didn't realize was there.",
        "You wanted it to learn:",
        "**Phone vs Spectacles.**",
        "But your examples may have accidentally taught it:",
        "**Right-hand setup vs table setup.**",
        "This is why good training data matters.",
        "And this is also why testing only on the same kind of examples used during training can give you a false "
        "sense that everything is perfect.",
    ),

    h("So Why Did This Train So Quickly?"),
    *p(
        "This is another cool part of the experiment.",
        "You didn't spend six hours training a giant model from zero.",
        "You clicked a button and got a result in a browser.",
        "One reason is **transfer learning**.",
        "Think about it like this.",
        "Imagine hiring an artist who already knows how to recognize:",
    ),
    ul("edges", "shapes", "textures", "basic visual patterns"),
    *p(
        "You don't need to teach them what a shape is from scratch.",
        "You just give them a new task:",
        "“Now help me separate these two categories.”",
        "That's the basic intuition behind transfer learning.",
        "Instead of starting from zero, an already-trained model can provide useful learned representations, and you "
        "adapt it for your smaller task.",
        "That is one of the reasons tools like this can make experimentation so fast.",
    ),

    h("You Just Saw Machine Learning Without the Math"),
    *p("And that's actually the point.", "You didn't need to start with:"),
    ul("matrices", "gradients", "loss functions", "backpropagation", "neural-network equations"),
    *p(
        "Those concepts become important later.",
        "But before learning all of that, I think it's useful to understand the basic story first.",
        "A machine-learning model gets examples.",
        "It learns patterns from those examples.",
        "You give it something new.",
        "It makes a prediction.",
        "Then you test whether those predictions actually work outside the examples it saw.",
        "That's the idea you just watched happen.",
    ),

    h("The 1-Minute Recap"),
    *p("Here is the entire experiment again:"),
    flow("1. Open Teachable Machine", "2. Choose Image Project", "3. Create classes", "4. Give examples",
         "5. Train the model", "6. Show it new data", "7. Get a prediction", "8. Change the situation",
         "9. Watch where it fails", "10. Ask what the model actually learned"),
    *p("And that's where the real learning starts."),

    h("Watch the Complete Experiment"),
    video("🎥 The full 1:23 walkthrough."),
    {"type": "links", "label": "Or explore the experiment step by step:",
     "items": [{"label": f"Step {n}", "href": f"#step-{n}"} for n in range(1, 9)]},

    h("Your turn"),
    *p(
        f"Open [Teachable Machine]({TM}) and create two classes of your own.",
        "Don't worry about making a perfect model.",
        "Actually, try to break it.",
        "Because the moment you see your model confidently get something wrong, machine learning stops feeling like "
        "magic.",
        "It starts feeling understandable.",
    ),
]

POST = {
    "slug": "how-ai-actually-learns",
    "category": "learning-with-ai",
    "title": "How AI Actually Learns: I Taught a Computer With My Own Images",
    "excerpt": "I taught Google's Teachable Machine to tell my spectacles from my phone in a few minutes, then tried "
               "to break it. Here's what that shows about how machine learning really works.",
    "cover": {
        "text": "8 steps", "bg": "#211913", "fg": "#F2A93B",
        "image": {"src": f"{IMG}/how-ai-learns.webp", "width": 1312, "height": 1199,
                  "alt": "Infographic of the whole experiment: How AI actually learns, in 5 minutes with your webcam."},
    },
    # Small labels added around Uma's text (her words are unchanged).
    "learn": [
        "How a computer learns from examples instead of rules",
        "The difference between training and inference",
        "Why a model breaks when the situation changes, and what that says about your data",
        "Why tools like this train in seconds (transfer learning)",
    ],
    # Newest post with a "featured" line = the big Featured box at the top of /blog.
    "featured": {"stat": "8 steps", "caption": "to teach a computer with your own photos, then catch it getting things wrong"},
    "dive": None,
    "body": BODY,
    "published_on": "2026-09-28",
}


def main():
    with io.open(PATH, encoding="utf-8") as f:
        posts = json.load(f)
    posts = [x for x in posts if x["slug"] != POST["slug"]]
    posts.insert(0, POST)
    with io.open(PATH, "w", encoding="utf-8") as f:
        json.dump(posts, f, ensure_ascii=False, indent=2)
        f.write("\n")
    print(f"posts: {len(posts)}; '{POST['slug']}' has {len(BODY)} blocks")


if __name__ == "__main__":
    main()
