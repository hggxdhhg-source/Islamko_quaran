// عناصر الصفحة
const $ = (selector) => document.querySelector(selector);

// رسالة صغيرة للمستخدم
let toastTimer;

function showToast(message) {
  const toast = $("#toast");

  toast.textContent = message;
  toast.classList.add("show");

  clearTimeout(toastTimer);

  toastTimer = setTimeout(() => {
    toast.classList.remove("show");
  }, 2200);
}

// بيانات السور الـ ١١٤ (الأسماء وعدد الآيات)؛ نص الآيات يُحمَّل عند الفتح ويُحفظ على الجهاز
const NAMES = "الفاتحة,البقرة,آل عمران,النساء,المائدة,الأنعام,الأعراف,الأنفال,التوبة,يونس,هود,يوسف,الرعد,إبراهيم,الحجر,النحل,الإسراء,الكهف,مريم,طه,الأنبياء,الحج,المؤمنون,النور,الفرقان,الشعراء,النمل,القصص,العنكبوت,الروم,لقمان,السجدة,الأحزاب,سبأ,فاطر,يس,الصافات,ص,الزمر,غافر,فصلت,الشورى,الزخرف,الدخان,الجاثية,الأحقاف,محمد,الفتح,الحجرات,ق,الذاريات,الطور,النجم,القمر,الرحمن,الواقعة,الحديد,المجادلة,الحشر,الممتحنة,الصف,الجمعة,المنافقون,التغابن,الطلاق,التحريم,الملك,القلم,الحاقة,المعارج,نوح,الجن,المزمل,المدثر,القيامة,الإنسان,المرسلات,النبأ,النازعات,عبس,التكوير,الانفطار,المطففين,الانشقاق,البروج,الطارق,الأعلى,الغاشية,الفجر,البلد,الشمس,الليل,الضحى,الشرح,التين,العلق,القدر,البينة,الزلزلة,العاديات,القارعة,التكاثر,العصر,الهمزة,الفيل,قريش,الماعون,الكوثر,الكافرون,النصر,المسد,الإخلاص,الفلق,الناس".split(",");
const COUNTS = [7,286,200,176,120,165,206,75,129,109,123,111,43,52,99,128,111,110,98,135,112,78,118,64,77,227,93,88,69,60,34,30,73,54,45,83,182,88,75,85,54,53,89,59,37,35,38,29,18,45,60,49,62,55,78,96,29,22,24,13,14,11,11,18,12,12,30,52,52,44,28,28,20,56,40,31,50,40,46,42,29,19,36,25,22,17,19,26,30,20,15,21,11,8,8,19,5,8,8,11,11,8,3,9,5,4,7,3,6,3,5,4,5,6];
const MEDINAN = [2,3,4,5,8,9,13,22,24,33,47,48,49,55,57,58,59,60,61,62,63,64,65,66,76,98,99,110];
const surahs = NAMES.map((name, i) => ({
  n: i + 1,
  name,
  count: COUNTS[i],
  kind: MEDINAN.includes(i + 1) ? "مدنية" : "مكية"
}));

// أدوات التخزين المحلي
const load = (key, fallback) => {
  try {
    const v = localStorage.getItem(key);
    if (v !== null) return JSON.parse(v);
    const kumKey = key.replace("islamko-", "islamkum-");
    if (kumKey !== key) {
      const kumV = localStorage.getItem(kumKey);
      if (kumV !== null) return JSON.parse(kumV);
    }
    const oldKey = key.replace("islamko-", "quranakum-");
    if (oldKey !== key) {
      const oldV = localStorage.getItem(oldKey);
      if (oldV !== null) return JSON.parse(oldV);
    }
    return fallback;
  } catch {
    return fallback;
  }
};
const save = (key, value) => {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch {}
};
// توحيد الحروف للبحث (يتجاهل الهمزات والتشكيل)
const norm = (s) => s
  .replace(/[\u064B-\u065F\u0670]/g, "")
  .replace(/[أإآٱ]/g, "ا")
  .replace(/ة/g, "ه")
  .replace(/ى/g, "ي")
  .trim();

let selectedSurah = load("islamko-surah", 1);


// عرض قائمة السور

// المفضلة
let favs = load("islamko-favs", []);
let showFavs = false;

function updateFavUI() {
  const on = favs.includes(selectedSurah);
  const btn = $("#favSurah");
  btn.textContent = on ? "★ في المفضلة" : "☆ أضف للمفضلة";
  btn.classList.toggle("is-fav", on);
  $("#favCount").textContent = favs.length.toLocaleString("ar-EG");
}

function toggleFav(n) {
  favs = favs.includes(n) ? favs.filter((x) => x !== n) : [...favs, n];
  save("islamko-favs", favs);
  showToast(favs.includes(n) ? "أُضيفت السورة إلى المفضلة" : "أُزيلت من المفضلة");
  renderSurahs($("#surahSearch").value);
  updateFavUI();
}

function renderSurahs(query = "") {
  const list = $("#surahList");
  const search = query.trim();

  const filtered = surahs.filter((surah) => {
    if (showFavs && !favs.includes(surah.n)) return false;
    return (
      !search ||
      norm(surah.name).includes(norm(search)) ||
      String(surah.n) === search ||
      surah.n.toLocaleString("ar-EG") === search
    );
  });

  if (filtered.length === 0) {
    list.innerHTML = `<p class="muted empty">${
      showFavs && !search
        ? "لم تضف أي سورة للمفضلة بعد. اضغط ☆ بجانب أي سورة."
        : "لا توجد سورة بهذا الاسم."
    }</p>`;
    return;
  }

  list.innerHTML = filtered.map((surah) => {
    const fav = favs.includes(surah.n);
    return `
    <div class="surah-row">
      <button class="surah-item ${surah.n === selectedSurah ? "selected" : ""}" data-surah="${surah.n}">
        <span class="surah-number">${surah.n.toLocaleString("ar-EG")}</span>
        <span class="surah-name">
          ${surah.name}
          <span class="surah-meta">${surah.kind} · ${surah.count.toLocaleString("ar-EG")} آية</span>
        </span>
      </button>
      <button class="fav-btn ${fav ? "is-fav" : ""}" data-fav="${surah.n}"
        aria-label="${fav ? "إزالة" : "إضافة"} ${surah.name} ${fav ? "من" : "إلى"} المفضلة"
        aria-pressed="${fav}">${fav ? "★" : "☆"}</button>
    </div>`;
  }).join("");

  list.querySelectorAll("[data-surah]").forEach((b) =>
    b.addEventListener("click", () => selectSurah(Number(b.dataset.surah))));
  list.querySelectorAll("[data-fav]").forEach((b) =>
    b.addEventListener("click", () => toggleFav(Number(b.dataset.fav))));
}

$("#favSurah").addEventListener("click", () => toggleFav(selectedSurah));
$("#surahTabs").querySelectorAll("[data-tab]").forEach((b) =>
  b.addEventListener("click", () => {
    showFavs = b.dataset.tab === "favs";
    $("#surahTabs").querySelectorAll(".filter-chip").forEach((c) =>
      c.classList.toggle("selected", c === b));
    renderSurahs($("#surahSearch").value);
  }));

// تحميل آيات السورة (من الإنترنت أول مرة ثم من ذاكرة الجهاز)
async function getAyahs(n) {
  const cached = load(`islamko-s${n}`, null);
  if (cached) return cached;

  const response = await fetch(
    `https://api.alquran.cloud/v1/surah/${n}/quran-uthmani`
  );
  if (!response.ok) throw new Error("fetch failed");

  const result = await response.json();
  const ayahs = result.data.ayahs.map((a) => a.text);

  // الخدمة تضيف البسملة لأول آية في كل سورة ما عدا الفاتحة والتوبة
  if (n !== 1 && n !== 9) {
    ayahs[0] = ayahs[0].replace(/^(\S+\s+){4}/, "");
  }

  save(`islamko-s${n}`, ayahs);
  return ayahs;
}

// عرض السورة المختارة
async function selectSurah(number) {
  const surah = surahs.find((item) => item.n === number);
  if (!surah) return;

  selectedSurah = number;
  save("islamko-surah", number);

  $("#selectedSurahTitle").textContent = `سورة ${surah.name}`;
  $("#selectedSurahMeta").textContent =
    `${surah.kind} · ${surah.count.toLocaleString("ar-EG")} آية · رقمها ${number.toLocaleString("ar-EG")}`;

  // البسملة تظهر منفصلة في كل السور عدا الفاتحة (آية) والتوبة (بلا بسملة)
  $("#basmala").style.display = number === 1 || number === 9 ? "none" : "block";

  $("#prevSurah").disabled = number === 1;
  $("#nextSurah").disabled = number === 114;

  QuranAudio.setSurah(number);

  const box = $("#ayahContainer");
  box.innerHTML = '<p class="muted">جارٍ تحميل الآيات...</p>';
  renderSurahs($("#surahSearch").value);
  updateFavUI();

  try {
    const ayahs = await getAyahs(number);
    if (number !== selectedSurah) return; // المستخدم انتقل لسورة أخرى
    box.innerHTML = ayahs.map((ayah, i) => `
      <span class="ayah" data-i="${i}" tabindex="0">${ayah}</span>
      <span class="ayah-number">۝${(i + 1).toLocaleString("ar-EG")}</span>
    `).join(" ");
  } catch {
    box.innerHTML = `
      <p class="muted">تعذّر تحميل الآيات. تأكد من الإنترنت.</p>
      <button class="small-button" id="retryAyahs">إعادة المحاولة</button>`;
    $("#retryAyahs").addEventListener("click", () => selectSurah(number));
  }
}

