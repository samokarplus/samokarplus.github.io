# Design Lab

A private design playground for samo.karplus.org. It shows **your real content** (portrait, Strava stats,
About cards, photos, films, journal, Crazy Eights, dinosaur facts, Words to Sit With, contact) in ten different
visual directions, and lets you mix them.

It lives on the `design-lab` branch and **does not change the live site**. It only *reads* the site's existing
data files and images (`../journal-data.js`, `../assets/images/...`, `../strava-data.json`, and so on).

## Open it

From the repo root:

```bash
python3 -m http.server 8800
```

Then visit <http://localhost:8800/design-lab/>.

## What is in it

| View | What it does |
| --- | --- |
| **Gallery** | Ten live, full-page previews of your homepage, plus your current site for reference. |
| **Studio** | One big preview with controls: pick a direction, mix colors / type / layout / menu from other directions, change fonts, colors, corner roundness, spacing, card and button styles, photo treatment. Switch Desktop / Tablet / Mobile and jump to any section. |
| **Compare** | Two previews side by side (any direction, your Studio mix, or your live site) with synced scrolling. |
| **Menus** | Six menu styles (classic bar, full-screen hamburger, slide-out sidebar, floating pill, minimal dropdown, side rail) as live phone previews. |
| **Top 3** | The three recommended directions and why. |

## Files

```text
design-lab/index.html     the lab shell
design-lab/lab.css        lab chrome
design-lab/lab.js         gallery, studio, compare, menus, top 3
design-lab/themes.js      the ten directions + option lists (edit here to tweak or add a direction)
design-lab/preview.html   renders the real site in a given look (also usable on its own: preview.html?theme=coastal)
design-lab/preview.css    every look: tokens + data-attribute layout switches
design-lab/preview.js     builds the page from your real data files
```

## Notes

- No dependencies and no build step. Fonts come from Google Fonts (free), loaded only by the preview.
- Respects `prefers-reduced-motion`, has a skip link, labelled controls and a keyboard-operable menu.
- Calendly is replaced by a link in previews to keep them light. Nothing is deployed from here.
