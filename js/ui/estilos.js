/* =========================================================
   ESTILOS DE A A Z: cada estilo numa etiqueta larga
   ========================================================= */
(function () {
    'use strict';
    var FS = window.FS = window.FS || {};
    var VARIANTES = ['', 'v-creme', 'v-linho', 'v-neon', '', 'v-creme', 'v-linho', '', 'v-creme'];

    function iniciar() {
        var el = FS.util.el;
        var lista = document.querySelector('.estilos-lista');
        var ordem = FS.dados.estilos.slice().sort(function (a, b) { return a.nome.localeCompare(b.nome, 'pt-BR'); });

        ordem.forEach(function (e, i) {
            var n = FS.dados.looks.filter(function (l) { return l.estilo === e.id; }).length;
            lista.appendChild(el('li', null,
                el('button', { type: 'button', class: 'faixa-estilo rotulo-entalhe ' + VARIANTES[i % VARIANTES.length], 'data-estilo': e.id },
                    el('span', { class: 'faixa-estilo-nome', text: e.nome }),
                    el('span', { class: 'faixa-estilo-curta', text: e.curta }),
                    el('span', { class: 'faixa-estilo-pecas', text: e.pecasChave.join(' · ') }),
                    el('span', { class: 'faixa-estilo-conta', text: FS.util.plural(n, 'look', 'looks') + ' →' }),
                    el('span', { class: 'faixa-estilo-mais' },
                        el('span', null, el('b', { text: 'O que é' }), e.descricao),
                        el('span', null, el('b', { text: 'Por onde começar' }), e.comecar)
                    )
                )
            ));
        });

        lista.addEventListener('click', function (ev) {
            var b = ev.target.closest('[data-estilo]');
            if (!b) return;
            FS.app.aplicar({ tipo: 'estilo', valor: b.getAttribute('data-estilo') });
            FS.util.rolarPara(document.getElementById('arara'));
        });
    }

    FS.estilos = { iniciar: iniciar };
})();
