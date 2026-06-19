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

// DOM Elements
const cekSection = document.getElementById('cekSection');
const hasilSection = document.getElementById('hasilSection');
const hasilCard = document.getElementById('hasilCard');
const hasilIcon = document.getElementById('hasilIcon');
const hasilStatus = document.getElementById('hasilStatus');
const hasilMessage = document.getElementById('hasilMessage');
const siswaInfo = document.getElementById('siswaInfo');
const cekForm = document.getElementById('cekForm');
const btnCek = document.getElementById('btnCek');
const btnAgain = document.getElementById('btnAgain');

// NISN only numbers
document.getElementById('nisnInput').addEventListener('input', function() {
    this.value = this.value.replace(/[^0-9]/g, '').slice(0, 10);
});

// Submit Form
cekForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const nisn = document.getElementById('nisnInput').value.trim();
    
    if (!nisn) {
        alert('Masukkan NISN terlebih dahulu!');
        return;
    }
    
    if (nisn.length < 10) {
        alert('NISN harus 10 digit!');
        return;
    }
    
    btnCek.disabled = true;
    btnCek.innerHTML = '<span class="spinner"></span> Memeriksa...';
    
    try {
        const snapshot = await db.collection('kelulusan').where('nisn', '==', nisn).get();
        
        if (snapshot.empty) {
            // NISN tidak ditemukan
            showHasil('tidak-lulus', 'NISN Tidak Ditemukan', 
                'Mohon maaf, NISN yang Anda masukkan tidak terdaftar dalam database kelulusan SMAN 68 Jakarta. Silakan periksa kembali NISN Anda atau hubungi wali kelas untuk informasi lebih lanjut.',
                null);
        } else {
            const data = snapshot.docs[0].data();
            
            if (data.status === 'lulus') {
                showHasil('lulus', 'SELAMAT! Anda Dinyatakan LULUS',
                    'Dengan penuh rasa syukur, kami mengucapkan selamat atas kelulusan Anda dari SMA Negeri 68 Jakarta. Semoga kesuksesan selalu menyertai langkah Anda menuju jenjang pendidikan yang lebih tinggi. Tetaplah jaga nama baik almamater dan teruslah berprestasi.',
                    data);
            } else {
                showHasil('tidak-lulus', 'Mohon Maaf, Anda Belum Lulus',
                    'Berdasarkan hasil rapat dewan guru, Anda dinyatakan belum memenuhi kriteria kelulusan. Jangan berkecil hati, ini bukan akhir dari segalanya. Segera hubungi wali kelas untuk informasi lebih lanjut dan langkah selanjutnya.',
                    data);
            }
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Terjadi kesalahan. Silakan coba lagi.');
    } finally {
        btnCek.disabled = false;
        btnCek.innerHTML = '<i class="fas fa-search"></i> Cek Kelulusan';
    }
});

// Tampilkan Hasil
function showHasil(status, title, message, data) {
    cekSection.style.display = 'none';
    hasilSection.style.display = 'block';
    
    hasilCard.className = `hasil-card ${status}`;
    
    if (status === 'lulus') {
        hasilIcon.innerHTML = '<i class="fas fa-check-circle"></i>';
    } else {
        hasilIcon.innerHTML = '<i class="fas fa-times-circle"></i>';
    }
    
    hasilStatus.textContent = title;
    hasilMessage.textContent = message;
    
    if (data) {
        siswaInfo.innerHTML = `
            <div class="info-row">
                <span class="info-label">Nama Lengkap</span>
                <span class="info-value">${data.nama || '-'}</span>
            </div>
            <div class="info-row">
                <span class="info-label">NISN</span>
                <span class="info-value">${data.nisn || '-'}</span>
            </div>
            <div class="info-row">
                <span class="info-label">Tanggal Lahir</span>
                <span class="info-value">${data.tanggalLahir || '-'}</span>
            </div>
            <div class="info-row">
                <span class="info-label">Kelas</span>
                <span class="info-value">${data.kelas || '-'}</span>
            </div>
            ${data.keterangan ? `
            <div class="info-row">
                <span class="info-label">Keterangan</span>
                <span class="info-value">${data.keterangan}</span>
            </div>` : ''}
        `;
    } else {
        siswaInfo.innerHTML = '<p style="text-align:center;color:var(--text-light);">Data tidak tersedia</p>';
    }
}

// Tombol Cek Lagi
btnAgain.addEventListener('click', () => {
    cekSection.style.display = 'block';
    hasilSection.style.display = 'none';
    document.getElementById('nisnInput').value = '';
    document.getElementById('nisnInput').focus();
});

console.log('✅ Hasil Kelulusan SMAN 68 Jakarta - Loaded');
