'use strict';
/* ============================================================
   PORTAL GURU — SMAN 68 JAKARTA  |  JS v2.1
   ============================================================ */

// --- FIREBASE ---
const firebaseConfig = {
  apiKey:            "AIzaSyDAcKcg3alPOTH3FFGelYmsW7jcMMe2PLI",
  authDomain:        "upnvjdatsystem.firebaseapp.com",
  projectId:         "upnvjdatsystem",
  storageBucket:     "upnvjdatsystem.firebasestorage.app",
  messagingSenderId: "57095309946",
  appId:             "1:57095309946:web:b0e9f3f86380d549ffc9c3"
};
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// --- STATE ---
let guru         = null;        // current logged-in guru
let selStatus    = '';          // selected status (absensi form)
let qSelStatus   = '';          // selected status (quick)
let jadwalDone   = {};          // jadwal checked state
let kalMon       = new Date().getMonth();
let kalYear      = new Date().getFullYear();
let loginAttempt = 0;
let loginLocked  = false;
let resetDocId   = null;
let countdownItv = null;

// --- QUOTES ---
const QUOTES = [
  { t:"Guru adalah lilin yang membakar diri untuk menerangi orang lain.", a:"Peribahasa Pendidikan" },
  { t:"Mendidik adalah pekerjaan paling mulia karena menyentuh masa depan.", a:"Christa McAuliffe" },
  { t:"Guru yang baik mampu membuat hal sulit terasa mudah.", a:"Ralph Waldo Emerson" },
  { t:"Setiap anak punya kelebihan. Tugas guru adalah menemukannya.", a:"Haim Ginott" },
  { t:"Ing ngarso sung tulodo, ing madyo mangun karso, tut wuri handayani.", a:"Ki Hajar Dewantara" },
  { t:"Pengaruh seorang guru tidak pernah berakhir — ia hidup dalam setiap muridnya.", a:"Henry Adams" },
  { t:"Pendidikan adalah senjata paling ampuh untuk mengubah dunia.", a:"Nelson Mandela" },
];

// ============================================================
//  PRELOADER
// ============================================================
setTimeout(() => document.getElementById('preloader')?.classList.add('hide'), 1800);

// ============================================================
//  TOAST
// ============================================================
function toast(type, title, msg, dur = 4000) {
  const ct = document.getElementById('toastContainer');
  if (!ct) return;
  const icons = { success:'fa-check-circle', error:'fa-exclamation-circle', warning:'fa-exclamation-triangle', info:'fa-info-circle' };
  const el = document.createElement('div');
  el.className = `toast ${type}`;
  el.innerHTML = `<i class="fas ${icons[type]||'fa-bell'} toast-ico"></i><div><div class="toast-title">${safe(title)}</div><div class="toast-msg">${safe(msg)}</div></div>`;
  ct.appendChild(el);
  setTimeout(() => { el.classList.add('leaving'); setTimeout(() => el.remove(), 350); }, dur);
}

