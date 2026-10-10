(() => {
  "use strict";
  const section = document.getElementById("confirmacion");
  if (!section || !window.PosadaRsvp) return;
  const config = window.invitationRsvp || {};
  const api = window.PosadaRsvp;
  const form = section.querySelector("form");
  const cover = document.getElementById("cover");
  const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const card = section.querySelector(".rsvp-paper-wrap");
  const name = document.getElementById("rsvp-name");
  const guests = document.getElementById("rsvp-guests");
  const contribution = document.getElementById("rsvp-contribution");
  const message = document.getElementById("rsvp-message");
  const yes = document.getElementById("rsvp-yes");
  const no = document.getElementById("rsvp-no");
  const attendanceGroup = document.getElementById("rsvp-attendance");
  const submit = document.getElementById("rsvp-submit");
  const pending = document.getElementById("rsvp-pending");
  const summary = document.getElementById("rsvp-validation-status");
  const status = document.getElementById("rsvp-status");
  const gate = document.getElementById("rsvp-gate");
  const accept = document.getElementById("rsvp-accept");
  const panel = document.getElementById("rsvp-panel");
  const done = document.getElementById("rsvp-done");
  const doneTitle = document.getElementById("rsvp-done-title");
  const edit = document.getElementById("rsvp-edit");
  const sharingEnabled = Boolean(document.getElementById("para-compartir")) && window.invitationSharing?.enabled !== false;
  const phone = api.normalizePhone(config.hostPhone);
  section.querySelectorAll("[data-rsvp-copy]").forEach((element) => {
    const value = config[element.dataset.rsvpCopy];
    if (typeof value === "string") element.textContent = value;
  });
  const deadline = document.getElementById("rsvp-deadline");
  deadline.hidden = !config.deadline?.trim();
  if (!deadline.hidden) deadline.textContent = `${config.deadlinePrefix || "Confirma antes del"} ${config.deadline.trim()}`;
  submit.disabled = !phone;
  pending.hidden = Boolean(phone);
  const errorFields = { name, attendance: attendanceGroup, guests };
  function error(key, text = "") {
    const element = document.getElementById(`rsvp-${key}-error`);
    element.textContent = text;
    element.hidden = !text;
    errorFields[key].setAttribute("aria-invalid", String(Boolean(text)));
    if (key === "attendance") {
      [yes, no].forEach((radio) => radio.setAttribute("aria-invalid", String(Boolean(text))));
    }
  }
  function syncFields() {
    const attending = yes.checked;
    document.getElementById("rsvp-guests-field").hidden = !attending;
    guests.disabled = !attending;
    guests.required = attending;
    document.getElementById("rsvp-contribution-field").hidden = !attending || !sharingEnabled;
    contribution.disabled = !attending || !sharingEnabled;
    if (!attending) error("guests");
  }
  [yes, no].forEach((radio) => radio.addEventListener("change", () => {
    error("attendance");
    summary.textContent = "";
    status.textContent = "";
    syncFields();
  }));
  name.addEventListener("input", () => { if (name.value.trim()) error("name"); });
  guests.addEventListener("input", () => {
    if (!api.validateResponse({ name: name.value, attendance: "yes", guests: guests.value }).guests) error("guests");
  });
  // El formulario permanece cerrado hasta aceptar la invitación y se cierra al preparar el envío.
  function setPanel(open) {
    panel.classList.toggle("is-open", open);
    panel.inert = !open;
    panel.setAttribute("aria-hidden", String(!open));
    accept.setAttribute("aria-expanded", String(open));
  }
  function openForm() {
    gate.hidden = true;
    done.hidden = true;
    setPanel(true);
    name.focus({ preventScroll: true });
  }
  function closeForm(attending) {
    setPanel(false);
    doneTitle.textContent = attending ? (config.thanksYesTitle || "¡Gracias, te esperamos!") : (config.thanksNoTitle || "Gracias por avisarnos");
    document.getElementById("rsvp-done-text").textContent = config.thanksText || "Tu respuesta ya está lista en WhatsApp. Solo falta que la envíes. Si no se abrió, toca “Cambiar mi respuesta” y vuelve a enviarla.";
    done.hidden = false;
    doneTitle.focus({ preventScroll: true });
    done.scrollIntoView?.({ block: "center", behavior: motion.matches ? "auto" : "smooth" });
  }
  section.classList.add("rsvp-gated");
  gate.hidden = false;
  setPanel(false);
  accept.addEventListener("click", () => {
    if (!no.checked) { yes.checked = true; syncFields(); }
    openForm();
  });
  edit.addEventListener("click", openForm);
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    status.textContent = "";
    // También bloquea un envío disparado con Enter o desde un script sin número real.
    if (!phone) {
      status.textContent = config.pendingLabel || "Confirmación disponible próximamente";
      return;
    }
    const response = { name: name.value, attendance: yes.checked ? "yes" : no.checked ? "no" : "", guests: guests.value, contribution: contribution.value, message: message.value };
    const errors = api.validateResponse(response);
    Object.keys(errorFields).forEach((key) => error(key, errors[key]));
    if (Object.keys(errors).length) {
      summary.textContent = "Revisa los campos señalados. Tu información se conserva.";
      ({ name, attendance: yes, guests })[Object.keys(errors)[0]].focus();
      return;
    }
    summary.textContent = "";
    const text = api.buildMessage(config.eventName || "Posada mexicana familiar", response, sharingEnabled);
    const url = api.buildWhatsAppUrl(phone, text);
    // Solo abre el borrador al enviar el formulario; WhatsApp requiere el envío manual.
    window.open(url, "_blank", "noopener,noreferrer");
    status.textContent = "Respuesta preparada. Envíala desde WhatsApp cuando estés listo. Si no se abre, permite la nueva pestaña y vuelve a pulsar el botón.";
    closeForm(response.attendance === "yes");
  });
  syncFields();
  let observer;
  function reveal() {
    observer?.disconnect();
    section.classList.remove("rsvp-motion-ready");
    if (section.hidden) return;
    if (motion.matches || !("IntersectionObserver" in window)) { card.classList.add("rsvp-revealed"); return; }
    section.classList.add("rsvp-motion-ready");
    observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) { card.classList.add("rsvp-revealed"); observer.disconnect(); }
    }, { threshold: .08 });
    observer.observe(card);
  }
  function syncVisibility() { section.hidden = cover.hidden; reveal(); }
  new MutationObserver(syncVisibility).observe(cover, { attributes: true, attributeFilter: ["hidden"] });
  motion.addEventListener("change", reveal);
  syncVisibility();
})();
