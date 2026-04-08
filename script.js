// Mobile navigation
const navToggle = document.querySelector(".nav-toggle");
const siteNav = document.querySelector(".site-nav");
const navLinks = document.querySelectorAll(".site-nav a");
const revealItems = document.querySelectorAll(".reveal");
const promptText = document.getElementById("prompt-text");
const prevPromptButton = document.getElementById("prev-prompt");
const nextPromptButton = document.getElementById("next-prompt");
const journalEntries = document.querySelectorAll(".journal-entry");

const prompts = [
  "\"The question 'Who am I?' is not really meant to get an answer, the question 'Who am I?' is meant to dissolve the questioner.\" -Ramana Maharshi",
  "\"Wisdom tells me I am nothing. Love tells me I am everything. And between the two, my life flows.\" -Nisargadatta Maharaj",
  "\"To attain the Truth one has to endure hardships. It is the obstacles that give birth to patience.\" -Anandamayi Ma",
  "\"Your own Self-Realization is the greatest service you can render the world.\" -Ramana Maharshi",
  "\"Love says 'I am everything.' Wisdom says 'I am nothing.' Between the two my life flows.\" -Nisargadatta Maharaj",
  "\"The wound is the place where the Light enters you.\" -Rumi",
  "\"Try not to resist life's changes. Let life flow through you.\" -Rumi",
  "\"The very idea of going beyond the dream is illusory. Why go anywhere? Just realise that you are dreaming a dream you call the world, and stop looking for ways out.\" -Nisargadatta Maharaj",
  "\"Silence is also conversation.\" -Ramana Maharshi",
  "\"What you are, you already are. By knowing what you are not, you are free of it and remain in your own natural state.\" -Nisargadatta Maharaj",
  "\"The quieter you become, the more you are able to hear.\" -Rumi",
  "\"There is no greater mystery than this: being Reality ourselves, we seek to gain Reality.\" -Ramana Maharshi",
  "\"Be empty of worrying. Think of who created thought.\" -Rumi",
  "\"Only the Self is real.\" -Ramana Maharshi",
  "\"Whatever happens, happens to you by you, through you; you are the creator, enjoyer and destroyer of all you perceive.\" -Nisargadatta Maharaj",
  "\"I am not the body, I am not even the mind.\" -Nisargadatta Maharaj"
];

let promptIndex = 0;

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

// Reflective prompt rotation
if (prevPromptButton && nextPromptButton && promptText) {
  prevPromptButton.addEventListener("click", () => {
    promptIndex = (promptIndex - 1 + prompts.length) % prompts.length;
    promptText.textContent = prompts[promptIndex];
  });

  nextPromptButton.addEventListener("click", () => {
    promptIndex = (promptIndex + 1) % prompts.length;
    promptText.textContent = prompts[promptIndex];
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
