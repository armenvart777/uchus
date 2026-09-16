/* ---------- вкладка Клод ---------- */
const KLOD_KAY = "4433217449";
const KLOD_TEMY = [
  ["Работа", [
    ["Быстрое", 20], ["Кворк и клиенты", 3], ["Входящие от клиентов", 78], ["Отклики", 108],
    ["Прочие заказы", 75], ["Парсеры", 104], ["Дежурный", 2274], ["Мотор", 3323]
  ]],
  ["Остальное", [
    ["Учеба", 9], ["Тело и здоровье", 13], ["Деньги", 15], ["Идеи и бизнес", 17],
    ["Личное", 19], ["Напоминания", 79], ["Кай и мои боты", 8]
  ]]
];
const KLOD_KOMNATY = [
  ["Kwork", "kwork", "заказы"],
  ["Project", "project", "проекты"],
  ["Обучение", "obuchenie", "учеба"]
];
const KLOD_PREDEL = 1900;

function klodSsylka(chat, tema){ return "https://t.me/c/" + chat + "/" + tema; }
function klodOtkryt(url){
  tryaska();
  if (tg && tg.openTelegramLink) {
    try { tg.openTelegramLink(url); return; } catch(e){}
  }
  window.location.href = url;
}
function klodLs(k, v){
  try {
    if (v === undefined) return localStorage.getItem(k) || "";
    if (v === null) localStorage.removeItem(k); else localStorage.setItem(k, v);
  } catch(e){}
  return "";
}
function klodImyaTemy(id){
  for (const [, temy] of KLOD_TEMY) for (const [imya, t] of temy) if (t === id) return imya;
  return "";
}
function klodKudaPodpis(kuda){
  const [vid, cel] = kuda.split(":");
  if (vid === "kay") return "Уйдет в тему " + klodImyaTemy(Number(cel)) + " группы Кай. Ответ придет туда.";
  const k = KLOD_KOMNATY.find(x => x[1] === cel);
  return "Бот спросит, в какую вкладку Кай " + (k ? k[0] : "") + " отправить. Кнопки придут в чат.";
}

