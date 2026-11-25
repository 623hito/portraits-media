// トップページの動き。data.js の中身から画面を組み立てる。

const isSP = window.matchMedia("(max-width: 743px)");
const isNarrow = window.matchMedia("(max-width: 860px)");

/* ---------- 0. 背景モザイク：ばらばらの順でふわっと出す ---------- */
(function mosaic() {
  const box = $("#mosaic");
  box.innerHTML = MOSAIC.map((src) => `<div class="tile"><img src="${src}" alt=""></div>`).join("");
  const tiles = [...box.children].slice(0, isSP.matches ? 10 : undefined);
  // 遅れ時間を用意してから、順番を入れ替える
  const delays = tiles.map((_, i) => i * 0.12);
  for (let i = delays.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [delays[i], delays[j]] = [delays[j], delays[i]];
  }
  tiles.forEach((t, i) => (t.style.transitionDelay = `${delays[i]}s`));
  // 写真の読み込みを待たずに始める（待つと遅い回線で真っ暗が続く）
  setTimeout(() => document.body.classList.add("loaded"), 60);
})();

/* ---------- 3. 特集インタビュー ---------- */
$("#interviews").innerHTML = INTERVIEWS.map((p) => `
  <article class="itv">
    <div class="deco"></div>
    <div class="txt-wrap"><div>
      <h3>${p.quote}</h3>
      <p class="en">${p.en}</p>
      <p class="jp">${p.jp}</p>
      <p class="role">${p.role}</p>
      <a class="btn" href="interview.html?id=${p.id}">READ AN INTERVIEW</a>
    </div></div>
    <div class="img-box">
      <div class="img-big"><img src="${p.full}" alt="${p.jp}" loading="lazy"></div>
      <div class="img-sml"><img src="${p.face}" alt="" loading="lazy"></div>
    </div>
  </article>`).join("");

/* ---------- 4〜7. 流れるカードと格子 ---------- */
// 格子の途中に差し込む色の四角とコピー（何人目の後ろに入れるか）
const SPACES = [
  { after: 9, html: `<div class="space copy fade">100<br>Faces,</div>` },
  { after: 15, html: `<div class="space block fade"><i></i><i></i></div>` },
  { after: 22, html: `<div class="space copy fade">100<br>Stories</div>` },
];

// 前半・後半に分け、それぞれ「流れる16人＋格子の残り」にする
const mid = Math.ceil(PEOPLE.length / 2);
const halves = [PEOPLE.slice(0, mid), PEOPLE.slice(mid)];
$("#collections").innerHTML = halves.map((half) => {
  const flow = half.slice(0, 16);
  const rest = half.slice(16);
  let grid = "";
  rest.forEach((p, i) => {
    grid += card(p);
    const sp = SPACES.find((s) => s.after === i + 1);
    if (sp) grid += sp.html;
  });
  return `
  <section class="sec-slide">
    <h2 class="sec-title fade">PEOPLE <br class="sp">COLLECTION<span class="tag">100 FACES, 100 STORIES</span></h2>
    <div class="splide flow" data-ids="${flow.map((p) => p.id).join(",")}">
      <div class="splide__track"><ul class="splide__list"></ul></div>
    </div>
  </section>
  <section class="sec-grid"><div class="grid">${grid}</div></section>`;
}).join("");

// 流れる列：PCは1コマ2人、狭い画面は1コマ3人。幅が変わったら組み直す
const sliders = new Map();
function buildFlows() {
  const per = isNarrow.matches ? 3 : 2;
  document.querySelectorAll(".flow").forEach((el) => {
    sliders.get(el)?.destroy(true);
    const people = el.dataset.ids.split(",").map((id) => PEOPLE[Number(id) - 1]);
    let html = "";
    for (let i = 0; i < people.length; i += per) {
      html += `<li class="splide__slide">${people.slice(i, i + per).map(card).join("")}</li>`;
    }
    $(".splide__list", el).innerHTML = html;
    const sp = new Splide(el, {
      type: "loop", drag: "free", autoWidth: true, gap: 0,
      arrows: false, pagination: false,
      autoScroll: { speed: 1, pauseOnHover: false, pauseOnFocus: false },
    }).mount(window.splide.Extensions);
    sliders.set(el, sp);
  });
}
buildFlows();
isNarrow.addEventListener("change", buildFlows);

watchFades();

/* ---------- 8. モーダル ---------- */
const modal = $("#modal");
function openModal(id) {
  const p = PEOPLE[id - 1];
  if (!p) return;
  $("#m-photo").src = p.photo;
  $("#m-photo").alt = p.jp;
  $("#m-en").textContent = p.en;
  $("#m-jp").textContent = p.jp;
  $("#m-role").textContent = p.role;
  $("#m-intro").textContent = p.intro;
  $("#m-link").href = `person.html?id=${p.id}`;
  modal.classList.add("open");
  modal.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
}
function closeModal() {
  modal.classList.remove("open");
  modal.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";
}
// ドラッグで流している最中の指離しを「押した」と数えないよう、動いた距離を見る
let downX = 0;
document.addEventListener("pointerdown", (e) => (downX = e.clientX));
document.addEventListener("click", (e) => {
  if (e.target.closest(".modal-close") || e.target === modal) return closeModal();
  const c = e.target.closest(".card");
  if (c && Math.abs(e.clientX - downX) < 8) openModal(Number(c.dataset.id));
});
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") closeModal();
  if (e.key === "Enter" && document.activeElement?.classList.contains("card")) openModal(Number(document.activeElement.dataset.id));
});
