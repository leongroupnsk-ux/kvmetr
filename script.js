function qs(sel, root = document) { return root.querySelector(sel); }
function qsa(sel, root = document) { return Array.from(root.querySelectorAll(sel)); }

function onClickOutside(el, handler) {
  const fn = (e) => { if (!el.contains(e.target)) handler(e); };
  document.addEventListener('mousedown', fn);
  return () => document.removeEventListener('mousedown', fn);
}

function formatPhoneInput(input) {
  const digits = (input.value || "").replace(/\D/g, "").slice(0, 11);
  const d = digits.startsWith("8") ? "7" + digits.slice(1) : digits;
  const p = d.startsWith("7") ? d.slice(1) : d;
  const a = p.slice(0, 3), b = p.slice(3, 6), c = p.slice(6, 8), e = p.slice(8, 10);
  let out = "+7";
  if (a) out += ` (${a}`;
  if (a && a.length === 3) out += ")";
  if (b) out += ` ${b}`;
  if (c) out += `-${c}`;
  if (e) out += `-${e}`;
  input.value = out;
}

function initDropdowns() {
  qsa('[data-dd]').forEach(dd => {
    const btn = qs('button', dd);
    const cleanup = onClickOutside(dd, () => dd.classList.remove('open'));
    btn?.addEventListener('click', () => dd.classList.toggle('open'));
    dd.addEventListener('keydown', (e) => { if (e.key === 'Escape') dd.classList.remove('open'); });
    window.addEventListener('unload', cleanup, { once: true });
  });
}

function initModal() {
  const modal = qs('[data-modal]');
  if (!modal) return;
  const close = () => modal.classList.remove('open');
  const open = () => modal.classList.add('open');
  qsa('[data-open-modal]').forEach(btn => btn.addEventListener('click', () => open()));
  qsa('[data-close-modal]').forEach(btn => btn.addEventListener('click', () => close()));
  qs('.modal-backdrop', modal)?.addEventListener('click', () => close());
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') close(); });
}

function initEstimateToggles() {
  qsa('[data-estimate]').forEach(block => {
    const wrap = qs('[data-table]', block);
    const btn = qs('[data-toggle]', block);
    if (!wrap || !btn) return;
    const setExpanded = (expanded) => {
      wrap.classList.toggle('table-expanded', expanded);
      wrap.classList.toggle('table-collapsed', !expanded);
      btn.textContent = expanded ? "Свернуть" : "Посмотреть полностью";
      btn.setAttribute('aria-expanded', expanded ? "true" : "false");
    };
    setExpanded(false);
    btn.addEventListener('click', () => setExpanded(!wrap.classList.contains('table-expanded')));
  });
}

function initStepsLightbox() {
  const steps = qsa('[data-step]');
  if (!steps.length) return;
  steps.forEach(step => {
    step.addEventListener('click', () => {
      steps.forEach(s => s.classList.remove('active'));
      step.classList.add('active');
      if (step.getAttribute('data-step') === '5') qs('[data-open-modal]')?.click();
    });
  });
}

function initTestimonials() {
  const root = qs('[data-testimonials]');
  if (!root) return;
  const items = [
    { q: "Смета не выросла, сдали на 2 недели раньше.", who: "Иван, ремонт 3‑к квартиры" },
    { q: "Фото каждый день, очень прозрачный процесс. Исполнители — аккуратные.", who: "Мария, студия" },
    { q: "Понравилось, что договор и акты скрытых работ — без “серых зон”.", who: "Алексей, 2‑к квартира" }
  ];
  let idx = 0;
  const q = qs('[data-q]', root);
  const who = qs('[data-who]', root);
  const set = () => {
    if (q) q.textContent = `“${items[idx].q}”`;
    if (who) who.textContent = `— ${items[idx].who}`;
  };
  set();
  qs('[data-prev]', root)?.addEventListener('click', () => { idx = (idx - 1 + items.length) % items.length; set(); });
  qs('[data-next]', root)?.addEventListener('click', () => { idx = (idx + 1) % items.length; set(); });
}

function initCompareSlider() {
  const root = qs('[data-compare]');
  if (!root) return;
  const range = qs('input[type="range"]', root);
  const mask = qs('[data-mask]', root);
  const divider = qs('[data-divider]', root);
  if (!range || !mask || !divider) return;
  const apply = () => {
    const v = Number(range.value);
    mask.style.width = `${v}%`;
    divider.style.left = `${v}%`;
  };
  range.addEventListener('input', apply);
  apply();
}

