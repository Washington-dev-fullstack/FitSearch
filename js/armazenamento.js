/* =========================================================
   ARMAZENAMENTO: etiqueta e "para quem" no navegador.
   Qualquer falha (bloqueio, JSON quebrado) vira "primeira visita".
   ========================================================= */
(function (raiz, fabrica) {
    var api = fabrica();
    if (typeof module === 'object' && module.exports) module.exports = api;
    else { raiz.FS = raiz.FS || {}; raiz.FS.armazenamento = api; }
})(typeof self !== 'undefined' ? self : this, function () {
    'use strict';

    var CHAVE_ETIQUETA = 'fitsearch.etiqueta';
    var CHAVE_PARA = 'fitsearch.paraQuem';
    var PARA_VALIDOS = ['todos', 'feminino', 'masculino'];

    function hoje() {
        var d = new Date();
        var dois = function (n) { return (n < 10 ? '0' : '') + n; };
        return d.getFullYear() + '-' + dois(d.getMonth() + 1) + '-' + dois(d.getDate());
    }

    function etiquetaValida(e, idsValidos) {
        if (!e || e.versao !== 1 || !Array.isArray(e.composicao) || !e.composicao.length || e.composicao.length > 3) return false;
        var soma = 0;
        for (var i = 0; i < e.composicao.length; i++) {
            var c = e.composicao[i];
            if (!c || idsValidos.indexOf(c.estilo) === -1 || typeof c.pct !== 'number' || c.pct < 0 || c.pct > 100) return false;
            soma += c.pct;
        }
        return Math.abs(soma - 100) <= 1;
    }

    function criar(storage) {
        if (storage === undefined) {
            try { storage = typeof localStorage !== 'undefined' ? localStorage : null; } catch (e) { storage = null; }
        }
        var ler = function (k) { try { return storage ? storage.getItem(k) : null; } catch (e) { return null; } };
        var gravar = function (k, v) { try { if (storage) storage.setItem(k, v); } catch (e) { /* sem espaço ou bloqueado */ } };
        var tirar = function (k) { try { if (storage) storage.removeItem(k); } catch (e) { /* idem */ } };

        return {
            lerEtiqueta: function (idsValidos) {
                var bruto = ler(CHAVE_ETIQUETA);
                if (!bruto) return null;
                try {
                    var e = JSON.parse(bruto);
                    return etiquetaValida(e, idsValidos) ? e : null;
                } catch (err) { return null; }
            },
            salvarEtiqueta: function (etq) {
                gravar(CHAVE_ETIQUETA, JSON.stringify({ versao: 1, composicao: etq.composicao, pontos: etq.pontos || {}, data: hoje() }));
            },
            apagarEtiqueta: function () { tirar(CHAVE_ETIQUETA); },
            lerParaQuem: function () {
                var v = ler(CHAVE_PARA);
                return PARA_VALIDOS.indexOf(v) !== -1 ? v : 'todos';
            },
            salvarParaQuem: function (v) {
                if (PARA_VALIDOS.indexOf(v) !== -1) gravar(CHAVE_PARA, v);
            }
        };
    }

    return { criar: criar };
});
