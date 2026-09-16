/* ---------- чат с Клодом в боте ---------- */
const CHAT_REZHIMY = [
  ["obychny", "Обычный", "Отвечает на что угодно: код, тексты, жизнь. Коротко, пока не попросишь подробно."],
  ["prodazhi", "Продажи", "Кидаешь сообщение клиента. Скажет, чего он хочет на самом деле, и даст ответ до 400 знаков."],
  ["english", "Английский", "Отвечает на простом английском и правит твои ошибки. Русский текст переведет для клиента."],
  ["prosto", "Простыми словами", "Объясняет без жаргона, с примером из жизни, до 8 строк."]
];
const CHAT_MODELI = [
  ["sonnet", "Sonnet", "Быстрее. Хватает почти на все."],
  ["opus", "Opus", "Думает глубже, но быстрее съедает лимит подписки."]
];
const CHAT_ZAGOTOVKI = {
  obychny: [
    ["Разобрать ошибку", "Что значит эта ошибка и что с ней делать:\n"],
    ["Разложить день", "Разложи по времени дела на сегодня:\n"],
    ["Выбрать из двух", "Помоги выбрать, что лучше, и скажи почему:\n"]
  ],
  prodazhi: [
    ["Разобрать клиента", "Клиент пишет:\n"],
    ["Говорит дорого", "Клиент говорит, что дорого. Заказ и моя цена:\n"],
    ["Проверить мой ответ", "Проверь мой ответ клиенту:\n"]
  ],
  english: [
    ["Check my English", "Check my English:\n"],
    ["Перевести клиенту", "Переведи для клиента на Upwork:\n"],
    ["Это вне ТЗ", "Как вежливо сказать клиенту по-английски, что это вне ТЗ и стоит отдельно?"]
  ],
  prosto: [
    ["Что такое API", "Что такое API и зачем оно нужно?"],
    ["Зачем боту сервер", "Что такое сервер и зачем он боту?"],
    ["База или Excel", "Чем база данных отличается от таблицы Excel?"]
  ]
};
const CHAT_PREDEL = 1900;

function chatImya(spisok, kod){ const x = spisok.find(s => s[0] === kod); return x ? x[1] : ""; }
function chatVybor(klyuch, spisok){
  const v = klodLs(klyuch);
  return spisok.some(s => s[0] === v) ? v : spisok[0][0];
}

