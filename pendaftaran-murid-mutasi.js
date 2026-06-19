// ============================================================
// FIREBASE INIT
// ============================================================
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

// ============================================================
// STATUS PENDAFTARAN GATE (Realtime dari Firestore)
// ============================================================
let countdownInterval = null;
let pendaftaranUnsubscribe = null;
let gateOpen = false;

function showGate(state, targetDate) {
  const gate = document.getElementById('registrationGate');
  const loading = document.getElementById('gateLoading');
  const closed = document.getElementById('gateClosed');
  const countdown = document.getElementById('gateCountdown');

  loading.style.display = 'none';
  closed.style.display = 'none';
  countdown.style.display = 'none';

  if (state === 'open') {
    // Sembunyikan gate, tampilkan konten pendaftaran
    gate.classList.remove('active');
    document.body.style.overflow = '';
    gateOpen = true;
    if (countdownInterval) { clearInterval(countdownInterval); countdownInterval = null; }
    return;
  }

  // Tampilkan gate, sembunyikan konten
  gate.classList.add('active');
  document.body.style.overflow = 'hidden';
  gateOpen = false;

  if (state === 'closed') {
    closed.style.display = 'block';
    if (countdownInterval) { clearInterval(countdownInterval); countdownInterval = null; }

  } else if (state === 'countdown' && targetDate) {
    countdown.style.display = 'block';
    const target = new Date(targetDate);
    // Tampilkan tanggal pembukaan
    const dateStr = target.toLocaleString('id-ID', {
      weekday: 'long', day: '2-digit', month: 'long', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    }) + ' WIB';
    document.getElementById('gateOpenDateText').innerHTML = 'Pembukaan: <strong>' + dateStr + '</strong>';

    // Mulai countdown
    if (countdownInterval) clearInterval(countdownInterval);
    function tickCountdown() {
      const now = new Date();
      const diff = target - now;
      if (diff <= 0) {
        // Waktunya tiba — buka otomatis tanpa reload
        clearInterval(countdownInterval);
        countdownInterval = null;
        setCountdownDisplay(0, 0, 0, 0);
        showGate('open');
        return;
      }
      const days    = Math.floor(diff / 86400000);
      const hours   = Math.floor((diff % 86400000) / 3600000);
      const minutes = Math.floor((diff % 3600000) / 60000);
      const seconds = Math.floor((diff % 60000) / 1000);
      setCountdownDisplay(days, hours, minutes, seconds);
    }
    tickCountdown();
    countdownInterval = setInterval(tickCountdown, 1000);
  }
}

function setCountdownDisplay(d, h, m, s) {
  function update(id, val) {
    const el = document.getElementById(id);
    const str = String(val).padStart(2, '0');
    if (el.textContent !== str) {
      el.classList.remove('flip');
      void el.offsetWidth; // reflow
      el.classList.add('flip');
      el.textContent = str;
    }
  }
  update('cdDays', d);
  update('cdHours', h);
  update('cdMinutes', m);
  update('cdSeconds', s);
}

function initPendaftaranGate() {
  // Realtime listener ke Firestore settings/pendaftaran
  pendaftaranUnsubscribe = db.collection('settings').doc('pendaftaran')
    .onSnapshot(snap => {
      if (!snap.exists) {
        showGate('closed');
        return;
      }
      const data = snap.data();
      const isOpen = data.isOpen === true;
      const countdownActive = data.countdownActive === true;
      const countdownTarget = data.countdownTarget || null;

      if (isOpen) {
        showGate('open');
      } else if (countdownActive && countdownTarget) {
        // Cek apakah waktu countdown sudah lewat
        const target = new Date(countdownTarget);
        if (new Date() >= target) {
          showGate('open');
        } else {
          showGate('countdown', countdownTarget);
        }
      } else {
        showGate('closed');
      }
    }, err => {
      console.error('Gate listener error:', err);
      // Jika gagal listen, default tampilkan form (fail-open)
      showGate('open');
    });
}

