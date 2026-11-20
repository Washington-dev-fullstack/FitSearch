/* =========================================================
   MOVIMENTO: abertura, revelações na rolagem e utilidades.
   Sem GSAP (CDN fora do ar) ou com movimento reduzido,
   tudo continua funcionando, só que sem animação.
   ========================================================= */
(function () {
    'use strict';
    var FS = window.FS = window.FS || {};
    var consulta = window.matchMedia ? window.matchMedia('(prefers-reduced-motion: reduce)') : null;

    var M = {
        get reduzido() { return !!(consulta && consulta.matches); },
        get ativo() { return !!window.gsap && !M.reduzido; },

        preparar: function () {
            if (!window.gsap) return;
            if (window.Flip) window.gsap.registerPlugin(window.Flip);
            if (window.ScrollTrigger) window.gsap.registerPlugin(window.ScrollTrigger);
        },

        // ≤ 1,2 s: tiras desenrolam do varão, título sobe, destaque é costurado
        abertura: function () {
            if (!M.ativo) return;
            var g = window.gsap;
            var tl = g.timeline({ defaults: { ease: 'power3.out' } });
            tl.from('.tira-pano', { scaleY: 0, duration: 0.7, stagger: 0.035, ease: 'back.out(1.3)' }, 0)
              .from('.abertura .t-linha', { y: 36, opacity: 0, duration: 0.6, stagger: 0.08 }, 0.08)
              .from('.abertura-titulo .marca-texto', { clipPath: 'inset(0 100% 0 0)', duration: 0.45, ease: 'power2.inOut' }, 0.6)
              .from(['.abertura-texto .selo', '.abertura-sub', '.abertura .busca', '.abertura-acoes'], { y: 18, opacity: 0, duration: 0.5, stagger: 0.06, clearProps: 'transform,opacity' }, 0.3)
              .from('.etiqueta-heroi:not([hidden])', { y: 30, rotate: -12, opacity: 0, duration: 0.6, ease: 'back.out(1.6)', clearProps: 'all' }, 0.55);
        },

        // uma vez só, quando a seção entra na tela
        revelar: function () {
            if (!M.ativo || !window.ScrollTrigger) return;
            var g = window.gsap;
            g.utils.toArray('[data-revelar]').forEach(function (alvo) {
                g.from(alvo, { y: 24, opacity: 0, duration: 0.6, ease: 'power3.out', scrollTrigger: { trigger: alvo, start: 'top 88%', once: true } });
            });
            g.from('.estilos-lista > li', {
                x: -48, opacity: 0, duration: 0.6, stagger: 0.06, ease: 'power3.out',
                scrollTrigger: { trigger: '.estilos-lista', start: 'top 82%', once: true }
            });
            g.from('.como-rotulo', {
                clipPath: 'inset(0 100% 0 0)', duration: 0.9, ease: 'power3.inOut',
                scrollTrigger: { trigger: '.como-rotulo', start: 'top 85%', once: true }
            });
        }
    };

    FS.movimento = M;
})();
