// ============================================
// SMAN 68 JAKARTA — PREMIUM JS v4.0
// Luxury Modern Education Website 2026
// ============================================

// ============================================
// FIREBASE CONFIGURATION
// ============================================
const firebaseConfig = {
    apiKey: "AIzaSyDAcKcg3alPOTH3FFGelYmsW7jcMMe2PLI",
    authDomain: "upnvjdatsystem.firebaseapp.com",
    databaseURL: "https://upnvjdatsystem-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "upnvjdatsystem",
    storageBucket: "upnvjdatsystem.firebasestorage.app",
    messagingSenderId: "57095309946",
    appId: "1:57095309946:web:b0e9f3f86380d549ffc9c3"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// ============================================
// GLOBAL STATE
// ============================================
let player;
let isMuted = true;
let chatSession = null;
let currentUser = null;
let chatEnded = false;
let isChatOnline = true;
let lastScrollY = 0;
let ticking = false;
let countersDone = false;

// ============================================
// PTN DATA
// ============================================
const ptnList = [
    { name: 'UI',      fullName: 'Universitas Indonesia',             logo: 'https://fia.ui.ac.id/wp-content/uploads/182/2018/01/logo-UI.png' },
    { name: 'UGM',     fullName: 'Universitas Gadjah Mada',           logo: 'https://upload.wikimedia.org/wikipedia/id/thumb/9/9f/Emblem_of_Universitas_Gadjah_Mada.svg/1280px-Emblem_of_Universitas_Gadjah_Mada.svg.png' },
    { name: 'ITB',     fullName: 'Institut Teknologi Bandung',        logo: 'https://upload.wikimedia.org/wikipedia/id/9/95/Logo_Institut_Teknologi_Bandung.png' },
    { name: 'UNAIR',   fullName: 'Universitas Airlangga',             logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/65/Logo-Branding-UNAIR-biru.png/500px-Logo-Branding-UNAIR-biru.png' },
    { name: 'IPB',     fullName: 'Institut Pertanian Bogor',          logo: 'https://www.ipb.ac.id/wp-content/uploads/2023/12/Logo-IPB-University_Vertical.png' },
    { name: 'UNDIP',   fullName: 'Universitas Diponegoro',            logo: 'https://upload.wikimedia.org/wikipedia/id/2/20/Logo_Universitas_Diponegoro.png' },
    { name: 'UNPAD',   fullName: 'Universitas Padjadjaran',           logo: 'https://www.unpad.ac.id/wp-content/uploads/2018/04/logo-unpad1.png' },
    { name: 'UB',      fullName: 'Universitas Brawijaya',             logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/bb/Logo_Universitas_Brawijaya.svg/960px-Logo_Universitas_Brawijaya.svg.png' },
    { name: 'ITS',     fullName: 'Institut Teknologi Sepuluh Nopember', logo: 'https://upload.wikimedia.org/wikipedia/id/c/c4/Badge_ITS.png' },
    { name: 'UNJ',     fullName: 'Universitas Negeri Jakarta',        logo: 'https://unj.ac.id/wp-content/uploads/2025/02/UNJ-LOGO-512-PX-1.png' },
    { name: 'UPNVJ',   fullName: 'UPN Veteran Jakarta',               logo: 'https://www.upnvj.ac.id/id/files/large/89f8a80e388ced3704b091e21f510755' },
    { name: 'UNAND',   fullName: 'Universitas Andalas',               logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/01/Logo_Unand.svg/1280px-Logo_Unand.svg.png' },
    { name: 'UNHAS',   fullName: 'Universitas Hasanuddin',            logo: 'https://upload.wikimedia.org/wikipedia/commons/b/bd/Logo-Resmi-Unhas-1.png' },
    { name: 'UPNVYK',  fullName: 'UPN Veteran Yogyakarta',            logo: 'https://kompaspedia.kompas.id/wp-content/uploads/2020/08/logo_Universitas-Pembangunan-Nasional-Veteran-Yogyakarta.png' },
    { name: 'PNJ',     fullName: 'Politeknik Negeri Jakarta',         logo: 'https://upload.wikimedia.org/wikipedia/id/1/16/Logo_Politeknik_Negeri_Jakarta.jpg' },
    { name: 'MONASH',  fullName: 'Monash University',                 logo: 'https://brandlogos.net/wp-content/uploads/2024/06/monash_university-logo_brandlogos.net_bzf0m.png' },
    { name: 'UT',      fullName: 'University of Toronto',             logo: 'https://download.logo.wine/logo/University_of_Toronto/University_of_Toronto-Logo.wine.png' },
    { name: 'UWA',     fullName: 'The University of Western Australia', logo: 'https://www.freelogovectors.net/wp-content/uploads/2021/04/university-of-western-australia-logo-freelogovectors.net_.png' }
];

const defaultAlumniData = {
    'UI': 2450, 'UGM': 1850, 'ITB': 1650, 'UNAIR': 1420, 'IPB': 1350,
    'UNDIP': 1280, 'UNPAD': 1150, 'UB': 980, 'ITS': 890, 'UNJ': 750,
    'UPNVJ': 520, 'UNAND': 310, 'UNHAS': 280, 'UPNVYK': 220, 'PNJ': 190,
    'MONASH': 1, 'UT': 2, 'UWA': 1
};

// ============================================
// LINK URLS
// ============================================
const linkUrls = {
    loginSiswa:          './portal-siswa-68.html',
    loginGuru:           'portal-guru.html',
    ppdb:                'https://spmb.jakarta.go.id/',
    virsch:              './virsch-68.html',
    penmurmut:           './hasil-pengumuman-penmurmut-2026.html',
    pemeringkatan:       './pemeringkatan-ptn-indonesia-2026.html',
    topJurusan:          './jurusan-kuliah-terbaik-2026.html',
    kelulusan:           './pusat-layanan.sman68jkt.html',
    hukum:               './hukum.html',
    sertifikatAkreditasi:'https://smanegeri68jakarta.vercel.app/pdf files/Sertifikat Akreditasi SMAN 68 Jakarta.pdf'
};

// ============================================
// DOM CACHE
// ============================================
const $ = id => document.getElementById(id);
const $$ = sel => document.querySelectorAll(sel);

// ============================================
// PRELOADER CINEMATIC
// ============================================
function initPreloader() {
    const preloader  = $('preloader');
    const bar        = $('preloaderProgress');
    const percent    = $('preloaderPercent');
    const particles  = $('preloaderParticles');

    // Spawn particles
    if (particles) {
        for (let i = 0; i < 20; i++) {
            const p = document.createElement('div');
            p.style.cssText = `
                position:absolute;
                width:${2 + Math.random()*4}px;
                height:${2 + Math.random()*4}px;
                border-radius:50%;
                background:rgba(52,211,153,${0.2 + Math.random()*0.4});
                left:${Math.random()*100}%;
                animation: float ${4 + Math.random()*6}s linear ${Math.random()*4}s infinite;
            `;
            particles.appendChild(p);
        }
    }

    // Animate progress bar
    let prog = 0;
    const interval = setInterval(() => {
        prog += Math.random() * 18;
        if (prog > 100) prog = 100;
        if (bar)     bar.style.width = prog + '%';
        if (percent) percent.textContent = Math.round(prog) + '%';
        if (prog >= 100) {
            clearInterval(interval);
            setTimeout(() => {
                preloader?.classList.add('hide');
                setTimeout(() => {
                    if (preloader) preloader.style.display = 'none';
                }, 700);
            }, 300);
        }
    }, 80);
}

// ============================================
// CUSTOM CURSOR
// ============================================
function initCursor() {
    const dot  = $('cursorDot');
    const ring = $('cursorRing');
    if (!dot || !ring || window.matchMedia('(max-width:768px)').matches) return;

    let mouseX = 0, mouseY = 0;
    let ringX = 0, ringY = 0;
    let cursorMoving = false, cursorRAF = null;

    document.addEventListener('mousemove', e => {
        mouseX = e.clientX;
        mouseY = e.clientY;
        dot.style.left  = mouseX + 'px';
        dot.style.top   = mouseY + 'px';
        if (!cursorMoving) {
            cursorMoving = true;
            animateRing();
        }
    }, { passive: true });

    // Smooth ring follow — only runs while mouse is moving
    function animateRing() {
        const dx = mouseX - ringX;
        const dy = mouseY - ringY;
        ringX += dx * 0.12;
        ringY += dy * 0.12;
        ring.style.left = ringX + 'px';
        ring.style.top  = ringY + 'px';
        if (Math.abs(dx) > 0.5 || Math.abs(dy) > 0.5) {
            cursorRAF = requestAnimationFrame(animateRing);
        } else {
            cursorMoving = false;
        }
    }

    // Hover effects
    document.addEventListener('mouseover', e => {
        const target = e.target.closest('a, button, .ptn-card, .news-card, .gallery-item, .bento-card');
        if (target) {
            dot.style.transform  = 'translate(-50%,-50%) scale(2)';
            ring.style.width     = '56px';
            ring.style.height    = '56px';
            ring.style.opacity   = '0.3';
        }
    });
    document.addEventListener('mouseout', () => {
        dot.style.transform  = 'translate(-50%,-50%) scale(1)';
        ring.style.width     = '36px';
        ring.style.height    = '36px';
        ring.style.opacity   = '0.5';
    });
}

// ============================================
// SCROLL PROGRESS BAR
// ============================================
function initScrollProgress() {
    const bar = $('scrollProgress');
    if (!bar) return;

    window.addEventListener('scroll', () => {
        const scrollTop  = window.scrollY;
        const docHeight  = document.documentElement.scrollHeight - window.innerHeight;
        const pct        = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
        bar.style.width  = pct + '%';
    }, { passive: true });
}

// ============================================
// DIGITAL CLOCK (TOP BAR)
// ============================================
function initClock() {
    const el = $('clockDisplay');
    if (!el) return;

    function update() {
        const now  = new Date();
        const pad  = n => String(n).padStart(2, '0');
        el.textContent = `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())} WIB`;
    }
    update();
    setInterval(update, 1000);
}

// ============================================
// THEME TOGGLE (DARK / LIGHT)
// ============================================
function initThemeToggle() {
    const btn  = $('themeToggle');
    const icon = $('themeIcon');
    const html = document.documentElement;

    // Restore saved preference
    const saved = localStorage.getItem('sman68-theme') || 'light';
    html.setAttribute('data-theme', saved);
    if (icon) icon.className = saved === 'dark' ? 'fas fa-sun' : 'fas fa-moon';

    btn?.addEventListener('click', () => {
        const current = html.getAttribute('data-theme');
        const next    = current === 'dark' ? 'light' : 'dark';
        html.setAttribute('data-theme', next);
        localStorage.setItem('sman68-theme', next);
        if (icon) icon.className = next === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
    });
}

// ============================================
// NAVBAR — SMART HIDE / SHOW + ACTIVE LINK
// ============================================
function initNavbar() {
    const navbar  = $('navbar');
    const toggle  = $('navToggle');
    const menu    = $('navMenu');
    const links   = $$('.nav-link');

    // Mobile toggle
    toggle?.addEventListener('click', () => {
        toggle.classList.toggle('active');
        menu?.classList.toggle('active');
    });

    // Close on link click
    links.forEach(link => {
        link.addEventListener('click', () => {
            toggle?.classList.remove('active');
            menu?.classList.remove('active');
        });
    });

    // Smart hide/show on scroll
    window.addEventListener('scroll', () => {
        const current = window.scrollY;

        if (!ticking) {
            requestAnimationFrame(() => {
                if (navbar) {
                    if (current > 100) {
                        navbar.classList.add('scrolled');
                    } else {
                        navbar.classList.remove('scrolled');
                    }
                    // Hide on scroll down, show on scroll up
                    if (current > lastScrollY && current > 300) {
                        navbar.classList.add('hide-nav');
                    } else {
                        navbar.classList.remove('hide-nav');
                    }
                }
                lastScrollY = current;
                ticking = false;
            });
            ticking = true;
        }
    }, { passive: true });

    // Active nav on scroll via IntersectionObserver
    const sections = $$('section[id]');
    const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const id = entry.target.getAttribute('id');
                links.forEach(link => {
                    link.classList.toggle('active', link.getAttribute('href') === `#${id}`);
                });
                // Update mobile bottom nav
                $$('.mob-nav-item').forEach(item => {
                    item.classList.toggle('active', item.getAttribute('data-section') === id);
                });
            }
        });
    }, { rootMargin: '-40% 0px -55% 0px' });

    sections.forEach(s => observer.observe(s));
}

