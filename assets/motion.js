(function () {
  "use strict";

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const motionItems = [];

  function mark(element, type, delay) {
    if (!element || element.dataset.motion) return;
    element.dataset.motion = type;
    element.style.setProperty("--motion-delay", `${Math.min(delay, 440)}ms`);
    motionItems.push(element);
  }

  function markAll(elements, type, startDelay, step) {
    Array.from(elements).forEach((element, index) => {
      mark(element, type, startDelay + (index * step));
    });
  }

  function prepareHero() {
    const mainHero = document.querySelector("main .hero, main > .hero, .page > .hero");
    if (!mainHero) return;

    mark(mainHero.querySelector(".eyebrow"), "left", 90);
    markAll(mainHero.querySelectorAll(".hero-title > span"), "title", 150, 90);
    mark(mainHero.querySelector("h1:not(.hero-title)"), "title", 170);
    mark(mainHero.querySelector(".hero-typing"), "rise", 310);
    mark(mainHero.querySelector(".hero-copy, .lede, .lead"), "left", 360);
    mark(mainHero.querySelector(".hero-actions"), "rise", 430);
    mark(mainHero.querySelector(".status-panel"), "right", 400);
    markAll(mainHero.querySelectorAll(".meta-item"), "rise", 390, 55);
    markAll(mainHero.querySelectorAll(".pills span"), "rise", 390, 45);
  }

  function prepareHomepage() {
    mark(document.querySelector(".site-nav .nav-inner"), "rise", 40);
    mark(document.querySelector(".ticker"), "scale", 80);

    document.querySelectorAll(".section").forEach((section) => {
      const head = section.querySelector(".section-head");
      mark(head, "left", 0);
      markAll(section.querySelectorAll(".focus-item, .work-row, .experience-row"), "rise", 45, 65);
    });

    mark(document.querySelector(".contact-layout > div:first-child"), "left", 0);
    mark(document.querySelector(".contact-vault-wrap"), "right", 90);
    mark(document.querySelector(".footer"), "rise", 0);
  }

  function prepareCaseStudy() {
    mark(document.querySelector("header .header-inner, .topbar"), "rise", 20);
    markAll(document.querySelectorAll(".metrics .metric"), "metric", 0, 75);

    document.querySelectorAll("section.block").forEach((section) => {
      mark(section.querySelector(".block-head"), "left", 0);
      markAll(section.querySelectorAll(":scope > .wrap > .prose, :scope > .wrap > .lead-in"), "rise", 50, 55);
      markAll(section.querySelectorAll(".pipeline .pstep"), "rise", 65, 55);
      markAll(section.querySelectorAll(".cards .card"), "rise", 65, 60);
      markAll(section.querySelectorAll(".clean-list li"), "left", 45, 42);
      markAll(section.querySelectorAll(".chips .chip-tag"), "rise", 35, 30);
      markAll(section.querySelectorAll(".anatomy-wrap > *, .sprints > *, .sprint"), "rise", 60, 55);
      markAll(section.querySelectorAll(".figure, .board, .stadium-card"), "figure", 70, 80);
      markAll(section.querySelectorAll(".callout, .rtable, .demo-wrap > .heat-caption"), "scale", 90, 60);
    });

    markAll(document.querySelectorAll(".footnav .nav-btn"), "rise", 0, 80);
    mark(document.querySelector(".page-foot"), "rise", 0);
  }

  function prepareFieldNotes() {
    mark(document.querySelector(".topbar"), "rise", 20);
    mark(document.querySelector(".hero .eyebrow"), "left", 90);
    mark(document.querySelector(".hero h1"), "title", 170);
    mark(document.querySelector(".hero .lead"), "left", 300);
    markAll(document.querySelectorAll(".hero .pills span"), "rise", 360, 45);
    markAll(document.querySelectorAll(".note-grid .note"), "rise", 0, 70);
    mark(document.querySelector(".wide"), "scale", 70);
    mark(document.querySelector(".case-footer"), "rise", 0);
  }

  function prepareSignalTraces() {
    document.querySelectorAll(".figure polyline").forEach((line) => {
      if (typeof line.getTotalLength !== "function") return;
      const length = Math.ceil(line.getTotalLength());
      line.classList.add("motion-trace");
      line.style.setProperty("--trace-length", String(length));
    });

    if (reducedMotion) return;

    const emgSvg = document.querySelector('svg[aria-label^="EMG signal transformed"]');
    const emgLines = emgSvg ? Array.from(emgSvg.querySelectorAll("polyline")).slice(0, 4) : [];
    if (emgSvg && emgLines.length) prepareLiveEmgFeed(emgSvg, emgLines);

    const goniometerSvg = document.querySelector('svg[aria-label^="Knee goniometer angle"]');
    if (goniometerSvg) prepareLiveGoniometer(goniometerSvg);
  }

  function parsePolyline(line) {
    return (line.getAttribute("points") || "")
      .trim()
      .split(/\s+/)
      .map((point) => point.split(",").map(Number))
      .filter(([x, y]) => Number.isFinite(x) && Number.isFinite(y));
  }

  function addLiveSignalBadge(svg, label) {
    const figure = svg.closest(".figure");
    if (!figure) return;

    figure.classList.add("has-live-signal");
    const badge = document.createElement("div");
    badge.className = "signal-live-badge";
    badge.setAttribute("aria-label", label);
    badge.innerHTML = '<span aria-hidden="true"></span> simulated live feed';
    figure.appendChild(badge);
  }

  function prepareLiveEmgFeed(svg, lines) {
    const datasets = lines.map((line) => parsePolyline(line));
    if (datasets.some((points) => points.length < 2)) return;

    lines.forEach((line) => line.classList.add("live-signal-line"));
    addLiveSignalBadge(svg, "Animated sample signal feed");

    const figure = svg.closest(".figure");
    let isVisible = !figure;
    let startTime = 0;
    let lastFrame = 0;
    let animationFrame = 0;

    if (figure && "IntersectionObserver" in window) {
      const observer = new IntersectionObserver(([entry]) => {
        isVisible = entry.isIntersecting;
        if (isVisible && !startTime) startTime = performance.now() + 1250;
      }, { rootMargin: "120px 0px", threshold: 0.05 });
      observer.observe(figure);
    }

    function update(now) {
      animationFrame = window.requestAnimationFrame(update);
      if (!isVisible || document.visibilityState !== "visible") return;
      if (!startTime) startTime = now + 1250;
      if (now < startTime || now - lastFrame < 64) return;
      lastFrame = now;

      const elapsed = now - startTime;
      datasets.forEach((points, lineIndex) => {
        const stride = 3;
        const offset = (Math.floor(elapsed / 64) * stride) % points.length;
        const shifted = points.map(([x], pointIndex) => {
          const sourceY = points[(pointIndex + offset) % points.length][1];
          return `${x.toFixed(1)},${sourceY.toFixed(1)}`;
        });
        lines[lineIndex].setAttribute("points", shifted.join(" "));
      });
    }

    animationFrame = window.requestAnimationFrame(update);
    window.addEventListener("pagehide", () => window.cancelAnimationFrame(animationFrame), { once: true });
  }

  function prepareLiveGoniometer(svg) {
    addLiveSignalBadge(svg, "Animated repetition detection pass");

    const peakMarkers = Array.from(svg.querySelectorAll('circle[fill="#9a6400"]'));
    peakMarkers.forEach((marker) => marker.classList.add("detected-peak"));

    const scan = document.createElementNS("http://www.w3.org/2000/svg", "line");
    scan.setAttribute("x1", "94");
    scan.setAttribute("x2", "94");
    scan.setAttribute("y1", "10");
    scan.setAttribute("y2", "174");
    scan.setAttribute("class", "signal-scanline");
    scan.setAttribute("aria-hidden", "true");
    svg.appendChild(scan);

    const figure = svg.closest(".figure");
    const scanStart = 94;
    const scanEnd = 702;
    const cycleDuration = 5800;
    const detectionPulseDuration = 430;
    let isVisible = !figure;
    let startTime = 0;
    let animationFrame = 0;

    if (figure && "IntersectionObserver" in window) {
      const observer = new IntersectionObserver(([entry]) => {
        isVisible = entry.isIntersecting;
        if (isVisible && !startTime) startTime = performance.now() + 850;
      }, { rootMargin: "120px 0px", threshold: 0.05 });
      observer.observe(figure);
    }

    function update(now) {
      animationFrame = window.requestAnimationFrame(update);
      if (!isVisible || document.visibilityState !== "visible") return;
      if (!startTime) startTime = now + 850;

      const elapsed = Math.max(0, now - startTime);
      const progress = (elapsed % cycleDuration) / cycleDuration;
      const scanX = scanStart + ((scanEnd - scanStart) * progress);
      scan.setAttribute("x1", scanX.toFixed(2));
      scan.setAttribute("x2", scanX.toFixed(2));

      peakMarkers.forEach((marker) => {
        const peakX = Number(marker.getAttribute("cx"));
        const detectionProgress = (peakX - scanStart) / (scanEnd - scanStart);
        const millisecondsSinceDetection = (progress - detectionProgress) * cycleDuration;
        const detected = millisecondsSinceDetection >= 0;

        marker.classList.toggle("is-detected", detected);
        marker.classList.toggle(
          "is-detecting",
          detected && millisecondsSinceDetection <= detectionPulseDuration
        );
      });
    }

    animationFrame = window.requestAnimationFrame(update);
    window.addEventListener("pagehide", () => window.cancelAnimationFrame(animationFrame), { once: true });
  }

  function prepareStadiumHeatmap() {
    if (reducedMotion) return;

    const dots = document.querySelector("#stadium-dots");
    if (!dots || !dots.parentNode) return;

    const pulseGroup = document.createElementNS("http://www.w3.org/2000/svg", "g");
    pulseGroup.setAttribute("aria-hidden", "true");
    pulseGroup.setAttribute("class", "heat-pulses");

    [
      { cx: 260, cy: 315, rx: 94, ry: 76, stroke: "#f03338", delay: "0ms" },
      { cx: 580, cy: 250, rx: 76, ry: 62, stroke: "#ff9f2f", delay: "1100ms" },
      { cx: 350, cy: 520, rx: 72, ry: 58, stroke: "#bde66c", delay: "2200ms" }
    ].forEach((hotspot) => {
      const pulse = document.createElementNS("http://www.w3.org/2000/svg", "ellipse");
      Object.entries(hotspot).forEach(([key, value]) => {
        if (key === "delay") {
          pulse.style.setProperty("--pulse-delay", value);
        } else {
          pulse.setAttribute(key, String(value));
        }
      });
      pulse.setAttribute("class", "heat-pulse");
      pulseGroup.appendChild(pulse);
    });

    dots.parentNode.insertBefore(pulseGroup, dots.nextSibling);
  }

  function prepareFreshOnSystem() {
    const svg = document.querySelector('svg[aria-label^="Ecosystem diagram"]');
    if (!svg) return;

    svg.classList.add("freshon-system-map");

    const spokes = Array.from(svg.querySelectorAll(":scope > line"));
    spokes.forEach((spoke, index) => {
      const length = Math.ceil(spoke.getTotalLength());
      spoke.classList.add("freshon-spoke");
      spoke.style.setProperty("--spoke-length", String(length));
      spoke.style.setProperty("--spoke-delay", `${150 + (index * 110)}ms`);
    });

    const surfaceGroup = svg.querySelector(":scope > g");
    if (surfaceGroup) {
      Array.from(surfaceGroup.children).forEach((node, index) => {
        node.classList.add("freshon-surface-node");
        node.style.setProperty("--node-delay", `${430 + (Math.floor(index / 2) * 100)}ms`);
      });
    }

    const flowAnchor = surfaceGroup || svg.firstChild;

    spokes.forEach((spoke, index) => {
      if (reducedMotion) return;

      const x1 = Number(spoke.getAttribute("x1"));
      const y1 = Number(spoke.getAttribute("y1"));
      const x2 = Number(spoke.getAttribute("x2"));
      const y2 = Number(spoke.getAttribute("y2"));
      const flow = document.createElementNS("http://www.w3.org/2000/svg", "circle");
      flow.setAttribute("cx", String(x1));
      flow.setAttribute("cy", String(y1));
      flow.setAttribute("r", "3.8");
      flow.setAttribute("fill", "#55b05a");
      flow.setAttribute("class", "system-flow-dot");
      flow.setAttribute("aria-hidden", "true");

      const travel = document.createElementNS("http://www.w3.org/2000/svg", "animateMotion");
      travel.setAttribute("path", `M 0 0 L ${x2 - x1} ${y2 - y1}`);
      travel.setAttribute("dur", "3.8s");
      travel.setAttribute("begin", `${index * 0.62}s`);
      travel.setAttribute("repeatCount", "indefinite");
      flow.appendChild(travel);
      svg.insertBefore(flow, flowAnchor);
    });
  }

  function revealItems() {
    if (reducedMotion || !("IntersectionObserver" in window)) {
      motionItems.forEach((item) => item.classList.add("is-motion-visible"));
      return;
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-motion-visible");
        observer.unobserve(entry.target);
      });
    }, {
      rootMargin: "0px 0px -8% 0px",
      threshold: 0.12
    });

    motionItems.forEach((item) => {
      const rect = item.getBoundingClientRect();
      const startsInViewport = rect.top < (window.innerHeight * 0.96) && rect.bottom > 0;

      if (startsInViewport) {
        item.classList.add("is-motion-visible");
      } else {
        observer.observe(item);
      }
    });
  }

  function initMotion() {
    document.documentElement.classList.add("motion-ready");
    prepareHero();

    if (document.querySelector(".site-nav")) prepareHomepage();
    if (document.querySelector("section.block")) prepareCaseStudy();
    if (document.body.matches("[data-project='business']")) prepareFieldNotes();

    prepareSignalTraces();
    prepareStadiumHeatmap();
    prepareFreshOnSystem();
    window.requestAnimationFrame(() => window.requestAnimationFrame(revealItems));
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initMotion, { once: true });
  } else {
    initMotion();
  }
}());
