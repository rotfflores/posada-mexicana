const test = require('node:test');
const assert = require('node:assert/strict');
const { normalizePhone, validateResponse, buildMessage, buildWhatsAppUrl } = require('./rsvp-message.js');
const attending = { name: ' María & José ', attendance: 'yes', guests: '3', contribution: 'Buñuelos y café', message: '¡Nos vemos!\r\nCon cariño ❤️' };

test('Exige nombre y respuesta y conserva los valores originales', () => {
  const input = { name: ' ', attendance: '', guests: '3', message: 'Hola' };
  assert.deepEqual(Object.keys(validateResponse(input)), ['name', 'attendance']);
  assert.equal(input.message, 'Hola');
  assert.throws(() => buildMessage('Posada', input));
});
test('Solo exige un entero positivo al asistir', () => {
  for (const guests of ['', '0', '-1', '1.5', 'NaN', '9007199254740992']) {
    assert.ok(validateResponse({ ...attending, guests }).guests, guests);
  }
  assert.deepEqual(validateResponse(attending), {});
  assert.deepEqual(validateResponse({ ...attending, attendance: 'no', guests: '' }), {});
});
test('Incluye los datos pertinentes y normaliza saltos de línea', () => {
  assert.equal(buildMessage('Posada familiar', attending), 'Posada familiar\nInvitado: María & José\nAsistencia: ¡Sí, ahí estaré!\nTotal de asistentes (incluyéndome): 3\nPara compartir: Buñuelos y café\nMensaje para la familia: ¡Nos vemos!\nCon cariño ❤️');
});
test('Al no asistir excluye asistentes y aportación aunque tengan valores', () => {
  const message = buildMessage('Posada', { ...attending, attendance: 'no' });
  assert.ok(message.includes('Esta vez no podré'));
  assert.ok(message.includes('Mensaje para la familia:'));
  assert.ok(!message.includes('Total de asistentes'));
  assert.ok(!message.includes('Para compartir'));
});
test('Omite aportaciones desactivadas y campos opcionales vacíos', () => {
  assert.ok(!buildMessage('Posada', attending, false).includes('Para compartir'));
  const message = buildMessage('Posada', { ...attending, contribution: ' ', message: '' });
  assert.ok(!message.includes('Para compartir'));
  assert.ok(!message.includes('Mensaje para la familia'));
});
test('Teléfono sin configurar o inválido no produce enlace', () => {
  for (const phone of ['', null, 'por configurar', '0123456789', '123', '+1234567890123456']) {
    assert.equal(normalizePhone(phone), null);
    assert.equal(buildWhatsAppUrl(phone, 'Hola'), null);
  }
});
test('Codifica fielmente acentos, caracteres especiales y saltos de línea', () => {
  // Número sintético exclusivamente para probar la URL. Nunca se abre ni se envía.
  const phone = '+1 (202) 555-0100';
  assert.equal(normalizePhone(phone), '12025550100');
  const message = buildMessage('Posada García: 100% alegría', attending);
  const url = new URL(buildWhatsAppUrl(phone, message));
  assert.equal(url.origin, 'https://wa.me');
  assert.equal(url.pathname, '/12025550100');
  assert.equal(url.searchParams.get('text'), message);
  assert.ok(url.href.includes('%0A'));
});
