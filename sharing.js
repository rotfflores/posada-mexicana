(() => {
  "use strict";
  const section = document.getElementById("para-compartir");
  if (!section) return;
  const config = window.invitationSharing || {};
  const cover = document.getElementById("cover");
  const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const paper = section.querySelector(".share-paper-wrap");
  const lights = section.querySelector(".share-lights");
  section.querySelectorAll("[data-sharing-copy]").forEach((element) => {
    const value = config[element.dataset.sharingCopy];
    if (typeof value === "string") element.textContent = value;
  });
  section.querySelectorAll("[data-sharing-item]").forEach((element) => {
    const item = config.items?.find((item) => item.id === element.dataset.sharingItem);
    if (!item) return;
    element.hidden = item.visible === false;
    element.querySelectorAll("[data-sharing-item-copy]").forEach((copy) => {
      const value = item[copy.dataset.sharingItemCopy];
      if (typeof value === "string") copy.textContent = value;
    });
  });
  const note = section.querySelector(".share-host-note");
  if (typeof config.hostNote?.text === "string") note.textContent = config.hostNote.text;
  note.hidden = config.hostNote?.enabled === false || !note.textContent.trim();
  const exchange = section.querySelector(".share-exchange");
  exchange.hidden = config.exchange?.enabled !== true;
  exchange.querySelectorAll("[data-exchange-copy]").forEach((element) => {
    const value = config.exchange?.[element.dataset.exchangeCopy];
    if (typeof value === "string") element.textContent = value;
  });
  let observer;
  function observe() {
    observer?.disconnect();
    section.classList.remove("share-motion-ready", "share-lights-active");
    if (section.hidden) return;
    if (motion.matches || !("IntersectionObserver" in window)) {
      paper.classList.add("share-revealed");
      return;
    }
    section.classList.add("share-motion-ready");
    observer = new IntersectionObserver((entries) => {
      entries.forEach(({ target, isIntersecting }) => {
        if (target === lights) {
          section.classList.toggle("share-lights-active", isIntersecting);
        } else if (isIntersecting) paper.classList.add("share-revealed");
      });
    }, { threshold: .08 });
    observer.observe(paper);
    observer.observe(lights);
  }
  function syncVisibility() {
    section.hidden = config.enabled === false || cover.hidden;
    observe();
  }
  new MutationObserver(syncVisibility).observe(cover, { attributes: true, attributeFilter: ["hidden"] });
  motion.addEventListener("change", observe);
  syncVisibility();
})();
