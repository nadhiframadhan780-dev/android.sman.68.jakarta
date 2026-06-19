// ============================================================
// DATA PEMERINGKATAN PTN INDONESIA 2026
// ============================================================

// Data uniRank 2026 (100 universitas)
const unirankData = [
    { rank: 1, nama: 'Universitas Indonesia', tipe: 'PTN', tahunBerdiri: 1950, akreditasi: 'Unggul', worldRank: '#444', lokasi: 'Depok', mahasiswa: '±47.000' },
    { rank: 2, nama: 'Universitas Gadjah Mada', tipe: 'PTN', tahunBerdiri: 1949, akreditasi: 'Unggul', worldRank: '#539', lokasi: 'Sleman', mahasiswa: '±55.000' },
    { rank: 3, nama: 'Universitas Telkom', tipe: 'PTS', tahunBerdiri: 2013, akreditasi: 'Unggul', worldRank: '#1346', lokasi: 'Bandung', mahasiswa: '±31.000' },
    { rank: 4, nama: 'Universitas Diponegoro', tipe: 'PTN', tahunBerdiri: 1957, akreditasi: 'Unggul', worldRank: '#831', lokasi: 'Semarang', mahasiswa: '±38.000' },
    { rank: 5, nama: 'Institut Teknologi Bandung', tipe: 'PTN', tahunBerdiri: 1959, akreditasi: 'Unggul', worldRank: '#717', lokasi: 'Bandung', mahasiswa: '±24.000' },
    { rank: 6, nama: 'Universitas Bina Nusantara', tipe: 'PTS', tahunBerdiri: 1981, akreditasi: 'Unggul', worldRank: '#1317', lokasi: 'Jakarta', mahasiswa: '±45.000' },
    { rank: 7, nama: 'Universitas Brawijaya', tipe: 'PTN', tahunBerdiri: 1963, akreditasi: 'Unggul', worldRank: '#918', lokasi: 'Malang', mahasiswa: '±60.000' },
    { rank: 8, nama: 'Institut Pertanian Bogor', tipe: 'PTN', tahunBerdiri: 1963, akreditasi: 'Unggul', worldRank: '#860', lokasi: 'Bogor', mahasiswa: '±27.000' },
    { rank: 9, nama: 'Universitas Airlangga', tipe: 'PTN', tahunBerdiri: 1954, akreditasi: 'Unggul', worldRank: '#873', lokasi: 'Surabaya', mahasiswa: '±40.000' },
    { rank: 10, nama: 'Universitas Muhammadiyah Sumatera Utara', tipe: 'PTS', tahunBerdiri: 1957, akreditasi: 'Unggul', worldRank: '#3983', lokasi: 'Medan', mahasiswa: '±35.000' },
    { rank: 11, nama: 'Universitas Padjadjaran', tipe: 'PTN', tahunBerdiri: 1957, akreditasi: 'Unggul', worldRank: '#886', lokasi: 'Sumedang', mahasiswa: '±41.000' },
    { rank: 12, nama: 'Institut Teknologi Sepuluh Nopember', tipe: 'PTN', tahunBerdiri: 1960, akreditasi: 'Unggul', worldRank: '#1229', lokasi: 'Surabaya', mahasiswa: '±18.000' },
    { rank: 13, nama: 'Universitas Gunadarma', tipe: 'PTS', tahunBerdiri: 1981, akreditasi: 'Unggul', worldRank: '#4119', lokasi: 'Depok', mahasiswa: '±41.000' },
    { rank: 14, nama: 'Universitas Pendidikan Indonesia', tipe: 'PTN', tahunBerdiri: 1954, akreditasi: 'Unggul', worldRank: '#1200', lokasi: 'Bandung', mahasiswa: '±38.000' },
    { rank: 15, nama: 'Universitas Sebelas Maret', tipe: 'PTN', tahunBerdiri: 1976, akreditasi: 'Unggul', worldRank: '#1053', lokasi: 'Surakarta', mahasiswa: '±36.000' },
    { rank: 16, nama: 'Universitas Medan Area', tipe: 'PTS', tahunBerdiri: 1983, akreditasi: 'Unggul', worldRank: '#7515', lokasi: 'Medan', mahasiswa: '±20.000' },
    { rank: 17, nama: 'Universitas Teknokrat Indonesia', tipe: 'PTS', tahunBerdiri: 2000, akreditasi: 'Unggul', worldRank: '#3590±', lokasi: 'Bandar Lampung', mahasiswa: '±14.000' },
    { rank: 18, nama: 'Universitas Andalas', tipe: 'PTN', tahunBerdiri: 1956, akreditasi: 'Unggul', worldRank: '#1303', lokasi: 'Padang', mahasiswa: '±30.000' },
    { rank: 19, nama: 'Universitas Lampung', tipe: 'PTN', tahunBerdiri: 1965, akreditasi: 'Unggul', worldRank: '#1440', lokasi: 'Bandar Lampung', mahasiswa: '±32.000' },
    { rank: 20, nama: 'Universitas Hasanuddin', tipe: 'PTN', tahunBerdiri: 1956, akreditasi: 'Unggul', worldRank: '#1175', lokasi: 'Makassar', mahasiswa: '±43.000' },
    { rank: 21, nama: 'Universitas Negeri Yogyakarta', tipe: 'PTN', tahunBerdiri: 1964, akreditasi: 'Unggul', worldRank: '#1378', lokasi: 'Sleman', mahasiswa: '±35.000' },
    { rank: 22, nama: 'Universitas Budi Luhur', tipe: 'PTS', tahunBerdiri: 1979, akreditasi: 'Unggul', worldRank: '#5000±', lokasi: 'Jakarta', mahasiswa: '±18.000' },
    { rank: 23, nama: 'Universitas Negeri Malang', tipe: 'PTN', tahunBerdiri: 1954, akreditasi: 'Unggul', worldRank: '#1400', lokasi: 'Malang', mahasiswa: '±32.000' },
    { rank: 24, nama: 'Universitas Jember', tipe: 'PTN', tahunBerdiri: 1964, akreditasi: 'Unggul', worldRank: '#7332', lokasi: 'Jember', mahasiswa: '±33.000' },
    { rank: 25, nama: 'Universitas Pamulang', tipe: 'PTS', tahunBerdiri: 2000, akreditasi: 'Baik Sekali', worldRank: '#7000±', lokasi: 'Tangerang', mahasiswa: '±80.000' },
    { rank: 26, nama: 'Universitas Muhammadiyah Surabaya', tipe: 'PTS', tahunBerdiri: 1964, akreditasi: 'Unggul', worldRank: '#5000±', lokasi: 'Surabaya', mahasiswa: '±20.000' },
    { rank: 27, nama: 'Universitas Islam Indonesia', tipe: 'PTS', tahunBerdiri: 1945, akreditasi: 'Unggul', worldRank: '#1682', lokasi: 'Sleman', mahasiswa: '±28.000' },
    { rank: 28, nama: 'Universitas Muhammadiyah Yogyakarta', tipe: 'PTS', tahunBerdiri: 1981, akreditasi: 'Unggul', worldRank: '#2052', lokasi: 'Bantul', mahasiswa: '±30.000' },
    { rank: 29, nama: 'Universitas Muhammadiyah Jakarta', tipe: 'PTS', tahunBerdiri: 1955, akreditasi: 'Unggul', worldRank: '#7484', lokasi: 'Tangerang Selatan', mahasiswa: '±24.000' },
    { rank: 30, nama: 'Universitas Syiah Kuala', tipe: 'PTN', tahunBerdiri: 1961, akreditasi: 'Unggul', worldRank: '#1775', lokasi: 'Banda Aceh', mahasiswa: '±35.000' },
    { rank: 31, nama: 'Universitas Jenderal Soedirman', tipe: 'PTN', tahunBerdiri: 1963, akreditasi: 'Unggul', worldRank: '#1849', lokasi: 'Banyumas', mahasiswa: '±28.000' },
    { rank: 32, nama: 'Universitas Negeri Padang', tipe: 'PTN', tahunBerdiri: 1999, akreditasi: 'Unggul', worldRank: '#1319', lokasi: 'Padang', mahasiswa: '±34.000' },
    { rank: 33, nama: 'Universitas Negeri Semarang', tipe: 'PTN', tahunBerdiri: 1965, akreditasi: 'Unggul', worldRank: '#1408', lokasi: 'Semarang', mahasiswa: '±37.000' },
    { rank: 34, nama: 'Universitas Lambung Mangkurat', tipe: 'PTN', tahunBerdiri: 1958, akreditasi: 'Unggul', worldRank: '#1689', lokasi: 'Banjarmasin', mahasiswa: '±27.000' },
    { rank: 35, nama: 'Universitas Sains dan Teknologi Komputer', tipe: 'PTS', tahunBerdiri: 1986, akreditasi: 'Baik Sekali', worldRank: '#7000±', lokasi: 'Semarang', mahasiswa: '±10.000' },
    { rank: 36, nama: 'UIN Sunan Gunung Djati Bandung', tipe: 'PTN', tahunBerdiri: 1968, akreditasi: 'Unggul', worldRank: '#7325', lokasi: 'Bandung', mahasiswa: '±30.000' },
    { rank: 37, nama: 'Universitas Negeri Surabaya', tipe: 'PTN', tahunBerdiri: 1964, akreditasi: 'Unggul', worldRank: '#1605', lokasi: 'Surabaya', mahasiswa: '±40.000' },
    { rank: 38, nama: 'Universitas Udayana', tipe: 'PTN', tahunBerdiri: 1962, akreditasi: 'Unggul', worldRank: '#1313', lokasi: 'Badung', mahasiswa: '±30.000' },
    { rank: 39, nama: 'Universitas Sumatera Utara', tipe: 'PTN', tahunBerdiri: 1952, akreditasi: 'Unggul', worldRank: '#1351', lokasi: 'Medan', mahasiswa: '±45.000' },
    { rank: 40, nama: 'Institut Seni Indonesia Bali', tipe: 'PTN', tahunBerdiri: 2003, akreditasi: 'Baik Sekali', worldRank: '#8000±', lokasi: 'Denpasar', mahasiswa: '±5.000' },
    { rank: 41, nama: 'UPN Veteran Yogyakarta', tipe: 'PTN', tahunBerdiri: 1958, akreditasi: 'Unggul', worldRank: '#6500±', lokasi: 'Sleman', mahasiswa: '±18.000' },
    { rank: 42, nama: 'UPN Veteran Jakarta', tipe: 'PTN', tahunBerdiri: 2014, akreditasi: 'Unggul', worldRank: '#7432', lokasi: 'Jakarta', mahasiswa: '±22.000' },
    { rank: 43, nama: 'Universitas Ahmad Dahlan', tipe: 'PTS', tahunBerdiri: 1994, akreditasi: 'Unggul', worldRank: '#2128', lokasi: 'Yogyakarta', mahasiswa: '±28.000' },
    { rank: 44, nama: 'Universitas Muhammadiyah Malang', tipe: 'PTS', tahunBerdiri: 1965, akreditasi: 'Unggul', worldRank: '#4652', lokasi: 'Malang', mahasiswa: '±40.000' },
    { rank: 45, nama: 'Universitas Bengkulu', tipe: 'PTN', tahunBerdiri: 1982, akreditasi: 'Unggul', worldRank: '#1783', lokasi: 'Bengkulu', mahasiswa: '±18.000' },
    { rank: 46, nama: 'Universitas Negeri Jakarta', tipe: 'PTN', tahunBerdiri: 1964, akreditasi: 'Unggul', worldRank: '#7355', lokasi: 'Jakarta', mahasiswa: '±33.000' },
    { rank: 47, nama: 'Universitas Mataram', tipe: 'PTN', tahunBerdiri: 1962, akreditasi: 'Unggul', worldRank: '#1660', lokasi: 'Mataram', mahasiswa: '±30.000' },
    { rank: 48, nama: 'UIN Maulana Malik Ibrahim Malang', tipe: 'PTN', tahunBerdiri: 2004, akreditasi: 'Unggul', worldRank: '#2257', lokasi: 'Malang', mahasiswa: '±20.000' },
    { rank: 49, nama: 'Universitas Muhammadiyah Surakarta', tipe: 'PTS', tahunBerdiri: 1981, akreditasi: 'Unggul', worldRank: '#7502', lokasi: 'Surakarta', mahasiswa: '±35.000' },
    { rank: 50, nama: 'UIN Syarif Hidayatullah Jakarta', tipe: 'PTN', tahunBerdiri: 1957, akreditasi: 'Unggul', worldRank: '#1704', lokasi: 'Tangerang Selatan', mahasiswa: '±31.000' },
    { rank: 51, nama: 'Universitas Katolik Parahyangan', tipe: 'PTS', tahunBerdiri: 1955, akreditasi: 'Unggul', worldRank: '#2922', lokasi: 'Bandung', mahasiswa: '±16.000' },
    { rank: 52, nama: 'Universitas Bina Sarana Informatika', tipe: 'PTS', tahunBerdiri: 1988, akreditasi: 'Baik Sekali', worldRank: '#6000±', lokasi: 'Jakarta', mahasiswa: '±40.000' },
    { rank: 53, nama: 'Universitas Esa Unggul', tipe: 'PTS', tahunBerdiri: 1986, akreditasi: 'Unggul', worldRank: '#3598', lokasi: 'Jakarta', mahasiswa: '±18.000' },
    { rank: 54, nama: 'UIN Sunan Ampel Surabaya', tipe: 'PTN', tahunBerdiri: 1965, akreditasi: 'Unggul', worldRank: '#5500±', lokasi: 'Surabaya', mahasiswa: '±29.000' },
    { rank: 55, nama: 'Universitas Jambi', tipe: 'PTN', tahunBerdiri: 1963, akreditasi: 'Unggul', worldRank: '#2077', lokasi: 'Jambi', mahasiswa: '±25.000' },
    { rank: 56, nama: 'Universitas Muhammadiyah Prof. Dr. Hamka', tipe: 'PTS', tahunBerdiri: 1957, akreditasi: 'Unggul', worldRank: '#5800±', lokasi: 'Jakarta', mahasiswa: '±30.000' },
    { rank: 57, nama: 'Universitas Sriwijaya', tipe: 'PTN', tahunBerdiri: 1960, akreditasi: 'Unggul', worldRank: '#1558', lokasi: 'Palembang', mahasiswa: '±35.000' },
    { rank: 58, nama: 'UIN Sunan Kalijaga Yogyakarta', tipe: 'PTN', tahunBerdiri: 1951, akreditasi: 'Unggul', worldRank: '#1981', lokasi: 'Sleman', mahasiswa: '±22.000' },
    { rank: 59, nama: 'Universitas Pendidikan Ganesha', tipe: 'PTN', tahunBerdiri: 2006, akreditasi: 'Unggul', worldRank: '#6200±', lokasi: 'Singaraja', mahasiswa: '±12.000' },
    { rank: 60, nama: 'Universitas Sam Ratulangi', tipe: 'PTN', tahunBerdiri: 1965, akreditasi: 'Unggul', worldRank: '#2045', lokasi: 'Manado', mahasiswa: '±31.000' },
    { rank: 61, nama: 'Universitas Islam Sultan Agung', tipe: 'PTS', tahunBerdiri: 1962, akreditasi: 'Unggul', worldRank: '#7435', lokasi: 'Semarang', mahasiswa: '±25.000' },
    { rank: 62, nama: 'Universitas Kristen Petra', tipe: 'PTS', tahunBerdiri: 1961, akreditasi: 'Unggul', worldRank: '#2579', lokasi: 'Surabaya', mahasiswa: '±10.000' },
    { rank: 63, nama: 'Universitas Halu Oleo', tipe: 'PTN', tahunBerdiri: 1981, akreditasi: 'Unggul', worldRank: '#2200', lokasi: 'Kendari', mahasiswa: '±25.000' },
    { rank: 64, nama: 'Universitas Sultan Ageng Tirtayasa', tipe: 'PTN', tahunBerdiri: 1981, akreditasi: 'Unggul', worldRank: '#7470', lokasi: 'Serang', mahasiswa: '±28.000' },
    { rank: 65, nama: 'Universitas Riau', tipe: 'PTN', tahunBerdiri: 1962, akreditasi: 'Unggul', worldRank: '#1872', lokasi: 'Pekanbaru', mahasiswa: '±33.000' },
    { rank: 66, nama: 'Universitas Pelita Harapan', tipe: 'PTS', tahunBerdiri: 1994, akreditasi: 'Unggul', worldRank: '#2415', lokasi: 'Tangerang', mahasiswa: '±15.000' },
    { rank: 67, nama: 'Universitas Islam Malang', tipe: 'PTS', tahunBerdiri: 1981, akreditasi: 'Unggul', worldRank: '#6800±', lokasi: 'Malang', mahasiswa: '±20.000' },
    { rank: 68, nama: 'Universitas Atma Jaya Yogyakarta', tipe: 'PTS', tahunBerdiri: 1965, akreditasi: 'Unggul', worldRank: '#2829', lokasi: 'Sleman', mahasiswa: '±12.000' },
    { rank: 69, nama: 'Universitas Tanjungpura', tipe: 'PTN', tahunBerdiri: 1963, akreditasi: 'Unggul', worldRank: '#2266', lokasi: 'Pontianak', mahasiswa: '±30.000' },
    { rank: 70, nama: 'Universitas Mulawarman', tipe: 'PTN', tahunBerdiri: 1962, akreditasi: 'Unggul', worldRank: '#2328', lokasi: 'Samarinda', mahasiswa: '±35.000' },
    { rank: 71, nama: 'Institut Teknologi Nasional Bandung', tipe: 'PTS', tahunBerdiri: 1972, akreditasi: 'Unggul', worldRank: '#3800±', lokasi: 'Bandung', mahasiswa: '±15.000' },
    { rank: 72, nama: 'Universitas Katolik Widya Mandala Surabaya', tipe: 'PTS', tahunBerdiri: 1960, akreditasi: 'Unggul', worldRank: '#5769', lokasi: 'Surabaya', mahasiswa: '±8.000' },
    { rank: 73, nama: 'Universitas Sanata Dharma', tipe: 'PTS', tahunBerdiri: 1955, akreditasi: 'Unggul', worldRank: '#2914', lokasi: 'Sleman', mahasiswa: '±14.000' },
    { rank: 74, nama: 'Universitas Mercu Buana', tipe: 'PTS', tahunBerdiri: 1985, akreditasi: 'Unggul', worldRank: '#2855', lokasi: 'Jakarta', mahasiswa: '±35.000' },
    { rank: 75, nama: 'Universitas Negeri Makassar', tipe: 'PTN', tahunBerdiri: 1961, akreditasi: 'Unggul', worldRank: '#1761', lokasi: 'Makassar', mahasiswa: '±40.000' },
    { rank: 76, nama: 'UIN Raden Intan Lampung', tipe: 'PTN', tahunBerdiri: 1968, akreditasi: 'Unggul', worldRank: '#7200±', lokasi: 'Bandar Lampung', mahasiswa: '±22.000' },
    { rank: 77, nama: 'Universitas Palangka Raya', tipe: 'PTN', tahunBerdiri: 1963, akreditasi: 'Unggul', worldRank: '#3027', lokasi: 'Palangka Raya', mahasiswa: '±17.000' },
    { rank: 78, nama: 'UIN Alauddin Makassar', tipe: 'PTN', tahunBerdiri: 1965, akreditasi: 'Unggul', worldRank: '#7400', lokasi: 'Makassar', mahasiswa: '±24.000' },
    { rank: 79, nama: 'Universitas Tadulako', tipe: 'PTN', tahunBerdiri: 1981, akreditasi: 'Unggul', worldRank: '#1945', lokasi: 'Palu', mahasiswa: '±30.000' },
    { rank: 80, nama: 'Universitas Multimedia Nusantara', tipe: 'PTS', tahunBerdiri: 2005, akreditasi: 'Unggul', worldRank: '#5800±', lokasi: 'Tangerang', mahasiswa: '±20.000' },
    { rank: 81, nama: 'Universitas Islam Bandung', tipe: 'PTS', tahunBerdiri: 1958, akreditasi: 'Unggul', worldRank: '#6300±', lokasi: 'Bandung', mahasiswa: '±27.000' },
    { rank: 82, nama: 'UIN Raden Fatah Palembang', tipe: 'PTN', tahunBerdiri: 1964, akreditasi: 'Unggul', worldRank: '#7600±', lokasi: 'Palembang', mahasiswa: '±20.000' },
    { rank: 83, nama: 'Universitas Pasundan', tipe: 'PTS', tahunBerdiri: 1960, akreditasi: 'Unggul', worldRank: '#6600±', lokasi: 'Bandung', mahasiswa: '±30.000' },
    { rank: 84, nama: 'Universitas Kristen Duta Wacana', tipe: 'PTS', tahunBerdiri: 1985, akreditasi: 'Unggul', worldRank: '#3905', lokasi: 'Yogyakarta', mahasiswa: '±5.000' },
    { rank: 85, nama: 'Universitas Negeri Medan', tipe: 'PTN', tahunBerdiri: 1963, akreditasi: 'Unggul', worldRank: '#2175', lokasi: 'Medan', mahasiswa: '±30.000' },
    { rank: 86, nama: 'Universitas Dian Nuswantoro', tipe: 'PTS', tahunBerdiri: 1990, akreditasi: 'Unggul', worldRank: '#5500±', lokasi: 'Semarang', mahasiswa: '±20.000' },
    { rank: 87, nama: 'Universitas Nahdlatul Ulama Surabaya', tipe: 'PTS', tahunBerdiri: 2013, akreditasi: 'Unggul', worldRank: '#7800±', lokasi: 'Surabaya', mahasiswa: '±12.000' },
    { rank: 88, nama: 'Universitas Muria Kudus', tipe: 'PTS', tahunBerdiri: 1980, akreditasi: 'Unggul', worldRank: '#7000±', lokasi: 'Kudus', mahasiswa: '±15.000' },
    { rank: 89, nama: 'UIN Sultan Syarif Kasim Riau', tipe: 'PTN', tahunBerdiri: 1970, akreditasi: 'Unggul', worldRank: '#3989', lokasi: 'Pekanbaru', mahasiswa: '±25.000' },
    { rank: 90, nama: 'Universitas Kristen Satya Wacana', tipe: 'PTS', tahunBerdiri: 1956, akreditasi: 'Unggul', worldRank: '#2782', lokasi: 'Salatiga', mahasiswa: '±15.000' },
    { rank: 91, nama: 'UIN Ar-Raniry', tipe: 'PTN', tahunBerdiri: 1963, akreditasi: 'Unggul', worldRank: '#5900±', lokasi: 'Banda Aceh', mahasiswa: '±18.000' },
    { rank: 92, nama: 'Universitas Trisakti', tipe: 'PTS', tahunBerdiri: 1965, akreditasi: 'Unggul', worldRank: '#2350', lokasi: 'Jakarta', mahasiswa: '±30.000' },
    { rank: 93, nama: 'Universitas Muhammadiyah Purworejo', tipe: 'PTS', tahunBerdiri: 1964, akreditasi: 'Baik Sekali', worldRank: '#8000±', lokasi: 'Purworejo', mahasiswa: '±7.000' },
    { rank: 94, nama: 'Universitas Surabaya', tipe: 'PTS', tahunBerdiri: 1968, akreditasi: 'Unggul', worldRank: '#2912', lokasi: 'Surabaya', mahasiswa: '±12.000' },
    { rank: 95, nama: 'Universitas Katolik Soegijapranata', tipe: 'PTS', tahunBerdiri: 1964, akreditasi: 'Unggul', worldRank: '#3818', lokasi: 'Semarang', mahasiswa: '±10.000' },
    { rank: 96, nama: 'Universitas Komputer Indonesia', tipe: 'PTS', tahunBerdiri: 2000, akreditasi: 'Unggul', worldRank: '#5300±', lokasi: 'Bandung', mahasiswa: '±18.000' },
    { rank: 97, nama: 'Universitas Pertamina', tipe: 'PTS', tahunBerdiri: 2016, akreditasi: 'Unggul', worldRank: '#4900±', lokasi: 'Jakarta', mahasiswa: '±6.000' },
    { rank: 98, nama: 'Universitas Muhammadiyah Semarang', tipe: 'PTS', tahunBerdiri: 1999, akreditasi: 'Unggul', worldRank: '#6700±', lokasi: 'Semarang', mahasiswa: '±18.000' },
    { rank: 99, nama: 'Universitas AMIKOM Yogyakarta', tipe: 'PTS', tahunBerdiri: 2010, akreditasi: 'Unggul', worldRank: '#4893', lokasi: 'Sleman', mahasiswa: '±10.000' },
    { rank: 100, nama: 'Universitas Tarumanagara', tipe: 'PTS', tahunBerdiri: 1959, akreditasi: 'Unggul', worldRank: '#2777', lokasi: 'Jakarta Barat', mahasiswa: '±20.000' }
];

