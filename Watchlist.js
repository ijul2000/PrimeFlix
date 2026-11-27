// =========================================================
// PRIME FLIX — modul kongsi Senarai Saya (My List) + kemajuan tontonan
// Dimuatkan SEBELUM script.js / movie.js / watch.js pada setiap halaman.
//
// Peraturan:
//  - MOVIE   : satu entri per movie (ikut ID). Kemajuan (minit terakhir)
//              disimpan berasingan ikut ID movie.
//  - TV SHOW : satu entri per (Tajuk + Musim). Entri menyimpan EPISOD
//              terakhir yang pengguna tekan "+ My List" — tekan lagi
//              pada episod lain = kemas kini episod yang disimpan.
//              Entri.ID = ID rekod episod tersebut. Kemajuan disimpan
//              ikut ID episod.
// =========================================================
(function (global) {
  'use strict';

  const WATCHLIST_KEY = 'primeflix_watchlist_v1';
  const PROGRESS_KEY = 'primeflix_progress_v1';
  const MAX_PROGRESS_ENTRIES = 300;
  const listeners = [];

  function norm(t) { return String(t || '').trim().toLowerCase(); }

  function onChange(fn) { if (typeof fn === 'function') listeners.push(fn); }
  function notify() {
    listeners.forEach(fn => { try { fn(); } catch (err) { /* abaikan */ } });
  }

  /* ---------------- Watchlist ---------------- */
  function read() {
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

  function write(data) {
    try {
      localStorage.setItem(WATCHLIST_KEY, JSON.stringify(data));
    } catch (err) { /* localStorage tak tersedia / penuh — abaikan */ }
    notify();
  }

  // Movie dipadankan ikut ID; TV show ikut Tajuk + Musim (kerana ID
  // berubah bila episod yang disimpan ditukar).
  function sameItem(type, entry, record) {
    if (!entry || !record) return false;
    if (type === 'tvshow') {
      return norm(entry.Title) === norm(record.Title) &&
        (Number(entry.Season) || 0) === (Number(record.Season) || 0);
    }
    return String(entry.ID) === String(record.ID);
  }

  function getEntry(type, record) {
    if (!record) return null;
    return (read()[type] || []).find(e => sameItem(type, e, record)) || null;
  }

  function isSaved(type, record) { return !!getEntry(type, record); }

  function snapshot(record) {
    return {
      ID: record.ID,
      Title: record.Title || '',
      Year: record.Year || '',
      Genre: record.Genre || '',
      Season: record.Season || '',
      Episode: record.Episode || '',
      Poster: record.Poster || '',
      Badge: record.Badge || ''
    };
  }

  // 'add'    = belum ada dalam senarai
  // 'saved'  = sudah ada (untuk TV: episod yang sama)
  // 'update' = TV show sudah ada tapi episod berbeza -> boleh kemas kini
  // opts.keepEpisode = true -> jangan tawarkan 'update' (cth. butang Hero
  // yang tiada konsep pilih episod).
  function stateFor(type, record, opts) {
    const entry = getEntry(type, record);
    if (!entry) return 'add';
    if (type === 'tvshow' && !(opts && opts.keepEpisode) &&
        String(entry.ID) !== String(record.ID)) {
      return 'update';
    }
    return 'saved';
  }

  function save(type, record) {
    const wl = read();
    const list = wl[type] || [];
    const idx = list.findIndex(e => sameItem(type, e, record));
    if (idx !== -1) list.splice(idx, 1);
    list.unshift(snapshot(record));
    wl[type] = list;
    write(wl);
  }

  function remove(type, record) {
    const wl = read();
    wl[type] = (wl[type] || []).filter(e => !sameItem(type, e, record));
    write(wl);
  }

  // Pulangkan true kalau selepas ini rekod ada dalam senarai.
  function toggle(type, record, opts) {
    if (!record || !record.ID) return false;
    if (stateFor(type, record, opts) === 'saved') {
      remove(type, record);
      return false;
    }
    save(type, record);
    return true;
  }

  function syncBtn(btn, type, record, opts) {
    if (!btn) return;
    const state = record ? stateFor(type, record, opts) : 'add';
    btn.textContent =
      state === 'saved' ? '✓ In My List' :
      state === 'update' ? '↻ Save This Episode' :
      '+ My List';
    btn.classList.toggle('in-watchlist', state === 'saved');
  }

  /* ---------------- Kemajuan tontonan ---------------- */
  function readProgress() {
    try {
      const p = JSON.parse(localStorage.getItem(PROGRESS_KEY));
      return p && typeof p === 'object' && !Array.isArray(p) ? p : {};
    } catch (err) {
      return {};
    }
  }

  function writeProgress(data) {
    try {
      localStorage.setItem(PROGRESS_KEY, JSON.stringify(data));
    } catch (err) { /* abaikan */ }
  }

  function getProgress(id) {
    if (!id) return null;
    const p = readProgress()[String(id)];
    return p && p.time > 0 ? p : null;
  }

  function clearProgress(id) {
    const all = readProgress();
    if (all[String(id)]) {
      delete all[String(id)];
      writeProgress(all);
    }
  }

  // Dipanggil berkala oleh pemain. Kalau dah hampir habis ditonton,
  // kemajuan dipadam (dianggap tamat -> "mula dari awal").
  function setProgress(id, time, duration) {
    if (!id || !isFinite(time)) return;
    const d = isFinite(duration) && duration > 0 ? duration : 0;
    const finished = d > 0 && (time / d >= 0.97 || (d >= 120 && d - time <= 30));
    if (finished) { clearProgress(id); return; }
    if (time < 5) return;

    const all = readProgress();
    all[String(id)] = { time: Math.floor(time), duration: Math.floor(d), updated: Date.now() };

    const keys = Object.keys(all);
    if (keys.length > MAX_PROGRESS_ENTRIES) {
      keys.sort((a, b) => (all[a].updated || 0) - (all[b].updated || 0))
        .slice(0, keys.length - MAX_PROGRESS_ENTRIES)
        .forEach(k => { delete all[k]; });
    }
    writeProgress(all);
  }

  function formatTime(sec) {
    sec = Math.max(0, Math.floor(Number(sec) || 0));
    const h = Math.floor(sec / 3600);
    const m = Math.floor((sec % 3600) / 60);
    const s = sec % 60;
    const pad = n => (n < 10 ? '0' : '') + n;
    return h > 0 ? `${h}:${pad(m)}:${pad(s)}` : `${m}:${pad(s)}`;
  }

  global.PFWL = {
    onChange, read, getEntry, isSaved, stateFor, save, remove, toggle, syncBtn,
    getProgress, setProgress, clearProgress, formatTime
  };
})(window);
