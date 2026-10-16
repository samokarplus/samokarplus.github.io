// TITLES & WHAT SHOWS
// ------------------------------------------------------------
// This is the one place to rename a section, rename a photo carousel,
// or hide something from the site completely. No other file needs touching.
//
// RENAME:  change the words inside the quotes next to  title:
// HIDE:    change  show: true  to  show: false   (it also disappears from the menu)
// BRING BACK:  change it back to  show: true
//
// Example: to turn the third carousel into "Anya", change its title to "Anya".
// Example: to remove that whole carousel, change its  show: true  to  show: false.
//
// Careful: keep the quotes, the commas, and the curly brackets exactly as they are.
window.mySiteSettings = {
  // EXTRAS
  scrollAnimations: true,   // true = things glide in as you scroll. false = everything just appears.
  nightModeButton: true,    // true = a little moon button lets visitors switch to a starry night look.

  // ORDER of the sections (and the menu). Top to bottom.
  // Easiest way to change it: samo.karplus.org/edit/ -> "Reorder the sections" (drag, then copy).
  // Or just move the words around yourself. Keep the quotes and commas.
  order: ["about", "photos", "places", "media", "journal", "dinosaurFacts", "wordsToSitWith", "crazyEights", "contact"],

  // THE PHOTO CAROUSELS (inside the Photos section)
  carousels: {
    baby:   { show: true, title: "Baby Samo" },
    older:  { show: true, title: "Older Samo" },
    couple: { show: true, title: "Zooboo Booboo Teeny Tiny Baby" }
  },

  // THE BIG SECTIONS. "title" is the big heading on the page, "menu" is the word in the dropdown menu.
  sections: {
    about:          { show: true, title: "About Me",                   menu: "About Me" },
    photos:         { show: true, title: "Photos",                     menu: "Photos" },
    places:         { show: true, title: "Places I’ve Been",           menu: "Places" },
    media:          { show: true, title: "Media & Projects",           menu: "Media & Projects" },
    journal:        { show: true, title: "Reflections",                menu: "Journal" },
    dinosaurFacts:  { show: true, title: "Dinosaur Facts",             menu: "Dinosaur Facts" },
    wordsToSitWith: { show: true, title: "Words to Sit With",          menu: "Words to Sit With" },
    contact:        { show: true, title: "Contact",                    menu: "Contact" },

    // Crazy Eights only has a menu item (the tooth is the secret way in).
    crazyEights:    { show: true,                                      menu: "Crazy Eights" }
  }
};
