#!/usr/bin/env python3
"""Keeps the three photo carousels in sync with their photo folders.

Drop a picture into a folder  ->  it is added to that carousel.
Delete a picture from a folder (or anywhere in assets) -> it is removed from the carousel.

    assets/images/baby/     -> photo-data.js         (Baby Samo)
    assets/images/older/    -> about-photo-data.js   (Older Samo)
    assets/images/couple/   -> couple-photo-data.js  (Zooboo Booboo Teeny Tiny Baby)

Photos already listed keep their order and captions; new photos go on the end.
Runs automatically on GitHub (.github/workflows/sync-photos.yml); you can also run it by hand.
"""
import os, re

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
EXTS = (".jpg", ".jpeg", ".png", ".webp", ".avif", ".gif")
CAROUSELS = [
    ("photo-data.js", "assets/images/baby", True),
    ("about-photo-data.js", "assets/images/older", False),
    ("couple-photo-data.js", "assets/images/couple", False),
]


def nice_alt(filename):
    name = os.path.splitext(filename)[0]
    name = re.sub(r"[-_]+", " ", name).strip()
    return (name[:1].upper() + name[1:]) if name else "Photo"


def sync(data_file, folder, with_caption):
    path = os.path.join(ROOT, data_file)
    text = open(path, encoding="utf-8").read()
    start = text.index("= [") + 3
    end = text.rindex("];")
    head, body, tail = text[:start], text[start:end], text[end:]

    blocks = re.findall(r"\{\s*src:.*?\n?\s*\}", body, flags=re.S)
    kept, listed = [], set()
    for block in blocks:
        src = re.search(r'src:\s*"([^"]+)"', block).group(1)
        if os.path.exists(os.path.join(ROOT, src)):
            kept.append(block.strip())
            listed.add(src)

    folder_path = os.path.join(ROOT, folder)
    new = []
    if os.path.isdir(folder_path):
        for filename in sorted(os.listdir(folder_path)):
            src = f"{folder}/{filename}"
            if filename.lower().endswith(EXTS) and src not in listed:
                lines = [f'    src: "{src}"', f'    alt: "{nice_alt(filename)}"']
                if with_caption:
                    lines.append('    caption: ""')
                new.append("  {\n" + ",\n".join(lines) + "\n  }")

    entries = ["  " + b if not b.startswith("  ") else b for b in kept] + new
    # re-indent kept blocks consistently
    entries = [("  " + e.lstrip()) if i < len(kept) else e for i, e in enumerate(entries)]
    result = head + "\n" + ",\n".join(entries) + "\n" + tail
    if result != text:
        open(path, "w", encoding="utf-8").write(result)
        print(f"{data_file}: {len(new)} added, {len(blocks) - len(kept)} removed")


for args in CAROUSELS:
    sync(*args)
