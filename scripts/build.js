// Gera as páginas estáticas em /public a partir de src/data.js.
// Uso: npm run build
const fs = require('fs');
const path = require('path');
const { SITE, ZONAS, TERAPIAS, PACOTES, TESTEMUNHOS, PH } = require('../src/data');

const OUT = path.join(__dirname, '..', 'public');
// Pré-visualização em alojamento estático (GitHub Pages):
//   BASE_PATH=/terapeuta-andreia-alves STATIC_HOST=1 npm run build
// Prefixa os links com o subcaminho, não deixa o Google indexar e o formulário envia por WhatsApp.
const BASE = (process.env.BASE_PATH || '').replace(/\/$/, '');
const STATIC = Boolean(process.env.STATIC_HOST);
const withBase = (html) => !BASE ? html : html
  .replace(/\b(href|src|action)="\/(?!\/)/g, `$1="${BASE}/`)
  .replace(/\b(srcset|imagesrcset)="([^"]*)"/g, (m, a, v) => `${a}="${v.replace(/(^|,\s*)\//g, `$1${BASE}/`)}"`);
const ANO = new Date().getFullYear();
const HOJE = new Date().toISOString().slice(0, 10);
const crypto = require('crypto');
const ver = (f) => crypto.createHash('md5').update(fs.readFileSync(path.join(OUT, f))).digest('hex').slice(0, 8);
const CSS_V = ver('css/style.css');
const JS_V = ver('js/main.js');
const CIDADES_CURTO = 'Porto, Maia, Gaia e Chaves';

// ---------- helpers ----------
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const IMGS = {
  'andreia-retrato': [1000, 1500],
  'andreia-massagem-costas': [1000, 1500],
  'andreia-acupuntura': [1000, 1500],
  'andreia-eletroacupuntura': [1000, 1500],
  'massagem-relaxamento': [1366, 768, 1000],
  'espaco-relax': [1920, 1278, 1000],
};
function img(name, alt, { sizes = '100vw', eager = false, cls = '' } = {}) {
  const [W, H, small = 600] = IMGS[name];
  const big = W;
  const srcset = `/img/${name}-${small}.webp ${small}w, /img/${name}-${big}.webp ${big}w`;
  return `<img src="/img/${name}-${big}.webp" srcset="${srcset}" sizes="${sizes}" width="${W}" height="${H}" alt="${esc(alt)}"${cls ? ` class="${cls}"` : ''} ${eager ? 'fetchpriority="high"' : 'loading="lazy"'} decoding="async">`;
}

const ICON = {
  leaf: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 19c0-8 5-14 14-14 0 9-6 14-14 14Z"/><path d="M5 19 13 11"/></svg>',
  phone: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2Z"/></svg>',
  mail: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/></svg>',
  clock: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>',
  pin: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 21s7-6.2 7-12a7 7 0 0 0-14 0c0 5.8 7 12 7 12Z"/><circle cx="12" cy="9" r="2.5"/></svg>',
  home: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m3 11 9-7 9 7"/><path d="M5 10v10h14V10"/><path d="M10 20v-6h4v6"/></svg>',
  hand: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 11V6a1.5 1.5 0 0 1 3 0v5m0-6V4a1.5 1.5 0 0 1 3 0v7m0-5.5a1.5 1.5 0 0 1 3 0V12m0-3a1.5 1.5 0 0 1 3 0v5a7 7 0 0 1-7 7h-1a7 7 0 0 1-5.6-2.8L3.5 14a1.5 1.5 0 0 1 2.4-1.8L7 13.5"/></svg>',
  cloud: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 18a4 4 0 0 1-.6-8A6 6 0 0 1 18 9a4.5 4.5 0 0 1-.5 9Z"/></svg>',
  star: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m12 3 2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1-4.4-4.3 6.1-.9Z"/></svg>',
  award: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="9" r="6"/><path d="m8.5 14-1.5 7 5-3 5 3-1.5-7"/></svg>',
  fb: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M14 8h3V4h-3a4 4 0 0 0-4 4v3H7v4h3v6h4v-6h3l1-4h-4V8Z"/></svg>',
  wa: '<svg viewBox="0 0 32 32" aria-hidden="true"><path fill="currentColor" stroke="none" d="M16 3a13 13 0 0 0-11.2 19.6L3 29l6.6-1.7A13 13 0 1 0 16 3Zm0 23.7c-2 0-3.9-.5-5.6-1.5l-.4-.2-3.9 1 1-3.8-.3-.4A10.7 10.7 0 1 1 16 26.7Zm5.9-8c-.3-.2-1.9-1-2.2-1-.3-.1-.5-.2-.7.2l-1 1.2c-.2.2-.4.3-.7.1-.3-.2-1.4-.5-2.6-1.6-1-.9-1.6-1.9-1.8-2.2-.2-.3 0-.5.1-.7l.5-.6.3-.5c.1-.2 0-.4 0-.6l-1-2.4c-.3-.6-.5-.5-.7-.5h-.6c-.2 0-.6.1-.9.4-.3.3-1.1 1.1-1.1 2.7s1.2 3.2 1.3 3.4c.2.2 2.3 3.5 5.6 4.9 2.8 1.1 3.3.9 3.9.8.6-.1 1.9-.8 2.2-1.5.3-.7.3-1.4.2-1.5-.1-.2-.3-.3-.6-.4Z"/></svg>',
  arrow: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14m-6-6 6 6-6 6"/></svg>',
};

const LOGO = `<svg class="logo-mark" viewBox="0 0 40 40" aria-hidden="true"><path d="M20 4c4 4 5 9 0 17-5-8-4-13 0-17Z"/><path d="M19 22C13 21 8 17 6 11c6 0 11 3 13 11Z"/><path d="M21 22c6-1 11-5 13-11-6 0-11 3-13 11Z"/><path d="M20 21v15" fill="none"/></svg>`;

const NAV = [
  ['/', 'Início'],
  ['/sobre', 'Sobre mim'],
  ['/terapias', 'Terapias'],
  ['/testemunhos', 'Testemunhos'],
  ['/contactos', 'Contactos'],
];

// ---------- partes comuns ----------
const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'HealthAndBeautyBusiness',
  '@id': `${SITE.url}/#negocio`,
  name: SITE.marca,
  description: 'Massagens terapêuticas, acupuntura e Medicina Tradicional Chinesa no Porto, Maia, Vila Nova de Gaia, Matosinhos, Chaves e Norte de Portugal. Consultas ao domicílio por marcação.',
  url: SITE.url,
  image: `${SITE.url}/img/og-image.jpg`,
  logo: `${SITE.url}/img/logo-andreia-alves.webp`,
  telephone: SITE.telefoneLink,
  email: SITE.email,
  priceRange: '€€',
  address: { '@type': 'PostalAddress', streetAddress: `${SITE.morada.linha1}, ${SITE.morada.linha2}`, postalCode: SITE.morada.codigoPostal, addressLocality: SITE.morada.localidade, addressRegion: 'Porto', addressCountry: 'PT' },
  hasMap: SITE.mapa,
  areaServed: ZONAS.map((z) => ({ '@type': 'City', name: z.nome })),
  openingHoursSpecification: [{
    '@type': 'OpeningHoursSpecification',
    dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
    opens: '10:00', closes: '22:00',
  }],
  sameAs: [SITE.facebook],
  hasOfferCatalog: {
    '@type': 'OfferCatalog', name: 'Terapias',
    itemListElement: TERAPIAS.map((t) => ({ '@type': 'Offer', itemOffered: { '@type': 'Service', name: t.nome } })),
  },
};

