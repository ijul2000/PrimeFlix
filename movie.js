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
  const watchNowBtn = document.getElementById('watchNowBtn');

  const params = new URLSearchParams(window.location.search);
  const id = params.get('id');
  const type = params.get('type') || 'movie';

  // Butang "Tonton Sekarang" — bawa ke pemain (watch.html) dengan id & type
  // yang sama, supaya watch.html tahu rekod mana nak dimainkan.
  if (watchNowBtn) {
    watchNowBtn.addEventListener('click', () => {
      if (!id) return;
      const typeParam = type === 'tvshow' ? '&type=tvshow' : '';
      window.location.href = `watch.html?id=${encodeURIComponent(id)}${typeParam}`;
    });
  }

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

  // Cache yang sama dipakai oleh index.html (Hero & kedua-dua grid
  // Trending). Bila pengguna klik poster dari halaman utama, data ni
  // biasanya dah ada dalam sessionStorage — jadi butiran movie/TV show
  // boleh terpapar serta-merta tanpa tunggu fetch baharu ke Apps Script.
  const CONTENT_CACHE_KEY = 'primeflix_content_cache_v1';

  function readContentCache() {
    try {
      const raw = sessionStorage.getItem(CONTENT_CACHE_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      if (!parsed || typeof parsed !== 'object') return null;
      const movie = Array.isArray(parsed.movie) ? parsed.movie : [];
      const tvshow = Array.isArray(parsed.tvshow) ? parsed.tvshow : [];
      if (!movie.length && !tvshow.length) return null;
      return { movie: movie, tvshow: tvshow };
    } catch (err) {
      return null;
    }
  }

  function writeContentCache(data) {
    try {
      sessionStorage.setItem(CONTENT_CACHE_KEY, JSON.stringify(data));
    } catch (err) {
      // sessionStorage tak tersedia / penuh — abaikan, tak kritikal.
    }
  }

  async function loadDetail() {
    // 1) Cuba papar terus dari cache (kalau ada) — biasanya ada, sebab
    //    pengguna baru sahaja klik poster dari halaman utama.
    let shownFromCache = false;
    const cached = readContentCache();
    if (cached) {
      const list = cached[type] || [];
      const cachedRecord = list.find(r => String(r.ID) === String(id));
      if (cachedRecord) {
        renderDetail(cachedRecord);
        shownFromCache = true;
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

      // Kemaskan cache bagi kategori ini sahaja, kekalkan kategori lain.
      writeContentCache(Object.assign(
        { movie: [], tvshow: [] },
        cached,
        { [type]: json.data }
      ));

      const record = json.data.find(r => String(r.ID) === String(id));
      if (!record) {
        if (!shownFromCache) {
          titleEl.textContent = 'Rekod tidak dijumpai.';
          descEl.textContent = type === 'tvshow' ? 'TV show yang anda cari mungkin telah dipadam.' : 'Filem yang anda cari mungkin telah dipadam.';
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
    const metaParts = [record.Year, record.Genre];
    if (type === 'tvshow') {
      if (record.Season) metaParts.push(`Musim ${record.Season}`);
      if (record.Episode) metaParts.push(`Episod ${record.Episode}`);
    }
    metaEl.textContent = metaParts.filter(Boolean).join(' · ');
    descEl.textContent = record.Description || '';
    document.title = `${record.Title || 'Butiran Filem'} — Prime Flix`;
  }

  loadDetail();
});
