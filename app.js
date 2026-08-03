const i18n = {
    en: {
        app_title: "Wartel", select_lang: "Select Language", cancel: "Cancel", loading: "Loading Data...",
        featured_reciter: "Featured Reciter", eminent_voices: "Eminent Voices", add_fav: "Add to Favorites", see_all: "See All",
        now_playing: "Now Playing", nav_reciters: "Reciters", nav_fav: "Favorites", nav_player: "Player", 
        nav_settings: "Settings", no_favorites: "No favorites yet.", dark_mode: "Dark Mode",
        ayahs: "Ayahs", search_surah: "Search surah..."
    },
    ar: {
        app_title: "ورتّـل", select_lang: "تغيير اللغة", cancel: "إلغاء", loading: "جاري تحميل البيانات...",
        featured_reciter: "القارئ المتميز", eminent_voices: "أصوات بارزة", add_fav: "أضف للمفضلة", see_all: "عرض الكل",
        now_playing: "قيد التشغيل", nav_reciters: "القراء", nav_fav: "المـفـضـلة", nav_player: "المشغل", 
        nav_settings: "الإعــدادات", no_favorites: "لا توجد مفضلة بعد.", dark_mode: "الوضع الليلي",
        ayahs: "آيات", search_surah: "ابحث عن سورة..."
    }
};

let allReciters = [];
let favorites = loadFavorites();
let currentReciter = null;

// قائمة بأسماء سور القرآن باللغة الإنجليزية لدعم الترجمة تلقائياً
const surahNamesEn = [
    "Al-Fatihah", "Al-Baqarah", "Aal-E-Imran", "An-Nisa", "Al-Ma'idah", "Al-An'am", "Al-A'raf", "Al-Anfal", "At-Tawbah", "Yunus",
    "Hud", "Yusuf", "Ar-Ra'd", "Ibrahim", "Al-Hijr", "An-Nahl", "Al-Isra", "Al-Kahf", "Maryam", "Ta-Ha",
    "Al-Anbiya", "Al-Hajj", "Al-Mu'minun", "An-Nur", "Al-Furqan", "Ash-Shu'ara", "An-Naml", "Al-Qasas", "Al-'Ankabut", "Ar-Rum",
    "Luqman", "As-Sajdah", "Al-Ahzab", "Saba", "Fatir", "Ya-Sin", "As-Saffat", "Sad", "Az-Zumar", "Ghafir",
    "Fussilat", "Ash-Shura", "Az-Zukhruf", "Ad-Dukhan", "Al-Jathiyah", "Al-Ahqaf", "Muhammad", "Al-Fath", "Al-Hujurat", "Qaf",
    "Adh-Dhariyat", "At-Tur", "An-Najm", "Al-Qamar", "Ar-Rahman", "Al-Waqi'ah", "Al-Hadid", "Al-Mujadila", "Al-Hashr", "Al-Mumtahanah",
    "As-Saff", "Al-Jumu'ah", "Al-Munafiqun", "At-Taghabun", "At-Talaq", "At-Tahrim", "Al-Mulk", "Al-Qalam", "Al-Haqqah", "Al-Ma'arij",
    "Nuh", "Al-Jinn", "Al-Muzzammil", "Al-Muddaththir", "Al-Qiyamah", "Al-Insan", "Al-Mursalat", "An-Naba", "An-Nazi'at", "'Abasa",
    "At-Takwir", "Al-Infitar", "Al-Mutaffifin", "Al-Inshiqaq", "Al-Buruj", "At-Tariq", "Al-A'la", "Al-Ghashiyah", "Al-Fajr", "Al-Balad",
    "Ash-Shams", "Al-Lail", "Ad-Duha", "Ash-Sharh", "At-Tin", "Al-'Alaq", "Al-Qadr", "Al-Bayyinah", "Az-Zalzalah", "Al-'Adiyat",
    "Al-Qari'ah", "At-Takathur", "Al-'Asr", "Al-Humazah", "Al-Fil", "Quraish", "Al-Ma'un", "Al-Kawthar", "Al-Kafirun", "An-Nasr",
    "Al-Masad", "Al-Ikhlas", "Al-Falaq", "An-Nas"
];

function loadFavorites() {
    try {
        const saved = localStorage.getItem('wartel_favorites');
        return saved ? JSON.parse(saved) : [];
    } catch (e) {
        return [];
    }
}

function saveFavorites() {
    try {
        localStorage.setItem('wartel_favorites', JSON.stringify(favorites));
    } catch (e) {
        console.error('تعذّر حفظ المفضلة:', e);
    }
}

// إعدادات افتراضية في حال لم يتم تحميل الملف بنجاح
let globalSettings = {
    name_ar: "ورتّـل",
    name_en: "Wartel",
    desc_ar: "تطبيق استماع للقرآن الكريم بأصوات نخبة من القراء.",
    desc_en: "A Quran audio listening app featuring eminent reciters.",
    icon_url: "https://via.placeholder.com/150",
    featured_title_ar: "القارئ المتميز",
    featured_title_en: "Featured Reciter",
    featured: [
        {
            img: "https://lh3.googleusercontent.com/aida-public/AB6AXuBM_ADexsiYGA6FAlIsfzCpHkiPPZ-vhXpXMn0_rfz9a1qo6EZ3GWrNc_CQQNE3ot5DhUR2Sxdyh_jaqq6Zym3a6ssGGMTSaghuuTAoFcPlUnmn1rnTZybGLbb-R6LK-PtYjfhs8VBrqfz3J7-o4ZgehhnKFR4-6Lg3hPpWA9ZFY3D9tm673vke5EGD8Y1HHwrfrJG-J2gBTL-XUGHOh-SjPEE9z224F8ErhIYCTDJH0QnXXVRB0JS4",
            name_ar: "مشاري راشد العفاسي",
            name_en: "Mishary Rashid Alafasy",
            desc_ar: "قارئ وإمام وخطيب كويتي ومنشد.",
            desc_en: "Kuwaiti Qari, imam, preacher, and Nasheed artist.",
            json_file: "mishary.json"
        }
    ]
};

