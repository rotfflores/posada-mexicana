(() => {
  "use strict";
  const section = document.getElementById("momentos");
  if (!section) return;
  const config = window.invitationActivities || {};
  const cover = document.getElementById("cover");
  const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
  section.querySelectorAll("[data-activities-copy]").forEach((element) => {
    const value = config[element.dataset.activitiesCopy];
    if (typeof value === "string") element.textContent = value;
  });
  const stamps = [...section.querySelectorAll("[data-moment]")];
  stamps.forEach((stamp) => {
    const moment = config.moments?.find((item) => item.id === stamp.dataset.moment);
    if (!moment) return;
    stamp.hidden = moment.visible === false;
    stamp.querySelectorAll("[data-moment-copy]").forEach((element) => {
      const value = moment[element.dataset.momentCopy];
      if (typeof value === "string") element.textContent = value;
    });
  });
  // La disposición se ajusta también cuando se ocultan momentos intermedios.
  stamps.filter((stamp) => !stamp.hidden).forEach((stamp, index) => {
    stamp.classList.toggle("act-alternate", index % 2 === 1);
  });
  let observer;
  function observe() {
    observer?.disconnect();
    section.classList.remove("act-motion-ready", "act-lights-active");
    stamps.forEach((stamp) => stamp.classList.remove("act-art-active"));
    if (section.hidden) return;
    if (motion.matches || !("IntersectionObserver" in window)) {
      stamps.forEach((stamp) => stamp.classList.add("act-revealed"));
      return;
    }
    section.classList.add("act-motion-ready");
    // Solo se animan las ilustraciones y luces que están en pantalla.
    observer = new IntersectionObserver((entries) => {
      entries.forEach(({ target, isIntersecting }) => {
        if (target.classList.contains("act-light-canopy")) {
          section.classList.toggle("act-lights-active", isIntersecting);
        } else {
          target.classList.toggle("act-art-active", isIntersecting);
          if (isIntersecting) target.classList.add("act-revealed");
        }
      });
    }, { threshold: .12 });
    observer.observe(section.querySelector(".act-light-canopy"));
    stamps.filter((stamp) => !stamp.hidden).forEach((stamp) => observer.observe(stamp));
  }
  function syncVisibility() {
    section.hidden = cover.hidden;
    observe();
  }
  new MutationObserver(syncVisibility).observe(cover, { attributes: true, attributeFilter: ["hidden"] });
  motion.addEventListener("change", observe);
  syncVisibility();
})();
