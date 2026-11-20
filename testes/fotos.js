// Confere se todas as fotos do catálogo existem no Unsplash (GET; HEAD responde 200 para tudo).
// Uso: node testes/fotos.js
const { looks } = require('../js/dados.js');

(async () => {
    let falhas = 0;
    await Promise.all(looks.map(async l => {
        const url = `https://images.unsplash.com/photo-${l.foto}?w=40&q=10`;
        try {
            const r = await fetch(url);
            if (r.status !== 200) { falhas++; console.log(`✖ ${l.id} → ${r.status}`); }
        } catch (e) { falhas++; console.log(`✖ ${l.id} → ${e.message}`); }
    }));
    console.log(falhas ? `${falhas} foto(s) com problema` : `todas as ${looks.length} fotos respondem 200`);
    process.exitCode = falhas ? 1 : 0;
})();
