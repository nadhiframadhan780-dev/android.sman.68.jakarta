/* ══════════════════════════════════════════════════
   UNDUH KARTU PESERTA – SMAN 68 Jakarta
   Firebase Firestore + PDF + QR + Session
   v2.0 – With photo upload, stamp image, home button
══════════════════════════════════════════════════ */

// ── Firebase Config ──────────────────────────────
const firebaseConfig = {
  apiKey: "AIzaSyDAcKcg3alPOTH3FFGelYmsW7jcMMe2PLI",
  authDomain: "upnvjdatsystem.firebaseapp.com",
  projectId: "upnvjdatsystem",
  storageBucket: "upnvjdatsystem.firebasestorage.app",
  messagingSenderId: "57095309946",
  appId: "1:57095309946:web:b0e9f3f86380d549ffc9c3"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// ── State ────────────────────────────────────────
let currentPeserta  = null;
let jadwalData      = null;
let fotoBase64      = null;   // foto yang baru dipilih tapi belum disimpan
let fotoTersimpan   = null;   // foto yang sudah tersimpan di Firestore
let stampBase64     = null;   // stempel sekolah (dari file yang diupload)

/* ══════════════════════════════════════════════════════
   JADWAL MASA UNDUH KARTU — ATUR DI SINI
   Format: 'YYYY-MM-DDTHH:MM:SS' (waktu lokal server/Jakarta)

   Skenario yang didukung:
   1. downloadOpen = null, downloadClose = null  → tidak ada banner
   2. downloadOpen = null, downloadClose = tgl   → langsung buka, hitung mundur penutupan
   3. downloadOpen = tgl,  downloadClose = null  → hitung mundur pembukaan, setelah buka tidak ada batas
   4. downloadOpen = tgl,  downloadClose = tgl   → hitung mundur pembukaan, lalu hitung mundur penutupan
══════════════════════════════════════════════════════ */
const JADWAL_UNDUH = {
  downloadOpen:  null,                   // contoh: '2025-07-15T08:00:00'
  downloadClose: '2026-06-08T15:00:59',  // contoh: '2025-08-01T23:59:59'
};
/* ─────────────────────────────────────────────────── */

// ── State countdown ───────────────────────────────
let _cdInterval = null;

/* ══════════════════════════════════════════════════════
   MASA UNDUH — ENGINE (GATE FULLSCREEN)
══════════════════════════════════════════════════════ */

/** Hitung status masa unduh berdasarkan waktu sekarang */
function getMasaUnduhStatus() {
  const now   = new Date();
  const open  = JADWAL_UNDUH.downloadOpen  ? new Date(JADWAL_UNDUH.downloadOpen)  : null;
  const close = JADWAL_UNDUH.downloadClose ? new Date(JADWAL_UNDUH.downloadClose) : null;

  if (!open && !close)          return { mode: 'open' };
  if (close && now >= close)    return { mode: 'closed' };
  if (open  && now <  open)     return { mode: 'opening', target: open };
  if (close && now <  close)    return { mode: 'open' };
  return { mode: 'open' };
}

const LOGO_URL = 'https://upload.wikimedia.org/wikipedia/id/1/19/Logo_SMAN_68_Jakarta.png';

function _schoolHeader() {
  return `
    <div class="gate-school-header">
      <img src="${LOGO_URL}" alt="Logo SMAN 68" />
      <div class="gate-school-text">
        <h1>SMAN 68 Jakarta</h1>
        <p>Sistem Penerimaan Murid Mutasi</p>
      </div>
    </div>
    <div class="gate-divider"></div>`;
}

function _cdHTML(target) {
  const diff = Math.max(0, target - new Date());
  const d = Math.floor(diff / 86400000);
  const h = Math.floor((diff % 86400000) / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  const s = Math.floor((diff % 60000)   / 1000);
  const pad = n => String(n).padStart(2, '0');
  return `
    <div class="cd-unit"><span class="cd-num" id="cdD">${pad(d)}</span><span class="cd-label">HARI</span></div>
    <span class="cd-sep">:</span>
    <div class="cd-unit"><span class="cd-num" id="cdH">${pad(h)}</span><span class="cd-label">JAM</span></div>
    <span class="cd-sep">:</span>
    <div class="cd-unit"><span class="cd-num" id="cdM">${pad(m)}</span><span class="cd-label">MENIT</span></div>
    <span class="cd-sep">:</span>
    <div class="cd-unit"><span class="cd-num" id="cdS">${pad(s)}</span><span class="cd-label">DETIK</span></div>`;
}

function _tickCD(target) {
  const diff = Math.max(0, target - new Date());
  const d = Math.floor(diff / 86400000);
  const h = Math.floor((diff % 86400000) / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  const s = Math.floor((diff % 60000)   / 1000);
  const pad = n => String(n).padStart(2, '0');
  const q = id => document.getElementById(id);
  if (q('cdD')) q('cdD').textContent = pad(d);
  if (q('cdH')) q('cdH').textContent = pad(h);
  if (q('cdM')) q('cdM').textContent = pad(m);
  if (q('cdS')) q('cdS').textContent = pad(s);
}

/** Render konten di dalam gate-card sesuai mode */
function _gateCardHTML(status) {
  if (status.mode === 'closed') {
    return `
      <div class="gate-card">
        ${_schoolHeader()}
        <div class="gate-icon-wrap closed-icon"><i class="fa-solid fa-lock"></i></div>
        <h2 class="gate-title closed">Masa Unduh Kartu Calon Siswa Mutasi Telah Ditutup</h2>
        <p class="gate-subtitle">Terima kasih telah mendaftar. Hubungi operator sekolah untuk informasi lebih lanjut.</p>
        <div class="gate-footer"><i class="fa-solid fa-shield-check"></i> Portal Resmi – SMAN 68 Jakarta</div>
        <a href="./sman68.html" class="btn-home-footer gate-home-btn">
          <i class="fa-solid fa-house"></i> Kembali ke Beranda
        </a>
      </div>`;
  }

  if (status.mode === 'opening') {
    return `
      <div class="gate-card">
        ${_schoolHeader()}
        <div class="gate-icon-wrap opening-icon"><i class="fa-solid fa-clock-rotate-left"></i></div>
        <h2 class="gate-title">Masa Unduh Kartu Peserta</h2>
        <p class="gate-subtitle">Silakan menunggu. Unduh kartu peserta akan segera dibuka.</p>
        <p class="gate-countdown-label">Masa Unduh Dibuka Dalam</p>
        <div class="countdown-units">${_cdHTML(status.target)}</div>
        <div class="gate-footer"><i class="fa-solid fa-shield-check"></i> Portal Resmi – SMAN 68 Jakarta</div>
        <a href="./sman68.html" class="btn-home-footer gate-home-btn">
          <i class="fa-solid fa-house"></i> Kembali ke Beranda
        </a>
      </div>`;
  }

  return ''; // mode 'open' → tidak perlu gate
}

/**
 * Buat HTML bar countdown untuk banner atas (login & dashboard).
 * Hanya muncul saat mode 'open' DAN ada jadwal downloadClose.
 */
function _bannerBarHTML(target) {
  return `
    <div class="banner-countdown-bar">
      <div class="bcb-label">
        <i class="fa-solid fa-hourglass-half"></i>
        <span>Masa Unduh Kartu Ditutup Dalam</span>
      </div>
      <div class="countdown-units">
        ${_cdHTML(target)}
      </div>
    </div>`;
}

/**
 * Init gate masa unduh + banner countdown atas.
 *
 * mode closed / opening → gate fullscreen, form login hidden, banner hidden
 * mode open + ada close → form login tampil, banner countdown tampil di atas
 * mode open + tdk ada close → form login tampil, tidak ada banner
 */
function initMasaUnduhBanner() {
  if (_cdInterval) { clearInterval(_cdInterval); _cdInterval = null; }

  const status  = getMasaUnduhStatus();
  const gate    = document.getElementById('masaUnduhGate');
  const inner   = document.getElementById('loginPageInner');
  const gCont   = document.getElementById('gateContent');
  const bannerLogin  = document.getElementById('bannerLogin');
  const bannerDash   = document.getElementById('bannerDashboard');

  const blockLogin   = (status.mode === 'closed' || status.mode === 'opening');
  const showCountBar = (status.mode === 'open' && !!JADWAL_UNDUH.downloadClose);

  // ── Gate fullscreen ──────────────────────────────
  if (blockLogin) {
    gCont.innerHTML = _gateCardHTML(status);
    gate.classList.remove('hidden');
    if (inner) inner.style.display = 'none';
  } else {
    gate.classList.add('hidden');
    if (inner) inner.style.display = '';
  }

  // ── Banner countdown atas (login & dashboard) ──
  const closeTarget = JADWAL_UNDUH.downloadClose ? new Date(JADWAL_UNDUH.downloadClose) : null;
  const barHTML = showCountBar ? _bannerBarHTML(closeTarget) : '';

  if (bannerLogin)  bannerLogin.innerHTML  = barHTML;
  if (bannerDash)   bannerDash.innerHTML   = barHTML;

  // Geser form login bawah jika ada banner
  if (inner) {
    if (showCountBar) inner.classList.add('with-banner');
    else              inner.classList.remove('with-banner');
  }

  // ── Tick countdown ───────────────────────────────
  if (status.mode === 'opening') {
    // Countdown pembukaan — saat 0 switch ke open
    _cdInterval = setInterval(() => {
      if (status.target - new Date() <= 0) {
        clearInterval(_cdInterval); _cdInterval = null;
        initMasaUnduhBanner();
        return;
      }
      _tickCD(status.target);
    }, 1000);

  } else if (showCountBar && closeTarget) {
    // Countdown penutupan — tick angka di banner atas
    _cdInterval = setInterval(() => {
      if (closeTarget - new Date() <= 0) {
        clearInterval(_cdInterval); _cdInterval = null;
        initMasaUnduhBanner(); // switch ke closed
        return;
      }
      _tickCD(closeTarget);
    }, 1000);
  }
}

// ── Daftar Berkas ────────────────────────────────
const BERKAS_LIST = [
  { key: 'nilaiRapor',         label: 'Nilai Rapor',                icon: 'fa-file-lines' },
  { key: 'pasFoto',            label: 'Pas Foto',                   icon: 'fa-image' },
  { key: 'aktaLahir',          label: 'Akta Kelahiran',             icon: 'fa-scroll' },
  { key: 'kartuKeluarga',      label: 'Kartu Keluarga',             icon: 'fa-users' },
  { key: 'ktpOrKia',           label: 'KTP / KIA / Kartu Pelajar', icon: 'fa-id-card' },
  { key: 'suratBaik',          label: 'Surat Keterangan Baik',      icon: 'fa-certificate' },
  { key: 'suratSehat',         label: 'Surat Kesehatan',            icon: 'fa-heart-pulse' },
  { key: 'suratPindahOrtu',    label: 'Surat Permohonan Pindah',   icon: 'fa-file-export' },
  { key: 'suratPindahSekolah', label: 'Surat Keterangan Pindah',   icon: 'fa-school' },
  { key: 'linkSuratPernyataan', label: 'Surat Pernyataan',         icon: 'fa-file-signature', isRoot: true }
];

/* ═══════════════════════════════════════════════════════
   LOAD STAMP IMAGE from embedded base64
═══════════════════════════════════════════════════════ */
async function loadStampImage() {
  // Muat gambar stempel dari file yang diunggah (disimpan di Firestore)
  // Jika tidak tersedia dari Firestore, coba load dari path relatif
  try {
    const stampSnap = await db.collection('aset').doc('stempelSekolah').get();
    if (stampSnap.exists && stampSnap.data().base64) {
      stampBase64 = stampSnap.data().base64;
    } else {
      // Fallback: load gambar stempel dari path lokal via fetch
      await loadStampFromLocal();
    }
  } catch {
    await loadStampFromLocal();
  }
}

async function loadStampFromLocal() {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    // Coba load dari path relatif (gambar stempel yang diupload admin)
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width; canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0);
      try { stampBase64 = canvas.toDataURL('image/png'); } catch { stampBase64 = null; }
      resolve();
    };
    img.onerror = () => { stampBase64 = null; resolve(); };
    img.src = './1780197522531_image.png';
  });
}

