/* ════════════════════════════════════════════════════════════
   aduan-penmurmut.js
   Pusat Aduan & Peninjauan Mutasi — SMAN 68 Jakarta
   ════════════════════════════════════════════════════════════ */

"use strict";

/* ──────────────────────────────────────────
   1. FIREBASE INITIALIZATION
────────────────────────────────────────── */
const firebaseConfig = {
  apiKey:            "AIzaSyDAcKcg3alPOTH3FFGelYmsW7jcMMe2PLI",
  authDomain:        "upnvjdatsystem.firebaseapp.com",
  projectId:         "upnvjdatsystem",
  storageBucket:     "upnvjdatsystem.appspot.com",
  messagingSenderId: "000000000000",
  appId:             "1:000000000000:web:0000000000000000"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

/* ──────────────────────────────────────────
   2. DOM REFERENCES
────────────────────────────────────────── */

/* --- Tabs --- */
const tabBtns   = document.querySelectorAll(".tab-btn");
const tabPanels = document.querySelectorAll(".tab-panel");

/* --- Form Aduan (Tab 1) --- */
const formAduan      = document.getElementById("formAduan");
const btnSubmit      = document.getElementById("btnSubmit");
const btnReset       = document.getElementById("btnReset");
const fieldDetail    = document.getElementById("detail");
const charCount      = document.getElementById("charCount");

const inp = {
  noPendaftaran: document.getElementById("noPendaftaran"),
  namaLengkap:   document.getElementById("namaLengkap"),
  email:         document.getElementById("email"),
  whatsapp:      document.getElementById("whatsapp"),
  kategori:      document.getElementById("kategori"),
  detail:        document.getElementById("detail"),
  linkBukti:     document.getElementById("linkBukti"),
  persetujuan:   document.getElementById("persetujuan"),
};

const err = {
  noPendaftaran: document.getElementById("errNoPendaftaran"),
  namaLengkap:   document.getElementById("errNamaLengkap"),
  email:         document.getElementById("errEmail"),
  whatsapp:      document.getElementById("errWhatsapp"),
  kategori:      document.getElementById("errKategori"),
  detail:        document.getElementById("errDetail"),
  linkBukti:     document.getElementById("errLinkBukti"),
  persetujuan:   document.getElementById("errPersetujuan"),
};

/* --- Cek Status (Tab 2) --- */
const inputNoAduan  = document.getElementById("inputNoAduan");
const btnCekStatus  = document.getElementById("btnCekStatus");
const statusResult  = document.getElementById("statusResult");
const errNoAduan    = document.getElementById("errNoAduan");

/* --- Modal --- */
const modalOverlay   = document.getElementById("modalOverlay");
const modalNoAduan   = document.getElementById("modalNoAduan");
const btnCopyNoAduan = document.getElementById("btnCopyNoAduan");
const btnModalClose  = document.getElementById("btnModalClose");

/* --- Toast --- */
const toastContainer = document.getElementById("toastContainer");


/* ──────────────────────────────────────────
   3. TOAST NOTIFICATION SYSTEM
────────────────────────────────────────── */

/**
 * Show a toast notification.
 * @param {'success'|'error'|'info'|'warning'} type
 * @param {string} title
 * @param {string} [message]
 * @param {number} [duration=4000]
 */
function showToast(type = "info", title = "", message = "", duration = 4000) {
  const icons = {
    success: "fas fa-circle-check",
    error:   "fas fa-circle-xmark",
    info:    "fas fa-circle-info",
    warning: "fas fa-triangle-exclamation",
  };

  const toast = document.createElement("div");
  toast.className = `toast ${type}`;
  toast.innerHTML = `
    <i class="${icons[type] || icons.info} toast-icon"></i>
    <div class="toast-content">
      <div class="toast-title">${title}</div>
      ${message ? `<div class="toast-message">${message}</div>` : ""}
    </div>
    <button class="toast-close" aria-label="Tutup notifikasi">
      <i class="fas fa-xmark"></i>
    </button>
  `;

  const closeBtn = toast.querySelector(".toast-close");
  const dismiss  = () => {
    toast.classList.add("hide");
    setTimeout(() => toast.remove(), 320);
  };

  closeBtn.addEventListener("click", dismiss);
  toastContainer.appendChild(toast);

  setTimeout(dismiss, duration);
}


/* ──────────────────────────────────────────
   4. TAB SWITCHER
────────────────────────────────────────── */
tabBtns.forEach((btn) => {
  btn.addEventListener("click", () => {
    const targetId = btn.getAttribute("data-tab");

    /* Update button state */
    tabBtns.forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");

    /* Update panel visibility */
    tabPanels.forEach((panel) => {
      panel.classList.toggle("active", panel.id === targetId);
    });

    /* Reset status result when switching back to cek tab */
    if (targetId === "tab-cek") {
      statusResult.style.display = "none";
      statusResult.innerHTML     = "";
      errNoAduan.textContent     = "";
    }
  });
});


/* ──────────────────────────────────────────
   5. CHARACTER COUNTER (Textarea Detail)
────────────────────────────────────────── */
fieldDetail.addEventListener("input", () => {
  const len = fieldDetail.value.length;
  charCount.textContent = len;
  charCount.style.color = len > 900 ? "var(--color-error)" : "var(--gray-400)";
  if (len > 1000) {
    fieldDetail.value = fieldDetail.value.substring(0, 1000);
    charCount.textContent = 1000;
  }
});


/* ──────────────────────────────────────────
   6. FORM VALIDATION HELPERS
────────────────────────────────────────── */

/** Set error message on a field */
function setError(field, msg) {
  if (err[field]) err[field].textContent = msg;
  if (inp[field]) inp[field].classList.toggle("error", !!msg);
}

/** Clear all form errors */
function clearAllErrors() {
  Object.keys(err).forEach((key) => setError(key, ""));
}

/** Email regex validator */
const isValidEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());

