# 🏫 SMAN 68 Jakarta — Sistem Halaman Mitra

## 📁 Struktur File

```
├── partner-sman-68-jakarta.html   → Halaman publik tampilan mitra
├── partner-sman-68-jakarta.css    → Stylesheet halaman mitra
├── partner-sman-68-jakarta.js     → Script halaman mitra
├── operator-partner.html          → Panel operator (tambah/edit/hapus mitra)
├── firebase-config.js             → ⚠️ CONFIG FIREBASE (JANGAN DI-PUSH)
├── .gitignore                     → Berisi firebase-config.js
└── README.md                      → File ini
```

---

## 🔐 Cara Menyembunyikan Firebase Config dari GitHub

### Masalah
Firebase config (apiKey, dll) **tidak bisa benar-benar disembunyikan** di GitHub Pages karena ini adalah website statis (tidak ada server). Namun kita bisa meminimalkan risiko dengan cara berikut:

### Solusi yang Digunakan

#### 1. `.gitignore` — Jangan Push Config
File `firebase-config.js` sudah masuk ke `.gitignore` sehingga **tidak akan ter-commit ke GitHub**.

```gitignore
firebase-config.js
```

#### 2. Apa yang Perlu Dilakukan Setelah Clone/Deploy

Buat manual file `firebase-config.js` di server/hosting dengan isi:
```javascript
window.__FIREBASE_CONFIG__ = {
    apiKey: "...",
    authDomain: "...",
    // dst.
};
```

File ini **tidak pernah di-commit**, hanya ada di server.

#### 3. Firebase Security Rules (WAJIB!)

Ini yang paling penting! Buka Firebase Console → Firestore → Rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Koleksi mitra: siapapun bisa baca, hanya dari domain tertentu
    match /partners_sman68/{docId} {
      // Baca publik (untuk halaman tampilan)
      allow read: if true;
      
      // Tulis HANYA dari IP/domain tertentu
      // Ganti dengan domain GitHub Pages kamu
      allow write: if request.auth != null;
      // ATAU batasi berdasarkan kondisi lain
    }
  }
}
```

#### 4. Untuk GitHub Pages

Karena GitHub Pages tidak bisa menyembunyikan file sepenuhnya, gunakan salah satu dari:

**Opsi A — Hardcode di JS (termudah, cukup aman jika Rules ketat):**
Langsung tulis config di `firebase-config.js` dan pastikan `.gitignore` berfungsi.

**Opsi B — GitHub Actions Secret (lebih aman):**
Simpan config sebagai GitHub Secret, lalu gunakan workflow untuk inject saat deploy:
```yaml
# .github/workflows/deploy.yml
- name: Inject Firebase Config
  run: |
    echo "window.__FIREBASE_CONFIG__ = ${{ secrets.FIREBASE_CONFIG }};" > firebase-config.js
```

**Opsi C — Vercel/Netlify (paling aman):**
Deploy ke Vercel/Netlify, simpan config sebagai Environment Variable, gunakan serverless function sebagai proxy.

---

## 🚀 Cara Penggunaan

### Menambah Mitra
1. Buka `operator-partner.html`
2. Isi form: Nama, Kategori, URL Logo, Deskripsi, Website
3. Klik "Simpan Mitra"

### Melihat Tampilan
- Buka `partner-sman-68-jakarta.html`
- Filter berdasarkan kategori atau cari mitra

### Navigasi
- **Tombol Kembali** → `history.back()`
- **Tombol Beranda** → `./sman68.html`

---

## 📋 Struktur Data Firestore

Koleksi: `partners_sman68`

| Field       | Tipe   | Keterangan              |
|-------------|--------|-------------------------|
| name        | string | Nama mitra              |
| category    | string | Kategori mitra          |
| logoUrl     | string | URL logo mitra          |
| description | string | Deskripsi kerja sama    |
| website     | string | URL website mitra       |
| createdAt   | timestamp | Waktu dibuat         |
| updatedAt   | timestamp | Waktu diperbarui    |

---

## ⚠️ Catatan Keamanan

1. `firebase-config.js` **JANGAN pernah di-commit**
2. Pasang **Firebase Security Rules** yang ketat
3. Aktifkan **App Check** di Firebase Console untuk domain restriction
4. Monitor usage di Firebase Console secara berkala

---

*SMAN 68 Jakarta © 2025*
