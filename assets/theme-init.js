"use strict";
// Apply the saved appearance before the first paint. Content does not depend on it.
document.documentElement.classList.add("js");
try {
  const savedTheme = localStorage.getItem("portfolio-theme");
  if (savedTheme === "light" || savedTheme === "dark") document.documentElement.dataset.theme = savedTheme;
} catch { /* Storage can be unavailable in private browsing. */ }
