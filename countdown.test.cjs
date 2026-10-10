const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");
const { getCountdownState, getEventDisplay } = require("./countdown.js");
const context = { window: {} };
vm.runInNewContext(fs.readFileSync("./content.js", "utf8"), context);
const event = context.window.invitationEvent;
const start = Date.parse(event.startsAt);

test("descompone el tiempo restante sin depender de la zona del dispositivo", () => {
  assert.deepEqual(getCountdownState(event, start - (86400 + 2 * 3600 + 3 * 60 + 4) * 1000), {
    phase: "countdown", days: 1, hours: 2, minutes: 3, seconds: 4,
  });
});

test("no celebra antes de la hora ni muestra segundos negativos", () => {
  assert.deepEqual(getCountdownState(event, start - 1), {
    phase: "countdown", days: 0, hours: 0, minutes: 0, seconds: 1,
  });
  assert.equal(getCountdownState(event, start).phase, "celebration");
});

test("celebra durante el resto del día en CDMX aunque ya cambió el día en UTC", () => {
  assert.equal(getCountdownState(event, start + (4 * 3600 + 59 * 60 + 59) * 1000).phase, "celebration");
});

test("agradece exactamente a la medianoche siguiente en CDMX y en días posteriores", () => {
  assert.equal(getCountdownState(event, start + 5 * 3600 * 1000).phase, "finished");
  assert.equal(getCountdownState(event, start + 3 * 86400 * 1000).phase, "finished");
});

test("la fecha y la hora visibles se generan desde el mismo dato del contador", () => {
  assert.deepEqual(getEventDisplay(event), {
    weekday: "Sábado", day: "19", month: "diciembre", year: "2026", time: "7:00 p. m.",
  });
});

test("personalizar startsAt actualiza el calendario, la hora y los límites del evento", () => {
  const example = { startsAt: "2027-01-03T08:30:00-06:00", timeZone: event.timeZone };
  const exampleStart = Date.parse(example.startsAt);
  assert.deepEqual(getEventDisplay(example), {
    weekday: "Domingo", day: "3", month: "enero", year: "2027", time: "8:30 a. m.",
  });
  assert.equal(getCountdownState(example, exampleStart).phase, "celebration");
  assert.equal(getCountdownState(example, exampleStart + 15.5 * 3600 * 1000).phase, "finished");
});
