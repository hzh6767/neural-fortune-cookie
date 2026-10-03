const fortunes = {
  curious: [
    "A suspiciously specific yes is approaching. Bring snacks.",
    "The answer is hiding behind a door labeled 'try the weird way'.",
    "Your next small experiment will accidentally become a personality trait.",
    "A stranger will compliment your taste in something niche. Believe them."
  ],
  sleepy: [
    "Your pillow has reviewed the plan and requests one more hour.",
    "The path forward is soft, quiet, and suspiciously close to a nap.",
    "A tiny task completed before noon will make you feel mysteriously powerful.",
    "Tomorrow is willing to negotiate. Today recommends water."
  ],
  brave: [
    "The bold move is smaller than you think. Start before your brain files a complaint.",
    "You will survive the awkward first draft and gain one shiny new skill.",
    "Someone is waiting for your honest answer. Make it kind and make it clear.",
    "The universe rewards a little audacity and an exit strategy."
  ],
  skeptical: [
    "Your doubt is useful, but it cannot drive the car forever.",
    "Run one tiny test. If it fails, you get data and an excellent story.",
    "The evidence points toward 'probably'. Please wear sensible shoes.",
    "You are right to ask for receipts. The receipt is a surprisingly fun afternoon."
  ]
};
const addOns = [" and a strangely lucky receipt.", " before the kettle clicks.", " (the pigeons already know).", "; let the odd detail lead.", " with a 73% chance of snacks."];
const MAX_HISTORY = 4;

function pick(list) { return list[Math.floor(Math.random() * list.length)]; }
function formatFortune(name, base, addOn) { return `${name ? `${name}, ` : ''}${base}${addOn}`; }
function formatKicker(question) { return question ? `Regarding: “${question}”` : 'A general-purpose cosmic nudge'; }
function formatTime(date) { return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }); }
function activeBarCount() { return 2 + Math.floor(Math.random() * 4); }
function addToHistory(items, entry) { return [entry, ...items].slice(0, MAX_HISTORY); }

if (typeof document !== 'undefined') {
  const form = document.querySelector('#fortune-form');
  const nameInput = document.querySelector('#name');
  const moodInput = document.querySelector('#mood');
  const questionInput = document.querySelector('#question');
  const text = document.querySelector('#fortune-text');
  const kicker = document.querySelector('#fortune-kicker');
  const tag = document.querySelector('#fortune-tag');
  const copyButton = document.querySelector('#copy-button');
  const history = document.querySelector('#history');
  const clearHistory = document.querySelector('#clear-history');
  const meterBars = [...document.querySelectorAll('.meter span')];
  let currentFortune = '';
  let historyItems = [];
  let copyLabelTimer;

  function renderHistory() {
    history.replaceChildren();
    if (historyItems.length === 0) {
      const empty = document.createElement('li');
      empty.className = 'empty-history';
      empty.textContent = 'Your future will appear here.';
      history.append(empty);
      return;
    }
    historyItems.forEach((item) => {
      const entry = document.createElement('li');
      const time = document.createElement('time');
      const fortune = document.createElement('span');
      const mood = document.createElement('span');
      time.dateTime = item.iso;
      time.textContent = item.time;
      fortune.textContent = item.fortune;
      mood.className = 'tag';
      mood.textContent = item.mood;
      entry.append(time, fortune, mood);
      history.append(entry);
    });
  }

  function selectFortune() {
    const selection = window.getSelection();
    if (!selection) return;
    const range = document.createRange();
    range.selectNodeContents(text);
    selection.removeAllRanges();
    selection.addRange(range);
  }

  function setCopyLabel(label, delay) {
    clearTimeout(copyLabelTimer);
    copyButton.textContent = label;
    copyLabelTimer = setTimeout(() => { copyButton.textContent = 'Copy fortune'; }, delay);
  }

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const name = nameInput.value.trim();
    const mood = moodInput.value;
    const question = questionInput.value.trim();
    currentFortune = formatFortune(name, pick(fortunes[mood]), pick(addOns));
    text.textContent = currentFortune;
    kicker.textContent = formatKicker(question);
    tag.textContent = `${mood.toUpperCase()} / CRACKED`;
    copyButton.disabled = false;
    const activeBars = activeBarCount();
    meterBars.forEach((bar, index) => bar.classList.toggle('active', index < activeBars));
    const now = new Date();
    historyItems = addToHistory(historyItems, { time: formatTime(now), iso: now.toISOString(), fortune: currentFortune, mood: mood.toUpperCase() });
    renderHistory();
  });

  copyButton.addEventListener('click', async () => {
    if (!currentFortune) return;
    try {
      await navigator.clipboard.writeText(currentFortune);
      setCopyLabel('Copied', 1400);
    } catch {
      selectFortune();
      setCopyLabel('Press Ctrl/Cmd+C', 3000);
    }
  });

  clearHistory.addEventListener('click', () => { historyItems = []; renderHistory(); });
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { fortunes, addOns, MAX_HISTORY, pick, formatFortune, formatKicker, formatTime, activeBarCount, addToHistory };
}