// Data EduRank 2026 (100 universitas)
const edurankData = [
    { rank: 1, nama: 'University of Indonesia', namaId: 'Universitas Indonesia', tipe: 'PTN', tahunBerdiri: 1950, akreditasi: 'Unggul', worldRank: '#444', lokasi: 'Depok', mahasiswa: '±47.000' },
    { rank: 2, nama: 'Gadjah Mada University', namaId: 'Universitas Gadjah Mada', tipe: 'PTN', tahunBerdiri: 1949, akreditasi: 'Unggul', worldRank: '#539', lokasi: 'Sleman', mahasiswa: '±55.000' },
    { rank: 3, nama: 'Bandung Institute of Technology', namaId: 'Institut Teknologi Bandung', tipe: 'PTN', tahunBerdiri: 1959, akreditasi: 'Unggul', worldRank: '#717', lokasi: 'Bandung', mahasiswa: '±24.000' },
    { rank: 4, nama: 'Diponegoro University', namaId: 'Universitas Diponegoro', tipe: 'PTN', tahunBerdiri: 1957, akreditasi: 'Unggul', worldRank: '#831', lokasi: 'Semarang', mahasiswa: '±38.000' },
    { rank: 5, nama: 'Bogor Agricultural University', namaId: 'Institut Pertanian Bogor', tipe: 'PTN', tahunBerdiri: 1963, akreditasi: 'Unggul', worldRank: '#860', lokasi: 'Bogor', mahasiswa: '±27.000' },
    { rank: 6, nama: 'Airlangga University', namaId: 'Universitas Airlangga', tipe: 'PTN', tahunBerdiri: 1954, akreditasi: 'Unggul', worldRank: '#873', lokasi: 'Surabaya', mahasiswa: '±40.000' },
    { rank: 7, nama: 'Padjadjaran University', namaId: 'Universitas Padjadjaran', tipe: 'PTN', tahunBerdiri: 1957, akreditasi: 'Unggul', worldRank: '#886', lokasi: 'Sumedang', mahasiswa: '±41.000' },
    { rank: 8, nama: 'Brawijaya University', namaId: 'Universitas Brawijaya', tipe: 'PTN', tahunBerdiri: 1963, akreditasi: 'Unggul', worldRank: '#918', lokasi: 'Malang', mahasiswa: '±60.000' },
    { rank: 9, nama: 'Sebelas Maret University', namaId: 'Universitas Sebelas Maret', tipe: 'PTN', tahunBerdiri: 1976, akreditasi: 'Unggul', worldRank: '#1053', lokasi: 'Surakarta', mahasiswa: '±36.000' },
    { rank: 10, nama: 'Hasanuddin University', namaId: 'Universitas Hasanuddin', tipe: 'PTN', tahunBerdiri: 1956, akreditasi: 'Unggul', worldRank: '#1175', lokasi: 'Makassar', mahasiswa: '±43.000' },
    { rank: 11, nama: 'Indonesia University of Education', namaId: 'Universitas Pendidikan Indonesia', tipe: 'PTN', tahunBerdiri: 1954, akreditasi: 'Unggul', worldRank: '#1200', lokasi: 'Bandung', mahasiswa: '±38.000' },
    { rank: 12, nama: 'Sepuluh Nopember Institute of Technology', namaId: 'Institut Teknologi Sepuluh Nopember', tipe: 'PTN', tahunBerdiri: 1960, akreditasi: 'Unggul', worldRank: '#1229', lokasi: 'Surabaya', mahasiswa: '±18.000' },
    { rank: 13, nama: 'Andalas University', namaId: 'Universitas Andalas', tipe: 'PTN', tahunBerdiri: 1956, akreditasi: 'Unggul', worldRank: '#1303', lokasi: 'Padang', mahasiswa: '±30.000' },
    { rank: 14, nama: 'Udayana University', namaId: 'Universitas Udayana', tipe: 'PTN', tahunBerdiri: 1962, akreditasi: 'Unggul', worldRank: '#1313', lokasi: 'Badung', mahasiswa: '±30.000' },
    { rank: 15, nama: 'Bina Nusantara University', namaId: 'Universitas Bina Nusantara', tipe: 'PTS', tahunBerdiri: 1981, akreditasi: 'Unggul', worldRank: '#1317', lokasi: 'Jakarta', mahasiswa: '±45.000' },
    { rank: 16, nama: 'State University of Padang', namaId: 'Universitas Negeri Padang', tipe: 'PTN', tahunBerdiri: 1999, akreditasi: 'Unggul', worldRank: '#1319', lokasi: 'Padang', mahasiswa: '±34.000' },
    { rank: 17, nama: 'Telkom University', namaId: 'Universitas Telkom', tipe: 'PTS', tahunBerdiri: 2013, akreditasi: 'Unggul', worldRank: '#1346', lokasi: 'Bandung', mahasiswa: '±31.000' },
    { rank: 18, nama: 'University of North Sumatra', namaId: 'Universitas Sumatera Utara', tipe: 'PTN', tahunBerdiri: 1952, akreditasi: 'Unggul', worldRank: '#1351', lokasi: 'Medan', mahasiswa: '±45.000' },
    { rank: 19, nama: 'State University of Yogyakarta', namaId: 'Universitas Negeri Yogyakarta', tipe: 'PTN', tahunBerdiri: 1964, akreditasi: 'Unggul', worldRank: '#1378', lokasi: 'Sleman', mahasiswa: '±35.000' },
    { rank: 20, nama: 'State University of Malang', namaId: 'Universitas Negeri Malang', tipe: 'PTN', tahunBerdiri: 1954, akreditasi: 'Unggul', worldRank: '#1400', lokasi: 'Malang', mahasiswa: '±32.000' },
    { rank: 21, nama: 'State University of Semarang', namaId: 'Universitas Negeri Semarang', tipe: 'PTN', tahunBerdiri: 1965, akreditasi: 'Unggul', worldRank: '#1408', lokasi: 'Semarang', mahasiswa: '±37.000' },
    { rank: 22, nama: 'Lampung University', namaId: 'Universitas Lampung', tipe: 'PTN', tahunBerdiri: 1965, akreditasi: 'Unggul', worldRank: '#1440', lokasi: 'Bandar Lampung', mahasiswa: '±32.000' },
    { rank: 23, nama: 'Sriwijaya University', namaId: 'Universitas Sriwijaya', tipe: 'PTN', tahunBerdiri: 1960, akreditasi: 'Unggul', worldRank: '#1558', lokasi: 'Palembang', mahasiswa: '±35.000' },
    { rank: 24, nama: 'State University of Surabaya', namaId: 'Universitas Negeri Surabaya', tipe: 'PTN', tahunBerdiri: 1964, akreditasi: 'Unggul', worldRank: '#1605', lokasi: 'Surabaya', mahasiswa: '±40.000' },
    { rank: 25, nama: 'Swiss German University', namaId: 'Universitas Swiss German', tipe: 'PTS', tahunBerdiri: 2000, akreditasi: 'Unggul', worldRank: '#1647', lokasi: 'Tangerang', mahasiswa: '±5.000' },
    { rank: 26, nama: 'University of Mataram', namaId: 'Universitas Mataram', tipe: 'PTN', tahunBerdiri: 1962, akreditasi: 'Unggul', worldRank: '#1660', lokasi: 'Mataram', mahasiswa: '±30.000' },
    { rank: 27, nama: 'Islamic University of Indonesia', namaId: 'Universitas Islam Indonesia', tipe: 'PTS', tahunBerdiri: 1945, akreditasi: 'Unggul', worldRank: '#1682', lokasi: 'Sleman', mahasiswa: '±28.000' },
    { rank: 28, nama: 'Lambung Mangkurat University', namaId: 'Universitas Lambung Mangkurat', tipe: 'PTN', tahunBerdiri: 1958, akreditasi: 'Unggul', worldRank: '#1689', lokasi: 'Banjarmasin', mahasiswa: '±27.000' },
    { rank: 29, nama: 'Syarif Hidayatullah State Islamic University Jakarta', namaId: 'UIN Syarif Hidayatullah Jakarta', tipe: 'PTN', tahunBerdiri: 1957, akreditasi: 'Unggul', worldRank: '#1704', lokasi: 'Tangerang Selatan', mahasiswa: '±31.000' },
    { rank: 30, nama: 'State University of Makassar', namaId: 'Universitas Negeri Makassar', tipe: 'PTN', tahunBerdiri: 1961, akreditasi: 'Unggul', worldRank: '#1761', lokasi: 'Makassar', mahasiswa: '±40.000' },
    { rank: 31, nama: 'Syiah Kuala University', namaId: 'Universitas Syiah Kuala', tipe: 'PTN', tahunBerdiri: 1961, akreditasi: 'Unggul', worldRank: '#1775', lokasi: 'Banda Aceh', mahasiswa: '±35.000' },
    { rank: 32, nama: 'University of Bengkulu', namaId: 'Universitas Bengkulu', tipe: 'PTN', tahunBerdiri: 1982, akreditasi: 'Unggul', worldRank: '#1783', lokasi: 'Bengkulu', mahasiswa: '±18.000' },
    { rank: 33, nama: 'Jenderal Soedirman University', namaId: 'Universitas Jenderal Soedirman', tipe: 'PTN', tahunBerdiri: 1963, akreditasi: 'Unggul', worldRank: '#1849', lokasi: 'Banyumas', mahasiswa: '±28.000' },
    { rank: 34, nama: 'University of Riau', namaId: 'Universitas Riau', tipe: 'PTN', tahunBerdiri: 1962, akreditasi: 'Unggul', worldRank: '#1872', lokasi: 'Pekanbaru', mahasiswa: '±33.000' },
    { rank: 35, nama: 'Tadulako University', namaId: 'Universitas Tadulako', tipe: 'PTN', tahunBerdiri: 1981, akreditasi: 'Unggul', worldRank: '#1945', lokasi: 'Palu', mahasiswa: '±30.000' },
    { rank: 36, nama: 'State Islamic University of Yogyakarta', namaId: 'UIN Sunan Kalijaga Yogyakarta', tipe: 'PTN', tahunBerdiri: 1951, akreditasi: 'Unggul', worldRank: '#1981', lokasi: 'Sleman', mahasiswa: '±22.000' },
    { rank: 37, nama: 'Sam Ratulangi University', namaId: 'Universitas Sam Ratulangi', tipe: 'PTN', tahunBerdiri: 1965, akreditasi: 'Unggul', worldRank: '#2045', lokasi: 'Manado', mahasiswa: '±31.000' },
    { rank: 38, nama: 'Muhammadiyah University of Yogyakarta', namaId: 'Universitas Muhammadiyah Yogyakarta', tipe: 'PTS', tahunBerdiri: 1981, akreditasi: 'Unggul', worldRank: '#2052', lokasi: 'Bantul', mahasiswa: '±30.000' },
    { rank: 39, nama: 'Jambi University', namaId: 'Universitas Jambi', tipe: 'PTN', tahunBerdiri: 1963, akreditasi: 'Unggul', worldRank: '#2077', lokasi: 'Jambi', mahasiswa: '±25.000' },
    { rank: 40, nama: 'Ahmad Dahlan University', namaId: 'Universitas Ahmad Dahlan', tipe: 'PTS', tahunBerdiri: 1994, akreditasi: 'Unggul', worldRank: '#2128', lokasi: 'Yogyakarta', mahasiswa: '±28.000' },
    { rank: 41, nama: 'State University of Medan', namaId: 'Universitas Negeri Medan', tipe: 'PTN', tahunBerdiri: 1963, akreditasi: 'Unggul', worldRank: '#2175', lokasi: 'Medan', mahasiswa: '±30.000' },
    { rank: 42, nama: 'Halu Oleo University', namaId: 'Universitas Halu Oleo', tipe: 'PTN', tahunBerdiri: 1981, akreditasi: 'Unggul', worldRank: '#2200', lokasi: 'Kendari', mahasiswa: '±25.000' },
    { rank: 43, nama: 'Maulana Malik Ibrahim State Islamic University of Malang', namaId: 'UIN Maulana Malik Ibrahim Malang', tipe: 'PTN', tahunBerdiri: 2004, akreditasi: 'Unggul', worldRank: '#2257', lokasi: 'Malang', mahasiswa: '±20.000' },
    { rank: 44, nama: 'Tanjungpura University', namaId: 'Universitas Tanjungpura', tipe: 'PTN', tahunBerdiri: 1963, akreditasi: 'Unggul', worldRank: '#2266', lokasi: 'Pontianak', mahasiswa: '±30.000' },
    { rank: 45, nama: 'Mulawarman University', namaId: 'Universitas Mulawarman', tipe: 'PTN', tahunBerdiri: 1962, akreditasi: 'Unggul', worldRank: '#2328', lokasi: 'Samarinda', mahasiswa: '±35.000' },
    { rank: 46, nama: 'Trisakti University', namaId: 'Universitas Trisakti', tipe: 'PTS', tahunBerdiri: 1965, akreditasi: 'Unggul', worldRank: '#2350', lokasi: 'Jakarta', mahasiswa: '±30.000' },
    { rank: 47, nama: 'Pelita Harapan University', namaId: 'Universitas Pelita Harapan', tipe: 'PTS', tahunBerdiri: 1994, akreditasi: 'Unggul', worldRank: '#2415', lokasi: 'Tangerang', mahasiswa: '±15.000' },
    { rank: 48, nama: 'Petra Christian University', namaId: 'Universitas Kristen Petra', tipe: 'PTS', tahunBerdiri: 1961, akreditasi: 'Unggul', worldRank: '#2579', lokasi: 'Surabaya', mahasiswa: '±10.000' },
    { rank: 49, nama: 'Christian University of Indonesia', namaId: 'Universitas Kristen Indonesia', tipe: 'PTS', tahunBerdiri: 1953, akreditasi: 'Unggul', worldRank: '#2694', lokasi: 'Jakarta', mahasiswa: '±15.000' },
    { rank: 50, nama: 'Tarumanagara University', namaId: 'Universitas Tarumanagara', tipe: 'PTS', tahunBerdiri: 1959, akreditasi: 'Unggul', worldRank: '#2777', lokasi: 'Jakarta Barat', mahasiswa: '±20.000' },
    { rank: 51, nama: 'Satya Wacana Christian University', namaId: 'Universitas Kristen Satya Wacana', tipe: 'PTS', tahunBerdiri: 1956, akreditasi: 'Unggul', worldRank: '#2782', lokasi: 'Salatiga', mahasiswa: '±15.000' },
    { rank: 52, nama: 'Atma Jaya Catholic University of Indonesia', namaId: 'Universitas Katolik Indonesia Atma Jaya', tipe: 'PTS', tahunBerdiri: 1960, akreditasi: 'Unggul', worldRank: '#2829', lokasi: 'Jakarta', mahasiswa: '±13.000' },
    { rank: 53, nama: 'Mercu Buana University', namaId: 'Universitas Mercu Buana', tipe: 'PTS', tahunBerdiri: 1985, akreditasi: 'Unggul', worldRank: '#2855', lokasi: 'Jakarta', mahasiswa: '±35.000' },
    { rank: 54, nama: 'University of Surabaya', namaId: 'Universitas Surabaya', tipe: 'PTS', tahunBerdiri: 1968, akreditasi: 'Unggul', worldRank: '#2912', lokasi: 'Surabaya', mahasiswa: '±12.000' },
    { rank: 55, nama: 'Sanata Dharma University', namaId: 'Universitas Sanata Dharma', tipe: 'PTS', tahunBerdiri: 1955, akreditasi: 'Unggul', worldRank: '#2914', lokasi: 'Sleman', mahasiswa: '±14.000' },
    { rank: 56, nama: 'Parahyangan Catholic University', namaId: 'Universitas Katolik Parahyangan', tipe: 'PTS', tahunBerdiri: 1955, akreditasi: 'Unggul', worldRank: '#2922', lokasi: 'Bandung', mahasiswa: '±16.000' },
    { rank: 57, nama: 'University of Palangka Raya', namaId: 'Universitas Palangka Raya', tipe: 'PTN', tahunBerdiri: 1963, akreditasi: 'Unggul', worldRank: '#3027', lokasi: 'Palangka Raya', mahasiswa: '±17.000' },
    { rank: 58, nama: 'Maranatha Christian University', namaId: 'Universitas Kristen Maranatha', tipe: 'PTS', tahunBerdiri: 1965, akreditasi: 'Unggul', worldRank: '#3104', lokasi: 'Bandung', mahasiswa: '±12.000' },
    { rank: 59, nama: 'President University', namaId: 'Universitas President', tipe: 'PTS', tahunBerdiri: 2004, akreditasi: 'Unggul', worldRank: '#3308', lokasi: 'Jababeka', mahasiswa: '±8.000' },
    { rank: 60, nama: 'Islamic University of Riau', namaId: 'Universitas Islam Riau', tipe: 'PTS', tahunBerdiri: 1962, akreditasi: 'Unggul', worldRank: '#3316', lokasi: 'Pekanbaru', mahasiswa: '±18.000' },
    { rank: 61, nama: 'Pakuan University', namaId: 'Universitas Pakuan', tipe: 'PTS', tahunBerdiri: 1980, akreditasi: 'Unggul', worldRank: '#3520', lokasi: 'Bogor', mahasiswa: '±15.000' },
    { rank: 62, nama: 'Esa Unggul University', namaId: 'Universitas Esa Unggul', tipe: 'PTS', tahunBerdiri: 1986, akreditasi: 'Unggul', worldRank: '#3598', lokasi: 'Jakarta', mahasiswa: '±18.000' },
    { rank: 63, nama: 'Nusa Cendana University', namaId: 'Universitas Nusa Cendana', tipe: 'PTN', tahunBerdiri: 1962, akreditasi: 'Unggul', worldRank: '#3717', lokasi: 'Kupang', mahasiswa: '±28.000' },
    { rank: 64, nama: 'National University, Indonesia', namaId: 'Universitas Nasional', tipe: 'PTS', tahunBerdiri: 1949, akreditasi: 'Unggul', worldRank: '#3753', lokasi: 'Jakarta', mahasiswa: '±22.000' },
    { rank: 65, nama: 'Soegijapranata Catholic University', namaId: 'Universitas Katolik Soegijapranata', tipe: 'PTS', tahunBerdiri: 1964, akreditasi: 'Unggul', worldRank: '#3818', lokasi: 'Semarang', mahasiswa: '±10.000' },
    { rank: 66, nama: 'Duta Wacana Christian University', namaId: 'Universitas Kristen Duta Wacana', tipe: 'PTS', tahunBerdiri: 1985, akreditasi: 'Unggul', worldRank: '#3905', lokasi: 'Yogyakarta', mahasiswa: '±5.000' },
    { rank: 67, nama: 'Muhammadiyah University of Sumatera Utara', namaId: 'Universitas Muhammadiyah Sumatera Utara', tipe: 'PTS', tahunBerdiri: 1957, akreditasi: 'Unggul', worldRank: '#3983', lokasi: 'Medan', mahasiswa: '±35.000' },
    { rank: 68, nama: 'Sulthan Syarif Kasim State Islamic University of Riau', namaId: 'UIN Sultan Syarif Kasim Riau', tipe: 'PTN', tahunBerdiri: 1970, akreditasi: 'Unggul', worldRank: '#3989', lokasi: 'Pekanbaru', mahasiswa: '±25.000' },
    { rank: 69, nama: 'Gunadarma University', namaId: 'Universitas Gunadarma', tipe: 'PTS', tahunBerdiri: 1981, akreditasi: 'Unggul', worldRank: '#4119', lokasi: 'Depok', mahasiswa: '±41.000' },
    { rank: 70, nama: 'Bakrie University', namaId: 'Universitas Bakrie', tipe: 'PTS', tahunBerdiri: 2006, akreditasi: 'Unggul', worldRank: '#4511', lokasi: 'Jakarta', mahasiswa: '±4.000' },
    { rank: 71, nama: 'University of Merdeka Malang', namaId: 'Universitas Merdeka Malang', tipe: 'PTS', tahunBerdiri: 1964, akreditasi: 'Unggul', worldRank: '#4594', lokasi: 'Malang', mahasiswa: '±18.000' },
    { rank: 72, nama: 'University of Muhammadiyah Malang', namaId: 'Universitas Muhammadiyah Malang', tipe: 'PTS', tahunBerdiri: 1965, akreditasi: 'Unggul', worldRank: '#4652', lokasi: 'Malang', mahasiswa: '±40.000' },
    { rank: 73, nama: 'Nommensen HKBP University', namaId: 'Universitas HKBP Nommensen', tipe: 'PTS', tahunBerdiri: 1954, akreditasi: 'Unggul', worldRank: '#4710', lokasi: 'Medan', mahasiswa: '±13.000' },
    { rank: 74, nama: 'University of AMIKOM Yogyakarta', namaId: 'Universitas AMIKOM Yogyakarta', tipe: 'PTS', tahunBerdiri: 2010, akreditasi: 'Unggul', worldRank: '#4893', lokasi: 'Sleman', mahasiswa: '±10.000' },
    { rank: 75, nama: 'State University of Papua', namaId: 'Universitas Negeri Papua', tipe: 'PTN', tahunBerdiri: 2000, akreditasi: 'Unggul', worldRank: '#4957', lokasi: 'Manokwari', mahasiswa: '±10.000' },
    { rank: 76, nama: 'YARSI University', namaId: 'Universitas YARSI', tipe: 'PTS', tahunBerdiri: 1967, akreditasi: 'Unggul', worldRank: '#5085', lokasi: 'Jakarta', mahasiswa: '±8.000' },
    { rank: 77, nama: 'Wijaya Putra University', namaId: 'Universitas Wijaya Putra', tipe: 'PTS', tahunBerdiri: 1981, akreditasi: 'Baik Sekali', worldRank: '#5358', lokasi: 'Surabaya', mahasiswa: '±6.000' },
    { rank: 78, nama: 'University of Bangka Belitung', namaId: 'Universitas Bangka Belitung', tipe: 'PTN', tahunBerdiri: 2006, akreditasi: 'Unggul', worldRank: '#5493', lokasi: 'Pangkalpinang', mahasiswa: '±8.000' },
    { rank: 79, nama: 'Widya Mandala Catholic University of Surabaya', namaId: 'Universitas Katolik Widya Mandala Surabaya', tipe: 'PTS', tahunBerdiri: 1960, akreditasi: 'Unggul', worldRank: '#5769', lokasi: 'Surabaya', mahasiswa: '±8.000' },
    { rank: 80, nama: 'University Putra Indonesia of Padang Yptk', namaId: 'Universitas Putra Indonesia YPTK Padang', tipe: 'PTS', tahunBerdiri: 1985, akreditasi: 'Baik Sekali', worldRank: '#5790', lokasi: 'Padang', mahasiswa: '±10.000' },
    { rank: 81, nama: 'Widya Gama University', namaId: 'Universitas Widya Gama', tipe: 'PTS', tahunBerdiri: 1971, akreditasi: 'Baik Sekali', worldRank: '#6002', lokasi: 'Malang', mahasiswa: '±5.000' },
    { rank: 82, nama: 'Wijaya Kusuma University of Surabaya', namaId: 'Universitas Wijaya Kusuma Surabaya', tipe: 'PTS', tahunBerdiri: 1981, akreditasi: 'Unggul', worldRank: '#6015', lokasi: 'Surabaya', mahasiswa: '±12.000' },
    { rank: 83, nama: 'Hang Tuah University', namaId: 'Universitas Hang Tuah', tipe: 'PTS', tahunBerdiri: 1987, akreditasi: 'Unggul', worldRank: '#6206', lokasi: 'Surabaya', mahasiswa: '±7.000' },
    { rank: 84, nama: 'YAI Persada Indonesian University', namaId: 'Universitas Persada Indonesia YAI', tipe: 'PTS', tahunBerdiri: 1985, akreditasi: 'Baik Sekali', worldRank: '#6347', lokasi: 'Jakarta', mahasiswa: '±14.000' },
    { rank: 85, nama: 'Krisnadwipayana University', namaId: 'Universitas Krisnadwipayana', tipe: 'PTS', tahunBerdiri: 1952, akreditasi: 'Unggul', worldRank: '#6380', lokasi: 'Jakarta', mahasiswa: '±10.000' },
    { rank: 86, nama: 'Abdurachman Saleh University', namaId: 'Universitas Abdurachman Saleh', tipe: 'PTS', tahunBerdiri: 1982, akreditasi: 'Baik Sekali', worldRank: '#6489', lokasi: 'Situbondo', mahasiswa: '±8.000' },
    { rank: 87, nama: 'Musamus Merauke University', namaId: 'Universitas Musamus Merauke', tipe: 'PTN', tahunBerdiri: 2010, akreditasi: 'Unggul', worldRank: '#6533', lokasi: 'Merauke', mahasiswa: '±6.000' },
    { rank: 88, nama: 'Veteran Bangun Nusantara University', namaId: 'Universitas Veteran Bangun Nusantara', tipe: 'PTS', tahunBerdiri: 1968, akreditasi: 'Baik Sekali', worldRank: '#6609', lokasi: 'Sukoharjo', mahasiswa: '±5.000' },
    { rank: 89, nama: 'Respati University of Yogyakarta', namaId: 'Universitas Respati Yogyakarta', tipe: 'PTS', tahunBerdiri: 2008, akreditasi: 'Baik Sekali', worldRank: '#6648', lokasi: 'Sleman', mahasiswa: '±4.000' },
    { rank: 90, nama: 'Surya University', namaId: 'Universitas Surya', tipe: 'PTS', tahunBerdiri: 2013, akreditasi: 'Baik Sekali', worldRank: '#7204', lokasi: 'Tangerang', mahasiswa: '±3.000' },
    { rank: 91, nama: 'State Islamic University Sunan Gunung Djati', namaId: 'UIN Sunan Gunung Djati Bandung', tipe: 'PTN', tahunBerdiri: 1968, akreditasi: 'Unggul', worldRank: '#7325', lokasi: 'Bandung', mahasiswa: '±30.000' },
    { rank: 92, nama: 'University of Jember', namaId: 'Universitas Jember', tipe: 'PTN', tahunBerdiri: 1964, akreditasi: 'Unggul', worldRank: '#7332', lokasi: 'Jember', mahasiswa: '±33.000' },
    { rank: 93, nama: 'State University of Jakarta', namaId: 'Universitas Negeri Jakarta', tipe: 'PTN', tahunBerdiri: 1964, akreditasi: 'Unggul', worldRank: '#7355', lokasi: 'Jakarta', mahasiswa: '±33.000' },
    { rank: 94, nama: 'Alauddin State Islamic University', namaId: 'UIN Alauddin Makassar', tipe: 'PTN', tahunBerdiri: 1965, akreditasi: 'Unggul', worldRank: '#7400', lokasi: 'Makassar', mahasiswa: '±24.000' },
    { rank: 95, nama: 'University of Pembangunan Nasional Veteran, Jakarta', namaId: 'UPN Veteran Jakarta', tipe: 'PTN', tahunBerdiri: 2014, akreditasi: 'Unggul', worldRank: '#7432', lokasi: 'Jakarta', mahasiswa: '±22.000' },
    { rank: 96, nama: 'Sultan Agung Islamic University', namaId: 'Universitas Islam Sultan Agung', tipe: 'PTS', tahunBerdiri: 1962, akreditasi: 'Unggul', worldRank: '#7435', lokasi: 'Semarang', mahasiswa: '±25.000' },
    { rank: 97, nama: 'Sultan Ageng Tirtayasa University', namaId: 'Universitas Sultan Ageng Tirtayasa', tipe: 'PTN', tahunBerdiri: 1981, akreditasi: 'Unggul', worldRank: '#7470', lokasi: 'Serang', mahasiswa: '±28.000' },
    { rank: 98, nama: 'Muhammadiyah University of Jakarta', namaId: 'Universitas Muhammadiyah Jakarta', tipe: 'PTS', tahunBerdiri: 1955, akreditasi: 'Unggul', worldRank: '#7484', lokasi: 'Tangerang Selatan', mahasiswa: '±24.000' },
    { rank: 99, nama: 'Muhammadiyah University of Surakarta', namaId: 'Universitas Muhammadiyah Surakarta', tipe: 'PTS', tahunBerdiri: 1981, akreditasi: 'Unggul', worldRank: '#7502', lokasi: 'Surakarta', mahasiswa: '±35.000' },
    { rank: 100, nama: 'University of Medan Area', namaId: 'Universitas Medan Area', tipe: 'PTS', tahunBerdiri: 1983, akreditasi: 'Unggul', worldRank: '#7515', lokasi: 'Medan', mahasiswa: '±20.000' }
];

