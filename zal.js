/* ---------- зал: программа и записи ---------- */
const ZAL_FACE = {id: "face", imya: "Face pull", tip: "obem", podh: 3, povt: 15, otdyh: 60, shag: 2.5};
const ZAL_BICEPS = {id: "biceps", imya: "Бицепс со штангой", tip: "obem", podh: 3, povt: 10, otdyh: 90, shag: 2.5};
const ZAL_DNI = {
  A: {bukva: "А", fokus: "спина и бицепс", upr: [
    {id: "trap", imya: "Становая с трап-грифом", tip: "sila", podh: 4, povt: 5, otdyh: 150, shag: 2.5, zamena: "Нет трап-грифа: румынская с гантелями 4×6"},
    {id: "podt", imya: "Подтягивания", tip: "max", podh: 4, povt: 0, otdyh: 120, shag: 2.5},
    {id: "tyaga", imya: "Тяга штанги в наклоне", tip: "obem", podh: 4, povt: 8, otdyh: 90, shag: 2.5},
    {id: "verhblok", imya: "Тяга верхнего блока обратным хватом", tip: "obem", podh: 3, povt: 10, otdyh: 90, shag: 2.5},
    ZAL_FACE, ZAL_BICEPS,
    {id: "molot", imya: "Молотки", tip: "obem", podh: 3, povt: 12, otdyh: 75, shag: 2}
  ]},
  B: {bukva: "Б", fokus: "ноги и плечи", upr: [
    {id: "front", imya: "Фронтальный присед", tip: "sila", podh: 4, povt: 5, otdyh: 150, shag: 2.5, zamena: "Не идет фронтальный: гоблет-присед 4×6"},
    {id: "nogi", imya: "Жим ногами", tip: "obem", podh: 3, povt: 10, otdyh: 120, shag: 5},
    {id: "rumyn", imya: "Румынская тяга", tip: "obem", podh: 3, povt: 10, otdyh: 120, shag: 2.5},
    {id: "zhimsidya", imya: "Жим гантелей сидя", tip: "obem", podh: 3, povt: 10, otdyh: 90, shag: 2},
    {id: "mahi", imya: "Махи в стороны", tip: "obem", podh: 3, povt: 12, otdyh: 60, shag: 1},
    ZAL_FACE,
    {id: "ikry", imya: "Икры", tip: "obem", podh: 4, povt: 15, otdyh: 60, shag: 5}
  ]},
  V: {bukva: "В", fokus: "спина, грудь, руки", upr: [
    {id: "zhim", imya: "Жим лежа в Смите", tip: "sila", podh: 4, povt: 5, otdyh: 150, shag: 2.5, start: 75},
    {id: "podtshir", imya: "Подтягивания широким хватом", tip: "max", podh: 4, povt: 0, otdyh: 120, shag: 2.5},
    {id: "gorblok", imya: "Тяга горизонтального блока", tip: "obem", podh: 4, povt: 10, otdyh: 90, shag: 2.5},
    {id: "naklon", imya: "Жим гантелей на наклонной", tip: "obem", podh: 3, povt: 10, otdyh: 90, shag: 2},
    {id: "razvod", imya: "Разводка на наклонной", tip: "obem", podh: 3, povt: 12, otdyh: 75, shag: 2},
    ZAL_FACE, ZAL_BICEPS,
    {id: "triceps", imya: "Трицепс на канате", tip: "obem", podh: 3, povt: 12, otdyh: 75, shag: 2.5}
  ]}
};
const ZAL_PORYADOK = ["A", "B", "V"];
const ZAL_CHEK_NACHALO = [["razm", "Разминка 10 минут"], ["vis30", "Вис на турнике 30 секунд"]];
const ZAL_CHEK_KONEC = [["vis60", "Вис 60 секунд"], ["rast", "Растяжка"], ["basseyn", "Бассейн 20-30 минут и хамам"]];

function zalDataKlyuch(d){ return d.getFullYear() + "-" + pad2(d.getMonth() + 1) + "-" + pad2(d.getDate()); }
function zalKorotkayaData(kl){ const ch = String(kl).split("-"); return ch[2] + "." + ch[1]; }
function zalChisloTekst(v){ return String(Math.round(v * 100) / 100).replace(".", ","); }
function zalKg(v){ return zalChisloTekst(v) + " кг"; }
function zalChislo(s){
  const t = String(s == null ? "" : s).trim().replace(",", ".");
  if (!t) return null;
  const n = Number(t);
  return Number.isFinite(n) ? n : null;
}
function zalJson(s, zapas){
  if (!s) return zapas;
  try { const v = JSON.parse(s); return v && typeof v === "object" ? v : zapas; } catch(e){ return zapas; }
}
function zalCel(upr){ return upr.podh + "×" + (upr.tip === "max" ? "макс" : upr.povt); }
function zalPodhodov(tek){ return Object.values(tek.p || {}).reduce((s, v) => s + v.length, 0); }
function zalTonnazh(tek){
  return Math.round(Object.values(tek.p || {}).reduce((s, v) => s + v.reduce((a, x) => a + x[0] * x[1], 0), 0));
}
function zalSohranit(klyuch, obj){ pishuKlyuch(klyuch, obj == null ? "" : JSON.stringify(obj)); }
function zalSbrosTek(dan){ dan.tek = null; zalSohranit("zal_tek", null); }

