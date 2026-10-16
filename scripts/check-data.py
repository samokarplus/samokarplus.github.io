#!/usr/bin/env python3
"""Safety net for the editable data files.

After every change to a data file this makes sure it is still valid. If you left out a comma or a
closing ] or }, it tries to fix the typo automatically. If it can't, it puts that file back the way it
was in the last version that worked, so the live site never breaks.

Exit code is always 0; the result is written to the GitHub run summary and stdout.
"""
import json, os, re, subprocess, sys, tempfile

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
FILES = [
    "journal-data.js", "photo-data.js", "about-photo-data.js", "couple-photo-data.js",
    "places-data.js", "quotes-data.js", "dinosaur-facts-data.js", "pr-data.js", "races-data.js",
    "site-text-data.js", "site-design-data.js", "my-site-settings.js", "my-info.js",
]

CHECKER = r"""
const vm = require('vm'), fs = require('fs');
const code = fs.readFileSync(process.argv[1], 'utf8');
try { vm.runInNewContext(code, { window: {} }); console.log('ok'); }
catch (e) { console.log('ERR ' + e.message); process.exit(1); }
"""


def is_valid(text):
    with tempfile.NamedTemporaryFile("w", suffix=".js", delete=False, encoding="utf-8") as f:
        f.write(text)
        path = f.name
    result = subprocess.run(["node", "-e", CHECKER, path], capture_output=True, text=True)
    os.unlink(path)
    return result.returncode == 0, result.stdout.strip()


def candidate_fixes(text):
    """Yield (description, fixed_text) for common slips, cheapest first."""
    # 1. missing comma between two blocks:  }  {
    yield "added a missing comma between two items", re.sub(r"\}([ \t]*\n\s*)\{", r"},\1{", text)
    # 2. missing comma at the end of a line before the next  name: value  line
    yield "added a missing comma after a line", re.sub(r"([\"'`\]\}\d])([ \t]*\n\s*[A-Za-z_]\w*\s*:)", r"\1,\2", text)
    # 3. both of the above
    both = re.sub(r"\}([ \t]*\n\s*)\{", r"},\1{", text)
    yield "added missing commas", re.sub(r"([\"'`\]\}\d])([ \t]*\n\s*[A-Za-z_]\w*\s*:)", r"\1,\2", both)
    # 4. forgot the closing  ];  or  };  at the end
    stripped = text.rstrip()
    for closer in ("\n];", "\n};", "\n}\n];", "\n  }\n];"):
        yield "added a missing closing bracket at the end", stripped + closer + "\n"
        yield "added missing commas and a closing bracket", re.sub(r"\}([ \t]*\n\s*)\{", r"},\1{", stripped) + closer + "\n"
    # 5. a stray extra closing bracket or comma at the very end
    yield "removed a stray character at the end", re.sub(r"[\],}]+\s*$", "", stripped) + "\n];\n"


def last_good_version(name):
    """Walk back through git history to the newest version of this file that is valid."""
    log = subprocess.run(["git", "log", "--format=%H", "-n", "30", "--", name], cwd=ROOT, capture_output=True, text=True)
    for sha in log.stdout.split():
        show = subprocess.run(["git", "show", f"{sha}:{name}"], cwd=ROOT, capture_output=True, text=True)
        if show.returncode == 0 and is_valid(show.stdout)[0]:
            return show.stdout, sha[:7]
    return None, None


report = []
for name in FILES:
    path = os.path.join(ROOT, name)
    if not os.path.exists(path):
        continue
    text = open(path, encoding="utf-8").read()
    ok, message = is_valid(text)
    if ok:
        continue

    fixed = None
    for description, candidate in candidate_fixes(text):
        if candidate != text and is_valid(candidate)[0]:
            fixed = (description, candidate)
            break

    if fixed:
        open(path, "w", encoding="utf-8").write(fixed[1])
        report.append(f"FIXED  {name}: {fixed[0]}. (Original problem: {message})")
        continue

    good, sha = last_good_version(name)
    if good is not None:
        open(path, "w", encoding="utf-8").write(good)
        report.append(f"RESTORED  {name}: couldn't repair it ({message}), so it went back to the last working version ({sha}). Your latest edit to that file was undone - try it again and check the commas and brackets.")
    else:
        report.append(f"BROKEN  {name}: {message} - could not fix automatically.")

if report:
    print("\n".join(report))
    summary = os.environ.get("GITHUB_STEP_SUMMARY")
    if summary:
        with open(summary, "a", encoding="utf-8") as f:
            f.write("## Data check\n\n" + "\n\n".join(report) + "\n")
else:
    print("All data files are valid.")
