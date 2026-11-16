require('dotenv').config();
const path = require('path');
const express = require('express');
const compression = require('compression');
const nodemailer = require('nodemailer');

const app = express();
const PORT = process.env.PORT || 3000;
const PUBLIC = path.join(__dirname, 'public');
const IS_PROD = process.env.NODE_ENV === 'production';
// Hash do único script inline (marca <html class="js">) — permite CSP sem 'unsafe-inline'
const JS_CLASS_HASH = require('crypto').createHash('sha256')
  .update("document.documentElement.classList.add('js')").digest('base64');

app.disable('x-powered-by');
app.set('trust proxy', 1); // Render/Railway ficam atrás de proxy — necessário para o IP real no rate limit

// --- Cabeçalhos de segurança básicos
app.use((req, res, next) => {
  res.set({
    'X-Content-Type-Options': 'nosniff',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'X-Frame-Options': 'SAMEORIGIN',
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
    'Content-Security-Policy': "default-src 'self'; img-src 'self' data:; style-src 'self'; font-src 'self'; script-src 'self' 'sha256-" + JS_CLASS_HASH + "'; connect-src 'self'; frame-ancestors 'self'; form-action 'self'; base-uri 'self'",
  });
  if (IS_PROD) res.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  next();
});

app.use(compression());

// --- URLs limpos: /sobre.html → /sobre (301)
app.get(/^\/(.+)\.html$/, (req, res, next) => {
  if (req.params[0] === 'index') return res.redirect(301, '/');
  if (req.params[0] === '404') return next();
  res.redirect(301, '/' + req.params[0]);
});

// --- Ficheiros estáticos com cache (HTML sem cache longa)
app.use(express.static(PUBLIC, {
  extensions: ['html'],
  setHeaders(res, file) {
    if (/\.(webp|jpg|png|svg|ico|woff2)$/.test(file)) res.set('Cache-Control', 'public, max-age=31536000, immutable');
    else if (/\.(css|js)$/.test(file)) res.set('Cache-Control', 'public, max-age=604800');
    else res.set('Cache-Control', 'public, max-age=0, must-revalidate');
  },
}));

// --- API de contacto
app.use('/api', express.json({ limit: '20kb' }));

// Rate limit simples em memória: 5 pedidos / 15 min por IP
const WINDOW = 15 * 60 * 1000;
const MAX = 5;
const hits = new Map();
function rateLimit(req, res, next) {
  const now = Date.now();
  const ip = req.ip;
  const list = (hits.get(ip) || []).filter((t) => now - t < WINDOW);
  if (list.length >= MAX) {
    return res.status(429).json({ ok: false, erro: 'Demasiados pedidos. Tente novamente daqui a alguns minutos.' });
  }
  list.push(now);
  hits.set(ip, list);
  next();
}
setInterval(() => {
  const now = Date.now();
  for (const [ip, list] of hits) if (!list.some((t) => now - t < WINDOW)) hits.delete(ip);
}, WINDOW).unref();

const clean = (v, max) => String(v ?? '').replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, '').trim().slice(0, max);
const escHtml = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

function validar(body) {
  const d = {
    nome: clean(body.nome, 80),
    telefone: clean(body.telefone, 20),
    email: clean(body.email, 120),
    terapia: clean(body.terapia, 80),
    zona: clean(body.zona, 60),
    data: clean(body.data, 10),
    mensagem: clean(body.mensagem, 1500),
  };
  const erros = [];
  if (d.nome.length < 2) erros.push('nome');
  if (!/^\+?\d{9,15}$/.test(d.telefone.replace(/[\s().-]/g, ''))) erros.push('telefone');
  if (d.email && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(d.email)) erros.push('email');
  if (!d.terapia) erros.push('terapia');
  if (!d.zona) erros.push('zona');
  if (d.data && !/^\d{4}-\d{2}-\d{2}$/.test(d.data)) erros.push('data');
  if (body.consentimento !== true && body.consentimento !== 'on') erros.push('consentimento');
  return { d, erros };
}

const smtpConfigurado = Boolean(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS);
const transporter = smtpConfigurado
  ? nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT || 465),
      secure: String(process.env.SMTP_SECURE ?? 'true') === 'true',
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    })
  : null;

app.post('/api/contacto', rateLimit, async (req, res) => {
  const body = req.body || {};

  // Honeypot: bots preenchem o campo escondido → fingimos sucesso
  if (clean(body.website, 200)) return res.json({ ok: true });

  const { d, erros } = validar(body);
  if (erros.length) {
    return res.status(400).json({ ok: false, erro: 'Verifique os campos do formulário.', campos: erros });
  }

  const linhas = [
    ['Nome', d.nome], ['Telefone', d.telefone], ['E-mail', d.email || '—'],
    ['Terapia', d.terapia], ['Zona', d.zona], ['Data preferida', d.data || '—'], ['Mensagem', d.mensagem || '—'],
  ];
  const texto = linhas.map(([k, v]) => `${k}: ${v}`).join('\n');
  const html = `<h2>Novo pedido de marcação</h2><table cellpadding="6">${linhas
    .map(([k, v]) => `<tr><th align="left" valign="top">${k}</th><td>${escHtml(v).replace(/\n/g, '<br>')}</td></tr>`)
    .join('')}</table>`;

  if (!transporter) {
    console.log('\n[DEV] SMTP não configurado — pedido recebido:\n' + texto + '\n');
    return res.json({ ok: true, dev: true });
  }

  try {
    await transporter.sendMail({
      from: `"Site Andreia Alves" <${process.env.MAIL_FROM || process.env.SMTP_USER}>`,
      to: process.env.MAIL_TO || process.env.SMTP_USER,
      replyTo: d.email || undefined,
      subject: `Marcação: ${d.terapia} — ${d.nome} (${d.zona})`,
      text: texto,
      html,
    });
    res.json({ ok: true });
  } catch (err) {
    console.error('Erro ao enviar e-mail:', err.message);
    res.status(502).json({ ok: false, erro: 'Não foi possível enviar o pedido neste momento.' });
  }
});

app.use('/api', (req, res) => res.status(404).json({ ok: false, erro: 'Não encontrado.' }));

// --- 404
app.use((req, res) => res.status(404).sendFile(path.join(PUBLIC, '404.html')));

app.listen(PORT, () => {
  console.log(`Site a correr em http://localhost:${PORT}${smtpConfigurado ? '' : '  (SMTP por configurar: pedidos só aparecem no terminal)'}`);
});
