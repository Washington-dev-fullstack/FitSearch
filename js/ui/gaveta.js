/* =========================================================
   GAVETA: detalhe do look (lateral; no celular, de baixo)
   ========================================================= */
(function () {
    'use strict';
    var FS = window.FS = window.FS || {};
    var dialogo, conteudo, origem = null;
    var PARA = { feminino: 'Feminino', masculino: 'Masculino', unissex: 'Unissex' };

    function celular() { return window.matchMedia('(max-width: 767px)').matches; }

    function iniciar() {
        dialogo = document.getElementById('gaveta');
        conteudo = dialogo.querySelector('.gaveta-conteudo');
        dialogo.addEventListener('click', function (e) {
            if (e.target === dialogo) { fechar(); return; }
            if (e.target.closest('[data-acao="fechar-gaveta"]')) { fechar(); return; }
            var p = e.target.closest('[data-parecido]');
            if (p) preencher(FS.util.look(p.getAttribute('data-parecido')), true);
        });
        dialogo.addEventListener('cancel', function (e) { e.preventDefault(); fechar(); });
        dialogo.addEventListener('close', function () {
            document.documentElement.classList.remove('travado');
            if (origem && document.contains(origem)) origem.focus({ preventScroll: true });
        });
    }

    function abrir(look, el) {
        if (!look) return;
        origem = el || document.activeElement;
        preencher(look, false);
        if (!dialogo.open) {
            dialogo.showModal();
            document.documentElement.classList.add('travado');
            if (FS.movimento.ativo) {
                window.gsap.fromTo(dialogo, celular() ? { yPercent: 100 } : { xPercent: 100 },
                    { xPercent: 0, yPercent: 0, duration: 0.45, ease: 'power3.out', clearProps: 'transform' });
            }
        }
        dialogo.scrollTop = 0;
        dialogo.querySelector('.gaveta-fechar').focus({ preventScroll: true });
    }

    function fechar() {
        if (!dialogo.open) return;
        if (!FS.movimento.ativo) { dialogo.close(); return; }
        var fim = celular() ? { yPercent: 100 } : { xPercent: 100 };
        fim.duration = 0.3; fim.ease = 'power2.in';
        fim.onComplete = function () { dialogo.close(); window.gsap.set(dialogo, { clearProps: 'transform' }); };
        window.gsap.to(dialogo, fim);
    }

    function preencher(look, troca) {
        var U = FS.util, el = U.el, M = FS.motor, est = FS.app.estado;
        var e = U.estilo(look.estilo);
        var temContexto = !!FS.app.etiqueta || !!String(est.busca || '').trim() || !!est.ocasiao;
        var motivos = M.motivos(look, { etiqueta: FS.app.etiqueta, busca: est.busca, ocasiao: est.ocasiao }, FS.dados);
        var parecidos = M.parecidos(look, FS.dados.looks, est.paraQuem);
        var generico = motivos.length === 1 && motivos[0] === e.descricao;

        conteudo.textContent = '';
        conteudo.appendChild(el('div', { class: 'gaveta-foto' },
            U.foto(look.foto, look.alt, 580, 725, { ansioso: true, sizes: '(max-width: 767px) 100vw, 580px' })));
        conteudo.appendChild(el('div', { class: 'gaveta-corpo' },
            el('span', { class: 'gaveta-chip rotulo-entalhe', text: e.nome }),
            el('h2', { class: 'gaveta-nome', id: 'gaveta-nome', tabindex: '-1', text: look.nome }),
            el('p', { class: 'gaveta-meta', text: look.ocasioes.map(function (o) { return U.ocasiao(o).nome; }).join(' · ') + ' · ' + PARA[look.para] }),
            el('h3', { class: 'gaveta-rotulo', text: temContexto && !generico ? 'Por que combina com você' : 'Sobre o estilo' }),
            el('ul', { class: 'gaveta-motivos' }, motivos.map(function (m) { return el('li', { text: m }); })),
            el('h3', { class: 'gaveta-rotulo', text: 'Peças do look' }),
            el('ul', { class: 'gaveta-pecas' }, look.pecas.map(function (p) {
                return el('li', { class: 'gaveta-peca' },
                    el('span', { class: 'gaveta-peca-cor', style: { background: p.cor }, 'aria-hidden': 'true' }),
                    el('span', { class: 'gaveta-peca-nome', text: p.nome }),
                    el('span', { class: 'gaveta-peca-preco', text: U.preco(p.preco) }),
                    el('a', { class: 'gaveta-peca-link', href: M.linkShopping(p), target: '_blank', rel: 'noopener noreferrer',
                        'aria-label': 'Procurar ' + p.nome + ' no Google Shopping (abre em nova aba)', text: 'Procurar essa peça ↗' })
                );
            })),
            el('p', { class: 'gaveta-nota', text: 'Faixas de preço estimadas. O FitSearch não vende nada: o link abre uma busca no Google Shopping.' }),
            parecidos.length ? el('h3', { class: 'gaveta-rotulo', text: 'Looks parecidos' }) : null,
            parecidos.length ? el('div', { class: 'gaveta-parecidos' }, parecidos.map(function (l) {
                return el('button', { type: 'button', class: 'gaveta-parecido', 'data-parecido': l.id },
                    el('div', { class: 'gaveta-parecido-foto' }, U.foto(l.foto, '', 140, 187)),
                    el('span', { text: l.nome }));
            })) : null
        ));

        if (troca) {
            dialogo.scrollTop = 0;
            conteudo.querySelector('.gaveta-nome').focus({ preventScroll: true });
        }
    }

    FS.gaveta = { iniciar: iniciar, abrir: abrir, fechar: fechar };
})();
