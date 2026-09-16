/* ---------- зал: идет тренировка ---------- */
function zalTrenirovka(e, dan){
  const tek = dan.tek;
  const den = ZAL_DNI[tek.den];
  const verh = el("div","zal-verh");
  const vLev = el("div","zal-verh-lev");
  const vPrav = el("button","zal-otdyh");
  verh.append(vLev, vPrav);
  e.append(verh);
  e.append(el("div","zag-vk","День " + den.bukva));
  e.append(el("p","podpis","Сделал подход, жми Записать. Отдых включится сам."));

  let signalDan = zalOtdyhKonec() > 0 && zalOtdyhKonec() <= Date.now();
  function tik(){
    const min = Math.max(0, Math.floor((Date.now() - tek.start) / 60000));
    const n = zalPodhodov(tek);
    vLev.textContent = "Идет " + min + " мин, " + n + " " + sklon(n, "подход", "подхода", "подходов");
    const konec = zalOtdyhKonec();
    const ost = konec - Date.now();
    if (konec && ost < -90000) zalOtdyhStop();
    if (!zalOtdyhKonec()) { vPrav.hidden = true; return; }
    vPrav.hidden = false;
    if (ost > 0) {
      vPrav.textContent = "Отдых " + zalMinSek(ost);
      vPrav.classList.remove("vyshel");
      signalDan = false;
    } else {
      vPrav.textContent = "Можно подход";
      vPrav.classList.add("vyshel");
      if (!signalDan) { signalDan = true; zalSignal(); }
    }
  }
  vPrav.setAttribute("aria-label","Сбросить отдых");
  vPrav.onclick = () => { zalOtdyhStop(); tik(); };
  if (aktivnyInterval) clearInterval(aktivnyInterval);
  aktivnyInterval = setInterval(tik, 500);

  e.append(zalChekBlok(tek, "Сначала", ZAL_CHEK_NACHALO));
  den.upr.forEach(upr => e.append(zalKarta(dan, upr, tik)));
  e.append(zalChekBlok(tek, "В конце", ZAL_CHEK_KONEC));

  const konec = el("button","knopka","Закончить и записать");
  konec.style.marginTop = "6px";
  podtverzhdenie(konec, "Нажми еще раз, запишу", async () => {
    if (!zalPodhodov(tek)) { tost("Нет ни одного подхода. Запиши хоть один или брось тренировку"); return; }
    const minuty = Math.max(1, Math.round((Date.now() - tek.start) / 60000));
    const n = zalPodhodov(tek), tonn = zalTonnazh(tek);
    const sravn = zalZapisat(dan, minuty);
    zalOtdyhStop();
    await pravkaPlana("zal", true);
    ochistit();
    zalItog(ekran(), den, minuty, n, tonn, sravn);
  });
  e.append(konec);

  const brosit = el("button","knopka tihaya","Бросить без записи");
  brosit.style.marginTop = "10px";
  podtverzhdenie(brosit, "Точно бросить?", () => {
    const kopiya = dan.tek;
    zalSbrosTek(dan);
    zalOtdyhStop();
    ochistit();
    zalObzor(ekran(), dan);
    tost("Тренировка брошена", "Вернуть", () => {
      dan.tek = kopiya;
      zalSohranit("zal_tek", kopiya);
      ochistit();
      zalTrenirovka(ekran(), dan);
    });
  });
  e.append(brosit);
  tik();
}