// Data QS 2026 (26 universitas)
const qsData = [
    { rank: 1, nama: 'Universitas Indonesia', tipe: 'PTN', tahunBerdiri: 1849, akreditasi: 'Unggul', worldRank: '#189', lokasi: 'Depok', mahasiswa: '±47.000' },
    { rank: 2, nama: 'Universitas Gadjah Mada', tipe: 'PTN', tahunBerdiri: 1949, akreditasi: 'Unggul', worldRank: '#224', lokasi: 'Sleman', mahasiswa: '±55.000' },
    { rank: 3, nama: 'Institut Teknologi Bandung', tipe: 'PTN', tahunBerdiri: 1920, akreditasi: 'Unggul', worldRank: '#255', lokasi: 'Bandung', mahasiswa: '±25.000' },
    { rank: 4, nama: 'Universitas Airlangga', tipe: 'PTN', tahunBerdiri: 1954, akreditasi: 'Unggul', worldRank: '#287', lokasi: 'Surabaya', mahasiswa: '±43.000' },
    { rank: 5, nama: 'IPB University', tipe: 'PTN', tahunBerdiri: 1963, akreditasi: 'Unggul', worldRank: '#399', lokasi: 'Bogor', mahasiswa: '±28.000' },
    { rank: 6, nama: 'Institut Teknologi Sepuluh Nopember', tipe: 'PTN', tahunBerdiri: 1957, akreditasi: 'Unggul', worldRank: '#509', lokasi: 'Surabaya', mahasiswa: '±22.000' },
    { rank: 7, nama: 'Universitas Padjadjaran', tipe: 'PTN', tahunBerdiri: 1957, akreditasi: 'Unggul', worldRank: '#515', lokasi: 'Sumedang/Bandung', mahasiswa: '±48.000' },
    { rank: 8, nama: 'Universitas Diponegoro', tipe: 'PTN', tahunBerdiri: 1957, akreditasi: 'Unggul', worldRank: '#624', lokasi: 'Semarang', mahasiswa: '±52.000' },
    { rank: 9, nama: 'Universitas Brawijaya', tipe: 'PTN', tahunBerdiri: 1963, akreditasi: 'Unggul', worldRank: '#680', lokasi: 'Malang', mahasiswa: '±70.000' },
    { rank: 10, nama: 'Bina Nusantara University', tipe: 'PTS', tahunBerdiri: 1974, akreditasi: 'Unggul', worldRank: '#851–900', lokasi: 'Jakarta', mahasiswa: '±40.000' },
    { rank: 11, nama: 'Universitas Hasanuddin', tipe: 'PTN', tahunBerdiri: 1956, akreditasi: 'Unggul', worldRank: '#951–1000', lokasi: 'Makassar', mahasiswa: '±38.000' },
    { rank: 12, nama: 'Universitas Sebelas Maret', tipe: 'PTN', tahunBerdiri: 1976, akreditasi: 'Unggul', worldRank: '#1001–1200', lokasi: 'Surakarta', mahasiswa: '±36.000' },
    { rank: 13, nama: 'Telkom University', tipe: 'PTS', tahunBerdiri: 2013, akreditasi: 'Unggul', worldRank: '#1001–1200', lokasi: 'Bandung', mahasiswa: '±31.000' },
    { rank: 14, nama: 'Universitas Sumatera Utara', tipe: 'PTN', tahunBerdiri: 1952, akreditasi: 'Unggul', worldRank: '#1001–1200', lokasi: 'Medan', mahasiswa: '±40.000' },
    { rank: 15, nama: 'Institut Teknologi Nasional Bandung', tipe: 'PTS', tahunBerdiri: 1972, akreditasi: 'Baik Sekali', worldRank: '#1201–1400', lokasi: 'Bandung', mahasiswa: '±15.000' },
    { rank: 16, nama: 'Universitas Muhammadiyah Yogyakarta', tipe: 'PTS', tahunBerdiri: 1981, akreditasi: 'Unggul', worldRank: '#1201–1400', lokasi: 'Bantul', mahasiswa: '±29.000' },
    { rank: 17, nama: 'Universitas Negeri Yogyakarta', tipe: 'PTN', tahunBerdiri: 1964, akreditasi: 'Unggul', worldRank: '#1201–1400', lokasi: 'Sleman', mahasiswa: '±35.000' },
    { rank: 18, nama: 'Universitas Pendidikan Indonesia', tipe: 'PTN', tahunBerdiri: 1954, akreditasi: 'Unggul', worldRank: '#1201–1400', lokasi: 'Bandung', mahasiswa: '±42.000' },
    { rank: 19, nama: 'Universitas Trisakti', tipe: 'PTS', tahunBerdiri: 1965, akreditasi: 'Unggul', worldRank: '#1201–1400', lokasi: 'Jakarta', mahasiswa: '±30.000' },
    { rank: 20, nama: 'Universitas Katolik Indonesia Atma Jaya', tipe: 'PTS', tahunBerdiri: 1960, akreditasi: 'Unggul', worldRank: '#1401+', lokasi: 'Jakarta', mahasiswa: '±13.000' },
    { rank: 21, nama: 'Universitas Islam Indonesia', tipe: 'PTS', tahunBerdiri: 1945, akreditasi: 'Unggul', worldRank: '#1401+', lokasi: 'Sleman', mahasiswa: '±28.000' },
    { rank: 22, nama: 'Universitas Kristen Petra', tipe: 'PTS', tahunBerdiri: 1961, akreditasi: 'Unggul', worldRank: '#1401+', lokasi: 'Surabaya', mahasiswa: '±10.000' },
    { rank: 23, nama: 'Universitas Negeri Malang', tipe: 'PTN', tahunBerdiri: 1954, akreditasi: 'Unggul', worldRank: '#1401+', lokasi: 'Malang', mahasiswa: '±32.000' },
    { rank: 24, nama: 'Universitas Andalas', tipe: 'PTN', tahunBerdiri: 1955, akreditasi: 'Unggul', worldRank: '#1401+', lokasi: 'Padang', mahasiswa: '±30.000' },
    { rank: 25, nama: 'Universitas Negeri Padang', tipe: 'PTN', tahunBerdiri: 1954, akreditasi: 'Unggul', worldRank: '#1401+', lokasi: 'Padang', mahasiswa: '±37.000' },
    { rank: 26, nama: 'Universitas Syiah Kuala', tipe: 'PTN', tahunBerdiri: 1961, akreditasi: 'Unggul', worldRank: '#1401+', lokasi: 'Banda Aceh', mahasiswa: '±35.000' }
];

