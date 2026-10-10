(() => {
  "use strict";
  const section = document.getElementById("despedida");
  const cover = document.getElementById("cover");
  if (!section || !cover) return;
  const content = window.invitationFarewell || {};
  const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const message = section.querySelector(".farewell-copy");
  section.querySelectorAll("[data-farewell-copy]").forEach((element) => {
    const value = content[element.dataset.farewellCopy];
    if (typeof value === "string") element.textContent = value;
  });

  let observer;
  function syncVisibility() {
    section.hidden = cover.hidden;
    if (section.hidden) return;
    if (motion.matches || !("IntersectionObserver" in window)) {
      message.classList.add("farewell-revealed");
      return;
    }
    section.classList.add("farewell-motion-ready");
    observer ??= new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        message.classList.add("farewell-revealed");
        observer.disconnect();
      }
    }, { threshold: .16 });
    observer.observe(message);
  }
  new MutationObserver(syncVisibility).observe(cover, { attributes: true, attributeFilter: ["hidden"] });
  syncVisibility();
  motion.addEventListener("change", () => {
    if (motion.matches) {
      observer?.disconnect();
      message.classList.add("farewell-revealed");
    }
  });
})();