/** WhatsApp number validator (minimal 9 digits, starts with 0 or +62) */
const isValidWA = (v) => /^(\+62|62|0)[0-9]{8,13}$/.test(v.trim().replace(/[\s-]/g, ""));

/** URL validator */
const isValidURL = (v) => {
  if (!v.trim()) return true; // optional
  try { new URL(v.trim()); return true; } catch { return false; }
};

/**
 * Run all field validations.
 * @returns {boolean} true if form is valid
 */
function validateForm() {
  clearAllErrors();
  let valid = true;

  /* Nomor Pendaftaran */
  const noPend = inp.noPendaftaran.value.trim();
  if (!noPend) {
    setError("noPendaftaran", "Nomor pendaftaran wajib diisi.");
    valid = false;
  } else if (!/^\d{14}$/.test(noPend)) {
    setError("noPendaftaran", "Nomor pendaftaran harus tepat 14 digit angka.");
    valid = false;
  }

  /* Nama */
  if (!inp.namaLengkap.value.trim()) {
    setError("namaLengkap", "Nama lengkap wajib diisi.");
    valid = false;
  }

  /* Email */
  const emailVal = inp.email.value.trim();
  if (!emailVal) {
    setError("email", "Email wajib diisi.");
    valid = false;
  } else if (!isValidEmail(emailVal)) {
    setError("email", "Format email tidak valid.");
    valid = false;
  }

  /* WhatsApp */
  const waVal = inp.whatsapp.value.trim();
  if (!waVal) {
    setError("whatsapp", "Nomor WhatsApp wajib diisi.");
    valid = false;
  } else if (!isValidWA(waVal)) {
    setError("whatsapp", "Format nomor WhatsApp tidak valid.");
    valid = false;
  }

  /* Kategori */
  if (!inp.kategori.value) {
    setError("kategori", "Pilih kategori aduan terlebih dahulu.");
    valid = false;
  }

  /* Detail */
  if (!inp.detail.value.trim()) {
    setError("detail", "Detail masalah wajib diisi.");
    valid = false;
  } else if (inp.detail.value.trim().length < 20) {
    setError("detail", "Jelaskan masalah minimal 20 karakter.");
    valid = false;
  }

  /* Link Bukti (optional, but validate if filled) */
  if (inp.linkBukti.value.trim() && !isValidURL(inp.linkBukti.value.trim())) {
    setError("linkBukti", "URL tidak valid. Pastikan diawali https://");
    valid = false;
  }

  /* Persetujuan */
  if (!inp.persetujuan.checked) {
    setError("persetujuan", "Anda harus menyetujui pernyataan di atas.");
    valid = false;
  }

  return valid;
}


