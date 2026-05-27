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

## Update Running PRs

Edit:

```text
pr-data.js
```

Use this format:

```js
  {
    distance: "5K",
    time: "21:38"
  },
```

Notes:

- This updates the `Running PRs` box under the Training Log.
- Keep the comma after each block except the final one.
- You do not need to edit `index.html` or `script.js` to update PRs.

## Update Upcoming Races

Edit:

```text
races-data.js
```

Add race blocks in the order you want them to appear:

```js
  {
    name: "Race Name",
    date: "2026-06-01",
    distance: "10K",
    location: "Boulder, CO"
  },
```

Notes:

- This updates the `Upcoming Races` box under the homepage training boxes.
- Use `YYYY-MM-DD` for the date so the site can hide races after they pass.
- `distance` and `location` are optional.
- Races remain in `races-data.js`, but the site automatically hides them after the date passes.
- If there are no future races, the site shows a simple empty message.
- You do not need to edit `index.html` or `script.js` to update races.

## Quick Safety Check

Before committing, make sure:

- Every new block starts with `{` and ends with `},`
- Journal text uses backticks: `text: \`your entry\``
- Photo and quote text uses regular quotes: `"like this"`
- Image paths match the exact file name in `assets/images/` or `assets/images/teachers/`
- You did not delete the final `];` at the bottom of a data file

## Strava Training Log

The homepage has a `Training Log` box.

It displays the current year automatically and reads public totals from:

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

The workflow is already in GitHub. It needs these GitHub repository secrets:

```text
STRAVA_CLIENT_ID
STRAVA_CLIENT_SECRET
STRAVA_REFRESH_TOKEN
```

Notes:

- You usually do not edit `strava-data.json` by hand.
- Do not put Strava secrets directly into the code.
- The GitHub Action runs once per day and can also be run manually.
- It automatically uses the current year.
- It calculates run miles, walk miles, run/walk elevation gain, bike miles, and swim yards from Strava activities.
- The public website only sees the totals in `strava-data.json`.
- To update it immediately, go to GitHub Actions, open `Update Strava Data`, and click `Run workflow`.

## File Map

Routine edits:

```text
journal-data.js       journal entries
about-photo-data.js   Older Samo photo carousel
photo-data.js         Baby Samo photo carousel
quotes-data.js        Words to Sit With quotes
pr-data.js            Running PRs box
races-data.js         Upcoming Races box
assets/images/        uploaded photos
```

Usually do not touch:

```text
index.html        page structure
script.js         site behavior
styles.css        visual styling
strava-data.json  auto-generated Strava training totals
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
