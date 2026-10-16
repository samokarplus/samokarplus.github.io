#!/usr/bin/env python3
"""Adds a country or US state to places-data.js (used by the 'Add Place' GitHub form)."""
import os, re, sys

kind = os.environ["PLACE_KIND"].strip().lower()   # "country" or "state"
name = os.environ["PLACE_NAME"].strip().replace('"', "")
key = "states" if "state" in kind else "countries"

path = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "places-data.js")
text = open(path, encoding="utf-8").read()

match = re.search(rf"({key}:\s*\[)(.*?)(\n\s*\])", text, flags=re.S)
if not match:
    sys.exit(f"Could not find the {key} list in places-data.js")
if f'"{name}"' in match.group(2):
    sys.exit(f"{name} is already on the list.")

body = match.group(2).rstrip()
body += f',\n    "{name}"' if body.strip() else f'\n    "{name}"'
open(path, "w", encoding="utf-8").write(text[: match.start(2)] + body + text[match.end(2):])
print(f"Added {name} to {key}.")
