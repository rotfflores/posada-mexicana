# Posada mexicana · Familia García

Entrada interactiva, portada, bienvenida con fecha y cuenta regresiva, ubicación, momentos, nota para compartir, respuesta por WhatsApp y despedida en HTML, CSS y JavaScript, sin dependencias de ejecución.

## Vista previa

Ejecuta `npm run dev` y abre http://localhost:4173. También puedes abrir `index.html` directamente.

## Personalizar

Edita `content.js` para cambiar los textos. `\n` agrega un salto de línea. Los colores y las tipografías están en las variables al inicio de `styles.css`. Bree Serif y DM Sans se cargan desde Google Fonts; sin conexión se usan Georgia y Segoe UI.

La fecha se define una sola vez en `window.invitationEvent.startsAt` dentro de `content.js`, como fecha ISO con desfase horario. La fecha visible y el contador se generan desde ese mismo valor. `timeZone` determina el calendario local; por defecto es `America/Mexico_City`. El dato de ejemplo es el sábado 19 de diciembre de 2026 a las 7:00 p. m. (-06:00).

“Descubre los detalles” desplaza hacia `#detalles` y lleva el foco al título de bienvenida. El desplazamiento y la aparición de bloques al entrar en pantalla respetan la preferencia de movimiento reducido.

El contador muestra días, horas, minutos y segundos hasta la hora de inicio. Desde ese instante muestra “¡Hoy celebramos juntos!” hasta terminar el día en CDMX; a partir de la medianoche siguiente muestra “Gracias por ser parte de nuestra posada”. Recalcula con el reloj real y se actualiza al volver a una pestaña inactiva. Los segundos no se anuncian continuamente a los lectores de pantalla.

La textura adjunta se conserva en `assets/cream-paper.png` y se usa con una opacidad sutil. La segunda sección permanece oculta hasta abrir la piñata.

El acabado maximalista está en `maximalista.css`: cenefas de talavera, flores y aves en SVG, guirnaldas de papel picado y una roseta detrás de la fecha. Los adornos se concentran en los bordes y se adaptan a pantallas pequeñas.

La piñata funciona con clic, toque, Enter y barra espaciadora. Al abrirse, el foco pasa al título de la portada. Se respeta `prefers-reduced-motion`, incluso si cambia durante la apertura. Sin JavaScript se muestran la portada y la bienvenida; la fecha y el contador requieren JavaScript.

Los datos del evento son de ejemplo.

## Ubicación

Edita `location-content.js` para personalizar el nombre del lugar, la dirección, la referencia opcional, el pie de ilustración y `mapsUrl`. La invitación de ejemplo es de la familia García. Se usa como destino público real la Casa de Cultura Jesús Reyes Heroles, Francisco Sosa 202, Coyoacán, frente a la Plaza de Santa Catarina. La sede es un ejemplo, no una reserva del lugar. Fuente de la dirección: https://culturacoyoacan.com/casas-de-cultura/. Una referencia vacía se oculta.

“Cómo llegar” abre Google Maps con indicaciones hacia la sede de ejemplo en otra pestaña con `noopener noreferrer`. Sustituye `mapsUrl` junto con la dirección cuando personalices el evento. Con `mapsUrl: null`, se muestra “Ubicación por confirmar” y el botón queda desactivado. El código nunca deduce el enlace a partir del texto de la dirección.

`location.css` afecta únicamente a la ubicación. La ilustración artesanal está en `assets/posada-fachada.svg`: piñata de siete picos con flecos de papel, farolitos, velas y una olla de ponche sobre una mesa, además de las nochebuenas y la talavera. Es una ilustración conceptual de posada, no un dibujo literal de la sede. `location.js` observa la apertura de la portada existente y muestra la sección sin modificar las interacciones anteriores. El letrero aparece al entrar en pantalla, los focos se encienden en una secuencia breve y el papel picado se mueve suavemente mientras la sección está visible. Se respeta la preferencia de movimiento reducido.

## Lo que nos espera

La cuarta sección, `#momentos`, presenta “Lo que nos espera” como un patio nocturno verde con luces, papel picado de estrellas, campanas y piñatas, farolitos y nochebuenas. No contiene árboles navideños. Sus cuatro ilustraciones SVG detalladas están dentro de esa sección en `index.html`; sus estilos están aislados en `activities.css`.

Edita `activities-content.js` para cambiar encabezado, cierre y los cuatro momentos. En `moments`, conserva cada `id` y cambia `title`, `description` o `label`. Usa `visible: false` para ocultar un momento completo. El ritmo alternado se recalcula entre los momentos visibles. Los textos se insertan como texto simple, sin interpretar HTML.

`activities.js` muestra la sección al abrir la invitación y observa cada estampa de forma independiente. La aparición ocurre una sola vez; vapor y piñata se animan solo mientras su estampa está en pantalla. El resplandor de la guirnalda superior también se pausa fuera de pantalla. `prefers-reduced-motion` desactiva todos esos movimientos y mantiene todo legible, incluso al cambiar la preferencia con la página abierta. Sin JavaScript, los cuatro momentos predeterminados siguen visibles.

## ¿Qué llevo para compartir?

La quinta sección, `#para-compartir`, es una nota de los anfitriones sobre papel artesanal crema y un fondo rojo ornamental. Usa ilustraciones SVG propias en `assets/compartir-*.svg`, nochebuenas, recortes, estrellas de papel y un listón de tela ilustrado. Su guirnalda tiene focos rojos, verdes, dorados y azules, con centros claros y halos suaves. No incluye árboles navideños ni controles de confirmación.