function safe(s) {
  return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

// ============================================================
//  LIVE CLOCK
// ============================================================
function tickClock() {
  const now = new Date();
  const pad = n => String(n).padStart(2,'0');
  const H = pad(now.getHours()), M = pad(now.getMinutes()), S = pad(now.getSeconds());
  const fullDate = now.toLocaleDateString('id-ID',{weekday:'long',day:'numeric',month:'long',year:'numeric'});
  const shortDate= now.toLocaleDateString('id-ID',{weekday:'short',day:'numeric',month:'short'});
  const shortTime= now.toLocaleTimeString('id-ID',{hour:'2-digit',minute:'2-digit'});

  // Login clock
  const lc = document.getElementById('loginClock');
  const ld = document.getElementById('loginDate');
  if (lc) lc.textContent = `${H}:${M}:${S}`;
  if (ld) ld.textContent = fullDate;

  // Topbar clock
  const tt = document.getElementById('topbarTime');
  const ts = document.getElementById('topbarDateStr');
  if (tt) tt.textContent = shortTime;
  if (ts) ts.textContent = shortDate;
}
setInterval(tickClock, 1000);
tickClock();

// ============================================================
//  DAILY QUOTE
// ============================================================
(() => {
  const q = QUOTES[new Date().getDay() % QUOTES.length];
  const te = document.getElementById('quoteText');
  const ae = document.getElementById('quoteAuthor');
  if (te) te.textContent = q.t;
  if (ae) ae.textContent = `— ${q.a}`;
})();

// ============================================================
//  PASSWORD TOGGLE
// ============================================================
document.getElementById('togglePass')?.addEventListener('click', () => {
  const inp = document.getElementById('fPass');
  const ico = document.getElementById('togglePassIcon');
  if (!inp) return;
  inp.type = inp.type === 'password' ? 'text' : 'password';
  if (ico) ico.className = inp.type === 'password' ? 'fas fa-eye' : 'fas fa-eye-slash';
});

// ============================================================
//  MODAL HELPERS
// ============================================================
function openModal(id) { document.getElementById(id)?.classList.add('open'); }
function closeModal(id) { document.getElementById(id)?.classList.remove('open'); }

document.querySelectorAll('[data-close]').forEach(btn => {
  btn.addEventListener('click', () => closeModal(btn.dataset.close));
});
document.querySelectorAll('.modal-bg').forEach(bg => {
  bg.addEventListener('click', e => { if (e.target === bg) bg.classList.remove('open'); });
});

document.getElementById('btnForgot')?.addEventListener('click', () => openModal('modalForgot'));
document.getElementById('btnCekReset')?.addEventListener('click', () => openModal('modalCekReset'));

// ============================================================
//  LOGIN
// ============================================================
document.getElementById('loginForm')?.addEventListener('submit', async e => {
  e.preventDefault();
  if (loginLocked) { toast('error','Terkunci','Terlalu banyak percobaan. Tunggu 1 menit.'); return; }

  const nip  = document.getElementById('fNip')?.value.trim();
  const pass = document.getElementById('fPass')?.value;
  const rem  = document.getElementById('rememberMe')?.checked;

  if (!nip || !pass) { toast('error','Gagal','NIP/NUPTK dan Password wajib diisi!'); return; }

  // Loading state
  btnState('btnLogin', true);

  try {
    // Try NIP first, then NUPTK
    let snap = await db.collection('guru').where('nip','==',nip).where('password','==',pass).get();
    if (snap.empty) snap = await db.collection('guru').where('nuptk','==',nip).where('password','==',pass).get();

    if (snap.empty) {
      loginAttempt++;
      if (loginAttempt >= 5) {
        loginLocked = true;
        setTimeout(() => { loginLocked = false; loginAttempt = 0; }, 60000);
        toast('error','Akun Terkunci','5 kali gagal. Akun dikunci 1 menit.');
      } else {
        toast('error','Login Gagal',`NIP/NUPTK atau Password salah! (${5-loginAttempt} percobaan tersisa)`);
      }
      return;
    }

    const doc = snap.docs[0];
    guru = { id: doc.id, ...doc.data() };

    if (guru.status && guru.status !== 'approved') {
      toast('warning','Belum Disetujui','Akun Anda belum disetujui operator sekolah.');
      guru = null; return;
    }

    loginAttempt = 0;

    // Save session
    if (rem) {
      localStorage.setItem('pgSession', JSON.stringify({ ...guru, _at: new Date().toISOString() }));
    }

    // Log activity
    db.collection('loginLog').add({
      guruId: guru.id, nama: guru.nama, nip: guru.nip||nip,
      waktu: firebase.firestore.FieldValue.serverTimestamp()
    }).catch(()=>{});

    toast('success','Berhasil Masuk!',`Selamat datang, ${(guru.nama||'').split(' ')[0]}!`);
    setTimeout(enterPortal, 600);

  } catch(err) {
    console.error(err);
    toast('error','Error Koneksi','Tidak dapat terhubung ke server.');
  } finally {
    btnState('btnLogin', false);
  }
});

function btnState(id, loading) {
  const btn  = document.getElementById(id);
  const txt  = document.getElementById(id+'Text');
  const load = document.getElementById(id+'Load');
  if (btn) btn.disabled = loading;
  if (txt) txt.style.display = loading ? 'none' : '';
  if (load) load.style.display = loading ? '' : 'none';
}

// ============================================================
//  ENTER PORTAL
// ============================================================
function enterPortal() {
  document.getElementById('loginPage').style.display  = 'none';
  document.getElementById('portalApp').style.display  = 'flex';
  document.getElementById('bottomNav').style.display  = '';

  fillUserUI();
  initPortal();
  goTo('dashboard');
  // Muat foto profil dari Firestore (async, tidak blokir UI)
  loadFotoProfile();
}

function fillUserUI() {
  const name  = guru?.nama  || '—';
  const mapel = guru?.mapel || 'Guru';
  const nip   = guru?.nip   || guru?.nuptk || '—';

  // Sidebar
  document.getElementById('sidebarName').textContent = name;
  document.getElementById('sidebarRole').textContent = mapel;
  // Topbar
  document.getElementById('topbarName').textContent = name;
  document.getElementById('topbarRole').textContent = mapel;
  // Profile page
  document.getElementById('profileName').textContent = name;
  document.getElementById('profileRole').textContent = mapel;
  document.getElementById('pNama').value  = name;
  document.getElementById('pNip').value   = nip;
  document.getElementById('pNuptk').value = guru?.nuptk || '';
  document.getElementById('pMapel').value = mapel;
  document.getElementById('pHp').value    = guru?.hp    || '';
  document.getElementById('pEmail').value = guru?.email || '';

  // Generate QR Code
  generateAbsensiQR();
}

function generateAbsensiQR() {
  const qrBox = document.getElementById('profileQrBox');
  if (!qrBox || !guru) return;
  qrBox.innerHTML = '';
  const qrData = JSON.stringify({
    type:  'absensi-guru',
    id:    guru.id,
    nip:   guru.nip   || '',
    nuptk: guru.nuptk || '',
    nama:  guru.nama  || '',
    ts:    new Date().toISOString().split('T')[0],
  });
  const QR_SIZE = 132; // fixed, fits inside 160x160 box with 12px padding each side
  try {
    new QRCode(qrBox, {
      text:         qrData,
      width:        QR_SIZE,
      height:       QR_SIZE,
      colorDark:    '#1e293b',
      colorLight:   '#ffffff',
      correctLevel: QRCode.CorrectLevel.M,
    });
    setTimeout(() => {
      const child = qrBox.querySelector('img, canvas');
      if (child) {
        child.style.cssText = 'display:block;width:' + QR_SIZE + 'px;height:' + QR_SIZE + 'px;border-radius:6px;';
      }
      // Remove any extra wrapper div qrcodejs adds
      const tbl = qrBox.querySelector('table');
      if (tbl) tbl.style.cssText = 'border-radius:6px;overflow:hidden;';
    }, 80);
  } catch(e) {
    qrBox.innerHTML = '<p style="font-size:.7rem;color:#dc2626;text-align:center;">QR tidak tersedia</p>';
  }
}

// ============================================================
//  PORTAL INIT
// ============================================================
function initPortal() {
  setupNav();
  setupSidebar();
  loadJadwal();
  loadKalender();
  loadDashStats();
  checkTodayAbsen();
  loadPengumuman();
}

// ============================================================
//  NAVIGATION
// ============================================================
const PAGE_LABELS = {
  dashboard:  ['fa-th-large','Dashboard'],
  absensi:    ['fa-clipboard-check','Absensi'],
  jadwal:     ['fa-clock','Jadwal'],
  kalender:   ['fa-calendar-alt','Kalender Pendidikan'],
  pengumuman: ['fa-bullhorn','Pengumuman'],
  laporan:    ['fa-chart-bar','Laporan Absensi'],
  profil:     ['fa-user-circle','Profil Saya'],
};

function setupNav() {
  document.querySelectorAll('[data-page]').forEach(el => {
    el.addEventListener('click', () => {
      goTo(el.dataset.page);
      closeMobileSidebar();
    });
  });
  document.querySelectorAll('[data-goto]').forEach(el => {
    el.addEventListener('click', () => goTo(el.dataset.goto));
  });
}

function goTo(page) {
  // Hide all pages
  document.querySelectorAll('.pg').forEach(p => p.style.display = 'none');
  const target = document.getElementById(`pg-${page}`);
  if (target) { target.style.display = 'block'; target.classList.add('fade-in'); }

  // Update active nav
  document.querySelectorAll('.nav-btn[data-page], .bn[data-page]').forEach(b => {
    b.classList.toggle('active', b.dataset.page === page);
  });

  // Breadcrumb
  const [icon, label] = PAGE_LABELS[page] || ['fa-home','Portal'];
  const bc = document.getElementById('topbarBreadcrumb');
  if (bc) bc.innerHTML = `<i class="fas ${icon}"></i> ${label}`;

  // Page-specific init
  const fd = now => now.toLocaleDateString('id-ID',{weekday:'long',day:'numeric',month:'long',year:'numeric'});
  const n  = new Date();

  if (page === 'dashboard') {
    const greet = n.getHours()<11?'Selamat Pagi':n.getHours()<15?'Selamat Siang':n.getHours()<18?'Selamat Sore':'Selamat Malam';
    const el1 = document.getElementById('dashGreeting');
    const el2 = document.getElementById('dashDate');
    const el3 = document.getElementById('dashDateChip');
    if (el1) el1.textContent = `${greet}, ${(guru?.nama||'Guru').split(' ')[0]}!`;
    if (el2) el2.textContent = `Portal Guru SMAN 68 Jakarta`;
    if (el3) el3.innerHTML   = `<i class="fas fa-calendar-day"></i> ${fd(n)}`;
  }
  if (page === 'absensi') {
    const el = document.getElementById('absensiDate');
    if (el) el.textContent = fd(n);
    loadRiwayat();
  }
  if (page === 'jadwal') {
    const el = document.getElementById('jadwalDate');
    if (el) el.textContent = fd(n);
    loadJadwal();
  }
  if (page === 'laporan') initLaporan();
  if (page === 'pengumuman') loadPengumuman();
}

// ============================================================
//  SIDEBAR MOBILE
// ============================================================
function setupSidebar() {
  // Already inline onclick for hamburger
}
function toggleMobileSidebar() {
  const sb = document.getElementById('sidebar');
  const ov = document.getElementById('sidebarOverlay');
  sb?.classList.toggle('mob-open');
  ov?.classList.toggle('on');
}
function closeMobileSidebar() {
  document.getElementById('sidebar')?.classList.remove('mob-open');
  document.getElementById('sidebarOverlay')?.classList.remove('on');
}
window.toggleMobileSidebar = toggleMobileSidebar;
window.closeMobileSidebar  = closeMobileSidebar;

// ============================================================
//  LOGOUT — pakai modal konfirmasi
// ============================================================
function doLogout() {
  guru = null;
  localStorage.removeItem('pgSession');
  document.getElementById('portalApp').style.display = 'none';
  document.getElementById('bottomNav').style.display = 'none';
  document.getElementById('loginPage').style.display = '';
  document.getElementById('loginForm')?.reset();
  closeModal('modalLogout');
  toast('info','Berhasil Keluar','Sampai jumpa kembali!');
}

document.getElementById('btnLogout')?.addEventListener('click', () => openModal('modalLogout'));
document.getElementById('btnLogoutConfirm')?.addEventListener('click', doLogout);
// Wire profil logout button too
document.getElementById('btnLogoutProfil')?.addEventListener('click', () => openModal('modalLogout'));

// ============================================================
//  ABSENSI — STATUS SELECTION
// ============================================================
document.querySelectorAll('.status-opt').forEach(opt => {
  opt.addEventListener('click', () => {
    document.querySelectorAll('.status-opt').forEach(o => o.classList.remove('sel'));
    opt.classList.add('sel');
    selStatus = opt.dataset.s;
    const kg = document.getElementById('ketGroup');
    if (kg) kg.style.display = (selStatus !== 'hadir') ? 'block' : 'none';
  });
});

document.querySelectorAll('.qs').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.qs').forEach(b => b.classList.remove('sel'));
    btn.classList.add('sel');
    qSelStatus = btn.dataset.s;
    const qf = document.getElementById('quickForm');
    if (qf) qf.style.display = 'block';
  });
});

// ============================================================
//  SUBMIT ABSENSI
// ============================================================
document.getElementById('absensiForm')?.addEventListener('submit', async e => {
  e.preventDefault();
  if (!selStatus) { toast('warning','Pilih Status','Pilih status kehadiran terlebih dahulu!'); return; }
  const bukti = document.getElementById('aBukti')?.value.trim();
  const ket   = document.getElementById('aKet')?.value.trim()||'';
  if (!bukti) { toast('error','Link Diperlukan','Link Google Drive wajib diisi!'); return; }
  if (selStatus !== 'hadir' && !ket) { toast('error','Keterangan','Keterangan wajib diisi!'); return; }
  await submitAbsensi(selStatus, ket, bukti, document.getElementById('btnAbsen'), 'full');
});

