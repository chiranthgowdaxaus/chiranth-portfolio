"use strict";

const root = document.documentElement;
const motionPreference = window.matchMedia("(prefers-reduced-motion: reduce)");
const themeButtons = document.querySelectorAll(".theme-toggle");
const syncTheme = () => {
  const isLight = root.dataset.theme === "light";
  themeButtons.forEach(button => button.setAttribute("aria-label", `Switch to ${isLight ? "dark" : "light"} theme`));
  const themeMeta = document.querySelector('meta[name="theme-color"]');
  if (themeMeta) themeMeta.content = isLight ? "#f4f3ef" : "#151716";
};
syncTheme();
themeButtons.forEach(button => button.addEventListener("click", () => {
  root.dataset.theme = root.dataset.theme === "light" ? "dark" : "light";
  try { localStorage.setItem("portfolio-theme", root.dataset.theme); } catch { /* Optional preference. */ }
  syncTheme();
}));

document.querySelectorAll(".copy-email").forEach(button => {
  let resetTimer;
  button.addEventListener("click", async () => {
    const status = document.getElementById("copy-status");
    try {
      await navigator.clipboard.writeText("chiranthgowdaofficial@gmail.com");
      button.textContent = "Copied!";
      if (status) status.textContent = "Email copied.";
      clearTimeout(resetTimer);
      resetTimer = window.setTimeout(() => {
        button.textContent = "Copy email";
        if (status) status.textContent = "";
      }, 3500);
    } catch {
      if (status) status.textContent = "Select and copy the email address above.";
    }
  });
});

// A local-only interface concept. These sample records never reach a payment service.
document.querySelectorAll("[data-app-demo]").forEach(demo => {
  const rows = [...demo.querySelectorAll("[data-demo-bill]")];
  const filters = [...demo.querySelectorAll("[data-demo-filter]")];
  const paid = new Set();
  const total = demo.querySelector("[data-demo-total]");
  const count = demo.querySelector("[data-demo-count]");
  const heading = demo.querySelector("[data-demo-heading]");
  const list = demo.querySelector(".demo-bills");
  const empty = demo.querySelector("[data-demo-empty]");
  const status = demo.querySelector("[data-demo-status]");
  let activeFilter = "upcoming";

  const render = () => {
    filters.forEach(button => {
      button.disabled = false;
      button.setAttribute("aria-pressed", String(button.dataset.demoFilter === activeFilter));
    });
    const visible = rows.filter(row => paid.has(row.dataset.demoBill) === (activeFilter === "paid"));
    rows.forEach(row => {
      const isPaid = paid.has(row.dataset.demoBill);
      row.hidden = !visible.includes(row);
      const button = row.querySelector("[data-mark-paid]");
      button.disabled = isPaid;
      button.textContent = isPaid ? "Paid" : "Mark paid";
      button.setAttribute("aria-label", isPaid
        ? row.dataset.name + " paid in the demo"
        : "Mark " + row.dataset.name + " as paid in the demo");
    });
    const sum = visible.reduce((value, row) => value + Number(row.dataset.amount), 0);
    total.textContent = "A$" + sum;
    heading.textContent = activeFilter === "paid" ? "Recorded payments" : "Your next payments";
    count.textContent = visible.length + (visible.length === 1 ? " bill " : " bills ")
      + (activeFilter === "paid" ? "recorded" : "upcoming");
    list.setAttribute("aria-label", activeFilter === "paid" ? "Paid sample bills" : "Upcoming sample bills");
    list.hidden = visible.length === 0;
    empty.hidden = visible.length !== 0;
    empty.textContent = activeFilter === "paid"
      ? "No sample payments recorded yet."
      : "All caught up. No upcoming sample bills.";
  };

  rows.forEach(row => {
    row.querySelector("[data-mark-paid]").addEventListener("click", () => {
      if (paid.has(row.dataset.demoBill)) return;
      paid.add(row.dataset.demoBill);
      render();
      status.textContent = row.dataset.name + " marked paid in this demo.";
      const next = rows.find(item => !item.hidden && !paid.has(item.dataset.demoBill));
      const focusTarget = next?.querySelector("[data-mark-paid]")
        || filters.find(button => button.dataset.demoFilter === activeFilter);
      focusTarget?.focus({ preventScroll: true });
    });
  });
  filters.forEach(button => button.addEventListener("click", () => {
    activeFilter = button.dataset.demoFilter;
    render();
    status.textContent = "Local demo. No real payments.";
  }));
  const reset = demo.querySelector("[data-demo-reset]");
  reset.disabled = false;
  reset.addEventListener("click", () => {
    paid.clear();
    activeFilter = "upcoming";
    render();
    status.textContent = "Demo reset. No real payments.";
  });
  render();
});

if (window.gsap && window.ScrollTrigger) {
  gsap.registerPlugin(ScrollTrigger);
  const media = gsap.matchMedia();
  media.add("(prefers-reduced-motion: no-preference)", () => {
    const hero = document.querySelector(".hero:not(.about-hero)");
    if (hero) {
      gsap.timeline({ defaults: { ease: "power3.out" } })
        .from(".headline-line", { y: 22, opacity: 0, duration: .65, stagger: .1 })
        .from(".hero-intro, .hero-actions, .availability", { y: 12, opacity: 0, duration: .5, stagger: .07 }, .2)
        .from(".hero-photo", { opacity: 0, duration: .7 }, .1);
    }
    const reveals = gsap.utils.toArray("[data-reveal], .about-hero, .case-hero, .case-summary article, .outcome-band, .interest-row, .app-note, .field-grid article");
    reveals.filter(element => !element.parentElement.closest("[data-reveal]")).forEach(element => {
      gsap.from(element, {
        y: 18, opacity: 0, duration: .6, ease: "power2.out",
        scrollTrigger: { trigger: element, start: "top 94%", once: true }
      });
    });
    const progress = document.querySelector(".reading-progress");
    if (progress) gsap.to(progress, {
      scaleX: 1, ease: "none",
      scrollTrigger: { trigger: document.body, start: "top top", end: "bottom bottom", scrub: true }
    });
  });
  media.add("(prefers-reduced-motion: no-preference) and (min-width: 821px)", () => {
    const photo = document.querySelector(".hero-photo img");
    if (photo) gsap.to(photo, {
      y: -16, ease: "none",
      scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: .7 }
    });
  });
  window.addEventListener("load", () => ScrollTrigger.refresh(), { once: true });
  if (document.fonts) document.fonts.ready.then(() => ScrollTrigger.refresh());
}

if (location.hostname !== "127.0.0.1" && location.hostname !== "localhost" && location.protocol === "https:") {
  const analytics = document.createElement("script");
  analytics.src = "/_vercel/insights/script.js";
  analytics.defer = true;
  document.head.append(analytics);
}