// نسخ آية بالضغط عليها
$("#ayahContainer").addEventListener("click", async (event) => {
  const el = event.target.closest(".ayah");
  if (!el) return;
  const surah = surahs[selectedSurah - 1];
  const text = `﴿ ${el.textContent.trim()} ﴾ — سورة ${surah.name}، الآية ${Number(el.dataset.i) + 1}`;
  try {
    await navigator.clipboard.writeText(text);
    showToast("تم نسخ الآية");
  } catch {
    showToast("تعذّر النسخ على هذا المتصفح");
  }
});

// السورة السابقة/التالية وحجم الخط
$("#prevSurah").addEventListener("click", () => selectSurah(selectedSurah - 1));
$("#nextSurah").addEventListener("click", () => selectSurah(selectedSurah + 1));

let ayahSize = load("islamko-size", 25);
function applySize() {
  document.documentElement.style.setProperty("--ayah-size", ayahSize + "px");
  save("islamko-size", ayahSize);
}
$("#fontUp").addEventListener("click", () => { ayahSize = Math.min(48, ayahSize + 2); applySize(); });
$("#fontDown").addEventListener("click", () => { ayahSize = Math.max(16, ayahSize - 2); applySize(); });
applySize();

// البحث عن سورة
$("#surahSearch").addEventListener("input", (event) => {
  renderSurahs(event.target.value);
});


// البحث عن سورة
$("#surahSearch").addEventListener("input", (event) => {
  renderSurahs(event.target.value);
});

// بيانات الأذكار
const adhkar = [
  {
    id: 1,
    category: "morning",
    label: "أذكار الصباح",
    text: "أَصْبَحْنَا وَأَصْبَحَ الْمُلْكُ لِلَّهِ، وَالْحَمْدُ لِلَّهِ، لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ. رَبِّ أَسْأَلُكَ خَيْرَ مَا فِي هَذَا الْيَوْمِ وَخَيْرَ مَا بَعْدَهُ، وَأَعُوذُ بِكَ مِنْ شَرِّ مَا فِي هَذَا الْيَوْمِ وَشَرِّ مَا بَعْدَهُ، رَبِّ أَعُوذُ بِكَ مِنَ الْكَسَلِ وَسُوءِ الْكِبَرِ، رَبِّ أَعُوذُ بِكَ مِنْ عَذَابٍ فِي النَّارِ وَعَذَابٍ فِي الْقَبْرِ.",
    source: "صحيح مسلم · ٦٩٠٨",
    url: "https://sunnah.com/muslim:6908",
    target: 1
  },
  {
    id: 2,
    category: "morning",
    label: "أذكار الصباح",
    text: "اللَّهُمَّ أَنْتَ رَبِّي لَا إِلَهَ إِلَّا أَنْتَ، خَلَقْتَنِي وَأَنَا عَبْدُكَ، وَأَنَا عَلَى عَهْدِكَ وَوَعْدِكَ مَا اسْتَطَعْتُ، أَعُوذُ بِكَ مِنْ شَرِّ مَا صَنَعْتُ، أَبُوءُ لَكَ بِنِعْمَتِكَ عَلَيَّ، وَأَبُوءُ بِذَنْبِي فَاغْفِرْ لِي، فَإِنَّهُ لَا يَغْفِرُ الذُّنُوبَ إِلَّا أَنْتَ.",
    source: "صحيح البخاري · ٦٣٠٦",
    url: "https://sunnah.com/bukhari:6306",
    target: 1
  },
  {
    id: 3,
    category: "evening",
    label: "أذكار المساء",
    text: "أَمْسَيْنَا وَأَمْسَى الْمُلْكُ لِلَّهِ، وَالْحَمْدُ لِلَّهِ، لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ. رَبِّ أَسْأَلُكَ خَيْرَ مَا فِي هَذِهِ اللَّيْلَةِ وَخَيْرَ مَا بَعْدَهَا، وَأَعُوذُ بِكَ مِنْ شَرِّ مَا فِي هَذِهِ اللَّيْلَةِ وَشَرِّ مَا بَعْدَهَا، رَبِّ أَعُوذُ بِكَ مِنَ الْكَسَلِ وَسُوءِ الْكِبَرِ، رَبِّ أَعُوذُ بِكَ مِنْ عَذَابٍ فِي النَّارِ وَعَذَابٍ فِي الْقَبْرِ.",
    source: "صحيح مسلم · ٦٩٠٨",
    url: "https://sunnah.com/muslim:6908",
    target: 1
  },
  {
    id: 4,
    category: "evening",
    label: "أذكار المساء",
    text: "اللَّهُمَّ أَنْتَ رَبِّي لَا إِلَهَ إِلَّا أَنْتَ، خَلَقْتَنِي وَأَنَا عَبْدُكَ، وَأَنَا عَلَى عَهْدِكَ وَوَعْدِكَ مَا اسْتَطَعْتُ، أَعُوذُ بِكَ مِنْ شَرِّ مَا صَنَعْتُ، أَبُوءُ لَكَ بِنِعْمَتِكَ عَلَيَّ، وَأَبُوءُ بِذَنْبِي فَاغْفِرْ لِي، فَإِنَّهُ لَا يَغْفِرُ الذُّنُوبَ إِلَّا أَنْتَ.",
    source: "صحيح البخاري · ٦٣٠٦",
    url: "https://sunnah.com/bukhari:6306",
    target: 1
  },
  {
    id: 5,
    category: "general",
    label: "ذكر عام",
    text: "سُبْحَانَ اللَّهِ وَبِحَمْدِهِ",
    source: "صحيح البخاري · ٦٤٠٥",
    url: "https://sunnah.com/bukhari:6405",
    target: 100
  },
  {
    id: 6,
    category: "general",
    label: "ذكر عام",
    text: "لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ.",
    source: "صحيح البخاري · ٣٢٩٣",
    url: "https://sunnah.com/bukhari:3293",
    target: 100
  },
  {
    id: 7,
    category: "general",
    label: "ذكر عام",
    text: "اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنَ الْهَمِّ وَالْحَزَنِ، وَالْعَجْزِ وَالْكَسَلِ، وَالْجُبْنِ وَالْبُخْلِ، وَضَلَعِ الدَّيْنِ وَغَلَبَةِ الرِّجَالِ.",
    source: "صحيح البخاري · ٦٣٦٩",
    url: "https://sunnah.com/bukhari:6369",
    target: 1
  },
  {
    id: 8,
    category: "general",
    label: "ذكر عام",
    text: "اللَّهُمَّ إِنِّي أَسْأَلُكَ الْهُدَى وَالتُّقَى وَالْعَفَافَ وَالْغِنَى.",
    source: "صحيح مسلم · ٦٩٠٤",
    url: "https://sunnah.com/muslim:6904",
    target: 1
  }
];

const categoryNames = {
  morning: "أذكار الصباح",
  evening: "أذكار المساء",
  general: "ذكر عام"
};

let currentFilter = "all";
let adhkarCounts = {};

try {
  adhkarCounts = JSON.parse(
    localStorage.getItem("islamko-adhkar-v2") ||
    localStorage.getItem("islamkum-adhkar-v2") ||
    localStorage.getItem("quranakum-adhkar-v2") ||
    "{}"
  );
} catch {
  adhkarCounts = {};
}
// تبدأ الأذكار من الصفر كل يوم
const todayKey = new Date().toDateString();
if (adhkarCounts._d !== todayKey) adhkarCounts = { _d: todayKey };

// عرض الأذكار
function renderAdhkar() {
  const items = adhkar.filter((item) => {
    return (
      currentFilter === "all" ||
      item.category === currentFilter
    );
  });

  const totalTarget = adhkar.reduce((total, item) => total + item.target, 0);
  const totalCount = adhkar.reduce(
    (total, item) => total + Math.min(item.target, adhkarCounts[item.id] || 0),
    0
  );
  const progress = Math.round((totalCount / totalTarget) * 100);
  const progressBar = $("#adhkarProgressBar");
  const progressTrack = progressBar.parentElement;
  const completedItems = adhkar.filter(
    (item) => (adhkarCounts[item.id] || 0) >= item.target
  ).length;

  $("#adhkarProgressText").textContent = `${progress.toLocaleString("ar-EG")}٪ مكتمل`;
  $("#adhkarProgressDetail").textContent = completedItems === adhkar.length
    ? "ما شاء الله، أتممت وردك اليوم. تقبّل الله منك."
    : `أتممت ${completedItems.toLocaleString("ar-EG")} من ${adhkar.length.toLocaleString("ar-EG")} أذكار اليوم`;
  progressBar.style.width = `${progress}%`;
  progressTrack.setAttribute("aria-valuenow", String(progress));

  $("#adhkarGrid").innerHTML = items.map((item) => {
    const count = adhkarCounts[item.id] || 0;
    const itemProgress = Math.min(100, Math.round((count / item.target) * 100));

    return `
      <article class="dhikr-card panel${count >= item.target ? " is-complete" : ""}">
        <div class="dhikr-card-heading">
          <span class="dhikr-type">${categoryNames[item.category]}</span>
          <span class="dhikr-target">${item.target === 1 ? "مرة واحدة" : `${item.target.toLocaleString("ar-EG")} مرة`}</span>
        </div>

        <p class="dhikr-text quran-font">${item.text}</p>

        <div class="dhikr-bottom">
          <span class="dhikr-count">إنجازك <strong>${count.toLocaleString("ar-EG")}</strong><span> / ${item.target.toLocaleString("ar-EG")}</span><a class="dhikr-source" href="${item.url}" target="_blank" rel="noopener">${item.source} ↗</a></span>
          <button
            class="dhikr-action"
            data-dhikr="${item.id}"
            aria-label="${count >= item.target ? "اكتمل" : `تسبيح ${item.text}`}"
            ${count >= item.target ? "disabled" : ""}
          >
            ${count >= item.target ? "اكتمل ✓" : "سبّح"}
          </button>
        </div>
        <div class="dhikr-item-progress" role="progressbar" aria-label="إنجاز ${item.text}" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${itemProgress}">
          <span style="width: ${itemProgress}%"></span>
        </div>
      </article>
    `;
  }).join("");

  $("#adhkarGrid")
    .querySelectorAll("[data-dhikr]")
    .forEach((button) => {
      button.addEventListener("click", () => {
        const id = Number(button.dataset.dhikr);
        const item = adhkar.find((dhikr) => dhikr.id === id);

        adhkarCounts[id] = Math.min(
          item.target,
          (adhkarCounts[id] || 0) + 1
        );

        localStorage.setItem(
          "islamko-adhkar-v2",
          JSON.stringify(adhkarCounts)
        );

        renderAdhkar();

        if (adhkarCounts[id] === item.target) {
          showToast("أحسنت، أتممت هذا الذكر");
        }
      });
    });
}