function head({ title, desc, pathName, extraHead = '' }) {
  const canonical = SITE.url + (pathName === '/' ? '/' : pathName);
  return `<!doctype html>
<html lang="pt-PT"${STATIC ? ' data-mode="static"' : ''}>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">${STATIC ? '\n<meta name="robots" content="noindex, nofollow">' : ''}
<title>${esc(title)}</title>
<meta name="description" content="${esc(desc)}">
<link rel="canonical" href="${canonical}">
<meta name="theme-color" content="#4f6b57">
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<link rel="icon" href="/favicon.ico" sizes="32x32">
<link rel="apple-touch-icon" href="/apple-touch-icon.png">
<meta property="og:type" content="website">
<meta property="og:locale" content="pt_PT">
<meta property="og:site_name" content="${esc(SITE.marca)}">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(desc)}">
<meta property="og:url" content="${canonical}">
<meta property="og:image" content="${SITE.url}/img/og-image.jpg">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="Massagem de relaxamento à luz de velas">
<meta name="twitter:card" content="summary_large_image">
<link rel="preload" href="/fonts/cormorant-garamond-latin-600-normal.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="/fonts/nunito-sans-latin-400-normal.woff2" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="/css/style.css?v=${CSS_V}">
${extraHead}<script type="application/ld+json">${JSON.stringify(jsonLd)}</script>
<script>document.documentElement.classList.add('js')</script>
</head>`;
}

function header(pathName) {
  const links = NAV.map(([href, label]) =>
    `<li><a href="${href}"${href === pathName ? ' aria-current="page"' : ''}>${label}</a></li>`).join('');
  return `<a class="skip" href="#conteudo">Saltar para o conteúdo</a>
<div class="topbar"><div class="wrap">
  <span>${ICON.clock} ${SITE.horario}</span>
  <a href="tel:${SITE.telefoneLink}">${ICON.phone} ${SITE.telefone}</a>
</div></div>
<header class="header">
  <div class="wrap header-in">
    <a class="brand" href="/">${LOGO}<span><strong>Andreia Alves</strong><small>${SITE.slogan}</small></span></a>
    <nav class="nav" id="menu" aria-label="Menu principal"><ul>${links}</ul></nav>
    <a class="btn btn-sm header-cta" href="/contactos#marcacao">Marcar consulta</a>
    <button class="menu-toggle" type="button" aria-expanded="false" aria-controls="menu"><span class="sr-only">Abrir menu</span><span class="bars" aria-hidden="true"></span></button>
  </div>
</header>`;
}

const ctaBand = () => `<section class="cta-band" aria-labelledby="cta-titulo">
  <div class="wrap cta-in reveal">
    <div>
      <p class="eyebrow">Corpo e mente em harmonia</p>
      <h2 id="cta-titulo">Marque a sua consulta</h2>
      <p>Diga-me o que sente e onde prefere ser atendida/o — respondo no próprio dia.</p>
    </div>
    <div class="cta-actions">
      <a class="btn btn-light" href="/contactos#marcacao">Marcar consulta</a>
      <a class="btn btn-ghost-light" href="${SITE.whatsapp}" target="_blank" rel="noopener">${ICON.wa} WhatsApp</a>
    </div>
  </div>
</section>`;

