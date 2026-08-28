# Samo Karplus Website

This repo controls the website at:

```text
https://samo.karplus.org
```

The site is designed so most updates happen through small data files or GitHub Actions, not by editing the main page code.

For exact step-by-step instructions, use:

```text
EDITING.md
```

## Easiest Updates

Most of the time, start here:

```text
site-text-data.js      Change words
site-design-data.js    Change colors, fonts, sizes, spacing, image layout, and textbox styles
```

For repeating content, use:

```text
quotes-data.js         Add Words to Sit With quotes and images
pr-data.js             Update running PRs
races-data.js          Add upcoming races
photo-data.js          Add Baby Samo photos
about-photo-data.js    Add Older Samo photos
```

### Main Website Text

Edit:

```text
site-text-data.js
```

This file has clearly numbered textboxes for the normal words on the site, like the homepage subtitle, the big quote above the first picture, About text, section titles, contact text, and button labels.

### Colors, Fonts, And Sizes

Edit:

```text
site-design-data.js
```

This file has simple controls for background color, text color, font, text size, spacing, image roundness, the first picture/quote layout, and matching textbox styles.

### Journal Entries

Use the GitHub form:

```text
GitHub -> Actions -> Add Journal Entry -> Run workflow
```

Fill in the date and paste the journal entry. The workflow adds it to `journal-data.js` and commits it.

### Photos

Upload the image into:

```text
assets/images/
```

Then edit one of these:

```text
photo-data.js         Baby Samo carousel
about-photo-data.js   Older Samo carousel
```

### Quotes

Edit:

```text
quotes-data.js
```

### Running PRs

Edit:

```text
pr-data.js
```

### Upcoming Races

Edit:

```text
races-data.js
```

Race dates use `YYYY-MM-DD`. Past races hide automatically on the live site.

## File Map

### Files You Usually Edit

```text
EDITING.md             Step-by-step editing guide
site-text-data.js      Numbered textboxes for the main website words
site-design-data.js    Simple controls for colors, fonts, sizes, spacing, and textbox styles
about-photo-data.js    Older Samo carousel photos
photo-data.js          Baby Samo carousel photos
quotes-data.js         Words to Sit With quotes
pr-data.js             Running PRs box
races-data.js          Upcoming Races box
assets/images/         Site photos and uploaded images
```

You usually do not manually edit `journal-data.js` anymore because the `Add Journal Entry` GitHub Action handles journal posts.

### Important Site Files

```text
index.html             Main page structure
styles.css             Visual design and layout
script.js              Site behavior and automatic rendering
site.webmanifest       Browser/mobile app metadata
CNAME                  Custom domain setting for samo.karplus.org
```

Only edit these when changing the actual site structure, design, or behavior.

### Automation Files

```text
.github/workflows/add-journal-entry.yml   Journal entry form in GitHub Actions
.github/workflows/update-strava-data.yml  Automatic Strava sync
scripts/add-journal-entry.py              Inserts journal entries safely
scripts/update-strava-data.py             Pulls Strava totals
strava-data.json                          Public Strava totals used by the site
```

`strava-data.json` is generated automatically. Usually do not edit it by hand.

### Search And Domain Files

```text
robots.txt
sitemap.xml
googleeff8dd46c6f3da05.html
```

These help Google find and verify the site.

## Safe Rule

If you only want to add normal content, start with `EDITING.md`.

If a change requires editing `index.html`, `styles.css`, or `script.js`, it is a real code/design change and should be done more carefully.
