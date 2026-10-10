(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  else root.PosadaRsvp = api;
})(typeof window !== "undefined" ? window : globalThis, function () {
  "use strict";
  const clean = (value) => String(value ?? "").replace(/\r\n?/g, "\n").trim();
  function normalizePhone(value) {
    const raw = clean(value);
    if (!/^\+?[\d\s().-]+$/.test(raw)) return null;
    const digits = raw.replace(/\D/g, "");
    return /^[1-9]\d{7,14}$/.test(digits) ? digits : null;
  }
  function validateResponse(input) {
    const errors = {};
    if (!clean(input.name)) errors.name = "Escribe tu nombre para que sepamos quién responde.";
    if (!["yes", "no"].includes(input.attendance)) errors.attendance = "Selecciona si podrás acompañarnos.";
    if (input.attendance === "yes") {
      const total = Number(clean(input.guests));
      if (!clean(input.guests) || !Number.isSafeInteger(total) || total < 1) {
        errors.guests = "Indica un número entero de asistentes, mínimo 1, incluyéndote.";
      }
    }
    return errors;
  }
  function buildMessage(eventName, input, sharingEnabled = true) {
    if (Object.keys(validateResponse(input)).length) throw new Error("Completa los campos obligatorios antes de preparar la respuesta.");
    const lines = [clean(eventName), `Invitado: ${clean(input.name)}`, `Asistencia: ${input.attendance === "yes" ? "¡Sí, ahí estaré!" : "Esta vez no podré"}`];
    if (input.attendance === "yes") {
      lines.push(`Total de asistentes (incluyéndome): ${Number(input.guests)}`);
      if (sharingEnabled && clean(input.contribution)) lines.push(`Para compartir: ${clean(input.contribution)}`);
    }
    if (clean(input.message)) lines.push(`Mensaje para la familia: ${clean(input.message)}`);
    return lines.join("\n");
  }
  function buildWhatsAppUrl(phone, message) {
    const digits = normalizePhone(phone);
    return digits ? `https://wa.me/${digits}?text=${encodeURIComponent(message)}` : null;
  }
  return { normalizePhone, validateResponse, buildMessage, buildWhatsAppUrl };
});