function footer() {
  return `<footer class="footer">
  <div class="wrap footer-grid">
    <div>
      <a class="brand brand-footer" href="/">${LOGO}<span><strong>Andreia Alves</strong><small>${SITE.slogan}</small></span></a>
      <p>Massagens e Medicina Tradicional Chinesa com ${SITE.experiencia} de experiência.</p>
      <a class="social" href="${SITE.facebook}" target="_blank" rel="noopener">${ICON.fb}<span>Facebook</span></a>
    </div>
    <div>
      <h2 class="footer-h">Contactos</h2>
      <ul class="list-icons">
        <li>${ICON.phone}<a href="tel:${SITE.telefoneLink}">${SITE.telefone}</a></li>
        <li>${ICON.mail}<a href="mailto:${SITE.email}">${SITE.email}</a></li>
        <li>${ICON.pin}<a href="${SITE.mapa}" target="_blank" rel="noopener">${SITE.morada.linha1}, ${SITE.morada.linha2}<br>${SITE.morada.codigoPostal} ${SITE.morada.localidade}</a></li>
        <li>${ICON.clock}<span>${SITE.horario}</span></li>
      </ul>
    </div>
    <div>
      <h2 class="footer-h">Zonas</h2>
      <p class="zonas-inline">${ZONAS.map((z) => z.nome).join(' · ')}</p>
      <p class="small">Consultas ao domicílio por marcação.</p>
    </div>
    <div>
      <h2 class="footer-h">Páginas</h2>
      <ul class="footer-links">${NAV.map(([h, l]) => `<li><a href="${h}">${l}</a></li>`).join('')}<li><a href="/politica-privacidade">Política de Privacidade</a></li></ul>
    </div>
  </div>
  <div class="wrap footer-bottom">
    <p>© ${ANO} ${SITE.marca}. Todos os direitos reservados.</p>
    <p><a href="/politica-privacidade">Privacidade e cookies</a></p>
  </div>
</footer>
<a class="wa-float" href="${SITE.whatsapp}" target="_blank" rel="noopener" aria-label="Falar por WhatsApp">${ICON.wa}</a>
<div class="cookie" id="cookie" role="region" aria-label="Aviso de cookies" hidden>
  <p>Este site usa apenas armazenamento essencial ao seu funcionamento — sem cookies de publicidade nem de análise. <a href="/politica-privacidade#cookies">Saber mais</a></p>
  <button class="btn btn-sm" type="button" id="cookie-ok">Entendi</button>
</div>
<script src="/js/main.js?v=${JS_V}" defer></script>
</body>
</html>`;
}

function page({ file, pathName, title, desc, body, extraHead, cta = true }) {
  const html = `${head({ title, desc, pathName, extraHead })}
<body>
${header(pathName)}
<main id="conteudo">
${body}
${cta ? ctaBand() : ''}
</main>
${footer()}`;
  fs.writeFileSync(path.join(OUT, file), withBase(html));
  console.log('✓', file);
}

// ---------- blocos reutilizáveis ----------
const testemunhoCard = (t) => `<figure class="quote reveal">
  <div class="stars" role="img" aria-label="5 estrelas">${ICON.star.repeat(5)}</div>
  <blockquote><p>${esc(t.texto)}</p></blockquote>
  <figcaption>${esc(t.nome)}</figcaption>
</figure>`;

const testemunhosSec = (n = 3, titulo = 'O que dizem os clientes') => `<section class="section section-sand" aria-labelledby="test-titulo">
  <div class="wrap">
    <div class="sec-head reveal">
      <p class="eyebrow">Testemunhos</p>
      <h2 id="test-titulo">${titulo}</h2>
    </div>
    <div class="quotes">${TESTEMUNHOS.slice(0, n).map(testemunhoCard).join('')}</div>
    <p class="center"><a class="link-arrow" href="/testemunhos">Ver todos os testemunhos ${ICON.arrow}</a></p>
  </div>
</section>`;

const cardFoto = (t) => `<figure class="card-media">
    <img src="${t.foto.src}" alt="${esc(t.foto.alt)}" width="800" height="600" loading="lazy" decoding="async"${t.foto.pos ? ` class="pos-${t.foto.pos}"` : ''}>
  </figure>`;

const terapiaCard = (t) => `<article class="card card-photo reveal" id="${t.id}">
  ${cardFoto(t)}
  <div class="card-body">
    <h3>${t.nome}</h3>
    <p>${t.desc}</p>
    <p class="card-benef"><strong>Benefícios:</strong> ${t.beneficios}</p>
    <p class="card-meta"><span>${ICON.clock} ${t.duracao}</span><span class="card-price">${t.preco}</span></p>
  </div>
</article>`;

const domicilioSec = (headingLevel = 'h2') => `<section class="section" id="domicilio" aria-labelledby="dom-titulo">
  <div class="wrap split">
    <div class="split-media reveal">${img('espaco-relax', 'Marquesa de massagem com toalha macia e flores de frangipani', { sizes: '(min-width: 900px) 50vw, 100vw' })}</div>
    <div class="reveal">
      <p class="eyebrow">Por marcação</p>
      <${headingLevel} id="dom-titulo">Massagem e acupuntura ao domicílio</${headingLevel}>
      <p>Prefere ser tratada/o no conforto da sua casa ou no hotel? Levo a marquesa e todo o material necessário — agulhas esterilizadas de uso único, óleos essenciais biológicos e música relaxante.</p>
      <div class="bonus">
        <span class="bonus-tag">Bónus</span>
        <p><strong>Deslocação grátis</strong> nas localidades onde tenho consultório:</p>
        <ul class="chips" aria-label="Localidades com deslocação grátis">${ZONAS.map((z) => `<li>${z.nome}</li>`).join('')}</ul>
      </div>
      <p class="note">${ICON.pin}<span>Fora destas localidades, o custo de deslocação depende da distância. Indique a sua morada ao marcar e envio o valor antes da confirmação.</span></p>
      <a class="btn" href="/contactos#marcacao">Pedir marcação ao domicílio</a>
    </div>
  </div>
</section>`;

