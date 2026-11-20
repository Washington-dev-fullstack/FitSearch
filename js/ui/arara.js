/* =========================================================
   ARARA: filtros, grade de looks (com Flip) e estado vazio
   ========================================================= */
(function () {
    'use strict';
    var FS = window.FS = window.FS || {};
    var cartoes = new Map();
    var grade, titulo, vazio, chips, ocasioes, segmento, limpar, primeira = true, relogio = 0;

    // a arara muda de altura: as revelações na rolagem precisam recalcular onde começam
    function recalcularRolagem(espera) {
        if (!window.ScrollTrigger) return;
        clearTimeout(relogio);
        relogio = setTimeout(function () { window.ScrollTrigger.refresh(); }, espera);
    }

    function iniciar() {
        var U = FS.util, el = U.el;
        grade = document.getElementById('grade');
        titulo = document.getElementById('arara-titulo');
        vazio = document.getElementById('vazio');
        chips = document.querySelector('.chips');
        ocasioes = document.querySelector('.ocasioes-lista');
        segmento = document.querySelector('.segmento');
        limpar = document.querySelector('[data-acao="limpar-filtros"]');

        chips.appendChild(el('button', { type: 'button', class: 'chip rotulo-entalhe', 'data-estilo': '', 'aria-pressed': 'true', text: 'Todos os estilos' }));
        FS.dados.estilos.forEach(function (e) {
            chips.appendChild(el('button', { type: 'button', class: 'chip rotulo-entalhe', 'data-estilo': e.id, 'aria-pressed': 'false', text: e.nome }));
        });
        chips.addEventListener('click', function (ev) {
            var b = ev.target.closest('[data-estilo]');
            if (!b) return;
            var id = b.getAttribute('data-estilo');
            var lista = FS.app.estado.estilos.slice();
            if (!id) lista = [];
            else if (lista.indexOf(id) === -1) lista.push(id);
            else lista.splice(lista.indexOf(id), 1);
            FS.app.definir({ estilos: lista });
        });

        FS.dados.ocasioes.forEach(function (o) {
            ocasioes.appendChild(el('button', { type: 'button', class: 'pilula', 'data-ocasiao': o.id, 'aria-pressed': 'false', text: o.nome }));
        });
        ocasioes.addEventListener('click', function (ev) {
            var b = ev.target.closest('[data-ocasiao]');
            if (!b) return;
            var id = b.getAttribute('data-ocasiao');
            FS.app.definir({ ocasiao: FS.app.estado.ocasiao === id ? null : id });
        });

        [['todos', 'Todos'], ['feminino', 'Feminino'], ['masculino', 'Masculino']].forEach(function (p) {
            segmento.appendChild(el('button', { type: 'button', 'data-para': p[0], 'aria-pressed': 'false', text: p[1] }));
        });
        segmento.addEventListener('click', function (ev) {
            var b = ev.target.closest('[data-para]');
            if (b) FS.app.definir({ paraQuem: b.getAttribute('data-para') });
        });

        limpar.addEventListener('click', function () {
            FS.app.definir({ estilos: [], ocasiao: null, busca: '' });
            FS.app.sincronizarBusca();
        });

        FS.dados.looks.forEach(function (l) { cartoes.set(l.id, criarCartao(l)); });
        grade.addEventListener('click', function (ev) {
            var b = ev.target.closest('[data-look]');
            if (b) FS.gaveta.abrir(U.look(b.getAttribute('data-look')), b);
        });

        vazio.querySelector('.vazio-sugestoes').addEventListener('click', function (ev) {
            var b = ev.target.closest('[data-filtro]');
            if (!b) return;
            var troca = { busca: { busca: '' }, estilos: { estilos: [] }, ocasiao: { ocasiao: null }, paraQuem: { paraQuem: 'todos' } }[b.getAttribute('data-filtro')];
            FS.app.definir(troca);
            if ('busca' in troca) FS.app.sincronizarBusca();
        });
    }

    function criarCartao(l) {
        var U = FS.util, el = U.el, e = U.estilo(l.estilo);
        return el('li', { class: 'cartao', 'data-id': l.id },
            el('button', { type: 'button', class: 'cartao-botao', 'data-look': l.id },
                el('div', { class: 'cartao-foto' },
                    el('span', { class: 'cartao-tag rotulo-entalhe', text: e.nome }),
                    U.foto(l.foto, l.alt, 400, 533, { sizes: '(max-width: 767px) 46vw, (max-width: 1023px) 30vw, 290px' }),
                    el('span', { class: 'cartao-pct', hidden: true })
                ),
                el('h3', { class: 'cartao-nome', text: l.nome }),
                el('p', { class: 'cartao-pecas', text: l.pecas.slice(0, 3).map(function (p) { return p.nome.toLowerCase(); }).join(' · ') })
            )
        );
    }

    function marcarControles(est) {
        [].forEach.call(chips.children, function (b) {
            var id = b.getAttribute('data-estilo');
            b.setAttribute('aria-pressed', String(id ? est.estilos.indexOf(id) !== -1 : est.estilos.length === 0));
        });
        [].forEach.call(ocasioes.children, function (b) { b.setAttribute('aria-pressed', String(b.getAttribute('data-ocasiao') === est.ocasiao)); });
        [].forEach.call(segmento.children, function (b) { b.setAttribute('aria-pressed', String(b.getAttribute('data-para') === est.paraQuem)); });
    }

    function desenharVazio(est) {
        var U = FS.util, el = U.el;
        vazio.querySelector('.vazio-piada').textContent = U.piada();
        var caixa = vazio.querySelector('.vazio-sugestoes');
        caixa.textContent = '';
        FS.motor.sugerirRemocoes(FS.dados, est, FS.app.etiqueta).forEach(function (s) {
            caixa.appendChild(el('button', { type: 'button', class: 'botao botao-tinta', 'data-filtro': s.filtro,
                text: 'Tirar ' + s.rotulo + ' (traz ' + U.plural(s.total, 'look', 'looks') + ')' }));
        });
    }

    function render() {
        var U = FS.util, el = U.el, est = FS.app.estado, etq = FS.app.etiqueta;
        var interp = FS.motor.interpretar(est.busca, FS.dados);
        var temBusca = interp.termos.length + interp.dic.length > 0;
        var res = FS.motor.resultados(FS.dados, est, etq);

        marcarControles(est);
        limpar.hidden = !(est.estilos.length || est.ocasiao || temBusca);

        titulo.textContent = '';
        titulo.appendChild(document.createTextNode(U.plural(res.length, 'look', 'looks') + ' '));
        titulo.appendChild(el('em', { text: est.modoEstilo ? 'do seu estilo' : temBusca ? 'para "' + est.busca.trim() + '"' : 'na arara' }));

        var F = window.Flip, animar = !primeira && FS.movimento.ativo && F;
        var antes = animar ? F.getState(grade.querySelectorAll('.cartao:not([hidden])')) : null;
        var eramVisiveis = [];
        cartoes.forEach(function (li, id) { if (!li.hidden) eramVisiveis.push(id); });

        var visiveis = new Set();
        res.forEach(function (r) {
            var li = cartoes.get(r.look.id);
            visiveis.add(r.look.id);
            li.hidden = false;
            var pct = li.querySelector('.cartao-pct');
            var mostra = !!etq && r.pct > 0;
            pct.hidden = !mostra;
            pct.textContent = mostra ? r.pct + '% você' : '';
            li.querySelector('.cartao-botao').setAttribute('aria-label',
                r.look.nome + ', ' + U.estilo(r.look.estilo).nome + (mostra ? ', combina ' + r.pct + '% com você' : ''));
            grade.appendChild(li);
        });
        cartoes.forEach(function (li, id) {
            if (visiveis.has(id)) return;
            li.hidden = true;
            if (!li.parentNode) grade.appendChild(li);
        });

        vazio.hidden = res.length > 0;
        if (!res.length) desenharVazio(est);

        if (animar && antes) {
            var g = window.gsap;
            // só quem sai fica "absoluto": a grade mantém a altura real e nada abaixo dela é atropelado
            var saindo = eramVisiveis.filter(function (id) { return !visiveis.has(id); }).map(function (id) { return cartoes.get(id); });
            F.from(antes, {
                duration: 0.5, ease: 'power3.inOut', absolute: saindo.length ? saindo : false,
                onComplete: function () { recalcularRolagem(0); },
                onEnter: function (els) { return g.fromTo(els, { opacity: 0, y: -26, rotate: -6, transformOrigin: '50% 0' }, { opacity: 1, y: 0, rotate: 0, duration: 0.6, ease: 'back.out(1.6)', clearProps: 'transform,opacity' }); },
                onLeave: function (els) { return g.to(els, { opacity: 0, scale: 0.85, duration: 0.28, ease: 'power2.in' }); }
            });
        }
        primeira = false;
        if (!animar) recalcularRolagem(60);
    }

    FS.arara = { iniciar: iniciar, render: render };
})();
