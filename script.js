// Mobile navigation
const navToggle = document.querySelector(".nav-toggle");
const siteNav = document.querySelector(".site-nav");
const navLinks = document.querySelectorAll(".site-nav a");
const promptText = document.getElementById("prompt-text");
const promptAuthor = document.getElementById("prompt-author");
const promptImage = document.getElementById("prompt-image");
const promptImageName = document.getElementById("prompt-image-name");
const prevPromptButton = document.getElementById("prev-prompt");
const nextPromptButton = document.getElementById("next-prompt");
const aboutPhotoTrack = document.getElementById("aboutPhotoTrack");
const photoTrack = document.getElementById("photoTrack");
const journalList = document.getElementById("journalList");
const stravaYear = document.getElementById("strava-year");
const stravaRunMiles = document.getElementById("strava-run-miles");
const stravaWalkMiles = document.getElementById("strava-walk-miles");
const stravaRunElevation = document.getElementById("strava-run-elevation");
const stravaBikeMiles = document.getElementById("strava-bike-miles");
const stravaSwimYards = document.getElementById("strava-swim-yards");
const stravaUpdated = document.getElementById("strava-updated");
const runningPrList = document.getElementById("runningPrList");
const upcomingRaceList = document.getElementById("upcomingRaceList");
const prompts = Array.isArray(window.quoteEntriesData) ? window.quoteEntriesData : [];

let promptIndex = 0;
let promptIntervalId = null;

function formatNumber(value) {
  return new Intl.NumberFormat("en-US").format(value);
}

function formatUpdatedAt(value) {
  if (!value) {
    return "Waiting for Strava sync";
  }

  const updated = new Date(value);

  if (Number.isNaN(updated.getTime())) {
    return "Updated from Strava";
  }

  return `Updated ${updated.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric"
  })} from Strava`;
}

async function renderStravaStats() {
  if (!stravaYear || !stravaRunMiles || !stravaWalkMiles || !stravaRunElevation || !stravaBikeMiles || !stravaSwimYards || !stravaUpdated) {
    return;
  }

  try {
    const response = await fetch("strava-data.json", { cache: "no-store" });
    const stats = await response.json();

    if (!stats.connected) {
      return;
    }

    stravaYear.textContent = stats.year || new Date().getFullYear();
    stravaRunMiles.textContent = formatNumber(stats.runMiles ?? stats.miles);
    stravaWalkMiles.textContent = formatNumber(stats.walkMiles ?? 0);
    stravaRunElevation.textContent = formatNumber(stats.totalElevationFeet ?? stats.elevationFeet);
    stravaBikeMiles.textContent = formatNumber(stats.bikeMiles ?? 0);
    stravaSwimYards.textContent = formatNumber(stats.swimYards ?? 0);
    stravaUpdated.textContent = formatUpdatedAt(stats.updatedAt);
  } catch {
    stravaUpdated.textContent = "Strava sync unavailable";
  }
}

function renderRunningPrs() {
  if (!runningPrList || !Array.isArray(window.runningPrEntriesData)) {
    return;
  }

  runningPrList.replaceChildren();

  window.runningPrEntriesData.forEach((pr) => {
    const item = document.createElement("div");
    const distance = document.createElement("span");
    const time = document.createElement("span");

    item.className = "pr-item";
    distance.className = "pr-distance";
    time.className = "pr-time";
    distance.textContent = pr.distance;
    time.textContent = pr.time;

    item.appendChild(distance);
    item.appendChild(time);
    runningPrList.appendChild(item);
  });
}

function renderUpcomingRaces() {
  if (!upcomingRaceList || !Array.isArray(window.upcomingRaceEntriesData)) {
    return;
  }

  upcomingRaceList.replaceChildren();

  if (!window.upcomingRaceEntriesData.length) {
    const empty = document.createElement("p");
    empty.className = "race-empty";
    empty.textContent = "No upcoming races listed yet.";
    upcomingRaceList.appendChild(empty);
    return;
  }

  window.upcomingRaceEntriesData.forEach((race) => {
    const item = document.createElement("article");
    const date = document.createElement("p");
    const name = document.createElement("h3");
    const meta = document.createElement("p");
    const details = [race.distance, race.location].filter(Boolean).join(" · ");

    item.className = "race-item";
    date.className = "race-date";
    name.className = "race-name";
    meta.className = "race-meta";
    date.textContent = race.date;
    name.textContent = race.name;
    meta.textContent = details;

    item.append(date, name);

    if (details) {
      item.appendChild(meta);
    }

    upcomingRaceList.appendChild(item);
  });
}

