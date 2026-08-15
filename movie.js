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

  const movieActions = document.getElementById('movieActions');
  const watchNowBtn = document.getElementById('watchNowBtn');
  const movieWatchlistBtn = document.getElementById('movieWatchlistBtn');

  const tvActions = document.getElementById('tvActions');
  const seasonSelectLabel = document.getElementById('seasonSelectLabel');
  const episodeSelectBtn = document.getElementById('episodeSelectBtn');
  const episodeSelectLabel = document.getElementById('episodeSelectLabel');
  const episodeDropdown = document.getElementById('episodeDropdown');
  const tvWatchlistBtn = document.getElementById('tvWatchlistBtn');

  const params = new URLSearchParams(window.location.search);
  const id = params.get('id');
  const type = params.get('type') || 'movie';

  // Butang "Back to Site" — untuk TV show, set flag sekali-guna supaya
  // halaman utama (index.html) terus buka pada navbar/seksyen "TV Show"
  // (bukan Movie default). Guna sessionStorage, bukan URL hash, supaya
  // page tak auto-scroll turun dan flag tak "tersangkut" bila refresh.
  const backToSiteLink = document.getElementById('backToSiteLink');
  if (backToSiteLink) {
    backToSiteLink.addEventListener('click', () => {
      if (type === 'tvshow') {
        sessionStorage.setItem('primeflix_open_category', 'tvshow');
      }
    });
  }

  /* =========================================================
     SENARAI SAYA (Watch List) — sama seperti script.js, disimpan
     dalam localStorage supaya dikongsi merentasi halaman.
     ========================================================= */
  const WATCHLIST_KEY = 'primeflix_watchlist_v1';

  function readWatchlist() {
    try {
      const raw = localStorage.getItem(WATCHLIST_KEY);
      const parsed = raw ? JSON.parse(raw) : null;
      return {
        movie: Array.isArray(parsed && parsed.movie) ? parsed.movie : [],
        tvshow: Array.isArray(parsed && parsed.tvshow) ? parsed.tvshow : []
      };
    } catch (err) {
      return { movie: [], tvshow: [] };
    }
  }

  function writeWatchlist(data) {
    try {
      localStorage.setItem(WATCHLIST_KEY, JSON.stringify(data));
    } catch (err) {
      // localStorage tak tersedia / penuh — abaikan, tak kritikal.
    }
  }

  function isInWatchlist(wlType, wlId) {
    if (!wlId) return false;
    const wl = readWatchlist();
    return (wl[wlType] || []).some(r => String(r.ID) === String(wlId));
  }

  function addToWatchlist(wlType, record) {
    if (!record || !record.ID) return;
    const wl = readWatchlist();
    if (!wl[wlType]) wl[wlType] = [];
    if (wl[wlType].some(r => String(r.ID) === String(record.ID))) return;
    wl[wlType].unshift({
      ID: record.ID,
      Title: record.Title || '',
      Year: record.Year || '',
      Genre: record.Genre || '',
      Season: record.Season || '',
      Poster: record.Poster || '',
      Badge: record.Badge || ''
    });
    writeWatchlist(wl);
  }

  function removeFromWatchlist(wlType, wlId) {
    const wl = readWatchlist();
    wl[wlType] = (wl[wlType] || []).filter(r => String(r.ID) !== String(wlId));
    writeWatchlist(wl);
  }

  function toggleWatchlist(wlType, record) {
    if (!record || !record.ID) return;
    if (isInWatchlist(wlType, record.ID)) {
      removeFromWatchlist(wlType, record.ID);
    } else {
      addToWatchlist(wlType, record);
    }
  }

  function syncWatchlistBtn(btn, wlType, wlId) {
    if (!btn) return;
    const saved = isInWatchlist(wlType, wlId);
    btn.textContent = saved ? '✓ In My List' : '+ My List';
    btn.classList.toggle('in-watchlist', saved);
  }

  // Butang "Tonton Sekarang" (movie sahaja) — bawa ke pemain (watch.html)
  // dengan id yang sama.
  if (watchNowBtn) {
    watchNowBtn.addEventListener('click', () => {
      if (!id) return;
      window.location.href = `watch.html?id=${encodeURIComponent(id)}`;
    });
  }

  // Butang "+ Senarai Saya" — movie & TV show diasingkan ikut `type`.
  let currentDetailRecord = null;
  if (movieWatchlistBtn) {
    movieWatchlistBtn.addEventListener('click', () => {
      if (!currentDetailRecord) return;
      toggleWatchlist(type, currentDetailRecord);
      syncWatchlistBtn(movieWatchlistBtn, type, currentDetailRecord.ID);
    });
  }
  if (tvWatchlistBtn) {
    tvWatchlistBtn.addEventListener('click', () => {
      if (!currentDetailRecord) return;
      toggleWatchlist(type, currentDetailRecord);
      syncWatchlistBtn(tvWatchlistBtn, type, currentDetailRecord.ID);
    });
  }

  if (!id) {
    titleEl.textContent = 'Record not found.';
    descEl.textContent = 'No ID provided in the link.';
    return;
  }

  if (typeof WEBAPP_URL !== 'string' || WEBAPP_URL.indexOf('GANTI_DENGAN') !== -1) {
    titleEl.textContent = 'WEBAPP_URL is not set.';
    descEl.textContent = 'Please set WEBAPP_URL in movie.js to display movie details.';
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

  /* =========================================================
     TV SHOW — pilih Musim & Episod
     Setiap episod disimpan sebagai satu rekod berasingan dalam Sheet.
     Kumpulkan semua rekod dengan Tajuk yang sama, susun ikut Musim,
     supaya pengguna boleh pilih musim & episod mana nak ditonton.
     ========================================================= */
  let closeOpenDropdown = null;

  function normalizeTitle(t) {
    return String(t || '').trim().toLowerCase();
  }

  function toggleDropdown(btn, dropdown, openIt) {
    const willOpen = openIt !== undefined ? openIt : dropdown.hidden;
    if (closeOpenDropdown) closeOpenDropdown();
    if (!willOpen) return;
    dropdown.hidden = false;
    btn.setAttribute('aria-expanded', 'true');
    closeOpenDropdown = () => {
      dropdown.hidden = true;
      btn.setAttribute('aria-expanded', 'false');
      closeOpenDropdown = null;
    };
  }

  document.addEventListener('click', (e) => {
    if (!closeOpenDropdown) return;
    if (e.target.closest('.select-btn-wrap')) return;
    closeOpenDropdown();
  });

  function buildDropdownOption(label, onSelect, isActive) {
    const opt = document.createElement('button');
    opt.type = 'button';
    opt.className = 'select-option' + (isActive ? ' active' : '');
    opt.setAttribute('role', 'option');
    opt.textContent = label;
    opt.addEventListener('click', () => onSelect());
    return opt;
  }

  function initTvPicker(record, fullList) {
    if (!tvActions) return;
    if (movieActions) {
      movieActions.hidden = true;
      movieActions.classList.add('is-hidden');
    }
    tvActions.hidden = false;
    tvActions.classList.remove('is-hidden');

    // Setiap poster mewakili SATU musim sahaja (lihat dedupeByTitleSeason
    // dalam script.js), jadi di sini musim hanya dipaparkan sebagai kotak
    // statik (bukan dropdown boleh tukar musim) — hanya episod yang boleh
    // dipilih, terhad kepada musim semasa sahaja.
    const currentSeason = Number(record.Season) || 0;
    seasonSelectLabel.textContent = currentSeason || '—';

    const episodes = (fullList || [])
      .filter(r => normalizeTitle(r.Title) === normalizeTitle(record.Title) && (Number(r.Season) || 0) === currentSeason)
      .sort((a, b) => (Number(a.Episode) || 0) - (Number(b.Episode) || 0));
    if (!episodes.length) episodes.push(record);

    function playEpisode(ep) {
      if (!ep || !ep.ID) return;
      window.location.href = `watch.html?id=${encodeURIComponent(ep.ID)}&type=tvshow`;
    }

    function renderEpisodeDropdown(activeEpisodeNum) {
      episodeDropdown.innerHTML = '';
      episodes.forEach(ep => {
        const epNum = Number(ep.Episode) || 0;
        episodeDropdown.appendChild(buildDropdownOption(
          `Episode ${epNum}`,
          () => {
            episodeSelectLabel.textContent = epNum;
            toggleDropdown(episodeSelectBtn, episodeDropdown, false);
            playEpisode(ep);
          },
          epNum === activeEpisodeNum
        ));
      });
      const active = episodes.find(ep => (Number(ep.Episode) || 0) === activeEpisodeNum) || episodes[0];
      episodeSelectLabel.textContent = active ? (Number(active.Episode) || 0) : '—';
    }

    // Default dropdown papar Episode 1 (episod pertama dalam musim ini),
    // bukan episod rekod yang dipautkan dari kad poster trending —
    // sebab dedupeByTitleSeason() dalam script.js boleh pilih mana-mana
    // episod sebagai rekod "wakil" bagi musim tu.
    const defaultEpisodeNum = episodes.length ? (Number(episodes[0].Episode) || 0) : (Number(record.Episode) || 0);
    renderEpisodeDropdown(defaultEpisodeNum);

    episodeSelectBtn.onclick = (e) => {
      e.stopPropagation();
      toggleDropdown(episodeSelectBtn, episodeDropdown, episodeDropdown.hidden);
    };
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
        renderDetail(cachedRecord, list);
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
        throw new Error(json.error || 'Failed to load data.');
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
          titleEl.textContent = 'Record not found.';
          descEl.textContent = type === 'tvshow' ? 'The TV show you are looking for may have been deleted.' : 'The movie you are looking for may have been deleted.';
        }
        return;
      }

      renderDetail(record, json.data);
    } catch (err) {
      if (!shownFromCache) {
        titleEl.textContent = 'Failed to load details.';
        descEl.textContent = 'Please try again shortly.';
      }
    }
  }

  function renderDetail(record, fullList) {
    currentDetailRecord = record;
    backdropImg.style.backgroundImage = record.Backdrop ? `url("${record.Backdrop}")` : 'none';
    titleEl.textContent = record.Title || '';
    // Maklumat musim/episod kini dipilih melalui butang Musim & Episod
    // (bukan dipaparkan statik di sini).
    const metaParts = [record.Year, record.Genre];
    metaEl.textContent = metaParts.filter(Boolean).join(' · ');
    descEl.textContent = record.Description || '';
    document.title = `${record.Title || 'Movie Details'} — Prime Flix`;

    if (type === 'tvshow') {
      initTvPicker(record, fullList);
      syncWatchlistBtn(tvWatchlistBtn, type, record.ID);
    } else {
      syncWatchlistBtn(movieWatchlistBtn, type, record.ID);
    }
  }

  loadDetail();
});
