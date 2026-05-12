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

## File Map

Routine edits:

```text
journal-data.js       journal entries
about-photo-data.js   Older Samo photo carousel
photo-data.js         Baby Samo photo carousel
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