// فلترة الأذكار
$("#adhkarFilters")
  .querySelectorAll("[data-filter]")
  .forEach((button) => {
    button.addEventListener("click", () => {
      currentFilter = button.dataset.filter;

      $("#adhkarFilters")
        .querySelectorAll(".filter-chip")
        .forEach((chip) => {
          chip.classList.toggle("selected", chip === button);
          chip.setAttribute("aria-pressed", String(chip === button));
        });

      renderAdhkar();
    });
  });

// أدعية ومكتبة أحاديث الصحيحين (البخاري ومسلم)
const duas = [
  {
    title: "خير الدنيا والآخرة (أكثر دعاء النبي ﷺ)",
    category: "جوامع الدعاء",
    text: "رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً وَفِي الْآخِرَةِ حَسَنَةً وَقِنَا عَذَابَ النَّارِ",
    source: "صحيح البخاري · ٦٣٨٩ | صحيح مسلم · ٢٦٩٠",
    url: "https://sunnah.com/bukhari:6389"
  },
  {
    title: "سيّد الاستغفار",
    category: "الاستغفار والتوبة",
    text: "اللَّهُمَّ أَنْتَ رَبِّي لَا إِلَهَ إِلَّا أَنْتَ، خَلَقْتَنِي وَأَنَا عَبْدُكَ، وَأَنَا عَلَى عَهْدِكَ وَوَعْدِكَ مَا اسْتَطَعْتُ، أَعُوذُ بِكَ مِنْ شَرِّ مَا صَنَعْتُ، أَبُوءُ لَكَ بِنِعْمَتِكَ عَلَيَّ، وَأَبُوءُ لَكَ بِذَنْبِي، فَاغْفِرْ لِي؛ فَإِنَّهُ لَا يَغْفِرُ الذُّنُوبَ إِلَّا أَنْتَ",
    source: "صحيح البخاري · ٦٣٠٦",
    url: "https://sunnah.com/bukhari:6306"
  },
  {
    title: "دعاء الكرب العظيم",
    category: "تفريج الكرب والهم",
    text: "لَا إِلَهَ إِلَّا اللَّهُ الْعَظِيمُ الْحَلِيمُ، لَا إِلَهَ إِلَّا اللَّهُ رَبُّ الْعَرْشِ الْعَظِيمِ، لَا إِلَهَ إِلَّا اللَّهُ رَبُّ السَّمَاوَاتِ وَرَبُّ الْأَرْضِ وَرَبُّ الْعَرْشِ الْكَرِيمِ",
    source: "صحيح البخاري · ٦٣٤٥ | صحيح مسلم · ٢٧٣٠",
    url: "https://sunnah.com/bukhari:6345"
  },
  {
    title: "دعاء صلاة الاستخارة النبوي",
    category: "الاستخارة وتيسير الأمور",
    text: "اللَّهُمَّ إِنِّي أَسْتَخِيرُكَ بِعِلْمِكَ، وَأَسْتَقْدِرُكَ بِقُدْرَتِكَ، وَأَسْأَلُكَ مِنْ فَضْلِكَ الْعَظِيمِ، فَإِنَّكَ تَقْدِرُ وَلَا أَقْدِرُ، وَتَعْلَمُ وَلَا أَعْلَمُ، وَأَنْتَ عَلَّامُ الْغُيُوبِ، اللَّهُمَّ إِنْ كُنْتَ تَعْلَمُ أَنَّ هَذَا الْأَمْرَ خَيْرٌ لِي فِي دِينِي وَمَعَاشِي وَعَاقِبَةِ أَمْرِي فَاقْدُرْهُ لِي وَيَسِّرْهُ لِي ثُمَّ بَارِكْ لِي فِيهِ، وَإِنْ كُنْتَ تَعْلَمُ أَنَّ هَذَا الْأَمْرَ شَرٌّ لِي فِي دِينِي وَمَعَاشِي وَعَاقِبَةِ أَمْرِي فَاصْرِفْهُ عَنِّي وَاصْرِفْنِي عَنْهُ، وَاقْدُرْ لِيَ الْخَيْرَ حَيْثُ كَانَ ثُمَّ أَرْضِنِي بِهِ",
    source: "صحيح البخاري · ١١٦٦",
    url: "https://sunnah.com/bukhari:1166"
  },
  {
    title: "دعاء الاستعاذة من الهم والحزن والكسل والدين",
    category: "الاستعاذة والوقاية",
    text: "اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنَ الْهَمِّ وَالْحَزَنِ، وَالْعَجْزِ وَالْكَسَلِ، وَالْجُبْنِ وَالْبُخْلِ، وَضَلَعِ الدَّيْنِ، وَغَلَبَةِ الرِّجَالِ",
    source: "صحيح البخاري · ٦٣٦٩ | صحيح مسلم · ٢٧٠٦",
    url: "https://sunnah.com/bukhari:6369"
  },
  {
    title: "سؤال الهدى والتقى والعفاف والغنى",
    category: "جوامع الدعاء",
    text: "اللَّهُمَّ إِنِّي أَسْأَلُكَ الْهُدَى وَالتُّقَى وَالْعَفَافَ وَالْغِنَى",
    source: "صحيح مسلم · ٢٧٢١",
    url: "https://sunnah.com/muslim:2721"
  },
  {
    title: "دعاء الصديق رضي الله عنه في الصلاة",
    category: "الاستغفار والتوبة",
    text: "اللَّهُمَّ إِنِّي ظَلَمْتُ نَفْسِي ظُلْمًا كَثِيرًا، وَلَا يَغْفِرُ الذُّنُوبَ إِلَّا أَنْتَ، فَاغْفِرْ لِي مَغْفِرَةً مِنْ عِنْدِكَ، وَارْحَمْنِي، إِنَّكَ أَنْتَ الْغَفُورُ الرَّحِيمُ",
    source: "صحيح البخاري · ٨٣٤ | صحيح مسلم · ٢٧٠٥",
    url: "https://sunnah.com/bukhari:834"
  },
  {
    title: "دعاء قيام الليل واستفتاح التهجد",
    category: "أدعية الصلاة وقيام الليل",
    text: "اللَّهُمَّ لَكَ الْحَمْدُ أَنْتَ قَيِّمُ السَّمَاوَاتِ وَالْأَرْضِ وَمَنْ فِيهِنَّ، وَلَكَ الْحَمْدُ لَكَ مُلْكُ السَّمَاوَاتِ وَالْأَرْضِ وَمَنْ فِيهِنَّ، وَلَكَ الْحَمْدُ أَنْتَ نُورُ السَّمَاوَاتِ وَالْأَرْضِ وَمَنْ فِيهِنَّ، وَلَكَ الْحَمْدُ أَنْتَ مَلِكُ السَّمَاوَاتِ وَالْأَرْضِ، وَلَكَ الْحَمْدُ أَنْتَ الْحَقُّ، وَوَعْدُكَ الْحَقُّ، وَلِقَاؤُكَ حَقٌّ، وَقَوْلُكَ حَقٌّ، وَالْجَنَّةُ حَقٌّ، وَالنَّارُ حَقٌّ، وَالنَّبِيُّونَ حَقٌّ، وَمُحَمَّدٌ ﷺ حَقٌّ، وَالسَّاعَةُ حَقٌّ، اللَّهُمَّ لَكَ أَسْلَمْتُ، وَبِكَ آمَنْتُ، وَعَلَيْكَ تَوَكَّلْتُ، وَإِلَيْكَ أَنَبْتُ، وَبِكَ خَاصَمْتُ، وَإِلَيْكَ حَاكَمْتُ، فَاغْفِرْ لِي مَا قَدَّمْتُ وَمَا أَخَّرْتُ، وَمَا أَسْرَرْتُ وَمَا أَعْلَنْتُ، أَنْتَ الْمُقَدِّمُ وَأَنْتَ الْمُؤَخِّرُ، لَا إِلَهَ إِلَّا أَنْتَ",
    source: "صحيح البخاري · ١١٢٠ | صحيح مسلم · ٧٦٩",
    url: "https://sunnah.com/bukhari:1120"
  },
  {
    title: "دعاء التعارّ من الليل وإجابة الدعاء",
    category: "أدعية الليل واليقظة",
    text: "لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ، وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ، الْحَمْدُ لِلَّهِ، وَسُبْحَانَ اللَّهِ، وَلَا إِلَهَ إِلَّا اللَّهُ، وَاللَّهُ أَكْبَرُ، وَلَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللَّهِ، رَبِّ اغْفِرْ لِي",
    source: "صحيح البخاري · ١١٥٤",
    url: "https://sunnah.com/bukhari:1154"
  },
  {
    title: "دعاء السجود العظيم",
    category: "أدعية الصلاة",
    text: "اللَّهُمَّ اغْفِرْ لِي ذَنْبِي كُلَّهُ، دِقَّهُ وَجِلَّهُ، وَأَوَّلَهُ وَآخِرَهُ، وَعَلَانِيَتَهُ وَسِرَّهُ",
    source: "صحيح مسلم · ٤٨٣",
    url: "https://sunnah.com/muslim:483"
  },
  {
    title: "دعاء الركوع والسجود القرآني",
    category: "أدعية الصلاة",
    text: "سُبْحَانَكَ اللَّهُمَّ رَبَّنَا وَبِحَمْدِكَ، اللَّهُمَّ اغْفِرْ لِي",
    source: "صحيح البخاري · ٧٩٤ | صحيح مسلم · ٤٨٤",
    url: "https://sunnah.com/bukhari:794"
  },
  {
    title: "دعاء التشهد الأخير والاستعاذة من الأربع",
    category: "أدعية الصلاة",
    text: "اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنْ عَذَابِ جَهَنَّمَ، وَمِنْ عَذَابِ الْقَبْرِ، وَمِنْ فِتْنَةِ الْمَحْيَا وَالْمَمَاتِ، وَمِنْ شَرِّ فِتْنَةِ الْمَسِيحِ الدَّجَّالِ",
    source: "صحيح مسلم · ٥٨٨ | صحيح البخاري · ١٣٧٧",
    url: "https://sunnah.com/muslim:588"
  },
  {
    title: "دعاء الاستعاذة من زوال النعم وفجاءة النقم",
    category: "الاستعاذة والوقاية",
    text: "اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنْ زَوَالِ نِعْمَتِكَ، وَتَحَوُّلِ عَافِيَتِكَ، وَفُجَاءَةِ نِقْمَتِكَ، وَجَمِيعِ سَخَطِكَ",
    source: "صحيح مسلم · ٢٧٣٩",
    url: "https://sunnah.com/muslim:2739"
  },
  {
    title: "دعاء الاستعاذة من جهد البلاء وشماتة الأعداء",
    category: "تفريج الكرب والهم",
    text: "اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنْ جَهْدِ الْبَلَاءِ، وَدَرَكِ الشَّقَاءِ، وَسُوءِ الْقَضَاءِ، وَشَمَاتَةِ الْأَعْدَاءِ",
    source: "صحيح البخاري · ٦٣٤٧ | صحيح مسلم · ٢٧٠٧",
    url: "https://sunnah.com/bukhari:6347"
  },
  {
    title: "دعاء تصريف القلوب وثباتها",
    category: "الهداية والثبات",
    text: "اللَّهُمَّ مُصَرِّفَ الْقُلُوبِ صَرِّفْ قُلُوبَنَا عَلَى طَاعَتِكَ",
    source: "صحيح مسلم · ٢٦٥٤",
    url: "https://sunnah.com/muslim:2654"
  },
  {
    title: "دعاء جامع المغفرة والرحمة والفضل",
    category: "الاستغفار والتوبة",
    text: "اللَّهُمَّ اغْفِرْ لِي خَطِيئَتِي وَجَهْلِي، وَإِسْرَافِي فِي أَمْرِي، وَمَا أَنْتَ أَعْلَمُ بِهِ مِنِّي، اللَّهُمَّ اغْفِرْ لِي جِدِّي وَهَزْلِي، وَخَطَئِي وَعَمْدِي، وَكُلُّ ذَلِكَ عِنْدِي، اللَّهُمَّ اغْفِرْ لِي مَا قَدَّمْتُ وَمَا أَخَّرْتُ، وَمَا أَسْرَرْتُ وَمَا أَعْلَنْتُ، وَمَا أَنْتَ أَعْلَمُ بِهِ مِنِّي، أَنْتَ الْمُقَدِّمُ وَأَنْتَ الْمُؤَخِّرُ، وَأَنْتَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ",
    source: "صحيح البخاري · ٦٣٩٨ | صحيح مسلم · ٢٧١٩",
    url: "https://sunnah.com/bukhari:6398"
  },
  {
    title: "دعاء عيادة المريض وطلب الشفاء",
    category: "الشفاء وعيادة المريض",
    text: "اللَّهُمَّ رَبَّ النَّاسِ أَذْهِبِ الْبَاسَ، اشْفِهِ وَأَنْتَ الشَّافِي، لَا شِفَاءَ إِلَّا شِفَاؤُكَ، شِفَاءً لَا يُغَادِرُ سَقَمًا",
    source: "صحيح البخاري · ٥٧٤٣ | صحيح مسلم · ٢١٩١",
    url: "https://sunnah.com/bukhari:5743"
  },
  {
    title: "رقية جبريل عليه السلام",
    category: "الشفاء وعيادة المريض",
    text: "بِاسْمِ اللَّهِ أَرْقِيكَ، مِنْ كُلِّ شَيْءٍ يُؤْذِيكَ، مِنْ شَرِّ كُلِّ نَفْسٍ أَوْ عَيْنِ حَاسِدٍ، اللَّهُ يَشْفِيكَ، بِاسْمِ اللَّهِ أَرْقِيكَ",
    source: "صحيح مسلم · ٢١٨٦",
    url: "https://sunnah.com/muslim:2186"
  },
  {
    title: "دعاء النوم وتسليم الأمر لله",
    category: "أدعية النوم واليقظة",
    text: "اللَّهُمَّ أَسْلَمْتُ وَجْهِي إِلَيْكَ، وَفَوَّضْتُ أَمْرِي إِلَيْكَ، وَأَلْجَأْتُ ظَهْرِي إِلَيْكَ، رَغْبَةً وَرَهْبَةً إِلَيْكَ، لَا مَلْجَأَ وَلَا مَنْجَا مِنْكَ إِلَّا إِلَيْكَ، آمَنْتُ بِكِتَابِكَ الَّذِي أَنْزَلْتَ، وَبِنَبِيِّكَ الَّذِي أَرْسَلْتَ",
    source: "صحيح البخاري · ٢٤٧ | صحيح مسلم · ٢٧١٠",
    url: "https://sunnah.com/bukhari:247"
  },
  {
    title: "دعاء الاستيقاظ من النوم",
    category: "أدعية النوم واليقظة",
    text: "الْحَمْدُ لِلَّهِ الَّذِي أَحْيَانَا بَعْدَ مَا أَمَاتَنَا وَإِلَيْهِ النُّشُورُ",
    source: "صحيح البخاري · ٦٣١٢ | صحيح مسلم · ٢٧١١",
    url: "https://sunnah.com/bukhari:6312"
  },
  {
    title: "دعاء السفر وركوب الدابة",
    category: "السفر والتنقل",
    text: "سُبْحَانَ الَّذِي سَخَّرَ لَنَا هَذَا وَمَا كُنَّا لَهُ مُقْرِنِينَ وَإِنَّا إِلَى رَبِّنَا لَمُنْقَلِبُونَ، اللَّهُمَّ إِنَّا نَسْأَلُكَ فِي سَفَرِنَا هَذَا الْبِرَّ وَالتَّقْوَى، وَمِنَ الْعَمَلِ مَا تَرْضَى، اللَّهُمَّ هَوِّنْ عَلَيْنَا سَفَرَنَا هَذَا وَاطْوِ عَنَّا بُعْدَهُ، اللَّهُمَّ أَنْتَ الصَّاحِبُ فِي السَّفَرِ، وَالْخَلِيفَةُ فِي الْأَهْلِ، اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنْ وَعْثَاءِ السَّفَرِ، وَكَآبَةِ الْمَنْظَرِ، وَسُوءِ الْمُنْقَلَبِ فِي الْمَالِ وَالْأَهْلِ",
    source: "صحيح مسلم · ١٣٤٢",
    url: "https://sunnah.com/muslim:1342"
  },
  {
    title: "دعاء سؤال العفو والعافية في كل أمر",
    category: "الاستعاذة والوقاية",
    text: "اللَّهُمَّ إِنِّي أَسْأَلُكَ الْعَافِيَةَ فِي الدُّنْيَا وَالْآخِرَةِ، اللَّهُمَّ إِنِّي أَسْأَلُكَ الْعَفْوَ وَالْعَافِيَةَ فِي دِينِي وَدُنْيَايَ وَأَهْلِي وَمَالِي، اللَّهُمَّ اسْتُرْ عَوْرَاتِي وَآمِنْ رَوْعَاتِي، اللَّهُمَّ احْفَظْنِي مِنْ بَيْنِ يَدَيَّ، وَمِنْ خَلْفِي، وَعَنْ يَمِينِي، وَعَنْ شِمَالِي، وَمِنْ فَوْقِي، وَأَعُوذُ بِعَظَمَتِكَ أَنْ أُغْتَالَ مِنْ تَحْتِي",
    source: "صحيح الأدب المفرد للبخاري · ١٢٠٠",
    url: "https://sunnah.com/adab:1200"
  },
  {
    title: "دعاء النور التام",
    category: "الهداية والثبات",
    text: "اللَّهُمَّ اجْعَلْ فِي قَلْبِي نُورًا، وَفِي بَصَرِي نُورًا، وَفِي سَمْعِي نُورًا، وَعَنْ يَمِينِي نُورًا، وَعَنْ يَسَارِي نُورًا، وَفَوْقِي نُورًا، وَتَحْتِي نُورًا، وَأَمَامِي نُورًا، وَخَلْفِي نُورًا، وَعَظِّمْ لِي نُورًا",
    source: "صحيح البخاري · ٦٣١٦ | صحيح مسلم · ٧٦٣",
    url: "https://sunnah.com/bukhari:6316"
  },
  {
    title: "دعاء الاستعاذة من الأربع المهلكات",
    category: "الاستعاذة والوقاية",
    text: "اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنْ عِلْمٍ لَا يَنْفَعُ، وَمِنْ قَلْبٍ لَا يَخْشَعُ، وَمِنْ نَفْسٍ لَا تَشْبَعُ، وَمِنْ دَعْوَةٍ لَا يُسْتَجَابُ لَهَا",
    source: "صحيح مسلم · ٢٧٢٢",
    url: "https://sunnah.com/muslim:2722"
  },
  {
    title: "دعاء ذي النون لتفريج الكروب والشدائد",
    category: "تفريج الكرب والهم",
    text: "لَا إِلَهَ إِلَّا أَنْتَ سُبْحَانَكَ إِنِّي كُنْتُ مِنَ الظَّالِمِينَ",
    source: "القرآن الكريم · سورة الأنبياء، الآية ٨٧",
    url: "https://quran.com/21/87"
  },
  {
    title: "دعاء موسى عليه السلام لشرح الصدر وتيسير الأمر",
    category: "الاستخارة وتيسير الأمور",
    text: "رَبِّ اشْرَحْ لِي صَدْرِي ۝ وَيَسِّرْ لِي أَمْرِي ۝ وَاحْلُلْ عُقْدَةً مِنْ لِسَانِي ۝ يَفْقَهُوا قَوْلِي",
    source: "القرآن الكريم · سورة طه، الآيات ٢٥–٢٨",
    url: "https://quran.com/20/25-28"
  },
  {
    title: "دعاء الثبات على الهداية بعد الإيمان",
    category: "الهداية والثبات",
    text: "رَبَّنَا لَا تُزِغْ قُلُوبَنَا بَعْدَ إِذْ هَدَيْتَنَا وَهَبْ لَنَا مِنْ لَدُنْكَ رَحْمَةً إِنَّكَ أَنْتَ الْوَهَّابُ",
    source: "القرآن الكريم · سورة آل عمران، الآية ٨",
    url: "https://quran.com/3/8"
  },
  {
    title: "دعاء صلاح الذرية والأسرة وقرة العين",
    category: "صلاح النفس والذرية",
    text: "رَبَّنَا هَبْ لَنَا مِنْ أَزْوَاجِنَا وَذُرِّيَّاتِنَا قُرَّةَ أَعْيُنٍ وَاجْعَلْنَا لِلْمُتَّقِينَ إِمَامًا",
    source: "القرآن الكريم · سورة الفرقان، الآية ٧٤",
    url: "https://quran.com/25/74"
  },
  {
    title: "دعاء إبراهيم عليه السلام لإقامة الصلاة وقبول الدعاء",
    category: "صلاح النفس والذرية",
    text: "رَبِّ اجْعَلْنِي مُقِيمَ الصَّلَاةِ وَمِنْ ذُرِّيَّتِي رَبَّنَا وَتَقَبَّلْ دُعَاءِ ۝ رَبَّنَا اغْفِرْ لِي وَلِوَالِدَيَّ وَلِلْمُؤْمِنِينَ يَوْمَ يَقُومُ الْحِسَابُ",
    source: "القرآن الكريم · سورة إبراهيم، الآيات ٤٠–٤١",
    url: "https://quran.com/14/40-41"
  },
  {
    title: "دعاء نيل المغفرة والرحمة الجامعة",
    category: "الاستغفار والتوبة",
    text: "رَبَّنَا ظَلَمْنَا أَنْفُسَنَا وَإِنْ لَمْ تَغْفِرْ لَنَا وَتَرْحَمْنَا لَنَكُونَنَّ مِنَ الْخَاسِرِينَ",
    source: "القرآن الكريم · سورة الأعراف، الآية ٢٣",
    url: "https://quran.com/7/23"
  },
  {
    title: "دعاء سجود التلاوة وخضوع الوجه لخالقه",
    category: "أدعية الصلاة",
    text: "سَجَدَ وَجْهِي لِلَّذِي خَلَقَهُ وَصَوَّرَهُ، وَشَقَّ سَمْعَهُ وَبَصَرَهُ، بِحَوْلِهِ وَقُوَّتِهِ، فَتَبَارَكَ اللَّهُ أَحْسَنُ الْخَالِقِينَ",
    source: "صحيح مسلم · ٧٧١",
    url: "https://sunnah.com/muslim:771"
  },
  {
    title: "دعاء قضاء الدين وتفريج الفاقة",
    category: "تفريج الكرب والهم",
    text: "اللَّهُمَّ اكْفِنِي بِحَلَالِكَ عَنْ حَرَامِكَ، وَأَغْنِنِي بِفَضْلِكَ عَمَّنْ سِوَاكَ",
    source: "صحيح الترمذي وصححه الألباني",
    url: "https://sunnah.com/tirmidhi:3563"
  },
  {
    title: "دعاء إصلاح الدين والدنيا والآخرة",
    category: "جوامع الدعاء",
    text: "اللَّهُمَّ أَصْلِحْ لِي دِينِي الَّذِي هُوَ عِصْمَةُ أَمْرِي، وَأَصْلِحْ لِي دُنْيَايَ الَّتِي فِيهَا مَعَاشِي، وَأَصْلِحْ لِي آخِرَتِي الَّتِي فِيهَا مَعَادِي، وَاجْعَلِ الْحَيَاةَ زِيَادَةً لِي فِي كُلِّ خَيْرٍ، وَاجْعَلِ الْمَوْتَ رَاحَةً لِي مِنْ كُلِّ شَرٍّ",
    source: "صحيح مسلم · ٢٧٢٠",
    url: "https://sunnah.com/muslim:2720"
  },
  {
    title: "دعاء الاستعاذة من المأثم والمغرم والفتن",
    category: "الاستعاذة والوقاية",
    text: "اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنَ الْكَسَلِ وَالْهَرَمِ، وَالْمَأْثَمِ وَالْمَغْرَمِ، وَمِنْ فِتْنَةِ الْقَبْرِ وَعَذَابِ الْقَبْرِ، وَمِنْ فِتْنَةِ النَّارِ وَعَذَابِ النَّارِ، وَمِنْ شَرِّ فِتْنَةِ الْغِنَى، وَأَعُوذُ بِكَ مِنْ فِتْنَةِ الْفَقْرِ، وَأَعُوذُ بِكَ مِنْ فِتْنَةِ الْمَسِيحِ الدَّجَّالِ",
    source: "صحيح البخاري · ٦٣٧٥ | صحيح مسلم · ٥٨٩",
    url: "https://sunnah.com/bukhari:6375"
  },
  {
    title: "دعاء الخروج من المنزل والتوكل على الله",
    category: "السفر والتنقل",
    text: "بِسْمِ اللَّهِ، تَوَكَّلْتُ عَلَى اللَّهِ، لَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللَّهِ، اللَّهُمَّ إِنِّي أَعُوذُ بِكَ أَنْ أَضِلَّ أَوْ أُضَلَّ، أَوْ أَزِلَّ أَوْ أُزَلَّ، أَوْ أَظْلِمَ أَوْ أُظْلَمَ، أَوْ أَجْهَلَ أَوْ يُجْهَلَ عَلَيَّ",
    source: "أبو داود والترمذي وصححه الألباني",
    url: "https://sunnah.com/abudawud:5094"
  },
  {
    title: "دعاء كفارة المجلس وختام الحديث الطيب",
    category: "الاستغفار والتوبة",
    text: "سُبْحَانَكَ اللَّهُمَّ وَبِحَمْدِكَ، أَشْهَدُ أَنْ لَا إِلَهَ إِلَّا أَنْتَ، أَسْتَغْفِرُكَ وَأَتُوبُ إِلَيْكَ",
    source: "صحيح الترمذي وصححه الألباني",
    url: "https://sunnah.com/tirmidhi:3433"
  },
  {
    title: "دعاء الإفطار للصائم",
    category: "جوامع الدعاء",
    text: "ذَهَبَ الظَّمَأُ، وَابْتَلَّتِ الْعُرُوقُ، وَثَبَتَ الْأَجْرُ إِنْ شَاءَ اللَّهُ",
    source: "سنن أبي داود · ٢٣٥٧ وحسنه الدارقطني",
    url: "https://sunnah.com/abudawud:2357"
  },
  {
    title: "دعاء هبوب الرياح وسؤال خيرها",
    category: "الاستعاذة والوقاية",
    text: "اللَّهُمَّ إِنِّي أَسْأَلُكَ خَيْرَهَا، وَخَيْرَ مَا فِيهَا، وَخَيْرَ مَا أُرْسِلَتْ بِهِ، وَأَعُوذُ بِكَ مِنْ شَرِّهَا، وَشَرِّ مَا فِيهَا، وَشَرِّ مَا أُرْسِلَتْ بِهِ",
    source: "صحيح مسلم · ٨٩٩ | صحيح البخاري · ٣٢٠٦",
    url: "https://sunnah.com/muslim:899"
  },
  {
    title: "دعاء نزول المطر وسؤال النفع والبركة",
    category: "جوامع الدعاء",
    text: "اللَّهُمَّ صَيِّبًا نَافِعًا، مُطِرْنَا بِفَضْلِ اللَّهِ وَرَحْمَتِهِ",
    source: "صحيح البخاري · ١٠٣٢ | صحيح مسلم · ٨٩٧",
    url: "https://sunnah.com/bukhari:1032"
  },
  {
    title: "دعاء طلب الفردوس الأعلى والنجاة من النار",
    category: "جوامع الدعاء",
    text: "اللَّهُمَّ إِنِّي أَسْأَلُكَ الْجَنَّةَ وَمَا قَرَّبَ إِلَيْهَا مِنْ قَوْلٍ أَوْ عَمَلٍ، وَأَعُوذُ بِكَ مِنَ النَّارِ وَمَا قَرَّبَ إِلَيْهَا مِنْ قَوْلٍ أَوْ عَمَلٍ، وَأَسْأَلُكَ أَنْ تَجْعَلَ كُلَّ قَضَاءٍ قَضَيْتَهُ لِي خَيْرًا",
    source: "صحيح ابن ماجه · ٣٨٤٦ وصححه الألباني",
    url: "https://sunnah.com/ibnmajah:3846"
  }
];

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    "\"": "&quot;",
    "'": "&#39;"
  })[character]);
}

