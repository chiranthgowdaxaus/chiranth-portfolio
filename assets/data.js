"use strict";
/* Charts for the data analytics case studies. Every figure comes from the
   JSON embedded in the page, which was exported from the project's dashboard. */
(() => {
  const src = document.getElementById("dataset");
  if (!src) return;
  const D = JSON.parse(src.textContent);
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const el = (tag, cls, text) => { const e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; };
  const sum = (rows, f) => rows.reduce((s, r) => s + Number(r[f]), 0);
  const num = (x) => Math.round(x).toLocaleString("en-GB");
  const pct = (x, d = 1) => (x * 100).toFixed(d) + "%";
  const gbp = (x) => {
    const a = Math.abs(x), s = x < 0 ? "−" : "";
    if (a >= 1e6) return s + "£" + (a / 1e6).toFixed(2) + "m";
    if (a >= 1e3) return s + "£" + Math.round(a / 1e3).toLocaleString("en-GB") + "k";
    return s + "£" + Math.round(a);
  };
  const aud = (x) => {
    const a = Math.abs(x), s = x < 0 ? "−" : "";
    if (a >= 1e6) return s + "$" + (a / 1e6).toFixed(2) + "m";
    if (a >= 1e3) return s + "$" + Math.round(a / 1e3).toLocaleString("en-GB") + "k";
    return s + "$" + Math.round(a);
  };
  const group = (rows, key, fields) => {
    const m = new Map();
    for (const r of rows) {
      if (!m.has(r[key])) m.set(r[key], Object.fromEntries(fields.map((f) => [f, 0])));
      const v = m.get(r[key]); for (const f of fields) v[f] += Number(r[f]);
    }
    return [...m].map(([k, v]) => ({ key: k, ...v }));
  };
  const onSeg = (host, fn) => host.addEventListener("segchange", (e) => fn(e.detail));

  /* Column chart of buttons. items: [{label, value, cls}] */
  function columns(host, items, pick, start) {
    host.replaceChildren();
    const max = Math.max(1e-9, ...items.map((d) => Math.abs(d.value)));
    const bars = items.map((d, i) => {
      const b = el("button", "vbar" + (d.cls ? " " + d.cls : ""));
      b.type = "button"; b.setAttribute("aria-label", d.aria || d.label);
      const bar = el("i"); bar.style.setProperty("--h", (Math.abs(d.value) / max * 100).toFixed(2) + "%");
      b.append(bar, el("span", "", d.label));
      b.addEventListener("click", () => select(i));
      b.addEventListener("mouseenter", () => select(i));
      b.addEventListener("focus", () => select(i));
      host.append(b); return b;
    });
    function select(i) { bars.forEach((b, j) => { b.classList.toggle("is-on", j === i); b.setAttribute("aria-pressed", String(j === i)); }); pick(items[i], i); }
    select(Math.min(start ?? items.length - 1, items.length - 1));
  }
  function hbars(host, items, scale) {
    host.replaceChildren();
    const max = scale || Math.max(1e-9, ...items.map((d) => d.value));
    for (const d of items) {
      const row = el("div", "hbar" + (d.cls ? " " + d.cls : ""));
      const track = el("div"); const bar = el("i"); bar.style.setProperty("--v", Math.min(100, d.value / max * 100).toFixed(2) + "%");
      track.append(bar); row.append(el("b", "", d.label), track, el("span", "", d.text)); host.append(row);
    }
  }
  function dbars(host, items) {
    host.replaceChildren();
    const max = Math.max(1e-9, ...items.map((d) => Math.abs(d.value)));
    for (const d of items) {
      const row = el("div", "hbar dbar");
      const track = el("div"); const bar = el("i", d.value >= 0 ? "is-pos" : "is-neg");
      bar.style.setProperty("--w", (Math.abs(d.value) / max * 50).toFixed(2) + "%");
      track.append(bar); row.append(el("b", "", d.label), track, el("span", "", d.text)); host.append(row);
    }
  }
  function set(host, key, text) { const t = $(`[data-out="${key}"]`, host); if (t) t.textContent = text; }

  /* ---------------- Workforce ---------------- */
  if (D.kind === "workforce") {
    const months = D.months.map((m, i) => {
      const open = i ? D.months[i - 1].headcount : m.headcount - m.hires + m.exits;
      return { ...m, turnover: m.exits / ((open + m.headcount) / 2) };
    });
    const stage = $("[data-headcount]");
    const svg = $("svg", stage), range = $("input", stage);
    const W = 640, H = 230, L = 40, R = 14, T = 14, B = 30;
    const lo = 780, hi = 880;
    const x = (i) => L + i * (W - L - R) / (months.length - 1);
    const y = (v) => T + (hi - v) / (hi - lo) * (H - T - B);
    const path = (f) => months.map((m, i) => (i ? "L" : "M") + x(i).toFixed(1) + " " + y(m[f]).toFixed(1)).join("");
    const NS = "http://www.w3.org/2000/svg";
    const s = (tag, attrs, text) => { const e = document.createElementNS(NS, tag); for (const k in attrs) e.setAttribute(k, attrs[k]); if (text != null) e.textContent = text; return e; };
    for (let v = lo; v <= hi; v += 20) { svg.append(s("line", { class: "grid", x1: L, x2: W - R, y1: y(v), y2: y(v) }), s("text", { x: L - 8, y: y(v) + 4, "text-anchor": "end" }, v)); }
    months.forEach((m, i) => svg.append(s("text", { x: x(i), y: H - 8, "text-anchor": "middle" }, m.label)));
    const gap = "M" + months.map((m, i) => x(i) + " " + y(m.headcount)).join("L") + "L" + months.map((m, i) => x(i) + " " + y(m.plan)).reverse().join("L") + "Z";
    svg.append(s("path", { class: "gap", d: gap }), s("path", { class: "plan", d: path("plan") }), s("path", { class: "actual", d: path("headcount") }));
    const cursor = s("line", { class: "cursor", y1: T, y2: H - B }), dp = s("circle", { class: "dot-plan", r: 4 }), da = s("circle", { class: "dot", r: 6 });
    svg.append(cursor, dp, da);
    const show = (i) => {
      const m = months[i];
      cursor.setAttribute("x1", x(i)); cursor.setAttribute("x2", x(i));
      dp.setAttribute("cx", x(i)); dp.setAttribute("cy", y(m.plan)); da.setAttribute("cx", x(i)); da.setAttribute("cy", y(m.headcount));
      const v = m.headcount - m.plan, sv = m.salary - m.budget;
      set(stage, "month", m.name);
      set(stage, "hc", num(m.headcount));
      set(stage, "var", (v > 0 ? "+" : "") + v + " vs plan");
      set(stage, "turn", pct(m.turnover));
      set(stage, "sal", (sv > 0 ? "+" : "") + aud(sv));
      $(`[data-out="sal"]`, stage).classList.toggle("is-up", sv > 0);
      set(stage, "note", `${m.hires} hires and ${m.exits} exits. Salary ${aud(m.salary)} against a ${aud(m.budget)} budget.`);
    };
    range.max = months.length - 1; range.value = months.length - 1;
    range.addEventListener("input", () => show(+range.value));
    show(months.length - 1);

    const flow = $("[data-flow-cols]");
    columns($(".vbars", flow), months.map((m) => ({ label: m.label, value: m.hires - m.exits, cls: m.hires < m.exits ? "is-neg" : "", aria: m.name })), (m, i) => {
      const r = months[i];
      set(flow, "flow", `${r.name}: ${r.hires} hires, ${r.exits} exits, net ${r.hires - r.exits >= 0 ? "+" : ""}${r.hires - r.exits}`);
    });

    const dept = $("[data-dept]");
    const draw = (mode) => {
      const rows = [...D.departments].sort((a, b) => mode === "salary" ? (b.salary - b.budget) - (a.salary - a.budget) : (b.headcount - b.plan) - (a.headcount - a.plan));
      dbars($(".hbars", dept), rows.map((d) => {
        const v = mode === "salary" ? d.salary - d.budget : d.headcount - d.plan;
        return { label: d.name, value: v, text: mode === "salary" ? (v > 0 ? "+" : "") + aud(v) : (v > 0 ? "+" : "") + v + " people" };
      }));
      set(dept, "dept", mode === "salary"
        ? "Seven of eight departments spent over budget. Operations is the exception, at 21 people under plan."
        : "Sales and IT & Digital hired ahead of plan while Operations ran 21 people short.");
    };
    onSeg(dept, draw); draw("headcount");
  }

  /* ---------------- Retail ---------------- */
  if (D.kind === "retail") {
    const months = [...new Set(D.rows.map((r) => r.m))].sort();
    const label = (m) => new Date(m + "-01T00:00:00").toLocaleString("en-GB", { month: "short" });
    const trend = $("[data-trend]");
    const draw = (market) => {
      const rows = D.rows.filter((r) => market === "all" || (market === "uk") === (r.c === "United Kingdom"));
      const by = group(rows, "m", ["g", "cr", "n", "o"]);
      const items = months.map((m) => {
        const r = by.find((d) => d.key === m) || { g: 0, cr: 0, n: 0, o: 0 };
        return { label: label(m), value: r.n, cls: m === "2011-12" ? "is-partial" : "", aria: m, r, m };
      });
      columns($(".vbars", trend), items, (d) => {
        const yr = d.m.slice(0, 4);
        set(trend, "trend", `${label(d.m)} ${yr}${d.m === "2011-12" ? " (to 9 Dec only)" : ""}: ${gbp(d.r.n)} net from ${num(d.r.o)} invoices. Credits ${gbp(d.r.cr)}, ${pct(d.r.g ? d.r.cr / d.r.g : 0)} of gross.`);
      }, months.indexOf("2011-11"));
      const n = sum(rows, "n"), g = sum(rows, "g"), c = sum(rows, "cr");
      set(trend, "n", gbp(n)); set(trend, "o", num(sum(rows, "o"))); set(trend, "cr", pct(c / g)); set(trend, "mk", String(new Set(rows.map((r) => r.c)).size));
    };
    onSeg(trend, draw); draw("all");

    const mk = $("[data-markets]");
    const markets = group(D.rows, "c", ["n"]).sort((a, b) => b.n - a.n);
    const total = sum(markets, "n");
    const drawM = (mode) => {
      const list = (mode === "ex" ? markets.filter((m) => m.key !== "United Kingdom") : markets).slice(0, 8);
      hbars($(".hbars", mk), list.map((m) => ({ label: m.key, value: m.n, text: gbp(m.n), cls: m.key === "United Kingdom" ? "" : (mode === "ex" ? "" : "is-dim") })));
      set(mk, "mk", mode === "ex"
        ? `Without the UK, the next seven markets are close: the Netherlands leads with ${gbp(markets[1].n)}.`
        : `The UK is ${pct(markets[0].n / total, 0)} of net value. Every other market is a sliver at this scale.`);
    };
    onSeg(mk, drawM); drawM("all");

    const seg = $("[data-segments]");
    const segOrder = ["Recent repeat (3+ orders)", "Recent single order", "Other active", "Lapsed"];
    const S = [...D.segments].sort((a, b) => segOrder.indexOf(a.segment) - segOrder.indexOf(b.segment)), cs = sum(S, "customers"), gs = sum(S, "gross");
    const fill = (row, f, tot) => { const bar = $(`[data-stack="${row}"]`, seg); bar.replaceChildren(); S.forEach((d, i) => { const share = d[f] / tot; const it = el("i", "c" + (i + 1), share >= .08 ? pct(share, 0) : ""); it.style.setProperty("--v", (share * 100).toFixed(2) + "%"); it.title = `${d.segment}: ${pct(share)}`; bar.append(it); }); };
    fill("customers", "customers", cs); fill("value", "gross", gs);

    const pr = $("[data-products]");
    const nonMerch = new Set(D.nonMerch);
    const drawP = (mode) => {
      const list = D.products.filter((p) => mode === "all" || !nonMerch.has(p.code)).slice(0, 8);
      const ol = $(".rank", pr); ol.replaceChildren();
      for (const p of list) {
        const li = el("li", nonMerch.has(p.code) ? "is-flag" : "");
        const b = el("b"); b.append(el("code", "", p.code), document.createTextNode(p.name));
        li.append(b, el("span", "", gbp(p.gross))); ol.append(li);
      }
      set(pr, "pr", mode === "all" ? "Two postage lines make the top eight. Orange rows aren't products." : "Products only. The craft bird and the storage jar owe most of their value to one bulk order each, both credited back.");
    };
    onSeg(pr, drawP); drawP("all");
  }

  /* ---------------- Marketing ---------------- */
  if (D.kind === "marketing") {
    const order = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"];
    const cap = (s) => s[0].toUpperCase() + s.slice(1);
    const stage = $("[data-months]");
    let channel = "all", metric = "rate";
    const draw = () => {
      const rows = D.rows.filter((r) => channel === "all" || r.contact === channel);
      const by = group(rows, "month", ["observations", "subscriptions"]);
      const items = order.map((m) => {
        const r = by.find((d) => d.key === m) || { observations: 0, subscriptions: 0 };
        const rate = r.observations ? r.subscriptions / r.observations : 0;
        return { label: cap(m), value: metric === "rate" ? rate : r.observations, cls: r.observations < 1000 ? "is-thin" : "", r, rate, m };
      });
      columns($(".vbars", stage), items, (d) => {
        set(stage, "mo", `${cap(d.m)}: ${num(d.r.observations)} contacts, ${num(d.r.subscriptions)} subscribed, ${pct(d.rate)} conversion.`);
      }, 4);
      const n = sum(rows, "observations"), s = sum(rows, "subscriptions");
      set(stage, "n", num(n)); set(stage, "s", num(s)); set(stage, "r", pct(s / n)); set(stage, "u", num(n - s));
    };
    $$("[data-seg-group]", stage).forEach((g) => g.addEventListener("click", (e) => {
      const b = e.target.closest("button[data-v]"); if (!b) return;
      $$("button", g).forEach((x) => x.setAttribute("aria-pressed", String(x === b)));
      if (g.dataset.segGroup === "channel") channel = b.dataset.v; else metric = b.dataset.v;
      draw();
    }));
    draw();

    hbars($("[data-frequency] .hbars"), D.frequency.map((f) => ({ label: f.touch_band + (f.touch_band === "1" ? " contact" : " contacts"), value: f.conversion_rate, text: pct(f.conversion_rate) })));
    hbars($("[data-previous] .hbars"), [...D.previous].sort((a, b) => b.conversion_rate - a.conversion_rate).map((p) => ({ label: p.poutcome === "unknown" ? "No earlier campaign" : cap(p.poutcome), value: p.conversion_rate, text: pct(p.conversion_rate), cls: p.poutcome === "success" ? "" : "is-dim" })), 1);
    const ch = group(D.rows, "contact", ["observations", "subscriptions"]).map((c) => ({ ...c, rate: c.subscriptions / c.observations })).sort((a, b) => b.rate - a.rate);
    hbars($("[data-channels] .hbars"), ch.map((c) => ({ label: c.key === "unknown" ? "Not recorded" : cap(c.key), value: c.rate, text: pct(c.rate) + " · " + num(c.observations) })));
  }
})();
