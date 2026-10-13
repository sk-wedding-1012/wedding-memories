/* リボン＆バブルシャワー（当日のガーデン演出をイメージ）
   showerLoop(canvas)  … ずっとゆっくり降り続ける（トップ画面用）
   showerBurst(el)     … el の上で数秒だけ降らせる（ガーデンの場面用）
   動きを減らす設定の端末・画面外・別タブのときは止める */
(() => {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const COLORS = ["#b8955a", "#d9bd8a", "#e9d3cc", "#8fa9d8", "#b9c9ea", "#ffffff", "#a9b59f"];
  const rnd = (a, b) => a + Math.random() * (b - a);

  function particle(w, h, fromTop) {
    const bubble = Math.random() < 0.35;
    return bubble
      ? { bubble, x: rnd(0, w), y: fromTop ? rnd(-h, 0) : rnd(0, h), r: rnd(4, 11), vy: rnd(-0.45, -0.15), vx: rnd(-0.2, 0.2), sway: rnd(0, 6.28), a: rnd(0.35, 0.7) }
      : { bubble, x: rnd(0, w), y: fromTop ? rnd(-h, 0) : rnd(-h, h), len: rnd(10, 20), wid: rnd(3, 5), vy: rnd(0.5, 1.3), vx: rnd(-0.3, 0.3),
          rot: rnd(0, 6.28), spin: rnd(-0.06, 0.06), flip: rnd(0, 6.28), sway: rnd(0, 6.28), c: COLORS[(Math.random() * COLORS.length) | 0] };
  }

  function draw(ctx, p) {
    if (p.bubble) {
      ctx.globalAlpha = p.a;
      ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, 6.283);
      ctx.fillStyle = "rgba(255,255,255,.18)"; ctx.fill();
      ctx.lineWidth = 1; ctx.strokeStyle = "rgba(255,255,255,.9)"; ctx.stroke();
      ctx.beginPath(); ctx.arc(p.x - p.r * .35, p.y - p.r * .35, p.r * .25, 0, 6.283);
      ctx.fillStyle = "rgba(255,255,255,.85)"; ctx.fill();
    } else {
      ctx.globalAlpha = 0.9;
      ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.rot);
      ctx.scale(1, Math.cos(p.flip));            // ひらひら裏返る
      ctx.fillStyle = p.c; ctx.fillRect(-p.wid / 2, -p.len / 2, p.wid, p.len);
      ctx.restore();
    }
  }

  function run(canvas, { count, loop, onEnd }) {
    const ctx = canvas.getContext("2d");
    let W = 0, H = 0, ps = [], raf = 0, visible = true;
    const size = () => {
      const dpr = Math.min(2, devicePixelRatio || 1);
      W = canvas.clientWidth; H = canvas.clientHeight;
      canvas.width = W * dpr; canvas.height = H * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    size();
    ps = Array.from({ length: count }, () => particle(W, H, !loop));
    if (!loop) ps.forEach(p => { if (p.bubble) p.y = rnd(H * .4, H + 20); });
    const tick = () => {
      ctx.clearRect(0, 0, W, H);
      let alive = 0;
      for (const p of ps) {
        p.sway += 0.02;
        p.x += p.vx + Math.sin(p.sway) * (p.bubble ? 0.25 : 0.5);
        p.y += p.vy;
        if (!p.bubble) { p.rot += p.spin; p.flip += 0.08; }
        const out = p.bubble ? p.y < -20 : p.y > H + 20;
        if (out) {
          if (!loop) continue;
          const n = particle(W, H, true);
          if (n.bubble) n.y = H + 20;              // 泡は下から昇ってくる
          Object.assign(p, n);
        }
        alive++; draw(ctx, p);
      }
      if (!loop && !alive) { ctx.clearRect(0, 0, W, H); onEnd && onEnd(); return; }
      raf = visible && !document.hidden ? requestAnimationFrame(tick) : 0;
    };
    const resume = () => { if (!raf && visible && !document.hidden) raf = requestAnimationFrame(tick); };
    new IntersectionObserver(es => { visible = es[0].isIntersecting; resume(); }).observe(canvas);
    document.addEventListener("visibilitychange", resume);
    addEventListener("resize", size);
    resume();
  }

  window.showerLoop = canvas => {
    if (reduce) return;
    run(canvas, { count: innerWidth < 640 ? 34 : 60, loop: true });
  };
  window.showerBurst = el => {
    if (reduce) return;
    const c = document.createElement("canvas");
    c.className = "shower-burst";
    el.appendChild(c);
    run(c, { count: innerWidth < 640 ? 50 : 80, loop: false, onEnd: () => c.remove() });
  };
})();