function initBlogFilters() {
  const root = qs('[data-blog]');
  if (!root) return;
  const buttons = qsa('[data-filter]', root);
  const cards = qsa('[data-post]', root);
  const select = qs('[data-filter-select]', root);
  const apply = (cat) => {
    buttons.forEach(b => b.classList.toggle('active', b.getAttribute('data-filter') === cat));
    cards.forEach(c => {
      const ccat = c.getAttribute('data-cat') || 'all';
      c.style.display = (cat === 'all' || ccat === cat) ? "" : "none";
    });
    if (select) select.value = cat;
  };
  buttons.forEach(b => b.addEventListener('click', () => apply(b.getAttribute('data-filter'))));
  select?.addEventListener('change', () => apply(select.value));
  apply('all');
}

function initLeadForms() {
  qsa('form[data-lead]').forEach(form => {
    const phone = qs('input[type="tel"]', form);
    if (phone) phone.addEventListener('input', () => formatPhoneInput(phone));
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const btn = qs('button[type="submit"]', form);
      if (!btn) return;
      const prev = btn.textContent;
      btn.textContent = "Отправлено";
      btn.disabled = true;
      setTimeout(() => { btn.textContent = prev; btn.disabled = false; }, 1700);
    });
  });
}

function initExitIntentPopup() {
  const popup = qs('[data-popup]');
  if (!popup) return;
  const key = "rw_popup_seen_v1";
  const seen = () => sessionStorage.getItem(key) === "1";
  const markSeen = () => sessionStorage.setItem(key, "1");
  const open = () => { if (!seen()) { popup.classList.add('open'); markSeen(); } };
  const close = () => popup.classList.remove('open');
  qs('[data-popup-close]', popup)?.addEventListener('click', close);
  qs('form', popup)?.addEventListener('submit', (e) => { e.preventDefault(); close(); });
  setTimeout(() => open(), 30000);
  let armed = true;
  document.addEventListener('mouseleave', (e) => {
    if (!armed) return;
    if (e.clientY <= 0) open();
    armed = false;
  });
}

function initMobileMenu() {
  const burger = qs('[data-burger]');
  const modal = qs('[data-mobile-nav]');
  if (!burger || !modal) return;
  const open = () => modal.classList.add('open');
  const close = () => modal.classList.remove('open');
  burger.addEventListener('click', open);
  qs('[data-mobile-close]', modal)?.addEventListener('click', close);
  qs('.modal-backdrop', modal)?.addEventListener('click', close);
  document.addEventListener('keydown', (e) => { if (e.key === "Escape") close(); });
}

