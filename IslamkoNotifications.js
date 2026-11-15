/**
 * IslamkoNotifications.js - نظام التنبيهات والإشعارات الإسلامية
 * تطبيق إسلامكو | رفيق يومك إلى الطمأنينة
 * 
 * الميزات:
 * 1. إشعارات مواقيت الصلاة والأذان (الفجر، الظهر، العصر، المغرب، العشاء).
 * 2. تذكير أذكار الصباح والمساء في مواعيدها المأثورة.
 * 3. تذكير الصلاة على النبي ﷺ مع تذكير خاص بيوم الجمعة.
 * 4. تذكير دوري متجدد بالتسبيح والاستغفار لترطيب اللسان بذكر الله.
 * 5. دعم كامل لـ Service Worker و PWA وتطبيقات الهواتف الذكية (Capacitor/Cordova).
 * 6. نغمة تنبيه صوتية وقورة باستخدام Web Audio API تعمل بدون إنترنت وبدون ملفات خارجية.
 */
(function () {
  "use strict";

  const $ = (s) => document.querySelector(s);
  const $$ = (s) => document.querySelectorAll(s);

  const SETTINGS_KEY = "islamko-notif-settings";
  const HISTORY_KEY = "islamko-notif-history";

  // إعدادات التنبيهات الافتراضية
  const defaultSettings = {
    enabled: true,
    prayers: true,
    adhkar: true,
    morningTime: "07:00",
    evening: true,
    eveningTime: "17:00",
    salawat: true,
    salawatInterval: 120,
    tasbeeh: true,
    tasbeehInterval: 120 // بالدقائق (ساعتان افتراضيًا)
  };

  const load = (k, d) => {
    try {
      const v = localStorage.getItem(k);
      if (v !== null) return JSON.parse(v);
      const old1 = localStorage.getItem(k.replace("islamko-", "islamkum-"));
      if (old1 !== null) return JSON.parse(old1);
      const old2 = localStorage.getItem(k.replace("islamko-", "quranakum-"));
      if (old2 !== null) return JSON.parse(old2);
      return d;
    } catch {
      return d;
    }
  };

  const save = (k, v) => {
    try {
      localStorage.setItem(k, JSON.stringify(v));
    } catch { }
  };

  let settings = Object.assign({}, defaultSettings, load(SETTINGS_KEY, {}));
  let history = Object.assign({
    lastPrayers: {}, // { '2026-11-13': ['Fajr', 'Dhuhr', ...] }
    lastMorning: null,
    lastEvening: null,
    lastSalawat: 0,
    lastTasbeeh: 0,
    tasbeehIndex: 0
  }, load(HISTORY_KEY, {}));

  // باقة أذكار التسبيح والاستغفار المتجددة
  const TASBEEH_PHRASES = [
    { text: "سُبْحَانَ اللَّهِ وَبِحَمْدِهِ ، سُبْحَانَ اللَّهِ الْعَظِيمِ 🌿", sub: "كلمتان خفيفتان على اللسان ثقيلتان في الميزان" },
    { text: "أَسْتَغْفِرُ اللَّهَ الْعَظِيمَ الَّذِي لَا إِلَهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ وَأَتُوبُ إِلَيْهِ 💫", sub: "استغفار يفرّج الهموم ويغفر الذنوب" },
    { text: "لَا إِلَهَ إِلَّا أَنْتَ سُبْحَانَكَ إِنِّي كُنْتُ مِنَ الظَّالِمِينَ ✨", sub: "دعوة ذي النون ما دعا بها مسلم إلا فرّج الله عنه" },
    { text: "لَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللَّهِ الْعَلِيِّ الْعَظِيمِ 🕊️", sub: "كنزٌ عظيم من كنوز الجنة وباب من أبواب الفرج" },
    { text: "سُبْحَانَ اللَّهِ ، وَالْحَمْدُ لِلَّهِ ، وَلَا إِلَهَ إِلَّا اللَّهُ ، وَاللَّهُ أَكْبَرُ 🌸", sub: "أحبّ الكلام إلى الله تعالى" },
    { text: "حَسْبِيَ اللَّهُ لَا إِلَهَ إِلَّا هُوَ عَلَيْهِ تَوَكَّلْتُ وَهُوَ رَبُّ الْعَرْشِ الْعَظِيمِ 🤍", sub: "من قالها كفاه الله ما أهمّه" }
  ];

  // تشغيل نغمة تنبيه صوتية وقورة وهادئة عبر Web Audio API
  function playNotificationChime() {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();

      const now = ctx.currentTime;
      // النغمة الأولى (صوت بلوري هادئ)
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = "sine";
      osc1.frequency.setValueAtTime(587.33, now); // D5
      gain1.gain.setValueAtTime(0, now);
      gain1.gain.linearRampToValueAtTime(0.18, now + 0.05);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.8);
      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.start(now);
      osc1.stop(now + 0.8);

      // النغمة الثانية (تناغم علوي مبارك)
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = "sine";
      osc2.frequency.setValueAtTime(880, now + 0.18); // A5
      gain2.gain.setValueAtTime(0, now + 0.18);
      gain2.gain.linearRampToValueAtTime(0.15, now + 0.23);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 1.2);
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.start(now + 0.18);
      osc2.stop(now + 1.2);
    } catch { }
  }

  // إدارة شريط الإشعار التفاعلي العائم داخل الصفحة (In-App Notification Banner)
  let inAppTimer = null;
  function showInAppNotification(title, body, targetUrl = "#home") {
    let banner = $("#inAppNotif");
    if (!banner) {
      banner = document.createElement("aside");
      banner.id = "inAppNotif";
      banner.className = "in-app-notif";
      banner.setAttribute("role", "alert");
      banner.innerHTML = `
        <div class="in-app-notif-content">
          <span class="in-app-notif-icon" aria-hidden="true">🔔</span>
          <div class="in-app-notif-text">
            <strong class="in-app-notif-title" id="inAppNotifTitle"></strong>
            <p class="in-app-notif-body" id="inAppNotifBody"></p>
          </div>
          <button class="in-app-notif-close" id="inAppNotifClose" type="button" aria-label="إغلاق التنبيه">✕</button>
        </div>
      `;
      document.body.appendChild(banner);

      banner.addEventListener("click", (e) => {
        if (e.target.closest("#inAppNotifClose")) {
          hideInAppNotification();
          return;
        }
        hideInAppNotification();
        if (targetUrl) {
          location.hash = targetUrl;
        }
      });
    }

    const titleEl = $("#inAppNotifTitle");
    const bodyEl = $("#inAppNotifBody");
    if (titleEl) titleEl.textContent = title;
    if (bodyEl) bodyEl.textContent = body;

    banner.hidden = false;
    requestAnimationFrame(() => {
      banner.classList.add("show");
    });

    if (inAppTimer) clearTimeout(inAppTimer);
    inAppTimer = setTimeout(() => {
      hideInAppNotification();
    }, 7000);
  }

  function hideInAppNotification() {
    const banner = $("#inAppNotif");
    if (!banner) return;
    banner.classList.remove("show");
    setTimeout(() => {
      banner.hidden = true;
    }, 400);
  }

  // إرسال الإشعار الفعلي عبر المتصفح و Service Worker والإشعار التفاعلي
  async function dispatchNotification(title, body, targetUrl = "#home", tag = null) {
    // 1. تشغيل النغمة الصوتية الوقورة دائمًا
    playNotificationChime();

    // 2. إظهار الإشعار التفاعلي العائم داخل التطبيق فورًا أمام المستخدم
    showInAppNotification(title, body, targetUrl);

    // 3. التحقق من دعم إشعارات النظام (OS Notifications)
    if (!("Notification" in window) || Notification.permission !== "granted") {
      return true;
    }

    let iconUrl;
    try {
      iconUrl = new URL("manifest-icon.png", location.href).href;
    } catch {
      iconUrl = "manifest-icon.png";
    }

    const options = {
      body,
      icon: iconUrl,
      badge: iconUrl,
      tag: tag || `islamko-notif-${Date.now()}`,
      renotify: true,
      dir: "rtl",
      lang: "ar",
      data: {
        url: targetUrl,
        timestamp: Date.now()
      }
    };

    if ("vibrate" in navigator) {
      options.vibrate = [200, 100, 200, 100, 400];
    }

    let osDispatched = false;

    // أ) محاولة الإرسال عبر Service Worker (أفضل للهواتف والشاشات المقفلة)
    if ("serviceWorker" in navigator) {
      try {
        const reg = await Promise.race([
          navigator.serviceWorker.ready,
          new Promise((_, reject) => setTimeout(() => reject(new Error("timeout")), 1200))
        ]);
        if (reg && typeof reg.showNotification === "function") {
          await reg.showNotification(title, options);
          osDispatched = true;
        }
      } catch (err) {
        // الاستمرار إلى البديل المباشر
      }
    }

    // ب) محاولة الإرسال عبر كائن Notification المباشر
    if (!osDispatched) {
      try {
        const n = new Notification(title, options);
        n.onclick = function () {
          window.focus();
          if (targetUrl) {
            location.hash = targetUrl;
          }
          this.close();
        };
        osDispatched = true;
      } catch (err) {
        console.warn("Could not dispatch OS desktop notification:", err);
      }
    }

    return true;
  }

  // طلب إذن الإشعارات من المستخدم
  async function requestPermission() {
    if (!("Notification" in window)) {
      if (typeof showToast === "function") showToast("متصفحك لا يدعم نظام الإشعارات.");
      updateStatusUI();
      return "unsupported";
    }

    try {
      const perm = await Notification.requestPermission();
      updateStatusUI();
      if (perm === "granted") {
        if (typeof showToast === "function") showToast("تم تفعيل الإشعارات بنجاح ✓");
        await dispatchNotification(
          "أهلاً بك في إسلامكو ۞",
          "تم تفعيل التنبيهات الإسلامية بنجاح. ستصلك أوقات الصلاة والأذكار والتسبيح بانتظام.",
          "#home"
        );
      } else if (perm === "denied") {
        if (typeof showToast === "function") showToast("تم رفض إذن الإشعارات من إعدادات المتصفح.");
      }
      return perm;
    } catch (e) {
      updateStatusUI();
      return "denied";
    }
  }

  // فحص أذان الصلاة
  function checkPrayerTime(todayTimings, cityName) {
    if (!settings.enabled || !settings.prayers || !todayTimings) return;
    if (Notification.permission !== "granted") return;

    const now = new Date();
    const todayStr = `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}`;
    const curHour = now.getHours();
    const curMin = now.getMinutes();
    const curTotalMins = curHour * 60 + curMin;

    if (!history.lastPrayers[todayStr]) {
      history.lastPrayers[todayStr] = [];
    }

    const prayerNames = [
      { key: "Fajr", ar: "الفجر" },
      { key: "Dhuhr", ar: "الظهر" },
      { key: "Asr", ar: "العصر" },
      { key: "Maghrib", ar: "المغرب" },
      { key: "Isha", ar: "العشاء" }
    ];

    for (const p of prayerNames) {
      if (!todayTimings[p.key]) continue;
      const [h, m] = todayTimings[p.key].split(" ")[0].split(":").map(Number);
      const prayerTotalMins = h * 60 + m;

      // إذا وصلنا لوقت الصلاة (في نافذة الدقيقة الحالية أو الدقيقة التي تليها) ولم يتم التنبيه بها اليوم
      const diff = curTotalMins - prayerTotalMins;
      if (diff >= 0 && diff <= 1 && !history.lastPrayers[todayStr].includes(p.key)) {
        history.lastPrayers[todayStr].push(p.key);
        save(HISTORY_KEY, history);

        const place = cityName || "مدينتك";
        dispatchNotification(
          `حان الآن موعد أذان ${p.ar} 🕌`,
          `الله أكبر، الله أكبر · حان موعد صلاة ${p.ar} حسب توقيت ${place}. حيّ على الصلاة، حيّ على الفلاح.`,
          "#prayer",
          `prayer-${p.key}-${todayStr}`
        );
        break;
      }
    }
  }

  // فحص أذكار الصباح والمساء وفق الوقت الذي حدده المستخدم
  function checkAdhkarReminders() {
    if (!settings.enabled) return;
    if (Notification.permission !== "granted") return;

    const now = new Date();
    const todayStr = `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}`;
    const curHour = now.getHours();
    const curMin = now.getMinutes();
    const curTotalMins = curHour * 60 + curMin;

    // أذكار الصباح في الوقت المحدد
    if (settings.adhkar) {
      const [mH, mM] = (settings.morningTime || "07:00").split(":").map(Number);
      const morningTarget = mH * 60 + mM;
      const diffM = curTotalMins - morningTarget;
      if (diffM >= 0 && diffM <= 2 && history.lastMorning !== todayStr) {
        history.lastMorning = todayStr;
        save(HISTORY_KEY, history);
        dispatchNotification(
          "ورد أذكار الصباح ☀️",
          "أصبحنا وأصبح الملك لله والحمد لله.. ابدأ يومك بذكر الله وتلاوة ورد الصباح لنيل الحفظ والبركة.",
          "#adhkar",
          `adhkar-morning-${todayStr}`
        );
      }
    }

    // أذكار المساء في الوقت المحدد
    if (settings.evening !== false) {
      const [eH, eM] = (settings.eveningTime || "17:00").split(":").map(Number);
      const eveningTarget = eH * 60 + eM;
      const diffE = curTotalMins - eveningTarget;
      if (diffE >= 0 && diffE <= 2 && history.lastEvening !== todayStr) {
        history.lastEvening = todayStr;
        save(HISTORY_KEY, history);
        dispatchNotification(
          "ورد أذكار المساء 🌙",
          "أمسينا وأمسى الملك لله.. حصّن نفسك وأهلك بأذكار المساء المأثورة لتنزل عليك السكينة والرحمة.",
          "#adhkar",
          `adhkar-evening-${todayStr}`
        );
      }
    }
  }

  // فحص الصلاة على النبي ﷺ
  function checkSalawatReminder() {
    if (!settings.enabled || !settings.salawat) return;
    if (Notification.permission !== "granted") return;

    const now = Date.now();
    const isFriday = new Date().getDay() === 5;
    
    let intervalMins = 120;
    if (settings.salawatInterval === "friday") {
      if (!isFriday) return;
      intervalMins = 90;
    } else {
      intervalMins = Number(settings.salawatInterval) || 120;
    }
    const intervalMs = intervalMins * 60 * 1000;

    if (now - (history.lastSalawat || 0) >= intervalMs) {
      history.lastSalawat = now;
      save(HISTORY_KEY, history);

      if (isFriday) {
        dispatchNotification(
          "نور ما بين الجمعتين 🌸",
          "قال رسول الله ﷺ: «أَكْثِرُوا عَلَيَّ مِنَ الصَّلَاةِ فِي يَوْمِ الْجُمُعَةِ».. اللَّهُمَّ صَلِّ وَسَلِّمْ عَلَى نَبِيِّنَا مُحَمَّدٍ.",
          "#hadiths"
        );
      } else {
        dispatchNotification(
          "صلّوا على الحبيب المصطفى 💚",
          "اللَّهُمَّ صَلِّ وَسَلِّمْ وَبَارِكْ عَلَى سَيِّدِنَا وَحَبِيبِنَا مُحَمَّدٍ ﷺ وعلى آله وصحبه أجمعين.",
          "#hadiths"
        );
      }
    }
  }

  // فحص التسبيح والاستغفار الدوري
  function checkTasbeehReminder() {
    if (!settings.enabled || !settings.tasbeeh) return;
    if (Notification.permission !== "granted") return;

    const now = Date.now();
    const intervalMins = Number(settings.tasbeehInterval) || 120;
    const intervalMs = intervalMins * 60 * 1000;

    if (now - (history.lastTasbeeh || 0) >= intervalMs) {
      history.lastTasbeeh = now;
      const idx = (history.tasbeehIndex || 0) % TASBEEH_PHRASES.length;
      history.tasbeehIndex = idx + 1;
      save(HISTORY_KEY, history);

      const item = TASBEEH_PHRASES[idx];
      dispatchNotification(
        "تذكير التسبيح والاستغفار ◉",
        `${item.text}\n(${item.sub})`,
        "#tasbeeh"
      );
    }
  }

  // دورة الفحص المنتظمة (تُستدعى كل 30 ثانية مع تحديث الصلاة)
  function tick(todayTimings, cityName) {
    checkPrayerTime(todayTimings, cityName);
    checkAdhkarReminders();
    checkSalawatReminder();
    checkTasbeehReminder();
  }

  // إرسال إشعار تجريبي فوري
  async function sendTestNotification() {
    if (!("Notification" in window)) {
      await dispatchNotification(
        "إشعار تجريبي من إسلامكو ۞",
        "الحمد لله! نظام التنبيهات يعمل بنجاح داخل التطبيق. ستصلك أوقات الصلاة والأذكار والتسبيح بانتظام.",
        "#home"
      );
      if (typeof showToast === "function") showToast("تم إرسال الإشعار بنجاح 🔔");
      return;
    }

    if (Notification.permission !== "granted") {
      const perm = await requestPermission();
      if (perm !== "granted") {
        await dispatchNotification(
          "تنبيه تجريبي من إسلامكو ۞",
          "تم إرسال التنبيه داخل التطبيق بنجاح. لتلقي الإشعارات في شريط إشعارات الهاتف أو الويندوز، اسمح بالإشعارات من المتصفح.",
          "#home"
        );
        return;
      }
    } else {
      await dispatchNotification(
        "إشعار تجريبي من إسلامكو ۞",
        "الحمد لله! نظام التنبيهات يعمل بنجاح. ستصلك أوقات الصلاة والأذكار والتسبيح بانتظام.",
        "#home"
      );
    }

    if (typeof showToast === "function") {
      showToast("تم إرسال الإشعار التجريبي بنجاح 🔔");
    }
  }

  // تحديث واجهة المستخدم الخاصة بالنافذة
  function updateStatusUI() {
    const dot = $("#notifStatusDot");
    const permCard = $("#notifPermCard");
    const permTitle = $("#notifPermTitle");
    const permDesc = $("#notifPermDesc");
    const reqBtn = $("#requestNotifPermBtn");
    const permBadgeText = $("#notifPermStatusText");
    const permDot = $("#permDot");

    const hasPerm = "Notification" in window && Notification.permission === "granted";

    if (dot) {
      dot.classList.toggle("is-active", hasPerm);
      dot.classList.toggle("needs-perm", !hasPerm);
    }

    if (permDot) {
      permDot.classList.toggle("is-granted", hasPerm);
      permDot.classList.toggle("is-denied", "Notification" in window && Notification.permission === "denied");
    }

    if (permCard && reqBtn) {
      if (!("Notification" in window)) {
        if (permBadgeText) permBadgeText.textContent = "غير مدعومة بالمتصفح";
        permTitle.textContent = "الإشعارات غير مدعومة";
        permDesc.textContent = "متصفحك الحالي لا يدعم واجهة برمجة الإشعارات.";
        reqBtn.hidden = true;
      } else if (hasPerm) {
        if (permBadgeText) permBadgeText.textContent = "مفعلة وتعمل بنجاح ✓";
        permTitle.textContent = "إشعارات الهاتف مفعلة ✓";
        permDesc.textContent = "التنبيهات تعمل وستصلك في أوقات الصلاة والأذكار والتسبيح.";
        reqBtn.textContent = "الإشعارات مفعلة ونشطة ✓";
        reqBtn.classList.remove("btn-gold");
        reqBtn.classList.add("btn-outline");
        reqBtn.disabled = true;
      } else if (Notification.permission === "denied") {
        if (permBadgeText) permBadgeText.textContent = "محظورة من إعدادات المتصفح";
        permTitle.textContent = "الإشعارات محظورة";
        permDesc.textContent = "يرجى السماح بالإشعارات من إعدادات المتصفح أو أيقونة القفل بجانب الرابط.";
        reqBtn.textContent = "محظورة في إعدادات جهازك ✕";
        reqBtn.classList.remove("btn-gold");
        reqBtn.classList.add("btn-outline");
        reqBtn.disabled = true;
      } else {
        if (permBadgeText) permBadgeText.textContent = "الإشعارات غير مفعلة";
        permTitle.textContent = "إشعارات وتنبيهات الهاتف";
        permDesc.textContent = "اضغط لتفعيل الإشعارات لتصلك مواقيت الصلاة والأذكار في مواعيدها.";
        reqBtn.textContent = "تفعيل الإشعارات الآن 🔔";
        reqBtn.classList.add("btn-gold");
        reqBtn.classList.remove("btn-outline");
        reqBtn.disabled = false;
      }
    }

    // تحديث السويتشات
    const togglePrayer = $("#notifTogglePrayer");
    if (togglePrayer) togglePrayer.checked = settings.prayers;

    const toggleAdhkar = $("#notifToggleAdhkar");
    if (toggleAdhkar) toggleAdhkar.checked = settings.adhkar;

    const morningTimeInput = $("#notifMorningTime");
    if (morningTimeInput) morningTimeInput.value = settings.morningTime || "07:00";

    const toggleEvening = $("#notifToggleEvening");
    if (toggleEvening) toggleEvening.checked = settings.evening !== false;

    const eveningTimeInput = $("#notifEveningTime");
    if (eveningTimeInput) eveningTimeInput.value = settings.eveningTime || "17:00";

    const toggleSalawat = $("#notifToggleSalawat");
    if (toggleSalawat) toggleSalawat.checked = settings.salawat;

    const salawatSelect = $("#notifSalawatInterval");
    if (salawatSelect) salawatSelect.value = String(settings.salawatInterval || 120);

    const toggleTasbeeh = $("#notifToggleTasbeeh");
    if (toggleTasbeeh) toggleTasbeeh.checked = settings.tasbeeh;

    const selectInterval = $("#notifTasbeehInterval");
    if (selectInterval) selectInterval.value = String(settings.tasbeehInterval || 120);
  }

  function openModal() {
    const modal = $("#notifModal");
    if (!modal) return;
    updateStatusUI();
    modal.classList.add("open");
    modal.setAttribute("aria-hidden", "false");
    document.body.classList.add("modal-open");
  }

  function closeModal() {
    const modal = $("#notifModal");
    if (!modal) return;
    modal.classList.remove("open");
    modal.setAttribute("aria-hidden", "true");
    document.body.classList.remove("modal-open");
  }

  function bindEvents() {
    const openBtn = $("#openNotifModal");
    if (openBtn) openBtn.addEventListener("click", openModal);

    const closeBtn = $("#closeNotifModal");
    if (closeBtn) closeBtn.addEventListener("click", closeModal);

    const backdrop = $("#notifModalBackdrop");
    if (backdrop) backdrop.addEventListener("click", closeModal);

    const reqBtn = $("#requestNotifPermBtn");
    if (reqBtn) {
      reqBtn.addEventListener("click", async () => {
        reqBtn.disabled = true;
        reqBtn.textContent = "جارٍ طلب الإذن من جهازك...";
        const res = await requestPermission();
        updateStatusUI();
      });
    }

    const testBtn = $("#sendTestNotifBtn");
    if (testBtn) testBtn.addEventListener("click", sendTestNotification);

    // سويتشات التبديل
    const bindToggle = (id, key) => {
      const el = $("#" + id);
      if (el) {
        el.addEventListener("change", () => {
          settings[key] = el.checked;
          save(SETTINGS_KEY, settings);
          if (typeof showToast === "function") {
            showToast(el.checked ? "تم تفعيل التنبيه بنجاح" : "تم تعطيل التنبيه");
          }
        });
      }
    };

    bindToggle("notifTogglePrayer", "prayers");
    bindToggle("notifToggleAdhkar", "adhkar");
    bindToggle("notifToggleEvening", "evening");
    bindToggle("notifToggleSalawat", "salawat");
    bindToggle("notifToggleTasbeeh", "tasbeeh");

    // مواعيد أذكار الصباح والمساء
    const morningInput = $("#notifMorningTime");
    if (morningInput) {
      morningInput.addEventListener("change", (e) => {
        settings.morningTime = e.target.value;
        save(SETTINGS_KEY, settings);
        if (typeof showToast === "function") {
          showToast(`تم ضبط موعد أذكار الصباح: ${e.target.value}`);
        }
      });
    }

    const eveningInput = $("#notifEveningTime");
    if (eveningInput) {
      eveningInput.addEventListener("change", (e) => {
        settings.eveningTime = e.target.value;
        save(SETTINGS_KEY, settings);
        if (typeof showToast === "function") {
          showToast(`تم ضبط موعد أذكار المساء: ${e.target.value}`);
        }
      });
    }

    // فترات التكرار
    const salawatSelect = $("#notifSalawatInterval");
    if (salawatSelect) {
      salawatSelect.addEventListener("change", () => {
        settings.salawatInterval = salawatSelect.value;
        save(SETTINGS_KEY, settings);
        if (typeof showToast === "function") {
          showToast(`تم ضبط تكرار الصلاة على النبي: ${salawatSelect.options[salawatSelect.selectedIndex].text}`);
        }
      });
    }

    const selectInterval = $("#notifTasbeehInterval");
    if (selectInterval) {
      selectInterval.addEventListener("change", () => {
        settings.tasbeehInterval = Number(selectInterval.value) || 120;
        save(SETTINGS_KEY, settings);
        if (typeof showToast === "function") {
          showToast(`تم ضبط تكرار التسبيح: كل ${selectInterval.options[selectInterval.selectedIndex].text}`);
        }
      });
    }

    // زر في الهيرو أو الصفحة الرئيسية إن وجد
    const heroNotifBtn = $("#heroEnableNotif");
    if (heroNotifBtn) heroNotifBtn.addEventListener("click", openModal);

    // فحص دوري كل 30 ثانية في الخلفية لإرسال التنبيهات في موعدها
    setInterval(() => {
      try {
        const place = load("islamko-place", load("quranakum-place", null));
        tick(window.todayTimings, place?.name);
      } catch {}
    }, 30000);
  }

  const IslamkoNotifications = {
    init() {
      bindEvents();
      updateStatusUI();
      // فحص أولي بعد 3 ثوانٍ
      setTimeout(() => {
        const place = load("islamko-place", load("quranakum-place", null));
        tick(window.todayTimings, place?.name);
      }, 3000);
    },
    tick,
    requestPermission,
    sendTestNotification,
    openModal,
    closeModal,
    getSettings: () => settings
  };

  window.IslamkoNotifications = IslamkoNotifications;
  window.IslamkumNotifications = IslamkoNotifications;
})();