// ============================================
// SMOOTH SCROLL
// ============================================
function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', e => {
            const href = anchor.getAttribute('href');
            if (href === '#') return;
            const target = document.querySelector(href);
            if (!target) return;
            e.preventDefault();
            scrollToSection(target);
        });
    });
}

// Fungsi terpusat: hitung offset akurat lalu scroll
function scrollToSection(el) {
    const style  = getComputedStyle(document.documentElement);
    const navH   = parseInt(style.getPropertyValue('--navbar-h')) || 72;

    // Top bar hanya ada di desktop; cek apakah benar-benar tampil
    const topBar = document.getElementById('topBar');
    const topH   = (topBar && topBar.offsetHeight > 0)
                   ? (parseInt(style.getPropertyValue('--topbar-h')) || 40)
                   : 0;

    const extraPad = 16;
    const offset   = navH + topH + extraPad;

    // Gunakan getBoundingClientRect agar akurat meski halaman baru dibuka
    const y = el.getBoundingClientRect().top + window.pageYOffset - offset;
    window.scrollTo({ top: Math.max(0, y), behavior: 'smooth' });
}

// ============================================
// HERO PARTICLES
// ============================================
function initHeroParticles() {
    const container = $('heroParticles');
    if (!container) return;

    const count = window.innerWidth < 768 ? 6 : 15;
    for (let i = 0; i < count; i++) {
        const p = document.createElement('div');
        p.className = 'hero-particle';
        const size  = 2 + Math.random() * 5;
        const dur   = 8 + Math.random() * 14;
        const delay = Math.random() * 10;
        const left  = Math.random() * 100;
        p.style.cssText = `
            width:${size}px; height:${size}px;
            left:${left}%;
            animation-duration:${dur}s;
            animation-delay:${delay}s;
            background:rgba(255,255,255,${0.15 + Math.random()*0.35});
        `;
        container.appendChild(p);
    }
}

// ============================================
// YOUTUBE PLAYER (BG VIDEO SLIDER)
// ============================================
const videoList = [
    'hDZ3-jZ4Rnw',
    'cBbahZk3mMc',
    '9D_JcXY4Sr8'
];
let currentVideoIndex = 0;

function onYouTubeIframeAPIReady() {
    const wrapper = document.getElementById('youtubePlayer');
    if (!wrapper) return;

    // Build iframe inside the wrapper
    wrapper.innerHTML = `<iframe
        id="ytIframe"
        src="https://www.youtube.com/embed/${videoList[0]}?autoplay=1&mute=1&controls=0&loop=0&playlist=${videoList.join(',')}&modestbranding=1&rel=0&showinfo=0&iv_load_policy=3&enablejsapi=1"
        allow="autoplay; encrypted-media"
        allowfullscreen
        style="position:absolute;top:50%;left:50%;width:177.78vh;height:56.25vw;min-width:100vw;min-height:100vh;transform:translate(-50%,-50%);pointer-events:none;border:none;">
    </iframe>`;

    player = new YT.Player('ytIframe', {
        events: {
            onReady: e => e.target.playVideo(),
            onStateChange: e => {
                if (e.data === YT.PlayerState.ENDED) {
                    currentVideoIndex = (currentVideoIndex + 1) % videoList.length;
                    e.target.loadVideoById(videoList[currentVideoIndex]);
                    e.target.playVideo();
                }
            }
        }
    });
}

// Load YouTube API
(function loadYTAPI() {
    const tag = document.createElement('script');
    tag.src   = 'https://www.youtube.com/iframe_api';
    document.head.appendChild(tag);
})();

// ============================================
// SOUND TOGGLE
// ============================================
function initSoundToggle() {
    const btn  = $('soundToggle');
    const icon = $('soundIcon');
    if (!btn) return;

    btn.addEventListener('click', () => {
        if (!player || typeof player.isMuted !== 'function') return;
        if (isMuted) {
            player.unMute();
            player.setVolume(40);
            if (icon) icon.className = 'fas fa-volume-up';
        } else {
            player.mute();
            if (icon) icon.className = 'fas fa-volume-mute';
        }
        isMuted = !isMuted;
    });
}

// ============================================
// HERO COUNTER ANIMATION
// ============================================
function initCounterAnimation() {
    const counters = $$('.counter[data-target]');
    if (!counters.length) return;

    const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting && !countersDone) {
                countersDone = true;
                counters.forEach(el => {
                    const target   = parseInt(el.dataset.target);
                    const duration = 2000;
                    const step     = target / (duration / 16);
                    let current    = 0;

                    const timer = setInterval(() => {
                        current += step;
                        if (current >= target) {
                            current = target;
                            clearInterval(timer);
                        }
                        el.textContent = Math.floor(current).toLocaleString('id-ID');
                    }, 16);
                });
            }
        });
    }, { threshold: 0.3 });

    if (counters[0]) observer.observe(counters[0].closest('.hero-stats') || counters[0]);
}

// ============================================
// FLOATING QUICK ACCESS (FAB)
// ============================================
function initFloatingFab() {
    const fab    = $('floatingFab');
    const toggle = $('fabToggle');
    const icon   = $('fabIcon');
    const items  = $('fabItems');

    toggle?.addEventListener('click', e => {
        e.stopPropagation();
        fab?.classList.toggle('active');
        if (icon) {
            icon.className = fab?.classList.contains('active') ? 'fas fa-times' : 'fas fa-grip';
        }
    });

    document.addEventListener('click', () => {
        fab?.classList.remove('active');
        if (icon) icon.className = 'fas fa-grip';
    });

    items?.addEventListener('click', e => e.stopPropagation());
}

// ============================================
// LINK ROUTER
// ============================================
function initLinks() {
    const map = {
        topLoginSiswa:       'loginSiswa',
        topLoginGuru:        'loginGuru',
        topPPDB:             'ppdb',
        topVirsch:           'virsch',
        topPenmurmut:        'penmurmut',
        floatLoginSiswa:     'loginSiswa',
        floatLoginGuru:      'loginGuru',
        floatPPDB:           'ppdb',
        floatVirsch:         'virsch',
        floatPenmurmut:      'penmurmut',
        floatPemeringkatan:  'pemeringkatan',
        footerLoginSiswa:    'loginSiswa',
        footerLoginGuru:     'loginGuru',
        footerVirsch:        'virsch',
        footerHukum:         'hukum',
        btnPemeringkatan:    'pemeringkatan',
        btnTopJurusan:       'topJurusan',
        navKelulusan:        'kelulusan',
        heroPPDB:            'ppdb',
        btnUnduhSertifikat:  'sertifikatAkreditasi'
    };

    Object.entries(map).forEach(([id, key]) => {
        const el = $(id);
        if (el) {
            el.addEventListener('click', e => {
                e.preventDefault();
                if (linkUrls[key]) window.open(linkUrls[key], '_blank');
            });
        }
    });
}