function setupDuaLibrary() {
  const hadiths = window.ISLAMKO_HADITHS || window.QURANAKUM_HADITHS;
  const featuredHadith = hadiths?.find(
    (hadith) => hadith.collection === "bukhari" && hadith.number === 13
  );
  const previewDua = duas[0];

  $("#libraryPreview").innerHTML = `
    <article class="library-preview-card panel">
      <div class="library-preview-item">
        <span class="dhikr-type">${escapeHtml(previewDua.category)}</span>
        <h3>${previewDua.title}</h3>
        <p class="quran-font">${previewDua.text}</p>
        <a href="${previewDua.url}" target="_blank" rel="noopener">${previewDua.source} ↗</a>
      </div>
      ${featuredHadith ? `
        <div class="library-preview-item">
        <span class="dhikr-type">حديث من صحيح البخاري</span>
        <h3>من كمال الإيمان</h3>
        <p class="quran-font">«لَا يُؤْمِنُ أَحَدُكُمْ حَتَّى يُحِبَّ لِأَخِيهِ مَا يُحِبُّ لِنَفْسِهِ»</p>
        <a href="${escapeHtml(featuredHadith.url)}" target="_blank" rel="noopener">صحيح البخاري · ١٣ ↗</a>
        </div>
      ` : ""}
    </article>
  `;

  // تحديث عدادات الأقسام
  const hadithsCountBadge = $("#hadithsCountBadge");
  if (hadithsCountBadge && Array.isArray(hadiths)) {
    hadithsCountBadge.textContent = hadiths.length.toLocaleString("ar-EG");
  }
  const duasCountBadge = $("#duasCountBadge");
  if (duasCountBadge) {
    duasCountBadge.textContent = duas.length.toLocaleString("ar-EG");
  }

  // تصنيفات وفلترة الأدعية
  const categories = ["الكل", ...new Set(duas.map((d) => d.category))];
  let currentDuaCategory = "الكل";

  const renderDuas = () => {
    const list = currentDuaCategory === "الكل" 
      ? duas 
      : duas.filter((d) => d.category === currentDuaCategory);

    $("#duasGrid").innerHTML = list.map((dua) => {
      const originalIndex = duas.indexOf(dua);
      return `
        <article class="dua-card panel">
          <div class="hadith-card-heading">
            <span class="dhikr-type">${escapeHtml(dua.category)}</span>
            <span class="dua-index">${String(originalIndex + 1).padStart(2, "0")}</span>
          </div>
          <h3>${dua.title}</h3>
          <p class="dua-text quran-font">${dua.text}</p>
          <div class="dua-card-footer">
            <a href="${dua.url}" target="_blank" rel="noopener">${dua.source} <span aria-hidden="true">↗</span></a>
            <button class="copy-text-button" data-copy-text="${originalIndex}" aria-label="نسخ ${dua.title}">نسخ الدعاء</button>
          </div>
        </article>
      `;
    }).join("");
  };

  const chipsContainer = $("#duasCategoryChips");
  if (chipsContainer) {
    chipsContainer.innerHTML = categories.map((cat) => `
      <button class="dua-filter-chip ${cat === currentDuaCategory ? "active" : ""}" type="button" data-cat="${escapeHtml(cat)}">
        ${escapeHtml(cat)}
      </button>
    `).join("");

    chipsContainer.addEventListener("click", (e) => {
      const chip = e.target.closest(".dua-filter-chip");
      if (!chip) return;
      currentDuaCategory = chip.dataset.cat;
      chipsContainer.querySelectorAll(".dua-filter-chip").forEach((c) =>
        c.classList.toggle("active", c === chip)
      );
      renderDuas();
    });
  }

  renderDuas();

  const pageSize = 12;
  let page = 0;
  let search = "";
  let collection = "all";
  const normalizeArabic = (value) => value
    .normalize("NFKC")
    .replace(/[\u064B-\u065F\u0670\u0640]/g, "")
    .replace(/[أإآ]/g, "ا")
    .replace(/ى/g, "ي");

  if (!Array.isArray(hadiths) || hadiths.length === 0) {
    $("#hadithResults").textContent = "تعذّر تحميل مكتبة الأحاديث. تأكد من وجود ملف IslamkoHadiths.js.";
    $("#hadithPrev").disabled = true;
    $("#hadithNext").disabled = true;
    return;
  }

  // كاش النصوص المعايرة للبحث السريع الفوري في آلاف الأحاديث
  let normalizedHadithsCache = null;
  function getNormalizedCache() {
    if (!normalizedHadithsCache) {
      normalizedHadithsCache = hadiths.map((h) =>
        normalizeArabic(`${h.text} ${h.number} ${h.arabicNumber || ""}`)
      );
    }
    return normalizedHadithsCache;
  }

  const expandedLibrary = $("#libraryExpanded");
  const expandLibraryButton = $("#libraryExpand");
  const collapseLibraryButton = $("#libraryCollapse");
  const toggleLibrary = (expanded) => {
    expandedLibrary.hidden = !expanded;
    expandLibraryButton.hidden = expanded;
    expandLibraryButton.setAttribute("aria-expanded", String(expanded));
    collapseLibraryButton.hidden = !expanded;
  };
  expandLibraryButton.addEventListener("click", () => toggleLibrary(true));
  collapseLibraryButton.addEventListener("click", () => {
    toggleLibrary(false);
    $("#hadiths").scrollIntoView({ behavior: "smooth", block: "start" });
  });

  function getFilteredHadiths() {
    const normalizedSearch = normalizeArabic(search);
    if (!normalizedSearch && collection === "all") return hadiths;

    const cache = getNormalizedCache();
    const results = [];
    for (let i = 0; i < hadiths.length; i++) {
      const h = hadiths[i];
      if (collection !== "all" && h.collection !== collection) continue;
      if (normalizedSearch && !cache[i].includes(normalizedSearch)) continue;
      results.push(h);
    }
    return results;
  }

  function renderHadithPage() {
    const filtered = getFilteredHadiths();
    const pageCount = Math.ceil(filtered.length / pageSize);
    page = Math.min(page, Math.max(0, pageCount - 1));
    const visible = filtered.slice(page * pageSize, (page + 1) * pageSize);

    $("#hadithResults").textContent = `عدد النتائج: ${filtered.length.toLocaleString("ar-EG")}`;
    $("#hadithPageLabel").textContent = pageCount
      ? `صفحة ${(page + 1).toLocaleString("ar-EG")} من ${pageCount.toLocaleString("ar-EG")}`
      : "لا توجد نتائج";
    $("#hadithPrev").disabled = page === 0;
    $("#hadithNext").disabled = pageCount === 0 || page >= pageCount - 1;
    $("#hadithList").innerHTML = visible.map((hadith) => {
      const bookName = hadith.collection === "bukhari" ? "صحيح البخاري" : "صحيح مسلم";
      return `
        <article class="hadith-card panel">
          <div class="hadith-card-heading">
            <span class="dhikr-type">${bookName}</span>
            <span class="hadith-number">حديث رقم ${Number(hadith.number).toLocaleString("ar-EG")}</span>
          </div>
          <p class="hadith-text quran-font">${escapeHtml(hadith.text)}</p>
          <div class="hadith-card-footer">
            <a href="${escapeHtml(hadith.url)}" target="_blank" rel="noopener">عرض المصدر الأصلي ↗</a>
            <button class="copy-text-button" data-copy-hadith="${escapeHtml(hadith.text)}">نسخ الحديث</button>
          </div>
        </article>
      `;
    }).join("");
  }

  $("#hadithSearch").addEventListener("input", (event) => {
    search = event.target.value.trim();
    page = 0;
    renderHadithPage();
  });
  $("#hadithBook").addEventListener("change", (event) => {
    collection = event.target.value;
    page = 0;
    renderHadithPage();
  });
  $("#hadithPrev").addEventListener("click", () => {
    page--;
    renderHadithPage();
  });
  $("#hadithNext").addEventListener("click", () => {
    page++;
    renderHadithPage();
  });

  document.querySelectorAll("[data-library]").forEach((button) => {
    button.addEventListener("click", () => {
      const showHadiths = button.dataset.library === "hadiths";
      document.querySelectorAll("[data-library]").forEach((tab) => {
        const selected = tab === button;
        tab.classList.toggle("selected", selected);
        tab.setAttribute("aria-selected", String(selected));
      });
      $("#duasPanel").hidden = showHadiths;
      $("#hadithsPanel").hidden = !showHadiths;
      if (showHadiths) renderHadithPage();
    });
  });

  document.querySelector("#hadiths").addEventListener("click", async (event) => {
    const button = event.target.closest("[data-copy-text], [data-copy-hadith]");
    if (!button) return;
    const text = button.dataset.copyHadith ?? duas[Number(button.dataset.copyText)]?.text;
    if (!text) return;

    try {
      await navigator.clipboard.writeText(text);
      showToast("تم النسخ");
    } catch {
      showToast("تعذّر النسخ على هذا المتصفح");
    }
  });

  renderHadithPage();
}

