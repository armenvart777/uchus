/* ---------- настройки ---------- */
const OFORMLENIYA = [
  ["tetrad", "Тетрадь", "зеленый, как было", ["#F2F4F3","#FFFFFF","#2B6F5F"], ["#0D1110","#171C1A","#63BFA4"]],
  ["okean", "Океан", "спокойный синий", ["#F1F4F8","#FFFFFF","#2F5FA8"], ["#0B0F15","#151B24","#7AA7F0"]],
  ["grafit", "Графит", "строго, без цвета", ["#F3F3F2","#FFFFFF","#2A2A28"], ["#0E0E0E","#1A1A1A","#E8E6E0"]],
  ["yantar", "Янтарь", "теплый, вечерний", ["#F6F3EE","#FFFFFF","#A35A12"], ["#120F0C","#1E1914","#E5A060"]],
  ["sliva", "Слива", "глубокий фиолетовый", ["#F5F2F6","#FFFFFF","#7A3F8C"], ["#100C12","#1C161F","#C99BDB"]]
];
const TEMY_VYBOR = [["tg","Как в телеграме"], ["light","Светлая"], ["dark","Темная"]];
const RAZMERY = [["m","Мельче"], ["n","Обычный"], ["k","Крупнее"]];
const NASTR_DEFOLT = {oform:"tetrad", tema:"tg", razmer:"n", vibro:true, pervaya:"segodnya"};
const NASTR_VKLADKI = ["segodnya","zal","ucheba","kletki","klod"];

function nastrChistye(syroe){
  const n = Object.assign({}, NASTR_DEFOLT);
  let o = syroe;
  if (typeof o === "string") { try { o = JSON.parse(o); } catch(e){ o = null; } }
  if (!o || typeof o !== "object") return n;
  if (OFORMLENIYA.some(x => x[0] === o.oform)) n.oform = o.oform;
  if (TEMY_VYBOR.some(x => x[0] === o.tema)) n.tema = o.tema;
  if (RAZMERY.some(x => x[0] === o.razmer)) n.razmer = o.razmer;
  if (typeof o.vibro === "boolean") n.vibro = o.vibro;
  if (NASTR_VKLADKI.includes(o.pervaya)) n.pervaya = o.pervaya;
  return n;
}
let nastroyki = (() => { try { return nastrChistye(localStorage.getItem("nastroyki")); } catch(e){ return nastrChistye(null); } })();

function primenitNastroyki(){
  const k = document.documentElement;
  if (nastroyki.oform === "tetrad") k.removeAttribute("data-oform"); else k.setAttribute("data-oform", nastroyki.oform);
  if (nastroyki.razmer === "n") k.removeAttribute("data-razmer"); else k.setAttribute("data-razmer", nastroyki.razmer);
  if (typeof primenitTemu === "function") primenitTemu();
  if (typeof kraskiTelegrama === "function") kraskiTelegrama();
}
function sohranitNastroyki(pravka){
  nastroyki = nastrChistye(Object.assign({}, nastroyki, pravka));
  primenitNastroyki();
  pishuKlyuch("nastroyki", JSON.stringify(nastroyki));
}
function nastrIzOblaka(){
  citatKlyuchi(["nastroyki"], rez => {
    if (!rez.nastroyki) return;
    const n = nastrChistye(rez.nastroyki);
    if (JSON.stringify(n) === JSON.stringify(nastroyki)) return;
    nastroyki = n;
    try { localStorage.setItem("nastroyki", JSON.stringify(n)); } catch(e){}
    primenitNastroyki();
  });
}

function nastrChipy(varianty, tekushhee, pole){
  const ryad = el("div","nap-chipy");
  varianty.forEach(([kod, imya]) => {
    const c = el("button","nap-chip" + (kod === tekushhee ? " vybran" : ""), imya);
    c.setAttribute("aria-pressed", kod === tekushhee ? "true" : "false");
    c.onclick = () => { if (kod === tekushhee) return; tryaska(); nastrPravka({[pole]: kod}); };
    ryad.append(c);
  });
  return ryad;
}
function nastrPravka(pravka){
  const y = window.scrollY;
  sohranitNastroyki(pravka);
  zamenitEkran(nastroykiEkran);
  window.scrollTo(0, y);
}