function initComms3D() {
  const canvas = qs('[data-comms-canvas]');
  if (!canvas) return;

  const ctx = canvas.getContext('2d', { alpha: true });
  if (!ctx) return;

  let w = 0, h = 0, dpr = 1;
  let raf = 0;
  const start = performance.now();

  const resize = () => {
    const rect = canvas.getBoundingClientRect();
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = Math.max(1, Math.floor(rect.width * dpr));
    h = Math.max(1, Math.floor(rect.height * dpr));
    canvas.width = w;
    canvas.height = h;
  };

  const iso = (x, y, z) => {
    // simple isometric projection
    const cx = w * 0.5;
    const cy = h * 0.55;
    const sx = (x - y) * 0.9;
    const sy = (x + y) * 0.45 - z;
    return { x: cx + sx, y: cy + sy };
  };

  const line = (a, b, color, width, alpha = 1) => {
    ctx.strokeStyle = color;
    ctx.globalAlpha = alpha;
    ctx.lineWidth = width;
    ctx.beginPath();
    ctx.moveTo(a.x, a.y);
    ctx.lineTo(b.x, b.y);
    ctx.stroke();
    ctx.globalAlpha = 1;
  };

  const dot = (p, r, color, alpha = 1) => {
    ctx.fillStyle = color;
    ctx.globalAlpha = alpha;
    ctx.beginPath();
    ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
  };

  const draw = (tMs) => {
    const t = (tMs - start) / 1000;
    ctx.clearRect(0, 0, w, h);

    // base haze
    const g = ctx.createRadialGradient(w * 0.35, h * 0.35, 10, w * 0.35, h * 0.35, Math.max(w, h) * 0.8);
    g.addColorStop(0, 'rgba(79,121,66,0.14)');
    g.addColorStop(0.55, 'rgba(79,121,66,0.05)');
    g.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);

    // isometric grid
    ctx.lineCap = 'round';
    for (let i = -10; i <= 10; i++) {
      const a1 = iso(-240, i * 22, 0);
      const b1 = iso(240, i * 22, 0);
      const a2 = iso(i * 22, -240, 0);
      const b2 = iso(i * 22, 240, 0);
      line(a1, b1, 'rgba(255,255,255,0.10)', 1 * dpr, 0.55);
      line(a2, b2, 'rgba(255,255,255,0.10)', 1 * dpr, 0.55);
    }

    // “pipes” network (a few polylines)
    const routes = [
      [{ x: -160, y: -40, z: 0 }, { x: -60, y: -40, z: 0 }, { x: 30, y: 30, z: 28 }, { x: 120, y: 30, z: 28 }],
      [{ x: -120, y: 110, z: 0 }, { x: -30, y: 110, z: 0 }, { x: 50, y: 40, z: 36 }, { x: 150, y: 40, z: 36 }],
      [{ x: -40, y: -140, z: 0 }, { x: -40, y: -40, z: 0 }, { x: 10, y: 10, z: 20 }, { x: 10, y: 120, z: 20 }]
    ];

    const pipeColor = 'rgba(146,199,130,0.75)';
    const brass = 'rgba(197,160,89,0.75)';
    const pipeW = 2.2 * dpr;

    routes.forEach((pts, ri) => {
      for (let i = 0; i < pts.length - 1; i++) {
        const a = iso(pts[i].x, pts[i].y, pts[i].z);
        const b = iso(pts[i + 1].x, pts[i + 1].y, pts[i + 1].z);
        line(a, b, pipeColor, pipeW, 0.8);
      }

      // nodes
      pts.forEach((p, i) => {
        const pp = iso(p.x, p.y, p.z);
        dot(pp, 3.2 * dpr, 'rgba(255,255,255,0.85)', 0.8);
        dot(pp, 6.5 * dpr, ri === 1 ? brass : pipeColor, 0.12);
        if (i === 0 || i === pts.length - 1) dot(pp, 4.2 * dpr, ri === 1 ? brass : pipeColor, 0.45);
      });

      // moving “signal”
      const speed = 0.22 + ri * 0.04;
      const phase = (t * speed + ri * 0.28) % 1;
      const segs = pts.length - 1;
      const segFloat = phase * segs;
      const si = Math.min(segs - 1, Math.floor(segFloat));
      const f = segFloat - si;
      const p0 = pts[si];
      const p1 = pts[si + 1];
      const sp = iso(
        p0.x + (p1.x - p0.x) * f,
        p0.y + (p1.y - p0.y) * f,
        p0.z + (p1.z - p0.z) * f
      );

      dot(sp, 3.8 * dpr, 'rgba(255,255,255,0.95)', 0.95);
      dot(sp, 11 * dpr, ri === 1 ? 'rgba(197,160,89,1)' : 'rgba(79,121,66,1)', 0.10);
    });

    // subtle scanline
    ctx.globalAlpha = 0.10;
    ctx.fillStyle = 'rgba(255,255,255,0.10)';
    const y = (Math.sin(t * 0.9) * 0.5 + 0.5) * h;
    ctx.fillRect(0, y, w, 2 * dpr);
    ctx.globalAlpha = 1;

    raf = requestAnimationFrame(draw);
  };

  const ro = new ResizeObserver(() => resize());
  ro.observe(canvas);
  resize();
  raf = requestAnimationFrame(draw);

  window.addEventListener('unload', () => {
    cancelAnimationFrame(raf);
    ro.disconnect();
  }, { once: true });
}

document.addEventListener('DOMContentLoaded', () => {
  initDropdowns();
  initModal();
  initEstimateToggles();
  initStepsLightbox();
  initTestimonials();
  initCompareSlider();
  initBlogFilters();
  initLeadForms();
  initExitIntentPopup();
  initMobileMenu();
  initComms3D();
});