/* ═══════════════════════════════════════════════════════
   UTILITIES
═══════════════════════════════════════════════════════ */
function showLoading(text = 'Memuat data...') {
  document.getElementById('loadingText').textContent = text;
  document.getElementById('loadingOverlay').classList.remove('hidden');
}
function hideLoading() {
  document.getElementById('loadingOverlay').classList.add('hidden');
}

function showToast(msg, type = 'info') {
  const icons = { success: 'fa-circle-check', error: 'fa-circle-exclamation', info: 'fa-circle-info' };
  const el = document.createElement('div');
  el.className = `toast toast-${type}`;
  el.innerHTML = `<i class="fa-solid ${icons[type]}"></i><span>${msg}</span>`;
  document.getElementById('toastContainer').appendChild(el);
  setTimeout(() => {
    el.style.opacity = '0';
    el.style.transform = 'translateX(100px)';
    el.style.transition = '.3s';
    setTimeout(() => el.remove(), 300);
  }, 4500);
}

function showPage(pageId) {
  document.querySelectorAll('.page').forEach(p => { p.classList.remove('active'); p.classList.add('hidden'); });
  const pg = document.getElementById(pageId);
  pg.classList.remove('hidden');
  pg.classList.add('active');
}

function formatTanggal(val) {
  if (!val) return '-';
  if (val?.toDate) val = val.toDate();
  if (val instanceof Date) return val.toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' });
  if (typeof val === 'string') {
    const d = new Date(val);
    if (!isNaN(d)) return d.toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' });
    return val;
  }
  return '-';
}