// ============================================================
// FUNGSI UTAMA
// ============================================================

let currentTab = 'unirank';
let searchQuery = '';

// Render tabel
function renderTable(data, tbodyId, source) {
    const tbody = document.getElementById(tbodyId);
    
    if (data.length === 0) {
        tbody.innerHTML = `<tr><td colspan="8" class="empty-state"><i class="fas fa-search"></i><p>Tidak ada universitas ditemukan untuk "${searchQuery}"</p></td></tr>`;
        return;
    }
    
    tbody.innerHTML = data.map((uni, index) => {
        let rankClass = '';
        if (uni.rank === 1) rankClass = 'rank-1';
        else if (uni.rank === 2) rankClass = 'rank-2';
        else if (uni.rank === 3) rankClass = 'rank-3';
        
        return `
            <tr onclick="showDetail('${source}', ${index}, event)" class="clickable-row">
                <td><span class="rank-number ${rankClass}">#${uni.rank}</span></td>
                <td><span class="univ-name">${uni.nama}</span></td>
                <td><span class="tipe-badge tipe-${uni.tipe}">${uni.tipe}</span></td>
                <td>${uni.tahunBerdiri}</td>
                <td>${uni.akreditasi}</td>
                <td><span class="world-rank">${uni.worldRank}</span></td>
                <td>${uni.lokasi}</td>
                <td>${uni.mahasiswa}</td>
            </tr>
        `;
    }).join('');
    
    // Update search result info
    updateSearchInfo(data.length);
}

