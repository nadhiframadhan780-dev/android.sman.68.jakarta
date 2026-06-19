// ============================================
// FIREBASE CONFIGURATION
// ============================================
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

// ============================================
// SECURITY: Disable console in production
// ============================================
(function() {
    const noop = function() {};
    console.log = noop;
    console.info = noop;
    console.debug = noop;
})();

// ============================================
// GLOBAL VARIABLES
// ============================================
let targetDate = null;
let countdownInterval = null;

// DOM Elements
const countdownContainer = document.getElementById('countdownContainer');
const formContainer = document.getElementById('formContainer');
const resultContainer = document.getElementById('resultContainer');
const checkForm = document.getElementById('checkForm');
const toast = document.getElementById('toast');
const toastIcon = document.getElementById('toastIcon');
const toastMessage = document.getElementById('toastMessage');
const spinner = document.getElementById('spinner');
const noDaftarInput = document.getElementById('noDaftar');

// ============================================
// CHARACTER COUNTER
// ============================================
noDaftarInput.addEventListener('input', function(e) {
    this.value = this.value.replace(/[^0-9]/g, '');
    if (this.value.length > 14) {
        this.value = this.value.slice(0, 14);
    }
    updateCharCounter(this.value.length);
});

function updateCharCounter(length) {
    const counter = document.getElementById('charCounter');
    if (length === 0) {
        counter.textContent = 'Masukkan 14 digit nomor pendaftaran';
        counter.className = 'char-counter';
    } else if (length < 14) {
        counter.textContent = `${length}/14 digit (kurang ${14 - length} lagi)`;
        counter.className = 'char-counter invalid';
    } else {
        counter.textContent = '✓ 14 digit lengkap';
        counter.className = 'char-counter valid';
    }
}

// ============================================
// DIGITAL CLOCK
// ============================================
function updateClock() {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    document.getElementById('liveClock').textContent = `${hours}:${minutes}`;
    
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    document.getElementById('liveDate').textContent = now.toLocaleDateString('id-ID', options);
}

setInterval(updateClock, 1000);
updateClock();

// ============================================
// TOAST NOTIFICATION
// ============================================
function showToast(message, type = 'error') {
    toast.classList.remove('hidden', 'error', 'success');
    toast.classList.add(type);
    toastMessage.textContent = message;
    toastIcon.className = type === 'error' ? 'fas fa-exclamation-circle toast-icon' : 'fas fa-check-circle toast-icon';
    setTimeout(() => toast.classList.add('hidden'), 4000);
}

// ============================================
// COUNTDOWN TIMER
// ============================================
function startCountdown() {
    if (!targetDate) return;
    if (countdownInterval) clearInterval(countdownInterval);
    
    countdownInterval = setInterval(() => {
        const distance = new Date(targetDate).getTime() - new Date().getTime();
        
        if (distance <= 0) {
            clearInterval(countdownInterval);
            showFormContainer();
            return;
        }
        
        document.getElementById('days').textContent = String(Math.floor(distance / (1000 * 60 * 60 * 24))).padStart(2, '0');
        document.getElementById('hours').textContent = String(Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))).padStart(2, '0');
        document.getElementById('minutes').textContent = String(Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60))).padStart(2, '0');
        document.getElementById('seconds').textContent = String(Math.floor((distance % (1000 * 60)) / 1000)).padStart(2, '0');
    }, 1000);
}

function showCountdownContainer() {
    countdownContainer.classList.remove('hidden');
    formContainer.classList.add('hidden');
    resultContainer.classList.add('hidden');
    startCountdown();
}

function showFormContainer() {
    countdownContainer.classList.add('hidden');
    formContainer.classList.remove('hidden');
    resultContainer.classList.add('hidden');
    if (countdownInterval) clearInterval(countdownInterval);
}

function showResultContainer(html) {
    formContainer.classList.add('hidden');
    resultContainer.classList.remove('hidden');
    resultContainer.innerHTML = html;
}

// ============================================
// FETCH TARGET DATE
// ============================================
function fetchTargetDate() {
    db.collection('operatorSettings').doc('config').onSnapshot((doc) => {
        if (doc.exists) {
            targetDate = doc.data().targetDate;
            if (new Date(targetDate).getTime() > new Date().getTime()) {
                showCountdownContainer();
            } else {
                showFormContainer();
            }
        } else {
            showFormContainer();
        }
    }, () => showFormContainer());
}

// ============================================
// CHECK RESULT
// ============================================
async function checkResult(noDaftar, tglLahir) {
    try {
        const querySnapshot = await db.collection('pendaftaranMutasi')
            .where('noDaftar', '==', noDaftar)
            .where('tglLahir', '==', tglLahir)
            .get();
        
        if (querySnapshot.empty) {
            showToast('Data tidak ditemukan. Periksa kembali nomor pendaftaran dan tanggal lahir Anda.', 'error');
            return;
        }
        
        const data = querySnapshot.docs[0].data();
        
        if (data.status === 'lolos' || data.status === 'diterima') {
            renderPassedResult(data);
        } else if (data.status === 'tidak-lolos' || data.status === 'ditolak') {
            renderFailedResult(data);
        } else {
            showToast('Status Anda masih dalam proses verifikasi.', 'error');
        }
    } catch (error) {
        showToast('Terjadi kesalahan sistem. Silakan coba lagi.', 'error');
    }
}