function formatTglInput(val) {
  if (!val) return '';
  if (val?.toDate) val = val.toDate();
  if (val instanceof Date) return val.toISOString().split('T')[0];
  if (typeof val === 'string') return val.slice(0, 10);
  return '';
}

/* ═══════════════════════════════════════════════════════
   SESSION + DEVICE TOKEN (1 device enforcement)
═══════════════════════════════════════════════════════ */
function generateDeviceToken() {
  let t = localStorage.getItem('sman68_device_token');
  if (!t) {
    t = 'dev_' + Date.now() + '_' + Math.random().toString(36).slice(2, 10);
    localStorage.setItem('sman68_device_token', t);
  }
  return t;
}
const DEVICE_TOKEN = generateDeviceToken();

function saveSession(data) { localStorage.setItem('sman68_peserta', JSON.stringify(data)); }
function getSession() { try { return JSON.parse(localStorage.getItem('sman68_peserta')); } catch { return null; } }
function clearSession() { localStorage.removeItem('sman68_peserta'); }

// Listener Firestore untuk deteksi logout paksa (1 device)
let deviceListener = null;

async function registerDevice(noDaftar) {
  // Tulis token device ke Firestore
  await db.collection('sesiAktif').doc(noDaftar).set({
    deviceToken: DEVICE_TOKEN,
    loginAt: new Date().toISOString(),
    userAgent: navigator.userAgent.slice(0, 120)
  });
}

function startDeviceListener(noDaftar) {
  if (deviceListener) deviceListener(); // unsubscribe lama
  deviceListener = db.collection('sesiAktif').doc(noDaftar)
    .onSnapshot(snap => {
      if (!snap.exists) return;
      const token = snap.data()?.deviceToken;
      // Jika token di Firestore beda = device lain login → paksa logout
      if (token && token !== DEVICE_TOKEN && currentPeserta) {
        stopDeviceListener();
        clearSession();
        currentPeserta = null;
        fotoBase64 = null;
        fotoTersimpan = null;
        showForcedLogoutOverlay('device');
      }
    }, err => console.warn('device listener:', err));
}

function stopDeviceListener() {
  if (deviceListener) { deviceListener(); deviceListener = null; }
}

function showForcedLogoutOverlay(reason) {
  // Hapus overlay lama kalau ada
  const existing = document.getElementById('forcedLogoutOverlay');
  if (existing) existing.remove();

  const msg = reason === 'masa'
    ? 'Masa unduh kartu peserta telah ditutup. Anda telah dikeluarkan secara otomatis.'
    : 'Akun Anda telah masuk dari perangkat lain. Sesi di perangkat ini diakhiri.';
  const icon = reason === 'masa' ? 'fa-clock' : 'fa-mobile-screen-button';

  const overlay = document.createElement('div');
  overlay.id = 'forcedLogoutOverlay';
  overlay.className = 'forced-logout-overlay';
  overlay.innerHTML = `
    <div class="forced-logout-card">
      <div class="forced-logout-icon"><i class="fa-solid ${icon}"></i></div>
      <h3>${reason === 'masa' ? 'Masa Unduh Ditutup' : 'Sesi Berakhir'}</h3>
      <p>${msg}</p>
      <button class="btn-forced-ok" onclick="
        document.getElementById('forcedLogoutOverlay').remove();
        fotoBase64 = null; fotoTersimpan = null;
        var imgP = document.getElementById('fotoPreviewImg');
        if(imgP){ imgP.removeAttribute('src'); imgP.src=''; imgP.classList.add('hidden'); }
        var fpHolder = document.getElementById('fotoPreviewPlaceholder');
        if(fpHolder) fpHolder.classList.remove('hidden');
        var inpF = document.getElementById('inputFoto');
        if(inpF) inpF.value='';
        document.getElementById('inputNoDaftar').value='';
        document.getElementById('inputTglLahir').value='';
        document.getElementById('statusCard').className='status-card hidden';
        showPage('loginPage');
        initMasaUnduhBanner();
      ">
        <i class="fa-solid fa-right-to-bracket"></i> Kembali ke Halaman Login
      </button>
    </div>`;
  document.body.appendChild(overlay);
}

/* ═══════════════════════════════════════════════════════
   TAB SYSTEM
═══════════════════════════════════════════════════════ */
function switchTab(btn, tabId) {
  // Deactivate all tabs
  document.querySelectorAll('.dash-tab').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.dash-tab-pane').forEach(p => {
    p.classList.remove('active');
    p.classList.add('hidden');
  });
  // Activate chosen
  btn.classList.add('active');
  const pane = document.getElementById(tabId);
  pane.classList.remove('hidden');
  pane.classList.add('active');
  // Scroll tab into view on mobile
  btn.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
}

/* ═══════════════════════════════════════════════════════
   INIT
═══════════════════════════════════════════════════════ */
window.addEventListener('DOMContentLoaded', async () => {
  initMasaUnduhBanner();
  loadStampImage();

  const session = getSession();
  if (session?.noDaftar) {
    showLoading('Memuat sesi...');
    try {
      // Cek masa unduh dulu — jika tutup, jangan restore sesi
      const masaStatus = getMasaUnduhStatus();
      if (masaStatus.mode === 'closed') {
        clearSession();
        hideLoading();
        showPage('loginPage');
        return;
      }

      const snap = await db.collection('pendaftaranMutasi')
        .where('noDaftar', '==', session.noDaftar).limit(1).get();

      if (!snap.empty) {
        const data = snap.docs[0].data();
        if (data.status === 'diterima') {
          currentPeserta = data;
          renderDashboard(data);
          showPage('dashboardPage');
          initMasaUnduhBanner();
          // Register device + start listener
          await registerDevice(data.noDaftar);
          startDeviceListener(data.noDaftar);
          // Auto-logout watcher jika masa tutup
          startMasaTutupWatcher();
          showToast('Selamat datang kembali, ' + data.nama + '!', 'success');
          hideLoading();
          return;
        }
      }
    } catch(e) { console.warn(e); }
    clearSession();
    hideLoading();
  }
  showPage('loginPage');
});

