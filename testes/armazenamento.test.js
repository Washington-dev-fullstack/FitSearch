const { test } = require('node:test');
const assert = require('node:assert/strict');
const A = require('../js/armazenamento.js');

const ids = ['minimal', 'dark', 'y2k'];
function memoria() {
    const m = new Map();
    return { getItem: k => (m.has(k) ? m.get(k) : null), setItem: (k, v) => m.set(k, String(v)), removeItem: k => m.delete(k), _m: m };
}
const quebrado = { getItem() { throw new Error('bloqueado'); }, setItem() { throw new Error('bloqueado'); }, removeItem() { throw new Error('bloqueado'); } };
const etq = { composicao: [{ estilo: 'minimal', pct: 62 }, { estilo: 'dark', pct: 38 }], pontos: { minimal: 5, dark: 3 } };

test('salva e lê a etiqueta de volta', () => {
    const s = A.criar(memoria());
    s.salvarEtiqueta(etq);
    const r = s.lerEtiqueta(ids);
    assert.deepEqual(r.composicao, etq.composicao);
    assert.equal(r.versao, 1);
    assert.match(r.data, /^\d{4}-\d{2}-\d{2}$/);
});

test('apagar remove a etiqueta', () => {
    const s = A.criar(memoria());
    s.salvarEtiqueta(etq);
    s.apagarEtiqueta();
    assert.equal(s.lerEtiqueta(ids), null);
});

test('JSON corrompido vira null', () => {
    const mem = memoria();
    mem.setItem('fitsearch.etiqueta', '{oops');
    assert.equal(A.criar(mem).lerEtiqueta(ids), null);
});

test('estilo desconhecido vira null', () => {
    const mem = memoria();
    mem.setItem('fitsearch.etiqueta', JSON.stringify({ versao: 1, composicao: [{ estilo: 'techwear', pct: 100 }], pontos: {} }));
    assert.equal(A.criar(mem).lerEtiqueta(ids), null);
});

test('porcentagens que não somam 100 viram null', () => {
    const mem = memoria();
    mem.setItem('fitsearch.etiqueta', JSON.stringify({ versao: 1, composicao: [{ estilo: 'dark', pct: 40 }], pontos: {} }));
    assert.equal(A.criar(mem).lerEtiqueta(ids), null);
});

test('armazenamento que explode não quebra nada', () => {
    const s = A.criar(quebrado);
    assert.doesNotThrow(() => s.salvarEtiqueta(etq));
    assert.doesNotThrow(() => s.apagarEtiqueta());
    assert.doesNotThrow(() => s.salvarParaQuem('feminino'));
    assert.equal(s.lerEtiqueta(ids), null);
    assert.equal(s.lerParaQuem(), 'todos');
});

test('sem armazenamento nenhum também funciona', () => {
    const s = A.criar(null);
    assert.equal(s.lerEtiqueta(ids), null);
    assert.equal(s.lerParaQuem(), 'todos');
});

test('para quem: salva, lê e rejeita valor inválido', () => {
    const mem = memoria();
    const s = A.criar(mem);
    s.salvarParaQuem('masculino');
    assert.equal(s.lerParaQuem(), 'masculino');
    mem.setItem('fitsearch.paraQuem', 'alien');
    assert.equal(s.lerParaQuem(), 'todos');
});