// ---------- páginas ----------
fs.mkdirSync(OUT, { recursive: true });

// INÍCIO
page({
  file: 'index.html', pathName: '/',
  title: `Massagens e Acupuntura no ${CIDADES_CURTO} | Andreia Alves`,
  desc: 'Terapeuta de massagem e Medicina Tradicional Chinesa no Porto, Maia, Vila Nova de Gaia, Matosinhos e Chaves. Alívio da dor e relaxamento, também ao domicílio. Marque já.',
  extraHead: '<link rel="preload" as="image" href="/img/massagem-relaxamento-1366.webp" imagesrcset="/img/massagem-relaxamento-1000.webp 1000w, /img/massagem-relaxamento-1366.webp 1366w" imagesizes="(min-width: 900px) 55vw, 100vw" fetchpriority="high">\n',
  body: `<section class="hero">
  <div class="wrap hero-in">
    <div class="hero-text">
      <p class="eyebrow">Acupuntura · Massagem · Medicina Tradicional Chinesa</p>
      <h1>Alívio da dor e relaxamento, com tratamentos à sua medida</h1>
      <p class="lead">Sou a Andreia Alves, terapeuta com ${SITE.experiencia} de experiência. Atendo no ${CIDADES_CURTO.replace('Gaia', 'Vila Nova de Gaia')} e em mais zonas do Norte — também ao domicílio, com deslocação grátis onde tenho consultório.</p>
      <div class="hero-actions">
        <a class="btn" href="/contactos#marcacao">Marcar consulta</a>
        <a class="btn btn-ghost" href="/terapias">Ver terapias e preços</a>
      </div>
      <ul class="hero-facts">
        <li>${ICON.clock}<span>Todos os dias, 10h–22h</span></li>
        <li>${ICON.home}<span>Domicílio por marcação</span></li>
      </ul>
    </div>
    <div class="hero-media">
      ${img('massagem-relaxamento', 'Massagem de relaxamento ao rosto, num ambiente calmo à luz de velas', { sizes: '(min-width: 900px) 55vw, 100vw', eager: true })}
    </div>
  </div>
</section>

<section class="section" aria-labelledby="porque-titulo">
  <div class="wrap">
    <div class="sec-head reveal">
      <p class="eyebrow">Especialista em alívio da dor e relaxamento</p>
      <h2 id="porque-titulo">Um tratamento pensado para si</h2>
    </div>
    <div class="features">
      <div class="feature feature-photo reveal">
        <figure class="feature-media"><img src="/img/andreia-massagem-costas-600.webp" alt="Andreia Alves a avaliar as costas de um paciente antes da massagem" width="600" height="900" loading="lazy" decoding="async" class="pos-baixo"></figure>
        <div class="feature-body">${ICON.hand}<h3>Tratamento personalizado</h3><p>Cada sessão começa por ouvir as suas queixas e objetivos, para escolher as técnicas certas.</p></div>
      </div>
      <div class="feature feature-photo reveal">
        <figure class="feature-media"><img src="/img/espaco-relax-1000.webp" alt="Marquesa com toalha macia e flores, à luz de uma vela" width="1000" height="666" loading="lazy" decoding="async"></figure>
        <div class="feature-body">${ICON.cloud}<h3>Sinta-se nas nuvens</h3><p>Ambiente confortável, com música relaxante e óleos essenciais biológicos.</p></div>
      </div>
      <div class="feature feature-photo reveal">
        <figure class="feature-media"><img src="/img/oleos-essenciais.webp" alt="Frascos de óleos essenciais com ervas e flores" width="800" height="534" loading="lazy" decoding="async"></figure>
        <div class="feature-body">${ICON.leaf}<h3>Material de qualidade</h3><p>Agulhas esterilizadas de uso único, óleos de massagem selecionados e eletroacupuntura para melhores resultados.</p></div>
      </div>
      <div class="feature feature-photo reveal">
        <div class="feature-media carousel" data-carousel aria-roledescription="carrossel" aria-label="Fotos da Andreia Alves em consulta">
          ${[
            ['andreia-retrato', 'Andreia Alves, terapeuta, de bata branca e a sorrir', ''],
            ['andreia-acupuntura', 'Andreia Alves a aplicar acupuntura nas costas de um paciente', 'pos-baixo'],
            ['andreia-eletroacupuntura', 'Andreia Alves com o aparelho de eletroacupuntura', 'pos-baixo'],
            ['andreia-massagem-costas', 'Andreia Alves a preparar uma massagem às costas', ''],
          ].map(([n, alt, cls], i) => `<figure class="slide${i === 0 ? ' is-active' : ''}" aria-roledescription="diapositivo" aria-label="${i + 1} de 4"${i ? ' aria-hidden="true"' : ''}><img src="/img/${n}-600.webp" alt="${alt}" width="600" height="900" loading="lazy" decoding="async"${cls ? ` class="${cls}"` : ''}></figure>`).join('')}
          <div class="carousel-dots">${[1, 2, 3, 4].map((n) => `<button type="button" aria-label="Ver foto ${n}"${n === 1 ? ' aria-current="true"' : ''}></button>`).join('')}</div>
        </div>
        <div class="feature-body">${ICON.award}<h3>Terapeuta experiente</h3><p>Várias formações certificadas e ${SITE.experiencia} de prática em terapias complementares.</p></div>
      </div>
    </div>
  </div>
</section>

<section class="section section-sand" aria-labelledby="ter-titulo">
  <div class="wrap">
    <div class="sec-head reveal">
      <p class="eyebrow">Terapias</p>
      <h2 id="ter-titulo">Massagens e Medicina Tradicional Chinesa</h2>
      <p>Da massagem de relaxamento à acupuntura, terapias naturais para o corpo e para a mente.</p>
    </div>
    <div class="cards cards-compact">
      ${['terapeutica', 'relaxamento', 'tui-na', 'acupuntura', 'eletroacupuntura', 'reflexologia'].map((id) => {
        const t = TERAPIAS.find((x) => x.id === id);
        return `<a class="card card-link card-photo reveal" href="/terapias#${t.id}">${cardFoto(t)}<div class="card-body"><h3>${t.nome}</h3><p>${t.desc}</p><span class="card-meta"><span>${ICON.clock} ${t.duracao}</span><span class="card-price">${t.preco}</span></span><span class="link-arrow">Saber mais ${ICON.arrow}</span></div></a>`;
      }).join('')}
    </div>
    <p class="center"><a class="btn btn-ghost" href="/terapias">Ver todas as terapias e o preçário</a></p>
  </div>
</section>

<section class="section" aria-labelledby="sobre-titulo">
  <div class="wrap split">
    <div class="split-media split-portrait reveal">${img('andreia-retrato', 'Andreia Alves, terapeuta, de bata branca e a sorrir', { sizes: '(min-width: 900px) 40vw, 100vw' })}</div>
    <div class="reveal">
      <p class="eyebrow">Sobre mim</p>
      <h2 id="sobre-titulo">Corpo e mente em perfeita harmonia</h2>
      <p>Desde muito jovem que sou adepta das terapias complementares — foi isso que me levou a tornar-me terapeuta. Tenho formação em Medicina Tradicional Chinesa, massagem e psicologia, e adapto sempre o tratamento às necessidades de cada pessoa.</p>
      <a class="link-arrow" href="/sobre">Conhecer a minha história ${ICON.arrow}</a>
    </div>
  </div>
</section>

${testemunhosSec(3)}
${domicilioSec()}`,
});