/* ═══════════════════════════════════════════════════════
   MASA TUTUP WATCHER — auto-logout saat masa unduh tutup
═══════════════════════════════════════════════════════ */
let _masaTutupWatcher = null;
function startMasaTutupWatcher() {
  if (_masaTutupWatcher) clearInterval(_masaTutupWatcher);
  _masaTutupWatcher = setInterval(() => {
    if (!currentPeserta) { clearInterval(_masaTutupWatcher); return; }
    const st = getMasaUnduhStatus();
    if (st.mode === 'closed') {
      clearInterval(_masaTutupWatcher);
      stopDeviceListener();
      clearSession();
      currentPeserta = null;
      fotoBase64 = null;
      fotoTersimpan = null;
      showForcedLogoutOverlay('masa');
    }
  }, 5000); // cek setiap 5 detik
}

/* ═══════════════════════════════════════════════════════
   LOGIN
═══════════════════════════════════════════════════════ */
async function handleLogin() {
  const noDaftar = document.getElementById('inputNoDaftar').value.trim();
  const tglLahir = document.getElementById('inputTglLahir').value;

  if (!noDaftar || !tglLahir) {
    showToast('Nomor pendaftaran dan tanggal lahir wajib diisi.', 'error');
    return;
  }

  // Cek masa unduh sebelum proses login
  const masaStatus = getMasaUnduhStatus();
  if (masaStatus.mode === 'closed') {
    showToast('Masa unduh kartu peserta telah ditutup.', 'error');
    return;
  }

  document.getElementById('btnLoginText').classList.add('hidden');
  document.getElementById('btnLoginLoader').classList.remove('hidden');
  document.getElementById('statusCard').className = 'status-card hidden';

  try {
    const snap = await db.collection('pendaftaranMutasi')
      .where('noDaftar', '==', noDaftar).limit(1).get();

    if (snap.empty) {
      showStatusCard('error', 'fa-circle-xmark', 'Nomor pendaftaran tidak ditemukan. Periksa kembali nomor Anda.');
      showToast('Nomor pendaftaran tidak ditemukan.', 'error');
      resetLoginBtn(); return;
    }

    const data = snap.docs[0].data();
    const tglDB    = formatTglInput(data.tglLahir);
    const tglInput = tglLahir.slice(0, 10);

    if (tglDB !== tglInput) {
      showStatusCard('error', 'fa-circle-xmark', 'Tanggal lahir tidak sesuai. Periksa kembali.');
      showToast('Tanggal lahir tidak sesuai.', 'error');
      resetLoginBtn(); return;
    }

    const status = (data.status || '').toLowerCase();
    if (status === 'pending') { showStatusCard('pending', 'fa-clock', 'Pendaftaran Anda masih menunggu verifikasi operator.', data.catatanOperator); resetLoginBtn(); return; }
    if (status === 'proses')  { showStatusCard('proses', 'fa-spinner', 'Berkas Anda sedang diproses operator.', data.catatanOperator); resetLoginBtn(); return; }
    if (status === 'ditolak') { showStatusCard('ditolak', 'fa-circle-xmark', 'Pendaftaran Anda tidak disetujui.', data.catatanOperator); resetLoginBtn(); return; }
    if (status !== 'diterima') { showStatusCard('error', 'fa-circle-xmark', 'Status pendaftaran tidak dikenali. Hubungi operator.'); resetLoginBtn(); return; }

    currentPeserta = data;
    saveSession({ noDaftar: data.noDaftar });

    // Register device (ini akan memicu logout di device lain)
    await registerDevice(data.noDaftar);
    startDeviceListener(data.noDaftar);
    startMasaTutupWatcher();

    renderDashboard(data);
    showPage('dashboardPage');
    initMasaUnduhBanner();
    showToast('Login berhasil! Selamat datang, ' + data.nama + '.', 'success');

  } catch (err) {
    console.error(err);
    showToast('Terjadi kesalahan jaringan. Coba lagi.', 'error');
  }

  resetLoginBtn();
}

function resetLoginBtn() {
  document.getElementById('btnLoginText').classList.remove('hidden');
  document.getElementById('btnLoginLoader').classList.add('hidden');
}

function showStatusCard(type, icon, msg, catatan) {
  const sc = document.getElementById('statusCard');
  const typeMap = { pending: 'pending', proses: 'proses', ditolak: 'ditolak', error: 'ditolak' };
  sc.className = `status-card ${typeMap[type] || 'ditolak'}`;
  sc.innerHTML = `<i class="fa-solid ${icon}"></i>
    <div>
      <div>${msg}</div>
      ${catatan ? `<div class="catatan"><strong>Catatan Operator:</strong> ${catatan}</div>` : ''}
    </div>`;
  sc.classList.remove('hidden');
}

document.addEventListener('keydown', e => {
  if (e.key === 'Enter' && document.getElementById('loginPage').classList.contains('active')) handleLogin();
});

/* ═══════════════════════════════════════════════════════
   LOGOUT
═══════════════════════════════════════════════════════ */
async function handleLogout() {
  stopDeviceListener();
  if (_masaTutupWatcher) { clearInterval(_masaTutupWatcher); _masaTutupWatcher = null; }
  try {
    if (currentPeserta?.noDaftar) await db.collection('sesiAktif').doc(currentPeserta.noDaftar).delete();
  } catch(e) {}
  clearSession();
  currentPeserta = null;
  fotoBase64     = null;
  fotoTersimpan  = null;

  // Hard reset elemen foto agar tidak ada sisa foto siswa lain
  const imgPreview = document.getElementById('fotoPreviewImg');
  if (imgPreview) { imgPreview.removeAttribute('src'); imgPreview.src = ''; imgPreview.classList.add('hidden'); }
  const fotoPlaceholder = document.getElementById('fotoPreviewPlaceholder');
  if (fotoPlaceholder) fotoPlaceholder.classList.remove('hidden');
  const inputFoto = document.getElementById('inputFoto');
  if (inputFoto) inputFoto.value = '';
  const btnSimpan = document.getElementById('btnSimpanFoto');
  if (btnSimpan) btnSimpan.disabled = true;

  document.getElementById('inputNoDaftar').value = '';
  document.getElementById('inputTglLahir').value = '';
  document.getElementById('statusCard').className = 'status-card hidden';
  showPage('loginPage');
  initMasaUnduhBanner();
  showToast('Anda telah keluar dari sistem.', 'info');
}

