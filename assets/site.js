"use strict";

document.querySelectorAll(".nav-toggle").forEach(toggle => {
  const nav = toggle.closest(".nav");
  const close = () => {
    nav.classList.remove("is-open");
    toggle.setAttribute("aria-expanded", "false");
    toggle.setAttribute("aria-label", "Open navigation");
  };
  toggle.addEventListener("click", () => {
    const open = nav.classList.toggle("is-open");
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? "Close navigation" : "Open navigation");
  });
  nav.querySelectorAll("a").forEach(link => link.addEventListener("click", close));
  document.addEventListener("keydown", event => {
    if (event.key === "Escape" && nav.classList.contains("is-open")) {
      close();
      toggle.focus();
    }
  });
  document.addEventListener("click", event => {
    if (!nav.contains(event.target)) close();
  });
});

const projectGrid = document.querySelector(".work-grid");
const projectFilters = [...document.querySelectorAll("[data-project-filter]")];
if (projectGrid && projectFilters.length) {
  const cards = [...projectGrid.querySelectorAll("[data-project-categories]")];
  const status = document.querySelector("[data-project-status]");
  projectFilters.forEach(button => {
    button.disabled = false;
    button.addEventListener("click", () => {
      const filter = button.dataset.projectFilter;
      projectGrid.dataset.filter = filter;
      projectFilters.forEach(item => item.setAttribute("aria-pressed", String(item === button)));
      const visible = cards.filter(card => {
        card.hidden = filter !== "all" && !card.dataset.projectCategories.split(" ").includes(filter);
        return !card.hidden;
      });
      if (status) status.textContent = `${visible.length} projects${filter === "all" ? "" : ` in ${filter}`}`;
      if (window.gsap) {
        gsap.killTweensOf(cards);
        gsap.set(visible, { clearProps: "opacity,transform" });
        if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
          gsap.fromTo(visible, { opacity: .35, y: 10 }, { opacity: 1, y: 0, duration: .3, stagger: .04, clearProps: "opacity,transform" });
        }
      }
      if (window.ScrollTrigger) ScrollTrigger.refresh();
    });
  });
}

if ("IntersectionObserver" in window) {
  const locations = [["work", ".nav-work"], ["expertise", ".nav-expertise"]];
  const sections = locations.map(([id, selector]) => [document.getElementById(id), document.querySelector(selector)]).filter(([section, link]) => section && link);
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      const pair = sections.find(([section]) => section === entry.target);
      if (pair) {
        if (entry.isIntersecting) pair[1].setAttribute("aria-current", "location");
        else pair[1].removeAttribute("aria-current");
      }
    });
  }, { rootMargin: "-15% 0px -55% 0px", threshold: 0 });
  sections.forEach(([section]) => observer.observe(section));
}

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
        .from(".hero-product", { opacity: 0, y: 12, duration: .8 }, .1);
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
  window.addEventListener("load", () => ScrollTrigger.refresh(), { once: true });
  if (document.fonts) document.fonts.ready.then(() => ScrollTrigger.refresh());
}

if (location.hostname !== "127.0.0.1" && location.hostname !== "localhost" && location.protocol === "https:") {
  const analytics = document.createElement("script");
  analytics.src = "/_vercel/insights/script.js";
  analytics.defer = true;
  document.head.append(analytics);
}
