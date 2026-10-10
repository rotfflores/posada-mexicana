/* Cálculo independiente del reloj y la zona horaria del dispositivo. */
((root) => {
  "use strict";

  function localDay(timestamp, timeZone) {
    const parts = new Intl.DateTimeFormat("en-US", {
      timeZone, year: "numeric", month: "2-digit", day: "2-digit",
    }).formatToParts(new Date(timestamp));
    const value = (type) => parts.find((part) => part.type === type).value;
    return `${value("year")}-${value("month")}-${value("day")}`;
  }

  function getCountdownState(event, now = Date.now()) {
    const start = Date.parse(event.startsAt);
    if (!Number.isFinite(start)) throw new Error("La fecha de la posada no es válida.");
    if (now >= start) {
      return { phase: localDay(now, event.timeZone) === localDay(start, event.timeZone) ? "celebration" : "finished" };
    }
    const secondsLeft = Math.ceil((start - now) / 1000);
    return {
      phase: "countdown",
      days: Math.floor(secondsLeft / 86400),
      hours: Math.floor((secondsLeft % 86400) / 3600),
      minutes: Math.floor((secondsLeft % 3600) / 60),
      seconds: secondsLeft % 60,
    };
  }

  function getEventDisplay(event) {
    const start = new Date(event.startsAt);
    const format = (options) => new Intl.DateTimeFormat("es-MX", { timeZone: event.timeZone, ...options }).format(start);
    const weekday = format({ weekday: "long" });
    const clock = new Intl.DateTimeFormat("es-MX", {
      timeZone: event.timeZone, hour: "numeric", minute: "2-digit", hourCycle: "h23",
    }).formatToParts(start);
    const hour = Number(clock.find((part) => part.type === "hour").value);
    const minute = clock.find((part) => part.type === "minute").value;
    return {
      weekday: weekday.charAt(0).toUpperCase() + weekday.slice(1),
      day: format({ day: "numeric" }),
      month: format({ month: "long" }),
      year: format({ year: "numeric" }),
      time: `${hour % 12 || 12}:${minute} ${hour >= 12 ? "p. m." : "a. m."}`,
    };
  }

  const api = { getCountdownState, getEventDisplay };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else root.PosadaCountdown = api;
})(typeof window !== "undefined" ? window : globalThis);