/* ═══════════════════════════════════════════════════════
   RENDER DASHBOARD
═══════════════════════════════════════════════════════ */
function renderDashboard(data) {
  document.getElementById('navNama').textContent     = data.nama || '';
  document.getElementById('welcomeName').textContent = 'Selamat datang, ' + (data.nama || '') + '!';

  renderDataSiswa(data);
  renderStatusBerkas(data);
  fetchAndRenderJadwal(data.noDaftar);
  renderFotoSection(data);
  updateEditButton(data);
}

/* ── Data Siswa ── */
function renderDataSiswa(data) {
  const jkMap = { L: 'Laki-laki', P: 'Perempuan' };
  const fields = [
    { label: 'Nomor Pendaftaran', value: data.noDaftar || '-' },
    { label: 'Nama Lengkap',      value: data.nama || '-' },
    { label: 'Tanggal Lahir',     value: formatTanggal(data.tglLahir) },
    { label: 'Jenis Kelamin',     value: jkMap[data.jk] || data.jk || '-' },
    { label: 'Agama',             value: data.agama || '-' },
    { label: 'Sekolah Asal',      value: data.sekolahAsal || '-', wide: true },
    { label: 'Kelas Saat Ini',    value: data.kelasSaatIni || '-' },
    { label: 'Mutasi ke Kelas',   value: data.mutasiKe || '-' },
    { label: 'NISN',              value: data.nisn || '-' },
    { label: 'NPSN Sekolah Asal', value: data.npsn || '-' },
    { label: 'Email',             value: data.email || '-' },
    { label: 'No. HP Siswa',      value: data.telpMurid || '-' },
    { label: 'No. HP Orang Tua',  value: data.telpOrtu || '-' },
    { label: 'Alasan Pindah',     value: data.alasanPindah || '-', wide: true },
  ];

  const grid = document.getElementById('dataSiswaGrid');
  grid.innerHTML = fields.map(f =>
    `<div class="data-item${f.wide ? ' wide' : ''}">
      <div class="di-label">${f.label}</div>
      <div class="di-value">${f.value}</div>
    </div>`
  ).join('');
}

/* ── Status Berkas ── */
function renderStatusBerkas(data) {
  // Firestore bisa simpan dokumen di beberapa lokasi berbeda tergantung form pendaftaran
  const dokumen = data.dokumen || data.docs || data.berkas || {};
  const grid    = document.getElementById('statusBerkasGrid');
  grid.innerHTML = '';

  BERKAS_LIST.forEach(b => {
    let link = '';
    if (b.isRoot) {
      // Field di root document
      link = data[b.key] || data.linkSuratPernyataan || data.linkSurat || '';
    } else {
      // Cek di nested object DULU, lalu fallback ke root
      link = dokumen[b.key] || data[b.key] || '';
    }
    const valid = !!(link && String(link).trim() !== '' && String(link).trim() !== '-');

    grid.innerHTML += `
      <div class="berkas-item">
        <div class="berkas-icon ${valid ? 'valid' : 'missing'}">
          <i class="fa-solid ${valid ? 'fa-circle-check' : b.icon}"></i>
        </div>
        <div>
          <div class="berkas-name">${b.label}</div>
          <div class="berkas-status ${valid ? 'valid' : 'missing'}">
            ${valid ? '✓ Terverifikasi' : '— Belum ada'}
          </div>
        </div>
        ${valid ? `<a href="${link}" target="_blank" style="margin-left:auto;font-size:.75rem;color:var(--blue-main);font-weight:600;text-decoration:none;" title="Lihat dokumen"><i class="fa-solid fa-arrow-up-right-from-square"></i></a>` : ''}
      </div>`;
  });
}

/* ── Jadwal ── */
async function fetchAndRenderJadwal(noDaftar) {
  const container = document.getElementById('jadwalContainer');
  try {
    let jadwal = null;

    const snap = await db.collection('jadwalMutasi').limit(1).get();
    if (!snap.empty) jadwal = snap.docs[0].data();

    const snapPeserta = await db.collection('pendaftaranMutasi')
      .where('noDaftar', '==', noDaftar).limit(1).get();

    if (!snapPeserta.empty) {
      const d = snapPeserta.docs[0].data();
      if (d.jadwalTes || d.jadwalWawancara) jadwal = { ...jadwal, ...d };
    }

    if (!jadwal || (!jadwal.jadwalTes && !jadwal.jadwalWawancara && !jadwal.lokasiTes)) {
      container.innerHTML = `<div class="jadwal-empty"><i class="fa-regular fa-calendar-xmark"></i><p>Jadwal belum tersedia. Silakan cek berkala.</p></div>`;
      return;
    }

    let html = '<div class="jadwal-timeline">';
    if (jadwal.jadwalTes)       html += buildJadwalItem('Tes Seleksi', jadwal.jadwalTes, jadwal.lokasiTes, 'fa-pencil');
    if (jadwal.jadwalWawancara) html += buildJadwalItem('Wawancara', jadwal.jadwalWawancara, jadwal.lokasiWawancara, 'fa-comments');
    if (jadwal.catatanPeserta) {
      html += `<div class="jt-item" style="background:var(--blue-pale);border:1px solid #bfdbfe;border-radius:10px;padding:12px 16px;font-size:.82rem;color:var(--blue-dark);">
        <i class="fa-solid fa-circle-info" style="margin-right:8px;"></i>${jadwal.catatanPeserta}
      </div>`;
    }
    html += '</div>';
    container.innerHTML = html;
    jadwalData = jadwal;

  } catch (err) {
    console.error(err);
    container.innerHTML = `<div class="jadwal-empty"><i class="fa-regular fa-calendar-xmark"></i><p>Jadwal belum tersedia. Silakan cek berkala.</p></div>`;
  }
}

function buildJadwalItem(title, tanggal, lokasi, icon) {
  return `
    <div class="jadwal-item">
      <div class="jt-dot-wrap">
        <div class="jt-dot"></div>
        <div class="jt-line"></div>
      </div>
      <div class="jt-content">
        <div class="jt-title"><i class="fa-solid ${icon}" style="margin-right:6px;color:var(--blue-main);"></i>${title}</div>
        <div class="jt-detail"><i class="fa-solid fa-calendar"></i> ${formatTanggal(tanggal)}</div>
        ${lokasi ? `<div class="jt-detail"><i class="fa-solid fa-location-dot"></i> ${lokasi}</div>` : ''}
      </div>
    </div>`;
}

