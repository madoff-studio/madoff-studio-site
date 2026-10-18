// Демо-сценарий ИИ-ассистента: ответы заранее подготовлены, сообщения никуда не отправляются.
// Салон, адрес и цены вымышленные.
(function () {
  const $ = (s) => document.querySelector(s);
  const log = $("#log"), chips = $("#chips"), form = $("#form"), input = $("#input");
  const calm = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const PRICES = [["Женская стрижка", 1800], ["Мужская стрижка", 1200], ["Окрашивание", 4500], ["Маникюр", 1600], ["Педикюр", 2200]];
  const rub = (n) => n.toLocaleString("ru-RU") + " ₽";
  const MAIN = ["Сколько стоит?", "Где вы находитесь?", "Часы работы", "Записаться"];

  let flow = null; // запись: { step, svc, day, time }

  const add = (text, who) => {
    const b = document.createElement("div");
    b.className = "bub bub--" + who;
    b.textContent = text;
    log.appendChild(b);
    log.scrollTop = log.scrollHeight;
  };
  const setChips = (list) => { chips.innerHTML = list.map((c) => `<button type="button">${c}</button>`).join(""); log.scrollTop = log.scrollHeight; };

  // Ответ бота с «печатает…»
  function say(texts, nextChips = MAIN) {
    setChips([]);
    const arr = [].concat(texts);
    let i = 0;
    const one = () => {
      if (i >= arr.length) return setChips(nextChips);
      const t = document.createElement("div");
      t.className = "bub bub--bot";
      t.innerHTML = '<span class="typing"><i></i><i></i><i></i></span>';
      log.appendChild(t); log.scrollTop = log.scrollHeight;
      setTimeout(() => { t.remove(); add(arr[i++], "bot"); one(); }, calm ? 0 : 550 + Math.min(arr[i].length * 8, 700));
    };
    one();
  }

  const has = (t, re) => re.test(t);

  function answer(raw) {
    const t = raw.toLowerCase();

    // Шаги записи
    if (flow) {
      if (has(t, /отмен|не надо|передумал/)) { flow = null; return say("Хорошо, запись отменил. Чем ещё помочь?"); }
      if (flow.step === "svc") {
        const stems = [/женск/, /мужск/, /окраш|покрас/, /маник/, /педик/];
        let i = PRICES.findIndex(([n]) => t.includes(n.toLowerCase()));
        if (i < 0) i = stems.findIndex((re) => re.test(t));
        if (i < 0) return say("Выберите услугу кнопкой ниже 👇", PRICES.map(([n]) => n));
        flow.svc = i; flow.step = "day";
        return say(`${PRICES[i][0]} — ${rub(PRICES[i][1])}. На какой день записать?`, ["Сегодня", "Завтра"]);
      }
      if (flow.step === "day") {
        if (!has(t, /сегодня|завтра/)) return say("Подскажите: сегодня или завтра?", ["Сегодня", "Завтра"]);
        flow.day = has(t, /сегодня/) ? "сегодня" : "завтра"; flow.step = "time";
        const slots = flow.day === "сегодня" ? ["17:30", "19:00"] : ["11:00", "12:30", "15:00", "18:00"];
        return say(`Свободное время ${flow.day}:`, slots);
      }
      if (flow.step === "time") {
        const m = t.match(/\b(\d{1,2})[:.](\d{2})\b/);
        if (!m) return say("Выберите время кнопкой или напишите, например, 18:00");
        flow.time = `${m[1].padStart(2, "0")}:${m[2]}`; flow.step = "name";
        return say("Как к вам обращаться?", []);
      }
      if (flow.step === "name") {
        const name = raw.trim().slice(0, 30) || "Гость";
        const f = flow; flow = null;
        say([`${name}, записал вас: ${PRICES[f.svc][0].toLowerCase()}, ${f.day} в ${f.time}.`, "Администратор подтвердит запись в течение 15 минут. До встречи в «Лаванде»! 💜"]);
        setTimeout(() => add("В демо заявка никуда не отправляется", "sys"), calm ? 0 : 2600);
        return;
      }
    }

    if (has(t, /запис|свобод|окошк|время есть|на завтра|на сегодня/)) {
      flow = { step: "svc" };
      return say("С радостью запишу! Какая услуга нужна?", PRICES.map(([n]) => n));
    }
    if (has(t, /цен|стоит|стоимост|прайс|сколько/)) {
      return say(["Наши цены:\n" + PRICES.map(([n, p]) => `• ${n} — ${rub(p)}`).join("\n"), "Хотите записаться?"], ["Записаться", "Где вы находитесь?"]);
    }
    if (has(t, /адрес|где вы|наход|добрат|метро|парков/)) {
      return say("Мы на ул. Садовой, 12 — 3 минуты пешком от метро, рядом бесплатная парковка. Отправить точку на карте?", ["Да, отправьте", "Записаться"]);
    }
    if (has(t, /да, отправ|карт/)) return say("Готово: точка на карте отправлена 📍 (в демо — понарошку)");
    if (has(t, /работа|часы|график|выходн|воскрес|суббот|открыт|до скольки|во сколько/)) {
      return say("Работаем каждый день с 9:00 до 21:00, в воскресенье — с 10:00 до 20:00.", ["Записаться", "Сколько стоит?"]);
    }
    if (has(t, /администр|человек|оператор|позвон|менеджер|позвать/)) {
      return say("Передал ваш вопрос администратору — он ответит здесь же в рабочее время. Пока могу подсказать цены или записать вас.");
    }
    if (has(t, /спасиб|благодар/)) return say("Пожалуйста! Обращайтесь 🙂");
    if (has(t, /привет|здравств|добр(ый|ое|ого)|хай/)) return say("Здравствуйте! Я ассистент салона «Лаванда». Подскажу цены, адрес и запишу на услугу.");
    return say("Хороший вопрос — точнее ответит администратор. Передать ему?", ["Да, позвать администратора", "Записаться", "Сколько стоит?"]);
  }

  function send(text) {
    text = text.trim();
    if (!text) return;
    add(text, "me");
    answer(text);
  }

  form.addEventListener("submit", (e) => { e.preventDefault(); send(input.value); input.value = ""; });
  chips.addEventListener("click", (e) => { const b = e.target.closest("button"); if (b) send(b.textContent); });

  say(["Здравствуйте! Я ассистент салона «Лаванда» 👋", "Подскажу цены, адрес и время работы — или сразу запишу. Что вас интересует?"]);
})();