async function fetchSettings() {
    try {
        const response = await fetch('settings.json');
        const fetchedSettings = await response.json();
        
        // دمج الإعدادات المحملة مع الافتراضية
        globalSettings = { ...globalSettings, ...fetchedSettings };

        // توافق مع تنسيق قديم (قارئ متميز واحد فقط بدل مصفوفة)
        if ((!globalSettings.featured || !globalSettings.featured.length) && fetchedSettings.feat_img) {
            globalSettings.featured = [{
                img: fetchedSettings.feat_img,
                name_ar: fetchedSettings.feat_name_ar,
                name_en: fetchedSettings.feat_name_en,
                desc_ar: fetchedSettings.feat_desc_ar,
                desc_en: fetchedSettings.feat_desc_en,
                json_file: fetchedSettings.feat_json
            }];
        }
        
        i18n.ar.app_title = globalSettings.name_ar || "ورتّـل";
        i18n.en.app_title = globalSettings.name_en || "Wartel";
        
        const lang = document.documentElement.getAttribute('lang') || 'ar';
        document.title = (lang === 'ar' ? globalSettings.name_ar : globalSettings.name_en) + " - تطبيق استماع للقرآن";
        setLanguage(lang);

    } catch (error) {
        // في حال فشل التحميل، نستخدم القيم الافتراضية المحددة مسبقاً
        const lang = document.documentElement.getAttribute('lang') || 'ar';
        setLanguage(lang);
        console.log("لم يتم العثور على ملف settings.json، تم استخدام الإعدادات الافتراضية.");
    }
}

// ==================== كاروسيل القارئ المتميز ====================
let featuredCarouselIndex = 0;
let featuredCarouselTimer = null;

function renderFeaturedReciter(lang) {
    const list = (globalSettings && Array.isArray(globalSettings.featured)) ? globalSettings.featured.filter(f => f && f.img) : [];
    const section = document.getElementById('featured-reciter-section');
    if (!list.length) { section.classList.add('hidden'); return; }
    section.classList.remove('hidden');

    const titleEl = document.getElementById('featured-section-title');
    const customTitle = lang === 'ar' ? globalSettings.featured_title_ar : globalSettings.featured_title_en;
    titleEl.textContent = customTitle || i18n[lang].featured_reciter;

    const track = document.getElementById('featured-carousel-track');
    const dots = document.getElementById('featured-carousel-dots');

    track.innerHTML = list.map(item => {
        const name = (lang === 'ar' ? item.name_ar : item.name_en) || '';
        const desc = (lang === 'ar' ? item.desc_ar : item.desc_en) || '';
        return `
        <div class="featured-slide w-full shrink-0">
            <div class="h-48 w-full relative" style="background-image: url('${item.img}'); background-size: cover; background-position: center;">
                <div class="absolute inset-0 bg-gradient-to-t from-primary/80 dark:from-slate-900/90 to-transparent"></div>
                <button class="absolute bottom-4 rtl:left-4 ltr:right-4 w-12 h-12 bg-white rounded-full flex items-center justify-center text-primary shadow-lg hover:scale-105 transition-transform duration-200">
                    <span class="material-symbols-outlined" style="font-variation-settings: 'FILL' 1;">play_arrow</span>
                </button>
            </div>
            <div class="p-4 bg-surface-container-lowest dark:bg-slate-800 text-start" dir="${lang === 'ar' ? 'rtl' : 'ltr'}">
                <h3 class="font-headline-md text-lg font-bold text-primary dark:text-emerald-400 mb-1">${name}</h3>
                <p class="font-body-md text-sm text-on-surface-variant dark:text-slate-300 line-clamp-2">${desc}</p>
            </div>
        </div>`;
    }).join('');

    dots.innerHTML = list.length > 1 ? list.map((_, i) => `<span class="w-1.5 h-1.5 rounded-full transition-colors ${i === 0 ? 'bg-white' : 'bg-white/40'}"></span>`).join('') : '';

    featuredCarouselIndex = 0;
    showFeaturedSlide(0);

    clearInterval(featuredCarouselTimer);
    if (list.length > 1) {
        featuredCarouselTimer = setInterval(() => {
            featuredCarouselIndex = (featuredCarouselIndex + 1) % list.length;
            showFeaturedSlide(featuredCarouselIndex);
        }, 4500);
    }
}

function showFeaturedSlide(idx) {
    const track = document.getElementById('featured-carousel-track');
    track.style.transform = `translateX(-${idx * 100}%)`;
    document.querySelectorAll('#featured-carousel-dots span').forEach((el, i) => {
        el.classList.toggle('bg-white', i === idx);
        el.classList.toggle('bg-white/40', i !== idx);
    });
}

async function fetchReciters() {
    const container = document.getElementById('reciters-container');
    container.innerHTML = renderLoadingState(i18n[document.documentElement.getAttribute('lang') || 'ar'].loading);
    try {
        const response = await fetch('all_reciters.json');
        if (!response.ok) throw new Error('HTTP ' + response.status);
        allReciters = await response.json();
        renderRecitersList();
    } catch (error) {
        console.error("Error fetching reciters:", error);
        container.innerHTML = renderErrorState('حدث خطأ في تحميل قائمة القرّاء. تأكد من اتصالك بالإنترنت.', 'fetchReciters()');
    }
}

function renderLoadingState(message) {
    return `
        <div class="flex flex-col items-center justify-center py-14 gap-3">
            <span class="w-8 h-8 border-[3px] border-outline-variant dark:border-slate-600 border-t-primary dark:border-t-emerald-400 rounded-full animate-spin"></span>
            <p class="text-sm text-on-surface-variant dark:text-slate-400">${message}</p>
        </div>`;
}

function renderErrorState(message, retryCall) {
    return `
        <div class="flex flex-col items-center justify-center py-14 gap-3 text-center px-6">
            <span class="material-symbols-outlined text-4xl text-red-400 dark:text-red-400">error</span>
            <p class="text-sm text-on-surface-variant dark:text-slate-400">${message}</p>
            <button onclick="${retryCall}" class="mt-1 flex items-center gap-1.5 px-5 py-2 bg-primary dark:bg-emerald-500 text-white dark:text-slate-900 rounded-full text-sm font-bold hover:opacity-90 active:scale-95 transition">
                <span class="material-symbols-outlined text-base">refresh</span>
                إعادة المحاولة
            </button>
        </div>`;
}