/* ═══════════════════════════════════════════════════════
   PAS FOTO – UPLOAD & SIMPAN
═══════════════════════════════════════════════════════ */

function renderFotoSection(data) {
  // ── Hard reset semua state foto ──
  fotoTersimpan = null;
  fotoBase64    = null;

  // Reset elemen preview — paksa clear src agar tidak ada cache foto siswa lain
  const img = document.getElementById('fotoPreviewImg');
  if (img) {
    img.removeAttribute('src');
    img.src = '';
    img.classList.add('hidden');
  }
  const placeholder = document.getElementById('fotoPreviewPlaceholder');
  if (placeholder) placeholder.classList.remove('hidden');

  // Reset input file
  const inputFoto = document.getElementById('inputFoto');
  if (inputFoto) inputFoto.value = '';

  // Disable tombol simpan
  const btnSimpan = document.getElementById('btnSimpanFoto');
  if (btnSimpan) btnSimpan.disabled = true;

  setFotoStatus(false);

  // Cek apakah ada foto tersimpan di Firestore milik siswa INI
  const fotoUrl = data.pasFotoKartu || (data.dokumen && data.dokumen.pasFotoKartu) || '';
  if (fotoUrl && fotoUrl.startsWith('data:image')) {
    fotoTersimpan = fotoUrl;
    tampilkanFotoPreview(fotoUrl);
    setFotoStatus(true);
  }
}

function setFotoStatus(adaFoto) {
  const elBelum = document.getElementById('fotoStatusBelum');
  const elAda   = document.getElementById('fotoStatusAda');
  if (adaFoto) {
    elBelum.classList.add('hidden');
    elAda.classList.remove('hidden');
  } else {
    elBelum.classList.remove('hidden');
    elAda.classList.add('hidden');
  }
}

function tampilkanFotoPreview(base64) {
  const img = document.getElementById('fotoPreviewImg');
  const placeholder = document.getElementById('fotoPreviewPlaceholder');
  img.src = base64;
  img.classList.remove('hidden');
  placeholder.classList.add('hidden');
}

function sembunyikanFotoPreview() {
  const img = document.getElementById('fotoPreviewImg');
  const placeholder = document.getElementById('fotoPreviewPlaceholder');
  img.src = '';
  img.classList.add('hidden');
  placeholder.classList.remove('hidden');
}

function handleFotoSelected(event) {
  const file = event.target.files[0];
  if (!file) return;

  // Validasi ukuran
  if (file.size > 2 * 1024 * 1024) {
    showToast('Ukuran foto melebihi 2MB. Pilih foto yang lebih kecil.', 'error');
    event.target.value = '';
    return;
  }

  // Validasi tipe file
  if (!['image/jpeg', 'image/png'].includes(file.type)) {
    showToast('Format foto harus JPG atau PNG.', 'error');
    event.target.value = '';
    return;
  }

  const reader = new FileReader();
  reader.onload = (e) => {
    fotoBase64 = e.target.result;
    tampilkanFotoPreview(fotoBase64);
    // Aktifkan tombol simpan
    document.getElementById('btnSimpanFoto').disabled = false;
    showToast('Foto dipilih. Klik "Simpan Perubahan" untuk menyimpan.', 'info');
  };
  reader.readAsDataURL(file);
}

async function simpanFoto() {
  if (!fotoBase64) {
    showToast('Pilih foto terlebih dahulu.', 'error');
    return;
  }
  if (!currentPeserta?.noDaftar) {
    showToast('Data peserta tidak ditemukan.', 'error');
    return;
  }

  showLoading('Menyimpan foto...');

  try {
    // Simpan base64 foto ke Firestore di field pasFotoKartu
    const snap = await db.collection('pendaftaranMutasi')
      .where('noDaftar', '==', currentPeserta.noDaftar)
      .limit(1).get();

    if (snap.empty) {
      showToast('Data peserta tidak ditemukan di database.', 'error');
      hideLoading();
      return;
    }

    const docRef = snap.docs[0].ref;
    await docRef.update({ pasFotoKartu: fotoBase64 });

    // Update state lokal
    fotoTersimpan = fotoBase64;
    currentPeserta.pasFotoKartu = fotoBase64;
    fotoBase64 = null;

    // Nonaktifkan tombol simpan
    document.getElementById('btnSimpanFoto').disabled = true;
    setFotoStatus(true);

    hideLoading();
    showToast('Pas foto berhasil disimpan!', 'success');

    // Langsung tampilkan kartu setelah simpan
    setTimeout(() => {
      showToast('Kartu peserta siap diunduh atau dicetak.', 'info');
    }, 1500);

  } catch (err) {
    console.error('Simpan foto error:', err);
    hideLoading();
    showToast('Gagal menyimpan foto. Periksa koneksi internet.', 'error');
  }
}

/* ═══════════════════════════════════════════════════════
   KARTU PESERTA
═══════════════════════════════════════════════════════ */
function handleModalBackdropClick(e) {
  if (e.target.id === 'kartuModal') closeModal();
}

function updatePreviewSize() {
  const size = _getSelectedSize();
  const paper = document.getElementById('previewPaper');
  if (!paper) return;
  paper.classList.toggle('size-a5', size === 'a5');
  // Sync tab size picker
  const tabEl = document.querySelector(`input[name="kartuSize"][value="${size}"]`);
  if (tabEl) tabEl.checked = true;
}

function bukaPreviewKartu() {
  if (!currentPeserta) { showToast('Data peserta tidak tersedia.', 'error'); return; }
  const fotoAktif = fotoTersimpan || currentPeserta.pasFotoKartu || '';
  if (!fotoAktif) {
    showToast('Anda belum menambahkan pas foto. Unggah pas foto terlebih dahulu.', 'error');
    switchTab(document.querySelector('[data-tab="tabFoto"]'), 'tabFoto');
    return;
  }
  // Gunakan generateKartu tanpa mode download
  generateKartu('preview');
}

