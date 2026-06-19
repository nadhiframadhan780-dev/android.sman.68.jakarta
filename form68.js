/**
 * ═══════════════════════════════════════════════════════════════
 * FORM68.JS – SMAN 68 Jakarta Kuisioner Digital
 * Firebase Firestore + Realtime Database
 * Multi-survey · Sections · Role selection · Auto-save
 * ═══════════════════════════════════════════════════════════════
 */
'use strict';

/* ─── Firebase Config ────────────────────────────────────────── */
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
const db   = firebase.firestore();
const rtdb = firebase.database();

/* ─── App State ──────────────────────────────────────────────── */
const state = {
  allSurveys:     [],
  surveyId:       null,
  survey:         null,
  questions:      [],
  sections:       [],
  currentSection: 0,
  answers:        {},
  userId:         null,
  userName:       '',
  userEmail:      '',
  userRole:       '',
  userKelas:      '',
  submitted:      false,
  draftRef:       null,
  autosaveTimer:  null,
  skeletonRemoved: false,
};

/* ═══════════════════════════════════════════════════════════════
   UTILITIES
═══════════════════════════════════════════════════════════════ */
function genUserId()   { return 'u_' + Math.random().toString(36).slice(2) + Date.now().toString(36); }
function getOrCreateUserId() {
  // Selalu generate ID baru per pengisian agar tiap responden mendapat path unik di Firebase.
  // TIDAK pakai sessionStorage — jika dipakai bersama (lab komputer, dll), ID yang sama
  // akan menimpa jawaban responden sebelumnya.
  return genUserId();
}
function getParam(name) { return new URLSearchParams(window.location.search).get(name); }

// Hapus underscore dari nilai jawaban (misal: "pilihan_1" → "Pilihan 1" dari label asli)
function cleanAnswerDisplay(ans, question) {
  if (!ans && ans !== 0) return '';
  if (Array.isArray(ans)) {
    return ans.map(a => resolveLabel(String(a), question)).join(', ');
  }
  return resolveLabel(String(ans), question);
}

function resolveLabel(val, question) {
  // Cari label dari options jika ada
  if (question?.options?.length) {
    const opt = question.options.find(o => o.value === val || o.label === val);
    if (opt?.label) return opt.label;
  }
  // Hapus underscore dan kapitalkan
  return val.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}

