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
const journalList = document.getElementById("journalList");

const prompts = [
  {
    author: "Ramana Maharshi",
    quote:
      "The question 'Who am I?' is not really meant to get an answer, the question 'Who am I?' is meant to dissolve the questioner.",
    image: "assets/images/teachers/bhagavan.jpg",
    alt: "Portrait of Ramana Maharshi."
  },
  {
    author: "Nisargadatta Maharaj",
    quote:
      "Wisdom tells me I am nothing. Love tells me I am everything. And between the two, my life flows.",
    image: "assets/images/teachers/nisargadatta.jpg",
    alt: "Portrait of Nisargadatta Maharaj seated outdoors."
  },
  {
    author: "Anandamayi Ma",
    quote:
      "To attain the Truth one has to endure hardships. It is the obstacles that give birth to patience.",
    image: "assets/images/teachers/anandamayi.jpg",
    alt: "Portrait of Anandamayi Ma."
  },
  {
    author: "Ramana Maharshi",
    quote: "Your own Self-Realization is the greatest service you can render the world.",
    image: "assets/images/teachers/bhagavan.jpg",
    alt: "Portrait of Ramana Maharshi."
  },
  {
    author: "Nisargadatta Maharaj",
    quote:
      "The very idea of going beyond the dream is illusory. Why go anywhere? Just realise that you are dreaming a dream you call the world, and stop looking for ways out.",
    image: "assets/images/teachers/nisargadatta.jpg",
    alt: "Portrait of Nisargadatta Maharaj seated outdoors."
  },
  {
    author: "Anandamayi Ma",
    quote: "Whether you accept or reject Him, He is there all the same.",
    image: "assets/images/teachers/anandamayi.jpg",
    alt: "Portrait of Anandamayi Ma."
  }
];

let promptIndex = 0;
let promptIntervalId = null;

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

renderJournalEntries();

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
  if (promptIntervalId) {
    window.clearInterval(promptIntervalId);
  }

  promptIntervalId = window.setInterval(() => {
    promptIndex = (promptIndex + 1) % prompts.length;
    renderPrompt(promptIndex);
  }, 6000);
}

// Reflective prompt rotation
if (prevPromptButton && nextPromptButton && promptText && promptAuthor && promptImage) {
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