/* ──────────────────────────────────────────
   7. NOMOR ADUAN GENERATOR
────────────────────────────────────────── */

/**
 * Generate a random Nomor Aduan with format: ADM-XXXXXXXX
 * @returns {string}
 */
function generateNoAduan() {
  const digits = Math.floor(10000000 + Math.random() * 90000000).toString();
  return `ADM-${digits}`;
}


/* ──────────────────────────────────────────
   8. SUBMIT FORM — SIMPAN KE FIRESTORE
────────────────────────────────────────── */

/** Toggle loading state on submit button */
function setSubmitLoading(loading) {
  const textEl    = btnSubmit.querySelector(".btn-text");
  const loadingEl = btnSubmit.querySelector(".btn-loading");
  btnSubmit.disabled = loading;
  textEl.style.display    = loading ? "none"         : "";
  loadingEl.style.display = loading ? "inline-flex"  : "none";
}

formAduan.addEventListener("submit", async (e) => {
  e.preventDefault();

  if (!validateForm()) {
    /* Scroll to first error */
    const firstErr = formAduan.querySelector(".form-control.error");
    if (firstErr) firstErr.scrollIntoView({ behavior: "smooth", block: "center" });
    showToast("error", "Validasi Gagal", "Periksa kembali field yang belum terisi dengan benar.");
    return;
  }

  setSubmitLoading(true);

  try {
    const noAduan = generateNoAduan();

    const payload = {
      noAduan,
      noPendaftaran: inp.noPendaftaran.value.trim(),
      nama:          inp.namaLengkap.value.trim(),
      email:         inp.email.value.trim(),
      whatsapp:      inp.whatsapp.value.trim(),
      kategori:      inp.kategori.value,
      detail:        inp.detail.value.trim(),
      linkBukti:     inp.linkBukti.value.trim() || null,
      status:        "pending",
      responOperator:"",
      createdAt:     firebase.firestore.FieldValue.serverTimestamp(),
    };

    await db.collection("aduanMutasi").add(payload);

    /* Show success modal */
    modalNoAduan.textContent = noAduan;
    modalOverlay.style.display = "flex";

    /* Reset form */
    resetFormAduan();

    showToast("success", "Aduan Terkirim", `Nomor aduan: ${noAduan}`, 6000);
  } catch (error) {
    console.error("[Aduan-Penmurmut] Submit error:", error);
    showToast(
      "error",
      "Gagal Mengirim Aduan",
      "Terjadi kesalahan saat menyimpan data. Periksa koneksi internet Anda dan coba lagi.",
      6000
    );
  } finally {
    setSubmitLoading(false);
  }
});


/* ──────────────────────────────────────────
   9. RESET FORM
────────────────────────────────────────── */

function resetFormAduan() {
  formAduan.reset();
  clearAllErrors();
  charCount.textContent = "0";
  Object.values(inp).forEach((el) => el && el.classList && el.classList.remove("error"));
}

