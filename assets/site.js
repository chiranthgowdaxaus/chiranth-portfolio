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

/* Speed dials on the Off the clock page */
document.querySelectorAll("[data-cluster]").forEach((cluster) => {
  const gauges = [...cluster.querySelectorAll("[data-gauge]")];
  const still = matchMedia("(prefers-reduced-motion: reduce)").matches;
  let frame = 0;
  const show = (progress) => gauges.forEach((gauge) => {
    gauge.querySelector("[data-gauge-value]").textContent = Math.round(Number(gauge.dataset.gauge) * progress);
  });
  const run = () => {
    cancelAnimationFrame(frame);
    gauges.forEach((gauge) => gauge.classList.remove("is-on"));
    show(still ? 1 : 0);
    cluster.getBoundingClientRect();
    gauges.forEach((gauge) => gauge.classList.add("is-on"));
    if (still) return;
    const start = performance.now();
    const tick = (now) => {
      const t = Math.min((now - start) / 1900, 1);
      show(1 - Math.pow(1 - t, 4));
      if (t < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
  };
  show(still ? 1 : 0);
  if (still || !("IntersectionObserver" in window)) { run(); return; }
  const watcher = new IntersectionObserver((entries) => {
    if (!entries.some((entry) => entry.isIntersecting)) return;
    watcher.disconnect();
    run();
  }, { threshold: 0.35 });
  watcher.observe(cluster);
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