function generateKartu(mode) {
  if (!currentPeserta) { showToast('Data peserta tidak tersedia.', 'error'); return; }

  // Cek foto
  const fotoAktif = fotoTersimpan || currentPeserta.pasFotoKartu || '';
  if (!fotoAktif) {
    showToast('Anda tidak dapat mengunduh kartu karena belum menambahkan pas foto.', 'error');
    switchTab(document.querySelector('[data-tab="tabFoto"]'), 'tabFoto');
    return;
  }

  const d = currentPeserta;

  // Isi data kartu
  document.getElementById('kNoDaftar').textContent   = d.noDaftar   || '-';
  document.getElementById('kNama').textContent        = d.nama        || '-';
  document.getElementById('kTglLahir').textContent    = formatTanggal(d.tglLahir);
  document.getElementById('kJK').textContent          = d.jk === 'L' ? 'Laki-laki' : d.jk === 'P' ? 'Perempuan' : (d.jk || '-');
  document.getElementById('kSekolahAsal').textContent = d.sekolahAsal || '-';
  document.getElementById('kNISN').textContent        = d.nisn        || '-';
  document.getElementById('kNPSN').textContent        = d.npsn        || '-';
  document.getElementById('kNamaTTD').textContent     = d.nama        || '';

  // Tahun ajaran
  const now = new Date();
  const yr  = now.getMonth() >= 6 ? now.getFullYear() : now.getFullYear() - 1;
  document.getElementById('kartuTahunAjaran').textContent = `TAHUN AJARAN ${yr}/${yr+1}`;

  // Foto peserta — reset dulu, lalu set
  const fotoEl = document.getElementById('kartuFoto');
  const fotoPlaceholder = document.getElementById('kartuFotoPlaceholder');
  fotoEl.classList.remove('hidden');
  fotoPlaceholder.style.display = 'none';
  fotoEl.src = fotoAktif;

  // Stempel sekolah di header kartu
  const stempelHeaderEl = document.getElementById('kartuStempelImg');
  const stempelTTDEl    = document.getElementById('ttdStempelImg');
  if (stampBase64) {
    stempelHeaderEl.src = stampBase64;
    stempelTTDEl.src    = stampBase64;
  } else {
    loadStampImage().then(() => {
      if (stampBase64) {
        stempelHeaderEl.src = stampBase64;
        stempelTTDEl.src    = stampBase64;
      }
    });
  }

  // QR Code
  const qrEl = document.getElementById('kartuQR');
  qrEl.innerHTML = '';
  new QRCode(qrEl, {
    text: `SMAN68-MUTASI|${d.noDaftar}|${d.nama}`,
    width: 88, height: 88,
    colorDark: '#0d6c3a', colorLight: '#ffffff',
    correctLevel: QRCode.CorrectLevel.M
  });

  // Sync ukuran dari tab ke modal
  const tabSizeEl = document.querySelector('input[name="kartuSize"]:checked');
  if (tabSizeEl) {
    const modalSizeEl = document.querySelector(`input[name="kartuSizeModal"][value="${tabSizeEl.value}"]`);
    if (modalSizeEl) modalSizeEl.checked = true;
  }

  // Tampilkan modal
  document.getElementById('kartuModal').classList.remove('hidden');

  if (mode === 'pdf')  setTimeout(() => downloadKartuPDF(),        800);
  if (mode === 'png')  setTimeout(() => downloadKartuImage('png'),  800);
  if (mode === 'jpeg') setTimeout(() => downloadKartuImage('jpeg'), 800);
}

function closeModal() {
  document.getElementById('kartuModal').classList.add('hidden');
}

function _getSelectedSize() {
  const modalEl = document.querySelector('input[name="kartuSizeModal"]:checked');
  if (modalEl) return modalEl.value;
  const tabEl = document.querySelector('input[name="kartuSize"]:checked');
  return tabEl ? tabEl.value : 'a4';
}

async function downloadKartuPDF() {
  const fotoAktif = fotoTersimpan || currentPeserta?.pasFotoKartu || '';
  if (!fotoAktif) {
    showToast('Belum ada pas foto. Unggah pas foto terlebih dahulu.', 'error');
    closeModal();
    return;
  }

  const size = _getSelectedSize();
  showLoading(`Membuat PDF ${size.toUpperCase()} berkualitas tinggi...`);
  try {
    await new Promise(r => setTimeout(r, 600));
    const el = document.getElementById('kartuPrint');
    const deviceDPR = window.devicePixelRatio || 1;
    const renderScale = Math.max(3, deviceDPR * 2);
    const canvas = await html2canvas(el, {
      scale: renderScale,
      useCORS: true, allowTaint: true, logging: false,
      backgroundColor: '#ffffff', imageTimeout: 15000, removeContainer: true,
      windowWidth: el.scrollWidth, windowHeight: el.scrollHeight,
    });
    const imgData = canvas.toDataURL('image/jpeg', 1.0);
    const { jsPDF } = window.jspdf;
    const formats = { a4: [210, 297], a5: [148, 210] };
    const fmt = formats[size] || formats.a4;
    const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: fmt, compress: false });
    const pdfW = pdf.internal.pageSize.getWidth();
    const pdfH = pdf.internal.pageSize.getHeight();
    const imgRatio = canvas.height / canvas.width;
    const imgH = Math.min(pdfW * imgRatio, pdfH);
    pdf.addImage(imgData, 'JPEG', 0, 0, pdfW, imgH);
    const nama = (currentPeserta?.nama || 'peserta').replace(/\s+/g, '_');
    pdf.save(`Kartu_Peserta_${nama}_${currentPeserta?.noDaftar || ''}_${size.toUpperCase()}.pdf`);
    showToast(`PDF ${size.toUpperCase()} berhasil diunduh!`, 'success');
  } catch (err) {
    console.error('PDF error:', err);
    showToast('Gagal membuat PDF. Coba lagi.', 'error');
  }
  hideLoading();
}

