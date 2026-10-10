const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const api = require('./rsvp-message.js');

// DOM mínimo para verificar el formulario sin abrir WhatsApp ni contactar a nadie.
function fixture({ phone = '', sharing = true, deadline = '' } = {}) {
  const nodes = {};
  let focused = null;
  const opened = [];
  function node(id) {
    const listeners = {};
    return nodes[id] = { value: '', hidden: false, disabled: false, required: false, checked: false, textContent: '', attributes: {},
      classes: new Set(),
      classList: { add(c) { nodes[id].classes.add(c); }, remove(c) { nodes[id].classes.delete(c); }, toggle(c, on) { nodes[id].classes[on ? 'add' : 'delete'](c); }, contains(c) { return nodes[id].classes.has(c); } },
      setAttribute(key, value) { this.attributes[key] = value; },
      addEventListener(type, handler) { listeners[type] = handler; },
      fire(type) { listeners[type]?.({ preventDefault() {} }); },
      focus() { focused = id; }
    };
  }
  for (const id of ['confirmacion', 'cover', 'para-compartir', 'form', 'card', 'rsvp-name', 'rsvp-guests', 'rsvp-contribution', 'rsvp-message', 'rsvp-yes', 'rsvp-no', 'rsvp-attendance', 'rsvp-submit', 'rsvp-pending', 'rsvp-validation-status', 'rsvp-status', 'rsvp-deadline', 'rsvp-guests-field', 'rsvp-contribution-field', 'rsvp-name-error', 'rsvp-attendance-error', 'rsvp-guests-error', 'rsvp-gate', 'rsvp-accept', 'rsvp-panel', 'rsvp-done', 'rsvp-done-title', 'rsvp-done-text', 'rsvp-edit']) node(id);
  nodes['rsvp-guests'].value = '1';
  nodes.confirmacion.querySelector = (selector) => selector === 'form' ? nodes.form : nodes.card;
  nodes.confirmacion.querySelectorAll = () => [];
  class Observer { observe() {} disconnect() {} }
  const window = { PosadaRsvp: api, invitationRsvp: { hostPhone: phone, eventName: 'Posada de prueba', deadline }, invitationSharing: { enabled: sharing },
    matchMedia: () => ({ matches: true, addEventListener() {} }),
    open: (...args) => opened.push(args)
  };
  vm.runInNewContext(fs.readFileSync(require.resolve('./rsvp.js'), 'utf8'), { window, document: { getElementById: (id) => nodes[id] }, MutationObserver: Observer });
  return { nodes, opened, focused: () => focused, select(value) {
    nodes['rsvp-yes'].checked = value === 'yes'; nodes['rsvp-no'].checked = value === 'no'; nodes[`rsvp-${value}`].fire('change');
  } };
}
const testPhone = '12025550100'; // Solo fixture: window.open está interceptado.

