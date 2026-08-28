#!/usr/bin/env python3
import os
import re
import sys
from pathlib import Path

JOURNAL_PATH = Path("journal-data.js")


def required_env(name):
  value = os.environ.get(name, "").strip()

  if not value:
    raise RuntimeError(f"Missing required input: {name}")

  return value


def escape_template_literal(value):
  return (
    value
    .replace("\\", "\\\\")
    .replace("`", "\\`")
    .replace("${", "\\${")
  )


def add_journal_entry(date, text):
  if not re.fullmatch(r"\d{2}-\d{2}-\d{2}", date):
    raise RuntimeError("Journal date must use MM-DD-YY, like 06-01-26")

  journal = JOURNAL_PATH.read_text()
  marker = "window.journalEntriesData = [\n"

  if marker not in journal:
    raise RuntimeError("Could not find journal entry list marker")

  entry = (
    "  {\n"
    f'    date: "{date}",\n'
    f"    text: `{escape_template_literal(text)}`\n"
    "  },\n"
  )

  JOURNAL_PATH.write_text(journal.replace(marker, marker + entry, 1))


def main():
  try:
    add_journal_entry(required_env("JOURNAL_DATE"), required_env("JOURNAL_TEXT"))
  except Exception as error:
    print(f"Failed to add journal entry: {error}", file=sys.stderr)
    raise


if __name__ == "__main__":
  main()