// SOBRE
page({
  file: 'sobre.html', pathName: '/sobre',
  title: 'Sobre mim — Andreia Alves, terapeuta de MTC e massagem no Porto',
  desc: `Conheça a Andreia Alves: ${SITE.experiencia} de experiência em Medicina Tradicional Chinesa, massagem e psicologia. Atende no Porto, Maia, Gaia, Chaves e ao domicílio.`,
  body: `<section class="page-hero">
  <div class="wrap">
    <p class="eyebrow">Sobre mim</p>
    <h1>Olá, sou a Andreia Alves</h1>
    <p class="lead">Terapeuta de Medicina Tradicional Chinesa e massagem, com ${SITE.experiencia} de experiência.</p>
  </div>
</section>

<section class="section section-tight">
  <div class="wrap split">
    <div class="split-media split-portrait reveal">${img('andreia-retrato', 'Retrato de Andreia Alves, terapeuta, de bata branca', { sizes: '(min-width: 900px) 40vw, 100vw', eager: true })}</div>
    <div class="prose reveal">
      <h2>A minha história</h2>
      <p>Desde muito jovem que sou adepta e utilizadora de terapias complementares, e foi por isso que comecei a minha jornada para me tornar terapeuta. Conto já com ${SITE.experiencia} de experiência e várias formações na área da Medicina Tradicional Chinesa, da massagem e da psicologia.</p>
      <h3>Missão</h3>
      <p>Ajudar as pessoas que se confiam nas minhas mãos a viver com o corpo e a mente em perfeita harmonia, adequando sempre os tratamentos às suas necessidades e objetivos.</p>
      <h3>Valores</h3>
      <p>O bem-estar — como prevenção ou como tratamento —, com métodos naturais e livres de químicos, e o equilíbrio holístico, agora e no futuro.</p>
    </div>
  </div>
</section>

<section class="section section-sand" aria-labelledby="form-titulo">
  <div class="wrap">
    <div class="sec-head reveal">
      <p class="eyebrow">Formação</p>
      <h2 id="form-titulo">Formação e certificações</h2>
    </div>
    <div class="cert-grid">
      ${['Medicina Tradicional Chinesa', 'Acupuntura e eletroacupuntura', 'Massagem terapêutica e Tui Na', 'Psicologia'].map((a) => `<div class="cert reveal">${ICON.award}<div><h3>${a}</h3><p>${PH('Escola / instituição')} · ${PH('Ano')}</p></div></div>`).join('')}
    </div>
    <p class="center small">${PH('Lista completa de formações e certificados a enviar pela cliente')}</p>
  </div>
</section>

<section class="section" aria-labelledby="galeria-titulo">
  <div class="wrap">
    <div class="sec-head reveal"><p class="eyebrow">Em consulta</p><h2 id="galeria-titulo">O meu trabalho</h2></div>
    <div class="gallery">
      <figure class="reveal">${img('andreia-acupuntura', 'Andreia Alves a aplicar acupuntura nas costas de um paciente', { sizes: '(min-width: 900px) 33vw, 100vw' })}<figcaption>Acupuntura</figcaption></figure>
      <figure class="reveal">${img('andreia-massagem-costas', 'Andreia Alves junto à marquesa, a preparar uma massagem às costas', { sizes: '(min-width: 900px) 33vw, 100vw' })}<figcaption>Massagem terapêutica</figcaption></figure>
      <figure class="reveal">${img('andreia-eletroacupuntura', 'Andreia Alves com o aparelho de eletroacupuntura', { sizes: '(min-width: 900px) 33vw, 100vw' })}<figcaption>Eletroacupuntura</figcaption></figure>
    </div>
  </div>
</section>`,
});

