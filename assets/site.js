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

// Native, keyboard-accessible tabs. Motion is an enhancement, not a dependency.
const tabList = document.querySelector(".capability-tabs");
if (tabList) {
  const tabs = [...tabList.querySelectorAll('[role="tab"]')];
  const panels = [...document.querySelectorAll('[role="tabpanel"]')];
  const activateTab = (tab, animate = true) => {
    tabs.forEach(item => {
      const selected = item === tab;
      item.setAttribute("aria-selected", String(selected));
      item.tabIndex = selected ? 0 : -1;
    });
    panels.forEach(panel => {
      const selected = panel.id === tab.getAttribute("aria-controls");
      panel.hidden = !selected;
      panel.toggleAttribute("data-active", selected);
      if (selected && animate && !motionPreference.matches && window.gsap) {
        gsap.fromTo(panel, { y: 10, opacity: 0 }, { y: 0, opacity: 1, duration: .3, ease: "power2.out", overwrite: true, clearProps: "transform,opacity" });
      }
    });
  };
  tabs.forEach((tab, index) => {
    tab.addEventListener("click", () => activateTab(tab));
    tab.addEventListener("keydown", event => {
      let nextIndex;
      if (["ArrowDown", "ArrowRight"].includes(event.key)) nextIndex = (index + 1) % tabs.length;
      if (["ArrowUp", "ArrowLeft"].includes(event.key)) nextIndex = (index - 1 + tabs.length) % tabs.length;
      if (event.key === "Home") nextIndex = 0;
      if (event.key === "End") nextIndex = tabs.length - 1;
      if (nextIndex === undefined) return;
      event.preventDefault();
      activateTab(tabs[nextIndex]);
      tabs[nextIndex].focus();
    });
  });
  activateTab(tabs.find(tab => tab.getAttribute("aria-selected") === "true") || tabs[0], false);
  const narrowLayout = window.matchMedia("(max-width: 720px)");
  const syncOrientation = () => tabList.setAttribute("aria-orientation", narrowLayout.matches ? "horizontal" : "vertical");
  syncOrientation();
  narrowLayout.addEventListener("change", syncOrientation);
}

if (window.gsap && window.ScrollTrigger) {
  gsap.registerPlugin(ScrollTrigger);
  const media = gsap.matchMedia();
  media.add("(prefers-reduced-motion: no-preference)", () => {
    const hero = document.querySelector(".hero:not(.about-hero)");
    if (hero) {
      gsap.timeline({ defaults: { ease: "power3.out" } })
        .from(".headline-line", { y: 28, opacity: 0, duration: .7, stagger: .12 })
        .from(".hero-person, .hero-actions, .availability", { y: 14, opacity: 0, duration: .5, stagger: .08 }, .25)
        .from(".device-scene", { y: 40, rotationX: 7, opacity: 0, duration: .9 }, .1);
      gsap.to(".hero-showcase", {
        y: -30, rotation: -2, ease: "none",
        scrollTrigger: { trigger: hero, start: "top top", end: "bottom top", scrub: .7 }
      });
    }
    const reveals = gsap.utils.toArray("[data-reveal], .about-hero, .case-hero, .case-summary article, .outcome-band, .interest-row, .app-note, .field-grid article");
    // Avoid stacking entrance effects on nested elements.
    reveals.filter(element => !element.parentElement.closest("[data-reveal]")).forEach(element => {
      gsap.from(element, {
        y: 20, opacity: 0, duration: .65, ease: "power2.out",
        scrollTrigger: { trigger: element, start: "top 94%", once: true }
      });
    });
    gsap.utils.toArray(".paidly-stage").forEach(stage => {
      gsap.fromTo(stage.querySelectorAll(".product-screen"), { y: 16 }, {
        y: -12, ease: "none",
        scrollTrigger: { trigger: stage, start: "top bottom", end: "bottom top", scrub: .6 }
      });
    });
    const progress = document.querySelector(".reading-progress");
    if (progress) gsap.to(progress, {
      scaleX: 1, ease: "none",
      scrollTrigger: { trigger: document.body, start: "top top", end: "bottom bottom", scrub: true }
    });
  });
  media.add("(prefers-reduced-motion: no-preference) and (hover: hover) and (pointer: fine)", () => {
    const scene = document.querySelector(".device-scene");
    const stage = document.querySelector(".hero-showcase");
    if (!scene || !stage) return;
    const rotateX = gsap.quickTo(scene, "rotationX", { duration: .55, ease: "power2.out" });
    const rotateY = gsap.quickTo(scene, "rotationY", { duration: .55, ease: "power2.out" });
    const move = event => {
      const bounds = stage.getBoundingClientRect();
      rotateY(((event.clientX - bounds.left) / bounds.width - .5) * 8);
      rotateX(((event.clientY - bounds.top) / bounds.height - .5) * -6);
    };
    const reset = () => { rotateX(0); rotateY(0); };
    stage.addEventListener("pointermove", move);
    stage.addEventListener("pointerleave", reset);
    return () => {
      stage.removeEventListener("pointermove", move);
      stage.removeEventListener("pointerleave", reset);
    };
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