document.getElementById('btnQuickAbsen')?.addEventListener('click', async () => {
  if (!qSelStatus) { toast('warning','Pilih Status','Pilih status terlebih dahulu!'); return; }
  const bukti = document.getElementById('qBukti')?.value.trim();
  const ket   = document.getElementById('qKet')?.value.trim()||'';
  if (!bukti) { toast('error','Link Diperlukan','Link Google Drive wajib diisi!'); return; }
  await submitAbsensi(qSelStatus, ket, bukti, document.getElementById('btnQuickAbsen'), 'quick');
});

async function submitAbsensi(status, ket, bukti, btn, mode) {
  const origHTML = btn?.innerHTML;
  if (btn) { btn.disabled = true; btn.innerHTML = '<i class="fas fa-circle-notch fa-spin"></i> Mengirim...'; }

  try {
    const today = new Date().toISOString().split('T')[0];
    const dup   = await db.collection('absensiGuru').where('guruId','==',guru.id).where('tanggal','==',today).get();
    if (!dup.empty) { toast('warning','Sudah Absen','Anda sudah absen hari ini!'); return; }

    const now     = new Date();
    const jamStr  = now.toLocaleTimeString('id-ID',{hour:'2-digit',minute:'2-digit'});
    const batas   = new Date(); batas.setHours(7,0,0,0);
    const late    = status==='hadir' && now>batas;

    await db.collection('absensiGuru').add({
      guruId: guru.id, nama: guru.nama, nip: guru.nip||'', nuptk: guru.nuptk||'',
      mapel: guru.mapel||'', status, keterangan: ket||'-', buktiUrl: bukti,
      tanggal: today, jamAbsen: jamStr, terlambat: late,
      timestamp: firebase.firestore.FieldValue.serverTimestamp()
    });

    const msg = status==='hadir'
      ? (late ? `⚠️ Terlambat hadir pukul ${jamStr}` : `✅ Hadir tepat waktu pukul ${jamStr}`)
      : `Absen (${sLabel(status)}) dikirim pukul ${jamStr}`;
    toast('success','Absensi Berhasil!', msg, 5000);

    // Reset UI
    if (mode==='full') {
      document.getElementById('absensiForm')?.reset();
      document.querySelectorAll('.status-opt').forEach(o => o.classList.remove('sel'));
      selStatus='';
      const kg = document.getElementById('ketGroup');
      if (kg) kg.style.display='none';
    }
    if (mode==='quick') {
      document.getElementById('quickForm').style.display='none';
      document.getElementById('qBukti').value='';
      document.getElementById('qKet').value='';
      document.querySelectorAll('.qs').forEach(b => b.classList.remove('sel'));
      qSelStatus='';
      const badge = document.getElementById('quickAbsenBadge');
      if (badge) { badge.textContent='Sudah Absen ✓'; badge.style.background='#d1fae5'; badge.style.color='#059669'; }
    }

    loadRiwayat();
    loadDashStats();

  } catch(err) {
    console.error(err);
    toast('error','Gagal','Terjadi kesalahan. Coba lagi.');
  } finally {
    if (btn) { btn.disabled=false; btn.innerHTML=origHTML; }
  }
}

// ============================================================
//  CHECK TODAY ABSEN
// ============================================================
async function checkTodayAbsen() {
  if (!guru) return;
  const today = new Date().toISOString().split('T')[0];
  const snap  = await db.collection('absensiGuru').where('guruId','==',guru.id).where('tanggal','==',today).get().catch(()=>null);
  if (snap && !snap.empty) {
    const badge = document.getElementById('quickAbsenBadge');
    if (badge) { badge.textContent='Sudah Absen ✓'; badge.style.background='#d1fae5'; badge.style.color='#059669'; }
  }
}

// ============================================================
//  LOAD RIWAYAT ABSENSI
// ============================================================
async function loadRiwayat() {
  const list  = document.getElementById('riwayatList');
  const count = document.getElementById('riwayatCount');
  if (!list || !guru) return;

  list.innerHTML = skeletons(4, '58px');

  try {
    // Tanpa orderBy agar tidak butuh composite index Firestore
    // Sorting dilakukan manual di JS berdasarkan field 'tanggal'
    const snap = await db.collection('absensiGuru')
      .where('guruId','==',guru.id)
      .get();

    if (snap.empty) { list.innerHTML='<p style="padding:20px;text-align:center;color:#94a3b8;font-size:.82rem;">Belum ada riwayat absensi.</p>'; if(count)count.textContent='0'; return; }

    // Sort manual: terbaru dulu
    const allDocs = snap.docs
      .map(d => ({ _id: d.id, ...d.data() }))
      .sort((a, b) => {
        const ta = a.timestamp?.toMillis ? a.timestamp.toMillis() : (a.tanggal||'').localeCompare('');
        const tb = b.timestamp?.toMillis ? b.timestamp.toMillis() : (b.tanggal||'').localeCompare('');
        return tb - ta;
      })
      .slice(0, 30);

    if (count) count.textContent = allDocs.length;
    list.innerHTML='';

    allDocs.forEach(d => {
      const d2  = d;
      const tgl = d2.timestamp?.toDate ? d2.timestamp.toDate() : null;
      const dateStr = tgl ? tgl.toLocaleDateString('id-ID',{weekday:'long',day:'numeric',month:'long',year:'numeric'}) : (d2.tanggal||'—');
      const timeStr = tgl ? tgl.toLocaleTimeString('id-ID',{hour:'2-digit',minute:'2-digit'}) : (d2.jamAbsen||'—');

      const el = document.createElement('div');
      el.className = 'riwayat-item';
      el.innerHTML = `
        <div class="riwayat-ico ${d2.status}"><i class="fas ${sIcon(d2.status)}"></i></div>
        <div class="riwayat-info">
          <div class="riwayat-date">${safe(dateStr)}</div>
          <div class="riwayat-meta">${timeStr} &nbsp;
            <span class="status-chip ${d2.status}">${sLabel(d2.status)}</span>
            ${d2.terlambat ? '<span style="color:#d97706;font-size:.68rem;margin-left:4px;">⚠ Terlambat</span>' : ''}
          </div>
          ${d2.keterangan&&d2.keterangan!=='-' ? `<div class="riwayat-ket">${safe(d2.keterangan)}</div>` : ''}
        </div>
        ${d2.buktiUrl ? `<a href="${safe(d2.buktiUrl)}" target="_blank" rel="noopener" class="riwayat-link"><i class="fab fa-google-drive"></i> Bukti</a>` : ''}
      `;
      list.appendChild(el);
    });
  } catch(e) {
    list.innerHTML='<p style="padding:20px;text-align:center;color:#dc2626;font-size:.82rem;">Gagal memuat riwayat.</p>';
  }
}