// ============================================
// KELULUSAN LINK — TIME-LOCKED
// ============================================
function initKelulusanLink() {
    const target = new Date('2026-05-24T15:00:00+07:00');
    const now    = new Date();
    const el     = $('navKelulusan');
    if (!el) return;

    if (now >= target) {
        el.classList.remove('nav-disabled', 'nav-special');
        el.textContent   = 'Pusat Layanan';
        el.style.cssText = 'pointer-events:auto;opacity:1;cursor:pointer;';
    }
}

// ============================================
// PTN GRID RENDER
// ============================================
function initPTNGrid() {
    const grid = $('ptnGrid');
    if (!grid) return;

    grid.innerHTML = '';
    ptnList.forEach(ptn => {
        const card = document.createElement('div');
        card.className = 'ptn-card';
        card.innerHTML = `
            <img src="${ptn.logo}" alt="${ptn.name}" loading="lazy" onerror="this.src='https://upload.wikimedia.org/wikipedia/id/1/19/Logo_SMAN_68_Jakarta.png'">
            <h4>${ptn.fullName}</h4>
            <div class="ptn-count" id="count-${ptn.name}">0</div>
        `;
        grid.appendChild(card);
    });
}

// ============================================
// YEAR SELECT POPULATE
// ============================================
function populateYearSelect() {
    const sel = $('yearSelect');
    if (!sel) return;

    const year = new Date().getFullYear();
    for (let y = 2011; y <= year; y++) {
        const opt   = document.createElement('option');
        opt.value   = y;
        opt.textContent = y;
        sel.appendChild(opt);
    }
    sel.addEventListener('change', loadPTNData);
}

// ============================================
// LOAD PTN DATA
// ============================================
async function loadPTNData() {
    const sel  = $('yearSelect');
    const year = sel?.value || 'all';

    try {
        let query = db.collection('alumni');
        if (year !== 'all') query = query.where('year', '==', parseInt(year));
        const snap = await query.get();
        const counts = {};

        if (!snap.empty) {
            snap.forEach(doc => {
                const d = doc.data();
                counts[d.ptn] = (counts[d.ptn] || 0) + 1;
            });
        }

        ptnList.forEach(ptn => {
            const el = $(`count-${ptn.name}`);
            if (!el) return;
            const val = counts[ptn.name] ?? defaultAlumniData[ptn.name] ?? 0;
            animateCount(el, val);
        });
    } catch {
        ptnList.forEach(ptn => {
            const el = $(`count-${ptn.name}`);
            if (el) animateCount(el, defaultAlumniData[ptn.name] || 0);
        });
    }
}

function animateCount(el, target) {
    const duration = 1200;
    const step     = target / (duration / 16);
    let current    = 0;

    const timer = setInterval(() => {
        current += step;
        if (current >= target) { current = target; clearInterval(timer); }
        el.textContent = Math.floor(current).toLocaleString('id-ID');
    }, 16);
}

// ============================================
// LOAD NEWS — WITH PAGINATION
// ============================================
const NEWS_PER_PAGE  = 9;
let   newsLastDoc    = null;   // dokumen terakhir yang dimuat
let   newsAllLoaded  = false;  // sudah habis semua?
let   newsLoading    = false;  // sedang fetch?

async function loadNewsData() {
    // Reset state saat realtime listener trigger ulang
    const grid = $('newsGrid');
    if (!grid) return;

    newsLastDoc   = null;
    newsAllLoaded = false;
    grid.innerHTML = '';
    updateLoadMoreBtn(false);

    try {
        const snap = await db.collection('news')
            .orderBy('date', 'desc')
            .limit(NEWS_PER_PAGE)
            .get();

        if (snap.empty) {
            grid.innerHTML = buildEmptyState('newspaper', 'Belum ada berita tersedia');
            hideLoadMore();
            return;
        }

        snap.forEach(doc => grid.appendChild(createNewsCard(doc.id, doc.data())));
        newsLastDoc = snap.docs[snap.docs.length - 1];

        // Jika hasil < limit, berarti sudah habis
        if (snap.docs.length < NEWS_PER_PAGE) {
            markAllLoaded();
        }
    } catch {
        grid.innerHTML = buildEmptyState('exclamation-circle', 'Gagal memuat berita');
        hideLoadMore();
    }
}

async function loadMoreNews() {
    if (newsAllLoaded || newsLoading || !newsLastDoc) return;
    newsLoading = true;

    const btn  = $('btnLoadMore');
    const hint = $('loadMoreHint');
    if (btn) {
        btn.classList.add('loading');
        btn.querySelector('span').textContent = 'Memuat...';
    }

    try {
        const snap = await db.collection('news')
            .orderBy('date', 'desc')
            .startAfter(newsLastDoc)
            .limit(NEWS_PER_PAGE)
            .get();

        const grid = $('newsGrid');
        if (!grid) return;

        if (snap.empty) {
            markAllLoaded();
            return;
        }

        snap.forEach(doc => {
            const card = createNewsCard(doc.id, doc.data());
            card.style.opacity   = '0';
            card.style.transform = 'translateY(20px)';
            grid.appendChild(card);
            // Animate in
            requestAnimationFrame(() => {
                card.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
                card.style.opacity    = '1';
                card.style.transform  = 'translateY(0)';
            });
        });

        newsLastDoc = snap.docs[snap.docs.length - 1];

        if (snap.docs.length < NEWS_PER_PAGE) {
            markAllLoaded();
        } else {
            if (hint) hint.textContent = snap.docs.length + ' berita berhasil dimuat';
            setTimeout(() => { if (hint) hint.textContent = ''; }, 2500);
        }
    } catch {
        showToast('Gagal memuat berita lainnya.', 'error');
    } finally {
        newsLoading = false;
        if (btn) {
            btn.classList.remove('loading');
            btn.querySelector('span').textContent = 'Lihat Berita Sebelumnya';
        }
    }
}

function markAllLoaded() {
    newsAllLoaded = true;
    const btn  = $('btnLoadMore');
    const hint = $('loadMoreHint');
    if (btn) {
        btn.classList.add('all-loaded');
        btn.querySelector('span').textContent = 'Semua berita sudah ditampilkan';
        btn.querySelector('i:first-child').className = 'fas fa-check-circle';
    }
    if (hint) hint.textContent = '';
}

function hideLoadMore() {
    const wrap = $('newsLoadMore');
    if (wrap) wrap.style.display = 'none';
}

function updateLoadMoreBtn(loading) {
    const btn = $('btnLoadMore');
    if (!btn) return;
    btn.classList.remove('loading', 'all-loaded');
    btn.querySelector('span').textContent = 'Lihat Berita Sebelumnya';
    if ($('btnLoadMoreChevron')) $('btnLoadMoreChevron').style.transform = '';
}

function initLoadMoreNews() {
    const btn = $('btnLoadMore');
    btn?.addEventListener('click', loadMoreNews);
}

function createNewsCard(id, data) {
    const card = document.createElement('div');
    card.className = 'news-card';

    let newsDate = null;
    const dateStr = data.date?.toDate
        ? (() => { newsDate = new Date(data.date.toDate()); return newsDate.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }); })()
        : '';

    // Tandai berita "NEW" jika terbit dalam 7 hari terakhir
    const isNew = newsDate && (Date.now() - newsDate.getTime()) < 7 * 24 * 60 * 60 * 1000;

    const excerpt = data.excerpt || (data.content?.substring(0, 110) + '...') || '';
    const img     = data.image || 'https://upload.wikimedia.org/wikipedia/id/1/19/Logo_SMAN_68_Jakarta.png';

    card.innerHTML = `
        <div class="news-image-wrap">
            <img src="${img}" alt="${data.title}" class="news-image" loading="lazy"
                 onerror="this.src='https://upload.wikimedia.org/wikipedia/id/1/19/Logo_SMAN_68_Jakarta.png'">
            ${isNew ? '<span class="news-new-badge"><i class="fas fa-bolt"></i> NEW</span>' : ''}
        </div>
        <div class="news-content">
            <div class="news-date"><i class="far fa-calendar-alt"></i> ${dateStr}</div>
            <h3 class="news-title">${data.title}</h3>
            <p class="news-excerpt">${excerpt}</p>
            <button class="btn-readmore">Baca Selengkapnya <i class="fas fa-arrow-right"></i></button>
        </div>
    `;

    card.querySelector('.btn-readmore').addEventListener('click', () => openNewsModal(data, dateStr));
    card.addEventListener('click', e => {
        if (!e.target.closest('.btn-readmore')) openNewsModal(data, dateStr);
    });
    return card;
}

function openNewsModal(data, dateStr) {
    const modal = $('newsModal');
    const body  = $('newsModalBody');
    if (!modal || !body) return;

    let html = data.content || 'Konten akan segera tersedia.';
    if (html.includes('\n')) {
        html = html.split('\n\n')
            .map(p => p.trim()).filter(Boolean)
            .map(p => `<p style="margin-bottom:18px;line-height:1.9;">${p.replace(/\n/g,'<br>')}</p>`)
            .join('');
    } else {
        html = `<p style="line-height:1.9;">${html}</p>`;
    }

    const img = data.image
        ? `<img src="${data.image}" style="width:100%;border-radius:16px;margin-bottom:24px;box-shadow:0 8px 32px rgba(0,0,0,.12);" loading="lazy">`
        : '';

    body.innerHTML = `
        <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px;">
            <span style="background:var(--emerald-50);color:var(--primary);padding:3px 12px;border-radius:999px;font-size:.7rem;font-weight:700;letter-spacing:1px;">BERITA</span>
        </div>
        <h2 style="font-family:var(--font-heading);font-size:1.4rem;font-weight:800;margin-bottom:12px;line-height:1.25;">${data.title}</h2>
        <div style="display:flex;gap:16px;margin-bottom:20px;color:var(--primary);font-size:.8rem;">
            <span><i class="far fa-calendar-alt"></i> ${dateStr}</span>
            <span><i class="far fa-folder"></i> Berita</span>
        </div>
        ${img}
        ${html}
    `;
    modal.classList.add('active');
}

