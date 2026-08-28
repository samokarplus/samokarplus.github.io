// Edit the site's look here.
// Change only the values inside quotes.
//
// QUICK COPY/PASTE COLORS
//
// Warm cream:        "#faf7f0"
// Soft white:        "#fffdf8"
// Dark text:         "#33332d"
// Soft gray text:    "#6d6a60"
// Terracotta:        "#d9745f"
// Gold:              "#d4a373"
// Sage green:        "#9bbf9e"
// Deep green:        "#4f6f52"
// Soft blue:         "#8fb6c8"
// Deep blue:         "#355c7d"
// Lavender:          "#b9a7d8"
// Rose:              "#d88ca0"
//
// A color code like "#d4a373" is just a color.
// Copy one of the color codes above and paste it below.
//
// QUICK COPY/PASTE FONTS
//
// Current normal font:       "Lato, sans-serif"
// Current heading font:      "Merriweather, serif"
// Clean/simple font:         "Arial, sans-serif"
// Classic readable font:     "Georgia, serif"
// Soft modern font:          "Trebuchet MS, sans-serif"
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
  backgroundColor: "#faf7f0",

  // Slightly lighter color at the top of the page
  pageTopColor: "#fdf9f1",

  // Main text color
  textColor: "#33332d",

  // Softer text color for subtitles and smaller notes
  softTextColor: "#6d6a60",

  // Small label color, link hover color, and accent color
  accentColor: "#d9745f",

  // Main button color
  buttonColor: "#d4a373",

  // Button color when you hover over it
  buttonHoverColor: "#d9745f",

  // Card background color
  cardColor: "rgba(255, 252, 245, 0.82)",

  // Normal paragraph font
  bodyFont: "Lato, sans-serif",

  // Heading and quote font
  headingFont: "Merriweather, serif",

  // Normal paragraph size
  normalTextSize: "1rem",

  // All heading size multiplier: "1" is normal, "1.1" is 10% bigger
  headingSize: "1",

  // Big quote above the first picture
  heroQuoteSize: "1.05rem",

  // Rotating Words to Sit With quote size
  wordsQuoteSize: "2rem",

  // Width of the whole site
  pageWidth: "1140px",

  // Space between sections
  sectionSpacing: "5rem",

  // Card corner roundness
  cardRoundness: "28px",

  // Image corner roundness
  imageRoundness: "34px",

  // Button corner roundness
  buttonRoundness: "999px",

  // First picture width
  heroPictureWidth: "100%",

  // First picture focus point: try "center", "top", or "bottom"
  heroPicturePosition: "center",

  // Big quote box width
  heroQuoteWidth: "100%",

  // Big quote position: "above" or "below"
  heroQuotePosition: "above", // "above" or "below"

  // Big quote alignment: "left", "center", or "right"
  heroQuoteAlign: "left", // "left", "center", or "right"

  // TEXTBOX STYLE CONTROLS
  //
  // These match the same textbox numbers in site-text-data.js.
  // To style any textbox, copy one of these blocks and change the textbox number.
  //
  // Example:
  // textbox7 is the short Rumi quote under the homepage.
  // style: "normal" means not italic.
  // weight: "700" means bold.
  textboxes: {
    // Textbox 1: Homepage subtitle under "Samo Karplus"
    textbox1: {
      size: "1rem",
      font: "Lato, sans-serif",
      style: "normal",
      weight: "400",
      color: "#6d6a60",
      align: "left"
    },

    // Textbox 5: Big quote above the first picture
    textbox5: {
      size: "1.05rem",
      font: "Merriweather, serif",
      style: "normal",
      weight: "400",
      color: "#5f4a38",
      align: "left"
    },

    // Textbox 6: Author under the big quote above the first picture
    textbox6: {
      size: "1rem",
      font: "Lato, sans-serif",
      style: "normal",
      weight: "400",
      color: "#6d6a60",
      align: "left"
    },

    // Textbox 7: Short Rumi quote under the homepage
    textbox7: {
      size: "1.4rem",
      font: "Merriweather, serif",
      style: "normal",
      weight: "700",
      color: "#5f4a38",
      align: "center"
    },

    // Textbox 8: Author under the short Rumi quote
    textbox8: {
      size: "1rem",
      font: "Lato, sans-serif",
      style: "normal",
      weight: "700",
      color: "#d9745f",
      align: "center"
    },

    // Textbox 43: Words to Sit With section title
    textbox43: {
      size: "3rem",
      font: "Merriweather, serif",
      style: "normal",
      weight: "400",
      color: "#33332d",
      align: "left"
    }
  }
};
