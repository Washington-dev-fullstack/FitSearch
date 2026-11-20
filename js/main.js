/* =========================================================
   MAIN: estado da página e ligação entre as partes
   ========================================================= */
(function () {
    'use strict';
    var FS = window.FS = window.FS || {};
    var U = FS.util;
    var guarda = FS.armazenamento.criar();
    var ids = U.idsEstilos();

    var app = FS.app = {
        estado: { busca: '', estilos: [], paraQuem: guarda.lerParaQuem(), ocasiao: null, modoEstilo: false },
        etiqueta: guarda.lerEtiqueta(ids),
        busca: null,

        definir: function (parcial) {
            var e = app.estado;
            if ('estilos' in parcial && !parcial.modoEstilo) e.modoEstilo = false;
            Object.keys(parcial).forEach(function (k) { e[k] = parcial[k]; });
            if ('paraQuem' in parcial) guarda.salvarParaQuem(parcial.paraQuem);
            FS.arara.render();
        },

        aplicar: function (s) {
            if (s.tipo === 'estilo') { app.definir({ estilos: [s.valor], busca: '' }); app.sincronizarBusca(); }
            else if (s.tipo === 'ocasiao') { app.definir({ ocasiao: s.valor, busca: '' }); app.sincronizarBusca(); }
            else if (s.tipo === 'peca') { app.definir({ busca: s.valor }); app.sincronizarBusca(); }
            else if (s.tipo === 'look') FS.gaveta.abrir(U.look(s.valor), document.getElementById('busca-campo'));
        },

        sincronizarBusca: function () { if (app.busca) app.busca.definirTexto(app.estado.busca); },

        definirEtiqueta: function (etq) {
            if (etq) {
                guarda.salvarEtiqueta(etq);
                app.etiqueta = guarda.lerEtiqueta(ids) || { versao: 1, composicao: etq.composicao, pontos: etq.pontos };
            } else {
                guarda.apagarEtiqueta();
                app.etiqueta = null;
                if (app.estado.modoEstilo) { app.estado.estilos = []; app.estado.modoEstilo = false; }
            }
            heroi();
            FS.arara.render();
        },

        verMeuEstilo: function () {
            if (!app.etiqueta) return;
            app.definir({ estilos: app.etiqueta.composicao.map(function (c) { return c.estilo; }), busca: '', ocasiao: null, modoEstilo: true });
            app.sincronizarBusca();
            var arara = document.getElementById('arara');
            U.rolarPara(arara);
            arara.focus({ preventScroll: true });
        }
    };

    // a etiqueta da abertura aparece só depois do provador
    function heroi() {
        var caixa = document.getElementById('etiqueta-heroi');
        var cta = document.getElementById('cta-principal');
        var dica = document.getElementById('abertura-dica');
        caixa.textContent = '';
        if (app.etiqueta) {
            caixa.appendChild(FS.etiqueta.criar(app.etiqueta, {
                titulo: 'Sua etiqueta',
                acoes: [{ acao: 'abrir-provador', texto: 'refazer provador →' }, { acao: 'apagar-etiqueta', texto: 'apagar minha etiqueta' }]
            }));
            caixa.hidden = false;
            cta.textContent = 'Ver looks do meu estilo →';
            cta.setAttribute('data-acao', 'ver-meu-estilo');
            dica.hidden = true;
        } else {
            caixa.hidden = true;
            cta.textContent = 'Entrar no provador →';
            cta.setAttribute('data-acao', 'abrir-provador');
            dica.hidden = false;
        }
    }

    // ações globais (as de dentro dos dialogs ficam com eles)
    document.addEventListener('click', function (e) {
        var b = e.target.closest('[data-acao]');
        if (!b || b.closest('dialog')) return;
        var acao = b.getAttribute('data-acao');
        if (acao === 'abrir-provador') { e.preventDefault(); FS.provador.abrir(); }
        else if (acao === 'ver-meu-estilo') { e.preventDefault(); app.verMeuEstilo(); }
        else if (acao === 'apagar-etiqueta') { app.definirEtiqueta(null); document.getElementById('cta-principal').focus(); }
        else if (acao === 'focar-busca') {
            e.preventDefault();
            app.busca.focar();
            U.rolarPara(document.getElementById('inicio'));
        }
    });

    var topo = document.querySelector('.topo');
    var marcarTopo = function () { topo.classList.toggle('rolou', window.scrollY > 8); };
    window.addEventListener('scroll', marcarTopo, { passive: true });
    marcarTopo();

    FS.movimento.preparar();
    FS.cortina.iniciar(document.getElementById('cortina'));
    app.busca = FS.busca.iniciar();
    FS.faixa.iniciar();
    FS.estilos.iniciar();
    FS.arara.iniciar();
    FS.gaveta.iniciar();
    FS.provador.iniciar();
    heroi();
    FS.arara.render();
    FS.movimento.abertura();
    FS.movimento.revelar();
})();
