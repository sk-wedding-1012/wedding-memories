/* index.html と gallery.html で共通の処理（写真リスト・拡大表示・スライドショー） */
const SMALL_DIR = "sm/";       // 一覧用（長辺480px）
const THUMB_DIR = "thumbs/";   // 拡大表示の最初の1枚（長辺1000px）
const PHOTO_DIR = "large/";    // 拡大表示・保存用（長辺2400px）。元写真の photos/ は公開しない

const $ = (s, el=document) => el.querySelector(s);
const esc = s => String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

// シーン順 → 未分類の順に並べる
const sceneOrder = id => { const i = SCENES.findIndex(s => s.id===id); return i<0 ? SCENES.length : i; };
const PHOTOS = (window.PHOTO_LIST||[])
  .map((p,n) => ({ scene:p.scene||"", file:p.file, cap:CAPS[p.file]||"", h:p.h||"", n }))
  .sort((a,b) => sceneOrder(a.scene)-sceneOrder(b.scene) || a.n-b.n);
const inScene = id => PHOTOS.filter(p => p.scene===id);
const sceneLabel = id => (SCENES.find(s => s.id===id)||{}).label || "";
const baseName = f => f.split("/").pop();

/* 連写などで見た目がほぼ同じ写真を見分ける（h = build-photos.ps1 が作る64bitの見た目の指紋）
   同じ場面で、指紋の違いが10bit以下なら「同じ写真」とみなす */
const bits32 = x => { x -= (x >>> 1) & 0x55555555; x = (x & 0x33333333) + ((x >>> 2) & 0x33333333); return Math.imul((x + (x >>> 4)) & 0x0f0f0f0f, 0x01010101) >>> 24; };
const lookDist = (a, b) => bits32(parseInt(a.slice(0,8),16) ^ parseInt(b.slice(0,8),16)) + bits32(parseInt(a.slice(8),16) ^ parseInt(b.slice(8),16));
const looksSame = (p, q) => p.scene===q.scene && p.h && q.h && lookDist(p.h, q.h) <= 10;

// list から n 枚を、全体に均等に・見た目が重ならないように選ぶ（元の並び順のまま返す）
function pickDistinct(list, n){
  if (!list.length || n <= 0) return [];
  const chosen = [], ok = p => !chosen.some(c => looksSame(c, p));
  const step = list.length / n;
  for (let i = 0; i < n; i++) {
    const a = Math.floor(i*step), b = Math.max(a+1, Math.floor((i+1)*step)), mid = (a + b - 1) / 2;
    const seg = list.slice(a, b).map((p,k) => [p, Math.abs(a+k-mid)]).sort((x,y) => x[1]-y[1]).map(x => x[0]);
    const p = seg.find(ok); if (p) chosen.push(p);
  }
  for (const p of list) { if (chosen.length >= n) break; if (!chosen.includes(p) && ok(p)) chosen.push(p); }
  return chosen.sort((x,y) => list.indexOf(x) - list.indexOf(y));
}

// 画像が無いとき・読み込み失敗時は「♡」の代わり表示に差し替え
document.addEventListener("error", e => {
  const t = e.target;
  if (t.tagName==="IMG" && t.hasAttribute("data-fb")) {
    const d = document.createElement("div");
    d.className = "ph-ph"; d.textContent = "♡";
    if (t.dataset.ratio) d.style.aspectRatio = t.dataset.ratio;
    t.replaceWith(d);
  }
}, true);

/* ---------- ライトボックス＋スライドショー ---------- */
document.body.insertAdjacentHTML("beforeend", `
<div class="ov" id="lb" role="dialog" aria-modal="true">
  <button class="x" id="lbClose" aria-label="閉じる">×</button>
  <div id="lbMedia"></div>
  <div class="cap" id="lbCap"></div>
  <div class="cnt" id="lbCnt"></div>
  <div class="bar">
    <button id="lbPrev">← 前へ</button>
    <button id="lbPlay">▶ スライドショー</button>
    <a id="lbDl" download>保存 ↓</a>
    <button id="lbNext">次へ →</button>
  </div>
</div>`);
const lb = $("#lb");
let lbList = [], idx = 0, timer = null;
function renderLb(){
  const p = lbList[idx], full = PHOTO_DIR + p.file;
  const img = new Image();
  img.src = THUMB_DIR + p.file; img.alt = p.cap || ""; img.setAttribute("data-fb","1"); img.dataset.ratio = "3/2";
  $("#lbMedia").replaceChildren(img);
  // まず軽量版を出し、高画質版（large/）が読み込めたら差し替える
  const hi = new Image();
  hi.onload = () => { if (img.isConnected) img.src = full; };
  hi.src = full;
  $("#lbCap").textContent = p.cap || "";
  $("#lbCnt").textContent = `${idx+1} / ${lbList.length}`;
  $("#lbDl").href = full; $("#lbDl").setAttribute("download", baseName(p.file));
  // 次の写真を先読みしておく
  const nx = lbList[(idx+1) % lbList.length]; if (nx) new Image().src = THUMB_DIR + nx.file;
}
function stepLb(d){ idx = (idx + d + lbList.length) % lbList.length; renderLb(); }
function setPlay(on){
  clearInterval(timer); timer = null;
  $("#lbPlay").textContent = on ? "❚❚ 停止" : "▶ スライドショー";
  if (on) timer = setInterval(() => stepLb(1), CONFIG.slideSeconds*1000);
}
function openLb(list, i, auto){
  if (!list.length) return;
  lbList = list; idx = i; renderLb();
  lb.classList.add("open"); document.body.style.overflow = "hidden";
  setPlay(!!auto);
}
function closeLb(){ setPlay(false); lb.classList.remove("open"); document.body.style.overflow = ""; }
$("#lbClose").onclick = closeLb;
$("#lbPrev").onclick = () => { stepLb(-1); if (timer) setPlay(true); };
$("#lbNext").onclick = () => { stepLb(1);  if (timer) setPlay(true); };
$("#lbPlay").onclick = () => setPlay(!timer);
lb.addEventListener("click", e => { if (e.target===lb) closeLb(); });
let sx = 0;
$("#lbMedia").addEventListener("touchstart", e => { sx = e.changedTouches[0].clientX; }, {passive:true});
$("#lbMedia").addEventListener("touchend", e => {
  const dx = e.changedTouches[0].clientX - sx;
  if (Math.abs(dx) > 50) { stepLb(dx<0 ? 1 : -1); if (timer) setPlay(true); }
}, {passive:true});
document.addEventListener("keydown", e => {
  if (e.key==="Escape" && lb.classList.contains("open")) closeLb();
  if (!lb.classList.contains("open")) return;
  if (e.key==="ArrowLeft") stepLb(-1);
  if (e.key==="ArrowRight") stepLb(1);
  if (e.key===" ") { e.preventDefault(); setPlay(!timer); }
});

/* ---------- フェードイン ---------- */
const io = new IntersectionObserver(es => es.forEach(en => { if (en.isIntersecting){ en.target.classList.add("in"); io.unobserve(en.target); } }), {threshold:.1});
function observeFades(root=document){ root.querySelectorAll(".fade:not(.in)").forEach(el => io.observe(el)); }
