// Edit the site's look here.
// Change only the values inside quotes.
//
// QUICK COPY/PASTE COLORS
//
// Warm cream:      "#faf7f0"
// Soft white:      "#fffdf8"
// Dark text:       "#33332d"
// Soft gray text:  "#6d6a60"
// Sunset coral:     "#d9623a"
// Sage green:      "#9bbf9e"
// Light blue:      "#b7d7e8"
// Deeper blue:     "#8fb6c8"
//
// A color code like "#d9745f" is just a color.
// Copy one of the color codes above and paste it below.
//
// QUICK COPY/PASTE FONTS
// Best simple rule: use only these two across the site.
//
// Current normal font:       "Nunito Sans, sans-serif"
// Current heading font:      "Instrument Serif, serif"
//
// QUICK COPY/PASTE TEXT STYLE
//
// Not italic:      "normal"
// Italic:          "italic"
// Normal weight:   "400"
// Bold:            "700"
// Extra bold:      "800"
// Left aligned:    "left"
// Center aligned:  "center"
// Right aligned:   "right"
//
// QUICK COPY/PASTE SIZES
//
// Normal:        "1rem"
// A bit bigger:  "1.1rem"
// Bigger:        "1.25rem"
// Smaller:       "0.9rem"
//
// QUICK COPY/PASTE WIDTHS
//
// Full width:    "100%"
// Smaller:       "85%"
// Half width:    "50%"
//
// QUICK COPY/PASTE SPACING
//
// Cozy:          "3rem"
// Current:       "5rem"
// Airy:          "7rem"
//
// QUICK COPY/PASTE ROUNDNESS
//
// Sharp:         "0px"
// Slight:        "12px"
// Current card:  "28px"
// Current image: "34px"
// Pill button:   "999px"
window.siteDesignData = {
  // Whole page background color
  backgroundColor: "#fbf3e4",

  // Slightly lighter color at the top of the page
  pageTopColor: "#fdf6ea",

  // Main text color
  textColor: "#3f3029",

  // Softer text color for subtitles and smaller notes
  softTextColor: "#7d6558",

  // Small label color, link hover color, and accent color
  accentColor: "#d9623a",

  // Main button color
  buttonColor: "#1f7a9c",

  // Button color when you hover over it
  buttonHoverColor: "#d9623a",

  // Card background color
  cardColor: "rgba(255, 250, 241, 0.8)",

  // Normal paragraph font
  bodyFont: "Nunito Sans, sans-serif",

  // Heading and quote font
  headingFont: "Instrument Serif, serif",

  // Normal paragraph size
  normalTextSize: "1rem",

  // All heading size multiplier: "1" is normal, "1.1" is 10% bigger
  headingSize: "1",

  // Swamiji quote beneath the first picture
  heroQuoteSize: "1.05rem",

  // Rotating Words to Sit With quote size
  wordsQuoteSize: "2rem",

  // Width of the whole site
  pageWidth: "1140px",

  // Space between sections
  sectionSpacing: "4.6rem",

  // Space above and below the first homepage area
  heroTopSpacing: "2rem",
  heroBottomSpacing: "1rem",

  // Space above About Me after the first homepage area
  aboutTopSpacing: "2rem",

  // Card corner roundness
  cardRoundness: "28px",

  // Image corner roundness
  imageRoundness: "26px",

  // Button corner roundness
  buttonRoundness: "999px",

  // First picture width
  heroPictureWidth: "100%",

  // First picture focus point: try "center", "top", or "bottom"
  heroPicturePosition: "50% 52%",

  // Big quote box width
  heroQuoteWidth: "100%",

  // Swamiji quote position: "above" or "below" the first picture
  heroQuotePosition: "below", // "above" or "below"

  // Big quote alignment: "left", "center", or "right"
  heroQuoteAlign: "left", // "left", "center", or "right"

  // TEXTBOX STYLE CONTROLS
  //
  // These match the same textbox numbers in site-text-data.js.
  // To style any textbox, copy one of these blocks and change the textbox number.
  //
  // Example:
  // textbox7 is the Rumi quote beneath the About Me boxes.
  // style: "normal" means not italic.
  // weight: "700" means bold.
  textboxes: {
    // Textbox 1: Homepage subtitle under "Samo Karplus"
    textbox1: {
      size: "1.3rem",
      style: "normal",
      weight: "400",
      align: "left"
    },

    // Textbox 5: Swamiji quote beneath the first picture
    textbox5: {
      size: "1.05rem",
      style: "normal",
      weight: "400",
      align: "left"
    },

    // Textbox 6: Author under the Swamiji quote beneath the first picture
    textbox6: {
      size: "1rem",
      style: "normal",
      weight: "400",
      align: "left"
    },

    // Textbox 7: Rumi quote beneath the About Me boxes
    textbox7: {
      size: "1.5rem",
      style: "normal",
      weight: "600",
      align: "center"
    },

    // Textbox 8: Author under the Rumi quote beneath the About Me boxes
    textbox8: {
      size: "1rem",
      style: "normal",
      weight: "700",
      align: "center"
    },

    // Textbox 43: Words to Sit With section title
    textbox43: {
      align: "left"
    }
  }
};
