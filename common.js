// 全ページ共通：ヘッダー・フッター、人物カード、ふわっと出す動き

const $ = (s, r = document) => r.querySelector(s);

document.body.insertAdjacentHTML("afterbegin", `
<header class="site-head">
  <a class="brand" href="index.html">${SITE.name}</a>
  <nav>
    <a href="people.html">PEOPLE<small>人物一覧</small></a>
    <a href="index.html#interview">INTERVIEW<small>特集</small></a>
    <a href="index.html#about">ABOUT<small>このメディア</small></a>
  </nav>
</header>`);

document.body.insertAdjacentHTML("beforeend", `
<footer class="site-foot">
  <div class="brand">${SITE.name}</div>
  <p class="tagline">${SITE.tagline}</p>
  <nav><a href="people.html">人物一覧</a><a href="index.html#interview">特集インタビュー</a><a href="index.html#about">このメディアについて</a></nav>
  <small>掲載している人物・文章は架空、写真はダミーです。</small>
</footer>`);

// 人物カード（トップの流れる列・格子、一覧ページで共通）
const card = (p) => `
  <article class="card" data-id="${p.id}" tabindex="0">
    <img src="${p.photo}" alt="${p.jp}" loading="lazy">
    <p class="en">${p.en}</p><p class="jp">${p.jp}<small>${p.role}</small></p>
    <span class="line"></span><span class="plus"></span>
  </article>`;

const qaHtml = (list) => list.map(([q, a]) => `<p class="q">${q}</p><p class="a">${a}</p>`).join("");

// 画面に入ったら1回だけふわっと出す
const fadeObserver = new IntersectionObserver((entries) => {
  entries.forEach((e) => {
    if (e.isIntersecting) { e.target.classList.add("on"); fadeObserver.unobserve(e.target); }
  });
}, { rootMargin: "0px 0px -15% 0px" });
const watchFades = (root = document) => root.querySelectorAll(".fade:not(.on)").forEach((el) => fadeObserver.observe(el));
