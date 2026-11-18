(function () {
  'use strict';

  const PLUCKS_PER_DAY = 3;
  const STORE_KEY = 'pluk-v1';

  // ---------- Schaal: het ontwerp (390 px breed) past op elk scherm ----------
  function fit() {
    const w = window.innerWidth;
    const h = window.innerHeight;
    const root = document.documentElement.style;
    if (w >= 600) {
      // groot scherm: toon de app als telefoon
      document.body.classList.add('desktop');
      const s = Math.min(1, (h - 40) / 844);
      root.setProperty('--s', s);
      root.setProperty('--H', 844);
    } else {
      document.body.classList.remove('desktop');
      const s = Math.min(w / 390, h / 700);
      root.setProperty('--s', s);
      root.setProperty('--H', Math.max(700, h / s));
    }
  }
  window.addEventListener('resize', fit);
  fit();

  // ---------- Opslag ----------
  function todayKey(d = new Date()) {
    const p = (n) => String(n).padStart(2, '0');
    return d.getFullYear() + '-' + p(d.getMonth() + 1) + '-' + p(d.getDate());
  }

  function load() {
    try {
      const s = JSON.parse(localStorage.getItem(STORE_KEY));
      if (s && Array.isArray(s.used)) return s;
    } catch (e) { /* lege of kapotte opslag */ }
    return { used: [], day: null, current: null, spent: 0, picked: false };
  }

  function save() {
    try { localStorage.setItem(STORE_KEY, JSON.stringify(state)); } catch (e) { /* privé-modus */ }
  }

  let state = load();

  function usedIds() { return new Set(state.used.map((u) => u.id)); }

  function randomUnused(exclude) {
    const used = usedIds();
    const pool = [];
    for (let i = 0; i < PROMPTS.length; i++) {
      if (!used.has(i) && i !== exclude) pool.push(i);
    }
    if (!pool.length) return null;
    return pool[Math.floor(Math.random() * pool.length)];
  }

  // Elke nieuwe dag: nieuw vraagje en weer 3 keer plukken
  function startDayIfNeeded() {
    const today = todayKey();
    if (state.day !== today) {
      state.day = today;
      state.spent = 0;
      state.picked = false;
      state.current = randomUnused(null);
      save();
    } else if (state.current === null || (!state.picked && usedIds().has(state.current))) {
      state.current = randomUnused(null);
      save();
    }
  }

  // ---------- Elementen ----------
  const $ = (id) => document.getElementById(id);
  const el = {
    date: $('date'), card: $('card'), nr: $('prompt-nr'), prompt: $('prompt'), counter: $('counter'), plucks: $('plucks'),
    open: $('actions-open'), picked: $('actions-picked'), done: $('actions-done'),
    pick: $('btn-pick'), shuffle: $('btn-shuffle'), shuffleLabel: $('shuffle-label'),
    toGarden: $('btn-to-garden'), restart: $('btn-restart'),
    today: $('view-today'), garden: $('view-garden'),
    tabToday: $('tab-today'), tabGarden: $('tab-garden'),
    list: $('garden-list'), flowers: $('garden-flowers'),
    themeBtn: $('theme-btn'),
  };

  const ON = ['assets/count-on-1.svg', 'assets/count-on-2.svg', 'assets/count-on-3.svg'];
  const OFF = ['assets/count-off-1.svg', 'assets/count-off-2.svg', 'assets/count-off-3.svg'];
  const ON_ZACHT = ['assets/sparkle-on.svg'];
  const OFF_ZACHT = ['assets/sparkle-off.svg'];
  const FRUIT = ['assets/krijt-lemon.svg', 'assets/krijt-orange.svg', 'assets/krijt-pear.svg'];
  const OFF_KRIJT = ['assets/krijt-lemon-off.svg'];

  // ---------- Thema ----------
  const THEME_KEY = 'pluk-theme';
  const THEME_COLOR = { zonnig: '#A9C4FA', zacht: '#7E9CDA', krijt: '#DCCBB2' };
  function currentTheme() {
    const t = document.documentElement.dataset.theme;
    return t === 'zacht' || t === 'krijt' ? t : 'zonnig';
  }
  function applyTheme(theme) {
    if (theme === 'zacht' || theme === 'krijt') document.documentElement.dataset.theme = theme;
    else delete document.documentElement.dataset.theme;
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', THEME_COLOR[theme] || THEME_COLOR.zonnig);
    document.querySelectorAll('.theme-opt').forEach((b) => b.setAttribute('aria-checked', String(b.dataset.theme === theme)));
  }
  applyTheme(currentTheme());

  function shortDate(d) {
    return new Intl.DateTimeFormat('nl-BE', { weekday: 'short', day: 'numeric', month: 'short' })
      .format(d).replace(/\./g, '');
  }
  function dayMonth(key) {
    const [y, m, d] = key.split('-').map(Number);
    return new Intl.DateTimeFormat('nl-BE', { day: 'numeric', month: 'short' })
      .format(new Date(y, m - 1, d)).replace(/\./g, '');
  }

  // Lange vraagjes krijgen een iets kleinere letter zodat ze in het kaartje passen
  function fitPrompt() {
    let size = 28;
    el.prompt.style.fontSize = size + 'px';
    while (el.prompt.scrollHeight > el.prompt.clientHeight + 1 && size > 18) {
      size -= 1;
      el.prompt.style.fontSize = size + 'px';
    }
  }

  // ---------- Tekenen: vandaag ----------
  function renderToday(animate) {
    el.date.textContent = shortDate(new Date());
    const left = Math.max(0, PLUCKS_PER_DAY - state.spent);
    const allDone = state.current === null;

    if (allDone) {
      el.nr.textContent = 'alles geplukt';
      el.prompt.textContent = 'Je hebt alle vraagjes geplukt. Wat een tuin!';
    } else {
      el.nr.textContent = 'vraagje nr. ' + (state.current + 1);
      el.prompt.textContent = PROMPTS[state.current];
    }
    fitPrompt();

    if (allDone) el.counter.textContent = 'Alles geplukt!';
    else if (state.picked) el.counter.textContent = 'Gekozen! Veel schrijfplezier';
    else if (left === 0) el.counter.textContent = 'Op voor vandaag! Morgen weer';
    else el.counter.textContent = 'Nog ' + left + 'x plukken vandaag';

    el.plucks.innerHTML = '';
    for (let i = 0; i < PLUCKS_PER_DAY; i++) {
      const img = document.createElement('img');
      img.alt = '';
      img.width = 34; img.height = 34;
      const theme = currentTheme();
      const on = theme === 'zacht' ? ON_ZACHT : theme === 'krijt' ? FRUIT : ON;
      const off = theme === 'zacht' ? OFF_ZACHT : theme === 'krijt' ? OFF_KRIJT : OFF;
      img.src = i < left ? on[i % on.length] : off[i % off.length];
      if (animate && i === left) img.classList.add('just-plucked');
      el.plucks.appendChild(img);
    }

    el.open.hidden = state.picked || allDone;
    el.picked.hidden = !state.picked || allDone;
    el.done.hidden = !allDone;
    el.shuffle.disabled = left === 0;
    el.shuffleLabel.textContent = left > 0 ? 'pluk opnieuw' : 'morgen weer plukken';

    if (animate) {
      el.card.classList.remove('pop');
      void el.card.offsetWidth;
      el.card.classList.add('pop');
    }
  }

  // ---------- Tekenen: mijn tuin ----------
  // Elk gekozen vraagje krijgt een eigen, uniek madeliefje
  function daisySVG(id, size) {
    let seed = (id + 1) * 7919 % 2147483647;
    const rnd = () => (seed = seed * 16807 % 2147483647) / 2147483647;
    const U = (a, b) => a + (b - a) * rnd();
    const f = (n) => n.toFixed(1);
    const n = [6, 7, 7, 8][Math.floor(U(0, 3.99))];
    const off = U(0, 6.28), seg = 2 * Math.PI / n, R = 44, r0 = 15;
    let d = '';
    for (let i = 0; i < n; i++) {
      const a = off + i * seg + U(-0.08, 0.08), Ri = R * U(0.82, 1.05), sp = seg * 0.5 * U(0.85, 1), w = sp * U(1.25, 1.5);
      const b1 = [r0 * Math.cos(a - sp), r0 * Math.sin(a - sp)], b2 = [r0 * Math.cos(a + sp), r0 * Math.sin(a + sp)];
      const c1 = [Ri * 1.12 * Math.cos(a - w), Ri * 1.12 * Math.sin(a - w)], c2 = [Ri * 1.12 * Math.cos(a + w), Ri * 1.12 * Math.sin(a + w)];
      d += (i === 0 ? `M${f(b1[0])} ${f(b1[1])} ` : `Q${f(b1[0] * 0.8)} ${f(b1[1] * 0.8)} ${f(b1[0])} ${f(b1[1])} `) +
        `C${f(c1[0])} ${f(c1[1])} ${f(c2[0])} ${f(c2[1])} ${f(b2[0])} ${f(b2[1])} `;
    }
    d += 'Z';
    const cx = U(-2, 2), cy = U(-2, 2), k = 7, p = [];
    for (let i = 0; i < k; i++) { const a = i * 2 * Math.PI / k, rr = 16 * U(0.92, 1.06); p.push([cx + rr * Math.cos(a), cy + rr * Math.sin(a)]); }
    let c = `M${f((p[0][0] + p[k - 1][0]) / 2)} ${f((p[0][1] + p[k - 1][1]) / 2)} `;
    for (let i = 0; i < k; i++) { const a = p[i], b = p[(i + 1) % k]; c += `Q${f(a[0])} ${f(a[1])} ${f((a[0] + b[0]) / 2)} ${f((a[1] + b[1]) / 2)} `; }
    c += 'Z';
    return `<svg width="${size}" height="${size}" viewBox="-52 -52 104 104" aria-hidden="true">` +
      `<path class="petal" d="${d}" stroke-width="3.2" stroke-linejoin="round"/>` +
      `<path class="heart" d="${c}" stroke-width="3.2" stroke-linejoin="round"/></svg>`;
  }

  function renderGarden() {
    const items = state.used.slice().reverse();
    // bovenaan groeit er per gekozen vraagje een bloemetje bij (max. 5)
    Array.from(el.flowers.children).forEach((img, i) => { img.style.opacity = i < items.length ? 1 : 0; });

    el.list.innerHTML = '';
    if (!items.length) {
      const li = document.createElement('li');
      li.className = 'garden-empty';
      li.innerHTML = '<strong>je tuin is nog leeg</strong><span>kies een vraagje en plant je eerste bloemetje</span>';
      el.list.appendChild(li);
      return;
    }
    for (const u of items) {
      const li = document.createElement('li');
      li.className = 'garden-item';
      const icon = currentTheme() === 'krijt'
        ? `<img src="${FRUIT[u.id % FRUIT.length]}" alt="" width="44" height="44">`
        : daisySVG(u.id, 40);
      li.innerHTML = icon + '<div><span class="when"></span><span class="what"></span></div>';
      li.querySelector('.when').textContent = dayMonth(u.date);
      li.querySelector('.what').textContent = PROMPTS[u.id] || '';
      el.list.appendChild(li);
    }
  }

  // ---------- Navigatie ----------
  function show(view) {
    const isToday = view === 'today';
    el.today.hidden = !isToday;
    el.garden.hidden = isToday;
    el.tabToday.classList.toggle('is-active', isToday);
    el.tabGarden.classList.toggle('is-active', !isToday);
    el.tabToday.toggleAttribute('aria-current', isToday);
    el.tabGarden.toggleAttribute('aria-current', !isToday);
    if (isToday) { startDayIfNeeded(); renderToday(false); } else renderGarden();
  }

  // ---------- Acties ----------
  el.shuffle.addEventListener('click', () => {
    startDayIfNeeded();
    if (state.picked || state.spent >= PLUCKS_PER_DAY) return;
    const next = randomUnused(state.current);
    if (next === null) return;
    state.current = next;
    state.spent += 1;
    save();
    renderToday(true);
  });

  el.pick.addEventListener('click', () => {
    startDayIfNeeded();
    if (state.picked || state.current === null) return;
    state.picked = true;
    state.used.push({ id: state.current, date: state.day });
    save();
    renderToday(false);
  });

  el.toGarden.addEventListener('click', () => show('garden'));
  el.tabToday.addEventListener('click', () => show('today'));
  el.tabGarden.addEventListener('click', () => show('garden'));

  // themamenu
  const menu = $('theme-menu');
  function setMenu(open) {
    menu.hidden = !open;
    el.themeBtn.setAttribute('aria-expanded', String(open));
    if (open) {
      const cur = menu.querySelector('[aria-checked="true"]') || menu.querySelector('.theme-opt');
      cur.focus();
    }
  }
  el.themeBtn.addEventListener('click', (e) => { e.stopPropagation(); setMenu(menu.hidden); });
  menu.querySelectorAll('.theme-opt').forEach((b) => b.addEventListener('click', (e) => {
    e.stopPropagation();
    const next = b.dataset.theme;
    applyTheme(next);
    try { localStorage.setItem(THEME_KEY, next); } catch (err) { /* privé-modus */ }
    setMenu(false);
    el.themeBtn.focus();
    el.themeBtn.classList.remove('spin');
    void el.themeBtn.offsetWidth;
    el.themeBtn.classList.add('spin');
    if (!el.today.hidden) renderToday(false); else renderGarden();
    // andere lettertypes hebben een andere breedte: vraagje opnieuw passend maken
    if (document.fonts) document.fonts.ready.then(() => { if (!el.today.hidden) fitPrompt(); });
  }));
  document.addEventListener('click', () => { if (!menu.hidden) setMenu(false); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !menu.hidden) { setMenu(false); el.themeBtn.focus(); } });

  el.restart.addEventListener('click', () => {
    state = { used: [], day: null, current: null, spent: 0, picked: false };
    save();
    show('today');
  });

  // Als de app de hele nacht openstaat: bij terugkomen een nieuwe dag starten
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden && state.day !== todayKey()) show(el.today.hidden ? 'garden' : 'today');
  });

  // Wacht op de lettertypes, zodat lange vraagjes juist passen
  (document.fonts ? document.fonts.ready : Promise.resolve()).then(() => renderToday(false));
  show('today');

  // Offline werken + installeren op je beginscherm
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => navigator.serviceWorker.register('sw.js').catch(() => {}));
  }
})();
