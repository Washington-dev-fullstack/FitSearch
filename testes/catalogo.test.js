const { test } = require('node:test');
const assert = require('node:assert/strict');
const D = require('../js/dados.js');

const IDS = ['minimal', 'old-money', 'streetwear', 'y2k', 'boho', 'dark', 'romantico', 'preppy', 'vintage'];
const CORES = { minimal: '#E4DCCB', 'old-money': '#BFD8B0', streetwear: '#FF9A57', y2k: '#FF8AC0', boho: '#E9A67A', dark: '#3A3735', romantico: '#C9B8FF', preppy: '#A9D4FF', vintage: '#F2C14E' };
const OCASIOES = ['dia-a-dia', 'trabalho', 'faculdade', 'festa', 'encontro', 'viagem'];

test('9 estilos com os ids e as cores do spec', () => {
    assert.deepEqual(D.estilos.map(e => e.id), IDS);
    D.estilos.forEach(e => {
        assert.equal(e.cor, CORES[e.id], e.id);
        assert.ok(e.nome && e.curta && e.descricao && e.comecar, e.id);
        assert.equal(e.pecasChave.length, 3, e.id);
        assert.ok(Array.isArray(e.sinonimos) && e.sinonimos.length, e.id);
    });
    assert.equal(D.estilos.find(e => e.id === 'dark').corTexto, '#F8F5EE');
});

test('6 ocasiões do spec', () => {
    assert.deepEqual(D.ocasioes.map(o => o.id), OCASIOES);
});

test('36 looks, ids únicos', () => {
    assert.equal(D.looks.length, 36);
    assert.equal(new Set(D.looks.map(l => l.id)).size, 36);
});

test('cada estilo tem 4+ looks, com feminino e masculino', () => {
    IDS.forEach(id => {
        const ls = D.looks.filter(l => l.estilo === id);
        assert.ok(ls.length >= 4, id);
        assert.ok(ls.some(l => l.para === 'feminino' || l.para === 'unissex'), id + ' fem');
        assert.ok(ls.some(l => l.para === 'masculino'), id + ' masc');
    });
});

test('referências e campos de cada look são válidos', () => {
    D.looks.forEach(l => {
        assert.ok(IDS.includes(l.estilo), l.id);
        assert.ok(l.estilo2 === null || (IDS.includes(l.estilo2) && l.estilo2 !== l.estilo), l.id);
        assert.ok(['feminino', 'masculino', 'unissex'].includes(l.para), l.id);
        assert.ok(l.ocasioes.length >= 1 && l.ocasioes.every(o => OCASIOES.includes(o)), l.id);
        assert.match(l.foto, /^\d{10,13}-[a-f0-9]{12}$/, l.id);
        assert.ok(l.nome && l.alt, l.id);
        assert.ok(Array.isArray(l.palavras), l.id);
    });
});

test('cada look tem de 3 a 5 peças com preço válido', () => {
    D.looks.forEach(l => {
        assert.ok(l.pecas.length >= 3 && l.pecas.length <= 5, l.id);
        l.pecas.forEach(p => {
            assert.ok(p.nome && p.categoria && p.corNome, l.id + ' ' + p.nome);
            assert.match(p.cor, /^#[0-9A-F]{6}$/i, l.id + ' ' + p.nome);
            assert.ok(p.preco[0] > 0 && p.preco[0] < p.preco[1], l.id + ' ' + p.nome);
        });
    });
});

test('nenhum sinônimo aponta para dois lugares', () => {
    const M = require('../js/motor.js');
    const visto = new Map();
    D.estilos.concat(D.ocasioes).forEach(item => {
        [item.nome].concat(item.sinonimos || []).forEach(s => {
            const k = M.normalizar(s);
            if (visto.has(k)) assert.equal(visto.get(k), item.id, 'sinônimo repetido: ' + s);
            visto.set(k, item.id);
        });
    });
});

test('tem palavras de parada e piadas de etiqueta', () => {
    ['pra', 'para', 'de', 'look', 'roupa'].forEach(p => assert.ok(D.paradas.includes(p), p));
    assert.ok(D.piadas.includes('lavar à mão · não seguir tendências'));
});