async function zalZagruzit(){
  const rez = await citatKlyuchiP(["zal_tek", "zal_posl", "zal_ist"]);
  const dan = {tek: zalJson(rez.zal_tek, null), posl: zalJson(rez.zal_posl, {}), ist: zalJson(rez.zal_ist, [])};
  if (!Array.isArray(dan.ist)) dan.ist = [];
  if (Array.isArray(dan.posl)) dan.posl = {};
  if (dan.tek && (!ZAL_DNI[dan.tek.den] || typeof dan.tek.p !== "object" || !dan.tek.start)) dan.tek = null;
  if (dan.tek) {
    if (!dan.tek.ch) dan.tek.ch = {};
    if (dan.tek.d !== zalDataKlyuch(novayaData(0))) {
      if (zalPodhodov(dan.tek)) zalZapisat(dan, null);
      else zalSbrosTek(dan);
    }
  }
  return dan;
}

function zalZapisat(dan, minuty){
  const tek = dan.tek;
  const sravnenie = [];
  Object.entries(tek.p).forEach(([id, v]) => {
    if (!Array.isArray(v) || !v.length) return;
    const bylo = dan.posl[id];
    sravnenie.push({id, bylo: bylo && Array.isArray(bylo.v) ? bylo.v : null, stalo: v});
    dan.posl[id] = {d: zalKorotkayaData(tek.d), v: v.slice(0, 8)};
  });
  dan.ist.unshift({d: tek.d, den: tek.den, min: minuty, n: zalPodhodov(tek), t: zalTonnazh(tek)});
  dan.ist = dan.ist.slice(0, 40);
  zalSohranit("zal_posl", dan.posl);
  zalSohranit("zal_ist", dan.ist);
  zalSbrosTek(dan);
  return sravnenie;
}

function zalSovet(upr, posl){
  const p = posl[upr.id];
  if (!p || !Array.isArray(p.v) || !p.v.length) {
    if (upr.tip === "max") return {ves: 0, povt: 5, tekst: "Первый раз: сколько выйдет, без отказа"};
    if (upr.start) return {ves: upr.start, povt: upr.povt, tekst: "Старт с " + zalKg(upr.start) + ", запас 2 повтора"};
    return {ves: 0, povt: upr.povt, tekst: "Первый раз: вес с запасом 2 повтора"};
  }
  const ves = Math.max(...p.v.map(x => x[0]));
  const povtory = p.v.map(x => x[1]);
  const bylo = "Было " + p.d + ": " + (ves ? zalKg(ves) + ", " : "") + povtory.join(" ");
  if (upr.tip === "max") return {ves, povt: povtory[0], tekst: bylo + ". Сегодня плюс повтор хоть в одном подходе"};
  const chisto = p.v.filter(x => x[0] >= ves && x[1] >= upr.povt).length >= upr.podh;
  if (chisto && ves) return {ves: ves + upr.shag, povt: upr.povt, rost: true, tekst: bylo + ". Было чисто, сегодня " + zalKg(ves + upr.shag)};
  return {ves, povt: upr.povt, tekst: bylo + ". Сегодня снова " + zalKg(ves) + ", добери " + zalCel(upr)};
}

function zalSledDen(dan){
  if (dan.tek) return dan.tek.den;
  const posl = dan.ist[0];
  if (posl && ZAL_DNI[posl.den]) {
    if (posl.d === zalDataKlyuch(novayaData(0))) return posl.den;
    return ZAL_PORYADOK[(ZAL_PORYADOK.indexOf(posl.den) + 1) % ZAL_PORYADOK.length];
  }
  const wd = novayaData(0).getDay();
  return wd === 3 || wd === 4 ? "B" : (wd === 5 || wd === 6 ? "V" : "A");
}
function zalNaNedele(ist){
  const pn = novayaData(0);
  pn.setDate(pn.getDate() - ((pn.getDay() + 6) % 7));
  const kl = zalDataKlyuch(pn);
  return ist.filter(x => x && x.d >= kl).length;
}
function zalSravnit(bylo, stalo){
  const maxV = v => Math.max(...v.map(x => x[0]));
  const summa = v => v.reduce((s, x) => s + x[1], 0);
  if (!bylo || !bylo.length) return "первый раз";
  const seychas = maxV(stalo), ranshe = maxV(bylo);
  if (seychas > ranshe) return "+" + zalKg(seychas - ranshe);
  if (seychas < ranshe) return "легче на " + zalKg(ranshe - seychas);
  const d = summa(stalo) - summa(bylo);
  if (d > 0) return "+" + d + " " + sklon(d, "повтор", "повтора", "повторов");
  if (d < 0) return "на " + (-d) + " " + sklon(-d, "повтор", "повтора", "повторов") + " меньше";
  return "так же";
}

function zalOtdyhKonec(){ try { return Number(localStorage.getItem("zal_otdyh")) || 0; } catch(e){ return 0; } }
function zalOtdyhStart(sek){ try { localStorage.setItem("zal_otdyh", String(Date.now() + sek * 1000)); } catch(e){} }
function zalOtdyhStop(){ try { localStorage.removeItem("zal_otdyh"); } catch(e){} }
function zalMinSek(ms){ const s = Math.max(0, Math.ceil(ms / 1000)); return Math.floor(s / 60) + ":" + pad2(s % 60); }
function zalSignal(){
  try { if (tg && tg.isVersionAtLeast && tg.isVersionAtLeast("6.1")) tg.HapticFeedback.notificationOccurred("success"); } catch(e){}
  try { if (navigator.vibrate) navigator.vibrate([200, 100, 200]); } catch(e){}
}
