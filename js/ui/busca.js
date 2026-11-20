/* =========================================================
   BUSCA: campo com sugestões (combobox acessível).
   Digitar já filtra a arara; Enter/Buscar leva até ela.
   ========================================================= */
(function () {
    'use strict';
    var FS = window.FS = window.FS || {};
    var TIPO = { estilo: 'Estilo', ocasiao: 'Ocasião', peca: 'Peça', look: 'Look' };

    function iniciar() {
        var U = FS.util, el = U.el;
        var campo = document.getElementById('busca-campo');
        var lista = document.getElementById('busca-lista');
        var botao = document.querySelector('.busca-botao');
        var itens = [], ativo = -1, espera = 0;

        // a arara só se reorganiza quando a pessoa para de digitar (as sugestões são instantâneas)
        function aplicarTexto() {
            clearTimeout(espera); espera = 0;
            if (FS.app.estado.busca !== campo.value) FS.app.definir({ busca: campo.value });
        }

        function abrir() { lista.hidden = false; campo.setAttribute('aria-expanded', 'true'); }
        function fechar() {
            lista.hidden = true; ativo = -1;
            campo.setAttribute('aria-expanded', 'false');
            campo.removeAttribute('aria-activedescendant');
        }

        function desenhar() {
            itens = FS.motor.sugerir(campo.value, FS.dados, FS.app.estado.paraQuem);
            lista.textContent = '';
            if (!itens.length) { fechar(); return; }
            itens.forEach(function (s, i) {
                var tipo = TIPO[s.tipo] + (s.tipo === 'look' ? '' : ' · ' + U.plural(s.total, 'look', 'looks'));
                lista.appendChild(el('li', {
                    class: 'busca-opcao', role: 'option', id: 'sugestao-' + i, 'aria-selected': 'false',
                    onmousedown: function (e) { e.preventDefault(); },
                    onclick: function () { aplicar(i); }
                }, el('span', { text: s.rotulo }), el('span', { class: 'busca-opcao-tipo', text: tipo })));
            });
            ativo = -1;
            abrir();
        }

        function marcar(i) {
            ativo = i;
            [].forEach.call(lista.children, function (li, k) { li.setAttribute('aria-selected', k === i ? 'true' : 'false'); });
            campo.setAttribute('aria-activedescendant', 'sugestao-' + i);
            if (lista.children[i]) lista.children[i].scrollIntoView({ block: 'nearest' });
        }

        function irParaArara() {
            aplicarTexto();
            fechar();
            var arara = document.getElementById('arara');
            U.rolarPara(arara);
            if (window.matchMedia('(hover: none)').matches) campo.blur();
        }

        function aplicar(i) {
            var s = itens[i];
            clearTimeout(espera); espera = 0;
            fechar();
            FS.app.aplicar(s);
            if (s.tipo !== 'look') irParaArara();
        }

        campo.addEventListener('input', function () {
            desenhar();
            clearTimeout(espera);
            espera = setTimeout(aplicarTexto, 220);
        });
        campo.addEventListener('keydown', function (e) {
            if (e.key === 'ArrowDown') {
                if (lista.hidden) desenhar();
                if (itens.length) { e.preventDefault(); marcar((ativo + 1) % itens.length); }
            } else if (e.key === 'ArrowUp') {
                if (itens.length && !lista.hidden) { e.preventDefault(); marcar((ativo - 1 + itens.length) % itens.length); }
            } else if (e.key === 'Enter') {
                e.preventDefault();
                if (!lista.hidden && ativo >= 0) aplicar(ativo); else irParaArara();
            } else if (e.key === 'Escape') {
                if (!lista.hidden) { e.preventDefault(); fechar(); }
                else if (campo.value) { e.preventDefault(); campo.value = ''; aplicarTexto(); }
            }
        });
        campo.addEventListener('focus', function () { if (campo.value.trim().length >= 2) desenhar(); });
        campo.addEventListener('blur', function () { setTimeout(fechar, 120); });
        botao.addEventListener('click', irParaArara);

        // "/" foca a busca de qualquer lugar
        document.addEventListener('keydown', function (e) {
            if (e.key !== '/' || e.ctrlKey || e.metaKey || e.altKey) return;
            var t = e.target;
            if (t && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName))) return;
            if (document.querySelector('dialog[open]')) return;
            e.preventDefault();
            campo.focus();
            campo.select();
        });

        return {
            definirTexto: function (t) { campo.value = t || ''; },
            focar: function () { campo.focus({ preventScroll: true }); }
        };
    }

    FS.busca = { iniciar: iniciar };
})();