function renderRecitersList() {
    const container = document.getElementById('reciters-container');
    const lang = document.documentElement.getAttribute('lang') || 'ar';
    container.innerHTML = '';

    if (allReciters.length === 0) {
         container.innerHTML = '<p class="text-center text-gray-500 py-10" data-i18n="loading">' + i18n[lang].loading + '</p>';
         return;
    }

    allReciters.forEach(reciter => {
        if(reciter.id === "mishary") return; 

        const name = lang === 'ar' ? reciter.name_ar : reciter.name_en;
        const type = lang === 'ar' ? reciter.type_ar : reciter.type_en;
        const isFav = favorites.some(f => f.id === reciter.id);

        container.innerHTML += `
            <div class="reader-frame bg-surface-container-lowest dark:bg-slate-800 rounded-xl p-3 flex items-center justify-between shadow-sm border border-surface-container-high/50 dark:border-slate-700 cursor-pointer hover:bg-surface-container dark:hover:bg-slate-700 transition-colors" data-reciter-id="${reciter.id}" onclick="openReciterProfile('${reciter.json_file}')">
                <div class="flex items-center gap-4">
                    <div class="w-14 h-14 rounded-full overflow-hidden shrink-0 bg-cover bg-center shadow-sm border border-outline-variant/20 dark:border-slate-600" style="background-image: url('${reciter.image}')"></div>
                    <div class="text-start">
                        <h4 class="font-headline-md text-base font-bold text-on-surface dark:text-white">${name}</h4>
                        <p class="text-xs text-on-surface-variant dark:text-slate-400">${type}</p>
                    </div>
                </div>
                <button class="text-on-surface-variant dark:text-slate-400 hover:text-primary dark:hover:text-emerald-400 transition-colors p-2" onclick="event.stopPropagation(); toggleFav('${reciter.id}', this)">
                    <span class="material-symbols-outlined" style="font-variation-settings: 'FILL' ${isFav ? 1 : 0};">${isFav ? 'favorite' : 'favorite_border'}</span>
                </button>
            </div>
        `;
    });
    refreshActiveFrames();
}

const reciterDataCache = new Map();

async function openReciterProfile(jsonFile, opts = {}) {
    if (opts.navigate !== false) showScreen('screen-profile');
    const container = document.getElementById('surahs-container');

    let reciterInfo = allReciters.find(r => r.json_file === jsonFile);
    if (!reciterInfo && globalSettings.feat_json === jsonFile) {
        reciterInfo = { id: 'featured', name_ar: globalSettings.feat_name_ar, name_en: globalSettings.feat_name_en, image: globalSettings.feat_img, json_file: jsonFile };
    }

    // روايات القارئ (حفص، ورش، ...) إن وُجدت من لوحة التحكم
    // نضيف الرواية الأساسية (ملف JSON الافتراضي) تلقائياً كأول خيار، باسم يؤخذ من حقل "الوصف" في لوحة التحكم، ثم أي روايات إضافية أضافها المشرف
    const extraRiwayat = (reciterInfo && Array.isArray(reciterInfo.riwayat) && reciterInfo.riwayat.length > 0) ? reciterInfo.riwayat : null;
    const mainRiwayaNameAr = (reciterInfo && reciterInfo.desc_ar) ? reciterInfo.desc_ar : 'الرواية الأساسية';
    const mainRiwayaNameEn = (reciterInfo && reciterInfo.desc_en) ? reciterInfo.desc_en : 'Main Riwaya';
    const riwayat = extraRiwayat ? [{ name_ar: mainRiwayaNameAr, name_en: mainRiwayaNameEn, json_file: jsonFile }, ...extraRiwayat] : null;
    let activeRiwayaIndex = riwayat ? 0 : null;
    let surahsFile = jsonFile;

    // إذا كان هذا هو نفس القارئ الذي يتم تشغيله فعلياً حالياً، نفتح على نفس الرواية التي يقرأها
    // بدلاً من الرجوع دائماً للرواية الأولى
    if (riwayat && reciterInfo && reciterInfo.id === activeReciterId) {
        const matchedRiwaya = riwayat[activePlayingRiwayaIndex];
        if (matchedRiwaya) {
            activeRiwayaIndex = activePlayingRiwayaIndex;
            surahsFile = matchedRiwaya.json_file;
        }
    }

    // نعرض بيانات القارئ (الصورة والاسم) فوراً حتى لا تظهر بيانات القارئ السابق أثناء تحميل قائمة سوره
    currentReciter = { ...reciterInfo, riwayat, activeRiwayaIndex, surahs: [], mainJsonFile: jsonFile };
    if (opts.navigate !== false) renderProfileHeader();

    // إن كانت السور محملة مسبقاً في الذاكرة، نعرضها فوراً دون طلب الشبكة
    if (reciterDataCache.has(surahsFile)) {
        currentReciter = { ...reciterInfo, riwayat, activeRiwayaIndex, surahs: reciterDataCache.get(surahsFile), mainJsonFile: jsonFile };
        renderProfile();
        refreshActiveFrames();
        return;
    }

    if (opts.navigate !== false) container.innerHTML = renderLoadingState(i18n[document.documentElement.lang].loading);
    
    // إضافة تأخير زمني بسيط جداً (20 جزء من الثانية) للسماح للمتصفح بالانتقال للصفحة فوراً قبل جلب البيانات
    setTimeout(async () => {
        try {
            const response = await fetch(surahsFile);
            if (!response.ok) throw new Error('HTTP ' + response.status);
            let data = await response.json();
            
            const surahsArray = Array.isArray(data) ? data : data.surahs;
            reciterDataCache.set(surahsFile, surahsArray);
            currentReciter = { ...reciterInfo, riwayat, activeRiwayaIndex, surahs: surahsArray, mainJsonFile: jsonFile };
            renderProfile();
            refreshActiveFrames();
        } catch (error) {
            if (opts.navigate !== false) container.innerHTML = renderErrorState('حدث خطأ في تحميل السور. تأكد من اتصالك بالإنترنت.', `openReciterProfile('${jsonFile}')`);
        }
    }, 20);
}

