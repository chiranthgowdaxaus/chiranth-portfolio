"use strict";
/* Haptics, used sparingly: only on direct actions (a choice, a toggle, a
   slider detent, a confirmation), never on scrolling, hovering or links.
   Android: the Vibration API. iPhone (iOS 18+): Safari gives a system tick
   when a switch-style checkbox toggles, so a hidden one is toggled inside the
   tap. Laptops and desktops do nothing. */
(() => {
  const touch = matchMedia("(hover: none) and (pointer: coarse)").matches;
  if (!touch) { window.hfx = { tap() {}, select() {}, success() {}, warn() {}, pulses() {} }; return; }

  const vibrate = typeof navigator.vibrate === "function";
  const iosSwitch = !vibrate && "switch" in HTMLInputElement.prototype;
  let last = 0, label = null;

  function iosTick() {
    if (!label) {
      label = document.createElement("label");
      label.setAttribute("aria-hidden", "true");
      label.dataset.hfx = "";
      label.style.cssText = "position:fixed;left:-200px;top:0;width:1px;height:1px;overflow:hidden;opacity:0;pointer-events:none";
      const box = document.createElement("input");
      box.type = "checkbox"; box.setAttribute("switch", ""); box.tabIndex = -1;
      label.append(box); document.body.append(label);
      /* Keep the synthetic click from reaching page handlers (it would close menus). */
      label.addEventListener("click", (e) => e.stopPropagation());
    }
    const active = document.activeElement;
    label.click();
    if (active && active !== document.body && active.focus) active.focus({ preventScroll: true });
  }

  /* pattern: vibration durations in ms (Android). ticks: offsets in ms (iPhone). */
  function play(pattern, ticks) {
    const now = performance.now();
    if (now - last < 40) return;
    last = now;
    if (vibrate) { try { navigator.vibrate(pattern); } catch (_) {} return; }
    if (iosSwitch) { iosTick(); ticks.slice(1).forEach((t) => setTimeout(iosTick, t)); }
  }

  const hfx = window.hfx = {
    tap: () => play(8, [0]),
    select: () => play(12, [0]),
    success: () => play([14, 70, 22], [0, 110]),
    warn: () => play([24, 50, 24, 50, 30], [0, 90, 180]),
    /* The apps' haptic timelines: [[seconds, intensity], ...] */
    pulses(list) {
      const pattern = list.flatMap(([t, a], i) => i ? [Math.max(10, (t - list[i - 1][0]) * 1000 - 18), Math.round(10 + a * 18)] : [Math.round(10 + a * 18)]);
      play(pattern, list.map(([t]) => t * 1000));
    }
  };

  /* Where a tap earns a haptic. Demos with their own pattern handle it themselves. */
  document.addEventListener("click", (e) => {
    const t = e.target;
    if (!(t instanceof Element) || t.closest("[data-hfx]")) return;
    if (t.closest(".copy-email")) return hfx.success();
    if (t.closest(".seg button, .vbar")) return hfx.select();
    if (t.closest("[data-hap], .set-check, .slide-knob")) return;
    if (t.closest(".nav-toggle, summary, button.toggle, .lab-stage button, .lab-stage [role=button]")) return hfx.tap();
  });

  /* Slider detents: one light tick per step, like a picker wheel. */
  document.addEventListener("input", (e) => {
    if (e.target instanceof HTMLInputElement && e.target.type === "range") hfx.tap();
  });
})();
