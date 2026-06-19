// Firebase Configuration
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
// TOAST
// ============================================
function showToast(type, title, message, duration = 5000) {
    const container = document.getElementById('toastContainer');
    const icons = { success: 'check-circle', error: 'exclamation-circle', warning: 'exclamation-triangle' };
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `
        <i class="fas fa-${icons[type]}"></i>
        <div class="toast-content">
            <div class="toast-title">${title}</div>
            <div class="toast-message">${message}</div>
        </div>`;
    container.appendChild(toast);
    setTimeout(() => { toast.style.transform = 'translateX(120%)'; setTimeout(() => toast.remove(), 300); }, duration);
}

// ============================================
// PASSWORD TOGGLE
// ============================================
document.getElementById('togglePass1').addEventListener('click', function() {
    const input = document.getElementById('password');
    input.type = input.type === 'password' ? 'text' : 'password';
    this.classList.toggle('fa-eye');
    this.classList.toggle('fa-eye-slash');
});
document.getElementById('togglePass2').addEventListener('click', function() {
    const input = document.getElementById('konfirmasiPassword');
    input.type = input.type === 'password' ? 'text' : 'password';
    this.classList.toggle('fa-eye');
    this.classList.toggle('fa-eye-slash');
});

// ============================================
// NUPTK & NIP ONLY NUMBERS
// ============================================
document.getElementById('nuptk').addEventListener('input', function() {
    this.value = this.value.replace(/[^0-9]/g, '').slice(0, 16);
});
document.getElementById('nip').addEventListener('input', function() {
    this.value = this.value.replace(/[^0-9]/g, '').slice(0, 18);
});

// ============================================
// SUBMIT FORM
// ============================================
document.getElementById('registerForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const nama = document.getElementById('namaLengkap').value.trim();
    const nip = document.getElementById('nip').value.trim();
    const nuptk = document.getElementById('nuptk').value.trim();
    const jabatan = document.getElementById('jabatan').value;
    const password = document.getElementById('password').value;
    const konfirmasi = document.getElementById('konfirmasiPassword').value;
    
    // Validasi
    if (!nama || !nip || !nuptk || !jabatan || !password || !konfirmasi) {
        showToast('error', 'Data Tidak Lengkap', 'Mohon isi semua field yang wajib!');
        return;
    }
    
    if (nuptk.length < 16) {
        showToast('error', 'NUPTK Tidak Valid', 'NUPTK harus 16 digit!');
        return;
    }
    
    if (password.length < 6) {
        showToast('error', 'Password Lemah', 'Password minimal 6 karakter!');
        return;
    }
    
    if (password !== konfirmasi) {
        showToast('error', 'Password Tidak Cocok', 'Konfirmasi password tidak sesuai!');
        return;
    }
    
    const btn = document.getElementById('submitBtn');
    btn.disabled = true;
    btn.innerHTML = '<span class="spinner"></span> Mendaftarkan...';
    
    try {
        // Cek NUPTK sudah terdaftar
        const nuptkCheck = await db.collection('guru').where('nuptk', '==', nuptk).get();
        if (!nuptkCheck.empty) {
            showToast('warning', 'NUPTK Sudah Terdaftar', 'NUPTK ini sudah terdaftar di sistem!');
            btn.disabled = false;
            btn.innerHTML = '<i class="fas fa-user-plus"></i> Daftar Sekarang';
            return;
        }
        
        // Simpan pendaftaran
        await db.collection('guru').add({
            nama: nama,
            nip: nip,
            nuptk: nuptk,
            jabatan: jabatan,
            password: password,
            status: 'pending',
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        
        showToast('success', 'Pendaftaran Berhasil!', 'Akun Anda akan dikonfirmasi oleh operator dalam 1x24 jam. Silakan login ke Portal Guru setelah disetujui.', 6000);
        
        // Reset form
        document.getElementById('registerForm').reset();
        
    } catch (error) {
        console.error('Error:', error);
        showToast('error', 'Pendaftaran Gagal', 'Terjadi kesalahan. Silakan coba lagi nanti.');
    } finally {
        btn.disabled = false;
        btn.innerHTML = '<i class="fas fa-user-plus"></i> Daftar Sekarang';
    }
});

console.log('✅ Pendaftaran Guru SMAN 68 Jakarta V 2.0.0 - Loaded');