// PLACES I'VE BEEN
// ------------------------------------------------------------
// To add a place: type its name inside quotes, add a comma, save. That's it.
// The map fills it in, drops a pin, adds the flag and updates the count.
//
//   "Japan",          <- a country (add under COUNTRIES)
//   "Oregon",         <- a US state (add under STATES; a 2-letter code like "OR" works too)
//
// To remove a place, delete its line.
// If a place doesn't show up, check the spelling (open the page, press F12, look at the Console).
window.placesData = {
  // COUNTRIES
  countries: [
    "Germany",
    "United States",
    "France",
    "Mexico",
    "Taiwan",
    "The Philippines",
    "Slovenia",
    "Italy",
    "UK (London)",
    "The Netherlands",
    "Panama"
  ],

  // STATES (US)
  states: [
    "California",
    "Colorado",
    "Georgia",
    "Arizona",
    "Illinois",
    "Wisconsin",
    "Nevada",
    "New Mexico",
    "South Carolina",
    "Utah",
    "Washington",
    "Texas",
    "New Jersey",
    "Florida",
    "Minnesota",
    "Iowa"
  ],

  // OTHER PLACES (islands/territories too small for the map outline).
  // These need a flag and a rough latitude/longitude (right-click a spot in Google Maps to copy them).
  otherPlaces: [
    { name: "British Virgin Islands", lat: 18.43, lon: -64.62, flag: "🇻🇬" }
  ]
};