// Navigasi kembali ke halaman utama
function goHome() {
  window.location.href = window.location.pathname;
}
function debounce(fn, ms) { let t; return (...a) => { clearTimeout(t); t = setTimeout(() => fn(...a), ms); }; }
function escHtml(s)  { if (!s && s !== 0) return ''; return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;'); }
function escAttr(s)  { if (!s) return ''; return String(s).replace(/"/g,'&quot;').replace(/'/g,'&#39;'); }
function fmtDate(ts) {
  if (!ts) return '–';
  let d;
  if (ts.toDate) d = ts.toDate();
  else if (ts.seconds) d = new Date(ts.seconds * 1000);
  else d = new Date(ts);
  return d.toLocaleDateString('id-ID', { day:'2-digit', month:'long', year:'numeric' });
}

/* ═══════════════════════════════════════════════════════════════
   TOAST
═══════════════════════════════════════════════════════════════ */
const Toast = (() => {
  let container = null;
  function getContainer() {
    if (!container) container = document.getElementById('toastContainer');
    return container;
  }
  const icons = { success:'check-circle', error:'x-circle', info:'info', warning:'alert-triangle' };
  function show(title, msg='', type='info', ms=4200) {
    const c = getContainer();
    if (!c) return;
    const el = document.createElement('div');
    el.className = `toast ${type}`;
    el.innerHTML = `<div class="toast-icon"><i data-lucide="${icons[type]}"></i></div>
      <div class="toast-body"><div class="toast-title">${escHtml(title)}</div>${msg?`<div class="toast-msg">${escHtml(msg)}</div>`:''}</div>`;
    c.appendChild(el);
    if (typeof lucide !== 'undefined') lucide.createIcons({ nodes:[el] });
    setTimeout(() => { el.classList.add('removing'); el.addEventListener('animationend',()=>el.remove()); }, ms);
  }
  return { show };
})();

/* ═══════════════════════════════════════════════════════════════
   THEME
═══════════════════════════════════════════════════════════════ */
(function() {
  const root = document.documentElement;
  const btn  = document.getElementById('themeToggle');
  if (!btn) return;
  root.setAttribute('data-theme', localStorage.getItem('form68_theme') || 'light');
  btn.addEventListener('click', () => {
    const next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    root.setAttribute('data-theme', next);
    localStorage.setItem('form68_theme', next);
  });
})();

/* ═══════════════════════════════════════════════════════════════
   SKELETON  ← FIX UTAMA: cek null, track status
═══════════════════════════════════════════════════════════════ */
function showSkeleton() {
  const sk = document.getElementById('skeletonOverlay');
  if (!sk) return;
  sk.classList.remove('hidden');
  state.skeletonRemoved = false;
}

function hideSkeleton() {
  if (state.skeletonRemoved) return;  // sudah dihapus, skip
  const sk = document.getElementById('skeletonOverlay');
  if (!sk) {
    state.skeletonRemoved = true;
    return;
  }
  sk.classList.add('hidden');
  state.skeletonRemoved = true;
  setTimeout(() => {
    if (sk && sk.parentNode) sk.remove();
  }, 450);
}

/* ═══════════════════════════════════════════════════════════════
   MODALS CLOSE
═══════════════════════════════════════════════════════════════ */
function initModals() {
  const imageModal     = document.getElementById('imageModal');
  const qrModal        = document.getElementById('qrModal');
  const userInfoModal  = document.getElementById('userInfoModal');

  const btnCloseImg    = document.getElementById('btnCloseImg');
  const btnCloseQR     = document.getElementById('btnCloseQR');
  const btnCloseUser   = document.getElementById('btnCloseUserModal');

  if (btnCloseImg)   btnCloseImg.addEventListener('click', () => { imageModal.style.display='none'; });
  if (imageModal)    imageModal.addEventListener('click', e => { if(e.target===imageModal) imageModal.style.display='none'; });
  if (btnCloseQR)    btnCloseQR.addEventListener('click', () => { qrModal.style.display='none'; });
  if (qrModal)       qrModal.addEventListener('click', e => { if(e.target===qrModal) qrModal.style.display='none'; });
  // Tombol X di modal data diri
  if (btnCloseUser)  btnCloseUser.addEventListener('click', () => {
    if (userInfoModal) userInfoModal.style.display = 'none';
  });
  // Klik overlay untuk tutup modal data diri (jika belum mulai)
  if (userInfoModal) userInfoModal.addEventListener('click', e => {
    if (e.target === userInfoModal) userInfoModal.style.display = 'none';
  });
}

function openImage(src) {
  const modal = document.getElementById('imageModal');
  const img   = document.getElementById('viewerImg');
  if (!modal || !img) return;
  img.src = src;
  modal.style.display = 'flex';
}

/* ═══════════════════════════════════════════════════════════════
   QR CODE
═══════════════════════════════════════════════════════════════ */
function initQR() {
  const btnShowQR     = document.getElementById('btnShowQR');
  const btnDownloadQR = document.getElementById('btnDownloadQR');
  const qrModal       = document.getElementById('qrModal');
  const qrCanvas      = document.getElementById('qrCanvas');

  if (btnShowQR && qrCanvas && qrModal) {
    btnShowQR.addEventListener('click', () => {
      if (typeof QRCode === 'undefined') { Toast.show('Error','Library QR tidak tersedia','error'); return; }
      QRCode.toCanvas(qrCanvas, window.location.href,
        { width:240, margin:2, color:{dark:'#0f2148',light:'#ffffff'} },
        err => { if(!err) qrModal.style.display='flex'; else Toast.show('QR Error','Gagal buat QR','error'); });
    });
  }

  if (btnDownloadQR && qrCanvas) {
    btnDownloadQR.addEventListener('click', () => {
      const a=document.createElement('a');
      a.download=`qr-${state.surveyId||'form68'}.png`;
      a.href=qrCanvas.toDataURL();
      a.click();
    });
  }
}

/* ═══════════════════════════════════════════════════════════════
   SHARE
═══════════════════════════════════════════════════════════════ */
function initShare() {
  const url  = encodeURIComponent(window.location.href);
  const text = encodeURIComponent(`Isi Kuisioner SMAN 68 Jakarta: ${state.survey?.title||''}`);
  const btnWA   = document.getElementById('btnShareWA');
  const btnTG   = document.getElementById('btnShareTG');
  const btnCopy = document.getElementById('btnCopyLink');

  if (btnWA)   btnWA.onclick   = () => window.open(`https://wa.me/?text=${text}%20${url}`,'_blank');
  if (btnTG)   btnTG.onclick   = () => window.open(`https://t.me/share/url?url=${url}&text=${text}`,'_blank');
  if (btnCopy) btnCopy.onclick = () => navigator.clipboard.writeText(window.location.href)
    .then(() => Toast.show('Disalin','Link survey berhasil disalin','success'));
}

/* ═══════════════════════════════════════════════════════════════
   LOAD SURVEYS
═══════════════════════════════════════════════════════════════ */
/* ── Realtime listener handle ── */
let _surveysUnsubscribe = null;

function loadSurvey() {
  const paramId = getParam('id');

  if (paramId) {
    // Single survey via URL param: tetap one-time load
    loadSingleSurvey(paramId);
    return;
  }

  // REALTIME: listen ke Firestore agar survey langsung muncul tanpa refresh
  if (_surveysUnsubscribe) _surveysUnsubscribe(); // stop listener lama

  _surveysUnsubscribe = db.collection('surveys')
    .where('isPublished', '==', true)
    .orderBy('createdAt', 'desc')
    .onSnapshot(snap => {
      state.allSurveys = snap.docs.map(d => ({ id: d.id, ...d.data() }));

      // Jangan update UI kalau user sedang mengisi form
      if (state.submitted || document.getElementById('formMain')?.style.display === 'block') return;

      const noSurveyView = document.getElementById('noSurveyView');

      if (state.allSurveys.length === 0) {
        // Hapus grid jika sebelumnya ada survey
        if (noSurveyView) return; // sudah tampil
        showNoSurvey();
      } else if (state.allSurveys.length === 1) {
        // Satu survey: jika noSurveyView tampil, remove dulu lalu load
        if (noSurveyView) noSurveyView.remove();
        loadSingleSurvey(state.allSurveys[0].id);
      } else {
        // Multi survey: update grid secara realtime
        if (noSurveyView) noSurveyView.remove();
        const heroHeader = document.getElementById('heroHeader');
        if (heroHeader) heroHeader.style.display = 'flex';
        renderSurveyGrid(state.allSurveys);
        hideSkeleton();
      }
    }, err => {
      console.error('[loadSurvey realtime]', err);
      Toast.show('Error', 'Gagal memuat kuisioner. Periksa koneksi.', 'error');
      hideSkeleton();
    });
}

/** Render survey selection grid */
function renderSurveyGrid(surveys) {
  const singleView = document.getElementById('singleSurveyView');
  const listView   = document.getElementById('surveysListView');
  if (singleView) singleView.style.display = 'none';
  if (listView)   listView.style.display   = 'block';

  const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
  function isNew(survey) {
    if (!survey.createdAt) return false;
    const ms = survey.createdAt.seconds ? survey.createdAt.seconds*1000 : Number(survey.createdAt);
    return ms > sevenDaysAgo;
  }

  const grid = document.getElementById('surveysGrid');
  if (!grid) return;

  grid.innerHTML = surveys.map(s => {
    const newBadge = isNew(s) ? `<span class="new-badge">NEW</span>` : '';
    const thumb = s.bannerImage
      ? `<img src="${escAttr(s.bannerImage)}" class="sc-thumb" alt="" loading="lazy" onerror="this.parentElement.innerHTML='<div class=sc-thumb-placeholder><i data-lucide=clipboard-list></i></div>';if(typeof lucide!=='undefined')lucide.createIcons()"/>`
      : `<div class="sc-thumb-placeholder"><i data-lucide="clipboard-list"></i></div>`;
    const deadline  = s.deadline   ? `<span class="sc-meta"><i data-lucide="calendar"></i> ${fmtDate(s.deadline)}</span>` : '';
    const respCount = `<span class="sc-meta"><i data-lucide="users"></i> ${s.responseCount||0} respons</span>`;

    return `
    <div class="survey-card-item" data-sid="${escAttr(s.id)}" tabindex="0" role="button" aria-label="Buka survey ${escHtml(s.title)}">
      ${newBadge}
      ${thumb}
      <div class="sc-body">
        <div class="sc-title">${escHtml(s.title)}</div>
        <div class="sc-desc">${escHtml(s.description||'')}</div>
        <div class="sc-footer">
          <div style="display:flex;gap:.5rem;flex-wrap:wrap">${deadline}${respCount}</div>
          <div class="sc-arrow"><i data-lucide="arrow-right"></i></div>
        </div>
      </div>
    </div>`;
  }).join('');

  if (typeof lucide !== 'undefined') lucide.createIcons({ nodes:[grid] });

  grid.querySelectorAll('.survey-card-item').forEach(card => {
    const handler = () => {
      const sid = card.dataset.sid;
      window.history.pushState({}, '', `?id=${sid}`);
      // Tampilkan loading state & reset skeleton
      state.skeletonRemoved = false;
      const sk = document.createElement('div');
      sk.className = 'skeleton-overlay';
      sk.id = 'skeletonOverlay';
      sk.innerHTML = `<div class="skeleton-card">
        <div class="skeleton sk-logo"></div>
        <div class="skeleton sk-title"></div>
        <div class="skeleton sk-desc"></div>
        <div class="skeleton sk-desc" style="width:60%"></div>
        <div class="skeleton sk-btn"></div>
      </div>`;
      document.body.appendChild(sk);

      const listView   = document.getElementById('surveysListView');
      const singleView = document.getElementById('singleSurveyView');
      if (listView)   listView.style.display   = 'none';
      if (singleView) singleView.style.display = 'block';

      loadSingleSurvey(sid);
    };
    card.addEventListener('click', handler);
    card.addEventListener('keydown', e => { if(e.key==='Enter'||e.key===' ') { e.preventDefault(); handler(); } });
  });
}

/** Load one specific survey by ID */
async function loadSingleSurvey(surveyId) {
  try {
    const surveyDoc = await db.collection('surveys').doc(surveyId).get();
    if (!surveyDoc.exists || !surveyDoc.data().isPublished) {
      hideSkeleton();
      showNoSurvey();
      return;
    }
    state.surveyId = surveyId;
    state.survey   = { id:surveyDoc.id, ...surveyDoc.data() };

    // Cek deadline
    if (state.survey.deadline) {
      const dl = state.survey.deadline.toDate
        ? state.survey.deadline.toDate()
        : new Date(state.survey.deadline.seconds * 1000);
      if (dl < new Date()) {
        hideSkeleton();
        showDeadlinePassed();
        return;
      }
    }

    // Load questions
    const qSnap = await db.collection('surveys').doc(surveyId).collection('questions')
      .orderBy('order').get();
    state.questions = qSnap.docs.map(d => ({ id:d.id, ...d.data() }));

    renderHero();
    buildSections();
    hideSkeleton(); // aman dipanggil berapa kali pun
  } catch(err) {
    console.error('[loadSingleSurvey]', err);
    Toast.show('Error','Gagal memuat survey. Periksa koneksi internet.','error');
    hideSkeleton();
  }
}

/** Render hero for single survey */
function renderHero() {
  const s = state.survey;
  document.title = `${s.title||'Kuisioner'} – SMAN 68 Jakarta`;

  const elTitle  = document.getElementById('surveyTitle');
  const elDesc   = document.getElementById('surveyDesc');
  const elBadge  = document.getElementById('badgeLabel');
  if (elTitle) elTitle.textContent = s.title || 'Kuisioner';
  if (elBadge) elBadge.textContent = s.schoolYear ? `T.A. ${s.schoolYear}` : 'Kuisioner Digital';

  // Deskripsi terstruktur
  const descWrap   = document.getElementById('surveyDescWrap');
  const descSimple = document.getElementById('surveyDescSimple');
  if (s.description) {
    if (descWrap)   { descWrap.style.display = 'block'; }
    if (elDesc)     elDesc.textContent = s.description;
    if (descSimple) descSimple.style.display = 'none';
  } else {
    if (descWrap)   descWrap.style.display = 'none';
    if (descSimple) { descSimple.textContent = ''; descSimple.style.display = 'none'; }
  }

  // Tampilkan jumlah pertanyaan di pill
  const nonSectionQs = state.questions.filter(q => q.type !== 'section');
  const chipQCount   = document.getElementById('chipQCount');
  const qCountText   = document.getElementById('qCountText');
  if (chipQCount && qCountText && nonSectionQs.length > 0) {
    qCountText.textContent = `${nonSectionQs.length} Pertanyaan`;
    chipQCount.style.display = 'inline-flex';
  }

  // Banner
  if (s.bannerImage) {
    const img    = document.getElementById('bannerImg');
    const banner = document.getElementById('surveyBanner');
    if (img && banner) {
      img.src = s.bannerImage;
      img.onerror = () => { banner.style.display='none'; };
      banner.style.display = 'block';
    }
  }

  // Chips
  const chips = document.getElementById('heroChips');
  if (chips) chips.style.display = 'flex';

  if (s.deadline) {
    const elDl = document.getElementById('deadlineText');
    const chip = document.getElementById('chipDeadline');
    if (elDl) elDl.textContent = `Batas: ${fmtDate(s.deadline)}`;
    if (chip) chip.style.display = 'inline-flex';
  }
  if (s.schoolYear) {
    const elSY = document.getElementById('schoolYearText');
    const chip = document.getElementById('chipSchoolYear');
    if (elSY) elSY.textContent = `T.A. ${s.schoolYear}`;
    if (chip) chip.style.display = 'inline-flex';
  }

  const shareBar = document.getElementById('shareBar');
  const btnStart = document.getElementById('btnStart');
  if (shareBar) shareBar.style.display = 'flex';
  if (btnStart) btnStart.style.display = 'inline-flex';

  if (state.allSurveys.length > 1) {
    const btnBack = document.getElementById('btnBackToList');
    if (btnBack) {
      btnBack.style.display = 'flex';
      btnBack.title = 'Kembali ke daftar survey';
    }
  } else {
    // Single survey: tampilkan back button yang mengarah ke hero halaman ini
    const btnBack = document.getElementById('btnBackToList');
    if (btnBack) {
      btnBack.style.display = 'flex';
      btnBack.title = 'Kembali ke halaman awal survey';
    }
  }

  initShare();
  if (typeof lucide !== 'undefined') lucide.createIcons();

  if (btnStart) {
    // Hapus listener lama sebelum tambah baru
    const newBtn = btnStart.cloneNode(true);
    btnStart.parentNode.replaceChild(newBtn, btnStart);
    newBtn.style.display = 'inline-flex';
    newBtn.addEventListener('click', () => {
      openUserInfoModal();
    }, { once: true });
  }
}

/* ═══════════════════════════════════════════════════════════════
   USER INFO MODAL
═══════════════════════════════════════════════════════════════ */
function openUserInfoModal() {
  const modal = document.getElementById('userInfoModal');
  if (!modal) return;
  modal.style.display = 'flex';
  if (typeof lucide !== 'undefined') lucide.createIcons({ nodes:[modal] });

  document.getElementById('roleGrid')?.querySelectorAll('.role-option').forEach(opt => {
    opt.addEventListener('click', () => {
      document.querySelectorAll('.role-option').forEach(o => o.classList.remove('selected'));
      opt.classList.add('selected');
      const radio = opt.querySelector('input[type="radio"]');
      if (radio) radio.checked = true;
      const val = opt.dataset.value || '';
      const kelasGroup = document.getElementById('kelasGroup');
      if (kelasGroup) kelasGroup.style.display = val.startsWith('Siswa') ? 'block' : 'none';
    });
  });

  const btnConfirm = document.getElementById('btnConfirmUser');
  if (btnConfirm) {
    const newBtn = btnConfirm.cloneNode(true);
    btnConfirm.parentNode.replaceChild(newBtn, btnConfirm);
    newBtn.addEventListener('click', confirmUser, { once:true });
  }
}

function confirmUser() {
  const nameEl  = document.getElementById('inputName');
  const emailEl = document.getElementById('inputEmail');
  const roleEl  = document.querySelector('input[name="userRole"]:checked');

  const name  = nameEl?.value.trim() || '';
  const email = emailEl?.value.trim() || '';

  if (!name)  { Toast.show('Perhatian','Masukkan nama lengkap','warning'); return; }
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    Toast.show('Perhatian','Masukkan email yang valid','warning'); return;
  }
  if (!roleEl) { Toast.show('Perhatian','Pilih status / peran kamu','warning'); return; }

  state.userName  = name;
  state.userEmail = email;
  state.userRole  = roleEl.value;
  state.userKelas = document.getElementById('inputKelas')?.value.trim() || '';
  state.userId    = getOrCreateUserId();

  // Jika survey hanya sekali jawab, cek dulu apakah nama+email sudah pernah submit
  if (state.survey?.oneTimeOnly) {
    const btnConfirm = document.getElementById('btnConfirmUser');
    if (btnConfirm) { btnConfirm.disabled = true; btnConfirm.textContent = 'Memeriksa…'; }
    checkAlreadySubmittedByEmail(name, email).then(alreadyDone => {
      if (btnConfirm) { btnConfirm.disabled = false; btnConfirm.textContent = 'Mulai Mengisi'; }
      if (alreadyDone) {
        const modal = document.getElementById('userInfoModal');
        if (modal) modal.style.display = 'none';
        showAlreadySubmittedPage(name);
        return;
      }
      proceedAfterConfirm();
    });
    return;
  }
  proceedAfterConfirm();
}

function proceedAfterConfirm() {
  const modal    = document.getElementById('userInfoModal');
  const hero     = document.getElementById('heroHeader');
  if (modal)   modal.style.display   = 'none';
  if (hero)    hero.style.display    = 'none';

  // Generate fresh userId per pengisian
  state.userId = genUserId();

  loadDraft().then(() => startForm());
}

/* ═══════════════════════════════════════════════════════════════
   REALTIME DATABASE – DRAFT
═══════════════════════════════════════════════════════════════ */
function draftPath() { return `responses/${state.surveyId}/${state.userId}`; }

async function loadDraft() {
  try {
    // userId selalu baru (genUserId) → path selalu unik → tidak akan menimpa responden lain.
    // loadDraft tetap dipertahankan agar fitur auto-save masih berfungsi
    // jika pengguna me-refresh halaman di tengah pengisian (userId sama selama state hidup).
    state.draftRef = rtdb.ref(draftPath());
    const snap = await state.draftRef.once('value');
    const data  = snap.val();
    // Hanya load draft jika masih 'draft' (belum submitted)
    if (data?.answers && data?.status === 'draft') {
      state.answers = data.answers;
      Toast.show('Draft ditemukan','Jawaban sebelumnya dimuat otomatis','info', 3000);
    }
    // Jika status 'submitted' atau path baru → biarkan answers kosong, mulai dari awal
  } catch(e) { console.warn('[loadDraft]', e); }
}

const saveDraft = debounce(async () => {
  if (state.submitted || !state.draftRef) return;
  try {
    await state.draftRef.set({
      userName:    state.userName,
      email:       state.userEmail,
      role:        state.userRole,
      kelas:       state.userKelas,
      answers:     state.answers,
      status:      'draft',
      completion:  calcCompletion(),
      lastUpdated: Date.now(),
      deviceInfo:  navigator.userAgent.slice(0,120),
    });
    showAutosave();
  } catch(e) { console.warn('[saveDraft]', e); }
}, 1600);

function showAutosave() {
  const el = document.getElementById('autosaveIndicator');
  if (!el) return;
  el.classList.add('visible');
  clearTimeout(state.autosaveTimer);
  state.autosaveTimer = setTimeout(() => el.classList.remove('visible'), 2800);
}

function calcCompletion() {
  const req = state.questions.filter(q => q.required);
  if (!req.length) return 100;
  const ans = req.filter(q => {
    const v = state.answers[q.id];
    if (v === undefined || v === null || v === '') return false;
    if (Array.isArray(v)) return v.length > 0;
    return true;
  });
  return Math.round((ans.length / req.length) * 100);
}

/* ═══════════════════════════════════════════════════════════════
   SECTION BUILDER
═══════════════════════════════════════════════════════════════ */
function buildSections() {
  state.sections = [];
  let cur = {
    title: state.survey.title || 'Bagian 1',
    desc:  state.survey.description || '',
    questions: []
  };
  state.questions.forEach(q => {
    if (q.type === 'section') {
      if (cur.questions.length) state.sections.push(cur);
      cur = { title: q.title||'Bagian', desc: q.description||'', questions: [] };
    } else {
      cur.questions.push(q);
    }
  });
  if (cur.questions.length || !state.sections.length) state.sections.push(cur);
}

/* ═══════════════════════════════════════════════════════════════
   FORM RENDERER
═══════════════════════════════════════════════════════════════ */
function startForm() {
  document.body.classList.add('form-active');
  const formMain = document.getElementById('formMain');
  if (formMain) formMain.style.display = 'block';
  renderAllSections();
  renderNavDots();
  showSection(0);
  updateProgress();
  if (typeof lucide !== 'undefined') lucide.createIcons();
}

function renderAllSections() {
  const wrapper = document.getElementById('sectionsWrapper');
  if (!wrapper) return;
  wrapper.innerHTML = '';
  state.sections.forEach((section, sIdx) => {
    const sDiv = document.createElement('div');
    sDiv.className = 'form-section';
    sDiv.id = `section-${sIdx}`;
    sDiv.innerHTML = `<div class="section-header glass-card">
      <h2>${escHtml(section.title)}</h2>
      ${section.desc ? `<p>${escHtml(section.desc)}</p>` : ''}
    </div>`;
    section.questions.forEach((q, qIdx) => {
      sDiv.appendChild(buildQuestionCard(q, qIdx + 1));
    });
    wrapper.appendChild(sDiv);
  });
}

/* ── Question Card ── */
function buildQuestionCard(q, index) {
  const card = document.createElement('div');
  card.className = 'question-card glass-card';
  card.id = `qcard-${q.id}`;
  card.setAttribute('data-qid', q.id);
  card.setAttribute('data-type', q.type);

  if (q.conditionalLogic?.enabled) {
    card.setAttribute('data-cond-qid',   q.conditionalLogic.questionId);
    card.setAttribute('data-cond-value', q.conditionalLogic.value);
    card.style.display = 'none';
  }

  let html = `<div class="question-index">Pertanyaan ${index}</div>
    <div class="question-title">${escHtml(q.title)}${q.required?'<span class="req-star">*</span>':''}</div>
    ${q.description ? `<div class="question-desc">${escHtml(q.description)}</div>` : ''}`;

  if (q.imageUrl) {
    html += `<div class="question-img-wrap">
      <img src="${escAttr(q.imageUrl)}" alt="Gambar pertanyaan" loading="lazy"
        onclick="openImage(this.src)" onerror="this.parentElement.style.display='none'"/>
    </div>`;
  }

  html += `<div class="question-input" id="qinput-${q.id}">${buildInputHtml(q)}</div>`;
  html += `<div class="field-error" id="qerror-${q.id}">Pertanyaan ini wajib diisi.</div>`;

  card.innerHTML = html;
  setTimeout(() => attachInputListeners(card, q), 0);
  return card;
}

/* ── Input HTML builder ── */
function buildInputHtml(q) {
  const v = state.answers[q.id];

  switch (q.type) {
    case 'short': {
      const t = q.validation==='email'?'email':q.validation==='phone'?'tel':q.validation==='number'?'number':q.validation==='url'?'url':'text';
      return `<input type="${t}" class="field-input" id="q-${q.id}"
        placeholder="${escAttr(q.placeholder||'Ketikkan jawaban…')}" value="${escAttr(v||'')}"
        ${q.validation?.maxLength?`maxlength="${q.validation.maxLength}"`:''}
        autocomplete="off"/>
        <div class="char-count" id="cc-${q.id}"></div>`;
    }

    case 'paragraph':
      return `<textarea class="field-textarea" id="q-${q.id}"
        placeholder="${escAttr(q.placeholder||'Tuliskan jawaban lengkap kamu…')}"
        ${q.validation?.maxLength?`maxlength="${q.validation.maxLength}"`:''}
        >${escHtml(v||'')}</textarea>
        <div class="char-count" id="cc-${q.id}"></div>`;

    case 'multiple_choice': {
      const opts = q.options||[];
      return `<div class="options-list" id="q-${q.id}">${opts.map(o => {
        const img = o.imageUrl ? `<img src="${escAttr(o.imageUrl)}" class="option-img" loading="lazy" onclick="openImage(this.src)" onerror="this.style.display='none'"/>` : '';
        return `<label class="option-item${v===o.value?' selected':''}">
          <input type="radio" name="q-${q.id}" value="${escAttr(o.value)}" ${v===o.value?'checked':''}/>
          ${img}<span class="option-label">${escHtml(o.label)}</span>
        </label>`;
      }).join('')}</div>`;
    }

    case 'checkbox': {
      const opts = q.options||[];
      const vals = Array.isArray(v) ? v : [];
      return `<div class="options-list" id="q-${q.id}">${opts.map(o => {
        const chk = vals.includes(o.value);
        const img = o.imageUrl ? `<img src="${escAttr(o.imageUrl)}" class="option-img" loading="lazy" onclick="openImage(this.src)" onerror="this.style.display='none'"/>` : '';
        return `<label class="option-item${chk?' selected':''}">
          <input type="checkbox" name="q-${q.id}" value="${escAttr(o.value)}" ${chk?'checked':''}/>
          ${img}<span class="option-label">${escHtml(o.label)}</span>
        </label>`;
      }).join('')}</div>`;
    }

    case 'dropdown': {
      const opts = q.options||[];
      return `<div class="select-wrapper">
        <select class="field-select" id="q-${q.id}">
          <option value="">– Pilih jawaban –</option>
          ${opts.map(o=>`<option value="${escAttr(o.value)}" ${v===o.value?'selected':''}>${escHtml(o.label)}</option>`).join('')}
        </select></div>`;
    }

    case 'date':   return `<input type="date" class="field-input" id="q-${q.id}" value="${escAttr(v||'')}"/>`;
    case 'time':   return `<input type="time" class="field-input" id="q-${q.id}" value="${escAttr(v||'')}"/>`;
    case 'email':  return `<input type="email" class="field-input" id="q-${q.id}" placeholder="${escAttr(q.placeholder||'contoh@email.com')}" value="${escAttr(v||'')}" autocomplete="email"/>`;
    case 'phone':  return `<input type="tel" class="field-input" id="q-${q.id}" placeholder="${escAttr(q.placeholder||'08xx-xxxx-xxxx')}" value="${escAttr(v||'')}" autocomplete="tel"/>`;
    case 'number': return `<input type="number" class="field-input" id="q-${q.id}" placeholder="${escAttr(q.placeholder||'0')}" value="${escAttr(v||'')}" ${q.validation?.min!==undefined?`min="${q.validation.min}"`:''}  ${q.validation?.max!==undefined?`max="${q.validation.max}"`:''}/>`;
    case 'url':    return `<input type="url" class="field-input" id="q-${q.id}" placeholder="${escAttr(q.placeholder||'https://…')}" value="${escAttr(v||'')}"/>`;

    case 'linear_scale': {
      const min=Number(q.scaleMin??1), max=Number(q.scaleMax??5);
      let btns='';
      for(let i=min;i<=max;i++) btns+=`<button type="button" class="scale-btn${v==i?' active':''}" data-val="${i}" data-qid="${q.id}">${i}</button>`;
      return `<div class="scale-wrap">
        <div class="scale-labels"><span>${escHtml(q.scaleMinLabel||'')}</span><span>${escHtml(q.scaleMaxLabel||'')}</span></div>
        <div class="scale-options" id="q-${q.id}">${btns}</div>
      </div>`;
    }

    case 'rating': {
      const max=Number(q.ratingMax??5);
      let stars='';
      for(let i=1;i<=max;i++) stars+=`<button type="button" class="star-btn${v>=i?' active':''}" data-val="${i}" data-qid="${q.id}">★</button>`;
      return `<div class="stars-wrap" id="q-${q.id}">${stars}</div>`;
    }

    case 'matrix':
    case 'matrix_checkbox': {
      const rows=q.rows||[], cols=q.cols||[];
      const isChk = q.type==='matrix_checkbox';
      const savedGrid = v||{};
      return `<div style="overflow-x:auto"><table class="matrix-table" id="q-${q.id}">
        <thead><tr><th></th>${cols.map(c=>`<th>${escHtml(c)}</th>`).join('')}</tr></thead>
        <tbody>${rows.map(row=>`<tr><td>${escHtml(row)}</td>${cols.map(col=>{
          const chk = isChk
            ? (Array.isArray(savedGrid[row])&&savedGrid[row].includes(col)?'checked':'')
            : (savedGrid[row]===col?'checked':'');
          return `<td><input type="${isChk?'checkbox':'radio'}" name="mq-${q.id}-${row}" value="${escAttr(col)}" ${chk} data-row="${escAttr(row)}" data-qid="${q.id}" data-mtype="${isChk?'checkbox':'radio'}"/></td>`;
        }).join('')}</tr>`).join('')}</tbody>
      </table></div>`;
    }

    case 'signature':
      return `<div class="sig-canvas-wrap"><canvas id="q-${q.id}" height="150"></canvas></div>
        <div class="sig-actions">
          <button type="button" class="sig-btn" id="sigclear-${q.id}"><i data-lucide="trash-2"></i> Hapus</button>
        </div>`;

    case 'image_url':
      return `<div class="url-img-wrap">
        <input type="url" class="field-input" id="q-${q.id}" placeholder="Tempel URL gambar PNG/JPG/WebP…" value="${escAttr(v||'')}"/>
        <div class="url-preview" id="urlprev-${q.id}">
          ${v?`<img src="${escAttr(v)}" alt="Preview" loading="lazy" onclick="openImage('${escAttr(v)}')" onerror="this.parentElement.innerHTML='<span class=url-preview-empty>Gambar tidak ditemukan</span>'"/>`:`<span class="url-preview-empty">Preview gambar muncul di sini</span>`}
        </div></div>`;

    case 'captcha':
      return `<div class="captcha-wrap">
        <input type="checkbox" class="captcha-check" id="q-${q.id}" ${v?'checked':''}/>
        <label class="captcha-label" for="q-${q.id}">Saya bukan robot</label>
        <div class="captcha-logo">SMAN 68<br>Secure</div>
      </div>`;

    default:
      return `<input type="text" class="field-input" id="q-${q.id}" placeholder="${escAttr(q.placeholder||'Ketikkan jawaban…')}" value="${escAttr(v||'')}"/>`;
  }
}

/* ── Input Listeners ── */
function attachInputListeners(card, q) {
  const qid = q.id;
  const save = val => { state.answers[qid]=val; clearError(qid); saveDraft(); checkConditionals(); };

  switch (q.type) {
    case 'short': case 'email': case 'phone': case 'number': case 'url':
    case 'date': case 'time': {
      const inp = document.getElementById(`q-${qid}`);
      if(!inp) break;
      inp.addEventListener('input', () => {
        save(inp.value);
        const cc=document.getElementById(`cc-${qid}`);
        if(cc && q.validation?.maxLength) cc.textContent=`${inp.value.length} / ${q.validation.maxLength}`;
      });
      break;
    }
    case 'paragraph': {
      const ta = document.getElementById(`q-${qid}`);
      if(!ta) break;
      ta.addEventListener('input', () => {
        save(ta.value);
        const cc=document.getElementById(`cc-${qid}`);
        if(cc && q.validation?.maxLength) cc.textContent=`${ta.value.length} / ${q.validation.maxLength}`;
      });
      break;
    }
    case 'multiple_choice': {
      const c=document.getElementById(`q-${qid}`);
      if(!c) break;
      c.querySelectorAll('input[type="radio"]').forEach(inp => {
        inp.addEventListener('change', () => {
          c.querySelectorAll('.option-item').forEach(el=>el.classList.remove('selected'));
          inp.closest('.option-item')?.classList.add('selected');
          save(inp.value);
        });
      });
      break;
    }
    case 'checkbox': {
      const c=document.getElementById(`q-${qid}`);
      if(!c) break;
      c.querySelectorAll('input[type="checkbox"]').forEach(inp => {
        inp.addEventListener('change', () => {
          inp.closest('.option-item')?.classList.toggle('selected', inp.checked);
          save([...c.querySelectorAll('input:checked')].map(x=>x.value));
        });
      });
      break;
    }
    case 'dropdown': {
      const sel=document.getElementById(`q-${qid}`);
      if(sel) sel.addEventListener('change', ()=>save(sel.value));
      break;
    }
    case 'linear_scale': {
      const c=document.getElementById(`q-${qid}`);
      if(!c) break;
      c.querySelectorAll('.scale-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          c.querySelectorAll('.scale-btn').forEach(b=>b.classList.remove('active'));
          btn.classList.add('active');
          save(Number(btn.dataset.val));
        });
      });
      break;
    }
    case 'rating': {
      const c=document.getElementById(`q-${qid}`);
      if(!c) break;
      const stars=[...c.querySelectorAll('.star-btn')];
      stars.forEach((star,i)=>{
        star.addEventListener('mouseover',()=>stars.forEach((s,j)=>s.classList.toggle('active',j<=i)));
        star.addEventListener('click',()=>save(Number(star.dataset.val)));
      });
      c.addEventListener('mouseleave',()=>{
        const sv=Number(state.answers[qid]??0);
        stars.forEach((s,i)=>s.classList.toggle('active',i<sv));
      });
      break;
    }
    case 'matrix': case 'matrix_checkbox': {
      const tbl=document.getElementById(`q-${qid}`);
      if(!tbl) break;
      tbl.querySelectorAll('input').forEach(inp=>{
        inp.addEventListener('change',()=>{
          const grid=state.answers[qid]||{};
          const row=inp.dataset.row;
          if(inp.dataset.mtype==='checkbox'){
            const rv=grid[row]||[];
            if(inp.checked){ if(!rv.includes(inp.value)) rv.push(inp.value); }
            else { const i=rv.indexOf(inp.value); if(i>-1) rv.splice(i,1); }
            grid[row]=rv;
          } else { grid[row]=inp.value; }
          save({...grid});
        });
      });
      break;
    }
    case 'signature': {
      const canvas=document.getElementById(`q-${qid}`);
      if(canvas) initSignatureCanvas(canvas, qid, save);
      document.getElementById(`sigclear-${qid}`)?.addEventListener('click',()=>{
        canvas?.getContext('2d').clearRect(0,0,canvas.width,canvas.height);
        save('');
      });
      break;
    }
    case 'image_url': {
      const inp=document.getElementById(`q-${qid}`);
      const prev=document.getElementById(`urlprev-${qid}`);
      if(!inp||!prev) break;
      inp.addEventListener('input', debounce(()=>{
        const url=inp.value.trim();
        save(url);
        prev.innerHTML = url
          ? `<img src="${escAttr(url)}" loading="lazy" onclick="openImage('${escAttr(url)}')" onerror="this.parentElement.innerHTML='<span class=url-preview-empty>Gambar tidak dapat dimuat</span>'"/>`
          : `<span class="url-preview-empty">Preview gambar muncul di sini</span>`;
      }, 600));
      break;
    }
    case 'captcha': {
      const chk=document.getElementById(`q-${qid}`);
      if(chk) chk.addEventListener('change',()=>save(chk.checked));
      break;
    }
    default: {
      const inp=document.getElementById(`q-${qid}`);
      if(inp) inp.addEventListener('input',()=>save(inp.value));
    }
  }
}

