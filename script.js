(() => {
  "use strict";
  const content = window.invitationContent || {};
  document.querySelectorAll("[data-copy]").forEach((element) => {
    const value = content[element.dataset.copy];
    if (typeof value === "string") element.textContent = value;
  });
  if (content.familyName) document.title = `Una posada en casa · ${content.familyName}`;

  const entrance = document.getElementById("entrance");
  const cover = document.getElementById("cover");
  const button = document.getElementById("open-invitation");
  const confetti = document.getElementById("confetti");
  const detailsLink = document.getElementById("details-link");
  const details = document.getElementById("detalles");
  const motionPreference = window.matchMedia("(prefers-reduced-motion: reduce)");
  const pinataArt = button.querySelector(".pinata-art");
  // Copia la ilustración para animar sus mitades por separado.
  pinataArt.replaceChildren(...Array.from(document.getElementById("pinata").childNodes, (node) => node.cloneNode(true)));
  let opening = false;
  const runningAnimations = new Set();
  const timers = new Set();
  let countdownTimer = null;
  let lastCountdownPhase = null;
  let revealObserver = null;
  let welcomeRevealStarted = false;

  const event = window.invitationEvent;
  const countdownElement = document.getElementById("countdown");
  const countdownMessage = document.getElementById("countdown-message");
  const countdownHeading = document.getElementById("countdown-heading");
  const countdownFields = ["days", "hours", "minutes", "seconds"].map((unit) => ({
    unit, element: document.getElementById(`countdown-${unit}`),
  }));
  const eventDisplay = window.PosadaCountdown.getEventDisplay(event);
  ["weekday", "day", "month", "year", "hour"].forEach((part) => {
    document.getElementById(`event-${part}`).textContent = eventDisplay[part === "hour" ? "time" : part];
  });
  document.getElementById("event-time").dateTime = event.startsAt;
  document.getElementById("event-time").setAttribute("aria-label", `${eventDisplay.weekday}, ${eventDisplay.day} de ${eventDisplay.month} de ${eventDisplay.year}, ${eventDisplay.time}, hora de Ciudad de México`);
  document.getElementById("event-date").hidden = false;

  // Sin destino, el indicador es informativo y no entra en el orden de teclado.
  if (typeof content.detailsTarget === "string" && content.detailsTarget.startsWith("#") && content.detailsTarget.length > 1) {
    detailsLink.href = content.detailsTarget;
    detailsLink.removeAttribute("aria-disabled");
  }
  detailsLink.addEventListener("click", (click) => {
    if (click.ctrlKey || click.metaKey || click.shiftKey || click.altKey) return;
    const target = document.getElementById(detailsLink.getAttribute("href")?.slice(1));
    if (!target) return;
    click.preventDefault();
    target.scrollIntoView({ behavior: motionPreference.matches ? "auto" : "smooth", block: "start" });
    target.querySelector("h2")?.focus({ preventScroll: true });
  });

  function updateCountdown() {
    window.clearTimeout(countdownTimer);
    countdownTimer = null;
    const state = window.PosadaCountdown.getCountdownState(event);
    if (state.phase === "countdown") {
      countdownFields.forEach(({ unit, element }) => {
        const text = String(state[unit]).padStart(2, "0");
        if (element.textContent !== text) element.textContent = text;
      });
    }
    if (state.phase !== lastCountdownPhase) {
      countdownElement.hidden = state.phase !== "countdown";
      countdownHeading.hidden = state.phase !== "countdown";
      countdownMessage.hidden = state.phase === "countdown";
      countdownMessage.textContent = state.phase === "celebration"
        ? content.celebrationMessage
        : state.phase === "finished" ? content.farewellMessage : "";
      lastCountdownPhase = state.phase;
    }
    // Recalcula contra el reloj real; no acumula retrasos entre actualizaciones.
    if (!document.hidden && state.phase !== "finished" && !details.hidden) {
      countdownTimer = window.setTimeout(updateCountdown, 1010 - (Date.now() % 1000));
    }
  }

  function startWelcomeReveal() {
    if (welcomeRevealStarted) return;
    welcomeRevealStarted = true;
    if (motionPreference.matches || !("IntersectionObserver" in window)) return;
    const blocks = details.querySelectorAll(".section-reveal");
    revealObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.remove("reveal-pending");
        revealObserver.unobserve(entry.target);
      });
    }, { threshold: .15 });
    blocks.forEach((block) => {
      block.classList.add("reveal-pending");
      revealObserver.observe(block);
    });
  }

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      window.clearTimeout(countdownTimer);
      countdownTimer = null;
    } else if (!details.hidden) updateCountdown();
  });

  function later(callback, delay) {
    const timer = window.setTimeout(() => { timers.delete(timer); callback(); }, delay);
    timers.add(timer);
  }

  function showCover() {
    timers.forEach(window.clearTimeout);
    timers.clear();
    runningAnimations.forEach((animation) => animation.cancel());
    runningAnimations.clear();
    confetti.replaceChildren();
    entrance.hidden = true;
    cover.hidden = false;
    details.hidden = false;
    cover.classList.add("is-visible");
    updateCountdown();
    startWelcomeReveal();
    document.getElementById("cover-title").focus({ preventScroll: true });
    document.getElementById("announcement").textContent = "Invitación abierta.";
  }

  function burstPaper() {
    if (!Element.prototype.animate || motionPreference.matches) return;
    pinataArt.querySelectorAll(".pinata-half").forEach((half, index) => {
      const direction = index === 0 ? -1 : 1;
      half.style.transformBox = "fill-box";
      half.style.transformOrigin = "center";
      const animation = half.animate([
        { transform: "translate(0, 0) rotate(0)", opacity: 1 },
        { transform: `translate(${direction * 28}px, 10px) rotate(${direction * 12}deg)`, opacity: .9, offset: .5 },
        { transform: `translate(${direction * 60}px, 38px) rotate(${direction * 23}deg)`, opacity: 0 },
      ], { duration: 570, easing: "ease-out", fill: "both" });
      runningAnimations.add(animation);
    });
    const colors = ["#C83B32", "#235C45", "#E8AC45", "#DB8461", "#F3D08D"];
    for (let i = 0; i < 30; i += 1) {
      const piece = document.createElement("span");
      piece.className = "confetti-piece";
      piece.style.setProperty("--piece-color", colors[i % colors.length]);
      piece.style.width = `${5 + Math.random() * 5}px`;
      piece.style.height = `${7 + Math.random() * 8}px`;
      confetti.append(piece);
      const angle = Math.random() * Math.PI * 2;
      const distance = 55 + Math.random() * 110;
      const x = Math.cos(angle) * distance;
      const y = Math.sin(angle) * distance;
      const rotation = Math.random() * 400 - 200;
      const animation = piece.animate([
        { opacity: 0, transform: "translate(0, 0) rotate(0)" },
        { opacity: 1, transform: `translate(${x * .55}px, ${y * .6 - 20}px) rotate(${rotation * .5}deg)`, offset: .25 },
        { opacity: 0, transform: `translate(${x}px, ${y + 115}px) rotate(${rotation}deg)` },
      ], { duration: 850 + Math.random() * 200, easing: "cubic-bezier(.15,.6,.5,1)", fill: "both" });
      runningAnimations.add(animation);
      animation.onfinish = () => { runningAnimations.delete(animation); piece.remove(); };
    }
  }

  button.addEventListener("click", () => {
    if (opening) return;
    opening = true;
    button.disabled = true;
    if (motionPreference.matches) { showCover(); return; }
    entrance.classList.add("is-opening");
    later(burstPaper, 190);
    later(() => entrance.classList.add("is-leaving"), 710);
    later(showCover, 1210);
  });

  motionPreference.addEventListener("change", () => {
    if (motionPreference.matches && opening && !entrance.hidden) showCover();
    if (motionPreference.matches) {
      revealObserver?.disconnect();
      details.querySelectorAll(".reveal-pending").forEach((block) => block.classList.remove("reveal-pending"));
    }
  });
})();