function zalKarta(dan, upr, tik){
  const tek = dan.tek;
  const s = zalSovet(upr, dan.posl);
  const karta = el("div","blok zal-karta");
  const shapka = el("div","zal-shapka");
  const cel = el("span","zal-cel");
  shapka.append(el("div","zal-imya", upr.imya), cel);
  karta.append(shapka);
  karta.append(el("div","zal-sovet" + (s.rost ? " rost" : ""), s.tekst));
  if (upr.zamena) karta.append(el("div","zal-sovet", upr.zamena));
  const spisok = el("div","zal-podhody");
  karta.append(spisok);

  const podhody = () => tek.p[upr.id] || [];
  const vvod = el("div","zal-vvod");
  const [vesObl, vesPole] = zalStepper("zal-ves-" + upr.id, upr.tip === "max" ? "Доп. вес, кг" : "Вес, кг", upr.shag, "decimal");
  const [povtObl, povtPole] = zalStepper("zal-povt-" + upr.id, "Повторы", 1, "numeric");
  vvod.append(vesObl, povtObl);
  karta.append(vvod);
  const poslednij = podhody()[podhody().length - 1];
  vesPole.value = zalChisloTekst(poslednij ? poslednij[0] : s.ves);
  povtPole.value = String(poslednij ? poslednij[1] : s.povt);

  const zapisat = el("button","knopka");
  karta.append(zapisat);

  function obnovit(){
    spisok.innerHTML = "";
    podhody().forEach(([ves, povt], i) => {
      const r = el("div","zal-podhod");
      r.append(el("span","zal-nomer", String(i + 1)));
      r.append(el("span","zal-rez", ves ? zalKg(ves) + " × " + povt : povt + " " + sklon(povt, "повтор", "повтора", "повторов")));
      const ub = el("button","knopka tihaya malaya","Убрать");
      podtverzhdenie(ub, "Точно?", () => {
        const sp = tek.p[upr.id];
        if (!sp) return;
        sp.splice(i, 1);
        if (!sp.length) delete tek.p[upr.id];
        zalSohranit("zal_tek", tek);
        obnovit(); tik();
      });
      r.append(ub);
      spisok.append(r);
    });
    const n = podhody().length;
    zapisat.textContent = "Записать подход " + (n + 1) + (n < upr.podh ? " из " + upr.podh : "");
    cel.textContent = n ? n + " из " + upr.podh : zalCel(upr);
    karta.classList.toggle("gotovo", n >= upr.podh);
  }

  zapisat.onclick = () => {
    let ves = zalChislo(vesPole.value);
    if (ves == null && upr.tip === "max") ves = 0;
    const povt = zalChislo(povtPole.value);
    if (ves == null || ves < 0 || ves > 400) { tost("Поставь вес числом"); return; }
    if (!povt || povt < 1 || povt > 100 || !Number.isInteger(povt)) { tost("Сколько повторов? Целое число"); return; }
    if (podhody().length >= 10) { tost("Больше 10 подходов в одном упражнении не пишу"); return; }
    tryaska();
    if (!tek.p[upr.id]) tek.p[upr.id] = [];
    tek.p[upr.id].push([Math.round(ves * 100) / 100, povt]);
    zalSohranit("zal_tek", tek);
    const bylOtdyh = zalOtdyhKonec();
    zalOtdyhStart(upr.otdyh);
    obnovit(); tik();
    const n = podhody().length;
    tost("Подход " + n + " записан, отдых " + zalMinSek(upr.otdyh * 1000), "Отменить", () => {
      const sp = tek.p[upr.id];
      if (!sp || !sp.length) return;
      sp.pop();
      if (!sp.length) delete tek.p[upr.id];
      zalSohranit("zal_tek", tek);
      try { if (bylOtdyh) localStorage.setItem("zal_otdyh", String(bylOtdyh)); else zalOtdyhStop(); } catch(err){}
      if (spisok.isConnected) { obnovit(); tik(); }
      tost("Отменено", null, null, 1500);
    });
  };
  obnovit();
  return karta;
}

function zalItog(e, den, minuty, n, tonn, sravn){
  e.append(el("div","nadzag","Тренировка записана"));
  e.append(el("div","zag-vk","День " + den.bukva + " сделан"));
  e.append(el("p","podpis", minuty + " мин, " + n + " " + sklon(n, "подход", "подхода", "подходов") +
    (tonn ? ", поднято " + tonn + " кг" : "") + ". В плане дня отмечено."));
  const vse = {};
  Object.values(ZAL_DNI).forEach(d => d.upr.forEach(u => { vse[u.id] = u; }));
  const b = el("div","liniya-blok");
  b.append(el("div","metka","Против прошлого раза"));
  sravn.forEach(({id, bylo, stalo}) => {
    if (!vse[id]) return;
    const r = el("div","kurs-stroka");
    r.append(el("span","", vse[id].imya), el("span","", zalSravnit(bylo, stalo)));
    b.append(r);
  });
  e.append(b);
  const gotovo = el("button","knopka","Готово");
  gotovo.style.marginTop = "14px";
  gotovo.onclick = () => { tryaska(); zalEkran(); };
  e.append(gotovo);
  e.append(el("div","pochemu","После зала бассейн 20-30 минут и хамам. Следующая тренировка через день."));
}
