// =========================================================
// PRIME FLIX — interactions
// =========================================================

// Tampal URL Web App Google Apps Script anda di bawah
// (lihat arahan pasang di bahagian atas Code.gs).
const WEBAPP_URL = 'GANTI_DENGAN_URL_WEB_APP_ANDA';

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

  /* ---- Nav active state on click ---- */
  document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
      document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
      document.querySelectorAll(`.nav-link[href="${link.getAttribute('href')}"]`)
        .forEach(l => l.classList.add('active'));
    });
  });

  /* ---- Populate poster rows with placeholder content ---- */
  const rowData = [
    [
      { title: 'Malam Terakhir di Kota Hujan', sub: '2026 · Thriller', badge: 'HD', hue: 42 },
      { title: 'Jejak Sunyi', sub: '2025 · Misteri', badge: 'Baharu', hue: 200 },
      { title: 'Api di Ufuk', sub: '2024 · Aksi', badge: 'HD', hue: 12 },
      { title: 'Bayang Kota Lama', sub: '2026 · Drama', badge: '4K', hue: 265 },
      { title: 'Ombak Terakhir', sub: '2023 · Pengembaraan', badge: 'HD', hue: 190 },
      { title: 'Cahaya Dari Utara', sub: '2025 · Sci-Fi', badge: 'Baharu', hue: 150 },
      { title: 'Rentak Metropolitan', sub: '2024 · Komedi', badge: 'HD', hue: 320 },
    ],
    [
      { title: 'Pemburu Fajar', sub: '2025 · Aksi', badge: 'HD', hue: 8 },
      { title: 'Laluan Naga', sub: '2023 · Pengembaraan', badge: '4K', hue: 30 },
      { title: 'Serangan Senja', sub: '2026 · Aksi', badge: 'Baharu', hue: 355 },
      { title: 'Ekspedisi Terakhir', sub: '2024 · Pengembaraan', badge: 'HD', hue: 170 },
      { title: 'Zon Bahaya', sub: '2022 · Aksi', badge: 'HD', hue: 20 },
      { title: 'Rimba Terlarang', sub: '2025 · Pengembaraan', badge: 'HD', hue: 140 },
    ],
    [
      { title: 'Rumah di Hujung Jalan', sub: 'Musim 3 · Drama', badge: 'Baharu', hue: 260 },
      { title: 'Kod Bandar', sub: 'Musim 1 · Thriller', badge: 'HD', hue: 210 },
      { title: 'Meja Suku Sebelas', sub: 'Musim 2 · Komedi', badge: 'HD', hue: 330 },
      { title: 'Warisan Terpendam', sub: 'Musim 4 · Drama', badge: '4K', hue: 45 },
      { title: 'Unit Siasatan', sub: 'Musim 1 · Jenayah', badge: 'Baharu', hue: 5 },
      { title: 'Sekolah Tengah Malam', sub: 'Musim 2 · Misteri', badge: 'HD', hue: 285 },
      { title: 'Dermaga 9', sub: 'Musim 1 · Drama', badge: 'HD', hue: 185 },
    ],
    [
      { title: 'Surat Yang Tak Sampai', sub: '2025 · Drama', badge: 'HD', hue: 350 },
      { title: 'Antara Dua Musim', sub: '2024 · Drama', badge: 'HD', hue: 220 },
      { title: 'Pulang', sub: '2023 · Drama', badge: '4K', hue: 40 },
      { title: 'Rindu Yang Hilang', sub: '2026 · Drama', badge: 'Baharu', hue: 300 },
      { title: 'Simfoni Senyap', sub: '2022 · Drama', badge: 'HD', hue: 160 },
      { title: 'Cinta di Musim Kemarau', sub: '2025 · Drama', badge: 'HD', hue: 25 },
    ],
  ];

  const rows = document.querySelectorAll('[data-row]');

  rows.forEach((rowEl, i) => {
    const items = rowData[i] || [];
    items.forEach(item => {
      rowEl.appendChild(buildPosterCard(item));
    });
  });

  function buildPosterCard({ title, sub, badge, hue }) {
    const card = document.createElement('div');
    card.className = 'poster-card';
    card.tabIndex = 0;

    const art = document.createElement('div');
    art.className = 'poster-art';
    art.style.background =
      `linear-gradient(160deg, hsl(${hue} 45% 20%) 0%, hsl(${hue + 25} 35% 10%) 55%, #0a0a0a 100%)`;

    const badgeEl = document.createElement('span');
    badgeEl.className = 'poster-badge';
    badgeEl.textContent = badge;

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
    meta.innerHTML = `<div class="poster-title">${title}</div><div class="poster-sub">${sub}</div>`;

    card.appendChild(art);
    card.appendChild(meta);
    return card;
  }

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
    const ADMIN_STATE_KEY = 'primeflix_admin_open';

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

    /* ---- Open / close admin panel (kekal terbuka selepas refresh) ---- */
    function openAdminPanel() {
      adminPanel.hidden = false;
      document.body.style.overflow = 'hidden';
      try { localStorage.setItem(ADMIN_STATE_KEY, '1'); } catch (err) { /* storan tak tersedia */ }
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
    function closeAdminPanel() {
      adminPanel.hidden = true;
      document.body.style.overflow = '';
      try { localStorage.removeItem(ADMIN_STATE_KEY); } catch (err) { /* storan tak tersedia */ }
    }

    openAdminBtn.addEventListener('click', openAdminPanel);
    closeAdminBtn.addEventListener('click', closeAdminPanel);

    // Jika panel admin terbuka sebelum page di-refresh, kekalkan ia terbuka.
    let wasAdminOpen = false;
    try { wasAdminOpen = localStorage.getItem(ADMIN_STATE_KEY) === '1'; } catch (err) { /* storan tak tersedia */ }
    if (wasAdminOpen) openAdminPanel();

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
