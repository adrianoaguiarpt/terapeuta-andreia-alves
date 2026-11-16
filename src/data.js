// Todo o conteúdo editável do site vive aqui.
// Depois de alterar, corra `npm run build` para regenerar /public/*.html.
// Os textos entre [PARÊNTESES RETOS] são placeholders à espera de dados da cliente.

const SITE = {
  url: 'https://andreiaalves.pt', // [DOMÍNIO] — confirmar com a cliente
  nome: 'Andreia Alves',
  marca: 'Terapeuta Andreia Alves',
  slogan: 'Acupuntura e Massagem',
  telefone: '+351 938 324 438',
  telefoneLink: '+351938324438',
  whatsapp: 'https://wa.me/351938324438',
  email: 'terapeutandreialves@gmail.com',
  facebook: 'https://www.facebook.com/terapeutandreialves',
  horario: 'Todos os dias, das 10h às 22h',
  morada: {
    linha1: 'Edifício Paris, R. Dr. Carlos Pires Felgueiras, 218',
    linha2: '4.º andar, sala 1',
    codigoPostal: '4470-157',
    localidade: 'Maia',
  },
  mapa: 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent('R. Dr. Carlos Pires Felgueiras 218, 4470-157 Maia'),
  experiencia: 'mais de 10 anos',
};

// Zonas onde a terapeuta atende (consultório/clínica parceira ou domicílio)
const ZONAS = [
  { nome: 'Porto', nota: 'Consultório junto ao Túnel de Ceuta', reserva: 'https://terapeutandreialves.simplybook.it/v2/' },
  { nome: 'Vila Nova de Gaia', reserva: 'https://terapeuta-andreia-alves.buk.pt' },
  { nome: 'Maia', nota: 'Edifício Paris, R. Dr. Carlos Pires Felgueiras, 218 — 4.º andar, sala 1', reserva: 'https://noona.app/terapeutandreialves' },
  { nome: 'Matosinhos', reserva: 'https://terapeutandreialvesmatosinhos1.simplybook.it/v2/' },
  { nome: 'Chaves' },
  { nome: 'Vila Pouca de Aguiar', nota: 'Clínica Rica Saúde' },
  { nome: 'Vila Real' },
  { nome: 'Braga' },
  { nome: 'Bragança' },
  { nome: 'Mirandela' },
];

const PH = (t) => `<span class="ph">[${t}]</span>`; // placeholder visível

