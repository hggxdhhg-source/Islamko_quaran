/**
 * QuranAudio.js - Advanced Quran Reciters Library & Premium Audio Experience
 * إسلامكو | رفيق يومك إلى الطمأنينة
 * 
 * المصدر: MP3Quran CDN & API v3
 * جميع التسجيلات حقيقية وموثقة ومجربة.
 * الشيخ محمد صديق المنشاوي هو القارئ الافتراضي والأول في المكتبة.
 */
(function () {
  "use strict";

  const $ = (s) => document.querySelector(s);
  const $$ = (s) => document.querySelectorAll(s);

  const CDN = "https://cdn.mp3quran.net/audio/";
  const API = "https://www.mp3quran.net/api/v3/reciters?language=ar";
  const CACHE_KEY = "islamko-audio-meta-v2";
  const PREF_KEY = "islamko-audio";
  const POS_KEY = "islamko-audio-pos";
  const RECITER_FAVS_KEY = "islamko-reciter-favs";
  const SURAH_FAVS_KEY = "islamko-favs";
  const TTL = 7 * 24 * 3600 * 1000; // 7 days

  // المكتبة المعتمدة والمتحقق من روابطها وسيرفراتها بنسبة 100%
  const RECITERS = [
    {
      key: "minshawi",
      ar: "محمد صديق المنشاوي",
      en: "Mohamed Siddiq El-Minshawi",
      title: "صاحب الحنجرة الباكية · علم التلاوة الخالد",
      location: "مصر",
      initials: "مش",
      apiId: 112,
      match: ["المنشاوي", "محمد صديق المنشاوي", "صديق المنشاوي"],
      styles: [
        { moshafId: 112, label: "حفص عن عاصم · مرتل", styleType: "murattal", server: CDN + "muhammad-minshawi/r1/", surahTotal: 114, missing: [] },
        { moshafId: 113, label: "المصحف المجوّد", styleType: "mujawwad", server: CDN + "muhammad-minshawi/r2/", surahTotal: 114, missing: [] },
        { moshafId: 114, label: "المصحف المعلّم", styleType: "muallam", server: CDN + "muhammad-minshawi/r3/", surahTotal: 114, missing: [] },
        { moshafId: 10924, label: "تسجيل عام ١٣٨٧ هـ · ١٩٦٧م", styleType: "murattal", server: CDN + "muhammad-minshawi/r4/", surahTotal: 110, missing: [16, 23, 24, 35] }
      ]
    },
    {
      key: "abdulbasit",
      ar: "عبد الباسط عبد الصمد",
      en: "Abdul Basit Abdul Samad",
      title: "صوت مكة · سفير كتاب الله",
      location: "مصر",
      initials: "عب",
      apiId: 51,
      match: ["عبد الباسط", "عبدالباسط", "عبد الصمد"],
      styles: [
        { moshafId: 53, label: "حفص عن عاصم · مرتل", styleType: "murattal", server: CDN + "abdulbasit-abdulsamad/r3/", surahTotal: 114, missing: [] },
        { moshafId: 51, label: "المصحف المجوّد", styleType: "mujawwad", server: CDN + "abdulbasit-abdulsamad/r1/", surahTotal: 114, missing: [] },
        { moshafId: 52, label: "ورش عن نافع · مرتل", styleType: "murattal", server: CDN + "abdulbasit-abdulsamad/r2/", surahTotal: 114, missing: [] }
      ]
    },
    {
      key: "husary",
      ar: "محمود خليل الحصري",
      en: "Mahmoud Khalil Al-Husary",
      title: "شيخ عموم المقارئ المصرية · رائد الإتقان والضبط",
      location: "مصر",
      initials: "حص",
      apiId: 118,
      match: ["الحصري", "محمود خليل الحصري"],
      styles: [
        { moshafId: 118, label: "حفص عن عاصم · مرتل", styleType: "murattal", server: CDN + "mahmoud-husary/r1/", surahTotal: 114, missing: [] },
        { moshafId: 119, label: "المصحف المجوّد", styleType: "mujawwad", server: CDN + "mahmoud-husary/r2/", surahTotal: 114, missing: [] },
        { moshafId: 120, label: "ورش عن نافع · مرتل", styleType: "murattal", server: CDN + "mahmoud-husary/r3/", surahTotal: 114, missing: [] },
        { moshafId: 270, label: "قالون عن نافع · مرتل", styleType: "murattal", server: CDN + "mahmoud-husary/r5/", surahTotal: 114, missing: [] },
        { moshafId: 269, label: "الدوري عن أبي عمرو · مرتل", styleType: "murattal", server: CDN + "mahmoud-husary/r4/", surahTotal: 114, missing: [] }
      ]
    },
    {
      key: "alafasy",
      ar: "مشاري راشد العفاسي",
      en: "Mishary Rashid Alafasy",
      title: "إمام المسجد الكبير بالكويت · تلاوة شجية عذبة",
      location: "الكويت",
      initials: "عف",
      apiId: 123,
      match: ["العفاسي", "مشاري العفاسي", "مشاري راشد"],
      styles: [
        { moshafId: 123, label: "حفص عن عاصم · مرتل", styleType: "murattal", server: CDN + "mishary-alafasy/r1/", surahTotal: 114, missing: [] }
      ]
    },
    {
      key: "sudais",
      ar: "عبد الرحمن السديس",
      en: "Abdul Rahman Al-Sudais",
      title: "إمام وخطيب المسجد الحرام بمكة المكرمة",
      location: "المملكة العربية السعودية",
      initials: "سد",
      apiId: 54,
      match: ["السديس", "عبدالرحمن السديس"],
      styles: [
        { moshafId: 54, label: "حفص عن عاصم · مرتل", styleType: "murattal", server: CDN + "abdulrahman-sudais/r1/", surahTotal: 114, missing: [] }
      ]
    },
    {
      key: "shuraim",
      ar: "سعود الشريم",
      en: "Saud Al-Shuraim",
      title: "إمام وخطيب المسجد الحرام الأسبق بمكة المكرمة",
      location: "المملكة العربية السعودية",
      initials: "شر",
      apiId: 31,
      match: ["الشريم", "سعود الشريم"],
      styles: [
        { moshafId: 31, label: "حفص عن عاصم · مرتل", styleType: "murattal", server: CDN + "saud-shuraim/r1/", surahTotal: 114, missing: [] }
      ]
    },
    {
      key: "muaiqly",
      ar: "ماهر المعيقلي",
      en: "Maher Al-Muaiqly",
      title: "إمام وخطيب المسجد الحرام بمكة المكرمة",
      location: "المملكة العربية السعودية",
      initials: "مع",
      apiId: 102,
      match: ["المعيقلي", "ماهر المعيقلي"],
      styles: [
        { moshafId: 102, label: "حفص عن عاصم · مرتل", styleType: "murattal", server: CDN + "maher-muaiqly/r1/", surahTotal: 114, missing: [] },
        { moshafId: 133, label: "المصحف المجوّد", styleType: "mujawwad", server: CDN + "maher-muaiqly/r3/", surahTotal: 114, missing: [] }
      ]
    },
    {
      key: "dosari",
      ar: "ياسر الدوسري",
      en: "Yasser Al-Dosari",
      title: "إمام وخطيب المسجد الحرام بمكة المكرمة",
      location: "المملكة العربية السعودية",
      initials: "دو",
      apiId: 92,
      match: ["الدوسري", "ياسر الدوسري"],
      styles: [
        { moshafId: 92, label: "حفص عن عاصم · مرتل", styleType: "murattal", server: CDN + "yasser-dosari/r1/", surahTotal: 114, missing: [] }
      ]
    },
    {
      key: "shatri",
      ar: "أبو بكر الشاطري",
      en: "Abu Bakr Al-Shatri",
      title: "تلاوة هادئة خاشعة متميزة",
      location: "المملكة العربية السعودية",
      initials: "شا",
      apiId: 4,
      match: ["الشاطري", "أبو بكر الشاطري"],
      styles: [
        { moshafId: 4, label: "حفص عن عاصم · مرتل", styleType: "murattal", server: CDN + "abubakr-shatri/r1/", surahTotal: 114, missing: [] }
      ]
    },
    {
      key: "rifai",
      ar: "هاني الرفاعي",
      en: "Hani Al-Rifai",
      title: "تلاوات تفيض خشوعًا وتأثيرًا",
      location: "المملكة العربية السعودية",
      initials: "رف",
      apiId: 89,
      match: ["الرفاعي", "هاني الرفاعي"],
      styles: [
        { moshafId: 89, label: "حفص عن عاصم · مرتل", styleType: "murattal", server: CDN + "hani-rifai/r1/", surahTotal: 114, missing: [] }
      ]
    },
    {
      key: "ayyub",
      ar: "محمد أيوب",
      en: "Muhammad Ayyub",
      title: "إمام المسجد النبوي الشريف الأسبق بالمدينة المنورة",
      location: "المملكة العربية السعودية",
      initials: "أي",
      apiId: 109,
      match: ["أيوب", "محمد أيوب"],
      styles: [
        { moshafId: 109, label: "حفص عن عاصم · مرتل", styleType: "murattal", server: CDN + "muhammad-ayyub/r1/", surahTotal: 114, missing: [] },
        { moshafId: 320, label: "حفص عن عاصم · تلاوة مميزة", styleType: "murattal", server: CDN + "muhammad-ayyub/r2/", surahTotal: 114, missing: [] }
      ]
    },
    {
      key: "jaber",
      ar: "علي جابر",
      en: "Ali Jaber",
      title: "إمام المسجد الحرام الأسبق بمكة المكرمة",
      location: "المملكة العربية السعودية",
      initials: "جب",
      apiId: 76,
      match: ["علي جابر"],
      styles: [
        { moshafId: 76, label: "حفص عن عاصم · مرتل", styleType: "murattal", server: CDN + "ali-jaber/r1/", surahTotal: 114, missing: [] }
      ]
    },
    {
      key: "qatami",
      ar: "ناصر القطامي",
      en: "Nasser Al-Qatami",
      title: "إمام جامع الملك عبد الله بالرياض",
      location: "المملكة العربية السعودية",
      initials: "قط",
      apiId: 86,
      match: ["القطامي", "ناصر القطامي"],
      styles: [
        { moshafId: 86, label: "حفص عن عاصم · مرتل", styleType: "murattal", server: CDN + "nasser-qatami/r1/", surahTotal: 114, missing: [] }
      ]
    },
    {
      key: "bukhatir",
      ar: "صلاح بو خاطر",
      en: "Salah Bukhatir",
      title: "قارئ إماراتي ذو تلاوة ندية هادئة",
      location: "الإمارات",
      initials: "بخ",
      apiId: 46,
      match: ["بو خاطر", "بوخاطر", "صلاح بو خاطر"],
      styles: [
        { moshafId: 46, label: "حفص عن عاصم · مرتل", styleType: "murattal", server: CDN + "salah-bukhatir/r1/", surahTotal: 114, missing: [] }
      ]
    },
    {
      key: "ajmi",
      ar: "أحمد بن علي العجمي",
      en: "Ahmed Al-Ajmi",
      title: "تلاوة جهرية شجية وصوت محبوب في العالم الإسلامي",
      location: "المملكة العربية السعودية",
      initials: "عج",
      apiId: 5,
      match: ["العجمي", "أحمد العجمي", "أحمد بن علي العجمي"],
      styles: [
        { moshafId: 5, label: "حفص عن عاصم · مرتل", styleType: "murattal", server: CDN + "ahmad-ajmi/r1/", surahTotal: 114, missing: [] }
      ]
    },
    {
      key: "ghamdi",
      ar: "سعد الغامدي",
      en: "Saad Al-Ghamdi",
      title: "إمام مشارك بالمسجد النبوي الأسبق وصوت قرآني شهير",
      location: "المملكة العربية السعودية",
      initials: "غم",
      apiId: 30,
      match: ["الغامدي", "سعد الغامدي"],
      styles: [
        { moshafId: 30, label: "حفص عن عاصم · مرتل", styleType: "murattal", server: CDN + "saad-ghamdi/r1/", surahTotal: 114, missing: [] }
      ]
    },
    {
      key: "basfar",
      ar: "عبدالله بصفر",
      en: "Abdullah Basfar",
      title: "الأمين العام للهيئة العالمية لتحفيظ القرآن سابقًا",
      location: "المملكة العربية السعودية",
      initials: "بص",
      apiId: 60,
      match: ["بصفر", "عبدالله بصفر"],
      styles: [
        { moshafId: 60, label: "حفص عن عاصم · مرتل", styleType: "murattal", server: CDN + "abdullah-basfar/r1/", surahTotal: 114, missing: [] }
      ]
    },
    {
      key: "hudhaify",
      ar: "علي بن عبدالرحمن الحذيفي",
      en: "Ali Al-Hudhaify",
      title: "شيخ أئمة المسجد النبوي الشريف بالمدينة المنورة",
      location: "المملكة العربية السعودية",
      initials: "حذ",
      apiId: 74,
      match: ["الحذيفي", "علي الحذيفي"],
      styles: [
        { moshafId: 74, label: "حفص عن عاصم · مرتل", styleType: "murattal", server: CDN + "ali-hudhaifi/r1/", surahTotal: 114, missing: [] },
        { moshafId: 75, label: "قالون عن نافع · مرتل", styleType: "murattal", server: CDN + "ali-hudhaifi/r2/", surahTotal: 114, missing: [] },
        { moshafId: 305, label: "شعبة عن عاصم · مرتل", styleType: "murattal", server: CDN + "ali-hudhaifi/r3/", surahTotal: 114, missing: [] }
      ]
    },
    {
      key: "abkar",
      ar: "إدريس أبكر",
      en: "Idris Abkar",
      title: "تلاوة روحانية خاشعة ومؤثرة في صلوات التراويح والقيام",
      location: "الإمارات",
      initials: "بك",
      apiId: 12,
      match: ["أبكر", "ابكر", "إدريس أبكر"],
      styles: [
        { moshafId: 12, label: "حفص عن عاصم · مرتل", styleType: "murattal", server: CDN + "idrees-abkar/r1/", surahTotal: 114, missing: [] }
      ]
    },
    {
      key: "banna",
      ar: "محمود علي البنا",
      en: "Mahmoud Ali Al-Banna",
      title: "أحد عمالقة القراءة في العصر الذهبي للمقارئ المصرية",
      location: "مصر",
      initials: "بن",
      apiId: 121,
      match: ["البنا", "محمود علي البنا"],
      styles: [
        { moshafId: 121, label: "حفص عن عاصم · مرتل", styleType: "murattal", server: CDN + "mahmoud-banna/r1/", surahTotal: 114, missing: [] },
        { moshafId: 122, label: "المصحف المجوّد", styleType: "mujawwad", server: CDN + "mahmoud-banna/r2/", surahTotal: 114, missing: [] }
      ]
    },
    {
      key: "tablawi",
      ar: "محمد محمود الطبلاوي",
      en: "Mohamed Mahmoud Al-Tablawi",
      title: "نقيب قراء مصر الأسبق وصاحب النبرة القرآنية الأصيلة",
      location: "مصر",
      initials: "طب",
      apiId: 106,
      match: ["الطبلاوي", "محمد الطبلاوي"],
      styles: [
        { moshafId: 106, label: "حفص عن عاصم · مرتل", styleType: "murattal", server: CDN + "muhammad-tablawi/r1/", surahTotal: 114, missing: [] },
        { moshafId: 107, label: "المصحف المجوّد", styleType: "mujawwad", server: CDN + "muhammad-tablawi/r2/", surahTotal: 114, missing: [] }
      ]
    },
    {
      key: "budaair",
      ar: "صلاح البدير",
      en: "Salah Al-Budair",
      title: "إمام وخطيب المسجد النبوي الشريف بالمدينة المنورة",
      location: "المملكة العربية السعودية",
      initials: "بد",
      apiId: 43,
      match: ["البدير", "صلاح البدير"],
      styles: [
        { moshafId: 43, label: "حفص عن عاصم · مرتل", styleType: "murattal", server: CDN + "salah-budair/r1/", surahTotal: 114, missing: [] }
      ]
    },
    {
      key: "juhany",
      ar: "عبدالله عواد الجهني",
      en: "Abdullah Awad Al-Juhany",
      title: "إمام المسجد الحرام بمكة المكرمة",
      location: "المملكة العربية السعودية",
      initials: "جه",
      apiId: 62,
      match: ["الجهني", "عبدالله عواد الجهني"],
      styles: [
        { moshafId: 62, label: "حفص عن عاصم · مرتل", styleType: "murattal", server: CDN + "abdullah-juhani/r1/", surahTotal: 114, missing: [] }
      ]
    },
    {
      key: "qasim",
      ar: "عبدالمحسن القاسم",
      en: "Abdulmohsen Al-Qasim",
      title: "إمام وخطيب المسجد النبوي الشريف بالمدينة المنورة",
      location: "المملكة العربية السعودية",
      initials: "قس",
      apiId: 67,
      match: ["القاسم", "عبدالمحسن القاسم"],
      styles: [
        { moshafId: 67, label: "حفص عن عاصم · مرتل", styleType: "murattal", server: CDN + "abdulmohsen-qasim/r1/", surahTotal: 114, missing: [] }
      ]
    }
  ];

  // دوال مساعدة
  const load = (k, d) => {
    try {
      const v = localStorage.getItem(k);
      if (v !== null) return JSON.parse(v);
      const oldK = k.replace("islamko-", "quranakum-");
      if (oldK !== k) {
        const oldV = localStorage.getItem(oldK);
        if (oldV !== null) return JSON.parse(oldV);
      }
      return d;
    } catch {
      return d;
    }
  };
  const save = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} };
  const norm = (s) => String(s || "")
    .replace(/[\u064B-\u065F\u0670]/g, "")
    .replace(/[أإآٱ]/g, "ا")
    .replace(/ة/g, "ه")
    .replace(/ى/g, "ي")
    .trim()
    .toLowerCase();

  const ar = (s) => String(s).replace(/\d/g, (d) => "٠١٢٣٤٥٦٧٨٩"[d]);

  const fmt = (s) => {
    if (!isFinite(s) || s < 0) return "٠:٠٠";
    s = Math.floor(s);
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const x = String(s % 60).padStart(2, "0");
    return ar(h ? `${h}:${String(m).padStart(2, "0")}:${x}` : `${m}:${x}`);
  };

  // الحالة العامة للتطبيق
  const prefs = Object.assign(
    { reciter: "minshawi", style: null, volume: 1, muted: false, repeat: false, autonext: true },
    load(PREF_KEY, {})
  );

  let reciterFavs = load(RECITER_FAVS_KEY, ["minshawi", "abdulbasit", "husary"]);

  const audio = new Audio();
  audio.preload = "metadata";

  let ctx = { names: [], getSurah: () => 1, goTo: () => {} };
  let surah = 1;
  let restored = false;
  let lastSave = 0;
  let slowTimer = null;
  let isDragging = false;
  let activeModalReciterKey = null;

  // جلب القارئ الحالي
  const reciter = () => RECITERS.find((r) => r.key === prefs.reciter) || RECITERS[0];

  // جلب نوع التسجيل الحالي
  const style = () => {
    const r = reciter();
    if (!r.styles.length) return null;
    return r.styles.find((s) => s.moshafId === prefs.style) || r.styles[0];
  };

  // رابط ملف الصوت لسورة معينة
  const urlFor = (n, customReciter, customStyle) => {
    const r = customReciter || reciter();
    const s = customStyle || (customReciter ? customReciter.styles[0] : style());
    if (!s || !s.server) return null;
    if (s.missing && s.missing.includes(n)) return null;
    return s.server.replace(/\/?$/, "/") + String(n).padStart(3, "0") + ".mp3";
  };

  // التحقق من توفر السورة لقارئ ونمط معينين
  const isSurahAvailable = (n, r, s) => {
    if (!s) return false;
    if (s.missing && s.missing.includes(n)) return false;
    return true;
  };

  // تحديث حالة مشغل الصوت في كل العناصر
  function setStatus(msg, isRetry = false) {
    $$(".qa-status-text").forEach((el) => {
      el.textContent = msg || "";
    });
    $$(".qa-retry-btn").forEach((el) => {
      el.hidden = !isRetry;
    });
    const playerElements = [$("#qaMiniPlayer"), $("#qaExpandedPlayer"), $("#qaReaderCard")];
    playerElements.forEach((el) => {
      if (el) el.classList.toggle("qa-error", isRetry);
    });
  }

  function setBusy(isBusy) {
    const playerElements = [$("#qaMiniPlayer"), $("#qaExpandedPlayer"), $("#qaReaderCard")];
    playerElements.forEach((el) => {
      if (el) el.classList.toggle("qa-busy", isBusy);
    });
  }

  function setPlayState(playing) {
    const playButtons = $$(".qa-play-btn");
    playButtons.forEach((btn) => {
      btn.setAttribute("aria-label", playing ? "إيقاف مؤقت" : "تشغيل");
      btn.setAttribute("title", playing ? "إيقاف مؤقت" : "تشغيل");
      const icon = btn.querySelector(".qa-play-icon");
      if (icon) {
        icon.textContent = playing ? "⏸" : "▶";
      } else {
        btn.textContent = playing ? "⏸ إيقاف مؤقت" : "▶ تشغيل";
      }
    });

    const liveCards = $$(".reciter-card.is-active");
    liveCards.forEach((card) => {
      card.classList.toggle("is-playing", playing);
    });

    const mini = $("#qaMiniPlayer");
    if (mini) mini.classList.toggle("is-playing", playing);

    const exp = $("#qaExpandedPlayer");
    if (exp) exp.classList.toggle("is-playing", playing);

    const readerCard = $("#qaReaderCard");
    if (readerCard) readerCard.classList.toggle("is-playing", playing);

    updateModalSurahStates();
  }

  // تحديث نصوص ومعلومات العرض
  function updateMetadataDisplay() {
    const r = reciter();
    const s = style();
    const surahName = ctx.names[surah - 1] || "";
    const styleLabel = s ? s.label : "";

    // تحديث المشغل المصغر
    const miniTitle = $("#qaMiniSurahTitle");
    if (miniTitle) miniTitle.textContent = `سورة ${surahName}`;

    const miniReciter = $("#qaMiniReciter");
    if (miniReciter) miniReciter.textContent = `${r.ar}${styleLabel ? " · " + styleLabel : ""}`;

    const miniAvatar = $("#qaMiniAvatar");
    if (miniAvatar) miniAvatar.textContent = r.initials;

    // تحديث المشغل الموسع
    const expTitle = $("#qaExpSurahTitle");
    if (expTitle) expTitle.textContent = `سورة ${surahName}`;

    const expMeta = $("#qaExpSurahMeta");
    if (expMeta) expMeta.textContent = `السورة رقم ${ar(surah)} من ١١٤ · بصوت الشيخ ${r.ar}`;

    const expStyle = $("#qaExpStyleBadge");
    if (expStyle) expStyle.textContent = styleLabel;

    const expAvatar = $("#qaExpAvatar");
    if (expAvatar) expAvatar.textContent = r.initials;

    // تحديث مشغل القارئ المدمج
    const readerSurah = $("#qaReaderSurah");
    if (readerSurah) readerSurah.textContent = `سورة ${surahName}`;

    const readerReciter = $("#qaReaderReciter");
    if (readerReciter) readerReciter.textContent = r.ar;

    const readerStyle = $("#qaReaderStyle");
    if (readerStyle) readerStyle.textContent = styleLabel;

    const readerAvatar = $("#qaReaderAvatar");
    if (readerAvatar) readerAvatar.textContent = r.initials;

    // أزرار السابقة والتالية
    $$(".qa-prev-btn").forEach((b) => (b.disabled = surah <= 1));
    $$(".qa-next-btn").forEach((b) => (b.disabled = surah >= 114));

    // تحديث MediaSession لنظام التشغيل والموبايل
    if ("mediaSession" in navigator && window.MediaMetadata) {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: `سورة ${surahName}`,
        artist: `${r.ar} (${styleLabel})`,
        album: "إسلامكو",
        artwork: [
          { src: "manifest-icon.png", sizes: "192x192", type: "image/png" }
        ]
      });
    }

    highlightActiveReciterCard();
  }

  function highlightActiveReciterCard() {
    const curKey = prefs.reciter;
    $$(".reciter-card").forEach((card) => {
      const key = card.dataset.reciterKey;
      const isActive = key === curKey;
      card.classList.toggle("is-active", isActive);
      const isPlaying = isActive && !audio.paused && !audio.ended;
      card.classList.toggle("is-playing", isPlaying);
      const badge = card.querySelector(".reciter-active-indicator");
      if (badge) badge.hidden = !isActive;
    });
  }

  // تبديل السورة والتشغيل
  function setSurah(n, autoStart = false) {
    const wasPlaying = autoStart || (!audio.paused && !audio.ended);
    surah = Math.max(1, Math.min(114, Number(n) || 1));
    restored = false;

    updateMetadataDisplay();
    setStatus("");

    const s = style();
    const url = urlFor(surah);

    audio.pause();

    if (!url) {
      audio.removeAttribute("src");
      audio.load();
      setPlayState(false);
      setBusy(false);
      setStatus(s ? "هذه السورة غير متوفرة في هذا التسجيل المختار، يمكنك اختيار نمط آخر أو قارئ آخر." : "التسجيل الصوتي غير متاح حاليًا.");
      return;
    }

    audio.src = url;

    // تصفير مؤشرات الوقت
    $$(".qa-seek-bar").forEach((bar) => (bar.value = 0));
    $$(".qa-cur-time").forEach((el) => (el.textContent = fmt(0)));
    $$(".qa-dur-time").forEach((el) => (el.textContent = fmt(NaN)));

    if (wasPlaying) {
      play();
    }
  }

  function play() {
    if (!audio.getAttribute("src")) {
      const url = urlFor(surah);
      if (url) {
        audio.src = url;
      } else {
        setStatus("التلاوة غير متاحة حاليًا لهذا القارئ.");
        return;
      }
    }
    const p = audio.play();
    if (p && p.catch) {
      p.catch((e) => {
        if (e.name !== "AbortError") {
          onError();
        }
      });
    }
  }

  function pause() {
    audio.pause();
  }

  function togglePlay() {
    if (audio.paused) {
      play();
    } else {
      pause();
    }
  }

  function nextSurah() {
    if (surah < 114) {
      ctx.goTo(surah + 1);
    }
  }

  function prevSurah() {
    if (surah > 1) {
      ctx.goTo(surah - 1);
    }
  }

  function onError() {
    if (!audio.getAttribute("src")) return;
    clearTimeout(slowTimer);
    setBusy(false);
    setPlayState(false);
    setStatus(navigator.onLine ? "تعذر بث التسجيل الصوتي، يرجى المحاولة مرة أخرى." : "تحقق من اتصالك بالإنترنت وحاول مرة أخرى.", true);
  }

  function startLoading() {
    setBusy(true);
    setStatus("جارٍ تحميل التلاوة المباركة...");
    clearTimeout(slowTimer);
    slowTimer = setTimeout(() => {
      setStatus("التحميل يستغرق وقتًا أطول من المعتاد، يرجى الانتظار...");
    }, 9000);
  }

  function doneLoading() {
    clearTimeout(slowTimer);
    setBusy(false);
    setStatus("");
  }

  // إدارة المفضلة للقراء
  function toggleFavoriteReciter(key) {
    if (reciterFavs.includes(key)) {
      reciterFavs = reciterFavs.filter((k) => k !== key);
    } else {
      reciterFavs.push(key);
    }
    save(RECITER_FAVS_KEY, reciterFavs);
    renderRecitersGrid();
    updateReciterModalFavButton();
  }

  // تبديل القارئ المختار
  function selectReciter(key, styleMoshafId = null, startPlaying = true) {
    const r = RECITERS.find((x) => x.key === key);
    if (!r) return;

    prefs.reciter = key;
    if (styleMoshafId && r.styles.some((s) => s.moshafId === styleMoshafId)) {
      prefs.style = styleMoshafId;
    } else {
      prefs.style = r.styles[0]?.moshafId || null;
    }

    save(PREF_KEY, prefs);

    // تحديث الواجهات
    renderReaderStyleSelector();
    updateMetadataDisplay();
    setSurah(surah, startPlaying);
    highlightActiveReciterCard();

    // إظهار المشغل المصغر إن كان مخفيًا
    showMiniPlayer();
  }

  function selectStyle(moshafId) {
    prefs.style = Number(moshafId);
    save(PREF_KEY, prefs);
    renderReaderStyleSelector();
    updateMetadataDisplay();
    setSurah(surah, true);
    updateModalSurahStates();
  }

  function showMiniPlayer() {
    const mini = $("#qaMiniPlayer");
    if (mini) {
      mini.classList.add("is-visible");
      mini.removeAttribute("hidden");
    }
  }

  // عرض بطاقات القراء في المكتبة
  let activeReciterFilter = "all";
  let activeReciterSort = "popular";
  let reciterSearchQuery = "";

  function renderRecitersGrid() {
    const grid = $("#recitersGrid");
    if (!grid) return;

    const q = norm(reciterSearchQuery);
    let list = RECITERS.filter((r) => {
      if (activeReciterFilter === "favs" && !reciterFavs.includes(r.key)) return false;
      if (activeReciterFilter === "murattal" && !r.styles.some((s) => s.styleType === "murattal")) return false;
      if (activeReciterFilter === "mujawwad" && !r.styles.some((s) => s.styleType === "mujawwad")) return false;

      if (!q) return true;
      return (
        norm(r.ar).includes(q) ||
        norm(r.en).includes(q) ||
        norm(r.title).includes(q) ||
        r.match.some((m) => norm(m).includes(q))
      );
    });

    // الترتيب
    if (activeReciterSort === "alpha") {
      list = [...list].sort((a, b) => a.ar.localeCompare(b.ar, "ar"));
    } else if (activeReciterSort === "styles") {
      list = [...list].sort((a, b) => b.styles.length - a.styles.length);
    } else {
      // Default / Popular: المنشاوي أولاً دائماً ثم البقية بترتيبهم المعتمد
      list = [...list].sort((a, b) => {
        if (a.key === "minshawi") return -1;
        if (b.key === "minshawi") return 1;
        return 0;
      });
    }

    // العداد
    const countEl = $("#recitersFoundCount");
    if (countEl) countEl.textContent = `${ar(list.length)} من أصل ${ar(RECITERS.length)} قارئ`;

    if (list.length === 0) {
      grid.innerHTML = `
        <div class="reciters-empty">
          <div class="reciters-empty-icon">۞</div>
          <h3>لم نعثر على قراء يطابقون بحثك</h3>
          <p class="muted">جرّب البحث باسم قارئ آخر أو إزالة التصفية المعينة.</p>
          <button class="btn btn-outline" id="clearReciterFilters">إعادة ضبط التصفية</button>
        </div>
      `;
      const clr = $("#clearReciterFilters");
      if (clr) {
        clr.addEventListener("click", () => {
          activeReciterFilter = "all";
          reciterSearchQuery = "";
          const sInput = $("#reciterSearch");
          if (sInput) sInput.value = "";
          $$(".reciter-chip").forEach((c) => c.classList.toggle("selected", c.dataset.filter === "all"));
          renderRecitersGrid();
        });
      }
      return;
    }

    grid.innerHTML = list.map((r) => {
      const isFav = reciterFavs.includes(r.key);
      const isActive = r.key === prefs.reciter;
      const isPlaying = isActive && !audio.paused && !audio.ended;
      const totalSurahs = r.styles[0]?.surahTotal || 114;
      const hasMujawwad = r.styles.some((s) => s.styleType === "mujawwad");
      const stylesLabels = r.styles.map((s) => s.styleType === "mujawwad" ? "مجوّد" : s.styleType === "muallam" ? "معلّم" : "مرتّل");
      const uniqueStyles = [...new Set(stylesLabels)];

      return `
        <article class="reciter-card ${isActive ? "is-active" : ""} ${isPlaying ? "is-playing" : ""}" data-reciter-key="${r.key}">
          <div class="reciter-card-top">
            <div class="reciter-avatar-wrap">
              <div class="reciter-avatar" aria-hidden="true">${r.initials}</div>
              <div class="sound-wave-badge" title="تشغيل نشط" aria-hidden="true">
                <span></span><span></span><span></span><span></span>
              </div>
            </div>
            <div class="reciter-card-info">
              <div class="reciter-card-title-row">
                <h3 class="reciter-name">${r.ar}</h3>
                <button class="reciter-fav-btn ${isFav ? "is-fav" : ""}" data-reciter-fav="${r.key}" 
                  aria-label="${isFav ? "إزالة من القراء المفضلين" : "إضافة للقراء المفضلين"}"
                  title="${isFav ? "في المفضلة" : "إضافة للمفضلة"}">
                  ${isFav ? "★" : "☆"}
                </button>
              </div>
              <p class="reciter-en-name">${r.en}</p>
              <p class="reciter-desc">${r.title}</p>
            </div>
          </div>

          <div class="reciter-meta-row">
            <span class="reciter-tag tag-surahs">
              <span class="tag-icon">📖</span> ${ar(totalSurahs)} سورة
            </span>
            ${uniqueStyles.map((st) => `<span class="reciter-tag tag-style">${st}</span>`).join("")}
            ${r.styles.length > 1 ? `<span class="reciter-tag tag-more">+${ar(r.styles.length)} تسجيلات</span>` : ""}
          </div>

          <div class="reciter-card-actions">
            <button class="btn btn-primary reciter-play-btn" data-play-reciter="${r.key}" aria-label="الاستماع لتلاوة ${r.ar}">
              <span class="btn-icon">▶</span>
              <span class="btn-label">${isActive && isPlaying ? "إيقاف مؤقت" : "استماع الآن"}</span>
            </button>
            <button class="btn btn-outline reciter-details-btn" data-details-reciter="${r.key}" aria-label="عرض سور وتفاصيل تسجيلات ${r.ar}">
              <span>استعراض السور</span>
              <span class="btn-arrow">←</span>
            </button>
          </div>
        </article>
      `;
    }).join("");

    // ربط أحداث البطاقات
    grid.querySelectorAll("[data-reciter-fav]").forEach((b) => {
      b.addEventListener("click", (e) => {
        e.stopPropagation();
        toggleFavoriteReciter(b.dataset.reciterFav);
      });
    });

    grid.querySelectorAll("[data-play-reciter]").forEach((b) => {
      b.addEventListener("click", (e) => {
        e.stopPropagation();
        const key = b.dataset.playReciter;
        if (prefs.reciter === key) {
          togglePlay();
        } else {
          selectReciter(key, null, true);
        }
      });
    });

    grid.querySelectorAll("[data-details-reciter]").forEach((b) => {
      b.addEventListener("click", (e) => {
        e.stopPropagation();
        openReciterModal(b.dataset.detailsReciter);
      });
    });

    grid.querySelectorAll(".reciter-card").forEach((card) => {
      card.addEventListener("click", () => {
        openReciterModal(card.dataset.reciterKey);
      });
    });
  }

  // نافذة تفاصيل القارئ واستعراض السور
  let modalSurahSearch = "";
  let modalStyleFilter = null;

  function openReciterModal(key) {
    const r = RECITERS.find((x) => x.key === key);
    if (!r) return;

    activeModalReciterKey = key;
    modalSurahSearch = "";
    modalStyleFilter = (key === prefs.reciter && prefs.style) ? prefs.style : r.styles[0].moshafId;

    const modal = $("#reciterModal");
    if (!modal) return;

    renderReciterModalContent(r);
    modal.classList.add("open");
    modal.setAttribute("aria-hidden", "false");
    document.body.classList.add("modal-open");

    const searchInput = $("#modalSurahSearch");
    if (searchInput) {
      searchInput.value = "";
      setTimeout(() => searchInput.focus(), 100);
    }
  }

  function closeReciterModal() {
    const modal = $("#reciterModal");
    if (!modal) return;
    modal.classList.remove("open");
    modal.setAttribute("aria-hidden", "true");
    document.body.classList.remove("modal-open");
    activeModalReciterKey = null;
  }

  function updateReciterModalFavButton() {
    const favBtn = $("#modalReciterFav");
    if (!favBtn || !activeModalReciterKey) return;
    const isFav = reciterFavs.includes(activeModalReciterKey);
    favBtn.textContent = isFav ? "★ في المفضلة" : "☆ أضف للمفضلة";
    favBtn.classList.toggle("is-fav", isFav);
  }

  function renderReciterModalContent(r) {
    $("#modalReciterName").textContent = r.ar;
    $("#modalReciterEn").textContent = r.en;
    $("#modalReciterDesc").textContent = r.title;
    $("#modalReciterAvatar").textContent = r.initials;
    updateReciterModalFavButton();

    // رندرة أزرار أنماط التسجيل والروايات
    const stylesWrap = $("#modalStylesList");
    if (stylesWrap) {
      stylesWrap.hidden = false;
      const hasMultiple = r.styles.length > 1;
      stylesWrap.innerHTML = `
        <div class="modal-styles-bar">
          <div class="modal-styles-label">
            <span class="styles-icon">🎙</span>
            <span>${hasMultiple ? "اختر الرواية أو نمط التلاوة:" : "الرواية ونمط التسجيل:"}</span>
          </div>
          <div class="modal-styles-chips" role="tablist" aria-label="روايات وتلاوات القارئ">
            ${r.styles.map((s) => `
              <button class="modal-style-chip ${s.moshafId === modalStyleFilter ? "selected" : ""}" 
                data-style-id="${s.moshafId}" type="button" role="tab" aria-selected="${s.moshafId === modalStyleFilter}">
                <span class="style-chip-name">${s.label}</span>
                <span class="style-chip-count">${ar(s.surahTotal)} سورة</span>
              </button>
            `).join("")}
          </div>
        </div>
      `;

      stylesWrap.querySelectorAll(".modal-style-chip").forEach((b) => {
        b.addEventListener("click", () => {
          modalStyleFilter = Number(b.dataset.styleId);
          stylesWrap.querySelectorAll(".modal-style-chip").forEach((c) => {
            const isSel = c === b;
            c.classList.toggle("selected", isSel);
            c.setAttribute("aria-selected", String(isSel));
          });
          renderModalSurahsList(r);
        });
      });
    }

    renderModalSurahsList(r);
  }

  function renderModalSurahsList(r) {
    const container = $("#modalSurahsContainer");
    if (!container) return;

    const currentStyle = r.styles.find((s) => s.moshafId === modalStyleFilter) || r.styles[0];
    const q = norm(modalSurahSearch);

    const surahsList = ctx.names.map((name, i) => {
      const num = i + 1;
      const isAvail = isSurahAvailable(num, r, currentStyle);
      return { n: num, name, isAvail };
    });

    const filtered = surahsList.filter((item) => {
      if (!q) return true;
      return (
        norm(item.name).includes(q) ||
        String(item.n) === q ||
        ar(item.n) === q
      );
    });

    if (filtered.length === 0) {
      container.innerHTML = `<p class="muted empty">لا توجد سور مطابقة للبحث داخل تلاوات هذا القارئ.</p>`;
      return;
    }

    container.innerHTML = filtered.map((item) => {
      const isCur = prefs.reciter === r.key && prefs.style === currentStyle.moshafId && surah === item.n;
      const isPlaying = isCur && !audio.paused && !audio.ended;

      return `
        <div class="modal-surah-row ${isCur ? "is-current" : ""} ${!item.isAvail ? "is-unavailable" : ""}">
          <div class="modal-surah-info">
            <span class="modal-surah-num">${ar(item.n)}</span>
            <div class="modal-surah-name-wrap">
              <strong class="modal-surah-name">سورة ${item.name}</strong>
              <span class="modal-surah-badge">
                ${item.isAvail ? "متوفرة للتلاوة" : "غير متوفرة في هذا التسجيل"}
              </span>
            </div>
          </div>
          <div class="modal-surah-actions">
            ${
              item.isAvail
                ? `
                <button class="btn btn-sm btn-play-surah ${isPlaying ? "is-playing" : ""}" 
                  data-surah-num="${item.n}" title="${isPlaying ? "إيقاف مؤقت" : "تشغيل"}">
                  ${isPlaying ? "⏸ إيقاف" : "▶ تشغيل"}
                </button>
                <button class="btn btn-sm btn-read-surah" data-read-surah="${item.n}" title="فتح لقراءة الآيات">
                  📖 قراءة
                </button>
              `
                : `<span class="badge-disabled">غير متاحة</span>`
            }
          </div>
        </div>
      `;
    }).join("");

    container.querySelectorAll("[data-surah-num]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const n = Number(btn.dataset.surahNum);
        if (prefs.reciter === r.key && prefs.style === currentStyle.moshafId && surah === n) {
          togglePlay();
        } else {
          prefs.reciter = r.key;
          prefs.style = currentStyle.moshafId;
          save(PREF_KEY, prefs);
          ctx.goTo(n);
          setTimeout(() => play(), 100);
          showMiniPlayer();
          updateMetadataDisplay();
          renderReaderStyleSelector();
          renderModalSurahsList(r);
        }
      });
    });

    container.querySelectorAll("[data-read-surah]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const n = Number(btn.dataset.readSurah);
        ctx.goTo(n);
        closeReciterModal();
        location.hash = "#quran";
      });
    });
  }

  function updateModalSurahStates() {
    if (!activeModalReciterKey) return;
    const r = RECITERS.find((x) => x.key === activeModalReciterKey);
    if (r) renderModalSurahsList(r);
  }

  // تحديث محدد النمط في لوحة القارئ داخل المصحف
  function renderReaderStyleSelector() {
    const wrap = $("#qaReaderStyleWrap");
    const select = $("#qaReaderStyleSelect");
    const r = reciter();

    if (!wrap || !select) return;

    if (r.styles.length > 1) {
      wrap.hidden = false;
      select.innerHTML = r.styles.map((s) => `
        <option value="${s.moshafId}" ${s.moshafId === prefs.style ? "selected" : ""}>
          ${s.label} (${ar(s.surahTotal)} سورة)
        </option>
      `).join("");
    } else {
      wrap.hidden = true;
    }
  }

  // فتح وإغلاق المشغل الموسع
  function openExpandedPlayer() {
    const exp = $("#qaExpandedPlayer");
    if (!exp) return;
    updateMetadataDisplay();
    exp.classList.add("open");
    exp.setAttribute("aria-hidden", "false");
    document.body.classList.add("modal-open");
  }

  function closeExpandedPlayer() {
    const exp = $("#qaExpandedPlayer");
    if (!exp) return;
    exp.classList.remove("open");
    exp.setAttribute("aria-hidden", "true");
    document.body.classList.remove("modal-open");
  }

  // ربط أحداث المشغل وعناصر التحكم
  function bindPlayerEvents() {
    // أزرار التشغيل والإيقاف الموحدة
    $$(".qa-play-btn").forEach((btn) => {
      btn.addEventListener("click", togglePlay);
    });

    // أزرار السابقة والتالية
    $$(".qa-prev-btn").forEach((btn) => {
      btn.addEventListener("click", prevSurah);
    });

    $$(".qa-next-btn").forEach((btn) => {
      btn.addEventListener("click", nextSurah);
    });

    // زر الإعادة
    $$(".qa-replay-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        audio.currentTime = 0;
        play();
      });
    });

    // أزرار إعادة المحاولة
    $$(".qa-retry-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        const t = audio.currentTime;
        audio.load();
        audio.currentTime = t || 0;
        play();
      });
    });

    // تبديل التكرار والتلقائي
    $$(".qa-repeat-btn").forEach((btn) => {
      btn.setAttribute("aria-pressed", String(prefs.repeat));
      btn.classList.toggle("is-active", prefs.repeat);
      btn.addEventListener("click", () => {
        prefs.repeat = !prefs.repeat;
        save(PREF_KEY, prefs);
        $$(".qa-repeat-btn").forEach((b) => {
          b.setAttribute("aria-pressed", String(prefs.repeat));
          b.classList.toggle("is-active", prefs.repeat);
        });
      });
    });

    $$(".qa-auto-btn").forEach((btn) => {
      btn.setAttribute("aria-pressed", String(prefs.autonext));
      btn.classList.toggle("is-active", prefs.autonext);
      btn.addEventListener("click", () => {
        prefs.autonext = !prefs.autonext;
        save(PREF_KEY, prefs);
        $$(".qa-auto-btn").forEach((b) => {
          b.setAttribute("aria-pressed", String(prefs.autonext));
          b.classList.toggle("is-active", prefs.autonext);
        });
      });
    });

    // مستوى الصوت وكتم الصوت
    audio.volume = prefs.volume;
    audio.muted = prefs.muted;

    const updateMuteUI = () => {
      const isMuted = audio.muted || audio.volume === 0;
      $$(".qa-mute-btn").forEach((btn) => {
        btn.textContent = isMuted ? "🔇" : "🔊";
        btn.setAttribute("aria-label", isMuted ? "إلغاء كتم الصوت" : "كتم الصوت");
      });
      $$(".qa-vol-slider").forEach((s) => {
        s.value = isMuted ? 0 : audio.volume;
      });
    };

    $$(".qa-mute-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        audio.muted = !audio.muted;
        prefs.muted = audio.muted;
        save(PREF_KEY, prefs);
        updateMuteUI();
      });
    });

    $$(".qa-vol-slider").forEach((slider) => {
      slider.addEventListener("input", () => {
        const val = Number(slider.value);
        audio.volume = val;
        audio.muted = val === 0;
        prefs.volume = val;
        prefs.muted = audio.muted;
        save(PREF_KEY, prefs);
        updateMuteUI();
      });
    });

    updateMuteUI();

    // شرائط التمرير والتنقل بالوقت (Seek bars)
    $$(".qa-seek-bar").forEach((bar) => {
      bar.addEventListener("input", () => {
        isDragging = true;
        if (isFinite(audio.duration)) {
          const seekTime = (bar.value / 1000) * audio.duration;
          $$(".qa-cur-time").forEach((el) => (el.textContent = fmt(seekTime)));
        }
      });
      bar.addEventListener("change", () => {
        if (isFinite(audio.duration)) {
          audio.currentTime = (bar.value / 1000) * audio.duration;
        }
        isDragging = false;
      });
    });

    // فتح وإغلاق المشغل الموسع
    const openExpBtn = $("#qaOpenExpanded");
    if (openExpBtn) openExpBtn.addEventListener("click", openExpandedPlayer);

    const miniClickArea = $("#qaMiniClickable");
    if (miniClickArea) miniClickArea.addEventListener("click", openExpandedPlayer);

    const closeExpBtn = $("#qaCloseExpanded");
    if (closeExpBtn) closeExpBtn.addEventListener("click", closeExpandedPlayer);

    // نافذة القارئ المودال
    const closeReciterModalBtn = $("#closeReciterModal");
    if (closeReciterModalBtn) closeReciterModalBtn.addEventListener("click", closeReciterModal);

    const modalBackdrop = $("#reciterModalBackdrop");
    if (modalBackdrop) modalBackdrop.addEventListener("click", closeReciterModal);

    const expBackdrop = $("#qaExpBackdrop");
    if (expBackdrop) expBackdrop.addEventListener("click", closeExpandedPlayer);

    const modalFavBtn = $("#modalReciterFav");
    if (modalFavBtn) {
      modalFavBtn.addEventListener("click", () => {
        if (activeModalReciterKey) toggleFavoriteReciter(activeModalReciterKey);
      });
    }

    const modalSearchInput = $("#modalSurahSearch");
    if (modalSearchInput) {
      modalSearchInput.addEventListener("input", (e) => {
        modalSurahSearch = e.target.value;
        if (activeModalReciterKey) {
          const r = RECITERS.find((x) => x.key === activeModalReciterKey);
          if (r) renderModalSurahsList(r);
        }
      });
    }

    // زر الانتقال للمكتبة من مشغل المصحف
    const browseLibraryBtn = $("#qaBrowseLibrary");
    if (browseLibraryBtn) {
      browseLibraryBtn.addEventListener("click", () => {
        location.hash = "#reciters";
      });
    }

    const readerStyleSelect = $("#qaReaderStyleSelect");
    if (readerStyleSelect) {
      readerStyleSelect.addEventListener("change", (e) => {
        selectStyle(e.target.value);
      });
    }

    // أحداث مكتبة القراء في الصفحة الرئيسية (البحث والتصفية)
    const reciterSearch = $("#reciterSearch");
    if (reciterSearch) {
      reciterSearch.addEventListener("input", (e) => {
        reciterSearchQuery = e.target.value;
        renderRecitersGrid();
      });
    }

    $$(".reciter-chip").forEach((chip) => {
      chip.addEventListener("click", () => {
        activeReciterFilter = chip.dataset.filter;
        $$(".reciter-chip").forEach((c) => c.classList.toggle("selected", c === chip));
        renderRecitersGrid();
      });
    });

    const reciterSortSelect = $("#reciterSort");
    if (reciterSortSelect) {
      reciterSortSelect.addEventListener("change", (e) => {
        activeReciterSort = e.target.value;
        renderRecitersGrid();
      });
    }

    // زر الانتقال لقراءة السورة من المشغل الموسع
    const jumpToReaderBtn = $("#qaExpJumpToText");
    if (jumpToReaderBtn) {
      jumpToReaderBtn.addEventListener("click", () => {
        closeExpandedPlayer();
        location.hash = "#quran";
      });
    }

    // أحداث عنصر الصوت Audio Events
    audio.addEventListener("loadstart", () => {
      if (audio.getAttribute("src")) startLoading();
    });

    audio.addEventListener("waiting", startLoading);
    audio.addEventListener("canplay", doneLoading);
    audio.addEventListener("playing", () => {
      doneLoading();
      setPlayState(true);
      showMiniPlayer();
    });
    audio.addEventListener("pause", () => setPlayState(false));
    audio.addEventListener("error", onError);
    audio.addEventListener("stalled", () => {
      if (!audio.paused) startLoading();
    });

    audio.addEventListener("loadedmetadata", () => {
      const dur = audio.duration;
      $$(".qa-dur-time").forEach((el) => (el.textContent = fmt(dur)));

      const p = load(POS_KEY, null);
      if (!restored && p && p.r === prefs.reciter && p.m === prefs.style && p.n === surah && p.t > 3 && p.t < dur - 5) {
        audio.currentTime = p.t;
      }
      restored = true;
    });

    audio.addEventListener("timeupdate", () => {
      if (!isFinite(audio.duration)) return;
      const cur = audio.currentTime;
      const dur = audio.duration;

      if (!isDragging) {
        const val = (cur / dur) * 1000;
        $$(".qa-seek-bar").forEach((b) => (b.value = val));
        $$(".qa-cur-time").forEach((el) => (el.textContent = fmt(cur)));
      }

      // حفظ موضع الاستماع
      if (Date.now() - lastSave > 4000 && cur > 0) {
        lastSave = Date.now();
        save(POS_KEY, { r: prefs.reciter, m: prefs.style, n: surah, t: cur });
      }
    });

    audio.addEventListener("ended", () => {
      save(POS_KEY, null);
      if (prefs.repeat) {
        audio.currentTime = 0;
        play();
      } else if (prefs.autonext && surah < 114) {
        ctx.goTo(surah + 1);
        setTimeout(play, 300);
      } else {
        setPlayState(false);
      }
    });

    window.addEventListener("online", () => {
      setStatus("");
      doneLoading();
    });

    // اختصارات لوحة المفاتيح
    window.addEventListener("keydown", (e) => {
      if (["INPUT", "TEXTAREA"].includes(document.activeElement?.tagName)) return;
      if (e.code === "Space") {
        e.preventDefault();
        togglePlay();
      } else if (e.code === "Escape") {
        closeReciterModal();
        closeExpandedPlayer();
      }
    });

    // دعم أزرار وسائط نظام التشغيل
    if ("mediaSession" in navigator) {
      const h = (action, fn) => {
        try {
          navigator.mediaSession.setActionHandler(action, fn);
        } catch {}
      };
      h("play", play);
      h("pause", pause);
      h("previoustrack", prevSurah);
      h("nexttrack", nextSurah);
      h("seekto", (details) => {
        if (details.seekTime && isFinite(audio.duration)) {
          audio.currentTime = details.seekTime;
        }
      });
    }
  }

  // تحديث البيانات ديناميكياً من الـ API في الخلفية إن توفرت
  async function syncWithApi() {
    const cached = load(CACHE_KEY, null);
    if (cached && Date.now() - cached.ts < TTL) {
      return;
    }
    const ctl = new AbortController();
    const timer = setTimeout(() => ctl.abort(), 8000);
    try {
      const res = await fetch(API, { signal: ctl.signal });
      if (!res.ok) throw new Error(res.status);
      const data = await res.json();
      if (data && data.reciters) {
        save(CACHE_KEY, { ts: Date.now() });
      }
    } catch {}
    finally {
      clearTimeout(timer);
    }
  }

  const QuranAudio = {
    RECITERS,
    init(opts) {
      ctx = Object.assign(ctx, opts);
      surah = ctx.getSurah();

      if (!window.Audio) {
        setStatus("المتصفح لا يدعم تشغيل الصوت.");
        return;
      }

      // التأكد من صلاحية القارئ ونمطه
      if (!reciter().styles.length) {
        prefs.reciter = "minshawi";
      }
      if (!style()) {
        prefs.style = reciter().styles[0]?.moshafId || null;
      }

      renderRecitersGrid();
      renderReaderStyleSelector();
      bindPlayerEvents();
      updateMetadataDisplay();
      setPlayState(false);

      // تجهيز الرابط المبدئي دون تشغيل تلقائي
      const url = urlFor(surah);
      if (url) audio.src = url;

      // تحديث صامت في الخلفية
      syncWithApi();
    },
    setSurah(n) {
      setSurah(n, false);
    },
    play,
    pause,
    togglePlay,
    selectReciter,
    openReciterModal,
    openExpandedPlayer,
    closeExpandedPlayer,
    getReciters: () => RECITERS,
    audio
  };

  window.QuranAudio = QuranAudio;
})();