/* ── Signature Canvas ── */
function initSignatureCanvas(canvas, qid, save) {
  const ctx=canvas.getContext('2d');
  let drawing=false, lx=0, ly=0;
  function pos(e){ const r=canvas.getBoundingClientRect(), s=e.touches?e.touches[0]:e; return {x:(s.clientX-r.left)*(canvas.width/r.width),y:(s.clientY-r.top)*(canvas.height/r.height)}; }
  canvas.addEventListener('mousedown',  e=>{drawing=true;const p=pos(e);lx=p.x;ly=p.y;});
  canvas.addEventListener('touchstart', e=>{e.preventDefault();drawing=true;const p=pos(e);lx=p.x;ly=p.y;},{passive:false});
  function draw(e){ if(!drawing)return; e.preventDefault(); const p=pos(e); ctx.beginPath(); ctx.moveTo(lx,ly); ctx.lineTo(p.x,p.y); ctx.strokeStyle=getComputedStyle(document.documentElement).getPropertyValue('--text-primary').trim()||'#0f2148'; ctx.lineWidth=2; ctx.lineCap='round'; ctx.stroke(); lx=p.x;ly=p.y; }
  canvas.addEventListener('mousemove', draw);
  canvas.addEventListener('touchmove', draw,{passive:false});
  const stop=()=>{ if(drawing){drawing=false; save(canvas.toDataURL());} };
  canvas.addEventListener('mouseup', stop); canvas.addEventListener('touchend', stop); canvas.addEventListener('mouseleave', stop);
}