function renderProfileHeader() {
    const lang = document.documentElement.getAttribute('lang') || 'ar';
    const header = document.getElementById('profile-header');
    if (!header || !currentReciter) return;

    const name = lang === 'ar' ? currentReciter.name_ar : currentReciter.name_en;
    const isFav = favorites.some(f => f.id === currentReciter.id);

    header.innerHTML = `
        <div class="relative w-24 h-24 rounded-full overflow-hidden mb-2 shadow-sm border-2 border-surface-container dark:border-slate-700">
            <img class="w-full h-full object-cover" src="${currentReciter.image || 'https://via.placeholder.com/150'}" loading="lazy"/>
        </div>
        <h2 class="font-headline-md text-2xl font-bold text-primary dark:text-emerald-400 text-center rw-name">${name || 'القارئ'}</h2>

        <div class="rw-actions-row">
            ${renderRiwayaSelector()}

            <button onclick="toggleFav('${currentReciter.id}', this)" class="rw-pill rw-fav-pill">
                <span class="material-symbols-outlined" style="font-variation-settings: 'FILL' ${isFav ? 1 : 0};">favorite</span> 
                <span>${i18n[lang].add_fav}</span>
            </button>
        </div>
    `;
}

function renderProfile() {
    const lang = document.documentElement.getAttribute('lang') || 'ar';
    const container = document.getElementById('surahs-container');

    renderProfileHeader();

    container.innerHTML = `
        <div class="relative mb-2">
            <span class="material-symbols-outlined absolute rtl:right-4 ltr:left-4 top-1/2 -translate-y-1/2 text-tertiary dark:text-slate-400">search</span>
            <input id="search-input" class="w-full ltr:pl-12 rtl:pr-12 rtl:pl-4 ltr:pr-4 py-3 bg-surface-container-lowest dark:bg-slate-800 border border-outline-variant dark:border-slate-700 rounded-full focus:outline-none focus:ring-2 focus:ring-primary/20 dark:focus:ring-emerald-400/40 text-sm text-on-surface dark:text-white transition-all shadow-sm" placeholder="${i18n[lang].search_surah}" type="text" oninput="filterSurahs(this.value)"/>
        </div>
        <div id="surahs-list" class="flex flex-col gap-4"></div>
    `;
    
    renderSurahsList(currentReciter.surahs);
}

// ==================== زر اختيار الرواية (حفص / ورش ...) ====================
function renderRiwayaSelector() {
    if (!currentReciter || !currentReciter.riwayat || currentReciter.riwayat.length === 0) return '';
    const lang = document.documentElement.getAttribute('lang') || 'ar';
    const riwayat = currentReciter.riwayat;
    const activeIdx = currentReciter.activeRiwayaIndex || 0;
    const active = riwayat[activeIdx] || riwayat[0];
    const activeName = (lang === 'ar' ? active.name_ar : active.name_en) || active.name_ar || active.name_en || '';

    return `
        <div class="rw-select-wrap">
            <button id="riwaya-selector-btn" onclick="toggleRiwayaMenu(event)" class="rw-pill rw-select-btn">
                <span class="material-symbols-outlined">import_contacts</span>
                <span id="riwaya-selector-label">${activeName}</span>
                <span class="material-symbols-outlined">expand_more</span>
            </button>
            <div id="riwaya-menu" class="rw-menu hidden"></div>
        </div>
    `;
}

function renderRiwayaMenuItems() {
    const menu = document.getElementById('riwaya-menu');
    if (!menu || !currentReciter || !currentReciter.riwayat) return;
    const lang = document.documentElement.getAttribute('lang') || 'ar';
    const activeIdx = currentReciter.activeRiwayaIndex || 0;

    menu.innerHTML = currentReciter.riwayat.map((r, idx) => {
        const name = (lang === 'ar' ? r.name_ar : r.name_en) || r.name_ar || r.name_en || '-';
        const isActive = idx === activeIdx;
        return `
            <button onclick="selectRiwaya(${idx})" class="rw-menu-item${isActive ? ' rw-active' : ''}">
                <span>${name}</span>
                ${isActive ? '<span class="material-symbols-outlined">check</span>' : ''}
            </button>
        `;
    }).join('');
}

function closeRiwayaMenuOnOutsideClick(e) {
    const menu = document.getElementById('riwaya-menu');
    const btn = document.getElementById('riwaya-selector-btn');
    if (!menu || menu.classList.contains('hidden')) return;
    if (menu.contains(e.target) || (btn && btn.contains(e.target))) return;
    menu.classList.add('hidden');
}
document.addEventListener('click', closeRiwayaMenuOnOutsideClick);

function toggleRiwayaMenu(e) {
    if (e) e.stopPropagation();
    const menu = document.getElementById('riwaya-menu');
    if (!menu) return;
    const willShow = menu.classList.contains('hidden');
    if (willShow) renderRiwayaMenuItems();
    menu.classList.toggle('hidden', !willShow);
}

async function selectRiwaya(idx) {
    const menu = document.getElementById('riwaya-menu');
    if (menu) menu.classList.add('hidden');
    if (!currentReciter || !currentReciter.riwayat || idx === currentReciter.activeRiwayaIndex) return;

    const riwaya = currentReciter.riwayat[idx];
    const jsonFile = riwaya.json_file;
    const surahsList = document.getElementById('surahs-list');

    if (reciterDataCache.has(jsonFile)) {
        currentReciter.surahs = reciterDataCache.get(jsonFile);
        currentReciter.activeRiwayaIndex = idx;
        renderProfile();
        refreshActiveFrames();
        return;
    }

    if (surahsList) surahsList.innerHTML = renderLoadingState(i18n[document.documentElement.lang].loading);

    try {
        const response = await fetch(jsonFile);
        if (!response.ok) throw new Error('HTTP ' + response.status);
        let data = await response.json();
        const surahsArray = Array.isArray(data) ? data : data.surahs;
        reciterDataCache.set(jsonFile, surahsArray);
        currentReciter.surahs = surahsArray;
        currentReciter.activeRiwayaIndex = idx;
        renderProfile();
        refreshActiveFrames();
    } catch (error) {
        const container = document.getElementById('surahs-container');
        if (container) container.innerHTML = renderErrorState('حدث خطأ في تحميل سور هذه الرواية. تأكد من اتصالك بالإنترنت.', `selectRiwaya(${idx})`);
    }
}

function filterSurahs(query) {
    if(!currentReciter || !currentReciter.surahs) return;
    const q = query.toLowerCase();
    const filtered = currentReciter.surahs.filter(s => {
        const n_ar = s.name || s.name_ar || "";
        // الاستعانة بالمصفوفة الإنجليزية للبحث
        const englishName = surahNamesEn[s.id - 1] || s.name_en || "";
        return n_ar.toLowerCase().includes(q) || englishName.toLowerCase().includes(q);
    });
    renderSurahsList(filtered);
}

