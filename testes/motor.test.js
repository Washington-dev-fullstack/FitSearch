const { test } = require('node:test');
const assert = require('node:assert/strict');
const M = require('../js/motor.js');

// ---------- catálogo de teste ----------
const estilos = [
    { id: 'minimal', nome: 'Minimal', descricao: 'Poucas peças e cortes limpos.', sinonimos: ['básico', 'clean'] },
    { id: 'dark', nome: 'Dark', descricao: 'Preto, couro e silhueta marcada.', sinonimos: ['gótico'] },
    { id: 'y2k', nome: 'Y2K', descricao: 'Os anos 2000 de volta.', sinonimos: ['anos 2000'] },
    { id: 'streetwear', nome: 'Streetwear', descricao: 'Largo e urbano.', sinonimos: ['skate'] }
];
const ocasioes = [
    { id: 'trabalho', nome: 'Trabalho', sinonimos: ['entrevista', 'escritório'] },
    { id: 'festa', nome: 'Festa', sinonimos: ['balada'] },
    { id: 'dia-a-dia', nome: 'Dia a dia', sinonimos: ['casual'] }
];
const paradas = ['pra', 'para', 'de', 'do', 'da', 'um', 'uma', 'look', 'roupa', 'com', 'e', 'o', 'a'];
const peca = (nome, corNome = 'preto') => ({ nome, categoria: 'x', cor: '#000', corNome, preco: [50, 100] });
const looks = [
    { id: 'm1', nome: 'Branco total', estilo: 'minimal', estilo2: null, para: 'feminino', ocasioes: ['trabalho'], palavras: ['branco'], pecas: [peca('Camisa branca'), peca('Calça reta')] },
    { id: 'm2', nome: 'Camisa e alfaiataria', estilo: 'minimal', estilo2: 'dark', para: 'masculino', ocasioes: ['trabalho', 'dia-a-dia'], palavras: [], pecas: [peca('Camisa social'), peca('Calça de alfaiataria')] },
    { id: 'd1', nome: 'Couro e coturno', estilo: 'dark', estilo2: null, para: 'unissex', ocasioes: ['festa'], palavras: ['couro'], pecas: [peca('Jaqueta de couro'), peca('Coturno')] },
    { id: 'd2', nome: 'Preto em camadas', estilo: 'dark', estilo2: 'minimal', para: 'feminino', ocasioes: ['festa', 'dia-a-dia'], palavras: [], pecas: [peca('Vestido preto'), peca('Meia-calça')] },
    { id: 'y1', nome: 'Conjunto amarelo', estilo: 'y2k', estilo2: 'streetwear', para: 'feminino', ocasioes: ['festa'], palavras: ['anos 2000'], pecas: [peca('Cropped', 'amarelo'), peca('Calça de moletom', 'amarelo')] },
    { id: 'y2', nome: 'Baby tee e brilho', estilo: 'y2k', estilo2: null, para: 'masculino', ocasioes: ['festa'], palavras: [], pecas: [peca('Baby tee'), peca('Calça cargo prata')] },
    { id: 's1', nome: 'Moletom e cargo', estilo: 'streetwear', estilo2: null, para: 'masculino', ocasioes: ['dia-a-dia'], palavras: ['skate'], pecas: [peca('Moletom largo'), peca('Calça cargo')] },
    { id: 's2', nome: 'Tênis e bermuda', estilo: 'streetwear', estilo2: 'y2k', para: 'unissex', ocasioes: ['dia-a-dia'], palavras: [], pecas: [peca('Camiseta gráfica'), peca('Bermuda'), peca('Tênis')] }
];
const dados = { estilos, ocasioes, looks, paradas };
const ids = estilos.map(e => e.id);
const vazio = { busca: '', estilos: [], paraQuem: 'todos', ocasiao: null };
const etiquetaMD = { composicao: [{ estilo: 'minimal', pct: 62 }, { estilo: 'dark', pct: 28 }, { estilo: 'streetwear', pct: 10 }] };