function initNewsModal() {
    const modal  = $('newsModal');
    const closeX = modal?.querySelector('.news-modal-close');
    closeX?.addEventListener('click', () => modal.classList.remove('active'));
    modal?.addEventListener('click', e => { if (e.target === modal) modal.classList.remove('active'); });
}

// ============================================
// LOAD AGENDA
// ============================================
async function loadAgendaData() {
    const grid = $('agendaGrid');
    if (!grid) return;

    try {
        const today = new Date(); today.setHours(0, 0, 0, 0);
        const snap  = await db.collection('agenda')
            .where('date', '>=', today)
            .orderBy('date', 'asc')
            .limit(6).get();

        grid.innerHTML = '';
        if (snap.empty) {
            grid.innerHTML = buildEmptyState('calendar-alt', 'Belum ada agenda mendatang');
            return;
        }
        snap.forEach(doc => grid.appendChild(createAgendaCard(doc.data())));
    } catch {
        grid.innerHTML = buildEmptyState('exclamation-circle', 'Gagal memuat agenda');
    }
}

function createAgendaCard(data) {
    const card    = document.createElement('div');
    card.className = 'agenda-card';
    const dateStr = data.date?.toDate
        ? new Date(data.date.toDate()).toLocaleDateString('id-ID', { weekday:'long', day:'numeric', month:'long', year:'numeric' })
        : '';

    card.innerHTML = `
        <span class="agenda-category">${data.category || 'Akademik'}</span>
        <h4 class="agenda-title">${data.title}</h4>
        <div class="agenda-detail"><i class="fas fa-map-marker-alt"></i> ${data.location || '-'}</div>
        <div class="agenda-detail"><i class="far fa-clock"></i> ${data.time || '-'}</div>
        <div class="agenda-date"><i class="far fa-calendar-alt"></i> ${dateStr}</div>
    `;
    return card;
}

// ============================================
// LOAD GALLERY
// ============================================
async function loadGalleryData() {
    const grid = $('galleryGrid');
    if (!grid) return;

    try {
        const snap = await db.collection('gallery').limit(8).get();
        grid.innerHTML = '';
        if (snap.empty) {
            grid.innerHTML = buildEmptyState('images', 'Belum ada foto tersedia');
            return;
        }
        snap.forEach(doc => grid.appendChild(createGalleryItem(doc.data())));
    } catch {
        grid.innerHTML = buildEmptyState('exclamation-circle', 'Gagal memuat galeri');
    }
}

function createGalleryItem(data) {
    const item    = document.createElement('div');
    item.className = 'gallery-item';
    item.innerHTML = `
        <img src="${data.imageUrl}" alt="${data.caption || ''}" loading="lazy"
             onerror="this.src='https://upload.wikimedia.org/wikipedia/id/1/19/Logo_SMAN_68_Jakarta.png'">
        <div class="gallery-item-overlay">
            <i class="fas fa-expand-alt"></i>
            <p>${data.caption || ''}</p>
        </div>
    `;
    item.addEventListener('click', () => openLightbox(data.imageUrl, data.caption));
    return item;
}