function renderSurahsList(surahs) {
    const lang = document.documentElement.getAttribute('lang') || 'ar';
    const surahsList = document.getElementById('surahs-list');
    surahsList.innerHTML = '';
    
    const reciterName = lang === 'ar' ? currentReciter.name_ar : currentReciter.name_en;

    surahs.forEach(surah => {
        // جلب الاسم الإنجليزي من المصفوفة
        const englishName = surahNamesEn[surah.id - 1] || surah.name_en || surah.name;
        const surahName = lang === 'ar' ? (surah.name_ar || surah.name) : englishName;

        const audioUrl = surah.audio_url || surah.url || '#';
        
        const ayahs = surah.ayahs ? `<span>${surah.ayahs} ${i18n[lang].ayahs}</span> <span class="w-1 h-1 rounded-full bg-outline-variant dark:bg-slate-500"></span>` : '';
        const type = lang === 'ar' ? (surah.type_ar || '') : (surah.type_en || '');
        const detailsHtml = (ayahs || type) ? `<div class="flex items-center gap-1.5 text-xs text-on-surface-variant dark:text-slate-400 w-full px-2">${ayahs} <span>${type}</span></div>` : '';

        const surahIdx = currentReciter.surahs.indexOf(surah);
        surahsList.innerHTML += `
            <div class="reader-frame nav-player cursor-pointer flex items-center justify-between p-4 bg-surface-container-lowest dark:bg-slate-800 rounded-xl shadow-sm border border-surface-container dark:border-slate-700 hover:bg-surface-container dark:hover:bg-slate-700 transition-colors" data-surah-index="${surahIdx}" onclick="playSurahByIndex(${surahIdx})">
                <div class="flex items-center gap-3 sm:gap-4 flex-1">
                    <span class="text-primary dark:text-emerald-400 w-6 text-center font-bold">${surah.id}</span>
                    <span class="font-display-quran text-lg font-bold text-primary dark:text-white shrink-0">${surahName}</span>
                    ${detailsHtml}
                </div>
                <button class="p-2 text-primary dark:text-emerald-400 shrink-0">
                    <span class="material-symbols-outlined rtl:rotate-180">play_arrow</span>
                </button>
            </div>
        `;
    });
    refreshActiveFrames();
}

// ================= Audio Player Logic =================
const audio = document.getElementById('audio-player');
const playPauseBtn = document.getElementById('play-pause-btn');
const bufferSpinner = document.getElementById('buffer-spinner');
const progressTrack = document.getElementById('progress-track');
const progressBar = document.getElementById('progress-bar');
const progressThumb = document.getElementById('progress-thumb');
const currentTimeEl = document.getElementById('current-time');
const totalTimeEl = document.getElementById('total-time');
let isDraggingSeek = false;

// عناصر المشغّل المصغّر
const miniPlayer = document.getElementById('mini-player');
const miniPlayerImg = document.getElementById('mini-player-img');
const miniPlayerSurah = document.getElementById('mini-player-surah');
const miniPlayerReciter = document.getElementById('mini-player-reciter');
const miniPlayPauseBtn = document.getElementById('mini-play-pause-btn');
const miniProgressBar = document.getElementById('mini-progress-bar');
let hasActiveTrack = false;
let currentTrackIndex = -1;
// هوية القارئ/السورة التي تُشغَّل فعلياً حالياً (مستقلة عن currentReciter الذي يتغيّر لمجرد فتح صفحة قارئ)
let activeReciterId = null;
let activeTrackIndex = -1;
// رقم الرواية النشطة حالياً لدى القارئ الذي يتم تشغيله فعلياً (وليس القارئ المفتوح على الشاشة فقط)
let activePlayingRiwayaIndex = 0;

// ==================== تكرار السورة الحالية / التشغيل التلقائي للتالية ====================
let repeatCurrent = false;
let autoPlayEnabled = true;
try { repeatCurrent = localStorage.getItem('wartel_repeat') === '1'; } catch (e) {}
try {
    const savedAutoplay = localStorage.getItem('wartel_autoplay');
    if (savedAutoplay !== null) autoPlayEnabled = savedAutoplay === '1';
} catch (e) {}

function updateRepeatUI() {
    const btn = document.getElementById('repeat-btn');
    const icon = document.getElementById('repeat-icon');
    if (!btn || !icon) return;
    icon.textContent = repeatCurrent ? 'repeat_one' : 'repeat';
    icon.style.fontVariationSettings = `'FILL' ${repeatCurrent ? 1 : 0}`;
    btn.classList.toggle('text-primary', repeatCurrent);
    btn.classList.toggle('dark:text-emerald-400', repeatCurrent);
    btn.classList.toggle('text-on-surface-variant', !repeatCurrent);
    btn.classList.toggle('dark:text-slate-300', !repeatCurrent);
}

function updateAutoplayUI() {
    const btn = document.getElementById('autoplay-btn');
    const icon = document.getElementById('autoplay-icon');
    if (!btn || !icon) return;
    icon.style.fontVariationSettings = `'FILL' ${autoPlayEnabled ? 1 : 0}`;
    btn.classList.toggle('text-primary', autoPlayEnabled);
    btn.classList.toggle('dark:text-emerald-400', autoPlayEnabled);
    btn.classList.toggle('text-on-surface-variant', !autoPlayEnabled);
    btn.classList.toggle('dark:text-slate-300', !autoPlayEnabled);
}

function toggleRepeat() {
    repeatCurrent = !repeatCurrent;
    try { localStorage.setItem('wartel_repeat', repeatCurrent ? '1' : '0'); } catch (e) {}
    updateRepeatUI();
}

function toggleAutoplay() {
    autoPlayEnabled = !autoPlayEnabled;
    try { localStorage.setItem('wartel_autoplay', autoPlayEnabled ? '1' : '0'); } catch (e) {}
    updateAutoplayUI();
}

updateRepeatUI();
updateAutoplayUI();

function updateProgressUI(percent) {
    const clamped = Math.min(100, Math.max(0, percent));
    progressBar.style.width = clamped + '%';
    progressThumb.style.insetInlineStart = clamped + '%';
    miniProgressBar.style.width = clamped + '%';
}

function setPlayIcon(isPlaying) {
    const icon = isPlaying ? 'pause' : 'play_arrow';
    playPauseBtn.textContent = icon;
    miniPlayPauseBtn.textContent = icon;
}

