/* =========================================================
   UTIL: criação segura de elementos (sempre textContent),
   fotos do Unsplash e pequenos formatadores
   ========================================================= */
(function () {
    'use strict';
    var FS = window.FS = window.FS || {};

    function el(tag, atributos) {
        var e = document.createElement(tag);
        var a = atributos || {};
        Object.keys(a).forEach(function (k) {
            var v = a[k];
            if (v == null || v === false) return;
            if (k === 'class') e.className = v;
            else if (k === 'text') e.textContent = v;
            else if (k === 'style' && typeof v === 'object') Object.keys(v).forEach(function (p) { e.style.setProperty(p, v[p]); });
            else if (k.indexOf('on') === 0 && typeof v === 'function') e.addEventListener(k.slice(2), v);
            else if (v === true) e.setAttribute(k, '');
            else e.setAttribute(k, String(v));
        });
        var poe = function (filho) {
            if (filho == null || filho === false) return;
            if (Array.isArray(filho)) { filho.forEach(poe); return; }
            e.appendChild(typeof filho === 'string' ? document.createTextNode(filho) : filho);
        };
        for (var i = 2; i < arguments.length; i++) poe(arguments[i]);
        return e;
    }

    function urlFoto(id, w, h, q) {
        return 'https://images.unsplash.com/photo-' + id + '?auto=format&fit=crop&w=' + w + '&h=' + h + '&q=' + (q || 70);
    }

    // <img> com srcset em 1x/2x e dimensões fixas (sem pulo de layout)
    function foto(id, alt, w, h, opcoes) {
        var o = opcoes || {};
        return el('img', {
            src: urlFoto(id, w, h),
            srcset: urlFoto(id, w, h) + ' ' + w + 'w, ' + urlFoto(id, w * 2, h * 2, 60) + ' ' + (w * 2) + 'w',
            sizes: o.sizes || w + 'px',
            width: w, height: h, alt: alt || '',
            loading: o.ansioso ? 'eager' : 'lazy', decoding: 'async', draggable: 'false'
        });
    }

    function acha(lista, id) { return (lista || []).filter(function (x) { return x.id === id; })[0] || null; }
    function estilo(id) { return acha(FS.dados.estilos, id); }
    function ocasiao(id) { return acha(FS.dados.ocasioes, id); }
    function look(id) { return acha(FS.dados.looks, id); }

    function preco(p) { return 'R$ ' + p[0] + '–' + p[1]; }
    function plural(n, um, varios) { return n + ' ' + (n === 1 ? um : varios); }
    function piada() { var l = FS.dados.piadas; return l[Math.floor(Math.random() * l.length)]; }
    function idsEstilos() { return FS.dados.estilos.map(function (e) { return e.id; }); }

    function hexRgb(hex) {
        var h = hex.replace('#', '');
        return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)].join(', ');
    }

    function rolarPara(alvo) {
        if (!alvo) return;
        var reduz = FS.movimento && FS.movimento.reduzido;
        alvo.scrollIntoView({ behavior: reduz ? 'auto' : 'smooth', block: 'start' });
    }

    FS.util = {
        el: el, urlFoto: urlFoto, foto: foto, estilo: estilo, ocasiao: ocasiao, look: look,
        preco: preco, plural: plural, piada: piada, idsEstilos: idsEstilos, hexRgb: hexRgb, rolarPara: rolarPara
    };
})();