/* ─── Conditional Logic ── */
function checkConditionals() {
  document.querySelectorAll('[data-cond-qid]').forEach(card=>{
    const tqid=card.dataset.condQid, cv=card.dataset.condValue;
    const cur=state.answers[tqid];
    card.style.display = (Array.isArray(cur)?cur.includes(cv):String(cur)===String(cv)) ? '' : 'none';
  });
}

/* ═══════════════════════════════════════════════════════════════
   SECTION NAVIGATION
═══════════════════════════════════════════════════════════════ */
function showSection(idx) {
  document.querySelectorAll('.form-section').forEach(el=>el.classList.remove('active'));
  const el=document.getElementById(`section-${idx}`);
  if(el){ el.classList.add('active'); window.scrollTo({top:0,behavior:'smooth'}); }
  state.currentSection=idx;
  const total=state.sections.length;
  const btnPrev   = document.getElementById('btnPrev');
  const btnNext   = document.getElementById('btnNext');
  const btnSubmit = document.getElementById('btnSubmit');
  const progLabel = document.getElementById('progressLabel');
  if(btnPrev)   btnPrev.disabled           = idx===0;
  if(btnNext)   btnNext.style.display      = idx<total-1?'inline-flex':'none';
  if(btnSubmit) btnSubmit.style.display    = idx===total-1?'inline-flex':'none';
  if(progLabel) progLabel.textContent      = `Bagian ${idx+1} dari ${total}`;
  updateProgress();
  updateNavDots();
}

