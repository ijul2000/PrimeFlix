// =========================================================
// PRIME FLIX — pemain video (watch.html)
// Guna medan "Link" dari Google Sheet untuk main movie / TV show.
// =========================================================

// Guna URL Web App yang sama seperti script.js
const WEBAPP_URL = 'https://script.google.com/macros/s/AKfycbydLAqC63yo3LXJXMXpRyJNH4KYc5wtmstaewPa-NAnklQvV2JSCv28JdfWNiJsma51fQ/exec';

document.addEventListener('DOMContentLoaded', () => {

  const playerWrap = document.getElementById('playerWrap');
  const playerState = document.getElementById('playerState');
  const titleEl = document.getElementById('watchTitle');
  const metaEl = document.getElementById('watchMeta');
  const descEl = document.getElementById('watchDesc');
  const backLink = document.getElementById('backLink');

  const params = new URLSearchParams(window.location.search);
  const id = params.get('id');
  const type = params.get('type') || 'movie';

  // Butang "Kembali" bawa balik ke halaman butiran movie/TV show yang sama.
  backLink.href = id
    ? `movie.html?id=${encodeURIComponent(id)}${type === 'tvshow' ? '&type=tvshow' : ''}`
    : 'index.html';

  function showState(message) {
    playerState.textContent = message;
    playerState.classList.remove('is-hidden');
  }

  if (!id) {
    showState('Rekod tidak dijumpai. Tiada ID diberikan dalam pautan.');
    titleEl.textContent = 'Rekod tidak dijumpai.';
    return;
  }

  if (typeof WEBAPP_URL !== 'string' || WEBAPP_URL.indexOf('GANTI_DENGAN') !== -1) {
    showState('WEBAPP_URL belum ditetapkan dalam watch.js.');
    titleEl.textContent = 'WEBAPP_URL belum ditetapkan.';
    return;
  }

  // Cache yang sama dipakai oleh index.html & movie.html — bila pengguna
  // klik "Tonton Sekarang" dari page butiran, data biasanya dah ada
  // dalam sessionStorage, jadi pemain boleh mula serta-merta.
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

  // Tukar pautan mentah (Link) daripada Google Sheet kepada sesuatu yang
  // boleh dimainkan terus dalam page ini:
  //   - Pautan video terus (.mp4/.webm/.ogg/.mov/.m4v) -> elemen <video>
  //   - YouTube (watch / youtu.be / embed sedia ada)     -> <iframe> embed
  //   - Google Drive (/file/d/ID/...)                    -> <iframe> preview
  //   - Lain-lain                                        -> cuba <iframe> terus
  function resolvePlayer(rawUrl) {
    const url = String(rawUrl || '').trim();
    if (!url) return null;

    const clean = url.split('?')[0].split('#')[0];
    const ext = clean.split('.').pop().toLowerCase();
    const videoExts = ['mp4', 'webm', 'ogg', 'ogv', 'mov', 'm4v'];
    if (videoExts.indexOf(ext) !== -1) {
      return { kind: 'video', src: url };
    }

    if (url.indexOf('youtube.com/embed/') !== -1) {
      return { kind: 'iframe', src: url };
    }
    const ytWatch = url.match(/[?&]v=([a-zA-Z0-9_-]{6,})/);
    if (ytWatch && url.indexOf('youtube.com') !== -1) {
      return { kind: 'iframe', src: `https://www.youtube.com/embed/${ytWatch[1]}` };
    }
    const ytShort = url.match(/youtu\.be\/([a-zA-Z0-9_-]{6,})/);
    if (ytShort) {
      return { kind: 'iframe', src: `https://www.youtube.com/embed/${ytShort[1]}` };
    }

    const gdrive = url.match(/drive\.google\.com\/file\/d\/([^/]+)/);
    if (gdrive) {
      return { kind: 'iframe', src: `https://drive.google.com/file/d/${gdrive[1]}/preview` };
    }

    // Fallback: cuba benam terus sebagai iframe.
    return { kind: 'iframe', src: url, original: url };
  }

  function renderPlayer(record) {
    const link = record.Link;
    playerWrap.innerHTML = '';

    if (!link) {
      const state = document.createElement('div');
      state.className = 'watch-player-state';
      state.textContent = 'Tiada pautan tontonan untuk tajuk ini.';
      playerWrap.appendChild(state);
      return;
    }

    const resolved = resolvePlayer(link);

    if (resolved.kind === 'video') {
      const video = document.createElement('video');
      video.controls = true;
      video.autoplay = true;
      video.playsInline = true;
      video.src = resolved.src;
      video.addEventListener('error', () => {
        playerWrap.innerHTML = '';
        const state = document.createElement('div');
        state.className = 'watch-player-state';
        state.textContent = 'Gagal memainkan video ini.';
        playerWrap.appendChild(state);
      });
      playerWrap.appendChild(video);
      return;
    }

    const iframe = document.createElement('iframe');
    iframe.src = resolved.src;
    iframe.allow = 'autoplay; fullscreen; picture-in-picture; encrypted-media';
    iframe.allowFullscreen = true;
    iframe.referrerPolicy = 'no-referrer-when-downgrade';
    playerWrap.appendChild(iframe);
  }

  function renderInfo(record) {
    titleEl.textContent = record.Title || '';
    const metaParts = [record.Year, record.Genre];
    if (type === 'tvshow') {
      if (record.Season) metaParts.push(`Musim ${record.Season}`);
      if (record.Episode) metaParts.push(`Episod ${record.Episode}`);
    }
    metaEl.textContent = metaParts.filter(Boolean).join(' · ');
    descEl.textContent = record.Description || '';
    document.title = `${record.Title || 'Tonton'} — Prime Flix`;
  }

  function renderRecord(record) {
    renderInfo(record);
    renderPlayer(record);
  }

  async function loadAndPlay() {
    let shown = false;

    const cached = readContentCache();
    if (cached) {
      const list = cached[type] || [];
      const record = list.find(r => String(r.ID) === String(id));
      if (record) {
        renderRecord(record);
        shown = true;
      }
    }

    if (shown) return;

    try {
      const res = await fetch(`${WEBAPP_URL}?action=list&type=${encodeURIComponent(type)}`);
      const json = await res.json();
      if (!json.ok || !Array.isArray(json.data)) {
        throw new Error(json.error || 'Gagal memuatkan data.');
      }
      const record = json.data.find(r => String(r.ID) === String(id));
      if (!record) {
        showState('Rekod tidak dijumpai.');
        titleEl.textContent = 'Rekod tidak dijumpai.';
        return;
      }
      renderRecord(record);
    } catch (err) {
      showState('Gagal memuatkan pemain. Sila cuba semula sebentar lagi.');
      titleEl.textContent = 'Gagal memuatkan.';
    }
  }

  loadAndPlay();
});