Personaliza `sharing-content.js`: `enabled: false` oculta toda la sección; `items[].visible: false` oculta una aportación; `hostNote.enabled: false` oculta la nota final. Conserva los ids `mesa`, `bebida` y `convivir` para asociar textos e ilustraciones. Los textos se insertan como texto simple.

El intercambio está oculto por defecto (`exchange.enabled: false`). Cuando quieras mostrarlo, activa esa opción y sustituye `title`, `description`, `budget` y `budgetLabel` por los datos acordados. No se ha definido ningún monto.

`sharing.css` y `sharing.js` afectan solo a esta sección. La hoja aparece una vez al entrar en pantalla; las luces se encienden en una secuencia suave y su resplandor se pausa cuando quedan fuera de pantalla. El movimiento reducido desactiva las animaciones, también si la preferencia cambia con la página abierta. Sin JavaScript se muestra la nota predeterminada y el intercambio sigue oculto.

## ¿Nos acompañas?

La sexta sección, `#confirmacion`, presenta un formulario sobre papel crema con marco ornamental, nochebuenas, listones y las mismas luces de colores en secuencia. Sus estilos e interacciones están aislados en `rsvp.css` y `rsvp.js`.

Personaliza `rsvp-content.js`. Define `hostPhone` únicamente allí, con el número real del anfitrión y su código de país. Está vacío por defecto: el botón permanece desactivado y se muestra “Confirmación disponible próximamente”. No hay ningún destinatario inventado. Cambia `eventName`, las etiquetas y los textos cuando sea necesario. `deadline` es una fecha límite escrita para mostrar; vacía, queda oculta.

Nombre y asistencia son obligatorios. Si asistirá, se solicita un total entero de al menos una persona, incluyéndolo; la aportación opcional se muestra solo si `sharing-content.js` mantiene `enabled: true`. Al responder que no, se ocultan y desactivan ambos campos y se excluyen del mensaje, conservando sus valores por si cambia de opinión. Los errores aparecen junto al campo y el foco pasa al primer dato pendiente.

El formulario empieza cerrado: solo se ven el encabezado y el botón “Aceptar invitación”. Al tocarlo, el formulario se despliega con “¡Sí, ahí estaré!” ya marcado (se puede cambiar) y el foco pasa al nombre. Mientras está cerrado, sus campos no reciben foco. Al enviar una respuesta válida se abre WhatsApp, el formulario se pliega y aparece un agradecimiento con “Cambiar mi respuesta”, que lo vuelve a abrir con los datos conservados. Si hay errores, el formulario sigue abierto. Los textos del botón y del agradecimiento (`acceptLabel`, `acceptHint`, `thanksYesTitle`, `thanksNoTitle`, `thanksText`, `editLabel`) están en `rsvp-content.js`.

El botón abre un borrador en WhatsApp con el nombre del evento, invitado y datos pertinentes. Los campos opcionales vacíos se omiten. `rsvp-message.js` codifica el mensaje completo, incluidos acentos y saltos de línea. El invitado debe enviarlo manualmente: abrir WhatsApp no confirma su asistencia. No se guardan respuestas ni se envían mensajes automáticamente. Sin JavaScript se muestra la sección con el envío desactivado.

## Despedida y pie de página

La última sección, `#despedida`, cierra la invitación como un patio nocturno con guirnaldas de luces, papel picado de estrellas y campanas, una piñata de siete picos, nochebuenas y listones. Sus textos se personalizan en `farewell-content.js`. La firma toma por defecto `familyName` de `content.js`, para coincidir con la portada; también se puede sustituir solo en `farewell-content.js`. El nombre del evento preparado para WhatsApp se edita en `rsvp-content.js`.

El enlace de Rotf Studio abre `https://rotfstudio.com` en otra pestaña.

## Verificación

Todas las guirnaldas usan ahora `festive-lights.js` y `festive-lights.css`: un foco SVG uniforme de 3.8 × 5.8 unidades, con casquillo y halo idénticos. Los circuitos rojo, verde, dorado y azul se encienden por turnos de 0.8 segundos, con cambios directos (`steps`), sin desvanecimiento. El ritmo se pausa fuera de pantalla. Con movimiento reducido, todos quedan encendidos y estáticos. Esto incluye la entrada/portada, la ubicación, las actividades y su cierre, la nota para compartir, la confirmación y la despedida. Los focos pintados dentro de ilustraciones mantienen su acabado original.

`npm run check` comprueba la sintaxis. `npm test` verifica la cuenta regresiva y la fecha local, además de la validación de la respuesta, los campos excluidos según la asistencia y la codificación del borrador de WhatsApp.

## Pulido final

`pulido.css` se carga al último y reúne los retoques: cada guirnalda de papel picado tiene una fila trasera más chica en rosa y cempasúchil (`#fiesta-garland-back`), colocada en los huecos de la principal; las guirnaldas conservan su proporción para que ninguna bandera quede cortada; un festón rojo une la nota para compartir con la confirmación y una cenefa de talavera cierra cada sección; las estrellas colgantes se mecen suavemente. El movimiento reducido las deja quietas.

## Música

`assets/musica-navidad.mp3` suena en bucle desde que se abre la página, con una entrada suave. Los navegadores suelen bloquear el sonido automático hasta que el invitado interactúa, así que en ese caso la música empieza con el primer toque, clic o tecla (por ejemplo, al tocar la piñata). El botón redondo de la esquina inferior derecha pausa o reanuda la música y el navegador recuerda esa elección. La música se pausa al cambiar de pestaña y continúa al volver. El archivo, el volumen y la duración de la entrada se ajustan al inicio de `music.js`.