function renderNavDots() {
  const dots=document.getElementById('navDots');
  if(!dots) return;
  dots.innerHTML='';
  state.sections.forEach((_,i)=>{
    const d=document.createElement('span');
    d.className=`nav-dot${i===0?' active':''}`;
    d.addEventListener('click',()=>{if(i<=state.currentSection||validateSection(state.currentSection)) showSection(i);});
    dots.appendChild(d);
  });
}
function updateNavDots() { document.querySelectorAll('.nav-dot').forEach((d,i)=>d.classList.toggle('active',i===state.currentSection)); }
function updateProgress() {
  const pct=state.sections.length===1?100:Math.round((state.currentSection/(state.sections.length-1))*100);
  const fill = document.getElementById('progressFill');
  const pctEl = document.getElementById('progressPct');
  if(fill)  fill.style.width  = pct+'%';
  if(pctEl) pctEl.textContent = pct+'%';
}

/* ── Nav Buttons ── */
document.getElementById('btnPrev')?.addEventListener('click',()=>{ if(state.currentSection>0) showSection(state.currentSection-1); });
document.getElementById('btnNext')?.addEventListener('click',()=>{ if(validateSection(state.currentSection)) showSection(state.currentSection+1); });

// Back to survey list
document.getElementById('btnBackToList')?.addEventListener('click',()=>{
  document.body.classList.remove('form-active');
  const formMain   = document.getElementById('formMain');
  const heroHeader = document.getElementById('heroHeader');
  const singleView = document.getElementById('singleSurveyView');
  const listView   = document.getElementById('surveysListView');
  if(formMain)   formMain.style.display   = 'none';
  if(heroHeader) heroHeader.style.display = 'flex';

  if(state.allSurveys.length > 1) {
    // Kembali ke daftar survey
    if(singleView) singleView.style.display = 'none';
    if(listView)   listView.style.display   = 'block';
    window.history.pushState({},'','form68.html');
  } else {
    // Kembali ke hero single survey
    if(singleView) singleView.style.display = 'block';
    if(listView)   listView.style.display   = 'none';
    // Reset URL jika ada id param
    const paramId = getParam('id');
    if(paramId) {
      window.history.pushState({},'',`?id=${paramId}`);
    } else {
      window.history.pushState({},'','form68.html');
    }
  }
  window.scrollTo({top:0,behavior:'smooth'});
});

