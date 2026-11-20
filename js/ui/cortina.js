/* =========================================================
   CORTINA: tiras de etiqueta que se abrem com a mão.
   Cada tira gira e se afasta do ponteiro (queda gaussiana);
   parada, uma "mão invisível" passa devagar.
   ========================================================= */
(function () {
    'use strict';
    var FS = window.FS = window.FS || {};

    var TIRAS = [
        ['t-preto', 'minimal · old money · streetwear', 100],
        ['t-creme', 'fica? · não é pra mim? · fica?', 97],
        ['t-neon', '100% você', 94],
        ['t-linho', 'y2k · boho · dark · preppy', 100],
        ['t-preto', 'lavar à mão · não seguir tendências', 96],
        ['t-creme', 'romântico · vintage · clean', 99],
        ['t-preto', 'experimente · experimente', 93],
        ['t-neon', 'composição: você', 100],
        ['t-creme', 'old money · street · y2k', 95],
        ['t-linho', 'não passar · só vestir', 98],
        ['t-preto', 'fitsearch · fitsearch', 94]
    ];

    function iniciar(cortina) {
        var el = FS.util.el;
        var caixa = cortina.querySelector('.cortina-tiras');
        var tiras = TIRAS.map(function (t) {
            var tira = el('div', { class: 'tira', style: { '--h': t[2] + '%' } }, el('div', { class: 'tira-pano ' + t[0], text: t[1] }));
            caixa.appendChild(tira);
            return tira;
        });
        if (FS.movimento.reduzido) return;

        var mx = 0.5, dentro = false, forca = 0, inicio = performance.now();
        var visivel = true, rodando = false, raf = 0;
        var mover = function (e) {
            var r = cortina.getBoundingClientRect();
            mx = (e.clientX - r.left) / r.width;
            dentro = true;
        };
        var sair = function () { dentro = false; };
        cortina.addEventListener('pointermove', mover);
        cortina.addEventListener('pointerdown', mover);
        cortina.addEventListener('pointerleave', sair);
        cortina.addEventListener('pointercancel', sair);
        cortina.addEventListener('pointerup', function (e) { if (e.pointerType !== 'mouse') sair(); });

        function quadro(agora) {
            var t = (agora - inicio) / 1000;
            var x = dentro ? mx : 0.5 + Math.sin(t * 0.6) * 0.46;
            forca += ((dentro ? 1 : 0.8) - forca) * 0.08;
            for (var k = 0; k < tiras.length; k++) {
                var d = (k + 0.5) / tiras.length - x;
                var inf = Math.exp(-(d * d) / (2 * 0.075 * 0.075));
                var lado = d < 0 ? -1 : 1;
                var ang = lado * inf * 17 * forca + Math.sin(t * 1.4 + k * 0.9) * 0.7;
                tiras[k].style.transform = 'translateX(' + (lado * inf * 18 * forca).toFixed(2) + 'px) rotate(' + (-ang).toFixed(2) + 'deg)';
            }
            raf = requestAnimationFrame(quadro);
        }
        function liga() { if (!rodando && visivel && !document.hidden) { rodando = true; raf = requestAnimationFrame(quadro); } }
        function desliga() { rodando = false; cancelAnimationFrame(raf); }

        if ('IntersectionObserver' in window) {
            new IntersectionObserver(function (entradas) {
                visivel = entradas[0].isIntersecting;
                if (visivel) liga(); else desliga();
            }).observe(cortina);
        }
        document.addEventListener('visibilitychange', function () { if (document.hidden) desliga(); else liga(); });
        liga();
    }

    FS.cortina = { iniciar: iniciar };
})();