// Update info hasil pencarian
function updateSearchInfo(count) {
    const infoEl = document.getElementById('searchResultInfo');
    if (searchQuery) {
        infoEl.style.display = 'block';
        infoEl.innerHTML = `<i class="fas fa-info-circle"></i> Ditemukan <strong>${count}</strong> universitas untuk pencarian "<strong>${searchQuery}</strong>"`;
    } else {
        infoEl.style.display = 'none';
    }
}

// Filter data berdasarkan pencarian
function filterData(data) {
    if (!searchQuery) return data;
    const query = searchQuery.toLowerCase();
    return data.filter(uni => 
        uni.nama.toLowerCase().includes(query) ||
        uni.lokasi.toLowerCase().includes(query) ||
        uni.tipe.toLowerCase().includes(query) ||
        uni.akreditasi.toLowerCase().includes(query)
    );
}

// Load data ke tabel
function loadCurrentTab() {
    let data, tbodyId, source;
    
    if (currentTab === 'unirank') {
        data = filterData(unirankData);
        tbodyId = 'unirankBody';
        source = 'unirank';
    } else if (currentTab === 'edurank') {
        data = filterData(edurankData);
        tbodyId = 'edurankBody';
        source = 'edurank';
    } else {
        data = filterData(qsData);
        tbodyId = 'qsBody';
        source = 'qs';
    }
    
    renderTable(data, tbodyId, source);
}

