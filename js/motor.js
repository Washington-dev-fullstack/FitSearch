/* =========================================================
   MOTOR: só funções puras (busca, filtros, provador, etiqueta)
   Roda no navegador (window.FS.motor) e no Node (testes).
   ========================================================= */
(function (raiz, fabrica) {
    var api = fabrica();
    if (typeof module === 'object' && module.exports) module.exports = api;
    else { raiz.FS = raiz.FS || {}; raiz.FS.motor = api; }
})(typeof self !== 'undefined' ? self : this, function () {
    'use strict';

    var TIPOS = { estilo: 0, ocasiao: 1, peca: 2, look: 3 };

    // ---------- texto ----------
    function normalizar(t) {
        return String(t == null ? '' : t)
            .toLowerCase()
            .normalize('NFD').replace(/[̀-ͯ]/g, '')
            .replace(/[^a-z0-9]+/g, ' ')
            .trim()
            .split(' ')
            .filter(Boolean)
            .map(function (p) { return p.length > 3 && p.charAt(p.length - 1) === 's' ? p.slice(0, -1) : p; })
            .join(' ');
    }

    function palavrasUteis(texto, paradas) {
        var fora = new Set((paradas || []).map(normalizar));
        return normalizar(texto).split(' ').filter(function (p) { return p.length >= 2 && !fora.has(p); });
    }

    // dicionário: nome e sinônimos de estilos e ocasiões → { tipo, id }
    var cacheDic = typeof WeakMap === 'function' ? new WeakMap() : null;
    function dicionario(dados) {
        if (cacheDic && cacheDic.has(dados)) return cacheDic.get(dados);
        var dic = new Map();
        var poe = function (tipo, item) {
            [item.nome].concat(item.sinonimos || []).forEach(function (chave) {
                var k = palavrasUteis(chave, dados.paradas).join(' ');
                if (k && !dic.has(k)) dic.set(k, { tipo: tipo, id: item.id });
            });
        };
        (dados.estilos || []).forEach(function (e) { poe('estilo', e); });
        (dados.ocasioes || []).forEach(function (o) { poe('ocasiao', o); });
        if (cacheDic) cacheDic.set(dados, dic);
        return dic;
    }

    function interpretar(busca, dados) {
        var p = palavrasUteis(busca, dados.paradas);
        var dic = dicionario(dados);
        var termos = [], achados = [], vistos = new Set();
        for (var i = 0; i < p.length;) {
            var achou = false;
            for (var n = 3; n >= 1; n--) {
                if (i + n > p.length) continue;
                var frase = p.slice(i, i + n).join(' ');
                var alvo = dic.get(frase);
                if (alvo) {
                    var chave = alvo.tipo + ':' + alvo.id;
                    if (!vistos.has(chave)) { vistos.add(chave); achados.push({ termo: frase, tipo: alvo.tipo, id: alvo.id }); }
                    i += n; achou = true; break;
                }
            }
            if (!achou) { if (termos.indexOf(p[i]) === -1) termos.push(p[i]); i++; }
        }
        return { termos: termos, dic: achados };
    }

    function temBusca(interp) { return interp.termos.length + interp.dic.length > 0; }

    // ---------- filtros ----------
    function compativel(look, paraQuem) {
        if (!paraQuem || paraQuem === 'todos') return true;
        return look.para === paraQuem || look.para === 'unissex';
    }

    function filtrar(looks, estado) {
        var estilos = new Set(estado.estilos || []);
        return looks.filter(function (l) {
            if (estilos.size && !estilos.has(l.estilo)) return false;
            if (!compativel(l, estado.paraQuem)) return false;
            if (estado.ocasiao && (l.ocasioes || []).indexOf(estado.ocasiao) === -1) return false;
            return true;
        });
    }

    // ---------- pontuação ----------
    function textoDoLook(look) {
        return normalizar([look.nome].concat((look.pecas || []).map(function (p) { return p.nome; }), look.palavras || []).join(' '));
    }

    function casaTermo(palavras, termo) {
        return palavras.some(function (w) { return w.indexOf(termo) === 0; });
    }

    function pontuarBusca(look, interp) {
        var palavras = textoDoLook(look).split(' ');
        var pontos = 0;
        interp.termos.forEach(function (t) { if (casaTermo(palavras, t)) pontos += 2; });
        interp.dic.forEach(function (d) {
            if (d.tipo === 'estilo') {
                if (look.estilo === d.id) pontos += 3;
                else if (look.estilo2 === d.id) pontos += 1;
            } else if (d.tipo === 'ocasiao' && (look.ocasioes || []).indexOf(d.id) !== -1) {
                pontos += 2;
            }
        });
        return pontos;
    }

    function mapaEtiqueta(etiqueta) {
        var m = {};
        ((etiqueta && etiqueta.composicao) || []).forEach(function (c) { m[c.estilo] = c.pct; });
        return m;
    }

    function porcentagemVoce(look, etiqueta) {
        if (!etiqueta) return 0;
        var m = mapaEtiqueta(etiqueta);
        var topo = Math.max.apply(null, [0].concat(Object.keys(m).map(function (k) { return m[k]; })));
        if (!topo) return 0;
        var v = (m[look.estilo] || 0) + 0.5 * (look.estilo2 ? (m[look.estilo2] || 0) : 0);
        return Math.min(100, Math.round(v / topo * 100));
    }

    // ---------- ordem e resultados ----------
    function ordemPadrao(looks, idsEstilos) {
        var grupos = idsEstilos.map(function (id) { return looks.filter(function (l) { return l.estilo === id; }); });
        var resto = looks.filter(function (l) { return idsEstilos.indexOf(l.estilo) === -1; });
        var saida = [];
        for (var rodada = 0; grupos.some(function (g) { return g.length > rodada; }); rodada++) {
            grupos.forEach(function (g) { if (g[rodada]) saida.push(g[rodada]); });
        }
        return saida.concat(resto);
    }

    function idsDe(dados) { return (dados.estilos || []).map(function (e) { return e.id; }); }

    function resultados(dados, estado, etiqueta) {
        var interp = interpretar(estado.busca || '', dados);
        var comBusca = temBusca(interp);
        var base = ordemPadrao(filtrar(dados.looks, estado), idsDe(dados));
        var itens = base.map(function (look, i) {
            return { look: look, pontos: comBusca ? pontuarBusca(look, interp) : 0, pct: porcentagemVoce(look, etiqueta), i: i };
        });
        if (comBusca) itens = itens.filter(function (x) { return x.pontos > 0; });
        itens.sort(function (a, b) { return (b.pontos - a.pontos) || (b.pct - a.pct) || (a.i - b.i); });
        return itens.map(function (x) { return { look: x.look, pontos: x.pontos, pct: x.pct }; });
    }

    // ---------- sugestões ----------
    function sugerir(texto, dados, paraQuem) {
        var q = normalizar(texto);
        if (q.length < 2) return [];
        var looks = dados.looks.filter(function (l) { return compativel(l, paraQuem); });
        var candidatos = [];

        (dados.estilos || []).forEach(function (e) {
            candidatos.push({ tipo: 'estilo', rotulo: e.nome, valor: e.id, chaves: [e.nome].concat(e.sinonimos || []),
                total: looks.filter(function (l) { return l.estilo === e.id; }).length });
        });
        (dados.ocasioes || []).forEach(function (o) {
            candidatos.push({ tipo: 'ocasiao', rotulo: o.nome, valor: o.id, chaves: [o.nome].concat(o.sinonimos || []),
                total: looks.filter(function (l) { return (l.ocasioes || []).indexOf(o.id) !== -1; }).length });
        });
        var pecas = new Map();
        dados.looks.forEach(function (l) {
            (l.pecas || []).forEach(function (p) { var k = normalizar(p.nome); if (!pecas.has(k)) pecas.set(k, p.nome); });
        });
        pecas.forEach(function (nome, k) {
            candidatos.push({ tipo: 'peca', rotulo: nome, valor: nome, chaves: [nome],
                total: looks.filter(function (l) { return (l.pecas || []).some(function (p) { return normalizar(p.nome) === k; }); }).length });
        });
        looks.forEach(function (l) {
            candidatos.push({ tipo: 'look', rotulo: l.nome, valor: l.id, chaves: [l.nome], total: 1 });
        });

        var achados = [];
        candidatos.forEach(function (c, ordem) {
            if (!c.total) return;
            var nivel = -1;
            c.chaves.forEach(function (chave) {
                var n = normalizar(chave);
                if (n.split(' ').some(function (w) { return w.indexOf(q) === 0; }) || n.indexOf(q) === 0) nivel = 0;
                else if (nivel !== 0 && n.indexOf(q) !== -1) nivel = 1;
            });
            if (nivel !== -1) achados.push({ c: c, nivel: nivel, ordem: ordem });
        });
        achados.sort(function (a, b) { return (a.nivel - b.nivel) || (TIPOS[a.c.tipo] - TIPOS[b.c.tipo]) || (a.ordem - b.ordem); });
        return achados.slice(0, 5).map(function (x) { return { tipo: x.c.tipo, rotulo: x.c.rotulo, valor: x.c.valor, total: x.c.total }; });
    }

    function sugerirRemocoes(dados, estado, etiqueta) {
        var nomeDe = function (lista, id) { var i = (lista || []).filter(function (x) { return x.id === id; })[0]; return i ? i.nome : id; };
        var opcoes = [];
        if (temBusca(interpretar(estado.busca || '', dados))) opcoes.push({ filtro: 'busca', rotulo: '"' + String(estado.busca).trim() + '"', troca: { busca: '' } });
        var est = estado.estilos ? Array.from(estado.estilos) : [];
        if (est.length) opcoes.push({ filtro: 'estilos', rotulo: est.length === 1 ? nomeDe(dados.estilos, est[0]) : est.length + ' estilos', troca: { estilos: [] } });
        if (estado.ocasiao) opcoes.push({ filtro: 'ocasiao', rotulo: nomeDe(dados.ocasioes, estado.ocasiao), troca: { ocasiao: null } });
        if (estado.paraQuem && estado.paraQuem !== 'todos') opcoes.push({ filtro: 'paraQuem', rotulo: estado.paraQuem === 'feminino' ? 'Feminino' : 'Masculino', troca: { paraQuem: 'todos' } });

        return opcoes
            .map(function (o) {
                var novo = Object.assign({}, estado, o.troca);
                return { filtro: o.filtro, rotulo: o.rotulo, total: resultados(dados, novo, etiqueta).length };
            })
            .filter(function (o) { return o.total > 0; })
            .sort(function (a, b) { return b.total - a.total; })
            .slice(0, 2);
    }

    // ---------- provador ----------
    function embaralhar(lista, aleatorio) {
        var a = lista.slice();
        for (var i = a.length - 1; i > 0; i--) {
            var j = Math.floor(aleatorio() * (i + 1));
            var t = a[i]; a[i] = a[j]; a[j] = t;
        }
        return a;
    }

    function montarRodada(looks, paraQuem, idsEstilos, aleatorio, tamanho) {
        aleatorio = aleatorio || Math.random;
        tamanho = tamanho || 12;
        var pool = looks.filter(function (l) { return compativel(l, paraQuem); });
        var escolhidos;
        if (pool.length <= tamanho) {
            escolhidos = pool.slice();
        } else {
            escolhidos = [];
            idsEstilos.forEach(function (id) {
                var c = pool.filter(function (l) { return l.estilo === id; });
                if (c.length) escolhidos.push(c[Math.floor(aleatorio() * c.length)]);
            });
            var resto = embaralhar(pool.filter(function (l) { return escolhidos.indexOf(l) === -1; }), aleatorio);
            while (escolhidos.length < tamanho && resto.length) escolhidos.push(resto.shift());
        }

        // monta a ordem: sempre do grupo com mais looks sobrando que não repete o anterior
        var grupos = {};
        embaralhar(escolhidos, aleatorio).forEach(function (l) { (grupos[l.estilo] = grupos[l.estilo] || []).push(l); });
        var saida = [], ultimo = null;
        while (saida.length < escolhidos.length) {
            var vivos = Object.keys(grupos).filter(function (k) { return grupos[k].length; });
            var opcoes = vivos.filter(function (k) { return k !== ultimo; });
            if (!opcoes.length) opcoes = vivos;
            var maior = Math.max.apply(null, opcoes.map(function (k) { return grupos[k].length; }));
            var topo = opcoes.filter(function (k) { return grupos[k].length === maior; });
            var escolha = topo[Math.floor(aleatorio() * topo.length)];
            saida.push(grupos[escolha].pop());
            ultimo = escolha;
        }
        return saida;
    }

    function calcularEtiqueta(pontos, idsEstilos) {
        var lista = idsEstilos
            .filter(function (id) { return (pontos[id] || 0) > 0; })
            .map(function (id, i) { return { estilo: id, p: pontos[id], i: i }; })
            .sort(function (a, b) { return (b.p - a.p) || (a.i - b.i); })
            .slice(0, 3);
        if (!lista.length) return null;
        var soma = lista.reduce(function (s, x) { return s + x.p; }, 0);
        lista.forEach(function (x) { var bruto = x.p / soma * 100; x.pct = Math.floor(bruto); x.resto = bruto - x.pct; });
        var falta = 100 - lista.reduce(function (s, x) { return s + x.pct; }, 0);
        lista.slice().sort(function (a, b) { return (b.resto - a.resto) || (a.i - b.i); })
            .slice(0, falta).forEach(function (x) { x.pct += 1; });
        var copia = {};
        Object.keys(pontos).forEach(function (k) { copia[k] = pontos[k]; });
        return { composicao: lista.map(function (x) { return { estilo: x.estilo, pct: x.pct }; }), pontos: copia };
    }

    // ---------- gaveta ----------
    function motivos(look, ctx, dados) {
        ctx = ctx || {};
        var estilo = function (id) { return (dados.estilos || []).filter(function (e) { return e.id === id; })[0]; };
        var ocasiao = function (id) { return (dados.ocasioes || []).filter(function (o) { return o.id === id; })[0]; };
        var saida = [];

        if (ctx.etiqueta) {
            var m = mapaEtiqueta(ctx.etiqueta);
            var p1 = m[look.estilo] || 0, p2 = look.estilo2 ? (m[look.estilo2] || 0) : 0;
            if (p1) saida.push(estilo(look.estilo).nome + ' é ' + p1 + '% da sua etiqueta' + (p2 ? ', e o look ainda tem um toque de ' + estilo(look.estilo2).nome : '') + '.');
            else if (p2) saida.push('Tem um toque de ' + estilo(look.estilo2).nome + ', que é ' + p2 + '% da sua etiqueta.');
        }

        var busca = String(ctx.busca || '').trim();
        var ocasiaoDaBusca = null;
        if (busca) {
            var interp = interpretar(busca, dados);
            var pecaAchada = null;
            interp.termos.some(function (t) {
                pecaAchada = (look.pecas || []).filter(function (p) { return casaTermo(normalizar(p.nome).split(' '), t); })[0] || null;
                return !!pecaAchada;
            });
            if (pecaAchada) saida.push('Você buscou "' + busca + '" e o look tem ' + pecaAchada.nome.toLowerCase() + '.');
            interp.dic.forEach(function (d) {
                if (d.tipo === 'estilo' && d.id === look.estilo) saida.push('Você buscou "' + busca + '", que tem tudo a ver com ' + estilo(d.id).nome + '.');
                if (d.tipo === 'ocasiao' && (look.ocasioes || []).indexOf(d.id) !== -1 && !ocasiaoDaBusca) {
                    ocasiaoDaBusca = d.id;
                    saida.push('Serve para ' + ocasiao(d.id).nome.toLowerCase() + ', como você buscou.');
                }
            });
        }

        if (ctx.ocasiao && ctx.ocasiao !== ocasiaoDaBusca && (look.ocasioes || []).indexOf(ctx.ocasiao) !== -1) {
            saida.push('Funciona para ' + ocasiao(ctx.ocasiao).nome.toLowerCase() + '.');
        }

        if (!saida.length) saida.push(estilo(look.estilo).descricao);
        return saida.slice(0, 3);
    }

    function parecidos(look, looks, paraQuem, max) {
        max = max || 4;
        var c = looks.filter(function (l) { return l.id !== look.id && compativel(l, paraQuem); });
        var mesmo = c.filter(function (l) { return l.estilo === look.estilo; });
        var vizinho = c.filter(function (l) {
            return l.estilo !== look.estilo && ((look.estilo2 && l.estilo === look.estilo2) || l.estilo2 === look.estilo);
        });
        return mesmo.concat(vizinho).slice(0, max);
    }

    function linkShopping(peca) {
        var cor = peca.corNome || '';
        var jaTem = cor && (' ' + normalizar(peca.nome) + ' ').indexOf(' ' + normalizar(cor) + ' ') !== -1;
        return 'https://www.google.com/search?tbm=shop&q=' + encodeURIComponent((peca.nome + (jaTem ? '' : ' ' + cor)).trim());
    }

    return {
        normalizar: normalizar, interpretar: interpretar, compativel: compativel, filtrar: filtrar,
        pontuarBusca: pontuarBusca, porcentagemVoce: porcentagemVoce, ordemPadrao: ordemPadrao,
        resultados: resultados, sugerir: sugerir, sugerirRemocoes: sugerirRemocoes,
        montarRodada: montarRodada, calcularEtiqueta: calcularEtiqueta, motivos: motivos,
        parecidos: parecidos, linkShopping: linkShopping
    };
});