// المسبحة الإلكترونية
function setupTasbeeh() {
  const DHIKR = [
    "سُبْحَانَ اللَّهِ", "الْحَمْدُ لِلَّهِ", "اللَّهُ أَكْبَرُ",
    "لَا إِلَهَ إِلَّا اللَّهُ", "أَسْتَغْفِرُ اللَّهَ",
    "اللَّهُمَّ صَلِّ عَلَى مُحَمَّدٍ"
  ];
  const GOALS = [33, 100, 1000];
  const today = new Date().toDateString();
  const st = Object.assign(
    { i: 0, goal: 33, count: 0, laps: 0, total: Number(localStorage.getItem("islamko-total") || localStorage.getItem("islamkum-total") || localStorage.getItem("quranakum-total")) || 0, day: today, today: 0, vib: true },
    load("islamko-tasbeeh", {})
  );
  if (st.day !== today) { st.day = today; st.today = 0; }

  const C = 2 * Math.PI * 100;
  const ring = $("#ringProgress");
  ring.style.strokeDasharray = C;
  const fmt = (n) => n.toLocaleString("ar-EG");

  function draw() {
    $("#dhikrPhrase").textContent = DHIKR[st.i];
    $("#counterNumber").textContent = fmt(st.count);
    $("#goalLabel").textContent = `من ${fmt(st.goal)}`;
    $("#lapCount").textContent = fmt(st.laps);
    $("#todayCount").textContent = fmt(st.today);
    $("#totalCount").textContent = fmt(st.total);
    ring.style.strokeDashoffset = C * (1 - st.count / st.goal);
    const vibBtn = $("#vibToggle");
    if (vibBtn) {
      vibBtn.textContent = st.vib ? "📳 الاهتزاز: مفعّل" : "📴 الاهتزاز: متوقف";
      vibBtn.setAttribute("aria-pressed", String(st.vib));
      vibBtn.classList.toggle("is-active", Boolean(st.vib));
      vibBtn.classList.toggle("is-disabled", !st.vib);
    }
    $("#dhikrChips").innerHTML = DHIKR.map((d, i) =>
      `<button class="chip-pro ${i === st.i ? "selected" : ""}" data-i="${i}">${d}</button>`).join("");
    $("#goalChips").innerHTML = GOALS.map((g) =>
      `<button class="chip-pro ${g === st.goal ? "selected" : ""}" data-g="${g}">${fmt(g)}</button>`).join("");
  }
  const persist = () => { save("islamko-tasbeeh", st); localStorage.setItem("islamko-total", st.total); };

  const countBtn = $("#countButton");
  const dial = document.querySelector(".tp-dial");

  const playHapticFeedback = (done) => {
    // إذا كان الاهتزاز معطلاً من قِبل المستخدم، نتوقف تمامًا ولا نصدر أي اهتزاز أو صوت
    if (!st.vib) return;

    // اهتزاز الأجهزة الداعمة
    try {
      if (navigator.vibrate) {
        navigator.vibrate(done ? [80, 50, 80] : 15);
      }
    } catch {}

    // نقرة صوتية لطيفة خفيفة جداً لجميع الهواتف وخاصة أجهزة iPhone / iOS
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        if (!window._tasbeehAudioCtx) window._tasbeehAudioCtx = new AudioCtx();
        const ctx = window._tasbeehAudioCtx;
        if (ctx.state === "suspended") ctx.resume();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(done ? 750 : 520, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(180, ctx.currentTime + 0.035);
        gain.gain.setValueAtTime(0.06, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.035);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.035);
      }
    } catch {}
  };

  let lastTapTime = 0;
  let lastTapType = "";
  const doCount = (e) => {
    const now = Date.now();
    // إذا جاء حدث click ناتج عن نفس الضغطة بعد pointerdown، نتجاهله فوراً لمنع الزيادة المزدوجة
    if (e && e.type === "click" && lastTapType === "pointerdown" && (now - lastTapTime) < 500) {
      return;
    }
    // منع التكرار السريع جداً (Debounce 80ms)
    if (now - lastTapTime < 80) return;

    lastTapTime = now;
    if (e && e.type) lastTapType = e.type;

    st.count++; st.total++; st.today++;
    let done = false;
    if (st.count >= st.goal) { st.count = 0; st.laps++; done = true; }

    playHapticFeedback(done);

    if (done) showToast("تقبّل الله ذكرك");
    persist();
    draw();

    // حركة النبض التكتيكية عند اللمس
    if (countBtn) {
      countBtn.classList.remove("tapped");
      void countBtn.offsetWidth;
      countBtn.classList.add("tapped");
    }
  };

  if (countBtn) {
    countBtn.addEventListener("pointerdown", (e) => {
      if (e.isPrimary) doCount(e);
    }, { passive: true });
    countBtn.addEventListener("click", doCount);
  }

  if (dial) {
    dial.addEventListener("pointerdown", (e) => {
      if (e.target !== countBtn && !countBtn?.contains(e.target)) {
        if (e.isPrimary) doCount(e);
      }
    }, { passive: true });
  }
  $("#dhikrChips").addEventListener("click", (e) => {
    const b = e.target.closest("[data-i]"); if (!b) return;
    st.i = Number(b.dataset.i); st.count = 0; persist(); draw();
  });
  $("#goalChips").addEventListener("click", (e) => {
    const b = e.target.closest("[data-g]"); if (!b) return;
    st.goal = Number(b.dataset.g); st.count = 0; persist(); draw();
  });
  $("#vibToggle").addEventListener("click", () => {
    st.vib = !st.vib;
    persist();
    draw();
    if (typeof showToast === "function") {
      showToast(st.vib ? "تم تفعيل الاهتزاز والنقرات 📳" : "تم إيقاف الاهتزاز تمامًا 📴");
    }
  });
  $("#resetTasbeeh").addEventListener("click", () => {
    st.count = 0; st.laps = 0; persist(); draw(); showToast("تمت إعادة العداد");
  });
  draw();
}

