// Страница кейса: берёт slug из <main data-slug> и собирает страницу из data.js + cases.js.
(function () {
  const S = window.SITE, C = window.CASES;
  const root = document.getElementById("case");
  const slug = root.dataset.slug;
  const meta = S.cases.find((c) => c.slug === slug);
  const k = C[slug];
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  if (!meta || !k) { root.innerHTML = '<section class="wrap section"><h1>Кейс не найден</h1><p><a href="../#work">← Все работы</a></p></section>'; return; }
  document.title = `${meta.title} — MADOFF studio`;

  // Контакты
  const tg = "https://t.me/" + S.contacts.telegram;
  const vk = S.contacts.vk ? "https://vk.ru/" + S.contacts.vk : "";
  const link = (a, url) => { if (!url) return a.remove(); a.href = url; a.target = "_blank"; a.rel = "noopener"; };

  const shot = (s) => s.phone
    ? `<figure class="shot shot--phone reveal"><div class="phone"><img src="../img/cases/${s.src}" alt="${esc(s.cap)}" loading="lazy"></div>${s.cap ? `<figcaption>${esc(s.cap)}</figcaption>` : ""}</figure>`
    : `<figure class="shot ${s.card ? "shot--card" : ""} reveal"><img src="../img/cases/${s.src}" alt="${esc(s.cap || meta.title)}" loading="lazy">${s.cap ? `<figcaption>${esc(s.cap)}</figcaption>` : ""}</figure>`;

  const chat = (rows) => `<div class="tgchat reveal"><div class="tgchat__head"><span class="tgchat__ava">🎮</span><b>Бот клуба</b><small>бот</small></div><div class="tgchat__body">${rows.map(([who, text, keys]) =>
    `<div class="tgm tgm--${who}">${esc(text)}</div>${keys ? `<div class="tgkeys">${keys.map((x) => `<span>${esc(x)}</span>`).join("")}</div>` : ""}`).join("")}</div></div>`;

  const others = S.cases.filter((c) => c.slug !== slug);
  const next = others.find((c) => c.slug === k.related) || others[(S.cases.indexOf(meta)) % others.length];

  root.innerHTML = `
  <section class="wrap case-hero">
    <a class="back" href="../#work">← Все работы</a>
    <div class="case-hero__tags"><span class="pill ${meta.tag === "демо" ? "tag-demo" : "tag-concept"}">${esc(meta.tag)}</span><span class="case__kind">${esc(meta.kind)}</span></div>
    <h1 class="case-hero__title reveal">${esc(meta.title)}</h1>
    <p class="case-hero__lead reveal">${esc(k.lead)}</p>
    ${k.demo ? `<a class="btn btn--blue reveal" href="../${k.demo}">Открыть демо →</a>` : ""}
    ${k.note ? `<p class="case-note">${esc(k.note)}</p>` : ""}
  </section>

  <section class="wrap case-info">
    <div class="case-block reveal"><h2>Задача</h2><p>${esc(k.task)}</p></div>
    <div class="case-block reveal"><h2>Что сделали</h2><ul class="ticks">${k.done.map((d) => `<li>${esc(d)}</li>`).join("")}</ul></div>
    <div class="case-block reveal"><h2>Технологии</h2><div class="chips">${k.stack.map((s) => `<span class="chip">${esc(s)}</span>`).join("")}</div></div>
  </section>

  ${k.chat ? `<section class="wrap section case-media"><h2 class="reveal">Как выглядит диалог</h2>${chat(k.chat)}</section>` : ""}
  ${k.shots ? `<section class="wrap section case-media"><h2 class="reveal">Скриншоты</h2><div class="shots ${k.shots[0].card ? "shots--cards" : ""}">${k.shots.map(shot).join("")}</div></section>` : ""}
  ${k.demo ? `<section class="wrap section"><div class="demo-cta reveal"><div><h2>Попробуйте сами</h2><p>Демо работает прямо в браузере — ничего устанавливать не нужно.</p></div><a class="btn btn--lime" href="../${k.demo}">Открыть демо →</a></div></section>` : ""}

  <section class="wrap section">
    <a class="next reveal" href="${next.slug}.html"><span>Следующая работа</span><b>${esc(next.title)} →</b></a>
  </section>

  <section class="wrap section">
    <div class="final reveal">
      <h2>Нужно похожее решение?</h2>
      <p>Расскажите о задаче — предложим, как сделать под ваш бизнес.</p>
      <div class="final__cta"><a class="btn btn--lime" data-tg href="#">Написать в Telegram</a><a class="btn btn--line" data-vk href="#">ВКонтакте</a></div>
    </div>
  </section>`;

  document.querySelectorAll("[data-tg]").forEach((a) => link(a, tg));
  document.querySelectorAll("[data-vk]").forEach((a) => link(a, vk));

  // Появление при прокрутке
  const calm = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const io = "IntersectionObserver" in window && !calm
    ? new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } }), { rootMargin: "0px 0px -8% 0px" })
    : null;
  document.querySelectorAll(".reveal").forEach((el) => (io ? io.observe(el) : el.classList.add("in")));
})();
