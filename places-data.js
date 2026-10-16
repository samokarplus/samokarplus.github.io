// Add or remove places here. You do not need to edit index.html.
// The maps on the site update on their own.
//
// COUNTRIES: name, iso (3-letter code, e.g. "ITA"), lat/lon for the pin, and a flag emoji.
// TERRITORIES: places without their own outline on the map (just a pin).
// STATES: name, code (2-letter, e.g. "CO"), lat/lon for the pin.
//
// Tip: to add a country, look up its 3-letter code (Italy = ITA, Japan = JPN) and
// type any point inside it for lat/lon (the pin goes there).
window.placesData = {
  countries: [
    { name: "Germany", iso: "DEU", lat: 51.0, lon: 10.3, flag: "🇩🇪" },
    { name: "United States", iso: "USA", lat: 39.5, lon: -98.5, flag: "🇺🇸" },
    { name: "France", iso: "FRA", lat: 46.6, lon: 2.3, flag: "🇫🇷" },
    { name: "Mexico", iso: "MEX", lat: 23.6, lon: -102.5, flag: "🇲🇽" },
    { name: "Taiwan", iso: "TWN", lat: 23.7, lon: 121.0, flag: "🇹🇼" },
    { name: "The Philippines", iso: "PHL", lat: 12.9, lon: 122.0, flag: "🇵🇭" },
    { name: "Slovenia", iso: "SVN", lat: 46.1, lon: 14.8, flag: "🇸🇮" },
    { name: "Italy", iso: "ITA", lat: 42.8, lon: 12.6, flag: "🇮🇹" },
    { name: "UK (London)", iso: "GBR", lat: 51.5, lon: -0.12, flag: "🇬🇧" },
    { name: "The Netherlands", iso: "NLD", lat: 52.2, lon: 5.5, flag: "🇳🇱" },
    { name: "Panama", iso: "PAN", lat: 8.5, lon: -80.1, flag: "🇵🇦" }
  ],
  territories: [
    { name: "British Virgin Islands", lat: 18.43, lon: -64.62, flag: "🇻🇬" }
  ],
  states: [
    { name: "California", code: "CA", lat: 37.2, lon: -119.5 },
    { name: "Colorado", code: "CO", lat: 39.0, lon: -105.5 },
    { name: "Georgia", code: "GA", lat: 32.7, lon: -83.4 },
    { name: "Arizona", code: "AZ", lat: 34.3, lon: -111.7 },
    { name: "Illinois", code: "IL", lat: 40.0, lon: -89.2 },
    { name: "Wisconsin", code: "WI", lat: 44.6, lon: -89.9 },
    { name: "Nevada", code: "NV", lat: 39.3, lon: -116.6 },
    { name: "South Carolina", code: "SC", lat: 33.9, lon: -80.9 },
    { name: "Utah", code: "UT", lat: 39.3, lon: -111.7 },
    { name: "Washington", code: "WA", lat: 47.4, lon: -120.5 },
    { name: "Texas", code: "TX", lat: 31.5, lon: -99.3 },
    { name: "New Jersey", code: "NJ", lat: 40.1, lon: -74.7 },
    { name: "Florida", code: "FL", lat: 28.6, lon: -82.4 },
    { name: "Minnesota", code: "MN", lat: 46.3, lon: -94.3 },
    { name: "Iowa", code: "IA", lat: 42.0, lon: -93.5 }
  ]
};