async function downloadKartuImage(format) {
  const fotoAktif = fotoTersimpan || currentPeserta?.pasFotoKartu || '';
  if (!fotoAktif) {
    showToast('Belum ada pas foto. Unggah pas foto terlebih dahulu.', 'error');
    closeModal();
    return;
  }
  const size = _getSelectedSize();
  const ext  = format === 'png' ? 'PNG' : 'JPEG';
  showLoading(`Membuat gambar ${ext} ${size.toUpperCase()}...`);
  try {
    await new Promise(r => setTimeout(r, 400));
    const el = document.getElementById('kartuPrint');
    const deviceDPR = window.devicePixelRatio || 1;
    const scaleBoost = size === 'a5' ? 1.4 : 1;
    const renderScale = Math.max(3, deviceDPR * 2) * scaleBoost;
    const canvas = await html2canvas(el, {
      scale: renderScale,
      useCORS: true, allowTaint: true, logging: false,
      backgroundColor: '#ffffff', imageTimeout: 15000, removeContainer: true,
      windowWidth: el.scrollWidth, windowHeight: el.scrollHeight,
    });
    const mimeType = format === 'png' ? 'image/png' : 'image/jpeg';
    const quality  = format === 'png' ? undefined : 1.0;
    const dataUrl  = canvas.toDataURL(mimeType, quality);
    const nama = (currentPeserta?.nama || 'peserta').replace(/\s+/g, '_');
    const link = document.createElement('a');
    link.href     = dataUrl;
    link.download = `Kartu_Peserta_${nama}_${currentPeserta?.noDaftar || ''}_${size.toUpperCase()}.${format === 'png' ? 'png' : 'jpg'}`;
    link.click();
    showToast(`Gambar ${ext} ${size.toUpperCase()} berhasil diunduh!`, 'success');
  } catch (err) {
    console.error('Image error:', err);
    showToast(`Gagal membuat gambar ${ext}. Coba lagi.`, 'error');
  }
  hideLoading();
}



/* ═══════════════════════════════════════════════════════
   EDIT BIODATA – 1x KESEMPATAN
═══════════════════════════════════════════════════════ */

function updateEditButton(data) {
  const btn = document.getElementById('btnEditBiodata');
  if (!btn) return;
  const sudahEdit = data.sudahEdit === true;
  if (sudahEdit) {
    btn.innerHTML = '<i class="fa-solid fa-lock"></i><span class="btn-edit-text"> Terpakai</span>';
    btn.title = 'Batas Perbaikan Sudah Terpakai';
    btn.classList.add('used');
    btn.disabled = true;
  } else {
    btn.innerHTML = '<i class="fa-solid fa-pen-to-square"></i><span class="btn-edit-text"> Edit Biodata</span>';
    btn.title = '';
    btn.classList.remove('used');
    btn.disabled = false;
  }
}

function bukaModalEdit() {
  if (!currentPeserta) return;

  const sudahEdit = currentPeserta.sudahEdit === true;
  if (sudahEdit) {
    showToast('Batas perbaikan biodata sudah terpakai.', 'error');
    return;
  }

  const d = currentPeserta;
  document.getElementById('editNama').value         = d.nama || '';
  document.getElementById('editTglLahir').value     = formatTglInput(d.tglLahir);
  document.getElementById('editJK').value           = d.jk || 'L';
  document.getElementById('editAgama').value        = d.agama || 'Islam';
  document.getElementById('editSekolahAsal').value  = d.sekolahAsal || '';
  document.getElementById('editNisn').value         = d.nisn || '';
  document.getElementById('editKelasSaatIni').value = d.kelasSaatIni || '-';
  document.getElementById('editMutasiKe').value     = d.mutasiKe || '-';
  document.getElementById('editEmail').value        = d.email || '';
  document.getElementById('editTelpMurid').value    = d.telpMurid || '';
  document.getElementById('editTelpOrtu').value     = d.telpOrtu || '';
  document.getElementById('editAlasanPindah').value = d.alasanPindah || '';

  document.getElementById('editBiodataModal').classList.remove('hidden');
}

function tutupModalEdit() {
  document.getElementById('editBiodataModal').classList.add('hidden');
}

async function simpanPerubahanPermanen() {
  if (!currentPeserta?.noDaftar) return;

  const sudahEdit = currentPeserta.sudahEdit === true;
  if (sudahEdit) {
    showToast('Batas perbaikan biodata sudah terpakai.', 'error');
    tutupModalEdit();
    return;
  }

  const nama         = document.getElementById('editNama').value.trim();
  const tglLahir     = document.getElementById('editTglLahir').value;
  const jk           = document.getElementById('editJK').value;
  const agama        = document.getElementById('editAgama').value;
  const sekolahAsal  = document.getElementById('editSekolahAsal').value.trim();
  const nisn         = document.getElementById('editNisn').value.trim();
  const email        = document.getElementById('editEmail').value.trim();
  const telpMurid    = document.getElementById('editTelpMurid').value.trim();
  const telpOrtu     = document.getElementById('editTelpOrtu').value.trim();
  const alasanPindah = document.getElementById('editAlasanPindah').value.trim();

  if (!nama) { showToast('Nama lengkap wajib diisi.', 'error'); return; }
  if (!tglLahir) { showToast('Tanggal lahir wajib diisi.', 'error'); return; }

  // Konfirmasi sekali lagi
  if (!confirm('⚠️ Perhatian!\n\nAnda hanya memiliki 1 kesempatan edit.\n\nSetelah klik OK, data tidak dapat diubah lagi.\n\nLanjutkan simpan perubahan?')) return;

  const btn = document.getElementById('btnSimpanPermanen');
  btn.disabled = true;
  btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Menyimpan...';
  showLoading('Menyimpan perubahan...');

  try {
    const snap = await db.collection('pendaftaranMutasi')
      .where('noDaftar', '==', currentPeserta.noDaftar)
      .limit(1).get();

    if (snap.empty) {
      showToast('Data peserta tidak ditemukan.', 'error');
      hideLoading();
      btn.disabled = false;
      btn.innerHTML = '<i class="fa-solid fa-floppy-disk"></i> Simpan Perubahan Permanen';
      return;
    }

    const updateData = {
      nama, tglLahir, jk, agama, sekolahAsal, nisn, email,
      telpMurid, telpOrtu, alasanPindah,
      sudahEdit: true,
      waktuEdit: new Date().toISOString()
    };

    await snap.docs[0].ref.update(updateData);

    // Update local state
    Object.assign(currentPeserta, updateData);

    // Refresh tampilan
    renderDataSiswa(currentPeserta);
    document.getElementById('navNama').textContent = currentPeserta.nama;
    document.getElementById('welcomeName').textContent = 'Selamat datang, ' + currentPeserta.nama + '!';
    updateEditButton(currentPeserta);

    tutupModalEdit();
    hideLoading();
    showToast('Biodata berhasil disimpan secara permanen!', 'success');

  } catch (err) {
    console.error('Edit biodata error:', err);
    hideLoading();
    btn.disabled = false;
    btn.innerHTML = '<i class="fa-solid fa-floppy-disk"></i> Simpan Perubahan Permanen';
    showToast('Gagal menyimpan. Periksa koneksi internet.', 'error');
  }
}

// Tutup modal edit jika klik backdrop
document.addEventListener('click', (e) => {
  if (e.target.id === 'editBiodataModal') tutupModalEdit();
});