function openLightbox(url, caption) {
    const lb  = $('lightbox');
    const img = $('lightboxImg');
    const cap = $('lightboxCaption');
    if (!lb) return;
    if (img) img.src = url;
    if (cap) cap.textContent = caption || '';
    lb.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function initLightbox() {
    const lb  = $('lightbox');
    const btn = $('lightboxClose');
    btn?.addEventListener('click', closeLightbox);
    lb?.addEventListener('click', e => { if (e.target === lb) closeLightbox(); });
    document.addEventListener('keydown', e => { if (e.key === 'Escape') closeLightbox(); });
}

function closeLightbox() {
    const lb = $('lightbox');
    lb?.classList.remove('active');
    document.body.style.overflow = '';
}

// ============================================
// LOAD TESTIMONIALS — WITH PAGINATION
// ============================================
const TESTI_PER_PAGE  = 3;
let   testiLastDoc    = null;
let   testiAllLoaded  = false;
let   testiLoading    = false;

async function loadTestimonialData() {
    const grid = $('testimonialGrid');
    if (!grid) return;

    testiLastDoc  = null;
    testiAllLoaded = false;
    grid.innerHTML = '';
    updateTestiBtn(false);

    try {
        const snap = await db.collection('testimonials')
            .limit(TESTI_PER_PAGE).get();

        if (snap.empty) {
            grid.innerHTML = buildEmptyState('comment-dots', 'Belum ada testimoni');
            hideTestiLoadMore();
            return;
        }
        snap.forEach(doc => grid.appendChild(createTestimonialCard(doc.data())));
        testiLastDoc = snap.docs[snap.docs.length - 1];

        if (snap.docs.length < TESTI_PER_PAGE) markTestiAllLoaded();
    } catch {
        grid.innerHTML = buildEmptyState('exclamation-circle', 'Gagal memuat testimoni');
        hideTestiLoadMore();
    }
}

async function loadMoreTestimonials() {
    if (testiAllLoaded || testiLoading || !testiLastDoc) return;
    testiLoading = true;

    const btn  = $('btnLoadMoreTestimonial');
    const hint = $('testiLoadHint');
    if (btn) {
        btn.classList.add('loading');
        btn.querySelector('span').textContent = 'Memuat...';
    }

    try {
        const snap = await db.collection('testimonials')
            .startAfter(testiLastDoc)
            .limit(TESTI_PER_PAGE).get();

        const grid = $('testimonialGrid');
        if (!grid) return;

        if (snap.empty) { markTestiAllLoaded(); return; }

        snap.forEach(doc => {
            const card = createTestimonialCard(doc.data());
            card.style.opacity   = '0';
            card.style.transform = 'translateY(20px)';
            grid.appendChild(card);
            requestAnimationFrame(() => {
                card.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
                card.style.opacity    = '1';
                card.style.transform  = 'translateY(0)';
            });
        });

        testiLastDoc = snap.docs[snap.docs.length - 1];
        if (snap.docs.length < TESTI_PER_PAGE) {
            markTestiAllLoaded();
        } else {
            if (hint) hint.textContent = snap.docs.length + ' testimoni berhasil dimuat';
            setTimeout(() => { if (hint) hint.textContent = ''; }, 2500);
        }
    } catch {
        showToast('Gagal memuat testimoni lainnya.', 'error');
    } finally {
        testiLoading = false;
        if (btn) {
            btn.classList.remove('loading');
            btn.querySelector('span').textContent = 'Lihat Testimoni Selengkapnya';
        }
    }
}

function markTestiAllLoaded() {
    testiAllLoaded = true;
    const btn = $('btnLoadMoreTestimonial');
    if (btn) {
        btn.classList.add('all-loaded');
        btn.querySelector('span').textContent = 'Semua testimoni sudah ditampilkan';
        btn.querySelector('i:first-child').className = 'fas fa-check-circle';
    }
}

function hideTestiLoadMore() {
    const wrap = $('testimonialLoadMore');
    if (wrap) wrap.style.display = 'none';
}

function updateTestiBtn(loading) {
    const btn = $('btnLoadMoreTestimonial');
    if (!btn) return;
    btn.classList.remove('loading', 'all-loaded');
    btn.querySelector('span').textContent = 'Lihat Testimoni Selengkapnya';
}

function initLoadMoreTestimonials() {
    const btn = $('btnLoadMoreTestimonial');
    btn?.addEventListener('click', loadMoreTestimonials);
}

function createTestimonialCard(data) {
    const card    = document.createElement('div');
    card.className = 'testimonial-card';

    const stars    = '★'.repeat(data.stars || 5) + '☆'.repeat(5 - (data.stars || 5));
    const initials = (data.author || 'A').split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

    card.innerHTML = `
        <div class="testimonial-stars">${stars}</div>
        <p class="testimonial-text">"${data.text}"</p>
        <div class="testimonial-author">
            <div class="author-avatar">${initials}</div>
            <div class="author-info">
                <h4>${data.author || 'Alumni'}</h4>
                <p>${data.role || 'Alumni SMAN 68'}</p>
            </div>
        </div>
    `;
    return card;
}

// ============================================
// LOAD FACILITIES
// ============================================
async function loadFacilityData() {
    const grid = $('facilityGrid');
    if (!grid) return;

    try {
        const snap = await db.collection('facilities').get();
        grid.innerHTML = '';
        if (snap.empty) {
            grid.innerHTML = buildEmptyState('building', 'Belum ada data fasilitas');
            return;
        }
        snap.forEach(doc => grid.appendChild(createFacilityCard(doc.data())));
    } catch {
        grid.innerHTML = buildEmptyState('exclamation-circle', 'Gagal memuat fasilitas');
    }
}

function createFacilityCard(data) {
    const card    = document.createElement('div');
    card.className = 'facility-card';
    card.innerHTML = `
        <img src="${data.imageUrl}" alt="${data.name}" loading="lazy"
             onerror="this.src='https://upload.wikimedia.org/wikipedia/id/1/19/Logo_SMAN_68_Jakarta.png'">
        <div class="facility-info">
            <h4>${data.name}</h4>
            <p>${data.description || ''}</p>
        </div>
    `;
    return card;
}

// ============================================
// OPERATIONAL HOURS
// ============================================
async function loadOperationalHours() {
    const el = $('operationalHours');
    if (!el) return;

    const fallback = [
        { label: 'Senin–Kamis', val: '07.00–16.00 WIB' },
        { label: 'Jumat',       val: '07.00–16.30 WIB' },
        { label: 'Sabtu',       val: '07.00–13.00 WIB' },
        { label: 'Minggu',      val: 'Tutup' }
    ];

    try {
        const doc  = await db.collection('settings').doc('operationalHours').get();
        const days = ['senin','selasa','rabu','kamis','jumat','sabtu','minggu'];
        const lbls = ['Senin','Selasa','Rabu','Kamis','Jumat','Sabtu','Minggu'];

        if (doc.exists) {
            const data = doc.data();
            el.innerHTML = days
                .filter(d => data[d])
                .map((d, i) => `<div><strong>${lbls[i]}:</strong> ${data[d]}</div>`)
                .join('');
        } else {
            el.innerHTML = fallback.map(f => `<div><strong>${f.label}:</strong> ${f.val}</div>`).join('');
        }
    } catch {
        el.innerHTML = fallback.map(f => `<div><strong>${f.label}:</strong> ${f.val}</div>`).join('');
    }
}

// ============================================
// CHAT STATUS
// ============================================
async function checkChatStatus() {
    try {
        const doc   = await db.collection('settings').doc('chatStatus').get();
        isChatOnline = doc.exists ? (doc.data().isOnline !== false) : true;
    } catch {
        isChatOnline = true;
    }
    updateChatStatusUI();

    // Real-time listener
    db.collection('settings').doc('chatStatus').onSnapshot(doc => {
        if (doc.exists) {
            const was    = isChatOnline;
            isChatOnline = doc.data().isOnline !== false;
            updateChatStatusUI();
            if (was && !isChatOnline && chatSession) {
                showToast('Helpdesk telah offline. Chat akan diakhiri.', 'error');
                forceEndChat();
            }
        }
    });
}

function updateChatStatusUI() {
    const statusText = $('chatStatusText');
    const statusDot  = $('chatStatusDot');
    const offline    = $('chatOffline');
    const reg        = $('chatRegistration');

    if (statusText) {
        statusText.innerHTML = isChatOnline
            ? '<span class="status-dot online"></span> Online'
            : '<span class="status-dot offline"></span> Offline';
    }
    if (statusDot) {
        statusDot.classList.toggle('offline', !isChatOnline);
    }
    if (offline && reg) {
        offline.style.display = isChatOnline ? 'none' : 'block';
        reg.style.display     = isChatOnline ? 'block' : 'none';
    }
}

// ============================================
// LIVE CHAT WIDGET
// ============================================
function initLiveChat() {
    const toggle  = $('chatToggle');
    const window_ = $('chatWindow');
    const close   = $('chatClose');
    const regForm = $('chatRegForm');
    const reg     = $('chatRegistration');
    const msgs    = $('chatMessages');
    const footer  = $('chatFooter');
    const list    = $('chatMessageList');
    const input   = $('chatInput');
    const sendBtn = $('sendMessageBtn');
    const endBtn  = $('endChatBtn');
    const ended   = $('chatEndedNotification');
    const newChat = $('btnNewChat');

    // Toggle open/close
    toggle?.addEventListener('click', () => window_?.classList.toggle('active'));
    close?.addEventListener('click',  () => window_?.classList.remove('active'));

    // Registration submit
    regForm?.addEventListener('submit', async e => {
        e.preventDefault();
        if (!isChatOnline) {
            showToast('Helpdesk sedang offline. Silakan coba nanti.', 'error');
            return;
        }

        const name   = $('chatName')?.value.trim();
        const phone  = $('chatPhone')?.value.trim();
        const status = $('chatStatusSelect')?.value;

        if (!name || !phone || !status) {
            showToast('Mohon lengkapi semua data.', 'error');
            return;
        }

        currentUser = { name, phone, status };

        try {
            const ref  = await db.collection('chatSessions').add({
                userName:  name,
                userPhone: phone,
                userStatus: status,
                startedAt: firebase.firestore.FieldValue.serverTimestamp(),
                status: 'active'
            });
            chatSession = ref.id;
            chatEnded   = false;

            if (reg)    reg.style.display    = 'none';
            if (msgs)   msgs.style.display   = 'flex';
            if (footer) footer.style.display = 'flex';
            if (ended)  ended.style.display  = 'none';
            if (list)   list.innerHTML       = '';

            appendBotMessage('Halo ' + name + '! 👋 Terima kasih telah menghubungi Helpdesk SMAN 68 Jakarta. Operator kami akan segera membalas pesan Anda.');
            subscribeToChat(chatSession);
            showToast('Obrolan dimulai!', 'success');
        } catch {
            showToast('Gagal memulai obrolan. Coba lagi.', 'error');
        }
    });

    // Send message
    sendBtn?.addEventListener('click', sendMsg);
    input?.addEventListener('keydown', e => { if (e.key === 'Enter' && !e.shiftKey) sendMsg(); });

    function sendMsg() {
        const text = input?.value.trim();
        if (!text || !chatSession || chatEnded) return;

        db.collection('chatSessions').doc(chatSession)
            .collection('messages').add({
                sender:     'user',
                senderName: currentUser?.name || 'User',
                message:    text,
                timestamp:  firebase.firestore.FieldValue.serverTimestamp()
            }).catch(() => showToast('Gagal mengirim pesan.', 'error'));

        appendUserMessage(text);
        if (input) input.value = '';
    }

    // End chat
    endBtn?.addEventListener('click', async () => {
        if (!chatSession || chatEnded) return;
        try {
            await db.collection('chatSessions').doc(chatSession).update({
                status:  'ended',
                endedAt: firebase.firestore.FieldValue.serverTimestamp()
            });
            forceEndChat();
            showToast('Chat telah diakhiri.', 'success');
        } catch {
            showToast('Gagal mengakhiri chat.', 'error');
        }
    });

    // New chat
    newChat?.addEventListener('click', resetChat);

    // ---- helpers ----
    function subscribeToChat(sessionId) {
        // Listen for new messages
        db.collection('chatSessions').doc(sessionId)
            .collection('messages')
            .orderBy('timestamp', 'asc')
            .onSnapshot(function(snap) {
                snap.docChanges().forEach(function(change) {
                    if (change.type === 'added' && change.doc.data().sender === 'operator') {
                        appendOperatorMessage(change.doc.data().message);
                    }
                });
            });

        // Listen for session status
        db.collection('chatSessions').doc(sessionId).onSnapshot(doc => {
            if (doc.exists && doc.data().status === 'ended' && !chatEnded) {
                forceEndChat();
            }
        });
    }

    function getTimeNow() {
        var now = new Date();
        var h   = String(now.getHours()).padStart(2,'0');
        var m   = String(now.getMinutes()).padStart(2,'0');
        return h + ':' + m;
    }

    function appendUserMessage(text) {
        var div = document.createElement('div');
        div.className = 'message-user';
        div.innerHTML =
            '<div>' + escapeHtml(text) + '</div>';
        if (list) list.appendChild(div);
        scrollChatBottom();
    }

    function appendOperatorMessage(text) {
        var div = document.createElement('div');
        div.className = 'message-operator';
        div.innerHTML =
            '<div>' + escapeHtml(text) + '</div>';
        if (list) list.appendChild(div);
        scrollChatBottom();
    }

    function scrollChatBottom() {
        if (!list) return;
        // requestAnimationFrame: tunggu browser render dulu
        requestAnimationFrame(function() {
            list.scrollTop = list.scrollHeight;
            // Double RAF untuk konten dinamis yang panjang
            requestAnimationFrame(function() {
                list.scrollTop = list.scrollHeight;
            });
        });
    }

    function resetChat() {
        if (reg)    reg.style.display    = 'block';
        if (msgs)   msgs.style.display   = 'none';
        if (footer) footer.style.display = 'none';
        if (ended)  ended.style.display  = 'none';
        if (list)   list.innerHTML       = '';
        if (input)  { input.value = ''; input.disabled = false; }
        if (sendBtn) sendBtn.disabled = false;
        if (endBtn)  endBtn.disabled  = false;
        regForm?.reset();
        chatSession = null;
        currentUser = null;
        chatEnded   = false;
    }
}

function appendBotMessage(text) {
    var list = document.getElementById('chatMessageList');
    if (!list) return;
    var div = document.createElement('div');
    div.className   = 'message-bot';
    div.textContent = text;
    list.appendChild(div);
    requestAnimationFrame(function() {
        list.scrollTop = list.scrollHeight;
        requestAnimationFrame(function() {
            list.scrollTop = list.scrollHeight;
        });
    });
}

function forceEndChat() {
    chatEnded = true;
    const input  = $('chatInput');
    const sendBtn = $('sendMessageBtn');
    const endBtn  = $('endChatBtn');
    const msgs    = $('chatMessages');
    const footer  = $('chatFooter');
    const ended   = $('chatEndedNotification');

    if (input)  input.disabled   = true;
    if (sendBtn) sendBtn.disabled = true;
    if (endBtn)  endBtn.disabled  = true;
    if (msgs)    msgs.style.display   = 'none';
    if (footer)  footer.style.display = 'none';
    if (ended)   ended.style.display  = 'block';
}

// ============================================
// FEEDBACK FORM
// ============================================
function initFeedback() {
    const form    = $('feedbackForm');
    const histBtn = $('showHistoryBtn');

    form?.addEventListener('submit', async e => {
        e.preventDefault();
        const name     = $('feedbackName')?.value.trim() || 'Anonymous';
        const email    = $('feedbackEmail')?.value.trim();
        const category = $('feedbackCategory')?.value;
        const message  = $('feedbackMessage')?.value.trim();

        if (!email || !category || !message) {
            showToast('Mohon isi semua field yang wajib.', 'error');
            return;
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            showToast('Format email tidak valid.', 'error');
            return;
        }

        const submitBtn = form.querySelector('.btn-submit');
        if (submitBtn) {
            submitBtn.disabled    = true;
            submitBtn.innerHTML   = '<i class="fas fa-spinner fa-spin"></i> Mengirim...';
        }

        try {
            await db.collection('feedbacks').add({
                name, email, category, message,
                status:    'pending',
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                replies:   []
            });
            showToast('✅ Pesan terkirim! Akan direspon dalam 1×24 jam.', 'success');
            form.reset();
        } catch {
            showToast('❌ Terjadi kesalahan. Coba lagi.', 'error');
        } finally {
            if (submitBtn) {
                submitBtn.disabled  = false;
                submitBtn.innerHTML = '<i class="fas fa-paper-plane"></i> Kirim Pesan';
            }
        }
    });

    histBtn?.addEventListener('click', () => $('historyModal')?.classList.add('active'));
}

// ============================================
// HISTORY MODAL
// ============================================
function initHistoryModal() {
    const modal    = $('historyModal');
    const closeBtn = modal?.querySelector('.history-close');
    const loadBtn  = $('loadHistoryBtn');
    const list     = $('historyList');

    closeBtn?.addEventListener('click', () => modal?.classList.remove('active'));
    modal?.addEventListener('click', e => { if (e.target === modal) modal.classList.remove('active'); });

    loadBtn?.addEventListener('click', async () => {
        const email = $('historyEmail')?.value.trim();
        if (!email) { showToast('Masukkan email Anda.', 'error'); return; }
        if (!list) return;

        list.innerHTML = '<p style="text-align:center;padding:20px;color:var(--text-muted)"><i class="fas fa-spinner fa-spin"></i> Memuat...</p>';

        try {
            const snap = await db.collection('feedbacks')
                .where('email', '==', email)
                .orderBy('createdAt', 'desc').get();

            if (snap.empty) {
                list.innerHTML = '<p style="text-align:center;padding:24px;color:var(--text-muted);">Tidak ada riwayat ditemukan.</p>';
                return;
            }

            list.innerHTML = '';
            snap.forEach(doc => {
                const d    = doc.data();
                const date = d.createdAt?.toDate ? new Date(d.createdAt.toDate()).toLocaleString('id-ID') : '';
                const reps = (d.replies || []).map(r =>
                    `<div style="background:var(--emerald-50);border-left:3px solid var(--primary);padding:10px 12px;border-radius:8px;margin-top:10px;font-size:.8rem;">
                        <strong style="color:var(--primary);">Balasan Operator:</strong><br>${escapeHtml(r.message)}
                    </div>`
                ).join('');

                const item = document.createElement('div');
                item.className = 'history-item';
                item.innerHTML = `
                    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;">
                        <span style="background:var(--emerald-50);color:var(--primary);padding:2px 10px;border-radius:999px;font-size:.65rem;font-weight:700;">${d.category}</span>
                        <small style="color:var(--text-muted);font-size:.7rem;">${date}</small>
                    </div>
                    <p style="font-size:.85rem;color:var(--text);margin-bottom:4px;">${escapeHtml(d.message)}</p>
                    ${reps}
                `;
                list.appendChild(item);
            });
        } catch {
            list.innerHTML = '<p style="text-align:center;padding:24px;color:#ef4444;">Gagal memuat riwayat.</p>';
        }
    });
}

// ============================================
// TUTORIAL MODAL
// ============================================
function initTutorial() {
    const trigger = $('tutorialTrigger');
    const modal   = $('tutorialModal');
    const close   = $('tutorialClose');

    trigger?.addEventListener('click', () => modal?.classList.add('active'));
    close?.addEventListener('click',   () => modal?.classList.remove('active'));
    modal?.addEventListener('click',   e => { if (e.target === modal) modal.classList.remove('active'); });
}

// ============================================
// PRIVACY MODAL
// ============================================
function initPrivacy() {
    const link  = $('privacyLink');
    const modal = $('privacyModal');
    const close = modal?.querySelector('.privacy-close');

    link?.addEventListener('click',  e => { e.preventDefault(); modal?.classList.add('active'); });
    close?.addEventListener('click', () => modal?.classList.remove('active'));
    modal?.addEventListener('click', e => { if (e.target === modal) modal.classList.remove('active'); });
}

// ============================================
// ============================================
// SISTEM NOTIFIKASI PENGUMUMAN BARU
// ============================================
let notifList = [];

function initNotifSystem() {
    var notifBtn          = document.getElementById('notifBtn');
    var notifPanel        = document.getElementById('notifPanel');
    var notifPanelClose   = document.getElementById('notifPanelClose');
    var notifPanelOverlay = document.getElementById('notifPanelOverlay');

    if (notifBtn) {
        notifBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            if (notifPanel && notifPanel.classList.contains('active')) {
                closeNotifPanel();
            } else {
                openNotifPanel();
            }
        });
    }
    if (notifPanelClose)   notifPanelClose.addEventListener('click', closeNotifPanel);
    if (notifPanelOverlay) notifPanelOverlay.addEventListener('click', closeNotifPanel);

    document.addEventListener('click', function(e) {
        var panel = document.getElementById('notifPanel');
        var btn   = document.getElementById('notifBtn');
        if (panel && btn && !panel.contains(e.target) && !btn.contains(e.target)) {
            closeNotifPanel();
        }
    });

    var closeLetterBtn  = document.getElementById('notifLetterClose');
    var letterModal     = document.getElementById('notifLetterModal');
    if (closeLetterBtn) closeLetterBtn.addEventListener('click', closeLetterModal);
    if (letterModal) {
        letterModal.addEventListener('click', function(e) {
            if (e.target === letterModal) closeLetterModal();
        });
    }

    loadNotifications();
}

