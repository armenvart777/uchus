/* ---------- вкладка Зал ---------- */
let zalVybor = null;

async function zalEkran(){
  ochistit();
  const e = ekran();
  const dan = await zalZagruzit();
  if (!e.isConnected) return;
  if (dan.tek) zalTrenirovka(e, dan);
  else zalObzor(e, dan);
}

function zalObzor(e, dan){
  const segKl = zalDataKlyuch(novayaData(0));
  const sled = zalSledDen(dan);
  if (!ZAL_DNI[zalVybor]) zalVybor = sled;
  const den = ZAL_DNI[zalVybor];
  const segodnyaBylo = dan.ist.some(x => x && x.d === segKl);
  e.append(el("div","nadzag","На этой неделе " + zalNaNedele(dan.ist) + " из 3"));
  e.append(el("div","zag-vk","День " + den.bukva));
  e.append(el("p","podpis", den.fokus[0].toUpperCase() + den.fokus.slice(1) +
    (segodnyaBylo ? ". Сегодня тренировка уже записана." : (zalVybor === sled ? ". Сегодня по порядку он." : "."))));

  const chipy = el("div","nap-chipy zal-chipy");
  chipy.style.margin = "0 0 14px";
  ZAL_PORYADOK.forEach(k => {
    const c = el("button","nap-chip" + (k === zalVybor ? " vybran" : ""), "День " + ZAL_DNI[k].bukva);
    c.onclick = () => { tryaska(); zalVybor = k; ochistit(); zalObzor(ekran(), dan); };
    chipy.append(c);
  });
  e.append(chipy);

  const plan = el("div","liniya-blok");
  plan.append(el("div","metka","Разминка и вис 30 секунд, потом по списку"));
  den.upr.forEach(upr => {
    const s = zalSovet(upr, dan.posl);
    const r = el("div","zal-stroka");
    const lev = el("div","zal-lev");
    lev.append(el("div","zal-imya", upr.imya));
    lev.append(el("div","zal-sovet" + (s.rost ? " rost" : ""), s.tekst));
    r.append(lev, el("span","zal-cel", zalCel(upr)));
    plan.append(r);
  });
  e.append(plan);

  const start = el("button","knopka","Начать день " + den.bukva);
  start.onclick = () => {
    tryaska();
    dan.tek = {den: zalVybor, d: segKl, start: Date.now(), p: {}, ch: {}};
    zalSohranit("zal_tek", dan.tek);
    zalOtdyhStop();
    ochistit();
    zalTrenirovka(ekran(), dan);
  };
  e.append(start);
  e.append(el("div","pochemu","Запас 2 повтора, до отказа не доводим. Все подходы чисто, в следующий раз вес выше. Не вышло, повторяешь. Face pull каждую тренировку."));

  const ist = el("div","liniya-blok");
  ist.style.marginTop = "18px";
  ist.append(el("div","metka","Прошлые тренировки"));
  if (!dan.ist.length) ist.append(el("p","pusto","Пока пусто. Закончишь первую, она появится тут."));
  dan.ist.slice(0, 8).forEach(x => {
    const r = el("div","kurs-stroka");
    r.append(el("span","", zalKorotkayaData(x.d) + ", день " + (ZAL_DNI[x.den] ? ZAL_DNI[x.den].bukva : "?")));
    r.append(el("span","", [x.min ? x.min + " мин" : "", x.n + " " + sklon(x.n, "подход", "подхода", "подходов"), x.t ? x.t + " кг" : ""].filter(Boolean).join(", ")));
    ist.append(r);
  });
  e.append(ist);
}

function zalStepper(id, podpis, shag, rezhim){
  const obl = el("div","zal-pole");
  const metka = el("label","zal-ed", podpis);
  metka.htmlFor = id;
  const ryad = el("div","zal-shag");
  const minus = el("button","krug-knopka","−");
  minus.setAttribute("aria-label","Меньше: " + podpis);
  const pole = document.createElement("input");
  pole.type = "text"; pole.id = id; pole.inputMode = rezhim; pole.className = "zal-chislo"; pole.autocomplete = "off";
  const plyus = el("button","krug-knopka","+");
  plyus.setAttribute("aria-label","Больше: " + podpis);
  const izm = d => { tryaska(); const n = zalChislo(pole.value) || 0; pole.value = zalChisloTekst(Math.max(0, n + d)); };
  minus.onclick = () => izm(-shag);
  plyus.onclick = () => izm(shag);
  ryad.append(minus, pole, plyus);
  obl.append(metka, ryad);
  return [obl, pole];
}

function zalChekBlok(tek, zag, spisok){
  const b = el("div","liniya-blok");
  b.append(el("div","metka", zag));
  spisok.forEach(([kod, imya]) => {
    const punkt = el("div","plan-punkt");
    const gal = el("button","galochka");
    gal.setAttribute("aria-label","Отметить: " + imya);
    const tekst = el("button","plan-tekst");
    tekst.append(el("span","plan-zag", imya));
    const pereklyuchit = () => { tryaska(); tek.ch[kod] = tek.ch[kod] ? 0 : 1; zalSohranit("zal_tek", tek); postavitGalochku(gal, !!tek.ch[kod]); };
    gal.onclick = pereklyuchit;
    tekst.onclick = pereklyuchit;
    postavitGalochku(gal, !!tek.ch[kod]);
    punkt.append(gal, tekst);
    b.append(punkt);
  });
  return b;
}