function renderAboutPhotos() {
  if (!aboutPhotoTrack || !Array.isArray(window.aboutPhotoEntriesData)) {
    return;
  }

  aboutPhotoTrack.replaceChildren();

  const photos = [...window.aboutPhotoEntriesData, ...window.aboutPhotoEntriesData];

  photos.forEach((photo) => {
    aboutPhotoTrack.appendChild(createPhotoCard(photo));
  });
}

function createPhotoCard(photo) {
  const figure = document.createElement("figure");
  const image = document.createElement("img");
  const caption = document.createElement("figcaption");

  figure.className = "gallery-card";
  image.src = photo.src;
  image.alt = photo.alt;
  caption.textContent = photo.caption;

  figure.appendChild(image);

  if (photo.caption) {
    figure.appendChild(caption);
  }

  return figure;
}

function renderPhotoGallery() {
  if (!photoTrack || !Array.isArray(window.photoEntriesData)) {
    return;
  }

  photoTrack.replaceChildren();

  const photos = [...window.photoEntriesData, ...window.photoEntriesData];

  photos.forEach((photo) => {
    photoTrack.appendChild(createPhotoCard(photo));
  });
}

function getJournalParagraphs(entry) {
  if (Array.isArray(entry.paragraphs)) {
    return entry.paragraphs;
  }

  if (typeof entry.text === "string") {
    return entry.text
      .split(/\n\s*\n/)
      .map((paragraph) => paragraph.trim())
      .filter(Boolean);
  }

  return [];
}

function getJournalMonthLabel(date) {
  const [month, , year] = date.split("-");
  const monthIndex = Number(month) - 1;
  const fullYear = Number(year) < 70 ? 2000 + Number(year) : 1900 + Number(year);
  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December"
  ];

  if (!monthNames[monthIndex] || Number.isNaN(fullYear)) {
    return "Journal";
  }

  return `${monthNames[monthIndex]} ${fullYear}`;
}

function createJournalEntry(entry, isOpen) {
  const article = document.createElement("article");
  const toggle = document.createElement("button");
  const date = document.createElement("span");
  const chevron = document.createElement("span");
  const content = document.createElement("div");

  article.className = `journal-entry reveal${isOpen ? " is-open" : ""}`;
  toggle.className = "journal-toggle";
  toggle.type = "button";
  toggle.setAttribute("aria-expanded", String(isOpen));
  date.className = "entry-meta";
  date.textContent = entry.date;
  chevron.className = "journal-chevron";
  chevron.setAttribute("aria-hidden", "true");
  chevron.textContent = "▾";
  content.className = "journal-content";
  content.hidden = !isOpen;

  toggle.append(date, chevron);

  getJournalParagraphs(entry).forEach((paragraph) => {
    const paragraphElement = document.createElement("p");
    paragraphElement.textContent = paragraph;
    content.appendChild(paragraphElement);
  });

  article.append(toggle, content);
  return article;
}

function renderJournalEntries() {
  if (!journalList || !Array.isArray(window.journalEntriesData)) {
    return;
  }

  journalList.replaceChildren();

  const monthGroups = [];

  window.journalEntriesData.forEach((entry) => {
    const monthLabel = getJournalMonthLabel(entry.date);
    const currentGroup = monthGroups[monthGroups.length - 1];

    if (currentGroup && currentGroup.label === monthLabel) {
      currentGroup.entries.push(entry);
      return;
    }

    monthGroups.push({
      label: monthLabel,
      entries: [entry]
    });
  });

  monthGroups.forEach((group, groupIndex) => {
    const isMonthOpen = groupIndex === 0;
    const section = document.createElement("section");
    const toggle = document.createElement("button");
    const label = document.createElement("span");
    const count = document.createElement("span");
    const chevron = document.createElement("span");
    const entries = document.createElement("div");

    section.className = `journal-month reveal${isMonthOpen ? " is-open" : ""}`;
    toggle.className = "journal-month-toggle";
    toggle.type = "button";
    toggle.setAttribute("aria-expanded", String(isMonthOpen));
    label.className = "journal-month-label";
    label.textContent = group.label;
    count.className = "journal-month-count";
    count.textContent = `${group.entries.length} ${group.entries.length === 1 ? "entry" : "entries"}`;
    chevron.className = "journal-chevron";
    chevron.setAttribute("aria-hidden", "true");
    chevron.textContent = "▾";
    entries.className = "journal-month-entries";
    entries.hidden = !isMonthOpen;

    toggle.append(label, count, chevron);

    group.entries.forEach((entry, entryIndex) => {
      entries.appendChild(createJournalEntry(entry, isMonthOpen && entryIndex === 0));
    });

    section.append(toggle, entries);
    journalList.appendChild(section);
  });
}

