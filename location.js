(() => {
  "use strict";
  const section = document.getElementById("ubicacion");
  const config = window.invitationLocation || {};
  const cover = document.getElementById("cover");
  const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const link = document.getElementById("location-map-link");
  const disabledButton = document.getElementById("location-map-pending");
  const status = document.getElementById("location-map-status");

  section.querySelectorAll("[data-location-copy]").forEach((element) => {
    const text = config[element.dataset.locationCopy];
    if (typeof text === "string") element.textContent = text;
  });
  const reference = document.getElementById("location-reference");
  reference.hidden = !config.reference?.trim();

  // Solo se usa el enlace proporcionado; no se deduce una dirección del texto.
  function validMapsUrl(value) {
    if (typeof value !== "string" || !value.trim()) return null;
    try {
      const url = new URL(value);
      if (url.protocol !== "https:" || url.username || url.password) return null;
      const directHosts = ["maps.google.com", "maps.google.com.mx", "maps.app.goo.gl"];
      const webHosts = ["google.com", "www.google.com", "google.com.mx", "www.google.com.mx"];
      if (directHosts.includes(url.hostname)) return url.href;
      if (webHosts.includes(url.hostname) && (url.pathname === "/maps" || url.pathname.startsWith("/maps/"))) return url.href;
      if (url.hostname === "goo.gl" && url.pathname.startsWith("/maps/")) return url.href;
    } catch { /* Sin un enlace real válido, se mantiene el estado por confirmar. */ }
    return null;
  }

  const mapsUrl = validMapsUrl(config.mapsUrl);
  if (mapsUrl) {
    link.href = mapsUrl;
    link.hidden = false;
    disabledButton.hidden = true;
    status.hidden = true;
  }

  let observer = null;
  let revealStarted = false;
  function startReveal() {
    if (revealStarted || section.hidden) return;
    revealStarted = true;
    if (motion.matches || !("IntersectionObserver" in window)) {
      section.classList.add("is-viewed");
      return;
    }
    section.classList.add("loc-motion-ready");
    observer = new IntersectionObserver((entries) => {
      const visible = entries[0].isIntersecting;
      section.classList.toggle("is-active", visible);
      if (visible) section.classList.add("is-viewed");
    }, { threshold: .1 });
    observer.observe(section);
  }

  // Observa la apertura existente sin cambiar la entrada ni la portada.
  function syncVisibility() {
    section.hidden = cover.hidden;
    if (!section.hidden) startReveal();
  }
  new MutationObserver(syncVisibility).observe(cover, { attributes: true, attributeFilter: ["hidden"] });
  syncVisibility();

  motion.addEventListener("change", () => {
    if (motion.matches) {
      observer?.disconnect();
      section.classList.remove("loc-motion-ready", "is-active");
      section.classList.add("is-viewed");
    }
  });
})();