/* ═══════════════════════════════════════════════════════════════
   VALIDATION
═══════════════════════════════════════════════════════════════ */
function validateSection(sIdx) {
  const sec=state.sections[sIdx]; if(!sec) return true;
  let ok=true;
  sec.questions.forEach(q=>{
    const card=document.getElementById(`qcard-${q.id}`);
    if(card&&card.style.display==='none') return;
    if(!q.required) return;
    const val=state.answers[q.id];
    let valid=true;
    if(val===undefined||val===null||val==='') valid=false;
    else if(Array.isArray(val)&&val.length===0) valid=false;
    else if(q.type==='captcha'&&val!==true) valid=false;
    else if(q.validation==='email'&&!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) valid=false;
    else if(q.validation==='phone'&&!/^[0-9+\-\s]{8,}$/.test(val)) valid=false;
    else if(q.validation==='url'){try{new URL(val)}catch{valid=false;}}
    if(!valid){ showError(q.id); ok=false; }
    else clearError(q.id);
  });
  if(!ok) Toast.show('Validasi gagal','Isi semua pertanyaan yang wajib diisi.','warning');
  return ok;
}
function showError(qid){
  document.getElementById(`qerror-${qid}`)?.classList.add('visible');
  document.getElementById(`q-${qid}`)?.classList.add('input-error');
  document.getElementById(`qcard-${qid}`)?.scrollIntoView({behavior:'smooth',block:'center'});
}
function clearError(qid){
  document.getElementById(`qerror-${qid}`)?.classList.remove('visible');
  document.getElementById(`q-${qid}`)?.classList.remove('input-error');
}