renderAboutPhotos();
renderPhotoGallery();
renderJournalEntries();
renderRunningPrs();
renderUpcomingRaces();
renderStravaStats();

if (navToggle && siteNav) {
  navToggle.addEventListener("click", () => {
    const isOpen = siteNav.classList.toggle("is-open");
    navToggle.setAttribute("aria-expanded", String(isOpen));
  });

  navLinks.forEach((link) => {
    link.addEventListener("click", () => {
      siteNav.classList.remove("is-open");
      navToggle.setAttribute("aria-expanded", "false");
    });
  });
}

// Gentle reveal animation as sections enter view
if ("IntersectionObserver" in window) {
  const revealItems = document.querySelectorAll(".reveal");
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.15
    }
  );

  revealItems.forEach((item) => observer.observe(item));
} else {
  const revealItems = document.querySelectorAll(".reveal");
  revealItems.forEach((item) => item.classList.add("is-visible"));
}

function renderPrompt(index) {
  const prompt = prompts[index];

  if (!prompt || !promptText || !promptAuthor || !promptImage || !promptImageName) {
    return;
  }

  promptAuthor.textContent = prompt.author;
  promptText.textContent = "“" + prompt.quote + "”";
  promptImage.src = prompt.image;
  promptImage.alt = prompt.alt;
  promptImageName.textContent = prompt.author;
}

function startPromptRotation() {
  if (!prompts.length) {
    return;
  }

  if (promptIntervalId) {
    window.clearInterval(promptIntervalId);
  }

  promptIntervalId = window.setInterval(() => {
    promptIndex = (promptIndex + 1) % prompts.length;
    renderPrompt(promptIndex);
  }, 6000);
}

// Reflective prompt rotation
if (prompts.length && prevPromptButton && nextPromptButton && promptText && promptAuthor && promptImage) {
  renderPrompt(promptIndex);
  startPromptRotation();

  prevPromptButton.addEventListener("click", () => {
    promptIndex = (promptIndex - 1 + prompts.length) % prompts.length;
    renderPrompt(promptIndex);
    startPromptRotation();
  });

  nextPromptButton.addEventListener("click", () => {
    promptIndex = (promptIndex + 1) % prompts.length;
    renderPrompt(promptIndex);
    startPromptRotation();
  });
}

// Expand and collapse journal entries so long reflections stay easy to browse.
document.querySelectorAll(".journal-month").forEach((month) => {
  const toggle = month.querySelector(".journal-month-toggle");
  const content = month.querySelector(".journal-month-entries");

  if (!toggle || !content) {
    return;
  }

  toggle.addEventListener("click", () => {
    const isOpen = toggle.getAttribute("aria-expanded") === "true";
    toggle.setAttribute("aria-expanded", String(!isOpen));
    month.classList.toggle("is-open", !isOpen);
    content.hidden = isOpen;
  });
});

document.querySelectorAll(".journal-entry").forEach((entry) => {
  const toggle = entry.querySelector(".journal-toggle");
  const content = entry.querySelector(".journal-content");

  if (!toggle || !content) {
    return;
  }

  toggle.addEventListener("click", () => {
    const isOpen = toggle.getAttribute("aria-expanded") === "true";
    toggle.setAttribute("aria-expanded", String(!isOpen));
    entry.classList.toggle("is-open", !isOpen);
    content.hidden = isOpen;
  });
});