// ============================================
// RENDER RESULTS
// ============================================
function renderPassedResult(data) {
    const html = `
        <div class="status-passed fade-in">
            <div class="result-icon"><i class="fas fa-check-circle"></i></div>
            <h2 class="result-title">SELAMAT! ANDA DINYATAKAN LOLOS<br>SELEKSI MURID MUTASI<br>SMAN 68 JAKARTA T.A 2026/2027</h2>
            <p class="result-message">Anda diterima sebagai peserta didik di SMAN 68 Jakarta. Selamat bergabung!</p>
            <table class="data-table">
                <tr><th>Data Diri</th><th>Detail</th></tr>
                <tr><td><strong>Nomor Pendaftaran</strong></td><td class="result-no-daftar">${escapeHTML(data.noDaftar)}</td></tr>
                <tr><td><strong>Nama Lengkap</strong></td><td>${escapeHTML(data.namaLengkap || data.nama)}</td></tr>
                <tr><td><strong>Tanggal Lahir</strong></td><td>${formatTanggal(data.tglLahir)}</td></tr>
                <tr><td><strong>Asal Sekolah</strong></td><td>${escapeHTML(data.asalSekolah || data.sekolahAsal)}</td></tr>
                <tr><td><strong>NPSN</strong></td><td>${escapeHTML(data.npsn)}</td></tr>
            </table>
            <a href="./daftar-ulang.html" class="btn-register"><i class="fas fa-user-graduate"></i> Daftar Ulang Sekarang</a>
        </div>
    `;
    showResultContainer(html);
    showToast('Selamat! Anda dinyatakan LOLOS.', 'success');
}

function renderFailedResult(data) {
    const html = `
        <div class="status-failed fade-in">
            <div class="result-icon"><i class="fas fa-times-circle"></i></div>
            <h2 class="result-title">MOHON MAAF, ANDA TIDAK LOLOS<br>SELEKSI MURID MUTASI<br>SMAN 68 JAKARTA T.A 2026/2027</h2>
            <p class="result-message">"Kegagalan adalah kesempatan untuk memulai kembali."</p>
            <table class="data-table">
                <tr><th>Data Diri</th><th>Detail</th></tr>
                <tr><td><strong>Nomor Pendaftaran</strong></td><td class="result-no-daftar">${escapeHTML(data.noDaftar)}</td></tr>
                <tr><td><strong>Nama Lengkap</strong></td><td>${escapeHTML(data.namaLengkap || data.nama)}</td></tr>
                <tr><td><strong>Tanggal Lahir</strong></td><td>${formatTanggal(data.tglLahir)}</td></tr>
                <tr><td><strong>Asal Sekolah</strong></td><td>${escapeHTML(data.asalSekolah || data.sekolahAsal)}</td></tr>
                <tr><td><strong>NPSN</strong></td><td>${escapeHTML(data.npsn)}</td></tr>
            </table>
            <div class="encouragement">
                <i class="fas fa-heart"></i>
                <p>Jangan berkecil hati! Teruslah berusaha dan kembangkan potensi diri Anda. SMAN 68 Jakarta mengapresiasi partisipasi Anda.</p>
            </div>
        </div>
    `;
    showResultContainer(html);
    showToast('Jangan menyerah! Masih banyak kesempatan lain.', 'error');
}

// ============================================
// HELPER FUNCTIONS
// ============================================
function escapeHTML(str) {
    if (!str) return '-';
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

function formatTanggal(tanggal) {
    if (!tanggal || tanggal === '-') return '-';
    try {
        const date = new Date(tanggal);
        if (isNaN(date.getTime())) return tanggal;
        return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
    } catch (e) {
        return tanggal;
    }
}

// ============================================
// FORM SUBMIT HANDLER
// ============================================
checkForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const noDaftar = document.getElementById('noDaftar').value.trim();
    const tglLahir = document.getElementById('tglLahir').value;
    
    if (noDaftar.length !== 14 || !/^\d{14}$/.test(noDaftar)) {
        showToast('Nomor pendaftaran harus 14 digit angka.', 'error');
        return;
    }
    
    if (!tglLahir) {
        showToast('Tanggal lahir harus diisi.', 'error');
        return;
    }
    
    spinner.classList.remove('hidden');
    const btnCheck = document.getElementById('btnCheck');
    btnCheck.disabled = true;
    
    await checkResult(noDaftar, tglLahir);
    
    spinner.classList.add('hidden');
    btnCheck.disabled = false;
});

// ============================================
// INITIALIZE
// ============================================
function init() {
    fetchTargetDate();
}

document.addEventListener('DOMContentLoaded', init);
