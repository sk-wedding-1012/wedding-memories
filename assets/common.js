/* index.html と gallery.html で共通の処理（写真リスト・拡大表示・スライドショー） */
const SMALL_DIR = "sm/";       // 一覧用（長辺480px）
const THUMB_DIR = "thumbs/";   // 拡大表示の最初の1枚（長辺1000px）
const PHOTO_DIR = "large/";    // 拡大表示・保存用（長辺2400px）。元写真の photos/ は公開しない

const $ = (s, el=document) => el.querySelector(s);
const esc = s => String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

// シーン順 → 未分類の順に並べる
const sceneOrder = id => { const i = SCENES.findIndex(s => s.id===id); return i<0 ? SCENES.length : i; };
const PHOTOS = (window.PHOTO_LIST||[])
  .map((p,n) => ({ scene:p.scene||"", file:p.file, cap:CAPS[p.file]||"", n }))
  .sort((a,b) => sceneOrder(a.scene)-sceneOrder(b.scene) || a.n-b.n);
const inScene = id => PHOTOS.filter(p => p.scene===id);
const sceneLabel = id => (SCENES.find(s => s.id===id)||{}).label || "";
const baseName = f => f.split("/").pop();

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