btnReset.addEventListener("click", () => {
  if (confirm("Reset semua isian form? Data yang telah diisi akan hilang.")) {
    resetFormAduan();
    showToast("info", "Form Direset", "Semua isian telah dihapus.");
  }
});


/* ──────────────────────────────────────────
   10. MODAL — CLOSE & COPY
────────────────────────────────────────── */

btnModalClose.addEventListener("click", () => {
  modalOverlay.style.display = "none";
});

modalOverlay.addEventListener("click", (e) => {
  if (e.target === modalOverlay) modalOverlay.style.display = "none";
});

btnCopyNoAduan.addEventListener("click", async () => {
  const text = modalNoAduan.textContent;
  try {
    await navigator.clipboard.writeText(text);
    showToast("success", "Disalin!", `Nomor aduan ${text} berhasil disalin.`);
    btnCopyNoAduan.innerHTML = '<i class="fas fa-check"></i>';
    setTimeout(() => {
      btnCopyNoAduan.innerHTML = '<i class="fas fa-copy"></i>';
    }, 2000);
  } catch {
    showToast("warning", "Gagal Menyalin", "Salin manual: " + text);
  }
});


/* ──────────────────────────────────────────
   11. CEK STATUS ADUAN
────────────────────────────────────────── */

/** Toggle loading on cek button */
function setCekLoading(loading) {
  const textEl    = btnCekStatus.querySelector(".btn-text");
  const loadingEl = btnCekStatus.querySelector(".btn-loading");
  btnCekStatus.disabled = loading;
  textEl.style.display    = loading ? "none"  : "";
  loadingEl.style.display = loading ? "inline-flex" : "none";
}

/** Format Firestore Timestamp to readable date */
function formatTimestamp(ts) {
  if (!ts) return "—";
  const date = ts.toDate ? ts.toDate() : new Date(ts);
  return date.toLocaleDateString("id-ID", {
    day:    "2-digit",
    month:  "long",
    year:   "numeric",
    hour:   "2-digit",
    minute: "2-digit",
  });
}

/** Render status card HTML */
function renderStatusCard(doc) {
  const data    = doc.data();
  const status  = (data.status || "pending").toLowerCase();

  const config  = {
    pending: {
      cls:   "pending",
      icon:  "fas fa-clock",
      title: "Aduan Sedang Antre Ditinjau",
      badge: "Menunggu",
    },
    proses: {
      cls:   "proses",
      icon:  "fas fa-spinner fa-spin",
      title: "Aduan Sedang Diperiksa Tim Mutasi",
      badge: "Diproses",
    },
    selesai: {
      cls:   "selesai",
      icon:  "fas fa-circle-check",
      title: "Aduan Telah Ditanggapi",
      badge: "Selesai",
    },
  };

  const cfg = config[status] || config.pending;

  const responBox =
    status === "selesai" && data.responOperator
      ? `<div class="alasan-operator">
           <div class="alasan-operator-label">
             <i class="fas fa-comment-check"></i> Tanggapan Tim Mutasi
           </div>
           <p class="alasan-operator-text">${escapeHtml(data.responOperator)}</p>
         </div>`
      : "";

  return `
    <div class="status-card ${cfg.cls}">
      <div class="status-card-header">
        <div class="status-icon"><i class="${cfg.icon}"></i></div>
        <div>
          <div class="status-no-aduan">${escapeHtml(data.noAduan || "—")}</div>
          <div class="status-title">${cfg.title}</div>
          <span class="status-badge">
            <i class="fas fa-circle" style="font-size:.5rem;"></i>
            ${cfg.badge}
          </span>
        </div>
      </div>

      <div class="status-meta">
        <span class="status-meta-item">
          <i class="fas fa-user"></i>
          ${escapeHtml(data.nama || "—")}
        </span>
        <span class="status-meta-item">
          <i class="fas fa-tag"></i>
          ${escapeHtml(data.kategori || "—")}
        </span>
        <span class="status-meta-item">
          <i class="fas fa-calendar"></i>
          ${formatTimestamp(data.createdAt)}
        </span>
      </div>

      ${responBox}
    </div>
  `;
}