// ============================================================
// CLOCK
// ============================================================
function updateClock() {
  const now = new Date();
  const hh = String(now.getHours()).padStart(2, '0');
  const mm = String(now.getMinutes()).padStart(2, '0');
  const ss = String(now.getSeconds()).padStart(2, '0');
  document.getElementById('clockDisplay').textContent = `${hh}:${mm}:${ss}`;
}
setInterval(updateClock, 1000);
updateClock();

// ============================================================
// DARK / LIGHT MODE
// ============================================================
const themeToggle = document.getElementById('themeToggle');
const themeIcon = document.getElementById('themeIcon');
let isDark = localStorage.getItem('theme') === 'dark';

function applyTheme() {
  document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
  themeIcon.className = isDark ? 'fas fa-sun' : 'fas fa-moon';
}
applyTheme();
themeToggle.addEventListener('click', () => {
  isDark = !isDark;
  localStorage.setItem('theme', isDark ? 'dark' : 'light');
  applyTheme();
});

// ============================================================
// TOAST
// ============================================================
function toast(type, msg, duration = 5000) {
  const wrap = document.getElementById('toastWrap');
  const icons = { success: 'fa-circle-check', error: 'fa-circle-xmark', warn: 'fa-triangle-exclamation', info: 'fa-circle-info' };
  const el = document.createElement('div');
  el.className = `toast-item t-${type}`;
  el.innerHTML = `<i class="fas ${icons[type] || icons.info}"></i><span class="toast-msg">${msg}</span>`;
  wrap.appendChild(el);
  setTimeout(() => {
    el.style.transition = 'opacity 0.4s, transform 0.4s';
    el.style.opacity = '0';
    el.style.transform = 'translateX(110%)';
    setTimeout(() => el.remove(), 400);
  }, duration);
}

// ============================================================
// TABS
// ============================================================
document.querySelectorAll('.tab-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.tab-pane').forEach(p => p.classList.remove('active'));
    btn.classList.add('active');
    const tab = document.getElementById('tab-' + btn.dataset.tab);
    if (tab) tab.classList.add('active');
  });
});

// ============================================================
// DOCUMENT LIST
// ============================================================
const DOCS = [
  { id: 'nilaiRapor', icon: 'fa-file-lines', title: 'Nilai Rapor', desc: 'Fotokopi rapor semester terakhir (dilegalisir)' },
  { id: 'pasFoto', icon: 'fa-camera', title: 'Pas Foto 3×4', desc: 'Background merah, format JPG/PNG' },
  { id: 'aktaLahir', icon: 'fa-certificate', title: 'Akta Kelahiran', desc: 'Scan/foto akta kelahiran' },
  { id: 'kartuKeluarga', icon: 'fa-users', title: 'Kartu Keluarga', desc: 'Scan/foto kartu keluarga' },
  { id: 'ktpOrKia', icon: 'fa-id-card', title: 'KTP / KIA / Kartu Pelajar', desc: 'KTP orang tua atau KIA/kartu pelajar siswa' },
  { id: 'suratBaik', icon: 'fa-circle-check', title: 'Surat Keterangan Berkelakuan Baik', desc: 'Dari sekolah asal' },
  { id: 'suratSehat', icon: 'fa-notes-medical', title: 'Surat Keterangan Sehat', desc: 'Dari dokter/puskesmas' },
  { id: 'suratPindahOrtu', icon: 'fa-file-signature', title: 'Surat Permohonan Pindah', desc: 'Dari orang tua/wali murid' },
  { id: 'suratPindahSekolah', icon: 'fa-file-export', title: 'Surat Keterangan Pindah', desc: 'Dari sekolah asal (stempel resmi)' },
];