function chatEkran(){
  ochistit();
  if (klodLs("chat_ushlo") === "1") { klodLs("chat_chernovik", null); klodLs("chat_ushlo", null); }
  let rezhim = chatVybor("chat_rezhim", CHAT_REZHIMY);
  let model = chatVybor("chat_model", CHAT_MODELI);
  let novy = false;
  const e = ekran();
  e.append(el("div","nadzag","На твоей подписке"));
  e.append(el("div","zag-vk","Чат с Клодом"));
  e.append(el("p","podpis","Спроси отсюда или пиши прямо в чат бота. Клод помнит разговор, смотрит фото и ищет в интернете."));

  const bRezhim = el("div","blok");
  bRezhim.append(el("div","metka","Режим"));
  const chipyR = el("div","nap-chipy");
  const opisR = el("div","chat-opis");
  bRezhim.append(chipyR, opisR);

  const bModel = el("div","blok");
  bModel.append(el("div","metka","Модель"));
  const chipyM = el("div","nap-chipy");
  const opisM = el("div","chat-opis");
  bModel.append(chipyM, opisM);

  const bVopros = el("div","blok chat-vopros");
  const metka = el("label","metka","Вопрос");
  metka.htmlFor = "chat-tekst";
  const pole = document.createElement("textarea");
  pole.id = "chat-tekst";
  pole.value = klodLs("chat_chernovik");
  const schet = el("div","klod-schet");
  const zagotovki = el("div","nap-chipy chat-zagotovki");

  function chipy(ryad, spisok, tekushhee, vybrat){
    ryad.innerHTML = "";
    spisok.forEach(([kod, imya]) => {
      const c = el("button","nap-chip" + (kod === tekushhee ? " vybran" : ""), imya);
      c.setAttribute("aria-pressed", kod === tekushhee ? "true" : "false");
      c.onclick = () => { tryaska(); vybrat(kod); risovat(); };
      ryad.append(c);
    });
  }
  function risovat(){
    chipy(chipyR, CHAT_REZHIMY, rezhim, k => { rezhim = k; klodLs("chat_rezhim", k); });
    chipy(chipyM, CHAT_MODELI, model, k => { model = k; klodLs("chat_model", k); });
    opisR.textContent = CHAT_REZHIMY.find(s => s[0] === rezhim)[2];
    opisM.textContent = CHAT_MODELI.find(s => s[0] === model)[2];
    pole.placeholder = rezhim === "english" ? "Write in English or Russian" : "О чем спросить Клода";
    zagotovki.innerHTML = "";
    CHAT_ZAGOTOVKI[rezhim].forEach(([podpis, tekst]) => {
      const c = el("button","nap-chip", podpis);
      c.onclick = () => {
        tryaska();
        const bylo = pole.value.replace(/\s+$/, "");
        pole.value = bylo ? bylo + "\n\n" + tekst : tekst;
        pole.focus();
        try { pole.setSelectionRange(pole.value.length, pole.value.length); } catch(err){}
        pole.oninput();
      };
      zagotovki.append(c);
    });
  }
  function schitat(){
    const n = pole.value.trim().length;
    schet.hidden = n < CHAT_PREDEL - 400;
    schet.textContent = n + " из " + CHAT_PREDEL;
    schet.classList.toggle("mnogo", n > CHAT_PREDEL);
  }
  pole.oninput = () => { klodLs("chat_chernovik", pole.value); schitat(); };

  const novyRyad = el("div","nastr-ryad chat-novy");
  const novyTekst = el("label","nastr-tekst","Начать новый разговор");
  const novyGal = el("button","galochka");
  novyGal.id = "chat-novy";
  novyTekst.htmlFor = "chat-novy";
  novyGal.setAttribute("aria-label","Начать новый разговор");
  postavitGalochku(novyGal, false);
  novyGal.onclick = () => { tryaska(); novy = !novy; postavitGalochku(novyGal, novy); };
  novyRyad.append(novyTekst, novyGal);

  function otpravit(tekst){
    tryaska();
    klodLs("chat_chernovik", pole.value);
    if (tekst) klodLs("chat_ushlo", "1");
    otpravitVChat({tip:"chat", rezhim, model, novy, tekst}, () => klodLs("chat_ushlo", null));
  }
  const sprosit = el("button","knopka klod-glavnaya");
  sprosit.append(svgIkonka(IKONKI.samolet, 20), el("span","","Спросить"));
  sprosit.onclick = () => {
    const tekst = pole.value.trim();
    if (!tekst) { tost("Сначала напиши вопрос"); pole.focus(); return; }
    if (tekst.length > CHAT_PREDEL) { tost("Длинновато. Сократи до " + CHAT_PREDEL + " знаков или вставь текст прямо в чат бота"); return; }
    otpravit(tekst);
  };
  const vChat = el("button","knopka tihaya","Перейти в чат без вопроса");
  vChat.id = "chat-bez-voprosa";
  vChat.style.marginTop = "8px";
  vChat.onclick = () => otpravit("");

  bVopros.append(metka, pole, schet, zagotovki, novyRyad, sprosit, vChat);
  bVopros.append(el("div","klod-kuda","Тетрадь закроется, ответ придет в чат бота. Режим и модель бот запомнит и для обычных сообщений."));
  risovat(); schitat();
  e.append(bRezhim, bModel, bVopros);

  const b = el("div","blok");
  b.append(el("div","metka","Как это устроено"));
  b.append(el("div","teoriya klod-tekst",
    "Пишешь боту обычным сообщением, отвечает Клод. Фото с подписью тоже разберет, голосовые нет.\n\n"
    + "/chat режим и модель прямо в чате\n/new начать разговор заново\n/stop остановить ответ\n\n"
    + "Разговор помнится, пока не нажмешь /new. После 6 часов тишины начнется новый, прошлый вернет кнопка в /chat. "
    + "Все идет по подписке Claude, отдельно не платишь."));
  e.append(b);
}
