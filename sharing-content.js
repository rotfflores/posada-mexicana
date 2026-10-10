// La quinta sección se personaliza exclusivamente desde este archivo.
window.invitationSharing = {
  enabled: true, // false oculta toda la sección.
  eyebrow: "Entre todos hacemos la fiesta",
  title: "¿Qué llevo para compartir?",
  message: "Lo más importante es que vengas. Si quieres sumar algo a nuestra mesa, aquí te dejamos algunas ideas para compartir en familia",
  items: [
    { id: "mesa", visible: true, title: "Algo para la mesa", description: "Un platillo, botana o postre que te guste compartir" },
    { id: "bebida", visible: true, title: "Tu bebida favorita", description: "Trae lo que prefieras tomar durante la noche" },
    { id: "convivir", visible: true, title: "Muchas ganas de convivir", description: "Las risas y los buenos momentos corren por cuenta de todos" },
  ],
  hostNote: {
    enabled: true,
    text: "Para organizarnos mejor, cuéntanos qué te gustaría llevar al confirmar tu asistencia",
  },
  exchange: {
    enabled: false, // Actívalo solo si habrá intercambio; no es obligatorio.
    title: "¿Te sumas al intercambio?",
    description: "[Indicaciones del intercambio]",
    budget: "[Monto acordado]",
    budgetLabel: "Presupuesto acordado",
  },
};