function openNotifPanel() {
    var panel   = document.getElementById('notifPanel');
    var overlay = document.getElementById('notifPanelOverlay');
    if (panel)   panel.classList.add('active');
    if (overlay) overlay.classList.add('active');
    // Tidak auto mark-all-read — badge hilang setelah tiap pengumuman diklik
}

function closeNotifPanel() {
    var panel   = document.getElementById('notifPanel');
    var overlay = document.getElementById('notifPanelOverlay');
    if (panel)   panel.classList.remove('active');
    if (overlay) overlay.classList.remove('active');
}

function closeLetterModal() {
    var modal = document.getElementById('notifLetterModal');
    if (modal) modal.classList.remove('active');
    document.body.style.overflow = '';
}

async function loadNotifications() {
    notifList = [];

    // ── Coba collection 'announcements' (multi-doc) ───────────────────────
    // Pakai .get() tanpa .where() dulu untuk hindari error index Firestore,
    // lalu filter active=true di sisi client
    try {
        var snap = await db.collection('announcements')
            .orderBy('createdAt', 'desc')
            .limit(20)
            .get();

        if (!snap.empty) {
            snap.forEach(function(doc) {
                var d = doc.data();
                // Tampilkan: active===true ATAU field active tidak ada sama sekali
                if (d.active === true || d.active === undefined) {
                    notifList.push(Object.assign({ id: doc.id }, d));
                }
            });
        }
    } catch(e1) {
        // Kalau orderBy gagal (no index), coba tanpa orderBy
        try {
            var snap2 = await db.collection('announcements').limit(20).get();
            if (!snap2.empty) {
                snap2.forEach(function(doc) {
                    var d = doc.data();
                    if (d.active === true || d.active === undefined) {
                        notifList.push(Object.assign({ id: doc.id }, d));
                    }
                });
            }
        } catch(e2) {
            console.warn('announcements collection error:', e2);
        }
    }

    // ── Fallback ke settings/announcement (format single doc lama) ─────────
    try {
        var singleDoc = await db.collection('settings').doc('announcement').get();
        if (singleDoc.exists) {
            var sd = singleDoc.data();
            // Tampilkan jika active atau field tidak ada
            if (sd.active === true || sd.active === undefined) {
                // Cek apakah sudah ada dari collection utama
                var alreadyIn = notifList.some(function(n) { return n.id === 'single'; });
                if (!alreadyIn) {
                    notifList.push({
                        id:        'single',
                        title:     sd.title   || 'Pengumuman',
                        text:      sd.text    || sd.message || '',
                        createdAt: sd.createdAt || null,
                        active:    true
                    });
                }
            }
        }
    } catch(e3) {
        console.warn('settings/announcement error:', e3);
    }

    // ── Render ──────────────────────────────────────────────────────────────
    renderNotifPanel();
    updateNotifBadge();

    // ── Realtime listener (collection announcements) ────────────────────────
    try {
        db.collection('announcements').onSnapshot(function(snap) {
            notifList = [];
            snap.forEach(function(doc) {
                var d = doc.data();
                if (d.active === true || d.active === undefined) {
                    notifList.push(Object.assign({ id: doc.id }, d));
                }
            });
            // Urutkan terbaru di atas
            notifList.sort(function(a, b) {
                var ta = a.createdAt && a.createdAt.toDate ? a.createdAt.toDate().getTime() : 0;
                var tb = b.createdAt && b.createdAt.toDate ? b.createdAt.toDate().getTime() : 0;
                return tb - ta;
            });
            renderNotifPanel();
            updateNotifBadge();
        });
    } catch(e4) {}

    // ── Realtime listener (settings/announcement) ───────────────────────────
    try {
        db.collection('settings').doc('announcement').onSnapshot(function(doc) {
            if (!doc.exists) return;
            var sd = doc.data();
            // Update atau hapus entry 'single' dari list
            notifList = notifList.filter(function(n) { return n.id !== 'single'; });
            if (sd.active === true || sd.active === undefined) {
                notifList.unshift({
                    id:        'single',
                    title:     sd.title   || 'Pengumuman',
                    text:      sd.text    || sd.message || '',
                    createdAt: sd.createdAt || null,
                    active:    true
                });
            }
            renderNotifPanel();
            updateNotifBadge();
        });
    } catch(e5) {}
}