// ============================================================
//  DASHBOARD STATS
// ============================================================
async function loadDashStats() {
  if (!guru) return;
  const now   = new Date();
  const pfx   = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}`;

  const snap = await db.collection('absensiGuru').where('guruId','==',guru.id).get().catch(()=>null);
  if (!snap) return;

  let h=0,s=0,i=0,tot=0,hm=0;
  snap.forEach(doc => {
    const d = doc.data();
    if(d.status==='hadir') h++;
    if(d.status==='sakit') s++;
    if(d.status==='izin')  i++;
    if(d.tanggal?.startsWith(pfx)) { tot++; if(d.status==='hadir') hm++; }
  });

  setText('stHadir',  h);
  setText('stSakit',  s);
  setText('stIzin',   i);
  setText('stPersen',  tot>0 ? Math.round(hm/tot*100)+'%' : '—');

  // Load dash jadwal preview
  loadDashJadwal();
}

function loadDashJadwal() {
  const container = document.getElementById('dashJadwal');
  if (!container) return;

  if (isNonMapel()) {
    container.innerHTML = `<div style="padding:16px;text-align:center;font-size:.8rem;color:#64748b;"><i class="fas fa-calendar-check" style="font-size:1.4rem;margin-bottom:6px;display:block;color:#059669;"></i>Lihat halaman <strong>Jadwal Kegiatan</strong> untuk jadwal Anda.</div>`;
    loadDashAnn();
    return;
  }

  const jadwal = getJadwalData();
  const now    = new Date();
  const curMin = now.getHours()*60+now.getMinutes();
  container.innerHTML='';
  jadwal.slice(0,3).forEach((j,i) => {
    const [sh,sm] = j.time.split('–')[0].split(':').map(Number);
    const start   = sh*60+sm;
    const isDone  = curMin >= start+90;
    const isNow   = curMin>=start && curMin<start+90;
    const el      = document.createElement('div');
    el.className  = 'dj-item';
    el.innerHTML  = `
      <div class="dj-dot ${isDone?'done':''}"></div>
      <div class="dj-time">${j.time}</div>
      <div><div class="dj-kelas">${j.kelas}</div><div class="dj-mapel">${j.mapel}</div></div>
      ${isNow ? '<span class="dj-now">Sedang</span>' : ''}
    `;
    container.appendChild(el);
  });

  // Dashboard announcement preview
  loadDashAnn();
}

// ============================================================
//  JADWAL — SMART: Guru Mapel vs Tenaga Pendidik Non-Mapel
// ============================================================
const NON_MAPEL_ROLES = ['kepala sekolah','wakil kepala','wakasek','waka','tata usaha','tu ','bendahara','staf','pustakawan','lab','bk','konselor','humas','kurikulum','kesiswaan','sapras','sarana','administrasi'];

function isNonMapel() {
  const mapel = (guru?.mapel||'').toLowerCase();
  const jabatan = (guru?.jabatan||'').toLowerCase();
  return NON_MAPEL_ROLES.some(r => mapel.includes(r) || jabatan.includes(r));
}

function getJadwalData() {
  return [
    { time:'07:00–08:30', kelas:'XII.3', mapel: guru?.mapel||'Mata Pelajaran' },
    { time:'08:30–10:00', kelas:'XII.5', mapel: guru?.mapel||'Mata Pelajaran' },
    { time:'10:15–11:45', kelas:'XI.2',  mapel: guru?.mapel||'Mata Pelajaran' },
    { time:'12:00–13:30', kelas:'XI.4',  mapel: guru?.mapel||'Mata Pelajaran' },
    { time:'13:30–15:00', kelas:'X.1',   mapel: guru?.mapel||'Mata Pelajaran' },
  ];
}

// Firestore key for personal jadwal kegiatan (non-mapel)
async function loadJadwalKegiatan() {
  const list = document.getElementById('jadwalList');
  if (!list || !guru) return;
  list.innerHTML = skeletons(3, '70px');
  try {
    const snap = await db.collection('jadwalKegiatan').where('guruId','==',guru.id).get();
    const items = snap.docs.map(d=>({id:d.id,...d.data()})).sort((a,b)=>(a.jam||'').localeCompare(b.jam||''));
    list.innerHTML = '';
    if (items.length===0) {
      list.innerHTML = `<div style="padding:24px;text-align:center;color:#94a3b8;font-size:.84rem;"><i class="fas fa-calendar-plus" style="font-size:2rem;margin-bottom:10px;display:block;opacity:.4;"></i>Belum ada jadwal kegiatan.<br>Klik <strong>Tambah Jadwal</strong> untuk menambahkan.</div>`;
      return;
    }
    const today = new Date().toLocaleDateString('id-ID',{weekday:'long'}).split(',')[0].toLowerCase();
    items.forEach(j => {
      const el = document.createElement('div');
      el.className = 'jadwal-item';
      const isToday = (j.hari||'').toLowerCase().includes(today);
      el.innerHTML = `
        <div class="j-time">${safe(j.jam||'—')}</div>
        <div class="j-info">
          <div class="j-kelas">${safe(j.kegiatan||'—')}</div>
          <div class="j-mapel">${safe(j.hari||'')}${j.tempat?` &bull; ${safe(j.tempat)}`:''}</div>
        </div>
        ${isToday ? '<span class="j-label now">Hari Ini</span>' : ''}
        <button class="j-check" onclick="hapusJadwalKegiatan('${j.id}')" title="Hapus"><i class="fas fa-trash" style="color:#dc2626;font-size:.75rem;"></i></button>
      `;
      list.appendChild(el);
    });
  } catch(e) {
    list.innerHTML='<p style="padding:20px;text-align:center;color:#dc2626;font-size:.82rem;">Gagal memuat jadwal.</p>';
  }
}
window.hapusJadwalKegiatan = async function(id) {
  if (!confirm('Hapus jadwal ini?')) return;
  try {
    await db.collection('jadwalKegiatan').doc(id).delete();
    toast('success','Dihapus','Jadwal berhasil dihapus.');
    loadJadwalKegiatan();
  } catch(e) { toast('error','Gagal','Tidak dapat menghapus jadwal.'); }
};

function openTambahJadwal() {
  const days=['Senin','Selasa','Rabu','Kamis','Jumat','Sabtu'];
  const opts=days.map(d=>`<option>${d}</option>`).join('');
  const modal = document.createElement('div');
  modal.id='modalTambahJadwal';
  modal.style.cssText='position:fixed;inset:0;z-index:9999;background:rgba(0,0,0,.5);display:flex;align-items:center;justify-content:center;padding:16px;';
  modal.innerHTML=`
    <div style="background:#fff;border-radius:16px;padding:24px;max-width:420px;width:100%;box-shadow:0 20px 60px rgba(0,0,0,.2);">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:18px;">
        <h3 style="font-size:1rem;font-weight:700;color:#0f172a;"><i class="fas fa-calendar-plus" style="color:#059669;margin-right:8px;"></i>Tambah Jadwal Kegiatan</h3>
        <button onclick="document.getElementById('modalTambahJadwal').remove()" style="background:none;border:none;cursor:pointer;font-size:1.1rem;color:#64748b;"><i class="fas fa-times"></i></button>
      </div>
      <div style="margin-bottom:12px;"><label style="display:block;font-size:.78rem;font-weight:600;color:#374151;margin-bottom:4px;">Hari</label>
        <select id="tjHari" style="width:100%;padding:10px 12px;border:1.5px solid #e2e8f0;border-radius:8px;font-size:.85rem;">${opts}</select></div>
      <div style="margin-bottom:12px;"><label style="display:block;font-size:.78rem;font-weight:600;color:#374151;margin-bottom:4px;">Jam (mis. 08:00–09:00)</label>
        <input id="tjJam" type="text" placeholder="07:00–08:30" style="width:100%;padding:10px 12px;border:1.5px solid #e2e8f0;border-radius:8px;font-size:.85rem;box-sizing:border-box;"></div>
      <div style="margin-bottom:12px;"><label style="display:block;font-size:.78rem;font-weight:600;color:#374151;margin-bottom:4px;">Nama Kegiatan</label>
        <input id="tjKegiatan" type="text" placeholder="Rapat, Piket, Supervisi, dll." style="width:100%;padding:10px 12px;border:1.5px solid #e2e8f0;border-radius:8px;font-size:.85rem;box-sizing:border-box;"></div>
      <div style="margin-bottom:18px;"><label style="display:block;font-size:.78rem;font-weight:600;color:#374151;margin-bottom:4px;">Tempat / Ruangan (opsional)</label>
        <input id="tjTempat" type="text" placeholder="Ruang Kepala Sekolah, Aula..." style="width:100%;padding:10px 12px;border:1.5px solid #e2e8f0;border-radius:8px;font-size:.85rem;box-sizing:border-box;"></div>
      <div style="display:flex;gap:8px;">
        <button id="btnSimpanJadwal" onclick="simpanJadwalKegiatan()" style="flex:1;padding:11px;background:#059669;color:#fff;border:none;border-radius:8px;font-size:.85rem;font-weight:600;cursor:pointer;"><i class="fas fa-save"></i> Simpan</button>
        <button onclick="document.getElementById('modalTambahJadwal').remove()" style="flex:1;padding:11px;background:#f1f5f9;color:#374151;border:none;border-radius:8px;font-size:.85rem;cursor:pointer;">Batal</button>
      </div>
    </div>`;
  document.body.appendChild(modal);
}
window.openTambahJadwal = openTambahJadwal;

window.simpanJadwalKegiatan = async function() {
  const hari     = document.getElementById('tjHari')?.value;
  const jam      = document.getElementById('tjJam')?.value.trim();
  const kegiatan = document.getElementById('tjKegiatan')?.value.trim();
  const tempat   = document.getElementById('tjTempat')?.value.trim();
  if (!jam || !kegiatan) { toast('warning','Lengkapi Data','Jam dan nama kegiatan wajib diisi!'); return; }
  const btn = document.getElementById('btnSimpanJadwal');
  if(btn){btn.disabled=true;btn.innerHTML='<i class="fas fa-circle-notch fa-spin"></i>';}
  try {
    await db.collection('jadwalKegiatan').add({
      guruId:guru.id, nama:guru.nama, hari, jam, kegiatan, tempat:tempat||'',
      createdAt: firebase.firestore.FieldValue.serverTimestamp()
    });
    document.getElementById('modalTambahJadwal')?.remove();
    toast('success','Tersimpan!','Jadwal kegiatan berhasil ditambahkan.');
    loadJadwalKegiatan();
  } catch(e) {
    toast('error','Gagal','Tidak dapat menyimpan jadwal.');
  } finally {
    if(btn){btn.disabled=false;btn.innerHTML='<i class="fas fa-save"></i> Simpan';}
  }
};

function loadJadwal() {
  const nonMapel = isNonMapel();
  // Update page titles
  const pageTitle   = document.getElementById('jadwalPageTitle');
  const panelTitle  = document.getElementById('jadwalPanelTitle');
  const addBtnWrap  = document.getElementById('jadwalAddBtnWrap');
  const btnTambah   = document.getElementById('btnTambahJadwal');

  if (nonMapel) {
    if(pageTitle)  pageTitle.textContent  = 'Jadwal Kegiatan';
    if(panelTitle) panelTitle.textContent = 'Jadwal Kegiatan Saya';
    if(addBtnWrap) addBtnWrap.style.display = '';
    if(btnTambah)  { btnTambah.onclick = openTambahJadwal; }
    // Update nav label
    const navJadwal = document.querySelector('[data-page="jadwal"] span');
    if(navJadwal) navJadwal.textContent = 'Jadwal Kegiatan';
    const bnJadwal = document.querySelector('.bn[data-page="jadwal"] span');
    if(bnJadwal) bnJadwal.textContent = 'Jadwal';
    loadJadwalKegiatan();
    return;
  }

  // Guru mapel — jadwal mengajar default
  if(pageTitle)  pageTitle.textContent  = 'Jam Mengajar';
  if(panelTitle) panelTitle.textContent = 'Jadwal Mengajar Hari Ini';
  if(addBtnWrap) addBtnWrap.style.display = 'none';

  const list = document.getElementById('jadwalList');
  if (!list) return;
  const jadwal = getJadwalData();
  const now    = new Date();
  const curMin = now.getHours()*60+now.getMinutes();
  list.innerHTML='';

  jadwal.forEach((j,i) => {
    const [sh,sm] = j.time.split('–')[0].split(':').map(Number);
    const [eh,em] = j.time.split('–')[1].split(':').map(Number);
    const start   = sh*60+sm, end=eh*60+em;
    const isNow   = curMin>=start && curMin<end;
    const isDone  = jadwalDone[i] || curMin>=end;
    const nextIdx = jadwal.findIndex((_,ii)=>!jadwalDone[ii]&&ii>i);
    const isNext  = !isNow && !isDone && nextIdx===i;

    const el = document.createElement('div');
    el.className = `jadwal-item ${isNow?'is-now':''} ${isDone?'is-done':''}`;
    el.innerHTML = `
      <div class="j-time">${j.time}</div>
      <div class="j-info">
        <div class="j-kelas">${j.kelas}</div>
        <div class="j-mapel">${j.mapel}</div>
      </div>
      ${isNow   ? '<span class="j-label now">Sedang Berlangsung</span>' : ''}
      ${isNext  ? '<span class="j-label next">Selanjutnya</span>' : ''}
      ${isDone&&!isNow ? '<span class="j-label done">Selesai</span>' : ''}
      <div class="j-check ${jadwalDone[i]?'done':''}" data-idx="${i}">
        <i class="fas ${jadwalDone[i]?'fa-check':'fa-circle'}"></i>
      </div>
    `;
    el.querySelector('.j-check').addEventListener('click', () => {
      jadwalDone[i] = !jadwalDone[i]; loadJadwal();
    });
    list.appendChild(el);
  });
}

// ============================================================
//  KALENDER
// ============================================================
const KAL_EVENTS = (() => {
  const y = new Date().getFullYear();
  return {
    [`${y}-01-01`]:{cls:'ev-red',    lbl:'Libur'},
    [`${y}-03-29`]:{cls:'ev-red',    lbl:'Libur'},
    [`${y}-04-18`]:{cls:'ev-red',    lbl:'Libur'},
    [`${y}-05-01`]:{cls:'ev-red',    lbl:'Libur'},
    [`${y}-05-29`]:{cls:'ev-red',    lbl:'Libur'},
    [`${y}-06-01`]:{cls:'ev-blue',   lbl:'Upacara'},
    [`${y}-06-05`]:{cls:'ev-blue',   lbl:'Rapat'},
    [`${y}-06-10`]:{cls:'ev-yellow', lbl:'PAT'},
    [`${y}-06-11`]:{cls:'ev-yellow', lbl:'PAT'},
    [`${y}-06-12`]:{cls:'ev-yellow', lbl:'PAT'},
    [`${y}-06-13`]:{cls:'ev-yellow', lbl:'PAT'},
    [`${y}-06-17`]:{cls:'ev-red',    lbl:'Libur'},
    [`${y}-06-24`]:{cls:'ev-green',  lbl:'Libur'},
    [`${y}-06-25`]:{cls:'ev-green',  lbl:'Libur'},
    [`${y}-06-26`]:{cls:'ev-green',  lbl:'Libur'},
    [`${y}-06-27`]:{cls:'ev-green',  lbl:'Libur'},
    [`${y}-06-28`]:{cls:'ev-green',  lbl:'Libur'},
    [`${y}-06-29`]:{cls:'ev-green',  lbl:'Libur'},
    [`${y}-06-30`]:{cls:'ev-green',  lbl:'Libur'},
    [`${y}-08-17`]:{cls:'ev-red',    lbl:'HUT RI'},
    [`${y}-12-25`]:{cls:'ev-red',    lbl:'Libur'},
  };
})();

const MONTHS = ['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'];
const DAYS   = ['Min','Sen','Sel','Rab','Kam','Jum','Sab'];

function loadKalender() {
  const grid  = document.getElementById('kalGrid');
  const title = document.getElementById('kalTitle');
  if (!grid) return;

  const today    = new Date();
  const daysInM  = new Date(kalYear, kalMon+1, 0).getDate();
  const startDay = new Date(kalYear, kalMon, 1).getDay();

  if (title) title.textContent = `${MONTHS[kalMon]} ${kalYear}`;

  let html = '<div class="kal-headers">';
  DAYS.forEach((d,i) => { html += `<div class="kal-hdr${i===0||i===6?' wend':''}">${d}</div>`; });
  html += '</div><div class="kal-cells">';

  for (let i=0;i<startDay;i++) html += '<div></div>';

  for (let d=1; d<=daysInM; d++) {
    const ds  = `${kalYear}-${String(kalMon+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
    const ev  = KAL_EVENTS[ds];
    const dow = new Date(kalYear,kalMon,d).getDay();
    const isToday = kalYear===today.getFullYear()&&kalMon===today.getMonth()&&d===today.getDate();
    const wend    = (dow===0||dow===6) && !ev;
    html += `<div class="kal-day${isToday?' today':''}${ev?' '+ev.cls:''}${wend?' wend':''}">
      ${d}${ev?`<span class="kal-ev-lbl">${ev.lbl}</span>`:''}
    </div>`;
  }
  html += '</div>';
  grid.innerHTML = html;
}