// الوضع الليلي والنهاري
function setupTheme() {
  const savedTheme = localStorage.getItem("islamko-theme") || localStorage.getItem("islamkum-theme") || localStorage.getItem("quranakum-theme");

  if (savedTheme === "light") {
    document.body.classList.add("light-mode");
  }

  updateThemeButton();

  $("#themeToggle").addEventListener("click", () => {
    document.body.classList.toggle("light-mode");

    const isLight = document.body.classList.contains("light-mode");

    localStorage.setItem(
      "islamko-theme",
      isLight ? "light" : "dark"
    );

    updateThemeButton();
  });
}

function updateThemeButton() {
  const isLight = document.body.classList.contains("light-mode");

  $("#themeToggle").textContent = isLight ? "☾" : "☼";
}

// إدارة الشاشات ونظام التنقل كتطبيق هاتف ذكي (Single Page App Screen Router)
const SCREENS = ["home", "quran", "reciters", "adhkar", "hadiths", "tasbeeh", "prayer"];

const SCREEN_TITLES = {
  home: "الرئيسية",
  quran: "القرآن الكريم",
  reciters: "مكتبة القراء",
  adhkar: "ورد الأذكار",
  hadiths: "أدعية وأحاديث",
  tasbeeh: "المسبحة الإلكترونية",
  prayer: "مواقيت الصلاة"
};

