#!/usr/bin/env python3
"""Shrinks oversized photos in the carousel folders so the site stays fast.

Anything wider/taller than 1600px, or bigger than ~800KB, is resized (and sideways phone
photos are turned upright). Already-small photos are left alone, so it is safe to re-run.
Needs Pillow (the GitHub workflow installs it).
"""
import os, sys

try:
    from PIL import Image, ImageOps
except ImportError:
    print("Pillow not installed - skipping photo resize.")
    sys.exit(0)

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
FOLDERS = ["assets/images/baby", "assets/images/older", "assets/images/couple"]
MAX_SIDE = 1600
MAX_BYTES = 800 * 1024
EXTS = (".jpg", ".jpeg", ".png", ".webp")

for folder in FOLDERS:
    base = os.path.join(ROOT, folder)
    if not os.path.isdir(base):
        continue
    for name in sorted(os.listdir(base)):
        if not name.lower().endswith(EXTS):
            continue
        path = os.path.join(base, name)
        try:
            with Image.open(path) as im:
                im.load()
                w, h = im.size
                big = max(w, h) > MAX_SIDE or os.path.getsize(path) > MAX_BYTES
                if not big:
                    continue
                before = os.path.getsize(path)
                im = ImageOps.exif_transpose(im)
                im.thumbnail((MAX_SIDE, MAX_SIDE), Image.LANCZOS)
                ext = name.lower().rsplit(".", 1)[-1]
                if ext in ("jpg", "jpeg"):
                    im.convert("RGB").save(path, "JPEG", quality=82, optimize=True, progressive=True)
                elif ext == "png":
                    im.save(path, "PNG", optimize=True)
                else:
                    im.save(path, "WEBP", quality=82)
            print(f"resized {folder}/{name}: {before // 1024}KB -> {os.path.getsize(path) // 1024}KB")
        except Exception as error:  # never block an upload over one odd file
            print(f"could not resize {name}: {error}")