document.getElementById('kalPrev')?.addEventListener('click', () => {
  kalMon--; if(kalMon<0){kalMon=11;kalYear--;} loadKalender();
});
document.getElementById('kalNext')?.addEventListener('click', () => {
  kalMon++; if(kalMon>11){kalMon=0;kalYear++;} loadKalender();
});

// ============================================================
//  PENGUMUMAN — Realtime dari Firestore
//  Operator membuat dokumen di koleksi 'pengumuman' dengan field:
//  judul, isi (teks penuh, operator bisa tulis paragraf dipisah \n),
//  kategori (penting/info/kegiatan/umum), penulis, createdAt, pinned(bool)
// ============================================================
async function loadPengumuman() {
  const grid  = document.getElementById('pengumumanGrid');
  const empty = document.getElementById('pengumumanEmpty');
  const dashAnn = document.getElementById('dashAnn');

  if (!grid) return;
  grid.innerHTML = skeletons(3,'120px');

  try {
    const snap = await db.collection('pengumuman')
      .orderBy('createdAt','desc').limit(20).get();

    if (snap.empty) {
      grid.innerHTML='';
      if(empty) empty.style.display='block';
      if(dashAnn) dashAnn.innerHTML='<p style="padding:14px 16px;font-size:.8rem;color:#94a3b8;">Belum ada pengumuman.</p>';
      updateAnnBadge(0);
      return;
    }

    if(empty) empty.style.display='none';
    updateAnnBadge(snap.size);

    const docs = snap.docs.map(d=>({id:d.id,...d.data()}));
    // Pinned first
    docs.sort((a,b) => (b.pinned||false)-(a.pinned||false));

    // Full grid
    grid.innerHTML='';
    docs.forEach(d => grid.appendChild(buildAnnCard(d)));

    // Dashboard preview (3 items)
    if (dashAnn) {
      dashAnn.innerHTML='';
      docs.slice(0,3).forEach(d => {
        const colors = { penting:'#dc2626', info:'#0284c7', kegiatan:'#d97706', umum:'#059669' };
        const col    = colors[d.kategori||'umum'] || '#059669';
        const el     = document.createElement('div');
        el.className = 'da-item';
        el.innerHTML = `
          <div class="da-dot" style="background:${col};"></div>
          <div style="flex:1;">
            <div class="da-title">${safe(d.judul||'Tanpa Judul')}</div>
            <div class="da-date">${fmtDate(d.createdAt)}</div>
          </div>
          <i class="fas fa-chevron-right da-arrow"></i>
        `;
        el.addEventListener('click', () => openAnnModal(d));
        dashAnn.appendChild(el);
      });
    }

  } catch(e) {
    console.error(e);
    grid.innerHTML='<p style="padding:20px;text-align:center;color:#dc2626;font-size:.82rem;">Gagal memuat pengumuman. Periksa koneksi.</p>';
  }
}