test('Sin teléfono desactiva el botón y bloquea incluso un submit programático', () => {
  const { nodes, opened } = fixture();
  assert.equal(nodes['rsvp-submit'].disabled, true);
  assert.equal(nodes['rsvp-pending'].hidden, false);
  assert.equal(nodes['rsvp-deadline'].hidden, true);
  nodes.form.fire('submit');
  assert.equal(opened.length, 0);
});
test('Cambia visibilidad, obligatoriedad y habilitación sin borrar los datos', () => {
  const f = fixture();
  f.select('yes');
  assert.equal(f.nodes['rsvp-guests'].required, true);
  assert.equal(f.nodes['rsvp-contribution'].disabled, false);
  f.nodes['rsvp-guests'].value = '4';
  f.nodes['rsvp-contribution'].value = 'Tamales';
  f.select('no');
  assert.equal(f.nodes['rsvp-guests-field'].hidden, true);
  assert.equal(f.nodes['rsvp-guests'].disabled, true);
  assert.equal(f.nodes['rsvp-guests'].required, false);
  assert.equal(f.nodes['rsvp-contribution'].disabled, true);
  f.select('yes');
  assert.equal(f.nodes['rsvp-guests'].value, '4');
  assert.equal(f.nodes['rsvp-contribution'].value, 'Tamales');
});
test('Errores asociados al campo, foco inicial y datos conservados', () => {
  const f = fixture({ phone: testPhone });
  f.nodes['rsvp-message'].value = 'Con cariño';
  f.nodes.form.fire('submit');
  assert.equal(f.focused(), 'rsvp-name');
  assert.equal(f.nodes['rsvp-name'].attributes['aria-invalid'], 'true');
  assert.equal(f.nodes['rsvp-attendance-error'].hidden, false);
  assert.equal(f.nodes['rsvp-message'].value, 'Con cariño');
  f.nodes['rsvp-name'].value = 'María';
  f.select('yes');
  f.nodes['rsvp-guests'].value = '1.5';
  f.nodes.form.fire('submit');
  assert.equal(f.focused(), 'rsvp-guests');
  assert.equal(f.nodes['rsvp-guests-error'].hidden, false);
  assert.equal(f.opened.length, 0);
});
test('No asistir prepara únicamente los datos pertinentes, sin confirmar el envío', () => {
  const f = fixture({ phone: testPhone, deadline: '15 de diciembre' });
  assert.equal(f.nodes['rsvp-deadline'].hidden, false);
  f.nodes['rsvp-name'].value = 'José';
  f.nodes['rsvp-guests'].value = '5';
  f.nodes['rsvp-contribution'].value = 'Postre';
  f.select('no');
  f.nodes.form.fire('submit');
  const [url, target, features] = f.opened[0];
  const message = new URL(url).searchParams.get('text');
  assert.ok(message.includes('Esta vez no podré'));
  assert.ok(!message.includes('Postre'));
  assert.ok(!message.includes('Total de asistentes'));
  assert.equal(target, '_blank');
  assert.equal(features, 'noopener,noreferrer');
  assert.ok(!f.nodes['rsvp-status'].textContent.includes('Asistencia confirmada'));
  assert.equal(f.nodes['rsvp-name'].value, 'José');
});
test('Sin sección de aportaciones no muestra ni incluye el campo', () => {
  const f = fixture({ phone: testPhone, sharing: false });
  f.nodes['rsvp-name'].value = 'Ana';
  f.nodes['rsvp-contribution'].value = 'Postre';
  f.select('yes');
  assert.equal(f.nodes['rsvp-contribution-field'].hidden, true);
  assert.equal(f.nodes['rsvp-contribution'].disabled, true);
  f.nodes.form.fire('submit');
  assert.ok(!new URL(f.opened[0][0]).searchParams.get('text').includes('Postre'));
});

test('El formulario se abre al aceptar y se cierra al preparar el envío', () => {
  const f = fixture({ phone: testPhone });
  assert.equal(f.nodes['rsvp-gate'].hidden, false);
  assert.equal(f.nodes['rsvp-panel'].classList.contains('is-open'), false);
  assert.equal(f.nodes['rsvp-panel'].inert, true);
  f.nodes['rsvp-accept'].fire('click');
  assert.equal(f.nodes['rsvp-gate'].hidden, true);
  assert.equal(f.nodes['rsvp-panel'].classList.contains('is-open'), true);
  assert.equal(f.nodes['rsvp-panel'].inert, false);
  assert.equal(f.nodes['rsvp-accept'].attributes['aria-expanded'], 'true');
  assert.equal(f.nodes['rsvp-yes'].checked, true);
  assert.equal(f.focused(), 'rsvp-name');
  // Un envío con errores no cierra el formulario.
  f.nodes.form.fire('submit');
  assert.equal(f.nodes['rsvp-panel'].classList.contains('is-open'), true);
  assert.equal(f.nodes['rsvp-done'].hidden, true);
  f.nodes['rsvp-name'].value = 'Lupita';
  f.nodes.form.fire('submit');
  assert.equal(f.opened.length, 1);
  assert.equal(f.nodes['rsvp-panel'].classList.contains('is-open'), false);
  assert.equal(f.nodes['rsvp-panel'].inert, true);
  assert.equal(f.nodes['rsvp-done'].hidden, false);
  assert.equal(f.focused(), 'rsvp-done-title');
  f.nodes['rsvp-edit'].fire('click');
  assert.equal(f.nodes['rsvp-panel'].classList.contains('is-open'), true);
  assert.equal(f.nodes['rsvp-done'].hidden, true);
  assert.equal(f.nodes['rsvp-name'].value, 'Lupita');
});
