// Mobile navigation
const navToggle = document.querySelector(".nav-toggle");
const siteNav = document.querySelector(".site-nav");
const navLinks = document.querySelectorAll(".site-nav a");
const revealItems = document.querySelectorAll(".reveal");
const promptText = document.getElementById("prompt-text");
const promptAuthor = document.getElementById("prompt-author");
const promptImage = document.getElementById("prompt-image");
const promptImageName = document.getElementById("prompt-image-name");
const prevPromptButton = document.getElementById("prev-prompt");
const nextPromptButton = document.getElementById("next-prompt");
const journalEntries = document.querySelectorAll(".journal-entry");

const prompts = [
  {
    author: "Ramana Maharshi",
    quote:
      "The question 'Who am I?' is not really meant to get an answer, the question 'Who am I?' is meant to dissolve the questioner.",
    image: "assets/images/teachers/ramana-maharshi-v3.jpg",
    alt: "Portrait of Ramana Maharshi."
  },
  {
    author: "Nisargadatta Maharaj",
    quote:
      "Wisdom tells me I am nothing. Love tells me I am everything. And between the two, my life flows.",
    image: "assets/images/teachers/nisargadatta-maharaj-v3.jpg",
    alt: "Portrait of Nisargadatta Maharaj seated outdoors."
  },
  {
    author: "Anandamayi Ma",
    quote:
      "To attain the Truth one has to endure hardships. It is the obstacles that give birth to patience.",
    image: "assets/images/teachers/anandamayi-ma-v3.jpg",
    alt: "Portrait of Anandamayi Ma."
  },
  {
    author: "Ramana Maharshi",
    quote: "Your own Self-Realization is the greatest service you can render the world.",
    image: "assets/images/teachers/ramana-maharshi-v3.jpg",
    alt: "Portrait of Ramana Maharshi."
  },
  {
    author: "Nisargadatta Maharaj",
    quote:
      "The very idea of going beyond the dream is illusory. Why go anywhere? Just realise that you are dreaming a dream you call the world, and stop looking for ways out.",
    image: "assets/images/teachers/nisargadatta-maharaj-v3.jpg",
    alt: "Portrait of Nisargadatta Maharaj seated outdoors."
  },
  {
    author: "Anandamayi Ma",
    quote: "Whether you accept or reject Him, He is there all the same.",
    image: "assets/images/teachers/anandamayi-ma-v3.jpg",
    alt: "Portrait of Anandamayi Ma."
  }
];

let promptIndex = 0;
let promptIntervalId = null;

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
journalEntries.forEach((entry) => {
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
