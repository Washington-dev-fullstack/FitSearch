/* =========================================================
   FAIXA: fita tecida rolando com os estilos (toque = filtro)
   A segunda cópia só existe para o laço infinito.
   ========================================================= */
(function () {
    'use strict';
    var FS = window.FS = window.FS || {};

    function iniciar() {
        var el = FS.util.el;
        var trilho = document.querySelector('.faixa-trilho');
        [false, true].forEach(function (copia) {
            FS.dados.estilos.forEach(function (e, i) {
                trilho.appendChild(el('button', {
                    type: 'button', class: 'faixa-item' + (i % 4 === 1 ? ' destaque' : ''), 'data-estilo': e.id, text: e.nome,
                    'data-copia': copia, 'aria-hidden': copia ? 'true' : null, tabindex: copia ? '-1' : null
                }));
            });
        });
        trilho.addEventListener('click', function (ev) {
            var b = ev.target.closest('[data-estilo]');
            if (!b) return;
            FS.app.aplicar({ tipo: 'estilo', valor: b.getAttribute('data-estilo') });
            FS.util.rolarPara(document.getElementById('arara'));
        });
    }

    FS.faixa = { iniciar: iniciar };
})();