function oformObrazec(o, vybran){
  const [kod, imya, pod, svet, tem] = o;
  const [fon, karta, akcent] = temnayaTema() ? tem : svet;
  const b = el("button","oform" + (vybran ? " vybran" : ""));
  b.setAttribute("aria-pressed", vybran ? "true" : "false");
  const obr = el("span","oform-obrazec");
  obr.style.background = fon;
  const k = el("span","oform-karta");
  k.style.background = karta;
  const p1 = el("span","oform-polosa");
  p1.style.background = akcent;
  const p2 = el("span","oform-polosa korotkaya");
  p2.style.background = akcent;
  k.append(p1, p2);
  obr.append(k);
  if (vybran) {
    const g = el("span","oform-galka");
    g.append(svgGalochka(12));
    obr.append(g);
  }
  b.append(obr, el("span","oform-imya", imya), el("span","oform-pod", pod));
  b.onclick = () => { if (vybran) return; tryaska(); nastrPravka({oform: kod}); };
  return b;
}

function nastroykiEkran(){
  ochistit();
  const e = ekran();
  e.append(el("div","nadzag","Тетрадь"));
  e.append(el("div","zag-vk","Настройки"));
  e.append(el("p","podpis","Меняется сразу. Хранится в облаке телеграма, на телефоне и компьютере будет одинаково."));

  const bOform = el("div","blok");
  bOform.append(el("div","metka","Оформление"));
  const setka = el("div","oform-setka");
  OFORMLENIYA.forEach(o => setka.append(oformObrazec(o, o[0] === nastroyki.oform)));
  bOform.append(setka);
  e.append(bOform);

  const bTema = el("div","blok");
  bTema.append(el("div","metka","Тема"));
  bTema.append(nastrChipy(TEMY_VYBOR, nastroyki.tema, "tema"));
  bTema.append(el("div","chat-opis", nastroyki.tema === "tg"
    ? "Светлая днем и темная ночью, если так настроен телеграм."
    : "Тетрадь не будет подстраиваться под телеграм."));
  e.append(bTema);

  const bRazmer = el("div","blok");
  bRazmer.append(el("div","metka","Размер текста"));
  bRazmer.append(nastrChipy(RAZMERY, nastroyki.razmer, "razmer"));
  e.append(bRazmer);

  const bVkl = el("div","blok");
  bVkl.append(el("div","metka","Открывать сначала"));
  bVkl.append(nastrChipy(VKLADKI.map(v => [v.id, v.nazvanie]), nastroyki.pervaya, "pervaya"));
  bVkl.append(el("div","chat-opis","Вкладка, с которой тетрадь откроется в следующий раз."));
  e.append(bVkl);

  const bVibro = el("div","blok nastr-ryad");
  const tekst = el("div","nastr-tekst");
  tekst.append(el("div","nastr-zag","Отклик на нажатия"));
  tekst.append(el("div","chat-opis","Легкая вибрация на кнопках. Сигнал таймера отдыха в Зале остается."));
  const gal = el("button","galochka");
  gal.id = "nastr-vibro";
  gal.setAttribute("aria-label","Отклик на нажатия");
  postavitGalochku(gal, nastroyki.vibro);
  gal.onclick = () => {
    const vkl = !nastroyki.vibro;
    sohranitNastroyki({vibro: vkl});
    postavitGalochku(gal, vkl);
    tryaska();
  };
  bVibro.append(tekst, gal);
  e.append(bVibro);

  const sbros = el("button","knopka tihaya","Вернуть как было");
  sbros.id = "nastr-sbros";
  sbros.style.marginTop = "6px";
  podtverzhdenie(sbros, "Точно сбросить?", () => {
    nastrPravka(NASTR_DEFOLT);
    tost("Настройки сброшены");
  });
  e.append(sbros);
}
