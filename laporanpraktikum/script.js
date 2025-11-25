
/* ---- Utility: mode & theme storage helpers ---- */
const Storage = {
  getMode() {
    // 'rapi' atau 'berantakan'
    return localStorage.getItem('displayMode') || 'rapi';
  },
  setMode(mode) {
    localStorage.setItem('displayMode', mode);
  },
  getTheme() {
    // misal: 'theme-hijau', 'theme-coklat', 'theme-ungu', 'theme-pink'
    return localStorage.getItem('siteTheme') || null;
  },
  setTheme(themeClass) {
    if (themeClass) localStorage.setItem('siteTheme', themeClass);
  }
};

/* ---- Helper untuk apply kelas pada body ---- */
function applyModeToBody(mode) {
  const body = document.body;
  if (!body) return;
  body.classList.remove('mode-rapi', 'mode-berantakan');
  if (mode === 'berantakan') body.classList.add('mode-berantakan');
  else body.classList.add('mode-rapi');
}

function applyThemeToBody(themeClass) {
  const body = document.body;
  if (!body) return;
  // Hapus semua theme-* yang mungkin ada (konvensi: class dimulai 'theme-')
  Array.from(body.classList)
    .filter(c => c.startsWith('theme-'))
    .forEach(c => body.classList.remove(c));
  if (themeClass) body.classList.add(themeClass);
}

/* ---- Inisialisasi umum (dipanggil saat DOM siap) ---- */
function initCommon() {
  // Terapkan mode tersimpan
  const savedMode = Storage.getMode();
  applyModeToBody(savedMode);

  // Terapkan theme jika tersimpan (jika ada)
  const savedTheme = Storage.getTheme();
  if (savedTheme) applyThemeToBody(savedTheme);

  // Pasang handler toggle-mode bila ada
  const toggleBtn = document.getElementById('toggle-mode');
  if (toggleBtn) {
    toggleBtn.addEventListener('click', () => {
      const current = Storage.getMode();
      const next = current === 'berantakan' ? 'rapi' : 'berantakan';
      Storage.setMode(next);
      applyModeToBody(next);
    });
  }

  // Tombol Tampilkan Gambar (index.html)
  const showImagesBtn = document.getElementById('show-images');
  if (showImagesBtn) {
    showImagesBtn.addEventListener('click', () => {
      const themeClass = Array.from(document.body.classList).find(c => c.startsWith('theme-'));
      if (themeClass) Storage.setTheme(themeClass);
      // Navigasi ke halaman gambar
      window.location.href = 'gambar.html';
    });
  }
}

/* ---- Fungsi untuk membuat interaksi klik pada judul ----
   Ketentuan PDF:
   - Saat judul diklik, munculkan pertanyaan:
     "Apakah Anda ingin menyembunyikan penjelasan ini?"
     Jika setuju -> sembunyikan paragraf penjelasan (desc).
   - Jika paragraf sudah tersembunyi dan judul diklik, tanyakan:
     "Apakah Anda ingin menampilkan penjelasan ini?"
     Jika setuju -> tampilkan kembali.
*/
function initTitleInteractions() {
  // Ambil semua elemen judul (selector sesuai kode HTML: .title)
  const titles = document.querySelectorAll('.title');
  if (!titles || titles.length === 0) return;

  titles.forEach(title => {
    title.style.cursor = 'pointer';
    title.addEventListener('click', () => {
      // Cari parent .issue untuk mendapatkan data-index (jika ada)
      const parent = title.closest('.issue');
      let desc = null;

      if (parent) {
        const idx = parent.getAttribute('data-index');
        if (idx) desc = document.getElementById('desc-' + idx);
      }

      // Fallback: jika struktur berbeda, coba cari elemen <p> di dalam .issue
      if (!desc && parent) desc = parent.querySelector('.desc');

      // Jika belum ketemu, coba cari paragraf langsung setelah judul
      if (!desc) {
        const next = title.nextElementSibling;
        if (next && next.classList && next.classList.contains('desc')) desc = next;
      }

      if (!desc) {
        // Tidak ada deskripsi — jangan crash. Bisa jadi halaman lain.
        console.warn('Deskripsi tidak ditemukan untuk judul:', title.textContent);
        return;
      }

      const isHidden = window.getComputedStyle(desc).display === 'none';

      if (isHidden) {
        const yes = confirm('Apakah Anda ingin menampilkan penjelasan ini?');
        if (yes) {
          desc.style.removeProperty('display'); // kembalikan ke style default
        }
      } else {
        const yes = confirm('Apakah Anda ingin menyembunyikan penjelasan ini?');
        if (yes) {
          desc.style.display = 'none';
        }
      }
    });
  });
}

/* ---- Halaman gambar: pastikan mode rapi & theme konsisten ----
   Ketentuan tugas: halaman kedua harus mengikuti tema yang sama
   dengan halaman pertama dan "mengikuti mode tampilan rapi".
   Jadi: paksa mode rapi di sini, tapi gunakan theme dari localStorage.
*/
function initImagesPage() {
  // Jika ini halaman gambar (cek container gallery atau id 'back' ), jalankan penyesuaian.
  const gallery = document.querySelector('.images-page .gallery');
  const backBtn = document.getElementById('back');

  if (!gallery && !backBtn) return; // bukan halaman gambar -> keluar

  // Paksa mode rapi di halaman gambar (tidak perlu mode berantakan di sini)
  applyModeToBody('rapi');

  // Terapkan theme yang tersimpan (jika ada)
  const savedTheme = Storage.getTheme();
  if (savedTheme) applyThemeToBody(savedTheme);

  // Tombol Kembali
  if (backBtn) {
    backBtn.addEventListener('click', () => {
      // Kembali ke index.html (index akan membaca localStorage untuk mode)
      window.location.href = 'index.html';
    });
  }

  // Optimalisasi gambar: atur alt jika kosong (tidak wajib, tapi membantu aksesibilitas)
  const imgs = gallery ? gallery.querySelectorAll('img') : [];
  imgs.forEach((img, i) => {
    if (!img.alt || img.alt.trim() === '') img.alt = `Gambar pencemaran ${i + 1}`;
  });
}

/* ---- On DOM ready: jalankan inisialisasi ---- */
window.addEventListener('DOMContentLoaded', () => {
  try {
    initCommon();
    initTitleInteractions();
    initImagesPage();
  } catch (err) {
    console.error('Terjadi kesalahan inisialisasi script:', err);
  }
});

/* ---- (Opsional) Fungsi util buat pengembang: setThemeFromIdentity
   Jika kamu ingin mengatur tema secara terprogram (mis. dari form),
   bisa panggil setThemeFromIdentity('theme-hijau') dan fungsi menyimpan ke localStorage.
*/
function setThemeFromIdentity(themeClass) {
  applyThemeToBody(themeClass);
  Storage.setTheme(themeClass);
}

/* Contoh penggunaan (tidak dieksekusi otomatis):
   // setThemeFromIdentity('theme-hijau');
   // setThemeFromIdentity('theme-coklat');
   // setThemeFromIdentity('theme-ungu');
   // setThemeFromIdentity('theme-pink');
*/