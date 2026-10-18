// Сборка страницы из data.js + живые мини-интерфейсы. Трогать не нужно — правки в data.js.
(function () {
  const S = window.SITE;
  const $ = (s) => document.querySelector(s);
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const calm = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const rub = (n) => n.toLocaleString("ru-RU").replace(/,/g, " ") + " ₽";

  // Контакты
  const tg = "https://t.me/" + S.contacts.telegram;
  const vk = S.contacts.vk ? "https://vk.ru/" + S.contacts.vk : "";
  document.querySelectorAll("[data-tg]").forEach((a) => { a.href = tg; a.target = "_blank"; a.rel = "noopener"; });
  document.querySelectorAll("[data-vk]").forEach((a) => { if (!vk) return a.remove(); a.href = vk; a.target = "_blank"; a.rel = "noopener"; });

  /* ---------- Плитки услуг ---------- */
  const look = { ai: "blue", sites: "white", crm: "lime", tg: "ink", web: "white" };
  const UI = {
    chat: () => `<div class="ui chat" data-chat>
        <div class="chat__head"><span class="chat__dot"></span>ИИ-ассистент салона · отвечает круглосуточно</div>
        <div class="msg msg--in msg--wide"><span class="msg__who">Клиент · 23:36</span>Подскажите, где вы находитесь?</div>
        <div class="msg msg--bot msg--wide"><span class="msg__who">ИИ-ассистент</span>Мы в центре, 3 минуты от метро. Отправить точку на карте?</div>
        <div class="msg msg--in"><span class="msg__who">Клиент · 23:38</span>Да, спасибо. А в воскресенье работаете?</div>
        <div class="msg msg--bot msg--done"><span class="msg__who">ИИ-ассистент</span>Здравствуйте! Да, в воскресенье с 10:00 до 20:00.</div>
        <div class="msg msg--in"><span class="msg__who">Клиент · 23:40</span>Сколько стоит стрижка и есть ли запись на завтра?</div>
        <div class="msg msg--bot"><span class="msg__who">ИИ-ассистент</span><span data-type></span><span class="caret"></span></div>
      </div>`,
    browser: () => `<div class="ui"><div class="browser__bar"><i></i><i></i><i></i><span class="browser__url"></span></div>
        <div class="browser__hero"><div><div class="sk sk--h"></div><div class="sk"></div><div class="sk" style="width:70%"></div><div class="sk sk--btn"></div></div>
        <div class="browser__img">M</div></div></div>`,
    crm: () => `<div class="ui" data-crm>${[["А", "Анна К.", "Окрашивание · 14:00"], ["Д", "Дмитрий", "Стрижка · 16:30"], ["М", "Мария С.", "Маникюр · 18:00"]]
        .map(([l, n, s]) => `<div class="crm__row"><span class="ava">${l}</span><span class="crm__name">${n}<small>${s}</small></span><span class="pill"></span></div>`).join("")}</div>`,
    bot: () => `<div class="ui ui--dark"><div class="bot__msg">Выберите услугу 👇</div>
        <div class="bot__keys" data-keys><span>Стрижка</span><span>Маникюр</span><span>Окрашивание</span><span>Консультация</span></div></div>`,
    dash: () => `<div class="ui"><div class="dash"><div class="dash__num" data-num>128<small>заявок за месяц</small></div>
        <div class="bars" data-bars>${"<i></i>".repeat(9)}</div></div></div>`,
  };
  $("#bento").innerHTML = S.services.map((s, i) => `
    <article class="tile tile--${s.id} tile--${look[s.id] || "white"} reveal">
      <span class="tile__n">0${i + 1}</span>
      <div><h3>${esc(s.title)}</h3><p>${esc(s.text)}</p></div>
      <div class="tile__ui">${UI[s.tile] ? UI[s.tile]() : ""}</div>
    </article>`).join("");

  /* ---------- Работы ---------- */
  $("#cases").innerHTML = S.cases.map((c) => `
    <a class="case reveal" href="cases/${c.slug}.html">
      <div class="case__cover cv-${c.color}">
        <span class="pill case__tag ${c.tag === "демо" ? "tag-demo" : "tag-concept"}">${esc(c.tag)}</span>
        ${c.img ? `<img src="${c.img}" alt="${esc(c.title)}" loading="lazy">` : `<b>${esc(c.kind)}</b>`}
      </div>
      <div class="case__body"><span class="case__kind">${esc(c.kind)}</span><h3>${esc(c.title)}</h3><p>${esc(c.text)}</p></div>
    </a>`).join("");

  $("#aud").innerHTML = S.audiences.map((a) => `
    <div class="aud__card reveal"><h3>${esc(a.title)}</h3><p>${esc(a.text)}</p>
    <ul>${a.tasks.map((t) => `<li>${esc(t)}</li>`).join("")}</ul></div>`).join("");

  $("#steps").innerHTML = S.steps.map((s) => `<li class="reveal"><h3>${esc(s.title)}</h3><p>${esc(s.text)}</p></li>`).join("");
  $("#prices-list").innerHTML = S.prices.map((p) => `<div class="price reveal"><b>${esc(p.title)}</b><span>от ${rub(p.from)}${p.per ? "/" + p.per : ""}</span></div>`).join("");
  $("#faq-list").innerHTML = S.faq.map((f) => `<details class="reveal"><summary>${esc(f.q)}</summary><p>${esc(f.a)}</p></details>`).join("");

  /* ---------- Появление при прокрутке ---------- */
  const io = "IntersectionObserver" in window && !calm
    ? new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } }), { rootMargin: "0px 0px -8% 0px" })
    : null;
  document.querySelectorAll(".reveal").forEach((el) => (io ? io.observe(el) : el.classList.add("in")));

  /* ---------- Живые мини-интерфейсы ---------- */
  // Чат: ИИ печатает ответ
  const answer = "Мужская стрижка — от 1 200 ₽. Завтра свободно в 12:00 и 17:30. Записать вас?";
  const typeEl = document.querySelector("[data-type]");
  if (typeEl) {
    if (calm) typeEl.textContent = answer;
    else {
      let i = 0;
      const tick = () => {
        typeEl.textContent = answer.slice(0, i);
        if (i++ < answer.length) setTimeout(tick, 34);
        else setTimeout(() => { i = 0; tick(); }, 3500);
      };
      setTimeout(tick, 800);
    }
  }

  // CRM: статусы заявок меняются
  const ST = [["Новая", "st-new"], ["В работе", "st-work"], ["Готово", "st-done"]];
  const pills = [...document.querySelectorAll("[data-crm] .pill")];
  const state = [0, 1, 2];
  const paint = () => pills.forEach((p, k) => { const [t, c] = ST[state[k]]; p.textContent = t; p.className = "pill " + c; });
  paint();
  let row = 0;
  if (!calm) setInterval(() => { state[row] = (state[row] + 1) % 3; paint(); row = (row + 1) % pills.length; }, 1600);

  // Бот: «нажимается» кнопка
  const keys = [...document.querySelectorAll("[data-keys] span")];
  let key = 0;
  if (keys.length) { keys[0].classList.add("on"); if (!calm) setInterval(() => { keys[key].classList.remove("on"); key = (key + 1) % keys.length; keys[key].classList.add("on"); }, 1400); }

  // Дашборд: столбики и счётчик
  const bars = [...document.querySelectorAll("[data-bars] i")];
  const num = document.querySelector("[data-num]");
  let total = 128;
  const grow = () => {
    bars.forEach((b) => (b.style.height = 25 + Math.round(Math.random() * 75) + "%"));
    if (num) num.firstChild.nodeValue = String(total);
  };
  grow();
  if (!calm) setInterval(() => { total += 1 + Math.round(Math.random() * 3); grow(); }, 2200);
})();
