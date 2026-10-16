"""Generate the README figure from the installed ts-fsrs scheduler."""
import json
import os
from pathlib import Path
import subprocess

os.environ.setdefault("MPLCONFIGDIR", "/tmp/spacedrep-matplotlib")
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
import numpy as np

ROOT = Path(__file__).resolve().parents[1]
EXAMPLE = """
import { fsrs, createEmptyCard, Rating } from 'ts-fsrs';
const scheduler = fsrs({ enable_fuzz: false });
let card = createEmptyCard(new Date('2026-01-01T00:00:00Z'));
card = scheduler.next(card, card.due, Rating.Good).card;
const start = card.due;
card = scheduler.next(card, start, Rating.Good).card;
const reviews = [{ day: 0, stability: card.stability }];
for (let i = 0; i < 3; i++) {
  const time = card.due;
  const day = (time - start) / 86400000;
  card = scheduler.next(card, time, Rating.Good).card;
  reviews.push({ day, stability: card.stability });
}
console.log(JSON.stringify({ reviews, decay: scheduler.parameters.w[20],
  retention: scheduler.parameters.request_retention }));
"""
example = json.loads(subprocess.check_output(
    ["node", "--input-type=module", "-e", EXAMPLE], cwd=ROOT, text=True))
reviews = example["reviews"]
decay = example["decay"]
factor = 0.9 ** (-1 / decay) - 1


def recall(elapsed, stability):
    return 100 * (1 + factor * elapsed / stability) ** (-decay)


plt.rcParams.update({"font.family": "DejaVu Sans", "font.size": 11,
                     "svg.fonttype": "none", "axes.spines.top": False,
                     "axes.spines.right": False})
bg, fg, muted = "#0c1224", "#edf2ff", "#aebbd5"
purple, mint, amber = "#ac9aff", "#59dfb6", "#f6c76b"
fig, ax = plt.subplots(figsize=(13, 7.4), facecolor=bg)
fig.subplots_adjust(left=.095, right=.96, bottom=.25, top=.73)
ax.set_facecolor(bg)
fig.text(.095, .925, "Why review timing matters", color=fg, fontsize=25, weight="bold")
fig.text(.095, .871, "Successful recall can strengthen a memory, allowing longer gaps between reviews.",
         color=muted, fontsize=12)
end = 70
days = np.linspace(0, end, 800)
ax.plot(days, recall(days, reviews[0]["stability"]), color=purple,
        linewidth=2.5, linestyle=(0, (5, 3)), label="No further reviews")
xs, ys = [], []
for i, review in enumerate(reviews):
    until = reviews[i+1]["day"] if i+1 < len(reviews) else end
    times = np.linspace(review["day"], until, 220)
    xs.extend(times)
    ys.extend(recall(times-review["day"], review["stability"]))
ax.plot(xs, ys, color=mint, linewidth=2.7, label="Successful reviews when due")
ax.axhline(100*example["retention"], color=amber, linestyle=(0, (2, 3)),
           linewidth=1.2, label="90% target recall")
for previous, current in zip(reviews, reviews[1:]):
    middle = (previous["day"]+current["day"])/2
    interval = current["day"]-previous["day"]
    ax.annotate("", xy=(current["day"], 108), xytext=(previous["day"], 108),
                arrowprops={"arrowstyle": "|-|", "color": muted, "lw": .8},
                annotation_clip=False)
    ax.text(middle, 111, f"{interval:g} days", color=fg, ha="center", fontsize=10, clip_on=False)
for index, review in enumerate(reviews[1:]):
    ax.scatter(review["day"], 100, s=42, color=mint, zorder=5)
    ax.annotate(f"Review day {review['day']:g}", xy=(review["day"], 99),
                xytext=(review["day"]+(5 if index<2 else -6), 77),
                color=muted, fontsize=9, ha="center",
                arrowprops={"arrowstyle": "-", "color": muted, "lw": .8})
ax.set_xlim(0, end)
ax.set_ylim(40, 104)
ax.set_xticks(np.arange(0, end+1, 10))
ax.set_yticks([40, 50, 60, 70, 80, 90, 100], labels=["40%", "50%", "60%", "70%", "80%", "90%", "100%"])
ax.set_xlabel("Days after initial learning", color=muted, labelpad=12)
ax.set_ylabel("Estimated probability of recall", color=muted, labelpad=12)
ax.tick_params(colors=muted, length=0, pad=8)
ax.spines["left"].set_color("#33415c")
ax.spines["bottom"].set_color("#33415c")
ax.grid(axis="y", color="#253049", linewidth=.7)
legend = ax.legend(loc="upper left", bbox_to_anchor=(0, -.22), ncol=3,
                   frameon=False, fontsize=10, borderaxespad=0)
for label in legend.get_texts():
    label.set_color(fg)
fig.text(.095, .075, "Illustrative FSRS-6 predictions, not measured user results. All reviews rated Good; interval fuzz disabled.",
         color=muted, fontsize=9)
fig.text(.095, .043, "Generated from ts-fsrs defaults. Early learning steps omitted. Different answers produce different intervals.",
         color=muted, fontsize=9)
output = ROOT / "docs" / "images"
output.mkdir(parents=True, exist_ok=True)
fig.savefig(output / "forgetting-curve.svg", facecolor=bg)
fig.savefig(output / "forgetting-curve.png", dpi=160, facecolor=bg)
plt.close(fig)
print(json.dumps(example, indent=2))
