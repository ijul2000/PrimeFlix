// =========================================================
// PRIME FLIX — interactions
// =========================================================

// Tampal URL Web App Google Apps Script anda di bawah
// (lihat arahan pasang di bahagian atas Code.gs).
const WEBAPP_URL = 'https://script.google.com/macros/s/AKfycbydLAqC63yo3LXJXMXpRyJNH4KYc5wtmstaewPa-NAnklQvV2JSCv28JdfWNiJsma51fQ/exec';

document.addEventListener('DOMContentLoaded', () => {

  /* ---- Mobile nav toggle ---- */
  const hamburger = document.getElementById('hamburgerBtn');
  const mobileNav = document.getElementById('mobileNav');

  hamburger.addEventListener('click', () => {
    const isOpen = hamburger.getAttribute('aria-expanded') === 'true';
    hamburger.setAttribute('aria-expanded', String(!isOpen));
    mobileNav.classList.toggle('open');
  });

  mobileNav.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
      hamburger.setAttribute('aria-expanded', 'false');
      mobileNav.classList.remove('open');
    });
  });

  /* ---- Search form ---- */
  const searchForm = document.getElementById('searchForm');
  const searchInput = document.getElementById('searchInput');

  searchForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const query = searchInput.value.trim();
    if (query) {
      console.log('Mencari:', query);
      // Placeholder: sambungkan ke logik carian sebenar di sini
    }
  });

  // On small screens, tap the icon to expand the search field first
  const searchIconBtn = searchForm.querySelector('.search-icon-btn');
  searchIconBtn.addEventListener('click', (e) => {
    if (window.innerWidth <= 480 && !searchForm.classList.contains('expanded')) {
      e.preventDefault();
      searchForm.classList.add('expanded');
      searchInput.focus();
    }
  });
  searchInput.addEventListener('blur', () => {
    if (window.innerWidth <= 480 && !searchInput.value) {
      searchForm.classList.remove('expanded');
    }
  });

  /* ---- Nav active state on click (tanpa scroll ke bawah) ---- */
  document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', (e) => {
      if (link.tagName === 'A') e.preventDefault();
      const label = link.textContent.trim();
      document.querySelectorAll('.nav-link').forEach(l => {
        l.classList.toggle('active', l.textContent.trim() === label);
      });
    });
  });

  /* =========================================================
     HERO — papar 5 movie terbaharu yang di-upload dari Google Sheet
     ========================================================= */
  (function initHero() {
    const heroContent = document.getElementById('heroContent');
    const heroBackdropImg = document.getElementById('heroBackdropImg');
    const heroEyebrow = document.getElementById('heroEyebrow');
    const heroTitle = document.getElementById('heroTitle');
    const heroMeta = document.getElementById('heroMeta');
    const heroDesc = document.getElementById('heroDesc');
    const heroDots = document.getElementById('heroDots');

    if (!heroBackdropImg) return;
    if (typeof WEBAPP_URL !== 'string' || WEBAPP_URL.indexOf('GANTI_DENGAN') !== -1) {
      // WEBAPP_URL belum ditetapkan — papar sahaja kandungan statik sedia ada.
      if (heroContent) heroContent.classList.remove('is-loading');
      return;
    }

    const ROTATE_MS = 7000;
    const HERO_CACHE_KEY = 'primeflix_hero_cache_v1';
    let slides = [];
    let currentIndex = 0;
    let rotateTimer = null;

    // Reveal kandungan hero (buang keadaan "loading"/transparent).
    function revealHero() {
      if (heroContent) heroContent.classList.remove('is-loading');
    }

    // Cache movie hero terkini dalam sessionStorage supaya bila
    // refresh / kembali ke laman utama dalam sesi yang sama, movie
    // yang BETUL terus dipaparkan tanpa perlu tunggu fetch selesai
    // (mengelakkan "berkelip" movie salah sebentar).
    function readHeroCache() {
      try {
        const raw = sessionStorage.getItem(HERO_CACHE_KEY);
        if (!raw) return null;
        const parsed = JSON.parse(raw);
        return Array.isArray(parsed) && parsed.length ? parsed : null;
      } catch (err) {
        return null;
      }
    }

    function writeHeroCache(data) {
      try {
        sessionStorage.setItem(HERO_CACHE_KEY, JSON.stringify(data));
      } catch (err) {
        // sessionStorage tak tersedia / penuh — abaikan sahaja, tak kritikal.
      }
    }

    function renderSlide(index) {
      const movie = slides[index];
      if (!movie) return;
      currentIndex = index;

      heroBackdropImg.style.backgroundImage = movie.Backdrop ? `url("${movie.Backdrop}")` : 'none';
      heroTitle.textContent = movie.Title || '';
      heroMeta.textContent = [movie.Year, movie.Genre].filter(Boolean).join(' · ');
      heroDesc.textContent = movie.Description || '';

      if (heroDots) {
        heroDots.querySelectorAll('.hero-dot').forEach((dot, i) => {
          dot.classList.toggle('active', i === index);
        });
      }
    }

    function buildDots() {
      if (!heroDots) return;
      heroDots.innerHTML = '';
      if (slides.length < 2) return;
      slides.forEach((_, i) => {
        const dot = document.createElement('button');
        dot.type = 'button';
        dot.className = 'hero-dot';
        dot.setAttribute('aria-label', `Papar tajuk ${i + 1}`);
        dot.addEventListener('click', () => {
          renderSlide(i);
          resetTimer();
        });
        heroDots.appendChild(dot);
      });
    }

    function nextSlide() {
      if (slides.length < 2) return;
      renderSlide((currentIndex + 1) % slides.length);
    }

    function resetTimer() {
      clearInterval(rotateTimer);
      if (slides.length > 1) {
        rotateTimer = setInterval(nextSlide, ROTATE_MS);
      }
    }

    async function loadHeroMovies() {
      // 1) Jika ada cache dari lawatan sebelum ini dalam sesi yang sama,
      //    papar terus dahulu — movie yang betul, tiada kelipan.
      const cached = readHeroCache();
      if (cached) {
        slides = cached;
        buildDots();
        renderSlide(0);
        resetTimer();
        revealHero();
      }

      // 2) Tetap fetch data terkini dari Google Sheet di latar belakang
      //    supaya hero sentiasa up-to-date (movie baharu terus terpapar).
      try {
        const res = await fetch(`${WEBAPP_URL}?action=list&type=movie`);
        const json = await res.json();
        if (!json.ok || !Array.isArray(json.data) || !json.data.length) {
          if (!cached) revealHero(); // tiada cache & tiada data -> fallback statik
          return;
        }

        // Susun ikut CreatedAt terbaharu dahulu, ambil 5 teratas.
        slides = json.data
          .slice()
          .sort((a, b) => new Date(b.CreatedAt) - new Date(a.CreatedAt))
          .slice(0, 5);

        writeHeroCache(slides);
        buildDots();
        renderSlide(0);
        resetTimer();
        revealHero();
      } catch (err) {
        // Jika gagal muatkan (cth. WEBAPP_URL belum konfigurasi betul / rangkaian gagal),
        // kekalkan kandungan hero statik sedia ada tanpa ranap laman.
        if (!cached) revealHero();
      }
    }

    loadHeroMovies();
  })();

  /* =========================================================
     FILEM TRENDING — grid 7x5 (35 poster), movie terbaharu dahulu
     Tiada scroll ke tepi; movie baharu diletak di kedudukan pertama
     dan yang lain teranjak (grid auto-wrap ke baris seterusnya).
     ========================================================= */
  (function initTrendingGrid() {
    const grid = document.getElementById('trendingGrid');
    if (!grid) return;
    if (typeof WEBAPP_URL !== 'string' || WEBAPP_URL.indexOf('GANTI_DENGAN') !== -1) return;

    const COLS = 7;
    const ROWS = 5;
    const MAX_ITEMS = COLS * ROWS;

    function buildPosterCard(record) {
      const card = document.createElement('div');
      card.className = 'poster-card';
      card.tabIndex = 0;
      card.setAttribute('role', 'button');
      card.setAttribute('aria-label', `Papar butiran ${record.Title || 'filem'}`);

      function goToDetail() {
        if (!record.ID) return;
        window.location.href = `movie.html?id=${encodeURIComponent(record.ID)}`;
      }
      card.addEventListener('click', goToDetail);
      card.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          goToDetail();
        }
      });

      const art = document.createElement('div');
      art.className = 'poster-art';
      if (record.Poster) {
        art.style.backgroundImage = `url("${record.Poster}")`;
        art.style.backgroundSize = 'cover';
        art.style.backgroundPosition = 'center';
      } else {
        art.style.background = 'linear-gradient(160deg, #1c1a15 0%, #141414 55%, #0a0a0a 100%)';
      }

      const badgeEl = document.createElement('span');
      badgeEl.className = 'poster-badge';
      badgeEl.textContent = record.Badge || 'HD';

      const play = document.createElement('div');
      play.className = 'poster-play';
      play.innerHTML = `<svg width="44" height="44" viewBox="0 0 44 44" fill="none">
          <circle cx="22" cy="22" r="21" stroke="#F3D27A" stroke-width="1.5" opacity="0.7"/>
          <path d="M18 14v16l13-8-13-8Z" fill="#F3D27A"/>
        </svg>`;

      art.appendChild(badgeEl);
      art.appendChild(play);

      const meta = document.createElement('div');
      meta.className = 'poster-meta';
      const sub = [record.Year, record.Genre].filter(Boolean).join(' · ');
      meta.innerHTML = `<div class="poster-title">${record.Title || ''}</div><div class="poster-sub">${sub}</div>`;

      card.appendChild(art);
      card.appendChild(meta);
      return card;
    }

    async function loadTrending() {
      try {
        const res = await fetch(`${WEBAPP_URL}?action=list&type=movie`);
        const json = await res.json();
        if (!json.ok || !Array.isArray(json.data)) return;

        // Movie terbaharu dahulu — bila ada upload baharu, ia akan
        // muncul di kedudukan pertama dan yang lain teranjak/turun baris.
        const movies = json.data
          .slice()
          .sort((a, b) => new Date(b.CreatedAt) - new Date(a.CreatedAt))
          .slice(0, MAX_ITEMS);

        grid.innerHTML = '';
        movies.forEach(movie => grid.appendChild(buildPosterCard(movie)));
      } catch (err) {
        // Jika gagal muatkan, biarkan grid kosong tanpa ranap laman.
      }
    }

    loadTrending();
  })();

  /* =========================================================
     ADMIN PANEL
     ========================================================= */

  const adminPanel = document.getElementById('adminPanel');
  const openAdminBtn = document.getElementById('openAdminBtn');
  const closeAdminBtn = document.getElementById('closeAdminBtn');

  if (adminPanel && openAdminBtn) {

    let library = { movie: [], tvshow: [] };
    let currentFilter = 'all';
    let currentSearch = '';
    let adminLoaded = false;

    const apiStatus = document.getElementById('apiStatus');
    const toastEl = document.getElementById('toast');

    const chooserOverlay = document.getElementById('chooserOverlay');
    const openAddChooserBtn = document.getElementById('openAddChooserBtn');
    const chooseMovieBtn = document.getElementById('chooseMovieBtn');
    const chooseTvBtn = document.getElementById('chooseTvBtn');

    const movieModalOverlay = document.getElementById('movieModalOverlay');
    const movieForm = document.getElementById('movieForm');
    const movieModalTitle = document.getElementById('movieModalTitle');

    const tvModalOverlay = document.getElementById('tvModalOverlay');
    const tvForm = document.getElementById('tvForm');
    const tvModalTitle = document.getElementById('tvModalTitle');

    const deleteModalOverlay = document.getElementById('deleteModalOverlay');
    const confirmDeleteBtn = document.getElementById('confirmDeleteBtn');

    const checkLinksBtn = document.getElementById('checkLinksBtn');
    const brokenLinksModalOverlay = document.getElementById('brokenLinksModalOverlay');
    const brokenLinksLoading = document.getElementById('brokenLinksLoading');
    const brokenLinksEmpty = document.getElementById('brokenLinksEmpty');
    const brokenLinksList = document.getElementById('brokenLinksList');
    const recheckLinksBtn = document.getElementById('recheckLinksBtn');

    const libraryGrid = document.getElementById('libraryGrid');
    const libraryLoading = document.getElementById('libraryLoading');
    const libraryEmpty = document.getElementById('libraryEmpty');
    const filterTabs = document.getElementById('filterTabs');
    const searchForm = document.getElementById('adminSearchForm');
    const searchInput = document.getElementById('adminSearchInput');

    let pendingDelete = null; // { type, id }
    const ADMIN_HASH = '#admin';

    function webAppConfigured() {
      return typeof WEBAPP_URL === 'string' && WEBAPP_URL.indexOf('GANTI_DENGAN') === -1;
    }

    function showStatus(message, type) {
      apiStatus.textContent = message;
      apiStatus.hidden = false;
      apiStatus.className = 'admin-status status-' + (type || 'info');
    }

    function showToast(message, type) {
      toastEl.textContent = message;
      toastEl.className = 'toast toast-' + (type || 'success');
      toastEl.hidden = false;
      clearTimeout(showToast._t);
      showToast._t = setTimeout(() => { toastEl.hidden = true; }, 3200);
    }

    /* ---------------------------------------------------------
       BUKA / TUTUP PANEL ADMIN
       - Guna hash URL "#admin" sebagai penanda status, disokong
         oleh history.pushState/popstate. Sebab URL itu sendiri
         yang kekal selepas refresh (bukan localStorage), panel
         admin automatik terbuka semula bila page di-refresh.
       - Tekan butang "Kembali ke Laman" ATAU butang Back browser
         kedua-duanya akan keluar dari panel admin ke laman utama,
         sebab kedua-duanya melalui mekanisme history yang sama.
    --------------------------------------------------------- */

    // Fungsi "UI sahaja" — tukar paparan tanpa sentuh history.
    // Dipanggil terus oleh popstate (bila user dah tekan Back/Forward)
    // supaya kita tak push/pop history entry berganda.
    function openAdminPanelUI() {
      adminPanel.hidden = false;
      document.body.style.overflow = 'hidden';
      if (!adminLoaded) {
        adminLoaded = true;
        if (!webAppConfigured()) {
          showStatus(
            'WEBAPP_URL belum ditetapkan dalam script.js. Tampal URL Web App Google Apps Script anda pada baris atas fail ini untuk aktifkan panel admin.',
            'error'
          );
        }
        loadLibrary();
      }
    }
    function closeAdminPanelUI() {
      adminPanel.hidden = true;
      document.body.style.overflow = '';
    }

    // Dipanggil bila USER klik butang "Admin" — cipta history entry baharu.
    function openAdminPanel() {
      if (window.location.hash !== ADMIN_HASH) {
        history.pushState({ admin: true }, '', ADMIN_HASH);
      }
      openAdminPanelUI();
    }

    // Dipanggil bila USER klik butang "Kembali ke Laman" — guna history.back()
    // supaya kelakuannya sama macam tekan butang Back browser.
    function closeAdminPanel() {
      if (window.location.hash === ADMIN_HASH) {
        history.back();
      } else {
        closeAdminPanelUI();
      }
    }

    openAdminBtn.addEventListener('click', openAdminPanel);
    closeAdminBtn.addEventListener('click', closeAdminPanel);

    // Butang Back / Forward browser (atau history.back() di atas) akan
    // memicu event ini — sinkronkan paparan panel admin dengan hash semasa.
    window.addEventListener('popstate', function () {
      if (window.location.hash === ADMIN_HASH) {
        openAdminPanelUI();
      } else {
        closeAdminPanelUI();
      }
    });

    // Jika page dibuka/refresh dengan hash #admin dalam URL, terus
    // paparkan panel admin (tanpa push history entry baharu).
    if (window.location.hash === ADMIN_HASH) {
      openAdminPanelUI();
    }

    /* ---- API helpers ---- */
    async function apiList() {
      const res = await fetch(`${WEBAPP_URL}?action=list`);
      const json = await res.json();
      if (!json.ok) throw new Error(json.error || 'Gagal memuatkan senarai.');
      return json.data; // { movie: [...], tvshow: [...] }
    }

    // Dihantar sebagai text/plain supaya Apps Script Web App tidak
    // menyekat permintaan dengan CORS preflight (OPTIONS).
    async function apiMutate(action, type, data) {
      const res = await fetch(WEBAPP_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({ action, type, data })
      });
      const json = await res.json();
      if (!json.ok) throw new Error(json.error || 'Permintaan gagal.');
      return json.data;
    }

    async function apiCheckLinks() {
      const res = await fetch(`${WEBAPP_URL}?action=checkLinks`);
      const json = await res.json();
      if (!json.ok) throw new Error(json.error || 'Gagal menyemak pautan.');
      return json.data; // array of { type, id, title, field, url, status, ok }
    }

    /* ---- Modal helpers ---- */
    function openModal(overlay) {
      document.querySelectorAll('.modal-overlay').forEach(o => { o.hidden = true; });
      overlay.hidden = false;
    }
    function closeAllModals() {
      document.querySelectorAll('.modal-overlay').forEach(o => { o.hidden = true; });
      pendingDelete = null;
    }

    document.querySelectorAll('[data-close-modal]').forEach(btn => {
      btn.addEventListener('click', closeAllModals);
    });
    document.querySelectorAll('.modal-overlay').forEach(overlay => {
      overlay.addEventListener('click', (e) => {
        if (e.target === overlay) closeAllModals();
      });
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        closeAllModals();
      }
    });

    openAddChooserBtn.addEventListener('click', () => openModal(chooserOverlay));

    chooseMovieBtn.addEventListener('click', () => {
      resetForm(movieForm, 'movieGenre');
      movieModalTitle.textContent = 'Tambah Movie';
      movieForm.querySelector('[data-submit-btn]').textContent = 'Simpan Movie';
      openModal(movieModalOverlay);
    });

    chooseTvBtn.addEventListener('click', () => {
      resetForm(tvForm, 'tvGenre');
      tvModalTitle.textContent = 'Tambah TV Show';
      tvForm.querySelector('[data-submit-btn]').textContent = 'Simpan TV Show';
      openModal(tvModalOverlay);
    });

    /* ---- Tag input (genre — boleh banyak) ---- */
    const tagState = {};

    function initTagInput(key) {
      const wrap = document.querySelector(`[data-tag-input="${key}"]`);
      const list = wrap.querySelector('[data-tag-list]');
      const input = wrap.querySelector('.tag-input-field');
      tagState[key] = [];

      function render() {
        list.innerHTML = '';
        tagState[key].forEach((tag, i) => {
          const chip = document.createElement('span');
          chip.className = 'tag-chip';
          chip.innerHTML = `<span></span><button type="button" aria-label="Buang ${tag}">&times;</button>`;
          chip.querySelector('span').textContent = tag;
          chip.querySelector('button').addEventListener('click', () => {
            tagState[key].splice(i, 1);
            render();
          });
          list.appendChild(chip);
        });
      }

      function addTag(raw) {
        const value = raw.trim().replace(/,+$/, '');
        if (!value) return;
        if (tagState[key].some(t => t.toLowerCase() === value.toLowerCase())) return;
        tagState[key].push(value);
        render();
      }

      input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ',') {
          e.preventDefault();
          addTag(input.value);
          input.value = '';
        } else if (e.key === 'Backspace' && !input.value && tagState[key].length) {
          tagState[key].pop();
          render();
        }
      });
      input.addEventListener('blur', () => {
        if (input.value.trim()) {
          addTag(input.value);
          input.value = '';
        }
      });

      wrap.addEventListener('click', () => input.focus());

      return {
        set(genresArray) { tagState[key] = genresArray.slice(); render(); },
        get() { return tagState[key]; },
        clear() { tagState[key] = []; render(); }
      };
    }

    const movieGenreTags = initTagInput('movieGenre');
    const tvGenreTags = initTagInput('tvGenre');

    /* ---- Image preview ---- */
    function wirePreview(form) {
      const posterInput = form.querySelector('[name="Poster"]');
      const backdropInput = form.querySelector('[name="Backdrop"]');
      const posterPreview = form.querySelector('[data-preview-poster]');
      const backdropPreview = form.querySelector('[data-preview-backdrop]');

      function update(input, previewEl) {
        const url = input.value.trim();
        previewEl.style.backgroundImage = url ? `url("${url}")` : '';
      }
      posterInput.addEventListener('input', () => update(posterInput, posterPreview));
      backdropInput.addEventListener('input', () => update(backdropInput, backdropPreview));
    }
    wirePreview(movieForm);
    wirePreview(tvForm);

    /* ---- Form reset / fill ---- */
    function resetForm(form, tagKey) {
      form.reset();
      form.querySelector('[name="ID"]').value = '';
      form.querySelectorAll('[data-preview] > div').forEach(el => { el.style.backgroundImage = ''; });
      hideFormError(form);
      if (tagKey === 'movieGenre') movieGenreTags.clear();
      if (tagKey === 'tvGenre') tvGenreTags.clear();
    }

    function fillForm(form, record, tagKey) {
      form.querySelector('[name="ID"]').value = record.ID || '';
      ['Title', 'Year', 'Description', 'Backdrop', 'Poster', 'Link', 'Badge', 'Season', 'Episode'].forEach(field => {
        const el = form.querySelector(`[name="${field}"]`);
        if (el && record[field] !== undefined) el.value = record[field];
      });
      const genres = String(record.Genre || '').split(',').map(g => g.trim()).filter(Boolean);
      if (tagKey === 'movieGenre') movieGenreTags.set(genres);
      if (tagKey === 'tvGenre') tvGenreTags.set(genres);

      form.querySelectorAll('[data-preview] > div').forEach(el => { el.style.backgroundImage = ''; });
      const posterPreview = form.querySelector('[data-preview-poster]');
      const backdropPreview = form.querySelector('[data-preview-backdrop]');
      if (record.Poster) posterPreview.style.backgroundImage = `url("${record.Poster}")`;
      if (record.Backdrop) backdropPreview.style.backgroundImage = `url("${record.Backdrop}")`;
      hideFormError(form);
    }

    function showFormError(form, message) {
      const el = form.querySelector('[data-form-error]');
      el.textContent = message;
      el.hidden = false;
    }
    function hideFormError(form) {
      const el = form.querySelector('[data-form-error]');
      el.hidden = true;
      el.textContent = '';
    }

    /* ---- Form submit (add / edit) ---- */
    function formToData(form, genreTags) {
      const fd = new FormData(form);
      const data = {};
      fd.forEach((value, key) => { data[key] = value; });
      data.Genre = genreTags.get().join(', ');
      if (!data.ID) delete data.ID;
      return data;
    }

    async function handleSubmit(e, form, type, genreTags) {
      e.preventDefault();
      hideFormError(form);

      if (!webAppConfigured()) {
        showFormError(form, 'WEBAPP_URL belum ditetapkan dalam script.js.');
        return;
      }
      if (!form.checkValidity()) {
        form.reportValidity();
        return;
      }
      if (genreTags.get().length === 0) {
        showFormError(form, 'Sila masukkan sekurang-kurangnya satu genre.');
        return;
      }

      const data = formToData(form, genreTags);
      const isEdit = !!data.ID;
      const submitBtn = form.querySelector('[data-submit-btn]');
      const originalLabel = submitBtn.textContent;
      submitBtn.disabled = true;
      submitBtn.textContent = 'Menyimpan...';

      try {
        await apiMutate(isEdit ? 'edit' : 'add', type, data);
        showToast(isEdit ? 'Kemaskini berjaya disimpan.' : 'Tajuk baharu berjaya ditambah.', 'success');
        closeAllModals();
        loadLibrary();
      } catch (err) {
        showFormError(form, err.message || 'Sesuatu tidak kena. Cuba lagi.');
      } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = originalLabel;
      }
    }

    movieForm.addEventListener('submit', (e) => handleSubmit(e, movieForm, 'movie', movieGenreTags));
    tvForm.addEventListener('submit', (e) => handleSubmit(e, tvForm, 'tvshow', tvGenreTags));

    /* ---- Library: load / render / filter / search ---- */
    async function loadLibrary() {
      if (!webAppConfigured()) {
        libraryLoading.hidden = true;
        libraryEmpty.hidden = false;
        libraryEmpty.textContent = 'Sambungkan WEBAPP_URL untuk memaparkan senarai.';
        return;
      }
      libraryLoading.hidden = false;
      libraryEmpty.hidden = true;
      libraryGrid.innerHTML = '';
      try {
        library = await apiList();
        renderLibrary();
      } catch (err) {
        libraryLoading.hidden = true;
        showStatus('Gagal memuatkan senarai: ' + err.message, 'error');
      }
    }

    function combinedRecords() {
      const movies = (library.movie || []).map(r => Object.assign({ _type: 'movie' }, r));
      const shows = (library.tvshow || []).map(r => Object.assign({ _type: 'tvshow' }, r));
      return movies.concat(shows);
    }

    function renderLibrary() {
      libraryLoading.hidden = true;
      let records = combinedRecords();

      if (currentFilter !== 'all') {
        records = records.filter(r => r._type === currentFilter);
      }
      if (currentSearch.trim()) {
        const q = currentSearch.trim().toLowerCase();
        records = records.filter(r => String(r.Title || '').toLowerCase().includes(q));
      }

      records.sort((a, b) => String(a.Title || '').localeCompare(String(b.Title || '')));

      libraryGrid.innerHTML = '';
      if (records.length === 0) {
        libraryEmpty.hidden = false;
        libraryEmpty.textContent = 'Tiada tajuk dijumpai.';
        return;
      }
      libraryEmpty.hidden = true;

      records.forEach(record => libraryGrid.appendChild(buildLibraryCard(record)));
    }

    function buildLibraryCard(record) {
      const card = document.createElement('div');
      card.className = 'admin-card';

      const art = document.createElement('div');
      art.className = 'admin-card-art';
      if (record.Poster) art.style.backgroundImage = `url("${record.Poster}")`;

      const typeTag = document.createElement('span');
      typeTag.className = 'admin-card-type';
      typeTag.textContent = record._type === 'movie' ? 'MOVIE' : 'TV SHOW';
      art.appendChild(typeTag);

      const body = document.createElement('div');
      body.className = 'admin-card-body';

      const title = document.createElement('div');
      title.className = 'admin-card-title';
      title.textContent = record.Title || '(Tiada tajuk)';

      const meta = document.createElement('div');
      meta.className = 'admin-card-meta';
      meta.textContent = record._type === 'movie'
        ? [record.Year, record.Badge].filter(Boolean).join(' · ')
        : [record.Year, record.Season ? `Musim ${record.Season}` : '', record.Episode ? `Ep ${record.Episode}` : ''].filter(Boolean).join(' · ');

      const genres = document.createElement('div');
      genres.className = 'admin-card-genres';
      genres.textContent = record.Genre || '';

      const actions = document.createElement('div');
      actions.className = 'admin-card-actions';

      const editBtn = document.createElement('button');
      editBtn.type = 'button';
      editBtn.className = 'btn-edit';
      editBtn.textContent = 'Edit';
      editBtn.addEventListener('click', () => openEdit(record));

      const deleteBtn = document.createElement('button');
      deleteBtn.type = 'button';
      deleteBtn.className = 'btn-delete';
      deleteBtn.textContent = 'Padam';
      deleteBtn.addEventListener('click', () => openDeleteConfirm(record));

      actions.appendChild(editBtn);
      actions.appendChild(deleteBtn);

      body.appendChild(title);
      body.appendChild(meta);
      body.appendChild(genres);
      body.appendChild(actions);

      card.appendChild(art);
      card.appendChild(body);
      return card;
    }

    function openEdit(record) {
      if (record._type === 'movie') {
        fillForm(movieForm, record, 'movieGenre');
        movieModalTitle.textContent = 'Edit Movie';
        movieForm.querySelector('[data-submit-btn]').textContent = 'Kemaskini Movie';
        openModal(movieModalOverlay);
      } else {
        fillForm(tvForm, record, 'tvGenre');
        tvModalTitle.textContent = 'Edit TV Show';
        tvForm.querySelector('[data-submit-btn]').textContent = 'Kemaskini TV Show';
        openModal(tvModalOverlay);
      }
    }

    function openDeleteConfirm(record) {
      pendingDelete = { type: record._type, id: record.ID };
      openModal(deleteModalOverlay);
    }

    confirmDeleteBtn.addEventListener('click', async () => {
      if (!pendingDelete) return;
      confirmDeleteBtn.disabled = true;
      confirmDeleteBtn.textContent = 'Memadam...';
      try {
        await apiMutate('delete', pendingDelete.type, { ID: pendingDelete.id });
        showToast('Rekod berjaya dipadam.', 'success');
        closeAllModals();
        loadLibrary();
      } catch (err) {
        showToast(err.message || 'Gagal memadam rekod.', 'error');
      } finally {
        confirmDeleteBtn.disabled = false;
        confirmDeleteBtn.textContent = 'Padam';
      }
    });

    /* ---- Semak Pautan Rosak (Backdrop / Poster / Link) ---- */
    const FIELD_LABELS = {
      Backdrop: 'Gambar Backdrop',
      Poster: 'Gambar Poster',
      Link: 'Pautan Tontonan'
    };

    function findRecordById(type, id) {
      const rows = (type === 'movie' ? library.movie : library.tvshow) || [];
      return rows.find(r => String(r.ID) === String(id));
    }

    function buildBrokenLinkItem(entry) {
      const item = document.createElement('div');
      item.className = 'broken-link-item';

      const info = document.createElement('div');
      info.className = 'broken-link-info';

      const titleRow = document.createElement('div');
      titleRow.className = 'broken-link-title';

      const titleText = document.createElement('span');
      titleText.textContent = entry.title || '(Tiada tajuk)';

      const typeTag = document.createElement('span');
      typeTag.className = 'broken-link-type';
      typeTag.textContent = entry.type === 'movie' ? 'MOVIE' : 'TV SHOW';

      const fieldTag = document.createElement('span');
      fieldTag.className = 'broken-link-field';
      fieldTag.textContent = FIELD_LABELS[entry.field] || entry.field;

      titleRow.appendChild(titleText);
      titleRow.appendChild(typeTag);
      titleRow.appendChild(fieldTag);

      const urlRow = document.createElement('div');
      urlRow.className = 'broken-link-url';
      urlRow.textContent = entry.url;

      const statusRow = document.createElement('div');
      statusRow.className = 'broken-link-status';
      statusRow.textContent = entry.status && entry.status > 0
        ? `Status HTTP: ${entry.status}`
        : 'Gagal disambung / pautan tidak sah';

      info.appendChild(titleRow);
      info.appendChild(urlRow);
      info.appendChild(statusRow);

      const editBtn = document.createElement('button');
      editBtn.type = 'button';
      editBtn.className = 'broken-link-edit';
      editBtn.textContent = 'Betulkan';
      editBtn.addEventListener('click', () => {
        const record = findRecordById(entry.type, entry.id);
        if (record) {
          openEdit(Object.assign({ _type: entry.type }, record));
        } else {
          showToast('Rekod tidak dijumpai dalam senarai semasa.', 'error');
        }
      });

      item.appendChild(info);
      item.appendChild(editBtn);
      return item;
    }

    async function runCheckLinks() {
      brokenLinksList.innerHTML = '';
      brokenLinksEmpty.hidden = true;
      brokenLinksEmpty.textContent = 'Semua pautan berfungsi dengan baik.';
      brokenLinksLoading.hidden = false;
      recheckLinksBtn.disabled = true;

      try {
        const results = await apiCheckLinks();
        brokenLinksLoading.hidden = true;

        if (!results || results.length === 0) {
          brokenLinksEmpty.hidden = false;
          return;
        }
        results.forEach(entry => brokenLinksList.appendChild(buildBrokenLinkItem(entry)));
      } catch (err) {
        brokenLinksLoading.hidden = true;
        brokenLinksEmpty.hidden = false;
        brokenLinksEmpty.textContent = err.message || 'Gagal menyemak pautan.';
      } finally {
        recheckLinksBtn.disabled = false;
      }
    }

    checkLinksBtn.addEventListener('click', () => {
      if (!webAppConfigured()) {
        showToast('WEBAPP_URL belum ditetapkan dalam script.js.', 'error');
        return;
      }
      openModal(brokenLinksModalOverlay);
      runCheckLinks();
    });
    recheckLinksBtn.addEventListener('click', runCheckLinks);

    /* ---- Filter tabs + search ---- */
    filterTabs.addEventListener('click', (e) => {
      const btn = e.target.closest('.filter-tab');
      if (!btn) return;
      filterTabs.querySelectorAll('.filter-tab').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentFilter = btn.dataset.filter;
      renderLibrary();
    });

    searchForm.addEventListener('submit', (e) => e.preventDefault());
    searchInput.addEventListener('input', () => {
      currentSearch = searchInput.value;
      renderLibrary();
    });
  }

});