// TERAPIAS
const linhaPreco = (t) => `<tr><th scope="row"><a href="#${t.id}">${t.nome}</a></th><td>${t.duracao}</td><td>${t.preco}</td></tr>`;
page({
  file: 'terapias.html', pathName: '/terapias',
  title: 'Terapias e Preços — Massagens, Acupuntura e MTC no Porto e Maia',
  desc: 'Massagem de relaxamento, Tui Na, desportiva, com ventosas, acupuntura, auriculoterapia, moxabustão e reflexologia no Porto, Maia, Gaia e Chaves. Preçário e pacotes.',
  body: `<section class="page-hero">
  <div class="wrap">
    <p class="eyebrow">Terapias</p>
    <h1>Massagens e Medicina Tradicional Chinesa</h1>
    <p class="lead">Terapias naturais para aliviar a dor, reduzir o stress e devolver o equilíbrio ao corpo — sempre adaptadas a si.</p>
    <nav class="pills" aria-label="Nesta página"><a href="#massagens">Massagens</a><a href="#mtc">Medicina Tradicional Chinesa</a><a href="#precario">Preçário</a><a href="#domicilio">Domicílio</a></nav>
  </div>
</section>

<section class="section section-tight" id="massagens" aria-labelledby="mass-titulo">
  <div class="wrap">
    <div class="sec-head reveal"><h2 id="mass-titulo">Massagens</h2><p>Do relaxamento profundo ao tratamento de dores e contraturas.</p></div>
    <div class="cards">${TERAPIAS.filter((t) => t.grupo === 'massagens').map((t) => terapiaCard(t)).join('')}</div>
  </div>
</section>

<section class="section section-sand" id="mtc" aria-labelledby="mtc-titulo">
  <div class="wrap">
    <div class="split split-top">
      <div class="reveal">
        <h2 id="mtc-titulo">Medicina Tradicional Chinesa (MTC)</h2>
        <p>A Medicina Tradicional Chinesa é um sistema de saúde com milhares de anos que vê o corpo como um todo. Procura restabelecer o equilíbrio e a livre circulação da energia (o <em>Qi</em>) através de técnicas como a acupuntura, a moxabustão e a massagem Tui Na.</p>
        <p class="small">As terapias complementares não substituem o acompanhamento médico. Em caso de doença, mantenha o seu médico informado.</p>
      </div>
      <div class="split-media split-portrait split-full reveal">${img('andreia-acupuntura', 'Sessão de acupuntura: a terapeuta coloca agulhas nas costas do paciente', { sizes: '(min-width: 900px) 40vw, 100vw' })}</div>
    </div>
    <div class="cards">${TERAPIAS.filter((t) => t.grupo === 'mtc').map((t) => terapiaCard(t)).join('')}</div>
  </div>
</section>

<section class="section" id="precario" aria-labelledby="preco-titulo">
  <div class="wrap narrow">
    <div class="sec-head reveal"><p class="eyebrow">Preçário</p><h2 id="preco-titulo">Preços e durações</h2></div>
    <div class="table-wrap reveal">
      <table class="prices">
        <caption class="sr-only">Preço e duração de cada terapia</caption>
        <thead><tr><th scope="col">Terapia</th><th scope="col">Duração</th><th scope="col">Preço</th></tr></thead>
        <tbody>
          <tr class="group"><th colspan="3" scope="rowgroup">Massagens</th></tr>
          ${TERAPIAS.filter((t) => t.grupo === 'massagens').map(linhaPreco).join('')}
          <tr class="group"><th colspan="3" scope="rowgroup">Medicina Tradicional Chinesa</th></tr>
          ${TERAPIAS.filter((t) => t.grupo === 'mtc').map(linhaPreco).join('')}
        </tbody>
      </table>
    </div>
    <h3 class="center">Pacotes</h3>
    <div class="packs">${PACOTES.map((p) => `<div class="pack reveal"><h4>${p.nome}</h4><p>${p.desc}</p><p class="pack-price">${p.preco}</p></div>`).join('')}</div>
    <p class="small center">Valores por sessão. Ao domicílio, a <a href="#domicilio">deslocação é grátis</a> nas localidades onde tenho consultório.</p>
  </div>
</section>

${domicilioSec()}
${testemunhosSec(3, 'Quem já experimentou recomenda')}`,
});

// TESTEMUNHOS
page({
  file: 'testemunhos.html', pathName: '/testemunhos',
  title: 'Testemunhos — Opiniões de clientes | Andreia Alves, Porto',
  desc: 'Leia a opinião de quem já fez massagem, acupuntura e outras terapias com a Andreia Alves no Porto, Maia, Gaia e Chaves.',
  body: `<section class="page-hero">
  <div class="wrap">
    <p class="eyebrow">Testemunhos</p>
    <h1>O que dizem os meus clientes</h1>
    <p class="lead">A melhor recomendação é a de quem já sentiu a diferença.</p>
  </div>
</section>
<section class="section section-tight">
  <div class="wrap"><div class="quotes quotes-masonry">${TESTEMUNHOS.map(testemunhoCard).join('')}</div>
  <p class="center"><a class="link-arrow" href="${SITE.facebook}" target="_blank" rel="noopener">Deixe também a sua opinião no Facebook ${ICON.arrow}</a></p></div>
</section>`,
});

