# Editing Guide

This file is a quick map for updating the site without editing the main HTML.

## Add A Journal Entry

Edit:

```text
journal-data.js
```

Add the newest entry at the top of the list, right after:

```js
window.journalEntriesData = [
```

Use this format:

```js
  {
    date: "05-05-26",
    text: `Write the entry here.

Leave a blank line between paragraphs.`
  },
```

Notes:

- Keep the newest entry at the top.
- Keep the backticks around the journal text.
- Keep the comma after the closing brace.
- The site automatically opens the newest month and newest entry.
- Older months and entries collapse automatically.

## Add An Older Samo Photo

First upload the image into:

```text
assets/images/
```

Then edit:

```text
about-photo-data.js
```

Add a new photo block:

```js
  {
    src: "assets/images/my-photo.jpg",
    alt: "Describe the photo."
  },
```

Notes:

- This adds to the `Older Samo` carousel in the Photos section.
- The carousel automatically sizes/crops photos to match the slideshow.
- Put new photos anywhere in the list to control their order.
- You do not need to edit `index.html` to add Older Samo photos.

## Add A Baby Samo Photo

First upload the image into:

```text
assets/images/
```

Then edit:

```text
photo-data.js
```

Add a new photo block:

```js
  {
    src: "assets/images/my-photo.jpg",
    alt: "Describe the photo.",
    caption: "Short caption."
  },
```

Notes:

- The `src` must match the exact uploaded file name.
- This adds to the `Baby Samo` carousel in the Photos section.
- The site automatically sizes/crops photos for the carousel.
- `caption` is used for Baby Samo photos.
- You do not need to edit `index.html` to add photos.

## Which Photo File To Edit

Use:

```text
about-photo-data.js   Older Samo carousel
photo-data.js         Baby Samo carousel
```

Both carousels are created automatically by `script.js`.

## Add A Quote

Edit:

```text
quotes-data.js
```

Add a new quote block anywhere in the list:

```js
  {
    author: "Rumi",
    quote: "Write the quote here.",
    image: "assets/images/teachers/rumi.avif",
    alt: "A painted portrait of Rumi."
  },
```

Available teacher images:

```text
assets/images/teachers/bhagavan.jpg
assets/images/teachers/nisargadatta.jpg
assets/images/teachers/anandamayi.jpg
assets/images/teachers/rumi.avif
```

Notes:

- The `Words to Sit With` section rotates through `quotes-data.js`.
- You can reuse the same image for multiple quotes.
- You do not need to edit `index.html` or `script.js` to add quotes.

## Quick Safety Check

Before committing, make sure:

- Every new block starts with `{` and ends with `},`
- Journal text uses backticks: `text: \`your entry\``
- Photo and quote text uses regular quotes: `"like this"`
- Image paths match the exact file name in `assets/images/` or `assets/images/teachers/`
- You did not delete the final `];` at the bottom of a data file

## Strava Running Log

The homepage has a `2026 Running Log` box.

It reads from:

```text
strava-data.json
```

Automatic updates use this script:

```text
scripts/update-strava-data.py
```

To make it update automatically, GitHub also needs a workflow file at:

```text
.github/workflows/update-strava-data.yml
```

That workflow file is prepared locally, but GitHub blocked Codex from pushing it because the current GitHub token does not have workflow permission.

After the workflow exists in GitHub, add these GitHub repository secrets:

```text
STRAVA_CLIENT_ID
STRAVA_CLIENT_SECRET
STRAVA_REFRESH_TOKEN
```

Notes:

- Do not put Strava secrets directly into the code.
- The GitHub Action runs once per day and can also be run manually.
- It automatically uses the current year.
- It calculates running miles, running elevation, biking miles, and swimming yards from Strava activities.
- The public website only sees the totals in `strava-data.json`.

## File Map

Routine edits:

```text
journal-data.js       journal entries
about-photo-data.js   Older Samo photo carousel
photo-data.js         Baby Samo photo carousel
quotes-data.js        Words to Sit With quotes
strava-data.json      public Strava running totals
assets/images/        uploaded photos
```

Usually do not touch:

```text
index.html        page structure
script.js         site behavior
styles.css        visual styling
```

SEO/search files:

```text
robots.txt
sitemap.xml
googleeff8dd46c6f3da05.html
```

## After Editing

Commit the change in GitHub.

If the live site does not update immediately, wait a minute and hard refresh:

```text
Cmd + Shift + R
```
