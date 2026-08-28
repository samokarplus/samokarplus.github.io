# Editing Guide

This file has step-by-step instructions for updating the site without editing the main HTML.

For a plain-English map of what each file does, read `README.md`.

## Simple Rule

```text
site-text-data.js      Change words
site-design-data.js    Change colors, fonts, sizes, spacing, and textbox styles
quotes-data.js         Add rotating quotes and teacher images
journal-data.js        Journal entries
pr-data.js             Running PRs
races-data.js          Upcoming races
photo-data.js          Baby Samo photos
about-photo-data.js    Older Samo photos
```

You do not need to bump cache versions after normal edits. The site loads fresh data automatically.

## Change Main Website Text

Edit:

```text
site-text-data.js
```

This is where the regular homepage text lives. Look for the numbered textbox you want to change:

```js
  // Textbox 1: Homepage subtitle under "Samo Karplus"
  textbox1: {
    text: "spirituality, memory, healing, films, photographs, and reflections"
  },
```

To change it, edit only the words inside the quotes:

```js
  textbox1: {
    text: "new words go here"
  },
```

Multi-paragraph text uses a `paragraphs` list:

```js
  // Textbox 5: Big quote above the first picture
  textbox5: {
    paragraphs: [
      "First paragraph.",
      "Second paragraph.",
      "Third paragraph."
    ]
  },
```

To change a multi-paragraph textbox:

- Keep `paragraphs: [` at the top.
- Put each paragraph inside quotes.
- Put a comma after each paragraph except the last one.
- Keep the closing `]`.

List text uses an `items` list:

```js
  // Textbox 18: Hobbies list
  textbox18: {
    items: [
      "Ultramarathoner",
      "Triathlete"
    ]
  },
```

To add a list item, copy one line and change the words:

```js
      "New hobby here",
```

Quick examples:

```text
Textbox 1  Homepage subtitle
Textbox 5  Big quote above the first picture
Textbox 6  Author under the big quote
Textbox 12 Personal Bio paragraphs
Textbox 14 Spiritual Journey paragraphs
Textbox 18 Hobbies list
Textbox 27 Featured media description
Textbox 48 Email address text
Textbox 53 Calendly description
```

Notes:

- You do not need to edit `index.html` for normal text changes.
- Leave the textbox names alone, like `textbox1` and `textbox5`.
- Change the text inside quotes only.
- If you use an apostrophe inside double quotes, it is fine: `"I'm here"`.
- If you use double quotes inside double quotes, add a backslash before them: `"She said \"hello\""`
- You do not need to edit `index.html` after changing this file.

## Which File Do I Edit?

```text
site-text-data.js       Main homepage text, buttons, section titles, bio text
site-design-data.js     Colors, fonts, text size, spacing, image size, roundness
quotes-data.js          Rotating "Words to Sit With" quotes and teacher images
journal-data.js         Journal entries
pr-data.js              Running PRs
races-data.js           Upcoming races
photo-data.js           Baby Samo photos
about-photo-data.js     Older Samo photos
index.html              Only for advanced things like adding a brand-new section
styles.css              Only for design/layout changes
script.js               Only for behavior changes
```

## Change Colors, Fonts, Or Sizes

Edit:

```text
site-design-data.js
```

Change the value inside quotes:

```js
backgroundColor: "#faf7f0",
accentColor: "#d9745f",
normalTextSize: "1rem",
heroPictureWidth: "100%",
heroQuotePosition: "above",
```

You do not have to understand color codes. At the top of `site-design-data.js`, there is a copy/paste menu:

```js
// Terracotta: "#d9745f"
// Gold:       "#d4a373"
// Sage green: "#9bbf9e"
// Soft blue:  "#8fb6c8"
```

Copy the code inside quotes and paste it into a setting:

```js
buttonColor: "#9bbf9e",
```

That would make the main buttons sage green.

## Style One Textbox

The two files use matching names.

```text
site-text-data.js      Textbox 7: Short Rumi quote under the homepage
site-design-data.js    Textbox 7: Short Rumi quote under the homepage
```

Example: make the short Rumi quote not italic, bold, and a little bigger.

In `site-design-data.js`, find:

```js
// Textbox 7: Short Rumi quote under the homepage
textbox7: {
  size: "1.4rem",
  font: "Merriweather, serif",
  style: "italic",
  weight: "400",
  color: "#6d6a60",
  align: "left"
},
```

Change it to:

```js
// Textbox 7: Short Rumi quote under the homepage
textbox7: {
  size: "1.5rem",
  font: "Georgia, serif",
  style: "normal",
  weight: "700",
  color: "#33332d",
  align: "center"
},
```

Copy/paste choices:

```text
style: "normal"     not italic
style: "italic"     italic
weight: "400"       normal
weight: "700"       bold
font: "Georgia, serif"          classic readable
font: "Merriweather, serif"     current quote font
font: "Lato, sans-serif"        current normal font
align: "left"       left aligned
align: "center"     centered
align: "right"      right aligned
```

Easy changes:

```text
backgroundColor     Whole page background
textColor           Main words
accentColor         Small labels and hover color
buttonColor         Button color
bodyFont            Normal font
headingFont         Big title font
normalTextSize      Normal text size
headingSize         All heading size multiplier, like "1.1"
heroQuoteSize       Big quote size
wordsQuoteSize      Words to Sit With quote size
sectionSpacing      Space between sections
cardRoundness       Card corner roundness
imageRoundness      Image corner roundness
heroPictureWidth    First picture width, like "80%" or "100%"
heroQuoteWidth      Big quote box width, like "80%" or "100%"
heroQuotePosition   "above" or "below"
heroQuoteAlign      "left", "center", or "right"
```

You do not need to edit `index.html` after changing this file.

## Add A Journal Entry

Use the GitHub Action form:

```text
GitHub -> Actions -> Add Journal Entry -> Run workflow
```

Fill in:

```text
date: 06-01-26
text: paste the full journal entry
```

Then click `Run workflow`.

The workflow automatically:

- Adds the entry at the top of `journal-data.js`
- Handles quotes, commas, backticks, and paragraph breaks
- Commits the change to GitHub

Manual fallback:

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

To make it super copy/paste:

```js
  {
    author: "Teacher Name",
    quote: "Quote text goes here.",
    image: "assets/images/teachers/rumi.avif",
    alt: "Portrait of Teacher Name."
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
- If you add a new teacher image, upload it to `assets/images/teachers/`, then use that file path in `image`.
- You do not need to edit `index.html` after changing quotes.

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
- Every regular text change in `site-text-data.js` stays inside the numbered textbox area.
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
