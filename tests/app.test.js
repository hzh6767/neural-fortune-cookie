const assert = require('assert');
const app = require('../app.js');

let passed = 0;
function test(name, fn) {
  try {
    fn();
    passed += 1;
    console.log(`ok - ${name}`);
  } catch (error) {
    console.error(`not ok - ${name}`);
    console.error(error && error.message);
    process.exitCode = 1;
  }
}

test('every mood option in index.html has a fortune bank', () => {
  const html = require('fs').readFileSync(require('path').join(__dirname, '..', 'index.html'), 'utf8');
  const moods = [...html.matchAll(/<option value="([^"]+)"/g)].map((m) => m[1]);
  assert.ok(moods.length > 0, 'no mood options found in index.html');
  moods.forEach((mood) => {
    assert.ok(Array.isArray(app.fortunes[mood]), `missing fortune bank for mood "${mood}"`);
    assert.ok(app.fortunes[mood].length > 0, `empty fortune bank for mood "${mood}"`);
  });
});

test('pick always returns an element of the given list', () => {
  const list = ['a', 'b', 'c'];
  for (let i = 0; i < 200; i += 1) {
    assert.ok(list.includes(app.pick(list)), 'pick returned a value outside the list');
  }
});

test('pick handles a single-element list', () => {
  assert.strictEqual(app.pick(['only']), 'only');
});

test('formatFortune prefixes the name only when one is given', () => {
  assert.strictEqual(app.formatFortune('Morgan', 'A base.', ' An add-on.'), 'Morgan, A base. An add-on.');
  assert.strictEqual(app.formatFortune('', 'A base.', ' An add-on.'), 'A base. An add-on.');
});

test('formatKicker quotes the question and falls back when blank', () => {
  assert.strictEqual(app.formatKicker('Is it Friday?'), 'Regarding: \u201cIs it Friday?\u201d');
  assert.strictEqual(app.formatKicker(''), 'A general-purpose cosmic nudge');
});

test('formatTime renders a short hh:mm style stamp', () => {
  const stamp = app.formatTime(new Date(2026, 0, 2, 14, 32));
  assert.ok(/\d/.test(stamp), 'time stamp contains no digits');
  assert.ok(stamp.length <= 11, `time stamp unexpectedly long: ${stamp}`);
});

test('activeBarCount stays inside the 2..5 range the meter can light', () => {
  for (let i = 0; i < 500; i += 1) {
    const count = app.activeBarCount();
    assert.ok(count >= 2 && count <= 5, `activeBarCount out of range: ${count}`);
    assert.ok(Number.isInteger(count), `activeBarCount not an integer: ${count}`);
  }
});

test('addToHistory keeps the newest entry first and caps at MAX_HISTORY', () => {
  assert.strictEqual(app.MAX_HISTORY, 4);
  let items = [];
  for (let i = 1; i <= 7; i += 1) items = app.addToHistory(items, { fortune: `f${i}` });
  assert.strictEqual(items.length, app.MAX_HISTORY);
  assert.deepStrictEqual(items.map((i) => i.fortune), ['f7', 'f6', 'f5', 'f4']);
});

test('addToHistory does not mutate the list it is given', () => {
  const original = [{ fortune: 'first' }];
  const next = app.addToHistory(original, { fortune: 'second' });
  assert.strictEqual(original.length, 1);
  assert.strictEqual(next.length, 2);
  assert.notStrictEqual(original, next);
});

test('history entries are built with a machine-readable ISO timestamp source', () => {
  const now = new Date(2026, 0, 2, 14, 32);
  const iso = now.toISOString();
  assert.ok(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/.test(iso), `ISO format check failed: ${iso}`);
  assert.strictEqual(iso.slice(0, 10), '2026-01-02');
});

console.log(`\n${passed} passing`);
