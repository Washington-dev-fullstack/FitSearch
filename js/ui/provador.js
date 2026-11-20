/* =========================================================
   PROVADOR: "fica ou não fica" em tela cheia
   Para quem → 12 looks sem nome de estilo → etiqueta
   ========================================================= */
(function () {
    'use strict';
    var FS = window.FS = window.FS || {};
    var NEON = '#D7FF3B', TINTA = '#141414';
    var CORES_CORTINA = ['#141414', '#F8F5EE', '#D7FF3B', '#BDB6A8'];

    var d, pilha, gNao, gFica, progresso, contagem, pontosCaixa, desfazerBotao, etqCanto, fimEtq, fimFrase, cortinaFx;
    var st = { para: 'todos', rodada: [], i: 0, pontos: {}, historico: [], ocupado: false, tinta: '20, 20, 20' };
    var passo = 'para', origem = null;

    function iniciar() {
        d = document.getElementById('provador');
        pilha = d.querySelector('.pilha');
        gNao = d.querySelector('.gigante-nao');
        gFica = d.querySelector('.gigante-fica');
        progresso = d.querySelector('.provador-progresso');
        contagem = d.querySelector('.provador-contagem');
        pontosCaixa = d.querySelector('.provador-pontos');
        desfazerBotao = d.querySelector('[data-acao="desfazer"]');
        etqCanto = d.querySelector('.provador-etiqueta');
        fimEtq = d.querySelector('.fim-etiqueta');
        fimFrase = d.querySelector('.fim-frase');
        cortinaFx = d.querySelector('.provador-cortina');
        for (var k = 0; k < 11; k++) {
            var tira = document.createElement('i');
            tira.style.background = CORES_CORTINA[k % CORES_CORTINA.length];
            cortinaFx.appendChild(tira);
        }

        d.addEventListener('click', function (e) {
            var b = e.target.closest('button');
            if (!b) return;
            var para = b.getAttribute('data-para'), acao = b.getAttribute('data-acao');
            if (para) comecar(para);
            else if (acao === 'fechar-provador') fechar();
            else if (acao === 'fica') decidir(true);
            else if (acao === 'nao') decidir(false);
            else if (acao === 'desfazer') desfazer();
            else if (acao === 'ver-meu-estilo') { origem = null; fechar(); FS.app.verMeuEstilo(); }
            else if (acao === 'refazer') { mostrar('para'); focarPara(); }
            else if (acao === 'nova-rodada') comecar(st.para);
        });
        d.addEventListener('keydown', function (e) {
            if (passo !== 'looks') return;
            if (e.key === 'ArrowRight') { e.preventDefault(); decidir(true); }
            else if (e.key === 'ArrowLeft') { e.preventDefault(); decidir(false); }
        });
        d.addEventListener('cancel', function (e) { e.preventDefault(); fechar(); });
        d.addEventListener('close', function () {
            document.documentElement.classList.remove('travado');
            if (origem && document.contains(origem)) origem.focus({ preventScroll: true });
        });
    }

    function pintar(cor, tinta) {
        d.style.setProperty('--flood', cor);
        d.style.setProperty('--flood-tinta', tinta);
        st.tinta = FS.util.hexRgb(tinta);
    }

    function mostrar(qual) {
        passo = qual;
        d.querySelectorAll('.provador-passo').forEach(function (s) { s.hidden = s.getAttribute('data-passo') !== qual; });
        progresso.hidden = qual !== 'looks';
        if (qual !== 'looks') pintar(NEON, TINTA);
        var foco = { looks: '[data-acao="fica"]', fim: '[data-acao="ver-meu-estilo"]', vazio: '[data-acao="nova-rodada"]' }[qual];
        if (foco) d.querySelector('[data-passo="' + qual + '"] ' + foco).focus({ preventScroll: true });
    }

    function focarPara() {
        var b = d.querySelector('[data-para="' + FS.app.estado.paraQuem + '"]') || d.querySelector('[data-para]');
        b.focus({ preventScroll: true });
    }

    function abrir() {
        origem = document.activeElement;
        if (!d.open) {
            d.showModal();
            document.documentElement.classList.add('travado');
        }
        mostrar('para');
        focarPara();
        if (!FS.movimento.ativo) return;
        var g = window.gsap, tiras = cortinaFx.children;
        g.timeline()
            .set(tiras, { scaleY: 0, transformOrigin: '50% 0' })
            .to(tiras, { scaleY: 1, duration: 0.4, stagger: 0.025, ease: 'power3.in' })
            .set(tiras, { transformOrigin: '50% 100%' })
            .to(tiras, { scaleY: 0, duration: 0.5, stagger: 0.025, ease: 'power3.out' }, '+=0.05')
            .from(d.querySelector('.passo-para').children, { y: 24, opacity: 0, duration: 0.5, stagger: 0.06, ease: 'power3.out', clearProps: 'transform,opacity' }, '-=0.45');
    }

    function fechar() { if (d.open) d.close(); }

    function urlCarta(l) { return FS.util.urlFoto(l.foto, 520, 780); }

    function comecar(para) {
        st.para = para;
        FS.app.definir({ paraQuem: para });
        st.rodada = FS.motor.montarRodada(FS.dados.looks, para, FS.util.idsEstilos());
        st.i = 0; st.pontos = {}; st.historico = []; st.ocupado = false;
        st.rodada.forEach(function (l) { var im = new Image(); im.src = urlCarta(l); });
        mostrar('looks');
        desenharPilha();
        atualizarEtiqueta();
    }

    function preencher(t) {
        gFica.style.color = 'rgba(' + st.tinta + ', ' + Math.max(0, t).toFixed(3) + ')';
        gNao.style.color = 'rgba(' + st.tinta + ', ' + Math.max(0, -t).toFixed(3) + ')';
    }

    function desenharPilha() {
        var U = FS.util, el = U.el;
        pilha.textContent = '';
        for (var k = 2; k >= 0; k--) {
            var l = st.rodada[st.i + k];
            if (!l) continue;
            var carta = el('div', { class: 'carta', style: { transform: 'translateY(' + (k * 13) + 'px) scale(' + (1 - k * 0.04) + ')' } },
                el('img', { src: urlCarta(l), alt: k === 0 ? 'Look ' + (st.i + 1) + ': ' + l.alt : '', draggable: 'false', width: 520, height: 780 }));
            if (k > 0) carta.setAttribute('aria-hidden', 'true');
            pilha.appendChild(carta);
            if (k === 0) ligarArrasto(carta);
        }
        var e = U.estilo(st.rodada[st.i].estilo);
        pintar(e.cor, e.corTexto);
        preencher(0);
        contagem.textContent = 'Look ' + (st.i + 1) + ' de ' + st.rodada.length;
        pontosCaixa.textContent = '';
        st.rodada.forEach(function (_, j) { pontosCaixa.appendChild(el('i', { class: j < st.i ? 'f' : null })); });
        desfazerBotao.disabled = !st.historico.length;
    }

    function ligarArrasto(carta) {
        var x0 = null, dx = 0;
        carta.addEventListener('pointerdown', function (e) {
            if (st.ocupado) return;
            x0 = e.clientX; dx = 0;
            carta.setPointerCapture(e.pointerId);
            carta.style.transition = 'none';
        });
        carta.addEventListener('pointermove', function (e) {
            if (x0 === null) return;
            dx = e.clientX - x0;
            carta.style.transform = 'translateX(' + dx + 'px) rotate(' + (dx / 16) + 'deg)';
            preencher(Math.max(-1, Math.min(1, dx / (carta.offsetWidth * 0.6))));
        });
        var soltar = function () {
            if (x0 === null) return;
            x0 = null;
            if (Math.abs(dx) > carta.offsetWidth * 0.4) { decidir(dx > 0); return; }
            carta.style.transition = 'transform 0.45s cubic-bezier(0.34, 1.56, 0.64, 1)';
            carta.style.transform = '';
            preencher(0);
        };
        carta.addEventListener('pointerup', soltar);
        carta.addEventListener('pointercancel', soltar);
    }

    function somar(look, sinal) {
        st.pontos[look.estilo] = (st.pontos[look.estilo] || 0) + sinal;
        if (look.estilo2) st.pontos[look.estilo2] = (st.pontos[look.estilo2] || 0) + 0.5 * sinal;
    }

    function decidir(fica) {
        if (st.ocupado || passo !== 'looks') return;
        var look = st.rodada[st.i];
        if (!look) return;
        st.ocupado = true;
        st.historico.push({ i: st.i, fica: fica });
        if (fica) somar(look, 1);
        atualizarEtiqueta();
        preencher(fica ? 1 : -1);

        var seguir = function () {
            st.i++;
            st.ocupado = false;
            if (st.i >= st.rodada.length) finalizar(); else desenharPilha();
        };
        if (FS.movimento.reduzido) { seguir(); return; }
        var carta = pilha.lastChild;
        carta.style.transition = 'transform 0.45s cubic-bezier(0.5, 0, 0.75, 0), opacity 0.45s';
        carta.style.transform = 'translateX(' + (fica ? 150 : -150) + '%) rotate(' + (fica ? 22 : -22) + 'deg)';
        carta.style.opacity = '0';
        setTimeout(seguir, 400);
    }

    function desfazer() {
        if (st.ocupado || !st.historico.length) return;
        var h = st.historico.pop();
        if (h.fica) somar(st.rodada[h.i], -1);
        st.i = h.i;
        atualizarEtiqueta();
        desenharPilha();
        if (desfazerBotao.disabled) d.querySelector('[data-acao="fica"]').focus({ preventScroll: true });
    }

    // durante a rodada a etiqueta cresce, mas sem nomes: você escolhe pelo olho
    function atualizarEtiqueta() {
        var etq = FS.motor.calcularEtiqueta(st.pontos, FS.util.idsEstilos());
        etqCanto.textContent = '';
        var el = FS.etiqueta.criar(etq, { barras: true, titulo: 'Composição', vazio: 'Diga se fica ou não fica: a etiqueta vai se costurando aqui.' });
        el.querySelectorAll('.etiqueta-nome').forEach(function (n) { n.textContent = '? ? ?'; });
        if (etq) el.appendChild(FS.util.el('small', { class: 'etiqueta-piada', text: 'os nomes aparecem no fim' }));
        etqCanto.appendChild(el);
    }

    function costura() {
        var NS = 'http://www.w3.org/2000/svg';
        var svg = document.createElementNS(NS, 'svg');
        svg.setAttribute('class', 'costura-svg');
        svg.setAttribute('aria-hidden', 'true');
        svg.innerHTML = '<defs><mask id="costura-mascara"><rect class="costura-linha" x="0" y="0" width="100%" height="100%" rx="3" pathLength="100" fill="none" stroke="#fff" stroke-width="5" stroke-dasharray="100" stroke-dashoffset="0"/></mask></defs>' +
            '<rect x="0" y="0" width="100%" height="100%" rx="3" mask="url(#costura-mascara)"/>';
        return svg;
    }

    function finalizar() {
        var etq = FS.motor.calcularEtiqueta(st.pontos, FS.util.idsEstilos());
        if (!etq) { mostrar('vazio'); return; }
        FS.app.definirEtiqueta(etq);
        fimFrase.textContent = FS.etiqueta.frase(etq);
        fimEtq.textContent = '';
        var etqEl = FS.etiqueta.criar(etq, { barras: true, titulo: 'Composição', piada: 'lavar à mão · não seguir tendências · usar sem moderação' });
        var svg = costura();
        etqEl.appendChild(svg);
        fimEtq.appendChild(etqEl);
        mostrar('fim');
        if (!FS.movimento.ativo) return;

        var g = window.gsap;
        g.from(fimEtq, { y: 50, rotate: -14, opacity: 0, duration: 0.7, ease: 'back.out(1.5)' });
        g.fromTo(svg.querySelector('.costura-linha'), { attr: { 'stroke-dashoffset': 100 } }, { attr: { 'stroke-dashoffset': 0 }, duration: 1.2, ease: 'power2.inOut', delay: 0.35 });
        etqEl.querySelectorAll('.etiqueta-barra i').forEach(function (b) { g.from(b, { width: 0, duration: 0.9, ease: 'power3.out', delay: 0.5 }); });
        etqEl.querySelectorAll('.etiqueta-pct').forEach(function (p, k) {
            var alvo = etq.composicao[k].pct, contador = { v: 0 };
            g.to(contador, { v: alvo, duration: 0.9, ease: 'power3.out', delay: 0.5, onUpdate: function () { p.textContent = Math.round(contador.v) + '%'; } });
        });
        g.from('.fim-texto > *', { y: 20, opacity: 0, duration: 0.5, stagger: 0.07, ease: 'power3.out', clearProps: 'transform,opacity' });
    }

    FS.provador = { iniciar: iniciar, abrir: abrir, fechar: fechar };
})();