// Switch tab
function switchTab(tab) {
    currentTab = tab;
    
    // Update tab buttons
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.tab === tab);
    });
    
    // Update table sections
    document.querySelectorAll('.table-section').forEach(section => {
        section.classList.remove('active');
    });
    document.getElementById(`${tab}Section`).classList.add('active');
    
    loadCurrentTab();
}

// Pencarian
document.getElementById('searchInput').addEventListener('input', function(e) {
    searchQuery = this.value.trim();
    
    // Show/hide clear button
    document.getElementById('btnClear').style.display = searchQuery ? 'block' : 'none';
    
    loadCurrentTab();
});

// Clear search
function clearSearch() {
    searchQuery = '';
    document.getElementById('searchInput').value = '';
    document.getElementById('btnClear').style.display = 'none';
    document.getElementById('searchResultInfo').style.display = 'none';
    loadCurrentTab();
}

// Detail universitas
function showDetail(source, index, event) {
    let data;
    if (source === 'unirank') {
        data = filterData(unirankData)[index];
    } else if (source === 'edurank') {
        data = filterData(edurankData)[index];
    } else {
        data = filterData(qsData)[index];
    }
    
    if (!data) return;
    
    const modalBody = document.getElementById('modalBody');
    const initials = data.nama.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    
    modalBody.innerHTML = `
        <div class="modal-univ-header">
            <div class="modal-univ-icon">${initials}</div>
            <div class="modal-univ-info">
                <h3>${data.nama}</h3>
                <span class="tipe-badge tipe-${data.tipe}">${data.tipe} (${data.tipe === 'PTN' ? 'Perguruan Tinggi Negeri' : 'Perguruan Tinggi Swasta'})</span>
            </div>
        </div>
        <div class="detail-grid">
            <div class="detail-item">
                <label>Tahun Berdiri</label>
                <span>${data.tahunBerdiri}</span>
            </div>
            <div class="detail-item">
                <label>Akreditasi</label>
                <span>${data.akreditasi}</span>
            </div>
            <div class="detail-item">
                <label>Peringkat Nasional</label>
                <span>#${data.rank}</span>
            </div>
            <div class="detail-item">
                <label>Peringkat Dunia</label>
                <span>${data.worldRank}</span>
            </div>
            <div class="detail-item">
                <label>Lokasi</label>
                <span>${data.lokasi}</span>
            </div>
            <div class="detail-item">
                <label>Jumlah Mahasiswa</label>
                <span>${data.mahasiswa}</span>
            </div>
        </div>
        <div class="detail-versi">
            <i class="fas fa-info-circle"></i> 
            Data berdasarkan: <strong>${source === 'unirank' ? 'uniRank 2026' : source === 'edurank' ? 'EduRank 2026' : 'QS World University Rankings 2026'}</strong>
        </div>
    `;
    
    document.getElementById('modalOverlay').classList.add('active');
    document.body.style.overflow = 'hidden';
}

// Close modal
function closeModal() {
    document.getElementById('modalOverlay').classList.remove('active');
    document.body.style.overflow = '';
}

// Scroll to top
function scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Back to top button visibility
window.addEventListener('scroll', () => {
    const btn = document.getElementById('btnBackTop');
    if (window.scrollY > 400) {
        btn.classList.add('visible');
    } else {
        btn.classList.remove('visible');
    }
});

// Keyboard shortcuts
document.addEventListener('keydown', function(e) {
    // Escape to close modal
    if (e.key === 'Escape') {
        closeModal();
    }
    
    // Ctrl+K or Ctrl+F to focus search
    if ((e.ctrlKey || e.metaKey) && (e.key === 'k' || e.key === 'f')) {
        e.preventDefault();
        document.getElementById('searchInput').focus();
    }
});

// Tab buttons
document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', function() {
        switchTab(this.dataset.tab);
    });
});

// Init
document.addEventListener('DOMContentLoaded', () => {
    // Hide preloader
    setTimeout(() => {
        document.getElementById('preloader').classList.add('hide');
    }, 600);
    
    // Load default tab
    switchTab('unirank');
});
