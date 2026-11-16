"use strict";

document.documentElement.classList.add("js");

/* Mobile navigation */
document.querySelectorAll(".nav-toggle").forEach((toggle) => {
  const bar = toggle.closest(".nav-bar");
  const setOpen = (open) => {
    bar.classList.toggle("is-open", open);
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
  };
  toggle.addEventListener("click", () => setOpen(!bar.classList.contains("is-open")));
  bar.querySelectorAll(".nav-links a").forEach((link) => link.addEventListener("click", () => setOpen(false)));
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && bar.classList.contains("is-open")) { setOpen(false); toggle.focus(); }
  });
  document.addEventListener("click", (event) => { if (!bar.contains(event.target)) setOpen(false); });
});

/* Project filter (segmented control) */
const projectGrid = document.querySelector("[data-project-grid]");
const filters = [...document.querySelectorAll("[data-project-filter]")];
if (projectGrid && filters.length) {
  const cards = [...projectGrid.querySelectorAll("[data-project-categories]")];
  const status = document.querySelector("[data-project-status]");
  filters.forEach((button) => {
    button.disabled = false;
    button.addEventListener("click", () => {
      const filter = button.dataset.projectFilter;
      filters.forEach((item) => item.setAttribute("aria-pressed", String(item === button)));
      let shown = 0;
      cards.forEach((card) => {
        card.hidden = filter !== "all" && !card.dataset.projectCategories.split(" ").includes(filter);
        if (!card.hidden) { shown += 1; card.classList.add("is-visible"); }
      });
      if (status) status.textContent = `${shown} project${shown === 1 ? "" : "s"}${filter === "all" ? "" : ` in ${filter}`}`;
    });
  });
}

/* Section highlighting in the nav */
if ("IntersectionObserver" in window) {
  const pairs = [...document.querySelectorAll(".nav-links a[href^='#']")]
    .map((link) => [document.querySelector(link.getAttribute("href")), link])
    .filter(([section]) => section);
  const inView = new Set();
  const spy = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) inView.add(entry.target);
      else inView.delete(entry.target);
    });
    // Only the last section crossing the reading line is current.
    const active = [...pairs].reverse().find(([section]) => inView.has(section));
    pairs.forEach(([section, link]) => {
      if (active && section === active[0]) link.setAttribute("aria-current", "location");
      else link.removeAttribute("aria-current");
    });
  }, { rootMargin: "-30% 0px -60% 0px" });
  pairs.forEach(([section]) => spy.observe(section));
}

/* Scroll reveal */
const revealTargets = document.querySelectorAll("[data-reveal]");
if ("IntersectionObserver" in window && !matchMedia("(prefers-reduced-motion: reduce)").matches) {
  const reveal = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("is-visible");
      reveal.unobserve(entry.target);
    });
  }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });
  revealTargets.forEach((element, index) => {
    element.style.transitionDelay = `${Math.min(index % 3, 2) * 70}ms`;
    reveal.observe(element);
  });
} else {
  revealTargets.forEach((element) => element.classList.add("is-visible"));
}

/* Light that follows the pointer across interactive glass */
if (matchMedia("(hover: hover) and (pointer: fine)").matches) {
  document.querySelectorAll(".glass.is-lit").forEach((surface) => {
    surface.addEventListener("pointermove", (event) => {
      const rect = surface.getBoundingClientRect();
      surface.style.setProperty("--mx", `${event.clientX - rect.left}px`);
      surface.style.setProperty("--my", `${event.clientY - rect.top}px`);
    }, { passive: true });
  });
}

/* Layout-grid overlay on the FreshOn posters */
document.querySelectorAll("[data-grid-toggle]").forEach((toggle) => {
  const target = document.getElementById(toggle.getAttribute("aria-controls"));
  toggle.hidden = false;
  toggle.addEventListener("click", () => {
    const on = toggle.getAttribute("aria-pressed") !== "true";
    toggle.setAttribute("aria-pressed", String(on));
    target.classList.toggle("show-grid", on);
  });
});

/* Copy email */
document.querySelectorAll(".copy-email").forEach((button) => {
  let timer;
  button.addEventListener("click", async () => {
    const status = document.getElementById("copy-status");
    try {
      await navigator.clipboard.writeText(button.dataset.email);
      button.textContent = "Copied";
      if (status) status.textContent = "Email address copied.";
      clearTimeout(timer);
      timer = setTimeout(() => {
        button.textContent = "Copy";
        if (status) status.textContent = "";
      }, 3000);
    } catch {
      if (status) status.textContent = "Select and copy the address instead.";
    }
  });
});

/* Vercel analytics, only on the deployed site */
if (location.protocol === "https:" && !["localhost", "127.0.0.1"].includes(location.hostname)) {
  const analytics = document.createElement("script");
  analytics.src = "/_vercel/insights/script.js";
  analytics.defer = true;
  document.head.append(analytics);
}
