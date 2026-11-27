"use strict";
(() => {
  const still = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const root = document.documentElement;
  const probe = document.createElement("span");
  probe.textContent = "Heads up 148";
  probe.style.cssText = "position:absolute;visibility:hidden;font:900 40px -apple-system,BlinkMacSystemFont,system-ui,sans-serif;white-space:nowrap";
  document.body.append(probe);
  const normal = probe.offsetWidth; probe.style.fontStretch = "50%"; probe.style.fontVariationSettings = '"wdth" 50';
  if (Math.abs(probe.offsetWidth - normal) < 3) root.classList.add("no-width");
  probe.remove();

  /* Segmented controls set data-v on the nearest [data-seg-root]. */
  $$(".seg").forEach((seg) => seg.addEventListener("click", (event) => {
    const button = event.target.closest("button[data-v]"); if (!button) return;
    $$("button", seg).forEach((b) => b.setAttribute("aria-pressed", String(b === button)));
    const host = seg.closest("[data-seg-root]");
    if (seg.dataset.attr) host.setAttribute(seg.dataset.attr, button.dataset.v);
    else host.dataset.v = button.dataset.v;
    host.dispatchEvent(new CustomEvent("segchange", { detail: button.dataset.v }));
  }));
  $$("[data-toggle]").forEach((b) => b.addEventListener("click", () => {
    const on = b.getAttribute("aria-pressed") !== "true"; b.setAttribute("aria-pressed", String(on));
    b.closest(".lab-stage").classList.toggle(b.dataset.toggle, on);
  }));

  /* Annotated screens */
  $$("[data-anno]").forEach((a) => {
    const set = (i) => $$("[data-i]", a).forEach((e) => e.classList.toggle("is-on", e.dataset.i === i));
    $$("[data-i]", a).forEach((e) => { e.addEventListener("click", () => set(e.dataset.i)); e.addEventListener("mouseenter", () => set(e.dataset.i)); });
    set("1");
  });

  /* Sound and haptic timelines */
  const audio = {};
  const sound = (name) => {
    if (!name) return;
    const a = audio[name] || (audio[name] = new Audio(`../assets/sounds/paidly-${name}.m4a`));
    a.currentTime = 0; a.volume = name === "tick" ? .4 : .65; a.play().catch(() => {});
  };
  /* Real haptics through assets/haptics.js: vibration on Android, the system tick on iPhone. */
  function haptic(pulses) {
    if (window.hfx && (navigator.userActivation?.hasBeenActive ?? true)) window.hfx.pulses(pulses);
  }
  $$("[data-hap]").forEach((b) => {
    const pulses = JSON.parse(b.dataset.hap);
    const line = b.querySelector(".hap-line");
    const span = Math.max(.42, pulses[pulses.length - 1][0] + .08);
    line.innerHTML = pulses.map(([t, a, s = .5]) => `<i style="left:${t / span * 100}%;--h:${Math.max(14, a * 100)}%;--w:${3 + s * 7}px"></i>`).join("");
    b.addEventListener("click", () => {
      sound(b.dataset.sound); haptic(pulses); b.classList.remove("is-playing"); void b.offsetWidth; b.classList.add("is-playing");
      $$("i", line).forEach((bar, i) => { setTimeout(() => { bar.classList.add("is-on"); setTimeout(() => bar.classList.remove("is-on"), 130); }, pulses[i][0] * 1000); });
    });
  });

  /* The app's SwiftUI springs, solved exactly */
  function springFrames(response, damping, distance) {
    const w = 2 * Math.PI / response, wd = w * Math.sqrt(1 - damping * damping), total = Math.max(.7, response * 2.4), frames = [];
    for (let i = 0; i <= 60; i++) { const t = total * i / 60, x = 1 - Math.exp(-damping * w * t) * (Math.cos(wd * t) + damping * w / wd * Math.sin(wd * t)); frames.push({ transform: `translateX(${x * distance}px)` }); }
    return [frames, total * 1000];
  }
  $$("[data-spring]").forEach((b) => b.addEventListener("click", () => {
    const [r, z] = b.dataset.spring.split(",").map(Number), track = b.querySelector(".spring-track"), dot = track.firstElementChild, distance = track.clientWidth - 20;
    if (still) { dot.style.transform = dot.style.transform ? "" : `translateX(${distance}px)`; return; }
    const [frames, duration] = springFrames(r, z, distance); dot.animate(frames, { duration, easing: "linear", fill: "both" });
  }));

  /* Paidly next-bill card */
  $$("[data-bill]").forEach((box) => {
    const slide = box.querySelector(".slide"), knob = box.querySelector(".slide-knob"), fill = box.querySelector(".slide-fill"), label = box.querySelector(".slide-label"), status = box.querySelector("[data-bill-status]");
    const head = box.querySelector("[data-bill-head]"), kicker = box.querySelector("[data-bill-kicker]");
    const words = { due: ["Heads up.", "Next up · Due tomorrow"], late: ["You're late.", "Next up · 3d late"], red: ["You're late.", "Next up · 3d late"] };
    let x = 0, start = 0, drag = false, done = false, tick = 0;
    const travel = () => slide.clientWidth - 56;
    const paint = () => { knob.style.transform = `translateX(${x}px)`; fill.style.width = `${x + 56}px`; label.style.opacity = done ? 1 : Math.max(0, 1 - x / travel() * 1.8); };
    const reset = () => { done = false; x = 0; tick = 0; knob.textContent = "→"; label.textContent = "Slide to mark paid"; if (status) status.textContent = "Drag the white knob. It confirms at 82%."; paint(); };
    function finish() {
      done = true; x = travel(); knob.textContent = "✓"; label.textContent = "Paid"; paint(); sound("paid"); haptic([[0, 1], [.14, .9], [.26, .6]]);
      if (status) status.textContent = "Success haptic, two soft taps and the paid sound.";
      if (!still) for (let i = 0; i < 22; i++) { const b = document.createElement("i"); b.className = "bit"; b.style.background = ["#fff", "#f2c14e", "#34d399"][i % 3]; b.style.left = `${35 + Math.random() * 30}%`; b.style.top = "48%"; box.querySelector(".bill-card").append(b); b.animate([{ transform: "translate(0,0) rotate(0)", opacity: 1 }, { transform: `translate(${(Math.random() - .5) * 280}px,${-70 - Math.random() * 130}px) rotate(${Math.random() * 500}deg)`, opacity: 0 }], { duration: 850 + Math.random() * 450, easing: "cubic-bezier(.2,.8,.3,1)" }).onfinish = () => b.remove(); }
      setTimeout(reset, 2300);
    }
    knob.addEventListener("pointerdown", (e) => { if (done) return; drag = true; start = e.clientX - x; knob.setPointerCapture(e.pointerId); knob.style.transition = ""; });
    knob.addEventListener("pointermove", (e) => { if (!drag) return; x = Math.min(travel(), Math.max(0, e.clientX - start)); const t = Math.floor(x / travel() * 5); if (t !== tick) { tick = t; sound("tick"); haptic([[0, .25]]); } paint(); });
    knob.addEventListener("pointerup", () => { if (!drag) return; drag = false; if (x >= travel() * .82) finish(); else { x = 0; tick = 0; paint(); } });
    knob.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); if (!done) finish(); } });
    box.addEventListener("segchange", (e) => { head.textContent = words[e.detail][0]; kicker.textContent = words[e.detail][1]; reset(); });
    reset();
  });

  /* Repway set logger */
  $$("[data-setlog]").forEach((box) => {
    const rows = $$(".set-grid .set-row", box), rest = box.querySelector(".rest"), time = rest.querySelector("strong"), bar = box.querySelector(".set-progress i"), count = box.querySelector("[data-count]"), status = box.querySelector("[data-set-status]");
    let left = 0, timer = 0;
    const show = () => { time.textContent = `${Math.floor(left / 60)}:${String(left % 60).padStart(2, "0")}`; };
    const stop = () => { clearInterval(timer); rest.classList.remove("is-on"); };
    const update = () => { const n = $$(".set-row.is-done", box).length; bar.style.width = `${n / rows.length * 100}%`; count.textContent = `${n} of ${rows.length} sets`; };
    const start = () => { left = 90; show(); rest.classList.add("is-on"); clearInterval(timer); timer = setInterval(() => { left -= 1; show(); if (left <= 0) { stop(); haptic([[0, .8], [.18, .8], [.36, 1]]); status.textContent = "Three firm taps: rest is over, lift again."; } }, 1000); };
    rows.forEach((row) => {
      const kg = row.querySelector(".kg"), check = row.querySelector(".set-check");
      row.querySelector(".set-last").addEventListener("click", () => { kg.textContent = "60"; status.textContent = "Last time copied in one tap."; });
      check.addEventListener("click", () => { const on = row.classList.toggle("is-done"); check.classList.toggle("is-on", on); check.setAttribute("aria-pressed", String(on)); if (on && kg.textContent === "–") kg.textContent = "60"; update(); if (on) { start(); status.textContent = "Ticking the set starts the 90-second rest timer."; haptic([[0, .75]]); } });
    });
    $$("[data-rest]", rest).forEach((b) => b.addEventListener("click", () => { const v = b.dataset.rest; if (v === "skip") stop(); else { left = Math.max(1, left + Number(v)); show(); } }));
    update();
  });

  /* Nightfall */
  $$("[data-roles]").forEach((box) => box.addEventListener("segchange", (e) => {
    const shadow = e.detail === "shadow", set = (k, v) => { box.querySelector(`[data-r="${k}"]`).textContent = v; };
    set("name", shadow ? "SHADOW" : "HUNTER"); set("line", shadow ? "Stay hidden. Outlast the clock." : "Follow the clues. Find every Shadow."); set("a", shadow ? "Hide now" : "Wait at the start");
  }));
  $$("[data-flow]").forEach((box) => {
    const steps = $$(".flow-step", box); let i = 0, timer = 0;
    const set = () => steps.forEach((s, n) => s.classList.toggle("is-on", n === i)); set();
    box.querySelector("button").addEventListener("click", () => { clearInterval(timer); i = 0; set(); if (still) return; timer = setInterval(() => { i += 1; if (i >= steps.length) { clearInterval(timer); i = steps.length - 1; } set(); }, 900); });
  });
  $$("[data-clue]").forEach((svg) => {
    const dot = svg.querySelector("[data-live]"), ring = svg.querySelector("[data-ring]"), label = svg.querySelector("[data-ring-label]");
    const pos = (t) => [180 + 118 * Math.sin(t * .42), 110 + 62 * Math.sin(t * .73 + 1)]; let last = -9, visible = false, start = performance.now();
    const place = (t) => { const [x, y] = pos(t); dot.setAttribute("cx", x); dot.setAttribute("cy", y); if (t - last > 3) { last = t; const [cx, cy] = pos(t - 2.4); ring.setAttribute("cx", cx); ring.setAttribute("cy", cy); label.setAttribute("x", Math.min(300, cx + 30)); label.setAttribute("y", cy + 4); } };
    const loop = (now) => { if (!visible) return; place((now - start) / 1000); requestAnimationFrame(loop); };
    place(4); if (still || !("IntersectionObserver" in window)) return;
    new IntersectionObserver(([e]) => { const was = visible; visible = e.isIntersecting; if (visible && !was) requestAnimationFrame(loop); }).observe(svg);
  });

  /* Sensor project */
  $$("[data-wave]").forEach((box) => {
    const svg = box.querySelector("svg"), input = box.querySelector("input"), rect = svg.querySelector("[data-window]"), out = box.querySelector("[data-wave-out]");
    const emg = (x) => { const t = x / 800 * 2, burst = Math.exp(-(((t % .66) - .33) ** 2) / .018); return Math.sin(x * 1.37) * Math.sin(x * .43 + 1) * (.14 + burst * .86); };
    let a = "", b = ""; for (let x = 0; x <= 800; x += 2) { a += `${x ? "L" : "M"}${x} ${52 - emg(x) * 42}`; b += `${x ? "L" : "M"}${x} ${140 - 25 * Math.sin(x / 800 * 2 * Math.PI * 3.03 - 1.57)}`; }
    svg.querySelector("[data-emg]").setAttribute("d", a); svg.querySelector("[data-knee]").setAttribute("d", b);
    const update = () => { const n = Number(input.value), x = n * 20; rect.setAttribute("x", x); let sum = 0; for (let i = x; i < x + 80; i += 2) sum += emg(i) ** 2; out.textContent = `Window ${n + 1}: ${(n * .05).toFixed(2)} to ${(n * .05 + .2).toFixed(2)} s · activity ${Math.sqrt(sum / 40).toFixed(2)}`; };
    input.addEventListener("input", update); update();
  });
  $$("[data-norm]").forEach((box) => {
    const bars = box.querySelector(".norm-bars"), note = box.querySelector("[data-norm-note]"), raw = Array.from({ length: 34 }, (_, i) => 22 + 18 * Math.abs(Math.sin(i * .7)) + 7 * Math.sin(i * 2.1)); raw[21] = 190;
    const sorted = [...raw].sort((x, y) => x - y), p95 = sorted[Math.floor(.95 * (sorted.length - 1))];
    bars.innerHTML = raw.map((v, i) => `<i class="${i === 21 ? "is-spike" : ""}"></i>`).join("");
    const set = (m) => { const top = m === "p95" ? p95 : Math.max(...raw); $$("i", bars).forEach((b, i) => b.style.setProperty("--h", `${Math.min(100, raw[i] / top * 100)}%`)); note.textContent = m === "p95" ? "Normal effort stays readable. The spike no longer sets the scale." : "One artefact flattens every real repetition."; };
    box.addEventListener("segchange", (e) => set(e.detail)); set("max");
  });
  $$("[data-split]").forEach((box) => {
    const grid = box.querySelector(".split-grid"), people = 6, per = 24, note = box.querySelector("[data-split-note]");
    grid.innerHTML = Array.from({ length: people }, (_, p) => `<div class="split-row"><span>Person ${p + 1}</span>${"<i></i>".repeat(per)}</div>`).join("");
    const cells = $$(".split-row", grid).map((r) => $$("i", r)); let held = 0;
    const paint = (m) => { cells.forEach((row, p) => row.forEach((c, i) => c.classList.toggle("is-test", m === "random" ? (p * 7 + i * 11) % 5 === 0 : p === held))); note.textContent = m === "random" ? "The same person is in training and test, so scores can look too good." : `Person ${held + 1} is never seen in training.`; };
    let mode = "random"; box.addEventListener("segchange", (e) => { mode = e.detail; paint(mode); });
    box.querySelector("button.stage-action").addEventListener("click", () => { mode = "loso"; $$(".seg button", box).forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.v === "loso"))); held = (held + 1) % people; paint(mode); }); paint(mode);
  });

  /* Stadium crowd heatmap */
  $$("[data-stadium]").forEach((box) => {
    const svg = box.querySelector("svg"), layer = svg.querySelector("[data-heat-layer]"), plan = svg.querySelector("[data-plan]"), seatsG = svg.querySelector("[data-seats]");
    const error = box.querySelector("[data-stadium-error]"), steps = $$(".pipeline li", box), out = box.querySelector("[data-heat-out]");
    const CX = 400, CY = 290, RX = 196, RY = 150, SECTORS = 32, GAP = .011;
    const TIERS = [[24, 58, "lower tier"], [68, 102, "middle tier"], [114, 148, "upper tier"]];
    const rand = (n) => { const x = Math.sin(n * 12.9898 + 78.233) * 43758.5453; return x - Math.floor(x); };
    const pt = (a, d) => [CX + (RX + d) * Math.cos(a), CY + (RY + d * .9) * Math.sin(a)];
    const f = (n) => n.toFixed(1);
    const stops = [[23, 17, 47], [92, 31, 122], [196, 58, 91], [245, 138, 60], [252, 227, 138]];
    const color = (v) => { const p = Math.min(.999, Math.max(0, v)) * 4, i = Math.floor(p), t = p - i; return `rgb(${stops[i].map((n, k) => Math.round(n + (stops[i + 1][k] - n) * t))})`; };
    const area = (a) => { const s = Math.sin(a), c = Math.cos(a); return Math.abs(s) > .72 ? (s < 0 ? "top wing" : "bottom wing") : Math.abs(c) > .9 ? (c < 0 ? "left end" : "right end") : "pocket"; };

    // Ground markings, drawn once: oval, centre square and circles, 50 m arcs, goal squares, a dimension line.
    const arc50 = (side) => { const gx = CX + side * RX, r = 128, a0 = Math.acos(Math.min(1, 50 / r)); return `M${f(gx - side * r * Math.cos(.95))} ${f(CY - r * Math.sin(.95))}A${r} ${r} 0 0 ${side > 0 ? 0 : 1} ${f(gx - side * r * Math.cos(.95))} ${f(CY + r * Math.sin(.95))}`; };
    plan.innerHTML = `<ellipse cx="${CX}" cy="${CY}" rx="${RX}" ry="${RY}"/><ellipse cx="${CX}" cy="${CY}" rx="${RX + 154}" ry="${RY + 140}" stroke-opacity=".45"/>` +
      `<rect x="${CX - 26}" y="${CY - 26}" width="52" height="52"/><circle cx="${CX}" cy="${CY}" r="16"/><circle cx="${CX}" cy="${CY}" r="4"/><path d="M${CX} ${CY - 10}V${CY + 10}"/>` +
      `<path d="${arc50(1)}"/><path d="${arc50(-1)}"/>` +
      [-1, 1].map((s) => `<rect x="${s > 0 ? CX + RX - 12 : CX - RX}" y="${CY - 9}" width="12" height="18"/><path d="M${CX + s * RX} ${CY - 18}V${CY + 18}" stroke-width="2"/>`).join("") +
      `<g fill="#a9ccff" stroke="none" font-family="ui-monospace,Menlo,monospace" font-size="11" letter-spacing="1.5" opacity=".75"><text x="${CX}" y="${CY - RY + 26}" text-anchor="middle">WING</text><text x="${CX}" y="${CY + RY - 16}" text-anchor="middle">WING</text><text x="${CX - RX - 186}" y="${CY + 4}" text-anchor="middle">END</text><text x="${CX + RX + 186}" y="${CY + 4}" text-anchor="middle">END</text></g>`;

    const sections = [];
    TIERS.forEach(([r0, r1, tier], t) => {
      for (let s = 0; s < SECTORS; s++) {
        const a0 = s / SECTORS * 2 * Math.PI + GAP, a1 = (s + 1) / SECTORS * 2 * Math.PI - GAP, mid = (a0 + a1) / 2;
        let shape = ""; for (let k = 0; k <= 6; k++) shape += (k ? "L" : "M") + pt(a0 + (a1 - a0) * k / 6, r0).map(f).join(" ");
        for (let k = 6; k >= 0; k--) shape += "L" + pt(a0 + (a1 - a0) * k / 6, r1).map(f).join(" ");
        const seats = [];
        for (let row = 0; row < 4; row++) {
          const d = r0 + 5 + row * (r1 - r0 - 10) / 3, len = Math.hypot(...[0, 1].map((i) => pt(a1, d)[i] - pt(a0, d)[i])), n = Math.max(3, Math.round(len / 8.2));
          for (let k = 0; k < n; k++) seats.push(pt(a0 + (a1 - a0) * (k + .5) / n, d));
        }
        sections.push({ t, tier, mid, shape: shape + "Z", seats, id: t * SECTORS + s });
      }
    });

    const density = (sec, mode) => {
      if (mode === "flat") return .55;
      const wing = .5 + .5 * Math.abs(Math.sin(sec.mid)), tierW = [1, .86, .7][sec.t], noise = (rand(sec.id) - .5) * .22;
      const v = mode === "full" ? .32 + .66 * wing * tierW + noise : (.18 + .62 * wing * [1, .75, .32][sec.t] + noise) * .9;
      return Math.min(1, Math.max(.04, v));
    };

    const draw = (mode) => {
      steps.forEach((s) => s.classList.remove("is-on", "is-bad"));
      if (mode === "bad") {
        error.hidden = false; layer.style.opacity = ".08"; seatsG.style.opacity = ".15";
        steps[0].classList.add("is-on"); steps[1].classList.add("is-bad"); out.textContent = "No image. A clear error goes back to the service instead."; return;
      }
      error.hidden = true; layer.style.opacity = ""; seatsG.style.opacity = "";
      const raw = sections.map((sec) => density(sec, mode)), lo = Math.min(...raw), hi = Math.max(...raw), range = hi - lo;
      layer.innerHTML = sections.map((sec, i) => `<path d="${sec.shape}" fill="${color(range ? (raw[i] - lo) / range : 0)}"/>`).join("");
      let filled = 0, total = 0;
      seatsG.innerHTML = sections.map((sec, i) => sec.seats.map(([x, y], k) => { total++; const on = rand(sec.id * 97 + k) < raw[i]; if (on) filled++;
        return on ? `<circle cx="${f(x)}" cy="${f(y)}" r="1.9" fill="#fff" fill-opacity=".9"/>` : `<circle cx="${f(x)}" cy="${f(y)}" r="1.5" fill="none" stroke="#9cc3ff" stroke-opacity=".35" stroke-width=".7"/>`; }).join("")).join("");
      steps.forEach((s) => s.classList.add("is-on"));
      const top = sections[raw.indexOf(hi)];
      out.textContent = mode === "flat" ? "Every reading is equal, so normalising avoids dividing by zero and the map stays even." : `${Math.round(filled / total * 100)}% of seats filled · busiest: ${top.tier}, ${area(top.mid)} · saved as PNG with its file path returned`;
    };
    box.addEventListener("segchange", (e) => draw(e.detail)); draw("full");
  });
})();