function semente(s) { // mulberry32
    return function () {
        s |= 0; s = (s + 0x6D2B79F5) | 0;
        let t = Math.imul(s ^ (s >>> 15), 1 | s);
        t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
}

// ---------- normalizar / interpretar ----------
test('normalizar tira acento, caixa e plural', () => {
    assert.equal(M.normalizar('Calças Jeans'), 'calca jean');
    assert.equal(M.normalizar('  Anos   2000! '), 'ano 2000');
});

test('normalizar descarta símbolos', () => {
    assert.equal(M.normalizar('<b>cargo</b>'), 'b cargo b');
});

test('interpretar acha ocasião pelo dicionário', () => {
    const r = M.interpretar('look pra entrevista', dados);
    assert.deepEqual(r.dic, [{ termo: 'entrevista', tipo: 'ocasiao', id: 'trabalho' }]);
    assert.deepEqual(r.termos, []);
});

test('interpretar acha expressão de duas palavras', () => {
    assert.equal(M.interpretar('anos 2000', dados).dic[0].id, 'y2k');
});

test('interpretar acha expressão com palavra de parada no meio', () => {
    assert.equal(M.interpretar('roupa pro dia a dia', dados).dic[0].id, 'dia-a-dia');
});

test('interpretar ignora só palavras de parada, espaços e símbolos', () => {
    for (const q of ['look pra', '   ', '<b>', '!!']) {
        const r = M.interpretar(q, dados);
        assert.equal(r.termos.length + r.dic.length, 0, q);
    }
});

// ---------- filtros ----------
test('compativel trata unissex como dos dois', () => {
    assert.equal(M.compativel(looks[2], 'feminino'), true);
    assert.equal(M.compativel(looks[1], 'feminino'), false);
    assert.equal(M.compativel(looks[1], 'todos'), true);
});

test('filtrar por para quem mantém unissex', () => {
    const r = M.filtrar(looks, { ...vazio, paraQuem: 'masculino' }).map(l => l.id);
    assert.deepEqual(r, ['m2', 'd1', 'y2', 's1', 's2']);
});

test('filtrar estilos é OU e ocasião é obrigatória', () => {
    assert.deepEqual(M.filtrar(looks, { ...vazio, estilos: ['dark', 'y2k'] }).map(l => l.id), ['d1', 'd2', 'y1', 'y2']);
    assert.deepEqual(M.filtrar(looks, { ...vazio, estilos: ['dark', 'y2k'], ocasiao: 'dia-a-dia' }).map(l => l.id), ['d2']);
});

// ---------- pontuação ----------
test('pontuarBusca: peça vale 2', () => {
    assert.equal(M.pontuarBusca(looks[6], M.interpretar('cargo', dados)), 2);
});

test('pontuarBusca: estilo vale 3, estilo2 vale 1', () => {
    const i = M.interpretar('gótico', dados);
    assert.equal(M.pontuarBusca(looks[2], i), 3);
    assert.equal(M.pontuarBusca(looks[1], i), 1);
});

test('pontuarBusca: ocasião vale 2', () => {
    assert.equal(M.pontuarBusca(looks[0], M.interpretar('entrevista', dados)), 2);
});

test('pontuarBusca casa prefixo enquanto digita', () => {
    assert.equal(M.pontuarBusca(looks[6], M.interpretar('car', dados)), 2);
});

// ---------- % você ----------
test('porcentagemVoce: estilo do topo dá 100', () => {
    assert.equal(M.porcentagemVoce(looks[0], etiquetaMD), 100);
});

test('porcentagemVoce soma metade do estilo2', () => {
    // Dark (28) + metade de Minimal (31) = 59 / 62
    assert.equal(M.porcentagemVoce(looks[3], etiquetaMD), 95);
});

test('porcentagemVoce sem etiqueta é 0', () => {
    assert.equal(M.porcentagemVoce(looks[0], null), 0);
    assert.equal(M.porcentagemVoce(looks[5], etiquetaMD), 0); // y2k sem estilo2
});

// ---------- ordem e resultados ----------
test('ordemPadrao alterna estilos', () => {
    assert.deepEqual(M.ordemPadrao(looks, ids).map(l => l.id), ['m1', 'd1', 'y1', 's1', 'm2', 'd2', 'y2', 's2']);
});

test('resultados com busca some com quem fez 0 ponto', () => {
    const r = M.resultados(dados, { ...vazio, busca: 'cargo' }, null).map(x => x.look.id);
    assert.deepEqual(r, ['s1', 'y2']); // empate em pontos → ordem padrão
});

test('resultados com busca vazia de sentido é igual a sem busca', () => {
    const a = M.resultados(dados, { ...vazio, busca: 'look pra' }, null).map(x => x.look.id);
    const b = M.resultados(dados, vazio, null).map(x => x.look.id);
    assert.deepEqual(a, b);
    assert.equal(a.length, 8);
});

test('resultados sem busca e com etiqueta ordena por % você', () => {
    const r = M.resultados(dados, vazio, etiquetaMD);
    assert.equal(r[0].pct, 100);
    for (let k = 1; k < r.length; k++) assert.ok(r[k - 1].pct >= r[k].pct);
});

// ---------- sugestões ----------
test('sugerir: até 5 e contagem respeita para quem', () => {
    assert.ok(M.sugerir('ca', dados, 'todos').length <= 5);
    const casual = M.sugerir('casual', dados, 'feminino').find(s => s.tipo === 'ocasiao');
    assert.equal(casual.valor, 'dia-a-dia');
    assert.equal(casual.total, 2); // d2 (fem) + s2 (unissex)
});

test('sugerir: prefixo antes de trecho, e tipo desempata', () => {
    const mini = {
        estilos: [{ id: 'preppy', nome: 'Preppy', sinonimos: [] }], ocasioes: [], paradas,
        looks: [
            { id: 'a', nome: 'Xadrez total', estilo: 'preppy', para: 'unissex', ocasioes: [], palavras: [], pecas: [peca('Camisa xadrez')] },
            { id: 'b', nome: 'Outro', estilo: 'preppy', para: 'unissex', ocasioes: [], palavras: [], pecas: [peca('Faixa de cabelo')] }
        ]
    };
    assert.deepEqual(M.sugerir('xa', mini, 'todos').map(s => s.tipo + ':' + s.rotulo), ['peca:Camisa xadrez', 'look:Xadrez total', 'peca:Faixa de cabelo']);
});

test('sugerir com menos de 2 letras não sugere', () => {
    assert.deepEqual(M.sugerir('c', dados, 'todos'), []);
});

test('sugerir acha estilo por sinônimo', () => {
    const r = M.sugerir('gót', dados, 'todos');
    assert.equal(r[0].tipo, 'estilo');
    assert.equal(r[0].valor, 'dark');
});

test('sugerirRemocoes aponta o filtro que traz mais looks', () => {
    const estado = { busca: '', estilos: ['minimal'], paraQuem: 'todos', ocasiao: 'festa' };
    assert.equal(M.resultados(dados, estado, null).length, 0);
    const r = M.sugerirRemocoes(dados, estado, null);
    assert.deepEqual(r.map(x => [x.filtro, x.total]), [['estilos', 4], ['ocasiao', 2]]);
});

// ---------- rodada do provador ----------
const grande = [];
['minimal', 'dark', 'y2k', 'streetwear'].forEach(e => {
    for (let k = 0; k < 4; k++) grande.push({ id: e + k, estilo: e, estilo2: null, para: k % 2 ? 'masculino' : 'feminino', ocasioes: [], palavras: [], pecas: [], nome: e + k });
});

test('montarRodada: 12 looks, sem repetir, cobrindo todos os estilos', () => {
    const r = M.montarRodada(grande, 'todos', ids, semente(7));
    assert.equal(r.length, 12);
    assert.equal(new Set(r.map(l => l.id)).size, 12);
    for (const e of ids) assert.ok(r.some(l => l.estilo === e), e);
});

test('montarRodada não põe dois do mesmo estilo seguidos', () => {
    for (let s = 1; s <= 30; s++) {
        const r = M.montarRodada(grande, 'todos', ids, semente(s));
        for (let k = 1; k < r.length; k++) assert.notEqual(r[k].estilo, r[k - 1].estilo, 'semente ' + s);
    }
});

test('montarRodada respeita para quem', () => {
    const r = M.montarRodada(grande, 'feminino', ids, semente(3));
    assert.equal(r.length, 8);
    assert.ok(r.every(l => l.para === 'feminino'));
});

test('montarRodada é determinística com a mesma semente', () => {
    const a = M.montarRodada(grande, 'todos', ids, semente(42)).map(l => l.id);
    const b = M.montarRodada(grande, 'todos', ids, semente(42)).map(l => l.id);
    assert.deepEqual(a, b);
});

test('montarRodada termina com um estilo só', () => {
    const r = M.montarRodada(grande.filter(l => l.estilo === 'dark'), 'todos', ids, semente(1));
    assert.equal(r.length, 4);
});

// ---------- etiqueta ----------
test('calcularEtiqueta: top 3 somando 100 por maior resto', () => {
    const r = M.calcularEtiqueta({ minimal: 3, dark: 1.5, y2k: 1, streetwear: 0.5 }, ids);
    assert.deepEqual(r.composicao, [{ estilo: 'minimal', pct: 55 }, { estilo: 'dark', pct: 27 }, { estilo: 'y2k', pct: 18 }]);
});

test('calcularEtiqueta: empate segue a ordem dos estilos', () => {
    const r = M.calcularEtiqueta({ streetwear: 2, y2k: 2, dark: 2, minimal: 2 }, ids);
    assert.deepEqual(r.composicao, [{ estilo: 'minimal', pct: 34 }, { estilo: 'dark', pct: 33 }, { estilo: 'y2k', pct: 33 }]);
});

test('calcularEtiqueta aceita 1 estilo e zero vira null', () => {
    assert.deepEqual(M.calcularEtiqueta({ dark: 1 }, ids).composicao, [{ estilo: 'dark', pct: 100 }]);
    assert.equal(M.calcularEtiqueta({}, ids), null);
    assert.equal(M.calcularEtiqueta({ dark: 0 }, ids), null);
});

// ---------- motivos, parecidos, link ----------
test('motivos cita a etiqueta', () => {
    const r = M.motivos(looks[0], { etiqueta: etiquetaMD, busca: '', ocasiao: null }, dados);
    assert.ok(r.some(s => s.includes('62% da sua etiqueta')), r.join(' | '));
});

test('motivos cita a busca com o texto digitado', () => {
    const r = M.motivos(looks[6], { etiqueta: null, busca: 'Cargo', ocasiao: null }, dados);
    assert.ok(r.some(s => s.includes('"Cargo"') && s.includes('calça cargo')), r.join(' | '));
});

test('motivos sem contexto usa a descrição do estilo', () => {
    assert.deepEqual(M.motivos(looks[2], { etiqueta: null, busca: '', ocasiao: null }, dados), ['Preto, couro e silhueta marcada.']);
});

test('motivos no máximo 3', () => {
    const r = M.motivos(looks[1], { etiqueta: etiquetaMD, busca: 'camisa entrevista', ocasiao: 'trabalho' }, dados);
    assert.ok(r.length <= 3);
});

test('parecidos: mesmo estilo primeiro, sem ele mesmo, até 4', () => {
    const r = M.parecidos(looks[2], looks, 'todos');
    assert.equal(r[0].id, 'd2');
    assert.ok(!r.some(l => l.id === 'd1'));
    assert.ok(r.length <= 4);
    assert.ok(r.some(l => l.id === 'm2')); // estilo2 dark
});

test('parecidos respeita para quem', () => {
    assert.ok(M.parecidos(looks[2], looks, 'masculino').every(l => l.para !== 'feminino'));
});

test('linkShopping monta busca do Google Shopping', () => {
    const u = M.linkShopping({ nome: 'Sobretudo reto', corNome: 'off-white' });
    assert.ok(u.startsWith('https://www.google.com/search?tbm=shop&q='));
    assert.ok(u.endsWith('q=Sobretudo%20reto%20off-white'));
});

test('linkShopping não repete a cor que já está no nome', () => {
    assert.ok(M.linkShopping({ nome: 'Jaqueta caramelo', corNome: 'caramelo' }).endsWith('q=Jaqueta%20caramelo'));
    assert.ok(M.linkShopping({ nome: 'Camiseta branca', corNome: 'branca' }).endsWith('q=Camiseta%20branca'));
});