// Cada terapia: nome, grupo, duração, preço (valores de EXEMPLO — confirmar), foto, descrição, benefícios.
// foto.inteira = true mostra a foto vertical inteira (com fundo desfocado) em vez de a cortar.
// foto.credito = [autor, link] para fotos com licença CC BY 2.0 (obrigatório manter).
const TERAPIAS = [
  // --- Massagens
  {
    id: 'relaxamento', grupo: 'massagens', nome: 'Massagem de Relaxamento',
    duracao: '60 min', preco: '40 €',
    foto: { src: '/img/massagem-relaxamento-1000.webp', alt: 'Massagem de relaxamento ao rosto e pescoço, à luz de velas', pos: 'esquerda' },
    desc: 'Movimentos lentos e envolventes, com óleos essenciais biológicos e música calma, para desligar do dia a dia.',
    beneficios: 'Reduz o stress e a tensão muscular, melhora a qualidade do sono.',
  },
  {
    id: 'tui-na', grupo: 'massagens', nome: 'Massagem Tui Na',
    duracao: '60 min', preco: '45 €',
    foto: { src: '/img/andreia-massagem-costas-600.webp', alt: 'Andreia Alves a fazer massagem Tui Na nas costas de um paciente', inteira: true },
    desc: 'Massagem terapêutica da Medicina Tradicional Chinesa que combina pressão, amassamento e mobilização ao longo dos meridianos (canais de energia do corpo).',
    beneficios: 'Alivia dores musculares e articulares e ajuda a reequilibrar o corpo.',
  },
  {
    id: 'desportiva', grupo: 'massagens', nome: 'Massagem Desportiva',
    duracao: '60 min', preco: '45 €',
    foto: { src: '/img/terapias/massagem-desportiva.webp', alt: 'Mãos de terapeuta a massajar a perna de um atleta', credito: ['sellyourseoul', 'https://www.flickr.com/photos/43846028@N05/4270025283'] },
    desc: 'Massagem profunda e dirigida a quem pratica exercício, antes ou depois do treino e da competição.',
    beneficios: 'Ajuda na recuperação muscular, na flexibilidade e na prevenção de lesões.',
  },
  {
    id: 'ventosas', grupo: 'massagens', nome: 'Massagem com Ventosas',
    duracao: '60 min', preco: '45 €',
    foto: { src: '/img/terapias/massagem-ventosas.webp', alt: 'Terapeuta a aplicar ventosas de vidro nas costas de uma paciente', credito: ['Alanna Ralph', 'https://commons.wikimedia.org/w/index.php?curid=2867003'] },
    desc: 'Ventosas que criam uma ligeira sucção na pele e deslizam sobre os músculos, soltando as camadas mais profundas.',
    beneficios: 'Estimula a circulação e alivia contraturas e rigidez.',
  },
  {
    id: 'terapeutica', grupo: 'massagens', nome: 'Massagem Terapêutica',
    duracao: '60 min', preco: '45 €',
    foto: { src: '/img/espaco-relax-1000.webp', alt: 'Marquesa preparada para massagem terapêutica, com toalha e flores' },
    desc: 'Tratamento personalizado para dores concretas — lombar, cervical, ombros — com técnicas escolhidas após avaliação.',
    beneficios: 'Alívio da dor, mais mobilidade e menos tensão acumulada.',
  },
  {
    id: 'aromaterapia', grupo: 'massagens', nome: 'Massagem com Aromaterapia',
    duracao: '60 min', preco: '45 €',
    foto: { src: '/img/terapias/aromaterapia.webp', alt: 'Taça de madeira com flores para massagem de aromaterapia', credito: ['Tara Angkor Hotel', 'https://www.flickr.com/photos/47808661@N07/5918685504'] },
    desc: 'Massagem relaxante com óleos essenciais biológicos escolhidos de acordo com o seu estado e as suas necessidades.',
    beneficios: 'Acalma a mente, alivia a ansiedade e deixa uma sensação profunda de bem-estar.',
  },
  // --- MTC
  {
    id: 'acupuntura', grupo: 'mtc', nome: 'Acupuntura',
    duracao: '60 min', preco: '40 €',
    foto: { src: '/img/andreia-acupuntura-600.webp', alt: 'Andreia Alves a colocar agulhas de acupuntura nas costas de um paciente', inteira: true },
    desc: 'Aplicação de agulhas muito finas e esterilizadas, de uso único, em pontos específicos do corpo, segundo a Medicina Tradicional Chinesa.',
    beneficios: 'Indicada para dor crónica, tensão, ansiedade e insónia, entre outras queixas.',
  },
  {
    id: 'auriculoterapia', grupo: 'mtc', nome: 'Auriculoterapia',
    duracao: '30 min', preco: '25 €',
    foto: { src: '/img/terapias/auriculoterapia.webp', alt: 'Modelo de orelha com os pontos de auriculoterapia marcados', credito: ['thekirbster', 'https://www.flickr.com/photos/17157315@N00/7931228202'] },
    desc: 'Estimulação de pontos na orelha — que, segundo a MTC, refletem todo o corpo — com agulhas, sementes ou esferas.',
    beneficios: 'Apoio no controlo da ansiedade, da dor e de hábitos como o tabaco ou a alimentação.',
  },
  {
    id: 'moxabustao', grupo: 'mtc', nome: 'Moxabustão',
    duracao: '45 min', preco: '35 €',
    foto: { src: '/img/terapias/moxabustao.webp', alt: 'Terapeuta a aplicar moxabustão nas costas de uma paciente', credito: ['Wonderlane', 'https://www.flickr.com/photos/71401718@N00/3275117621'] },
    desc: 'Aplicação de calor suave junto a pontos de acupuntura, através da queima controlada de artemísia (moxa), sem contacto direto com a pele.',
    beneficios: 'Aquece, estimula a circulação e reforça a energia do corpo.',
  },
  {
    id: 'eletroacupuntura', grupo: 'mtc', nome: 'Eletroacupuntura',
    duracao: '60 min', preco: '45 €',
    foto: { src: '/img/andreia-eletroacupuntura-600.webp', alt: 'Andreia Alves com o aparelho de eletroacupuntura', inteira: true },
    desc: 'Acupuntura combinada com uma corrente elétrica muito ligeira entre agulhas, que intensifica o estímulo dos pontos.',
    beneficios: 'Especialmente útil no alívio da dor e na recuperação muscular.',
  },
  {
    id: 'reflexologia', grupo: 'mtc', nome: 'Reflexologia',
    duracao: '45 min', preco: '35 €',
    foto: { src: '/img/terapias/reflexologia.webp', alt: 'Sessão de reflexologia: terapeuta a massajar os pés de uma cliente', credito: ['Tara Angkor Hotel', 'https://www.flickr.com/photos/47808661@N07/5918684646'] },
    desc: 'Pressão em zonas reflexas dos pés que correspondem a órgãos e sistemas do corpo.',
    beneficios: 'Relaxa profundamente, alivia a tensão e promove o equilíbrio geral.',
  },
];