function updateMiniPlayerVisibility() {
    const onPlayerScreen = !document.getElementById('screen-player').classList.contains('screen-hidden');
    miniPlayer.classList.toggle('hidden', !hasActiveTrack || onPlayerScreen);
}

// ==================== إبراز إطار القارئ/السورة النشطة ====================
function isReciterActive(id) {
    return !!(hasActiveTrack && activeReciterId && id && activeReciterId === id);
}
function isSurahActive(idx) {
    // يجب أن تكون قائمة السور المعروضة هي نفسها لقائمة القارئ الذي يشغَّل فعلياً
    return !!(hasActiveTrack && currentReciter && activeReciterId === currentReciter.id && activeTrackIndex === idx);
}
function refreshActiveFrames() {
    document.querySelectorAll('.reader-frame[data-reciter-id]').forEach(el => {
        el.classList.toggle('reader-active', isReciterActive(el.getAttribute('data-reciter-id')));
    });
    document.querySelectorAll('.reader-frame[data-surah-index]').forEach(el => {
        el.classList.toggle('reader-active', isSurahActive(parseInt(el.getAttribute('data-surah-index'), 10)));
    });
}

function playAudio(url, surahName, reciterName, image, opts = {}) {
    hifzMode = null;
    updateHifzBadge();
    document.getElementById('player-surah').textContent = surahName;
    document.getElementById('player-reciter').textContent = reciterName;
    document.getElementById('player-img').src = image || 'https://via.placeholder.com/150';
    miniPlayerImg.src = image || 'https://via.placeholder.com/150';
    miniPlayerSurah.textContent = surahName;
    miniPlayerReciter.textContent = reciterName;
    updateProgressUI(0);
    currentTimeEl.textContent = '0:00';
    totalTimeEl.textContent = '--:--';

    audio.src = url;

    const resumeTime = opts.resumeTime || 0;
    if (resumeTime > 0) {
        const onMeta = () => {
            audio.currentTime = resumeTime;
            audio.removeEventListener('loadedmetadata', onMeta);
        };
        audio.addEventListener('loadedmetadata', onMeta);
    }

    if (opts.autoplay === false) {
        setPlayIcon(false);
    } else {
        audio.play();
        setPlayIcon(true);
    }
    hasActiveTrack = true;
    if (opts.navigate !== false) showScreen('screen-player');
    updateMiniPlayerVisibility();
    refreshActiveFrames();
    saveLastPlayedState();
}

// تشغيل سورة من قائمة القارئ الحالي حسب موضعها، لدعم التالي/السابق
function playSurahByIndex(idx, opts = {}) {
    if (!currentReciter || !currentReciter.surahs || idx < 0 || idx >= currentReciter.surahs.length) return;
    currentTrackIndex = idx;
    activeReciterId = currentReciter.id;
    activeTrackIndex = idx;
    activePlayingRiwayaIndex = currentReciter.activeRiwayaIndex || 0;
    const surah = currentReciter.surahs[idx];
    const lang = document.documentElement.getAttribute('lang') || 'ar';
    
    // جلب الاسم الإنجليزي من المصفوفة
    const englishName = surahNamesEn[surah.id - 1] || surah.name_en || surah.name;
    const surahName = lang === 'ar' ? (surah.name_ar || surah.name) : englishName;

    const audioUrl = surah.audio_url || surah.url || '#';
    const reciterName = lang === 'ar' ? currentReciter.name_ar : currentReciter.name_en;
    playAudio(audioUrl, surahName, reciterName, currentReciter.image, opts);
}

// ==================== استئناف آخر سورة تم الاستماع إليها ====================
const LAST_PLAYED_KEY = 'wartel_last_played';

function saveLastPlayedState() {
    if (!currentReciter || currentTrackIndex < 0) return;
    try {
        localStorage.setItem(LAST_PLAYED_KEY, JSON.stringify({
            reciterJsonFile: currentReciter.mainJsonFile || currentReciter.json_file,
            riwayaIndex: currentReciter.activeRiwayaIndex || 0,
            surahIndex: currentTrackIndex,
            currentTime: audio.currentTime || 0
        }));
    } catch (e) {}
}

async function restoreLastPlayedState() {
    let saved = null;
    try { saved = JSON.parse(localStorage.getItem(LAST_PLAYED_KEY)); } catch (e) { saved = null; }
    if (!saved || !saved.reciterJsonFile) return;

    try {
        await openReciterProfile(saved.reciterJsonFile, { navigate: false });
        if (!currentReciter) return;

        if (saved.riwayaIndex && currentReciter.riwayat && saved.riwayaIndex !== currentReciter.activeRiwayaIndex) {
            await selectRiwaya(saved.riwayaIndex);
        }

        if (currentReciter.surahs && currentReciter.surahs[saved.surahIndex]) {
            playSurahByIndex(saved.surahIndex, { autoplay: false, navigate: false, resumeTime: saved.currentTime || 0 });
        }
    } catch (e) {
        console.log('تعذر استعادة آخر تشغيل', e);
    }
}

// ==================== مؤقت النوم ====================
let sleepTimerHandle = null;
let sleepAtEndOfSurah = false;

function togglePlayerMenu(show) { document.getElementById('player-menu-modal').classList.toggle('hidden', !show); }

function toggleSleepModal(show) {
    document.getElementById('sleep-timer-modal').classList.toggle('hidden', !show);
    if (show) togglePlayerMenu(false);
}

function updateSleepBadge(text) {
    const badge = document.getElementById('sleep-badge');
    if (text) {
        badge.classList.remove('hidden');
        badge.querySelector('span').textContent = '🌙 ' + text;
    } else {
        badge.classList.add('hidden');
    }
}

function setSleepTimer(option) {
    clearTimeout(sleepTimerHandle);
    sleepAtEndOfSurah = false;
    if (option === 'off') { updateSleepBadge(null); toggleSleepModal(false); return; }
    if (option === 'end') { sleepAtEndOfSurah = true; updateSleepBadge('حتى نهاية السورة'); toggleSleepModal(false); return; }
    const minutes = parseInt(option);
    sleepTimerHandle = setTimeout(() => {
        audio.pause();
        setPlayIcon(false);
        updateSleepBadge(null);
    }, minutes * 60000);
    updateSleepBadge(minutes + ' دقيقة');
    toggleSleepModal(false);
}