function renderNotifPanel() {
    var list = document.getElementById('notifPanelList');
    if (!list) return;

    if (notifList.length === 0) {
        list.innerHTML =
            '<div class="notif-empty">' +
                '<i class="fas fa-envelope-open"></i>' +
                '<p>Tidak ada pengumuman aktif</p>' +
            '</div>';
        return;
    }

    var readSet = getReadSet();

    // Urutkan: paling baru di atas (berdasarkan createdAt)
    var sorted = notifList.slice().sort(function(a, b) {
        var ta = a.createdAt && a.createdAt.toDate ? a.createdAt.toDate().getTime() : 0;
        var tb = b.createdAt && b.createdAt.toDate ? b.createdAt.toDate().getTime() : 0;
        return tb - ta; // descending — terbaru di atas
    });

    var html = '';

    sorted.forEach(function(item) {
        var isUnread  = !readSet.has(item.id);
        var dateStr   = '';
        if (item.createdAt && item.createdAt.toDate) {
            dateStr = new Date(item.createdAt.toDate()).toLocaleDateString('id-ID', {
                day: 'numeric', month: 'short', year: 'numeric'
            });
        }
        var raw     = item.text || '';
        var preview = raw.replace(/\n/g, ' ').substring(0, 80) + (raw.length > 80 ? '\u2026' : '');

        // Warna & icon dari Firestore (diset di admin panel)
        var itemColor  = item.color || '#059669';
        var itemIcon   = (item.icon && item.icon.trim()) ? item.icon.trim()
                         : (isUnread ? 'fas fa-envelope' : 'fas fa-envelope-open-text');
        var colorAlpha = itemColor + '22';
        var borderStyle = 'border-left:3px solid ' + itemColor + ';';
        var linkBadge  = item.link
            ? ' &nbsp;<span style="font-size:0.62rem;background:' + colorAlpha + ';color:'
              + itemColor + ';padding:1px 7px;border-radius:999px;font-weight:700;">\u2197 Buka Link</span>'
            : '';

        // Badge NEW untuk pengumuman yang belum dibaca
        var newBadge = isUnread
            ? '<span style="display:inline-flex;align-items:center;gap:3px;font-size:0.6rem;background:#ef4444;color:white;padding:1px 7px;border-radius:999px;font-weight:800;letter-spacing:0.5px;margin-left:6px;vertical-align:middle;">NEW</span>'
            : '';

        html +=
            '<div class="notif-item ' + (isUnread ? 'unread' : '') + '"' +
                ' onclick="openLetterModal(\'' + item.id.replace(/\'/g, "\\'") + '\')"' +
                ' data-id="' + escapeHtml(item.id) + '"' +
                ' style="' + borderStyle + '">' +
                '<div class="notif-item-icon" style="background:' + colorAlpha + ';color:' + itemColor + ';">' +
                    '<i class="' + escapeHtml(itemIcon) + '"></i>' +
                '</div>' +
                '<div class="notif-item-body">' +
                    '<div class="notif-item-title">' + escapeHtml(item.title || 'Pengumuman') + newBadge + '</div>' +
                    '<div class="notif-item-preview">' + escapeHtml(preview) + '</div>' +
                    '<div class="notif-item-date">' + dateStr + linkBadge + '</div>' +
                '</div>' +
            '</div>';
    });

    list.innerHTML = html;
}

window.openLetterModal = function(id) {
    var item = null;
    for (var i = 0; i < notifList.length; i++) {
        if (notifList[i].id === id) { item = notifList[i]; break; }
    }
    if (!item) return;

    // Mark as read
    var readSet = getReadSet();
    readSet.add(id);
    localStorage.setItem('sman68-notif-read', JSON.stringify(Array.from(readSet)));
    updateNotifBadge();
    renderNotifPanel();

    // ── Ambil warna & link dari data Firestore ─────────────────────────────
    var itemColor = item.color || '#059669';
    var itemLink  = item.link  || '';

    // Terapkan accent color ke elemen modal (letter-header, divider, dll)
    var letterHeader  = document.querySelector('.letter-header');
    var letterDivider = document.querySelector('.letter-divider');
    var letterLabel   = document.querySelector('.letter-label');
    if (letterHeader)  letterHeader.style.borderBottom = '2px solid ' + itemColor + '33';
    if (letterDivider) letterDivider.style.background  = 'linear-gradient(90deg,' + itemColor + ',transparent)';
    if (letterLabel) {
        letterLabel.style.background = itemColor + '18';
        letterLabel.style.color      = itemColor;
    }

    // Fill modal elements
    var titleEl      = document.getElementById('letterTitle');
    var dateEl       = document.getElementById('letterDate');
    var bodyEl       = document.getElementById('letterBody');
    var footerDateEl = document.getElementById('letterFooterDate');

    // Hapus tombol link lama kalau ada
    var oldLinkBtn = document.getElementById('letterLinkBtn');
    if (oldLinkBtn) oldLinkBtn.remove();

    if (titleEl) titleEl.textContent = item.title || 'Pengumuman';

    var dateStr = '';
    if (item.createdAt && item.createdAt.toDate) {
        dateStr = new Date(item.createdAt.toDate()).toLocaleDateString('id-ID', {
            weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
        });
    } else {
        dateStr = new Date().toLocaleDateString('id-ID', {
            weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
        });
    }

    if (dateEl)       dateEl.innerHTML = '<i class="fas fa-calendar-alt"></i> ' + dateStr;
    if (footerDateEl) footerDateEl.textContent = dateStr.split(',').slice(1).join(',').trim();

    // Render body paragraf terstruktur
    var rawText    = item.text || '';
    var paragraphs = rawText.split(/\n{2,}/).map(function(p) { return p.trim(); }).filter(Boolean);

    if (bodyEl) {
        if (paragraphs.length > 0) {
            bodyEl.innerHTML = paragraphs.map(function(p) {
                return '<p class="letter-paragraph">' + escapeHtml(p).replace(/\n/g, '<br>') + '</p>';
            }).join('');
        } else {
            bodyEl.innerHTML = '<p class="letter-paragraph">' + escapeHtml(rawText) + '</p>';
        }

        // ── Tampilkan tombol link jika admin mengisi field link ────────────
        if (itemLink) {
            var linkBtn = document.createElement('a');
            linkBtn.id        = 'letterLinkBtn';
            linkBtn.href      = itemLink;
            linkBtn.target    = '_blank';
            linkBtn.rel       = 'noopener noreferrer';
            linkBtn.innerHTML = '<i class="fas fa-arrow-up-right-from-square"></i> Buka Informasi Selengkapnya';
            linkBtn.style.cssText =
                'display:inline-flex;align-items:center;gap:8px;' +
                'margin-top:18px;padding:10px 22px;' +
                'background:' + itemColor + ';color:#fff;' +
                'border-radius:999px;font-size:0.85rem;font-weight:600;' +
                'text-decoration:none;transition:opacity 0.2s;' +
                'box-shadow:0 4px 14px ' + itemColor + '44;';
            linkBtn.onmouseover = function() { this.style.opacity = '0.85'; };
            linkBtn.onmouseout  = function() { this.style.opacity = '1'; };
            bodyEl.appendChild(linkBtn);
        }
    }

    var modal = document.getElementById('notifLetterModal');
    if (modal) modal.classList.add('active');
    document.body.style.overflow = 'hidden';
    closeNotifPanel();
};

function updateNotifBadge() {
    var badge   = document.getElementById('notifBadge');
    var btn     = document.getElementById('notifBtn');
    var icon    = document.getElementById('notifIcon');
    var readSet = getReadSet();
    var unread  = notifList.filter(function(n) { return !readSet.has(n.id); }).length;

    if (badge) {
        badge.textContent   = unread > 9 ? '9+' : String(unread);
        badge.style.display = unread > 0 ? 'flex' : 'none';
    }
    if (btn)  btn.classList.toggle('has-notif', unread > 0);
    if (icon) icon.className = unread > 0 ? 'fas fa-envelope' : 'fas fa-envelope-open';
}

function markAllRead() {
    var readSet = getReadSet();
    notifList.forEach(function(n) { readSet.add(n.id); });
    localStorage.setItem('sman68-notif-read', JSON.stringify(Array.from(readSet)));
    updateNotifBadge();
    renderNotifPanel();
}

function getReadSet() {
    try {
        var stored = localStorage.getItem('sman68-notif-read');
        return new Set(stored ? JSON.parse(stored) : []);
    } catch(e) { return new Set(); }
}

// Legacy stubs
function initFloatingAnnouncement() { initNotifSystem(); }
function showAnnouncement() {}
function hideAnnouncement() {}


// ============================================
// COOKIES CONSENT SYSTEM
// ============================================
function initCookies() {
    var COOKIE_KEY = 'sman68-cookies-consent';

    // Cek apakah sudah pernah setuju
    var saved = localStorage.getItem(COOKIE_KEY);
    if (saved) return; // Sudah pernah pilih, skip

    // Tampilkan banner setelah 1.5 detik
    setTimeout(function() {
        var overlay = document.getElementById('cookiesOverlay');
        if (overlay) overlay.classList.add('active');
    }, 1500);

    // Tombol Terima Semua
    var acceptBtn = document.getElementById('cookiesAcceptBtn');
    if (acceptBtn) {
        acceptBtn.addEventListener('click', function() {
            saveCookieConsent({
                essential:  true,
                analytic:   true,
                functional: true,
                marketing:  true,
                all:        true
            });
            closeCookieBanner();
            showToast('Preferensi cookies disimpan. Terima kasih! 🍪', 'success');
        });
    }

    // Tombol Tolak
    var declineBtn = document.getElementById('cookiesDeclineBtn');
    if (declineBtn) {
        declineBtn.addEventListener('click', function() {
            saveCookieConsent({
                essential:  true,
                analytic:   false,
                functional: false,
                marketing:  false,
                all:        false
            });
            closeCookieBanner();
            showToast('Hanya cookies esensial yang diaktifkan.', 'success');
        });
    }

    // Tombol Pengaturan — buka modal
    var settingsBtn = document.getElementById('cookiesSettingsBtn');
    if (settingsBtn) {
        settingsBtn.addEventListener('click', function() {
            var modal = document.getElementById('cookiesSettingsModal');
            if (modal) modal.classList.add('active');
        });
    }

    // Tutup settings modal
    var settingsClose = document.getElementById('cookiesSettingsClose');
    if (settingsClose) {
        settingsClose.addEventListener('click', function() {
            var modal = document.getElementById('cookiesSettingsModal');
            if (modal) modal.classList.remove('active');
        });
    }

    // Overlay settings modal klik luar
    var settingsModal = document.getElementById('cookiesSettingsModal');
    if (settingsModal) {
        settingsModal.addEventListener('click', function(e) {
            if (e.target === settingsModal) settingsModal.classList.remove('active');
        });
    }

    // Simpan preferensi dari settings
    var saveBtn = document.getElementById('cookiesSaveBtn');
    if (saveBtn) {
        saveBtn.addEventListener('click', function() {
            var analytic   = document.getElementById('cookieAnalytic');
            var functional = document.getElementById('cookieFunctional');
            var marketing  = document.getElementById('cookieMarketing');
            saveCookieConsent({
                essential:  true,
                analytic:   analytic   ? analytic.checked   : false,
                functional: functional ? functional.checked : false,
                marketing:  marketing  ? marketing.checked  : false,
                all:        false
            });
            var modal = document.getElementById('cookiesSettingsModal');
            if (modal) modal.classList.remove('active');
            closeCookieBanner();
            showToast('Preferensi cookies berhasil disimpan! ✅', 'success');
        });
    }

    // Link privacy di cookies
    var privLink = document.getElementById('cookiesPrivacyLink');
    if (privLink) {
        privLink.addEventListener('click', function(e) {
            e.preventDefault();
            var pm = document.getElementById('privacyModal');
            if (pm) pm.classList.add('active');
        });
    }
}

function saveCookieConsent(prefs) {
    var data = Object.assign({}, prefs, { timestamp: new Date().toISOString() });
    localStorage.setItem('sman68-cookies-consent', JSON.stringify(data));
}

function closeCookieBanner() {
    var overlay = document.getElementById('cookiesOverlay');
    if (!overlay) return;
    overlay.style.opacity    = '0';
    overlay.style.transition = 'opacity 0.4s ease';
    setTimeout(function() {
        overlay.style.display = 'none';
    }, 420);
}

// ============================================
// DOWNLOAD APK BUTTON
// ============================================
function initDownloadAPK() {
    $('btnDownloadAPK')?.addEventListener('click', e => {
        e.preventDefault();
        const url = 'https://github.com/nadhiframadhan780-dev/android.sman.68.jakarta/raw/refs/heads/main/SMAN%2068%20Jakarta.apk';
        window.open(url, '_blank');
    });
}

// ============================================
// REALTIME FIRESTORE LISTENERS
// ============================================
function setupRealtimeListeners() {
    db.collection('news').onSnapshot(()         => loadNewsData());
    db.collection('agenda').onSnapshot(()        => loadAgendaData());
    db.collection('gallery').onSnapshot(()       => loadGalleryData());
    db.collection('facilities').onSnapshot(()    => loadFacilityData());
    db.collection('testimonials').onSnapshot(()  => loadTestimonialData());
    db.collection('alumni').onSnapshot(()        => loadPTNData());
    db.collection('settings').doc('operationalHours').onSnapshot(() => loadOperationalHours());
}

// ============================================
// TOAST NOTIFICATION
// ============================================
function showToast(message, type = 'success') {
    const container = $('toastContainer');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i>
        <span>${message}</span>
    `;
    container.appendChild(toast);

    setTimeout(() => {
        toast.classList.add('removing');
        setTimeout(() => toast.remove(), 350);
    }, 4000);
}

// ============================================
// MAGNETIC BUTTON EFFECT
// ============================================
function initMagneticButtons() {
    if (window.matchMedia('(max-width:768px)').matches) return;

    $$('.magnetic-btn').forEach(btn => {
        btn.addEventListener('mousemove', e => {
            const rect   = btn.getBoundingClientRect();
            const x      = e.clientX - rect.left - rect.width  / 2;
            const y      = e.clientY - rect.top  - rect.height / 2;
            const factor = 0.25;
            btn.style.transform = `translate(${x * factor}px, ${y * factor}px)`;
        });
        btn.addEventListener('mouseleave', () => {
            btn.style.transform = '';
        });
    });
}

// ============================================
// AOS (SCROLL REVEAL) INIT
// ============================================
function initAOS() {
    if (typeof AOS !== 'undefined') {
        AOS.init({
            duration: 550,
            once:     true,
            offset:   60,
            easing:   'ease-out-cubic'
        });
    }
}

// ============================================
// MOBILE BOTTOM NAV SMOOTH SCROLL
// ============================================
function initMobileNav() {
    $$('.mob-nav-item').forEach(item => {
        item.addEventListener('click', e => {
            e.preventDefault();
            const id = item.getAttribute('data-section');
            const el = document.getElementById(id);
            if (!el) return;
            // Pakai fungsi terpusat yang sama agar offset konsisten
            scrollToSection(el);
            $$('.mob-nav-item').forEach(n => n.classList.remove('active'));
            item.classList.add('active');
        });
    });
}

// ============================================
// MOUSE-FOLLOW GRADIENT (DESKTOP ONLY)
// ============================================
function initMouseGradient() {
    if (window.matchMedia('(max-width:768px)').matches) return;

    let rafPending = false;
    document.addEventListener('mousemove', e => {
        if (rafPending) return;
        rafPending = true;
        requestAnimationFrame(() => {
            const x = (e.clientX / window.innerWidth) * 100;
            const y = (e.clientY / window.innerHeight) * 100;
            document.documentElement.style.setProperty('--mouse-x', x + '%');
            document.documentElement.style.setProperty('--mouse-y', y + '%');
            rafPending = false;
        });
    }, { passive: true });
}

// ============================================
// INTERSECTION OBSERVER — GENERIC REVEAL
// ============================================
function initRevealOnScroll() {
    // Skip on mobile — AOS handles reveal, double observer causes jank
    if (window.innerWidth < 768) return;

    const targets = $$('.ptn-card, .bento-card, .vm-card, .news-card, .agenda-card, .gallery-item, .testimonial-card, .facility-card, .subject-card, .download-card, .benefit-item, .ranking-card');

    const observer = new IntersectionObserver((entries, obs) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity   = '1';
                entry.target.style.transform = 'translateY(0)';
                obs.unobserve(entry.target);
            }
        });
    }, { threshold: 0.08, rootMargin: '0px 0px -20px 0px' });

    targets.forEach((el, i) => {
        el.style.opacity    = '0';
        el.style.transform  = 'translateY(20px)';
        el.style.transition = `opacity 0.45s ease ${(i % 4) * 0.06}s, transform 0.45s ease ${(i % 4) * 0.06}s`;
        observer.observe(el);
    });
}

// ============================================
// ESCAPE HTML (XSS PREVENTION)
// ============================================
function escapeHtml(str) {
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

// ============================================
// EMPTY STATE HELPER
// ============================================
function buildEmptyState(icon, message) {
    return `
        <div class="empty-state" style="grid-column:1/-1;text-align:center;padding:48px 24px;color:var(--text-muted);">
            <i class="fas fa-${icon}" style="font-size:2rem;margin-bottom:12px;display:block;opacity:.4;"></i>
            <p style="font-size:.875rem;">${message}</p>
        </div>
    `;
}

// ============================================
// MAIN INIT — DOMContentLoaded
// ============================================
document.addEventListener('DOMContentLoaded', () => {

    // --- Core UI ---
    initPreloader();
    initCursor();
    initScrollProgress();
    initClock();
    initThemeToggle();
    initNavbar();
    initSmoothScroll();
    initHeroParticles();
    initSoundToggle();
    initCounterAnimation();

    // --- FAB & Links ---
    initFloatingFab();
    initLinks();
    initKelulusanLink();
    initMobileNav();
    initMagneticButtons();
    initMouseGradient();

    // --- PTN & Data ---
    initPTNGrid();
    populateYearSelect();

    // --- Firebase Data ---
    loadPTNData();
    loadNewsData();
    loadAgendaData();
    loadGalleryData();
    loadTestimonialData();
    loadFacilityData();
    loadOperationalHours();
    checkChatStatus();

    // --- Realtime ---
    setupRealtimeListeners();

    // --- Modals & UI ---
    initLiveChat();
    initNewsModal();
    initLoadMoreNews();
    initLoadMoreTestimonials();
    initLightbox();
    initTutorial();
    initPrivacy();
    initFeedback();
    initHistoryModal();
    initNotifSystem();
    initDownloadAPK();
    initCookies();

    // --- Animations ---
    initAOS();
    setTimeout(initRevealOnScroll, 600); // after AOS

    console.log('✅ SMAN 68 Jakarta — Premium Website v4.0 Loaded');
});

// ============================================
// PERFORMANCE: PASSIVE EVENT LISTENERS
// ============================================
window.addEventListener('resize', () => {
    // Re-init mag buttons on resize
    initMagneticButtons();
}, { passive: true });