// Valores de EXEMPLO — substituir pelos preços reais da cliente
const PACOTES = [
  { nome: 'Pack 5 sessões', desc: 'Massagem ou acupuntura, à escolha', preco: '180 €' },
  { nome: 'Pack 10 sessões', desc: 'Ideal para tratamentos de dor crónica', preco: '340 €' },
  { nome: 'Vale oferta', desc: 'Ofereça uma sessão de bem-estar', preco: 'desde 40 €' },
];

const TESTEMUNHOS = [
  { nome: 'Susana Marrão', texto: 'Iniciei o tratamento pois tinha muitas dores nas costas, perna e braço esquerdo. Na 1.ª sessão notei ao final do dia logo diferença, daí continuei a ver os fantásticos resultados. Resultados esses que com outros tratamentos que fiz não resultaram. Recomendo vivamente a Dra. Andreia.' },
  { nome: 'Cidália Amorim', texto: 'Excelente profissional. Estava com dor lombar há vários meses e logo na primeira consulta notei uma melhoria incrível!' },
  { nome: 'Fernanda Barroso', texto: 'Recomendo a Doutora Andreia. Fiz ontem a primeira sessão e gostei muito. É muito simpática e atenciosa. Esta noite já dormi melhor e acordei com menos dores.' },
  { nome: 'Isabel Paiva', texto: 'Nunca tinha experimentado… Gostei muito. A Dra. Andreia é muito simpática e profissional. O resultado foi inacreditável. Recomendo vivamente. Nota 10.' },
  { nome: 'Sandra Monteiro', texto: 'Muito profissional e muito amável com o paciente. Espaço muito acolhedor. Recomendo.' },
  { nome: 'Bruno Cmj', texto: 'Já com duas sessões e resultado agradável. Recomendável a 100%. Melhoria notória. Obrigado, Sra. Andreia.' },
  { nome: 'Daniel Coelho', texto: 'Excelente experiência, recomendo a quem quer acalmar e tratar a mente.' },
  { nome: 'Mara Barros', texto: 'Profissional atenta e extremamente atenciosa. Experiência positiva. Recomendo.' },
  { nome: 'Nuno Martins', texto: 'Excelente atendimento com ótimos resultados.' },
];

module.exports = { SITE, ZONAS, TERAPIAS, PACOTES, TESTEMUNHOS, PH };
