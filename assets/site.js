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
