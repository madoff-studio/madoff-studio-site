// Демо мини-CRM. Данные — вымышленные, хранятся в localStorage этого браузера и никуда не отправляются.
(function () {
  const KEY = "madoff-demo-crm-v1";
  const SERVICES = [
    ["Женская стрижка", 1800], ["Мужская стрижка", 1200], ["Окрашивание", 4500],
    ["Маникюр", 1600], ["Педикюр", 2200], ["Укладка", 1500],
  ];
  const ST = { new: ["Новая", "s-new"], ok: ["Подтверждена", "s-ok"], done: ["Пришёл", "s-done"], cancel: ["Отменена", "s-cancel"] };
  const DAYS = ["Сегодня", "Завтра", "Послезавтра"];
  const $ = (s) => document.querySelector(s);
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const rub = (n) => n.toLocaleString("ru-RU") + " ₽";

  const seed = () => [
    [0, "10:00", "Анна К.", 2, "Ольга", "done"], [0, "11:30", "Дмитрий", 1, "Марат", "done"], [0, "13:00", "Мария С.", 3, "Ирина", "ok"],
    [0, "14:30", "Елена", 0, "Ольга", "ok"], [0, "16:00", "Игорь", 1, "Марат", "new"], [0, "17:30", "Светлана", 4, "Ирина", "new"],
    [0, "19:00", "Ксения", 5, "Ольга", "cancel"], [1, "10:30", "Наталья", 2, "Ольга", "ok"], [1, "12:00", "Артём", 1, "Марат", "new"],
    [1, "15:00", "Виктория", 3, "Ирина", "new"], [2, "11:00", "Ольга П.", 0, "Ольга", "new"], [2, "18:00", "Руслан", 1, "Марат", "new"],
  ].map(([day, time, client, svc, master, st], i) => ({ id: i + 1, day, time, client, svc, master, st }));

  const load = () => { try { const d = JSON.parse(localStorage.getItem(KEY)); if (Array.isArray(d)) return d; } catch (e) {} return seed(); };
  const save = () => { try { localStorage.setItem(KEY, JSON.stringify(items)); } catch (e) {} };

  let items = load();
  let day = 0, filter = "all", q = "";

  function render() {
    $("#day-title").textContent = "Записи: " + DAYS[day].toLowerCase();
    $("#days").innerHTML = DAYS.map((d, i) => `<button type="button" data-day="${i}" class="${i === day ? "on" : ""}">${d}</button>`).join("");

    const ofDay = items.filter((x) => x.day === day);
    const done = ofDay.filter((x) => x.st === "done");
    const stats = [
      ["Записей", ofDay.filter((x) => x.st !== "cancel").length],
      ["Подтверждено", ofDay.filter((x) => x.st === "ok").length],
      ["Пришли", done.length],
      ["Выручка", rub(done.reduce((s, x) => s + SERVICES[x.svc][1], 0)), true],
    ];
    $("#stats").innerHTML = stats.map(([l, v, lime]) => `<div class="stat ${lime ? "stat--lime" : ""}"><b>${v}</b><span>${l}</span></div>`).join("");

    const counts = { all: ofDay.length };
    Object.keys(ST).forEach((k) => (counts[k] = ofDay.filter((x) => x.st === k).length));
    $("#filters").innerHTML = [["all", "Все"], ...Object.entries(ST).map(([k, [t]]) => [k, t])]
      .map(([k, t]) => `<button type="button" data-f="${k}" class="${filter === k ? "on" : ""}">${t} · ${counts[k]}</button>`).join("");

    const ql = q.trim().toLowerCase();
    const shown = ofDay
      .filter((x) => filter === "all" || x.st === filter)
      .filter((x) => !ql || x.client.toLowerCase().includes(ql) || SERVICES[x.svc][0].toLowerCase().includes(ql))
      .sort((a, b) => a.time.localeCompare(b.time));

    $("#list").innerHTML = shown.length ? shown.map((x) => `
      <div class="item ${x.st === "cancel" ? "is-cancel" : ""}">
        <span class="item__time">${esc(x.time)}</span>
        <span class="item__who"><b>${esc(x.client)}</b><small>мастер ${esc(x.master)}</small></span>
        <span class="item__svc">${esc(SERVICES[x.svc][0])}</span>
        <span class="item__price">${rub(SERVICES[x.svc][1])}</span>
        <span class="item__st"><select data-id="${x.id}" class="${ST[x.st][1]}" aria-label="Статус записи">${Object.entries(ST).map(([k, [t]]) => `<option value="${k}" ${k === x.st ? "selected" : ""}>${t}</option>`).join("")}</select></span>
      </div>`).join("") : `<div class="empty">Записей не найдено</div>`;
  }

  // События
  document.addEventListener("click", (e) => {
    const d = e.target.closest("[data-day]"); if (d) { day = +d.dataset.day; render(); }
    const f = e.target.closest("[data-f]"); if (f) { filter = f.dataset.f; render(); }
  });
  $("#list").addEventListener("change", (e) => {
    const s = e.target.closest("select[data-id]"); if (!s) return;
    const it = items.find((x) => x.id === +s.dataset.id); it.st = s.value; save(); render();
  });
  $("#search").addEventListener("input", (e) => { q = e.target.value; render(); });
  $("#reset").addEventListener("click", () => { items = seed(); try { localStorage.removeItem(KEY); } catch (e) {} render(); });

  // Новая запись
  const modal = $("#modal"), form = $("#form");
  $("#service").innerHTML = SERVICES.map(([n, p], i) => `<option value="${i}">${n} — ${rub(p)}</option>`).join("");
  $("#add-open").addEventListener("click", () => { form.reset(); modal.showModal ? modal.showModal() : modal.setAttribute("open", ""); });
  $("#cancel").addEventListener("click", () => modal.close());
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const f = new FormData(form);
    items.push({ id: Date.now(), day, time: f.get("time"), client: String(f.get("client")).trim().slice(0, 40), svc: +f.get("service"), master: f.get("master"), st: "new" });
    save(); modal.close(); filter = "all"; render();
  });

  render();
})();