// CONTACTOS
const opcoesTerapia = TERAPIAS.map((t) => `<option>${t.nome}</option>`).join('') + '<option>Massagem ao domicílio</option><option>Acupuntura ao domicílio</option><option>Não sei — preciso de aconselhamento</option>';
const opcoesZona = ZONAS.map((z) => `<option>${z.nome}</option>`).join('') + '<option>Outra (indicar na mensagem)</option>';
page({
  file: 'contactos.html', pathName: '/contactos',
  title: 'Contactos e Marcações — Massagem e Acupuntura no Porto, Maia e Gaia',
  desc: `Marque a sua consulta de massagem ou acupuntura: ${SITE.telefone}, WhatsApp ou formulário online. Porto, Maia, Gaia, Matosinhos, Chaves e ao domicílio.`,
  body: `<section class="page-hero">
  <div class="wrap">
    <p class="eyebrow">Contactos</p>
    <h1>Marque a sua consulta</h1>
    <p class="lead">Preencha o formulário, ligue ou envie mensagem por WhatsApp. Confirmo a marcação por telefone ou e-mail.</p>
  </div>
</section>

<section class="section section-tight" id="marcacao">
  <div class="wrap contact-grid">
    <form class="form reveal" id="form-marcacao" action="/api/contacto" method="post" novalidate>
      <h2>Pedido de marcação</h2>
      <p class="small">Campos com <span aria-hidden="true">*</span><span class="sr-only">asterisco</span> são obrigatórios.</p>
      <div class="field"><label for="f-nome">Nome *</label><input id="f-nome" name="nome" autocomplete="name" required maxlength="80"></div>
      <div class="field-row">
        <div class="field"><label for="f-tel">Telefone *</label><input id="f-tel" name="telefone" type="tel" autocomplete="tel" inputmode="tel" required maxlength="20" placeholder="9xx xxx xxx"></div>
        <div class="field"><label for="f-email">E-mail</label><input id="f-email" name="email" type="email" autocomplete="email" maxlength="120"></div>
      </div>
      <div class="field-row">
        <div class="field"><label for="f-terapia">Terapia *</label><select id="f-terapia" name="terapia" required><option value="">Escolha…</option>${opcoesTerapia}</select></div>
        <div class="field"><label for="f-zona">Zona *</label><select id="f-zona" name="zona" required><option value="">Escolha…</option>${opcoesZona}</select></div>
      </div>
      <div class="field"><label for="f-data">Data preferida</label><input id="f-data" name="data" type="date"></div>
      <div class="field"><label for="f-msg">Mensagem</label><textarea id="f-msg" name="mensagem" rows="4" maxlength="1500" placeholder="Horário preferido, queixas, se é ao domicílio…"></textarea></div>
      <div class="hp" aria-hidden="true"><label for="f-site">Não preencher</label><input id="f-site" name="website" tabindex="-1" autocomplete="off"></div>
      <div class="field check"><input id="f-rgpd" name="consentimento" type="checkbox" required><label for="f-rgpd">Aceito que os meus dados sejam usados apenas para responder a este pedido, de acordo com a <a href="/politica-privacidade">Política de Privacidade</a>. *</label></div>
      <button class="btn btn-block" type="submit">Enviar pedido</button>
      <p class="form-status" role="status" aria-live="polite"></p>
    </form>

    <aside class="contact-side reveal" aria-label="Outros contactos">
      <div class="contact-box">
        <h2>Fale comigo</h2>
        <ul class="list-icons">
          <li>${ICON.phone}<a href="tel:${SITE.telefoneLink}">${SITE.telefone}</a></li>
          <li>${ICON.wa}<a href="${SITE.whatsapp}" target="_blank" rel="noopener">WhatsApp</a></li>
          <li>${ICON.mail}<a href="mailto:${SITE.email}">${SITE.email}</a></li>
          <li>${ICON.fb}<a href="${SITE.facebook}" target="_blank" rel="noopener">Facebook</a></li>
          <li>${ICON.pin}<a href="${SITE.mapa}" target="_blank" rel="noopener">${SITE.morada.linha1}, ${SITE.morada.linha2}<br>${SITE.morada.codigoPostal} ${SITE.morada.localidade}</a></li>
          <li>${ICON.clock}<span>${SITE.horario}<br><span class="small">Horário alargado e domicílio por marcação, mediante disponibilidade.</span></span></li>
        </ul>
      </div>
      <div class="contact-box">
        <h2>Marcação online por zona</h2>
        <ul class="booking">${ZONAS.filter((z) => z.reserva).map((z) => `<li><a href="${z.reserva}" target="_blank" rel="noopener"><span>${z.nome}</span>${ICON.arrow}</a></li>`).join('')}</ul>
      </div>
    </aside>
  </div>
</section>

<section class="section section-sand" aria-labelledby="locais-titulo">
  <div class="wrap">
    <div class="sec-head reveal"><p class="eyebrow">Onde atendo</p><h2 id="locais-titulo">Consultórios e zonas</h2><p>Consultas em clínicas parceiras e ao domicílio no Grande Porto e no Norte.</p></div>
    <ul class="zones">${ZONAS.map((z) => `<li class="reveal">${ICON.pin}<div><h3>${z.nome}</h3>${z.nota ? `<p>${z.nota}</p>` : ''}</div></li>`).join('')}</ul>
    <p class="center"><a class="btn btn-ghost" href="${SITE.mapa}" target="_blank" rel="noopener">${ICON.pin} Ver consultório da Maia no Google Maps</a></p>
  </div>
</section>`,
  cta: false,
});

