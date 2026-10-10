// Música de fondo: intenta sonar al abrir la página y, si el navegador lo bloquea, empieza con el primer toque.
(() => {
  "use strict";
  const config = { src: "assets/musica-navidad.mp3", volume: 0.5, fadeMs: 1800 };
  const button = document.getElementById("music-toggle");
  if (!button || typeof Audio !== "function") return;
  const label = button.querySelector(".music-label");
  const audio = new Audio(config.src);
  audio.loop = true;
  audio.preload = "auto";
  audio.volume = 0;
  let muted = false;
  try { muted = localStorage.getItem("posada-music") === "off"; } catch {}
  let fadeFrame = 0;

  function render() {
    const playing = !audio.paused && !muted;
    button.classList.toggle("is-playing", playing);
    button.setAttribute("aria-pressed", String(playing));
    label.textContent = playing ? "Pausar música" : "Reproducir música";
  }
  function fadeIn() {
    cancelAnimationFrame(fadeFrame);
    const start = performance.now();
    const step = (now) => {
      const progress = Math.min(1, Math.max(0, (now - start) / config.fadeMs));
      audio.volume = config.volume * progress;
      if (progress < 1) fadeFrame = requestAnimationFrame(step);
    };
    fadeFrame = requestAnimationFrame(step);
  }
  function play() {
    if (muted || !audio.paused) return Promise.resolve();
    return audio.play().then(() => { fadeIn(); render(); removeUnlock(); }, () => render());
  }
  // El primer gesto del invitado (por ejemplo, tocar la piñata) desbloquea el audio.
  const unlockEvents = ["pointerdown", "keydown", "touchstart"];
  function unlock(event) { if (event.target.closest?.("#music-toggle")) return; play(); }
  function removeUnlock() { unlockEvents.forEach((type) => document.removeEventListener(type, unlock, true)); }
  unlockEvents.forEach((type) => document.addEventListener(type, unlock, { capture: true, passive: true }));

  button.addEventListener("click", () => {
    muted = !audio.paused;
    try { localStorage.setItem("posada-music", muted ? "off" : "on"); } catch {}
    if (muted) { audio.pause(); render(); } else { play(); }
  });
  // Se pausa al cambiar de pestaña y continúa al volver.
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) { if (!audio.paused) { audio.pause(); render(); } }
    else play();
  });
  button.hidden = false;
  render();
  play();
})();
