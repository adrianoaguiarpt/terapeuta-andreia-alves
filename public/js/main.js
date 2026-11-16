(() => {
  'use strict';

  // --- Menu móvel
  const toggle = document.querySelector('.menu-toggle');
  const nav = document.getElementById('menu');
  if (toggle && nav) {
    const label = toggle.querySelector('.sr-only');
    const set = (open) => {
      toggle.setAttribute('aria-expanded', String(open));
      nav.classList.toggle('open', open);
      if (label) label.textContent = open ? 'Fechar menu' : 'Abrir menu';
    };
    toggle.addEventListener('click', () => set(toggle.getAttribute('aria-expanded') !== 'true'));
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') set(false); });
    nav.addEventListener('click', (e) => { if (e.target.closest('a')) set(false); });
  }

  // --- Sombra no header ao rolar
  const header = document.querySelector('.header');
  if (header) {
    const onScroll = () => header.classList.toggle('scrolled', window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  // --- Animações suaves ao rolar
  const els = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    els.forEach((el) => io.observe(el));
  } else {
    els.forEach((el) => el.classList.add('in'));
  }

  // --- Carrossel de fotos (troca a cada 3,5 s; pára ao passar o rato/foco; respeita "reduzir movimento")
  document.querySelectorAll('[data-carousel]').forEach((car) => {
    const slides = [...car.querySelectorAll('.slide')];
    const dots = [...car.querySelectorAll('.carousel-dots button')];
    if (slides.length < 2) return;
    slides.forEach((s) => { const img = s.querySelector('img'); if (img) img.loading = 'eager'; });
    let i = 0;
    let timer = null;
    const show = (n) => {
      i = (n + slides.length) % slides.length;
      slides.forEach((s, k) => { s.classList.toggle('is-active', k === i); s.setAttribute('aria-hidden', String(k !== i)); });
      dots.forEach((d, k) => d.setAttribute('aria-current', String(k === i)));
    };
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const start = () => { if (!reduce && !timer) timer = setInterval(() => show(i + 1), 3500); };
    const stop = () => { clearInterval(timer); timer = null; };
    dots.forEach((d, k) => d.addEventListener('click', () => { show(k); stop(); start(); }));
    car.addEventListener('mouseenter', stop);
    car.addEventListener('mouseleave', start);
    car.addEventListener('focusin', stop);
    car.addEventListener('focusout', start);
    document.addEventListener('visibilitychange', () => (document.hidden ? stop() : start()));
    start();
  });

  // --- Aviso de cookies (só armazenamento essencial)
  const cookie = document.getElementById('cookie');
  const KEY = 'aviso-cookies-visto';
  let seen = false;
  try { seen = localStorage.getItem(KEY) === '1'; } catch (_) { /* privado / bloqueado */ }
  if (cookie && !seen) {
    cookie.hidden = false;
    document.getElementById('cookie-ok').addEventListener('click', () => {
      try { localStorage.setItem(KEY, '1'); } catch (_) { /* ignora */ }
      cookie.hidden = true;
    });
  }

  // --- Formulário de marcação
  const form = document.getElementById('form-marcacao');
  if (!form) return;

  const dateInput = form.querySelector('[name="data"]');
  if (dateInput) dateInput.min = new Date().toISOString().slice(0, 10);

  // Pré-seleciona a terapia se vier no URL: /contactos?terapia=Acupuntura#marcacao
  const pre = new URLSearchParams(location.search).get('terapia');
  if (pre) {
    const sel = form.querySelector('[name="terapia"]');
    const opt = [...sel.options].find((o) => o.text.toLowerCase() === pre.toLowerCase());
    if (opt) sel.value = opt.value || opt.text;
  }

  const status = form.querySelector('.form-status');
  const btn = form.querySelector('button[type="submit"]');

  const MSG = {
    nome: 'Indique o seu nome.',
    telefone: 'Indique um telefone válido (ex.: 912 345 678).',
    email: 'O e-mail não parece válido.',
    terapia: 'Escolha a terapia.',
    zona: 'Escolha a zona.',
    consentimento: 'É necessário aceitar a Política de Privacidade.',
  };

  function setError(field, msg) {
    const wrap = field.closest('.field');
    let err = wrap.querySelector('.err');
    if (msg) {
      field.setAttribute('aria-invalid', 'true');
      if (!err) {
        err = document.createElement('span');
        err.className = 'err';
        err.id = field.id + '-err';
        wrap.appendChild(err);
        field.setAttribute('aria-describedby', err.id);
      }
      err.textContent = msg;
    } else {
      field.removeAttribute('aria-invalid');
      if (err) err.remove();
      field.removeAttribute('aria-describedby');
    }
  }

  function validate() {
    let first = null;
    const tel = form.telefone.value.replace(/[\s().-]/g, '');
    const checks = {
      nome: form.nome.value.trim().length >= 2,
      telefone: /^\+?\d{9,15}$/.test(tel),
      email: !form.email.value.trim() || /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(form.email.value.trim()),
      terapia: !!form.terapia.value,
      zona: !!form.zona.value,
      consentimento: form.consentimento.checked,
    };
    Object.entries(checks).forEach(([name, ok]) => {
      const f = form.elements[name];
      setError(f, ok ? '' : MSG[name]);
      if (!ok && !first) first = f;
    });
    if (first) first.focus();
    return !first;
  }

  form.addEventListener('input', (e) => {
    if (e.target.getAttribute('aria-invalid') === 'true') setError(e.target, '');
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    status.className = 'form-status';
    status.textContent = '';
    if (!validate()) return;

    // Sem servidor (pré-visualização no GitHub Pages): envia o pedido por WhatsApp
    if (document.documentElement.dataset.mode === 'static') {
      const linhas = [
        'Olá! Gostaria de marcar uma consulta.',
        `Nome: ${form.nome.value.trim()}`,
        `Telefone: ${form.telefone.value.trim()}`,
        form.email.value.trim() && `E-mail: ${form.email.value.trim()}`,
        `Terapia: ${form.terapia.value}`,
        `Zona: ${form.zona.value}`,
        form.data.value && `Data preferida: ${form.data.value.split('-').reverse().join('/')}`,
        form.mensagem.value.trim() && `Mensagem: ${form.mensagem.value.trim()}`,
      ].filter(Boolean);
      window.open(`https://wa.me/351938324438?text=${encodeURIComponent(linhas.join('\n'))}`, '_blank', 'noopener');
      status.classList.add('ok');
      status.textContent = 'A abrir o WhatsApp com o seu pedido — basta carregar em enviar.';
      return;
    }

    btn.disabled = true;
    const original = btn.textContent;
    btn.textContent = 'A enviar…';
    try {
      const data = Object.fromEntries(new FormData(form));
      data.consentimento = form.consentimento.checked;
      const res = await fetch(form.action, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || !json.ok) throw new Error(json.erro || 'Não foi possível enviar.');
      form.reset();
      status.classList.add('ok');
      status.textContent = 'Obrigada! Recebi o seu pedido e entrarei em contacto em breve para confirmar.';
    } catch (err) {
      status.classList.add('error');
      status.textContent = `${err.message} Pode também ligar para +351 938 324 438 ou usar o WhatsApp.`;
    } finally {
      btn.disabled = false;
      btn.textContent = original;
    }
  });
})();