/* ═══════════════════════════════════════════════════════════════
   SUBMIT
═══════════════════════════════════════════════════════════════ */
document.getElementById('btnSubmit')?.addEventListener('click', handleSubmit);

async function handleSubmit() {
  if(document.getElementById('honeypot')?.value) return;
  if(!validateSection(state.currentSection)) return;
  if(!state.draftRef) { Toast.show('Error','Sesi tidak valid. Muat ulang halaman.','error'); return; }

  const submitAnim = document.getElementById('submitAnim');
  if(submitAnim) submitAnim.style.display='flex';

  try {
    const now=Date.now();
    await state.draftRef.set({
      userName:    state.userName,
      email:       state.userEmail,
      role:        state.userRole,
      kelas:       state.userKelas,
      answers:     state.answers,
      status:      'submitted',
      completion:  100,
      submittedAt: now,
      lastUpdated: now,
      deviceInfo:  navigator.userAgent.slice(0,120),
    });
    state.submitted=true;
    // Increment Firestore counter (best-effort)
    db.collection('surveys').doc(state.surveyId).update({
      responseCount: firebase.firestore.FieldValue.increment(1),
      updatedAt:     firebase.firestore.FieldValue.serverTimestamp(),
    }).catch(()=>{});
    if(submitAnim) submitAnim.style.display='none';
    showSuccess();
  } catch(err) {
    console.error('[handleSubmit]', err);
    if(submitAnim) submitAnim.style.display='none';
    Toast.show('Gagal mengirim','Periksa koneksi internet kamu.','error',6000);
  }
}

function showSuccess() {
  // oneTimeOnly: validasi sudah dilakukan via RTDB saat konfirmasi identitas
  // Tidak perlu markAsSubmitted lokal

  const formMain = document.getElementById('formMain');
  const sp       = document.getElementById('successPage');
  if(formMain) formMain.style.display='none';
  if(!sp) return;
  sp.style.display='flex';
  const titleEl = document.getElementById('successSurveyTitle');
  const timeEl  = document.getElementById('successTime');
  if(titleEl) titleEl.textContent=state.survey?.title||'';
  if(timeEl)  timeEl.textContent=new Date().toLocaleString('id-ID');
  if(typeof lucide!=='undefined') lucide.createIcons({nodes:[sp]});
  window.scrollTo({top:0,behavior:'smooth'});
}

