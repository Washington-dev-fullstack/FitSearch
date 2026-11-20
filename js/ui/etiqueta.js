/* =========================================================
   ETIQUETA: a etiqueta de composição, desenhada num lugar só
   (abertura, canto do provador e resultado)
   ========================================================= */
(function () {
    'use strict';
    var FS = window.FS = window.FS || {};

    // etq: { composicao: [{ estilo, pct }] } ou null
    // op: { titulo, barras, piada, acoes: [{ acao, texto }], vazio, classe }
    function criar(etq, op) {
        var U = FS.util, el = U.el;
        op = op || {};
        var raiz = el('div', { class: 'etiqueta' + (op.barras ? ' com-barras' : '') + (op.classe ? ' ' + op.classe : '') });
        raiz.appendChild(el('b', { class: 'etiqueta-titulo', text: op.titulo || 'Composição' }));

        if (!etq) {
            raiz.appendChild(el('p', { class: 'etiqueta-vazia', text: op.vazio || 'Diga se fica ou não fica.' }));
            return raiz;
        }

        var lista = el('ul', { class: 'etiqueta-linhas' });
        etq.composicao.forEach(function (c) {
            var e = U.estilo(c.estilo);
            lista.appendChild(el('li', { class: 'etiqueta-linha' },
                el('span', { class: 'etiqueta-nome', text: e ? e.nome : c.estilo }),
                op.barras ? el('span', { class: 'etiqueta-barra', 'aria-hidden': 'true' }, el('i', { style: { width: c.pct + '%' } })) : null,
                el('span', { class: 'etiqueta-pct', text: c.pct + '%' })
            ));
        });
        raiz.appendChild(lista);

        if (op.piada) raiz.appendChild(el('small', { class: 'etiqueta-piada', text: op.piada }));
        if (op.acoes && op.acoes.length) {
            raiz.appendChild(el('div', { class: 'etiqueta-acoes' }, op.acoes.map(function (a) {
                return el('button', { type: 'button', class: 'etiqueta-acao', 'data-acao': a.acao, text: a.texto });
            })));
        }
        return raiz;
    }

    // frase do resultado: "Você é principalmente X, com um pé no Y e um toque de Z."
    function frase(etq) {
        var nomes = etq.composicao.map(function (c) { return FS.util.estilo(c.estilo).nome; });
        if (nomes.length === 1) return 'Você é 100% ' + nomes[0] + '. Sem dúvida nenhuma.';
        if (nomes.length === 2) return 'Você é principalmente ' + nomes[0] + ', com um toque de ' + nomes[1] + '.';
        return 'Você é principalmente ' + nomes[0] + ', com um pé no ' + nomes[1] + ' e um toque de ' + nomes[2] + '.';
    }

    FS.etiqueta = { criar: criar, frase: frase };
})();
