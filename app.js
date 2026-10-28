(() => {
  const TOTAL = 75;
  const colors = ['#ffae22', '#5e9ff5', '#61c98e', '#ff7276'];
  const numberEl = document.querySelector('#current-number');
  const historyEl = document.querySelector('#history');
  const remainingEl = document.querySelector('#remaining');
  const statusEl = document.querySelector('#status');
  const drawButton = document.querySelector('#draw-button');
  const resetButton = document.querySelector('#reset-button');
  const dialog = document.querySelector('#reset-dialog');
  const confirmReset = document.querySelector('#confirm-reset');
  let drawn = [];
  let isDrawing = false;

  function load() { try { const saved = JSON.parse(localStorage.getItem('bingo-drawn')); if (Array.isArray(saved) && saved.every(n => Number.isInteger(n) && n >= 1 && n <= TOTAL)) drawn = [...new Set(saved)]; } catch (_) {} }
  function save() { localStorage.setItem('bingo-drawn', JSON.stringify(drawn)); }
  function render() {
    const latest = drawn.at(-1);
    numberEl.textContent = latest ?? '?';
    remainingEl.textContent = `のこり ${TOTAL - drawn.length} 個`;
    historyEl.replaceChildren(...[...drawn].reverse().map((number, index) => { const item = document.createElement('li'); item.textContent = number; item.style.setProperty('--ball', colors[index % colors.length]); return item; }));
    if (drawn.length === TOTAL) { drawButton.disabled = true; drawButton.textContent = '抽選終了！'; statusEl.textContent = '全75個の数字が出そろいました。'; }
  }
  function draw() {
    const candidates = Array.from({ length: TOTAL }, (_, i) => i + 1).filter(n => !drawn.includes(n));
    if (!candidates.length || isDrawing) return;
    isDrawing = true;
    drawButton.disabled = true;
    drawButton.textContent = '抽選中…';
    statusEl.textContent = '数字を選んでいます…';
    const number = candidates[Math.floor(Math.random() * candidates.length)];
    const startedAt = Date.now();
    const timer = setInterval(() => {
      numberEl.textContent = candidates[Math.floor(Math.random() * candidates.length)];
      if (Date.now() - startedAt < 1450) return;
      clearInterval(timer);
      drawn.push(number); save(); render();
      statusEl.textContent = `${number} 番が出ました！`;
      isDrawing = false;
      if (drawn.length < TOTAL) {
        drawButton.disabled = false;
        drawButton.innerHTML = '<span aria-hidden="true">☝</span> スタート！';
      }
      if ('vibrate' in navigator) navigator.vibrate([35, 40, 60]);
    }, 70);
  }
  drawButton.addEventListener('click', draw);
  resetButton.addEventListener('click', () => { if (typeof dialog.showModal === 'function') dialog.showModal(); else if (confirm('出た数字の履歴をすべて消して、最初からやり直しますか？')) reset(); });
  confirmReset.addEventListener('click', () => { setTimeout(reset, 0); });
  function reset() { drawn = []; localStorage.removeItem('bingo-drawn'); drawButton.disabled = false; drawButton.innerHTML = '<span aria-hidden="true">☝</span> スタート！'; statusEl.textContent = 'ボタンを押して抽選をはじめよう'; render(); }
  load(); render();
  if ('serviceWorker' in navigator) window.addEventListener('load', () => navigator.serviceWorker.register('./service-worker.js'));
})();