// POLÍTICA DE PRIVACIDADE
page({
  file: 'politica-privacidade.html', pathName: '/politica-privacidade',
  title: 'Política de Privacidade e Cookies | Terapeuta Andreia Alves',
  desc: 'Como são tratados os seus dados pessoais e que cookies usa o site da Terapeuta Andreia Alves.',
  cta: false,
  body: `<section class="page-hero"><div class="wrap narrow"><h1>Política de Privacidade e Cookies</h1><p class="small">Última atualização: ${HOJE}</p></div></section>
<section class="section section-tight"><div class="wrap narrow prose">
<h2>1. Responsável pelo tratamento</h2>
<p>${SITE.marca} — ${SITE.nome}${PH('NIF')}. Contacto: <a href="mailto:${SITE.email}">${SITE.email}</a> · ${SITE.telefone}.</p>
<h2>2. Que dados recolhemos</h2>
<p>Apenas os dados que nos envia voluntariamente pelo formulário de marcação, telefone, e-mail ou WhatsApp: nome, telefone, e-mail (opcional), terapia pretendida, zona, data preferida e a mensagem que escrever. Pedimos-lhe que não inclua informação de saúde detalhada no formulário; essa informação é recolhida apenas em consulta.</p>
<h2>3. Para que usamos os dados</h2>
<p>Exclusivamente para responder ao seu pedido e gerir a sua marcação. A base legal é o seu consentimento e as diligências pré-contratuais a seu pedido (art. 6.º, n.º 1, alíneas a) e b) do RGPD). Não enviamos publicidade nem partilhamos os seus dados com terceiros para fins comerciais.</p>
<h2>4. Durante quanto tempo</h2>
<p>Os pedidos de marcação são guardados pelo tempo necessário para responder e gerir a consulta e apagados no prazo máximo de ${PH('12 meses')}, salvo obrigação legal em contrário.</p>
<h2>5. Quem tem acesso</h2>
<p>Apenas a terapeuta. Os dados passam pelos prestadores técnicos estritamente necessários: alojamento do site (${PH('fornecedor de alojamento')}) e serviço de e-mail. As plataformas de marcação online (SimplyBook.me, Buk, Noona) e o WhatsApp têm as suas próprias políticas de privacidade.</p>
<h2>6. Os seus direitos</h2>
<p>Pode, a qualquer momento, pedir acesso, retificação, apagamento, limitação ou portabilidade dos seus dados e retirar o consentimento, escrevendo para <a href="mailto:${SITE.email}">${SITE.email}</a>. Tem ainda o direito de apresentar reclamação à Comissão Nacional de Proteção de Dados (<a href="https://www.cnpd.pt" target="_blank" rel="noopener">www.cnpd.pt</a>).</p>
<h2 id="cookies">7. Cookies</h2>
<p>Este site <strong>não usa cookies de publicidade, de análise nem de terceiros</strong>. Guarda apenas, no seu navegador (armazenamento local), a indicação de que já viu o aviso de cookies, para não o voltar a mostrar. Este registo é estritamente necessário e não o identifica.</p>
<p>Os links externos (Facebook, WhatsApp, plataformas de marcação, Google Maps) só carregam conteúdo desses serviços se clicar neles.</p>
<h2 id="creditos">8. Créditos das imagens</h2>
<p>Algumas fotografias da página de terapias são usadas ao abrigo da licença <a href="https://creativecommons.org/licenses/by/2.0/deed.pt" target="_blank" rel="noopener">Creative Commons BY 2.0</a>:</p>
<ul>${TERAPIAS.filter((t) => t.foto.credito).map((t) => `<li>${t.nome}: <a href="${t.foto.credito[1]}" target="_blank" rel="noopener">${esc(t.foto.credito[0])}</a></li>`).join('')}</ul>
<h2>9. Alterações</h2>
<p>Esta política pode ser atualizada; a data no topo indica a versão em vigor.</p>
</div></section>`,
});

// 404
page({
  file: '404.html', pathName: '/404',
  title: 'Página não encontrada | Terapeuta Andreia Alves',
  desc: 'A página que procura não existe.',
  body: `<section class="page-hero page-404"><div class="wrap"><p class="eyebrow">Erro 404</p><h1>Esta página não existe</h1><p class="lead">Talvez procure as <a href="/terapias">terapias</a> ou os <a href="/contactos">contactos</a>.</p><a class="btn" href="/">Voltar ao início</a></div></section>`,
});

// SITEMAP + ROBOTS
const urls = ['/', '/sobre', '/terapias', '/testemunhos', '/contactos', '/politica-privacidade'];
fs.writeFileSync(path.join(OUT, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((u) => `  <url><loc>${SITE.url}${u}</loc><lastmod>${HOJE}</lastmod><priority>${u === '/' ? '1.0' : u === '/politica-privacidade' ? '0.3' : '0.8'}</priority></url>`).join('\n')}
</urlset>
`);
fs.writeFileSync(path.join(OUT, 'robots.txt'), STATIC
  ? 'User-agent: *\nDisallow: /\n' // pré-visualização: fora do Google
  : `User-agent: *\nAllow: /\nDisallow: /api/\n\nSitemap: ${SITE.url}/sitemap.xml\n`);
console.log('✓ sitemap.xml, robots.txt');