function buildAnnCard(d) {
  const cat    = d.kategori || 'umum';
  const tags   = { penting:{cls:'penting',icon:'fa-thumbtack',lbl:'Penting'}, info:{cls:'info',icon:'fa-info-circle',lbl:'Info'}, kegiatan:{cls:'kegiatan',icon:'fa-star',lbl:'Kegiatan'}, umum:{cls:'umum',icon:'fa-bullhorn',lbl:'Umum'} };
  const tag    = tags[cat] || tags.umum;
  const isi    = d.isi || '';
  const preview= isi.split('\n').filter(Boolean)[0] || '';
  const dateStr= fmtDate(d.createdAt);

  const card = document.createElement('div');
  card.className = `ann-card${d.pinned?' pinned':''}`;
  card.innerHTML = `
    <div class="ann-card-top">
      <div class="ann-tag ${tag.cls}"><i class="fas ${tag.icon}"></i> ${tag.lbl}</div>
      <div class="ann-title">${safe(d.judul||'Tanpa Judul')}</div>
      <div class="ann-preview">${safe(preview)}</div>
    </div>
    <div class="ann-card-bottom">
      <div>
        <div class="ann-meta"><i class="fas fa-calendar-day"></i> ${dateStr}</div>
        ${d.penulis ? `<div class="ann-meta" style="margin-top:3px;"><i class="fas fa-user-tie"></i> ${safe(d.penulis)}</div>` : ''}
      </div>
      <button class="btn-read-more"><i class="fas fa-book-open"></i> Baca Selengkapnya</button>
    </div>
  `;
  card.querySelector('.btn-read-more').addEventListener('click', () => openAnnModal(d));
  return card;
}

function openAnnModal(d) {
  const cat    = d.kategori||'umum';
  const colors = { penting:'#dc2626', info:'#0284c7', kegiatan:'#d97706', umum:'#059669' };
  const iconEl = document.getElementById('modalAnnIcon');
  const titleEl= document.getElementById('modalAnnTitle');
  const metaEl = document.getElementById('modalAnnMeta');
  const bodyEl = document.getElementById('modalAnnBody');

  if (iconEl) iconEl.style.background = colors[cat]+'22';
  if (iconEl) iconEl.style.color      = colors[cat];
  if (iconEl) iconEl.style.borderColor= colors[cat]+'44';
  if (titleEl) titleEl.textContent = d.judul||'Tanpa Judul';
  if (metaEl)  metaEl.textContent  = `${fmtDate(d.createdAt)}${d.penulis?' • '+d.penulis:''}`;

  // Render isi: setiap baris baru jadi <p> terpisah
  if (bodyEl && d.isi) {
    const paras = d.isi.split('\n').filter(p => p.trim() !== '');
    bodyEl.innerHTML = paras.map(p => `<p>${safe(p)}</p>`).join('');
  } else if (bodyEl) {
    bodyEl.innerHTML = '<p style="color:#94a3b8;">Isi pengumuman belum tersedia.</p>';
  }

  openModal('modalReadAnn');
}

function updateAnnBadge(n) {
  const b = document.getElementById('navBadgeAnn');
  if (b) { b.textContent = n; b.style.display = n>0?'':'none'; }
}

function loadDashAnn() {
  // Called after stats load. If pengumuman already loaded, skip
  // (actual load is done in loadPengumuman)
  const dashAnn = document.getElementById('dashAnn');
  if (dashAnn && dashAnn.children.length===0) loadPengumuman();
}

function fmtDate(ts) {
  if (!ts) return '—';
  const d = ts.toDate ? ts.toDate() : new Date(ts);
  return d.toLocaleDateString('id-ID',{day:'numeric',month:'long',year:'numeric'});
}

// ============================================================
//  LUPA PASSWORD
// ============================================================
document.getElementById('forgotForm')?.addEventListener('submit', async e => {
  e.preventDefault();
  const nip  = document.getElementById('fForgotNip')?.value.trim();
  const nuptk= document.getElementById('fForgotNuptk')?.value.trim();
  const nama = document.getElementById('fForgotNama')?.value.trim();
  if (!nip||!nuptk||!nama) { toast('error','Lengkapi Data','Semua field wajib diisi!'); return; }
  if (nuptk.length<16)     { toast('error','NUPTK Salah','NUPTK harus 16 digit!'); return; }

  const btn = document.getElementById('btnForgotSubmit');
  if (btn) { btn.disabled=true; btn.innerHTML='<i class="fas fa-circle-notch fa-spin"></i> Mengirim...'; }

  try {
    await db.collection('resetPasswordRequests').add({
      nip, nuptk, nama, status:'pending',
      alasan:'',
      createdAt: firebase.firestore.FieldValue.serverTimestamp()
    });
    closeModal('modalForgot');
    document.getElementById('forgotForm')?.reset();
    toast('success','Permintaan Terkirim!','Request reset password berhasil dikirim. Tunggu persetujuan operator maksimal 1x24 jam.', 7000);
  } catch(err) {
    toast('error','Gagal','Terjadi kesalahan. Coba lagi.');
  } finally {
    if (btn) { btn.disabled=false; btn.innerHTML='<i class="fas fa-paper-plane"></i> Kirim Permintaan'; }
  }
});

