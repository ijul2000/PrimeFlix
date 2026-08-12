// =========================================================
// PRIME FLIX — page butiran movie (movie.html)
// =========================================================

// Guna URL Web App yang sama seperti script.js
const WEBAPP_URL = 'https://script.google.com/macros/s/AKfycbydLAqC63yo3LXJXMXpRyJNH4KYc5wtmstaewPa-NAnklQvV2JSCv28JdfWNiJsma51fQ/exec';

document.addEventListener('DOMContentLoaded', () => {

  const backdropImg = document.getElementById('detailBackdropImg');
  const metaEl = document.getElementById('detailMeta');
  const titleEl = document.getElementById('detailTitle');
  const descEl = document.getElementById('detailDesc');

  const params = new URLSearchParams(window.location.search);
  const id = params.get('id');
  const type = params.get('type') || 'movie';

  if (!id) {
    titleEl.textContent = 'Rekod tidak dijumpai.';
    descEl.textContent = 'Tiada ID diberikan dalam pautan.';
    return;
  }

  if (typeof WEBAPP_URL !== 'string' || WEBAPP_URL.indexOf('GANTI_DENGAN') !== -1) {
    titleEl.textContent = 'WEBAPP_URL belum ditetapkan.';
    descEl.textContent = 'Sila tetapkan WEBAPP_URL dalam movie.js untuk papar butiran filem.';
    return;
  }

  // Cache yang sama dipakai oleh index.html (Hero & Filem Trending).
  // Bila pengguna klik poster dari halaman utama, data ni biasanya
  // dah ada dalam sessionStorage — jadi butiran movie boleh terpapar
  // serta-merta tanpa tunggu fetch baharu ke Apps Script.
  const MOVIES_CACHE_KEY = 'primeflix_movies_cache_v1';

  function readMoviesCache() {
    try {
      const raw = sessionStorage.getItem(MOVIES_CACHE_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) && parsed.length ? parsed : null;
    } catch (err) {
      return null;
    }
  }

  function writeMoviesCache(data) {
    try {
      sessionStorage.setItem(MOVIES_CACHE_KEY, JSON.stringify(data));
    } catch (err) {
      // sessionStorage tak tersedia / penuh — abaikan, tak kritikal.
    }
  }

  async function loadDetail() {
    // 1) Cuba papar terus dari cache (kalau ada) — biasanya ada, sebab
    //    pengguna baru sahaja klik poster dari halaman utama.
    let shownFromCache = false;
    if (type === 'movie') {
      const cached = readMoviesCache();
      if (cached) {
        const cachedRecord = cached.find(r => String(r.ID) === String(id));
        if (cachedRecord) {
          renderDetail(cachedRecord);
          shownFromCache = true;
        }
      }
    }

    // 2) Tetap fetch data terkini di latar belakang — untuk kemaskan
    //    butiran (jika ada perubahan) dan sebagai fallback bila cache
    //    tiada (cth. pautan dibuka terus tanpa lalui halaman utama).
    try {
      const res = await fetch(`${WEBAPP_URL}?action=list&type=${encodeURIComponent(type)}`);
      const json = await res.json();
      if (!json.ok || !Array.isArray(json.data)) {
        throw new Error(json.error || 'Gagal memuatkan data.');
      }

      if (type === 'movie') writeMoviesCache(json.data);

      const record = json.data.find(r => String(r.ID) === String(id));
      if (!record) {
        if (!shownFromCache) {
          titleEl.textContent = 'Rekod tidak dijumpai.';
          descEl.textContent = 'Filem yang anda cari mungkin telah dipadam.';
        }
        return;
      }

      renderDetail(record);
    } catch (err) {
      if (!shownFromCache) {
        titleEl.textContent = 'Gagal memuatkan butiran.';
        descEl.textContent = 'Sila cuba semula sebentar lagi.';
      }
    }
  }

  function renderDetail(record) {
    backdropImg.style.backgroundImage = record.Backdrop ? `url("${record.Backdrop}")` : 'none';
    titleEl.textContent = record.Title || '';
    metaEl.textContent = [record.Year, record.Genre].filter(Boolean).join(' · ');
    descEl.textContent = record.Description || '';
    document.title = `${record.Title || 'Butiran Filem'} — Prime Flix`;
  }

  loadDetail();
});
