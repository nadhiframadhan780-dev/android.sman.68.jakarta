// ============================================
// SMAN 68 JAKARTA — SPLASH SCREEN JS v4.0
// No loading spinner · Blue-Green Theme
// ============================================

// ── FIREBASE ──────────────────────────────────
var firebaseConfig = {
    apiKey:            "AIzaSyDAcKcg3alPOTH3FFGelYmsW7jcMMe2PLI",
    authDomain:        "upnvjdatsystem.firebaseapp.com",
    databaseURL:       "https://upnvjdatsystem-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId:         "upnvjdatsystem",
    storageBucket:     "upnvjdatsystem.firebasestorage.app",
    messagingSenderId: "57095309946",
    appId:             "1:57095309946:web:b0e9f3f86380d549ffc9c3"
};
firebase.initializeApp(firebaseConfig);
var db = firebase.firestore();

// ── STATE ─────────────────────────────────────
var isMaintenance       = false;
var countdownValue      = 3;
var countdownTimer      = null;
var redirectTimer       = null;
var progressTimer       = null;
var progressVal         = 0;
var maintCountdownTimer = null;
var maintEndTime        = null;
var redirectCanceled    = false;

// ── HELPERS ───────────────────────────────────
function ge(id) { return document.getElementById(id); }
function pad(n) { return String(Math.max(0, Math.floor(n))).padStart(2, '0'); }