function klodPismo(){
  if (klodLs("klod_ushlo") === "1") { klodLs("klod_chernovik", null); klodLs("klod_ushlo", null); }
  let kuda = klodLs("klod_kuda");
  if (!/^kay:\d+$/.test(kuda) && !/^komnata:[a-z]+$/.test(kuda)) kuda = "kay:20";
  if (kuda.startsWith("kay:") && !klodImyaTemy(Number(kuda.slice(4)))) kuda = "kay:20";

  const b = el("div","blok klod-pismo");
  const metka = el("label","metka","Написать Клоду");
  metka.htmlFor = "klod-tekst";
  const pole = document.createElement("textarea");
  pole.id = "klod-tekst";
  pole.placeholder = "Что сказать Клоду";
  pole.value = klodLs("klod_chernovik");
  const schet = el("div","klod-schet");
  const chipy = el("div","nap-chipy");
  const drugie = el("div","nap-chipy klod-drugie");
  const podpis = el("div","klod-kuda");

  const glavnye = [["Быстрое","kay:20"]].concat(KLOD_KOMNATY.map(([imya, slag]) => ["Кай " + imya, "komnata:" + slag]));
  function risovat(){
    chipy.innerHTML = ""; drugie.innerHTML = "";
    const svoya = kuda.startsWith("kay:") && kuda !== "kay:20";
    glavnye.forEach(([imya, k]) => {
      const c = el("button","nap-chip" + (k === kuda ? " vybran" : ""), imya);
      c.onclick = () => { tryaska(); kuda = k; drugie.hidden = true; klodLs("klod_kuda", kuda); risovat(); };
      chipy.append(c);
    });
    const dr = el("button","nap-chip" + (svoya ? " vybran" : ""), svoya ? klodImyaTemy(Number(kuda.slice(4))) : "Другая тема");
    dr.setAttribute("aria-expanded", drugie.hidden ? "false" : "true");
    dr.onclick = () => { tryaska(); drugie.hidden = !drugie.hidden; risovat(); };
    chipy.append(dr);
    KLOD_TEMY.forEach(([, temy]) => temy.forEach(([imya, id]) => {
      if (id === 20) return;
      const c = el("button","nap-chip" + ("kay:" + id === kuda ? " vybran" : ""), imya);
      c.onclick = () => { tryaska(); kuda = "kay:" + id; drugie.hidden = true; klodLs("klod_kuda", kuda); risovat(); };
      drugie.append(c);
    }));
    podpis.textContent = klodKudaPodpis(kuda);
  }
  drugie.hidden = true;

  function schitat(){
    const n = pole.value.trim().length;
    schet.hidden = n < KLOD_PREDEL - 400;
    schet.textContent = n + " из " + KLOD_PREDEL;
    schet.classList.toggle("mnogo", n > KLOD_PREDEL);
  }
  pole.oninput = () => { klodLs("klod_chernovik", pole.value); schitat(); };

  const otpr = el("button","knopka klod-glavnaya");
  otpr.append(svgIkonka(IKONKI.samolet, 20), el("span","","Отправить"));
  otpr.onclick = () => {
    const tekst = pole.value.trim();
    if (!tekst) { tost("Сначала напиши текст"); pole.focus(); return; }
    if (tekst.length > KLOD_PREDEL) { tost("Длинновато. Сократи до " + KLOD_PREDEL + " знаков или отправь двумя сообщениями"); return; }
    tryaska();
    klodLs("klod_chernovik", pole.value);
    klodLs("klod_ushlo", "1");
    otpravitVChat({tip:"klod", kuda, tekst}, () => klodLs("klod_ushlo", null));
  };

  risovat(); schitat();
  b.append(metka, pole, schet, chipy, drugie, podpis, otpr);
  return b;
}

function klodEkran(){
  ochistit();
  const e = ekran();
  e.append(el("div","nadzag","Кай на твоей подписке"));
  e.append(el("div","zag-vk","Клод"));
  e.append(el("p","podpis","Пишешь тут, текст уходит в чат Кай от твоего имени. Тетрадь закроется, бот ответит, что ушло."));
  e.append(klodPismo());

  e.append(oglavGruppa("Вкладки с ноутбука", KLOD_KOMNATY.map(([imya, slag, status]) =>
    oglavStroka("Кай " + imya, status, () => {
      tryaska();
      otpravitVChat({tip:"klod_vkladki", komnata: slag});
    }, "noutbuk", "sin"))));
  e.append(el("div","pochemu","Нажал, бот пришлет открытые вкладки кнопками, тетрадь закроется. Каждая вкладка это тема в комнате: ответы Клода идут туда, пока он пишет."));

  KLOD_TEMY.forEach(([zag, temy]) => {
    e.append(oglavGruppa(zag, temy.map(([imya, id]) =>
      oglavStroka(imya, "", () => klodOtkryt(klodSsylka(KLOD_KAY, id))))));
  });

  const b = el("div","blok");
  b.style.marginTop = "18px";
  b.append(el("div","metka","Про токены"));
  b.append(el("p","klod-tekst","Отправка из тетради ничего не стоит, это просто сообщение в телеграм. Клод тратит на ответ столько же, сколько если написать ему напрямую. Все идет по твоей подписке."));
  e.append(b);
}

