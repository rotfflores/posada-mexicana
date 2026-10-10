(() => {
  "use strict";
  const svgNS = "http://www.w3.org/2000/svg";
  const colors = ["#FF9685", "#9FE3A4", "#FFD175", "#98CBFA"];
  const delays = ["0s", "-2.4s", "-1.6s", "-0.8s"];
  const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const garlands = [...document.querySelectorAll("svg.lights, .loc-lights, .act-light-canopy, .act-closing-lights, .share-lights, .rsvp-lights, .farewell-canopy")];
  const visible = new Map();
  function shape(tag, attributes) {
    const element = document.createElementNS(svgNS, tag);
    Object.entries(attributes).forEach(([key, value]) => element.setAttribute(key, value));
    return element;
  }
  garlands.forEach((garland) => {
    const bulbs = [...garland.querySelectorAll(".light > ellipse, .loc-bulb, .act-bulb-core, .share-light-core, .rsvp-bulb, .farewell-bulb")];
    garland.classList.add("lights-unified");
    bulbs.forEach((oldBulb, index) => {
      const x = Number(oldBulb.getAttribute("cx")), y = Number(oldBulb.getAttribute("cy"));
      const parent = oldBulb.parentElement;
      // Retira el halo y el brillo anteriores, conservando el cable y sus ramales.
      if (parent.tagName.toLowerCase() === "g") {
        [...parent.children].filter((child) => child !== oldBulb && ["circle", "ellipse"].includes(child.tagName.toLowerCase())).forEach((child) => child.remove());
      }
      const lamp = shape("g", { class: "fiesta-lamp", "aria-hidden": "true" });
      lamp.style.setProperty("--fiesta-color", colors[index % colors.length]);
      lamp.style.setProperty("--fiesta-delay", delays[index % delays.length]);
      lamp.append(
        shape("circle", { class: "fiesta-lamp-halo", cx: x, cy: y, r: 20 }),
        shape("rect", { class: "fiesta-lamp-cap", x: x - 2.1, y: y - 7.5, width: 4.2, height: 3.5, rx: .6 }),
        shape("ellipse", { class: "fiesta-lamp-body", cx: x, cy: y, rx: 3.8, ry: 5.8 }),
        shape("ellipse", { class: "fiesta-lamp-highlight", cx: x - .6, cy: y - 1, rx: 1.2, ry: 2.4 })
      );
      oldBulb.replaceWith(lamp);
    });
  });
  function syncMotion() {
    garlands.forEach((garland) => garland.classList.toggle("fiesta-lights-running", !motion.matches && visible.get(garland)));
  }
  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(({ target, isIntersecting }) => visible.set(target, isIntersecting));
      syncMotion();
    }, { threshold: .08 });
    garlands.forEach((garland) => observer.observe(garland));
  } else {
    garlands.forEach((garland) => visible.set(garland, true));
    syncMotion();
  }
  motion.addEventListener("change", syncMotion);
})();