// ============================================================
//  CEK STATUS RESET
//  Catatan: TIDAK menggunakan orderBy() bersamaan dengan where()
//  agar tidak butuh composite index Firestore.
//  Sorting dilakukan manual di sisi JavaScript.
// ============================================================
document.getElementById('btnDoCek')?.addEventListener('click', async () => {
  const nip = document.getElementById('fCekNip')?.value.trim();
  if (!nip) { toast('error','Isi NIP','Masukkan NIP atau NUPTK!'); return; }
  const res = document.getElementById('cekResetResult');
  if (res) res.innerHTML = skeletons(1,'72px');

  try {
    // Cari berdasarkan field 'nip', tanpa orderBy
    let snap = await db.collection('resetPasswordRequests').where('nip','==',nip).get();

    // Jika tidak ketemu, coba cari berdasarkan field 'nuptk'
    if (snap.empty) {
      snap = await db.collection('resetPasswordRequests').where('nuptk','==',nip).get();
    }

    // Jika masih kosong, tidak ada data
    if (snap.empty) {
      res.innerHTML='<div class="reset-status-card" style="background:#f8fafc;border-color:#e2e8f0;"><p style="font-size:.82rem;color:#64748b;">Tidak ada permintaan reset password untuk NIP/NUPTK ini.</p></div>';
      return;
    }

    // Sort manual: terbaru dulu berdasarkan createdAt
    const allDocs = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    allDocs.sort((a, b) => {
      const ta = a.createdAt?.toMillis ? a.createdAt.toMillis() : 0;
      const tb = b.createdAt?.toMillis ? b.createdAt.toMillis() : 0;
      return tb - ta; // descending
    });

    const data = allDocs[0];
    resetDocId = data.id;

    const sMap = {
      pending:    {cls:'pending',    icon:'fa-clock',        col:'#d97706', lbl:'Menunggu Persetujuan'},
      processing: {cls:'processing', icon:'fa-spinner',      col:'#2563eb', lbl:'Sedang Diproses'},
      approved:   {cls:'approved',   icon:'fa-check-circle', col:'#059669', lbl:'Disetujui — Siap Reset'},
      rejected:   {cls:'rejected',   icon:'fa-times-circle', col:'#dc2626', lbl:'Ditolak'},
      completed:  {cls:'approved',   icon:'fa-shield-check', col:'#059669', lbl:'Password Berhasil Diperbarui'},
    };
    const st = sMap[data.status]||sMap.pending;

    let extra='';
    if (data.status==='approved') extra=`
      <div style="margin-top:12px;padding-top:12px;border-top:1px solid #e2e8f0;">
        <p style="font-size:.78rem;color:#059669;font-weight:700;margin-bottom:8px;"><i class="fas fa-exclamation-triangle"></i> Segera reset password sebelum link kedaluwarsa!</p>
        <button onclick="doOpenReset()" class="btn-primary w-full"><i class="fas fa-key"></i> Reset Password Sekarang</button>
      </div>`;
    if (data.status==='completed') extra=`
      <div style="margin-top:12px;padding:12px;background:#f0fdf4;border-radius:8px;border:1px solid #bbf7d0;">
        <p style="font-size:.8rem;font-weight:700;color:#059669;"><i class="fas fa-circle-check"></i> Password Anda sudah berhasil diperbarui. Silakan login menggunakan password baru.</p>
      </div>`;
    if (data.status==='rejected') extra=`
      <div style="margin-top:10px;padding:10px;background:#fef2f2;border-radius:8px;border:1px solid #fecaca;">
        <p style="font-size:.75rem;font-weight:700;color:#dc2626;margin-bottom:4px;"><i class="fas fa-comment-alt"></i> Alasan Penolakan:</p>
        <p style="font-size:.8rem;color:#475569;">${safe(data.alasan||'Tidak ada alasan.')}</p>
      </div>
      <button onclick="doReajukan()" style="margin-top:10px;background:#fffbeb;border:1.5px solid #fcd34d;color:#d97706;font-weight:700;font-size:.8rem;border-radius:8px;padding:8px 14px;cursor:pointer;width:100%;">
        <i class="fas fa-redo"></i> Ajukan Ulang
      </button>`;

    res.innerHTML=`<div class="reset-status-card ${st.cls}">
      <div style="display:flex;align-items:center;gap:10px;">
        <i class="fas ${st.icon}" style="font-size:1.3rem;color:${st.col};"></i>
        <div>
          <div style="font-weight:800;font-size:.88rem;color:#0f172a;">Status: ${st.lbl}</div>
          <div style="font-size:.74rem;color:#64748b;">${safe(data.nama)} &nbsp;|&nbsp; NIP: ${safe(data.nip)}</div>
        </div>
      </div>${extra}
    </div>`;
  } catch(e) {
    console.error('Cek reset error:', e);
    const errMsg = e?.code === 'failed-precondition'
      ? 'Konfigurasi database belum siap. Hubungi operator.'
      : e?.message || 'Terjadi kesalahan tidak diketahui.';
    if(res) res.innerHTML=`
      <div class="reset-status-card" style="background:#fef2f2;border-color:#fecaca;">
        <p style="font-size:.82rem;color:#dc2626;font-weight:700;margin-bottom:6px;"><i class="fas fa-exclamation-circle"></i> Gagal memuat status</p>
        <p style="font-size:.76rem;color:#64748b;">${safe(errMsg)}</p>
        <p style="font-size:.74rem;color:#94a3b8;margin-top:6px;">Cek koneksi internet lalu coba lagi.</p>
      </div>`;
  }
});

function doOpenReset() {
  closeModal('modalCekReset');
  openModal('modalResetPass');
  startCountdown(180);
}
function doReajukan() {
  closeModal('modalCekReset');
  openModal('modalForgot');
}
window.doOpenReset = doOpenReset;
window.doReajukan  = doReajukan;

// ============================================================
//  COUNTDOWN TIMER
// ============================================================
function startCountdown(secs) {
  if (countdownItv) clearInterval(countdownItv);
  let rem = secs;
  const circ = 2*Math.PI*34; // r=34

  function tick() {
    const m  = Math.floor(rem/60);
    const s  = String(rem%60).padStart(2,'0');
    const num= document.getElementById('countdownNum');
    const arc= document.getElementById('countdownArc');
    if (num) num.textContent = `${m}:${s}`;
    if (arc) arc.style.strokeDashoffset = circ*(1-rem/secs);
    if (arc) arc.style.stroke = rem<60 ? '#dc2626' : '#059669';
    if (rem<=0) {
      clearInterval(countdownItv);
      closeModal('modalResetPass');
      toast('error','Waktu Habis','Link reset password sudah kedaluwarsa. Ajukan ulang.',6000);
    }
    rem--;
  }
  tick();
  countdownItv = setInterval(tick, 1000);
}

// ============================================================
//  RESET PASSWORD FORM
// ============================================================
document.getElementById('resetPassForm')?.addEventListener('submit', async e => {
  e.preventDefault();
  const np = document.getElementById('fNewPass')?.value;
  const cp = document.getElementById('fConfPass')?.value;
  if (np.length<8)  { toast('error','Terlalu Pendek','Password minimal 8 karakter!'); return; }
  if (np!==cp)      { toast('error','Tidak Cocok','Konfirmasi password tidak sesuai!'); return; }
  if (!resetDocId)  { toast('error','Error','Sesi tidak valid.'); return; }

  const btn = document.getElementById('btnResetPassSubmit');
  if (btn) { btn.disabled=true; btn.innerHTML='<i class="fas fa-circle-notch fa-spin"></i>'; }

  try {
    const reqDoc = await db.collection('resetPasswordRequests').doc(resetDocId).get();
    if (!reqDoc.exists) throw new Error('Not found');
    const { nip, nuptk } = reqDoc.data();

    let gs = await db.collection('guru').where('nip','==',nip).get();
    if (gs.empty) gs = await db.collection('guru').where('nuptk','==',nuptk).get();
    if (!gs.empty) await gs.docs[0].ref.update({ password: np });
    await db.collection('resetPasswordRequests').doc(resetDocId).update({ status:'completed' });

    clearInterval(countdownItv);
    closeModal('modalResetPass');
    toast('success','Password Diperbarui!','Silakan login dengan password baru Anda.',6000);
    resetDocId=null;
  } catch(err) {
    toast('error','Gagal','Tidak dapat memperbarui password.');
  } finally {
    if(btn) { btn.disabled=false; btn.innerHTML='<i class="fas fa-save"></i> Simpan Password Baru'; }
  }
});

// ============================================================
//  LAPORAN ABSENSI
// ============================================================
function initLaporan() {
  const now = new Date();
  const bl  = document.getElementById('lBulan');
  const th  = document.getElementById('lTahun');
  if (bl) bl.value = now.getMonth();
  if (th) th.value = now.getFullYear();
}

document.getElementById('btnLoadLaporan')?.addEventListener('click', loadLaporan);

async function loadLaporan() {
  if (!guru) return;
  const bulan  = parseInt(document.getElementById('lBulan')?.value);
  const tahun  = parseInt(document.getElementById('lTahun')?.value);
  const prefix = `${tahun}-${String(bulan+1).padStart(2,'0')}`;
  const tbody  = document.getElementById('laporanBody');
  const sum    = document.getElementById('laporanSummary');
  if (tbody) tbody.innerHTML='<tr><td colspan="7" class="tbl-empty"><i class="fas fa-circle-notch fa-spin"></i> Memuat...</td></tr>';

  try {
    const snap = await db.collection('absensiGuru').where('guruId','==',guru.id).get();
    const rows = snap.docs.map(d=>d.data()).filter(d=>d.tanggal?.startsWith(prefix)).sort((a,b)=>a.tanggal.localeCompare(b.tanggal));

    const cnt = {h:0,s:0,i:0,disp:0};
    rows.forEach(d=>{
      if(d.status==='hadir') cnt.h++;
      else if(d.status==='sakit') cnt.s++;
      else if(d.status==='izin') cnt.i++;
      else cnt.disp++;
    });

    if (sum) sum.innerHTML=`
      <div class="sum-card"><span class="sum-val">${rows.length}</span><span class="sum-lbl">Total Data</span></div>
      <div class="sum-card"><span class="sum-val" style="color:#059669;">${cnt.h}</span><span class="sum-lbl">Hadir</span></div>
      <div class="sum-card"><span class="sum-val" style="color:#dc2626;">${cnt.s}</span><span class="sum-lbl">Sakit</span></div>
      <div class="sum-card"><span class="sum-val" style="color:#d97706;">${cnt.i+cnt.disp}</span><span class="sum-lbl">Izin/Dispensasi</span></div>
    `;

    if (rows.length===0) {
      if(tbody) tbody.innerHTML='<tr><td colspan="7" class="tbl-empty">Tidak ada data untuk periode ini.</td></tr>';
      return;
    }
    if (tbody) {
      tbody.innerHTML='';
      rows.forEach((d,idx)=>{
        const tgl  = new Date(d.tanggal+'T00:00:00');
        const hari = tgl.toLocaleDateString('id-ID',{weekday:'long'});
        const tr   = document.createElement('tr');
        tr.innerHTML=`
          <td>${idx+1}</td>
          <td>${d.tanggal}</td>
          <td>${hari}</td>
          <td><span class="status-chip ${d.status}">${sLabel(d.status)}</span></td>
          <td>${d.jamAbsen||'—'}</td>
          <td>${safe(d.keterangan&&d.keterangan!=='-'?d.keterangan:'')}</td>
          <td>${d.buktiUrl?`<a href="${safe(d.buktiUrl)}" target="_blank" style="color:#0284c7;font-size:.75rem;"><i class="fab fa-google-drive"></i> Lihat</a>`:'—'}</td>
        `;
        tbody.appendChild(tr);
      });
    }
  } catch(e) {
    if(tbody) tbody.innerHTML='<tr><td colspan="7" class="tbl-empty">Gagal memuat data.</td></tr>';
  }
}