/* ---------- фразы для заказчика ---------- */
const FRAZY = [
  ["Говорит: дорого", "Не спорь с ценой, двигай объем.", [
    "Понимаю. Давайте посмотрим, что можно убрать из объема, чтобы уложиться. Какая сумма для вас комфортна?",
    "Могу разбить работу на два этапа. Первый закроет главное и стоит меньше, второй возьмем, когда увидите результат."
  ]],
  ["Просит скидку", "Скидка без обмена учит торговаться дальше.", [
    "Цена уже посчитана под объем, снизить не смогу. Зато неделя поддержки после сдачи будет бесплатно.",
    "Если оплатите весь заказ сразу, сделаю минус 5 процентов. По этапам цена остается прежней."
  ]],
  ["Добавьте еще вот это", "Лишнее в ту же цену съедает твой час.", [
    "Это уже вне ТЗ, отдельная работа. Прикину время и сегодня напишу цену.",
    "Добавить могу, это плюс 2 дня и отдельная оплата. Или оставим на второй этап, когда запустим основное."
  ]],
  ["Нужно срочно", "Срочность стоит денег, скажи это прямо.", [
    "Срочно могу, но это вне очереди, плюс 30 процентов к цене. Если подходит, начинаю сегодня.",
    "К пятнице успею главное. Остальное доделаю до среды, без спешки и без косяков. Так пойдет?"
  ]],
  ["Заказчик пропал", "Напоминай фактом, без обиды.", [
    "Добрый день! Напомню о себе: с моей стороны все готово, жду ваш ответ, чтобы двигаться дальше.",
    "Если проект пока на паузе, напишите, пожалуйста. Поставлю его в очередь и вернусь, когда будете готовы."
  ]],
  ["Сомневается, брать ли", "Сними риск маленьким первым шагом.", [
    "Давайте начнем с небольшого первого этапа. Посмотрите, как я работаю, и решите, идем ли дальше.",
    "Скину пример похожей работы, чтобы было видно, что получится на выходе."
  ]],
  ["Зовет созвониться", "В переписке все записано, спорить потом не о чем.", [
    "Давайте лучше тут, в переписке: все договоренности останутся записаны. Пришлите вопросы списком, отвечу по каждому.",
    "Мне удобнее письменно, так точнее. Опишите задачу в паре абзацев, уточняющие вопросы задам здесь же."
  ]],
  ["Недоволен результатом", "Сначала пункты, потом работа.", [
    "Спасибо, что написали. Пришлите по пунктам, что поправить, сделаю и отвечу по каждому.",
    "Правки в рамках ТЗ делаю бесплатно. Если это новое пожелание, скажу сразу и назову цену."
  ]],
  ["Хочет платить после сдачи", "Безопасная сделка закрывает его страх.", [
    "Работаю через безопасную сделку: деньги лежат у площадки, пока вы не примете работу. Риска для вас нет.",
    "Можно по этапам: оплата за первый, сдаю его, потом следующий. Платите только за то, что уже увидели."
  ]]
];

function frazaKopirovat(tekst){
  tryaska();
  const zapas = () => {
    const t = el("textarea");
    t.value = tekst;
    t.setAttribute("readonly","");
    t.style.position = "fixed"; t.style.opacity = "0"; t.style.top = "0";
    document.body.append(t);
    t.select();
    let ok = false;
    try { ok = document.execCommand("copy"); } catch(err){}
    t.remove();
    tost(ok ? "Скопировано" : "Не скопировалось. Зажми текст и скопируй руками");
  };
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(tekst).then(() => tost("Скопировано"), zapas);
  } else zapas();
}

function frazyEkran(){
  ochistit();
  const e = ekran();
  e.append(el("div","nadzag","Продажи"));
  e.append(el("div","zag-vk","Фразы для заказчика"));
  e.append(el("p","podpis","Готовые ответы на частые ситуации. Нажми Копировать, поправь под себя и отправь."));
  FRAZY.forEach(([situaciya, pochemu, varianty], i) => {
    const b = el("div","blok fraza-blok");
    b.append(el("div","metka", situaciya));
    b.append(el("div","fraza-pochemu", pochemu));
    varianty.forEach((tekst, j) => {
      const r = el("div","fraza-var");
      r.append(el("p","fraza-tekst", tekst));
      const k = el("button","knopka tihaya malaya","Копировать");
      k.id = "fraza-" + i + "-" + j;
      k.onclick = () => frazaKopirovat(tekst);
      r.append(k);
      b.append(r);
    });
    e.append(b);
  });
}