/** Escape HTML to prevent XSS */
function escapeHtml(str) {
  if (typeof str !== "string") return str ?? "";
  return str
    .replace(/&/g,  "&amp;")
    .replace(/</g,  "&lt;")
    .replace(/>/g,  "&gt;")
    .replace(/"/g,  "&quot;")
    .replace(/'/g,  "&#039;");
}

/** Main cek status handler */
async function handleCekStatus() {
  errNoAduan.textContent = "";
  const rawInput = inputNoAduan.value.trim().toUpperCase();

  if (!rawInput) {
    errNoAduan.textContent = "Masukkan nomor aduan terlebih dahulu.";
    inputNoAduan.focus();
    return;
  }

  if (!/^ADM-\d{8}$/.test(rawInput)) {
    errNoAduan.textContent = "Format nomor aduan tidak valid. Contoh: ADM-58493021";
    return;
  }

  setCekLoading(true);
  statusResult.style.display = "none";
  statusResult.innerHTML     = "";

  try {
    const snapshot = await db
      .collection("aduanMutasi")
      .where("noAduan", "==", rawInput)
      .limit(1)
      .get();

    if (snapshot.empty) {
      statusResult.innerHTML = `
        <div class="status-card not-found">
          <div class="status-card-header">
            <div class="status-icon"><i class="fas fa-circle-question"></i></div>
            <div>
              <div class="status-no-aduan">${escapeHtml(rawInput)}</div>
              <div class="status-title">Nomor Aduan Tidak Ditemukan</div>
            </div>
          </div>
          <p style="font-size:var(--fs-sm);color:var(--gray-600);margin-top:var(--space-3);">
            Pastikan nomor aduan yang Anda masukkan sudah benar. Jika baru saja mengajukan,
            tunggu beberapa saat lalu coba lagi.
          </p>
        </div>
      `;
      showToast("warning", "Tidak Ditemukan", `Nomor aduan ${rawInput} tidak ada dalam sistem.`);
    } else {
      const doc = snapshot.docs[0];
      statusResult.innerHTML = renderStatusCard(doc);
      showToast("success", "Data Ditemukan", `Status aduan ${rawInput} berhasil dimuat.`);
    }

    statusResult.style.display = "block";
    statusResult.scrollIntoView({ behavior: "smooth", block: "nearest" });

  } catch (error) {
    console.error("[Aduan-Penmurmut] Cek status error:", error);
    showToast("error", "Gagal Memuat", "Terjadi kesalahan. Periksa koneksi internet Anda.", 5000);
  } finally {
    setCekLoading(false);
  }
}

/* Bind cek button click & Enter key */
btnCekStatus.addEventListener("click", handleCekStatus);

inputNoAduan.addEventListener("keydown", (e) => {
  if (e.key === "Enter") handleCekStatus();
});

/* Auto-format: force uppercase + ADM- prefix hint */
inputNoAduan.addEventListener("input", () => {
  inputNoAduan.value = inputNoAduan.value.toUpperCase();
});


/* ──────────────────────────────────────────
   12. INPUT REAL-TIME ERROR CLEAR
────────────────────────────────────────── */
Object.entries(inp).forEach(([key, el]) => {
  if (!el) return;
  const evtType = el.type === "checkbox" ? "change" : "input";
  el.addEventListener(evtType, () => {
    if (err[key] && err[key].textContent) setError(key, "");
  });
});


/* ──────────────────────────────────────────
   13. INIT LOG
────────────────────────────────────────── */
console.info(
  "%c✦ Aduan-Penmurmut v1.0 %c — SMAN 68 Jakarta",
  "background:#006633;color:#fff;padding:2px 8px;border-radius:4px;font-weight:700;",
  "color:#0088cc;font-weight:600;"
);