// ==================== وضع الحفظ (تكرار مقطع) ====================
let hifzMode = null;
let hifzStartSeconds = 0;
let hifzEndSeconds = 0;

function toggleHifzModal(show) {
    document.getElementById('hifz-modal').classList.toggle('hidden', !show);
    if (show) togglePlayerMenu(false);
}

function setHifzStart() {
    hifzStartSeconds = audio.currentTime;
    document.getElementById('hifz-start-input').value = formatTime(hifzStartSeconds);
}

function setHifzEnd() {
    hifzEndSeconds = audio.currentTime;
    document.getElementById('hifz-end-input').value = formatTime(hifzEndSeconds);
}

function updateHifzBadge() {
    const badge = document.getElementById('hifz-badge');
    if (hifzMode) {
        badge.classList.remove('hidden');
        badge.querySelector('span').textContent = `الحفظ: تكرار ${hifzMode.currentRep + 1}/${hifzMode.totalReps}`;
    } else {
        badge.classList.add('hidden');
    }
}

function startHifzMode() {
    const reps = parseInt(document.getElementById('hifz-reps-input').value) || 5;
    if (hifzEndSeconds <= hifzStartSeconds) { alert('حدد نقطة نهاية بعد نقطة البداية أولاً (استمع للمقطع ثم اضغط تعيين البداية/النهاية).'); return; }
    hifzMode = { start: hifzStartSeconds, end: hifzEndSeconds, totalReps: reps, currentRep: 0 };
    audio.currentTime = hifzMode.start;
    audio.play();
    setPlayIcon(true);
    updateHifzBadge();
    toggleHifzModal(false);
}

function stopHifzMode() {
    hifzMode = null;
    updateHifzBadge();
}

function playNext() {
    if (currentTrackIndex === -1 || !currentReciter) return;
    playSurahByIndex(currentTrackIndex + 1);
}

function playPrev() {
    if (currentTrackIndex === -1 || !currentReciter) return;
    playSurahByIndex(currentTrackIndex - 1);
}

function togglePlay() {
    if (audio.paused) { audio.play(); setPlayIcon(true); } 
    else { audio.pause(); setPlayIcon(false); }
}

let lastSaveTime = 0;
audio.addEventListener('timeupdate', () => {
    if(audio.duration && !isDraggingSeek) {
        const progress = (audio.currentTime / audio.duration) * 100;
        updateProgressUI(progress);
        currentTimeEl.textContent = formatTime(audio.currentTime);
    }
    if (hifzMode && audio.currentTime >= hifzMode.end) {
        hifzMode.currentRep++;
        if (hifzMode.currentRep >= hifzMode.totalReps) {
            stopHifzMode();
        } else {
            audio.currentTime = hifzMode.start;
            updateHifzBadge();
        }
    }
    // حفظ دوري لموضع التشغيل (كل 5 ثوانٍ تقريباً) لاستئنافه لاحقاً
    if (audio.currentTime - lastSaveTime > 5) {
        lastSaveTime = audio.currentTime;
        saveLastPlayedState();
    }
});

audio.addEventListener('pause', saveLastPlayedState);

audio.addEventListener('loadedmetadata', () => { totalTimeEl.textContent = formatTime(audio.duration); });
audio.addEventListener('ended', () => {
    if (sleepAtEndOfSurah) {
        sleepAtEndOfSurah = false;
        updateSleepBadge(null);
        setPlayIcon(false);
        updateProgressUI(0);
        currentTimeEl.textContent = '0:00';
        return;
    }
    // تكرار السورة الحالية إن كان مفعّلاً
    if (repeatCurrent) {
        audio.currentTime = 0;
        audio.play();
        return;
    }
    // الانتقال التلقائي للسورة التالية إن وُجدت وكان التشغيل التلقائي مفعّلاً
    if (autoPlayEnabled && currentReciter && currentReciter.surahs && currentTrackIndex + 1 < currentReciter.surahs.length) {
        playNext();
    } else {
        setPlayIcon(false);
        updateProgressUI(0);
        currentTimeEl.textContent = '0:00';
    }
});
window.addEventListener('beforeunload', saveLastPlayedState);
audio.addEventListener('waiting', () => { bufferSpinner.classList.remove('hidden'); playPauseBtn.classList.add('opacity-0'); });
audio.addEventListener('playing', () => { bufferSpinner.classList.add('hidden'); playPauseBtn.classList.remove('opacity-0'); });
audio.addEventListener('canplay', () => { bufferSpinner.classList.add('hidden'); playPauseBtn.classList.remove('opacity-0'); });

const progressContainer = document.getElementById('progress-container');

function ratioFromPointer(clientX) {
    const rect = progressTrack.getBoundingClientRect();
    let ratio = (clientX - rect.left) / rect.width;
    if (document.documentElement.dir === 'rtl') ratio = 1 - ratio;
    return Math.min(1, Math.max(0, ratio));
}

progressContainer.addEventListener('pointerdown', (e) => {
    if (!audio.duration) return;
    isDraggingSeek = true;
    progressContainer.setPointerCapture(e.pointerId);
    progressContainer.classList.add('dragging'); // إيقاف التحريك السلس أثناء السحب لتجنب التأخير
    const ratio = ratioFromPointer(e.clientX);
    updateProgressUI(ratio * 100);
});

progressContainer.addEventListener('pointermove', (e) => {
    if (!isDraggingSeek) return;
    const ratio = ratioFromPointer(e.clientX);
    updateProgressUI(ratio * 100);
    currentTimeEl.textContent = formatTime(ratio * (audio.duration || 0));
});

function endDrag(e) {
    if (!isDraggingSeek) return;
    isDraggingSeek = false;
    progressContainer.releasePointerCapture(e.pointerId);
    progressContainer.classList.remove('dragging'); // إعادة التحريك السلس
    const ratio = ratioFromPointer(e.clientX);
    if (audio.duration) {
        audio.currentTime = ratio * audio.duration;
    }
}

progressContainer.addEventListener('pointerup', endDrag);
progressContainer.addEventListener('pointercancel', (e) => { 
    isDraggingSeek = false; 
    progressContainer.classList.remove('dragging');
    progressContainer.releasePointerCapture(e.pointerId);
});