// ── PARTICLES (Canvas) ────────────────────────
function initParticles() {
    var canvas = ge('spCanvas');
    if (!canvas) return;
    var ctx = canvas.getContext('2d');
    var W, H, particles = [];

    function resize() {
        W = canvas.width  = window.innerWidth;
        H = canvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener('resize', resize, { passive: true });

    var isMobile = window.innerWidth < 768;
    var count    = isMobile ? 18 : 38;

    for (var i = 0; i < count; i++) {
        particles.push({
            x:    Math.random() * (window.innerWidth  || 400),
            y:    Math.random() * (window.innerHeight || 800),
            r:    Math.random() * 2.2 + 0.6,
            vy:   -(Math.random() * 0.45 + 0.18),
            vx:   (Math.random() - 0.5) * 0.28,
            o:    Math.random() * 0.35 + 0.08,
            // Blue, teal/green, white mix
            color: [
                'rgba(96,165,250,',
                'rgba(52,211,153,',
                'rgba(147,197,253,',
                'rgba(255,255,255,'
            ][Math.floor(Math.random() * 4)]
        });
    }

    function draw() {
        ctx.clearRect(0, 0, W, H);
        particles.forEach(function(p) {
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
            ctx.fillStyle = p.color + p.o + ')';
            ctx.fill();
            p.x += p.vx;
            p.y += p.vy;
            if (p.y < -10) { p.y = H + 10; p.x = Math.random() * W; }
            if (p.x < -10 || p.x > W + 10) { p.x = Math.random() * W; }
        });
        requestAnimationFrame(draw);
    }
    draw();
}

// ── PARALLAX ──────────────────────────────────
function initParallax() {
    var bg = ge('spBg');
    if (!bg || window.innerWidth < 768) return;
    document.addEventListener('mousemove', function(e) {
        var xp = (e.clientX / window.innerWidth  - 0.5) * 2;
        var yp = (e.clientY / window.innerHeight - 0.5) * 2;
        bg.style.transform = 'scale(1.12) translate(' + (xp * 6) + 'px,' + (yp * 6) + 'px)';
    }, { passive: true });
}

// ── ENTRANCE ANIMATIONS ───────────────────────
function playEntrance() {
    var items = document.querySelectorAll('.sp-anim');
    items.forEach(function(el) {
        var delay = parseInt(el.getAttribute('data-delay')) || 0;
        setTimeout(function() { el.classList.add('in'); }, delay);
    });
}

// ── PROGRESS BAR ──────────────────────────────
function startProgress(totalMs) {
    progressVal = 0;
    var fill  = ge('spProgressFill');
    var glare = ge('spProgressGlare');
    var fps   = 30;
    var inc   = 100 / ((totalMs / 1000) * fps);

    progressTimer = setInterval(function() {
        progressVal += inc;
        if (progressVal > 100) progressVal = 100;
        var pct = Math.round(progressVal);

        if (fill)  fill.style.width  = pct + '%';
        if (glare) glare.style.width = pct + '%';

        if (pct >= 25) activateStep('spStep1');
        if (pct >= 60) { activateStep('spStep2'); doneStep('spStep1'); updateStatus('Memuat konten…'); }
        if (pct >= 90) { activateStep('spStep3'); doneStep('spStep2'); updateStatus('Mengalihkan portal…'); }

        if (progressVal >= 100) clearInterval(progressTimer);
    }, 1000 / fps);
}

function activateStep(id) {
    var el = ge(id);
    if (el && !el.classList.contains('active')) el.classList.add('active');
}
function doneStep(id) {
    var el = ge(id);
    if (el) { el.classList.remove('active'); el.classList.add('done'); }
}
function updateStatus(text) {
    var el = ge('spStatus');
    if (el) el.textContent = text;
}

// ── COUNTDOWN ─────────────────────────────────
function startCountdown() {
    countdownValue = 3;
    var numEl = ge('spCountNum');
    if (numEl) numEl.textContent = '3';

    startProgress(3000);

    countdownTimer = setInterval(function() {
        countdownValue--;
        if (numEl) {
            numEl.style.transform = 'scale(1.5)';
            numEl.style.opacity   = '0.3';
            setTimeout(function() {
                numEl.style.transform = '';
                numEl.style.opacity   = '1';
                numEl.textContent = Math.max(0, countdownValue);
            }, 120);
        }
        if (countdownValue <= 0) {
            clearInterval(countdownTimer);
            redirectToMain();
        }
    }, 1000);

    redirectTimer = setTimeout(redirectToMain, 4200);
}

// ── REDIRECT ──────────────────────────────────
function redirectToMain() {
    if (isMaintenance || redirectCanceled) return;
    if (countdownTimer) clearInterval(countdownTimer);
    if (redirectTimer)  clearTimeout(redirectTimer);
    if (progressTimer)  clearInterval(progressTimer);

    var trans = ge('spTransition');
    if (trans) {
        trans.classList.add('active');
        setTimeout(function() { window.location.href = './sman68.html'; }, 700);
    } else {
        window.location.href = './sman68.html';
    }
}

// ── SKIP BUTTON ───────────────────────────────
function initSkipButton() {
    var btn = ge('spSkipBtn');
    if (!btn) return;
    btn.addEventListener('click', function(e) {
        e.preventDefault();
        if (!isMaintenance) redirectToMain();
    });
}

// ══════════════════════════════════════════════
// NORMAL MODE — tampil langsung, tanpa spinner
// ══════════════════════════════════════════════
function showNormalMode() {
    isMaintenance    = false;
    redirectCanceled = false;

    var normalScreen = ge('normalScreen');
    var maintScreen  = ge('maintenanceScreen');

    if (maintScreen)  maintScreen.style.display = 'none';
    if (normalScreen) normalScreen.style.display = 'flex';

    if (maintCountdownTimer) clearInterval(maintCountdownTimer);

    // Langsung tampilkan tanpa delay (tidak ada spinner)
    playEntrance();
    setTimeout(startCountdown, 300);
}

// ══════════════════════════════════════════════
// MAINTENANCE MODE
// ══════════════════════════════════════════════
function showMaintenanceMode(data) {
    isMaintenance    = true;
    redirectCanceled = true;

    if (countdownTimer) clearInterval(countdownTimer);
    if (redirectTimer)  clearTimeout(redirectTimer);
    if (progressTimer)  clearInterval(progressTimer);

    var normalScreen = ge('normalScreen');
    var maintScreen  = ge('maintenanceScreen');

    if (normalScreen) normalScreen.style.display = 'none';
    if (maintScreen)  maintScreen.style.display  = 'flex';

    // Isi konten maintenance
    var titleEl  = ge('maintTitle');
    var msgEl    = ge('maintMsg');
    var timeEl   = ge('maintTimeText');
    var statusEl = ge('maintStatusText');

    if (titleEl)  titleEl.textContent  = data.title      || 'Website Sedang Dalam Pemeliharaan';
    if (msgEl)    msgEl.textContent    = data.message    || 'Mohon maaf, website SMAN 68 Jakarta sedang dalam proses pemeliharaan dan peningkatan sistem. Silakan kunjungi kembali beberapa saat lagi.';
    if (statusEl) statusEl.textContent = data.statusText || 'Tim kami sedang bekerja…';

    // Estimasi waktu & countdown
    if (data.endTime) {
        maintEndTime = data.endTime.toDate();
        var formatted = maintEndTime.toLocaleString('id-ID', {
            weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
            hour: '2-digit', minute: '2-digit'
        });
        if (timeEl) timeEl.textContent = 'Selesai: ' + formatted + ' WIB';

        var diff = maintEndTime.getTime() - Date.now();
        if (diff > 0 && diff < 172800000) {
            var cdWrap = ge('maintCountdownWrap');
            if (cdWrap) cdWrap.style.display = 'flex';
            startMaintCountdown(maintEndTime);
        }
        if (diff > 0 && diff < 3600000) {
            setTimeout(function() { checkMaintenanceStatus(); }, diff + 2000);
        }
    } else {
        if (timeEl) timeEl.textContent = 'Estimasi selesai: Segera';
    }

    // Animasi masuk
    var card = maintScreen.querySelector('.sp-card');
    if (card) {
        card.style.opacity   = '0';
        card.style.transform = 'translateY(28px) scale(.97)';
        setTimeout(function() {
            card.style.transition = 'opacity .7s ease, transform .7s cubic-bezier(.34,1.56,.64,1)';
            card.style.opacity    = '1';
            card.style.transform  = 'translateY(0) scale(1)';
        }, 80);
    }
}

// ── Countdown maintenance ─────────────────────
function startMaintCountdown(endTime) {
    if (maintCountdownTimer) clearInterval(maintCountdownTimer);

    function tick() {
        var now  = Date.now();
        var diff = endTime.getTime() - now;

        if (diff <= 0) {
            clearInterval(maintCountdownTimer);
            setTimeout(function() { checkMaintenanceStatus(); }, 1500);
            return;
        }

        var days  = diff / 86400000;
        var hours = (diff % 86400000) / 3600000;
        var mins  = (diff % 3600000)  / 60000;
        var secs  = (diff % 60000)    / 1000;

        var dEl = ge('maintDaysNum');
        var hEl = ge('maintHoursNum');
        var mEl = ge('maintMinsNum');
        var sEl = ge('maintSecsNum');

        if (dEl) dEl.textContent = pad(days);
        if (hEl) hEl.textContent = pad(hours);
        if (mEl) mEl.textContent = pad(mins);
        if (sEl) sEl.textContent = pad(secs);
    }
    tick();
    maintCountdownTimer = setInterval(tick, 1000);
}

// ══════════════════════════════════════════════
// FIREBASE — CHECK MAINTENANCE
// ══════════════════════════════════════════════
window.checkMaintenanceStatus = async function() {
    try {
        var doc = await db.collection('settings').doc('maintenance').get();

        if (!doc.exists) { showNormalMode(); return; }

        var data = doc.data();
        if (data.active !== true) { showNormalMode(); return; }

        if (data.endTime) {
            var endT = data.endTime.toDate();
            if (Date.now() > endT.getTime()) {
                try {
                    await db.collection('settings').doc('maintenance').update({
                        active:    false,
                        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
                    });
                } catch(e2) {}
                showNormalMode();
                return;
            }
        }

        showMaintenanceMode(data);

    } catch(err) {
        console.warn('Firebase check error:', err);
        showNormalMode(); // Gagal koneksi → tampilkan normal
    }
};

// ── Realtime listener ─────────────────────────
function setupRealtimeListener() {
    try {
        db.collection('settings').doc('maintenance')
            .onSnapshot(function(doc) {
                if (!doc.exists) { if (isMaintenance) showNormalMode(); return; }
                var data = doc.data();
                if (data.active === true) {
                    if (!isMaintenance) showMaintenanceMode(data);
                    else {
                        var tEl = ge('maintTitle');
                        var mEl = ge('maintMsg');
                        var sEl = ge('maintStatusText');
                        if (tEl && data.title)      tEl.textContent  = data.title;
                        if (mEl && data.message)    mEl.textContent  = data.message;
                        if (sEl && data.statusText) sEl.textContent  = data.statusText;
                    }
                } else {
                    if (isMaintenance) showNormalMode();
                }
            }, function(err) { console.warn('Snapshot err:', err); });
    } catch(e) {}
}

// ── Auto refresh setiap 30 detik ──────────────
function setupAutoRefresh() {
    setInterval(async function() {
        if (!isMaintenance) return;
        try {
            var doc = await db.collection('settings').doc('maintenance').get();
            if (!doc.exists || doc.data().active !== true) { showNormalMode(); return; }
            if (doc.data().endTime) {
                var et = doc.data().endTime.toDate();
                if (Date.now() > et.getTime()) {
                    await db.collection('settings').doc('maintenance').update({
                        active: false, updatedAt: firebase.firestore.FieldValue.serverTimestamp()
                    });
                    showNormalMode();
                }
            }
        } catch(e) {}
    }, 30000);
}

// ══════════════════════════════════════════════
// INIT — Langsung cek Firebase, tidak perlu spinner
// ══════════════════════════════════════════════
function init() {
    initParticles();
    initParallax();
    initSkipButton();
    setupAutoRefresh();
    checkMaintenanceStatus();   // Langsung cek, tampilkan hasil
    setupRealtimeListener();
    console.log('✅ SMAN 68 — Splash Screen v4.0 loaded');
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