const docContainer = document.getElementById('docListContainer');
DOCS.forEach(doc => {
  const div = document.createElement('div');
  div.className = 'doc-item';
  div.innerHTML = `
    <div class="doc-icon2"><i class="fas ${doc.icon}"></i></div>
    <div>
      <div class="doc-name">${doc.title}</div>
      <div class="doc-desc">${doc.desc}</div>
    </div>
    <div class="doc-input-wrap">
      <input type="url" id="doc_${doc.id}" placeholder="https://drive.google.com/file/d/..." class="form-input" style="font-size:0.82rem;">
    </div>`;
  docContainer.appendChild(div);
});

// ============================================================
// STEP MANAGEMENT
// ============================================================
let currentStep = 1;
function setStep(n) {
  currentStep = n;
  [1, 2, 3, 4].forEach(i => {
    document.getElementById(`formStep${i}`).style.display = i === n ? 'block' : 'none';
    const el = document.getElementById(`step${i}`);
    el.classList.remove('active', 'done');
    if (i < n) el.classList.add('done');
    else if (i === n) el.classList.add('active');
  });
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ============================================================
// COLLECT DATA
// ============================================================
function collectData() {
  return {
    nama: v('f_nama'),
    tglLahir: v('f_tglLahir'),
    jk: v('f_jk'),
    agama: v('f_agama'),
    kelasSaatIni: v('f_kelasSaatIni'),
    mutasiKe: v('f_mutasiKe'),
    kurikulum: v('f_kurikulum'),
    sekolahAsal: v('f_sekolahAsal'),
    npsn: v('f_npsn'),
    alasan: v('f_alasan'),
    email: v('f_email').toLowerCase(),
    telpMurid: v('f_telpMurid'),
    telpOrtu: v('f_telpOrtu'),
    linkSurat: v('f_linkSurat'),
    docs: Object.fromEntries(DOCS.map(d => [d.id, v(`doc_${d.id}`) || '-'])),
  };
}
function v(id) { return (document.getElementById(id)?.value || '').trim(); }

// ============================================================
// VALIDATION HELPERS
// ============================================================
function validateStep1() {
  const d = collectData();
  const requiredFields = [
    [d.nama, 'Nama lengkap'],
    [d.tglLahir, 'Tanggal lahir'],
    [d.jk, 'Jenis kelamin'],
    [d.agama, 'Agama'],
    [d.kelasSaatIni, 'Kelas saat ini'],
    [d.mutasiKe, 'Kelas tujuan mutasi'],
    [d.kurikulum, 'Kurikulum/Jurusan'],
    [d.sekolahAsal, 'Sekolah asal'],
    [d.npsn, 'NPSN sekolah asal'],
    [d.alasan, 'Alasan pindah'],
    [d.email, 'Email'],
    [d.telpMurid, 'Telepon murid'],
    [d.telpOrtu, 'Telepon orang tua'],
  ];
  for (const [val, lbl] of requiredFields) {
    if (!val) { toast('error', `${lbl} wajib diisi!`); return false; }
  }
  if (!/\S+@\S+\.\S+/.test(d.email)) { toast('error', 'Format email tidak valid!'); return false; }
  if (!/^\d{8}$/.test(d.npsn)) { toast('error', 'NPSN harus 8 digit angka!'); return false; }
  return true;
}

function validateStep2() {
  const d = collectData();
  if (!d.linkSurat) { toast('error', 'Link surat pernyataan wajib diisi!'); return false; }
  for (const doc of DOCS) {
    if (!d.docs[doc.id] || d.docs[doc.id] === '-') {
      toast('error', `Link dokumen "${doc.title}" wajib diisi!`);
      return false;
    }
  }
  return true;
}

// ============================================================
// REVIEW RENDER
// ============================================================
function renderReview() {
  const d = collectData();
  const jkLabel = d.jk === 'L' ? 'Laki-laki' : d.jk === 'P' ? 'Perempuan' : '-';
  const docRows = DOCS.map(doc => `
    <div class="review-item">
      <div class="review-item-label">${doc.title}</div>
      <div class="review-item-value">
        <a href="${d.docs[doc.id]}" target="_blank" class="review-doc-link"><i class="fab fa-google-drive"></i> Lihat Dokumen</a>
      </div>
    </div>`).join('');

  document.getElementById('reviewContent').innerHTML = `
    <div class="review-section">
      <h3><i class="fas fa-user"></i> Data Diri</h3>
      <div class="review-grid">
        <div class="review-item"><div class="review-item-label">Nama Lengkap</div><div class="review-item-value">${d.nama}</div></div>
        <div class="review-item"><div class="review-item-label">Tanggal Lahir</div><div class="review-item-value">${d.tglLahir}</div></div>
        <div class="review-item"><div class="review-item-label">Jenis Kelamin</div><div class="review-item-value">${jkLabel}</div></div>
        <div class="review-item"><div class="review-item-label">Agama</div><div class="review-item-value">${d.agama}</div></div>
        <div class="review-item"><div class="review-item-label">Kelas Saat Ini</div><div class="review-item-value">${d.kelasSaatIni}</div></div>
        <div class="review-item"><div class="review-item-label">Mutasi ke Kelas</div><div class="review-item-value">${d.mutasiKe}</div></div>
        <div class="review-item"><div class="review-item-label">Kurikulum / Jurusan</div><div class="review-item-value">${d.kurikulum}</div></div>
        <div class="review-item"><div class="review-item-label">Sekolah Asal</div><div class="review-item-value">${d.sekolahAsal}</div></div>
        <div class="review-item"><div class="review-item-label">NPSN Sekolah Asal</div><div class="review-item-value">${d.npsn}</div></div>
        <div class="review-item full"><div class="review-item-label">Alasan Pindah</div><div class="review-item-value">${d.alasan}</div></div>
        <div class="review-item"><div class="review-item-label">Email</div><div class="review-item-value">${d.email}</div></div>
        <div class="review-item"><div class="review-item-label">Telepon Murid</div><div class="review-item-value">${d.telpMurid}</div></div>
        <div class="review-item full"><div class="review-item-label">Telepon Orang Tua/Wali</div><div class="review-item-value">${d.telpOrtu}</div></div>
      </div>
    </div>
    <div class="divider"></div>
    <div class="review-section">
      <h3><i class="fas fa-folder-open"></i> Dokumen</h3>
      <div class="review-grid">
        ${docRows}
        <div class="review-item full">
          <div class="review-item-label">Surat Pernyataan (Ditandatangani)</div>
          <div class="review-item-value">
            <a href="${d.linkSurat}" target="_blank" class="review-doc-link"><i class="fab fa-google-drive"></i> Lihat Surat</a>
          </div>
        </div>
      </div>
    </div>`;
}

// ============================================================
// STEP NAVIGATION
// ============================================================
document.getElementById('nextToStep2Btn').addEventListener('click', () => {
  if (validateStep1()) setStep(2);
});
document.getElementById('backToStep1Btn').addEventListener('click', () => setStep(1));
document.getElementById('nextToStep3Btn').addEventListener('click', () => {
  if (validateStep2()) { renderReview(); setStep(3); }
});
document.getElementById('backToStep2Btn').addEventListener('click', () => setStep(2));
document.getElementById('nextToStep4Btn').addEventListener('click', () => setStep(4));
document.getElementById('backToStep3Btn').addEventListener('click', () => setStep(3));

// Agree rules → enable submit
document.getElementById('agreeRules').addEventListener('change', function() {
  document.getElementById('submitBtn').disabled = !this.checked;
});

// ============================================================
// GENERATE NOMOR PENDAFTARAN
// ============================================================
function genNoDaftar() {
  const rnd = Math.floor(10000000 + Math.random() * 90000000);
  return '198168' + rnd;
}

// ============================================================
// SUBMIT
// ============================================================
document.getElementById('submitBtn').addEventListener('click', async () => {
  if (!document.getElementById('agreeRules').checked) {
    toast('error', 'Centang persetujuan peraturan terlebih dahulu!');
    return;
  }
  const d = collectData();
  const btn = document.getElementById('submitBtn');
  btn.disabled = true;
  btn.innerHTML = '<i class="fas fa-spinner spinner"></i> Memproses...';

  try {
    // Cek duplikasi email
    const emailSnap = await db.collection('pendaftaranMutasi').where('email', '==', d.email).get();
    if (!emailSnap.empty) {
      toast('error', 'Email ini sudah digunakan untuk mendaftar!');
      btn.disabled = false; btn.innerHTML = '<i class="fas fa-paper-plane"></i> Proses Pendaftaran';
      return;
    }
    // Cek duplikasi no telepon
    const telpSnap = await db.collection('pendaftaranMutasi').where('telpMurid', '==', d.telpMurid).get();
    if (!telpSnap.empty) {
      toast('error', 'Nomor telepon murid ini sudah digunakan untuk mendaftar!');
      btn.disabled = false; btn.innerHTML = '<i class="fas fa-paper-plane"></i> Proses Pendaftaran';
      return;
    }

    const noDaftar = genNoDaftar();
    await db.collection('pendaftaranMutasi').add({
      noDaftar, ...d,
      status: 'pending',
      catatanOperator: '',
      dibatalkan: false,
      createdAt: firebase.firestore.FieldValue.serverTimestamp()
    });

    document.getElementById('displayNomor').textContent = noDaftar;
    document.getElementById('modalSukses').classList.add('open');

    // Reset form
    document.querySelectorAll('.form-input').forEach(el => el.value = '');
    DOCS.forEach(doc => { const el = document.getElementById(`doc_${doc.id}`); if(el) el.value=''; });
    document.getElementById('agreeRules').checked = false;
    document.getElementById('submitBtn').disabled = true;
    setStep(1);

  } catch (err) {
    console.error(err);
    toast('error', 'Terjadi kesalahan. Silakan coba lagi.');
  } finally {
    btn.disabled = false;
    btn.innerHTML = '<i class="fas fa-paper-plane"></i> Proses Pendaftaran';
  }
});

// Close modal sukses
document.getElementById('closeModalSukses').addEventListener('click', () => {
  document.getElementById('modalSukses').classList.remove('open');
});
document.getElementById('modalSukses').addEventListener('click', e => {
  if (e.target === document.getElementById('modalSukses'))
    document.getElementById('modalSukses').classList.remove('open');
});

// ============================================================
// CEK STATUS
// ============================================================
document.getElementById('cekStatusBtn').addEventListener('click', async () => {
  const no = document.getElementById('cekNoDaftar').value.trim();
  const resultDiv = document.getElementById('statusResult');
  if (!no) { toast('error', 'Masukkan nomor pendaftaran!'); return; }
  if (!no.startsWith('198168') || no.length !== 14) {
    toast('error', 'Format nomor tidak valid! Harus dimulai 198168 dan 14 digit.');
    return;
  }
  resultDiv.innerHTML = '<div style="text-align:center;padding:20px;color:var(--text-muted)"><i class="fas fa-spinner spinner"></i> Mencari...</div>';

  try {
    const snap = await db.collection('pendaftaranMutasi').where('noDaftar', '==', no).get();
    if (snap.empty) {
      resultDiv.innerHTML = `<div class="status-card s-ditolak"><div class="status-icon"><i class="fas fa-circle-xmark"></i></div><h3>Nomor Tidak Ditemukan</h3><p>Pastikan nomor pendaftaran sudah benar.</p></div>`;
      return;
    }
    const data = snap.docs[0].data();
    if (data.dibatalkan) {
      resultDiv.innerHTML = `<div class="status-card s-ditolak"><div class="status-icon"><i class="fas fa-ban"></i></div><h3>Pendaftaran Dibatalkan</h3><p>Pendaftaran ini telah dibatalkan. Silakan daftar ulang jika ingin mendaftar kembali.</p></div>`;
      return;
    }
    const statusMap = {
      pending: { cls:'s-pending', icon:'fa-clock', title:'Menunggu Verifikasi', msg:'Berkas masih dalam antrian. Tunggu 1×24 jam.' },
      proses: { cls:'s-proses', icon:'fa-spinner', title:'Sedang Diproses', msg:'Berkas sedang diverifikasi oleh operator.' },
      diterima: { cls:'s-diterima', icon:'fa-circle-check', title:'Selamat! Berkas Diterima', msg:'Berkas lolos verifikasi. Tunggu jadwal tes penempatan.' },
      ditolak: { cls:'s-ditolak', icon:'fa-circle-xmark', title:'Berkas Tidak Lolos', msg:'Berkas tidak lolos verifikasi.' },
    };
    const s = statusMap[data.status] || statusMap.pending;
    const catatanHtml = data.status === 'ditolak' && data.catatanOperator
      ? `<div class="status-meta"><strong>Catatan Operator</strong>${data.catatanOperator}</div>` : '';
    resultDiv.innerHTML = `
      <div class="status-card ${s.cls}">
        <div class="status-icon"><i class="fas ${s.icon}"></i></div>
        <h3>${s.title}</h3>
        <p>${s.msg}</p>
        <div class="status-meta">
          <strong>Info Pendaftar</strong>
          Nama: ${data.nama}<br>
          No. Pendaftaran: ${data.noDaftar}<br>
          Mutasi ke Kelas: ${data.mutasiKe || '-'} | Kurikulum: ${data.kurikulum || '-'}
        </div>
        ${catatanHtml}
        ${data.status === 'ditolak' ? `<button class="btn btn-secondary" style="margin-top:14px;" onclick="document.querySelector('[data-tab=daftar]').click()"><i class="fas fa-rotate-right"></i> Daftar Ulang</button>` : ''}
      </div>`;
  } catch (err) {
    console.error(err);
    toast('error', 'Gagal mengambil data. Coba lagi.');
  }
});

// ============================================================
// BATALKAN PENDAFTARAN
// ============================================================
let batalDocId = null;
let batalData = null;

document.getElementById('cariDataBatalBtn').addEventListener('click', async () => {
  const no = document.getElementById('batalNoDaftar').value.trim();
  const preview = document.getElementById('batalDataPreview');
  const formArea = document.getElementById('batalFormArea');
  if (!no) { toast('error', 'Masukkan nomor pendaftaran!'); return; }
  if (!no.startsWith('198168') || no.length !== 14) {
    toast('error', 'Format nomor tidak valid!'); return;
  }
  preview.innerHTML = '<div style="text-align:center;padding:20px;color:var(--text-muted)"><i class="fas fa-spinner spinner"></i> Mencari...</div>';
  formArea.style.display = 'none';

  try {
    const snap = await db.collection('pendaftaranMutasi').where('noDaftar', '==', no).get();
    if (snap.empty) {
      preview.innerHTML = `<div class="alert alert-danger" style="margin-top:16px;"><i class="fas fa-circle-xmark"></i> Nomor pendaftaran tidak ditemukan.</div>`;
      return;
    }
    const doc = snap.docs[0];
    batalDocId = doc.id;
    batalData = doc.data();

    if (batalData.dibatalkan) {
      preview.innerHTML = `<div class="alert alert-warn" style="margin-top:16px;"><i class="fas fa-ban"></i> Pendaftaran ini sudah dibatalkan sebelumnya.</div>`;
      return;
    }
    if (batalData.status === 'diterima') {
      preview.innerHTML = `<div class="alert alert-danger" style="margin-top:16px;"><i class="fas fa-triangle-exclamation"></i> Pendaftaran yang sudah <strong>Diterima</strong> tidak dapat dibatalkan melalui sistem. Hubungi pihak sekolah langsung.</div>`;
      return;
    }

    const jkLabel = batalData.jk === 'L' ? 'Laki-laki' : batalData.jk === 'P' ? 'Perempuan' : '-';
    preview.innerHTML = `
      <div class="divider"></div>
      <div class="alert alert-info" style="margin-top:0;"><i class="fas fa-circle-info"></i> Data pendaftaran ditemukan. Periksa sebelum membatalkan.</div>
      <div class="review-grid" style="margin-bottom:0;">
        <div class="review-item"><div class="review-item-label">Nama</div><div class="review-item-value">${batalData.nama}</div></div>
        <div class="review-item"><div class="review-item-label">No. Pendaftaran</div><div class="review-item-value" style="font-family:var(--font-mono);font-size:0.82rem;">${batalData.noDaftar}</div></div>
        <div class="review-item"><div class="review-item-label">Jenis Kelamin</div><div class="review-item-value">${jkLabel}</div></div>
        <div class="review-item"><div class="review-item-label">Agama</div><div class="review-item-value">${batalData.agama}</div></div>
        <div class="review-item"><div class="review-item-label">Sekolah Asal</div><div class="review-item-value">${batalData.sekolahAsal}</div></div>
        <div class="review-item"><div class="review-item-label">Mutasi ke Kelas</div><div class="review-item-value">${batalData.mutasiKe || '-'}</div></div>
        <div class="review-item"><div class="review-item-label">Kurikulum</div><div class="review-item-value">${batalData.kurikulum || '-'}</div></div>
        <div class="review-item"><div class="review-item-label">Status</div><div class="review-item-value"><span class="badge badge-blue">${batalData.status}</span></div></div>
      </div>`;

    formArea.style.display = 'block';
    document.getElementById('agreeBatal').checked = false;
    document.getElementById('batalSubmitBtn').disabled = true;
    clearSig();
    window.scrollTo({ top: formArea.offsetTop - 80, behavior: 'smooth' });

  } catch (err) {
    console.error(err);
    toast('error', 'Gagal mengambil data.');
  }
});

// ============================================================
// DIGITAL SIGNATURE (CANVAS)
// ============================================================
const sigCanvas = document.getElementById('sigCanvas');
const sigCtx = sigCanvas.getContext('2d');
let drawing = false;
let hasSig = false;

function resizeSigCanvas() {
  const wrap = document.getElementById('sigWrap');
  sigCanvas.width = wrap.clientWidth;
  sigCanvas.height = 160;
}
resizeSigCanvas();
window.addEventListener('resize', () => { resizeSigCanvas(); if(!hasSig) clearSig(false); });

function getPos(e) {
  const r = sigCanvas.getBoundingClientRect();
  const src = e.touches ? e.touches[0] : e;
  return { x: src.clientX - r.left, y: src.clientY - r.top };
}

sigCanvas.addEventListener('mousedown', e => { drawing = true; const p = getPos(e); sigCtx.beginPath(); sigCtx.moveTo(p.x, p.y); });
sigCanvas.addEventListener('mousemove', e => {
  if (!drawing) return;
  const p = getPos(e);
  sigCtx.lineWidth = 2; sigCtx.lineCap = 'round'; sigCtx.strokeStyle = getComputedStyle(document.documentElement).getPropertyValue('--text-primary').trim() || '#0f172a';
  sigCtx.lineTo(p.x, p.y); sigCtx.stroke();
  hasSig = true;
  document.getElementById('sigPlaceholder').style.display = 'none';
  document.getElementById('sigWrap').classList.add('sig-signed');
  document.getElementById('sigStatus').textContent = 'Tanda tangan tersedia';
  checkBatalReady();
});
sigCanvas.addEventListener('mouseup', () => drawing = false);
sigCanvas.addEventListener('mouseleave', () => drawing = false);

sigCanvas.addEventListener('touchstart', e => { e.preventDefault(); drawing = true; const p = getPos(e); sigCtx.beginPath(); sigCtx.moveTo(p.x, p.y); }, { passive: false });
sigCanvas.addEventListener('touchmove', e => {
  e.preventDefault();
  if (!drawing) return;
  const p = getPos(e);
  sigCtx.lineWidth = 2; sigCtx.lineCap = 'round'; sigCtx.strokeStyle = getComputedStyle(document.documentElement).getPropertyValue('--text-primary').trim() || '#0f172a';
  sigCtx.lineTo(p.x, p.y); sigCtx.stroke();
  hasSig = true;
  document.getElementById('sigPlaceholder').style.display = 'none';
  document.getElementById('sigWrap').classList.add('sig-signed');
  document.getElementById('sigStatus').textContent = 'Tanda tangan tersedia';
  checkBatalReady();
}, { passive: false });
sigCanvas.addEventListener('touchend', () => drawing = false);

function clearSig(updateStatus = true) {
  sigCtx.clearRect(0, 0, sigCanvas.width, sigCanvas.height);
  hasSig = false;
  document.getElementById('sigPlaceholder').style.display = 'block';
  document.getElementById('sigWrap').classList.remove('sig-signed');
  if (updateStatus) {
    document.getElementById('sigStatus').textContent = 'Belum ada tanda tangan';
    checkBatalReady();
  }
}
document.getElementById('clearSigBtn').addEventListener('click', () => clearSig());

document.getElementById('agreeBatal').addEventListener('change', checkBatalReady);

function checkBatalReady() {
  const agree = document.getElementById('agreeBatal').checked;
  document.getElementById('batalSubmitBtn').disabled = !(agree && hasSig);
}

// ============================================================
// BATAL SUBMIT
// ============================================================
document.getElementById('batalSubmitBtn').addEventListener('click', () => {
  if (!batalDocId) { toast('error', 'Data pendaftaran tidak ditemukan.'); return; }
  if (!document.getElementById('agreeBatal').checked) { toast('error', 'Centang persetujuan terlebih dahulu!'); return; }
  if (!hasSig) { toast('error', 'Tanda tangan digital wajib diisi!'); return; }
  document.getElementById('modalKonfBatal').classList.add('open');
});

document.getElementById('closeModalKonfBatal').addEventListener('click', () => {
  document.getElementById('modalKonfBatal').classList.remove('open');
});
document.getElementById('modalKonfBatal').addEventListener('click', e => {
  if (e.target === document.getElementById('modalKonfBatal'))
    document.getElementById('modalKonfBatal').classList.remove('open');
});

document.getElementById('konfBatalYesBtn').addEventListener('click', async () => {
  const btn = document.getElementById('konfBatalYesBtn');
  btn.disabled = true; btn.innerHTML = '<i class="fas fa-spinner spinner"></i> Memproses...';

  try {
    await db.collection('pendaftaranMutasi').doc(batalDocId).update({
      dibatalkan: true,
      status: 'dibatalkan',
      tglBatal: firebase.firestore.FieldValue.serverTimestamp()
    });
    document.getElementById('modalKonfBatal').classList.remove('open');
    toast('success', 'Pendaftaran berhasil dibatalkan!');
    document.getElementById('batalDataPreview').innerHTML = `<div class="alert alert-success" style="margin-top:16px;"><i class="fas fa-circle-check"></i> Pendaftaran atas nama <strong>${batalData?.nama || ''}</strong> berhasil dibatalkan.</div>`;
    document.getElementById('batalFormArea').style.display = 'none';
    document.getElementById('batalNoDaftar').value = '';
    batalDocId = null; batalData = null;
  } catch (err) {
    console.error(err);
    toast('error', 'Gagal membatalkan. Coba lagi.');
  } finally {
    btn.disabled = false; btn.innerHTML = '<i class="fas fa-xmark"></i> Ya, Batalkan';
  }
});

// ============================================================
// DOWNLOAD SURAT
// ============================================================
document.getElementById('downloadSuratBtn').addEventListener('click', e => {
  toast('info', 'Cetak, isi, tanda tangani, scan/foto, upload ke Google Drive, lalu tempel linknya di form!');
});

console.log('✅ Pendaftaran Murid Mutasi SMAN 68 Jakarta — Loaded');

// Init gate saat DOM siap
document.addEventListener('DOMContentLoaded', initPendaftaranGate);