function formatTime(seconds) {
    const min = Math.floor(seconds / 60); const sec = Math.floor(seconds % 60);
    return `${min}:${sec < 10 ? '0' : ''}${sec}`;
}
// ======================================================

function toggleFav(id, btn) {
    const index = favorites.findIndex(f => f.id === id);
    const icon = btn.querySelector('.material-symbols-outlined');
    if (index === -1) {
        const reciter = allReciters.find(r => r.id === id) || {id: id, name_ar: currentReciter.name_ar, name_en: currentReciter.name_en, image: currentReciter.image, json_file: `${id}.json`};
        favorites.push(reciter);
        icon.style.fontVariationSettings = "'FILL' 1";
        if(icon.textContent === 'favorite_border') icon.textContent = 'favorite';
    } else {
        favorites.splice(index, 1);
        icon.style.fontVariationSettings = "'FILL' 0";
        if(icon.textContent === 'favorite') icon.textContent = 'favorite_border';
    }
    saveFavorites();
    renderFavs();
}

function renderFavs() {
    const container = document.getElementById('favorites-container');
    const lang = document.documentElement.lang || 'ar';
    if (favorites.length === 0) {
        container.innerHTML = `<div class="mt-20 text-center"><span class="material-symbols-outlined text-6xl text-gray-400 mb-4">bookmark_border</span><p class="text-gray-500">${i18n[lang].no_favorites}</p></div>`;
    } else {
        container.innerHTML = '<div class="w-full space-y-4"></div>';
        const list = container.querySelector('div');
        favorites.forEach(fav => {
            const name = lang === 'ar' ? fav.name_ar : fav.name_en;
            list.innerHTML += `
                <div class="bg-surface-container-lowest dark:bg-slate-800 rounded-xl p-3 flex items-center justify-between shadow-sm border border-surface-container-high/50 dark:border-slate-700 cursor-pointer" onclick="openReciterProfile('${fav.json_file}')">
                    <div class="flex items-center gap-4">
                        <div class="w-14 h-14 rounded-full bg-cover bg-center shrink-0 shadow-sm border border-outline-variant/20 dark:border-slate-600" style="background-image: url('${fav.image || 'https://via.placeholder.com/150'}')"></div>
                        <h4 class="font-bold text-on-surface dark:text-white text-start">${name}</h4>
                    </div>
                    <button class="text-primary dark:text-emerald-400 p-2" onclick="event.stopPropagation(); toggleFav('${fav.id}', this)"><span class="material-symbols-outlined" style="font-variation-settings: 'FILL' 1;">favorite</span></button>
                </div>
            `;
        });
    }
}

function setLanguage(lang) {
    const html = document.documentElement;
    html.setAttribute('lang', lang);
    html.setAttribute('dir', lang === 'ar' ? 'rtl' : 'ltr');
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (i18n[lang][key]) el.textContent = i18n[lang][key];
    });
    document.querySelectorAll('[data-i18n-ph]').forEach(el => {
        const key = el.getAttribute('data-i18n-ph');
        if (i18n[lang][key]) el.setAttribute('placeholder', i18n[lang][key]);
    });
    
    renderFeaturedReciter(lang);
    renderRecitersList();
    renderFavs();
    if(currentReciter) renderProfile();
    toggleLangModal(false);
}

function toggleLangModal(show) { document.getElementById('lang-modal').classList.toggle('hidden', !show); }
function toggleDarkMode() {
    document.documentElement.classList.toggle('dark');
    const isDark = document.documentElement.classList.contains('dark');
    try { localStorage.setItem('wartel_theme', isDark ? 'dark' : 'light'); } catch (e) {}
}

function showScreen(screenId, push = true) {
    ['screen-home', 'screen-profile', 'screen-player', 'screen-favorites', 'screen-settings'].forEach(id => {
        document.getElementById(id).classList.add('screen-hidden');
        if(id === 'screen-player') document.getElementById(id).classList.remove('flex');
    });
    document.getElementById(screenId).classList.remove('screen-hidden');
    if(screenId === 'screen-player') document.getElementById(screenId).classList.add('flex');
    window.scrollTo(0, 0);
    document.getElementById(screenId).scrollTop = 0;
    
    document.querySelectorAll('#bottom-nav button').forEach(btn => {
        btn.classList.replace('text-on-secondary-container', 'text-on-surface-variant');
        btn.classList.replace('dark:text-emerald-400', 'dark:text-slate-400');
        btn.classList.remove('bg-secondary-container', 'dark:bg-emerald-400/20', 'rounded-2xl', 'shadow-sm');
        btn.querySelector('span').style.fontVariationSettings = "'FILL' 0";
    });
    
    let btnId = screenId.replace('screen-', 'nav-btn-');
    if(screenId === 'screen-profile') btnId = 'nav-btn-home';
    const activeBtn = document.getElementById(btnId);
    if(activeBtn) {
        activeBtn.classList.replace('text-on-surface-variant', 'text-on-secondary-container');
        activeBtn.classList.replace('dark:text-slate-400', 'dark:text-emerald-400');
        activeBtn.classList.add('bg-secondary-container', 'dark:bg-emerald-400/20', 'rounded-2xl', 'shadow-sm');
        activeBtn.querySelector('span').style.fontVariationSettings = "'FILL' 1";
    }
    if (push) history.pushState({ screen: screenId }, "", "#" + screenId.replace('screen-', ''));
    updateMiniPlayerVisibility();
}

window.addEventListener('popstate', (e) => {
    if (e.state && e.state.screen) showScreen(e.state.screen, false);
    else showScreen('screen-home', false);
});

document.querySelectorAll('.nav-home').forEach(btn => btn.addEventListener('click', () => showScreen('screen-home')));
document.querySelectorAll('.nav-favorites').forEach(btn => btn.addEventListener('click', () => showScreen('screen-favorites')));
document.querySelectorAll('.nav-settings').forEach(btn => btn.addEventListener('click', () => showScreen('screen-settings')));
document.querySelectorAll('.nav-player').forEach(btn => btn.addEventListener('click', () => showScreen('screen-player')));

fetchSettings().then(() => {
    fetchReciters().then(() => {
        // استعادة آخر سورة كان المستخدم يستمع إليها، مع الحفاظ على حالتها (دون تشغيل تلقائي)
        restoreLastPlayedState();
    });
    history.replaceState({ screen: 'screen-home' }, "", "#home");
    showScreen('screen-home', false);
});