/* ─── Empty/Error states ── */
function showNoSurvey() {
  // Tampilkan hero header dengan tampilan "survey belum tersedia" yang lengkap
  const hero = document.getElementById('heroHeader');
  if (hero) hero.style.display = 'flex';

  // Sembunyikan singleSurveyView dan surveysListView
  const singleView = document.getElementById('singleSurveyView');
  const listView   = document.getElementById('surveysListView');
  if (singleView) singleView.style.display = 'none';
  if (listView)   listView.style.display   = 'none';

  // Hapus konten no-survey sebelumnya jika ada
  const existing = document.getElementById('noSurveyView');
  if (existing) existing.remove();

  // Sisipkan tampilan "belum tersedia" di dalam hero-content
  const heroContent = document.getElementById('heroContent');
  if (!heroContent) return;

  const noSurveyEl = document.createElement('div');
  noSurveyEl.id = 'noSurveyView';
  noSurveyEl.style.cssText = 'display:flex;flex-direction:column;align-items:center;gap:1rem;animation:fadeSlideUp .9s var(--t-slow) both;';
  noSurveyEl.innerHTML = `
    <div class="hero-badge">
      <i data-lucide="clock"></i>
      <span>Belum Tersedia</span>
    </div>
    <h1 class="hero-title" style="font-size:clamp(1.5rem,4.5vw,2.6rem);">Selamat Datang di Form Survey<br>SMAN 68 Jakarta</h1>
    <p class="hero-desc" style="text-align:center;max-width:480px;line-height:1.75;">
      Saat ini survey belum tersedia atau belum diterbitkan.<br>
      Silakan tunggu informasi lebih lanjut dari pihak sekolah.
    </p>
    <div style="display:flex;align-items:center;gap:0.6rem;background:rgba(249,168,37,0.15);border:1px solid rgba(249,168,37,0.35);border-radius:14px;padding:0.85rem 1.4rem;backdrop-filter:blur(8px);max-width:420px;text-align:center;">
      <i data-lucide="info" style="width:18px;height:18px;color:var(--gold-300);flex-shrink:0;"></i>
      <span style="font-size:0.84rem;color:rgba(255,255,255,0.85);line-height:1.6;">
        Hubungi operator sekolah atau pantau terus halaman ini untuk update survey terbaru.
      </span>
    </div>
    <a href="./sman68.html" class="btn-start" style="margin-top:0.5rem;text-decoration:none;">
      <i data-lucide="arrow-left"></i><span>Kembali ke Beranda</span>
    </a>
  `;
  heroContent.appendChild(noSurveyEl);
  hideSkeleton();
  if (typeof lucide !== 'undefined') lucide.createIcons({ nodes: [noSurveyEl] });
}

function showDeadlinePassed() {
  const hero = document.getElementById('heroHeader');
  if(hero) hero.style.display='none';
  const existing = document.querySelector('.empty-state');
  if(existing) existing.remove();
  document.body.insertAdjacentHTML('beforeend',`
    <div class="empty-state glass-card">
      <i data-lucide="calendar-x"></i>
      <h3>Survey Sudah Ditutup</h3>
      <p>Batas waktu pengisian telah berakhir.</p>
    </div>`);
  if(typeof lucide!=='undefined') lucide.createIcons();
}

/* ─── Cek sudah jawab berdasarkan nama + email (oneTimeOnly) ── */
async function checkAlreadySubmittedByEmail(name, email) {
  try {
    // Cari di RTDB apakah ada respons submitted dengan nama+email yang sama di survey ini
    const snap = await rtdb.ref(`responses/${state.surveyId}`).once('value');
    const data = snap.val() || {};
    const nameLower  = name.trim().toLowerCase();
    const emailLower = email.trim().toLowerCase();
    return Object.values(data).some(r =>
      r.status === 'submitted' &&
      (r.email || '').trim().toLowerCase() === emailLower &&
      (r.userName || '').trim().toLowerCase() === nameLower
    );
  } catch(e) { console.warn('[checkAlreadySubmittedByEmail]', e); return false; }
}

function markAsSubmitted() {
  // Tidak perlu localStorage lagi; cukup data RTDB yang jadi acuan
}

function showAlreadySubmittedPage(userName) {
  const hero = document.getElementById('heroHeader');
  if (hero) hero.style.display = 'none';
  const existing = document.getElementById('alreadySubmittedPage');
  if (existing) { existing.style.display = 'flex'; return; }

  const div = document.createElement('div');
  div.id = 'alreadySubmittedPage';
  div.style.cssText = 'min-height:100vh;display:flex;align-items:center;justify-content:center;background:var(--bg-page);padding:2rem 1rem;';
  div.innerHTML = `
    <div style="max-width:460px;width:100%;padding:2.6rem 2.2rem;text-align:center;background:var(--bg-card);backdrop-filter:var(--glass-blur);-webkit-backdrop-filter:var(--glass-blur);border:1px solid var(--border-color);border-radius:var(--r-lg);box-shadow:var(--shadow-card);">
      <div style="width:76px;height:76px;margin:0 auto 1.4rem;position:relative;display:flex;align-items:center;justify-content:center;">
        <div style="position:absolute;inset:-4px;border-radius:50%;border:3px solid var(--gold-500);animation:ringPulse 1.6s ease-in-out infinite"></div>
        <i data-lucide="shield-check" style="width:46px;height:46px;color:var(--gold-500)"></i>
      </div>
      <h2 style="font-family:var(--font-display);font-size:1.8rem;font-weight:700;color:var(--text-primary);margin-bottom:.75rem;">Sudah Diisi</h2>
      <p style="color:var(--text-secondary);line-height:1.6;margin-bottom:.5rem;">Kamu sudah pernah mengisi <strong>${escHtml(state.survey?.title||'survey ini')}</strong>.</p>
      <p style="font-size:.86rem;color:var(--text-muted);margin-bottom:1.5rem;">Survey ini hanya dapat diisi <strong>satu kali</strong> per nama &amp; email. Terima kasih atas partisipasimu!</p>
      <div style="display:flex;gap:.75rem;justify-content:center;flex-wrap:wrap">
        <button class="btn-start" onclick="window.location.href='form68.html'" style="margin-top:0">
          <i data-lucide="grid"></i><span>Semua Survey</span>
        </button>
      </div>
    </div>`;
  document.body.appendChild(div);
  if (typeof lucide !== 'undefined') lucide.createIcons({ nodes: [div] });
}

/* ─── Init ── */
document.addEventListener('DOMContentLoaded', () => {
  if(typeof lucide!=='undefined') lucide.createIcons();
  initModals();
  initQR();

  // Set label & href tombol back/home sesuai konteks
  const homeBtn   = document.getElementById('btnHomeFloat');
  const homeLabel = document.getElementById('btnHomeLabel');
  const paramId   = getParam('id');
  if (homeBtn) {
    if (paramId) {
      // Buka survey langsung via ?id= → Back ke halaman utama form68
      homeBtn.href = './form68.html';
      if (homeLabel) homeLabel.textContent = 'Kembali';
    } else {
      // Halaman utama form68 → Home ke sman68
      homeBtn.href = './sman68.html';
      if (homeLabel) homeLabel.textContent = 'Home';
      // Ganti icon ke home
      const icon = homeBtn.querySelector('[data-lucide]');
      if (icon) { icon.setAttribute('data-lucide', 'home'); lucide.createIcons({nodes:[homeBtn]}); }
    }
  }

  loadSurvey();
});
