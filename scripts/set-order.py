#!/usr/bin/env python3
"""Saves a new section order into my-site-settings.js (used by the 'Set Section Order' GitHub form)."""
import os, re, sys

ALLOWED = ["about", "photos", "places", "media", "journal", "dinosaurFacts", "wordsToSitWith", "crazyEights", "contact"]
raw = os.environ.get("SECTION_ORDER", "")
keys = [k.strip().strip('"\'') for k in re.split(r"[,\n]", raw) if k.strip()]

bad = [k for k in keys if k not in ALLOWED]
if bad:
    sys.exit(f"Unknown section(s): {', '.join(bad)}. Allowed: {', '.join(ALLOWED)}")
for k in ALLOWED:  # anything left out goes on the end, so nothing disappears
    if k not in keys:
        keys.append(k)

path = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "my-site-settings.js")
text = open(path, encoding="utf-8").read()
new_line = "  order: [" + ", ".join(f'"{k}"' for k in keys) + "],"
text, count = re.subn(r"^  order: \[.*?\],", new_line, text, count=1, flags=re.M | re.S)
if count != 1:
    sys.exit("Could not find the order line in my-site-settings.js")
open(path, "w", encoding="utf-8").write(text)
print("Saved order:", ", ".join(keys))
