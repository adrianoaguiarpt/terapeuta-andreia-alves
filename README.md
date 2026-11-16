# Site — Terapeuta Andreia Alves

Site novo (substitui o Webnode) em HTML/CSS/JS + Node/Express.

## Correr localmente
```bash
npm install
npm run dev        # gera as páginas e arranca em http://localhost:3000
```
Sem `.env`, os pedidos do formulário aparecem só no terminal.

## Onde editar
- **Textos, terapias, zonas, testemunhos, pacotes:** `src/data.js`
- **Estrutura das páginas, SEO, JSON-LD:** `scripts/build.js`
- **Visual:** `public/css/style.css` · **Interação:** `public/js/main.js`

Depois de editar, corra `npm run build` — as páginas em `public/*.html` são geradas (não editar à mão).

## Placeholders à espera da cliente
Aparecem a amarelo no site (`[PREÇO]`, `[DURAÇÃO]`…). Procurar `PH(` em `src/data.js` e `scripts/build.js`:
- Preços e durações de cada terapia + pacotes
- Regra/valor da deslocação ao domicílio
- Formação e certificações (escola, ano)
- Morada do consultório (Google Maps)
- NIF, alojamento e prazo de conservação na Política de Privacidade
- Domínio final (`SITE.url` em `src/data.js` — afeta canonical, sitemap e Open Graph)

## Envio de e-mail
Copiar `.env.example` para `.env`. Com Gmail: ativar a verificação em 2 passos e criar uma *palavra-passe de aplicação* para `SMTP_PASS`.

## Deploy (Render ou Railway)
- Build: `npm install && npm run build` · Start: `npm start`
- Variáveis de ambiente: as de `.env.example`
- Apontar o domínio e confirmar HTTPS.