// ============================================================
//  PROFIL
// ============================================================
document.getElementById('profileForm')?.addEventListener('submit', async e => {
  e.preventDefault();
  if (!guru) return;
  const upd = {
    nama:  document.getElementById('pNama')?.value.trim(),
    nuptk: document.getElementById('pNuptk')?.value.trim(),
    mapel: document.getElementById('pMapel')?.value.trim(),
    hp:    document.getElementById('pHp')?.value.trim(),
    email: document.getElementById('pEmail')?.value.trim(),
  };
  const btn = e.target.querySelector('button[type=submit]');
  if(btn){btn.disabled=true;btn.innerHTML='<i class="fas fa-circle-notch fa-spin"></i> Menyimpan...';}
  try {
    await db.collection('guru').doc(guru.id).update(upd);
    Object.assign(guru,upd);
    fillUserUI();
    const sess = JSON.parse(localStorage.getItem('pgSession')||'{}');
    if(sess.id) localStorage.setItem('pgSession',JSON.stringify({...sess,...upd}));
    toast('success','Profil Diperbarui','Data profil berhasil disimpan.');
  } catch(e) {
    toast('error','Gagal','Tidak dapat menyimpan profil.');
  } finally {
    if(btn){btn.disabled=false;btn.innerHTML='<i class="fas fa-save"></i> Simpan Perubahan';}
  }
});

document.getElementById('avatarInput')?.addEventListener('change', function(){
  const f = this.files?.[0];
  if (!f) return;
  if (!f.type.startsWith('image/')) { toast('error','File Salah','Pilih file gambar (JPG/PNG/dll)!'); return; }
  // Batas ukuran file: 3MB sebelum kompresi
  if (f.size > 3 * 1024 * 1024) { toast('error','File Terlalu Besar','Ukuran foto maksimal 3MB!'); return; }

  // Tampilkan loading
  ['profileAvatarDiv','sidebarAvatar','topbarAvatar'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.innerHTML = '<i class="fas fa-circle-notch fa-spin" style="font-size:1.2rem;color:#006633;"></i>';
  });

  const reader = new FileReader();
  reader.onload = ev => {
    // Kompres gambar via Canvas sebelum simpan ke Firestore
    const img = new Image();
    img.onload = async () => {
      // Target max 200x200px, kualitas 0.75
      const MAX = 200;
      const canvas = document.createElement('canvas');
      let w = img.width, h = img.height;
      if (w > h) { if (w > MAX) { h = Math.round(h * MAX / w); w = MAX; } }
      else        { if (h > MAX) { w = Math.round(w * MAX / h); h = MAX; } }
      canvas.width = w; canvas.height = h;
      canvas.getContext('2d').drawImage(img, 0, 0, w, h);
      const base64 = canvas.toDataURL('image/jpeg', 0.75); // compressed JPEG

      // Tampilkan di UI dulu (instan)
      applyAvatarToUI(base64);

      // Simpan ke Firestore field 'fotoUrl'
      try {
        if (!guru?.id) throw new Error('Tidak ada sesi guru');
        await db.collection('guru').doc(guru.id).update({ fotoUrl: base64 });
        // Update state lokal
        guru.fotoUrl = base64;
        // Update session di localStorage juga
        const sess = JSON.parse(localStorage.getItem('pgSession') || '{}');
        if (sess.id) {
          sess.fotoUrl = base64;
          localStorage.setItem('pgSession', JSON.stringify(sess));
        }
        toast('success','Foto Tersimpan!','Foto profil berhasil disimpan dan akan muncul di semua perangkat.');
      } catch(err) {
        console.error('Gagal simpan foto:', err);
        toast('error','Gagal Menyimpan','Foto tampil sementara tapi gagal disimpan ke server. Coba lagi.');
      }
    };
    img.src = ev.target.result;
  };
  reader.readAsDataURL(f);
});

// Fungsi terapkan foto ke semua elemen avatar di UI
function applyAvatarToUI(src) {
  ['profileAvatarDiv','sidebarAvatar','topbarAvatar'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.innerHTML = `<img src="${src}" alt="foto profil" style="width:100%;height:100%;object-fit:cover;border-radius:50%;">`;
  });
}

// Muat foto profil dari Firestore saat masuk portal
async function loadFotoProfile() {
  if (!guru?.id) return;
  try {
    // Cek di state lokal dulu (dari session)
    if (guru.fotoUrl) { applyAvatarToUI(guru.fotoUrl); return; }
    // Kalau belum ada, ambil dari Firestore
    const doc = await db.collection('guru').doc(guru.id).get();
    if (doc.exists && doc.data().fotoUrl) {
      const src = doc.data().fotoUrl;
      guru.fotoUrl = src;
      applyAvatarToUI(src);
      // Simpan ke session
      const sess = JSON.parse(localStorage.getItem('pgSession') || '{}');
      if (sess.id) { sess.fotoUrl = src; localStorage.setItem('pgSession', JSON.stringify(sess)); }
    }
  } catch(e) {
    console.warn('Gagal muat foto profil:', e);
  }
}

// ============================================================
//  SESSION AUTO-LOGIN
// ============================================================
(function restoreSession() {
  try {
    const s = JSON.parse(localStorage.getItem('pgSession')||'{}');
    if (!s.id||!s._at) return;
    const hrs = (Date.now()-new Date(s._at))/(1000*60*60);
    if (hrs>24) { localStorage.removeItem('pgSession'); return; }
    guru = s;
    enterPortal();
  } catch(e) { localStorage.removeItem('pgSession'); }
})();

// Session timeout: 8 hours inactivity
let lastAct = Date.now();
['mousemove','keydown','touchstart','click'].forEach(ev => document.addEventListener(ev,()=>lastAct=Date.now()));
setInterval(()=>{
  if(guru && Date.now()-lastAct > 8*60*60*1000) {
    guru=null; localStorage.removeItem('pgSession');
    document.getElementById('portalApp').style.display='none';
    document.getElementById('bottomNav').style.display='none';
    document.getElementById('loginPage').style.display='';
    toast('warning','Sesi Berakhir','Anda dikeluarkan karena tidak aktif 8 jam.');
  }
},60000);

// ============================================================
//  HELPERS
// ============================================================
function sLabel(s) {
  return {hadir:'Hadir',sakit:'Sakit',izin:'Izin',dispensasi_dinas:'Dispensasi Dinas',dispensasi_sekolah:'Dispensasi Sekolah'}[s]||s;
}
function sIcon(s) {
  return {hadir:'fa-check-circle',sakit:'fa-notes-medical',izin:'fa-envelope-open-text',dispensasi_dinas:'fa-building',dispensasi_sekolah:'fa-school'}[s]||'fa-circle';
}
function setText(id,v) { const el=document.getElementById(id); if(el) el.textContent=v; }
function skeletons(n,h) {
  return Array(n).fill(`<div class="skeleton-item" style="height:${h};margin:10px 16px;border-radius:10px;background:linear-gradient(90deg,#f1f5f9 25%,#e2e8f0 50%,#f1f5f9 75%);background-size:200% 100%;animation:shimmer 1.4s infinite;"></div>`).join('');
}
const shimmerStyle = document.createElement('style');
shimmerStyle.textContent='@keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}';
document.head.appendChild(shimmerStyle);

console.log('%c✅ Portal Guru SMAN 68 Jakarta — v2.1 Light Edition','color:#006633;font-weight:800;font-size:13px;');