function switchScreen(targetId, updateHash = true) {
  const cleanId = String(targetId || "home").replace(/^#/, "").trim();
  const screenId = SCREENS.includes(cleanId) ? cleanId : "home";

  // إخفاء كل الشاشات وإظهار الشاشة المطلوبة
  document.querySelectorAll(".app-screen").forEach((screen) => {
    const isTarget = screen.id === screenId;
    screen.classList.toggle("active", isTarget);
    screen.hidden = !isTarget;
  });

  // تحديث أزرار شريط التنقل السفلي
  document.querySelectorAll(".bottom-nav-item").forEach((btn) => {
    const isTarget = btn.dataset.target === screenId;
    btn.classList.toggle("active", isTarget);
    btn.setAttribute("aria-selected", String(isTarget));
  });

  // تحديث روابط القائمة العلوية
  document.querySelectorAll(".nav-link").forEach((link) => {
    const href = link.getAttribute("href")?.replace(/^#/, "");
    link.classList.toggle("active", href === screenId);
  });

  // تحديث شارة العنوان في الهيدر
  const headerBadge = document.querySelector("#activeScreenBadge");
  if (headerBadge) {
    headerBadge.textContent = SCREEN_TITLES[screenId] || "إسلامكو";
  }

  // التمرير إلى أعلى الشاشة بسلاسة
  window.scrollTo({ top: 0, behavior: "instant" });

  if (updateHash && location.hash !== `#${screenId}`) {
    history.pushState(null, "", `#${screenId}`);
  }
}

function setupNavigation() {
  // أزرار شريط التنقل السفلي
  document.querySelectorAll(".bottom-nav-item").forEach((btn) => {
    btn.addEventListener("click", () => {
      const target = btn.dataset.target;
      if (target) switchScreen(target, true);
    });
  });

  // التقاط النقر على جميع الروابط الداخلية للأقسام في أي مكان
  document.addEventListener("click", (e) => {
    const link = e.target.closest('a[href^="#"]');
    if (!link) return;
    const hash = link.getAttribute("href")?.replace(/^#/, "").trim();
    if (SCREENS.includes(hash)) {
      e.preventDefault();
      switchScreen(hash, true);
    }
  });

  // التبديل عند استخدام أزرار الرجوع/التقدم في المتصفح
  window.addEventListener("hashchange", () => {
    const hash = location.hash.replace(/^#/, "").trim();
    if (SCREENS.includes(hash)) {
      switchScreen(hash, false);
    }
  });

  // قراءة الشاشة المبدئية من الرابط
  const initialHash = location.hash.replace(/^#/, "").trim();
  switchScreen(initialHash || "home", false);
}

// نسخ آية اليوم
$("#copyVerse").addEventListener("click", async () => {
  const verse =
    "﴿ وَهُوَ مَعَكُمْ أَيْنَ مَا كُنْتُمْ ۚ " +
    "وَاللَّهُ بِمَا تَعْمَلُونَ بَصِيرٌ ﴾ " +
    "— سورة الحديد، الآية ٤";

  try {
    await navigator.clipboard.writeText(verse);
    showToast("تم نسخ الآية");
  } catch {
    showToast("تعذّر النسخ، جرّب تشغيل الموقع عبر Live Server");
  }
});

// مواقيت الصلاة (القاهرة افتراضيًا أو حسب موقعك الفعلي)
const PRAYERS = [
  ["الفجر", "Fajr"], ["الشروق", "Sunrise"], ["الظهر", "Dhuhr"],
  ["العصر", "Asr"], ["المغرب", "Maghrib"], ["العشاء", "Isha"]
];
const CAIRO = { latitude: 30.0444, longitude: 31.2357 };
let todayTimings = null;
let todayTz = undefined;

// اتجاه القبلة: زاوية من الشمال الحقيقي نحو الكعبة
function qiblaBearing({ latitude, longitude }) {
  const r = Math.PI / 180;
  const p1 = latitude * r, p2 = 21.4225 * r, dl = (39.8262 - longitude) * r;
  const y = Math.sin(dl) * Math.cos(p2);
  const x = Math.cos(p1) * Math.sin(p2) - Math.sin(p1) * Math.cos(p2) * Math.cos(dl);
  return (Math.atan2(y, x) / r + 360) % 360;
}

function showQibla(c) {
  const b = qiblaBearing(c);
  const arrow = $("#qiblaArrow");
  if (arrow) arrow.style.transform = `rotate(${b}deg)`;
  const txt = $("#qiblaText");
  if (txt) {
    txt.textContent = `${Math.round(b).toLocaleString("ar-EG")}° من الشمال`;
  }
}

// اسم المدينة من الإحداثيات
async function placeName(c) {
  try {
    const r = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=jsonv2&zoom=10&accept-language=ar&lat=${c.latitude}&lon=${c.longitude}`);
    const a = (await r.json()).address || {};
    return [a.city || a.town || a.village || a.county || a.state, a.country]
      .filter(Boolean).join("، ") || "موقعك الحالي";
  } catch {
    return "موقعك الحالي";
  }
}

function updateNextPrayer() {
  if (!todayTimings) return;
  const [hh, mm] = new Intl.DateTimeFormat("en-GB", {
    hour: "2-digit", minute: "2-digit", hour12: false, timeZone: todayTz
  }).format(new Date()).split(":").map(Number);
  const mins = (hh % 24) * 60 + mm;

  const list = PRAYERS.filter(([, k]) => k !== "Sunrise").map(([ar, k]) => {
    const [h, m] = todayTimings[k].split(" ")[0].split(":").map(Number);
    return { ar, k, t: h * 60 + m };
  });
  const next = list.find((p) => p.t > mins) || { ...list[0], t: list[0].t + 1440 };
  const diff = next.t - mins;
  $("#prayerStatus").textContent =
    `الصلاة القادمة: ${next.ar} بعد ${Math.floor(diff / 60).toLocaleString("ar-EG")} س و ${(diff % 60).toLocaleString("ar-EG")} د`;
  document.querySelectorAll(".prayer-time").forEach((el) =>
    el.classList.toggle("next", el.dataset.k === next.k));

  const notifObj = window.IslamkoNotifications || window.IslamkumNotifications;
  if (notifObj && todayTimings) {
    notifObj.tick(todayTimings, $("#locationName")?.textContent);
  }
}

async function loadPrayerTimes(coords, name) {
  const status = $("#prayerStatus");
  const c = coords || CAIRO;
  const now = new Date();
  status.textContent = "جارٍ تحميل مواقيت الصلاة...";

  try {
    const date = `${now.getDate()}-${now.getMonth() + 1}-${now.getFullYear()}`;
    // بدون تحديد method: الخدمة تختار طريقة الحساب المناسبة لبلدك تلقائيًا
    const url = `https://api.aladhan.com/v1/timings/${date}?latitude=${c.latitude}&longitude=${c.longitude}` +
      (coords ? "" : "&method=5");
    const response = await fetch(url);
    if (!response.ok) throw new Error("fail");
    const result = await response.json();
    if (result.code !== 200) throw new Error("fail");

    todayTimings = result.data.timings;
    window.todayTimings = todayTimings;
    todayTz = result.data.meta.timezone;

    const hj = result.data.date.hijri;
    $("#todayDate").textContent =
      new Intl.DateTimeFormat("ar-EG", { dateStyle: "full", timeZone: todayTz }).format(now) +
      ` · ${Number(hj.day).toLocaleString("ar-EG")} ${hj.month.ar} ${Number(hj.year).toLocaleString("ar-EG")} هـ`;

    $("#prayerTimes").innerHTML = PRAYERS.map(([ar, k]) => `
      <div class="prayer-time" data-k="${k}">
        <span>${ar}</span>
        <strong>${todayTimings[k].split(" ")[0]}</strong>
      </div>`).join("");

    $("#locationName").textContent = name || "القاهرة، مصر";
    showQibla(c);
    updateNextPrayer();
  } catch {
    status.textContent = "تعذّر تحميل المواقيت. تأكد من الإنترنت واضغط تحديث.";
  }
}

const savedPlace = load("islamko-place", null);
$("#refreshPrayer").addEventListener("click", () =>
  loadPrayerTimes(savedPlace?.coords, savedPlace?.name));

$("#useLocation").addEventListener("click", () => {
  const btn = $("#useLocation");
  if (!navigator.geolocation) return showToast("المتصفح لا يدعم تحديد الموقع");
  if (!window.isSecureContext)
    return showToast("تحديد الموقع يعمل فقط على موقع https أو localhost");

  btn.disabled = true;
  btn.textContent = "جارٍ تحديد موقعك...";
  navigator.geolocation.getCurrentPosition(
    async ({ coords }) => {
      const c = { latitude: coords.latitude, longitude: coords.longitude };
      const name = await placeName(c);
      save("islamko-place", { coords: c, name });
      await loadPrayerTimes(c, name);
      btn.disabled = false;
      btn.textContent = "موقعي ⌖";
      showToast(`تم تحديد موقعك: ${name}`);
    },
    (err) => {
      btn.disabled = false;
      btn.textContent = "موقعي ⌖";
      showToast(
        err.code === 1 ? "الإذن مرفوض: اسمح بالموقع من إعدادات المتصفح" :
        err.code === 3 ? "انتهت مهلة تحديد الموقع، جرّب مرة أخرى" :
        "تعذّر تحديد موقعك، تأكد من تشغيل GPS");
    },
    { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
  );
});
setInterval(updateNextPrayer, 30000);

// تشغيل أجزاء الموقع
QuranAudio.init({ names: NAMES, getSurah: () => selectedSurah, goTo: (n) => selectSurah(n) });
renderSurahs();
selectSurah(selectedSurah);
renderAdhkar();
setupDuaLibrary();
setupTasbeeh();
setupTheme();
setupNavigation();
loadPrayerTimes(savedPlace?.coords, savedPlace?.name);

// تشغيل نظام التنبيهات والإشعارات الإسلامية
const notifSystem = window.IslamkoNotifications || window.IslamkumNotifications;
if (notifSystem) {
  notifSystem.init();
}

// تشغيل الموقع كتطبيق يعمل بدون إنترنت (يتطلب https أو localhost)
if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("sw.js").catch(() => {});
}
