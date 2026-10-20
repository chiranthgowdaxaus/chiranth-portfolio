"use strict";

// These small, local previews never submit, store or sync visitor data.
document.querySelectorAll("[data-paidly-preview]").forEach((preview) => {
  const rows = [...preview.querySelectorAll("[data-preview-bill]")];
  const filters = [...preview.querySelectorAll("[data-bill-filter]")];
  const search = preview.querySelector("[data-bill-search]");
  const status = preview.querySelector("[data-bill-status]");
  const paid = new Set();
  let filter = "upcoming";

  function render() {
    const query = search.value.trim().toLowerCase();
    let visibleCount = 0;
    let upcomingTotal = 0;
    let paidTotal = 0;
    rows.forEach((row) => {
      const isPaid = paid.has(row.dataset.previewBill);
      const amount = Number(row.dataset.billAmount);
      if (isPaid) paidTotal += amount;
      else upcomingTotal += amount;
      row.hidden = isPaid !== (filter === "paid") || !row.dataset.billName.toLowerCase().includes(query);
      if (!row.hidden) visibleCount += 1;
      const button = row.querySelector("[data-record-payment]");
      button.disabled = false;
      button.textContent = isPaid ? "Undo payment" : "Mark paid";
      button.setAttribute("aria-label", isPaid
        ? `Undo ${row.dataset.billName} payment in the preview`
        : `Mark ${row.dataset.billName} paid in the preview`);
    });
    preview.querySelector("[data-bill-total]").textContent = `A$${upcomingTotal}`;
    preview.querySelector("[data-paid-total]").textContent = `A$${paidTotal}`;
    preview.querySelector("[data-bill-count]").textContent = filter === "paid"
      ? `${visibleCount} recorded payment${visibleCount === 1 ? "" : "s"}`
      : `${visibleCount} upcoming bill${visibleCount === 1 ? "" : "s"}`;
    const empty = preview.querySelector("[data-bill-empty]");
    empty.hidden = visibleCount !== 0;
    empty.textContent = query ? "No bills match your search." : filter === "paid" ? "No payments recorded in this preview yet." : "All sample bills are paid.";
    filters.forEach((button) => {
      button.disabled = false;
      button.setAttribute("aria-pressed", String(button.dataset.billFilter === filter));
    });
  }

  filters.forEach((button) => button.addEventListener("click", () => {
    filter = button.dataset.billFilter;
    render();
  }));
  search.addEventListener("input", render);
  rows.forEach((row) => row.querySelector("[data-record-payment]").addEventListener("click", () => {
    const id = row.dataset.previewBill;
    const wasPaid = paid.has(id);
    if (wasPaid) paid.delete(id);
    else paid.add(id);
    render();
    status.textContent = `${row.dataset.billName} ${wasPaid ? "moved back to upcoming" : "marked paid"}. Sample data only; no real payment.`;
    const next = rows.find((item) => !item.hidden)?.querySelector("[data-record-payment]")
      || filters.find((button) => button.dataset.billFilter === filter);
    next.focus({ preventScroll: true });
  }));
  const reset = preview.querySelector("[data-bill-reset]");
  reset.disabled = false;
  reset.addEventListener("click", () => {
    paid.clear();
    search.value = "";
    filter = "upcoming";
    render();
    status.textContent = "Preview reset. Sample data only. No real payments.";
  });
  render();
});

document.querySelectorAll("[data-workout-preview]").forEach((preview) => {
  const start = preview.querySelector("[data-start-workout]");
  const exercises = preview.querySelector("[data-workout-exercises]");
  const checks = [...preview.querySelectorAll("[data-exercise]")];
  const finish = preview.querySelector("[data-finish-workout]");
  const reset = preview.querySelector("[data-workout-reset]");
  const status = preview.querySelector("[data-workout-status]");
  const progress = preview.querySelector("[data-workout-progress]");
  start.disabled = false;
  reset.disabled = false;

  function updateProgress() {
    const count = checks.filter((check) => check.checked).length;
    progress.value = count;
    preview.querySelector("[data-workout-count]").textContent = `${count} of ${checks.length} complete`;
    finish.disabled = count !== checks.length;
  }

  start.addEventListener("click", () => {
    exercises.hidden = false;
    checks.forEach((check) => { check.disabled = false; });
    start.textContent = "Workout started";
    start.disabled = true;
    status.textContent = "Sample session started. Tick an exercise to try the progress flow.";
    checks[0].focus({ preventScroll: true });
  });
  checks.forEach((check) => check.addEventListener("change", updateProgress));
  finish.addEventListener("click", () => {
    checks.forEach((check) => { check.disabled = true; });
    finish.disabled = true;
    finish.textContent = "Session complete";
    status.textContent = "Sample session complete. Nothing was saved or synced.";
    reset.focus({ preventScroll: true });
  });
  reset.addEventListener("click", () => {
    checks.forEach((check) => { check.checked = false; check.disabled = true; });
    updateProgress();
    exercises.hidden = true;
    start.disabled = false;
    start.replaceChildren(document.createTextNode("Start workout "));
    const arrow = document.createElement("span");
    arrow.setAttribute("aria-hidden", "true");
    arrow.textContent = "↗";
    start.append(arrow);
    finish.textContent = "Finish preview session";
    status.textContent = "Preview reset. Local sample workout only.";
  });
});
